import { access, copyFile, mkdir, readdir, symlink, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PRESENTATIONS_CACHE_DIR = path.join(homedir(), ".codex", "plugins", "cache", "openai-primary-runtime", "presentations");
const BUNDLED_QA_PYTHON = path.join(homedir(), ".cache", "codex-runtimes", "codex-primary-runtime", "dependencies", "python", "bin", "python3");
const BUNDLED_NODE_MODULES = path.join(homedir(), ".cache", "codex-runtimes", "codex-primary-runtime", "dependencies", "node", "node_modules");
const BUNDLED_SOFFICE = path.join(homedir(), ".cache", "codex-runtimes", "codex-primary-runtime", "dependencies", "bin", "override", "soffice");
const BUILDER_SOURCE = path.join(PROJECT_ROOT, "scripts", "presentation_builder.mjs");

function compareVersion(left, right) {
  const leftParts = String(left).split(".").map((part) => Number.parseInt(part, 10) || 0);
  const rightParts = String(right).split(".").map((part) => Number.parseInt(part, 10) || 0);
  const length = Math.max(leftParts.length, rightParts.length);
  for (let index = 0; index < length; index += 1) {
    const delta = (leftParts[index] || 0) - (rightParts[index] || 0);
    if (delta !== 0) return delta;
  }
  return 0;
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function resolvePresentationSkillDir() {
  const explicit = process.env.PRESENTATIONS_SKILL_DIR;
  if (explicit && await exists(path.join(explicit, "container_tools", "setup_artifact_tool_workspace.mjs"))) {
    return explicit;
  }

  const versions = await readdir(PRESENTATIONS_CACHE_DIR, { withFileTypes: true }).catch(() => []);
  const candidates = versions
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort(compareVersion)
    .reverse();

  for (const version of candidates) {
    const skillDirectory = path.join(PRESENTATIONS_CACHE_DIR, version, "skills", "presentations");
    const setupScript = path.join(skillDirectory, "container_tools", "setup_artifact_tool_workspace.mjs");
    if (await exists(setupScript)) return skillDirectory;
  }

  return null;
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: options.cwd, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr = `${stderr}${chunk}`.slice(-24000)));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(stderr.trim() || `簡報產生器結束，代碼 ${code}`));
    });
  });
}

async function exportPresentationPdf({ skillDirectory, qaPython, pptxPath, pdfPath, tempDirectory }) {
  if (!skillDirectory) {
    const conversionDirectory = path.join(tempDirectory, "pdf");
    await mkdir(conversionDirectory, { recursive: true });
    await mkdir(path.dirname(pdfPath), { recursive: true });
    const soffice = await exists(BUNDLED_SOFFICE) ? BUNDLED_SOFFICE : "soffice";
    await run(soffice, ["--headless", "--convert-to", "pdf", "--outdir", conversionDirectory, pptxPath], { cwd: tempDirectory });
    const convertedPath = path.join(conversionDirectory, `${path.basename(pptxPath, path.extname(pptxPath))}.pdf`);
    if (!await exists(convertedPath)) throw new Error("PPTX 無法匯出 PDF。");
    await copyFile(convertedPath, pdfPath);
    return { outputPath: pdfPath, pages: null, rendered: [] };
  }
  const containerToolsDirectory = path.join(skillDirectory, "container_tools");
  const conversionDirectory = path.join(tempDirectory, "pdf");
  await mkdir(conversionDirectory, { recursive: true });
  await mkdir(path.dirname(pdfPath), { recursive: true });

  const converter = `
import json
import sys
from pathlib import Path
sys.path.insert(0, ${JSON.stringify(containerToolsDirectory)})
from render_slides import calc_dpi_via_pdf, convert_to_pdf, rasterize

conversion_dir = Path(${JSON.stringify(conversionDirectory)})
conversion_dir.mkdir(parents=True, exist_ok=True)
pdf_path = convert_to_pdf(
    ${JSON.stringify(pptxPath)},
    "",
    str(conversion_dir),
    ${JSON.stringify(path.basename(pdfPath, path.extname(pdfPath)))},
)
if not pdf_path:
    raise RuntimeError("PPTX 無法匯出 PDF。")
render_dir = conversion_dir / "qa-render"
dpi = calc_dpi_via_pdf(pdf_path, 1600, 900)
rendered = rasterize(pdf_path, str(render_dir), dpi)
print(json.dumps({"path": pdf_path, "pages": len(rendered), "rendered": rendered}, ensure_ascii=False))
`;

  const result = await run(qaPython, ["-c", converter], { cwd: tempDirectory });
  const lines = result.stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const summary = JSON.parse(lines.at(-1));
  if (!summary.pages) throw new Error("PDF 產生後沒有可渲染的頁面。");
  await copyFile(summary.path, pdfPath);
  return { outputPath: pdfPath, pages: summary.pages, rendered: summary.rendered };
}

export async function generatePresentation({ jobId, outputPath, pdfOutputPath, title, outline, brollPlan, timelinePlan, frames = [], durationSeconds = 0 }) {
  const workspace = path.join(tmpdir(), "codex-presentations", process.env.CODEX_THREAD_ID || "video-story-studio", jobId);
  const tempDirectory = path.join(workspace, "tmp");
  const previewDirectory = path.join(tempDirectory, "preview");
  const layoutDirectory = path.join(tempDirectory, "layout");
  const builderPath = path.join(tempDirectory, "build.mjs");
  const inputPath = path.join(tempDirectory, "deck-input.json");
  const skillDirectory = await resolvePresentationSkillDir();
  const setupScript = skillDirectory ? path.join(skillDirectory, "container_tools", "setup_artifact_tool_workspace.mjs") : null;
  const slidesTestScript = skillDirectory ? path.join(skillDirectory, "container_tools", "slides_test.py") : null;
  const qaPython = process.env.PRESENTATION_QA_PYTHON || (await exists(BUNDLED_QA_PYTHON) ? BUNDLED_QA_PYTHON : "python3");

  await mkdir(tempDirectory, { recursive: true });
  await mkdir(path.dirname(outputPath), { recursive: true });
  if (skillDirectory) {
    await run(process.execPath, [setupScript, "--workspace", tempDirectory]);
  } else {
    const nodeModulesPath = path.join(tempDirectory, "node_modules");
    if (!await exists(path.join(BUNDLED_NODE_MODULES, "@oai", "artifact-tool"))) {
      throw new Error("找不到內建簡報產生工具。");
    }
    if (!await exists(nodeModulesPath)) await symlink(BUNDLED_NODE_MODULES, nodeModulesPath, "dir");
  }
  await copyFile(BUILDER_SOURCE, builderPath);
  await writeFile(inputPath, JSON.stringify({ title, outline, brollPlan, timelinePlan, frames, durationSeconds }, null, 2), "utf8");
  await run(process.execPath, [builderPath, "--input", inputPath, "--output", outputPath, "--preview", previewDirectory, "--layout", layoutDirectory], { cwd: tempDirectory });
  const qa = skillDirectory
    ? await run(qaPython, [slidesTestScript, outputPath, "--width", "1600", "--height", "900"], { cwd: tempDirectory })
    : { stdout: `fallback-preview-pages=${(await readdir(previewDirectory)).filter((name) => /^slide-\d+\.png$/i.test(name)).length}` };
  const pdf = pdfOutputPath
    ? await exportPresentationPdf({ skillDirectory, qaPython, pptxPath: outputPath, pdfPath: pdfOutputPath, tempDirectory })
    : null;

  return { outputPath, pdfOutputPath: pdf?.outputPath || null, pdf, workspace, previewDirectory, layoutDirectory, qa: qa.stdout.trim() };
}

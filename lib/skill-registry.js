import crypto from "node:crypto";
import { access, readFile, stat } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS_ROOT = path.join(homedir(), ".codex", "skills");

const definitions = [
  {
    name: "transcribe-video-locally",
    mode: "direct-executable",
    integration: "網站直接執行技能的 run.sh 與 Whisper 轉錄程式。",
    files: ["SKILL.md", "scripts/run.sh", "scripts/transcribe_video.py"],
    features: ["local-whisper", "shared-timeline", "traditional-chinese"]
  },
  {
    name: "subtitle-video-locally",
    mode: "direct-executable",
    integration: "網站直接執行技能的字幕產生與燒錄程式。",
    files: ["SKILL.md", "scripts/run.sh", "scripts/subtitle_video.py"],
    features: ["one-line-captions", "timing-refinement", "local-burn-in"]
  },
  {
    name: "roughcut-video-locally",
    mode: "shared-project-engine",
    integration: "技能與網站共用專案內的粗剪時間線與輸出引擎。",
    files: ["SKILL.md"],
    projectFiles: ["lib/roughcut.js", "scripts/create_rough_cut.mjs"],
    features: ["word-timeline", "editable-keep-ranges", "smooth-cut-boundaries"]
  },
  {
    name: "generate-local-broll",
    mode: "direct-executable",
    integration: "網站依技能規格建立候選，再直接執行生成、關鍵字檢查、畫面檢查與匯出腳本。",
    files: [
      "SKILL.md",
      "scripts/check_keyword_diversity.py",
      "scripts/review_keyframes.py",
      "scripts/check_visual_diversity.py",
      "scripts/export_smooth_clips.py"
    ],
    projectFiles: ["lib/content.js", "lib/local-visuals.js", "lib/media.js", "scripts/generate_local_broll.py"],
    features: ["sentence-fit", "keyword-diversity", "literal-scene", "visual-diversity", "smooth-hq-export"]
  },
  {
    name: "speech-summary-polisher",
    mode: "spec-synchronized",
    integration: "網站每次產生 AI 校稿前重新讀取技能規格，再使用本機規則執行。",
    files: ["SKILL.md", "references/quality-examples.md"],
    projectFiles: ["server.js", "lib/content.js"],
    features: ["traceable-edits", "revision", "conservative-polish", "no-accidental-deletion"]
  },
  {
    name: "extract-verbatim-highlights",
    mode: "spec-synchronized",
    integration: "AI 精華摘要稿依技能規格只從原始時間線挑選原話片段；只刪不改，並保留可剪輯時間碼。",
    files: ["SKILL.md"],
    projectFiles: ["server.js", "lib/content.js"],
    features: ["extractive-summary", "verbatim-source-order", "no-paraphrase", "timeline-keep-ranges"]
  },
  {
    name: "video-context-timeline-ppt",
    mode: "spec-synchronized",
    integration: "網站讀取目前內容型簡報規格，並用最新版 presentations runtime 產生及驗證 PPTX/PDF。",
    files: ["SKILL.md", "references/content-notes-deck-blueprint.md"],
    projectFiles: ["lib/presentation.js", "scripts/presentation_builder.mjs"],
    features: ["audience-facing", "content-first", "no-production-metadata", "standalone-explanation", "render-qa"]
  },
  {
    name: "video-title-summarizer",
    mode: "spec-synchronized",
    integration: "未命名時讀取目前標題技能規格，使用共用逐字稿與完整內容大綱命名。",
    files: ["SKILL.md"],
    projectFiles: ["lib/content.js"],
    features: ["whole-transcript", "traditional-chinese", "accurate-title", "non-clickbait"]
  }
];

async function inspectFile(filePath) {
  try {
    await access(filePath);
    const details = await stat(filePath);
    const contents = details.size <= 2_000_000 ? await readFile(filePath) : Buffer.from(`${details.size}:${details.mtimeMs}`);
    return {
      path: filePath,
      updatedAt: details.mtime.toISOString(),
      mtimeMs: details.mtimeMs,
      hash: crypto.createHash("sha256").update(contents).digest("hex")
    };
  } catch {
    return { path: filePath, missing: true, updatedAt: null, mtimeMs: 0, hash: "missing" };
  }
}

async function inspectDefinition(definition) {
  const skillRoot = path.join(SKILLS_ROOT, definition.name);
  const skillFiles = definition.files.map((relativePath) => path.join(skillRoot, relativePath));
  const projectFiles = (definition.projectFiles || []).map((relativePath) => path.join(PROJECT_ROOT, relativePath));
  const inspected = [];
  for (const filePath of [...skillFiles, ...projectFiles]) inspected.push(await inspectFile(filePath));
  const missingFiles = inspected.filter((item) => item.missing).map((item) => item.path);
  const skillInspected = inspected.slice(0, skillFiles.length);
  const implementationInspected = inspected.slice(skillFiles.length);
  const latest = (items) => items.reduce((maximum, item) => Math.max(maximum, item.mtimeMs || 0), 0);
  const fingerprint = crypto.createHash("sha256")
    .update(inspected.map((item) => `${item.path}:${item.hash}`).join("\n"))
    .digest("hex")
    .slice(0, 16);

  return {
    name: definition.name,
    ready: missingFiles.length === 0,
    mode: definition.mode,
    source: "current-local-snapshot",
    path: path.join(skillRoot, "SKILL.md"),
    skillUpdatedAt: latest(skillInspected) ? new Date(latest(skillInspected)).toISOString() : null,
    implementationUpdatedAt: latest(implementationInspected) ? new Date(latest(implementationInspected)).toISOString() : null,
    updatedAt: latest(inspected) ? new Date(latest(inspected)).toISOString() : null,
    fingerprint,
    missingFiles,
    features: definition.features,
    integration: definition.integration
  };
}

export async function inspectWorkflowSkills() {
  const items = {};
  for (const definition of definitions) items[definition.name] = await inspectDefinition(definition);
  return {
    ready: Object.values(items).every((item) => item.ready),
    checkedAt: new Date().toISOString(),
    source: "current-local-snapshot",
    items
  };
}

export function workflowSkillSnapshot(report, names = []) {
  const selectedNames = names.length ? names : Object.keys(report?.items || {});
  return Object.fromEntries(selectedNames
    .filter((name) => report?.items?.[name])
    .map((name) => {
      const item = report.items[name];
      return [name, {
        ready: item.ready,
        mode: item.mode,
        updatedAt: item.updatedAt,
        fingerprint: item.fingerprint,
        source: item.source,
        features: item.features
      }];
    }));
}

export function assertWorkflowSkillsReady(report, names) {
  const unavailable = names
    .map((name) => report?.items?.[name])
    .filter((item) => !item?.ready);
  if (!unavailable.length) return;
  const details = unavailable.map((item) => `${item?.name || "未知技能"}：${item?.missingFiles?.join("、") || "找不到技能"}`).join("；");
  const error = new Error(`必要技能尚未就緒（${details}）。`);
  error.statusCode = 503;
  throw error;
}

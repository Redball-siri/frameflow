import { constants as fsConstants } from "node:fs";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PYTHON_PATH = path.join(PROJECT_ROOT, ".visual-venv", "bin", "python");
const KEYFRAME_SCRIPT = path.join(PROJECT_ROOT, "scripts", "generate_local_broll.py");
const KEYWORD_DIVERSITY_SCRIPT = process.env.BROLL_KEYWORD_DIVERSITY_SCRIPT
  || path.join(process.env.HOME || "", ".codex", "skills", "generate-local-broll", "scripts", "check_keyword_diversity.py");
const MODEL_ROOT = path.join(PROJECT_ROOT, "models", "local-broll");
const REQUIRED_MODEL_FILES = [
  path.join(MODEL_ROOT, "epic-realism", "model_index.json"),
  path.join(MODEL_ROOT, "epic-realism", "unet", "diffusion_pytorch_model.safetensors"),
  path.join(MODEL_ROOT, "lcm-lora-sdv1-5", "pytorch_lora_weights.safetensors")
];

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: PROJECT_ROOT,
      env: { ...process.env, PYTHONUNBUFFERED: "1", TOKENIZERS_PARALLELISM: "false" },
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout = `${stdout}${chunk}`.slice(-24000)));
    child.stderr.on("data", (chunk) => (stderr = `${stderr}${chunk}`.slice(-24000)));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`本機 AI 畫面生成失敗。${stderr.trim() ? ` ${stderr.trim()}` : ""}`));
    });
  });
}

export async function getLocalVisualStatus() {
  const checks = [
    PYTHON_PATH,
    KEYFRAME_SCRIPT,
    KEYWORD_DIVERSITY_SCRIPT,
    ...REQUIRED_MODEL_FILES
  ];
  try {
    await Promise.all(checks.map((filePath) => access(filePath, fsConstants.R_OK)));
    return {
      ready: true,
      model: "Frameflow 品質優先 B-roll 模型",
      device: "Apple Silicon MPS / GPU / CPU",
      offline: true,
      mode: "stable-diffusion-lcm-keyframes",
      quality: "quality-first",
      modelRoot: MODEL_ROOT
    };
  } catch {
    return {
      ready: false,
      model: "Frameflow 品質優先 B-roll 模型",
      device: "Apple Silicon MPS / GPU / CPU",
      offline: true,
      mode: "stable-diffusion-lcm-keyframes",
      quality: "quality-first",
      setupCommand: "npm run setup:visuals"
    };
  }
}

function candidateScore(item) {
  const score = Number(item.score);
  if (Number.isFinite(score)) return score;
  return item.localGenerationPriority ? 3.5 : 2.5;
}

function evenDimension(value) {
  return Math.max(2, Math.floor(Number(value) / 2) * 2);
}

function normalizedBrollDimensions(targetDimensions = {}) {
  const width = Number(targetDimensions.width);
  const height = Number(targetDimensions.height);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return {
      generationWidth: 768,
      generationHeight: 432,
      outputWidth: 1920,
      outputHeight: 1080,
      aspectLabel: "landscape"
    };
  }
  const isVertical = height > width;
  const isSquare = Math.abs(width - height) <= Math.max(width, height) * 0.04;
  if (isSquare) {
    return {
      generationWidth: 768,
      generationHeight: 768,
      outputWidth: 1080,
      outputHeight: 1080,
      aspectLabel: "square"
    };
  }
  if (isVertical) {
    return {
      generationWidth: 432,
      generationHeight: 768,
      outputWidth: 1080,
      outputHeight: 1920,
      aspectLabel: "vertical"
    };
  }
  return {
    generationWidth: 768,
    generationHeight: 432,
    outputWidth: 1920,
    outputHeight: 1080,
    aspectLabel: "landscape"
  };
}

export function brollDimensionsForMedia(targetDimensions = {}) {
  const normalized = normalizedBrollDimensions(targetDimensions);
  return {
    ...normalized,
    generationWidth: evenDimension(normalized.generationWidth),
    generationHeight: evenDimension(normalized.generationHeight),
    outputWidth: evenDimension(normalized.outputWidth),
    outputHeight: evenDimension(normalized.outputHeight)
  };
}

export async function generateLocalBrollMotion(plan, outputDirectory, { maxClips = 0, targetDimensions = {} } = {}) {
  const status = await getLocalVisualStatus();
  if (!status.ready) throw new Error(`本機 AI 視覺尚未設定，請先執行 ${status.setupCommand}。`);
  await mkdir(outputDirectory, { recursive: true });
  const brollDimensions = brollDimensionsForMedia(targetDimensions);

  const scored = [...plan]
    .filter((item) => candidateScore(item) >= 3)
    .sort((left, right) => candidateScore(right) - candidateScore(left) || Number(right.localGenerationPriority) - Number(left.localGenerationPriority) || left.id - right.id);
  const fallback = scored.length ? scored : [...plan].sort((left, right) => candidateScore(right) - candidateScore(left) || left.id - right.id).slice(0, 1);
  const limit = Number(maxClips) > 0 ? Math.max(1, Math.min(12, Number(maxClips))) : fallback.length;
  const inputPath = path.join(outputDirectory, "local-prompts.json");
  let previousById = new Map();
  try {
    const previousItems = JSON.parse(await readFile(inputPath, "utf8"));
    if (Array.isArray(previousItems)) {
      previousById = new Map(previousItems.map((item) => [Number(item.id), item]));
    }
  } catch {
    previousById = new Map();
  }

  const selected = fallback
    .slice(0, limit)
    .sort((left, right) => left.id - right.id)
    .map((item) => {
      const selectedItem = {
        id: item.id,
        title: item.title,
        prompt: item.localPrompt,
        negative_prompt: item.negativePrompt,
        sourcePhrase: item.sourcePhrase || "",
        semanticCore: item.semanticCore || "",
        keywordAnchors: item.keywordAnchors || [],
        semanticCluster: item.semanticCluster || "",
        noveltyReason: item.noveltyReason || "",
        repetitionCheck: item.repetitionCheck || "",
        score: item.score || candidateScore(item),
        scoreDetails: item.scoreDetails || null,
        whyBroll: item.whyBroll || "",
        literalSceneTreatment: item.literalSceneTreatment || "",
        propOrigin: item.propOrigin || "",
        viewerRead: item.viewerRead || "",
        qualityGate: item.qualityGate || null,
        motion: item.motion || "push-in",
        motionReason: item.motionReason || "用穩定推近補強段落重點",
        diversity: item.diversity || null,
        visualConcept: item.visualConcept,
        searchTerms: item.searchTerms || [],
        shotChecklist: item.shotChecklist || null
      };
      const previous = previousById.get(Number(item.id));
      selectedItem.reuse_existing = Boolean(previous
        && previous.prompt === selectedItem.prompt
        && previous.negative_prompt === selectedItem.negative_prompt
        && previous.sourcePhrase === selectedItem.sourcePhrase
        && previous.semanticCore === selectedItem.semanticCore
        && previous.visualConcept === selectedItem.visualConcept);
      return selectedItem;
    });
  await writeFile(inputPath, `${JSON.stringify(selected, null, 2)}\n`, "utf8");
  const reviewDirectory = path.join(outputDirectory, "review");
  const keywordReportPath = path.join(reviewDirectory, "keyword-diversity-report.json");
  await mkdir(reviewDirectory, { recursive: true });
  await run(PYTHON_PATH, [
    KEYWORD_DIVERSITY_SCRIPT,
    "--manifest", inputPath,
    "--output", keywordReportPath
  ]);
  const keywordReport = JSON.parse(await readFile(keywordReportPath, "utf8"));
  if (keywordReport.missingFields?.length) {
    const missing = keywordReport.missingFields
      .map((item) => `#${item.id} ${item.missing.join("、")}`)
      .join("；");
    throw new Error(`B-roll 候選缺少新版關鍵字多樣性欄位：${missing}`);
  }
  const warningIds = new Set([
    ...(keywordReport.repeatedKeywords || []).flatMap((item) => item.ids || []),
    ...(keywordReport.repeatedClusters || []).flatMap((item) => item.ids || []),
    ...(keywordReport.overlapWarnings || []).flatMap((item) => [item.leftId, item.rightId])
  ].map(Number));
  const unexplainedWarnings = selected.filter((item) => warningIds.has(Number(item.id)) && !item.repetitionCheck?.trim());
  if (unexplainedWarnings.length) {
    throw new Error(`B-roll 候選 #${unexplainedWarnings.map((item) => item.id).join("、#")} 有重複警告，但沒有說明不同敘事功能。`);
  }
  const stdout = await run(PYTHON_PATH, [
    KEYFRAME_SCRIPT,
    "--input", inputPath,
    "--output-dir", outputDirectory,
    "--model-root", MODEL_ROOT,
    "--steps", "8",
    "--width", String(brollDimensions.generationWidth),
    "--height", String(brollDimensions.generationHeight),
    "--output-width", String(brollDimensions.outputWidth),
    "--output-height", String(brollDimensions.outputHeight)
  ]);
  const lines = stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const summary = JSON.parse(lines.at(-1));
  if (!summary.generated?.length && !summary.skipped?.length) {
    throw new Error("本機 AI 沒有回報 B-roll 生成結果。");
  }

  const selectedById = new Map(selected.map((item) => [item.id, item]));
  const generated = (summary.generated || []).map((item) => ({
    ...item,
    ...selectedById.get(item.id),
    targetDimensions: {
      width: brollDimensions.outputWidth,
      height: brollDimensions.outputHeight,
      aspect: brollDimensions.aspectLabel
    },
    visualQualityGate: item.qualityGate || null,
    keywordDiversity: {
      reportPath: keywordReportPath,
      status: keywordReport.status,
      warning: warningIds.has(Number(item.id))
    }
  }));
  generated.skipped = (summary.skipped || []).map((item) => ({
    ...item,
    ...selectedById.get(item.id)
  }));
  return generated;
}

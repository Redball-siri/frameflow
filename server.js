import "dotenv/config";
import { execFile } from "node:child_process";
import crypto from "node:crypto";
import { copyFile, link, mkdir, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import express from "express";
import ffmpegPath from "ffmpeg-static";
import multer from "multer";
import { alignBrollPlanToTimeline, assessTranscriptQuality, brollPlanToCsv, buildBrollPlan, buildStoryOutline, buildTitleStrategy, DEMO_TRANSCRIPT, formatTimelineSegmentsAsTranscript, formatTranscriptForSingleLineCaptions, splitSentences } from "./lib/content.js";
import { generateLocalBrollMotion, getLocalVisualStatus } from "./lib/local-visuals.js";
import { composeFinalVideo, createClipMontage, createMotionBrollClips, createStoryboardPreview, extractStoryboardFrames, mediaMatchedBrollDimensions, probeMedia } from "./lib/media.js";
import { generatePresentation } from "./lib/presentation.js";
import { buildPortableNleProject } from "./lib/nle.js";
import { buildKeepRanges, createRoughCutPlan, createRoughCutVideo, mergeRemovalRanges, roughCutPlanToText } from "./lib/roughcut.js";
import { assertWorkflowSkillsReady, inspectWorkflowSkills, workflowSkillSnapshot } from "./lib/skill-registry.js";
import { burnEditedSubtitles, createSubtitleDraft, normalizeCaptions, parseSrt, subtitleDraftMatchesTranscript } from "./lib/subtitles.js";
import { getLocalWhisperStatus, transcribeMedia, validateMediaFilename } from "./lib/transcription.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDirectory = path.join(tmpdir(), "video-story-studio-uploads");
const outputDirectory = path.join(__dirname, "outputs", "jobs");
const PIPELINE_VERSION = 13;
const port = Number(process.env.PORT) || 3100;
const execFileAsync = promisify(execFile);
const roughCutPythonPath = path.join(homedir(), ".cache", "transcribe-video-locally", "venv", "bin", "python");
const roughCutModelDirectory = path.join(homedir(), ".cache", "transcribe-video-locally", "models");
const healthCacheTtlMs = 60_000;
let healthCache = { expiresAt: 0, payload: null };
const editingPackageBuilds = new Map();
const projectCleanupTimers = new Map();
const projectCleanupGraceMs = Math.max(30_000, Number(process.env.PROJECT_CLEANUP_GRACE_MS) || 120_000);
const projectCleanupMarkerFilename = ".cleanup-pending.json";
const speechPolisherScriptPath = path.join(homedir(), ".codex", "skills", "speech-summary-polisher", "scripts", "polish_transcript.py");

await mkdir(uploadDirectory, { recursive: true });
await mkdir(outputDirectory, { recursive: true });
await cleanupStaleRoughcutTempDirectories(outputDirectory);
await restoreScheduledProjectCleanups();
let speechSummaryPolisherSkill = await loadSpeechSummaryPolisherSkill();

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (_request, file, callback) => {
    const decoded = normalizeUploadFilename(file.originalname);
    callback(null, `${crypto.randomUUID()}${path.extname(decoded).toLowerCase()}`);
  }
});
const upload = multer({ storage, limits: { files: 1 } });

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public"), {
  etag: false,
  lastModified: false,
  setHeaders(response) {
    response.setHeader("Cache-Control", "no-store");
  }
}));
app.use("/outputs", express.static(path.join(__dirname, "outputs"), {
  fallthrough: false,
  setHeaders(response) {
    response.setHeader("Cache-Control", "no-store");
  }
}));

const downloadDefinitions = [
  { key: "subtitledVideo", label: "精修字幕影片", field: "subtitledVideoUrl" },
  { key: "subtitleSrt", label: "精修 SRT", field: "subtitleSrtUrl" },
  { key: "subtitleAss", label: "精修 ASS", field: "subtitleAssUrl" },
  { key: "pptx", label: "PowerPoint 簡報", field: "pptxUrl" },
  { key: "pptPdf", label: "簡報 PDF", field: "pptPdfUrl" },
  { key: "transcript", label: "繁中逐字稿", field: "transcriptUrl" },
  { key: "originalTranscript", label: "原始逐字稿", field: "originalTranscriptUrl" },
  { key: "editedTranscript", label: "已確認原稿", field: "editedTranscriptUrl" },
  { key: "proofreadTranscript", label: "AI 校稿版", field: "proofreadTranscriptUrl" },
  { key: "highlightTranscript", label: "精華摘要", field: "highlightTranscriptUrl" },
  { key: "brollCsv", label: "B-roll 規劃表 CSV", field: "brollCsvUrl" },
  { key: "brollJson", label: "B-roll 規劃表 JSON", field: "brollJsonUrl" },
  { key: "roughCutVideo", label: "AI 粗剪影片", field: "roughCutVideoUrl" },
  { key: "roughCutPlan", label: "AI 粗剪計畫", field: "roughCutPlanUrl" },
  { key: "finalVideo", label: "完整成片", field: "finalVideoUrl" },
  { key: "editingPackage", label: "剪輯包 ZIP", dynamic: true }
];

const downloadFilenameLabels = {
  subtitledVideo: "",
  finalVideo: "",
  subtitleSrt: "精修字幕",
  subtitleAss: "精修字幕",
  pptx: "簡報",
  pptPdf: "簡報",
  transcript: "逐字稿",
  originalTranscript: "原始逐字稿",
  editedTranscript: "已確認原稿",
  proofreadTranscript: "AI校稿版",
  highlightTranscript: "精華摘要",
  brollCsv: "B-roll規劃",
  brollJson: "B-roll規劃",
  roughCutVideo: "AI粗剪",
  roughCutPlan: "AI粗剪計畫",
  editingPackage: "剪輯包"
};

const supportedLanguageCodes = new Set([
  "auto", "zh", "yue", "en", "ja", "ko", "es", "fr", "de", "it", "pt", "ru",
  "ar", "hi", "vi", "th", "id", "ms", "tr", "nl", "pl", "uk"
]);

function normalizeUploadFilename(filename) {
  const decoded = Buffer.from(filename, "latin1").toString("utf8");
  return decoded.includes("�") ? filename : decoded;
}

function safeTitle(value, fallback = "影片內容簡報") {
  const normalized = String(value || "").replace(/[\\/:*?"<>|]/g, " ").replace(/\s+/g, " ").trim();
  return normalized.slice(0, 60) || fallback;
}

function fieldValue(value) {
  return Array.isArray(value) ? value.at(-1) : value;
}

function enabledField(value, fallback = true) {
  const normalized = fieldValue(value);
  if (normalized === undefined) return fallback;
  return ![false, "false", "off", "0", "no", ""].includes(normalized);
}

function normalizedMultilineField(value) {
  return String(fieldValue(value) || "")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

function normalizedProperNouns(value) {
  return String(fieldValue(value) || "")
    .replace(/[，、;；]/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((term) => term.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 40)
    .join("、");
}

function combineContextFields(source = {}) {
  const topicContext = normalizedMultilineField(source.topicContext);
  const properNouns = normalizedProperNouns(source.properNouns);
  const legacyContext = normalizedMultilineField(source.context);
  const sections = [];
  if (topicContext) sections.push(`主題補充：${topicContext}`);
  if (properNouns) sections.push(`專有名詞：${properNouns}`);
  if (legacyContext) sections.push(legacyContext);
  return sections.join("\n").slice(0, 800);
}

function parseOptions(source = {}) {
  const slideCount = normalizeSlideCountPreference(source.slideCount);
  const languageValue = fieldValue(source.language);
  const brollStyleValue = fieldValue(source.brollStyle);
  const language = supportedLanguageCodes.has(languageValue) ? languageValue : "auto";
  const brollStyle = new Set(["cinematic", "documentary", "energetic", "minimal"]).has(brollStyleValue)
    ? brollStyleValue
    : "cinematic";
  const outputTranscript = enabledField(source.outputTranscript, true);
  let outputPpt = enabledField(source.outputPpt, true);
  const outputBrollPlan = enabledField(source.outputBrollPlan, true);
  const burnSubtitles = enabledField(source.burnSubtitles, false);
  const roughCut = enabledField(source.roughCut, true);
  let aiBroll = enabledField(source.aiBroll, true);
  let finalVideo = enabledField(source.finalVideo, true);
  let insertPpt = enabledField(source.insertPpt, outputPpt && finalVideo);
  if (insertPpt) {
    outputPpt = true;
    finalVideo = true;
  }
  if (!finalVideo) insertPpt = false;
  const requestedBrollCount = Number(source.aiBrollCount);
  const aiBrollCount = Number.isFinite(requestedBrollCount)
    ? Math.max(0, Math.min(12, requestedBrollCount))
    : 0;
	return {
	  slideCount,
	  slideCountMode: slideCount > 0 ? "manual" : "auto",
	  language,
    brollStyle,
    outputTranscript,
    outputPpt,
    outputBrollPlan,
    burnSubtitles,
    roughCut,
    aiBroll,
    finalVideo,
    insertPpt,
    aiBrollCount,
	  context: combineContextFields(source)
	};
}

function normalizeSlideCountPreference(value) {
  const requested = Number(fieldValue(value));
  if (!Number.isFinite(requested) || requested <= 0) return 0;
  return Math.max(6, Math.min(12, requested));
}

function estimateAutomaticSlideCount(transcript, { durationSeconds = 0 } = {}) {
  const cleanText = normalizeTranscriptText(transcript);
  const sentenceCount = splitSentences(cleanText).length || splitTranscriptLines(cleanText).length || 1;
  const characterCount = cleanText.length;
  const duration = Number(durationSeconds) || 0;
  const contentBlocksBySentences = sentenceCount <= 6
    ? 2
    : sentenceCount <= 12 ? 3 : sentenceCount <= 22 ? 4 : sentenceCount <= 34 ? 5 : sentenceCount <= 48 ? 6 : 7;
  const contentBlocksByLength = characterCount <= 450
    ? 2
    : characterCount <= 900 ? 3 : characterCount <= 1500 ? 4 : characterCount <= 2300 ? 5 : characterCount <= 3400 ? 6 : 7;
  const contentBlocksByDuration = !duration
    ? contentBlocksBySentences
    : duration <= 90 ? 2 : duration <= 240 ? 3 : duration <= 480 ? 4 : duration <= 900 ? 5 : duration <= 1500 ? 6 : 7;
  const contentBlocks = Math.max(2, Math.min(8, Math.round((contentBlocksBySentences + contentBlocksByLength + contentBlocksByDuration) / 3)));
  return Math.max(6, Math.min(12, contentBlocks + 4));
}

function resolvePptSlideCount(options = {}, transcript = "", { durationSeconds = 0 } = {}) {
  const requested = Number(options.slideCount);
  const shouldAuto = options.slideCountMode === "auto" || !Number.isFinite(requested) || requested <= 0;
  const manualSlideCount = !shouldAuto && Number.isFinite(requested) && requested > 0
    ? Math.max(6, Math.min(12, requested))
    : 0;
  const slideCount = manualSlideCount || estimateAutomaticSlideCount(transcript, { durationSeconds });
  return {
    ...options,
    slideCount,
    slideCountMode: manualSlideCount ? "manual" : "auto"
  };
}

async function loadSpeechSummaryPolisherSkill() {
  const skillPath = process.env.SPEECH_SUMMARY_POLISHER_SKILL_PATH
    || path.join(homedir(), ".codex", "skills", "speech-summary-polisher", "SKILL.md");
  try {
    const source = await readFile(skillPath, "utf8");
    const skillDirectory = path.dirname(skillPath);
    const entries = await readdir(skillDirectory, { withFileTypes: true }).catch(() => []);
    const hasExecutable = entries.some((entry) => (
      entry.isFile() && /\.(mjs|js|py|sh)$/i.test(entry.name)
    )) || entries.some((entry) => entry.isDirectory() && entry.name === "scripts");
    return {
      ready: /name:\s*speech-summary-polisher/.test(source),
      name: "speech-summary-polisher",
      path: skillPath,
      mode: hasExecutable ? "executable" : "skill-spec",
      executable: hasExecutable,
      supports: ["修正版"],
      revisionPolicy: /conservatively cleaned|conservative transcript revisions|traceable edits/.test(source)
        ? "conservative-traceable"
        : "local-rules",
      summaryPolicy: /beginning, middle, and ending|有頭有尾|complete, substantive/.test(source)
        ? "beginning-middle-ending"
        : "local-rules",
      specFeatures: [
        /Edit-scope pass/.test(source) ? "edit-scope-pass" : "",
        /traceable edits/.test(source) ? "traceable-edits" : "",
        /修正版 Modification Scope/.test(source) ? "revision-modification-scope" : "",
        /No accidental deletion/.test(source) ? "no-accidental-deletion" : "",
        /Substance check/.test(source) ? "summary-substance-check" : ""
      ].filter(Boolean),
      issue: hasExecutable ? "" : "目前只有 SKILL.md 規格，沒有 CLI/API/可執行腳本；網站以技能規格規則執行。"
    };
  } catch (error) {
    return {
      ready: false,
      name: "speech-summary-polisher",
      path: skillPath,
      mode: "missing",
      executable: false,
      supports: [],
      issue: `找不到或讀不到 speech-summary-polisher 技能：${error.message}`
    };
  }
}

async function refreshSpeechSummaryPolisherSkill() {
  speechSummaryPolisherSkill = await loadSpeechSummaryPolisherSkill();
  return speechSummaryPolisherSkill;
}

async function executeSpeechSummaryPolisher({ text, mode, workDirectory }) {
  await refreshSpeechSummaryPolisherSkill();
  if (!speechSummaryPolisherSkill.executable) {
    const error = new Error("speech-summary-polisher 缺少可執行程式，已停止產生 AI 稿件，避免用內部規則假裝技能結果。");
    error.statusCode = 503;
    throw error;
  }
  const runId = crypto.randomUUID();
  const inputPath = path.join(workDirectory, `.speech-polisher-${runId}-input.json`);
  const outputPath = path.join(workDirectory, `.speech-polisher-${runId}-output.json`);
  await mkdir(workDirectory, { recursive: true });
  try {
    await writeFile(inputPath, `${JSON.stringify({ text }, null, 2)}\n`, "utf8");
    await execFileAsync("python3", [
      speechPolisherScriptPath,
      "--input", inputPath,
      "--output", outputPath,
      "--mode", mode
    ], { timeout: 0 });
    const result = JSON.parse(await readFile(outputPath, "utf8"));
    const outputText = normalizeTranscriptText(result.text);
    if (!outputText) throw new Error("speech-summary-polisher 沒有回傳可用文字。");
    return { ...result, text: outputText };
  } finally {
    await rm(inputPath, { force: true });
    await rm(outputPath, { force: true });
  }
}

function skillNamesForOptions(options = {}) {
  return [
    options.roughCut ? "roughcut-video-locally" : "",
    options.burnSubtitles ? "subtitle-video-locally" : "",
    options.outputPpt || options.insertPpt ? "video-context-timeline-ppt" : "",
    options.outputBrollPlan || options.aiBroll ? "generate-local-broll" : ""
  ].filter(Boolean);
}

function speechPolisherSource(mode, sourceText, outputText) {
  const normalizedSource = normalizeTranscriptText(sourceText);
  const normalizedOutput = normalizeTranscriptText(outputText);
  return {
    engine: "speech-summary-polisher",
    mode,
    source: speechSummaryPolisherSkill.ready ? speechSummaryPolisherSkill.mode : "fallback-local-rules",
    skillReady: speechSummaryPolisherSkill.ready,
    executable: speechSummaryPolisherSkill.executable,
    skillPath: speechSummaryPolisherSkill.ready ? speechSummaryPolisherSkill.path : "",
    revisionPolicy: speechSummaryPolisherSkill.revisionPolicy || "local-rules",
    summaryPolicy: speechSummaryPolisherSkill.summaryPolicy || "local-rules",
    specFeatures: speechSummaryPolisherSkill.specFeatures || [],
    qualityGates: mode === "修正版"
      ? ["coverage", "traceability", "conservative-distance", "no-accidental-deletion"]
      : ["coverage", "mainline", "beginning-middle-ending", "substance"],
    issue: speechSummaryPolisherSkill.issue || "",
    sourceCharacters: normalizedSource.length,
    outputCharacters: normalizedOutput.length,
    compressionRatio: normalizedSource.length
      ? Number((normalizedOutput.length / normalizedSource.length).toFixed(3))
      : null
  };
}

function extractVerbatimHighlightSource(workflowSkills, sourceText, outputText, { selectedSegmentCount = 0 } = {}) {
  const normalizedSource = normalizeTranscriptText(sourceText);
  const normalizedOutput = normalizeTranscriptText(outputText);
  const skill = workflowSkills?.items?.["extract-verbatim-highlights"] || {};
  return {
    engine: "extract-verbatim-highlights",
    mode: "精華版",
    source: skill.source || "current-local-snapshot",
    skillReady: skill.ready === true,
    executable: false,
    skillPath: skill.path || path.join(homedir(), ".codex", "skills", "extract-verbatim-highlights", "SKILL.md"),
    extractionPolicy: "select-delete-only",
    orderingPolicy: "source-order",
    qualityGates: ["verbatim-source-match", "source-order", "no-paraphrase", "timeline-keep-ranges"],
    specFeatures: skill.features || ["extractive-summary", "verbatim-source-order", "no-paraphrase", "timeline-keep-ranges"],
    issue: skill.ready === true ? "" : "extract-verbatim-highlights 技能尚未就緒。",
    sourceCharacters: normalizedSource.length,
    outputCharacters: normalizedOutput.length,
    selectedSegmentCount,
    compressionRatio: normalizedSource.length
      ? Number((normalizedOutput.length / normalizedSource.length).toFixed(3))
      : null
  };
}

function processingPhases(timing = {}) {
  if (Array.isArray(timing?.phases) && timing.phases.length) {
    return timing.phases.filter((phase) => Number(phase?.elapsedSeconds) >= 0);
  }
  return Number(timing?.elapsedSeconds) >= 0 && timing?.startedAt
    ? [{
        startedAt: timing.startedAt,
        completedAt: timing.completedAt,
        elapsedSeconds: Number(timing.elapsedSeconds) || 0,
        source: timing.source || "server",
        phase: timing.phase || "transcription"
      }]
    : [];
}

function appendProcessingPhase(previousTiming, { startedAtMs, phase }) {
  const completedAtMs = Date.now();
  const current = {
    startedAt: new Date(startedAtMs).toISOString(),
    completedAt: new Date(completedAtMs).toISOString(),
    elapsedSeconds: Number(((completedAtMs - startedAtMs) / 1000).toFixed(1)),
    source: "server",
    phase
  };
  const phases = [...processingPhases(previousTiming), current];
  return {
    ...current,
    activeElapsedSeconds: Number(phases.reduce((total, item) => total + (Number(item.elapsedSeconds) || 0), 0).toFixed(1)),
    phases
  };
}

function selectedFeatureLabels(options) {
  return [
    options.outputTranscript ? "字幕式逐字稿" : "",
    options.outputPpt ? "PowerPoint / PDF" : "",
    options.outputBrollPlan ? "B-roll 規劃表" : "",
    options.burnSubtitles ? "精修字幕燒錄" : "",
    options.roughCut ? "AI 粗剪草稿" : "",
    options.aiBroll ? "AI 品質 B-roll" : "",
    options.finalVideo ? "完整成片" : "",
    options.insertPpt ? "PPT 剪入成片" : ""
  ].filter(Boolean);
}

function isVerticalMediaProfile(profile = {}) {
  const width = Number(profile.width);
  const height = Number(profile.height);
  return Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > width;
}

function disablePptInsertionForVerticalMedia(options = {}, profile = {}) {
  if (!isVerticalMediaProfile(profile) || !options.insertPpt) {
    return { options, notice: null };
  }
  return {
    options: {
      ...options,
      insertPpt: false,
      outputPpt: Boolean(options.outputPpt)
    },
    notice: {
      type: "vertical-ppt-insert-skipped",
      message: "偵測到直式影片，已保留 PPT/PDF 下載，但不把簡報剪進成片。",
      reason: "直式影片剪入橫式簡報會破壞畫面比例。",
      stage: "feature-selection"
    }
  };
}

function mergeGenerationNotices(...groups) {
  return groups
    .flat()
    .filter(Boolean);
}

function storedProcessingOptions(options) {
  return {
    slideCount: options.slideCount,
    slideCountMode: options.slideCountMode || "manual",
    language: options.language,
    brollStyle: options.brollStyle,
    outputTranscript: options.outputTranscript,
    outputPpt: options.outputPpt,
    outputBrollPlan: options.outputBrollPlan,
    burnSubtitles: options.burnSubtitles,
    roughCut: options.roughCut,
    aiBroll: options.aiBroll,
    finalVideo: options.finalVideo,
    insertPpt: options.insertPpt,
    aiBrollCount: options.aiBrollCount,
    context: options.context
  };
}

function processingOptionsFromProject(project = {}) {
  const stored = project.processingOptions || {};
  const selected = project.selectedFeatures || {};
  const storedSlideCount = Number(stored.slideCount);
  const projectSlideCount = Number(project.slideCount);
  const slideCount = Number.isFinite(storedSlideCount)
    ? storedSlideCount > 0 ? Math.max(6, Math.min(12, storedSlideCount)) : 0
    : projectSlideCount > 0 ? Math.max(6, Math.min(12, projectSlideCount)) : 0;
  const bool = (key, fallback) => (
    typeof stored[key] === "boolean" ? stored[key]
      : typeof selected[key] === "boolean" ? selected[key]
      : fallback
	);
	return {
	  slideCount,
	  slideCountMode: stored.slideCountMode === "auto" || !slideCount ? "auto" : "manual",
	  language: supportedLanguageCodes.has(stored.language) ? stored.language : "auto",
    brollStyle: new Set(["cinematic", "documentary", "energetic", "minimal"]).has(stored.brollStyle) ? stored.brollStyle : "cinematic",
    outputTranscript: bool("outputTranscript", true),
    outputPpt: bool("outputPpt", true),
    outputBrollPlan: bool("outputBrollPlan", true),
    burnSubtitles: bool("burnSubtitles", false),
    roughCut: bool("roughCut", true),
    aiBroll: bool("aiBroll", true),
    finalVideo: bool("finalVideo", true),
    insertPpt: bool("insertPpt", Boolean(selected.insertPpt)),
    aiBrollCount: Math.max(0, Math.min(12, Number(stored.aiBrollCount) || 0)),
    context: String(stored.context || "")
  };
}

function shouldDeferHighCostUntilRoughCut(options) {
  return Boolean(options.roughCut && (
    options.outputPpt
      || options.outputBrollPlan
      || options.aiBroll
      || options.finalVideo
      || options.burnSubtitles
  ));
}

function publicErrorMessage(error, isUserError) {
  const message = String(error?.message || "未知錯誤");
  if (isUserError) return message;
  if (/No space left on device|ENOSPC|空間不足/i.test(message)) {
    return "處理失敗：磁碟空間不足，已清理粗剪暫存。請刪除舊專案或釋放更多空間後再重試。";
  }
  if (/setup_artifact_tool_workspace|@oai\/artifact-tool|Cannot find module/.test(message)) {
    return "處理失敗：PPT 產生器沒有成功啟動。請重新送出一次；若仍失敗，請把終端機錯誤貼給我。";
  }
  const firstLine = message.split(/\r?\n/).find((line) => line.trim()) || message;
  return `處理失敗：${firstLine.slice(0, 280)}${firstLine.length > 280 ? "…" : ""}`;
}

function workflowErrorStage(message, fallbackStage = "outputs") {
  const text = String(message || "");
  if (/請先選擇影片|重新上傳|共用原始影片|原始影片|沒有可讀取的音軌|音軌|不支援|格式|損壞/.test(text)) return "upload";
  if (/逐字稿|稿件|原稿|校稿|精華|mapping|時間線資訊|品質不足|辨識/.test(text)) return "transcript";
  if (/至少選擇一項|後續功能|功能/.test(text)) return "features";
  if (/粗剪|保留|刪除片段|刪除滑塊|keepRanges|FFmpeg 粗剪/.test(text)) return "roughcut";
  if (/字幕|caption|Caption|SRT|ASS|燒錄/.test(text)) return "subtitles";
  if (/PPT|PowerPoint|簡報|B-roll|成片|輸出|下載|剪輯包/.test(text)) return "outputs";
  return fallbackStage;
}

function workflowErrorAction(stage) {
  return {
    upload: "回到上傳，請確認影片檔、音軌或進階補充內容。",
    transcript: "回到逐字稿，請修正或重新選擇要用於後續製作的稿件。",
    features: "回到功能選擇，請調整要繼續製作的項目。",
    roughcut: "回到粗剪精修，請檢查保留/隱藏片段與時間軸。",
    subtitles: "回到字幕精修，請檢查字幕內容、時間或保留狀態。",
    outputs: "回到輸出結果，請查看哪些成品已完成、哪些輸出需要重試。"
  }[stage] || "回到可繼續處理的位置。";
}

function workflowErrorPayload(error, isUserError, fallbackStage = "outputs") {
  const errorMessage = publicErrorMessage(error, isUserError);
  const errorStage = workflowErrorStage(errorMessage || error?.message, fallbackStage);
  return {
    error: errorMessage,
    errorStage,
    errorAction: workflowErrorAction(errorStage)
  };
}

function parseAudioGain(value) {
  const gain = Number(value);
  if (!Number.isFinite(gain)) return 1;
  return Math.max(0, Math.min(10, Number(gain.toFixed(2))));
}

function buildTranscriptFromContext({ title, context }) {
  const topic = String(context || "").replace(/\s+/g, " ").trim();
  const safeTopic = topic || String(title || "這支影片");
  return [
    `這支影片沒有可讀取的音軌，因此系統改依使用者提供的影片主題整理內容。影片主題是：${safeTopic}。`,
    `第一個重點是建立清楚的觀看情境，讓觀眾快速理解影片正在呈現的主題、人物、產品或場景。`,
    `第二個重點是把畫面拆成適合理解的段落，安排可辨識的品質 B-roll，補足主畫面之外的說明。`,
    `第三個重點是整理成簡報結構，讓每一頁 PowerPoint 都能對應一段影片內容，方便後續修改與展示。`,
    `最後輸出完整影片、可編輯簡報與 B-roll 規劃，讓這份素材能直接進入下一步製作流程。`
  ].join("\n\n");
}

async function persistProject(result) {
  const projectPath = path.join(outputDirectory, result.id, "project.json");
  const payload = `${JSON.stringify({ ...result, pipelineVersion: PIPELINE_VERSION, savedAt: new Date().toISOString() }, null, 2)}\n`;
  await writeFile(projectPath, payload, "utf8");
}

function projectDirectoryForJob(jobId) {
  if (!/^[a-f0-9-]{36}$/i.test(jobId)) {
    const error = new Error("找不到這個專案。");
    error.statusCode = 404;
    throw error;
  }
  const rootDirectory = path.resolve(outputDirectory);
  const projectDirectory = path.resolve(outputDirectory, jobId);
  if (!projectDirectory.startsWith(`${rootDirectory}${path.sep}`)) {
    const error = new Error("找不到這個專案。");
    error.statusCode = 404;
    throw error;
  }
  return projectDirectory;
}

async function cleanupProjectArtifacts(jobId, { allowPersisted = false } = {}) {
  const projectDirectory = projectDirectoryForJob(jobId);
  await cancelScheduledProjectCleanup(jobId);
  try {
    const details = await stat(path.join(projectDirectory, "project.json"));
    if (details.isFile() && !allowPersisted) return { preserved: true, reason: "persisted-project" };
  } catch {
    // Only incomplete directories without project.json are temporary cleanup candidates.
  }
  await rm(projectDirectory, { recursive: true, force: true });
  return { preserved: false };
}

async function cleanupEditingPackageArtifacts(jobId) {
  const projectDirectory = projectDirectoryForJob(jobId);
  await cancelScheduledProjectCleanup(jobId);
  let project = null;
  try {
    project = JSON.parse(await readFile(path.join(projectDirectory, "project.json"), "utf8"));
  } catch {
    project = { id: jobId, title: "影片內容" };
  }
  const { packageZipPath, packageCachePath } = editingPackagePathsForProject(project);
  await Promise.allSettled([
    rm(packageZipPath, { force: true }),
    rm(packageCachePath, { force: true }),
    rm(path.join(projectDirectory, ".editing-package"), { recursive: true, force: true })
  ]);
  const entries = await readdir(projectDirectory, { withFileTypes: true }).catch(() => []);
  await Promise.allSettled(entries
    .filter((entry) => entry.isFile() && entry.name.startsWith(".") && entry.name.includes("剪輯包-") && entry.name.endsWith(".zip"))
    .map((entry) => rm(path.join(projectDirectory, entry.name), { force: true })));
  return { cleaned: true };
}

function projectCleanupMarkerPath(jobId) {
  return path.join(projectDirectoryForJob(jobId), projectCleanupMarkerFilename);
}

async function cancelScheduledProjectCleanup(jobId) {
  const timer = projectCleanupTimers.get(jobId);
  if (timer) clearTimeout(timer);
  projectCleanupTimers.delete(jobId);
  await rm(projectCleanupMarkerPath(jobId), { force: true });
}

async function executeScheduledProjectCleanup(jobId, options = {}) {
  projectCleanupTimers.delete(jobId);
  return cleanupProjectArtifacts(jobId, options);
}

async function scheduleProjectCleanup(jobId, delayMs = projectCleanupGraceMs, { allowPersisted = false } = {}) {
  const projectDirectory = projectDirectoryForJob(jobId);
  await stat(projectDirectory);
  await cancelScheduledProjectCleanup(jobId);
  try {
    const details = await stat(path.join(projectDirectory, "project.json"));
    if (details.isFile() && !allowPersisted) return null;
  } catch {
    // Incomplete jobs without project.json may still be reclaimed after the grace period.
  }
  const deleteAfter = Date.now() + Math.max(0, Number(delayMs) || 0);
  await writeFile(
    path.join(projectDirectory, projectCleanupMarkerFilename),
    `${JSON.stringify({ jobId, deleteAfter, allowPersisted }, null, 2)}\n`,
    "utf8"
  );
  const timer = setTimeout(() => {
    executeScheduledProjectCleanup(jobId, { allowPersisted }).catch(() => {});
  }, Math.max(0, deleteAfter - Date.now()));
  timer.unref?.();
  projectCleanupTimers.set(jobId, timer);
  return deleteAfter;
}

async function restoreScheduledProjectCleanups() {
  const entries = await readdir(outputDirectory, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory() || !/^[a-f0-9-]{36}$/i.test(entry.name)) continue;
    try {
      const marker = JSON.parse(await readFile(path.join(outputDirectory, entry.name, projectCleanupMarkerFilename), "utf8"));
      await scheduleProjectCleanup(entry.name, Math.max(0, Number(marker.deleteAfter) - Date.now()), {
        allowPersisted: Boolean(marker.allowPersisted)
      });
    } catch {
      // Projects without a pending marker are active and must remain untouched.
    }
  }
}

function outputPathFromUrl(jobId, url) {
  const prefix = `/outputs/jobs/${jobId}/`;
  const value = String(url || "").split(/[?#]/)[0];
  if (!value.startsWith(prefix)) return null;
  const jobDirectory = path.resolve(outputDirectory, jobId);
  let relativePath;
  try {
    relativePath = decodeURIComponent(value.slice(prefix.length));
  } catch {
    return null;
  }
  const filePath = path.resolve(jobDirectory, relativePath);
  if (filePath !== jobDirectory && !filePath.startsWith(`${jobDirectory}${path.sep}`)) return null;
  return filePath;
}

function safePackageFilename(value, fallback = "asset") {
  const extension = path.extname(String(value || ""));
  const basename = safeTitle(path.basename(String(value || ""), extension), fallback)
    .replace(/^\.+/, "")
    .trim();
  return `${basename || fallback}${extension || ""}`;
}

function uniquePackagePath(relativePath, usedPaths) {
  const normalized = String(relativePath || "").replace(/\\/g, "/");
  if (!usedPaths.has(normalized)) {
    usedPaths.add(normalized);
    return normalized;
  }
  const directory = path.posix.dirname(normalized);
  const extension = path.posix.extname(normalized);
  const basename = path.posix.basename(normalized, extension);
  let index = 2;
  while (usedPaths.has(path.posix.join(directory, `${basename}-${index}${extension}`))) index += 1;
  const uniquePath = path.posix.join(directory, `${basename}-${index}${extension}`);
  usedPaths.add(uniquePath);
  return uniquePath;
}

async function collectEditingPackageAssets(project) {
  const jobId = String(project?.id || "");
  if (!/^[a-f0-9-]{36}$/i.test(jobId)) return [];
  const assets = [];
  const seenSourcePaths = new Set();
  const seenSourceIdentities = new Set();
  const usedPackagePaths = new Set();

  async function addAsset({ url, directory, filename, label, kind }) {
    if (!url) return;
    const sourcePath = outputPathFromUrl(jobId, url);
    if (!sourcePath || seenSourcePaths.has(sourcePath)) return;
    let details;
    try {
      details = await stat(sourcePath);
    } catch {
      return;
    }
    if (!details.isFile() || details.size <= 0) return;
    const sourceIdentity = `${details.dev}:${details.ino}`;
    if (seenSourceIdentities.has(sourceIdentity)) return;
    seenSourcePaths.add(sourcePath);
    seenSourceIdentities.add(sourceIdentity);
    const relativePath = uniquePackagePath(
      path.posix.join(directory, safePackageFilename(filename || path.basename(sourcePath))),
      usedPackagePaths
    );
    assets.push({
      sourcePath,
      relativePath,
      label: label || path.basename(sourcePath),
      kind: kind || "asset",
      bytes: details.size,
      mtimeMs: Math.round(details.mtimeMs)
    });
  }

  const finalVideoUrl = project.subtitledVideoUrl || project.finalVideoUrl || project.roughCutVideoUrl;
  await addAsset({ url: finalVideoUrl, directory: "media/final", filename: `01-${project.title || "完整成片"}.mp4`, label: "最終可交付影片", kind: "final-video" });
  await addAsset({ url: project.finalVideoUrl, directory: "media/exports", filename: "完整成片.mp4", label: "完整成片", kind: "export-video" });
  await addAsset({ url: project.subtitledVideoUrl, directory: "media/exports", filename: "精修字幕影片.mp4", label: "精修字幕影片", kind: "export-video" });
  await addAsset({ url: project.roughCutVideoUrl, directory: "media/exports", filename: "AI粗剪影片.mp4", label: "AI 粗剪影片", kind: "roughcut-video" });
  await addAsset({ url: project.roughCutReview?.sourceVideoUrl || project.subtitleReview?.sourceVideoUrl, directory: "media/source", filename: project.sourceFilename || "原始素材.mp4", label: "原始素材", kind: "source-video" });
  await addAsset({ url: project.subtitleReview?.baseVideoUrl, directory: "media/source", filename: "字幕底稿影片.mp4", label: "字幕底稿影片", kind: "subtitle-base-video" });

  await addAsset({ url: project.subtitleSrtUrl, directory: "subtitles", filename: "精修字幕.srt", label: "精修 SRT", kind: "subtitle" });
  await addAsset({ url: project.subtitleAssUrl, directory: "subtitles", filename: "精修字幕.ass", label: "精修 ASS", kind: "subtitle" });
  await addAsset({ url: project.subtitleReview?.draftSrtUrl, directory: "subtitles/draft", filename: "字幕草稿.srt", label: "字幕草稿 SRT", kind: "subtitle-draft" });
  await addAsset({ url: project.subtitleReview?.draftAssUrl, directory: "subtitles/draft", filename: "字幕草稿.ass", label: "字幕草稿 ASS", kind: "subtitle-draft" });

  await addAsset({ url: project.pptxUrl, directory: "slides", filename: "簡報.pptx", label: "可編輯簡報", kind: "presentation" });
  await addAsset({ url: project.pptPdfUrl, directory: "slides", filename: "簡報.pdf", label: "簡報 PDF", kind: "presentation" });
  for (const [index, url] of (project.pptPreviewUrls || []).entries()) {
    await addAsset({ url, directory: "slides/preview", filename: `slide-${String(index + 1).padStart(2, "0")}.png`, label: `簡報預覽 ${index + 1}`, kind: "slide-preview" });
  }

  await addAsset({ url: project.transcriptUrl, directory: "data/transcript", filename: "逐字稿.txt", label: "逐字稿", kind: "transcript" });
  await addAsset({ url: project.originalTranscriptUrl, directory: "data/transcript", filename: "原始逐字稿.txt", label: "原始逐字稿", kind: "transcript-original" });
  await addAsset({ url: project.editedTranscriptUrl, directory: "data/transcript", filename: "已確認原稿.txt", label: "已確認原稿", kind: "transcript-edited" });
  await addAsset({ url: project.proofreadTranscriptUrl, directory: "data/transcript", filename: "AI校稿版.txt", label: "AI 校稿版", kind: "transcript-proofread" });
  await addAsset({ url: project.highlightTranscriptUrl, directory: "data/transcript", filename: "精華摘要.txt", label: "精華摘要", kind: "transcript-highlight" });
  for (const [index, version] of (project.transcriptReview?.versions || []).entries()) {
    const number = String(index + 1).padStart(2, "0");
    const versionLabel = safeTitle(version.label || version.kind || `逐字稿版本${number}`, `逐字稿版本${number}`);
    await addAsset({ url: version.textUrl, directory: "data/transcript/versions", filename: `${number}-${versionLabel}.txt`, label: version.label || `逐字稿版本 ${number}`, kind: "transcript-version" });
    await addAsset({ url: version.jsonUrl, directory: "data/transcript/versions", filename: `${number}-${versionLabel}.json`, label: `${version.label || `逐字稿版本 ${number}`} metadata`, kind: "transcript-version-json" });
  }
  await addAsset({ url: project.transcription?.timelineUrl, directory: "data/transcript", filename: "逐字稿時間線.json", label: "Whisper 時間線", kind: "timeline" });
  await addAsset({ url: project.brollCsvUrl, directory: "data/broll", filename: "B-roll規劃.csv", label: "B-roll 規劃 CSV", kind: "broll-plan" });
  await addAsset({ url: project.brollJsonUrl, directory: "data/broll", filename: "B-roll規劃.json", label: "B-roll 規劃 JSON", kind: "broll-plan" });
  await addAsset({ url: project.roughCutPlanUrl, directory: "data/roughcut", filename: "AI粗剪計畫.json", label: "AI 粗剪計畫", kind: "roughcut-plan" });
  await addAsset({ url: project.roughCutReportUrl, directory: "data/roughcut", filename: "AI粗剪報告.txt", label: "AI 粗剪報告", kind: "roughcut-report" });
  await addAsset({ url: project.roughCutReview?.timelineUrl, directory: "data/roughcut", filename: "AI粗剪時間線.json", label: "AI 粗剪時間線", kind: "roughcut-timeline" });

  for (const [index, item] of (project.broll || []).entries()) {
    const number = String(index + 1).padStart(2, "0");
    const base = safeTitle(item.title || item.reason || `B-roll-${number}`, `B-roll-${number}`);
    await addAsset({ url: item.videoUrl, directory: "media/broll", filename: `${number}-${base}.mp4`, label: `B-roll ${number}`, kind: "broll-video" });
    await addAsset({ url: item.frameUrl, directory: "media/broll-frames", filename: `${number}-${base}${path.extname(String(item.frameUrl || "").split(/[?#]/)[0]) || ".png"}`, label: `B-roll 參考畫面 ${number}`, kind: "broll-frame" });
  }

  return assets;
}

function editingPackageSourceAsset(assets) {
  const priority = ["source-video", "subtitle-base-video", "roughcut-video", "final-video", "export-video"];
  return [...assets].sort((left, right) => priority.indexOf(left.kind) - priority.indexOf(right.kind))
    .find((asset) => priority.includes(asset.kind)) || null;
}

function editingPackageTimelineCsv(project) {
  const review = project?.roughCutReview || {};
  const lines = ["type,index,start,end,duration,label,reason"];
  for (const [index, range] of (review.keepRanges || []).entries()) {
    const fallbackDuration = Number(range.end) - Number(range.start);
    const duration = Number(range.duration ?? (Number.isFinite(fallbackDuration) ? fallbackDuration : 0));
    lines.push([
      "keep",
      index + 1,
      Number(range.start || 0).toFixed(3),
      Number(range.end || 0).toFixed(3),
      Number(duration || 0).toFixed(3),
      `"保留片段 ${index + 1}"`,
      '""'
    ].join(","));
  }
  for (const [index, range] of (review.removals || []).entries()) {
    const reason = String(range.reason || range.label || (range.sources || []).join(" / ") || "AI 建議刪除").replace(/"/g, '""');
    const fallbackDuration = Number(range.end) - Number(range.start);
    const duration = Number(range.duration ?? (Number.isFinite(fallbackDuration) ? fallbackDuration : 0));
    lines.push([
      "remove",
      index + 1,
      Number(range.start || 0).toFixed(3),
      Number(range.end || 0).toFixed(3),
      Number(duration || 0).toFixed(3),
      `"刪除片段 ${index + 1}"`,
      `"${reason}"`
    ].join(","));
  }
  return lines.length > 1 ? `${lines.join("\n")}\n` : "";
}

function editingPackageSignature(project, assets) {
  const digest = crypto.createHash("sha256");
  digest.update(JSON.stringify({
    projectId: project.id,
    title: project.title,
    selectedFeatures: project.selectedFeatures || {},
    sourceMediaProfile: project.sourceMediaProfile || {},
    roughCutKeepRanges: project.roughCutReview?.keepRanges || [],
    assets: assets.map((asset) => ({
      relativePath: asset.relativePath,
      bytes: asset.bytes,
      mtimeMs: asset.mtimeMs
    }))
  }));
  return digest.digest("hex");
}

function editingPackagePathsForProject(project) {
  const jobId = String(project?.id || "");
  const jobDirectory = path.join(outputDirectory, jobId);
  const packageTitle = safeTitle(project?.title || "影片內容", "影片內容");
  const packageZipPath = path.join(jobDirectory, `${packageTitle}-剪輯包.zip`);
  return {
    jobDirectory,
    packageTitle,
    packageZipPath,
    packageCachePath: `${packageZipPath}.cache.json`
  };
}

async function editingPackageReadiness(project, assets = null) {
  const packageAssets = assets || await collectEditingPackageAssets(project);
  if (!packageAssets.length) {
    return { status: "unavailable", assets: packageAssets, exists: false, bytes: 0, filePath: "", details: null };
  }
  const signature = editingPackageSignature(project, packageAssets);
  const { packageZipPath, packageCachePath } = editingPackagePathsForProject(project);
  try {
    const [cached, details] = await Promise.all([
      JSON.parse(await readFile(packageCachePath, "utf8")),
      stat(packageZipPath)
    ]);
    if (cached.signature === signature && details.isFile() && details.size > 0) {
      return { status: "ready", assets: packageAssets, exists: true, bytes: details.size, filePath: packageZipPath, details, signature };
    }
  } catch {
    // Missing or stale package; report build-required without creating the ZIP.
  }
  return { status: "build-required", assets: packageAssets, exists: true, bytes: 0, filePath: packageZipPath, details: null, signature };
}

async function buildEditingPackageForProject(project) {
  const jobId = String(project?.id || "");
  if (!/^[a-f0-9-]{36}$/i.test(jobId)) {
    const error = new Error("找不到這個專案。");
    error.statusCode = 404;
    throw error;
  }
  const { jobDirectory, packageTitle, packageZipPath, packageCachePath } = editingPackagePathsForProject(project);
  const assets = await collectEditingPackageAssets(project);
  if (!assets.length) {
    const error = new Error("目前沒有可放入剪輯包的輸出檔。");
    error.statusCode = 404;
    throw error;
  }
  const signature = editingPackageSignature(project, assets);
  try {
    const [cached, details] = await Promise.all([
      JSON.parse(await readFile(packageCachePath, "utf8")),
      stat(packageZipPath)
    ]);
    if (cached.signature === signature && details.isFile() && details.size > 0) {
      return { filePath: packageZipPath, details, cached: true };
    }
  } catch {
    // Cache miss: build an isolated package and publish it atomically.
  }

  const buildId = crypto.randomUUID();
  const buildDirectory = path.join(jobDirectory, ".editing-package", buildId);
  const packageRoot = path.join(buildDirectory, `${packageTitle}-剪輯包`);
  const temporaryZipPath = path.join(jobDirectory, `.${packageTitle}-剪輯包-${buildId}.zip`);
  await mkdir(packageRoot, { recursive: true });

  for (const asset of assets) {
    const destination = path.join(packageRoot, ...asset.relativePath.split("/"));
    await mkdir(path.dirname(destination), { recursive: true });
    await linkOrCopyFile(asset.sourcePath, destination);
  }

  const sourceAsset = editingPackageSourceAsset(assets);
  const projectFiles = sourceAsset ? buildPortableNleProject({
    title: project.title || "影片內容",
    sourceRelativePath: sourceAsset.relativePath,
    durationSeconds: Number(project.durationSeconds) || 0,
    keepRanges: project.roughCutReview?.keepRanges || [],
    frameRate: Number(project.sourceMediaProfile?.frameRate) || 30,
    width: Number(project.sourceMediaProfile?.width) || 1920,
    height: Number(project.sourceMediaProfile?.height) || 1080
  }) : {};
  for (const [relativePath, contents] of Object.entries(projectFiles)) {
    const destination = path.join(packageRoot, ...relativePath.split("/"));
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, contents, "utf8");
  }

  const manifest = {
    title: project.title || "影片內容",
    projectId: jobId,
    createdAt: new Date().toISOString(),
    sourceFilename: project.sourceFilename || project.filename || "",
    workflow: project.workflow || {},
    selectedFeatures: project.selectedFeatures || {},
    durationSeconds: project.durationSeconds || 0,
    signature,
    projectFiles: Object.keys(projectFiles),
    assets: assets.map(({ sourcePath: _sourcePath, ...asset }) => asset)
  };
  await mkdir(path.join(packageRoot, "data"), { recursive: true });
  await writeFile(path.join(packageRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  await writeFile(path.join(packageRoot, "README-如何匯入.txt"), [
    `${project.title || "影片內容"} - 剪輯包`,
    "",
    "建議匯入方式：",
    "1. 優先匯入 project/剪輯時間線.otio；Final Cut Pro 可匯入 FCPXML，不支援 OTIO/FCPXML 時使用 EDL。",
    "2. 時間線已依確認後的粗剪保留區間建立，媒體路徑使用剪輯包內的相對位置。",
    "3. subtitles 內的 SRT/ASS 可匯入字幕軌；slides 與 media/broll 是可再調整的附加素材。",
    "4. data 內保留逐字稿、B-roll 規劃、粗剪時間線與 manifest，方便回查每段素材的用途。",
    "",
    "注意：請先完整解壓縮再匯入 project 內的時間線檔，並保留資料夾相對位置。"
  ].join("\n"), "utf8");

  const timelineCsv = editingPackageTimelineCsv(project);
  if (timelineCsv) await writeFile(path.join(packageRoot, "data", "roughcut-timeline.csv"), `\uFEFF${timelineCsv}`, "utf8");

  try {
    await execFileAsync("ditto", ["-c", "-k", "--norsrc", "--keepParent", packageRoot, temporaryZipPath], { timeout: 0 });
    const temporaryDetails = await stat(temporaryZipPath);
    if (!temporaryDetails.isFile() || temporaryDetails.size <= 0) throw new Error("剪輯包 ZIP 產生失敗。");
    await rename(temporaryZipPath, packageZipPath);
    await writeFile(packageCachePath, `${JSON.stringify({
      signature,
      bytes: temporaryDetails.size,
      completedAt: new Date().toISOString()
    }, null, 2)}\n`, "utf8");
  } finally {
    await rm(buildDirectory, { recursive: true, force: true });
    await rm(temporaryZipPath, { force: true });
  }

  const details = await stat(packageZipPath);
  return { filePath: packageZipPath, details, cached: false };
}

async function createEditingPackageForProject(project) {
  const jobId = String(project?.id || "");
  if (!/^[a-f0-9-]{36}$/i.test(jobId)) {
    const error = new Error("找不到這個專案。");
    error.statusCode = 404;
    throw error;
  }
  if (editingPackageBuilds.has(jobId)) return editingPackageBuilds.get(jobId);
  const build = buildEditingPackageForProject(project);
  editingPackageBuilds.set(jobId, build);
  try {
    return await build;
  } finally {
    if (editingPackageBuilds.get(jobId) === build) editingPackageBuilds.delete(jobId);
  }
}

async function downloadStatusForProject(project) {
  const jobId = String(project?.id || "");
  if (!/^[a-f0-9-]{36}$/i.test(jobId)) return [];
  const checks = downloadDefinitions
    .map(async (definition) => {
      if (definition.dynamic && definition.key === "editingPackage") {
        const readiness = await editingPackageReadiness(project);
        return {
          ...definition,
          url: readiness.exists ? `/api/projects/${jobId}/download/editingPackage` : null,
          exists: readiness.exists,
          bytes: readiness.bytes,
          status: readiness.status
        };
      }
      const url = project[definition.field] || null;
      if (!url) return { ...definition, url: null, exists: false, bytes: 0 };
      const filePath = outputPathFromUrl(jobId, url);
      if (!filePath) return { ...definition, url, exists: false, bytes: 0 };
      try {
        const details = await stat(filePath);
        return { ...definition, url, exists: details.isFile() && details.size > 0, bytes: details.size };
      } catch {
        return { ...definition, url, exists: false, bytes: 0 };
      }
    });
  return Promise.all(checks);
}

function appleScriptString(value) {
  return String(value || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function encodeRelativeUrlPath(relativePath) {
  return String(relativePath || "")
    .split(/[\\/]+/)
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

async function linkOrCopyFile(sourcePath, destinationPath) {
  if (path.resolve(sourcePath) === path.resolve(destinationPath)) return "same-file";
  try {
    await link(sourcePath, destinationPath);
    return "hard-link";
  } catch (error) {
    if (!["EXDEV", "EPERM", "EACCES", "ENOTSUP", "EEXIST"].includes(error?.code)) throw error;
    await copyFile(sourcePath, destinationPath);
    return "copy";
  }
}

async function cleanupStaleRoughcutTempDirectories(rootDirectory) {
  let removedCount = 0;
  async function scan(directory) {
    let entries = [];
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch {
      return;
    }
    await Promise.all(entries.map(async (entry) => {
      if (!entry.isDirectory()) return;
      const entryPath = path.join(directory, entry.name);
      if (entry.name.startsWith(".roughcut-parts-")) {
        await rm(entryPath, { recursive: true, force: true });
        removedCount += 1;
        return;
      }
      await scan(entryPath);
    }));
  }
  await scan(rootDirectory);
  if (removedCount) console.warn(`已清理 ${removedCount} 個粗剪暫存資料夾。`);
}

async function chooseSavePath(defaultFilename) {
  const script = [
    `set defaultName to "${appleScriptString(defaultFilename)}"`,
    `set defaultFolder to POSIX file "${appleScriptString(path.join(homedir(), "Downloads"))}"`,
    'set chosenFile to choose file name with prompt "選擇輸出檔案儲存位置" default name defaultName default location defaultFolder',
    "POSIX path of chosenFile"
  ].join("\n");
  const { stdout } = await execFileAsync("osascript", ["-e", script], { timeout: 0 });
  return stdout.trim();
}

function downloadFilenameForProject(project, definition, filePath) {
  const title = safeTitle(project?.title || path.basename(filePath, path.extname(filePath)) || "影片內容", "影片內容");
  const extension = path.extname(filePath) || "";
  const label = Object.prototype.hasOwnProperty.call(downloadFilenameLabels, definition.key)
    ? downloadFilenameLabels[definition.key]
    : definition.label || "";
  return `${title}${label ? `-${label}` : ""}${extension}`;
}

async function downloadableFileForRequest(jobId, key) {
  if (!/^[a-f0-9-]{36}$/i.test(jobId)) {
    const error = new Error("找不到這個專案。");
    error.statusCode = 404;
    throw error;
  }
  const definition = downloadDefinitions.find((item) => item.key === key);
  if (!definition) {
    const error = new Error("找不到這個下載項目。");
    error.statusCode = 404;
    throw error;
  }
  const projectPath = path.join(outputDirectory, jobId, "project.json");
  const project = JSON.parse(await readFile(projectPath, "utf8"));
  if (definition.dynamic && definition.key === "editingPackage") {
    const { filePath, details } = await createEditingPackageForProject(project);
    const downloadFilename = downloadFilenameForProject(project, definition, filePath);
    return { definition, filePath, details, downloadFilename };
  }
  const filePath = outputPathFromUrl(jobId, project[definition.field]);
  if (!filePath) {
    const error = new Error("這個檔案尚未產生。");
    error.statusCode = 404;
    throw error;
  }
  const details = await stat(filePath);
  if (!details.isFile() || details.size <= 0) {
    const error = new Error("這個檔案尚未產生。");
    error.statusCode = 404;
    throw error;
  }
  const downloadFilename = downloadFilenameForProject(project, definition, filePath);
  return { definition, filePath, details, downloadFilename };
}

async function createWaveformPeaks(mediaPath, outputPath, { bars = 3200 } = {}) {
  await execFileAsync(ffmpegPath, [
    "-hide_banner", "-loglevel", "error", "-y",
    "-i", mediaPath,
    "-vn", "-ac", "1", "-ar", "400",
    "-f", "s16le", outputPath
  ], { timeout: 0 });
  const buffer = await readFile(outputPath);
  const samples = Math.floor(buffer.length / 2);
  if (!samples) return [];
  const bucketSize = Math.max(1, Math.floor(samples / bars));
  const levels = [];
  for (let bucket = 0; bucket < bars; bucket += 1) {
    const start = bucket * bucketSize;
    const end = bucket === bars - 1 ? samples : Math.min(samples, start + bucketSize);
    let peak = 0;
    let energy = 0;
    for (let index = start; index < end; index += 1) {
      const sample = Math.abs(buffer.readInt16LE(index * 2)) / 32768;
      peak = Math.max(peak, sample);
      energy += sample * sample;
    }
    const rms = Math.sqrt(energy / Math.max(1, end - start));
    levels.push((rms * 0.72) + (peak * 0.28));
  }
  const sortedLevels = levels.filter((level) => level > 0).sort((left, right) => left - right);
  const normalizer = sortedLevels[Math.min(sortedLevels.length - 1, Math.floor(sortedLevels.length * 0.96))] || 1;
  return levels.map((level) => Number(Math.max(0, Math.min(1, level / normalizer)).toFixed(3)));
}

async function createRoughCutTimelineThumbnails(mediaPath, outputDirectoryPath, durationSeconds, { count = 10 } = {}) {
  const duration = Math.max(1, Number(durationSeconds) || 1);
  const frameCount = Math.max(4, Math.min(14, Number(count) || 10));
  await rm(outputDirectoryPath, { recursive: true, force: true });
  await mkdir(outputDirectoryPath, { recursive: true });
  const thumbnailPaths = [];
  for (let index = 0; index < frameCount; index += 1) {
    const timestamp = (duration * (index + 0.5)) / frameCount;
    const outputPath = path.join(outputDirectoryPath, `timeline-${String(index + 1).padStart(2, "0")}.jpg`);
    await execFileAsync(ffmpegPath, [
      "-hide_banner", "-loglevel", "error", "-y",
      "-ss", timestamp.toFixed(3),
      "-i", mediaPath,
      "-frames:v", "1",
      "-vf", "scale=360:202:force_original_aspect_ratio=increase,crop=360:202",
      "-q:v", "3",
      outputPath
    ], { timeout: 0 });
    thumbnailPaths.push(outputPath);
  }
  return thumbnailPaths;
}

async function createRoughCutPreviewProxy(mediaPath, outputPath) {
  await mkdir(path.dirname(outputPath), { recursive: true });
  const temporaryOutputPath = `${outputPath}.tmp-${crypto.randomUUID()}.mp4`;
  const commonArgs = [
    "-hide_banner", "-loglevel", "error", "-y",
    "-i", mediaPath,
    "-map", "0:v:0",
    "-map", "0:a:0?",
    "-dn",
    "-map_metadata", "-1",
    "-map_chapters", "-1",
    "-vf", "scale='min(1280,iw)':-2:flags=lanczos,fps=30,setsar=1,format=yuv420p",
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-profile:v", "main",
    "-level", "4.1",
    "-crf", "20",
    "-pix_fmt", "yuv420p",
    "-colorspace", "bt709",
    "-color_primaries", "bt709",
    "-color_trc", "bt709",
    "-color_range", "tv",
    "-g", "30",
    "-keyint_min", "30",
    "-sc_threshold", "0",
    "-bf", "0",
    "-video_track_timescale", "30000",
    "-movflags", "+faststart",
  ];
  await execFileAsync(ffmpegPath, [
    ...commonArgs,
    "-c:a", "copy",
    temporaryOutputPath
  ], { timeout: 0 }).catch(async (error) => {
    await rm(temporaryOutputPath, { force: true }).catch(() => {});
    console.warn(`粗剪預覽代理音訊直拷失敗，改用保留聲道的 AAC 轉碼：${error.message}`);
    await execFileAsync(ffmpegPath, [
      ...commonArgs,
      "-c:a", "aac",
      "-b:a", "256k",
      temporaryOutputPath
    ], { timeout: 0 }).catch(async (fallbackError) => {
      await rm(temporaryOutputPath, { force: true }).catch(() => {});
      throw fallbackError;
    });
  });
  await rename(temporaryOutputPath, outputPath);
  return outputPath;
}

function ffmpegFilterNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number).toFixed(3).replace(/\.?0+$/, "") : "0";
}

async function createRenderedRoughCutPreview(mediaPath, outputPath, keepRanges = []) {
  const ranges = (Array.isArray(keepRanges) ? keepRanges : [])
    .map((range) => ({
      start: Number(range?.start),
      end: Number(range?.end)
    }))
    .filter((range) => Number.isFinite(range.start) && Number.isFinite(range.end) && range.end > range.start);
  if (!ranges.length) throw new Error("沒有可保留的影片區段，無法產生剪後預覽。");
  await mkdir(path.dirname(outputPath), { recursive: true });
  const temporaryOutputPath = path.join(path.dirname(outputPath), `.roughcut-preview-${crypto.randomUUID()}.mp4`);
  try {
    await createRoughCutVideo({
      mediaPath,
      outputPath: temporaryOutputPath,
      keepRanges: ranges,
      hasAudio: true,
      verify: true,
      // 粗剪預覽用單次 filter 直接輸出剪後短片；避免分段暫存片段在本機 ffmpeg 開檔不穩時退回 5 分鐘原片代理。
      renderMode: "filter",
      ffmpegCommand: ffmpegPath,
      videoEncodingOptions: {
        videoCodec: "libx264",
        preset: "ultrafast",
        crf: 23,
        videoProfile: "main",
        outputFps: 30
      }
    });
    await rename(temporaryOutputPath, outputPath);
    return outputPath;
  } catch (error) {
    await rm(temporaryOutputPath, { force: true }).catch(() => {});
    throw error;
  }
}

function transcriptTextFromTimeline(timeline) {
  const text = String(timeline?.text || "").replace(/\s+/g, " ").trim();
  const formatted = formatTimelineSegmentsAsTranscript(timeline?.segments, text);
  return formatted || text;
}

async function createSharedTimelineTranscription({ mediaPath, outputPath, timelinePath, language = "auto", context = "" }) {
  await execFileAsync(roughCutPythonPath, [
    path.join(__dirname, "tools", "export_whisper_timeline.py"),
    mediaPath,
    "--model-dir", roughCutModelDirectory,
    "--language", language || "auto",
    "--context", context || "",
    "--output", timelinePath
  ], { timeout: 0 });

  const timeline = JSON.parse(await readFile(timelinePath, "utf8"));
  const transcript = transcriptTextFromTimeline(timeline);
  if (!transcript) throw new Error("辨識完成，但沒有取得任何文字。");
  await writeFile(outputPath, `${transcript}\n`, "utf8");
  return {
    transcript,
    transcriptPath: outputPath,
    timelinePath,
    segments: Array.isArray(timeline.segments) ? timeline.segments.length : 0,
    characters: transcript.length,
    languages: [timeline.language || language || "auto"],
    model: "small",
    punctuation: "shared-word-timeline",
    engine: "local-whisper-shared-timeline",
    offline: true
  };
}

function normalizeTranscriptText(text) {
  return String(text || "")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

function normalizeTranscriptInput(text) {
  return String(text || "").replace(/\r/g, "\n");
}

function rawTranscriptLines(text) {
  const normalized = normalizeTranscriptInput(text);
  if (!normalized) return [];
  return normalized.split("\n").map((line) => line.replace(/\s+/g, " ").trim());
}

function splitTranscriptLines(text) {
  const normalized = normalizeTranscriptText(text);
  if (!normalized) return [];
  return normalized.split("\n").map((line) => line.trim()).filter(Boolean);
}

function safeTranscriptVersionId(value, fallback = "transcript-version") {
  return String(value || fallback)
    .normalize("NFKD")
    .replace(/[^\w-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || fallback;
}

function transcriptVersionDirectory(jobDirectory) {
  return path.join(jobDirectory, "transcripts");
}

function transcriptVersionUrl(jobId, filename) {
  return `/outputs/jobs/${jobId}/transcripts/${encodeURIComponent(filename)}`;
}

function transcriptVersionById(project, versionId) {
  const versions = Array.isArray(project?.transcriptReview?.versions) ? project.transcriptReview.versions : [];
  return versions.find((version) => version.id === versionId) || null;
}

function latestTranscriptVersion(project, preferredId = "") {
  const review = project?.transcriptReview || {};
  return transcriptVersionById(project, preferredId)
    || transcriptVersionById(project, review.selectedVersionId)
    || transcriptVersionById(project, review.editedVersionId)
    || transcriptVersionById(project, review.originalVersionId)
    || (Array.isArray(review.versions) ? review.versions.at(-1) : null);
}

function firstEditedTranscriptVersion(project, preferredId = "") {
  const preferred = transcriptVersionById(project, preferredId);
  if (preferred?.kind === "user-edited-full") return preferred;
  const versions = Array.isArray(project?.transcriptReview?.versions) ? project.transcriptReview.versions : [];
  return versions.findLast?.((version) => version.kind === "user-edited-full")
    || [...versions].reverse().find((version) => version.kind === "user-edited-full")
    || null;
}

function latestTranscriptVersionOfKind(project, kind, { sourceVersionId = "" } = {}) {
  const versions = Array.isArray(project?.transcriptReview?.versions) ? project.transcriptReview.versions : [];
  return [...versions].reverse().find((version) => (
    version.kind === kind
    && (!sourceVersionId || version.sourceVersionId === sourceVersionId)
  )) || null;
}

function transcriptTimelinePathForVersion(jobDirectory, version) {
  if (!version) return "";
  if (version.timelineRelativePath) return path.join(jobDirectory, version.timelineRelativePath);
  if (version.timelineUrl) {
    const match = String(version.timelineUrl).match(/\/outputs\/jobs\/[a-f0-9-]{36}\/(.+)$/i);
    if (match) {
      try {
        return path.join(jobDirectory, decodeURIComponent(match[1]));
      } catch {
        return "";
      }
    }
  }
  return "";
}

function timelineDurationFromSegments(baseTimeline, baseSegments) {
  const explicitDuration = Number(baseTimeline?.durationSeconds || baseTimeline?.duration || 0);
  if (explicitDuration > 0) return explicitDuration;
  return Math.max(0, ...baseSegments.map((segment) => Number(segment.end) || 0));
}

function timelineLineRanges(baseSegments, lineCount) {
  const sourceCount = baseSegments.length;
  const count = Math.max(0, Number(lineCount) || 0);
  if (!sourceCount || !count) return [];
  return Array.from({ length: count }, (_, lineIndex) => {
    const startIndex = Math.min(sourceCount, Math.round((lineIndex / count) * sourceCount));
    let endIndex = Math.min(sourceCount, Math.round(((lineIndex + 1) / count) * sourceCount));
    if (endIndex <= startIndex && startIndex < sourceCount) endIndex = startIndex + 1;
    const segmentIndexes = [];
    for (let index = startIndex; index < endIndex; index += 1) segmentIndexes.push(index);
    const group = segmentIndexes.map((index) => baseSegments[index]).filter(Boolean);
    const first = group[0];
    const last = group.at(-1);
    return {
      lineIndex,
      segmentIndexes,
      start: Number(first?.start) || 0,
      end: Number(last?.end) || Number(first?.end) || 0
    };
  });
}

function transcriptTimingTokens(value) {
  const rawTokens = String(value || "").match(/[A-Za-z0-9]+(?:['’._/-][A-Za-z0-9]+)*|[\u3400-\u9fff]|[^\s]/gu) || [];
  const tokens = [];
  for (const token of rawTokens) {
    if (/^[，。！？；：、,.!?;:]+$/u.test(token) && tokens.length) {
      tokens[tokens.length - 1] = `${tokens[tokens.length - 1]}${token}`;
    } else {
      tokens.push(token);
    }
  }
  return tokens;
}

function comparableTranscriptToken(token) {
  return String(token || "")
    .replace(/[，。！？；：、,.!?;:「」『』（）()《》〈〉【】\[\]"'“”‘’\s]/gu, "")
    .trim()
    .toLowerCase();
}

function transcriptTokenEditStats(sourceTokens, editedTokens) {
  const sourceComparable = sourceTokens
    .map((token, index) => ({ token: comparableTranscriptToken(token), index }))
    .filter((item) => item.token);
  const editedComparable = editedTokens
    .map(comparableTranscriptToken)
    .filter(Boolean);
  const sourceLength = sourceComparable.length;
  const editedLength = editedComparable.length;
  const distance = Array.from({ length: sourceLength + 1 }, () => Array(editedLength + 1).fill(0));
  const operation = Array.from({ length: sourceLength + 1 }, () => Array(editedLength + 1).fill(""));
  for (let sourceIndex = 1; sourceIndex <= sourceLength; sourceIndex += 1) {
    distance[sourceIndex][0] = sourceIndex;
    operation[sourceIndex][0] = "delete";
  }
  for (let editedIndex = 1; editedIndex <= editedLength; editedIndex += 1) {
    distance[0][editedIndex] = editedIndex;
    operation[0][editedIndex] = "insert";
  }
  for (let sourceIndex = 1; sourceIndex <= sourceLength; sourceIndex += 1) {
    for (let editedIndex = 1; editedIndex <= editedLength; editedIndex += 1) {
      if (sourceComparable[sourceIndex - 1].token === editedComparable[editedIndex - 1]) {
        distance[sourceIndex][editedIndex] = distance[sourceIndex - 1][editedIndex - 1];
        operation[sourceIndex][editedIndex] = "equal";
        continue;
      }
      const replaceCost = distance[sourceIndex - 1][editedIndex - 1] + 1;
      const deleteCost = distance[sourceIndex - 1][editedIndex] + 1;
      const insertCost = distance[sourceIndex][editedIndex - 1] + 1;
      const bestCost = Math.min(replaceCost, deleteCost, insertCost);
      distance[sourceIndex][editedIndex] = bestCost;
      // Prefer replacement over delete+insert so typo fixes keep the original timing instead of cutting the word.
      operation[sourceIndex][editedIndex] = bestCost === replaceCost
        ? "replace"
        : bestCost === deleteCost ? "delete" : "insert";
    }
  }
  const deletedIndexes = [];
  let insertCount = 0;
  let replaceCount = 0;
  let deleteCount = 0;
  let equalCount = 0;
  let sourceIndex = sourceLength;
  let editedIndex = editedLength;
  while (sourceIndex > 0 || editedIndex > 0) {
    const step = operation[sourceIndex]?.[editedIndex] || (sourceIndex > 0 ? "delete" : "insert");
    if (step === "equal") {
      equalCount += 1;
      sourceIndex -= 1;
      editedIndex -= 1;
    } else if (step === "replace") {
      replaceCount += 1;
      sourceIndex -= 1;
      editedIndex -= 1;
    } else if (step === "delete") {
      deleteCount += 1;
      deletedIndexes.push(sourceComparable[sourceIndex - 1].index);
      sourceIndex -= 1;
    } else {
      insertCount += 1;
      editedIndex -= 1;
    }
  }
  return {
    sourceTokenCount: sourceLength,
    editedTokenCount: editedLength,
    equalCount,
    replaceCount,
    deleteCount,
    insertCount,
    deletedIndexes: deletedIndexes.reverse()
  };
}

function deletedTranscriptTokenIndexes(sourceTokens, editedTokens) {
  return transcriptTokenEditStats(sourceTokens, editedTokens).deletedIndexes;
}

function deletedTranscriptWordRanges({ sourceLine = "", editedLine = "", sourceWords = [], lineIndex = 0 }) {
  const sourceTokens = transcriptTimingTokens(sourceLine);
  const editedTokens = transcriptTimingTokens(editedLine);
  if (!sourceTokens.length || !sourceWords.length) return [];
  const deletedIndexes = deletedTranscriptTokenIndexes(sourceTokens, editedTokens);
  const ranges = [];
  let activeRange = null;
  for (const index of deletedIndexes) {
    const word = sourceWords[index];
    if (!word || !(Number(word.end) > Number(word.start))) continue;
    const text = comparableTranscriptToken(word.text || sourceTokens[index]);
    if (!text) continue;
    if (activeRange && word.start <= activeRange.end + 0.06) {
      activeRange.end = Number(Math.max(activeRange.end, word.end).toFixed(3));
      activeRange.duration = Number((activeRange.end - activeRange.start).toFixed(3));
      activeRange.text = `${activeRange.text}${word.text || sourceTokens[index] || ""}`;
    } else {
      activeRange = {
        lineIndex: lineIndex + 1,
        start: Number(word.start.toFixed(3)),
        end: Number(word.end.toFixed(3)),
        duration: Number((word.end - word.start).toFixed(3)),
        source: "transcript-word-delete",
        reason: "逐字稿字詞已刪除",
        text: word.text || sourceTokens[index] || ""
      };
      ranges.push(activeRange);
    }
  }
  return ranges;
}

function transcriptSourceWords(segments) {
  return (Array.isArray(segments) ? segments : [])
    .flatMap((segment) => Array.isArray(segment?.words) ? segment.words : [])
    .map((word) => ({
      start: Number(word?.start),
      end: Number(word?.end),
      text: String(word?.text || "").trim()
    }))
    .filter((word) => Number.isFinite(word.start) && Number.isFinite(word.end) && word.end > word.start && word.text)
    .sort((left, right) => left.start - right.start || left.end - right.end);
}

function transcriptWordBoundaries(sourceWords, start, end) {
  if (!sourceWords.length) return [start, end];
  const boundaries = [Math.max(start, sourceWords[0].start)];
  for (let index = 1; index < sourceWords.length; index += 1) {
    const previous = sourceWords[index - 1];
    const current = sourceWords[index];
    boundaries.push(Math.max(boundaries.at(-1), (previous.end + current.start) / 2));
  }
  boundaries.push(Math.min(end, Math.max(boundaries.at(-1), sourceWords.at(-1).end)));
  return boundaries;
}

function interpolateTranscriptBoundary(boundaries, progress) {
  const maximum = Math.max(1, boundaries.length - 1);
  const position = Math.max(0, Math.min(maximum, Number(progress) || 0));
  const leftIndex = Math.floor(position);
  const rightIndex = Math.min(maximum, Math.ceil(position));
  if (leftIndex === rightIndex) return boundaries[leftIndex];
  const ratio = position - leftIndex;
  return boundaries[leftIndex] + (boundaries[rightIndex] - boundaries[leftIndex]) * ratio;
}

function rebuildTranscriptWords(text, sourceSegments, start, end) {
  const tokens = transcriptTimingTokens(text);
  if (!tokens.length || !(end > start)) return [];
  const sourceWords = transcriptSourceWords(sourceSegments);
  const boundaries = transcriptWordBoundaries(sourceWords, start, end);
  const sourceUnits = Math.max(1, boundaries.length - 1);
  return tokens.map((token, index) => {
    const tokenStart = interpolateTranscriptBoundary(boundaries, (index / tokens.length) * sourceUnits);
    const tokenEnd = interpolateTranscriptBoundary(boundaries, ((index + 1) / tokens.length) * sourceUnits);
    return {
      start: Number(Math.max(start, tokenStart).toFixed(3)),
      end: Number(Math.min(end, Math.max(tokenStart + 0.02, tokenEnd)).toFixed(3)),
      text: token
    };
  });
}

function rootTranscriptSegmentIds(segments, fallbackIndexes = []) {
  return [...new Set((Array.isArray(segments) ? segments : []).flatMap((segment, index) => {
    if (Array.isArray(segment?.sourceSegmentIds) && segment.sourceSegmentIds.length) {
      return segment.sourceSegmentIds;
    }
    if (segment?.sourceSegmentId != null) return [segment.sourceSegmentId];
    if (segment?.id != null) return [segment.id];
    return [Number(fallbackIndexes[index]) + 1];
  }).filter((value) => value != null))];
}

function mappedTranscriptSegment(baseSegments, range, text, index) {
  const group = range.segmentIndexes.map((segmentIndex) => baseSegments[segmentIndex]).filter(Boolean);
  const first = group[0];
  const last = group.at(-1);
  const start = Number(first?.start) || Number(range.start) || 0;
  const end = Number(last?.end) || Number(range.end) || start;
  const sourceSegmentIds = rootTranscriptSegmentIds(group, range.segmentIndexes);
  return {
    ...(first || {}),
    id: index + 1,
    sourceSegmentId: sourceSegmentIds[0] || first?.id || range.segmentIndexes[0] + 1,
    sourceSegmentIds,
    transcriptLineIndex: range.lineIndex + 1,
    start,
    end,
    text,
    words: rebuildTranscriptWords(text, group, start, end)
  };
}

function buildTimelineFromEditedTranscript(baseTimeline, transcriptText, { sourceText = "", preserveKeepRanges = false, trackWordDeletes = false } = {}) {
  const rawLines = rawTranscriptLines(transcriptText);
  const sourceRawLines = rawTranscriptLines(sourceText);
  const lines = rawLines.map((line) => line.trim()).filter(Boolean);
  const cleanText = lines.join("\n");
  const baseSegments = Array.isArray(baseTimeline?.segments) ? baseTimeline.segments : [];
  if (!baseSegments.length) {
    return {
      timeline: {
        ...(baseTimeline || {}),
        text: cleanText.replace(/\s+/g, " ").trim(),
        segments: []
      },
      mappingConfidence: "text-only",
      lineCount: lines.length,
      rawLineCount: rawLines.length
    };
  }

  const sourceLineCount = sourceRawLines.filter((line) => line.trim()).length || splitTranscriptLines(sourceText).length || rawLines.length;
  const blankLineCount = rawLines.filter((line) => !line).length;
  const canMapDeletedLines = rawLines.length === sourceLineCount && (blankLineCount > 0 || trackWordDeletes);
  if (canMapDeletedLines) {
    const duration = timelineDurationFromSegments(baseTimeline, baseSegments);
    const lineRanges = timelineLineRanges(baseSegments, sourceLineCount);
    const mappedSegments = [];
    const mappings = [];
    const keepRanges = [];
    const omittedRanges = [];
    let insertedTokenCount = 0;
    let replacedTokenCount = 0;
    let sourceTokenCount = 0;
    let editedTokenCount = 0;
    for (const range of lineRanges) {
      const mappedText = rawLines[range.lineIndex] || "";
      if (!mappedText) {
        if (range.end > range.start) {
          omittedRanges.push({
            lineIndex: range.lineIndex + 1,
            start: Number(range.start.toFixed(3)),
            end: Number(range.end.toFixed(3)),
            duration: Number((range.end - range.start).toFixed(3)),
            source: "transcript_delete",
            reason: "逐字稿段落已刪空"
          });
        }
        continue;
      }
      if (range.end > range.start) {
        keepRanges.push({
          start: Number(range.start.toFixed(3)),
          end: Number(range.end.toFixed(3)),
          reason: mappedText.slice(0, 80)
        });
      }
      if (trackWordDeletes) {
        const sourceLine = sourceRawLines[range.lineIndex] || "";
        const editStats = transcriptTokenEditStats(
          transcriptTimingTokens(sourceLine),
          transcriptTimingTokens(mappedText)
        );
        insertedTokenCount += editStats.insertCount;
        replacedTokenCount += editStats.replaceCount;
        sourceTokenCount += editStats.sourceTokenCount;
        editedTokenCount += editStats.editedTokenCount;
        const sourceSegment = mappedTranscriptSegment(baseSegments, range, sourceLine, mappedSegments.length);
        omittedRanges.push(...deletedTranscriptWordRanges({
          sourceLine,
          editedLine: mappedText,
          sourceWords: sourceSegment.words,
          lineIndex: range.lineIndex
        }));
      }
      const mappedSegment = mappedTranscriptSegment(baseSegments, range, mappedText, mappedSegments.length);
      mappedSegments.push(mappedSegment);
      mappings.push({
        index: mappedSegments.length,
        sourceSegmentIds: mappedSegment.sourceSegmentIds,
        start: mappedSegment.start,
        end: mappedSegment.end,
        text: mappedText
      });
    }
    const insertedTokenRatio = editedTokenCount ? insertedTokenCount / editedTokenCount : 0;
    // 精華稿允許使用者補 AI 漏掉的字或把未說完的句子收完整。
    // 只在新增幅度大到不像原片原本內容時才標成不可靠，避免粗剪拿不到可信時間碼。
    const safeInsertionLimit = Math.max(24, Math.ceil(editedTokenCount * 0.3));
    const hasUnsafeInsertions = trackWordDeletes && insertedTokenCount > safeInsertionLimit;
    const mappingConfidence = hasUnsafeInsertions ? "line-delete-with-insertions" : "line-delete-exact";
    return {
      timeline: {
        ...(baseTimeline || {}),
        text: mappedSegments.map((segment) => segment.text).filter(Boolean).join(" "),
        segments: mappedSegments,
        transcriptVersionMapping: {
          confidence: mappingConfidence,
          sourceSegmentCount: baseSegments.length,
          sourceLineCount,
          editedLineCount: lines.length,
          rawEditedLineCount: rawLines.length,
          omittedLineCount: omittedRanges.length,
          insertedTokenCount,
          safeInsertionLimit,
          insertedTokenRatio: Number(insertedTokenRatio.toFixed(3)),
          replacedTokenCount
        }
      },
      mappingConfidence,
      lineCount: lines.length,
      rawLineCount: rawLines.length,
      mappings,
      keepRanges: subtractRangesFromKeepRanges(keepRanges, omittedRanges, duration),
      omittedRanges,
      transcriptEditPolicy: trackWordDeletes
        ? hasUnsafeInsertions ? "highlight-has-new-text" : "delete-highlight-words"
        : "delete-empty-lines"
    };
  }

  const fallbackSentences = splitSentences(cleanText).map((line) => line.trim()).filter(Boolean);
  const editableUnits = lines.length ? lines : fallbackSentences;
  const sourceCount = baseSegments.length;
  const targetCount = editableUnits.length;
  const difference = Math.abs(sourceCount - targetCount);
  const tolerance = Math.max(2, Math.ceil(sourceCount * 0.25));
  const mappingConfidence = targetCount === sourceCount
    ? "exact"
    : difference <= tolerance ? "near"
    : "loose";

  const lineRanges = timelineLineRanges(baseSegments, targetCount);
  const mappedSegments = lineRanges.map((range, index) => mappedTranscriptSegment(
    baseSegments,
    range,
    editableUnits[index] || "",
    index
  ));
  const mappings = mappedSegments.map((segment, index) => ({
    index: index + 1,
    sourceSegmentIds: segment.sourceSegmentIds,
    start: segment.start,
    end: segment.end,
    text: segment.text
  }));
  const duration = timelineDurationFromSegments(baseTimeline, baseSegments);
  const keepRanges = preserveKeepRanges
    ? normalizeKeepRanges(mappedSegments.map((segment) => ({
        start: segment.start,
        end: segment.end,
        reason: segment.text.slice(0, 80)
      })), duration)
    : [];

  return {
    timeline: {
      ...(baseTimeline || {}),
      text: mappedSegments.map((segment) => segment.text).filter(Boolean).join(" "),
      segments: mappedSegments,
      transcriptVersionMapping: {
        confidence: mappingConfidence,
        sourceSegmentCount: sourceCount,
        editedLineCount: targetCount
      }
    },
    mappingConfidence,
    lineCount: targetCount,
    rawLineCount: rawLines.length,
    mappings,
    keepRanges
  };
}

function proofreadTranscriptText(text, { context = "" } = {}) {
  const sourceText = normalizeTranscriptText(text);
  const protectedTerms = String(context || "")
    .split(/[、,\n，;；：:]+/)
    .map((term) => term.replace(/\s+/g, " ").trim())
    .filter((term) => term.length >= 2)
    .slice(0, 80);
  const replacements = [
    [/竹子稿|竹字稿|主字稿|逐字搞|逐子稿|逐字剛|逐字鋼/g, "逐字稿"],
    [/轉路|轉入|轉鹿|轉盧/g, "轉錄"],
    [/金華/g, "精華"],
    [/教稿|較稿|叫稿|校搞/g, "校稿"],
    [/遠版|原石稿|原始搞|原始剛|原版/g, "原始稿"],
    [/修正版?本/g, "修正版"],
    [/誠片|程片/g, "成片"],
    [/簡報檔案|簡報稿/g, "簡報"],
    [/字幕燒上去|燒去|燒進去/g, "燒錄"],
    [/屎用者|使用著|使使用者/g, "使用者"],
    [/須要|續要/g, "需要"],
    [/沒辦發/g, "沒辦法"],
    [/無發/g, "無法"],
    [/辦發/g, "辦法"],
    [/黑瓶/g, "黑屏"],
    [/選像|選相/g, "選項"],
    [/正和|整和/g, "整合"],
    [/剪輯軟的/g, "剪輯軟體"],
    [/辦辦公室/g, "辦公室"],
    [/基湯/g, "雞湯"],
    [/必需要/g, "必須要"],
    [/義如既往|一如既望/g, "一如既往"],
    [/反思反思/g, "反思"],
    [/因為為什麼因為/g, "原因是"],
    [/Q([1-4])\s*Q([1-4])/gi, "Q$1、Q$2"],
    [/(Q1、Q2[^。！？!?]{0,24})單季/g, "$1淡季"],
    [/B\s*[- ]?\s*roll|Ｂ\s*[- ]?\s*ＲＯＬＬ/gi, "B-roll"],
    [/\bai\b|ＡＩ/gi, "AI"],
    [/\bppt\b|ＰＰＴ/gi, "PPT"],
    [/\bpdf\b|ＰＤＦ/gi, "PDF"],
    [/\bmp4\b|ＭＰ４/gi, "MP4"]
  ];
  const fillerPatterns = [
    [/(^|[，,。！？!?；;、\s])(嗯+|呃+|痾+|額+|啊+|欸+|誒+)(?=([，,。！？!?；;、\s]|$))/g, (_match, prefix = "") => prefix || ""],
    [/(^|[，,。！？!?；;])\s*(我跟你講|講白一點|說真的|坦白講|老實說|基本上|某種程度上|應該說|怎麼講|你知道嗎?|那個|這個|就是|其實)[，,、\s]+/g, (_match, prefix = "") => prefix || ""],
    [/[，,、\s]*(對不對|是不是|你知道嗎?|這樣子|之類的|對吧|對嗎)\s*(?=([。！？!?；;]|$))/g, () => ""],
    [/^(我跟你講|講白一點|說真的|坦白講|老實說|基本上|某種程度上|應該說|怎麼講|你知道嗎?|那個|這個|就是|其實)[，,、\s]*/g, () => ""]
  ];
  const naturalRewritePatterns = [
    [/有辦法可以/g, "可以"],
    [/可以去/g, "可以"],
    [/會去/g, "會"],
    [/要去/g, "要"],
    [/去做/g, "做"],
    [/做一個([^，。！？!?；;]{1,16})的動作/g, "做$1"],
    [/做([^，。！？!?；;]{1,18})的動作/g, "做$1"],
    [/進行一個([^，。！？!?；;]{1,16})/g, "進行$1"],
    [/這件事情/g, "這件事"],
    [/的部分(?=，|。|！|？|!|\?|；|;|$)/g, ""],
    [/的話(?=，|。|！|？|!|\?|；|;|$)/g, ""],
    [/，?就[。！？!?]$/g, "。"],
    [/也是其實也是/g, "其實也"],
    [/，?那有些/g, "。有些"],
    [/，?那要看/g, "，要看"],
    [/，?那我們/g, "。我們"]
  ];
  const parallelSpeechPatterns = [
    [/每年就每次/g, "每年"],
    [/有些是([^，。！？!?；;]{1,32})有些是/g, "有些是$1，有些是"],
    [/一個是([^，。！？!?；;]{1,32})一個是/g, "一個是$1，一個是"],
    [/([^，。！？!?；;]{2,24})比較([^，。！？!?；;]{2,24})比較/g, "$1比較$2，比較"],
    [/一年一度([^，。！？!?；;]{0,32})一年一度/g, "一年一度$1"],
    [/一如既往(?=是這一本書|這本書|我本來)/g, "《一如既往》"],
    [/逆思維(?=，|。|！|？|!|\?|$)/g, "《逆思維》"],
    [/一年十二週(?=就|，|。|！|？|!|\?|$)/g, "《一年十二週》"]
  ];
  const fillerOnlyClausePattern = /^(我跟你講|講白一點|說真的|坦白講|老實說|基本上|某種程度上|應該說|怎麼講|你知道嗎?|你知道|那個|這個|就是|其實|然後|好|對|嗯+|呃+|痾+|額+|啊+|欸+|誒+|啦|嘛|齁)+$/;
  const repeatedFillerPattern = /(我跟你講|講白一點|說真的|坦白講|老實說|基本上|某種程度上|應該說|怎麼講|你知道嗎?|那個|這個|就是|其實|然後|嗯|呃|啊)(?:[，,、\s]*\1)+/g;
  const repeatedPhrasePattern = /([\u4e00-\u9fffA-Za-z0-9]{2,8})(?:[，,、\s]+\1){1,}/g;
  const repeatedStutterPattern = /(^|[，,、\s])(我|你|他|她|它|這|那|是|會|要|有|可以|如果|所以)(?:[，,、\s]*\2)+(?=[\u4e00-\u9fffA-Za-z0-9])/g;
  const repeatedActionWordPattern = /(可以|需要|應該|必須|不用|不要|不能|無法|會|要|有|沒有)(?:[，,、\s]*\1)+/g;
  const applyTermReplacements = (value) => {
    let output = String(value || "");
    for (const [pattern, replacement] of replacements) output = output.replace(pattern, replacement);
    return output;
  };
  const restoreProtectedTerms = (value) => {
    let output = String(value || "");
    for (const term of protectedTerms) {
      const compactTerm = term.replace(/\s+/g, "");
      if (compactTerm && output.includes(compactTerm)) output = output.replaceAll(compactTerm, term);
    }
    return output;
  };
  const finishProofreadPunctuation = (value) => {
    const output = String(value || "").replace(/\s+/g, " ").trim();
    if (!output) return "";
    if (/[。！？!?]$/.test(output)) return output;
    const questionTail = output.replace(/[，,、；;：:\s]+$/g, "");
    return /(?:嗎|呢|為什麼|怎麼|誰|哪(?:裡|個|一)|是否|有沒有|是不是|對不對|好不好)$/.test(questionTail)
      ? `${questionTail}？`
      : `${output}。`;
  };
  const applyParallelSpeechRepairs = (value) => {
    let output = String(value || "");
    for (const [pattern, replacement] of parallelSpeechPatterns) output = output.replace(pattern, replacement);
    return output;
  };
  const normalizeProofreadLine = (value) => {
    let output = String(value || "")
      .replace(/\s+/g, " ")
      .replace(/[，,]\s*/g, "，")
      .replace(/[。\.]\s*/g, "。")
      .replace(/[？！]\s*/g, (match) => match.trim())
      .trim();
    output = restoreProtectedTerms(applyParallelSpeechRepairs(applyTermReplacements(output)));
    return finishProofreadPunctuation(output);
  };
  const conservativeProofreadText = () => splitTranscriptLines(text)
    .flatMap((line) => splitSentences(line).length ? splitSentences(line) : [line])
    .map((line) => normalizeProofreadLine(
      applyTermReplacements(line)
        .replace(repeatedStutterPattern, "$1$2")
        .replace(repeatedActionWordPattern, "$1")
        .replace(/(^|[，,。！？!?；;、\s])(嗯+|呃+|痾+|額+|啊+|欸+|誒+)(?=([，,。！？!?；;、\s]|$))/g, "$1")
        .replace(/，{2,}/g, "，")
        .replace(/。{2,}/g, "。")
    ))
    .filter(Boolean)
    .join("\n");
  const removeFillerOnlyClauses = (value) => {
    const clauses = String(value || "")
      .split(/[，,、；;]+/)
      .map((clause) => clause.replace(/\s+/g, " ").trim())
      .filter((clause) => {
        const compact = clause.replace(/[。！？!?\s]/g, "");
        return compact && !fillerOnlyClausePattern.test(compact);
      });
    return clauses.join("，");
  };
  const polishSpokenFlow = (value) => {
    let output = String(value || "")
      .replace(/^(那所以|所以說)[，,、\s]*/g, "所以")
      .replace(/^那如果[，,、\s]*/g, "如果")
      .replace(/^那我[，,、\s]*/g, "我")
      .replace(/^那我們[，,、\s]*/g, "我們")
      .replace(/^(那個|這個|就是|其實|然後)(?=[\u4e00-\u9fffA-Za-z0-9])/g, "")
      .replace(/[，,、]\s*(那個|這個|就是|其實)(?=[\u4e00-\u9fffA-Za-z0-9])/g, "，")
      .replace(/[，,、]\s*然後(?=[\u4e00-\u9fffA-Za-z0-9])/g, "，")
      .replace(/(其實|就是)(?=(可以|會|是|要|不用|不需要|沒有|不能|無法))/g, "")
      .replace(/[，,、]\s*(那所以|所以說)\s*/g, "，所以")
      .replace(/[，,、]\s*那如果\s*/g, "，如果")
      .replace(/[，,、]\s*(然後|就是|其實)\s*(?=[，,、])/g, "，");
    for (const [pattern, replacement] of naturalRewritePatterns) output = output.replace(pattern, replacement);
    return output;
  };
  const removeAdjacentDuplicateClauses = (value) => {
    const clauses = String(value || "").match(/[^，。！？!?；;]+[，。！？!?；;]?/g) || [];
    const output = [];
    let previousKey = "";
    for (const clause of clauses) {
      const key = clause
        .replace(/[，,。！？!?；;、\s]/g, "")
        .replace(/^(我跟你講|講白一點|說真的|坦白講|老實說|基本上|某種程度上|應該說|怎麼講|你知道嗎?|那個|這個|就是|其實|然後)+/, "")
        .replace(/(的部分|的話|這樣子|之類的)$/, "")
        .trim();
      if (key && key === previousKey) continue;
      output.push(clause);
      if (key) previousKey = key;
    }
    return output.join("");
  };
  const lines = splitTranscriptLines(text)
    .flatMap((line) => splitSentences(line).length ? splitSentences(line) : [line])
    .map((line) => {
      let cleaned = line
        .replace(/\s+/g, " ")
        .replace(/[，,]\s*/g, "，")
        .replace(/[。\.]\s*/g, "。")
        .replace(/[？！]\s*/g, (match) => match.trim())
        .trim();
      cleaned = applyTermReplacements(cleaned);
      cleaned = cleaned
        .replace(repeatedFillerPattern, "$1")
        .replace(repeatedPhrasePattern, "$1")
        .replace(repeatedStutterPattern, "$1$2")
        .replace(repeatedActionWordPattern, "$1");
      for (const [pattern, replacer] of fillerPatterns) cleaned = cleaned.replace(pattern, replacer);
      cleaned = polishSpokenFlow(cleaned);
      cleaned = applyParallelSpeechRepairs(cleaned);
      cleaned = removeFillerOnlyClauses(cleaned);
      cleaned = removeAdjacentDuplicateClauses(cleaned)
        .replace(/，{2,}/g, "，")
        .replace(/。{2,}/g, "。")
        .replace(/^[，,、\s]+|[，,、\s]+$/g, "")
        .trim();
      cleaned = restoreProtectedTerms(cleaned);
      return finishProofreadPunctuation(cleaned);
    })
    .filter(Boolean);
  const polished = lines.join("\n");
  const compressionRatio = sourceText.length
    ? normalizeTranscriptText(polished).length / sourceText.length
    : 1;
  if (sourceText.length >= 180 && compressionRatio < 0.68) {
    return conservativeProofreadText();
  }
  return polished;
}

function highlightSentenceKey(sentence) {
  return String(sentence || "")
    .replace(/[，,。！？!?；;、\s「」『』()（）]/g, "")
    .replace(/^(我覺得|我認為|我希望|我想要|我要|我們覺得|我們希望|我們想要|大家可以看到|你可以看到|可以看到|所以|但是|如果|因為|再來是|再來|接下來|最後)+/, "")
    .replace(/(的部分|的話|這件事情|這件事|這樣子|之類的)$/g, "")
    .trim();
}

function isLowValueHighlightSentence(sentence) {
  const compact = highlightSentenceKey(sentence);
  if (compact.length < 8) return true;
  if (/^(好的|好|沒錯|對|不是|有|沒有|可以|了解|謝謝|以上)$/.test(compact)) return true;
  if (/^(我問你|我跟你講|大家知道嗎|你知道嗎)$/.test(compact)) return true;
  return false;
}

function condenseHighlightSentence(sentence) {
  let output = String(sentence || "")
    .replace(/\s+/g, " ")
    .replace(/^(首先|再來是|再來|接下來|最後|然後|所以說|那所以)[，,、\s]*/g, "")
    .replace(/^(我覺得|我認為|我希望|我想要|我要|我們覺得|我們希望|我們想要)(?=[\u4e00-\u9fffA-Za-z0-9])/g, "")
    .replace(/[，,、]\s*(也就是說|換句話說|簡單來說|簡單講)\s*/g, "，")
    .replace(/我們可以看到/g, "可以看到")
    .replace(/大家可以看到/g, "可以看到")
    .replace(/這個東西/g, "這件事")
    .replace(/這件事情/g, "這件事")
    .replace(/的部分(?=，|。|！|？|!|\?|；|;|$)/g, "")
    .replace(/的話(?=，|。|！|？|!|\?|；|;|$)/g, "")
    .replace(/，{2,}/g, "，")
    .replace(/^[，,、\s]+|[，,、\s]+$/g, "")
    .trim();
  if (output && !/[。！？!?]$/.test(output)) output = `${output}。`;
  return output;
}

function dedupeHighlightSentences(sentences) {
  const output = [];
  const seenKeys = [];
  for (const sentence of sentences) {
    const key = highlightSentenceKey(sentence);
    if (!key) continue;
    const repeated = seenKeys.some((seen) => (
      key === seen
      || key.includes(seen)
      || seen.includes(key)
      || (key.length >= 12 && seen.length >= 12 && key.slice(0, 12) === seen.slice(0, 12))
    ));
    if (repeated) continue;
    seenKeys.push(key);
    output.push(sentence);
  }
  return output;
}

function dedupeHighlightItems(items) {
  const output = [];
  const seenKeys = [];
  for (const item of items) {
    const key = highlightSentenceKey(item?.sentence || "");
    if (!key) continue;
    const repeated = seenKeys.some((seen) => (
      key === seen
      || key.includes(seen)
      || seen.includes(key)
      || (key.length >= 12 && seen.length >= 12 && key.slice(0, 12) === seen.slice(0, 12))
    ));
    if (repeated) continue;
    seenKeys.push(key);
    output.push(item);
  }
  return output;
}

const HIGHLIGHT_CONTENT_ROLE_RULES = [
  {
    role: "problem",
    score: 4.2,
    pattern: /問題|痛點|現實|景氣|市場.*差|天花板|縮減|成本|壓力|很難|賺不到|不可能|不划算|不值得|勞務報酬|為什麼|到底/
  },
  {
    role: "cause",
    score: 3.4,
    pattern: /因為|原因|所以|導致|取決於|本質|關鍵在|核心在|其實是|不是.*而是/
  },
  {
    role: "contrast",
    score: 3.2,
    pattern: /但是|不過|可是|反而|要嘛|還是|從.*變成|不是.*是|相比|差別|相對/
  },
  {
    role: "example",
    score: 3.8,
    pattern: /舉例|例子|例如|假設|比方|以.*來講|有一個|案子|客戶|老師|課程|素材|執行|合作/
  },
  {
    role: "solution",
    score: 4.4,
    pattern: /方法|做法|建議|可以|應該|需要|必須|改變|突破|商業模式|商業思維|計畫|分潤|打造|轉換|賺計畫的錢/
  },
  {
    role: "conclusion",
    score: 4,
    pattern: /結論|總結|最後|核心|重點|關鍵|聽完|還想|告訴你|下一集|所以你|這就是|這不就/
  },
  {
    role: "authority",
    score: 2.2,
    pattern: /我是|我們公司|做這一行|第\s*[0-9一二三四五六七八九十百千萬]+\s*年|經驗|案例/
  }
];

function highlightContentRoles(text = "") {
  return HIGHLIGHT_CONTENT_ROLE_RULES
    .filter((rule) => rule.pattern.test(String(text || "")))
    .map((rule) => rule.role);
}

function highlightContentRoleScore(text = "") {
  const value = String(text || "");
  return HIGHLIGHT_CONTENT_ROLE_RULES.reduce((total, rule) => (
    total + (rule.pattern.test(value) ? rule.score : 0)
  ), 0);
}

function addRoleCoverageItems(items, selectedByIndex, target) {
  const source = Array.isArray(items) ? items.filter((item) => item?.sentence) : [];
  if (!source.length || selectedByIndex.size >= target) return;
  const requiredRoles = ["problem", "cause", "contrast", "example", "solution", "conclusion"];
  for (const role of requiredRoles) {
    if (selectedByIndex.size >= target) break;
    const alreadyCovered = [...selectedByIndex.values()].some((item) => item.roles?.includes(role));
    if (alreadyCovered) continue;
    const best = source
      .filter((item) => item.roles?.includes(role))
      .sort((left, right) => right.score - left.score || left.index - right.index)[0];
    if (best) selectedByIndex.set(best.index, best);
  }
}

function isDanglingHighlightSegment(text = "") {
  const compact = String(text || "").replace(/\s+/g, "").trim();
  if (!compact) return true;
  if (/(如果|假設|因為|所以|但是|不過|可是|然後|接下來|之後|那接下來|想說|告訴你|應該|的話|然後呢|接下來呢)[。！？!?…⋯]*$/u.test(compact)) return true;
  if (/[，,、：:；;]$/u.test(compact)) return true;
  return false;
}

function startsWithDependentHighlightSegment(text = "") {
  return /^(才|所以|因此|然後|接著|但是|不過|可是|那|這樣|這就是|如果|因為|對啊|好)[，,、\s]*/u.test(String(text || "").trim());
}

function highlightSegmentCompletenessPenalty(text = "") {
  let penalty = 0;
  if (isDanglingHighlightSegment(text)) penalty -= 7;
  if (startsWithDependentHighlightSegment(text)) penalty -= 1.6;
  if (isLowValueHighlightSentence(text)) penalty -= 4;
  return penalty;
}

function expandHighlightIndexesForCompleteIdeas(segments, selectedIndexes, target) {
  const source = Array.isArray(segments) ? segments : [];
  const selected = new Set([...selectedIndexes].filter((index) => index >= 0 && index < source.length));
  const baselineSize = selected.size;
  const maxSize = Math.min(source.length, Math.max(target + 4, Math.ceil(target * 1.35)));
  for (const index of [...selected].sort((left, right) => left - right)) {
    if (startsWithDependentHighlightSegment(source[index]?.text || "") && index > 0 && selected.size < maxSize) {
      selected.add(index - 1);
    }
    let cursor = index;
    let combinedText = source[cursor]?.text || "";
    while (isDanglingHighlightSegment(combinedText) && cursor + 1 < source.length && selected.size < maxSize) {
      cursor += 1;
      selected.add(cursor);
      combinedText = `${combinedText}${source[cursor]?.text || ""}`;
    }
  }
  if (selected.size === baselineSize) return selected;
  return new Set([...selected].sort((left, right) => left - right));
}

function trimHighlightIndexesByMainline(segments, selectedIndexes, scoredByIndex, target) {
  const source = Array.isArray(segments) ? segments : [];
  const indexes = [...selectedIndexes].filter((index) => index >= 0 && index < source.length);
  if (indexes.length <= target) return new Set(indexes);
  const required = new Map();
  const selectedItems = indexes.map((index) => ({
    index,
    segment: source[index],
    score: scoredByIndex.get(index)?.score || 0,
    roles: scoredByIndex.get(index)?.roles || highlightContentRoles(source[index]?.text || "")
  }));
  const opening = selectedItems.find((item) => item.index <= Math.max(1, Math.floor(source.length * 0.18))) || selectedItems[0];
  const closing = [...selectedItems].reverse().find((item) => item.roles.includes("conclusion") || /聽完|告訴我|商業思維|結論|最後|所以你|至少|天花板/.test(item.segment?.text || ""))
    || selectedItems.at(-1);
  if (opening) required.set(opening.index, opening);
  if (closing) required.set(closing.index, closing);
  for (const role of ["problem", "cause", "example", "solution", "conclusion"]) {
    if (required.size >= target) break;
    const best = selectedItems
      .filter((item) => item.roles.includes(role))
      .sort((left, right) => right.score - left.score || left.index - right.index)[0];
    if (best) required.set(best.index, best);
  }
  const filler = selectedItems
    .filter((item) => !required.has(item.index))
    .sort((left, right) => right.score - left.score || left.index - right.index);
  for (const item of filler) {
    if (required.size >= target) break;
    required.set(item.index, item);
  }
  return new Set([...required.keys()].sort((left, right) => left - right));
}

function spreadHighlightItems(items, target) {
  const candidates = Array.isArray(items) ? items.filter((item) => item?.sentence) : [];
  if (candidates.length <= target) return candidates;
  if (target <= 1) return [candidates[0]];
  const byIndex = [...candidates].sort((left, right) => left.index - right.index);
  const selected = new Map();
  selected.set(byIndex[0].index, byIndex[0]);
  selected.set(byIndex.at(-1).index, byIndex.at(-1));
  for (const item of candidates) {
    if (selected.size >= target) break;
    selected.set(item.index, item);
  }
  return [...selected.values()].sort((left, right) => left.index - right.index);
}

function pickHighlightClosingItem(items) {
  const candidates = Array.isArray(items) ? items.filter((item) => item?.sentence) : [];
  return [...candidates].reverse().find((item) => (
    /所以|總結|最後|結論|核心|重點|必須|需要|可以|應該|不能|不要|關鍵|目的/.test(item.sentence)
  )) || candidates.at(-1) || null;
}

function verifyHighlightContinuity(sourceItems, selectedItems) {
  const source = Array.isArray(sourceItems) ? sourceItems.filter((item) => item?.sentence) : [];
  const selected = Array.isArray(selectedItems) ? selectedItems.filter((item) => item?.sentence) : [];
  if (!source.length || !selected.length) return false;
  if (source.length <= 2) return selected.length >= 1;
  const firstIndex = Math.min(...selected.map((item) => item.index));
  const lastIndex = Math.max(...selected.map((item) => item.index));
  const hasOpening = firstIndex <= Math.max(1, Math.floor(source.length * 0.34));
  const hasClosing = lastIndex >= Math.max(source.length - 2, Math.floor(source.length * 0.66));
  const hasEnoughBody = selected.length >= Math.min(3, source.length);
  return hasOpening && hasClosing && hasEnoughBody;
}

function repairHighlightContinuity(sourceItems, selectedItems, target) {
  const source = Array.isArray(sourceItems) ? sourceItems.filter((item) => item?.sentence) : [];
  const selected = Array.isArray(selectedItems) ? selectedItems.filter((item) => item?.sentence) : [];
  if (!source.length) return selected;
  const opening = source[0];
  const closing = pickHighlightClosingItem(source);
  const selectedByIndex = new Map();
  if (opening) selectedByIndex.set(opening.index, opening);
  addRoleCoverageItems(source, selectedByIndex, Math.max(1, target - (closing ? 1 : 0)));
  for (const item of selected) {
    if (selectedByIndex.size >= Math.max(1, target - (closing ? 1 : 0))) break;
    selectedByIndex.set(item.index, item);
  }
  if (closing) selectedByIndex.set(closing.index, closing);
  const filler = [...source].sort((left, right) => right.score - left.score);
  for (const item of filler) {
    if (selectedByIndex.size >= target) break;
    selectedByIndex.set(item.index, item);
  }
  return [...selectedByIndex.values()].sort((left, right) => left.index - right.index).slice(0, target);
}

function highlightTranscriptText(text, { context = "", outline = [], targetCount = 0 } = {}) {
  const polished = proofreadTranscriptText(text, { context });
  const sentences = splitTranscriptLines(polished)
    .flatMap((line) => {
      const parts = splitSentences(line);
      return parts.length ? parts : [line];
    })
    .map((sentence) => sentence.replace(/\s+/g, " ").trim())
    .filter((sentence, index, all) => sentence.length >= 4 && all.indexOf(sentence) === index)
    .filter((sentence) => !isLowValueHighlightSentence(sentence));
  if (!sentences.length) return "";

  const outlineText = (Array.isArray(outline) ? outline : [])
    .flatMap((item) => [item.title, item.summary, ...(item.bullets || [])])
    .join(" ");
  const contextKeywords = `${outlineText}\n${context}\n${polished}`
    .split(/[\s，。,.、：:；;!?！？「」『』()（）]+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 2)
    .slice(0, 220);
  const keywordSet = new Set(contextKeywords);
  const requested = Number(targetCount);
  const automaticTarget = sentences.length <= 2
    ? sentences.length
    : sentences.length <= 4 ? Math.min(3, sentences.length) : Math.max(4, Math.ceil(sentences.length * 0.38));
  const requestedTarget = requested > 0
    ? Math.min(requested, Math.ceil(sentences.length * 0.45))
    : automaticTarget;
  const target = Math.max(1, Math.min(10, requestedTarget || automaticTarget, sentences.length));
  const scored = sentences.map((sentence, index) => {
    const keywordHits = [...keywordSet].reduce((total, keyword) => total + (sentence.includes(keyword) ? 1 : 0), 0);
    const structureScore = /重點|核心|關鍵|因為|所以|但是|如果|問題|方法|結論|必須|可以|需要|不過|首先|最後|目的|原因|風險|成本|效率/.test(sentence) ? 3.5 : 0;
    const contentRoleScore = highlightContentRoleScore(sentence);
    const roles = highlightContentRoles(sentence);
    const detailScore = /[0-9一二三四五六七八九十百千萬億年月日%％]/.test(sentence) ? 1.6 : 0;
    const lengthScore = sentence.length >= 14 && sentence.length <= 75 ? 2.2 : 0.4;
    const positionScore = index === sentences.length - 1 ? 1.4 : index === 0 ? 1.1 : 0;
    const fillerPenalty = /我覺得|我認為|我希望|我想要|大家知道|你知道|就是|其實|然後/.test(sentence) ? -1.2 : 0;
    return {
      index,
      sentence,
      roles,
      score: keywordHits * 0.45 + structureScore + contentRoleScore + detailScore + lengthScore + positionScore + fillerPenalty
    };
  });
  const fullItems = scored
    .map((item) => ({
      ...item,
      sentence: condenseHighlightSentence(item.sentence)
    }))
    .filter((item) => item.sentence);
  const openingItem = fullItems[0] || null;
  const closingItem = pickHighlightClosingItem(fullItems);
  const candidateItems = scored
    .sort((left, right) => right.score - left.score)
    .slice(0, Math.min(sentences.length, target + 4))
    .map((item) => ({
      ...item,
      sentence: condenseHighlightSentence(item.sentence)
    }))
    .filter((item) => item.sentence);
  let selected = spreadHighlightItems(dedupeHighlightItems([openingItem, ...candidateItems, closingItem].filter(Boolean)), target);
  const selectedByIndex = new Map(selected.map((item) => [item.index, item]));
  addRoleCoverageItems(fullItems, selectedByIndex, target);
  selected = [...selectedByIndex.values()].sort((left, right) => left.index - right.index).slice(0, target);
  if (!verifyHighlightContinuity(fullItems, selected)) {
    selected = repairHighlightContinuity(fullItems, selected, target);
  }
  return selected
    .map((item) => item.sentence)
    .join("\n");
}

const VERBATIM_HIGHLIGHT_ARC_RULES = [
  {
    role: "topic",
    patterns: [/影像拍攝.*賺不賺/u, /攝影行業.*賺不賺/u, /投入.*攝影行業/u],
    prefer: [/越來越多人投入/u, /請三思/u, /第\s*[0-9一二三四五六七八九十]+\s*年/u]
  },
  {
    role: "advice",
    patterns: [/良心.*建議/u, /提早佈局/u, /勞務報酬.*盡量少做/u, /不要一直用時間.*換金錢/u],
    prefer: [/良心.*建議/u, /不要一直用時間/u]
  },
  {
    role: "sales",
    patterns: [/用銷售.*換金錢/u, /靠銷售.*賺錢/u],
    prefer: [/攝影行業.*靠銷售/u]
  },
  {
    role: "ceiling",
    patterns: [/天花板/u, /賺到兩倍/u, /三倍五倍/u, /不可能賺超過/u],
    prefer: [/天花板/u, /不可能賺超過/u, /三倍五倍/u]
  },
  {
    role: "compression",
    patterns: [/縮減費用/u, /縮減人力/u, /縮減時間/u, /減法型.*案子/u],
    prefer: [/縮減費用.*縮減人力.*縮減時間/u, /減法型.*少碰/u]
  },
  {
    role: "solution",
    patterns: [/新的商業思維/u, /跟著計畫做/u, /賺計畫的錢/u, /不要一個一個案子接/u],
    prefer: [/新的商業思維/u, /跟著計畫做/u]
  },
  {
    role: "payoff",
    patterns: [/課程商品/u, /沒有天花板/u, /本來的收入/u, /變成.*萬塊/u, /聽完.*商業思維/u],
    prefer: [/本來的收入/u, /變成.*萬塊/u, /聽完.*商業思維/u, /沒有天花板/u]
  }
];

function verbatimHighlightSentenceItems(text = "") {
  const seen = new Set();
  return splitTranscriptLines(text)
    .flatMap((line) => {
      const sentences = splitSentences(line);
      return sentences.length ? sentences : [line];
    })
    .map((sentence, index) => ({
      index,
      sentence: String(sentence || "").replace(/\s+/g, " ").trim()
    }))
    .filter((item) => {
      if (!item.sentence || item.sentence.length < 5 || isLowValueHighlightSentence(item.sentence)) return false;
      const key = highlightSentenceKey(item.sentence);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function scoreVerbatimHighlightArcItem(item, rule, allItems) {
  const text = item?.sentence || "";
  const roleScore = rule.patterns.some((pattern) => pattern.test(text)) ? 20 : 0;
  if (!roleScore) return -Infinity;
  const preferenceScore = rule.prefer.reduce((total, pattern) => total + (pattern.test(text) ? 7 : 0), 0);
  const authorityScore = /第\s*[0-9一二三四五六七八九十]+\s*年|我們公司|經驗/u.test(text) ? 2 : 0;
  const concreteScore = /[0-9一二三四五六七八九十百千萬億]/u.test(text) ? 1.5 : 0;
  const length = text.length;
  const lengthScore = length >= 16 && length <= 95 ? 3 : length > 120 ? -2 : 0.8;
  const positionRatio = allItems.length ? item.index / allItems.length : 0;
  const rolePositionScore = rule.role === "topic"
    ? (positionRatio < 0.28 ? 4 : 0)
    : rule.role === "payoff"
      ? (positionRatio > 0.72 ? 4 : 0)
      : 0;
  const weakPenalty = /^(大家好|看我|所以這個問題來問我|那要從哪裡講起|我覺得|對啊)[，,、\s]*/u.test(text) ? -8 : 0;
  return roleScore + preferenceScore + authorityScore + concreteScore + lengthScore + rolePositionScore + weakPenalty;
}

function pickVerbatimHighlightArcItem(items, rule, usedIndexes, { minimumIndex = 0 } = {}) {
  if (rule.role === "advice") {
    const directAdvice = items.find((item) => (
      !usedIndexes.has(item.index)
      && item.index >= minimumIndex
      && /良心.*建議|提早佈局/u.test(item.sentence || "")
    ));
    if (directAdvice) return { ...directAdvice, score: 999 };
  }
  if (rule.role === "compression") {
    const compressionSummary = items.find((item) => (
      !usedIndexes.has(item.index)
      && item.index >= minimumIndex
      && /縮減費用.*縮減人力.*縮減時間/u.test(item.sentence || "")
    ));
    if (compressionSummary) return { ...compressionSummary, score: 999 };
  }
  return items
    .filter((item) => !usedIndexes.has(item.index) && item.index >= minimumIndex)
    .map((item) => ({ ...item, score: scoreVerbatimHighlightArcItem(item, rule, items) }))
    .filter((item) => Number.isFinite(item.score))
    .sort((left, right) => right.score - left.score || left.index - right.index)[0] || null;
}

function relatedVerbatimHighlightItems(items, selected, rule, usedIndexes) {
  const output = [];
  if (!selected) return output;
  const nextItems = items.filter((item) => item.index > selected.index && item.index <= selected.index + 2);
  for (const item of nextItems) {
    if (usedIndexes.has(item.index)) continue;
    const text = item.sentence || "";
      const shouldAdd = (
        (rule.role === "advice" && /不要一直用時間.*換金錢|勞務報酬.*盡量少做/u.test(text))
      || (rule.role === "compression" && /縮減人力|縮減時間|減法型.*少碰|完全壓縮|賺不到什麼錢/u.test(text))
      || (rule.role === "solution" && /不要一個一個案子接|賺計畫的錢/u.test(text))
      || (rule.role === "payoff" && /沒有天花板|本來的收入|聽完.*商業思維/u.test(text))
    );
    if (shouldAdd) output.push(item);
  }
  return output.slice(0, rule.role === "payoff" ? 2 : 1);
}

function extractVerbatimHighlightText(text, { targetCount = 7 } = {}) {
  const items = verbatimHighlightSentenceItems(text);
  if (!items.length) return "";
  const usedIndexes = new Set();
  const selectedGroups = [];
  let minimumIndex = 0;
  for (const rule of VERBATIM_HIGHLIGHT_ARC_RULES) {
    const picked = pickVerbatimHighlightArcItem(items, rule, usedIndexes, { minimumIndex });
    if (!picked) continue;
    if (rule.role === "topic") minimumIndex = picked.index;
    const group = [picked];
    usedIndexes.add(picked.index);
    for (const related of relatedVerbatimHighlightItems(items, picked, rule, usedIndexes)) {
      usedIndexes.add(related.index);
      group.push(related);
    }
    selectedGroups.push(group.sort((left, right) => left.index - right.index));
  }
  const maxGroups = Math.max(3, Math.min(Number(targetCount) || 7, VERBATIM_HIGHLIGHT_ARC_RULES.length));
  const groups = selectedGroups.length
    ? selectedGroups
    : spreadHighlightItems(dedupeHighlightItems(
        items
          .map((item) => ({
            ...item,
            roles: highlightContentRoles(item.sentence),
            score: highlightContentRoleScore(item.sentence)
              + (/[0-9一二三四五六七八九十百千萬億年月日%％]/u.test(item.sentence) ? 1.4 : 0)
              + (item.index === 0 ? 1.2 : 0)
          }))
          .sort((left, right) => right.score - left.score || left.index - right.index)
      ), maxGroups).map((item) => [item]);
  return groups
    .sort((left, right) => left[0].index - right[0].index)
    .slice(0, maxGroups)
    .map((group) => group.map((item) => item.sentence).join("\n"))
    .join("\n\n");
}

function normalizeKeepRanges(ranges, durationSeconds, { mergeGapSeconds = 0.2 } = {}) {
  const duration = Number(durationSeconds) || 0;
  const mergeGap = Math.max(0, Number(mergeGapSeconds) || 0);
  const normalized = (Array.isArray(ranges) ? ranges : [])
    .map((range) => {
      const start = Math.max(0, Number(range.start) || 0);
      const rawEnd = Number(range.end);
      const end = Math.min(duration || rawEnd || start, Number.isFinite(rawEnd) ? rawEnd : start);
      if (!(end > start)) return null;
      return {
        ...range,
        start: Number(start.toFixed(3)),
        end: Number(end.toFixed(3)),
        duration: Number((end - start).toFixed(3))
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.start - right.start);
  const merged = [];
  for (const range of normalized) {
    const previous = merged.at(-1);
    if (previous && range.start <= previous.end + mergeGap) {
      previous.end = Number(Math.max(previous.end, range.end).toFixed(3));
      previous.duration = Number((previous.end - previous.start).toFixed(3));
      previous.reason = [previous.reason, range.reason].filter(Boolean).join(" / ");
    } else {
      merged.push({ ...range });
    }
  }
  return merged;
}

const HIGHLIGHT_SCRIPT_KEEP_RANGE_SMOOTHING = {
  beforeSeconds: 0.15,
  afterSeconds: 0.25,
  mergeGapSeconds: 3,
  minimumSegmentSeconds: 5
};

function smoothHighlightKeepRanges(ranges, durationSeconds, options = {}) {
  const duration = Number(durationSeconds) || 0;
  const beforeSeconds = Math.max(0, Number(options.beforeSeconds ?? HIGHLIGHT_SCRIPT_KEEP_RANGE_SMOOTHING.beforeSeconds) || 0);
  const afterSeconds = Math.max(0, Number(options.afterSeconds ?? HIGHLIGHT_SCRIPT_KEEP_RANGE_SMOOTHING.afterSeconds) || 0);
  const mergeGapSeconds = Math.max(0, Number(options.mergeGapSeconds ?? HIGHLIGHT_SCRIPT_KEEP_RANGE_SMOOTHING.mergeGapSeconds) || 0);
  const minimumSegmentSeconds = Math.max(0, Number(options.minimumSegmentSeconds ?? HIGHLIGHT_SCRIPT_KEEP_RANGE_SMOOTHING.minimumSegmentSeconds) || 0);
  const expanded = normalizeKeepRanges((Array.isArray(ranges) ? ranges : []).map((range) => ({
    ...range,
    start: Math.max(0, (Number(range.start) || 0) - beforeSeconds),
    end: duration
      ? Math.min(duration, (Number(range.end) || 0) + afterSeconds)
      : (Number(range.end) || 0) + afterSeconds
  })), duration, { mergeGapSeconds });
  if (!minimumSegmentSeconds) return expanded;
  const padded = expanded.map((range) => {
    const segmentDuration = Number(range.duration) || Math.max(0, (Number(range.end) || 0) - (Number(range.start) || 0));
    if (segmentDuration >= minimumSegmentSeconds) return range;
    const missing = minimumSegmentSeconds - segmentDuration;
    const start = Math.max(0, (Number(range.start) || 0) - missing / 2);
    const endLimit = duration || ((Number(range.end) || 0) + missing);
    const end = Math.min(endLimit, (Number(range.end) || 0) + missing / 2 + Math.max(0, missing / 2 - (Number(range.start) - start || 0)));
    return {
      ...range,
      start: Number(start.toFixed(3)),
      end: Number(end.toFixed(3))
    };
  });
  return normalizeKeepRanges(padded, duration, { mergeGapSeconds });
}

function subtractRangesFromKeepRanges(keepRanges, removeRanges, durationSeconds) {
  const keeps = normalizeKeepRanges(keepRanges, durationSeconds);
  const removals = normalizeKeepRanges(removeRanges, durationSeconds);
  if (!keeps.length || !removals.length) return keeps;
  const result = [];
  for (const keep of keeps) {
    let fragments = [{ ...keep }];
    for (const removal of removals) {
      fragments = fragments.flatMap((fragment) => {
        if (removal.end <= fragment.start + 0.01 || removal.start >= fragment.end - 0.01) return [fragment];
        const next = [];
        if (removal.start > fragment.start + 0.03) {
          next.push({
            ...fragment,
            end: Number(Math.min(fragment.end, removal.start).toFixed(3))
          });
        }
        if (removal.end < fragment.end - 0.03) {
          next.push({
            ...fragment,
            start: Number(Math.max(fragment.start, removal.end).toFixed(3))
          });
        }
        return next;
      });
    }
    result.push(...fragments.map((fragment) => ({
      ...fragment,
      duration: Number((fragment.end - fragment.start).toFixed(3))
    })).filter((fragment) => fragment.duration > 0.03));
  }
  return normalizeKeepRanges(result, durationSeconds, { mergeGapSeconds: 0 });
}

function rangeOverlapSeconds(left, right) {
  return Math.max(0, Math.min(Number(left?.end) || 0, Number(right?.end) || 0) - Math.max(Number(left?.start) || 0, Number(right?.start) || 0));
}

function annotateRemovalRanges(removals, annotations = []) {
  const normalizedAnnotations = (Array.isArray(annotations) ? annotations : [])
    .filter((range) => Number(range?.end) > Number(range?.start));
  if (!normalizedAnnotations.length) return removals;
  return removals.map((removal) => {
    const annotation = normalizedAnnotations
      .map((candidate) => ({ candidate, overlap: rangeOverlapSeconds(removal, candidate) }))
      .filter((item) => item.overlap >= 0.015)
      .sort((left, right) => right.overlap - left.overlap)[0]?.candidate;
    if (!annotation) return removal;
    return {
      ...removal,
      source: annotation.source || removal.source,
      reason: annotation.reason || removal.reason,
      text: annotation.text || removal.text
    };
  });
}

function removalRangesFromKeepRanges(keepRanges, durationSeconds, { reason = "不在精華摘要稿內", source = "highlight-transcript" } = {}) {
  const duration = Number(durationSeconds) || 0;
  const ranges = normalizeKeepRanges(keepRanges, duration);
  const removals = [];
  let cursor = 0;
  for (const range of ranges) {
    if (range.start > cursor + 0.08) {
      removals.push({
        start: Number(cursor.toFixed(3)),
        end: Number(range.start.toFixed(3)),
        duration: Number((range.start - cursor).toFixed(3)),
        source,
        reason
      });
    }
    cursor = Math.max(cursor, range.end);
  }
  if (duration > cursor + 0.08) {
    removals.push({
      start: Number(cursor.toFixed(3)),
      end: Number(duration.toFixed(3)),
      duration: Number((duration - cursor).toFixed(3)),
      source,
      reason
    });
  }
  return removals;
}

function roughCutPlanFromKeepRanges({ keepRanges, durationSeconds, inputSegmentCount = 0, source = "highlight-transcript", removalReason = "不在精華摘要稿內", removalAnnotations = [] }) {
  const normalizedKeepRanges = normalizeKeepRanges(keepRanges, durationSeconds);
  const removals = annotateRemovalRanges(
    removalRangesFromKeepRanges(normalizedKeepRanges, durationSeconds, { source, reason: removalReason }),
    removalAnnotations
  );
  const keptSeconds = normalizedKeepRanges.reduce((total, range) => total + (Number(range.duration) || 0), 0);
  const removedSeconds = removals.reduce((total, range) => total + (Number(range.duration) || 0), 0);
  return {
    durationSeconds: Number(durationSeconds) || 0,
    inputSegmentCount,
    summary: {
      removalCount: removals.length,
      keepRangeCount: normalizedKeepRanges.length,
      removedSeconds: Number(removedSeconds.toFixed(3)),
      keptSeconds: Number(keptSeconds.toFixed(3)),
      estimatedOutputSeconds: Number(keptSeconds.toFixed(3))
    },
    groups: [],
    removals,
    keepRanges: normalizedKeepRanges,
    options: {
      source,
      policy: "keep-ranges-from-selected-transcript"
    }
  };
}

function keepRangesNearlyEqual(leftRanges = [], rightRanges = [], durationSeconds = 0, { toleranceSeconds = 0.09 } = {}) {
  const duration = Number(durationSeconds) || 0;
  const left = normalizeKeepRanges(leftRanges, duration);
  const right = normalizeKeepRanges(rightRanges, duration);
  if (left.length !== right.length) return false;
  return left.every((range, index) => {
    const other = right[index];
    return Math.abs((Number(range.start) || 0) - (Number(other?.start) || 0)) <= toleranceSeconds
      && Math.abs((Number(range.end) || 0) - (Number(other?.end) || 0)) <= toleranceSeconds;
  });
}

function assertForcedRoughCutPlanIntegrity(plan, forcedKeepRanges = [], { durationSeconds = 0, transcriptVersionKind = "" } = {}) {
  if (!Array.isArray(forcedKeepRanges) || !forcedKeepRanges.length) return;
  const planKeepRanges = Array.isArray(plan?.keepRanges) ? plan.keepRanges : [];
  if (keepRangesNearlyEqual(planKeepRanges, forcedKeepRanges, durationSeconds || plan?.durationSeconds || 0)) return;
  const error = new Error(transcriptVersionKind === "ai-highlight-summary"
    ? "AI 粗剪沒有照目前 AI 精華摘要稿的時間碼產生，已停止輸出，避免剪出和稿件不一致的片段。請重新產生 AI 精華摘要稿後再剪。"
    : "AI 粗剪沒有照目前選定稿件的時間碼產生，已停止輸出。");
  error.statusCode = 422;
  error.code = "ROUGH_CUT_TRANSCRIPT_PLAN_MISMATCH";
  throw error;
}

function assertSubtitleTranscriptIntegrity(captions = [], transcript = "", { transcriptVersionKind = "" } = {}) {
  if (transcriptVersionKind !== "ai-highlight-summary") return;
  const match = subtitleDraftMatchesTranscript(captions, transcript);
  if (match.matches) return;
  const error = new Error("字幕草稿沒有照目前 AI 精華摘要稿產生，已停止輸出，避免字幕退回原稿或其他版本。");
  error.statusCode = 422;
  error.code = "SUBTITLE_SELECTED_HIGHLIGHT_MISMATCH";
  error.details = match;
  throw error;
}

function transcriptMappingBlockReason(version) {
  if (version?.kind !== "ai-highlight-summary") return "";
  const keepRanges = Array.isArray(version.keepRanges) ? version.keepRanges : [];
  if (!keepRanges.length) {
    return "這份 AI 精華稿缺少原片時間映射，無法保證內容完整性。請重新產生 AI 精華摘要版。";
  }
  const reliableConfidence = new Set(["source-segment", "source-extractive", "source-extractive-partial", "source", "exact", "line-delete-exact"]);
  if (version.mappingConfidence === "line-delete-with-insertions" || version.transcriptEditPolicy === "highlight-has-new-text") {
    return "這份 AI 精華稿新增文字過多，已超出可借用原片時間碼的範圍。若要照稿剪，請只補 AI 漏字、修錯字，或把新增內容放回原本同一句附近。";
  }
  if (!reliableConfidence.has(String(version.mappingConfidence || ""))) {
    return "這份 AI 精華稿的段落數已大幅改變，無法可靠對應原片時間。請保留原有段落數修改，或重新產生 AI 精華摘要版。";
  }
  return "";
}

function transcriptForcedKeepRangeInstruction(version, { durationSeconds = 0 } = {}) {
  const keepRanges = Array.isArray(version?.keepRanges) ? version.keepRanges : [];
  if (!keepRanges.length) return null;
  const omittedRanges = Array.isArray(version.omittedRanges) ? version.omittedRanges : [];
  // AI 精華稿本身就是剪輯稿；選它做粗剪時，影片要照這份稿子的保留範圍剪。
  // 為了避免精華剪輯太生硬，精華稿會加一點前後呼吸空間、合併太近的片段、避免太短片段亂跳。
  // 若使用者在 AI 精華稿刪字詞，會在平順化後再次扣掉該字詞時間，避免刪字被緩衝吃回來。
  if (version.kind === "ai-highlight-summary") {
    const smoothedKeepRanges = smoothHighlightKeepRanges(keepRanges, durationSeconds);
    const effectiveKeepRanges = omittedRanges.length
      ? subtractRangesFromKeepRanges(smoothedKeepRanges, omittedRanges, durationSeconds)
      : smoothedKeepRanges;
    return {
      keepRanges: effectiveKeepRanges,
      source: "ai-highlight-script",
      removalReason: "未列入 AI 精華稿",
      removalAnnotations: omittedRanges,
      smoothing: HIGHLIGHT_SCRIPT_KEEP_RANGE_SMOOTHING
    };
  }
  // 使用者在稿件中把一整行刪空時，才把那一行對應的原片時間剪掉。
  if (omittedRanges.length) {
    return {
      keepRanges,
      source: "transcript-delete",
      removalReason: "逐字稿段落已刪空",
      removalAnnotations: omittedRanges
    };
  }
  return null;
}

async function writeTranscriptVersion({ jobId, jobDirectory, id, kind, label, text, timeline = null, sourceVersionId = "", rootVersionId = "", mappingConfidence = "", mappings = [], keepRanges = [], omittedRanges = [], transcriptEditPolicy = "", rawLineCount = 0, quality = null }) {
  const directory = transcriptVersionDirectory(jobDirectory);
  await mkdir(directory, { recursive: true });
  const createdAt = new Date().toISOString();
  const safeId = safeTranscriptVersionId(id);
  const cleanText = normalizeTranscriptText(text);
  const txtFilename = `${safeId}.txt`;
  const jsonFilename = `${safeId}.json`;
  const timelineFilename = timeline ? `${safeId}-timeline.json` : "";
  const textPath = path.join(directory, txtFilename);
  const jsonPath = path.join(directory, jsonFilename);
  const timelinePath = timelineFilename ? path.join(directory, timelineFilename) : "";
  await writeFile(textPath, `${cleanText}\n`, "utf8");
  if (timelinePath) await writeFile(timelinePath, `${JSON.stringify(timeline, null, 2)}\n`, "utf8");
  const metadata = {
    id: safeId,
    kind,
    label,
    createdAt,
    sourceVersionId,
    rootVersionId: rootVersionId || (kind === "whisper-original" ? safeId : sourceVersionId),
    text: cleanText,
    textUrl: transcriptVersionUrl(jobId, txtFilename),
    jsonUrl: transcriptVersionUrl(jobId, jsonFilename),
    timelineUrl: timelineFilename ? transcriptVersionUrl(jobId, timelineFilename) : null,
    timelineRelativePath: timelineFilename ? path.join("transcripts", timelineFilename) : "",
    characters: cleanText.length,
    lineCount: splitTranscriptLines(cleanText).length,
    rawLineCount: Number(rawLineCount) || splitTranscriptLines(cleanText).length,
    mappingConfidence,
    mappings,
    keepRanges,
    omittedRanges,
    transcriptEditPolicy,
    quality
  };
  await writeFile(jsonPath, `${JSON.stringify(metadata, null, 2)}\n`, "utf8");
  return metadata;
}

function chooseHighlightSegments(timeline, transcriptText, { durationSeconds = 0, targetCount = 0, outline = [] } = {}) {
  const segments = (Array.isArray(timeline?.segments) ? timeline.segments : [])
    .map((segment, index) => ({
      ...segment,
      id: segment.id || index + 1,
      text: String(segment.text || "").replace(/\s+/g, " ").trim()
    }))
    .filter((segment) => segment.text && Number(segment.end) > Number(segment.start));
  if (!segments.length) return { selectedSegments: [], keepRanges: [], mappings: [] };
  const outlineText = (Array.isArray(outline) ? outline : [])
    .flatMap((item) => [item.title, item.summary, ...(item.bullets || [])])
    .join(" ");
  const transcriptKeywords = splitSentences(`${outlineText}\n${transcriptText}`)
    .flatMap((sentence) => sentence.split(/[\s，。,.、：:；;!?！？「」『』()（）]+/))
    .map((word) => word.trim())
    .filter((word) => word.length >= 2)
    .slice(0, 160);
  const keywordSet = new Set(transcriptKeywords);
  const requested = Number(targetCount);
  const computedTarget = Math.max(5, Math.min(16, requested || Math.ceil(Math.max(90, Number(durationSeconds) || 180) / 45)));
  const scored = segments.map((segment, index) => {
    const text = segment.text;
    const keywordHits = [...keywordSet].reduce((total, keyword) => total + (text.includes(keyword) ? 1 : 0), 0);
    const lengthScore = Math.min(6, Math.max(1, text.length / 12));
    const structureScore = /重點|核心|關鍵|因為|所以|但是|如果|問題|方法|結論|必須|可以|需要|商業模式|商業思維|天花板|分潤|銷售|收入|成本|利潤/.test(text) ? 3 : 0;
    const contentRoleScore = highlightContentRoleScore(text);
    const roles = highlightContentRoles(text);
    const positionScore = index === 0 || index === segments.length - 1 ? 1.2 : index > segments.length * 0.72 ? 0.8 : 0;
    const fillerPenalty = /^(嗯+|呃+|啊+|欸+|誒+|那個|這個|就是|其實|然後)[，、,\s]*/.test(text) ? -1.4 : 0;
    return {
      segment,
      roles,
      score: keywordHits * 0.35 + lengthScore + structureScore + contentRoleScore + positionScore + fillerPenalty + highlightSegmentCompletenessPenalty(text)
    };
  });
  const third = Math.max(1, Math.floor(segments.length / 3));
  const zones = [
    [0, Math.min(segments.length, third)],
    [Math.min(segments.length - 1, third), Math.min(segments.length, third * 2)],
    [Math.min(segments.length - 1, third * 2), segments.length]
  ];
  const scoredById = new Map(scored.map((item) => [item.segment.id, item]));
  const scoredByIndex = new Map(scored.map((item, index) => [index, item]));
  const selectedIndexes = new Set();
  for (const [start, end] of zones) {
    const candidates = segments.slice(start, Math.max(start + 1, end));
    const best = candidates.sort((left, right) => (
      (scoredById.get(right.id)?.score || 0) - (scoredById.get(left.id)?.score || 0)
    ))[0];
    const bestIndex = segments.findIndex((segment) => segment.id === best?.id);
    if (bestIndex >= 0) selectedIndexes.add(bestIndex);
  }
  const ranked = scored.sort((left, right) => right.score - left.score);
  const selectedScoredByIndex = new Map([...selectedIndexes].map((index) => [index, scoredById.get(segments[index]?.id)]).filter((item) => item[1]));
  addRoleCoverageItems(ranked.map((item) => ({
    index: segments.findIndex((segment) => segment.id === item.segment.id),
    sentence: item.segment.text,
    score: item.score,
    roles: item.roles,
    segment: item.segment
  })).filter((item) => item.index >= 0), selectedScoredByIndex, computedTarget);
  for (const index of selectedScoredByIndex.keys()) selectedIndexes.add(index);
  for (const item of ranked) {
    if (selectedIndexes.size >= computedTarget) break;
    const index = segments.findIndex((segment) => segment.id === item.segment.id);
    if (index < 0) continue;
    selectedIndexes.add(index);
    if (selectedIndexes.size < computedTarget && index + 1 < segments.length) selectedIndexes.add(index + 1);
  }
  const closingItem = pickHighlightClosingItem(segments.map((segment, index) => ({
    index,
    sentence: segment.text,
    score: scoredByIndex.get(index)?.score || 0,
    roles: scoredByIndex.get(index)?.roles || []
  })));
  const closingIndex = Number.isInteger(closingItem?.index) ? closingItem.index : -1;
  if (closingIndex >= 0) selectedIndexes.add(closingIndex);
  const trimmedIndexes = trimHighlightIndexesByMainline(segments, selectedIndexes, scoredByIndex, computedTarget);
  const completeIndexes = expandHighlightIndexesForCompleteIdeas(segments, trimmedIndexes, computedTarget);
  const selectedSegments = [...completeIndexes]
    .sort((left, right) => left - right)
    .map((index) => segments[index]);
  const keepRanges = normalizeKeepRanges(selectedSegments.map((segment) => ({
    start: Math.max(0, Number(segment.start) - 0.18),
    end: Math.min(Number(durationSeconds) || Number(segment.end) + 0.18, Number(segment.end) + 0.18),
    reason: segment.text.slice(0, 80)
  })), durationSeconds);
  const mappings = selectedSegments.map((segment, index) => ({
    index: index + 1,
    sourceSegmentId: rootTranscriptSegmentIds([segment], [index])[0],
    sourceSegmentIds: rootTranscriptSegmentIds([segment], [index]),
    start: Number(segment.start),
    end: Number(segment.end),
    text: segment.text
  }));
  return { selectedSegments, keepRanges, mappings };
}

function comparableTranscriptText(value = "") {
  return transcriptTimingTokens(value)
    .map(comparableTranscriptToken)
    .filter(Boolean)
    .join("");
}

function transcriptTextOverlapScore(left = "", right = "") {
  const leftTokens = transcriptTimingTokens(left).map(comparableTranscriptToken).filter(Boolean);
  const rightTokens = transcriptTimingTokens(right).map(comparableTranscriptToken).filter(Boolean);
  if (!leftTokens.length || !rightTokens.length) return 0;
  const rightSet = new Set(rightTokens);
  const hits = leftTokens.filter((token) => rightSet.has(token)).length;
  return hits / Math.max(leftTokens.length, rightTokens.length);
}

function findVerbatimHighlightSegmentWindow(baseSegments, line, startIndex = 0) {
  const source = Array.isArray(baseSegments) ? baseSegments : [];
  const lineKey = comparableTranscriptText(line);
  if (!source.length || lineKey.length < 3) return null;
  const maximumWindow = 4;
  let best = null;
  for (let index = Math.max(0, Number(startIndex) || 0); index < source.length; index += 1) {
    for (let length = 1; length <= maximumWindow && index + length <= source.length; length += 1) {
      const group = source.slice(index, index + length);
      const windowText = group.map((segment) => segment.text || "").join("");
      const windowKey = comparableTranscriptText(windowText);
      if (!windowKey) continue;
      const lineCoverage = lineKey.length / Math.max(1, windowKey.length);
      const windowCoverage = windowKey.length / Math.max(1, lineKey.length);
      let score = 0;
      if (windowKey.includes(lineKey)) {
        score = 1 + Math.min(0.85, lineCoverage);
      } else if (lineKey.includes(windowKey) && windowKey.length >= lineKey.length * 0.55) {
        score = 0.75 + Math.min(0.45, windowCoverage);
      } else {
        score = transcriptTextOverlapScore(line, windowText);
      }
      const extraTextRatio = Math.max(0, windowKey.length - lineKey.length) / Math.max(1, windowKey.length, lineKey.length);
      score -= Math.min(0.22, extraTextRatio * 0.22);
      if (score < 0.62) continue;
      const candidate = { index, length, score, group };
      if (
        !best
        || candidate.score > best.score + 0.001
        || (
          Math.abs(candidate.score - best.score) <= 0.001
          && (candidate.length < best.length || (candidate.length === best.length && candidate.index < best.index))
        )
      ) {
        best = candidate;
      }
    }
  }
  return best;
}

function mapVerbatimHighlightTextToTimeline(sourceTimeline, highlightText, { durationSeconds = 0 } = {}) {
  const baseSegments = Array.isArray(sourceTimeline?.segments) ? sourceTimeline.segments : [];
  const lines = splitTranscriptLines(highlightText);
  if (!baseSegments.length || !lines.length) return { selectedSegments: [], keepRanges: [], mappings: [], mappingConfidence: "text-only" };
  const selectedSegments = [];
  const mappings = [];
  let cursor = 0;
  let failedCount = 0;
  for (const line of lines) {
    const match = findVerbatimHighlightSegmentWindow(baseSegments, line, cursor);
    if (!match) {
      failedCount += 1;
      continue;
    }
    const segmentIndexes = Array.from({ length: match.length }, (_, offset) => match.index + offset);
    const first = match.group[0];
    const last = match.group.at(-1);
    const range = {
      lineIndex: selectedSegments.length,
      segmentIndexes,
      start: Number(first?.start) || 0,
      end: Number(last?.end) || Number(first?.end) || 0
    };
    const segment = mappedTranscriptSegment(baseSegments, range, line, selectedSegments.length);
    selectedSegments.push(segment);
    mappings.push({
      index: selectedSegments.length,
      sourceSegmentId: segment.sourceSegmentId,
      sourceSegmentIds: segment.sourceSegmentIds,
      start: segment.start,
      end: segment.end,
      text: line
    });
    cursor = Math.max(cursor, match.index + match.length);
  }
  const duration = Number(durationSeconds) || timelineDurationFromSegments(sourceTimeline, baseSegments);
  const keepRanges = normalizeKeepRanges(selectedSegments.map((segment) => ({
    start: segment.start,
    end: segment.end,
    reason: segment.text.slice(0, 80)
  })), duration, { mergeGapSeconds: 0.2 });
  return {
    selectedSegments,
    keepRanges,
    mappings,
    mappingConfidence: failedCount ? "source-extractive-partial" : "source-extractive",
    failedCount
  };
}

async function createTranscriptVersionFromText({ project, jobId, text, sourceVersionId = "", kind = "user-edited-full", label = "已確認原稿", quality = null }) {
  const jobDirectory = path.join(outputDirectory, jobId);
  const sourceVersion = latestTranscriptVersion(project, sourceVersionId);
  const sourceTimelinePath = transcriptTimelinePathForVersion(jobDirectory, sourceVersion)
    || outputPathFromUrl(jobId, project.transcription?.timelineUrl);
  let baseTimeline = null;
  if (sourceTimelinePath) {
    try {
      baseTimeline = JSON.parse(await readFile(sourceTimelinePath, "utf8"));
    } catch {
      baseTimeline = null;
    }
  }
  const sourcePreservesKeepRanges = sourceVersion?.kind === "ai-highlight-summary"
    || (Array.isArray(sourceVersion?.keepRanges) && sourceVersion.keepRanges.length > 0);
  const mapping = buildTimelineFromEditedTranscript(baseTimeline, text, {
    sourceText: sourceVersion?.text || project.transcript || "",
    preserveKeepRanges: sourcePreservesKeepRanges,
    trackWordDeletes: sourceVersion?.kind === "ai-highlight-summary"
  });
  const inheritedDeletedLines = !mapping.omittedRanges?.length && Array.isArray(sourceVersion?.omittedRanges) && sourceVersion.omittedRanges.length;
  const inheritedKeepRanges = !mapping.keepRanges?.length && sourcePreservesKeepRanges;
  const versionId = `${kind}-${Date.now()}`;
  return writeTranscriptVersion({
    jobId,
    jobDirectory,
    id: versionId,
    kind,
    label,
    text,
    timeline: mapping.timeline,
    sourceVersionId: sourceVersion?.id || sourceVersionId || "",
    rootVersionId: sourceVersion?.rootVersionId || sourceVersion?.id || sourceVersionId || "",
    mappingConfidence: mapping.mappingConfidence,
    mappings: mapping.mappings || [],
    keepRanges: mapping.keepRanges?.length
      ? mapping.keepRanges
      : inheritedKeepRanges || inheritedDeletedLines ? sourceVersion.keepRanges : [],
    omittedRanges: mapping.omittedRanges?.length ? mapping.omittedRanges : inheritedDeletedLines ? sourceVersion.omittedRanges : [],
    transcriptEditPolicy: mapping.transcriptEditPolicy || (inheritedDeletedLines ? sourceVersion.transcriptEditPolicy : ""),
    rawLineCount: mapping.rawLineCount || 0,
    quality
  });
}

async function createProofreadTranscriptVersion({ project, jobId, text = "", sourceVersionId = "" }) {
  await refreshSpeechSummaryPolisherSkill();
  const workflowSkills = await inspectWorkflowSkills();
  assertWorkflowSkillsReady(workflowSkills, ["speech-summary-polisher"]);
  const sourceVersion = latestTranscriptVersion(project, sourceVersionId);
  if (!sourceVersion && !text) {
    const error = new Error("找不到可校稿的逐字稿版本。");
    error.statusCode = 422;
    throw error;
  }
  const sourceText = normalizeTranscriptText(text || sourceVersion?.text || project.transcript || "");
  const localRuleDraft = proofreadTranscriptText(sourceText, {
    context: project.processingOptions?.context || ""
  });
  const skillResult = await executeSpeechSummaryPolisher({
    text: localRuleDraft,
    mode: "revision",
    workDirectory: transcriptVersionDirectory(path.join(outputDirectory, jobId))
  });
  const proofreadText = proofreadTranscriptText(skillResult.text, {
    context: project.processingOptions?.context || ""
  });
  if (!proofreadText) {
    const error = new Error("AI 校稿後沒有可用文字，請先確認原始逐字稿。");
    error.statusCode = 422;
    throw error;
  }
  return createTranscriptVersionFromText({
    project,
    jobId,
    text: proofreadText,
    sourceVersionId: sourceVersion?.id || sourceVersionId || "",
    kind: "ai-proofread",
    label: "AI 校稿版",
    quality: {
      ...speechPolisherSource("修正版", sourceText, proofreadText),
      executed: true,
      executableOutputCharacters: skillResult.outputCharacters
    }
  });
}

async function createHighlightTranscriptVersion({ project, jobId, sourceVersionId = "" }) {
  const workflowSkills = await inspectWorkflowSkills();
  assertWorkflowSkillsReady(workflowSkills, ["extract-verbatim-highlights"]);
  const jobDirectory = path.join(outputDirectory, jobId);
  const sourceVersion = latestTranscriptVersion(project, sourceVersionId);
  if (!sourceVersion) {
    const error = new Error("找不到可產生精華稿的逐字稿版本。");
    error.statusCode = 422;
    throw error;
  }
  const sourceTimelinePath = transcriptTimelinePathForVersion(jobDirectory, sourceVersion)
    || outputPathFromUrl(jobId, project.transcription?.timelineUrl);
  let sourceTimeline = null;
  if (sourceTimelinePath) sourceTimeline = JSON.parse(await readFile(sourceTimelinePath, "utf8"));
  const sourceText = sourceVersion.text || project.transcript || "";
  const finalHighlightText = extractVerbatimHighlightText(sourceText);
  if (!finalHighlightText) {
    const error = new Error("這份逐字稿沒有足夠內容可以產生精華稿。");
    error.statusCode = 422;
    throw error;
  }
  const {
    selectedSegments,
    keepRanges,
    mappings,
    mappingConfidence,
    failedCount
  } = mapVerbatimHighlightTextToTimeline(sourceTimeline, finalHighlightText, {
    durationSeconds: project.durationSeconds
  });
  if (!selectedSegments.length) {
    const error = new Error("這份精華稿無法對回原片時間線，請先確認逐字稿時間碼。");
    error.statusCode = 422;
    throw error;
  }
  const highlightTimeline = {
    ...(sourceTimeline || {}),
    text: selectedSegments.map((segment) => segment.text).join(" "),
    segments: selectedSegments,
    highlightSummary: true,
    sourceVersionId: sourceVersion.id
  };
  // 精華稿內容由 extract-verbatim-highlights 的抽取規則決定；後端只負責對回原片時間碼。
  return writeTranscriptVersion({
    jobId,
    jobDirectory,
    id: `ai-highlight-summary-${Date.now()}`,
    kind: "ai-highlight-summary",
    label: "AI 精華摘要稿",
    text: finalHighlightText,
    timeline: highlightTimeline,
    sourceVersionId: sourceVersion.id,
    rootVersionId: sourceVersion.rootVersionId || sourceVersion.id,
    mappingConfidence,
    mappings,
    keepRanges,
    quality: {
      ...extractVerbatimHighlightSource(workflowSkills, sourceVersion.text || project.transcript || "", finalHighlightText, {
        selectedSegmentCount: selectedSegments.length
      }),
      executed: true,
      extractive: true,
      verbatim: true,
      mappingFailedLineCount: failedCount || 0,
      backendRole: "timecode-alignment-only"
    }
  });
}

async function createRoughCutDraft({ jobId, title, mediaPath, durationSeconds, options, timelinePath: sharedTimelinePath = "", pauseTimelinePath = "", forcedKeepRanges = null, forcedKeepRangeSource = "highlight-transcript", forcedKeepRangeRemovalReason = "不在精華摘要稿內", forcedKeepRangeRemovalAnnotations = [], transcriptVersionId = "", transcriptVersionKind = "", transcriptVersionLabel = "" }) {
  if (!mediaPath || !options.roughCut) return null;
  const jobDirectory = path.join(outputDirectory, jobId);
  const roughCutDirectory = path.join(jobDirectory, "roughcut");
  await mkdir(roughCutDirectory, { recursive: true });
  const safeBase = safeTitle(title || "影片內容");
  const timelinePath = sharedTimelinePath ? path.resolve(sharedTimelinePath) : path.join(roughCutDirectory, `${safeBase}-粗剪時間線.json`);
  const planPath = path.join(roughCutDirectory, `${safeBase}-粗剪計畫.json`);
  const reportPath = path.join(roughCutDirectory, `${safeBase}-粗剪報告.txt`);
  const waveformPath = path.join(roughCutDirectory, `${safeBase}-音訊波形.raw`);
  const previewProxyPath = path.join(roughCutDirectory, `${safeBase}-粗剪預覽.mp4`);

  if (!sharedTimelinePath) {
    await execFileAsync(roughCutPythonPath, [
      path.join(__dirname, "tools", "export_whisper_timeline.py"),
      mediaPath,
      "--model-dir", roughCutModelDirectory,
      "--language", options.language || "auto",
      "--context", options.context || "",
      "--output", timelinePath
    ], { timeout: 0 });
  }

  const timeline = JSON.parse(await readFile(timelinePath, "utf8"));
  let pauseTimeline = null;
  if (pauseTimelinePath && path.resolve(pauseTimelinePath) !== path.resolve(timelinePath)) {
    try {
      pauseTimeline = JSON.parse(await readFile(pauseTimelinePath, "utf8"));
    } catch (error) {
      console.warn(`粗剪原始停頓時間線讀取失敗，改用目前逐字稿時間線：${error.message}`);
    }
  }
  const plan = Array.isArray(forcedKeepRanges) && forcedKeepRanges.length
    ? roughCutPlanFromKeepRanges({
        keepRanges: forcedKeepRanges,
        durationSeconds,
        inputSegmentCount: Array.isArray(timeline.segments) ? timeline.segments.length : 0,
        source: forcedKeepRangeSource,
        removalReason: forcedKeepRangeRemovalReason,
        removalAnnotations: forcedKeepRangeRemovalAnnotations
      })
    : createRoughCutPlan(timeline, { durationSeconds, pauseTimeline });
  assertForcedRoughCutPlanIntegrity(plan, forcedKeepRanges, { durationSeconds, transcriptVersionKind });
  await writeFile(planPath, `${JSON.stringify(plan, null, 2)}\n`, "utf8");
  await writeFile(reportPath, roughCutPlanToText(plan), "utf8");

  let waveformPeaks = [];
  try {
    waveformPeaks = await createWaveformPeaks(mediaPath, waveformPath);
  } catch (error) {
    console.warn(`粗剪波形產生失敗：${error.message}`);
  }

  let thumbnailUrls = [];
  try {
    const thumbnailPaths = await createRoughCutTimelineThumbnails(
      mediaPath,
      path.join(roughCutDirectory, "timeline-thumbnails"),
      plan.durationSeconds || durationSeconds || 0
    );
    thumbnailUrls = thumbnailPaths.map((thumbnailPath) => (
      `/outputs/jobs/${jobId}/${encodeRelativeUrlPath(path.relative(jobDirectory, thumbnailPath))}`
    ));
  } catch (error) {
    console.warn(`粗剪素材縮圖產生失敗：${error.message}`);
  }

  let previewVideoFilename = "";
  let previewVideoRelativePath = "";
  let previewVideoMode = "";
  try {
    // 粗剪草稿的預覽要播「真的剪後影片」，不能再用原片靠前端即時跳過刪除段。
    // 原片即時跳剪在跨越紅色刪除段時容易卡在 seek / 解碼邊界，使用者也會以為影片沒照稿剪。
    await createRenderedRoughCutPreview(mediaPath, previewProxyPath, plan.keepRanges || []);
    previewVideoFilename = path.basename(previewProxyPath);
    previewVideoRelativePath = path.relative(jobDirectory, previewProxyPath);
    previewVideoMode = "rendered-roughcut-preview";
  } catch (error) {
    console.warn(`剪後粗剪預覽產生失敗，改用原片代理預覽：${error.message}`);
    try {
      await createRoughCutPreviewProxy(mediaPath, previewProxyPath);
      previewVideoFilename = path.basename(previewProxyPath);
      previewVideoRelativePath = path.relative(jobDirectory, previewProxyPath);
      previewVideoMode = "source-proxy-fallback";
    } catch (fallbackError) {
      console.warn(`粗剪預覽代理影片產生失敗：${fallbackError.message}`);
    }
  }

  return {
    status: "needs-review",
    sourceVideoFilename: path.basename(mediaPath),
    previewVideoFilename,
    previewVideoRelativePath,
    previewVideoMode,
    timelineFilename: path.basename(timelinePath),
    timelineRelativePath: path.relative(jobDirectory, timelinePath),
    planFilename: path.basename(planPath),
    reportFilename: path.basename(reportPath),
    durationSeconds: plan.durationSeconds || durationSeconds || 0,
    inputSegmentCount: plan.inputSegmentCount || 0,
    summary: plan.summary,
    groups: plan.groups || [],
    removals: plan.removals || [],
    keepRanges: plan.keepRanges || [],
    transcriptVersionId,
    transcriptVersionKind,
    transcriptVersionLabel,
    forcedKeepRangeSource: Array.isArray(forcedKeepRanges) && forcedKeepRanges.length ? forcedKeepRangeSource : "",
    forcedKeepRanges: Array.isArray(forcedKeepRanges) && forcedKeepRanges.length ? normalizeKeepRanges(forcedKeepRanges, durationSeconds) : [],
    options: plan.options || {},
    waveformPeaks,
    thumbnailUrls
  };
}

function normalizeEditedRoughCutRemovals(removals, durationSeconds) {
  const duration = Math.max(0, Number(durationSeconds) || 0);
  return (Array.isArray(removals) ? removals : [])
    .filter((range) => range?.enabled !== false)
    .map((range, index) => {
      const start = Math.max(0, Math.min(duration, Number(range.start) || 0));
      const end = Math.max(0, Math.min(duration, Number(range.end) || 0));
      return {
        ...range,
        id: Number(range.id) || index + 1,
        source: range.source || range.sources?.[0] || "manual_roughcut",
        reason: range.reason || range.reasons?.[0] || "人工確認粗剪",
        start: Number(Math.min(start, end).toFixed(3)),
        end: Number(Math.max(start, end).toFixed(3))
      };
    })
    .filter((range) => range.end - range.start >= 0.06);
}

function buildEditedRoughCutPlan({ removals, durationSeconds, review }) {
  const duration = Math.max(0, Number(durationSeconds) || 0);
  const mergedRemovals = mergeRemovalRanges(removals);
  const keepRanges = buildKeepRanges({ durationSeconds: duration, removeRanges: mergedRemovals });
  const removedSeconds = Number(mergedRemovals.reduce((sum, range) => sum + (Number(range.duration) || 0), 0).toFixed(3));
  const keptSeconds = Number(keepRanges.reduce((sum, range) => sum + (Number(range.duration) || 0), 0).toFixed(3));
  return {
    version: 1,
    kind: "rough_cut_plan",
    durationSeconds: duration,
    inputSegmentCount: Number(review?.inputSegmentCount) || 0,
    summary: {
      repeatedTakeGroups: Number(review?.summary?.repeatedTakeGroups) || 0,
      removals: mergedRemovals.length,
      removedSeconds,
      keptSeconds,
      estimatedOutputSeconds: keptSeconds
    },
    groups: Array.isArray(review?.groups) ? review.groups : [],
    removals: mergedRemovals,
    keepRanges,
    options: review?.options || {}
  };
}

function formatRoughCutTimecode(seconds) {
  const safe = Math.max(0, Math.round(Number(seconds) || 0));
  const minutes = Math.floor(safe / 60);
  return `${String(minutes).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

function mapOriginalTimeToRoughCutTime(time, keepRanges) {
  const target = Number(time);
  if (!Number.isFinite(target)) return null;
  let elapsed = 0;
  for (const range of keepRanges || []) {
    const start = Number(range.start) || 0;
    const end = Number(range.end) || start;
    if (target >= start && target <= end) {
      return Number((elapsed + target - start).toFixed(3));
    }
    elapsed += Math.max(0, end - start);
  }
  return null;
}

function mapOriginalRangeToRoughCutRange(start, end, keepRanges) {
  const sourceStart = Number(start);
  const sourceEnd = Number(end);
  if (!Number.isFinite(sourceStart) || !Number.isFinite(sourceEnd) || sourceEnd <= sourceStart) return null;
  let elapsed = 0;
  let best = null;
  for (const range of keepRanges || []) {
    const keepStart = Number(range.start) || 0;
    const keepEnd = Number(range.end) || keepStart;
    const overlapStart = Math.max(sourceStart, keepStart);
    const overlapEnd = Math.min(sourceEnd, keepEnd);
    const overlapDuration = overlapEnd - overlapStart;
    if (overlapDuration > 0 && (!best || overlapDuration > best.duration)) {
      const mappedStart = elapsed + overlapStart - keepStart;
      best = {
        start: Number(mappedStart.toFixed(3)),
        end: Number((mappedStart + overlapDuration).toFixed(3)),
        duration: overlapDuration
      };
    }
    elapsed += Math.max(0, keepEnd - keepStart);
  }
  return best;
}

function remapBrollPlanForRoughCut(plan, keepRanges, durationSeconds) {
  return (Array.isArray(plan) ? plan : [])
    .map((item) => {
      const mappedStart = mapOriginalTimeToRoughCutTime(item.startSeconds, keepRanges);
      if (mappedStart === null) return null;
      const originalDuration = Math.max(1, Number.parseFloat(item.duration) || ((Number(item.endSeconds) || 0) - (Number(item.startSeconds) || 0)) || 5);
      const mappedEnd = Number(Math.min(durationSeconds, mappedStart + originalDuration).toFixed(3));
      if (mappedEnd <= mappedStart) return null;
      const plannedSlideDuration = Number(item.slideCueDuration);
      const slideDuration = Number.isFinite(plannedSlideDuration) ? plannedSlideDuration : 4.2;
      const mappedSlideStart = mapOriginalTimeToRoughCutTime(item.slideCueStartSeconds, keepRanges);
      const fallbackSlideStart = Math.max(0, mappedStart - Math.min(slideDuration + 0.4, 4.8));
      const slideCueStartSeconds = Number((mappedSlideStart === null ? fallbackSlideStart : mappedSlideStart).toFixed(3));
      const slideCueEndSeconds = Number(Math.min(durationSeconds, slideCueStartSeconds + slideDuration).toFixed(3));
      return {
        ...item,
        startSeconds: mappedStart,
        endSeconds: mappedEnd,
        timecode: formatRoughCutTimecode(mappedStart),
        slideCueStartSeconds,
        slideCueDuration: Number(Math.max(1.2, slideCueEndSeconds - slideCueStartSeconds).toFixed(3)),
        slideCueEndSeconds,
        roughCutMapped: true
      };
    })
    .filter(Boolean);
}

function remapCaptionsForRoughCut(captions, keepRanges) {
  const mapped = (Array.isArray(captions) ? captions : [])
    .map((caption, index) => {
      const mapped = mapOriginalRangeToRoughCutRange(caption.start, caption.end, keepRanges);
      if (!mapped || mapped.end - mapped.start < 0.12) return null;
      return {
        ...caption,
        sourceCaptionId: Number(caption.sourceCaptionId || caption.id || index + 1),
        id: caption.id || index + 1,
        start: mapped.start,
        end: mapped.end
      };
    })
    .filter(Boolean);
  return normalizeCaptions(mapped)
    .map((caption, index) => ({ ...caption, id: index + 1 }));
}

function remapTimelineForRoughCut(timeline, keepRanges) {
  const mappedSegments = (Array.isArray(timeline?.segments) ? timeline.segments : [])
    .map((segment, index) => {
      const mapped = mapOriginalRangeToRoughCutRange(segment.start, segment.end, keepRanges);
      if (!mapped || mapped.end - mapped.start < 0.08) return null;
      const words = (Array.isArray(segment.words) ? segment.words : [])
        .map((word, wordIndex) => {
          const wordMapped = mapOriginalRangeToRoughCutRange(word.start, word.end, keepRanges);
          if (!wordMapped || wordMapped.end - wordMapped.start < 0.02) return null;
          return {
            ...word,
            id: word.id || wordIndex + 1,
            start: wordMapped.start,
            end: wordMapped.end
          };
        })
        .filter(Boolean);
      return {
        ...segment,
        id: segment.id || index + 1,
        start: mapped.start,
        end: mapped.end,
        words
      };
    })
    .filter(Boolean);
  const segments = normalizeCaptions(mappedSegments)
    .map((segment, index) => ({ ...segment, id: index + 1 }));
  const mappedTimeline = {
    ...timeline,
    text: segments.map((segment) => segment.text).filter(Boolean).join(" "),
    segments,
    roughCutMapped: true
  };
  const transcript = transcriptTextFromTimeline(mappedTimeline);
  return {
    ...mappedTimeline,
    text: transcript.replace(/\s+/g, " ").trim()
  };
}

async function createConfirmedRoughCutTimeline({ project, jobDirectory, roughCutPlan, outputPath }) {
  const review = project.roughCutReview || {};
  const timelinePath = review.timelineRelativePath
    ? path.join(jobDirectory, review.timelineRelativePath)
    : path.join(jobDirectory, "roughcut", path.basename(review.timelineFilename || ""));
  let mappedTimeline = null;
  try {
    const timeline = JSON.parse(await readFile(timelinePath, "utf8"));
    mappedTimeline = remapTimelineForRoughCut(timeline, roughCutPlan.keepRanges || []);
  } catch {
    mappedTimeline = {
      text: project.transcript || "",
      segments: [],
      roughCutMapped: true
    };
  }
  const transcript = transcriptTextFromTimeline(mappedTimeline) || project.transcript || "";
  const payload = {
    ...mappedTimeline,
    text: transcript.replace(/\s+/g, " ").trim()
  };
  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return { timelinePath: outputPath, transcript, timeline: payload };
}

async function sourceCaptionsForRoughCut(project, jobDirectory) {
  const review = project?.subtitleReview;
  if (!review) return [];
  if (Array.isArray(review.roughCutSourceCaptions) && review.roughCutSourceCaptions.length) {
    return review.roughCutSourceCaptions;
  }
  if (!review.roughCutMapped && Array.isArray(review.captions) && review.captions.length) {
    return review.captions;
  }
  if (review.draftSrtFilename) {
    try {
      const srtPath = path.join(jobDirectory, "subtitles", path.basename(review.draftSrtFilename));
      return parseSrt(await readFile(srtPath, "utf8"));
    } catch {
      // Older projects may not have the draft SRT anymore. Fall back to the stored captions.
    }
  }
  return Array.isArray(review.captions) ? review.captions : [];
}

function mergeSourceCaptionTextEdits(sourceCaptions, editedCaptions) {
  if (!Array.isArray(sourceCaptions) || !sourceCaptions.length || !Array.isArray(editedCaptions)) return sourceCaptions;
  const editsBySourceId = new Map();
  for (const caption of editedCaptions) {
    const sourceId = Number(caption.sourceCaptionId);
    if (sourceId > 0 && typeof caption.text === "string") editsBySourceId.set(sourceId, caption.text);
  }
  if (!editsBySourceId.size) return sourceCaptions;
  return sourceCaptions.map((caption, index) => {
    const sourceId = Number(caption.sourceCaptionId || caption.id || index + 1);
    return editsBySourceId.has(sourceId)
      ? { ...caption, text: editsBySourceId.get(sourceId) }
      : caption;
  });
}

function scaleCaptionTimings(captions, fromDuration, toDuration) {
  const sourceDuration = Number(fromDuration);
  const targetDuration = Number(toDuration);
  if (!Array.isArray(captions) || !(sourceDuration > 0) || !(targetDuration > 0)) return captions;
  if (Math.abs(sourceDuration - targetDuration) < 0.25) return captions;
  const scale = targetDuration / sourceDuration;
  const scaled = captions
    .map((caption, index) => {
      const start = Math.min(targetDuration, Math.max(0, Number(caption.start || 0) * scale));
      const end = Math.min(targetDuration, Math.max(start + 0.08, Number(caption.end || start + 0.08) * scale));
      if (end <= start) return null;
      return {
        ...caption,
        id: caption.id || index + 1,
        start: Number(start.toFixed(3)),
        end: Number(end.toFixed(3))
      };
    })
    .filter(Boolean);
  return normalizeCaptions(scaled)
    .map((caption, index) => ({ ...caption, id: index + 1 }));
}

function scaleBrollPlanTimings(plan, fromDuration, toDuration) {
  const sourceDuration = Number(fromDuration);
  const targetDuration = Number(toDuration);
  if (!Array.isArray(plan) || !(sourceDuration > 0) || !(targetDuration > 0)) return plan;
  if (Math.abs(sourceDuration - targetDuration) < 0.25) return plan;
  const scale = targetDuration / sourceDuration;
  const scaleTime = (value) => Number(Math.min(targetDuration, Math.max(0, Number(value || 0) * scale)).toFixed(3));
  return plan.map((item) => {
    const startSeconds = scaleTime(item.startSeconds);
    const endSeconds = Math.max(startSeconds + 0.2, scaleTime(item.endSeconds));
    const slideCueStartSeconds = scaleTime(item.slideCueStartSeconds);
    const slideCueEndSeconds = Math.max(slideCueStartSeconds + 0.2, scaleTime(item.slideCueEndSeconds));
    return {
      ...item,
      startSeconds,
      endSeconds: Number(Math.min(targetDuration, endSeconds).toFixed(3)),
      timecode: formatRoughCutTimecode(startSeconds),
      slideCueStartSeconds,
      slideCueEndSeconds: Number(Math.min(targetDuration, slideCueEndSeconds).toFixed(3)),
      slideCueDuration: Number(Math.max(0.2, Math.min(targetDuration, slideCueEndSeconds) - slideCueStartSeconds).toFixed(3)),
      roughCutTimingScale: Number(scale.toFixed(6))
    };
  });
}

async function probeDurationSeconds(mediaPath, fallbackDuration = 0) {
  try {
    const info = await probeMedia(mediaPath);
    const duration = Number(info?.durationSeconds);
    if (duration > 0) return duration;
  } catch {
    // Duration probing is a guardrail for timeline alignment; keep the flow alive if probing fails.
  }
  return Number(fallbackDuration) || 0;
}

async function existingOutputPathsFromUrls(jobId, urls) {
  const paths = [];
  for (const url of Array.isArray(urls) ? urls : []) {
    const filePath = outputPathFromUrl(jobId, url);
    if (!filePath) continue;
    try {
      const details = await stat(filePath);
      if (details.isFile() && details.size > 0) paths.push(filePath);
    } catch {
      // Missing optional assets should not block integrating the rough cut into the final video.
    }
  }
  return paths;
}

async function roughCutBaseVideoForSubtitles({ project, jobId, review, jobDirectory, fallbackPath }) {
  const roughCutUrl = project?.roughCutVideoUrl || project?.roughCutReview?.outputVideoUrl;
  const roughCutPath = outputPathFromUrl(jobId, roughCutUrl);
  const urlForPath = (filePath) => filePath
    ? `/outputs/jobs/${jobId}/${encodeRelativeUrlPath(path.relative(jobDirectory, filePath))}`
    : review?.baseVideoUrl;
  const currentBasePath = fallbackPath ? path.resolve(fallbackPath) : "";
  if (!roughCutPath || !Array.isArray(project?.roughCutReview?.keepRanges) || !project.roughCutReview.keepRanges.length) {
    return {
      baseVideoPath: fallbackPath,
      baseVideoUrl: urlForPath(currentBasePath),
      captions: null,
      sourceCaptions: review?.roughCutSourceCaptions,
      roughCutMapped: Boolean(review?.roughCutMapped),
      mappedDurationSeconds: Number(review?.roughCutActualDurationSeconds || review?.durationSeconds || 0) || 0
    };
  }
  try {
    const details = await stat(roughCutPath);
    if (!details.isFile() || details.size <= 0) throw new Error("missing roughcut video");
  } catch {
    return {
      baseVideoPath: fallbackPath,
      baseVideoUrl: urlForPath(currentBasePath),
      captions: null,
      sourceCaptions: review?.roughCutSourceCaptions,
      roughCutMapped: Boolean(review?.roughCutMapped),
      mappedDurationSeconds: Number(review?.roughCutActualDurationSeconds || review?.durationSeconds || 0) || 0
    };
  }

  const roughCutActualDurationSeconds = await probeDurationSeconds(
    roughCutPath,
    project.roughCutReview.summary?.estimatedOutputSeconds || project.roughCutReview.summary?.keptSeconds || review?.durationSeconds || 0
  );
  const nextBasePath = path.resolve(roughCutPath);
  let currentBaseIsRoughCut = currentBasePath === nextBasePath;
  if (!currentBaseIsRoughCut && currentBasePath) {
    try {
      const currentDetails = await stat(currentBasePath);
      const roughCutDetails = await stat(roughCutPath);
      currentBaseIsRoughCut = currentDetails.dev === roughCutDetails.dev && currentDetails.ino === roughCutDetails.ino;
    } catch {
      currentBaseIsRoughCut = false;
    }
  }
  if (!currentBaseIsRoughCut && currentBasePath) {
    const currentDurationSeconds = await probeDurationSeconds(currentBasePath, review?.durationSeconds || 0);
    currentBaseIsRoughCut = currentDurationSeconds > 0
      && roughCutActualDurationSeconds > 0
      && Math.abs(currentDurationSeconds - roughCutActualDurationSeconds) <= 0.75
      && Number(project?.durationSeconds || 0) > roughCutActualDurationSeconds + 1;
  }
  if (currentBaseIsRoughCut) {
    const mappedDurationSeconds = Number(review?.roughCutActualDurationSeconds || review?.durationSeconds || roughCutActualDurationSeconds || 0) || 0;
    return {
      baseVideoPath: currentBasePath || roughCutPath,
      baseVideoUrl: urlForPath(currentBasePath || roughCutPath),
      captions: null,
      sourceCaptions: review?.roughCutSourceCaptions,
      roughCutMapped: true,
      mappedDurationSeconds
    };
  }

  const sourceCaptions = await sourceCaptionsForRoughCut(project, jobDirectory);
  const mappedCaptions = remapCaptionsForRoughCut(sourceCaptions, project.roughCutReview.keepRanges);
  return {
    baseVideoPath: roughCutPath,
    baseVideoUrl: urlForPath(roughCutPath),
    captions: mappedCaptions,
    sourceCaptions,
    roughCutMapped: true,
    mappedDurationSeconds: roughCutActualDurationSeconds
  };
}

async function integrateRoughCutIntoFinalProject({ project, jobId, roughCutVideoPath, roughCutPlan }) {
  if (!project.selectedFeatures?.finalVideo) return {};
  const jobDirectory = path.join(outputDirectory, jobId);
  const baseUrl = `/outputs/jobs/${jobId}`;
  const safeBase = safeTitle(project.title || "影片內容");
  const finalVideoPath = path.join(jobDirectory, `${safeBase}-完整成片.mp4`);
  const verticalPptInsertDecision = disablePptInsertionForVerticalMedia({
    outputPpt: Boolean(project.selectedFeatures?.outputPpt),
    insertPpt: Boolean(project.selectedFeatures?.insertPpt)
  }, project.sourceMediaProfile || {});
  const shouldInsertPpt = Boolean(verticalPptInsertDecision.options.insertPpt);
  const plannedOutputDurationSeconds = Number(roughCutPlan.summary?.estimatedOutputSeconds || roughCutPlan.summary?.keptSeconds || roughCutPlan.durationSeconds) || project.durationSeconds || 0;
  const roughCutActualDurationSeconds = await probeDurationSeconds(roughCutVideoPath, plannedOutputDurationSeconds);
  let outputDurationSeconds = roughCutActualDurationSeconds || plannedOutputDurationSeconds || project.durationSeconds || 0;
  let remappedBroll = remapBrollPlanForRoughCut(project.broll || [], roughCutPlan.keepRanges, plannedOutputDurationSeconds || outputDurationSeconds);
  remappedBroll = scaleBrollPlanTimings(remappedBroll, plannedOutputDurationSeconds, outputDurationSeconds);
  const clips = (await Promise.all(remappedBroll
    .filter((item) => item.videoUrl)
    .map(async (item) => {
      const filePath = outputPathFromUrl(jobId, item.videoUrl);
      if (!filePath) return null;
      try {
        const details = await stat(filePath);
        return details.isFile() && details.size > 0 ? { id: item.id, path: filePath } : null;
      } catch {
        return null;
      }
    })))
    .filter(Boolean);
  const slideImagePaths = shouldInsertPpt
    ? await existingOutputPathsFromUrls(jobId, project.pptPreviewUrls)
    : [];
  const existingFinalPath = outputPathFromUrl(jobId, project.finalVideoUrl);
  let canReuseIntegratedFinal = project.finalVideoSource === "roughcut-integrated"
    && existingFinalPath === finalVideoPath;
  if (canReuseIntegratedFinal) {
    try {
      const details = await stat(finalVideoPath);
      canReuseIntegratedFinal = details.isFile() && details.size > 0;
    } catch {
      canReuseIntegratedFinal = false;
    }
  }

  if (canReuseIntegratedFinal) {
    // Keep the already integrated roughcut+B-roll/PPT render and continue with subtitle integration if needed.
  } else if (clips.length || slideImagePaths.length) {
    await composeFinalVideo({
      mediaPath: roughCutVideoPath,
      clips,
      plan: remappedBroll,
      slideImagePaths,
      outputPath: finalVideoPath,
      durationSeconds: outputDurationSeconds
    });
  } else {
    await linkOrCopyFile(roughCutVideoPath, finalVideoPath);
  }
  const finalActualDurationSeconds = await probeDurationSeconds(finalVideoPath, outputDurationSeconds);
  if (finalActualDurationSeconds > 0) {
    const previousDurationSeconds = outputDurationSeconds;
    outputDurationSeconds = finalActualDurationSeconds;
    remappedBroll = scaleBrollPlanTimings(remappedBroll, previousDurationSeconds, outputDurationSeconds);
  }

  let finalVideoUrl = `${baseUrl}/${encodeURIComponent(path.basename(finalVideoPath))}`;
  let finalVideoSource = "roughcut-integrated";
  let subtitleReview = project.subtitleReview;
  const subtitleUpdates = {};
  if (project.selectedFeatures?.burnSubtitles && Array.isArray(project.subtitleReview?.captions)) {
    const canRemapCaptionsFromSource = !project.subtitleReview.roughCutMapped
      || (Array.isArray(project.subtitleReview.roughCutSourceCaptions) && project.subtitleReview.roughCutSourceCaptions.length > 0)
      || Boolean(project.subtitleReview.draftSrtFilename);
    const roughCutSourceCaptions = await sourceCaptionsForRoughCut(project, jobDirectory);
    const roughCutCaptions = canRemapCaptionsFromSource
      ? remapCaptionsForRoughCut(roughCutSourceCaptions, roughCutPlan.keepRanges)
      : roughCutSourceCaptions;
    const captionReferenceDuration = canRemapCaptionsFromSource
      ? plannedOutputDurationSeconds
      : project.subtitleReview.roughCutMapped
      ? Number(project.subtitleReview.roughCutActualDurationSeconds || project.subtitleReview.durationSeconds || plannedOutputDurationSeconds)
      : plannedOutputDurationSeconds;
    const mappedCaptions = scaleCaptionTimings(roughCutCaptions, captionReferenceDuration, outputDurationSeconds);
    const subtitleTimingScale = captionReferenceDuration > 0 && outputDurationSeconds > 0
      ? outputDurationSeconds / captionReferenceDuration
      : 1;
    subtitleReview = {
      ...project.subtitleReview,
      captions: mappedCaptions,
      roughCutSourceCaptions,
      captionCount: mappedCaptions.length,
      baseVideoFilename: path.basename(finalVideoPath),
      baseVideoUrl: finalVideoUrl,
      durationSeconds: Math.round(outputDurationSeconds),
      roughCutMapped: true,
      roughCutPlannedDurationSeconds: Number((plannedOutputDurationSeconds || 0).toFixed(3)),
      roughCutActualDurationSeconds: Number((outputDurationSeconds || 0).toFixed(3)),
      roughCutTimingScale: Number(subtitleTimingScale.toFixed(6))
    };
    if (project.subtitleReview.status === "burned" && mappedCaptions.length) {
      const subtitleDirectory = path.join(jobDirectory, "subtitles");
      const finalMediaInfo = await probeMedia(finalVideoPath);
      const result = await burnEditedSubtitles({
        mediaPath: finalVideoPath,
        outputDirectory: subtitleDirectory,
        captions: mappedCaptions,
        width: finalMediaInfo.width || project.subtitleReview.width || 1920,
        height: finalMediaInfo.height || project.subtitleReview.height || 1080,
        basename: `${safeBase}-精修字幕`
      });
      const subtitledVideoUrl = `${baseUrl}/subtitles/${encodeURIComponent(path.basename(result.output_video))}`;
      finalVideoUrl = subtitledVideoUrl;
      finalVideoSource = "roughcut-and-subtitles-integrated";
      subtitleReview = {
        ...subtitleReview,
        status: "burned",
        captions: result.captions,
        captionCount: result.caption_count,
        lineBreaks: result.line_breaks,
        overlaps: result.overlaps,
        assWrapStyle: result.ass_wrap_style
      };
      subtitleUpdates.subtitledVideoUrl = subtitledVideoUrl;
      subtitleUpdates.subtitleSrtUrl = `${baseUrl}/subtitles/${encodeURIComponent(path.basename(result.output_srt))}`;
      subtitleUpdates.subtitleAssUrl = `${baseUrl}/subtitles/${encodeURIComponent(path.basename(result.output_ass))}`;
    }
  }

  return {
    durationSeconds: Math.round(outputDurationSeconds || project.durationSeconds || 0),
    finalVideoUrl,
    finalVideoSource,
    broll: remappedBroll,
    subtitleReview,
    generationNotices: mergeGenerationNotices(project.generationNotices || [], verticalPptInsertDecision.notice),
    ...subtitleUpdates,
    editingProfile: {
      ...(project.editingProfile || {}),
      finalAssemblyPolicy: "selected-features-integrated",
      roughCutPolicy: "confirmed-roughcut-used-as-final-base"
    }
  };
}

async function prepareSubtitleReviewBeforeHighCost({
  jobId,
  title,
  transcript,
  durationSeconds,
  options,
  mediaPath,
  sharedTimelinePath,
  sourceBasename = "subtitle-source",
  afterRoughCut = false,
  transcriptVersionId = "",
  transcriptVersionKind = "",
  transcriptVersionLabel = ""
}) {
  const subtitleOnlyOptions = {
    ...options,
    outputPpt: false,
    outputBrollPlan: false,
    aiBroll: false,
    insertPpt: false,
    finalVideo: false,
    roughCut: false,
    burnSubtitles: true
  };
  const subtitleOutputs = await assembleOutputs({
    jobId,
    title,
    transcript,
    durationSeconds,
    options: subtitleOnlyOptions,
    mediaPath,
    sharedTimelinePath,
    sourceBasename,
    deferHighCostUntilRoughCut: false,
    transcriptVersionId,
    transcriptVersionKind,
    transcriptVersionLabel
  });
  return {
    ...subtitleOutputs,
    selectedFeatures: {
      outputTranscript: options.outputTranscript,
      outputPpt: options.outputPpt,
      outputBrollPlan: options.outputBrollPlan,
      burnSubtitles: true,
      roughCut: options.roughCut,
      aiBroll: options.aiBroll,
      finalVideo: options.finalVideo,
      insertPpt: options.insertPpt,
      highCostDeferred: true,
      labels: selectedFeatureLabels(options)
    },
    processingOptions: storedProcessingOptions(options),
    workflow: {
      phase: "subtitle-review",
      awaitingRoughCutApproval: false,
      awaitingSubtitleApproval: true,
      deferredUntil: "subtitles-confirmed",
      highCostGeneratedAfterRoughCut: false
    },
    editingProfile: {
      ...(subtitleOutputs.editingProfile || {}),
      highCostPolicy: "defer-until-subtitles-confirmed",
      roughCutPolicy: afterRoughCut ? "confirmed-roughcut-before-subtitle-review" : "off",
      subtitlePolicy: "confirm-before-ppt-broll"
    }
  };
}

async function createConfirmedSubtitleTimeline({ jobDirectory, captions, outputPath }) {
  const segments = (Array.isArray(captions) ? captions : [])
    .map((caption, index) => ({
      id: index + 1,
      sourceCaptionId: Number(caption.sourceCaptionId || caption.id || index + 1),
      start: Number(caption.start) || 0,
      end: Number(caption.end) || Number(caption.start) || 0,
      text: String(caption.text || "").replace(/\s+/g, " ").trim(),
      words: []
    }))
    .filter((caption) => caption.text && caption.end > caption.start);
  const transcript = segments.map((segment) => segment.text).join("\n");
  const timeline = {
    text: transcript.replace(/\s+/g, " ").trim(),
    segments,
    source: "confirmed-subtitles",
    confirmedAt: new Date().toISOString()
  };
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(timeline, null, 2)}\n`, "utf8");
  return { timelinePath: outputPath, transcript, timeline };
}

async function generateOutputsAfterConfirmedSubtitles({ project, jobId, subtitledVideoPath, baseVideoPath = "", captions, durationSeconds }) {
  const jobDirectory = path.join(outputDirectory, jobId);
  const subtitleDirectory = path.join(jobDirectory, "subtitles");
  const safeBase = safeTitle(project.title || "影片內容");
  const compositionBaseVideoPath = baseVideoPath || subtitledVideoPath;
  const confirmedTimelinePath = path.join(subtitleDirectory, `${safeBase}-確認後字幕時間線.json`);
  const originalOptions = processingOptionsFromProject(project);
  const confirmed = await createConfirmedSubtitleTimeline({
    jobDirectory,
    captions,
    outputPath: confirmedTimelinePath
  });
  let options = {
    ...originalOptions,
    roughCut: false,
    burnSubtitles: false
  };
  options = disablePptInsertionForVerticalMedia(options, project.sourceMediaProfile || {}).options;
  options = resolvePptSlideCount(options, confirmed.transcript, { durationSeconds });
  const outline = buildStoryOutline(confirmed.transcript, { slideCount: options.slideCount, context: options.context });
  const outputs = await assembleOutputs({
    jobId,
    title: project.title || safeBase,
    transcript: confirmed.transcript,
    durationSeconds,
    options,
    mediaPath: compositionBaseVideoPath,
    sharedTimelinePath: confirmed.timelinePath,
    sharedOutline: outline,
    sourceBasename: "subtitle-confirmed",
    deferHighCostUntilRoughCut: false
  });
  const composedFinalVideoPath = outputPathFromUrl(jobId, outputs.finalVideoUrl);
  let topSubtitleOutputs = {};
  if (composedFinalVideoPath && Array.isArray(captions) && captions.length) {
    const composedDurationSeconds = await probeDurationSeconds(composedFinalVideoPath, durationSeconds);
    const finalMediaInfo = await probeMedia(composedFinalVideoPath);
    let timedCaptions = scaleCaptionTimings(captions, durationSeconds, composedDurationSeconds || durationSeconds);
    let finalSubtitleTimingPolicy = "confirmed-caption-timing";
    try {
      const retimedDraft = await createSubtitleDraft({
        mediaPath: composedFinalVideoPath,
        outputDirectory: subtitleDirectory,
        language: originalOptions.language || "auto",
        context: originalOptions.context || confirmed.transcript || "",
        transcriptText: confirmed.transcript,
        strictTranscript: false
      });
      if (Array.isArray(retimedDraft.captions) && retimedDraft.captions.length) {
        timedCaptions = retimedDraft.captions;
        finalSubtitleTimingPolicy = "retimed-from-final-audio";
      }
    } catch (error) {
      console.warn(`完整成片字幕重新校時失敗，改用確認字幕時間線：${error?.message || error}`);
    }
    const subtitleStyle = project.subtitleReview?.subtitleStyle || {};
    const burned = await burnEditedSubtitles({
      mediaPath: composedFinalVideoPath,
      outputDirectory: subtitleDirectory,
      captions: timedCaptions,
      width: finalMediaInfo.width || project.subtitleReview?.width || 1920,
      height: finalMediaInfo.height || project.subtitleReview?.height || 1080,
      fontScale: subtitleStyle.fontScale || 1,
      audioGain: subtitleStyle.audioGain ?? project.audioGain ?? 1,
      basename: `${safeBase}-完整成片字幕置頂`
    });
    topSubtitleOutputs = {
      finalVideoUrl: `/outputs/jobs/${jobId}/subtitles/${encodeURIComponent(path.basename(burned.output_video))}`,
      finalVideoSource: "subtitle-top-after-ppt-broll",
      subtitledVideoUrl: `/outputs/jobs/${jobId}/subtitles/${encodeURIComponent(path.basename(burned.output_video))}`,
      subtitleSrtUrl: `/outputs/jobs/${jobId}/subtitles/${encodeURIComponent(path.basename(burned.output_srt))}`,
      subtitleAssUrl: `/outputs/jobs/${jobId}/subtitles/${encodeURIComponent(path.basename(burned.output_ass))}`,
      subtitleReview: {
        ...(outputs.subtitleReview || project.subtitleReview || {}),
        status: "burned",
        captions: burned.captions,
        captionCount: burned.caption_count,
        lineBreaks: burned.line_breaks,
        overlaps: burned.overlaps,
        assWrapStyle: burned.ass_wrap_style,
        baseVideoFilename: path.basename(composedFinalVideoPath),
        baseVideoUrl: outputs.finalVideoUrl,
        subtitleLayerPolicy: "topmost-after-ppt-broll",
        finalSubtitleTimingPolicy
      }
    };
  }
  return {
    ...outputs,
    ...topSubtitleOutputs,
    selectedFeatures: {
      ...(outputs.selectedFeatures || {}),
      burnSubtitles: true,
      roughCut: Boolean(project.selectedFeatures?.roughCut),
      highCostDeferred: false,
      labels: selectedFeatureLabels(options)
    },
    processingOptions: storedProcessingOptions(options),
    workflow: {
      phase: "outputs-ready",
      awaitingRoughCutApproval: false,
      awaitingSubtitleApproval: false,
      highCostGeneratedAfterSubtitleConfirmation: true
    },
    editingProfile: {
      ...(outputs.editingProfile || {}),
      highCostPolicy: "generated-after-subtitles-confirmed",
      subtitlePolicy: "confirmed-subtitles-burned-after-ppt-broll"
    },
    transcription: {
      ...(project.transcription || {}),
      confirmedSubtitleTimelineUrl: `/outputs/jobs/${jobId}/${encodeRelativeUrlPath(path.relative(jobDirectory, confirmed.timelinePath))}`
    }
  };
}

async function generateOutputsAfterConfirmedRoughCut({ project, jobId, roughCutVideoPath, roughCutPlan }) {
  const jobDirectory = path.join(outputDirectory, jobId);
  const roughCutDirectory = path.join(jobDirectory, "roughcut");
  const safeBase = safeTitle(project.title || "影片內容");
  const confirmedTimelinePath = path.join(roughCutDirectory, `${safeBase}-確認後語音時間線.json`);
  const confirmed = await createConfirmedRoughCutTimeline({
    project,
    jobDirectory,
    roughCutPlan,
    outputPath: confirmedTimelinePath
  });
  const outputDurationSeconds = await probeDurationSeconds(
    roughCutVideoPath,
    roughCutPlan.summary?.estimatedOutputSeconds || roughCutPlan.summary?.keptSeconds || roughCutPlan.durationSeconds || project.durationSeconds || 0
  );
  let options = {
    ...processingOptionsFromProject(project),
    roughCut: false
  };
  options = disablePptInsertionForVerticalMedia(options, project.sourceMediaProfile || {}).options;
  if (options.burnSubtitles) {
    return prepareSubtitleReviewBeforeHighCost({
      jobId,
      title: project.title || safeBase,
      transcript: confirmed.transcript,
      durationSeconds: outputDurationSeconds,
      options: {
        ...options,
        roughCut: true
      },
      mediaPath: roughCutVideoPath,
      sharedTimelinePath: confirmed.timelinePath,
      sourceBasename: "roughcut-source",
      afterRoughCut: true,
      transcriptVersionId: project.roughCutReview?.transcriptVersionId || project.transcriptBasis?.versionId || "",
      transcriptVersionKind: project.roughCutReview?.transcriptVersionKind || project.transcriptBasis?.kind || "",
      transcriptVersionLabel: project.roughCutReview?.transcriptVersionLabel || project.transcriptBasis?.label || ""
    });
  }
  options = resolvePptSlideCount(options, confirmed.transcript, { durationSeconds: outputDurationSeconds });
  const outline = buildStoryOutline(confirmed.transcript, { slideCount: options.slideCount, context: options.context });
  const outputs = await assembleOutputs({
    jobId,
    title: project.title || safeBase,
    transcript: confirmed.transcript,
    durationSeconds: outputDurationSeconds,
    options,
    mediaPath: roughCutVideoPath,
    sharedTimelinePath: confirmed.timelinePath,
    sharedOutline: outline,
    sourceBasename: "roughcut-source",
    deferHighCostUntilRoughCut: false,
    transcriptVersionId: project.roughCutReview?.transcriptVersionId || project.transcriptBasis?.versionId || "",
    transcriptVersionKind: project.roughCutReview?.transcriptVersionKind || project.transcriptBasis?.kind || "",
    transcriptVersionLabel: project.roughCutReview?.transcriptVersionLabel || project.transcriptBasis?.label || ""
  });
  return {
    ...outputs,
    workflow: {
      phase: outputs.subtitleReview?.status === "needs-review" ? "subtitle-review" : "outputs-ready",
      awaitingRoughCutApproval: false,
      highCostGeneratedAfterRoughCut: true
    },
    editingProfile: {
      ...(outputs.editingProfile || {}),
      highCostPolicy: "generated-after-roughcut-confirmed",
      roughCutPolicy: "confirmed-roughcut-before-high-cost"
    },
    transcription: {
      ...(project.transcription || {}),
      roughCutTimelineUrl: `/outputs/jobs/${jobId}/${encodeRelativeUrlPath(path.relative(jobDirectory, confirmed.timelinePath))}`
    }
  };
}

async function assembleOutputs({ jobId, title, transcript, durationSeconds, options, mediaPath, sharedTimelinePath = "", pauseTimelinePath = "", sharedOutline = null, sourceBasename = "source", deferHighCostUntilRoughCut = false, forcedRoughCutKeepRanges = null, forcedRoughCutSource = "highlight-transcript", forcedRoughCutRemovalReason = "不在精華摘要稿內", forcedRoughCutRemovalAnnotations = [], transcriptVersionId = "", transcriptVersionKind = "", transcriptVersionLabel = "" }) {
  const jobDirectory = path.join(outputDirectory, jobId);
  const storyboardDirectory = path.join(jobDirectory, "storyboard");
  const aiBrollDirectory = path.join(jobDirectory, "ai-broll");
  const subtitlesDirectory = path.join(jobDirectory, "subtitles");
  await mkdir(jobDirectory, { recursive: true });
  options = resolvePptSlideCount(options, transcript, { durationSeconds });
  const mediaProfile = mediaPath ? await probeMedia(mediaPath) : {};
  const verticalPptInsertDecision = disablePptInsertionForVerticalMedia(options, mediaProfile);
  options = verticalPptInsertDecision.options;
  const workflowSkills = await inspectWorkflowSkills();
  const requiredSkillNames = skillNamesForOptions(options);
  assertWorkflowSkillsReady(workflowSkills, requiredSkillNames);
  const skillVersions = workflowSkillSnapshot(workflowSkills, requiredSkillNames);
  let sourceMediaPath;
  let sourceMediaFilename;
  let sourceMediaMode = "";
  if ((options.burnSubtitles || options.roughCut) && mediaPath) {
    sourceMediaFilename = `${safeTitle(sourceBasename, "source")}${path.extname(mediaPath).toLowerCase() || ".mp4"}`;
    sourceMediaPath = path.join(jobDirectory, sourceMediaFilename);
    sourceMediaMode = await linkOrCopyFile(mediaPath, sourceMediaPath);
  }
  const workingMediaPath = sourceMediaPath || mediaPath;

  const transcriptPath = path.join(jobDirectory, `${title}-逐字稿.txt`);
  const captionTranscript = formatTranscriptForSingleLineCaptions(transcript) || transcript.trim();
  if (options.outputTranscript) await writeFile(transcriptPath, `${captionTranscript}\n`, "utf8");

  const outline = Array.isArray(sharedOutline) && sharedOutline.length
    ? sharedOutline
    : buildStoryOutline(transcript, { slideCount: options.slideCount, context: options.context });
  if (options.roughCut && deferHighCostUntilRoughCut) {
    const roughCutReview = sourceMediaPath
      ? await createRoughCutDraft({
          jobId,
          title,
          mediaPath: sourceMediaPath,
          durationSeconds,
          options,
          timelinePath: sharedTimelinePath,
          pauseTimelinePath,
          forcedKeepRanges: forcedRoughCutKeepRanges,
          forcedKeepRangeSource: forcedRoughCutSource,
          forcedKeepRangeRemovalReason: forcedRoughCutRemovalReason,
          forcedKeepRangeRemovalAnnotations: forcedRoughCutRemovalAnnotations,
          transcriptVersionId,
          transcriptVersionKind,
          transcriptVersionLabel
        })
      : null;
    const baseUrl = `/outputs/jobs/${jobId}`;
    return {
      id: jobId,
      title,
      slideCount: 0,
      durationSeconds: Math.round(durationSeconds || 0),
      selectedFeatures: {
        outputTranscript: options.outputTranscript,
        outputPpt: options.outputPpt,
        outputBrollPlan: options.outputBrollPlan,
        burnSubtitles: options.burnSubtitles,
        roughCut: options.roughCut,
        aiBroll: options.aiBroll,
        finalVideo: options.finalVideo,
        insertPpt: options.insertPpt,
        highCostDeferred: true,
        labels: selectedFeatureLabels(options)
      },
      workflow: {
        phase: "roughcut-review",
        awaitingRoughCutApproval: true,
        deferredUntil: "roughcut-confirmed"
      },
      processingOptions: storedProcessingOptions(options),
      editingProfile: {
        name: "精緻語意剪輯",
        highCostPolicy: "defer-until-roughcut-confirmed",
        roughCutPolicy: "roughcut-before-ppt-broll-final",
        sharedSourceMode: sourceMediaMode || (workingMediaPath ? "request-temp" : "none"),
        transcriptLayout: "single-sentence-line",
        featureLabels: ["AI 粗剪先確認", "確認後產生 PPT", "確認後產生 B-roll", "字幕一句一行"]
      },
      skillVersions,
      transcript: options.outputTranscript ? captionTranscript : "",
      transcriptUrl: options.outputTranscript ? `${baseUrl}/${encodeURIComponent(path.basename(transcriptPath))}` : null,
      pptxUrl: null,
      pptPdfUrl: null,
      brollJsonUrl: null,
      brollCsvUrl: null,
      brollPreviewUrl: null,
      finalVideoUrl: null,
      roughCutVideoUrl: null,
      roughCutPlanUrl: roughCutReview ? `${baseUrl}/roughcut/${encodeURIComponent(roughCutReview.planFilename)}` : null,
      roughCutReportUrl: roughCutReview ? `${baseUrl}/roughcut/${encodeURIComponent(roughCutReview.reportFilename)}` : null,
      roughCutReview: roughCutReview ? {
        ...roughCutReview,
        sourceVideoUrl: `${baseUrl}/${encodeURIComponent(roughCutReview.sourceVideoFilename)}`,
        previewVideoUrl: roughCutReview.previewVideoRelativePath
          ? `${baseUrl}/${encodeRelativeUrlPath(roughCutReview.previewVideoRelativePath)}`
          : roughCutReview.previewVideoFilename ? `${baseUrl}/roughcut/${encodeURIComponent(roughCutReview.previewVideoFilename)}` : null,
        timelineUrl: roughCutReview.timelineRelativePath
          ? `${baseUrl}/${encodeRelativeUrlPath(roughCutReview.timelineRelativePath)}`
          : `${baseUrl}/roughcut/${encodeURIComponent(roughCutReview.timelineFilename)}`,
        planUrl: `${baseUrl}/roughcut/${encodeURIComponent(roughCutReview.planFilename)}`,
        reportUrl: `${baseUrl}/roughcut/${encodeURIComponent(roughCutReview.reportFilename)}`
      } : null,
      subtitleReview: null,
      subtitledVideoUrl: null,
      subtitleSrtUrl: null,
      subtitleAssUrl: null,
      pptPreviewUrls: [],
      aiBrollGenerated: 0,
      broll: []
    };
  }

  const needsBrollPlan = options.outputPpt || options.insertPpt || options.outputBrollPlan || options.aiBroll;
  const requestedBrollTarget = (options.outputBrollPlan || options.aiBroll) && options.aiBrollCount > 0
    ? options.aiBrollCount
    : 0;
  const brollOutline = needsBrollPlan && requestedBrollTarget > 0
    ? buildStoryOutline(transcript, {
        slideCount: requestedBrollTarget + 4,
        context: options.context,
        maxContentSlides: Math.max(8, requestedBrollTarget)
      })
    : outline;
  let sharedTimeline = null;
  if (needsBrollPlan && sharedTimelinePath) {
    try {
      sharedTimeline = JSON.parse(await readFile(sharedTimelinePath, "utf8"));
    } catch {
      sharedTimeline = null;
    }
  }
  const unalignedBrollPlan = needsBrollPlan
    ? buildBrollPlan(brollOutline, { durationSeconds, style: options.brollStyle, targetCount: requestedBrollTarget })
    : [];
  const brollTargetDimensions = mediaMatchedBrollDimensions(mediaProfile);
  const brollPlan = alignBrollPlanToTimeline(unalignedBrollPlan, sharedTimeline, { durationSeconds })
    .map((item) => ({
      ...item,
      targetFormat: {
        width: brollTargetDimensions.width,
        height: brollTargetDimensions.height,
        aspect: brollTargetDimensions.aspect
      }
    }));
  const usesSeparateBrollOutline = brollOutline !== outline;
  const pptBrollPlan = (options.outputPpt || options.insertPpt)
    ? usesSeparateBrollOutline
      ? alignBrollPlanToTimeline(buildBrollPlan(outline, { durationSeconds, style: options.brollStyle }), sharedTimeline, { durationSeconds })
      : brollPlan
    : [];
  const aiMotions = options.aiBroll
    ? await generateLocalBrollMotion(brollPlan, aiBrollDirectory, { maxClips: options.aiBrollCount, targetDimensions: brollTargetDimensions })
    : [];
  const skippedAiBroll = Array.isArray(aiMotions.skipped) ? aiMotions.skipped : [];
  const aiClips = await createMotionBrollClips(aiMotions, brollPlan, aiBrollDirectory, { targetDimensions: brollTargetDimensions });
  const skippedBrollExports = Array.isArray(aiClips.skipped) ? aiClips.skipped : [];
  const allSkippedAiBroll = [...skippedAiBroll, ...skippedBrollExports]
    .filter((item, index, items) => items.findIndex((candidate) => Number(candidate.id) === Number(item.id)) === index);
  const skippedAiBrollById = new Map(allSkippedAiBroll.map((item) => [Number(item.id), item]));
  const aiMotionsById = new Map(aiMotions.map((motion) => [motion.id, motion]));
  const aiClipsById = new Map(aiClips.map((clip) => [clip.id, clip]));
  const framePlan = needsBrollPlan && workingMediaPath
    ? brollPlan.filter((item) => !aiMotionsById.has(item.id))
    : [];
  const frames = framePlan.length ? await extractStoryboardFrames(workingMediaPath, framePlan, storyboardDirectory) : [];
  const framesById = new Map(frames.map((frame) => [frame.id, frame]));
  const visualFramesById = new Map(framesById);
  for (const motion of aiMotions) {
    visualFramesById.set(motion.id, { ...motion, path: motion.firstFramePath });
  }
  const orderedFrames = brollPlan.map((item) => visualFramesById.get(item.id) || null);
  const orderedPptFrames = [];
  const previewPath = path.join(jobDirectory, options.aiBroll ? "ai-broll-preview.mp4" : "broll-placement-preview.mp4");
  const generatedPreview = options.aiBroll && aiClips.length
    ? await createClipMontage(aiClips, previewPath)
    : options.outputBrollPlan ? await createStoryboardPreview(frames, previewPath) : undefined;

  const jsonPath = path.join(jobDirectory, `${title}-B-roll規劃.json`);
  const csvPath = path.join(jobDirectory, `${title}-B-roll規劃.csv`);
  const pptxPath = path.join(jobDirectory, `${title}-簡報.pptx`);
  const pptPdfPath = path.join(jobDirectory, `${title}-簡報.pdf`);
  if (options.outputBrollPlan) {
    await writeFile(jsonPath, `${JSON.stringify(brollPlan, null, 2)}\n`, "utf8");
    await writeFile(csvPath, `\uFEFF${brollPlanToCsv(brollPlan)}`, "utf8");
  }

  const pptPreviewDirectory = path.join(jobDirectory, "ppt-preview");
  const slideFiles = [];
  const slideImagePaths = [];
  if (options.outputPpt) {
    const presentation = await generatePresentation({
      jobId,
      outputPath: pptxPath,
      pdfOutputPath: pptPdfPath,
      title,
      outline,
      brollPlan: pptBrollPlan,
      timelinePlan: pptBrollPlan,
      frames: orderedPptFrames,
      durationSeconds
    });
    await mkdir(pptPreviewDirectory, { recursive: true });
    slideFiles.push(...(await readdir(presentation.previewDirectory))
      .filter((filename) => /^slide-\d+\.png$/i.test(filename))
      .sort((left, right) => left.localeCompare(right, undefined, { numeric: true })));
    for (const filename of slideFiles) {
      const destination = path.join(pptPreviewDirectory, filename);
      await copyFile(path.join(presentation.previewDirectory, filename), destination);
      slideImagePaths.push(destination);
    }
  }

  const finalVideoPath = path.join(jobDirectory, `${title}-完整成片.mp4`);
  let finalVideo;
  if (options.finalVideo && workingMediaPath) {
    if (aiClips.length || (options.insertPpt && slideImagePaths.length)) {
      finalVideo = await composeFinalVideo({
        mediaPath: workingMediaPath,
        clips: aiClips,
        plan: brollPlan,
        slidePlan: pptBrollPlan,
        slideImagePaths: options.insertPpt ? slideImagePaths : [],
        outputPath: finalVideoPath,
        durationSeconds
      });
    } else {
      await linkOrCopyFile(workingMediaPath, finalVideoPath);
      finalVideo = finalVideoPath;
    }
  }
  let subtitleReview = null;
  if (options.burnSubtitles && sourceMediaPath) {
    const subtitleBasePath = finalVideo ? finalVideoPath : sourceMediaPath;
    const subtitleBaseMedia = await probeMedia(subtitleBasePath);
    const subtitleDraft = await createSubtitleDraft({
      mediaPath: subtitleBasePath,
      outputDirectory: subtitlesDirectory,
      language: options.language,
      context: options.context,
      timelinePath: sharedTimelinePath,
      transcriptText: transcript,
      strictTranscript: true
    });
    const draftCaptions = subtitleDraft.captions.map((caption, index) => ({
      ...caption,
      sourceCaptionId: Number(caption.sourceCaptionId || caption.id || index + 1)
    }));
    assertSubtitleTranscriptIntegrity(draftCaptions, transcript, { transcriptVersionKind });
    subtitleReview = {
      status: "needs-review",
      captionCount: subtitleDraft.caption_count,
      captions: draftCaptions,
      roughCutSourceCaptions: draftCaptions,
      transcriptVersionId,
      transcriptVersionKind,
      transcriptVersionLabel,
      transcriptSource: transcriptVersionKind === "ai-highlight-summary" ? "selected-highlight-script" : transcriptVersionKind ? "selected-transcript-version" : "unknown",
      baseVideoFilename: finalVideo ? path.basename(finalVideoPath) : sourceMediaFilename,
      sourceVideoFilename: sourceMediaFilename,
      draftSrtFilename: path.basename(subtitleDraft.output_srt),
      draftAssFilename: path.basename(subtitleDraft.output_ass),
      width: subtitleBaseMedia.width || 1280,
      height: subtitleBaseMedia.height || 720,
      timelineFilename: path.basename(subtitleDraft.timeline),
      timelineRelativePath: path.relative(jobDirectory, subtitleDraft.timeline),
      gapReportFilename: path.basename(subtitleDraft.gap_report),
      width: subtitleDraft.width,
      height: subtitleDraft.height,
      durationSeconds: subtitleDraft.duration_seconds,
      lineBreaks: subtitleDraft.line_breaks,
      overlaps: subtitleDraft.overlaps,
      assWrapStyle: subtitleDraft.ass_wrap_style,
      transcriptMatch: subtitleDraft.transcript_match,
      speechCoverage: subtitleDraft.speech_coverage
    };
  }

  const baseUrl = `/outputs/jobs/${jobId}`;
  const roughCutReview = options.roughCut && sourceMediaPath
    ? await createRoughCutDraft({
        jobId,
        title,
        mediaPath: sourceMediaPath,
        durationSeconds,
        options,
        timelinePath: sharedTimelinePath,
        pauseTimelinePath,
        forcedKeepRanges: forcedRoughCutKeepRanges,
        forcedKeepRangeSource: forcedRoughCutSource,
        forcedKeepRangeRemovalReason: forcedRoughCutRemovalReason,
        forcedKeepRangeRemovalAnnotations: forcedRoughCutRemovalAnnotations,
        transcriptVersionId,
        transcriptVersionKind,
        transcriptVersionLabel
      })
    : null;
  const outputRelativeUrl = (directory, filePath) => path.relative(directory, filePath)
    .split(path.sep)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const aiFrameUrl = (motion) => {
    const framePath = motion.firstFramePath
      || motion.keyframePath
      || motion.path
      || (motion.frameDirectory ? path.join(motion.frameDirectory, "frame-000.png") : null);
    return framePath ? `${baseUrl}/ai-broll/${outputRelativeUrl(aiBrollDirectory, framePath)}` : null;
  };
  return {
    id: jobId,
    title,
    slideCount: options.outputPpt ? outline.length + 4 : 0,
    durationSeconds: Math.round(durationSeconds || 0),
    selectedFeatures: {
      outputTranscript: options.outputTranscript,
      outputPpt: options.outputPpt,
      outputBrollPlan: options.outputBrollPlan,
      burnSubtitles: options.burnSubtitles,
      roughCut: options.roughCut,
      aiBroll: options.aiBroll,
      finalVideo: options.finalVideo,
      insertPpt: options.insertPpt,
      labels: selectedFeatureLabels(options)
    },
    workflow: {
      phase: "outputs-ready",
      awaitingRoughCutApproval: false
    },
    processingOptions: storedProcessingOptions(options),
    editingProfile: {
      name: "精緻語意剪輯",
      pptCueStrategy: options.insertPpt ? "chapter-lead" : "download-only",
      brollPromptPolicy: "sentence-fit-literal-scene-prop-origin-quality-gate",
      sharedSourceMode: sourceMediaMode || (workingMediaPath ? "request-temp" : "none"),
      roughCutPolicy: options.roughCut ? "review-before-render" : "off",
      transcriptLayout: "single-sentence-line",
      featureLabels: ["PPT 章節切入", "細節 B-roll", "AI 粗剪可調整", "字幕一句一行"]
    },
    skillVersions,
    transcript: options.outputTranscript ? captionTranscript : "",
    transcriptUrl: options.outputTranscript ? `${baseUrl}/${encodeURIComponent(path.basename(transcriptPath))}` : null,
    pptxUrl: options.outputPpt ? `${baseUrl}/${encodeURIComponent(path.basename(pptxPath))}` : null,
    pptPdfUrl: options.outputPpt ? `${baseUrl}/${encodeURIComponent(path.basename(pptPdfPath))}` : null,
    brollJsonUrl: options.outputBrollPlan ? `${baseUrl}/${encodeURIComponent(path.basename(jsonPath))}` : null,
    brollCsvUrl: options.outputBrollPlan ? `${baseUrl}/${encodeURIComponent(path.basename(csvPath))}` : null,
    brollPreviewUrl: generatedPreview ? `${baseUrl}/${path.basename(previewPath)}` : null,
    finalVideoUrl: finalVideo ? `${baseUrl}/${encodeURIComponent(path.basename(finalVideoPath))}` : null,
    roughCutVideoUrl: null,
    roughCutPlanUrl: roughCutReview ? `${baseUrl}/roughcut/${encodeURIComponent(roughCutReview.planFilename)}` : null,
    roughCutReportUrl: roughCutReview ? `${baseUrl}/roughcut/${encodeURIComponent(roughCutReview.reportFilename)}` : null,
    roughCutReview: roughCutReview ? {
      ...roughCutReview,
      sourceVideoUrl: `${baseUrl}/${encodeURIComponent(roughCutReview.sourceVideoFilename)}`,
      previewVideoUrl: roughCutReview.previewVideoRelativePath
        ? `${baseUrl}/${encodeRelativeUrlPath(roughCutReview.previewVideoRelativePath)}`
        : roughCutReview.previewVideoFilename ? `${baseUrl}/roughcut/${encodeURIComponent(roughCutReview.previewVideoFilename)}` : null,
      timelineUrl: roughCutReview.timelineRelativePath
        ? `${baseUrl}/${encodeRelativeUrlPath(roughCutReview.timelineRelativePath)}`
        : `${baseUrl}/roughcut/${encodeURIComponent(roughCutReview.timelineFilename)}`,
      planUrl: `${baseUrl}/roughcut/${encodeURIComponent(roughCutReview.planFilename)}`,
      reportUrl: `${baseUrl}/roughcut/${encodeURIComponent(roughCutReview.reportFilename)}`
    } : null,
    subtitleReview: subtitleReview ? {
      ...subtitleReview,
      draftSrtUrl: `${baseUrl}/subtitles/${encodeURIComponent(subtitleReview.draftSrtFilename)}`,
      draftAssUrl: `${baseUrl}/subtitles/${encodeURIComponent(subtitleReview.draftAssFilename)}`,
      timelineUrl: subtitleReview.timelineRelativePath
        ? `${baseUrl}/${encodeRelativeUrlPath(subtitleReview.timelineRelativePath)}`
        : `${baseUrl}/subtitles/${encodeURIComponent(subtitleReview.timelineFilename)}`,
      gapReportUrl: `${baseUrl}/subtitles/${encodeURIComponent(subtitleReview.gapReportFilename)}`,
      baseVideoUrl: `${baseUrl}/${encodeURIComponent(subtitleReview.baseVideoFilename)}`,
      sourceVideoUrl: `${baseUrl}/${encodeURIComponent(subtitleReview.sourceVideoFilename)}`
    } : null,
    subtitledVideoUrl: null,
    subtitleSrtUrl: null,
    subtitleAssUrl: null,
    pptPreviewUrls: slideFiles.map((filename) => `${baseUrl}/ppt-preview/${filename}`),
    aiBrollGenerated: aiClips.length,
    generationNotices: mergeGenerationNotices(verticalPptInsertDecision.notice, allSkippedAiBroll.map((item) => ({
      type: "broll-skipped",
      id: Number(item.id),
      title: item.title || `B-roll ${item.id}`,
      message: item.stage === "clip-export"
        ? `B-roll 第 ${item.id} 段匯出失敗，已略過並繼續完成其餘內容。`
        : `B-roll 第 ${item.id} 段未通過品質檢查，已略過並繼續完成其餘內容。`,
      reason: item.reason || (item.stage === "clip-export" ? "動態片段匯出失敗" : "畫面品質不合格"),
      attempts: Number(item.attempts) || undefined,
      stage: item.stage || "keyframe-generation"
    }))),
    broll: brollPlan.map((item) => ({
      ...item,
      frameUrl: aiMotionsById.has(item.id)
        ? aiFrameUrl(aiMotionsById.get(item.id))
        : framesById.has(item.id) ? `${baseUrl}/storyboard/${framesById.get(item.id).filename}` : null,
      videoUrl: aiClipsById.has(item.id) ? `${baseUrl}/ai-broll/${aiClipsById.get(item.id).filename}` : null,
      generationMode: aiClipsById.has(item.id)
        ? aiClipsById.get(item.id).generationMode
        : framesById.has(item.id) ? "reference-frame" : "prompt-only",
      generationStatus: skippedAiBrollById.get(Number(item.id))?.stage === "clip-export"
        ? "skipped-export"
        : skippedAiBrollById.has(Number(item.id)) ? "skipped-quality" : aiClipsById.has(item.id) ? "generated" : "planned",
      generationIssue: skippedAiBrollById.get(Number(item.id))?.reason || null
    }))
  };
}

app.get("/api/projects/:jobId/downloads", async (request, response) => {
  try {
    const jobId = String(request.params.jobId || "");
    if (!/^[a-f0-9-]{36}$/i.test(jobId)) {
      response.status(404).json({ error: "找不到這個專案。", errorStage: "upload", errorAction: workflowErrorAction("upload") });
      return;
    }
    const projectPath = path.join(outputDirectory, jobId, "project.json");
    const project = JSON.parse(await readFile(projectPath, "utf8"));
    response.json({ id: jobId, downloads: await downloadStatusForProject(project) });
  } catch {
    response.status(404).json({ error: "找不到這個專案。" });
  }
});

app.get("/api/projects/:jobId", async (request, response) => {
  try {
    const jobId = String(request.params.jobId || "");
    const projectDirectory = projectDirectoryForJob(jobId);
    await cancelScheduledProjectCleanup(jobId);
    const project = JSON.parse(await readFile(path.join(projectDirectory, "project.json"), "utf8"));
    if (project.pipelineVersion !== PIPELINE_VERSION) {
      response.status(404).json({ error: "這個結果版本太舊，請重新產生。" });
      return;
    }
    response.json(project);
  } catch {
    response.status(404).json({ error: "找不到這個專案。" });
  }
});

app.get("/api/projects/:jobId/download/:key", async (request, response) => {
  try {
    const jobId = String(request.params.jobId || "");
    const key = String(request.params.key || "");
    if (request.method === "HEAD" && key === "editingPackage") {
      const projectPath = path.join(outputDirectory, jobId, "project.json");
      const project = JSON.parse(await readFile(projectPath, "utf8"));
      const readiness = await editingPackageReadiness(project);
      response.setHeader("X-Editing-Package-Status", readiness.status);
      if (readiness.status === "unavailable") {
        response.status(404).end();
        return;
      }
      if (readiness.status === "ready") {
        const downloadFilename = downloadFilenameForProject(
          project,
          downloadDefinitions.find((item) => item.key === "editingPackage"),
          readiness.filePath
        );
        response.setHeader("X-Download-Filename", encodeURIComponent(downloadFilename));
        response.setHeader("Content-Type", "application/zip");
        response.setHeader("Content-Length", String(readiness.bytes));
        response.status(200).end();
        return;
      }
      response.setHeader("Retry-After", "5");
      response.status(202).end();
      return;
    }
    const { filePath, downloadFilename } = await downloadableFileForRequest(jobId, key);
    response.setHeader("X-Download-Filename", encodeURIComponent(downloadFilename));
    response.download(filePath, downloadFilename);
  } catch (error) {
    response.status(error.statusCode || 404).json({ error: error.message || "找不到這個下載檔。" });
  }
});

app.post("/api/projects/:jobId/cleanup", async (request, response) => {
  try {
    await cleanupProjectArtifacts(String(request.params.jobId || ""), {
      allowPersisted: request.query.allowPersisted === "1"
    });
    response.status(204).end();
  } catch (error) {
    response.status(error.statusCode || 500).json({ error: error.message || "清理暫存失敗。" });
  }
});

app.post("/api/projects/:jobId/editing-package/cleanup", async (request, response) => {
  try {
    await cleanupEditingPackageArtifacts(String(request.params.jobId || ""));
    response.status(204).end();
  } catch (error) {
    response.status(error.statusCode || 404).json({ error: error.message || "清理剪輯包失敗。" });
  }
});

app.post("/api/projects/:jobId/cleanup/schedule", async (request, response) => {
  try {
    const jobId = String(request.params.jobId || "");
    const deleteAfter = await scheduleProjectCleanup(jobId, projectCleanupGraceMs, { allowPersisted: true });
    response.status(202).json({ scheduled: true, deleteAfter });
  } catch (error) {
    response.status(error.statusCode || 404).json({ error: error.message || "找不到這個專案。" });
  }
});

app.post("/api/projects/:jobId/cleanup/cancel", async (request, response) => {
  try {
    await cancelScheduledProjectCleanup(String(request.params.jobId || ""));
    response.status(204).end();
  } catch (error) {
    response.status(error.statusCode || 404).json({ error: error.message || "找不到這個專案。" });
  }
});

app.post("/api/projects/:jobId/save/:key", async (request, response) => {
  try {
    const jobId = String(request.params.jobId || "");
    const key = String(request.params.key || "");
    const { filePath, details, downloadFilename } = await downloadableFileForRequest(jobId, key);
    const destinationPath = await chooseSavePath(downloadFilename);
    if (!destinationPath) {
      response.status(400).json({ error: "已取消儲存。", cancelled: true });
      return;
    }
    await copyFile(filePath, destinationPath);
    response.json({
      saved: true,
      filename: path.basename(destinationPath),
      path: destinationPath,
      bytes: details.size
    });
  } catch (error) {
    const cancelled = /User canceled|使用者已取消|使用者取消|已取消/i.test(error.message || "");
    response.status(cancelled ? 400 : (error.statusCode || 500)).json({
      error: cancelled ? "已取消儲存。" : (error.message || "儲存檔案失敗。"),
      cancelled
    });
  }
});

app.post("/api/projects/:jobId/roughcut/render", async (request, response) => {
  const processingStartedAtMs = Date.now();
  try {
    const jobId = String(request.params.jobId || "");
    if (!/^[a-f0-9-]{36}$/i.test(jobId)) {
      response.status(404).json({ error: "找不到這個專案。" });
      return;
    }

    const projectPath = path.join(outputDirectory, jobId, "project.json");
    const project = JSON.parse(await readFile(projectPath, "utf8"));
    const review = project.roughCutReview;
    if (!review?.sourceVideoFilename) {
      response.status(422).json({ error: "這個專案沒有可調整的 AI 粗剪草稿。", errorStage: "roughcut", errorAction: workflowErrorAction("roughcut") });
      return;
    }

    const durationSeconds = Number(review.durationSeconds || project.durationSeconds) || 0;
    const removals = normalizeEditedRoughCutRemovals(request.body?.removals, durationSeconds);
    const audioGain = parseAudioGain(request.body?.audioGain ?? review.audioGain ?? project.audioGain ?? 1);
    const plan = buildEditedRoughCutPlan({ removals, durationSeconds, review });
    if (!plan.keepRanges.length) {
      response.status(422).json({ error: "目前沒有可保留的影片區段，請縮短或取消部分刪除片段。", errorStage: "roughcut", errorAction: workflowErrorAction("roughcut") });
      return;
    }

    const jobDirectory = path.join(outputDirectory, jobId);
    const roughCutDirectory = path.join(jobDirectory, "roughcut");
    await mkdir(roughCutDirectory, { recursive: true });
    const sourcePath = path.join(jobDirectory, path.basename(review.sourceVideoFilename));
    const safeBase = safeTitle(project.title || "影片內容");
    let outputVideoPath = path.join(roughCutDirectory, `${safeBase}-AI粗剪.mp4`);
    const planPath = path.join(roughCutDirectory, `${safeBase}-AI粗剪計畫.json`);
    const reportPath = path.join(roughCutDirectory, `${safeBase}-AI粗剪報告.txt`);

    const previousRemovals = normalizeEditedRoughCutRemovals(review.removals, durationSeconds);
    let renderedPlanRemovals = [];
    let renderedPlanAudioGain = 1;
    try {
      const renderedPlan = JSON.parse(await readFile(planPath, "utf8"));
      renderedPlanRemovals = normalizeEditedRoughCutRemovals(renderedPlan.removals, durationSeconds);
      renderedPlanAudioGain = parseAudioGain(renderedPlan.audioGain ?? 1);
    } catch {
      renderedPlanRemovals = [];
    }
    const requestedRenderSignature = JSON.stringify({ removals, audioGain });
    const canReuseRenderedVideo = JSON.stringify({ removals: previousRemovals, audioGain: parseAudioGain(review.audioGain ?? 1) }) === requestedRenderSignature
      || JSON.stringify({ removals: renderedPlanRemovals, audioGain: renderedPlanAudioGain }) === requestedRenderSignature;
    if (canReuseRenderedVideo) {
      const existingOutputVideoPath = review.outputVideoFilename
        ? path.join(roughCutDirectory, path.basename(review.outputVideoFilename))
        : outputVideoPath;
      let existingVideoIsComplete = false;
      try {
        const details = await stat(existingOutputVideoPath);
        if (details.isFile() && details.size > 0) {
          const expectedDuration = Number(plan.summary?.estimatedOutputSeconds) || 0;
          const actualDuration = await probeDurationSeconds(existingOutputVideoPath, 0);
          const tolerance = Math.max(1.5, expectedDuration * 0.01);
          existingVideoIsComplete = expectedDuration > 0
            && actualDuration > 0
            && Math.abs(actualDuration - expectedDuration) <= tolerance;
          if (existingVideoIsComplete) outputVideoPath = existingOutputVideoPath;
        }
      } catch {
        existingVideoIsComplete = false;
      }
      if (!existingVideoIsComplete) {
        await createRoughCutVideo({
          mediaPath: sourcePath,
          outputPath: outputVideoPath,
          keepRanges: plan.keepRanges,
          durationSeconds: plan.durationSeconds,
          hasAudio: true,
          audioGain,
          verify: true
        });
      }
    } else {
      await createRoughCutVideo({
        mediaPath: sourcePath,
        outputPath: outputVideoPath,
        keepRanges: plan.keepRanges,
        durationSeconds: plan.durationSeconds,
        hasAudio: true,
        audioGain,
        verify: true
      });
    }
    await writeFile(planPath, `${JSON.stringify({ ...plan, audioGain }, null, 2)}\n`, "utf8");
    await writeFile(reportPath, roughCutPlanToText(plan), "utf8");

    const baseUrl = `/outputs/jobs/${jobId}`;
    const updatedReview = {
      ...review,
      status: "confirmed",
      renderedAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString(),
      summary: plan.summary,
      removals: plan.removals,
      keepRanges: plan.keepRanges,
      audioGain,
      outputVideoFilename: path.basename(outputVideoPath),
      planFilename: path.basename(planPath),
      reportFilename: path.basename(reportPath),
      outputVideoUrl: `${baseUrl}/roughcut/${encodeURIComponent(path.basename(outputVideoPath))}`,
      planUrl: `${baseUrl}/roughcut/${encodeURIComponent(path.basename(planPath))}`,
      reportUrl: `${baseUrl}/roughcut/${encodeURIComponent(path.basename(reportPath))}`
    };
    const shouldGenerateDeferredOutputs = Boolean(
      project.workflow?.awaitingRoughCutApproval
        || project.selectedFeatures?.highCostDeferred
        || project.editingProfile?.highCostPolicy === "defer-until-roughcut-confirmed"
    );
    const integratedFinal = shouldGenerateDeferredOutputs
      ? await generateOutputsAfterConfirmedRoughCut({
          project,
          jobId,
          roughCutVideoPath: outputVideoPath,
          roughCutPlan: plan
        })
      : await integrateRoughCutIntoFinalProject({
          project,
          jobId,
          roughCutVideoPath: outputVideoPath,
          roughCutPlan: plan
        });
    const updated = {
      ...project,
      ...integratedFinal,
      skillVersions: {
        ...(project.skillVersions || {}),
        ...(integratedFinal.skillVersions || {})
      },
      roughCutReview: updatedReview,
      roughCutVideoUrl: updatedReview.outputVideoUrl,
      roughCutPlanUrl: updatedReview.planUrl,
      roughCutReportUrl: updatedReview.reportUrl,
      audioGain,
      selectedFeatures: {
        ...(integratedFinal.selectedFeatures || project.selectedFeatures || {}),
        roughCut: true,
        highCostDeferred: Boolean(integratedFinal.workflow?.awaitingSubtitleApproval),
        integratedFinalVideo: Boolean(integratedFinal.finalVideoUrl),
        labels: selectedFeatureLabels(processingOptionsFromProject({ ...project, ...integratedFinal }))
      },
      workflow: {
        ...(integratedFinal.workflow || {}),
        awaitingRoughCutApproval: false,
        roughCutConfirmedAt: new Date().toISOString()
      },
      processingTiming: appendProcessingPhase(project.processingTiming, {
        startedAtMs: processingStartedAtMs,
        phase: "roughcut-confirmation-and-render"
      })
    };
    await persistProject(updated);
    response.json(updated);
  } catch (error) {
    const isUserError = /粗剪|找不到|請|沒有|不支援|格式|損壞/.test(error.message);
    if (isUserError) console.warn(error.message);
    else console.error(error);
    response.status(error.statusCode || (isUserError ? 400 : 500)).json(workflowErrorPayload(error, isUserError, "roughcut"));
  }
});

app.get("/api/health", async (_request, response) => {
  const workflowSkills = await inspectWorkflowSkills();
  await refreshSpeechSummaryPolisherSkill();
  if (healthCache.payload && healthCache.expiresAt > Date.now()) {
    response.json({
      ...healthCache.payload,
      speechPolisher: speechSummaryPolisherSkill,
      workflowSkills
    });
    return;
  }
  const [status, visuals] = await Promise.all([getLocalWhisperStatus(), getLocalVisualStatus()]);
  const payload = {
    ok: true,
    configured: status.ready,
    engine: "local-whisper",
    model: status.model,
    skill: status.skill,
    note: status.note,
    transcription: {
      punctuation: status.punctuation,
      features: status.features
    },
    speechPolisher: speechSummaryPolisherSkill,
    localVisuals: visuals,
    workflowSkills
  };
  healthCache = { expiresAt: Date.now() + healthCacheTtlMs, payload };
  response.json(payload);
});

app.post("/api/projects", upload.single("video"), async (request, response) => {
  const uploadedPath = request.file?.path;
  const processingStartedAtMs = Date.now();
  const processingStartedAt = new Date(processingStartedAtMs);

  try {
    if (!request.file) {
      response.status(400).json({ error: "請先選擇影片。", errorStage: "upload", errorAction: workflowErrorAction("upload") });
      return;
    }

    const originalFilename = normalizeUploadFilename(request.file.originalname);
    validateMediaFilename(originalFilename);
    let options = parseOptions({
      ...request.body,
      outputTranscript: true,
      outputPpt: false,
      outputBrollPlan: false,
      burnSubtitles: false,
      roughCut: false,
      aiBroll: false,
      finalVideo: false,
      insertPpt: false
    });
    const jobId = crypto.randomUUID();
    const requestedTitle = String(fieldValue(request.body.title) || "").trim();
    const autoNamed = !requestedTitle;
    const workflowSkills = await inspectWorkflowSkills();
    const initialSkillNames = ["transcribe-video-locally", ...(autoNamed ? ["video-title-summarizer"] : [])];
    assertWorkflowSkillsReady(workflowSkills, initialSkillNames);
    const skillVersions = workflowSkillSnapshot(workflowSkills, initialSkillNames);
    const preliminaryTitle = safeTitle(requestedTitle, "影片內容");
    const jobDirectory = path.join(outputDirectory, jobId);
    await mkdir(jobDirectory, { recursive: true });
    const sourceMediaFilename = `source${path.extname(originalFilename).toLowerCase() || ".mp4"}`;
    const sharedSourceMediaPath = path.join(jobDirectory, sourceMediaFilename);
    const sharedSourceMode = await linkOrCopyFile(uploadedPath, sharedSourceMediaPath);
    const sourceMediaUrl = `/outputs/jobs/${jobId}/${encodeURIComponent(sourceMediaFilename)}`;

    const mediaInfo = await probeMedia(sharedSourceMediaPath);
    const contextText = options.context.trim();
    let transcriptResult;
    let sharedTimelinePath = "";
    if (!mediaInfo.hasAudio) {
      if (options.burnSubtitles || options.roughCut) {
        const featureName = options.burnSubtitles && options.roughCut
          ? "燒錄字幕與 AI 粗剪"
          : options.burnSubtitles ? "燒錄字幕" : "AI 粗剪";
        const error = new Error(`${featureName}需要有音軌的影片。這支影片沒有可讀取的音軌，請改上傳有聲音的影片，或取消該功能。`);
        error.statusCode = 422;
        throw error;
      }
      if (contextText.length < 12) {
        const error = new Error("這支影片沒有可讀取的音軌，所以無法自動產生逐字稿。請改上傳有聲音的影片，或在進階設定的「主題補充」或「專有名詞」填入至少一句完整描述後重試。");
        error.statusCode = 422;
        throw error;
      }
      const fallbackTranscript = buildTranscriptFromContext({ title: preliminaryTitle, context: contextText });
      const fallbackTranscriptPath = path.join(jobDirectory, `${preliminaryTitle}-逐字稿-原始.txt`);
      await writeFile(fallbackTranscriptPath, `${fallbackTranscript}\n`, "utf8");
      transcriptResult = {
        transcript: fallbackTranscript,
        transcriptPath: fallbackTranscriptPath,
        segments: 0,
        characters: fallbackTranscript.length,
        languages: [options.language === "auto" ? "zh" : options.language],
        model: "context-fallback",
        punctuation: "context-provided",
        engine: "user-context",
        offline: true,
        noAudioFallback: true
      };
    } else {
      sharedTimelinePath = path.join(jobDirectory, `${preliminaryTitle}-共用語音時間線.json`);
      transcriptResult = await createSharedTimelineTranscription({
        mediaPath: sharedSourceMediaPath,
        outputPath: path.join(jobDirectory, `${preliminaryTitle}-逐字稿-原始.txt`),
        timelinePath: sharedTimelinePath,
        language: options.language,
        context: options.context
      });
    }
    const transcriptQuality = assessTranscriptQuality(transcriptResult.transcript);
    await writeFile(
      path.join(jobDirectory, `${preliminaryTitle}-內容品質.json`),
      `${JSON.stringify(transcriptQuality, null, 2)}\n`,
      "utf8"
    );
    if (!transcriptQuality.usable) {
      const detail = transcriptQuality.issues.join("、");
      const error = new Error(`逐字稿品質不足（${detail}），已停止後續製作，請先修正逐字稿品質。請改選正確語言，並在進階設定補上影片主題或專有名詞後重試。`);
      error.statusCode = 422;
      throw error;
    }
    options = resolvePptSlideCount(options, transcriptQuality.cleaned, { durationSeconds: mediaInfo.durationSeconds });
    const sharedContentOutline = buildStoryOutline(transcriptQuality.cleaned, { slideCount: options.slideCount, context: options.context });
    const titleStrategy = autoNamed
      ? buildTitleStrategy(transcriptQuality.cleaned, {
          slideCount: options.slideCount,
          context: options.context,
          outline: sharedContentOutline
        })
      : null;
    const automaticTitle = titleStrategy?.titleCandidates?.[0]?.title || titleStrategy?.primaryTitle;
    const generatedTitle = autoNamed ? safeTitle(automaticTitle, preliminaryTitle) : safeTitle(requestedTitle, preliminaryTitle);
    const baseTimeline = sharedTimelinePath ? JSON.parse(await readFile(sharedTimelinePath, "utf8")) : {
      text: transcriptQuality.cleaned,
      segments: []
    };
    const originalVersion = await writeTranscriptVersion({
      jobId,
      jobDirectory,
      id: "01-whisper-original",
      kind: "whisper-original",
      label: "原始逐字稿",
      text: transcriptQuality.cleaned,
      timeline: baseTimeline,
      mappingConfidence: sharedTimelinePath ? "source" : "text-only",
      mappings: (Array.isArray(baseTimeline.segments) ? baseTimeline.segments : []).map((segment, index) => ({
        index: index + 1,
        sourceSegmentId: segment.id || index + 1,
        sourceSegmentIds: [segment.id || index + 1],
        start: Number(segment.start) || 0,
        end: Number(segment.end) || 0,
        text: String(segment.text || "")
      })),
      quality: transcriptQuality
    });

    const payload = {
      id: jobId,
      title: generatedTitle,
      slideCount: 0,
      durationSeconds: Math.round(mediaInfo.durationSeconds || 0),
      sourceMediaProfile: {
        width: mediaInfo.width || null,
        height: mediaInfo.height || null,
        frameRate: mediaInfo.frameRate || null,
        bitrateKbps: mediaInfo.bitrateKbps || null,
        videoBitrateKbps: mediaInfo.videoBitrateKbps || null,
        audioBitrateKbps: mediaInfo.audioBitrateKbps || null
      },
      selectedFeatures: {
        outputTranscript: options.outputTranscript,
        outputPpt: options.outputPpt,
        outputBrollPlan: options.outputBrollPlan,
        burnSubtitles: options.burnSubtitles,
        roughCut: options.roughCut,
        aiBroll: options.aiBroll,
        finalVideo: options.finalVideo,
        insertPpt: options.insertPpt,
        labels: selectedFeatureLabels(options)
      },
      workflow: {
        phase: "transcript-review",
        awaitingTranscriptApproval: true,
        nextStep: "choose-transcript-version"
      },
      processingOptions: storedProcessingOptions(options),
      editingProfile: {
        name: "逐字稿優先工作流",
        transcriptPolicy: "review-before-generation",
        sharedSourceMode,
        transcriptLayout: "single-sentence-line",
        featureLabels: ["先修逐字稿", "指定版本生成", "共用語音時間線"]
      },
      skillVersions,
      transcript: transcriptQuality.cleaned,
      transcriptUrl: originalVersion.textUrl,
      originalTranscriptUrl: originalVersion.textUrl,
      editedTranscriptUrl: null,
      proofreadTranscriptUrl: null,
      highlightTranscriptUrl: null,
      pptxUrl: null,
      pptPdfUrl: null,
      brollJsonUrl: null,
      brollCsvUrl: null,
      brollPreviewUrl: null,
      finalVideoUrl: null,
      roughCutVideoUrl: null,
      roughCutPlanUrl: null,
      roughCutReportUrl: null,
      roughCutReview: null,
      subtitleReview: null,
      subtitledVideoUrl: null,
      subtitleSrtUrl: null,
      subtitleAssUrl: null,
      pptPreviewUrls: [],
      aiBrollGenerated: 0,
      broll: [],
      filename: autoNamed ? `${generatedTitle}${path.extname(originalFilename) || ".mp4"}` : originalFilename,
      sourceFilename: originalFilename,
      sourceMediaUrl,
      autoNamed,
      titleSource: autoNamed ? "video-title-summarizer" : "user",
      titleStrategy,
      transcriptReview: {
        status: "needs-review",
        originalVersionId: originalVersion.id,
        selectedVersionId: originalVersion.id,
        versions: [originalVersion],
        canGenerateHighlight: Boolean(sharedTimelinePath),
        guidance: "先確認逐字稿；後續會使用你指定的版本生成。"
      },
      processingTiming: {
        startedAt: processingStartedAt.toISOString(),
        completedAt: new Date().toISOString(),
        elapsedSeconds: Number(((Date.now() - processingStartedAtMs) / 1000).toFixed(1)),
        activeElapsedSeconds: Number(((Date.now() - processingStartedAtMs) / 1000).toFixed(1)),
        source: "server",
        phase: "transcription"
      },
      transcription: {
        ...transcriptResult,
        quality: transcriptQuality,
        timelineUrl: sharedTimelinePath ? `/outputs/jobs/${jobId}/${encodeRelativeUrlPath(path.relative(jobDirectory, sharedTimelinePath))}` : null
      }
    };
    await persistProject(payload);
    response.json(payload);
  } catch (error) {
    const isUserError = /不支援|沒有|請先|尚未設定|損壞|格式|辨識完成|品質不足/.test(error.message);
    if (isUserError) console.warn(error.message);
    else console.error(error);
    response.status(error.statusCode || (isUserError ? 400 : 500)).json(workflowErrorPayload(error, isUserError, "transcript"));
  } finally {
    if (uploadedPath) await rm(uploadedPath, { force: true });
  }
});

app.post("/api/projects/:jobId/transcripts", async (request, response) => {
  try {
    const jobId = String(request.params.jobId || "");
    const jobDirectory = projectDirectoryForJob(jobId);
    const projectPath = path.join(jobDirectory, "project.json");
    const project = JSON.parse(await readFile(projectPath, "utf8"));
    const rawText = normalizeTranscriptInput(request.body?.text);
    const cleanText = normalizeTranscriptText(rawText);
    if (!cleanText) {
      response.status(422).json({ error: "已確認原稿不能是空白。", errorStage: "transcript", errorAction: workflowErrorAction("transcript") });
      return;
    }
    const sourceVersionId = String(request.body?.sourceVersionId || project.transcriptReview?.selectedVersionId || "");
    const sourceVersion = latestTranscriptVersion(project, sourceVersionId);
    const preserveSourceKind = Boolean(request.body?.preserveSourceKind)
      && ["ai-proofread", "ai-highlight-summary"].includes(sourceVersion?.kind);
    const versionKind = preserveSourceKind ? sourceVersion.kind : "user-edited-full";
    const versionLabel = versionKind === "ai-proofread"
      ? "AI 校稿版（已修改）"
      : versionKind === "ai-highlight-summary"
        ? "AI 精華摘要稿（已修改）"
        : "已確認原稿";
    const version = await createTranscriptVersionFromText({
      project,
      jobId,
      text: rawText,
      sourceVersionId,
      kind: versionKind,
      label: versionLabel
    });
    let versions = [
      ...(Array.isArray(project.transcriptReview?.versions) ? project.transcriptReview.versions : []),
      version
    ];
    let proofreadVersion = null;
    let highlightVersion = null;
    let workflowSkills = null;
    if (versionKind === "user-edited-full") {
      const projectWithConfirmedTranscript = {
        ...project,
        transcript: version.text,
        transcriptUrl: version.textUrl,
        editedTranscriptUrl: version.textUrl,
        transcriptReview: {
          ...(project.transcriptReview || {}),
          selectedVersionId: version.id,
          editedVersionId: version.id,
          versions
        }
      };
      proofreadVersion = await createProofreadTranscriptVersion({
        project: projectWithConfirmedTranscript,
        jobId,
        sourceVersionId: version.id,
        text: version.text
      });
      const projectWithProofreadTranscript = {
        ...projectWithConfirmedTranscript,
        proofreadTranscriptUrl: proofreadVersion.textUrl,
        transcriptReview: {
          ...projectWithConfirmedTranscript.transcriptReview,
          proofreadVersionId: proofreadVersion.id,
          versions: [...versions, proofreadVersion]
        }
      };
      highlightVersion = await createHighlightTranscriptVersion({
        project: projectWithProofreadTranscript,
        jobId,
        // AI 精華稿是剪輯依據，必須從使用者確認的原稿抽取原話；
        // AI 校稿版只供閱讀修整，不能拿來改寫精華稿來源。
        sourceVersionId: version.id
      });
      versions = [...versions, proofreadVersion, highlightVersion];
      workflowSkills = await inspectWorkflowSkills();
    }
    const updated = {
      ...project,
      transcript: version.text,
      transcriptUrl: version.textUrl,
      editedTranscriptUrl: version.textUrl,
      proofreadTranscriptUrl: proofreadVersion?.textUrl || (version.kind === "ai-proofread" ? version.textUrl : project.proofreadTranscriptUrl),
      highlightTranscriptUrl: highlightVersion?.textUrl || (version.kind === "ai-highlight-summary" ? version.textUrl : project.highlightTranscriptUrl),
      skillVersions: workflowSkills ? {
        ...(project.skillVersions || {}),
        ...workflowSkillSnapshot(workflowSkills, ["speech-summary-polisher", "extract-verbatim-highlights"])
      } : project.skillVersions,
      transcriptReview: {
        ...(project.transcriptReview || {}),
        status: "needs-review",
        selectedVersionId: version.id,
        editedVersionId: version.id,
        proofreadVersionId: proofreadVersion?.id || project.transcriptReview?.proofreadVersionId,
        highlightVersionId: highlightVersion?.id || project.transcriptReview?.highlightVersionId,
        versions
      }
    };
    await persistProject(updated);
    response.json(updated);
  } catch (error) {
    const isUserError = /找不到|逐字稿|空白|時間線/.test(error.message);
    if (isUserError) console.warn(error.message);
    else console.error(error);
    response.status(error.statusCode || (isUserError ? 400 : 500)).json(workflowErrorPayload(error, isUserError, "transcript"));
  }
});

app.post("/api/projects/:jobId/transcripts/proofread", async (request, response) => {
	try {
	  const jobId = String(request.params.jobId || "");
	  const jobDirectory = projectDirectoryForJob(jobId);
	  const projectPath = path.join(jobDirectory, "project.json");
	  const project = JSON.parse(await readFile(projectPath, "utf8"));
	  const sourceVersionId = String(request.body?.sourceVersionId || project.transcriptReview?.selectedVersionId || "");
	  const sourceVersion = firstEditedTranscriptVersion(project, sourceVersionId);
	  if (!sourceVersion?.text) {
	    response.status(422).json({ error: "請先確認原稿，再產生 AI 校稿版。", errorStage: "transcript", errorAction: workflowErrorAction("transcript") });
	    return;
	  }
	  const proofreadVersion = await createProofreadTranscriptVersion({
	    project,
	    jobId,
	    sourceVersionId: sourceVersion.id,
	    text: sourceVersion.text || ""
	  });
    const workflowSkills = await inspectWorkflowSkills();
    const versions = [
      ...(Array.isArray(project.transcriptReview?.versions) ? project.transcriptReview.versions : []),
      proofreadVersion
    ];
    const updated = {
      ...project,
      transcript: proofreadVersion.text,
      transcriptUrl: proofreadVersion.textUrl,
      proofreadTranscriptUrl: proofreadVersion.textUrl,
      skillVersions: {
        ...(project.skillVersions || {}),
        ...workflowSkillSnapshot(workflowSkills, ["speech-summary-polisher"])
      },
      transcriptReview: {
        ...(project.transcriptReview || {}),
        status: "needs-review",
        selectedVersionId: proofreadVersion.id,
        proofreadVersionId: proofreadVersion.id,
        versions
      }
    };
    await persistProject(updated);
    response.json(updated);
  } catch (error) {
    const isUserError = /找不到|逐字稿|校稿|可用文字/.test(error.message);
    if (isUserError) console.warn(error.message);
    else console.error(error);
    response.status(error.statusCode || (isUserError ? 400 : 500)).json(workflowErrorPayload(error, isUserError, "transcript"));
  }
});

app.post("/api/projects/:jobId/transcripts/highlight", async (request, response) => {
	try {
	  const jobId = String(request.params.jobId || "");
	  const jobDirectory = projectDirectoryForJob(jobId);
	  const projectPath = path.join(jobDirectory, "project.json");
	  const project = JSON.parse(await readFile(projectPath, "utf8"));
	  const sourceVersionId = String(request.body?.sourceVersionId || project.transcriptReview?.selectedVersionId || "");
	  const confirmedVersion = firstEditedTranscriptVersion(project, sourceVersionId);
	  if (!confirmedVersion?.text) {
	    response.status(422).json({ error: "請先確認原稿，再產生精華摘要。", errorStage: "transcript", errorAction: workflowErrorAction("transcript") });
	    return;
	  }
	  const proofreadVersion = latestTranscriptVersionOfKind(project, "ai-proofread", { sourceVersionId: confirmedVersion.id });
	  if (!proofreadVersion?.text) {
	    response.status(422).json({ error: "找不到 AI 校稿版，請先重新確認原稿，系統會自動產生校稿與精華版本。", errorStage: "transcript", errorAction: workflowErrorAction("transcript") });
	    return;
	  }
	  const highlightVersion = await createHighlightTranscriptVersion({ project, jobId, sourceVersionId: confirmedVersion.id });
    const workflowSkills = await inspectWorkflowSkills();
    const versions = [
      ...(Array.isArray(project.transcriptReview?.versions) ? project.transcriptReview.versions : []),
      highlightVersion
    ];
    const updated = {
      ...project,
      transcript: highlightVersion.text,
      transcriptUrl: highlightVersion.textUrl,
      highlightTranscriptUrl: highlightVersion.textUrl,
      skillVersions: {
        ...(project.skillVersions || {}),
        ...workflowSkillSnapshot(workflowSkills, ["extract-verbatim-highlights"])
      },
      transcriptReview: {
        ...(project.transcriptReview || {}),
        status: "needs-review",
        selectedVersionId: highlightVersion.id,
        highlightVersionId: highlightVersion.id,
        versions
      }
    };
    await persistProject(updated);
    response.json(updated);
  } catch (error) {
    const isUserError = /找不到|逐字稿|精華|時間線|足夠/.test(error.message);
    if (isUserError) console.warn(error.message);
    else console.error(error);
    response.status(error.statusCode || (isUserError ? 400 : 500)).json(workflowErrorPayload(error, isUserError, "transcript"));
  }
});

app.post("/api/projects/:jobId/generate", async (request, response) => {
  const processingStartedAtMs = Date.now();
  const processingStartedAt = new Date(processingStartedAtMs);
  try {
    const jobId = String(request.params.jobId || "");
    const jobDirectory = projectDirectoryForJob(jobId);
    const projectPath = path.join(jobDirectory, "project.json");
    let project = JSON.parse(await readFile(projectPath, "utf8"));
    let versionId = String(request.body?.versionId || project.transcriptReview?.selectedVersionId || "");
    const incomingText = normalizeTranscriptInput(request.body?.text);
    const incomingCleanText = normalizeTranscriptText(incomingText);
    const selectedBeforeEdit = latestTranscriptVersion(project, versionId);
    if (incomingCleanText && incomingCleanText !== normalizeTranscriptText(selectedBeforeEdit?.text || "")) {
      const editedKind = ["ai-proofread", "ai-highlight-summary"].includes(selectedBeforeEdit?.kind)
        ? selectedBeforeEdit.kind
        : "user-edited-full";
      const editedVersion = await createTranscriptVersionFromText({
        project,
        jobId,
        text: incomingText,
        sourceVersionId: versionId,
        kind: editedKind,
        label: editedKind === "ai-proofread"
          ? "AI 校稿版（已修改）"
          : editedKind === "ai-highlight-summary" ? "AI 精華摘要稿（已修改）" : "已確認原稿"
      });
      versionId = editedVersion.id;
      project = {
        ...project,
        transcript: editedVersion.text,
        transcriptUrl: editedVersion.textUrl,
        editedTranscriptUrl: editedKind === "user-edited-full" ? editedVersion.textUrl : project.editedTranscriptUrl,
        proofreadTranscriptUrl: editedKind === "ai-proofread" ? editedVersion.textUrl : project.proofreadTranscriptUrl,
        highlightTranscriptUrl: editedKind === "ai-highlight-summary" ? editedVersion.textUrl : project.highlightTranscriptUrl,
        transcriptReview: {
          ...(project.transcriptReview || {}),
          selectedVersionId: editedVersion.id,
          editedVersionId: editedVersion.id,
          versions: [
            ...(Array.isArray(project.transcriptReview?.versions) ? project.transcriptReview.versions : []),
            editedVersion
          ]
        }
      };
    }
    const selectedVersion = latestTranscriptVersion(project, versionId);
    if (!selectedVersion?.text) {
      response.status(422).json({ error: "請先選擇一份要用於後續製作的逐字稿。", errorStage: "transcript", errorAction: workflowErrorAction("transcript") });
      return;
    }
    const mappingBlockReason = transcriptMappingBlockReason(selectedVersion);
    if (mappingBlockReason) {
      response.status(422).json({ error: mappingBlockReason, errorStage: "transcript", errorAction: workflowErrorAction("transcript") });
      return;
    }
    const sourceMediaPath = outputPathFromUrl(jobId, project.sourceMediaUrl);
    if (!sourceMediaPath) {
      response.status(422).json({ error: "找不到共用原始影片，請重新上傳。", errorStage: "upload", errorAction: workflowErrorAction("upload") });
      return;
    }
    const timelinePath = transcriptTimelinePathForVersion(jobDirectory, selectedVersion)
      || outputPathFromUrl(jobId, project.transcription?.timelineUrl);
    const pauseTimelinePath = project.transcription?.timelinePath
      || outputPathFromUrl(jobId, project.transcription?.timelineUrl)
      || timelinePath;
    const selectedTranscript = normalizeTranscriptText(selectedVersion.text);
    const transcriptQuality = assessTranscriptQuality(selectedTranscript);
    if (!transcriptQuality.usable) {
      const detail = transcriptQuality.issues.join("、");
      response.status(422).json({ error: `這份逐字稿品質不足（${detail}），請先修正後再繼續。`, errorStage: "transcript", errorAction: workflowErrorAction("transcript") });
      return;
    }
    const requestOptions = request.body?.options && typeof request.body.options === "object"
      ? request.body.options
      : {};
    let options = parseOptions({
      ...processingOptionsFromProject(project),
      ...requestOptions,
      context: requestOptions.context || project.processingOptions?.context || ""
    });
    const verticalPptInsertDecision = disablePptInsertionForVerticalMedia(options, project.sourceMediaProfile || {});
    options = verticalPptInsertDecision.options;
    const forcedKeepRangeInstruction = transcriptForcedKeepRangeInstruction(selectedVersion, {
      durationSeconds: project.durationSeconds
    });
    if (options.roughCut && selectedVersion.kind === "ai-highlight-summary" && !forcedKeepRangeInstruction?.keepRanges?.length) {
      response.status(422).json({
        error: "你選的是 AI 精華摘要稿，但這份稿沒有可用的原片時間碼，不能改用原稿粗剪。請重新產生 AI 精華摘要稿後再剪。",
        errorStage: "transcript",
        errorAction: workflowErrorAction("transcript")
      });
      return;
    }
    if (forcedKeepRangeInstruction && options.finalVideo) {
      options.roughCut = true;
    }
    if (!selectedFeatureLabels(options).length) {
      response.status(422).json({ error: "請至少選擇一項後續功能。", errorStage: "features", errorAction: workflowErrorAction("features") });
      return;
    }
    options = resolvePptSlideCount(options, transcriptQuality.cleaned, { durationSeconds: project.durationSeconds });
    const sharedContentOutline = buildStoryOutline(transcriptQuality.cleaned, {
      slideCount: options.slideCount,
      context: options.context
    });
    const deferUntilRoughCut = shouldDeferHighCostUntilRoughCut(options);
    const outputs = !deferUntilRoughCut && options.burnSubtitles
      ? await prepareSubtitleReviewBeforeHighCost({
          jobId,
          title: project.title || "影片內容",
          transcript: transcriptQuality.cleaned,
          durationSeconds: project.durationSeconds,
          options,
          mediaPath: sourceMediaPath,
          sharedTimelinePath: timelinePath,
          pauseTimelinePath,
          sourceBasename: "source",
          afterRoughCut: false,
          transcriptVersionId: selectedVersion.id,
          transcriptVersionKind: selectedVersion.kind,
          transcriptVersionLabel: selectedVersion.label
        })
      : await assembleOutputs({
          jobId,
          title: project.title || "影片內容",
          transcript: transcriptQuality.cleaned,
          durationSeconds: project.durationSeconds,
          options,
          mediaPath: sourceMediaPath,
          sharedTimelinePath: timelinePath,
          pauseTimelinePath,
          sharedOutline: sharedContentOutline,
          sourceBasename: "source",
          deferHighCostUntilRoughCut: deferUntilRoughCut,
          forcedRoughCutKeepRanges: forcedKeepRangeInstruction?.keepRanges || null,
          forcedRoughCutSource: forcedKeepRangeInstruction?.source || "highlight-transcript",
          forcedRoughCutRemovalReason: forcedKeepRangeInstruction?.removalReason || "不在精華摘要稿內",
          forcedRoughCutRemovalAnnotations: forcedKeepRangeInstruction?.removalAnnotations || [],
          transcriptVersionId: selectedVersion.id,
          transcriptVersionKind: selectedVersion.kind,
          transcriptVersionLabel: selectedVersion.label
        });
    const generationTiming = appendProcessingPhase(project.processingTiming, {
      startedAtMs: processingStartedAtMs,
      phase: "generation-after-transcript-review"
    });
    const payload = {
      ...project,
      ...outputs,
      skillVersions: {
        ...(project.skillVersions || {}),
        ...(outputs.skillVersions || {})
      },
      filename: project.filename,
      sourceFilename: project.sourceFilename,
      sourceMediaUrl: project.sourceMediaUrl,
      autoNamed: project.autoNamed,
      titleSource: project.titleSource,
      titleStrategy: project.titleStrategy,
      originalTranscriptUrl: project.originalTranscriptUrl,
      editedTranscriptUrl: project.editedTranscriptUrl,
      proofreadTranscriptUrl: project.proofreadTranscriptUrl,
      highlightTranscriptUrl: project.highlightTranscriptUrl,
      transcriptReview: {
        ...(project.transcriptReview || {}),
        status: "used-for-generation",
        selectedVersionId: selectedVersion.id,
        usedVersionId: selectedVersion.id,
        versions: Array.isArray(project.transcriptReview?.versions) ? project.transcriptReview.versions : []
      },
      transcriptBasis: {
        versionId: selectedVersion.id,
        kind: selectedVersion.kind,
        label: selectedVersion.label,
        mappingConfidence: selectedVersion.mappingConfidence,
        generatedAt: new Date().toISOString()
      },
      processingTiming: generationTiming,
      transcription: {
        ...(project.transcription || {}),
        selectedTranscriptVersionId: selectedVersion.id,
        selectedTimelineUrl: selectedVersion.timelineUrl || project.transcription?.timelineUrl || null,
        quality: transcriptQuality
      }
    };
    await persistProject(payload);
    response.json(payload);
  } catch (error) {
    const isUserError = /找不到|逐字稿|字幕草稿|請先|品質不足|共用原始影片/.test(error.message);
    if (isUserError) console.warn(error.message);
    else console.error(error);
    response.status(error.statusCode || (isUserError ? 400 : 500)).json(workflowErrorPayload(error, isUserError, "outputs"));
  }
});

app.post("/api/projects/:jobId/subtitles/burn", async (request, response) => {
  const processingStartedAtMs = Date.now();
  try {
    const jobId = String(request.params.jobId || "");
    if (!/^[a-f0-9-]{36}$/i.test(jobId)) {
      response.status(404).json({ error: "找不到這個專案。", errorStage: "upload", errorAction: workflowErrorAction("upload") });
      return;
    }
    const projectPath = path.join(outputDirectory, jobId, "project.json");
    const project = JSON.parse(await readFile(projectPath, "utf8"));
    const review = project.subtitleReview;
    if (!review?.baseVideoFilename) {
      response.status(422).json({ error: "這個專案沒有可精修燒錄的字幕草稿。", errorStage: "subtitles", errorAction: workflowErrorAction("subtitles") });
      return;
    }
    const captions = request.body?.captions;
    if (!Array.isArray(captions) || captions.length === 0) {
      response.status(422).json({ error: "請至少保留一段字幕再燒錄。", errorStage: "subtitles", errorAction: workflowErrorAction("subtitles") });
      return;
    }
    const subtitleStyle = request.body?.subtitleStyle || {};
    const subtitleFontScale = Math.min(1.4, Math.max(0.7, Number(subtitleStyle.fontScale) || 1));
    const subtitleAudioGain = parseAudioGain(subtitleStyle.audioGain ?? review.subtitleStyle?.audioGain ?? project.audioGain ?? 1);

    const jobDirectory = path.join(outputDirectory, jobId);
    const subtitleDirectory = path.join(jobDirectory, "subtitles");
    const fallbackBaseVideoPath = path.join(jobDirectory, path.basename(review.baseVideoFilename));
    const roughCutBase = await roughCutBaseVideoForSubtitles({
      project,
      jobId,
      review,
      jobDirectory,
      fallbackPath: fallbackBaseVideoPath
    });
    const baseVideoPath = roughCutBase.baseVideoPath;
    const baseVideoMedia = await probeMedia(baseVideoPath);
    const baseVideoDurationSeconds = await probeDurationSeconds(baseVideoPath, roughCutBase.mappedDurationSeconds || review.durationSeconds || project.durationSeconds || 0);
    const burnInputCaptions = roughCutBase.captions || captions;
    const captionReferenceDuration = roughCutBase.roughCutMapped
      ? Number(roughCutBase.mappedDurationSeconds || review.roughCutActualDurationSeconds || review.durationSeconds || baseVideoDurationSeconds)
      : Number(review.durationSeconds || baseVideoDurationSeconds);
    const captionsForBurn = roughCutBase.roughCutMapped
      ? scaleCaptionTimings(burnInputCaptions, captionReferenceDuration, baseVideoDurationSeconds)
      : burnInputCaptions;
    const roughCutSourceCaptions = roughCutBase.roughCutMapped
      ? mergeSourceCaptionTextEdits(roughCutBase.sourceCaptions || await sourceCaptionsForRoughCut(project, jobDirectory), captions)
      : review.roughCutSourceCaptions;
    const subtitleTimingScale = captionReferenceDuration > 0 && baseVideoDurationSeconds > 0
      ? baseVideoDurationSeconds / captionReferenceDuration
      : 1;
    const result = await burnEditedSubtitles({
      mediaPath: baseVideoPath,
      outputDirectory: subtitleDirectory,
      captions: captionsForBurn,
      width: baseVideoMedia.width || review.width || 1280,
      height: baseVideoMedia.height || review.height || 720,
      fontScale: subtitleFontScale,
      audioGain: subtitleAudioGain,
      basename: `${safeTitle(project.title || "影片內容")}-精修字幕`
    });
    const baseUrl = `/outputs/jobs/${jobId}`;
    const subtitledVideoUrl = `${baseUrl}/subtitles/${encodeURIComponent(path.basename(result.output_video))}`;
    const burnedReview = {
      ...review,
      status: "burned",
      captions: result.captions,
      captionCount: result.caption_count,
      lineBreaks: result.line_breaks,
      overlaps: result.overlaps,
      assWrapStyle: result.ass_wrap_style,
      subtitleStyle: { ...(review.subtitleStyle || {}), fontScale: subtitleFontScale, audioGain: subtitleAudioGain },
      width: baseVideoMedia.width || review.width,
      height: baseVideoMedia.height || review.height,
      roughCutSourceCaptions,
      baseVideoFilename: path.basename(baseVideoPath),
      baseVideoUrl: `${baseUrl}/${encodeURIComponent(path.basename(baseVideoPath))}`,
      roughCutMapped: Boolean(roughCutBase.roughCutMapped || review.roughCutMapped),
      durationSeconds: Math.round(baseVideoDurationSeconds || review.durationSeconds || 0),
      roughCutActualDurationSeconds: roughCutBase.roughCutMapped
        ? Number((baseVideoDurationSeconds || 0).toFixed(3))
        : review.roughCutActualDurationSeconds,
      roughCutTimingScale: roughCutBase.roughCutMapped
        ? Number(subtitleTimingScale.toFixed(6))
        : review.roughCutTimingScale
    };
    const shouldGenerateDeferredOutputs = Boolean(
      project.workflow?.awaitingSubtitleApproval
        || project.selectedFeatures?.highCostDeferred
        || project.editingProfile?.highCostPolicy === "defer-until-subtitles-confirmed"
    );
    const burnedCheckpoint = {
      ...project,
      subtitleReview: burnedReview,
      subtitledVideoUrl,
      subtitleSrtUrl: `${baseUrl}/subtitles/${encodeURIComponent(path.basename(result.output_srt))}`,
      subtitleAssUrl: `${baseUrl}/subtitles/${encodeURIComponent(path.basename(result.output_ass))}`,
      audioGain: subtitleAudioGain,
      workflow: {
        ...(project.workflow || {}),
        phase: shouldGenerateDeferredOutputs ? "generation-after-subtitle-review" : "outputs-ready",
        awaitingSubtitleApproval: false,
        awaitingPostSubtitleGeneration: shouldGenerateDeferredOutputs,
        subtitlesConfirmedAt: new Date().toISOString()
      }
    };
    await persistProject(burnedCheckpoint);
    const postSubtitleOutputs = shouldGenerateDeferredOutputs
      ? await generateOutputsAfterConfirmedSubtitles({
          project: burnedCheckpoint,
          jobId,
          subtitledVideoPath: result.output_video,
          baseVideoPath,
          captions: result.captions,
          durationSeconds: baseVideoDurationSeconds || review.durationSeconds || project.durationSeconds || 0
        })
      : {};
    const fullOptions = processingOptionsFromProject(project);
    const updated = {
      ...burnedCheckpoint,
      ...postSubtitleOutputs,
      skillVersions: {
        ...(project.skillVersions || {}),
        ...(postSubtitleOutputs.skillVersions || {})
      },
      subtitleReview: postSubtitleOutputs.subtitleReview || burnedReview,
      subtitledVideoUrl: postSubtitleOutputs.subtitledVideoUrl || subtitledVideoUrl,
      subtitleSrtUrl: postSubtitleOutputs.subtitleSrtUrl || `${baseUrl}/subtitles/${encodeURIComponent(path.basename(result.output_srt))}`,
      subtitleAssUrl: postSubtitleOutputs.subtitleAssUrl || `${baseUrl}/subtitles/${encodeURIComponent(path.basename(result.output_ass))}`,
      audioGain: subtitleAudioGain,
      finalVideoUrl: postSubtitleOutputs.finalVideoUrl
        || (project.selectedFeatures?.finalVideo ? subtitledVideoUrl : project.finalVideoUrl),
      finalVideoSource: postSubtitleOutputs.finalVideoSource
        || (project.selectedFeatures?.finalVideo ? "subtitle-burned-integrated" : project.finalVideoSource),
      roughCutReview: project.roughCutReview,
      roughCutVideoUrl: project.roughCutVideoUrl,
      roughCutPlanUrl: project.roughCutPlanUrl,
      roughCutReportUrl: project.roughCutReportUrl,
      selectedFeatures: {
        ...(project.selectedFeatures || {}),
        ...(postSubtitleOutputs.selectedFeatures || {}),
        burnSubtitles: true,
        roughCut: Boolean(project.selectedFeatures?.roughCut),
        highCostDeferred: false,
        integratedFinalVideo: Boolean(postSubtitleOutputs.finalVideoUrl || subtitledVideoUrl),
        labels: selectedFeatureLabels(fullOptions)
      },
      workflow: {
        ...(burnedCheckpoint.workflow || {}),
        ...(postSubtitleOutputs.workflow || {}),
        phase: "outputs-ready",
        awaitingSubtitleApproval: false,
        awaitingPostSubtitleGeneration: false,
        subtitlesConfirmedAt: burnedCheckpoint.workflow.subtitlesConfirmedAt
      },
      processingTiming: appendProcessingPhase(project.processingTiming, {
        startedAtMs: processingStartedAtMs,
        phase: shouldGenerateDeferredOutputs ? "subtitle-confirmation-and-generation" : "subtitle-burn"
      })
    };
    await persistProject(updated);
    response.json(updated);
  } catch (error) {
    const isUserError = /字幕|找不到|請至少|沒有|不支援|格式|損壞/.test(error.message);
    if (isUserError) console.warn(error.message);
    else console.error(error);
    response.status(error.statusCode || (isUserError ? 400 : 500)).json(workflowErrorPayload(error, isUserError, "subtitles"));
  }
});

app.post("/api/projects/:jobId/subtitles/resume-generation", async (request, response) => {
  const processingStartedAtMs = Date.now();
  try {
    const jobId = String(request.params.jobId || "");
    if (!/^[a-f0-9-]{36}$/i.test(jobId)) {
      response.status(404).json({ error: "找不到這個專案。", errorStage: "upload", errorAction: workflowErrorAction("upload") });
      return;
    }
    const projectPath = path.join(outputDirectory, jobId, "project.json");
    const project = JSON.parse(await readFile(projectPath, "utf8"));
    if (!project.workflow?.awaitingPostSubtitleGeneration || project.subtitleReview?.status !== "burned") {
      response.status(422).json({ error: "這個專案沒有可續跑的字幕後製作階段。", errorStage: "outputs", errorAction: workflowErrorAction("outputs") });
      return;
    }
    const subtitledVideoPath = outputPathFromUrl(jobId, project.subtitledVideoUrl);
    const baseVideoPath = outputPathFromUrl(jobId, project.subtitleReview?.baseVideoUrl) || subtitledVideoPath;
    const subtitledVideoExists = subtitledVideoPath
      ? await stat(subtitledVideoPath).then((details) => details.isFile() && details.size > 0).catch(() => false)
      : false;
    if (!subtitledVideoExists) {
      response.status(422).json({ error: "找不到已完成的精修字幕影片。", errorStage: "subtitles", errorAction: workflowErrorAction("subtitles") });
      return;
    }
    const postSubtitleOutputs = await generateOutputsAfterConfirmedSubtitles({
      project,
      jobId,
      subtitledVideoPath,
      baseVideoPath,
      captions: project.subtitleReview.captions,
      durationSeconds: project.subtitleReview.durationSeconds || project.durationSeconds || 0
    });
    const fullOptions = processingOptionsFromProject(project);
    const updated = {
      ...project,
      ...postSubtitleOutputs,
      skillVersions: { ...(project.skillVersions || {}), ...(postSubtitleOutputs.skillVersions || {}) },
      subtitleReview: postSubtitleOutputs.subtitleReview || project.subtitleReview,
      subtitledVideoUrl: postSubtitleOutputs.subtitledVideoUrl || project.subtitledVideoUrl,
      subtitleSrtUrl: postSubtitleOutputs.subtitleSrtUrl || project.subtitleSrtUrl,
      subtitleAssUrl: postSubtitleOutputs.subtitleAssUrl || project.subtitleAssUrl,
      finalVideoUrl: postSubtitleOutputs.finalVideoUrl || project.subtitledVideoUrl,
      finalVideoSource: postSubtitleOutputs.finalVideoSource || "subtitle-burned-integrated",
      selectedFeatures: {
        ...(project.selectedFeatures || {}),
        ...(postSubtitleOutputs.selectedFeatures || {}),
        burnSubtitles: true,
        roughCut: Boolean(project.selectedFeatures?.roughCut),
        highCostDeferred: false,
        integratedFinalVideo: Boolean(postSubtitleOutputs.finalVideoUrl || project.subtitledVideoUrl),
        labels: selectedFeatureLabels(fullOptions)
      },
      workflow: {
        ...(project.workflow || {}),
        ...(postSubtitleOutputs.workflow || {}),
        phase: "outputs-ready",
        awaitingSubtitleApproval: false,
        awaitingPostSubtitleGeneration: false
      },
      processingTiming: appendProcessingPhase(project.processingTiming, {
        startedAtMs: processingStartedAtMs,
        phase: "resume-generation-after-subtitle-review"
      })
    };
    await persistProject(updated);
    response.json(updated);
  } catch (error) {
    const isUserError = /字幕|找不到|沒有|不支援|格式|損壞|簡報/.test(error.message);
    if (isUserError) console.warn(error.message);
    else console.error(error);
    response.status(error.statusCode || (isUserError ? 400 : 500)).json(workflowErrorPayload(error, isUserError, "outputs"));
  }
});

app.post("/api/demo", async (request, response) => {
  try {
    let options = parseOptions(request.body);
    options = resolvePptSlideCount(options, DEMO_TRANSCRIPT, { durationSeconds: 126 });
    if (!selectedFeatureLabels(options).length) {
      response.status(422).json({ error: "請至少選擇一項功能。" });
      return;
    }
    const jobId = crypto.randomUUID();
    const result = await assembleOutputs({
      jobId,
      title: "櫻花旅行的春日片段",
      transcript: DEMO_TRANSCRIPT,
      durationSeconds: 126,
      options
    });
    const payload = { ...result, filename: "示範影片.mp4", demo: true };
    await persistProject(payload);
    response.json(payload);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: `示範專案產生失敗：${error.message}` });
  }
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: "伺服器發生未預期的錯誤。" });
});

app.listen(port, (error) => {
  if (error) {
    console.error(`無法啟動伺服器：${error.message}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Video Story Studio 已啟動：http://localhost:${port}`);
});

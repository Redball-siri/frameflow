import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import ffmpegPath from "ffmpeg-static";

const TARGET_WIDTH = 1920;
const TARGET_HEIGHT = 1080;
const MAX_OUTPUT_WIDTH = 3840;
const MAX_OUTPUT_HEIGHT = 2160;
const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VISUAL_PYTHON_PATH = path.join(PROJECT_ROOT, ".visual-venv", "bin", "python");
const SMOOTH_BROLL_EXPORT_SCRIPT = process.env.SMOOTH_BROLL_EXPORT_SCRIPT
  || path.join(process.env.HOME || "", ".codex", "skills", "generate-local-broll", "scripts", "export_smooth_clips.py");
const BROLL_REVIEW_SCRIPT = process.env.BROLL_REVIEW_SCRIPT
  || path.join(process.env.HOME || "", ".codex", "skills", "generate-local-broll", "scripts", "review_keyframes.py");
const BROLL_DIVERSITY_SCRIPT = process.env.BROLL_DIVERSITY_SCRIPT
  || path.join(process.env.HOME || "", ".codex", "skills", "generate-local-broll", "scripts", "check_visual_diversity.py");
const BROLL_KEYWORD_DIVERSITY_SCRIPT = process.env.BROLL_KEYWORD_DIVERSITY_SCRIPT
  || path.join(process.env.HOME || "", ".codex", "skills", "generate-local-broll", "scripts", "check_keyword_diversity.py");

function runFfmpeg(args, { allowFailure = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr = `${stderr}${chunk}`.slice(-12000);
    });
    child.on("error", (error) => reject(error));
    child.on("close", (code) => {
      if (code === 0 || allowFailure) resolve({ code, stderr });
      else reject(new Error(stderr.trim() || "FFmpeg 執行失敗。"));
    });
  });
}

function runProcess(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout = `${stdout}${chunk}`.slice(-24000)));
    child.stderr.on("data", (chunk) => (stderr = `${stderr}${chunk}`.slice(-24000)));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(stderr.trim() || `處理程序結束，代碼 ${code}`));
    });
  });
}

function parseDuration(stderr) {
  const match = stderr.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!match) return undefined;
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}

function parseVideoDimensions(stderr) {
  const matches = [...String(stderr || "").matchAll(/Video:[^\n]*?,\s*(\d{2,5})x(\d{2,5})(?:[\s,\[])/gi)];
  return matches
    .map((match) => ({ width: Number(match[1]), height: Number(match[2]) }))
    .find((item) => item.width > 0 && item.height > 0) || {};
}

function parseFrameRate(stderr) {
  const videoLine = String(stderr || "").split(/\r?\n/).find((line) => /Video:/i.test(line)) || "";
  const match = videoLine.match(/(?:,|\s)(\d+(?:\.\d+)?)\s*fps(?:,|\s)/i)
    || videoLine.match(/(?:,|\s)(\d+(?:\.\d+)?)\s*tbr(?:,|\s)/i);
  const value = Number(match?.[1]);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

function parseBitrates(stderr) {
  const source = String(stderr || "");
  const total = Number(source.match(/Duration:[^\n]*bitrate:\s*(\d+)\s*kb\/s/i)?.[1]);
  const videoLine = source.split(/\r?\n/).find((line) => /Video:/i.test(line)) || "";
  const audioLine = source.split(/\r?\n/).find((line) => /Audio:/i.test(line)) || "";
  const video = Number(videoLine.match(/(?:,|\s)(\d+)\s*kb\/s(?:,|\s)/i)?.[1]);
  const audio = Number(audioLine.match(/(?:,|\s)(\d+)\s*kb\/s(?:,|\s)/i)?.[1]);
  return {
    bitrateKbps: Number.isFinite(total) && total > 0 ? total : undefined,
    videoBitrateKbps: Number.isFinite(video) && video > 0 ? video : undefined,
    audioBitrateKbps: Number.isFinite(audio) && audio > 0 ? audio : undefined
  };
}

export async function probeMedia(mediaPath) {
  const result = await runFfmpeg(["-hide_banner", "-i", mediaPath], { allowFailure: true });
  const dimensions = parseVideoDimensions(result.stderr);
  return {
    durationSeconds: parseDuration(result.stderr),
    hasAudio: /Stream\s+#\d+:\d+.*Audio:/i.test(result.stderr),
    hasVideo: /Stream\s+#\d+:\d+.*Video:/i.test(result.stderr),
    frameRate: parseFrameRate(result.stderr),
    ...parseBitrates(result.stderr),
    ...dimensions
  };
}

export async function probeDuration(mediaPath) {
  return (await probeMedia(mediaPath)).durationSeconds;
}

export async function extractStoryboardFrames(mediaPath, plan, outputDirectory) {
  await mkdir(outputDirectory, { recursive: true });
  const frames = [];

  for (const item of plan) {
    const filename = `broll-${String(item.id).padStart(2, "0")}.jpg`;
    const outputPath = path.join(outputDirectory, filename);
    const result = await runFfmpeg([
      "-hide_banner", "-loglevel", "error", "-ss", String(item.startSeconds), "-i", mediaPath,
      "-frames:v", "1", "-vf", `scale=${TARGET_WIDTH}:${TARGET_HEIGHT}:force_original_aspect_ratio=increase,crop=${TARGET_WIDTH}:${TARGET_HEIGHT}`,
      "-q:v", "3", "-y", outputPath
    ], { allowFailure: true });
    if (result.code === 0) frames.push({ ...item, filename, path: outputPath });
  }
  return frames;
}

export async function createStoryboardPreview(frames, outputPath) {
  if (!frames.length) return undefined;
  const listPath = path.join(path.dirname(outputPath), "storyboard-list.txt");
  const lines = [];
  for (const frame of frames) {
    lines.push(`file '${frame.path.replaceAll("'", "'\\''")}'`);
    lines.push("duration 2.5");
  }
  lines.push(`file '${frames.at(-1).path.replaceAll("'", "'\\''")}'`);
  await writeFile(listPath, `${lines.join("\n")}\n`, "utf8");

  const result = await runFfmpeg([
    "-hide_banner", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", listPath,
    "-vf", `scale=${TARGET_WIDTH}:${TARGET_HEIGHT},format=yuv420p`, "-r", "30", "-c:v", "libx264", "-movflags", "+faststart",
    "-y", outputPath
  ], { allowFailure: true });
  return result.code === 0 ? outputPath : undefined;
}

function zoompanForMotion(motion, frameCount) {
  const progress = `on/${Math.max(1, frameCount)}`;
  const centerX = "iw/2-(iw/zoom/2)";
  const centerY = "ih/2-(ih/zoom/2)";
  const normalized = String(motion || "").toLowerCase();
  if (normalized.includes("push-out")) {
    return `zoompan=z='1.04-0.035*(${progress})':x='${centerX}':y='${centerY}'`;
  }
  if (normalized.includes("pan-left")) {
    return `zoompan=z='1.04':x='(iw-iw/zoom)*(${progress})':y='${centerY}'`;
  }
  if (normalized.includes("pan-right")) {
    return `zoompan=z='1.04':x='(iw-iw/zoom)*(1-(${progress}))':y='${centerY}'`;
  }
  if (normalized.includes("tilt-up")) {
    return `zoompan=z='1.04':x='${centerX}':y='(ih-ih/zoom)*(${progress})'`;
  }
  if (normalized.includes("tilt-down")) {
    return `zoompan=z='1.04':x='${centerX}':y='(ih-ih/zoom)*(1-(${progress}))'`;
  }
  if (normalized.includes("static")) {
    return `zoompan=z='1.01':x='${centerX}':y='${centerY}'`;
  }
  return `zoompan=z='1+0.035*(${progress})':x='${centerX}':y='${centerY}'`;
}

function csvCell(value) {
  const text = value == null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

async function writeSmoothClipSummaries(clips, outputDirectory) {
  await writeFile(
    path.join(outputDirectory, "broll-clips-smooth-hq-manifest.json"),
    `${JSON.stringify(clips, null, 2)}\n`,
    "utf8"
  );
  const fields = [
    "id", "insertTime", "startSeconds", "score", "durationSeconds", "resolution",
    "motion", "motionReason", "stabilization", "title", "sourcePhrase", "whyBroll",
    "fitCheck", "literalSceneCheck", "propOriginCheck", "keywordDiversityCheck", "modestyCheck",
    "diversityCheck", "weirdnessCheck", "path"
  ];
  const rows = [fields.join(","), ...clips.map((clip) => fields.map((field) => csvCell(clip[field])).join(","))];
  await writeFile(
    path.join(outputDirectory, "broll-clips-smooth-hq-manifest.csv"),
    `\uFEFF${rows.join("\n")}\n`,
    "utf8"
  );
}

async function exportSmoothBrollClips(motions, plan, outputDirectory, { targetDimensions = {} } = {}) {
  await access(SMOOTH_BROLL_EXPORT_SCRIPT);
  await access(BROLL_REVIEW_SCRIPT);
  await access(BROLL_DIVERSITY_SCRIPT);
  await access(BROLL_KEYWORD_DIVERSITY_SCRIPT);
  await access(VISUAL_PYTHON_PATH);
  const exportDimensions = mediaMatchedBrollDimensions(targetDimensions);
  const planById = new Map(plan.map((item) => [item.id, item]));
  const manifest = motions.map((motion) => {
    const item = planById.get(motion.id) || {};
    const keyframePath = motion.keyframePath || motion.firstFramePath || motion.path;
    return {
      id: motion.id,
      title: item.title || motion.title || `B-roll ${motion.id}`,
      filename: keyframePath ? path.basename(keyframePath) : motion.filename,
      keyframePath,
      path: keyframePath,
      insertTime: item.timecode,
      startSeconds: item.startSeconds,
      score: item.score || motion.score,
      sourcePhrase: item.sourcePhrase || motion.sourcePhrase,
      whyBroll: item.whyBroll || motion.whyBroll,
      semanticCore: item.semanticCore || motion.semanticCore,
      keywordAnchors: item.keywordAnchors || motion.keywordAnchors || [],
      semanticCluster: item.semanticCluster || motion.semanticCluster || "",
      noveltyReason: item.noveltyReason || motion.noveltyReason || "",
      repetitionCheck: item.repetitionCheck || motion.repetitionCheck || "",
      literalSceneTreatment: item.literalSceneTreatment || motion.literalSceneTreatment,
      propOrigin: item.propOrigin || motion.propOrigin,
      viewerRead: item.viewerRead || motion.viewerRead,
      qualityGate: item.qualityGate || motion.qualityGate,
      visualQualityGate: motion.visualQualityGate || null,
      motion: motion.motion || item.motion || "push-in",
      motionReason: motion.motionReason || item.motionReason || "",
      visualConcept: item.visualConcept || motion.visualConcept,
      targetDimensions: motion.targetDimensions || exportDimensions,
      diversity: item.diversity || motion.diversity || null,
      shotChecklist: item.shotChecklist || motion.shotChecklist || null
    };
  });
  const manifestPath = path.join(outputDirectory, "smooth-broll-export-manifest.json");
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  const reviewDirectory = path.join(outputDirectory, "review");
  await mkdir(reviewDirectory, { recursive: true });
  const keywordReportPath = path.join(reviewDirectory, "keyword-diversity-report.json");
  await runProcess(VISUAL_PYTHON_PATH, [
    BROLL_KEYWORD_DIVERSITY_SCRIPT,
    "--manifest", manifestPath,
    "--output", keywordReportPath
  ]);
  const keywordReport = JSON.parse(await readFile(keywordReportPath, "utf8"));
  if (keywordReport.missingFields?.length) {
    const missing = keywordReport.missingFields
      .map((item) => `#${item.id} ${item.missing.join("、")}`)
      .join("；");
    throw new Error(`B-roll 匯出前檢查發現欄位不完整：${missing}`);
  }
  const keywordWarningIds = new Set([
    ...(keywordReport.repeatedKeywords || []).flatMap((item) => item.ids || []),
    ...(keywordReport.repeatedClusters || []).flatMap((item) => item.ids || []),
    ...(keywordReport.overlapWarnings || []).flatMap((item) => [item.leftId, item.rightId])
  ].map(Number));
  const unexplainedKeywordWarnings = manifest.filter((item) => (
    keywordWarningIds.has(Number(item.id)) && !String(item.repetitionCheck || "").trim()
  ));
  if (unexplainedKeywordWarnings.length) {
    throw new Error(`B-roll #${unexplainedKeywordWarnings.map((item) => item.id).join("、#")} 有關鍵字重複警告，尚未說明保留原因。`);
  }
  await runProcess(VISUAL_PYTHON_PATH, [
    BROLL_REVIEW_SCRIPT,
    "--keyframes-dir", outputDirectory,
    "--manifest", manifestPath,
    "--output-dir", reviewDirectory
  ]);
  const diversityReportPath = path.join(reviewDirectory, "visual-diversity-report.json");
  await runProcess(VISUAL_PYTHON_PATH, [
    BROLL_DIVERSITY_SCRIPT,
    "--keyframes-dir", outputDirectory,
    "--manifest", manifestPath,
    "--output", diversityReportPath
  ]);
  const diversityReport = JSON.parse(await readFile(diversityReportPath, "utf8"));
  const similarPairs = new Map();
  for (const pair of diversityReport.similarPairs || []) {
    const left = Number(pair.leftId);
    const right = Number(pair.rightId);
    similarPairs.set(left, [...(similarPairs.get(left) || []), right]);
    similarPairs.set(right, [...(similarPairs.get(right) || []), left]);
  }
  if ((diversityReport.similarPairs || []).length) {
    const pairs = diversityReport.similarPairs
      .map((pair) => `#${pair.leftId}/#${pair.rightId}`)
      .join("、");
    throw new Error(`B-roll 多樣性檢查未通過（${pairs} 過度相似），已停止輸出，避免重複畫面進入成片。`);
  }
  const failedPeopleGate = manifest.filter((item) => (
    item.visualQualityGate
    && (!item.visualQualityGate.anonymousPeoplePassed || !item.visualQualityGate.modestyHeuristicPassed)
  ));
  if (failedPeopleGate.length) {
    throw new Error(`B-roll #${failedPeopleGate.map((item) => item.id).join("、#")} 未通過人物正臉或保守穿著檢查，已停止輸出。`);
  }
  const reviewPath = path.join(reviewDirectory, "keyframe-review.json");
  const reviewItems = manifest.map((item) => {
    const qualityGate = item.qualityGate || {};
    const similarIds = similarPairs.get(Number(item.id)) || [];
    const diversityText = item.diversity
      ? Object.entries(item.diversity).map(([key, value]) => `${key}: ${value}`).join("; ")
      : "metadata diversity profile present";
    return {
      id: item.id,
      title: item.title,
      sourcePhrase: item.sourcePhrase,
      semanticCore: item.semanticCore,
      keywordAnchors: item.keywordAnchors,
      semanticCluster: item.semanticCluster,
      noveltyReason: item.noveltyReason,
      repetitionCheck: item.repetitionCheck,
      literalSceneTreatment: item.literalSceneTreatment,
      propOrigin: item.propOrigin,
      viewerRead: item.viewerRead,
      keyframePath: item.keyframePath,
      accepted: true,
      fitCheck: `source phrase -> ${item.viewerRead || item.semanticCore || item.whyBroll}; not accepted on image polish alone.`,
      literalSceneCheck: qualityGate.literalSceneCheck || item.literalSceneTreatment || "visible subject/place/action must match the nearby sentence.",
      propOriginCheck: qualityGate.propOriginCheck || item.propOrigin || "foreground props must come from the source phrase.",
      keywordDiversityCheck: keywordWarningIds.has(Number(item.id))
        ? `${item.repetitionCheck} Keyword checker flagged this item; it is accepted only for the distinct story function described here.`
        : `Keyword anchors: ${(item.keywordAnchors || []).join(", ")}; semantic cluster: ${item.semanticCluster}; no reuse warning from the keyword checker.`,
      modestyCheck: qualityGate.modestyCheck || item.shotChecklist?.modesty || "modest clothing and non-sexualized framing required.",
      diversityCheck: similarIds.length
        ? `${diversityText}; diversity checker flagged similarity with clip ${similarIds.join(", ")}, keep only if the transcript intentionally continues the scene.`
        : `${diversityText}; no close visual similarity warning from diversity checker.`,
      weirdnessCheck: qualityGate.weirdnessCheck || "reject distorted hands/faces, odd posture, readable text, logos, watermarks, and uncanny people.",
      symbolicPropsUsed: false,
      symbolicJustification: "",
      issues: []
    };
  });
  await writeFile(reviewPath, `${JSON.stringify(reviewItems, null, 2)}\n`, "utf8");
  const itemExportDirectory = path.join(reviewDirectory, "clip-export-items");
  await mkdir(itemExportDirectory, { recursive: true });
  const exported = [];
  const skipped = [];
  for (const item of manifest) {
    const itemManifestPath = path.join(itemExportDirectory, `manifest-${item.id}.json`);
    const itemReviewPath = path.join(itemExportDirectory, `review-${item.id}.json`);
    await writeFile(itemManifestPath, `${JSON.stringify([item], null, 2)}\n`, "utf8");
    await writeFile(itemReviewPath, `${JSON.stringify(reviewItems.filter((reviewItem) => reviewItem.id === item.id), null, 2)}\n`, "utf8");
    try {
      const stdout = await runProcess(VISUAL_PYTHON_PATH, [
        SMOOTH_BROLL_EXPORT_SCRIPT,
        "--project-root", PROJECT_ROOT,
        "--keyframes-dir", outputDirectory,
        "--output-dir", outputDirectory,
        "--manifest", itemManifestPath,
        "--review", itemReviewPath,
        "--require-review",
        "--motion-mode", "manifest",
        "--duration", "5",
        "--width", String(exportDimensions.width),
        "--height", String(exportDimensions.height),
        "--fps", "30",
        "--crf", "14",
        "--ffmpeg", ffmpegPath
      ]);
      const summary = JSON.parse(stdout);
      exported.push(...(summary.clips || []));
    } catch (error) {
      skipped.push({
        id: Number(item.id),
        title: item.title || `B-roll ${item.id}`,
        reason: "動態片段匯出失敗，已保留其他可用 B-roll 並繼續製作。",
        stage: "clip-export",
        detail: String(error?.message || "").split(/\r?\n/)[0].slice(0, 240)
      });
    }
  }
  await writeSmoothClipSummaries(exported, outputDirectory);
  const clips = exported.map((clip) => ({
    id: clip.id,
    filename: clip.filename,
    path: clip.path,
    firstFramePath: manifest.find((item) => item.id === clip.id)?.keyframePath || null,
    frameCount: 1,
    motion: clip.motion,
    motionReason: clip.motionReason || "",
    generationMode: "smooth-hq-keyframe"
  }));
  clips.skipped = skipped;
  return clips;
}

export async function createMotionBrollClips(motions, plan, outputDirectory, { targetDimensions = {} } = {}) {
  await mkdir(outputDirectory, { recursive: true });
  const outputDimensions = mediaMatchedBrollDimensions(targetDimensions);
  if (motions.length && motions.every((motion) => !motion.frameDirectory && (motion.keyframePath || motion.firstFramePath || motion.path))) {
    return exportSmoothBrollClips(motions, plan, outputDirectory, { targetDimensions: outputDimensions });
  }
  const planById = new Map(plan.map((item) => [item.id, item]));
  const clips = [];
  const skipped = [];

  for (const motion of motions) {
    const item = planById.get(motion.id);
    if (!item) continue;
    const duration = 5;
    const filename = `ai-broll-${String(item.id).padStart(2, "0")}.mp4`;
    const outputPath = path.join(outputDirectory, filename);
    const keyframePath = motion.keyframePath || motion.firstFramePath || motion.path;
    try {
      if (motion.frameDirectory) {
        const sourceFps = Math.max(0.5, (Number(motion.frameCount) - 1) / Math.max(1, duration - 1));
        await runFfmpeg([
          "-hide_banner", "-loglevel", "error", "-framerate", sourceFps.toFixed(4),
          "-i", path.join(motion.frameDirectory, "frame-%03d.png"),
          "-vf", `scale=${outputDimensions.width}:${outputDimensions.height}:flags=lanczos,tpad=stop_mode=clone:stop_duration=2,minterpolate=fps=30:mi_mode=blend,trim=duration=${duration},format=yuv420p`,
          "-t", String(duration), "-r", "30", "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-movflags", "+faststart",
          "-y", outputPath
        ]);
      } else if (keyframePath) {
        const frameCount = duration * 30;
        const motionFilter = zoompanForMotion(motion.motion || item.motion, frameCount);
        await runFfmpeg([
          "-hide_banner", "-loglevel", "error", "-loop", "1", "-framerate", "30", "-t", String(duration),
          "-i", keyframePath,
          "-vf", `scale=${outputDimensions.width}:${outputDimensions.height}:force_original_aspect_ratio=increase,crop=${outputDimensions.width}:${outputDimensions.height},${motionFilter}:d=${frameCount}:s=${outputDimensions.width}x${outputDimensions.height}:fps=30,trim=duration=${duration},format=yuv420p`,
          "-r", "30", "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-movflags", "+faststart",
          "-y", outputPath
        ]);
      } else {
        continue;
      }
    } catch (error) {
      skipped.push({
        id: Number(item.id),
        title: item.title || `B-roll ${item.id}`,
        reason: "動態片段匯出失敗，已保留其他可用 B-roll 並繼續製作。",
        stage: "clip-export",
        detail: String(error?.message || "").split(/\r?\n/)[0].slice(0, 240)
      });
      continue;
    }
    clips.push({
      id: item.id,
      filename,
      path: outputPath,
      firstFramePath: keyframePath,
      frameCount: Number(motion.frameCount) || 1,
      motion: motion.motion || item.motion || "slow push-in",
      motionReason: motion.motionReason || item.motionReason || "",
      generationMode: motion.mode || "stable-diffusion-lcm-keyframe"
    });
  }
  clips.skipped = skipped;
  return clips;
}

export async function createClipMontage(clips, outputPath) {
  if (!clips.length) return undefined;
  const listPath = path.join(path.dirname(outputPath), "ai-broll-clips.txt");
  const lines = clips.map((clip) => `file '${clip.path.replaceAll("'", "'\\''")}'`);
  await writeFile(listPath, `${lines.join("\n")}\n`, "utf8");
  const result = await runFfmpeg([
    "-hide_banner", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", listPath,
    "-c", "copy", "-movflags", "+faststart", "-y", outputPath
  ], { allowFailure: true });
  return result.code === 0 ? outputPath : undefined;
}

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function evenDimension(value) {
  return Math.max(2, Math.floor(Number(value) / 2) * 2);
}

export function mediaMatchedBrollDimensions(mediaInfo = {}) {
  const width = Number(mediaInfo.width);
  const height = Number(mediaInfo.height);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return { width: TARGET_WIDTH, height: TARGET_HEIGHT, aspect: "landscape" };
  }
  const isSquare = Math.abs(width - height) <= Math.max(width, height) * 0.04;
  if (isSquare) return { width: 1080, height: 1080, aspect: "square" };
  if (height > width) return { width: 1080, height: 1920, aspect: "vertical" };
  return { width: TARGET_WIDTH, height: TARGET_HEIGHT, aspect: "landscape" };
}

function outputDimensionsFromMedia(mediaInfo = {}) {
  const width = Number(mediaInfo.width);
  const height = Number(mediaInfo.height);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return { width: TARGET_WIDTH, height: TARGET_HEIGHT };
  }
  const scale = Math.min(1, MAX_OUTPUT_WIDTH / width, MAX_OUTPUT_HEIGHT / height);
  return {
    width: evenDimension(width * scale),
    height: evenDimension(height * scale)
  };
}

function fallbackIndependentSlideCue(index, count, durationSeconds) {
  const duration = Number.isFinite(durationSeconds) && durationSeconds > 0 ? durationSeconds : Math.max(45, count * 22);
  const introBuffer = duration < 80 ? Math.max(5, duration * 0.1) : Math.min(18, Math.max(9, duration * 0.035));
  const outroBuffer = duration < 80 ? Math.max(7, duration * 0.12) : Math.min(26, Math.max(13, duration * 0.045));
  const usableStart = Math.min(introBuffer, Math.max(0, duration - outroBuffer - 8));
  const usableEnd = Math.max(usableStart + 8, duration - outroBuffer);
  const sectionSpan = Math.max(9, (usableEnd - usableStart) / Math.max(1, count));
  const sectionStart = usableStart + sectionSpan * index;
  const sectionEnd = index === count - 1 ? usableEnd : Math.min(usableEnd, sectionStart + sectionSpan);
  const cueDuration = Number(clampNumber(sectionSpan * 0.18, 3.6, 5.8).toFixed(1));
  const useSummaryCue = index % 3 === 1 && sectionSpan >= 18;
  const anchor = useSummaryCue ? 0.62 : 0.12;
  const latestStart = Math.max(0, Math.min(duration - cueDuration, sectionEnd - cueDuration));
  return {
    start: Number(clampNumber(sectionStart + sectionSpan * anchor, 0, latestStart).toFixed(1)),
    duration: cueDuration
  };
}

export async function composeFinalVideo({ mediaPath, clips, plan, slidePlan = plan, slideImagePaths = [], outputPath, durationSeconds }) {
  if (!mediaPath || (!clips.length && !slideImagePaths.length)) return undefined;
  const mediaInfo = await probeMedia(mediaPath);
  const { width: outputWidth, height: outputHeight } = outputDimensionsFromMedia(mediaInfo);
  const planById = new Map(plan.map((item) => [item.id, item]));
  const slideCuePlan = Array.isArray(slidePlan) && slidePlan.length ? slidePlan : plan;
  const args = ["-hide_banner", "-loglevel", "error", "-i", mediaPath];
  for (const clip of clips) args.push("-i", clip.path);

  const slideCues = [];
  if (slideImagePaths[0]) slideCues.push({ path: slideImagePaths[0], start: 0, duration: 2.5, full: true });
  const contentSlideOffset = slideImagePaths.length >= slideCuePlan.length + 4 ? 3 : 1;
  for (let index = 0; index < slideCuePlan.length && index + 1 < slideImagePaths.length; index += 1) {
    const slidePath = slideImagePaths[index + contentSlideOffset] || slideImagePaths[index + 1];
    const plannedStart = Number(slideCuePlan[index].slideCueStartSeconds);
    const plannedDuration = Number(slideCuePlan[index].slideCueDuration);
    const usesIndependentTiming = slideCuePlan[index].timingPolicy === "independent-ppt-and-broll";
    const fallbackCue = usesIndependentTiming ? null : fallbackIndependentSlideCue(index, slideCuePlan.length, durationSeconds);
    const start = usesIndependentTiming && Number.isFinite(plannedStart)
      ? Math.max(0, plannedStart)
      : fallbackCue?.start ?? Math.max(2.6, Number(slideCuePlan[index].startSeconds || 0) - 4.4);
    const remainingDuration = Number.isFinite(durationSeconds) && durationSeconds > 0
      ? Math.max(1.2, durationSeconds - start)
      : 6;
    const duration = usesIndependentTiming && Number.isFinite(plannedDuration)
      ? Math.max(1.8, Math.min(plannedDuration, remainingDuration))
      : Math.max(1.8, Math.min(fallbackCue?.duration ?? 4.2, remainingDuration));
    slideCues.push({ path: slidePath, start, duration, full: true });
  }
  if (slideImagePaths.at(-1) && durationSeconds > 8) {
    slideCues.push({ path: slideImagePaths.at(-1), start: Math.max(0, durationSeconds - 2.5), duration: 2.5, full: true });
  }
  for (const cue of slideCues) {
    args.push("-loop", "1", "-framerate", "30", "-t", String(cue.duration), "-i", cue.path);
  }

  const filters = [
    `[0:v]scale=${outputWidth}:${outputHeight}:force_original_aspect_ratio=decrease,pad=${outputWidth}:${outputHeight}:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1,fps=30,format=yuv420p[base]`
  ];
  let current = "base";
  clips.forEach((clip, index) => {
    const item = planById.get(clip.id);
    const start = Math.max(0, Number(item?.startSeconds) || 0);
    const duration = Math.max(1, Math.min(6, Number.parseFloat(item?.duration) || 4));
    const end = start + duration;
    const clipLabel = `broll${index}`;
    const outputLabel = `withbroll${index}`;
    filters.push(`[${index + 1}:v]scale=${outputWidth}:${outputHeight}:force_original_aspect_ratio=increase,crop=${outputWidth}:${outputHeight},setsar=1,fps=30,trim=duration=${duration},setpts=PTS-STARTPTS+${start}/TB[${clipLabel}]`);
    filters.push(`[${current}][${clipLabel}]overlay=0:0:eof_action=pass:enable='between(t,${start},${end})'[${outputLabel}]`);
    current = outputLabel;
  });

  const slideInputStart = 1 + clips.length;
  slideCues.forEach((cue, index) => {
    const slideLabel = `slide${index}`;
    const outputLabel = `withslide${index}`;
    const end = cue.start + cue.duration;
    const slideFilter = cue.full
      ? `scale=${outputWidth}:${outputHeight}:force_original_aspect_ratio=decrease,pad=${outputWidth}:${outputHeight}:(ow-iw)/2:(oh-ih)/2:color=black`
      : "scale=420:236:force_original_aspect_ratio=decrease,pad=420:236:(ow-iw)/2:(oh-ih)/2:color=white";
    filters.push(`[${slideInputStart + index}:v]${slideFilter},setsar=1,fps=30,setpts=PTS-STARTPTS+${cue.start}/TB[${slideLabel}]`);
    const position = cue.full ? "0:0" : "W-w-28:H-h-28";
    filters.push(`[${current}][${slideLabel}]overlay=${position}:eof_action=pass:enable='between(t,${cue.start},${end})'[${outputLabel}]`);
    current = outputLabel;
  });

  const outputArgs = [
    "-filter_complex", filters.join(";"),
    "-map", `[${current}]`,
    "-c:v", "libx264", "-preset", "slow", "-crf", "16",
    "-pix_fmt", "yuv420p",
    "-fps_mode", "cfr", "-r", "30",
    "-movflags", "+faststart", "-shortest"
  ];
  if (mediaInfo.hasAudio) {
    outputArgs.push(
      "-map", "0:a:0",
      "-af", "aresample=48000:async=1:first_pts=0",
      "-c:a", "aac", "-b:a", "192k", "-ar", "48000"
    );
  } else {
    outputArgs.push("-an");
  }
  await runFfmpeg([...args, ...outputArgs, "-y", outputPath]);
  return outputPath;
}

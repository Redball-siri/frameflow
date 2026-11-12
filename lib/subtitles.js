import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import ffmpegPath from "ffmpeg-static";

export const SUBTITLE_SKILL_DIR = process.env.SUBTITLE_VIDEO_SKILL_DIR
  || "/Users/redball/.codex/skills/subtitle-video-locally";

function run(command, args, { cwd } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout = `${stdout}${chunk}`.slice(-24000);
    });
    child.stderr.on("data", (chunk) => {
      stderr = `${stderr}${chunk}`.slice(-24000);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(stderr.trim() || `字幕處理失敗，代碼 ${code}`));
    });
  });
}

function parseSkillSummary(stdout) {
  const lines = String(stdout).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    try {
      const parsed = JSON.parse(lines[index]);
      if (parsed.output_srt || parsed.output_ass || parsed.output_video) return parsed;
    } catch {
      // The setup script can print progress before the final JSON summary.
    }
  }
  throw new Error("字幕技能完成但沒有回傳有效摘要。");
}

function parseSrtTime(value) {
  const match = String(value || "").match(/(\d+):(\d{2}):(\d{2})[,.](\d{1,3})/);
  if (!match) return 0;
  const milliseconds = Number(String(match[4]).padEnd(3, "0").slice(0, 3));
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]) + milliseconds / 1000;
}

export function formatSrtTime(seconds) {
  const safe = Math.max(0, Number(seconds) || 0);
  let total = Math.round(safe * 1000);
  const hours = Math.floor(total / 3600000);
  total %= 3600000;
  const minutes = Math.floor(total / 60000);
  total %= 60000;
  const wholeSeconds = Math.floor(total / 1000);
  const milliseconds = total % 1000;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(wholeSeconds).padStart(2, "0")},${String(milliseconds).padStart(3, "0")}`;
}

function formatAssTime(seconds) {
  const safe = Math.max(0, Number(seconds) || 0);
  let total = Math.round(safe * 100);
  const hours = Math.floor(total / 360000);
  total %= 360000;
  const minutes = Math.floor(total / 6000);
  total %= 6000;
  const wholeSeconds = Math.floor(total / 100);
  const centiseconds = total % 100;
  return `${hours}:${String(minutes).padStart(2, "0")}:${String(wholeSeconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
}

export function parseSrt(srtText) {
  return String(srtText || "")
    .replace(/\r/g, "")
    .split(/\n{2,}/)
    .map((block, index) => {
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
      const timingLine = lines.find((line) => line.includes("-->"));
      if (!timingLine) return null;
      const [startRaw, endRaw] = timingLine.split("-->").map((part) => part.trim());
      const text = lines.slice(lines.indexOf(timingLine) + 1).join(" ").replace(/\s+/g, " ").trim();
      if (!text) return null;
      return {
        id: index + 1,
        start: Number(parseSrtTime(startRaw).toFixed(3)),
        end: Number(parseSrtTime(endRaw).toFixed(3)),
        text
      };
    })
    .filter(Boolean);
}

function cleanCaptionText(value, { preserveLineBreaks = false } = {}) {
  const text = String(value || "").replace(/\\N/g, "\n").replace(/\r\n?/g, "\n");
  if (!preserveLineBreaks) {
    return text
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  return text
    .split("\n")
    .map((line) => line.replace(/[^\S\n]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizeCaptions(captions) {
  const normalized = (Array.isArray(captions) ? captions : [])
    .map((caption, index) => ({
      ...caption,
      id: Number(caption.id) || index + 1,
      start: Math.max(0, Number(caption.start) || 0),
      end: Math.max(0, Number(caption.end) || 0),
      text: cleanCaptionText(caption.text, { preserveLineBreaks: true })
    }))
    .filter((caption) => caption.text)
    .sort((left, right) => left.start - right.start || left.end - right.end);

  // A revised transcript can split one source segment into several sentences
  // while keeping the same source timing for each sentence. Divide that shared
  // interval into readable portions instead of collapsing a sentence to 1 ms.
  for (let groupStart = 0; groupStart < normalized.length;) {
    let groupEnd = groupStart + 1;
    const first = normalized[groupStart];
    while (
      groupEnd < normalized.length
      && Math.abs(normalized[groupEnd].start - first.start) < 0.001
      && Math.abs(normalized[groupEnd].end - first.end) < 0.001
    ) groupEnd += 1;
    if (groupEnd - groupStart > 1 && first.end > first.start) {
      const group = normalized.slice(groupStart, groupEnd);
      const intervalStart = first.start;
      const intervalEnd = first.end;
      const totalWeight = group.reduce((total, caption) => total + Math.max(1, Array.from(caption.text).length), 0);
      let cursor = intervalStart;
      group.forEach((caption, offset) => {
        const weight = Math.max(1, Array.from(caption.text).length);
        const allocatedEnd = offset === group.length - 1
          ? intervalEnd
          : cursor + ((intervalEnd - intervalStart) * weight / totalWeight);
        caption.start = cursor;
        caption.end = allocatedEnd;
        cursor = allocatedEnd;
      });
    }
    groupStart = groupEnd;
  }

  for (let index = 0; index < normalized.length; index += 1) {
    const caption = normalized[index];
    caption.end = Math.max(caption.start + 0.08, caption.end);
    const next = normalized[index + 1];
    if (next && caption.end > next.start) {
      let boundary = next.start;
      if (boundary <= caption.start) {
        boundary = caption.start + 0.001;
        next.start = boundary;
        next.end = Math.max(next.end, next.start + 0.08);
      }
      caption.end = boundary;
    }
  }
  return normalized;
}

export function srtFromCaptions(captions) {
  return normalizeCaptions(captions)
    .map((caption, index) => [
      String(index + 1),
      `${formatSrtTime(caption.start)} --> ${formatSrtTime(caption.end)}`,
      caption.text
    ].join("\n"))
    .join("\n\n")
    .concat("\n");
}

function assEscape(text) {
  return cleanCaptionText(text, { preserveLineBreaks: true })
    .replace(/\\/g, "\\\\")
    .replace(/{/g, "｛")
    .replace(/}/g, "｝")
    .replace(/\n/g, "\\N");
}

export function assFromCaptions(captions, { width = 1280, height = 720, fontScale = 1 } = {}) {
  const safeFontScale = Math.min(1.4, Math.max(0.7, Number(fontScale) || 1));
  const fontSize = Math.max(18, Math.round(Number(height) * 0.054 * safeFontScale));
  const marginV = Math.max(34, Math.round(Number(height) * 0.075));
  const outline = 0;
  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: ${width}
PlayResY: ${height}
WrapStyle: 2
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default, PingFang TC, ${fontSize}, &H00FFFFFF, &H000000FF, &H00000000, &H00000000, -1, 0, 0, 0, 100, 100, 0, 0, 1, ${outline}, 0, 2, 40, 40, ${marginV}, 1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
  const events = normalizeCaptions(captions)
    .map((caption) => `Dialogue: 0,${formatAssTime(caption.start)},${formatAssTime(caption.end)},Default,,0,0,0,,${assEscape(caption.text)}`)
    .join("\n");
  return `${header}${events}\n`;
}

function assFilterArg(filePath) {
  const escaped = String(filePath).replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/:/g, "\\:");
  return `ass=filename='${escaped}'`;
}

async function runFfmpeg(args) {
  const result = await run(ffmpegPath, args);
  return result;
}

function subtitleTextKey(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLocaleLowerCase("zh-TW")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "");
}

export function subtitleDraftMatchesTranscript(captions, transcriptText) {
  const expected = subtitleTextKey(transcriptText);
  const actual = subtitleTextKey((Array.isArray(captions) ? captions : []).map((caption) => caption?.text || "").join(""));
  return {
    matches: Boolean(expected) && actual === expected,
    expectedCharacters: expected.length,
    actualCharacters: actual.length
  };
}

export function subtitleSpeechCoverage(captions, timeline) {
  const rows = (Array.isArray(captions) ? captions : [])
    .map((caption) => ({ start: Number(caption?.start), end: Number(caption?.end) }))
    .filter((caption) => Number.isFinite(caption.start) && Number.isFinite(caption.end) && caption.end > caption.start);
  const segments = (Array.isArray(timeline?.segments) ? timeline.segments : [])
    .map((segment, index) => ({
      id: segment?.id || index + 1,
      start: Number(segment?.start),
      end: Number(segment?.end),
      text: String(segment?.text || "").trim()
    }))
    .filter((segment) => segment.text && Number.isFinite(segment.start) && Number.isFinite(segment.end) && segment.end > segment.start);
  if (!segments.length) return { matches: true, ratio: 1, segmentCount: 0, uncovered: [] };
  const uncovered = [];
  let speechSeconds = 0;
  let coveredSeconds = 0;
  for (const segment of segments) {
    const duration = segment.end - segment.start;
    speechSeconds += duration;
    const overlap = rows.reduce((total, caption) => (
      total + Math.max(0, Math.min(segment.end, caption.end) - Math.max(segment.start, caption.start))
    ), 0);
    const boundedOverlap = Math.min(duration, overlap);
    coveredSeconds += boundedOverlap;
    if (boundedOverlap < Math.min(duration * 0.45, 0.32)) {
      uncovered.push({ id: segment.id, start: segment.start, end: segment.end, text: segment.text.slice(0, 80) });
    }
  }
  const ratio = speechSeconds > 0 ? coveredSeconds / speechSeconds : 1;
  return {
    matches: uncovered.length === 0 && ratio >= 0.9,
    ratio: Number(ratio.toFixed(4)),
    segmentCount: segments.length,
    uncovered
  };
}

function subtitleLengthRatio(details = {}) {
  const expected = Number(details.expectedCharacters) || 0;
  const actual = Number(details.actualCharacters) || 0;
  if (!expected || !actual) return 0;
  return Math.min(expected, actual) / Math.max(expected, actual);
}

export function acceptsTimelineAlignedSubtitleDraft(transcriptMatch = {}, speechCoverage = {}) {
  return Boolean(
    speechCoverage?.matches
    && Number(transcriptMatch.expectedCharacters) >= 80
    && Number(transcriptMatch.actualCharacters) >= 80
    && subtitleLengthRatio(transcriptMatch) >= 0.9
  );
}

function hasEllipsisCaption(captions) {
  return (Array.isArray(captions) ? captions : [])
    .some((caption) => /…|\.{3}|⋯/.test(String(caption?.text || "")));
}

export function captionsFromTimeline(timeline) {
  const segments = Array.isArray(timeline?.segments) ? timeline.segments : [];
  return normalizeCaptions(segments
    .map((segment, index) => ({
      id: Number(segment?.id) || index + 1,
      sourceCaptionId: Number(segment?.sourceSegmentId || segment?.id) || index + 1,
      start: Number(segment?.start),
      end: Number(segment?.end),
      text: cleanCaptionText(segment?.text)
    }))
    .filter((caption) => (
      caption.text
      && Number.isFinite(caption.start)
      && Number.isFinite(caption.end)
      && caption.end > caption.start
    )))
    .map((caption, index) => ({ ...caption, id: index + 1 }));
}

export async function createSubtitleDraft({ mediaPath, outputDirectory, language = "auto", context = "", timelinePath = "", transcriptText = "", strictTranscript = false }) {
  await mkdir(outputDirectory, { recursive: true });
  const args = [
    path.join(SUBTITLE_SKILL_DIR, "scripts", "run.sh"),
    mediaPath,
    "--language", language,
    "--output-dir", outputDirectory,
    "--suffix", "字幕草稿",
    "--no-burn"
  ];
  if (context.trim()) args.push("--context", context.trim());
  if (timelinePath) args.push("--timeline", timelinePath);
  if (strictTranscript) args.push("--no-gap-transcribe", "--no-fill-reactions");
  const summary = parseSkillSummary((await run("bash", args)).stdout);
  const captions = parseSrt(await readFile(summary.output_srt, "utf8"));
  const transcriptMatch = transcriptText
    ? subtitleDraftMatchesTranscript(captions, transcriptText)
    : { matches: true, expectedCharacters: 0, actualCharacters: 0 };
  let speechCoverage = { matches: true, ratio: 1, segmentCount: 0, uncovered: [] };
  let timeline = null;
  if (timelinePath) {
    timeline = JSON.parse(await readFile(timelinePath, "utf8"));
    speechCoverage = subtitleSpeechCoverage(captions, timeline);
  }
  const timelineAlignedDraftAccepted = timelinePath
    ? acceptsTimelineAlignedSubtitleDraft(transcriptMatch, speechCoverage)
    : false;
  if (strictTranscript && timeline && (!transcriptMatch.matches || hasEllipsisCaption(captions))) {
    const timelineCaptions = captionsFromTimeline(timeline);
    if (timelineCaptions.length) {
      const timelineSrt = srtFromCaptions(timelineCaptions);
      const timelineAss = assFromCaptions(timelineCaptions, {
        width: summary.width || 1280,
        height: summary.height || 720
      });
      await writeFile(summary.output_srt, timelineSrt, "utf8");
      await writeFile(summary.output_ass, timelineAss, "utf8");
      const timelineMatch = transcriptText
        ? subtitleDraftMatchesTranscript(timelineCaptions, transcriptText)
        : { matches: true, expectedCharacters: 0, actualCharacters: 0 };
      const timelineCoverage = subtitleSpeechCoverage(timelineCaptions, timeline);
      return {
        ...summary,
        captions: timelineCaptions,
        caption_count: timelineCaptions.length,
        max_caption_display_width: Math.max(0, ...timelineCaptions.map((caption) => Array.from(caption.text || "").length)),
        line_breaks: 0,
        overlaps: 0,
        ass_wrap_style: 2,
        transcript_match: timelineMatch,
        speech_coverage: timelineCoverage,
        caption_source: "confirmed-timeline"
      };
    }
  }
  if (strictTranscript && !transcriptMatch.matches && !timelineAlignedDraftAccepted) {
    const error = new Error("字幕草稿沒有完整套用目前選定的逐字稿，已停止輸出，避免使用錯誤版本。");
    error.code = "SUBTITLE_TRANSCRIPT_MISMATCH";
    error.statusCode = 422;
    error.details = transcriptMatch;
    throw error;
  }
  if (strictTranscript && !speechCoverage.matches) {
    const error = new Error(`字幕時間線沒有覆蓋 ${speechCoverage.uncovered.length} 段語音，已停止輸出，避免產生只有局部字幕的影片。`);
    error.code = "SUBTITLE_TIMELINE_COVERAGE_MISMATCH";
    error.statusCode = 422;
    error.details = speechCoverage;
    throw error;
  }
  return { ...summary, captions, transcript_match: transcriptMatch, speech_coverage: speechCoverage };
}

function normalizeAudioGain(value) {
  const gain = Number(value);
  if (!Number.isFinite(gain)) return 1;
  return Math.max(0, Math.min(3, Number(gain.toFixed(2))));
}

export async function burnEditedSubtitles({ mediaPath, outputDirectory, captions, width = 1280, height = 720, fontScale = 1, audioGain = 1, basename = "精修字幕" }) {
  await mkdir(outputDirectory, { recursive: true });
  const safeBase = String(basename || "精修字幕").replace(/[\\/:*?"<>|]/g, " ").replace(/\s+/g, " ").trim() || "精修字幕";
  const normalized = normalizeCaptions(captions);
  if (!normalized.length) throw new Error("沒有可燒錄的字幕。");
  const safeAudioGain = normalizeAudioGain(audioGain);
  const srtPath = path.join(outputDirectory, `${safeBase}.srt`);
  const assPath = path.join(outputDirectory, `${safeBase}.ass`);
  const outputVideoPath = path.join(outputDirectory, `${safeBase}.mp4`);
  const audioFilters = [
    ...(Math.abs(safeAudioGain - 1) < 0.001 ? [] : [`volume=${safeAudioGain}`]),
    "aresample=48000:async=1:first_pts=0"
  ];
  const audioArgs = ["-af", audioFilters.join(","), "-c:a", "aac", "-b:a", "192k", "-ar", "48000"];

  await writeFile(srtPath, srtFromCaptions(normalized), "utf8");
  await writeFile(assPath, assFromCaptions(normalized, { width, height, fontScale }), "utf8");
  await runFfmpeg([
    "-hide_banner", "-loglevel", "error", "-y",
    "-i", mediaPath,
    "-vf", `${assFilterArg(assPath)},fps=30`,
    "-c:v", "libx264", "-preset", "slow", "-crf", "16",
    "-pix_fmt", "yuv420p",
    "-fps_mode", "cfr", "-r", "30",
    ...audioArgs, "-movflags", "+faststart",
    outputVideoPath
  ]);
  await runFfmpeg(["-v", "error", "-i", outputVideoPath, "-map", "0", "-f", "null", "-"]);

  return {
    output_video: outputVideoPath,
    output_srt: srtPath,
    output_ass: assPath,
    captions: normalized,
    caption_count: normalized.length,
    line_breaks: 0,
    overlaps: 0,
    ass_wrap_style: 2
  };
}

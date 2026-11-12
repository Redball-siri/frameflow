import { constants as fsConstants } from "node:fs";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

export const TRANSCRIPTION_SKILL_DIR = process.env.TRANSCRIPTION_SKILL_DIR
  || "/Users/redball/.codex/skills/transcribe-video-locally";

const DEFAULT_CACHE_DIR = process.env.TRANSCRIBE_VIDEO_CACHE
  || path.join(process.env.HOME || "", ".cache", "transcribe-video-locally");

export const SUPPORTED_EXTENSIONS = new Set([
  ".mp4", ".mov", ".m4v", ".webm", ".mkv", ".avi", ".mpeg", ".mpg",
  ".mp3", ".m4a", ".wav", ".aac", ".flac", ".ogg"
]);

export function validateMediaFilename(filename) {
  const extension = path.extname(filename).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    throw new Error("不支援這個檔案格式，請改用 MP4、MOV、WebM、MP3、M4A 或 WAV。");
  }
}

export function parseSkillSummary(stdout) {
  const lines = String(stdout).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    try {
      const parsed = JSON.parse(lines[index]);
      if (parsed.output) return parsed;
    } catch {
      // setup.sh may write informational messages before the final JSON line.
    }
  }
  throw new Error("本機轉錄完成，但沒有取得有效的輸出資訊。");
}

function runSkill(args, { runner = spawn } = {}) {
  return new Promise((resolve, reject) => {
    const child = runner("bash", [path.join(TRANSCRIPTION_SKILL_DIR, "scripts", "run.sh"), ...args], {
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (chunk) => {
      stdout = `${stdout}${chunk}`.slice(-24000);
    });
    child.stderr?.on("data", (chunk) => {
      stderr = `${stderr}${chunk}`.slice(-24000);
    });
    child.on("error", (error) => reject(new Error(`無法啟動本機轉錄：${error.message}`)));
    child.on("close", (code) => {
      if (code === 0) resolve(parseSkillSummary(stdout));
      else reject(new Error(`本機 Whisper 轉錄失敗。${stderr.trim() ? ` ${stderr.trim()}` : ""}`));
    });
  });
}

export async function getLocalWhisperStatus() {
  const pythonPath = path.join(DEFAULT_CACHE_DIR, "venv", "bin", "python");
  const modelPath = path.join(DEFAULT_CACHE_DIR, "models", "small.pt");
  const runPath = path.join(TRANSCRIPTION_SKILL_DIR, "scripts", "run.sh");

  try {
    await access(runPath, fsConstants.R_OK);
    await access(pythonPath, fsConstants.X_OK);
    await access(modelPath, fsConstants.R_OK);
    return {
      ready: true,
      model: "small",
      skill: "transcribe-video-locally",
      punctuation: "context-and-pauses",
      features: ["5-minute-segments", "word-timestamps", "pause-punctuation", "paragraph-breaks"]
    };
  } catch {
    return {
      ready: false,
      model: "small",
      skill: "transcribe-video-locally",
      punctuation: "context-and-pauses",
      features: ["5-minute-segments", "word-timestamps", "pause-punctuation", "paragraph-breaks"],
      note: "第一次處理時會自動安裝環境並下載模型。"
    };
  }
}

export async function transcribeMedia({
  mediaPath,
  outputPath,
  language = "auto",
  context = "",
  skillRunner = runSkill
}) {
  const args = [mediaPath, "--language", language];
  if (context.trim()) args.push("--context", context.trim().slice(0, 500));
  if (outputPath) args.push("--output", outputPath);

  const summary = await skillRunner(args);
  const transcript = (await readFile(summary.output, "utf8")).trim();
  if (!transcript) throw new Error("辨識完成，但沒有取得任何文字。");

  return {
    transcript,
    transcriptPath: summary.output,
    segments: summary.segments,
    characters: summary.characters,
    languages: summary.languages,
    model: summary.model,
    punctuation: summary.punctuation || "whisper-native",
    engine: "local-whisper",
    offline: true
  };
}

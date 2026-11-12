#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { assessTranscriptQuality, buildTitleStrategy } from "../lib/content.js";
import { SUPPORTED_EXTENSIONS, transcribeMedia, validateMediaFilename } from "../lib/transcription.js";

const transcriptExtensions = new Set([".txt", ".md", ".srt", ".vtt"]);

function usage() {
  return [
    "用法：npm run title:strategy -- --input <影片或逐字稿> [選項]",
    "",
    "選項：",
    "  --output <path>            指定標題策略 JSON 輸出位置",
    "  --transcript-output <path> 指定影片轉錄文字輸出位置",
    "  --language <auto|zh|en|ja|ko> 轉錄語言，預設 auto",
    "  --context <text>           人名、品牌、專有名詞或影片背景",
    "  --slide-count <number>     用於切重點的段落密度，預設 8"
  ].join("\n");
}

function parseArgs(argv) {
  const options = {
    input: "",
    output: "",
    transcriptOutput: "",
    language: "auto",
    context: "",
    slideCount: 8
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = () => {
      index += 1;
      if (index >= argv.length) throw new Error(`${arg} 需要一個值。`);
      return argv[index];
    };
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--input" || arg === "-i") {
      options.input = next();
    } else if (arg === "--output" || arg === "-o") {
      options.output = next();
    } else if (arg === "--transcript-output") {
      options.transcriptOutput = next();
    } else if (arg === "--language") {
      options.language = next();
    } else if (arg === "--context") {
      options.context = next();
    } else if (arg === "--slide-count") {
      options.slideCount = Number(next()) || 8;
    } else if (!arg.startsWith("-") && !options.input) {
      options.input = arg;
    } else {
      throw new Error(`不認得的參數：${arg}`);
    }
  }
  return options;
}

function safeBaseName(filePath) {
  return path.basename(filePath, path.extname(filePath))
    .replace(/[\\/:*?"<>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60) || "影片標題策略";
}

function defaultOutputPath(inputPath) {
  return path.join(process.cwd(), "outputs", "title-strategy", `${safeBaseName(inputPath)}-標題策略.json`);
}

async function transcriptFromInput(options) {
  const inputPath = path.resolve(options.input);
  const extension = path.extname(inputPath).toLowerCase();
  if (transcriptExtensions.has(extension)) {
    return {
      sourceType: "transcript",
      transcript: await readFile(inputPath, "utf8"),
      transcriptPath: inputPath,
      transcription: null
    };
  }
  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    validateMediaFilename(inputPath);
  }
  const transcriptOutput = options.transcriptOutput
    ? path.resolve(options.transcriptOutput)
    : path.join(path.dirname(defaultOutputPath(inputPath)), `${safeBaseName(inputPath)}-逐字稿.txt`);
  await mkdir(path.dirname(transcriptOutput), { recursive: true });
  const transcription = await transcribeMedia({
    mediaPath: inputPath,
    outputPath: transcriptOutput,
    language: options.language,
    context: options.context
  });
  return {
    sourceType: "media",
    transcript: transcription.transcript,
    transcriptPath: transcription.transcriptPath,
    transcription
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }
  if (!options.input) throw new Error(`請提供輸入檔案。\n\n${usage()}`);

  const inputPath = path.resolve(options.input);
  const outputPath = path.resolve(options.output || defaultOutputPath(inputPath));
  await mkdir(path.dirname(outputPath), { recursive: true });

  const input = await transcriptFromInput(options);
  const quality = assessTranscriptQuality(input.transcript);
  if (!quality.usable) {
    throw new Error(`逐字稿品質不足：${quality.issues.join("、")}。請補上 --context 或確認影片語音清楚。`);
  }

  const strategy = buildTitleStrategy(quality.cleaned, {
    slideCount: options.slideCount,
    context: options.context
  });
  const payload = {
    source: inputPath,
    sourceType: input.sourceType,
    transcriptPath: input.transcriptPath,
    generatedAt: new Date().toISOString(),
    quality,
    strategy
  };
  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(JSON.stringify({
    output: outputPath,
    transcript: input.transcriptPath,
    primaryTitle: strategy.primaryTitle,
    subtitle: strategy.subtitle || null,
    keyPoints: strategy.keyPoints.length,
    candidates: strategy.titleCandidates.map((candidate) => candidate.title)
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});

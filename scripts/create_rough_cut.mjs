#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  createRoughCutPlan,
  createRoughCutVideo,
  roughCutPlanToText
} from "../lib/roughcut.js";

function usage() {
  return `Usage:
  node scripts/create_rough_cut.mjs timeline.json [--output plan.json] [--report report.txt]
  node scripts/create_rough_cut.mjs timeline.json --media source.mp4 --video-output roughcut.mp4

Options:
  --duration seconds
  --max-pause seconds
  --take-gap seconds
  --similarity 0.62
  --no-word-edits
  --no-pause-edits
  --no-best-take
  --no-trailing-incomplete
  --no-audio
`;
}

function readArgs(argv) {
  const args = { positional: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith("--")) {
      args.positional.push(value);
      continue;
    }
    const key = value.slice(2);
    if (key.startsWith("no-")) {
      args[key] = true;
      continue;
    }
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    index += 1;
  }
  return args;
}

function numberOption(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

const args = readArgs(process.argv.slice(2));
const inputPath = args.positional[0];

if (!inputPath || args.help) {
  console.log(usage());
  process.exit(inputPath ? 0 : 1);
}

const absoluteInput = path.resolve(inputPath);
const input = JSON.parse(await readFile(absoluteInput, "utf8"));
const outputPath = path.resolve(args.output || absoluteInput.replace(/\.json$/i, "-roughcut-plan.json"));
const reportPath = args.report ? path.resolve(args.report) : outputPath.replace(/\.json$/i, ".txt");

const plan = createRoughCutPlan(input, {
  durationSeconds: numberOption(args.duration),
  maxPauseSeconds: numberOption(args["max-pause"]),
  maxTakeGapSeconds: numberOption(args["take-gap"]),
  repeatedTakeSimilarity: numberOption(args.similarity),
  cutWordDisfluencies: !args["no-word-edits"],
  cutLongPauses: !args["no-pause-edits"],
  cutRepeatedTakes: !args["no-best-take"],
  cutTrailingIncomplete: !args["no-trailing-incomplete"]
});

await writeFile(outputPath, `${JSON.stringify(plan, null, 2)}\n`, "utf8");
await writeFile(reportPath, roughCutPlanToText(plan), "utf8");

let videoOutputPath = null;
if (args.media && args["video-output"]) {
  videoOutputPath = path.resolve(args["video-output"]);
  await createRoughCutVideo({
    mediaPath: path.resolve(args.media),
    outputPath: videoOutputPath,
    plan,
    hasAudio: !args["no-audio"]
  });
}

console.log(JSON.stringify({
  plan: outputPath,
  report: reportPath,
  video: videoOutputPath,
  removals: plan.summary.removals,
  repeatedTakeGroups: plan.summary.repeatedTakeGroups,
  estimatedOutputSeconds: plan.summary.estimatedOutputSeconds
}, null, 2));

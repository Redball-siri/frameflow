import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const server = await readFile(new URL("../server.js", import.meta.url), "utf8");
const localVisuals = await readFile(new URL("../lib/local-visuals.js", import.meta.url), "utf8");
const media = await readFile(new URL("../lib/media.js", import.meta.url), "utf8");
const brollGenerator = await readFile(new URL("../scripts/generate_local_broll.py", import.meta.url), "utf8");

test("B-roll quality failures skip one item and preserve accepted outputs", () => {
  assert.match(brollGenerator, /skipped = \[\]/);
  assert.match(brollGenerator, /skipped\.append\(/);
  assert.match(brollGenerator, /continue\s+\n\s+if not reused_existing:/);
  assert.doesNotMatch(brollGenerator, /raise RuntimeError\(f"第 \{item_id\} 段連續四次/);
  assert.match(brollGenerator, /reusedExisting/);
  assert.match(localVisuals, /generated\.skipped =/);
  assert.match(localVisuals, /reuse_existing/);
  assert.match(localVisuals, /previous\.sourcePhrase === selectedItem\.sourcePhrase/);
  assert.match(brollGenerator, /item\.get\("reuse_existing"\) is True/);
  assert.match(brollGenerator, /except Exception as error:[\s\S]*generation_errors\.append/);
  assert.match(server, /type: "broll-skipped"/);
  assert.match(server, /generationStatus: skippedAiBrollById/);
  assert.match(media, /for \(const item of manifest\)[\s\S]*stage: "clip-export"/);
  assert.match(media, /clips\.skipped = skipped/);
  assert.match(media, /writeSmoothClipSummaries\(exported, outputDirectory\)/);
  assert.match(server, /const skippedBrollExports = Array\.isArray\(aiClips\.skipped\)/);
  assert.match(server, /allSkippedAiBroll/);
  assert.match(server, /"skipped-export"/);
});

test("subtitle confirmation gates PPT and B-roll generation", () => {
  assert.match(server, /async function prepareSubtitleReviewBeforeHighCost/);
  assert.match(server, /deferredUntil: "subtitles-confirmed"/);
  assert.match(server, /async function generateOutputsAfterConfirmedSubtitles/);
  assert.match(server, /compositionBaseVideoPath = baseVideoPath \|\| subtitledVideoPath/);
  assert.match(server, /mediaPath: compositionBaseVideoPath/);
  assert.match(server, /subtitlePolicy: "confirmed-subtitles-burned-after-ppt-broll"/);
  assert.match(server, /subtitleLayerPolicy: "topmost-after-ppt-broll"/);
  assert.match(server, /awaitingSubtitleApproval: true/);
  assert.match(server, /phase: shouldGenerateDeferredOutputs \? "subtitle-confirmation-and-generation"/);
});

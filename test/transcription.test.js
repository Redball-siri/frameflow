import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { parseSkillSummary, transcribeMedia, validateMediaFilename } from "../lib/transcription.js";

test("validateMediaFilename accepts common media formats", () => {
  assert.doesNotThrow(() => validateMediaFilename("訪談.MP4"));
  assert.doesNotThrow(() => validateMediaFilename("recording.m4a"));
});

test("validateMediaFilename rejects unsupported formats", () => {
  assert.throws(() => validateMediaFilename("notes.pdf"), /不支援/);
});

test("parseSkillSummary reads the upgraded punctuation metadata", () => {
  const parsed = parseSkillSummary("setup message\n{\"output\":\"/tmp/out.txt\",\"segments\":2,\"punctuation\":\"context-and-pauses\"}\n");
  assert.equal(parsed.output, "/tmp/out.txt");
  assert.equal(parsed.segments, 2);
  assert.equal(parsed.punctuation, "context-and-pauses");
});

test("transcribeMedia reads the TXT created by transcribe-video-locally", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "frameflow-transcription-test-"));
  const outputPath = path.join(directory, "sample-逐字稿.txt");
  const requests = [];
  const skillRunner = async (args) => {
    requests.push(args);
    await writeFile(outputPath, "測試逐字稿\n", "utf8");
    return {
      output: outputPath,
      segments: 1,
      characters: 5,
      languages: ["zh"],
      model: "small",
      offline: true,
      punctuation: "context-and-pauses"
    };
  };

  try {
    const result = await transcribeMedia({
      mediaPath: path.join(directory, "sample.mp4"),
      outputPath,
      language: "zh",
      context: "專有名詞",
      skillRunner
    });
    assert.equal(result.transcript, "測試逐字稿");
    assert.equal(result.engine, "local-whisper");
    assert.equal(result.offline, true);
    assert.equal(result.punctuation, "context-and-pauses");
    assert.deepEqual(requests[0].slice(0, 3), [path.join(directory, "sample.mp4"), "--language", "zh"]);
    assert.ok(requests[0].includes("--context"));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

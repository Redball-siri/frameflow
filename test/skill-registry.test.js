import test from "node:test";
import assert from "node:assert/strict";
import { inspectWorkflowSkills, workflowSkillSnapshot } from "../lib/skill-registry.js";

const expectedSkills = [
  "transcribe-video-locally",
  "subtitle-video-locally",
  "roughcut-video-locally",
  "generate-local-broll",
  "speech-summary-polisher",
  "extract-verbatim-highlights",
  "video-context-timeline-ppt",
  "video-title-summarizer"
];

test("workflow skill registry reads every current local skill snapshot", async () => {
  const report = await inspectWorkflowSkills();
  assert.equal(report.source, "current-local-snapshot");
  assert.deepEqual(Object.keys(report.items), expectedSkills);
  for (const name of expectedSkills) {
    const item = report.items[name];
    assert.equal(item.ready, true, `${name} should be ready`);
    assert.match(item.fingerprint, /^[a-f0-9]{16}$/);
    assert.ok(item.updatedAt);
    assert.ok(item.features.length >= 3);
  }
  assert.ok(report.items["generate-local-broll"].features.includes("keyword-diversity"));
  assert.ok(report.items["extract-verbatim-highlights"].features.includes("no-paraphrase"));
  assert.ok(report.items["video-context-timeline-ppt"].features.includes("content-first"));
});

test("workflow skill snapshot keeps the exact version used by a project", async () => {
  const report = await inspectWorkflowSkills();
  const snapshot = workflowSkillSnapshot(report, ["speech-summary-polisher", "extract-verbatim-highlights", "video-title-summarizer"]);
  assert.deepEqual(Object.keys(snapshot), ["speech-summary-polisher", "extract-verbatim-highlights", "video-title-summarizer"]);
  assert.equal(snapshot["speech-summary-polisher"].source, "current-local-snapshot");
  assert.equal(snapshot["extract-verbatim-highlights"].source, "current-local-snapshot");
  assert.ok(snapshot["video-title-summarizer"].fingerprint);
});

import test from "node:test";
import assert from "node:assert/strict";
import { getLocalVisualStatus } from "../lib/local-visuals.js";

test("local visual status reports the quality-first model pipeline", async () => {
  const status = await getLocalVisualStatus();
  assert.equal(status.model, "Frameflow 品質優先 B-roll 模型");
  assert.equal(status.mode, "stable-diffusion-lcm-keyframes");
  assert.equal(status.quality, "quality-first");
  assert.notEqual(status.mode, "semantic-procedural-motion");
});

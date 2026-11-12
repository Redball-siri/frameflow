import assert from "node:assert/strict";
import test from "node:test";
import { buildPortableNleProject } from "../lib/nle.js";

test("portable NLE project keeps source timing and creates importable formats", () => {
  const files = buildPortableNleProject({
    title: "粗剪測試",
    sourceRelativePath: "media/source/source.mp4",
    durationSeconds: 12,
    keepRanges: [{ start: 1, end: 4 }, { start: 7, end: 11 }],
    frameRate: 59.94,
    width: 3840,
    height: 2160
  });
  assert.deepEqual(Object.keys(files).sort(), [
    "project/剪輯時間線.edl",
    "project/剪輯時間線.fcpxml",
    "project/剪輯時間線.otio"
  ]);
  assert.match(files["project/剪輯時間線.fcpxml"], /frameDuration="1001\/60000s"/);
  assert.match(files["project/剪輯時間線.fcpxml"], /start="60060\/60000s"/);
  assert.match(files["project/剪輯時間線.fcpxml"], /src="\.\.\/media\/source\/source\.mp4"/);
  const otio = JSON.parse(files["project/剪輯時間線.otio"]);
  assert.equal(otio.tracks.children[0].children.length, 2);
  assert.equal(otio.tracks.children[1].kind, "Audio");
  assert.match(files["project/剪輯時間線.edl"], /001\s+AX\s+V\s+C/);
});

import test from "node:test";
import assert from "node:assert/strict";
import {
  buildKeepRanges,
  buildRoughCutFfmpegArgs,
  buildSegmentPartFfmpegArgs,
  createRoughCutPlan,
  findRepeatedTakeGroups,
  normalizeSpeechSegments,
  speechSimilarity
} from "../lib/roughcut.js";

test("normalizeSpeechSegments accepts Whisper timeline JSON", () => {
  const segments = normalizeSpeechSegments({
    segments: [{
      start: 1,
      end: 2.25,
      text: "我覺得這個工具很適合粗剪",
      words: [{ start: 1, end: 1.2, word: "我" }]
    }]
  });
  assert.equal(segments.length, 1);
  assert.equal(segments[0].text, "我覺得這個工具很適合粗剪");
  assert.equal(segments[0].words[0].text, "我");
});

test("speechSimilarity ignores filler words when comparing repeated takes", () => {
  const similarity = speechSimilarity(
    "我我我覺得這個工具其實嗯很適合做影片粗剪",
    "我覺得這個工具很適合做影片粗剪"
  );
  assert.ok(similarity >= 0.8);
});

test("findRepeatedTakeGroups keeps the most fluent repeated sentence", () => {
  const groups = findRepeatedTakeGroups([
    { id: "bad-start", start: 0, end: 3, text: "我我我覺得這個工具其實嗯很適合做影片粗剪" },
    { id: "best", start: 3.2, end: 6, text: "我覺得這個工具很適合做影片粗剪" },
    { id: "bad-repeat", start: 6.25, end: 9.1, text: "我覺得這個這個工具很適合做影片粗剪" }
  ]);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].keep.id, "best");
  assert.deepEqual(groups[0].remove.map((item) => item.id).sort(), ["bad-repeat", "bad-start"]);
});

test("findRepeatedTakeGroups prefers the final take when fluency is similar", () => {
  const groups = findRepeatedTakeGroups([
    { id: "first", start: 0, end: 2, text: "這個工具可以幫我們做影片粗剪" },
    { id: "final", start: 2.4, end: 4.6, text: "這個工具可以幫我們做影片粗剪" }
  ]);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].keep.id, "final");
  assert.equal(groups[0].remove[0].id, "first");
});

test("createRoughCutPlan removes long pauses but leaves handles around speech", () => {
  const plan = createRoughCutPlan([
    { start: 0, end: 1, text: "第一句內容" },
    { start: 2.5, end: 4, text: "第二句內容" }
  ], {
    cutWordDisfluencies: false,
    cutRepeatedTakes: false,
    maxPauseSeconds: 0.8,
    pauseHandleSeconds: 0.1
  });
  assert.equal(plan.removals.length, 1);
  assert.equal(plan.removals[0].source, "long_pause");
  assert.equal(plan.removals[0].start, 1.1);
  assert.equal(plan.removals[0].end, 2.4);
});

test("createRoughCutPlan detects source pauses even when selected transcript merged lines", () => {
  const editedTimeline = {
    segments: [
      {
        id: "edited",
        start: 48.56,
        end: 63.06,
        text: "有些是主動有些是被動有些是還沒1月初就被離開了。",
        words: [
          { start: 48.56, end: 49.37, text: "有" },
          { start: 49.37, end: 50.06, text: "些" },
          { start: 50.06, end: 50.72, text: "是" },
          { start: 50.72, end: 51.03, text: "主" },
          { start: 51.03, end: 53.52, text: "動" },
          { start: 53.52, end: 55.02, text: "有" }
        ]
      }
    ]
  };
  const sourceTimeline = {
    segments: [
      { id: "source-a", start: 48.56, end: 51.22, text: "有些是主動" },
      { id: "source-b", start: 54.02, end: 59.46, text: "有些是被動有些是還沒1月初就被離開了" }
    ]
  };
  const plan = createRoughCutPlan(editedTimeline, {
    pauseTimeline: sourceTimeline,
    durationSeconds: 70,
    cutWordDisfluencies: false,
    cutRepeatedTakes: false,
    cutDisfluentFragments: false,
    cutRamblingLoops: false,
    maxPauseSeconds: 0.9,
    pauseHandleSeconds: 0.24
  });
  const pause = plan.removals.find((range) => range.sources?.includes("long_pause"));
  assert.ok(pause);
  assert.equal(pause.start, 51.46);
  assert.equal(pause.end, 53.78);
});

test("createRoughCutPlan removes filler words and early duplicate stutters", () => {
  const plan = createRoughCutPlan([
    {
      id: 1,
      start: 0,
      end: 2,
      text: "我 我 覺得 嗯 這個功能可以",
      words: [
        { start: 0.0, end: 0.12, text: "我" },
        { start: 0.16, end: 0.28, text: "我" },
        { start: 0.35, end: 0.65, text: "覺得" },
        { start: 1.0, end: 1.2, text: "嗯" },
        { start: 1.25, end: 1.55, text: "這個" },
        { start: 1.55, end: 1.9, text: "功能" }
      ]
    }
  ], {
    cutLongPauses: false,
    cutRepeatedTakes: false
  });
  const sources = plan.removals.flatMap((range) => range.sources);
  assert.ok(sources.includes("stutter_word"));
  assert.ok(sources.includes("filler_word"));
});

test("createRoughCutPlan removes weaker repeated takes from the edit", () => {
  const plan = createRoughCutPlan([
    { id: "a", start: 0, end: 2, text: "我我覺得粗剪可以先自動做" },
    { id: "b", start: 2.2, end: 4.2, text: "我覺得粗剪可以先自動做" },
    { id: "c", start: 5, end: 7, text: "接下來再人工檢查節奏" }
  ], {
    cutLongPauses: false,
    cutWordDisfluencies: false
  });
  assert.equal(plan.groups.length, 1);
  assert.equal(plan.groups[0].keep.id, "b");
  assert.ok(plan.removals[0].sources.includes("repeated_take"));
  assert.equal(plan.keepRanges[0].start, 2);
  assert.equal(plan.keepRanges.at(-1).end, 7);
});

test("createRoughCutPlan removes false starts before the completed sentence", () => {
  const plan = createRoughCutPlan([
    { id: "fragment", start: 0, end: 1.4, text: "我覺得這個就是" },
    { id: "complete", start: 1.8, end: 4.2, text: "我覺得這個功能可以先自動做粗剪" }
  ], {
    cutLongPauses: false,
    cutWordDisfluencies: false,
    cutRepeatedTakes: false,
    cutRamblingLoops: false
  });
  assert.equal(plan.removals.length, 1);
  assert.equal(plan.removals[0].source, "false_start");
  assert.match(plan.removals[0].items[0].text, /就是/);
});

test("createRoughCutPlan removes an unfinished trailing topic segment", () => {
  const plan = createRoughCutPlan([
    { id: "complete", start: 0, end: 2.4, text: "今天我去公園玩好好玩。" },
    { id: "unfinished", start: 2.8, end: 3.6, text: "晚餐要" }
  ], {
    durationSeconds: 4.5,
    cutLongPauses: false,
    cutWordDisfluencies: false,
    cutRepeatedTakes: false,
    cutDisfluentFragments: false,
    cutRamblingLoops: false
  });
  assert.equal(plan.removals.length, 1);
  assert.equal(plan.removals[0].source, "trailing_incomplete");
  assert.equal(plan.removals[0].start, 2.8);
  assert.equal(plan.removals[0].end, 4.5);
  assert.equal(plan.keepRanges.at(-1).end, 2.8);
});

test("createRoughCutPlan removes only the unfinished tail after the last complete sentence", () => {
  const plan = createRoughCutPlan([
    {
      id: "mixed-ending",
      start: 0,
      end: 4,
      text: "今天我去公園玩好好玩。晚餐要",
      words: [
        { start: 0, end: 0.4, text: "今天" },
        { start: 0.4, end: 0.8, text: "我" },
        { start: 0.8, end: 1.2, text: "去" },
        { start: 1.2, end: 1.8, text: "公園" },
        { start: 1.8, end: 2.4, text: "玩好好玩。" },
        { start: 3.0, end: 3.4, text: "晚餐" },
        { start: 3.4, end: 3.7, text: "要" }
      ]
    }
  ], {
    durationSeconds: 4.2,
    cutLongPauses: false,
    cutWordDisfluencies: false,
    cutRepeatedTakes: false,
    cutDisfluentFragments: false,
    cutRamblingLoops: false
  });
  assert.equal(plan.removals.length, 1);
  assert.equal(plan.removals[0].source, "trailing_incomplete");
  assert.equal(plan.removals[0].start, 3);
  assert.equal(plan.removals[0].end, 4.2);
});

test("createRoughCutPlan keeps short complete closing phrases at the end", () => {
  const plan = createRoughCutPlan([
    { id: "content", start: 0, end: 2.4, text: "今天我去公園玩好好玩。" },
    { id: "closing", start: 2.8, end: 3.5, text: "謝謝大家" }
  ], {
    durationSeconds: 3.5,
    cutLongPauses: false,
    cutWordDisfluencies: false,
    cutRepeatedTakes: false,
    cutDisfluentFragments: false,
    cutRamblingLoops: false
  });
  assert.equal(plan.removals.length, 0);
  assert.equal(plan.keepRanges.at(-1).end, 3.5);
});

test("createRoughCutPlan aggressively removes repeated idea variations by default", () => {
  const plan = createRoughCutPlan([
    { id: "first", start: 0, end: 3, text: "我們每年第一季都會遇到案子比較少的狀況" },
    { id: "aside", start: 3.5, end: 5, text: "所以這件事大家要知道" },
    { id: "variation", start: 7, end: 10, text: "我們第一季常常會遇到案子比較少的狀況" }
  ], {
    cutLongPauses: false,
    cutWordDisfluencies: false,
    cutRepeatedTakes: false,
    cutDisfluentFragments: false
  });
  const sources = plan.removals.flatMap((range) => range.sources);
  assert.ok(sources.includes("rambling_loop"));
});

test("createRoughCutPlan removes short trial phrasing when a fuller take follows", () => {
  const plan = createRoughCutPlan([
    { id: "trial", start: 0, end: 1.8, text: "今年在一月底離開了三位" },
    { id: "full", start: 4.2, end: 8.4, text: "人事的變動像今年在一月底的時候我們離開了三位同事" }
  ], {
    cutLongPauses: false,
    cutWordDisfluencies: false,
    cutDisfluentFragments: false
  });
  assert.equal(plan.groups.length, 1);
  assert.equal(plan.groups[0].keep.id, "full");
  assert.equal(plan.groups[0].remove[0].id, "trial");
  assert.ok(plan.removals.flatMap((range) => range.sources).includes("repeated_take"));
});

test("createRoughCutPlan caps aggressive automatic removals", () => {
  const repeated = Array.from({ length: 14 }, (_, index) => ({
    id: `take-${index + 1}`,
    start: index * 3,
    end: index * 3 + 2,
    text: index % 2 === 0 ? "這件事情我們每一年都要提醒大家" : "這件事情每一年都需要提醒大家"
  }));
  const plan = createRoughCutPlan(repeated, {
    durationSeconds: 42,
    cutLongPauses: false,
    cutWordDisfluencies: false,
    cutDisfluentFragments: false,
    repeatedTakeSimilarity: 0.72
  });
  assert.ok(plan.summary.candidateRemovedSeconds > plan.summary.removedSeconds);
  assert.ok(plan.summary.removedSeconds <= 42 * 0.55 + 0.001);
});

test("buildKeepRanges inverts merged removals", () => {
  const keep = buildKeepRanges({
    durationSeconds: 10,
    removeRanges: [
      { start: 2, end: 3.5, source: "test", reason: "測試" },
      { start: 3.55, end: 4, source: "test", reason: "測試" },
      { start: 8, end: 9, source: "test", reason: "測試" }
    ]
  });
  assert.deepEqual(keep.map(({ start, end }) => ({ start, end })), [
    { start: 0, end: 2 },
    { start: 4, end: 8 },
    { start: 9, end: 10 }
  ]);
});

test("buildRoughCutFfmpegArgs creates trim and concat filters", () => {
  const args = buildRoughCutFfmpegArgs({
    mediaPath: "/tmp/source.mp4",
    outputPath: "/tmp/roughcut.mp4",
    keepRanges: [
      { start: 0, end: 2 },
      { start: 4, end: 7.25 }
    ]
  });
  const filter = args[args.indexOf("-filter_complex") + 1];
  assert.match(filter, /trim=start=0:end=2/);
  assert.match(filter, /atrim=start=4:end=7.25/);
  assert.match(filter, /aresample=async=1:first_pts=0/);
  assert.doesNotMatch(filter, /volume=/);
  assert.doesNotMatch(filter, /afade=t=in/);
  assert.doesNotMatch(filter, /afade=t=out/);
  assert.match(filter, /concat=n=2:v=1:a=1/);
  assert.ok(args.includes("/tmp/roughcut.mp4"));
});

test("buildRoughCutFfmpegArgs applies requested output volume gain", () => {
  const args = buildRoughCutFfmpegArgs({
    mediaPath: "/tmp/source.mp4",
    outputPath: "/tmp/roughcut-louder.mp4",
    keepRanges: [{ start: 0, end: 2 }],
    audioGain: 1.8
  });
  const filter = args[args.indexOf("-filter_complex") + 1];
  assert.match(filter, /volume=1\.8/);
});

test("buildRoughCutFfmpegArgs supports high-bitrate VideoToolbox output without x264-only flags", () => {
  const args = buildRoughCutFfmpegArgs({
    mediaPath: "/tmp/source.mp4",
    outputPath: "/tmp/roughcut.mp4",
    keepRanges: [{ start: 0, end: 2 }],
    videoCodec: "h264_videotoolbox",
    preset: null,
    crf: null,
    videoProfile: "high",
    videoBitrate: "36M",
    videoMaxRate: "48M",
    videoBufferSize: "72M",
    videoCodecArgs: ["-realtime", "1", "-prio_speed", "1"]
  });
  assert.equal(args[args.indexOf("-c:v") + 1], "h264_videotoolbox");
  assert.equal(args.includes("-preset"), false);
  assert.equal(args.includes("-crf"), false);
  assert.equal(args[args.indexOf("-b:v") + 1], "36M");
  assert.equal(args[args.indexOf("-maxrate") + 1], "48M");
  assert.equal(args[args.indexOf("-bufsize") + 1], "72M");
  assert.equal(args[args.indexOf("-realtime") + 1], "1");
  assert.equal(args[args.indexOf("-prio_speed") + 1], "1");
});

test("buildSegmentPartFfmpegArgs uses precise seek and keeps default audio volume unchanged", () => {
  const args = buildSegmentPartFfmpegArgs({
    mediaPath: "/tmp/source.mp4",
    partPath: "/tmp/part.mp4",
    range: { start: 10, end: 14.5 },
    outputFps: 30
  });
  const ssIndexes = args.flatMap((value, index) => value === "-ss" ? [index] : []);
  assert.equal(ssIndexes.length, 1);
  const videoFilter = args[args.indexOf("-vf") + 1];
  const audioFilter = args[args.indexOf("-af") + 1];
  assert.match(videoFilter, /trim=start=1\.2:duration=4\.5/);
  assert.match(videoFilter, /fps=30/);
  assert.match(audioFilter, /atrim=start=1\.2:duration=4\.5/);
  assert.match(audioFilter, /aresample=async=1:first_pts=0/);
  assert.doesNotMatch(audioFilter, /volume=/);
  assert.doesNotMatch(audioFilter, /afade=t=in/);
  assert.doesNotMatch(audioFilter, /afade=t=out/);
  assert.ok(args.includes("-fps_mode"));
  assert.ok(args.includes("-shortest"));
  assert.equal(args.includes("-ac"), false);
  assert.equal(args.includes("-ar"), false);
});

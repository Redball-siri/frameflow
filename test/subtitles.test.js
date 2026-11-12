import test from "node:test";
import assert from "node:assert/strict";
import { acceptsTimelineAlignedSubtitleDraft, assFromCaptions, captionsFromTimeline, formatSrtTime, normalizeCaptions, parseSrt, srtFromCaptions, subtitleDraftMatchesTranscript, subtitleSpeechCoverage } from "../lib/subtitles.js";

test("formatSrtTime writes standard SRT timestamps", () => {
  assert.equal(formatSrtTime(65.432), "00:01:05,432");
});

test("parseSrt reads caption timing and flattens text lines", () => {
  const captions = parseSrt(`1
00:00:01,250 --> 00:00:03,000
第一句
第二行

2
00:00:03,500 --> 00:00:05,000
下一句
`);
  assert.deepEqual(captions, [
    { id: 1, start: 1.25, end: 3, text: "第一句 第二行" },
    { id: 2, start: 3.5, end: 5, text: "下一句" }
  ]);
});

test("srtFromCaptions preserves manual subtitle line breaks", () => {
  const srt = srtFromCaptions([{ start: 0, end: 1.5, text: "第一句\n第二句" }]);
  assert.match(srt, /第一句\n第二句/);
});

test("assFromCaptions applies subtitle font scale", () => {
  const normal = assFromCaptions([{ start: 0, end: 1.5, text: "字幕" }], { width: 1280, height: 720, fontScale: 1 });
  const smaller = assFromCaptions([{ start: 0, end: 1.5, text: "字幕" }], { width: 1280, height: 720, fontScale: 0.7 });
  assert.match(normal, /Style: Default, PingFang TC, 39,/);
  assert.match(smaller, /Style: Default, PingFang TC, 27,/);
});

test("assFromCaptions uses clean subtitles without outline or shadow", () => {
  const ass = assFromCaptions([{ start: 0, end: 1.5, text: "乾淨字幕" }], { width: 1280, height: 720, fontScale: 1 });
  assert.match(ass, /Style: Default, PingFang TC, 39, &H00FFFFFF, &H000000FF, &H00000000, &H00000000, -1, 0, 0, 0, 100, 100, 0, 0, 1, 0, 0, 2,/);
});

test("normalizeCaptions prevents overlapping subtitle timings", () => {
  const captions = normalizeCaptions([
    { start: 0, end: 3, text: "前一句" },
    { start: 2, end: 4, text: "後一句" }
  ]);
  assert.ok(captions[0].end <= captions[1].start);
});

test("normalizeCaptions does not recreate overlap when captions start less than 80ms apart", () => {
  const captions = normalizeCaptions([
    { id: 18, sourceCaptionId: 18, start: 10, end: 10.4, text: "極短前句" },
    { id: 19, sourceCaptionId: 19, start: 10.04, end: 11, text: "緊接後句" }
  ]);
  assert.ok(captions[0].end <= captions[1].start);
  assert.equal(captions[0].sourceCaptionId, 18);
  assert.equal(captions[1].sourceCaptionId, 19);
});

test("normalizeCaptions distributes captions that share an identical source interval", () => {
  const captions = normalizeCaptions([
    { id: 1, start: 10, end: 20, text: "較短的一句" },
    { id: 2, start: 10, end: 20, text: "這是明顯比較長而且也需要足夠閱讀時間的第二句" }
  ]);

  assert.equal(captions[0].start, 10);
  assert.equal(captions[1].end, 20);
  assert.equal(captions[0].end, captions[1].start);
  assert.ok(captions[0].end - captions[0].start > 1);
  assert.ok(captions[1].end - captions[1].start > captions[0].end - captions[0].start);
});

test("assFromCaptions uses no auto-wrap but preserves manual line breaks", () => {
  const ass = assFromCaptions([{ start: 0, end: 1.2, text: "第一句\n第二句 {註記} \\N" }], { width: 1920, height: 1080 });
  assert.match(ass, /PlayResX: 1920/);
  assert.match(ass, /WrapStyle: 2/);
  assert.match(ass, /第一句\\N第二句 ｛註記｝/);
});

test("subtitle draft validation rejects text from a different transcript version", () => {
  const selected = "一年一度要分享一些雞湯，也和公司的近況有關。";
  const staleCaptions = [{ start: 0, end: 3, text: "一年一度要分享一些基湯，也和公司的近況有關。" }];
  const selectedCaptions = [{ start: 0, end: 3, text: "一年一度要分享一些雞湯，也和公司的近況有關。" }];
  assert.equal(subtitleDraftMatchesTranscript(staleCaptions, selected).matches, false);
  assert.equal(subtitleDraftMatchesTranscript(selectedCaptions, selected).matches, true);
});

test("timeline-aligned subtitle draft allows tiny long-form text drift only with full speech coverage", () => {
  const transcriptMatch = { matches: false, expectedCharacters: 1114, actualCharacters: 1108 };
  const covered = { matches: true, ratio: 0.9901, segmentCount: 37, uncovered: [] };
  const uncovered = { matches: false, ratio: 0.5, segmentCount: 37, uncovered: [{ id: 12 }] };
  const shortTypo = { matches: false, expectedCharacters: 20, actualCharacters: 20 };

  assert.equal(acceptsTimelineAlignedSubtitleDraft(transcriptMatch, covered), true);
  assert.equal(acceptsTimelineAlignedSubtitleDraft(transcriptMatch, uncovered), false);
  assert.equal(acceptsTimelineAlignedSubtitleDraft(shortTypo, covered), false);
});

test("subtitle speech coverage catches captions concentrated in one short region", () => {
  const timeline = { segments: [
    { id: 1, start: 0, end: 4, text: "第一段語音" },
    { id: 2, start: 60, end: 66, text: "第二段語音" },
    { id: 3, start: 120, end: 126, text: "第三段語音" }
  ] };
  const partial = subtitleSpeechCoverage([{ start: 60, end: 66, text: "第二段語音" }], timeline);
  assert.equal(partial.matches, false);
  assert.deepEqual(partial.uncovered.map((item) => item.id), [1, 3]);
  const complete = subtitleSpeechCoverage([
    { start: 0, end: 4, text: "第一段語音" },
    { start: 60, end: 66, text: "第二段語音" },
    { start: 120, end: 126, text: "第三段語音" }
  ], timeline);
  assert.equal(complete.matches, true);
});

test("captionsFromTimeline keeps complete confirmed timeline text without ellipsis", () => {
  const captions = captionsFromTimeline({
    segments: [
      { id: 1, start: 0.2, end: 3.4, text: "這是一句完整字幕，不可以被省略。" },
      { id: 2, start: 3.6, end: 5.1, text: "下一句也要完整。" }
    ]
  });
  assert.equal(captions.length, 2);
  assert.equal(captions[0].text, "這是一句完整字幕，不可以被省略。");
  assert.doesNotMatch(srtFromCaptions(captions), /\.{3}|…|⋯/);
  assert.equal(subtitleSpeechCoverage(captions, { segments: captions }).matches, true);
});

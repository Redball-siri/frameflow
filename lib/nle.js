function xmlEscape(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function normalizeRanges(ranges, durationSeconds) {
  const duration = Math.max(0, Number(durationSeconds) || 0);
  const source = Array.isArray(ranges) && ranges.length
    ? ranges
    : duration > 0 ? [{ start: 0, end: duration }] : [];
  return source
    .map((range) => ({
      start: Math.max(0, Number(range?.start) || 0),
      end: Math.min(duration || Number(range?.end) || 0, Number(range?.end) || 0)
    }))
    .filter((range) => range.end > range.start)
    .sort((left, right) => left.start - right.start);
}

function frameTiming(frameRate) {
  const rate = Math.max(1, Number(frameRate) || 30);
  if (Math.abs(rate - 59.94) < 0.08) return { frameDuration: "1001/60000s", fps: 60, step: 1001, scale: 60000 };
  if (Math.abs(rate - 29.97) < 0.05) return { frameDuration: "1001/30000s", fps: 30, step: 1001, scale: 30000 };
  if (Math.abs(rate - 23.976) < 0.05) return { frameDuration: "1001/24000s", fps: 24, step: 1001, scale: 24000 };
  const fps = Math.max(1, Math.round(rate));
  return { frameDuration: `1/${fps}s`, fps, step: 1, scale: fps };
}

function fcpxTime(seconds, timing) {
  const frames = Math.max(0, Math.round((Number(seconds) || 0) * timing.scale / timing.step));
  return `${frames * timing.step}/${timing.scale}s`;
}

function rationalTime(seconds, frameRate) {
  const rate = Math.max(1, Number(frameRate) || 30);
  return {
    OTIO_SCHEMA: "RationalTime.1",
    value: Number(((Number(seconds) || 0) * rate).toFixed(6)),
    rate
  };
}

function timeRange(start, duration, frameRate) {
  return {
    OTIO_SCHEMA: "TimeRange.1",
    start_time: rationalTime(start, frameRate),
    duration: rationalTime(duration, frameRate)
  };
}

function otioClip({ name, sourceUrl, sourceStart, duration, sourceDuration, frameRate }) {
  return {
    OTIO_SCHEMA: "Clip.2",
    name,
    effects: [],
    markers: [],
    metadata: {},
    media_reference: {
      OTIO_SCHEMA: "ExternalReference.1",
      name,
      available_range: timeRange(0, sourceDuration, frameRate),
      target_url: sourceUrl,
      metadata: {}
    },
    source_range: timeRange(sourceStart, duration, frameRate)
  };
}

function buildOtio({ title, sourceUrl, ranges, durationSeconds, frameRate }) {
  const makeChildren = (trackName) => ranges.map((range, index) => otioClip({
    name: `${trackName} ${String(index + 1).padStart(2, "0")}`,
    sourceUrl,
    sourceStart: range.start,
    duration: range.end - range.start,
    sourceDuration: durationSeconds,
    frameRate
  }));
  return `${JSON.stringify({
    OTIO_SCHEMA: "Timeline.1",
    name: title,
    global_start_time: rationalTime(0, frameRate),
    metadata: { generatedBy: "AI Video Editor", portableMediaPath: sourceUrl },
    tracks: {
      OTIO_SCHEMA: "Stack.1",
      name: "tracks",
      effects: [],
      markers: [],
      metadata: {},
      children: [
        { OTIO_SCHEMA: "Track.1", name: "V1", kind: "Video", effects: [], markers: [], metadata: {}, children: makeChildren("畫面") },
        { OTIO_SCHEMA: "Track.1", name: "A1", kind: "Audio", effects: [], markers: [], metadata: {}, children: makeChildren("聲音") }
      ]
    }
  }, null, 2)}\n`;
}

function buildFcpxml({ title, sourceUrl, ranges, durationSeconds, frameRate, width, height }) {
  const timing = frameTiming(frameRate);
  const sequenceDuration = ranges.reduce((total, range) => total + range.end - range.start, 0);
  let offset = 0;
  const clips = ranges.map((range, index) => {
    const clipDuration = range.end - range.start;
    const clip = `                <asset-clip name="${xmlEscape(`${title} ${String(index + 1).padStart(2, "0")}`)}" ref="r2" offset="${fcpxTime(offset, timing)}" start="${fcpxTime(range.start, timing)}" duration="${fcpxTime(clipDuration, timing)}" audioRole="dialogue"/>`;
    offset += clipDuration;
    return clip;
  }).join("\n");
  return [
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
    "<!DOCTYPE fcpxml>",
    "<fcpxml version=\"1.10\">",
    "  <resources>",
    `    <format id="r1" name="FFVideoFormat${Math.round(height)}p" frameDuration="${timing.frameDuration}" width="${Math.round(width)}" height="${Math.round(height)}" colorSpace="1-1-1 (Rec. 709)"/>`,
    `    <asset id="r2" name="${xmlEscape(title)}" start="0s" duration="${fcpxTime(durationSeconds, timing)}" hasVideo="1" hasAudio="1" audioSources="1" audioChannels="2" format="r1">`,
    `      <media-rep kind="original-media" src="${xmlEscape(sourceUrl)}"/>`,
    "    </asset>",
    "  </resources>",
    `  <library><event name="${xmlEscape(title)}"><project name="${xmlEscape(`${title}-剪輯時間線`)}">`,
    `    <sequence duration="${fcpxTime(sequenceDuration, timing)}" format="r1" tcStart="0s" tcFormat="NDF" audioLayout="stereo" audioRate="48k">`,
    "      <spine>",
    clips,
    "      </spine>",
    "    </sequence>",
    "  </project></event></library>",
    "</fcpxml>",
    ""
  ].join("\n");
}

function edlTimecode(seconds, fps) {
  const totalFrames = Math.max(0, Math.round((Number(seconds) || 0) * fps));
  const frames = totalFrames % fps;
  const totalSeconds = Math.floor(totalFrames / fps);
  const wholeSeconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);
  return [hours, minutes, wholeSeconds, frames].map((value) => String(value).padStart(2, "0")).join(":");
}

function buildEdl({ title, ranges, frameRate }) {
  const fps = Math.min(30, Math.max(24, Math.round(Number(frameRate) || 30)));
  let recordCursor = 0;
  const lines = [`TITLE: ${title}`, "FCM: NON-DROP FRAME", ""];
  ranges.forEach((range, index) => {
    const duration = range.end - range.start;
    lines.push([
      String(index + 1).padStart(3, "0"),
      "AX       V     C",
      edlTimecode(range.start, fps),
      edlTimecode(range.end, fps),
      edlTimecode(recordCursor, fps),
      edlTimecode(recordCursor + duration, fps)
    ].join("  "));
    lines.push(`* FROM CLIP NAME: ${title}`);
    lines.push("");
    recordCursor += duration;
  });
  return `${lines.join("\n")}\n`;
}

export function buildPortableNleProject({
  title = "影片內容",
  sourceRelativePath,
  durationSeconds = 0,
  keepRanges = [],
  frameRate = 30,
  width = 1920,
  height = 1080
} = {}) {
  if (!sourceRelativePath) throw new Error("剪輯專案缺少可用的來源影片。");
  const ranges = normalizeRanges(keepRanges, durationSeconds);
  if (!ranges.length) throw new Error("剪輯專案沒有可用的保留片段。");
  const sourceUrl = `../${String(sourceRelativePath).split("/").map(encodeURIComponent).join("/")}`;
  return {
    "project/剪輯時間線.otio": buildOtio({ title, sourceUrl, ranges, durationSeconds, frameRate }),
    "project/剪輯時間線.fcpxml": buildFcpxml({ title, sourceUrl, ranges, durationSeconds, frameRate, width, height }),
    "project/剪輯時間線.edl": buildEdl({ title, ranges, frameRate })
  };
}

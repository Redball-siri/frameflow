import { mkdir, readFile, writeFile, link, copyFile, rm } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.cwd());
// Use the retained reference project so the tour can be rebuilt even after a
// user's temporary working project has been cleaned up.
const sourceId = "8cc01d66-4a95-4407-a646-0f151f7628ab";
const ids = {
  roughcut: "11111111-1111-4111-8111-111111111111",
  subtitle: "22222222-2222-4222-8222-222222222222",
  result: "33333333-3333-4333-8333-333333333333"
};
const jobs = path.join(root, "outputs", "jobs");
const sourceDir = path.join(jobs, sourceId);
const base = JSON.parse(await readFile(path.join(sourceDir, "project.json"), "utf8"));
const duration = Number(base.durationSeconds) || 300;
const selectedVersion = base.transcriptReview?.versions?.find((item) => item.id === base.transcriptReview?.selectedVersionId)
  || base.transcriptReview?.versions?.at(-1);
const sourceUrl = (id) => `/outputs/jobs/${id}/source.mp4`;
const assetUrl = (id, name) => `/outputs/jobs/${id}/demo/${name}`;

async function hardLinkOrCopy(from, to) {
  try { await link(from, to); } catch { await copyFile(from, to); }
}

function cleanBase(id) {
  return {
    ...base,
    id,
    savedAt: new Date().toISOString(),
    filename: "Frameflow_顧客展示專案.mp4",
    sourceFilename: "品牌訪談示範影片.mp4",
    sourceMediaUrl: sourceUrl(id),
    transcriptReview: {
      ...base.transcriptReview,
      status: "completed",
      selectedVersionId: selectedVersion?.id || "",
      usedVersionId: selectedVersion?.id || ""
    },
    transcriptBasis: {
      versionId: selectedVersion?.id || "",
      kind: selectedVersion?.kind || "user-edited-full",
      label: selectedVersion?.label || "已確認原稿",
      mappingConfidence: "customer-tour-demo"
    }
  };
}

function svgSlide(title, subtitle, accent = "#7c3aed") {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#10121a"/><stop offset="1" stop-color="#061d22"/></linearGradient></defs>
  <rect width="1600" height="900" rx="36" fill="url(#g)"/><circle cx="1370" cy="110" r="260" fill="${accent}" opacity=".2"/>
  <text x="110" y="160" fill="#00e5ff" font-family="sans-serif" font-size="34" font-weight="700">FRAMEFLOW · AI VIDEO STORY</text>
  <text x="110" y="410" fill="#fff" font-family="sans-serif" font-size="82" font-weight="800">${title}</text>
  <text x="110" y="500" fill="#aeb5c4" font-family="sans-serif" font-size="38">${subtitle}</text>
  <rect x="110" y="680" width="420" height="10" rx="5" fill="${accent}"/><text x="110" y="760" fill="#fff" font-family="sans-serif" font-size="30">內容整理 · 自動簡報 · 可編輯輸出</text>
  </svg>`;
}

function demoCaptions() {
  const mappings = Array.isArray(selectedVersion?.mappings) ? selectedVersion.mappings : [];
  const captions = mappings.slice(0, 12).map((item, index) => ({
    id: index + 1,
    enabled: true,
    start: Number(item.start) || index * 3.2,
    end: Math.max(Number(item.end) || index * 3.2 + 2.8, (Number(item.start) || index * 3.2) + 1),
    text: String(item.text || "").trim() || `示範字幕第 ${index + 1} 句`
  }));
  return captions.length ? captions : [
    { id: 1, enabled: true, start: 0, end: 3.2, text: "Frameflow 會先整理影片中的完整內容。" },
    { id: 2, enabled: true, start: 3.2, end: 6.4, text: "字幕、粗剪與輸出都能在製作前確認。" }
  ];
}

const removals = [
  { id: 1, enabled: true, start: 18.2, end: 23.6, source: "repeated_take", reason: "刪除重講", text: "保留語意較完整、語氣較順的一次。" },
  { id: 2, enabled: true, start: 51.4, end: 57.9, source: "long_pause", reason: "縮短停頓", text: "移除過長停頓，讓節奏更俐落。" },
  { id: 3, enabled: true, start: 96.1, end: 103.8, source: "false_start", reason: "刪除未完成語句", text: "刪除重新起頭前的不完整句子。" },
  { id: 4, enabled: true, start: 176.3, end: 184.7, source: "duplicate_idea", reason: "刪除重複內容", text: "相同觀點只保留表達最完整的一段。" }
].filter((item) => item.start < duration);
const keepRanges = [];
let cursor = 0;
for (const item of removals) {
  if (item.start > cursor) keepRanges.push({ start: cursor, end: item.start });
  cursor = Math.max(cursor, item.end);
}
if (cursor < duration) keepRanges.push({ start: cursor, end: duration });

for (const [kind, id] of Object.entries(ids)) {
  const dir = path.join(jobs, id);
  await rm(dir, { recursive: true, force: true });
  await mkdir(path.join(dir, "demo"), { recursive: true });
  await hardLinkOrCopy(path.join(sourceDir, "source.mp4"), path.join(dir, "source.mp4"));
  for (const [index, [title, subtitle, accent]] of [
    ["公司寒冬下的團隊與成本現實", "從訪談內容整理成清楚的觀看脈絡", "#7c3aed"],
    ["市場變化與組織挑戰", "掌握談話中的問題、原因與影響", "#00e5ff"],
    ["把內容轉成可執行重點", "字幕、粗剪、簡報與 B-roll 一次整合", "#00ffa3"]
  ].entries()) {
    await writeFile(path.join(dir, "demo", `slide-${index + 1}.svg`), svgSlide(title, subtitle, accent), "utf8");
  }
  await writeFile(path.join(dir, "demo", "captions.srt"), demoCaptions().map((c, i) => `${i + 1}\n00:00:${String(Math.floor(c.start)).padStart(2, "0")},000 --> 00:00:${String(Math.floor(c.end)).padStart(2, "0")},000\n${c.text}\n`).join("\n"), "utf8");
  await writeFile(path.join(dir, "demo", "presentation.pptx"), "Frameflow customer tour placeholder\n", "utf8");
  await writeFile(path.join(dir, "demo", "presentation.pdf"), "Frameflow customer tour placeholder\n", "utf8");
  await writeFile(path.join(dir, "demo", "broll-plan.csv"), "timecode,concept\n00:24,團隊討論\n01:18,年度企劃\n02:36,成本與決策\n", "utf8");
  await writeFile(path.join(dir, "demo", "broll-plan.json"), JSON.stringify({ demo: true }, null, 2), "utf8");

  let project = cleanBase(id);
  if (kind === "roughcut") {
    project = {
      ...project,
      workflow: { phase: "roughcut-review", awaitingRoughCutApproval: true, nextStep: "confirm-roughcut" },
      selectedFeatures: { labels: ["逐字稿", "字幕", "AI 粗剪", "PPT/PDF", "AI B-roll"], roughCut: true, burnSubtitles: true, outputPpt: true, aiBroll: true },
      roughCutReview: {
        status: "needs-review", sourceVideoUrl: sourceUrl(id), previewVideoUrl: sourceUrl(id), previewVideoMode: "source-skip-removals",
        durationSeconds: duration, removals, keepRanges, waveformPeaks: Array.from({ length: 180 }, (_, i) => Number((0.18 + Math.abs(Math.sin(i * 0.41)) * 0.75).toFixed(3))),
        thumbnailUrls: [assetUrl(id, "slide-1.svg"), assetUrl(id, "slide-2.svg"), assetUrl(id, "slide-3.svg")],
        transcriptVersionId: selectedVersion?.id || "", transcriptVersionKind: selectedVersion?.kind || "user-edited-full", transcriptVersionLabel: selectedVersion?.label || "已確認原稿"
      },
      subtitleReview: null
    };
  } else if (kind === "subtitle") {
    project = {
      ...project,
      workflow: { phase: "subtitle-review", awaitingSubtitleApproval: true, nextStep: "confirm-subtitles" },
      selectedFeatures: { labels: ["逐字稿", "字幕", "AI 粗剪", "PPT/PDF", "AI B-roll"], roughCut: true, burnSubtitles: true, outputPpt: true, aiBroll: true },
      roughCutReview: { status: "confirmed", durationSeconds: duration, transcriptVersionId: selectedVersion?.id || "", transcriptVersionKind: selectedVersion?.kind || "user-edited-full", transcriptVersionLabel: selectedVersion?.label || "已確認原稿", removals, keepRanges, thumbnailUrls: [assetUrl(id, "slide-1.svg"), assetUrl(id, "slide-2.svg"), assetUrl(id, "slide-3.svg")], waveformPeaks: Array.from({ length: 180 }, (_, i) => Number((0.18 + Math.abs(Math.sin(i * 0.41)) * 0.75).toFixed(3))) },
      subtitleReview: { status: "needs-review", baseVideoUrl: sourceUrl(id), sourceVideoUrl: sourceUrl(id), durationSeconds: duration, captions: demoCaptions(), draftSrtUrl: assetUrl(id, "captions.srt"), subtitleStyle: { fontScale: 1, audioGain: 1 }, transcriptVersionId: selectedVersion?.id || "", transcriptVersionKind: selectedVersion?.kind || "user-edited-full", transcriptVersionLabel: selectedVersion?.label || "已確認原稿" }
    };
  } else {
    const broll = [
      { title: "團隊討論", visualConcept: "團隊在會議桌前討論年度方向", timecode: "0:24", startSeconds: 24, endSeconds: 29, duration: "5 秒", slideCueStartSeconds: 18, slideCueDuration: 5, cueReason: "談到團隊共識", videoUrl: sourceUrl(id), frameUrl: assetUrl(id, "slide-1.svg") },
      { title: "年度企劃", visualConcept: "企劃資料與行事曆的工作畫面", timecode: "1:18", startSeconds: 78, endSeconds: 83, duration: "5 秒", slideCueStartSeconds: 69, slideCueDuration: 5, cueReason: "進入年度規劃", videoUrl: sourceUrl(id), frameUrl: assetUrl(id, "slide-2.svg") },
      { title: "成本決策", visualConcept: "主管檢視成本數據並做出決策", timecode: "2:36", startSeconds: 156, endSeconds: 161, duration: "5 秒", slideCueStartSeconds: 145, slideCueDuration: 5, cueReason: "說明公司現實", videoUrl: sourceUrl(id), frameUrl: assetUrl(id, "slide-3.svg") }
    ];
    project = {
      ...project,
      workflow: { phase: "completed", nextStep: "download-results" },
      selectedFeatures: { labels: ["逐字稿", "字幕", "AI 粗剪", "PPT/PDF", "AI B-roll", "將 PPT 剪輯入成片"], transcript: true, burnSubtitles: true, roughCut: true, outputPpt: true, outputBrollPlan: true, aiBroll: true, insertPpt: true },
      roughCutReview: { status: "confirmed", durationSeconds: duration, transcriptVersionId: selectedVersion?.id || "", transcriptVersionKind: selectedVersion?.kind || "user-edited-full", transcriptVersionLabel: selectedVersion?.label || "已確認原稿", removals, keepRanges },
      subtitleReview: { status: "confirmed", durationSeconds: duration, captions: demoCaptions() },
      finalVideoUrl: sourceUrl(id), finalVideoSource: "subtitle-confirmed-high-cost-integrated", subtitledVideoUrl: sourceUrl(id), roughCutVideoUrl: sourceUrl(id),
      subtitleSrtUrl: assetUrl(id, "captions.srt"), subtitleAssUrl: assetUrl(id, "captions.srt"),
      pptxUrl: assetUrl(id, "presentation.pptx"), pptPdfUrl: assetUrl(id, "presentation.pdf"), pptPreviewUrls: [assetUrl(id, "slide-1.svg"), assetUrl(id, "slide-2.svg"), assetUrl(id, "slide-3.svg")], slideCount: 8,
      broll, aiBrollGenerated: 3, brollCsvUrl: assetUrl(id, "broll-plan.csv"), brollJsonUrl: assetUrl(id, "broll-plan.json"),
      generationNotices: []
    };
  }
  await writeFile(path.join(dir, "project.json"), `${JSON.stringify(project, null, 2)}\n`, "utf8");
}

console.log(JSON.stringify(ids, null, 2));

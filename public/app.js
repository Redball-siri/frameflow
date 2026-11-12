const form = document.querySelector("#project-form");
const ambientParticleLayer = document.querySelector("#ambient-particles");
const topbar = document.querySelector(".topbar");
const studioSection = document.querySelector(".studio");
const fileInput = document.querySelector("#video-input");
const dropZone = document.querySelector("#drop-zone");
const fileLabel = document.querySelector("#file-label");
const fileHint = document.querySelector("#file-hint");
const submitButton = document.querySelector("#submit-button");
const notice = document.querySelector("#notice");
const processing = document.querySelector("#processing");
const processingNumber = document.querySelector("#processing-number");
const processingTitle = document.querySelector("#processing-title");
const processingDetail = document.querySelector("#processing-detail");
const progressBar = document.querySelector("#progress-bar");
const closeProcessing = document.querySelector("#close-processing");
const fixProcessing = document.querySelector("#fix-processing");
const processingFailureActions = document.querySelector("#processing-failure-actions");
const results = document.querySelector("#results");
const resultRuntime = document.querySelector("#result-runtime");
const generationNotices = document.querySelector("#generation-notices");
const transcriptStage = document.querySelector("#transcript-stage");
const transcriptStageStatus = document.querySelector("#transcript-stage-status");
const transcriptStageText = document.querySelector("#transcript-stage-text");
const transcriptEditorWrap = document.querySelector("#transcript-editor-wrap");
const transcriptProofreadMarkup = document.querySelector("#transcript-proofread-markup");
const aiChangeLegend = document.querySelector("#ai-change-legend");
const transcriptVersionAccordion = document.querySelector("#transcript-version-accordion");
const transcriptVersionToggles = [...document.querySelectorAll("[data-transcript-toggle]")];
const transcriptHighlightView = document.querySelector("#transcript-panel-highlight");
const transcriptHighlightText = document.querySelector("#transcript-highlight-text");
const transcriptHighlightInsertStatus = document.querySelector("#transcript-highlight-insert-status");
const transcriptVersionSelect = document.querySelector("#transcript-version-select");
const transcriptAiActions = document.querySelector("#transcript-ai-actions");
const transcriptCompare = document.querySelector("#transcript-panel-proofread");
const transcriptCompareOriginal = document.querySelector("#transcript-compare-original");
const transcriptProofreadSourcePicker = document.querySelector("#transcript-proofread-source-picker");
const transcriptHighlightSourcePicker = document.querySelector("#transcript-highlight-source-picker");
const transcriptCompareProofread = document.querySelector("#transcript-compare-proofread");
const transcriptProofreadViewToggle = document.querySelector("#transcript-proofread-view-toggle");
const transcriptHighlightViewToggle = document.querySelector("#transcript-highlight-view-toggle");
const transcriptCurrentLabel = document.querySelector("#transcript-current-label");
const transcriptWordCount = document.querySelector("#transcript-word-count");
const transcriptProofreadWordCount = document.querySelector("#transcript-proofread-word-count");
const transcriptHighlightWordCount = document.querySelector("#transcript-highlight-word-count");
const transcriptStageSave = document.querySelector("#transcript-stage-save");
const transcriptStageProofread = document.querySelector("#transcript-stage-proofread");
const transcriptStageHighlight = document.querySelector("#transcript-stage-highlight");
const transcriptStageGenerateFull = document.querySelector("#transcript-stage-generate-full");
const transcriptStageBackToEdit = document.querySelector("#transcript-stage-back-to-edit");
const transcriptStageActionNote = document.querySelector("#transcript-stage-action-note");
const featureSelectionPage = document.querySelector("#feature-selection-page");
const featureSelectionBack = document.querySelector("#feature-selection-back");
const featureSelectionStart = document.querySelector("#feature-selection-start");
const finalOutput = document.querySelector("#final-output");
const finalVideo = document.querySelector("#final-video");
const pptSlides = document.querySelector("#ppt-slides");
const pptLightbox = document.querySelector("#ppt-lightbox");
const pptLightboxImage = document.querySelector("#ppt-lightbox-image");
const pptLightboxTitle = document.querySelector("#ppt-lightbox-title");
const pptLightboxClose = document.querySelector("#ppt-lightbox-close");
const pptLightboxPrev = document.querySelector("#ppt-lightbox-prev");
const pptLightboxNext = document.querySelector("#ppt-lightbox-next");
const actionToast = document.querySelector("#action-toast");
const processingElapsed = document.querySelector("#processing-elapsed");
const aiWorkflow = document.querySelector("#ai-workflow");
const brollShowcase = document.querySelector("#broll-showcase");
const brollShowcaseGrid = document.querySelector("#broll-showcase-grid");
const finalCues = document.querySelector("#final-cues");
const brollShowcaseDetail = document.querySelector("#broll-showcase-detail");
const timelineSection = document.querySelector("#timeline-section");
const timelineDetail = document.querySelector("#timeline-detail");
const videoTimeline = document.querySelector("#video-timeline");
const quickSummary = document.querySelector(".quick-summary");
const featureToggles = [...document.querySelectorAll(".feature-toggle")];
const postFeatureToggles = [...document.querySelectorAll(".post-feature-toggle")];
const postTranscriptOptions = document.querySelector(".post-transcript-options");
const postFeatureSummary = document.querySelector("#post-feature-summary");
const transcriptProductionChoices = [...document.querySelectorAll("[data-transcript-choice]")];
const selectedProductionTranscriptNote = document.querySelector("#selected-production-transcript-note");
const brandLink = document.querySelector(".brand");
const pptPreviewSection = document.querySelector(".ppt-preview-section");
const downloadCenter = document.querySelector("#download-center");
const resultTranscriptReturn = document.querySelector("#result-transcript-return");
const resultBackToTranscriptButton = document.querySelector("#result-back-to-transcript");
const subtitleReviewModal = document.querySelector("#subtitle-review-modal");
const subtitleReviewVideo = document.querySelector("#subtitle-review-video");
const subtitlePreviewCaption = document.querySelector("#subtitle-preview-caption");
const subtitleReviewMeta = document.querySelector("#subtitle-review-meta");
const subtitleCaptionList = document.querySelector("#subtitle-caption-list");
const subtitleTimeline = document.querySelector("#subtitle-timeline");
const subtitleTranscriptBasis = document.querySelector("#subtitle-transcript-basis");
const subtitleZoom = document.querySelector("#subtitle-zoom");
const subtitleZoomIn = document.querySelector("#subtitle-zoom-in");
const subtitleZoomOut = document.querySelector("#subtitle-zoom-out");
const subtitleZoomLabel = document.querySelector("#subtitle-zoom-label");
const subtitleVolume = document.querySelector("#subtitle-volume");
const subtitleVolumeLabel = document.querySelector("#subtitle-volume-label");
const subtitleFontScale = document.querySelector("#subtitle-font-scale");
const subtitleSegmentInspector = document.querySelector("#subtitle-segment-inspector");
const subtitleInspectorClose = document.querySelector("#subtitle-inspector-close");
const subtitleUndoButton = document.querySelector("#subtitle-undo-button");
const subtitleRedoButton = document.querySelector("#subtitle-redo-button");
const subtitleInspectorStatus = document.querySelector("#subtitle-inspector-status");
const subtitleInspectorPreview = document.querySelector("#subtitle-inspector-preview");
const subtitleInspectorStart = document.querySelector("#subtitle-inspector-start");
const subtitleInspectorEnd = document.querySelector("#subtitle-inspector-end");
const subtitleInspectorDuration = document.querySelector("#subtitle-inspector-duration");
const subtitleInspectorText = document.querySelector("#subtitle-inspector-text");
const subtitleInspectorMerge = document.querySelector("#subtitle-inspector-merge");
const subtitleBurnButton = document.querySelector("#subtitle-burn-button");
const subtitleBackToTranscript = document.querySelector("#subtitle-back-to-transcript");
const subtitleDraftSrtLink = document.querySelector("#subtitle-draft-srt-link");
const roughCutReviewModal = document.querySelector("#roughcut-review-modal");
const roughCutReviewVideo = document.querySelector("#roughcut-review-video");
const roughCutPreviewPlay = document.querySelector("#roughcut-preview-play");
const roughCutPreviewScrub = document.querySelector("#roughcut-preview-scrub");
const roughCutPreviewTime = document.querySelector("#roughcut-preview-time");
const roughCutPreviewSourceTime = document.querySelector("#roughcut-preview-source-time");
const roughCutPreviewNote = document.querySelector("#roughcut-preview-note");
const roughCutReviewMeta = document.querySelector("#roughcut-review-meta");
const roughCutTranscriptPreviewBasis = document.querySelector("#roughcut-transcript-preview-basis");
const roughCutTranscriptLines = document.querySelector("#roughcut-transcript-lines");
const roughCutWaveform = document.querySelector("#roughcut-waveform");
const roughCutTranscriptBasis = document.querySelector("#roughcut-transcript-basis");
const roughCutZoom = document.querySelector("#roughcut-zoom");
const roughCutZoomLabel = document.querySelector("#roughcut-zoom-label");
const roughCutZoomIn = document.querySelector("#roughcut-zoom-in");
const roughCutZoomOut = document.querySelector("#roughcut-zoom-out");
const roughCutVolume = document.querySelector("#roughcut-volume");
const roughCutVolumeLabel = document.querySelector("#roughcut-volume-label");
const roughCutUndoButton = document.querySelector("#roughcut-undo-button");
const roughCutRedoButton = document.querySelector("#roughcut-redo-button");
const roughCutAddMute = document.querySelector("#roughcut-add-mute");
const roughCutRemovalList = document.querySelector("#roughcut-removal-list");
const roughCutBackToTranscript = document.querySelector("#roughcut-back-to-transcript");
const roughCutSegmentInspector = document.querySelector("#roughcut-segment-inspector");
const roughCutInspectorClose = document.querySelector("#roughcut-inspector-close");
const roughCutInspectorStatus = document.querySelector("#roughcut-inspector-status");
const roughCutInspectorPreview = document.querySelector("#roughcut-inspector-preview");
const roughCutInspectorStart = document.querySelector("#roughcut-inspector-start");
const roughCutInspectorEnd = document.querySelector("#roughcut-inspector-end");
const roughCutInspectorDuration = document.querySelector("#roughcut-inspector-duration");
const roughCutInspectorReason = document.querySelector("#roughcut-inspector-reason");
const roughCutInspectorText = document.querySelector("#roughcut-inspector-text");
const roughCutRenderButton = document.querySelector("#roughcut-render-button");
const stepButtons = [...document.querySelectorAll("[data-step-target]")];
const stepPanels = [...document.querySelectorAll("[data-step-panel]")];
const stepBackButton = document.querySelector("#step-back");
const stepNextButton = document.querySelector("#step-next");
const resultNewProjectButton = document.querySelector("#result-new-project");
const resultNewProjectBottomButton = document.querySelector("#result-new-project-bottom");
const revisionPanel = document.querySelector("#revision-panel");
const resultEditRoughCutButton = document.querySelector("#result-edit-roughcut");
const resultEditSubtitlesButton = document.querySelector("#result-edit-subtitles");
const workflowProgressItems = [...document.querySelectorAll(".workflow-progress [data-product-stage]")];

let stageTimer;
let elapsedTimer;
let toastTimer;
let localVisualReady = false;
let activeProject = null;
let currentWorkflowStep = 1;
let transcriptStagePage = "edit";
let activeTranscriptAccordionPanel = "";
let activeTranscriptViewKey = "original";
let proofreadTranscriptViewMode = "compare";
let highlightTranscriptViewMode = "compare";
let productionTranscriptVersionId = "";
const transcriptSourceInsertState = {
  "ai-proofread": { selectedText: "", selectedIndex: -1, lastInsertedText: "", beforeText: "", caretRange: null, insertedTexts: new Set() },
  "ai-highlight-summary": { selectedText: "", selectedIndex: -1, lastInsertedText: "", beforeText: "", caretRange: null, insertedTexts: new Set() }
};
let transcriptRevisitMode = false;
let selectedMediaDurationSeconds = null;
let selectedMediaSignature = "";
let selectedMediaProfile = null;
let activeProcessingEstimate = null;
let selectedPptSlideIndex = -1;
let subtitleTimelineZoom = 5;
const SUBTITLE_BASE_FONT_PT = 30;
let subtitleFontScaleValue = 1;
let subtitleFontSizePtValue = SUBTITLE_BASE_FONT_PT;
let subtitleVolumeGain = 1;
let selectedSubtitleRowId = "";
let subtitleUndoStack = [];
let subtitleRedoStack = [];
let subtitleTextInputUndoSnapshot = null;
let subtitlePlayheadFrame = null;
let subtitlePlayheadDragLocked = false;
let subtitlePreviewLastPlayingAt = 0;
let subtitlePreviewResumeSeekUntil = 0;
let subtitlePreviewExplicitSeekShouldResume = false;
let roughCutTimelineZoom = 5;
let roughCutVolumeGain = 1;
let roughCutPlayheadFrame = null;
let roughCutPlayheadDragLocked = false;
let roughCutPreviewLastPlayingAt = 0;
let roughCutPreviewResumeSeekUntil = 0;
let roughCutUndoStack = [];
let roughCutRedoStack = [];
let roughCutIsApplyingUndo = false;
let roughCutPreviewSkipGuard = false;
let roughCutPreviewSkipCleanup = null;
let roughCutNativeSeekCleanup = null;
let roughCutMergedRemovalCache = null;
let roughCutRenderedPreviewSignature = "";
let roughCutTimelineThumbnailUrls = [];
let roughCutTimelineWaveformPeaks = [];
const previewStableFrames = new WeakMap();
const previewFreezeTokens = new WeakMap();
const previewFallbackUrls = new WeakMap();
const previewInvalidRecoveries = new WeakMap();
const previewPlaybackMonitorStates = new WeakMap();
const previewPlaybackRecoveryStates = new WeakMap();
const previewRecoveryResumeIntents = new WeakMap();
let subtitleTimelineThumbnailUrls = [];
let subtitleTimelineWaveformPeaks = [];
let roughCutDensityTimer = null;
let activeProjectCleanupId = "";
let editingPackageDownloadedForProjectId = "";
let previewAudioContext = null;
const previewAudioGainGraphs = new WeakMap();
let processingFailureState = null;
const cleanedProjectIds = new Set();
const cleanedEditingPackageIds = new Set();
const ROUGH_CUT_TIMELINE_GUTTER = 52;
const ROUGH_CUT_THUMBNAIL_WIDTH = 144;
const ROUGH_CUT_WAVEFORM_BAR_STEP = 5;
const ROUGH_CUT_WAVEFORM_MAX_BARS = 24000;
const SUBTITLE_TIMELINE_GUTTER = 52;
const SUBTITLE_TIMELINE_PIXELS_PER_SECOND = 24;
const productStageOrder = ["upload", "transcript", "ai-draft", "features", "refine", "outputs"];
const MEDIA_PREVIEW_CACHE_BUST = Date.now().toString(36);

const transcriptStages = [
  ["01", "正在抽取影片聲音⋯", "先取出音訊，準備產生原始逐字稿。", 24, "抽取音訊", "準備逐字稿來源"],
  ["02", "正在轉成逐字稿⋯", "依語音內容建立原始文字與時間線。", 68, "語音辨識", "轉成逐字稿"],
  ["03", "正在檢查逐字稿品質⋯", "確認辨識文字是否足夠清楚；品質不足時會停止並提示修正。", 91, "品質檢查", "確認逐字稿可用"]
];

const postTranscriptStages = {
  roughCut: ["01", "正在判斷 AI 粗剪片段⋯", "依已確認稿件與共用時間線標出可疑片段，稍後可人工調整。", 42, "AI 粗剪", "判斷保留與刪除片段"],
  broll: ["02", "品質優先生成 B-roll⋯", "依目前稿件逐句比對語意與插入時間，再產生補充畫面。", 68, "AI B-roll", "生成並檢查補充畫面"],
  ppt: ["03", "正在製作簡報⋯", "依目前稿件整理章節、內容與簡報切入點。", 78, "簡報製作", "PPTX / PDF"],
  subtitles: ["04", "正在產生字幕草稿⋯", "依目前稿件與既有語音時間線建立一句一行字幕。", 86, "字幕生成", "一句一行草稿"],
  final: ["05", "正在輸出完整成片⋯", "把已選功能整合進同一支 MP4，並檢查輸出品質。", 91, "成片輸出", "MP4"]
};

const featureLabels = {
  "feature-transcript": "逐字稿",
  "feature-burn-subtitles": "字幕",
  "feature-roughcut": "AI 粗剪",
  "feature-ppt": "PPT/PDF",
  "feature-ai-broll": "AI B-roll",
  "feature-insert-ppt": "將 PPT 剪輯入成片"
};

const postFeatureLabels = {
  "post-feature-transcript": "逐字稿",
  "post-feature-burn-subtitles": "字幕",
  "post-feature-roughcut": "AI 粗剪",
  "post-feature-ppt": "PPT/PDF",
  "post-feature-ai-broll": "AI B-roll",
  "post-feature-insert-ppt": "將 PPT 剪輯入成片"
};

const downloadSelectors = {
  subtitledVideo: ["#subtitled-video-link", "#video-download-button"],
  subtitleSrt: "#subtitle-srt-link",
  subtitleAss: "#subtitle-ass-link",
  pptx: "#ppt-download-button",
  pptPdf: "#ppt-pdf-download-button",
  transcript: "#transcript-download-button",
  originalTranscript: "#transcript-stage-original-download",
  proofreadTranscript: "#transcript-stage-proofread-download",
  highlightTranscript: "#transcript-stage-highlight-download",
  brollCsv: "#broll-csv-link",
  brollJson: "#broll-json-link",
  roughCutVideo: "#roughcut-video-link",
  roughCutPlan: "#roughcut-plan-link",
  editingPackage: ["#editing-package-link", "#editing-package-download-button"],
  finalVideo: "#video-download-button"
};

const subtitleBurnStages = [
  ["S1", "正在整理精修字幕⋯", "確認每句字幕的開始與結束秒數，避免重疊或空白內容。", 18, "字幕整理", "確認秒數與文字"],
  ["S2", "正在交給 FFmpeg⋯", "把確認後的字幕寫入影片，並保留原始聲音。", 42, "字幕燒錄", "寫入影片畫面"],
  ["S3", "正在輸出字幕影片⋯", "這一步會依影片長度花一些時間，請保持頁面開啟。", 72, "影片輸出", "完成字幕版 MP4"],
  ["S4", "正在檢查下載檔⋯", "確認 MP4、SRT、ASS 都已輸出後才更新結果。", 91, "檔案檢查", "確認可下載"]
];

function postSubtitleGenerationStages(data = activeProject) {
  const selected = data?.selectedFeatures || {};
  const stages = [
    ["S1", "正在套用確認字幕⋯", "先把你確認的字幕文字與時間寫入粗剪影片。", 24, "字幕確認", "使用確認後字幕"]
  ];
  if (selected.aiBroll) {
    stages.push(["S2", "正在製作 B-roll⋯", "只依確認後仍存在的字幕內容生成補充畫面；單段不合格會略過。", 62, "AI B-roll", "生成並檢查補充畫面"]);
  }
  if (selected.outputPpt) {
    stages.push(["S3", "正在製作簡報⋯", "依確認後字幕整理章節、簡報內容與剪入時間。", 76, "簡報製作", "PPTX / PDF"]);
  }
  stages.push(selected.finalVideo
    ? ["S4", "正在輸出完整成片⋯", "整合確認字幕、PPT、B-roll 與粗剪畫面。", 91, "成片輸出", "MP4"]
    : ["S4", "正在檢查輸出檔案⋯", "確認字幕與所選附加素材可以下載。", 91, "檔案檢查", "確認可下載"]);
  return stages;
}

const roughCutRenderStages = [
  ["R1", "正在套用粗剪調整⋯", "讀取你保留與刪除的片段設定。", 18, "套用調整", "讀取刪除片段"],
  ["R2", "正在重算影片時間軸⋯", "依調整後的刪除片段建立保留區間。", 38, "時間軸重算", "建立保留區間"],
  ["R3", "正在輸出 AI 粗剪影片⋯", "FFmpeg 會精準銜接保留片段並處理音訊。", 76, "粗剪輸出", "輸出 MP4"],
  ["R4", "正在檢查粗剪檔案⋯", "確認 MP4、計畫 JSON 與文字報告都可下載。", 91, "檔案檢查", "確認可下載"]
];

function listLabels(labels = []) {
  const cleanLabels = labels.filter(Boolean);
  if (!cleanLabels.length) return "";
  if (cleanLabels.length === 1) return cleanLabels[0];
  return `${cleanLabels.slice(0, -1).join("、")} 與 ${cleanLabels.at(-1)}`;
}

function roughCutDeferredRenderStages(data = activeProject) {
  const selected = data?.selectedFeatures || {};
  if (selected.burnSubtitles) {
    return [
      ["R1", "正在套用粗剪調整⋯", "讀取你保留與刪除的片段設定。", 16, "套用調整", "讀取刪除片段"],
      ["R2", "正在輸出 AI 粗剪影片⋯", "產生確認後的保留版本，字幕會以這支影片為基準。", 58, "粗剪輸出", "建立保留版本"],
      ["R3", "正在重算字幕時間線⋯", "把逐字稿時間對齊到粗剪後影片。", 76, "時間線校正", "對齊保留片段"],
      ["R4", "正在建立字幕草稿⋯", "先讓你精修字幕；確認後才會製作 PPT、B-roll 與成片。", 91, "字幕草稿", "等待人工確認"]
    ];
  }
  const generationLabels = [
    selected.outputPpt ? "PPT" : "",
    selected.aiBroll ? "B-roll" : "",
    selected.burnSubtitles ? "字幕" : ""
  ].filter(Boolean);
  const generationLabel = listLabels(generationLabels);
  const stages = [
    ["R1", "正在套用粗剪調整⋯", "讀取你保留與刪除的片段設定。", 12, "套用調整", "讀取刪除片段"],
    ["R2", "正在輸出 AI 粗剪影片⋯", "先產生確認後的保留版本，後續成品會以它為基準。", 32, "粗剪輸出", "建立保留版本"],
    ["R3", "正在重算內容時間線⋯", "把逐字稿時間對齊到粗剪後影片。", 46, "時間線校正", "對齊保留片段"]
  ];
  if (generationLabel) {
    stages.push(["R4", `正在製作${generationLabel}⋯`, `只針對保留下來的內容製作${generationLabel}，避免剪掉的片段白做。`, 76, generationLabel, "依保留片段製作"]);
  }
  stages.push(selected.finalVideo
    ? ["R5", "正在輸出完整成片⋯", "把確認後的粗剪與已選功能整合成最後 MP4。", 91, "成片輸出", "MP4"]
    : ["R5", "正在檢查輸出檔案⋯", "確認已選檔案都可下載。", 91, "檔案檢查", "確認可下載"]);
  return stages;
}

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDurationLabel(seconds) {
  const safeSeconds = Math.max(0, Math.round(Number(seconds) || 0));
  if (safeSeconds < 60) return `${Math.max(1, safeSeconds)} 秒`;
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  if (minutes < 60) return remainder ? `${minutes} 分 ${String(remainder).padStart(2, "0")} 秒` : `${minutes} 分`;
  const hours = Math.floor(minutes / 60);
  const minuteRemainder = minutes % 60;
  return minuteRemainder ? `${hours} 小時 ${minuteRemainder} 分` : `${hours} 小時`;
}

function runtimeSecondsFromResult(data) {
  const serverTiming = data?.processingTiming || {};
  const phaseTotal = Array.isArray(serverTiming.phases)
    ? serverTiming.phases.reduce((total, phase) => total + (Number(phase?.elapsedSeconds) || 0), 0)
    : 0;
  const value = Number(
    serverTiming.activeElapsedSeconds
    ?? (phaseTotal > 0 ? phaseTotal : undefined)
    ?? serverTiming.elapsedSeconds
    ?? data?.clientProcessingTiming?.elapsedSeconds
  );
  return Number.isFinite(value) && value > 0 ? value : null;
}

function renderResultRuntime(data) {
  if (!resultRuntime) return;
  const seconds = runtimeSecondsFromResult(data);
  resultRuntime.classList.toggle("hidden", !seconds);
  resultRuntime.textContent = seconds ? `實際耗時 ${formatDurationLabel(seconds)}` : "";
}

function setProductStage(stage = "upload") {
  const currentIndex = Math.max(0, productStageOrder.indexOf(stage));
  document.body.dataset.productStage = productStageOrder[currentIndex] || "upload";
  for (const item of workflowProgressItems) {
    const itemIndex = productStageOrder.indexOf(item.dataset.productStage);
    const isComplete = itemIndex >= 0 && itemIndex < currentIndex;
    const isCurrent = itemIndex === currentIndex;
    item.classList.toggle("is-complete", isComplete);
    item.classList.toggle("is-current", isCurrent);
    if (isCurrent) item.setAttribute("aria-current", "step");
    else item.removeAttribute("aria-current");
  }
}

const enhancedSelectControls = new Map();

function selectedOptionFor(select) {
  return select.options[select.selectedIndex] || select.options[0] || null;
}

function closeCustomSelectMenus(exceptRoot = null) {
  for (const root of enhancedSelectControls.values()) {
    if (root === exceptRoot) continue;
    root.classList.remove("is-open");
    root.querySelector(".custom-select-button")?.setAttribute("aria-expanded", "false");
    const menu = root.querySelector(".custom-select-menu");
    if (menu) menu.hidden = true;
  }
}

function syncCustomSelect(select) {
  const root = enhancedSelectControls.get(select);
  if (!root) return;
  const option = selectedOptionFor(select);
  root.querySelector(".custom-select-value").textContent = option?.textContent?.trim() || "";
  root.querySelectorAll(".custom-select-option").forEach((button) => {
    const selected = button.dataset.value === select.value;
    button.setAttribute("aria-selected", selected ? "true" : "false");
    button.classList.toggle("is-focused", selected);
  });
}

function filterCustomSelectOptions(root, query) {
  const normalized = String(query || "").trim().toLowerCase();
  let visibleCount = 0;
  root.querySelectorAll(".custom-select-option").forEach((button) => {
    const matches = !normalized || button.dataset.searchText.includes(normalized);
    button.hidden = !matches;
    if (matches) visibleCount += 1;
  });
  const empty = root.querySelector(".custom-select-empty");
  if (empty) empty.hidden = visibleCount > 0;
}

function setCustomSelectOpen(select, open) {
  const root = enhancedSelectControls.get(select);
  if (!root) return;
  if (open) closeCustomSelectMenus(root);
  root.classList.toggle("is-open", open);
  root.querySelector(".custom-select-button")?.setAttribute("aria-expanded", open ? "true" : "false");
  const menu = root.querySelector(".custom-select-menu");
  if (menu) menu.hidden = !open;
  if (open) {
    const search = root.querySelector(".custom-select-search");
    if (search) {
      search.value = "";
      filterCustomSelectOptions(root, "");
      requestAnimationFrame(() => search.focus());
    }
  }
}

function chooseCustomSelectValue(select, value) {
  select.value = value;
  select.dispatchEvent(new Event("change", { bubbles: true }));
  syncCustomSelect(select);
  setCustomSelectOpen(select, false);
}

function enhanceSelectControl(select) {
  if (!select || enhancedSelectControls.has(select)) return;
  select.classList.add("enhanced-select-native");
  select.tabIndex = -1;

  const root = document.createElement("div");
  root.className = "custom-select";
  root.dataset.for = select.id;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "custom-select-button";
  button.setAttribute("aria-haspopup", "listbox");
  button.setAttribute("aria-expanded", "false");

  const value = document.createElement("span");
  value.className = "custom-select-value";
  button.append(value);

  const menu = document.createElement("div");
  menu.className = "custom-select-menu";
  menu.hidden = true;

  if (select.dataset.searchable === "true") {
    const search = document.createElement("input");
    search.className = "custom-select-search";
    search.type = "search";
    search.placeholder = select.dataset.searchPlaceholder || "搜尋";
    search.setAttribute("aria-label", search.placeholder);
    search.addEventListener("input", () => filterCustomSelectOptions(root, search.value));
    menu.append(search);
  }

  const list = document.createElement("div");
  list.className = "custom-select-options";
  list.setAttribute("role", "listbox");
  list.id = `${select.id}-custom-list`;
  button.setAttribute("aria-controls", list.id);

  Array.from(select.options).forEach((option) => {
    const optionButton = document.createElement("button");
    optionButton.type = "button";
    optionButton.className = "custom-select-option";
    optionButton.dataset.value = option.value;
    optionButton.dataset.searchText = `${option.textContent} ${option.value} ${option.dataset.keywords || ""}`.toLowerCase();
    optionButton.setAttribute("role", "option");
    optionButton.textContent = option.textContent;
    optionButton.addEventListener("click", () => chooseCustomSelectValue(select, option.value));
    list.append(optionButton);
  });

  const empty = document.createElement("div");
  empty.className = "custom-select-empty";
  empty.hidden = true;
  empty.textContent = "找不到符合的選項";
  menu.append(list, empty);
  root.append(button, menu);
  select.insertAdjacentElement("afterend", root);
  enhancedSelectControls.set(select, root);

  button.addEventListener("click", (event) => {
    event.preventDefault();
    setCustomSelectOpen(select, !root.classList.contains("is-open"));
  });
  select.addEventListener("change", () => syncCustomSelect(select));
  syncCustomSelect(select);
}

function enhanceSelectControls() {
  document.querySelectorAll("select[data-enhanced-select]").forEach(enhanceSelectControl);
}

function syncCustomSelectControls() {
  document.querySelectorAll("select[data-enhanced-select]").forEach(syncCustomSelect);
}

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

const AUDIO_GAIN_MAX = 10;
const WAVEFORM_BASELINE_HEIGHT_PERCENT = 32;
const AUDIO_GAIN_MIN_LINE_TOP_PERCENT = 88;
const AUDIO_GAIN_UNITY_LINE_TOP_PERCENT = 50;
const AUDIO_GAIN_MAX_LINE_TOP_PERCENT = 12;

function clampAudioGain(value) {
  return Number(clampNumber(value, 0, AUDIO_GAIN_MAX).toFixed(2));
}

function formatAudioGain(value) {
  return `${clampAudioGain(value).toFixed(2)}x`;
}

function formatAudioGainDb(value) {
  const gain = clampAudioGain(value);
  if (gain <= 0) return "靜音";
  const db = 20 * Math.log10(gain);
  return `${db >= 0 ? "+" : ""}${db.toFixed(1)} dB`;
}

function waveformBarHeightPercent(peak, gain) {
  const scaledPeak = Math.max(0, (Number(peak) || 0) * clampAudioGain(gain));
  return Math.round(2 + scaledPeak * WAVEFORM_BASELINE_HEIGHT_PERCENT);
}

function audioGainLineTopPercent(value) {
  const gain = clampAudioGain(value);
  if (gain <= 1) {
    return AUDIO_GAIN_MIN_LINE_TOP_PERCENT - (gain * (AUDIO_GAIN_MIN_LINE_TOP_PERCENT - AUDIO_GAIN_UNITY_LINE_TOP_PERCENT));
  }
  const ratio = Math.log10(gain) / Math.log10(AUDIO_GAIN_MAX);
  return AUDIO_GAIN_UNITY_LINE_TOP_PERCENT - (ratio * (AUDIO_GAIN_UNITY_LINE_TOP_PERCENT - AUDIO_GAIN_MAX_LINE_TOP_PERCENT));
}

function audioGainFromPointer(event, lane) {
  const bounds = lane.getBoundingClientRect();
  const topPercent = clampNumber(
    ((event.clientY - bounds.top) / Math.max(1, bounds.height)) * 100,
    AUDIO_GAIN_MAX_LINE_TOP_PERCENT,
    AUDIO_GAIN_MIN_LINE_TOP_PERCENT
  );
  if (topPercent >= AUDIO_GAIN_UNITY_LINE_TOP_PERCENT) {
    const ratio = (AUDIO_GAIN_MIN_LINE_TOP_PERCENT - topPercent) / (AUDIO_GAIN_MIN_LINE_TOP_PERCENT - AUDIO_GAIN_UNITY_LINE_TOP_PERCENT);
    return clampAudioGain(ratio);
  }
  const ratio = (AUDIO_GAIN_UNITY_LINE_TOP_PERCENT - topPercent) / (AUDIO_GAIN_UNITY_LINE_TOP_PERCENT - AUDIO_GAIN_MAX_LINE_TOP_PERCENT);
  return clampAudioGain(10 ** (ratio * Math.log10(AUDIO_GAIN_MAX)));
}

function ensurePreviewAudioGain(video) {
  if (!video) return null;
  if (previewAudioGainGraphs.has(video)) return previewAudioGainGraphs.get(video);
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextConstructor) return null;
  try {
    previewAudioContext ||= new AudioContextConstructor();
    const source = previewAudioContext.createMediaElementSource(video);
    const gainNode = previewAudioContext.createGain();
    source.connect(gainNode);
    gainNode.connect(previewAudioContext.destination);
    const graph = { context: previewAudioContext, gainNode };
    previewAudioGainGraphs.set(video, graph);
    return graph;
  } catch (error) {
    console.warn("無法建立影片音量增益預覽。", error);
    return null;
  }
}

function applyPreviewVideoGain(video, value) {
  if (!video) return;
  const gainValue = clampAudioGain(value);
  if (gainValue <= 1 && !previewAudioGainGraphs.has(video)) {
    video.volume = gainValue;
    return;
  }
  const graph = ensurePreviewAudioGain(video);
  if (graph) {
    video.volume = 1;
    graph.gainNode.gain.setValueAtTime(gainValue, graph.context.currentTime);
    if (graph.context.state === "suspended") graph.context.resume().catch(() => {});
    return;
  }
  video.volume = Math.min(1, gainValue);
}

function readEstimateAdjustment() {
  try {
    const ratios = JSON.parse(localStorage.getItem("frameflowEstimateRatios") || "[]")
      .map(Number)
      .filter((value) => Number.isFinite(value) && value > 0.25 && value < 4)
      .slice(-6)
      .sort((a, b) => a - b);
    if (!ratios.length) return 1;
    return clampNumber(ratios[Math.floor(ratios.length / 2)], 0.65, 1.85);
  } catch {
    return 1;
  }
}

function recordEstimateActual() {
  if (!activeProcessingEstimate?.startedAt || !activeProcessingEstimate?.totalSeconds) return;
  const elapsed = (Date.now() - activeProcessingEstimate.startedAt) / 1000;
  const ratio = clampNumber(elapsed / activeProcessingEstimate.totalSeconds, 0.35, 2.8);
  try {
    const ratios = JSON.parse(localStorage.getItem("frameflowEstimateRatios") || "[]");
    localStorage.setItem("frameflowEstimateRatios", JSON.stringify([...ratios, ratio].slice(-8)));
  } catch {
    // localStorage 無法使用時略過校正，不影響製作。
  }
}

function selectedFeatureLabels() {
  return featureToggles
    .filter((input) => input.checked)
    .map((input) => featureLabels[input.id])
    .filter(Boolean);
}

function selectedPostFeatureLabels() {
  return postFeatureToggles
    .filter((input) => input.checked)
    .map((input) => postFeatureLabels[input.id])
    .filter(Boolean);
}

function displayFeatureLabels(labels = []) {
  return (Array.isArray(labels) ? labels : [])
    .map((label) => String(label || "").replace("PPT 剪入原片", "PPT 剪入成片"))
    .filter(Boolean);
}

function isVerticalMediaProfile(profile = {}) {
  const width = Number(profile.width);
  const height = Number(profile.height);
  return Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > width;
}

function activeMediaIsVertical(data = activeProject) {
  return isVerticalMediaProfile(data?.sourceMediaProfile || selectedMediaProfile || {});
}

function verticalVideoPptInsertMessage() {
  return "偵測到直式影片，PPT/PDF 可下載，但不會剪進成片。";
}

function applyVerticalVideoFeatureRules({ announce = false } = {}) {
  const isVertical = activeMediaIsVertical();
  const controls = [
    document.querySelector("#feature-insert-ppt"),
    document.querySelector("#post-feature-insert-ppt")
  ].filter(Boolean);
  for (const control of controls) {
    if (isVertical) control.checked = false;
    control.disabled = isVertical;
    const option = control.closest(".feature-option");
    option?.classList.toggle("is-disabled", isVertical);
    const hint = option?.querySelector("small");
    if (hint) {
      if (!hint.dataset.defaultText) hint.dataset.defaultText = hint.textContent || "";
      hint.textContent = isVertical ? "直式影片不剪入簡報" : hint.dataset.defaultText;
    }
  }
  if (announce && isVertical) showToast(verticalVideoPptInsertMessage());
}

function selectedProcessingOptions() {
  const aiBrollCountValue = Number(document.querySelector("#ai-broll-count")?.value);
  const slideCountValue = Number(document.querySelector("#slide-count")?.value);
  return {
    transcript: document.querySelector("#feature-transcript")?.checked,
    burnSubtitles: document.querySelector("#feature-burn-subtitles")?.checked,
    roughCut: document.querySelector("#feature-roughcut")?.checked,
    outputPpt: document.querySelector("#feature-ppt")?.checked,
    outputBrollPlan: false,
    aiBroll: document.querySelector("#feature-ai-broll")?.checked,
    finalVideo: true,
    insertPpt: !activeMediaIsVertical() && document.querySelector("#feature-insert-ppt")?.checked,
    slideCount: Number.isFinite(slideCountValue) ? slideCountValue : 0,
    aiBrollCount: Number.isFinite(aiBrollCountValue) ? aiBrollCountValue : 0
  };
}

function selectedPostProcessingOptions() {
  const aiBrollCountValue = Number(document.querySelector("#post-ai-broll-count")?.value);
  const slideCountValue = Number(document.querySelector("#post-slide-count")?.value);
  const outputPpt = Boolean(document.querySelector("#post-feature-ppt")?.checked);
  const insertPpt = Boolean(document.querySelector("#post-feature-insert-ppt")?.checked);
  return {
    outputTranscript: document.querySelector("#post-feature-transcript")?.checked,
    burnSubtitles: document.querySelector("#post-feature-burn-subtitles")?.checked,
    roughCut: document.querySelector("#post-feature-roughcut")?.checked,
    outputPpt: outputPpt || insertPpt,
    outputBrollPlan: false,
    aiBroll: document.querySelector("#post-feature-ai-broll")?.checked,
    finalVideo: true,
    insertPpt: !activeMediaIsVertical() && insertPpt,
    slideCount: Number.isFinite(slideCountValue) ? slideCountValue : 0,
    brollStyle: "cinematic",
    aiBrollCount: Number.isFinite(aiBrollCountValue) ? aiBrollCountValue : 0
  };
}

function transcriptOnlyProcessingOptions() {
  return {
    transcript: true,
    burnSubtitles: false,
    roughCut: false,
    outputPpt: false,
    outputBrollPlan: false,
    aiBroll: false,
    finalVideo: false,
    insertPpt: false,
    slideCount: 0,
    aiBrollCount: 0
  };
}

function estimatedSlideCountForDuration(durationSeconds = 0, requestedSlideCount = 0) {
  const manual = Number(requestedSlideCount);
  if (Number.isFinite(manual) && manual > 0) return Math.max(6, Math.min(12, manual));
  const duration = Number(durationSeconds) || 0;
  if (duration <= 90) return 6;
  if (duration <= 240) return 7;
  if (duration <= 480) return 8;
  if (duration <= 900) return 9;
  if (duration <= 1500) return 10;
  return 11;
}

function isAwaitingRoughCutApproval(data = activeProject) {
  return Boolean(
    data?.workflow?.awaitingRoughCutApproval
      || (data?.selectedFeatures?.highCostDeferred && !data?.workflow?.awaitingSubtitleApproval)
  );
}

function isAwaitingSubtitleApproval(data = activeProject) {
  return Boolean(data?.workflow?.awaitingSubtitleApproval);
}

function deferredHighCostLabel(data = activeProject) {
  const labels = displayFeatureLabels(data?.selectedFeatures?.labels || [])
    .filter((label) => label !== "AI 粗剪");
  return labels.length ? labels.join("、") : "後續成品";
}

function postSubtitleHighCostLabel(data = activeProject) {
  const labels = displayFeatureLabels(data?.selectedFeatures?.labels || [])
    .filter((label) => !["AI 粗剪", "字幕", "逐字稿"].includes(label));
  return labels.length ? labels.join("、") : "完整成片";
}

function estimateMediaDurationSeconds(file) {
  if (Number.isFinite(selectedMediaDurationSeconds) && selectedMediaDurationSeconds > 0) return selectedMediaDurationSeconds;
  const megabytes = Math.max(1, (file?.size || 0) / 1024 / 1024);
  return clampNumber((megabytes / 7) * 60, 30, 7200);
}

function estimateProcessingSeconds(file, { transcriptOnly = false, postTranscript = false } = {}) {
  const options = transcriptOnly
    ? transcriptOnlyProcessingOptions()
    : postTranscript ? selectedPostProcessingOptions() : selectedProcessingOptions();
  const duration = estimateMediaDurationSeconds(file);
  const megabytes = Math.max(1, (file?.size || 0) / 1024 / 1024);
  let seconds = postTranscript ? 12 : 18 + Math.min(180, megabytes * 0.08);

  if (transcriptOnly || !postTranscript) {
    seconds += Math.max(35, duration * 0.65);
    seconds += 12 + duration * 0.035;
  }

  const needsBrollPlan = options.outputBrollPlan || options.aiBroll || options.outputPpt || options.insertPpt;
  if (options.burnSubtitles) seconds += 18 + duration * 0.05;
  if (options.roughCut) seconds += 55 + duration * 0.55;
  const estimatedSlideCount = estimatedSlideCountForDuration(duration, options.slideCount);
  if (options.outputPpt) seconds += 45 + estimatedSlideCount * 7 + duration * 0.03;
  if (needsBrollPlan) seconds += 20 + duration * 0.03;
  const estimatedBrollCount = options.aiBrollCount || Math.min(8, Math.max(3, Math.ceil(duration / 95)));
  if (options.aiBroll) seconds += 95 + estimatedBrollCount * 75 + duration * 0.04;
  if (options.finalVideo) {
    seconds += 30 + duration * 0.22;
    if (options.insertPpt) seconds += estimatedSlideCount * 3.5;
    if (options.aiBroll) seconds += estimatedBrollCount * 8;
  }

  const adjusted = seconds * readEstimateAdjustment();
  return {
    totalSeconds: Math.max(45, Math.round(adjusted / 10) * 10),
    sourceDurationSeconds: duration,
    fileMegabytes: megabytes
  };
}

function estimateSubtitleBurnSeconds(captionCount = 0) {
  const duration = Math.max(30, selectedMediaDurationSeconds || activeProject?.durationSeconds || 90);
  let seconds = 18 + duration * 0.32 + Math.max(0, Number(captionCount) || 0) * 0.35;
  if (isAwaitingSubtitleApproval()) {
    const options = activeProject?.processingOptions || {};
    const estimatedBrollCount = Number(options.aiBrollCount) || Math.min(8, Math.max(3, Math.ceil(duration / 95)));
    const estimatedSlideCount = estimatedSlideCountForDuration(duration, options.slideCount);
    if (activeProject?.selectedFeatures?.aiBroll) seconds += 95 + estimatedBrollCount * 75 + duration * 0.04;
    if (activeProject?.selectedFeatures?.outputPpt) seconds += 45 + estimatedSlideCount * 7 + duration * 0.03;
    if (activeProject?.selectedFeatures?.finalVideo) seconds += 80 + duration * 0.45;
    if (activeProject?.selectedFeatures?.insertPpt) seconds += estimatedSlideCount * 3.5;
  }
  return {
    totalSeconds: Math.max(40, Math.round((seconds * readEstimateAdjustment()) / 10) * 10),
    sourceDurationSeconds: duration
  };
}

function estimateRoughCutRenderSeconds(removalCount = 0) {
  const duration = Math.max(30, activeProject?.roughCutReview?.durationSeconds || activeProject?.durationSeconds || selectedMediaDurationSeconds || 90);
  let seconds = 22 + duration * 0.44 + Math.max(0, Number(removalCount) || 0) * 1.6;
  if (isAwaitingRoughCutApproval()) {
    const options = activeProject?.processingOptions || {};
    const estimatedBrollCount = Number(options.aiBrollCount) || Math.min(8, Math.max(3, Math.ceil(duration / 95)));
    const estimatedSlideCount = estimatedSlideCountForDuration(duration, options.slideCount);
    if (activeProject?.selectedFeatures?.burnSubtitles) {
      seconds += 18 + duration * 0.08;
    } else {
      if (activeProject?.selectedFeatures?.outputPpt) seconds += 45 + estimatedSlideCount * 7 + duration * 0.03;
      if (activeProject?.selectedFeatures?.aiBroll) seconds += 95 + estimatedBrollCount * 75 + duration * 0.04;
      if (activeProject?.selectedFeatures?.finalVideo) seconds += 80 + duration * 0.45;
      if (activeProject?.selectedFeatures?.insertPpt) seconds += estimatedSlideCount * 3.5;
    }
  }
  return {
    totalSeconds: Math.max(45, Math.round((seconds * readEstimateAdjustment()) / 10) * 10),
    sourceDurationSeconds: duration
  };
}

function remainingFromEstimate(progress = 0) {
  if (!activeProcessingEstimate?.startedAt || !activeProcessingEstimate?.totalSeconds) return null;
  const elapsed = Math.max(0, (Date.now() - activeProcessingEstimate.startedAt) / 1000);
  const safeProgress = clampNumber(progress, 1, 99);
  const byClock = activeProcessingEstimate.totalSeconds - elapsed;
  const byProgress = elapsed * ((100 - safeProgress) / safeProgress);
  const blended = safeProgress > 12 ? byClock * 0.5 + byProgress * 0.5 : byClock;
  return Math.max(0, blended);
}

function formatApproxDurationRange(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  if (safeSeconds <= 45) return "約 1 分鐘內";
  const lower = safeSeconds * 0.7;
  const upper = safeSeconds * 1.55 + 20;
  const roundTo = upper >= 600 ? 60 : 30;
  const roundedLower = Math.max(roundTo, Math.floor(lower / roundTo) * roundTo);
  const roundedUpper = Math.max(roundedLower + roundTo, Math.ceil(upper / roundTo) * roundTo);
  return `約 ${formatDurationLabel(roundedLower)}–${formatDurationLabel(roundedUpper)}`;
}

function updateEstimateLabels(progress = 0, prefix = "已處理") {
  const elapsed = activeProcessingEstimate?.startedAt
    ? Math.max(0, Math.floor((Date.now() - activeProcessingEstimate.startedAt) / 1000))
    : 0;
  processingElapsed.textContent = `${prefix} ${formatDurationLabel(elapsed)}`;
}

function updateFeatureControls(changedInput) {
  const ppt = document.querySelector("#feature-ppt");
  const aiBroll = document.querySelector("#feature-ai-broll");
  const finalVideo = document.querySelector("#feature-final-video");
  const insertPpt = document.querySelector("#feature-insert-ppt");
  applyVerticalVideoFeatureRules({ announce: changedInput?.id === "feature-insert-ppt" && activeMediaIsVertical() });
  if (changedInput?.id === "feature-insert-ppt" && insertPpt.checked) {
    if (ppt) ppt.checked = true;
    if (finalVideo) finalVideo.checked = true;
  }
  if (changedInput?.id === "feature-ppt" && ppt && !ppt.checked && insertPpt) insertPpt.checked = false;
  if (changedInput?.id === "feature-final-video" && finalVideo && !finalVideo.checked && insertPpt) insertPpt.checked = false;

  for (const input of featureToggles) {
    input.closest(".feature-option")?.classList.toggle("is-muted", !input.checked);
  }
  finalVideo?.closest(".feature-option")?.classList.toggle("is-dependent", Boolean(finalVideo.checked));
  insertPpt?.closest(".feature-option")?.classList.toggle("is-dependent", Boolean(insertPpt.checked));

  const labels = selectedFeatureLabels();
  quickSummary.replaceChildren(...(labels.length ? labels : ["請至少選擇一項功能"]).map((label) => {
    const item = document.createElement("span");
    item.textContent = label;
    return item;
  }));
}

function updatePostFeatureControls(changedInput) {
  const ppt = document.querySelector("#post-feature-ppt");
  const insertPpt = document.querySelector("#post-feature-insert-ppt");
  applyVerticalVideoFeatureRules({ announce: changedInput?.id === "post-feature-insert-ppt" && activeMediaIsVertical() });
  if (changedInput?.id === "post-feature-insert-ppt" && insertPpt.checked) {
    ppt.checked = true;
  }
  if (changedInput?.id === "post-feature-ppt" && !ppt.checked) insertPpt.checked = false;

  for (const input of postFeatureToggles) {
    input.closest(".feature-option")?.classList.toggle("is-muted", !input.checked);
  }
  insertPpt?.closest(".feature-option")?.classList.toggle("is-dependent", Boolean(insertPpt.checked));

  const labels = selectedPostFeatureLabels();
  postFeatureSummary?.replaceChildren(...(labels.length ? labels : ["請至少選擇一項功能"]).map((label) => {
    const item = document.createElement("span");
    item.textContent = label;
    return item;
  }));
}

function setWorkflowStep(step, { focusPanel = false } = {}) {
  const maxStep = 1;
  const nextWorkflowStep = Math.max(1, Math.min(maxStep, Number(step) || 1));
  if (nextWorkflowStep !== currentWorkflowStep) pauseAllPreviewMedia();
  currentWorkflowStep = nextWorkflowStep;

  stepButtons.forEach((button) => {
    const active = Number(button.dataset.stepTarget) === currentWorkflowStep;
    button.classList.toggle("is-active", active);
    if (active) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
  });

  stepPanels.forEach((panel) => {
    const active = Number(panel.dataset.stepPanel) === currentWorkflowStep;
    panel.hidden = !active;
    panel.classList.toggle("is-active", active);
  });

  stepBackButton.disabled = currentWorkflowStep === 1;
  stepBackButton.classList.toggle("hidden", currentWorkflowStep === 1);
  stepNextButton.classList.toggle("hidden", currentWorkflowStep === maxStep);
  submitButton.classList.toggle("hidden", currentWorkflowStep !== maxStep);

  if (focusPanel) {
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function validateWorkflowStep(step) {
  notice.classList.add("hidden");
  if (step === 1 && !fileInput.files[0]) {
    showNotice("請先選擇一支影片。");
    return false;
  }
  return true;
}

function goToWorkflowStep(targetStep) {
  const target = Number(targetStep) || 1;
  if (target > currentWorkflowStep) {
    for (let step = currentWorkflowStep; step < target; step += 1) {
      if (!validateWorkflowStep(step)) {
        setWorkflowStep(step, { focusPanel: true });
        return;
      }
    }
  }
  setWorkflowStep(target, { focusPanel: true });
}

function setFile(file) {
  if (!file) return;
  document.body.classList.remove("showing-results");
  activeProject = null;
  selectedMediaDurationSeconds = null;
  selectedMediaProfile = null;
  selectedMediaSignature = `${file.name}:${file.size}:${file.lastModified}`;
  fileLabel.textContent = file.name;
  fileHint.textContent = formatFileSize(file.size);
  dropZone.classList.add("has-file");
  notice.classList.add("hidden");
  results.classList.add("hidden");
  setRoughCutReviewOpen(false);
  setSubtitleReviewOpen(false);
  setProductStage("upload");
  loadMediaDuration(file, selectedMediaSignature);
}

function loadMediaDuration(file, signature) {
  if (!file?.type?.startsWith("video/") && !file?.type?.startsWith("audio/")) return;
  const media = document.createElement(file.type.startsWith("audio/") ? "audio" : "video");
  const objectUrl = URL.createObjectURL(file);
  const cleanup = () => URL.revokeObjectURL(objectUrl);
  const timeout = setTimeout(cleanup, 5000);
  media.preload = "metadata";
  media.onloadedmetadata = () => {
    clearTimeout(timeout);
    if (signature === selectedMediaSignature && Number.isFinite(media.duration) && media.duration > 0) {
      selectedMediaDurationSeconds = media.duration;
      selectedMediaProfile = {
        width: Number(media.videoWidth) || 0,
        height: Number(media.videoHeight) || 0
      };
      const orientation = isVerticalMediaProfile(selectedMediaProfile) ? "直式影片" : "";
      fileHint.textContent = `${formatFileSize(file.size)} · 片長 ${formatDurationLabel(media.duration)}${orientation ? ` · ${orientation}` : ""}`;
      updateFeatureControls();
      updatePostFeatureControls();
    }
    cleanup();
  };
  media.onerror = () => {
    clearTimeout(timeout);
    cleanup();
  };
  media.src = objectUrl;
}

function showNotice(message) {
  notice.textContent = message;
  notice.classList.remove("hidden");
}

function showToast(message) {
  clearTimeout(toastTimer);
  actionToast.textContent = message;
  actionToast.classList.remove("hidden");
  toastTimer = setTimeout(() => actionToast.classList.add("hidden"), 2600);
}

function filenameFromDisposition(disposition) {
  const value = String(disposition || "");
  const encoded = value.match(/filename\\*=UTF-8''([^;]+)/i)?.[1];
  if (encoded) {
    try {
      return decodeURIComponent(encoded.replace(/\+/g, "%20"));
    } catch {
      return encoded;
    }
  }
  const plain = value.match(/filename="?([^";]+)"?/i)?.[1];
  return plain ? plain.trim() : "";
}

function filenameFromHeader(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function fallbackDownloadFilename(link, response) {
  const explicit = filenameFromHeader(response.headers.get("X-Download-Filename"));
  if (explicit) return explicit;
  const fromHeader = filenameFromDisposition(response.headers.get("Content-Disposition"));
  if (fromHeader) return fromHeader;
  const fromAttribute = link.getAttribute("download");
  if (fromAttribute && fromAttribute !== "true") return fromAttribute;
  const pathPart = new URL(response.url || link.href, window.location.href).pathname.split("/").pop();
  return decodeURIComponent(pathPart || "frameflow-output");
}

function acceptTypeForFilename(filename, mimeType) {
  const extension = filename.includes(".") ? `.${filename.split(".").pop().toLowerCase()}` : "";
  const type = String(mimeType || "application/octet-stream").split(";")[0].trim() || "application/octet-stream";
  return extension ? [{ description: "輸出檔案", accept: { [type]: [extension] } }] : undefined;
}

function safeFilenamePart(value, fallback = "影片內容") {
  const normalized = String(value || "")
    .replace(/[\\/:*?"<>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return normalized.slice(0, 60) || fallback;
}

function extensionFromUrl(url, fallback = ".mp4") {
  try {
    const basename = new URL(url, window.location.href).pathname.split("/").pop() || "";
    const extension = basename.includes(".") ? `.${basename.split(".").pop()}` : "";
    return extension || fallback;
  } catch {
    return fallback;
  }
}

function projectDownloadFilename(label, extension = ".mp4") {
  const title = safeFilenamePart(activeProject?.title || activeProject?.filename?.replace(/\.[^.]+$/, "") || "影片內容");
  return `${title}${label ? `-${label}` : ""}${extension}`;
}

function nativeSaveEndpointForDownload(url) {
  const { pathname } = new URL(url, window.location.href);
  const match = pathname.match(/^\/api\/projects\/([a-f0-9-]{36})\/download\/([^/]+)$/i);
  return match ? `/api/projects/${match[1]}/save/${match[2]}` : "";
}

async function writeResponseToFile(response, writable) {
  if (!response.body?.getReader) {
    await writable.write(await response.blob());
    return;
  }
  const reader = response.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    await writable.write(value);
  }
}

async function saveDownloadWithPicker(link) {
  if (!("showSaveFilePicker" in window)) return false;
  const isEditingPackage = /\/download\/editingPackage(?:$|[?#])/.test(new URL(link.href, window.location.href).pathname);
  const editingPackageProjectId = activeProject?.id || activeProjectCleanupId || projectIdFromUrl();
  showToast(isEditingPackage ? "正在整理剪輯包，完成後會詢問儲存位置。" : "請選擇檔案要儲存的位置。");
  let handle;
  let response;
  try {
    response = await fetch(link.href, { cache: "no-store" });
    if (!response.ok) throw new Error("檔案尚未產生或已被移除。");
    const filename = fallbackDownloadFilename(link, response);
    if (isEditingPackage) showToast("剪輯包已整理完成，請選擇儲存位置。");
    handle = await window.showSaveFilePicker({
      suggestedName: filename,
      types: acceptTypeForFilename(filename, response.headers.get("Content-Type"))
    });
  } catch (error) {
    if (error?.name === "AbortError") showToast("已取消儲存。");
    else showToast(error.message || "無法準備下載檔案。");
    if (isEditingPackage) cleanupUnclaimedEditingPackage();
    return true;
  }

  try {
    showToast("正在儲存檔案，請稍候。");
    const writable = await handle.createWritable();
    try {
      await writeResponseToFile(response, writable);
    } finally {
      await writable.close();
    }
    if (isEditingPackage) markEditingPackageDownloaded(editingPackageProjectId);
    showToast("檔案已儲存到你選擇的位置。");
  } catch (error) {
    if (isEditingPackage) cleanupUnclaimedEditingPackage();
    showToast(error.message || "儲存檔案失敗。");
  }
  return true;
}

async function saveDownloadWithNativeDialog(link) {
  const endpoint = nativeSaveEndpointForDownload(link.href);
  if (!endpoint) return false;
  const isEditingPackage = /\/save\/editingPackage(?:$|[?#])/.test(new URL(endpoint, window.location.href).pathname);
  const editingPackageProjectId = activeProject?.id || activeProjectCleanupId || projectIdFromUrl();
  try {
    showToast(isEditingPackage ? "正在整理剪輯包，完成後會跳出儲存視窗。" : "請在跳出的視窗選擇儲存位置。");
    const response = await fetch(endpoint, { method: "POST", cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      showToast(payload.cancelled ? "已取消儲存。" : (payload.error || "儲存檔案失敗。"));
      if (isEditingPackage) cleanupUnclaimedEditingPackage();
      return true;
    }
    if (isEditingPackage) markEditingPackageDownloaded(editingPackageProjectId);
    showToast(`已儲存：${payload.filename || "輸出檔案"}`);
  } catch (error) {
    if (isEditingPackage) cleanupUnclaimedEditingPackage();
    showToast(error.message || "儲存檔案失敗。");
  }
  return true;
}

function formatFailureMessage(message) {
  const text = String(message || "處理失敗，請再試一次。").trim();
  if (/Failed to fetch|NetworkError|Load failed/i.test(text)) {
    return "連線中斷或服務剛重啟，這次輸出沒有完整完成。請回到可修改步驟後重試。";
  }
  if (/setup_artifact_tool_workspace|Cannot find module|@oai\/artifact-tool/.test(text)) {
    return "PPT 產生器剛剛沒有成功啟動。請重新送出一次；如果還失敗，我會從終端機錯誤繼續追。";
  }
  if (text.length <= 360) return text;
  return `${text.slice(0, 340)}…`;
}

function createWorkflowError(payload = {}, fallbackMessage = "處理失敗。") {
  const error = new Error(payload.error || fallbackMessage);
  error.workflowStage = payload.errorStage || inferWorkflowErrorStage(error.message);
  error.workflowAction = payload.errorAction || workflowErrorActionForStage(error.workflowStage);
  return error;
}

function inferWorkflowErrorStage(message = "") {
  const text = String(message || "");
  if (/請先選擇影片|重新上傳|共用原始影片|原始影片|沒有可讀取的音軌|音軌|不支援|格式|損壞/.test(text)) return "upload";
  if (/逐字稿|稿件|原稿|校稿|精華|品質不足|時間線資訊|辨識/.test(text)) return "transcript";
  if (/至少選擇一項|後續功能|功能/.test(text)) return "features";
  if (/粗剪|保留|刪除片段|刪除滑塊|FFmpeg 粗剪/.test(text)) return "roughcut";
  if (/字幕|caption|Caption|SRT|ASS|燒錄/.test(text)) return "subtitles";
  return "outputs";
}

function workflowErrorActionForStage(stage = "outputs") {
  return {
    upload: "已回到上傳，請確認影片檔、音軌或進階補充內容。",
    transcript: "已回到逐字稿，請修正或重新選擇要用於後續製作的稿件。",
    features: "已回到功能選擇，請調整要繼續製作的項目。",
    roughcut: "已回到粗剪精修，請檢查保留/隱藏片段與時間軸。",
    subtitles: "已回到字幕精修，請檢查字幕內容、時間或保留狀態。",
    outputs: "已回到功能選擇，請重新送出未完成的輸出。"
  }[stage] || "已回到可繼續處理的位置。";
}

function simulatedFailureFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const requestedStage = params.get("simulateFailure") || "";
  const allowedStages = new Set(["upload", "transcript", "features", "roughcut", "subtitles", "outputs"]);
  if (!allowedStages.has(requestedStage)) return null;
  if (!["localhost", "127.0.0.1"].includes(window.location.hostname)) return null;
  const message = params.get("simulateFailureMessage")
    || {
      upload: "測試用：影片或音軌讀取失敗。",
      transcript: "測試用：逐字稿需要修正後才能繼續。",
      features: "測試用：尚未選擇後續製作功能。",
      roughcut: "測試用：粗剪輸出未完成，請回到粗剪精修檢查保留與隱藏片段。",
      subtitles: "測試用：字幕輸出未完成，請回到字幕精修檢查內容與時間。",
      outputs: "測試用：後續輸出沒有完整完成。"
    }[requestedStage];
  return createWorkflowError({
    error: message,
    errorStage: requestedStage,
    errorAction: workflowErrorActionForStage(requestedStage)
  });
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function moveAmbientParticle(particle, { instant = false } = {}) {
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 1200;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 800;
  const size = Math.round(randomBetween(1.5, 5.8) * 10) / 10;
  const x = Math.round(randomBetween(12, Math.max(14, viewportWidth - 18)));
  const y = Math.round(randomBetween(12, Math.max(14, viewportHeight - 18)));
  const duration = instant ? 0 : Math.round(randomBetween(7000, 18000));
  particle.style.setProperty("--particle-size", `${size}px`);
  particle.style.setProperty("--particle-opacity", String(randomBetween(0.28, 0.78).toFixed(2)));
  particle.style.setProperty("--particle-duration", `${duration}ms`);
  particle.style.setProperty("--particle-x", `${x}px`);
  particle.style.setProperty("--particle-y", `${y}px`);
  return duration;
}

function startAmbientParticles() {
  const particles = ambientParticleLayer ? [...ambientParticleLayer.querySelectorAll("i")] : [];
  if (!particles.length) return;
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  particles.forEach((particle, index) => {
    moveAmbientParticle(particle, { instant: true });
    if (prefersReducedMotion) return;
    const wander = () => {
      const duration = moveAmbientParticle(particle);
      window.setTimeout(wander, duration + randomBetween(600, 2600));
    };
    window.setTimeout(wander, 400 + index * 180 + randomBetween(0, 1400));
  });
}

async function checkHealth() {
  try {
    const response = await fetch("/api/health");
    const health = await response.json();
    localVisualReady = Boolean(health.localVisuals?.ready);
  } catch {
    localVisualReady = false;
  }
}

function processingStagesForSelection({ transcriptOnly = false, postTranscript = false } = {}) {
  if (transcriptOnly) return transcriptStages;
  const options = postTranscript ? selectedPostProcessingOptions() : selectedProcessingOptions();
  if (options.roughCut) return [postTranscriptStages.roughCut];
  return [
    options.aiBroll ? postTranscriptStages.broll : null,
    options.outputPpt ? postTranscriptStages.ppt : null,
    options.burnSubtitles ? postTranscriptStages.subtitles : null,
    options.finalVideo ? postTranscriptStages.final : null
  ].filter(Boolean).map((stage, index, stages) => [
    String(index + 1).padStart(2, "0"),
    stage[1],
    stage[2],
    Math.round(((index + 1) / Math.max(1, stages.length)) * 91),
    stage[4],
    stage[5]
  ]);
}

function renderProcessingWorkflow(stages = []) {
  if (!aiWorkflow) return;
  aiWorkflow.replaceChildren(...stages.map((stage, index) => {
    const item = document.createElement("li");
    if (index === 0) item.classList.add("is-current");
    const marker = document.createElement("span");
    const title = document.createElement("strong");
    const detail = document.createElement("small");
    title.textContent = stage[4] || String(stage[1] || "").replace(/[⋯。]/g, "");
    detail.textContent = stage[5] || stage[2] || "";
    item.append(marker, title, detail);
    return item;
  }));
}

function updateWorkflowProgress(progress = 0, { failed = false, elapsedPrefix = "已處理" } = {}) {
  const steps = aiWorkflow ? [...aiWorkflow.querySelectorAll("li")] : [];
  const safeProgress = Math.max(0, Math.min(100, Number(progress) || 0));
  const activeIndex = steps.length
    ? Math.min(steps.length - 1, Math.max(0, Math.ceil((safeProgress / 100) * steps.length) - 1))
    : 0;

  steps.forEach((step, index) => {
    step.classList.toggle("is-complete", !failed && safeProgress >= 100 ? true : index < activeIndex);
    step.classList.toggle("is-current", !failed && safeProgress < 100 && index === activeIndex);
    step.classList.toggle("is-failed", failed && index === activeIndex);
  });

  if (!failed) updateEstimateLabels(safeProgress, elapsedPrefix);
}

function scrollResultsToTop() {
  const reset = () => window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  reset();
  requestAnimationFrame(() => {
    reset();
    requestAnimationFrame(reset);
  });
}

function keepTimelinePositionVisible(scroller, position, { marginRatio = 0.28, minMargin = 90, maxMargin = 180 } = {}) {
  if (!scroller || !Number.isFinite(Number(position))) return;
  const maxScroll = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
  if (maxScroll <= 0) return;
  const margin = Math.max(minMargin, Math.min(maxMargin, scroller.clientWidth * marginRatio));
  const viewStart = scroller.scrollLeft;
  const viewEnd = viewStart + scroller.clientWidth;
  const targetPosition = Number(position);
  if (targetPosition < viewStart + margin) {
    scroller.scrollLeft = Math.max(0, targetPosition - margin);
  } else if (targetPosition > viewEnd - margin) {
    scroller.scrollLeft = Math.min(maxScroll, targetPosition - scroller.clientWidth + margin);
  }
}

function createAudioGainLine({ className, getGain, setGain, label = "影片音量" }) {
  const line = document.createElement("button");
  const knob = document.createElement("span");
  const value = document.createElement("strong");
  line.type = "button";
  line.className = `${className} audio-gain-line`;
  line.setAttribute("aria-label", `${label}，可上下拖曳調整輸出音量`);
  knob.setAttribute("aria-hidden", "true");
  value.className = "audio-gain-value";
  line.append(knob, value);

  const sync = () => {
    const gain = clampAudioGain(getGain());
    line.style.top = `${audioGainLineTopPercent(gain)}%`;
    value.textContent = `${formatAudioGain(gain)}｜${formatAudioGainDb(gain)}`;
    line.title = `${label}：${formatAudioGain(gain)}（${formatAudioGainDb(gain)}）`;
  };
  line.syncAudioGain = sync;

  const applyFromEvent = (event) => {
    const lane = line.closest(".roughcut-audio-lane, .subtitle-audio-lane");
    if (!lane) return;
    setGain(audioGainFromPointer(event, lane));
    sync();
  };

  line.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    line.setPointerCapture?.(event.pointerId);
    line.classList.add("is-dragging");
    applyFromEvent(event);
  });
  line.addEventListener("pointermove", (event) => {
    if (!line.classList.contains("is-dragging")) return;
    event.preventDefault();
    applyFromEvent(event);
  });
  const stop = (event) => {
    line.classList.remove("is-dragging");
    if (event?.pointerId !== undefined) line.releasePointerCapture?.(event.pointerId);
  };
  line.addEventListener("pointerup", stop);
  line.addEventListener("pointercancel", stop);
  sync();
  return line;
}

function pointerTimeOnSubtitleTimeline(event) {
  const track = subtitleTimelineTrack();
  if (!track) return 0;
  const rect = track.getBoundingClientRect();
  const duration = Number(track.dataset.duration) || subtitleTimelineDuration();
  const pixelsPerSecond = Number(track.dataset.pixelsPerSecond) || SUBTITLE_TIMELINE_PIXELS_PER_SECOND;
  return clampNumber((event.clientX - rect.left - SUBTITLE_TIMELINE_GUTTER) / Math.max(1, pixelsPerSecond), 0, duration);
}

function pointerTimeOnRoughCutTimeline(event) {
  const track = roughCutTimelineTrack();
  const duration = roughCutTotalDuration();
  if (!track) return 0;
  const rect = track.getBoundingClientRect();
  const ratio = clampNumber((event.clientX - rect.left) / Math.max(1, rect.width), 0, 1);
  return ratio * duration;
}

function seekSubtitlePreview(seconds, { keepPlaying = false, keepVisible = true } = {}) {
  const duration = subtitleTimelineDuration();
  const target = clampNumber(seconds, 0, duration);
  if (subtitleReviewVideo?.src) {
    const shouldResume = Boolean(keepPlaying);
    subtitlePreviewExplicitSeekShouldResume = shouldResume;
    setSubtitlePreviewSeeking(true);
    if (!shouldResume) {
      subtitlePreviewResumeSeekUntil = 0;
      subtitlePreviewLastPlayingAt = 0;
      subtitleReviewVideo.pause();
    }
    subtitleReviewVideo.currentTime = target;
    if (shouldResume) subtitleReviewVideo.play().catch(() => {});
  }
  updateSubtitlePlayhead(target, { keepVisible });
}

function markSubtitlePreviewPlaying() {
  subtitlePreviewLastPlayingAt = Date.now();
}

function subtitlePreviewWasPlayingIntent() {
  return Boolean(
    subtitleReviewVideo
    && !subtitleReviewVideo.ended
    && (!subtitleReviewVideo.paused || Date.now() - subtitlePreviewLastPlayingAt < 1200)
  );
}

function subtitlePreviewIsActivelyPlaying() {
  return Boolean(subtitleReviewVideo && !subtitleReviewVideo.paused && !subtitleReviewVideo.ended);
}

function resumeSubtitlePreviewAfterSeek({ force = false } = {}) {
  if (!subtitleReviewVideo || subtitleReviewVideo.ended || (!force && !subtitlePreviewWasPlayingIntent())) return;
  applyPreviewVideoGain(subtitleReviewVideo, subtitleVolumeGain);
  subtitleReviewVideo.play()
    .then(() => {
      markSubtitlePreviewPlaying();
      startSubtitlePlayheadTicker();
    })
    .catch((error) => {
      console.warn(`字幕預覽恢復播放失敗：${error?.message || error}`);
    });
}

function requestSubtitlePreviewResumeAfterSeek() {
  if (!subtitlePreviewExplicitSeekShouldResume && !subtitlePreviewWasPlayingIntent()) return;
  subtitlePreviewResumeSeekUntil = Date.now() + 2200;
}

function restoreSubtitlePreviewAfterSeekIfNeeded() {
  if (Date.now() > subtitlePreviewResumeSeekUntil) return false;
  requestAnimationFrame(resumeSubtitlePreviewAfterSeek);
  window.setTimeout(resumeSubtitlePreviewAfterSeek, 80);
  window.setTimeout(resumeSubtitlePreviewAfterSeek, 220);
  window.setTimeout(resumeSubtitlePreviewAfterSeek, 520);
  return true;
}

function setSubtitlePreviewSeeking(seeking) {
  const frame = subtitleReviewVideo?.closest(".subtitle-player-frame");
  frame?.classList.toggle("is-seeking", Boolean(seeking));
  if (seeking) {
    frame?.setAttribute("aria-busy", "true");
    showPreviewFreezeFrame(subtitleReviewVideo);
  } else {
    frame?.removeAttribute("aria-busy");
    hidePreviewFreezeFrameAfterPaint(subtitleReviewVideo);
  }
}

function enablePlayheadDrag(playhead, {
  className = "is-dragging",
  lock,
  unlock,
  timeFromEvent,
  seek,
  wasPlaying,
  resume
} = {}) {
  if (!playhead || playhead.dataset.dragReady === "true") return;
  playhead.dataset.dragReady = "true";
  playhead.tabIndex = 0;
  playhead.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const keepPlaying = Boolean(wasPlaying?.());
    const resumeIfNeeded = () => {
      if (keepPlaying) resume?.();
    };
    const resumeAfterSeekSettles = () => {
      if (!keepPlaying) return;
      requestAnimationFrame(resumeIfNeeded);
      window.setTimeout(resumeIfNeeded, 80);
      window.setTimeout(resumeIfNeeded, 220);
      window.setTimeout(resumeIfNeeded, 520);
    };
    lock?.();
    playhead.classList.add(className);
    playhead.setPointerCapture?.(event.pointerId);
    seek(timeFromEvent(event), { keepPlaying, keepVisible: true });
    resumeAfterSeekSettles();

    const move = (moveEvent) => {
      moveEvent.preventDefault();
      seek(timeFromEvent(moveEvent), { keepPlaying, keepVisible: true });
      requestAnimationFrame(resumeIfNeeded);
    };
    const stop = (stopEvent) => {
      playhead.classList.remove(className);
      playhead.releasePointerCapture?.(stopEvent.pointerId);
      playhead.removeEventListener("pointermove", move);
      playhead.removeEventListener("pointerup", stop);
      playhead.removeEventListener("pointercancel", stop);
      unlock?.();
      seek(timeFromEvent(stopEvent), { keepPlaying, keepVisible: true });
      resumeAfterSeekSettles();
    };
    playhead.addEventListener("pointermove", move);
    playhead.addEventListener("pointerup", stop);
    playhead.addEventListener("pointercancel", stop);
  });
}

function hideProcessingScreen() {
  processing.classList.add("hidden");
  document.body.classList.remove("processing-active");
  if (document.body.classList.contains("showing-results") && !results.classList.contains("hidden")) {
    scrollResultsToTop();
  }
}

function recoverStaleFullscreenState() {
  const processingIsVisible = processing && !processing.classList.contains("hidden");
  const roughCutIsVisible = roughCutReviewModal && !roughCutReviewModal.classList.contains("hidden");
  const subtitleIsVisible = subtitleReviewModal && !subtitleReviewModal.classList.contains("hidden");
  if (document.body.classList.contains("processing-active") && !processingIsVisible) {
    document.body.classList.remove("processing-active");
  }
  if (document.body.classList.contains("roughcut-active") && !roughCutIsVisible) {
    document.body.classList.remove("roughcut-active");
  }
  if (document.body.classList.contains("subtitle-active") && !subtitleIsVisible) {
    document.body.classList.remove("subtitle-active");
  }
  if (!processingIsVisible && !roughCutIsVisible && !subtitleIsVisible) {
    document.body.style.pointerEvents = "";
  }
}

function pauseAllPreviewMedia() {
  document.querySelectorAll("video, audio").forEach((media) => {
    if (typeof media.pause === "function") media.pause();
  });
  cancelRoughCutPreviewSkip();
  stopRoughCutPlayheadTicker();
  stopSubtitlePlayheadTicker();
}

function showProcessingScreen() {
  pauseAllPreviewMedia();
  document.body.classList.add("processing-active");
  processing.classList.remove("hidden");
}

function startProcessing(options = {}) {
  const stages = processingStagesForSelection(options);
  clearInterval(stageTimer);
  clearInterval(elapsedTimer);
  processingFailureState = null;
  processingFailureActions?.classList.add("hidden");
  renderProcessingWorkflow(stages);
  activeProcessingEstimate = {
    ...estimateProcessingSeconds(fileInput.files[0], options),
    startedAt: Date.now()
  };
  showProcessingScreen();
  const apply = () => {
    const elapsed = Math.max(0, (Date.now() - activeProcessingEstimate.startedAt) / 1000);
    const progress = Math.min(91, Math.max(6, (elapsed / activeProcessingEstimate.totalSeconds) * 91));
    const [number, title, detail] = stages.find((stage) => progress <= stage[3]) || stages.at(-1);
    processingNumber.textContent = number;
    processingTitle.textContent = title;
    processingDetail.textContent = detail;
    progressBar.style.width = `${progress}%`;
    updateWorkflowProgress(progress);
  };
  apply();
  stageTimer = setInterval(apply, 1000);
}

function finishProcessing(data = activeProject) {
  clearInterval(stageTimer);
  clearInterval(elapsedTimer);
  recordEstimateActual();
  progressBar.style.width = "100%";
  updateWorkflowProgress(100);
  if (isTranscriptReview(data)) {
    processingTitle.textContent = "逐字稿已完成";
    processingDetail.textContent = "可以先下載、修正，確認後再進入後續製作。";
  } else if (isAwaitingRoughCutApproval(data)) {
    processingTitle.textContent = "AI 粗剪草稿已完成";
    processingDetail.textContent = "請先確認時間線，確認後再製作 PPT、B-roll 與成片。";
  } else if (isAwaitingSubtitleApproval(data)) {
    processingTitle.textContent = "字幕草稿已完成";
    processingDetail.textContent = "請先精修字幕；確認後才會製作 PPT、B-roll 與成片。";
  } else {
    processingTitle.textContent = "內容專案已完成";
    processingDetail.textContent = "正在整理下載項目⋯";
  }
  setTimeout(hideProcessingScreen, 420);
}

function failProcessing(errorInfo) {
  const message = errorInfo?.message || errorInfo;
  clearInterval(stageTimer);
  clearInterval(elapsedTimer);
  activeProcessingEstimate = null;
  const stage = errorInfo?.workflowStage || inferWorkflowErrorStage(message);
  processingFailureState = {
    errorInfo,
    workflowStage: stage,
    projectId: activeProject?.id || activeProjectCleanupId || projectIdFromUrl()
  };
  processingNumber.textContent = "!";
  processingTitle.textContent = "這次沒有完成";
  const action = errorInfo?.workflowAction || workflowErrorActionForStage(stage);
  processingDetail.textContent = `${formatFailureMessage(message)}\n${action}請按「修改」前往需要處理的頁面，或按「關閉」回到主頁。`;
  progressBar.style.width = "100%";
  updateWorkflowProgress(100, { failed: true });
  showProcessingScreen();
  processingFailureActions?.classList.remove("hidden");
}

function canContinueFromProjectState(data) {
  return Boolean(
    data?.workflow?.awaitingRoughCutApproval
    || data?.workflow?.awaitingSubtitleApproval
    || data?.roughCutReview?.status === "needs-review"
    || data?.subtitleReview?.status === "needs-review"
    || data?.finalVideoUrl
    || data?.subtitledVideoUrl
    || data?.roughCutVideoUrl
    || data?.workflow?.phase === "transcript-review"
  );
}

function hasCompletedPrimaryOutput(data) {
  return Boolean(data?.finalVideoUrl || data?.subtitledVideoUrl || data?.roughCutVideoUrl);
}

function recoverableFailureStage(data, requestedStage = "outputs") {
  if (requestedStage !== "outputs") return requestedStage;
  if (data?.workflow?.awaitingRoughCutApproval || data?.roughCutReview?.status === "needs-review") return "roughcut";
  if (data?.workflow?.awaitingSubtitleApproval || data?.subtitleReview?.status === "needs-review") return "subtitles";
  if (data?.workflow?.phase === "transcript-review" || data?.workflow?.awaitingTranscriptApproval) return "transcript";
  if (!hasCompletedPrimaryOutput(data)) return "features";
  return "outputs";
}

function routeToWorkflowErrorStage(data, errorInfo = {}) {
  const requestedStage = errorInfo?.workflowStage || inferWorkflowErrorStage(errorInfo?.message || errorInfo);
  const stage = recoverableFailureStage(data, requestedStage);
  const message = errorInfo?.message || errorInfo || "";
  pauseAllPreviewMedia();
  hideProcessingScreen();
  processingFailureState = null;
  processingFailureActions?.classList.add("hidden");
  if (stage === "upload") {
    document.body.classList.remove("showing-results");
    results.classList.add("hidden");
    setRoughCutReviewOpen(false);
    setSubtitleReviewOpen(false);
    setWorkflowStep(1, { focusPanel: true });
    setProductStage("upload");
    showWorkflowErrorHint(stage, message);
    return;
  }
  if (!data) return;
  if (stage === "transcript") {
    transcriptRevisitMode = true;
    renderResult(data, { focus: false });
    returnToTranscriptEditPage();
    setProductStage("transcript");
    showWorkflowErrorHint(stage, message);
    return;
  }
  if (stage === "features") {
    transcriptRevisitMode = true;
    renderResult(data, { focus: false });
    showTranscriptOptionsPage();
    setProductStage("features");
    showWorkflowErrorHint(stage, message);
    return;
  }
  if (stage === "roughcut") {
    renderResult(data, { focus: false });
    openRoughCutEditor();
    setProductStage("refine");
    showWorkflowErrorHint(stage, message);
    return;
  }
  if (stage === "subtitles") {
    renderResult(data, { focus: false });
    openSubtitleEditor();
    setProductStage("refine");
    showWorkflowErrorHint(stage, message);
    return;
  }
  renderResult(data, { focus: false });
  setRoughCutReviewOpen(false);
  setSubtitleReviewOpen(false);
  setProductStage("outputs");
  scrollResultsToTop();
  showWorkflowErrorHint(stage, message);
}

function showWorkflowErrorHint(stage = "outputs", message = "") {
  document.querySelectorAll(".workflow-error-hint").forEach((item) => item.remove());
  const hint = document.createElement("div");
  hint.className = "workflow-error-hint";
  hint.setAttribute("role", "alert");
  hint.textContent = `需要修改：${formatFailureMessage(message)} ${workflowErrorActionForStage(stage)}`;
  if (stage === "upload") {
    showNotice(hint.textContent);
    return;
  }
  const target = {
    transcript: transcriptStage,
    features: featureSelectionPage,
    roughcut: roughCutReviewModal?.querySelector(".roughcut-review-panel"),
    subtitles: subtitleReviewModal?.querySelector(".subtitle-review-panel"),
    outputs: results
  }[stage] || results;
  target?.prepend(hint);
  requestAnimationFrame(() => hint.scrollIntoView({ behavior: "smooth", block: "start" }));
}

async function recoverProjectAfterProcessingFailure(errorInfo = {}) {
  const message = errorInfo?.message || errorInfo || "";
  const stage = errorInfo?.workflowStage || processingFailureState?.workflowStage || inferWorkflowErrorStage(message);
  const jobId = processingFailureState?.projectId || activeProject?.id || activeProjectCleanupId || projectIdFromUrl();
  if (!/^[a-f0-9-]{36}$/i.test(jobId || "")) {
    const fallbackStage = stage === "transcript" || stage === "upload" ? "upload" : stage;
    routeToWorkflowErrorStage(null, { workflowStage: fallbackStage, message });
    return;
  }
  try {
    const response = await fetch(`/api/projects/${jobId}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "找不到這個結果。");
    hideProcessingScreen();
    routeToWorkflowErrorStage(data, errorInfo);
  } catch {
    if (stage === "upload" || stage === "transcript") {
      routeToWorkflowErrorStage(null, { workflowStage: "upload", message });
    }
  }
}

function startSubtitleBurnProgress(captionCount) {
  clearInterval(stageTimer);
  clearInterval(elapsedTimer);
  processingFailureState = null;
  processingFailureActions?.classList.add("hidden");
  const includesDeferredOutputs = isAwaitingSubtitleApproval();
  const stages = includesDeferredOutputs ? postSubtitleGenerationStages(activeProject) : subtitleBurnStages;
  renderProcessingWorkflow(stages);
  activeProcessingEstimate = {
    ...estimateSubtitleBurnSeconds(captionCount),
    startedAt: Date.now()
  };
  showProcessingScreen();
  const apply = () => {
    const elapsed = Math.max(0, (Date.now() - activeProcessingEstimate.startedAt) / 1000);
    const progress = Math.min(91, Math.max(10, (elapsed / activeProcessingEstimate.totalSeconds) * 91));
    const [number, title, detail] = stages.find((stage) => progress <= stage[3]) || stages.at(-1);
    processingNumber.textContent = number;
    processingTitle.textContent = title;
    processingDetail.textContent = number === "S1"
      ? `${detail} 目前有 ${captionCount} 句字幕會被燒錄。`
      : detail;
    progressBar.style.width = `${progress}%`;
    updateWorkflowProgress(progress, {
      subtitleCount: captionCount,
      elapsedPrefix: includesDeferredOutputs ? "字幕確認後製作" : "字幕燒錄"
    });
  };
  apply();
  stageTimer = setInterval(apply, 1000);
}

function finishSubtitleBurnProgress(data = activeProject) {
  clearInterval(stageTimer);
  clearInterval(elapsedTimer);
  recordEstimateActual();
  processingNumber.textContent = "OK";
  const completedDeferredOutputs = Boolean(data?.workflow?.highCostGeneratedAfterSubtitleConfirmation);
  processingTitle.textContent = completedDeferredOutputs ? "確認字幕後成品已完成" : "精修字幕影片已完成";
  processingDetail.textContent = completedDeferredOutputs
    ? "已依確認後字幕完成 PPT、B-roll 與成片。"
    : "正在更新影片預覽與下載項目⋯";
  progressBar.style.width = "100%";
  updateWorkflowProgress(100);
  setTimeout(hideProcessingScreen, 520);
}

function startRoughCutRenderProgress(removalCount) {
  clearInterval(stageTimer);
  clearInterval(elapsedTimer);
  processingFailureState = null;
  processingFailureActions?.classList.add("hidden");
  const includesDeferredOutputs = isAwaitingRoughCutApproval();
  const stages = includesDeferredOutputs ? roughCutDeferredRenderStages(activeProject) : roughCutRenderStages;
  renderProcessingWorkflow(stages);
  activeProcessingEstimate = {
    ...estimateRoughCutRenderSeconds(removalCount),
    startedAt: Date.now()
  };
  showProcessingScreen();
  const apply = () => {
    const elapsed = Math.max(0, (Date.now() - activeProcessingEstimate.startedAt) / 1000);
    const progress = Math.min(91, Math.max(10, (elapsed / activeProcessingEstimate.totalSeconds) * 91));
    const [number, title, detail] = stages.find((stage) => progress <= stage[3]) || stages.at(-1);
    processingNumber.textContent = number;
    processingTitle.textContent = title;
    processingDetail.textContent = number === "R1"
      ? `${detail} 目前會刪除 ${removalCount} 段。`
      : detail;
    progressBar.style.width = `${progress}%`;
    updateWorkflowProgress(progress, { elapsedPrefix: includesDeferredOutputs ? "粗剪確認後製作" : "粗剪輸出" });
  };
  apply();
  stageTimer = setInterval(apply, 1000);
}

function finishRoughCutRenderProgress(data = activeProject) {
  clearInterval(stageTimer);
  clearInterval(elapsedTimer);
  recordEstimateActual();
  processingNumber.textContent = "OK";
  if (data?.workflow?.highCostGeneratedAfterRoughCut) {
    processingTitle.textContent = "粗剪後成品已完成";
    processingDetail.textContent = "已依確認後的時間線產生 PPT、B-roll 與成片。";
  } else if (data?.workflow?.awaitingSubtitleApproval) {
    processingTitle.textContent = "粗剪與字幕草稿已完成";
    processingDetail.textContent = "請先精修字幕；確認後才會製作 PPT、B-roll 與成片。";
  } else {
    processingTitle.textContent = "AI 粗剪影片已完成";
    processingDetail.textContent = "正在更新預覽與下載項目⋯";
  }
  progressBar.style.width = "100%";
  updateWorkflowProgress(100);
  setTimeout(hideProcessingScreen, 520);
}

function rememberDownloadNote(element) {
  const note = element.querySelector("small");
  if (note && !element.dataset.defaultNote) element.dataset.defaultNote = note.textContent;
  return note;
}

function setDownload(selector, url, { hideWhenMissing = false } = {}) {
  const element = document.querySelector(selector);
  if (!element) return;
  const note = rememberDownloadNote(element);
  element.href = url || "#";
  element.setAttribute("aria-disabled", url ? "false" : "true");
  element.classList.toggle("is-unavailable", !url);
  element.title = url ? "已產生，會先詢問儲存位置" : "這個檔案尚未產生。";
  if (note) note.textContent = url ? element.dataset.defaultNote : "尚未產生";
  if (hideWhenMissing) element.classList.toggle("hidden", !url);
  else element.classList.remove("hidden");
}

function forcedDownloadUrl(data, key, url) {
  return data?.id && url ? `/api/projects/${data.id}/download/${key}` : url;
}

function cacheBustedPreviewUrl(url, token = MEDIA_PREVIEW_CACHE_BUST) {
  if (!url) return "";
  try {
    const parsed = new URL(url, window.location.href);
    parsed.searchParams.set("previewV", token);
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}previewV=${encodeURIComponent(token)}`;
  }
}

function isTranscriptReview(data = activeProject) {
  return transcriptRevisitMode || data?.workflow?.phase === "transcript-review" || data?.workflow?.awaitingTranscriptApproval;
}

function rememberProjectForCleanup(data) {
  if (!data?.id) return;
  activeProjectCleanupId = data.id;
  const url = new URL(window.location.href);
  url.searchParams.set("project", data.id);
  url.hash = "#studio";
  history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

function cleanupCurrentProjectArtifacts({ beacon = false } = {}) {
  const jobId = activeProject?.id || activeProjectCleanupId;
  if (!/^[a-f0-9-]{36}$/i.test(jobId || "") || cleanedProjectIds.has(jobId)) return;
  cleanedProjectIds.add(jobId);
  const url = `/api/projects/${jobId}/cleanup?allowPersisted=1`;
  activeProjectCleanupId = "";
  if (beacon && "sendBeacon" in navigator) {
    navigator.sendBeacon(url, new Blob([], { type: "text/plain" }));
    return;
  }
  fetch(url, { method: "POST", keepalive: true }).catch(() => cleanedProjectIds.delete(jobId));
}

function scheduleCurrentProjectCleanup({ beacon = false } = {}) {
  const jobId = activeProject?.id || activeProjectCleanupId || projectIdFromUrl();
  if (!/^[a-f0-9-]{36}$/i.test(jobId || "") || cleanedProjectIds.has(jobId)) return;
  const url = `/api/projects/${jobId}/cleanup/schedule`;
  if (beacon && "sendBeacon" in navigator) {
    navigator.sendBeacon(url, new Blob([], { type: "text/plain" }));
    return;
  }
  fetch(url, { method: "POST", keepalive: true }).catch(() => {});
}

function cancelCurrentProjectCleanup() {
  const jobId = activeProject?.id || activeProjectCleanupId || projectIdFromUrl();
  if (!/^[a-f0-9-]{36}$/i.test(jobId || "") || cleanedProjectIds.has(jobId)) return;
  fetch(`/api/projects/${jobId}/cleanup/cancel`, { method: "POST", keepalive: true }).catch(() => {});
}

function markEditingPackageDownloaded(jobId = activeProject?.id || activeProjectCleanupId || projectIdFromUrl()) {
  if (/^[a-f0-9-]{36}$/i.test(jobId || "")) editingPackageDownloadedForProjectId = jobId;
}

function cleanupUnclaimedEditingPackage({ beacon = false } = {}) {
  const jobId = activeProject?.id || activeProjectCleanupId || projectIdFromUrl();
  if (!/^[a-f0-9-]{36}$/i.test(jobId || "")) return;
  if (editingPackageDownloadedForProjectId === jobId || cleanedEditingPackageIds.has(jobId)) return;
  const hasEditingPackageLink = Boolean(
    document.querySelector("#editing-package-link[href*='/download/editingPackage'], #editing-package-download-button[href*='/download/editingPackage']")
  );
  if (!hasEditingPackageLink) return;
  cleanedEditingPackageIds.add(jobId);
  const url = `/api/projects/${jobId}/editing-package/cleanup`;
  if (beacon && "sendBeacon" in navigator) {
    navigator.sendBeacon(url, new Blob([], { type: "text/plain" }));
    return;
  }
  fetch(url, { method: "POST", keepalive: true }).catch(() => cleanedEditingPackageIds.delete(jobId));
}

function hasCurrentProjectToDiscard() {
  const jobId = activeProject?.id || activeProjectCleanupId || projectIdFromUrl();
  return /^[a-f0-9-]{36}$/i.test(jobId || "") && !cleanedProjectIds.has(jobId);
}

function confirmDiscardCurrentProject() {
  if (!hasCurrentProjectToDiscard()) return true;
  return window.confirm("回到主頁後，目前這次製作的暫存成果與未輸出的變更不會保留。確定要回主頁嗎？");
}

function updateDownloadAvailability(itemOrKey, existsValue = undefined) {
  const item = typeof itemOrKey === "object" && itemOrKey !== null ? itemOrKey : { key: itemOrKey, exists: existsValue };
  const { key } = item;
  const selectors = [].concat(downloadSelectors[key] || []);
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (!element) continue;
    const note = rememberDownloadNote(element);
    const hasUrl = element.getAttribute("href") && element.getAttribute("href") !== "#";
    const available = Boolean(hasUrl && item.exists);
    const buildsOnDownload = key === "editingPackage" && item.status === "build-required";
    element.setAttribute("aria-disabled", available ? "false" : "true");
    element.classList.toggle("is-unavailable", !available);
    element.dataset.downloadStatus = item.status || (available ? "ready" : "missing");
    element.title = available
      ? buildsOnDownload ? "按下後會先整理剪輯包，完成後再下載。" : "已確認檔案可下載"
      : "檔案尚未產生或已被移除，請重新產生。";
    if (note) note.textContent = available
      ? buildsOnDownload ? "按下後整理剪輯包" : element.dataset.defaultNote
      : "檔案需要重新產生";
  }
}

async function validateDownloadLinks(data) {
  if (!data?.id) return;
  try {
    const response = await fetch(`/api/projects/${data.id}/downloads`, { cache: "no-store" });
    if (!response.ok) return;
    const payload = await response.json();
    const downloads = Array.isArray(payload.downloads) ? payload.downloads : [];
    downloads.forEach((item) => updateDownloadAvailability(item));
  } catch {
    // 下載檢查失敗不阻擋結果顯示，使用者點擊時仍會收到提示。
  }
}

function pptSlideElements() {
  return [...(pptSlides?.querySelectorAll(".ppt-slide") || [])];
}

function selectPptSlide(index, { open = false, focus = false } = {}) {
  const slides = pptSlideElements();
  if (!slides.length) return;
  const nextIndex = clampNumber(index, 0, slides.length - 1);
  selectedPptSlideIndex = nextIndex;
  slides.forEach((slide, slideIndex) => {
    const selected = slideIndex === nextIndex;
    slide.classList.toggle("is-selected", selected);
    slide.setAttribute("aria-selected", selected ? "true" : "false");
    slide.tabIndex = selected ? 0 : -1;
  });
  const slide = slides[nextIndex];
  slide.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  if (focus) slide.focus({ preventScroll: true });
  if (open) openPptLightbox(nextIndex);
}

function openPptLightbox(index = selectedPptSlideIndex) {
  if (!pptLightbox || !pptLightboxImage || !pptLightboxTitle) return;
  const slides = pptSlideElements();
  if (!slides.length) return;
  selectPptSlide(index);
  const slide = slides[selectedPptSlideIndex];
  const image = slide.querySelector("img");
  const label = slide.querySelector("span")?.textContent || `投影片 ${String(selectedPptSlideIndex + 1).padStart(2, "0")}`;
  pptLightboxImage.src = image?.src || slide.dataset.previewUrl || slide.href || "";
  pptLightboxImage.alt = image?.alt || `${label} 預覽`;
  pptLightboxTitle.textContent = `${label} / ${slides.length}`;
  pptLightbox.classList.remove("hidden");
  document.body.classList.add("ppt-lightbox-active");
  pptLightboxClose?.focus({ preventScroll: true });
}

function closePptLightbox() {
  if (!pptLightbox) return;
  pptLightbox.classList.add("hidden");
  document.body.classList.remove("ppt-lightbox-active");
  const slides = pptSlideElements();
  slides[selectedPptSlideIndex]?.focus({ preventScroll: true });
}

function movePptSlide(direction, { open = !pptLightbox?.classList.contains("hidden") } = {}) {
  const slides = pptSlideElements();
  if (!slides.length) return;
  const current = selectedPptSlideIndex >= 0 ? selectedPptSlideIndex : 0;
  const nextIndex = clampNumber(current + (Number(direction) < 0 ? -1 : 1), 0, slides.length - 1);
  selectPptSlide(nextIndex, { focus: !open });
  if (open) openPptLightbox(nextIndex);
}

function renderPptPreview(urls = []) {
  pptSlides.replaceChildren();
  selectedPptSlideIndex = -1;
  closePptLightbox();
  const previewVersion = Date.now().toString(36);
  urls.forEach((url, index) => {
    const previewUrl = `${url}${url.includes("?") ? "&" : "?"}v=${previewVersion}`;
    const link = document.createElement("a");
    link.className = "ppt-slide";
    link.href = url;
    link.dataset.previewUrl = previewUrl;
    link.dataset.slideIndex = String(index);
    link.setAttribute("role", "option");
    link.setAttribute("aria-selected", "false");
    link.tabIndex = index === 0 ? 0 : -1;
    const image = document.createElement("img");
    image.src = previewUrl;
    image.alt = `PowerPoint 第 ${index + 1} 頁預覽`;
    image.loading = index < 3 ? "eager" : "lazy";
    image.addEventListener("load", () => updateRailButtons("ppt-slides"), { once: true });
    const label = document.createElement("span");
    label.textContent = `投影片 ${String(index + 1).padStart(2, "0")}`;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      selectPptSlide(index, { open: true });
    });
    link.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectPptSlide(index, { open: true });
        return;
      }
      if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) {
        event.preventDefault();
        selectPptSlide(index + (event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1), { focus: true });
      }
    });
    link.append(image, label);
    pptSlides.append(link);
  });
  if (urls.length) selectPptSlide(0);
  scheduleRailButtonUpdate("ppt-slides");
}

function updateRailButtons(targetId) {
  const rail = document.getElementById(targetId);
  if (!rail) return;
  const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
  const left = rail.scrollLeft;
  const buttons = [...document.querySelectorAll(`[data-rail-target="${targetId}"]`)];
  const controls = new Set(buttons.map((button) => button.closest(".rail-controls")).filter(Boolean));
  controls.forEach((control) => control.classList.toggle("is-inactive", maxScroll <= 4));
  buttons.forEach((button) => {
    const direction = Number(button.dataset.railDirection) || 1;
    const isAtEdge = maxScroll <= 4 || (direction < 0 ? left <= 4 : left >= maxScroll - 4);
    button.disabled = false;
    button.setAttribute("aria-disabled", isAtEdge ? "true" : "false");
    button.classList.toggle("is-edge", isAtEdge);
  });
}

function scheduleRailButtonUpdate(targetId) {
  requestAnimationFrame(() => {
    updateRailButtons(targetId);
    requestAnimationFrame(() => updateRailButtons(targetId));
  });
}

function scrollRail(targetId, direction) {
  const rail = document.getElementById(targetId);
  if (!rail) return;
  const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
  if (maxScroll <= 4) {
    updateRailButtons(targetId);
    return;
  }
  const current = rail.scrollLeft;
  const moveDirection = Number(direction) < 0 ? -1 : 1;
  const card = rail.querySelector(":scope > *");
  const cardWidth = card ? card.getBoundingClientRect().width : 0;
  const amount = Math.max(220, Math.min(rail.clientWidth * 0.86, cardWidth ? cardWidth + 14 : rail.clientWidth));
  const targetLeft = Math.max(0, Math.min(maxScroll, current + amount * moveDirection));
  if (Math.abs(targetLeft - current) < 2) {
    updateRailButtons(targetId);
    return;
  }
  rail.scrollTo({ left: targetLeft, behavior: "smooth" });
  setTimeout(() => {
    if (Math.abs(rail.scrollLeft - current) < 2) rail.scrollLeft = targetLeft;
    updateRailButtons(targetId);
  }, 320);
}

function waitForMediaEvent(video, eventName, timeoutMs = 2500) {
  return new Promise((resolve) => {
    let timeout;
    const done = () => {
      clearTimeout(timeout);
      video.removeEventListener(eventName, done);
      resolve();
    };
    video.addEventListener(eventName, done, { once: true });
    timeout = setTimeout(done, timeoutMs);
  });
}

async function playMediaAt(video, seconds, { seekingContainer = null } = {}) {
  if (!video?.src) return;
  if (video.readyState < 1) await waitForMediaEvent(video, "loadedmetadata");
  const target = clampNumber(seconds, 0, Number(video.duration) || Number.MAX_SAFE_INTEGER);
  const wasPlaying = !video.paused && !video.ended;
  showPreviewFreezeFrame(video);
  seekingContainer?.classList.add("is-seeking");
  try {
    if (Math.abs((video.currentTime || 0) - target) > 0.04) {
      video.currentTime = target;
      await waitForMediaEvent(video, "seeked");
    }
    if (wasPlaying || video.paused) await video.play();
  } catch {
    // 瀏覽器阻擋程式播放時仍保留正確定位，交由使用者按播放。
  } finally {
    seekingContainer?.classList.remove("is-seeking");
    hidePreviewFreezeFrameAfterPaint(video);
  }
}

function previewFrameForVideo(video) {
  const frame = video?.closest(".roughcut-player-frame, .subtitle-player-frame, .final-output");
  if (!frame) return null;
  let canvas = frame.querySelector(".video-freeze-frame");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.className = "video-freeze-frame";
    canvas.setAttribute("aria-hidden", "true");
    video.insertAdjacentElement("afterend", canvas);
  }
  return canvas;
}

function previewFallbackImageForVideo(video) {
  const frame = video?.closest(".roughcut-player-frame, .subtitle-player-frame, .final-output");
  if (!frame) return null;
  let image = frame.querySelector(".video-fallback-frame");
  if (!image) {
    image = document.createElement("img");
    image.className = "video-fallback-frame";
    image.alt = "";
    image.setAttribute("aria-hidden", "true");
    video.insertAdjacentElement("afterend", image);
  }
  return image;
}

function setPreviewFallbackImage(video, url) {
  if (!video || !url) return;
  previewFallbackUrls.set(video, url);
  video.poster = url;
  const image = previewFallbackImageForVideo(video);
  if (image && image.src !== url) image.src = url;
}

function showPreviewFallbackWhileLoading(video) {
  const frame = video?.closest(".roughcut-player-frame, .subtitle-player-frame, .final-output");
  if (!frame) return;
  const fallbackUrl = previewFallbackUrls.get(video) || video.poster || "";
  if (fallbackUrl) {
    const image = previewFallbackImageForVideo(video);
    if (image && image.src !== fallbackUrl) image.src = fallbackUrl;
  }
  frame.classList.toggle("is-loading-preview", Boolean(fallbackUrl));
}

function hidePreviewFallbackWhenFrameReady(video) {
  const frame = video?.closest(".roughcut-player-frame, .subtitle-player-frame, .final-output");
  if (!frame || video?.readyState < 2) return;
  if (videoFrameLooksInvalid(video)) return;
  rememberPreviewStableFrame(video);
  frame.classList.remove("is-loading-preview");
}

function videoFrameStats(video) {
  if (!video || video.readyState < 2 || !video.videoWidth || !video.videoHeight) return null;
  const sample = document.createElement("canvas");
  sample.width = 32;
  sample.height = 18;
  const context = sample.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  try {
    context.drawImage(video, 0, 0, sample.width, sample.height);
    const data = context.getImageData(0, 0, sample.width, sample.height).data;
    let sum = 0;
    let sumSquares = 0;
    let darkPixels = 0;
    let brightPixels = 0;
    for (let index = 0; index < data.length; index += 4) {
      const luminance = (data[index] * 0.2126) + (data[index + 1] * 0.7152) + (data[index + 2] * 0.0722);
      sum += luminance;
      sumSquares += luminance * luminance;
      if (luminance < 28) darkPixels += 1;
      if (luminance > 238) brightPixels += 1;
    }
    const count = data.length / 4;
    const average = sum / count;
    const variance = Math.max(0, (sumSquares / count) - (average * average));
    return {
      average,
      standardDeviation: Math.sqrt(variance),
      darkRatio: darkPixels / count,
      brightRatio: brightPixels / count
    };
  } catch {
    return null;
  }
}

function videoFrameLooksInvalid(video) {
  const stats = videoFrameStats(video);
  if (!stats) return false;
  const { average, standardDeviation, darkRatio, brightRatio } = stats;
  return (
    (average > 238 && standardDeviation < 14 && brightRatio > 0.92)
    || (average < 22 && standardDeviation < 10 && darkRatio > 0.92)
  );
}

function videoFrameLooksBlank(video) {
  return videoFrameLooksInvalid(video);
}

function rememberPreviewStableFrame(video) {
  if (!video || video.seeking || video.readyState < 2 || !video.videoWidth || !video.videoHeight) return;
  if (videoFrameLooksBlank(video)) return;
  const width = video.videoWidth;
  const height = video.videoHeight;
  let snapshot = previewStableFrames.get(video);
  if (!snapshot) {
    snapshot = document.createElement("canvas");
    previewStableFrames.set(video, snapshot);
  }
  if (snapshot.width !== width) snapshot.width = width;
  if (snapshot.height !== height) snapshot.height = height;
  try {
    snapshot.getContext("2d")?.drawImage(video, 0, 0, width, height);
  } catch {
    // 某些瀏覽器在硬體解碼切換時不允許複製畫面；保留上一張穩定畫面。
  }
}

function showPreviewFreezeFrame(video) {
  if (!video) return;
  const frame = video.closest(".roughcut-player-frame, .subtitle-player-frame, .final-output");
  const canvas = previewFrameForVideo(video);
  if (!frame || !canvas) return;
  const nextToken = (previewFreezeTokens.get(video) || 0) + 1;
  previewFreezeTokens.set(video, nextToken);
  const stableFrame = previewStableFrames.get(video);
  const fallbackUrl = previewFallbackUrls.get(video) || video.poster || "";
  const fallbackImage = previewFallbackImageForVideo(video);
  if (fallbackImage) {
    if (fallbackUrl && fallbackImage.src !== fallbackUrl) fallbackImage.src = fallbackUrl;
    fallbackImage.style.opacity = fallbackUrl && !stableFrame ? "1" : "";
  }
  const width = stableFrame?.width || video.videoWidth || canvas.width || 16;
  const height = stableFrame?.height || video.videoHeight || canvas.height || 9;
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  try {
    const context = canvas.getContext("2d");
    if (!context) return;
    context.fillStyle = "#050508";
    context.fillRect(0, 0, width, height);
    if (stableFrame?.width && stableFrame?.height) {
      context.drawImage(stableFrame, 0, 0, width, height);
      canvas.style.opacity = "1";
    } else if (!video.seeking && video.readyState >= 2 && video.videoWidth && video.videoHeight) {
      context.drawImage(video, 0, 0, width, height);
      canvas.style.opacity = videoFrameLooksInvalid(video) && fallbackUrl ? "0" : "1";
    } else if (fallbackUrl) {
      canvas.style.opacity = "0";
    } else {
      canvas.style.opacity = "1";
    }
  } catch {
    // 跨平台影片解碼偶爾會拒絕 drawImage；保留黑底即可，至少不要露白。
  }
  frame.classList.add("is-freezing-frame");
}

function hidePreviewFreezeFrameAfterPaint(video) {
  if (!video) return;
  const frame = video.closest(".roughcut-player-frame, .subtitle-player-frame, .final-output");
  const canvas = frame?.querySelector(".video-freeze-frame");
  if (!frame) return;
  const freezeToken = previewFreezeTokens.get(video) || 0;
  let released = false;
  const startedAt = Date.now();
  let stableDecodedFrames = 0;
  const minimumHoldMs = 220;
  const maxHoldMs = 5200;
  const release = () => {
    if (released) return;
    if ((previewFreezeTokens.get(video) || 0) !== freezeToken) return;
    released = true;
    frame.classList.remove("is-freezing-frame");
    if (canvas) canvas.style.opacity = "";
    const fallbackImage = frame.querySelector(".video-fallback-frame");
    if (fallbackImage) fallbackImage.style.opacity = "";
  };
  const releaseAfterDecodedFrame = () => {
    if ((previewFreezeTokens.get(video) || 0) !== freezeToken) return;
    const elapsed = Date.now() - startedAt;
    if (video.seeking || video.readyState < 2) {
      window.setTimeout(releaseAfterDecodedFrame, 80);
      return;
    }
    const invalidFrame = videoFrameLooksInvalid(video);
    if (invalidFrame && elapsed < maxHoldMs) {
      stableDecodedFrames = 0;
      window.setTimeout(releaseAfterDecodedFrame, 90);
      return;
    }
    if (!invalidFrame) {
      rememberPreviewStableFrame(video);
      stableDecodedFrames += 1;
    }
    if (elapsed < minimumHoldMs || (!invalidFrame && stableDecodedFrames < 3 && elapsed < 1100)) {
      window.setTimeout(releaseAfterDecodedFrame, 70);
      return;
    }
    if (invalidFrame && previewStableFrames.has(video) && elapsed < maxHoldMs * 1.5) {
      window.setTimeout(releaseAfterDecodedFrame, 140);
      return;
    }
    release();
  };
  if (typeof video.requestVideoFrameCallback === "function" && !video.ended) {
    video.requestVideoFrameCallback(() => requestAnimationFrame(releaseAfterDecodedFrame));
    window.setTimeout(releaseAfterDecodedFrame, 900);
    return;
  }
  window.setTimeout(releaseAfterDecodedFrame, 360);
}

function guardPreviewAgainstBlankFrame(video) {
  if (!video || video.seeking || video.readyState < 2) return false;
  if (!videoFrameLooksInvalid(video)) {
    rememberPreviewStableFrame(video);
    return false;
  }
  if (!previewStableFrames.has(video) && !(previewFallbackUrls.get(video) || video.poster)) return false;
  showPreviewFreezeFrame(video);
  recoverInvalidPreviewFrame(video);
  hidePreviewFreezeFrameAfterPaint(video);
  return true;
}

function recoverInvalidPreviewFrame(video) {
  if (!video || video.paused || video.ended || video.seeking) return;
  const now = Date.now();
  const state = previewInvalidRecoveries.get(video) || { lastAt: 0, count: 0 };
  if (now - state.lastAt < 420) return;
  const duration = Number(video.duration) || 0;
  const currentTime = Number(video.currentTime) || 0;
  if (!duration || currentTime >= duration - 0.12) return;
  const resetCount = now - state.lastAt > 3000;
  state.lastAt = now;
  state.count = resetCount ? 1 : Math.min(5, state.count + 1);
  previewInvalidRecoveries.set(video, state);
  const nudge = state.count >= 3 ? 0.12 : 0.045;
  try {
    video.currentTime = clampNumber(currentTime + nudge, 0, Math.max(0, duration - 0.03));
  } catch {
    // 瀏覽器偶爾拒絕播放中微調；保留 fallback 畫面，下一幀再試。
  }
}

function previewSourceBaseUrl(video) {
  return video?.dataset?.previewBaseUrl || video?.dataset?.sourceUrl || "";
}

function stopPreviewPlaybackMonitor(video) {
  const state = previewPlaybackMonitorStates.get(video);
  if (state?.timer) clearInterval(state.timer);
  previewPlaybackMonitorStates.delete(video);
}

function reloadPreviewVideoSource(video, { play = false, reason = "stalled-playback" } = {}) {
  if (!video) return false;
  const canReloadSource = reason === "media-error" || Boolean(video.error);
  // 換 video.src 會觸發瀏覽器重建 media pipeline；在播放/跳剪中太容易造成整個頁面閃一下。
  // 所以只把它留給真正 media error，不拿來修一般 seek / decode 暫停。
  if (!canReloadSource) return false;
  const baseUrl = previewSourceBaseUrl(video);
  if (!baseUrl) return false;
  const now = Date.now();
  const recovery = previewPlaybackRecoveryStates.get(video) || { lastAt: 0, count: 0 };
  if (now - recovery.lastAt < 2400) return false;
  const resetCount = now - recovery.lastAt > 8000;
  recovery.lastAt = now;
  recovery.count = resetCount ? 1 : Math.min(8, (recovery.count || 0) + 1);
  previewPlaybackRecoveryStates.set(video, recovery);
  const target = clampNumber(Number(video.currentTime) || 0, 0, Number(video.duration) || Number.MAX_SAFE_INTEGER);
  const volume = video.volume;
  const muted = video.muted;
  const playbackRate = video.playbackRate;
  const token = `${MEDIA_PREVIEW_CACHE_BUST}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  showPreviewFreezeFrame(video);
  previewRecoveryResumeIntents.set(video, Boolean(play));
  try {
    video.pause();
    video.src = cacheBustedPreviewUrl(baseUrl, token);
    video.load();
    video.volume = volume;
    video.muted = muted;
    video.playbackRate = playbackRate;
  } catch {
    hidePreviewFreezeFrameAfterPaint(video);
    return false;
  }
  const restore = async () => {
    try {
      if (video.readyState < 1) await waitForMediaEvent(video, "loadedmetadata", 2200);
      const duration = Number(video.duration) || 0;
      const safeTarget = duration ? clampNumber(target, 0, Math.max(0, duration - 0.05)) : target;
      if (Math.abs((video.currentTime || 0) - safeTarget) > 0.08) {
        video.currentTime = safeTarget;
        await waitForMediaEvent(video, "seeked", 2200);
      }
      if (play && !video.ended) {
        try {
          await video.play();
        } catch (error) {
          video.muted = true;
          await video.play();
          requestAnimationFrame(() => {
            video.muted = muted;
          });
          console.warn(`預覽恢復播放改用靜音啟動後還原音量：${error?.message || error}`);
        }
      }
    } catch (error) {
      console.warn(`預覽播放管線恢復失敗 (${reason})：${error?.message || error}`);
    } finally {
      previewRecoveryResumeIntents.delete(video);
      hidePreviewFreezeFrameAfterPaint(video);
    }
  };
  restore();
  return true;
}

function startPreviewPlaybackMonitor(video, {
  onTick = null,
  onRecovered = null
} = {}) {
  if (!video) return;
  stopPreviewPlaybackMonitor(video);
  const state = {
    lastTime: Number(video.currentTime) || 0,
    lastAdvancedAt: Date.now(),
    lastReadyState: video.readyState || 0,
    timer: null
  };
  const tick = () => {
    if (!video || video.paused || video.ended) {
      stopPreviewPlaybackMonitor(video);
      return;
    }
    const now = Date.now();
    const currentTime = Number(video.currentTime) || 0;
    const advanced = currentTime > state.lastTime + 0.035;
    if (advanced) {
      state.lastTime = currentTime;
      state.lastAdvancedAt = now;
    }
    state.lastReadyState = video.readyState || 0;
    const invalidVisibleFrame = video.readyState >= 2 && videoFrameLooksInvalid(video);
    const lowReadyState = video.readyState < 2;
    const stalledAge = now - state.lastAdvancedAt;
    const stalledTooLong = stalledAge > (lowReadyState ? 260 : 1300);
    if (lowReadyState || invalidVisibleFrame || stalledTooLong) {
      showPreviewFreezeFrame(video);
    } else {
      rememberPreviewStableFrame(video);
      if (video.closest(".roughcut-player-frame, .subtitle-player-frame, .final-output")?.classList.contains("is-freezing-frame")) {
        hidePreviewFreezeFrameAfterPaint(video);
      }
    }
    if (invalidVisibleFrame) {
      recoverInvalidPreviewFrame(video);
      state.lastAdvancedAt = now;
    }
    if (video.error && stalledAge > 3600) {
      const recovered = reloadPreviewVideoSource(video, {
        play: true,
        reason: "media-error"
      });
      if (recovered) {
        state.lastAdvancedAt = now;
        onRecovered?.();
      }
    }
    onTick?.();
  };
  state.timer = setInterval(tick, 80);
  previewPlaybackMonitorStates.set(video, state);
  tick();
}

function seekToTime(seconds, label) {
  playMediaAt(finalVideo, Math.max(0, Number(seconds) || 0), { seekingContainer: finalOutput });
  finalOutput.scrollIntoView({ behavior: "smooth", block: "center" });
  showToast(`已跳到 ${label}。`);
}

function seekToBroll(item) {
  seekToTime(item.startSeconds, `${item.timecode} 的 B-roll`);
}

function seekToSlideCue(item) {
  const cueTime = Number.isFinite(Number(item.slideCueStartSeconds))
    ? Number(item.slideCueStartSeconds)
    : Math.max(0, Number(item.startSeconds) - 4);
  seekToTime(cueTime, `${formatTimelineSeconds(cueTime)} 的 PPT 切入點`);
}

function secondsFromDurationLabel(value) {
  const match = String(value || "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 4;
}

function formatTimelineSeconds(seconds) {
  const safe = Math.max(0, Math.round(Number(seconds) || 0));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

function formatEditableSeconds(seconds) {
  const value = Number(seconds);
  return Number.isFinite(value) ? Math.max(0, value).toFixed(2) : "0.00";
}

function enableTimelineDragScroll(element, { ignoreSelector = "" } = {}) {
  if (!element) return;
  let activePointerId = null;
  let startX = 0;
  let startScrollLeft = 0;
  let lastScrollLeft = 0;
  let lastMoveAt = 0;
  let velocity = 0;
  let moved = false;
  let suppressClickUntil = 0;
  let glideFrame = null;

  const stopGlide = () => {
    if (glideFrame !== null) cancelAnimationFrame(glideFrame);
    glideFrame = null;
  };

  const startGlide = () => {
    stopGlide();
    let previousAt = performance.now();
    const glide = (now) => {
      const elapsed = Math.min(32, Math.max(1, now - previousAt));
      previousAt = now;
      const before = element.scrollLeft;
      element.scrollLeft += velocity * elapsed;
      velocity *= Math.pow(0.92, elapsed / 16.67);
      const reachedEdge = Math.abs(element.scrollLeft - before) < 0.25;
      if (Math.abs(velocity) < 0.02 || reachedEdge) {
        glideFrame = null;
        return;
      }
      glideFrame = requestAnimationFrame(glide);
    };
    if (Math.abs(velocity) >= 0.02) glideFrame = requestAnimationFrame(glide);
  };

  element.addEventListener("pointerdown", (event) => {
    if ((event.button !== undefined && event.button !== 0) || activePointerId !== null) return;
    if (ignoreSelector && event.target.closest(ignoreSelector)) return;
    if (element.scrollWidth <= element.clientWidth + 1) return;
    stopGlide();
    activePointerId = event.pointerId;
    startX = event.clientX;
    startScrollLeft = element.scrollLeft;
    lastScrollLeft = element.scrollLeft;
    lastMoveAt = performance.now();
    velocity = 0;
    moved = false;
    element.classList.add("is-drag-scrolling");
    element.setPointerCapture?.(event.pointerId);
  });

  element.addEventListener("pointermove", (event) => {
    if (event.pointerId !== activePointerId) return;
    const deltaX = event.clientX - startX;
    if (!moved && Math.abs(deltaX) < 3) return;
    moved = true;
    event.preventDefault();
    element.scrollLeft = startScrollLeft - deltaX;
    const now = performance.now();
    const elapsed = Math.max(1, now - lastMoveAt);
    const instantaneousVelocity = (element.scrollLeft - lastScrollLeft) / elapsed;
    velocity = clampNumber((velocity * 0.62) + (instantaneousVelocity * 0.38), -2.4, 2.4);
    lastScrollLeft = element.scrollLeft;
    lastMoveAt = now;
  });

  const stopDragging = (event) => {
    if (event.pointerId !== activePointerId) return;
    const endedAt = performance.now();
    const shouldGlide = moved && event.type !== "pointercancel";
    if (moved) suppressClickUntil = endedAt + 250;
    if (endedAt - lastMoveAt > 90) velocity = 0;
    activePointerId = null;
    element.classList.remove("is-drag-scrolling");
    if (element.hasPointerCapture?.(event.pointerId)) element.releasePointerCapture(event.pointerId);
    if (shouldGlide) startGlide();
  };

  element.addEventListener("pointerup", stopDragging);
  element.addEventListener("pointercancel", stopDragging);
  element.addEventListener("wheel", stopGlide, { passive: true });
  element.addEventListener("click", (event) => {
    if (performance.now() >= suppressClickUntil) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);
}

function resizeSubtitleTextarea(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = `${Math.min(160, Math.max(64, textarea.scrollHeight))}px`;
}

function joinedSubtitleText(leftValue, rightValue) {
  const left = String(leftValue || "").replace(/\s+/g, " ").trim();
  const right = String(rightValue || "").replace(/\s+/g, " ").trim();
  if (!left) return right;
  if (!right) return left;
  const joinsCjkText = /[\u3400-\u9fff]$/.test(left) && /^[\u3400-\u9fff]/.test(right);
  return `${left}${joinsCjkText ? "" : " "}${right}`;
}

function subtitleCaptionRows() {
  return [...subtitleCaptionList.querySelectorAll(".subtitle-caption-row")];
}

function subtitleTimelineDuration() {
  const rowEnd = subtitleCaptionRows().reduce((maximum, row) => (
    Math.max(maximum, Number(row.querySelector(".subtitle-end")?.value) || 0)
  ), 0);
  return Math.max(0.1, Number(activeProject?.subtitleReview?.durationSeconds) || Number(subtitleReviewVideo?.duration) || rowEnd);
}

function subtitleRowById(rowId) {
  return subtitleCaptionRows().find((row) => row.dataset.id === String(rowId));
}

function subtitleTimelineTrack() {
  return subtitleTimeline?.querySelector(".subtitle-timeline-track") || null;
}

function subtitleBlockForRow(row) {
  return [...(subtitleTimelineTrack()?.querySelectorAll(".subtitle-timeline-block") || [])]
    .find((block) => block.dataset.rowId === row?.dataset.id);
}

function subtitleRowIsEnabled(row) {
  return row?.dataset.enabled !== "false";
}

function updateSubtitleReviewMeta() {
  if (!subtitleReviewMeta) return;
  const rows = subtitleCaptionRows();
  const activeCount = rows.filter(subtitleRowIsEnabled).length;
  const bypassedCount = rows.length - activeCount;
  const duration = Number(subtitleReviewMeta.dataset.durationSeconds) || subtitleTimelineDuration();
  const sourceFilename = subtitleReviewMeta.dataset.sourceFilename || activeProject?.sourceFilename || activeProject?.filename || activeProject?.title || "未命名素材";
  const fragment = document.createDocumentFragment();
  const summaryItems = [
    ["顯示字幕", `${activeCount} 句`],
    ["隱藏字幕", `${bypassedCount} 句`],
    ["片長", formatTimelineSeconds(duration)],
    ["檔名", sourceFilename]
  ];
  for (const [label, value] of summaryItems) {
    const item = document.createElement("div");
    const name = document.createElement("span");
    const output = document.createElement("strong");
    item.className = "subtitle-summary-item";
    if (label === "檔名") item.classList.add("subtitle-summary-item-filename");
    name.textContent = label;
    output.textContent = value;
    item.append(name, output);
    fragment.append(item);
  }
  subtitleReviewMeta.replaceChildren(fragment);
}

function updateSubtitlePreviewCaption(seconds = subtitleReviewVideo?.currentTime || 0) {
  if (!subtitlePreviewCaption) return;
  const time = Number(seconds) || 0;
  const activeTexts = subtitleCaptionRows()
    .filter(subtitleRowIsEnabled)
    .filter((row) => {
      const start = Number(row.querySelector(".subtitle-start")?.value) || 0;
      const end = Number(row.querySelector(".subtitle-end")?.value) || start;
      return time >= start && time <= end;
    })
    .map((row) => row.querySelector(".subtitle-text")?.value.trim())
    .filter(Boolean);
  const text = activeTexts.join("　");
  const hasManualBreak = /\n/.test(text);
  subtitlePreviewCaption.textContent = text;
  subtitlePreviewCaption.classList.toggle("is-empty", !text);
  subtitlePreviewCaption.classList.toggle("has-manual-break", hasManualBreak);
}

function normalizeEditedCaptionText(value = "") {
  return String(value)
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[^\S\n]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeSubtitleCaptionForBurn(row, index, rows) {
  if (!subtitleRowIsEnabled(row)) return null;
  const textInput = row.querySelector(".subtitle-text");
  const startInput = row.querySelector(".subtitle-start");
  const endInput = row.querySelector(".subtitle-end");
  const text = normalizeEditedCaptionText(textInput?.value || "");
  if (!text) return null;

  const minimumDuration = 0.08;
  const timelineDuration = subtitleTimelineDuration();
  let start = Number(startInput?.value);
  let end = Number(endInput?.value);
  if (!Number.isFinite(start)) start = 0;
  start = clampNumber(start, 0, Math.max(0, timelineDuration));

  if (!Number.isFinite(end) || end <= start) {
    const nextStart = rows.slice(index + 1)
      .map((nextRow) => Number(nextRow.querySelector(".subtitle-start")?.value))
      .find((value) => Number.isFinite(value) && value > start + minimumDuration);
    end = Number.isFinite(nextStart)
      ? Math.max(start + minimumDuration, nextStart - 0.01)
      : start + 0.8;
  }

  if (Number.isFinite(timelineDuration) && timelineDuration > start + minimumDuration) {
    end = Math.min(end, timelineDuration);
  }
  if (end <= start) end = start + minimumDuration;

  if (startInput && startInput.value !== formatEditableSeconds(start)) {
    startInput.value = formatEditableSeconds(start);
  }
  if (endInput && endInput.value !== formatEditableSeconds(end)) {
    endInput.value = formatEditableSeconds(end);
  }

  return {
    id: Number(row.dataset.id) || index + 1,
    sourceCaptionId: Number(row.dataset.sourceCaptionId) || undefined,
    start,
    end,
    text
  };
}

function setSubtitleSegmentInspectorOpen(open, row = null) {
  if (!subtitleSegmentInspector) return;
  subtitleSegmentInspector.hidden = !open;
  subtitleSegmentInspector.dataset.rowId = open && row ? row.dataset.id : "";
  const toolbar = subtitleTimelineTrack()?.querySelector(".subtitle-segment-toolbar");
  const toolbarRow = subtitleRowById(toolbar?.dataset.rowId || "");
  if (toolbar && toolbarRow) updateSubtitleSegmentToolbar(toolbar, toolbarRow);
}

function updateSubtitleSegmentInspector(row) {
  if (!subtitleSegmentInspector || !row) return;
  const start = Number(row.querySelector(".subtitle-start")?.value) || 0;
  const end = Number(row.querySelector(".subtitle-end")?.value) || start;
  const enabled = subtitleRowIsEnabled(row);
  const text = row.querySelector(".subtitle-text")?.value || "";
  subtitleSegmentInspector.dataset.rowId = row.dataset.id;
  if (subtitleInspectorStatus) {
    subtitleInspectorStatus.textContent = enabled ? "會顯示" : "已隱藏";
    subtitleInspectorStatus.classList.toggle("is-bypassed", !enabled);
  }
  if (subtitleInspectorStart) {
    subtitleInspectorStart.max = String(subtitleTimelineDuration());
    subtitleInspectorStart.value = formatEditableSeconds(start);
  }
  if (subtitleInspectorEnd) {
    subtitleInspectorEnd.max = String(subtitleTimelineDuration());
    subtitleInspectorEnd.value = formatEditableSeconds(end);
  }
  if (subtitleInspectorDuration) subtitleInspectorDuration.textContent = `${Math.max(0, end - start).toFixed(2)} 秒`;
  if (subtitleInspectorText && subtitleInspectorText.value !== text) subtitleInspectorText.value = text;
  if (subtitleInspectorMerge) {
    const rows = subtitleCaptionRows();
    subtitleInspectorMerge.disabled = rows.indexOf(row) === rows.length - 1;
  }
  updateSubtitleCaptionActions();
}

function toggleSubtitleSegmentInspector(row) {
  if (!subtitleSegmentInspector || !row) return;
  const isSameOpen = !subtitleSegmentInspector.hidden && subtitleSegmentInspector.dataset.rowId === row.dataset.id;
  if (isSameOpen) {
    setSubtitleSegmentInspectorOpen(false);
    return;
  }
  updateSubtitleSegmentInspector(row);
  setSubtitleSegmentInspectorOpen(true, row);
}

function updateSubtitleSegmentToolbar(toolbar, row) {
  if (!toolbar || !row) return;
  const enabled = subtitleRowIsEnabled(row);
  const details = toolbar.querySelector(".subtitle-toolbar-details");
  const bypass = toolbar.querySelector(".subtitle-toolbar-bypass");
  const detailsOpen = Boolean(
    subtitleSegmentInspector
    && !subtitleSegmentInspector.hidden
    && subtitleSegmentInspector.dataset.rowId === row.dataset.id
  );
  if (details) {
    details.classList.toggle("is-active", detailsOpen);
    details.setAttribute("aria-expanded", String(detailsOpen));
  }
  if (bypass) {
    const label = enabled ? "隱藏" : "取消隱藏";
    bypass.classList.toggle("is-active", !enabled);
    bypass.setAttribute("aria-pressed", String(!enabled));
    bypass.ariaLabel = label;
    bypass.dataset.tooltip = label;
  }
}

function positionSubtitleSegmentToolbar(block, row) {
  const track = subtitleTimelineTrack();
  const toolbar = track?.querySelector(".subtitle-segment-toolbar");
  if (!track || !toolbar || !block || !row) return;
  toolbar.dataset.rowId = row.dataset.id;
  toolbar.hidden = false;
  updateSubtitleSegmentToolbar(toolbar, row);
  const halfWidth = Math.max(56, toolbar.offsetWidth / 2);
  const edgeAllowance = Math.max(8, halfWidth - SUBTITLE_TIMELINE_GUTTER + 8);
  const center = block.offsetLeft + (block.offsetWidth / 2);
  toolbar.style.left = `${clampNumber(center, edgeAllowance, Math.max(edgeAllowance, track.clientWidth - edgeAllowance))}px`;
  toolbar.style.top = `${Math.max(42, block.offsetTop - 44)}px`;
}

function selectSubtitleSegment(block, row) {
  const track = subtitleTimelineTrack();
  if (!track || !block || !row) return;
  selectedSubtitleRowId = row.dataset.id;
  track.querySelectorAll(".subtitle-timeline-block").forEach((item) => item.classList.toggle("is-selected", item === block));
  track.querySelectorAll(".subtitle-sound-segment").forEach((item) => item.classList.toggle("is-selected", item.dataset.rowId === row.dataset.id));
  positionSubtitleSegmentToolbar(block, row);
  if (subtitleSegmentInspector && !subtitleSegmentInspector.hidden) {
    updateSubtitleSegmentInspector(row);
    setSubtitleSegmentInspectorOpen(true, row);
  }
}

function clearSubtitleSegmentSelection() {
  selectedSubtitleRowId = "";
  const track = subtitleTimelineTrack();
  track?.querySelectorAll(".subtitle-timeline-block.is-selected").forEach((block) => block.classList.remove("is-selected"));
  track?.querySelectorAll(".subtitle-sound-segment.is-selected").forEach((block) => block.classList.remove("is-selected"));
  const toolbar = track?.querySelector(".subtitle-segment-toolbar");
  if (toolbar) {
    toolbar.hidden = true;
    toolbar.dataset.rowId = "";
  }
  setSubtitleSegmentInspectorOpen(false);
}

function setSubtitleRowEnabled(row, enabled) {
  if (!row) return;
  row.dataset.enabled = enabled ? "true" : "false";
  row.classList.toggle("is-bypassed", !enabled);
  const block = subtitleBlockForRow(row);
  block?.classList.toggle("is-bypassed", !enabled);
  const toolbar = subtitleTimelineTrack()?.querySelector(".subtitle-segment-toolbar");
  if (toolbar?.dataset.rowId === row.dataset.id) updateSubtitleSegmentToolbar(toolbar, row);
  if (subtitleSegmentInspector?.dataset.rowId === row.dataset.id) updateSubtitleSegmentInspector(row);
  updateSubtitleReviewMeta();
  updateSubtitlePreviewCaption();
}

function toggleSubtitleSegmentBypass(row) {
  if (!row) return;
  commitSubtitleTextUndoSnapshot();
  pushSubtitleUndoSnapshot("切換字幕顯示前");
  const enabled = subtitleRowIsEnabled(row);
  setSubtitleRowEnabled(row, !enabled);
  const block = subtitleBlockForRow(row);
  if (block) selectSubtitleSegment(block, row);
  playMediaAt(subtitleReviewVideo, Math.max(0, Number(row.querySelector(".subtitle-start")?.value) || 0));
  showToast(enabled ? "已隱藏這句字幕，燒錄時會略過。" : "已取消隱藏這句字幕。 ");
}

function editSubtitleSegment(row) {
  if (!row) return;
  const block = subtitleBlockForRow(row);
  if (block) selectSubtitleSegment(block, row);
  setSubtitleSegmentInspectorOpen(true, row);
  requestAnimationFrame(() => {
    subtitleInspectorText?.focus();
    subtitleInspectorText?.select();
  });
}

function createSubtitleSegmentToolbar() {
  const toolbar = document.createElement("div");
  const details = document.createElement("button");
  const detailsIcon = document.createElement("span");
  const detailsLabel = document.createElement("span");
  const edit = document.createElement("button");
  const editIcon = document.createElement("span");
  const editLabel = document.createElement("span");
  const bypass = document.createElement("button");
  const eye = document.createElement("span");
  const bypassLabel = document.createElement("span");
  const remove = document.createElement("button");
  const removeIcon = document.createElement("span");
  const removeLabel = document.createElement("span");
  toolbar.className = "subtitle-segment-toolbar roughcut-segment-toolbar";
  toolbar.hidden = true;
  toolbar.setAttribute("role", "toolbar");
  toolbar.setAttribute("aria-label", "字幕工具");
  details.type = "button";
  details.className = "roughcut-toolbar-button roughcut-toolbar-details subtitle-toolbar-details";
  details.ariaLabel = "相關資訊";
  details.dataset.tooltip = "相關資訊";
  details.setAttribute("aria-expanded", "false");
  detailsIcon.className = "roughcut-info-icon";
  detailsIcon.setAttribute("aria-hidden", "true");
  detailsLabel.className = "toolbar-label";
  detailsLabel.textContent = "資訊";
  details.append(detailsIcon, detailsLabel);
  edit.type = "button";
  edit.className = "roughcut-toolbar-button roughcut-toolbar-edit subtitle-toolbar-edit";
  edit.ariaLabel = "修改字幕";
  edit.dataset.tooltip = "修改";
  editIcon.className = "roughcut-pencil-icon";
  editIcon.setAttribute("aria-hidden", "true");
  editLabel.className = "toolbar-label";
  editLabel.textContent = "修改";
  edit.append(editIcon, editLabel);
  bypass.type = "button";
  bypass.className = "roughcut-toolbar-button roughcut-toolbar-bypass subtitle-toolbar-bypass";
  bypass.ariaLabel = "隱藏";
  bypass.dataset.tooltip = "隱藏";
  eye.className = "roughcut-eye-off-icon";
  eye.setAttribute("aria-hidden", "true");
  bypassLabel.className = "toolbar-label";
  bypassLabel.textContent = "隱藏";
  bypass.append(eye, bypassLabel);
  remove.type = "button";
  remove.className = "roughcut-toolbar-button roughcut-toolbar-delete subtitle-toolbar-delete";
  remove.ariaLabel = "刪除字幕";
  remove.dataset.tooltip = "刪除";
  removeIcon.className = "roughcut-trash-icon";
  removeIcon.setAttribute("aria-hidden", "true");
  removeLabel.className = "toolbar-label";
  removeLabel.textContent = "刪除";
  remove.append(removeIcon, removeLabel);
  toolbar.append(details, edit, bypass, remove);
  toolbar.addEventListener("pointerdown", (event) => event.stopPropagation());
  toolbar.addEventListener("click", (event) => event.stopPropagation());
  details.addEventListener("click", () => toggleSubtitleSegmentInspector(subtitleRowById(toolbar.dataset.rowId)));
  edit.addEventListener("click", () => editSubtitleSegment(subtitleRowById(toolbar.dataset.rowId)));
  bypass.addEventListener("click", () => toggleSubtitleSegmentBypass(subtitleRowById(toolbar.dataset.rowId)));
  remove.addEventListener("click", () => deleteSubtitleRow(subtitleRowById(toolbar.dataset.rowId)));
  return toolbar;
}

function subtitleRowTimeRange(row) {
  const start = Number(row?.querySelector(".subtitle-start")?.value) || 0;
  const end = Number(row?.querySelector(".subtitle-end")?.value) || start;
  return { start, end };
}

function subtitleTimelineMediaAssets() {
  const subtitleReview = activeProject?.subtitleReview || {};
  const roughCutReview = activeProject?.roughCutReview || {};
  return {
    thumbnailUrls: Array.isArray(subtitleReview.thumbnailUrls) && subtitleReview.thumbnailUrls.length
      ? subtitleReview.thumbnailUrls.filter(Boolean)
      : Array.isArray(roughCutReview.thumbnailUrls) ? roughCutReview.thumbnailUrls.filter(Boolean) : [],
    waveformPeaks: Array.isArray(subtitleReview.waveformPeaks) && subtitleReview.waveformPeaks.length
      ? subtitleReview.waveformPeaks
      : Array.isArray(roughCutReview.waveformPeaks) ? roughCutReview.waveformPeaks : []
  };
}

function renderSubtitleFilmstrip(filmstrip, contentWidth) {
  if (!filmstrip) return;
  const cellCount = Math.max(1, Math.min(240, Math.ceil(contentWidth / ROUGH_CUT_THUMBNAIL_WIDTH)));
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < cellCount; index += 1) {
    if (subtitleTimelineThumbnailUrls.length) {
      const sourceIndex = Math.min(
        subtitleTimelineThumbnailUrls.length - 1,
        Math.floor(((index + 0.5) / cellCount) * subtitleTimelineThumbnailUrls.length)
      );
      const image = document.createElement("img");
      image.src = subtitleTimelineThumbnailUrls[sourceIndex];
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      fragment.append(image);
    } else {
      const placeholder = document.createElement("span");
      placeholder.textContent = "素材";
      fragment.append(placeholder);
    }
  }
  filmstrip.replaceChildren(fragment);
}

function renderSubtitleWaveformBars(bars, contentWidth) {
  if (!bars) return;
  bars.replaceChildren();
  if (!subtitleTimelineWaveformPeaks.length) {
    const unavailable = document.createElement("p");
    unavailable.className = "roughcut-waveform-unavailable";
    unavailable.textContent = "音軌參考";
    bars.append(unavailable);
    return;
  }
  const barCount = Math.max(48, Math.min(ROUGH_CUT_WAVEFORM_MAX_BARS, Math.ceil(contentWidth / ROUGH_CUT_WAVEFORM_BAR_STEP)));
  const displayPeaks = resampleRoughCutPeaks(subtitleTimelineWaveformPeaks, barCount);
  const fragment = document.createDocumentFragment();
  for (const peak of displayPeaks) {
    const bar = document.createElement("i");
    bar.style.height = `${waveformBarHeightPercent(peak, subtitleVolumeGain)}%`;
    fragment.append(bar);
  }
  bars.append(fragment);
}

function renderSubtitleTimeline({ preserveScroll = true } = {}) {
  if (!subtitleTimeline) return;
  const previousScrollLeft = preserveScroll ? subtitleTimeline.scrollLeft : 0;
  const duration = subtitleTimelineDuration();
  const pixelsPerSecond = SUBTITLE_TIMELINE_PIXELS_PER_SECOND * subtitleTimelineZoom;
  const contentWidth = Math.max(720, Math.ceil(duration * pixelsPerSecond));
  const assets = subtitleTimelineMediaAssets();
  const track = document.createElement("div");
  const ruler = document.createElement("div");
  const videoLane = document.createElement("div");
  const audioLane = document.createElement("div");
  const captionLane = document.createElement("div");
  const soundRegions = document.createElement("div");
  const videoLabel = document.createElement("span");
  const audioLabel = document.createElement("span");
  const captionLabel = document.createElement("span");
  const filmstrip = document.createElement("div");
  const bars = document.createElement("div");
  const playhead = document.createElement("span");
  track.className = "subtitle-timeline-track";
  track.style.width = `${contentWidth + SUBTITLE_TIMELINE_GUTTER}px`;
  track.dataset.duration = String(duration);
  track.dataset.pixelsPerSecond = String(pixelsPerSecond);
  subtitleTimelineThumbnailUrls = assets.thumbnailUrls;
  subtitleTimelineWaveformPeaks = assets.waveformPeaks;
  ruler.className = "subtitle-time-ruler";
  const tickCount = Math.min(16, Math.max(4, Math.ceil(duration / 30)));
  for (let index = 0; index <= tickCount; index += 1) {
    const tick = document.createElement("span");
    const seconds = (duration / tickCount) * index;
    tick.style.left = `${SUBTITLE_TIMELINE_GUTTER + (seconds * pixelsPerSecond)}px`;
    tick.textContent = formatTimelineSeconds(seconds);
    ruler.append(tick);
  }
  videoLane.className = "subtitle-video-lane";
  audioLane.className = "subtitle-audio-lane";
  captionLane.className = "subtitle-timeline-lane";
  for (const lane of [videoLane, audioLane, captionLane]) {
    lane.style.left = `${SUBTITLE_TIMELINE_GUTTER}px`;
    lane.style.width = `${contentWidth}px`;
  }
  subtitleTimeline.onclick = (event) => {
    if (event.target.closest(".subtitle-timeline-block")) return;
    if (event.target.closest(".subtitle-segment-toolbar")) return;
    if (event.target.closest(".subtitle-playhead")) return;
    const bounds = captionLane.getBoundingClientRect();
    const seconds = clampNumber((event.clientX - bounds.left) / pixelsPerSecond, 0, duration);
    seekSubtitlePreview(seconds, { keepPlaying: subtitlePreviewIsActivelyPlaying(), keepVisible: false });
    clearSubtitleSegmentSelection();
  };
  videoLabel.className = "subtitle-track-label subtitle-track-label-video";
  audioLabel.className = "subtitle-track-label subtitle-track-label-audio";
  captionLabel.className = "subtitle-track-label subtitle-track-label-caption";
  videoLabel.textContent = "素材";
  audioLabel.textContent = "聲音";
  captionLabel.textContent = "字幕";
  filmstrip.className = "subtitle-video-strip roughcut-video-strip";
  bars.className = "subtitle-waveform-bars roughcut-waveform-bars";
  soundRegions.className = "subtitle-audio-sound-regions roughcut-audio-sound-regions";
  const soundBase = document.createElement("span");
  soundBase.className = "subtitle-sound-continuous roughcut-sound-segment";
  soundBase.setAttribute("aria-hidden", "true");
  soundRegions.append(soundBase);
  const gainLine = createAudioGainLine({
    className: "subtitle-audio-gain-line",
    getGain: () => subtitleVolumeGain,
    setGain: (gain) => setSubtitleVolumeGain(gain),
    label: "字幕輸出影片音量"
  });
  videoLane.append(filmstrip);
  audioLane.append(soundRegions, bars, gainLine);
  playhead.className = "subtitle-playhead";
  playhead.dataset.time = "0:00";
  playhead.style.left = `${SUBTITLE_TIMELINE_GUTTER}px`;
  enablePlayheadDrag(playhead, {
    lock: () => { subtitlePlayheadDragLocked = true; },
    unlock: () => { subtitlePlayheadDragLocked = false; },
    timeFromEvent: pointerTimeOnSubtitleTimeline,
    seek: seekSubtitlePreview,
    wasPlaying: subtitlePreviewIsActivelyPlaying,
    resume: () => resumeSubtitlePreviewAfterSeek({ force: true })
  });
  track.append(ruler, videoLane, audioLane, captionLane, videoLabel, audioLabel, captionLabel, playhead, createSubtitleSegmentToolbar());
  renderSubtitleFilmstrip(filmstrip, contentWidth);
  renderSubtitleWaveformBars(bars, contentWidth);
  for (const row of subtitleCaptionRows()) {
    const { start, end } = subtitleRowTimeRange(row);
    const text = row.querySelector(".subtitle-text")?.value.trim() || "";
    const block = document.createElement("button");
    block.type = "button";
    block.className = "subtitle-timeline-block";
    block.classList.toggle("is-empty", !text);
    block.dataset.rowId = row.dataset.id;
    block.classList.toggle("is-bypassed", !subtitleRowIsEnabled(row));
    block.style.left = `${SUBTITLE_TIMELINE_GUTTER + (start * pixelsPerSecond)}px`;
    block.style.width = `${Math.max(8, (end - start) * pixelsPerSecond)}px`;
    block.title = `${formatTimelineSeconds(start)} - ${formatTimelineSeconds(end)}\n${text}`;
    const content = document.createElement("span");
    content.textContent = text;
    block.append(content);
    block.addEventListener("click", (event) => {
      event.stopPropagation();
      playMediaAt(subtitleReviewVideo, start);
      selectSubtitleSegment(block, row);
    });
    track.append(block);
  }
  subtitleTimeline.replaceChildren(track);
  subtitleTimeline.scrollLeft = Math.min(previousScrollLeft, Math.max(0, track.scrollWidth - subtitleTimeline.clientWidth));
  if (selectedSubtitleRowId) {
    const selectedRow = subtitleRowById(selectedSubtitleRowId);
    const selectedBlock = selectedRow ? subtitleBlockForRow(selectedRow) : null;
    if (selectedRow && selectedBlock) selectSubtitleSegment(selectedBlock, selectedRow);
    else clearSubtitleSegmentSelection();
  }
  updateSubtitlePlayhead(subtitleReviewVideo?.currentTime || 0);
  updateSubtitlePreviewCaption();
}

function updateSubtitlePlayhead(seconds, { keepVisible = false } = {}) {
  const track = subtitleTimelineTrack();
  const playhead = track?.querySelector(".subtitle-playhead");
  updateSubtitlePreviewCaption(seconds);
  if (!track || !playhead) return;
  const duration = Number(track.dataset.duration) || subtitleTimelineDuration();
  const pixelsPerSecond = Number(track.dataset.pixelsPerSecond) || SUBTITLE_TIMELINE_PIXELS_PER_SECOND;
  const time = clampNumber(seconds, 0, duration);
  const left = SUBTITLE_TIMELINE_GUTTER + (time * pixelsPerSecond);
  playhead.style.left = `${left}px`;
  playhead.dataset.time = formatTimelineSeconds(time);
  if (keepVisible) keepTimelinePositionVisible(subtitleTimeline, left);
}

function setSubtitleZoom(value) {
  subtitleTimelineZoom = clampNumber(value, 0.5, 8);
  if (subtitleZoom) subtitleZoom.value = String(subtitleTimelineZoom);
  if (subtitleZoomLabel) subtitleZoomLabel.textContent = `${subtitleTimelineZoom.toFixed(1)}x`;
  renderSubtitleTimeline();
}

function setSubtitleFontScale(value) {
  subtitleFontSizePtValue = Math.round(clampNumber(value, 27, 55));
  subtitleFontScaleValue = clampNumber(subtitleFontSizePtValue / SUBTITLE_BASE_FONT_PT, 0.7, 1.4);
  if (subtitleFontScale) subtitleFontScale.value = String(subtitleFontSizePtValue);
  subtitlePreviewCaption?.style.setProperty("--subtitle-preview-scale", subtitleFontScaleValue.toFixed(2));
}

function setSubtitleVolumeGain(value, { rerender = true } = {}) {
  subtitleVolumeGain = clampAudioGain(value);
  if (subtitleVolume) subtitleVolume.value = String(subtitleVolumeGain);
  if (subtitleVolumeLabel) subtitleVolumeLabel.textContent = `${formatAudioGain(subtitleVolumeGain)} / ${formatAudioGainDb(subtitleVolumeGain)}`;
  applyPreviewVideoGain(subtitleReviewVideo, subtitleVolumeGain);
  subtitleTimeline?.querySelector(".subtitle-audio-gain-line")?.syncAudioGain?.();
  if (rerender) {
    const track = subtitleTimelineTrack();
    const bars = track?.querySelector(".subtitle-waveform-bars");
    const contentWidth = Math.max(720, Number(track?.dataset.duration || 0) * Number(track?.dataset.pixelsPerSecond || SUBTITLE_TIMELINE_PIXELS_PER_SECOND));
    renderSubtitleWaveformBars(bars, contentWidth);
  }
}

function createSubtitleSnapshot(label = "字幕修改") {
  return {
    label,
    selectedRowId: selectedSubtitleRowId || subtitleSegmentInspector?.dataset.rowId || "",
    captions: subtitleCaptionRows().map((row) => ({
      id: row.dataset.id,
      sourceCaptionId: row.dataset.sourceCaptionId || "",
      enabled: subtitleRowIsEnabled(row),
      start: Number(row.querySelector(".subtitle-start")?.value) || 0,
      end: Number(row.querySelector(".subtitle-end")?.value) || 0,
      text: row.querySelector(".subtitle-text")?.value || ""
    }))
  };
}

function updateSubtitleHistoryButtons() {
  if (subtitleUndoButton) subtitleUndoButton.disabled = !subtitleUndoStack.length;
  if (subtitleRedoButton) subtitleRedoButton.disabled = !subtitleRedoStack.length;
}

function pushSubtitleUndoSnapshot(label = "字幕修改") {
  subtitleUndoStack.push(createSubtitleSnapshot(label));
  subtitleRedoStack = [];
  updateSubtitleHistoryButtons();
}

function subtitleSnapshotHasChanged(snapshot) {
  if (!snapshot?.captions) return false;
  return snapshot.captions.some((item) => {
    const row = subtitleRowById(item.id);
    if (!row) return true;
    return item.text !== (row.querySelector(".subtitle-text")?.value || "")
      || Number(item.start) !== (Number(row.querySelector(".subtitle-start")?.value) || 0)
      || Number(item.end) !== (Number(row.querySelector(".subtitle-end")?.value) || 0)
      || Boolean(item.enabled) !== subtitleRowIsEnabled(row);
  });
}

function commitSubtitleTextUndoSnapshot() {
  if (subtitleTextInputUndoSnapshot && subtitleSnapshotHasChanged(subtitleTextInputUndoSnapshot)) {
    subtitleUndoStack.push(subtitleTextInputUndoSnapshot);
    subtitleRedoStack = [];
    updateSubtitleHistoryButtons();
  }
  subtitleTextInputUndoSnapshot = null;
}

function createSubtitleCaptionRowFromSnapshot(caption, index = 0) {
  const row = document.createElement("div");
  const seek = document.createElement("button");
  const start = document.createElement("input");
  const end = document.createElement("input");
  const text = document.createElement("textarea");
  const actions = document.createElement("div");
  const merge = document.createElement("button");
  const remove = document.createElement("button");
  row.className = "subtitle-caption-row";
  row.dataset.id = String(caption.id || index + 1);
  if (caption.sourceCaptionId) row.dataset.sourceCaptionId = String(caption.sourceCaptionId);
  row.dataset.enabled = caption.enabled === false ? "false" : "true";
  row.classList.toggle("is-bypassed", caption.enabled === false);
  seek.type = "button";
  seek.className = "subtitle-seek";
  seek.title = "播放這句字幕";
  seek.innerHTML = `<span>播放</span><small>${formatTimelineSeconds(caption.start)}</small>`;
  seek.addEventListener("click", () => playMediaAt(subtitleReviewVideo, Math.max(0, Number(caption.start) || 0)));
  start.className = "subtitle-start";
  start.type = "number";
  start.min = "0";
  start.step = "0.01";
  start.value = formatEditableSeconds(caption.start);
  start.ariaLabel = "字幕開始秒數";
  start.title = "字幕開始出現的秒數";
  start.addEventListener("focus", () => {
    subtitleTextInputUndoSnapshot = createSubtitleSnapshot("調整字幕時間前");
  });
  start.addEventListener("change", () => renderSubtitleTimeline());
  start.addEventListener("blur", commitSubtitleTextUndoSnapshot);
  end.className = "subtitle-end";
  end.type = "number";
  end.min = "0";
  end.step = "0.01";
  end.value = formatEditableSeconds(caption.end);
  end.ariaLabel = "字幕結束秒數";
  end.title = "字幕結束消失的秒數";
  end.addEventListener("focus", () => {
    subtitleTextInputUndoSnapshot = createSubtitleSnapshot("調整字幕時間前");
  });
  end.addEventListener("change", () => renderSubtitleTimeline());
  end.addEventListener("blur", commitSubtitleTextUndoSnapshot);
  text.className = "subtitle-text";
  text.rows = 2;
  text.spellcheck = false;
  text.value = caption.text || "";
  text.ariaLabel = "字幕文字";
  text.addEventListener("focus", () => {
    subtitleTextInputUndoSnapshot = createSubtitleSnapshot("修改字幕文字前");
  });
  text.addEventListener("input", () => {
    resizeSubtitleTextarea(text);
    renderSubtitleTimeline();
  });
  text.addEventListener("blur", () => {
    commitSubtitleTextUndoSnapshot();
  });
  requestAnimationFrame(() => resizeSubtitleTextarea(text));
  actions.className = "subtitle-row-actions";
  merge.type = "button";
  merge.className = "subtitle-row-action subtitle-merge-next";
  merge.textContent = "合併下一句";
  merge.addEventListener("click", () => mergeSubtitleRowWithNext(row));
  remove.type = "button";
  remove.className = "subtitle-row-action subtitle-delete";
  remove.textContent = "刪除";
  remove.title = "刪除這句字幕";
  remove.addEventListener("click", () => deleteSubtitleRow(row));
  actions.append(merge, remove);
  row.append(seek, start, end, text, actions);
  return row;
}

function applySubtitleSnapshot(snapshot) {
  if (!Array.isArray(snapshot?.captions)) return;
  subtitleTextInputUndoSnapshot = null;
  subtitleCaptionList.replaceChildren(...snapshot.captions.map(createSubtitleCaptionRowFromSnapshot));
  selectedSubtitleRowId = snapshot.selectedRowId || "";
  updateSubtitleCaptionActions();
  renderSubtitleTimeline({ preserveScroll: false });
  const selectedRow = subtitleRowById(selectedSubtitleRowId);
  if (selectedRow) {
    updateSubtitleSegmentInspector(selectedRow);
    setSubtitleSegmentInspectorOpen(true, selectedRow);
  } else {
    setSubtitleSegmentInspectorOpen(false);
  }
  updateSubtitlePreviewCaption();
}

function undoSubtitleTimelineStep() {
  const snapshot = subtitleUndoStack.pop();
  if (!snapshot) return;
  subtitleRedoStack.push(createSubtitleSnapshot("重做字幕修改"));
  applySubtitleSnapshot(snapshot);
  updateSubtitleHistoryButtons();
  showToast("已復原上一個字幕修改。");
}

function redoSubtitleTimelineStep() {
  const snapshot = subtitleRedoStack.pop();
  if (!snapshot) return;
  subtitleUndoStack.push(createSubtitleSnapshot("復原字幕修改"));
  applySubtitleSnapshot(snapshot);
  updateSubtitleHistoryButtons();
  showToast("已重做字幕修改。");
}

function syncSubtitleInspectorFields(changedField = "start") {
  const row = subtitleRowById(subtitleSegmentInspector?.dataset.rowId || "");
  if (!row || !subtitleInspectorStart || !subtitleInspectorEnd) return;
  pushSubtitleUndoSnapshot("調整字幕時間前");
  const duration = subtitleTimelineDuration();
  const minimumGap = 0.06;
  let start = clampNumber(subtitleInspectorStart.value, 0, duration);
  let end = clampNumber(subtitleInspectorEnd.value, 0, duration);
  if (changedField === "start" && start > end - minimumGap) end = Math.min(duration, start + minimumGap);
  if (changedField === "end" && end < start + minimumGap) start = Math.max(0, end - minimumGap);
  if (end <= start) end = Math.min(duration, start + minimumGap);
  row.querySelector(".subtitle-start").value = formatEditableSeconds(start);
  row.querySelector(".subtitle-end").value = formatEditableSeconds(end);
  updateSubtitleSegmentInspector(row);
  renderSubtitleTimeline();
  updateSubtitlePreviewCaption(changedField === "end" ? end : start);
  playMediaAt(subtitleReviewVideo, changedField === "end" ? end : start);
}

function updateSubtitleCaptionActions() {
  const rows = subtitleCaptionRows();
  rows.forEach((row, index) => {
    const mergeButton = row.querySelector(".subtitle-merge-next");
    if (!mergeButton) return;
    mergeButton.disabled = index === rows.length - 1;
    mergeButton.title = mergeButton.disabled ? "最後一句沒有下一句可合併" : "合併這句與下一句字幕";
  });
  updateSubtitleHistoryButtons();
  updateSubtitleReviewMeta();
}

function mergeSubtitleRowWithNext(row) {
  const rows = subtitleCaptionRows();
  const index = rows.indexOf(row);
  const nextRow = rows[index + 1];
  if (!nextRow) return;
  const end = row.querySelector(".subtitle-end");
  const text = row.querySelector(".subtitle-text");
  const nextEnd = nextRow.querySelector(".subtitle-end");
  const nextText = nextRow.querySelector(".subtitle-text");
  if (!end || !text || !nextEnd || !nextText) return;
  commitSubtitleTextUndoSnapshot();
  pushSubtitleUndoSnapshot("合併字幕前");
  end.value = nextEnd.value;
  text.value = joinedSubtitleText(text.value, nextText.value);
  nextRow.remove();
  resizeSubtitleTextarea(text);
  updateSubtitleCaptionActions();
  selectedSubtitleRowId = row.dataset.id;
  renderSubtitleTimeline();
  updateSubtitleSegmentInspector(row);
  showToast("已與下一句字幕合併。");
}

function deleteSubtitleRow(row) {
  if (!row) return;
  commitSubtitleTextUndoSnapshot();
  pushSubtitleUndoSnapshot("刪除字幕前");
  const rows = subtitleCaptionRows();
  const index = rows.indexOf(row);
  const nextRow = rows[index + 1] || rows[index - 1] || null;
  const wasSelected = selectedSubtitleRowId === row.dataset.id;
  row.remove();
  if (wasSelected) selectedSubtitleRowId = nextRow?.dataset.id || "";
  updateSubtitleCaptionActions();
  renderSubtitleTimeline();
  if (!nextRow) setSubtitleSegmentInspectorOpen(false);
  showToast("已刪除這句字幕。");
}

function roughCutReasonLabel(range) {
  const labels = {
    long_pause: "長停頓",
    filler_word: "口癖詞",
    stutter_word: "結巴重複",
    filler_segment: "口癖段落",
    false_start: "語句不順",
    repeated_take: "重講片段",
    rambling_loop: "鬼打牆重複",
    manual_mute: "手動刪除",
    manual_roughcut: "人工確認"
  };
  const reasons = Array.isArray(range?.reasons) && range.reasons.length
    ? range.reasons
    : [range?.reason || labels[range?.source] || "粗剪建議"];
  return reasons.map((reason) => labels[reason] || reason).join("、");
}

function setRoughCutReviewOpen(open) {
  roughCutReviewModal?.classList.toggle("hidden", !open);
  document.body.classList.toggle("roughcut-active", Boolean(open));
  if (open) {
    setProductStage("refine");
    hideResultOutputSections();
    results?.classList.add("hidden");
  }
  if (!open) {
    cancelRoughCutPreviewSkip();
    roughCutReviewVideo?.pause();
    stopRoughCutPlayheadTicker();
    setRoughCutSegmentInspectorOpen(false);
  }
}

function setSubtitleReviewOpen(open) {
  subtitleReviewModal?.classList.toggle("hidden", !open);
  document.body.classList.toggle("subtitle-active", Boolean(open));
  if (open) {
    setProductStage("refine");
    hideResultOutputSections();
    results?.classList.add("hidden");
  }
  if (!open) {
    subtitleReviewVideo?.pause();
    stopSubtitlePlayheadTicker();
  }
}

function createRoughCutTimelineSnapshot(label = "時間線調整") {
  return {
    label,
    removals: collectEditedRoughCutRemovals().map((range) => ({ ...range }))
  };
}

function updateRoughCutHistoryButtons() {
  if (roughCutUndoButton) roughCutUndoButton.disabled = roughCutUndoStack.length === 0;
  if (roughCutRedoButton) roughCutRedoButton.disabled = roughCutRedoStack.length === 0;
}

function pushRoughCutUndoSnapshot(snapshot) {
  if (roughCutIsApplyingUndo || !Array.isArray(snapshot?.removals)) return;
  const previous = roughCutUndoStack.at(-1);
  if (previous && JSON.stringify(previous.removals) === JSON.stringify(snapshot.removals)) return;
  roughCutUndoStack.push(snapshot);
  roughCutRedoStack = [];
  if (roughCutUndoStack.length > 40) roughCutUndoStack.shift();
  updateRoughCutHistoryButtons();
}

function prepareRoughCutControlUndo(control, label) {
  if (!control || control.dataset.undoSnapshot) return;
  control.dataset.undoSnapshot = JSON.stringify(createRoughCutTimelineSnapshot(label));
  control.dataset.undoCommitted = "";
}

function commitRoughCutControlUndo(control) {
  if (!control?.dataset.undoSnapshot || control.dataset.undoCommitted === "true") return;
  pushRoughCutUndoSnapshot(JSON.parse(control.dataset.undoSnapshot));
  control.dataset.undoCommitted = "true";
}

function clearRoughCutControlUndo(control) {
  if (!control) return;
  delete control.dataset.undoSnapshot;
  delete control.dataset.undoCommitted;
}

function applyRoughCutTimelineSnapshot(snapshot) {
  if (!Array.isArray(snapshot?.removals)) return;
  roughCutIsApplyingUndo = true;
  renderRoughCutRemovalRows(snapshot.removals);
  roughCutIsApplyingUndo = false;
  updateRoughCutWaveformSegments();
  updateRoughCutMeta();
  updateRoughCutPlayhead(roughCutReviewVideo?.currentTime || 0, { keepVisible: true });
}

function undoRoughCutTimelineStep() {
  const snapshot = roughCutUndoStack.pop();
  if (!snapshot) return;
  roughCutRedoStack.push(createRoughCutTimelineSnapshot("重做粗剪修改"));
  applyRoughCutTimelineSnapshot(snapshot);
  updateRoughCutHistoryButtons();
  showToast("已復原上一個粗剪時間線調整。");
}

function redoRoughCutTimelineStep() {
  const snapshot = roughCutRedoStack.pop();
  if (!snapshot) return;
  roughCutUndoStack.push(createRoughCutTimelineSnapshot("復原粗剪修改"));
  applyRoughCutTimelineSnapshot(snapshot);
  updateRoughCutHistoryButtons();
  showToast("已重做粗剪時間線調整。");
}

function roughCutTotalDuration() {
  return Math.max(1, Number(roughCutWaveform?.dataset.duration) || activeProject?.roughCutReview?.durationSeconds || activeProject?.durationSeconds || 1);
}

function updateRoughCutMeta() {
  const duration = roughCutTotalDuration();
  const removals = collectEditedRoughCutRemovals();
  const activeRemovals = removals.filter((range) => range.enabled !== false);
  const keptCount = removals.length - activeRemovals.length;
  const removedSeconds = activeRemovals.reduce((sum, range) => sum + Math.max(0, range.end - range.start), 0);
  const outputSeconds = Math.max(0, duration - removedSeconds);
  const fragment = document.createDocumentFragment();
  const summaryItems = [
    ["刪除片段數量", `${activeRemovals.length} 段`],
    ["移除時間", formatDurationLabel(removedSeconds)],
    ["預估成片", formatDurationLabel(outputSeconds)],
    ["原片長度", formatTimelineSeconds(duration)]
  ];
  for (const [label, value] of summaryItems) {
    const item = document.createElement("div");
    const name = document.createElement("span");
    const output = document.createElement("strong");
    item.className = "roughcut-summary-item";
    name.textContent = label;
    output.textContent = value;
    item.append(name, output);
    fragment.append(item);
  }
  if (keptCount) {
    const note = document.createElement("p");
    note.className = "roughcut-summary-note";
    note.textContent = `${keptCount} 個刪除滑塊已隱藏`;
    fragment.append(note);
  }
  roughCutReviewMeta.replaceChildren(fragment);
  updateRoughCutPreviewControls();
}

function activeRoughCutRemovalRanges() {
  return collectEditedRoughCutRemovals()
    .filter((range) => range.enabled !== false)
    .filter((range) => Number.isFinite(range.start) && Number.isFinite(range.end) && range.end > range.start)
    .sort((left, right) => left.start - right.start);
}

function invalidateRoughCutRemovalRangeCache() {
  roughCutMergedRemovalCache = null;
}

function mergedActiveRoughCutRemovalRanges() {
  if (roughCutMergedRemovalCache) return roughCutMergedRemovalCache;
  const duration = roughCutTotalDuration();
  const merged = [];
  for (const range of activeRoughCutRemovalRanges()) {
    const start = clampNumber(range.start, 0, duration);
    const end = clampNumber(range.end, 0, duration);
    if (end <= start) continue;
    const previous = merged.at(-1);
    if (previous && start <= previous.end + 0.025) {
      previous.end = Math.max(previous.end, end);
    } else {
      merged.push({ start, end });
    }
  }
  roughCutMergedRemovalCache = merged;
  return roughCutMergedRemovalCache;
}

function roughCutEditedDuration() {
  const duration = roughCutTotalDuration();
  const removedSeconds = mergedActiveRoughCutRemovalRanges()
    .reduce((sum, range) => sum + Math.max(0, range.end - range.start), 0);
  return Math.max(0.01, duration - removedSeconds);
}

function sourceTimeToEditedTime(sourceTime) {
  const duration = roughCutTotalDuration();
  const sourceSeconds = clampNumber(sourceTime, 0, duration);
  let removedBefore = 0;
  for (const range of mergedActiveRoughCutRemovalRanges()) {
    if (sourceSeconds >= range.end) {
      removedBefore += range.end - range.start;
    } else if (sourceSeconds > range.start) {
      removedBefore += sourceSeconds - range.start;
      break;
    } else {
      break;
    }
  }
  return clampNumber(sourceSeconds - removedBefore, 0, roughCutEditedDuration());
}

function editedTimeToSourceTime(editedTime) {
  const duration = roughCutTotalDuration();
  const target = clampNumber(editedTime, 0, roughCutEditedDuration());
  let sourceCursor = 0;
  let editedCursor = 0;
  for (const range of mergedActiveRoughCutRemovalRanges()) {
    const keepLength = Math.max(0, range.start - sourceCursor);
    if (target <= editedCursor + keepLength) {
      return clampNumber(sourceCursor + (target - editedCursor), 0, duration);
    }
    editedCursor += keepLength;
    sourceCursor = Math.max(sourceCursor, range.end);
  }
  return clampNumber(sourceCursor + (target - editedCursor), 0, duration);
}

function roughCutReviewVideoUsesEditedTimeline() {
  const mediaDuration = Number(roughCutReviewVideo?.duration) || 0;
  const sourceDuration = roughCutTotalDuration();
  const editedDuration = roughCutEditedDuration();
  return mediaDuration > 0
    && editedDuration > 0
    && Math.abs(mediaDuration - editedDuration) + 0.35 < Math.abs(mediaDuration - sourceDuration);
}

function roughCutCurrentSourceTime(time = roughCutReviewVideo?.currentTime || 0) {
  const seconds = Number(time) || 0;
  return roughCutReviewVideoUsesEditedTimeline()
    ? editedTimeToSourceTime(seconds)
    : clampNumber(seconds, 0, roughCutTotalDuration());
}

function roughCutCurrentEditedTime(time = roughCutReviewVideo?.currentTime || 0) {
  const seconds = Number(time) || 0;
  return roughCutReviewVideoUsesEditedTimeline()
    ? clampNumber(seconds, 0, roughCutEditedDuration())
    : sourceTimeToEditedTime(seconds);
}

function updateRoughCutPreviewControls() {
  if (!roughCutPreviewScrub || !roughCutPreviewTime || !roughCutPreviewSourceTime) return;
  const sourceSeconds = roughCutCurrentSourceTime();
  const editedSeconds = roughCutCurrentEditedTime();
  const editedDuration = roughCutEditedDuration();
  roughCutPreviewScrub.max = String(editedDuration);
  roughCutPreviewScrub.value = String(clampNumber(editedSeconds, 0, editedDuration));
  roughCutPreviewTime.textContent = `預覽 ${formatTimelineSeconds(editedSeconds)} / ${formatTimelineSeconds(editedDuration)}`;
  roughCutPreviewSourceTime.textContent = `原片位置 ${formatTimelineSeconds(sourceSeconds)}`;
  if (roughCutPreviewPlay) {
    const isPlaying = Boolean(roughCutReviewVideo && !roughCutReviewVideo.paused && !roughCutReviewVideo.ended);
    roughCutPreviewPlay.textContent = isPlaying ? "暫停" : "播放";
    roughCutPreviewPlay.setAttribute("aria-label", isPlaying ? "暫停剪後預覽" : "播放剪後預覽");
  }
}

function seekRoughCutPreviewEdited(editedTime, { play = false, keepVisible = true } = {}) {
  const sourceSeconds = editedTimeToSourceTime(editedTime);
  seekRoughCutPreview(sourceSeconds, { play, keepVisible });
  updateRoughCutPreviewControls();
}

function markRoughCutPreviewPlaying() {
  roughCutPreviewLastPlayingAt = Date.now();
}

function roughCutPreviewWasPlayingIntent() {
  return Boolean(
    roughCutReviewVideo
    && !roughCutReviewVideo.ended
    && (!roughCutReviewVideo.paused || Date.now() - roughCutPreviewLastPlayingAt < 1200)
  );
}

function resumeRoughCutPreviewAfterSeek({ force = false } = {}) {
  if (!roughCutReviewVideo || roughCutReviewVideo.ended || (!force && !roughCutPreviewWasPlayingIntent())) return;
  applyPreviewVideoGain(roughCutReviewVideo, roughCutVolumeGain);
  roughCutReviewVideo.play()
    .then(() => {
      markRoughCutPreviewPlaying();
      startRoughCutPlayheadTicker();
      updateRoughCutPreviewControls();
    })
    .catch((error) => {
      console.warn(`粗剪預覽恢復播放失敗：${error?.message || error}`);
    });
}

function requestRoughCutPreviewResumeAfterSeek() {
  if (!roughCutPreviewWasPlayingIntent()) return;
  roughCutPreviewResumeSeekUntil = Date.now() + 2200;
}

function restoreRoughCutPreviewAfterSeekIfNeeded() {
  if (Date.now() > roughCutPreviewResumeSeekUntil) return false;
  requestAnimationFrame(resumeRoughCutPreviewAfterSeek);
  window.setTimeout(resumeRoughCutPreviewAfterSeek, 80);
  window.setTimeout(resumeRoughCutPreviewAfterSeek, 220);
  window.setTimeout(resumeRoughCutPreviewAfterSeek, 520);
  return true;
}

function settleAndRestoreRoughCutPreviewAfterSeek() {
  if (!roughCutPreviewSkipGuard) settleRoughCutNativeSeek({ keepVisible: true });
  restoreRoughCutPreviewAfterSeekIfNeeded();
}

function playRoughCutPreviewVideo() {
  if (!roughCutReviewVideo) return;
  const deletedRange = roughCutReviewVideoUsesEditedTimeline() ? null : roughCutRemovalAtTime(roughCutReviewVideo.currentTime || 0);
  if (deletedRange) {
    roughCutReviewVideo.currentTime = roughCutPlayableTimeAfter(deletedRange.end);
  }
  roughCutReviewVideo.play()
    .then(() => {
      markRoughCutPreviewPlaying();
      startRoughCutPlayheadTicker();
    })
    .catch((error) => {
      console.warn(`粗剪預覽播放失敗：${error?.message || error}`);
      cancelRoughCutPreviewSkip();
      stopRoughCutPlayheadTicker();
      updateRoughCutPreviewControls();
      showToast("預覽未能開始播放，請再按一次播放或拖曳時間軸重試。");
    });
}

function toggleRoughCutPreviewPlayback() {
  if (!roughCutReviewVideo) return;
  if (!roughCutReviewVideo.paused && !roughCutReviewVideo.ended) {
    roughCutReviewVideo.pause();
    updateRoughCutPreviewControls();
    return;
  }
  if (roughCutCurrentEditedTime(roughCutReviewVideo.currentTime || 0) >= roughCutEditedDuration() - 0.05) {
    if (roughCutReviewVideoUsesEditedTimeline()) {
      roughCutReviewVideo.currentTime = 0;
      updateRoughCutPlayhead(0, { keepVisible: true });
      updateRoughCutTranscriptPreviewPlayback(0, { forceScroll: true });
    } else {
      seekRoughCutPreviewEdited(0, { keepVisible: true });
    }
  }
  const deletedRange = roughCutReviewVideoUsesEditedTimeline() ? null : roughCutRemovalAtTime(roughCutReviewVideo.currentTime || 0);
  if (deletedRange) {
    roughCutReviewVideo.currentTime = roughCutPlayableTimeAfter(deletedRange.end);
  }
  updateRoughCutPreviewControls();
  playRoughCutPreviewVideo();
  updateRoughCutPreviewControls();
}

function togglePlainPreviewPlayback(video) {
  if (!video) return;
  if (!video.paused && !video.ended) {
    video.pause();
    return;
  }
  video.play().catch((error) => {
    console.warn(`預覽播放失敗：${error?.message || error}`);
    showToast("預覽未能開始播放，請再按一次空白鍵或點擊播放。");
  });
}

function isTypingInEditableField(target = document.activeElement) {
  if (!target) return false;
  const editable = target.closest?.("textarea, select, [contenteditable]:not([contenteditable=\"false\"])");
  if (editable) return true;
  const input = target.closest?.("input");
  if (!input) return false;
  const type = String(input.getAttribute("type") || "text").toLowerCase();
  return !["button", "checkbox", "radio", "range", "submit", "reset"].includes(type);
}

function handleEditorPreviewShortcut(event) {
  if (event.code !== "Space" && event.key !== " ") return;
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
  if (isTypingInEditableField(event.target)) return;
  if (document.body.classList.contains("roughcut-active")) {
    event.preventDefault();
    toggleRoughCutPreviewPlayback();
    return;
  }
  if (document.body.classList.contains("subtitle-active")) {
    event.preventDefault();
    togglePlainPreviewPlayback(subtitleReviewVideo);
  }
}

function roughCutRemovalAtTime(time) {
  const seconds = Number(time);
  if (!Number.isFinite(seconds)) return null;
  return mergedActiveRoughCutRemovalRanges().find((range) => (
    seconds >= range.start - 0.08
    && seconds < range.end - 0.025
  )) || null;
}

function roughCutPlayableTimeAfter(sourceTime, { padding = 0.18 } = {}) {
  const duration = roughCutTotalDuration();
  let nextTime = clampNumber(sourceTime, 0, duration);
  for (const range of mergedActiveRoughCutRemovalRanges()) {
    if (nextTime < range.start - 0.08) break;
    if (nextTime < range.end + padding) nextTime = clampNumber(range.end + padding, 0, duration);
  }
  return nextTime;
}

function setRoughCutPreviewSeeking(seeking) {
  const frame = roughCutReviewVideo?.closest(".roughcut-player-frame");
  frame?.classList.toggle("is-seeking", Boolean(seeking));
  if (seeking) {
    frame?.setAttribute("aria-busy", "true");
    showPreviewFreezeFrame(roughCutReviewVideo);
  } else {
    frame?.removeAttribute("aria-busy");
    hidePreviewFreezeFrameAfterPaint(roughCutReviewVideo);
  }
}

function cancelRoughCutPreviewSkip() {
  roughCutPreviewSkipCleanup?.();
  roughCutPreviewSkipCleanup = null;
  roughCutNativeSeekCleanup?.();
  roughCutNativeSeekCleanup = null;
  roughCutPreviewSkipGuard = false;
  setRoughCutPreviewSeeking(false);
}

function settleRoughCutNativeSeek({ keepVisible = true } = {}) {
  if (!roughCutReviewVideo || roughCutPreviewSkipGuard) return false;
  roughCutNativeSeekCleanup?.();
  roughCutNativeSeekCleanup = null;
  const range = roughCutRemovalAtTime(roughCutReviewVideo.currentTime || 0);
  if (range) {
    const shouldResume = !roughCutReviewVideo.paused && !roughCutReviewVideo.ended;
    seekRoughCutPreview(roughCutPlayableTimeAfter(range.end), { play: shouldResume, keepVisible });
    return true;
  }
  setRoughCutPreviewSeeking(false);
  updateRoughCutPlayhead(roughCutReviewVideo.currentTime || 0, { keepVisible });
  updateRoughCutPreviewControls();
  return false;
}

function scheduleRoughCutNativeSeekSettle() {
  if (!roughCutReviewVideo || roughCutPreviewSkipGuard) return;
  roughCutNativeSeekCleanup?.();
  const settleTimer = setTimeout(() => {
    if (!roughCutPreviewSkipGuard) settleRoughCutNativeSeek({ keepVisible: true });
  }, 900);
  roughCutNativeSeekCleanup = () => clearTimeout(settleTimer);
}

function updateRoughCutPreviewPlayback() {
  if (!roughCutReviewVideo || roughCutReviewVideo.paused || roughCutReviewVideo.ended || roughCutPreviewSkipGuard) return false;
  if (roughCutReviewVideoUsesEditedTimeline()) return false;
  const range = roughCutRemovalAtTime(roughCutReviewVideo.currentTime);
  if (!range) return false;
  roughCutPreviewSkipGuard = true;
  setRoughCutPreviewSeeking(true);
  const video = roughCutReviewVideo;
  const nextTime = roughCutPlayableTimeAfter(range.end);
  const shouldResume = !video.paused && !video.ended;
  let settled = false;
  let frameCallbackId = null;
  let frameFallback = null;
  const seekTimeout = setTimeout(() => finish(true), 1400);
  const settleEvents = ["seeked", "canplay", "playing", "timeupdate", "loadeddata"];

  const cleanup = () => {
    clearTimeout(seekTimeout);
    clearTimeout(frameFallback);
    settleEvents.forEach((eventName) => video.removeEventListener(eventName, handleSettled));
    video.removeEventListener("error", handleError);
    if (frameCallbackId !== null && typeof video.cancelVideoFrameCallback === "function") {
      video.cancelVideoFrameCallback(frameCallbackId);
    }
  };
  const finish = (timedOut = false) => {
    if (settled) return;
    settled = true;
    cleanup();
    if (roughCutPreviewSkipCleanup === cleanup) roughCutPreviewSkipCleanup = null;
    roughCutPreviewSkipGuard = false;
    setRoughCutPreviewSeeking(false);
    updateRoughCutPlayhead(video.currentTime || nextTime, { keepVisible: true });
    if (timedOut && video.seeking) {
      video.currentTime = roughCutPlayableTimeAfter(nextTime + 0.2);
    }
    if (shouldResume && video.paused && !video.ended) {
      playRoughCutPreviewVideo();
    }
  };
  const handleSettled = () => {
    if (typeof video.requestVideoFrameCallback === "function" && !video.paused) {
      frameCallbackId = video.requestVideoFrameCallback(() => finish());
      frameFallback = setTimeout(() => finish(), 260);
      return;
    }
    frameFallback = setTimeout(() => finish(), 60);
  };
  const handleError = () => {
    video.pause();
    finish();
  };

  roughCutPreviewSkipCleanup = cleanup;
  settleEvents.forEach((eventName) => video.addEventListener(eventName, handleSettled, { once: true }));
  video.addEventListener("error", handleError, { once: true });
  video.currentTime = nextTime;
  updateRoughCutPlayhead(nextTime, { keepVisible: true });
  updateRoughCutPreviewControls();
  return true;
}

function roughCutTimelineTrack() {
  return roughCutWaveform?.querySelector(".roughcut-waveform-track");
}

function roughCutTrackOffsetLeft() {
  const track = roughCutTimelineTrack();
  return track ? track.offsetLeft || 0 : 0;
}

function roughCutPlayhead() {
  return roughCutTimelineTrack()?.querySelector(".roughcut-playhead");
}

function updateRoughCutPlayhead(time = roughCutReviewVideo?.currentTime || 0, { keepVisible = false } = {}) {
  if (roughCutPlayheadDragLocked) return;
  const duration = roughCutTotalDuration();
  const playhead = roughCutPlayhead();
  if (!playhead || !Number.isFinite(Number(time))) return;
  const seconds = roughCutReviewVideoUsesEditedTimeline()
    ? editedTimeToSourceTime(time)
    : clampNumber(time, 0, duration);
  const editedSeconds = roughCutReviewVideoUsesEditedTimeline()
    ? clampNumber(time, 0, roughCutEditedDuration())
    : sourceTimeToEditedTime(seconds);
  playhead.style.left = `${(seconds / duration) * 100}%`;
  playhead.dataset.time = formatTimelineSeconds(seconds);
  playhead.classList.toggle("is-playing", Boolean(roughCutReviewVideo && !roughCutReviewVideo.paused && !roughCutReviewVideo.ended));
  playhead.setAttribute("aria-label", `剪後預覽位置 ${formatTimelineSeconds(editedSeconds)}，原片位置 ${formatTimelineSeconds(seconds)}`);
  updateRoughCutPreviewControls();
  if (keepVisible && roughCutWaveform) {
    const track = roughCutTimelineTrack();
    const left = roughCutTrackOffsetLeft() + ((seconds / duration) * (track?.offsetWidth || 0));
    keepTimelinePositionVisible(roughCutWaveform, left, { marginRatio: 0.22, minMargin: 90, maxMargin: 120 });
  }
}

function stopRoughCutPlayheadTicker() {
  if (roughCutPlayheadFrame) cancelAnimationFrame(roughCutPlayheadFrame);
  roughCutPlayheadFrame = null;
}

function stopSubtitlePlayheadTicker() {
  if (subtitlePlayheadFrame) cancelAnimationFrame(subtitlePlayheadFrame);
  subtitlePlayheadFrame = null;
}

function startSubtitlePlayheadTicker() {
  stopSubtitlePlayheadTicker();
  const tick = () => {
    updateSubtitlePlayhead(subtitleReviewVideo?.currentTime || 0, { keepVisible: true });
    if (subtitleReviewVideo && !subtitleReviewVideo.paused && !subtitleReviewVideo.ended) {
      subtitlePlayheadFrame = requestAnimationFrame(tick);
    } else {
      subtitlePlayheadFrame = null;
    }
  };
  subtitlePlayheadFrame = requestAnimationFrame(tick);
}

function startRoughCutPlayheadTicker() {
  stopRoughCutPlayheadTicker();
  const tick = () => {
    updateRoughCutPreviewPlayback();
    updateRoughCutPlayhead(roughCutReviewVideo?.currentTime || 0, { keepVisible: true });
    if (roughCutReviewVideo && !roughCutReviewVideo.paused && !roughCutReviewVideo.ended) {
      roughCutPlayheadFrame = requestAnimationFrame(tick);
    } else {
      roughCutPlayheadFrame = null;
    }
  };
  roughCutPlayheadFrame = requestAnimationFrame(tick);
}

function seekRoughCutPreview(time, { play = false, keepVisible = true } = {}) {
  if (!roughCutReviewVideo) return;
  cancelRoughCutPreviewSkip();
  const requestedSeconds = clampNumber(time, 0, roughCutTotalDuration());
  const usesEditedTimeline = roughCutReviewVideoUsesEditedTimeline();
  const deletedRange = usesEditedTimeline ? null : roughCutRemovalAtTime(requestedSeconds);
  const sourceSeconds = deletedRange ? roughCutPlayableTimeAfter(deletedRange.end) : requestedSeconds;
  const mediaSeconds = usesEditedTimeline ? sourceTimeToEditedTime(sourceSeconds) : sourceSeconds;
  setRoughCutPreviewSeeking(true);
  if (!play && !roughCutReviewVideo.paused) roughCutReviewVideo.pause();
  roughCutReviewVideo.currentTime = mediaSeconds;
  updateRoughCutPlayhead(mediaSeconds, { keepVisible });
  updateRoughCutTranscriptPreviewPlayback(mediaSeconds, { forceScroll: true });
  updateRoughCutPreviewControls();
  if (play) playRoughCutPreviewVideo();
}

function roughCutTranscriptBasisLabel(data = activeProject) {
  const roughCutVersionId = data?.roughCutReview?.transcriptVersionId || "";
  const roughCutVersion = transcriptVersions(data).find((item) => item.id === roughCutVersionId);
  if (roughCutVersion) return transcriptVersionLabel(roughCutVersion);
  if (data?.transcriptBasis?.label) return data.transcriptBasis.label;
  const versionId = data?.transcriptReview?.usedVersionId
    || data?.transcriptBasis?.versionId
    || data?.transcriptReview?.selectedVersionId
    || "";
  const version = transcriptVersions(data).find((item) => item.id === versionId);
  return version ? transcriptVersionLabel(version) : "未標記版本";
}

function roughCutTranscriptPreviewVersion(data = activeProject) {
  const versionId = data?.roughCutReview?.transcriptVersionId
    || data?.transcriptBasis?.versionId
    || data?.transcriptReview?.usedVersionId
    || data?.transcription?.selectedTranscriptVersionId
    || data?.transcriptReview?.selectedVersionId
    || "";
  return transcriptVersions(data).find((item) => item.id === versionId)
    || selectedTranscriptVersion(data, versionId)
    || null;
}

function roughCutRawTranscriptLines(text = "") {
  return String(text || "")
    .replace(/\r/g, "\n")
    .split("\n");
}

function roughCutTranscriptSentenceParts(text = "") {
  const source = String(text || "").replace(/\r/g, "\n").trim();
  if (!source) return [];
  const parts = splitProofreadRegionParts(source)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  return parts.length ? parts : [source];
}

function roughCutCommonSubstringLength(left = "", right = "") {
  const a = normalizeProofreadRegionText(left);
  const b = normalizeProofreadRegionText(right);
  if (!a || !b) return 0;
  let previous = Array(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i += 1) {
    const current = Array(b.length + 1).fill(0);
    for (let j = 1; j <= b.length; j += 1) {
      current[j] = a[i - 1] === b[j - 1]
        ? previous[j - 1] + 1
        : Math.max(previous[j], current[j - 1]);
    }
    previous = current;
  }
  return previous[b.length] || 0;
}

function roughCutSegmentWindowScore(part = "", joined = "") {
  const partNormalized = normalizeProofreadRegionText(part);
  const joinedNormalized = normalizeProofreadRegionText(joined);
  if (!partNormalized || !joinedNormalized) return 0;
  if (joinedNormalized.includes(partNormalized)) return 3 + (partNormalized.length / Math.max(1, joinedNormalized.length));
  if (partNormalized.includes(joinedNormalized)) {
    const coverage = joinedNormalized.length / Math.max(1, partNormalized.length);
    return coverage >= 0.5 ? 1.2 + coverage : coverage;
  }
  const common = roughCutCommonSubstringLength(partNormalized, joinedNormalized);
  const coverage = common / Math.max(1, partNormalized.length);
  const lengthPenalty = Math.abs(joinedNormalized.length - partNormalized.length) / Math.max(partNormalized.length, joinedNormalized.length, 1);
  return coverage - (lengthPenalty * 0.25);
}

function roughCutBestSegmentWindowForPart(part = "", segments = [], fromIndex = 0) {
  const partNormalized = normalizeProofreadRegionText(part);
  if (!partNormalized || !segments.length) return null;
  let best = null;
  for (let startIndex = Math.max(0, fromIndex); startIndex < segments.length; startIndex += 1) {
    let joined = "";
    for (let endIndex = startIndex; endIndex < segments.length; endIndex += 1) {
      joined += segments[endIndex].text;
      const joinedLength = normalizeProofreadRegionText(joined).length;
      const score = roughCutSegmentWindowScore(part, joined);
      if (!best || score > best.score) best = { startIndex, endIndex, score };
      if (joinedLength > Math.max(partNormalized.length * 1.6, partNormalized.length + 10)) break;
    }
  }
  return best && best.score >= 0.36 ? best : null;
}

function roughCutExpandTranscriptCue(item = {}, indexOffset = 0, sourceSegments = []) {
  const text = String(item?.text || "").trim();
  const start = Number(item?.start);
  const end = Number(item?.end);
  if (!text || !Number.isFinite(start) || !Number.isFinite(end) || end <= start) return [];
  const parts = roughCutTranscriptSentenceParts(text);
  if (parts.length <= 1) {
    return [{
      index: indexOffset + 1,
      start,
      end,
      text
    }];
  }
  const segments = (Array.isArray(sourceSegments) ? sourceSegments : [])
    .map((segment) => ({
      start: Number(segment?.start),
      end: Number(segment?.end),
      text: String(segment?.text || "").trim()
    }))
    .filter((segment) => Number.isFinite(segment.start) && Number.isFinite(segment.end) && segment.end > segment.start && segment.text)
    .sort((left, right) => left.start - right.start);
  if (segments.length >= parts.length) {
    const cues = [];
    let segmentCursor = 0;
    for (const [partIndex, part] of parts.entries()) {
      const partNormalized = normalizeProofreadRegionText(part);
      if (!partNormalized) continue;
      const window = roughCutBestSegmentWindowForPart(part, segments, segmentCursor);
      if (!window) break;
      const firstSegmentIndex = window.startIndex;
      const lastSegmentIndex = window.endIndex;
      const first = segments[firstSegmentIndex];
      const last = segments[lastSegmentIndex];
      cues.push({
        index: indexOffset + partIndex + 1,
        start: Number(first.start.toFixed(3)),
        end: Number(last.end.toFixed(3)),
        text: part
      });
      segmentCursor = lastSegmentIndex;
    }
    const validCues = cues.filter((cue) => cue.end > cue.start);
    if (validCues.length === parts.length) return validCues;
  }
  const totalWeight = parts.reduce((total, part) => total + Math.max(1, normalizeProofreadRegionText(part).length), 0) || parts.length;
  let cursor = start;
  return parts.map((part, partIndex) => {
    const isLast = partIndex === parts.length - 1;
    const weight = Math.max(1, normalizeProofreadRegionText(part).length);
    const nextEnd = isLast ? end : Math.min(end, cursor + ((end - start) * weight / totalWeight));
    const cue = {
      index: indexOffset + partIndex + 1,
      start: Number(cursor.toFixed(3)),
      end: Number(nextEnd.toFixed(3)),
      text: part
    };
    cursor = nextEnd;
    return cue;
  }).filter((cue) => cue.end > cue.start);
}

function roughCutTranscriptTextLinesForVersion(version = null) {
  return roughCutRawTranscriptLines(version?.text || "")
    .map((line) => line.trim())
    .filter(Boolean);
}

function roughCutMappingSourceIds(mapping = {}) {
  const ids = [];
  if (mapping?.sourceSegmentId != null) ids.push(mapping.sourceSegmentId);
  if (Array.isArray(mapping?.sourceSegmentIds)) ids.push(...mapping.sourceSegmentIds);
  if (mapping?.segmentId != null) ids.push(mapping.segmentId);
  if (Array.isArray(mapping?.segmentIds)) ids.push(...mapping.segmentIds);
  return ids.map((id) => String(id)).filter(Boolean);
}

function roughCutSourceSegmentsForMapping(data = activeProject, mapping = {}) {
  const ids = new Set(roughCutMappingSourceIds(mapping));
  const start = Number(mapping?.start);
  const end = Number(mapping?.end);
  if (!ids.size && (!Number.isFinite(start) || !Number.isFinite(end))) return [];
  const candidates = transcriptVersions(data)
    .flatMap((version) => Array.isArray(version?.mappings) ? version.mappings : [])
    .filter((item) => String(item?.text || "").trim())
    .filter((item) => {
      const itemIds = roughCutMappingSourceIds(item);
      const itemStart = Number(item?.start);
      const itemEnd = Number(item?.end);
      const isAtomic = !Array.isArray(item?.sourceSegmentIds) || item.sourceSegmentIds.length <= 1;
      const hasDirectId = itemIds.some((id) => ids.has(id));
      const overlapsRange = Number.isFinite(start) && Number.isFinite(end)
        && Number.isFinite(itemStart) && Number.isFinite(itemEnd)
        && itemEnd > start - 0.05 && itemStart < end + 0.05;
      return isAtomic && (hasDirectId || (!ids.size && overlapsRange));
    })
    .sort((left, right) => Number(left?.start) - Number(right?.start));
  const seen = new Set();
  return candidates.filter((item) => {
    const key = `${Number(item?.start).toFixed(3)}-${Number(item?.end).toFixed(3)}-${String(item?.text || "")}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function roughCutAllAtomicTranscriptSegments(data = activeProject) {
  const candidates = transcriptVersions(data)
    .flatMap((version) => Array.isArray(version?.mappings) ? version.mappings : [])
    .filter((item) => String(item?.text || "").trim())
    .filter((item) => !Array.isArray(item?.sourceSegmentIds) || item.sourceSegmentIds.length <= 1)
    .map((item) => ({
      start: Number(item?.start),
      end: Number(item?.end),
      text: String(item?.text || "").trim()
    }))
    .filter((item) => Number.isFinite(item.start) && Number.isFinite(item.end) && item.end > item.start && item.text)
    .sort((left, right) => left.start - right.start);
  const seen = new Set();
  return candidates.filter((item) => {
    const key = `${item.start.toFixed(3)}-${item.end.toFixed(3)}-${item.text}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function roughCutFindMappingForTextLine(text = "", mappings = [], used = new Set()) {
  const normalized = normalizeProofreadRegionText(text);
  if (!normalized) return null;
  let best = null;
  for (const [index, mapping] of mappings.entries()) {
    if (used.has(index)) continue;
    const mappingText = String(mapping?.text || "").trim();
    const mappingNormalized = normalizeProofreadRegionText(mappingText);
    if (!mappingNormalized) continue;
    const exact = mappingNormalized === normalized;
    const contains = mappingNormalized.includes(normalized) || normalized.includes(mappingNormalized);
    if (!exact && !contains) continue;
    const score = exact ? 1000 : Math.min(mappingNormalized.length, normalized.length);
    if (!best || score > best.score) best = { index, mapping, score };
  }
  if (!best) return null;
  used.add(best.index);
  return best.mapping;
}

function roughCutTranscriptLinesFromVersionText(data = activeProject, version = null, mappings = []) {
  const textLines = roughCutTranscriptTextLinesForVersion(version);
  if (!textLines.length || !Array.isArray(mappings) || !mappings.length) return [];
  const used = new Set();
  return textLines.flatMap((text, index) => {
    const mapping = roughCutFindMappingForTextLine(text, mappings, used) || mappings[index] || null;
    if (version?.kind === "ai-highlight-summary") {
      const start = Number(mapping?.start);
      const end = Number(mapping?.end);
      if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
        return [{
          index: index + 1,
          start: Number(start.toFixed(3)),
          end: Number(end.toFixed(3)),
          text
        }];
      }
    }
    return roughCutExpandTranscriptCue({
      index: index + 1,
      start: Number(mapping?.start),
      end: Number(mapping?.end),
      text
    }, index * 100, roughCutSourceSegmentsForMapping(data, mapping));
  }).filter((item) => Number.isFinite(item.start) && Number.isFinite(item.end) && item.end > item.start);
}

function normalizedCueRanges(ranges = [], durationSeconds = roughCutTotalDuration()) {
  return (Array.isArray(ranges) ? ranges : [])
    .map((range) => {
      const start = clampNumber(range?.start, 0, durationSeconds);
      const end = clampNumber(range?.end, 0, durationSeconds);
      return {
        start: Number(start.toFixed(3)),
        end: Number(end.toFixed(3))
      };
    })
    .filter((range) => range.end > range.start + 0.01)
    .sort((left, right) => left.start - right.start);
}

function roughCutPreviewKeepRanges(data = activeProject) {
  const duration = Math.max(0.01, Number(data?.roughCutReview?.durationSeconds) || Number(data?.durationSeconds) || roughCutTotalDuration());
  const storedRemovals = normalizedCueRanges(
    (Array.isArray(data?.roughCutReview?.removals) ? data.roughCutReview.removals : [])
      .filter((range) => range?.enabled !== false),
    duration
  );
  const removals = roughCutRemovalList?.querySelectorAll(".roughcut-removal-row")?.length
    ? activeRoughCutRemovalRanges()
    : storedRemovals;
  if (!removals.length) {
    const storedKeepRanges = normalizedCueRanges(data?.roughCutReview?.keepRanges, duration);
    return storedKeepRanges.length ? storedKeepRanges : [{ start: 0, end: duration }];
  }
  const keepRanges = [];
  let cursor = 0;
  for (const removal of removals) {
    if (removal.start > cursor + 0.01) keepRanges.push({ start: cursor, end: removal.start });
    cursor = Math.max(cursor, removal.end);
  }
  if (cursor < duration - 0.01) keepRanges.push({ start: cursor, end: duration });
  return normalizedCueRanges(keepRanges, duration);
}

function cueOverlapsKeepRanges(cue, keepRanges = []) {
  if (!keepRanges.length) return true;
  const start = Number(cue?.start);
  const end = Number(cue?.end);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return false;
  const duration = end - start;
  const midpoint = start + (duration / 2);
  return keepRanges.some((range) => {
    const overlap = Math.min(end, range.end) - Math.max(start, range.start);
    const midpointInside = midpoint >= range.start && midpoint <= range.end;
    return midpointInside && overlap >= Math.min(duration * 0.5, Math.max(0.08, duration - 0.03));
  });
}

function roughCutNormalizedCharacterMap(text = "") {
  const raw = String(text || "");
  const normalized = [];
  const rawIndexes = [];
  for (let index = 0; index < raw.length; index += 1) {
    const comparable = normalizeProofreadRegionText(raw[index]);
    if (!comparable) continue;
    for (const character of comparable) {
      normalized.push(character);
      rawIndexes.push(index);
    }
  }
  return { raw, normalized: normalized.join(""), rawIndexes };
}

function roughCutClipCueTextToKeepRanges(data = activeProject, cue = {}, keepRanges = []) {
  const mapped = roughCutNormalizedCharacterMap(cue?.text);
  if (!mapped.normalized || !keepRanges.length) return cue;
  const cueStart = Number(cue?.start);
  const cueEnd = Number(cue?.end);
  if (!Number.isFinite(cueStart) || !Number.isFinite(cueEnd)) return cue;
  const nearbySegments = roughCutAllAtomicTranscriptSegments(data)
    .filter((segment) => segment.end > cueStart - 3 && segment.start < cueEnd + 3);
  let searchFrom = 0;
  const matches = [];
  for (const segment of nearbySegments) {
    const normalizedText = normalizeProofreadRegionText(segment.text);
    if (!normalizedText) continue;
    const normalizedStart = mapped.normalized.indexOf(normalizedText, searchFrom);
    if (normalizedStart < 0) continue;
    matches.push({
      ...segment,
      normalizedStart,
      normalizedEnd: normalizedStart + normalizedText.length,
      kept: cueOverlapsKeepRanges(segment, keepRanges)
    });
    searchFrom = normalizedStart + normalizedText.length;
  }
  const matchedLength = matches.reduce((total, item) => total + (item.normalizedEnd - item.normalizedStart), 0);
  const keptMatches = matches.filter((item) => item.kept);
  if (!keptMatches.length || matchedLength < mapped.normalized.length * 0.5) return cue;
  const firstKept = keptMatches[0];
  const lastKept = keptMatches.at(-1);
  const removedBefore = matches.some((item) => !item.kept && item.normalizedEnd <= firstKept.normalizedStart);
  const removedAfter = matches.some((item) => !item.kept && item.normalizedStart >= lastKept.normalizedEnd);
  if (!removedBefore && !removedAfter) return cue;
  const rawStart = removedBefore ? mapped.rawIndexes[firstKept.normalizedStart] : 0;
  let rawEnd = removedAfter
    ? (mapped.rawIndexes[lastKept.normalizedEnd - 1] + 1)
    : mapped.raw.length;
  if (!removedAfter) rawEnd = mapped.raw.length;
  const text = mapped.raw.slice(rawStart, rawEnd).trim().replace(/^[，,。！？!?；;：:、]+/u, "");
  if (!text) return cue;
  return {
    ...cue,
    start: removedBefore ? firstKept.start : cue.start,
    end: removedAfter ? lastKept.end : cue.end,
    text
  };
}

function roughCutTranscriptCueLines(data = activeProject) {
  const version = roughCutTranscriptPreviewVersion(data);
  const keepRanges = roughCutPreviewKeepRanges(data);
  const mappings = Array.isArray(version?.mappings) ? version.mappings : [];
  const mappedVersionTextLines = roughCutTranscriptLinesFromVersionText(data, version, mappings);
  if (version?.kind === "ai-highlight-summary" && mappedVersionTextLines.length) {
    const visibleHighlightLines = mappedVersionTextLines
      .map((item) => roughCutClipCueTextToKeepRanges(data, item, keepRanges))
      .filter((item) => cueOverlapsKeepRanges(item, keepRanges));
    return { version, lines: visibleHighlightLines, source: "selected-highlight-script", timeBasis: "source" };
  }
  const versionTextLines = mappedVersionTextLines.filter((item) => cueOverlapsKeepRanges(item, keepRanges));
  if (versionTextLines.length) return { version, lines: versionTextLines, source: "selected-transcript-text", timeBasis: "source" };
  const mappedLines = mappings
    .filter((item) => String(item?.text || "").trim())
    .flatMap((item, index) => roughCutExpandTranscriptCue(item, index * 100))
    .filter((item) => Number.isFinite(item.start) && Number.isFinite(item.end) && item.end > item.start)
    .filter((item) => cueOverlapsKeepRanges(item, keepRanges));
  if (mappedLines.length) return { version, lines: mappedLines, source: "selected-transcript", timeBasis: "source" };
  const subtitleCaptions = Array.isArray(data?.subtitleReview?.captions) ? data.subtitleReview.captions : [];
  const subtitleLines = subtitleCaptions
    .filter((item) => item?.enabled !== false && String(item?.text || "").trim())
    .flatMap((item, index) => roughCutExpandTranscriptCue(item, index * 100))
    .filter((item) => Number.isFinite(item.start) && Number.isFinite(item.end) && item.end > item.start)
    .filter((item) => cueOverlapsKeepRanges(item, keepRanges));
  if (subtitleLines.length) return { version, lines: subtitleLines, source: "subtitles", timeBasis: "source" };
  const textLines = roughCutRawTranscriptLines(version?.text || data?.transcript || "")
    .map((line) => line.trim())
    .filter(Boolean);
  const duration = Math.max(1, Number(data?.roughCutReview?.durationSeconds) || Number(data?.durationSeconds) || textLines.length || 1);
  const fallbackLines = textLines.map((text, index) => ({
    index: index + 1,
    start: (index / Math.max(1, textLines.length)) * duration,
    end: ((index + 1) / Math.max(1, textLines.length)) * duration,
    text
  }));
  return { version, lines: fallbackLines, source: "fallback", timeBasis: "preview" };
}

function renderRoughCutTranscriptPreview(data = activeProject) {
  if (!roughCutTranscriptLines) return;
  const { version, lines, timeBasis = "source" } = roughCutTranscriptCueLines(data);
  if (roughCutTranscriptPreviewBasis) {
    roughCutTranscriptPreviewBasis.textContent = version ? transcriptVersionLabel(version) : "目前稿件";
    roughCutTranscriptPreviewBasis.title = roughCutTranscriptPreviewBasis.textContent;
  }
  roughCutTranscriptLines.replaceChildren();
  if (!lines.length) {
    const empty = document.createElement("p");
    empty.className = "roughcut-transcript-empty";
    empty.textContent = "目前稿件沒有可同步的句子。";
    roughCutTranscriptLines.append(empty);
    return;
  }
  const fragment = document.createDocumentFragment();
  for (const line of lines) {
    const button = document.createElement("button");
    const text = document.createElement("span");
    button.type = "button";
    button.className = "roughcut-transcript-line";
    button.dataset.start = String(line.start);
    button.dataset.end = String(line.end);
    button.dataset.timeBasis = timeBasis;
    button.title = line.text;
    text.textContent = line.text;
    button.append(text);
    button.addEventListener("click", () => {
      const wasPlaying = Boolean(roughCutReviewVideo && !roughCutReviewVideo.paused && !roughCutReviewVideo.ended);
      seekRoughCutPreview(line.start, { play: wasPlaying, keepVisible: true });
    });
    fragment.append(button);
  }
  roughCutTranscriptLines.append(fragment);
  updateRoughCutTranscriptPreviewPlayback(roughCutReviewVideo?.currentTime || 0, { forceScroll: true });
}

function roughCutTranscriptPlaybackTime(time = roughCutReviewVideo?.currentTime || 0) {
  const basis = roughCutTranscriptLines?.querySelector(".roughcut-transcript-line")?.dataset.timeBasis || "source";
  const seconds = Number(time) || 0;
  if (basis !== "source") return clampNumber(seconds, 0, roughCutEditedDuration());
  return roughCutCurrentSourceTime(seconds);
}

function roughCutCurrentTranscriptRow(rows = [], seconds = 0) {
  const current = rows.find((row) => seconds >= Number(row.dataset.start) && seconds < Number(row.dataset.end));
  if (current) return current;
  const previous = [...rows].reverse().find((row) => seconds >= Number(row.dataset.start));
  const next = rows.find((row) => seconds < Number(row.dataset.start));
  if (!previous) return next || rows[0];
  if (!next) return previous;
  const previousEndDistance = Math.max(0, seconds - Number(previous.dataset.end));
  const nextStartDistance = Math.max(0, Number(next.dataset.start) - seconds);
  const previousEnded = seconds >= Number(previous.dataset.end);
  if (previousEnded && nextStartDistance <= 0.35) return next;
  return nextStartDistance <= previousEndDistance ? next : previous;
}

function updateRoughCutTranscriptPreviewPlayback(time = roughCutReviewVideo?.currentTime || 0, { forceScroll = false } = {}) {
  if (!roughCutTranscriptLines) return;
  const rows = [...roughCutTranscriptLines.querySelectorAll(".roughcut-transcript-line")];
  if (!rows.length) return;
  const seconds = roughCutTranscriptPlaybackTime(time);
  const current = roughCutCurrentTranscriptRow(rows, seconds);
  for (const row of rows) {
    const isCurrent = row === current;
    row.classList.toggle("is-current", isCurrent);
    row.classList.toggle("is-past", Number(row.dataset.end) <= seconds && !isCurrent);
    if (isCurrent) row.setAttribute("aria-current", "true");
    else row.removeAttribute("aria-current");
  }
  if (current && (forceScroll || !current.dataset.scrolledActive)) {
    current.dataset.scrolledActive = "true";
    rows.filter((row) => row !== current).forEach((row) => delete row.dataset.scrolledActive);
    current.scrollIntoView({ block: "center", inline: "nearest", behavior: forceScroll ? "auto" : "smooth" });
  }
}

function resampleRoughCutPeaks(peaks, targetCount) {
  const values = (Array.isArray(peaks) ? peaks : []).map((peak) => clampNumber(peak, 0, 1));
  const count = Math.max(0, Math.round(Number(targetCount) || 0));
  if (!values.length || !count) return [];
  if (values.length === 1) return Array(count).fill(values[0]);
  if (count >= values.length) {
    return Array.from({ length: count }, (_, index) => {
      const position = (index / Math.max(1, count - 1)) * (values.length - 1);
      const left = Math.floor(position);
      const right = Math.min(values.length - 1, left + 1);
      const mix = position - left;
      return values[left] + ((values[right] - values[left]) * mix);
    });
  }
  return Array.from({ length: count }, (_, index) => {
    const start = Math.floor((index * values.length) / count);
    const end = Math.max(start + 1, Math.floor(((index + 1) * values.length) / count));
    const bucket = values.slice(start, end);
    const peak = Math.max(...bucket);
    const average = bucket.reduce((sum, value) => sum + value, 0) / bucket.length;
    return (average * 0.68) + (peak * 0.32);
  });
}

function renderRoughCutTimelineDensity() {
  const track = roughCutTimelineTrack();
  if (!track) return;
  const trackWidth = Math.max(1, track.getBoundingClientRect().width || track.clientWidth);
  const filmstrip = track.querySelector(".roughcut-video-strip");
  if (filmstrip) {
    const cellCount = Math.max(1, Math.min(240, Math.ceil(trackWidth / ROUGH_CUT_THUMBNAIL_WIDTH)));
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < cellCount; index += 1) {
      if (roughCutTimelineThumbnailUrls.length) {
        const sourceIndex = Math.min(
          roughCutTimelineThumbnailUrls.length - 1,
          Math.floor(((index + 0.5) / cellCount) * roughCutTimelineThumbnailUrls.length)
        );
        const image = document.createElement("img");
        image.src = roughCutTimelineThumbnailUrls[sourceIndex];
        image.alt = "";
        image.loading = "lazy";
        image.decoding = "async";
        fragment.append(image);
      } else {
        const placeholder = document.createElement("span");
        placeholder.textContent = "素材";
        fragment.append(placeholder);
      }
    }
    filmstrip.replaceChildren(fragment);
  }

  const bars = track.querySelector(".roughcut-waveform-bars");
  if (bars) {
    const barCount = Math.max(48, Math.min(ROUGH_CUT_WAVEFORM_MAX_BARS, Math.ceil(trackWidth / ROUGH_CUT_WAVEFORM_BAR_STEP)));
    const displayPeaks = resampleRoughCutPeaks(roughCutTimelineWaveformPeaks, barCount);
    const fragment = document.createDocumentFragment();
    for (const peak of displayPeaks) {
      const bar = document.createElement("i");
      bar.style.height = `${waveformBarHeightPercent(peak, roughCutVolumeGain)}%`;
      fragment.append(bar);
    }
    bars.replaceChildren(fragment);
  }
}

function setRoughCutZoom(value) {
  const nextZoom = clampNumber(value, 1, 8);
  const maxScrollBefore = roughCutWaveform ? Math.max(1, roughCutWaveform.scrollWidth - roughCutWaveform.clientWidth) : 1;
  const scrollRatio = roughCutWaveform ? roughCutWaveform.scrollLeft / maxScrollBefore : 0;
  roughCutTimelineZoom = nextZoom;
  if (roughCutZoom) roughCutZoom.value = String(nextZoom);
  if (roughCutZoomLabel) roughCutZoomLabel.textContent = `${nextZoom.toFixed(1)}x`;

  const track = roughCutTimelineTrack();
  if (track) {
    track.style.width = `${nextZoom * 100}%`;
    renderRoughCutTimelineDensity();
    if (roughCutDensityTimer) clearTimeout(roughCutDensityTimer);
    roughCutDensityTimer = window.setTimeout(() => {
      roughCutDensityTimer = null;
      renderRoughCutTimelineDensity();
      if (!roughCutWaveform) return;
      const maxScrollAfter = Math.max(0, roughCutWaveform.scrollWidth - roughCutWaveform.clientWidth);
      roughCutWaveform.scrollLeft = maxScrollAfter * scrollRatio;
      positionSelectedRoughCutSegmentToolbar();
      updateRoughCutPlayhead(roughCutReviewVideo?.currentTime || 0);
    }, 0);
  }
}

function setRoughCutVolumeGain(value, { rerender = true } = {}) {
  roughCutVolumeGain = clampAudioGain(value);
  if (roughCutVolume) roughCutVolume.value = String(roughCutVolumeGain);
  if (roughCutVolumeLabel) roughCutVolumeLabel.textContent = `${formatAudioGain(roughCutVolumeGain)} / ${formatAudioGainDb(roughCutVolumeGain)}`;
  applyPreviewVideoGain(roughCutReviewVideo, roughCutVolumeGain);
  roughCutTimelineTrack()?.querySelector(".roughcut-audio-gain-line")?.syncAudioGain?.();
  if (rerender) renderRoughCutTimelineDensity();
}

function renderRoughCutRuler(duration) {
  const ruler = document.createElement("div");
  ruler.className = "roughcut-time-ruler";
  const tickCount = Math.min(14, Math.max(4, Math.ceil(duration / 45)));
  for (let index = 0; index <= tickCount; index += 1) {
    const tick = document.createElement("span");
    const seconds = (duration / tickCount) * index;
    tick.style.left = `${(seconds / duration) * 100}%`;
    tick.textContent = formatTimelineSeconds(seconds);
    ruler.append(tick);
  }
  return ruler;
}

function roughCutSegmentForRow(row) {
  return [...(roughCutTimelineTrack()?.querySelectorAll(".roughcut-waveform-segment") || [])]
    .find((marker) => marker.dataset.rowId === row.dataset.id);
}

function roughCutKeepSegmentById(keepId) {
  return [...(roughCutTimelineTrack()?.querySelectorAll(".roughcut-sound-segment") || [])]
    .find((marker) => marker.dataset.keepId === String(keepId));
}

function roughCutRowById(rowId) {
  return [...(roughCutRemovalList?.querySelectorAll(".roughcut-removal-row") || [])]
    .find((row) => row.dataset.id === String(rowId));
}

function setRoughCutInspectorInputsDisabled(disabled) {
  [roughCutInspectorStart, roughCutInspectorEnd].forEach((input) => {
    if (!input) return;
    input.disabled = disabled;
  });
}

function setRoughCutSegmentInspectorOpen(open, row = null) {
  if (!roughCutSegmentInspector) return;
  roughCutSegmentInspector.hidden = !open;
  roughCutSegmentInspector.dataset.rowId = open && row ? row.dataset.id : "";
  roughCutSegmentInspector.dataset.kind = open && row ? "removal" : "";
  if (!open) setRoughCutInspectorInputsDisabled(false);
  const toolbar = roughCutTimelineTrack()?.querySelector(".roughcut-segment-toolbar");
  if (toolbar) updateRoughCutSegmentToolbar(toolbar, roughCutRowById(toolbar.dataset.rowId || ""));
}

function updateRoughCutSegmentInspector(row) {
  if (!roughCutSegmentInspector || !row) return;
  const start = Number(row.dataset.start) || 0;
  const end = Number(row.dataset.end) || start;
  const hasSound = row.querySelector(".roughcut-enabled")?.checked !== false;
  roughCutSegmentInspector.dataset.rowId = row.dataset.id;
  roughCutSegmentInspector.dataset.keepId = "";
  roughCutSegmentInspector.dataset.kind = "removal";
  setRoughCutInspectorInputsDisabled(false);
  if (roughCutInspectorStatus) {
    roughCutInspectorStatus.textContent = hasSound ? "保留（已隱藏）" : "將刪除";
    roughCutInspectorStatus.classList.toggle("is-sound", hasSound);
  }
  if (roughCutInspectorStart) {
    roughCutInspectorStart.max = String(roughCutTotalDuration());
    roughCutInspectorStart.value = formatEditableSeconds(start);
  }
  if (roughCutInspectorEnd) {
    roughCutInspectorEnd.max = String(roughCutTotalDuration());
    roughCutInspectorEnd.value = formatEditableSeconds(end);
  }
  if (roughCutInspectorDuration) roughCutInspectorDuration.textContent = `${Math.max(0, end - start).toFixed(2)} 秒`;
  if (roughCutInspectorReason) roughCutInspectorReason.textContent = row.dataset.reason || "粗剪建議";
  if (roughCutInspectorText) roughCutInspectorText.textContent = row.dataset.text || "AI 依停頓、重講或語句流暢度判斷。";
}

function updateRoughCutKeepInspector(marker) {
  if (!roughCutSegmentInspector || !marker) return;
  const start = Number(marker.dataset.start) || 0;
  const end = Number(marker.dataset.end) || start;
  roughCutSegmentInspector.dataset.rowId = "";
  roughCutSegmentInspector.dataset.keepId = marker.dataset.keepId || "";
  roughCutSegmentInspector.dataset.kind = "keep";
  setRoughCutInspectorInputsDisabled(true);
  if (roughCutInspectorStatus) {
    roughCutInspectorStatus.textContent = "保留";
    roughCutInspectorStatus.classList.add("is-sound");
  }
  if (roughCutInspectorStart) {
    roughCutInspectorStart.max = String(roughCutTotalDuration());
    roughCutInspectorStart.value = formatEditableSeconds(start);
  }
  if (roughCutInspectorEnd) {
    roughCutInspectorEnd.max = String(roughCutTotalDuration());
    roughCutInspectorEnd.value = formatEditableSeconds(end);
  }
  if (roughCutInspectorDuration) roughCutInspectorDuration.textContent = `${Math.max(0, end - start).toFixed(2)} 秒`;
  if (roughCutInspectorReason) roughCutInspectorReason.textContent = "保留片段";
  if (roughCutInspectorText) roughCutInspectorText.textContent = "這段會保留在粗剪成片中；按工具欄的「隱藏」可把整段加入刪除滑塊。";
}

function toggleRoughCutSegmentInspector(row) {
  if (!roughCutSegmentInspector || !row) return;
  const isSameOpen = !roughCutSegmentInspector.hidden && roughCutSegmentInspector.dataset.rowId === row.dataset.id;
  if (isSameOpen) {
    setRoughCutSegmentInspectorOpen(false);
    return;
  }
  updateRoughCutSegmentInspector(row);
  setRoughCutSegmentInspectorOpen(true, row);
}

function toggleRoughCutKeepInspector(marker) {
  if (!roughCutSegmentInspector || !marker) return;
  const isSameOpen = !roughCutSegmentInspector.hidden
    && roughCutSegmentInspector.dataset.kind === "keep"
    && roughCutSegmentInspector.dataset.keepId === marker.dataset.keepId;
  if (isSameOpen) {
    setRoughCutSegmentInspectorOpen(false);
    return;
  }
  updateRoughCutKeepInspector(marker);
  roughCutSegmentInspector.hidden = false;
  updateRoughCutSegmentToolbar(roughCutTimelineTrack()?.querySelector(".roughcut-segment-toolbar"), null);
}

function syncRoughCutSegmentInspectorTimes(changedField = "start") {
  if (roughCutSegmentInspector?.dataset.kind === "keep") return;
  const row = roughCutRowById(roughCutSegmentInspector?.dataset.rowId || "");
  if (!row || !roughCutInspectorStart || !roughCutInspectorEnd) return;
  const duration = roughCutTotalDuration();
  const minimumGap = 0.06;
  let start = clampNumber(roughCutInspectorStart.value, 0, duration);
  let end = clampNumber(roughCutInspectorEnd.value, 0, duration);
  if (changedField === "start" && start > end - minimumGap) end = Math.min(duration, start + minimumGap);
  if (changedField === "end" && end < start + minimumGap) start = Math.max(0, end - minimumGap);
  if (end <= start) end = Math.min(duration, start + minimumGap);
  setRoughCutRowTimes(row, start, end);
  updateRoughCutSegmentInspector(row);
  seekRoughCutPreview(changedField === "end" ? end : start, { keepVisible: true });
}

function clearRoughCutSegmentSelection() {
  const track = roughCutTimelineTrack();
  if (!track) {
    setRoughCutSegmentInspectorOpen(false);
    return;
  }
  track.querySelectorAll(".roughcut-waveform-segment.is-selected, .roughcut-sound-segment.is-selected").forEach((marker) => marker.classList.remove("is-selected"));
  const toolbar = track.querySelector(".roughcut-segment-toolbar");
  if (toolbar) {
    toolbar.hidden = true;
    toolbar.dataset.rowId = "";
    toolbar.dataset.keepId = "";
    toolbar.dataset.kind = "";
  }
  setRoughCutSegmentInspectorOpen(false);
}

function updateRoughCutSegmentToolbar(toolbar, row) {
  if (!toolbar) return;
  const isKeep = toolbar.dataset.kind === "keep";
  const hasSound = row ? row.querySelector(".roughcut-enabled")?.checked !== false : isKeep;
  const bypass = toolbar.querySelector(".roughcut-toolbar-bypass");
  const details = toolbar.querySelector(".roughcut-toolbar-details");
  const remove = toolbar.querySelector(".roughcut-toolbar-delete");
  const detailsOpen = Boolean(
    roughCutSegmentInspector
    && !roughCutSegmentInspector.hidden
    && (
      (isKeep && roughCutSegmentInspector.dataset.kind === "keep" && roughCutSegmentInspector.dataset.keepId === toolbar.dataset.keepId)
      || (!isKeep && row && roughCutSegmentInspector.dataset.rowId === row.dataset.id)
    )
  );
  if (details) {
    details.classList.toggle("is-active", detailsOpen);
    details.setAttribute("aria-expanded", String(detailsOpen));
    details.ariaLabel = isKeep ? "保留片段資訊" : "詳細資料";
    details.dataset.tooltip = isKeep ? "保留資訊" : "詳細資料";
  }
  if (bypass) {
    const actionLabel = isKeep ? "隱藏" : hasSound ? "取消隱藏" : "隱藏";
    bypass.classList.toggle("is-active", !isKeep && hasSound);
    bypass.setAttribute("aria-pressed", String(!isKeep && hasSound));
    bypass.ariaLabel = actionLabel;
    bypass.dataset.tooltip = actionLabel;
  }
  if (remove) {
    remove.hidden = isKeep;
    remove.disabled = isKeep;
  }
}

function positionRoughCutSegmentToolbar(marker, row) {
  const track = roughCutTimelineTrack();
  const toolbar = track?.querySelector(".roughcut-segment-toolbar");
  if (!track || !toolbar || !marker || !row) return;
  toolbar.dataset.rowId = row.dataset.id;
  toolbar.dataset.keepId = "";
  toolbar.dataset.kind = "removal";
  toolbar.hidden = false;
  updateRoughCutSegmentToolbar(toolbar, row);
  const toolbarHalfWidth = Math.max(56, toolbar.offsetWidth / 2);
  const edgeAllowance = Math.max(8, toolbarHalfWidth - ROUGH_CUT_TIMELINE_GUTTER + 8);
  const center = marker.offsetLeft + (marker.offsetWidth / 2);
  toolbar.style.left = `${clampNumber(center, edgeAllowance, Math.max(edgeAllowance, track.clientWidth - edgeAllowance))}px`;
  toolbar.style.top = `${Math.max(42, marker.offsetTop - 44)}px`;
}

function positionRoughCutKeepToolbar(marker) {
  const track = roughCutTimelineTrack();
  const toolbar = track?.querySelector(".roughcut-segment-toolbar");
  if (!track || !toolbar || !marker) return;
  toolbar.dataset.rowId = "";
  toolbar.dataset.keepId = marker.dataset.keepId || "";
  toolbar.dataset.kind = "keep";
  toolbar.dataset.start = marker.dataset.start || "0";
  toolbar.dataset.end = marker.dataset.end || "0";
  toolbar.hidden = false;
  updateRoughCutSegmentToolbar(toolbar, null);
  const toolbarHalfWidth = Math.max(46, toolbar.offsetWidth / 2);
  const edgeAllowance = Math.max(8, toolbarHalfWidth - ROUGH_CUT_TIMELINE_GUTTER + 8);
  const center = marker.offsetLeft + (marker.offsetWidth / 2);
  toolbar.style.left = `${clampNumber(center, edgeAllowance, Math.max(edgeAllowance, track.clientWidth - edgeAllowance))}px`;
  toolbar.style.top = `${Math.max(42, marker.offsetTop - 44)}px`;
}

function selectRoughCutSegment(marker, row) {
  const track = roughCutTimelineTrack();
  if (!track || !marker || !row) return;
  track.querySelectorAll(".roughcut-waveform-segment").forEach((item) => item.classList.toggle("is-selected", item === marker));
  track.querySelectorAll(".roughcut-sound-segment").forEach((item) => item.classList.remove("is-selected"));
  roughCutRemovalList?.querySelectorAll(".roughcut-removal-row").forEach((item) => item.classList.toggle("is-focused", item === row));
  positionRoughCutSegmentToolbar(marker, row);
  if (roughCutSegmentInspector && !roughCutSegmentInspector.hidden) {
    updateRoughCutSegmentInspector(row);
    setRoughCutSegmentInspectorOpen(true, row);
  }
}

function selectRoughCutKeepSegment(marker) {
  const track = roughCutTimelineTrack();
  if (!track || !marker) return;
  track.querySelectorAll(".roughcut-waveform-segment").forEach((item) => item.classList.remove("is-selected"));
  track.querySelectorAll(".roughcut-sound-segment").forEach((item) => item.classList.toggle("is-selected", item === marker));
  roughCutRemovalList?.querySelectorAll(".roughcut-removal-row").forEach((item) => item.classList.remove("is-focused"));
  positionRoughCutKeepToolbar(marker);
  if (roughCutSegmentInspector && !roughCutSegmentInspector.hidden) updateRoughCutKeepInspector(marker);
}

function positionSelectedRoughCutSegmentToolbar() {
  const track = roughCutTimelineTrack();
  const toolbar = track?.querySelector(".roughcut-segment-toolbar");
  if (toolbar?.dataset.kind === "keep") {
    const marker = roughCutKeepSegmentById(toolbar.dataset.keepId || "");
    if (marker) positionRoughCutKeepToolbar(marker);
    return;
  }
  const row = roughCutRowById(toolbar?.dataset.rowId || "");
  const marker = row ? roughCutSegmentForRow(row) : null;
  if (marker && row) positionRoughCutSegmentToolbar(marker, row);
}

function hideRoughCutKeepSegment(marker) {
  if (!marker) return;
  const duration = roughCutTotalDuration();
  const start = clampNumber(marker.dataset.start, 0, duration);
  const end = clampNumber(marker.dataset.end, 0, duration);
  if (end <= start + 0.06) return;
  pushRoughCutUndoSnapshot(createRoughCutTimelineSnapshot("隱藏保留片段前"));
  const removals = collectEditedRoughCutRemovals();
  const nextId = Math.max(0, ...removals.map((range) => Number(range.id) || 0)) + 1;
  removals.push({
    id: nextId,
    enabled: true,
    start,
    end,
    source: "manual_mute",
    reason: "手動隱藏",
    text: "使用者從保留片段加入的隱藏範圍"
  });
  renderRoughCutRemovalRows(removals);
  updateRoughCutWaveformSegments();
  updateRoughCutPreviewControls();
  const row = roughCutRowById(nextId);
  const segment = row ? roughCutSegmentForRow(row) : null;
  if (row && segment) selectRoughCutSegment(segment, row);
  seekRoughCutPreview(start, { keepVisible: true });
  showToast("已把這段保留片段加入隱藏範圍，可拖曳調整頭尾。");
}

function toggleRoughCutSegmentBypass(row) {
  if (!row) return;
  pushRoughCutUndoSnapshot(createRoughCutTimelineSnapshot("切換隱藏前"));
  const enabled = row.querySelector(".roughcut-enabled");
  const nextHasSound = !(enabled?.checked !== false);
  setRoughCutRowSoundState(row, nextHasSound);
  updateRoughCutWaveformSegments();
  updateRoughCutPreviewControls();
  const marker = roughCutSegmentForRow(row);
  if (marker) selectRoughCutSegment(marker, row);
  seekRoughCutPreview(Number(row.dataset.start) || 0, { keepVisible: true });
  showToast(nextHasSound ? "已隱藏這個刪除片段。" : "已取消隱藏這個刪除片段。 ");
}

function deleteRoughCutSegment(row) {
  if (!row) return;
  pushRoughCutUndoSnapshot(createRoughCutTimelineSnapshot("刪除滑塊前"));
  clearRoughCutSegmentSelection();
  row.remove();
  updateRoughCutWaveformSegments();
  updateRoughCutPreviewControls();
  showToast("已刪除這個刪除滑塊。 ");
}

function createRoughCutSegmentToolbar() {
  const toolbar = document.createElement("div");
  const details = document.createElement("button");
  const detailsIcon = document.createElement("span");
  const bypass = document.createElement("button");
  const eye = document.createElement("span");
  const remove = document.createElement("button");
  const removeIcon = document.createElement("span");
  toolbar.className = "roughcut-segment-toolbar";
  toolbar.hidden = true;
  toolbar.setAttribute("role", "toolbar");
  toolbar.setAttribute("aria-label", "刪除滑塊工具");
  details.type = "button";
  details.className = "roughcut-toolbar-button roughcut-toolbar-details";
  details.ariaLabel = "詳細資料";
  details.dataset.tooltip = "詳細資料";
  details.setAttribute("aria-expanded", "false");
  detailsIcon.className = "roughcut-info-icon";
  detailsIcon.setAttribute("aria-hidden", "true");
  details.append(detailsIcon);
  bypass.type = "button";
  bypass.className = "roughcut-toolbar-button roughcut-toolbar-bypass";
  bypass.ariaLabel = "隱藏";
  bypass.dataset.tooltip = "隱藏";
  eye.className = "roughcut-eye-off-icon";
  eye.setAttribute("aria-hidden", "true");
  bypass.append(eye);
  remove.type = "button";
  remove.className = "roughcut-toolbar-button roughcut-toolbar-delete";
  remove.ariaLabel = "刪除滑塊";
  remove.dataset.tooltip = "刪除滑塊";
  removeIcon.className = "roughcut-trash-icon";
  removeIcon.setAttribute("aria-hidden", "true");
  remove.append(removeIcon);
  toolbar.append(details, bypass, remove);
  toolbar.addEventListener("pointerdown", (event) => event.stopPropagation());
  toolbar.addEventListener("click", (event) => event.stopPropagation());
  details.addEventListener("click", () => {
    if (toolbar.dataset.kind === "keep") toggleRoughCutKeepInspector(roughCutKeepSegmentById(toolbar.dataset.keepId));
    else toggleRoughCutSegmentInspector(roughCutRowById(toolbar.dataset.rowId));
  });
  bypass.addEventListener("click", () => {
    if (toolbar.dataset.kind === "keep") hideRoughCutKeepSegment(roughCutKeepSegmentById(toolbar.dataset.keepId));
    else toggleRoughCutSegmentBypass(roughCutRowById(toolbar.dataset.rowId));
  });
  remove.addEventListener("click", () => deleteRoughCutSegment(roughCutRowById(toolbar.dataset.rowId)));
  return toolbar;
}

function setRoughCutRowSoundState(row, hasSound) {
  const enabled = row.querySelector(".roughcut-enabled");
  const state = row.querySelector(".roughcut-enabled-state");
  if (enabled) enabled.checked = hasSound;
  invalidateRoughCutRemovalRangeCache();
  row.classList.toggle("is-muted", !hasSound);
  row.classList.toggle("is-sound", hasSound);
  if (state) state.textContent = hasSound ? "保留" : "刪除";
  const marker = roughCutSegmentForRow(row);
  if (marker) {
    marker.classList.toggle("is-muted", !hasSound);
    marker.classList.toggle("is-sound", hasSound);
    marker.title = `${hasSound ? "保留" : "刪除"} ${formatTimelineSeconds(Number(row.dataset.start) || 0)} - ${formatTimelineSeconds(Number(row.dataset.end) || 0)}`;
  }
  if (roughCutSegmentInspector?.dataset.rowId === row.dataset.id && !roughCutSegmentInspector.hidden) {
    updateRoughCutSegmentInspector(row);
  }
}

function focusRoughCutRow(row) {
  if (!roughCutRemovalList.hidden) row.scrollIntoView({ behavior: "smooth", block: "center" });
  roughCutRemovalList.querySelectorAll(".roughcut-removal-row").forEach((item) => item.classList.remove("is-focused"));
  roughCutTimelineTrack()?.querySelectorAll(".roughcut-waveform-segment").forEach((item) => item.classList.remove("is-focused"));
  row.classList.add("is-focused");
  roughCutSegmentForRow(row)?.classList.add("is-focused");
}

function previewRoughCutRow(row) {
  const start = clampNumber(row.dataset.start, 0, roughCutTotalDuration());
  seekRoughCutPreview(Math.max(0, start - 0.8), { play: true });
  focusRoughCutRow(row);
}

function updateRoughCutSegmentPosition(marker, row) {
  const duration = roughCutTotalDuration();
  const start = clampNumber(row.dataset.start, 0, duration);
  const end = clampNumber(row.dataset.end, 0, duration);
  const label = marker.querySelector(".roughcut-segment-label");
  const hasSound = row.querySelector(".roughcut-enabled")?.checked !== false;
  marker.style.left = `${(start / duration) * 100}%`;
  marker.style.width = `${((end - start) / duration) * 100}%`;
  marker.dataset.start = String(start);
  marker.dataset.end = String(end);
  marker.classList.toggle("is-muted", !hasSound);
  marker.classList.toggle("is-sound", hasSound);
  marker.title = `${hasSound ? "保留" : "刪除"} ${formatTimelineSeconds(start)} - ${formatTimelineSeconds(end)}`;
  marker.setAttribute("aria-label", `${hasSound ? "保留" : "刪除"}片段，${formatTimelineSeconds(start)} 到 ${formatTimelineSeconds(end)}`);
  if (label) label.textContent = `${hasSound ? "保留" : "刪除"} ${formatTimelineSeconds(start)} - ${formatTimelineSeconds(end)}`;
}

function setRoughCutRowTimes(row, start, end) {
  const duration = roughCutTotalDuration();
  const minimumGap = 0.06;
  let nextStart = clampNumber(start, 0, duration);
  let nextEnd = clampNumber(end, 0, duration);
  if (nextEnd < nextStart + minimumGap) {
    if (nextStart + minimumGap <= duration) nextEnd = nextStart + minimumGap;
    else nextStart = Math.max(0, nextEnd - minimumGap);
  }

  const startInput = row.querySelector(".roughcut-start");
  const endInput = row.querySelector(".roughcut-end");
  const seekTime = row.querySelector(".roughcut-seek small");
  row.dataset.start = formatEditableSeconds(nextStart);
  row.dataset.end = formatEditableSeconds(nextEnd);
  invalidateRoughCutRemovalRangeCache();
  if (startInput) startInput.value = formatEditableSeconds(nextStart);
  if (endInput) endInput.value = formatEditableSeconds(nextEnd);
  if (seekTime) seekTime.textContent = formatTimelineSeconds(nextStart);
  const marker = roughCutSegmentForRow(row);
  if (marker) {
    updateRoughCutSegmentPosition(marker, row);
    if (marker.classList.contains("is-selected")) positionRoughCutSegmentToolbar(marker, row);
  }
  updateRoughCutMeta();
  updateRoughCutPreviewFreshnessNotice();
  if (roughCutSegmentInspector?.dataset.rowId === row.dataset.id && !roughCutSegmentInspector.hidden) {
    updateRoughCutSegmentInspector(row);
  }
}

function beginRoughCutSegmentDrag(event, row, mode = "move") {
  if (event.button !== undefined && event.button !== 0) return;
  const marker = event.currentTarget.closest(".roughcut-waveform-segment");
  const track = roughCutTimelineTrack();
  if (!marker || !track) return;
  event.preventDefault();
  event.stopPropagation();

  const duration = roughCutTotalDuration();
  const minimumGap = 0.06;
  const trackWidth = Math.max(1, track.getBoundingClientRect().width);
  const startX = event.clientX;
  const originalStart = Number(row.dataset.start) || 0;
  const originalEnd = Number(row.dataset.end) || originalStart + minimumGap;
  const originalLength = Math.max(minimumGap, originalEnd - originalStart);
  const undoSnapshot = createRoughCutTimelineSnapshot("拖動時間線前");
  let dragged = false;
  roughCutPlayheadDragLocked = true;
  marker.classList.add("is-dragging");
  focusRoughCutRow(row);

  const move = (moveEvent) => {
    const deltaPixels = moveEvent.clientX - startX;
    if (Math.abs(deltaPixels) > 2) dragged = true;
    const deltaSeconds = (deltaPixels / trackWidth) * duration;
    let nextStart = originalStart;
    let nextEnd = originalEnd;

    if (mode === "move") {
      nextStart = clampNumber(originalStart + deltaSeconds, 0, duration - originalLength);
      nextEnd = nextStart + originalLength;
    } else if (mode === "start") {
      nextStart = clampNumber(originalStart + deltaSeconds, 0, originalEnd - minimumGap);
    } else {
      nextEnd = clampNumber(originalEnd + deltaSeconds, originalStart + minimumGap, duration);
    }

    setRoughCutRowTimes(row, nextStart, nextEnd);
  };

  const stop = () => {
    roughCutPlayheadDragLocked = false;
    marker.classList.remove("is-dragging");
    if (dragged) {
      pushRoughCutUndoSnapshot(undoSnapshot);
      marker.dataset.dragged = "true";
      setTimeout(() => delete marker.dataset.dragged, 0);
    }
    document.removeEventListener("pointermove", move);
    document.removeEventListener("pointerup", stop);
    document.removeEventListener("pointercancel", stop);
    updateRoughCutPlayhead(roughCutReviewVideo?.currentTime || 0);
  };

  document.addEventListener("pointermove", move);
  document.addEventListener("pointerup", stop, { once: true });
  document.addEventListener("pointercancel", stop, { once: true });
}

function nudgeRoughCutSegment(row, direction, event) {
  pushRoughCutUndoSnapshot(createRoughCutTimelineSnapshot("鍵盤微調前"));
  const duration = roughCutTotalDuration();
  const step = event.shiftKey ? 1 : 0.1;
  const start = Number(row.dataset.start) || 0;
  const end = Number(row.dataset.end) || start + 0.06;
  const length = Math.max(0.06, end - start);
  const nextStart = clampNumber(start + direction * step, 0, duration - length);
  setRoughCutRowTimes(row, nextStart, nextStart + length);
  seekRoughCutPreview(nextStart, { keepVisible: true });
}

function roughCutSoundRanges() {
  const duration = roughCutTotalDuration();
  const ranges = [];
  let cursor = 0;
  for (const muted of mergedActiveRoughCutRemovalRanges()) {
    if (muted.start > cursor + 0.025) ranges.push({ start: cursor, end: muted.start });
    cursor = Math.max(cursor, muted.end);
  }
  if (cursor < duration - 0.025) ranges.push({ start: cursor, end: duration });
  return ranges;
}

function updateRoughCutSoundRegions() {
  const lane = roughCutTimelineTrack()?.querySelector(".roughcut-audio-sound-regions");
  if (!lane) return;
  lane.replaceChildren();
  const bed = document.createElement("span");
  bed.className = "roughcut-sound-bed";
  bed.setAttribute("aria-hidden", "true");
  lane.append(bed);
  const duration = roughCutTotalDuration();
  roughCutSoundRanges().forEach((range, index) => {
    const sound = document.createElement("span");
    sound.className = "roughcut-sound-segment";
    sound.role = "button";
    sound.tabIndex = 0;
    sound.dataset.keepId = String(index + 1);
    sound.dataset.start = formatEditableSeconds(range.start);
    sound.dataset.end = formatEditableSeconds(range.end);
    sound.style.left = `${(range.start / duration) * 100}%`;
    sound.style.width = `${Math.max(0.15, ((range.end - range.start) / duration) * 100)}%`;
    sound.title = `保留 ${formatTimelineSeconds(range.start)} - ${formatTimelineSeconds(range.end)}`;
    sound.setAttribute("aria-label", `保留片段，${formatTimelineSeconds(range.start)} 到 ${formatTimelineSeconds(range.end)}`);
    sound.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
    });
    sound.addEventListener("click", (event) => {
      event.stopPropagation();
      selectRoughCutKeepSegment(sound);
      seekRoughCutPreview(range.start, { keepVisible: true });
    });
    sound.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      selectRoughCutKeepSegment(sound);
    });
    lane.append(sound);
  });
}

function updateRoughCutWaveformSegments() {
  if (!roughCutWaveform) return;
  invalidateRoughCutRemovalRangeCache();
  const track = roughCutTimelineTrack();
  if (!track) return;
  const toolbar = track.querySelector(".roughcut-segment-toolbar");
  const selectedRowId = toolbar?.dataset.rowId || "";
  track.querySelectorAll(".roughcut-waveform-segment").forEach((segment) => segment.remove());
  const rows = [...roughCutRemovalList.querySelectorAll(".roughcut-removal-row")];
  rows.forEach((row) => {
    const hasSound = row.querySelector(".roughcut-enabled")?.checked !== false;
    const marker = document.createElement("div");
    const startHandle = document.createElement("span");
    const label = document.createElement("span");
    const endHandle = document.createElement("span");
    marker.className = "roughcut-waveform-segment";
    marker.classList.toggle("is-muted", !hasSound);
    marker.classList.toggle("is-sound", hasSound);
    marker.role = "button";
    marker.tabIndex = 0;
    marker.dataset.rowId = row.dataset.id;
    startHandle.className = "roughcut-segment-handle roughcut-segment-handle-start";
    label.className = "roughcut-segment-label";
    endHandle.className = "roughcut-segment-handle roughcut-segment-handle-end";
    marker.append(startHandle, label, endHandle);
    updateRoughCutSegmentPosition(marker, row);
    marker.addEventListener("pointerdown", (event) => beginRoughCutSegmentDrag(event, row, "move"));
    startHandle.addEventListener("pointerdown", (event) => beginRoughCutSegmentDrag(event, row, "start"));
    endHandle.addEventListener("pointerdown", (event) => beginRoughCutSegmentDrag(event, row, "end"));
    marker.addEventListener("click", () => {
      if (marker.dataset.dragged === "true") return;
      selectRoughCutSegment(marker, row);
      seekRoughCutPreview(Number(row.dataset.start) || 0, { keepVisible: true });
    });
    marker.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectRoughCutSegment(marker, row);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        clearRoughCutSegmentSelection();
        return;
      }
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      nudgeRoughCutSegment(row, event.key === "ArrowRight" ? 1 : -1, event);
    });
    track.append(marker);
  });
  track.querySelector(".roughcut-empty")?.remove();
  if (!rows.length) {
    const empty = document.createElement("p");
    empty.className = "roughcut-empty";
    empty.textContent = "目前沒有需要刪除的片段。";
    track.append(empty);
  }
  updateRoughCutSoundRegions();
  updateRoughCutMeta();
  updateRoughCutPreviewFreshnessNotice();
  updateRoughCutPlayhead(roughCutReviewVideo?.currentTime || 0);
  const selectedRow = roughCutRowById(selectedRowId);
  const selectedMarker = selectedRow ? roughCutSegmentForRow(selectedRow) : null;
  if (selectedRow && selectedMarker) selectRoughCutSegment(selectedMarker, selectedRow);
  else clearRoughCutSegmentSelection();
}

function syncRoughCutRow(row, changedField = "start") {
  const duration = roughCutTotalDuration();
  const minimumGap = 0.06;
  const startInput = row.querySelector(".roughcut-start");
  const endInput = row.querySelector(".roughcut-end");
  commitRoughCutControlUndo(changedField.startsWith("end") ? endInput : startInput);
  let start = clampNumber(startInput.value, 0, duration);
  let end = clampNumber(endInput.value, 0, duration);
  if (changedField.startsWith("start") && start > end - minimumGap) end = Math.min(duration, start + minimumGap);
  if (changedField.startsWith("end") && end < start + minimumGap) start = Math.max(0, end - minimumGap);
  if (end <= start) end = Math.min(duration, start + minimumGap);
  setRoughCutRowTimes(row, start, end);
  seekRoughCutPreview(changedField.startsWith("end") ? end : start, { keepVisible: true });
  renderRoughCutTranscriptPreview(activeProject);
}

function seekRoughCutFromTimeline(event) {
  const track = roughCutTimelineTrack();
  if (!track || event.target.closest(".roughcut-waveform-segment, .roughcut-sound-segment, .roughcut-segment-toolbar, .roughcut-playhead, .audio-gain-line")) return;
  clearRoughCutSegmentSelection();
  const rect = track.getBoundingClientRect();
  const ratio = clampNumber((event.clientX - rect.left) / Math.max(1, rect.width), 0, 1);
  seekRoughCutPreview(ratio * roughCutTotalDuration(), { keepVisible: false });
}

function renderRoughCutWaveform(review, removals) {
  roughCutWaveform.replaceChildren();
  if (roughCutTranscriptBasis) {
    const basisLabel = roughCutTranscriptBasisLabel(activeProject);
    roughCutTranscriptBasis.textContent = `逐字稿：${basisLabel}`;
    roughCutTranscriptBasis.title = `目前粗剪依據：${basisLabel}`;
  }
  roughCutWaveform.dataset.duration = String(Math.max(1, Number(review?.durationSeconds) || activeProject?.durationSeconds || 1));
  const duration = roughCutTotalDuration();
  const track = document.createElement("div");
  track.className = "roughcut-waveform-track";
  track.style.width = `${roughCutTimelineZoom * 100}%`;
  roughCutWaveform.style.setProperty("--roughcut-timeline-gutter", `${ROUGH_CUT_TIMELINE_GUTTER}px`);
  track.append(renderRoughCutRuler(duration));

  const videoLane = document.createElement("div");
  videoLane.className = "roughcut-video-lane";
  const videoLabel = document.createElement("span");
  videoLabel.className = "roughcut-track-label roughcut-track-label-video";
  videoLabel.textContent = "素材";
  const filmstrip = document.createElement("div");
  filmstrip.className = "roughcut-video-strip";
  roughCutTimelineThumbnailUrls = Array.isArray(review?.thumbnailUrls) ? review.thumbnailUrls.filter(Boolean) : [];
  videoLane.append(filmstrip);

  const audioLane = document.createElement("div");
  audioLane.className = "roughcut-audio-lane";
  const audioLabel = document.createElement("span");
  audioLabel.className = "roughcut-track-label roughcut-track-label-audio";
  audioLabel.textContent = "聲音";
  const soundRegions = document.createElement("div");
  soundRegions.className = "roughcut-audio-sound-regions";

  const playhead = document.createElement("div");
  playhead.className = "roughcut-playhead";
  playhead.setAttribute("aria-label", "粗剪預覽位置，可左右拖曳調整時間");
  enablePlayheadDrag(playhead, {
    timeFromEvent: pointerTimeOnRoughCutTimeline,
    seek: (seconds, { keepPlaying = false, keepVisible = true } = {}) => seekRoughCutPreview(seconds, { play: keepPlaying, keepVisible }),
    wasPlaying: roughCutPreviewWasPlayingIntent,
    resume: () => resumeRoughCutPreviewAfterSeek({ force: true })
  });
  const segmentToolbar = createRoughCutSegmentToolbar();

  const bars = document.createElement("div");
  bars.className = "roughcut-waveform-bars";
  const gainLine = createAudioGainLine({
    className: "roughcut-audio-gain-line",
    getGain: () => roughCutVolumeGain,
    setGain: (gain) => setRoughCutVolumeGain(gain),
    label: "粗剪輸出影片音量"
  });
  roughCutTimelineWaveformPeaks = Array.isArray(review?.waveformPeaks) ? review.waveformPeaks : [];
  if (!roughCutTimelineWaveformPeaks.length) {
    const unavailable = document.createElement("p");
    unavailable.className = "roughcut-waveform-unavailable";
    unavailable.textContent = "無法讀取這支素材的音量波形";
    audioLane.append(unavailable);
  }
  audioLane.append(soundRegions, bars, gainLine);
  track.append(videoLane, audioLane);
  track.append(playhead, segmentToolbar);
  if (!removals.length) {
    const empty = document.createElement("p");
    empty.className = "roughcut-empty";
    empty.textContent = "目前沒有需要刪除的片段。";
    track.append(empty);
  }
  roughCutWaveform.append(track, videoLabel, audioLabel);
  roughCutWaveform.onclick = seekRoughCutFromTimeline;
  setRoughCutZoom(roughCutTimelineZoom);
  updateRoughCutPlayhead(roughCutReviewVideo?.currentTime || 0);
}

function createRoughCutRemovalRow(range, index, duration) {
  const startValue = clampNumber(range.start, 0, duration);
  const endValue = Math.max(startValue + 0.06, clampNumber(range.end, 0, duration));
  const hasSound = range.enabled === false;
  const row = document.createElement("div");
  row.className = "roughcut-removal-row";
  row.dataset.id = String(range.id || index + 1);
  row.dataset.start = formatEditableSeconds(startValue);
  row.dataset.end = formatEditableSeconds(endValue);
  row.dataset.source = range.source || range.sources?.[0] || "manual_roughcut";
  row.dataset.reason = roughCutReasonLabel(range);
  row.dataset.text = range.text || range.items?.map((item) => item.text).filter(Boolean).join(" / ") || "";
  row.classList.toggle("is-muted", !hasSound);
  row.classList.toggle("is-sound", hasSound);

  const enabledLabel = document.createElement("label");
  enabledLabel.className = "roughcut-enabled-wrap";
  enabledLabel.title = "開啟代表保留，關閉代表從粗剪成片刪除";
  const enabled = document.createElement("input");
  enabled.className = "roughcut-enabled";
  enabled.type = "checkbox";
  enabled.checked = hasSound;
  enabled.ariaLabel = `片段狀態：${hasSound ? "保留" : "刪除"}`;
  const enabledText = document.createElement("span");
  enabledText.className = "roughcut-enabled-state";
  enabledText.textContent = hasSound ? "保留" : "刪除";
  enabledLabel.append(enabled, enabledText);

  const seek = document.createElement("button");
  seek.type = "button";
  seek.className = "roughcut-seek";
  const seekLabel = document.createElement("span");
  seekLabel.textContent = "播放";
  const seekTime = document.createElement("small");
  seekTime.textContent = formatTimelineSeconds(startValue);
  seek.append(seekLabel, seekTime);
  seek.addEventListener("click", () => previewRoughCutRow(row));

  const start = document.createElement("input");
  start.className = "roughcut-start";
  start.type = "number";
  start.min = "0";
  start.max = String(duration);
  start.step = "0.01";
  start.value = formatEditableSeconds(startValue);
  start.ariaLabel = "刪除滑塊開始秒數";

  const end = document.createElement("input");
  end.className = "roughcut-end";
  end.type = "number";
  end.min = "0";
  end.max = String(duration);
  end.step = "0.01";
  end.value = formatEditableSeconds(endValue);
  end.ariaLabel = "刪除滑塊結束秒數";

  const reason = document.createElement("div");
  reason.className = "roughcut-reason";
  const reasonTitle = document.createElement("strong");
  reasonTitle.textContent = roughCutReasonLabel(range);
  const reasonText = document.createElement("small");
  reasonText.textContent = row.dataset.text || "AI 依停頓、重講或語句流暢度判斷。";
  reason.append(reasonTitle, reasonText);

  enabled.addEventListener("focus", () => prepareRoughCutControlUndo(enabled, "切換聲音前"));
  enabled.addEventListener("pointerdown", () => prepareRoughCutControlUndo(enabled, "切換聲音前"));
  enabled.addEventListener("change", () => {
    commitRoughCutControlUndo(enabled);
    enabled.ariaLabel = `片段狀態：${enabled.checked ? "保留" : "刪除"}`;
    setRoughCutRowSoundState(row, enabled.checked);
    updateRoughCutWaveformSegments();
    renderRoughCutTranscriptPreview(activeProject);
    updateRoughCutPreviewControls();
  });
  enabled.addEventListener("blur", () => clearRoughCutControlUndo(enabled));
  start.addEventListener("focus", () => prepareRoughCutControlUndo(start, "修改開始秒數前"));
  start.addEventListener("pointerdown", () => prepareRoughCutControlUndo(start, "修改開始秒數前"));
  start.addEventListener("input", () => syncRoughCutRow(row, "start"));
  start.addEventListener("blur", () => clearRoughCutControlUndo(start));
  end.addEventListener("focus", () => prepareRoughCutControlUndo(end, "修改結束秒數前"));
  end.addEventListener("pointerdown", () => prepareRoughCutControlUndo(end, "修改結束秒數前"));
  end.addEventListener("input", () => syncRoughCutRow(row, "end"));
  end.addEventListener("blur", () => clearRoughCutControlUndo(end));
  row.addEventListener("mouseenter", () => roughCutSegmentForRow(row)?.classList.add("is-row-hover"));
  row.addEventListener("mouseleave", () => roughCutSegmentForRow(row)?.classList.remove("is-row-hover"));
  row.append(enabledLabel, seek, start, end, reason);
  return row;
}

function renderRoughCutRemovalRows(removals = []) {
  const duration = roughCutTotalDuration();
  invalidateRoughCutRemovalRangeCache();
  roughCutRemovalList.replaceChildren();
  const header = document.createElement("div");
  header.className = "roughcut-removal-header";
  for (const label of ["狀態", "預覽", "開始", "結束", "原因"]) {
    const item = document.createElement("span");
    item.textContent = label;
    header.append(item);
  }
  roughCutRemovalList.append(header);
  removals
    .slice()
    .sort((left, right) => Number(left.start) - Number(right.start))
    .forEach((range, index) => roughCutRemovalList.append(createRoughCutRemovalRow(range, index, duration)));
}

function addManualRoughCutMuteRange() {
  const duration = roughCutTotalDuration();
  if (duration <= 0.06) return;
  pushRoughCutUndoSnapshot(createRoughCutTimelineSnapshot("新增刪除滑塊前"));
  const removals = collectEditedRoughCutRemovals();
  const nextId = Math.max(0, ...removals.map((range) => Number(range.id) || 0)) + 1;
  const currentTime = clampNumber(roughCutReviewVideo?.currentTime || 0, 0, duration);
  const segmentLength = Math.min(2, duration);
  const start = Math.min(currentTime, Math.max(0, duration - segmentLength));
  const end = Math.min(duration, start + segmentLength);
  removals.push({
    id: nextId,
    enabled: true,
    start,
    end,
    source: "manual_mute",
    reason: "手動刪除",
    text: "使用者新增的刪除滑塊"
  });
  renderRoughCutRemovalRows(removals);
  updateRoughCutWaveformSegments();
  renderRoughCutTranscriptPreview(activeProject);
  const row = roughCutRemovalList.querySelector(`[data-id="${nextId}"]`);
  if (row) focusRoughCutRow(row);
  seekRoughCutPreview(start, { keepVisible: true });
  showToast("已在目前位置新增刪除滑塊，可拖曳調整頭尾。 ");
}

function renderRoughCutReview(data, { force = false } = {}) {
  const review = data?.roughCutReview;
  const removals = Array.isArray(review?.removals) ? review.removals : [];
  const needsReview = Boolean(review?.sourceVideoUrl) && (force || review?.status === "needs-review");
  setRoughCutReviewOpen(needsReview);
  roughCutRemovalList.replaceChildren();
  roughCutWaveform.replaceChildren();
  setRoughCutSegmentInspectorOpen(false);
  roughCutUndoStack = [];
  roughCutRedoStack = [];
  updateRoughCutHistoryButtons();
  if (!needsReview) {
    roughCutReviewVideo.closest(".roughcut-player-frame")?.classList.remove("is-loading-preview", "is-freezing-frame");
    roughCutRenderedPreviewSignature = "";
    roughCutReviewVideo.removeAttribute("src");
    roughCutReviewVideo.load();
    roughCutTranscriptLines?.replaceChildren();
    updateRoughCutPreviewControls();
    return false;
  }

  const duration = Math.max(1, Number(review.durationSeconds) || data.durationSeconds || 1);
  roughCutRenderedPreviewSignature = review.previewVideoMode === "rendered-roughcut-preview"
    ? roughCutRemovalSignature(removals)
    : "";
  roughCutReviewVideo.controls = true;
  roughCutReviewVideo.preload = "auto";
  roughCutReviewVideo.dataset.previewBaseUrl = review.previewVideoUrl || review.sourceVideoUrl || "";
  roughCutReviewVideo.src = cacheBustedPreviewUrl(roughCutReviewVideo.dataset.previewBaseUrl);
  setRoughCutVolumeGain(review.audioGain ?? data.audioGain ?? 1, { rerender: false });
  const renderLabel = roughCutRenderButton?.querySelector("span:first-child");
  if (renderLabel) renderLabel.textContent = "確認修改";
  renderRoughCutTranscriptPreview(data);
  renderRoughCutWaveform(review, removals);
  setPreviewFallbackImage(roughCutReviewVideo, roughCutTimelineThumbnailUrls[0] || "");
  showPreviewFallbackWhileLoading(roughCutReviewVideo);
  updateRoughCutPreviewFreshnessNotice();
  updateRoughCutPreviewControls();

  renderRoughCutRemovalRows(removals);
  updateRoughCutWaveformSegments();
  return true;
}

function collectEditedRoughCutRemovals() {
  return [...roughCutRemovalList.querySelectorAll(".roughcut-removal-row")]
    .map((row, index) => ({
      id: Number(row.dataset.id) || index + 1,
      enabled: row.querySelector(".roughcut-enabled")?.checked !== true,
      start: Number(row.querySelector(".roughcut-start")?.value),
      end: Number(row.querySelector(".roughcut-end")?.value),
      source: row.dataset.source || "manual_roughcut",
      reason: row.dataset.reason || "人工確認粗剪",
      text: row.dataset.text || ""
    }));
}

function roughCutRemovalSignature(removals = []) {
  return JSON.stringify((Array.isArray(removals) ? removals : [])
    .map((range) => ({
      enabled: range?.enabled !== false,
      start: Number(Number(range?.start || 0).toFixed(2)),
      end: Number(Number(range?.end || 0).toFixed(2))
    }))
    .sort((left, right) => left.start - right.start || left.end - right.end));
}

function roughCutRenderedPreviewIsStale() {
  if (activeProject?.roughCutReview?.previewVideoMode !== "rendered-roughcut-preview") return false;
  if (!roughCutRenderedPreviewSignature) return false;
  return roughCutRemovalSignature(collectEditedRoughCutRemovals()) !== roughCutRenderedPreviewSignature;
}

function updateRoughCutPreviewFreshnessNotice() {
  if (!roughCutPreviewNote) return;
  const renderedPreview = activeProject?.roughCutReview?.previewVideoMode === "rendered-roughcut-preview";
  const stale = roughCutRenderedPreviewIsStale();
  if (stale) {
    roughCutPreviewNote.textContent = "已修改時間軸；左側播放仍是上一版剪後預覽，按「確認修改」會輸出最新版。";
  } else if (renderedPreview) {
    roughCutPreviewNote.textContent = "左側播放的是實際剪後預覽；下方紅色段落不會出現在預覽與成片。";
  } else {
    roughCutPreviewNote.textContent = "青色區域會保留；刪除滑塊覆蓋的片段會從預覽與成片移除。";
  }
  roughCutPreviewNote.classList.toggle("is-stale", stale);
}

function renderSubtitleReview(data, { deferBehindRoughCut = true, force = false } = {}) {
  const review = data?.subtitleReview;
  const captions = Array.isArray(review?.captions) ? review.captions : [];
  const roughCutNeedsReview = deferBehindRoughCut
    && data?.roughCutReview?.status === "needs-review"
    && Array.isArray(data?.roughCutReview?.removals);
  const needsReview = captions.length > 0 && (force || review?.status === "needs-review") && !roughCutNeedsReview;
  setSubtitleReviewOpen(needsReview);
  subtitleCaptionList.replaceChildren();
  if (!needsReview) {
    subtitleTimeline?.replaceChildren();
    selectedSubtitleRowId = "";
    subtitleUndoStack = [];
    subtitleRedoStack = [];
    subtitleTextInputUndoSnapshot = null;
    updateSubtitleHistoryButtons();
    setSubtitleSegmentInspectorOpen(false);
    subtitleReviewVideo.removeAttribute("src");
    subtitleReviewVideo.load();
    updateSubtitlePreviewCaption();
    return;
  }

  subtitleReviewVideo.src = cacheBustedPreviewUrl(review.baseVideoUrl || review.sourceVideoUrl || "");
  subtitleDraftSrtLink.href = review.draftSrtUrl || "#";
  setSubtitleFontScale((review.subtitleStyle?.fontScale || 1) * SUBTITLE_BASE_FONT_PT);
  setSubtitleVolumeGain(review.subtitleStyle?.audioGain ?? data.audioGain ?? 1, { rerender: false });
  const transcriptBasisLabel = roughCutTranscriptBasisLabel(data);
  subtitleReviewMeta.dataset.durationSeconds = String(review.durationSeconds || data.durationSeconds || 0);
  subtitleReviewMeta.dataset.sourceFilename = data.sourceFilename || data.filename || review.sourceFilename || review.baseVideoFilename || data.title || "未命名素材";
  if (subtitleTranscriptBasis) subtitleTranscriptBasis.textContent = `逐字稿：${transcriptBasisLabel}`;
  selectedSubtitleRowId = "";
  setSubtitleSegmentInspectorOpen(false);

  const header = document.createElement("div");
  header.className = "subtitle-caption-header";
  for (const label of ["預覽位置", "開始秒數", "結束秒數", "字幕內容", "操作"]) {
    const item = document.createElement("span");
    item.textContent = label;
    header.append(item);
  }
  subtitleCaptionList.append(header);

  captions.forEach((caption, index) => {
    subtitleCaptionList.append(createSubtitleCaptionRowFromSnapshot({
      id: caption.id || index + 1,
      sourceCaptionId: caption.sourceCaptionId,
      enabled: caption.enabled !== false,
      start: caption.start,
      end: caption.end,
      text: caption.text || ""
    }, index));
  });
  subtitleUndoStack = [];
  subtitleRedoStack = [];
  subtitleTextInputUndoSnapshot = null;
  updateSubtitleHistoryButtons();
  updateSubtitleCaptionActions();
  renderSubtitleTimeline({ preserveScroll: false });
  updateSubtitlePreviewCaption(0);
  const subtitleBurnLabel = subtitleBurnButton?.querySelector("span:first-child");
  if (subtitleBurnLabel) {
    subtitleBurnLabel.textContent = isAwaitingSubtitleApproval(data)
      ? "確認字幕並繼續製作"
      : "確認字幕，燒進影片";
  }
}

function collectEditedCaptions() {
  const rows = [...subtitleCaptionList.querySelectorAll(".subtitle-caption-row")];
  return rows
    .map((row, index) => normalizeSubtitleCaptionForBurn(row, index, rows))
    .filter(Boolean);
}

async function burnReviewedSubtitles() {
  if (!activeProject?.id) return;
  const captions = collectEditedCaptions();
  if (!captions.length) {
    showToast("請至少保留一段字幕。");
    return;
  }
  const invalid = captions.find((caption) => !Number.isFinite(caption.start) || !Number.isFinite(caption.end) || caption.end <= caption.start);
  if (invalid) {
    const label = invalid.id ? `第 ${invalid.id} 句` : "有一段字幕";
    showToast(`${label}字幕時間仍有問題，請確認結束秒數大於開始秒數。`);
    return;
  }

  subtitleBurnButton.disabled = true;
  const label = subtitleBurnButton.querySelector("span:first-child");
  label.textContent = "字幕燒錄中…";
  startSubtitleBurnProgress(captions.length);
  try {
    const response = await fetch(`/api/projects/${activeProject.id}/subtitles/burn`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ captions, subtitleStyle: { fontScale: subtitleFontScaleValue, audioGain: subtitleVolumeGain } })
    });
    const data = await response.json();
    if (!response.ok) throw createWorkflowError(data, "字幕燒錄失敗。");
    finishSubtitleBurnProgress(data);
    setSubtitleReviewOpen(false);
    renderResult(data, { focus: false });
    showToast(data.workflow?.highCostGeneratedAfterSubtitleConfirmation
      ? "已依確認字幕完成 PPT、B-roll 與成片。"
      : "精修字幕影片已完成。");
  } catch (error) {
    failProcessing(error);
    showToast(formatFailureMessage(error.message));
  } finally {
    subtitleBurnButton.disabled = false;
    label.textContent = isAwaitingSubtitleApproval(activeProject)
      ? "確認字幕並繼續製作"
      : "確認字幕，燒進影片";
  }
}

async function renderEditedRoughCut() {
  if (!activeProject?.id) return;
  const removals = collectEditedRoughCutRemovals();
  const invalid = removals.find((range) => (
    range.enabled !== false
    && (!Number.isFinite(range.start) || !Number.isFinite(range.end) || range.end <= range.start)
  ));
  if (invalid) {
    showToast("請確認每段粗剪的結束秒數大於開始秒數。");
    return;
  }

  const activeRemovalCount = removals.filter((range) => range.enabled !== false).length;
  const willGenerateDeferredOutputs = isAwaitingRoughCutApproval();
  roughCutRenderButton.disabled = true;
  const label = roughCutRenderButton.querySelector("span:first-child");
  label.textContent = willGenerateDeferredOutputs ? "確認後製作中…" : "粗剪輸出中…";
  startRoughCutRenderProgress(activeRemovalCount);
  try {
    const response = await fetch(`/api/projects/${activeProject.id}/roughcut/render`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ removals, audioGain: roughCutVolumeGain })
    });
    const data = await response.json();
    if (!response.ok) throw createWorkflowError(data, "AI 粗剪輸出失敗。");
    finishRoughCutRenderProgress(data);
    setRoughCutReviewOpen(false);
    renderResult(data, { focus: false });
    showToast(data.workflow?.awaitingSubtitleApproval
      ? "粗剪已完成，請先精修字幕再製作 PPT、B-roll 與成片。"
      : data.workflow?.highCostGeneratedAfterRoughCut
        ? "已依確認後粗剪完成後續成品。"
        : "AI 粗剪影片已完成。");
  } catch (error) {
    failProcessing(error);
    showToast(formatFailureMessage(error.message));
  } finally {
    roughCutRenderButton.disabled = false;
    label.textContent = "確認修改";
  }
}

function canEditRoughCut(data) {
  const review = data?.roughCutReview;
  return Boolean(review?.sourceVideoUrl && Array.isArray(review?.removals));
}

function canEditSubtitles(data) {
  const review = data?.subtitleReview;
  return Boolean(review?.baseVideoUrl && Array.isArray(review?.captions) && review.captions.length > 0);
}

function renderRevisionPanel(data) {
  const roughCutEditable = canEditRoughCut(data);
  const subtitlesEditable = canEditSubtitles(data);
  revisionPanel?.classList.toggle("hidden", !roughCutEditable && !subtitlesEditable);
  resultEditRoughCutButton?.classList.toggle("hidden", !roughCutEditable);
  resultEditSubtitlesButton?.classList.toggle("hidden", !subtitlesEditable);
}

function openRoughCutEditor() {
  if (!activeProject || !canEditRoughCut(activeProject)) {
    showToast("這個專案沒有可調整的 AI 粗剪資料。");
    return;
  }
  pauseAllPreviewMedia();
  const opened = renderRoughCutReview(activeProject, { force: true });
  if (opened) showToast("已開啟 AI 粗剪調整。");
}

function openSubtitleEditor() {
  if (!activeProject || !canEditSubtitles(activeProject)) {
    showToast("這個專案沒有可精修的字幕資料。");
    return;
  }
  pauseAllPreviewMedia();
  renderSubtitleReview(activeProject, { deferBehindRoughCut: false, force: true });
  showToast("已開啟字幕精修。");
}

function renderTimeline(items = [], { durationSeconds = 0, hasFinalVideo = false, showPptMarkers = true, showBrollMarkers = true } = {}) {
  const relevant = items.filter((item) => (
    showBrollMarkers && Number.isFinite(Number(item.startSeconds))
  ) || (
    showPptMarkers && Number.isFinite(Number(item.slideCueStartSeconds))
  ));
  timelineSection.classList.toggle("hidden", relevant.length === 0);
  videoTimeline.replaceChildren();
  if (!relevant.length) return;

  const maxEnd = Math.max(...relevant.map((item) => Number(item.endSeconds) || Number(item.startSeconds) + secondsFromDurationLabel(item.duration)));
  const total = Math.max(8, Number(durationSeconds) || 0, maxEnd);
  timelineDetail.textContent = hasFinalVideo
    ? (showPptMarkers
      ? "藍色 PPT 與橘色 B-roll 依內容各自切入。"
      : "橘色 B-roll，未剪入 PPT。")
    : (showPptMarkers
      ? "藍色 PPT 與橘色 B-roll 為獨立建議切入點。"
      : "橘色 B-roll。");

  const ruler = document.createElement("div");
  ruler.className = "timeline-ruler";
  const track = document.createElement("div");
  track.className = "timeline-track";
  const startLabel = document.createElement("span");
  startLabel.className = "timeline-bound timeline-start";
  startLabel.textContent = "0:00";
  const endLabel = document.createElement("span");
  endLabel.className = "timeline-bound timeline-end";
  endLabel.textContent = formatTimelineSeconds(total);
  track.append(startLabel, endLabel);

  if (showPptMarkers) {
    const coverMarker = document.createElement("button");
    coverMarker.type = "button";
    coverMarker.className = "timeline-slide-marker timeline-slide-cover";
    coverMarker.style.left = "0%";
    coverMarker.style.width = `${Math.max(2.4, Math.min(100, (2.5 / total) * 100))}%`;
    coverMarker.style.top = "15px";
    coverMarker.title = "PPT 0:00 · 封面切入";
    coverMarker.innerHTML = "<span>PPT</span><b>0:00</b>";
    coverMarker.disabled = !hasFinalVideo;
    coverMarker.addEventListener("click", () => seekToTime(0, "0:00 的 PPT 封面"));
    track.append(coverMarker);
  }

  relevant.forEach((item, index) => {
    const start = Math.max(0, Number(item.startSeconds) || 0);
    const end = Math.max(start + 1, Number(item.endSeconds) || start + secondsFromDurationLabel(item.duration));
    const slideStart = Number(item.slideCueStartSeconds);
    const slideDuration = Math.max(1.8, Number(item.slideCueDuration) || 4);
    if (showPptMarkers && Number.isFinite(slideStart)) {
      const slideLeft = Math.min(98, (Math.max(0, slideStart) / total) * 100);
      const slideWidth = Math.max(2.4, Math.min(100 - slideLeft, (slideDuration / total) * 100));
      const slideMarker = document.createElement("button");
      slideMarker.type = "button";
      slideMarker.className = "timeline-slide-marker";
      slideMarker.style.left = `${slideLeft}%`;
      slideMarker.style.width = `${slideWidth}%`;
      slideMarker.style.top = `${index % 2 === 0 ? 15 : 83}px`;
      slideMarker.title = `PPT ${formatTimelineSeconds(slideStart)} · ${item.cueReason || item.title}`;
      slideMarker.innerHTML = `<span>PPT</span><b>${formatTimelineSeconds(slideStart)}</b>`;
      slideMarker.disabled = !hasFinalVideo;
      slideMarker.addEventListener("click", () => seekToSlideCue(item));
      track.append(slideMarker);
    }
    if (showBrollMarkers) {
      const left = Math.min(98, (start / total) * 100);
      const width = Math.max(2.4, Math.min(100 - left, ((end - start) / total) * 100));
      const marker = document.createElement("button");
      marker.type = "button";
      marker.className = `timeline-marker${item.videoUrl ? "" : " timeline-marker-planned"}`;
      marker.style.left = `${left}%`;
      marker.style.width = `${width}%`;
      marker.style.top = `${index % 2 === 0 ? 31 : 57}px`;
      marker.title = `${item.timecode} · ${item.visualConcept || item.title}${item.videoUrl ? "" : " · 建議鏡頭"}`;
      marker.innerHTML = `<span>${item.timecode}</span><b>${item.visualConcept || item.title}</b>`;
      marker.disabled = !hasFinalVideo || !item.videoUrl;
      marker.addEventListener("click", () => seekToBroll(item));
      track.append(marker);
    }
  });
  ruler.append(track);

  const rows = document.createElement("div");
  rows.className = "timeline-rows";
  relevant.forEach((item, index) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "timeline-row";
    const hasSlideCue = Number.isFinite(Number(item.slideCueStartSeconds));
    const canUseSlideCue = showPptMarkers && hasSlideCue;
    row.disabled = !hasFinalVideo || (!item.videoUrl && !canUseSlideCue);
    const slideLabel = canUseSlideCue ? `PPT ${formatTimelineSeconds(item.slideCueStartSeconds)}｜` : "";
    const brollLabel = showBrollMarkers ? (item.videoUrl ? `B-roll ${item.timecode}` : `建議 ${item.timecode}`) : "";
    row.innerHTML = `<span>${String(index + 1).padStart(2, "0")}</span><strong>${slideLabel}${brollLabel}</strong><small>${item.cueReason || item.shotType}｜${item.visualConcept || item.title}</small>`;
    row.addEventListener("click", () => {
      if (showBrollMarkers && item.videoUrl) seekToBroll(item);
      else if (canUseSlideCue) seekToSlideCue(item);
    });
    rows.append(row);
  });

  videoTimeline.append(ruler, rows);
}

function renderBrollShowcase(items = [], { hasFinalVideo = false } = {}) {
  const generated = items.filter((item) => item.videoUrl);
  const hasGenerationNotices = Boolean(generationNotices?.childElementCount && !generationNotices.classList.contains("hidden"));
  brollShowcase.classList.toggle("hidden", generated.length === 0 && !hasGenerationNotices);
  brollShowcaseDetail.textContent = generated.length === 0
    ? "未通過的片段會在這裡提示。"
    : hasFinalVideo
      ? "可播放、下載、跳到成片。"
      : "可播放與下載。";
  brollShowcaseGrid.replaceChildren();
  finalCues.replaceChildren();
  generated.forEach((item, index) => {
    if (hasFinalVideo) {
      const cue = document.createElement("button");
      cue.type = "button";
      cue.className = "cue-button";
      cue.textContent = `B-roll ${index + 1} · ${item.timecode}`;
      cue.addEventListener("click", () => seekToBroll(item));
      finalCues.append(cue);
    }

    const card = document.createElement("article");
    card.className = "broll-showcase-card";
    const video = document.createElement("video");
    video.src = item.videoUrl;
    video.controls = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = item.frameUrl ? "metadata" : "auto";
    if (item.frameUrl) video.poster = item.frameUrl;
    video.addEventListener("loadedmetadata", () => {
      if (video.poster || video.readyState >= 2) return;
      try {
        video.currentTime = Math.min(0.08, Math.max(0, Number(video.duration) || 0));
      } catch {
        // 無法定位第一幀時保留播放器本身狀態。
      }
    }, { once: true });
    const copy = document.createElement("div");
    copy.className = "broll-showcase-copy";
    const meta = document.createElement("span");
    const slideCue = Number.isFinite(Number(item.slideCueStartSeconds))
      ? `PPT ${formatTimelineSeconds(item.slideCueStartSeconds)} · `
      : "";
    meta.textContent = `${slideCue}B-roll ${item.timecode} · ${item.duration}`;
    const title = document.createElement("h4");
    title.textContent = item.visualConcept || item.title;
    const actions = document.createElement("div");
    actions.className = "broll-showcase-actions";
    const seek = document.createElement("button");
    seek.type = "button";
    seek.textContent = "在成片中查看";
    seek.addEventListener("click", () => seekToBroll(item));
    const download = document.createElement("a");
    download.href = item.videoUrl;
    download.download = projectDownloadFilename(`B-roll-${String(index + 1).padStart(2, "0")}`, extensionFromUrl(item.videoUrl));
    download.textContent = "下載這一段";
    if (hasFinalVideo) actions.append(seek);
    actions.append(download);
    copy.append(meta, title, actions);
    card.append(video, copy);
    brollShowcaseGrid.append(card);
  });
  scheduleRailButtonUpdate("broll-showcase-grid");
}

function transcriptVersions(data = activeProject) {
  return Array.isArray(data?.transcriptReview?.versions) ? data.transcriptReview.versions : [];
}

function transcriptVersionLabel(version) {
  if (!version) return "逐字稿";
  return version.label || version.kind || "逐字稿";
}

function countTranscriptCharacters(value = "") {
  return String(value || "").replace(/\s+/g, "").length;
}

function transcriptWordCountTarget(kind = "") {
  if (kind === "ai-proofread") return transcriptProofreadWordCount;
  if (kind === "ai-highlight-summary") return transcriptHighlightWordCount;
  return transcriptWordCount;
}

function updateTranscriptWordCount(text = "", kind = selectedTranscriptVersion(activeProject, transcriptVersionSelect?.value)?.kind || "") {
  const target = transcriptWordCountTarget(kind);
  if (!target) return;
  const count = countTranscriptCharacters(text);
  target.textContent = `總字數 ${count.toLocaleString("zh-TW")} 字`;
}

function resizeInitialTranscriptEditor() {
  if (!transcriptStageText) return;
  const shouldExpand = Boolean(transcriptStage?.classList.contains("is-initial-review"));
  if (!shouldExpand) {
    transcriptStageText.style.removeProperty("height");
    return;
  }
  transcriptStageText.style.height = "auto";
  transcriptStageText.style.height = `${Math.max(620, transcriptStageText.scrollHeight + 2)}px`;
}

function updateTranscriptCurrentLabel(version) {
  if (!transcriptCurrentLabel) return;
  const originalVersion = firstEditedTranscriptVersion(activeProject)
    || latestTranscriptVersionOfKind(activeProject, "whisper-original")
    || version;
  transcriptCurrentLabel.dataset.kind = originalVersion?.kind || "";
  const eyebrow = transcriptCurrentLabel.querySelector("span");
  const label = transcriptCurrentLabel.querySelector("strong");
  if (eyebrow) eyebrow.textContent = "01 · 原稿";
  if (label) label.textContent = "原始逐字稿";
  updateTranscriptWordCount(originalVersion?.text || activeProject?.transcript || "", originalVersion?.kind || "whisper-original");
}

function selectedTranscriptVersion(data = activeProject, versionId = "") {
  const versions = transcriptVersions(data);
  return versions.find((version) => version.id === versionId)
    || versions.find((version) => version.id === data?.transcriptReview?.selectedVersionId)
    || versions.at(-1)
    || null;
}

function latestTranscriptVersionOfKind(data, kind) {
  const versions = transcriptVersions(data);
  return versions.findLast?.((version) => version.kind === kind)
    || [...versions].reverse().find((version) => version.kind === kind)
    || null;
}

function latestEditableTranscriptVersion(data = activeProject) {
  return latestTranscriptVersionOfKind(data, "ai-proofread")
    || latestTranscriptVersionOfKind(data, "user-edited-full")
    || latestTranscriptVersionOfKind(data, "whisper-original")
    || transcriptVersions(data)[0]
    || null;
}

function latestHighlightTranscriptVersion(data = activeProject) {
  return latestTranscriptVersionOfKind(data, "ai-highlight-summary");
}

function transcriptAccordionVersion(data = activeProject, key = "original") {
  if (key === "proofread") return latestTranscriptVersionOfKind(data, "ai-proofread");
  if (key === "highlight") return latestTranscriptVersionOfKind(data, "ai-highlight-summary");
  return firstEditedTranscriptVersion(data)
    || latestTranscriptVersionOfKind(data, "whisper-original")
    || transcriptVersions(data)[0]
    || null;
}

function applyTranscriptAccordionState({ syncVersion = false, focus = false } = {}) {
  if (activeTranscriptAccordionPanel) activeTranscriptViewKey = activeTranscriptAccordionPanel;
  for (const item of transcriptVersionAccordion?.querySelectorAll("[data-transcript-panel]") || []) {
    const key = item.dataset.transcriptPanel;
    const isOpen = Boolean(activeTranscriptAccordionPanel) && key === activeTranscriptAccordionPanel && !item.classList.contains("is-unavailable");
    const toggle = item.querySelector("[data-transcript-toggle]");
    const panel = item.querySelector(".transcript-version-panel");
    item.classList.toggle("is-open", isOpen);
    toggle?.setAttribute("aria-expanded", isOpen ? "true" : "false");
    if (panel) panel.hidden = !isOpen;
  }
  if (!syncVersion || !activeTranscriptAccordionPanel) return;
  const version = transcriptAccordionVersion(activeProject, activeTranscriptAccordionPanel);
  if (!version?.id) return;
  if (transcriptVersionSelect) transcriptVersionSelect.value = version.id;
  if (transcriptStageText) transcriptStageText.value = version.text || activeProject?.transcript || "";
  updateTranscriptWordCount(version.text || "", version.kind);
  updateTranscriptProofreadMarkup(version);
  if (transcriptStageStatus) {
    transcriptStageStatus.textContent = activeTranscriptAccordionPanel === "original"
      ? "正在查看原稿；可直接修正，切換版本或進入下一步時會自動保存。"
      : activeTranscriptAccordionPanel === "proofread"
        ? "正在查看 AI 校稿版；亮色文字是 AI 修改處，可直接再次修正。"
        : "正在查看 AI 精華摘要版；可補同一句裡 AI 漏掉的內容，但避免新增原片沒有的大段內容。";
  }
  if (focus) {
    const target = activeTranscriptAccordionPanel === "original"
      ? transcriptStageText
      : activeTranscriptAccordionPanel === "proofread" ? transcriptCompareProofread : transcriptHighlightText;
    requestAnimationFrame(() => target?.focus({ preventScroll: true }));
  }
  if (activeTranscriptAccordionPanel === "highlight") {
    updateHighlightInsertStatus(transcriptHighlightText?.innerText || version?.text || "");
  }
  if (activeTranscriptAccordionPanel === "proofread" || activeTranscriptAccordionPanel === "highlight") {
    renderTranscriptSourcePickers(activeProject);
  }
  updateProofreadTranscriptViewMode();
  updateHighlightTranscriptViewMode();
}

function renderTranscriptAccordion(data = activeProject) {
  const versions = {
    original: transcriptAccordionVersion(data, "original"),
    proofread: transcriptAccordionVersion(data, "proofread"),
    highlight: transcriptAccordionVersion(data, "highlight")
  };
  for (const item of transcriptVersionAccordion?.querySelectorAll("[data-transcript-panel]") || []) {
    const key = item.dataset.transcriptPanel;
    const version = versions[key];
    const toggle = item.querySelector("[data-transcript-toggle]");
    item.classList.toggle("is-unavailable", !version?.id);
    item.dataset.versionId = version?.id || "";
    if (toggle) toggle.disabled = !version?.id;
  }
  updateTranscriptCurrentLabel(versions.original);
  if (transcriptProofreadWordCount) {
    transcriptProofreadWordCount.textContent = versions.proofread
      ? `總字數 ${countTranscriptCharacters(versions.proofread.text).toLocaleString("zh-TW")} 字`
      : "等待產生";
  }
  if (transcriptHighlightWordCount) {
    transcriptHighlightWordCount.textContent = versions.highlight
      ? `總字數 ${countTranscriptCharacters(versions.highlight.text).toLocaleString("zh-TW")} 字`
      : "等待產生";
  }
  const firstVersionReady = hasSavedFirstTranscriptVersion(data);
  if (!firstVersionReady) activeTranscriptAccordionPanel = activeTranscriptViewKey = "original";
  else if (!activeTranscriptAccordionPanel || !versions[activeTranscriptAccordionPanel]?.id) activeTranscriptAccordionPanel = activeTranscriptViewKey = "original";
  applyTranscriptAccordionState({ syncVersion: true });
  updateTranscriptProductionChoiceState(data);
}

async function toggleTranscriptAccordionPanel(key) {
  const item = transcriptVersionAccordion?.querySelector(`[data-transcript-panel="${key}"]`);
  if (!item || item.classList.contains("is-unavailable")) return;
  if (!hasSavedFirstTranscriptVersion(activeProject) && key === "original") return;
  const currentVersion = selectedTranscriptVersion(activeProject, transcriptVersionSelect?.value);
  if (currentVersion && transcriptStageText && !currentTranscriptTextMatchesSelectedVersion()) {
    const saved = await saveTranscriptVersion({ silent: true });
    if (!saved) return;
    showToast("目前修改已自動保存。");
  }
  const productionVersion = productionTranscriptVersionForPanel(activeProject, key);
  if (productionVersion?.id) selectProductionTranscriptVersion(productionVersion.id);
  activeTranscriptAccordionPanel = key;
  activeTranscriptViewKey = key;
  applyTranscriptAccordionState({ syncVersion: true, focus: true });
}

function productionTranscriptChoices(data = activeProject) {
  const choices = [
    {
      key: "self-edited",
      version: latestTranscriptVersionOfKind(data, "user-edited-full")
    },
    {
      key: "ai-proofread",
      version: latestTranscriptVersionOfKind(data, "ai-proofread")
    },
    {
      key: "highlight",
      version: latestTranscriptVersionOfKind(data, "ai-highlight-summary")
    }
  ];
  return choices.filter((choice) => choice.version?.id);
}

function selectedProductionTranscriptVersion(data = activeProject) {
  const choices = productionTranscriptChoices(data);
  const choiceVersions = choices.map((choice) => choice.version);
  const selectedId = productionTranscriptVersionId
    || data?.transcriptReview?.selectedVersionId
    || data?.transcriptReview?.usedVersionId
    || "";
  return choiceVersions.find((version) => version.id === selectedId)
    || choiceVersions.find((version) => version.id === data?.transcriptReview?.selectedVersionId)
    || choices.find((choice) => choice.key === "self-edited")?.version
    || choiceVersions[0]
    || null;
}

function selectProductionTranscriptVersion(versionId, { announce = false } = {}) {
  const version = productionTranscriptChoices(activeProject).map((choice) => choice.version).find((item) => item.id === versionId);
  if (!version) return;
  productionTranscriptVersionId = version.id;
  if (activeProject?.transcriptReview) {
    activeProject = {
      ...activeProject,
      transcriptReview: {
        ...activeProject.transcriptReview,
        selectedVersionId: version.id
      }
    };
  }
  updateTranscriptProductionChoiceState(activeProject);
  if (transcriptStageStatus) {
    transcriptStageStatus.textContent = `已勾選「${transcriptVersionLabel(version)}」作為後續製作稿件。`;
  }
  if (transcriptStageActionNote) transcriptStageActionNote.textContent = "已選好後續製作稿件；確認內容後即可進入功能選擇。";
  if (announce) showToast(`已選擇${transcriptVersionLabel(version)}。`);
}

function productionTranscriptVersionForPanel(data = activeProject, key = "original") {
  if (key === "proofread") return latestTranscriptVersionOfKind(data, "ai-proofread");
  if (key === "highlight") return latestTranscriptVersionOfKind(data, "ai-highlight-summary");
  return latestTranscriptVersionOfKind(data, "user-edited-full");
}

function updateTranscriptProductionChoiceState(data = activeProject) {
  const selectedVersion = selectedProductionTranscriptVersion(data);
  for (const item of transcriptVersionAccordion?.querySelectorAll("[data-transcript-panel]") || []) {
    const key = item.dataset.transcriptPanel;
    const version = productionTranscriptVersionForPanel(data, key);
    const input = item.querySelector("[data-transcript-choice]");
    const selectable = Boolean(version?.id);
    if (input) {
      input.disabled = !selectable;
      input.value = version?.id || "";
      input.checked = selectable && version.id === selectedVersion?.id;
    }
    item.classList.toggle("is-selected-for-production", selectable && version.id === selectedVersion?.id);
  }
  if (selectedProductionTranscriptNote) {
    selectedProductionTranscriptNote.textContent = selectedVersion
      ? `已選擇「${transcriptVersionLabel(selectedVersion)}」；後續功能會直接使用這份逐字稿。`
      : "尚未選擇後續製作稿件，請返回上一頁勾選一份逐字稿。";
  }
}

function firstEditedTranscriptVersion(data = activeProject) {
  return latestTranscriptVersionOfKind(data, "user-edited-full");
}

function hasSavedFirstTranscriptVersion(data = activeProject) {
  return Boolean(firstEditedTranscriptVersion(data));
}

function compactTranscriptText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function escapeHtml(value = "") {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function tokenizeDiffText(value = "") {
  return String(value || "").match(/\s+|[\u3400-\u9fff]|[A-Za-z0-9]+(?:[-_./%][A-Za-z0-9]+)*|[^\s]/gu) || [];
}

function diffTokenKey(token = "") {
  return /\s+/.test(token) ? "" : String(token).trim().toLowerCase();
}

function transcriptComparableTokens(value = "") {
  return tokenizeDiffText(value).map(diffTokenKey).filter(Boolean);
}

function transcriptInsertedTokenStats(sourceText = "", editedText = "") {
  const sourceTokens = transcriptComparableTokens(sourceText);
  const editedTokens = transcriptComparableTokens(editedText);
  if (!editedTokens.length) return { insertCount: 0, editedTokenCount: 0, safeInsertionLimit: 24, unsafe: false };
  if (!sourceTokens.length) {
    const safeInsertionLimit = Math.max(24, Math.ceil(editedTokens.length * 0.3));
    return {
      insertCount: editedTokens.length,
      editedTokenCount: editedTokens.length,
      safeInsertionLimit,
      unsafe: editedTokens.length > safeInsertionLimit
    };
  }
  const rows = sourceTokens.length + 1;
  const columns = editedTokens.length + 1;
  const matrix = Array.from({ length: rows }, () => new Uint16Array(columns));
  for (let row = 1; row < rows; row += 1) {
    for (let column = 1; column < columns; column += 1) {
      matrix[row][column] = sourceTokens[row - 1] === editedTokens[column - 1]
        ? matrix[row - 1][column - 1] + 1
        : Math.max(matrix[row - 1][column], matrix[row][column - 1]);
    }
  }
  const matchedEditedIndexes = new Set();
  let row = sourceTokens.length;
  let column = editedTokens.length;
  while (row > 0 && column > 0) {
    if (sourceTokens[row - 1] === editedTokens[column - 1]) {
      matchedEditedIndexes.add(column - 1);
      row -= 1;
      column -= 1;
    } else if (matrix[row - 1][column] >= matrix[row][column - 1]) {
      row -= 1;
    } else {
      column -= 1;
    }
  }
  const insertCount = editedTokens.reduce((count, _token, index) => count + (matchedEditedIndexes.has(index) ? 0 : 1), 0);
  const safeInsertionLimit = Math.max(24, Math.ceil(editedTokens.length * 0.3));
  return {
    insertCount,
    editedTokenCount: editedTokens.length,
    safeInsertionLimit,
    unsafe: insertCount > safeInsertionLimit
  };
}

function updateHighlightInsertStatus(text = transcriptHighlightText?.innerText || transcriptStageText?.value || "") {
  if (!transcriptHighlightInsertStatus) return;
  const version = selectedTranscriptVersion(activeProject, transcriptVersionSelect?.value)
    || latestTranscriptVersionOfKind(activeProject, "ai-highlight-summary");
  if (version?.kind !== "ai-highlight-summary") {
    transcriptHighlightInsertStatus.classList.add("hidden");
    transcriptHighlightInsertStatus.textContent = "";
    transcriptHighlightInsertStatus.dataset.state = "";
    return;
  }
  const stats = transcriptInsertedTokenStats(version.text || "", text);
  transcriptHighlightInsertStatus.classList.remove("hidden");
  transcriptHighlightInsertStatus.dataset.state = stats.unsafe ? "warning" : stats.insertCount ? "ok" : "neutral";
  if (!stats.insertCount) {
    transcriptHighlightInsertStatus.textContent = "目前沒有新增內容；刪字會剪掉對應時間，修錯字會沿用原時間。";
  } else if (stats.unsafe) {
    transcriptHighlightInsertStatus.textContent = `新增內容約 ${stats.insertCount} 個字/詞，已超過可沿用時間碼範圍；請放回原本同一句附近，或減少原片沒有的新內容。`;
  } else {
    transcriptHighlightInsertStatus.textContent = `少量補字約 ${stats.insertCount} 個字/詞，會沿用同一句的原片時間碼。`;
  }
}

function splitProofreadRegionParts(value = "") {
  const parts = [];
  let buffer = "";
  for (const char of String(value || "")) {
    buffer += char;
    if (char === "\n" || /[。！？!?；;：:]/u.test(char)) {
      parts.push(buffer);
      buffer = "";
    }
  }
  if (buffer) parts.push(buffer);
  return parts;
}

function normalizeProofreadRegionText(value = "") {
  return String(value || "")
    .replace(/\s+/g, "")
    .replace(/[，,。！？!?；;：:、（）()「」『』“”"'`．.…⋯\-—–]/g, "")
    .toLowerCase();
}

function markedProofreadRegionsHtml(sourceText = "", proofreadText = "") {
  const sourceRegions = new Set(splitProofreadRegionParts(sourceText)
    .map(normalizeProofreadRegionText)
    .filter(Boolean));
  let changedCount = 0;
  const html = splitProofreadRegionParts(proofreadText).map((part) => {
    const key = normalizeProofreadRegionText(part);
    if (!key) return escapeHtml(part);
    if (sourceRegions.has(key)) return escapeHtml(part);
    changedCount += 1;
    return `<mark class="ai-change-mark ai-change-region">${escapeHtml(part)}</mark>`;
  }).join("");
  return { html, changedCount };
}

function markedProofreadLinesHtml(sourceText = "", proofreadText = "") {
  const sourceLines = new Set(String(sourceText || "")
    .split(/\n+/)
    .map((line) => compactTranscriptText(line))
    .filter(Boolean));
  return String(proofreadText || "").split(/(\n)/).map((part) => {
    if (part === "\n") return "\n";
    if (!part.trim()) return escapeHtml(part);
    const changed = !sourceLines.has(compactTranscriptText(part));
    return changed
      ? `<mark class="ai-change-mark">${escapeHtml(part)}</mark>`
      : escapeHtml(part);
  }).join("");
}

function markedProofreadTokenDiffHtml(sourceText = "", proofreadText = "") {
  const sourceTokens = tokenizeDiffText(sourceText);
  const proofreadTokens = tokenizeDiffText(proofreadText);
  const sourceComparable = sourceTokens.map(diffTokenKey).filter(Boolean);
  const proofreadComparable = [];
  proofreadTokens.forEach((token, tokenIndex) => {
    const key = diffTokenKey(token);
    if (key) proofreadComparable.push({ key, tokenIndex });
  });
  if (!sourceComparable.length || !proofreadComparable.length) return escapeHtml(proofreadText);
  if (sourceComparable.length > 1400 || proofreadComparable.length > 1400) {
    return markedProofreadLinesHtml(sourceText, proofreadText);
  }

  const rows = sourceComparable.length + 1;
  const columns = proofreadComparable.length + 1;
  const matrix = Array.from({ length: rows }, () => new Uint16Array(columns));
  for (let row = 1; row < rows; row += 1) {
    const sourceKey = sourceComparable[row - 1];
    for (let column = 1; column < columns; column += 1) {
      matrix[row][column] = sourceKey === proofreadComparable[column - 1].key
        ? matrix[row - 1][column - 1] + 1
        : Math.max(matrix[row - 1][column], matrix[row][column - 1]);
    }
  }

  const matchedProofreadTokenIndexes = new Set();
  let row = sourceComparable.length;
  let column = proofreadComparable.length;
  while (row > 0 && column > 0) {
    if (sourceComparable[row - 1] === proofreadComparable[column - 1].key) {
      matchedProofreadTokenIndexes.add(proofreadComparable[column - 1].tokenIndex);
      row -= 1;
      column -= 1;
    } else if (matrix[row - 1][column] >= matrix[row][column - 1]) {
      row -= 1;
    } else {
      column -= 1;
    }
  }

  let changedCount = 0;
  let html = "";
  let openMark = false;
  proofreadTokens.forEach((token, tokenIndex) => {
    const comparable = Boolean(diffTokenKey(token));
    const changed = comparable && !matchedProofreadTokenIndexes.has(tokenIndex);
    if (changed && !openMark) {
      html += '<mark class="ai-change-mark">';
      openMark = true;
    }
    if (!changed && openMark) {
      html += "</mark>";
      openMark = false;
    }
    if (changed) changedCount += 1;
    html += escapeHtml(token);
  });
  if (openMark) html += "</mark>";
  return changedCount ? html : escapeHtml(proofreadText);
}

function markedProofreadDiffHtml(sourceText = "", proofreadText = "") {
  const regionDiff = markedProofreadRegionsHtml(sourceText, proofreadText);
  return regionDiff.changedCount ? regionDiff.html : markedProofreadTokenDiffHtml(sourceText, proofreadText);
}

function transcriptOriginalSourceVersion(data = activeProject) {
  return firstEditedTranscriptVersion(data)
    || latestTranscriptVersionOfKind(data, "whisper-original")
    || transcriptVersions(data)[0]
    || null;
}

function transcriptOriginalSourceText(data = activeProject) {
  const sourceVersion = transcriptOriginalSourceVersion(data);
  return sourceVersion?.text || data?.originalTranscript || data?.transcript || "";
}

function transcriptMappingSourceIds(mapping = {}) {
  const ids = [];
  if (mapping?.sourceSegmentId != null) ids.push(mapping.sourceSegmentId);
  if (Array.isArray(mapping?.sourceSegmentIds)) ids.push(...mapping.sourceSegmentIds);
  if (mapping?.segmentId != null) ids.push(mapping.segmentId);
  if (Array.isArray(mapping?.segmentIds)) ids.push(...mapping.segmentIds);
  return ids.map((id) => String(id)).filter(Boolean);
}

function transcriptVersionUsedSourceIds(version = null) {
  const ids = new Set();
  for (const mapping of Array.isArray(version?.mappings) ? version.mappings : []) {
    transcriptMappingSourceIds(mapping).forEach((id) => ids.add(id));
  }
  return ids;
}

function transcriptMatchedSourceIds(data = activeProject, version = null, sourceVersion = null) {
  const sourceSegments = (Array.isArray(sourceVersion?.mappings) ? sourceVersion.mappings : [])
    .map((mapping) => ({
      start: Number(mapping?.start),
      end: Number(mapping?.end),
      text: String(mapping?.text || "").trim(),
      sourceIds: transcriptMappingSourceIds(mapping)
    }))
    .filter((segment) => segment.text && segment.sourceIds.length)
    .sort((left, right) => left.start - right.start);
  const used = new Set();
  if (!sourceSegments.length || !version?.text) return used;
  let cursor = 0;
  const targetLines = roughCutRawTranscriptLines(version.text).map((line) => line.trim()).filter(Boolean);
  for (const line of targetLines) {
    for (const part of roughCutTranscriptSentenceParts(line)) {
      const window = roughCutBestSegmentWindowForPart(part, sourceSegments, cursor);
      if (!window) continue;
      for (let index = window.startIndex; index <= window.endIndex; index += 1) {
        sourceSegments[index]?.sourceIds?.forEach((id) => used.add(String(id)));
      }
      cursor = window.endIndex;
    }
  }
  return used;
}

function transcriptSourceChunks(value = "", sourceVersion = null) {
  if (Array.isArray(sourceVersion?.mappings) && sourceVersion.mappings.length) {
    return sourceVersion.mappings.flatMap((mapping) => {
      const ids = transcriptMappingSourceIds(mapping);
      const text = String(mapping?.text || "").trim();
      if (!text) return [];
      return [{
        text: text.replace(/\s+/g, " ").trim(),
        sourceIds: ids
      }].filter((item) => item.text);
    });
  }
  const chunks = [];
  const pushChunk = (part) => {
    const text = String(part || "").replace(/\s+/g, " ").trim();
    if (text) chunks.push({ text, sourceIds: [] });
  };
  for (const rawLine of String(value || "").replace(/\r/g, "\n").split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    const parts = splitProofreadRegionParts(line).map((part) => part.trim()).filter(Boolean);
    if (!parts.length) pushChunk(line);
    else parts.forEach(pushChunk);
  }
  return chunks;
}

function selectionIsInsideElement(element) {
  const selection = window.getSelection?.();
  if (!selection || !selection.rangeCount || !element) return false;
  return element.contains(selection.anchorNode) && element.contains(selection.focusNode);
}

function placeCaretAtEditableEnd(element) {
  if (!element) return;
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  const selection = window.getSelection?.();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

function transcriptSourceState(kind = "") {
  return transcriptSourceInsertState[kind] || transcriptSourceInsertState["ai-proofread"];
}

function rememberEditableCaret(editableElement, kind = "") {
  const selection = window.getSelection?.();
  if (!selection || !selection.rangeCount || !editableElement || !selectionIsInsideElement(editableElement)) return;
  transcriptSourceState(kind).caretRange = selection.getRangeAt(0).cloneRange();
}

function restoreEditableCaret(editableElement, kind = "") {
  const state = transcriptSourceState(kind);
  const selection = window.getSelection?.();
  if (!selection || !editableElement) return false;
  const range = state.caretRange;
  if (!range || !editableElement.contains(range.commonAncestorContainer)) return false;
  selection.removeAllRanges();
  selection.addRange(range);
  return true;
}

function selectTranscriptSourceChunk(kind = "", text = "", index = -1, isUsed = false) {
  const state = transcriptSourceState(kind);
  state.selectedText = isUsed ? "" : String(text || "").trim();
  state.selectedIndex = isUsed ? -1 : index;
  renderTranscriptSourcePickers(activeProject);
}

function clearTranscriptSourceSelection(kind = "") {
  const state = transcriptSourceState(kind);
  state.selectedText = "";
  state.selectedIndex = -1;
  renderTranscriptSourcePickers(activeProject);
}

function insertSourceTextIntoEditable(editableElement, text, kind = "") {
  const cleanText = String(text || "").trim();
  if (!editableElement || !cleanText) return;
  const state = transcriptSourceState(kind);
  const targetNormalized = normalizeProofreadRegionText(editableElement.innerText || "");
  const sourceNormalized = normalizeProofreadRegionText(cleanText);
  if (sourceNormalized && targetNormalized.includes(sourceNormalized)) {
    showToast("這段已經在目前稿件裡，沒有重複加入。");
    clearTranscriptSourceSelection(kind);
    return;
  }
  activateInlineTranscriptEditing(kind, editableElement, kind === "ai-highlight-summary" ? " AI 精華摘要" : " AI 校稿版");
  editableElement.focus({ preventScroll: true });
  if (!restoreEditableCaret(editableElement, kind) && !selectionIsInsideElement(editableElement)) {
    placeCaretAtEditableEnd(editableElement);
    const current = editableElement.innerText || "";
    if (current.trim()) document.execCommand("insertText", false, "\n");
  }
  state.beforeText = editableElement.innerText || "";
  state.lastInsertedText = cleanText;
  if (sourceNormalized) state.insertedTexts?.add(sourceNormalized);
  document.execCommand("insertText", false, cleanText);
  rememberEditableCaret(editableElement, kind);
  state.selectedText = "";
  state.selectedIndex = -1;
  syncInlineTranscriptEditing(editableElement);
  renderTranscriptSourcePickers(activeProject);
  showToast("已加入選取文字。");
}

function undoLastSourceInsert(editableElement, kind = "") {
  const state = transcriptSourceState(kind);
  if (!editableElement || !state.lastInsertedText || !state.beforeText) return;
  activateInlineTranscriptEditing(kind, editableElement, kind === "ai-highlight-summary" ? " AI 精華摘要" : " AI 校稿版");
  editableElement.innerText = state.beforeText;
  placeCaretAtEditableEnd(editableElement);
  rememberEditableCaret(editableElement, kind);
  state.insertedTexts?.delete(normalizeProofreadRegionText(state.lastInsertedText));
  state.lastInsertedText = "";
  state.beforeText = "";
  syncInlineTranscriptEditing(editableElement);
  renderTranscriptSourcePickers(activeProject);
  showToast("已復原剛剛加入的文字。");
}

function renderTranscriptSourcePicker(container, { sourceText = "", sourceVersion = null, targetText = "", targetElement = null, kind = "", usedSourceIds = new Set() } = {}) {
  if (!container) return;
  container.replaceChildren();
  const state = transcriptSourceState(kind);
  const chunks = transcriptSourceChunks(sourceText, sourceVersion);
  if (!chunks.length) {
    const empty = document.createElement("p");
    empty.className = "transcript-source-empty";
    empty.textContent = "沒有可對照的原始稿來源。";
    container.append(empty);
    return;
  }
  const targetNormalized = normalizeProofreadRegionText(targetText);
  const fragment = document.createDocumentFragment();
  const controls = document.createElement("div");
  controls.className = "transcript-source-controls";
  const preview = document.createElement("p");
  preview.className = "transcript-source-preview";
  preview.textContent = state.selectedText
    ? `已選取：${state.selectedText}`
    : "選一段原始稿後加入。";
  const actions = document.createElement("div");
  actions.className = "transcript-source-actions";
  const insertButton = document.createElement("button");
  insertButton.type = "button";
  insertButton.className = "mini-button transcript-source-action";
  insertButton.textContent = "加入選取文字";
  insertButton.disabled = !state.selectedText;
  insertButton.addEventListener("click", () => insertSourceTextIntoEditable(targetElement, state.selectedText, kind));
  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.className = "mini-button transcript-source-action transcript-source-action-muted";
  cancelButton.textContent = "取消選取";
  cancelButton.disabled = !state.selectedText;
  cancelButton.addEventListener("click", () => clearTranscriptSourceSelection(kind));
  const undoButton = document.createElement("button");
  undoButton.type = "button";
  undoButton.className = "mini-button transcript-source-action transcript-source-action-muted";
  undoButton.textContent = "復原剛加入";
  undoButton.disabled = !state.lastInsertedText;
  undoButton.addEventListener("click", () => undoLastSourceInsert(targetElement, kind));
  actions.append(insertButton, cancelButton, undoButton);
  controls.append(preview, actions);
  fragment.append(controls);
  chunks.forEach((chunkItem, index) => {
    const chunk = typeof chunkItem === "string" ? chunkItem : chunkItem.text;
    const sourceIds = Array.isArray(chunkItem?.sourceIds) ? chunkItem.sourceIds : [];
    const button = document.createElement("button");
    const normalized = normalizeProofreadRegionText(chunk);
    const isUsedBySource = sourceIds.some((id) => usedSourceIds?.has?.(String(id)));
    const isUsed = Boolean(isUsedBySource || (normalized && (targetNormalized.includes(normalized) || state.insertedTexts?.has(normalized))));
    const isSelected = state.selectedIndex === index && state.selectedText === chunk;
    button.type = "button";
    button.className = "transcript-source-chip";
    button.classList.toggle("is-used", isUsed);
    button.classList.toggle("is-selected", isSelected);
    button.dataset.index = String(index + 1);
    button.title = isUsed ? "這段已被目前稿件採用" : "點一下先選取；按加入會補進目前稿件";
    button.textContent = chunk;
    button.addEventListener("click", () => {
      if (isUsed) {
        showToast("這段已經在目前稿件裡。");
        clearTranscriptSourceSelection(kind);
        return;
      }
      selectTranscriptSourceChunk(kind, chunk, index, isUsed);
    });
    fragment.append(button);
  });
  container.append(fragment);
}

function renderTranscriptSourcePickers(data = activeProject) {
  const sourceVersion = transcriptOriginalSourceVersion(data);
  const sourceText = sourceVersion?.text || transcriptOriginalSourceText(data);
  const highlightSourceVersion = sourceVersion;
  const highlightSourceText = highlightSourceVersion?.text || sourceText;
  const proofread = latestTranscriptVersionOfKind(data, "ai-proofread");
  const highlight = latestTranscriptVersionOfKind(data, "ai-highlight-summary");
  renderTranscriptSourcePicker(transcriptProofreadSourcePicker, {
    sourceText,
    sourceVersion,
    targetText: transcriptCompareProofread?.innerText || proofread?.text || "",
    targetElement: transcriptCompareProofread,
    kind: "ai-proofread",
    usedSourceIds: transcriptMatchedSourceIds(data, proofread, sourceVersion)
  });
  const highlightMatchedSourceIds = transcriptMatchedSourceIds(data, highlight, highlightSourceVersion);
  renderTranscriptSourcePicker(transcriptHighlightSourcePicker, {
    sourceText: highlightSourceText,
    sourceVersion: highlightSourceVersion,
    targetText: transcriptHighlightText?.innerText || highlight?.text || "",
    targetElement: transcriptHighlightText,
    kind: "ai-highlight-summary",
    usedSourceIds: highlightMatchedSourceIds.size ? highlightMatchedSourceIds : transcriptVersionUsedSourceIds(highlight)
  });
}

function updateProofreadTranscriptViewMode() {
  const pureMode = proofreadTranscriptViewMode === "script";
  transcriptCompare?.classList.toggle("is-pure-script", pureMode);
  if (!transcriptProofreadViewToggle) return;
  transcriptProofreadViewToggle.textContent = pureMode ? "原稿對比" : "純稿件";
  transcriptProofreadViewToggle.setAttribute("aria-pressed", pureMode ? "true" : "false");
  transcriptProofreadViewToggle.title = pureMode ? "切回原稿對比" : "只看 AI 校稿文字";
}

function updateHighlightTranscriptViewMode() {
  const pureMode = highlightTranscriptViewMode === "script";
  transcriptHighlightView?.classList.toggle("is-pure-script", pureMode);
  if (!transcriptHighlightViewToggle) return;
  transcriptHighlightViewToggle.textContent = pureMode ? "原稿對比" : "純稿件";
  transcriptHighlightViewToggle.setAttribute("aria-pressed", pureMode ? "true" : "false");
  transcriptHighlightViewToggle.title = pureMode ? "切回原稿對比" : "只看 AI 精華摘要文字";
}

function toggleProofreadTranscriptViewMode() {
  if (activeTranscriptAccordionPanel !== "proofread") {
    activeTranscriptAccordionPanel = "proofread";
    activeTranscriptViewKey = "proofread";
    applyTranscriptAccordionState({ syncVersion: true, focus: false });
    return;
  }
  proofreadTranscriptViewMode = proofreadTranscriptViewMode === "script" ? "compare" : "script";
  updateProofreadTranscriptViewMode();
}

function toggleHighlightTranscriptViewMode() {
  if (activeTranscriptAccordionPanel !== "highlight") {
    activeTranscriptAccordionPanel = "highlight";
    activeTranscriptViewKey = "highlight";
    applyTranscriptAccordionState({ syncVersion: true, focus: false });
    return;
  }
  highlightTranscriptViewMode = highlightTranscriptViewMode === "script" ? "compare" : "script";
  updateHighlightTranscriptViewMode();
}

function proofreadDiffSourceForVersion(data = activeProject, proofreadVersion = null) {
  const versions = transcriptVersions(data);
  let sourceVersion = versions.find((version) => version.id && version.id === proofreadVersion?.sourceVersionId) || null;
  const visited = new Set();
  while (sourceVersion?.kind === "ai-proofread" && sourceVersion.sourceVersionId && !visited.has(sourceVersion.id)) {
    visited.add(sourceVersion.id);
    sourceVersion = versions.find((version) => version.id === sourceVersion.sourceVersionId) || sourceVersion;
    if (visited.has(sourceVersion.id)) break;
  }
  return sourceVersion?.text
    || firstEditedTranscriptVersion(data)?.text
    || latestTranscriptVersionOfKind(data, "whisper-original")?.text
    || data?.originalTranscript
    || data?.transcript
    || "";
}

function syncTranscriptProofreadMarkupScroll() {
  if (!transcriptStageText || !transcriptProofreadMarkup) return;
  transcriptProofreadMarkup.scrollTop = transcriptStageText.scrollTop;
  transcriptProofreadMarkup.scrollLeft = transcriptStageText.scrollLeft;
}

function updateAiChangeLegend(markedHtml = "") {
  if (!aiChangeLegend) return;
  const label = aiChangeLegend.querySelector("span");
  if (!label) return;
  const count = (String(markedHtml).match(/class="ai-change-mark/g) || []).length;
  label.textContent = count ? `AI 修改處 ${count} 處` : "AI 修改處";
}

function updateTranscriptProofreadMarkup(version = selectedTranscriptVersion(activeProject, transcriptVersionSelect?.value)) {
  const isProofread = version?.kind === "ai-proofread" && transcriptStagePage === "edit";
  const sourceText = isProofread ? proofreadDiffSourceForVersion(activeProject, version) : "";
  const currentText = transcriptStageText?.value || "";
  transcriptEditorWrap?.classList.toggle("is-marking-ai", Boolean(isProofread && sourceText && currentText));
  transcriptProofreadMarkup?.classList.toggle("hidden", !(isProofread && sourceText && currentText));
  aiChangeLegend?.classList.toggle("hidden", !(isProofread && sourceText && currentText));
  if (isProofread && sourceText && currentText && transcriptProofreadMarkup) {
    const markedHtml = markedProofreadDiffHtml(sourceText, currentText);
    transcriptProofreadMarkup.innerHTML = markedHtml;
    updateAiChangeLegend(markedHtml);
    syncTranscriptProofreadMarkupScroll();
  } else if (transcriptProofreadMarkup) {
    transcriptProofreadMarkup.textContent = "";
    updateAiChangeLegend();
  }
}

function currentTranscriptTextMatchesSelectedVersion() {
  const version = selectedTranscriptVersion(activeProject, transcriptVersionSelect?.value);
  if (!version || !transcriptStageText) return false;
  return compactTranscriptText(transcriptStageText.value) === compactTranscriptText(version.text || "");
}

function setTranscriptStageBusy(busy, label = "") {
  for (const button of [
    transcriptStageSave,
    transcriptStageProofread,
    transcriptStageHighlight,
    transcriptStageGenerateFull,
    transcriptStageBackToEdit,
    featureSelectionBack,
    featureSelectionStart
  ]) {
    if (!button) continue;
    button.disabled = busy;
    button.setAttribute("aria-busy", busy ? "true" : "false");
  }
  for (const button of transcriptVersionToggles) {
    const unavailable = button.closest(".transcript-version-item")?.classList.contains("is-unavailable");
    button.disabled = busy || Boolean(unavailable);
    button.setAttribute("aria-busy", busy ? "true" : "false");
  }
  for (const input of transcriptProductionChoices) {
    const unavailable = input.closest(".transcript-version-item")?.classList.contains("is-unavailable");
    input.disabled = busy || Boolean(unavailable) || !input.value;
  }
  if (busy && transcriptStageStatus) transcriptStageStatus.textContent = label || "正在處理逐字稿版本⋯";
}

function setTranscriptStagePage(page = "edit", { focus = false } = {}) {
  const nextTranscriptStagePage = page === "options" || page === "highlight" ? page : "edit";
  if (nextTranscriptStagePage !== transcriptStagePage) pauseAllPreviewMedia();
  transcriptStagePage = nextTranscriptStagePage;
  const showingOptions = transcriptStagePage === "options";
  const showingHighlight = transcriptStagePage === "highlight";
  const firstVersionReady = hasSavedFirstTranscriptVersion(activeProject);
  const initialReview = !showingOptions && !showingHighlight && !firstVersionReady;
  if (initialReview) activeTranscriptAccordionPanel = "original";
  setProductStage(showingOptions ? "features" : firstVersionReady || showingHighlight ? "ai-draft" : "transcript");
  transcriptStage?.classList.toggle("is-edit-page", !showingOptions && !showingHighlight);
  transcriptStage?.classList.toggle("is-options-page", showingOptions);
  transcriptStage?.classList.toggle("is-highlight-page", showingHighlight);
  transcriptStage?.classList.toggle("is-initial-review", initialReview);
  document.body.classList.toggle("initial-transcript-review", initialReview);
  document.body.classList.toggle("choosing-transcript-features", showingOptions);
  transcriptStage?.classList.toggle("hidden", showingOptions);
  featureSelectionPage?.classList.toggle("hidden", !showingOptions);
  transcriptStage?.querySelectorAll(".transcript-edit-only").forEach((element) => {
    element.classList.toggle("hidden", showingOptions || showingHighlight);
  });
  transcriptAiActions?.classList.toggle("hidden", showingOptions || showingHighlight || !firstVersionReady);
  postTranscriptOptions?.classList.toggle("hidden", !showingOptions);
  transcriptStageSave?.classList.toggle("hidden", showingOptions);
  if (transcriptStageSave) transcriptStageSave.textContent = "保存目前修正";
  transcriptStageBackToEdit?.classList.add("hidden");
  if (transcriptStageBackToEdit) {
    transcriptStageBackToEdit.textContent = showingHighlight ? "回到逐字稿修正" : "回到逐字稿";
  }
  if (transcriptStageGenerateFull) {
    transcriptStageGenerateFull.textContent = showingOptions
      ? "開始製作成品"
      : showingHighlight ? "使用這份精華，選擇功能"
      : firstVersionReady ? "直接進入功能選擇" : "確認原稿";
  }
  if (transcriptStageActionNote) {
    transcriptStageActionNote.textContent = showingOptions
      ? "按下後會開始製作；粗剪與字幕會先進入可修改畫面，確認後才輸出成片。"
      : showingHighlight
        ? "確認後會用這份精華摘要做後續製作；可補同一句裡 AI 漏掉的內容，大量新增會沒有可靠時間碼。"
        : firstVersionReady
          ? "請在左側勾選一份逐字稿，作為後續製作稿件，再進入功能選擇。"
          : "確認原稿後，請在左側勾選後續製作要使用的逐字稿版本。";
  }
  updateTranscriptProductionChoiceState(activeProject);
  if (showingHighlight && transcriptStageStatus) {
    transcriptStageStatus.textContent = "精華摘要已產生；可以補同一句裡 AI 漏掉的內容，但不要新增原片沒有的大段內容。";
  } else if (firstVersionReady && transcriptStageStatus) {
    const selectedVersion = selectedProductionTranscriptVersion(activeProject);
    transcriptStageStatus.textContent = selectedVersion
      ? `已勾選「${transcriptVersionLabel(selectedVersion)}」作為後續製作稿件；你仍可改選其他版本。`
      : "請勾選一份逐字稿，作為後續字幕、粗剪、PPT、B-roll 與成片的內容依據。";
  }
  if (!showingOptions && !showingHighlight && !activeTranscriptAccordionPanel) {
    activeTranscriptAccordionPanel = "original";
    activeTranscriptViewKey = "original";
  }
  if (!showingOptions && !showingHighlight) applyTranscriptAccordionState();
  updateTranscriptProofreadMarkup();
  requestAnimationFrame(resizeInitialTranscriptEditor);
  if (focus) {
    const page = showingOptions ? featureSelectionPage : transcriptStage;
    requestAnimationFrame(() => page?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }
}

function showTranscriptOptionsPage({ preferredVersionId = "" } = {}) {
  const preferredVersion = preferredVersionId
    ? productionTranscriptChoices(activeProject).map((choice) => choice.version).find((version) => version.id === preferredVersionId)
    : null;
  if (preferredVersion?.id) {
    productionTranscriptVersionId = preferredVersion.id;
    updateTranscriptProductionChoiceState(activeProject);
  }
  const selectedVersion = preferredVersion || selectedProductionTranscriptVersion(activeProject);
  productionTranscriptVersionId = selectedVersion?.id || "";
  if (transcriptVersionSelect && selectedVersion?.id) transcriptVersionSelect.value = selectedVersion.id;
  if (transcriptStageText && selectedVersion) transcriptStageText.value = selectedVersion.text || activeProject?.transcript || "";
  updatePostFeatureControls();
  setTranscriptStagePage("options", { focus: true });
}

function renderTranscriptHighlightView(data = activeProject) {
  const highlight = latestHighlightTranscriptVersion(data);
  if (transcriptHighlightText) {
    transcriptHighlightText.textContent = highlight?.text || "尚未產生精華摘要。";
  }
  updateHighlightInsertStatus(highlight?.text || "");
  renderTranscriptSourcePickers(data);
}

function showTranscriptHighlightPage({ focus = true } = {}) {
  const highlight = latestHighlightTranscriptVersion(activeProject);
  if (!highlight?.id) {
    showToast("尚未產生精華摘要。");
    return;
  }
  renderTranscriptHighlightView(activeProject);
  activeTranscriptAccordionPanel = "highlight";
  setTranscriptStagePage("highlight", { focus: false });
  applyTranscriptAccordionState({ syncVersion: true, focus });
}

function returnToTranscriptEditPage() {
  const version = transcriptAccordionVersion(activeProject, "original");
  transcriptStagePage = "edit";
  activeTranscriptAccordionPanel = "original";
  if (transcriptVersionSelect && version?.id) transcriptVersionSelect.value = version.id;
  updateTranscriptStageTextFromSelection();
  setTranscriptStagePage("edit", { focus: true });
  applyTranscriptAccordionState({ syncVersion: true });
}

function returnToTranscriptFromResults() {
  if (!activeProject?.id || !transcriptVersions(activeProject).length) {
    showToast("這個結果沒有可返回的逐字稿版本。");
    return;
  }
  pauseAllPreviewMedia();
  transcriptRevisitMode = true;
  transcriptStagePage = "edit";
  renderResult(activeProject, { focus: false });
  const usedVersionId = activeProject?.transcriptReview?.usedVersionId || activeProject?.transcriptBasis?.versionId || "";
  const version = transcriptVersions(activeProject).find((item) => item.id === usedVersionId)
    || latestEditableTranscriptVersion(activeProject);
  activeTranscriptAccordionPanel = version?.kind === "ai-highlight-summary"
    ? "highlight"
    : version?.kind === "ai-proofread" ? "proofread" : "original";
  if (transcriptVersionSelect && version?.id) transcriptVersionSelect.value = version.id;
  updateTranscriptStageTextFromSelection();
  setTranscriptStagePage("edit", { focus: true });
  applyTranscriptAccordionState({ syncVersion: true });
  showToast("已回到逐字稿；確認後可選另一份稿件重新製作。");
}

function returnToTranscriptForRework(source = "current-step") {
  if (!activeProject?.id || !transcriptVersions(activeProject).length) {
    showToast("這個專案沒有可返回的逐字稿版本。");
    return;
  }
  pauseAllPreviewMedia();
  setRoughCutReviewOpen(false);
  setSubtitleReviewOpen(false);
  transcriptRevisitMode = true;
  transcriptStagePage = "edit";
  renderResult(activeProject, { focus: false });
  const usedVersionId = activeProject?.transcriptReview?.usedVersionId || activeProject?.transcriptBasis?.versionId || "";
  const version = transcriptVersions(activeProject).find((item) => item.id === usedVersionId)
    || latestEditableTranscriptVersion(activeProject);
  activeTranscriptAccordionPanel = version?.kind === "ai-highlight-summary"
    ? "highlight"
    : version?.kind === "ai-proofread" ? "proofread" : "original";
  if (transcriptVersionSelect && version?.id) transcriptVersionSelect.value = version.id;
  updateTranscriptStageTextFromSelection();
  setTranscriptStagePage("edit", { focus: true });
  applyTranscriptAccordionState({ syncVersion: true });
  const label = source === "roughcut" ? "粗剪" : source === "subtitles" ? "字幕" : "目前流程";
  showToast(`已從${label}回到逐字稿；修正後只需要重新製作後續步驟。`);
}

async function handleTranscriptPrimaryAction() {
  if (transcriptStagePage === "options") {
    continueFromTranscriptReview();
    return;
  }
  if (transcriptStagePage === "highlight") {
    if (!currentTranscriptTextMatchesSelectedVersion()) {
      const saved = await saveTranscriptVersion({ silent: true });
      if (!saved) return;
      showToast("精華版修改已自動保存。");
    }
    const highlightVersion = latestTranscriptVersionOfKind(activeProject, "ai-highlight-summary");
    if (!highlightVersion?.id) {
      showToast("找不到可用的 AI 精華摘要稿，請重新產生後再繼續。");
      return;
    }
    selectProductionTranscriptVersion(highlightVersion.id);
    showTranscriptOptionsPage({ preferredVersionId: highlightVersion.id });
    return;
  }
  if (transcriptStagePage !== "options") {
    if (!hasSavedFirstTranscriptVersion(activeProject)) {
      const saved = await saveTranscriptVersion({ silent: true });
      if (!saved) return;
      activeTranscriptAccordionPanel = "original";
      activeTranscriptViewKey = "original";
      updateTranscriptVersionActions(activeProject);
      setTranscriptStagePage("edit", { focus: true });
      showToast("原稿已確認，AI 校稿版與 AI 精華摘要版已準備完成。");
      return;
    }
    if (!currentTranscriptTextMatchesSelectedVersion()) {
      const saved = await saveTranscriptVersion({ silent: true });
      if (!saved) return;
      showToast("AI 校稿修改已自動保存。");
    }
    showTranscriptOptionsPage();
    return;
  }
}

function renderTranscriptComparison(data) {
  const versions = transcriptVersions(data);
  const original = transcriptOriginalSourceVersion(data) || latestTranscriptVersionOfKind(data, "whisper-original") || versions[0] || null;
  const proofread = latestTranscriptVersionOfKind(data, "ai-proofread");
  const originalText = original?.text || data?.originalTranscript || data?.transcript || "";
  const proofreadText = proofread?.text || "";
  const proofreadSourceText = proofread ? proofreadDiffSourceForVersion(data, proofread) : originalText;
  transcriptCompare?.classList.toggle("has-proofread", Boolean(proofreadText));
  if (transcriptCompareOriginal) transcriptCompareOriginal.textContent = originalText || "尚無原始稿";
  if (transcriptCompareProofread) {
    if (proofreadText) transcriptCompareProofread.innerHTML = markedProofreadDiffHtml(proofreadSourceText, proofreadText);
    else transcriptCompareProofread.textContent = "尚未產生 AI 校稿版";
  }
  renderTranscriptSourcePickers(data);
  updateProofreadTranscriptViewMode();
  renderTranscriptAccordion(data);
}

function activateInlineTranscriptEditing(kind, editableElement, label) {
  const version = latestTranscriptVersionOfKind(activeProject, kind);
  if (!version?.id || !editableElement || !transcriptStageText) return;
  if (transcriptVersionSelect) transcriptVersionSelect.value = version.id;
  transcriptStageText.value = editableElement.innerText || version.text || "";
  updateTranscriptWordCount(transcriptStageText.value);
  if (transcriptStageStatus) {
    transcriptStageStatus.textContent = kind === "ai-highlight-summary"
      ? "正在修改 AI 精華摘要；可補同一句裡 AI 漏掉的內容，大量新增會沒有可靠時間碼。"
      : `正在修改${label}；完成後請保存目前修正。`;
  }
  if (transcriptStageActionNote) {
    const saveLabel = kind === "ai-highlight-summary" ? "保存精華修正" : "只保存目前修正";
    transcriptStageActionNote.textContent = `修改完成後按「${saveLabel}」，再進入後續製作。`;
  }
  if (kind === "ai-highlight-summary") updateHighlightInsertStatus(transcriptStageText.value);
}

function syncInlineTranscriptEditing(editableElement) {
  if (!editableElement || !transcriptStageText) return;
  transcriptStageText.value = editableElement.innerText.replace(/\u00a0/g, " ");
  updateTranscriptWordCount(transcriptStageText.value);
  if (editableElement === transcriptHighlightText) updateHighlightInsertStatus(transcriptStageText.value);
  if (editableElement === transcriptHighlightText || editableElement === transcriptCompareProofread) {
    renderTranscriptSourcePickers(activeProject);
  }
}

function restoreInlineProofreadHighlights() {
  const proofread = latestTranscriptVersionOfKind(activeProject, "ai-proofread");
  const currentText = transcriptStageText?.value || transcriptCompareProofread?.innerText || "";
  if (!proofread || !currentText || !transcriptCompareProofread) return;
  const sourceText = proofreadDiffSourceForVersion(activeProject, proofread);
  transcriptCompareProofread.innerHTML = markedProofreadDiffHtml(sourceText, currentText);
}

function updateTranscriptVersionActions(data = activeProject) {
  const firstVersionReady = hasSavedFirstTranscriptVersion(data);
  const automaticVersionsReady = Boolean(
    latestTranscriptVersionOfKind(data, "ai-proofread")
    && latestTranscriptVersionOfKind(data, "ai-highlight-summary")
  );
  transcriptAiActions?.classList.toggle("hidden", !firstVersionReady || automaticVersionsReady || transcriptStagePage === "options");
  transcriptStageProofread?.toggleAttribute("disabled", !firstVersionReady);
  transcriptStageHighlight?.toggleAttribute("disabled", !firstVersionReady || (!data?.transcriptReview?.canGenerateHighlight && !transcriptVersions(data).some((version) => version.timelineUrl)));
}

function updateTranscriptStageTextFromSelection() {
  const version = selectedTranscriptVersion(activeProject, transcriptVersionSelect?.value);
  if (!version) return;
  updateTranscriptCurrentLabel(version);
  if (transcriptStageText) transcriptStageText.value = version.text || activeProject?.transcript || "";
  resizeInitialTranscriptEditor();
  updateTranscriptProofreadMarkup(version);
  if (transcriptStageStatus) {
    transcriptStageStatus.textContent = hasSavedFirstTranscriptVersion(activeProject)
      ? `正在查看「${transcriptVersionLabel(version)}」；左側勾選才會指定後續製作稿件。`
      : "請先檢查原始逐字稿；必要時直接修正，確認後再產生 AI 校稿或精華摘要。";
  }
  renderTranscriptComparison(activeProject);
  updateTranscriptProductionChoiceState(activeProject);
  updateTranscriptVersionActions(activeProject);
  setTranscriptStagePage(transcriptStagePage);
}

function renderTranscriptStage(data) {
  const reviewMode = isTranscriptReview(data);
  transcriptStage?.classList.toggle("hidden", !reviewMode);
  featureSelectionPage?.classList.add("hidden");
  if (!reviewMode) {
    transcriptStagePage = "edit";
    document.body.classList.remove("initial-transcript-review");
    document.body.classList.remove("choosing-transcript-features");
    return false;
  }

  const versions = transcriptVersions(data);
  transcriptVersionSelect?.replaceChildren();
  for (const version of versions) {
    const option = document.createElement("option");
    option.value = version.id;
    option.textContent = transcriptVersionLabel(version);
    transcriptVersionSelect?.append(option);
  }
  if (transcriptVersionSelect) {
    transcriptVersionSelect.value = data.transcriptReview?.selectedVersionId || versions.at(-1)?.id || "";
  }
  updateTranscriptStageTextFromSelection();
  renderTranscriptComparison(data);

  const originalUrl = data.originalTranscriptUrl || versions.find((version) => version.kind === "whisper-original")?.textUrl;
  const proofreadUrl = data.proofreadTranscriptUrl || versions.findLast?.((version) => version.kind === "ai-proofread")?.textUrl;
  const highlightUrl = data.highlightTranscriptUrl || versions.findLast?.((version) => version.kind === "ai-highlight-summary")?.textUrl;
  setDownload("#transcript-stage-original-download", forcedDownloadUrl(data, "originalTranscript", originalUrl));
  setDownload("#transcript-stage-proofread-download", forcedDownloadUrl(data, "proofreadTranscript", proofreadUrl), { hideWhenMissing: true });
  setDownload("#transcript-stage-highlight-download", forcedDownloadUrl(data, "highlightTranscript", highlightUrl), { hideWhenMissing: true });
  renderTranscriptHighlightView(data);
  updateTranscriptVersionActions(data);
  updatePostFeatureControls();
  setTranscriptStagePage(transcriptStagePage);
  if (transcriptStagePage === "edit") renderTranscriptAccordion(data);
  return true;
}

async function saveTranscriptVersion({ silent = false } = {}) {
  if (!activeProject?.id || !transcriptStageText) return null;
  const sourceVersion = selectedTranscriptVersion(activeProject, transcriptVersionSelect?.value);
  const confirmsManualTranscript = !["ai-proofread", "ai-highlight-summary"].includes(sourceVersion?.kind);
  if (sourceVersion?.kind === "ai-highlight-summary") {
    updateHighlightInsertStatus(transcriptStageText.value);
  }
  setTranscriptStageBusy(
    true,
    confirmsManualTranscript ? "正在保存並產生 AI 校稿與精華摘要⋯" : "正在保存目前修正⋯"
  );
  try {
    const response = await fetch(`/api/projects/${activeProject.id}/transcripts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: transcriptStageText.value,
        sourceVersionId: transcriptVersionSelect?.value || activeProject.transcriptReview?.selectedVersionId || "",
        preserveSourceKind: ["ai-proofread", "ai-highlight-summary"].includes(sourceVersion?.kind)
      })
    });
    const data = await response.json();
    if (!response.ok) throw createWorkflowError(data, "逐字稿保存失敗。");
    activeProject = data;
    renderResult(data, { focus: false });
    if (!silent) showToast("目前修正已保存。");
    return data;
  } catch (error) {
    showToast(`${error.workflowAction || ""}${formatFailureMessage(error.message || "逐字稿保存失敗。")}`);
    return null;
  } finally {
    setTranscriptStageBusy(false);
  }
}

async function generateProofreadTranscript() {
  if (!activeProject?.id || !transcriptStageText) return;
  const sourceVersion = firstEditedTranscriptVersion(activeProject);
  if (!sourceVersion?.id) {
    showToast("請先確認原稿，再產生 AI 校稿版。");
    return;
  }
  const selected = selectedTranscriptVersion(activeProject, transcriptVersionSelect?.value);
  if (selected?.kind === "user-edited-full" && !currentTranscriptTextMatchesSelectedVersion()) {
    showToast("目前文字尚未保存，請先保存修正。");
    return;
  }
  setProductStage("ai-draft");
  setTranscriptStageBusy(true, "正在產生 AI 校稿版，約需數分鐘⋯");
  try {
    const response = await fetch(`/api/projects/${activeProject.id}/transcripts/proofread`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceVersionId: sourceVersion.id
      })
    });
    const data = await response.json();
    if (!response.ok) throw createWorkflowError(data, "AI 校稿失敗。");
    activeProject = data;
    renderResult(data, { focus: false });
    showToast("AI 校稿版已產生，請先確認內容。");
  } catch (error) {
    showToast(`${error.workflowAction || ""}${formatFailureMessage(error.message || "AI 校稿失敗。")}`);
  } finally {
    setTranscriptStageBusy(false);
  }
}

async function generateHighlightTranscript() {
  if (!activeProject?.id || !transcriptStageText) return;
  const sourceVersion = firstEditedTranscriptVersion(activeProject);
  if (!sourceVersion?.id) {
    showToast("請先確認原稿，再產生精華摘要。");
    return;
  }
  const selected = selectedTranscriptVersion(activeProject, transcriptVersionSelect?.value);
  if (selected?.kind === "user-edited-full" && !currentTranscriptTextMatchesSelectedVersion()) {
    showToast("目前文字尚未保存，請先保存修正。");
    return;
  }
  setProductStage("ai-draft");
  setTranscriptStageBusy(true, "正在產生 AI 精華摘要，約需數分鐘⋯");
  try {
    const response = await fetch(`/api/projects/${activeProject.id}/transcripts/highlight`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceVersionId: sourceVersion.id
      })
    });
    const data = await response.json();
    if (!response.ok) throw createWorkflowError(data, "精華稿產生失敗。");
    activeProject = data;
    renderResult(data, { focus: false });
    showTranscriptHighlightPage({ focus: true });
    showToast("AI 精華摘要已產生，請確認頭尾與重點。");
  } catch (error) {
    showToast(`${error.workflowAction || ""}${formatFailureMessage(error.message || "精華稿產生失敗。")}`);
  } finally {
    setTranscriptStageBusy(false);
  }
}

async function continueFromTranscriptReview() {
  if (!activeProject?.id) return;
  updatePostFeatureControls();
  if (!selectedPostFeatureLabels().length) {
    showToast("請先選擇至少一項後續功能。");
    return;
  }
  if (document.querySelector("#post-feature-ai-broll")?.checked && !localVisualReady) {
    showToast("品質優先 B-roll 模型尚未設定，請先在終端機執行 npm run setup:visuals。");
    return;
  }
  const selectedVersion = selectedProductionTranscriptVersion(activeProject);
  if (!selectedVersion?.id) {
    showToast("請先選擇一份要用於成片的稿件。");
    return;
  }
  const versionId = selectedVersion.id;
  const text = selectedVersion.text || transcriptStageText?.value || "";
  pauseAllPreviewMedia();
  if (transcriptVersionSelect) transcriptVersionSelect.value = versionId;
  if (transcriptStageText) transcriptStageText.value = text;
  setProductStage("refine");
  setTranscriptStageBusy(true, "正在依指定稿件繼續製作，約需數分鐘⋯");
  const clientStartedAt = Date.now();
  startProcessing({ postTranscript: true });
  try {
    const response = await fetch(`/api/projects/${activeProject.id}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ versionId, text, options: selectedPostProcessingOptions() })
    });
    const data = await response.json();
    if (!response.ok) throw createWorkflowError(data, "後續製作失敗。");
    data.clientProcessingTiming = {
      startedAt: new Date(clientStartedAt).toISOString(),
      completedAt: new Date().toISOString(),
      elapsedSeconds: Number(((Date.now() - clientStartedAt) / 1000).toFixed(1)),
      source: "browser"
    };
    transcriptRevisitMode = false;
    finishProcessing(data);
    renderResult(data);
  } catch (error) {
    failProcessing(error);
  } finally {
    setTranscriptStageBusy(false);
  }
}

function renderGenerationNotices(data) {
  if (!generationNotices) return;
  const notices = Array.isArray(data?.generationNotices) ? data.generationNotices : [];
  generationNotices.classList.toggle("hidden", notices.length === 0);
  generationNotices.replaceChildren(...notices.map((noticeItem) => {
    const item = document.createElement("article");
    const marker = document.createElement("span");
    const copy = document.createElement("div");
    const title = document.createElement("strong");
    const detail = document.createElement("small");
    item.className = "generation-notice-item";
    marker.textContent = "!";
    marker.setAttribute("aria-hidden", "true");
    title.textContent = noticeItem.message || "部分素材未通過品質檢查，已略過並繼續完成。";
    detail.textContent = noticeItem.reason ? `原因：${noticeItem.reason}` : "其他已完成素材不受影響。";
    copy.append(title, detail);
    item.append(marker, copy);
    return item;
  }));
}

function hideResultOutputSections() {
  downloadCenter?.classList.add("hidden");
  resultTranscriptReturn?.classList.add("hidden");
  finalOutput?.classList.add("hidden");
  revisionPanel?.classList.add("hidden");
  timelineSection?.classList.add("hidden");
  brollShowcase?.classList.add("hidden");
  pptPreviewSection?.classList.add("hidden");
  finalVideo?.removeAttribute("src");
  finalVideo?.load();
  renderPptPreview([]);
  renderTimeline([], { durationSeconds: activeProject?.durationSeconds });
  renderBrollShowcase([], { hasFinalVideo: false });
}

function renderResult(data, { focus = true } = {}) {
  pauseAllPreviewMedia();
  activeProject = data;
  selectedMediaProfile = data.sourceMediaProfile || selectedMediaProfile;
  rememberProjectForCleanup(data);
  document.body.classList.add("showing-results");
  document.querySelector("#result-title").textContent = data.title;
  renderGenerationNotices(data);
  const displayLabels = displayFeatureLabels(data.selectedFeatures?.labels);
  const featureText = displayLabels.length ? displayLabels.join(" · ") : "所選功能";
  const metaParts = [data.autoNamed ? "依內容自動命名" : data.filename, featureText];
  if (data.autoNamed && data.sourceFilename) metaParts.push(`來源：${data.sourceFilename}`);
  if (data.slideCount) metaParts.push(`${data.slideCount} 頁簡報`);
  if (data.aiBrollGenerated) metaParts.push(`${data.aiBrollGenerated} 段品質 B-roll`);
  if (data.roughCutReview?.status === "needs-review") metaParts.push("AI 粗剪待確認");
  if (isAwaitingRoughCutApproval(data)) metaParts.push(`確認粗剪後製作：${deferredHighCostLabel(data)}`);
  if (isAwaitingSubtitleApproval(data)) metaParts.push(`確認字幕後製作：${postSubtitleHighCostLabel(data)}`);
  if (data.roughCutVideoUrl) metaParts.push("AI 粗剪影片");
  if (data.subtitleReview?.status === "needs-review") metaParts.push("字幕待精修");
  if (data.subtitledVideoUrl) metaParts.push("字幕版影片");
  document.querySelector("#result-meta").textContent = metaParts.filter(Boolean).join(" · ");
  renderResultRuntime(data);
  const pptMeta = document.querySelector("#ppt-meta");
  if (pptMeta) pptMeta.textContent = data.slideCount ? `${data.slideCount} 頁 · 可編輯 .pptx` : "未選取";
  renderRevisionPanel(data);
  setDownload("#subtitled-video-link", forcedDownloadUrl(data, "subtitledVideo", data.subtitledVideoUrl), { hideWhenMissing: true });
  setDownload("#subtitle-srt-link", forcedDownloadUrl(data, "subtitleSrt", data.subtitleSrtUrl), { hideWhenMissing: true });
  setDownload("#subtitle-ass-link", forcedDownloadUrl(data, "subtitleAss", data.subtitleAssUrl), { hideWhenMissing: true });
  setDownload("#ppt-link", forcedDownloadUrl(data, "pptx", data.pptxUrl), { hideWhenMissing: true });
  setDownload("#ppt-pdf-link", forcedDownloadUrl(data, "pptPdf", data.pptPdfUrl), { hideWhenMissing: data.selectedFeatures?.outputPpt === false });
  setDownload("#ppt-open-link", forcedDownloadUrl(data, "pptx", data.pptxUrl));
  setDownload("#ppt-pdf-open-link", forcedDownloadUrl(data, "pptPdf", data.pptPdfUrl));
  setDownload("#ppt-download-button", forcedDownloadUrl(data, "pptx", data.pptxUrl));
  setDownload("#ppt-pdf-download-button", forcedDownloadUrl(data, "pptPdf", data.pptPdfUrl));
  setDownload("#transcript-link", forcedDownloadUrl(data, "transcript", data.transcriptUrl), { hideWhenMissing: true });
  setDownload("#transcript-download-button", forcedDownloadUrl(data, "transcript", data.transcriptUrl));
  setDownload("#broll-csv-link", forcedDownloadUrl(data, "brollCsv", data.brollCsvUrl), { hideWhenMissing: true });
  setDownload("#broll-json-link", forcedDownloadUrl(data, "brollJson", data.brollJsonUrl));
  setDownload("#roughcut-video-link", forcedDownloadUrl(data, "roughCutVideo", data.roughCutVideoUrl), { hideWhenMissing: true });
  setDownload("#roughcut-plan-link", forcedDownloadUrl(data, "roughCutPlan", data.roughCutPlanUrl), { hideWhenMissing: true });
  const editingPackageUrl = data?.id ? `/api/projects/${data.id}/download/editingPackage` : null;
  setDownload("#editing-package-link", editingPackageUrl, { hideWhenMissing: true });
  setDownload("#editing-package-download-button", editingPackageUrl);
  const transcriptReviewMode = renderTranscriptStage(data);
  document.body.classList.toggle("reviewing-transcript", transcriptReviewMode);
  if (transcriptReviewMode) {
    hideResultOutputSections();
    setRoughCutReviewOpen(false);
    setSubtitleReviewOpen(false);
    results.classList.remove("hidden");
    if (focus) {
      scrollResultsToTop();
      showToast("逐字稿已完成，可以先修正或下載。");
    }
    validateDownloadLinks(data);
    return;
  }
  downloadCenter?.classList.remove("hidden");
  resultTranscriptReturn?.classList.toggle("hidden", !transcriptVersions(data).length);
  const videoDownloadUnit = document.querySelector("#video-download-unit");
  const pptDownloadUnit = document.querySelector("#ppt-download-unit");
  const subtitleDownloadUnit = document.querySelector("#subtitle-download-unit");
  pptDownloadUnit?.classList.toggle("hidden", !data.pptxUrl && !data.pptPdfUrl);
  subtitleDownloadUnit?.classList.toggle("hidden", !data.subtitleSrtUrl && !data.subtitleAssUrl);
  const usesPostSubtitleFinal = data.finalVideoSource === "subtitle-confirmed-high-cost-integrated";
  const displayVideoUrl = usesPostSubtitleFinal
    ? data.finalVideoUrl
    : data.subtitledVideoUrl || data.finalVideoUrl || data.roughCutVideoUrl;
  videoDownloadUnit?.classList.toggle("hidden", !displayVideoUrl);
  finalOutput.classList.toggle("hidden", !displayVideoUrl);
  if (displayVideoUrl) {
    finalOutput.querySelector("h3").textContent = usesPostSubtitleFinal
      ? "完整成片 MP4"
      : data.subtitledVideoUrl
      ? "精修字幕影片 MP4"
      : data.finalVideoUrl ? "完整成片 MP4" : "AI 粗剪影片 MP4";
    finalOutput.querySelector(".final-output-copy > p:not(.kicker)").textContent = usesPostSubtitleFinal
      ? "已依確認字幕整合 B-roll、PPT 與成片設定。"
      : data.subtitledVideoUrl
      ? "字幕已燒錄完成。"
      : data.finalVideoUrl
        ? data.selectedFeatures?.insertPpt && data.selectedFeatures?.aiBroll
          ? "已含 B-roll 與 PPT 畫面。"
          : data.selectedFeatures?.insertPpt
            ? "已含 PPT 畫面。"
            : data.selectedFeatures?.aiBroll
              ? "已含 B-roll 畫面。"
              : "已整合確認後的剪輯與字幕設定。"
        : "已依確認後的片段輸出粗剪版本。";
    if ((finalVideo.getAttribute("src") || "") !== displayVideoUrl) finalVideo.src = displayVideoUrl;
    const videoDownloadKey = usesPostSubtitleFinal
      ? "finalVideo"
      : data.subtitledVideoUrl ? "subtitledVideo" : data.finalVideoUrl ? "finalVideo" : "roughCutVideo";
    const videoDownloadUrl = forcedDownloadUrl(data, videoDownloadKey, displayVideoUrl);
    setDownload("#video-download-button", videoDownloadUrl);
  } else {
    finalVideo.removeAttribute("src");
    finalVideo.load();
    setDownload("#video-download-button", null);
  }
  const hasPptPreview = Array.isArray(data.pptPreviewUrls) && data.pptPreviewUrls.length > 0;
  pptPreviewSection.classList.toggle("hidden", !hasPptPreview);
  renderPptPreview(data.pptPreviewUrls);
  const wantsBrollDisplay = Boolean(data.selectedFeatures?.outputBrollPlan || data.selectedFeatures?.aiBroll);
  const wantsPptTimeline = Boolean(data.selectedFeatures?.insertPpt && Array.isArray(data.broll));
  const visibleBroll = wantsBrollDisplay || wantsPptTimeline ? data.broll : [];
  renderTimeline(visibleBroll, {
    durationSeconds: data.durationSeconds,
    hasFinalVideo: Boolean(data.finalVideoUrl),
    showPptMarkers: wantsPptTimeline,
    showBrollMarkers: wantsBrollDisplay
  });
  renderBrollShowcase(wantsBrollDisplay ? visibleBroll : [], { hasFinalVideo: Boolean(data.finalVideoUrl) });
  const roughCutPanelOpen = renderRoughCutReview(data);
  renderSubtitleReview(data, { deferBehindRoughCut: roughCutPanelOpen });
  const isRefineStage = roughCutPanelOpen
    || data.roughCutReview?.status === "needs-review"
    || data.subtitleReview?.status === "needs-review";
  setProductStage(isRefineStage ? "refine" : "outputs");
  results.classList.toggle("hidden", isRefineStage);
  if (isRefineStage) hideResultOutputSections();
  if (focus) {
    scrollResultsToTop();
    showToast(isAwaitingRoughCutApproval(data)
      ? "已完成 AI 粗剪草稿，確認後再製作後續成品。"
      : `已完成：${featureText}。`);
  }
  validateDownloadLinks(data);
}

function projectIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("project") || "";
  return /^[a-f0-9-]{36}$/i.test(id) ? id : "";
}

async function loadProjectFromUrl() {
  const jobId = projectIdFromUrl();
  if (!jobId) return;
  transcriptRevisitMode = false;
  try {
    const response = await fetch(`/api/projects/${jobId}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "找不到這個結果。");
    renderResult(data, { focus: true });
    const simulatedFailure = simulatedFailureFromUrl();
    if (simulatedFailure) failProcessing(simulatedFailure);
  } catch (error) {
    activeProject = null;
    activeProjectCleanupId = "";
    pauseAllPreviewMedia();
    hideProcessingScreen();
    setRoughCutReviewOpen(false);
    setSubtitleReviewOpen(false);
    results.classList.add("hidden");
    document.body.classList.remove("showing-results", "reviewing-transcript");
    setProductStage("upload");
    setWorkflowStep(1);
    showNotice(error.message || "找不到這個結果。請重新上傳或開啟有效的專案連結。");
    showToast(error.message || "找不到這個結果。");
  }
}

function returnToStudio() {
  pauseAllPreviewMedia();
  hideProcessingScreen();
  cleanupUnclaimedEditingPackage();
  cleanupCurrentProjectArtifacts();
  document.body.classList.remove("showing-results", "reviewing-transcript");
  results.classList.add("hidden");
  activeProject = null;
  transcriptStagePage = "edit";
  transcriptRevisitMode = false;
  form.reset();
  fileInput.value = "";
  fileLabel.textContent = "拖放影片";
  fileHint.textContent = "或點擊選取素材";
  dropZone.classList.remove("has-file", "dragging");
  selectedMediaDurationSeconds = null;
  selectedMediaSignature = "";
  notice.classList.add("hidden");
  setRoughCutReviewOpen(false);
  setSubtitleReviewOpen(false);
  updateFeatureControls();
  setWorkflowStep(1);
  setProductStage("upload");
  requestAnimationFrame(() => {
    studioSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function navigateHome(event) {
  event?.preventDefault();
  if (!confirmDiscardCurrentProject()) return;
  returnToStudio();
  const url = new URL(window.location.href);
  url.searchParams.delete("project");
  url.hash = "#studio";
  history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

async function createProject() {
  notice.classList.add("hidden");
  if (!fileInput.files[0]) {
    setWorkflowStep(1, { focusPanel: true });
    showNotice("請先選擇一支影片。");
    dropZone.focus();
    return;
  }

  submitButton.disabled = true;
  const submitLabel = submitButton.querySelector("span:first-child");
  submitLabel.textContent = "逐字稿轉錄中…";
  submitButton.setAttribute("aria-busy", "true");
  const clientStartedAt = Date.now();
  setProductStage("transcript");
  startProcessing({ transcriptOnly: true });
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  try {
    const response = await fetch("/api/projects", { method: "POST", body: new FormData(form) });
    const data = await response.json();
    if (!response.ok) throw createWorkflowError(data, "專案處理失敗。");
    data.clientProcessingTiming = {
      startedAt: new Date(clientStartedAt).toISOString(),
      completedAt: new Date().toISOString(),
      elapsedSeconds: Number(((Date.now() - clientStartedAt) / 1000).toFixed(1)),
      source: "browser"
    };
    finishProcessing(data);
    renderResult(data);
  } catch (error) {
    failProcessing(error);
  } finally {
    submitButton.disabled = false;
    submitLabel.textContent = "開始轉逐字稿";
    submitButton.removeAttribute("aria-busy");
  }
}

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const helper = document.createElement("textarea");
    helper.value = value;
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.append(helper);
    helper.select();
    document.execCommand("copy");
    helper.remove();
  }
}

fileInput.addEventListener("change", () => setFile(fileInput.files[0]));
for (const input of featureToggles) {
  input.addEventListener("change", () => updateFeatureControls(input));
}
for (const input of postFeatureToggles) {
  input.addEventListener("change", () => updatePostFeatureControls(input));
}
for (const button of stepButtons) {
  button.addEventListener("click", () => goToWorkflowStep(button.dataset.stepTarget));
}
stepBackButton.addEventListener("click", () => goToWorkflowStep(currentWorkflowStep - 1));
stepNextButton.addEventListener("click", () => goToWorkflowStep(currentWorkflowStep + 1));
resultNewProjectButton?.addEventListener("click", navigateHome);
resultNewProjectBottomButton?.addEventListener("click", navigateHome);
resultEditRoughCutButton?.addEventListener("click", openRoughCutEditor);
resultEditSubtitlesButton?.addEventListener("click", openSubtitleEditor);
resultBackToTranscriptButton?.addEventListener("click", returnToTranscriptFromResults);
roughCutBackToTranscript?.addEventListener("click", () => returnToTranscriptForRework("roughcut"));
subtitleBackToTranscript?.addEventListener("click", () => returnToTranscriptForRework("subtitles"));
transcriptVersionSelect?.addEventListener("change", updateTranscriptStageTextFromSelection);
for (const button of transcriptVersionToggles) {
  button.addEventListener("click", () => toggleTranscriptAccordionPanel(button.dataset.transcriptToggle));
}
for (const input of transcriptProductionChoices) {
  input.addEventListener("change", () => {
    if (input.checked && input.value) selectProductionTranscriptVersion(input.value, { announce: true });
  });
}
transcriptStageText?.addEventListener("input", () => {
  updateTranscriptWordCount(transcriptStageText.value);
  updateTranscriptProofreadMarkup();
  resizeInitialTranscriptEditor();
});
transcriptStageText?.addEventListener("scroll", syncTranscriptProofreadMarkupScroll);
transcriptCompareProofread?.addEventListener("focus", () => {
  activateInlineTranscriptEditing("ai-proofread", transcriptCompareProofread, " AI 校稿版");
  rememberEditableCaret(transcriptCompareProofread, "ai-proofread");
});
transcriptCompareProofread?.addEventListener("click", () => rememberEditableCaret(transcriptCompareProofread, "ai-proofread"));
transcriptCompareProofread?.addEventListener("keyup", () => rememberEditableCaret(transcriptCompareProofread, "ai-proofread"));
transcriptCompareProofread?.addEventListener("input", () => {
  rememberEditableCaret(transcriptCompareProofread, "ai-proofread");
  syncInlineTranscriptEditing(transcriptCompareProofread);
});
transcriptCompareProofread?.addEventListener("blur", restoreInlineProofreadHighlights);
transcriptProofreadViewToggle?.addEventListener("click", toggleProofreadTranscriptViewMode);
transcriptHighlightViewToggle?.addEventListener("click", toggleHighlightTranscriptViewMode);
transcriptHighlightText?.addEventListener("focus", () => {
  activateInlineTranscriptEditing("ai-highlight-summary", transcriptHighlightText, " AI 精華摘要");
  rememberEditableCaret(transcriptHighlightText, "ai-highlight-summary");
});
transcriptHighlightText?.addEventListener("click", () => rememberEditableCaret(transcriptHighlightText, "ai-highlight-summary"));
transcriptHighlightText?.addEventListener("keyup", () => rememberEditableCaret(transcriptHighlightText, "ai-highlight-summary"));
transcriptHighlightText?.addEventListener("input", () => {
  rememberEditableCaret(transcriptHighlightText, "ai-highlight-summary");
  syncInlineTranscriptEditing(transcriptHighlightText);
});
transcriptStageSave?.addEventListener("click", saveTranscriptVersion);
transcriptStageProofread?.addEventListener("click", generateProofreadTranscript);
transcriptStageHighlight?.addEventListener("click", generateHighlightTranscript);
transcriptStageBackToEdit?.addEventListener("click", returnToTranscriptEditPage);
transcriptStageGenerateFull?.addEventListener("click", handleTranscriptPrimaryAction);
featureSelectionBack?.addEventListener("click", returnToTranscriptEditPage);
featureSelectionStart?.addEventListener("click", continueFromTranscriptReview);
for (const eventName of ["dragenter", "dragover"]) {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.add("dragging");
  });
}
for (const eventName of ["dragleave", "drop"]) {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.remove("dragging");
  });
}
dropZone.addEventListener("drop", (event) => {
  const [file] = event.dataTransfer.files;
  if (!file) return;
  const transfer = new DataTransfer();
  transfer.items.add(file);
  fileInput.files = transfer.files;
  setFile(file);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  createProject();
});
form.addEventListener("reset", () => requestAnimationFrame(syncCustomSelectControls));
closeProcessing.addEventListener("click", () => {
  if (!window.confirm("關閉後會回到主頁；目前未完成或未輸出的變更不會保留。確定要回主頁嗎？")) return;
  processingFailureState = null;
  returnToStudio();
  const url = new URL(window.location.href);
  url.searchParams.delete("project");
  url.hash = "#studio";
  history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
});
fixProcessing?.addEventListener("click", () => {
  const errorInfo = processingFailureState?.errorInfo;
  if (!errorInfo) {
    hideProcessingScreen();
    return;
  }
  recoverProjectAfterProcessingFailure(errorInfo);
});
roughCutRenderButton?.addEventListener("click", renderEditedRoughCut);
document.querySelectorAll("[data-rail-target]").forEach((button) => {
  button.addEventListener("click", () => scrollRail(button.dataset.railTarget, button.dataset.railDirection));
});
[pptSlides, brollShowcaseGrid].forEach((rail) => {
  rail?.addEventListener("scroll", () => updateRailButtons(rail.id), { passive: true });
});
enableTimelineDragScroll(pptSlides, {
  ignoreSelector: "button, input, textarea, select, [contenteditable=\"true\"]"
});
enableTimelineDragScroll(brollShowcaseGrid, {
  ignoreSelector: "button, input, textarea, select, [contenteditable=\"true\"]"
});
pptLightboxClose?.addEventListener("click", closePptLightbox);
pptLightboxPrev?.addEventListener("click", () => movePptSlide(-1, { open: true }));
pptLightboxNext?.addEventListener("click", () => movePptSlide(1, { open: true }));
pptLightbox?.addEventListener("click", (event) => {
  if (event.target === pptLightbox) closePptLightbox();
});
roughCutZoom?.addEventListener("input", () => setRoughCutZoom(roughCutZoom.value));
roughCutZoomIn?.addEventListener("click", () => setRoughCutZoom(roughCutTimelineZoom + 0.5));
roughCutZoomOut?.addEventListener("click", () => setRoughCutZoom(roughCutTimelineZoom - 0.5));
roughCutVolume?.addEventListener("input", () => setRoughCutVolumeGain(roughCutVolume.value));
roughCutAddMute?.addEventListener("click", addManualRoughCutMuteRange);
enableTimelineDragScroll(roughCutWaveform, {
  ignoreSelector: ".roughcut-waveform-segment, .roughcut-sound-segment, .roughcut-segment-toolbar, .audio-gain-line, button, input, textarea, select, a, [contenteditable=\"true\"]"
});
roughCutUndoButton?.addEventListener("click", undoRoughCutTimelineStep);
roughCutRedoButton?.addEventListener("click", redoRoughCutTimelineStep);
roughCutPreviewPlay?.addEventListener("click", toggleRoughCutPreviewPlayback);
roughCutInspectorClose?.addEventListener("click", () => setRoughCutSegmentInspectorOpen(false));
roughCutInspectorPreview?.addEventListener("click", () => {
  const row = roughCutRowById(roughCutSegmentInspector?.dataset.rowId || "");
  if (row) previewRoughCutRow(row);
});
for (const [input, field] of [[roughCutInspectorStart, "start"], [roughCutInspectorEnd, "end"]]) {
  input?.addEventListener("focus", () => prepareRoughCutControlUndo(input, `修改${field === "start" ? "開始" : "結束"}秒數前`));
  input?.addEventListener("pointerdown", () => prepareRoughCutControlUndo(input, `修改${field === "start" ? "開始" : "結束"}秒數前`));
  input?.addEventListener("input", () => {
    commitRoughCutControlUndo(input);
    syncRoughCutSegmentInspectorTimes(field);
  });
  input?.addEventListener("blur", () => clearRoughCutControlUndo(input));
}
roughCutPreviewScrub?.addEventListener("input", () => {
  const keepPlaying = roughCutPreviewWasPlayingIntent();
  seekRoughCutPreviewEdited(Number(roughCutPreviewScrub.value), { play: keepPlaying, keepVisible: true });
});
roughCutReviewVideo?.addEventListener("timeupdate", () => {
  guardPreviewAgainstBlankFrame(roughCutReviewVideo);
  rememberPreviewStableFrame(roughCutReviewVideo);
  if (!roughCutReviewVideo.paused && !roughCutReviewVideo.ended) markRoughCutPreviewPlaying();
  updateRoughCutPreviewPlayback();
  updateRoughCutTranscriptPreviewPlayback(roughCutReviewVideo.currentTime);
  updateRoughCutPlayhead(roughCutReviewVideo.currentTime, { keepVisible: !roughCutReviewVideo.paused });
});
roughCutReviewVideo?.addEventListener("play", () => {
  markRoughCutPreviewPlaying();
  applyPreviewVideoGain(roughCutReviewVideo, roughCutVolumeGain);
  startPreviewPlaybackMonitor(roughCutReviewVideo, {
    onTick: () => {
      updateRoughCutPreviewControls();
      updateRoughCutTranscriptPreviewPlayback(roughCutReviewVideo.currentTime);
      updateRoughCutPlayhead(roughCutReviewVideo.currentTime, { keepVisible: true });
    },
    onRecovered: () => {
      updateRoughCutPreviewControls();
    }
  });
  startRoughCutPlayheadTicker();
});
roughCutReviewVideo?.addEventListener("playing", () => {
  guardPreviewAgainstBlankFrame(roughCutReviewVideo);
  rememberPreviewStableFrame(roughCutReviewVideo);
  markRoughCutPreviewPlaying();
});
roughCutReviewVideo?.addEventListener("pause", () => {
  const recoveringPlayback = previewRecoveryResumeIntents.get(roughCutReviewVideo);
  if (!recoveringPlayback) stopPreviewPlaybackMonitor(roughCutReviewVideo);
  if (roughCutReviewVideo.seeking) {
    requestRoughCutPreviewResumeAfterSeek();
  } else if (recoveringPlayback) {
    roughCutPreviewResumeSeekUntil = Date.now() + 3200;
  } else {
    roughCutPreviewLastPlayingAt = 0;
    roughCutPreviewResumeSeekUntil = 0;
  }
  if (recoveringPlayback) {
    updateRoughCutPreviewControls();
    updateRoughCutPlayhead(roughCutReviewVideo.currentTime, { keepVisible: true });
    return;
  }
  if (roughCutPreviewSkipGuard) {
    updateRoughCutPreviewControls();
    updateRoughCutPlayhead(roughCutReviewVideo.currentTime, { keepVisible: true });
    return;
  }
  cancelRoughCutPreviewSkip();
  stopRoughCutPlayheadTicker();
  updateRoughCutPlayhead(roughCutReviewVideo.currentTime, { keepVisible: true });
});
roughCutReviewVideo?.addEventListener("ended", () => {
  stopPreviewPlaybackMonitor(roughCutReviewVideo);
  cancelRoughCutPreviewSkip();
  stopRoughCutPlayheadTicker();
  updateRoughCutPlayhead(roughCutReviewVideo.currentTime, { keepVisible: true });
});
roughCutReviewVideo?.addEventListener("seeking", () => {
  requestRoughCutPreviewResumeAfterSeek();
  setRoughCutPreviewSeeking(true);
  updateRoughCutPlayhead(roughCutReviewVideo.currentTime, { keepVisible: true });
  updateRoughCutTranscriptPreviewPlayback(roughCutReviewVideo.currentTime);
  scheduleRoughCutNativeSeekSettle();
});
roughCutReviewVideo?.addEventListener("seeked", () => {
  settleAndRestoreRoughCutPreviewAfterSeek();
});
roughCutReviewVideo?.addEventListener("waiting", () => {
  setRoughCutPreviewSeeking(true);
  startPreviewPlaybackMonitor(roughCutReviewVideo, {
    onTick: () => {
      updateRoughCutPreviewControls();
      updateRoughCutPlayhead(roughCutReviewVideo.currentTime, { keepVisible: true });
    }
  });
  if (roughCutReviewVideo.paused) scheduleRoughCutNativeSeekSettle();
});
["stalled", "suspend", "emptied"].forEach((eventName) => {
  roughCutReviewVideo?.addEventListener(eventName, () => {
    if (roughCutReviewVideo.paused || roughCutReviewVideo.ended) return;
    setRoughCutPreviewSeeking(true);
    startPreviewPlaybackMonitor(roughCutReviewVideo, {
      onTick: () => {
        updateRoughCutPreviewControls();
        updateRoughCutPlayhead(roughCutReviewVideo.currentTime, { keepVisible: true });
      }
    });
  });
});
roughCutReviewVideo?.addEventListener("playing", () => {
  if (!roughCutPreviewSkipGuard) setRoughCutPreviewSeeking(false);
});
roughCutReviewVideo?.addEventListener("canplay", () => {
  guardPreviewAgainstBlankFrame(roughCutReviewVideo);
  rememberPreviewStableFrame(roughCutReviewVideo);
  hidePreviewFallbackWhenFrameReady(roughCutReviewVideo);
  settleAndRestoreRoughCutPreviewAfterSeek();
});
roughCutReviewVideo?.addEventListener("loadeddata", () => {
  guardPreviewAgainstBlankFrame(roughCutReviewVideo);
  rememberPreviewStableFrame(roughCutReviewVideo);
  hidePreviewFallbackWhenFrameReady(roughCutReviewVideo);
  settleAndRestoreRoughCutPreviewAfterSeek();
});
roughCutReviewVideo?.addEventListener("error", () => {
  stopPreviewPlaybackMonitor(roughCutReviewVideo);
  cancelRoughCutPreviewSkip();
  stopRoughCutPlayheadTicker();
  updateRoughCutPreviewControls();
  showToast("預覽影片暫時無法解碼，請重新整理後再試。");
});
roughCutReviewVideo?.addEventListener("loadedmetadata", () => {
  showPreviewFallbackWhileLoading(roughCutReviewVideo);
  updateRoughCutPlayhead(roughCutReviewVideo.currentTime || 0);
  updateRoughCutPreviewControls();
});
subtitleZoom?.addEventListener("input", () => setSubtitleZoom(subtitleZoom.value));
subtitleZoomIn?.addEventListener("click", () => setSubtitleZoom(subtitleTimelineZoom + 0.5));
subtitleZoomOut?.addEventListener("click", () => setSubtitleZoom(subtitleTimelineZoom - 0.5));
subtitleFontScale?.addEventListener("input", () => setSubtitleFontScale(subtitleFontScale.value));
subtitleVolume?.addEventListener("input", () => setSubtitleVolumeGain(subtitleVolume.value));
enableTimelineDragScroll(subtitleTimeline, {
  ignoreSelector: ".subtitle-timeline-block, .subtitle-sound-segment, .subtitle-segment-toolbar, .audio-gain-line, button, input, textarea, select, a, [contenteditable=\"true\"]"
});
subtitleInspectorClose?.addEventListener("click", () => setSubtitleSegmentInspectorOpen(false));
subtitleUndoButton?.addEventListener("click", undoSubtitleTimelineStep);
subtitleRedoButton?.addEventListener("click", redoSubtitleTimelineStep);
subtitleInspectorPreview?.addEventListener("click", () => {
  const row = subtitleRowById(subtitleSegmentInspector?.dataset.rowId || "");
  if (row) playMediaAt(subtitleReviewVideo, Math.max(0, Number(row.querySelector(".subtitle-start")?.value) || 0));
});
subtitleInspectorStart?.addEventListener("change", () => syncSubtitleInspectorFields("start"));
subtitleInspectorEnd?.addEventListener("change", () => syncSubtitleInspectorFields("end"));
subtitleInspectorText?.addEventListener("focus", () => {
  subtitleTextInputUndoSnapshot = createSubtitleSnapshot("修改字幕文字前");
});
subtitleInspectorText?.addEventListener("input", () => {
  const row = subtitleRowById(subtitleSegmentInspector?.dataset.rowId || "");
  const text = row?.querySelector(".subtitle-text");
  if (!row || !text) return;
  text.value = subtitleInspectorText.value;
  const block = subtitleBlockForRow(row);
  const displayText = subtitleInspectorText.value.trim();
  if (!block || !displayText) {
    renderSubtitleTimeline();
    updateSubtitlePreviewCaption();
    updateSubtitleSegmentInspector(row);
    return;
  }
  if (block) {
    const start = Number(row.querySelector(".subtitle-start")?.value) || 0;
    const end = Number(row.querySelector(".subtitle-end")?.value) || start;
    const content = block.querySelector("span");
    if (content) content.textContent = displayText;
    block.title = `${formatTimelineSeconds(start)} - ${formatTimelineSeconds(end)}\n${displayText}`;
  }
  updateSubtitleSegmentInspector(row);
  updateSubtitlePreviewCaption();
});
subtitleInspectorText?.addEventListener("blur", commitSubtitleTextUndoSnapshot);
subtitleInspectorMerge?.addEventListener("click", () => {
  const row = subtitleRowById(subtitleSegmentInspector?.dataset.rowId || "");
  if (row) mergeSubtitleRowWithNext(row);
});
subtitleReviewVideo?.addEventListener("timeupdate", () => {
  rememberPreviewStableFrame(subtitleReviewVideo);
  updateSubtitlePlayhead(subtitleReviewVideo.currentTime || 0, { keepVisible: !subtitleReviewVideo.paused });
});
subtitleReviewVideo?.addEventListener("play", () => {
  markSubtitlePreviewPlaying();
  applyPreviewVideoGain(subtitleReviewVideo, subtitleVolumeGain);
  startSubtitlePlayheadTicker();
});
subtitleReviewVideo?.addEventListener("playing", () => {
  rememberPreviewStableFrame(subtitleReviewVideo);
  markSubtitlePreviewPlaying();
});
subtitleReviewVideo?.addEventListener("pause", () => {
  if (subtitleReviewVideo.seeking) {
    requestSubtitlePreviewResumeAfterSeek();
  } else {
    subtitlePreviewLastPlayingAt = 0;
    subtitlePreviewResumeSeekUntil = 0;
    subtitlePreviewExplicitSeekShouldResume = false;
  }
  stopSubtitlePlayheadTicker();
  updateSubtitlePlayhead(subtitleReviewVideo.currentTime || 0, { keepVisible: true });
});
subtitleReviewVideo?.addEventListener("ended", () => {
  stopSubtitlePlayheadTicker();
  updateSubtitlePlayhead(subtitleReviewVideo.currentTime || 0, { keepVisible: true });
});
subtitleReviewVideo?.addEventListener("timeupdate", () => {
  if (!subtitleReviewVideo.paused && !subtitleReviewVideo.ended) markSubtitlePreviewPlaying();
});
subtitleReviewVideo?.addEventListener("seeking", () => {
  requestSubtitlePreviewResumeAfterSeek();
  setSubtitlePreviewSeeking(true);
  updateSubtitlePlayhead(subtitleReviewVideo.currentTime || 0, { keepVisible: true });
});
subtitleReviewVideo?.addEventListener("seeked", () => {
  restoreSubtitlePreviewAfterSeekIfNeeded();
  subtitlePreviewExplicitSeekShouldResume = false;
  setSubtitlePreviewSeeking(false);
});
subtitleReviewVideo?.addEventListener("waiting", () => setSubtitlePreviewSeeking(true));
subtitleReviewVideo?.addEventListener("playing", () => setSubtitlePreviewSeeking(false));
subtitleReviewVideo?.addEventListener("canplay", () => {
  rememberPreviewStableFrame(subtitleReviewVideo);
  restoreSubtitlePreviewAfterSeekIfNeeded();
  setSubtitlePreviewSeeking(false);
});
subtitleReviewVideo?.addEventListener("loadeddata", () => {
  rememberPreviewStableFrame(subtitleReviewVideo);
  restoreSubtitlePreviewAfterSeekIfNeeded();
  setSubtitlePreviewSeeking(false);
});
subtitleReviewVideo?.addEventListener("loadedmetadata", () => renderSubtitleTimeline());
subtitleBurnButton.addEventListener("click", burnReviewedSubtitles);
document.addEventListener("click", (event) => {
  if (!event.target.closest(".custom-select")) closeCustomSelectMenus();
});
document.addEventListener("keydown", (event) => {
  if (!pptLightbox?.classList.contains("hidden")) {
    if (event.key === "Escape") {
      event.preventDefault();
      closePptLightbox();
      return;
    }
    if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      movePptSlide(event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1, { open: true });
      return;
    }
  }
  if (event.key === "Escape") closeCustomSelectMenus();
  handleEditorPreviewShortcut(event);
}, { capture: true });

document.addEventListener("click", async (event) => {
  const download = event.target.closest("a[download]");
  if (!download) return;
  if (!download.getAttribute("href") || download.getAttribute("href") === "#") {
    event.preventDefault();
    if (!activeProject) {
      showToast("請先完成本次專案，下載連結才會綁定檔案。");
      return;
    }
    showToast("這個檔案尚未產生。");
    return;
  }
  if ("showSaveFilePicker" in window) {
    event.preventDefault();
    await saveDownloadWithPicker(download);
    return;
  }
  const nativeSaveEndpoint = nativeSaveEndpointForDownload(download.href);
  if (nativeSaveEndpoint) {
    event.preventDefault();
    await saveDownloadWithNativeDialog(download);
    return;
  }
  if (/\/download\/editingPackage(?:$|[?#])/.test(new URL(download.href, window.location.href).pathname)) {
    markEditingPackageDownloaded();
  }
  showToast("此瀏覽器不支援選擇位置，已改用預設下載資料夾。");
});

function updateTopbarState() {
  topbar?.classList.toggle("is-scrolled", window.scrollY > 12);
}

window.addEventListener("scroll", updateTopbarState, { passive: true });
window.addEventListener("pageshow", () => {
  recoverStaleFullscreenState();
  cancelCurrentProjectCleanup();
});
window.addEventListener("pagehide", () => cleanupUnclaimedEditingPackage({ beacon: true }));
window.addEventListener("pagehide", () => scheduleCurrentProjectCleanup({ beacon: true }));
brandLink?.addEventListener("click", navigateHome);
document.addEventListener("visibilitychange", recoverStaleFullscreenState);
updateTopbarState();
recoverStaleFullscreenState();
startAmbientParticles();
enhanceSelectControls();
updateFeatureControls();
updatePostFeatureControls();
setWorkflowStep(1);
setProductStage("upload");
checkHealth();
loadProjectFromUrl();

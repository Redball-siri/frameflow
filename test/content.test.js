import test from "node:test";
import assert from "node:assert/strict";
import { alignBrollPlanToTimeline, assessTranscriptQuality, brollPlanToCsv, buildBrollPlan, buildStoryOutline, buildTitleStrategy, buildVideoTitle, cleanTranscriptForContent, DEMO_TRANSCRIPT, formatTime, formatTimelineSegmentsAsTranscript, formatTranscriptForSingleLineCaptions, splitSentences } from "../lib/content.js";

const transcript = "今天介紹一套內容製作流程。先把影片轉成逐字稿，再整理成簡報。接著替每段內容安排產品特寫與人物操作。最後輸出完整素材包，讓團隊快速開始剪輯。";

test("splitSentences handles Traditional Chinese punctuation", () => {
  assert.equal(splitSentences(transcript).length, 4);
});

test("splitSentences breaks a long unpunctuated transcript into usable sections", () => {
  const transcript = "這是一段沒有標點但仍然需要被拆成多個內容段落的逐字稿".repeat(30);
  const sentences = splitSentences(transcript);
  assert.ok(sentences.length >= 5);
  assert.ok(sentences.every((sentence) => sentence.length <= 150));
});

test("transcript quality accepts coherent speech and rejects noisy repetitions", () => {
  assert.equal(assessTranscriptQuality(DEMO_TRANSCRIPT).usable, true);
  const noisy = `${"噢".repeat(120)} 我我我你你你這個那個沒有沒有 ${"哈".repeat(80)} 字幕by測試`;
  const assessment = assessTranscriptQuality(noisy);
  assert.equal(assessment.usable, false);
  assert.ok(assessment.issues.length > 0);
  assert.doesNotMatch(cleanTranscriptForContent(noisy), /字幕by/);
});

test("timeline transcript formatter restores readable punctuation from short segments", () => {
  const segments = [
    { start: 0, end: 1.4, text: "一年一度要講一些事情" },
    { start: 1.5, end: 3.2, text: "其實也是跟公司有關" },
    { start: 4.1, end: 5.4, text: "今年有一些不變的東西" },
    { start: 5.5, end: 7.2, text: "也有一些會一直改變的東西" },
    { start: 8.1, end: 10.0, text: "大家知道這個答案嗎" },
    { start: 10.1, end: 11.9, text: "我們先談第一件事情" },
    { start: 12.7, end: 14.2, text: "公司每一年都會遇到年初的寒冬" },
    { start: 14.3, end: 16.4, text: "但是每個人的角色還是要回到自己的專注點" }
  ];
  const formatted = formatTimelineSegmentsAsTranscript(segments, segments.map((segment) => segment.text).join(""));
  assert.match(formatted, /。/);
  assert.match(formatted, /？/);
  assert.equal(assessTranscriptQuality(formatted).usable, true);
});

test("buildStoryOutline respects a practical slide count", () => {
  const outline = buildStoryOutline(transcript, { slideCount: 8 });
  assert.equal(outline.length, 4);
  assert.ok(outline.every((section) => section.title && section.summary));
  assert.ok(outline.every((section) => section.takeaway && section.bullets.length >= 3));
  assert.ok(outline.every((section) => section.bullets.every((bullet) => bullet.length <= 43)));
  assert.ok(outline.every((section) => section.mainPoint && section.audienceTakeaway && section.logicTransition));
  assert.ok(outline.every((section) => Array.isArray(section.supportingDetails)));
});

test("buildStoryOutline can create a denser B-roll outline when requested", () => {
  const denseTranscript = Array.from({ length: 12 }, (_, index) => (
    `第${index + 1}段說明一個可視覺化的工作情境，包含人物操作、道具細節與清楚的行動目的。`
  )).join("\n");
  const outline = buildStoryOutline(denseTranscript, { slideCount: 14, maxContentSlides: 12 });
  const plan = buildBrollPlan(outline, { durationSeconds: 240, targetCount: 10 });
  assert.equal(outline.length, 10);
  assert.equal(plan.length, 10);
});

test("buildStoryOutline rewrites noisy interview speech into readable slide topics", () => {
  const noisyInterview = [
    "您現在看到的是精華版若要看到完整版請點選資訊欄的專屬連結加入官方LINE，",
    "最近在準備奧德修斯的專場，想把古典史詩改寫成喜劇特輯，讓神話挑戰對照現代生活。",
    "AI它對於創意工作者會有什麼樣的衝擊，未來寫手跟文字能力可能會被工具快速扁平化。",
    "Secondary的那些Follower大概是34，加起來還不到40，很多人會等世界變了才跟上。",
    "笑話用AI來創作不是只有聯想清單A跟B，還需要情緒這個C，不然比喻很生動但一點都不好笑。",
    "關於笑話的界限，問題不是只有能不能講，而是笑話打向強者還是弱者，以及會不會造成霸凌。"
  ].join("\n");
  const outline = buildStoryOutline(noisyInterview, { slideCount: 8 });
  const titles = outline.map((section) => section.title).join(" / ");
  assert.match(titles, /奧德修斯|AI|笑話/);
  assert.doesNotMatch(titles, /Secondary|Follow|精華版|\.\.\.|…/);
  assert.ok(outline.every((section) => section.bullets.every((bullet) => bullet.length <= 43)));
});

test("buildVideoTitle summarizes content instead of relying on filenames", () => {
  const title = buildVideoTitle([
    "AI它對於創意工作者會有什麼樣的衝擊，未來寫手跟文字能力可能會被工具快速扁平化。",
    "笑話用AI來創作不是只有聯想清單A跟B，還需要情緒這個C，不然比喻很生動但一點都不好笑。",
    "關於笑話的界限，問題不是只有能不能講，而是笑話打向強者還是弱者，以及會不會造成霸凌。"
  ].join("\n"), { slideCount: 8 });
  assert.equal(title, "AI如何改變喜劇創作與笑話界線");
  assert.doesNotMatch(title, /videoplayback|mp4|mov|檔案/u);
});

test("buildVideoTitle can use a shared outline without re-reading transcript content", () => {
  const title = buildVideoTitle("AI人工智慧喜劇笑話界線", {
    slideCount: 8,
    outline: [
      { title: "產品特色與使用情境", keywords: ["產品", "使用情境"] },
      { title: "功能如何解決工作流程", keywords: ["功能", "工作流程"] }
    ]
  });
  assert.equal(title, "產品特色與使用情境解析");
});

test("buildTitleStrategy extracts key points and subtitle-ready title options", () => {
  const strategy = buildTitleStrategy([
    "AI它對於創意工作者會有什麼樣的衝擊，未來寫手跟文字能力可能會被工具快速扁平化。",
    "笑話用AI來創作不是只有聯想清單A跟B，還需要情緒這個C，不然比喻很生動但一點都不好笑。",
    "關於笑話的界限，問題不是只有能不能講，而是笑話打向強者還是弱者，以及會不會造成霸凌。"
  ].join("\n"), { slideCount: 8 });
  assert.equal(strategy.primaryTitle, "AI如何改變喜劇創作與笑話界線");
  assert.equal(strategy.shouldUseSubtitle, true);
  assert.match(strategy.subtitle, /AI|笑話|喜劇|情緒|界線/);
  assert.ok(strategy.keyPoints.length >= 2);
  assert.ok(strategy.keyPoints.every((point) => point.point && point.evidence));
  assert.ok(strategy.titleCandidates.length >= 3);
  assert.match(strategy.evidencePolicy, /逐字稿/);
});

test("buildTitleStrategy rejects noisy opening fragments when naming business talks", () => {
  const strategy = buildTitleStrategy([
    "一年一度要講一些，也是其實跟公司有關的事情。",
    "今年公司有一些不變，也有一些改變，人事變動和離開的人都要回到團隊合作來看。",
    "因為為什麼因為在做企劃，每一年年度開始，各個合作廠商都在準備企劃。",
    "今年 Q1 Q2 都不好做，很多案子延後，營業額跟收支沒有辦法平衡。",
    "固定成本、人事成本和業務能力是大家要理解的現實。",
    "所以你們的任務是專心做好現在的角色，不管外面是不是寒冬。"
  ].join("\n"), { slideCount: 8 });
  assert.equal(strategy.titleCandidates[0].title, "公司寒冬下的團隊與成本現實");
  assert.doesNotMatch(strategy.titleCandidates.map((candidate) => candidate.title).join(" "), /一年一度|為什麼|拍拍手|q1q2/iu);
  assert.match(strategy.subtitle, /成本|營收|人事|角色|團隊/u);
});

test("buildStoryOutline avoids generic duplicate PPT pages for company talks", () => {
  const companyTalk = [
    "一年一度要講一些，其實也是跟公司有關的事情。",
    "今年 2024 跟過去不一樣，人事上離開了三位，有些是主動有些是被動。",
    "留下來的人需要回到自己的表現、對公司的興趣，以及現在能承擔的角色。",
    "小團隊不需要像大企業一樣只講願景，管理方式要比較單純，也要說清楚責任。",
    "過年看了幾本管理書，像逆思維和一年十二週，是拿來提醒今年工作節奏怎麼拆。",
    "年初很多合作廠商都還在準備企劃，Q1、Q2 案子少，營業額跟固定成本會形成壓力。",
    "這些壓力不會直接轉嫁到每個人身上，但會影響公司的生存，所以團隊要理解現實。"
  ].join("\n");
  const outline = buildStoryOutline(companyTalk, {
    slideCount: 8,
    context: "公司寒冬下的團隊與成本現實"
  });
  const titles = outline.map((section) => section.title).join(" / ");
  const takeaways = outline.map((section) => section.takeaway);
  assert.doesNotMatch(titles, /內容重點|有些可能|一跟二|那個/u);
  assert.ok(new Set(outline.map((section) => section.title)).size >= Math.min(3, outline.length));
  assert.ok(new Set(takeaways).size >= Math.min(3, takeaways.length));
  assert.ok(outline.some((section) => /人事|角色/u.test(`${section.title} ${section.bullets.join(" ")}`)));
  assert.ok(outline.some((section) => /管理|願景|小團隊/u.test(`${section.title} ${section.bullets.join(" ")}`)));
  assert.ok(outline.some((section) => /企劃|營業額|成本|合作/u.test(`${section.title} ${section.bullets.join(" ")}`)));
});

test("buildBrollPlan produces timecodes and generation prompts", () => {
  const outline = buildStoryOutline(transcript, { slideCount: 8 });
  const plan = buildBrollPlan(outline, { durationSeconds: 120, style: "documentary" });
  assert.equal(plan.length, outline.length);
  assert.match(plan[0].timecode, /^\d{2}:\d{2}$/);
  assert.match(plan[0].prompt, /16:9/);
  assert.ok(plan[0].slideCueStartSeconds < plan[0].startSeconds);
  assert.ok(plan[0].slideCueDuration >= 3.8);
  assert.equal(plan[0].timingPolicy, "independent-ppt-and-broll");
  assert.ok(plan[0].startSeconds - plan[0].slideCueEndSeconds >= 2);
  assert.ok(plan[0].score >= 3);
  assert.ok(plan[0].whyBroll);
  assert.ok(plan[0].literalSceneTreatment);
  assert.ok(plan[0].propOrigin);
  assert.ok(plan[0].viewerRead);
  assert.ok(plan[0].keywordAnchors.length >= 2);
  assert.ok(plan[0].semanticCluster);
  assert.ok(plan[0].noveltyReason);
  assert.ok(plan[0].repetitionCheck);
  assert.ok(plan[0].qualityGate?.fitCheck);
  assert.ok(plan[0].qualityGate?.modestyCheck);
  assert.ok(plan[0].qualityGate?.diversityCheck);
  assert.ok(plan[0].scoreDetails?.matchedLabels?.length >= 1);
  assert.ok(plan[0].motion);
  assert.ok(plan[0].motionReason);
  assert.ok(plan[0].diversity?.cameraMotion);
  assert.match(brollPlanToCsv(plan), /生成提示詞/);
  assert.match(brollPlanToCsv(plan), /鏡頭檢查/);
  assert.match(brollPlanToCsv(plan), /為何需要B-roll/);
  assert.match(brollPlanToCsv(plan), /具體場景/);
  assert.match(brollPlanToCsv(plan), /道具來源/);
  assert.match(brollPlanToCsv(plan), /觀眾讀法/);
  assert.match(brollPlanToCsv(plan), /關鍵字錨點/);
  assert.match(brollPlanToCsv(plan), /語意群組/);
  assert.match(brollPlanToCsv(plan), /重複檢查/);
  assert.match(brollPlanToCsv(plan), /運鏡/);
  assert.match(brollPlanToCsv(plan), /保守構圖/);
  assert.match(brollPlanToCsv(plan), /多樣性矩陣/);
  assert.match(brollPlanToCsv(plan), /PPT切入/);
});

test("buildBrollPlan lets PPT and B-roll use independent cue positions", () => {
  const outline = [
    { title: "開場設定問題", summary: "先讓觀眾理解議題背景。", takeaway: "問題背景需要清楚建立。", keywords: ["背景", "問題"], bullets: ["建立情境"], excerpt: "先談背景。" },
    { title: "中段補充例子", summary: "用具體例子補強觀點。", takeaway: "例子和觀點不需要同時出現。", keywords: ["辦公室", "紙筆"], bullets: ["舉例說明"], excerpt: "接著用例子說明。" },
    { title: "最後整理結論", summary: "把重點收束給觀眾。", takeaway: "最後回到可行動的結論。", keywords: ["結論", "團隊"], bullets: ["整理重點"], excerpt: "最後整理。" }
  ];
  const plan = buildBrollPlan(outline, { durationSeconds: 180 });
  assert.ok(plan.some((item) => item.slideCueStartSeconds > item.startSeconds));
  assert.ok(plan.every((item) => item.timingPolicy === "independent-ppt-and-broll"));
});

test("buildBrollPlan turns sakura speech into a local English visual prompt", () => {
  const outline = buildStoryOutline("春天最適合欣賞盛開的櫻花。微風吹過時，粉色花瓣會慢慢飄落。", { slideCount: 6 });
  const plan = buildBrollPlan(outline, { durationSeconds: 30 });
  assert.equal(plan[0].visualConcept, "櫻花");
  assert.match(plan[0].localPrompt, /cherry blossom/i);
  assert.equal(plan[0].localGenerationPriority, true);
});

test("buildBrollPlan prefers the spoken visual keyword over a generic travel setting", () => {
  const outline = buildStoryOutline("春天到日本旅行時，最令人期待的景色就是盛開的櫻花。微風吹過，花瓣緩緩飄落。", { slideCount: 6 });
  const plan = buildBrollPlan(outline, { durationSeconds: 30 });
  assert.equal(plan[0].visualConcept, "櫻花");
  assert.match(plan[0].localPrompt, /cherry blossom/i);
});

test("buildBrollPlan makes office and paper B-roll visually specific", () => {
  const outline = [{
    id: 1,
    title: "AI 正在重排創作分工",
    summary: "寫手在辦公室用 AI 工具整理笑話、流程與聯想清單。",
    takeaway: "創作者需要把紙筆發想與 AI 工具放進同一個工作流。",
    bullets: ["用筆記整理聯想清單", "用工具檢查笑話情緒", "在辦公室完成改稿"],
    excerpt: "紙跟筆記上有草稿和流程圖。",
    keywords: ["AI", "創作者", "寫手", "笑話"]
  }];
  const [item] = buildBrollPlan(outline, { durationSeconds: 180 });
  assert.match(item.localPrompt, /person|creator|hands|seated/i);
  assert.match(item.localPrompt, /handwritten marks|diagrams|not blank pages/i);
  assert.match(item.localPrompt, /never an empty room/i);
  assert.match(item.shotChecklist.subject, /人物|手部/);
  assert.match(item.shotChecklist.props, /筆記|白板|手寫|圖表/);
  assert.ok(item.shotChecklist.avoid.includes("空辦公室"));
  assert.ok(item.shotChecklist.avoid.includes("空白紙"));
  assert.match(item.literalSceneTreatment, /人物|手部|實際場景/u);
  assert.match(item.propOrigin, /AI|創作者|寫手|筆記|視覺概念/u);
  assert.match(item.viewerRead, /觀眾/u);
  assert.match(item.negativePrompt, /unrelated symbolic props|fused limbs|dead-eyed portrait/);
  assert.match(item.negativePrompt, /nudity|cleavage|lingerie|revealing outfit|sexualized pose/);
  assert.match(item.localPrompt, /modest clothing|non-sexualized framing/i);
  assert.doesNotMatch(item.localPrompt, /主體：|動作：|道具：|具體場景/u);
  assert.equal(item.localGenerationPriority, true);
  assert.match(item.motionReason, /視線|注意力|手部|工具|操作|紙面|圖表/);
});

test("buildBrollPlan keeps weak visual moments as planning only", () => {
  const outline = [{
    id: 1,
    title: "先交代聊天開場",
    summary: "今天先聊一下這個問題，接著會慢慢說明。",
    takeaway: "這段只是把話題打開，還沒有具體畫面或例子。",
    bullets: ["先開場", "還沒有例子", "後面再說明"],
    excerpt: "今天先聊一下這個問題。",
    keywords: ["開場"]
  }];
  const [item] = buildBrollPlan(outline, { durationSeconds: 60 });
  assert.ok(item.score < 3);
  assert.equal(item.localGenerationPriority, false);
  assert.ok(item.scoreDetails.details.length >= 5);
});

test("buildBrollPlan applies selected B-roll style to local generation prompts", () => {
  const outline = [{
    id: 1,
    title: "產品操作示範",
    summary: "創作者在桌面上操作產品，讓觀眾看懂功能如何被使用。",
    takeaway: "真實操作畫面可以讓功能更容易理解。",
    bullets: ["展示產品操作", "保留手部互動", "讓觀眾理解情境"],
    excerpt: "創作者在桌面上操作產品。",
    keywords: ["產品", "操作", "創作者"]
  }];
  const [cinematic] = buildBrollPlan(outline, { durationSeconds: 80, style: "cinematic" });
  const [minimal] = buildBrollPlan(outline, { durationSeconds: 80, style: "minimal" });
  assert.match(cinematic.localPrompt, /cinematic natural light/i);
  assert.match(minimal.localPrompt, /minimal clean composition/i);
  assert.notEqual(cinematic.localPrompt, minimal.localPrompt);
});

test("buildBrollPlan turns relationship speech into a concrete human scene", () => {
  const outline = buildStoryOutline("我問你這個問題，因為我對我妹的男朋友很好奇，也會想知道朋友和家人之間的界線。", { slideCount: 6 });
  const [item] = buildBrollPlan(outline, { durationSeconds: 70 });
  assert.equal(item.visualConcept, "關係討論");
  assert.match(item.title, /關係|界線|保護/);
  assert.match(item.localPrompt, /relationship|people|hands|note cards|family diagram/i);
  assert.match(item.localPrompt, /modest clothing|non-sexualized framing/i);
  assert.match(item.qualityGate.modestyCheck, /保守|日常|非性感化/u);
  assert.ok(item.shotChecklist.avoid.includes("空椅子"));
  assert.ok(item.shotChecklist.avoid.includes("曖昧臥室"));
  assert.ok(item.localGenerationPriority);
});

test("buildBrollPlan keeps company cost content out of relationship scenes", () => {
  const outline = buildStoryOutline("公司進入寒冬後，固定成本沒有下降，營業額卻減少，團隊必須重新安排人事與年度企劃。", { slideCount: 6 });
  const [item] = buildBrollPlan(outline, { durationSeconds: 90 });
  assert.equal(item.visualConcept, "公司營運");
  assert.match(item.localPrompt, /business operations|budget|calculator|office worker/i);
  assert.doesNotMatch(item.localPrompt, /relationship note cards|family diagram/i);
});

test("alignBrollPlanToTimeline places a scene beside its actual sentence", () => {
  const plan = buildBrollPlan([{
    id: 1,
    title: "固定成本壓力",
    summary: "公司固定成本沒有下降，營業額卻明顯減少。",
    takeaway: "團隊必須正視成本現實。",
    bullets: ["固定成本沒有下降", "營業額減少"],
    excerpt: "公司固定成本沒有下降，營業額卻明顯減少。",
    keywords: ["公司", "固定成本", "營業額"]
  }], { durationSeconds: 180 });
  const [aligned] = alignBrollPlanToTimeline(plan, { segments: [
    { id: 1, start: 0, end: 8, text: "今天先談書裡的觀念。" },
    { id: 2, start: 84, end: 92, text: "公司固定成本沒有下降，營業額卻明顯減少。" },
    { id: 3, start: 150, end: 160, text: "最後回到年度企劃。" }
  ] }, { durationSeconds: 180 });
  assert.ok(aligned.startSeconds >= 84 && aligned.startSeconds < 90);
  assert.equal(aligned.timingPolicy, "transcript-timeline-aligned");
  assert.deepEqual(aligned.timelineAlignment.sourceSegmentIds, [2]);
});

test("buildBrollPlan gives travel B-roll human scale instead of pure empty scenery", () => {
  const outline = buildStoryOutline("春天到日本旅行時，最令人期待的景色就是盛開的櫻花。午後整理行李與相機，前往湖邊看季節光影。", { slideCount: 6 });
  const [item] = buildBrollPlan(outline, { durationSeconds: 80 });
  assert.match(item.shotChecklist.subject, /人物|相機|行李|背影|前景/);
  assert.match(item.localPrompt, /person|luggage|camera|foreground|human-scale|scale/i);
  assert.ok(item.shotChecklist.avoid.includes("純空景"));
});

test("formatTranscriptForSingleLineCaptions keeps one sentence per line", () => {
  const formatted = formatTranscriptForSingleLineCaptions("第一句先說明問題。第二句補上例子？第三句收束重點！");
  assert.deepEqual(formatted.split("\n"), [
    "第一句先說明問題。",
    "第二句補上例子？",
    "第三句收束重點！"
  ]);
});

test("formatTime formats whole seconds", () => {
  assert.equal(formatTime(75), "01:15");
});

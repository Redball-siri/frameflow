const STOP_TERMS = new Set([
  "我們", "你們", "他們", "這個", "那個", "就是", "可以", "因為", "所以", "以及",
  "一個", "這些", "目前", "今天", "現在", "如果", "但是", "而且", "其實", "然後",
  "開始", "覺得", "知道", "可能", "大概", "很多", "比較", "應該", "真的", "沒有",
  "一些", "為什麼", "一年一度", "每年", "每次", "好像", "對啊", "拍拍手",
  "the", "and", "that", "this", "with", "from", "have", "will", "your", "about",
  "early", "adopter", "secondary", "follower", "followers", "ok", "shan"
]);

const DOMAIN_TERMS = [
  "公司", "組織", "小團隊", "人事", "人事流動", "營業額", "收支", "成本", "固定成本", "業務", "寒冬", "角色", "任務", "年度", "企劃", "計畫", "合作", "流動", "創業",
  "櫻花", "咖啡", "山景", "湖泊", "海邊", "森林", "城市", "列車", "知識型影片", "觀看體驗", "工作流程", "社群素材", "逐字稿", "PowerPoint", "B-roll",
  "產品特寫", "人物操作", "環境鏡頭", "資料視覺", "內容系統", "創作者", "觀眾", "影片",
  "內容", "畫面", "資訊", "簡報", "拍攝", "剪輯", "市場", "數據", "城市", "團隊", "品牌",
  "產品", "服務", "設計", "功能", "提案", "課程", "素材", "AI", "人工智慧", "喜劇",
  "笑話", "幽默", "寫手", "現場互動", "炎上", "健保", "臺積電", "奧德修斯", "心理",
  "情緒", "神經科學", "公眾人物", "社會壓力", "認知彈性", "妹妹", "哥哥",
  "姊姊", "弟弟", "家人", "感情", "交往", "男朋友", "女朋友", "朋友", "關係", "保護"
];

const VISUAL_CONCEPTS = [
  { pattern: /AI|人工智慧|演算法|模型|自動化/i, label: "AI工具", prompt: "over-the-shoulder view of a creator working at a laptop, hands on keyboard, notebook filled with handwritten marks and diagrams, sticky notes, warm desk lamp, abstract AI-like light patterns, no readable words" },
  { pattern: /固定成本|營業額|收支|公司寒冬|業務|人事流動|年度企劃|小團隊經營|成本現實/i, label: "公司營運", prompt: "documentary business operations scene with a non-identifiable office worker reviewing abstract budget charts, receipts and staffing notes, hands using a calculator and marking a filled notebook, modest long-sleeve clothing, face out of frame, no readable words" },
  { pattern: /妹妹|哥哥|姊姊|弟弟|家人|男朋友|女朋友|感情|交往|朋友|關係|保護|dating|relationship/i, label: "關係討論", prompt: "intimate documentary-style table conversation scene with two non-identifiable people, hands arranging relationship note cards and a small family diagram with abstract marks, warm indoor light, human presence and props, no readable words" },
  { pattern: /喜劇|笑話|幽默|舞台|演出|觀眾|stand.?up/i, label: "喜劇現場", prompt: "warm stand-up comedy rehearsal scene with one performer silhouette adjusting a microphone, audience silhouettes in the foreground, spotlight haze, active human presence, no readable signs" },
  { pattern: /情緒|心理|憂鬱|壓力|認知|彈性|神經科學/i, label: "心理思考", prompt: "person seen from behind journaling at a desk, pages filled with abstract handwritten marks, soft window light, reflective emotional atmosphere, no readable words" },
  { pattern: /櫻花|sakura|cherry blossom/i, label: "櫻花", prompt: "pink cherry blossom branches swaying gently in a spring breeze, petals drifting through soft morning sunlight, tranquil Japanese garden" },
  { pattern: /咖啡|coffee/i, label: "咖啡", prompt: "close-up of freshly brewed coffee beside a sunlit window, visible steam, warm wooden table, hand entering frame to move a cup, quiet morning atmosphere" },
  { pattern: /山|山景|mountain/i, label: "山景", prompt: "wide mountain landscape with rolling mist and soft sunrise light, layered ridgelines, a small human figure or backpack in the foreground for scale, calm natural atmosphere" },
  { pattern: /湖|湖泊|lake/i, label: "湖泊", prompt: "serene lake surface reflecting the sky, gentle ripples, person from behind sitting near the shore with notebook, peaceful natural light" },
  { pattern: /海|海邊|海岸|ocean|beach/i, label: "海岸", prompt: "cinematic ocean shoreline with gentle waves, sunlight sparkling on the water, a person walking along the edge of the frame, airy coastal atmosphere" },
  { pattern: /森林|樹林|forest/i, label: "森林", prompt: "sunbeams passing through a lush green forest, leaves moving softly, a person walking through the path from behind, atmospheric natural depth" },
  { pattern: /城市|街道|都市|city/i, label: "城市", prompt: "cinematic city street at golden hour, layered architecture, pedestrians moving naturally in the background, human-scale everyday motion, no readable signs" },
  { pattern: /列車|火車|捷運|train/i, label: "列車", prompt: "cinematic train interior or platform moment, passenger hands holding a notebook, passing scenery through window, soft daylight, elegant sense of movement" },
  { pattern: /旅行|旅遊|行程|觀光|travel|trip/i, label: "旅行", prompt: "cinematic travel planning scene with hands arranging luggage, map-like paper covered in abstract route marks, changing scenery through a window, natural daylight, clear sense of movement" },
  { pattern: /汽車|開車|道路|公路|car|driving|road/i, label: "公路移動", prompt: "cinematic moving car viewpoint along a scenic road, driver's hands on wheel, sunlight shifting across the landscape, smooth forward motion" },
  { pattern: /餐廳|料理|食物|吃飯|美食|food|restaurant/i, label: "料理", prompt: "close-up cinematic food preparation with steam and hands plating a fresh meal, warm natural texture, visible cooking motion" },
  { pattern: /手機|電話|社群|app|phone|mobile/i, label: "手機操作", prompt: "close-up of hands naturally using a smartphone in a bright everyday setting, subtle screen reflections, abstract notification shapes, no readable interface" },
  { pattern: /辦公室|會議|商務|工作室|office|meeting|business/i, label: "商務協作", prompt: "modern office workspace with a non-identifiable person seated and actively working, hands arranging notes around a laptop, whiteboard filled with abstract diagrams, natural movement, never an empty office" },
  { pattern: /金錢|財務|投資|收入|預算|finance|money/i, label: "財務", prompt: "cinematic close-up of a financial planning desk with calculator, hands organizing receipts and note pages filled with abstract chart marks, subtle chart reflections, no readable numbers" },
  { pattern: /學習|教育|學生|課程|教學|school|education|learning/i, label: "學習", prompt: "quiet learning environment with student hands taking notes, open notebook filled with diagrams and highlighted marks, books, soft daylight, natural page movement" },
  { pattern: /運動|健身|跑步|球場|sport|fitness/i, label: "運動", prompt: "dynamic cinematic sports detail with shoes in motion, hands tying laces, changing light across an outdoor training space, human action in frame" },
  { pattern: /健康|醫療|醫院|照護|health|medical/i, label: "健康照護", prompt: "clean calm healthcare setting with caregiver hands preparing simple wellness materials and forms covered in abstract marks, soft clinical daylight, no logos" },
  { pattern: /產品|商品|product/i, label: "產品", prompt: "clean cinematic product detail shot in real use, hand interacting with the product, soft side light, premium materials and shallow depth of field" },
  { pattern: /電腦|軟體|系統|工具|computer|software/i, label: "數位工具", prompt: "close-up of hands actively using a laptop beside a notebook filled with handwritten marks, calm modern workspace, soft natural light, screen content unreadable" },
  { pattern: /數據|市場|趨勢|data|market/i, label: "市場脈動", prompt: "person reviewing abstract charts on a glass board, city reflections in background, hands pointing at non-readable graph shapes, visual metaphor for changing market trends" },
  { pattern: /團隊|工作|創作者|team|creator/i, label: "創作工作", prompt: "creator seated at a desk using editing controls, camera nearby, notebook filled with scribbles and storyboard marks, warm practical lighting, active human presence" },
  { pattern: /影片|拍攝|剪輯|video|filming|editing/i, label: "影像製作", prompt: "cinematic close-up of a camera lens and editing workstation, editor hands adjusting controls, textured studio light, no logos" }
];

const NOISE_RUN = /([噢喔哦啊欸嗯呃哈啦呀耶])\1{2,}/gu;
const CREDIT_PATTERN = /(?:字幕|翻譯|caption)\s*(?:by|[:：])?\s*[^。！？\n]{0,30}/giu;
const PROMO_PATTERN = /您現在看到的是精華版[\s\S]{0,140}?官方LINE[，,、\s]*/gu;

const TRANSCRIPT_REPLACEMENTS = [
  [/延上|眼上/g, "炎上"],
  [/問俊/g, "問卷"],
  [/Legers/gi, "落後者"],
  [/Early\s*Adopter/gi, "早期採用者"],
  [/Secondary\s*的那些\s*Followe?r?s?/gi, "第二波跟隨者"],
  [/真乃臺積電/g, "珍奶、臺積電"],
  [/自賣自誇/g, "對外介紹"],
  [/初日會客室會客室/g, "初日會客室"]
];

const TOPIC_TEMPLATES = [
  {
    id: "guest-context",
    threshold: 5,
    matchers: [
      [/歡迎|來賓|介紹|主持|會客室|節目/u, 2],
      [/學歷|外文|心理|神經科學|喜劇演員|正業/u, 3],
      [/爆紅|酒吧|講笑話|專業/u, 1]
    ],
    title: "來賓背景與節目切入",
    takeaway: "這段是在建立人物背景，讓觀眾知道受訪者如何走進喜劇創作。",
    bullets: [
      "先交代節目與來賓身分",
      "補上學經歷與喜劇起點",
      "讓後面的 AI 與幽默討論有脈絡"
    ],
    keywords: ["來賓", "喜劇演員", "神經科學", "背景"]
  },
  {
    id: "odysseus-show",
    threshold: 5,
    matchers: [
      [/奧德修斯|奧德塞|奧德賽|Odyssey/i, 4],
      [/專場|特輯|史詩|神話|文學|作品|改寫/u, 3],
      [/挑戰|現代|架構|亮點/u, 1]
    ],
    title: "把史詩改寫成喜劇專場",
    takeaway: "這段在說明新專場的創作概念：把古典史詩轉成現代人的困境。",
    bullets: [
      "用《奧德修斯》作為演出骨架",
      "把神話挑戰對照現代生活",
      "讓專場不只是段子，而有完整敘事"
    ],
    keywords: ["奧德修斯", "專場", "史詩", "創作"]
  },
  {
    id: "ai-creative-impact",
    threshold: 5,
    matchers: [
      [/AI|人工智慧/i, 3],
      [/創意工作者|創作者|寫手|writer|headwriter|文字|工具/u, 3],
      [/取代|扁平化|衝擊|未來|早期採用者|跟隨者|落後者/u, 2]
    ],
    title: "AI 正在重排創作分工",
    takeaway: "這段核心是在說：AI 會拉平寫作門檻，逼創作者重新找到人類優勢。",
    bullets: [
      "AI 可以接手部分寫手與發想流程",
      "文字能力的優勢會被工具快速拉平",
      "更難取代的是現場判斷與互動"
    ],
    keywords: ["AI", "創作者", "寫手", "現場互動"]
  },
  {
    id: "ai-joke-method",
    threshold: 6,
    matchers: [
      [/AI|人工智慧/i, 2],
      [/笑話|比喻|聯想清單|主題A|主題B|情緒|好笑/u, 4],
      [/SOP|關聯性|認知資源|Podcast|麥克風|耳機/u, 2]
    ],
    title: "AI 寫笑話缺少情緒判斷",
    takeaway: "這段拆解 AI 寫笑話的限制：有比喻不夠，還要連到人的情緒。",
    bullets: [
      "笑話不只靠兩個概念連連看",
      "情緒線索會決定觀眾有沒有感覺",
      "關聯太弱時，笑點會變得費力"
    ],
    keywords: ["AI", "笑話", "情緒", "聯想"]
  },
  {
    id: "live-interaction",
    threshold: 5,
    matchers: [
      [/現場|即時|互動|觀眾|舞台|娛樂形式/u, 3],
      [/取代|AI|練起來|反應|丟一個東西/u, 2]
    ],
    title: "現場互動是人類優勢",
    takeaway: "這段指出 AI 變強後，創作者更需要把即時反應練成核心能力。",
    bullets: [
      "工具能補文字，但難補現場反應",
      "觀眾丟出的變化需要即時接住",
      "未來娛樂會更重視互動能力"
    ],
    keywords: ["現場互動", "觀眾", "AI", "娛樂"]
  },
  {
    id: "joke-boundaries",
    threshold: 5,
    matchers: [
      [/笑話|幽默|喜劇|開玩笑/u, 2],
      [/界限|冒犯|弱勢|強勢|霸凌|改善|社會|劣根性/u, 3],
      [/習得性無助|上對下|族群|性別|種族/u, 2]
    ],
    title: "笑話界線不是只有能不能講",
    takeaway: "這段在談喜劇的責任：笑話要看它把力量打向哪裡，以及造成什麼效果。",
    bullets: [
      "界線問題不只是禁忌清單",
      "要看笑話是在挑戰強者或踩弱者",
      "好的幽默應該打開討論，而非加深傷害"
    ],
    keywords: ["笑話界線", "喜劇", "社會", "霸凌"]
  },
  {
    id: "healthcare-satire",
    threshold: 5,
    matchers: [
      [/健保|醫療|醫師|診所|慢性病/u, 3],
      [/臺積電|珍奶|棉花|血汗|美國|產業|驕傲/u, 3],
      [/例子|比較|社會|制度/u, 1]
    ],
    title: "用健保笑話切進社會觀察",
    takeaway: "這段把健保、臺積電等台灣符號拿來討論：驕傲背後也可能有代價。",
    bullets: [
      "台灣常用幾個符號對外介紹自己",
      "健保成就背後牽涉勞動與制度代價",
      "笑話可以讓社會矛盾被看見"
    ],
    keywords: ["健保", "臺積電", "社會觀察", "喜劇"]
  },
  {
    id: "public-pressure",
    threshold: 5,
    matchers: [
      [/炎上|社會性死亡|公眾人物|霸凌|壓力/u, 3],
      [/遺書|自殺|憂鬱症|發瘋|平凡人|超人/u, 3],
      [/喜劇演員|面對|風波|心理/u, 1]
    ],
    title: "炎上壓力與創作者心理",
    takeaway: "這段把喜劇工作拉回人的承受力：公眾壓力會真實影響創作者。",
    bullets: [
      "公眾人物也只是普通人",
      "炎上與霸凌可能造成長期壓力",
      "創作不能脫離心理安全與支持"
    ],
    keywords: ["炎上", "公眾人物", "心理", "創作者"]
  },
  {
    id: "humor-psychology",
    threshold: 5,
    matchers: [
      [/幽默感|幽默|笑話|喜劇/u, 2],
      [/科學化|定義|訓練|認知彈性|心理|情緒|神經科學/u, 3],
      [/憂鬱|壓力|彈性|迴路/u, 2]
    ],
    title: "幽默是一種認知彈性",
    takeaway: "這段把幽默放到心理層面：能換角度看事情，本身就是一種彈性。",
    bullets: [
      "幽默感可以被拆成認知與情緒反應",
      "換框架看問題會帶來心理彈性",
      "喜劇的價值不只是在讓人發笑"
    ],
    keywords: ["幽默", "認知彈性", "情緒", "心理"]
  },
  {
    id: "qna-wrap",
    threshold: 5,
    matchers: [
      [/快問快答|Hot take|制服|生日|dress code|小巨蛋|酒吧舞台/i, 3],
      [/觀眾|喜歡|舞台|表演|結尾|下一題/u, 2]
    ],
    title: "快問快答收束個人觀點",
    takeaway: "這段偏向節目收尾，用較輕的問答補出受訪者的個性與價值觀。",
    bullets: [
      "用短問短答降低前面議題的沉重感",
      "讓觀眾更靠近受訪者本人",
      "適合作為影片節奏的緩衝段"
    ],
    keywords: ["快問快答", "舞台", "觀眾", "收尾"]
  },
  {
    id: "relationship-boundary",
    threshold: 5,
    matchers: [
      [/妹妹|哥哥|姊姊|弟弟|家人|朋友/u, 3],
      [/男朋友|女朋友|交往|感情|關係|保護/u, 3],
      [/問|問題|好奇|界線|擔心|直接/u, 1]
    ],
    title: "關係界線與保護感",
    takeaway: "這段核心是在談親近關係裡的保護、好奇與界線，重點不是人名，而是彼此如何拿捏距離。",
    bullets: [
      "先把對話焦點放在關係與界線",
      "用具體例子呈現保護感與擔心",
      "讓觀眾理解提問背後的情緒動機"
    ],
    keywords: ["關係", "家人", "保護", "感情"]
  },
  {
    id: "small-team-operations",
    threshold: 5,
    matchers: [
      [/公司|組織|團隊|小團體|人事|合作|角色|任務/u, 3],
      [/營業額|收支|成本|固定成本|業務|寒冬|Q1|Q2/u, 4],
      [/企劃|計畫|年度|內部|流動|留下|離開/u, 2]
    ],
    title: "公司寒冬下的團隊角色",
    takeaway: "這段在說明小團隊面對營收壓力、人事流動與固定成本時，每個人要理解自己的角色與專注點。",
    bullets: [
      "先交代公司年度狀態與人事變化",
      "把營收壓力、固定成本與業務能力講清楚",
      "讓團隊回到各自角色與當下任務"
    ],
    keywords: ["公司", "團隊", "成本", "角色"]
  },
  {
    id: "tutorial-process",
    threshold: 5,
    matchers: [
      [/流程|步驟|操作|教學|方法|先|接著|最後/u, 3],
      [/工具|系統|設定|輸出|整理|製作/u, 2]
    ],
    title: "流程拆解與操作重點",
    takeaway: "這段主要在拆步驟，適合整理成觀眾可以照做的流程圖。",
    bullets: [
      "把操作順序整理成清楚步驟",
      "補上每一步的目的與注意事項",
      "用畫面示範降低理解成本"
    ],
    keywords: ["流程", "操作", "工具", "步驟"]
  },
  {
    id: "product-story",
    threshold: 5,
    matchers: [
      [/產品|商品|開箱|功能|規格|特色|品牌/u, 3],
      [/使用|體驗|外觀|配件|價格|優缺點/u, 2]
    ],
    title: "產品特色與使用情境",
    takeaway: "這段在把產品放進真實使用情境，讓觀眾理解它解決什麼問題。",
    bullets: [
      "先讓觀眾看懂產品定位",
      "說清楚功能如何對應使用情境",
      "用特寫補足質感與操作細節"
    ],
    keywords: ["產品", "功能", "使用情境", "特寫"]
  },
  {
    id: "travel-story",
    threshold: 5,
    matchers: [
      [/旅行|旅遊|行程|景點|季節|城市|山景|湖泊|海邊|櫻花/u, 3],
      [/早晨|午後|前往|感受|畫面|風景/u, 2]
    ],
    title: "旅行情境與季節氛圍",
    takeaway: "這段在建立旅程的情緒與畫面感，適合用 B-roll 補足地點氛圍。",
    bullets: [
      "抓出最有畫面感的地點與季節",
      "安排移動、停留與細節鏡頭",
      "讓觀眾感覺自己跟著走了一趟"
    ],
    keywords: ["旅行", "風景", "季節", "B-roll"]
  }
];

export function cleanTranscriptForContent(transcript) {
  let cleaned = String(transcript || "");
  for (const [pattern, replacement] of TRANSCRIPT_REPLACEMENTS) {
    cleaned = cleaned.replace(pattern, replacement);
  }
  return cleaned
    .replace(/\r/g, "")
    .replace(PROMO_PATTERN, "")
    .replace(CREDIT_PATTERN, "")
    .replace(/�/g, "")
    .replace(NOISE_RUN, "")
    .replace(/([^\p{L}\p{N}\s，。！？；：、（）《》「」『』…—,.!?;:'"-])/gu, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s+([，。！？；：、,.!?;:])/g, "$1")
    .trim();
}

export function assessTranscriptQuality(transcript) {
  const raw = String(transcript || "");
  const cleaned = cleanTranscriptForContent(raw);
  const compact = cleaned.replace(/\s/g, "");
  const punctuationCount = (cleaned.match(/[。！？!?；;.]/g) || []).length;
  const meaningfulSegments = splitSentences(cleaned).filter((segment) => {
    const letters = segment.match(/[\p{L}\p{N}]/gu) || [];
    const unique = new Set(letters.map((letter) => letter.toLowerCase()));
    return letters.length >= 12 && unique.size >= Math.min(8, Math.ceil(letters.length * 0.12));
  });
  const removedRatio = raw.length ? Math.max(0, 1 - cleaned.length / raw.length) : 1;
  const issues = [];
  if (compact.length < 80) issues.push("可辨識文字太少");
  if (compact.length >= 160 && punctuationCount < 3) issues.push("缺少完整句子與標點");
  if (meaningfulSegments.length < 3) issues.push("有效內容段落不足");
  if (removedRatio > 0.3) issues.push("重複語氣詞或雜訊過多");
  return {
    usable: issues.length === 0,
    cleaned,
    characters: compact.length,
    punctuationCount,
    meaningfulSegments: meaningfulSegments.length,
    removedRatio: Number(removedRatio.toFixed(3)),
    issues
  };
}

export function splitSentences(transcript) {
  const segments = String(transcript)
    .replace(/\r/g, "")
    .split(/(?<=[。！？!?.])\s*|\n+/)
    .map((sentence) => sentence.replace(/\s+/g, " ").trim())
    .filter((sentence) => sentence.length >= 4);
  return segments.flatMap((segment) => {
    if (segment.length <= 150) return [segment];
    return splitLongSpeechSegment(segment);
  });
}

function clip(text, max) {
  const normalized = String(text).replace(/\s+/g, " ").trim();
  return normalized.length > max ? `${normalized.slice(0, max - 1)}…` : normalized;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countOccurrences(text, term) {
  if (!text || !term) return 0;
  const matches = String(text).match(new RegExp(escapeRegExp(term), "gi"));
  return matches ? matches.length : 0;
}

function chunk(items, count) {
  const groups = [];
  const groupCount = Math.max(1, Math.min(count, items.length));
  const baseSize = Math.floor(items.length / groupCount);
  let remainder = items.length % groupCount;
  let cursor = 0;
  for (let index = 0; index < groupCount; index += 1) {
    const size = baseSize + (remainder > 0 ? 1 : 0);
    groups.push(items.slice(cursor, cursor + size));
    cursor += size;
    remainder -= 1;
  }
  return groups;
}

function splitLongSpeechSegment(segment) {
  const marked = String(segment)
    .replace(/(OK|好(?=[，, ]|我們|我|那)|我們回到|我問一個|你認為|可不可以|接下來|比如說|舉一個|所以|但是|可是|今年|現在|我覺得|我認為|對(?=[，, ]))/gu, "\n$1")
    .split(/\n+/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 4);

  const grouped = [];
  let current = "";
  for (const part of marked.length ? marked : [segment]) {
    if (!current) {
      current = part;
      continue;
    }
    if ((current + part).length <= 135) {
      current = `${current}${/[，。！？,.!?]$/.test(current) ? "" : "，"}${part}`;
    } else {
      grouped.push(current);
      current = part;
    }
  }
  if (current) grouped.push(current);

  return grouped.flatMap((part) => {
    if (part.length <= 150) return [part];
    const pieces = [];
    for (let cursor = 0; cursor < part.length; cursor += 120) {
      pieces.push(part.slice(cursor, cursor + 120).trim());
    }
    return pieces;
  }).filter((part) => part.length >= 4);
}

function punctuationForSentence(text) {
  return /嗎|呢|對吧|是不是|有沒有|可不可以|為什麼|怎麼|多少|誰|什麼|哪裡|如何/u.test(text) ? "？" : "。";
}

function sentenceWithEnding(text) {
  const cleaned = String(text || "").replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  return /[。！？!?；;.]$/.test(cleaned) ? cleaned : `${cleaned}${punctuationForSentence(cleaned)}`;
}

function compactTimelinePhrase(text) {
  return cleanTranscriptForContent(text)
    .replace(/^[，。！？；：、,.!?;:\s]+/u, "")
    .replace(/[，。！？；：、,.!?;:\s]+$/u, "")
    .trim();
}

export function formatTimelineSegmentsAsTranscript(segments, fallbackText = "") {
  const fallback = cleanTranscriptForContent(fallbackText);
  const fallbackPunctuationCount = (fallback.match(/[。！？!?；;.]/g) || []).length;
  if (fallback && fallbackPunctuationCount >= 3) return fallback;

  const items = (Array.isArray(segments) ? segments : [])
    .map((segment) => ({
      text: compactTimelinePhrase(segment?.text),
      start: Number(segment?.start),
      end: Number(segment?.end)
    }))
    .filter((segment) => segment.text)
    .sort((left, right) => {
      if (Number.isFinite(left.start) && Number.isFinite(right.start)) return left.start - right.start;
      return 0;
    });

  const sentences = [];
  let current = "";
  let lastEnd = null;
  const finish = () => {
    const sentence = sentenceWithEnding(current);
    if (sentence) sentences.push(sentence);
    current = "";
  };

  for (const item of items) {
    const gap = Number.isFinite(item.start) && Number.isFinite(lastEnd) ? item.start - lastEnd : 0;
    if (current && gap >= 0.75 && current.length >= 18) finish();
    if (!current) current = item.text;
    else current = `${current}${/[，。！？,.!?]$/.test(current) ? "" : "，"}${item.text}`;
    if (current.length >= 58 || (gap >= 0.5 && current.length >= 34) || (current.length >= 28 && punctuationForSentence(current) === "？")) finish();
    if (Number.isFinite(item.end)) lastEnd = item.end;
  }
  if (current) finish();

  if (sentences.length >= 3) return sentences.join("\n");
  if (!fallback) return "";
  return splitLongSpeechSegment(fallback)
    .map(sentenceWithEnding)
    .filter(Boolean)
    .join("\n");
}

function extractKeywords(text, limit = 4) {
  const latin = text.toLowerCase().match(/[a-z][a-z0-9-]{2,}/g) || [];
  const quoted = [...text.matchAll(/[「『“\"]([^」』”\"]{2,12})[」』”\"]/g)].map((match) => match[1]);
  const domain = DOMAIN_TERMS.filter((term) => text.toLowerCase().includes(term.toLowerCase()));
  const candidates = [...quoted, ...domain, ...latin]
    .map((term) => term.replace(/[，。！？、：；]/g, ""))
    .filter((term) => term && !STOP_TERMS.has(term.toLowerCase()));
  return [...new Set(candidates)].slice(0, limit);
}

function headingFor(sentences, index) {
  const first = String(sentences[0] || "").replace(/[。！？!?.]+$/g, "");
  const clauses = first.split(/[，,；;：:]/).map((part) => part.trim()).filter((part) => part.length >= 4);
  const selected = clauses.length > 1 && /但|不只|而是|再|則|所以/.test(first)
    ? clauses.at(-1)
    : clauses[0];
  if (selected) return clip(selected.replace(/^(而是|所以|接著|然後|再|但|則)/, ""), 20);
  return `內容重點 ${index + 1}`;
}

function normalizeSlideText(text) {
  return String(text || "")
    .replace(/^(第一個|第二個|第三個|第四個|最後|接著|然後|所以|重點是|重點在於)[:：，,\s]*/u, "")
    .replace(/^這支影片(?:主要)?(?:介紹|展示|說明|整理)?/u, "")
    .replace(/^本影片(?:主要)?(?:介紹|展示|說明|整理)?/u, "")
    .replace(/這支影片沒有可讀取的音軌，因此系統改依使用者提供的影片主題整理內容。?/u, "")
    .replace(/影片主題是[:：]\s*/u, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isNoisySlideText(text) {
  const value = String(text || "").trim();
  if (value.length < 4) return true;
  if (/\.{2,}|…|Follow|Secondary|Adopter|Legers|OK/i.test(value)) return true;
  if (/因為.*因為|為什麼.*因為|一年一度.*講一些|那就當然|拍拍手/u.test(value)) return true;
  if (/^去[，,]|一跟二然後|就是那個|剛剛講的嘛|我不是要講這本書/u.test(value)) return true;
  const latinRuns = value.match(/[A-Za-z]{5,}/g) || [];
  if (latinRuns.length && /[\u4E00-\u9FFF]/u.test(value)) return true;
  if (/^[的是了嗎呢啊吧喔哦嗯呃]/u.test(value)) return true;
  return false;
}

function titleFromKeywords(keywords, index) {
  const text = keywords.join(" ");
  if (/公司|團隊|組織/u.test(text) && /營業額|收支|成本|固定成本|業務|寒冬/u.test(text)) {
    return "收支成本與業務壓力";
  }
  if (/公司|團隊|組織/u.test(text) && /企劃|計畫|年度|合作/u.test(text)) {
    return "企劃合作與年度狀態";
  }
  if (/公司|團隊|組織/u.test(text) && /人事|流動|角色|任務/u.test(text)) {
    return "人事流動與角色分工";
  }
  const strong = keywords.find((term) => !/影片|內容|畫面|素材|觀眾|資訊|服務/.test(term));
  if (strong) return `${strong}的重點整理`;
  return `內容重點 ${index + 1}`;
}

function isBusinessOperationsText(text) {
  const value = String(text || "");
  return (/公司|組織|團隊|小團體|小團隊/u.test(value)
    && /營業額|收支|成本|固定成本|業務|寒冬|企劃|計畫|年度|人事|離開|留下|合作|角色|任務|願景|管理/u.test(value))
    || /逆思維|一年十二週|十二週|合作廠商|年度企劃|小團體|小團隊管理/u.test(value);
}

function specificBusinessTitle(text, index = 0) {
  const value = String(text || "");
  const candidates = [
    [/人事|離開|留下|流動|角色|任務|專注點/u, "人事流動與角色分工"],
    [/願景|目標|內部|管理|平準化|組織|小團體|小團隊/u, "小團隊管理的現實"],
    [/逆思維|一年十二週|十二週|底層邏輯|一如既往|幾本書|買了.*書|管理書/u, "管理觀念與年度節奏"],
    [/企劃|計畫|年度|合作|廠商|準備/u, "年度企劃與合作節奏"],
    [/營業額|收支|成本|固定成本|業務|寒冬|Q1|Q2/u, "收支成本與業務壓力"],
    [/不變|改變|變動|變化/u, "不變與改變的取捨"]
  ];
  return candidates.find(([pattern]) => pattern.test(value))?.[1]
    || ["團隊角色與成本壓力", "年度狀態與任務重整", "小團隊經營的現實"][index % 3];
}

const MEANINGLESS_SLIDE_TITLE = /^(內容重點\s*\d*|核心問題|重點整理|有些可能還需要在|這段內容|影片重點整理|重點|例子|脈絡)$/u;

function isWeakReadableHeading(value) {
  const title = cleanTitlePiece(value);
  if (!title || MEANINGLESS_SLIDE_TITLE.test(title)) return true;
  if (/^(也|那|所以|但是|因為|如果|有些|這些|我們|你們|大家|其實|就是|今年)$/u.test(title)) return true;
  if (/^(也|那|所以|但是|因為|如果|有些|這些|我們|你們|大家|其實|就是|除了|一跟二)/u.test(title) && title.length < 16) return true;
  if (/可能還需要在|不知道可以|講一些|其實也|跟公司有關的事情/u.test(title)) return true;
  if (/那個|就是那個|一跟二然後/u.test(title)) return true;
  return isNoisySlideText(title);
}

function readableHeading(sentences, keywords, index, context = "") {
  const combined = `${context} ${sentences.join(" ")} ${keywords.join(" ")}`;
  const heading = normalizeSlideText(headingFor(sentences, index));
  if (/沒有可讀取的音軌|使用者提供/.test(heading)) return "影片主題與情境";
  if (heading.length >= 5 && !isWeakReadableHeading(heading)) return clip(heading, 18);
  if (isBusinessOperationsText(combined)) return specificBusinessTitle(combined, index);
  return clip(titleFromKeywords(keywords, index), 18);
}

function bulletFromSentence(sentence, fallback) {
  const cleaned = normalizeSlideText(sentence)
    .replace(/[。！？!?.]+$/g, "")
    .replace(/^(我們|你可以|可以|這段|本段)/u, "")
    .trim();
  if (!cleaned) return fallback;
  return clip(cleaned, 42);
}

function selectReadableEvidence(sentences, keywords = []) {
  const keywordPattern = keywords.length
    ? new RegExp(keywords.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "i")
    : null;
  const candidates = sentences
    .map((sentence) => normalizeSlideText(sentence).replace(/[。！？!?.]+$/g, ""))
    .filter((sentence) => sentence.length >= 12)
    .filter((sentence) => !isNoisySlideText(sentence))
    .sort((left, right) => {
      const leftScore = (keywordPattern?.test(left) ? 1 : 0) + (left.length >= 24 && left.length <= 95 ? 1 : 0);
      const rightScore = (keywordPattern?.test(right) ? 1 : 0) + (right.length >= 24 && right.length <= 95 ? 1 : 0);
      return rightScore - leftScore;
    });
  return candidates[0] || "";
}

function buildBusinessBullets(text, title) {
  const value = String(text || "");
  if (/願景|目標|內部|管理|平準化|組織|小團體|小團隊/u.test(value)) {
    return [
      "小團隊不需要套用大企業式願景話術",
      "管理重點是把責任與期待說清楚",
      "先讓每個人回到自己能承擔的位置"
    ];
  }
  if (/逆思維|一年十二週|十二週|底層邏輯|一如既往|幾本書|買了.*書|管理書/u.test(value)) {
    return [
      "用管理書概念整理今年的工作節奏",
      "不是照搬理論，而是找出可執行的方法",
      "把年度目標拆回較短週期來檢查"
    ];
  }
  if (/人事|離開|留下|流動|角色|任務|專注點/u.test(value)) {
    return [
      "人事變動會重新拉扯角色與責任",
      "留下的人需要確認自己當下的專注點",
      "團隊合作要回到可執行的分工"
    ];
  }
  if (/企劃|計畫|年度|合作|廠商|準備/u.test(value)) {
    return [
      "年度企劃不能只照舊節奏往前排",
      "合作方與內部資源都要重新對齊",
      "先確認真的能完成的工作範圍"
    ];
  }
  if (/營業額|收支|成本|固定成本|業務|寒冬|Q1|Q2/u.test(value)) {
    return [
      "固定成本仍在，營收壓力不能被忽略",
      "業務能力會直接影響公司能否撐住",
      "團隊需要先回到現實可承擔的範圍"
    ];
  }
  if (/不變|改變|變動|變化/u.test(value)) {
    return [
      "有些原則要保留，有些做法必須調整",
      "變動不是例外，而是今年的工作背景",
      "判斷重點在於哪些事情仍值得投入"
    ];
  }
  return [
    `把「${clip(title, 16)}」放回公司現實`,
    "不要只講感覺，要說清楚影響到誰",
    "讓觀眾知道下一步該如何判斷"
  ];
}

function normalizeBulletForSlide(text) {
  return normalizeSlideText(text)
    .replace(/^(重點|例子|脈絡)[:：]\s*/u, "")
    .replace(/^這頁重點[:：]\s*/u, "")
    .replace(/內容重點\s*\d+/u, "")
    .replace(/[。！？!?.]+$/u, "")
    .trim();
}

function normalizeTakeawayText(text) {
  return normalizeBulletForSlide(text)
    .replace(/^這段(?:核心)?(?:是在|在|主要在|主要)?(?:說明|指出|拆解|談|把|拉回|偏向)?[:：，,\s]*/u, "")
    .replace(/^核心(?:是在|是)?[:：，,\s]*/u, "")
    .trim();
}

function buildSlideBullets(sentences, title, keywords) {
  const combined = `${sentences.join(" ")} ${keywords.join(" ")}`;
  if (isBusinessOperationsText(combined)) return buildBusinessBullets(combined, title).map((bullet) => clip(bullet, 42));
  const evidence = selectReadableEvidence(sentences, keywords);
  const candidates = [
    evidence ? `重點：${clip(evidence, 33)}` : "",
    keywords[0] ? `例子：抓出「${keywords[0]}」相關情境` : "",
    "脈絡：說清楚這段和前後內容的關係"
  ].filter(Boolean);
  const fallbacks = [
    `重點：說明「${title}」`,
    `例子：補上與${keywords[0] || "主題"}相關的情境`,
    "脈絡：讓觀眾更快理解這段內容"
  ];
  const cleaned = [];
  const seen = new Set();
  for (const bullet of [...candidates, ...fallbacks]) {
    const value = normalizeBulletForSlide(bullet);
    const key = value.replace(/[^\p{L}\p{N}]/gu, "").slice(0, 24);
    if (!value || seen.has(key) || MEANINGLESS_SLIDE_TITLE.test(value)) continue;
    seen.add(key);
    cleaned.push(clip(value, 42));
    if (cleaned.length >= 3) break;
  }
  return cleaned.length >= 3 ? cleaned : [...cleaned, ...fallbacks.map(normalizeBulletForSlide)].slice(0, 3).map((bullet) => clip(bullet, 42));
}

function decorateContentBrief(section, index, outline) {
  const previous = outline[index - 1];
  const mainPoint = section.takeaway || section.summary || section.title;
  const supportingDetails = (section.bullets || [])
    .map((bullet) => normalizeSlideText(bullet).replace(/^(重點|例子|脈絡)[:：]\s*/u, ""))
    .filter(Boolean)
    .slice(0, 3);
  const logicTransition = index === 0
    ? "先建立觀眾理解這段內容需要的問題與觀看角度。"
    : `接續「${clip(previous?.title || "上一段", 14)}」，把討論推進到「${clip(section.title, 14)}」。`;
  return {
    ...section,
    mainPoint: clip(mainPoint, 70),
    supportingDetails,
    audienceTakeaway: clip(section.takeaway || supportingDetails[0] || section.title, 70),
    logicTransition
  };
}

function scoreTopicTemplate(template, text) {
  return template.matchers.reduce((score, [pattern, weight]) => (
    pattern.test(text) ? score + weight : score
  ), 0);
}

function pickTopicTemplate(text, usedTemplates) {
  const scored = TOPIC_TEMPLATES
    .map((template) => ({ template, score: scoreTopicTemplate(template, text) }))
    .filter(({ template, score }) => score >= template.threshold)
    .sort((left, right) => right.score - left.score);
  if (!scored.length) return null;
  return scored.find(({ template }) => !usedTemplates.has(template.id))?.template || null;
}

function buildTemplateSection(template, sentences, index, context) {
  const combined = sentences.join(" ");
  const keywords = [...new Set([
    ...template.keywords,
    ...extractKeywords(`${context} ${combined}`, 5)
  ])].slice(0, 5);
  const bullets = template.bullets.slice(0, 3).map((bullet) => clip(bullet, 42));
  const takeaway = normalizeTakeawayText(template.takeaway);
  const evidence = selectReadableEvidence(sentences, keywords);
  return {
    id: index + 1,
    title: clip(template.title, 20),
    summary: clip(takeaway, 80),
    takeaway: clip(takeaway, 60),
    bullets,
    excerpt: clip(evidence || takeaway || bullets[0], 86),
    keywords,
    topicId: template.id,
    sourceText: combined
  };
}

function sectionMeaningKey(section) {
  return cleanKeyPointText(`${section.title} ${section.takeaway || section.summary || ""}`)
    .replace(/[^\p{L}\p{N}]/gu, "")
    .slice(0, 34);
}

function fixWeakSection(section, index, context = "") {
  const localCombined = `${section.sourceText || section.excerpt || ""} ${section.summary || ""} ${section.takeaway || ""} ${(section.bullets || []).join(" ")}`;
  const localSourceText = section.sourceText || section.excerpt || localCombined;
  const combined = `${context} ${localCombined}`;
  const next = { ...section };
  if (isWeakReadableHeading(next.title) || MEANINGLESS_SLIDE_TITLE.test(cleanTitlePiece(next.title))) {
    next.title = isBusinessOperationsText(localSourceText)
      ? specificBusinessTitle(localSourceText, index)
      : clip(titleFromKeywords(next.keywords || [], index), 18);
  }
  const bullets = (next.bullets || []).map(normalizeBulletForSlide).filter(Boolean);
  if (isBusinessOperationsText(localSourceText)) {
    next.bullets = buildBusinessBullets(localSourceText, next.title).map((bullet) => clip(bullet, 42));
  } else {
    next.bullets = bullets.filter((bullet) => !MEANINGLESS_SLIDE_TITLE.test(bullet)).slice(0, 3);
  }
  if (next.bullets.length < 3) {
    next.bullets = buildSlideBullets([next.excerpt || next.summary || next.title], next.title, next.keywords || []);
  }
  const takeaway = normalizeBulletForSlide(next.takeaway || next.summary || next.bullets[0] || next.title);
  next.takeaway = clip(MEANINGLESS_SLIDE_TITLE.test(takeaway) ? next.bullets[0] : takeaway, 60);
  next.summary = clip(next.takeaway, 80);
  return next;
}

function dedupeStorySections(sections, context = "") {
  const seenTitles = new Map();
  const seenMeanings = new Set();
  return sections.map((section, index) => {
    let next = fixWeakSection(section, index, context);
    let key = sectionMeaningKey(next);
    if (seenMeanings.has(key) || seenTitles.has(next.title)) {
      const combined = `${next.sourceText || next.excerpt || ""} ${(next.bullets || []).join(" ")}`;
      if (isBusinessOperationsText(combined)) next.title = specificBusinessTitle(combined, index + seenTitles.size);
      if (seenTitles.has(next.title)) next.title = clip(`${next.title} ${index + 1}`, 18);
      next.bullets = buildSlideBullets([next.excerpt || combined], next.title, next.keywords || []);
      next.takeaway = clip(next.bullets[0] || next.takeaway || next.title, 60);
      next.summary = clip(next.takeaway, 80);
      key = sectionMeaningKey(next);
    }
    seenTitles.set(next.title, true);
    seenMeanings.add(key);
    return next;
  });
}

function titleHasAny(values, patterns) {
  const text = values.join(" ");
  return patterns.some((pattern) => pattern.test(text));
}

const TITLE_FILLER_PATTERN = /因為|所以|就是|其實|這個|那個|一些|講一些|為什麼|大概|可能|好像|知道|覺得|可以|一年一度|拍拍手/gu;
const TITLE_GENERIC_PATTERN = /^(影片|內容|畫面|資訊|觀眾|素材|簡報|B-roll|PowerPoint|q1q2)$/iu;

function cleanTitlePiece(title) {
  return String(title || "")
    .replace(/^把/u, "")
    .replace(/的重點整理$/u, "")
    .replace(/這段|內容重點\s*\d+/u, "")
    .replace(/\s+/g, " ")
    .trim();
}

function hasSpecificTitleTerm(value) {
  return DOMAIN_TERMS.some((term) => term.length >= 2 && value.includes(term) && !TITLE_GENERIC_PATTERN.test(term));
}

function isWeakTitlePiece(title) {
  const value = cleanTitlePiece(title);
  if (value.length < 3) return true;
  if (TITLE_GENERIC_PATTERN.test(value)) return true;
  if (/因為.*因為|為什麼.*因為|一年一度.*講一些|那就當然|拍拍手/u.test(value)) return true;
  const fillerMatches = value.match(TITLE_FILLER_PATTERN) || [];
  if (fillerMatches.length >= 2 && !hasSpecificTitleTerm(value)) return true;
  if (fillerMatches.length >= 3) return true;
  return false;
}

function joinTitlePieces(pieces) {
  const unique = [...new Set(pieces.map(cleanTitlePiece).filter((piece) => piece.length >= 3 && !isWeakTitlePiece(piece)))];
  if (!unique.length) return "影片重點整理";
  if (unique.length === 1) return clip(unique[0], 26);
  const joined = `${unique[0]}與${unique[1]}`;
  return clip(joined, 30);
}

function businessOperationsTitle(values) {
  const text = values.join(" ");
  const hasCompany = /公司|組織|團隊|小團體|小團隊/u.test(text);
  const hasCost = /固定成本|成本|營業額|收支|業務|寒冬|Q1|Q2/u.test(text);
  const hasPeople = /人事|離開|留下|流動|合作|角色|任務/u.test(text);
  const hasPlanning = /企劃|計畫|年度|內部/u.test(text);
  if (hasCompany && hasCost && hasPeople) return "公司寒冬下的團隊與成本現實";
  if (hasCompany && hasCost) return "小團隊經營的成本現實";
  if (hasCompany && hasPeople && hasPlanning) return "小團隊的角色分工與合作現實";
  if (hasCompany && hasPeople) return "小團隊的人事流動與角色分工";
  return null;
}

function hasBusinessOperationsFocus(outline, keywords, primaryTitle) {
  return Boolean(businessOperationsTitle([
    primaryTitle,
    ...keywords,
    ...outline.flatMap((section) => [section.title, section.takeaway, ...(section.keywords || [])])
  ]));
}

export function buildStoryOutline(transcript, { slideCount = 8, context = "", maxContentSlides = 8 } = {}) {
  const cleanedTranscript = cleanTranscriptForContent(transcript);
  const sentences = splitSentences(cleanedTranscript);
  const contentLimit = Math.max(2, Math.min(12, Number(maxContentSlides) || 8));
  const desiredContentSlides = Math.max(2, Math.min(contentLimit, Number(slideCount) - 4));
  const groups = chunk(sentences.length ? sentences : [String(transcript)], desiredContentSlides);
  const usedTemplates = new Set();

  const sections = groups.map((sentencesInGroup, index) => {
    const combined = sentencesInGroup.join(" ");
    const localKeywords = extractKeywords(combined, 5);
    const contextKeywords = extractKeywords(context, 3);
    const keywords = [...new Set([...(localKeywords.length ? localKeywords : contextKeywords), ...contextKeywords])].slice(0, 5);
    const template = pickTopicTemplate(combined, usedTemplates);
    if (template) {
      usedTemplates.add(template.id);
      return buildTemplateSection(template, sentencesInGroup, index, localKeywords.length ? "" : context);
    }
    const title = readableHeading(sentencesInGroup, keywords, index, localKeywords.length ? "" : context);
    const bullets = buildSlideBullets(sentencesInGroup, title, keywords);
    const evidence = selectReadableEvidence(sentencesInGroup, keywords);
    return {
      id: index + 1,
      title,
      summary: bullets[0],
      takeaway: bullets[0],
      bullets,
      excerpt: clip(evidence || bullets[0] || title, 96),
      keywords,
      sourceText: combined
    };
  });
  const dedupedSections = dedupeStorySections(sections, `${context} ${cleanedTranscript}`);
  return dedupedSections.map((section, index) => decorateContentBrief(section, index, dedupedSections));
}

export function buildVideoTitle(transcript, { slideCount = 8, context = "", outline: providedOutline = null } = {}) {
  const usesProvidedOutline = Array.isArray(providedOutline) && providedOutline.length;
  const outline = usesProvidedOutline
    ? providedOutline
    : buildStoryOutline(transcript, { slideCount, context });
  const titles = outline.map((section) => section.title);
  const keywords = outline.flatMap((section) => section.keywords || []);
  const supportingText = usesProvidedOutline ? context : `${context} ${transcript}`;
  const titleKeywords = uniqueKeywords(outline, supportingText, 12);
  const values = [...titles, ...keywords, ...titleKeywords, context, usesProvidedOutline ? "" : transcript];

  const hasAi = titleHasAny(values, [/AI|人工智慧/i]);
  const hasComedy = titleHasAny(values, [/喜劇|笑話|幽默|舞台|專場/u]);
  const hasBoundary = titleHasAny(values, [/界線|冒犯|霸凌|社會/u]);
  const hasEmotion = titleHasAny(values, [/情緒|心理|認知|彈性/u]);
  if (hasAi && hasComedy && hasBoundary) return "AI如何改變喜劇創作與笑話界線";
  if (hasAi && hasComedy && hasEmotion) return "AI寫笑話與喜劇創作的挑戰";
  if (hasAi && hasComedy) return "AI與喜劇創作的未來";
  if (hasAi) return "AI對創作者與工作流程的影響";

  if (titleHasAny(values, [/健保|臺積電|醫療|制度/u])) return "健保笑話背後的社會觀察";
  if (titleHasAny(values, [/奧德修斯|奧德賽|史詩|神話/u])) return "從史詩到喜劇專場的創作拆解";
  const businessTitle = businessOperationsTitle(values);
  if (businessTitle) return businessTitle;
  if (titleHasAny(values, [/產品|商品|開箱|功能|使用情境/u])) return "產品特色與使用情境解析";
  if (titleHasAny(values, [/旅行|旅遊|櫻花|山景|湖泊|海邊|城市/u])) return "旅行情境與季節氛圍";
  if (titleHasAny(values, [/流程|步驟|操作|工具|系統|教學/u])) return "流程拆解與操作重點";

  return joinTitlePieces(titles);
}

function cleanKeyPointText(text) {
  return String(text || "")
    .replace(/^這頁重點[:：]\s*/u, "")
    .replace(/^重點[:：]\s*/u, "")
    .replace(/[。！？!?.]+$/u, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanTitleCandidate(title) {
  return String(title || "")
    .replace(/[「」『』"']/g, "")
    .replace(/[。！？!?.]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueKeywords(outline, context = "", limit = 8) {
  const generic = /^(影片|內容|畫面|資訊|觀眾|素材|簡報|B-roll|PowerPoint|q1q2)$/i;
  const source = [
    ...outline.flatMap((section) => section.keywords || []),
    ...extractKeywords(context, 16)
  ];
  const scored = new Map();
  for (const term of source) {
    const cleaned = String(term || "").replace(/[，。！？、：；]/g, "").trim();
    if (!cleaned || generic.test(cleaned) || STOP_TERMS.has(cleaned.toLowerCase())) continue;
    const frequency = Math.max(1, countOccurrences(context, cleaned));
    const specificity = cleaned.length >= 3 ? 1 : 0;
    scored.set(cleaned, (scored.get(cleaned) || 0) + frequency + specificity);
  }
  return [...scored.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].length - right[0].length)
    .map(([term]) => term)
    .slice(0, limit);
}

function titleNounFromOutline(outline, keywords) {
  const titlePieces = outline.map((section) => cleanTitlePiece(section.title)).filter((piece) => !isWeakTitlePiece(piece));
  if (/公司|團隊|組織/u.test(keywords.join(" ")) && /成本|營業額|收支|業務|寒冬/u.test(keywords.join(" "))) {
    return "小團隊經營";
  }
  return keywords.find((keyword) => keyword.length >= 2 && keyword.length <= 10)
    || titlePieces.find((piece) => piece.length >= 3 && piece.length <= 14)
    || "影片重點";
}

function buildAudiencePromise(outline, keywords, primaryTitle) {
  const text = `${primaryTitle} ${keywords.join(" ")} ${outline.map((section) => `${section.title} ${section.takeaway}`).join(" ")}`;
  if (/AI|人工智慧/i.test(text) && /喜劇|笑話|幽默/u.test(text)) {
    return "看懂 AI 寫笑話的限制，以及喜劇創作真正依賴的情緒判斷";
  }
  if (/AI|人工智慧/i.test(text) && /創作者|寫手|工作流程/u.test(text)) {
    return "看懂 AI 如何改變創作分工，以及人類仍要守住的判斷力";
  }
  if (/關係|家人|妹妹|哥哥|男朋友|女朋友|朋友/u.test(text)) {
    return "看懂親近關係裡的保護感、界線與提問背後的情緒";
  }
  if (/旅行|旅遊|櫻花|山景|湖泊|海邊|城市/u.test(text)) {
    return "用季節、地點與細節畫面串起一段有記憶點的旅行敘事";
  }
  if (/產品|商品|開箱|功能|使用情境/u.test(text)) {
    return "把產品特色放回真實使用情境，讓觀眾快速理解它解決的問題";
  }
  if (/公司|組織|團隊|小團隊/u.test(text) && /成本|營業額|收支|業務|寒冬/u.test(text)) {
    return "看懂小團隊面對營收、人事與固定成本時，該如何回到角色與專注點";
  }
  if (/流程|步驟|操作|工具|系統|教學/u.test(text)) {
    return "把操作順序、目的與注意事項整理成觀眾能照做的路徑";
  }
  if (/喜劇|笑話|幽默|舞台/u.test(text)) {
    return "看懂笑點背後的創作方法、現場判斷與社會界線";
  }
  return `快速抓住${titleNounFromOutline(outline, keywords)}的核心脈絡與觀眾 takeaway`;
}

function buildSubtitleFromPoints(keyPoints, keywords, audiencePromise) {
  const keywordLine = keywords.slice(0, 3).join("、");
  if (keywordLine) return clip(`${keywordLine}：${audiencePromise}`, 54);
  const strongPoints = keyPoints
    .map((point) => cleanTitlePiece(point.angle))
    .filter((point) => point.length >= 3 && !/內容重點/u.test(point))
    .slice(0, 3);
  if (strongPoints.length >= 2) {
    return clip(`從${strongPoints.slice(0, 2).join("到")}，${audiencePromise}`, 54);
  }
  return clip(audiencePromise, 54);
}

function titleNeedsSubtitle(primaryTitle, keyPoints, keywords) {
  if (keyPoints.length >= 4) return true;
  if (keywords.length >= 4) return true;
  if (primaryTitle.length <= 16) return true;
  return /影響|解析|重點|未來|氛圍|觀察|挑戰/u.test(primaryTitle);
}

function scoreTitleCandidate(title, keywords = []) {
  const normalized = cleanTitleCandidate(title);
  const lengthScore = normalized.length >= 12 && normalized.length <= 24 ? 3 : normalized.length <= 32 ? 2 : 1;
  const keywordScore = keywords.slice(0, 4).reduce((score, keyword) => score + (normalized.includes(keyword) ? 1 : 0), 0);
  const hookScore = /如何|為什麼|背後|真正|關鍵|改變|挑戰|拆解/u.test(normalized) ? 2 : 0;
  const penalty = /震驚|必看|不要再|竟然|超狂|唯一/u.test(normalized) ? 3 : 0;
  return Math.max(1, lengthScore + keywordScore + hookScore - penalty);
}

function titleCandidate(title, { subtitle = "", angle = "精準摘要", reason = "", keywords = [] } = {}) {
  const cleanedTitle = cleanTitleCandidate(title);
  return {
    title: clip(cleanedTitle, 34),
    subtitle: subtitle ? clip(cleanKeyPointText(subtitle), 58) : "",
    angle,
    reason: reason || "保留逐字稿中的核心主題，不靠檔名猜測內容。",
    score: scoreTitleCandidate(cleanedTitle, keywords)
  };
}

function buildTitleCandidates({ primaryTitle, subtitle, outline, keywords, audiencePromise }) {
  const noun = titleNounFromOutline(outline, keywords);
  const secondary = keywords.find((keyword) => keyword !== noun && primaryTitle.includes(keyword))
    || keywords.find((keyword) => keyword !== noun)
    || cleanTitlePiece(outline[1]?.title || "");
  if (hasBusinessOperationsFocus(outline, keywords, primaryTitle)) {
    const candidates = [
      titleCandidate(primaryTitle, {
        subtitle,
        angle: "主推標題",
        reason: "最貼近整支影片的核心論點，適合 YouTube 與長片。",
        keywords
      }),
      titleCandidate("小團隊經營的成本與角色分工", {
        subtitle: audiencePromise,
        angle: "脈絡型",
        reason: "把營收壓力和團隊分工放在同一個脈絡裡。",
        keywords
      }),
      titleCandidate("公司年度寒冬與團隊專注點", {
        subtitle: keywords.slice(0, 3).join("、"),
        angle: "管理觀點",
        reason: "保留逐字稿中的年度狀態、人事與營收壓力。",
        keywords
      }),
      titleCandidate("營收壓力下的團隊角色", {
        subtitle: audiencePromise,
        angle: "短標題",
        reason: "用較短的說法抓出影片核心。",
        keywords
      })
    ];
    const seen = new Set();
    return candidates.filter((candidate) => {
      if (!candidate.title || seen.has(candidate.title)) return false;
      seen.add(candidate.title);
      return true;
    }).slice(0, 4);
  }
  const candidates = [
    titleCandidate(primaryTitle, {
      subtitle,
      angle: "主推標題",
      reason: "最貼近整支影片的核心論點，適合 YouTube 與長片。",
      keywords
    }),
    titleCandidate(`${noun}背後真正重要的事`, {
      subtitle: audiencePromise,
      angle: "好奇鉤子",
      reason: "用「背後」建立好奇，但不加入逐字稿沒有的承諾。",
      keywords
    }),
    titleCandidate(`${noun}與${secondary || "核心重點"}的完整拆解`, {
      subtitle: keywords.slice(0, 3).join("、"),
      angle: "脈絡型",
      reason: "強調影片的前後推進，適合內容資訊量較大的素材。",
      keywords
    })
  ];
  if (secondary) {
    candidates.push(titleCandidate(`${noun}如何改變${secondary}`, {
      subtitle: audiencePromise,
      angle: "結果導向",
      reason: "把主題與影響對象放在同一句，讓觀眾快速判斷關聯。",
      keywords
    }));
  }
  const unique = [];
  const seen = new Set();
  const ranked = [candidates[0], ...candidates.slice(1).sort((left, right) => right.score - left.score)];
  for (const candidate of ranked) {
    if (!candidate.title || seen.has(candidate.title)) continue;
    seen.add(candidate.title);
    unique.push(candidate);
  }
  return unique.slice(0, 4);
}

export function buildTitleStrategy(transcript, { slideCount = 8, context = "", outline: providedOutline = null } = {}) {
  const outline = Array.isArray(providedOutline) && providedOutline.length
    ? providedOutline
    : buildStoryOutline(transcript, { slideCount, context });
  const primaryTitle = buildVideoTitle(transcript, { slideCount, context, outline });
  const keywords = uniqueKeywords(outline, `${context} ${transcript}`);
  const keyPoints = outline.slice(0, 6).map((section, index) => {
    const point = cleanKeyPointText(section.takeaway || section.summary || section.bullets?.[0] || section.title);
    const evidence = cleanKeyPointText(section.excerpt || section.bullets?.[0] || point);
    return {
      id: index + 1,
      angle: clip(section.title || `重點 ${index + 1}`, 24),
      point: clip(point || section.title || `重點 ${index + 1}`, 72),
      evidence: clip(evidence, 96),
      keywords: (section.keywords || []).slice(0, 4)
    };
  });
  const audiencePromise = buildAudiencePromise(outline, keywords, primaryTitle);
  const shouldUseSubtitle = titleNeedsSubtitle(primaryTitle, keyPoints, keywords);
  const subtitle = shouldUseSubtitle ? buildSubtitleFromPoints(keyPoints, keywords, audiencePromise) : "";
  const titleCandidates = buildTitleCandidates({ primaryTitle, subtitle, outline, keywords, audiencePromise });
  const hasEvidence = keyPoints.filter((point) => point.evidence && point.evidence.length >= 12).length;
  return {
    primaryTitle,
    subtitle,
    shouldUseSubtitle,
    audiencePromise,
    keywords,
    keyPoints,
    titleCandidates,
    confidence: hasEvidence >= Math.min(3, keyPoints.length) ? "high" : "medium",
    evidencePolicy: "標題與副標只依逐字稿重點、段落標題與使用者補充脈絡產生。"
  };
}

function shotType(text) {
  if (/數據|成長|比例|百分比|市場|趨勢|研究|調查/.test(text)) return "數據與情境畫面";
  if (/步驟|流程|操作|製作|使用|方法|系統|工具/.test(text)) return "手部操作與流程特寫";
  if (/城市|旅行|地點|空間|環境|現場|戶外/.test(text)) return "環境建立鏡頭";
  if (/人物|團隊|客戶|使用者|觀眾|生活|工作/.test(text)) return "人物行動側拍";
  if (/產品|品牌|服務|設計|功能/.test(text)) return "產品與細節特寫";
  return "主題情境補充鏡頭";
}

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function sentenceLabel(index, count) {
  if (index === 0) return "開場後第一個章節轉場";
  if (index === count - 1) return "收束前的章節轉場";
  return "段落觀點切換時的章節轉場";
}

function editorialCueTiming(index, count, duration) {
  const brollLength = 5;
  const safeDuration = Math.max(duration, brollLength + 12);
  const introBuffer = safeDuration < 80
    ? Math.max(5, safeDuration * 0.1)
    : Math.min(18, Math.max(9, safeDuration * 0.035));
  const outroBuffer = safeDuration < 80
    ? Math.max(7, safeDuration * 0.12)
    : Math.min(26, Math.max(13, safeDuration * 0.045));
  const usableStart = Math.min(introBuffer, Math.max(0, safeDuration - outroBuffer - brollLength - 2));
  const usableEnd = Math.max(usableStart + brollLength + 4, safeDuration - outroBuffer);
  const sectionSpan = Math.max(9, (usableEnd - usableStart) / Math.max(1, count));
  const sectionStart = usableStart + sectionSpan * index;
  const sectionEnd = index === count - 1 ? usableEnd : Math.min(usableEnd, sectionStart + sectionSpan);
  const slideDuration = Number(clampNumber(sectionSpan * 0.18, 3.6, 5.8).toFixed(1));
  const useSummaryCue = index % 3 === 1 && sectionSpan >= 18;
  const slideAnchor = useSummaryCue ? 0.62 : 0.12;
  const brollAnchor = useSummaryCue ? 0.24 : 0.58;
  const gap = clampNumber(sectionSpan * 0.12, 2.2, 6);
  const latestSlideStart = Math.max(0, Math.min(safeDuration - slideDuration, sectionEnd - slideDuration));
  const slideStart = Number(clampNumber(sectionStart + sectionSpan * slideAnchor, 0, latestSlideStart).toFixed(1));
  const latestBrollStart = Math.max(0, Math.min(safeDuration - brollLength, sectionEnd - brollLength));
  let brollStart = sectionStart + sectionSpan * brollAnchor;
  if (useSummaryCue) {
    brollStart = Math.min(brollStart, slideStart - gap - brollLength);
  } else {
    brollStart = Math.max(brollStart, slideStart + slideDuration + gap);
  }
  brollStart = Math.round(clampNumber(brollStart, 0, latestBrollStart));
  const brollEnd = Math.round(Math.min(safeDuration, brollStart + brollLength));

  return {
    brollStart,
    brollEnd,
    slideCueStartSeconds: slideStart,
    slideCueDuration: slideDuration,
    slideCueEndSeconds: Number((slideStart + slideDuration).toFixed(1)),
    timingPolicy: "independent-ppt-and-broll",
    pptTimingRole: useSummaryCue ? "段落收束重點" : "章節觀點切入",
    brollTimingRole: "具體畫面補強",
    cueReason: sentenceLabel(index, count)
  };
}

function sectionVisualGuidance(section, sourceText) {
  const text = [
    sourceText,
    section.excerpt,
    ...(section.bullets || [])
  ].join(" ");
  const guidance = [];
  const directionNotes = [];

  if (/辦公室|會議|商務|工作室|團隊|工作|創作者|寫手|writer|headwriter|AI|工具|流程|操作|軟體|系統/i.test(text)) {
    guidance.push("include at least one non-identifiable person actively working, seated or hands visible, never an empty room");
    directionNotes.push("畫面中要有正在工作的非辨識人物或手部動作");
  }
  if (/紙|筆|筆記|清單|SOP|聯想|方法|流程|笑話|幽默|稿|內容|寫作|提案|資料/u.test(text)) {
    guidance.push("paper, notebooks or whiteboards should be filled with handwritten marks, diagrams, arrows and note lines, not blank pages, no readable words");
    directionNotes.push("紙張、筆記本或白板要有手寫痕跡與圖表線條，不要空白");
  }
  if (/喜劇|笑話|幽默|舞台|演出|觀眾|stand.?up/i.test(text)) {
    guidance.push("show a performer, microphone, rehearsal gesture or audience silhouettes, never an empty stage");
    directionNotes.push("舞台類畫面要有人、麥克風或觀眾剪影，不用空台");
  }
  if (/炎上|霸凌|壓力|公眾人物|心理|憂鬱|情緒|社會性死亡/u.test(text)) {
    guidance.push("show emotional pressure through a person seen from behind, dim laptop glow and abstract notification shapes, restrained mood, no graphic content");
    directionNotes.push("壓力與心理主題用背影、螢幕光與抽象通知呈現");
  }
  if (/數據|市場|趨勢|財務|投資|研究|調查|比例/u.test(text)) {
    guidance.push("show hands pointing at abstract charts or graph shapes on paper or glass, no readable numbers");
    directionNotes.push("資料類用抽象圖表與手部指向，不放可讀數字");
  }
  if (/妹妹|哥哥|姊姊|弟弟|家人|朋友|男朋友|女朋友|感情|交往|關係|保護/u.test(text)) {
    guidance.push("show a real human relationship discussion through two non-identifiable people in modest casual clothes, hands, note cards and abstract relationship diagrams, never empty chairs, never romanticized or sexualized framing");
    directionNotes.push("關係主題要有人與桌面互動，穿著保守，不用空椅子或性感化畫面");
  }
  if (/健康|醫療|健保|醫院|醫師|診所/u.test(text)) {
    guidance.push("show caregiver or patient hands interacting with documents, wellness objects or clinic materials, no logos");
    directionNotes.push("醫療類要有照護或文件互動細節");
  }

  if (!guidance.length) {
    guidance.push("include a clear subject action and foreground props tied to the topic, avoid empty scenic filler");
    directionNotes.push("要有明確主體動作與貼合主題的前景道具");
  }

  return {
    prompt: guidance.join(", "),
    direction: directionNotes.join("；")
  };
}

function brollShotChecklist(section, sourceText, concept, visualGuidance) {
  const text = [
    sourceText,
    section.excerpt,
    ...(section.bullets || []),
    concept.label
  ].join(" ");
  const checklist = {
    subject: "明確可辨識的主體或手部動作",
    action: "正在進行與段落語意相關的動作",
    props: "前景要有貼合主題的道具細節",
    modesty: "若有人物，穿著保守日常、臉部不需清楚、非性感化構圖",
    avoid: ["空景填充", "無關風景", "可讀文字", "Logo", "浮水印", "暴露穿著", "性感姿勢"]
  };

  if (/辦公室|會議|商務|工作室|團隊|工作|創作者|寫手|writer|headwriter|AI|工具|流程|操作|軟體|系統/i.test(text)) {
    checklist.subject = "非辨識人物坐在辦公桌前，或清楚拍到手部正在工作";
    checklist.action = "敲鍵盤、整理筆記、移動便利貼或指向流程圖";
    checklist.props = "筆電、筆記本、便利貼、白板或桌面文件都要有內容痕跡";
    checklist.avoid.push("空辦公室", "只拍桌椅", "只有螢幕光沒有動作");
  }
  if (/紙|筆|筆記|清單|SOP|聯想|方法|流程|笑話|幽默|稿|內容|寫作|提案|資料/u.test(text)) {
    checklist.props = "紙張、筆記本或白板要有手寫線條、框線、箭頭與示意圖";
    checklist.action = /辦公室|工作|AI|工具|軟體|系統/i.test(text)
      ? checklist.action
      : "手正在書寫、圈選、翻頁或用筆指向重點";
    checklist.avoid.push("空白紙", "乾淨無痕筆記本", "假字塞滿畫面");
  }
  if (/喜劇|笑話|幽默|舞台|演出|觀眾|stand.?up/i.test(text)) {
    checklist.subject = "表演者、麥克風、觀眾剪影或排練中的手勢";
    checklist.action = "調整麥克風、翻看段子筆記或在舞台邊排練";
    checklist.props = "麥克風、舞台燈、段子筆記與觀眾剪影";
    checklist.avoid.push("空舞台", "只有聚光燈");
  }
  if (/炎上|霸凌|壓力|公眾人物|心理|憂鬱|情緒|社會性死亡/u.test(text)) {
    checklist.subject = "背影人物或手部靠近筆電與筆記";
    checklist.action = "停在鍵盤前、整理壓力筆記或看向抽象通知光影";
    checklist.props = "昏暗螢幕光、抽象通知形狀、筆記紙與水杯";
    checklist.avoid.push("獵奇畫面", "自傷暗示", "可讀留言");
  }
  if (/數據|市場|趨勢|財務|投資|研究|調查|比例/u.test(text)) {
    checklist.subject = "手部正在檢查抽象圖表或資料紙";
    checklist.action = "用筆指向圖表、移動便條或整理收據";
    checklist.props = "抽象長條圖、折線圖、計算機、文件與標記線";
    checklist.avoid.push("可讀數字", "空白報表");
  }
  if (/妹妹|哥哥|姊姊|弟弟|家人|朋友|男朋友|女朋友|感情|交往|關係|保護/u.test(text)) {
    checklist.subject = "兩位非辨識人物或手部在桌邊討論關係情境";
    checklist.action = "移動關係卡片、指向簡單家庭圖或在筆記上圈選重點";
    checklist.props = "關係卡片、筆記本、抽象家庭圖、茶杯或日常桌面物件";
    checklist.modesty = "人物穿著保守日常服裝，臉部可避開，畫面聚焦關係討論與桌面物件";
    checklist.avoid.push("空椅子", "抽象愛心背景", "無人空景", "曖昧臥室", "性感化情侶構圖");
  }
  if (/產品|商品|開箱|功能|規格|使用|體驗/u.test(text)) {
    checklist.subject = "手正在使用產品或展示產品細節";
    checklist.action = "按壓、旋轉、拿起配件或示範真實使用方式";
    checklist.props = "產品本體、配件、桌面材質與使用痕跡";
    checklist.avoid.push("只有商品空拍", "無人操作");
  }
  if (/旅行|旅遊|行程|景點|季節|城市|山景|湖泊|海邊|櫻花/u.test(text)) {
    checklist.subject = "人物背影、手持相機、行李或前景物件帶出尺度";
    checklist.action = "走動、停下觀看、整理行李或翻看行程紙";
    checklist.props = "地點主體加上人物或旅行道具作前景";
    checklist.modesty = "人物以背影、遠景或日常外出服裝呈現，避免身體展示";
    checklist.avoid.push("純空景", "沒有尺度感的風景");
  }

  return {
    ...checklist,
    prompt: [
      `must show ${checklist.subject}`,
      `action: ${checklist.action}`,
      `foreground props: ${checklist.props}`,
      `modesty: ${checklist.modesty}`,
      `avoid ${checklist.avoid.join(", ")}`,
      visualGuidance.prompt
    ].join(", ")
  };
}

function sectionBrollSourceText(section) {
  return [
    section.title,
    section.summary,
    section.takeaway,
    section.mainPoint,
    section.audienceTakeaway,
    section.excerpt,
    ...(section.bullets || []),
    ...(section.supportingDetails || []),
    ...(section.keywords || [])
  ].filter(Boolean).join(" ");
}

function brollCandidateScoreDetails(sourceText, matchedConcept) {
  const details = [
    {
      key: "concreteScene",
      label: "具體人物、物件、地點或動作",
      matched: /辦公室|會議|工作室|桌|紙|筆|筆記|白板|清單|SOP|資料|數據|圖表|手機|電腦|產品|咖啡|櫻花|山|湖|海|城市|列車|旅行|行李|相機|餐廳|食物|醫院|舞台|麥克風|家人|朋友|男朋友|女朋友|妹妹|哥哥|團隊|創作者|寫手/u.test(sourceText)
    },
    {
      key: "conceptTurn",
      label: "概念轉折、主張、對比或判斷",
      matched: /但是|可是|反而|所以|因此|核心|重點|問題|判斷|選擇|取代|影響|改變|界線|成本|角色|壓力|結論|收束/u.test(sourceText)
    },
    {
      key: "exampleStory",
      label: "例子、故事、比喻、方法或示範",
      matched: /例子|比如|像是|故事|經驗|方法|流程|步驟|示範|操作|提案|專場|笑話|旅行|關係|交往|年度|企劃/u.test(sourceText)
    },
    {
      key: "emotionPressure",
      label: "情緒壓力、幽默、衝突、驚喜或脆弱點",
      matched: /情緒|壓力|心理|好奇|擔心|保護|幽默|笑話|喜劇|衝突|炎上|霸凌|寒冬|成本|離開|流動|挑戰|界線/u.test(sourceText)
    },
    {
      key: "visualHelps",
      label: "觀眾用畫面會更快理解",
      matched: Boolean(matchedConcept) || /抽象|資料|流程|關係|成本|AI|工具|市場|趨勢|角色|內容|創作|操作|比較|整理/u.test(sourceText)
    }
  ];
  const score = details.filter((detail) => detail.matched).length;
  return {
    score,
    details,
    matchedLabels: details.filter((detail) => detail.matched).map((detail) => detail.label)
  };
}

function scoreBrollCandidate(sourceText, matchedConcept) {
  const result = brollCandidateScoreDetails(sourceText, matchedConcept);
  return result.score;
}

function brollLiteralSceneTreatment(shotChecklist) {
  return `畫面中出現${shotChecklist.subject}，在實際場景裡${shotChecklist.action}，用${shotChecklist.props}把句子的重點具體化。`;
}

function brollPropOrigin(section, shotChecklist, concept) {
  const source = clip(section.excerpt || section.takeaway || section.summary || section.title, 46);
  return `主要道具來自「${source}」附近的句意：${shotChecklist.props}。${concept.label ? `視覺概念鎖定在「${concept.label}」，不加入無關裝飾物。` : ""}`;
}

function brollViewerRead(section) {
  return `觀眾應該先讀到：${clip(section.audienceTakeaway || section.takeaway || section.summary || section.title, 44)}。`;
}

function brollQualityGate(shotChecklist) {
  return {
    fitCheck: "必須能對回 sourcePhrase 的完整句意，而不是只對到單一名詞。",
    literalSceneCheck: `人物/地點/動作需符合：${shotChecklist.subject}；${shotChecklist.action}。`,
    propOriginCheck: `可見道具需能由句意解釋：${shotChecklist.props}。`,
    modestyCheck: shotChecklist.modesty,
    diversityCheck: "與相鄰 B-roll 在場景、主體、動作、構圖、光線或前景道具上至少有兩項差異。",
    weirdnessCheck: "拒收變形手、融合肢體、怪異背影、空洞人像、假字、Logo、浮水印與無關象徵物。",
    rejectIf: [
      "漂亮但無法解釋附近句子",
      "只剩空景、空辦公室或空白紙",
      "用球、繩子、盾牌、圖示等無來源象徵物代替句意",
      "人物姿勢、手部、臉部或身體結構不自然",
      "裸露、內衣、泳裝、裸上身、低胸、挑逗姿勢、曖昧臥室或性感化構圖"
    ]
  };
}

function brollNegativePrompt(shotChecklist) {
  const avoid = [
    "readable text", "letters", "words", "subtitles", "watermark", "logo", "blank paper",
    "empty room", "empty office", "empty stage", "generic stock photo", "unrelated symbolic props",
    "balls", "ropes", "shields", "icons", "distorted hands", "deformed hands", "extra fingers",
    "hands behind back", "fused limbs", "twisted torso", "awkward back-facing body", "dead-eyed portrait",
    "distorted face", "celebrity likeness", "horror", "gore", "nudity", "cleavage",
    "lingerie", "underwear", "bare chest", "bikini", "revealing outfit", "sexualized pose",
    "seductive expression", "sensual bedroom framing", "body-objectifying composition"
  ];
  return [...new Set([...avoid, ...(shotChecklist.avoid || [])])].join(", ");
}

function brollMotionForText(sourceText, index) {
  const options = [
    { motion: "push-in", pattern: /情緒|壓力|心理|關係|問題|好奇|判斷|核心/u, reason: "把觀眾注意力慢慢推向人物或桌面細節" },
    { motion: "pan-left", pattern: /旅行|旅遊|城市|景點|櫻花|戶外|湖泊|山景|海邊/u, reason: "用水平移動建立場景尺度與方向感" },
    { motion: "tilt-down", pattern: /紙|筆|筆記|清單|流程|SOP|資料|圖表|白板/u, reason: "讓視線落到紙面、圖表或手部操作" },
    { motion: "push-out", pattern: /結論|收束|整體|最後|回到|總結/u, reason: "在段落收束時拉開資訊層次" },
    { motion: "pan-right", pattern: /產品|工具|軟體|系統|功能|操作|AI/u, reason: "順著手部或工具介面移動，讓操作更清楚" }
  ];
  const matched = options.find((item) => item.pattern.test(sourceText));
  if (matched) return { motion: matched.motion, motionReason: matched.reason };
  const fallback = [
    { motion: "push-in", motionReason: "用穩定推近補強段落重點" },
    { motion: "pan-right", motionReason: "用輕微平移避免靜態畫面停滯" },
    { motion: "static", motionReason: "資訊密度較高時保留穩定觀看時間" }
  ];
  return fallback[index % fallback.length];
}

function brollDiversityProfile(section, shotChecklist, concept, motion, index) {
  const text = `${section.title} ${section.summary} ${(section.keywords || []).join(" ")}`;
  const setting = /辦公室|工作|AI|工具|流程|軟體|系統/u.test(text)
    ? "active workspace"
    : /旅行|旅遊|城市|景點|櫻花|戶外/u.test(text)
      ? "human-scale travel"
      : /妹妹|哥哥|家人|朋友|感情|關係/u.test(text)
        ? "relationship table"
        : /數據|資料|市場|趨勢|投資/u.test(text)
          ? "data desk"
          : "topic-specific interior";
  return {
    setting,
    visibleSubject: shotChecklist.subject,
    action: shotChecklist.action,
    foregroundProp: shotChecklist.props,
    composition: index % 2 === 0 ? "medium close foreground detail" : "wide 16:9 with human scale",
    colorLight: index % 3 === 0 ? "soft natural contrast" : index % 3 === 1 ? "clean neutral practical light" : "warm restrained highlights",
    cameraMotion: motion,
    clothingModesty: shotChecklist.modesty,
    visualConcept: concept.label
  };
}

function brollReason(section, score, visualGuidance) {
  const takeaway = section.takeaway || section.summary || section.title;
  if (score >= 4.2) return `這段有明確情境與道具，適合用具體畫面補強「${clip(takeaway, 28)}」。`;
  if (visualGuidance.direction) return `${visualGuidance.direction}，可避免只用空景填充。`;
  return `作為段落銜接畫面，補上與「${clip(takeaway, 28)}」相符的視覺節奏。`;
}

function semanticCore(section, keywords) {
  const point = section.takeaway || section.summary || section.title;
  const keywordText = keywords.slice(0, 3).join("、");
  return keywordText ? `${clip(point, 42)}｜${keywordText}` : clip(point, 48);
}

function semanticTextKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[，。！？、；：,.!?;:\s「」『』()（）\[\]【】《》]/g, "")
    .replace(/(這頁重點|這段內容|觀眾應該先讀到|核心|重點)/g, "")
    .trim();
}

function semanticBigrams(value) {
  const characters = [...semanticTextKey(value)];
  if (characters.length < 2) return characters;
  return characters.slice(0, -1).map((character, index) => `${character}${characters[index + 1]}`);
}

function semanticSimilarity(left, right) {
  const leftKey = semanticTextKey(left);
  const rightKey = semanticTextKey(right);
  if (!leftKey || !rightKey) return 0;
  if (leftKey.includes(rightKey) || rightKey.includes(leftKey)) {
    return Math.min(1, Math.min(leftKey.length, rightKey.length) / Math.max(4, Math.max(leftKey.length, rightKey.length)) + 0.34);
  }
  const leftBigrams = semanticBigrams(leftKey);
  const rightBigrams = semanticBigrams(rightKey);
  const counts = new Map();
  leftBigrams.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
  let shared = 0;
  for (const value of rightBigrams) {
    const count = counts.get(value) || 0;
    if (count > 0) {
      shared += 1;
      counts.set(value, count - 1);
    }
  }
  return (2 * shared) / Math.max(1, leftBigrams.length + rightBigrams.length);
}

export function alignBrollPlanToTimeline(plan, timeline, { durationSeconds = 0 } = {}) {
  const items = Array.isArray(plan) ? plan : [];
  const segments = (Array.isArray(timeline?.segments) ? timeline.segments : [])
    .filter((segment) => Number(segment?.end) > Number(segment?.start) && String(segment?.text || "").trim())
    .sort((left, right) => Number(left.start) - Number(right.start));
  if (!items.length || !segments.length) return items;
  const duration = Math.max(Number(durationSeconds) || 0, Number(segments.at(-1)?.end) || 0);
  let minimumIndex = 0;

  return items.map((item, itemIndex) => {
    const query = [item.sourcePhrase, item.semanticCore, item.title, ...(item.keywordAnchors || [])].filter(Boolean).join(" ");
    const candidates = [];
    for (let index = minimumIndex; index < segments.length; index += 1) {
      for (let span = 1; span <= 3 && index + span <= segments.length; span += 1) {
        const group = segments.slice(index, index + span);
        const text = group.map((segment) => segment.text).join(" ");
        const score = semanticSimilarity(query, text);
        const expectedIndex = Math.round((itemIndex / Math.max(1, items.length - 1)) * Math.max(0, segments.length - 1));
        const positionPenalty = Math.abs(index - expectedIndex) / Math.max(1, segments.length) * 0.08;
        candidates.push({ index, span, group, text, score: score - positionPenalty });
      }
    }
    const best = candidates.sort((left, right) => right.score - left.score || left.index - right.index)[0];
    if (!best || best.score < 0.12) return item;
    minimumIndex = Math.min(segments.length - 1, best.index + Math.max(1, best.span - 1));
    const speechStart = Math.max(0, Number(best.group[0].start) || 0);
    const speechEnd = Math.min(duration || Number(best.group.at(-1).end), Number(best.group.at(-1).end) || speechStart + 5);
    const clipDuration = Math.max(1.8, Math.min(5, speechEnd - speechStart || 5));
    const brollStart = Math.min(Math.max(0, duration - clipDuration), speechStart + Math.min(0.45, Math.max(0, (speechEnd - speechStart) * 0.12)));
    const brollEnd = Math.min(duration, brollStart + clipDuration);
    let slideStart = Math.max(0, speechStart - 4.2);
    const slideDuration = Math.max(2.4, Math.min(4.8, Number(item.slideCueDuration) || 4));
    if (Math.abs(slideStart - brollStart) < slideDuration + 1.4) {
      const afterBroll = brollEnd + 1.8;
      slideStart = afterBroll + slideDuration <= duration ? afterBroll : Math.max(0, brollStart - slideDuration - 1.8);
    }
    return {
      ...item,
      startSeconds: Number(brollStart.toFixed(2)),
      endSeconds: Number(brollEnd.toFixed(2)),
      timecode: formatTime(brollStart),
      slideCueStartSeconds: Number(slideStart.toFixed(2)),
      slideCueDuration: Number(slideDuration.toFixed(2)),
      slideCueEndSeconds: Number(Math.min(duration, slideStart + slideDuration).toFixed(2)),
      timingPolicy: "transcript-timeline-aligned",
      timelineAlignment: {
        confidence: Number(Math.max(0, best.score).toFixed(3)),
        sourceSegmentIds: best.group.map((segment, index) => segment.id || best.index + index + 1),
        matchedText: best.text.slice(0, 120)
      }
    };
  });
}

export function formatTranscriptForSingleLineCaptions(transcript) {
  return splitSentences(cleanTranscriptForContent(transcript))
    .map((sentence) => sentence.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

export function formatTime(seconds) {
  const safe = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safe / 60);
  return `${String(minutes).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

export function buildBrollPlan(outline, { durationSeconds, style = "cinematic", targetCount = 0 } = {}) {
  const selectedOutline = Number(targetCount) > 0
    ? outline.slice(0, Math.min(outline.length, Math.max(1, Math.min(12, Number(targetCount)))))
    : outline;
  const duration = Number.isFinite(durationSeconds) && durationSeconds > 0
    ? durationSeconds
    : Math.max(45, selectedOutline.length * 22);
  const styles = {
    cinematic: "電影感實拍、自然光、細膩景深、節奏沉穩",
    documentary: "穩定紀錄片感、真實現場、自然色彩、動作清楚",
    energetic: "明快商業感、快速運鏡、鮮明光線、節奏俐落",
    minimal: "極簡乾淨、柔和光線、留白構圖、節奏從容"
  };
  const localStylePrompts = {
    cinematic: "cinematic natural light, refined depth of field, calm deliberate framing",
    documentary: "realistic documentary style, natural colors, observational framing, clear action",
    energetic: "bright commercial style, crisp contrast, dynamic composition, lively pacing",
    minimal: "minimal clean composition, soft light, uncluttered frame, restrained motion"
  };

  const usedConcepts = new Set();
  const usedKeywordAnchors = new Map();
  const usedSemanticClusters = new Map();
  return selectedOutline.map((section, index) => {
    const keywords = section.keywords || [];
    const timing = editorialCueTiming(index, selectedOutline.length, duration);
    const length = 5;
    const topic = keywords.slice(0, 3).join("、") || section.title;
    const sourceText = sectionBrollSourceText(section);
    const visualGuidance = sectionVisualGuidance(section, sourceText);
    const matchedConcepts = VISUAL_CONCEPTS
      .map((candidate) => ({ candidate, position: sourceText.search(candidate.pattern) }))
      .filter(({ position }) => position >= 0)
      .sort((left, right) => left.position - right.position);
    const preferredBusinessConcept = /公司|組織|團隊|小團隊/u.test(sourceText) && /成本|固定成本|營業額|收支|業務|寒冬|人事流動|年度企劃/u.test(sourceText)
      ? VISUAL_CONCEPTS.find((candidate) => candidate.label === "公司營運")
      : null;
    const matchedConcept = preferredBusinessConcept
      || matchedConcepts.find(({ candidate }) => keywords.includes(candidate.label) && !usedConcepts.has(candidate.label))?.candidate
      || matchedConcepts.find(({ candidate }) => keywords.includes(candidate.label))?.candidate
      || matchedConcepts.find(({ candidate }) => !usedConcepts.has(candidate.label))?.candidate
      || matchedConcepts[0]?.candidate;
    if (matchedConcept) usedConcepts.add(matchedConcept.label);
    const concept = matchedConcept || {
      label: keywords[0] || section.title,
      prompt: "cinematic atmospheric detail shot expressing the central idea, clear human action, topic-specific foreground props, natural materials, gentle light"
    };
    const shotChecklist = brollShotChecklist(section, sourceText, concept, visualGuidance);
    const scoreDetails = brollCandidateScoreDetails(sourceText, matchedConcept);
    const score = scoreBrollCandidate(sourceText, matchedConcept);
    const { motion, motionReason } = brollMotionForText(sourceText, index);
    const diversity = brollDiversityProfile(section, shotChecklist, concept, motion, index);
    const sourcePhrase = clip(section.excerpt || section.summary || section.takeaway || section.title, 90);
    const literalSceneTreatment = brollLiteralSceneTreatment(shotChecklist);
    const propOrigin = brollPropOrigin(section, shotChecklist, concept);
    const viewerRead = brollViewerRead(section);
    const qualityGate = brollQualityGate(shotChecklist);
    const negativePrompt = brollNegativePrompt(shotChecklist);
    const keywordAnchors = [...new Set([
      ...keywords,
      ...extractKeywords(sourceText, 8)
    ])]
      .map((term) => String(term || "").replace(/[，。！？、：；]/g, "").trim())
      .filter((term) => term.length >= 2 && !STOP_TERMS.has(term.toLowerCase()))
      .slice(0, 5);
    for (const fallbackAnchor of [section.title, concept.label, clip(shotChecklist.action, 12)]) {
      const normalizedAnchor = String(fallbackAnchor || "").replace(/[，。！？、：；]/g, "").trim();
      if (keywordAnchors.length >= 2) break;
      if (normalizedAnchor.length >= 2 && !keywordAnchors.includes(normalizedAnchor)) keywordAnchors.push(normalizedAnchor);
    }
    const semanticCluster = clip(`${section.title}｜${concept.label}｜${viewerRead}`, 64);
    const repeatedAnchors = keywordAnchors.filter((anchor) => usedKeywordAnchors.has(anchor));
    const repeatedClusterCount = usedSemanticClusters.get(semanticCluster) || 0;
    const noveltyReason = `這個鏡頭負責第 ${index + 1} 段的「${clip(section.title, 22)}」${index === 0 ? "開場建立" : index === selectedOutline.length - 1 ? "結論收束" : "內容推進"}，以「${shotChecklist.action}」呈現，不只是重複主題名詞。`;
    const repetitionCheck = repeatedAnchors.length || repeatedClusterCount
      ? `與前段重複 ${repeatedAnchors.join("、") || semanticCluster}，但本段改以「${shotChecklist.action}」及「${viewerRead}」呈現不同敘事功能。`
      : "關鍵字與語意群組未和前段重複，場景、動作與敘事功能均有區別。";
    keywordAnchors.forEach((anchor) => usedKeywordAnchors.set(anchor, (usedKeywordAnchors.get(anchor) || 0) + 1));
    usedSemanticClusters.set(semanticCluster, repeatedClusterCount + 1);
    return {
      id: index + 1,
      startSeconds: timing.brollStart,
      endSeconds: timing.brollEnd,
      timecode: formatTime(timing.brollStart),
      duration: `${length} 秒`,
      title: section.title,
      sourcePhrase,
      semanticCore: semanticCore(section, keywords),
      keywordAnchors,
      semanticCluster,
      noveltyReason,
      repetitionCheck,
      score,
      scoreDetails,
      whyBroll: brollReason(section, score, visualGuidance),
      shotType: shotType(`${section.title}${section.summary}`),
      direction: `以具體畫面呈現「${topic}」。主體：${shotChecklist.subject}；動作：${shotChecklist.action}；道具：${shotChecklist.props}。避免只重複主講者口型。`,
      prompt: `${styles[style] || styles.cinematic}，呈現「${topic}」的真實情境，主體明確、動作清楚、道具有內容，16:9，無可讀文字、無浮水印。`,
      searchTerms: keywords.slice(0, 4),
      visualConcept: concept.label,
      literalSceneTreatment,
      propOrigin,
      viewerRead,
      qualityGate,
      motion,
      motionReason,
      diversity,
      cueReason: timing.cueReason,
      slideCueStartSeconds: timing.slideCueStartSeconds,
      slideCueDuration: timing.slideCueDuration,
      slideCueEndSeconds: timing.slideCueEndSeconds,
      timingPolicy: timing.timingPolicy,
      pptTimingRole: timing.pptTimingRole,
      brollTimingRole: timing.brollTimingRole,
      shotChecklist,
      localGenerationPriority: score >= 3,
      negativePrompt,
      localPrompt: [
        "photorealistic natural B-roll keyframe",
        localStylePrompts[style] || localStylePrompts.cinematic,
        concept.prompt,
        visualGuidance.prompt,
        "visible subject performing a sentence-specific action, foreground props from the source sentence, no unrelated symbolic props",
        "modest clothing, face hidden or non-identifiable when people appear, non-sexualized framing",
        index % 3 === 0 ? "medium close-up on hands and foreground props" : index % 3 === 1 ? "wide over-the-shoulder composition with a different camera side" : "top-down detail composition with a distinct action",
        `camera motion: ${motion}`,
        "wide 16:9, meaningful foreground detail, no empty rooms, no blank paper, no readable text, no logos, no distorted hands or faces"
      ].join(", ")
    };
  });
}

export function brollPlanToCsv(plan) {
  const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const rows = [["時間碼", "長度", "分數", "鏡頭類型", "畫面指示", "為何需要B-roll", "關鍵字錨點", "語意群組", "新意理由", "重複檢查", "具體場景", "道具來源", "觀眾讀法", "運鏡", "鏡頭檢查", "保守構圖", "多樣性矩陣", "PPT切入", "剪輯理由", "生成提示詞", "搜尋關鍵字"]];
  for (const item of plan) {
    const checklist = item.shotChecklist
      ? `主體：${item.shotChecklist.subject}；動作：${item.shotChecklist.action}；道具：${item.shotChecklist.props}；避免：${item.shotChecklist.avoid.join("、")}`
      : "";
    rows.push([
      item.timecode,
      item.duration,
      item.score ? `${item.score}/5` : "",
      item.shotType,
      item.direction,
      item.whyBroll || "",
      (item.keywordAnchors || []).join(" / "),
      item.semanticCluster || "",
      item.noveltyReason || "",
      item.repetitionCheck || "",
      item.literalSceneTreatment || "",
      item.propOrigin || "",
      item.viewerRead || "",
      [item.motion, item.motionReason].filter(Boolean).join("："),
      checklist,
      item.qualityGate?.modestyCheck || item.shotChecklist?.modesty || "",
      item.diversity ? Object.entries(item.diversity).map(([key, value]) => `${key}:${value}`).join("；") : "",
      item.slideCueStartSeconds == null ? "" : formatTime(item.slideCueStartSeconds),
      item.cueReason,
      item.prompt,
      item.searchTerms.join(" / ")
    ]);
  }
  return `${rows.map((row) => row.map(escape).join(",")).join("\n")}\n`;
}

export const DEMO_TRANSCRIPT = [
  "春天到日本旅行時，最令人期待的景色就是盛開的櫻花。",
  "微風吹過樹梢，粉色花瓣緩緩飄落，整座城市都多了一種安靜的節奏。",
  "早晨可以搭上列車前往郊外，在湖泊與山景之間尋找不同的賞櫻角度。",
  "午後則適合走進街角咖啡店，從窗邊觀看櫻花與城市光影。",
  "這趟旅程不需要排滿行程，只要留一點時間感受季節變化，就能帶回難忘的畫面。"
].join("\n\n");

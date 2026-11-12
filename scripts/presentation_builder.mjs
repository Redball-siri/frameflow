import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const SLIDE_PREVIEW_SCALE = 2;

function args() {
  const values = {};
  for (let index = 2; index < process.argv.length; index += 2) values[process.argv[index].replace(/^--/, "")] = process.argv[index + 1];
  return values;
}

function compact(text, max) {
  const normalized = String(text || "").replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  const candidate = normalized.slice(0, max);
  const boundary = Math.max(...["。", "！", "？", "；", "，"].map((mark) => candidate.lastIndexOf(mark)));
  if (boundary >= Math.floor(max * 0.55)) return candidate.slice(0, boundary + 1);
  return `${candidate.replace(/[，、：；\s]+$/u, "")}。`;
}

function cleanContentText(text) {
  return String(text || "")
    .replace(/^這頁重點[:：]\s*/u, "")
    .replace(/^觀眾帶走[:：]\s*/u, "")
    .replace(/^這段在說什麼[:：]\s*/u, "")
    .replace(/^內容摘要[:：]\s*/u, "")
    .replace(/^重點整理[:：]\s*/u, "")
    .replace(/^takeaway[:：]\s*/iu, "")
    .replace(/^(重點|例子|脈絡|核心)[:：]\s*/u, "")
    .replace(/^這段(?:核心)?(?:是在|在|主要在|主要)?(?:說明|指出|拆解|談|把|拉回|偏向)?[:：，,\s]*/u, "")
    .replace(/\.{3,}|…+/g, "。")
    .replace(/本影片|這支影片|原片/g, "這段內容")
    .replace(/可編輯簡報|簡報|PPT|PowerPoint/gi, "內容")
    .replace(/\s+/g, " ")
    .trim();
}

const EMPTY_CONTENT_PATTERN = /^(內容重點\s*\d*|核心問題|重點整理|這段內容|影片重點整理|重點|例子|脈絡)$/u;

function contentKey(text) {
  return cleanContentText(text)
    .replace(/[^\p{L}\p{N}]/gu, "")
    .slice(0, 28);
}

function isDuplicateContent(left, right) {
  const leftKey = contentKey(left);
  const rightKey = contentKey(right);
  if (!leftKey || !rightKey) return false;
  return leftKey === rightKey || leftKey.includes(rightKey) || rightKey.includes(leftKey);
}

function isEmptyContentText(text) {
  const value = cleanContentText(text).replace(/[。！？!?]+$/u, "");
  if (!value || EMPTY_CONTENT_PATTERN.test(value)) return true;
  if (/可能還需要在|不知道可以|講一些|其實也|跟公司有關的事情/u.test(value)) return true;
  if (/^去[，,]|一跟二然後|就是那個|剛剛講的嘛|我不是要講這本書/u.test(value)) return true;
  return false;
}

function sectionTakeaway(section, max = 58) {
  const values = [section.takeaway, section.summary, ...(section.bullets || []), section.title]
    .map(cleanContentText)
    .filter((value) => value && !isEmptyContentText(value));
  return compact(values[0] || cleanContentText(section.title), max);
}

function uniqueTakeaways(outline, count = 3, max = 42) {
  const seen = new Set();
  const values = [];
  for (const section of outline) {
    const value = sectionTakeaway(section, max);
    const key = contentKey(value);
    if (!value || !key || seen.has(key) || isEmptyContentText(value)) continue;
    seen.add(key);
    values.push(value);
    if (values.length >= count) break;
  }
  return values;
}

function coreQuestion(title, outline) {
  const cleanedTitle = cleanContentText(title).replace(/[。！？!?]+$/g, "");
  if (/如何|為什麼|怎麼|是否|能不能|該不該|什麼/.test(cleanedTitle)) return `${cleanedTitle}？`;
  const first = sectionTakeaway(outline[0] || {}, 34);
  const last = sectionTakeaway(outline.at(-1) || {}, 34);
  if (first && last && first !== last) return `${cleanedTitle}：從「${first}」走到「${last}」`;
  return cleanedTitle || "這段內容真正想回答的問題";
}

function transitionLine(outline, index) {
  if (index === 0) return "先建立問題與觀看角度";
  if (index === outline.length - 1) return "最後把前面的討論收束成判斷";
  const previous = outline[index - 1]?.title;
  return previous ? `接著從「${compact(previous, 14)}」往下一層推進` : "接著補上理由與例子";
}

function implicationLine(section, outline, index) {
  const transition = cleanContentText(section.logicTransition || transitionLine(outline, index));
  if (transition && !isEmptyContentText(transition)) return compact(transition, 52);
  return compact(`因此，${transitionLine(outline, index)}`, 52);
}

function addUniqueBlock(blocks, seenKeys, block, primaryText) {
  const text = cleanContentText(block.text);
  const key = contentKey(text);
  if (!text || !key || isEmptyContentText(text)) return;
  if (seenKeys.has(key) || isDuplicateContent(text, primaryText)) return;
  seenKeys.add(key);
  blocks.push({ ...block, text });
}

function closingBottomLine(outline, finalTakeaway) {
  const chain = uniqueTakeaways(outline, 4, 22);
  if (chain.length >= 3) return `整體邏輯：${chain.join(" → ")}`;
  return `最後收束成一個判斷：${cleanContentText(finalTakeaway)}`;
}

async function saveBlob(filePath, blob) {
  await fs.writeFile(filePath, Buffer.from(await blob.arrayBuffer()));
}

function addText(slide, { text, left, top, width, height, fontSize, color, bold = false, align = "left", name }) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    name,
    position: { left, top, width, height },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 }
  });
  shape.text = text;
  shape.text.style = { fontSize, color, bold, alignment: align, fontFamily: "Noto Sans TC" };
  return shape;
}

function addRule(slide, { left, top, width, color, height = 4 }) {
  return slide.shapes.add({
    geometry: "rect",
    position: { left, top, width, height },
    fill: color,
    line: { style: "solid", fill: color, width: 0 }
  });
}

function addPill(slide, { text, left, top, width, fill, color = "#FFFFFF" }) {
  slide.shapes.add({
    geometry: "roundRect",
    position: { left, top, width, height: 34 },
    fill,
    line: { style: "solid", fill, width: 0 },
    borderRadius: "rounded-xl"
  });
  addText(slide, { text, left, top: top + 6, width, height: 22, fontSize: 15, color, bold: true, align: "center" });
}

function addSlideNumber(slide, number, light = false) {
  addText(slide, {
    text: String(number).padStart(2, "0"), left: 1122, top: 652, width: 86, height: 28,
    fontSize: 16, color: light ? "#96A0B5" : "#7B8290", bold: true, align: "right", name: "slide-number"
  });
}

function addCover(deck, title, outline) {
  const slide = deck.slides.add();
  slide.background.fill = "#171B28";
  const thesis = uniqueTakeaways(outline, 1, 72)[0] || coreQuestion(title, outline);
  addText(slide, { text: "內容筆記", left: 72, top: 62, width: 430, height: 30, fontSize: 17, color: "#FF6846", bold: true, name: "eyebrow" });
  addText(slide, { text: cleanContentText(title), left: 72, top: 168, width: 1136, height: 190, fontSize: 70, color: "#FFFFFF", bold: true, name: "deck-title" });
  addRule(slide, { left: 72, top: 422, width: 220, color: "#FF6846", height: 7 });
  addText(slide, { text: thesis, left: 72, top: 462, width: 890, height: 76, fontSize: 28, color: "#DDE4F3", name: "deck-subtitle" });
  addText(slide, { text: uniqueTakeaways(outline, 2, 28).join("  /  "), left: 72, top: 600, width: 850, height: 36, fontSize: 18, color: "#7F899E", name: "deck-meta" });
  addSlideNumber(slide, 1, true);
}

function addCoreSlide(deck, title, outline, slideNumber) {
  const slide = deck.slides.add();
  slide.background.fill = "#F5F1E8";
  const takeaways = uniqueTakeaways(outline, 3, 48);
  addText(slide, { text: "討論主軸", left: 72, top: 60, width: 600, height: 66, fontSize: 52, color: "#171B28", bold: true, name: "core-title" });
  addText(slide, { text: coreQuestion(title, outline), left: 74, top: 150, width: 1000, height: 108, fontSize: 40, color: "#242938", bold: true, name: "core-question" });
  addRule(slide, { left: 72, top: 300, width: 1136, color: "#D9D2C5", height: 2 });
  const labels = ["先看到的問題", "背後的判斷", "收束出的結論"];
  takeaways.forEach((takeaway, index) => {
    const left = 74 + index * 378;
    slide.shapes.add({
      geometry: "roundRect",
      position: { left, top: 356, width: 326, height: 166 },
      fill: index === 0 ? "#171B28" : "#FFFFFF",
      line: { style: "solid", fill: index === 0 ? "#171B28" : "#E2DACF", width: 1 },
      borderRadius: "rounded-lg"
    });
    addText(slide, {
      text: labels[index],
      left: left + 24,
      top: 382,
      width: 270,
      height: 26,
      fontSize: 16,
      color: index === 0 ? "#FFAA95" : "#FF5F3A",
      bold: true,
      name: `core-label-${index + 1}`
    });
    addText(slide, {
      text: takeaway,
      left: left + 24,
      top: 430,
      width: 270,
      height: 70,
      fontSize: 22,
      color: index === 0 ? "#FFFFFF" : "#242938",
      bold: true,
      name: `core-takeaway-${index + 1}`
    });
  });
  addSlideNumber(slide, slideNumber);
}

function parseDurationSeconds(value) {
  const match = String(value || "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 4;
}

function addProgressionSlide(deck, outline, slideNumber) {
  const slide = deck.slides.add();
  slide.background.fill = "#171B28";
  addText(slide, { text: "內容如何推進", left: 72, top: 58, width: 760, height: 64, fontSize: 52, color: "#FFFFFF", bold: true, name: "progression-title" });
  addText(slide, { text: "每一段都接住前一段留下的問題，讓討論一層一層往前走。", left: 76, top: 132, width: 900, height: 34, fontSize: 21, color: "#B8C0D0", name: "progression-subtitle" });
  const rows = outline.slice(0, 5);
  const top = 216;
  const rowHeight = Math.min(78, 390 / Math.max(1, rows.length));
  rows.forEach((section, index) => {
    const rowTop = top + index * rowHeight;
    addText(slide, { text: String(index + 1).padStart(2, "0"), left: 78, top: rowTop + 4, width: 58, height: 30, fontSize: 18, color: "#FFAA95", bold: true });
    addText(slide, { text: cleanContentText(section.title), left: 150, top: rowTop - 2, width: 360, height: 34, fontSize: 25, color: "#FFFFFF", bold: true });
    addText(slide, { text: sectionTakeaway(section, 54), left: 548, top: rowTop, width: 432, height: 32, fontSize: 18, color: "#DDE4F3" });
    addText(slide, { text: transitionLine(outline, index), left: 1004, top: rowTop + 1, width: 188, height: 30, fontSize: 14, color: "#8D97AB" });
    addRule(slide, { left: 76, top: rowTop + 48, width: 1130, color: "#384052", height: 1 });
  });
  addText(slide, { text: sectionTakeaway(outline.at(-1) || {}, 76), left: 76, top: 626, width: 910, height: 32, fontSize: 22, color: "#FFFFFF", bold: true, name: "progression-bottom-line" });
  addSlideNumber(slide, slideNumber, true);
}

async function addContentSlide(deck, section, broll, _frame, slideNumber, outline = [], sectionIndex = 0) {
  const slide = deck.slides.add();
  slide.background.fill = "#FCFBF7";
  const usableBullets = (section.bullets?.length ? section.bullets : [section.summary])
    .map(cleanContentText)
    .filter((bullet) => bullet && !isEmptyContentText(bullet));
  addText(slide, { text: `CHAPTER ${String(section.id).padStart(2, "0")}`, left: 72, top: 54, width: 260, height: 28, fontSize: 16, color: "#FF5F3A", bold: true, name: "chapter-label" });
  addText(slide, { text: isEmptyContentText(section.title) ? sectionTakeaway(section, 24) : section.title, left: 72, top: 104, width: 570, height: 86, fontSize: 42, color: "#171B28", bold: true, name: "section-title" });
  addText(slide, { text: "重點判斷", left: 72, top: 218, width: 190, height: 30, fontSize: 21, color: "#FF5F3A", bold: true, name: "takeaway-label" });
  const primaryTakeaway = sectionTakeaway(section, 58);
  addText(slide, { text: primaryTakeaway, left: 72, top: 256, width: 545, height: 78, fontSize: 26, color: "#242938", bold: true, name: "section-takeaway" });
  const labels = ["核心", "例子", "脈絡"];
  usableBullets.slice(0, 3).forEach((bullet, index) => {
    const bulletTop = 364 + index * 58;
    slide.shapes.add({
      geometry: "roundRect",
      position: { left: 72, top: bulletTop - 1, width: 60, height: 30 },
      fill: index === 0 ? "#171B28" : "#F0E7DD",
      line: { style: "solid", fill: index === 0 ? "#171B28" : "#F0E7DD", width: 0 },
      borderRadius: "rounded-lg"
    });
    addText(slide, {
      text: labels[index] || String(index + 1),
      left: 72,
      top: bulletTop + 5,
      width: 60,
      height: 20,
      fontSize: 14,
      color: index === 0 ? "#FFFFFF" : "#171B28",
      bold: true,
      align: "center"
    });
    addText(slide, { text: compact(bullet, 42), left: 150, top: bulletTop - 4, width: 465, height: 42, fontSize: 19, color: "#505765", name: `bullet-${index + 1}` });
  });
  addRule(slide, { left: 72, top: 556, width: 92, color: "#FF5F3A", height: 5 });
  addText(slide, { text: implicationLine(section, outline, sectionIndex), left: 72, top: 584, width: 540, height: 34, fontSize: 18, color: "#242938", bold: true, name: "usage-note" });

  slide.shapes.add({
    geometry: "roundRect", position: { left: 690, top: 82, width: 518, height: 546 },
    fill: "#202638", line: { style: "solid", fill: "#202638", width: 0 }, borderRadius: "rounded-xl"
  });
  const explanatoryBlocks = [];
  const blockCandidates = [
    { label: "壓力來源", text: usableBullets[0] || section.summary },
    { label: "管理判斷", text: usableBullets[1] || section.logicTransition || section.summary },
    { label: "形成的結果", text: usableBullets[2] || implicationLine(section, outline, sectionIndex) },
    { label: "接下來的問題", text: implicationLine(section, outline, sectionIndex) }
  ];
  const seenBlocks = new Set();
  for (const block of blockCandidates) {
    addUniqueBlock(explanatoryBlocks, seenBlocks, block, primaryTakeaway);
    if (explanatoryBlocks.length >= 3) break;
  }
  explanatoryBlocks.forEach((block, index) => {
    const top = 122 + index * 154;
    addText(slide, { text: block.label, left: 730, top, width: 150, height: 24, fontSize: 15, color: "#FFAA95", bold: true, name: `explain-label-${index + 1}` });
    addText(slide, { text: compact(block.text, 52), left: 730, top: top + 38, width: 430, height: 82, fontSize: 19, color: "#FFFFFF", bold: index === 0, name: `explain-text-${index + 1}` });
    if (index < explanatoryBlocks.length - 1) addRule(slide, { left: 730, top: top + 126, width: 430, color: "#384052", height: 1 });
  });
  addSlideNumber(slide, slideNumber);
}

function addClosing(deck, outline, slideNumber) {
  const slide = deck.slides.add();
  slide.background.fill = "#FF6240";
  const takeaways = uniqueTakeaways(outline, 4, 42);
  const finalTakeaway = sectionTakeaway(outline.at(-1) || {}, 70);
  addText(slide, { text: "整體結論", left: 72, top: 68, width: 420, height: 66, fontSize: 52, color: "#FFFFFF", bold: true, name: "closing-title" });
  addText(slide, { text: finalTakeaway, left: 72, top: 164, width: 870, height: 88, fontSize: 36, color: "#FFFFFF", bold: true, name: "closing-thesis" });
  addRule(slide, { left: 76, top: 300, width: 1130, color: "#FFAA95", height: 2 });
  takeaways.forEach((takeaway, index) => {
    const left = 76 + index * 282;
    addText(slide, { text: String(index + 1).padStart(2, "0"), left, top: 354, width: 60, height: 28, fontSize: 17, color: "#FFE5DD", bold: true });
    addText(slide, { text: takeaway, left, top: 392, width: 238, height: 96, fontSize: 22, color: "#FFFFFF", bold: true, name: `closing-takeaway-${index + 1}` });
  });
  addText(slide, { text: closingBottomLine(outline, finalTakeaway), left: 76, top: 568, width: 990, height: 50, fontSize: 24, color: "#FFE5DD", bold: true, name: "closing-bottom-line" });
  addSlideNumber(slide, slideNumber, true);
}

async function main() {
  const options = args();
  const input = JSON.parse(await fs.readFile(options.input, "utf8"));
  await fs.mkdir(options.preview, { recursive: true });
  await fs.mkdir(options.layout, { recursive: true });

  const deck = Presentation.create({ slideSize: { width: 1280, height: 720 } });
  addCover(deck, input.title, input.outline);
  addCoreSlide(deck, input.title, input.outline, 2);
  addProgressionSlide(deck, input.outline, 3);
  for (let index = 0; index < input.outline.length; index += 1) {
    await addContentSlide(deck, input.outline[index], input.brollPlan[index], input.frames[index], index + 4, input.outline, index);
  }
  addClosing(deck, input.outline, input.outline.length + 4);

  for (const [index, slide] of deck.slides.items.entries()) {
    const stem = `slide-${String(index + 1).padStart(2, "0")}`;
    await saveBlob(path.join(options.preview, `${stem}.png`), await deck.export({ slide, format: "png", scale: SLIDE_PREVIEW_SCALE }));
    await fs.writeFile(path.join(options.layout, `${stem}.json`), await (await slide.export({ format: "layout" })).text());
  }
  await saveBlob(path.join(options.preview, "montage.webp"), await deck.export({ format: "webp", montage: true, scale: 1 }));
  const pptx = await PresentationFile.exportPptx(deck);
  await pptx.save(options.output);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

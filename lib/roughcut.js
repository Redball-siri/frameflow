import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import ffmpegPath from "ffmpeg-static";

const HARD_FILLER_TERMS = [
  "嗯", "呃", "痾", "欸", "誒", "呃嗯", "嗯呃", "啊", "呃啊",
  "uh", "um", "erm", "hmm"
];

const SOFT_FILLER_TERMS = [
  "那個", "這個", "就是", "然後", "其實", "所以", "因為", "對", "好",
  "我覺得", "你知道", "怎麼講", "應該說"
];

const AUTO_CUT_FILLER_TERMS = new Set([
  ...HARD_FILLER_TERMS
]);

const SIMILARITY_DROP_TERMS = [
  ...HARD_FILLER_TERMS,
  ...SOFT_FILLER_TERMS,
  "大概", "可能", "真的", "可以", "比較"
].sort((left, right) => right.length - left.length);

const TRAILING_FRAGMENT_TERMS = [
  "就是", "然後", "那個", "這個", "因為", "所以", "但是", "可是", "我覺得",
  "應該說", "怎麼講"
];

const INCOMPLETE_TRAILING_TERMS = [
  "要", "想", "想要", "會", "可以", "應該", "可能", "準備", "打算", "需要",
  "希望", "幫", "讓", "把", "被", "跟", "給", "用", "在", "要去", "要來",
  "會去", "會來",
  "因為", "所以", "但是", "可是", "如果", "雖然", "除了", "關於",
  "接下來", "下一個", "另外", "還有", "然後", "就是", "那個", "這個"
];

const NEW_TOPIC_TRAILING_STARTS = [
  "晚餐", "早餐", "午餐", "宵夜", "接下來", "下一個", "另外", "還有",
  "再來", "然後", "最後", "剛剛", "等一下", "我們要", "我要", "今天要"
];

const COMPLETE_SHORT_CLOSINGS = new Set([
  "謝謝", "謝謝大家", "以上", "以上就是", "拜拜", "再見", "下次見", "我們下次見"
]);

const SENTENCE_END_PATTERN = /[。！？!?]/u;

const LEGITIMATE_SINGLE_REPEATS = new Set(["妹", "哥", "姊", "姐", "弟", "爸", "媽", "哈"]);

const DEFAULT_OPTIONS = {
  durationSeconds: undefined,
  cutLongPauses: true,
  cutWordDisfluencies: true,
  cutRepeatedTakes: true,
  cutDisfluentFragments: true,
  cutRamblingLoops: true,
  cutTrailingIncomplete: true,
  maxPauseSeconds: 0.9,
  pauseHandleSeconds: 0.24,
  minRemovalSeconds: 0.06,
  minKeepSeconds: 0.42,
  mergeGapSeconds: 0.14,
  maxTakeGapSeconds: 7.5,
  repeatedTakeSimilarity: 0.72,
  finalTakeScoreMargin: 6,
  minTakeCharacters: 6,
  maxFillerWordSeconds: 0.5,
  maxFillerOnlySegmentSeconds: 1.2,
  maxDuplicateWordGapSeconds: 0.28,
  internalPauseSeconds: 0.55,
  maxFalseStartSeconds: 4.2,
  falseStartSimilarity: 0.5,
  maxRamblingGapSeconds: 16,
  ramblingSimilarity: 0.72,
  minRamblingCharacters: 12,
  maxTrailingIncompleteSeconds: 6.5,
  maxTrailingIncompleteCharacters: 14,
  minGapBetweenAutoCutsSeconds: 0.25,
  maxAutoRemovalRatio: 0.55,
  audioFadeSeconds: 0
};

function resolveOptions(options = {}) {
  const resolved = { ...DEFAULT_OPTIONS };
  for (const [key, value] of Object.entries(options || {})) {
    if (value !== undefined) resolved[key] = value;
  }
  return resolved;
}

function asNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function roundTime(value) {
  return Number(Math.max(0, asNumber(value)).toFixed(3));
}

function cleanText(value) {
  return String(value || "")
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripSpeechPunctuation(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[，。！？、；：,.!?;:"'“”‘’()[\]{}【】《》<>…—_\-\s]/gu, "");
}

export function normalizeTextForSimilarity(value) {
  let text = stripSpeechPunctuation(cleanText(value));
  for (const term of SIMILARITY_DROP_TERMS) {
    text = text.replace(new RegExp(escapeRegExp(stripSpeechPunctuation(term)), "giu"), "");
  }
  return text
    .replace(/([嗯呃痾啊欸誒喔哦])\1+/gu, "$1")
    .trim();
}

function sourceSegments(input) {
  if (Array.isArray(input)) return input;
  if (Array.isArray(input?.segments)) return input.segments;
  if (Array.isArray(input?.captions)) return input.captions;
  if (Array.isArray(input?.timeline)) return input.timeline;
  if (Array.isArray(input?.subtitleReview?.captions)) return input.subtitleReview.captions;
  return [];
}

function normalizeWord(word, index, segment) {
  const text = cleanText(word?.text ?? word?.word ?? word?.value);
  if (!text) return null;
  const start = roundTime(word?.start ?? segment.start);
  const end = roundTime(word?.end ?? Math.max(start + 0.08, segment.end));
  if (!(end > start)) return null;
  return {
    id: word?.id ?? `${segment.id}:w${index + 1}`,
    start,
    end,
    text,
    normalizedText: stripSpeechPunctuation(text),
    confidence: Number.isFinite(Number(word?.confidence)) ? Number(word.confidence) : undefined
  };
}

export function normalizeSpeechSegments(input) {
  return sourceSegments(input)
    .map((segment, index) => {
      const start = roundTime(segment?.start ?? segment?.startSeconds);
      const end = roundTime(segment?.end ?? segment?.endSeconds);
      const text = cleanText(segment?.text ?? segment?.transcript ?? segment?.caption);
      const normalizedText = normalizeTextForSimilarity(text);
      const base = {
        id: segment?.id ?? index + 1,
        start,
        end,
        text,
        normalizedText,
        avgLogprob: Number.isFinite(Number(segment?.avg_logprob)) ? Number(segment.avg_logprob) : undefined,
        noSpeechProb: Number.isFinite(Number(segment?.no_speech_prob)) ? Number(segment.no_speech_prob) : undefined
      };
      const words = Array.isArray(segment?.words)
        ? segment.words.map((word, wordIndex) => normalizeWord(word, wordIndex, base)).filter(Boolean)
        : [];
      return { ...base, words };
    })
    .filter((segment) => segment.text && segment.end > segment.start)
    .sort((left, right) => left.start - right.start || left.end - right.end);
}

function charNgrams(value, size = 2) {
  const chars = [...String(value || "")];
  if (!chars.length) return [];
  if (chars.length <= size) return [chars.join("")];
  const grams = [];
  for (let index = 0; index <= chars.length - size; index += 1) {
    grams.push(chars.slice(index, index + size).join(""));
  }
  return grams;
}

function diceCoefficient(left, right) {
  const leftGrams = charNgrams(left);
  const rightGrams = charNgrams(right);
  if (!leftGrams.length || !rightGrams.length) return 0;
  const counts = new Map();
  for (const gram of leftGrams) counts.set(gram, (counts.get(gram) || 0) + 1);
  let shared = 0;
  for (const gram of rightGrams) {
    const count = counts.get(gram) || 0;
    if (count > 0) {
      shared += 1;
      counts.set(gram, count - 1);
    }
  }
  return (2 * shared) / (leftGrams.length + rightGrams.length);
}

function lcsSimilarity(left, right) {
  const a = [...left];
  const b = [...right];
  if (!a.length || !b.length) return 0;
  const previous = new Array(b.length + 1).fill(0);
  const current = new Array(b.length + 1).fill(0);
  for (let row = 1; row <= a.length; row += 1) {
    for (let column = 1; column <= b.length; column += 1) {
      current[column] = a[row - 1] === b[column - 1]
        ? previous[column - 1] + 1
        : Math.max(previous[column], current[column - 1]);
    }
    for (let column = 0; column <= b.length; column += 1) previous[column] = current[column];
  }
  return previous[b.length] / Math.max(a.length, b.length);
}

export function speechSimilarity(left, right) {
  const a = normalizeTextForSimilarity(left);
  const b = normalizeTextForSimilarity(right);
  if (!a || !b) return 0;
  if (a === b) return 1;
  const shorter = a.length <= b.length ? a : b;
  const longer = a.length > b.length ? a : b;
  if (shorter.length >= 6 && longer.includes(shorter)) {
    return Math.max(0.82, shorter.length / longer.length);
  }
  return Math.max(diceCoefficient(a, b), lcsSimilarity(a, b));
}

function countTermMatches(text, terms) {
  let count = 0;
  const compact = stripSpeechPunctuation(text);
  for (const term of terms) {
    const normalized = stripSpeechPunctuation(term);
    if (!normalized) continue;
    const matches = compact.match(new RegExp(escapeRegExp(normalized), "giu"));
    count += matches ? matches.length : 0;
  }
  return count;
}

function countAdjacentDuplicateWords(words, { maxGapSeconds = DEFAULT_OPTIONS.maxDuplicateWordGapSeconds } = {}) {
  if (!Array.isArray(words) || words.length < 2) return 0;
  let count = 0;
  let index = 0;
  while (index < words.length - 1) {
    const normalized = words[index].normalizedText;
    if (!normalized || LEGITIMATE_SINGLE_REPEATS.has(normalized)) {
      index += 1;
      continue;
    }
    let runEnd = index;
    while (
      runEnd + 1 < words.length
      && words[runEnd + 1].normalizedText === normalized
      && words[runEnd + 1].start - words[runEnd].end <= maxGapSeconds
    ) {
      runEnd += 1;
    }
    if (runEnd > index) {
      count += runEnd - index;
      index = runEnd + 1;
    } else {
      index += 1;
    }
  }
  return count;
}

function countInlineRepeats(text) {
  const compact = stripSpeechPunctuation(text);
  let count = 0;
  const pattern = /([\p{Script=Han}A-Za-z0-9]{1,4})\1+/gu;
  for (const match of compact.matchAll(pattern)) {
    const repeated = match[1];
    if (repeated.length === 1 && LEGITIMATE_SINGLE_REPEATS.has(repeated)) continue;
    count += 1;
  }
  return count;
}

function countInternalPauses(words, thresholdSeconds) {
  if (!Array.isArray(words) || words.length < 2) return 0;
  let count = 0;
  for (let index = 0; index < words.length - 1; index += 1) {
    if (words[index + 1].start - words[index].end > thresholdSeconds) count += 1;
  }
  return count;
}

function keywordSetForRepeatedTake(text) {
  const normalized = normalizeTextForSimilarity(text);
  const keywords = new Set();
  for (const chunk of normalized.match(/[\p{Script=Han}A-Za-z0-9]{2,}/gu) || []) {
    if (chunk.length >= 2) keywords.add(chunk);
    if (chunk.length >= 4) {
      for (let size = 2; size <= Math.min(4, chunk.length); size += 1) {
        for (let index = 0; index <= chunk.length - size; index += 1) {
          keywords.add(chunk.slice(index, index + size));
        }
      }
    }
  }
  return keywords;
}

function repeatedTakeCoreOverlap(leftText, rightText) {
  const left = keywordSetForRepeatedTake(leftText);
  const right = keywordSetForRepeatedTake(rightText);
  if (!left.size || !right.size) return 0;
  const smaller = left.size <= right.size ? left : right;
  const larger = left.size > right.size ? left : right;
  let shared = 0;
  for (const item of smaller) {
    if (larger.has(item)) shared += 1;
  }
  return shared / smaller.size;
}

function isRepeatedTakeCandidate(left, right, options = {}) {
  const similarity = speechSimilarity(left.text, right.text);
  if (similarity >= options.repeatedTakeSimilarity) return { matched: true, similarity, overlap: repeatedTakeCoreOverlap(left.text, right.text) };
  const overlap = repeatedTakeCoreOverlap(left.text, right.text);
  const leftLength = left.normalizedText.length;
  const rightLength = right.normalizedText.length;
  const shorter = Math.min(leftLength, rightLength);
  const longer = Math.max(leftLength, rightLength);
  const lengthRatio = longer > 0 ? shorter / longer : 0;
  const fragmentToFullTake = shorter >= 6 && overlap >= 0.72 && lengthRatio <= 0.78;
  const sameIdeaRetake = shorter >= 10 && overlap >= 0.78 && similarity >= 0.52;
  return { matched: fragmentToFullTake || sameIdeaRetake, similarity, overlap };
}

function hasTrailingFragment(text) {
  const compact = stripSpeechPunctuation(text);
  return TRAILING_FRAGMENT_TERMS.some((term) => compact.endsWith(stripSpeechPunctuation(term)));
}

function hasSentenceEnd(text) {
  return SENTENCE_END_PATTERN.test(String(text || ""));
}

function hasIncompleteTailEnding(text) {
  const compact = stripSpeechPunctuation(text);
  if (!compact || COMPLETE_SHORT_CLOSINGS.has(compact)) return false;
  const endsIncomplete = INCOMPLETE_TRAILING_TERMS.some((term) => compact.endsWith(stripSpeechPunctuation(term)));
  const startsShortUnfinishedTopic = compact.length <= 6
    && NEW_TOPIC_TRAILING_STARTS.some((term) => compact.startsWith(stripSpeechPunctuation(term)));
  return endsIncomplete || startsShortUnfinishedTopic;
}

function lastSentenceEndIndex(text) {
  let index = -1;
  for (const match of String(text || "").matchAll(/[。！？!?]/gu)) {
    index = match.index ?? index;
  }
  return index;
}

function wordCutStartAfterLastSentenceEnd(segment) {
  if (!Array.isArray(segment.words) || !segment.words.length) return null;
  let sentenceEndWordIndex = -1;
  for (let index = 0; index < segment.words.length; index += 1) {
    if (hasSentenceEnd(segment.words[index].text)) sentenceEndWordIndex = index;
  }
  const nextWord = segment.words[sentenceEndWordIndex + 1];
  return nextWord ? roundTime(nextWord.start) : null;
}

function estimateCutStartAfterTextIndex(segment, textIndex) {
  const text = cleanText(segment.text);
  if (!text || textIndex < 0) return null;
  const ratio = Math.max(0, Math.min(1, (textIndex + 1) / text.length));
  return roundTime(segment.start + (segment.end - segment.start) * ratio);
}

function trailingTailFromLastSentence(segment) {
  const text = cleanText(segment.text);
  const sentenceEnd = lastSentenceEndIndex(text);
  if (sentenceEnd < 0 || sentenceEnd >= text.length - 1) return null;
  const tailText = text.slice(sentenceEnd + 1).trim();
  const compact = stripSpeechPunctuation(tailText);
  if (!compact || COMPLETE_SHORT_CLOSINGS.has(compact)) return null;
  const cutStart = wordCutStartAfterLastSentenceEnd(segment)
    ?? estimateCutStartAfterTextIndex(segment, sentenceEnd);
  if (!(cutStart > segment.start && cutStart < segment.end)) return null;
  return { text: tailText, compact, cutStart };
}

export function scoreSpeechFluency(segment, options = {}) {
  const normalizedLength = segment.normalizedText.length;
  const groupMaxLength = Math.max(normalizedLength, asNumber(options.groupMaxNormalizedLength));
  const hardFillers = countTermMatches(segment.text, HARD_FILLER_TERMS);
  const softFillers = countTermMatches(segment.text, SOFT_FILLER_TERMS);
  const duplicateWords = countAdjacentDuplicateWords(segment.words, options);
  const inlineRepeats = duplicateWords || countInlineRepeats(segment.text);
  const internalPauses = countInternalPauses(segment.words, options.internalPauseSeconds || DEFAULT_OPTIONS.internalPauseSeconds);
  const trailingFragment = hasTrailingFragment(segment.text);
  const completenessRatio = groupMaxLength > 0 ? normalizedLength / groupMaxLength : 1;
  const incompletePenalty = completenessRatio < 0.72 ? (0.72 - completenessRatio) * 34 : 0;
  const logprobPenalty = Number.isFinite(segment.avgLogprob)
    ? Math.max(0, (-0.65 - segment.avgLogprob) * 10)
    : 0;
  const noSpeechPenalty = Number.isFinite(segment.noSpeechProb)
    ? Math.max(0, segment.noSpeechProb * 8)
    : 0;

  const score = 100
    + Math.min(8, normalizedLength * 0.12)
    - hardFillers * 8
    - softFillers * 3
    - inlineRepeats * 11
    - internalPauses * 4
    - (trailingFragment ? 12 : 0)
    - incompletePenalty
    - logprobPenalty
    - noSpeechPenalty;

  return {
    score: Number(score.toFixed(2)),
    diagnostics: {
      normalizedLength,
      hardFillers,
      softFillers,
      duplicateWords,
      inlineRepeats,
      internalPauses,
      trailingFragment,
      completenessRatio: Number(completenessRatio.toFixed(3)),
      logprobPenalty: Number(logprobPenalty.toFixed(2)),
      noSpeechPenalty: Number(noSpeechPenalty.toFixed(2))
    }
  };
}

function compareCandidates(left, right, options = {}) {
  const finalTakeScoreMargin = asNumber(options.finalTakeScoreMargin, DEFAULT_OPTIONS.finalTakeScoreMargin);
  if (Math.abs(right.score - left.score) <= finalTakeScoreMargin) {
    const leftNoise = left.diagnostics.hardFillers + left.diagnostics.softFillers + left.diagnostics.inlineRepeats;
    const rightNoise = right.diagnostics.hardFillers + right.diagnostics.softFillers + right.diagnostics.inlineRepeats;
    if (rightNoise <= leftNoise + 1) return right.start - left.start;
  }
  return right.score - left.score
    || (left.diagnostics.hardFillers + left.diagnostics.softFillers) - (right.diagnostics.hardFillers + right.diagnostics.softFillers)
    || left.diagnostics.inlineRepeats - right.diagnostics.inlineRepeats
    || right.diagnostics.normalizedLength - left.diagnostics.normalizedLength
    || right.start - left.start;
}

function candidateFromSegment(segment, groupMaxNormalizedLength) {
  const scored = scoreSpeechFluency(segment, { groupMaxNormalizedLength });
  return {
    id: segment.id,
    start: segment.start,
    end: segment.end,
    text: segment.text,
    normalizedText: segment.normalizedText,
    score: scored.score,
    diagnostics: scored.diagnostics
  };
}

function finalizeTakeGroup(candidates, id, options = {}) {
  const groupMaxNormalizedLength = Math.max(...candidates.map((candidate) => candidate.normalizedText.length));
  const scored = candidates
    .map((candidate) => candidateFromSegment(candidate, groupMaxNormalizedLength))
    .sort((left, right) => compareCandidates(left, right, options));
  const keep = scored[0];
  return {
    id,
    type: "best_take",
    start: scored.reduce((value, candidate) => Math.min(value, candidate.start), scored[0].start),
    end: scored.reduce((value, candidate) => Math.max(value, candidate.end), scored[0].end),
    keep,
    remove: scored.filter((candidate) => candidate.id !== keep.id),
    candidates: scored
  };
}

export function findRepeatedTakeGroups(input, options = {}) {
  const opts = resolveOptions(options);
  const candidates = normalizeSpeechSegments(input)
    .filter((segment) => segment.normalizedText.length >= opts.minTakeCharacters);
  const groups = [];
  let active = [];

  for (const candidate of candidates) {
    if (!active.length) {
      active = [candidate];
      continue;
    }

    const previous = active.at(-1);
    const gap = candidate.start - previous.end;
    const match = active
      .map((item) => isRepeatedTakeCandidate(item, candidate, opts))
      .sort((left, right) => Number(right.matched) - Number(left.matched)
        || right.similarity - left.similarity
        || right.overlap - left.overlap)[0];
    if (gap <= opts.maxTakeGapSeconds && match?.matched) {
      active.push(candidate);
    } else {
      if (active.length > 1) groups.push(finalizeTakeGroup(active, groups.length + 1, opts));
      active = [candidate];
    }
  }

  if (active.length > 1) groups.push(finalizeTakeGroup(active, groups.length + 1, opts));
  return groups;
}

function removal(start, end, source, reason, extra = {}) {
  return {
    start: roundTime(start),
    end: roundTime(end),
    source,
    reason,
    ...extra
  };
}

function detectLongPauses(segments, options) {
  const removals = [];
  for (let index = 0; index < segments.length - 1; index += 1) {
    const current = segments[index];
    const next = segments[index + 1];
    const gap = next.start - current.end;
    if (gap <= options.maxPauseSeconds) continue;
    const start = current.end + options.pauseHandleSeconds;
    const end = next.start - options.pauseHandleSeconds;
    if (end - start >= options.minRemovalSeconds) {
      removals.push(removal(start, end, "long_pause", "長停頓", {
        gapSeconds: Number(gap.toFixed(3)),
        beforeSegmentId: current.id,
        afterSegmentId: next.id
      }));
    }
  }
  return removals;
}

function detectInternalWordPauses(segments, options) {
  const removals = [];
  for (const segment of segments) {
    const words = Array.isArray(segment.words)
      ? segment.words
        .filter((word) => Number.isFinite(Number(word.start)) && Number.isFinite(Number(word.end)))
        .sort((left, right) => left.start - right.start || left.end - right.end)
      : [];
    for (let index = 0; index < words.length - 1; index += 1) {
      const current = words[index];
      const next = words[index + 1];
      const gap = next.start - current.end;
      if (gap <= options.maxPauseSeconds) continue;
      const start = current.end + options.pauseHandleSeconds;
      const end = next.start - options.pauseHandleSeconds;
      if (end - start >= options.minRemovalSeconds) {
        removals.push(removal(start, end, "long_pause", "長停頓", {
          gapSeconds: Number(gap.toFixed(3)),
          segmentId: segment.id,
          beforeWordId: current.id,
          afterWordId: next.id,
          beforeText: current.text,
          afterText: next.text,
          detectedFrom: "word_timeline"
        }));
      }
    }
  }
  return removals;
}

function detectSpeechPauses(segments, options) {
  return [
    ...detectLongPauses(segments, options),
    ...detectInternalWordPauses(segments, options)
  ];
}

function isAutoCutFillerWord(word) {
  const normalized = stripSpeechPunctuation(word?.text || word?.normalizedText || "");
  return AUTO_CUT_FILLER_TERMS.has(normalized) || /^[嗯呃痾啊欸誒uhm]+$/iu.test(normalized);
}

function segmentHasOnlyFillers(segment) {
  const withoutFillers = normalizeTextForSimilarity(segment.text);
  if (withoutFillers) return false;
  const compact = stripSpeechPunctuation(segment.text);
  return compact.length > 0;
}

function detectWordDisfluencies(segments, options) {
  const removals = [];
  for (const segment of segments) {
    for (const word of segment.words) {
      if (isAutoCutFillerWord(word) && word.end - word.start <= options.maxFillerWordSeconds) {
        removals.push(removal(word.start, word.end, "filler_word", "口癖詞", {
          segmentId: segment.id,
          text: word.text
        }));
      }
    }

    let index = 0;
    while (index < segment.words.length - 1) {
      const normalized = segment.words[index].normalizedText;
      if (!normalized || LEGITIMATE_SINGLE_REPEATS.has(normalized)) {
        index += 1;
        continue;
      }
      let runEnd = index;
      while (
        runEnd + 1 < segment.words.length
        && segment.words[runEnd + 1].normalizedText === normalized
        && segment.words[runEnd + 1].start - segment.words[runEnd].end <= options.maxDuplicateWordGapSeconds
      ) {
        runEnd += 1;
      }
      if (runEnd > index) {
        for (let removeIndex = index; removeIndex < runEnd; removeIndex += 1) {
          const word = segment.words[removeIndex];
          removals.push(removal(word.start, word.end, "stutter_word", "結巴重複詞", {
            segmentId: segment.id,
            text: word.text,
            keptWord: segment.words[runEnd].text
          }));
        }
        index = runEnd + 1;
      } else {
        index += 1;
      }
    }

    if (
      segment.words.length === 0
      && segment.end - segment.start <= options.maxFillerOnlySegmentSeconds
      && segmentHasOnlyFillers(segment)
    ) {
      removals.push(removal(segment.start, segment.end, "filler_segment", "整段只有口癖詞", {
        segmentId: segment.id,
        text: segment.text
      }));
    }
  }
  return removals;
}

function detectDisfluentFragments(segments, options) {
  const removals = [];
  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index];
    const next = segments[index + 1];
    const duration = segment.end - segment.start;
    if (duration > options.maxFalseStartSeconds) continue;

    const scored = scoreSpeechFluency(segment, options);
    const diagnostics = scored.diagnostics;
    const noisy = diagnostics.trailingFragment
      || diagnostics.inlineRepeats > 0
      || diagnostics.hardFillers + diagnostics.softFillers >= 2;
    if (!noisy) continue;

    const gap = next.start - segment.end;
    const similarity = speechSimilarity(segment.text, next.text);
    const shortFragment = segment.normalizedText.length <= 8;
    if (
      gap <= options.maxTakeGapSeconds
      && (similarity >= options.falseStartSimilarity || (shortFragment && diagnostics.trailingFragment))
    ) {
      removals.push(removal(segment.start, segment.end, "false_start", "語句不順或說到一半重來", {
        segmentId: segment.id,
        text: segment.text,
        nextSegmentId: next.id,
        nextText: next.text,
        similarity: Number(similarity.toFixed(3)),
        score: scored.score
      }));
    }
  }
  return removals;
}

function detectRamblingLoops(segments, options) {
  const removals = [];
  const removedSegmentIds = new Set();
  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index];
    if (removedSegmentIds.has(segment.id)) continue;
    if (segment.normalizedText.length < options.minRamblingCharacters) continue;

    for (let nextIndex = index + 1; nextIndex < segments.length; nextIndex += 1) {
      const next = segments[nextIndex];
      if (next.start - segment.end > options.maxRamblingGapSeconds) break;
      if (next.normalizedText.length < options.minRamblingCharacters) continue;

      const match = isRepeatedTakeCandidate(segment, next, {
        ...options,
        repeatedTakeSimilarity: options.ramblingSimilarity
      });
      if (!match.matched) continue;

      const left = candidateFromSegment(segment, Math.max(segment.normalizedText.length, next.normalizedText.length));
      const right = candidateFromSegment(next, Math.max(segment.normalizedText.length, next.normalizedText.length));
      const keepLater = right.score >= left.score - options.finalTakeScoreMargin;
      const removeTarget = keepLater ? left : right;
      const keepTarget = keepLater ? right : left;
      if (removedSegmentIds.has(removeTarget.id)) continue;

      removedSegmentIds.add(removeTarget.id);
      removals.push(removal(removeTarget.start, removeTarget.end, "rambling_loop", "鬼打牆重複內容，保留後面較完整的一次", {
        segmentId: removeTarget.id,
        text: removeTarget.text,
        keptSegmentId: keepTarget.id,
        keptText: keepTarget.text,
        similarity: Number(match.similarity.toFixed(3)),
        coreOverlap: Number(match.overlap.toFixed(3)),
        score: removeTarget.score,
        keptScore: keepTarget.score
      }));
      break;
    }
  }
  return removals;
}

function detectTrailingIncomplete(segments, options, durationSeconds) {
  if (!segments.length || !(durationSeconds > 0)) return [];
  const last = segments.at(-1);
  const end = Math.max(last.end, durationSeconds);
  const maxCharacters = Math.max(1, asNumber(options.maxTrailingIncompleteCharacters, DEFAULT_OPTIONS.maxTrailingIncompleteCharacters));
  const maxSeconds = Math.max(0, asNumber(options.maxTrailingIncompleteSeconds, DEFAULT_OPTIONS.maxTrailingIncompleteSeconds));

  const tail = trailingTailFromLastSentence(last);
  if (
    tail
    && tail.compact.length <= maxCharacters
    && hasIncompleteTailEnding(tail.text)
    && end - tail.cutStart >= options.minRemovalSeconds
  ) {
    return [removal(tail.cutStart, end, "trailing_incomplete", "片尾話題未講完，保留前面最後完整句", {
      segmentId: last.id,
      text: tail.text,
      fullSegmentText: last.text
    })];
  }

  const compact = stripSpeechPunctuation(last.text);
  const duration = last.end - last.start;
  const hasPreviousContent = segments.length > 1;
  if (
    hasPreviousContent
    && !hasSentenceEnd(last.text)
    && compact.length > 0
    && compact.length <= maxCharacters
    && (!maxSeconds || duration <= maxSeconds)
    && hasIncompleteTailEnding(last.text)
    && end - last.start >= options.minRemovalSeconds
  ) {
    return [removal(last.start, end, "trailing_incomplete", "片尾話題未講完，保留前面最後完整句", {
      segmentId: last.id,
      text: last.text
    })];
  }

  return [];
}

function repeatedTakeRemovals(groups) {
  const removals = [];
  for (const group of groups) {
    for (const candidate of group.remove) {
      removals.push(removal(candidate.start, candidate.end, "repeated_take", "同一句話重講，保留較通順的一版", {
        groupId: group.id,
        segmentId: candidate.id,
        text: candidate.text,
        score: candidate.score,
        keptSegmentId: group.keep.id,
        keptText: group.keep.text,
        keptScore: group.keep.score
      }));
    }
  }
  return removals;
}

export function mergeRemovalRanges(ranges, options = {}) {
  const opts = resolveOptions(options);
  const normalized = (Array.isArray(ranges) ? ranges : [])
    .map((range) => ({
      ...range,
      start: roundTime(range.start),
      end: roundTime(range.end)
    }))
    .filter((range) => range.end - range.start >= opts.minRemovalSeconds)
    .sort((left, right) => left.start - right.start || left.end - right.end);

  const merged = [];
  for (const range of normalized) {
    const current = merged.at(-1);
    if (current && range.start <= current.end + opts.mergeGapSeconds) {
      current.end = Math.max(current.end, range.end);
      current.sources = [...new Set([...(current.sources || [current.source]), range.source])];
      current.reasons = [...new Set([...(current.reasons || [current.reason]), range.reason])];
      current.items = [...(current.items || []), range];
    } else {
      merged.push({
        ...range,
        sources: [range.source],
        reasons: [range.reason],
        items: [range]
      });
    }
  }

  return merged.map((range, index) => ({
    ...range,
    id: index + 1,
    start: roundTime(range.start),
    end: roundTime(range.end),
    duration: roundTime(range.end - range.start)
  }));
}

function removalSources(range) {
  return [
    ...(Array.isArray(range?.sources) ? range.sources : []),
    range?.source,
    ...(Array.isArray(range?.items) ? range.items.map((item) => item.source) : [])
  ].filter(Boolean);
}

function removalPriority(range) {
  const sources = new Set(removalSources(range));
  const duration = Math.max(0, asNumber(range?.duration, asNumber(range?.end) - asNumber(range?.start)));
  if (sources.has("long_pause")) return 100 + Math.min(8, duration);
  if (sources.has("stutter_word")) return 88;
  if (sources.has("filler_word")) return 82;
  if (sources.has("filler_segment")) return 74;
  if (sources.has("trailing_incomplete")) return 70;
  if (sources.has("false_start")) return 58;
  if (sources.has("repeated_take")) return 52;
  if (sources.has("rambling_loop")) return 44;
  return 36;
}

function reindexRemovalRanges(ranges) {
  return ranges.map((range, index) => ({
    ...range,
    id: index + 1,
    start: roundTime(range.start),
    end: roundTime(range.end),
    duration: roundTime(range.end - range.start)
  }));
}

function smoothCloseRemovalRanges(ranges, options = {}) {
  const minimumGap = Math.max(0, asNumber(options.minGapBetweenAutoCutsSeconds, 0));
  if (!minimumGap) return reindexRemovalRanges(ranges);
  const kept = [];
  for (const range of ranges) {
    const previous = kept.at(-1);
    if (!previous || range.start - previous.end >= minimumGap) {
      kept.push(range);
      continue;
    }

    const currentPriority = removalPriority(range);
    const previousPriority = removalPriority(previous);
    if (currentPriority > previousPriority + 8) {
      kept[kept.length - 1] = range;
    }
  }
  return reindexRemovalRanges(kept);
}

function limitAutoRemovalRatio(ranges, durationSeconds, options = {}) {
  const limit = asNumber(options.maxAutoRemovalRatio, 0);
  if (!(limit > 0) || limit >= 1 || !(durationSeconds > 0)) return reindexRemovalRanges(ranges);
  const maxRemovedSeconds = durationSeconds * limit;
  const totalRemovedSeconds = ranges.reduce((sum, range) => sum + Math.max(0, range.duration || range.end - range.start), 0);
  if (totalRemovedSeconds <= maxRemovedSeconds) return reindexRemovalRanges(ranges);

  const ranked = ranges
    .map((range, index) => ({ index, range, priority: removalPriority(range) }))
    .sort((left, right) => right.priority - left.priority
      || (right.range.duration || 0) - (left.range.duration || 0)
      || left.index - right.index);
  const selected = new Set();
  let selectedSeconds = 0;
  for (const item of ranked) {
    const duration = Math.max(0, item.range.duration || item.range.end - item.range.start);
    if (selectedSeconds > 0 && selectedSeconds + duration > maxRemovedSeconds) continue;
    selected.add(item.index);
    selectedSeconds += duration;
  }
  return reindexRemovalRanges(ranges.filter((_, index) => selected.has(index)));
}

export function buildKeepRanges({ durationSeconds, removeRanges, minKeepSeconds = 0.08 } = {}) {
  const duration = roundTime(durationSeconds);
  if (!(duration > 0)) return [];
  const removals = mergeRemovalRanges(removeRanges)
    .map((range) => ({
      start: Math.max(0, Math.min(duration, range.start)),
      end: Math.max(0, Math.min(duration, range.end))
    }))
    .filter((range) => range.end > range.start)
    .sort((left, right) => left.start - right.start);

  const keepRanges = [];
  let cursor = 0;
  for (const range of removals) {
    if (range.start - cursor >= minKeepSeconds) {
      keepRanges.push({ start: roundTime(cursor), end: roundTime(range.start) });
    }
    cursor = Math.max(cursor, range.end);
  }
  if (duration - cursor >= minKeepSeconds) {
    keepRanges.push({ start: roundTime(cursor), end: duration });
  }
  return keepRanges.map((range, index) => ({
    id: index + 1,
    ...range,
    duration: roundTime(range.end - range.start)
  }));
}

function inferDuration(segments, options) {
  const explicit = asNumber(options.durationSeconds, 0);
  if (explicit > 0) return roundTime(explicit);
  return roundTime(Math.max(0, ...segments.map((segment) => segment.end)));
}

export function createRoughCutPlan(input, options = {}) {
  const opts = resolveOptions(options);
  const segments = normalizeSpeechSegments(input);
  const pauseSegments = opts.pauseTimeline || opts.pauseSegments
    ? normalizeSpeechSegments(opts.pauseTimeline || opts.pauseSegments)
    : segments;
  const groups = opts.cutRepeatedTakes ? findRepeatedTakeGroups(segments, opts) : [];
  const durationSeconds = inferDuration(segments, opts);
  const removals = [
    ...(opts.cutLongPauses ? detectSpeechPauses(pauseSegments, opts) : []),
    ...(opts.cutWordDisfluencies ? detectWordDisfluencies(segments, opts) : []),
    ...(opts.cutDisfluentFragments ? detectDisfluentFragments(segments, opts) : []),
    ...(opts.cutRepeatedTakes ? repeatedTakeRemovals(groups) : []),
    ...(opts.cutRamblingLoops ? detectRamblingLoops(segments, opts) : []),
    ...(opts.cutTrailingIncomplete ? detectTrailingIncomplete(segments, opts, durationSeconds) : [])
  ];
  const candidateRemovals = mergeRemovalRanges(removals, opts);
  const smoothedRemovals = smoothCloseRemovalRanges(candidateRemovals, opts);
  const mergedRemovals = limitAutoRemovalRatio(smoothedRemovals, durationSeconds, opts);
  const keepRanges = buildKeepRanges({
    durationSeconds,
    removeRanges: mergedRemovals,
    minKeepSeconds: opts.minKeepSeconds
  });
  const removedSeconds = roundTime(mergedRemovals.reduce((sum, range) => sum + range.duration, 0));
  const keptSeconds = roundTime(keepRanges.reduce((sum, range) => sum + range.duration, 0));

  return {
    version: 1,
    kind: "rough_cut_plan",
    durationSeconds,
    inputSegmentCount: segments.length,
    summary: {
      repeatedTakeGroups: groups.length,
      candidateRemovals: candidateRemovals.length,
      removals: mergedRemovals.length,
      candidateRemovedSeconds: roundTime(candidateRemovals.reduce((sum, range) => sum + range.duration, 0)),
      removedSeconds,
      keptSeconds,
      estimatedOutputSeconds: keptSeconds
    },
    groups,
    removals: mergedRemovals,
    keepRanges,
    options: {
      maxPauseSeconds: opts.maxPauseSeconds,
      pauseHandleSeconds: opts.pauseHandleSeconds,
      repeatedTakeSimilarity: opts.repeatedTakeSimilarity,
      maxTakeGapSeconds: opts.maxTakeGapSeconds,
      ramblingSimilarity: opts.ramblingSimilarity,
      finalTakeScoreMargin: opts.finalTakeScoreMargin,
      cutTrailingIncomplete: opts.cutTrailingIncomplete,
      maxTrailingIncompleteSeconds: opts.maxTrailingIncompleteSeconds,
      maxTrailingIncompleteCharacters: opts.maxTrailingIncompleteCharacters,
      minGapBetweenAutoCutsSeconds: opts.minGapBetweenAutoCutsSeconds,
      maxAutoRemovalRatio: opts.maxAutoRemovalRatio,
      audioFadeSeconds: opts.audioFadeSeconds
    }
  };
}

export function formatRoughCutTime(seconds) {
  const safe = Math.max(0, asNumber(seconds));
  let totalMilliseconds = Math.round(safe * 1000);
  const hours = Math.floor(totalMilliseconds / 3600000);
  totalMilliseconds %= 3600000;
  const minutes = Math.floor(totalMilliseconds / 60000);
  totalMilliseconds %= 60000;
  const wholeSeconds = Math.floor(totalMilliseconds / 1000);
  const milliseconds = totalMilliseconds % 1000;
  const base = `${String(minutes).padStart(2, "0")}:${String(wholeSeconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
  return hours > 0 ? `${String(hours).padStart(2, "0")}:${base}` : base;
}

export function roughCutPlanToText(plan) {
  const lines = [
    "粗剪建議",
    `原始長度：${formatRoughCutTime(plan.durationSeconds)}`,
    `預估成片：${formatRoughCutTime(plan.summary?.estimatedOutputSeconds || 0)}`,
    `刪除段數：${plan.removals?.length || 0}`,
    ""
  ];

  for (const range of plan.removals || []) {
    const reasons = range.reasons?.join("、") || range.reason || "粗剪";
    lines.push(`${String(range.id).padStart(2, "0")}. ${formatRoughCutTime(range.start)} - ${formatRoughCutTime(range.end)}｜${reasons}`);
  }

  if (plan.groups?.length) {
    lines.push("", "最佳語句保留");
    for (const group of plan.groups) {
      lines.push(`G${group.id} 保留 ${formatRoughCutTime(group.keep.start)} - ${formatRoughCutTime(group.keep.end)}｜${group.keep.text}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

function filterNumber(value) {
  return String(roundTime(value));
}

function normalizeAudioGain(value) {
  const gain = Number(value);
  if (!Number.isFinite(gain)) return 1;
  return Math.max(0, Math.min(3, Number(gain.toFixed(2))));
}

function audioGainFilter(value) {
  const gain = normalizeAudioGain(value);
  return Math.abs(gain - 1) < 0.001 ? null : `volume=${filterNumber(gain)}`;
}

export function buildRoughCutFfmpegArgs({
  mediaPath,
  outputPath,
  keepRanges,
  hasAudio = true,
  videoCodec = "libx264",
  audioCodec = "aac",
  preset = "slow",
  crf = 10,
  videoBitrate = null,
  videoMaxRate = null,
  videoBufferSize = null,
  videoProfile = null,
  videoCodecArgs = [],
  audioBitrate = "384k",
  audioFadeSeconds = DEFAULT_OPTIONS.audioFadeSeconds,
  audioGain = 1
} = {}) {
  const ranges = (Array.isArray(keepRanges) ? keepRanges : [])
    .filter((range) => asNumber(range.end) > asNumber(range.start));
  if (!mediaPath) throw new Error("缺少原始影片路徑。");
  if (!outputPath) throw new Error("缺少粗剪輸出路徑。");
  if (!ranges.length) throw new Error("沒有可保留的影片區段，無法輸出粗剪。");

  const filters = [];
  ranges.forEach((range, index) => {
    const duration = roundTime(range.end - range.start);
    filters.push(`[0:v]trim=start=${filterNumber(range.start)}:end=${filterNumber(range.end)},setpts=PTS-STARTPTS[v${index}]`);
    if (hasAudio) {
      const fade = Math.min(asNumber(audioFadeSeconds, 0), Math.max(0, duration / 3));
      const fadeOutStart = Math.max(0, duration - fade);
      const audioFilters = [
        `atrim=start=${filterNumber(range.start)}:end=${filterNumber(range.end)}`,
        "asetpts=PTS-STARTPTS",
        "aresample=async=1:first_pts=0",
        ...(audioGainFilter(audioGain) ? [audioGainFilter(audioGain)] : []),
        ...(fade > 0 ? [
          `afade=t=in:st=0:d=${filterNumber(fade)}`,
          `afade=t=out:st=${filterNumber(fadeOutStart)}:d=${filterNumber(fade)}`
        ] : [])
      ];
      filters.push(`[0:a]${audioFilters.join(",")}[a${index}]`);
    }
  });
  const concatInputs = ranges
    .map((_, index) => hasAudio ? `[v${index}][a${index}]` : `[v${index}]`)
    .join("");
  filters.push(`${concatInputs}concat=n=${ranges.length}:v=1:a=${hasAudio ? 1 : 0}${hasAudio ? "[outv][outa]" : "[outv]"}`);

  const args = [
    "-hide_banner", "-loglevel", "error", "-y",
    "-i", mediaPath,
    "-filter_complex", filters.join(";"),
    "-map", "[outv]"
  ];
  if (hasAudio) args.push("-map", "[outa]");
  else args.push("-an");
  args.push("-c:v", videoCodec);
  if (preset) args.push("-preset", preset);
  if (crf !== null && crf !== undefined) args.push("-crf", String(crf));
  if (videoProfile) args.push("-profile:v", videoProfile);
  if (videoBitrate) args.push("-b:v", videoBitrate);
  if (videoMaxRate) args.push("-maxrate", videoMaxRate);
  if (videoBufferSize) args.push("-bufsize", videoBufferSize);
  if (Array.isArray(videoCodecArgs) && videoCodecArgs.length) args.push(...videoCodecArgs);
  if (hasAudio) args.push("-c:a", audioCodec, "-b:a", audioBitrate);
  args.push("-movflags", "+faststart", outputPath);
  return args;
}

function runFfmpeg(args, { command = ffmpegPath, runner = spawn } = {}) {
  return new Promise((resolve, reject) => {
    const child = runner(command, args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr?.on("data", (chunk) => {
      stderr = `${stderr}${chunk}`.slice(-20000);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve({ stderr });
      else reject(new Error(stderr.trim() || `FFmpeg 粗剪失敗，代碼 ${code}`));
    });
  });
}

function concatFileLine(filePath) {
  return `file '${String(filePath).replaceAll("'", "'\\''")}'`;
}

export function buildSegmentPartFfmpegArgs({
  mediaPath,
  partPath,
  range,
  hasAudio = true,
  seekPrerollSeconds = 1.2,
  audioFadeSeconds = DEFAULT_OPTIONS.audioFadeSeconds,
  outputFps = null,
  videoCodec = "libx264",
  audioCodec = "aac",
  preset = "slow",
  crf = 10,
  videoBitrate = null,
  videoMaxRate = null,
  videoBufferSize = null,
  videoProfile = null,
  videoCodecArgs = [],
  audioBitrate = "384k",
  audioSampleRate = null,
  audioGain = 1,
  movflags = "+faststart"
} = {}) {
  const start = roundTime(range?.start);
  const end = roundTime(range?.end);
  const duration = roundTime(end - start);
  if (!mediaPath) throw new Error("缺少原始影片路徑。");
  if (!partPath) throw new Error("缺少粗剪暫存片段路徑。");
  if (!(duration > 0)) throw new Error("粗剪暫存片段時間範圍無效。");

  const inputSeek = Math.max(0, start - seekPrerollSeconds);
  const accurateSeek = start - inputSeek;
  const readDuration = duration + accurateSeek + 0.25;
  const fade = Math.min(audioFadeSeconds, Math.max(0, duration / 3));
  const fadeOutStart = Math.max(0, duration - fade);
  const videoFilter = [
    "setpts=PTS-STARTPTS",
    `trim=start=${filterNumber(accurateSeek)}:duration=${filterNumber(duration)}`,
    "setpts=PTS-STARTPTS",
    ...(outputFps ? [`fps=${outputFps}`] : []),
    "format=yuv420p"
  ].join(",");
  const audioFilter = [
    "asetpts=PTS-STARTPTS",
    `atrim=start=${filterNumber(accurateSeek)}:duration=${filterNumber(duration)}`,
    "asetpts=PTS-STARTPTS",
    audioSampleRate ? `aresample=${audioSampleRate}:async=1:first_pts=0` : "aresample=async=1:first_pts=0",
    ...(audioGainFilter(audioGain) ? [audioGainFilter(audioGain)] : []),
    ...(fade > 0 ? [
      `afade=t=in:st=0:d=${filterNumber(fade)}`,
      `afade=t=out:st=${filterNumber(fadeOutStart)}:d=${filterNumber(fade)}`
    ] : [])
  ].join(",");

  const args = [
    "-hide_banner", "-loglevel", "error", "-y",
    "-ss", filterNumber(inputSeek),
    "-t", filterNumber(readDuration),
    "-i", mediaPath,
    "-map", "0:v:0",
    "-vf", videoFilter
  ];
  if (outputFps) args.push("-fps_mode", "cfr", "-r", String(outputFps));
  if (hasAudio) {
    args.push("-map", "0:a?", "-af", audioFilter);
    if (audioSampleRate) args.push("-ar", String(audioSampleRate));
  } else {
    args.push("-an");
  }
  args.push("-c:v", videoCodec);
  if (preset) args.push("-preset", preset);
  if (crf !== null && crf !== undefined) args.push("-crf", String(crf));
  if (videoProfile) args.push("-profile:v", videoProfile);
  if (videoBitrate) args.push("-b:v", videoBitrate);
  if (videoMaxRate) args.push("-maxrate", videoMaxRate);
  if (videoBufferSize) args.push("-bufsize", videoBufferSize);
  if (Array.isArray(videoCodecArgs) && videoCodecArgs.length) args.push(...videoCodecArgs);
  if (hasAudio) {
    args.push("-af", audioFilter);
    args.push("-c:a", audioCodec);
    if (audioBitrate) args.push("-b:a", audioBitrate);
  }
  args.push("-avoid_negative_ts", "make_zero");
  if (movflags) args.push("-movflags", movflags);
  args.push("-shortest", partPath);
  return args;
}

async function createSegmentedRoughCutVideo({
  mediaPath,
  outputPath,
  keepRanges,
  hasAudio = true,
  audioFadeSeconds = DEFAULT_OPTIONS.audioFadeSeconds,
  audioGain = 1,
  runner,
  ffmpegCommand,
  videoEncodingOptions = {},
  cleanup = true
}) {
  const tempDirectory = path.join(
    path.dirname(outputPath),
    `.roughcut-parts-${randomUUID()}`
  );
  await mkdir(tempDirectory, { recursive: true });
  const partPaths = [];

  try {
    for (let index = 0; index < keepRanges.length; index += 1) {
      const range = keepRanges[index];
      const partPath = path.join(tempDirectory, `part-${String(index + 1).padStart(4, "0")}.mov`);
      const args = buildSegmentPartFfmpegArgs({
        mediaPath,
        partPath,
        range,
        hasAudio,
        audioFadeSeconds,
        audioGain: 1,
        ...videoEncodingOptions,
        ...(hasAudio ? { audioCodec: "pcm_s16le", audioBitrate: null } : {})
      });
      await runFfmpeg(args, { command: ffmpegCommand, runner });
      partPaths.push(partPath);
    }

    const listPath = path.join(tempDirectory, "concat-list.txt");
    await writeFile(listPath, `${partPaths.map(concatFileLine).join("\n")}\n`, "utf8");
    const concatArgs = [
      "-hide_banner", "-loglevel", "error", "-y",
      "-f", "concat", "-safe", "0", "-i", listPath,
      "-map", "0:v:0"
    ];
    if (hasAudio) {
      concatArgs.push(
        "-map", "0:a?",
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "384k",
        "-af", [
          "aresample=async=1:first_pts=0",
          ...(audioGainFilter(audioGain) ? [audioGainFilter(audioGain)] : [])
        ].join(","),
        "-shortest"
      );
    } else {
      concatArgs.push("-c:v", "copy", "-an");
    }
    concatArgs.push("-avoid_negative_ts", "make_zero", "-movflags", "+faststart", outputPath);
    await runFfmpeg(concatArgs, { command: ffmpegCommand, runner });

    if (cleanup) await rm(tempDirectory, { recursive: true, force: true });
    return { renderMode: "segmented", partCount: partPaths.length };
  } catch (error) {
    if (cleanup) {
      await rm(tempDirectory, { recursive: true, force: true });
      error.message = `${error.message}（分段暫存已清理）`;
    } else {
      error.message = `${error.message}（分段暫存保留在 ${tempDirectory}）`;
    }
    throw error;
  }
}

export async function createRoughCutVideo({
  mediaPath,
  outputPath,
  plan,
  keepRanges,
  removeRanges,
  durationSeconds,
  hasAudio = true,
  verify = true,
  renderMode = "auto",
  segmentThreshold = 24,
  audioFadeSeconds = plan?.options?.audioFadeSeconds ?? DEFAULT_OPTIONS.audioFadeSeconds,
  audioGain = 1,
  videoEncodingOptions: requestedVideoEncodingOptions = null,
  runner,
  ffmpegCommand
} = {}) {
  const ranges = keepRanges
    || plan?.keepRanges
    || buildKeepRanges({ durationSeconds, removeRanges });
  await mkdir(path.dirname(outputPath), { recursive: true });
  const videoEncodingOptions = requestedVideoEncodingOptions || (process.platform === "darwin" && !runner && !ffmpegCommand
    ? {
        videoCodec: "h264_videotoolbox",
        preset: null,
        crf: null,
        videoProfile: "high",
        videoBitrate: "36M",
        videoMaxRate: "48M",
        videoBufferSize: "72M",
        videoCodecArgs: ["-realtime", "1", "-prio_speed", "1"]
      }
    : {});
  const effectiveSegmentThreshold = videoEncodingOptions.videoCodec === "h264_videotoolbox"
    ? 1
    : segmentThreshold;
  let renderResult;
  if (renderMode === "segmented" || (renderMode === "auto" && ranges.length > effectiveSegmentThreshold)) {
    renderResult = await createSegmentedRoughCutVideo({
      mediaPath,
      outputPath,
      keepRanges: ranges,
      hasAudio,
      audioFadeSeconds,
      audioGain,
      runner,
      ffmpegCommand,
      videoEncodingOptions
    });
  } else {
    const args = buildRoughCutFfmpegArgs({
      mediaPath,
      outputPath,
      keepRanges: ranges,
      hasAudio,
      audioFadeSeconds,
      audioGain,
      ...videoEncodingOptions
    });
    await runFfmpeg(args, { command: ffmpegCommand, runner });
    renderResult = { renderMode: "filter", args };
  }
  if (verify) {
    await runFfmpeg(["-v", "error", "-i", outputPath, "-map", "0", "-f", "null", "-"], {
      command: ffmpegCommand,
      runner
    });
  }
  return {
    outputPath,
    keepRanges: ranges,
    ...renderResult
  };
}

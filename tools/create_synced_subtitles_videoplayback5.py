#!/usr/bin/env python3
import json
import re
from pathlib import Path

from single_line_subtitle_video import (
    burn_video,
    display_width,
    probe_video,
    write_ass,
    write_srt,
)


INPUT_VIDEO = Path("/Users/redball/Downloads/videoplayback (5).mp4")
TIMELINE = Path("/Users/redball/Downloads/videoplayback (5)_whisper_timeline.json")
OUTPUT_VIDEO = Path("/Users/redball/Downloads/videoplayback (5)_上字幕_精修完整版.mp4")
OUTPUT_ASS = Path("/Users/redball/Downloads/videoplayback (5)_單行字幕_精修完整版.ass")
OUTPUT_SRT = Path("/Users/redball/Downloads/videoplayback (5)_單行字幕_精修完整版.srt")
SUMMARY = Path("/Users/redball/Downloads/videoplayback (5)_字幕摘要_精修完整版.json")


CORRECTIONS = {
    3: "因為你妹妹跟 Shan 有關的關係。",
    7: "對，我很多朋友都很保護自己的妹妹。",
    12: "就直接把其他都擋掉了，對不對？",
    14: "就不會有這些臭魚爛蝦跑出來。",
    17: "省得你去幫他擋掉那些爛番薯臭鳥蛋，對不對？",
    18: "就找一個最熟的臭魚，對不對？",
    19: "所以是已經 verify Shan？",
    21: "我其實是從國中跟他做朋友的關係。",
    28: "那你覺得 Shan 跟那些其他男生差在哪裡？",
    29: "Shan 我覺得就是一個很單純的。",
    31: "我覺得他不會有一些亂七八糟的。",
    32: "我可以很確定他不會做那些亂七八糟的事情。",
    42: "Shan 是你已經 verified 過？",
    46: "你相信 Shan？",
    49: "你看他長那麼高又這麼帥。",
    51: "就你男配美女滿配的。",
    53: "他說他也沒什麼嘗試這樣子。",
    57: "其實我妹很有嘗試，可以互補一下。",
    70: "我們只要一個節目。",
    73: "Shan 以前交的那些女生。",
    74: "你也知道 Shan 是怎麼對待女生的。",
    76: "他交女朋友那一陣子。",
    77: "他就消失了。",
    90: "就是讓他交女朋友也沒辦法消失。",
    92: "他就直接交我妹。",
    99: "就感覺很像什麼 A 片劇情。",
}

SPLITS = {
    2: [
        (4.56, 7.36, "因為我..."),
        (7.36, 9.14, "個人是很興奮。"),
    ],
    3: [
        (9.14, 12.56, "因為你妹妹跟..."),
        (12.56, 16.42, "Shan 有關的關係。"),
    ],
    5: [
        (19.20, 21.64, "因為我一開始..."),
        (21.64, 25.04, "看哥哥。"),
    ],
    33: [
        (78.64, 79.80, "對欸，你呢？"),
        (79.80, 80.70, "而且加上..."),
        (80.70, 82.84, "你小心一點咧。"),
        (82.84, 83.58, "加上..."),
        (83.58, 85.00, "他是真的很帥。"),
        (85.00, 85.78, "嗯。"),
        (85.78, 87.96, "他是真的很帥。"),
    ],
    41: [
        (95.28, 97.08, "夏天已經很熱了，你知道。"),
        (97.08, 99.04, "全部人說 so hard man。"),
        (99.04, 100.52, "有更 hard 了，真的。"),
        (101.04, 103.06, "他從水裡面起來，頭髮一甩。"),
        (103.06, 104.48, "喔，James Bond。"),
        (104.48, 105.60, "slow motion 那樣子。"),
        (105.60, 106.74, "James Bond。"),
        (106.74, 107.98, "所以他真的是 James Bond。"),
        (107.98, 109.34, "Shan 是你已經 verified 過？"),
    ],
    63: [
        (151.12, 152.10, "原來是這樣。"),
        (152.10, 152.60, "這樣喔。"),
        (152.60, 153.66, "（笑）"),
    ],
    64: [
        (153.66, 155.38, "他直接受不了吧。"),
        (155.38, 156.02, "他直接要走了。"),
        (156.02, 156.80, "他要走了。"),
        (156.80, 158.28, "沒關係，不要生氣。"),
    ],
    92: [
        (206.56, 207.82, "他就直接交我妹。"),
        (207.82, 208.26, "喔。"),
        (208.26, 209.90, "（笑）"),
        (209.90, 210.32, "怎麼樣？"),
        (210.32, 211.48, "躲不掉吧？"),
    ],
}

SKIP_SEGMENTS = {34, 35, 36, 42, 65, 66, 93, 94}


QUESTION_ENDINGS = ("對不對", "怎麼說", "怎麼樣", "躲不掉吧", "有沒有", "能不能")
TERMINAL = ("。", "！", "？", ".", "!", "?", "...")


def default_text(text):
    text = text.strip()
    text = re.sub(r"Shan", " Shan ", text, flags=re.IGNORECASE)
    text = re.sub(r"\s+", " ", text).strip()
    text = text.replace("亂七八到", "亂七八糟")
    text = text.replace("爛蕃薯", "爛番薯")
    text = text.replace("猜哪裡", "差在哪裡")
    text = text.replace("A片", "A 片")
    if not text:
        return text
    if text.endswith(TERMINAL):
        return text
    if text.endswith(QUESTION_ENDINGS):
        return text + "？"
    if text.endswith(("你的", "加上")):
        return text + "..."
    return text + "。"


def load_captions():
    data = json.loads(TIMELINE.read_text(encoding="utf-8"))
    captions = []
    for index, segment in enumerate(data["segments"], start=1):
        if index in SKIP_SEGMENTS:
            continue
        if index in SPLITS:
            for start, end, text in SPLITS[index]:
                captions.append({"start": start, "end": end, "text": text})
            continue
        text = CORRECTIONS.get(index) or default_text(segment["text"])
        captions.append(
            {
                "start": float(segment["start"]),
                "end": float(segment["end"]),
                "text": text,
            }
        )
    return extend_short_gaps(captions)


def extend_short_gaps(captions, max_gap=1.5):
    for index in range(len(captions) - 1):
        gap = captions[index + 1]["start"] - captions[index]["end"]
        if 0 < gap <= max_gap:
            captions[index]["end"] = captions[index + 1]["start"]
    return captions


def validate(captions):
    for index, caption in enumerate(captions, start=1):
        if caption["end"] <= caption["start"]:
            raise RuntimeError(f"Caption {index} has invalid timing.")
        if "\n" in caption["text"] or "\\N" in caption["text"]:
            raise RuntimeError(f"Caption {index} contains a line break.")
        if index > 1 and captions[index - 2]["end"] > caption["start"]:
            raise RuntimeError(f"Caption {index} overlaps the previous caption.")


def main():
    width, height, duration = probe_video(INPUT_VIDEO)
    captions = load_captions()
    validate(captions)

    write_srt(captions, OUTPUT_SRT)
    write_ass(captions, OUTPUT_ASS, width, height)
    burn_video(INPUT_VIDEO, OUTPUT_ASS, OUTPUT_VIDEO)

    gaps = [
        round(captions[index]["start"] - captions[index - 1]["end"], 3)
        for index in range(1, len(captions))
    ]
    summary = {
        "input": str(INPUT_VIDEO),
        "timeline": str(TIMELINE),
        "output_video": str(OUTPUT_VIDEO),
        "output_ass": str(OUTPUT_ASS),
        "output_srt": str(OUTPUT_SRT),
        "width": width,
        "height": height,
        "duration_seconds": duration,
        "caption_count": len(captions),
        "max_caption_display_width": max(display_width(caption["text"]) for caption in captions),
        "line_breaks": 0,
        "overlaps": 0,
        "minimum_gap_seconds": min(gaps) if gaps else None,
        "timing_policy": "word-level-refined-with-short-audible-gap-fill",
    }
    SUMMARY.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False))


if __name__ == "__main__":
    main()

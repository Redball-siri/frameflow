#!/usr/bin/env python3
import json
from pathlib import Path

from single_line_subtitle_video import (
    burn_video,
    display_width,
    normalize_caption_timing,
    probe_video,
    write_ass,
    write_srt,
)


INPUT_VIDEO = Path("/Users/redball/Downloads/videoplayback (5).mp4")
OUTPUT_VIDEO = Path("/Users/redball/Downloads/videoplayback (5)_上字幕_語句版.mp4")
OUTPUT_ASS = Path("/Users/redball/Downloads/videoplayback (5)_單行字幕_語句版.ass")
OUTPUT_SRT = Path("/Users/redball/Downloads/videoplayback (5)_單行字幕_語句版.srt")
SUMMARY = Path("/Users/redball/Downloads/videoplayback (5)_字幕摘要_語句版.json")


CAPTIONS = [
    (2.68, 4.56, "我問你這個問題。"),
    (4.56, 9.14, "因為我個人很興奮。"),
    (9.14, 16.42, "因為你妹妹跟 Shan 有關係。"),
    (17.00, 19.20, "我希望能知道你的意見。"),
    (19.20, 27.92, "因為身為哥哥，都會比較保護一點。"),
    (27.92, 32.08, "對，我很多朋友都很保護自己的妹妹。"),
    (32.08, 33.20, "想說你..."),
    (34.22, 37.56, "我覺得最保護的辦法。"),
    (37.56, 39.82, "就是直接幫她找一個男朋友。"),
    (39.82, 43.84, "你選了一個，就把其他都擋掉了，對不對？"),
    (43.84, 46.14, "至少是你挑的，就不會有臭魚爛蝦跑出來。"),
    (46.64, 49.08, "你是這樣想的，直接幫她選一個好的。"),
    (49.08, 52.40, "省得去擋那些爛番薯臭鳥蛋，對不對？"),
    (52.40, 54.52, "就找一個最熟的臭魚，對不對？"),
    (54.52, 56.26, "所以已經 verify Shan？"),
    (56.26, 60.52, "對，我其實從國中跟他做朋友就已經開始。"),
    (61.02, 63.72, "這個頭髮，這個人到底..."),
    (63.72, 66.22, "快要可以了，差不多了。"),
    (66.22, 68.88, "那你覺得 Shan 跟其他男生差在哪裡？"),
    (68.88, 72.34, "Shan 我覺得就是很單純，這是好事。"),
    (72.34, 78.64, "我很確定他不會做亂七八糟的事情。"),
    (79.64, 80.74, "而且加上..."),
    (81.26, 82.30, "你小心一點。"),
    (82.30, 84.94, "加上他是真的很帥。"),
    (86.18, 89.62, "他是真的很帥，我跟他去花蓮玩。"),
    (89.62, 91.52, "他下水去游泳。"),
    (91.52, 93.34, "對啊，一定呢。"),
    (93.34, 96.92, "沒有必要這樣子，夏天已經很熱了。"),
    (96.92, 109.34, "Shan 是你已經 verified 過的？"),
    (109.34, 113.18, "我覺得他可以，一直可以。"),
    (113.18, 115.14, "你一定有抓到。"),
    (115.14, 118.26, "太誇張了，你相信 Shan？"),
    (118.26, 119.76, "那是你很放心。"),
    (120.34, 123.12, "而且說實話，他又高又帥。"),
    (123.12, 126.98, "我妹也滿高滿漂亮，男配美女滿配的。"),
    (126.98, 129.34, "我有聽你們上一集講。"),
    (129.34, 132.50, "他說他也沒什麼嘗試。"),
    (133.20, 136.70, "其實他說他沒什麼嘗試，其實我妹也是。"),
    (137.26, 138.34, "我以為你要說。"),
    (138.34, 142.20, "其實我妹很有嘗試，可以互補一下。"),
    (142.20, 143.86, "他們就是很配。"),
    (143.86, 147.16, "俊男美女，都沒什麼嘗試，傻傻笨笨的。"),
    (147.16, 150.56, "原來是這樣。"),
    (151.12, 152.10, "原來是這樣。"),
    (153.66, 156.02, "他直接受不了，他要走了。"),
    (156.88, 160.22, "沒關係，不要生氣，不要生氣。"),
    (160.78, 163.14, "好啦，不要這樣子，開玩笑啦。"),
    (163.14, 165.76, "我們只是節目效果而已。"),
    (172.54, 176.24, "你應該看過 Shan 以前交的那些女生。"),
    (176.24, 180.08, "也知道 Shan 是怎麼對待女生的，說實話。"),
    (181.46, 185.42, "他交女朋友那陣子，他就消失了。"),
    (185.42, 186.22, "沒有。"),
    (186.22, 188.78, "他就是那種憑空消失。"),
    (189.44, 194.38, "我那時候從美國回來，要約他約不到，沒空。"),
    (194.38, 196.94, "他就是馬子狗不見了。"),
    (196.94, 199.12, "但其實我也沒有跟我女朋友有約。"),
    (199.12, 202.86, "我那時候就想出一個絕妙的方法。"),
    (202.86, 205.80, "就是讓他交女朋友也沒辦法消失。"),
    (205.80, 206.56, "怎麼說？"),
    (206.56, 207.80, "他就直接交我妹。"),
    (209.84, 210.24, "怎麼樣？"),
    (210.76, 211.66, "躲不掉吧。"),
    (211.66, 212.92, "還好你有講「是」。"),
    (214.28, 215.48, "你期望這樣。"),
    (215.48, 218.60, "不然每次我跟別人說，我跟他妹交往。"),
    (218.60, 220.42, "就感覺很像 A 片劇情。"),
    (220.42, 223.28, "去朋友家發現他妹妹太漂亮。"),
    (223.28, 223.82, "怎樣怎樣。"),
    (223.82, 226.14, "說到這裡，我就有一個問題想問。"),
]


def main():
    width, height, duration = probe_video(INPUT_VIDEO)
    captions = normalize_caption_timing(
        [{"start": start, "end": end, "text": text} for start, end, text in CAPTIONS]
    )
    for index, caption in enumerate(captions, start=1):
        if "\n" in caption["text"] or "\\N" in caption["text"]:
            raise RuntimeError(f"Caption {index} contains a line break.")
        if index > 1 and captions[index - 2]["end"] > caption["start"]:
            raise RuntimeError(f"Caption {index} overlaps the previous caption.")

    OUTPUT_VIDEO.parent.mkdir(parents=True, exist_ok=True)
    write_srt(captions, OUTPUT_SRT)
    write_ass(captions, OUTPUT_ASS, width, height)
    burn_video(INPUT_VIDEO, OUTPUT_ASS, OUTPUT_VIDEO)

    summary = {
        "input": str(INPUT_VIDEO),
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
        "segmentation": "curated-natural-phrases-and-speaker-turns",
    }
    SUMMARY.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False))


if __name__ == "__main__":
    main()

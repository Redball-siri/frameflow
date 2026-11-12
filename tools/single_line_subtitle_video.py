#!/usr/bin/env python3
import argparse
import json
import math
import re
import subprocess
import tempfile
import unicodedata
import wave
from pathlib import Path

import imageio_ffmpeg
import numpy as np
import whisper
from opencc import OpenCC


TERMINAL_PUNCTUATION = ("。", "！", "？", ".", "!", "?")
SOFT_PUNCTUATION = ("，", ",", "、", "；", ";", "：", ":")
SENTENCE_PAUSE_SECONDS = 0.78
SOFT_PAUSE_SECONDS = 0.35
MIN_CAPTION_SECONDS = 0.85
MAX_CAPTION_SECONDS = 4.6


def run(command, *, capture=True):
    completed = subprocess.run(
        command,
        capture_output=capture,
        text=True,
    )
    if completed.returncode != 0:
        detail = (completed.stderr or completed.stdout or "").strip()
        raise RuntimeError(f"Command failed: {' '.join(map(str, command))}\n{detail}")
    return completed


def unique_path(path):
    path = Path(path)
    if not path.exists():
        return path
    counter = 2
    while True:
        candidate = path.with_name(f"{path.stem}_{counter}{path.suffix}")
        if not candidate.exists():
            return candidate
        counter += 1


def ffmpeg_path():
    return imageio_ffmpeg.get_ffmpeg_exe()


def probe_video(input_path):
    completed = subprocess.run(
        [ffmpeg_path(), "-hide_banner", "-i", str(input_path)],
        capture_output=True,
        text=True,
    )
    info = f"{completed.stdout}\n{completed.stderr}"
    video_match = re.search(r"Video:.*? (\d{2,5})x(\d{2,5})", info)
    duration_match = re.search(r"Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)", info)
    if not video_match:
        raise RuntimeError("Could not read video dimensions from ffmpeg output.")
    width = int(video_match.group(1))
    height = int(video_match.group(2))
    duration = None
    if duration_match:
        hours = int(duration_match.group(1))
        minutes = int(duration_match.group(2))
        seconds = float(duration_match.group(3))
        duration = hours * 3600 + minutes * 60 + seconds
    return width, height, duration


def extract_audio(input_path, wav_path):
    run(
        [
            ffmpeg_path(),
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-i",
            str(input_path),
            "-map",
            "0:a:0",
            "-vn",
            "-ac",
            "1",
            "-ar",
            "16000",
            "-codec:a",
            "pcm_s16le",
            str(wav_path),
        ]
    )


def read_pcm16_wav(path):
    with wave.open(str(path), "rb") as audio_file:
        if audio_file.getnchannels() != 1 or audio_file.getsampwidth() != 2:
            raise RuntimeError("Temporary audio is not 16-bit mono PCM.")
        samples = np.frombuffer(audio_file.readframes(audio_file.getnframes()), dtype=np.int16)
    return samples.astype(np.float32) / 32768.0


def normalize_text(text, language, converter):
    text = re.sub(r"\s+", " ", text).strip()
    if language == "zh":
        text = converter.convert(text)
        text = text.translate(
            str.maketrans(
                {
                    ",": "，",
                    "?": "？",
                    "!": "！",
                    ";": "；",
                    ":": "：",
                }
            )
        )
        if text.endswith("."):
            text = text[:-1] + "。"
        text = text.replace(" ", "")
    return text


def is_cjk(text):
    return any("CJK" in unicodedata.name(char, "") for char in text)


def display_width(text):
    width = 0.0
    for char in text:
        if unicodedata.combining(char):
            continue
        if unicodedata.east_asian_width(char) in ("F", "W"):
            width += 2.0
        elif char.isspace():
            width += 0.55
        else:
            width += 1.0
    return width


def join_piece(current, piece, language):
    if not current:
        return piece
    if language == "zh":
        return f"{current}{piece}"
    return f"{current} {piece}"


def max_line_units(width, height):
    base_size = max(22, round(height * 0.054))
    # CJK glyphs are roughly square; keep the usable line comfortably inside the frame.
    units = max(18, math.floor((width * 0.88) / (base_size * 0.52)))
    return min(units, 46)


def base_font_size(height):
    return max(22, round(height * 0.054))


def words_from_result(result, language, converter):
    words = []
    for segment in result.get("segments") or []:
        segment_words = segment.get("words") or []
        if segment_words:
            for word in segment_words:
                text = normalize_text(word.get("word", ""), language, converter)
                if not text:
                    continue
                words.append(
                    {
                        "start": float(word.get("start", segment.get("start", 0))),
                        "end": float(word.get("end", segment.get("end", 0))),
                        "text": text,
                    }
                )
        else:
            text = normalize_text(segment.get("text", ""), language, converter)
            if text:
                words.append(
                    {
                        "start": float(segment.get("start", 0)),
                        "end": float(segment.get("end", 0)),
                        "text": text,
                    }
                )
    return words


def close_caption(captions, start, end, text):
    text = text.strip()
    if not text:
        return
    text = text.replace("\\N", " ").replace("\n", " ")
    captions.append({"start": max(0.0, start), "end": max(end, start + 0.1), "text": text})


def build_captions(words, language, width, height):
    limit = max_line_units(width, height)
    captions = []
    current = ""
    start = None
    end = None

    for index, word in enumerate(words):
        piece = word["text"]
        if start is None:
            start = word["start"]
        current = join_piece(current, piece, language)
        end = word["end"]

        next_word = words[index + 1] if index + 1 < len(words) else None
        pause = max(0.0, next_word["start"] - end) if next_word else 0.0
        stripped = current.rstrip()
        ends_sentence = stripped.endswith(TERMINAL_PUNCTUATION)
        ends_soft = stripped.endswith(SOFT_PUNCTUATION)
        too_long = display_width(stripped) >= limit
        too_slow = (end - start) >= MAX_CAPTION_SECONDS
        useful_soft_break = ends_soft and (display_width(stripped) >= limit * 0.72 or pause >= SOFT_PAUSE_SECONDS)
        useful_pause_break = pause >= SENTENCE_PAUSE_SECONDS

        if ends_sentence or too_long or too_slow or useful_soft_break or useful_pause_break or next_word is None:
            close_caption(captions, start, end, stripped)
            current = ""
            start = None
            end = None

    return normalize_caption_timing(captions)


def normalize_caption_timing(captions):
    if not captions:
        return captions
    for index, caption in enumerate(captions):
        next_start = captions[index + 1]["start"] if index + 1 < len(captions) else None
        desired_end = max(caption["end"], caption["start"] + MIN_CAPTION_SECONDS)
        if next_start is not None:
            desired_end = min(desired_end, max(caption["start"] + 0.18, next_start - 0.01))
        caption["end"] = desired_end

    for index in range(1, len(captions)):
        previous = captions[index - 1]
        current = captions[index]
        if previous["end"] > current["start"]:
            previous["end"] = max(previous["start"] + 0.18, current["start"] - 0.01)
    return captions


def srt_time(seconds):
    seconds = max(0.0, seconds)
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    whole_seconds = int(seconds % 60)
    milliseconds = int(round((seconds - int(seconds)) * 1000))
    if milliseconds == 1000:
        whole_seconds += 1
        milliseconds = 0
    return f"{hours:02d}:{minutes:02d}:{whole_seconds:02d},{milliseconds:03d}"


def ass_time(seconds):
    seconds = max(0.0, seconds)
    centiseconds = int(round(seconds * 100))
    hours = centiseconds // 360000
    centiseconds %= 360000
    minutes = centiseconds // 6000
    centiseconds %= 6000
    whole_seconds = centiseconds // 100
    centiseconds %= 100
    return f"{hours}:{minutes:02d}:{whole_seconds:02d}.{centiseconds:02d}"


def ass_escape(text):
    text = text.replace("\\", "\\\\")
    text = text.replace("{", "｛").replace("}", "｝")
    return text.replace("\n", " ").replace("\r", " ")


def write_srt(captions, output_path):
    blocks = []
    for index, caption in enumerate(captions, start=1):
        blocks.append(
            f"{index}\n{srt_time(caption['start'])} --> {srt_time(caption['end'])}\n{caption['text']}"
        )
    output_path.write_text("\n\n".join(blocks) + "\n", encoding="utf-8")


def write_ass(captions, output_path, width, height):
    font_size = base_font_size(height)
    margin_v = max(34, round(height * 0.075))
    outline = max(2, round(height * 0.0045))
    shadow = max(0, round(height * 0.0015))
    header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {width}
PlayResY: {height}
WrapStyle: 2
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default, PingFang TC, {font_size}, &H00FFFFFF, &H000000FF, &H00000000, &H7A000000, -1, 0, 0, 0, 100, 100, 0, 0, 1, {outline}, {shadow}, 2, 40, 40, {margin_v}, 1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    lines = [header]
    for caption in captions:
        text = ass_escape(caption["text"])
        lines.append(f"Dialogue: 0,{ass_time(caption['start'])},{ass_time(caption['end'])},Default,,0,0,0,,{text}\n")
    output_path.write_text("".join(lines), encoding="utf-8")


def ass_filter_arg(path):
    # Use a temp copy with a simple path when possible, but keep this robust for direct paths too.
    escaped = str(path).replace("\\", "\\\\").replace("'", r"\'").replace(":", r"\:")
    return f"ass=filename='{escaped}'"


def burn_video(input_path, ass_path, output_path):
    with tempfile.TemporaryDirectory(prefix="single-line-ass-") as temporary_dir:
        temporary_ass = Path(temporary_dir) / "subtitles.ass"
        temporary_ass.write_text(ass_path.read_text(encoding="utf-8"), encoding="utf-8")
        run(
            [
                ffmpeg_path(),
                "-hide_banner",
                "-loglevel",
                "error",
                "-y",
                "-i",
                str(input_path),
                "-vf",
                ass_filter_arg(temporary_ass),
                "-c:v",
                "libx264",
                "-preset",
                "medium",
                "-crf",
                "18",
                "-c:a",
                "copy",
                "-movflags",
                "+faststart",
                str(output_path),
            ]
        )


def main():
    parser = argparse.ArgumentParser(description="Create and burn single-line subtitles into a video.")
    parser.add_argument("input", help="Input video path")
    parser.add_argument("--language", choices=["auto", "zh", "en", "ja", "ko"], default="auto")
    parser.add_argument("--context", default="")
    parser.add_argument("--model-dir", required=True)
    parser.add_argument("--output-video", required=True)
    parser.add_argument("--output-ass", required=True)
    parser.add_argument("--output-srt", required=True)
    parser.add_argument("--summary", required=True)
    args = parser.parse_args()

    input_path = Path(args.input).expanduser().resolve()
    if not input_path.is_file():
        raise FileNotFoundError(f"Input video not found: {input_path}")

    output_video = unique_path(Path(args.output_video).expanduser().resolve())
    output_ass = unique_path(Path(args.output_ass).expanduser().resolve())
    output_srt = unique_path(Path(args.output_srt).expanduser().resolve())
    summary_path = unique_path(Path(args.summary).expanduser().resolve())
    for path in [output_video, output_ass, output_srt, summary_path]:
        path.parent.mkdir(parents=True, exist_ok=True)

    width, height, duration = probe_video(input_path)
    converter = OpenCC("s2twp")
    with tempfile.TemporaryDirectory(prefix="single-line-subtitles-") as temporary_dir:
        wav_path = Path(temporary_dir) / "audio.wav"
        extract_audio(input_path, wav_path)
        audio = read_pcm16_wav(wav_path)
        model = whisper.load_model("small", device="cpu", download_root=args.model_dir)
        prompt = args.context.strip() or None
        result = model.transcribe(
            audio,
            language=None if args.language == "auto" else args.language,
            task="transcribe",
            fp16=False,
            initial_prompt=prompt,
            condition_on_previous_text=True,
            word_timestamps=True,
            verbose=None,
        )

    language = result.get("language", args.language)
    words = words_from_result(result, language, converter)
    captions = build_captions(words, language, width, height)
    if not captions:
        raise RuntimeError("No captions were created from the transcription.")
    if any("\n" in caption["text"] or "\\N" in caption["text"] for caption in captions):
        raise RuntimeError("A caption contains a newline, which violates the single-line requirement.")
    if any(captions[index]["end"] > captions[index + 1]["start"] for index in range(len(captions) - 1)):
        raise RuntimeError("Subtitle timing overlaps detected.")

    write_srt(captions, output_srt)
    write_ass(captions, output_ass, width, height)
    burn_video(input_path, output_ass, output_video)

    summary = {
        "input": str(input_path),
        "output_video": str(output_video),
        "output_ass": str(output_ass),
        "output_srt": str(output_srt),
        "width": width,
        "height": height,
        "duration_seconds": duration,
        "language": language,
        "caption_count": len(captions),
        "max_caption_display_width": max(display_width(caption["text"]) for caption in captions),
        "line_breaks": 0,
        "overlaps": 0,
        "wrap_style": 2,
    }
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False))


if __name__ == "__main__":
    main()

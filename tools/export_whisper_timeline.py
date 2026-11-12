#!/usr/bin/env python3
import argparse
import json
import re
import subprocess
import tempfile
import wave
from pathlib import Path

import imageio_ffmpeg
import numpy as np
import whisper
from opencc import OpenCC


def ffmpeg_path():
    return imageio_ffmpeg.get_ffmpeg_exe()


def run(command):
    completed = subprocess.run(command, capture_output=True, text=True)
    if completed.returncode != 0:
        raise RuntimeError((completed.stderr or completed.stdout or "").strip())
    return completed


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
        samples = np.frombuffer(audio_file.readframes(audio_file.getnframes()), dtype=np.int16)
    return samples.astype(np.float32) / 32768.0


def normalize_text(text, language, converter):
    text = re.sub(r"\s+", " ", text).strip()
    if language == "zh":
        text = converter.convert(text)
        text = text.translate(str.maketrans({",": "，", "?": "？", "!": "！", ";": "；", ":": "："}))
        if text.endswith("."):
            text = text[:-1] + "。"
        text = text.replace(" ", "")
    return text


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input")
    parser.add_argument("--model-dir", required=True)
    parser.add_argument("--language", choices=["auto", "zh", "en", "ja", "ko"], default="auto")
    parser.add_argument("--context", default="")
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    input_path = Path(args.input).expanduser().resolve()
    output_path = Path(args.output).expanduser().resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    converter = OpenCC("s2twp")

    with tempfile.TemporaryDirectory(prefix="whisper-timeline-") as temporary_dir:
        wav_path = Path(temporary_dir) / "audio.wav"
        extract_audio(input_path, wav_path)
        audio = read_pcm16_wav(wav_path)
        model = whisper.load_model("small", device="cpu", download_root=args.model_dir)
        result = model.transcribe(
            audio,
            language=None if args.language == "auto" else args.language,
            task="transcribe",
            fp16=False,
            initial_prompt=args.context.strip() or None,
            condition_on_previous_text=True,
            word_timestamps=True,
            verbose=None,
        )

    language = result.get("language", args.language)
    normalized_segments = []
    for segment in result.get("segments") or []:
        words = []
        for word in segment.get("words") or []:
            text = normalize_text(word.get("word", ""), language, converter)
            if text:
                words.append(
                    {
                        "start": float(word.get("start", segment.get("start", 0))),
                        "end": float(word.get("end", segment.get("end", 0))),
                        "text": text,
                    }
                )
        normalized_segments.append(
            {
                "start": float(segment.get("start", 0)),
                "end": float(segment.get("end", 0)),
                "text": normalize_text(segment.get("text", ""), language, converter),
                "avg_logprob": segment.get("avg_logprob"),
                "no_speech_prob": segment.get("no_speech_prob"),
                "words": words,
            }
        )

    output = {
        "language": language,
        "text": normalize_text(result.get("text", ""), language, converter),
        "segments": normalized_segments,
    }
    output_path.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"output": str(output_path), "segments": len(normalized_segments)}, ensure_ascii=False))


if __name__ == "__main__":
    main()

import argparse
import json
from pathlib import Path

import whisper
from opencc import OpenCC


def main():
    parser = argparse.ArgumentParser(description="Transcribe audio locally with Whisper.")
    parser.add_argument("--model", default="small")
    parser.add_argument("--model-dir", required=True)
    parser.add_argument("--language", default="auto")
    parser.add_argument("--context", default="")
    parser.add_argument("--output", required=True)
    parser.add_argument("audio", nargs="+")
    args = parser.parse_args()

    model = whisper.load_model(args.model, device="cpu", download_root=args.model_dir)
    converter = OpenCC("s2twp")
    parts = []
    detected_languages = []
    previous_tail = ""

    for audio_path in args.audio:
        prompt_parts = [part for part in [args.context.strip(), previous_tail] if part]
        result = model.transcribe(
            audio_path,
            language=None if args.language == "auto" else args.language,
            task="transcribe",
            fp16=False,
            initial_prompt=" ".join(prompt_parts) or None,
            condition_on_previous_text=True,
            verbose=None,
        )

        text = result.get("text", "").strip()
        detected_language = result.get("language", args.language)
        if detected_language == "zh":
            text = converter.convert(text)
            text = text.translate(str.maketrans({",": "，", "?": "？", "!": "！", ";": "；"}))

        if text:
            parts.append(text)
            previous_tail = text[-200:]
        detected_languages.append(detected_language)

    output = {
        "parts": parts,
        "detectedLanguages": detected_languages,
    }
    Path(args.output).write_text(json.dumps(output, ensure_ascii=False), encoding="utf-8")


if __name__ == "__main__":
    main()

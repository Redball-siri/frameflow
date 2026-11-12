import argparse
from pathlib import Path

import whisper


def main():
    parser = argparse.ArgumentParser(description="Download a Whisper model for offline use.")
    parser.add_argument("--model", default="small")
    parser.add_argument("--model-dir", required=True)
    args = parser.parse_args()

    model_dir = Path(args.model_dir).resolve()
    model_dir.mkdir(parents=True, exist_ok=True)
    whisper.load_model(args.model, download_root=str(model_dir))
    print(f"Whisper model ready: {model_dir / (args.model + '.pt')}")


if __name__ == "__main__":
    main()

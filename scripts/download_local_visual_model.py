import argparse
import json
from pathlib import Path

from huggingface_hub import snapshot_download


def main():
    parser = argparse.ArgumentParser(description="下載本機 B-roll 圖片生成模型。")
    parser.add_argument("--model-root", required=True)
    args = parser.parse_args()

    root = Path(args.model_root).expanduser().resolve()
    root.mkdir(parents=True, exist_ok=True)
    base_dir = root / "stable-diffusion-v1-5"
    lora_dir = root / "lcm-lora-sdv1-5"
    motion_dir = root / "animatelcm-sd15"
    realism_dir = root / "epic-realism"

    common_patterns = [
        "*.json", "*.txt", "*.model", "*.md", "*.fp16.safetensors",
        "merges.txt", "vocab.json", "LICENSE*"
    ]
    snapshot_download(
        repo_id="stable-diffusion-v1-5/stable-diffusion-v1-5",
        local_dir=str(base_dir),
        allow_patterns=common_patterns,
    )
    snapshot_download(
        repo_id="latent-consistency/lcm-lora-sdv1-5",
        local_dir=str(lora_dir),
        allow_patterns=["*.json", "*.safetensors", "*.md", "LICENSE*"],
    )
    snapshot_download(
        repo_id="wangfuyun/AnimateLCM",
        local_dir=str(motion_dir),
        allow_patterns=[
            "README.md",
            "config.json",
            "diffusion_pytorch_model.fp16.safetensors",
            "AnimateLCM_sd15_t2v_lora.safetensors",
        ],
    )
    snapshot_download(
        repo_id="emilianJR/epiCRealism",
        local_dir=str(realism_dir),
        allow_patterns=[
            "README.md",
            "model_index.json",
            "feature_extractor/*.json",
            "scheduler/*.json",
            "text_encoder/*.json",
            "text_encoder/model.safetensors",
            "tokenizer/*",
            "unet/*.json",
            "unet/diffusion_pytorch_model.safetensors",
            "vae/*.json",
            "vae/diffusion_pytorch_model.safetensors",
        ],
    )

    print(json.dumps({"base": str(base_dir), "lora": str(lora_dir), "motion": str(motion_dir), "realism": str(realism_dir)}, ensure_ascii=False))


if __name__ == "__main__":
    main()

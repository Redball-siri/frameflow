import argparse
import json
import os
from pathlib import Path

os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")
os.environ.setdefault("PYTORCH_ENABLE_MPS_FALLBACK", "1")

import torch
import cv2
import numpy as np
from diffusers import DiffusionPipeline, LCMScheduler
from PIL import Image


DEFAULT_NEGATIVE_PROMPT = (
    "blank paper, empty room, empty office, empty stage, generic scenery, readable text, "
    "letters, words, subtitles, watermark, logo, brand mark, blurry, low quality, low detail, "
    "distorted hands, deformed hands, extra fingers, distorted face, bad anatomy, duplicate people, "
    "celebrity, horror, gore, graphic injury"
)


def normalized_dimension(value):
    return max(256, int(value) // 8 * 8)


def choose_device():
    if torch.backends.mps.is_available():
        return "mps", torch.float16
    if torch.cuda.is_available():
        return "cuda", torch.float16
    return "cpu", torch.float32


def existing_model_dir(model_root, preferred):
    candidates = []
    if preferred:
        candidates.append(model_root / preferred)
    candidates.extend([
        model_root / "epic-realism",
        model_root / "stable-diffusion-v1-5"
    ])
    for candidate in candidates:
        if (candidate / "model_index.json").exists():
            return candidate
    raise FileNotFoundError(
        "找不到可用的本機 B-roll 模型。請執行 npm run setup:visuals 下載模型。"
    )


def load_pipeline(model_dir, lora_dir, device, dtype):
    kwargs = {
        "torch_dtype": dtype,
        "local_files_only": True,
        "low_cpu_mem_usage": True,
        "safety_checker": None,
        "requires_safety_checker": False
    }
    if model_dir.name == "stable-diffusion-v1-5":
        kwargs["variant"] = "fp16"

    pipe = DiffusionPipeline.from_pretrained(str(model_dir), **kwargs)
    pipe.scheduler = LCMScheduler.from_config(pipe.scheduler.config)
    if (lora_dir / "pytorch_lora_weights.safetensors").exists():
        pipe.load_lora_weights(str(lora_dir))
    pipe.enable_attention_slicing()
    pipe.enable_vae_slicing()
    pipe.set_progress_bar_config(disable=True)
    pipe.to(device)
    return pipe


def save_rgb(image, output_path, width, height):
    image = image.convert("RGB")
    if image.size != (width, height):
        image = image.resize((width, height), Image.Resampling.LANCZOS)
    image.save(output_path, quality=94, optimize=True)


def average_hash(image):
    gray = image.convert("L").resize((8, 8), Image.Resampling.LANCZOS)
    pixels = list(gray.getdata())
    mean = sum(pixels) / max(1, len(pixels))
    return [1 if value >= mean else 0 for value in pixels]


def hash_distance(left, right):
    return sum(1 for a, b in zip(left, right) if a != b)


def average_rgb(image):
    small = np.asarray(image.convert("RGB").resize((16, 16), Image.Resampling.BOX), dtype=np.float32)
    return tuple(float(value) for value in small.mean(axis=(0, 1)))


def rgb_distance(left, right):
    return float(sum((a - b) ** 2 for a, b in zip(left, right)) ** 0.5)


def visual_quality(image):
    rgb = np.asarray(image.convert("RGB"))
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    cascade = cv2.CascadeClassifier(cascade_path)
    faces = cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(42, 42))
    ycrcb = cv2.cvtColor(bgr, cv2.COLOR_BGR2YCrCb)
    skin = cv2.inRange(ycrcb, np.array([0, 133, 77], dtype=np.uint8), np.array([255, 173, 127], dtype=np.uint8))
    skin_ratio = float(np.count_nonzero(skin)) / max(1, skin.size)
    return {
        "visibleFaceCount": int(len(faces)),
        "skinRatio": round(skin_ratio, 4),
        "anonymousPeoplePassed": len(faces) == 0,
        "modestyHeuristicPassed": skin_ratio <= 0.24,
    }


def visually_repeated(image, accepted):
    candidate_hash = average_hash(image)
    candidate_rgb = average_rgb(image)
    for previous in accepted:
        hamming = hash_distance(candidate_hash, previous["hash"])
        color = rgb_distance(candidate_rgb, previous["rgb"])
        if hamming <= 8 and color <= 36:
            return True, {"withId": previous["id"], "hashDistance": hamming, "rgbDistance": round(color, 2)}
    return False, None


def main():
    parser = argparse.ArgumentParser(description="使用本機 Stable Diffusion/LCM 產生品質優先 B-roll 關鍵畫面。")
    parser.add_argument("--input", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--model-root", required=True)
    parser.add_argument("--steps", type=int, default=8)
    parser.add_argument("--width", type=int, default=768)
    parser.add_argument("--height", type=int, default=432)
    parser.add_argument("--output-width", type=int, default=1920)
    parser.add_argument("--output-height", type=int, default=1080)
    parser.add_argument("--base-model", default="epic-realism")
    parser.add_argument("--seed", type=int, default=2400)
    args = parser.parse_args()

    model_root = Path(args.model_root).expanduser().resolve()
    output_dir = Path(args.output_dir).expanduser().resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    items = json.loads(Path(args.input).read_text(encoding="utf-8"))
    if not isinstance(items, list) or not items:
        raise ValueError("沒有可生成的 B-roll prompt。")

    torch.set_num_threads(max(1, min(8, os.cpu_count() or 1)))
    device, dtype = choose_device()
    model_dir = existing_model_dir(model_root, args.base_model)
    lora_dir = model_root / "lcm-lora-sdv1-5"
    pipe = load_pipeline(model_dir, lora_dir, device, dtype)

    width = normalized_dimension(args.width)
    height = normalized_dimension(args.height)
    output_width = normalized_dimension(args.output_width)
    output_height = normalized_dimension(args.output_height)
    steps = max(4, int(args.steps))
    generated = []
    skipped = []
    accepted_visuals = []

    for item in items:
        item_id = int(item["id"])
        filename = f"ai-broll-{item_id:02d}.jpg"
        output_path = output_dir / filename
        generator_device = "cpu" if device == "mps" else device
        image = None
        quality = None
        duplicate_warning = None
        generation_errors = []
        reused_existing = False
        if output_path.exists() and item.get("reuse_existing") is True:
            try:
                candidate = Image.open(output_path).convert("RGB")
                quality = visual_quality(candidate)
                repeated, duplicate_warning = visually_repeated(candidate, accepted_visuals)
                if quality["anonymousPeoplePassed"] and quality["modestyHeuristicPassed"] and not repeated:
                    image = candidate
                    reused_existing = True
                    quality["attempts"] = 0
                    quality["reusedExisting"] = True
                    quality["duplicateCheckPassed"] = True
            except (OSError, ValueError):
                image = None

        for attempt in range(4 if image is None else 0):
            generator = torch.Generator(device=generator_device).manual_seed(args.seed + item_id * 97 + attempt * 1009)
            retry_direction = "" if attempt == 0 else (
                ", alternate camera position and clearly different composition, people only from behind or cropped to hands, "
                "no visible face, modest long-sleeve clothing, no exposed torso"
            )
            try:
                result = pipe(
                    prompt=item["prompt"] + retry_direction,
                    negative_prompt=(item.get("negative_prompt") or DEFAULT_NEGATIVE_PROMPT)
                    + ", visible face, portrait, exposed torso, bare shoulders, revealing clothes",
                    width=width,
                    height=height,
                    num_inference_steps=steps,
                    guidance_scale=1.15,
                    generator=generator,
                )
            except Exception as error:
                generation_errors.append(f"{type(error).__name__}: {str(error).splitlines()[0][:160]}")
                continue
            candidate = result.images[0]
            if candidate is None:
                continue
            quality = visual_quality(candidate)
            repeated, duplicate_warning = visually_repeated(candidate, accepted_visuals)
            if quality["anonymousPeoplePassed"] and quality["modestyHeuristicPassed"] and not repeated:
                image = candidate
                quality["attempts"] = attempt + 1
                quality["duplicateCheckPassed"] = True
                break
        if image is None:
            reason = []
            if quality and not quality["anonymousPeoplePassed"]:
                reason.append("偵測到可辨識正臉")
            if quality and not quality["modestyHeuristicPassed"]:
                reason.append("人物裸露比例過高")
            if duplicate_warning:
                reason.append(f"與 B-roll #{duplicate_warning['withId']} 過度相似")
            if generation_errors:
                reason.append(f"本機生成錯誤（{generation_errors[-1]}）")
            skipped.append({
                "id": item_id,
                "title": item.get("title") or f"B-roll {item_id}",
                "reason": "、".join(reason) or "畫面品質不合格",
                "attempts": 4
            })
            continue

        if not reused_existing:
            save_rgb(image, output_path, output_width, output_height)
        accepted_visuals.append({
            "id": item_id,
            "hash": average_hash(image),
            "rgb": average_rgb(image)
        })
        generated.append({
            "id": item_id,
            "filename": filename,
            "path": str(output_path),
            "keyframePath": str(output_path),
            "firstFramePath": str(output_path),
            "frameCount": 1,
            "mode": "stable-diffusion-lcm-keyframe",
            "model": model_dir.name,
            "device": device,
            "width": output_width,
            "height": output_height,
            "reusedExisting": reused_existing,
            "qualityGate": quality
        })

    print(json.dumps({
        "generated": generated,
        "skipped": skipped,
        "device": device,
        "model": model_dir.name,
        "mode": "stable-diffusion-lcm-keyframe",
        "quality": "quality-first"
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()

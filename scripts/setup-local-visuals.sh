#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VENV_DIR="$PROJECT_ROOT/.visual-venv"
PYTHON_BIN="$VENV_DIR/bin/python"

if [ ! -x "$PYTHON_BIN" ]; then
  python3 -m venv "$VENV_DIR"
fi

"$PYTHON_BIN" -m pip install --upgrade pip setuptools wheel
"$PYTHON_BIN" -m pip install -r "$PROJECT_ROOT/requirements-visuals.txt"

MODEL_ROOT="$PROJECT_ROOT/models/local-broll"
if [ ! -f "$MODEL_ROOT/epic-realism/model_index.json" ] || [ ! -f "$MODEL_ROOT/lcm-lora-sdv1-5/pytorch_lora_weights.safetensors" ]; then
  "$PYTHON_BIN" "$PROJECT_ROOT/scripts/download_local_visual_model.py" --model-root "$MODEL_ROOT"
fi

echo "品質優先本機 B-roll 模型已設定完成。"

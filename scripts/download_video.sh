#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
用法：
  ./scripts/download_video.sh [選項] "影片網址"

選項：
  -f, --format mp4|mp3   下載格式（預設：mp4）
  -o, --output DIR       輸出資料夾（預設：~/Downloads）
  -n, --name NAME        自訂檔名，不含副檔名
  -h, --help             顯示說明

範例：
  ./scripts/download_video.sh "https://example.com/video"
  ./scripts/download_video.sh -f mp3 "https://example.com/video"
  ./scripts/download_video.sh -o ./outputs -n my-video "https://example.com/video"
EOF
}

format="mp4"
output_dir="${HOME}/Downloads"
custom_name=""
url=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    -f|--format)
      [[ $# -ge 2 ]] || { echo "錯誤：--format 缺少值" >&2; exit 2; }
      format="$2"
      shift 2
      ;;
    -o|--output)
      [[ $# -ge 2 ]] || { echo "錯誤：--output 缺少路徑" >&2; exit 2; }
      output_dir="$2"
      shift 2
      ;;
    -n|--name)
      [[ $# -ge 2 ]] || { echo "錯誤：--name 缺少檔名" >&2; exit 2; }
      custom_name="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    -*)
      echo "錯誤：未知選項 $1" >&2
      usage >&2
      exit 2
      ;;
    *)
      [[ -z "$url" ]] || { echo "錯誤：一次只能提供一個網址" >&2; exit 2; }
      url="$1"
      shift
      ;;
  esac
done

[[ -n "$url" ]] || { usage; exit 2; }
[[ "$format" == "mp4" || "$format" == "mp3" ]] || {
  echo "錯誤：格式只能是 mp4 或 mp3" >&2
  exit 2
}

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_dir="$(cd "${script_dir}/.." && pwd)"

if command -v yt-dlp >/dev/null 2>&1; then
  ytdlp="$(command -v yt-dlp)"
elif [[ -x "${project_dir}/.video-download-venv/bin/yt-dlp" ]]; then
  ytdlp="${project_dir}/.video-download-venv/bin/yt-dlp"
elif [[ -x "${project_dir}/.venv/bin/yt-dlp" ]]; then
  ytdlp="${project_dir}/.venv/bin/yt-dlp"
else
  echo "錯誤：尚未安裝 yt-dlp。請先執行：brew install yt-dlp ffmpeg" >&2
  exit 127
fi

if [[ -x "${project_dir}/.video-download-venv/bin/python" ]]; then
  ffmpeg_path="$(${project_dir}/.video-download-venv/bin/python -c 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())' 2>/dev/null || true)"
elif command -v ffmpeg >/dev/null 2>&1; then
  ffmpeg_path="$(command -v ffmpeg)"
elif [[ -x "${project_dir}/.venv/bin/python" ]]; then
  ffmpeg_path="$(${project_dir}/.venv/bin/python -c 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())' 2>/dev/null || true)"
else
  ffmpeg_path=""
fi

if [[ ! -x "$ffmpeg_path" ]]; then
  echo "錯誤：尚未安裝 ffmpeg。請先執行：brew install ffmpeg" >&2
  exit 127
fi

mkdir -p "$output_dir"

if [[ -n "$custom_name" ]]; then
  output_template="${output_dir}/${custom_name}.%(ext)s"
else
  output_template="${output_dir}/%(title)s [%(id)s].%(ext)s"
fi

common_args=(
  --no-playlist
  --windows-filenames
  --newline
  --ffmpeg-location "$ffmpeg_path"
  --output "$output_template"
)

codex_node="/Users/redball/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
if [[ -x "$codex_node" ]]; then
  common_args+=(--js-runtimes "node:${codex_node}" --remote-components "ejs:github")
fi

echo "輸出資料夾：$output_dir"

if [[ "$format" == "mp3" ]]; then
  "$ytdlp" "${common_args[@]}" \
    --extract-audio \
    --audio-format mp3 \
    --audio-quality 0 \
    "$url"
else
  "$ytdlp" "${common_args[@]}" \
    --format "bv*+ba/b" \
    --merge-output-format mp4 \
    --remux-video mp4 \
    "$url"
fi

echo "下載完成。"

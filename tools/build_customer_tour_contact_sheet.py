from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path("/Users/redball/Documents/New project/customer-tour-screenshots")
files = sorted(path for path in root.glob("*.png") if path.name != "00-功能畫面總覽.png")
thumb_w, thumb_h = 560, 315
cell_w, cell_h = 590, 380
columns = 2
rows = (len(files) + columns - 1) // columns
canvas = Image.new("RGB", (columns * cell_w + 40, rows * cell_h + 110), "#0b0b0f")
draw = ImageDraw.Draw(canvas)
font_path = "/System/Library/Fonts/STHeiti Medium.ttc"
title_font = ImageFont.truetype(font_path, 34)
label_font = ImageFont.truetype(font_path, 22)
draw.text((28, 24), "FRAMEFLOW｜顧客功能導覽", fill="#ffffff", font=title_font)
draw.text((28, 67), "不執行高成本生成，以展示資料呈現完整操作流程", fill="#9ca3af", font=label_font)

for index, path in enumerate(files):
    image = Image.open(path).convert("RGB")
    image.thumbnail((thumb_w, thumb_h), Image.Resampling.LANCZOS)
    x = 30 + (index % columns) * cell_w
    y = 110 + (index // columns) * cell_h
    frame = Image.new("RGB", (thumb_w, thumb_h), "#111217")
    frame.paste(image, ((thumb_w - image.width) // 2, (thumb_h - image.height) // 2))
    canvas.paste(frame, (x, y))
    label = path.stem.replace("-", " ", 1)
    draw.text((x, y + thumb_h + 13), label, fill="#ffffff", font=label_font)

output = root / "00-功能畫面總覽.png"
canvas.save(output, quality=95)
print(output)

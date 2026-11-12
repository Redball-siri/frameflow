import argparse
import json
import math
import random
from pathlib import Path

from PIL import Image, ImageDraw


def clamp(value, low=0, high=255):
    return int(max(low, min(high, value)))


def mix(left, right, amount):
    return tuple(clamp(left[index] + (right[index] - left[index]) * amount) for index in range(3))


def ease(amount):
    return 0.5 - 0.5 * math.cos(max(0, min(1, amount)) * math.pi)


def make_gradient(width, height, top, bottom):
    image = Image.new("RGB", (width, height), top)
    draw = ImageDraw.Draw(image)
    for y in range(height):
        draw.line([(0, y), (width, y)], fill=mix(top, bottom, y / max(1, height - 1)))
    return image


def overlay(base, draw_fn):
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw_fn(ImageDraw.Draw(layer, "RGBA"))
    base.alpha_composite(layer)


def draw_polyline(draw, points, fill, width=3):
    if len(points) > 1:
        draw.line(points, fill=fill, width=width, joint="curve")


def scene_text(item):
    pieces = [
        item.get("visualConcept", ""),
        item.get("title", ""),
        item.get("prompt", ""),
        " ".join(item.get("searchTerms", []) or []),
    ]
    return " ".join(str(piece) for piece in pieces).lower()


def detect_scene(item):
    text = scene_text(item)
    rules = [
        ("sakura", ["櫻花", "sakura", "cherry blossom"]),
        ("coffee", ["咖啡", "coffee"]),
        ("mountain", ["山", "mountain", "ridgeline"]),
        ("water", ["湖", "海", "ocean", "beach", "lake", "shoreline", "waves"]),
        ("forest", ["森林", "樹林", "forest", "leaves"]),
        ("city", ["城市", "街道", "都市", "city", "street", "architecture"]),
        ("train", ["列車", "火車", "捷運", "train"]),
        ("road", ["汽車", "開車", "道路", "公路", "car", "driving", "road"]),
        ("food", ["料理", "食物", "美食", "餐廳", "food", "restaurant", "meal"]),
        ("phone", ["手機", "電話", "社群", "phone", "mobile", "app"]),
        ("office", ["辦公室", "會議", "商務", "團隊", "office", "meeting", "business", "team"]),
        ("finance", ["金錢", "財務", "投資", "收入", "預算", "finance", "money", "market"]),
        ("learning", ["學習", "教育", "學生", "課程", "教學", "school", "education", "learning"]),
        ("sports", ["運動", "健身", "跑步", "sport", "fitness"]),
        ("health", ["健康", "醫療", "醫院", "照護", "health", "medical"]),
        ("product", ["產品", "商品", "product"]),
        ("video", ["影片", "拍攝", "剪輯", "camera", "filming", "editing", "video"]),
        ("digital", ["電腦", "軟體", "系統", "工具", "computer", "software", "laptop"]),
    ]
    for scene, needles in rules:
        if any(needle in text for needle in needles):
            return scene
    return "generic"


def seeded_particles(seed, count):
    rng = random.Random(seed)
    return [
        {
            "x": rng.random(),
            "y": rng.random(),
            "size": rng.uniform(0.5, 1.6),
            "speed": rng.uniform(0.35, 1.2),
            "phase": rng.random() * math.tau,
            "color": rng.random(),
        }
        for _ in range(count)
    ]


def draw_light_grain(draw, width, height, progress, seed, count=60):
    rng = random.Random(seed)
    for index in range(count):
        x = int((rng.random() * width + progress * width * rng.uniform(-0.03, 0.03)) % width)
        y = int((rng.random() * height + math.sin(progress * math.tau + index) * 2) % height)
        alpha = rng.randint(10, 28)
        draw.point((x, y), fill=(255, 255, 255, alpha))


def draw_marked_paper(draw, box, seed, progress=0, fill=(248, 244, 226, 245), accent=(75, 92, 108, 120)):
    x0, y0, x1, y1 = box
    draw.rectangle((x0, y0, x1, y1), fill=fill, outline=(205, 196, 176, 190), width=2)
    rng = random.Random(seed)
    width = x1 - x0
    height = y1 - y0
    for line in range(6):
        y = y0 + height * (0.18 + line * 0.105)
        jitter = math.sin(progress * math.tau + line) * width * 0.012
        draw.line((x0 + width * 0.12 + jitter, y, x1 - width * rng.uniform(0.16, 0.34), y), fill=accent, width=2)
    for index in range(3):
        cx = x0 + width * rng.uniform(0.24, 0.74)
        cy = y0 + height * rng.uniform(0.30, 0.76)
        radius = width * rng.uniform(0.045, 0.08)
        draw.rectangle((cx - radius, cy - radius, cx + radius, cy + radius), outline=(218, 121, 72, 150), width=2)
    points = []
    for step in range(7):
        t = step / 6
        points.append((x0 + width * (0.18 + t * 0.60), y0 + height * (0.78 - 0.22 * math.sin(t * math.pi + progress))))
    draw_polyline(draw, points, (65, 110, 135, 145), width=3)


def draw_hand(draw, cx, cy, scale=1.0, angle=0.0, color=(206, 154, 114, 230)):
    palm_w = 42 * scale
    palm_h = 24 * scale
    draw.ellipse((cx - palm_w, cy - palm_h, cx + palm_w, cy + palm_h), fill=color)
    for finger in range(4):
        fx = cx + (finger - 1.5) * 13 * scale + math.sin(angle + finger) * 2
        draw.rounded_rectangle((fx - 4 * scale, cy - 27 * scale, fx + 5 * scale, cy + 8 * scale), radius=max(2, int(4 * scale)), fill=color)


def draw_seated_person(draw, width, height, progress):
    center = width * (0.50 + 0.015 * math.sin(progress * math.tau))
    head_y = height * 0.25
    draw.ellipse((center - width * 0.055, head_y - height * 0.075, center + width * 0.055, head_y + height * 0.075), fill=(88, 64, 54, 235))
    draw.polygon([
        (center - width * 0.16, height * 0.58),
        (center + width * 0.16, height * 0.58),
        (center + width * 0.10, height * 0.34),
        (center - width * 0.10, height * 0.34),
    ], fill=(54, 67, 82, 235))
    draw.line((center - width * 0.12, height * 0.48, center - width * 0.26, height * 0.68), fill=(70, 83, 98, 230), width=max(10, width // 54))
    draw.line((center + width * 0.12, height * 0.48, center + width * 0.25, height * 0.68), fill=(70, 83, 98, 230), width=max(10, width // 54))


def draw_sticky_notes(draw, width, height, progress, seed):
    rng = random.Random(seed)
    colors = [(247, 204, 85, 230), (146, 197, 168, 225), (238, 144, 111, 220)]
    for index in range(5):
        x = width * rng.uniform(0.08, 0.86)
        y = height * rng.uniform(0.12, 0.43)
        size = width * rng.uniform(0.045, 0.07)
        bob = math.sin(progress * math.tau + index) * height * 0.004
        draw.rectangle((x, y + bob, x + size, y + size * 0.72 + bob), fill=colors[index % len(colors)])
        draw.line((x + size * 0.16, y + size * 0.28 + bob, x + size * 0.82, y + size * 0.28 + bob), fill=(78, 88, 92, 80), width=2)
        draw.line((x + size * 0.16, y + size * 0.48 + bob, x + size * 0.62, y + size * 0.48 + bob), fill=(78, 88, 92, 70), width=2)


def scene_sakura(width, height, progress, item_id):
    image = make_gradient(width, height, (178, 214, 233), (255, 229, 215)).convert("RGBA")
    draw = ImageDraw.Draw(image, "RGBA")
    draw.ellipse((width * 0.72, height * 0.08, width * 0.93, height * 0.42), fill=(255, 221, 164, 95))
    draw.rectangle((0, height * 0.72, width, height), fill=(116, 151, 104, 255))
    draw.rectangle((0, height * 0.78, width, height), fill=(90, 121, 89, 210))

    sway = math.sin(progress * math.tau) * 8
    branch = [
        (width * -0.04, height * 0.34 + sway),
        (width * 0.18, height * 0.28 + sway * 0.8),
        (width * 0.42, height * 0.20 + sway * 0.4),
        (width * 0.73, height * 0.14 - sway * 0.2),
    ]
    draw_polyline(draw, branch, (74, 44, 35, 255), width=max(6, width // 80))
    for offset in [0.0, 0.13, 0.28, 0.44]:
        x = width * (0.14 + offset)
        y = height * (0.29 - offset * 0.22) + sway
        draw_polyline(draw, [(x, y), (x + width * 0.12, y + height * (0.10 + offset * 0.08))], (85, 52, 42, 235), width=max(3, width // 160))

    rng = random.Random(1300 + item_id)
    blossoms = [(rng.uniform(0.05, 0.82), rng.uniform(0.10, 0.48), rng.uniform(3, 9)) for _ in range(90)]
    for bx, by, size in blossoms:
        x = bx * width + math.sin(progress * math.tau + bx * 8) * 4
        y = by * height + math.cos(progress * math.tau + by * 6) * 2
        color = (255, rng.randint(178, 218), rng.randint(205, 232), rng.randint(150, 235))
        draw.ellipse((x - size, y - size * 0.72, x + size, y + size * 0.72), fill=color)

    petals = seeded_particles(2100 + item_id, 38)
    for petal in petals:
        x = (petal["x"] * width + progress * width * 0.28 * petal["speed"] + math.sin(progress * 10 + petal["phase"]) * 28) % width
        y = (petal["y"] * height + progress * height * 0.42 * petal["speed"]) % height
        size = petal["size"] * 4
        draw.ellipse((x - size, y - size * 0.55, x + size, y + size * 0.55), fill=(255, 195, 218, 185))
    person_x = width * (0.18 + 0.03 * math.sin(progress * math.tau))
    draw.ellipse((person_x - 10, height * 0.66, person_x + 10, height * 0.71), fill=(47, 54, 62, 210))
    draw.rectangle((person_x - 8, height * 0.71, person_x + 8, height * 0.80), fill=(50, 63, 72, 215))
    draw.rectangle((person_x + 13, height * 0.72, person_x + 40, height * 0.76), fill=(38, 44, 50, 190))
    return image


def scene_coffee(width, height, progress, item_id):
    image = make_gradient(width, height, (244, 209, 160), (99, 63, 45)).convert("RGBA")
    draw = ImageDraw.Draw(image, "RGBA")
    draw.rectangle((0, height * 0.58, width, height), fill=(116, 73, 49, 255))
    draw.rectangle((width * 0.08, height * 0.08, width * 0.48, height * 0.48), fill=(255, 230, 178, 85), outline=(255, 245, 212, 130), width=3)
    for x in [0.14, 0.25, 0.36]:
        draw.line((width * x, height * 0.09, width * x, height * 0.47), fill=(255, 245, 212, 80), width=2)
    draw.ellipse((width * 0.28, height * 0.60, width * 0.74, height * 0.82), fill=(230, 203, 174, 255))
    draw.ellipse((width * 0.32, height * 0.46, width * 0.68, height * 0.71), fill=(245, 239, 224, 255))
    draw.ellipse((width * 0.36, height * 0.49, width * 0.64, height * 0.66), fill=(74, 43, 26, 255))
    shimmer = int((math.sin(progress * math.tau) + 1) * 28)
    draw.ellipse((width * 0.42, height * 0.51, width * 0.57, height * 0.60), fill=(133 + shimmer, 84 + shimmer // 2, 42, 95))
    draw.arc((width * 0.61, height * 0.52, width * 0.80, height * 0.72), -62, 88, fill=(245, 239, 224, 235), width=max(5, width // 80))

    for line in range(4):
        points = []
        base_x = width * (0.40 + line * 0.065)
        for step in range(22):
            t = step / 21
            x = base_x + math.sin(t * 7 + progress * math.tau * 1.8 + line) * width * 0.025
            y = height * (0.47 - t * 0.30) - progress * height * 0.035
            points.append((x, y))
        draw_polyline(draw, points, (255, 255, 255, clamp(160 - line * 24)), width=max(2, width // 200))

    rng = random.Random(3200 + item_id)
    for _ in range(18):
        x = rng.uniform(width * 0.06, width * 0.92)
        y = rng.uniform(height * 0.75, height * 0.94)
        size = rng.uniform(4, 8)
        draw.ellipse((x - size, y - size * 0.7, x + size, y + size * 0.7), fill=(73, 43, 28, 210))
    return image


def scene_mountain(width, height, progress, item_id):
    image = make_gradient(width, height, (226, 172, 136), (146, 185, 207)).convert("RGBA")
    draw = ImageDraw.Draw(image, "RGBA")
    sun_x = width * (0.18 + 0.05 * math.sin(progress * math.tau))
    draw.ellipse((sun_x - 42, height * 0.17 - 42, sun_x + 42, height * 0.17 + 42), fill=(255, 219, 139, 155))
    layers = [
        (0.48, (83, 104, 127, 255)),
        (0.58, (64, 86, 113, 255)),
        (0.70, (45, 68, 91, 255)),
        (0.84, (33, 51, 69, 255)),
    ]
    for layer_index, (base, color) in enumerate(layers):
        points = [(0, height)]
        for step in range(8):
            x = width * step / 7
            y = height * (base + 0.08 * math.sin(step * 1.2 + layer_index + progress * 0.7))
            points.append((x, y))
        points.append((width, height))
        draw.polygon(points, fill=color)
    for band in range(4):
        y = height * (0.46 + band * 0.09 + math.sin(progress * math.tau + band) * 0.006)
        offset = (progress * width * (0.08 + band * 0.02)) % width
        for repeat in [-1, 0, 1]:
            x0 = -width * 0.30 + offset + repeat * width
            draw.ellipse((x0, y - 16, x0 + width * 0.92, y + 18), fill=(255, 255, 255, 42 - band * 4))
    draw.ellipse((width * 0.16, height * 0.72, width * 0.20, height * 0.78), fill=(34, 43, 48, 235))
    draw.rectangle((width * 0.17, height * 0.77, width * 0.19, height * 0.88), fill=(34, 43, 48, 235))
    draw.ellipse((width * 0.20, height * 0.78, width * 0.25, height * 0.88), fill=(73, 84, 75, 230))
    return image


def scene_water(width, height, progress, item_id):
    image = make_gradient(width, height, (144, 199, 226), (232, 221, 178)).convert("RGBA")
    draw = ImageDraw.Draw(image, "RGBA")
    horizon = height * 0.45
    draw.rectangle((0, horizon, width, height), fill=(35, 110, 153, 255))
    draw.polygon([(0, horizon), (width * 0.34, height * 0.34), (width * 0.58, horizon), (width, height * 0.36), (width, horizon)], fill=(63, 93, 108, 180))
    draw.ellipse((width * 0.73, height * 0.13, width * 0.88, height * 0.28), fill=(255, 224, 151, 125))
    for line in range(18):
        y = horizon + 10 + line * (height - horizon) / 20
        amp = 3 + line * 0.28
        points = []
        for step in range(52):
            x = width * step / 51
            wave = math.sin(step * 0.72 + progress * math.tau * 2.2 + line * 0.45) * amp
            points.append((x, y + wave))
        draw_polyline(draw, points, (196, 231, 238, clamp(78 - line * 2)), width=2)
    for ray in range(16):
        x = width * (0.70 + (ray - 8) * 0.012 + math.sin(progress * math.tau + ray) * 0.002)
        y0 = horizon + ray * 8
        draw.line((x, y0, x + width * 0.08, y0 + height * 0.22), fill=(255, 228, 142, 30), width=2)
    draw.ellipse((width * 0.17, height * 0.62, width * 0.22, height * 0.69), fill=(42, 51, 58, 230))
    draw.rectangle((width * 0.18, height * 0.68, width * 0.22, height * 0.80), fill=(48, 60, 67, 220))
    draw_marked_paper(draw, (width * 0.23, height * 0.72, width * 0.36, height * 0.82), 6500 + item_id, progress, fill=(246, 239, 210, 210), accent=(71, 92, 107, 100))
    return image


def scene_forest(width, height, progress, item_id):
    image = make_gradient(width, height, (105, 154, 104), (24, 56, 45)).convert("RGBA")
    draw = ImageDraw.Draw(image, "RGBA")
    overlay(image, lambda layer: layer.polygon([(width * 0.28, 0), (width * 0.44, 0), (width * 0.08, height)], fill=(255, 238, 162, 32)))
    rng = random.Random(4300 + item_id)
    for index in range(24):
        x = (rng.random() * width + progress * width * (0.015 if index % 2 else -0.01)) % width
        trunk_w = rng.uniform(width * 0.008, width * 0.024)
        color = (47, 62, 44, rng.randint(165, 240))
        draw.rectangle((x, 0, x + trunk_w, height), fill=color)
    leaves = seeded_particles(4400 + item_id, 120)
    for leaf in leaves:
        x = (leaf["x"] * width + math.sin(progress * math.tau + leaf["phase"]) * 16) % width
        y = (leaf["y"] * height * 0.78 + math.cos(progress * math.tau + leaf["phase"]) * 8) % (height * 0.80)
        size = leaf["size"] * 5
        green = 100 + int(leaf["color"] * 80)
        draw.ellipse((x - size, y - size, x + size, y + size), fill=(42, green, 64, 120))
    for mote in seeded_particles(4500 + item_id, 45):
        x = mote["x"] * width + math.sin(progress * math.tau + mote["phase"]) * 9
        y = (mote["y"] * height + progress * 12 * mote["speed"]) % height
        draw.ellipse((x - 2, y - 2, x + 2, y + 2), fill=(255, 231, 162, 78))
    walker_x = width * (0.44 + 0.03 * math.sin(progress * math.tau))
    draw.ellipse((walker_x - 9, height * 0.58, walker_x + 9, height * 0.63), fill=(32, 42, 38, 230))
    draw.rectangle((walker_x - 8, height * 0.63, walker_x + 8, height * 0.76), fill=(38, 52, 46, 230))
    draw.line((walker_x - 2, height * 0.76, walker_x - 14, height * 0.88), fill=(32, 42, 38, 220), width=5)
    draw.line((walker_x + 3, height * 0.76, walker_x + 15, height * 0.88), fill=(32, 42, 38, 220), width=5)
    return image


def scene_city(width, height, progress, item_id):
    image = make_gradient(width, height, (47, 64, 96), (245, 163, 94)).convert("RGBA")
    draw = ImageDraw.Draw(image, "RGBA")
    rng = random.Random(5200 + item_id)
    x = 0
    while x < width:
        building_w = rng.randint(max(22, width // 30), max(46, width // 14))
        building_h = rng.randint(int(height * 0.25), int(height * 0.62))
        color = rng.choice([(31, 42, 66, 255), (42, 50, 73, 255), (54, 56, 75, 255)])
        draw.rectangle((x, height - building_h, x + building_w, height), fill=color)
        for wx in range(x + 8, x + building_w - 6, 16):
            for wy in range(int(height - building_h + 12), int(height - 18), 20):
                if rng.random() > 0.56:
                    glow = 120 + int(80 * math.sin(progress * math.tau + wx * 0.02 + wy * 0.01))
                    draw.rectangle((wx, wy, wx + 5, wy + 8), fill=(255, 208, 122, clamp(glow)))
        x += building_w + rng.randint(2, 8)
    draw.rectangle((0, height * 0.78, width, height), fill=(32, 32, 41, 255))
    for lane in range(6):
        y = height * (0.83 + lane * 0.028)
        offset = (progress * width * (0.38 + lane * 0.04)) % width
        for repeat in range(-2, 4):
            x0 = repeat * width * 0.33 + offset
            draw.line((x0, y, x0 + width * 0.18, y + 2), fill=(255, 220, 160, 135), width=2)
    for person in range(7):
        px = (width * (0.10 + person * 0.13) + progress * width * 0.05 * ((person % 2) * 2 - 1)) % width
        py = height * (0.76 + 0.04 * (person % 3))
        draw.ellipse((px - 5, py - 20, px + 5, py - 9), fill=(28, 32, 42, 220))
        draw.rectangle((px - 4, py - 9, px + 4, py + 18), fill=(34, 39, 50, 220))
    return image


def scene_road(width, height, progress, item_id):
    image = make_gradient(width, height, (130, 190, 225), (224, 205, 163)).convert("RGBA")
    draw = ImageDraw.Draw(image, "RGBA")
    draw.polygon([(0, height * 0.56), (width * 0.34, height * 0.38), (width * 0.50, height * 0.56)], fill=(82, 117, 91, 255))
    draw.polygon([(width * 0.42, height * 0.56), (width * 0.75, height * 0.34), (width, height * 0.56)], fill=(70, 104, 90, 255))
    draw.rectangle((0, height * 0.56, width, height), fill=(91, 119, 79, 255))
    road = [(width * 0.43, height), (width * 0.57, height), (width * 0.52, height * 0.56), (width * 0.48, height * 0.56)]
    draw.polygon(road, fill=(44, 47, 52, 255))
    draw.line((width * 0.43, height, width * 0.48, height * 0.56), fill=(238, 238, 220, 190), width=3)
    draw.line((width * 0.57, height, width * 0.52, height * 0.56), fill=(238, 238, 220, 190), width=3)
    for mark in range(10):
        phase = (mark / 10 + progress * 1.2) % 1
        y = height * (0.58 + ease(phase) * 0.45)
        scale = 0.25 + phase * 1.9
        x = width * 0.50
        draw.line((x, y, x, y + 18 * scale), fill=(255, 225, 128, 210), width=max(2, int(3 * scale)))
    return image


def scene_train(width, height, progress, item_id):
    image = make_gradient(width, height, (208, 224, 229), (132, 172, 178)).convert("RGBA")
    draw = ImageDraw.Draw(image, "RGBA")
    draw.rectangle((0, 0, width, height), fill=(36, 42, 50, 255))
    window = (width * 0.10, height * 0.10, width * 0.90, height * 0.78)
    draw.rounded_rectangle(window, radius=18, fill=(160, 211, 225, 255), outline=(225, 227, 218, 220), width=8)
    wx0, wy0, wx1, wy1 = window
    for layer, color, speed in [(0.50, (70, 110, 76, 255), 0.24), (0.60, (84, 134, 84, 255), 0.42), (0.70, (108, 151, 80, 255), 0.68)]:
        y = height * layer
        offset = (progress * width * speed) % width
        for repeat in [-1, 0, 1, 2]:
            x = repeat * width - offset
            draw.polygon([(x, wy1), (x + width * 0.25, y), (x + width * 0.52, wy1)], fill=color)
    for pole in range(10):
        x = (pole * width * 0.18 - progress * width * 0.95) % (width * 1.1)
        draw.line((x, wy0 + 15, x, wy1), fill=(245, 244, 230, 130), width=3)
    draw.rectangle((0, height * 0.78, width, height), fill=(49, 45, 42, 255))
    draw.line((width * 0.16, height * 0.86, width * 0.84, height * 0.86), fill=(185, 185, 175, 200), width=3)
    return image


def scene_desk_device(width, height, progress, item_id, mode="digital"):
    palette = {
        "phone": ((223, 233, 237), (128, 143, 152), (26, 32, 42)),
        "office": ((228, 216, 197), (124, 101, 83), (45, 62, 76)),
        "digital": ((212, 223, 230), (99, 118, 135), (33, 42, 54)),
    }[mode]
    image = make_gradient(width, height, palette[0], palette[1]).convert("RGBA")
    draw = ImageDraw.Draw(image, "RGBA")
    if mode == "office":
        draw.rectangle((width * 0.07, height * 0.10, width * 0.39, height * 0.44), fill=(236, 238, 226, 220), outline=(118, 128, 122, 170), width=3)
        for line in range(5):
            y = height * (0.17 + line * 0.045)
            draw.line((width * 0.11, y, width * (0.23 + 0.03 * line), y), fill=(75, 99, 112, 110), width=2)
        draw_polyline(draw, [
            (width * 0.13, height * 0.37),
            (width * 0.20, height * 0.29 + math.sin(progress * math.tau) * 4),
            (width * 0.29, height * 0.34),
            (width * 0.35, height * 0.22),
        ], (218, 121, 72, 160), width=3)
        draw_sticky_notes(draw, width, height, progress, 6100 + item_id)
    draw.rectangle((0, height * 0.58, width, height), fill=(142, 104, 73, 255))
    if mode == "phone":
        draw_marked_paper(draw, (width * 0.10, height * 0.61, width * 0.34, height * 0.88), 6200 + item_id, progress)
        draw.rounded_rectangle((width * 0.40, height * 0.24, width * 0.61, height * 0.78), radius=24, fill=(18, 24, 32, 255))
        draw.rounded_rectangle((width * 0.42, height * 0.28, width * 0.59, height * 0.73), radius=16, fill=(74, 126, 158, 255))
        shine = width * (0.38 + progress * 0.28)
        draw.polygon([(shine, height * 0.28), (shine + 34, height * 0.28), (shine - 12, height * 0.73), (shine - 46, height * 0.73)], fill=(255, 255, 255, 42))
        draw_hand(draw, width * 0.37, height * 0.72, width / 920, progress * math.tau)
        draw_hand(draw, width * 0.65, height * 0.72, width / 920, progress * math.tau + 1.2)
    else:
        if mode == "office":
            draw_seated_person(draw, width, height, progress)
        draw_marked_paper(draw, (width * 0.08, height * 0.64, width * 0.27, height * 0.89), 6300 + item_id, progress)
        draw_marked_paper(draw, (width * 0.73, height * 0.62, width * 0.92, height * 0.86), 6400 + item_id, progress, fill=(244, 239, 220, 230), accent=(107, 88, 70, 110))
        draw.rectangle((width * 0.26, height * 0.28, width * 0.74, height * 0.66), fill=palette[2] + (255,))
        draw.rectangle((width * 0.29, height * 0.32, width * 0.71, height * 0.61), fill=(78, 116, 145, 255))
        for row in range(4):
            y = height * (0.38 + row * 0.045)
            x0 = width * (0.34 + 0.02 * row)
            draw.line((x0, y, width * (0.60 + 0.03 * math.sin(progress * math.tau + row)), y), fill=(218, 238, 240, 75), width=2)
        draw.polygon([(width * 0.22, height * 0.70), (width * 0.78, height * 0.70), (width * 0.70, height * 0.82), (width * 0.30, height * 0.82)], fill=(210, 213, 208, 255))
        cursor_x = width * (0.36 + 0.24 * progress)
        draw.rectangle((cursor_x, height * 0.39, cursor_x + 8, height * 0.50), fill=(218, 238, 240, 200))
        for key in range(12):
            x = width * 0.34 + key * width * 0.026
            draw.rectangle((x, height * 0.73, x + width * 0.018, height * 0.75), fill=(118, 126, 130, 130))
        if mode == "office":
            draw_hand(draw, width * 0.37, height * (0.72 + 0.012 * math.sin(progress * math.tau)), width / 980, progress * math.tau)
            draw_hand(draw, width * 0.63, height * (0.72 + 0.012 * math.cos(progress * math.tau)), width / 980, progress * math.tau + 1.4)
        else:
            draw_hand(draw, width * 0.37, height * 0.76, width / 1050, progress * math.tau)
            draw_hand(draw, width * 0.64, height * 0.76, width / 1050, progress * math.tau + 1.2)
    return image


def scene_finance(width, height, progress, item_id):
    image = make_gradient(width, height, (236, 236, 224), (118, 137, 132)).convert("RGBA")
    draw = ImageDraw.Draw(image, "RGBA")
    draw.rectangle((width * 0.10, height * 0.16, width * 0.90, height * 0.82), fill=(244, 248, 241, 245))
    draw.rectangle((width * 0.16, height * 0.24, width * 0.84, height * 0.72), outline=(73, 97, 96, 180), width=3)
    for line in range(5):
        y = height * (0.30 + line * 0.08)
        draw.line((width * 0.17, y, width * 0.83, y), fill=(90, 110, 112, 45), width=1)
    bars = [0.25, 0.45, 0.32, 0.62, 0.50, 0.76]
    for index, value in enumerate(bars):
        x0 = width * (0.20 + index * 0.095)
        animated = min(value, value * ease(progress * 1.35 - index * 0.05))
        draw.rectangle((x0, height * (0.70 - animated * 0.42), x0 + width * 0.045, height * 0.70), fill=(78, 133, 120, 220))
    points = []
    for index in range(9):
        visible = ease(progress * 1.15 - index * 0.045)
        x = width * (0.20 + index * 0.075)
        y = height * (0.62 - (0.12 + 0.26 * math.sin(index * 0.8 + 0.6)) * visible)
        points.append((x, y))
    draw_polyline(draw, points, (218, 121, 72, 235), width=4)
    return image


def scene_learning(width, height, progress, item_id):
    image = make_gradient(width, height, (223, 214, 194), (147, 118, 90)).convert("RGBA")
    draw = ImageDraw.Draw(image, "RGBA")
    draw.rounded_rectangle((width * 0.18, height * 0.18, width * 0.82, height * 0.83), radius=10, fill=(248, 244, 226, 255))
    draw.line((width * 0.50, height * 0.19, width * 0.50, height * 0.82), fill=(202, 196, 180, 210), width=3)
    for line in range(8):
        y = height * (0.28 + line * 0.055)
        draw.line((width * 0.24, y, width * 0.46, y), fill=(116, 139, 151, 80), width=2)
        draw.line((width * 0.55, y, width * 0.76, y), fill=(116, 139, 151, 80), width=2)
    pen_x = width * (0.28 + 0.38 * ease((progress * 1.2) % 1))
    pen_y = height * (0.55 + 0.08 * math.sin(progress * math.tau * 1.8))
    draw.line((pen_x, pen_y, pen_x + width * 0.18, pen_y - height * 0.12), fill=(45, 54, 66, 255), width=8)
    draw.line((pen_x + width * 0.16, pen_y - height * 0.11, pen_x + width * 0.20, pen_y - height * 0.14), fill=(210, 166, 86, 255), width=10)
    draw.arc((width * 0.32, height * 0.56, width * 0.56, height * 0.68), 190, 350, fill=(65, 83, 95, 155), width=3)
    return image


def scene_food(width, height, progress, item_id):
    image = make_gradient(width, height, (238, 195, 146), (104, 69, 49)).convert("RGBA")
    draw = ImageDraw.Draw(image, "RGBA")
    draw.rectangle((0, height * 0.50, width, height), fill=(130, 78, 49, 255))
    draw.ellipse((width * 0.22, height * 0.42, width * 0.80, height * 0.88), fill=(242, 232, 211, 255))
    draw.ellipse((width * 0.30, height * 0.50, width * 0.72, height * 0.78), fill=(216, 126, 64, 255))
    for index in range(12):
        angle = progress * math.tau + index * math.tau / 12
        x = width * 0.51 + math.cos(angle) * width * 0.16
        y = height * 0.64 + math.sin(angle) * height * 0.09
        draw.ellipse((x - 10, y - 7, x + 10, y + 7), fill=(237, 206, 126, 225))
    for line in range(5):
        points = []
        for step in range(18):
            t = step / 17
            x = width * (0.39 + line * 0.055) + math.sin(t * 7 + progress * 8 + line) * width * 0.025
            y = height * (0.50 - t * 0.26)
            points.append((x, y))
        draw_polyline(draw, points, (255, 255, 255, 95), width=3)
    return image


def scene_sports(width, height, progress, item_id):
    image = make_gradient(width, height, (238, 134, 89), (86, 58, 68)).convert("RGBA")
    draw = ImageDraw.Draw(image, "RGBA")
    for lane in range(6):
        y = height * (0.28 + lane * 0.12)
        draw.line((0, y, width, y), fill=(255, 231, 188, 85), width=2)
    shoe_x = width * (0.20 + 0.34 * ease((progress * 1.8) % 1))
    shoe_y = height * (0.58 + 0.04 * math.sin(progress * math.tau * 2.0))
    draw.ellipse((shoe_x - 35, shoe_y - 18, shoe_x + 96, shoe_y + 24), fill=(35, 39, 48, 255))
    draw.rectangle((shoe_x - 12, shoe_y - 45, shoe_x + 26, shoe_y - 4), fill=(64, 77, 91, 240))
    for line in range(8):
        x = (width * (0.92 - line * 0.08) - progress * width * 0.36) % width
        draw.line((x, height * 0.38, x - width * 0.18, height * 0.68), fill=(255, 220, 150, 72), width=4)
    return image


def scene_health(width, height, progress, item_id):
    image = make_gradient(width, height, (227, 245, 240), (145, 186, 184)).convert("RGBA")
    draw = ImageDraw.Draw(image, "RGBA")
    draw.rounded_rectangle((width * 0.16, height * 0.20, width * 0.84, height * 0.78), radius=22, fill=(247, 252, 249, 235))
    pulse = []
    for step in range(12):
        x = width * (0.22 + step * 0.05)
        y = height * (0.50 + 0.06 * math.sin(step * 1.5 + progress * math.tau))
        pulse.append((x, y))
    draw_polyline(draw, pulse, (74, 159, 150, 230), width=5)
    for index in range(8):
        angle = index * math.tau / 8 + progress * 0.3
        x = width * 0.72 + math.cos(angle) * width * 0.08
        y = height * 0.48 + math.sin(angle) * height * 0.08
        draw.ellipse((x - 9, y - 9, x + 9, y + 9), fill=(126, 198, 173, 145))
    return image


def scene_product(width, height, progress, item_id):
    image = make_gradient(width, height, (231, 231, 224), (105, 111, 119)).convert("RGBA")
    draw = ImageDraw.Draw(image, "RGBA")
    draw.ellipse((width * 0.24, height * 0.72, width * 0.76, height * 0.88), fill=(42, 47, 52, 80))
    shift = math.sin(progress * math.tau) * width * 0.025
    draw.rounded_rectangle((width * 0.38 + shift, height * 0.30, width * 0.62 + shift, height * 0.72), radius=18, fill=(223, 211, 190, 255), outline=(255, 255, 255, 140), width=3)
    draw.polygon([(width * 0.62 + shift, height * 0.32), (width * 0.70 + shift, height * 0.37), (width * 0.70 + shift, height * 0.68), (width * 0.62 + shift, height * 0.72)], fill=(176, 158, 137, 255))
    shine = width * (0.34 + progress * 0.34)
    draw.polygon([(shine, height * 0.28), (shine + 36, height * 0.28), (shine - 8, height * 0.72), (shine - 48, height * 0.72)], fill=(255, 255, 255, 50))
    return image


def scene_video(width, height, progress, item_id):
    image = make_gradient(width, height, (37, 42, 54), (115, 93, 83)).convert("RGBA")
    draw = ImageDraw.Draw(image, "RGBA")
    draw.rounded_rectangle((width * 0.22, height * 0.33, width * 0.78, height * 0.68), radius=22, fill=(31, 34, 41, 255))
    draw.rectangle((width * 0.60, height * 0.24, width * 0.74, height * 0.34), fill=(39, 42, 49, 255))
    cx, cy = width * 0.50, height * 0.50
    radius = min(width, height) * 0.17
    draw.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill=(10, 16, 24, 255), outline=(116, 131, 144, 255), width=8)
    for ring in range(4):
        r = radius * (0.35 + ring * 0.16)
        draw.ellipse((cx - r, cy - r, cx + r, cy + r), outline=(57, 88, 116, 180 - ring * 28), width=3)
    glint_x = cx + math.cos(progress * math.tau) * radius * 0.42
    glint_y = cy + math.sin(progress * math.tau) * radius * 0.42
    draw.ellipse((glint_x - 13, glint_y - 13, glint_x + 13, glint_y + 13), fill=(142, 208, 230, 150))
    return image


def scene_generic(width, height, progress, item_id):
    image = make_gradient(width, height, (42, 58, 83), (225, 170, 111)).convert("RGBA")
    draw = ImageDraw.Draw(image, "RGBA")
    for index in range(12):
        phase = (progress + index / 12) % 1
        x = width * (0.15 + 0.72 * phase)
        y = height * (0.28 + 0.30 * math.sin(phase * math.tau + index))
        radius = 28 + index * 3
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), outline=(255, 230, 180, 85), width=3)
    draw.rounded_rectangle((width * 0.27, height * 0.32, width * 0.73, height * 0.70), radius=22, fill=(255, 255, 255, 42), outline=(255, 255, 255, 95), width=2)
    return image


def render_frame(item, width, height, index, total):
    progress = index / max(1, total)
    item_id = int(item.get("id", 1))
    scene = detect_scene(item)
    renderers = {
        "sakura": scene_sakura,
        "coffee": scene_coffee,
        "mountain": scene_mountain,
        "water": scene_water,
        "forest": scene_forest,
        "city": scene_city,
        "train": scene_train,
        "road": scene_road,
        "food": scene_food,
        "finance": scene_finance,
        "learning": scene_learning,
        "sports": scene_sports,
        "health": scene_health,
        "product": scene_product,
        "video": scene_video,
        "generic": scene_generic,
    }
    if scene in ["phone", "office", "digital"]:
        image = scene_desk_device(width, height, progress, item_id, scene)
    else:
        image = renderers.get(scene, scene_generic)(width, height, progress, item_id)
    draw = ImageDraw.Draw(image, "RGBA")
    draw_light_grain(draw, width, height, progress, 9000 + item_id)
    return image.convert("RGB")


def main():
    parser = argparse.ArgumentParser(description="使用本機穩定動態生成器建立可辨識 B-roll 影格。")
    parser.add_argument("--input", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--model-root", default="", help="保留相容舊版參數；穩定版不需要外部模型。")
    parser.add_argument("--width", type=int, default=768)
    parser.add_argument("--height", type=int, default=432)
    parser.add_argument("--frames", type=int, default=72)
    args = parser.parse_args()

    output_dir = Path(args.output_dir).expanduser().resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    items = json.loads(Path(args.input).read_text(encoding="utf-8"))
    width = max(320, args.width // 2 * 2)
    height = max(180, args.height // 2 * 2)
    total_frames = max(36, min(144, args.frames))

    generated = []
    for item in items:
        item_id = int(item["id"])
        frames_dir = output_dir / f"motion-{item_id:02d}"
        frames_dir.mkdir(parents=True, exist_ok=True)
        for index in range(total_frames):
            frame = render_frame(item, width, height, index, total_frames)
            frame.save(frames_dir / f"frame-{index:03d}.png", optimize=True)
        generated.append({
            "id": item_id,
            "frameDirectory": str(frames_dir),
            "frameCount": total_frames,
            "firstFramePath": str(frames_dir / "frame-000.png"),
            "mode": "semantic-procedural-motion",
            "scene": detect_scene(item),
        })

    print(json.dumps({"generated": generated, "device": "cpu", "mode": "semantic-procedural-motion"}, ensure_ascii=False))


if __name__ == "__main__":
    main()

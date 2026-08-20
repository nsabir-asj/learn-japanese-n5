#!/usr/bin/env python3
"""Crop the supplied Tofugu mnemonic charts into local-only card assets.

The chart files are intentionally not included in this repository.  Run this
script with the two source JPEGs available locally; it writes WebP crops and a
validation manifest under assets/local-mnemonics/.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Iterable

from PIL import Image


EXPECTED_SIZE = (3300, 2550)
CARD_WIDTH = 338
CARD_HEIGHT = 316
VISUAL_HEIGHT = 190


H_ROWS = [
    ("row-1", ["あ", "か", "さ", "た", "な", "は", "ま", "ら", "や"]),
    ("row-2", ["い", "き", "し", "ち", "に", "ひ", "み", "り"]),
    ("row-3", ["う", "く", "す", "つ", "ぬ", "ふ", "む", "る", "ゆ"]),
    ("row-4", ["え", "け", "せ", "て", "ね", "へ", "め", "れ"]),
    ("row-5", ["お", "こ", "そ", "と", "の", "ほ", "も", "ろ", "よ"]),
    ("row-6", ["わ", "を", "ん"]),
]

K_ROWS = [
    ("row-1", ["ア", "カ", "サ", "タ", "ナ", "ハ", "マ", "ラ", "ヤ"]),
    ("row-2", ["イ", "キ", "シ", "チ", "ニ", "ヒ", "ミ", "リ"]),
    ("row-3", ["ウ", "ク", "ス", "ツ", "ヌ", "フ", "ム", "ル", "ユ"]),
    ("row-4", ["エ", "ケ", "セ", "テ", "ネ", "ヘ", "メ", "レ"]),
    ("row-5", ["オ", "コ", "ソ", "ト", "ノ", "ホ", "モ", "ロ", "ヨ"]),
    ("row-6", ["ワ", "ヲ", "ン"]),
]

READINGS = {
    "あ": "a", "い": "i", "う": "u", "え": "e", "お": "o",
    "か": "ka", "き": "ki", "く": "ku", "け": "ke", "こ": "ko",
    "さ": "sa", "し": "shi", "す": "su", "せ": "se", "そ": "so",
    "た": "ta", "ち": "chi", "つ": "tsu", "て": "te", "と": "to",
    "な": "na", "に": "ni", "ぬ": "nu", "ね": "ne", "の": "no",
    "は": "ha", "ひ": "hi", "ふ": "fu", "へ": "he", "ほ": "ho",
    "ま": "ma", "み": "mi", "む": "mu", "め": "me", "も": "mo",
    "や": "ya", "ゆ": "yu", "よ": "yo",
    "ら": "ra", "り": "ri", "る": "ru", "れ": "re", "ろ": "ro",
    "わ": "wa", "を": "wo", "ん": "n",
}

KATAKANA_TO_HIRAGANA = str.maketrans(
    "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン",
    "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん",
)


def reading_for(kana: str) -> str:
    return READINGS[kana.translate(KATAKANA_TO_HIRAGANA)]

# The chart uses a fixed 9-column rhythm for its first five rows.  The last
# row is intentionally hand-positioned: WA/WO sit at the left and N at the
# right.  These coordinates were measured against the supplied 3300×2550
# JPEGs and include a small white margin around each card.
X_BOXES = [58, 412, 765, 1120, 1473, 1831, 2188, 2546, 2902]
Y_BOXES = [420, 763, 1105, 1448, 1790]
LAST_ROW_BOXES = {"わ": 228, "を": 578, "ん": 2724}
LAST_ROW_Y = 2120


def iter_specs(script: str) -> Iterable[tuple[str, str, tuple[int, int, int, int]]]:
    rows = H_ROWS if script == "hiragana" else K_ROWS
    for row_index, (_, kana_list) in enumerate(rows):
        if row_index < 5:
            x_positions = X_BOXES
            y = Y_BOXES[row_index]
            for column, kana in enumerate(kana_list):
                yield kana, f"{script}-{row_index + 1}-{column + 1}", (
                    x_positions[column], y, x_positions[column] + CARD_WIDTH, y + CARD_HEIGHT
                )
        else:
            for kana in kana_list:
                x = LAST_ROW_BOXES[kana.translate(KATAKANA_TO_HIRAGANA)]
                yield kana, f"{script}-6-{kana}", (x, LAST_ROW_Y, x + CARD_WIDTH, LAST_ROW_Y + CARD_HEIGHT)


def validate_specs(script: str, source: Image.Image) -> list[dict]:
    specs = list(iter_specs(script))
    expected = 46
    if len(specs) != expected:
        raise ValueError(f"{script}: expected {expected} panels, found {len(specs)}")
    kana = [item[0] for item in specs]
    if len(set(kana)) != len(kana):
        raise ValueError(f"{script}: duplicate kana in crop layout: {kana}")
    normalized = {k.translate(KATAKANA_TO_HIRAGANA) for k in kana}
    missing = set(READINGS) - normalized
    if missing:
        raise ValueError(f"{script}: missing expected panels: {sorted(missing)}")
    if source.size != EXPECTED_SIZE:
        raise ValueError(f"{script}: expected {EXPECTED_SIZE[0]}×{EXPECTED_SIZE[1]}, found {source.size}")
    for kana, panel_id, box in specs:
        if box[2] > source.width or box[3] > source.height:
            raise ValueError(f"{script}: {kana} box {box} exceeds source bounds")
    return [{"kana": kana, "panelId": panel_id, "box": list(box)} for kana, panel_id, box in specs]


def kana_slug(kana: str) -> str:
    if kana.isascii():
        return kana
    # Use the romaji reading as the stable filename; this chart only contains
    # the 46 basic kana, so the readings are unique within each script.
    return reading_for(kana)


def save_webp(image: Image.Image, path: Path) -> None:
    image.save(path, "WEBP", lossless=True, method=6)


def crop_chart(script: str, source_path: Path, out_root: Path) -> list[dict]:
    source = Image.open(source_path).convert("RGB")
    records = validate_specs(script, source)
    script_root = out_root / script
    script_root.mkdir(parents=True, exist_ok=True)
    for record in records:
        kana = record["kana"]
        box = tuple(record["box"])
        full = source.crop(box)
        visual = full.crop((0, 0, full.width, VISUAL_HEIGHT))
        slug = kana_slug(kana)
        full_path = script_root / f"{slug}-full.webp"
        visual_path = script_root / f"{slug}-visual.webp"
        save_webp(full, full_path)
        save_webp(visual, visual_path)
        record.update(
            {
                "reading": reading_for(kana),
                "full": str(full_path.relative_to(out_root)).replace("\\", "/"),
                "visual": str(visual_path.relative_to(out_root)).replace("\\", "/"),
                "fullSize": list(full.size),
                "visualSize": list(visual.size),
            }
        )
    return records


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--hiragana", type=Path, required=True, help="path to the supplied Hiragana chart JPEG")
    parser.add_argument("--katakana", type=Path, required=True, help="path to the supplied Katakana chart JPEG")
    parser.add_argument("--output", type=Path, default=Path("assets/local-mnemonics"), help="local-only output directory")
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    all_records = {}
    for script, source in (("hiragana", args.hiragana), ("katakana", args.katakana)):
        if not source.is_file():
            raise FileNotFoundError(source)
        all_records[script] = {
            "source": str(source),
            "sourceSize": list(Image.open(source).size),
            "panels": crop_chart(script, source, args.output),
        }
    manifest = {
        "format": 1,
        "sourceNote": "Local crops generated from user-supplied Tofugu chart images. Do not redistribute without permission.",
        "crop": {"cardSize": [CARD_WIDTH, CARD_HEIGHT], "visualHeight": VISUAL_HEIGHT},
        "charts": all_records,
    }
    (args.output / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {sum(len(v['panels']) for v in all_records.values())} panels to {args.output}")


if __name__ == "__main__":
    main()

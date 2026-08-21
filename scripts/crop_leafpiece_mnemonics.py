#!/usr/bin/env python3
"""Crop the user-supplied LeafPiece Hiragana/Katakana chart.

The source chart is a 7600x4200 composite containing ten vertical pages. Each
page row has a Hiragana panel on the left and a Katakana panel on the right.
The source image is intentionally not part of the repository; generated WebP
files and the manifest stay under the ignored local-mnemonics directory.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageDraw, ImageOps


EXPECTED_SIZE = (7600, 4200)
FULL_SIZE = (720, 380)
VISUAL_SIZE = (720, 300)
VISUAL_OFFSET = 80

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

H_ROWS = [
    ["あ", "い", "う", "え", "お"],
    ["か", "き", "く", "け", "こ"],
    ["さ", "し", "す", "せ", "そ"],
    ["た", "ち", "つ", "て", "と"],
    ["な", "に", "ぬ", "ね", "の"],
    ["は", "ひ", "ふ", "へ", "ほ"],
    ["ま", "み", "む", "め", "も"],
    ["や", "ゆ", "よ"],
    ["ら", "り", "る", "れ", "ろ"],
    ["わ", "を", "ん"],
]

K_ROWS = [
    ["ア", "イ", "ウ", "エ", "オ"],
    ["カ", "キ", "ク", "ケ", "コ"],
    ["サ", "シ", "ス", "セ", "ソ"],
    ["タ", "チ", "ツ", "テ", "ト"],
    ["ナ", "ニ", "ヌ", "ネ", "ノ"],
    ["ハ", "ヒ", "フ", "ヘ", "ホ"],
    ["マ", "ミ", "ム", "メ", "モ"],
    ["ヤ", "ユ", "ヨ"],
    ["ラ", "リ", "ル", "レ", "ロ"],
    ["ワ", "ヲ", "ン"],
]

# Five vertical pages across the top and five across the bottom. These page
# rules were measured against the supplied 7600x4200 PNG.
TOP_PAGE_LEFTS = [212, 1719, 3253, 4763, 6243]
TOP_PAGE_RIGHTS = [1719, 3253, 4763, 6243, 7600]
BOTTOM_PAGE_LEFTS = [212, 1750, 3220, 4721, 6243]
BOTTOM_PAGE_RIGHTS = [1750, 3220, 4721, 6243, 7600]

# Each page has a small right gutter for the next page's reading label. The
# two script panels occupy the first ~1330 px from the page rule.
HIRAGANA_X = (20, 590)
KATAKANA_X = (540, 1330)

TOP_Y = [
    (130, 520),
    (520, 920),
    (920, 1340),
    (1340, 1680),
    (1680, 2070),
]
BOTTOM_Y = [
    (2140, 2580),
    (2580, 2960),
    (2960, 3340),
    (3340, 3710),
    (3710, 4080),
]

# The three-row ya/yu/yo and wa/wo/n pages leave larger vertical gaps than
# the five-row pages.  Give those pages taller, page-specific bands so their
# drawings and captions remain together instead of being split across rows.
BOTTOM_Y_BY_PAGE = {
    5: [(2140, 2580), (2580, 2960), (2960, 3340), (3340, 3690), (3690, 4080)],  # page 6: ha..ho
    6: [(2140, 2540), (2540, 2890), (2890, 3350), (3350, 3690), (3690, 4080)],  # page 7: ma..mo
    7: [(2140, 2790), (2790, 3400), (3400, 3970)],  # page 8: ya/yu/yo
    8: [(2140, 2550), (2550, 2910), (2910, 3330), (3330, 3690), (3690, 4070)],  # page 9: ra..ro
    9: [(2140, 2750), (2750, 3350), (3350, 3970)],  # page 10: wa/wo/n
}

KATAKANA_TO_HIRAGANA = str.maketrans(
    "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン",
    "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん",
)


def reading_for(kana: str) -> str:
    return READINGS[kana.translate(KATAKANA_TO_HIRAGANA)]


def iter_specs(script: str) -> Iterable[tuple[str, str, tuple[int, int, int, int]]]:
    pages = H_ROWS if script == "hiragana" else K_ROWS
    for page_index, kana_page in enumerate(pages):
        top = page_index < 5
        page_column = page_index if top else page_index - 5
        page_lefts = TOP_PAGE_LEFTS if top else BOTTOM_PAGE_LEFTS
        page_rights = TOP_PAGE_RIGHTS if top else BOTTOM_PAGE_RIGHTS
        left = page_lefts[page_column]
        right = page_rights[page_column]
        for page_row, kana in enumerate(kana_page):
            if top:
                y0, y1 = TOP_Y[page_row]
            else:
                y_boxes = BOTTOM_Y_BY_PAGE.get(page_index, BOTTOM_Y)
                y0, y1 = y_boxes[page_row]
            x_offset = HIRAGANA_X if script == "hiragana" else KATAKANA_X
            x0, x1 = left + x_offset[0], left + x_offset[1]
            if x1 > right:
                raise ValueError(f"{script}: {kana} box extends past page {page_index + 1}")
            yield kana, f"page-{page_index + 1}-row-{page_row + 1}", (x0, y0, x1, y1)


def validate_specs(script: str, source: Image.Image) -> list[dict]:
    specs = list(iter_specs(script))
    if len(specs) != 46:
        raise ValueError(f"{script}: expected 46 panels, found {len(specs)}")
    kana = [item[0] for item in specs]
    if len(set(kana)) != len(kana):
        raise ValueError(f"{script}: duplicate kana in crop layout")
    normalized = {item.translate(KATAKANA_TO_HIRAGANA) for item in kana}
    missing = set(READINGS) - normalized
    if missing:
        raise ValueError(f"{script}: missing expected panels: {sorted(missing)}")
    if source.size != EXPECTED_SIZE:
        raise ValueError(
            f"{script}: expected {EXPECTED_SIZE[0]}x{EXPECTED_SIZE[1]}, found {source.size}"
        )
    records = []
    for kana_value, panel_id, box in specs:
        if box[2] > source.width or box[3] > source.height:
            raise ValueError(f"{script}: {kana_value} box {box} exceeds source bounds")
        probe = source.crop(box).convert("L")
        dark_pixels = sum(1 for value in probe.getdata() if value < 100)
        if dark_pixels < 100:
            raise ValueError(f"{script}: {kana_value} box {box} appears empty")
        records.append({"kana": kana_value, "panelId": panel_id, "box": list(box)})
    return records


def fit_on_white(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    image = image.convert("RGB")
    fitted = ImageOps.contain(image, size, method=Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", size, "white")
    offset = ((size[0] - fitted.width) // 2, (size[1] - fitted.height) // 2)
    canvas.paste(fitted, offset)
    return canvas


def save_webp(image: Image.Image, path: Path, size: tuple[int, int]) -> None:
    fit_on_white(image, size).save(path, "WEBP", lossless=True, method=6)


def clean_panel_edges(image: Image.Image, script: str, kana: str) -> Image.Image:
    """Remove the small neighboring-script overlap at the chart's split.

    The source deliberately places the two script drawings close together. A
    narrow white mask removes only the adjacent glyph/tail that falls into the
    other panel; it does not redraw or alter the mnemonic artwork itself.
    """

    cleaned = image.convert("RGB")
    draw = ImageDraw.Draw(cleaned)
    if script == "hiragana":
        # Only trim the very edge of a neighboring Katakana caption.  The
        # mnemonic drawings themselves can reach the split, so a broad mask
        # would wrongly cut socks, boots, waves, and similar artwork.
        draw.rectangle((cleaned.width - 60, 0, cleaned.width, 80), fill="white")
    else:
        # The preceding Hiragana caption can run a few pixels into this panel.
        # The long ツ caption begins very close to the split, so preserve a
        # little more of its leading text than for the other panels.
        top_mask = 12 if reading_for(kana) == "tsu" else 36
        draw.rectangle((0, 0, top_mask, 104), fill="white")
        draw.rectangle((0, 154, 60, cleaned.height), fill="white")
    return cleaned


def crop_chart(script: str, source: Image.Image, out_root: Path) -> list[dict]:
    records = validate_specs(script, source)
    script_root = out_root / script
    script_root.mkdir(parents=True, exist_ok=True)
    for record in records:
        box = tuple(record["box"])
        full = clean_panel_edges(source.crop(box), script, record["kana"])
        visual = full.crop((0, VISUAL_OFFSET, full.width, full.height))
        slug = reading_for(record["kana"])
        full_path = script_root / f"{slug}-full.webp"
        visual_path = script_root / f"{slug}-visual.webp"
        save_webp(full, full_path, FULL_SIZE)
        save_webp(visual, visual_path, VISUAL_SIZE)
        record.update(
            {
                "reading": reading_for(record["kana"]),
                "full": str(full_path.relative_to(out_root)).replace("\\", "/"),
                "visual": str(visual_path.relative_to(out_root)).replace("\\", "/"),
                "fullSize": list(FULL_SIZE),
                "visualSize": list(VISUAL_SIZE),
            }
        )
    return records


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True, help="path to the supplied PNG chart")
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("assets/local-mnemonics/leafpiece"),
        help="local-only output directory",
    )
    args = parser.parse_args()
    if not args.source.is_file():
        raise FileNotFoundError(args.source)
    source = Image.open(args.source).convert("RGB")
    args.output.mkdir(parents=True, exist_ok=True)
    charts = {
        "hiragana": {"panels": crop_chart("hiragana", source, args.output)},
        "katakana": {"panels": crop_chart("katakana", source, args.output)},
    }
    manifest = {
        "format": 1,
        "chart": "LeafPiece Japanese Hiragana/Katakana Mnemonic Chart",
        "source": str(args.source),
        "sourceSize": list(source.size),
        "sourceNote": "Local crops generated from a user-supplied chart. Do not redistribute without permission.",
        "crop": {
            "fullSize": list(FULL_SIZE),
            "visualSize": list(VISUAL_SIZE),
            "visualOffset": VISUAL_OFFSET,
            "topPageLefts": TOP_PAGE_LEFTS,
            "bottomPageLefts": BOTTOM_PAGE_LEFTS,
            "hiraganaX": list(HIRAGANA_X),
            "katakanaX": list(KATAKANA_X),
            "topY": [list(box) for box in TOP_Y],
            "bottomY": [list(box) for box in BOTTOM_Y],
            "bottomYByPage": {
                str(page_index + 1): [list(box) for box in boxes]
                for page_index, boxes in BOTTOM_Y_BY_PAGE.items()
            },
        },
        "charts": charts,
    }
    (args.output / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Wrote {sum(len(value['panels']) for value in charts.values())} panels to {args.output}")


if __name__ == "__main__":
    main()

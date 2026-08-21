#!/usr/bin/env python3
"""Crop the selected panels from the user-supplied Pictografix chart.

The chart is a 3885x2555 composite with paired Hiragana/Katakana panels.
Only the panels selected in ``docs/kana-mnemonic-preferences.md`` are
extracted.  The source artwork is intentionally not copied into the
repository; generated WebP files and the manifest stay under the ignored
``assets/local-mnemonics/pictografix`` directory.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image, ImageOps


EXPECTED_SIZE = (3885, 2555)
FULL_SIZE = (720, 430)
VISUAL_SIZE = (720, 300)
VISUAL_OFFSET = 90
VISUAL_BOTTOM_PADDING = 8
INK_THRESHOLD = 150
INK_BAND_GAP = 4

# The selected panels come from a fixed chart.  Their source boxes begin at
# slightly different distances from the label bar, so one global offset clips
# the top of some illustrations.  These are the first content rows after the
# label bar, measured once from the supplied chart.  The fallback keeps the
# crop utility usable if another panel is added later.
VISUAL_TOPS_BY_SOURCE_Y = {
    270: 360,
    545: 614,
    815: 870,
    1545: 1622,
    1570: 1622,
    1840: 1877,
    2315: 2388,
}


READINGS = {
    "し": "shi",
    "シ": "shi",
    "す": "su",
    "ス": "su",
    "せ": "se",
    "セ": "se",
    "ね": "ne",
    "み": "mi",
    "も": "mo",
    "モ": "mo",
    "き": "ki",
    "キ": "ki",
    "イ": "i",
    "エ": "e",
    "ユ": "yu",
    "ヨ": "yo",
}


# The chart's first five rows use six side-by-side H/K pairs.  These centers
# are measured from the label rectangles rather than assuming perfectly even
# spacing; the supplied JPEG has small per-column drift.
TOP_CENTERS = {
    "hiragana": [155, 832, 1460, 2127, 2745, 3424],
    "katakana": [471, 1144, 1768, 2443, 3060, 3738],
}

TOP_ROWS = {
    # The y bands stop before the next row's label bar.
    2: (270, 535),
    3: (545, 805),
    4: (815, 1055),
}


# The lower portion places the M and Y groups in four columns.  Only M-I,
# M-O, Y-U, and Y-O are needed here.
LOWER_CENTERS = {
    "hiragana": {"m": 820, "y": 1480},
    "katakana": {"m": 1120, "y": 1780},
}

LOWER_BANDS = {
    "mi": (1545, 1805),
    "yu": (1570, 1810),
    "yo": (1840, 2055),
    "mo": (2315, 2555),
}


def box_for_center(center: int, y0: int, y1: int, width: int = 320) -> tuple[int, int, int, int]:
    x0 = max(0, center - width // 2)
    x1 = min(EXPECTED_SIZE[0], center + width // 2)
    return (x0, y0, x1, y1)


def specs() -> list[dict]:
    rows: list[dict] = []

    def top(kana: str, script: str, column: int, row: int) -> None:
        center = TOP_CENTERS[script][column]
        y0, y1 = TOP_ROWS[row]
        rows.append(
            {
                "kana": kana,
                "reading": READINGS[kana],
                "script": script,
                "sourceBox": list(box_for_center(center, y0, y1)),
                "cue": {
                    "し": "She has flowing hair.",
                    "シ": "She has a funny smile.",
                    "す": "Soon the sprout will bloom.",
                    "ス": "Suit hanger.",
                    "せ": "Say.",
                    "セ": "Say.",
                    "ね": "Net a big fish.",
                    "き": "Key.",
                    "キ": "Key.",
                    "イ": "Eat with chopsticks.",
                    "エ": "Elevator doors.",
                }[kana],
            }
        )

    top("イ", "katakana", 0, 2)
    top("エ", "katakana", 0, 4)
    top("き", "hiragana", 1, 2)
    top("キ", "katakana", 1, 2)
    top("し", "hiragana", 2, 2)
    top("シ", "katakana", 2, 2)
    top("ス", "katakana", 2, 3)
    top("せ", "hiragana", 2, 4)
    top("セ", "katakana", 2, 4)
    top("ね", "hiragana", 4, 4)

    def lower(kana: str, script: str, group: str, band: str) -> None:
        center = LOWER_CENTERS[script][group]
        y0, y1 = LOWER_BANDS[band]
        # The failed-U-turn sketch for Hiragana ゆ reaches a few pixels into
        # the Katakana panel. Start the selected ユ crop at its label edge so
        # that neighboring artwork is not carried into the asset.
        if script == "hiragana" and group == "m":
            source_box = (680, y0, 970, y1)
        elif kana == "ユ":
            source_box = (1640, y0, 1940, y1)
        else:
            source_box = box_for_center(center, y0, y1)
        cue = {
            "み": "Me, I'm 21.",
            "も": "Catch mo' fish with this.",
            "モ": "Catch mo' fish with this.",
            "ユ": "You are number one.",
            "ヨ": "Yo-yo.",
        }[kana]
        rows.append(
            {
                "kana": kana,
                "reading": READINGS[kana],
                "script": script,
                "sourceBox": list(source_box),
                "cue": cue,
            }
        )

    lower("み", "hiragana", "m", "mi")
    lower("も", "hiragana", "m", "mo")
    lower("モ", "katakana", "m", "mo")
    lower("ユ", "katakana", "y", "yu")
    lower("ヨ", "hiragana", "y", "yo")
    return rows


def fit_on_white(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    fitted = ImageOps.contain(image.convert("RGB"), size, method=Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", size, "white")
    offset = ((size[0] - fitted.width) // 2, (size[1] - fitted.height) // 2)
    canvas.paste(fitted, offset)
    return canvas


def save_webp(image: Image.Image, path: Path, size: tuple[int, int]) -> None:
    fit_on_white(image, size).save(path, "WEBP", lossless=True, method=6)


def _merge_ink_bands(rows: list[tuple[int, int]]) -> list[list[tuple[int, int]]]:
    """Merge nearby dark-row runs so anti-aliased text stays one band."""

    bands: list[list[tuple[int, int]]] = []
    for row in rows:
        if not bands or row[0] - bands[-1][-1][0] > INK_BAND_GAP + 1:
            bands.append([])
        bands[-1].append(row)
    return bands


def _caption_top(source: Image.Image, box: tuple[int, int, int, int]) -> int:
    """Return the top of the lowest text band in a panel.

    Pictografix puts the mnemonic sentence below the illustration in every
    selected panel.  Looking only in the lower half avoids treating dark
    illustration strokes as the caption; the bottom-most remaining band is
    then the sentence that should be excluded from a visual-only crop.
    """

    x0, y0, x1, y1 = box
    gray = source.crop(box).convert("L")
    width, height = gray.size
    rows: list[tuple[int, int]] = []
    pixels = gray.load()
    for offset in range(height):
        ink = sum(1 for x in range(width) if pixels[x, offset] < INK_THRESHOLD)
        # Full-width strokes are panel borders, not the mnemonic sentence.
        if ink > max(6, int(width * 0.01)) and ink < int(width * 0.75):
            rows.append((y0 + offset, ink))
    lower_start = y0 + int(height * 0.5)
    bands = _merge_ink_bands([row for row in rows if row[0] >= lower_start])
    if not bands:
        raise ValueError(f"could not locate lower mnemonic text for {box}")
    return bands[-1][0][0]


def visual_box_for(source: Image.Image, source_box: tuple[int, int, int, int]) -> tuple[int, int, int, int]:
    """Build a visual-only box while leaving the full panel box untouched."""

    x0, y0, x1, y1 = source_box
    visual_top = VISUAL_TOPS_BY_SOURCE_Y.get(y0, y0 + VISUAL_OFFSET)
    visual_bottom = _caption_top(source, source_box) - VISUAL_BOTTOM_PADDING
    if not (y0 <= visual_top < visual_bottom <= y1):
        raise ValueError(
            f"invalid visual bounds for {source_box}: {(x0, visual_top, x1, visual_bottom)}"
        )
    return (x0, visual_top, x1, visual_bottom)


def validate(source: Image.Image, records: list[dict]) -> None:
    if source.size != EXPECTED_SIZE:
        raise ValueError(f"expected {EXPECTED_SIZE[0]}x{EXPECTED_SIZE[1]}, found {source.size}")
    kana = [record["kana"] for record in records]
    if len(kana) != len(set(kana)):
        raise ValueError("duplicate kana in selected panel list")
    for record in records:
        x0, y0, x1, y1 = record["sourceBox"]
        if not (0 <= x0 < x1 <= source.width and 0 <= y0 < y1 <= source.height):
            raise ValueError(f"invalid box for {record['kana']}: {record['sourceBox']}")
        gray = source.crop((x0, y0, x1, y1)).convert("L")
        dark = sum(1 for value in gray.getdata() if value < 100)
        if dark < 100:
            raise ValueError(f"panel appears empty for {record['kana']}: {record['sourceBox']}")


def crop_chart(source: Image.Image, output: Path) -> list[dict]:
    records = specs()
    validate(source, records)
    for record in records:
        script_root = output / record["script"]
        script_root.mkdir(parents=True, exist_ok=True)
        source_box = tuple(record["sourceBox"])
        cropped = source.crop(source_box)
        visual_box = visual_box_for(source, source_box)
        visual = source.crop(visual_box)
        stem = record["reading"]
        full_path = script_root / f"{stem}-full.webp"
        visual_path = script_root / f"{stem}-visual.webp"
        # Several selected readings intentionally have both scripts.  Keep
        # those files distinct while retaining the app's familiar slugs.
        if any(
            other["reading"] == record["reading"] and other["script"] == record["script"] and other["kana"] != record["kana"]
            for other in records
        ):
            stem = f"{stem}-{record['kana']}"
            full_path = script_root / f"{stem}-full.webp"
            visual_path = script_root / f"{stem}-visual.webp"
        save_webp(cropped, full_path, FULL_SIZE)
        save_webp(visual, visual_path, VISUAL_SIZE)
        record.update(
            {
                "full": str(full_path.relative_to(output)).replace("\\", "/"),
                "visual": str(visual_path.relative_to(output)).replace("\\", "/"),
                "visualBox": list(visual_box),
                "fullSize": list(FULL_SIZE),
                "visualSize": list(VISUAL_SIZE),
            }
        )
    return records


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("assets/local-mnemonics/pictografix"),
    )
    args = parser.parse_args()
    if not args.source.is_file():
        raise FileNotFoundError(args.source)
    source = Image.open(args.source).convert("RGB")
    args.output.mkdir(parents=True, exist_ok=True)
    records = crop_chart(source, args.output)
    manifest = {
        "format": 1,
        "chart": "Pictografix Japanese Hiragana/Katakana Mnemonic Chart",
        "source": str(args.source),
        "sourceSize": list(source.size),
        "sourceNote": "Local crops generated from a user-supplied chart. Do not redistribute without permission.",
        "crop": {
            "fullSize": list(FULL_SIZE),
            "visualSize": list(VISUAL_SIZE),
            "visualMethod": "label-aligned top plus lowest caption-band detection",
            "visualBottomPadding": VISUAL_BOTTOM_PADDING,
        },
        "selectedPanels": records,
    }
    (args.output / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(records)} selected panels to {args.output}")


if __name__ == "__main__":
    main()

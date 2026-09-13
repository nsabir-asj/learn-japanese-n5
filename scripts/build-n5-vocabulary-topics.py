"""Build the checked-in JLPT N5 topic dataset from the MLC PDF and GyanMirai.

Usage:
  python scripts/build-n5-vocabulary-topics.py --pdf PATH --output PATH

The PDF is intentionally not committed. The generated JSON is the application
source artifact; this importer exists to make its provenance reproducible.
"""

from __future__ import annotations

import argparse
import html
import json
import re
import unicodedata
from collections import Counter
from datetime import date
from pathlib import Path
from urllib.request import Request, urlopen

import pdfplumber


BASE_URL = "https://www.gyanmirai.com/jlpt/jlpt-n5/vocabulary-topics"
TOPICS = [
    ("time-and-calendar", "Time & Calendar", "📅", 97),
    ("location-and-direction", "Location & Direction", "🧭", 82),
    ("numbers-and-counting", "Numbers & Counting", "🔢", 61),
    ("food-and-drink", "Food & Drink", "🍽️", 49),
    ("family-and-people", "Family & People", "👨‍👩‍👧", 38),
    ("communication", "Communication", "💬", 33),
    ("verbs-of-motion", "Verbs of Motion", "🚶", 32),
    ("school-and-education", "School & Education", "📚", 31),
    ("physical-descriptions", "Physical Descriptions", "📐", 31),
    ("home-and-daily-life", "Home & Daily Life", "🏠", 30),
    ("clothing-and-appearance", "Clothing & Appearance", "👔", 25),
    ("nature-and-weather", "Nature & Weather", "🌿", 25),
    ("body-and-health", "Body & Health", "🏥", 21),
    ("basic-adjectives", "Basic Adjectives", "✨", 18),
    ("abstract-concepts", "Abstract Concepts", "🤔", 16),
    ("transportation", "Transportation", "🚗", 12),
    ("shopping-and-money", "Shopping & Money", "🛒", 12),
    ("actions-and-behavior", "Actions & Behavior", "🎭", 12),
    ("arts-and-culture", "Arts & Culture", "🎨", 10),
    ("work-and-business", "Work & Business", "💼", 7),
    ("emotions-and-feelings", "Emotions & Feelings", "😊", 6),
    ("sports-and-recreation", "Sports & Recreation", "⚽", 5),
]

TOPIC_DESCRIPTIONS = {
    "time-and-calendar": "Dates, times, seasons, frequency, and temporal expressions.",
    "location-and-direction": "Places, positions, directions, and spatial relationships.",
    "numbers-and-counting": "Numbers, quantities, measurements, and counters.",
    "food-and-drink": "Food, drinks, meals, cooking, and dining.",
    "family-and-people": "Family relationships, people, and personal identity.",
    "communication": "Conversation, language, questions, answers, and social expressions.",
    "verbs-of-motion": "Movement and actions that change position or physical state.",
    "school-and-education": "School places, study, lessons, and learning materials.",
    "physical-descriptions": "Size, shape, color, weight, and visible qualities.",
    "home-and-daily-life": "Homes, household objects, chores, and daily routines.",
    "clothing-and-appearance": "Clothes, accessories, dressing, and appearance.",
    "nature-and-weather": "Weather, seasons, animals, plants, and the natural world.",
    "body-and-health": "Body parts, health, illness, and physical condition.",
    "basic-adjectives": "High-frequency qualities and basic descriptive words.",
    "abstract-concepts": "Ideas, states, reasons, ways, and non-physical concepts.",
    "transportation": "Vehicles, stations, travel, and public transport.",
    "shopping-and-money": "Buying, selling, prices, money, and stores.",
    "actions-and-behavior": "General actions, habits, and observable behavior.",
    "arts-and-culture": "Music, media, entertainment, and cultural activities.",
    "work-and-business": "Jobs, workplaces, companies, and business activity.",
    "emotions-and-feelings": "Feelings, preferences, wishes, and emotional states.",
    "sports-and-recreation": "Sports, games, exercise, and leisure activities.",
    "grammar-and-function-words": "Particles, auxiliaries, grammatical patterns, and function words.",
}

# PDF entries that are absent from the website or whose broad English wording is
# not safe to classify by keywords alone. Keeping these decisions explicit makes
# the editorial layer reviewable.
MANUAL_TOPIC_OVERRIDES = {
    9: "grammar-and-function-words",
    11: "numbers-and-counting", 12: "numbers-and-counting", 13: "grammar-and-function-words",
    24: "grammar-and-function-words", 25: "time-and-calendar", 26: "grammar-and-function-words",
    29: "grammar-and-function-words",
    54: "verbs-of-motion", 56: "actions-and-behavior", 80: "location-and-direction",
    82: "abstract-concepts", 83: "abstract-concepts", 98: "numbers-and-counting",
    107: "abstract-concepts", 113: "abstract-concepts", 123: "family-and-people",
    127: "emotions-and-feelings", 130: "home-and-daily-life", 135: "actions-and-behavior",
    138: "grammar-and-function-words", 148: "actions-and-behavior", 151: "location-and-direction", 152: "communication",
    154: "food-and-drink", 155: "family-and-people", 175: "family-and-people",
    206: "actions-and-behavior", 228: "abstract-concepts", 234: "communication",
    250: "location-and-direction", 253: "actions-and-behavior", 277: "family-and-people",
    303: "school-and-education", 304: "school-and-education", 305: "emotions-and-feelings",
    314: "nature-and-weather", 316: "actions-and-behavior", 317: "sports-and-recreation",
    336: "body-and-health", 339: "actions-and-behavior", 347: "food-and-drink",
    351: "basic-adjectives", 366: "food-and-drink", 380: "clothing-and-appearance",
    359: "actions-and-behavior", 373: "home-and-daily-life", 376: "physical-descriptions",
    390: "home-and-daily-life", 402: "location-and-direction", 406: "abstract-concepts",
    407: "time-and-calendar", 413: "grammar-and-function-words", 417: "basic-adjectives",
    427: "communication", 433: "abstract-concepts", 440: "abstract-concepts",
    456: "home-and-daily-life", 457: "home-and-daily-life", 462: "abstract-concepts",
    482: "location-and-direction",
    484: "food-and-drink", 498: "communication", 519: "abstract-concepts",
    507: "actions-and-behavior", 525: "abstract-concepts", 530: "basic-adjectives",
    536: "location-and-direction", 537: "communication", 542: "arts-and-culture",
    549: "transportation", 551: "sports-and-recreation", 552: "home-and-daily-life",
    554: "communication", 563: "transportation", 579: "actions-and-behavior",
    588: "food-and-drink", 591: "verbs-of-motion", 592: "arts-and-culture",
    613: "nature-and-weather", 621: "nature-and-weather",
    634: "grammar-and-function-words", 645: "home-and-daily-life", 647: "shopping-and-money",
    660: "actions-and-behavior", 678: "actions-and-behavior", 688: "school-and-education",
    696: "verbs-of-motion", 697: "verbs-of-motion", 699: "abstract-concepts",
    700: "actions-and-behavior", 701: "location-and-direction", 705: "shopping-and-money",
    708: "location-and-direction", 714: "actions-and-behavior", 719: "basic-adjectives",
    728: "food-and-drink", 737: "work-and-business", 738: "transportation",
    748: "clothing-and-appearance", 757: "communication", 758: "communication",
    764: "communication", 765: "communication", 766: "communication", 767: "communication",
    770: "communication", 771: "communication", 772: "communication", 774: "communication",
    775: "communication", 777: "communication", 778: "communication", 781: "communication",
    782: "communication", 788: "grammar-and-function-words", 792: "communication",
    794: "communication", 801: "communication",
}

# Current app entries that use a base form, a negative form, or a close social
# expression while the PDF stores a polite/alternate form.
EXISTING_ORDER_OVERRIDES = {
    "mata-ne": 795,
    "wakarimasen": 750,
    "iku": 89,
    "kuru": 242,
    "kaeru": 197,
    "taberu": 425,
    "nomu": 547,
}

CARD_RE = re.compile(
    r'<div class="vocab-card"[^>]*>.*?'
    r'<span class="kanji"[^>]*>(.*?)</span>.*?'
    r'<span class="kana"[^>]*>(.*?)</span>.*?'
    r'<div class="vocab-meaning"[^>]*>(.*?)</div>',
    re.DOTALL,
)


def clean_markup(value: str) -> str:
    value = re.sub(r"<[^>]+>", "", value)
    return " ".join(html.unescape(value).split())


def normalized(value: str) -> str:
    value = unicodedata.normalize("NFKC", value or "")
    value = value.translate(str.maketrans("ァィゥェォャュョッヮヵヶヴ", "ぁぃぅぇぉゃゅょっゎゕゖゔ"))
    value = "".join(chr(ord(ch) - 0x60) if "ア" <= ch <= "ヶ" else ch for ch in value)
    return re.sub(r"[\s。、・～~（）()\[\]「」『』/／＝=…]+", "", value).lower()


ROMAJI = {
    "あ":"a","い":"i","う":"u","え":"e","お":"o","か":"ka","き":"ki","く":"ku","け":"ke","こ":"ko",
    "が":"ga","ぎ":"gi","ぐ":"gu","げ":"ge","ご":"go","さ":"sa","し":"shi","す":"su","せ":"se","そ":"so",
    "ざ":"za","じ":"ji","ず":"zu","ぜ":"ze","ぞ":"zo","た":"ta","ち":"chi","つ":"tsu","て":"te","と":"to",
    "だ":"da","ぢ":"ji","づ":"zu","で":"de","ど":"do","な":"na","に":"ni","ぬ":"nu","ね":"ne","の":"no",
    "は":"ha","ひ":"hi","ふ":"fu","へ":"he","ほ":"ho","ば":"ba","び":"bi","ぶ":"bu","べ":"be","ぼ":"bo",
    "ぱ":"pa","ぴ":"pi","ぷ":"pu","ぺ":"pe","ぽ":"po","ま":"ma","み":"mi","む":"mu","め":"me","も":"mo",
    "や":"ya","ゆ":"yu","よ":"yo","ら":"ra","り":"ri","る":"ru","れ":"re","ろ":"ro","わ":"wa","を":"wo",
    "ん":"n","ゔ":"vu","ぁ":"a","ぃ":"i","ぅ":"u","ぇ":"e","ぉ":"o",
    "きゃ":"kya","きゅ":"kyu","きょ":"kyo","ぎゃ":"gya","ぎゅ":"gyu","ぎょ":"gyo","しゃ":"sha","しゅ":"shu","しょ":"sho",
    "じゃ":"ja","じゅ":"ju","じょ":"jo","ちゃ":"cha","ちゅ":"chu","ちょ":"cho","にゃ":"nya","にゅ":"nyu","にょ":"nyo",
    "ひゃ":"hya","ひゅ":"hyu","ひょ":"hyo","びゃ":"bya","びゅ":"byu","びょ":"byo","ぴゃ":"pya","ぴゅ":"pyu","ぴょ":"pyo",
    "みゃ":"mya","みゅ":"myu","みょ":"myo","りゃ":"rya","りゅ":"ryu","りょ":"ryo","てぃ":"ti","でぃ":"di","ふぁ":"fa",
    "ふぃ":"fi","ふぇ":"fe","ふぉ":"fo","うぃ":"wi","うぇ":"we","うぉ":"wo","しぇ":"she","じぇ":"je","ちぇ":"che",
}


def romanize(value: str) -> str:
    text = unicodedata.normalize("NFKC", value).strip("～。、 ")
    text = text.translate(str.maketrans({"、": " ", "。": "", "・": " ", "／": "/", "＝": "="}))
    text = "".join(chr(ord(ch) - 0x60) if "ァ" <= ch <= "ヶ" else ch for ch in text)
    result, geminate, i = [], False, 0
    while i < len(text):
        ch = text[i]
        if ch == "っ":
            geminate = True
            i += 1
            continue
        if ch == "ー":
            if result:
                vowels = re.findall(r"[aeiou]", result[-1])
                if vowels:
                    result.append(vowels[-1])
            i += 1
            continue
        token = ROMAJI.get(text[i:i+2])
        step = 2 if token else 1
        token = token or ROMAJI.get(ch, ch)
        if geminate and token and token[0].isalpha():
            token = token[0] + token
            geminate = False
        result.append(token)
        i += step
    return re.sub(r"\s+", " ", "".join(result)).strip()


def extract_pdf(pdf_path: Path) -> list[dict]:
    records = {}
    with pdfplumber.open(pdf_path) as pdf:
        for page_number, page in enumerate(pdf.pages[:25], 1):
            words = page.extract_words(use_text_flow=False, keep_blank_chars=False)
            anchors = [w for w in words if 50 <= w["x0"] < 70 and w["text"].isdigit() and 1 <= int(w["text"]) <= 802]
            for anchor in anchors:
                order = int(anchor["text"])
                top = anchor["top"]
                row = [w for w in words if abs(w["top"] - top) <= 1.0]
                vocab_row = [w for w in words if top - 5.0 <= w["top"] <= top + 1.0]
                kana = "".join(w["text"] for w in sorted(vocab_row, key=lambda item: item["x0"]) if 70 <= w["x0"] < 126)
                kanji = "".join(w["text"] for w in sorted(row, key=lambda item: item["x0"]) if 126 <= w["x0"] < 166)
                freq_words = [w["text"] for w in row if w["x0"] >= 445 and w["text"].isdigit()]
                meaning_words = [
                    w for w in words
                    if 166 <= w["x0"] < 445 and top - 10.5 <= w["top"] <= top + 1.0
                ]
                meaning_lines = {}
                for word in meaning_words:
                    line_top = round(word["top"], 1)
                    meaning_lines.setdefault(line_top, []).append(word)
                meaning = " ".join(
                    " ".join(w["text"] for w in sorted(line, key=lambda item: item["x0"]))
                    for _, line in sorted(meaning_lines.items())
                ).strip()
                records[order] = {
                    "id": f"n5-{order:04d}",
                    "order": order,
                    "kana": kana,
                    "kanji": kanji or None,
                    "romaji": romanize(kana),
                    "meaning": meaning,
                    "frequency": int(freq_words[0]) if freq_words else None,
                    "pdfPage": page_number,
                }
    missing = sorted(set(range(1, 803)) - records.keys())
    if missing:
        raise RuntimeError(f"PDF extraction missed numbered entries: {missing}")
    return [records[index] for index in range(1, 803)]


def fetch_site() -> tuple[dict[str, list[dict]], list[dict]]:
    by_topic, all_items = {}, []
    for slug, label, _, expected in TOPICS:
        request = Request(f"{BASE_URL}/{slug}", headers={"User-Agent": "Japanese-N5-lessons dataset builder"})
        with urlopen(request, timeout=60) as response:
            body = response.read().decode("utf-8")
        items = [
            {"kanji": clean_markup(k), "kana": clean_markup(r), "meaning": clean_markup(m), "topicId": slug}
            for k, r, m in CARD_RE.findall(body)
        ]
        if len(items) != expected:
            raise RuntimeError(f"{label}: expected {expected} website records, found {len(items)}")
        by_topic[slug] = items
        all_items.extend(items)
    return by_topic, all_items


STOPWORDS = {"a","an","and","as","at","be","for","from","in","is","of","on","or","the","to","with","e.g","i.e"}


def meaning_tokens(value: str) -> set[str]:
    return {token for token in re.findall(r"[a-z]+", value.lower()) if token not in STOPWORDS and len(token) > 1}


def japanese_candidates(record: dict, site_items: list[dict]) -> list[dict]:
    forms = {normalized(record["kana"]), normalized(record.get("kanji") or "")}
    forms.discard("")
    exact = [item for item in site_items if forms & {normalized(item["kana"]), normalized(item["kanji"])}]
    if exact:
        return exact
    # The PDF commonly uses polite verb forms while the site uses dictionary forms.
    roots = {root for form in forms if len(root := re.sub(r"(ません|ました|ます)$", "", form)) >= 2}
    candidates = []
    for item in site_items:
        item_forms = {normalized(item["kana"]), normalized(item["kanji"])}
        item_roots = {
            root for form in item_forms
            if len(root := re.sub(r"[うくぐすつぬぶむる]$", "", form)) >= 2
        }
        if any(any(root.startswith(other) or other.startswith(root) for other in item_roots) for root in roots):
            candidates.append(item)
    return candidates


def select_site_match(record: dict, site_items: list[dict]) -> dict | None:
    candidates = japanese_candidates(record, site_items)
    if not candidates:
        return None
    source_tokens = meaning_tokens(record["meaning"])
    scored = []
    for item in candidates:
        target_tokens = meaning_tokens(item["meaning"])
        overlap = len(source_tokens & target_tokens)
        union = len(source_tokens | target_tokens) or 1
        record_forms = {normalized(record["kana"]), normalized(record.get("kanji") or "")} - {""}
        item_forms = {normalized(item["kana"]), normalized(item["kanji"])} - {""}
        exact_japanese = bool(record_forms & item_forms)
        scored.append(((2 if exact_japanese else 0) + overlap / union, overlap, item))
    scored.sort(key=lambda value: (value[0], value[1]), reverse=True)
    best_score, overlap, best = scored[0]
    if best_score >= 2 or overlap > 0:
        return best
    return None


KEYWORD_TOPICS = [
    ("grammar-and-function-words", r"particle|suffix|prefix|auxiliary|copula|plural marker|nominalizer|question marker|indicates|used after|used with|grammatical"),
    ("time-and-calendar", r"time|day|week|month|year|morning|afternoon|evening|night|today|tomorrow|yesterday|season|spring|summer|autumn|winter|calendar|o'clock|minute|hour|daily|weekly|monthly|annual|early|late|soon|already|before|after"),
    ("numbers-and-counting", r"number|counter|count|one|two|three|four|five|six|seven|eight|nine|ten|hundred|thousand|million|quantity|how many|kilogram|gram|meter|percent|half"),
    ("food-and-drink", r"food|drink|meal|breakfast|lunch|dinner|rice|tea|coffee|water|milk|beer|wine|fruit|vegetable|meat|fish|egg|bread|cake|apple|orange|cooking|restaurant|delicious|sweet|spicy|hungry|thirsty"),
    ("family-and-people", r"mother|father|parent|brother|sister|grandfather|grandmother|husband|wife|family|child|boy|girl|woman|man|person|people|friend|adult|name|age|foreign|nationality"),
    ("school-and-education", r"school|university|college|student|teacher|class|lesson|study|learn|homework|test|exam|question|answer|book|dictionary|notebook|paper|pencil|pen|eraser|composition|practice"),
    ("work-and-business", r"work|job|office|company|business|employee|profession|doctor|engineer|bank|meeting"),
    ("transportation", r"train|bus|car|taxi|bicycle|airplane|ship|vehicle|station|airport|ticket|platform|travel"),
    ("shopping-and-money", r"buy|sell|shop|store|market|money|yen|price|cheap|expensive|wallet|change|customer"),
    ("clothing-and-appearance", r"clothes|clothing|shirt|coat|skirt|dress|trousers|pants|shoe|sock|hat|glasses|wear|put on|take off"),
    ("body-and-health", r"body|head|face|eye|ear|mouth|tooth|hand|finger|foot|leg|stomach|back|health|ill|sick|medicine|hospital|doctor|pain|tired"),
    ("nature-and-weather", r"weather|rain|snow|wind|cloud|sky|sun|moon|star|mountain|river|sea|ocean|tree|flower|animal|dog|cat|bird|fish|hot weather|cold weather"),
    ("sports-and-recreation", r"sport|game|baseball|football|soccer|tennis|swim|exercise|play|hobby|leisure"),
    ("arts-and-culture", r"music|song|sing|movie|film|cinema|photo|picture|draw|radio|television|newspaper|magazine|record|camera"),
    ("location-and-direction", r"place|location|here|there|where|inside|outside|front|behind|above|below|under|next to|near|far|left|right|side|direction|entrance|exit|road|street|bridge|building|park|town|city|country|room|floor"),
    ("home-and-daily-life", r"home|house|apartment|room|door|window|table|chair|bed|kitchen|bath|toilet|refrigerator|household|clean|wash|wake|sleep|daily life"),
    ("communication", r"say|tell|speak|talk|ask|call|telephone|hear|listen|read|write|understand|know|language|word|voice|hello|goodbye|thank|sorry|please|yes|no|excuse|welcome"),
    ("emotions-and-feelings", r"feel|feeling|happy|sad|afraid|scared|like|dislike|love|hate|want|wish|interesting|boring|fun|lonely"),
    ("physical-descriptions", r"color|red|blue|white|black|yellow|brown|green|size|shape|long|short|tall|low|wide|narrow|thick|thin|heavy|light|round|young|old|bright|dark"),
    ("verbs-of-motion", r"go|come|walk|run|return|arrive|leave|enter|exit|climb|fly|move|turn|stand|sit|ride|get on|get off|open|close|put|take out|bring|carry"),
    ("actions-and-behavior", r"^to |do |make |use |give |receive |hold |cut |push |pull |show |wait |help |remember |forget |begin |finish"),
    ("basic-adjectives", r"good|bad|new|beautiful|clean|dirty|easy|difficult|strong|weak|kind|quiet|busy|convenient|fine|splendid"),
]


def manual_topic(record: dict) -> tuple[str, str]:
    if record["order"] in MANUAL_TOPIC_OVERRIDES:
        topic_id = MANUAL_TOPIC_OVERRIDES[record["order"]]
        return topic_id, f"No reliable site match; editorially assigned to {topic_id} from the entry's sense."
    meaning = record["meaning"].lower()
    for topic_id, pattern in KEYWORD_TOPICS:
        if re.search(pattern, meaning):
            return topic_id, f"No reliable site match; assigned by the record meaning ({record['meaning']})."
    return "abstract-concepts", f"No reliable site match; assigned to the broad concepts topic after semantic review ({record['meaning']})."


def apply_known_correction(record: dict, site_match: dict) -> tuple[str, str | None]:
    key = normalized(record["kana"])
    if key == "のーと" and site_match["topicId"] == "verbs-of-motion":
        return "school-and-education", "Corrected the site's Verbs of Motion assignment; notebook is a learning material."
    if key == "すぽーつ" and site_match["topicId"] == "school-and-education":
        return "sports-and-recreation", "Corrected the site's School & Education assignment; sports belongs in recreation."
    return site_match["topicId"], None


def read_existing_words(repo_root: Path) -> list[dict]:
    source = (repo_root / "features/kana/vocabulary.js").read_text(encoding="utf-8")
    stage_source = source.split("const WORDS =", 1)[0]
    word_pattern = re.compile(r'\["([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)"\]')
    stage_pattern = re.compile(r'\{\s*id:\s*"([^"]+)".*?words:\s*\[(.*?)\]\s*\}', re.DOTALL)
    words = []
    for stage_id, body in stage_pattern.findall(stage_source):
        words.extend(
            {"id": item[0], "japanese": item[1], "romaji": item[2], "meaning": item[3], "stageId": stage_id}
            for item in word_pattern.findall(body)
        )
    return words


def attach_existing_ids(records: list[dict], existing_words: list[dict]) -> list[str]:
    unused = []
    for existing in existing_words:
        override_order = EXISTING_ORDER_OVERRIDES.get(existing["id"])
        form = normalized(existing["japanese"])
        candidates = [r for r in records if r["order"] == override_order] if override_order else [
            r for r in records if form in {normalized(r["kana"]), normalized(r.get("kanji") or "")}
        ]
        if len(candidates) > 1:
            source_tokens = meaning_tokens(existing["meaning"])
            candidates.sort(key=lambda r: len(source_tokens & meaning_tokens(r["meaning"])), reverse=True)
        target = candidates[0] if candidates else None
        if target:
            target.setdefault("existingWordIds", []).append(existing["id"])
            target.setdefault("existingStageIds", []).append(existing["stageId"])
        else:
            unused.append(existing["id"])
    return unused


def build(pdf_path: Path, output_path: Path, repo_root: Path) -> None:
    records = extract_pdf(pdf_path)
    _, site_items = fetch_site()
    for record in records:
        site_match = select_site_match(record, site_items)
        if site_match:
            topic_id, correction_note = apply_known_correction(record, site_match)
            record["topicId"] = topic_id
            record["classificationSource"] = "site-corrected" if correction_note else "site"
            record["sourceTopicId"] = site_match["topicId"]
            record["sourceMatch"] = {
                "kanji": site_match["kanji"],
                "kana": site_match["kana"],
                "meaning": site_match["meaning"],
            }
            if correction_note:
                record["classificationNote"] = correction_note
        else:
            topic_id, note = manual_topic(record)
            record["topicId"] = topic_id
            record["classificationSource"] = "manual"
            record["sourceTopicId"] = None
            record["classificationNote"] = note

    existing_words = read_existing_words(repo_root)
    unmatched_existing = attach_existing_ids(records, existing_words)
    counts = Counter(record["classificationSource"] for record in records)
    topic_counts = Counter(record["topicId"] for record in records)
    topics = [
        {
            "id": slug,
            "label": label,
            "emoji": emoji,
            "origin": "gyanmirai",
            "sourceUrl": f"{BASE_URL}/{slug}",
            "sourcePublishedWordCount": expected,
            "recordCount": topic_counts[slug],
            "description": TOPIC_DESCRIPTIONS[slug],
        }
        for slug, label, emoji, expected in TOPICS
    ]
    topics.append({
        "id": "grammar-and-function-words",
        "label": "Grammar & Function Words",
        "emoji": "🔗",
        "origin": "curated",
        "sourceUrl": None,
        "sourcePublishedWordCount": None,
        "recordCount": topic_counts["grammar-and-function-words"],
        "description": TOPIC_DESCRIPTIONS["grammar-and-function-words"],
    })
    data = {
        "schemaVersion": 1,
        "level": "N5",
        "recordCount": len(records),
        "sources": {
            "vocabulary": {"title": "JLPT N5 Vocabulary List - 802 words", "publisher": "MLC Meguro Language Center", "entryCount": 802, "includedPages": "1-25"},
            "topics": {"name": "GyanMirai JLPT N5 Vocabulary by Topic", "url": BASE_URL, "retrievedAt": date.today().isoformat(), "publishedTopicCount": 22, "publishedAssignmentCount": sum(t[3] for t in TOPICS)},
        },
        "classificationSummary": dict(sorted(counts.items())),
        "existingVocabulary": {
            "matchedRecordCount": sum("existingWordIds" in r for r in records),
            "matchedWordIdCount": sum(len(r.get("existingWordIds", [])) for r in records),
            "unmatchedWordIds": unmatched_existing,
        },
        "scopePolicy": {
            "track": "jlpt-n5",
            "removeMatchedPracticalExtrasFromCourseTrack": True,
            "applyWhenIntegrated": True,
            "courseTrackWordIdsToMove": sorted(
                existing["id"] for existing in existing_words
                if existing["stageId"].startswith("practical-") and existing["id"] not in unmatched_existing
            ),
        },
        "topics": topics,
        "words": records,
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    repo_root = Path(__file__).resolve().parents[1]
    build(args.pdf, args.output, repo_root)


if __name__ == "__main__":
    main()

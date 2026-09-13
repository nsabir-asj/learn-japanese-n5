"""Build kana-only learning examples for the checked-in N5 vocabulary dataset."""

from __future__ import annotations

import argparse
import json
import re
import unicodedata
from pathlib import Path

import pdfplumber
import jaconv
from fugashi import Tagger


KANJI_RE = re.compile(r"[\u3400-\u4dbf\u4e00-\u9fff々〆ヵヶ]")
JAPANESE_RE = re.compile(r"[\u3040-\u30ff\u3400-\u9fff]")

# Sentences for entries whose PDF example is a list, fragment, missing, or less
# helpful than a short contextual example. The builder adds a focus value only
# when the full vocabulary form is not literally present in the sentence.
CURATED_EXAMPLES = {
    5: ("みっかかん、とうきょうにいました。", "I stayed in Tokyo for three days."),
    6: ("にかげつ、にほんごをべんきょうしました。", "I studied Japanese for two months."),
    8: ("4がつににほんへいきます。", "I will go to Japan in April."),
    9: ("こどもはこうえんであそびたがります。", "The child wants to play in the park."),
    11: ("このにもつは5キロです。", "This luggage weighs five kilograms."),
    14: ("しおを10グラムいれます。", "I add ten grams of salt."),
    15: ("りんごを3こかいました。", "I bought three apples."),
    19: ("としょかんでほんを2さつかりました。", "I borrowed two books from the library."),
    22: ("まいにち2じかんべんきょうします。", "I study for two hours every day."),
    23: ("にほんに3しゅうかんいました。", "I was in Japan for three weeks."),
    28: ("へやにパソコンが2だいあります。", "There are two computers in the room."),
    29: ("わたしたちはがくせいです。", "We are students."),
    30: ("いま、かいぎちゅうです。", "I am in a meeting now."),
    33: ("きょうはじゅうににちです。", "Today is the twelfth."),
    34: ("わたしのかぞくは4にんです。", "There are four people in my family."),
    35: ("にほんに3ねんすんでいました。", "I lived in Japan for three years."),
    36: ("コーヒーをにはいのみました。", "I drank two cups of coffee."),
    39: ("にわにねこがさんびきいます。", "There are three cats in the garden."),
    40: ("えきまでごふんかかります。", "It takes five minutes to reach the station."),
    43: ("かみを3まいください。", "Please give me three sheets of paper."),
    44: ("レッスンのまえにトイレにいきます。", "I go to the restroom before the lesson."),
    45: ("えきまで500メートルです。", "It is five hundred meters to the station."),
    46: ("ほんやでじしょをかいました。", "I bought a dictionary at a bookshop."),
    47: ("えきでともだちにあいます。", "I meet my friend at the station."),
    48: ("あおいボールペンでかきます。", "I write with a blue ballpoint pen."),
    50: ("あかいかさはわたしのです。", "The red umbrella is mine."),
    56: ("ともだちにプレゼントをあげます。", "I give a present to my friend."),
    84: ("まいあさ、えきまであるきます。", "I walk to the station every morning."),
    97: ("いちからじゅうまでかぞえます。", "I count from one to ten."),
    99: ("いちにちうちでやすみました。", "I rested at home for one day."),
    107: ("わたしはきょうだいがいます。", "I have a sibling."),
    113: ("あめですから、かさがいります。", "It is raining, so I need an umbrella."),
    121: ("カラオケでにほんのうたをうたいます。", "I sing a Japanese song at karaoke."),
    123: ("あかちゃんはらいげつうまれます。", "The baby will be born next month."),
    125: ("このみせはくだものをうります。", "This shop sells fruit."),
    147: ("さいふにおかねがありません。", "There is no money in my wallet."),
    188: ("カレンダーの「か」はかようびです。", "On a calendar, 'ka' stands for Tuesday."),
    190: ("このまちにはがいこくじんがおおぜいいます。", "Many foreigners live in this town."),
    194: ("スーパーでやさいをかいます。", "I buy vegetables at the supermarket."),
    201: ("ノートになまえをかきます。", "I write my name in the notebook."),
    206: ("ともだちにほんをかします。", "I lend a book to my friend."),
    220: ("かようびにテストがあります。", "There is a test on Tuesday."),
    223: ("としょかんでじしょをかります。", "I borrow a dictionary from the library."),
    228: ("しゅうまつのよていをかんがえます。", "I think about my weekend plans."),
    233: ("よるになると、へやのでんきがきえます。", "The room light goes out at night."),
    255: ("カレンダーの「きん」はきんようびです。", "On a calendar, 'kin' stands for Friday."),
    257: ("きんようびにともだちとあいます。", "I meet my friend on Friday."),
    258: ("でんしゃはくじにきます。", "The train comes at nine o'clock."),
    276: ("カレンダーの「げつ」はげつようびです。", "On a calendar, 'getsu' stands for Monday."),
    277: ("あねはらいねんけっこんします。", "My older sister will get married next year."),
    278: ("げつようびからしごとがはじまります。", "Work starts on Monday."),
    295: ("せんせいのしつもんにこたえます。", "I answer the teacher's question."),
    298: ("ことし、にほんへいきたいです。", "I want to go to Japan this year."),
    304: ("このしりょうをコピーします。", "I make a copy of this document."),
    305: ("みちがわからなくて、こまります。", "I am in trouble because I do not know the way."),
    316: ("あめですから、かさをさします。", "It is raining, so I put up my umbrella."),
    321: ("さらいねんににほんへいきます。", "I will go to Japan the year after next."),
    324: ("ばんごはんのあとでさんぽします。", "I take a walk after dinner."),
    325: ("しがつにがっこうがはじまります。", "School starts in April, the fourth month."),
    336: ("みずがないと、さかなはしにます。", "Fish die without water."),
    345: ("こんしゅうはとうきょうにいます。", "I am in Tokyo this week."),
    355: ("あした、テストのけっかをしります。", "I will learn the test result tomorrow."),
    358: ("カレンダーの「すい」はすいようびです。", "On a calendar, 'sui' stands for Wednesday."),
    360: ("すいようびにとしょかんへいきます。", "I go to the library on Wednesday."),
    373: ("らいねんからとうきょうにすみます。", "I will live in Tokyo starting next year."),
    375: ("ここにすわります。", "I sit here."),
    418: ("せんせいがきたので、たちます。", "I stand up because the teacher arrived."),
    420: ("ともだちとりょこうするのはたのしいです。", "Traveling with friends is fun."),
    430: ("このかばんはちいさいです。", "This bag is small."),
    434: ("えきのちかくにコンビニがあります。", "There is a convenience store near the station."),
    444: ("たくさんあるくと、つかれます。", "I get tired when I walk a lot."),
    449: ("ばんごはんをつくります。", "I make dinner."),
    451: ("ちちはぎんこうにつとめます。", "My father works for a bank."),
    460: ("にちようびにかぞくとでかけます。", "I go out with my family on Sunday."),
    485: ("どうぶつえんにいろいろなどうぶつがいます。", "There are many kinds of animals at the zoo."),
    486: ("みかんをとおください。", "Please give me ten mandarins."),
    489: ("とおかにテストがあります。", "There is a test on the tenth."),
    496: ("えきはどちらですか。", "Which way is the station?"),
    501: ("そらをとりがとびます。", "A bird flies through the sky."),
    504: ("どようびはしごとをやすみます。", "I take Saturday off work."),
    507: ("つくえのうえのペンをとります。", "I take the pen from the desk."),
    508: ("こうえんでしゃしんをとります。", "I take photographs in the park."),
    514: ("ねこが「にゃあ」となきます。", "The cat meows."),
    518: ("これはなにですか。", "What is this?"),
    519: ("なにかのみますか。", "Would you like something to drink?"),
    520: ("きょうはなのかです。", "Today is the seventh."),
    522: ("せんせいににほんごをならいます。", "I learn Japanese from a teacher."),
    523: ("いりぐちのまえにならびます。", "We line up in front of the entrance."),
    530: ("このまちはにぎやかです。", "This town is lively."),
    534: ("にちようびはうちでやすみます。", "I rest at home on Sunday."),
    553: ("へやにはいります。", "I enter the room."),
    554: ("ゆうびんきょくではがきを10まいかいました。", "I bought ten postcards at the post office."),
    563: ("バスがいしゃにでんわします。", "I call the bus company."),
    589: ("ふゆはひがみじかいです。", "The days are short in winter."),
    598: ("ひとつきにほんにいました。", "I was in Japan for one month."),
    613: ("きょうはつよいかぜがふきます。", "A strong wind blows today."),
    618: ("ふつかにテストがあります。", "There is a test on the second."),
    624: ("みじかいぶんをかいてください。", "Please write a short sentence."),
    625: ("このぶんしょうをよんでください。", "Please read this passage."),
    653: ("まいばん、ほんをよんでからねます。", "Every night, I read a book before sleeping."),
    654: ("しごとのまえにコーヒーをのみます。", "I drink coffee before work."),
    658: ("しゅくだいはまだおわっていません。", "I have not finished my homework yet."),
    684: ("たまごをむっつかいました。", "I bought six eggs."),
    689: ("たいせつなことをメモします。", "I make a note of the important point."),
    692: ("カレンダーの「もく」はもくようびです。", "On a calendar, 'moku' stands for Thursday."),
    693: ("もくようびにびょういんへいきます。", "I go to the hospital on Thursday."),
    694: ("でんわにでて「もしもし」といいます。", "I answer the phone and say 'hello.'"),
    696: ("りょこうにかさをもちます。", "I take an umbrella on the trip."),
    700: ("ともだちからてがみをもらいます。", "I receive a letter from my friend."),
    710: ("あしたはやすみです。", "Tomorrow is a holiday."),
    712: ("りんごをやっつかいました。", "I bought eight apples."),
    724: ("ケーキをよっつください。", "Please give me four cakes."),
    725: ("パーティーにともだちをよびます。", "I invite my friend to the party."),
    745: ("まいにちにほんごをれんしゅうします。", "I practise Japanese every day."),
    747: ("コーラをろっぽんください。", "Please give me six bottles of cola."),
    751: ("かさをでんしゃにわすれます。", "I forget my umbrella on the train."),
    752: ("わたくしはたなかともうします。", "I am Tanaka."),
    755: ("しんごうがあおになったら、みちをわたります。", "I cross the road when the light turns green."),
    757: ("あ、でんしゃがきました。", "Oh, the train has arrived."),
    758: ("ああ、そうですか。", "Ah, I see."),
    759: ("あの、ちょっといいですか。", "Well, may I have a moment?"),
    763: ("いえ、わたしのではありません。", "No, it is not mine."),
    767: ("うーん、まだわかりません。", "Hmm, I still do not understand."),
    768: ("え、ほんとうですか。", "Oh, is that true?"),
    769: ("ええ、だいじょうぶです。", "Yes, it is all right."),
    770: ("えー、どれにしましょうか。", "Well, which one should I choose?"),
    771: ("えっ、もうごじですか。", "What, is it already five o'clock?"),
    772: ("では、また。おげんきで。", "See you again. Take care."),
    778: ("こちらこそ、ありがとうございます。", "No, thank you."),
    779: ("ごめんください。どなたかいますか。", "Hello, is anyone home?"),
    783: ("さあ、いきましょう。", "Well then, let's go."),
    785: ("さきほどはしつれいしました。", "I am sorry for being rude earlier."),
    786: ("おさきにしつれいします。", "Excuse me for leaving before you."),
    787: ("じゃ、またあした。", "Well then, see you tomorrow."),
    790: ("えきであいましょう。そうしましょう。", "Let's meet at the station. Let's do that."),
    793: ("そうですね。きょうはさむいですね。", "That's true. It is cold today."),
    795: ("では、また。きをつけて。", "Well then, see you again. Take care."),
    796: ("「ありがとう」「どういたしまして」", "'Thank you.' 'You're welcome.'"),
    799: ("てつだってくれて、どうもありがとう。", "Thank you very much for helping me."),
    802: ("はじめまして。よろしく。", "Nice to meet you."),
}


def normalized(value: str) -> str:
    value = unicodedata.normalize("NFKC", value or "")
    return re.sub(r"[\s。、・～~（）()\[\]「」『』/／＝=….!?！？+]+", "", value)


def kana_only(value: str, converter) -> str:
    parts = []
    for item in converter(value):
        original = item.surface
        reading = item.feature.kana
        if KANJI_RE.search(original):
            if not reading:
                raise RuntimeError(f"No kana reading available for {original!r} in {value!r}")
            parts.append(jaconv.kata2hira(reading))
        else:
            parts.append(original)
    sentence = "".join(parts).replace(" ", "").strip()
    return sentence.replace("にっぽん", "にほん")


def join_source_tokens(tokens: list[dict]) -> str:
    result = ""
    previous_ascii = False
    for token in tokens:
        text = token["text"]
        ascii_word = bool(re.fullmatch(r"[A-Za-z][A-Za-z.'-]*", text))
        if result and previous_ascii and ascii_word:
            result += " "
        result += text
        previous_ascii = ascii_word
    return result


def extract_pdf_examples(pdf_path: Path) -> dict[int, tuple[str, str]]:
    examples = {}
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages[:23]:
            words = page.extract_words(use_text_flow=False, keep_blank_chars=False, extra_attrs=["fontname", "size"])
            anchors = sorted(
                [w for w in words if 50 <= w["x0"] < 70 and w["text"].isdigit() and 1 <= int(w["text"]) <= 756],
                key=lambda word: word["top"],
            )
            for index, anchor in enumerate(anchors):
                bottom = anchors[index + 1]["top"] - 5.5 if index + 1 < len(anchors) else anchor["top"] + 10
                line = sorted(
                    [w for w in words if w["x0"] >= 166 and anchor["top"] + 1 < w["top"] < bottom],
                    # Japanese and Latin fonts on the same visual baseline differ
                    # by roughly 0.4 points. Bucket by line before sorting by x.
                    key=lambda word: (round((word["top"] - anchor["top"]) / 4), word["x0"]),
                )
                japanese_indexes = [i for i, word in enumerate(line) if "MS-PGothic" in word["fontname"]]
                if not japanese_indexes:
                    continue
                boundary = max(japanese_indexes) + 1
                japanese = join_source_tokens(line[:boundary])
                english = " ".join(word["text"] for word in line[boundary:]).strip()
                examples[int(anchor["text"])] = (japanese, english)
    return examples


def read_current_examples(path: Path) -> dict[str, list[str]]:
    source = path.read_text(encoding="utf-8")
    return {
        match.group(1): json.loads(match.group(2))
        for match in re.finditer(r'^\s*"([^"]+)":\s*(\[[^\n]+\]),?$', source, re.MULTILINE)
    }


def focus_candidates(word: dict) -> list[str]:
    value = word["kana"].strip("～。、 ")
    values = [value, re.sub(r"\([^)]*\)|\[[^]]*\]", "", value)]
    values.extend(re.split(r"[/／]", values[-1]))
    values.extend(part.split("+")[0] for part in list(values))
    candidates = []
    for candidate in values:
        candidate = candidate.strip("～。、… ()[]")
        if candidate and candidate not in candidates:
            candidates.append(candidate)
    return sorted(candidates, key=len, reverse=True)


def find_focus(word: dict, sentence: str) -> str | None:
    for candidate in focus_candidates(word):
        if candidate in sentence:
            return candidate
    return None


def current_example(word: dict, current: dict[str, list[str]], converter) -> list[str] | None:
    for existing_id in word.get("existingWordIds", []):
        example = current.get(existing_id)
        if not example:
            continue
        sentence = kana_only(example[0], converter)
        focus = example[2] if len(example) > 2 else find_focus(word, sentence)
        if focus and focus in sentence:
            result = [sentence, example[1]]
            if not any(candidate in sentence for candidate in focus_candidates(word)):
                result.append(focus)
            return result
    return None


def usable_pdf_example(word: dict, raw: tuple[str, str] | None, converter) -> list[str] | None:
    if not raw:
        return None
    japanese, english = raw
    sentence = kana_only(japanese, converter)
    focus = find_focus(word, sentence)
    if not focus:
        return None
    if len(sentence) < 6 or len(sentence) > 100 or not re.search(r"[。！？]$", sentence):
        return None
    if "・・・" in sentence or "..." in english or "/" in sentence:
        return None
    if len(re.findall(r"[A-Za-z]+", english)) < 2 or not re.search(r"[.!?]$", english):
        return None
    result = [sentence, english]
    canonical = word["kana"].replace("～", "")
    if canonical not in sentence:
        result.append(focus)
    return result


def curated_example(word: dict) -> list[str] | None:
    override = CURATED_EXAMPLES.get(word["order"])
    if not override:
        return None
    sentence, english = override
    focus = find_focus(word, sentence)
    if not focus:
        raise RuntimeError(f"Curated example for {word['id']} does not contain its vocabulary focus")
    result = [sentence, english]
    if word["kana"].replace("～", "").strip("。、 ") not in sentence:
        result.append(focus)
    return result


def build(pdf_path: Path, dataset_path: Path, current_path: Path, output_path: Path) -> None:
    dataset = json.loads(dataset_path.read_text(encoding="utf-8"))
    current = read_current_examples(current_path)
    pdf_examples = extract_pdf_examples(pdf_path)
    converter = Tagger()
    examples, provenance = {}, {}
    for word in dataset["words"]:
        example = curated_example(word)
        source = "curated"
        if not example:
            example = current_example(word, current, converter)
            source = "current"
        if not example:
            example = usable_pdf_example(word, pdf_examples.get(word["order"]), converter)
            source = "pdf-adapted"
        if not example:
            raise RuntimeError(f"No helpful example available for {word['id']} ({word['kana']})")
        examples[word["id"]] = example
        provenance[word["id"]] = source

    data = {
        "schemaVersion": 1,
        "level": "N5",
        "recordCount": len(examples),
        "sentencePolicy": "Kana and katakana only; kanji is intentionally excluded.",
        "provenanceSummary": dict(sorted({kind: list(provenance.values()).count(kind) for kind in set(provenance.values())}.items())),
        "examples": examples,
        "provenance": provenance,
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", type=Path, required=True)
    parser.add_argument("--dataset", type=Path, required=True)
    parser.add_argument("--current", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    build(args.pdf, args.dataset, args.current, args.output)


if __name__ == "__main__":
    main()

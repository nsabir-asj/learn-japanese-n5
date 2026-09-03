# Kana mnemonic preferences

These are the user's preferred alternatives from the supplied
`Japanese_Kana_Mnemonic_Chart.png` (the chart credits LeafPiece). They are a
decision log and are indexed for the trainer in
`features/kana/mnemonic-preferences.json`.

## Preferred alternatives

| Kana | Preferred cue |
| --- | --- |
| え | Edge of a cliff |
| す | Soup ladle |
| せ / セ | Security guard |
| そ | Sew a stitch |
| に / ニ | Knee |
| ネ | Neck brace |
| ひ / ヒ | Heel |
| ち | Chick ("Cheep, cheep") |
| ふ | Mount Fuji |
| ユ | U-turn |
| よ | Yoga |
| り / リ | Reach high |
| ロ | Road sign |
| ナ | Knife |

The spelling “sew a stitch” is normalized from the user's “sew a stich.”

## Selected Pictografix alternatives

These are the user's selected panels from the supplied
`kanji-pictografix-download.jpg` chart. Where both scripts are listed, keep
the Hiragana and Katakana panels as separate assets with their chart-specific
captions.

| Kana | Selected cue |
| --- | --- |
| イ | Eat with chopsticks |
| エ | Elevator doors |
| き / キ | Key |
| み | Me, I'm 21 |
| も / モ | Catch mo' fish with this |
| し | She has flowing hair |
| シ | She has a funny smile |
| ス | Suit hanger |
| せ / セ | Say |
| ユ | You are number one |
| よ | Yo-yo |
| ね | Net a big fish |

The Pictografix selections are wired into the trainer's mnemonic artwork. If
the same kana has selections from both charts, both remain in the JSON and
the latest explicit selection is the active one; earlier picks remain
available as logged alternatives.

## Asset status

The supplied Tofugu originals live locally under
`assets/local-mnemonics/sources/tofugu/`. The active Tofugu fallback crops
live under `assets/local-mnemonics/tofugu/`.

All 46 Hiragana and 46 Katakana panels from the supplied LeafPiece chart are
extracted locally under `assets/local-mnemonics/leafpiece/`. The original
chart is kept under `assets/local-mnemonics/sources/leafpiece/`. The generated
cards and manifest are tracked for the private, offline-ready repository; the
original chart remains ignored.

The selected Pictografix panels are extracted locally under
`assets/local-mnemonics/pictografix/` (15 panels, each with full and visual
WebP variants). The generated panels and manifest are tracked for the private,
offline-ready repository. The original chart is kept under
`assets/local-mnemonics/sources/pictografix/` and remains ignored.

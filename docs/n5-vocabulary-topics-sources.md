# JLPT N5 vocabulary topic dataset

`content/vocabulary/n5-topics.json` is the checked-in source dataset for the JLPT N5 practice track. The vocabulary page loads a generated browser asset from this dataset and its examples.

`content/vocabulary/n5-examples.json` contains one kana-only helper sentence and English translation for every one of the 802 records. It uses the same two- or three-element array shape as the current vocabulary example registry; the optional third value identifies the exact focus text when the full stored term does not appear literally.

## Sources

- Vocabulary membership and order: MLC Meguro Language Center, *JLPT N5 Vocabulary List - 802 words*. Only the numbered English section on PDF pages 1-25 is used.
- Topic taxonomy: [GyanMirai JLPT N5 Vocabulary by Topic](https://www.gyanmirai.com/jlpt/jlpt-n5/vocabulary-topics), retrieved 2026-09-13. The 22 published topic lists contain 653 assignments in total.
- Supplemental topic: Grammar & Function Words, used only when a PDF entry has no reliable GyanMirai match and no semantic GyanMirai topic fits it.

The source PDF is intentionally not committed. Regenerate the data with the bundled Python runtime and `pdfplumber`:

```powershell
python -m pip install pdfplumber fugashi unidic-lite jaconv
```

```powershell
python scripts/build-n5-vocabulary-topics.py `
  --pdf "C:\path\to\Vocabulary_of_JLPT_N5.pdf" `
  --output "content\vocabulary\n5-topics.json"

python scripts/build-n5-vocabulary-examples.py `
  --pdf "C:\path\to\Vocabulary_of_JLPT_N5.pdf" `
  --dataset "content\vocabulary\n5-topics.json" `
  --current "features\kana\vocabulary-examples.js" `
  --output "content\vocabulary\n5-examples.json"

npm run prepare:vocabulary
```

## Record and matching rules

- All PDF numbers 1 through 802 are retained. Repeated spellings and separate senses remain separate records.
- The PDF supplies kana, optional kanji, English meaning, frequency, and ordering. Romaji is generated in the app's lowercase ASCII style, retaining written long vowels such as `ou` and `uu`.
- Website matching compares normalized kana/kanji and meaning. Polite PDF verb forms may match dictionary forms on the website when their stems and meanings agree.
- A site match normally keeps the site's topic. An obviously incorrect site assignment is changed to the most specific semantic topic and stored as `site-corrected`, with both the source topic and an explanation retained.
- Unmatched entries are marked `manual`. Their notes make the editorial decision visible. Function words use the supplemental topic only when the existing semantic topics do not fit.
- Every record has exactly one primary topic so custom topic pools can be combined and deduplicated predictably.

## Existing vocabulary and practice scopes

Exact matches and deliberate lemma/inflection matches to the original vocabulary are stored in `existingWordIds` and `existingStageIds`. The runtime reuses these stable IDs so existing learning progress remains intact.

The practice-scope design has two tracks:

- Genki II Course: the existing guided lessons and lesson-aligned topics.
- JLPT N5: all 802 records or a custom selection of N5 semantic topics.

Existing words have one progress identity even when referenced by different curricula. The JSON's `scopePolicy.courseTrackWordIdsToMove` records the 35 former Practical extras words now assigned only to the JLPT N5 track. Legacy saved Practical extras scopes migrate to JLPT N5, and legacy custom selections migrate to the corresponding N5 topics.

The 802 official source entries produce 803 practice forms because the `わかります` record deliberately preserves both existing stable forms: `wakarimasu` and `wakarimasen`. The UI states both totals where this distinction matters.

## Helper sentence policy

- Existing app examples are reused when they match the stored N5 term and already provide a clear teaching context.
- Suitable PDF examples are adapted by converting kanji to contextual kana readings while preserving katakana, numbers, and punctuation.
- Lists, fragments, ambiguous conversions, placeholders, and weak contexts are replaced with short curated examples.
- `provenance` records whether each example came from `current`, `pdf-adapted`, or `curated` content.
- Tests require exactly one example per vocabulary ID, kana/katakana-only Japanese, a matching focus term, an English translation, and no generic fallback sentence.

## Current audit totals

- 802 PDF records.
- 23 final topics: 22 GyanMirai topics plus Grammar & Function Words.
- 597 records classified from an unmodified site topic.
- 2 records with documented corrections to an obvious site misclassification.
- 203 records classified manually because there was no reliable site match.
- 121 current app vocabulary IDs linked to 120 PDF records.
- 35 current Practical extras IDs marked to move into the N5 track during later integration.
- 802 kana-only helper sentences: 114 reused current examples, 548 adapted PDF examples, and 140 curated replacements.

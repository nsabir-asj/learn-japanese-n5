# N5 kanji source audit

Checked on 2026-09-17 before building the kanji learning and practice page.

## Conclusion

Neither PDF can be confirmed as *the* official set of 100 kanji required for the current JLPT N5, because the JLPT does not publish a fixed kanji list for the post-2010 test.

- `12ab85b0934fef13.pdf` claims to contain 100 kanji, but its six tables contain **103 distinct kanji**.
- `Basic_Kanji_120_Main_book_A4.pdf` contains **120 distinct kanji**: 104 described by the booklet as prerequisites for the former Level 4 test, plus 16 additional kanji selected by MLC from past tests.
- All 103 kanji in the long article PDF are present in the 120-kanji booklet.
- The booklet has 17 kanji that are not in the article: `近 有 赤 紙 朝 昼 夕 夜 私 家 広 知 思 歩 走 住 銀`.

The extracted machine-readable lists are in `content/kanji/n5-source-lists.json`.

## Official JLPT position

The JLPT FAQ says that, after the 2010 revision, it stopped publishing “Test Content Specifications” containing vocabulary, kanji, and grammar lists. Instead, N5 is described functionally: learners should be able to read typical expressions and sentences written in hiragana, katakana, and basic kanji.

References:

- <https://www.jlpt.jp/e/faq/>
- <https://www.jlpt.jp/e/about/levelsummary.html>

## Inspection notes

The article PDF is one 750 x 28,800 point page. It was rendered and visually checked as 12 consecutive slices so that every category table could be read. Its categories contain 14 number kanji, 16 time kanji, 31 people-and-things kanji, 17 places-and-directions kanji, 15 verb kanji, and 10 adjective kanji, for a total of 103.

The 23-page MLC booklet was checked from its printed numbered list and its individual entry pages. Its own explanation ties the 104-kanji core to the pre-2010 Level 4 specification, so that description should not be presented as a current official N5 syllabus.

# Mnemonic artwork sources

This is the provenance record for the mnemonic charts used to create the
generated crops under `assets/local-mnemonics/`. The URLs document where the
source artwork came from; they do not grant redistribution rights. The
generated crops are committed for this private repository so a fresh clone
works offline; the original source charts remain local-only.

## Source registry

| Source ID | Work / credit | Origin page | Direct source image | Local original | Rights status |
| --- | --- | --- | --- | --- | --- |
| `tofugu-hiragana` | Tofugu Hiragana Mnemonic Chart — Tofugu | [Hiragana mnemonic chart](https://www.tofugu.com/japanese/hiragana-mnemonics-chart/) | [Hiragana chart image](https://files.tofugu.com/articles/japanese/2016-03-07-hiragana-mnemonics-chart/hiragana-mnemonic-chart-by-tofugu-sample.jpg) | `assets/local-mnemonics/sources/tofugu/hiragana-mnemonic-chart-by-tofugu.jpg` | Third-party artwork; local-only pending permission. |
| `tofugu-katakana` | Tofugu Katakana Mnemonic Chart — Tofugu | [Katakana chart](https://www.tofugu.com/japanese/katakana-chart/) | [Katakana chart image](https://files.tofugu.com/articles/japanese/2017-07-13-katakana-chart/tofugu-katakana-mnemonic-chart-sample.jpeg) | `assets/local-mnemonics/sources/tofugu/katakana-mnemonic-chart-by-tofugu.jpg` | Third-party artwork; local-only pending permission. |
| `leafpiece` | *Japanese Kana Mnemonic Chart* — LeafPiece (chart credit) | [Wikimedia Commons file page](https://commons.wikimedia.org/wiki/File:Japanese_Kana_Mnemonic_Chart.png) | See the Wikimedia file page for the canonical download. | `assets/local-mnemonics/sources/leafpiece/Japanese_Kana_Mnemonic_Chart.png` | Verify the file's current Wikimedia license and attribution requirements before redistribution. |
| `pictografix` | *Kanji Pict-O-Grafix* (1992) — Michael Rowley | [Tofugu Katakana chart](https://www.tofugu.com/japanese/katakana-chart/) | [Kanji Pict-O-Grafix image](https://files.tofugu.com/articles/japanese/2017-07-13-katakana-chart/kanji-pictografix.jpg) | `assets/local-mnemonics/sources/pictografix/kanji-pictografix-download.jpg` | Third-party book artwork; local-only pending permission. |

## Usage and licensing notes

- The original source charts are intentionally ignored by Git. The generated
  crops and manifests are tracked so the private repository is plug-and-run.
- Keep the repository private unless written redistribution permission or a
  clearly applicable license is available for every bundled artwork source.
- If the repository becomes public or the artwork is redistributed, update this
  document with the exact license, attribution text, and any required notice,
  and review the bundled assets before publishing.
- Runtime selection data belongs in
  `features/kana/mnemonic-preferences.json`; source URLs and rights information
  belong here rather than in that lookup index.

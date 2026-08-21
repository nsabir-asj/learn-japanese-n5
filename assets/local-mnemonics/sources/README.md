# Local mnemonic source charts

This directory is the local input area for the crop utilities. The supplied
charts are kept separate from generated per-kana assets:

- `tofugu/` — the supplied Hiragana and Katakana Tofugu charts;
- `leafpiece/` — `Japanese_Kana_Mnemonic_Chart.png`;
- `pictografix/` — `kanji-pictografix-download.jpg`.

The source files are intentionally ignored by Git. They are user-supplied or
third-party artwork, and the generated crops are derivative artwork. Keep
them on the local machine unless written redistribution permission is
available. The tracked crop scripts and application mappings remain usable
without these files because the trainer falls back to text mnemonics.

Run the crop utilities from the repository root and pass the source file from
the matching subdirectory. Generated crops and manifests stay in the sibling
source-specific directories under `assets/local-mnemonics/`.

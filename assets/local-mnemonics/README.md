# Local-only mnemonic artwork

This folder separates local source charts from the generated per-kana assets:

```text
assets/local-mnemonics/
├── sources/        original user-supplied/third-party charts (ignored)
├── tofugu/         generated 46+46 fallback cards (tracked)
├── leafpiece/      generated full/visual cards and manifest (tracked)
└── pictografix/    generated selected cards and manifest (tracked)
```

The original source chart files remain intentionally ignored by Git. The
generated crops and manifests are committed so a private clone has the artwork
needed for offline, plug-and-run use. Keep the repository private unless the
artwork's redistribution terms are confirmed. See `sources/README.md` for the
source inventory and local-use policy, and
[`docs/mnemonic-artwork-sources.md`](../../docs/mnemonic-artwork-sources.md)
for the original URLs and credits.

Generate Tofugu cards with:

```text
python scripts/crop_tofugu_mnemonics.py \
  --hiragana assets/local-mnemonics/sources/tofugu/hiragana-mnemonic-chart-by-tofugu.jpg \
  --katakana assets/local-mnemonics/sources/tofugu/katakana-mnemonic-chart-by-tofugu.jpg
```

Generate the LeafPiece and selected Pictografix cards by passing the matching
file from `assets/local-mnemonics/sources/` to their crop utilities. The
trainer uses the selected panels through
`shared/kana-mnemonic-preferences.json` and falls back to the JSON cue, then
the built-in text mnemonic, when local artwork is unavailable.

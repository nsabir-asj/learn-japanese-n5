# Local-only mnemonic artwork

Put user-supplied or otherwise authorized mnemonic chart crops in this folder.
The image files and generated manifest are ignored by Git because the Tofugu
artwork is third-party and no redistribution permission has been provided.

Generate the expected Tofugu crops under `tofugu/hiragana/` and
`tofugu/katakana/` with `scripts/crop_tofugu_mnemonics.py`. The alternate
user-supplied LeafPiece chart is extracted under `leafpiece/` with
`scripts/crop_leafpiece_mnemonics.py`; the selected panels are available to
the trainer through `shared/kana-mnemonic-preferences.json`. The selected
panels from the user-supplied
Pictografix chart are extracted under `pictografix/` with
`scripts/crop_pictografix_mnemonics.py`; they are also selected through that
index. The trainer falls back to the JSON cue, then its built-in text
mnemonic, if local artwork is unavailable.

The source-first layout is intentional: identical readings from different
charts stay separate, and each source's `manifest.json` remains beside its
artwork. All chart images and manifests are ignored by Git.

# Japanese Kana Sprint

Two offline, adaptive reading trainers for Japanese kana:

- **Hiragana Sprint** — hiragana characters, combinations, and beginner words.
- **Katakana Sprint** — katakana characters, practical combinations, and beginner words.

Both trainers share the same interface and learning system while keeping their progress separate.

## Start the trainers

No installation or web server is needed. Open either file directly in a modern browser:

- `hiragana_sprint.html`
- `katakana_sprint.html`

Keep the `shared`, `lessons`, and `fonts` folders beside the HTML files. Moving only an HTML file will prevent the trainer from loading.

## Practice modes

### Learn

Introduces rows gradually. Weak kana return more often, while successful practice unlocks later rows. Rehearsal can also unlock a row when you demonstrate that you already know every kana in it.

### Rehearse

Lets you select any rows immediately. While unassessed kana remain, the trainer favors coverage so the last few unseen kana do not get starved by reviews. Once the selected set has been fully assessed, practice becomes fully adaptive.

Recent mistakes increase the share of difficult sound categories, including voiced, semi-voiced, and combination kana. Mistake reviews are delayed enough to test recall instead of immediate repetition.

### Words

Practises whole words in romaji. A correct answer reveals the English meaning; press Enter again to continue. The word scheduler mixes new vocabulary with adaptive review and increases features that have caused recent trouble.

If Japanese speech is available in the browser, the trainer can pronounce the word and optionally its English meaning. The Speech panel reports whether suitable voices were found and includes test buttons.

### Fonts

Standard print is always enabled. Additional handwriting-style fonts can be selected for all practice modes. Harder fonts award slightly more mastery for a correct first attempt.

When a difficult-font answer is wrong, the standard form appears beside it for one more attempt. Rescue choices appear only if that comparison attempt is also wrong.

### Progress

The **Kana Progress** and **Word Progress** tabs show mastery, weak items, common confusions, font recognition, curriculum status, and word statistics.

## Answering questions

- Type the romaji reading and press **Enter**.
- After a correct word, press **Enter** again to move on.
- If rescue choices appear, click one or press **1–8**.
- Use **I don't know** when you cannot recall the answer.

Typing speed is diagnostic only. A slow correct answer does not reduce mastery, and returning after an inactivity gap is not treated as a slow response.

## Saving progress

Progress is automatically saved after answers and setting changes using the browser's local storage:

- Hiragana key: `hiragana-sprint-v3`
- Katakana key: `katakana-sprint-v1`

This data belongs to that browser and computer. It is **not** saved as a file in this project folder. Clearing browser data, using another browser, or changing how the files are opened can make the saved progress unavailable.

For a portable backup, open **Kana Progress** and select **Export progress**. This downloads a JSON file containing mastery, mistakes, confusions, settings, and rehearsal selections. Use **Import progress** in the matching trainer to restore it.

It is a good idea to export a backup occasionally.

## Speech support

Pronunciation uses the browser's built-in Web Speech API and does not require an API key. Availability depends on the browser, operating system, and installed voices.

- A local Japanese voice should work offline.
- Some voices may require an internet connection.
- If no Japanese voice is found, install a Japanese speech voice in the operating system and reopen the trainer.

## Project structure

```text
Japanese-N5-lessons/
├── hiragana_sprint.html       Hiragana launcher
├── katakana_sprint.html       Katakana launcher
├── shared/
│   ├── kana-sprint.js         Shared trainer and adaptive logic
│   └── kana-sprint.css        Shared interface styles
├── lessons/
│   ├── hiragana-data.js       Hiragana curriculum and vocabulary
│   ├── hiragana-fonts.css     Hiragana font definitions
│   ├── katakana-data.js       Katakana curriculum and vocabulary
│   └── katakana-fonts.css     Katakana font definitions
└── fonts/                     Offline font files and licences
```

The launchers deliberately use ordinary deferred scripts rather than JavaScript modules, so they continue to work when opened directly through `file://`.

## Resetting or transferring progress

- To start over, use **Reset everything** in Kana Progress.
- To move progress to another computer or browser, export the JSON backup, open the same trainer there, and import it.
- Hiragana and Katakana backups are intentionally separate.

## Font licences

Bundled practice fonts come from the Google Fonts project. Their licence files are included in the `fonts` folder.

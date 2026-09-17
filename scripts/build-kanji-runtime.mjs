import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = JSON.parse(await readFile(path.join(root, 'content', 'kanji', 'n5-kanji.json'), 'utf8'));

if (source.kanji?.length !== source.recordCount || source.recordCount !== 120) {
  throw new Error('Kanji content must contain 120 records.');
}

const runtime = `globalThis.KANA_SPRINT_KANJI = Object.freeze(${JSON.stringify(source)});\n`;
await writeFile(path.join(root, 'features', 'kanji', 'kanji-data.js'), runtime);
console.log(`Prepared ${source.recordCount} kanji for the browser.`);

import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const entrypoints = [
  'index.html',
  'hiragana_sprint.html',
  'katakana_sprint.html',
  'kana_sprint.html',
  'guided_lessons.html',
  'guided_lesson.html',
  'guided/index.html',
  'guided/player.html',
];

test('standalone HTML entrypoints only reference files that exist', () => {
  for (const entrypoint of entrypoints) {
    const htmlPath = resolve(root, entrypoint);
    const html = readFileSync(htmlPath, 'utf8');
    const references = [...html.matchAll(/(?:href|src)="(\.{1,2}\/[^"#?]+)(?:[?#][^"]*)?"/g)];

    for (const [, reference] of references) {
      const target = resolve(dirname(htmlPath), reference);
      assert.ok(existsSync(target), `${entrypoint} references missing file ${reference}`);
    }
  }
});

test('the root launcher links to every learning experience', () => {
  const html = readFileSync(resolve(root, 'index.html'), 'utf8');
  for (const target of [
    './hiragana_sprint.html',
    './katakana_sprint.html',
    './kana_sprint.html',
    './guided/index.html',
  ]) {
    assert.match(html, new RegExp(`href="${target.replace('.', '\\.')}"`));
  }
});

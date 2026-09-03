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
  'guided/player.html',
];

const stylesheetsWithLocalAssets = [
  'features/kana/hiragana-fonts.css',
  'features/kana/katakana-fonts.css',
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
    './guided/player.html?lesson=1',
  ]) {
    assert.ok(html.includes(`href="${target}"`), `root launcher does not link to ${target}`);
  }
});

test('stylesheet asset references remain valid after source moves', () => {
  for (const stylesheet of stylesheetsWithLocalAssets) {
    const cssPath = resolve(root, stylesheet);
    const css = readFileSync(cssPath, 'utf8');
    const references = [...css.matchAll(/url\(["']?(\.{1,2}\/[^"')?#]+)/g)];

    for (const [, reference] of references) {
      const target = resolve(dirname(cssPath), reference);
      assert.ok(existsSync(target), `${stylesheet} references missing file ${reference}`);
    }
  }
});

test('frontend implementation is separated into features and content', () => {
  assert.ok(existsSync(resolve(root, 'features/kana/trainer.js')));
  assert.ok(existsSync(resolve(root, 'features/guided/player.js')));
  assert.ok(existsSync(resolve(root, 'content/kana/hiragana.js')));
  assert.ok(existsSync(resolve(root, 'content/guided/lesson-01.js')));
  assert.ok(!existsSync(resolve(root, 'lessons')));
});

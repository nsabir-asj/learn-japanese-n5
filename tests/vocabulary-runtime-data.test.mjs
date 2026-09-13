import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

await import('../features/kana/vocabulary-examples.js');
await import('../features/kana/vocabulary-n5.js');

const runtime = globalThis.KANA_SPRINT_N5_VOCABULARY;
const currentExamples = globalThis.KANA_SPRINT_VOCABULARY_EXAMPLES;
const source = JSON.parse(readFileSync('content/vocabulary/n5-topics.json', 'utf8'));
const sourceExamples = JSON.parse(readFileSync('content/vocabulary/n5-examples.json', 'utf8'));

test('generated JLPT N5 runtime data stays synchronized with its source records', () => {
  assert.equal(runtime.officialEntryCount, 802);
  assert.equal(runtime.topics.length, 23);
  assert.equal(runtime.words.length, 802);
  assert.deepEqual(runtime.words.map(word => word.sourceId), source.words.map(word => word.id));
  assert.deepEqual(runtime.examples, sourceExamples.examples);
  assert.ok(runtime.topics.every(topic => topic.name && topic.description));
});

test('JLPT N5 exposes 803 stable practice forms with a helper sentence for each', () => {
  const practiceForms = runtime.words.flatMap(word => {
    const ids = word.existingWordIds.length ? word.existingWordIds : [word.sourceId];
    return ids.map(id => ({ id, sourceId: word.sourceId }));
  });
  assert.equal(practiceForms.length, 803);
  assert.equal(new Set(practiceForms.map(word => word.id)).size, 803);
  practiceForms.forEach(word => {
    assert.ok(currentExamples[word.id] || runtime.examples[word.sourceId], `${word.id} lacks an example`);
  });
  assert.deepEqual(
    runtime.words.find(word => word.sourceId === 'n5-0750').existingWordIds,
    ['wakarimasu', 'wakarimasen'],
  );
  assert.match(currentExamples.wakarimasen[0], /わかりません/);
});

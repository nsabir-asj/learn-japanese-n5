import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const vocabulary = JSON.parse(readFileSync('content/vocabulary/n5-topics.json', 'utf8'));
const exampleData = JSON.parse(readFileSync('content/vocabulary/n5-examples.json', 'utf8'));
const kanjiPattern = /[\u3400-\u4dbf\u4e00-\u9fff々〆ヵヶ]/;

test('every stored N5 vocabulary record has one complete helper sentence', () => {
  const wordIds = vocabulary.words.map(word => word.id);
  assert.equal(exampleData.schemaVersion, 1);
  assert.equal(exampleData.recordCount, 802);
  assert.deepEqual(Object.keys(exampleData.examples), wordIds);
  assert.deepEqual(Object.keys(exampleData.provenance), wordIds);

  vocabulary.words.forEach(word => {
    const example = exampleData.examples[word.id];
    assert.ok(Array.isArray(example), `${word.id} is missing an example`);
    assert.ok(example.length === 2 || example.length === 3, `${word.id} has an invalid example shape`);
    assert.ok(example[0].trim().length > 3, `${word.id} needs a Japanese sentence`);
    assert.ok(example[1].trim().length > 3, `${word.id} needs an English translation`);
    assert.doesNotMatch(example[0], kanjiPattern, `${word.id} contains kanji`);
    assert.match(example[0], /[。！？！」』]$/, `${word.id} needs terminal Japanese punctuation`);
    assert.doesNotMatch(example[0], /ということばをれんしゅうします/, `${word.id} uses a generic fallback`);
    assert.doesNotMatch(example[1], /\.\.\./, `${word.id} contains an English placeholder`);

    const expected = word.kana.replace('～', '').replace(/[。、…]+$/g, '');
    const focus = example[2] || expected;
    assert.ok(focus.length > 0, `${word.id} needs a focus term`);
    assert.ok(example[0].includes(focus), `${word.id} is not present in its example`);
    assert.ok(['current', 'pdf-adapted', 'curated'].includes(exampleData.provenance[word.id]));
  });
});

test('example provenance totals and teaching-sensitive cases remain explicit', () => {
  assert.equal(
    Object.values(exampleData.provenanceSummary).reduce((sum, count) => sum + count, 0),
    802,
  );
  for (const [kind, count] of Object.entries(exampleData.provenanceSummary)) {
    assert.equal(Object.values(exampleData.provenance).filter(value => value === kind).length, count);
  }

  assert.deepEqual(exampleData.examples['n5-0003'], [
    'わたしのへやは2かいです。',
    'My room is on the second floor.',
  ]);
  assert.deepEqual(exampleData.examples['n5-0004'], [
    'このえいがを2かいみました。',
    'I watched this movie twice.',
  ]);
  assert.notDeepEqual(exampleData.examples['n5-0507'], exampleData.examples['n5-0508']);
  assert.equal(exampleData.provenance['n5-0783'], 'curated');
  assert.ok(exampleData.examples['n5-0783'][0].includes('さあ'));
});

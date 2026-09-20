import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

await import('../features/kana/vocabulary-examples.js');

const examples = globalThis.KANA_SPRINT_VOCABULARY_EXAMPLES;
const breakdowns = globalThis.KANA_SPRINT_VOCABULARY_BREAKDOWNS;
const vocabularySource = readFileSync(resolve('features/kana/vocabulary.js'), 'utf8');
const stageSource = vocabularySource.split('const WORDS =')[0];
const wordIds = [...stageSource.matchAll(/^\s*\["([^"]+)",\s*"/gm)].map(match => match[1]);

test('every vocabulary word has a complete example sentence', () => {
  assert.equal(Object.keys(examples).length, wordIds.length);
  wordIds.forEach(id => {
    const example = examples[id];
    assert.ok(example, `${id} is missing an example`);
    assert.equal(example.length >= 2, true, `${id} needs Japanese and English`);
    assert.ok(example[0].trim().length > 2, `${id} needs a Japanese sentence`);
    assert.ok(example[1].trim().length > 2, `${id} needs an English translation`);
  });
});

test('each example contains the vocabulary term or its declared focus text', () => {
  const wordTerms = new Map(
    [...stageSource.matchAll(/^\s*\["([^"]+)",\s*"([^"]+)"/gm)]
      .map(match => [match[1], match[2].replace('～', '')]),
  );
  wordIds.forEach(id => {
    const [sentence, , focus] = examples[id];
    assert.ok(sentence.includes(focus || wordTerms.get(id)), `${id} is not present in its example`);
  });
});

test('Genki Lesson 3 examples have authored sentence breakdowns', () => {
  const lesson3Source = stageSource.slice(stageSource.indexOf('id: "lesson3-'), stageSource.indexOf('id: "lesson4-'));
  const directIds = [...lesson3Source.matchAll(/^\s*\["([^"]+)",/gm)].map(match => match[1]);
  const reusedIds = [...lesson3Source.matchAll(/reusedWordIds:\s*\[([^\]]+)\]/g)]
    .flatMap(match => [...match[1].matchAll(/"([^"]+)"/g)].map(idMatch => idMatch[1]));
  [...new Set([...directIds, ...reusedIds])].forEach(id => {
    const breakdown = breakdowns[id];
    assert.ok(breakdown, `${id} needs a sentence breakdown`);
    assert.ok(breakdown[0].length >= 2, `${id} needs meaningful sentence parts`);
    assert.ok(breakdown[1].trim().length > 10, `${id} needs a structure note`);
    breakdown[0].forEach(part => assert.equal(part.length >= 3, true, `${id} has an incomplete sentence part`));
    const sentenceText = examples[id][0].replace(/[、。！？]/g, '');
    const breakdownText = breakdown[0].map(part => part[0]).join('');
    assert.equal(breakdownText, sentenceText, `${id} breakdown must cover the complete sentence`);
  });
});

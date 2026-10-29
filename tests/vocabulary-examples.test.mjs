import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';

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

test('Lesson 4 particle explanations use contextual roles and compact markup', () => {
  const functions = vocabularySource.slice(vocabularySource.indexOf('  function escapeExampleText('), vocabularySource.indexOf('  function sentenceChunkLabels('));
  const context = {
    PARTICLE_READINGS: { 'は': 'wa', 'を': 'o / wo', 'へ': 'e', 'の': 'no', 'が': 'ga', 'に': 'ni', 'で': 'de', 'と': 'to', 'か': 'ka', 'から': 'kara', 'まで': 'made' },
  };
  runInNewContext(functions, context);
  const guide = id => context.particleGuideMarkup(breakdowns[id][0]);
  assert.match(guide('inu'), /where someone or something is/);
  assert.match(guide('shashin'), /where the action happens/);
  assert.match(guide('aida'), /Joins えき and こうえん as a pair/);
  assert.match(guide('geemu'), /who joins in the action/);
  assert.match(guide('migi'), /corner turned at, not an object/);
  assert.match(guide('kaku'), /surface written on/);
  assert.match(guide('kurasu'), /kara/);
  assert.match(guide('suffix-gurai'), /made/);
  assert.match(guide('sorekara'), /あさごはん: the direct object of the action/);
  assert.equal(guide('gomen-nasai'), '');
  for (const [id, [parts]] of Object.entries(breakdowns)) {
    for (const part of parts) {
      assert.ok(part.slice(0, 3).every(value => typeof value === 'string' && value.trim()), `${id}: empty chunk`);
      if (part[3] === 'particle') {
        assert.ok(context.PARTICLE_READINGS[part[0]] || part[0] === 'ね', `${id}: missing particle reading`);
      }
    }
  }
  const markup = guide('anata');
  assert.match(markup, /Pronounced wa/);
  assert.doesNotMatch(markup, /<em>/);
  assert.match(markup, /class="vocab-particle-explanation"/);
  assert.doesNotMatch(markup, /<p>|<small>/);
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

for (const lesson of [3, 4]) test(`Genki Lesson ${lesson} examples have authored sentence breakdowns`, () => {
  const lesson3Source = stageSource.slice(stageSource.indexOf(`id: "lesson${lesson}-`), stageSource.indexOf(`id: "lesson${lesson + 1}-`));
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

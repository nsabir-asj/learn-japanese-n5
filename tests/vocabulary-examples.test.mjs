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

test('inline particle labels reset page-header margins so wrapped lines stay compact', () => {
  const styles = readFileSync(resolve('features/kana/vocabulary.css'), 'utf8');
  const inlineLabel = [...styles.matchAll(/\.vocab-particle-card header\{([^}]+)\}/g)].at(-1)?.[1];
  assert.ok(inlineLabel);
  assert.match(inlineLabel, /margin:0(?:;|$)/);
  assert.match(inlineLabel, /padding:0(?:;|$)/);
  assert.match(inlineLabel, /vertical-align:baseline(?:;|$)/);
  assert.match(inlineLabel, /line-height:inherit(?:;|$)/);
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

test('dictionary-form vocabulary uses polite nonpast example verbs with matching form notes', () => {
  const expected = {
    kiku: ['きく', 'ききます'], hanasu: ['はなす', 'はなします'], yomu: ['よむ', 'よみます'],
    okiru: ['おきる', 'おきます'], neru: ['ねる', 'ねます'], miru: ['みる', 'みます'],
    suru: ['する', 'します'], 'benkyou-suru': ['べんきょうする', 'べんきょうします'],
    au: ['あう', 'あいます'], aru: ['ある', 'あります'], kau: ['かう', 'かいます'],
    kaku: ['かく', 'かきます'], toru: ['とる', 'とります'], matsu: ['まつ', 'まちます'],
    iru: ['いる', 'います'], wakaru: ['わかる', 'わかります'], iku: ['いく', 'いきます'],
    kuru: ['くる', 'きます'], kaeru: ['かえる', 'かえります'],
    taberu: ['たべる', 'たべます'], nomu: ['のむ', 'のみます'],
  };
  for (const [id, [base, polite]] of Object.entries(expected)) {
    assert.ok(stageSource.includes(`["${id}", "${base}"`), `${id}: dictionary-form entry must remain unchanged`);
    assert.ok(examples[id][0].endsWith(polite + '。'), id);
    assert.equal(examples[id][2], polite, `${id}: highlight must use the actual sentence form`);
    const ending = breakdowns[id][0].at(-1);
    assert.equal(ending[0], polite, id);
    assert.equal(ending[4], `Polite nonpast of ${base}.`, id);
    assert.doesNotMatch(breakdowns[id][1], /plain form|casual/);
  }
});

test('past, negative, invitation and request labels keep their distinct meanings', () => {
  const note = (id, form) => breakdowns[id][0].find(part => part[0] === form)?.[4];
  assert.equal(note('honya', 'かいました'), 'Polite past of かう.');
  assert.equal(note('kinou', 'みました'), 'Polite past of みる.');
  assert.equal(note('osake', 'のみません'), 'Polite negative nonpast of のむ.');
  assert.equal(note('ocha', 'のみませんか'), 'Polite invitation from のむ.');
  assert.equal(note('hoteru', 'あいましょう'), 'Polite suggestion from あう: let’s meet.');
  assert.equal(note('migi', 'まがってください'), 'Polite request from まがる.');
  for (const id of ['honya', 'senshuu', 'kinou', 'hitoride', 'suffix-jikan']) {
    assert.match(examples[id][0], /ました/);
  }
  assert.match(examples.neru[1], /will/);
  assert.match(examples.kuru[1], /will/);
});

test('verb-form notes render inside their own chunks and are escaped', () => {
  const functions = vocabularySource.slice(vocabularySource.indexOf('  function sentenceChunkLabels('), vocabularySource.indexOf('  function exampleBreakdownMarkup('));
  const context = { escapeExampleText: value => String(value).replaceAll('<', '&lt;').replaceAll('>', '&gt;') };
  runInNewContext(functions, context);
  const markup = context.sentenceChunksMarkup(examples.nomu[0], breakdowns.nomu[0]);
  assert.match(markup, /のみます。<\/strong><small>drink<\/small><span class="vocab-verb-form">Polite nonpast of のむ\.<\/span>/);
  assert.match(context.sentenceChunksMarkup('きます。', [['きます', 'come', 'Movement', undefined, '<test>']]), /&lt;test&gt;/);
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

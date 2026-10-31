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

test('compact verb buttons keep group and time visible while details live in a dialog', () => {
  const functions = vocabularySource.slice(vocabularySource.indexOf('  function verbExplanationMarkup('), vocabularySource.indexOf('  function exampleBreakdownMarkup('));
  const context = { escapeExampleText: value => String(value).replaceAll('<', '&lt;').replaceAll('>', '&gt;') };
  runInNewContext(functions, context);
  const markup = context.sentenceChunksMarkup(examples.nomu[0], breakdowns.nomu[0]);
  assert.match(markup, /<button type="button" class="vocab-sentence-chunk vocab-verb-card" data-verb-part="3" aria-haspopup="dialog"/);
  const summary = markup.match(/<button[^>]+vocab-verb-card[^>]*>(.*?)<\/button>/s)[1];
  assert.match(summary, /のみます。<\/strong>/);
  assert.match(summary, /class="vocab-verb-time" title="A regular activity">Present<\/span>/);
  assert.match(summary, /<small>drink<span class="vocab-verb-group"> · u-verb<\/span>/);
  assert.doesNotMatch(summary, /Dictionary:|Rule:|This verb:|Here:|nonpast|Habit \/ routine/);
  assert.match(summary, /class="vocab-verb-info" aria-hidden="true">i<\/span>/);
  const explanation = context.verbExplanationMarkup('のみます', breakdowns.nomu[0].at(-1)[5]);
  assert.match(explanation, /id="vocabVerbDialogTitle" lang="ja">のむ → のみます/);
  assert.match(explanation, /Polite affirmative/);
  assert.match(explanation, /General rule<\/h3><p>Change the final u-row kana to its i-row equivalent, then add ます/);
  assert.match(explanation, /This verb<\/h3><p>Change む to み/);
  assert.match(explanation, /Meaning here <span>Present<\/span><\/h3><p>あさ/);
  assert.match(breakdowns.nomu[0].at(-1)[5].rule, /Change む to み/);
  assert.match(breakdowns.mizu[0].at(-1)[5].rule, /まいあさ/);
  assert.doesNotMatch(markup, /<details|vocab-verb-chevron|General rule|This verb|Meaning here/);
  assert.match(context.sentenceChunksMarkup('きます。', [['きます', 'come', 'Movement', undefined, '<test>']]), /&lt;test&gt;/);
  const unsafe = { ...breakdowns.nomu[0].at(-1)[5], generalRule: '<unsafe>', transformation: '<change>', timing: '<time>' };
  const escaped = context.verbExplanationMarkup('のみます', unsafe);
  for (const value of ['unsafe', 'change', 'time']) assert.ok(escaped.includes(`&lt;${value}&gt;`));
});

test('general conjugation rules match the verb group and actual sentence ending', () => {
  const info = (id, form) => breakdowns[id][0].find(part => part[0] === form)[5];
  assert.equal(info('nomu', 'のみます').generalRule, 'Change the final u-row kana to its i-row equivalent, then add ます.');
  assert.equal(info('taberu', 'たべます').generalRule, 'Remove final る from the dictionary form, then add ます.');
  assert.match(info('kuru', 'きます').generalRule, /irregular stem き for くる/);
  assert.match(info('benkyou-suru', 'べんきょうします').generalRule, /irregular stem し for する/);
  assert.match(info('kaeru', 'かえります').generalRule, /i-row equivalent/);
  assert.match(info('osake', 'のみません').generalRule, /add ません\./);
  assert.match(info('kinou', 'みました').generalRule, /Remove final る.*add ました\./);
  assert.match(info('ocha', 'のみませんか').generalRule, /add ませんか\./);
  assert.match(info('hoteru', 'あいましょう').generalRule, /add ましょう\./);
  assert.match(info('migi', 'まがってください').generalRule, /ending in う, つ or る.*って.*ください/);
  assert.match(info('migi', 'まがってください').transformation, /まがって \+ ください/);
  assert.equal(info('nomu', 'のみます').timeLabel, 'Present');
  assert.equal(info('neru', 'ねます').timeLabel, 'Future');
  assert.equal(info('kinou', 'みました').timeLabel, 'Past');
  assert.equal(info('shashin', 'とります').timeLabel, 'Present / future');
  assert.equal(info('ocha', 'のみませんか').timeLabel, 'Invitation');
  assert.equal(info('migi', 'まがってください').timeLabel, 'Request');
});

test('verb explanations use checked groups, actual stems and sentence-specific time meanings', () => {
  const info = (id, form) => breakdowns[id][0].find(part => part[0] === form)[5];
  assert.equal(info('kaeru', 'かえります').group, 'u-verb');
  assert.equal(info('iru', 'います').group, 'ru-verb');
  assert.equal(info('okiru', 'おきます').group, 'ru-verb');
  assert.equal(info('kuru', 'きます').group, 'irregular');
  assert.equal(info('benkyou-suru', 'べんきょうします').dictionary, 'べんきょうする');
  assert.match(info('benkyou-suru', 'べんきょうします').rule, /べんきょうし \+ ます/);
  assert.equal(info('mizu', 'のみます').usage, 'Habit / routine');
  assert.equal(info('neru', 'ねます').usage, 'Future plan');
  assert.equal(info('inu', 'います').usage, 'Present state');
  assert.equal(info('kinou', 'みました').usage, 'Past action');
  assert.equal(info('getsuyoubi', 'あります').usage, 'Scheduled event');
  assert.equal(info('shashin', 'とります').usage, 'Timing unspecified');
  assert.match(info('shashin', 'とります').rule, /context decides/);
  assert.match(info('ocha', 'のみませんか').rule, /invite someone/);
  assert.match(info('migi', 'まがってください').rule, /る → って/);
  for (const [id, [parts]] of Object.entries(breakdowns)) for (const part of parts) {
    if (!part[4]) continue;
    assert.ok(part[5], `${id}: missing expanded explanation`);
    for (const field of ['dictionary', 'group', 'form', 'usage', 'rule', 'generalRule', 'transformation', 'timing', 'timeLabel']) assert.ok(part[5][field]?.trim(), `${id}: ${field}`);
    assert.ok(part[5].rule.includes(part[0]), `${id}: explanation must use the actual sentence form`);
  }
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

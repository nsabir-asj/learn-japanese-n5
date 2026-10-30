import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createContext, runInContext } from 'node:vm';

const source = readFileSync(new URL('../features/kana/vocabulary.js', import.meta.url), 'utf8');
function choicesPage() {
  const page = createContext({
    state: { items: {}, choiceCount: '8' }, currentMode: 'written',
    Scheduler: { choiceCountForMastery: () => 8 },
    progress: { recentDistractors: [], confusions: {} },
    itemState() { return this.progress; },
    modeState: () => ({ mastery: 95 }),
    shuffle: values => values.slice().reverse(),
  });
  runInContext('globalThis.window = globalThis;', page);
  for (const file of ['vocabulary-speaking.js', 'vocabulary-n5.js']) {
    runInContext(readFileSync(new URL(`../features/kana/${file}`, import.meta.url), 'utf8'), page);
  }
  runInContext(source.slice(source.indexOf('  const STORAGE_KEY'), source.indexOf('  const $ =')), page);
  // Normal functions are used rather than duplicated selection logic.
  for (const name of ['choiceCountFor', 'editSimilarity', 'sharedContrastGroups', 'distractorScore',
    'choiceReadings', 'choiceMeanings', 'choicesOverlap', 'choiceGrammar', 'makeChoices']) {
    const start = source.indexOf(`  function ${name}(`);
    const end = source.indexOf('\n  function ', start + 1);
    assert.ok(start >= 0, name);
    runInContext(source.slice(start, end), page);
  }
  runInContext('globalThis.words = WORDS; globalThis.groups = CLOSE_CHOICE_GROUPS;', page);
  page.itemState = () => page.progress;
  page.word = id => { const word = page.words.find(word => word.id === id); assert.ok(word, id); return word; };
  return page;
}

test('every authored close-choice family refers to real, distinct vocabulary', () => {
  const page = choicesPage();
  for (const group of page.groups) {
    assert.ok(group.length >= 2);
    assert.equal(new Set(group).size, group.length);
    for (const id of group) page.word(id);
  }
});

test('weekdays remain weekdays at every choice count and format, even after recent repeats', () => {
  const page = choicesPage();
  const days = ['getsuyoubi', 'kayoubi', 'suiyoubi', 'mokuyoubi', 'kinyoubi', 'doyoubi', 'nichiyoubi'];
  page.progress.recentDistractors = days.flatMap(id => [id, id, id]);
  page.progress.confusions = { geemu: 100, neko: 100 };
  for (const format of ['written', 'spoken', 'recall']) for (const count of [4, 6, 8]) {
    page.state.choiceCount = String(count);
    const target = page.word('kinyoubi');
    const before = JSON.stringify(page.state);
    const result = page.makeChoices(target, format);
    assert.equal(result.length, Math.min(count, 7));
    assert.equal(result.filter(word => word.id === target.id).length, 1);
    assert.ok(result.every(word => days.includes(word.id)));
    assert.equal(JSON.stringify(page.state), before, 'Choices must not change scheduling or progress');
  }
});

test('small semantic sets are not padded with unrelated answers', () => {
  const page = choicesPage();
  for (const [target, count, allowed] of [
    ['n5-0578', 4, ['n5-0053', 'n5-0515', 'n5-0578', 'n5-0620']],
    ['konshuu', 3, ['senshuu', 'konshuu', 'raishuu']],
    ['nihongo', 2, ['nihongo', 'eigo']],
    ['akeru', 2, ['akeru', 'shimeru']],
  ]) {
    const result = page.makeChoices(page.word(target), 'written');
    assert.equal(result.length, count, target);
    assert.ok(result.every(word => allowed.includes(word.id)), target);
  }
});

test('activities and Lesson 4 places do not fall back to unrelated generic nouns', () => {
  const page = choicesPage();
  const activities = ['geemu', 'tenisu', 'saafin', 'kaimono', 'ryokou'];
  const game = page.makeChoices(page.word('geemu'), 'written');
  assert.equal(game.length, 5);
  assert.ok(game.every(word => activities.includes(word.id)));
  const park = page.makeChoices(page.word('kouen'), 'written');
  assert.equal(park.length, 8);
  assert.ok(park.every(word => page.groups.some(group => group.includes('kouen') && group.includes(word.id))));
});

test('homophones and overlapping English meanings cannot compete as wrong answers', () => {
  const page = choicesPage();
  assert.equal(page.choicesOverlap(page.word('atsui-weather'), page.word('atsui-object')), true);
  assert.equal(page.choicesOverlap(page.word('kiku'), page.word('kiku-ask')), true);
  assert.equal(page.choicesOverlap({jp:'わかる', meaning:'to understand', n5SourceId:'same-source'},
    {jp:'わかります', meaning:'I understand', n5SourceId:'same-source'}), true);
  assert.equal(page.choicesOverlap({jp:'いえ', meaning:'house / home'}, {jp:'うち', meaning:'home'}), true);
  assert.equal(page.choicesOverlap({jp:'キロ', meaning:'kilogram'}, {jp:'きろ', meaning:'kilometer'}), true);
  assert.equal(page.choicesOverlap(page.word('ohayou'), page.word('ohayou-gozaimasu')), false);
  for (const id of ['atsui-weather', 'kiku', 'kau', 'nihongo', 'n5-0097', 'n5-0048', 'mae']) {
    for (const format of ['written', 'spoken', 'recall']) {
      const result = page.makeChoices(page.word(id), format);
      for (let i = 0; i < result.length; i++) for (let j = i + 1; j < result.length; j++) {
        assert.equal(page.choicesOverlap(result[i], result[j]), false, `${id}: ${result[i].id} / ${result[j].id}`);
      }
    }
  }
});

test('fallback choices match the target grammar rather than mixing verbs with nouns', () => {
  const page = choicesPage();
  for (const id of ['kaku', 'tetsudau', 'taberu', 'yasumu']) {
    const target = page.word(id);
    const result = page.makeChoices(target, 'recall');
    assert.ok(result.length >= 4);
    assert.ok(result.every(word => page.choiceGrammar(word) === 'verb'), id);
  }
});

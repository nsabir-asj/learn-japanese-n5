import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const context = vm.createContext({ window: {} });
vm.runInContext(read('features/kana/vocabulary-speaking.js'), context);
vm.runInContext(read('features/guided/answers.js'), context);
vm.runInContext(read('content/guided/lesson-03.js'), context);
const { hiraganaPreview, matches } = context.GUIDED_ANSWERS;

test('the live preview converts every Lesson 3 verb form without looking up the correct answer', () => {
  for (const verb of context.window.GUIDED_LESSONS['3'].verbs) {
    assert.equal(hiraganaPreview(`${verb.romajiStem}masu`), verb.affirmative);
    assert.equal(hiraganaPreview(`${verb.romajiStem}masen`), verb.negative);
  }
  assert.equal(hiraganaPreview('okirimasu'), 'おきります', 'show the actual incorrect form, not an answer hint');
});

test('partial syllables update as typed and support long vowels, doubled consonants and syllabic n', () => {
  for (const [input, expected] of [
    ['s', 's'], ['sh', 'sh'], ['shi', 'し'], ['shim', 'しm'], ['shima', 'しま'],
    ['shimas', 'しまs'], ['shimasu', 'します'], ['shimasen', 'しません'],
    ['benkyōshimasu', 'べんきょうします'], ['kitte', 'きって'], ["kan'i", 'かんい'], ['kan’i', 'かんい'],
  ]) assert.equal(hiraganaPreview(input), expected, input);
});

test('preview preserves Japanese text and separators while handling uppercase and full-width romaji', () => {
  assert.equal(hiraganaPreview(' BENKYOUSHIMASU '), ' べんきょうします ');
  assert.equal(hiraganaPreview('ｋａｅｒｉｍａｓｅｎ'), 'かえりません');
  assert.equal(hiraganaPreview('べんkyoushimasu。'), 'べんきょうします。');
  assert.equal(hiraganaPreview('hon wo yomimasu'), 'ほん を よみます');
  for (const input of ['', '   ', '9:00', 'のみます', '飲みます']) assert.equal(hiraganaPreview(input), '');
});

test('preview does not change grading and the shared converter loads before preview code', () => {
  const activity = context.window.GUIDED_LESSONS['3'].stages[0].activities.find(item => item.id === 'verb-okiru-affirmative');
  assert.equal(hiraganaPreview('okirimasu'), 'おきります');
  assert.equal(matches(activity, 'okirimasu'), false);
  assert.equal(matches(activity, 'okimasu'), true);
  const html = read('guided/player.html');
  assert.ok(html.indexOf('vocabulary-speaking.js') < html.indexOf('answers.js'));
});

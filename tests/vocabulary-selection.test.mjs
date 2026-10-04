import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createContext, runInContext } from 'node:vm';

await import('../features/kana/vocabulary-scheduler.js');
const source = readFileSync(new URL('../features/kana/vocabulary.js', import.meta.url), 'utf8');

// Exercise the page's actual selection and result logic with its real vocabulary,
// without mounting the unrelated UI or starting microphone capture.
function pageFunction(name) {
  const start = source.indexOf(`  function ${name}(`);
  assert.ok(start >= 0, `Missing page function ${name}`);
  const end = source.indexOf('\n  function ', start + 1);
  return source.slice(start, end < 0 ? source.length : end);
}

function practice(scope = 'lesson3', size) {
  const page = createContext({
    state: {
      items: {}, total: 100, correct: 80, streak: 0, bestStreak: 0,
      recent: [], practiceScope: scope, questionFormat: 'speaking',
      customStageIds: [], pace: 50, newWordCredit: 0,
    },
    Scheduler: {
      ...globalThis.KANA_SPRINT_VOCABULARY_SCHEDULER,
      reviewScore: progress => globalThis.KANA_SPRINT_VOCABULARY_SCHEDULER.reviewScore(progress, 0),
    },
    sessionReviewCounts: new Map(),
    MODE_KEYS: ['written', 'spoken', 'recall', 'speaking'],
    UNIFIED_REVIEW_MODEL: 'unified-v1',
    clamp: (value, low, high) => Math.max(low, Math.min(high, value)),
    currentChoiceIds: [], currentMode: 'speaking', current: null,
    saveState() {}, modeLabel: mode => mode,
    allowedModes: () => ['speaking'],
    unlockedStageIndex: () => 0, unlockedN5StageIndex: () => 0,
    lastRegularScope: scope,
  });
  runInContext('globalThis.window = globalThis;', page);
  for (const file of ['vocabulary-speaking.js', 'vocabulary-n5.js']) {
    runInContext(readFileSync(new URL(`../features/kana/${file}`, import.meta.url), 'utf8'), page);
  }
  const vocabularyDefinitions = source.slice(source.indexOf('  const STORAGE_KEY'), source.indexOf('  const CONTRAST_GROUPS'));
  runInContext(vocabularyDefinitions, page);
  for (const name of [
    'emptyModeProgress', 'itemState', 'modeState', 'scopeSelectionKey',
    'wordIsDue', 'urgentReviewEntries', 'chooseMode', 'selectWord',
    'reviewCountsForSelection', 'leastPracticedWords', 'selectReviewWord',
    'selectReviewEntry', 'applyResult',
  ]) runInContext(pageFunction(name), page);
  runInContext(`
    globalThis.scopeWords = WORDS.filter(word => ${scope === 'n5'
      ? 'word.tracks.includes("n5")'
      : `word.stageIds.some(id => id.startsWith("${scope}-"))`});
  `, page);
  if (size) page.scopeWords = page.scopeWords.slice(0, size);
  page.wordsForScope = () => page.scopeWords;
  page.introducedWords = () => page.scopeWords.filter(word => page.itemState(word).introduced);
  page.stageWords = page.wordsForScope;
  page.n5StageWords = page.wordsForScope;
  for (const [index, word] of page.scopeWords.entries()) {
    Object.assign(page.itemState(word), {
      introduced: true, seen: 10, correct: 10, mastery: index < 6 ? 20 : 95,
      lastWasCorrect: true, dueQuestion: index < 6 ? 100 : 114, dueAt: Date.now() + 86400000,
    });
    Object.assign(page.modeState(word, 'speaking'), { seen: 10, correct: 10, mastery: 20 });
  }
  page.complete = (selected, correct = true, typed = false) => {
    page.current = selected.word;
    page.currentMode = typed ? 'recall' : selected.mode;
    page.applyResult(correct, correct ? selected.word.id : '', typed);
  };
  return page;
}

test('Genki lessons and N5 cover every introduced word before normal repeats', () => {
  for (const scope of ['lesson1', 'lesson2', 'lesson3', 'lesson4', 'lesson5', 'lesson6', 'n5']) {
    const page = practice(scope);
    assert.ok(page.scopeWords.length > 0, scope);
    const seen = new Set();
    for (let index = 0; index < page.scopeWords.length; index++) {
      const selected = page.selectWord();
      assert.equal(selected.introduce, false);
      assert.equal(seen.has(selected.word.id), false, `${scope}: premature repeat of ${selected.word.id}`);
      seen.add(selected.word.id);
      page.complete(selected);
    }
    assert.equal(seen.size, page.scopeWords.length);
  }
});

test('one mistake gets an early retry without starving the rest of Lesson 3', () => {
  const page = practice('lesson3');
  const missed = page.selectWord();
  page.complete(missed, false);
  const counts = new Map([[missed.word.id, 1]]);
  let earlyRetry = false;
  for (let index = 0; index < page.scopeWords.length; index++) {
    const selected = page.selectWord();
    earlyRetry ||= selected.word.id === missed.word.id && selected.reason === 'Urgent review';
    counts.set(selected.word.id, (counts.get(selected.word.id) || 0) + 1);
    page.complete(selected);
  }
  assert.equal(earlyRetry, true);
  assert.equal(counts.size, page.scopeWords.length);
  assert.equal(counts.get(missed.word.id), 2);
});

test('repeated failures cannot monopolize practice before the other words get a turn', () => {
  const page = practice('lesson3');
  const missed = page.selectWord();
  page.complete(missed, false);
  const seen = new Set([missed.word.id]);
  let repeats = 0;
  while (seen.size < page.scopeWords.length) {
    const selected = page.selectWord();
    if (selected.word.id === missed.word.id) repeats++;
    assert.ok(repeats <= 1, 'Repeated urgent retries blocked lesson coverage');
    seen.add(selected.word.id);
    page.complete(selected, selected.word.id !== missed.word.id);
  }
});

test('a correct typed fallback clears a speaking retry but does not award speaking progress', () => {
  const page = practice('lesson3');
  const selected = page.selectWord();
  page.complete(selected, false);
  const speaking = { ...page.modeState(selected.word, 'speaking') };
  page.complete(selected, true, true);
  const progress = page.itemState(selected.word);
  assert.equal(progress.urgentRetryPending, false);
  assert.equal(progress.urgentMode, '');
  assert.equal(progress.dueQuestion, page.state.total + 4);
  assert.equal(progress.modes.recall.correct, 1);
  assert.equal(progress.modes.speaking.correct, speaking.correct);
  assert.equal(progress.modes.speaking.mastery, speaking.mastery);
  assert.equal(progress.modes.speaking.seen, speaking.seen);
});

test('saved stuck retries are repaired, while unresolved speaking mistakes stay pending', () => {
  const page = practice('lesson3');
  const word = page.scopeWords[0];
  const progress = page.itemState(word);
  Object.assign(progress, { urgentRetryPending: true, urgentMode: 'speaking', lastMode: 'speaking', lastWasCorrect: false });
  assert.equal(page.itemState(word).urgentRetryPending, true);
  Object.assign(progress, { lastMode: 'recall', lastWasCorrect: true });
  assert.equal(page.itemState(word).urgentRetryPending, false);
  const due = progress.dueQuestion;
  page.state.total += 1;
  assert.equal(page.itemState(word).dueQuestion, due, 'Repair should run only once');
});

test('coverage continues over multiple rounds, small pools, and format changes', () => {
  for (const size of [1, 2, 5, 20]) {
    const page = practice('lesson3', size);
    const counts = new Map();
    for (let index = 0; index < size * 3; index++) {
      const selected = page.selectWord();
      counts.set(selected.word.id, (counts.get(selected.word.id) || 0) + 1);
      page.complete(selected);
    }
    assert.deepEqual([...counts.values()], Array(size).fill(3));
    page.state.questionFormat = 'recall';
    assert.equal(page.reviewCountsForSelection().size, 0);
    page.state.questionFormat = 'speaking';
    assert.equal(page.reviewCountsForSelection().size, size);
  }
});

test('new-word introductions keep their pace and uncompleted introductions are checked first', () => {
  const page = practice('lesson3', 5);
  const newWord = page.scopeWords.at(-1);
  Object.assign(page.itemState(newWord), { introduced: false, seen: 0 });
  page.state.pace = 50;
  page.state.newWordCredit = 0;
  const review = page.selectWord();
  assert.equal(review.introduce, false);
  page.complete(review);
  const introduction = page.selectWord();
  assert.equal(introduction.word.id, newWord.id);
  assert.equal(introduction.introduce, true);
  page.itemState(newWord).introduced = true;
  const check = page.selectWord();
  assert.equal(check.word.id, newWord.id);
  assert.equal(check.introduce, false);
});

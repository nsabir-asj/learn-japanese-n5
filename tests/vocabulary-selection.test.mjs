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
    'reviewCountsForSelection', 'balancedReviewPool', 'selectReviewWord',
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

test('Genki lessons and N5 retain bounded coverage while adapting review frequency', () => {
  for (const scope of ['lesson1', 'lesson2', 'lesson3', 'lesson4', 'lesson5', 'lesson6', 'n5']) {
    const page = practice(scope);
    assert.ok(page.scopeWords.length > 0, scope);
    const seen = new Set();
    for (let index = 0; index < page.scopeWords.length * 3 && seen.size < page.scopeWords.length; index++) {
      const selected = page.selectWord();
      assert.equal(selected.introduce, false);
      seen.add(selected.word.id);
      page.complete(selected);
    }
    assert.equal(seen.size, page.scopeWords.length, `${scope}: neglected vocabulary`);
  }
});

test('one mistake gets an early retry without starving the rest of Lesson 3', () => {
  const page = practice('lesson3');
  const missed = page.selectWord();
  page.complete(missed, false);
  const counts = new Map([[missed.word.id, 1]]);
  let earlyRetry = false;
  for (let index = 0; index < page.scopeWords.length * 3 && counts.size < page.scopeWords.length; index++) {
    const selected = page.selectWord();
    earlyRetry ||= selected.word.id === missed.word.id && selected.reason === 'Urgent review';
    counts.set(selected.word.id, (counts.get(selected.word.id) || 0) + 1);
    page.complete(selected);
  }
  assert.equal(earlyRetry, true);
  assert.equal(counts.size, page.scopeWords.length);
  assert.ok(counts.get(missed.word.id) >= 2);
});

test('repeated failures cannot monopolize practice before the other words get a turn', () => {
  const page = practice('lesson3');
  const missed = page.selectWord();
  page.complete(missed, false);
  const seen = new Set([missed.word.id]);
  let attempts = 1;
  let lastMiss = 0;
  while (seen.size < page.scopeWords.length) {
    const selected = page.selectWord();
    if (selected.word.id === missed.word.id) {
      assert.ok(attempts - lastMiss >= 4, 'Retry ignored the repeat gap');
      lastMiss = attempts;
    }
    assert.ok(attempts <= page.scopeWords.length * 3, 'Repeated urgent retries blocked lesson coverage');
    seen.add(selected.word.id);
    page.complete(selected, selected.word.id !== missed.word.id);
    attempts++;
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

test('small pools remain usable and each practice format keeps separate coverage history', () => {
  for (const size of [1, 2, 5, 20]) {
    const page = practice('lesson3', size);
    const counts = new Map();
    for (let index = 0; index < size * 3; index++) {
      const selected = page.selectWord();
      counts.set(selected.word.id, (counts.get(selected.word.id) || 0) + 1);
      page.complete(selected);
    }
    assert.equal(counts.size, size);
    for (const count of counts.values()) assert.ok(count > 0);
    page.state.questionFormat = 'recall';
    assert.equal(page.reviewCountsForSelection().words.size, 0);
    page.state.questionFormat = 'speaking';
    assert.equal(page.reviewCountsForSelection().words.size, size);
  }
});

test('weak words can return before full coverage and receive more turns than mastered words', () => {
  const page = practice('lesson3', 20);
  const weak = new Set(page.scopeWords.slice(0, 5).map(word => word.id));
  for (const word of page.scopeWords) {
    Object.assign(page.itemState(word), { mastery: weak.has(word.id) ? 10 : 100, dueQuestion: 100 });
  }
  const counts = new Map();
  const recent = [];
  let repeatedBeforeCoverage = false;
  for (let index = 0; index < 40; index++) {
    const selected = page.selectWord();
    assert.equal(recent.slice(-3).includes(selected.word.id), false, 'Normal review ignored the repeat gap');
    repeatedBeforeCoverage ||= counts.has(selected.word.id) && counts.size < page.scopeWords.length;
    counts.set(selected.word.id, (counts.get(selected.word.id) || 0) + 1);
    recent.push(selected.word.id);
    // Model words the learner still struggles with, rather than making all words mastered.
    page.complete(selected, !weak.has(selected.word.id));
  }
  const weakAttempts = [...counts].filter(([id]) => weak.has(id)).reduce((sum, [, count]) => sum + count, 0);
  const masteredAttempts = 40 - weakAttempts;
  assert.equal(repeatedBeforeCoverage, true);
  assert.ok(weakAttempts / weak.size > masteredAttempts / (page.scopeWords.length - weak.size));
});

test('a small due subset cannot force recent repeats while other words are available', () => {
  const page = practice('lesson3', 20);
  for (const word of page.scopeWords) page.itemState(word).dueQuestion = 999999;
  const dueWord = page.scopeWords[0];
  page.itemState(dueWord).dueQuestion = page.state.total;
  const selected = page.selectWord();
  assert.equal(selected.word.id, dueWord.id);
  page.complete(selected);
  // Even an already-expired time-based review must respect the repeat gap.
  page.itemState(dueWord).dueAt = 1;
  for (let index = 0; index < 3; index++) {
    const next = page.selectWord();
    assert.notEqual(next.word.id, dueWord.id);
    page.complete(next);
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

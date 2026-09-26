import assert from 'node:assert/strict';
import test from 'node:test';

await import('../features/kana/vocabulary-scheduler.js');

const scheduler = globalThis.KANA_SPRINT_VOCABULARY_SCHEDULER;

test('audio practice includes speaking promptly while preserving urgent retry directions', () => {
  const counts = { spoken: 0, speaking: 0 };
  const directions = [];
  for (let index = 0; index < 8; index++) {
    const mode = scheduler.balancedAudioMode('spoken', counts);
    directions.push(mode);
    counts[mode]++;
  }
  assert.deepEqual(directions, ['spoken', 'speaking', 'spoken', 'speaking', 'spoken', 'speaking', 'spoken', 'speaking']);
  assert.equal(scheduler.balancedAudioMode('spoken', counts, true), 'spoken');
  counts.spoken += 2;
  assert.equal(scheduler.balancedAudioMode('spoken', counts), 'speaking');
});

function introductionCount(pace, decisions = 100) {
  let credit = 0;
  let introductions = 0;
  for (let index = 0; index < decisions; index++) {
    const decision = scheduler.nextIntroductionDecision(pace, credit);
    credit = decision.credit;
    if (decision.introduce) introductions++;
  }
  return introductions;
}

test('vocabulary pace produces stable new-word proportions', () => {
  for (const pace of [10, 20, 30, 40, 50, 60, 70, 80, 90]) {
    assert.equal(introductionCount(pace), pace);
  }
});

test('kanji pace maps every slider step to an explicit review requirement', () => {
  const expected = new Map([
    [10, 9], [20, 8], [30, 7], [40, 6], [50, 5],
    [60, 4], [70, 3], [80, 2], [90, 1],
  ]);
  for (const [pace, reviews] of expected) {
    assert.equal(scheduler.kanjiReviewRequirement(pace), reviews);
    assert.equal(scheduler.nextKanjiIntroductionDecision(pace, reviews - 1, 0, 3).introduce, false);
    assert.equal(scheduler.nextKanjiIntroductionDecision(pace, reviews, 0, 3).introduce, true);
  }
});

test('kanji builds a starter set and pauses at three unsettled items', () => {
  const starter = scheduler.nextKanjiIntroductionDecision(10, 0, 2, 2);
  const paused = scheduler.nextKanjiIntroductionDecision(90, 20, 3, 20);

  assert.equal(starter.introduce, true);
  assert.equal(starter.buildingStarterSet, true);
  assert.equal(paused.introduce, false);
  assert.equal(paused.paused, true);
});

test('kanji uses question spacing for first recall and elapsed time for retention', () => {
  const initial = scheduler.nextKanjiReviewSchedule({ correct: true, initial: true, questionNumber: 4, now: 1000 });
  const missed = scheduler.nextKanjiReviewSchedule({ correct: false, questionNumber: 8, now: 1000 });
  const remembered = scheduler.nextKanjiReviewSchedule({ correct: true, retentionStep: 1, questionNumber: 12, now: 1000 });

  assert.deepEqual(initial, { dueQuestion: 7, dueAt: 301000, retentionStep: 0 });
  assert.deepEqual(missed, { dueQuestion: 10, dueAt: 61000, retentionStep: 0 });
  assert.equal(remembered.dueQuestion, 0);
  assert.equal(remembered.dueAt, 1000 + 72 * 60 * 60000);
  assert.equal(remembered.retentionStep, 2);
});

test('kanji Practice evidence needs breadth, accuracy, and delayed recall to validate', () => {
  const evidence = {
    seen: 4,
    correct: 4,
    recentResults: [true, true, true, true],
    delayedCorrect: 1,
    modes: {
      meaning: { correct: 2 },
      reading: { correct: 2 },
      spelling: { correct: 0 },
    },
  };

  assert.equal(scheduler.kanjiPracticeEvidenceStatus(evidence).validated, true);
  assert.equal(scheduler.kanjiPracticeEvidenceStatus({ ...evidence, seen: 3 }).validated, false);
  assert.equal(scheduler.kanjiPracticeEvidenceStatus({ ...evidence, delayedCorrect: 0 }).validated, false);
  assert.equal(scheduler.kanjiPracticeEvidenceStatus({ ...evidence, modes: { meaning: { correct: 4 } } }).validated, false);
  assert.equal(scheduler.kanjiPracticeEvidenceStatus({ ...evidence, recentResults: [true, true, true, false, false] }).validated, false);
  assert.equal(scheduler.kanjiPracticeEvidenceStatus(evidence, 'reading').validated, false);
});

test('a stage requires every introduced word to have a completed attempt', () => {
  assert.equal(scheduler.stageIsReady([
    { introduced: true, seen: 2, mastery: 40 },
    { introduced: true, seen: 0, mastery: 40 },
  ]), false);
  assert.equal(scheduler.stageIsReady([
    { introduced: true, seen: 2, mastery: 40 },
    { introduced: true, seen: 1, mastery: 30 },
  ]), true);
});

test('choice count follows the adaptive mastery tiers', () => {
  assert.equal(scheduler.choiceCountForMastery(0), 4);
  assert.equal(scheduler.choiceCountForMastery(39.9), 4);
  assert.equal(scheduler.choiceCountForMastery(40), 6);
  assert.equal(scheduler.choiceCountForMastery(71.9), 6);
  assert.equal(scheduler.choiceCountForMastery(72), 8);
});

test('historical mistakes add only a bounded review bias', () => {
  const recovered = scheduler.reviewScore({ mastery: 90, seen: 100, wrong: 100, lastWasCorrect: true }, 0);
  const recentMistake = scheduler.reviewScore({ mastery: 90, seen: 1, wrong: 1, lastWasCorrect: false }, 0);
  assert.equal(recovered, 28);
  assert.equal(recentMistake, 50);
});

test('recent performance makes review priority responsive', () => {
  const recovered = scheduler.reviewScore({ mastery: 70, seen: 20, wrong: 8, lastWasCorrect: true, recentResults: [true, true, true, true] }, 0);
  const slipping = scheduler.reviewScore({ mastery: 70, seen: 20, wrong: 8, lastWasCorrect: true, recentResults: [false, false, true, false] }, 0);
  assert.ok(slipping > recovered);
  assert.equal(scheduler.recentAccuracy([true, false, true, true]), .75);
});

test('short-term spacing is based on completed question count', () => {
  const missed = scheduler.nextReviewSchedule(20, false, 10, 1000);
  const learning = scheduler.nextReviewSchedule(25, true, 10, 1000);
  const mastered = scheduler.nextReviewSchedule(90, true, 10, 1000);
  assert.equal(missed.dueQuestion, 12);
  assert.equal(learning.dueQuestion, 14);
  assert.equal(mastered.dueQuestion, 24);
  assert.equal(scheduler.reviewIsDue({ seen: 1, dueQuestion: 12, dueAt: 999999 }, 11, 2000), false);
  assert.equal(scheduler.reviewIsDue({ seen: 1, dueQuestion: 12, dueAt: 999999 }, 12, 2000), true);
});

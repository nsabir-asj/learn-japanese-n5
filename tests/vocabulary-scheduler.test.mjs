import assert from 'node:assert/strict';
import test from 'node:test';

await import('../features/kana/vocabulary-scheduler.js');

const scheduler = globalThis.KANA_SPRINT_VOCABULARY_SCHEDULER;

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
  assert.equal(introductionCount(10), 10);
  assert.equal(introductionCount(20), 20);
  assert.equal(introductionCount(50), 50);
  assert.equal(introductionCount(80), 80);
  assert.equal(introductionCount(90), 100);
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

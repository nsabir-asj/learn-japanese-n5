import assert from 'node:assert/strict';
import test from 'node:test';
import { mergeProgressValue } from '../lib/progress-merge.js';

test('retains independently updated progress items', () => {
  const remote = {
    items: {
      a: { seen: 2, mastery: 20, lastSeen: 200 },
      b: { seen: 1, mastery: 10, lastSeen: 100 },
    },
  };
  const incoming = {
    items: {
      a: { seen: 1, mastery: 10, lastSeen: 100 },
      b: { seen: 3, mastery: 30, lastSeen: 300 },
    },
  };

  assert.deepEqual(mergeProgressValue(remote, incoming), {
    items: {
      a: remote.items.a,
      b: incoming.items.b,
    },
  });
});

test('does not move monotonic totals backwards', () => {
  assert.deepEqual(
    mergeProgressValue(
      { total: 12, correct: 10, bestStreak: 7, unlockedStage: 3 },
      { total: 9, correct: 8, bestStreak: 5, unlockedStage: 2 },
    ),
    { total: 12, correct: 10, bestStreak: 7, unlockedStage: 3 },
  );
});

test('uses the incoming value for mutable settings and arrays', () => {
  assert.deepEqual(
    mergeProgressValue(
      { pace: 2, selectedRows: ['a'], streak: 5 },
      { pace: 4, selectedRows: ['a', 'k'], streak: 0 },
    ),
    { pace: 4, selectedRows: ['a', 'k'], streak: 0 },
  );
});

(() => {
  "use strict";

  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

  function choiceCountForMastery(mastery) {
    if (mastery < 40) return 4;
    if (mastery < 72) return 6;
    return 8;
  }

  function nextIntroductionDecision(pace, credit = 0) {
    const normalizedPace = clamp(Number(pace) || 50, 10, 90);
    const updatedCredit = clamp(Number(credit) || 0, 0, 1) + normalizedPace / 100;
    if (updatedCredit + 1e-9 >= 1) {
      return { introduce: true, credit: Math.max(0, updatedCredit - 1) };
    }
    return { introduce: false, credit: updatedCredit };
  }

  function kanjiReviewRequirement(pace) {
    const normalizedPace = clamp(Number(pace) || 50, 10, 90);
    return 10 - Math.round(normalizedPace / 10);
  }

  function nextKanjiIntroductionDecision(pace, successfulReviews = 0, unsettledCount = 0, introducedCount = 0) {
    const completedReviews = Math.max(0, Math.floor(Number(successfulReviews) || 0));
    const unsettled = Math.max(0, Math.floor(Number(unsettledCount) || 0));
    const introduced = Math.max(0, Math.floor(Number(introducedCount) || 0));
    const requiredReviews = kanjiReviewRequirement(pace);
    const buildingStarterSet = introduced < 3;
    const paused = unsettled >= 3;

    return {
      introduce: !paused && (buildingStarterSet || completedReviews >= requiredReviews),
      paused,
      buildingStarterSet,
      requiredReviews,
      remainingReviews: buildingStarterSet ? 0 : Math.max(0, requiredReviews - completedReviews)
    };
  }

  function nextKanjiReviewSchedule({ correct, initial = false, retentionStep = 0, questionNumber = 0, now = Date.now() } = {}) {
    const question = Math.max(0, Math.floor(Number(questionNumber) || 0));
    const timestamp = Math.max(0, Number(now) || Date.now());
    const step = Math.max(0, Math.floor(Number(retentionStep) || 0));
    if (!correct) return { dueQuestion: question + 2, dueAt: timestamp + 60000, retentionStep: 0 };
    if (initial) return { dueQuestion: question + 3, dueAt: timestamp + 5 * 60000, retentionStep: 0 };
    const intervals = [24, 72, 168, 336, 720].map(hours => hours * 60 * 60000);
    const nextStep = Math.min(intervals.length, step + 1);
    return { dueQuestion: 0, dueAt: timestamp + intervals[nextStep - 1], retentionStep: nextStep };
  }

  function stageIsReady(items, requiredAverage = 35) {
    if (!items.length || !items.every(item => item.introduced && item.seen > 0)) return false;
    const average = items.reduce((sum, item) => sum + (Number(item.mastery) || 0), 0) / items.length;
    return average >= requiredAverage;
  }

  function reviewScore(progress, randomValue = Math.random()) {
    const seen = Math.max(0, Number(progress.seen) || 0);
    const wrong = Math.max(0, Number(progress.wrong) || 0);
    const errorRate = seen ? wrong / seen : 0;
    let score = 100 - clamp(Number(progress.mastery) || 0, 0, 100);
    score += Math.min(18, errorRate * 18);
    if (progress.lastWasCorrect === false) score += 22;
    const recent = Array.isArray(progress.recentResults) ? progress.recentResults.slice(-6) : [];
    if (recent.length) {
      const recentAccuracy = recent.filter(Boolean).length / recent.length;
      score += (1 - recentAccuracy) * 24;
    }
    return score + clamp(Number(randomValue) || 0, 0, 1) * 24;
  }

  function reviewIsDue(progress, questionNumber, now = Date.now()) {
    if (!progress || !(Number(progress.seen) > 0)) return true;
    const dueQuestion = Number(progress.dueQuestion) || 0;
    const dueAt = Number(progress.dueAt) || 0;
    return (dueQuestion > 0 && dueQuestion <= questionNumber) || (dueAt > 0 && dueAt <= now);
  }

  function nextReviewSchedule(mastery, correct, questionNumber, now = Date.now()) {
    const normalized = clamp(Number(mastery) || 0, 0, 100);
    if (!correct) return { dueQuestion: questionNumber + 2, dueAt: now + 60000 };
    if (normalized < 40) return { dueQuestion: questionNumber + 4, dueAt: now + 10 * 60000 };
    if (normalized < 72) return { dueQuestion: questionNumber + 8, dueAt: now + 90 * 60000 };
    return { dueQuestion: questionNumber + 14, dueAt: now + 12 * 60 * 60000 };
  }

  function recentAccuracy(results) {
    const recent = Array.isArray(results) ? results.slice(-8) : [];
    return recent.length ? recent.filter(Boolean).length / recent.length : null;
  }

  globalThis.KANA_SPRINT_VOCABULARY_SCHEDULER = {
    choiceCountForMastery,
    kanjiReviewRequirement,
    nextIntroductionDecision,
    nextKanjiIntroductionDecision,
    nextKanjiReviewSchedule,
    nextReviewSchedule,
    recentAccuracy,
    reviewIsDue,
    reviewScore,
    stageIsReady
  };
})();

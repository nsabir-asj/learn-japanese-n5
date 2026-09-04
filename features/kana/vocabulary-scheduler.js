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
    if (normalizedPace >= 90) return { introduce: true, credit: 0 };
    const updatedCredit = clamp(Number(credit) || 0, 0, 1) + normalizedPace / 100;
    if (updatedCredit + Number.EPSILON >= 1) {
      return { introduce: true, credit: Math.max(0, updatedCredit - 1) };
    }
    return { introduce: false, credit: updatedCredit };
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
    return score + clamp(Number(randomValue) || 0, 0, 1) * 24;
  }

  globalThis.KANA_SPRINT_VOCABULARY_SCHEDULER = {
    choiceCountForMastery,
    nextIntroductionDecision,
    reviewScore,
    stageIsReady
  };
})();

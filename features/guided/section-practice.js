(() => {
  "use strict";

  const graded = stage => stage.activities.filter(activity => activity.type !== "teach");
  function passedIds(state, stage) {
    const saved = state.sectionPractice?.[stage.id]?.passedIds;
    const validIds = new Set(graded(stage).map(activity => activity.id));
    return [...new Set(Array.isArray(saved) ? saved.filter(id => validIds.has(id)) : [])];
  }
  function remaining(state, stage) {
    const passed = new Set(passedIds(state, stage));
    return graded(stage).filter(activity => !passed.has(activity.id));
  }
  function passed(state, stage) {
    return graded(stage).length > 0 && remaining(state, stage).length === 0;
  }
  function record(state, stage, activityId, correct, now = Date.now()) {
    if (!correct || !graded(stage).some(activity => activity.id === activityId)) return passed(state, stage);
    state.sectionPractice ||= {};
    const ids = passedIds(state, stage);
    if (!ids.includes(activityId)) ids.push(activityId);
    const previous = state.sectionPractice[stage.id];
    state.sectionPractice[stage.id] = { passedIds: ids, completedAt: previous?.completedAt || 0 };
    if (passed(state, stage) && !state.sectionPractice[stage.id].completedAt) state.sectionPractice[stage.id].completedAt = now;
    return passed(state, stage);
  }
  function covered(state, stage) {
    return passed(state, stage) || stage.activities.every(activity => state.activities?.[activity.id]?.completed);
  }
  function canOpen(state, stages, index) {
    return Number.isInteger(index) && index >= 0 && index < stages.length &&
      (index <= state.unlockedStage || covered(state, stages[index]) || (index > 0 && covered(state, stages[index - 1])));
  }
  globalThis.GUIDED_SECTIONS = { graded, passedIds, remaining, passed, record, canOpen };
})();

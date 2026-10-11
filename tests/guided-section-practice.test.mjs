import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const context = vm.createContext({ window: {} });
vm.runInContext(read('features/guided/section-practice.js'), context);
vm.runInContext(read('content/guided/lesson-03.js'), context);
const sections = context.GUIDED_SECTIONS;
const stages = context.window.GUIDED_LESSONS['3'].stages;
const mixed = context.window.GUIDED_LESSONS['3'].mixedVerbPractice;
const fresh = () => ({ unlockedStage: 0, activities: {}, sectionPractice: {} });

test('every section can be practised without Learn coverage and must cover every graded skill', () => {
  const state = fresh();
  for (const stage of stages) {
    const graded = stage.activities.filter(activity => activity.type !== 'teach');
    assert.deepEqual(Array.from(sections.remaining(state, stage), item => item.id), Array.from(graded, item => item.id));
    assert.ok(graded.length > 0);
    assert.equal(sections.passed(state, stage), false);
  }
  assert.ok(context.window.GUIDED_LESSONS['3'].practiceSections);
});

test('wrong and revealed answers do not pass a skill or open a locked section', () => {
  const state = fresh();
  const stage = stages[2];
  const questions = sections.graded(stage);
  for (const question of questions) sections.record(state, stage, question.id, false);
  sections.record(state, stage, stage.activities.find(item => item.type === 'teach').id, true);
  sections.record(state, stage, 'invalid-id', true);
  assert.equal(sections.remaining(state, stage).length, questions.length);
  assert.equal(sections.passed(state, stage), false);
  assert.equal(sections.canOpen(state, stages, 2), false);
  assert.equal(sections.canOpen(state, stages, 3), false);
});

test('correct skills survive reloads and retries assess only the remaining skills', () => {
  let state = fresh();
  const stage = stages[2];
  const questions = sections.graded(stage);
  sections.record(state, stage, questions[0].id, true);
  sections.record(state, stage, questions[0].id, true);
  sections.record(state, stage, questions[1].id, false);
  state = JSON.parse(JSON.stringify(state));
  assert.equal(sections.passedIds(state, stage).length, 1);
  assert.deepEqual(Array.from(sections.remaining(state, stage), item => item.id), Array.from(questions.slice(1), item => item.id));
  assert.equal(sections.canOpen(state, stages, 2), false);
  for (const question of sections.remaining(state, stage)) sections.record(state, stage, question.id, true, 1234);
  assert.equal(sections.passed(state, stage), true);
  assert.equal(state.sectionPractice[stage.id].completedAt, 1234);
  sections.record(state, stage, questions[0].id, false);
  assert.equal(sections.passed(state, stage), true, 'review mistakes must not relock earned sections');
});

test('passing a later section opens it and the next section without opening skipped sections', () => {
  let state = fresh();
  const stage = stages[4];
  for (const question of sections.graded(stage)) sections.record(state, stage, question.id, true);
  state = JSON.parse(JSON.stringify(state));
  for (const index of [0, 4, 5]) assert.equal(sections.canOpen(state, stages, index), true);
  for (const index of [1, 2, 3, 6, 7, 8, 9, -1, 10]) assert.equal(sections.canOpen(state, stages, index), false);
  assert.equal(state.unlockedStage, 0, 'do not grant all preceding sections');
});

test('existing sequential Learn progress and legacy saves still open the next section', () => {
  const state = { unlockedStage: 0, activities: {} };
  for (const activity of stages[0].activities) state.activities[activity.id] = { completed: true };
  assert.equal(sections.canOpen(state, stages, 1), true);
  assert.equal(sections.canOpen(state, stages, 2), false);
  sections.record(state, stages[2], sections.graded(stages[2])[0].id, true);
  assert.equal(sections.passedIds(state, stages[2]).length, 1);
});

test('invalid saved IDs do not satisfy a section and section practice is loaded before the player', () => {
  const state = fresh();
  const stage = stages[0];
  state.sectionPractice[stage.id] = { passedIds: ['invalid', 'invalid', stage.activities[0].id], completedAt: 5 };
  assert.equal(sections.passedIds(state, stage).length, 0);
  assert.equal(sections.passed(state, stage), false);
  const html = read('guided/player.html');
  assert.ok(html.indexOf('section-practice.js') < html.indexOf('loader.js'));
});

test('mixed verb practice covers all 13 verbs in both forms through recall without group clues', () => {
  assert.equal(mixed.activities.length, 26);
  assert.equal(new Set(mixed.activities.map(item => item.id)).size, 26);
  for (const verb of context.window.GUIDED_LESSONS['3'].verbs) {
    for (const form of ['affirmative', 'negative']) {
      const activity = mixed.activities.find(item => item.verbId === verb.id && item.form === form);
      assert.ok(activity);
      assert.equal(activity.type, 'input');
      assert.equal(activity.audioRole, 'feedback');
      assert.equal(activity.hideStageOrigin, true);
      assert.equal(activity.context, `${verb.dictionary} · ${verb.meaning}`);
      assert.doesNotMatch([activity.title, activity.context, activity.prompt, activity.kicker].join(' '), /ru-verbs?|u-verbs?|irregular|i-row/i);
      const source = stages.flatMap(stage => stage.activities).find(item => item.id === activity.id);
      assert.equal(activity.answers.join('|'), source.answers.join('|'));
    }
  }
});

test('the mixed round saves its own blind-recall progress and resumes missed forms', () => {
  let state = fresh();
  assert.equal(sections.remaining(state, mixed).length, 26);
  for (const activity of mixed.activities.slice(0, 25)) sections.record(state, mixed, activity.id, true);
  const last = mixed.activities[25];
  sections.record(state, mixed, last.id, false);
  state = JSON.parse(JSON.stringify(state));
  assert.equal(sections.passed(state, mixed), false);
  assert.deepEqual(Array.from(sections.remaining(state, mixed), item => item.id), [last.id]);
  sections.record(state, mixed, last.id, true);
  assert.equal(sections.passed(state, mixed), true);
  assert.equal(sections.remaining(state, mixed).length, 0);
});

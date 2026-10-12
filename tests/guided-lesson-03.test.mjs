import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const context = vm.createContext({ window: {} });
vm.runInContext(read('features/guided/answers.js'), context);
for (const number of ['01', '02', '03']) vm.runInContext(read(`content/guided/lesson-${number}.js`), context);
const lesson = context.window.GUIDED_LESSONS['3'];
const activities = lesson.stages.flatMap(stage => stage.activities);
const grader = context.GUIDED_ANSWERS;

test('Lesson 3 covers both polite forms of every source verb through independent recall', () => {
  const expected = {
    taberu: ['たべます', 'たべません'], miru: ['みます', 'みません'],
    okiru: ['おきます', 'おきません'], neru: ['ねます', 'ねません'],
    iku: ['いきます', 'いきません'], kaeru: ['かえります', 'かえりません'],
    kiku: ['ききます', 'ききません'], nomu: ['のみます', 'のみません'],
    hanasu: ['はなします', 'はなしません'], yomu: ['よみます', 'よみません'],
    suru: ['します', 'しません'], benkyousuru: ['べんきょうします', 'べんきょうしません'],
    kuru: ['きます', 'きません'],
  };
  assert.equal(lesson.verbs.length, 13);
  for (const [id, forms] of Object.entries(expected)) {
    for (const [index, form] of ['affirmative', 'negative'].entries()) {
      const activity = activities.find(item => item.id === `verb-${id}-${form}`);
      assert.ok(activity, `${id} needs ${form} recall`);
      assert.equal(activity.type, 'input');
      assert.equal(activity.audioRole, 'feedback', 'audio must not reveal the form before answering');
      assert.ok(grader.matches(activity, forms[index]));
      assert.ok(!grader.matches(activity, forms[1 - index]), 'opposite polarity must be rejected');
      assert.ok(!grader.matches(activity, lesson.verbs.find(verb => verb.id === id).dictionary));
      assert.ok(activity.answers.some(answer => /^[a-z]+$/.test(answer)), 'no Japanese keyboard is required');
    }
  }
});

test('conjugation accepts supported scripts and diagnoses group or polarity errors', () => {
  const returnNegative = activities.find(activity => activity.id === 'verb-kaeru-negative');
  for (const answer of ['かえりません', '帰りません', 'kaerimasen', ' KAERIMASEN. ', 'ｋａｅｒｉｍａｓｅｎ']) {
    assert.ok(grader.matches(returnNegative, answer), answer);
  }
  assert.ok(!grader.matches(returnNegative, 'かえません'));
  assert.match(grader.diagnose(returnNegative, 'かえません'), /u-verb/);
  assert.match(grader.diagnose(returnNegative, 'かえります'), /affirmative/);
  assert.ok(!grader.matches(returnNegative, ''));
});

test('all 26 verb examples explain every particle in its sentence context', () => {
  const verbs = activities.filter(activity => activity.id.startsWith('verb-') && activity.type === 'input');
  assert.equal(verbs.length, 26);
  for (const activity of [...verbs, ...lesson.mixedVerbPractice.activities]) {
    const sentence = activity.example[0];
    const expectedPhrases = sentence.split(' ').filter(phrase => /[はをにへでと]$/.test(phrase));
    assert.deepEqual(Array.from(activity.exampleParticles, note => note[1]), expectedPhrases, activity.id);
    for (const [particle, phrase, explanation] of activity.exampleParticles) {
      assert.ok(particle.startsWith(phrase.at(-1)), activity.id);
      assert.ok(explanation.length > 30, activity.id);
    }
  }
  const notes = id => verbs.find(activity => activity.id === id).exampleParticles;
  assert.match(notes('verb-okiru-affirmative')[1][2], /when.*six/);
  assert.match(notes('verb-kaeru-negative')[1][2], /destination.*home/);
  assert.match(notes('verb-benkyousuru-affirmative')[1][2], /where.*university/);
  assert.match(notes('verb-nomu-negative')[1][2], /with a friend/);
  assert.match(notes('verb-kuru-affirmative')[0][2], /my friend.*pronounced wa/);
});

test('sentence building rejects wrong actions and endings and accepts valid order changes', () => {
  const wake = activities.find(activity => activity.id === 'time-wake');
  assert.ok(grader.matches(wake, 'しちじにおきます。'));
  for (const wrong of ['しちじにおきません。', 'しちじにおきります。', 'しちじにねます。']) {
    assert.ok(!grader.matches(wake, wrong), wrong);
  }
  assert.match(grader.diagnose(wake, 'しちじにねます。', ['しちじに', 'ねます。']), /go to bed/);
  const plan = activities.find(activity => activity.id === 'mission-plan');
  assert.ok(grader.matches(plan, 'としょかんでにちようびにべんきょうします。'));
  assert.ok(!grader.matches(plan, 'にちようびにとしょかんにべんきょうします。'));
  const around = activities.find(activity => activity.id === 'time-around');
  assert.ok(grader.matches(around, 'くじごろにうちにかえります。'));
  assert.ok(grader.matches(around, 'うちにくじごろかえります。'));
});

test('every sentence bank has meaningful extras and every review stays connected to its source', () => {
  const ids = activities.map(activity => activity.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(lesson.stageWrapups.length, lesson.stages.length);
  for (const activity of activities.filter(item => item.type !== 'teach')) {
    const family = lesson.practiceFamilyById[activity.id];
    assert.ok(family, `${activity.id} needs a review family`);
    const variants = lesson.practiceFamilies[family];
    assert.ok(variants?.length);
    const keys = lesson.practiceVariantKeysById[activity.id];
    assert.ok(keys.every(key => variants.some(variant => variant.key === key)));
    assert.ok(activity.checkpointGroup);
  }
  for (const activity of [...activities, ...Object.values(lesson.practiceFamilies).flat()]) {
    if (activity.type === 'tiles') {
      assert.ok(activity.distractors.length >= 3, `${activity.id} needs meaningful extra tiles`);
      assert.equal(new Set([...activity.tokens, ...activity.distractors]).size, activity.tokens.length + activity.distractors.length);
      assert.ok(grader.matches(activity, activity.answer.join('')));
      for (const extra of activity.distractors) {
        assert.ok(activity.distractorFeedback[extra]);
        assert.ok(!grader.matches(activity, [...activity.answer, extra].join('')), `${activity.id} must reject extra tiles`);
      }
    } else if (['choice', 'repair'].includes(activity.type)) {
      assert.ok(activity.answer >= 0 && activity.answer < activity.options.length);
      assert.equal(new Set(activity.options).size, activity.options.length);
    } else if (activity.type === 'input') {
      assert.ok(activity.answers.length);
      assert.ok(grader.matches(activity, activity.answers[0]));
    }
  }
});

test('checkpoint verb categories keep both affirmative and negative conversion in the mix', () => {
  const groups = new Set(activities.filter(activity => activity.type !== 'teach').map(activity => activity.checkpointGroup));
  assert.equal(groups.size, 9);
  for (const form of ['affirmative', 'negative']) {
    const group = `verbs-${form}`;
    const pool = activities.filter(activity => activity.checkpointGroup === group);
    assert.ok(pool.length >= 13);
    for (const activity of pool) {
      const variants = lesson.practiceFamilies[lesson.practiceFamilyById[activity.id]];
      for (const variant of variants) {
        if (variant.form) assert.equal(variant.form, form);
        else if (activity.id === 'u-return-trap') assert.match(variant.prompt, /negative/);
      }
    }
  }
});

test('shared grading still accepts every existing Lesson 1 and Lesson 2 input and tile answer', () => {
  for (const number of ['1', '2']) {
    const existing = context.window.GUIDED_LESSONS[number];
    const pool = [...existing.stages.flatMap(stage => stage.activities), ...Object.values(existing.practiceFamilies).flat()];
    for (const activity of pool.filter(item => ['input', 'tiles'].includes(item.type))) {
      const answers = activity.type === 'input' ? activity.answers : [activity.answer.join('')];
      for (const answer of answers) assert.ok(grader.matches(activity, answer), `${number}/${activity.id}: ${answer}`);
    }
  }
});

test('Lesson 3 is reachable and its progress is included in sync and complete backups', () => {
  assert.ok(read('index.html').includes('guided/player.html?lesson=3'));
  for (const path of ['features/settings/settings.js', 'shared/progress-sync.js', 'app/api/progress/route.ts']) {
    assert.ok(read(path).includes(lesson.storageKey), path);
  }
  assert.equal(lesson.foundation.href, '../vocabulary.html?scope=lesson3');
  assert.ok(read('settings.html').includes(`value="${lesson.storageKey}"`));
  assert.match(read('features/kana/vocabulary.js'), /new URLSearchParams\(location.search\)\.get\("scope"\)/);
  assert.match(read('guided/player.html'), /answers\.js/);
});

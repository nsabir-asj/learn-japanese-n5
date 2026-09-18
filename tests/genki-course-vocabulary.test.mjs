import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

await import('../features/kana/vocabulary-examples.js');

const source = readFileSync('features/kana/vocabulary.js', 'utf8');
const examples = globalThis.KANA_SPRINT_VOCABULARY_EXAMPLES;
const lessons56 = JSON.parse(readFileSync('content/vocabulary/genki-lessons-5-6.json', 'utf8'));
const courseSource = source.slice(source.indexOf('const STAGES = ['), source.indexOf('id: "practical-extras"'));
const stageStarts = [...courseSource.matchAll(/id: "(lesson\d+-[^"]+)"/g)];
const stages = stageStarts.map((match, index) => {
  const block = courseSource.slice(match.index, stageStarts[index + 1]?.index ?? courseSource.length);
  const wordIds = [...block.matchAll(/^\s*\["([^"]+)",\s*"/gm)].map(word => word[1]);
  const reusedBlock = block.match(/reusedWordIds:\s*\[([^\]]+)\]/)?.[1] || '';
  const reusedWordIds = [...reusedBlock.matchAll(/"([^"]+)"/g)].map(word => word[1]);
  return { id: match[1], wordIds, reusedWordIds };
});

const wordsForLesson = lesson => stages
  .filter(stage => stage.id.startsWith(`lesson${lesson}-`))
  .flatMap(stage => [...stage.wordIds, ...stage.reusedWordIds]);

test('Genki Lessons 3 through 6 preserve every vocabulary entry from the selected PDF pages', () => {
  assert.equal(stages.filter(stage => stage.id.startsWith('lesson3-')).length, 3);
  assert.equal(stages.filter(stage => stage.id.startsWith('lesson4-')).length, 3);
  assert.equal(stages.filter(stage => stage.id.startsWith('lesson5-')).length, 3);
  assert.equal(stages.filter(stage => stage.id.startsWith('lesson6-')).length, 3);
  assert.equal(wordsForLesson(3).length, 56);
  assert.equal(wordsForLesson(4).length, 62);
  assert.equal(wordsForLesson(5).length, 52);
  assert.equal(wordsForLesson(6).length, 47);
  assert.equal(new Set(wordsForLesson(3)).size, 56);
  assert.equal(new Set(wordsForLesson(4)).size, 62);
  assert.equal(new Set(wordsForLesson(5)).size, 52);
  assert.equal(new Set(wordsForLesson(6)).size, 47);
});

test('the expanded Genki course has stable, deduplicated practice identities', () => {
  const allCourseIds = stages.flatMap(stage => [...stage.wordIds, ...stage.reusedWordIds]);
  assert.equal(new Set(allCourseIds).size, 348);
  assert.equal(stages.flatMap(stage => stage.wordIds).length, 327);
});

test('new Lesson 3 through 6 words have kana-only helper sentences', () => {
  const newIds = stages
    .filter(stage => /^lesson[3-6]-/.test(stage.id))
    .flatMap(stage => stage.wordIds);
  assert.equal(newIds.length, 196);
  newIds.forEach(id => {
    const example = examples[id];
    assert.ok(example, `${id} is missing an example`);
    assert.ok(example[0].length > 2, `${id} needs a Japanese sentence`);
    assert.ok(example[1].length > 2, `${id} needs an English translation`);
    assert.doesNotMatch(example[0], /[\u3400-\u4dbf\u4e00-\u9fff]/u, `${id} contains kanji`);
  });
});

test('the Lesson 5 and 6 extraction stays in sync with the runtime stages', () => {
  assert.equal(lessons56.schemaVersion, 1);
  assert.equal(lessons56.source.file, 'Genki 1 L5_L6.pdf');
  assert.deepEqual(lessons56.source.lesson5Pages, [3, 4]);
  assert.deepEqual(lessons56.source.lesson6Pages, [21, 22]);

  lessons56.lessons.forEach(lesson => {
    const extracted = lesson.stages.flatMap(stage => stage.entries);
    assert.equal(extracted.length, lesson.entryCount);
    assert.deepEqual(extracted.map(entry => entry.id).sort(), wordsForLesson(lesson.lesson).sort());
    extracted.forEach(entry => {
      assert.ok(entry.exampleJapanese.length > 2);
      assert.ok(entry.exampleEnglish.length > 2);
      assert.doesNotMatch(entry.exampleJapanese, /[\u3400-\u4dbf\u4e00-\u9fff]/u, `${entry.id} contains kanji`);
      assert.ok(entry.exampleJapanese.includes(entry.focus || entry.japanese.replace('～', '')), `${entry.id} is absent from its extracted example`);
    });
  });
});

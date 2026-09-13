import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const dataset = JSON.parse(readFileSync('content/vocabulary/n5-topics.json', 'utf8'));
const vocabularySource = readFileSync('features/kana/vocabulary.js', 'utf8');
const stageSource = vocabularySource.split('const WORDS =', 1)[0];
const stagePattern = /\{\s*id:\s*"([^"]+)".*?words:\s*\[(.*?)\]\s*\}/gs;
const wordPattern = /\["([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)"\]/g;
const existingWords = [...stageSource.matchAll(stagePattern)].flatMap(([, stageId, body]) =>
  [...body.matchAll(wordPattern)].map(([, id]) => ({ id, stageId })),
);

test('N5 topic data preserves all 802 numbered PDF records', () => {
  assert.equal(dataset.schemaVersion, 1);
  assert.equal(dataset.level, 'N5');
  assert.equal(dataset.recordCount, 802);
  assert.equal(dataset.words.length, 802);
  assert.deepEqual(dataset.words.map(word => word.order), Array.from({ length: 802 }, (_, index) => index + 1));
  assert.equal(new Set(dataset.words.map(word => word.id)).size, 802);
  dataset.words.forEach(word => {
    assert.equal(word.id, `n5-${String(word.order).padStart(4, '0')}`);
    assert.ok(word.kana);
    assert.ok(word.romaji);
    assert.match(word.romaji, /^[\x00-\x7f]+$/);
    assert.ok(word.meaning);
    assert.ok(word.kanji === null || typeof word.kanji === 'string');
    assert.ok(word.frequency === null || Number.isInteger(word.frequency));
    assert.ok(Number.isInteger(word.pdfPage) && word.pdfPage >= 1 && word.pdfPage <= 25);
  });

  const floor = dataset.words[2];
  const times = dataset.words[3];
  assert.equal(floor.kana, '～かい');
  assert.equal(times.kana, '～かい');
  assert.notEqual(floor.id, times.id);
  assert.notEqual(floor.meaning, times.meaning);
  assert.equal(dataset.words[747].kana, 'ワイシャツ');
  assert.equal(dataset.words[751].kana, 'わたくし');
});

test('every N5 record has one valid topic and auditable provenance', () => {
  assert.equal(dataset.topics.length, 23);
  assert.equal(dataset.topics.filter(topic => topic.origin === 'gyanmirai').length, 22);
  assert.equal(dataset.topics.filter(topic => topic.origin === 'curated').length, 1);
  assert.equal(
    dataset.topics.reduce((sum, topic) => sum + (topic.sourcePublishedWordCount || 0), 0),
    653,
  );

  const topicIds = new Set(dataset.topics.map(topic => topic.id));
  const actualCounts = new Map(dataset.topics.map(topic => [topic.id, 0]));
  dataset.words.forEach(word => {
    assert.ok(topicIds.has(word.topicId), `${word.id} has unknown topic ${word.topicId}`);
    actualCounts.set(word.topicId, actualCounts.get(word.topicId) + 1);
    assert.ok(['site', 'site-corrected', 'manual'].includes(word.classificationSource));
    if (word.classificationSource === 'manual') {
      assert.equal(word.sourceTopicId, null);
      assert.ok(word.classificationNote);
      assert.equal(word.sourceMatch, undefined);
    } else {
      assert.ok(word.sourceTopicId);
      assert.ok(word.sourceMatch?.kana);
      assert.ok(word.sourceMatch?.meaning);
    }
    if (word.classificationSource === 'site-corrected') {
      assert.notEqual(word.topicId, word.sourceTopicId);
      assert.ok(word.classificationNote);
    }
  });
  dataset.topics.forEach(topic => {
    assert.ok(topic.recordCount > 0);
    assert.equal(topic.recordCount, actualCounts.get(topic.id));
  });
  assert.equal(
    Object.values(dataset.classificationSummary).reduce((sum, count) => sum + count, 0),
    802,
  );

  const notebook = dataset.words.find(word => word.kana === 'ノート');
  assert.equal(notebook.sourceTopicId, 'verbs-of-motion');
  assert.equal(notebook.topicId, 'school-and-education');
  assert.equal(notebook.classificationSource, 'site-corrected');
  const sports = dataset.words.find(word => word.kana === 'スポーツ');
  assert.equal(sports.sourceTopicId, 'school-and-education');
  assert.equal(sports.topicId, 'sports-and-recreation');
});

test('existing vocabulary IDs and the future Practical extras move are recorded safely', () => {
  const knownIds = new Set(existingWords.map(word => word.id));
  const mappedIds = dataset.words.flatMap(word => word.existingWordIds || []);
  assert.equal(new Set(mappedIds).size, mappedIds.length);
  mappedIds.forEach(id => assert.ok(knownIds.has(id), `Unknown existing vocabulary ID ${id}`));
  dataset.existingVocabulary.unmatchedWordIds.forEach(id => assert.ok(knownIds.has(id)));
  assert.equal(
    mappedIds.length + dataset.existingVocabulary.unmatchedWordIds.length,
    existingWords.length,
  );
  assert.equal(dataset.existingVocabulary.matchedWordIdCount, mappedIds.length);
  assert.equal(
    dataset.existingVocabulary.matchedRecordCount,
    dataset.words.filter(word => word.existingWordIds?.length).length,
  );

  const expectedMoves = existingWords
    .filter(word => word.stageId.startsWith('practical-') && mappedIds.includes(word.id))
    .map(word => word.id)
    .sort();
  assert.deepEqual(dataset.scopePolicy.courseTrackWordIdsToMove, expectedMoves);
  assert.equal(expectedMoves.length, 35);
  assert.equal(dataset.scopePolicy.removeMatchedPracticalExtrasFromCourseTrack, true);
  assert.equal(dataset.scopePolicy.applyWhenIntegrated, true);
});

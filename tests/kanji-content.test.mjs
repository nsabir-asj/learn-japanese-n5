import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(resolve(root, 'content/kanji/n5-kanji.json'), 'utf8'));

test('kanji curriculum contains the complete core and extended sets', () => {
  assert.equal(data.kanji.length, 120);
  assert.equal(data.coreCount, 104);
  assert.equal(data.extendedCount, 16);
  assert.equal(new Set(data.kanji.map(entry => entry.character)).size, 120);
  assert.equal(data.kanji.filter(entry => entry.tier === 'core').length, 104);
  assert.equal(data.kanji.filter(entry => entry.tier === 'extended').length, 16);
});

test('every kanji is assigned once and has usable learning content', () => {
  const stagedIds = data.stages.flatMap(stage => stage.kanjiIds);
  assert.deepEqual(new Set(stagedIds), new Set(data.kanji.map(entry => entry.id)));
  assert.equal(stagedIds.length, data.kanji.length);

  for (const entry of data.kanji) {
    assert.ok(entry.meanings.length, `${entry.character} needs a meaning`);
    assert.ok(entry.readings.kunyomi.length || entry.readings.onyomi.length, `${entry.character} needs a reading`);
    assert.ok(entry.anchor.word && entry.anchor.reading && entry.anchor.meaning, `${entry.character} needs an anchor word`);
    assert.ok(entry.anchor.sentence && entry.anchor.translation, `${entry.character} needs an example sentence`);
    assert.ok(entry.radical.character && entry.radical.meaning, `${entry.character} needs radical data`);
    assert.doesNotMatch(entry.radical.character, /[\uE000-\uF8FF]/u, `${entry.character} uses a private-use radical glyph`);
    assert.equal(entry.mnemonic, null);
  }
});

test('kanji page separates guided learning, adaptive review, selected practice, and the progress map', () => {
  const html = readFileSync(resolve(root, 'kanji.html'), 'utf8');
  const script = readFileSync(resolve(root, 'features/kanji/kanji.js'), 'utf8');
  const styles = readFileSync(resolve(root, 'features/kanji/kanji.css'), 'utf8');

  assert.doesNotThrow(() => new Script(script));
  assert.match(html, /kanji-data\.js/);
  assert.match(script, /data-kanji-view="learn"/);
  assert.match(script, /data-kanji-view="review"/);
  assert.match(script, /data-kanji-view="practice"/);
  assert.match(script, /data-kanji-view="progress"/);
  assert.doesNotMatch(script, /data-kanji-view="checkpoint"/);
  assert.match(script, /kanaSprintKanjiV1/);
  assert.match(script, /meaning.*reading.*spelling/s);
  assert.match(styles, /\.kanji-map\{/);
});

test('kanji questions do not reveal answers through duplicated helper text', () => {
  const script = readFileSync(resolve(root, 'features/kanji/kanji.js'), 'utf8');
  const styles = readFileSync(resolve(root, 'features/kanji/kanji.css'), 'utf8');

  assert.match(script, /const language = format === "meaning" \? "" : ' lang="ja"'/);
  assert.match(script, /kanji-choice \$\{format === "meaning" \? "meaning-choice" : "japanese-choice"\}/);
  assert.doesNotMatch(script, /<small>\$\{escapeHtml\(detail\)\}<\/small>/);
  assert.match(script, /class="kanji-choice-secondary" aria-hidden="true"/);
  assert.match(script, /querySelectorAll\("\.kanji-choice-secondary"\)\.forEach\(detail => detail\.removeAttribute\("aria-hidden"\)\)/);
  assert.match(styles, /\.kanji-options:not\(\.is-answered\) \.kanji-choice-secondary\{display:none\}/);
  assert.match(script, /spelling: "reading → kanji"/);
});

test('kanji examples display and highlight the character being learned', () => {
  const script = readFileSync(resolve(root, 'features/kanji/kanji.js'), 'utf8');

  assert.match(script, /sentence\.replace\(entry\.anchor\.reading, entry\.anchor\.word\)/);
  assert.match(script, /\.join\(`<mark>\$\{escapeHtml\(entry\.character\)\}<\/mark>`\)/);
  assert.match(script, /learningLabel\(current\)/);
  assert.doesNotMatch(script, /\$\{Math\.round\(progress\.mastery\)\}% mastery/);
  assert.doesNotMatch(script, /introduced · \$\{mastery\}% mastery/);
});

test('kanji uses one JLPT N5 course with styled controls and optional autoplay', () => {
  const script = readFileSync(resolve(root, 'features/kanji/kanji.js'), 'utf8');
  const styles = readFileSync(resolve(root, 'features/kanji/kanji.css'), 'utf8');

  assert.match(script, /<strong>JLPT N5<\/strong>/);
  assert.doesNotMatch(script, /id="kanjiTrack"/);
  assert.match(script, /return DATA\.kanji;/);
  assert.match(script, /autoPronounce: true/);
  assert.match(script, /id="kanjiAutoPronounce"/);
  assert.match(script, /if \(state\.autoPronounce\) speak\(current\.anchor\.reading\)/);
  assert.match(script, /KANA_SPRINT_SPEECH\?\.openSettings/);
  assert.match(styles, /\.kanji-controls select\{/);
  assert.match(styles, /\.kanji-pace input\[type="range"\]/);
  assert.match(styles, /\.kanji-toggle input\{/);
});

test('kanji practice supports reusable all, learned, and multi-group scopes', () => {
  const script = readFileSync(resolve(root, 'features/kanji/kanji.js'), 'utf8');
  const styles = readFileSync(resolve(root, 'features/kanji/kanji.css'), 'utf8');

  assert.match(script, /practiceScope: ""/);
  assert.match(script, /value="all"/);
  assert.match(script, /value="learned"/);
  assert.match(script, /value="groups"/);
  assert.match(script, /practiceStageIds/);
  assert.match(script, /practiceCoverage: \{ key: "", seenIds: \[\] \}/);
  assert.match(script, /id="kanjiChangePractice"/);
  assert.match(script, /if \(view !== "practice" && !verification\) progress\.introduced = true/);
  assert.match(styles, /\.kanji-practice-scope-options/);
  assert.match(styles, /\.kanji-practice-group-grid/);
});

test('strong Practice evidence can satisfy Learn without weak attempts skipping lessons', () => {
  const script = readFileSync(resolve(root, 'features/kanji/kanji.js'), 'utf8');

  assert.match(script, /function emptyPracticeEvidence\(\)/);
  assert.match(script, /Scheduler\.kanjiPracticeEvidenceStatus\(progress\.practice, progress\.urgentMode\)/);
  assert.match(script, /function isCurriculumCovered\(entry\)/);
  assert.match(script, /Quick check · familiar from Practice/);
  assert.match(script, /if \(verification && correct\) progress\.introduced = true/);
  assert.match(script, /Practice check missed · guided explanation/);
  assert.match(script, /evidence\.delayedCorrect \+= 1/);
  assert.match(script, /Learn step credited/);
});

test('kanji pace counts successful delayed reviews instead of treating pace as a new-item percentage', () => {
  const script = readFileSync(resolve(root, 'features/kanji/kanji.js'), 'utf8');

  assert.match(script, /reviewsSinceNew: 0/);
  assert.match(script, /unsettledEntries\(\)\.length/);
  assert.match(script, /stageById\.get\(entry\.stageId\)\.order <= activeStageOrder && isPracticeValidated\(entry\)/);
  assert.match(script, /showQuestion\(current, "meaning", false\)/);
  assert.match(script, /currentQuestionCountsAsReview && correct\) state\.reviewsSinceNew \+= 1/);
  assert.doesNotMatch(script, /nextIntroductionDecision\(state\.pace, state\.newCredit\)/);
});

test('kanji keeps at most three unsettled items and uses delayed retention reviews', () => {
  const script = readFileSync(resolve(root, 'features/kanji/kanji.js'), 'utf8');

  assert.match(script, /progress\.awaitingRecall = true/);
  assert.match(script, /progress\.urgentMode = currentFormat/);
  assert.match(script, /progress\.urgentMode === currentFormat/);
  assert.match(script, /nextKanjiReviewSchedule/);
  assert.match(script, /Checking \$\{unsettled\} recently learned kanji/);
});

test('kanji stages unlock through the same slider-controlled review countdown', () => {
  const script = readFileSync(resolve(root, 'features/kanji/kanji.js'), 'utf8');

  assert.match(script, /unlockedStageIndex: 0/);
  assert.match(script, /function stageUnlockDecision\(\)/);
  assert.match(script, /entries\.every\(isCurriculumCovered\)/);
  assert.match(script, /state\.reviewsSinceNew \+ validationCredits/);
  assert.match(script, /function maybeUnlockNextStage\(\)/);
  assert.match(script, /if \(view === "learn"\) maybeUnlockNextStage\(\)/);
  assert.match(script, /Next stage after \$\{count\} successful review/);
  assert.match(script, /recently learned kanji before opening stage/);
  assert.doesNotMatch(script, /requiredAverage = 35/);
});

test('kanji keeps practice full width and places the journey in a collapsed section', () => {
  const script = readFileSync(resolve(root, 'features/kanji/kanji.js'), 'utf8');
  const styles = readFileSync(resolve(root, 'features/kanji/kanji.css'), 'utf8');

  assert.match(script, /<details class="card kanji-roadmap-card" id="kanjiJourney">/);
  assert.match(script, /id="kanjiJourneySummary">Stage 1 of 12 · 0\/120 covered/);
  assert.match(script, /Stage \$\{currentStageIndex\(\) \+ 1\} of \$\{stages\.length\} · \$\{stage\.label\}/);
  assert.doesNotMatch(script, /<aside class="card kanji-roadmap-card">/);
  assert.match(styles, /\.kanji-workspace\{display:block\}/);
  assert.doesNotMatch(styles, /\.kanji-roadmap-card\{position:sticky/);
});

test('kanji stages open an overview and link individual kanji to the map', () => {
  const script = readFileSync(resolve(root, 'features/kanji/kanji.js'), 'utf8');
  const styles = readFileSync(resolve(root, 'features/kanji/kanji.css'), 'utf8');

  assert.match(script, /data-kanji-stage-id="\$\{stage\.id\}"/);
  assert.match(script, /id="kanjiStageDialog"/);
  assert.match(script, /function openStageDialog\(stageId\)/);
  assert.match(script, /\[validated\.length, "Practice validated"\]/);
  assert.match(script, /data-stage-kanji-id="\$\{entry\.id\}"/);
  assert.match(script, /function openMapDetail\(entryId\)/);
  assert.match(script, /switchView\("progress"\)/);
  assert.match(styles, /\.kanji-stage-dialog::backdrop/);
  assert.match(styles, /\.kanji-stage-dialog-list\{display:grid;grid-template-columns:repeat\(2/);
});

test('kanji map search and status controls use the site control styling', () => {
  const styles = readFileSync(resolve(root, 'features/kanji/kanji.css'), 'utf8');

  assert.match(styles, /\.kanji-map-tools\{display:grid;grid-template-columns:/);
  assert.match(styles, /\.kanji-map-tools input,\.kanji-map-tools select\{[^}]*height:44px[^}]*border-radius:11px[^}]*background:#0f141a/);
  assert.match(styles, /\.kanji-map-tools input:hover,\.kanji-map-tools select:hover/);
  assert.match(styles, /\.kanji-map-tools input:focus-visible,\.kanji-map-tools select:focus-visible/);
});

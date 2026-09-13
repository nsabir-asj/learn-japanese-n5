import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const entrypoints = [
  'index.html',
  'hiragana_sprint.html',
  'katakana_sprint.html',
  'kana_sprint.html',
  'vocabulary.html',
  'numbers.html',
  'settings.html',
  'guided/player.html',
];

const stylesheetsWithLocalAssets = [
  'features/kana/hiragana-fonts.css',
  'features/kana/katakana-fonts.css',
];

test('standalone HTML entrypoints only reference files that exist', () => {
  for (const entrypoint of entrypoints) {
    const htmlPath = resolve(root, entrypoint);
    const html = readFileSync(htmlPath, 'utf8');
    const references = [...html.matchAll(/(?:href|src)="(\.{1,2}\/[^"#?]+)(?:[?#][^"]*)?"/g)];

    for (const [, reference] of references) {
      const target = resolve(dirname(htmlPath), reference);
      assert.ok(existsSync(target), `${entrypoint} references missing file ${reference}`);
    }
  }
});

test('the root launcher links to every learning experience', () => {
  const html = readFileSync(resolve(root, 'index.html'), 'utf8');
  for (const target of [
    './hiragana_sprint.html',
    './katakana_sprint.html',
    './kana_sprint.html',
    './vocabulary.html',
    './numbers.html',
    './settings.html',
    './guided/player.html?lesson=1',
    './guided/player.html?lesson=2',
  ]) {
    assert.ok(html.includes(`href="${target}"`), `root launcher does not link to ${target}`);
  }
});

test('the root launcher reports live cloud-sync status', () => {
  const html = readFileSync(resolve(root, 'index.html'), 'utf8');
  const sync = readFileSync(resolve(root, 'shared/progress-sync.js'), 'utf8');
  assert.match(html, /src="\.\/shared\/progress-sync\.js/);
  assert.match(html, /class="status pill header-sync-status" role="status">Cloud sync connecting…<\/span>/);
  assert.doesNotMatch(html, /offline-ready/);
  assert.match(sync, /pill\.textContent = 'Auto-saved in this browser'/);
  assert.match(sync, /DOMContentLoaded', showDeviceOnlyStatus/);
});

test('the compact Kana Mix icon uses the launcher card class', () => {
  const html = readFileSync(resolve(root, 'index.html'), 'utf8');
  const css = readFileSync(resolve(root, 'features/home/styles.css'), 'utf8');
  assert.match(html, /class="activity-card mix-card"/);
  assert.match(css, /\.mix-card \.kana-pair/);
});

test('all kana sprints expose separate Fonts and Settings management tabs', () => {
  const trainer = readFileSync(resolve(root, 'features/kana/trainer.js'), 'utf8');
  assert.match(trainer, /label:"Manage",tabs:\["fonts","settingsdata"\]/);
  assert.match(trainer, /dataset\.tab="settingsdata";tab\.textContent="Settings"/);
  assert.doesNotMatch(trainer, /practiceFontSettingsBody/);
});

test('vocabulary feedback explains the meaning of a selected wrong choice', () => {
  const vocabulary = readFileSync(resolve(root, 'features/kana/vocabulary.js'), 'utf8');
  const styles = readFileSync(resolve(root, 'features/kana/vocabulary.css'), 'utf8');
  assert.match(vocabulary, /const selectedWord = !correct && selectedId \? WORDS\.find\(word => word\.id === selectedId\) : null/);
  assert.match(vocabulary, /vocab-feedback-choice-label/);
  assert.match(vocabulary, /Meaning: \$\{selectedWord\.meaning\}/);
  assert.match(styles, /\.vocab-feedback-choice/);
});

test('vocabulary choices reveal pronunciation or Japanese text only after answering', () => {
  const vocabulary = readFileSync(resolve(root, 'features/kana/vocabulary.js'), 'utf8');
  const styles = readFileSync(resolve(root, 'features/kana/vocabulary.css'), 'utf8');
  assert.match(vocabulary, /options\.classList\.remove\("is-answered"\)/);
  assert.match(vocabulary, /class="vocab-choice-secondary" aria-hidden="true">\$\{choice\.romaji\}/);
  assert.match(vocabulary, /class="vocab-choice-secondary vocab-choice-japanese-secondary" aria-hidden="true">\$\{choice\.jp\}/);
  assert.match(vocabulary, /options\.classList\.add\("is-answered"\)/);
  assert.match(vocabulary, /querySelectorAll\("\.vocab-choice-secondary"\)\.forEach\(detail => detail\.removeAttribute\("aria-hidden"\)\)/);
  assert.match(styles, /\.vocab-options:not\(\.is-answered\) \.vocab-choice-secondary\{display:none\}/);
  assert.match(styles, /\.vocab-choice-japanese-secondary/);
});

test('vocabulary scope picker supports guided, preset, and custom topic practice', () => {
  const vocabulary = readFileSync(resolve(root, 'features/kana/vocabulary.js'), 'utf8');
  assert.doesNotThrow(() => new Script(vocabulary));
  assert.match(vocabulary, /adaptive: "Guided Genki II Course", all: "All vocabulary", genki: "Genki II Course", n5: "JLPT N5"/);
  assert.match(vocabulary, /id="vocabScopeDialog"/);
  assert.match(vocabulary, /id="vocabCurriculumDialog"/);
  assert.match(vocabulary, /data-curriculum-stage/);
  assert.match(vocabulary, /data-curriculum-filter="due"/);
  assert.match(vocabulary, /Practice this topic/);
  assert.match(vocabulary, /id="vocabCurriculumSort"/);
  assert.match(vocabulary, /Accuracy: low first/);
  assert.match(vocabulary, /JAPANESE_COLLATOR/);
  assert.match(vocabulary, /data-scope-track="genki"/);
  assert.match(vocabulary, /data-scope-track="n5"/);
  assert.match(vocabulary, /data-scope-preset="genki"/);
  assert.match(vocabulary, /data-scope-preset="n5"/);
  assert.match(vocabulary, /data-open-scope-topics="all"/);
  assert.match(vocabulary, /id="vocabScopeTopicSearch"/);
  assert.match(vocabulary, /id="vocabScopeSelectAll"/);
  assert.match(vocabulary, /id="vocabScopeBack"/);
  assert.match(vocabulary, /data-scope-topic/);
  assert.match(vocabulary, /customStageIds/);
  assert.match(vocabulary, /if \(scope === "all"\) return WORDS/);
  assert.match(vocabulary, /if \(scope === "custom"\) return WORDS\.filter\(word => word\.stageIds\.some\(id => state\.customStageIds\.includes\(id\)\)\)/);
  assert.match(vocabulary, /all: "All words"/);
  assert.match(vocabulary, /const ALL_STAGES = \[\.\.\.COURSE_STAGES, \.\.\.N5_STAGES\]/);
  assert.match(vocabulary, /existingWordIds\.length \? sourceWord\.existingWordIds : \[sourceWord\.sourceId\]/);
  assert.match(vocabulary, /const reviewPool = adaptive \? introducedWords\(\) : pool/);
  assert.match(vocabulary, /practicedEarly \? "Practiced early"/);
  assert.match(vocabulary, /function applyScopeSelection/);
});

test('vocabulary answers reveal a highlighted example with separate sentence audio', () => {
  const html = readFileSync(resolve(root, 'vocabulary.html'), 'utf8');
  const vocabulary = readFileSync(resolve(root, 'features/kana/vocabulary.js'), 'utf8');
  const styles = readFileSync(resolve(root, 'features/kana/vocabulary.css'), 'utf8');
  assert.match(html, /vocabulary-examples\.js/);
  assert.match(vocabulary, /class="vocab-example"/);
  assert.match(vocabulary, /id="vocabPlayExample"/);
  assert.match(vocabulary, /speakJapanese\?\.\(Examples\[word\.id\]\?\.\[0\]\)/);
  assert.match(styles, /\.vocab-example p mark/);
});

test('vocabulary review queue stays scoped and counts each word once', () => {
  const vocabulary = readFileSync(resolve(root, 'features/kana/vocabulary.js'), 'utf8');
  assert.match(vocabulary, /function regularReviewPool/);
  assert.match(vocabulary, /function reviewPoolForScope/);
  assert.match(vocabulary, /return scope === "trouble" \? weakWords\(pool\) : pool/);
  assert.match(vocabulary, /function wordIsDue/);
  assert.match(vocabulary, /function dueReviewBreakdown/);
  assert.match(vocabulary, /const words = pool\.filter\(word => wordIsDue\(word\)\)/);
  assert.match(vocabulary, /return dueReviewBreakdown\(\)\.total/);
  assert.match(vocabulary, /id="vocabDueSummary"/);
  assert.match(vocabulary, /id="vocabDueBreakdown"/);
  assert.match(vocabulary, /one shared review queue/);
  assert.doesNotMatch(vocabulary, /function dueModes/);
  assert.match(vocabulary, /Only weak words from the selected regular scope/);
  assert.match(vocabulary, /Recent misses in \$\{troubleSourceScope\}/);
});

test('vocabulary pacing interleaves new words with normal due reviews and prioritizes urgent retries', () => {
  const vocabulary = readFileSync(resolve(root, 'features/kana/vocabulary.js'), 'utf8');
  assert.match(vocabulary, /function paceMixLabel/);
  assert.match(vocabulary, /function urgentReviewEntries/);
  assert.match(vocabulary, /if \(urgent\.length\) return \{\s*\.\.\.selectReviewEntry\(urgent\)/);
  assert.match(vocabulary, /const decision = Scheduler\.nextIntroductionDecision\(state\.pace, state\.newWordCredit\)/);
  assert.match(vocabulary, /if \(due\.length\) return \{\s*\.\.\.selectReviewWord\(due, recent, true\)/);
  assert.match(vocabulary, /const scheduledChoice = selectReviewWord\(scheduled, recent, false, false\)/);
  assert.match(vocabulary, /return `\$\{state\.pace\}% new \/ \$\{100 - state\.pace\}% review target`/);
});

test('vocabulary uses global unlocks with one shared urgent schedule', () => {
  const vocabulary = readFileSync(resolve(root, 'features/kana/vocabulary.js'), 'utf8');
  assert.match(vocabulary, /const UNIFIED_REVIEW_MODEL = "unified-v1"/);
  assert.match(vocabulary, /urgentMode: "", urgentRetryPending: false/);
  assert.match(vocabulary, /progress\.urgentRetryPending = progress\.lastWasCorrect === false/);
  assert.match(vocabulary, /const wasUrgentRetry = progress\.urgentRetryPending && progress\.urgentMode === currentMode/);
  assert.match(vocabulary, /Scheduler\.nextReviewSchedule\(progress\.mastery, scheduleCorrect, state\.total, now\)/);
  assert.match(vocabulary, /return progress\.introduced && progress\.seen > 0 && progress\.mastery >= 72/);
  assert.match(vocabulary, /if \(wasUrgentRetry\) \{\s*progress\.urgentRetryPending = false;/);
});

test('vocabulary introduction and TTS controls have keyboard access', () => {
  const vocabulary = readFileSync(resolve(root, 'features/kana/vocabulary.js'), 'utf8');
  assert.match(vocabulary, /Practice this word <kbd>Enter<\/kbd>/);
  assert.match(vocabulary, /aria-keyshortcuts="Enter"/);
  assert.match(vocabulary, /setTimeout\(\(\) => \$\("#vocabStartCheck"\)\?\.focus\(\), 0\)/);
  assert.match(vocabulary, /Play again <kbd>R<\/kbd>/);
  assert.match(vocabulary, /Replay word <kbd>R<\/kbd>/);
  assert.doesNotMatch(vocabulary, /Replay as often as you need, or press <kbd>R<\/kbd>/);
  assert.doesNotMatch(vocabulary, /Press <kbd>R<\/kbd> to replay the audio/);
  assert.doesNotMatch(vocabulary, /<kbd>R<\/kbd> to hear it/);
  assert.match(vocabulary, /if \(key === "r"/);
  assert.match(vocabulary, /phase === "introduction" \? \$\("#vocabIntroSpeech"\)/);
});

test('vocabulary answer choices support an adaptive default and manual override', () => {
  const vocabulary = readFileSync(resolve(root, 'features/kana/vocabulary.js'), 'utf8');
  assert.match(vocabulary, /choiceCount: "auto"/);
  assert.match(vocabulary, /<select id="vocabChoiceCount"><option value="auto">Auto \(adaptive\)<\/option><option value="4">4 choices<\/option><option value="6">6 choices<\/option><option value="8">8 choices<\/option><option value="not-used" disabled>Not used for speaking<\/option><\/select>/);
  assert.match(vocabulary, /if \(state\.choiceCount !== "auto"\) return Number\(state\.choiceCount\)/);
  assert.match(vocabulary, /currentChoiceCount = choices\.length/);
  assert.match(vocabulary, /state\.choiceCount = CHOICE_COUNT_VALUES\.includes\(event\.target\.value\) \? event\.target\.value : "auto"/);
  assert.match(vocabulary, /Uses \$\{state\.choiceCount\} choices from the next question/);
});

test('vocabulary offers a silent bidirectional written mode', () => {
  const vocabulary = readFileSync(resolve(root, 'features/kana/vocabulary.js'), 'utf8');
  assert.match(vocabulary, /<option value="written-both">Japanese ↔ English \(written\)<\/option>/);
  assert.match(vocabulary, /if \(state\.questionFormat === "written-both"\) return \["written", "recall"\]/);
  assert.match(vocabulary, /"written-both": "Silent practice alternates between Japanese text → English and English → Japanese\."/);
  assert.match(vocabulary, /\["written", "spoken", "recall", "speaking", "written-both", "mixed"\]/);
});

test('standalone activity headers separate navigation from cloud status', () => {
  const shell = readFileSync(resolve(root, 'shared/activity-shell.js'), 'utf8');
  const trainer = readFileSync(resolve(root, 'features/kana/trainer.js'), 'utf8');
  const trainerStyles = readFileSync(resolve(root, 'features/kana/trainer.css'), 'utf8');
  const home = readFileSync(resolve(root, 'index.html'), 'utf8');
  const settings = readFileSync(resolve(root, 'settings.html'), 'utf8');
  const guided = readFileSync(resolve(root, 'guided/player.html'), 'utf8');
  assert.match(shell, /class="header-nav"/);
  assert.match(shell, /class="pill header-sync-status" role="status"/);
  assert.match(trainer, /headerNav\.className="header-nav"/);
  assert.match(trainer, /headerPill\.classList\.add\("header-sync-status"\)/);
  for (const page of [home, settings, guided]) {
    assert.match(page, /header-sync-status/);
    assert.match(page, /role="status"/);
  }
  assert.match(trainerStyles, /\.header-actions\{display:grid;justify-items:end/);
  assert.match(trainerStyles, /\.header-sync-status::before/);
});

test('non-home top rows use the shared Home and Settings navigation', () => {
  const settings = readFileSync(resolve(root, 'settings.html'), 'utf8');
  const guided = readFileSync(resolve(root, 'guided/player.html'), 'utf8');
  const guidedHeader = guided.match(/<header class="lesson-header">([\s\S]*?)<\/header>/)?.[1] || '';

  assert.match(
    settings,
    /<div class="header-nav"><a class="ghost header-link-button" href="\.\/index\.html">Home<\/a><\/div>/,
  );
  assert.doesNotMatch(settings, /header-link-button" href="\.\/(?:vocabulary|numbers)\.html"/);
  assert.match(
    guidedHeader,
    /<a class="ghost lesson-link-button" href="\.\.\/index\.html">Home<\/a>[\s\S]*<a class="ghost lesson-link-button" href="\.\.\/settings\.html">Settings &amp; Data<\/a>/,
  );
  assert.doesNotMatch(guidedHeader, /Guided lessons|Kana Mix/);
});

test('published entrypoints receive the inline navigation progress bar', () => {
  const prepareScript = readFileSync(resolve(root, 'scripts/prepare-site-assets.mjs'), 'utf8');
  const progressScript = readFileSync(resolve(root, 'shared/navigation-progress.js'), 'utf8');
  const progressStyles = readFileSync(resolve(root, 'shared/navigation-progress.css'), 'utf8');

  assert.match(prepareScript, /navigationProgressHead/);
  assert.match(prepareScript, /html\.replace\('<head>'/);
  assert.match(progressScript, /document\.addEventListener\('click'/);
  assert.match(progressScript, /window\.addEventListener\('pageshow'/);
  assert.match(progressStyles, /html\.navigation-progress-active::before/);
  assert.match(progressStyles, /prefers-reduced-motion: reduce/);
});

test('published entrypoints receive release-aware update controls', () => {
  const prepareScript = readFileSync(resolve(root, 'scripts/prepare-site-assets.mjs'), 'utf8');
  const updateScript = readFileSync(resolve(root, 'shared/app-updates.js'), 'utf8');
  const updateStyles = readFileSync(resolve(root, 'shared/app-updates.css'), 'utf8');
  const syncScript = readFileSync(resolve(root, 'shared/progress-sync.js'), 'utf8');
  const progressRoute = readFileSync(resolve(root, 'app/api/progress/route.ts'), 'utf8');
  const releases = JSON.parse(readFileSync(resolve(root, 'content/releases.json'), 'utf8'));

  assert.ok(releases.releases.length > 0);
  assert.equal(new Set(releases.releases.map(release => release.id)).size, releases.releases.length);
  assert.match(prepareScript, /data-app-release/);
  assert.match(prepareScript, /pageScopes/);
  assert.match(updateScript, /A new version is ready/);
  assert.match(updateScript, /Update & reload/);
  assert.match(updateScript, /Continue practicing/);
  assert.match(updateScript, /kana-sprint-release-observed/);
  assert.match(updateStyles, /\.app-update-banner/);
  assert.match(updateStyles, /\.app-changelog/);
  assert.match(updateStyles, /\.app-changelog\s*\{[^}]*overflow:\s*hidden/s);
  assert.match(updateStyles, /\.app-changelog-inner\s*\{[^}]*overflow-y:\s*auto/s);
  assert.match(syncScript, /observeRelease\(cloud\)/);
  assert.match(syncScript, /visibilitychange/);
  assert.match(progressRoute, /releaseId: LATEST_RELEASE_ID/);
  assert.doesNotMatch(updateScript, /setInterval/);
});

test('speaking practice exposes error, kana interpretation, romaji, and post-submit states', () => {
  const vocabulary = readFileSync(resolve(root, 'features/kana/vocabulary.js'), 'utf8');
  const styles = readFileSync(resolve(root, 'features/kana/vocabulary.css'), 'utf8');
  assert.match(vocabulary, /id="vocabSpeechInterpretation"/);
  assert.match(vocabulary, /id="vocabTypeRomaji"/);
  assert.match(vocabulary, /id="vocabRomajiPreview"/);
  assert.match(vocabulary, /\$\("#vocabSpeechActions"\)\.classList\.add\("hidden"\)/);
  assert.match(vocabulary, /Press <kbd>Enter<\/kbd> to start speaking/);
  assert.match(vocabulary, /Press <kbd>Enter<\/kbd> to stop recording/);
  assert.match(vocabulary, /Press <kbd>Enter<\/kbd> to submit · <kbd>R<\/kbd> to try again/);
  assert.match(vocabulary, /Try again <kbd>R<\/kbd>/);
  assert.match(vocabulary, /\["review", "mismatch"\]\.includes\(speechStatus\) && !typedAnswer && !typingTarget/);
  assert.match(vocabulary, /Type an answer to enable Submit answer/);
  assert.match(vocabulary, /Press <kbd>Enter<\/kbd> for the next question/);
  assert.match(styles, /vocabSpeechStatus\[data-status="error"\]/);
  assert.match(vocabulary, /correctFinalTranscript/);
  assert.match(vocabulary, /submitSpeaking\(true\)/);
  assert.match(vocabulary, /That doesn’t match yet\. Try speaking again or type your answer\./);
  assert.match(vocabulary, /speechStatus !== "review"/);
  assert.match(styles, /vocabSpeechStatus\[data-status="mismatch"\]/);
  assert.match(vocabulary, /id="vocabSpeechSubmit"[^>]*disabled/);
  assert.match(vocabulary, /\$\("#vocabSpeechSubmit"\)\.classList\.add\("hidden"\)/);
  assert.match(vocabulary, /\$\("#vocabSpeechSubmit"\)\.classList\.remove\("hidden"\)/);
  assert.match(vocabulary, /Speaking\.matchesSpoken\(current, snapshot\.text\)/);
  assert.match(vocabulary, /Complete and say the Japanese phrase/);
  assert.match(vocabulary, /SpeechDiagnostics\?\.resolve\(speechEvidence/);
});

test('speaking direction keeps session controls aligned and disables answer choices', () => {
  const vocabulary = readFileSync(resolve(root, 'features/kana/vocabulary.js'), 'utf8');
  const styles = readFileSync(resolve(root, 'features/kana/vocabulary.css'), 'utf8');
  assert.match(vocabulary, /<option value="not-used" disabled>Not used for speaking<\/option>/);
  assert.match(vocabulary, /choiceSelect\.disabled = speaking/);
  assert.match(vocabulary, /Multiple-choice settings don’t apply here\./);
  assert.match(styles, /\.vocab-setup>label,\.vocab-scope-field\{[^}]*align-self:start/);
  assert.match(styles, /\.vocab-setup small,\.vocab-scope-field>small\{min-height:2\.7em/);
});

test('numbers offers explicit speech recognition with review and typing fallback controls', () => {
  const numbers = readFileSync(resolve(root, 'features/kana/numbers.js'), 'utf8');
  const styles = readFileSync(resolve(root, 'features/kana/numbers.css'), 'utf8');
  const html = readFileSync(resolve(root, 'numbers.html'), 'utf8');
  assert.match(html, /numbers-speaking\.js/);
  assert.match(numbers, /<option value="speaking">Digits → Japanese \(Speaking\)<\/option>/);
  assert.match(numbers, /Press <kbd>Enter<\/kbd> to start speaking/);
  assert.match(numbers, /Press <kbd>Enter<\/kbd> to submit · <kbd>R<\/kbd> to try again/);
  assert.match(numbers, /Type an answer to enable Submit answer/);
  assert.match(numbers, /\$\("#numberSpeechActions"\)\.classList\.add\("number-hidden"\)/);
  assert.match(styles, /numberSpeechStatus\[data-status="error"\]/);
  assert.match(numbers, /correctFinalTranscript/);
  assert.match(numbers, /submitSpeakingAnswer\(true\)/);
  assert.match(numbers, /That doesn’t match yet\. Try speaking again or type your answer\./);
  assert.match(numbers, /speechStatus !== "review"/);
  assert.match(styles, /numberSpeechStatus\[data-status="mismatch"\]/);
  assert.match(numbers, /id="numberSpeechSubmit"[^>]*disabled/);
  assert.match(numbers, /\$\("#numberSpeechSubmit"\)\.classList\.add\("number-hidden"\)/);
  assert.match(numbers, /\$\("#numberSpeechSubmit"\)\.classList\.remove\("number-hidden"\)/);
  assert.match(numbers, /SpeechDiagnostics\?\.resolve\(speechEvidence/);
});

test('settings exposes local speech diagnostics controls', () => {
  const settings = readFileSync(resolve(root, 'settings.html'), 'utf8');
  const script = readFileSync(resolve(root, 'features/settings/settings.js'), 'utf8');
  assert.match(settings, /speech-diagnostics\.js/);
  assert.match(settings, /id="speechDiagnostics"/);
  assert.match(settings, /id="copyDiagnostics"/);
  assert.match(settings, /id="clearDiagnostics"/);
  assert.match(script, /Diagnostics\?\.summarize/);
  assert.match(script, /never include audio|No audio is included/);
});

test('number pattern mastery uses the same collapsible plus and minus pattern as vocabulary', () => {
  const numbers = readFileSync(resolve(root, 'features/kana/numbers.js'), 'utf8');
  const styles = readFileSync(resolve(root, 'features/kana/numbers.css'), 'utf8');
  assert.match(numbers, /<details class="card number-mastery-card">/);
  assert.match(numbers, /<strong>Pattern mastery<\/strong>/);
  assert.match(styles, /\.number-mastery-card > summary::after \{ content: "\+"/);
  assert.match(styles, /\.number-mastery-card\[open\] > summary::after \{ content: "−"/);
});

test('stylesheet asset references remain valid after source moves', () => {
  for (const stylesheet of stylesheetsWithLocalAssets) {
    const cssPath = resolve(root, stylesheet);
    const css = readFileSync(cssPath, 'utf8');
    const references = [...css.matchAll(/url\(["']?(\.{1,2}\/[^"')?#]+)/g)];

    for (const [, reference] of references) {
      const target = resolve(dirname(cssPath), reference);
      assert.ok(existsSync(target), `${stylesheet} references missing file ${reference}`);
    }
  }
});

test('frontend implementation is separated into features and content', () => {
  assert.ok(existsSync(resolve(root, 'features/kana/trainer.js')));
  assert.ok(existsSync(resolve(root, 'features/guided/player.js')));
  assert.ok(existsSync(resolve(root, 'content/kana/hiragana.js')));
  assert.ok(existsSync(resolve(root, 'content/guided/lesson-01.js')));
  assert.ok(existsSync(resolve(root, 'content/guided/lesson-02.js')));
  assert.ok(!existsSync(resolve(root, 'lessons')));
});

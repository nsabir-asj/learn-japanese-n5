import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createContext, runInContext } from 'node:vm';

const source = readFileSync(new URL('../features/kana/vocabulary.js', import.meta.url), 'utf8');
function pageFunction(name) {
  const start = source.indexOf(`  function ${name}(`);
  assert.ok(start >= 0);
  return source.slice(start, source.indexOf('\n  function ', start + 1));
}

function speakingPage() {
  const elements = new Map();
  const element = selector => {
    if (!elements.has(selector)) {
      const classes = new Set();
      const attributes = new Map();
      elements.set(selector, {
        value: '', dataset: {}, querySelectorAll: () => [],
        classList: {
          add: value => classes.add(value), remove: value => classes.delete(value),
          contains: value => classes.has(value),
          toggle(value, enabled) { if (enabled) classes.add(value); else classes.delete(value); },
        },
        setAttribute: (key, value) => attributes.set(key, value),
        removeAttribute: key => attributes.delete(key),
        getAttribute: key => attributes.get(key),
      });
    }
    return elements.get(selector);
  };
  const page = createContext({
    $: element, phase: 'question', currentMode: 'speaking', current: { id: 'ocha' },
    speechFailedAttempts: 0, speechStoppedByUser: false, typingSuggestionPulsePlayed: false,
    speechSession: null, speechStatus: 'idle', typedAnswer: false, speechEvidence: null,
    window: { SpeechRecognition: function Recognition() {} },
    SpeechDiagnostics: null, updateSpeakingKeyboardHint() {}, updateInterpretation() {},
    queueMicrotask() {}, questionNumber: 0,
    state: { total: 10, correct: 8, streak: 2, typingScript: 'romaji' },
  });
  page.Speaking = {
    matchesSpoken: (_word, text) => text === 'お茶',
    createSession(_Recognition, callback) {
      page.snapshot = callback;
      return { cancel() {}, stop() {} };
    },
  };
  for (const name of ['updateTypingSuggestion', 'setSpeechStatus', 'stopSpeaking', 'stopSpeechRecording', 'setupSpeaking']) {
    runInContext(pageFunction(name), page);
  }
  // Use the real new-question initialization, before unrelated question rendering.
  const showQuestion = pageFunction('showQuestion');
  runInContext(showQuestion.slice(0, showQuestion.indexOf('    $("#vocabCount")')) + '\n  }', page);
  page.setupSpeaking();
  page.element = element;
  page.fail = (id, patch = {}) => {
    page.snapshot({ status: 'starting', attemptId: id, text: '', errorCode: '' });
    page.snapshot({ status: 'review', attemptId: id, text: '別の言葉', errorCode: '', ...patch });
  };
  page.suggested = () => element('#vocabTypeInstead').classList.contains('is-suggested');
  return page;
}

test('three completed failures suggest typing without switching modes or grading answers', () => {
  const page = speakingPage();
  page.fail('one');
  page.fail('two', { status: 'error', text: '', errorCode: 'no-speech' });
  assert.equal(page.suggested(), false);
  page.fail('three', { status: 'error', text: '', errorCode: 'network' });
  assert.equal(page.suggested(), true);
  assert.equal(page.element('#vocabTypingSuggestion').classList.contains('hidden'), false);
  assert.equal(page.element('#vocabTypeInstead').getAttribute('aria-describedby'), 'vocabTypingSuggestion');
  assert.equal(page.typedAnswer, false);
  assert.equal(page.currentMode, 'speaking');
  assert.deepEqual({ ...page.state }, { total: 10, correct: 8, streak: 2, typingScript: 'romaji' });
});

test('typing suggestion pulses once per question, not after every retry or mode toggle', () => {
  const page = speakingPage();
  const button = page.element('#vocabTypeInstead');
  for (const id of ['one', 'two', 'three']) page.fail(id);
  assert.equal(button.classList.contains('is-suggestion-pulsing'), true);
  // Simulate the completed animation: subsequent recognition updates must not restart it.
  button.classList.remove('is-suggestion-pulsing');
  page.fail('four');
  assert.equal(button.classList.contains('is-suggestion-pulsing'), false);
  page.typedAnswer = true;
  page.setSpeechStatus('typed', 'Type your answer.');
  page.setupSpeaking();
  assert.equal(page.suggested(), true);
  assert.equal(button.classList.contains('is-suggestion-pulsing'), false);
  page.showQuestion({ id: 'mizu' }, 'speaking');
  page.setupSpeaking();
  for (const id of ['new-one', 'new-two', 'new-three']) page.fail(id);
  assert.equal(button.classList.contains('is-suggestion-pulsing'), true);
});

test('interim text, duplicate terminal callbacks, and correct transcripts do not inflate failures', () => {
  const page = speakingPage();
  page.snapshot({ status: 'listening', text: '別の言葉', attemptId: 'interim' });
  assert.equal(page.speechFailedAttempts, 0);
  page.fail('one');
  page.snapshot({ status: 'review', text: '別の言葉', attemptId: 'one' });
  assert.equal(page.speechFailedAttempts, 1);
  page.fail('correct', { text: 'お茶' });
  assert.equal(page.speechFailedAttempts, 1);
  assert.equal(page.suggested(), false);
});

test('manually ending an empty recording does not count as a failed recognition attempt', () => {
  const page = speakingPage();
  for (let index = 0; index < 3; index++) {
    page.snapshot({ status: 'starting', text: '', attemptId: String(index) });
    page.stopSpeechRecording();
    page.snapshot({ status: 'error', text: '', attemptId: String(index), errorCode: 'no-final-result' });
  }
  assert.equal(page.speechFailedAttempts, 0);
  assert.equal(page.suggested(), false);
});

test('typing hides the hint, microphone retries retain the count, and a new question resets it', () => {
  const page = speakingPage();
  for (const id of ['one', 'two', 'three']) page.fail(id);
  page.typedAnswer = true;
  page.setSpeechStatus('typed', 'Type in romaji.');
  assert.equal(page.suggested(), false);
  assert.equal(page.element('#vocabTypingSuggestion').classList.contains('hidden'), true);
  page.setupSpeaking();
  assert.equal(page.suggested(), true);
  const oldCallback = page.snapshot;
  page.showQuestion({ id: 'mizu' }, 'speaking');
  page.setupSpeaking();
  assert.equal(page.speechFailedAttempts, 0);
  assert.equal(page.suggested(), false);
  oldCallback({ status: 'error', text: '', attemptId: 'late', errorCode: 'network' });
  assert.equal(page.speechFailedAttempts, 0);
});

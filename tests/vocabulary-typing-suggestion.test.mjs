import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createContext, runInContext } from 'node:vm';

const source = readFileSync(new URL('../features/kana/vocabulary.js', import.meta.url), 'utf8');
test('Enter retries mismatches, starts and stops recording, submits typing, and ignores held keys', () => {
  const actions = [];
  let handler;
  const page = createContext({
    phase: 'question', currentMode: 'speaking', speechStatus: 'mismatch', typedAnswer: false,
    $: () => ({ classList: { contains: () => true }, click: () => actions.push('record') }),
    document: { addEventListener(_type, callback) { handler = callback; } },
    stopSpeechRecording: () => actions.push('stop'), submitSpeaking: () => actions.push('submit'),
  });
  const start = source.indexOf('  // Capture speaking shortcuts');
  const end = source.indexOf('  document.addEventListener("visibilitychange"', start);
  runInContext(source.slice(start, end), page);
  const press = (key = 'Enter', repeat = false, isComposing = false) => handler({
    key, repeat, isComposing, target: { closest: () => false, matches: () => false },
    preventDefault() {}, stopImmediatePropagation() {},
  });
  press();
  assert.deepEqual(actions.splice(0), ['record']);
  press('Enter', true);
  press('Enter', false, true);
  press('r');
  assert.deepEqual(actions, []);
  page.speechStatus = 'listening';
  press();
  assert.deepEqual(actions.splice(0), ['stop']);
  page.speechStatus = 'idle';
  press();
  assert.deepEqual(actions.splice(0), ['record']);
  page.speechStatus = 'error';
  press();
  assert.deepEqual(actions.splice(0), ['record']);
  page.typedAnswer = true;
  page.speechStatus = 'typed';
  press();
  assert.deepEqual(actions.splice(0), ['submit']);
});

test('T switches to typing only in a speaking question outside editable controls', () => {
  const actions = [];
  let handler;
  const page = createContext({
    phase: 'question', currentMode: 'speaking', typedAnswer: false,
    $: selector => ({ classList: { contains: () => true }, click: () => actions.push(selector) }),
    document: { addEventListener(_type, callback) { handler = callback; } },
  });
  const start = source.indexOf('  // Capture speaking shortcuts');
  runInContext(source.slice(start, source.indexOf('  document.addEventListener("visibilitychange"', start)), page);
  const press = (patch = {}) => handler({ key: 't', target: { closest: () => false },
    preventDefault() {}, stopImmediatePropagation() {}, ...patch });
  press();
  press({ key: 'T' });
  assert.deepEqual(actions.splice(0), ['#vocabTypeInstead', '#vocabTypeInstead']);
  for (const patch of [{ repeat: true }, { isComposing: true }, { keyCode: 229 },
    { ctrlKey: true }, { altKey: true }, { metaKey: true }, { target: { closest: () => true } }]) press(patch);
  page.typedAnswer = true;
  press();
  page.typedAnswer = false;
  page.phase = 'answered';
  press();
  page.phase = 'question';
  page.currentMode = 'listening';
  press();
  assert.deepEqual(actions, []);
  assert.match(source, /Submit answer <kbd>Enter<\/kbd>/);
});

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
  assert.match(page.element('#vocabRecord').innerHTML, /Speak <kbd>Enter<\/kbd>/);
  assert.equal(page.element('#vocabRecord').getAttribute('aria-keyshortcuts'), 'Enter');
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

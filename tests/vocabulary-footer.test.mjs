import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';

const source = readFileSync(new URL('../features/kana/vocabulary.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../features/kana/vocabulary.css', import.meta.url), 'utf8');
function pageFunction(name) {
  const start = source.indexOf(`  function ${name}(`);
  return source.slice(start, source.indexOf('\n  function ', start + 1));
}

test('vocabulary footer puts guidance first and its stable action area on the right', () => {
  assert.match(source, /footer-actions vocab-footer-actions[^\n]*vocabKeyboardHint[^\n]*vocab-footer-buttons[^\n]*vocabDontKnow[^\n]*big-button hidden[^\n]*vocabNext/);
  assert.match(styles, /\.vocab-footer-buttons\{[^}]*margin-left:auto/);
  assert.match(styles, /\.vocab-footer-buttons>button\{[^}]*min-height:44px/);
  assert.match(styles, /@media\(max-width:520px\),\(hover:none\) and \(pointer:coarse\)\{[^}]*vocabKeyboardHint\{display:none/);
});

test('a rapid tap or Enter after answering cannot immediately advance past the review', () => {
  const button = { disabled: false };
  const timers = [];
  let now = 1000;
  let selections = 0;
  const page = createContext({
    phase: 'answered', current: { id: 'mizu' }, nextReadyAt: 0,
    Date: { now: () => now }, $: () => button,
    setTimeout: (callback, delay) => timers.push({callback, delay}),
    stopSpeaking() {}, window: {}, selectWord() { selections++; return null; },
  });
  runInContext(pageFunction('prepareNextButton'), page);
  runInContext(pageFunction('nextQuestion'), page);
  page.prepareNextButton();
  assert.equal(button.disabled, true);
  assert.equal(timers[0].delay, 350);
  page.nextQuestion();
  assert.equal(selections, 0);
  now += 350;
  timers[0].callback();
  assert.equal(button.disabled, false);
  page.nextQuestion();
  assert.equal(selections, 1);
  page.prepareNextButton();
  page.current = { id: 'ocha' };
  now += 350;
  timers[1].callback();
  assert.equal(button.disabled, true, 'An old callback must not enable a different question');
});

test('Enter activates verb cards and dialog controls instead of advancing the question', () => {
  let onKey;
  let advances = 0;
  class Element {
    constructor(kind) { this.kind = kind; }
    matches() { return false; }
    closest(selector) { return selector.split(',').includes(this.kind) ? this : null; }
  }
  const page = createContext({
    HTMLElement: Element, phase: 'answered',
    $: () => ({ classList: { contains: () => true } }),
    nextQuestion: () => advances++,
    document: { addEventListener: (name, handler) => { onKey = handler; }, getElementById: () => dialog },
  });
  const start = source.lastIndexOf('  document.addEventListener("keydown", event => {');
  runInContext(source.slice(start, source.indexOf('\n  });', start) + '\n  });'.length), page);
  let prevented = false;
  let dialog = { open: false };
  const event = { key: 'Enter', preventDefault: () => { prevented = true; } };
  for (const kind of ['summary', '.vocab-verb-card']) {
    onKey({ ...event, target: new Element(kind) });
    assert.equal(advances, 0);
    assert.equal(prevented, false, 'Native card and summary activation must remain available');
  }
  dialog.open = true;
  onKey({ ...event, target: new Element('close-button') });
  onKey({ ...event, key: 'r', target: new Element('dialog') });
  assert.equal(advances, 0);
  assert.equal(prevented, false, 'Dialog controls retain native keyboard handling');
  dialog.open = false;
  onKey({ ...event, target: new Element('container') });
  assert.equal(advances, 1, 'Enter elsewhere still advances to the next question');
});

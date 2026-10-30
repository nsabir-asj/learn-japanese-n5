(() => {
  "use strict";
  const C = globalThis.SENTENCE_COURSE, E = globalThis.SENTENCE_ENGINE;
  const KEY = "kanaSprintSentencesV1";
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const defaults = () => ({ version:1, total:0, correct:0, streak:0, bestStreak:0, items:{}, skills:{}, introduced:{}, wordsSeen:{}, settings:{ activity:"build", support:"supported", input:"choice", typingScript:"romaji", bankSize:"auto", vocabulary:"prefer", review:"all", scopes:{build:["identity","possession","questions"],particles:["identity","possession","questions"],verbs:["verbs-u","verbs-ru","verbs-irregular"]} } });
  let state = defaults();
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved?.version === 1) {
      state = { ...state, ...saved, settings:{...state.settings,...saved.settings,scopes:{...state.settings.scopes,...saved.settings?.scopes}} };
      for (const field of ["items","skills","introduced","wordsSeen"]) if (!state[field] || typeof state[field] !== "object" || Array.isArray(state[field])) state[field] = {};
      for (const [key, options] of Object.entries({activity:["build","particles","verbs"],support:["supported","independent"],input:["choice","typing"],typingScript:["romaji","japanese"],bankSize:["auto","8","12"],vocabulary:["prefer","introduced","mastered","any"],review:["all","trouble"]})) if (!options.includes(state.settings[key])) state.settings[key] = defaults().settings[key];
      for (const activity of ["build","particles","verbs"]) state.settings.scopes[activity] = Array.isArray(state.settings.scopes[activity]) ? state.settings.scopes[activity].filter(id => C.topics.some(t => t.id === id)) : defaults().settings.scopes[activity];
    }
  } catch { /* A broken saved snapshot should not stop practice. */ }
  let current = null, selected = [], bank = [], answers = [], activeSlot = 0, answered = false, assisted = false, recent = [], sessionTotal = 0, sessionCorrect = 0, sessionUnaided = 0;
  let draft = new Set(), scopeView = "lessons", scopeSearch = "", teaching = false;
  const settings = () => ({...state.settings,topics:state.settings.scopes[state.settings.activity]});
  const modeName = () => ({build:state.settings.support === "supported" ? "Supported building" : "Independent building",particles:state.settings.input === "choice" ? "Particle choices" : "Particle recall",verbs:state.settings.input === "choice" ? "Verb choices" : "Verb recall"}[state.settings.activity]);
  const availableTopics = () => C.topics.filter(t => state.settings.activity === "verbs" ? t.verbGroup : !t.verbGroup);
  function vocabulary() { try { return JSON.parse(localStorage.getItem("kanaSprintVocabularyV1")) || {}; } catch { return {}; } }
  function save() {
    state.savedAt = Date.now();
    try { localStorage.setItem(KEY,JSON.stringify(state)); }
    catch { $("#saveNotice").textContent = "Browser storage is unavailable. Keep this tab open to retain this session."; }
  }
  function pool(config = settings()) {
    const result = E.pool(config,vocabulary());
    return config.review === "trouble" ? result.filter(x => state.items[E.recordKey(x,config)]?.lastWasCorrect === false && state.items[E.recordKey(x,config)]?.wrong > 0) : result;
  }
  function scopeLabel() {
    const ids = settings().topics;
    const lessons = C.lessons.filter(l => C.topics.some(t => t.lesson === l.id && ids.includes(t.id)));
    return lessons.length ? lessons.map(l => `Lesson ${l.id}`).join(" + ") : "Choose topics";
  }
  $(".wrap").insertAdjacentHTML("beforeend", `<main id="sentencePractice">
    <nav class="sp-activities" aria-label="Practice activity">
      <button type="button" data-activity="build"><span class="sp-nav-icon" aria-hidden="true">文</span><span><strong>Build sentences</strong><small>Put the meaning together</small></span></button>
      <button type="button" data-activity="particles"><span class="sp-nav-icon" aria-hidden="true">を</span><span><strong>Practise particles</strong><small>Focus on the connections</small></span></button>
      <button type="button" data-activity="verbs"><span class="sp-nav-icon" aria-hidden="true">る</span><span><strong>Practise verbs</strong><small>Find the right form</small></span></button>
    </nav>
    <div class="sp-context"><div class="sp-collection" aria-label="Practice collection"><span class="sp-eyebrow">Practice collection</span><div class="sp-collection-row"><div class="sp-collection-copy"><strong id="scopeName"></strong><span id="scopeCount"></span></div><button class="sp-change" id="openScope" type="button" aria-haspopup="dialog" aria-controls="scopeDialog" aria-label="Change practice collection">Change</button></div></div><div class="sp-segments" id="modeControls" role="group" aria-label="Practice support"></div></div>
    <p id="modeDescription" class="sp-mode-description"></p>
    <section class="sp-workspace" aria-label="Practice exercise"><div class="sp-question-card" id="questionCard"></div></section>
    <details class="sp-settings" id="sessionSettings"><summary><span><strong>Session settings</strong><small id="settingsSummary"></small></span></summary><div class="sp-settings-grid"><label>Vocabulary<select id="vocabularyFilter"><option value="prefer">Prefer familiar words</option><option value="introduced">Only introduced words</option><option value="mastered">Only mastered words</option><option value="any">Any words in this collection</option></select><small>Uses progress from Vocabulary. Strict filters include every content word; clock phrases without Vocabulary records are excluded.</small></label><label>Practice mix<select id="reviewFilter"><option value="all">New material + review</option><option value="trouble">Trouble exercises only</option></select><small>Trouble practice uses mistakes in the current activity and answer format.</small></label><label id="bankSizeSetting">Word bank size<select id="bankSize"><option value="auto">Auto · 6 chunks / 8 words</option><option value="8">8 choices</option><option value="12">12 choices</option></select><small>Related extra words and contrasting verb forms make you choose from meaning. Strict vocabulary filters may limit the available choices.</small></label><p class="sp-settings-note">Grammar is available immediately. Lesson numbers organize the collections; guided-lesson completion is never required. Vocabulary hints and rules count as support when used before answering.</p></div></details>
    <details class="sp-progress" id="practiceProgress"><summary><span><strong>Progress &amp; trouble spots</strong><small>See what you can do with and without support</small></span></summary><div id="progressBody"></div></details>
    <p class="sp-save-notice" id="saveNotice" role="status"></p>
  </main>
  <dialog class="sp-dialog" id="scopeDialog" aria-labelledby="scopeTitle"><div class="sp-dialog-shell"><header><div><p class="sp-eyebrow">Make it your own</p><h2 id="scopeTitle">Choose your practice</h2><p>Combine lessons or pick individual topics. Everything is open.</p></div><button class="sp-icon-button" id="closeScope" type="button" aria-label="Close collection picker">×</button></header><div class="sp-dialog-controls"><div class="sp-segments" role="group" aria-label="Browse collections"><button type="button" data-scope-view="lessons">By lesson</button><button type="button" data-scope-view="topics">By topic</button></div><input id="scopeSearch" type="search" aria-label="Search topics" placeholder="Find a topic or particle…"><div class="sp-select-tools"><button type="button" id="selectAll">Select all</button><button type="button" id="clearAll">Clear</button></div></div><div id="scopeOptions" class="sp-scope-options"></div><footer><div><strong id="selectionCount"></strong><small id="selectionHint"></small></div><button class="sp-primary" id="applyScope" type="button">Apply selection</button></footer></div></dialog>
  <dialog class="sp-dialog sp-rule-dialog" id="ruleDialog" aria-labelledby="ruleTitle"><div class="sp-dialog-shell"><header><div><p class="sp-eyebrow">Pattern guide</p><h2 id="ruleTitle"></h2></div><button class="sp-icon-button" id="closeRule" type="button" aria-label="Close rule guide">×</button></header><div id="ruleBody" class="sp-rule-body"></div></div></dialog>`);

  function renderChrome() {
    const s = state.settings;
    document.querySelectorAll(".sp-activities button").forEach(button => button.setAttribute("aria-pressed",String(button.dataset.activity === s.activity)));
    $("#scopeName").textContent = scopeLabel();
    const topicCount = settings().topics.filter(id => availableTopics().some(t => t.id === id)).length;
    $("#scopeCount").textContent = `${topicCount} ${topicCount === 1 ? "topic" : "topics"} · ${pool().length} exercises`;
    $("#modeControls").innerHTML = s.activity === "build" ? ["supported","independent"].map(id => `<button type="button" data-support="${id}" aria-pressed="${s.support === id}">${id === "supported" ? "Supported" : "Independent"}</button>`).join("") : ["choice","typing"].map(id => `<button type="button" data-input="${id}" aria-pressed="${s.input === id}">${id === "choice" ? "Choose" : "Type"}</button>`).join("");
    $("#modeDescription").textContent = s.activity === "build" ? s.support === "supported" ? "Start with useful chunks. Particles stay attached to their words." : "Choose words and particles separately. Extra particles can remain unused." : s.activity === "particles" ? "The words are in place. Choose what connects them; sometimes no particle is needed." : "Start from the dictionary form. Make the polite affirmative or negative form.";
    $("#vocabularyFilter").value = s.vocabulary; $("#reviewFilter").value = s.review;
    $("#bankSize").value = s.bankSize; $("#bankSizeSetting").hidden = s.activity !== "build";
    $("#settingsSummary").textContent = `${$("#vocabularyFilter").selectedOptions[0].textContent} · ${s.review === "trouble" ? "Trouble only" : "New + review"}`;
    updateStats();
  }
  function updateStats() {
    const list = pool({...settings(),review:"all"});
    const records = list.map(x => state.items[E.recordKey(x,settings())]).filter(Boolean);
    const due = records.filter(x => x.dueAt <= Date.now() && x.dueQuestion <= state.total).length;
    window.dispatchEvent(new CustomEvent("kana-sprint-activity-status",{detail:{note:scopeLabel(),metrics:[{label:"Practised in this format",value:`${records.length} / ${list.length}`},{label:"Ready for review",value:due},{label:"Current streak",value:state.streak},{label:"Answers this session",value:sessionTotal},{label:"Unaided correct",value:sessionUnaided ? `${sessionCorrect}/${sessionUnaided}` : "—"}]}}));
    renderProgress();
  }
  function renderProgress() {
    const s = settings();
    $("#progressBody").innerHTML = `<p class="sp-muted">Supported building, independent building, choices, and typing have separate records. Reading a rule or arranging a supported chunk does not establish independent particle recall.</p><div class="sp-progress-grid">${availableTopics().filter(t => s.topics.includes(t.id)).map(topic => {
      const exercises = E.pool({...s,topics:[topic.id],vocabulary:"any"});
      const rows = exercises.map(x => state.items[E.recordKey(x,s)]).filter(Boolean);
      const correct = rows.reduce((a,x) => a + x.correct,0), attempts = rows.reduce((a,x) => a + x.correct + x.wrong,0);
      return `<div><strong>${esc(topic.title)}</strong><span>${rows.length}/${exercises.length} practised · ${attempts ? `${Math.round(correct/attempts*100)}% unaided` : "No unaided answers yet"}</span></div>`;
    }).join("")}</div><div class="sp-trouble"><h3>Particle trouble spots</h3>${Object.entries(state.skills).filter(([,x]) => x.wrong > 0 && x.lastWasCorrect === false).slice(-5).map(([key,x]) => `<div><span><strong>${esc(C.roles[x.role].title)}</strong><small>${esc(C.roles[x.role].note)}</small></span><button type="button" data-focus="${esc(x.topic)}">Practise</button></div>`).join("") || '<p class="sp-muted">Recent particle mistakes will appear here after independent building or particle practice.</p>'}</div>`;
  }
  function ruleMarkup(topic) {
    return `<p class="sp-rule-copy">${esc(topic.rule)}</p><div class="sp-models">${topic.examples.map(([jp,en]) => `<div><strong lang="ja">${esc(jp)}</strong><span>${esc(en)}</span></div>`).join("")}</div>`;
  }
  function next() {
    window.KANA_SPRINT_SPEECH?.stop();
    answered = false; assisted = false; selected = []; answers = []; activeSlot = 0; teaching = false;
    const config = settings(), vocab = vocabulary();
    current = E.choose(pool(),config,state,recent,vocab);
    renderChrome();
    if (!current) {
      $("#questionCard").innerHTML = `<div class="sp-empty"><span class="sp-empty-mark" aria-hidden="true">文</span><h2>${config.review === "trouble" ? "No trouble exercises in this selection" : "No matching exercises yet"}</h2><p>${config.review === "trouble" ? "Try new material and review, or choose another collection." : "Try a wider collection or change your vocabulary filter. Your strict selection has been kept."}</p><div class="sp-actions"><button class="sp-primary" type="button" data-action="scope">Choose topics</button><button class="sp-secondary" type="button" data-action="settings">Session settings</button></div></div>`;
      return;
    }
    recent.push(current.id); recent = recent.slice(-8);
    const topic = C.topics.find(t => t.id === current.topic);
    const missing = E.wordIds(current).filter(id => !E.familiar(id,vocab) && !state.wordsSeen[id]);
    if (!state.introduced[topic.id] || missing.length) {
      teaching = true;
      $("#questionCard").innerHTML = `<div class="sp-card-top"><span class="sp-eyebrow">${!state.introduced[topic.id] ? "Meet a new pattern" : "A few words before you begin"}</span><span class="sp-lesson-tag">Lesson ${topic.lesson}</span></div><h2>${esc(topic.title)}</h2>${!state.introduced[topic.id] ? ruleMarkup(topic) : ""}${missing.length ? `<div class="sp-word-intro"><h3>Words for this sentence</h3><p>You can study these here without changing your Vocabulary progress.</p>${missing.map(id => `<div><strong lang="ja">${esc(C.words[id].jp)}</strong><span>${esc(C.words[id].romaji)}</span><span>${esc(C.words[id].meaning)}</span></div>`).join("")}</div>` : ""}<p class="sp-muted">This first attempt will be supported. An unaided check will follow in later practice.</p><button class="sp-primary" type="button" data-action="start" aria-keyshortcuts="Enter">Try the pattern <kbd>Enter</kbd></button>`;
    } else renderExercise();
  }
  function renderExercise() {
    teaching = false;
    const s = state.settings, topic = C.topics.find(t => t.id === current.topic);
    $("#questionCard").innerHTML = `<div class="sp-card-top"><span class="sp-eyebrow">${esc(modeName())}</span><span class="sp-lesson-tag">Lesson ${topic.lesson}</span></div><p class="sp-task-label">${s.activity === "verbs" ? `Make the polite ${current.form} form` : "Say this in Japanese"}</p><h2 id="exercisePrompt" tabindex="-1">${esc(s.activity === "verbs" ? current.verb.meaning : current.meaning)}</h2>${current.context ? `<p class="sp-context-note">${esc(current.context)}</p>` : ""}<div id="exerciseBody"></div><div class="sp-answer-feedback" id="answerFeedback" role="status" aria-live="polite"></div><div class="sp-footer"><div class="sp-actions"><button class="sp-primary" type="button" data-action="check" id="checkAnswer" aria-keyshortcuts="Enter">Check answer <kbd>Enter</kbd></button><button class="sp-secondary" type="button" data-action="next" id="nextExercise" aria-keyshortcuts="Enter" hidden>Next sentence →</button><button class="sp-text-button" type="button" data-action="unknown" id="dontKnow">I don’t know</button></div><button class="sp-text-button" type="button" data-action="hint" id="hintButton">Hint</button></div><p class="sp-keyboard" id="keyboardNote"></p>`;
    if (s.activity === "build") {
      bank = E.tileBank(current,s.support === "supported",Math.random,{settings:s,vocabulary:vocabulary()});
      $("#exerciseBody").innerHTML = `<div class="sp-answer-zone"><div class="sp-zone-heading"><span>Your sentence</span><button class="sp-text-button" type="button" data-action="clear">Clear</button></div><div id="builtAnswer" class="sp-built-answer" aria-label="Your sentence"></div></div><div class="sp-bank-heading"><span>${s.support === "supported" ? "Sentence chunks" : "Words"} · ${bank.length} choices</span><small>Extra choices can remain. Click an answer tile to remove it.</small></div><div id="wordBank" class="sp-tile-bank"></div>${s.support === "independent" ? `<div class="sp-bank-heading"><span>Particles</span><small>Reusable · extra choices may remain</small></div><div id="particleBank" class="sp-tile-bank sp-particle-bank">${["は","が","を","に","へ","で","の","と","も","か"].map(text => `<button class="sp-tile sp-particle" type="button" data-particle="${text}" lang="ja">${text}</button>`).join("")}</div>` : ""}`;
      renderTiles();
      $("#keyboardNote").textContent = "Press Enter to check. Use Tab and Enter to select a focused tile.";
    } else if (s.activity === "particles") {
      answers = E.slots(current).map(() => null);
      $("#exerciseBody").innerHTML = `${s.input === "typing" ? typingControls() : ""}<p class="sp-task-help">${s.input === "typing" ? "Type your particle in each gap. Type ‘none’ or なし when no particle is needed." : "Select a gap, then choose a particle. Use — when no particle is needed."}</p><div class="sp-gap-sentence" id="gapSentence" lang="ja"></div>${s.input === "choice" ? `<div class="sp-tile-bank sp-particle-bank">${["は","が","を","に","へ","で","の","と","も","か","—"].map((text,i) => `<button class="sp-tile sp-particle" type="button" data-gap-choice="${text}"><kbd>${i < 9 ? i+1 : i === 9 ? 0 : "−"}</kbd><span lang="ja">${text}</span></button>`).join("")}</div>` : kanaPreviewMarkup()}`;
      renderGaps();
      $("#keyboardNote").textContent = s.input === "choice" ? "Keys 1–9, 0, or − choose a particle. Enter checks all gaps." : "Enter checks all gaps. Answers use the Japanese particle spelling.";
    } else {
      const wrongStem = current.verb.jp.slice(0,-1) + (current.verb.group === "ru" ? "り" : current.verb.jp.slice(-1));
      const end = current.form === "affirmative" ? "ます" : "ません";
      const options = E.shuffle([...new Set([current.answer,current.verb.stem + (current.form === "affirmative" ? "ません" : "ます"),current.verb.jp + end,wrongStem + end])]);
      $("#exerciseBody").innerHTML = `<div class="sp-verb-source"><span>Dictionary form</span><strong lang="ja">${esc(current.verb.jp)}</strong><small>${esc(current.verb.romaji)}</small></div>${s.input === "typing" ? `${typingControls()}<label class="sp-typed-label"><span id="typedAnswerLabel">Your answer</span><input class="sp-typed-answer" id="verbInput" type="text" placeholder="Type romaji" autocomplete="off" autocapitalize="off" spellcheck="false"></label>${kanaPreviewMarkup()}` : `<div class="sp-verb-choices">${options.map((text,i) => `<button class="sp-tile" type="button" data-verb-choice="${esc(text)}"><kbd>${i+1}</kbd><span lang="ja">${esc(text)}</span></button>`).join("")}</div>`}`;
      $("#keyboardNote").textContent = s.input === "typing" ? "Type the whole form, then press Enter." : "Choose with keys 1–4, then press Enter to check.";
    }
    if (s.input === "typing" && s.activity !== "build") updateTypingPreview();
  }
  function typingControls() {
    return `<div class="sp-typing-controls"><span>Type using</span><div class="sp-segments" role="group" aria-label="Typing script">${["romaji","japanese"].map(script => `<button type="button" data-typing-script="${script}" aria-pressed="${state.settings.typingScript === script}">${script === "romaji" ? "Romaji" : "Japanese"}</button>`).join("")}</div></div>`;
  }
  function kanaPreviewMarkup() {
    return '<div class="sp-kana-preview" id="typingPreview" role="status" aria-live="polite" aria-atomic="true"><span>Kana preview · your typing</span><div id="typingPreviewText" lang="ja"></div><small id="typingPreviewNote"></small></div>';
  }
  function updateTypingPreview() {
    const preview = $("#typingPreview"); if (!preview) return;
    const romaji = state.settings.typingScript === "romaji";
    preview.hidden = !romaji;
    document.querySelectorAll("[data-typing-script]").forEach(button => button.setAttribute("aria-pressed",String(button.dataset.typingScript === state.settings.typingScript)));
    document.querySelectorAll("#verbInput,[data-gap-input]").forEach(input => {input.lang=romaji ? "en" : "ja";input.placeholder=romaji ? input.id === "verbInput" ? "Type romaji, e.g. nomimasu" : "romaji" : input.id === "verbInput" ? "Type kana or kanji" : "かな";});
    if ($("#typedAnswerLabel")) $("#typedAnswerLabel").textContent = romaji ? "Your romaji answer" : "Your Japanese answer";
    if (state.settings.activity === "verbs") {
      $("#typingPreviewText").textContent = E.hiraganaPreview($("#verbInput").value) || "—";
      $("#typingPreviewNote").textContent = "Keep typing to complete a sound. Submit when the form is ready.";
    } else {
      const inputs=[...document.querySelectorAll("[data-gap-input]")];let index=0;
      $("#typingPreviewText").innerHTML = current.chunks.map(chunk => `<span class="sp-preview-chunk">${chunk.map(piece => piece.role ? `<mark>${esc(E.particlePreview(inputs[index++]?.value || ""))}</mark>` : esc(piece.text)).join("")}</span>`).join(" ") + "。";
      $("#typingPreviewNote").textContent = "Particle spelling: wa → は · o / wo → を · e → へ · none → —";
    }
  }
  function renderTiles() {
    $("#builtAnswer").innerHTML = selected.length ? selected.map((x,i) => `<button class="sp-tile ${x.particle ? "sp-particle" : ""}" type="button" data-remove="${i}" lang="ja" aria-label="Remove ${esc(x.text)}" ${answered ? "disabled" : ""}>${esc(x.text)}</button>`).join("") : '<span class="sp-placeholder">Your sentence starts here…</span>';
    $("#wordBank").innerHTML = bank.map((x,i) => `<button class="sp-tile" type="button" data-word="${esc(x.id)}" lang="ja" ${answered || selected.some(y => y.id === x.id) ? "disabled" : ""}>${esc(x.text)}</button>`).join("");
  }
  function renderGaps() {
    let slot = 0;
    $("#gapSentence").innerHTML = current.chunks.map(chunk => `<span class="sp-gap-chunk">${chunk.map(piece => {
      if (!piece.role) return `<span>${esc(piece.text)}</span>`;
      const i = slot++;
      return state.settings.input === "choice" ? `<button class="sp-gap ${i === activeSlot ? "is-active" : ""}" type="button" data-slot="${i}" aria-label="Particle gap ${i+1}" aria-pressed="${i === activeSlot}" ${answered ? "disabled" : ""}>${answers[i] === null ? "?" : esc(answers[i] || "—")}</button>` : `<input class="sp-gap sp-gap-input" data-gap-input="${i}" aria-label="Particle gap ${i+1}" value="${esc(answers[i] ?? "")}" autocomplete="off" autocapitalize="off" spellcheck="false" ${answered ? "disabled" : ""}>`;
    }).join("")}</span>`).join("") + "。";
  }
  function feedbackRows(details) {
    return `<div class="sp-particle-feedback">${details.map(slot => `<div class="${slot.correct ? "is-correct" : "is-wrong"}"><strong>${slot.correct ? "✓" : "↻"} ${esc(slot.anchor)} + ${esc(slot.choices.map(x => x || "—").join(" / "))}</strong><span>${esc(C.roles[slot.role].note)}</span>${!slot.correct ? `<small>Your choice: ${esc(slot.answer || "—")}</small>` : ""}</div>`).join("")}</div>`;
  }
  function check(unknown = false) {
    if (answered || !current || teaching) return;
    const s = settings();
    let correct = false, details = [], response = "";
    if (s.activity === "build") {
      if (!unknown && !selected.length) { $("#answerFeedback").textContent = "Add some tiles before checking, or choose I don’t know."; return; }
      response = selected.map(x => x.text).join(""); correct = !unknown && E.acceptedSentences(current).has(E.normalize(response));
      if (s.support === "independent") details = E.diagnose(current,selected);
    } else if (s.activity === "particles") {
      if (s.input === "typing") document.querySelectorAll("[data-gap-input]").forEach(input => { answers[Number(input.dataset.gapInput)] = input.value; });
      if (!unknown && answers.some(x => x === null || (s.input === "typing" && !x.trim()))) { $("#answerFeedback").textContent = "Fill every gap. Type ‘none’ or choose — for no particle."; return; }
      details = E.slots(current).map((slot,i) => ({...slot,...E.particleAnswer(answers[i] ?? "",slot.role),correct:!unknown && E.particleAnswer(answers[i] ?? "",slot.role).correct}));
      correct = details.every(x => x.correct);
    } else {
      response = s.input === "typing" ? $("#verbInput").value : answers[0] || "";
      if (!unknown && !response.trim()) { $("#answerFeedback").textContent = "Enter or select a verb form first."; return; }
      correct = !unknown && [current.answer,current.romaji,current.kanji].some(x => E.normalize(x) === E.normalize(response));
    }
    answered = true; state.total++; sessionTotal++;
    if (!assisted) { sessionUnaided++; if (correct) {state.correct++;sessionCorrect++;state.streak++;state.bestStreak = Math.max(state.bestStreak,state.streak);} else state.streak = 0; }
    E.record(state,E.recordKey(current,s),correct,assisted);
    for (const slot of details) {
      const key = `${s.activity}:${s.activity === "build" ? "independent" : s.input}:${slot.role}`;
      const item = state.skills[key] || {role:slot.role,topic:current.topic,correct:0,wrong:0};
      if (!assisted) {item[slot.correct ? "correct" : "wrong"]++;item.lastWasCorrect=slot.correct;item.lastSeen=Date.now();item.topic=current.topic;}
      state.skills[key] = item;
    }
    save(); updateStats();
    $("#answerFeedback").className = `sp-answer-feedback is-visible ${correct ? "is-correct" : "is-wrong"}`;
    const wrongWords = s.activity === "build" ? selected.filter(x => x.distractor) : [];
    $("#answerFeedback").innerHTML = `<strong class="sp-feedback-title">${correct ? "✓ That works." : "Let’s look at this one."}</strong>${assisted ? '<p class="sp-assisted-note">Supported attempt · saved for another check. Accuracy and streak are unchanged.</p>' : ""}<div class="sp-model-answer"><span>${s.activity === "verbs" ? "Correct form" : correct ? "One natural answer" : "Model sentence"}</span><strong lang="ja">${esc(s.activity === "verbs" ? current.answer : E.model(current))}</strong>${s.activity === "verbs" ? `<small>${esc(current.romaji)} · ${esc(current.verb.group)}-verb · ${esc(current.form)}</small>` : ""}</div>${!correct && wrongWords.length ? `<div class="sp-word-feedback"><strong>Check the meaning of these choices</strong>${wrongWords.map(word => `<p><span lang="ja">${esc(word.text)}</span><span>${esc(word.meaning)}</span></p>`).join("")}</div>` : ""}${details.length ? feedbackRows(details) : `<p>${esc(C.topics.find(t => t.id === current.topic).rule)}</p>`}${!correct && !wrongWords.length && s.activity === "build" && details.length && details.every(x => x.correct) ? '<p>Your particle choices fit. Check that the noun phrases stay together and the sentence ending comes last.</p>' : ""}<div class="sp-feedback-tools"><button class="sp-audio-button" type="button" data-action="audio"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></svg><span>Hear the answer</span></button><span id="audioNotice" class="sp-muted" role="status"></span></div><details class="sp-breakdown"><summary>Words &amp; meanings</summary>${wordGlossary()}</details>`;
    $("#checkAnswer").hidden = true; $("#dontKnow").hidden = true; $("#hintButton").hidden = true;
    $("#nextExercise").hidden = false; $("#nextExercise").innerHTML = `${s.activity === "verbs" ? "Next verb" : "Next sentence"} <kbd>Enter</kbd>`;
    $("#exerciseBody").querySelectorAll("button,input").forEach(x => {x.disabled = true;});
    $("#nextExercise").focus();
  }
  function wordGlossary() { return `<div class="sp-word-intro">${E.wordIds(current).map(id => `<div><strong lang="ja">${esc(C.words[id].jp)}</strong><span>${esc(C.words[id].romaji)}</span><span>${esc(C.words[id].meaning)}</span></div>`).join("")}</div>`; }
  function showRule(hint = false) {
    if (!current) return;
    if (!answered && !teaching) assisted = true;
    const topic = C.topics.find(t => t.id === current.topic);
    $("#ruleTitle").textContent = topic.title;
    $("#ruleBody").innerHTML = `${ruleMarkup(topic)}${hint ? `<h3>Words in this exercise</h3>${wordGlossary()}` : ""}${!answered && !teaching ? '<p class="sp-muted">This attempt will be recorded as supported.</p>' : ""}`;
    $("#ruleDialog").showModal();
  }
  function openScope() {
    draft = new Set(settings().topics); scopeSearch = ""; $("#scopeSearch").value = "";
    renderScope(); $("#scopeDialog").showModal();
  }
  function renderScope() {
    document.querySelectorAll("[data-scope-view]").forEach(x => x.setAttribute("aria-pressed",String(x.dataset.scopeView === scopeView)));
    const list = availableTopics().filter(t => E.normalize(`${t.title} ${t.subtitle} Lesson ${t.lesson}`).includes(E.normalize(scopeSearch)));
    const topicRow = t => `<label class="sp-topic-option"><input type="checkbox" data-topic="${t.id}" ${draft.has(t.id) ? "checked" : ""}><span><strong>${esc(t.title)}</strong><small>${scopeView === "topics" ? `Lesson ${t.lesson} · ` : ""}${esc(t.subtitle)}</small></span><span class="sp-topic-count">${E.pool({...settings(),topics:[t.id],vocabulary:"any"}).length}</span></label>`;
    $("#scopeOptions").innerHTML = list.length ? scopeView === "topics" ? list.map(topicRow).join("") : C.lessons.map(lesson => {
      const rows = list.filter(t => t.lesson === lesson.id);
      if (!rows.length) return "";
      return `<section class="sp-lesson-option"><label class="sp-lesson-select"><input type="checkbox" data-lesson="${lesson.id}" ${rows.every(t => draft.has(t.id)) ? "checked" : ""}><span><strong>Lesson ${lesson.id} · ${esc(lesson.title)}</strong><small>${esc(lesson.description)}</small></span></label><div>${rows.map(topicRow).join("")}</div></section>`;
    }).join("") : '<p class="sp-empty-search">No topics match your search.</p>';
    document.querySelectorAll("[data-lesson]").forEach(input => {
      const rows = list.filter(t => t.lesson === Number(input.dataset.lesson));
      input.indeterminate = rows.some(t => draft.has(t.id)) && !rows.every(t => draft.has(t.id));
    });
    const count = pool({...settings(),topics:[...draft]}).length;
    $("#selectionCount").textContent = `${draft.size} topics · ${count} matching exercises`;
    $("#selectionHint").textContent = state.settings.activity === "verbs" ? "First collection: Lesson 3 polite forms. More units can be added later." : "Current collections cover selected patterns from Lessons 1–3.";
    $("#applyScope").disabled = !draft.size;
  }
  document.addEventListener("click",event => {
    const button = event.target.closest("button"); if (!button) return;
    if (button.matches(".sp-activities button")) {
      const previous = state.settings.activity, nextActivity = button.dataset.activity;
      if (previous === nextActivity) return;
      if (previous !== "verbs" && nextActivity !== "verbs") state.settings.scopes[nextActivity] = [...state.settings.scopes[previous]];
      state.settings.activity = nextActivity; recent=[]; save(); next(); return;
    }
    if (button.dataset.support || button.dataset.input) {
      if (button.dataset.support === state.settings.support || button.dataset.input === state.settings.input) return;
      if (button.dataset.support) state.settings.support = button.dataset.support;
      else state.settings.input = button.dataset.input;
      recent=[];save();next();return;
    }
    if (button.dataset.typingScript) {
      state.settings.typingScript=button.dataset.typingScript;save();updateTypingPreview();return;
    }
    if (button.dataset.scopeView) {scopeView=button.dataset.scopeView;renderScope();return;}
    if (button.dataset.focus) {state.settings.activity="particles";state.settings.scopes.particles=[button.dataset.focus];state.settings.review="all";save();next();$("#questionCard").scrollIntoView({block:"start"});return;}
    if (button.id === "openScope") return openScope();
    if (button.id === "closeScope") return $("#scopeDialog").close();
    if (button.id === "closeRule") return $("#ruleDialog").close();
    if (button.id === "selectAll" || button.id === "clearAll") { draft = button.id === "selectAll" ? new Set(availableTopics().map(t => t.id)) : new Set();renderScope();return; }
    if (button.id === "applyScope") {state.settings.scopes[state.settings.activity]=[...draft];save();$("#scopeDialog").close();recent=[];next();return;}
    const action = button.dataset.action;
    if (action === "scope") return openScope();
    if (action === "settings") {$("#sessionSettings").open = true;$("#sessionSettings").scrollIntoView({block:"center"});return;}
    if (action === "start") {
      state.introduced[current.topic]=true; E.wordIds(current).forEach(id=>{state.wordsSeen[id]=true;}); assisted=true;save();renderExercise();return;
    }
    if (action === "rule" || action === "hint") return showRule(action === "hint");
    if (action === "audio") { if (!window.KANA_SPRINT_SPEECH?.speakJapanese(state.settings.activity === "verbs" ? current.answer : E.model(current))) $("#audioNotice").textContent="No Japanese voice available. Choose a voice in Settings & Data."; return; }
    if (action === "next") {next();$("#exercisePrompt")?.focus();return;}
    if (action === "check" || action === "unknown") return check(action === "unknown");
    if (answered || teaching || !current) return;
    if (button.dataset.word) {const tile=bank.find(x=>x.id === button.dataset.word);if (tile && !selected.some(x=>x.id===tile.id)) selected.push(tile);renderTiles();$("#builtAnswer button:last-child")?.focus();}
    if (button.dataset.particle) {selected.push({text:button.dataset.particle,particle:true});renderTiles();}
    if (button.dataset.remove !== undefined) {const removed=selected.splice(Number(button.dataset.remove),1)[0];renderTiles();if(removed?.id) $("#wordBank").querySelector(`[data-word="${removed.id}"]`)?.focus();else $("#particleBank")?.querySelector("button")?.focus();}
    if (action === "clear") {selected=[];renderTiles();}
    if (button.dataset.slot !== undefined) {activeSlot=Number(button.dataset.slot);renderGaps();$("#gapSentence").querySelector(`[data-slot="${activeSlot}"]`)?.focus();}
    if (button.dataset.gapChoice !== undefined) {answers[activeSlot]=button.dataset.gapChoice === "—" ? "" : button.dataset.gapChoice;const unfilled=answers.findIndex(x=>x===null);if(unfilled>=0)activeSlot=unfilled;renderGaps();}
    if (event.detail > 0 && (button.dataset.word || button.dataset.particle || button.dataset.remove !== undefined)) $("#checkAnswer")?.focus();
    if (button.dataset.verbChoice) {answers[0]=button.dataset.verbChoice;document.querySelectorAll("[data-verb-choice]").forEach(x=>x.setAttribute("aria-pressed",String(x===button)));}
  });
  $("#scopeSearch").addEventListener("input",event => {scopeSearch=event.target.value;renderScope();});
  $("#scopeOptions").addEventListener("change",event => {
    const input=event.target;
    const ids=input.dataset.topic ? [input.dataset.topic] : availableTopics().filter(t=>t.lesson===Number(input.dataset.lesson) && E.normalize(`${t.title} ${t.subtitle} Lesson ${t.lesson}`).includes(E.normalize(scopeSearch))).map(t=>t.id);
    ids.forEach(id=>input.checked ? draft.add(id) : draft.delete(id));renderScope();
    $("#scopeOptions").querySelector(input.dataset.topic ? `[data-topic="${input.dataset.topic}"]` : `[data-lesson="${input.dataset.lesson}"]`)?.focus();
  });
  for (const [id,key] of [["vocabularyFilter","vocabulary"],["reviewFilter","review"],["bankSize","bankSize"]]) $("#"+id).addEventListener("change",event => {state.settings[key]=event.target.value;save();recent=[];next();});
  document.addEventListener("input",event => {if (!event.isComposing && event.target.matches("#verbInput,[data-gap-input]")) updateTypingPreview();});
  document.addEventListener("compositionend",event => {if(event.target.matches("#verbInput,[data-gap-input]")) updateTypingPreview();});
  document.addEventListener("keydown",event => {
    if ($("dialog[open]") || event.isComposing || event.repeat || !current) return;
    if (teaching) {
      if (event.key === "Enter" && !event.repeat && !event.target.matches("button,input,select,textarea,summary,a")) {
        event.preventDefault(); $("[data-action='start']")?.click();
      }
      return;
    }
    const typing = event.target.matches("input,select,textarea,summary");
    if (event.key === "Enter" && !event.target.matches("button,summary,select,a,textarea")) {
      event.preventDefault();if(answered)next();else check();return;
    }
    if (typing || event.ctrlKey || event.altKey || event.metaKey || answered || event.repeat) return;
    const n = "1234567890-".indexOf(event.key);
    if (event.key.length === 1 && n>=0) {
      const choices = state.settings.activity === "particles" ? document.querySelectorAll("[data-gap-choice]") : state.settings.activity === "verbs" ? document.querySelectorAll("[data-verb-choice]") : [];
      if (choices[n]) {event.preventDefault();choices[n].click();}
    }
  });
  window.addEventListener("storage",event => {if(event.key === "kanaSprintVocabularyV1") {renderChrome();}});
  next();
})();

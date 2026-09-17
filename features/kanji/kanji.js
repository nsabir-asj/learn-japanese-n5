(() => {
  "use strict";

  const DATA = globalThis.KANA_SPRINT_KANJI;
  const Scheduler = globalThis.KANA_SPRINT_VOCABULARY_SCHEDULER;
  if (!DATA?.kanji?.length || !Scheduler) throw new Error("Kanji learning data was not loaded.");

  const STORAGE_KEY = "kanaSprintKanjiV1";
  const MODE_KEYS = ["meaning", "reading", "spelling"];
  const $ = selector => document.querySelector(selector);
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);

  function formatLabel(format) {
    return { meaning: "meaning", reading: "word → reading", spelling: "reading → kanji" }[format] || format;
  }

  const entryById = new Map(DATA.kanji.map(entry => [entry.id, entry]));
  const stageById = new Map(DATA.stages.map(stage => [stage.id, stage]));
  let state = loadState();
  let view = "learn";
  let phase = "idle";
  let current = null;
  let currentFormat = "meaning";
  let currentChoiceIds = [];
  let currentReason = "";
  let checkpoint = null;
  let mapFilter = "all";
  let selectedDetailId = DATA.kanji[0].id;

  function emptyModeProgress() {
    return { seen: 0, correct: 0, wrong: 0, mastery: 0, recentResults: [], lastWasCorrect: null };
  }

  function emptyItemProgress() {
    return {
      introduced: false, seen: 0, correct: 0, wrong: 0, mastery: 0,
      lastWasCorrect: null, lastSeen: 0, dueAt: 0, dueQuestion: 0,
      recentResults: [], modes: Object.fromEntries(MODE_KEYS.map(mode => [mode, emptyModeProgress()]))
    };
  }

  function defaultState() {
    return {
      version: 1, track: "core", questionFormat: "mixed", pace: 50,
      total: 0, correct: 0, streak: 0, bestStreak: 0, newCredit: 0,
      recent: [], items: {}, savedAt: 0
    };
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved?.version === 1) return { ...defaultState(), ...saved, items: saved.items || {} };
    } catch {}
    return defaultState();
  }

  function itemState(entry) {
    const progress = state.items[entry.id] ||= emptyItemProgress();
    progress.modes ||= {};
    MODE_KEYS.forEach(mode => { progress.modes[mode] = { ...emptyModeProgress(), ...(progress.modes[mode] || {}) }; });
    return progress;
  }

  function saveState() {
    state.savedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function trackEntries() {
    return DATA.kanji.filter(entry => state.track === "all" || entry.tier === "core");
  }

  function trackStages() {
    return DATA.stages.filter(stage => state.track === "all" || stage.tier === "core");
  }

  function stageEntries(stage) {
    return stage.kanjiIds.map(id => entryById.get(id)).filter(entry => entry && (state.track === "all" || entry.tier === "core"));
  }

  function modeState(entry, mode) {
    return itemState(entry).modes[mode];
  }

  function overallMastery(entry) {
    const progress = itemState(entry);
    const attempted = MODE_KEYS.map(mode => progress.modes[mode]).filter(mode => mode.seen > 0);
    return attempted.length ? attempted.reduce((sum, mode) => sum + mode.mastery, 0) / attempted.length : progress.mastery;
  }

  function isMastered(entry) {
    const progress = itemState(entry);
    return progress.introduced && modeState(entry, "meaning").seen > 0 && modeState(entry, "reading").seen > 0 && overallMastery(entry) >= 72;
  }

  function learningLabel(entry) {
    const progress = itemState(entry);
    if (!progress.introduced) return "Not introduced";
    if (isMastered(entry)) return "Strong";
    if (progress.seen <= 1) return "Just started";
    if (overallMastery(entry) < 40) return "Building recall";
    return "Learning";
  }

  function exampleSentence(entry) {
    const sentence = entry.anchor.sentence || "";
    if (!sentence || sentence.includes(entry.anchor.word)) return sentence;
    return sentence.includes(entry.anchor.reading)
      ? sentence.replace(entry.anchor.reading, entry.anchor.word)
      : sentence;
  }

  function highlightedExample(entry) {
    return exampleSentence(entry)
      .split(entry.character)
      .map(escapeHtml)
      .join(`<mark>${escapeHtml(entry.character)}</mark>`);
  }

  function stageReady(stage) {
    const entries = stageEntries(stage);
    return entries.length > 0 && Scheduler.stageIsReady(entries.map(entry => ({ ...itemState(entry), mastery: overallMastery(entry) })));
  }

  function currentStageIndex() {
    const stages = trackStages();
    const pending = stages.findIndex(stage => !stageReady(stage));
    return pending < 0 ? stages.length - 1 : pending;
  }

  function currentStage() {
    return trackStages()[Math.max(0, currentStageIndex())];
  }

  function dueEntries(entries = trackEntries()) {
    const now = Date.now();
    return entries.filter(entry => {
      const progress = itemState(entry);
      return progress.introduced && Scheduler.reviewIsDue(progress, state.total, now);
    });
  }

  function weakestMode(entry) {
    const modes = MODE_KEYS.map(mode => [mode, modeState(entry, mode)]);
    const unseen = modes.filter(([, progress]) => progress.seen === 0);
    if (unseen.length) return unseen[Math.floor(Math.random() * unseen.length)][0];
    modes.sort((left, right) => left[1].mastery - right[1].mastery);
    return modes[0][0];
  }

  function chooseFormat(entry) {
    return state.questionFormat === "mixed" ? weakestMode(entry) : state.questionFormat;
  }

  function reviewScore(entry) {
    const progress = itemState(entry);
    let score = Scheduler.reviewScore(progress);
    if (state.recent.slice(-5).includes(entry.id)) score -= 55;
    if (Scheduler.reviewIsDue(progress, state.total)) score += 28;
    return score;
  }

  function selectReview(entries) {
    const available = entries.filter(entry => itemState(entry).introduced);
    if (!available.length) return null;
    return [...available].sort((left, right) => reviewScore(right) - reviewScore(left))[0];
  }

  function selectForLearn() {
    const stage = currentStage();
    const entries = stageEntries(stage);
    const unseen = entries.filter(entry => !itemState(entry).introduced);
    const introduced = trackEntries().filter(entry => itemState(entry).introduced);
    if (unseen.length && (!introduced.length || !entries.some(entry => itemState(entry).introduced))) {
      return { entry: unseen[0], introduce: true, reason: `New in ${stage.label}` };
    }
    if (unseen.length) {
      const decision = Scheduler.nextIntroductionDecision(state.pace, state.newCredit);
      state.newCredit = decision.credit;
      if (decision.introduce) return { entry: unseen[0], introduce: true, reason: `New in ${stage.label}` };
    }
    const review = selectReview(introduced);
    return review ? { entry: review, introduce: false, reason: dueEntries(introduced).includes(review) ? "Scheduled review" : "Strengthening recall" } : { entry: unseen[0], introduce: true, reason: `New in ${stage.label}` };
  }

  function selectForPractice() {
    const introduced = trackEntries().filter(entry => itemState(entry).introduced);
    const review = selectReview(introduced);
    return review ? { entry: review, introduce: false, reason: dueEntries(introduced).includes(review) ? "Due review" : "Adaptive weak-area review" } : null;
  }

  function speak(text) {
    globalThis.KANA_SPRINT_SPEECH?.speakJapanese(text);
  }

  function buildUI() {
    const host = $(".wrap");
    const shell = document.createElement("main");
    shell.className = "kanji-shell";
    shell.innerHTML = `
      <nav class="kanji-mode-tabs" aria-label="Kanji learning modes">
        <button class="kanji-mode-tab active" type="button" data-kanji-view="learn"><strong>Learn</strong><small>Follow the guided journey</small></button>
        <button class="kanji-mode-tab" type="button" data-kanji-view="practice"><strong>Practice</strong><small>Review learned kanji</small></button>
        <button class="kanji-mode-tab" type="button" data-kanji-view="checkpoint"><strong>Checkpoint</strong><small>Eight mixed questions</small></button>
        <button class="kanji-mode-tab" type="button" data-kanji-view="progress"><strong>Kanji map</strong><small>Browse progress and details</small></button>
      </nav>
      <section class="kanji-workspace" id="kanjiWorkspace">
        <aside class="card kanji-roadmap-card">
          <div class="kanji-roadmap-heading"><div><span class="tiny">Guided journey</span><h2 id="kanjiJourneyTitle">Core 104</h2></div><span class="data-badge" id="kanjiStageBadge">Stage 1</span></div>
          <div class="kanji-stage-list" id="kanjiStageList"></div>
        </aside>
        <div class="kanji-main">
          <section class="trainer kanji-trainer" aria-live="polite">
            <div class="trainer-top"><div class="mode-tag"><span class="dot"></span><span id="kanjiModeLabel">Learn · guided kanji</span></div><div class="kanji-context"><div class="tiny" id="kanjiQuestionCount">Ready</div><span class="tiny" id="kanjiStageProgressText">Stage progress</span></div></div>
            <div class="kanji-stage-progress" role="progressbar" aria-label="Current stage introductions" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="kanjiStageProgress"></span></div>
            <div class="kanji-card-body" id="kanjiCardBody"></div>
            <div class="feedback kanji-feedback" id="kanjiFeedback"></div>
            <div class="footer-actions kanji-footer"><div class="actions"><button class="ghost kanji-hidden" id="kanjiDontKnow" type="button">I don’t know</button><button class="big-button kanji-hidden" id="kanjiNext" type="button">Continue <kbd>Enter</kbd></button></div><span class="tiny" id="kanjiKeyboardHint">New kanji are introduced before testing.</span></div>
          </section>
          <details class="card kanji-session-card" id="kanjiSessionControls">
            <summary><span><strong>Session controls</strong><small id="kanjiSessionSummary">Core 104 · mixed practice · balanced pace</small></span></summary>
            <div class="kanji-controls">
              <label><span>Learning track</span><select id="kanjiTrack"><option value="core">Core 104</option><option value="all">Full 120 preparation set</option></select><small class="tiny">The final 16 broaden preparation beyond the legacy core.</small></label>
              <label><span>Question direction</span><select id="kanjiQuestionFormat"><option value="mixed">Mixed automatically</option><option value="meaning">Kanji → meaning</option><option value="reading">Word → reading</option><option value="spelling">Reading → kanji word</option></select><small class="tiny">Mixed practice targets the weakest direction.</small></label>
              <label><span>New-kanji pace: <strong id="kanjiPaceLabel">Balanced</strong></span><input id="kanjiPace" type="range" min="10" max="90" step="10"><span class="kanji-pace-labels"><span>More review</span><span>More new</span></span></label>
            </div>
            <p class="kanji-attribution tiny">Meanings, readings, stroke counts, and radical data adapted from <a href="https://github.com/kanjialive/kanji-data-media" target="_blank" rel="noreferrer">Kanji alive</a> under CC BY 4.0.</p>
          </details>
        </div>
      </section>
      <section class="kanji-progress-panel kanji-hidden" id="kanjiProgressPanel">
        <div class="card"><div class="kanji-progress-summary" id="kanjiProgressSummary"></div></div>
        <div class="card kanji-map-card">
          <div class="kanji-map-heading"><div><h2>Kanji map</h2><p class="muted">Select a character to inspect its meanings, readings, anchor word, and progress.</p></div><div class="kanji-map-tools"><input id="kanjiSearch" type="search" placeholder="Search kanji, reading, or meaning…"><select id="kanjiMapFilter"><option value="all">All statuses</option><option value="unintroduced">Not introduced</option><option value="learning">Learning</option><option value="due">Due</option><option value="mastered">Mastered</option></select></div></div>
          <div class="kanji-map" id="kanjiMap"></div>
          <div class="kanji-detail" id="kanjiDetail"></div>
        </div>
      </section>`;
    host.appendChild(shell);

    $("#kanjiTrack").value = state.track;
    $("#kanjiQuestionFormat").value = state.questionFormat;
    $("#kanjiPace").value = String(state.pace);
    globalThis.KANA_SPRINT_SYNC_RANGE?.($("#kanjiPace"));
    bindEvents();
  }

  function bindEvents() {
    document.querySelectorAll("[data-kanji-view]").forEach(button => button.addEventListener("click", () => switchView(button.dataset.kanjiView)));
    $("#kanjiDontKnow").addEventListener("click", () => answer(null));
    $("#kanjiNext").addEventListener("click", advance);
    $("#kanjiTrack").addEventListener("change", event => {
      state.track = event.target.value === "all" ? "all" : "core";
      checkpoint = null;
      saveState();
      renderAll();
      if (view !== "progress") nextActivity();
    });
    $("#kanjiQuestionFormat").addEventListener("change", event => {
      state.questionFormat = MODE_KEYS.includes(event.target.value) ? event.target.value : "mixed";
      saveState();
      renderAll();
      if (phase === "question") showQuestion(current, chooseFormat(current));
    });
    $("#kanjiPace").addEventListener("input", event => { state.pace = Number(event.target.value); renderControls(); });
    $("#kanjiPace").addEventListener("change", saveState);
    $("#kanjiSearch").addEventListener("input", renderMap);
    $("#kanjiMapFilter").addEventListener("change", event => { mapFilter = event.target.value; renderMap(); });
    $("#kanjiMap").addEventListener("click", event => {
      const button = event.target.closest("[data-kanji-id]");
      if (!button) return;
      selectedDetailId = button.dataset.kanjiId;
      renderDetail();
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Enter" && !event.target.matches("input,select,textarea,button")) {
        event.preventDefault();
        if (phase === "introduction") startIntroducedQuestion();
        else if (phase === "answered" || phase === "checkpoint-summary") advance();
      }
      if (/^[1-4]$/.test(event.key) && phase === "question" && !event.target.matches("input,select,textarea")) {
        const button = $("#kanjiCardBody").querySelectorAll("[data-choice-id]")[Number(event.key) - 1];
        if (button) { event.preventDefault(); button.click(); }
      }
      if (event.key.toLowerCase() === "r" && current && !event.target.matches("input,select,textarea")) speak(current.anchor.reading);
    });
  }

  function switchView(nextView) {
    view = nextView;
    phase = "idle";
    current = null;
    checkpoint = null;
    document.querySelectorAll("[data-kanji-view]").forEach(button => button.classList.toggle("active", button.dataset.kanjiView === view));
    $("#kanjiWorkspace").classList.toggle("kanji-hidden", view === "progress");
    $("#kanjiProgressPanel").classList.toggle("kanji-hidden", view !== "progress");
    if (view === "progress") renderProgress();
    else {
      if (view === "checkpoint") startCheckpoint();
      else nextActivity();
    }
    renderAll();
  }

  function paceLabel() {
    if (state.pace <= 30) return "Review-heavy";
    if (state.pace >= 70) return "Fast";
    return "Balanced";
  }

  function renderControls() {
    $("#kanjiPaceLabel").textContent = paceLabel();
    $("#kanjiSessionSummary").textContent = `${state.track === "core" ? "Core 104" : "Full 120"} · ${state.questionFormat === "mixed" ? "mixed practice" : state.questionFormat} · ${paceLabel().toLowerCase()} pace`;
  }

  function renderRoadmap() {
    const stages = trackStages();
    const activeIndex = currentStageIndex();
    $("#kanjiJourneyTitle").textContent = state.track === "core" ? "Core 104" : "Full 120";
    $("#kanjiStageBadge").textContent = `Stage ${activeIndex + 1} / ${stages.length}`;
    $("#kanjiStageList").innerHTML = stages.map((stage, index) => {
      const entries = stageEntries(stage);
      const introduced = entries.filter(entry => itemState(entry).introduced).length;
      const strong = entries.filter(isMastered).length;
      const coverage = entries.length ? Math.round(introduced / entries.length * 100) : 0;
      const status = index < activeIndex ? "Complete" : index === activeIndex ? "Current" : "Locked";
      return `<div class="kanji-stage ${index === activeIndex ? "current" : index > activeIndex ? "locked" : ""}"><span class="kanji-stage-number">${index + 1}</span><span class="kanji-stage-copy"><strong>${escapeHtml(stage.label)}</strong><span class="kanji-stage-meter"><span style="width:${coverage}%"></span></span><small>${introduced}/${entries.length} introduced · ${strong}/${entries.length} strong</small></span><span class="kanji-stage-status">${status}</span></div>`;
    }).join("");
    const stage = currentStage();
    const entries = stageEntries(stage);
    const introduced = entries.filter(entry => itemState(entry).introduced).length;
    const stagePercent = entries.length ? Math.round(introduced / entries.length * 100) : 0;
    $("#kanjiStageProgress").style.width = `${stagePercent}%`;
    $(".kanji-stage-progress").setAttribute("aria-valuenow", String(stagePercent));
    $("#kanjiStageProgressText").textContent = `Stage ${currentStageIndex() + 1} · ${introduced}/${entries.length} introduced`;
  }

  function renderDashboard() {
    const pool = trackEntries();
    const introduced = pool.filter(entry => itemState(entry).introduced);
    const mastered = pool.filter(isMastered);
    const due = dueEntries(pool);
    const accuracy = state.total ? `${Math.round(state.correct / state.total * 100)}%` : "—";
    globalThis.dispatchEvent(new CustomEvent("kana-sprint-streak-context", { detail: { current: state.streak, best: state.bestStreak, label: "kanji streak" } }));
    globalThis.dispatchEvent(new CustomEvent("kana-sprint-activity-status", { detail: {
      note: state.track === "core" ? "Core 104 journey" : "Full 120 preparation set",
      metrics: [
        { label: "Introduced", value: `${introduced.length}/${pool.length}` },
        { label: "Mastered", value: mastered.length },
        { label: "Accuracy", value: accuracy },
        { label: "Due", value: due.length },
        { label: "Current streak", value: state.streak }
      ]
    } }));
  }

  function renderAll() {
    renderControls();
    renderRoadmap();
    renderDashboard();
    if (view === "progress") renderProgress();
  }

  function beginIntroduction(entry, reason) {
    current = entry;
    currentReason = reason;
    phase = "introduction";
    itemState(entry).introduced = true;
    saveState();
    $("#kanjiModeLabel").textContent = "Learn · new kanji";
    $("#kanjiQuestionCount").textContent = reason;
    $("#kanjiFeedback").className = "feedback kanji-feedback";
    $("#kanjiDontKnow").classList.add("kanji-hidden");
    $("#kanjiNext").classList.add("kanji-hidden");
    $("#kanjiKeyboardHint").innerHTML = "Study the character and anchor word, then press <kbd>Enter</kbd>.";
    $("#kanjiCardBody").innerHTML = `
      <span class="kanji-new-badge">New kanji · ${escapeHtml(stageById.get(entry.stageId).label)}</span>
      <div class="kanji-character" lang="ja">${entry.character}</div>
      <div class="kanji-core-meaning">${escapeHtml(entry.meanings.join(", "))}</div>
      <div class="kanji-anchor"><strong lang="ja">${escapeHtml(entry.anchor.word)}</strong><span lang="ja">${escapeHtml(entry.anchor.reading)}</span><span>${escapeHtml(entry.anchor.meaning)}</span></div>
      ${entry.anchor.sentence ? `<div class="kanji-example"><p lang="ja">${highlightedExample(entry)}</p><span>${escapeHtml(entry.anchor.translation)}</span></div>` : ""}
      <div class="kanji-facts"><span>${entry.strokes} strokes</span><span>Radical ${escapeHtml(entry.radical.character)} · ${escapeHtml(entry.radical.meaning)}</span></div>
      <div class="kanji-actions"><button class="ghost" id="kanjiIntroAudio" type="button">🔊 Hear ${escapeHtml(entry.anchor.word)}</button><button class="big-button" id="kanjiStartPractice" type="button">Practice this kanji <kbd>Enter</kbd></button></div>`;
    $("#kanjiIntroAudio").addEventListener("click", () => speak(entry.anchor.reading));
    $("#kanjiStartPractice").addEventListener("click", startIntroducedQuestion);
    setTimeout(() => $("#kanjiStartPractice")?.focus(), 0);
    renderAll();
  }

  function startIntroducedQuestion() {
    if (!current) return;
    showQuestion(current, "meaning");
  }

  function distractorsFor(entry, format) {
    const sameStage = stageEntries(stageById.get(entry.stageId));
    const candidates = [...sameStage, ...trackEntries()].filter(candidate => candidate.id !== entry.id);
    const answerValue = candidate => format === "meaning" ? candidate.meanings[0] : format === "reading" ? candidate.anchor.reading : candidate.anchor.word;
    const answer = answerValue(entry);
    const used = new Set([answer]);
    const similarityScore = candidate => {
      const stagePenalty = candidate.stageId === entry.stageId ? 0 : 50;
      const radicalBonus = candidate.radical.character === entry.radical.character ? -12 : 0;
      const strokePenalty = Math.abs(candidate.strokes - entry.strokes) * 3;
      const targetText = format === "reading" ? entry.anchor.reading : entry.anchor.word;
      const candidateText = format === "reading" ? candidate.anchor.reading : candidate.anchor.word;
      const lengthPenalty = Math.abs(candidateText.length - targetText.length) * (format === "meaning" ? 2 : 10);
      return stagePenalty + radicalBonus + strokePenalty + lengthPenalty;
    };
    const ranked = candidates
      .filter(candidate => !state.recent.slice(-3).includes(candidate.id))
      .sort((left, right) => similarityScore(left) - similarityScore(right) || left.order - right.order);
    const picked = [];
    for (const candidate of ranked) {
      const value = answerValue(candidate);
      if (!value || used.has(value)) continue;
      used.add(value);
      picked.push(candidate);
      if (picked.length === 3) break;
    }
    return [entry, ...picked].sort(() => Math.random() - .5);
  }

  function showQuestion(entry, format) {
    current = entry;
    currentFormat = format;
    phase = "question";
    const choices = distractorsFor(entry, format);
    currentChoiceIds = choices.map(choice => choice.id);
    const prompt = format === "meaning"
      ? `<div class="kanji-character" lang="ja">${entry.character}</div>`
      : format === "reading"
        ? `<div class="kanji-character small" lang="ja">${escapeHtml(entry.anchor.word)}</div>`
        : `<div class="kanji-character small" lang="ja">${escapeHtml(entry.anchor.reading)}</div><div class="kanji-core-meaning">${escapeHtml(entry.anchor.meaning)}</div>`;
    const label = format === "meaning" ? "Choose the core meaning" : format === "reading" ? "Choose this word’s reading" : "Choose the matching kanji word";
    const choiceMarkup = choice => {
      const main = format === "meaning" ? choice.meanings[0] : format === "reading" ? choice.anchor.reading : choice.anchor.word;
      const language = format === "meaning" ? "" : ' lang="ja"';
      return `<button class="kanji-choice ${format === "meaning" ? "meaning-choice" : "japanese-choice"}" type="button" data-choice-id="${choice.id}"><span>${choices.indexOf(choice) + 1}</span><span><strong${language}>${escapeHtml(main)}</strong></span></button>`;
    };
    $("#kanjiModeLabel").textContent = `${view === "checkpoint" ? "Checkpoint" : view === "practice" ? "Practice" : "Learn"} · ${formatLabel(format)}`;
    $("#kanjiQuestionCount").textContent = view === "checkpoint" ? `Question ${checkpoint.index + 1} / ${checkpoint.queue.length}` : currentReason;
    $("#kanjiCardBody").innerHTML = `<span class="kanji-question-kicker">${label}</span>${prompt}<div class="kanji-options">${choices.map(choiceMarkup).join("")}</div>`;
    $("#kanjiFeedback").className = "feedback kanji-feedback";
    $("#kanjiDontKnow").classList.remove("kanji-hidden");
    $("#kanjiNext").classList.add("kanji-hidden");
    $("#kanjiNext").innerHTML = "Continue <kbd>Enter</kbd>";
    $("#kanjiKeyboardHint").innerHTML = "Use <kbd>1</kbd>–<kbd>4</kbd> to answer. Press <kbd>R</kbd> to hear the anchor word.";
    $("#kanjiCardBody").querySelectorAll("[data-choice-id]").forEach(button => button.addEventListener("click", () => answer(button.dataset.choiceId)));
    renderAll();
  }

  function applyResult(correct) {
    const progress = itemState(current);
    const direction = modeState(current, currentFormat);
    const now = Date.now();
    progress.introduced = true;
    progress.seen += 1;
    progress.lastSeen = now;
    progress.lastWasCorrect = correct;
    progress.recentResults.push(correct);
    progress.recentResults = progress.recentResults.slice(-8);
    direction.seen += 1;
    direction.lastWasCorrect = correct;
    direction.recentResults.push(correct);
    direction.recentResults = direction.recentResults.slice(-8);
    if (correct) {
      progress.correct += 1;
      direction.correct += 1;
      direction.mastery = Math.min(100, direction.mastery + Math.max(7, 20 * (1 - direction.mastery / 140)));
      state.correct += 1;
      state.streak += 1;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
    } else {
      progress.wrong += 1;
      direction.wrong += 1;
      direction.mastery = Math.max(0, direction.mastery - 12);
      state.streak = 0;
    }
    progress.mastery = overallMastery(current);
    state.total += 1;
    Object.assign(progress, Scheduler.nextReviewSchedule(progress.mastery, correct, state.total, now));
    state.recent.push(current.id);
    state.recent = state.recent.slice(-12);
    if (view === "checkpoint") {
      checkpoint.correct += correct ? 1 : 0;
      checkpoint.results.push({ id: current.id, correct });
    }
    saveState();
  }

  function answer(selectedId) {
    if (phase !== "question" || !current) return;
    phase = "answered";
    const correct = selectedId === current.id;
    applyResult(correct);
    $("#kanjiCardBody").querySelectorAll("[data-choice-id]").forEach(button => {
      button.disabled = true;
      if (button.dataset.choiceId === current.id) button.classList.add("correct");
      else if (button.dataset.choiceId === selectedId) button.classList.add("wrong");
    });
    const progress = itemState(current);
    const on = current.readings.onyomi.length ? current.readings.onyomi.join("・") : "—";
    const kun = current.readings.kunyomi.length ? current.readings.kunyomi.join("・") : "—";
    $("#kanjiFeedback").className = `feedback kanji-feedback show ${correct ? "good" : "bad"}`;
    $("#kanjiFeedback").innerHTML = `<strong>${correct ? "Correct" : "Remember this one"}</strong><div class="meta kanji-feedback-detail"><div class="kanji-feedback-answer"><strong lang="ja">${current.character}</strong><span>${escapeHtml(current.meanings.join(", "))}</span></div><span class="kanji-feedback-anchor"><b>Anchor word</b> <span lang="ja">${escapeHtml(current.anchor.word)}（${escapeHtml(current.anchor.reading)}）</span> — ${escapeHtml(current.anchor.meaning)}</span><div class="kanji-feedback-meta"><span>Kun ${escapeHtml(kun)}</span><span>On ${escapeHtml(on)}</span><span>${escapeHtml(learningLabel(current))}</span><span>Returns ${correct ? "later" : "soon"}</span></div>${current.anchor.sentence ? `<span lang="ja" class="kanji-feedback-example">${highlightedExample(current)}</span><span>${escapeHtml(current.anchor.translation)}</span>` : ""}<button class="ghost" id="kanjiReplay" type="button">🔊 Replay anchor word <kbd>R</kbd></button></div>`;
    $("#kanjiReplay").addEventListener("click", () => speak(current.anchor.reading));
    $("#kanjiDontKnow").classList.add("kanji-hidden");
    $("#kanjiNext").classList.remove("kanji-hidden");
    $("#kanjiKeyboardHint").innerHTML = "Press <kbd>Enter</kbd> for the next question.";
    renderAll();
  }

  function nextActivity() {
    if (view === "checkpoint") {
      showCheckpointNext();
      return;
    }
    const selected = view === "practice" ? selectForPractice() : selectForLearn();
    if (!selected?.entry) {
      view = "learn";
      document.querySelectorAll("[data-kanji-view]").forEach(button => button.classList.toggle("active", button.dataset.kanjiView === view));
      nextActivity();
      return;
    }
    currentReason = selected.reason;
    if (selected.introduce) beginIntroduction(selected.entry, selected.reason);
    else showQuestion(selected.entry, chooseFormat(selected.entry));
  }

  function advance() {
    if (phase === "introduction") startIntroducedQuestion();
    else if (phase === "answered") {
      if (view === "checkpoint") checkpoint.index += 1;
      nextActivity();
    } else if (phase === "checkpoint-summary") startCheckpoint();
  }

  function startCheckpoint() {
    const introduced = trackEntries().filter(entry => itemState(entry).introduced);
    if (!introduced.length) {
      view = "learn";
      document.querySelectorAll("[data-kanji-view]").forEach(button => button.classList.toggle("active", button.dataset.kanjiView === view));
      nextActivity();
      return;
    }
    const queue = [...introduced].sort((left, right) => reviewScore(right) - reviewScore(left)).slice(0, 8);
    checkpoint = { queue, index: 0, correct: 0, results: [] };
    showCheckpointNext();
  }

  function showCheckpointNext() {
    if (!checkpoint || checkpoint.index >= checkpoint.queue.length) {
      showCheckpointSummary();
      return;
    }
    const entry = checkpoint.queue[checkpoint.index];
    const format = MODE_KEYS[checkpoint.index % MODE_KEYS.length];
    currentReason = "Mixed transfer check";
    showQuestion(entry, format);
  }

  function showCheckpointSummary() {
    phase = "checkpoint-summary";
    current = null;
    const score = Math.round(checkpoint.correct / checkpoint.queue.length * 100);
    const missed = checkpoint.results.filter(result => !result.correct).map(result => entryById.get(result.id));
    $("#kanjiModeLabel").textContent = "Checkpoint · complete";
    $("#kanjiQuestionCount").textContent = `${checkpoint.correct} / ${checkpoint.queue.length} first-pass correct`;
    $("#kanjiCardBody").innerHTML = `<span class="kanji-question-kicker">Focused checkpoint</span><div class="kanji-character small">${score}%</div><div class="kanji-core-meaning">${score >= 85 ? "Strong first-pass recall" : score >= 60 ? "Useful practice completed" : "Review recommended"}</div><p class="muted">${missed.length ? `Review ${missed.map(entry => entry.character).join("、")} soon. They are already scheduled earlier.` : "Every kanji was correct on the first attempt."}</p>`;
    $("#kanjiFeedback").className = "feedback kanji-feedback";
    $("#kanjiDontKnow").classList.add("kanji-hidden");
    $("#kanjiNext").classList.remove("kanji-hidden");
    $("#kanjiNext").textContent = "Start another checkpoint";
    $("#kanjiKeyboardHint").textContent = "Eight questions are enough for one focused check.";
    renderAll();
  }

  function statusFor(entry) {
    const progress = itemState(entry);
    if (!progress.introduced) return "unintroduced";
    if (isMastered(entry)) return "mastered";
    if (Scheduler.reviewIsDue(progress, state.total)) return "due";
    return "learning";
  }

  function renderProgress() {
    const pool = trackEntries();
    const introduced = pool.filter(entry => itemState(entry).introduced);
    const mastered = pool.filter(isMastered);
    const due = dueEntries(pool);
    $("#kanjiProgressSummary").innerHTML = [
      [state.total, "answers"],
      [state.total ? `${Math.round(state.correct / state.total * 100)}%` : "—", "accuracy"],
      [`${introduced.length}/${pool.length}`, "introduced"],
      [mastered.length, "mastered"],
      [due.length, "due now"]
    ].map(([value, label]) => `<div><strong>${value}</strong><span>${label}</span></div>`).join("");
    renderMap();
    renderDetail();
  }

  function renderMap() {
    if (!$("#kanjiMap")) return;
    const query = $("#kanjiSearch").value.trim().toLocaleLowerCase();
    const entries = trackEntries().filter(entry => {
      const status = statusFor(entry);
      if (mapFilter !== "all" && status !== mapFilter) return false;
      if (!query) return true;
      return [entry.character, ...entry.meanings, ...entry.readings.kunyomi, ...entry.readings.onyomi, entry.anchor.word, entry.anchor.reading, entry.anchor.meaning].join(" ").toLocaleLowerCase().includes(query);
    });
    $("#kanjiMap").innerHTML = entries.map(entry => `<button class="kanji-map-item ${statusFor(entry)}" type="button" data-kanji-id="${entry.id}" aria-label="View ${entry.character}, ${escapeHtml(entry.meanings[0])}"><strong lang="ja">${entry.character}</strong><small>${escapeHtml(learningLabel(entry))}</small></button>`).join("") || `<p class="muted">No kanji match this search and filter.</p>`;
  }

  function renderDetail() {
    if (!$("#kanjiDetail")) return;
    let entry = entryById.get(selectedDetailId);
    if (!entry || !trackEntries().includes(entry)) entry = trackEntries()[0];
    selectedDetailId = entry.id;
    const progress = itemState(entry);
    const readings = [...entry.readings.kunyomi.map(reading => `Kun ${reading}`), ...entry.readings.onyomi.map(reading => `On ${reading}`)];
    $("#kanjiDetail").innerHTML = `<div class="kanji-detail-glyph" lang="ja">${entry.character}</div><div class="kanji-detail-copy"><h3>${escapeHtml(entry.meanings.join(", "))}</h3><p lang="ja"><strong>${escapeHtml(entry.anchor.word)}</strong> · ${escapeHtml(entry.anchor.reading)} · ${escapeHtml(entry.anchor.meaning)}</p><div class="kanji-reading-row">${readings.map(reading => `<span>${escapeHtml(reading)}</span>`).join("")}<span>${entry.strokes} strokes</span><span>Radical ${escapeHtml(entry.radical.character)} · ${escapeHtml(entry.radical.meaning)}</span></div><p>${progress.introduced ? `${escapeHtml(learningLabel(entry))} · ${progress.seen} graded attempt${progress.seen === 1 ? "" : "s"}` : "Not introduced yet"}</p>${entry.anchor.sentence ? `<p lang="ja">${highlightedExample(entry)}<br><small>${escapeHtml(entry.anchor.translation)}</small></p>` : ""}<div class="actions"><button class="ghost" id="kanjiDetailAudio" type="button">🔊 Hear anchor word</button></div></div>`;
    $("#kanjiDetailAudio").addEventListener("click", () => speak(entry.anchor.reading));
  }

  buildUI();
  renderAll();
  nextActivity();
})();

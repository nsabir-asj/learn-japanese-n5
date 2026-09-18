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
  let currentQuestionCountsAsReview = false;
  let currentQuestionQualifiesRecall = false;
  let practiceDraftScope = "all";
  let practiceDraftStageIds = new Set();
  let practiceDraftFormat = "mixed";
  let mapFilter = "all";
  let selectedDetailId = DATA.kanji[0].id;

  function emptyModeProgress() {
    return { seen: 0, correct: 0, wrong: 0, mastery: 0, recentResults: [], lastWasCorrect: null };
  }

  function emptyItemProgress() {
    return {
      introduced: false, seen: 0, correct: 0, wrong: 0, mastery: 0,
      lastWasCorrect: null, lastSeen: 0, dueAt: 0, dueQuestion: 0,
      recentResults: [], awaitingRecall: false, urgentMode: "", retentionStep: 0,
      reviewModel: "kanji-retention-v2", modes: Object.fromEntries(MODE_KEYS.map(mode => [mode, emptyModeProgress()]))
    };
  }

  function defaultState() {
    return {
      version: 1, questionFormat: "mixed", pace: 50, autoPronounce: true,
      total: 0, correct: 0, streak: 0, bestStreak: 0, reviewsSinceNew: 0, unlockedStageIndex: 0,
      practiceScope: "", practiceStageIds: [], practiceCoverage: { key: "", seenIds: [] },
      recent: [], items: {}, savedAt: 0
    };
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved?.version === 1) {
        const loaded = { ...defaultState(), ...saved, items: saved.items || {} };
        loaded.practiceScope = ["all", "learned", "groups"].includes(loaded.practiceScope) ? loaded.practiceScope : "";
        loaded.practiceStageIds = Array.isArray(loaded.practiceStageIds)
          ? loaded.practiceStageIds.filter(id => stageById.has(id))
          : [];
        loaded.practiceCoverage = loaded.practiceCoverage && typeof loaded.practiceCoverage === "object"
          ? { key: String(loaded.practiceCoverage.key || ""), seenIds: Array.isArray(loaded.practiceCoverage.seenIds) ? loaded.practiceCoverage.seenIds : [] }
          : { key: "", seenIds: [] };
        return loaded;
      }
    } catch {}
    return defaultState();
  }

  function itemState(entry) {
    const progress = state.items[entry.id] ||= emptyItemProgress();
    progress.modes ||= {};
    MODE_KEYS.forEach(mode => { progress.modes[mode] = { ...emptyModeProgress(), ...(progress.modes[mode] || {}) }; });
    if (progress.reviewModel !== "kanji-retention-v2") {
      const missedMode = MODE_KEYS.find(mode => progress.modes[mode].lastWasCorrect === false);
      progress.awaitingRecall = Boolean(progress.introduced && progress.seen === 0);
      progress.urgentMode = missedMode || "";
      progress.retentionStep = progress.mastery >= 72 ? 2 : progress.mastery >= 40 ? 1 : 0;
      if (!progress.awaitingRecall && !progress.urgentMode) progress.dueQuestion = 0;
      progress.reviewModel = "kanji-retention-v2";
    }
    progress.awaitingRecall = Boolean(progress.awaitingRecall);
    progress.urgentMode = MODE_KEYS.includes(progress.urgentMode) ? progress.urgentMode : "";
    progress.retentionStep = Math.max(0, Math.floor(Number(progress.retentionStep) || 0));
    return progress;
  }

  function saveState() {
    state.savedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function trackEntries() {
    return DATA.kanji;
  }

  function trackStages() {
    return DATA.stages;
  }

  function stageEntries(stage) {
    return stage.kanjiIds.map(id => entryById.get(id)).filter(Boolean);
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
    return progress.seen > 0 && !progress.awaitingRecall && !progress.urgentMode && progress.retentionStep >= 2
      && modeState(entry, "meaning").seen > 0 && modeState(entry, "reading").seen > 0 && overallMastery(entry) >= 72;
  }

  function learningLabel(entry) {
    const progress = itemState(entry);
    if (!progress.introduced && progress.seen === 0) return "Not practised";
    if (progress.urgentMode) return `${formatLabel(progress.urgentMode)} check due`;
    if (progress.awaitingRecall) return "Building first recall";
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

  function currentStageIndex() {
    const stages = trackStages();
    const saved = clamp(Math.floor(Number(state.unlockedStageIndex) || 0), 0, stages.length - 1);
    const introduced = stages.reduce((highest, stage, index) =>
      stageEntries(stage).some(entry => itemState(entry).introduced) ? index : highest, 0);
    state.unlockedStageIndex = Math.max(saved, introduced);
    return state.unlockedStageIndex;
  }

  function currentStage() {
    return trackStages()[Math.max(0, currentStageIndex())];
  }

  function unsettledEntries(entries = trackEntries()) {
    return entries.filter(entry => {
      const progress = itemState(entry);
      return progress.introduced && (progress.awaitingRecall || progress.urgentMode);
    });
  }

  function introductionDecision() {
    const introducedCount = trackEntries().filter(entry => itemState(entry).introduced).length;
    return Scheduler.nextKanjiIntroductionDecision(
      state.pace,
      state.reviewsSinceNew,
      unsettledEntries().length,
      introducedCount
    );
  }

  function introductionStatus(noun = "kanji") {
    const decision = introductionDecision();
    const unsettled = unsettledEntries().length;
    if (decision.paused) return `Checking ${unsettled} recently learned kanji before adding another`;
    if (decision.buildingStarterSet) return "Building a three-kanji starter set";
    if (decision.introduce) return `The next ${noun} is ready`;
    const count = decision.remainingReviews;
    return `Next ${noun} after ${count} successful review${count === 1 ? "" : "s"}`;
  }

  function stageUnlockDecision() {
    const stages = trackStages();
    const index = currentStageIndex();
    const entries = stageEntries(stages[index]);
    if (index >= stages.length - 1) return { eligible: false, finalStage: true };
    if (!entries.every(entry => itemState(entry).introduced && itemState(entry).seen > 0)) {
      return { eligible: false, finalStage: false };
    }
    return {
      eligible: true,
      finalStage: false,
      ...introductionDecision()
    };
  }

  function maybeUnlockNextStage() {
    const decision = stageUnlockDecision();
    if (!decision.eligible || !decision.introduce) return false;
    state.unlockedStageIndex = Math.min(trackStages().length - 1, currentStageIndex() + 1);
    return true;
  }

  function stageTransitionStatus() {
    const stages = trackStages();
    const index = currentStageIndex();
    const entries = stageEntries(stages[index]);
    if (index >= stages.length - 1 || entries.some(entry => !itemState(entry).introduced)) return "";
    if (entries.some(entry => itemState(entry).seen === 0)) return "Complete each new-kanji question to prepare the next stage";
    const decision = stageUnlockDecision();
    if (decision.paused) return `Checking ${unsettledEntries().length} recently learned kanji before opening stage ${index + 2}`;
    if (decision.introduce) return `Stage ${index + 2} is ready after this question`;
    const count = decision.remainingReviews;
    return `Next stage after ${count} successful review${count === 1 ? "" : "s"}`;
  }

  function dueEntries(entries = trackEntries()) {
    const now = Date.now();
    return entries.filter(entry => {
      const progress = itemState(entry);
      return (progress.introduced || progress.seen > 0) && Scheduler.reviewIsDue(progress, state.total, now);
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
    const progress = itemState(entry);
    if (progress.urgentMode && Scheduler.reviewIsDue(progress, state.total)) return progress.urgentMode;
    if (progress.awaitingRecall && Scheduler.reviewIsDue(progress, state.total)) return "meaning";
    return state.questionFormat === "mixed" ? weakestMode(entry) : state.questionFormat;
  }

  function reviewScore(entry) {
    const progress = itemState(entry);
    let score = Scheduler.reviewScore(progress);
    if (state.recent.slice(-5).includes(entry.id)) score -= 55;
    if (Scheduler.reviewIsDue(progress, state.total)) score += 28;
    if (progress.awaitingRecall && Scheduler.reviewIsDue(progress, state.total)) score += 90;
    if (progress.urgentMode && Scheduler.reviewIsDue(progress, state.total)) score += 140;
    return score;
  }

  function selectReview(entries) {
    const available = entries.filter(entry => itemState(entry).introduced);
    if (!available.length) return null;
    const due = available.filter(entry => Scheduler.reviewIsDue(itemState(entry), state.total));
    const urgent = due.filter(entry => itemState(entry).urgentMode);
    const firstRecall = due.filter(entry => itemState(entry).awaitingRecall);
    const candidates = urgent.length ? urgent : firstRecall.length ? firstRecall : due.length ? due : available;
    return [...candidates].sort((left, right) => reviewScore(right) - reviewScore(left))[0];
  }

  function selectForLearn() {
    const stage = currentStage();
    const entries = stageEntries(stage);
    const unseen = entries.filter(entry => !itemState(entry).introduced);
    const introduced = trackEntries().filter(entry => itemState(entry).introduced);
    if (unseen.length && !introduced.length) {
      return { entry: unseen[0], introduce: true, reason: `New in ${stage.label}` };
    }
    if (unseen.length) {
      const decision = introductionDecision();
      if (decision.introduce) return { entry: unseen[0], introduce: true, reason: `New in ${stage.label}` };
    }
    const review = selectReview(introduced);
    if (!review) return { entry: unseen[0], introduce: true, reason: `New in ${stage.label}` };
    const progress = itemState(review);
    const due = Scheduler.reviewIsDue(progress, state.total);
    const reason = due && progress.urgentMode
      ? `${formatLabel(progress.urgentMode)} recovery check`
      : due && progress.awaitingRecall ? `First recall check for ${review.character}`
        : due ? "Scheduled retention review" : "Strengthening recall";
    return { entry: review, introduce: false, reason };
  }

  function selectForReview() {
    const introduced = trackEntries().filter(entry => itemState(entry).introduced);
    const review = selectReview(introduced);
    return review ? { entry: review, introduce: false, reason: dueEntries(introduced).includes(review) ? "Due review" : "Adaptive weak-area review" } : null;
  }

  function practiceSelectionKey(scope = state.practiceScope, stageIds = state.practiceStageIds) {
    return scope === "groups" ? `groups:${[...stageIds].sort().join(",")}` : scope;
  }

  function practicePool(scope = state.practiceScope, stageIds = state.practiceStageIds) {
    if (scope === "all") return trackEntries();
    if (scope === "learned") return trackEntries().filter(entry => {
      const progress = itemState(entry);
      return progress.introduced || progress.seen > 0;
    });
    const selected = new Set(stageIds);
    return trackEntries().filter(entry => selected.has(entry.stageId));
  }

  function normalizePracticeCoverage() {
    const key = practiceSelectionKey();
    if (state.practiceCoverage.key !== key) state.practiceCoverage = { key, seenIds: [] };
    const available = new Set(practicePool().map(entry => entry.id));
    state.practiceCoverage.seenIds = [...new Set(state.practiceCoverage.seenIds)].filter(id => available.has(id));
    return state.practiceCoverage;
  }

  function practiceScopeLabel(scope = state.practiceScope, stageIds = state.practiceStageIds) {
    if (scope === "all") return "All 120 kanji";
    if (scope === "learned") return "My learned kanji";
    const selected = trackStages().filter(stage => stageIds.includes(stage.id));
    if (selected.length <= 3) return selected.map(stage => `Group ${stage.order}`).join(", ") || "Choose groups";
    return `${selected.length} groups`;
  }

  function practiceCoverageSummary() {
    const pool = practicePool();
    const seen = new Set(normalizePracticeCoverage().seenIds);
    const checked = pool.filter(entry => seen.has(entry.id)).length;
    return { checked, total: pool.length, text: `${checked}/${pool.length} kanji checked` };
  }

  function selectPracticeAdaptive(entries) {
    const available = entries.filter(entry => itemState(entry).seen > 0);
    if (!available.length) return null;
    const due = available.filter(entry => Scheduler.reviewIsDue(itemState(entry), state.total));
    const urgent = due.filter(entry => itemState(entry).urgentMode);
    const candidates = urgent.length ? urgent : due.length ? due : available;
    return [...candidates].sort((left, right) => reviewScore(right) - reviewScore(left))[0];
  }

  function selectForPractice() {
    const pool = practicePool();
    if (!pool.length) return null;
    const coverage = normalizePracticeCoverage();
    const checked = new Set(coverage.seenIds);
    const urgent = pool.filter(entry => itemState(entry).urgentMode && Scheduler.reviewIsDue(itemState(entry), state.total));
    if (urgent.length) {
      const entry = [...urgent].sort((left, right) => reviewScore(right) - reviewScore(left))[0];
      return { entry, introduce: false, reason: `${formatLabel(itemState(entry).urgentMode)} recovery check` };
    }
    const uncovered = pool.filter(entry => !checked.has(entry.id));
    if (uncovered.length) {
      const stages = trackStages().filter(stage => uncovered.some(entry => entry.stageId === stage.id));
      const stage = stages.sort((left, right) => {
        const leftEntries = pool.filter(entry => entry.stageId === left.id);
        const rightEntries = pool.filter(entry => entry.stageId === right.id);
        const leftRatio = leftEntries.filter(entry => checked.has(entry.id)).length / leftEntries.length;
        const rightRatio = rightEntries.filter(entry => checked.has(entry.id)).length / rightEntries.length;
        return leftRatio - rightRatio || left.order - right.order;
      })[0];
      const recent = new Set(state.recent.slice(-5));
      const stageUncovered = uncovered.filter(entry => entry.stageId === stage.id);
      const entry = stageUncovered.find(candidate => !recent.has(candidate.id)) || stageUncovered[0];
      return { entry, introduce: false, reason: `Coverage · Group ${stage.order} · ${checked.size}/${pool.length} checked` };
    }
    const review = selectPracticeAdaptive(pool);
    return review ? { entry: review, introduce: false, reason: "Coverage complete · adaptive practice" } : null;
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
        <button class="kanji-mode-tab" type="button" data-kanji-view="review"><strong>Review</strong><small>Strengthen learned kanji</small></button>
        <button class="kanji-mode-tab" type="button" data-kanji-view="practice"><strong>Practice</strong><small>Choose groups to practise</small></button>
        <button class="kanji-mode-tab" type="button" data-kanji-view="progress"><strong>Kanji map</strong><small>Browse progress and details</small></button>
      </nav>
      <section class="kanji-workspace" id="kanjiWorkspace">
        <div class="kanji-main">
          <section class="trainer kanji-trainer" aria-live="polite">
            <div class="trainer-top"><div class="mode-tag"><span class="dot"></span><span id="kanjiModeLabel">Learn · guided kanji</span></div><div class="kanji-context"><div><div class="tiny" id="kanjiQuestionCount">Ready</div><span class="tiny" id="kanjiStageProgressText">Stage progress</span></div><button class="ghost kanji-hidden" id="kanjiChangePractice" type="button">Change groups</button></div></div>
            <div class="kanji-stage-progress" role="progressbar" aria-label="Current stage introductions" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="kanjiStageProgress"></span></div>
            <div class="kanji-card-body" id="kanjiCardBody"></div>
            <div class="feedback kanji-feedback" id="kanjiFeedback"></div>
            <div class="footer-actions kanji-footer"><div class="actions"><button class="ghost kanji-hidden" id="kanjiDontKnow" type="button">I don’t know</button><button class="big-button kanji-hidden" id="kanjiNext" type="button">Continue <kbd>Enter</kbd></button></div><span class="tiny" id="kanjiKeyboardHint">New kanji are introduced before testing.</span></div>
          </section>
          <details class="card kanji-session-card" id="kanjiSessionControls">
            <summary><span><strong>Session controls</strong><small id="kanjiSessionSummary">JLPT N5 · mixed practice · balanced pace</small></span></summary>
            <div class="kanji-controls">
              <div class="kanji-track-field"><span>Learning course</span><strong>JLPT N5</strong><small class="tiny">The guided journey covers 104 core kanji, followed by 16 extension kanji.</small></div>
              <label><span>Question direction</span><select id="kanjiQuestionFormat"><option value="mixed">Mixed automatically</option><option value="meaning">Kanji → meaning</option><option value="reading">Word → reading</option><option value="spelling">Reading → kanji word</option></select><small class="tiny">Mixed practice targets the weakest direction.</small></label>
              <label class="kanji-pace" id="kanjiPaceControl"><span>New-kanji pace: <strong id="kanjiPaceLabel">Balanced</strong></span><input id="kanjiPace" type="range" min="10" max="90" step="10"><span class="kanji-pace-labels"><span>More review</span><span>More new</span></span><small class="tiny" id="kanjiPaceDescription"></small></label>
              <div class="kanji-playback-settings"><label class="kanji-toggle"><input type="checkbox" id="kanjiAutoPronounce"><span>Automatically pronounce revealed words</span></label><div class="actions"><button class="ghost" id="kanjiPracticeSetup" type="button">Practice setup</button><button class="ghost" id="kanjiManageVoices" type="button">Manage voices</button></div></div>
            </div>
            <p class="kanji-attribution tiny">Meanings, readings, stroke counts, and radical data adapted from <a href="https://github.com/kanjialive/kanji-data-media" target="_blank" rel="noreferrer">Kanji alive</a> under CC BY 4.0.</p>
          </details>
          <details class="card kanji-roadmap-card" id="kanjiJourney">
            <summary><span><strong id="kanjiJourneyTitle">JLPT N5 journey</strong><small id="kanjiJourneySummary">Stage 1 of 12 · 0/120 introduced</small></span></summary>
            <div class="kanji-roadmap-content"><div class="kanji-stage-list" id="kanjiStageList"></div></div>
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
      </section>
      <dialog class="kanji-stage-dialog" id="kanjiStageDialog" aria-labelledby="kanjiStageDialogTitle" aria-describedby="kanjiStageDialogDescription">
        <div class="kanji-stage-dialog-shell">
          <header><div><span class="tiny" id="kanjiStageDialogEyebrow">Stage overview</span><h2 id="kanjiStageDialogTitle">People & first numbers</h2><p id="kanjiStageDialogDescription"></p></div><button class="kanji-stage-dialog-close" id="kanjiStageDialogClose" type="button" aria-label="Close stage overview">×</button></header>
          <div class="kanji-stage-dialog-body"><div class="kanji-stage-dialog-stats" id="kanjiStageDialogStats"></div><div><h3>Kanji in this stage</h3><p class="muted">Choose a kanji to open its complete readings, example, and progress in the Kanji map.</p></div><div class="kanji-stage-dialog-list" id="kanjiStageDialogList"></div></div>
          <footer><span class="tiny" id="kanjiStageDialogHint">Future stages can be previewed before they unlock.</span><button class="ghost" id="kanjiStageDialogDone" type="button">Close</button></footer>
        </div>
      </dialog>
      <dialog class="kanji-stage-dialog kanji-practice-dialog" id="kanjiPracticeDialog" aria-labelledby="kanjiPracticeDialogTitle">
        <div class="kanji-stage-dialog-shell">
          <header><div><span class="tiny">Practice setup</span><h2 id="kanjiPracticeDialogTitle">Choose what to practise</h2><p>Use all N5 kanji, your learned set, or any combination of curriculum groups.</p></div><button class="kanji-stage-dialog-close" id="kanjiPracticeDialogClose" type="button" aria-label="Close practice setup">×</button></header>
          <div class="kanji-stage-dialog-body kanji-practice-dialog-body">
            <div class="kanji-practice-scope-options" id="kanjiPracticeScopeOptions">
              <label><input type="radio" name="kanjiPracticeScope" value="all"><span><strong>All JLPT N5 kanji</strong><small>Practise all 120 characters</small></span></label>
              <label><input type="radio" name="kanjiPracticeScope" value="learned"><span><strong>My learned kanji</strong><small id="kanjiLearnedScopeCount">Introduced or previously practised</small></span></label>
              <label><input type="radio" name="kanjiPracticeScope" value="groups"><span><strong>Choose groups</strong><small>Select one or more curriculum groups</small></span></label>
            </div>
            <div class="kanji-practice-groups" id="kanjiPracticeGroups"><div class="kanji-practice-groups-heading"><div><h3>Curriculum groups</h3><p class="muted">Choose any combination. Selecting a group does not mark its kanji as learned.</p></div><div class="actions"><button class="ghost" id="kanjiPracticeSelectAll" type="button">Select all</button><button class="ghost" id="kanjiPracticeClear" type="button">Clear</button></div></div><div class="kanji-practice-group-grid" id="kanjiPracticeGroupGrid"></div></div>
            <label class="kanji-practice-direction"><span>Question direction</span><select id="kanjiPracticeFormat"><option value="mixed">Mixed automatically</option><option value="meaning">Kanji → meaning</option><option value="reading">Word → reading</option><option value="spelling">Reading → kanji word</option></select><small>Mixed practice rotates toward each kanji’s weakest direction.</small></label>
          </div>
          <footer><span class="tiny" id="kanjiPracticeSelectionSummary">120 kanji selected</span><button class="big-button" id="kanjiPracticeApply" type="button">Start practice</button></footer>
        </div>
      </dialog>`;
    host.appendChild(shell);

    $("#kanjiQuestionFormat").value = state.questionFormat;
    $("#kanjiPace").value = String(state.pace);
    $("#kanjiAutoPronounce").checked = state.autoPronounce;
    globalThis.KANA_SPRINT_SYNC_RANGE?.($("#kanjiPace"));
    bindEvents();
  }

  function bindEvents() {
    document.querySelectorAll("[data-kanji-view]").forEach(button => button.addEventListener("click", () => switchView(button.dataset.kanjiView)));
    $("#kanjiDontKnow").addEventListener("click", () => answer(null));
    $("#kanjiNext").addEventListener("click", advance);
    $("#kanjiQuestionFormat").addEventListener("change", event => {
      state.questionFormat = MODE_KEYS.includes(event.target.value) ? event.target.value : "mixed";
      saveState();
      renderAll();
      if (phase === "question") showQuestion(current, chooseFormat(current), currentQuestionCountsAsReview);
    });
    $("#kanjiPace").addEventListener("input", event => {
      state.pace = Number(event.target.value);
      renderControls();
      renderRoadmap();
    });
    $("#kanjiPace").addEventListener("change", saveState);
    $("#kanjiAutoPronounce").addEventListener("change", event => { state.autoPronounce = event.target.checked; saveState(); });
    $("#kanjiChangePractice").addEventListener("click", openPracticeDialog);
    $("#kanjiPracticeSetup").addEventListener("click", openPracticeDialog);
    $("#kanjiManageVoices").addEventListener("click", () => globalThis.KANA_SPRINT_SPEECH?.openSettings());
    $("#kanjiStageList").addEventListener("click", event => {
      const button = event.target.closest("[data-kanji-stage-id]");
      if (button) openStageDialog(button.dataset.kanjiStageId);
    });
    $("#kanjiStageDialogList").addEventListener("click", event => {
      const button = event.target.closest("[data-stage-kanji-id]");
      if (button) openMapDetail(button.dataset.stageKanjiId);
    });
    $("#kanjiStageDialogClose").addEventListener("click", closeStageDialog);
    $("#kanjiStageDialogDone").addEventListener("click", closeStageDialog);
    $("#kanjiStageDialog").addEventListener("click", event => { if (event.target === $("#kanjiStageDialog")) closeStageDialog(); });
    $("#kanjiPracticeDialogClose").addEventListener("click", closePracticeDialog);
    $("#kanjiPracticeDialog").addEventListener("click", event => { if (event.target === $("#kanjiPracticeDialog")) closePracticeDialog(); });
    $("#kanjiPracticeScopeOptions").addEventListener("change", event => {
      if (!event.target.matches('[name="kanjiPracticeScope"]')) return;
      practiceDraftScope = event.target.value;
      renderPracticeSetup();
    });
    $("#kanjiPracticeGroupGrid").addEventListener("change", event => {
      if (!event.target.matches("[data-practice-stage-id]")) return;
      if (event.target.checked) practiceDraftStageIds.add(event.target.dataset.practiceStageId);
      else practiceDraftStageIds.delete(event.target.dataset.practiceStageId);
      practiceDraftScope = "groups";
      renderPracticeSetup();
    });
    $("#kanjiPracticeSelectAll").addEventListener("click", () => {
      practiceDraftScope = "groups";
      practiceDraftStageIds = new Set(trackStages().map(stage => stage.id));
      renderPracticeSetup();
    });
    $("#kanjiPracticeClear").addEventListener("click", () => {
      practiceDraftScope = "groups";
      practiceDraftStageIds.clear();
      renderPracticeSetup();
    });
    $("#kanjiPracticeFormat").addEventListener("change", event => { practiceDraftFormat = event.target.value; });
    $("#kanjiPracticeApply").addEventListener("click", applyPracticeSetup);
    $("#kanjiSearch").addEventListener("input", renderMap);
    $("#kanjiMapFilter").addEventListener("change", event => { mapFilter = event.target.value; renderMap(); });
    $("#kanjiMap").addEventListener("click", event => {
      const button = event.target.closest("[data-kanji-id]");
      if (!button) return;
      selectedDetailId = button.dataset.kanjiId;
      renderDetail();
    });
    document.addEventListener("keydown", event => {
      if ($("#kanjiPracticeDialog").open || $("#kanjiStageDialog").open) return;
      if (event.key === "Enter" && !event.target.matches("input,select,textarea,button")) {
        event.preventDefault();
        if (phase === "introduction") startIntroducedQuestion();
        else if (phase === "answered") advance();
      }
      if (/^[1-4]$/.test(event.key) && phase === "question" && !event.target.matches("input,select,textarea")) {
        const button = $("#kanjiCardBody").querySelectorAll("[data-choice-id]")[Number(event.key) - 1];
        if (button) { event.preventDefault(); button.click(); }
      }
      if (event.key.toLowerCase() === "r" && current && !event.target.matches("input,select,textarea")) speak(current.anchor.reading);
    });
  }

  function closePracticeDialog() {
    if ($("#kanjiPracticeDialog").open) $("#kanjiPracticeDialog").close();
  }

  function renderPracticeSetup() {
    const stageIds = [...practiceDraftStageIds];
    const pool = practicePool(practiceDraftScope, stageIds);
    const learnedCount = practicePool("learned").length;
    $("#kanjiLearnedScopeCount").textContent = learnedCount
      ? `${learnedCount} introduced or previously practised kanji`
      : "No kanji have been learned or practised yet";
    document.querySelectorAll('[name="kanjiPracticeScope"]').forEach(input => { input.checked = input.value === practiceDraftScope; });
    $("#kanjiPracticeGroups").classList.toggle("kanji-hidden", practiceDraftScope !== "groups");
    $("#kanjiPracticeFormat").value = practiceDraftFormat;
    $("#kanjiPracticeGroupGrid").innerHTML = trackStages().map(stage => {
      const entries = stageEntries(stage);
      const introduced = entries.filter(entry => itemState(entry).introduced).length;
      const strong = entries.filter(isMastered).length;
      const selected = practiceDraftStageIds.has(stage.id);
      return `<label class="kanji-practice-group ${selected ? "selected" : ""}"><input type="checkbox" data-practice-stage-id="${stage.id}" ${selected ? "checked" : ""}><span class="kanji-practice-group-number">${stage.order}</span><span><strong>${escapeHtml(stage.label)}</strong><small>${entries.length} kanji · ${introduced} introduced${strong ? ` · ${strong} strong` : ""}</small><i><span style="width:${entries.length ? introduced / entries.length * 100 : 0}%"></span></i></span></label>`;
    }).join("");
    const valid = pool.length > 0;
    $("#kanjiPracticeApply").disabled = !valid;
    $("#kanjiPracticeSelectionSummary").textContent = valid
      ? `${practiceDraftScope === "groups" ? `${stageIds.length} group${stageIds.length === 1 ? "" : "s"} · ` : ""}${pool.length} kanji selected`
      : practiceDraftScope === "learned" ? "Learn or practise a kanji first" : "Choose at least one group";
  }

  function openPracticeDialog() {
    practiceDraftScope = state.practiceScope || "all";
    practiceDraftStageIds = new Set(state.practiceStageIds);
    practiceDraftFormat = state.questionFormat;
    renderPracticeSetup();
    if (!$("#kanjiPracticeDialog").open) $("#kanjiPracticeDialog").showModal();
  }

  function applyPracticeSetup() {
    const stageIds = [...practiceDraftStageIds];
    if (!practicePool(practiceDraftScope, stageIds).length) return;
    const previousKey = practiceSelectionKey();
    state.practiceScope = practiceDraftScope;
    state.practiceStageIds = stageIds;
    state.questionFormat = MODE_KEYS.includes(practiceDraftFormat) ? practiceDraftFormat : "mixed";
    const nextKey = practiceSelectionKey();
    if (previousKey !== nextKey) state.practiceCoverage = { key: nextKey, seenIds: [] };
    $("#kanjiQuestionFormat").value = state.questionFormat;
    saveState();
    closePracticeDialog();
    switchView("practice");
  }

  function switchView(nextView) {
    if (nextView === "practice" && !state.practiceScope) {
      openPracticeDialog();
      return;
    }
    view = nextView;
    phase = "idle";
    current = null;
    document.querySelectorAll("[data-kanji-view]").forEach(button => button.classList.toggle("active", button.dataset.kanjiView === view));
    $("#kanjiWorkspace").classList.toggle("kanji-hidden", view === "progress");
    $("#kanjiProgressPanel").classList.toggle("kanji-hidden", view !== "progress");
    if (view === "progress") renderProgress();
    else nextActivity();
    renderAll();
  }

  function paceLabel() {
    if (state.pace <= 30) return "Review-heavy";
    if (state.pace >= 70) return "Fast";
    return "Balanced";
  }

  function renderControls() {
    $("#kanjiPaceLabel").textContent = paceLabel();
    $("#kanjiPaceDescription").textContent = introductionStatus();
    $("#kanjiPaceControl").classList.toggle("kanji-hidden", view !== "learn");
    $("#kanjiChangePractice").classList.toggle("kanji-hidden", view !== "practice");
    const direction = state.questionFormat === "mixed" ? "mixed practice" : formatLabel(state.questionFormat);
    $("#kanjiSessionSummary").textContent = view === "practice"
      ? `${practiceScopeLabel()} · ${direction}`
      : view === "review" ? `Introduced kanji · ${direction}`
        : `JLPT N5 · ${direction} · ${paceLabel().toLowerCase()} pace`;
  }

  function renderRoadmap() {
    const stages = trackStages();
    const activeIndex = currentStageIndex();
    const totalIntroduced = trackEntries().filter(entry => itemState(entry).introduced).length;
    $("#kanjiJourneyTitle").textContent = "JLPT N5 journey";
    const transitionStatus = stageTransitionStatus();
    const hasUnintroduced = totalIntroduced < trackEntries().length;
    const pacingStatus = hasUnintroduced ? introductionStatus() : "";
    $("#kanjiJourneySummary").textContent = view === "practice"
      ? `${practiceScopeLabel()} · ${practiceCoverageSummary().text}`
      : transitionStatus || pacingStatus || `Stage ${activeIndex + 1} of ${stages.length} · ${totalIntroduced}/${trackEntries().length} introduced`;
    $("#kanjiStageList").innerHTML = stages.map((stage, index) => {
      const entries = stageEntries(stage);
      const introduced = entries.filter(entry => itemState(entry).introduced).length;
      const strong = entries.filter(isMastered).length;
      const coverage = entries.length ? Math.round(introduced / entries.length * 100) : 0;
      const status = index < activeIndex ? "Covered" : index === activeIndex ? "Current" : "Locked";
      return `<button class="kanji-stage ${index === activeIndex ? "current" : index > activeIndex ? "locked" : ""}" type="button" data-kanji-stage-id="${stage.id}" aria-label="View stage ${index + 1}, ${escapeHtml(stage.label)}"><span class="kanji-stage-number">${index + 1}</span><span class="kanji-stage-copy"><strong>${escapeHtml(stage.label)}</strong><span class="kanji-stage-meter"><span style="width:${coverage}%"></span></span><small>${introduced}/${entries.length} introduced · ${strong}/${entries.length} strong</small></span><span class="kanji-stage-status">${status}<i aria-hidden="true">›</i></span></button>`;
    }).join("");
    const stage = currentStage();
    const entries = stageEntries(stage);
    const introduced = entries.filter(entry => itemState(entry).introduced).length;
    const stagePercent = entries.length ? Math.round(introduced / entries.length * 100) : 0;
    const practiceCoverage = view === "practice" ? practiceCoverageSummary() : null;
    const progressPercent = practiceCoverage?.total ? Math.round(practiceCoverage.checked / practiceCoverage.total * 100) : stagePercent;
    $("#kanjiStageProgress").style.width = `${progressPercent}%`;
    const progressBar = $(".kanji-stage-progress");
    progressBar.setAttribute("aria-valuenow", String(progressPercent));
    progressBar.setAttribute("aria-label", practiceCoverage ? "Practice selection coverage" : "Current stage introductions");
    $("#kanjiStageProgressText").textContent = practiceCoverage
      ? `${practiceScopeLabel()} · ${practiceCoverage.text}`
      : transitionStatus || pacingStatus || `Stage ${currentStageIndex() + 1} of ${stages.length} · ${stage.label} · ${introduced}/${entries.length} introduced`;
    if (view === "practice" && phase === "answered") {
      $("#kanjiQuestionCount").textContent = current?.stageId
        ? `Coverage · Group ${stageById.get(current.stageId)?.order || ""} · ${practiceCoverage.text}`
        : `Coverage · ${practiceCoverage.text}`;
    }
  }

  function renderDashboard() {
    const pool = trackEntries();
    const introduced = pool.filter(entry => itemState(entry).introduced);
    const mastered = pool.filter(isMastered);
    const due = dueEntries(pool);
    const accuracy = state.total ? `${Math.round(state.correct / state.total * 100)}%` : "—";
    globalThis.dispatchEvent(new CustomEvent("kana-sprint-streak-context", { detail: { current: state.streak, best: state.bestStreak, label: "kanji streak" } }));
    globalThis.dispatchEvent(new CustomEvent("kana-sprint-activity-status", { detail: {
      note: "JLPT N5 journey",
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
    currentQuestionCountsAsReview = false;
    currentQuestionQualifiesRecall = false;
    state.reviewsSinceNew = 0;
    const progress = itemState(entry);
    const hasPracticeEvidence = progress.seen > 0;
    progress.introduced = true;
    if (!hasPracticeEvidence) {
      progress.awaitingRecall = true;
      progress.urgentMode = "";
      progress.retentionStep = 0;
      progress.dueAt = 0;
      progress.dueQuestion = 0;
    }
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
    if (state.autoPronounce) speak(entry.anchor.reading);
    renderAll();
  }

  function startIntroducedQuestion() {
    if (!current) return;
    showQuestion(current, "meaning", false);
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

  function showQuestion(entry, format, countsAsReview = true) {
    current = entry;
    currentFormat = format;
    currentQuestionCountsAsReview = countsAsReview;
    currentQuestionQualifiesRecall = countsAsReview && Scheduler.reviewIsDue(itemState(entry), state.total);
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
      const detail = format === "meaning"
        ? `${choice.anchor.word}（${choice.anchor.reading}） · ${choice.anchor.meaning}`
        : format === "reading"
          ? `${choice.anchor.word} · ${choice.anchor.meaning}`
          : `${choice.anchor.reading} · ${choice.anchor.meaning}`;
      const language = format === "meaning" ? "" : ' lang="ja"';
      return `<button class="kanji-choice ${format === "meaning" ? "meaning-choice" : "japanese-choice"}" type="button" data-choice-id="${choice.id}"><span>${choices.indexOf(choice) + 1}</span><span><strong${language}>${escapeHtml(main)}</strong><small class="kanji-choice-secondary" aria-hidden="true">${escapeHtml(detail)}</small></span></button>`;
    };
    const viewLabel = view === "review" ? "Review" : view === "practice" ? "Practice" : "Learn";
    $("#kanjiModeLabel").textContent = `${viewLabel} · ${formatLabel(format)}`;
    $("#kanjiQuestionCount").textContent = currentReason;
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
    if (view !== "practice") progress.introduced = true;
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
      if (currentQuestionQualifiesRecall) {
        progress.awaitingRecall = false;
        if (progress.urgentMode === currentFormat) progress.urgentMode = "";
      }
    } else {
      progress.wrong += 1;
      direction.wrong += 1;
      direction.mastery = Math.max(0, direction.mastery - 12);
      progress.urgentMode = currentFormat;
      progress.retentionStep = 0;
      state.streak = 0;
    }
    progress.mastery = overallMastery(current);
    state.total += 1;
    const initialLearningCheck = !currentQuestionCountsAsReview && progress.awaitingRecall;
    const resolvedReview = correct && currentQuestionQualifiesRecall && !progress.awaitingRecall && !progress.urgentMode;
    if (!correct || initialLearningCheck || resolvedReview) {
      Object.assign(progress, Scheduler.nextKanjiReviewSchedule({
        correct,
        initial: initialLearningCheck,
        retentionStep: progress.retentionStep,
        questionNumber: state.total,
        now
      }));
    }
    state.recent.push(current.id);
    state.recent = state.recent.slice(-12);
    if (view === "learn" && currentQuestionCountsAsReview && correct) state.reviewsSinceNew += 1;
    if (view === "practice") {
      const coverage = normalizePracticeCoverage();
      if (!coverage.seenIds.includes(current.id)) coverage.seenIds.push(current.id);
    }
    saveState();
  }

  function answer(selectedId) {
    if (phase !== "question" || !current) return;
    phase = "answered";
    const correct = selectedId === current.id;
    applyResult(correct);
    $(".kanji-options").classList.add("is-answered");
    $(".kanji-options").querySelectorAll(".kanji-choice-secondary").forEach(detail => detail.removeAttribute("aria-hidden"));
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
    if (state.autoPronounce) speak(current.anchor.reading);
    renderAll();
  }

  function nextActivity() {
    if (view === "learn") maybeUnlockNextStage();
    const selected = view === "review" ? selectForReview() : view === "practice" ? selectForPractice() : selectForLearn();
    if (!selected?.entry) {
      if (view === "review") renderEmptyMode("Nothing to review yet", "Learn at least one kanji first. Review will then prioritize due, weak, and mistaken kanji.", "Start learning", () => switchView("learn"));
      else if (view === "practice") renderEmptyMode("Choose some kanji to practise", "Change the Practice scope to all N5 kanji or select one or more curriculum groups.", "Change groups", openPracticeDialog);
      return;
    }
    currentReason = selected.reason;
    if (selected.introduce) beginIntroduction(selected.entry, selected.reason);
    else showQuestion(selected.entry, chooseFormat(selected.entry));
  }

  function advance() {
    if (phase === "introduction") startIntroducedQuestion();
    else if (phase === "answered") nextActivity();
  }

  function renderEmptyMode(title, copy, buttonLabel, action) {
    phase = "empty";
    current = null;
    $("#kanjiModeLabel").textContent = view === "review" ? "Review" : "Practice";
    $("#kanjiQuestionCount").textContent = "Setup needed";
    $("#kanjiCardBody").innerHTML = `<span class="kanji-question-kicker">${view === "review" ? "Adaptive review" : "Selected practice"}</span><div class="kanji-core-meaning">${escapeHtml(title)}</div><p class="muted">${escapeHtml(copy)}</p><button class="big-button" id="kanjiEmptyAction" type="button">${escapeHtml(buttonLabel)}</button>`;
    $("#kanjiFeedback").className = "feedback kanji-feedback";
    $("#kanjiDontKnow").classList.add("kanji-hidden");
    $("#kanjiNext").classList.add("kanji-hidden");
    $("#kanjiKeyboardHint").textContent = "Choose an option to continue.";
    $("#kanjiEmptyAction").addEventListener("click", action);
    renderAll();
  }

  function statusFor(entry) {
    const progress = itemState(entry);
    if (!progress.introduced && progress.seen === 0) return "unintroduced";
    if (isMastered(entry)) return "mastered";
    if (Scheduler.reviewIsDue(progress, state.total)) return "due";
    return "learning";
  }

  function closeStageDialog() {
    if ($("#kanjiStageDialog").open) $("#kanjiStageDialog").close();
  }

  function openStageDialog(stageId) {
    const stage = stageById.get(stageId);
    if (!stage) return;
    const stages = trackStages();
    const index = stages.findIndex(candidate => candidate.id === stage.id);
    const activeIndex = currentStageIndex();
    const entries = stageEntries(stage);
    const introduced = entries.filter(entry => itemState(entry).introduced);
    const strong = entries.filter(isMastered);
    const due = dueEntries(entries);
    const learning = introduced.filter(entry => !isMastered(entry));
    const stageStatus = index < activeIndex ? "Earlier stage" : index === activeIndex ? "Current stage" : "Preview · unlocks later";
    $("#kanjiStageDialogEyebrow").textContent = `Stage ${index + 1} of ${stages.length} · ${stageStatus}`;
    $("#kanjiStageDialogTitle").textContent = stage.label;
    $("#kanjiStageDialogDescription").textContent = stage.description;
    $("#kanjiStageDialogStats").innerHTML = [
      [`${introduced.length}/${entries.length}`, "introduced"],
      [learning.length, "learning"],
      [strong.length, "strong"],
      [due.length, "due now"]
    ].map(([value, label]) => `<div><strong>${value}</strong><span>${label}</span></div>`).join("");
    $("#kanjiStageDialogList").innerHTML = entries.map(entry => `<button class="kanji-stage-kanji ${statusFor(entry)}" type="button" data-stage-kanji-id="${entry.id}" aria-label="View ${entry.character}, ${escapeHtml(entry.meanings[0])}, in Kanji map"><span class="kanji-stage-kanji-glyph" lang="ja">${entry.character}</span><span class="kanji-stage-kanji-copy"><strong>${escapeHtml(entry.meanings.join(", "))}</strong><span lang="ja">${escapeHtml(entry.anchor.word)}（${escapeHtml(entry.anchor.reading)}）</span><small>${escapeHtml(entry.anchor.meaning)} · ${escapeHtml(learningLabel(entry))}</small></span><span aria-hidden="true">›</span></button>`).join("");
    $("#kanjiStageDialogHint").textContent = index > activeIndex ? "Preview this stage now; it will unlock as you progress through the journey." : "Choose any kanji to inspect its complete learning details.";
    if (!$("#kanjiStageDialog").open) $("#kanjiStageDialog").showModal();
  }

  function openMapDetail(entryId) {
    if (!entryById.has(entryId)) return;
    selectedDetailId = entryId;
    closeStageDialog();
    switchView("progress");
    setTimeout(() => $("#kanjiDetail")?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
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
    const progressCopy = progress.seen > 0
      ? `${escapeHtml(learningLabel(entry))} · ${progress.seen} graded attempt${progress.seen === 1 ? "" : "s"}${progress.introduced ? "" : " · not yet introduced in Learn"}`
      : "Not introduced or practised yet";
    $("#kanjiDetail").innerHTML = `<div class="kanji-detail-glyph" lang="ja">${entry.character}</div><div class="kanji-detail-copy"><h3>${escapeHtml(entry.meanings.join(", "))}</h3><p lang="ja"><strong>${escapeHtml(entry.anchor.word)}</strong> · ${escapeHtml(entry.anchor.reading)} · ${escapeHtml(entry.anchor.meaning)}</p><div class="kanji-reading-row">${readings.map(reading => `<span>${escapeHtml(reading)}</span>`).join("")}<span>${entry.strokes} strokes</span><span>Radical ${escapeHtml(entry.radical.character)} · ${escapeHtml(entry.radical.meaning)}</span></div><p>${progressCopy}</p>${entry.anchor.sentence ? `<p lang="ja">${highlightedExample(entry)}<br><small>${escapeHtml(entry.anchor.translation)}</small></p>` : ""}<div class="actions"><button class="ghost" id="kanjiDetailAudio" type="button">🔊 Hear anchor word</button></div></div>`;
    $("#kanjiDetailAudio").addEventListener("click", () => speak(entry.anchor.reading));
  }

  buildUI();
  renderAll();
  nextActivity();
})();

(() => {
  "use strict";

  const requestedLesson = new URLSearchParams(window.location.search).get("lesson") || "1";
  const lessonId = String(Number(requestedLesson));
  const LESSON = window.GUIDED_LESSONS?.[lessonId];
  if (!LESSON) {
    window.location.replace("./guided_lessons.html");
    return;
  }
  const STORAGE_KEY = LESSON.storageKey;
  document.title = `Lesson ${LESSON.number} · ${LESSON.title}`;
  const SPEECH_STORAGE_KEY = "kanaSprintSpeechV1";
  const VERSION = 1;
  const REVIEW_INTERVALS = [2 * 60000, 24 * 60 * 60000, 3 * 24 * 60 * 60000, 7 * 24 * 60 * 60000, 14 * 24 * 60 * 60000, 30 * 24 * 60 * 60000];
  const PRACTICE_SESSION_LENGTH = 6;
  const $ = selector => document.querySelector(selector);
  const shuffle = values => {
    const shuffled = [...values];
    for (let index = shuffled.length - 1; index > 0; index--) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
  };
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const normalize = value => String(value ?? "").toLowerCase().trim().replace(/[\s。、・,.!?！？:：'’_-]+/g, "").replace(/ō/g, "ou");
  const {
    commonMistakeGuidance: COMMON_MISTAKE_GUIDANCE,
    stages: STAGES,
    answerBreakdowns: ANSWER_BREAKDOWNS,
    guideBreakdowns: GUIDE_BREAKDOWNS,
    stageWrapups: STAGE_WRAPUPS,
    practiceFamilies: PRACTICE_FAMILIES,
    practiceFamilyIds: PRACTICE_FAMILY_IDS,
    practiceFamilyById: PRACTICE_FAMILY_BY_ID,
    practiceVariantKeysById: PRACTICE_VARIANT_KEYS_BY_ID
  } = LESSON;

  function renderLessonIdentity() {
    $("#lessonHeadline").textContent = LESSON.headline;
    $("#lessonSubtitle").textContent = LESSON.subtitle;
    $("#lessonJourneyTitle").textContent = LESSON.journeyTitle;
    const foundation = $("#lessonFoundation");
    if (!LESSON.foundation) {
      foundation?.classList.add("hidden");
      return;
    }
    $("#lessonFoundationTitle").textContent = LESSON.foundation.title;
    $("#lessonFoundationCopy").textContent = LESSON.foundation.copy;
    const link = foundation.querySelector("a");
    link.href = LESSON.foundation.href;
    link.textContent = LESSON.foundation.label;
  }

  const ALL_ACTIVITIES = STAGES.flatMap((stage, stageIndex) => stage.activities.map((activity, activityIndex) => ({ ...activity, stageIndex, activityIndex })));
  const GRADED_ACTIVITIES = ALL_ACTIVITIES.filter(activity => activity.type !== "teach");

  function defaultState() {
    return {
      version: VERSION, unlockedStage: 0, currentStage: 0, total: 0, correct: 0, streak: 0, bestStreak: 0,
      activities: {}, recent: [], recentFamilies: [], recentScenarios: [], variantHistory: {}, viewedGuides: [], profile: { name: "", home: "", role: "", field: "", year: "", age: "" }, savedAt: 0
    };
  }

  function loadState() {
    const fallback = defaultState();
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && saved.version === VERSION) return { ...fallback, ...saved, activities: { ...(saved.activities || {}) }, recentFamilies: [...(saved.recentFamilies || [])], recentScenarios: [...(saved.recentScenarios || [])], variantHistory: { ...(saved.variantHistory || {}) }, profile: { ...fallback.profile, ...(saved.profile || {}) } };
    } catch (error) {
      console.warn("Could not load guided-lesson progress.", error);
    }
    return fallback;
  }

  let state = loadState();
  state.unlockedStage = clamp(Number(state.unlockedStage) || 0, 0, STAGES.length - 1);
  const savedUnlockedStage = state.unlockedStage;
  reconcileUnlockedStages();
  state.currentStage = clamp(Number(state.currentStage) || 0, 0, state.unlockedStage);
  if (state.unlockedStage !== savedUnlockedStage) {
    state.savedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  let mode = "learn";
  let currentActivity = null;
  let currentAnswered = false;
  let currentIsRecovery = false;
  let learnRecoveryQueue = [];
  let practiceRecoveryQueue = [];
  let stageCursor = null;
  let replayingStage = false;
  let tileSelection = [];
  let tileBank = [];
  let tileBankRevealed = true;
  let currentDistractorCount = 0;
  let checkpointQueue = [];
  let checkpointIndex = 0;
  let checkpointCorrect = 0;
  let checkpointResults = [];
  let practiceIndex = 0;
  let practiceResults = [];
  let practiceSessionComplete = false;
  let speechVoices = [];
  let emptyNextMode = null;

  function activityState(activity) {
    if (!state.activities[activity.id]) state.activities[activity.id] = {
      completed: false, seen: 0, correct: 0, wrong: 0, mastery: 0, interval: -1, lastSeen: 0, dueAt: 0, lastWasCorrect: null
    };
    return state.activities[activity.id];
  }

  function saveState() {
    reconcileUnlockedStages();
    state.savedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    renderTopStats();
    renderRoadmap();
  }

  function stageComplete(stageIndex) {
    return STAGES[stageIndex].activities.every(activity => activityState(activity).completed);
  }

  function retentionState(activity) {
    if (activity.type === "teach") return "covered";
    const progress = activityState(activity);
    if (!progress.completed) return "new";
    if (progress.lastWasCorrect && progress.correct >= 3 && progress.interval >= 2 && progress.mastery >= 60) return "secure";
    return "learning";
  }

  function stageRetention(stage) {
    const graded = stage.activities.filter(activity => activity.type !== "teach");
    const secure = graded.filter(activity => retentionState(activity) === "secure").length;
    return { secure, total: graded.length };
  }

  function reconcileUnlockedStages() {
    let earnedStage = 0;
    while (earnedStage < STAGES.length - 1 && stageComplete(earnedStage)) earnedStage++;
    state.unlockedStage = Math.max(state.unlockedStage, earnedStage);
  }

  function completedGraded() {
    return GRADED_ACTIVITIES.filter(activity => activityState(activity).completed);
  }

  function masteryAverage(activities = completedGraded()) {
    if (!activities.length) return 0;
    return activities.reduce((sum, activity) => sum + activityState(activity).mastery, 0) / activities.length;
  }

  function renderTopStats() {
    const completed = ALL_ACTIVITIES.filter(activity => activityState(activity).completed).length;
    const due = completedGraded().filter(activity => activityState(activity).dueAt && activityState(activity).dueAt <= Date.now()).length;
    $("#lessonCompletion").textContent = `${Math.round(completed / ALL_ACTIVITIES.length * 100)}%`;
    $("#lessonMastery").textContent = `${Math.round(masteryAverage())}%`;
    $("#lessonStreak").textContent = state.streak;
    $("#lessonDue").textContent = due;
    const stat = $("#lessonStreakStat");
    stat.className = "stat streak-stat";
    const tier = state.streak >= 200 ? 8 : state.streak >= 150 ? 7 : state.streak >= 100 ? 6 : state.streak >= 75 ? 5 : state.streak >= 50 ? 4 : state.streak >= 25 ? 3 : state.streak >= 15 ? 2 : state.streak >= 5 ? 1 : 0;
    if (tier) stat.classList.add(`streak-tier-${tier}`);
  }

  function renderRoadmap() {
    $("#lessonStageCount").textContent = `Stage ${state.currentStage + 1} of ${STAGES.length}`;
    $("#lessonRoadmap").innerHTML = STAGES.map((stage, index) => {
      const complete = stageComplete(index);
      const retention = stageRetention(stage);
      const secure = complete && retention.secure === retention.total;
      const locked = index > state.unlockedStage;
      const current = index === state.currentStage && mode === "learn";
      const status = locked ? "Locked" : secure ? "Secure" : complete ? `Covered · ${retention.secure}/${retention.total} secure` : current ? "Now" : "Open";
      return `<button class="lesson-roadmap-step ${complete ? "covered" : ""} ${secure ? "secure" : ""} ${current ? "active" : ""}" data-stage="${index}" type="button" ${locked ? "disabled" : ""}><span class="lesson-roadmap-number">${complete ? "✓" : index + 1}</span><span class="lesson-roadmap-copy"><strong>${stage.title}</strong><span>${stage.short}</span></span><span class="lesson-roadmap-status">${status}</span></button>`;
    }).join("");
    $("#lessonRoadmap").querySelectorAll("[data-stage]").forEach(button => button.addEventListener("click", () => {
      state.currentStage = Number(button.dataset.stage);
      replayingStage = stageComplete(state.currentStage);
      stageCursor = replayingStage ? 0 : firstIncompleteIndex(state.currentStage);
      saveState();
      setMode("learn");
    }));
  }

  function clearControls() {
    ["#lessonDontKnow", "#lessonClear", "#lessonSubmit", "#lessonNext"].forEach(selector => $(selector).classList.add("hidden"));
    $("#lessonTrainer").classList.remove("awaiting-answer", "summary-state");
    $("#lessonFeedback").className = "feedback lesson-feedback";
    $("#lessonFeedback").innerHTML = "";
    currentAnswered = false;
    tileSelection = [];
    tileBank = [];
    tileBankRevealed = true;
  }

  function renderActivity(activity) {
    emptyNextMode = null;
    currentActivity = activity;
    currentIsRecovery = Boolean(activity.recoveryOf);
    clearControls();
    $("#lessonNext").innerHTML = `${mode === "practice" ? "Next review" : mode === "checkpoint" ? "Next question" : "Continue"} <kbd>Enter</kbd>`;
    const progress = activityState(activity);
    const stage = STAGES[activity.stageIndex];
    const stageCompleted = stage.activities.filter(item => activityState(item).completed).length;
    const stageProgress = mode === "learn"
      ? activity.activityIndex / stage.activities.length * 100
      : mode === "checkpoint" && checkpointQueue.length
        ? checkpointIndex / checkpointQueue.length * 100
        : mode === "practice"
          ? practiceIndex / PRACTICE_SESSION_LENGTH * 100
          : stageCompleted / stage.activities.length * 100;
    $("#lessonStageProgress").style.width = `${stageProgress}%`;
    const previousAttempts = `${progress.seen} previous ${progress.seen === 1 ? "attempt" : "attempts"}`;
    $("#lessonQuestionCount").textContent = currentIsRecovery ? "Delayed memory check" : mode === "checkpoint" ? `Question ${checkpointIndex + 1} of ${checkpointQueue.length}` : mode === "practice" ? `Review ${practiceIndex + 1} of ${PRACTICE_SESSION_LENGTH} · ${previousAttempts}` : `Activity ${activity.activityIndex + 1} of ${stage.activities.length}`;
    $("#lessonSessionTitle").textContent = stage.outcome;
    $("#lessonSessionCopy").textContent = activity.explanation || activity.instruction || "Retrieve the idea in a new form before moving on.";
    if (activity.type === "teach") renderTeach(activity);
    if (activity.type === "choice") renderChoice(activity);
    if (activity.type === "repair") renderRepair(activity);
    if (activity.type === "tiles") renderTiles(activity);
    if (activity.type === "input") renderInput(activity);
    $("#lessonTrainer").classList.toggle("awaiting-answer", ["choice", "repair", "tiles", "input"].includes(activity.type));
    refreshActivityAudioControls();
    if (hasPromptAudio(activity)) setTimeout(() => speakJapanese(activity.audioText), 120);
  }

  function activityHeading(activity) {
    const stage = STAGES[activity.stageIndex];
    const origin = (mode !== "learn" || currentIsRecovery) && stage ? `<span class="lesson-activity-origin">Stage ${activity.stageIndex + 1} of ${STAGES.length} · ${escapeHtml(stage.title)} · ${escapeHtml(activity.skill)}</span>` : "";
    return `<div class="lesson-activity-heading"><span class="lesson-activity-kicker">${activity.kicker}</span>${origin}<h2>${activity.title}</h2>${activity.instruction ? `<p>${activity.instruction}</p>` : ""}</div>`;
  }

  function renderTeach(activity) {
    const personalized = activity.id === "mission-setup" ? profileMissionCard() : "";
    $("#lessonActivity").innerHTML = activityHeading(activity) + activity.body + personalized;
    enhanceGuideExamples(activity);
    $("#lessonNext").classList.remove("hidden");
    $("#lessonKeyboardHint").textContent = "Read for meaning, listen once, then continue into retrieval practice.";
  }

  function enhanceGuideExamples(activity) {
    const guide = GUIDE_BREAKDOWNS[activity.id];
    if (!guide) return;
    const rows = [...$("#lessonActivity").querySelectorAll(".lesson-model-row")].slice(0, guide.length);
    state.viewedGuides = Array.isArray(state.viewedGuides) ? state.viewedGuides : [];
    const firstVisit = !state.viewedGuides.includes(activity.id);
    const model = rows[0]?.parentElement;
    if (model) model.insertAdjacentHTML("afterbegin", `<p class="lesson-guide-help">Open an example to see what each part means.</p>`);

    rows.forEach((row, index) => {
      const detail = guide[index];
      if (!detail) return;
      const label = row.querySelector("span")?.textContent || "Example";
      const example = row.querySelector("strong")?.textContent || "";
      const panelId = `lessonGuide-${activity.id}-${index}`;
      row.classList.add("lesson-guide-row");
      row.innerHTML = `<button class="lesson-guide-toggle" type="button" aria-expanded="false" aria-controls="${panelId}"><span class="lesson-guide-copy"><span>${escapeHtml(label)}</span><strong>${escapeHtml(example)}</strong></span><span class="lesson-guide-action">Breakdown <span class="lesson-guide-icon" aria-hidden="true"><svg viewBox="0 0 16 16" focusable="false"><path d="M3.5 6 8 10.5 12.5 6" /></svg></span></span></button><div class="lesson-guide-detail" id="${panelId}" hidden><div class="lesson-guide-meaning"><span>Natural meaning</span><strong>${escapeHtml(detail.meaning)}</strong></div><div class="lesson-breakdown-pieces">${detail.pieces.map(([piece, meaning]) => `<span class="lesson-breakdown-piece"><strong>${escapeHtml(piece)}</strong><small>${escapeHtml(meaning)}</small></span>`).join("")}</div><p><strong>Pattern:</strong> ${escapeHtml(detail.insight)}</p></div>`;
    });

    const toggles = rows.flatMap(row => [...row.querySelectorAll(".lesson-guide-toggle")]);
    const setOpen = (button, open) => {
      button.setAttribute("aria-expanded", String(open));
      button.closest(".lesson-guide-row").querySelector(".lesson-guide-detail").hidden = !open;
    };
    toggles.forEach(button => button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") !== "true";
      toggles.forEach(other => setOpen(other, false));
      setOpen(button, open);
    }));
    if (firstVisit && toggles[0]) {
      setOpen(toggles[0], true);
      state.viewedGuides.push(activity.id);
      saveState();
    }
  }

  function profileMissionCard() {
    const details = [
      state.profile.name && ["Name", state.profile.name], state.profile.home && ["Home", state.profile.home],
      state.profile.role && ["Role", state.profile.role], state.profile.field && ["Field", state.profile.field],
      state.profile.year && ["School year", state.profile.year], state.profile.age && ["Age", state.profile.age]
    ].filter(Boolean);
    if (!details.length) return `<div class="lesson-rule"><strong>Your side of the mission:</strong> answer with your real details aloud. You can save optional practice details under Progress.</div>`;
    return `<div class="lesson-model"><div class="lesson-model-row"><span>Your introduction</span><strong>はじめまして。［${escapeHtml(state.profile.name || "your name")}］です。</strong></div>${details.filter(detail => detail[0] !== "Name").map(detail => `<div class="lesson-model-row"><span>${escapeHtml(detail[0])}</span><strong>${escapeHtml(detail[1])}</strong></div>`).join("")}</div><div class="lesson-rule">Think through or say your introduction aloud before choosing Aoi’s next response. Speaking is optional and is not scored. The app keeps these details only in this browser.</div>`;
  }

  function activityAudioRole(activity) {
    if (!activity.audioText) return "none";
    if (activity.audioRole) return activity.audioRole;
    if (activity.type === "input" || (activity.type === "choice" && activity.listenOnly)) return "prompt";
    return "feedback";
  }

  function hasPromptAudio(activity) {
    return activityAudioRole(activity) === "prompt";
  }

  function promptMarkup(activity) {
    const context = activity.context ? `<div class="lesson-context">${escapeHtml(activity.context)}</div>` : "";
    const listening = hasPromptAudio(activity) ? `<div class="lesson-listen-controls"><button class="lesson-listen-button" type="button" data-listen aria-label="Replay question audio at normal speed" title="Replay question audio at normal speed">🔊<small>Normal</small></button><button class="ghost lesson-listen-slow" type="button" data-listen-slow>0.7× Slow</button></div>` : "";
    return `${context}<div class="lesson-prompt">${listening}<span class="lesson-prompt-label">Your task</span><div>${escapeHtml(activity.prompt || "Choose the best answer.")}</div></div>`;
  }

  function bindPromptAudio(activity) {
    $("#lessonActivity").querySelector("[data-listen]")?.addEventListener("click", () => speakJapanese(activity.audioText));
    $("#lessonActivity").querySelector("[data-listen-slow]")?.addEventListener("click", () => speakJapanese(activity.audioText, .68));
  }

  function renderChoice(activity) {
    const displayedOptions = shuffle(activity.options.map((option, originalIndex) => ({ option, originalIndex })));
    $("#lessonActivity").innerHTML = activityHeading(activity) + promptMarkup(activity) + `<div class="lesson-choice-grid">${displayedOptions.map(({ option, originalIndex }, displayIndex) => `<button class="lesson-choice" data-choice="${originalIndex}" data-key="${displayIndex + 1}" type="button"><span class="lesson-choice-number">${displayIndex + 1}</span><span>${escapeHtml(option)}</span></button>`).join("")}</div>`;
    bindPromptAudio(activity);
    $("#lessonActivity").querySelectorAll("[data-choice]").forEach(button => button.addEventListener("click", () => gradeAnswer(Number(button.dataset.choice) === activity.answer, Number(button.dataset.choice))));
    $("#lessonDontKnow").classList.remove("hidden");
    $("#lessonKeyboardHint").textContent = hasPromptAudio(activity) ? "Keyboard: 1–4 choose an answer. Replay the question as needed." : "Keyboard: 1–4 choose an answer. Pronunciation appears after you answer.";
  }

  function renderRepair(activity) {
    renderChoice(activity);
    $("#lessonActivity").querySelector(".lesson-choice-grid")?.classList.add("lesson-repair-grid");
    $("#lessonKeyboardHint").textContent = "Choose the corrected Japanese. The original mistake is shown in the scenario.";
  }

  function renderTiles(activity) {
    const availableDistractors = shuffle(activity.distractors || []);
    const requestedCount = mode === "checkpoint" ? 4 : mode === "practice" ? 3 : activity.learnExtras || 0;
    const distractors = availableDistractors.slice(0, requestedCount);
    currentDistractorCount = distractors.length;
    const answerTiles = activity.tokens.map((text, index) => ({ id: `${activity.id}-answer-${index}`, text }));
    const extraTiles = distractors.map((text, index) => ({ id: `${activity.id}-extra-${index}`, text }));
    tileBank = shuffle([...answerTiles, ...extraTiles]);
    const answerPositions = answerTiles.map(tile => tileBank.findIndex(candidate => candidate.id === tile.id));
    const answersRemainOrdered = answerPositions.every((position, index) => index === 0 || answerPositions[index - 1] < position);
    if (answersRemainOrdered && answerTiles.length > 1) {
      const firstPosition = answerPositions[0];
      const secondPosition = answerPositions[1];
      [tileBank[firstPosition], tileBank[secondPosition]] = [tileBank[secondPosition], tileBank[firstPosition]];
    }
    tileBankRevealed = mode === "learn";
    const extraNote = currentDistractorCount ? `<div class="lesson-tile-note"><strong>Choose only what you need.</strong> Some tiles are extras.</div>` : "";
    const oralRecall = mode === "learn" ? "" : `<div class="lesson-independent-recall" id="lessonIndependentRecall"><span>Recall first</span><p>Think it or say it aloud before revealing the tiles.</p><div class="actions"><button class="big-button" type="button" data-show-word-bank>Show scrambled tiles</button></div><small>The app scores only the sentence you build from the tiles.</small></div>`;
    $("#lessonActivity").innerHTML = activityHeading(activity) + promptMarkup(activity) + oralRecall + `<div class="lesson-tiles ${tileBankRevealed ? "" : "hidden"}" id="lessonTileBuilder">${extraNote}<div class="lesson-tile-answer" id="lessonTileAnswer"></div><div class="lesson-tile-bank" id="lessonTileBank"></div></div>`;
    if (tileBankRevealed) renderTileControls();
    $("#lessonActivity").querySelector("[data-show-word-bank]")?.addEventListener("click", revealTileBank);
    if (tileBankRevealed) {
      $("#lessonClear").classList.remove("hidden");
      $("#lessonSubmit").classList.remove("hidden");
      $("#lessonDontKnow").classList.remove("hidden");
    }
    $("#lessonKeyboardHint").textContent = mode === "checkpoint" ? "Recall the answer, then build it from scrambled tiles." : mode === "practice" ? "Recall first if you can; the tile-built sentence is what gets scored." : currentDistractorCount ? "Build from meaning. Extra tiles can remain in the bank." : "Build from meaning. Click an answer tile to return it to the bank.";
  }

  function revealTileBank() {
    tileBankRevealed = true;
    $("#lessonIndependentRecall")?.classList.add("hidden");
    $("#lessonTileBuilder")?.classList.remove("hidden");
    renderTileControls();
    $("#lessonClear").classList.remove("hidden");
    $("#lessonSubmit").classList.remove("hidden");
    $("#lessonDontKnow").classList.remove("hidden");
  }

  function renderTileControls() {
    const answer = $("#lessonTileAnswer");
    const bank = $("#lessonTileBank");
    if (!answer || !bank) return;
    answer.innerHTML = tileSelection.map((token, index) => `<button class="lesson-tile selected" data-answer-tile="${index}" type="button">${escapeHtml(token.text)}</button>`).join("");
    const selectedIds = new Set(tileSelection.map(token => token.id));
    bank.innerHTML = tileBank.filter(token => !selectedIds.has(token.id)).map(token => `<button class="lesson-tile" data-bank-tile="${token.id}" type="button">${escapeHtml(token.text)}</button>`).join("");
    answer.querySelectorAll("[data-answer-tile]").forEach(button => button.addEventListener("click", () => {
      tileSelection.splice(Number(button.dataset.answerTile), 1);
      renderTileControls();
    }));
    bank.querySelectorAll("[data-bank-tile]").forEach(button => button.addEventListener("click", () => {
      const token = tileBank.find(item => item.id === button.dataset.bankTile);
      if (token) tileSelection.push(token);
      renderTileControls();
    }));
  }

  function renderInput(activity) {
    $("#lessonActivity").innerHTML = activityHeading(activity) + promptMarkup(activity) + `<input class="lesson-answer-input" id="lessonAnswerInput" inputmode="${activity.inputMode || "text"}" autocomplete="off" spellcheck="false" placeholder="${escapeHtml(activity.placeholder || "Type your answer")}" />`;
    bindPromptAudio(activity);
    $("#lessonSubmit").classList.remove("hidden");
    $("#lessonDontKnow").classList.remove("hidden");
    $("#lessonKeyboardHint").textContent = "Type what you heard. Press Enter to check.";
    setTimeout(() => $("#lessonAnswerInput")?.focus(), 0);
  }

  function selectedAnswerText(selectedChoice) {
    if (!["choice", "repair"].includes(currentActivity?.type) || selectedChoice === null || selectedChoice === undefined) return "";
    return currentActivity.options?.[selectedChoice] || "";
  }

  function mistakeExplanation(selectedChoice, revealed) {
    if (revealed) return "You revealed the answer. Read the contrast once; the concept will return after other material.";
    if (selectedChoice === null || selectedChoice === undefined) return "Your response did not match the model. Compare the order and meaning with the answer below.";
    const selected = selectedAnswerText(selectedChoice);
    const targeted = currentActivity.mistakes?.[selectedChoice];
    return targeted || COMMON_MISTAKE_GUIDANCE[selected] || `You chose “${selected}”. Compare its meaning or conversational job with the correct answer below.`;
  }

  function showFeedback(correct, selectedChoice = null, corrected = false, revealed = false) {
    const feedback = $("#lessonFeedback");
    feedback.className = `feedback lesson-feedback show ${correct ? "good" : "bad"}`;
    const breakdown = currentActivity.breakdown || ANSWER_BREAKDOWNS[currentActivity.id] || [];
    const breakdownMarkup = breakdown.length ? `<div class="lesson-answer-breakdown"><span class="lesson-breakdown-label">Answer breakdown</span><div class="lesson-breakdown-pieces">${breakdown.map(([piece, meaning]) => `<span class="lesson-breakdown-piece"><strong>${escapeHtml(piece)}</strong><small>${escapeHtml(meaning)}</small></span>`).join("")}</div></div>` : "";
    const answerAudio = activityAudioRole(currentActivity) === "feedback" ? `<button class="ghost lesson-answer-audio" type="button" data-answer-audio>🔊 Hear answer</button>` : "";
    const diagnosis = correct ? "" : `<span class="lesson-mistake-diagnosis">${escapeHtml(mistakeExplanation(selectedChoice, revealed))}</span>`;
    const heading = corrected ? "Recovered after a delay" : correct ? "Correct" : "Build this memory";
    feedback.innerHTML = `<strong>${heading}</strong><div class="meta">${diagnosis}<span class="lesson-correction">${escapeHtml(currentActivity.correction || "Review the model")}</span>${breakdownMarkup}<span class="lesson-feedback-explanation">${escapeHtml(currentActivity.explanation || "Retrieve the idea again after some variety.")}</span>${answerAudio}</div>`;
    feedback.querySelector("[data-answer-audio]")?.addEventListener("click", () => speakJapanese(currentActivity.audioText));
    refreshActivityAudioControls();
  }

  function updateResult(activity, correct) {
    const progress = activityState(activity);
    progress.seen++;
    progress.lastSeen = Date.now();
    progress.lastWasCorrect = correct;
    progress.completed = true;
    state.total++;
    if (correct) {
      progress.correct++;
      progress.interval = Math.min(REVIEW_INTERVALS.length - 1, progress.interval + 1);
      const gain = activity.type === "choice" ? 15 : activity.type === "repair" ? 18 : activity.type === "tiles" ? 20 : 22;
      progress.mastery = Math.min(100, progress.mastery + Math.max(7, gain * (1 - progress.mastery / 140)));
      progress.dueAt = Date.now() + REVIEW_INTERVALS[progress.interval];
      state.correct++;
      state.streak++;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
    } else {
      progress.wrong++;
      progress.interval = -1;
      progress.mastery = Math.max(0, progress.mastery - 12);
      progress.dueAt = Date.now() + REVIEW_INTERVALS[0];
      state.streak = 0;
    }
    state.recent.push(activity.id);
    if (state.recent.length > 15) state.recent.shift();
    if (activity.practiceFamily) {
      state.recentFamilies.push(activity.practiceFamily);
      if (state.recentFamilies.length > 12) state.recentFamilies.shift();
      if (activity.variantKey) {
        const history = state.variantHistory[activity.practiceFamily] || [];
        history.push(activity.variantKey);
        state.variantHistory[activity.practiceFamily] = history.slice(-4);
      }
    }
    if (activity.scenarioKey) {
      state.recentScenarios.push(activity.scenarioKey);
      if (state.recentScenarios.length > 10) state.recentScenarios.shift();
    }
    saveState();
  }

  function sourceActivityFor(activity) {
    const sourceId = activity.recoveryOf || activity.id;
    return ALL_ACTIVITIES.find(candidate => candidate.id === sourceId) || activity;
  }

  function scheduleDelayedRecovery(activity) {
    if (mode === "checkpoint") return;
    const source = sourceActivityFor(activity);
    if (mode === "learn") {
      if (!learnRecoveryQueue.some(entry => entry.source.id === source.id)) learnRecoveryQueue.push({ source, remaining: 3, avoidVariantKey: activity.variantKey || "", avoidScenarioKey: activity.scenarioKey || "" });
      return;
    }
    if (mode === "practice" && !currentIsRecovery) {
      const dueIndex = Math.min(PRACTICE_SESSION_LENGTH - 1, practiceIndex + 3);
      if (!practiceRecoveryQueue.some(entry => entry.source.id === source.id)) practiceRecoveryQueue.push({ source, dueIndex, avoidVariantKey: activity.variantKey || "", avoidScenarioKey: activity.scenarioKey || "" });
    }
  }

  function gradeAnswer(correct, selectedChoice = null, revealed = false) {
    if (!currentActivity || currentAnswered || currentActivity.type === "teach") return;
    currentAnswered = true;
    $("#lessonTrainer").classList.remove("awaiting-answer");
    if (["choice", "repair"].includes(currentActivity.type)) {
      $("#lessonActivity").querySelectorAll("[data-choice]").forEach(button => {
        button.disabled = true;
        const index = Number(button.dataset.choice);
        if (index === currentActivity.answer) button.classList.add("correct");
        else if (index === selectedChoice) button.classList.add("wrong");
      });
    }
    updateResult(currentActivity, correct);
    const scoredCorrect = correct;
    const conceptId = currentActivity.recoveryOf || currentActivity.id;
    if (mode === "practice") {
      practiceResults.push({ correct: scoredCorrect, skill: currentActivity.skill, recovery: currentIsRecovery, conceptId });
    }
    if (mode === "checkpoint") checkpointResults.push({ correct: scoredCorrect, skill: currentActivity.skill });
    if (!correct) scheduleDelayedRecovery(currentActivity);
    showFeedback(correct, selectedChoice, currentIsRecovery && correct, revealed);
    ["#lessonDontKnow", "#lessonClear", "#lessonSubmit"].forEach(selector => $(selector).classList.add("hidden"));
    $("#lessonNext").classList.remove("hidden");
    if (correct && currentIsRecovery) $("#lessonKeyboardHint").textContent = "Recovered after other material. That is stronger evidence than an immediate repeat.";
    else if (!correct && mode === "checkpoint") $("#lessonKeyboardHint").textContent = "The checkpoint keeps your first attempt and sends this idea to later Practice.";
    else if (!correct) $("#lessonKeyboardHint").textContent = "Continue now. This concept will return after other material in a changed example.";
    if (mode === "checkpoint" && scoredCorrect) checkpointCorrect++;
    if (currentActivity.audioText && correct) speakJapanese(currentActivity.audioText);
  }

  function submitCurrent() {
    if (!currentActivity || currentAnswered) return;
    if (currentActivity.type === "tiles") {
      if (!tileBankRevealed) return;
      const actual = normalize(tileSelection.map(token => token.text).join(""));
      const expected = normalize(currentActivity.answer.join(""));
      gradeAnswer(actual === expected);
    } else if (currentActivity.type === "input") {
      const value = normalize($("#lessonAnswerInput").value);
      gradeAnswer(currentActivity.answers.some(answer => normalize(answer) === value));
    }
  }

  function completeTeaching() {
    if (!currentActivity || currentActivity.type !== "teach") return;
    const progress = activityState(currentActivity);
    progress.completed = true;
    progress.lastSeen = Date.now();
    saveState();
  }

  function firstIncompleteIndex(stageIndex) {
    const index = STAGES[stageIndex].activities.findIndex(activity => !activityState(activity).completed);
    return index < 0 ? STAGES[stageIndex].activities.length : index;
  }

  function renderLearn() {
    const stage = STAGES[state.currentStage];
    if (stageCursor === null) stageCursor = firstIncompleteIndex(state.currentStage);
    if (stageCursor >= stage.activities.length) {
      renderStageSummary(state.currentStage);
      return;
    }
    renderActivity({ ...stage.activities[stageCursor], stageIndex: state.currentStage, activityIndex: stageCursor });
  }

  function renderStageSummary(stageIndex) {
    clearControls();
    $("#lessonTrainer").classList.add("summary-state");
    currentActivity = null;
    const stage = STAGES[stageIndex];
    const graded = stage.activities.filter(activity => activity.type !== "teach");
    const retention = stageRetention(stage);
    const wrapup = STAGE_WRAPUPS[stageIndex];
    const average = Math.round(masteryAverage(graded));
    const correct = graded.reduce((sum, activity) => sum + activityState(activity).correct, 0);
    const attempts = graded.reduce((sum, activity) => sum + activityState(activity).seen, 0);
    $("#lessonStageProgress").style.width = "100%";
    $("#lessonQuestionCount").textContent = "Stage covered";
    const modelTurns = wrapup?.turns.map(([speaker, text]) => {
      const personalized = text.replace("［your name］", `［${state.profile.name || "your name"}］`);
      return `<div class="lesson-stage-turn"><span>${escapeHtml(speaker)}</span><strong>${escapeHtml(personalized)}</strong></div>`;
    }).join("") || "";
    const milestone = wrapup?.coreMilestone ? `<div class="lesson-core-milestone"><strong>Core conversation ready</strong><span>You can now greet, introduce yourself, ask a personal question, and acknowledge the answer. The remaining stages expand your range.</span></div>` : "";
    const challenge = wrapup ? `<div class="lesson-stage-challenge"><span>Conversation check</span><p>${escapeHtml(wrapup.challenge)}</p><small>Think it or say it aloud before revealing the model. This reflection is not scored.</small><button class="ghost" type="button" data-reveal-stage-model>Reveal model</button><div class="lesson-stage-model" hidden>${modelTurns}</div></div>` : "";
    $("#lessonActivity").innerHTML = `<div class="lesson-stage-summary"><div class="lesson-stage-summary-icon">✓</div><span class="lesson-activity-kicker">Stage covered</span><h2>${stage.title}</h2><p>${stage.outcome} Coverage opens the next stage; durable recall continues through Practice.</p>${milestone}<div class="lesson-stage-summary-stats"><div class="mini"><strong>${average}%</strong><span class="tiny">current mastery</span></div><div class="mini"><strong>${attempts ? Math.round(correct / attempts * 100) : 0}%</strong><span class="tiny">first-pass accuracy</span></div><div class="mini"><strong>${retention.secure}/${retention.total}</strong><span class="tiny">secure after delay</span></div></div>${challenge}</div>`;
    $("#lessonActivity").querySelector("[data-reveal-stage-model]")?.addEventListener("click", event => {
      const model = $("#lessonActivity").querySelector(".lesson-stage-model");
      if (!model) return;
      model.hidden = false;
      event.currentTarget.classList.add("hidden");
    });
    $("#lessonNext").textContent = stageIndex < STAGES.length - 1 ? "Open next stage" : "View lesson progress";
    $("#lessonNext").classList.remove("hidden");
    $("#lessonSessionTitle").textContent = wrapup?.coreMilestone ? "Your core conversation is ready" : "Turn this stage into conversation";
    $("#lessonSessionCopy").textContent = "Produce the conversation check before revealing its model. Practice will return weak ideas in new combinations after a delay.";
    $("#lessonKeyboardHint").textContent = "Coverage opens the next conversational job; secure status requires successful delayed recall.";
  }

  function advanceLearn() {
    const stage = STAGES[state.currentStage];
    if (currentIsRecovery) {
      currentIsRecovery = false;
      renderLearn();
      return;
    }
    if (stageCursor >= stage.activities.length) {
      if (state.currentStage < STAGES.length - 1) {
        state.unlockedStage = Math.max(state.unlockedStage, state.currentStage + 1);
        state.currentStage++;
        replayingStage = false;
        stageCursor = firstIncompleteIndex(state.currentStage);
        saveState();
        renderLearn();
      } else setMode("progress");
      return;
    }
    if (currentActivity?.type === "teach") completeTeaching();
    if (replayingStage) stageCursor++;
    else {
      const nextIncomplete = stage.activities.findIndex((activity, index) => index > stageCursor && !activityState(activity).completed);
      stageCursor = nextIncomplete < 0 ? stage.activities.length : nextIncomplete;
    }
    learnRecoveryQueue.forEach(entry => entry.remaining--);
    const dueIndex = learnRecoveryQueue.findIndex(entry => entry.remaining <= 0);
    if (dueIndex >= 0) {
      const [entry] = learnRecoveryQueue.splice(dueIndex, 1);
      renderActivity(buildRecoveryActivity(entry.source, "learn", entry.avoidVariantKey, entry.avoidScenarioKey));
      return;
    }
    renderLearn();
  }

  function practiceFamily(activity) {
    return PRACTICE_FAMILY_BY_ID[activity.id] || activity.id;
  }

  function buildPracticeVariant(activity, sourceMode = "practice", excludedVariantKey = "", excludedScenarioKey = "") {
    const family = practiceFamily(activity);
    const familyVariants = PRACTICE_FAMILIES[family] || [];
    const allowedKeys = PRACTICE_VARIANT_KEYS_BY_ID[activity.id];
    const variants = allowedKeys ? familyVariants.filter(variant => allowedKeys.includes(variant.key)) : familyVariants;
    if (!variants.length) return activity;
    const recentVariants = new Set((state.variantHistory[family] || []).slice(-3));
    const recentScenarios = new Set(state.recentScenarios.slice(-5));
    const available = variants.filter(variant => !recentVariants.has(variant.key) && variant.key !== excludedVariantKey && !recentScenarios.has(variant.scenarioKey || variant.key) && (variant.scenarioKey || variant.key) !== excludedScenarioKey);
    const changedFallback = variants.filter(variant => variant.key !== excludedVariantKey && (variant.scenarioKey || variant.key) !== excludedScenarioKey);
    const variant = shuffle(available.length ? available : changedFallback.length ? changedFallback : variants)[0];
    const variantAudioRole = variant.audioRole || (variant.type === "input" || (variant.type === "choice" && variant.listenOnly) ? "prompt" : variant.audioText ? "feedback" : "none");
    const skill = variant.skill || (variantAudioRole === "prompt" ? "Listening" : variant.type === "tiles" ? "Production" : activity.skill);
    return {
      ...activity,
      ...variant,
      id: activity.id,
      stageIndex: activity.stageIndex,
      activityIndex: activity.activityIndex,
      practiceFamily: family,
      variantKey: variant.key,
      scenarioKey: variant.scenarioKey || variant.key,
      audioRole: variantAudioRole,
      listenOnly: variantAudioRole === "prompt",
      skill,
      kicker: sourceMode === "checkpoint" ? "Checkpoint · transfer" : sourceMode === "recovery" || sourceMode === "learn" ? "Memory check · changed example" : "Practice · new example"
    };
  }

  function buildRecoveryActivity(activity, sourceMode, excludedVariantKey = "", excludedScenarioKey = "") {
    const variant = buildPracticeVariant(activity, sourceMode === "learn" ? "learn" : "recovery", excludedVariantKey, excludedScenarioKey);
    const changed = variant !== activity && (!excludedVariantKey || variant.variantKey !== excludedVariantKey) && (!excludedScenarioKey || variant.scenarioKey !== excludedScenarioKey);
    return { ...variant, recoveryOf: activity.id, kicker: changed ? "Memory check · changed example" : "Memory check · delayed recall" };
  }

  function selectPracticeActivity() {
    const pool = completedGraded();
    if (!pool.length) return null;
    const recent = new Set(state.recent.slice(-4));
    const recentFamilies = new Set(state.recentFamilies.slice(-3));
    const filtered = pool.filter(activity => !recent.has(activity.id) && !recentFamilies.has(practiceFamily(activity)));
    const candidates = filtered.length ? filtered : pool;
    const now = Date.now();
    return candidates.map(activity => {
      const progress = activityState(activity);
      let score = 100 - progress.mastery + progress.wrong * 8 + Math.random() * 18;
      if (progress.dueAt && progress.dueAt <= now) score += 35;
      if (progress.lastWasCorrect === false) score += 18;
      if (activity.type !== "choice") score += 7;
      return { activity, score };
    }).sort((a, b) => b.score - a.score)[0].activity;
  }

  function renderPractice() {
    const recoveryIndex = practiceRecoveryQueue.findIndex(entry => entry.dueIndex <= practiceIndex);
    if (recoveryIndex >= 0) {
      const [entry] = practiceRecoveryQueue.splice(recoveryIndex, 1);
      renderActivity(buildRecoveryActivity(entry.source, "practice", entry.avoidVariantKey, entry.avoidScenarioKey));
      return;
    }
    const activity = selectPracticeActivity();
    if (!activity) {
      renderEmptyMode("Practice opens after your first retrieval activity", "Start the Learn journey so the app has something meaningful to adapt.", "Start learning");
      return;
    }
    renderActivity(buildPracticeVariant(activity));
  }

  function startPracticeSession() {
    practiceIndex = 0;
    practiceResults = [];
    practiceSessionComplete = false;
    practiceRecoveryQueue.forEach(entry => { entry.dueIndex = Math.min(entry.dueIndex, 2); });
    renderPractice();
  }

  function advancePractice() {
    if (practiceSessionComplete) {
      startPracticeSession();
      return;
    }
    practiceIndex++;
    if (practiceIndex >= PRACTICE_SESSION_LENGTH) {
      renderPracticeSummary();
      return;
    }
    renderPractice();
  }

  function renderPracticeSummary() {
    clearControls();
    $("#lessonTrainer").classList.add("summary-state");
    currentActivity = null;
    practiceSessionComplete = true;
    const originalResults = practiceResults.filter(result => !result.recovery);
    const recoveryResults = practiceResults.filter(result => result.recovery);
    const firstPassCorrect = originalResults.filter(result => result.correct).length;
    const firstPassTotal = originalResults.length;
    const recoveredConcepts = new Set(recoveryResults.filter(result => result.correct).map(result => result.conceptId));
    const missedConcepts = new Set(originalResults.filter(result => !result.correct).map(result => result.conceptId));
    const unresolved = [...missedConcepts].filter(conceptId => !recoveredConcepts.has(conceptId)).length;
    const recovered = [...recoveredConcepts].filter(conceptId => missedConcepts.has(conceptId)).length;
    const firstPass = firstPassTotal ? Math.round(firstPassCorrect / firstPassTotal * 100) : 0;
    $("#lessonStageProgress").style.width = "100%";
    $("#lessonQuestionCount").textContent = "Review session complete";
    $("#lessonActivity").innerHTML = `<div class="lesson-stage-summary"><span class="lesson-activity-kicker">Six focused reviews</span><div class="lesson-checkpoint-score">${firstPass}%</div><h2>${firstPass >= 85 ? "Strong first-pass recall" : firstPass >= 65 ? "Useful retrieval completed" : recovered ? "Some memories recovered" : "Useful practice completed"}</h2><p>${firstPassCorrect} of ${firstPassTotal} new review prompts were correct before feedback. ${recovered ? recovered === 1 ? "One missed concept returned later and was recovered." : `${recovered} missed concepts returned later and were recovered.` : "Missed concepts were not repeated immediately."}</p><div class="lesson-stage-summary-stats"><div class="mini"><strong>${firstPassCorrect}/${firstPassTotal}</strong><span class="tiny">first-pass correct</span></div><div class="mini"><strong>${recovered}</strong><span class="tiny">recovered later</span></div><div class="mini"><strong>${unresolved}</strong><span class="tiny">still needs review</span></div></div></div>`;
    $("#lessonNext").textContent = "Start another 6-review session";
    $("#lessonNext").classList.remove("hidden");
    $("#lessonSessionTitle").textContent = "A useful stopping point";
    $("#lessonSessionCopy").textContent = "Six reviews are enough for one focused round. Stop here or begin another session if your attention still feels fresh.";
    $("#lessonKeyboardHint").textContent = "Short, repeated sessions usually beat one long review session.";
  }

  function startCheckpoint() {
    const pool = completedGraded();
    if (pool.length < 5) {
      renderEmptyMode("Checkpoint needs a little more material", "Complete at least five retrieval activities in Learn first.", "Continue learning");
      return;
    }
    const representatives = new Map();
    shuffle(pool).forEach(activity => {
      const family = practiceFamily(activity);
      if (!representatives.has(family)) representatives.set(family, activity);
    });
    checkpointQueue = shuffle([...representatives.values()]).slice(0, Math.min(10, representatives.size)).map(activity => buildPracticeVariant(activity, "checkpoint"));
    checkpointIndex = 0;
    checkpointCorrect = 0;
    checkpointResults = [];
    renderActivity(checkpointQueue[0]);
  }

  function advanceCheckpoint() {
    checkpointIndex++;
    if (checkpointIndex >= checkpointQueue.length) {
      renderCheckpointSummary();
      return;
    }
    renderActivity(checkpointQueue[checkpointIndex]);
  }

  function renderCheckpointSummary() {
    clearControls();
    $("#lessonTrainer").classList.add("summary-state");
    currentActivity = null;
    const percent = Math.round(checkpointCorrect / checkpointQueue.length * 100);
    const checkpointSkills = [...new Set(checkpointResults.map(result => result.skill))].map(skill => {
      const results = checkpointResults.filter(result => result.skill === skill);
      const correct = results.filter(result => result.correct).length;
      const labels = {
        Conversation: "Choose natural conversational responses",
        Grammar: "Build the key sentence patterns",
        Listening: "Understand spoken Japanese details",
        Production: "Build Japanese sentences from scrambled chunks",
        Details: "Exchange ages, numbers, and time",
        Vocabulary: "Recognise useful personal vocabulary"
      };
      return { skill, label: labels[skill] || skill, correct, total: results.length };
    });
    const outcomeMarkup = checkpointSkills.map(result => `<div class="lesson-checkpoint-outcome ${result.correct === result.total ? "ready" : "review"}"><span>${result.correct === result.total ? "✓" : "↻"}</span><div><strong>${escapeHtml(result.label)}</strong><small>${result.correct}/${result.total} first-pass correct · ${result.correct === result.total ? "ready" : "review recommended"}</small></div></div>`).join("");
    $("#lessonStageProgress").style.width = `${percent}%`;
    $("#lessonQuestionCount").textContent = "Checkpoint complete";
    $("#lessonActivity").innerHTML = `<div class="lesson-stage-summary"><span class="lesson-activity-kicker">Mixed retrieval</span><div class="lesson-checkpoint-score">${percent}%</div><h2>${percent >= 85 ? "Ready for conversation" : percent >= 65 ? "A solid foundation" : "Useful memories are forming"}</h2><p>${checkpointCorrect} of ${checkpointQueue.length} were correct before feedback. Every missed idea has been scheduled to return in Practice.</p><div class="lesson-checkpoint-outcomes">${outcomeMarkup}</div></div>`;
    $("#lessonNext").textContent = "Run another checkpoint";
    $("#lessonNext").classList.remove("hidden");
    $("#lessonSessionTitle").textContent = "Use the can-do results, not only the percentage";
    $("#lessonSessionCopy").textContent = "Ready outcomes transferred on the first attempt. Review outcomes were corrected and are already scheduled to return in Practice.";
    $("#lessonKeyboardHint").textContent = "A new checkpoint changes the question order and interleaves different skills.";
  }

  function renderEmptyMode(title, copy, buttonLabel) {
    emptyNextMode = "learn";
    clearControls();
    $("#lessonTrainer").classList.add("summary-state");
    currentActivity = null;
    $("#lessonStageProgress").style.width = "0%";
    $("#lessonQuestionCount").textContent = "Not enough material yet";
    $("#lessonActivity").innerHTML = `<div class="lesson-stage-summary"><div class="lesson-stage-summary-icon">→</div><h2>${title}</h2><p>${copy}</p></div>`;
    $("#lessonNext").textContent = buttonLabel;
    $("#lessonNext").classList.remove("hidden");
    $("#lessonSessionTitle").textContent = "Build the foundation first";
    $("#lessonSessionCopy").textContent = "The lesson only assesses material you have already encountered through guided retrieval.";
    $("#lessonKeyboardHint").textContent = "Return to Learn and complete a few more activities.";
  }

  function setMode(nextMode) {
    mode = nextMode;
    $("#lessonProgressPanel").classList.toggle("hidden", mode !== "progress");
    $("#lessonWorkspace").classList.toggle("hidden", mode === "progress");
    $("#lessonWorkspace").classList.toggle("lesson-focused-workspace", mode === "practice" || mode === "checkpoint");
    document.querySelectorAll(".lesson-mode").forEach(button => button.classList.toggle("active", button.dataset.mode === mode));
    if (mode === "progress") {
      renderProgressPanel();
      return;
    }
    $("#lessonModeLabel").textContent = mode === "learn" ? "Learn · guided retrieval" : mode === "practice" ? "Practice · adaptive review" : "Checkpoint · mixed transfer";
    if (mode === "learn") {
      if (stageCursor === null) stageCursor = firstIncompleteIndex(state.currentStage);
      renderLearn();
    }
    if (mode === "practice") startPracticeSession();
    if (mode === "checkpoint") startCheckpoint();
    renderRoadmap();
  }

  function advance() {
    if (emptyNextMode) {
      const target = emptyNextMode;
      emptyNextMode = null;
      setMode(target);
      return;
    }
    if (mode === "learn") advanceLearn();
    else if (mode === "practice") advancePractice();
    else if (mode === "checkpoint") {
      if (!checkpointQueue.length || checkpointIndex >= checkpointQueue.length) startCheckpoint();
      else advanceCheckpoint();
    } else setMode("learn");
  }

  function skillScores() {
    const skills = ["Conversation", "Grammar", "Listening", "Production", "Vocabulary", "Details"];
    return skills.map(skill => {
      const activities = GRADED_ACTIVITIES.filter(activity => activity.skill === skill && activityState(activity).completed);
      return { skill, score: Math.round(masteryAverage(activities)), count: activities.length };
    });
  }

  function readinessLabel(score) {
    if (score >= 80) return "Conversation ready";
    if (score >= 60) return "Building fluency";
    if (score >= 35) return "Foundation forming";
    return "Getting started";
  }

  function relativeDue(timestamp) {
    const difference = timestamp - Date.now();
    if (difference <= 0) return "Due now";
    const minutes = Math.ceil(difference / 60000);
    if (minutes < 60) return `In ${minutes} min`;
    const hours = Math.ceil(minutes / 60);
    if (hours < 36) return `In ${hours} hr`;
    return `In ${Math.ceil(hours / 24)} days`;
  }

  function renderProgressPanel() {
    const score = Math.round(masteryAverage());
    $("#lessonReadinessBadge").textContent = readinessLabel(score);
    $("#lessonSkillGrid").innerHTML = skillScores().map(item => `<div class="lesson-skill"><strong>${item.skill}</strong><div class="lesson-skill-meter"><span style="width:${item.score}%"></span></div><span>${item.count ? `${item.score}%` : "—"}</span></div>`).join("");
    const reviews = completedGraded().sort((a, b) => activityState(a).dueAt - activityState(b).dueAt).slice(0, 8);
    $("#lessonReviewList").innerHTML = reviews.length ? reviews.map(activity => `<div class="lesson-review-item"><div><strong>${escapeHtml(activity.title)}</strong><span>${activity.skill} · ${Math.round(activityState(activity).mastery)}% mastery</span></div><time>${relativeDue(activityState(activity).dueAt)}</time></div>`).join("") : `<div class="lesson-review-empty">Complete a few Learn activities to create a personal review schedule.</div>`;
    const profile = state.profile;
    $("#profileName").value = profile.name;
    $("#profileHome").value = profile.home;
    $("#profileRole").value = profile.role;
    $("#profileField").value = profile.field;
    $("#profileYear").value = profile.year;
    $("#profileAge").value = profile.age;
    renderSpeechStatus();
  }

  function saveProfile(event) {
    event.preventDefault();
    state.profile = {
      name: $("#profileName").value.trim(), home: $("#profileHome").value.trim(), role: $("#profileRole").value.trim(),
      field: $("#profileField").value.trim(), year: $("#profileYear").value, age: $("#profileAge").value.trim()
    };
    saveState();
    const details = [state.profile.name, state.profile.home, state.profile.role, state.profile.field].filter(Boolean);
    $("#profileStatus").textContent = details.length ? "Profile saved locally. Your details will appear in the final conversation mission." : "Profile cleared. Generic prompts will be used in conversation practice.";
  }

  function speechPreferences() {
    try {
      const saved = JSON.parse(localStorage.getItem(SPEECH_STORAGE_KEY));
      return saved && typeof saved === "object" ? saved : {};
    } catch (error) {
      return {};
    }
  }

  function japaneseVoices() {
    return speechVoices.filter(voice => String(voice.lang || "").toLowerCase().startsWith("ja"));
  }

  function voiceKey(voice) { return voice.voiceURI || voice.name; }

  function selectedJapaneseVoice() {
    const voices = japaneseVoices();
    const preferred = speechPreferences().jaVoice;
    return voices.find(voice => voiceKey(voice) === preferred || voice.name === preferred) || voices.find(voice => voice.default) || voices.find(voice => voice.localService) || voices[0] || null;
  }

  function japaneseSpeechReady() {
    return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window && japaneseVoices().length > 0;
  }

  function speakJapanese(text, rateOverride = null) {
    if (!text || !japaneseSpeechReady()) return false;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = rateOverride || Number(speechPreferences().rate) || .85;
    const voice = selectedJapaneseVoice();
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
    return true;
  }

  function refreshSpeechVoices() {
    if (!("speechSynthesis" in window)) return;
    speechVoices = window.speechSynthesis.getVoices();
    renderSpeechStatus();
    refreshActivityAudioControls();
  }

  function refreshActivityAudioControls() {
    document.querySelectorAll("[data-listen], [data-listen-slow], [data-answer-audio]").forEach(button => {
      button.disabled = !japaneseSpeechReady();
    });
  }

  function renderSpeechStatus() {
    const status = $("#lessonSpeechStatus");
    if (!status) return;
    status.classList.remove("ready", "unavailable");
    if (japaneseSpeechReady()) {
      status.classList.add("ready");
      $("#lessonSpeechTitle").textContent = "Japanese speech is ready";
      const voice = selectedJapaneseVoice();
      $("#lessonSpeechDetail").textContent = `${voice?.name || "Japanese voice"} · shared with Kana Sprint, Vocabulary, and Numbers.`;
      $("#lessonTestSpeech").disabled = false;
    } else {
      status.classList.add("unavailable");
      $("#lessonSpeechTitle").textContent = "No Japanese voice is available";
      $("#lessonSpeechDetail").textContent = "Written practice still works. Install or select a Japanese voice in Kana Mix settings to enable listening.";
      $("#lessonTestSpeech").disabled = true;
    }
  }

  document.querySelectorAll(".lesson-mode").forEach(button => button.addEventListener("click", () => setMode(button.dataset.mode)));
  $("#lessonNext").addEventListener("click", advance);
  $("#lessonSubmit").addEventListener("click", submitCurrent);
  $("#lessonClear").addEventListener("click", () => {
    tileSelection = [];
    renderTileControls();
  });
  $("#lessonDontKnow").addEventListener("click", () => gradeAnswer(false, null, true));
  $("#lessonProfileForm").addEventListener("submit", saveProfile);
  $("#lessonTestSpeech").addEventListener("click", () => speakJapanese("はじめまして。よろしくおねがいします。"));
  document.addEventListener("keydown", event => {
    if (mode === "progress") return;
    if (/^[1-4]$/.test(event.key) && ["choice", "repair"].includes(currentActivity?.type) && !currentAnswered) {
      const button = $("#lessonActivity").querySelector(`[data-key="${event.key}"]`);
      if (button) { event.preventDefault(); button.click(); }
      return;
    }
    if (event.key !== "Enter") return;
    if (event.target instanceof HTMLButtonElement || event.target instanceof HTMLSelectElement) return;
    event.preventDefault();
    if (!$("#lessonNext").classList.contains("hidden")) advance();
    else if (!$("#lessonSubmit").classList.contains("hidden")) submitCurrent();
  });

  renderLessonIdentity();
  renderTopStats();
  renderRoadmap();
  renderSpeechStatus();
  refreshSpeechVoices();
  if ("speechSynthesis" in window) window.speechSynthesis.addEventListener("voiceschanged", refreshSpeechVoices);
  setMode("learn");
})();

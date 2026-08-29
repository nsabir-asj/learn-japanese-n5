(() => {
  "use strict";

  const STORAGE_KEY = "kanaSprintVocabularyV1";
  const VERSION = 1;
  const STAGES = [
    {
      id: "greetings", name: "Greetings & courtesy", description: "The expressions that make first conversations possible.",
      words: [
        ["ohayou", "おはよう", "ohayou", "good morning"],
        ["konnichiwa", "こんにちは", "konnichiwa", "hello / good afternoon"],
        ["konbanwa", "こんばんは", "konbanwa", "good evening"],
        ["arigatou", "ありがとう", "arigatou", "thank you"],
        ["sumimasen", "すみません", "sumimasen", "excuse me / sorry"],
        ["gomen-nasai", "ごめんなさい", "gomen nasai", "I’m sorry"],
        ["onegaishimasu", "おねがいします", "onegaishimasu", "please"],
        ["hai", "はい", "hai", "yes"],
        ["iie", "いいえ", "iie", "no"],
        ["sayounara", "さようなら", "sayounara", "goodbye"],
        ["mata-ne", "またね", "mata ne", "see you"],
        ["hajimemashite", "はじめまして", "hajimemashite", "nice to meet you"]
      ]
    },
    {
      id: "conversation", name: "People & conversation", description: "Core words for introducing yourself and understanding others.",
      words: [
        ["watashi", "わたし", "watashi", "I / me"],
        ["namae", "なまえ", "namae", "name"],
        ["tomodachi", "ともだち", "tomodachi", "friend"],
        ["kazoku", "かぞく", "kazoku", "family"],
        ["hito", "ひと", "hito", "person"],
        ["sensei", "せんせい", "sensei", "teacher"],
        ["gakusei", "がくせい", "gakusei", "student"],
        ["nihongo", "にほんご", "nihongo", "Japanese language"],
        ["eigo", "えいご", "eigo", "English language"],
        ["wakarimasu", "わかります", "wakarimasu", "I understand"],
        ["wakarimasen", "わかりません", "wakarimasen", "I don’t understand"],
        ["daijoubu", "だいじょうぶ", "daijoubu", "okay / all right"]
      ]
    },
    {
      id: "daily", name: "Everyday routine", description: "High-frequency time and action words used throughout the day.",
      words: [
        ["kyou", "きょう", "kyou", "today"],
        ["ashita", "あした", "ashita", "tomorrow"],
        ["kinou", "きのう", "kinou", "yesterday"],
        ["ima", "いま", "ima", "now"],
        ["asa", "あさ", "asa", "morning"],
        ["hiru", "ひる", "hiru", "noon / daytime"],
        ["yoru", "よる", "yoru", "night"],
        ["jikan", "じかん", "jikan", "time"],
        ["iku", "いく", "iku", "to go"],
        ["kuru", "くる", "kuru", "to come"],
        ["kaeru", "かえる", "kaeru", "to return home"],
        ["shigoto", "しごと", "shigoto", "work / job"]
      ]
    },
    {
      id: "food", name: "Food & shopping", description: "Useful words for meals, cafés, stores, and simple purchases.",
      words: [
        ["mizu", "みず", "mizu", "water"],
        ["ocha", "おちゃ", "ocha", "tea"],
        ["gohan", "ごはん", "gohan", "meal / cooked rice"],
        ["asagohan", "あさごはん", "asagohan", "breakfast"],
        ["taberu", "たべる", "taberu", "to eat"],
        ["nomu", "のむ", "nomu", "to drink"],
        ["kudasai", "ください", "kudasai", "please give me"],
        ["ikura", "いくら", "ikura", "how much?"],
        ["oishii", "おいしい", "oishii", "delicious"],
        ["mise", "みせ", "mise", "shop / store"],
        ["konbini", "コンビニ", "konbini", "convenience store"],
        ["toire", "トイレ", "toire", "toilet / restroom"]
      ]
    },
    {
      id: "travel", name: "Getting around", description: "Practical location and transport words for navigating daily life.",
      words: [
        ["eki", "えき", "eki", "station"],
        ["densha", "でんしゃ", "densha", "train"],
        ["basu", "バス", "basu", "bus"],
        ["kuruma", "くるま", "kuruma", "car"],
        ["koko", "ここ", "koko", "here"],
        ["soko", "そこ", "soko", "there"],
        ["doko", "どこ", "doko", "where?"],
        ["migi", "みぎ", "migi", "right"],
        ["hidari", "ひだり", "hidari", "left"],
        ["massugu", "まっすぐ", "massugu", "straight ahead"],
        ["iriguchi", "いりぐち", "iriguchi", "entrance"],
        ["deguchi", "でぐち", "deguchi", "exit"]
      ]
    }
  ];
  const WORDS = STAGES.flatMap((stage, stageIndex) => stage.words.map((word, order) => ({
    id: word[0], jp: word[1], romaji: word[2], meaning: word[3], stageId: stage.id,
    stageName: stage.name, stageIndex, order
  })));
  const $ = selector => document.querySelector(selector);
  const choose = values => values[Math.floor(Math.random() * values.length)];
  const shuffle = values => [...values].sort(() => Math.random() - .5);
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

  function defaultState() {
    return {
      version: VERSION, total: 0, correct: 0, streak: 0, bestStreak: 0,
      questionFormat: "both", pace: 50, autoPronounce: true, items: {}, recent: [], savedAt: 0
    };
  }

  function itemState(word) {
    if (!state.items[word.id]) state.items[word.id] = {
      introduced: false, seen: 0, correct: 0, wrong: 0, mastery: 0,
      lastWasCorrect: null, lastSeen: 0, dueAt: 0
    };
    return state.items[word.id];
  }

  function loadState() {
    const fallback = defaultState();
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && saved.version === VERSION) {
        return { ...fallback, ...saved, items: { ...fallback.items, ...(saved.items || {}) } };
      }
    } catch (error) {
      console.warn("Could not load vocabulary progress.", error);
    }
    return fallback;
  }

  let state = loadState();
  if (!["written", "spoken", "both"].includes(state.questionFormat)) state.questionFormat = "both";
  state.pace = clamp(Number(state.pace) || 50, 10, 90);
  let current = null;
  let phase = "idle";
  let questionNumber = 0;
  let lastFormat = "";
  let sinceNew = 0;

  function saveState() {
    state.savedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    renderProgress();
    window.dispatchEvent(new CustomEvent("kana-sprint-progress-saved"));
  }

  function stageWords(index) { return WORDS.filter(word => word.stageIndex === index); }
  function stageAverage(index) {
    const words = stageWords(index);
    return words.reduce((sum, word) => sum + itemState(word).mastery, 0) / words.length;
  }
  function stageReady(index) {
    const words = stageWords(index);
    return words.every(word => itemState(word).introduced) && stageAverage(index) >= 35;
  }
  function unlockedStageIndex() {
    let index = 0;
    while (index < STAGES.length - 1 && stageReady(index)) index++;
    return index;
  }
  function introducedWords() { return WORDS.filter(word => itemState(word).introduced); }
  function paceLabel() {
    if (state.pace <= 20) return "Review-heavy";
    if (state.pace <= 40) return "Steady";
    if (state.pace <= 60) return "Balanced";
    if (state.pace <= 80) return "Fast";
    return "New-first";
  }

  function selectWord() {
    const stageIndex = unlockedStageIndex();
    const unseen = stageWords(stageIndex).filter(word => !itemState(word).introduced)
      .sort((a, b) => a.order - b.order);
    const introduced = introducedWords();
    const newShare = state.pace / 100;
    if (unseen.length && (!introduced.length || sinceNew >= 3 || Math.random() < newShare)) {
      sinceNew = 0;
      return { word: unseen[0], introduce: true };
    }
    sinceNew++;
    const recent = new Set(state.recent.slice(-5));
    let candidates = introduced.filter(word => !recent.has(word.id));
    if (!candidates.length) candidates = introduced;
    if (!candidates.length && unseen.length) return { word: unseen[0], introduce: true };
    const now = Date.now();
    const scored = candidates.map(word => {
      const progress = itemState(word);
      let score = (100 - progress.mastery) + progress.wrong * 7 + Math.random() * 24;
      if (progress.lastWasCorrect === false) score += 22;
      if (progress.dueAt && progress.dueAt <= now) score += 16;
      return { word, score };
    }).sort((a, b) => b.score - a.score);
    return { word: scored[0].word, introduce: false };
  }

  function japaneseSpeechReady() {
    return Boolean(window.KANA_SPRINT_SPEECH?.hasJapaneseVoice?.());
  }
  function speak(word) { return window.KANA_SPRINT_SPEECH?.speakJapanese?.(word.jp); }
  function nextQuestionFormat() {
    if (!japaneseSpeechReady() || state.questionFormat === "written") return "written";
    if (state.questionFormat === "spoken") return "spoken";
    lastFormat = lastFormat === "spoken" ? "written" : "spoken";
    return lastFormat;
  }

  function buildUI() {
    const tab = document.createElement("button");
    tab.className = "tab";
    tab.dataset.tab = "vocabulary";
    tab.textContent = "Vocabulary";
    const group = $('.tab-group[data-nav-group="words"] .tab-group-tabs');
    const anchor = group?.querySelector('.tab[data-tab="wordprogress"]');
    if (anchor) anchor.before(tab); else if (group) group.appendChild(tab); else $(".tabs").appendChild(tab);

    const panel = document.createElement("section");
    panel.className = "panel";
    panel.id = "panel-vocabulary";
    panel.innerHTML = `
      <div class="vocab-setup card">
        <div><h2>Useful vocabulary</h2><p class="muted">Starts with greetings and courtesy, then unlocks everyday conversation, routines, food, shopping, and travel.</p></div>
        <label><span>Question format</span><select id="vocabQuestionFormat"><option value="written">Written Japanese</option><option value="spoken">Spoken Japanese</option><option value="both">Both</option></select><small id="vocabFormatHint" aria-live="polite"></small></label>
        <label class="vocab-pace"><span>New-word pace: <strong id="vocabPaceName">Balanced</strong></span><input id="vocabPace" type="range" min="10" max="90" step="10"><span class="vocab-pace-labels"><span>More review</span><span>More new</span></span></label>
      </div>
      <div class="trainer vocab-trainer" data-trainer="vocabulary">
        <div class="trainer-top"><div class="mode-tag"><span class="dot"></span><span>Vocabulary • everyday meaning</span></div><div class="tiny" id="vocabCount">Question 1</div></div>
        <div class="vocab-introduction hidden" id="vocabIntroduction"></div>
        <div id="vocabQuestion">
          <div class="question">
            <div class="question-label" id="vocabQuestionLabel">Choose the English meaning</div>
            <div class="prompt word vocab-prompt" id="vocabPrompt">こんにちは</div>
            <div class="word-audio-prompt hidden" id="vocabAudioPrompt"><span class="word-audio-icon" aria-hidden="true">🔊</span><strong>Listen to the Japanese expression</strong><button class="big-button" id="vocabQuestionSpeech" type="button">Play again</button><span class="tiny">Replay as often as you need.</span></div>
          </div>
          <div class="vocab-options" id="vocabOptions"></div>
          <div class="feedback" id="vocabFeedback"></div>
        </div>
        <div class="footer-actions"><div class="actions"><button class="ghost" id="vocabDontKnow">I don’t know</button><button class="ghost hidden" id="vocabNext">Next <kbd>Enter</kbd></button></div><span class="tiny">Use <kbd>1</kbd>–<kbd>4</kbd> to choose an answer.</span></div>
      </div>
      <div class="vocab-below">
        <div class="card"><h2>Vocabulary progress</h2><div class="vocab-progress-grid"><div class="mini"><strong id="vocabTotal">0</strong><span class="tiny">answers</span></div><div class="mini"><strong id="vocabAccuracy">—</strong><span class="tiny">accuracy</span></div><div class="mini"><strong id="vocabIntroduced">0</strong><span class="tiny">introduced</span></div><div class="mini"><strong id="vocabMastered">0</strong><span class="tiny">mastered</span></div><div class="mini"><strong id="vocabWeak">0</strong><span class="tiny">weak</span></div><div class="mini"><strong id="vocabBestStreak">0</strong><span class="tiny">best streak</span></div></div></div>
        <div class="card vocab-playback"><div><h2>Pronunciation</h2><p class="muted">Voice selection is shared with Word Reading and Numbers.</p></div><div><label class="toggle-line"><input type="checkbox" id="vocabAutoPronounce"> Automatically pronounce revealed words</label><button class="ghost" id="vocabManageVoices" type="button">Manage voices</button></div></div>
      </div>
      <div class="card vocab-curriculum-card"><h2>Everyday curriculum</h2><p class="muted">Each stage opens after every word in the previous stage has been introduced and its average mastery reaches 35%.</p><div class="vocab-stages" id="vocabStages"></div></div>`;
    const panelAnchor = $("#panel-wordprogress");
    if (panelAnchor) panelAnchor.before(panel); else $(".wrap").appendChild(panel);

    const wordProgressGrid = $("#panel-wordprogress > .grid2");
    const wordProgressHeading = wordProgressGrid?.querySelector(".card h2");
    if (wordProgressHeading) wordProgressHeading.textContent = "Word reading progress";
    if (wordProgressGrid) {
      const vocabularyProgress = document.createElement("div");
      vocabularyProgress.className = "card vocab-progress-detail-card";
      vocabularyProgress.innerHTML = `<div class="vocab-progress-detail-heading"><div><h2>Vocabulary comprehension</h2><p class="muted">Meaning mastery is tracked separately from reading and shared across all three launchers.</p></div><span class="data-badge" id="vocabProgressStage">Greetings & courtesy</span></div><div class="vocab-progress-grid"><div class="mini"><strong id="vocabProgressTotal">0</strong><span class="tiny">answers</span></div><div class="mini"><strong id="vocabProgressAccuracy">—</strong><span class="tiny">accuracy</span></div><div class="mini"><strong id="vocabProgressIntroduced">0</strong><span class="tiny">introduced</span></div><div class="mini"><strong id="vocabProgressMastered">0</strong><span class="tiny">mastered</span></div><div class="mini"><strong id="vocabProgressWeak">0</strong><span class="tiny">weak</span></div><div class="mini"><strong id="vocabProgressBestStreak">0</strong><span class="tiny">best streak</span></div></div>`;
      wordProgressGrid.insertAdjacentElement("afterend", vocabularyProgress);
    }

    tab.addEventListener("click", switchToVocabulary);
    document.querySelectorAll('.tab:not([data-tab="vocabulary"])').forEach(other => other.addEventListener("click", () => panel.classList.remove("active")));
    $("#vocabQuestionFormat").value = state.questionFormat;
    $("#vocabPace").value = String(state.pace);
    $("#vocabAutoPronounce").checked = state.autoPronounce;
  }

  function updateFormatAvailability() {
    const select = $("#vocabQuestionFormat");
    const ready = japaneseSpeechReady();
    ["spoken", "both"].forEach(value => { select.querySelector(`option[value="${value}"]`).disabled = !ready; });
    if (!ready && state.questionFormat !== "written") {
      state.questionFormat = "written";
      select.value = "written";
      saveState();
    }
    $("#vocabFormatHint").textContent = ready ? "" : "Listening options require a Japanese voice in Settings & Data.";
  }

  function switchToVocabulary() {
    document.querySelectorAll(".tab").forEach(tab => tab.classList.toggle("active", tab.dataset.tab === "vocabulary"));
    document.querySelectorAll(".panel").forEach(panel => panel.classList.toggle("active", panel.id === "panel-vocabulary"));
    publishStreak();
    if (!current) nextQuestion();
  }

  function beginIntroduction(word) {
    current = word;
    phase = "introduction";
    const progress = itemState(word);
    progress.introduced = true;
    saveState();
    $("#vocabQuestion").classList.add("hidden");
    $("#vocabIntroduction").classList.remove("hidden");
    $("#vocabDontKnow").classList.add("hidden");
    $("#vocabNext").classList.add("hidden");
    $("#vocabIntroduction").innerHTML = `<span class="vocab-new-badge">New everyday expression</span><div class="vocab-intro-japanese">${word.jp}</div><strong>${word.romaji}</strong><div class="vocab-intro-meaning">${word.meaning}</div><span class="tiny">${word.stageName}</span><div class="actions"><button class="ghost" id="vocabIntroSpeech" type="button">🔊 Hear it</button><button class="big-button" id="vocabStartCheck" type="button">Practice this word</button></div>`;
    $("#vocabIntroSpeech").disabled = !japaneseSpeechReady();
    $("#vocabIntroSpeech").addEventListener("click", () => speak(word));
    $("#vocabStartCheck").addEventListener("click", () => showQuestion(word));
    if (japaneseSpeechReady()) setTimeout(() => speak(word), 100);
  }

  function makeChoices(word) {
    const sameStage = WORDS.filter(candidate => candidate.id !== word.id && candidate.stageIndex === word.stageIndex);
    const other = WORDS.filter(candidate => candidate.id !== word.id && candidate.stageIndex !== word.stageIndex);
    const distractors = shuffle(sameStage).slice(0, 3);
    while (distractors.length < 3) distractors.push(choose(other.filter(candidate => !distractors.includes(candidate))));
    return shuffle([word, ...distractors]);
  }

  function showQuestion(word) {
    current = word;
    phase = "question";
    questionNumber++;
    $("#vocabCount").textContent = `Question ${questionNumber}`;
    $("#vocabIntroduction").classList.add("hidden");
    $("#vocabQuestion").classList.remove("hidden");
    $("#vocabFeedback").className = "feedback";
    $("#vocabFeedback").innerHTML = "";
    $("#vocabNext").classList.add("hidden");
    $("#vocabDontKnow").classList.remove("hidden");
    const format = nextQuestionFormat();
    const spoken = format === "spoken";
    $("#vocabPrompt").textContent = word.jp;
    $("#vocabPrompt").classList.toggle("hidden", spoken);
    $("#vocabAudioPrompt").classList.toggle("hidden", !spoken);
    $("#vocabQuestionLabel").textContent = spoken ? "Listen and choose the English meaning" : "Choose the English meaning";
    const options = $("#vocabOptions");
    options.innerHTML = "";
    makeChoices(word).forEach((choice, index) => {
      const button = document.createElement("button");
      button.className = "vocab-choice";
      button.dataset.id = choice.id;
      button.innerHTML = `<span>${index + 1}</span><strong>${choice.meaning}</strong>`;
      button.addEventListener("click", () => answer(choice.id));
      options.appendChild(button);
    });
    if (spoken) setTimeout(() => speak(word), 100);
  }

  function applyResult(correct) {
    const progress = itemState(current);
    progress.seen++;
    progress.lastSeen = Date.now();
    progress.lastWasCorrect = correct;
    state.total++;
    if (correct) {
      progress.correct++;
      progress.mastery = Math.min(100, progress.mastery + Math.max(6, 20 * (1 - progress.mastery / 140)));
      progress.dueAt = Date.now() + (progress.mastery < 40 ? 10 : progress.mastery < 70 ? 90 : 720) * 60000;
      state.correct++;
      state.streak++;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
    } else {
      progress.wrong++;
      progress.mastery = Math.max(0, progress.mastery - 12);
      progress.dueAt = Date.now() + 60000;
      state.streak = 0;
    }
    state.recent.push(current.id);
    if (state.recent.length > 12) state.recent.shift();
    saveState();
  }

  function answer(selectedId, unknown = false) {
    if (phase !== "question" || !current) return;
    phase = "answered";
    const correct = !unknown && selectedId === current.id;
    applyResult(correct);
    [...$("#vocabOptions").children].forEach(button => {
      button.disabled = true;
      if (button.dataset.id === current.id) button.classList.add("correct");
      else if (button.dataset.id === selectedId) button.classList.add("wrong");
    });
    const feedback = $("#vocabFeedback");
    feedback.className = `feedback show ${correct ? "good" : "bad"}`;
    feedback.innerHTML = `<strong>${correct ? "Correct" : "Remember this one"}</strong><div class="meta"><span class="vocab-feedback-word">${current.jp} → ${current.romaji}</span><span>${current.meaning} • ${current.stageName}</span><button class="ghost speak-again" id="vocabReplayAnswer" type="button">🔊 Replay Japanese</button></div>`;
    $("#vocabReplayAnswer").disabled = !japaneseSpeechReady();
    $("#vocabReplayAnswer").addEventListener("click", () => speak(current));
    $("#vocabNext").classList.remove("hidden");
    $("#vocabDontKnow").classList.add("hidden");
    if (state.autoPronounce) speak(current);
    publishStreak();
  }

  function nextQuestion() {
    window.KANA_SPRINT_SPEECH?.stop?.();
    const selected = selectWord();
    if (!selected) return;
    if (selected.introduce) beginIntroduction(selected.word); else showQuestion(selected.word);
  }

  function renderProgress() {
    if (!$("#vocabTotal")) return;
    const introduced = introducedWords();
    const mastered = introduced.filter(word => itemState(word).mastery >= 72);
    const weak = introduced.filter(word => itemState(word).wrong > 0 && (itemState(word).lastWasCorrect === false || itemState(word).mastery < 40));
    $("#vocabTotal").textContent = state.total;
    $("#vocabAccuracy").textContent = state.total ? `${Math.round(state.correct / state.total * 100)}%` : "—";
    $("#vocabIntroduced").textContent = `${introduced.length} / ${WORDS.length}`;
    $("#vocabMastered").textContent = mastered.length;
    $("#vocabWeak").textContent = weak.length;
    $("#vocabBestStreak").textContent = state.bestStreak;
    $("#vocabProgressTotal").textContent = state.total;
    $("#vocabProgressAccuracy").textContent = state.total ? `${Math.round(state.correct / state.total * 100)}%` : "—";
    $("#vocabProgressIntroduced").textContent = `${introduced.length} / ${WORDS.length}`;
    $("#vocabProgressMastered").textContent = mastered.length;
    $("#vocabProgressWeak").textContent = weak.length;
    $("#vocabProgressBestStreak").textContent = state.bestStreak;
    $("#vocabPaceName").textContent = paceLabel();
    const unlocked = unlockedStageIndex();
    $("#vocabProgressStage").textContent = STAGES[unlocked].name;
    $("#vocabStages").innerHTML = STAGES.map((stage, index) => {
      const words = stageWords(index);
      const introducedCount = words.filter(word => itemState(word).introduced).length;
      const average = Math.round(stageAverage(index));
      const status = index < unlocked ? "Complete" : index === unlocked ? "Current" : "Locked";
      return `<div class="vocab-stage ${index > unlocked ? "locked" : ""}"><span class="vocab-stage-number">${index + 1}</span><div><strong>${stage.name}</strong><p>${stage.description}</p><div class="vocab-stage-meter"><span style="width:${average}%"></span></div><small>${introducedCount} / ${words.length} introduced · ${average}% average mastery</small></div><span class="vocab-stage-status">${status}</span></div>`;
    }).join("");
  }

  function publishStreak() {
    window.dispatchEvent(new CustomEvent("kana-sprint-streak-context", { detail: {
      tab: "vocabulary", label: "vocabulary streak", current: state.streak, best: state.bestStreak
    } }));
  }

  buildUI();
  window.KANA_SPRINT_SYNC_RANGE?.($("#vocabPace"));
  updateFormatAvailability();
  renderProgress();
  $("#vocabQuestionSpeech").addEventListener("click", () => { if (current) speak(current); });
  $("#vocabDontKnow").addEventListener("click", () => answer("", true));
  $("#vocabNext").addEventListener("click", nextQuestion);
  $("#vocabManageVoices").addEventListener("click", () => window.KANA_SPRINT_SPEECH?.openSettings?.());
  $("#vocabQuestionFormat").addEventListener("change", event => {
    state.questionFormat = event.target.value;
    saveState();
    current = null;
    nextQuestion();
  });
  $("#vocabPace").addEventListener("input", event => { state.pace = Number(event.target.value); renderProgress(); });
  $("#vocabPace").addEventListener("change", saveState);
  $("#vocabAutoPronounce").addEventListener("change", event => { state.autoPronounce = event.target.checked; saveState(); });
  window.addEventListener("kana-sprint-speech-voices-changed", updateFormatAvailability);
  document.addEventListener("keydown", event => {
    if (!$("#panel-vocabulary").classList.contains("active")) return;
    if (event.key === "Enter" && phase === "answered") { event.preventDefault(); nextQuestion(); return; }
    if (/^[1-4]$/.test(event.key) && phase === "question") {
      const button = $("#vocabOptions").children[Number(event.key) - 1];
      if (button) { event.preventDefault(); button.click(); }
    }
  });
})();

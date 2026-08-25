(() => {
  "use strict";

  const STORAGE_KEY = "kanaSprintNumbersV1";
  const VERSION = 1;
  const DIGITS = [
    { n: 0, r: "zero", h: "ぜろ", k: "零", also: ["rei"] },
    { n: 1, r: "ichi", h: "いち", k: "一" },
    { n: 2, r: "ni", h: "に", k: "二" },
    { n: 3, r: "san", h: "さん", k: "三" },
    { n: 4, r: "yon", h: "よん", k: "四", also: ["shi"] },
    { n: 5, r: "go", h: "ご", k: "五" },
    { n: 6, r: "roku", h: "ろく", k: "六" },
    { n: 7, r: "nana", h: "なな", k: "七", also: ["shichi"] },
    { n: 8, r: "hachi", h: "はち", k: "八" },
    { n: 9, r: "kyuu", h: "きゅう", k: "九", also: ["kyu"] },
    { n: 10, r: "juu", h: "じゅう", k: "十", also: ["ju"] }
  ];
  const KANJI = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  const CONCEPTS = [
    { id: "zero", name: "Zero", max: 10, example: 0, note: "Zero is usually read zero. Rei is also accepted." },
    ...DIGITS.slice(1, 10).map(x => ({ id: `digit-${x.n}`, name: `${x.n} • ${x.r}`, max: 10, example: x.n, note: `Learn ${x.n} as ${x.r}.` })),
    { id: "ten", name: "10 and teens", max: 19, example: 14, note: "Put juu before the final digit: juu + yon = juuyon." },
    { id: "tens", name: "Tens", max: 99, example: 42, note: "Put the tens digit before juu: yon + juu + ni = yonjuuni." },
    { id: "hundreds", name: "Hundreds", max: 999, example: 524, note: "Hyaku means hundred. One hundred is hyaku, without ichi." },
    { id: "hundred-irregular", name: "Irregular hundreds", max: 999, example: 600, note: "300 is sanbyaku, 600 is roppyaku, and 800 is happyaku." },
    { id: "thousands", name: "Thousands", max: 9999, example: 4200, note: "Sen means thousand. One thousand is sen, without ichi." },
    { id: "thousand-irregular", name: "Irregular thousands", max: 9999, example: 8000, note: "3000 is sanzen and 8000 is hassen." },
    { id: "man", name: "Ten-thousands", max: 99999, example: 24000, note: "Japanese groups large numbers by 10,000. Man means ten thousand." }
  ];
  const RANGES = [
    { value: 10, label: "0–10" },
    { value: 19, label: "0–19" },
    { value: 99, label: "0–99" },
    { value: 999, label: "0–999" },
    { value: 9999, label: "0–9,999" },
    { value: 99999, label: "0–99,999" }
  ];
  const $ = selector => document.querySelector(selector);
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const choose = values => values[Math.floor(Math.random() * values.length)];
  const normalize = value => String(value ?? "").toLowerCase().trim()
    .replace(/[\s,'’_-]+/g, "").replace(/ō/g, "ou");

  function defaultState() {
    return {
      version: VERSION,
      total: 0,
      correct: 0,
      streak: 0,
      bestStreak: 0,
      range: 10,
      direction: "reading",
      pace: 50,
      speechAutoPlay: true,
      concepts: Object.fromEntries(CONCEPTS.map(concept => [concept.id, {
        seen: 0, correct: 0, mastery: 0, mistakes: 0, last: 0
      }])),
      recent: [],
      savedAt: 0
    };
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && saved.version === VERSION) {
        const fallback = defaultState();
        return { ...fallback, ...saved, concepts: { ...fallback.concepts, ...saved.concepts } };
      }
    } catch (error) {
      console.warn("Could not load number progress.", error);
    }
    return defaultState();
  }

  let state = loadState();
  let current = null;
  let phase = "question";
  let pendingIntroduction = null;
  let questionNumber = 0;
  let rescueFailures = 0;
  let typoRetried = false;

  function saveState() {
    state.savedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    renderProgress();
    window.dispatchEvent(new CustomEvent("kana-sprint-progress-saved"));
  }

  function romajiDigit(number) { return DIGITS[number].r; }
  function hiraganaDigit(number) { return DIGITS[number].h; }

  function underHundred(number, format) {
    if (number <= 10) return format === "romaji" ? romajiDigit(number) : hiraganaDigit(number);
    const tens = Math.floor(number / 10);
    const ones = number % 10;
    const ten = format === "romaji" ? "juu" : "じゅう";
    const tensDigit = tens > 1 ? (format === "romaji" ? romajiDigit(tens) : hiraganaDigit(tens)) : "";
    const onesDigit = ones ? (format === "romaji" ? romajiDigit(ones) : hiraganaDigit(ones)) : "";
    return `${tensDigit}${ten}${onesDigit}`;
  }

  function reading(number, format = "romaji") {
    if (number < 100) return underHundred(number, format);
    const parts = [];
    const push = (romaji, hiragana) => parts.push(format === "romaji" ? romaji : hiragana);
    const tenThousands = Math.floor(number / 10000);
    number %= 10000;
    if (tenThousands) push(`${reading(tenThousands)}man`, `${reading(tenThousands, "hiragana")}まん`);
    const thousands = Math.floor(number / 1000);
    number %= 1000;
    if (thousands === 3) push("sanzen", "さんぜん");
    else if (thousands === 8) push("hassen", "はっせん");
    else if (thousands) push(`${thousands > 1 ? romajiDigit(thousands) : ""}sen`, `${thousands > 1 ? hiraganaDigit(thousands) : ""}せん`);
    const hundreds = Math.floor(number / 100);
    number %= 100;
    if (hundreds === 3) push("sanbyaku", "さんびゃく");
    else if (hundreds === 6) push("roppyaku", "ろっぴゃく");
    else if (hundreds === 8) push("happyaku", "はっぴゃく");
    else if (hundreds) push(`${hundreds > 1 ? romajiDigit(hundreds) : ""}hyaku`, `${hundreds > 1 ? hiraganaDigit(hundreds) : ""}ひゃく`);
    if (number) parts.push(underHundred(number, format));
    return parts.join("");
  }

  function kanji(number) {
    if (number === 0) return KANJI[0];
    let result = "";
    for (const [unit, symbol] of [[10000, "万"], [1000, "千"], [100, "百"], [10, "十"]]) {
      const digit = Math.floor(number / unit);
      if (!digit) continue;
      if (digit > 1) result += KANJI[digit];
      result += symbol;
      number %= unit;
    }
    if (number) result += KANJI[number];
    return result;
  }

  function breakdown(number) {
    if (number <= 10) return `${kanji(number)} (${reading(number)})`;
    const parts = [];
    let remainder = number;
    for (const unit of [10000, 1000, 100, 10]) {
      const value = Math.floor(remainder / unit) * unit;
      if (!value) continue;
      parts.push(`${kanji(value)} (${reading(value)})`);
      remainder %= unit;
    }
    if (remainder) parts.push(`${kanji(remainder)} (${reading(remainder)})`);
    return parts.join(" + ");
  }

  function conceptsFor(number) {
    const ids = new Set();
    if (number <= 9) ids.add(number === 0 ? "zero" : `digit-${number}`);
    String(number).split("").forEach(digit => { if (digit !== "0") ids.add(`digit-${digit}`); });
    if (number >= 11 && number <= 19) ids.add("ten");
    if (Math.floor(number % 100 / 10) > 0) ids.add("tens");
    if (Math.floor(number % 1000 / 100) > 0) ids.add("hundreds");
    if ([3, 6, 8].includes(Math.floor(number % 1000 / 100))) ids.add("hundred-irregular");
    if (Math.floor(number % 10000 / 1000) > 0) ids.add("thousands");
    if ([3, 8].includes(Math.floor(number % 10000 / 1000))) ids.add("thousand-irregular");
    if (number >= 10000) ids.add("man");
    return [...ids].filter(id => state.concepts[id]);
  }

  function availableConcepts() { return CONCEPTS.filter(concept => concept.max <= state.range); }

  function chooseConcept() {
    const available = availableConcepts();
    const unseen = available.filter(concept => !state.concepts[concept.id].seen);
    if (unseen.length && Math.random() < clamp(state.pace / 100, .1, .9)) {
      return unseen.sort((a, b) => a.max - b.max)[0];
    }
    return [...available].sort((a, b) => {
      const left = state.concepts[a.id];
      const right = state.concepts[b.id];
      const scoreA = 100 - left.mastery + left.mistakes * 8 + (!left.seen ? 50 : 0) + Math.random() * 18;
      const scoreB = 100 - right.mastery + right.mistakes * 8 + (!right.seen ? 50 : 0) + Math.random() * 18;
      return scoreB - scoreA;
    })[0];
  }

  function numberForConcept(concept) {
    const recent = new Set(state.recent.slice(-8));
    let number = concept.example;
    for (let attempt = 0; attempt < 30; attempt++) {
      if (concept.id === "zero") number = 0;
      else if (concept.id.startsWith("digit-")) {
        const digit = Number(concept.id.slice(6));
        number = state.range <= 10 ? digit : Math.floor(Math.random() * Math.max(1, Math.floor(state.range / 10))) * 10 + digit;
        if (number > state.range) number = digit;
      } else if (concept.id === "ten") number = 11 + Math.floor(Math.random() * 9);
      else if (concept.id === "tens") number = 20 + Math.floor(Math.random() * Math.max(1, Math.min(80, state.range - 19)));
      else if (concept.id === "hundreds") number = 100 + Math.floor(Math.random() * Math.max(1, Math.min(899, state.range - 99)));
      else if (concept.id === "hundred-irregular") number = choose([3, 6, 8]) * 100 + Math.floor(Math.random() * 100);
      else if (concept.id === "thousands") number = 1000 + Math.floor(Math.random() * Math.max(1, Math.min(8999, state.range - 999)));
      else if (concept.id === "thousand-irregular") number = choose([3, 8]) * 1000 + Math.floor(Math.random() * 1000);
      else number = 10000 + Math.floor(Math.random() * Math.max(1, state.range - 9999));
      number = clamp(number, 0, state.range);
      if (!recent.has(number)) break;
    }
    return number;
  }

  function questionDirection() {
    const audioReady = japaneseSpeechReady();
    if (state.direction === "mixed") return choose(["reading", "digits"]);
    if (state.direction === "all") return choose(audioReady ? ["reading", "digits", "audio"] : ["reading", "digits"]);
    if (state.direction === "audio" && !audioReady) return choose(["reading", "digits"]);
    return state.direction;
  }

  function makeQuestion() {
    const concept = chooseConcept();
    const number = numberForConcept(concept);
    return {
      number,
      concept,
      direction: questionDirection(),
      romaji: reading(number),
      hiragana: reading(number, "hiragana"),
      kanji: kanji(number),
      concepts: conceptsFor(number)
    };
  }

  function expectedAnswers(question) {
    if (question.direction !== "reading") return [String(question.number), question.number.toLocaleString("en-US")];
    const answers = [question.romaji];
    if (question.number <= 10 && DIGITS[question.number].also) answers.push(...DIGITS[question.number].also);
    return answers;
  }

  function isCorrect(value, question) {
    const normalized = normalize(value);
    return expectedAnswers(question).some(answer => normalize(answer) === normalized);
  }

  function editDistance(a, b) {
    a = normalize(a);
    b = normalize(b);
    const table = Array.from({ length: a.length + 1 }, (_, index) => [index]);
    for (let j = 1; j <= b.length; j++) table[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        table[i][j] = Math.min(
          table[i - 1][j] + 1,
          table[i][j - 1] + 1,
          table[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
      }
    }
    return table[a.length][b.length];
  }

  function likelyTypo(value, question) {
    if (question.direction !== "reading" || typoRetried) return false;
    const typed = normalize(value);
    const answer = normalize(question.romaji);
    if (!typed) return false;
    const knownBasicReading = DIGITS.some(digit => normalize(digit.r) === typed || (digit.also || []).some(item => normalize(item) === typed));
    if (knownBasicReading) return false;
    const adjacentSwap = typed.length === answer.length && [...typed].some((char, index) =>
      index + 1 < typed.length && char === answer[index + 1] && typed[index + 1] === answer[index]
    );
    return editDistance(typed, answer) <= 1 || adjacentSwap;
  }

  function buildUI() {
    const tab = document.createElement("button");
    tab.className = "tab";
    tab.dataset.tab = "numbers";
    tab.textContent = "Numbers";
    const tabAnchor = $('.tab[data-tab="kanaprogress"]');
    if (tabAnchor) tabAnchor.before(tab);
    else $('.tabs').appendChild(tab);

    const panel = document.createElement("section");
    panel.className = "panel";
    panel.id = "panel-numbers";
    panel.innerHTML = `
      <div class="trainer" data-trainer="numbers">
        <div class="trainer-top"><div class="mode-tag"><span class="dot"></span><span>Numbers • adaptive patterns</span></div><div class="tiny" id="numberCount">Question 1</div></div>
        <div id="numberIntro" class="number-intro number-hidden"></div>
        <div id="numberQuestion">
          <div class="question"><div class="question-label" id="numberQuestionLabel">Type the Japanese reading in romaji</div><div class="prompt number-prompt" id="numberPrompt">7</div><div class="number-audio-prompt number-hidden" id="numberAudioPrompt"><span class="number-audio-icon" aria-hidden="true">🔊</span><strong>Listen to the Japanese number</strong><button class="big-button" id="numberQuestionSpeech" type="button">Play number again</button><span class="tiny">Replay as often as you need. Replays do not reduce mastery.</span></div></div>
          <div class="typing"><input id="numberInput" class="answer-input" autocomplete="off" autocapitalize="off" spellcheck="false" inputmode="text" placeholder="Type the answer and press Enter"><div class="typing-hint">A likely keyboard typo gets one clean retry. A real mistake opens rescue choices.</div></div>
          <div class="feedback" id="numberFeedback"></div>
          <div class="rescue-wrap" id="numberRescue"><div class="rescue-title">Choose the correct answer</div><div class="number-rescue-options" id="numberOptions"></div></div>
        </div>
        <div class="footer-actions"><div class="number-actions"><button class="ghost" id="numberDontKnow">I don't know</button><button class="ghost number-hidden" id="numberNext">Next <kbd>Enter</kbd></button></div><span class="tiny">Progress is shared between Hiragana Sprint and Kana Mix.</span></div>
      </div>
      <div class="number-layout">
        <div class="card">
          <h2>Practice setup</h2>
          <p class="muted">Adjust the session when you need to. New patterns are explained before testing, and weak patterns return more often.</p>
          <div class="number-controls">
            <label><span class="tiny">Practice range</span><select id="numberRange">${RANGES.map(range => `<option value="${range.value}">${range.label}</option>`).join("")}</select></label>
            <label><span class="tiny">Question direction</span><select id="numberDirection"><option value="reading">Digits → Japanese reading</option><option value="digits">Japanese reading → digits</option><option value="audio">Spoken Japanese → digits</option><option value="mixed">Digits ↔ Japanese reading</option><option value="all">All directions</option></select><span class="number-direction-hint tiny" id="numberDirectionHint"></span></label>
            <label><span class="tiny">New-pattern pace: <strong id="numberPaceName"></strong></span><input id="numberPace" type="range" min="10" max="90" step="10"><span class="number-pace-labels"><span>More review</span><span>More new</span></span></label>
          </div>
          <div class="number-playback-settings"><label class="toggle-line"><input type="checkbox" id="numberSpeechAuto"> Automatically pronounce revealed readings</label><button class="ghost" id="numberManageVoices" type="button">Manage voices</button></div>
        </div>
        <div class="card">
          <h2>Number progress</h2>
          <div class="number-progress-grid">
            <div class="mini"><strong id="numberTotal">0</strong><span class="tiny">answers</span></div>
            <div class="mini"><strong id="numberAccuracy">—</strong><span class="tiny">accuracy</span></div>
            <div class="mini"><strong id="numberMastered">0</strong><span class="tiny">patterns mastered</span></div>
            <div class="mini"><strong id="numberBestStreak">0</strong><span class="tiny">best streak</span></div>
          </div>
        </div>
      </div>
      <div class="card" style="margin-top:14px"><h2>Pattern mastery</h2><div class="number-concepts" id="numberConcepts"></div></div>`;
    const panelAnchor = $("#panel-kanaprogress");
    if (panelAnchor) panelAnchor.before(panel);
    else $(".wrap").appendChild(panel);
    $("#numberDataTools").classList.remove("hidden");
    $("#numberReset").classList.remove("hidden");
    tab.addEventListener("click", switchToNumbers);
    document.querySelectorAll('.tab:not([data-tab="numbers"])').forEach(other => {
      other.addEventListener("click", () => panel.classList.remove("active"));
    });
    $("#numberRange").value = state.range;
    $("#numberDirection").value = state.direction;
    $("#numberPace").value = state.pace;
    $("#numberSpeechAuto").checked = state.speechAutoPlay;
    updateDirectionAvailability();
  }

  function japaneseSpeechReady() {
    const speech = window.KANA_SPRINT_SPEECH;
    return Boolean(speech?.hasJapaneseVoice ? speech.hasJapaneseVoice() : speech?.isSupported());
  }

  function updateDirectionAvailability() {
    const select = $("#numberDirection");
    if (!select) return;
    const ready = japaneseSpeechReady();
    ["audio", "all"].forEach(value => { select.querySelector(`option[value="${value}"]`).disabled = !ready; });
    const audioSelected = state.direction === "audio" || state.direction === "all";
    $("#numberDirectionHint").textContent = state.direction === "mixed"
      ? "Alternates between digits-first and reading-first questions."
      : ready
        ? (state.direction === "all" ? "Questions rotate through all three directions." : state.direction === "audio" ? "The spoken reading is the question; no Japanese text is shown." : "")
        : (audioSelected ? "No Japanese voice is available, so questions temporarily use the silent mix." : "Listening modes require a Japanese voice in Settings & Data.");
  }

  function switchToNumbers() {
    document.querySelectorAll(".tab").forEach(tab => tab.classList.toggle("active", tab.dataset.tab === "numbers"));
    document.querySelectorAll(".panel").forEach(panel => panel.classList.toggle("active", panel.id === "panel-numbers"));
    publishStreakContext();
    if (!current && !pendingIntroduction) nextQuestion();
    setTimeout(() => $("#numberInput")?.focus(), 0);
  }

  function paceName() {
    if (state.pace <= 20) return "Review-heavy";
    if (state.pace <= 40) return "Steady";
    if (state.pace <= 60) return "Balanced";
    if (state.pace <= 80) return "Fast";
    return "New-first";
  }

  function renderProgress() {
    if (!$("#numberTotal")) return;
    $("#numberTotal").textContent = state.total;
    $("#numberAccuracy").textContent = state.total ? `${Math.round(state.correct / state.total * 100)}%` : "—";
    $("#numberBestStreak").textContent = state.bestStreak;
    $("#numberMastered").textContent = availableConcepts().filter(concept => state.concepts[concept.id].mastery >= 72).length;
    $("#numberPaceName").textContent = paceName();
    $("#numberSaveStatus").textContent = state.savedAt ? `Auto-saved ${new Date(state.savedAt).toLocaleString()}` : "Number progress auto-saves in this browser.";
    $("#numberConcepts").innerHTML = availableConcepts().map(concept => {
      const progress = state.concepts[concept.id];
      return `<div class="number-concept"><strong>${concept.name}</strong><div class="number-concept-meter"><span style="width:${progress.mastery}%"></span></div><span class="tiny">${Math.round(progress.mastery)}% · ${progress.seen} tries</span></div>`;
    }).join("");
    if ($("#panel-numbers")?.classList.contains("active")) publishStreakContext();
  }

  function publishStreakContext() {
    window.dispatchEvent(new CustomEvent("kana-sprint-streak-context", { detail: { current: state.streak, best: state.bestStreak } }));
  }

  function setFeedback(html, tone = "") {
    const feedback = $("#numberFeedback");
    feedback.className = `feedback show ${tone}`.trim();
    feedback.innerHTML = html;
  }

  function clearFeedback() {
    const feedback = $("#numberFeedback");
    feedback.className = "feedback";
    feedback.innerHTML = "";
  }

  function nextQuestion() {
    if (!window.KANA_SPRINT_SPEECH?.getPreferences().continueOnAdvance) window.KANA_SPRINT_SPEECH?.stop();
    current = makeQuestion();
    questionNumber++;
    rescueFailures = 0;
    typoRetried = false;
    if (!state.concepts[current.concept.id].seen) {
      pendingIntroduction = current.concept;
      showIntroduction(current.concept);
    } else {
      showQuestion();
    }
  }

  function showIntroduction(concept) {
    phase = "intro";
    $("#numberQuestion").classList.add("number-hidden");
    $("#numberIntro").classList.remove("number-hidden");
    const example = concept.example;
    const exampleReading = reading(example, "hiragana");
    $("#numberIntro").innerHTML = `<div class="question-label">New number pattern</div><h2>${concept.name}</h2><p>${concept.note}</p><div class="number-intro-example">${example.toLocaleString()} = ${exampleReading}</div><div><strong>${reading(example)}</strong> · ${kanji(example)}</div><div class="number-actions number-intro-actions"><button class="big-button" id="numberStartPattern">Practice this pattern <kbd>Enter</kbd></button><button class="ghost" id="numberIntroSpeech" type="button">🔊 Listen to example</button></div>`;
    $("#numberStartPattern").addEventListener("click", beginAfterIntroduction);
    $("#numberIntroSpeech").disabled = !japaneseSpeechReady();
    $("#numberIntroSpeech").addEventListener("click", () => speakJapanese(exampleReading));
    $("#numberDontKnow").classList.add("number-hidden");
    $("#numberNext").classList.add("number-hidden");
  }

  function beginAfterIntroduction() {
    pendingIntroduction = null;
    showQuestion();
  }

  function showQuestion() {
    phase = "question";
    $("#numberIntro").classList.add("number-hidden");
    $("#numberQuestion").classList.remove("number-hidden");
    $("#numberRescue").classList.remove("show");
    clearFeedback();
    const asksForReading = current.direction === "reading";
    const asksFromAudio = current.direction === "audio";
    $("#numberQuestionLabel").textContent = asksForReading ? "Type the Japanese reading in romaji" : asksFromAudio ? "Listen and type the number using digits" : "Type this number using digits";
    $("#numberPrompt").textContent = asksForReading ? current.number.toLocaleString() : current.hiragana;
    $("#numberPrompt").classList.toggle("reading", !asksForReading);
    $("#numberPrompt").classList.toggle("number-hidden", asksFromAudio);
    $("#numberAudioPrompt").classList.toggle("number-hidden", !asksFromAudio);
    const input = $("#numberInput");
    input.value = "";
    input.disabled = false;
    input.inputMode = asksForReading ? "text" : "numeric";
    input.placeholder = asksForReading ? "Type the reading and press Enter" : "Type the digits and press Enter";
    $("#numberDontKnow").classList.remove("number-hidden");
    $("#numberNext").classList.add("number-hidden");
    $("#numberCount").textContent = `Question ${questionNumber}`;
    if (asksFromAudio) setTimeout(() => speakJapanese(current.hiragana), 100);
    setTimeout(() => input.focus(), 0);
  }

  function updateMastery(correct) {
    current.concepts.forEach(id => {
      const concept = state.concepts[id];
      concept.seen++;
      concept.last = Date.now();
      if (correct) {
        concept.correct++;
        concept.mastery = clamp(concept.mastery + (concept.seen <= 2 ? 18 : 10), 0, 100);
      } else {
        concept.mistakes++;
        concept.mastery = clamp(concept.mastery - 14, 0, 100);
      }
    });
    state.total++;
    if (correct) {
      state.correct++;
      state.streak++;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
    } else {
      state.streak = 0;
    }
    state.recent.push(current.number);
    state.recent = state.recent.slice(-30);
    saveState();
  }

  function submitAnswer() {
    if (phase === "intro") { beginAfterIntroduction(); return; }
    if (phase === "answer") { nextQuestion(); return; }
    if (phase === "rescue") return;
    const input = $("#numberInput");
    if (!input.value.trim()) return;
    if (isCorrect(input.value, current)) {
      updateMastery(true);
      showAnswer(true);
      return;
    }
    if (likelyTypo(input.value, current)) {
      typoRetried = true;
      input.value = "";
      setFeedback("That looks like a keyboard typo. Try the same question once more; no score was recorded.", "hint");
      input.focus();
      return;
    }
    updateMastery(false);
    showRescue();
  }

  function showAnswer(wasCorrect) {
    phase = "answer";
    $("#numberInput").disabled = true;
    $("#numberDontKnow").classList.add("number-hidden");
    $("#numberNext").classList.remove("number-hidden");
    $("#numberRescue").classList.remove("show");
    setFeedback(`<div class="number-breakdown"><div class="number-breakdown-main"><strong>${wasCorrect ? "Correct" : "Answer"}: ${current.number.toLocaleString()}</strong><span>${current.kanji}</span><span>${current.hiragana}</span><span>${current.romaji}</span></div><div class="number-breakdown-parts">${breakdown(current.number)}</div><button class="ghost speak-again" id="numberReplaySpeech" type="button">🔊 Replay reading</button></div>`, wasCorrect ? "good" : "hint");
    $("#numberReplaySpeech").disabled = !japaneseSpeechReady();
    $("#numberReplaySpeech").addEventListener("click", () => speakJapanese(current.hiragana));
    if (state.speechAutoPlay) speakJapanese(current.hiragana);
    $("#numberNext").focus();
  }

  function distractors() {
    const correct = current.direction === "reading" ? current.romaji : String(current.number);
    const results = new Set([correct]);
    let distance = 1;
    while (results.size < 4) {
      const alternate = clamp(current.number + choose([-distance, distance, -10, 10, -100, 100]), 0, state.range);
      results.add(current.direction === "reading" ? reading(alternate) : String(alternate));
      distance++;
    }
    return [...results].sort(() => Math.random() - .5);
  }

  function showRescue() {
    phase = "rescue";
    $("#numberInput").disabled = true;
    $("#numberRescue").classList.add("show");
    $("#numberDontKnow").classList.add("number-hidden");
    setFeedback("Not quite. Choose the correct answer to reinforce the pattern.", "bad");
    $("#numberOptions").innerHTML = distractors().map((answer, index) => `<button class="choice" data-answer="${answer}"><span class="num">${index + 1}</span>${answer}</button>`).join("");
    $("#numberOptions").querySelectorAll("button").forEach(button => {
      button.addEventListener("click", () => rescueAnswer(button.dataset.answer, button));
    });
  }

  function rescueAnswer(value, button) {
    if (isCorrect(value, current)) {
      button.classList.add("correct");
      showAnswer(false);
      return;
    }
    rescueFailures++;
    button.classList.add("wrong");
    button.disabled = true;
    setFeedback(`Try another choice.${rescueFailures >= 2 ? `<div class="callout">Hint: ${current.concept.note}</div>` : ""}`, "bad");
  }

  function speakJapanese(text) {
    window.KANA_SPRINT_SPEECH?.speakJapanese(text);
  }

  function exportProgress() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `kana-number-progress-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 500);
  }

  function importProgress(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        if (!imported || imported.version !== VERSION || !imported.concepts) throw new Error("Invalid file");
        const fallback = defaultState();
        state = { ...fallback, ...imported, concepts: { ...fallback.concepts, ...imported.concepts } };
        saveState();
        $("#numberRange").value = state.range;
        $("#numberDirection").value = state.direction;
        updateDirectionAvailability();
        $("#numberPace").value = state.pace;
        current = null;
        nextQuestion();
      } catch (error) {
        alert("That is not a valid Kana Sprint number-progress file.");
      }
    };
    reader.readAsText(file);
  }

  function wireEvents() {
    $("#numberInput").addEventListener("keydown", event => {
      if (event.key === "Enter") { event.preventDefault(); event.stopPropagation(); submitAnswer(); }
    });
    document.addEventListener("keydown", event => {
      if (!$("#panel-numbers").classList.contains("active")) return;
      if (event.key === "Enter" && phase === "intro") {
        event.preventDefault();
        beginAfterIntroduction();
      } else if (phase === "rescue" && /^[1-4]$/.test(event.key)) {
        event.preventDefault();
        $("#numberOptions").querySelectorAll("button")[Number(event.key) - 1]?.click();
      } else if (event.key === "Enter" && phase === "answer") {
        event.preventDefault();
        nextQuestion();
      }
    });
    $("#numberDontKnow").addEventListener("click", () => { updateMastery(false); showRescue(); });
    $("#numberNext").addEventListener("click", nextQuestion);
    $("#numberRange").addEventListener("change", event => { state.range = Number(event.target.value); saveState(); current = null; nextQuestion(); });
    $("#numberDirection").addEventListener("change", event => { state.direction = event.target.value; updateDirectionAvailability(); saveState(); current = null; nextQuestion(); });
    $("#numberPace").addEventListener("input", event => { state.pace = Number(event.target.value); saveState(); });
    $("#numberSpeechAuto").addEventListener("change", event => { state.speechAutoPlay = event.target.checked; saveState(); });
    $("#numberManageVoices").addEventListener("click", () => window.KANA_SPRINT_SPEECH?.openSettings());
    $("#numberQuestionSpeech").addEventListener("click", () => { if (current?.direction === "audio" && phase === "question") speakJapanese(current.hiragana); });
    window.addEventListener("kana-sprint-speech-voices-changed", updateDirectionAvailability);
    $("#numberExport").addEventListener("click", exportProgress);
    $("#numberImport").addEventListener("click", () => $("#numberImportFile").click());
    $("#numberImportFile").addEventListener("change", event => {
      if (event.target.files[0]) importProgress(event.target.files[0]);
      event.target.value = "";
    });
    $("#numberReset").addEventListener("click", () => {
      if (!confirm("Reset only number-learning progress? Kana and word progress will stay unchanged.")) return;
      localStorage.removeItem(STORAGE_KEY);
      state = defaultState();
      $("#numberRange").value = state.range;
      $("#numberDirection").value = state.direction;
      updateDirectionAvailability();
      $("#numberPace").value = state.pace;
      current = null;
      saveState();
      nextQuestion();
    });
  }

  buildUI();
  wireEvents();
  renderProgress();
  window.KANA_SPRINT_SYNC_RANGE?.($("#numberPace"));
})();

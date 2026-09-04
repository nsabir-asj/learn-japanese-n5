(() => {
  "use strict";

  const STORAGE_KEY = "kanaSprintVocabularyV1";
  const VERSION = 1;
  const STAGES = [
    {
      id: "lesson1-greetings", name: "Lesson 1 · Greetings & courtesy", description: "Complete social expressions for meeting, leaving, returning, and sharing a meal.",
      words: [
        ["ohayou", "おはよう", "ohayou", "good morning (casual)"],
        ["ohayou-gozaimasu", "おはようございます", "ohayou gozaimasu", "good morning (polite)"],
        ["konnichiwa", "こんにちは", "konnichiwa", "hello / good afternoon"],
        ["konbanwa", "こんばんは", "konbanwa", "good evening"],
        ["sayounara", "さようなら", "sayounara", "goodbye"],
        ["oyasumi-nasai", "おやすみなさい", "oyasumi nasai", "good night"],
        ["arigatou", "ありがとう", "arigatou", "thank you (casual)"],
        ["arigatou-gozaimasu", "ありがとうございます", "arigatou gozaimasu", "thank you (polite)"],
        ["sumimasen", "すみません", "sumimasen", "excuse me / sorry"],
        ["ittekimasu", "いってきます", "ittekimasu", "I’m leaving and will return"],
        ["itterasshai", "いってらっしゃい", "itterasshai", "go and come back safely"],
        ["tadaima", "ただいま", "tadaima", "I’m home"],
        ["okaeri-nasai", "おかえりなさい", "okaeri nasai", "welcome home"],
        ["itadakimasu", "いただきます", "itadakimasu", "said gratefully before eating"],
        ["gochisousama-deshita", "ごちそうさまでした", "gochisousama deshita", "thank you for the meal"],
        ["hajimemashite", "はじめまして", "hajimemashite", "nice to meet you"],
        ["yoroshiku-onegaishimasu", "よろしくおねがいします", "yoroshiku onegaishimasu", "please treat me kindly"],
        ["anou", "あのう", "anou", "um / excuse me"],
        ["hai", "はい", "hai", "yes"],
        ["sou-desu", "そうです", "sou desu", "that’s right"],
        ["sou-desu-ka", "そうですか", "sou desu ka", "I see / is that so?"]
      ]
    },
    {
      id: "lesson1-school", name: "Lesson 1 · School & people", description: "The identities and relationships used in a first introduction.",
      words: [
        ["daigaku", "だいがく", "daigaku", "college / university"],
        ["koukou", "こうこう", "koukou", "high school"],
        ["gakusei", "がくせい", "gakusei", "student"],
        ["daigakusei", "だいがくせい", "daigakusei", "college student"],
        ["ryuugakusei", "りゅうがくせい", "ryuugakusei", "international student"],
        ["sensei", "せんせい", "sensei", "teacher / professor"],
        ["suffix-nensei", "～ねんせい", "nensei", "year student"],
        ["ichinensei", "いちねんせい", "ichinensei", "first-year student"],
        ["senkou", "せんこう", "senkou", "major / field of study"],
        ["watashi", "わたし", "watashi", "I / me"],
        ["tomodachi", "ともだち", "tomodachi", "friend"],
        ["suffix-san", "～さん", "san", "Mr. / Ms. (name suffix)"],
        ["suffix-jin", "～じん", "jin", "person from / nationality suffix"],
        ["nihonjin", "にほんじん", "nihonjin", "Japanese person"],
        ["namae", "なまえ", "namae", "name"]
      ]
    },
    {
      id: "lesson1-details", name: "Lesson 1 · Time, details & countries", description: "Ask and understand time, age, telephone details, language, and origin.",
      words: [
        ["ima", "いま", "ima", "now"],
        ["gozen", "ごぜん", "gozen", "a.m. / before noon"],
        ["gogo", "ごご", "gogo", "p.m. / afternoon"],
        ["suffix-ji", "～じ", "ji", "o’clock / hour suffix"],
        ["ichiji", "いちじ", "ichiji", "one o’clock"],
        ["han", "はん", "han", "half"],
        ["nijihan", "にじはん", "nijihan", "half past two"],
        ["nihon", "にほん", "nihon", "Japan"],
        ["amerika", "アメリカ", "amerika", "United States / America"],
        ["suffix-go", "～ご", "go", "language suffix"],
        ["nihongo", "にほんご", "nihongo", "Japanese language"],
        ["suffix-sai", "～さい", "sai", "years old / age suffix"],
        ["denwa", "でんわ", "denwa", "telephone"],
        ["suffix-ban", "～ばん", "ban", "number suffix"],
        ["bangou", "ばんごう", "bangou", "number"],
        ["nan-nani", "なん／なに", "nan / nani", "what"],
        ["igirisu", "イギリス", "igirisu", "Britain"],
        ["oosutoraria", "オーストラリア", "oosutoraria", "Australia"],
        ["kankoku", "かんこく", "kankoku", "Korea"],
        ["kanada", "カナダ", "kanada", "Canada"],
        ["chuugoku", "ちゅうごく", "chuugoku", "China"],
        ["indo", "インド", "indo", "India"],
        ["ejiputo", "エジプト", "ejiputo", "Egypt"],
        ["firipin", "フィリピン", "firipin", "Philippines"]
      ]
    },
    {
      id: "lesson1-life", name: "Lesson 1 · Majors, work & family", description: "Describe what people study, what they do, and how they are related.",
      words: [
        ["ajia-kenkyuu", "アジアけんきゅう", "ajia kenkyuu", "Asian studies"],
        ["keizai", "けいざい", "keizai", "economics"],
        ["kougaku", "こうがく", "kougaku", "engineering"],
        ["kokusai-kankei", "こくさいかんけい", "kokusai kankei", "international relations"],
        ["konpyuutaa", "コンピューター", "konpyuutaa", "computer"],
        ["seiji", "せいじ", "seiji", "politics"],
        ["seibutsugaku", "せいぶつがく", "seibutsugaku", "biology"],
        ["bijinesu", "ビジネス", "bijinesu", "business"],
        ["bungaku", "ぶんがく", "bungaku", "literature"],
        ["rekishi", "れきし", "rekishi", "history"],
        ["isha", "いしゃ", "isha", "doctor"],
        ["kaishain", "かいしゃいん", "kaishain", "office worker"],
        ["kangoshi", "かんごし", "kangoshi", "nurse"],
        ["koukousei", "こうこうせい", "koukousei", "high school student"],
        ["shufu", "しゅふ", "shufu", "homemaker"],
        ["daigakuinsei", "だいがくいんせい", "daigakuinsei", "graduate student"],
        ["bengoshi", "べんごし", "bengoshi", "lawyer"],
        ["okaasan", "おかあさん", "okaasan", "mother"],
        ["otousan", "おとうさん", "otousan", "father"],
        ["oneesan", "おねえさん", "oneesan", "older sister"],
        ["oniisan", "おにいさん", "oniisan", "older brother"],
        ["imouto", "いもうと", "imouto", "younger sister"],
        ["otouto", "おとうと", "otouto", "younger brother"]
      ]
    },
    {
      id: "lesson2-pointing", name: "Lesson 2 · Pointing & places", description: "Identify things and people, distinguish distance, and ask where something is.",
      words: [
        ["kore", "これ", "kore", "this one"],
        ["sore", "それ", "sore", "that one"],
        ["are", "あれ", "are", "that one over there"],
        ["dore", "どれ", "dore", "which one"],
        ["kono", "この", "kono", "this (before a noun)"],
        ["sono", "その", "sono", "that (before a noun)"],
        ["ano", "あの", "ano", "that over there (before a noun)"],
        ["dono", "どの", "dono", "which (before a noun)"],
        ["koko", "ここ", "koko", "here"],
        ["soko", "そこ", "soko", "there"],
        ["asoko", "あそこ", "asoko", "over there"],
        ["doko", "どこ", "doko", "where?"],
        ["dare", "だれ", "dare", "who"],
        ["ginkou", "ぎんこう", "ginkou", "bank"],
        ["konbini", "コンビニ", "konbini", "convenience store"],
        ["toire", "トイレ", "toire", "toilet / restroom"],
        ["toshokan", "としょかん", "toshokan", "library"],
        ["yuubinkyoku", "ゆうびんきょく", "yuubinkyoku", "post office"]
      ]
    },
    {
      id: "lesson2-things", name: "Lesson 2 · Food & belongings", description: "High-use objects and foods for identifying belongings and ordering a meal.",
      words: [
        ["oishii", "おいしい", "oishii", "delicious"],
        ["sakana", "さかな", "sakana", "fish"],
        ["tonkatsu", "とんかつ", "tonkatsu", "pork cutlet"],
        ["niku", "にく", "niku", "meat"],
        ["menyuu", "メニュー", "menyuu", "menu"],
        ["yasai", "やさい", "yasai", "vegetable"],
        ["kasa", "かさ", "kasa", "umbrella"],
        ["kaban", "かばん", "kaban", "bag"],
        ["kutsu", "くつ", "kutsu", "shoes"],
        ["saifu", "さいふ", "saifu", "wallet"],
        ["jiinzu", "ジーンズ", "jiinzu", "jeans"],
        ["jitensha", "じてんしゃ", "jitensha", "bicycle"],
        ["shinbun", "しんぶん", "shinbun", "newspaper"],
        ["sumaho", "スマホ", "sumaho", "smartphone / mobile phone"],
        ["tiishatsu", "Tシャツ", "tiishatsu", "T-shirt"],
        ["tokei", "とけい", "tokei", "watch / clock"],
        ["nooto", "ノート", "nooto", "notebook"],
        ["pen", "ペン", "pen", "pen"],
        ["boushi", "ぼうし", "boushi", "hat / cap"],
        ["hon", "ほん", "hon", "book"]
      ]
    },
    {
      id: "lesson2-shopping", name: "Lesson 2 · Shopping language", description: "Ask prices and complete a simple store or restaurant exchange.",
      words: [
        ["eigo", "えいご", "eigo", "English language"],
        ["ikura", "いくら", "ikura", "how much?"],
        ["suffix-en", "～えん", "en", "yen / currency suffix"],
        ["takai", "たかい", "takai", "expensive / high"],
        ["irasshaimase", "いらっしゃいませ", "irasshaimase", "welcome to our store"],
        ["onegaishimasu", "おねがいします", "onegaishimasu", "please / a request"],
        ["kudasai", "ください", "kudasai", "please give me"],
        ["jaa", "じゃあ", "jaa", "then / in that case"],
        ["douzo", "どうぞ", "douzo", "please / here it is"],
        ["doumo", "どうも", "doumo", "thanks / very much"]
      ]
    },
    {
      id: "practical-extras", name: "Practical extras · Daily essentials", description: "High-frequency language for understanding, routines, meals, and everyday conversation.",
      words: [
        ["iie", "いいえ", "iie", "no"],
        ["gomen-nasai", "ごめんなさい", "gomen nasai", "I’m sorry"],
        ["mata-ne", "またね", "mata ne", "see you"],
        ["wakarimasu", "わかります", "wakarimasu", "I understand"],
        ["wakarimasen", "わかりません", "wakarimasen", "I don’t understand"],
        ["daijoubu", "だいじょうぶ", "daijoubu", "okay / all right"],
        ["kazoku", "かぞく", "kazoku", "family"],
        ["hito", "ひと", "hito", "person"],
        ["kyou", "きょう", "kyou", "today"],
        ["ashita", "あした", "ashita", "tomorrow"],
        ["kinou", "きのう", "kinou", "yesterday"],
        ["asa", "あさ", "asa", "morning"],
        ["hiru", "ひる", "hiru", "noon / daytime"],
        ["yoru", "よる", "yoru", "night"],
        ["jikan", "じかん", "jikan", "time / duration"],
        ["iku", "いく", "iku", "to go"],
        ["kuru", "くる", "kuru", "to come"],
        ["kaeru", "かえる", "kaeru", "to return home"],
        ["shigoto", "しごと", "shigoto", "work / job"],
        ["mizu", "みず", "mizu", "water"],
        ["ocha", "おちゃ", "ocha", "tea"],
        ["gohan", "ごはん", "gohan", "meal / cooked rice"],
        ["asagohan", "あさごはん", "asagohan", "breakfast"],
        ["taberu", "たべる", "taberu", "to eat"],
        ["nomu", "のむ", "nomu", "to drink"],
        ["mise", "みせ", "mise", "shop / store"]
      ]
    },
    {
      id: "practical-navigation", name: "Practical extras · Getting around", description: "Essential transport and direction words for navigating outside the classroom.",
      words: [
        ["eki", "えき", "eki", "station"],
        ["densha", "でんしゃ", "densha", "train"],
        ["basu", "バス", "basu", "bus"],
        ["kuruma", "くるま", "kuruma", "car"],
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
  const CONTRAST_GROUPS = [
    ["ohayou", "ohayou-gozaimasu", "konnichiwa", "konbanwa", "sayounara", "oyasumi-nasai", "mata-ne"],
    ["arigatou", "arigatou-gozaimasu", "sumimasen", "gomen-nasai", "doumo"],
    ["ittekimasu", "itterasshai", "tadaima", "okaeri-nasai"],
    ["itadakimasu", "gochisousama-deshita", "irasshaimase", "onegaishimasu", "kudasai", "douzo"],
    ["daigaku", "koukou", "gakusei", "daigakusei", "ryuugakusei", "koukousei", "daigakuinsei", "sensei"],
    ["ajia-kenkyuu", "keizai", "kougaku", "kokusai-kankei", "seiji", "seibutsugaku", "bijinesu", "bungaku", "rekishi"],
    ["isha", "kaishain", "kangoshi", "shufu", "bengoshi", "sensei"],
    ["okaasan", "otousan", "oneesan", "oniisan", "imouto", "otouto", "kazoku"],
    ["kore", "sore", "are", "dore"],
    ["kono", "sono", "ano", "dono"],
    ["koko", "soko", "asoko", "doko"],
    ["ginkou", "konbini", "toire", "toshokan", "yuubinkyoku", "mise", "eki"],
    ["sakana", "tonkatsu", "niku", "yasai", "mizu", "ocha", "gohan", "asagohan"],
    ["kasa", "kaban", "kutsu", "saifu", "jiinzu", "jitensha", "shinbun", "sumaho", "tiishatsu", "tokei", "nooto", "pen", "boushi", "hon"],
    ["kyou", "ashita", "kinou", "ima"],
    ["asa", "hiru", "yoru", "gozen", "gogo"],
    ["iku", "kuru", "kaeru"],
    ["eki", "densha", "basu", "kuruma", "jitensha"],
    ["migi", "hidari", "massugu", "iriguchi", "deguchi"]
  ];
  const CONTRASTS_BY_ID = new Map();
  CONTRAST_GROUPS.forEach((group, groupIndex) => group.forEach(id => {
    if (!CONTRASTS_BY_ID.has(id)) CONTRASTS_BY_ID.set(id, new Set());
    CONTRASTS_BY_ID.get(id).add(groupIndex);
  }));
  const $ = selector => document.querySelector(selector);
  const shuffle = values => [...values].sort(() => Math.random() - .5);
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const Scheduler = window.KANA_SPRINT_VOCABULARY_SCHEDULER;

  function defaultState() {
    return {
      version: VERSION, total: 0, correct: 0, streak: 0, bestStreak: 0,
      questionFormat: "both", pace: 50, newWordCredit: 0, unlockedStage: 0,
      autoPronounce: true, items: {}, recent: [], savedAt: 0
    };
  }

  function itemState(word) {
    if (!state.items[word.id]) state.items[word.id] = {
      introduced: false, seen: 0, correct: 0, wrong: 0, mastery: 0,
      lastWasCorrect: null, lastSeen: 0, dueAt: 0, recentDistractors: [], confusions: {}
    };
    const progress = state.items[word.id];
    if (!Array.isArray(progress.recentDistractors)) progress.recentDistractors = [];
    if (!progress.confusions || typeof progress.confusions !== "object") progress.confusions = {};
    return progress;
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
  state.newWordCredit = clamp(Number(state.newWordCredit) || 0, 0, 1);
  const previouslyReachedStage = WORDS.reduce((highest, word) => state.items[word.id]?.introduced ? Math.max(highest, word.stageIndex) : highest, 0);
  state.unlockedStage = clamp(Math.max(Number(state.unlockedStage) || 0, previouslyReachedStage), 0, STAGES.length - 1);
  let current = null;
  let phase = "idle";
  let questionNumber = 0;
  let lastFormat = "";
  let currentChoiceIds = [];

  function saveState() {
    unlockedStageIndex();
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
    return Scheduler.stageIsReady(words.map(word => itemState(word)));
  }
  function unlockedStageIndex() {
    let index = clamp(Number(state.unlockedStage) || 0, 0, STAGES.length - 1);
    while (index < STAGES.length - 1 && stageReady(index)) index++;
    state.unlockedStage = Math.max(Number(state.unlockedStage) || 0, index);
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
    if (!introduced.length && unseen.length) return { word: unseen[0], introduce: true };
    const now = Date.now();
    const recent = new Set(state.recent.slice(-5));
    const due = introduced.filter(word => {
      const progress = itemState(word);
      return progress.dueAt && progress.dueAt <= now;
    });
    if (due.length) return { word: selectReviewWord(due, recent), introduce: false };
    if (unseen.length) {
      const decision = Scheduler.nextIntroductionDecision(state.pace, state.newWordCredit);
      state.newWordCredit = decision.credit;
      if (decision.introduce) return { word: unseen[0], introduce: true };
    }
    return { word: selectReviewWord(introduced, recent), introduce: false };
  }

  function selectReviewWord(words, recent) {
    let candidates = words.filter(word => !recent.has(word.id));
    if (!candidates.length) candidates = words;
    const scored = candidates.map(word => {
      const progress = itemState(word);
      return { word, score: Scheduler.reviewScore(progress) };
    }).sort((a, b) => b.score - a.score);
    return scored[0]?.word || null;
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
        <div><h2>Lesson 1–2 vocabulary</h2><p class="muted">Covers the complete Lesson 1 and Lesson 2 vocabulary, followed by practical daily and navigation extras.</p></div>
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
        <div class="footer-actions"><div class="actions"><button class="ghost" id="vocabDontKnow">I don’t know</button><button class="ghost hidden" id="vocabNext">Next <kbd>Enter</kbd></button></div><span class="tiny" id="vocabKeyboardHint">Use <kbd>1</kbd>–<kbd>4</kbd> to choose an answer.</span></div>
      </div>
      <div class="vocab-below">
        <div class="card"><h2>Vocabulary progress</h2><div class="vocab-progress-grid"><div class="mini"><strong id="vocabTotal">0</strong><span class="tiny">answers</span></div><div class="mini"><strong id="vocabAccuracy">—</strong><span class="tiny">accuracy</span></div><div class="mini"><strong id="vocabIntroduced">0</strong><span class="tiny">introduced</span></div><div class="mini"><strong id="vocabMastered">0</strong><span class="tiny">mastered</span></div><div class="mini"><strong id="vocabWeak">0</strong><span class="tiny">weak</span></div><div class="mini"><strong id="vocabBestStreak">0</strong><span class="tiny">best streak</span></div></div></div>
        <div class="card vocab-playback"><div><h2>Pronunciation</h2><p class="muted">Voice selection is shared with Word Reading and Numbers.</p></div><div><label class="toggle-line"><input type="checkbox" id="vocabAutoPronounce"> Automatically pronounce revealed words</label><button class="ghost" id="vocabManageVoices" type="button">Manage voices</button></div></div>
      </div>
      <div class="card vocab-curriculum-card"><h2>Lesson vocabulary curriculum</h2><p class="muted">Lesson 1 comes first, then Lesson 2 and practical extras. Each stage opens after every word in the previous stage has been introduced and its average mastery reaches 35%.</p><div class="vocab-stages" id="vocabStages"></div></div>`;
    const panelAnchor = $("#panel-wordprogress");
    if (panelAnchor) panelAnchor.before(panel); else $(".wrap").appendChild(panel);

    const wordProgressGrid = $("#panel-wordprogress > .grid2");
    const wordProgressHeading = wordProgressGrid?.querySelector(".card h2");
    if (wordProgressHeading) wordProgressHeading.textContent = "Word reading progress";
    if (wordProgressGrid) {
      const vocabularyProgress = document.createElement("div");
      vocabularyProgress.className = "card vocab-progress-detail-card";
      vocabularyProgress.innerHTML = `<div class="vocab-progress-detail-heading"><div><h2>Vocabulary comprehension</h2><p class="muted">Meaning mastery is tracked separately from kana word reading.</p></div><span class="data-badge" id="vocabProgressStage">Lesson 1 · Greetings & courtesy</span></div><div class="vocab-progress-grid"><div class="mini"><strong id="vocabProgressTotal">0</strong><span class="tiny">answers</span></div><div class="mini"><strong id="vocabProgressAccuracy">—</strong><span class="tiny">accuracy</span></div><div class="mini"><strong id="vocabProgressIntroduced">0</strong><span class="tiny">introduced</span></div><div class="mini"><strong id="vocabProgressMastered">0</strong><span class="tiny">mastered</span></div><div class="mini"><strong id="vocabProgressWeak">0</strong><span class="tiny">weak</span></div><div class="mini"><strong id="vocabProgressBestStreak">0</strong><span class="tiny">best streak</span></div></div>`;
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

  function choiceCountFor(word) {
    return Scheduler.choiceCountForMastery(itemState(word).mastery);
  }

  function editSimilarity(left, right) {
    const a = left.toLowerCase().replace(/[^a-z\u3040-\u30ff]/g, "");
    const b = right.toLowerCase().replace(/[^a-z\u3040-\u30ff]/g, "");
    if (!a.length || !b.length) return 0;
    const row = Array.from({ length: b.length + 1 }, (_, index) => index);
    for (let i = 1; i <= a.length; i++) {
      let diagonal = row[0];
      row[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const above = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
        diagonal = above;
      }
    }
    return 1 - row[b.length] / Math.max(a.length, b.length);
  }

  function sharedContrastGroups(left, right) {
    const leftGroups = CONTRASTS_BY_ID.get(left.id);
    const rightGroups = CONTRASTS_BY_ID.get(right.id);
    if (!leftGroups || !rightGroups) return 0;
    return [...leftGroups].filter(group => rightGroups.has(group)).length;
  }

  function distractorScore(word, candidate, format) {
    const progress = itemState(word);
    const challenge = progress.mastery < 40 ? .35 : progress.mastery < 72 ? .7 : 1;
    const recentIndex = progress.recentDistractors.lastIndexOf(candidate.id);
    const confusionCount = Number(progress.confusions[candidate.id]) || 0;
    let score = sharedContrastGroups(word, candidate) * (45 + 40 * challenge);
    if (candidate.stageIndex === word.stageIndex) score += 32;
    if (state.items[candidate.id]?.introduced) score += 12;
    score += editSimilarity(format === "spoken" ? word.romaji : word.jp, format === "spoken" ? candidate.romaji : candidate.jp) * (format === "spoken" ? 18 + 28 * challenge : 10 + 20 * challenge);
    score += Math.min(54, confusionCount * 18);
    if (recentIndex >= 0) {
      const recency = progress.recentDistractors.length - recentIndex;
      score -= Math.max(55, 130 - recency * 8);
    }
    return score + Math.random() * 18;
  }

  function makeChoices(word, format) {
    const count = choiceCountFor(word);
    const meanings = new Set([word.meaning]);
    const ranked = WORDS
      .filter(candidate => candidate.id !== word.id && candidate.meaning !== word.meaning)
      .map(candidate => ({ candidate, score: distractorScore(word, candidate, format) }))
      .sort((a, b) => b.score - a.score);
    const distractors = [];
    for (const { candidate } of ranked) {
      if (meanings.has(candidate.meaning)) continue;
      distractors.push(candidate);
      meanings.add(candidate.meaning);
      if (distractors.length === count - 1) break;
    }
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
    const choices = makeChoices(word, format);
    currentChoiceIds = choices.map(choice => choice.id);
    options.dataset.count = String(choices.length);
    $("#vocabKeyboardHint").innerHTML = `Use <kbd>1</kbd>–<kbd>${choices.length}</kbd> to choose an answer.`;
    choices.forEach((choice, index) => {
      const button = document.createElement("button");
      button.className = "vocab-choice";
      button.dataset.id = choice.id;
      button.innerHTML = `<span>${index + 1}</span><strong>${choice.meaning}</strong>`;
      button.addEventListener("click", () => answer(choice.id));
      options.appendChild(button);
    });
    if (spoken) setTimeout(() => speak(word), 100);
  }

  function applyResult(correct, selectedId) {
    const progress = itemState(current);
    progress.introduced = true;
    const distractorIds = currentChoiceIds.filter(id => id !== current.id);
    progress.recentDistractors.push(...distractorIds);
    progress.recentDistractors = progress.recentDistractors.slice(-16);
    if (!correct && selectedId) progress.confusions[selectedId] = (Number(progress.confusions[selectedId]) || 0) + 1;
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
    applyResult(correct, selectedId);
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
    if (!selected?.word) return;
    if (selected.introduce) beginIntroduction(selected.word); else showQuestion(selected.word);
  }

  function renderProgress() {
    if (!$("#vocabTotal")) return;
    const setOptionalText = (selector, value) => {
      const element = $(selector);
      if (element) element.textContent = value;
    };
    const introduced = introducedWords();
    const mastered = introduced.filter(word => itemState(word).mastery >= 72);
    const weak = introduced.filter(word => itemState(word).wrong > 0 && (itemState(word).lastWasCorrect === false || itemState(word).mastery < 40));
    $("#vocabTotal").textContent = state.total;
    $("#vocabAccuracy").textContent = state.total ? `${Math.round(state.correct / state.total * 100)}%` : "—";
    $("#vocabIntroduced").textContent = `${introduced.length} / ${WORDS.length}`;
    $("#vocabMastered").textContent = mastered.length;
    $("#vocabWeak").textContent = weak.length;
    $("#vocabBestStreak").textContent = state.bestStreak;
    setOptionalText("#vocabProgressTotal", state.total);
    setOptionalText("#vocabProgressAccuracy", state.total ? `${Math.round(state.correct / state.total * 100)}%` : "—");
    setOptionalText("#vocabProgressIntroduced", `${introduced.length} / ${WORDS.length}`);
    setOptionalText("#vocabProgressMastered", mastered.length);
    setOptionalText("#vocabProgressWeak", weak.length);
    setOptionalText("#vocabProgressBestStreak", state.bestStreak);
    $("#vocabPaceName").textContent = paceLabel();
    const unlocked = unlockedStageIndex();
    setOptionalText("#vocabProgressStage", STAGES[unlocked].name);
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
    if (/^[1-8]$/.test(event.key) && phase === "question") {
      const button = $("#vocabOptions").children[Number(event.key) - 1];
      if (button) { event.preventDefault(); button.click(); }
    }
  });
  if (location.hash === "#vocabulary" || document.body.dataset.activity === "vocabulary") switchToVocabulary();
})();

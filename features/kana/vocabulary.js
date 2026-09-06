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
  const CONTEXT_PROMPTS = {
    "sumimasen": "You need to get a stranger’s attention politely. What do you say?",
    "itadakimasu": "You are about to begin a meal. What do you say?",
    "gochisousama-deshita": "You have just finished a meal. What do you say?",
    "ittekimasu": "You are leaving home and expect to return. What do you say?",
    "itterasshai": "Someone at home is leaving and will return. What do you say to them?",
    "tadaima": "You have just arrived back home. What do you say?",
    "okaeri-nasai": "Someone has just returned home. What do you say to welcome them?",
    "onegaishimasu": "You are politely making a request. Which expression fits?",
    "kudasai": "You want the shop clerk to give you a specific item. Which expression fits?",
    "douzo": "You are offering an item or inviting someone to go ahead. What do you say?",
    "irasshaimase": "A customer enters your shop. What do you say?",
    "sou-desu-ka": "Someone tells you new information and you respond, ‘I see.’ What do you say?"
  };
  const CONTRASTS_BY_ID = new Map();
  CONTRAST_GROUPS.forEach((group, groupIndex) => group.forEach(id => {
    if (!CONTRASTS_BY_ID.has(id)) CONTRASTS_BY_ID.set(id, new Set());
    CONTRASTS_BY_ID.get(id).add(groupIndex);
  }));
  const $ = selector => document.querySelector(selector);
  const shuffle = values => [...values].sort(() => Math.random() - .5);
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const Scheduler = window.KANA_SPRINT_VOCABULARY_SCHEDULER;
  const MODE_KEYS = ["written", "spoken", "recall"];
  const SCOPE_LABELS = { adaptive: "Guided course", all: "All vocabulary", core: "Core lessons", lesson1: "Lesson 1", lesson2: "Lesson 2", extras: "Practical extras", trouble: "Trouble words" };

  function emptyModeProgress() {
    return { seen: 0, correct: 0, wrong: 0, mastery: 0, lastWasCorrect: null, lastSeen: 0, dueAt: 0, dueQuestion: 0, recentResults: [] };
  }

  function defaultState() {
    return {
      version: VERSION, total: 0, correct: 0, streak: 0, bestStreak: 0,
      questionFormat: "mixed", practiceScope: "adaptive", pace: 50, newWordCredit: 0, unlockedStage: 0,
      autoPronounce: true, items: {}, recent: [], savedAt: 0
    };
  }

  function itemState(word) {
    if (!state.items[word.id]) state.items[word.id] = {
      introduced: false, seen: 0, correct: 0, wrong: 0, mastery: 0,
      lastWasCorrect: null, lastSeen: 0, dueAt: 0, recentDistractors: [], confusions: {}, modes: {}
    };
    const progress = state.items[word.id];
    if (!Array.isArray(progress.recentDistractors)) progress.recentDistractors = [];
    if (!progress.confusions || typeof progress.confusions !== "object") progress.confusions = {};
    if (!progress.modes || typeof progress.modes !== "object") {
      progress.modes = { written: { ...emptyModeProgress(), seen: Number(progress.seen) || 0, correct: Number(progress.correct) || 0, wrong: Number(progress.wrong) || 0, mastery: Number(progress.mastery) || 0, lastWasCorrect: progress.lastWasCorrect ?? null, lastSeen: Number(progress.lastSeen) || 0, dueAt: Number(progress.dueAt) || 0 } };
    }
    MODE_KEYS.forEach(mode => {
      progress.modes[mode] = { ...emptyModeProgress(), ...(progress.modes[mode] || {}) };
      if (!Array.isArray(progress.modes[mode].recentResults)) progress.modes[mode].recentResults = [];
    });
    return progress;
  }

  function modeState(word, mode) { return itemState(word).modes[mode]; }

  function refreshAggregate(progress) {
    const attempted = MODE_KEYS.map(mode => progress.modes[mode]).filter(mode => mode.seen > 0);
    progress.seen = attempted.reduce((sum, mode) => sum + mode.seen, 0);
    progress.correct = attempted.reduce((sum, mode) => sum + mode.correct, 0);
    progress.wrong = attempted.reduce((sum, mode) => sum + mode.wrong, 0);
    progress.mastery = attempted.length ? attempted.reduce((sum, mode) => sum + mode.mastery, 0) / attempted.length : 0;
    progress.lastSeen = Math.max(0, ...attempted.map(mode => mode.lastSeen));
    const latest = attempted.sort((a, b) => b.lastSeen - a.lastSeen)[0];
    progress.lastWasCorrect = latest?.lastWasCorrect ?? null;
    const dueTimes = attempted.map(mode => mode.dueAt).filter(Boolean);
    progress.dueAt = dueTimes.length ? Math.min(...dueTimes) : 0;
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
  if (state.questionFormat === "both") state.questionFormat = "mixed";
  if (!["written", "spoken", "recall", "mixed"].includes(state.questionFormat)) state.questionFormat = "mixed";
  if (!Object.hasOwn(SCOPE_LABELS, state.practiceScope)) state.practiceScope = "adaptive";
  state.pace = clamp(Number(state.pace) || 50, 10, 90);
  state.newWordCredit = clamp(Number(state.newWordCredit) || 0, 0, 1);
  state.unlockedStage = clamp(Number(state.unlockedStage) || 0, 0, STAGES.length - 1);
  let current = null;
  let phase = "idle";
  let questionNumber = 0;
  let lastFormat = "";
  let currentChoiceIds = [];
  let currentMode = "written";
  let currentContext = "";
  let currentReason = "Getting ready";
  let lastRegularScope = state.practiceScope === "trouble" ? "adaptive" : state.practiceScope;
  const sessionStartedTotal = state.total;
  const sessionStartedCorrect = state.correct;

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

  function allowedModes() {
    if (state.questionFormat === "written") return ["written"];
    if (state.questionFormat === "spoken") return japaneseSpeechReady() ? ["spoken"] : ["written"];
    if (state.questionFormat === "recall") return ["recall"];
    return japaneseSpeechReady() ? MODE_KEYS : ["written", "recall"];
  }

  function modeLabel(mode) {
    return { written: "reading", spoken: "listening", recall: "recall" }[mode] || mode;
  }

  function wordsForScope(scope = state.practiceScope) {
    if (scope === "all") return WORDS;
    if (scope === "lesson1") return WORDS.filter(word => word.stageIndex <= 3);
    if (scope === "lesson2") return WORDS.filter(word => word.stageIndex >= 4 && word.stageIndex <= 6);
    if (scope === "core") return WORDS.filter(word => word.stageIndex <= 6);
    if (scope === "extras") return WORDS.filter(word => word.stageIndex >= 7);
    if (scope === "trouble") return weakWords();
    const unlocked = unlockedStageIndex();
    return WORDS.filter(word => word.stageIndex <= unlocked);
  }

  function scopeShortLabel() {
    return { adaptive: `Stage ${unlockedStageIndex() + 1} / ${STAGES.length}`, all: "All words", core: "Core", lesson1: "Lesson 1", lesson2: "Lesson 2", extras: "Extras", trouble: "Trouble" }[state.practiceScope];
  }

  function weakWords() {
    return introducedWords().filter(word => allowedModes().some(mode => {
      const progress = modeState(word, mode);
      const recentAccuracy = Scheduler.recentAccuracy(progress.recentResults);
      return progress.wrong > 0 && (progress.lastWasCorrect === false || progress.mastery < 40 || (recentAccuracy !== null && recentAccuracy < .6));
    }));
  }

  function dueModes(word, now = Date.now()) {
    return allowedModes().filter(mode => {
      const progress = modeState(word, mode);
      return progress.seen > 0 && Scheduler.reviewIsDue(progress, state.total, now);
    });
  }

  function chooseMode(word, onlyDue = false) {
    const modes = onlyDue ? dueModes(word) : allowedModes();
    return [...modes].sort((left, right) => {
      const a = modeState(word, left);
      const b = modeState(word, right);
      if ((a.seen === 0) !== (b.seen === 0)) return a.seen === 0 ? -1 : 1;
      return Scheduler.reviewScore(b, 0) - Scheduler.reviewScore(a, 0);
    })[0] || "written";
  }

  function selectWord() {
    const adaptive = state.practiceScope === "adaptive";
    const stageIndex = unlockedStageIndex();
    const pool = wordsForScope();
    const reviewPool = adaptive ? introducedWords() : pool;
    const unseenPool = adaptive ? stageWords(stageIndex) : pool;
    const unseen = unseenPool.filter(word => !itemState(word).introduced)
      .sort((a, b) => a.stageIndex - b.stageIndex || a.order - b.order);
    const introduced = reviewPool.filter(word => itemState(word).introduced);
    if (state.practiceScope === "trouble") {
      if (!introduced.length) {
        state.practiceScope = lastRegularScope;
        const select = $("#vocabPracticeScope");
        if (select) select.value = state.practiceScope;
        return selectWord();
      }
      return { ...selectReviewWord(introduced, new Set(state.recent.slice(-5)), false), introduce: false, reason: "Trouble-word review" };
    }
    if (!introduced.length && unseen.length) return { word: unseen[0], mode: allowedModes()[0], introduce: true, reason: "Introducing the first word" };
    const recent = new Set(state.recent.slice(-5));
    const due = introduced.filter(word => dueModes(word).length);
    if (due.length) return { ...selectReviewWord(due, recent, true), introduce: false, reason: "Due review" };
    if (unseen.length) {
      const decision = Scheduler.nextIntroductionDecision(state.pace, state.newWordCredit);
      state.newWordCredit = decision.credit;
      if (decision.introduce) return { word: unseen[0], mode: allowedModes()[0], introduce: true, reason: "Introducing a new word" };
      const scheduled = introduced.filter(word => allowedModes().some(mode => modeState(word, mode).seen > 0));
      if (scheduled.length) return { ...selectReviewWord(scheduled, recent, false), introduce: false, reason: "Adaptive review" };
      return { word: unseen[0], mode: allowedModes()[0], introduce: true, reason: "Building the review pool" };
    }
    return { ...selectReviewWord(introduced, recent, false), introduce: false, reason: "Reviewing the current stage" };
  }

  function selectReviewWord(words, recent, onlyDue) {
    let candidates = words.filter(word => !recent.has(word.id));
    if (!candidates.length) candidates = words;
    const scored = candidates.map(word => {
      const mode = chooseMode(word, onlyDue);
      return { word, mode, score: Scheduler.reviewScore(modeState(word, mode)) };
    }).sort((a, b) => b.score - a.score);
    return scored[0] || { word: null, mode: "written" };
  }

  function japaneseSpeechReady() {
    return Boolean(window.KANA_SPRINT_SPEECH?.hasJapaneseVoice?.());
  }
  function speak(word) { return window.KANA_SPRINT_SPEECH?.speakJapanese?.(word.jp); }
  function nextQuestionFormat(word, preferredMode) {
    if (preferredMode && allowedModes().includes(preferredMode)) return preferredMode;
    const modes = allowedModes();
    const weakest = [...modes].sort((left, right) => modeState(word, left).mastery - modeState(word, right).mastery);
    const minimum = modeState(word, weakest[0]).mastery;
    const tied = weakest.filter(mode => modeState(word, mode).mastery === minimum);
    const next = tied.find(mode => mode !== lastFormat) || tied[0] || modes[0];
    lastFormat = next;
    return next;
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
      <div class="trainer vocab-trainer" data-trainer="vocabulary">
        <div class="trainer-top"><div class="mode-tag"><span class="dot"></span><span id="vocabPracticeMode">Vocabulary • adaptive practice</span></div><div class="tiny" id="vocabCount">Question 1</div></div>
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
      <details class="card vocab-setup-card">
        <summary><span><strong>Session controls</strong><small id="vocabPaceStatus">Balanced introduction and review</small></span></summary>
        <div class="vocab-setup">
          <div><h2>Vocabulary practice</h2><p class="muted">Guided course keeps new words in order; All vocabulary opens every lesson. Voice selection and data tools remain in Settings &amp; Data.</p></div>
          <label><span>Practice scope</span><select id="vocabPracticeScope"><option value="adaptive">Guided course</option><option value="all">All vocabulary</option><option value="core">Core lessons</option><option value="lesson1">Lesson 1</option><option value="lesson2">Lesson 2</option><option value="extras">Practical extras</option><option value="trouble">Trouble words</option></select><small id="vocabScopeHint">New words follow the guided sequence; learned words remain reviewable.</small></label>
          <label><span>Question direction</span><select id="vocabQuestionFormat"><option value="mixed">Mixed practice</option><option value="written">Japanese text → English</option><option value="spoken">Spoken Japanese → English</option><option value="recall">English → Japanese</option></select><small id="vocabFormatHint" aria-live="polite"></small></label>
          <label class="vocab-pace"><span>New-word pace: <strong id="vocabPaceName">Balanced</strong></span><input id="vocabPace" type="range" min="10" max="90" step="10"><span class="vocab-pace-labels"><span>More review</span><span>More new</span></span></label>
          <div class="vocab-inline-playback"><label class="toggle-line"><input type="checkbox" id="vocabAutoPronounce"> Automatically pronounce revealed words</label><button class="ghost" id="vocabManageVoices" type="button">Manage voices</button></div>
        </div>
      </details>
      <div class="vocab-below">
        <div class="card"><h2>Mastery by direction</h2><p class="muted">Reading, listening, and recall now improve independently.</p><div class="vocab-direction-grid"><div><span>Japanese → English</span><strong id="vocabWrittenMastery">0%</strong><small id="vocabWrittenRecent">Not practised</small></div><div><span>Listening</span><strong id="vocabSpokenMastery">0%</strong><small id="vocabSpokenRecent">Not practised</small></div><div><span>English → Japanese</span><strong id="vocabRecallMastery">0%</strong><small id="vocabRecallRecent">Not practised</small></div></div></div>
        <div class="card vocab-trouble-card"><div class="vocab-section-heading"><div><h2>Trouble words</h2><p class="muted">Recent misses matter more than old mistakes.</p></div><button class="ghost" id="vocabReviewTrouble" type="button">Review trouble words</button></div><div class="vocab-trouble-list" id="vocabTroubleList"></div></div>
      </div>
      <details class="card vocab-curriculum-card"><summary><span><strong>Lesson vocabulary curriculum</strong><small id="vocabCurriculumSummary">Stage 1 of ${STAGES.length}</small></span></summary><p class="muted">Guided course introduces new words in order and reviews words learned in any scope. All vocabulary opens the complete set without stage locks.</p><div class="vocab-stages" id="vocabStages"></div></details>`;
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
    $("#vocabPracticeScope").value = state.practiceScope;
    $("#vocabQuestionFormat").value = state.questionFormat;
    $("#vocabPace").value = String(state.pace);
    $("#vocabAutoPronounce").checked = state.autoPronounce;
  }

  function updateFormatAvailability() {
    const select = $("#vocabQuestionFormat");
    const ready = japaneseSpeechReady();
    select.querySelector('option[value="spoken"]').disabled = !ready;
    if (!ready && state.questionFormat === "spoken") {
      state.questionFormat = "mixed";
      select.value = "mixed";
      saveState();
    }
    const hints = {
      written: "Build recognition from Japanese text.",
      spoken: ready ? "Listen without seeing the Japanese prompt." : "Listening requires a Japanese voice in Settings & Data.",
      recall: "Recall questions use similar-looking and similar-sounding Japanese choices.",
      mixed: ready ? "Mixed practice rotates through all three directions." : "Mixed practice uses reading and recall until a Japanese voice is available."
    };
    $("#vocabFormatHint").textContent = hints[state.questionFormat];
  }

  function switchToVocabulary() {
    document.querySelectorAll(".tab").forEach(tab => tab.classList.toggle("active", tab.dataset.tab === "vocabulary"));
    document.querySelectorAll(".panel").forEach(panel => panel.classList.toggle("active", panel.id === "panel-vocabulary"));
    publishStreak();
    if (!current) nextQuestion();
  }

  function beginIntroduction(word, preferredMode = "written") {
    current = word;
    currentMode = preferredMode;
    const progress = itemState(word);
    if (!progress.introduced) {
      progress.introduced = true;
      saveState();
    }
    phase = "introduction";
    $("#vocabQuestion").classList.add("hidden");
    $("#vocabIntroduction").classList.remove("hidden");
    $("#vocabDontKnow").classList.add("hidden");
    $("#vocabNext").classList.add("hidden");
    $("#vocabIntroduction").innerHTML = `<span class="vocab-new-badge">New everyday expression</span><div class="vocab-intro-japanese">${word.jp}</div><strong>${word.romaji}</strong><div class="vocab-intro-meaning">${word.meaning}</div><span class="tiny">${word.stageName}</span><div class="actions"><button class="ghost" id="vocabIntroSpeech" type="button">🔊 Hear it</button><button class="big-button" id="vocabStartCheck" type="button">Practice this word</button></div>`;
    $("#vocabIntroSpeech").disabled = !japaneseSpeechReady();
    $("#vocabIntroSpeech").addEventListener("click", () => speak(word));
    $("#vocabStartCheck").addEventListener("click", () => showQuestion(word, preferredMode));
    if (japaneseSpeechReady()) setTimeout(() => speak(word), 100);
    $("#vocabPracticeMode").textContent = "Vocabulary • new expression";
    publishDashboard();
  }

  function choiceCountFor(word, mode = currentMode) {
    return Scheduler.choiceCountForMastery(modeState(word, mode).mastery);
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
    const direction = modeState(word, format);
    const challenge = direction.mastery < 40 ? .35 : direction.mastery < 72 ? .7 : 1;
    const recentIndex = progress.recentDistractors.lastIndexOf(candidate.id);
    const confusionCount = Number(progress.confusions[candidate.id]) || 0;
    let score = sharedContrastGroups(word, candidate) * (45 + 40 * challenge);
    if (candidate.stageIndex === word.stageIndex) score += 32;
    if (state.items[candidate.id]?.introduced) score += 12;
    score += editSimilarity(format === "spoken" ? word.romaji : word.jp, format === "spoken" ? candidate.romaji : candidate.jp) * (format === "spoken" || format === "recall" ? 28 + 34 * challenge : 10 + 20 * challenge);
    score += Math.min(54, confusionCount * 18);
    if (recentIndex >= 0) {
      const recency = progress.recentDistractors.length - recentIndex;
      score -= Math.max(55, 130 - recency * 8);
    }
    return score + Math.random() * 18;
  }

  function makeChoices(word, format) {
    const count = choiceCountFor(word, format);
    const answerValue = candidate => format === "recall" ? candidate.jp : candidate.meaning;
    const answers = new Set([answerValue(word)]);
    const ranked = WORDS
      .filter(candidate => candidate.id !== word.id && answerValue(candidate) !== answerValue(word))
      .map(candidate => ({ candidate, score: distractorScore(word, candidate, format) }))
      .sort((a, b) => b.score - a.score);
    const distractors = [];
    for (const { candidate } of ranked) {
      if (answers.has(answerValue(candidate))) continue;
      distractors.push(candidate);
      answers.add(answerValue(candidate));
      if (distractors.length === count - 1) break;
    }
    return shuffle([word, ...distractors]);
  }

  function showQuestion(word, preferredMode) {
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
    const format = nextQuestionFormat(word, preferredMode);
    currentMode = format;
    const spoken = format === "spoken";
    const recall = format === "recall";
    currentContext = recall && CONTEXT_PROMPTS[word.id] && Math.random() < .65 ? CONTEXT_PROMPTS[word.id] : "";
    $("#vocabPrompt").textContent = recall ? (currentContext || word.meaning) : word.jp;
    $("#vocabPrompt").classList.toggle("vocab-recall-prompt", recall);
    $("#vocabPrompt").classList.toggle("hidden", spoken);
    $("#vocabAudioPrompt").classList.toggle("hidden", !spoken);
    $("#vocabQuestionLabel").textContent = spoken ? "Listen and choose the English meaning" : recall ? (currentContext ? "Choose the expression that fits this situation" : "Choose the Japanese expression") : "Choose the English meaning";
    $("#vocabPracticeMode").textContent = `Vocabulary • ${modeLabel(format)}${currentContext ? " in context" : ""}`;
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
      button.innerHTML = recall ? `<span>${index + 1}</span><span class="vocab-choice-japanese"><strong>${choice.jp}</strong><small>${choice.romaji}</small></span>` : `<span>${index + 1}</span><strong>${choice.meaning}</strong>`;
      button.addEventListener("click", () => answer(choice.id));
      options.appendChild(button);
    });
    if (spoken) setTimeout(() => speak(word), 100);
    publishDashboard();
  }

  function applyResult(correct, selectedId) {
    const progress = itemState(current);
    const direction = modeState(current, currentMode);
    progress.introduced = true;
    const distractorIds = currentChoiceIds.filter(id => id !== current.id);
    progress.recentDistractors.push(...distractorIds);
    progress.recentDistractors = progress.recentDistractors.slice(-16);
    if (!correct && selectedId) progress.confusions[selectedId] = (Number(progress.confusions[selectedId]) || 0) + 1;
    direction.seen++;
    direction.lastSeen = Date.now();
    direction.lastWasCorrect = correct;
    direction.recentResults.push(correct);
    direction.recentResults = direction.recentResults.slice(-8);
    state.total++;
    if (correct) {
      direction.correct++;
      direction.mastery = Math.min(100, direction.mastery + Math.max(6, 20 * (1 - direction.mastery / 140)));
      state.correct++;
      state.streak++;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
    } else {
      direction.wrong++;
      direction.mastery = Math.max(0, direction.mastery - 12);
      state.streak = 0;
    }
    Object.assign(direction, Scheduler.nextReviewSchedule(direction.mastery, correct, state.total));
    refreshAggregate(progress);
    const questionsUntilReview = Math.max(0, direction.dueQuestion - state.total);
    currentReason = correct ? `${modeLabel(currentMode)} strengthened · returns in ${questionsUntilReview} questions` : `${modeLabel(currentMode)} needs attention · returns soon`;
    state.recent.push(current.id);
    if (state.recent.length > 12) state.recent.shift();
    saveState();
  }

  function answer(selectedId, unknown = false) {
    if (phase !== "question" || !current) return;
    phase = "answered";
    const correct = !unknown && selectedId === current.id;
    const selectedWord = !correct && selectedId ? WORDS.find(word => word.id === selectedId) : null;
    applyResult(correct, selectedId);
    [...$("#vocabOptions").children].forEach(button => {
      button.disabled = true;
      if (button.dataset.id === current.id) button.classList.add("correct");
      else if (button.dataset.id === selectedId) button.classList.add("wrong");
    });
    const feedback = $("#vocabFeedback");
    feedback.className = `feedback show ${correct ? "good" : "bad"}`;
    const selectedMarkup = selectedWord ? `<div class="vocab-feedback-choice"><span class="vocab-feedback-choice-label">Your choice</span><strong>${selectedWord.jp} → ${selectedWord.romaji}</strong><span>Meaning: ${selectedWord.meaning}</span></div>` : "";
    feedback.innerHTML = `<strong>${correct ? "Correct" : "Remember this one"}</strong><div class="meta">${selectedMarkup}<span class="vocab-feedback-word">Correct answer: ${current.jp} → ${current.romaji}</span><span>Meaning: ${current.meaning} • ${current.stageName}</span><button class="ghost speak-again" id="vocabReplayAnswer" type="button">🔊 Replay Japanese</button></div>`;
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
    currentReason = selected.reason || "Adaptive review";
    if (selected.introduce) beginIntroduction(selected.word, selected.mode); else showQuestion(selected.word, selected.mode);
  }

  function averageModeMastery(mode, words = introducedWords()) {
    return words.length ? Math.round(words.reduce((sum, word) => sum + modeState(word, mode).mastery, 0) / words.length) : 0;
  }

  function recentModeAccuracy(mode, words = introducedWords()) {
    const results = words.flatMap(word => modeState(word, mode).recentResults).slice(-24);
    return Scheduler.recentAccuracy(results);
  }

  function isMastered(word) {
    const written = modeState(word, "written");
    const spoken = modeState(word, "spoken");
    const recall = modeState(word, "recall");
    return written.mastery >= 72 && recall.mastery >= 72 && (!spoken.seen || spoken.mastery >= 72);
  }

  function dueReviewCount() {
    const pool = state.practiceScope === "adaptive" ? introducedWords() : wordsForScope();
    return pool.filter(word => itemState(word).introduced).reduce((count, word) => count + dueModes(word).length, 0);
  }

  function paceStatus() {
    if (state.practiceScope === "trouble") return "Focused review of recent trouble words";
    const stage = unlockedStageIndex();
    const unseen = (state.practiceScope === "adaptive" ? stageWords(stage) : wordsForScope()).filter(word => !itemState(word).introduced).length;
    const due = dueReviewCount();
    if (due) return `${due} review${due === 1 ? "" : "s"} due now`;
    if (unseen) return `${paceLabel()} pace · ${unseen} new ${state.practiceScope === "adaptive" ? "in the current stage" : `in ${SCOPE_LABELS[state.practiceScope].toLowerCase()}`}`;
    if (state.practiceScope !== "adaptive") return `${SCOPE_LABELS[state.practiceScope]} introduced · strengthening mastery`;
    if (stage < STAGES.length - 1) return `Reviewing learned words while Stage ${stage + 1} finishes`;
    return "Curriculum introduced · strengthening recall";
  }

  function publishDashboard() {
    if (document.body.dataset.activity !== "vocabulary") return;
    const introduced = introducedWords();
    const mastered = introduced.filter(isMastered);
    const sessionTotal = Math.max(0, state.total - sessionStartedTotal);
    const sessionCorrect = Math.max(0, state.correct - sessionStartedCorrect);
    window.dispatchEvent(new CustomEvent("kana-sprint-activity-status", { detail: {
      note: currentReason,
      metrics: [
        { label: "Scope", value: scopeShortLabel() },
        { label: "Streak", value: state.streak },
        { label: "Session accuracy", value: sessionTotal ? `${Math.round(sessionCorrect / sessionTotal * 100)}%` : "—" },
        { label: "Due now", value: dueReviewCount() },
        { label: "Mastered", value: `${mastered.length} / ${WORDS.length}` },
        { label: "Challenge", value: `${current ? choiceCountFor(current, currentMode) : 4} choices` }
      ]
    } }));
  }

  function renderProgress() {
    const setOptionalText = (selector, value) => {
      const element = $(selector);
      if (element) element.textContent = value;
    };
    if (!$("#vocabStages")) return;
    const introduced = introducedWords();
    const unlocked = unlockedStageIndex();
    const scopeWords = wordsForScope();
    const introducedInScope = scopeWords.filter(word => itemState(word).introduced).length;
    const mastered = introduced.filter(isMastered);
    const weak = weakWords();
    setOptionalText("#vocabTotal", state.total);
    setOptionalText("#vocabAccuracy", state.total ? `${Math.round(state.correct / state.total * 100)}%` : "—");
    setOptionalText("#vocabIntroduced", `${introduced.length} / ${WORDS.length}`);
    setOptionalText("#vocabMastered", mastered.length);
    setOptionalText("#vocabWeak", weak.length);
    setOptionalText("#vocabBestStreak", state.bestStreak);
    setOptionalText("#vocabProgressTotal", state.total);
    setOptionalText("#vocabProgressAccuracy", state.total ? `${Math.round(state.correct / state.total * 100)}%` : "—");
    setOptionalText("#vocabProgressIntroduced", `${introduced.length} / ${WORDS.length}`);
    setOptionalText("#vocabProgressMastered", mastered.length);
    setOptionalText("#vocabProgressWeak", weak.length);
    setOptionalText("#vocabProgressBestStreak", state.bestStreak);
    $("#vocabPaceName").textContent = paceLabel();
    setOptionalText("#vocabPaceStatus", paceStatus());
    const currentStageWords = stageWords(unlocked);
    const currentStageIntroduced = currentStageWords.filter(word => itemState(word).introduced).length;
    const curriculumSummary = state.practiceScope === "adaptive"
      ? `${SCOPE_LABELS.adaptive} · ${currentStageIntroduced}/${currentStageWords.length} current · ${introduced.length} learned total`
      : `${SCOPE_LABELS[state.practiceScope]} · ${introducedInScope}/${scopeWords.length} introduced`;
    setOptionalText("#vocabCurriculumSummary", curriculumSummary);
    const scopeHints = {
      adaptive: "New words follow the guided sequence; learned words remain reviewable.",
      all: "All core lessons and Practical extras in one shared practice pool.",
      core: "Everything in Lessons 1 and 2, without Practical extras.",
      lesson1: "Only Lesson 1 vocabulary and expressions.",
      lesson2: "Only Lesson 2 vocabulary and expressions.",
      extras: "Only the additional daily-life and navigation vocabulary.",
      trouble: "Only words flagged by recent mistakes."
    };
    setOptionalText("#vocabScopeHint", scopeHints[state.practiceScope]);
    setOptionalText("#vocabProgressStage", state.practiceScope === "adaptive" ? STAGES[unlocked].name : SCOPE_LABELS[state.practiceScope]);
    MODE_KEYS.forEach(mode => {
      const capitalized = mode[0].toUpperCase() + mode.slice(1);
      const recent = recentModeAccuracy(mode, introduced);
      setOptionalText(`#vocab${capitalized}Mastery`, `${averageModeMastery(mode, introduced)}%`);
      setOptionalText(`#vocab${capitalized}Recent`, recent === null ? "Not practised" : `${Math.round(recent * 100)}% recent accuracy`);
    });
    const troubleList = $("#vocabTroubleList");
    if (troubleList) troubleList.innerHTML = weak.length ? weak.slice(0, 6).map(word => `<div class="vocab-trouble-word"><span><strong>${word.jp}</strong><small>${word.meaning}</small></span><span class="vocab-mode-chips"><i title="Reading mastery">R ${Math.round(modeState(word, "written").mastery)}</i><i title="Listening mastery">L ${Math.round(modeState(word, "spoken").mastery)}</i><i title="Recall mastery">↩ ${Math.round(modeState(word, "recall").mastery)}</i></span></div>`).join("") : `<p class="muted vocab-empty-state">No trouble words yet. Recent misses will appear here.</p>`;
    const troubleButton = $("#vocabReviewTrouble");
    if (troubleButton) {
      troubleButton.disabled = !weak.length;
      troubleButton.textContent = state.practiceScope === "trouble" ? `Return to ${SCOPE_LABELS[lastRegularScope]}` : "Review trouble words";
    }
    const troubleOption = $("#vocabPracticeScope")?.querySelector('option[value="trouble"]');
    if (troubleOption) troubleOption.disabled = !weak.length && state.practiceScope !== "trouble";
    $("#vocabStages").innerHTML = STAGES.map((stage, index) => {
      const words = stageWords(index);
      const introducedCount = words.filter(word => itemState(word).introduced).length;
      const average = Math.round(stageAverage(index));
      const selected = state.practiceScope === "adaptive" ? index <= unlocked : scopeWords.some(word => word.stageIndex === index);
      const practicedEarly = state.practiceScope === "adaptive" && index > unlocked && introducedCount > 0;
      const status = state.practiceScope === "adaptive" ? (index < unlocked ? "Complete" : index === unlocked ? "Current" : practicedEarly ? "Practiced early" : "Locked") : (selected ? (stageReady(index) ? "Complete" : "In scope") : "Filtered");
      const stageClass = selected ? "" : practicedEarly ? "pre-practiced" : "locked";
      return `<div class="vocab-stage ${stageClass}"><span class="vocab-stage-number">${index + 1}</span><div><strong>${stage.name}</strong><p>${stage.description}</p><div class="vocab-stage-meter"><span style="width:${average}%"></span></div><small>${introducedCount} / ${words.length} introduced · ${average}% average mastery</small></div><span class="vocab-stage-status">${status}</span></div>`;
    }).join("");
    publishDashboard();
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
  $("#vocabReviewTrouble").addEventListener("click", () => {
    state.practiceScope = state.practiceScope === "trouble" ? lastRegularScope : "trouble";
    $("#vocabPracticeScope").value = state.practiceScope;
    current = null;
    nextQuestion();
    saveState();
  });
  $("#vocabPracticeScope").addEventListener("change", event => {
    state.practiceScope = event.target.value;
    if (state.practiceScope !== "trouble") lastRegularScope = state.practiceScope;
    current = null;
    saveState();
    nextQuestion();
  });
  $("#vocabManageVoices").addEventListener("click", () => window.KANA_SPRINT_SPEECH?.openSettings?.());
  $("#vocabQuestionFormat").addEventListener("change", event => {
    state.questionFormat = event.target.value;
    updateFormatAvailability();
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

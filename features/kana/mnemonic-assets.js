(() => {
  "use strict";

  // The chart artwork is deliberately local-only. The preference bridge is
  // loaded before this file so the launchers work through file:// without a
  // fetch; a clean checkout still falls back to the complete Tofugu set.
  const BASIC = [
    ["あ", "a"], ["い", "i"], ["う", "u"], ["え", "e"], ["お", "o"],
    ["か", "ka"], ["き", "ki"], ["く", "ku"], ["け", "ke"], ["こ", "ko"],
    ["さ", "sa"], ["し", "shi"], ["す", "su"], ["せ", "se"], ["そ", "so"],
    ["た", "ta"], ["ち", "chi"], ["つ", "tsu"], ["て", "te"], ["と", "to"],
    ["な", "na"], ["に", "ni"], ["ぬ", "nu"], ["ね", "ne"], ["の", "no"],
    ["は", "ha"], ["ひ", "hi"], ["ふ", "fu"], ["へ", "he"], ["ほ", "ho"],
    ["ま", "ma"], ["み", "mi"], ["む", "mu"], ["め", "me"], ["も", "mo"],
    ["や", "ya"], ["ゆ", "yu"], ["よ", "yo"],
    ["ら", "ra"], ["り", "ri"], ["る", "ru"], ["れ", "re"], ["ろ", "ro"],
    ["わ", "wa"], ["を", "wo"], ["ん", "n"]
  ];
  const KATAKANA = [
    ["ア", "a"], ["イ", "i"], ["ウ", "u"], ["エ", "e"], ["オ", "o"],
    ["カ", "ka"], ["キ", "ki"], ["ク", "ku"], ["ケ", "ke"], ["コ", "ko"],
    ["サ", "sa"], ["シ", "shi"], ["ス", "su"], ["セ", "se"], ["ソ", "so"],
    ["タ", "ta"], ["チ", "chi"], ["ツ", "tsu"], ["テ", "te"], ["ト", "to"],
    ["ナ", "na"], ["ニ", "ni"], ["ヌ", "nu"], ["ネ", "ne"], ["ノ", "no"],
    ["ハ", "ha"], ["ヒ", "hi"], ["フ", "fu"], ["ヘ", "he"], ["ホ", "ho"],
    ["マ", "ma"], ["ミ", "mi"], ["ム", "mu"], ["メ", "me"], ["モ", "mo"],
    ["ヤ", "ya"], ["ユ", "yu"], ["ヨ", "yo"],
    ["ラ", "ra"], ["リ", "ri"], ["ル", "ru"], ["レ", "re"], ["ロ", "ro"],
    ["ワ", "wa"], ["ヲ", "wo"], ["ン", "n"]
  ];

  const preferences = window.KANA_SPRINT_MNEMONIC_PREFERENCES || {};
  const selectedByKana = preferences.byKana || {};
  const SOURCE_INFO = {
    "tofugu-hiragana": {
      name: "Tofugu Hiragana Mnemonic Chart",
      credit: "Tofugu",
      url: "https://www.tofugu.com/japanese/hiragana-mnemonics-chart/",
      rights: "Third-party artwork stored locally; redistribution permission has not been supplied."
    },
    "tofugu-katakana": {
      name: "Tofugu Katakana Mnemonic Chart",
      credit: "Tofugu",
      url: "https://www.tofugu.com/japanese/katakana-chart/",
      rights: "Third-party artwork stored locally; redistribution permission has not been supplied."
    },
    leafpiece: {
      name: "Japanese Kana Mnemonic Chart",
      credit: "LeafPiece",
      url: "https://commons.wikimedia.org/wiki/File:Japanese_Kana_Mnemonic_Chart.png",
      rights: "Stored locally. Check the Wikimedia file page for its current license and attribution requirements before redistribution."
    },
    pictografix: {
      name: "Kanji Pict-O-Grafix",
      credit: "Michael Rowley",
      url: "https://www.tofugu.com/japanese/katakana-chart/",
      rights: "Third-party book artwork stored locally; redistribution permission has not been supplied."
    }
  };
  const localPath = value => {
    const path = String(value || "");
    return path ? (path.startsWith("./") ? path : `./${path}`) : "";
  };
  const selectedOption = kana => {
    const entry = selectedByKana[kana];
    if (!entry || !Array.isArray(entry.options) || !entry.options.length) return null;
    return preferences.activeOption === "first" ? entry.options[0] : entry.options[entry.options.length - 1];
  };

  const assets = {};
  const add = (script, kana, reading) => {
    const base = `./assets/local-mnemonics/tofugu/${script}/${reading}`;
    const picked = selectedOption(kana);
    const source = picked?.source || "tofugu";
    const sourceId = source === "tofugu" ? `tofugu-${script}` : source;
    assets[kana] = {
      script,
      visual: localPath(picked?.visual) || `${base}-visual.webp`,
      full: localPath(picked?.full) || `${base}-full.webp`,
      cue: typeof picked?.cue === "string" ? picked.cue : "",
      source,
      sourceId,
      sourceInfo: SOURCE_INFO[sourceId],
      visualCredit: .7,
      fullCredit: .4,
      localOnly: true,
      selected: Boolean(picked)
    };
  };
  BASIC.forEach(([kana, reading]) => add("hiragana", kana, reading));
  KATAKANA.forEach(([kana, reading]) => add("katakana", kana, reading));
  window.KANA_SPRINT_MNEMONIC_ASSETS = assets;
})();

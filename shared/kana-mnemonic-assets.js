(() => {
  "use strict";

  // The chart artwork is deliberately local-only.  The files referenced here
  // are ignored by Git; a clean checkout keeps the text mnemonic fallback.
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

  const assets = {};
  const add = (script, kana, reading) => {
    const base = `./assets/local-mnemonics/${script}/${reading}`;
    assets[kana] = {
      script,
      visual: `${base}-visual.webp`,
      full: `${base}-full.webp`,
      visualCredit: .7,
      fullCredit: .4,
      localOnly: true
    };
  };
  BASIC.forEach(([kana, reading]) => add("hiragana", kana, reading));
  KATAKANA.forEach(([kana, reading]) => add("katakana", kana, reading));
  window.KANA_SPRINT_MNEMONIC_ASSETS = assets;
})();

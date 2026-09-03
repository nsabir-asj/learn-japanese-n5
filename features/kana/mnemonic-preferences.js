(() => {
  "use strict";

  // Offline bridge for the canonical JSON index. The launchers are designed
  // to open through file://, where fetching a sibling JSON file is blocked by
  // browser security. Keep this generated data synchronized with
  // features/kana/mnemonic-preferences.json.
  const rows = [
    ["え","hiragana","e","leafpiece","Edge of a cliff","assets/local-mnemonics/leafpiece/hiragana/e-full.webp","assets/local-mnemonics/leafpiece/hiragana/e-visual.webp"],
    ["す","hiragana","su","leafpiece","Soup ladle","assets/local-mnemonics/leafpiece/hiragana/su-full.webp","assets/local-mnemonics/leafpiece/hiragana/su-visual.webp"],
    ["せ","hiragana","se","leafpiece","Security guard","assets/local-mnemonics/leafpiece/hiragana/se-full.webp","assets/local-mnemonics/leafpiece/hiragana/se-visual.webp"],
    ["せ","hiragana","se","pictografix","Say","assets/local-mnemonics/pictografix/hiragana/se-full.webp","assets/local-mnemonics/pictografix/hiragana/se-visual.webp"],
    ["セ","katakana","se","leafpiece","Security guard","assets/local-mnemonics/leafpiece/katakana/se-full.webp","assets/local-mnemonics/leafpiece/katakana/se-visual.webp"],
    ["セ","katakana","se","pictografix","Say","assets/local-mnemonics/pictografix/katakana/se-full.webp","assets/local-mnemonics/pictografix/katakana/se-visual.webp"],
    ["そ","hiragana","so","leafpiece","Sew a stitch","assets/local-mnemonics/leafpiece/hiragana/so-full.webp","assets/local-mnemonics/leafpiece/hiragana/so-visual.webp"],
    ["に","hiragana","ni","leafpiece","Knee","assets/local-mnemonics/leafpiece/hiragana/ni-full.webp","assets/local-mnemonics/leafpiece/hiragana/ni-visual.webp"],
    ["ニ","katakana","ni","leafpiece","Knee","assets/local-mnemonics/leafpiece/katakana/ni-full.webp","assets/local-mnemonics/leafpiece/katakana/ni-visual.webp"],
    ["ネ","katakana","ne","leafpiece","Neck brace","assets/local-mnemonics/leafpiece/katakana/ne-full.webp","assets/local-mnemonics/leafpiece/katakana/ne-visual.webp"],
    ["ひ","hiragana","hi","leafpiece","Heel","assets/local-mnemonics/leafpiece/hiragana/hi-full.webp","assets/local-mnemonics/leafpiece/hiragana/hi-visual.webp"],
    ["ヒ","katakana","hi","leafpiece","Heel","assets/local-mnemonics/leafpiece/katakana/hi-full.webp","assets/local-mnemonics/leafpiece/katakana/hi-visual.webp"],
    ["ち","hiragana","chi","leafpiece","Chick (cheep, cheep)","assets/local-mnemonics/leafpiece/hiragana/chi-full.webp","assets/local-mnemonics/leafpiece/hiragana/chi-visual.webp"],
    ["ふ","hiragana","fu","leafpiece","Mount Fuji","assets/local-mnemonics/leafpiece/hiragana/fu-full.webp","assets/local-mnemonics/leafpiece/hiragana/fu-visual.webp"],
    ["ユ","katakana","yu","leafpiece","U-turn","assets/local-mnemonics/leafpiece/katakana/yu-full.webp","assets/local-mnemonics/leafpiece/katakana/yu-visual.webp"],
    ["ユ","katakana","yu","pictografix","You are number one","assets/local-mnemonics/pictografix/katakana/yu-full.webp","assets/local-mnemonics/pictografix/katakana/yu-visual.webp"],
    ["よ","hiragana","yo","leafpiece","Yoga","assets/local-mnemonics/leafpiece/hiragana/yo-full.webp","assets/local-mnemonics/leafpiece/hiragana/yo-visual.webp"],
    ["よ","hiragana","yo","pictografix","Yo-yo","assets/local-mnemonics/pictografix/hiragana/yo-full.webp","assets/local-mnemonics/pictografix/hiragana/yo-visual.webp"],
    ["り","hiragana","ri","leafpiece","Reach high","assets/local-mnemonics/leafpiece/hiragana/ri-full.webp","assets/local-mnemonics/leafpiece/hiragana/ri-visual.webp"],
    ["リ","katakana","ri","leafpiece","Reach high","assets/local-mnemonics/leafpiece/katakana/ri-full.webp","assets/local-mnemonics/leafpiece/katakana/ri-visual.webp"],
    ["ロ","katakana","ro","leafpiece","Road sign","assets/local-mnemonics/leafpiece/katakana/ro-full.webp","assets/local-mnemonics/leafpiece/katakana/ro-visual.webp"],
    ["ナ","katakana","na","leafpiece","Knife","assets/local-mnemonics/leafpiece/katakana/na-full.webp","assets/local-mnemonics/leafpiece/katakana/na-visual.webp"],
    ["イ","katakana","i","pictografix","Eat with chopsticks","assets/local-mnemonics/pictografix/katakana/i-full.webp","assets/local-mnemonics/pictografix/katakana/i-visual.webp"],
    ["エ","katakana","e","pictografix","Elevator doors","assets/local-mnemonics/pictografix/katakana/e-full.webp","assets/local-mnemonics/pictografix/katakana/e-visual.webp"],
    ["き","hiragana","ki","pictografix","Key","assets/local-mnemonics/pictografix/hiragana/ki-full.webp","assets/local-mnemonics/pictografix/hiragana/ki-visual.webp"],
    ["キ","katakana","ki","pictografix","Key","assets/local-mnemonics/pictografix/katakana/ki-full.webp","assets/local-mnemonics/pictografix/katakana/ki-visual.webp"],
    ["し","hiragana","shi","pictografix","She has flowing hair","assets/local-mnemonics/pictografix/hiragana/shi-full.webp","assets/local-mnemonics/pictografix/hiragana/shi-visual.webp"],
    ["シ","katakana","shi","pictografix","She has a funny smile","assets/local-mnemonics/pictografix/katakana/shi-full.webp","assets/local-mnemonics/pictografix/katakana/shi-visual.webp"],
    ["ス","katakana","su","pictografix","Suit hanger","assets/local-mnemonics/pictografix/katakana/su-full.webp","assets/local-mnemonics/pictografix/katakana/su-visual.webp"],
    ["ね","hiragana","ne","pictografix","Net a big fish","assets/local-mnemonics/pictografix/hiragana/ne-full.webp","assets/local-mnemonics/pictografix/hiragana/ne-visual.webp"],
    ["み","hiragana","mi","pictografix","Me, I'm 21","assets/local-mnemonics/pictografix/hiragana/mi-full.webp","assets/local-mnemonics/pictografix/hiragana/mi-visual.webp"],
    ["も","hiragana","mo","pictografix","Catch mo' fish with this","assets/local-mnemonics/pictografix/hiragana/mo-full.webp","assets/local-mnemonics/pictografix/hiragana/mo-visual.webp"],
    ["モ","katakana","mo","pictografix","Catch mo' fish with this","assets/local-mnemonics/pictografix/katakana/mo-full.webp","assets/local-mnemonics/pictografix/katakana/mo-visual.webp"]
  ];
  const byKana = {};
  rows.forEach(([kana, script, reading, source, cue, full, visual]) => {
    const entry = byKana[kana] || (byKana[kana] = {script, reading, options: []});
    entry.options.push({source, cue, full, visual});
  });
  window.KANA_SPRINT_MNEMONIC_PREFERENCES = {
    format: 1,
    activeOption: "last",
    byKana
  };
})();

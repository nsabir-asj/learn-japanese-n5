(() => {
  "use strict";

  const LESSON = window.KANA_SPRINT_LESSON;
  if (!LESSON) throw new Error("Kana Sprint lesson data was not loaded.");
  const MNEMONIC_ASSETS = window.KANA_SPRINT_MNEMONIC_ASSETS || {};

  document.title = LESSON.appName + " — Adaptive Trainer";
  const APP_MARKUP = "<div class=\"wrap\">\n  <header>\n    <div>\n      <h1>{{APP_NAME}}</h1>\n      <p class=\"subtitle\">Type-first adaptive {{SCRIPT_LOWER}} practice with varied fonts, targeted review, and word-meaning reinforcement.</p>\n    </div>\n    <div class=\"pill\">Standalone • offline • auto-saved</div>\n  </header>\n\n  <section class=\"stats\">\n    <div class=\"stat\"><strong id=\"sMastered\">0</strong><span>mastered kana</span></div>\n    <div class=\"stat\"><strong id=\"sAccuracy\">—</strong><span>overall accuracy</span></div>\n    <div class=\"stat\"><strong id=\"sStreak\">0</strong><span>current streak</span></div>\n    <div class=\"stat\"><strong id=\"sWeak\">0</strong><span>weak / due kana</span></div>\n  </section>\n\n  <nav class=\"tabs\">\n    <button class=\"tab active\" data-tab=\"learn\">Learn</button>\n    <button class=\"tab\" data-tab=\"rehearse\">Rehearse</button>\n    <button class=\"tab\" data-tab=\"words\">Words</button>\n    <button class=\"tab\" data-tab=\"fonts\">Fonts</button>\n    <button class=\"tab\" data-tab=\"kanaprogress\">Kana Progress</button>\n    <button class=\"tab\" data-tab=\"wordprogress\">Word Progress</button>\n  </nav>\n\n  <section class=\"panel active\" id=\"panel-learn\">\n    <div class=\"trainer\" data-trainer=\"learn\">\n      <div class=\"trainer-top\">\n        <div class=\"mode-tag\"><span class=\"dot\"></span><span id=\"learnMode\">Learn • adaptive rows</span></div>\n        <div class=\"tiny\" id=\"learnCount\">Question 1</div>\n      </div>\n      <div class=\"question\">\n        <div class=\"question-label\">Type the romaji reading <span class=\"font-note\" id=\"learnFontNote\">Standard font</span></div>\n        <div class=\"prompt\" id=\"learnPrompt\">あ</div>\n      </div>\n      <div class=\"typing\">\n        <input id=\"learnInput\" class=\"answer-input\" autocomplete=\"off\" autocapitalize=\"off\" spellcheck=\"false\" placeholder=\"Type the reading and press Enter\" />\n        <div class=\"typing-hint\">A hard-font mistake shows the standard form for one retry. Another mistake opens rescue choices.</div>\n      </div>\n      <div class=\"feedback\" id=\"learnFeedback\"></div>\n      <div class=\"rescue-wrap\" id=\"learnRescue\"><div class=\"rescue-title\">Choose the correct reading to reinforce the mistake</div><div class=\"options\" id=\"learnOptions\"></div></div>\n      <div class=\"footer-actions\">\n        <div class=\"actions\"><button class=\"ghost\" id=\"learnDontKnow\">I don't know</button><button class=\"ghost hidden\" id=\"learnNext\">Next <kbd>Enter</kbd></button></div>\n        <div style=\"display:flex;align-items:center;gap:10px\"><span class=\"tiny\" id=\"learnProgressText\">Unlocked mastery</span><div class=\"progressbar\"><span id=\"learnProgress\"></span></div></div>\n      </div>\n    </div>\n    <div class=\"callout\">Learn mode unlocks rows gradually. Rows can also unlock independently when Rehearse demonstrates that you already know every kana in that row.</div>\n  </section>\n\n  <section class=\"panel\" id=\"panel-rehearse\">\n    <div class=\"trainer\" data-trainer=\"rehearse\">\n      <div class=\"trainer-top\">\n        <div class=\"mode-tag\"><span class=\"dot\"></span><span>Rehearse • selected rows</span></div>\n        <div class=\"tiny\" id=\"rehearseCount\">Question 1</div>\n      </div>\n      <div class=\"question\">\n        <div class=\"question-label\">Type the romaji reading <span class=\"font-note\" id=\"rehearseFontNote\">Standard font</span></div>\n        <div class=\"prompt\" id=\"rehearsePrompt\">あ</div>\n      </div>\n      <div class=\"typing\">\n        <input id=\"rehearseInput\" class=\"answer-input\" autocomplete=\"off\" autocapitalize=\"off\" spellcheck=\"false\" placeholder=\"Type the reading and press Enter\" />\n        <div class=\"typing-hint\">Hard font mistake → compare with standard → retry once → rescue choices if still wrong.</div>\n      </div>\n      <div class=\"feedback\" id=\"rehearseFeedback\"></div>\n      <div class=\"rescue-wrap\" id=\"rehearseRescue\"><div class=\"rescue-title\">Choose the correct reading</div><div class=\"options\" id=\"rehearseOptions\"></div></div>\n      <div class=\"footer-actions\">\n        <div class=\"actions\"><button class=\"ghost\" id=\"rehearseDontKnow\">I don't know</button><button class=\"ghost hidden\" id=\"rehearseNext\">Next <kbd>Enter</kbd></button></div>\n        <span class=\"tiny\">Keyboard: <kbd>1</kbd>–<kbd>8</kbd> for rescue choices</span>\n      </div>\n    </div>\n\n    <div class=\"rehearse-status\">\n      <div class=\"rehearse-status-main\"><strong id=\"rehearseSetName\">All basic</strong><span id=\"rehearseSetSummary\">0 kana selected</span></div>\n      <div><div class=\"tiny\"><span id=\"assessedCount\">0</span> assessed · <span id=\"rehearseWeakCount\">0</span> weak in this set</div><div class=\"tiny\"><span id=\"rehearseAnswerTotal\">0</span> total rehearsal answers · <span id=\"rehearseUniqueTotal\">0</span> unique kana overall</div></div>\n    </div>\n\n    <div class=\"grid2\">\n      <details class=\"details-card\" id=\"rehearseSetPanel\">\n        <summary><span id=\"rehearseSetHeading\">Change rehearsal set</span></summary>\n        <div class=\"details-body\">\n        <p class=\"muted\">For material you have already studied. Selected rows are available immediately—no unlocking required.</p>\n        <div class=\"actions\" style=\"margin-bottom:10px\">\n          <button class=\"ghost\" id=\"selectBasic\">Select all basic</button>\n          <button class=\"ghost\" id=\"selectAll\">Select everything</button>\n          <button class=\"ghost\" id=\"clearRows\">Clear</button>\n        </div>\n        <div id=\"rehearseSelectors\"></div>\n        </div>\n      </details>\n      <details class=\"details-card\" id=\"rehearseHelpPanel\">\n        <summary>How rehearsal adapts</summary>\n        <div class=\"details-body\">\n        <p class=\"muted\">Until every selected kana is assessed, 65% of normal questions introduce unseen kana and one is guaranteed after four review questions. After full coverage, review becomes fully adaptive. Recent difficulty can increase a sound category up to 2×. Harder fonts award up to 1.35× mastery for a correct first attempt. A hard-font mistake gives you one standard-form retry before the rescue choices appear.</p>\n        <div class=\"session-summary\">\n          <div class=\"mini\"><strong id=\"selectedCount\">0</strong><span class=\"tiny\">selected kana</span></div>\n          <div class=\"mini\"><strong id=\"assessedCountDetail\">0</strong><span class=\"tiny\">already assessed</span></div>\n          <div class=\"mini\"><strong id=\"rehearseWeakCountDetail\">0</strong><span class=\"tiny\">weak in selection</span></div>\n        </div>\n        </div>\n      </details>\n    </div>\n  </section>\n\n  <section class=\"panel\" id=\"panel-words\">\n    <div class=\"grid2\" style=\"margin-bottom:14px\">\n      <div class=\"card\">\n        <h2>Word reading</h2>\n        <p class=\"muted\">Read whole {{SCRIPT_LOWER}} words instead of isolated characters. The vocabulary here is supplemental beginner practice.</p>\n        <div class=\"word-settings\">\n          <button class=\"seg active\" data-wordset=\"learned\">Learned kana only</button>\n          <button class=\"seg\" data-wordset=\"basic\">All basic</button>\n          <button class=\"seg\" data-wordset=\"all\">All available words</button>\n        </div>\n      </div>\n      <div class=\"card\">\n        <h2>Speech</h2>\n        <div class=\"speech-status\" id=\"speechStatus\"><span class=\"speech-dot\"></span><div><strong id=\"speechStatusTitle\">Checking speech voices…</strong><div class=\"tiny\" id=\"speechStatusDetail\">Your browser will report whether Japanese pronunciation is available.</div></div></div>\n        <div class=\"speech-controls\">\n          <label class=\"toggle-line\"><input type=\"checkbox\" id=\"speechAuto\"> Automatically pronounce recognized words</label>\n          <label class=\"toggle-line\"><input type=\"checkbox\" id=\"speechMeaning\"> Also pronounce the English meaning</label>\n          <label class=\"tiny\" for=\"speechRate\">Speed</label>\n          <select id=\"speechRate\"><option value=\"0.75\">Slow</option><option value=\"0.85\">Clear</option><option value=\"1\">Normal</option></select>\n          <label class=\"tiny\" for=\"japaneseVoice\">Japanese voice</label>\n          <select id=\"japaneseVoice\"></select>\n          <label class=\"tiny\" for=\"englishVoice\">English voice</label>\n          <select id=\"englishVoice\"></select>\n          <div class=\"actions\"><button class=\"ghost\" id=\"testJapaneseSpeech\">Test Japanese voice</button><button class=\"ghost\" id=\"testEnglishSpeech\">Test English voice</button></div>\n        </div>\n      </div>\n    </div>\n\n    <div class=\"trainer\" data-trainer=\"words\">\n      <div class=\"trainer-top\">\n        <div class=\"mode-tag\"><span class=\"dot\"></span><span>Words • typed reading</span></div>\n        <div class=\"tiny\" id=\"wordsCount\">Question 1</div>\n      </div>\n      <div class=\"question\">\n        <div class=\"question-label\">Read this word in romaji <span class=\"font-note\" id=\"wordsFontNote\">Standard • selected globally</span></div>\n        <div class=\"prompt word\" id=\"wordsPrompt\">ねこ</div>\n      </div>\n      <div class=\"typing\">\n        <input id=\"wordsInput\" class=\"answer-input\" autocomplete=\"off\" autocapitalize=\"off\" spellcheck=\"false\" placeholder=\"Type the word in romaji and press Enter\" />\n        <div class=\"typing-hint\">Correct recognition reveals the meaning. Press Enter again for the next word.</div>\n      </div>\n      <div class=\"feedback\" id=\"wordsFeedback\"></div>\n      <div class=\"rescue-wrap\" id=\"wordsRescue\"><div class=\"rescue-title\">Choose the correct reading</div><div class=\"options\" id=\"wordsOptions\"></div></div>\n      <div class=\"footer-actions\">\n        <div class=\"actions\"><button class=\"ghost\" id=\"wordsDontKnow\">I don't know</button><button class=\"ghost hidden\" id=\"wordsNext\">Next <kbd>Enter</kbd></button></div>\n        <span class=\"tiny\">Correct word answers give a small amount of supporting evidence to their kana.</span>\n      </div>\n    </div>\n  </section>\n\n  <section class=\"panel\" id=\"panel-fonts\">\n    <div class=\"card\">\n      <h2>Practice fonts</h2>\n      <p class=\"muted\">Standard is always enabled and remains the correction reference. Select any additional fonts to use across Learn, Rehearse, and Words. All difficult fonts are selected by default.</p>\n      <div class=\"font-picker\" id=\"fontSelectors\"></div>\n    </div>\n    <div class=\"card\" style=\"margin-top:14px\">\n      <h2>Full kana comparison</h2>\n      <p class=\"muted\">Each row shows the same kana across every font. Dimmed columns are available for comparison but will not appear in practice.</p>\n      <div class=\"font-table-wrap\"><table class=\"font-table\" id=\"fontComparison\"></table></div>\n    </div>\n  </section>\n\n  <section class=\"panel\" id=\"panel-kanaprogress\">\n    <div class=\"grid2\">\n      <div class=\"card\">\n        <h2>Progress & backup</h2>\n        <div class=\"save-status\"><span class=\"save-dot\"></span><div><strong>Progress is auto-saved locally</strong><div class=\"tiny\" id=\"lastSaved\">Not saved yet</div></div></div>\n        <p class=\"muted\">Export a portable JSON backup whenever you want. Importing restores mastery, mistakes, confusion pairs, settings, and rehearsal selections.</p>\n        <div class=\"actions\">\n          <button class=\"big-button\" id=\"exportProgress\">Export progress</button>\n          <button class=\"ghost\" id=\"importProgressBtn\">Import progress</button>\n          <input id=\"importProgressFile\" type=\"file\" accept=\".json,application/json\" class=\"hidden\" />\n          <button class=\"ghost danger\" id=\"resetProgress\">Reset everything</button>\n        </div>\n        <div class=\"callout\" id=\"importStatus\">Tip: keep the exported JSON next to this HTML if you want an easy manual backup between computers or browsers.</div>\n      </div>\n      <div class=\"card\">\n        <h2>Learn curriculum</h2>\n        <p class=\"muted\">Learn unlocks rows in sequence, while Rehearse can unlock any row by demonstrating prior knowledge. The tags show which path unlocked each row.</p>\n        <div class=\"rows\" id=\"curriculumRows\"></div>\n      </div>\n    </div>\n\n    <div class=\"grid2\" style=\"margin-top:14px\">\n      <div class=\"card\">\n        <h2>Weak kana</h2>\n        <div class=\"trouble-list\" id=\"troubleList\"></div>\n      </div>\n      <div class=\"card\">\n        <h2>Common confusions</h2>\n        <p class=\"muted\">Wrong typed answers and wrong rescue selections build these pairs.</p>\n        <div class=\"confusions\" id=\"confusionList\"></div>\n      </div>\n    </div>\n    <div class=\"card\" style=\"margin-top:14px\">\n      <h2>Font recognition</h2>\n      <p class=\"muted\">Varied-font results are tracked separately. Learn introduces them after a kana is familiar; Rehearse mixes them immediately.</p>\n      <div class=\"font-stats\" id=\"fontRecognition\"></div>\n    </div>\n  </section>\n\n  <section class=\"panel\" id=\"panel-wordprogress\">\n    <div class=\"grid2\">\n      <div class=\"card\">\n        <h2>Word progress</h2>\n        <p class=\"muted\">These totals use the word set currently selected in Word mode. Detailed answers stay here, away from the active question.</p>\n        <div class=\"session-summary\">\n          <div class=\"mini\"><strong id=\"wordPoolCount\">0</strong><span class=\"tiny\">words in pool</span></div>\n          <div class=\"mini\"><strong id=\"wordSeen\">0</strong><span class=\"tiny\">total word answers</span></div>\n          <div class=\"mini\"><strong id=\"wordUnique\">0</strong><span class=\"tiny\">unique words assessed</span></div>\n          <div class=\"mini\"><strong id=\"wordUnseen\">0</strong><span class=\"tiny\">unseen in this pool</span></div>\n          <div class=\"mini\"><strong id=\"wordWeak\">0</strong><span class=\"tiny\">weak words</span></div>\n          <div class=\"mini\"><strong id=\"wordMastered\">0</strong><span class=\"tiny\">mastered words</span></div>\n        </div>\n        <div class=\"tiny\" id=\"wordAccuracy\" style=\"margin-top:9px\">Word accuracy: —</div>\n      </div>\n      <div class=\"card\">\n        <h2>Recent feature performance</h2>\n        <p class=\"muted\">Accuracy over the latest 30 answers in each feature. Lower accuracy makes that feature appear more often.</p>\n        <div class=\"feature-grid\" id=\"wordFeatureProgress\"></div>\n      </div>\n    </div>\n    <div class=\"grid2\" style=\"margin-top:14px\">\n      <div class=\"card\">\n        <h2>Weak words</h2>\n        <p class=\"muted\">Ranked by low mastery, recent mistakes, and accuracy within the current word set.</p>\n        <div class=\"trouble-list\" id=\"weakWordList\"></div>\n      </div>\n      <div class=\"card\">\n        <h2>Strongest words</h2>\n        <p class=\"muted\">The most secure words in the current set.</p>\n        <div class=\"trouble-list\" id=\"strongWordList\"></div>\n      </div>\n    </div>\n  </section>\n</div>";
  document.body.innerHTML = APP_MARKUP
    .replaceAll("{{APP_NAME}}", LESSON.appName)
    .replaceAll("{{SCRIPT_LOWER}}", LESSON.scriptNameLower)
    .replaceAll("あ", LESSON.sampleKana)
    .replaceAll("ねこ", LESSON.sampleWord);

  const streakStat=document.querySelector("#sStreak").closest(".stat");
  streakStat.id="streakStat";
  streakStat.classList.add("streak-stat");
  const streakGuide=(scope,description)=>`<div class="card streak-progress-card" style="margin-top:14px">
    <div class="streak-progress-heading"><div><h2>Streak milestones</h2><p class="muted">${description}</p></div><div class="streak-record"><strong id="${scope}StreakCurrent">0</strong><span>current</span><strong id="${scope}StreakBest">0</strong><span>best</span></div></div>
    <div class="streak-tier-guide" aria-label="Streak highlight levels"><span>0–4<br><small>Standard</small></span><span class="tier-1">5–14<br><small>Spark</small></span><span class="tier-2">15–24<br><small>Warming up</small></span><span class="tier-3">25–49<br><small>Soft amber</small></span><span class="tier-4">50–74<br><small>Amber glow</small></span><span class="tier-5">75–99<br><small>Bright gold</small></span><span class="tier-6">100–149<br><small>Orange fire</small></span><span class="tier-7">150–199<br><small>Fiery glow</small></span><span class="tier-8">200+<br><small>Legendary</small></span></div>
  </div>`;
  document.querySelector("#panel-kanaprogress > .grid2").insertAdjacentHTML("afterend",streakGuide("kana","The streak box gains a stronger highlight as consecutive correct answers build up. A mistake resets the current streak without a negative animation."));
  document.querySelector("#panel-wordprogress > .grid2").insertAdjacentHTML("afterend",streakGuide("word","Word answers and kana answers share one live streak. Keep recognizing correctly to strengthen the highlight."));
  document.querySelector("#speechMeaning").closest("label").insertAdjacentHTML("afterend",`<label class="toggle-line"><input type="checkbox" id="speechContinue"> Let pronunciation finish after moving to the next word</label>`);

  const mnemonicTab=document.createElement("button");
  mnemonicTab.className="tab";mnemonicTab.dataset.tab="mnemonics";mnemonicTab.textContent="Mnemonics";
  document.querySelector('.tab[data-tab="fonts"]').before(mnemonicTab);
  const mnemonicPanel=document.createElement("section");
  mnemonicPanel.className="panel";mnemonicPanel.id="panel-mnemonics";
  mnemonicPanel.innerHTML=`<div class="card"><div class="mnemonic-heading"><div><h2>Kana mnemonics</h2><p class="muted">Each card offers two separate memory aids: sourced visual artwork and a prefilled text mnemonic you can edit. They may use different stories for the same kana.</p></div><label class="mnemonic-filter"><span>Show</span><select id="mnemonicFilter"><option value="all">All kana</option><option value="weak">Weak kana</option><option value="assisted">Used a hint</option><option value="mistakes">Mistaken kana</option><option value="custom">My custom mnemonics</option></select></label></div><div class="callout">Learn introduces a new kana with its full mnemonic before testing it. An optional visual hint awards 40% of normal mastery on a standard-font question or 25% when it also supplies the standard form for a difficult font. Full answer mnemonics award no mastery. Every introduction, hint, and rescue schedules a short unaided recall check.</div><div class="mnemonic-grid" id="mnemonicGrid"></div></div>`;
  document.querySelector("#panel-fonts").before(mnemonicPanel);
  ["learn","rehearse"].forEach(mode=>{
    const button=document.createElement("button");
    button.className="ghost mnemonic-hint";button.id=mode+"Mnemonic";button.textContent="Need a mnemonic?";
    document.querySelector(`#panel-${mode} .footer-actions .actions`).appendChild(button);
  });
  document.querySelector("#panel-kanaprogress .save-status").insertAdjacentHTML("afterend",'<div class="tiny assisted-summary"><strong id="assistedRecognitionCount">0</strong> assisted recognitions</div>');
  document.querySelector("#panel-kanaprogress .font-stats").previousElementSibling.textContent="Font exposure includes every form you saw. Accuracy uses only unaided graded attempts. Learn waits for familiarity, while Rehearse uses Standard until the first unaided correct recognition.";

  [
    {mode:"learn",title:"New kana pace",label:"How often Learn presents a new kana and mnemonic from the unlocked rows."},
    {mode:"rehearse",title:"Coverage pace",label:"How quickly Rehearse assesses unseen kana from the selected rows."},
    {mode:"words",title:"New word pace",label:"How often Word mode introduces a word you have not assessed yet."}
  ].forEach(config=>{
    const control=document.createElement("div");
    control.className="pace-control";
    control.innerHTML=`<div class="pace-copy"><strong>${config.title}</strong><span>${config.label}</span><span class="pace-description" id="${config.mode}PaceDescription"></span></div><label class="pace-range" for="${config.mode}Pace"><span id="${config.mode}PaceValue">Balanced</span><input id="${config.mode}Pace" type="range" min="0" max="6" step="1" value="2" aria-label="${config.title}"><span class="pace-scale"><span>More review</span><span>More new</span></span></label>`;
    document.querySelector(`#panel-${config.mode} .trainer`).before(control);
  });
  document.querySelector("#rehearseHelpPanel .muted").textContent="Until every selected kana has a graded recall attempt, the Coverage pace controls how often unassessed kana appear and prevents ordinary reviews from starving them. Their first successful recognition uses Standard; difficult fonts become eligible afterwards. Scheduled mistake and mnemonic-recall checks take priority. After full coverage, review becomes fully adaptive.";

  if(Array.isArray(LESSON.scriptBalanceProfiles)&&LESSON.scriptBalanceProfiles.length){
    const balance=document.createElement("div");balance.className="card mix-balance";balance.id="scriptBalancePanel";
    balance.innerHTML=`<div><h2>Script balance</h2><p class="muted">Control how often each script appears across Learn, Rehearse, and Words.</p></div><div class="mix-balance-controls"><div class="word-settings" id="scriptBalanceButtons"></div><label class="mix-range hidden" id="scriptBalanceRange"><span><strong id="hiraganaShareLabel">50%</strong> Hiragana · <strong id="katakanaShareLabel">50%</strong> Katakana</span><input id="hiraganaShare" type="range" min="10" max="90" step="5" value="50"></label></div>`;
    document.querySelector(".rehearse-status").before(balance);
  }

  const STORAGE_KEY = LESSON.storageKey;
  const FONT_PROFILES = LESSON.fontProfiles;
  const STANDARD_FONT=FONT_PROFILES[0];
  const GROUPS = LESSON.groups;
  const VISUAL = LESSON.visualConfusions;
  const WORDS = LESSON.words.map(word=>({...word}));
  const EXTRA_WORDS = LESSON.extraWords.map(word=>({...word}));
  WORDS.push(...EXTRA_WORDS);

  const allItems=[], byKana={}, groupByKana={};
  GROUPS.forEach((g,gi)=>g.items.forEach(([k,r])=>{
    const item={k,r,group:g.id,groupIndex:gi,script:LESSON.scriptForKana?LESSON.scriptForKana(k):LESSON.scriptNameLower};
    allItems.push(item); byKana[k]=item; groupByKana[k]=gi;
  }));

  const SMALL_TSU=Array.isArray(LESSON.smallTsuList)?LESSON.smallTsuList:[LESSON.smallTsu];
  const KANA_PACE_PROFILES=[
    {label:"Review-heavy",share:.15,guarantee:10},
    {label:"Gentle",share:.30,guarantee:7},
    {label:"Balanced",share:.45,guarantee:5},
    {label:"Fast",share:.65,guarantee:4},
    {label:"Rapid coverage",share:.80,guarantee:2},
    {label:"Very fast",share:.90,guarantee:1},
    {label:"New-first",share:1,guarantee:0}
  ];
  const MAX_KANA_PACE_INDEX=KANA_PACE_PROFILES.length-1;
  const P_ROW_INDEX=GROUPS.findIndex(group=>group.id==="p");
  const WORD_PACE_PROFILES=[
    {label:"Review-heavy",early:.25,late:.10,guarantee:10},
    {label:"Gentle",early:.40,late:.15,guarantee:7},
    {label:"Balanced",early:.60,late:.20,guarantee:5},
    {label:"Fast",early:.75,late:.30,guarantee:4},
    {label:"Rapid coverage",early:.85,late:.40,guarantee:2},
    {label:"Very fast",early:.92,late:.65,guarantee:1},
    {label:"New-first",early:1,late:1,guarantee:0}
  ];

  function splitWordKana(kana){
    const chars=[...kana],units=[];
    for(let i=0;i<chars.length;i++){
      const combo=chars[i]+(chars[i+1]||"");
      if(byKana[combo]){units.push(combo);i++}else units.push(chars[i]);
    }
    return units;
  }

  function wordFeatureLabels(word){
    const labels=[...new Set(word.u.map(k=>byKana[k]).filter(Boolean).map(itemPhase))];
    if(SMALL_TSU.some(k=>word.units.includes(k)))labels.push(LESSON.smallTsuFeature);
    if(/ou|uu|oo|aa|ii/.test(word.r))labels.push("Long vowels");
    if(word.units.length>=5)labels.push("Long words");
    return [...new Set(labels)];
  }

  WORDS.forEach(word=>{
    word.units=splitWordKana(word.k);
    word.u=[...new Set(word.units.filter(k=>byKana[k]))];
    word.script=LESSON.scriptForKana?LESSON.scriptForKana(word.k):LESSON.scriptNameLower;
    word.a=Array.isArray(word.a)?word.a:[];
    word.features=wordFeatureLabels(word);
    word.difficulty=Math.min(5,1+(word.units.length>=4?1:0)+(word.features.includes("Voiced")||word.features.includes("Semi-voiced")?1:0)+(word.features.includes("Combinations")?1:0)+(word.features.includes(LESSON.smallTsuFeature)||word.features.includes("Long vowels")?1:0));
  });

  function defaultRehearseGroups(){
    const ids={}; GROUPS.forEach(g=>ids[g.id]=g.phase==="Basic"); return ids;
  }

  function defaultFontSelections(){
    const selected={};FONT_PROFILES.forEach(font=>selected[font.id]=true);return selected;
  }

  function defaultState(){
    return {
      version:LESSON.progressVersion,
      learnUnlockedCount:LESSON.initialLearnUnlockedCount,
      stats:{answered:0,correct:0,assisted:0,streak:0,bestStreak:0},
      wordStats:{seen:0,correct:0},
      wordItems:{},
      wordFeatureHistory:{},
      phaseHistory:{Basic:[],Voiced:[],"Semi-voiced":[],Combinations:[]},
      learnRowHistory:{},
      items:{},
      rehearseItems:{},
      groupUnlockSource:{},
      rehearseGroups:defaultRehearseGroups(),
      selectedFonts:defaultFontSelections(),
      rehearseSetOpen:false,
      rehearseHelpOpen:false,
      wordSet:"learned",
      speech:{autoPlay:true,speakMeaning:true,continueOnAdvance:false,rate:.85,jaVoice:"",enVoice:""},
      scriptBalance:LESSON.defaultScriptBalance||"adaptive",
      hiraganaShare:50,
      pace:{learn:2,rehearse:3,words:2},
      customMnemonics:{},
      assistedAccountingV2:true,
      savedAt:0
    };
  }

  let state=loadState();
  let currentTab="learn";
  const INACTIVITY_MS=2*60*1000;
  function newPracticeSession(){
    return {n:0,current:null,currentFont:STANDARD_FONT,lastFonts:[],lastScripts:[],fontRetry:false,rescue:false,introduction:false,mnemonicUsed:false,mnemonicStage:0,typingRetryOffered:false,typingRetryTimer:null,last:[],forced:{},sinceUnseen:0,lastActivityAt:Date.now(),resumeGrace:0,forcedReason:"",forceStandard:false};
  }
  const sessions={
    learn:newPracticeSession(),
    rehearse:newPracticeSession(),
    words:newPracticeSession()
  };

  const $=s=>document.querySelector(s);

  function loadState(){
    const fallback=defaultState();
    if(typeof LESSON.loadProgress==="function"){
      try{return LESSON.loadProgress(fallback)||fallback}catch(e){console.warn("Could not load shared kana progress.",e);return fallback}
    }
    try{
      const raw=localStorage.getItem(STORAGE_KEY);
      if(raw){
        const x=JSON.parse(raw);
        if(x && x.version===LESSON.progressVersion) return x;
      }
    }catch(e){}
    return fallback;
  }

  function ensureStateShape(){
    if(!state.stats) state.stats={answered:0,correct:0,streak:0,bestStreak:0};
    if(!Number.isFinite(state.stats.assisted))state.stats.assisted=0;
    if(!state.wordStats) state.wordStats={seen:0,correct:0};
    if(!state.wordItems) state.wordItems={};
    if(!state.wordFeatureHistory)state.wordFeatureHistory={};
    if(!state.phaseHistory) state.phaseHistory={};
    if(!state.learnRowHistory||typeof state.learnRowHistory!=="object")state.learnRowHistory={};
    ["Basic","Voiced","Semi-voiced","Combinations"].forEach(phase=>{
      if(!Array.isArray(state.phaseHistory[phase])) state.phaseHistory[phase]=[];
      state.phaseHistory[phase]=state.phaseHistory[phase].slice(-30);
    });
    if(!state.items) state.items={};
    if(!state.assistedAccountingV2){
      const legacyAssisted=Object.values(state.items).reduce((sum,item)=>sum+(Number(item&&item.assistedCorrect)||0),0);
      state.stats.assisted=Math.max(state.stats.assisted||0,legacyAssisted);
      state.stats.answered=Math.max(0,(state.stats.answered||0)-legacyAssisted);
      state.stats.correct=Math.max(0,(state.stats.correct||0)-legacyAssisted);
      state.assistedAccountingV2=true;
    }
    if(!state.rehearseItems) state.rehearseItems={};
    if(!state.groupUnlockSource) state.groupUnlockSource={};
    if(!state.rehearseGroups) state.rehearseGroups=defaultRehearseGroups();
    if(!state.selectedFonts)state.selectedFonts=defaultFontSelections();
    FONT_PROFILES.forEach(font=>{if(typeof state.selectedFonts[font.id]!=="boolean")state.selectedFonts[font.id]=true});
    state.selectedFonts.standard=true;
    if(typeof state.rehearseSetOpen!=="boolean") state.rehearseSetOpen=false;
    if(typeof state.rehearseHelpOpen!=="boolean") state.rehearseHelpOpen=false;
    if(!state.wordSet) state.wordSet="learned";
    if(!state.speech)state.speech={autoPlay:true,speakMeaning:true,continueOnAdvance:false,rate:.85,jaVoice:"",enVoice:""};
    if(typeof state.speech.autoPlay!=="boolean")state.speech.autoPlay=true;
    if(typeof state.speech.speakMeaning!=="boolean")state.speech.speakMeaning=true;
    if(typeof state.speech.continueOnAdvance!=="boolean")state.speech.continueOnAdvance=false;
    if(![.75,.85,1].includes(Number(state.speech.rate)))state.speech.rate=.85;
    if(typeof state.speech.jaVoice!=="string")state.speech.jaVoice="";
    if(typeof state.speech.enVoice!=="string")state.speech.enVoice="";
    if(!state.scriptBalance)state.scriptBalance=LESSON.defaultScriptBalance||"adaptive";
    if(!Number.isFinite(Number(state.hiraganaShare)))state.hiraganaShare=50;
    if(!state.pace)state.pace={learn:2,rehearse:3,words:2};
    if(!state.customMnemonics||typeof state.customMnemonics!=="object")state.customMnemonics={};
    [["learn",2],["rehearse",3],["words",2]].forEach(([mode,fallback])=>{
      const value=Number(state.pace[mode]);
      state.pace[mode]=Number.isFinite(value)?Math.max(0,Math.min(6,Math.round(value))):fallback;
    });
    if(!Number.isFinite(state.learnUnlockedCount)) state.learnUnlockedCount=5;
  }
  ensureStateShape();

  const speechSupported="speechSynthesis" in window&&"SpeechSynthesisUtterance" in window;
  let speechVoices=[];
  let speechRun=0;

  function voicesFor(language){
    return speechVoices.filter(voice=>String(voice.lang||"").toLowerCase().startsWith(language));
  }

  function voiceKey(voice){return voice.voiceURI||voice.name}
  function matchesSavedVoice(voice,saved){return voiceKey(voice)===saved||voice.name===saved}

  function fillVoiceSelect(selector,voices,chosen,emptyLabel){
    const select=$(selector);select.innerHTML="";
    if(!voices.length){
      const option=document.createElement("option");option.textContent=emptyLabel;option.value="";select.appendChild(option);select.disabled=true;return chosen;
    }
    select.disabled=false;
    voices.forEach(voice=>{
      const option=document.createElement("option");option.value=voiceKey(voice);
      option.textContent=`${voice.name} (${voice.localService?"local":"online"})`;
      select.appendChild(option);
    });
    const savedVoice=voices.find(voice=>matchesSavedVoice(voice,chosen));
    const selected=voiceKey(savedVoice||voices.find(voice=>voice.default)||voices.find(voice=>voice.localService)||voices[0]);
    select.value=selected;return selected;
  }

  function renderSpeechControls(){
    $("#speechAuto").checked=state.speech.autoPlay;
    $("#speechMeaning").checked=state.speech.speakMeaning;
    $("#speechContinue").checked=state.speech.continueOnAdvance;
    $("#speechRate").value=String(state.speech.rate);
    const status=$("#speechStatus");status.classList.remove("ready","unavailable");
    if(!speechSupported){
      status.classList.add("unavailable");$("#speechStatusTitle").textContent="Speech is not supported";
      $("#speechStatusDetail").textContent="This browser cannot use built-in pronunciation.";
      ["#speechAuto","#speechMeaning","#speechContinue","#speechRate","#japaneseVoice","#englishVoice","#testJapaneseSpeech","#testEnglishSpeech"].forEach(id=>$(id).disabled=true);
      return;
    }
    const japanese=voicesFor("ja"),english=voicesFor("en");
    state.speech.jaVoice=fillVoiceSelect("#japaneseVoice",japanese,state.speech.jaVoice,"No Japanese voice found");
    state.speech.enVoice=fillVoiceSelect("#englishVoice",english,state.speech.enVoice,"No English voice found");
    $("#testJapaneseSpeech").disabled=!japanese.length;
    $("#testEnglishSpeech").disabled=!english.length;
    if(japanese.length){
      const chosen=japanese.find(voice=>matchesSavedVoice(voice,state.speech.jaVoice))||japanese[0];
      status.classList.add("ready");$("#speechStatusTitle").textContent="Japanese speech is ready";
      $("#speechStatusDetail").textContent=chosen.localService?"The selected Japanese voice works locally and should work offline.":"The selected Japanese voice may require an internet connection.";
    }else if(speechVoices.length){
      status.classList.add("unavailable");$("#speechStatusTitle").textContent="No Japanese voice found";
      $("#speechStatusDetail").textContent="Install a Japanese speech voice in your system, then reopen the app.";
    }else{
      $("#speechStatusTitle").textContent="Checking speech voices…";
      $("#speechStatusDetail").textContent="Your browser has not reported its available voices yet.";
    }
  }

  function refreshSpeechVoices(){
    if(!speechSupported){renderSpeechControls();return}
    speechVoices=window.speechSynthesis.getVoices();renderSpeechControls();
  }

  function selectedSpeechVoice(language){
    const name=language==="ja"?state.speech.jaVoice:state.speech.enVoice;
    return voicesFor(language).find(voice=>matchesSavedVoice(voice,name))||voicesFor(language)[0]||null;
  }

  function stopSpeech(){
    speechRun++;
    if(speechSupported)window.speechSynthesis.cancel();
  }

  function makeUtterance(text,language){
    const utterance=new SpeechSynthesisUtterance(text);
    utterance.lang=language==="ja"?"ja-JP":"en-US";
    utterance.rate=Number(state.speech.rate)||.85;
    const voice=selectedSpeechVoice(language);if(voice)utterance.voice=voice;
    return utterance;
  }

  function cleanMeaningForSpeech(meaning){
    return String(meaning||"").replace(/\//g," or ").replace(/[()]/g,", ").replace(/\s+/g," ").trim();
  }

  function speakWordSequence(word){
    if(!speechSupported||!voicesFor("ja").length)return;
    stopSpeech();const run=speechRun;
    const japanese=makeUtterance(word.k,"ja");
    japanese.onend=()=>{
      if(run!==speechRun||!state.speech.speakMeaning)return;
      setTimeout(()=>{
        if(run!==speechRun)return;
        window.speechSynthesis.speak(makeUtterance(`Meaning: ${cleanMeaningForSpeech(word.m)}`,"en"));
      },220);
    };
    window.speechSynthesis.speak(japanese);
  }

  function saveState(){
    state.savedAt=Date.now();
    localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
    if(typeof LESSON.saveProgress==="function"){
      try{LESSON.saveProgress(state)}catch(e){console.warn("Could not synchronize shared kana progress.",e)}
    }
    updateLastSaved();
  }

  function itemState(k){
    if(!state.items[k]) state.items[k]={seen:0,correct:0,wrong:0,mastery:0,streak:0,lastSeen:0,dueAt:0,lastWasCorrect:null,confusions:{},fontStats:{}};
    const s=state.items[k];
    if(!s.fontStats)s.fontStats={};
    if(!Number.isFinite(s.mnemonicViews))s.mnemonicViews=0;
    if(!Number.isFinite(s.assistedCorrect))s.assistedCorrect=0;
    if(!Number.isFinite(s.unaidedCorrect))s.unaidedCorrect=Math.max(0,(s.correct||0)-s.assistedCorrect);
    if(!Number.isFinite(s.unaidedSeen))s.unaidedSeen=Math.max(s.unaidedCorrect,(s.seen||0)-s.assistedCorrect);
    if(typeof s.introduced!=="boolean")s.introduced=(s.seen||0)>0;
    return s;
  }

  function fontState(item,fontId){
    const s=itemState(item.k);
    if(!s.fontStats[fontId])s.fontStats[fontId]={seen:0,correct:0,wrong:0};
    return s.fontStats[fontId];
  }

  function unaidedFontAttempts(fs){return (fs.correct||0)+(fs.wrong||0)}

  function isFontEnabled(font){
    return font.id==="standard"||state.selectedFonts[font.id]!==false;
  }

  function chooseKanaFont(item,mode,session){
    const s=itemState(item.k);
    if(session.forceStandard)return STANDARD_FONT;
    if(mode==="learn"&&s.mastery<55)return STANDARD_FONT;
    if(mode==="rehearse"&&s.unaidedCorrect<1)return STANDARD_FONT;
    const enabledVariants=FONT_PROFILES.slice(1).filter(isFontEnabled);
    if(!enabledVariants.length)return STANDARD_FONT;
    const variedChance=mode==="rehearse"?.8:Math.min(.75,.35+(s.mastery-55)/112.5);
    if(Math.random()>=variedChance)return STANDARD_FONT;
    let candidates=enabledVariants;
    const last=session.lastFonts[session.lastFonts.length-1];
    if(candidates.length>1)candidates=candidates.filter(f=>f.id!==last);
    return weightedPick(candidates,font=>{
      const fs=s.fontStats[font.id];
      if(!fs||!fs.seen)return 2.5;
      const attempts=unaidedFontAttempts(fs);
      return attempts?1+(fs.wrong/attempts)*3:2.5;
    });
  }

  function chooseWordFont(word,session){
    const enabledVariants=FONT_PROFILES.slice(1).filter(isFontEnabled);
    if(!enabledVariants.length||Math.random()>=.8)return STANDARD_FONT;
    let candidates=enabledVariants;
    const last=session.lastFonts[session.lastFonts.length-1];
    if(candidates.length>1)candidates=candidates.filter(font=>font.id!==last);
    return weightedPick(candidates,font=>{
      const results=word.u.map(k=>itemState(k).fontStats[font.id]).filter(Boolean);
      if(!results.length)return 2.5;
      const seen=results.reduce((sum,x)=>sum+x.seen,0),wrong=results.reduce((sum,x)=>sum+x.wrong,0);
      return seen?1+(wrong/seen)*3:2.5;
    });
  }

  function applyPromptFont(mode,font){
    const prompt=$("#"+mode+"Prompt");
    prompt.style.fontFamily=font.family;
    $("#"+mode+"FontNote").textContent=mode==="words"?`${font.label} • ${font.wordGainMultiplier.toFixed(2)}× word mastery`:`${font.label} • ${font.gainMultiplier.toFixed(2)}× mastery`;
  }

  function appendGlyphComparison(mode,item,font){
    const host=$("#"+mode+"Feedback .meta");
    if(!host)return;
    const compare=document.createElement("div");compare.className="glyph-compare";
    [[font.label+" question form",font],["Standard reference",STANDARD_FONT]].forEach(([label,profile])=>{
      const sample=document.createElement("div");sample.className="glyph-sample";
      const caption=document.createElement("span");caption.textContent=label;
      const glyph=document.createElement("strong");glyph.textContent=item.k;glyph.style.fontFamily=profile.family;
      sample.append(caption,glyph);compare.appendChild(sample);
    });
    host.appendChild(compare);
  }

  function builtInMnemonic(item){
    const direct=LESSON.mnemonics&&LESSON.mnemonics[item.k];
    if(direct)return direct;
    const characters=Array.from(item.k);
    const first=characters[0]||item.k;
    const plain=first.normalize("NFD").replace(/[\u3099\u309a]/g,"");
    const baseMnemonic=LESSON.mnemonics&&LESSON.mnemonics[plain];
    if(characters.length>1){
      const tail=characters.slice(1).join("");
      return `Start with ${first}${baseMnemonic?` — ${baseMnemonic}`:""} Add the small ${tail} and blend the sounds into “${item.r}.”`;
    }
    if(plain!==first){
      const mark=itemPhase(item)==="Semi-voiced"?"small circle":"two-stroke voice mark";
      return `${first} is ${plain} with a ${mark}. ${baseMnemonic||`Remember the shape of ${plain}.`} The mark changes the reading to “${item.r}.”`;
    }
    return `Trace the shape of ${item.k} while saying “${item.r}” aloud. Give the shape a personal image if this one keeps returning.`;
  }

  function mnemonicAsset(item){
    const asset=MNEMONIC_ASSETS[item.k];
    return asset&&typeof asset==="object"?asset:null;
  }

  function mnemonicCopy(item){
    const asset=mnemonicAsset(item);
    if(asset&&typeof asset.cue==="string"&&asset.cue.trim())return asset.cue.trim();
    return builtInMnemonic(item);
  }

  function mnemonicText(item){
    const custom=state.customMnemonics[item.k];
    return typeof custom==="string"&&custom.trim()?custom.trim():mnemonicCopy(item);
  }

  function shouldMaskTofuguAnswer(mode,kind,asset){
    return kind==="visual"&&(mode==="learn"||mode==="rehearse")&&Boolean(asset&&asset.source==="tofugu");
  }

  function sourceInfo(asset){
    if(!asset)return null;
    return asset.sourceInfo||null;
  }

  function ensureSourceDialog(){
    let dialog=$("#mnemonicSourceDialog");
    if(dialog)return dialog;
    dialog=document.createElement("dialog");dialog.id="mnemonicSourceDialog";dialog.className="mnemonic-source-dialog";
    dialog.innerHTML=`<div class="mnemonic-source-dialog-head"><h2>About this artwork</h2><button type="button" class="source-dialog-close" aria-label="Close source information">×</button></div><div class="mnemonic-source-dialog-body"><strong data-source-name></strong><span data-source-credit></span><p data-source-rights></p><a class="big-button" data-source-link target="_blank" rel="noopener noreferrer">Visit original source</a></div>`;
    dialog.querySelector(".source-dialog-close").addEventListener("click",()=>dialog.close());
    dialog.addEventListener("click",event=>{if(event.target===dialog)dialog.close()});
    document.body.appendChild(dialog);return dialog;
  }

  function showSourceDialog(asset){
    const info=sourceInfo(asset);if(!info)return;
    const dialog=ensureSourceDialog();
    dialog.querySelector("[data-source-name]").textContent=info.name;
    dialog.querySelector("[data-source-credit]").textContent=`Artwork credit: ${info.credit}`;
    dialog.querySelector("[data-source-rights]").textContent=info.rights;
    const link=dialog.querySelector("[data-source-link]");link.href=info.url;
    if(typeof dialog.showModal==="function")dialog.showModal();else link.click();
  }

  function createSourceAttribution(asset){
    const info=sourceInfo(asset);if(!info)return null;
    const footer=document.createElement("div");footer.className="mnemonic-source";
    const label=document.createElement("span");label.textContent=`Visual: ${info.credit}`;
    const button=document.createElement("button");button.type="button";button.className="mnemonic-source-info";button.textContent="i";button.setAttribute("aria-label",`About artwork from ${info.credit}`);button.title="About this artwork";
    button.addEventListener("click",()=>showSourceDialog(asset));footer.append(label,button);return footer;
  }

  function appendMnemonicCard(mode,item,label="Memory hook",kind="full"){
    const host=$("#"+mode+"Feedback .meta");if(!host)return;
    const card=document.createElement("div");card.className="mnemonic-card";
    const asset=mnemonicAsset(item),source=asset&&(kind==="visual"?asset.visual:asset.full),maskTofugu=shouldMaskTofuguAnswer(mode,kind,asset);
    const glyph=document.createElement("strong");glyph.className="mnemonic-glyph";glyph.textContent=item.k;glyph.style.fontFamily=STANDARD_FONT.family;
    const copy=document.createElement("div");copy.className="mnemonic-card-copy";
    const heading=document.createElement("span");heading.className="mnemonic-card-label";heading.textContent=kind==="visual"?`${label} • ${item.k}`:`${label} • ${item.k} = ${item.r}`;
    const textLabel=document.createElement("span");textLabel.className="mnemonic-text-label";textLabel.textContent="Alternative text mnemonic";
    const text=document.createElement("p");text.textContent=kind==="visual"&&source?"Study the shape and illustration, then type the reading you remember.":mnemonicText(item);
    copy.append(heading);
    if(!(kind==="visual"&&source))copy.append(textLabel);
    copy.append(text);
    if(source){
      const artColumn=document.createElement("div");artColumn.className="mnemonic-art-column";
      const art=document.createElement("div");art.className="mnemonic-card-art";
      if(maskTofugu){
        art.classList.add("tofugu-answer-mask");
        if(item.r==="fu")art.classList.add("tofugu-answer-mask-wide");
      }
      const image=document.createElement("img");image.src=source;image.loading="lazy";image.decoding="async";image.alt=kind==="visual"?`Visual mnemonic for ${item.k}`:`Full mnemonic for ${item.k} (${item.r})`;
      image.addEventListener("error",()=>{
        artColumn.remove();card.classList.remove("has-art",`is-${kind}`);text.textContent=mnemonicText(item);if(!textLabel.isConnected)copy.insertBefore(textLabel,text);card.prepend(glyph);
        const fallbackSession=sessions[mode];
        if(kind==="visual"&&fallbackSession&&fallbackSession.current===item&&fallbackSession.mnemonicStage===1){
          fallbackSession.mnemonicStage=2;
          const button=$("#"+mode+"Mnemonic");button.textContent="Answer mnemonic shown";button.disabled=true;
          const meta=$("#"+mode+"Feedback .meta");if(meta)meta.firstChild.textContent="The visual asset was unavailable, so the full text mnemonic is shown. It awards no mastery and schedules a short unaided recall check.";
        }
      });
      art.appendChild(image);artColumn.appendChild(art);
      const attribution=createSourceAttribution(asset);if(attribution)artColumn.appendChild(attribution);
      card.replaceChildren(artColumn,copy);card.classList.add("has-art",`is-${kind}`);
    }else card.append(glyph,copy);
    host.appendChild(card);
  }

  function showMnemonicHint(mode){
    const session=sessions[mode],item=session.current;
    if(!item||session.rescue||session.fontRetry||session.introduction||session.mnemonicStage>=2)return;
    session.mnemonicUsed=true;
    const s=itemState(item.k);s.mnemonicViews++;
    const hasVisual=Boolean(mnemonicAsset(item)?.visual);
    const difficult=(session.currentFont||STANDARD_FONT).id!=="standard";
    if(session.mnemonicStage===0&&hasVisual){
      session.mnemonicStage=1;
      const credit=difficult?25:40;
      const feedback=$("#"+mode+"Feedback");feedback.className="feedback show hint";feedback.innerHTML=`<strong>💡 Visual mnemonic hint</strong><div class="meta">This assisted answer can earn ${credit}% of normal mastery and will not affect accuracy or streak. Need the answer text? Ask again.</div>`;
      appendMnemonicCard(mode,item,"Visual clue","visual");
      if(difficult)appendGlyphComparison(mode,item,session.currentFont||STANDARD_FONT);
      const button=$("#"+mode+"Mnemonic");button.textContent="Show answer mnemonic";button.disabled=false;
    }else{
      session.mnemonicStage=2;
      const feedback=$("#"+mode+"Feedback");feedback.className="feedback show hint";feedback.innerHTML='<strong>💡 Answer mnemonic</strong><div class="meta">The answer is now shown, so this response awards no mastery and does not affect accuracy or streak. A short unaided recall check will follow.</div>';
      appendMnemonicCard(mode,item,"Answer mnemonic","full");
      if(difficult)appendGlyphComparison(mode,item,session.currentFont||STANDARD_FONT);
      $("#"+mode+"Mnemonic").textContent="Answer mnemonic shown";$("#"+mode+"Mnemonic").disabled=true;
    }
    saveState();const input=$("#"+mode+"Input");requestAnimationFrame(()=>input.focus({preventScroll:true}));
  }

  function confusionComparison(target,wrong){
    const voicedBase=target.k.normalize("NFD").replace(/[\u3099\u309a]/g,"");
    if(voicedBase===wrong.k||wrong.k.normalize("NFD").replace(/[\u3099\u309a]/g,"")===target.k)return `Watch the sound mark: ${target.k} is “${target.r},” while ${wrong.k} is “${wrong.r}.”`;
    return `Compare ${target.k} with ${wrong.k}. Trace the full shape and pay special attention to the final stroke and any loops.`;
  }

  function rehearseItemState(k){
    if(!state.rehearseItems[k])state.rehearseItems[k]={seen:0,correct:0,wrong:0,lastWasCorrect:null};
    return state.rehearseItems[k];
  }

  function isGroupUnlocked(groupIndex){
    const group=GROUPS[groupIndex];
    return groupIndex<state.learnUnlockedCount || state.groupUnlockSource[group.id]==="rehearsal";
  }

  function advancePastRehearsalUnlocks(){
    while(state.learnUnlockedCount<GROUPS.length&&state.groupUnlockSource[GROUPS[state.learnUnlockedCount].id]==="rehearsal"){
      state.learnUnlockedCount++;
    }
  }

  function maybeUnlockFromRehearsal(groupId){
    const group=GROUPS.find(g=>g.id===groupId);
    if(!group)return false;
    const groupIndex=GROUPS.indexOf(group);
    const results=group.items.map(([k])=>rehearseItemState(k));
    const demonstrated=results.every(s=>s.correct>=1);
    const seen=results.reduce((sum,s)=>sum+s.seen,0);
    const correct=results.reduce((sum,s)=>sum+s.correct,0);
    if(!demonstrated||!seen||correct/seen<.8)return false;
    if(!isGroupUnlocked(groupIndex))state.groupUnlockSource[group.id]="rehearsal";
    advancePastRehearsalUnlocks();
    return true;
  }

  function wordItemState(k){
    if(!state.wordItems[k]) state.wordItems[k]={seen:0,correct:0,wrong:0,mastery:0,streak:0,dueAt:0,lastSeen:0,lastWasCorrect:null,errorStreak:0};
    const s=state.wordItems[k];
    if(!Number.isFinite(s.mastery))s.mastery=Math.max(0,Math.min(100,(s.correct||0)*12-(s.wrong||0)*8));
    if(!Number.isFinite(s.streak))s.streak=0;
    if(!Number.isFinite(s.dueAt))s.dueAt=0;
    return s;
  }

  function randomInt(min,max){
    return Math.floor(Math.random()*(max-min+1))+min;
  }

  function mistakeReviewOffset(errorStreak){
    return errorStreak>1?randomInt(5,8):randomInt(7,11);
  }

  function noteSessionActivity(session){
    const now=Date.now();
    if(session.lastActivityAt&&now-session.lastActivityAt>=INACTIVITY_MS)session.resumeGrace=10;
    session.lastActivityAt=now;
  }

  function recordPhaseResult(phases,correct){
    [...new Set(phases)].forEach(phase=>{
      if(!state.phaseHistory[phase])state.phaseHistory[phase]=[];
      const score=typeof correct==="number"?Math.max(0,Math.min(1,correct)):(correct?1:0);
      state.phaseHistory[phase].push(score);
      if(state.phaseHistory[phase].length>30)state.phaseHistory[phase].shift();
    });
  }

  function recordWordFeatureResult(word,correct){
    word.features.forEach(feature=>{
      if(!state.wordFeatureHistory[feature])state.wordFeatureHistory[feature]=[];
      state.wordFeatureHistory[feature].push(correct?1:0);
      if(state.wordFeatureHistory[feature].length>30)state.wordFeatureHistory[feature].shift();
    });
  }

  function historyBoost(recent){
    if(!recent||!recent.length)return 1;
    const weakness=recent.reduce((sum,x)=>sum+(1-Number(x||0)),0);
    return weakness?1+Math.min(1,(weakness/recent.length)*2):1;
  }

  function phaseBoost(phase){
    const recent=state.phaseHistory[phase]||[];
    return historyBoost(recent);
  }

  function scriptBalanceWeight(entry,pool,session,stateFor){
    if(!Array.isArray(LESSON.scriptBalanceProfiles)||LESSON.scriptBalanceProfiles.length<2)return 1;
    const scripts=[...new Set(pool.map(x=>x.script).filter(Boolean))];
    if(scripts.length<2||!entry.script)return 1;
    const profile=LESSON.scriptBalanceProfiles.find(x=>x.id===state.scriptBalance)||LESSON.scriptBalanceProfiles[0];
    let shares={...(profile.shares||{})};
    if(profile.adaptive){
      const needs={};
      scripts.forEach(script=>{
        const entries=pool.filter(x=>x.script===script);
        needs[script]=entries.reduce((sum,x)=>{
          const s=stateFor(x);return sum+(100-(s.mastery||0))+(!s.seen?30:0)+(s.lastWasCorrect===false?25:0);
        },0)/Math.max(1,entries.length);
      });
      const total=scripts.reduce((sum,script)=>sum+needs[script],0)||scripts.length;
      scripts.forEach(script=>shares[script]=Math.max(.25,Math.min(.75,needs[script]/total)));
      const normalized=scripts.reduce((sum,script)=>sum+shares[script],0);
      scripts.forEach(script=>shares[script]/=normalized);
    }else if(profile.custom){
      shares.hiragana=Number(state.hiraganaShare)/100;
      shares.katakana=1-shares.hiragana;
    }
    const fallback=1/scripts.length;
    const recent=session.lastScripts||[];
    const observed=(recent.filter(script=>script===entry.script).length+1)/(recent.length+scripts.length);
    return Math.max(.35,Math.min(3,(shares[entry.script]||fallback)/observed));
  }

  function itemPhase(item){
    return GROUPS[item.groupIndex].phase;
  }

  function wordPhases(word){
    return [...new Set(word.u.map(k=>byKana[k]).filter(Boolean).map(itemPhase))];
  }

  function wordPhaseBoost(word){
    return Math.max(1,...wordPhases(word).map(phaseBoost));
  }

  function wordFeatureBoost(word){
    return Math.max(wordPhaseBoost(word),...word.features.map(feature=>historyBoost(state.wordFeatureHistory[feature])));
  }

  function isWeakKanaState(s){
    if(!s.seen || !s.wrong) return false;
    const accuracy=s.unaidedSeen?s.unaidedCorrect/s.unaidedSeen:0;
    return s.lastWasCorrect===false || s.mastery<55 || accuracy<.8;
  }

  function normalize(s){
    return String(s||"").toLowerCase().trim().replace(/\s+/g,"").replace(/ō/g,"ou").replace(/ū/g,"uu");
  }

  function shuffle(arr){
    const a=[...arr];
    for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
    return a;
  }

  function weightedPick(items,scoreFn){
    const weights=items.map(x=>Math.max(.01,scoreFn(x)));
    const total=weights.reduce((a,b)=>a+b,0);
    let r=Math.random()*total;
    for(let i=0;i<items.length;i++){r-=weights[i];if(r<=0)return items[i]}
    return items[items.length-1];
  }

  function learnPool(){return allItems.filter(x=>isGroupUnlocked(x.groupIndex))}
  function rehearsalPool(){
    return allItems.filter(x=>!!state.rehearseGroups[x.group]);
  }

  function comboBoostActive(){
    if(P_ROW_INDEX<0||state.learnUnlockedCount<=P_ROW_INDEX+1)return false;
    const pStates=GROUPS[P_ROW_INDEX].items.map(([k])=>itemState(k));
    const average=pStates.reduce((sum,s)=>sum+s.mastery,0)/Math.max(1,pStates.length);
    return average>=72;
  }

  function comboSprintActive(groupIndex){
    return comboBoostActive()&&state.pace.learn>=MAX_KANA_PACE_INDEX&&groupIndex>P_ROW_INDEX&&GROUPS[groupIndex].phase==="Combinations";
  }

  function maybeAutoUnlockLearn(){
    if(state.learnUnlockedCount>=GROUPS.length) return;
    const gi=state.learnUnlockedCount-1;
    const ss=GROUPS[gi].items.map(([k])=>itemState(k));
    const introduced=ss.every(s=>s.introduced);
    const allAssessed=ss.every(s=>s.unaidedSeen>=2&&s.unaidedCorrect>=1);
    const avg=ss.reduce((a,s)=>a+s.mastery,0)/ss.length;
    const history=(state.learnRowHistory[GROUPS[gi].id]||[]).slice(-20);
    const enoughHistory=history.length>=Math.min(20,GROUPS[gi].items.length*2);
    const accuracy=history.length?history.reduce((sum,x)=>sum+x,0)/history.length:0;
    const sprint=comboSprintActive(gi);
    const sprintAssessed=ss.every(s=>s.unaidedSeen>=1);
    const sprintRecognized=ss.filter(s=>s.unaidedCorrect>=1).length>=Math.ceil(ss.length*2/3);
    const sprintHistory=history.length>=ss.length;
    const normalReady=introduced&&allAssessed&&enoughHistory&&avg>=62&&accuracy>=.8;
    const sprintReady=introduced&&sprintAssessed&&sprintRecognized&&sprintHistory&&accuracy>=.72;
    if(sprint?sprintReady:normalReady){
      state.learnUnlockedCount++;
      advancePastRehearsalUnlocks();
      saveState();
      renderCurriculum();
    }
  }

  function masteryGain(s){
    return Math.max(4,14*(1-s.mastery/150));
  }

  function scheduleCorrect(s){
    const m=s.mastery;
    const minutes=m<20?4:m<40?15:m<60?60:m<75?360:m<88?1440:m<95?4320:10080;
    s.dueAt=Date.now()+minutes*60000;
  }

  function recordRowUnaidedResult(item,correct,assisted){
    if(assisted)return;
    const history=state.learnRowHistory[item.group]||(state.learnRowHistory[item.group]=[]);
    history.push(correct?1:0);
    if(history.length>20)history.shift();
  }

  function forcedEntryAt(entry){return typeof entry==="number"?entry:Number(entry&&entry.at)}

  function scheduleForcedRecall(session,item,min,max,reason,standard=true){
    session.forced[item.k]={at:session.n+randomInt(min,max)+1,reason,standard};
  }

  function applyKanaResult(item,correct,typedWrongItem=null,mode="learn",font=STANDARD_FONT,assistanceStage=0){
    const s=itemState(item.k);
    s.introduced=true;
    const assisted=correct&&assistanceStage>0;
    const masteryMultiplier=assistanceStage===1?(font.id==="standard"?.4:.25):assistanceStage===2?0:1;
    const fs=fontState(item,font.id);fs.seen++;if(assisted)fs.assisted=(fs.assisted||0)+1;else if(correct)fs.correct++;else fs.wrong++;
    s.seen++; s.lastSeen=Date.now();
    if(correct){
      if(!assisted){s.correct++;s.unaidedCorrect++;s.unaidedSeen++;s.streak++;s.lastWasCorrect=true;s.errorStreak=0}
      if(assisted){s.assistedCorrect++;state.stats.assisted++}
      const gain=Math.min(17,masteryGain(s)*(assisted?1:font.gainMultiplier)*masteryMultiplier);
      s.mastery=Math.min(100,s.mastery+gain);
      if(assisted)s.dueAt=Date.now()+5*60000;else scheduleCorrect(s);
      if(!assisted){state.stats.answered++;state.stats.correct++;state.stats.streak++;state.stats.bestStreak=Math.max(state.stats.bestStreak,state.stats.streak)}
    }else{
      const penalty=font.penalty;
      s.wrong++;s.unaidedSeen++;s.streak=0;s.lastWasCorrect=false;s.errorStreak=(s.errorStreak||0)+1;s.mastery=Math.max(0,s.mastery-penalty);s.dueAt=Date.now()+60000;
      state.stats.answered++;
      state.stats.streak=0;
      if(typedWrongItem && typedWrongItem.k!==item.k){
        s.confusions[typedWrongItem.k]=(s.confusions[typedWrongItem.k]||0)+1;
      }
    }
    if(mode==="rehearse"){
      const rs=rehearseItemState(item.k);
      if(assisted){rs.assisted=(rs.assisted||0)+1;rs.lastWasCorrect=null}
      else{rs.seen++;rs.lastWasCorrect=correct;if(correct)rs.correct++;else rs.wrong++}
      maybeUnlockFromRehearsal(item.group);
    }
    recordRowUnaidedResult(item,correct,assisted);
    recordPhaseResult([itemPhase(item)],correct?(assistanceStage===1?.5:assistanceStage===2?0:1):0);
    saveState();
  }

  function recordRescueConfusion(target,wrongItem){
    if(!wrongItem || wrongItem.k===target.k) return;
    const s=itemState(target.k);
    s.confusions[wrongItem.k]=(s.confusions[wrongItem.k]||0)+1;
    saveState();
  }

  function kanaDiversityWindow(mode,poolSize){
    if(mode==="rehearse")return Math.min(6,Math.max(2,poolSize-1));
    return poolSize<=6?2:poolSize<=12?3:poolSize<=24?4:6;
  }

  function selectKana(pool,session,mode){
    if(!pool.length) return null;
    const dueForced=Object.entries(session.forced||{}).filter(([,entry])=>forcedEntryAt(entry)<=session.n).map(([k,entry])=>({item:byKana[k],entry})).filter(x=>x.item&&pool.includes(x.item));
    if(dueForced.length){
      const forced=dueForced[Math.floor(Math.random()*dueForced.length)],chosen=forced.item;
      delete session.forced[chosen.k];
      session.forcedReason=typeof forced.entry==="object"?forced.entry.reason||"":"";
      session.forceStandard=Boolean(typeof forced.entry==="object"&&forced.entry.standard);
      if(pool.some(x=>mode==="learn"?!itemState(x.k).introduced:itemState(x.k).unaidedSeen===0))session.sinceUnseen=(session.sinceUnseen||0)+1;
      return chosen;
    }
    session.forcedReason="";session.forceStandard=false;
    const waiting=new Set(Object.entries(session.forced||{}).filter(([,entry])=>forcedEntryAt(entry)>session.n).map(([k])=>k));
    const guard=kanaDiversityWindow(mode,pool.length);
    let candidates=[];
    for(let size=guard;size>=0;size--){
      const recent=size?new Set(session.last.slice(-size)):new Set();
      candidates=pool.filter(x=>!waiting.has(x.k)&&!recent.has(x.k));
      if(candidates.length>=Math.min(4,pool.length)||size===0)break;
    }
    if(!candidates.length)candidates=pool;
    const unseen=pool.filter(x=>!waiting.has(x.k)&&(mode==="learn"?!itemState(x.k).introduced:itemState(x.k).unaidedSeen===0));
    let bucket=candidates;
    if(unseen.length){
      const selectedPace=Number.isFinite(state.pace[mode])?state.pace[mode]:2;
      const effectivePace=mode==="learn"&&comboBoostActive()?Math.min(MAX_KANA_PACE_INDEX,selectedPace+1):selectedPace;
      const pace=KANA_PACE_PROFILES[effectivePace]||KANA_PACE_PROFILES[2];
      const chooseUnseen=(session.sinceUnseen||0)>=pace.guarantee||Math.random()<pace.share;
       const review=candidates.filter(x=>mode==="learn"?itemState(x.k).introduced:itemState(x.k).unaidedSeen>0);
      bucket=chooseUnseen||!review.length?unseen:review;
    }
    const now=Date.now();
    const chosen=weightedPick(bucket,x=>{
      const s=itemState(x.k);
      let w=1;
      w+=(100-s.mastery)/12;
      if(s.dueAt<=now)w+=session.resumeGrace>0?1:3;
      if(s.wrong>s.correct)w+=2;
      return w*phaseBoost(itemPhase(x))*scriptBalanceWeight(x,pool,session,item=>itemState(item.k));
    });
    const wasSeen=mode==="learn"?itemState(chosen.k).introduced:itemState(chosen.k).unaidedSeen>0;
    session.sinceUnseen=wasSeen?((session.sinceUnseen||0)+1):0;
    return chosen;
  }

  function sameVowelCandidates(target){
    const r=target.r;
    const vowel=r.endsWith("a")?"a":r.endsWith("i")?"i":r.endsWith("u")?"u":r.endsWith("e")?"e":r.endsWith("o")?"o":"";
    return vowel?allItems.filter(x=>x.k!==target.k&&x.r.endsWith(vowel)):[];
  }

  function itemForReading(reading,preferredScript=""){
    const normalized=normalize(reading);
    return allItems.find(item=>item.script===preferredScript&&normalize(item.r)===normalized)||allItems.find(item=>normalize(item.r)===normalized)||null;
  }

  function distractorItems(target,pool){
    const poolSet=new Set(pool.map(x=>x.k));
    const ranked=[];
    const usedRomaji=new Set([target.r]);
    const add=(item,score)=>{
      if(!item||item.k===target.k||!poolSet.has(item.k)||item.r===target.r)return;
      const found=ranked.find(x=>x.item.k===item.k);
      if(found)found.score=Math.max(found.score,score);else ranked.push({item,score});
    };
    const s=itemState(target.k);
    Object.entries(s.confusions||{}).forEach(([k,c])=>add(byKana[k],25+c*2));
    (VISUAL[target.k]||[]).forEach(k=>add(byKana[k],18));
    GROUPS[target.groupIndex].items.forEach(([k])=>add(byKana[k],12));
    sameVowelCandidates(target).forEach(x=>add(x,7));
    pool.forEach(x=>add(x,1+Math.random()*2));
    ranked.sort((a,b)=>b.score-a.score);
    const out=[];
    for(const x of ranked){
      if(out.length>=7)break;
      if(usedRomaji.has(x.item.r))continue;
      out.push(x.item); usedRomaji.add(x.item.r);
    }
    for(const x of allItems){
      if(out.length>=7)break;
      if(x.k===target.k||usedRomaji.has(x.r))continue;
      out.push(x);usedRomaji.add(x.r);
    }
    return out.slice(0,7);
  }

  function focusInput(mode){
    const input=$("#"+mode+"Input");
    if(!input)return;
    input.disabled=false; input.readOnly=false; input.value="";
    requestAnimationFrame(()=>{try{input.focus({preventScroll:true})}catch(e){input.focus()}});
  }

  function setFeedback(mode,good,title,meta){
    const el=$("#"+mode+"Feedback");
    el.className="feedback show "+(good?"good":"bad");
    el.innerHTML=`<strong>${good?"✓ ":"✗ "}${title}</strong><div class="meta">${meta}</div>`;
  }

  function clearFeedback(mode){
    const el=$("#"+mode+"Feedback"); el.className="feedback"; el.innerHTML="";
  }

  function setStandardReferencePending(mode,pending){
    const samples=document.querySelectorAll("#"+mode+"Feedback .glyph-sample");
    const standard=samples[samples.length-1];
    if(!standard)return;
    standard.classList.toggle("standard-pending",pending);
    const caption=standard.querySelector("span");
    const glyph=standard.querySelector("strong");
    if(caption)caption.textContent=pending?"Standard reference • available shortly":"Standard reference";
    if(glyph){
      if(pending)glyph.setAttribute("aria-hidden","true");
      else glyph.removeAttribute("aria-hidden");
    }
  }

  function clearTypingRetry(mode,expired=false){
    const session=sessions[mode];
    if(session.typingRetryTimer){
      clearTimeout(session.typingRetryTimer);
      session.typingRetryTimer=null;
    }
    setStandardReferencePending(mode,false);
    const button=$("#"+mode+"Feedback .typing-retry");
    if(!button)return;
    if(expired){
      button.disabled=true;
      button.classList.add("expired");
      const label=button.querySelector(".typing-retry-label");
      if(label)label.textContent="Retry expired";
      button.setAttribute("aria-label","Typing mistake retry expired");
    }else{
      const wrap=button.closest(".typing-retry-wrap");
      if(wrap)wrap.remove();
    }
  }

  function retryTypingMistake(mode){
    const session=sessions[mode];
    if(!session.current||!session.typingRetryTimer)return;
    clearTypingRetry(mode);
    session.fontRetry=false;
    session.rescue=false;
    hideRescue(mode);
    clearFeedback(mode);
    $("#"+mode+"Next").classList.add("hidden");
    $("#"+mode+"DontKnow").classList.remove("hidden");
    $("#"+mode+"Prompt").textContent=session.current.k;
    applyPromptFont(mode,session.currentFont||STANDARD_FONT);
    focusInput(mode);
  }

  function offerTypingRetry(mode){
    const session=sessions[mode];
    if(session.typingRetryOffered)return;
    const host=$("#"+mode+"Feedback .meta");
    if(!host)return;
    session.typingRetryOffered=true;
    const wrap=document.createElement("div");
    wrap.className="typing-retry-wrap";
    const button=document.createElement("button");
    button.className="typing-retry";
    button.type="button";
    button.setAttribute("aria-label","Typing mistake? Retry this question. Shortcut: Escape");
    button.innerHTML='<span class="typing-retry-label">Typing mistake? Retry</span><kbd>Esc</kbd><span class="typing-retry-bar" aria-hidden="true"></span>';
    button.addEventListener("click",()=>retryTypingMistake(mode));
    wrap.appendChild(button);
    host.appendChild(wrap);
    if((session.currentFont||STANDARD_FONT).id!=="standard")setStandardReferencePending(mode,true);
    session.typingRetryTimer=setTimeout(()=>clearTypingRetry(mode,true),3000);
  }

  function renderRescue(mode,target,pool){
    const wrap=$("#"+mode+"Rescue"), box=$("#"+mode+"Options");
    box.innerHTML="";
    const title=wrap.querySelector(".rescue-title");if(title)title.textContent="Choose the correct reading to reinforce the mistake";
    const opts=shuffle([{item:target,correct:true},...distractorItems(target,pool).map(item=>({item,correct:false}))]);
    opts.forEach((o,i)=>{
      const b=document.createElement("button");
      b.className="choice"; b.dataset.correct=o.correct?"1":"0";
      b.innerHTML=`<span class="num">${i+1}</span>${o.item.r}`;
      b.addEventListener("click",()=>handleKanaRescueChoice(mode,b,o,target,pool));
      box.appendChild(b);
    });
    wrap.classList.add("show");
  }

  function hideRescue(mode){
    $("#"+mode+"Rescue").classList.remove("show");
    $("#"+mode+"Options").innerHTML="";
  }

  function setKanaQuestionLabel(mode,text){
    const label=document.querySelector(`#panel-${mode} .question-label`);
    if(label&&label.firstChild)label.firstChild.nodeValue=text+" ";
  }

  function showLearnIntroduction(item){
    const session=sessions.learn;
    session.introduction=true;session.currentFont=STANDARD_FONT;
    document.querySelector('#panel-learn .trainer').classList.add("introduction");
    setKanaQuestionLabel("learn","Study this new kana");
    $("#learnPrompt").textContent=item.k;applyPromptFont("learn",STANDARD_FONT);
    $("#learnInput").disabled=true;
    $("#learnDontKnow").classList.add("hidden");$("#learnMnemonic").classList.add("hidden");
    $("#learnNext").classList.remove("hidden");$("#learnNext").innerHTML='Study, then continue <kbd>Enter</kbd>';
    const feedback=$("#learnFeedback");feedback.className="feedback show hint";
    feedback.innerHTML=`<strong>New kana: ${item.k} = ${item.r}</strong><div class="meta">Study the standard shape, reading, and mnemonic. This introduction gives no mastery and does not change accuracy or streak. An unaided recall check will appear shortly.</div>`;
    appendMnemonicCard("learn",item,"First introduction","full");
  }

  function completeLearnIntroduction(){
    const session=sessions.learn,item=session.current;
    if(!session.introduction||!item)return;
    const s=itemState(item.k);s.introduced=true;s.mnemonicViews++;
    scheduleForcedRecall(session,item,3,5,"introduction",true);
    saveState();nextKanaQuestion("learn");
  }

  function advanceKana(mode){
    if(mode==="learn"&&sessions.learn.introduction)completeLearnIntroduction();
    else nextKanaQuestion(mode);
  }

  function nextKanaQuestion(mode){
    const session=sessions[mode];
    clearTypingRetry(mode);
    if(mode==="learn")maybeAutoUnlockLearn();
    const pool=mode==="learn"?learnPool():rehearsalPool();
    if(!pool.length){
      $("#"+mode+"Prompt").textContent="—";
      setFeedback(mode,false,"No kana selected","Choose at least one rehearsal row above.");
      return;
    }
    session.n++;session.rescue=false;session.fontRetry=false;session.introduction=false;session.mnemonicUsed=false;session.mnemonicStage=0;session.typingRetryOffered=false;
    document.querySelector(`#panel-${mode} .trainer`).classList.remove("introduction");
    setKanaQuestionLabel(mode,"Type the romaji reading");
    clearFeedback(mode);hideRescue(mode);
    $("#"+mode+"Next").classList.add("hidden");$("#"+mode+"Next").innerHTML='Next <kbd>Enter</kbd>';
    $("#"+mode+"DontKnow").classList.remove("hidden");
    $("#"+mode+"Mnemonic").classList.remove("hidden");$("#"+mode+"Mnemonic").disabled=false;
    const item=selectKana(pool,session,mode);
    session.current=item;session.last.push(item.k);if(session.last.length>12)session.last.shift();
    session.lastScripts.push(item.script);if(session.lastScripts.length>12)session.lastScripts.shift();
    if(mode==="learn"&&!itemState(item.k).introduced){
      $("#"+mode+"Count").textContent="Question "+session.n;
      showLearnIntroduction(item);updateAllUI();return;
    }
    if(session.forcedReason&&session.forcedReason!=="mistake")setKanaQuestionLabel(mode,"Unaided recall check");
    session.currentFont=chooseKanaFont(item,mode,session);session.lastFonts.push(session.currentFont.id);if(session.lastFonts.length>5)session.lastFonts.shift();
    if(session.resumeGrace>0)session.resumeGrace--;
    $("#"+mode+"Prompt").textContent=item.k;
    applyPromptFont(mode,session.currentFont);
    $("#"+mode+"Count").textContent="Question "+session.n;
    focusInput(mode);
    updateAllUI();
  }

  function handleKanaTyped(mode,forceWrong=false){
    const session=sessions[mode], item=session.current;
    if(!item||session.rescue||session.introduction)return;
    clearTypingRetry(mode);
    noteSessionActivity(session);
    const input=$("#"+mode+"Input");
    const value=normalize(input.value);
    const correct=!forceWrong&&value===normalize(item.r);
    if(session.fontRetry){
      if(correct){
        session.fontRetry=false;
        input.value="";input.disabled=true;
        setFeedback(mode,true,`${item.k} = ${item.r}`,"Recognized with the standard reference. The original font mistake remains scheduled for review.");
        appendGlyphComparison(mode,item,session.currentFont||STANDARD_FONT);
        setTimeout(()=>nextKanaQuestion(mode),450);
      }else{
        const wrongItem=value?itemForReading(value,item.script):null;
        if(wrongItem)recordRescueConfusion(item,wrongItem);
        session.fontRetry=false;session.rescue=true;
        input.value="";input.blur();
        const typedNote=value?`You typed “${value}” again.`:"Still marked as unknown.";
        setFeedback(mode,false,"Still not quite",`${typedNote} Choose the correct reading below.`);
        appendGlyphComparison(mode,item,session.currentFont||STANDARD_FONT);
        renderRescue(mode,item,mode==="learn"?learnPool():rehearsalPool());
        $("#"+mode+"DontKnow").classList.add("hidden");
        updateAllUI();
      }
      if(!forceWrong&&value)offerTypingRetry(mode);
      return;
    }
    if(correct){
      const assisted=session.mnemonicUsed;
      applyKanaResult(item,true,null,mode,session.currentFont,assisted?session.mnemonicStage:0);
      if(assisted){
        if(session.mnemonicStage===1)scheduleForcedRecall(session,item,4,7,"visual mnemonic",true);
        else scheduleForcedRecall(session,item,3,5,"answer mnemonic",true);
      }
      const assistedLabel=session.mnemonicStage===1?"Correct with the visual hint. Press Enter or Next when the image is clear.":"Correct with the answer mnemonic. Press Enter or Next when the memory hook is clear.";
      setFeedback(mode,true,`${item.k} = ${item.r}`,assisted?assistedLabel:"Correct. Moving on.");
      if(mode==="learn")maybeAutoUnlockLearn();
      input.value="";
      if(assisted){
        input.disabled=true;$("#"+mode+"Next").classList.remove("hidden");$("#"+mode+"DontKnow").classList.add("hidden");
        appendMnemonicCard(mode,item,session.mnemonicStage===1?"Visual hint used":"Answer mnemonic used",session.mnemonicStage===1?"visual":"full");
        updateAllUI();
      }else setTimeout(()=>nextKanaQuestion(mode),180);
    }else{
      const wrongItem=value?itemForReading(value,item.script):null;
      applyKanaResult(item,false,wrongItem,mode,session.currentFont,session.mnemonicUsed?session.mnemonicStage:0);
      session.forced[item.k]={at:session.n+mistakeReviewOffset(itemState(item.k).errorStreak||1),reason:"mistake",standard:false};
      const typedNote=value?`You typed “${value}”.`:"Marked as unknown.";
      $("#"+mode+"Mnemonic").classList.add("hidden");
      if((session.currentFont||STANDARD_FONT).id!=="standard"){
        session.fontRetry=true;
        input.value="";
        setFeedback(mode,false,"Compare the two forms",`${typedNote} Look at the standard form, then type the reading once more.`);
        appendGlyphComparison(mode,item,session.currentFont||STANDARD_FONT);
        focusInput(mode);
      }else{
        session.rescue=true;
        input.value="";input.blur();
        setFeedback(mode,false,"Not quite",`${typedNote} Choose the correct reading below. The answer will be shown after you identify it.`);
        renderRescue(mode,item,mode==="learn"?learnPool():rehearsalPool());
        $("#"+mode+"DontKnow").classList.add("hidden");
      }
      updateAllUI();
      if(!forceWrong&&value)offerTypingRetry(mode);
    }
  }

  function handleKanaRescueChoice(mode,button,opt,target,pool){
    const session=sessions[mode];
    if(!session.rescue)return;
    clearTypingRetry(mode);
    noteSessionActivity(session);
    if(!opt.correct){
      button.classList.add("wrong");button.disabled=true;
      recordRescueConfusion(target,opt.item);
      $("#"+mode+"Rescue .rescue-title").textContent=confusionComparison(target,opt.item);
      return;
    }
    [...$("#"+mode+"Options").children].forEach(b=>{b.disabled=true;if(b.dataset.correct==="1")b.classList.add("correct")});
    session.rescue=false;
    scheduleForcedRecall(session,target,5,8,"rescue correction",true);
    $("#"+mode+"Next").classList.remove("hidden");
    setFeedback(mode,true,`${target.k} = ${target.r}`,"Correction reinforced. Press Enter or Next.");
    appendGlyphComparison(mode,target,session.currentFont||STANDARD_FONT);
    appendMnemonicCard(mode,target,"Remember after this correction","full");
    focusInput(mode);
    updateAllUI();
  }

  function wordPool(){
    if(state.wordSet==="all") return WORDS;
    if(state.wordSet==="basic"){
      return WORDS.filter(w=>w.u.every(k=>byKana[k]&&GROUPS[byKana[k].groupIndex].phase==="Basic"));
    }
    const allBasicUnlocked=GROUPS.filter(g=>g.phase==="Basic").every((g,i)=>isGroupUnlocked(GROUPS.indexOf(g)));
    return WORDS.filter(w=>w.u.every(k=>byKana[k]&&isGroupUnlocked(byKana[k].groupIndex))&&(!w.features.includes(LESSON.smallTsuFeature)||allBasicUnlocked));
  }

  function isWeakWordState(s){
    if(!s.seen||!s.wrong)return false;
    return s.lastWasCorrect===false || s.mastery<55 || s.correct/s.seen<.8;
  }

  function wordMasteryGain(s){
    return Math.max(4,16*(1-s.mastery/150));
  }

  function scheduleWordCorrect(s){
    const m=s.mastery;
    const minutes=m<20?5:m<40?20:m<60?90:m<75?360:m<88?1440:m<95?4320:10080;
    s.dueAt=Date.now()+minutes*60000;
  }

  function selectWord(){
    const pool=wordPool();
    if(!pool.length)return null;
    const session=sessions.words;
    const dueForced=Object.entries(session.forced||{}).filter(([,at])=>at<=session.n).map(([k])=>WORDS.find(w=>w.k===k)).filter(w=>w&&pool.includes(w));
    if(dueForced.length){
      const chosen=dueForced[Math.floor(Math.random()*dueForced.length)];
      delete session.forced[chosen.k];
      if(pool.some(w=>!wordItemState(w.k).seen))session.sinceUnseen=(session.sinceUnseen||0)+1;
      return chosen;
    }
    const waiting=new Set(Object.entries(session.forced||{}).filter(([,at])=>at>session.n).map(([k])=>k));
    let candidates=pool.filter(w=>!waiting.has(w.k)&&!session.last.slice(-6).includes(w.k));
    if(candidates.length<4)candidates=pool.filter(w=>!waiting.has(w.k)&&!session.last.slice(-2).includes(w.k));
    if(candidates.length<4)candidates=pool.filter(w=>!waiting.has(w.k));
    if(!candidates.length)candidates=pool;
    const unseen=candidates.filter(w=>!wordItemState(w.k).seen);
    const seen=candidates.filter(w=>wordItemState(w.k).seen);
    const weak=seen.filter(w=>isWeakWordState(wordItemState(w.k)));
    const coverage=pool.filter(w=>wordItemState(w.k).seen).length/pool.length;
    const pace=WORD_PACE_PROFILES[state.pace.words]||WORD_PACE_PROFILES[2];
    const newShare=coverage<.8?pace.early:pace.late;
    const weakShare=coverage<.8?.25:.45;
    const roll=Math.random();
    let bucket;
    if(unseen.length&&((session.sinceUnseen||0)>=pace.guarantee||roll<newShare))bucket=unseen;
    else if(weak.length&&roll<(unseen.length?newShare+weakShare:.55))bucket=weak;
    else bucket=seen.length?seen:candidates;
    const now=Date.now();
    const chosen=weightedPick(bucket,w=>{
      const ws=wordItemState(w.k);
      let weight=1+(100-ws.mastery)/15;
      if(ws.lastWasCorrect===false)weight+=3;
      if(ws.seen&&ws.dueAt<=now)weight+=2;
      if(!ws.seen)weight*=Math.max(.7,1.5-(w.difficulty-1)*.16);
      return weight*wordFeatureBoost(w)*scriptBalanceWeight(w,pool,session,word=>wordItemState(word.k));
    });
    session.sinceUnseen=wordItemState(chosen.k).seen?((session.sinceUnseen||0)+1):0;
    return chosen;
  }

  function nextWordQuestion(){
    const s=sessions.words;
    clearTypingRetry("words");
    if(!state.speech.continueOnAdvance)stopSpeech();
    s.n++;s.rescue=false;s.fontRetry=false;s.typingRetryOffered=false;
    clearFeedback("words");hideRescue("words");
    $("#wordsNext").classList.add("hidden");$("#wordsDontKnow").classList.remove("hidden");
    const w=selectWord();
    if(!w){
      $("#wordsPrompt").textContent="—";
      setFeedback("words",false,"No words available","Change the word set above.");
      return;
    }
    s.current=w;s.last.push(w.k);if(s.last.length>8)s.last.shift();
    s.lastScripts.push(w.script);if(s.lastScripts.length>12)s.lastScripts.shift();
    s.currentFont=chooseWordFont(w,s);s.lastFonts.push(s.currentFont.id);if(s.lastFonts.length>5)s.lastFonts.shift();
    if(s.resumeGrace>0)s.resumeGrace--;
    $("#wordsPrompt").textContent=w.k;applyPromptFont("words",s.currentFont);$("#wordsCount").textContent="Question "+s.n;
    focusInput("words");updateAllUI();
  }

  function applyWordResult(w,correct,font=STANDARD_FONT){
    const ws=wordItemState(w.k);
    ws.seen++;ws.lastSeen=Date.now();ws.lastWasCorrect=correct;
    state.wordStats.seen++;
    if(correct){
      ws.correct++;ws.streak++;ws.errorStreak=0;
      ws.mastery=Math.min(100,ws.mastery+wordMasteryGain(ws)*font.wordGainMultiplier);scheduleWordCorrect(ws);
      state.wordStats.correct++;
      state.stats.answered++;state.stats.correct++;state.stats.streak++;
      state.stats.bestStreak=Math.max(state.stats.bestStreak||0,state.stats.streak);
      w.u.forEach(k=>{const s=itemState(k);s.mastery=Math.min(100,s.mastery+2)});
    }else{
      ws.wrong++;ws.streak=0;ws.errorStreak=(ws.errorStreak||0)+1;ws.mastery=Math.max(0,ws.mastery-14);ws.dueAt=Date.now()+60000;
      state.stats.answered++;state.stats.streak=0;
      w.u.forEach(k=>{
        const s=itemState(k);s.mastery=Math.max(0,s.mastery-2);s.dueAt=Date.now()+60000;
      });
    }
    recordPhaseResult(wordPhases(w),correct);
    recordWordFeatureResult(w,correct);
    saveState();
  }

  function makeWordDistractors(word){
    const pool=wordPool();
    const romans=new Set([word.r]);
    const out=[];
    const push=r=>{if(r&&r!==word.r&&!romans.has(r)&&out.length<7){romans.add(r);out.push(r)}};

    pool.filter(w=>w.k!==word.k).sort((a,b)=>{
      const la=Math.abs(a.r.length-word.r.length),lb=Math.abs(b.r.length-word.r.length);
      return la-lb+(.5-Math.random());
    }).forEach(w=>push(w.r));

    const substitutions={"shi":"chi","chi":"shi","tsu":"su","fu":"hu","hi":"he","he":"hi","ki":"shi","ne":"nu","nu":"ne"};
    Object.entries(substitutions).forEach(([a,b])=>{if(word.r.includes(a))push(word.r.replace(a,b))});
    while(out.length<7){
      const fake=word.r.replace(/[aeiou]/,m=>({a:"o",e:"i",i:"e",o:"a",u:"o"}[m]||m));
      if(!romans.has(fake))push(fake); else push(word.r+"u");
    }
    return out.slice(0,7);
  }

  function isCorrectWordReading(word,value){
    return [word.r,...word.a].some(answer=>normalize(answer)===value);
  }

  function recordWordKanaConfusions(word,value){
    if(!value||SMALL_TSU.some(k=>word.units.includes(k)))return;
    const expected=word.units.map(k=>byKana[k]&&byKana[k].r);
    if(expected.some(x=>!x)||expected.join("").length!==value.length)return;
    let offset=0,changed=false;
    word.units.forEach((targetKana,index)=>{
      const expectedReading=expected[index],typedReading=value.slice(offset,offset+expectedReading.length);offset+=expectedReading.length;
      if(normalize(typedReading)===normalize(expectedReading))return;
      const typedItem=itemForReading(typedReading,byKana[targetKana]&&byKana[targetKana].script);
      if(!typedItem||typedItem.k===targetKana)return;
      const target=itemState(targetKana);
      target.confusions[typedItem.k]=(target.confusions[typedItem.k]||0)+1;changed=true;
    });
    if(changed)saveState();
  }

  function finishWordRecognition(word,meta,showComparison=false){
    const s=sessions.words;
    clearTypingRetry("words");
    s.fontRetry=false;s.rescue=false;
    $("#wordsNext").classList.remove("hidden");$("#wordsDontKnow").classList.add("hidden");
    setFeedback("words",true,`${word.k} → ${word.r}`,`${word.m} • ${meta}`);
    if(showComparison)appendGlyphComparison("words",word,s.currentFont||STANDARD_FONT);
    const replay=document.createElement("button");replay.className="ghost speak-again";replay.type="button";replay.textContent="🔊 Replay word and meaning";
    replay.disabled=!speechSupported||!voicesFor("ja").length;
    replay.addEventListener("click",()=>speakWordSequence(word));
    $("#wordsFeedback .meta").appendChild(replay);
    if(state.speech.autoPlay)speakWordSequence(word);
    updateAllUI();focusInput("words");
  }

  function renderWordRescue(word){
    const wrap=$("#wordsRescue"),box=$("#wordsOptions");box.innerHTML="";
    const opts=shuffle([{r:word.r,correct:true},...makeWordDistractors(word).map(r=>({r,correct:false}))]);
    opts.forEach((o,i)=>{
      const b=document.createElement("button");
      b.className="choice";b.dataset.correct=o.correct?"1":"0";
      b.innerHTML=`<span class="num">${i+1}</span>${o.r}`;
      b.addEventListener("click",()=>handleWordRescueChoice(b,o,word));
      box.appendChild(b);
    });
    wrap.classList.add("show");
  }

  function handleWordTyped(forceWrong=false){
    const s=sessions.words,w=s.current;
    if(!w||s.rescue)return;
    clearTypingRetry("words");
    noteSessionActivity(s);
    const input=$("#wordsInput"), value=normalize(input.value);
    const correct=!forceWrong&&isCorrectWordReading(w,value);
    if(s.fontRetry){
      if(correct){
        input.value="";
        finishWordRecognition(w,"recognized with the standard reference • press Enter for the next word",true);
      }else{
        recordWordKanaConfusions(w,value);
        s.fontRetry=false;s.rescue=true;input.value="";input.blur();
        const typedNote=value?`You typed “${value}” again.`:"Still marked as unknown.";
        setFeedback("words",false,"Still not quite",`${typedNote} Choose the correct reading below.`);
        appendGlyphComparison("words",w,s.currentFont||STANDARD_FONT);
        renderWordRescue(w);$("#wordsDontKnow").classList.add("hidden");updateAllUI();
      }
      if(!forceWrong&&value)offerTypingRetry("words");
      return;
    }
    if(correct){
      applyWordResult(w,true,s.currentFont||STANDARD_FONT);
      input.value="";
      finishWordRecognition(w,"press Enter for the next word");
    }else{
      recordWordKanaConfusions(w,value);
      applyWordResult(w,false);
      s.forced[w.k]=s.n+mistakeReviewOffset(wordItemState(w.k).errorStreak||1);
      const typedNote=value?`You typed “${value}”.`:"Marked as unknown.";
      if((s.currentFont||STANDARD_FONT).id!=="standard"){
        s.fontRetry=true;input.value="";
        setFeedback("words",false,"Compare the two forms",`${typedNote} Look at the standard word, then type the reading once more.`);
        appendGlyphComparison("words",w,s.currentFont||STANDARD_FONT);focusInput("words");
      }else{
        s.rescue=true;input.value="";input.blur();
        setFeedback("words",false,"Not quite",`${typedNote} Choose the correct reading below. The answer and meaning will be shown after you identify it.`);
        renderWordRescue(w);$("#wordsDontKnow").classList.add("hidden");
      }
      updateAllUI();
      if(!forceWrong&&value)offerTypingRetry("words");
    }
  }

  function handleWordRescueChoice(button,opt,word){
    const s=sessions.words;if(!s.rescue)return;
    clearTypingRetry("words");
    noteSessionActivity(s);
    if(!opt.correct){button.classList.add("wrong");button.disabled=true;return}
    [...$("#wordsOptions").children].forEach(b=>{b.disabled=true;if(b.dataset.correct==="1")b.classList.add("correct")});
    finishWordRecognition(word,"correction reinforced • press Enter for the next word",(s.currentFont||STANDARD_FONT).id!=="standard");
  }

  let lastRenderedStreak=null;
  function streakTier(streak){
    if(streak>=200)return 8;
    if(streak>=150)return 7;
    if(streak>=100)return 6;
    if(streak>=75)return 5;
    if(streak>=50)return 4;
    if(streak>=25)return 3;
    if(streak>=15)return 2;
    if(streak>=5)return 1;
    return 0;
  }

  function updateTopStats(){
    const all=allItems.map(x=>itemState(x.k));
    const mastered=all.filter(s=>s.mastery>=80).length;
    $("#sMastered").textContent=mastered;
    $("#sAccuracy").textContent=state.stats.answered?Math.round(state.stats.correct/state.stats.answered*100)+"%":"—";
    $("#assistedRecognitionCount").textContent=state.stats.assisted||0;
    const streak=Math.max(0,state.stats.streak||0),best=Math.max(streak,state.stats.bestStreak||0);
    const streakBox=$("#streakStat"),tier=streakTier(streak),previousTier=lastRenderedStreak===null?tier:streakTier(lastRenderedStreak);
    $("#sStreak").textContent=streak;
    streakBox.classList.remove("streak-tier-1","streak-tier-2","streak-tier-3","streak-tier-4","streak-tier-5","streak-tier-6","streak-tier-7","streak-tier-8","streak-celebrate");
    if(tier)streakBox.classList.add(`streak-tier-${tier}`);
    if(lastRenderedStreak!==null&&tier>previousTier){
      void streakBox.offsetWidth;
      streakBox.classList.add("streak-celebrate");
      setTimeout(()=>streakBox.classList.remove("streak-celebrate"),1100);
    }
    lastRenderedStreak=streak;
    ["kanaStreakCurrent","wordStreakCurrent"].forEach(id=>$("#"+id).textContent=streak);
    ["kanaStreakBest","wordStreakBest"].forEach(id=>$("#"+id).textContent=best);
    $("#sWeak").textContent=all.filter(s=>s.seen&&(isWeakKanaState(s)||s.dueAt<=Date.now())).length;
    const lp=learnPool(),avg=lp.length?lp.reduce((a,x)=>a+itemState(x.k).mastery,0)/lp.length:0;
    $("#learnProgress").style.width=Math.round(avg)+"%";
    $("#learnProgressText").textContent="Unlocked mastery "+Math.round(avg)+"%";
  }

  function renderCurriculum(){
    $("#curriculumRows").innerHTML=GROUPS.map((g,gi)=>{
      const unlocked=isGroupUnlocked(gi);
      const rehearsalUnlock=state.groupUnlockSource[g.id]==="rehearsal";
      const ss=g.items.map(([k])=>itemState(k));
      const avg=Math.round(ss.reduce((a,s)=>a+s.mastery,0)/ss.length);
      const rehearsalResults=g.items.map(([k])=>rehearseItemState(k));
      const demonstrated=rehearsalResults.filter(s=>s.correct>=1).length;
      const rehearsalSeen=rehearsalResults.reduce((sum,s)=>sum+s.seen,0);
      const rehearsalCorrect=rehearsalResults.reduce((sum,s)=>sum+s.correct,0);
      const rehearsalAccuracy=rehearsalSeen?Math.round(rehearsalCorrect/rehearsalSeen*100):0;
      const status=unlocked?`${avg}% mastery`:rehearsalSeen?`${demonstrated}/${g.items.length} kana demonstrated • ${rehearsalAccuracy}% rehearsal accuracy`:"locked in Learn";
      const tag=unlocked?`<span class="unlock-tag ${rehearsalUnlock?"rehearsal":""}">Unlocked through ${rehearsalUnlock?"Rehearsal":"Learn"}</span>`:"";
      return `<div class="row-chip ${unlocked?"":"locked"}">
        <div class="row-name"><div class="row-heading"><strong>${g.name}</strong>${tag}</div><span>${g.phase} • ${status}</span></div>
        <div class="kana-line">${g.items.map(x=>x[0]).join(" ")}</div>
      </div>`;
    }).join("");
  }

  function renderRehearseSelectors(){
    const host=$("#rehearseSelectors");host.innerHTML="";
    let lastPhase="";
    GROUPS.forEach(g=>{
      if(g.phase!==lastPhase){
        const h=document.createElement("div");h.className="phase-title";h.textContent=g.phase;host.appendChild(h);lastPhase=g.phase;
      }
      const label=document.createElement("label");label.className="check";
      label.innerHTML=`<input type="checkbox" data-group="${g.id}" ${state.rehearseGroups[g.id]?"checked":""}><span><strong>${g.name}</strong><br><span class="tiny">${g.items.map(x=>x[0]).join(" ")}</span></span>`;
      label.querySelector("input").addEventListener("change",e=>{
        state.rehearseGroups[g.id]=e.target.checked;saveState();updateAllUI();
        if(currentTab==="rehearse")nextKanaQuestion("rehearse");
      });
      host.appendChild(label);
    });
  }

  function renderMnemonicTab(){
    const host=$("#mnemonicGrid"),filter=$("#mnemonicFilter").value;
    const items=allItems.filter(item=>{
      const s=itemState(item.k),custom=typeof state.customMnemonics[item.k]==="string"&&state.customMnemonics[item.k].trim();
      if(filter==="weak")return isWeakKanaState(s);
      if(filter==="assisted")return s.mnemonicViews>0||s.assistedCorrect>0;
      if(filter==="mistakes")return s.wrong>0;
      if(filter==="custom")return custom;
      return true;
    });
    host.innerHTML="";
    if(!items.length){host.innerHTML='<div class="muted mnemonic-empty">No kana match this filter yet.</div>';return}
    items.forEach(item=>{
      const s=itemState(item.k),builtIn=mnemonicCopy(item),custom=state.customMnemonics[item.k]||"",asset=mnemonicAsset(item);
      const card=document.createElement("article");card.className="mnemonic-library-card";
      const visualCredit=sourceInfo(asset)?.credit;
      card.innerHTML=`<div class="mnemonic-library-top"><strong class="mnemonic-library-glyph"></strong><div><strong>${item.r}</strong><span>${GROUPS[item.groupIndex].name}${visualCredit?` • ${visualCredit} visual`:""} • ${custom.trim()?"Custom text":"Built-in text"}</span></div></div><div class="mnemonic-library-art" aria-label="Full visual mnemonic"></div><label><span>Alternative text mnemonic</span><small>A separate memory aid; it may use a different story from the visual.</small><textarea rows="4"></textarea></label><div class="tiny mnemonic-stats">${s.mnemonicViews} mnemonic view${s.mnemonicViews===1?"":"s"} • ${s.assistedCorrect} assisted recognition${s.assistedCorrect===1?"":"s"} • ${s.wrong} mistake${s.wrong===1?"":"s"}</div><div class="actions"><button class="ghost" data-save-mnemonic>Save text</button><button class="ghost" data-restore-mnemonic ${custom.trim()?"":"disabled"}>Restore built-in</button></div>`;
      const glyph=card.querySelector(".mnemonic-library-glyph");glyph.textContent=item.k;glyph.style.fontFamily=STANDARD_FONT.family;
      const art=card.querySelector(".mnemonic-library-art");
      if(asset&&asset.full){
        const image=document.createElement("img");image.src=asset.full;image.loading="lazy";image.decoding="async";image.alt=`Full mnemonic for ${item.k} (${item.r})`;
        image.addEventListener("error",()=>{art.remove();card.querySelector(".mnemonic-source")?.remove()});art.appendChild(image);
        const attribution=createSourceAttribution(asset);if(attribution)art.after(attribution);
      }else art.remove();
      const textarea=card.querySelector("textarea");textarea.value=custom.trim()?custom:builtIn;
      card.querySelector("[data-save-mnemonic]").addEventListener("click",()=>{
        const value=textarea.value.trim();
        if(value&&value!==builtIn)state.customMnemonics[item.k]=value;else delete state.customMnemonics[item.k];
        saveState();renderMnemonicTab();
      });
      card.querySelector("[data-restore-mnemonic]").addEventListener("click",()=>{
        delete state.customMnemonics[item.k];saveState();renderMnemonicTab();
      });
      host.appendChild(card);
    });
  }

  function renderProgress(){
    const weak=allItems.map(item=>({item,s:itemState(item.k)})).filter(x=>isWeakKanaState(x.s))
      .sort((a,b)=>((100-b.s.mastery)+b.s.wrong*3)-((100-a.s.mastery)+a.s.wrong*3)).slice(0,12);
    $("#troubleList").innerHTML=weak.length?weak.map(({item,s})=>`
      <div class="trouble">
        <div class="kana-small">${item.k}</div>
        <div><strong>${item.r}</strong><div class="tiny">${s.unaidedCorrect}/${s.unaidedSeen} unaided</div><div class="meter"><span style="width:${Math.round(s.mastery)}%"></span></div></div>
        <strong>${Math.round(s.mastery)}%</strong>
      </div>`).join(""):`<span class="muted">No weak kana yet.</span>`;

    const pairs=[];
    allItems.forEach(item=>Object.entries(itemState(item.k).confusions||{}).forEach(([b,count])=>{if(count>0&&byKana[b])pairs.push({a:item.k,b,count})}));
    pairs.sort((a,b)=>b.count-a.count);
    $("#confusionList").innerHTML=pairs.length?pairs.slice(0,16).map(p=>`<span class="confusion">${p.a} ↔ ${p.b} <strong>×${p.count}</strong></span>`).join(""):`<span class="muted">No confusion pairs recorded yet.</span>`;

    $("#fontRecognition").innerHTML=FONT_PROFILES.map(font=>{
      let seen=0,correct=0,assisted=0;
      allItems.forEach(item=>{const fs=itemState(item.k).fontStats[font.id];if(fs){seen+=unaidedFontAttempts(fs);correct+=fs.correct||0;assisted+=fs.assisted||0}});
      const result=seen?Math.round(correct/seen*100)+"%":"Not assessed";
      const safeFamily=font.family.replaceAll('"',"'");
      return `<div class="font-stat" style="font-family:${safeFamily}"><strong>${font.label}</strong><div class="font-preview">${LESSON.fontPreview}</div><span>${font.difficulty} • ${font.gainMultiplier.toFixed(2)}× kana • ${font.wordGainMultiplier.toFixed(2)}× word<br>${result}${seen?` • ${seen} answers`:""}${assisted?` • ${assisted} assisted`:""}</span></div>`;
    }).join("");
  }

  function fontSummary(font){
    let seen=0,correct=0;
    allItems.forEach(item=>{const fs=itemState(item.k).fontStats[font.id];if(fs){seen+=unaidedFontAttempts(fs);correct+=fs.correct||0}});
    return {seen,correct,accuracy:seen?Math.round(correct/seen*100):null};
  }

  function renderFontTab(){
    const selectors=$("#fontSelectors");
    selectors.innerHTML=FONT_PROFILES.map(font=>{
      const summary=fontSummary(font),safeFamily=font.family.replaceAll('"',"'");
      const accuracy=summary.seen?`${summary.accuracy}% • ${summary.seen} answers`:"Not assessed";
      if(font.id==="standard")return `<div class="font-select-card fixed"><div style="font-family:${safeFamily}"><strong>${font.label}</strong><div class="font-preview">${LESSON.fontPreview}</div><span class="tiny">Always enabled • ${accuracy}</span></div></div>`;
      return `<label class="font-select-card"><input type="checkbox" data-font-select="${font.id}" ${isFontEnabled(font)?"checked":""}><div style="font-family:${safeFamily}"><strong>${font.label}</strong><div class="font-preview">${LESSON.fontPreview}</div><span class="tiny">${font.difficulty}<br>${font.gainMultiplier.toFixed(2)}× kana • ${font.wordGainMultiplier.toFixed(2)}× word<br>${accuracy}</span></div></label>`;
    }).join("");
    selectors.querySelectorAll("[data-font-select]").forEach(input=>input.addEventListener("change",e=>{
      state.selectedFonts[e.target.dataset.fontSelect]=e.target.checked;state.selectedFonts.standard=true;saveState();renderFontTab();
    }));

    const header=FONT_PROFILES.map(font=>{
      const active=isFontEnabled(font),safeFamily=font.family.replaceAll('"',"'");
      return `<th class="${active?"":"inactive-font"}" style="font-family:${safeFamily}">${font.label}<div class="tiny">${font.id==="standard"?"Always enabled":active?"Selected":"Not selected"}</div></th>`;
    }).join("");
    const rows=GROUPS.map(group=>{
      const groupHead=`<tr class="group-row"><th colspan="${FONT_PROFILES.length+1}">${group.phase} • ${group.name}</th></tr>`;
      const items=group.items.map(([kana,reading])=>`<tr><td class="reading"><strong>${reading}</strong><div class="tiny">${kana}</div></td>${FONT_PROFILES.map(font=>{
        const safeFamily=font.family.replaceAll('"',"'");
        return `<td class="font-glyph ${isFontEnabled(font)?"":"inactive-font"}" style="font-family:${safeFamily}">${kana}</td>`;
      }).join("")}</tr>`).join("");
      return groupHead+items;
    }).join("");
    $("#fontComparison").innerHTML=`<thead><tr><th class="reading">Reading</th>${header}</tr></thead><tbody>${rows}</tbody>`;
  }

  function updateRehearseSummary(){
    const p=rehearsalPool();
    const assessed=p.filter(x=>itemState(x.k).unaidedSeen>0).length;
    const weak=p.filter(x=>isWeakKanaState(itemState(x.k))).length;
    const basic=GROUPS.filter(g=>g.phase==="Basic");
    const selectedGroups=GROUPS.filter(g=>state.rehearseGroups[g.id]);
    const allBasic=basic.every(g=>state.rehearseGroups[g.id])&&selectedGroups.length===basic.length;
    const allGroups=selectedGroups.length===GROUPS.length;
    const setName=!p.length?"No rehearsal set":allGroups?"Everything":allBasic?"All basic":"Custom set";
    $("#selectedCount").textContent=p.length;
    $("#assessedCount").textContent=assessed;
    $("#assessedCountDetail").textContent=assessed;
    $("#rehearseWeakCount").textContent=weak;
    $("#rehearseWeakCountDetail").textContent=weak;
    const rehearsalResults=Object.values(state.rehearseItems||{});
    $("#rehearseAnswerTotal").textContent=rehearsalResults.reduce((sum,x)=>sum+(x.seen||0),0);
    $("#rehearseUniqueTotal").textContent=rehearsalResults.filter(x=>(x.seen||0)>0).length;
    $("#rehearseSetName").textContent=setName;
    $("#rehearseSetSummary").textContent=`${p.length} kana selected`;
    $("#rehearseSetHeading").textContent=p.length?"Change rehearsal set":"Choose a rehearsal set";
    if(!p.length) state.rehearseSetOpen=true;
    $("#rehearseSetPanel").open=state.rehearseSetOpen;
    $("#rehearseHelpPanel").open=state.rehearseHelpOpen;
  }

  function updateWordSummary(){
    const pool=wordPool(),states=pool.map(w=>wordItemState(w.k));
    const unique=states.filter(s=>s.seen>0).length;
    $("#wordSeen").textContent=state.wordStats.seen;
    $("#wordPoolCount").textContent=pool.length;
    $("#wordUnique").textContent=unique;
    $("#wordUnseen").textContent=Math.max(0,pool.length-unique);
    $("#wordWeak").textContent=states.filter(isWeakWordState).length;
    $("#wordMastered").textContent=states.filter(s=>s.mastery>=80).length;
    $("#wordAccuracy").textContent="Word accuracy: "+(state.wordStats.seen?Math.round(state.wordStats.correct/state.wordStats.seen*100)+"%":"—");
    const weak=pool.map(word=>({word,s:wordItemState(word.k)})).filter(x=>isWeakWordState(x.s))
      .sort((a,b)=>((100-b.s.mastery)+b.s.wrong*4)-((100-a.s.mastery)+a.s.wrong*4)).slice(0,12);
    $("#weakWordList").innerHTML=weak.length?weak.map(({word,s})=>`<div class="trouble word-trouble">
      <div class="word-small">${word.k}</div>
      <div><strong>${word.r}</strong><div class="tiny">${word.m} • ${s.correct}/${s.seen} correct</div><div class="meter"><span style="width:${Math.round(s.mastery)}%"></span></div></div>
      <strong>${Math.round(s.mastery)}%</strong>
    </div>`).join(""):`<span class="muted">No weak words in this set yet.</span>`;
    const strong=pool.map(word=>({word,s:wordItemState(word.k)})).filter(x=>x.s.seen>0)
      .sort((a,b)=>b.s.mastery-a.s.mastery||(b.s.correct/b.s.seen)-(a.s.correct/a.s.seen)).slice(0,10);
    $("#strongWordList").innerHTML=strong.length?strong.map(({word,s})=>`<div class="trouble word-trouble">
      <div class="word-small">${word.k}</div>
      <div><strong>${word.r}</strong><div class="tiny">${word.m} • ${s.correct}/${s.seen} correct</div><div class="meter"><span style="width:${Math.round(s.mastery)}%"></span></div></div>
      <strong>${Math.round(s.mastery)}%</strong>
    </div>`).join(""):`<span class="muted">No words assessed in this set yet.</span>`;
    const features=["Basic","Voiced","Semi-voiced","Combinations",LESSON.smallTsuFeature,"Long vowels","Long words"];
    $("#wordFeatureProgress").innerHTML=features.map(feature=>{
      const history=state.wordFeatureHistory[feature]||[],correct=history.reduce((sum,result)=>sum+result,0);
      const accuracy=history.length?Math.round(correct/history.length*100)+"%":"Not assessed";
      const boost=historyBoost(history);
      return `<div class="feature-stat"><strong>${feature}</strong><span>${accuracy}${history.length?` • ${history.length} recent`:""}</span><span>Scheduling ${boost.toFixed(2)}×</span></div>`;
    }).join("");
    document.querySelectorAll("[data-wordset]").forEach(b=>b.classList.toggle("active",b.dataset.wordset===state.wordSet));
  }

  function renderScriptBalance(){
    const panel=$("#scriptBalancePanel");if(!panel)return;
    panel.querySelectorAll("[data-script-balance]").forEach(button=>button.classList.toggle("active",button.dataset.scriptBalance===state.scriptBalance));
    const profile=LESSON.scriptBalanceProfiles.find(x=>x.id===state.scriptBalance);
    const range=$("#scriptBalanceRange");range.classList.toggle("hidden",!profile||!profile.custom);
    $("#hiraganaShare").value=String(state.hiraganaShare);
    $("#hiraganaShareLabel").textContent=state.hiraganaShare+"%";
    $("#katakanaShareLabel").textContent=(100-state.hiraganaShare)+"%";
  }

  function renderPaceControls(){
    ["learn","rehearse"].forEach(mode=>{
      const profile=KANA_PACE_PROFILES[state.pace[mode]]||KANA_PACE_PROFILES[2];
      const boosted=mode==="learn"&&comboBoostActive();
      const effectiveIndex=boosted?Math.min(MAX_KANA_PACE_INDEX,state.pace[mode]+1):state.pace[mode];
      const effectiveProfile=KANA_PACE_PROFILES[effectiveIndex]||profile;
      const input=$("#"+mode+"Pace"),value=$("#"+mode+"PaceValue"),description=$("#"+mode+"PaceDescription");
      input.value=String(state.pace[mode]);
      value.textContent=boosted?(state.pace[mode]>=MAX_KANA_PACE_INDEX?`${profile.label} • combo sprint`:`${profile.label} → ${effectiveProfile.label}`):profile.label;
      const pool=mode==="learn"?learnPool():rehearsalPool();
      const unseen=pool.filter(item=>mode==="learn"?!itemState(item.k).introduced:itemState(item.k).unaidedSeen===0).length;
      const timing=effectiveProfile.guarantee===0?"unseen kana always chosen when possible":`guaranteed after ${effectiveProfile.guarantee} review question${effectiveProfile.guarantee===1?"":"s"}`;
      const remaining=mode==="learn"?`${unseen} not yet introduced`:`${unseen} not yet assessed`;
      const complete=mode==="learn"?"All available kana are introduced; selection is currently fully adaptive.":"All available kana are assessed; review is currently fully adaptive.";
      const boostNote=boosted?(state.pace[mode]>=MAX_KANA_PACE_INDEX?"Combo sprint active • accelerated combo-row progression • ":"Combo boost active • "):"";
      description.textContent=unseen?`${boostNote}${Math.round(effectiveProfile.share*100)}% new kana • ${timing} • ${remaining}`:(pool.length?`${boostNote}${complete}`:"No kana are currently available in this mode.");
    });
    const profile=WORD_PACE_PROFILES[state.pace.words]||WORD_PACE_PROFILES[2];
    const input=$("#wordsPace"),value=$("#wordsPaceValue"),description=$("#wordsPaceDescription");
    input.value=String(state.pace.words);value.textContent=profile.label;
    const pool=wordPool(),seen=pool.filter(word=>wordItemState(word.k).seen).length,unseen=pool.length-seen,coverage=pool.length?seen/pool.length:0;
    const share=coverage<.8?profile.early:profile.late;
    const timing=profile.guarantee===0?"unseen words always chosen when possible":`guaranteed after ${profile.guarantee} review question${profile.guarantee===1?"":"s"}`;
    description.textContent=unseen?`${Math.round(share*100)}% new words at current coverage • ${timing} • ${unseen} currently unseen`:(pool.length?"All words in this set are assessed; review is currently fully adaptive.":"No words are currently available in this set.");
  }

  function setupPaceControls(){
    ["learn","rehearse","words"].forEach(mode=>{
      const input=$("#"+mode+"Pace");
      input.addEventListener("input",event=>{
        state.pace[mode]=Number(event.target.value);
        renderPaceControls();
      });
      input.addEventListener("change",saveState);
    });
    renderPaceControls();
  }

  function setupScriptBalance(){
    const host=$("#scriptBalanceButtons");if(!host)return;
    host.innerHTML=LESSON.scriptBalanceProfiles.map(profile=>`<button class="seg" data-script-balance="${profile.id}">${profile.label}</button>`).join("");
    host.querySelectorAll("[data-script-balance]").forEach(button=>button.addEventListener("click",()=>{
      state.scriptBalance=button.dataset.scriptBalance;saveState();renderScriptBalance();
    }));
    $("#hiraganaShare").addEventListener("input",event=>{
      state.hiraganaShare=Number(event.target.value);renderScriptBalance();
    });
    $("#hiraganaShare").addEventListener("change",saveState);
    renderScriptBalance();
  }

  function updateLastSaved(){
    const el=$("#lastSaved");
    if(!state.savedAt){el.textContent="Not saved yet";return}
    const d=new Date(state.savedAt);
    el.textContent="Last saved: "+d.toLocaleString();
  }

  function updateAllUI(){
    updateTopStats();updateRehearseSummary();updateWordSummary();renderProgress();renderCurriculum();updateLastSaved();
    renderScriptBalance();renderPaceControls();
    if(currentTab==="fonts")renderFontTab();
    if(currentTab==="mnemonics")renderMnemonicTab();
  }

  function switchTab(tab){
    if(tab!=="words")stopSpeech();
    ["learn","rehearse","words"].forEach(mode=>clearTypingRetry(mode));
    currentTab=tab;
    document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));
    document.querySelectorAll(".panel").forEach(p=>p.classList.remove("active"));
    $("#panel-"+tab).classList.add("active");
    if(tab==="learn"){if(!sessions.learn.current)nextKanaQuestion("learn");else if(!sessions.learn.introduction)focusInput("learn")}
    if(tab==="rehearse"){if(!sessions.rehearse.current)nextKanaQuestion("rehearse");else if(!sessions.rehearse.introduction)focusInput("rehearse")}
    if(tab==="words"){if(!sessions.words.current)nextWordQuestion();else focusInput("words")}
    if(tab==="fonts")renderFontTab();
    if(tab==="mnemonics")renderMnemonicTab();
    if(tab==="kanaprogress"||tab==="wordprogress")updateAllUI();
  }

  function exportProgress(){
    saveState();
    const payload={
      app:LESSON.appName,
      formatVersion:3,
      exportedAt:new Date().toISOString(),
      state
    };
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
    const a=document.createElement("a");
    const stamp=new Date().toISOString().slice(0,10);
    a.href=URL.createObjectURL(blob);a.download=`${LESSON.progressFileStem}-progress-${stamp}.json`;
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
    $("#importStatus").textContent="Progress exported successfully.";
  }

  function importProgressFile(file){
    const reader=new FileReader();
    reader.onload=()=>{
      try{
        const data=JSON.parse(reader.result);
        const incoming=data&&data.state?data.state:data;
        if(!incoming||incoming.version!==LESSON.progressVersion)throw new Error(`This does not look like a ${LESSON.appName} v${LESSON.progressVersion} progress file.`);
        state=incoming;ensureStateShape();saveState();
        sessions.learn=newPracticeSession();
        sessions.rehearse=newPracticeSession();
        sessions.words=newPracticeSession();
        renderRehearseSelectors();renderSpeechControls();updateAllUI();
        $("#importStatus").textContent="Progress imported successfully. Your mastery and settings have been restored.";
        if(currentTab==="learn")nextKanaQuestion("learn");
        if(currentTab==="rehearse")nextKanaQuestion("rehearse");
        if(currentTab==="words")nextWordQuestion();
      }catch(err){
        $("#importStatus").textContent="Import failed: "+err.message;
      }
    };
    reader.readAsText(file);
  }

  document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>switchTab(b.dataset.tab)));

  $("#rehearseSetPanel").addEventListener("toggle",e=>{
    state.rehearseSetOpen=e.currentTarget.open;
    saveState();
    if(!e.currentTarget.open&&currentTab==="rehearse"&&!sessions.rehearse.rescue&&!sessions.rehearse.introduction)focusInput("rehearse");
  });
  $("#rehearseHelpPanel").addEventListener("toggle",e=>{
    state.rehearseHelpOpen=e.currentTarget.open;
    saveState();
    if(!e.currentTarget.open&&currentTab==="rehearse"&&!sessions.rehearse.rescue&&!sessions.rehearse.introduction)focusInput("rehearse");
  });

  ["learn","rehearse"].forEach(mode=>{
    $("#"+mode+"Input").addEventListener("keydown",e=>{
      if(e.key==="Enter"){
        e.preventDefault();
        const s=sessions[mode];
        if(s.rescue)return;
        if(!$("#"+mode+"Next").classList.contains("hidden"))advanceKana(mode);
        else handleKanaTyped(mode,false);
      }
    });
    $("#"+mode+"DontKnow").addEventListener("click",()=>handleKanaTyped(mode,true));
    $("#"+mode+"Next").addEventListener("click",()=>advanceKana(mode));
    $("#"+mode+"Mnemonic").addEventListener("click",()=>showMnemonicHint(mode));
  });

  $("#mnemonicFilter").addEventListener("change",renderMnemonicTab);

  $("#wordsInput").addEventListener("keydown",e=>{
    if(e.key==="Enter"){
      e.preventDefault();
      if(sessions.words.rescue)return;
      if(!$("#wordsNext").classList.contains("hidden"))nextWordQuestion();
      else handleWordTyped(false);
    }
  });
  $("#wordsDontKnow").addEventListener("click",()=>handleWordTyped(true));
  $("#wordsNext").addEventListener("click",nextWordQuestion);

  $("#speechAuto").addEventListener("change",e=>{state.speech.autoPlay=e.target.checked;saveState()});
  $("#speechMeaning").addEventListener("change",e=>{state.speech.speakMeaning=e.target.checked;saveState()});
  $("#speechContinue").addEventListener("change",e=>{state.speech.continueOnAdvance=e.target.checked;saveState()});
  $("#speechRate").addEventListener("change",e=>{state.speech.rate=Number(e.target.value);saveState()});
  $("#japaneseVoice").addEventListener("change",e=>{state.speech.jaVoice=e.target.value;saveState();renderSpeechControls()});
  $("#englishVoice").addEventListener("change",e=>{state.speech.enVoice=e.target.value;saveState();renderSpeechControls()});
  $("#testJapaneseSpeech").addEventListener("click",()=>{
    if(!speechSupported||!voicesFor("ja").length)return;
    stopSpeech();window.speechSynthesis.speak(makeUtterance(LESSON.testSpeech.ja,"ja"));
  });
  $("#testEnglishSpeech").addEventListener("click",()=>{
    if(!speechSupported||!voicesFor("en").length)return;
    stopSpeech();window.speechSynthesis.speak(makeUtterance(LESSON.testSpeech.en,"en"));
  });

  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"&&(currentTab==="learn"||currentTab==="rehearse"||currentTab==="words")){
      const session=sessions[currentTab];
      if(session.typingRetryTimer){
        e.preventDefault();
        retryTypingMistake(currentTab);
        return;
      }
    }
    if(e.key==="Enter"&&!e.defaultPrevented){
      const next=$("#"+currentTab+"Next");
      if(next&&!next.classList.contains("hidden")){
        e.preventDefault();
        if(currentTab==="words")nextWordQuestion();
        else if(currentTab==="learn"||currentTab==="rehearse")advanceKana(currentTab);
      }
      return;
    }
    if(!/^[1-8]$/.test(e.key))return;
    const mode=currentTab;
    if(mode==="learn"&&sessions.learn.rescue){const b=$("#learnOptions").children[Number(e.key)-1];if(b)b.click()}
    if(mode==="rehearse"&&sessions.rehearse.rescue){const b=$("#rehearseOptions").children[Number(e.key)-1];if(b)b.click()}
    if(mode==="words"&&sessions.words.rescue){const b=$("#wordsOptions").children[Number(e.key)-1];if(b)b.click()}
  });

  $("#selectBasic").addEventListener("click",()=>{
    GROUPS.forEach(g=>state.rehearseGroups[g.id]=g.phase==="Basic");saveState();renderRehearseSelectors();updateAllUI();nextKanaQuestion("rehearse");
  });
  $("#selectAll").addEventListener("click",()=>{
    GROUPS.forEach(g=>state.rehearseGroups[g.id]=true);saveState();renderRehearseSelectors();updateAllUI();nextKanaQuestion("rehearse");
  });
  $("#clearRows").addEventListener("click",()=>{
    GROUPS.forEach(g=>state.rehearseGroups[g.id]=false);saveState();renderRehearseSelectors();updateAllUI();
    sessions.rehearse.current=null;$("#rehearsePrompt").textContent="—";
    setFeedback("rehearse",false,"No kana selected","Choose at least one row above.");
  });

  document.querySelectorAll("[data-wordset]").forEach(b=>b.addEventListener("click",()=>{
    state.wordSet=b.dataset.wordset;saveState();updateWordSummary();nextWordQuestion();
  }));

  $("#exportProgress").addEventListener("click",exportProgress);
  $("#importProgressBtn").addEventListener("click",()=>$("#importProgressFile").click());
  $("#importProgressFile").addEventListener("change",e=>{
    const file=e.target.files&&e.target.files[0];if(file)importProgressFile(file);e.target.value="";
  });

  $("#resetProgress").addEventListener("click",()=>{
    if(!confirm("Reset all mastery, mistakes, word stats, and selections? This cannot be undone."))return;
    if(typeof LESSON.resetProgress==="function")LESSON.resetProgress();else localStorage.removeItem(STORAGE_KEY);
    state=defaultState();saveState();
    sessions.learn=newPracticeSession();
    sessions.rehearse=newPracticeSession();
    sessions.words=newPracticeSession();
    renderRehearseSelectors();renderSpeechControls();updateAllUI();switchTab("learn");nextKanaQuestion("learn");
  });

  window.addEventListener("focus",()=>{
    if(currentTab==="learn"&&!sessions.learn.rescue&&!sessions.learn.introduction)focusInput("learn");
    if(currentTab==="rehearse"&&!sessions.rehearse.rescue&&!sessions.rehearse.introduction)focusInput("rehearse");
    if(currentTab==="words"&&!sessions.words.rescue)focusInput("words");
  });

  setupScriptBalance();
  setupPaceControls();
  renderRehearseSelectors();
  renderSpeechControls();
  refreshSpeechVoices();
  if(speechSupported)window.speechSynthesis.addEventListener("voiceschanged",refreshSpeechVoices);
  updateAllUI();
  nextKanaQuestion("learn");
})();

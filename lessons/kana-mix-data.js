(() => {
  "use strict";

  const lessons=window.KANA_SPRINT_LESSONS||{};
  const hiragana=lessons.hiragana;
  const katakana=lessons.katakana;
  if(!hiragana||!katakana)throw new Error("Kana Mix needs both Hiragana and Katakana lesson data.");

  const MIX_STORAGE_KEY="kana-sprint-mix-v1";
  const PAIR_COUNT=Math.min(hiragana.groups.length,26);
  const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
  const firstFamily=font=>(String(font.family).match(/"[^"]+"/)||["sans-serif"])[0];

  function scriptForKana(text){
    if(/[\u3040-\u309f]/u.test(text))return "hiragana";
    if(/[\u30a0-\u30ff\u31f0-\u31ff]/u.test(text))return "katakana";
    return "";
  }

  function interleaveGroups(){
    const paired=hiragana.groups.slice(0,PAIR_COUNT).map((hGroup,index)=>{
      const kGroup=katakana.groups[index];
      const items=[];
      const length=Math.max(hGroup.items.length,kGroup.items.length);
      for(let i=0;i<length;i++){
        if(hGroup.items[i])items.push(clone(hGroup.items[i]));
        if(kGroup.items[i])items.push(clone(kGroup.items[i]));
      }
      return {id:hGroup.id,name:`${hGroup.name} · both scripts`,phase:hGroup.phase,items};
    });
    const extensions=katakana.groups.slice(PAIR_COUNT).map(group=>({
      ...clone(group),id:`kata-${group.id}`,name:`Katakana ${group.name}`
    }));
    return [...paired,...extensions];
  }

  const GROUPS=interleaveGroups();
  const VISUAL={...clone(hiragana.visualConfusions),...clone(katakana.visualConfusions)};
  const FONT_PROFILES=hiragana.fontProfiles.map(hFont=>{
    const kFont=katakana.fontProfiles.find(font=>font.id===hFont.id)||hFont;
    return {...clone(hFont),family:`${firstFamily(hFont)},${firstFamily(kFont)},"Yu Gothic","Noto Sans JP",sans-serif`};
  });

  function defaultSourceState(lesson){
    const selectedFonts={};lesson.fontProfiles.forEach(font=>selectedFonts[font.id]=true);
    const rehearseGroups={};lesson.groups.forEach(group=>rehearseGroups[group.id]=group.phase==="Basic");
    return {
      version:lesson.progressVersion,
      learnUnlockedCount:lesson.initialLearnUnlockedCount,
      stats:{answered:0,correct:0,streak:0,bestStreak:0},
      wordStats:{seen:0,correct:0},wordItems:{},wordFeatureHistory:{},
      phaseHistory:{Basic:[],Voiced:[],"Semi-voiced":[],Combinations:[]},
      items:{},rehearseItems:{},groupUnlockSource:{},rehearseGroups,
      selectedFonts,rehearseSetOpen:false,rehearseHelpOpen:false,wordSet:"learned",
      speech:{autoPlay:true,speakMeaning:true,rate:.85,jaVoice:"",enVoice:""},savedAt:0
    };
  }

  function readSource(lesson){
    try{
      const parsed=JSON.parse(localStorage.getItem(lesson.storageKey));
      if(parsed&&parsed.version===lesson.progressVersion)return parsed;
    }catch(e){}
    return defaultSourceState(lesson);
  }

  function ensureSource(state,lesson){
    const fallback=defaultSourceState(lesson);
    Object.keys(fallback).forEach(key=>{if(state[key]==null)state[key]=clone(fallback[key])});
    if(!state.stats)state.stats=clone(fallback.stats);
    if(!state.wordStats)state.wordStats=clone(fallback.wordStats);
    return state;
  }

  const owners={
    hiragana:{
      lesson:hiragana,
      kana:new Set(hiragana.groups.flatMap(group=>group.items.map(([kana])=>kana))),
      words:new Set([...hiragana.words,...hiragana.extraWords].map(word=>word.k))
    },
    katakana:{
      lesson:katakana,
      kana:new Set(katakana.groups.flatMap(group=>group.items.map(([kana])=>kana))),
      words:new Set([...katakana.words,...katakana.extraWords].map(word=>word.k))
    }
  };

  let sourceStates={};
  let snapshots={items:{},wordItems:{},rehearseItems:{}};

  function validMixState(){
    try{
      const parsed=JSON.parse(localStorage.getItem(MIX_STORAGE_KEY));
      return parsed&&parsed.version===1?parsed:null;
    }catch(e){return null}
  }

  function combinedLearnCount(hState,kState){
    const paired=Math.min(PAIR_COUNT,hState.learnUnlockedCount||0,kState.learnUnlockedCount||0);
    if(paired<PAIR_COUNT)return Math.max(1,paired);
    return Math.min(GROUPS.length,PAIR_COUNT+Math.max(0,(kState.learnUnlockedCount||0)-PAIR_COUNT));
  }

  function mergeRecent(a,b){
    return [...(a||[]),...(b||[])].slice(-30);
  }

  function loadProgress(fallback){
    sourceStates.hiragana=ensureSource(readSource(hiragana),hiragana);
    sourceStates.katakana=ensureSource(readSource(katakana),katakana);
    const saved=validMixState();
    const state={...fallback,...(saved||{})};
    state.version=1;
    state.items={...clone(sourceStates.hiragana.items),...clone(sourceStates.katakana.items)};
    state.wordItems={...clone(sourceStates.hiragana.wordItems),...clone(sourceStates.katakana.wordItems)};
    state.rehearseItems={...clone(sourceStates.hiragana.rehearseItems),...clone(sourceStates.katakana.rehearseItems)};
    state.stats={
      answered:(sourceStates.hiragana.stats.answered||0)+(sourceStates.katakana.stats.answered||0),
      correct:(sourceStates.hiragana.stats.correct||0)+(sourceStates.katakana.stats.correct||0),
      streak:saved&&saved.stats?saved.stats.streak:0,
      bestStreak:Math.max(saved&&saved.stats?saved.stats.bestStreak||0:0,sourceStates.hiragana.stats.bestStreak||0,sourceStates.katakana.stats.bestStreak||0)
    };
    state.wordStats={
      seen:(sourceStates.hiragana.wordStats.seen||0)+(sourceStates.katakana.wordStats.seen||0),
      correct:(sourceStates.hiragana.wordStats.correct||0)+(sourceStates.katakana.wordStats.correct||0)
    };
    state.learnUnlockedCount=combinedLearnCount(sourceStates.hiragana,sourceStates.katakana);
    state.groupUnlockSource={};
    hiragana.groups.slice(0,PAIR_COUNT).forEach(group=>{
      if(sourceStates.hiragana.groupUnlockSource[group.id]==="rehearsal"&&sourceStates.katakana.groupUnlockSource[group.id]==="rehearsal")state.groupUnlockSource[group.id]="rehearsal";
    });
    katakana.groups.slice(PAIR_COUNT).forEach(group=>{
      if(sourceStates.katakana.groupUnlockSource[group.id]==="rehearsal")state.groupUnlockSource[`kata-${group.id}`]="rehearsal";
    });
    if(!saved){
      state.selectedFonts=clone(sourceStates.hiragana.selectedFonts);
      state.speech=clone(sourceStates.hiragana.speech);
      state.phaseHistory={};
      ["Basic","Voiced","Semi-voiced","Combinations"].forEach(phase=>state.phaseHistory[phase]=mergeRecent(sourceStates.hiragana.phaseHistory[phase],sourceStates.katakana.phaseHistory[phase]));
      state.wordFeatureHistory={};
    }
    snapshots={items:clone(state.items),wordItems:clone(state.wordItems),rehearseItems:clone(state.rehearseItems)};
    return state;
  }

  const totals=(records,keys)=>{
    const result={seen:0,correct:0};
    keys.forEach(key=>{const record=records[key];if(record){result.seen+=record.seen||0;result.correct+=record.correct||0}});
    return result;
  };

  function changed(current,previous){return JSON.stringify(current||null)!==JSON.stringify(previous||null)}

  function syncCurriculum(mix,script,source){
    const lesson=owners[script].lesson;
    const through=Math.min(lesson.groups.length,mix.learnUnlockedCount||0);
    source.learnUnlockedCount=Math.max(source.learnUnlockedCount||0,through);
    lesson.groups.forEach((group,index)=>{
      const mixId=script==="katakana"&&index>=PAIR_COUNT?`kata-${group.id}`:group.id;
      if(mix.groupUnlockSource[mixId]==="rehearsal")source.groupUnlockSource[group.id]="rehearsal";
    });
    while(source.learnUnlockedCount<lesson.groups.length&&source.groupUnlockSource[lesson.groups[source.learnUnlockedCount].id]==="rehearsal")source.learnUnlockedCount++;
  }

  function saveProgress(mix){
    localStorage.setItem(MIX_STORAGE_KEY,JSON.stringify(mix));
    Object.entries(owners).forEach(([script,owner])=>{
      const source=ensureSource(sourceStates[script]||readSource(owner.lesson),owner.lesson);
      let newAnswers=0,newCorrect=0;
      owner.kana.forEach(key=>{
        if(changed(mix.items[key],snapshots.items[key])){
          const before=snapshots.items[key]||{};const after=mix.items[key]||{};
          newAnswers+=Math.max(0,(after.seen||0)-(before.seen||0));
          newCorrect+=Math.max(0,(after.correct||0)-(before.correct||0));
          source.items[key]=clone(after);
        }
        if(changed(mix.rehearseItems[key],snapshots.rehearseItems[key]))source.rehearseItems[key]=clone(mix.rehearseItems[key]);
      });
      owner.words.forEach(key=>{
        if(changed(mix.wordItems[key],snapshots.wordItems[key])){
          const before=snapshots.wordItems[key]||{};const after=mix.wordItems[key]||{};
          newAnswers+=Math.max(0,(after.seen||0)-(before.seen||0));
          newCorrect+=Math.max(0,(after.correct||0)-(before.correct||0));
          source.wordItems[key]=clone(after);
        }
      });
      const kanaTotals=totals(source.items,owner.kana);
      const wordTotals=totals(source.wordItems,owner.words);
      source.stats.answered=kanaTotals.seen+wordTotals.seen;
      source.stats.correct=kanaTotals.correct+wordTotals.correct;
      if(newAnswers){
        source.stats.streak=newCorrect===newAnswers?(source.stats.streak||0)+newAnswers:0;
        source.stats.bestStreak=Math.max(source.stats.bestStreak||0,source.stats.streak);
      }
      source.wordStats={seen:wordTotals.seen,correct:wordTotals.correct};
      source.selectedFonts=clone(mix.selectedFonts);
      source.speech=clone(mix.speech);
      syncCurriculum(mix,script,source);
      source.savedAt=Date.now();
      localStorage.setItem(owner.lesson.storageKey,JSON.stringify(source));
      sourceStates[script]=source;
    });
    snapshots={items:clone(mix.items),wordItems:clone(mix.wordItems),rehearseItems:clone(mix.rehearseItems)};
  }

  function resetProgress(){
    localStorage.removeItem(MIX_STORAGE_KEY);
    localStorage.removeItem(hiragana.storageKey);
    localStorage.removeItem(katakana.storageKey);
    sourceStates={hiragana:defaultSourceState(hiragana),katakana:defaultSourceState(katakana)};
    snapshots={items:{},wordItems:{},rehearseItems:{}};
  }

  window.KANA_SPRINT_LESSON={
    appName:"Kana Mix",
    scriptName:"Kana Mix",
    scriptNameLower:"mixed hiragana and katakana",
    storageKey:MIX_STORAGE_KEY,
    progressFileStem:"kana-mix",
    progressVersion:1,
    initialLearnUnlockedCount:2,
    sampleKana:"あ ア",
    sampleWord:"ねこ ホテル",
    fontPreview:"あア きキ さサ りリ ふフ",
    smallTsu:"っ",
    smallTsuList:["っ","ッ"],
    smallTsuFeature:"Small っ / ッ",
    fontProfiles:FONT_PROFILES,
    groups:GROUPS,
    visualConfusions:VISUAL,
    words:[...hiragana.words.map(clone),...katakana.words.map(clone)],
    extraWords:[...hiragana.extraWords.map(clone),...katakana.extraWords.map(clone)],
    scriptForKana,
    defaultScriptBalance:"adaptive",
    scriptBalanceProfiles:[
      {id:"adaptive",label:"Adaptive",adaptive:true},
      {id:"even",label:"50 / 50",shares:{hiragana:.5,katakana:.5}},
      {id:"hiragana",label:"Hiragana focus",shares:{hiragana:.7,katakana:.3}},
      {id:"katakana",label:"Katakana focus",shares:{hiragana:.3,katakana:.7}},
      {id:"custom",label:"Custom",custom:true}
    ],
    loadProgress,saveProgress,resetProgress,
    testSpeech:{ja:"ひらがなとカタカナを一緒に練習しましょう。",en:"Meaning: mixed kana practice."}
  };
})();

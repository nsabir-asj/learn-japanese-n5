(() => {
  "use strict";
  const C = globalThis.SENTENCE_COURSE;
  const normalize = value => String(value).normalize("NFKC").toLowerCase().replace(/[\s\p{P}]/gu, "");
  const shuffle = (items, random = Math.random) => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
    return result;
  };
  const pieces = exercise => exercise.chunks.flat();
  const slots = exercise => pieces(exercise).flatMap((piece, index, all) => piece.role ? [{ ...piece, index, anchor: all.slice(0,index).filter(x => !x.role).at(-1)?.text || "", choices: C.roles[piece.role].choices }] : []);
  const model = exercise => exercise.chunks.map(chunk => chunk.map(x => x.text).join("")).join(" ") + "。";
  function answerForms(exercise) {
    const forms = [];
    for (const chunks of [exercise.chunks,...(exercise.alternatives || [])]) {
      for (const order of exercise.orders || [chunks.map((_,i) => i)]) {
        const ordered = order.map(i => chunks[i]);
        forms.push({...exercise,chunks:ordered});
        if (exercise.optionalTopic === "omit") forms.push({...exercise,chunks:ordered.filter(chunk => !(chunk[0]?.wordId === "watashi" && chunk[1]?.role === "topic"))});
        if (exercise.optionalTopic === "add") {
          const topic = [{text:C.words.watashi.jp,wordId:"watashi"},{text:"は",role:"topic"}];
          for (let i=0;i<ordered.length;i++) forms.push({...exercise,chunks:[...ordered.slice(0,i),topic,...ordered.slice(i)]});
        }
      }
    }
    return forms;
  }
  function formAnswers(form) {
    let variants = [""];
    for (const piece of pieces(form)) variants = variants.flatMap(prefix => (piece.role ? C.roles[piece.role].choices : [piece.text]).map(text => prefix + text));
    return variants.map(normalize);
  }
  function acceptedSentences(exercise) {
    return new Set(answerForms(exercise).flatMap(formAnswers));
  }
  function particleAnswer(value, role) {
    const aliases = { wa:"は", ha:"は", ga:"が", o:"を", wo:"を", ni:"に", e:"へ", he:"へ", de:"で", no:"の", to:"と", mo:"も", ka:"か", none:"", "なし":"", "—":"", "-":"" };
    const raw = String(value).normalize("NFKC").trim().toLowerCase();
    const answer = Object.hasOwn(aliases,raw) ? aliases[raw] : raw;
    return { answer, correct: C.roles[role].choices.includes(answer) };
  }
  function unexpectedWords(exercise, tokens) {
    const allowed = new Set();
    for (const form of answerForms(exercise)) {
      for (const piece of pieces(form)) if (!piece.role) allowed.add(normalize(piece.text));
      for (const chunk of form.chunks) for (const answer of formAnswers({chunks:[chunk]})) allowed.add(answer);
    }
    return tokens.filter(token => token.distractor && !allowed.has(normalize(token.text)));
  }
  function diagnose(exercise, tokens) {
    // Match each marker to its own preceding word, even when phrases are reordered.
    const texts = tokens.map(x => typeof x === "string" ? x : x.text);
    const markers = new Set(["は","が","を","に","へ","で","の","と","も","か"]);
    const response = normalize(texts.join(""));
    const forms = answerForms(exercise);
    const matching = forms.find(form => formAnswers(form).includes(response));
    const diagnoseForm = form => slots(form).map(slot => {
      const at = texts.indexOf(slot.anchor);
      const next = at >= 0 ? texts[at + 1] : undefined;
      const answer = markers.has(next) ? next : "";
      return { ...slot, answer, correct: at >= 0 && slot.choices.includes(answer) };
    });
    if (matching) return diagnoseForm(matching);
    // For a wrong answer, use the closest authored structure. Preserve feedback
    // for correct phrases even when another particle or the verb is wrong.
    return forms.map(diagnoseForm).sort((a,b) => a.filter(x=>!x.correct).length - b.filter(x=>!x.correct).length || b.filter(x=>x.correct).length - a.filter(x=>x.correct).length)[0];
  }
  function tileBank(exercise, supported, random = Math.random, options = {}) {
    const config = options.settings || {}, vocabulary = options.vocabulary || {};
    const lesson = C.topics.find(t => t.id === exercise.topic).lesson;
    const units = supported ? exercise.chunks : pieces(exercise).filter(x => !x.role).map(x => [x]);
    const describe = unit => unit.map(piece => {
      const verb = C.verbs.find(v => v.id === piece.wordId);
      return verb ? `${verb.meaning} · ${piece.text.endsWith("ました") || piece.text.endsWith("でした") ? "past " : ""}${piece.text.includes("ません") ? "negative" : "affirmative"}` : C.words[piece.wordId]?.meaning;
    }).filter(Boolean).join(" · ") || "polite ending";
    const tile = (unit, extra = false) => ({ text:unit.map(x => x.text).join(""), meaning:describe(unit), wordIds:[...new Set(unit.map(x => x.wordId).filter(Boolean))], distractor:extra });
    const source = units.map(unit => tile(unit));
    const hasVerb = pieces(exercise).some(piece => C.verbs.some(verb => verb.id === piece.wordId));
    const seen = new Set(source.map(x => normalize(x.text)));
    const candidates = [];
    const allowed = unit => unit.every(piece => !piece.wordId || !["introduced","mastered"].includes(config.vocabulary) || familiar(piece.wordId,vocabulary,config.vocabulary === "mastered"));
    function add(unit, priority) {
      const candidate = tile(unit,true), key = normalize(candidate.text);
      if (!key || seen.has(key) || !allowed(unit)) return;
      seen.add(key);
      const known = candidate.wordIds.length ? candidate.wordIds.filter(id => familiar(id,vocabulary)).length / candidate.wordIds.length : 0;
      candidates.push({...candidate,priority:priority + (config.vocabulary === "prefer" ? known * 50 : 0)});
    }
    for (const unit of units) {
      unit.forEach((piece,index) => {
        if (!piece.wordId) return;
        const related = [...new Set(C.wordGroups.filter(group => group.includes(piece.wordId)).flat())].filter(id => id !== piece.wordId);
        const verb = C.verbs.find(v => v.id === piece.wordId);
        const replace = (text,id,priority) => add(unit.map((x,i) => i === index ? {...x,text,wordId:id} : x),priority);
        if (verb) {
          const negative = piece.text.includes("ません");
          const past = piece.text.endsWith("ました") || piece.text.endsWith("でした");
          const suffix = past ? (negative ? "ませんでした" : "ました") : (negative ? "ません" : "ます");
          replace(verb.stem + (past ? (negative ? "ました" : "ませんでした") : (negative ? "ます" : "ません")),verb.id,45);
          related.forEach(id => { const other=C.verbs.find(v=>v.id===id); if(other && (other.lesson || 3) <= lesson)replace(other.stem+suffix,id,35); });
        } else related.forEach(id => {
          // An extra choice may use earlier material, but never a later lesson's word.
          const earliest = Math.min(...C.sentences.filter(s => pieces(s).some(x => x.wordId === id)).map(s => C.topics.find(t => t.id === s.topic).lesson));
          if (earliest <= lesson) replace(C.words[id].jp,id,35);
        });
      });
    }
    // Fill from authored phrases at the same level when close contrasts are scarce.
    for (const sentence of C.sentences.filter(s => C.topics.find(t => t.id === s.topic).lesson <= lesson)) {
      const alternatives = supported ? sentence.chunks : pieces(sentence).filter(x => !x.role).map(x => [x]);
      alternatives.forEach(unit => {
        const verbForm = unit.some(piece => C.verbs.some(verb => verb.id === piece.wordId));
        // Keep spare endings comparable to the target instead of padding an action
        // sentence with visibly unrelated noun-sentence endings or demonstratives.
        if (hasVerb && !unit.some(piece => piece.wordId)) return;
        add(unit,hasVerb && verbForm ? 20 : 5);
      });
    }
    const target = Math.max(source.length + 2, Number(config.bankSize) || (supported ? 6 : 8));
    const extras = shuffle(candidates,random).sort((a,b) => b.priority - a.priority).slice(0,target-source.length);
    return shuffle([...source,...extras].map((x,index) => ({...x,id:`word-${index}`})),random);
  }
  function hiraganaPreview(value) {
    const raw = String(value).normalize("NFKC").replace(/[’‘]/g,"'");
    // Convert only Latin runs so Japanese text, spaces, and punctuation survive.
    return raw.replace(/[a-zāīūēō']+/gi,run => globalThis.KANA_SPRINT_VOCABULARY_SPEAKING.romajiToHiragana(run));
  }
  function particlePreview(value) {
    const raw = String(value).normalize("NFKC").trim().toLowerCase();
    if (!raw) return "?";
    const aliases = {wa:"は",ha:"は",o:"を",wo:"を",e:"へ",he:"へ",none:"—","なし":"—","-":"—","—":"—"};
    return Object.hasOwn(aliases,raw) ? aliases[raw] : hiraganaPreview(raw);
  }
  function verbExercises() {
    return C.verbs.flatMap(verb => [
      ["affirmative","ます","masu"], ["negative","ません","masen"],
      ["past affirmative","ました","mashita"], ["past negative","ませんでした","masendeshita"]
    ].map(([form,suffix,romajiSuffix]) => ({
      id: `${verb.id}-${form.replace(/ /g,"-")}`, topic: form.startsWith("past") ? "verbs-past" : verb.lesson === 4 ? "verbs-lesson4" : `verbs-${verb.group}`, verb, form, suffix,
      answer: verb.stem + suffix,
      romaji: verb.romajiStem + romajiSuffix,
      kanji: verb.kanjiStem + suffix,
      wordIds: [verb.id]
    })));
  }
  const verbs = verbExercises();
  const wordIds = exercise => exercise.wordIds || [...new Set(pieces(exercise).map(x => x.wordId).filter(Boolean))];
  const familiar = (id, vocabulary, mastered = false) => C.words[id].vocabularyIds.some(key => {
    const item = vocabulary.items?.[key];
    return Boolean(item?.introduced && (!mastered || (item.seen > 0 && item.mastery >= 72)));
  });
  function pool(settings, vocabulary = {}) {
    const all = settings.activity === "verbs" ? verbs : C.sentences;
    return all.filter(exercise => settings.topics.includes(exercise.topic) &&
      (settings.activity === "verbs" || !["focused","challenge"].includes(settings.difficulty) || exercise.difficulty === settings.difficulty) &&
      (!["introduced","mastered"].includes(settings.vocabulary) || wordIds(exercise).every(id => familiar(id,vocabulary,settings.vocabulary === "mastered"))));
  }
  function recordKey(exercise, settings) { return `${settings.activity}:${settings.activity === "build" ? settings.support : settings.input}:${exercise.id}`; }
  function recordParticleEvidence(progress, exercise, settings, details, assisted, now=Date.now()) {
    if(assisted || !(settings.activity==="particles" || settings.activity==="build" && settings.support==="independent"))return;
    const roles=[...new Set(details.map(slot=>slot.role))];
    for(const role of roles){
      const key=`particleEvidence:${exercise.id}:${role}`;
      const previous=progress.items[key];
      // A role gets one observation per answer, even if it occurs twice.
      const correct=details.filter(slot=>slot.role===role).every(slot=>slot.correct);
      const spaced=!previous || progress.total-previous.lastQuestion>=3 || now-previous.lastSeen>=600000;
      if(correct && !spaced)continue;
      const item=record(progress,key,correct,false,now);
      item.role=role;item.exerciseId=exercise.id;
      if(!correct)item.lastMistakeQuestion=progress.total;
    }
    if(exercise.difficulty==="challenge" && details.length){
      const key=`particleCombination:${exercise.id}`,previous=progress.items[key];
      const correct=details.every(slot=>slot.correct);
      if(!correct || !previous || progress.total-previous.lastQuestion>=3 || now-previous.lastSeen>=600000){
        const item=record(progress,key,correct,false,now);
        item.exerciseId=exercise.id;item.combination=true;
      }
    }

  }
  function seedParticleEvidence(progress) {
    if(progress.particleEvidenceVersion===1)return false;
    progress.items ||= {};
    for(const exercise of C.sentences){
      if(Object.keys(progress.items).some(key=>key.startsWith(`particleEvidence:${exercise.id}:`)))continue;
      const history=["build:independent","particles:choice","particles:typing"].flatMap(prefix=>progress.items[`${prefix}:${exercise.id}`]?.history || []).sort((a,b)=>a.at-b.at || a.question-b.question);
      const lastFailure=history.findLastIndex(event=>!event.correct && !event.assisted);
      // Old failed answers have no reliable per-particle breakdown. Import
      // only later, fully correct unaided answers; never assume partial skill.
      for(const event of history.slice(lastFailure+1).filter(event=>event.correct && !event.assisted && Number.isFinite(event.question) && Number.isFinite(event.at))){
        recordParticleEvidence({...progress,total:event.question},exercise,{activity:"build",support:"independent"},slots(exercise).map(slot=>({...slot,correct:true})),false,event.at);
      }
    }
    progress.particleEvidenceVersion=1;
    return true;
  }
  function particlePriority(exercise, settings, progress, now=Date.now()) {
    if(settings.review==="trouble" || !(settings.activity==="particles" || settings.activity==="build" && settings.support==="independent"))return 0;
    const roles=[...new Set(slots(exercise).map(slot=>slot.role))];
    if(!roles.length)return 0;
    const all=Object.values(progress.items || {}).filter(item=>item.exerciseId && item.role);
    const exact=roles.map(role=>progress.items?.[`particleEvidence:${exercise.id}:${role}`]);
    const own=progress.items?.[recordKey(exercise,settings)];
    // A vocabulary/verb mistake must still be reviewed in building itself.
    if(settings.activity==="build" && own?.lastWasCorrect===false && own.weakWords?.length)return 0;
    if(exact.some(item=>item?.lastWasCorrect===false))return 0;
    const cooling=item=>item?.lastWasCorrect && (progress.total<item.dueQuestion || now<item.dueAt);
    if(exact.every(cooling))return 2;
    const established=role=>{
      const records=all.filter(item=>item.role===role);
      const latest=records.reduce((best,item)=>!best || item.lastSeen>best.lastSeen || item.lastSeen===best.lastSeen && item.lastQuestion>best.lastQuestion ? item : best,null);
      if(!latest?.lastWasCorrect || !cooling(latest))return false;
      const lastMistake=Math.max(-1,...records.map(item=>item.lastMistakeQuestion ?? -1));
      const successes=records.filter(item=>item.lastWasCorrect && item.correct>0 && item.lastQuestion>lastMistake && (item.lastSeen>=latest.lastSeen-7*86400000));
      return new Set(successes.map(item=>item.exerciseId)).size>=3;
    };
    // Mixed prompts remain eligible if even one role is unfamiliar or weak.
    return roles.every(established) ? 1 : 0;
  }
  function chooseRotation(pool, settings, progress, recent = [], vocabulary = {}, random = Math.random, now = Date.now()) {
    if (!pool.length) return null;
    const itemFor = exercise => progress.items?.[recordKey(exercise,settings)];
    const priorityCache=new Map();
    const sharedPriority=x=>{if(!priorityCache.has(x.id))priorityCache.set(x.id,particlePriority(x,settings,progress,now));return priorityCache.get(x.id);};
    const last = pool.find(x=>x.id===recent.at(-1));
    const pending = pool.filter(x=>{ const r=itemFor(x); return sharedPriority(x)===0 && r && (r.lastWasCorrect===false || r.lastAssisted) && r.lastQuestion != null && progress.total-r.lastQuestion>=2 && !r.transferDone; }).sort((a,b)=>itemFor(a).lastQuestion-itemFor(b).lastQuestion);
    const eligible = pool.filter(x=>x.id!==recent.at(-1) || pool.length===1);
    // First transfer a weak skill to a different authored example. Never take
    // an exercise outside the selected / vocabulary-filtered pool.
    const canRetry=progress.total-(progress.lastRetryQuestion ?? -3)>=3;
    for(const original of canRetry ? pending : []){
      const r=itemFor(original);
      const siblings=eligible.filter(x=>x.id!==original.id && !recent.slice(-2).includes(x.id) && (r.weakRoles?.length ? slots(x).some(slot=>r.weakRoles.includes(slot.role)) : r.weakWords?.length ? wordIds(x).some(id=>r.weakWords.includes(id)) : x.topic===original.topic));
      if(siblings.length){
        const chosen=shuffle(siblings,random).sort((a,b)=>sharedPriority(a)-sharedPriority(b) || (itemFor(a)?.lastQuestion??-1)-(itemFor(b)?.lastQuestion??-1))[0];
        r.transferDone=true; progress.lastRetryQuestion=progress.total;
        return chosen;
      }
    }
    // Exact retries follow transfer, after at least four intervening answers.
    const retry=eligible.filter(x=>{const r=itemFor(x);return sharedPriority(x)===0 && r && (r.lastWasCorrect===false || r.lastAssisted) && r.lastQuestion!=null && progress.total-r.lastQuestion>=4 && !recent.slice(-2).includes(x.id);}).sort((a,b)=>itemFor(a).lastQuestion-itemFor(b).lastQuestion);
    if(canRetry && retry.length){progress.lastRetryQuestion=progress.total;return retry[0];}
    // Least-recently practised first gives every eligible sentence a turn.
    // Topic variety and familiar vocabulary only break ties in that rotation.
    return shuffle(eligible,random).sort((a,b)=>{
      const ra=itemFor(a),rb=itemFor(b);
      // Familiar exact sentences rest first; demonstrated roles get occasional
      // checks (one in eight turns). An explicitly narrow pool still works.
      const priority=x=>{const tier=sharedPriority(x);return progress.total%8===7 && tier===1 ? 0 : tier;};
      const shared=priority(a)-priority(b);
      if(shared)return shared;
      const turn=(ra?.lastQuestion??(ra?.seen ? -0.5 : -1))-(rb?.lastQuestion??(rb?.seen ? -0.5 : -1));
      if(turn)return turn;
      const topic=Number(a.topic===last?.topic)-Number(b.topic===last?.topic);
      if(topic)return topic;
      const known=x=>settings.vocabulary==='prefer' ? wordIds(x).filter(id=>familiar(id,vocabulary)).length/Math.max(1,wordIds(x).length):0;
      return known(b)-known(a);
    })[0];
  }

  function choose(pool, settings, progress, recent=[], vocabulary={}, random=Math.random, now=Date.now()) {
    const progression=globalThis.SENTENCE_PROGRESSION;
    return progression?.enabled(settings) ? progression.choose(pool,settings,progress,recent,vocabulary,random,now) : chooseRotation(pool,settings,progress,recent,vocabulary,random,now);
  }
  function record(progress, key, correct, assisted, now = Date.now(), evidence = {}) {
    const item = progress.items[key] || { seen:0, correct:0, wrong:0, assisted:0, run:0 };
    if(key.startsWith("verbs:choice:") || key.startsWith("verbs:typing:")) {
      const id=key.split(":").slice(2).join(":");
      item.challengeUnlocked ||= verbChoiceCount({id},{verbChoices:"auto"},progress)===6;
    }
    const delayed = item.dueAt != null && item.dueAt <= now && item.dueQuestion <= progress.total;
    item.history = [...(item.history || []), {correct,assisted,at:now,question:progress.total,delayed,response:evidence.response || ""}].slice(-16);
    item.lastQuestion=progress.total; item.lastAssisted=assisted; item.transferDone=false;
    item.weakRoles=evidence.weakRoles || []; item.weakWords=evidence.weakWords || [];
    item.seen++; item[assisted ? "assisted" : correct ? "correct" : "wrong"]++;
    item.run = correct && !assisted ? item.run + 1 : 0;
    item.lastWasCorrect = correct && !assisted; item.lastSeen = now;
    item.dueQuestion = progress.total + (correct && !assisted ? 6 : 3);
    item.dueAt = now + (correct && !assisted ? Math.min(7 * 86400000, 600000 * 3 ** Math.min(7,item.run-1)) : 0);
    progress.items[key] = item;
    return item;
  }
  function verbChoiceCount(exercise, settings, progress) {
    if (["4","6"].includes(settings.verbChoices)) return Number(settings.verbChoices);
    const events=["choice","typing"].flatMap(mode=>progress.items?.[`verbs:${mode}:${exercise.id}`]?.history || []).filter(x=>!x.assisted).sort((a,b)=>a.at-b.at || a.question-b.question);
    let run=0, delayed=false, unlocked=["choice","typing"].some(mode=>progress.items?.[`verbs:${mode}:${exercise.id}`]?.challengeUnlocked), level=4, previous=null;
    for(const event of events){
      if(!event.correct){run=0;level=4;delayed=false;previous=event;continue;}
      if(previous && event.question-previous.question<2)continue;
      run++; delayed ||= event.delayed;
      if((!unlocked && run>=3 && delayed) || (unlocked && run>=2)){unlocked=true;level=6;}
      previous=event;
    }
    return level;
  }
  function verbChoices(exercise, settings, progress, random=Math.random) {
    const past = settings.topics?.includes("verbs-past");
    const suffixes=past ? ["ます","ません","ました","ませんでした"] : ["ます","ません"];
    const verb=exercise.verb;
    const wrongGroup=verb.group==="ru" ? verb.stem+"り" : verb.jp.slice(0,-1);
    const candidates=[];
    const add=text=>{if(text && normalize(text)!==normalize(exercise.answer) && !candidates.includes(text))candidates.push(text);};
    const opposite=exercise.form.startsWith("past") ? (exercise.form.endsWith("negative")?"ました":"ませんでした") : (exercise.form==="affirmative"?"ません":"ます");
    add(verb.stem+opposite);
    add(wrongGroup+exercise.suffix);
    const previous=["choice","typing"].flatMap(mode=>progress.items?.[`verbs:${mode}:${exercise.id}`]?.history || []).filter(x=>!x.correct && !x.assisted).sort((a,b)=>b.at-a.at)[0]?.response;
    const mistakes=suffixes.flatMap(suffix=>[verb.jp+suffix,wrongGroup+suffix]);
    if(mistakes.includes(previous) || suffixes.some(suffix=>verb.stem+suffix===previous))add(previous);
    for(const suffix of suffixes)add(verb.stem+suffix);
    for(const mistake of mistakes)add(mistake);
    return shuffle([exercise.answer,...candidates.slice(0,verbChoiceCount(exercise,settings,progress)-1)],random);
  }
  function verbChoiceInfo(exercise, answer) {
    const forms = [["ませんでした","Past negative"],["ました","Past affirmative"],["ません","Nonpast negative"],["ます","Nonpast affirmative"]];
    const form=forms.find(([suffix])=>exercise.verb.stem+suffix===answer);
    if(form)return {valid:true,label:form[1],note:answer===exercise.answer ? "Matches the requested form." : "Valid conjugation; a different tense or polarity."};
    const verb=exercise.verb;
    const note=verb.group==="ru" ? `Ru-verb: remove る → ${verb.stem}.` : verb.group==="u" ? `U-verb: change the final u sound to i → ${verb.stem}.` : `Irregular verb: ${verb.jp} → ${verb.stem} before the polite ending.`;
    return {valid:false,label:"Incorrect stem",note};
  }
  const playbackKey = activity => ({build:"autoAudio",verbs:"autoVerbAudio",particles:"autoParticleAudio"}[activity]);
  const playbackEnabled = settings => settings[playbackKey(settings.activity)] === true;
  globalThis.SENTENCE_ENGINE = { normalize, shuffle, pieces, slots, model, acceptedSentences, particleAnswer, diagnose, unexpectedWords, tileBank, hiraganaPreview, particlePreview, verbs, wordIds, familiar, pool, recordKey, choose, record, verbChoiceCount, verbChoices, verbChoiceInfo, playbackKey, playbackEnabled, recordParticleEvidence, particlePriority, seedParticleEvidence };
})();

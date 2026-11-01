(() => {
  "use strict";
  const E=globalThis.SENTENCE_ENGINE, C=globalThis.SENTENCE_COURSE;
  const PACES={gradual:{successes:4,examples:3,active:1,combine:1},balanced:{successes:3,examples:2,active:2,combine:2},brisk:{successes:2,examples:2,active:2,combine:2}};
  const enabled=s=>Boolean(PACES[s.learningPace]) && ["build","particles"].includes(s.activity) && s.review!=="trouble";
  const roles=exercise=>[...new Set(E.slots(exercise).map(slot=>slot.role))];
  const primaryRoles={identity:["topic"],possession:["possession"],questions:["question"],pointing:["topic"],also:["also"],objects:["object"],destination:["destination"],"action-place":["place"],time:["time","relativeTime"],companion:["companion"],negative:["object"],existence:["existencePlace","subject"],"relative-location":["possession","topic"],"past-actions":["object"],"past-nouns":["topic"],duration:["duration"],"listing-nouns":["list"]};
  const isMixed=exercise=>exercise.difficulty==="challenge";
  function readiness(observations, pace="balanced") {
    const rules=PACES[pace] || PACES.balanced;
    const sorted=observations.filter(x=>!x.assisted).sort((a,b)=>a.at-b.at || a.question-b.question);
    const unique=new Set(), spaced=[];
    let previous=null;
    for(const event of sorted){
      const key=`${event.at}:${event.question}:${event.exerciseId}`;
      if(unique.has(key))continue;
      unique.add(key);
      if(event.correct && previous && event.question-previous.question<3 && event.at-previous.at<600000)continue;
      spaced.push(event); previous=event;
    }
    const recent=spaced.slice(-8), correct=recent.filter(x=>x.correct);
    const repeated=recent.slice(-3).filter(x=>!x.correct).length>=2;
    return {ready:correct.length>=rules.successes && new Set(correct.map(x=>x.exerciseId)).size>=rules.examples && !repeated,
      weak:recent.at(-1)?.correct===false,repeated,successes:correct.length,examples:new Set(correct.map(x=>x.exerciseId)).size};
  }
  function profile(pool, settings, progress) {
    const supported=settings.activity==="build" && settings.support==="supported";
    const roleEvents=new Map(), topicEvents=new Map(), mixedEvents=new Map(), seenTopics=new Set();
    const selectedTopics=new Set(pool.map(x=>x.topic));
    const selected=new Map(C.sentences.filter(x=>selectedTopics.has(x.topic)).map(x=>[x.id,x]));
    const add=(map,key,events)=>map.set(key,[...(map.get(key)||[]),...events]);
    for(const [key,item] of Object.entries(progress.items || {})){
      if(key.startsWith("particleEvidence:") && item.role){
        add(roleEvents,item.role,(item.history || []).map(event=>({...event,exerciseId:item.exerciseId})));
        if(selected.has(item.exerciseId))seenTopics.add(selected.get(item.exerciseId).topic);
        continue;
      }
      if(settings.activity==="particles" && item.combination && selected.has(item.exerciseId)){
        const exercise=selected.get(item.exerciseId);
        add(mixedEvents,exercise.topic,(item.history||[]).map(event=>({...event,exerciseId:exercise.id})));
        continue;
      }
      const prefixes=supported ? ["build:supported:","build:independent:"] : settings.activity==="particles" ? ["build:independent:","particles:choice:","particles:typing:"] : ["build:independent:"];
      // Sentence assembly evidence is distinct from particle-only recognition.
      const prefix=prefixes.find(value=>key.startsWith(value));
      if(!prefix)continue;
      const exercise=selected.get(key.slice(prefix.length));
      if(!exercise)continue;
      if(item.seen)seenTopics.add(exercise.topic);
      add(isMixed(exercise) ? mixedEvents : topicEvents,exercise.topic,(item.history || []).map(event=>({...event,exerciseId:exercise.id})));
    }
    const skill=role=>readiness(roleEvents.get(role)||[],settings.learningPace);
    const topicIds=[...new Set(pool.map(x=>x.topic))];
    const topics=topicIds.map(id=>{
      const examples=pool.filter(x=>x.topic===id);
      const core=examples.filter(x=>!isMixed(x));
      const availableRoles=[...new Set((core.length ? core : examples).flatMap(roles))];
      const required=(primaryRoles[id]||availableRoles).filter(role=>availableRoles.includes(role));
      const structure=readiness(topicEvents.get(id)||[],settings.learningPace);
      const stable=settings.activity==="particles" ? required.every(role=>skill(role).ready) : structure.ready && (supported || required.every(role=>skill(role).ready));
      return {id,stable,seen:seenTopics.has(id),required,structure,mixed:readiness(mixedEvents.get(id)||[],settings.learningPace),hasMixed:examples.some(isMixed)};
    });
    const unsettled=topics.filter(t=>!t.stable);
    // Resume current concepts before introducing others, in curriculum order.
    unsettled.sort((a,b)=>Number(b.seen)-Number(a.seen) || C.topics.findIndex(t=>t.id===a.id)-C.topics.findIndex(t=>t.id===b.id));
    const active=unsettled.slice(0,(PACES[settings.learningPace]||PACES.balanced).active).map(t=>t.id);
    return {topics,active,skill,supported};
  }
  function choose(pool, settings, progress, recent=[], vocabulary={}, random=Math.random, now=Date.now()) {
    if(!pool.length)return null;
    const plan=profile(pool,settings,progress), rules=PACES[settings.learningPace]||PACES.balanced;
    const topic=id=>plan.topics.find(t=>t.id===id);
    const own=x=>progress.items?.[E.recordKey(x,settings)];
    const last=pool.find(x=>x.id===recent.at(-1));
    const pick=(candidates,reason,label)=>{
      if(!candidates.length)return null;
      let choices=candidates.filter(x=>x.id!==recent.at(-1));
      if(!choices.length)choices=candidates;
      const diverse=choices.filter(x=>x.topic!==last?.topic && recent.slice(-4).filter(id=>pool.find(y=>y.id===id)?.topic===x.topic).length<2);
      if(diverse.length)choices=diverse;
      const selected=E.shuffle(choices,random).sort((a,b)=>{
        const shared=E.particlePriority(a,settings,progress,now)-E.particlePriority(b,settings,progress,now);
        if(shared)return shared;
        const turn=(own(a)?.lastQuestion??-1)-(own(b)?.lastQuestion??-1);
        if(turn)return turn;
        const known=x=>settings.vocabulary==="prefer" ? E.wordIds(x).filter(id=>E.familiar(id,vocabulary)).length/Math.max(1,E.wordIds(x).length) : 0;
        return known(b)-known(a);
      })[0];
      if(reason==="establish" && last && [["destination","action-place"],["action-place","existence"],["time","duration"],["identity","also"],["possession","listing-nouns"]].some(pair=>pair.includes(last.topic)&&pair.includes(selected.topic)&&last.topic!==selected.topic)){
        reason="distinguish";label="Distinguish related particle roles in a different sentence";
      }
      progress.lastSelection={id:selected.id,reason,label,question:progress.total};
      return selected;
    };
    const eligible=pool.filter(x=>x.id!==recent.at(-1));
    const canRetry=progress.total-(progress.lastRetryQuestion??-3)>=3;
    if(canRetry){
      const pending=pool.filter(x=>{const r=own(x);return r && (r.lastWasCorrect===false || r.lastAssisted) && progress.total-r.lastQuestion>=2 && E.particlePriority(x,settings,progress,now)===0;}).sort((a,b)=>own(a).lastQuestion-own(b).lastQuestion);
      for(const original of pending){
        const r=own(original);
        const matches=x=>r.weakRoles?.length ? roles(x).some(role=>r.weakRoles.includes(role)) : r.weakWords?.length ? E.wordIds(x).some(id=>r.weakWords.includes(id)) : x.topic===original.topic;
        const siblings=eligible.filter(x=>(plan.active.includes(x.topic) || topic(x.topic)?.stable || x.topic===original.topic) && !recent.slice(-2).includes(x.id) && matches(x) && (!isMixed(x) || !r.weakRoles?.some(role=>plan.skill(role).repeated)));
        if(!r.transferDone && siblings.length){
          const result=pick(siblings,"retry","A different example of a skill to revisit");
          r.transferDone=true;progress.lastRetryQuestion=progress.total;return result;
        }
        if(progress.total-r.lastQuestion>=4 && !recent.slice(-2).includes(original.id)){
          progress.lastRetryQuestion=progress.total;return pick([original],"retry","An unaided check after earlier practice");
        }
      }
    }
    // Retention checks do not block progression or dominate a return session.
    const due=eligible.filter(x=>{const r=own(x);return r?.lastWasCorrect && !r.lastAssisted && r.dueAt<=now && r.dueQuestion<=progress.total && !recent.slice(-2).includes(x.id);}).sort((a,b)=>own(a).dueAt-own(b).dueAt);
    if(due.length && progress.total-(progress.lastRetentionQuestion??-5)>=5){
      progress.lastRetentionQuestion=progress.total;
      return pick(due.slice(0,3),"retention","A later check of familiar material");
    }
    const core=pool.filter(x=>!isMixed(x) && plan.active.includes(x.topic));
    const mixed=pool.filter(x=>isMixed(x) && topic(x.topic)?.stable && !topic(x.topic).mixed.ready && (plan.supported || roles(x).filter(role=>!plan.skill(role).ready).length<=1));
    const combineTurn=progress.total%4<rules.combine;
    if(mixed.length && (combineTurn || !core.length))return pick(mixed,"combine","Combine and transfer familiar patterns");
    if(core.length){
      const label=last && last.topic!==core[0].topic ? "Apply a different selected pattern" : "Establish the current pattern with a varied example";
      return pick(core,"establish",label);
    }
    if(mixed.length)return pick(mixed,"combine","Combine and transfer familiar patterns");
    // Explicit Challenge may have no isolated examples: honour it, choosing
    // combinations with fewer unfamiliar roles rather than changing filters.
    if(plan.active.length){
      const remaining=pool.filter(x=>plan.active.includes(x.topic));
      const min=Math.min(...remaining.map(x=>roles(x).filter(role=>!plan.skill(role).ready).length));
      return pick(remaining.filter(x=>roles(x).filter(role=>!plan.skill(role).ready).length===min),"combine","Build on selected patterns; use Focused if you need individual examples");
    }
    return pick(pool,"review","Selected patterns established — occasional review; add topics or choose Challenge for a new step");
  }
  function status(pool,settings,progress) {
    if(!enabled(settings) || !pool.length)return "";
    const plan=profile(pool,settings,progress);
    const stable=plan.topics.filter(t=>t.stable).length;
    const needsHelp=plan.topics.some(t=>plan.active.includes(t.id) && (t.structure.repeated || t.required.some(role=>plan.skill(role).repeated)));
    if(needsHelp)return "A selected skill needs reinforcement. Try Hint or Supported building if useful; targeted checks are spaced between other questions.";
    const pendingMixed=plan.topics.some(t=>t.hasMixed && !t.mixed.ready);
    if(stable===plan.topics.length && !pendingMixed)return settings.difficulty==="focused" ? "The selected patterns are established. Try Challenge or add topics; occasional reviews remain available." : "You have demonstrated the available patterns. Add topics or lessons for new material; later reviews remain available.";
    return `${stable} of ${plan.topics.length} selected patterns established. ${plan.supported ? "Evidence here reflects arranging supported chunks, not independent particle recall." : "Progress uses spaced unaided answers across different examples."}`;
  }
  globalThis.SENTENCE_PROGRESSION={enabled,readiness,profile,choose,status};
})();

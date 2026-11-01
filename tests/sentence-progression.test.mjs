import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
const context=vm.createContext({});
for(const path of ['content/sentences/course.js','features/sentences/engine.js','features/sentences/progression.js'])vm.runInContext(readFileSync(new URL(`../${path}`,import.meta.url),'utf8'),context);
const C=context.SENTENCE_COURSE,E=context.SENTENCE_ENGINE,P=context.SENTENCE_PROGRESSION;
const topics=Array.from(C.topics.filter(t=>t.lesson===3&&!t.verbGroup),t=>t.id);
const base={activity:'build',support:'independent',input:'choice',difficulty:'auto',learningPace:'balanced',review:'all',vocabulary:'any',topics};
function simulation(settings=base,answer=()=>({correct:true}),rounds=100,progress={items:{},total:0},time=1000){
  const pool=E.pool(settings),recent=[],trace=[];
  for(let i=0;i<rounds;i++){
    const now=time+i*1000;
    const exercise=E.choose(pool,settings,progress,recent,{},()=>.42,now);
    assert.ok(exercise&&pool.includes(exercise));
    trace.push({id:exercise.id,topic:exercise.topic,mixed:exercise.difficulty==='challenge',reason:progress.lastSelection?.reason});
    const outcome=answer(exercise,i),correct=outcome.correct,assisted=outcome.assisted||false;
    const details=E.slots(exercise).map(slot=>({...slot,correct:outcome.particlesCorrect??correct}));
    progress.total++;
    E.record(progress,E.recordKey(exercise,settings),correct,assisted,now,{weakRoles:details.filter(s=>!s.correct).map(s=>s.role),weakWords:outcome.particlesCorrect&&!correct?E.wordIds(exercise):[]});
    E.recordParticleEvidence(progress,exercise,settings,details,assisted,now);
    recent.push(exercise.id);
  }
  return {trace,progress,plan:P.profile(pool,settings,progress)};
}
test('successful learners move beyond basic substitutions into selected combinations',()=>{
  const result=simulation();
  assert.ok(result.plan.topics.filter(t=>t.stable).length>=4);
  assert.ok(result.trace.slice(50).some(x=>x.reason==='combine'));
  assert.ok(result.trace.some(x=>x.mixed));
  assert.ok(new Set(result.trace.slice(0,30).map(x=>x.topic)).size>=3);
});
test('pace controls thresholds and unsettled concept limits',()=>{
  const observations=[{exerciseId:'a',correct:true,at:1,question:1},{exerciseId:'b',correct:true,at:2,question:4},{exerciseId:'c',correct:true,at:3,question:7}];
  assert.equal(P.readiness(observations.slice(0,2),'brisk').ready,true);
  assert.equal(P.readiness(observations.slice(0,2),'balanced').ready,false);
  assert.equal(P.readiness(observations,'balanced').ready,true);
  assert.equal(P.readiness(observations,'gradual').ready,false);
  const empty={items:{},total:0};
  assert.equal(P.profile(E.pool(base),{...base,learningPace:'gradual'},empty).active.length,1);
  assert.equal(P.profile(E.pool(base),base,empty).active.length,2);
  const slow=simulation({...base,learningPace:'gradual'},undefined,35);
  const fast=simulation({...base,learningPace:'brisk'},undefined,35);
  assert.ok(fast.plan.topics.filter(t=>t.stable).length>=slow.plan.topics.filter(t=>t.stable).length);
});
test('hints and immediate repeats do not establish mastery; one error does not erase stable evidence',()=>{
  const events=Array.from({length:4},(_,i)=>({exerciseId:`e${i}`,at:i+1,question:i*3,correct:true}));
  assert.equal(P.readiness(events.map(x=>({...x,assisted:true}))).ready,false);
  assert.equal(P.readiness(events.map(x=>({...x,question:1}))).ready,false);
  assert.equal(P.readiness([...events,{exerciseId:'f',at:5,question:12,correct:false}]).ready,true);
  assert.equal(P.readiness([...events,{exerciseId:'f',at:5,question:12,correct:false},{exerciseId:'g',at:6,question:15,correct:false}]).ready,false);
});
test('Supported progresses its own arrangements without awarding independent particle mastery',()=>{
  const result=simulation({...base,support:'supported'});
  assert.ok(result.trace.some(x=>x.mixed));
  assert.equal(Object.keys(result.progress.items).some(key=>key.startsWith('particleEvidence:')),false);
  const independent=P.profile(E.pool(base),base,result.progress);
  assert.equal(independent.topics.some(t=>t.stable),false);
});
test('repeated errors receive spaced bounded checks without consuming every turn',()=>{
  const result=simulation(base,()=>({correct:false}),60);
  const indices=result.trace.flatMap((x,i)=>x.reason==='retry'?[i]:[]);
  for(let i=1;i<indices.length;i++)assert.ok(indices[i]-indices[i-1]>=3);
  assert.ok(indices.length>0&&indices.length<=20);
  assert.ok(new Set(result.trace.map(x=>x.id)).size>5);
  for(let i=1;i<result.trace.length;i++)assert.notEqual(result.trace[i].id,result.trace[i-1].id);
});
test('partial particle evidence survives wrong verbs; particle combinations can become established',()=>{
  const result=simulation({...base,activity:'particles'},undefined,100);
  assert.ok(result.plan.topics.some(t=>t.mixed.ready));
  const exercise=C.sentences.find(s=>s.id==='companion-home-tv'),progress={items:{},total:1};
  E.recordParticleEvidence(progress,exercise,base,E.slots(exercise).map(s=>({...s,correct:true})),false,1000);
  assert.equal(progress.items[`particleCombination:${exercise.id}`].correct,1);
  assert.equal(progress.items[`build:independent:${exercise.id}`],undefined);
});
test('difficulty and strict filters never broaden, empty and one-item pools remain safe',()=>{
  const strict={...base,difficulty:'challenge',vocabulary:'introduced'};
  assert.equal(E.choose(E.pool(strict,{}),strict,{items:{},total:0}),null);
  const focused=simulation({...base,difficulty:'focused'},undefined,90);
  assert.ok(focused.trace.every(x=>!x.mixed));
  assert.match(P.status(E.pool({...base,difficulty:'focused'}),{...base,difficulty:'focused'},focused.progress),/Challenge/);
  const challenge=simulation({...base,difficulty:'challenge'},undefined,20);
  assert.ok(challenge.trace.every(x=>x.mixed));
  const one={...base,topics:['identity']},exercise=C.sentences.find(x=>x.id==='identity-gakusei');
  assert.equal(E.choose([exercise],one,{items:{},total:0},[exercise.id]).id,exercise.id);
});
test('returning learners receive bounded retention checks and saved evidence is reused',()=>{
  const learned=simulation(base,undefined,80);
  const resumed=simulation(base,undefined,30,JSON.parse(JSON.stringify(learned.progress)),86400000);
  const reviews=resumed.trace.flatMap((x,i)=>x.reason==='retention'?[i]:[]);
  assert.ok(reviews.length>0&&reviews.length<=6);
  for(let i=1;i<reviews.length;i++)assert.ok(reviews[i]-reviews[i-1]>=5);
  assert.ok(resumed.trace.some(x=>x.mixed));
});
test('verbs and Trouble practice keep their existing scheduler and controls',()=>{
  assert.equal(P.enabled({...base,activity:'verbs'}),false);
  assert.equal(P.enabled({...base,review:'trouble'}),false);
});


test('switching from Focused to Challenge reuses established topic evidence',()=>{
  const settings={...base,difficulty:'focused'};
  const learned=simulation(settings,undefined,110);
  const challenge={...base,difficulty:'challenge'};
  const before=JSON.stringify(learned.progress.items);
  const plan=P.profile(E.pool(challenge),challenge,learned.progress);
  assert.ok(plan.topics.some(t=>t.stable));
  assert.equal(JSON.stringify(learned.progress.items),before);
});

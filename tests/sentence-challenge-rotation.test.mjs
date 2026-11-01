import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
const c=vm.createContext({});
for(const p of ['content/sentences/course.js','features/sentences/engine.js','features/sentences/progression.js'])vm.runInContext(readFileSync(new URL(`../${p}`,import.meta.url),'utf8'),c);
const C=c.SENTENCE_COURSE,E=c.SENTENCE_ENGINE,P=c.SENTENCE_PROGRESSION;
const base={activity:'build',support:'independent',buildInput:'tiles',input:'choice',difficulty:'challenge',learningPace:'brisk',review:'all',vocabulary:'introduced',topics:['objects','destination','action-place','time','companion','negative','existence','relative-location']};
const vocabulary={items:Object.fromEntries(Object.values(C.words).filter(w=>!w.foundation).flatMap(w=>w.vocabularyIds.map(id=>[id,{introduced:true,seen:2,mastery:80}])))};
function answer(progress,s,ex,correct=true,assisted=false){
  const now=100000+progress.total*1000;progress.total++;
  E.record(progress,E.recordKey(ex,s),correct,assisted,now,{weakRoles:correct?[]:E.slots(ex).map(x=>x.role)});
  E.recordParticleEvidence(progress,ex,s,E.slots(ex).map(x=>({...x,correct})),assisted,now);
}
function prior(s){
  const progress={items:{},total:0};
  for(const topic of ['objects','destination','negative'])for(const ex of C.sentences.filter(x=>x.topic===topic&&x.difficulty==='focused').slice(0,2)){
    answer(progress,s,ex);progress.total+=2;
  }
  answer(progress,s,C.sentences.find(x=>x.id==='place-library-friend-book'));
  return progress;
}
function run(s,progress,rounds=60,outcome=()=>({correct:true}),pool=E.pool(s,vocabulary)){
  const recent=[],trace=[];
  for(let i=0;i<rounds;i++){
    const ex=E.choose(pool,s,progress,recent,vocabulary,()=>.42,100000+progress.total*1000);
    assert.ok(ex&&pool.includes(ex));trace.push({id:ex.id,topic:ex.topic,reason:progress.lastSelection.reason});
    const result=outcome(i);answer(progress,s,ex,result.correct,result.assisted||false);recent.push(ex.id);
  }
  return trace;
}
test('the screenshot’s 22/30 Challenge pool escapes the three-sentence loop after successful answers',()=>{
  assert.equal(E.pool(base,vocabulary).length,22);assert.equal(E.pool({...base,vocabulary:'any'}).length,30);
  const progress=prior(base),trace=run(base,progress);
  assert.ok(trace.filter(x=>x.id==='place-library-friend-book').length<=6);
  assert.ok(new Set(trace.slice(-15).map(x=>x.id)).size>=8);
  for(const topic of ['existence','relative-location'])assert.ok(trace.some(x=>x.topic===topic),topic);
  for(let i=1;i<trace.length;i++)assert.notEqual(trace[i].id,trace[i-1].id);
  const resumed=run(base,JSON.parse(JSON.stringify(progress)),30);
  assert.ok(new Set(resumed.map(x=>x.id)).size>=10,'saved history still rotates after reload');
  assert.match(P.status(E.pool(base,vocabulary),base,progress),/Challenge/);
});
test('all learning paces, Supported, particles, and typed building keep broad Challenge coverage',()=>{
  for(const learningPace of ['gradual','balanced','brisk'])for(const variant of [{support:'supported'},{support:'independent'},{support:'independent',buildInput:'typing'},{activity:'particles'}]){
    const s={...base,learningPace,...variant},trace=run(s,prior(s),100);
    assert.ok(new Set(trace.slice(-30).map(x=>x.id)).size>=8,JSON.stringify(variant));
    assert.ok(trace.some(x=>x.topic==='existence'));assert.ok(trace.some(x=>x.topic==='relative-location'));
  }
});
test('single-topic Challenge successes can establish structure, but one repeated sentence cannot prove breadth',()=>{
  const s={...base,vocabulary:'any',topics:['objects']},progress={items:{},total:0};
  const examples=C.sentences.filter(x=>x.topic==='objects'&&x.difficulty==='challenge');
  for(let i=0;i<2;i++){answer(progress,s,examples[i]);progress.total+=2;}
  assert.equal(P.profile(E.pool(s),s,progress).topics[0].structure.ready,true);
  const one={...base,topics:['action-place']},p={items:{},total:0},ex=C.sentences.find(x=>x.id==='place-library-friend-book');
  run(one,p,20,undefined,[ex]);
  assert.equal(P.profile([ex],one,p).topics[0].structure.ready,false);
});
test('mistakes stay bounded, assisted answers do not establish patterns, and filters are never broadened',()=>{
  const p={items:{},total:0},trace=run(base,p,60,()=>({correct:false}));
  const retries=trace.flatMap((x,i)=>x.reason==='retry'?[i]:[]);
  for(let i=1;i<retries.length;i++)assert.ok(retries[i]-retries[i-1]>=3);
  const assisted={items:{},total:0};run(base,assisted,40,()=>({correct:true,assisted:true}));
  const plan=P.profile(E.pool(base,vocabulary),base,assisted);
  assert.ok([...plan.combinations.values()].every(x=>!x.ready));
  assert.ok(plan.topics.every(x=>!x.structure.ready));
  assert.equal(E.choose(E.pool(base,{}),base,{items:{},total:0}),null);
});

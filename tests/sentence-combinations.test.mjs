import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
const context=vm.createContext({});
for(const path of ['content/sentences/course.js','features/sentences/engine.js','features/sentences/progression.js'])vm.runInContext(readFileSync(new URL(`../${path}`,import.meta.url),'utf8'),context);
const C=context.SENTENCE_COURSE,E=context.SENTENCE_ENGINE,P=context.SENTENCE_PROGRESSION;
const settings={activity:'build',support:'independent',input:'choice',difficulty:'auto',learningPace:'balanced',review:'all',vocabulary:'any',topics:Array.from(C.topics.filter(t=>!t.verbGroup),t=>t.id)};
const mixed=Array.from(E.sentenceExamples.filter(x=>x.requiredTopics)),plain=x=>JSON.parse(JSON.stringify(x));

test('mixed content has unique models, explicit valid requirements, and checked level metadata',()=>{
  assert.ok(mixed.length>=60);
  assert.equal(C.sentences.filter(s=>!s.lesson4Expansion&&!s.familyExpansion).length,160,'preserve the original collection and its IDs');
  const ids=new Set(),models=new Set();
  for(const exercise of E.sentenceExamples){
    assert.ok(!ids.has(exercise.id),exercise.id);ids.add(exercise.id);
    const model=E.normalize(E.model(exercise));
    assert.ok(!models.has(model),`duplicate sentence: ${exercise.id}`);models.add(model);
  }
  for(const ex of mixed){
    assert.ok(ex.requiredTopics.length>=2&&ex.requiredTopics.length<=4);
    assert.equal(new Set(ex.requiredTopics).size,ex.requiredTopics.length);
    assert.ok(ex.requiredTopics.includes(ex.topic));
    assert.ok(ex.requiredTopics.every(id=>C.topics.some(t=>t.id===id&&!t.verbGroup)));
    assert.equal(ex.difficulty,'challenge');
    const siblings=mixed.filter(other=>[...other.requiredTopics].sort().join('+')===[...ex.requiredTopics].sort().join('+'));
    assert.ok(siblings.length>=2,'each combination needs distinct transfer examples');
    if(ex.requiredTopics.length>2)assert.ok(mixed.some(other=>other.requiredTopics.length===ex.requiredTopics.length-1&&other.requiredTopics.every(id=>ex.requiredTopics.includes(id))),'longer combinations need an authored progression path');
    assert.ok(E.acceptedSentences(ex).has(E.normalize(E.model(ex))),ex.id);
    for(const order of ex.orders){
      assert.deepEqual([...order].sort(),Array.from(ex.chunks,(_,i)=>i));
      assert.equal(order.at(-1),ex.chunks.length-1,'keep the sentence ending last');
    }
  }
});

test('every topic subset of each combination uses all-of selection; deselection removes it in every format',()=>{
  for(const ex of mixed)for(let mask=0;mask<(1<<ex.requiredTopics.length);mask++){
    const topics=ex.requiredTopics.filter((_,i)=>mask&(1<<i));
    for(const activity of ['build','particles'])for(const difficulty of ['auto','focused','challenge']){
      const pool=E.pool({...settings,activity,difficulty,topics});
      assert.equal(pool.includes(ex),topics.length===ex.requiredTopics.length&&difficulty!=='focused',`${ex.id}: ${topics}/${activity}/${difficulty}`);
    }
  }
  assert.ok(!E.pool({...settings,activity:'verbs'}).some(x=>x.requiredTopics));
  const reversed=E.pool({...settings,topics:[...settings.topics].reverse()}).map(x=>x.id);
  assert.deepEqual(plain(reversed),plain(E.pool(settings).map(x=>x.id)));
});

test('mixed grammar requirements cover all tested particle roles and past or negative endings',()=>{
  const topicForRole={possession:['possession','relative-location'],question:['questions','question-words'],also:['also'],object:['objects','question-words','verb-particles','quantity-frequency'],destination:['destination','question-words','quantity-frequency'],place:['action-place','relative-location','question-words'],time:['time'],existencePlace:['existence','quantity-frequency','also-actions'],subject:['existence','quantity-frequency'],list:['listing-nouns','relative-location'],duration:['duration','question-words'],companion:['companion','question-words']};
  for(const ex of mixed){
    for(const slot of E.slots(ex))if(topicForRole[slot.role])assert.ok(topicForRole[slot.role].some(id=>[...ex.requiredTopics,...(ex.backgroundTopics||[])].includes(id)),`${ex.id}: ${slot.role}`);
    for(const piece of E.pieces(ex)){
      if(/ません|ました/.test(piece.text))assert.ok((/でした|ました/.test(piece.text) ? ex.requiredTopics.includes('past-actions') : ['negative','existence','quantity-frequency'].some(id=>ex.requiredTopics.includes(id))),`${ex.id}: ${piece.text}`);
      if(/でした|じゃなかったです/.test(piece.text)&&!piece.wordId)assert.ok(ex.requiredTopics.includes('past-nouns'),ex.id);
      if(['kore','sore','are','kono'].includes(piece.wordId))assert.ok([...ex.requiredTopics,...(ex.backgroundTopics||[])].includes('pointing'),ex.id);
    }
  }
});

test('all mixed sentence orders and noun-list reversals grade and diagnose correctly, without accepting wrong markers or verbs',()=>{
  for(const ex of mixed){
    for(const chunks of [ex.chunks,...(ex.alternatives||[])])for(const order of ex.orders){
      const tokens=order.flatMap(i=>chunks[i]);
      assert.ok(E.acceptedSentences(ex).has(E.normalize(tokens.map(x=>x.text).join(''))),ex.id);
      assert.ok(E.diagnose(ex,tokens).every(x=>x.correct),ex.id);
      assert.equal(E.unexpectedWords(ex,tokens).length,0);
    }
    const slot=E.slots(ex).find(x=>x.choices.length===1&&x.choices[0]);
    if(slot){
      const tokens=plain(E.pieces(ex));tokens[slot.index].text=slot.choices.includes('で')?'に':'で';
      assert.ok(!E.acceptedSentences(ex).has(E.normalize(tokens.map(x=>x.text).join(''))),ex.id);
      assert.ok(E.diagnose(ex,tokens).some(x=>!x.correct),ex.id);
    }
    const verb=E.pieces(ex).find(piece=>C.verbs.some(v=>v.id===piece.wordId));
    if(verb){
      const tokens=plain(E.pieces(ex));tokens.find(x=>x.wordId===verb.wordId).text=verb.text.endsWith('ます')?verb.text.replace(/ます$/,'ません'):verb.text.replace(/ました$|ませんでした$|ません$/,'ます');
      assert.ok(!E.acceptedSentences(ex).has(E.normalize(tokens.map(x=>x.text).join(''))),ex.id);
      assert.ok(E.diagnose(ex,tokens).every(x=>x.correct),'a wrong verb must not erase correct particles');
    }
    if(ex.optionalTopic==='add')assert.ok(E.acceptedSentences(ex).has(E.normalize('わたしは'+E.model(ex))),ex.id);
  }
});

test('every content word and distractor respects strict introduced and mastered vocabulary',()=>{
  for(const ex of mixed){
    const items={};
    for(const id of E.wordIds(ex).filter(id=>!C.words[id].foundation))for(const key of C.words[id].vocabularyIds)items[key]={introduced:true,seen:3,mastery:80};
    for(const vocabulary of ['introduced','mastered']){
      const s={...settings,vocabulary};
      const unavailable=E.wordIds(ex).some(id=>C.words[id].foundation);
      assert.equal(E.pool(s,{items}).includes(ex),!unavailable,ex.id);
      assert.ok(!E.pool(s,{}).includes(ex),ex.id);
      for(const supported of [true,false]){
        const bank=E.tileBank(ex,supported,()=>.42,{settings:s,vocabulary:{items}});
        assert.equal(bank.filter(x=>!x.distractor).length,supported?ex.chunks.length:E.pieces(ex).filter(x=>!x.role).length);
        assert.ok(bank.filter(x=>x.distractor).every(x=>x.wordIds.every(id=>E.familiar(id,{items},vocabulary==='mastered'))),ex.id);
      }
      const id=E.wordIds(ex).find(id=>!C.words[id].foundation),missing=plain(items);
      for(const key of C.words[id].vocabularyIds)delete missing[key];
      assert.ok(!E.pool(s,{items:missing}).includes(ex));
    }
  }
});

test('Auto gates every concept, then a demonstrated simpler combination; Challenge permits direct practice',()=>{
  const ex=mixed.find(x=>x.requiredTopics.length===4);
  const plan={topics:ex.requiredTopics.map(id=>({id,stable:true})),combinations:new Map()};
  const pair=mixed.find(x=>x.requiredTopics.length===2&&x.requiredTopics.every(id=>ex.requiredTopics.includes(id)));
  assert.equal(P.combinationAvailable(pair,plan,settings),true);
  plan.topics.find(x=>x.id===pair.requiredTopics[1]).stable=false;
  assert.equal(P.combinationAvailable(pair,plan,settings),false);
  assert.equal(P.combinationAvailable(pair,plan,{...settings,difficulty:'challenge'}),true);
  plan.topics.forEach(x=>x.stable=true);
  assert.equal(P.combinationAvailable(ex,plan,settings),false);
  plan.combinations.set('unrelated',{ready:true,topics:['time','companion','destination']});
  assert.equal(P.combinationAvailable(ex,plan,settings),false);
  plan.combinations.set('pair',{ready:true,topics:pair.requiredTopics});
  assert.equal(P.combinationAvailable(ex,plan,settings),false,'two topics cannot jump straight to four');
  const triple=mixed.find(x=>x.requiredTopics.length===3&&x.requiredTopics.every(id=>ex.requiredTopics.includes(id)));
  plan.combinations.set('triple',{ready:true,topics:triple.requiredTopics});
  assert.equal(P.combinationAvailable(ex,plan,settings),true);
});

function run(s,rounds=220,progress={total:0,items:{}},outcome=()=>({correct:true})){
  const pool=E.pool(s),recent=[],trace=[];
  for(let i=0;i<rounds;i++){
    const plan=P.profile(pool,s,progress),now=1000+progress.total*1000;
    const ex=E.choose(pool,s,progress,recent,{},()=>.42,now);
    assert.ok(ex&&pool.includes(ex));
    if(ex.requiredTopics)assert.ok(P.combinationAvailable(ex,plan,s),ex.id);
    trace.push({id:ex.id,size:ex.requiredTopics?.length||1,reason:progress.lastSelection.reason});
    const {correct,assisted=false}=outcome(ex,i),details=E.slots(ex).map(x=>({...x,correct}));
    progress.total++;
    E.record(progress,E.recordKey(ex,s),correct,assisted,now,{weakRoles:details.filter(x=>!x.correct).map(x=>x.role)});
    E.recordParticleEvidence(progress,ex,s,details,assisted,now);
    recent.push(ex.id);
  }
  return {trace,progress,plan:P.profile(pool,s,progress)};
}

test('successful Auto practice reaches two, three and four concepts, with spaced rotation in both activities',()=>{
  const topics=['duration','relative-location','verb-particles','past-actions'];
  for(const activity of ['build','particles'])for(const support of activity==='build'?['supported','independent']:['independent']){
    const result=run({...settings,activity,support,topics});
    for(const size of [2,3,4])assert.ok(result.trace.some(x=>x.size===size),`${activity}/${support} did not reach ${size}`);
    for(let i=1;i<result.trace.length;i++)assert.notEqual(result.trace[i].id,result.trace[i-1].id);
    assert.ok(result.trace.findIndex(x=>x.size===2)<result.trace.findIndex(x=>x.size===3));
    assert.ok(result.trace.findIndex(x=>x.size===3)<result.trace.findIndex(x=>x.size===4));
  }
});

test('mixed successes never award isolated-topic mastery; support stays separate; failures remain bounded',()=>{
  const topics=['duration','relative-location','verb-particles','past-actions'],s={...settings,topics,difficulty:'challenge'};
  const pool=E.pool(s),ex=pool.find(x=>x.requiredTopics?.length===2),progress={total:0,items:{}};
  for(let i=0;i<4;i++){
    progress.total=i*3+1;E.record(progress,E.recordKey(ex,s),true,false,1000+i*1000);
    E.recordParticleEvidence(progress,ex,s,E.slots(ex).map(x=>({...x,correct:true})),false,1000+i*1000);
  }
  assert.ok(P.profile(pool,s,progress).topics.every(x=>!x.structure.ready));
  const assisted=run({...settings,topics},50,undefined,()=>({correct:true,assisted:true}));
  assert.ok(assisted.trace.every(x=>x.size===1));
  const failed=run({...settings,topics},60,undefined,()=>({correct:false}));
  assert.ok(failed.trace.every(x=>x.size===1));
  const retries=failed.trace.flatMap((x,i)=>x.reason==='retry'?[i]:[]);
  for(let i=1;i<retries.length;i++)assert.ok(retries[i]-retries[i-1]>=3);
});

test('particle combination evidence preserves correct particles after wrong verbs, without duplicate grading',()=>{
  const ex=mixed.find(x=>x.id==='mix-past-hour-library-front-wait'),progress={items:{},total:0};
  for(let i=0;i<4;i++){
    progress.total=1+i*3;
    E.record(progress,E.recordKey(ex,settings),false,false,1000+i*1000);
    E.recordParticleEvidence(progress,ex,settings,E.slots(ex).map(x=>({...x,correct:true})),false,1001+i*1000);
  }
  const particleSettings={...settings,activity:'particles'};
  const plan=P.profile(E.pool(particleSettings),particleSettings,progress);
  const skill=plan.combinations.get([...ex.requiredTopics].sort().join('+'));
  assert.equal(skill.weak,false);
  assert.equal(skill.successes,4);
  assert.ok(plan.topics.every(x=>!x.structure.ready));
  assert.equal(E.roleTopic(ex,'waiting'),'verb-particles');assert.equal(E.roleTopic(ex,'duration'),'duration');
  assert.equal(E.roleTopic(C.sentences.find(x=>x.id==='past-read'),'object'),'past-actions','retain existing single-topic targets');
});

test('all paces retain filter boundaries and recover progress after saving and switching modes',()=>{
  for(const learningPace of ['gradual','balanced','brisk']){
    const s={...settings,learningPace,topics:['duration','relative-location','verb-particles','past-actions']};
    const learned=run(s,180);
    assert.ok(learned.trace.some(x=>x.size===2),learningPace);
    const resumed=run({...s,activity:'particles'},30,plain(learned.progress));
    assert.ok([...resumed.plan.combinations.values()].some(x=>x.ready),`${learningPace}: shared combination progress must survive the format switch`);
    const narrowed={...s,topics:['objects','action-place']};
    assert.ok(E.pool(narrowed).every(ex=>E.requirements(ex).every(id=>narrowed.topics.includes(id))));
    assert.ok(!E.pool(narrowed).some(x=>x.requiredTopics),'incompatible selections do not invent combinations');
  }
});

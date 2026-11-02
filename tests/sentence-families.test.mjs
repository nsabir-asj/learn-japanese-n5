import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
const c=vm.createContext({});
for(const f of ['features/kana/vocabulary-speaking.js','content/sentences/course.js','features/sentences/engine.js','features/sentences/progression.js'])vm.runInContext(readFileSync(new URL('../'+f,import.meta.url),'utf8'),c);
const C=c.SENTENCE_COURSE,E=c.SENTENCE_ENGINE,P=c.SENTENCE_PROGRESSION;
const base={activity:'build',support:'independent',input:'choice',difficulty:'auto',learningPace:'brisk',review:'all',vocabulary:'any',topics:['existence','relative-location']};
const byId=id=>E.sentenceExamples.find(x=>x.id===id);
const accepts=(id,jp)=>E.acceptedSentences(byId(id)).has(E.normalize(jp));
function answer(progress,s,x,i){progress.total++;E.record(progress,E.recordKey(x,s),true,false,1000+i*1000);E.recordParticleEvidence(progress,x,s,E.slots(x).map(slot=>({...slot,correct:true})),false,1000+i*1000);}
test('two selected Lesson 4 families offer distinct skills and short Challenge contrasts',()=>{
  const all=E.pool(base),hard=E.pool({...base,difficulty:'challenge'});
  assert.equal(all.length,64);assert.equal(hard.length,43);
  for(const t of C.topics.filter(t=>t.skills))for(const skill of t.skills)assert.ok(E.sentenceExamples.some(x=>x.topic===t.id&&x.skill===skill.id),`${t.id}/${skill.id}`);
  for(const id of ['family-person-student','family-no-students','family-study-near-library','family-go-front-library','family-correct-under'])assert.ok(hard.includes(byId(id)),id);
  assert.ok(E.pieces(byId('family-person-student')).filter(x=>x.role).length<3,'conceptual demand is not a particle-count threshold');
});
test('earlier grammar supports the selected focus but unselected Lesson 4 concepts remain excluded',()=>{
  const pool=E.pool(base);
  for(const id of ['family-behind-friend-desk','family-breakfast-front-university','family-go-near-temple','family-have-language-book']){
    const x=byId(id);assert.ok(x&&pool.includes(x),id);
  }
  assert.ok(pool.includes(byId('family-have-language-book')));
  assert.ok(pool.every(x=>E.requirements(x).every(id=>base.topics.includes(id))));
  assert.ok(!pool.includes(byId('mix-past-hour-library-front-wait')));
  assert.ok(!pool.includes(byId('mix-yesterday-test')));
  assert.ok(E.pool({...base,topics:['existence','past-actions']}).includes(byId('mix-yesterday-test')));
  for(const x of pool)assert.ok((x.backgroundTopics||[]).every(id=>C.topics.find(t=>t.id===id).lesson<4));
  assert.ok(!E.pool({...base,topics:['possession']}).includes(byId('family-have-language-book')),'supporting grammar never becomes the main selected focus');
});
test('legacy having selection resolves to the existence family without changing exercise records',()=>{
  assert.deepEqual(Array.from(E.normalizeTopics(['existence-uses','existence','relative-location'])),['existence','relative-location']);
  assert.equal(C.topics.find(t=>t.id==='existence-uses').parentTopic,'existence');
  assert.deepEqual(Array.from(E.pool({...base,topics:['existence-uses']}),x=>x.id),Array.from(E.pool({...base,topics:['existence']}),x=>x.id));
  const x=byId('l4-have-bicycle'),state={total:1,items:{}};E.record(state,E.recordKey(x,base),true,false,1000);
  assert.equal(state.items['build:independent:l4-have-bicycle'].correct,1);assert.equal(x.topic,'existence');
});
test('location alternatives distinguish known topics, identity, activities, movement and reference points',()=>{
  for(const jp of ['ねこはうちにいます','ねこはうちです'])assert.ok(accepts('family-known-cat',jp),jp);
  for(const jp of ['ほんはとしょかんにあります','ほんはとしょかんです'])assert.ok(accepts('family-known-book',jp),jp);
  assert.ok(!accepts('family-known-cat','ねこはうちにあります'));
  assert.ok(!accepts('family-person-student','あのひとはがくせいがいます'));
  assert.ok(accepts('family-study-near-library','としょかんのちかくでべんきょうします'));
  assert.ok(!accepts('family-study-near-library','としょかんのちかくにべんきょうします'));
  assert.ok(accepts('family-go-front-library','としょかんのまえへいきます'));
  assert.ok(!accepts('family-go-front-library','としょかんのまえでいきます'));
  assert.ok(accepts('family-chair-left-desk','いすはつくえのひだりです'));
  assert.ok(!accepts('family-chair-left-desk','つくえはいすのひだりです'));
  assert.ok(accepts('family-desk-right-chair','つくえはいすのみぎです'));
});
test('other Lesson 4 families cover habits, prices, clock contrasts and lists with correct alternatives',()=>{
  for(const jp of ['こどものときよくこうえんにいきました','こどものときによくこうえんへいきました'])assert.ok(accepts('family-child-park',jp));
  for(const ending of ['じゃなかったです','ではありませんでした','じゃありませんでした','ではなかったです'])assert.ok(accepts('family-person-not-teacher-past','あのひとはせんせい'+ending));
  assert.ok(!accepts('family-person-not-teacher-past','あのひとはせんせいませんでした'));
  assert.ok(accepts('family-book-price','このほんはさんぜんえんでした'));
  assert.ok(accepts('family-clock-duration','しちじにいちじかんべんきょうします'));
  assert.ok(!accepts('family-clock-duration','しちじいちじかんにべんきょうします'));
  assert.ok(accepts('family-list-companions','せんせいとともだちとべんきょうします'));
  assert.ok(accepts('family-list-companions','ともだちとせんせいとべんきょうします'));
  for(const marker of ['も','にも'])assert.ok(accepts('family-also-monday','げつようび'+marker+'べんきょうします'));
});
test('skill coverage respects vocabulary filters and never establishes a whole family from its basic patterns alone',()=>{
  const s={...base,topics:['existence']},pool=E.pool(s),progress={total:0,items:{}};
  const core=pool.filter(x=>x.difficulty==='focused');
  let i=0;for(let round=0;round<4;round++)for(const x of core)answer(progress,s,x,i++);
  const before=P.profile(pool,s,progress).topics[0];assert.equal(before.foundationReady,true);assert.equal(before.stable,false);assert.equal(before.coverageReady,false);
  const recent=[];for(let turn=0;turn<100;turn++){const x=E.choose(pool,s,progress,recent,{},()=>.42,1000+i*1000);answer(progress,s,x,i++);recent.push(x.id);}
  assert.equal(P.profile(pool,s,progress).topics[0].coverageReady,true,'advanced contrasts must become reachable without a mastery deadlock');
  assert.equal(E.pool({...s,vocabulary:'introduced'},{}).length,0);
  const limited=E.pool({...s,vocabulary:'introduced'},{items:{jitensha:{introduced:true},aru:{introduced:true}}});
  assert.ok(limited.length>0);assert.ok(P.profile(limited,s,{total:0,items:{}}).topics[0].availableSkills<before.availableSkills,'unavailable vocabulary must not create unreachable coverage requirements');
});
test('the scheduler interleaves distinct skills while maintaining saved scores and assisted boundaries',()=>{
  for(const activity of ['build','particles']){
    const s={...base,activity,difficulty:'challenge'},pool=E.pool(s),progress={total:0,items:{}},recent=[],keys=[];
    for(let i=0;i<4;i++){const x=E.choose(pool,s,progress,recent,{},()=>.42,1000+i*1000);keys.push(x.topic+':'+x.skill);answer(progress,s,x,i);recent.push(x.id);}
    assert.equal(new Set(keys).size,4);
    const assisted={total:0,items:{}};for(let i=0;i<6;i++){assisted.total=i*3;E.record(assisted,E.recordKey(pool[i],s),true,true,1000+i*1000);}
    assert.ok(P.profile(pool,s,assisted).topics.every(t=>t.checkedSkills===0));
  }
});

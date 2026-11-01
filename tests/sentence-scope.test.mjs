import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
const c=vm.createContext({});
for(const path of ['content/sentences/course.js','features/sentences/engine.js','features/sentences/scope.js'])vm.runInContext(readFileSync(new URL(`../${path}`,import.meta.url),'utf8'),c);
const E=c.SENTENCE_ENGINE,C=c.SENTENCE_COURSE,S=c.SENTENCE_SCOPE;
const all=Array.from(C.topics.filter(t=>!t.verbGroup),t=>t.id);
const base={activity:'build',support:'independent',difficulty:'challenge',vocabulary:'any'};
const describe=(selected,settings=base,vocab={},items={})=>S.describe(selected,all,topics=>E.pool({...settings,topics},vocab).filter(x=>settings.review!=='trouble'||items[E.recordKey(x,settings)]?.lastWasCorrect===false&&items[E.recordKey(x,settings)]?.wrong>0));
test('zero standalone counts distinguish usable mixed material from missing compatible selections',()=>{
  const single=describe(['destination']);
  assert.equal(single.rows.get('destination').label,'Needs compatible topics');
  const paired=describe(['destination','companion']);
  assert.equal(paired.rows.get('destination').label,'Mixed practice only');
  assert.ok(paired.mixed>0);
  assert.equal(paired.total,paired.standalone+paired.mixed);
  assert.equal(describe([]).rows.get('destination').label,'Needs compatible topics');
});
test('strict vocabulary and Trouble filters cannot misleadingly advertise mixed availability',()=>{
  for(const settings of [{...base,vocabulary:'introduced'},{...base,vocabulary:'mastered'},{...base,review:'trouble'}]){
    const result=describe(['destination','companion'],settings);
    assert.equal(result.total,0);
    assert.equal(result.rows.get('destination').label,'No matches with these filters');
  }
  const settings={...base,review:'trouble'},ex=C.mixedSentences.find(x=>x.requiredTopics.length===2&&x.requiredTopics.includes('destination')&&x.requiredTopics.includes('companion'));
  const result=describe(['destination','companion'],settings,{}, {[E.recordKey(ex,settings)]:{lastWasCorrect:false,wrong:1}});
  assert.equal(result.rows.get('destination').label,'Mixed practice only');assert.equal(result.total,1);
});
test('standalone labels, unchecked-topic previews, and totals follow the actual difficulty',()=>{
  const focused=describe(['destination'],{...base,difficulty:'focused'});
  assert.match(focused.rows.get('destination').label,/^\d+ standalone$/);
  assert.equal(focused.mixed,0);
  const preview=describe(['companion']);
  assert.equal(preview.rows.get('destination').label,'Mixed practice only','shows what checking the topic would add');
  for(const difficulty of ['auto','focused','challenge']){
    const settings={...base,difficulty},result=describe(all,settings);
    assert.equal(result.total,E.pool({...settings,topics:all}).length);
    assert.equal(result.total,result.standalone+result.mixed);
  }
});
test('verb topics retain exercise counts without mixed-only claims',()=>{
  const ids=Array.from(C.topics.filter(t=>t.verbGroup),t=>t.id);
  const result=S.describe(ids,ids,topics=>E.pool({...base,activity:'verbs',topics}),true);
  assert.equal(result.mixed,0);
  assert.ok([...result.rows.values()].every(x=>/^\d+ exercises$/.test(x.label)));
});

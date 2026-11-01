import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
const c=vm.createContext({});
for(const p of ['content/sentences/course.js','features/sentences/engine.js'])vm.runInContext(readFileSync(new URL(`../${p}`,import.meta.url),'utf8'),c);
const C=c.SENTENCE_COURSE,E=c.SENTENCE_ENGINE;
const ex=C.sentences.find(x=>x.id==='past-read');
const settings={activity:'build',difficulty:'challenge',bankSize:'auto',vocabulary:'any'};
test('Challenge Auto expands both banks while manual counts and other difficulty defaults remain independent',()=>{
  for(const supported of [true,false]){
    assert.equal(E.tileBank(ex,supported,()=>.4,{settings}).length,supported?8:12);
    assert.equal(E.tileBank(ex,supported,()=>.4,{settings:{...settings,bankSize:'8'}}).length,8);
    for(const difficulty of ['auto','focused'])assert.equal(E.tileBank(ex,supported,()=>.4,{settings:{...settings,difficulty}}).length,supported?6:8);
  }
});
test('Challenge contrasts include tense, polarity, and particle placement without later-lesson grammar',()=>{
  const independent=E.tileBank(ex,false,()=>.4,{settings});
  for(const text of ['よみます','よみません','よみませんでした'])assert.ok(independent.some(x=>x.text===text),text);
  const place=C.sentences.find(x=>x.id==='place-library');
  const chunks=E.tileBank(place,true,()=>.4,{settings});
  assert.ok(chunks.some(x=>x.text==='としょかんに'));
  assert.ok(!E.acceptedSentences(place).has(E.normalize('としょかんにほんをよみます')));
  for(const tile of E.tileBank(place,false,()=>.4,{settings}))assert.ok(!/ました|ませんでした/.test(tile.text),'Lesson 3 keeps nonpast forms');
});
test('strict filters bound extras, required tiles remain available, and valid alternative particles still grade correctly',()=>{
  const vocabulary={items:{hon:{introduced:true,seen:1,mastery:80},yomu:{introduced:true,seen:1,mastery:80},kinou:{introduced:true,seen:1,mastery:80}}};
  for(const vocabularyFilter of ['introduced','mastered'])for(const supported of [true,false]){
    const bank=E.tileBank(ex,supported,()=>.4,{settings:{...settings,vocabulary:vocabularyFilter},vocabulary});
    assert.ok(bank.every(x=>x.wordIds.every(id=>E.familiar(id,vocabulary,vocabularyFilter==='mastered'))));
    assert.equal(bank.filter(x=>!x.distractor).length,supported?ex.chunks.length:E.pieces(ex).filter(x=>!x.role).length);
    assert.equal(new Set(bank.map(x=>x.text)).size,bank.length);
  }
  const destination=C.sentences.find(x=>x.id==='destination-daigaku');
  assert.ok(E.acceptedSentences(destination).has(E.normalize('だいがくへいきます')));
  assert.ok(E.acceptedSentences(destination).has(E.normalize('だいがくにいきます')));
});

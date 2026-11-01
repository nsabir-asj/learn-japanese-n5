import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
const c=vm.createContext({});
for(const file of ['features/kana/vocabulary-speaking.js','content/sentences/course.js','features/sentences/engine.js','features/sentences/composer.js','features/sentences/progression.js'])vm.runInContext(readFileSync(new URL('../'+file,import.meta.url),'utf8'),c);
const C=c.SENTENCE_COURSE,E=c.SENTENCE_ENGINE,T=c.SENTENCE_COMPOSER;
const ex=id=>E.sentenceExamples.find(s=>s.id===id);
const accepts=(id,text)=>E.acceptedSentences(ex(id)).has(E.normalize(text));
test('Lesson 4 adds five selectable topics and 76 distinct sentences without replacing existing IDs',()=>{
  assert.equal(C.sentences.filter(s=>s.lesson4Expansion).length,48);
  assert.equal(C.mixedSentences.filter(s=>s.lesson4Expansion).length,28);
  for(const id of ['existence-uses','also-actions','verb-particles','quantity-frequency','question-words']){
    const topic=C.topics.find(t=>t.id===id);assert.equal(topic.lesson,4);assert.ok(topic.rule&&topic.examples.length>=2);
    assert.ok(C.sentences.filter(s=>s.topic===id&&s.difficulty==='focused').length>=2,id);
  }
});
test('event venues and things you have use distinct explanations and reject physical-location marking for events',()=>{
  assert.ok(accepts('l4-event-university-test','だいがくでテストがあります'));
  assert.ok(!accepts('l4-event-university-test','だいがくにテストがあります'));
  assert.ok(accepts('l4-have-siblings','きょうだいがいます'));
  assert.ok(!accepts('l4-have-siblings','きょうだいがあります'));
  assert.ok(accepts('l4-have-no-time','わたしはじかんがありません'));
  assert.match(C.roles.eventPlace.note,/event/);assert.match(C.roles.ownedSubject.note,/have/);
});
test('particle combinations accept separate tiles, joined input and romaji, without accepting the wrong location role',()=>{
  for(const [id,good,bad] of [['l4-also-study-library','としょかんでもべんきょうします','としょかんにもべんきょうします'],['l4-also-go-library','としょかんにもいきます','としょかんでもいきます']]){
    assert.ok(accepts(id,good));assert.ok(!accepts(id,bad));
    const choices=E.particleChoices(ex(id));assert.ok(['にも','へも','でも'].every(p=>choices.includes(p)),'plausible combined distractors');
  }
  assert.ok(accepts('l4-also-go-library','としょかんへもいきます'));
  for(const input of ['nimo','ni mo','にも'])assert.equal(E.particleAnswer(input,'alsoDestination').correct,true);
  assert.equal(E.particleAnswer('demo','alsoPlace').correct,true);
  assert.equal(T.convert('nimo').text,'にも');assert.equal(T.convert('demo').text,'でも');
  const sentence=ex('l4-also-study-library');
  for(const tokens of [['としょかん','で','も','べんきょうしません'],['としょかん','でも','べんきょうしません']])assert.ok(E.diagnose(sentence,tokens).every(s=>s.correct));
  assert.ok(E.diagnose(sentence,['としょかん','に','も','べんきょうします']).some(s=>!s.correct));
  assert.ok(E.diagnose(ex('l4-also-drink-tea'),['おちゃ','を','も','のみます']).some(s=>!s.correct));
});
test('waiting, understanding and letter recipients reject English-based particle substitutions',()=>{
  for(const [id,good,bad] of [['l4-wait-friend','ともだちをまちます','ともだちにまちます'],['l4-understand-japanese','にほんごがわかります','にほんごをわかります'],['l4-write-teacher-letter','せんせいにてがみをかきます','せんせいとてがみをかきます']]){
    assert.ok(accepts(id,good));assert.ok(!accepts(id,bad));
  }
  assert.ok(accepts('l4-meet-friend','ともだちにあいます'));assert.ok(accepts('l4-meet-friend','ともだちとあいます'));
});
test('durations, quantity placement, negative adverbs and questions retain their intended meaning',()=>{
  assert.ok(accepts('l4-duration-two-read','にじかんほんをよみます'));
  assert.ok(!accepts('l4-duration-two-read','にじかんにほんをよみます'));
  assert.ok(accepts('l4-many-photos','たくさんしゃしんをとります'));
  assert.ok(accepts('l4-many-photos','しゃしんをたくさんとります'));
  assert.ok(accepts('l4-many-flowers','こうえんにたくさんはながあります'));
  assert.ok(!accepts('l4-not-often-coffee','あまりコーヒーをのみます'));
  assert.ok(accepts('l4-when-test','いつテストがありますか'));
  assert.ok(!accepts('l4-when-test','いつにテストがありますか'));
  assert.ok(!accepts('l4-where-study','どこにべんきょうしますか'));
  const q=ex('mix-past-where-photos');assert.ok(E.diagnose(q,['どこ','で','しゃしん','を','とりませんでした','か']).every(s=>s.correct),'wrong verb polarity does not erase correct question particle');
});
test('new vocabulary uses actual progress IDs; numerical phrases remain excluded by strict filters',()=>{
  const settings={activity:'build',support:'independent',difficulty:'auto',vocabulary:'introduced',topics:['existence-uses','verb-particles','duration']};
  const items=Object.fromEntries(Object.values(C.words).filter(w=>!w.foundation).flatMap(w=>w.vocabularyIds.map(id=>[id,{introduced:true,seen:2,mastery:90}])));
  const pool=E.pool(settings,{items});assert.ok(pool.includes(ex('l4-have-siblings')));assert.ok(pool.includes(ex('l4-write-friend-letter')));
  delete items['n5-0249'];assert.ok(!E.pool(settings,{items}).includes(ex('l4-have-siblings')));
  assert.ok(!pool.includes(ex('l4-duration-two-read')));
  assert.ok(E.pool({...settings,vocabulary:'any'}).includes(ex('l4-duration-two-read')));
});

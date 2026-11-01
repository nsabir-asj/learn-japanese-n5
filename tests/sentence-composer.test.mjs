import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
const c=vm.createContext({});
for(const p of ['features/kana/vocabulary-speaking.js','content/sentences/course.js','features/sentences/engine.js','features/sentences/progression.js','features/sentences/composer.js'])vm.runInContext(readFileSync(new URL(`../${p}`,import.meta.url),'utf8'),c);
const T=c.SENTENCE_COMPOSER,E=c.SENTENCE_ENGINE,C=c.SENTENCE_COURSE,P=c.SENTENCE_PROGRESSION;
test('romaji words and particles convert without looking at the current exercise',()=>{
  assert.equal(T.convert('tomodachi').text,'ともだち');assert.equal(T.convert('terebi').text,'テレビ');
  for(const [raw,text] of [['wa','は'],['wo','を'],['o','を'],['e','へ'],['he','へ'],['to','と']])assert.equal(T.convert(raw).text,text);
  assert.equal(T.convert('mimasen').text,'みません');assert.equal(T.convert('mimashita').text,'みました');
  assert.equal(T.convert('mimas').text,'みまs');assert.equal(T.convert('テレビ').text,'テレビ');
});
test('spaces commit complete tokens; Enter can flush the remaining word; whitespace never creates empty tiles',()=>{
  const r=T.split('tomodachi to eiga o mimasu');assert.equal(r.tokens.length,4);assert.equal(r.pending,'mimasu');
  assert.equal(T.split('  tomodachi   to  ').tokens.length,2);assert.equal(T.split('').tokens.length,0);
  const flushed=T.split('tomodachi to eiga o mimasu',true);assert.equal(flushed.tokens.length,5);assert.equal(flushed.pending,'');
  const ex=C.sentences.find(x=>x.id==='companion-movie');
  assert.ok(E.acceptedSentences(ex).has(E.normalize(flushed.tokens.map(x=>x.text).join(''))));
  assert.ok(!E.acceptedSentences(ex).has(E.normalize(T.split('tomodachi ni eiga o mimasen',true).tokens.map(x=>x.text).join(''))));
});
test('typed recall keeps separate scores, transfers stronger evidence to tiles, and never takes tile recognition as typed mastery',()=>{
  const ex=C.sentences.find(x=>x.id==='object-hon'),s={activity:'build',support:'independent',buildInput:'typing',learningPace:'balanced',difficulty:'auto',topics:['objects'],vocabulary:'any'};
  assert.equal(E.recordKey(ex,s),'build:typing:object-hon');assert.equal(E.recordKey(ex,{...s,buildInput:'tiles'}),'build:independent:object-hon');
  const progress={items:{},total:1};
  for(let i=0;i<4;i++){progress.total=i*3;const item=E.record(progress,'build:independent:'+C.sentences.filter(x=>x.topic==='objects'&&x.difficulty==='focused')[i].id,true,false,i*1000);}
  assert.equal(P.profile(E.pool(s),s,progress).topics[0].structure.ready,false);
});
test('editing a middle tile restores the replacement in place and preserves pending input before another edit',()=>{
  const source=readFileSync(new URL('../features/sentences/practice.js',import.meta.url),'utf8');
  const input={value:'',focus(){}},preview={textContent:''};
  const h=vm.createContext({selected:T.split('uchi ni neko ga imasu',true).tokens,composerInsertAt:null,answered:false,SENTENCE_COMPOSER:T,renderTiles(){},$:id=>id==='#builderInput'?input:preview});
  for(const name of ['insertComposer','updateComposer','commitComposer','editComposer']){
    const body=source.match(new RegExp(`  function ${name}\\([^]*?\\n  \\}`))[0];vm.runInContext(body,h);
  }
  vm.runInContext('editComposer(2)',h);assert.equal(input.value,'neko');
  input.value='inu';vm.runInContext('commitComposer()',h);
  assert.equal(Array.from(h.selected,x=>x.text).join(''),'うちにいぬがいます');
  input.value='hon';vm.runInContext('editComposer(0)',h);
  assert.equal(input.value,'uchi');assert.equal(h.selected.at(-1).text,'ほん');
});

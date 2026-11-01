import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
function setup(available=true){
  const nodes=new Map(),instances=[],added=[];
  const node=id=>{if(!nodes.has(id))nodes.set(id,{value:'',hidden:false,disabled:false,textContent:'',events:{},setAttribute(k,v){this[k]=v;},addEventListener(k,v){this.events[k]=v;}});return nodes.get(id);};
  class Recognition {constructor(){instances.push(this);}start(){}stop(){}abort(){}}
  const c=vm.createContext({window:{addEventListener(){},...(available?{SpeechRecognition:Recognition}:{})},document:{addEventListener(){}},AbortController,setTimeout:()=>1,clearTimeout(){}});
  for(const f of ['features/kana/vocabulary-speaking.js','content/sentences/course.js','features/sentences/engine.js','features/sentences/composer.js','features/sentences/voice.js'])vm.runInContext(readFileSync(new URL('../'+f,import.meta.url),'utf8'),c);
  const container={insertAdjacentHTML(){},querySelector:selector=>node(selector.slice(1))};
  c.SENTENCE_VOICE.mount(container,t=>added.push(t),()=>false);
  return {c,node,instances,added,container};
}
test('voice handles sentence kanji, verb endings and separate particles without target hints',()=>{
  const {c}=setup();
  const text=s=>Array.from(c.SENTENCE_VOICE.tokens(s),x=>x.text).join('');
  assert.equal(text('私は友達と映画を見ました。'),'わたしはともだちとえいがをみました');
  assert.equal(text('図書館で本を読みませんでした。'),'としょかんでほんをよみませんでした');
  assert.equal(text('友達に映画が見ました'),'ともだちにえいががみました');
  assert.equal(text('未知'),'未知');
  const s={activity:'build',support:'independent',buildInput:'typing'};
  assert.equal(c.SENTENCE_ENGINE.recordKey({id:'x'},c.SENTENCE_COMPOSER.attemptSettings(s,false,true)),'build:voice:x');
  assert.equal(c.SENTENCE_COMPOSER.attemptSettings(s,true,true).buildInput,'tiles');
});
test('speech requires review and explicit add, preserves edited drafts on errors and ignores cancelled results',()=>{
  const {c,node,instances,added}=setup();
  node('sentenceMic').events.click();const r=instances[0];
  r.onstart();r.onresult({results:[Object.assign([{transcript:'本を読みます。',confidence:.8}],{isFinal:true})]});r.onend();
  assert.equal(added.length,0);assert.equal(node('sentenceVoiceDraft').value,'本を読みます。');
  node('sentenceVoiceDraft').value='本を読みました';node('sentenceVoiceAdd').events.click();assert.equal(added.length,1);
  assert.equal(Array.from(added[0],x=>x.text).join(''),'ほんをよみました');
  node('sentenceVoiceDraft').value='残して';node('sentenceMic').events.click();instances[1].onerror({error:'not-allowed'});
  assert.equal(node('sentenceVoiceDraft').value,'残して');assert.match(node('sentenceVoiceStatus').textContent,/denied/);
  node('sentenceMic').events.click();const late=instances[2];c.SENTENCE_VOICE.cancel();late.onresult({results:[Object.assign([{transcript:'late'}],{isFinal:true})]});late.onend();
  assert.equal(node('sentenceVoiceDraft').value,'残して');assert.equal(added.length,1);
});
test('unsupported browsers retain the typing fallback without starting recording',()=>{
  const {node}=setup(false);assert.equal(node('sentenceMic').disabled,true);assert.match(node('sentenceVoiceStatus').textContent,/unavailable/);
});

test('cancelling an idle voice control does not claim a recording was stopped',()=>{
  const {c,node}=setup();const original=node('sentenceVoiceStatus').textContent;
  c.SENTENCE_VOICE.cancel();assert.equal(node('sentenceVoiceStatus').textContent,original);
  node('sentenceMic').events.click();c.SENTENCE_VOICE.cancel();assert.match(node('sentenceVoiceStatus').textContent,/Recording stopped/);
});

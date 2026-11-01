import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
const source=readFileSync(new URL('../features/sentences/viewport.js',import.meta.url),'utf8');
const context=vm.createContext({});vm.runInContext(source,context);
const {target}=context.SENTENCE_VIEWPORT;
const base={scrollTop:500,height:800,documentHeight:4000};

test('short cards center in both phases regardless of their previous position',()=>{
  const card={top:600,bottom:1100};
  assert.equal(target({...base,phase:'question',card}),450);
  assert.equal(target({...base,phase:'review',card}),450);
  assert.equal(target({...base,phase:'question',card,scrollTop:900}),450);
  assert.equal(target({...base,phase:'review',card,scrollTop:0}),450);
  assert.equal(target({...base,phase:'question',card,scrollTop:454}),454,'already close to center');
  assert.equal(target({...base,phase:'review',card:{top:3500,bottom:3900}}),3200,'center as far as the document allows');
});

test('tall new cards align the top; review aligns the bottom when the result and model remain visible',()=>{
  const card={top:600,bottom:1900};
  assert.equal(target({...base,phase:'question',card}),576);
  const feedback={top:1250},model={bottom:1450};
  assert.equal(target({...base,phase:'review',card,feedback,model}),1124);
});

test('long feedback prioritises the result/model rather than landing on lower explanations',()=>{
  const card={top:600,bottom:2700},feedback={top:1400},model={bottom:1650};
  assert.equal(target({...base,phase:'review',card,feedback,model}),1376);
  assert.equal(target({...base,phase:'review',card,feedback,model:{bottom:2500}}),1376,'an oversized model starts at the result');
});

test('document bounds, exact-fit cards, narrow screens, and missing feedback remain safe',()=>{
  assert.equal(target({...base,phase:'question',card:{top:5,bottom:1000}}),0);
  assert.equal(target({...base,phase:'review',card:{top:600,bottom:4000}}),3200);
  assert.equal(target({...base,phase:'question',card:{top:600,bottom:1352}}),576,'fits exactly between the padding');
  assert.equal(target({...base,phase:'question',card:{top:600,bottom:1352},scrollTop:580}),576,'near-center tolerance cannot consume the padding');
  assert.equal(target({...base,phase:'question',height:500,card:{top:600,bottom:1100}}),576);
  assert.equal(target({...base,phase:'review',documentHeight:500,card:{top:0,bottom:450}}),0);
});

test('result and model remain visible whenever they fit and document bounds permit it',()=>{
  for(const height of [500,700,900])for(const feedbackTop of [1200,1600])for(const modelHeight of [120,300])for(const footer of [100,500,900]){
    const card={top:600,bottom:feedbackTop+modelHeight+footer},feedback={top:feedbackTop},model={bottom:feedbackTop+modelHeight};
    const top=target({...base,height,documentHeight:5000,phase:'review',card,feedback,model});
    assert.ok(top>=0&&top<=5000-height);
    if(card.bottom-card.top<=height-48){assert.ok(card.top>=top+24);assert.ok(card.bottom<=top+height-24);}
    else {assert.ok(feedback.top>=top+24);assert.ok(model.bottom<=top+height-24);}
  }
});

function harness({reduced=false,dialog=false,cardBox={top:600,bottom:1800}}={}){
  let nextId=0;const frames=new Map(),calls=[],focusCalls=[];
  const card={getBoundingClientRect:()=>cardBox,querySelector:selector=>selector==='#answerFeedback'?{getBoundingClientRect:()=>({top:1000,bottom:1700})}:{getBoundingClientRect:()=>({top:1050,bottom:1200})}};
  const h=vm.createContext({requestAnimationFrame:callback=>{frames.set(++nextId,callback);return nextId;},cancelAnimationFrame:id=>frames.delete(id),document:{documentElement:{scrollHeight:4000},querySelector:selector=>selector==='dialog[open]'?dialog:card},window:{scrollY:0,scrollX:7,innerHeight:800,matchMedia:()=>({matches:reduced}),scrollTo:options=>calls.push(options)}});
  vm.runInContext(source,h);
  const flush=()=>{while(frames.size){const queued=[...frames.values()];frames.clear();queued.forEach(fn=>fn());}};
  return {viewport:h.SENTENCE_VIEWPORT,calls,focusCalls,focus:{focus:options=>focusCalls.push(options)},flush,frames,cardBox};
}

test('focus cannot scroll natively; layout is measured after rendering and reduced motion is instant',()=>{
  const h=harness({reduced:true});h.viewport.position('review',h.focus);
  assert.equal(h.focusCalls[0].preventScroll,true);assert.equal(h.calls.length,0);
  h.cardBox.bottom=2200;h.flush();
  assert.equal(h.calls.length,1);assert.equal(h.calls[0].top,976);assert.equal(h.calls[0].left,7);assert.equal(h.calls[0].behavior,'instant');
  const animated=harness();animated.viewport.position('question',animated.focus);animated.flush();
  assert.equal(animated.calls[0].behavior,'smooth');assert.equal(animated.calls[0].top,576);
});

test('newer transitions cancel old scrolling, and an open modal never scrolls the page behind it',()=>{
  const h=harness();h.viewport.position('review',h.focus);h.viewport.position('question',h.focus);h.flush();
  assert.equal(h.calls.length,1);assert.equal(h.calls[0].top,576);
  h.viewport.position('review');h.viewport.cancel();h.flush();assert.equal(h.calls.length,1);
  const modal=harness({dialog:true});modal.viewport.position('review',modal.focus);modal.flush();assert.equal(modal.calls.length,0);
  const visible=harness({cardBox:{top:100,bottom:600}});visible.viewport.position('question',visible.focus);visible.flush();assert.equal(visible.calls.length,0);
});

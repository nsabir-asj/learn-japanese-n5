import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
const context=vm.createContext({});
for(const path of ['content/sentences/particle-guide.js','features/sentences/help.js'])vm.runInContext(readFileSync(new URL(`../${path}`,import.meta.url),'utf8'),context);
const G=context.SENTENCE_PARTICLE_GUIDE,H=context.SENTENCE_HELP;

test('beginner reference covers every practice particle and no-particle uses with distinct, complete examples',()=>{
  assert.deepEqual(Array.from(G.groups,x=>x.particle),['は','が','を','に','へ','で','の','と','も','か','—']);
  const ids=new Set(),sentences=new Set();let uses=0,examples=0;
  for(const group of G.groups){
    assert.ok(!ids.has(group.id));ids.add(group.id);
    assert.ok(group.reading&&new URL(group.reference).protocol==='https:');
    for(const use of group.uses){
      uses++;
      assert.ok(use.title&&use.rule.length>50&&use.pattern&&use.note);
      assert.equal(use.examples.length,3);
      for(const example of use.examples){
        examples++;
        assert.equal(example.jp.split('|').length%2,1,'highlight delimiters must be balanced');
        const highlights=example.jp.split('|').filter((_,i)=>i%2);
        assert.ok(highlights.length&&highlights.every(x=>x.length>0));
        if(group.id!=='none')assert.ok(highlights.every(x=>group.id==='mo'&&use.id==='combined-particles'?['も','にも','でも'].includes(x):x===group.particle),`${group.id}/${use.id}`);
        assert.ok(example.jp.endsWith('。')&&example.meaning);
        const key=example.jp.replaceAll('|','');
        assert.ok(!sentences.has(example.jp),`vary examples with the same teaching focus: ${key}`);sentences.add(example.jp);
        assert.ok(!/だれは|きのうに|きょうに|いちじかんに/.test(key));
      }
    }
  }
  assert.equal(uses,28);assert.equal(examples,84);
  const additions=G.groups.find(x=>x.id==='mo').uses.flatMap(x=>x.examples);
  assert.ok(additions.every(x=>x.context),'also needs an explicit situation');
  assert.ok(G.groups.find(x=>x.id==='ga').uses.find(x=>x.id==='identify').examples.every(x=>x.context),'subject identification needs context');
});

test('help entry matches answer state while verb practice retains its own hint',()=>{
  for(const activity of ['build','particles']){
    const before=H.presentation(activity,false),after=H.presentation(activity,true);
    assert.equal(before.label,'Hint & guide');assert.equal(before.initial,'hint');assert.equal(before.tabs,true);
    assert.equal(after.label,'Particle guide');assert.equal(after.initial,'guide');assert.equal(after.hint,false);assert.equal(after.tabs,false);assert.equal(after.hidden,false);
    assert.match(H.buttonMarkup(activity,false),/fill="none"/);
    assert.match(H.buttonMarkup(activity,true),/fill="none"/);
  }
  assert.equal(H.presentation('verbs',false).label,'Hint');
  assert.equal(H.presentation('verbs',false).guide,false);
  assert.equal(H.presentation('verbs',true).hidden,true);
});

test('reference renders one semantic three-column table with translated examples and particle jump targets',()=>{
  const html=H.guideMarkup();
  assert.equal((html.match(/<table /g)||[]).length,1);
  assert.equal((html.match(/scope="col"/g)||[]).length,3);
  assert.equal((html.match(/scope="row"/g)||[]).length,28);
  assert.equal((html.match(/class="sp-guide-example"/g)||[]).length,84);
  assert.equal((html.match(/class="sp-guide-meaning"/g)||[]).length,84);
  for(const group of G.groups){assert.ok(html.includes(`data-guide-jump="${group.id}"`));assert.ok(html.includes(`id="guide-${group.id}"`));}
  assert.ok(!html.includes('|'),'authoring delimiters must never be visible');
  assert.match(html,/lang="ja"/);assert.match(html,/<caption/);
});

const appSource=readFileSync(new URL('../features/sentences/practice.js',import.meta.url),'utf8');
function harness(activity='build'){
  const nodes=new Map();let renders=0;
  const node=key=>{
    if(!nodes.has(key))nodes.set(key,{innerHTML:'',textContent:'',hidden:false,scrollTop:0,attrs:{},classes:{},setAttribute(name,value){this.attrs[name]=value;},classList:{toggle(name,on){node(key).classes[name]=on;}},showModal(){this.open=true;},focus(){this.focused=true;}});
    return nodes.get(key);
  };
  const h=vm.createContext({state:{settings:{activity}},current:{id:'q',topic:'objects'},answered:false,assisted:false,assistanceReason:'',helpTab:'hint',guideScrollTop:0,selected:['ほん','を'],answers:['を'],C:{topics:[{id:'objects',title:'Choose the object'}]},E:{requirements:()=>['objects']},SENTENCE_HELP:{...H,guideMarkup(){renders++;node('#guideScroller');return H.guideMarkup();}},esc:x=>x,ruleMarkup:()=>'<p>Current question explanation</p>',wordGlossary:()=>'<p>word meanings</p>',$:selector=>selector==='#guideScroller'?(nodes.get(selector)||null):node(selector)});
  for(const name of ['rememberGuideScroll','switchHelpTab','showRule']){
    const match=appSource.match(new RegExp(`  function ${name}\\([^]*?\\n  \\}`));assert.ok(match,name);vm.runInContext(match[0],h);
  }
  return {h,node,renders:()=>renders};
}

test('opening help before submission is assisted and keeps the built answer, with the question hint first',()=>{
  const {h,node}=harness();const selected=h.selected,answers=h.answers;
  vm.runInContext('showRule(true)',h);
  assert.equal(h.assisted,true);assert.equal(h.assistanceReason,'hint');assert.equal(h.helpTab,'hint');
  assert.equal(node('#helpTabs').hidden,false);assert.match(node('#ruleBody').innerHTML,/Current question explanation/);
  assert.match(node('#ruleBody').innerHTML,/word meanings/);
  vm.runInContext('switchHelpTab("guide")',h);
  assert.equal(h.helpTab,'guide');assert.equal(node('#ruleBody').hidden,true);
  assert.equal(h.selected,selected);assert.equal(h.answers,answers);
});

test('after submission guide opens directly with no stale question hint, tabs, or change to assistance',()=>{
  const {h,node}=harness('particles');
  vm.runInContext('showRule(true);answered=true;assisted=false;assistanceReason="";showRule(true)',h);
  assert.equal(h.helpTab,'guide');assert.equal(h.assisted,false);assert.equal(h.assistanceReason,'');
  assert.equal(node('#helpTabs').hidden,true);assert.equal(node('#ruleBody').innerHTML,'');assert.equal(node('#ruleBody').hidden,true);
  assert.equal(node('#particleGuidePanel').attrs['aria-labelledby'],'ruleTitle');
  vm.runInContext('switchHelpTab("hint")',h);assert.equal(h.helpTab,'guide','answered questions cannot reveal the hint');
});

test('guide remains mounted and restores its position across hint switches, reopening, and a new question',()=>{
  const {h,node,renders}=harness();
  vm.runInContext('showRule(true);switchHelpTab("guide")',h);
  node('#guideScroller').scrollTop=735;
  vm.runInContext('switchHelpTab("hint");switchHelpTab("guide")',h);
  assert.equal(node('#guideScroller').scrollTop,735);
  vm.runInContext('rememberGuideScroll();showRule(true)',h);
  assert.equal(h.helpTab,'hint');
  vm.runInContext('switchHelpTab("guide")',h);assert.equal(node('#guideScroller').scrollTop,735);
  vm.runInContext('answered=true;showRule(true)',h);assert.equal(node('#guideScroller').scrollTop,735);
  vm.runInContext('answered=false;assisted=false;showRule(true)',h);assert.equal(h.helpTab,'hint');
  assert.equal(renders(),1);
});

test('verb help stays a question-specific hint and never mounts the particle table',()=>{
  const {h,node,renders}=harness('verbs');vm.runInContext('showRule(true)',h);
  assert.equal(h.helpTab,'hint');assert.equal(node('#helpTabs').hidden,true);assert.equal(renders(),0);
});

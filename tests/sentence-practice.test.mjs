import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const context = vm.createContext({});
for (const file of ['features/kana/vocabulary-speaking.js','content/sentences/course.js','features/sentences/engine.js']) vm.runInContext(readFileSync(new URL(`../${file}`,import.meta.url),'utf8'),context);
const C=context.SENTENCE_COURSE, E=context.SENTENCE_ENGINE;
const config = {activity:'build',support:'independent',input:'choice',vocabulary:'any',topics:Array.from(C.topics,t=>t.id)};

test('all curated sentences have valid models, topics, words, and round-trip tile answers',()=>{
  assert.ok(C.sentences.length >= 35);
  const ids=new Set();
  for(const sentence of C.sentences){
    assert.ok(!ids.has(sentence.id));ids.add(sentence.id);
    assert.ok(C.topics.some(t=>t.id===sentence.topic));
    assert.ok(E.acceptedSentences(sentence).has(E.normalize(E.model(sentence))),sentence.id);
    for(const id of E.wordIds(sentence))assert.ok(C.words[id],id);
    const supported=E.tileBank(sentence,true,()=>.3);
    assert.equal(supported.filter(x=>!x.distractor).length,sentence.chunks.length);
    assert.ok(supported.length>=6);
    const independent=E.tileBank(sentence,false,()=>.3);
    assert.ok(independent.every(x=>!x.role));
    assert.ok(independent.length>=8);
    assert.ok(E.slots(sentence).every(x=>C.roles[x.role]));
  }
});

test('word banks include related alternatives and opposite verb polarity, without marking the right tiles',()=>{
  const sentence=C.sentences.find(x=>x.id==='place-library');
  const bank=E.tileBank(sentence,false,()=>.3);
  assert.equal(bank.length,8);
  assert.ok(bank.some(x=>x.text==='よみません' && x.distractor));
  assert.ok(bank.some(x=>x.text==='としょかん' && !x.distractor));
  assert.ok(bank.some(x=>x.distractor && ['うち','だいがく','えいが','テレビ','おんがく','みます','ききます','はなします'].includes(x.text)));
  assert.equal(new Set(bank.map(x=>x.text)).size,bank.length);
  assert.equal(new Set(bank.map(x=>x.id)).size,bank.length);
  assert.equal(E.tileBank(sentence,false,()=>.3,{settings:{bankSize:'12'}}).length,12);
  const expanded=E.tileBank(C.sentences.find(x=>x.id==='place-university'),false,()=>.3,{settings:{bankSize:'12'}});
  assert.ok(!expanded.some(x=>['です','これ','それ','あれ'].includes(x.text)),'prefer comparable action forms over obvious filler');
  const topicLesson=new Map(C.topics.map(x=>[x.id,x.lesson]));
  for(const exercise of C.sentences.filter(x=>topicLesson.get(x.topic)===1))for(const tile of E.tileBank(exercise,true,()=>.3))for(const id of tile.wordIds){
    assert.ok(C.sentences.some(x=>topicLesson.get(x.topic)===1 && E.wordIds(x).includes(id)),`Lesson 1 should not add ${id}`);
  }
});

test('extra words respect introduced/mastered filters even if the result has fewer choices',()=>{
  const sentence=C.sentences.find(x=>x.id==='object-hon');
  const vocabulary={items:{hon:{introduced:true,seen:1,mastery:80},yomu:{introduced:true,seen:1,mastery:80}}};
  for(const filter of ['introduced','mastered']){
    const bank=E.tileBank(sentence,false,()=>.3,{settings:{vocabulary:filter,bankSize:'12'},vocabulary});
    assert.ok(bank.length<12);
    assert.ok(bank.some(x=>x.text==='よみません'));
    assert.ok(bank.every(tile=>tile.wordIds.every(id=>['hon','yomu'].includes(id))));
  }
});

test('live kana preview follows all typed verb forms, wrong forms, and partial syllables without changing grading',()=>{
  for(const verb of E.verbs)assert.equal(E.hiraganaPreview(verb.romaji),verb.answer);
  assert.equal(E.hiraganaPreview('yomimasen'),'よみません');
  assert.equal(E.hiraganaPreview('okirimasu'),'おきります');
  assert.equal(E.hiraganaPreview('shimas'),'しまs');
  assert.equal(E.hiraganaPreview(' BENKYOUSHIMASU '),' べんきょうします ');
  assert.equal(E.hiraganaPreview('べんkyōshimasu。'),'べんきょうします。');
  assert.equal(E.hiraganaPreview('ｋａｅｒｉｍａｓｅｎ'),'かえりません');
  assert.equal(E.hiraganaPreview('飲みます'),'飲みます');
  assert.notEqual(E.normalize('okirimasu'),E.normalize(E.verbs.find(x=>x.id==='okiru-affirmative').romaji));
  const html=readFileSync(new URL('../sentences.html',import.meta.url),'utf8');
  assert.ok(html.indexOf('vocabulary-speaking.js')<html.indexOf('sentences/engine.js'));
});

test('particle previews show what was typed with conventional spellings and no target lookup',()=>{
  for(const [input,expected] of [['wa','は'],['ha','は'],['o','を'],['wo','を'],['e','へ'],['he','へ'],['de','で'],['ni','に'],['none','—'],['なし','—'],['','?'],['d','d']])assert.equal(E.particlePreview(input),expected);
  assert.equal(E.particlePreview('ni'),'に');
  assert.equal(E.particleAnswer('ni','place').correct,false,'a preview never repairs an incorrect particle');
});

test('movement accepts ni and he; action location rejects ni',()=>{
  const movement=C.sentences.find(x=>x.id==='destination-toshokan');
  assert.ok(E.acceptedSentences(movement).has(E.normalize('としょかんへいきます。')));
  const reading=C.sentences.find(x=>x.id==='place-library');
  assert.ok(E.acceptedSentences(reading).has(E.normalize('ほんをとしょかんでよみます。')));
  assert.ok(!E.acceptedSentences(reading).has(E.normalize('としょかんにほんをよみます。')));
  assert.ok(!E.acceptedSentences(reading).has(E.normalize('よみますとしょかんでほんを')));
});

test('partial feedback preserves correct objects after an incorrect location, including reordered phrases',()=>{
  const sentence=C.sentences.find(x=>x.id==='place-library');
  const details=E.diagnose(sentence,['ほん','を','としょかん','に','よみます']);
  assert.equal(details.find(x=>x.role==='place').correct,false);
  assert.equal(details.find(x=>x.role==='object').correct,true);
});

test('no-particle gaps and romaji aliases use the same curated answers',()=>{
  for(const alias of ['wa','ha','は'])assert.equal(E.particleAnswer(alias,'topic').correct,true);
  for(const alias of ['o','wo','を'])assert.equal(E.particleAnswer(alias,'object').correct,true);
  for(const alias of ['e','he','ni','へ','に'])assert.equal(E.particleAnswer(alias,'destination').correct,true);
  for(const alias of ['none','なし','—','-'])assert.equal(E.particleAnswer(alias,'bareTime').correct,true);
  assert.equal(E.particleAnswer('ni','bareTime').correct,false);
  assert.equal(E.particleAnswer('he','time').correct,false);
});

test('strict vocabulary filtering never quietly broadens and respects mastery',()=>{
  const limited={...config,topics:['objects'],vocabulary:'introduced'};
  assert.equal(E.pool(limited,{}).length,0);
  const vocabulary={items:{hon:{introduced:true,seen:1,mastery:50},yomu:{introduced:true,seen:2,mastery:90}}};
  assert.deepEqual(Array.from(E.pool(limited,vocabulary),x=>x.id),['object-hon']);
  assert.equal(E.pool({...limited,vocabulary:'mastered'},vocabulary).length,0);
  vocabulary.items.hon.mastery=80;
  assert.equal(E.pool({...limited,vocabulary:'mastered'},vocabulary).length,1);
  assert.ok(E.familiar('benkyousuru',{items:{'benkyou-suru':{introduced:true}}}));
});

test('progress separates support levels and assisted answers never award unaided successes',()=>{
  const progress={items:{},total:1};const exercise=C.sentences[0];
  const supported=E.recordKey(exercise,{...config,support:'supported'});
  const independent=E.recordKey(exercise,config);
  E.record(progress,supported,true,true,1000);
  assert.equal(progress.items[supported].correct,0);
  assert.equal(progress.items[supported].assisted,1);
  assert.equal(progress.items[independent],undefined);
  E.record(progress,independent,true,false,2000);
  assert.equal(progress.items[independent].correct,1);
  assert.ok(progress.items[independent].dueAt>2000);
});

test('all activities start unaided without automatic rule or vocabulary introductions',()=>{
  const source=readFileSync(new URL('../features/sentences/practice.js',import.meta.url),'utf8');
  const body=source.match(/function next\(\) \{([\s\S]*?)\n  \}/)[1];
  for(const [activity,support,expectTeaching] of [['build','independent',false],['particles','independent',false],['verbs','independent',false],['build','supported',false]]){
    let rendered=0;
    const harness=vm.createContext({window:{KANA_SPRINT_SPEECH:{stop(){}}},settings:()=>({activity,support}),vocabulary:()=>({}),pool:()=>[{}],state:{introduced:{},wordsSeen:{}},recent:[],E:{choose:()=>({id:'new',topic:'new'}),wordIds:()=>['hon'],familiar:()=>false},C:{topics:[{id:'new',lesson:4,title:'New rule'}],words:{hon:{jp:'ほん',romaji:'hon',meaning:'book'}}},renderChrome(){},renderExercise(){rendered++;},ruleMarkup:()=>'',esc:x=>x,$:()=>({innerHTML:''})});
    vm.runInContext(`function next(){${body}};next()`,harness);
    assert.equal(harness.assisted,false,`${activity}/${support} should not silently mark help as used`);
    assert.equal(rendered,expectTeaching?0:1);
    assert.equal(harness.assistanceReason,'');
  }
});

test('opening a hint before answering marks assistance, while post-answer explanations do not',()=>{
  const source=readFileSync(new URL('../features/sentences/practice.js',import.meta.url),'utf8');
  const body=source.match(/function showRule\(hint = false\) \{([\s\S]*?)\n  \}/)[1];
  const harness=vm.createContext({current:{topic:'new'},answered:false,teaching:false,assisted:false,assistanceReason:'',C:{topics:[{id:'new',title:'Rule'}]},ruleMarkup:()=>'',wordGlossary:()=>'',esc:x=>x,$:()=>({showModal(){}})});
  vm.runInContext(`function showRule(hint=false){${body}};showRule(true)`,harness);
  assert.equal(harness.assisted,true);
  assert.equal(harness.assistanceReason,'hint');
  vm.runInContext('answered=true;assisted=false;assistanceReason="";showRule(true)',harness);
  assert.equal(harness.assisted,false);
});

test('scheduler avoids recent exercises while alternatives are available and tolerates one-item pools',()=>{
  const exercises=E.pool({...config,topics:['objects']});
  const progress={items:{},total:0};
  const chosen=E.choose(exercises,config,progress,[exercises[0].id],{},()=>.5,1000);
  assert.notEqual(chosen.id,exercises[0].id);
  assert.equal(E.choose([exercises[0]],config,progress,[exercises[0].id],{},()=>.5,1000).id,exercises[0].id);
});

test('verbs cover all 13 dictionary forms in both polarities and distinguish ru-like u-verbs',()=>{
  assert.equal(E.verbs.filter(x=>C.topics.find(t=>t.id===x.topic).lesson===3).length,26);
  const returning=E.verbs.find(x=>x.id==='kaeru-affirmative');
  assert.equal(returning.answer,'かえります');
  assert.equal(returning.romaji,'kaerimasu');
  assert.equal(returning.verb.group,'u');
  assert.equal(E.verbs.find(x=>x.id==='kuru-negative').answer,'きません');
});

test('Lesson 4 is selectable in every activity with eight new verbs and past forms',()=>{
  const topics=Array.from(C.topics.filter(t=>t.lesson===4),t=>t.id);
  assert.ok(C.lessons.some(l=>l.id===4));
  for(const activity of ['build','particles']){
    const pool=E.pool({...config,activity,topics});
    assert.equal(pool.length,60);
    assert.equal(new Set(pool.map(s=>s.topic)).size,6);
    assert.ok(pool.every(s=>E.slots(s).length>0));
  }
  const pool=E.pool({...config,activity:'verbs',topics});
  assert.equal(pool.length,58);
  assert.equal(new Set(pool.filter(x=>x.topic==='verbs-lesson4').map(x=>x.verb.id)).size,8);
  assert.equal(new Set(E.verbs.map(x=>x.id)).size,E.verbs.length);
  for(const [id,answer] of [['matsu-affirmative','まちます'],['iru-negative','いません'],['aru-past-negative','ありませんでした'],['kuru-past-affirmative','きました'],['suru-past-negative','しませんでした'],['kau-past-affirmative','かいました']]){
    const exercise=pool.find(x=>x.id===id);
    assert.equal(exercise.answer,answer,id);
    assert.equal(E.hiraganaPreview(exercise.romaji),answer,id);
  }
});

test('Lesson 4 particles distinguish existence, activity, duration, and noun lists',()=>{
  assert.equal(E.particleAnswer('ga','subject').correct,true);
  assert.equal(E.particleAnswer('de','existencePlace').correct,false);
  assert.equal(E.particleAnswer('none','duration').correct,true);
  assert.equal(E.particleAnswer('ni','duration').correct,false);
  const existence=C.sentences.find(s=>s.id==='existence-book');
  assert.ok(E.acceptedSentences(existence).has(E.normalize('つくえのうえにほんがあります')));
  assert.ok(!E.acceptedSentences(existence).has(E.normalize('つくえのうえでほんがあります')));
  const list=C.sentences.find(s=>s.id==='list-shopping');
  assert.ok(E.diagnose(list,['ほん','と','パン','を','かいました']).every(x=>x.correct));
  const past=C.sentences.find(s=>s.id==='past-no-go');
  assert.ok(E.acceptedSentences(past).has(E.normalize('きのうだいがくへいきませんでした')));
  assert.ok(E.tileBank(past,false,()=>.3).some(x=>x.text==='いきました'&&x.distractor));
});

test('every non-clock content word links to the current Vocabulary ID',()=>{
  const source=readFileSync(new URL('../features/kana/vocabulary.js',import.meta.url),'utf8');
  for(const word of Object.values(C.words).filter(x=>!x.foundation))for(const id of word.vocabularyIds)assert.ok(source.includes(`"${id}"`),`${word.jp}: unknown vocabulary ID ${id}`);
});

test('the full-width status bar includes session attempts and unaided results without a duplicate hint panel',()=>{
  const source=readFileSync(new URL('../features/sentences/practice.js',import.meta.url),'utf8');
  const body=source.match(/function updateStats\(\) \{([\s\S]*?)\n  \}/)[1];
  let detail;
  const harness=vm.createContext({sessionTotal:7,sessionCorrect:3,sessionUnaided:5,state:{items:{},total:0,streak:2},pool:()=>[],settings:()=>({}),scopeLabel:()=> 'Lesson 3',renderProgress(){},window:{dispatchEvent(event){detail=event.detail;}},CustomEvent:class{constructor(name,options){this.detail=options.detail;}}});
  vm.runInContext(`function updateStats(){${body}};updateStats()`,harness);
  assert.equal(detail.metrics.find(x=>x.label==='Answers this session').value,7);
  assert.equal(detail.metrics.find(x=>x.label==='Unaided correct').value,'3/5');
  vm.runInContext('sessionTotal=0;sessionUnaided=0;updateStats()',harness);
  assert.equal(detail.metrics.find(x=>x.label==='Unaided correct').value,'—');
  assert.ok(!source.includes('sp-aside'));
  assert.equal((source.match(/data-action="hint"/g)||[]).length,1);
});

test('plain Enter checks sentence building and advances feedback while focused controls keep native behavior',()=>{
  const source=readFileSync(new URL('../features/sentences/practice.js',import.meta.url),'utf8');
  const body=source.match(/document\.addEventListener\("keydown",event => \{([\s\S]*?)\n  \}\);/)[1];
  let checks=0, advances=0;
  const harness=vm.createContext({current:{},renderedAt:0,teaching:false,answered:false,$:()=>null,check:()=>checks++,next:()=>advances++});
  const handler=vm.runInContext(`(event)=>{${body}}`,harness);
  const event=(extra={})=>({key:'Enter',repeat:false,isComposing:false,ctrlKey:false,target:{matches:()=>false},preventDefault(){},...extra});
  handler(event());assert.equal(checks,1);
  vm.runInContext('answered=true',harness);handler(event());assert.equal(advances,1);
  handler(event({repeat:true}));handler(event({isComposing:true}));
  handler(event({target:{matches:()=>true}}));assert.equal(advances,1);
  assert.ok(!source.includes('Ctrl Enter'));
});


test('reviewed sentence alternatives accept natural topics, phrase order, lists and particles',()=>{
  const cases=[
    ['companion-movie',['わたし','は','ともだち','と','えいが','を','みます']],
    ['object-hon',['わたし','は','ほん','を','よみます']],
    ['past-read',['きのう','わたし','は','ほん','を','よみました']],
    ['identity-gakusei',['がくせい','です']],
    ['past-student',['がくせい','でした']],
    ['existence-inu',['いぬ','が','こうえん','に','います']],
    ['existence-book',['ほん','が','つくえ','の','うえ','に','あります']],
    ['list-shopping',['パン','と','ほん','を','かいました']],
    ['list-animals',['ねこ','と','いぬ','が','こうえん','に','います']],
    ['location-between',['としょかん','は','ほんや','と','ホテル','の','あいだ','です']],
    ['time-today',['きょう','は','ほん','を','よみます']],
    ['past-read',['きのう','は','ほん','を','よみました']],
    ['time-sunday',['にちようび','えいが','を','みます']],
    ['past-meet',['としょかん','で','ともだち','に','あいました']]
  ];
  for(const [id,tokens] of cases){
    const exercise=C.sentences.find(s=>s.id===id);
    assert.ok(E.acceptedSentences(exercise).has(E.normalize(tokens.join(''))),`${id}: ${tokens.join('')}`);
    assert.ok(E.diagnose(exercise,tokens).every(slot=>slot.correct),`feedback: ${id}`);
  }
  // Every implied-I exercise accepts an explicit topic, and every reviewed
  // existence exercise accepts the subject before its location.
  for(const exercise of C.sentences.filter(s=>s.optionalTopic==='add')){
    assert.ok(E.acceptedSentences(exercise).has(E.normalize('わたしは'+E.model(exercise))),exercise.id);
  }
});

test('alternative feedback keeps correct list roles when the ending is wrong and does not blame optional vocabulary',()=>{
  const exercise=C.sentences.find(s=>s.id==='list-shopping');
  const tokens=['パン','と','ほん','を','かいませんでした'];
  assert.ok(!E.acceptedSentences(exercise).has(E.normalize(tokens.join(''))));
  assert.ok(E.diagnose(exercise,tokens).every(slot=>slot.correct));
  const movie=C.sentences.find(s=>s.id==='companion-movie');
  const wrong=E.unexpectedWords(movie,[{text:'わたし',distractor:true},{text:'テレビ',distractor:true},{text:'みません',distractor:true}]);
  assert.deepEqual(Array.from(wrong,x=>x.text),['テレビ','みません']);
});

test('reviewed alternatives never allow arbitrary topics, swapped particles, wrong actions or changed meaning',()=>{
  for(const [id,answer] of [
    ['companion-movie','わたしがともだちとえいがをみます'],
    ['companion-movie','せんせいはともだちとえいがをみます'],
    ['companion-movie','わたしはともだちにえいがをみます'],
    ['companion-movie','わたしはともだちとえいがをみません'],
    ['object-hon','わたしはほんがよみます'],
    ['object-hon','わたしはよみますほんを'],
    ['existence-inu','いぬがこうえんでいます'],
    ['existence-inu','いぬにこうえんがいます'],
    ['existence-inu','いぬがこうえんにあります'],
    ['list-shopping','パンをほんとかいました'],
    ['past-read','きのうにほんをよみました'],
    ['duration-study','いちじかんにべんきょうしました'],
    ['also-student','がくせいです']
  ])assert.ok(!E.acceptedSentences(C.sentences.find(s=>s.id===id)).has(E.normalize(answer)),`${id}: ${answer}`);
  const meeting=C.sentences.find(s=>s.id==='past-meet');
  assert.equal(E.particleAnswer('ni',E.slots(meeting).find(s=>s.anchor==='ともだち').role).correct,true);
  assert.equal(E.particleAnswer('ni','companion').correct,false,'ni must not become a generic companion alternative');
});


test('every verb has four or six distinct same-verb choices without leaking past tense into Lesson 3',()=>{
  for(const exercise of E.verbs)for(const size of ['4','6']){
    const options=E.verbChoices(exercise,{verbChoices:size,topics:[exercise.topic]}, {items:{}},()=>.4);
    assert.equal(options.length,Number(size),exercise.id);
    assert.equal(new Set(options).size,options.length);
    assert.equal(options.filter(x=>x===exercise.answer).length,1);
    if(!exercise.form.startsWith('past'))assert.ok(options.every(x=>!x.endsWith('ました')&&!x.endsWith('でした')),exercise.id);
  }
});

test('Auto uses spaced evidence for one verb form, supports typed evidence, and recovers after errors',()=>{
  const exercise=E.verbs.find(x=>x.id==='yomu-affirmative');
  const progress={items:{},total:0};
  const settings={activity:'verbs',input:'choice',verbChoices:'auto'};
  const attempt=(correct,assisted,mode='choice',now=0)=>{
    progress.total+=6;
    E.record(progress,`verbs:${mode}:${exercise.id}`,correct,assisted,now);
  };
  assert.equal(E.verbChoiceCount(exercise,settings,progress),4);
  attempt(true,false,'choice',0);attempt(true,false,'choice',700000);
  assert.equal(E.verbChoiceCount(exercise,settings,progress),4);
  attempt(true,true,'choice',800000);
  assert.equal(E.verbChoiceCount(exercise,settings,progress),4);
  attempt(true,false,'typing',1000000);
  assert.equal(E.verbChoiceCount(exercise,settings,progress),6);
  assert.equal(E.verbChoiceCount(E.verbs.find(x=>x.id==='yomu-negative'),settings,progress),4);
  attempt(false,false,'choice',1100000);
  assert.equal(E.verbChoiceCount(exercise,settings,progress),4);
  attempt(true,false,'choice',1200000);
  assert.equal(E.verbChoiceCount(exercise,settings,progress),4);
  attempt(true,false,'typing',1300000);
  assert.equal(E.verbChoiceCount(exercise,settings,progress),6);
});

test('coverage rotation visits every selected sentence before repeating successes',()=>{
  const pool=E.pool({...config,topics:['action-place','companion']});
  const progress={items:{},total:0},recent=[],seen=new Set();
  for(let i=0;i<pool.length;i++){
    const chosen=E.choose(pool,config,progress,recent,{},()=>.4,0);
    assert.ok(!seen.has(chosen.id));seen.add(chosen.id);recent.push(chosen.id);
    progress.total++;E.record(progress,E.recordKey(chosen,config),true,false,0);
  }
  assert.equal(seen.size,pool.length);
});

test('a mistake transfers to another example after two answers, with bounded exact retries',()=>{
  const pool=E.pool({...config,topics:['action-place','companion']});
  const original=pool.find(x=>x.id==='place-library');
  const progress={items:{},total:1};
  E.record(progress,E.recordKey(original,config),false,false,0,{weakRoles:['place']});
  const recent=[original.id];
  for(let i=0;i<2;i++){
    const chosen=E.choose(pool,config,progress,recent,{},()=>.4,0);
    assert.notEqual(chosen.id,original.id);recent.push(chosen.id);progress.total++;
    E.record(progress,E.recordKey(chosen,config),true,false,0);
  }
  const transfer=E.choose(pool,config,progress,recent,{},()=>.4,0);
  assert.notEqual(transfer.id,original.id);
  assert.ok(E.slots(transfer).some(x=>x.role==='place'));
  assert.equal(progress.items[E.recordKey(original,config)].transferDone,true);
  recent.push(transfer.id);progress.total++;E.record(progress,E.recordKey(transfer,config),true,false,0);
  for(let i=0;i<2;i++){
    const normal=E.choose(pool,config,progress,recent,{},()=>.4,0);
    assert.notEqual(normal.id,original.id);recent.push(normal.id);progress.total++;
    E.record(progress,E.recordKey(normal,config),true,false,0);
  }
  assert.equal(E.choose(pool,config,progress,recent,{},()=>.4,0).id,original.id);
});


test('revealed verb choices distinguish valid forms from incorrect stems for every generated option',()=>{
  for(const exercise of E.verbs){
    for(const option of E.verbChoices(exercise,{verbChoices:'6',topics:['verbs-past']},{items:{}})){
      const info=E.verbChoiceInfo(exercise,option);
      const valid=E.verbs.some(x=>x.verb.id===exercise.verb.id && x.answer===option);
      assert.equal(info.valid,valid,`${exercise.id}: ${option}`);
      assert.ok(info.label && info.note);
    }
  }
  const exercise=E.verbs.find(x=>x.id==='taberu-past-negative');
  assert.equal(E.verbChoiceInfo(exercise,'たべました').label,'Past affirmative');
  assert.equal(E.verbChoiceInfo(exercise,'たべります').label,'Incorrect stem');
  assert.match(E.verbChoiceInfo(exercise,'たべります').note,/remove る/);
});

test('automatic audio preferences stay separate by activity and preserve the existing building preference',()=>{
  const settings={activity:'build',autoAudio:true,autoVerbAudio:false,autoParticleAudio:false};
  assert.equal(E.playbackEnabled(settings),true);
  settings.activity='verbs';assert.equal(E.playbackEnabled(settings),false);
  settings[E.playbackKey('verbs')]=true;assert.equal(E.playbackEnabled(settings),true);
  settings.activity='particles';assert.equal(E.playbackEnabled(settings),false);
  settings[E.playbackKey('particles')]=true;
  assert.equal(E.playbackEnabled(JSON.parse(JSON.stringify(settings))),true);
  assert.equal(E.playbackEnabled({activity:'verbs',autoAudio:true}),false);
});

test('choice explanations appear only after grading and identify the correct and selected answers',()=>{
  const source=readFileSync(new URL('../features/sentences/practice.js',import.meta.url),'utf8');
  const body=source.match(/function verbChoicesMarkup\(\) \{([\s\S]*?)\n  \}/)[1];
  const current=E.verbs.find(x=>x.id==='taberu-past-negative');
  const harness=vm.createContext({current,E,esc:x=>x,answered:false,answers:['たべました'],verbOptions:['たべました',current.answer,'たべります']});
  vm.runInContext(`function markup(){${body}}`,harness);
  const before=vm.runInContext('markup()',harness);
  assert.ok(!before.includes('Past affirmative')&&!before.includes('Incorrect stem')&&!before.includes('✓ Correct'));
  vm.runInContext('answered=true',harness);
  const after=vm.runInContext('markup()',harness);
  assert.ok(after.includes('✓ Correct · Past negative'));
  assert.ok(after.includes('↻ Your choice · Past affirmative'));
  assert.ok(after.includes('Alternative · Incorrect stem'));
  assert.equal((after.match(/ disabled/g)||[]).length,3);
});


test('independent building rests the exact sentence in particle practice without awarding particle scores',()=>{
  const exercise=C.sentences.find(s=>s.id==='place-library');
  const progress={items:{},total:1};
  E.recordParticleEvidence(progress,exercise,config,E.slots(exercise).map(x=>({...x,correct:true})),false,1000);
  const particles={...config,activity:'particles',input:'choice'};
  assert.equal(E.particlePriority(exercise,particles,progress,1000),2);
  assert.equal(progress.items[E.recordKey(exercise,particles)],undefined);
  const other=C.sentences.find(s=>s.id==='place-home');
  assert.equal(E.choose([exercise,other],particles,progress,[],{},()=>.4,1000).id,other.id);
  // A turn reserved for review cannot undo a fresh exact-sentence cooldown.
  progress.total=7;
  assert.equal(E.choose([exercise,other],particles,progress,[],{},()=>.4,1000).id,other.id);
  progress.total=20;
  assert.equal(E.particlePriority(exercise,particles,progress,999999999),0);
});

test('supported building and hinted answers never establish shared particle evidence',()=>{
  const exercise=C.sentences.find(s=>s.id==='place-library');
  for(const [support,assisted] of [['supported',false],['independent',true]]){
    const progress={items:{},total:1};
    E.recordParticleEvidence(progress,exercise,{...config,support},E.slots(exercise).map(x=>({...x,correct:true})),assisted,1000);
    assert.equal(Object.keys(progress.items).length,0);
  }
});

test('partial particle successes transfer even when the overall sentence is wrong',()=>{
  const exercise=C.sentences.find(s=>s.id==='place-library'),progress={items:{},total:1};
  const details=E.diagnose(exercise,['としょかん','に','ほん','を','よみません']);
  E.recordParticleEvidence(progress,exercise,config,details,false,1000);
  assert.equal(progress.items[`particleEvidence:${exercise.id}:object`].correct,1);
  assert.equal(progress.items[`particleEvidence:${exercise.id}:place`].wrong,1);
  assert.equal(E.particlePriority(exercise,{...config,activity:'particles'},progress,1000),0);
});

test('role transfer needs diverse examples, distinguishes roles and returns mistakes sooner',()=>{
  const progress={items:{},total:0};
  const practice={...config,activity:'particles'};
  const answer=(id,correct=true)=>{
    progress.total+=3;
    const ex=C.sentences.find(s=>s.id===id);
    E.recordParticleEvidence(progress,ex,config,E.slots(ex).map(x=>({...x,correct})),false,1000+progress.total);
  };
  answer('place-library');answer('place-home');
  const fresh=C.sentences.find(s=>s.id==='place-home-tea');
  assert.equal(E.particlePriority(fresh,practice,progress,1020),0);
  answer('place-university');
  assert.equal(E.particlePriority(fresh,practice,progress,1020),1);
  assert.equal(E.particlePriority(C.sentences.find(s=>s.id==='time-seven'),practice,progress,1020),0);
  answer('place-library',false);
  assert.equal(E.particlePriority(fresh,practice,progress,1020),0);
  // Shared success also informs independent building; explicitly narrow pools
  // continue to produce questions, and Trouble practice retains its purpose.
  answer('place-home');answer('place-university');answer('place-home-book');
  assert.equal(E.particlePriority(fresh,config,progress,1100),1);
  assert.equal(E.choose([fresh],practice,progress,[],{},()=>.4,1100).id,fresh.id);
  assert.equal(E.particlePriority(fresh,{...practice,review:'trouble'},progress,1100),0);
});

test('repeated unspaced attempts cannot inflate shared mastery and repeated roles count once',()=>{
  const ex=C.sentences.find(s=>s.id==='existence-book');
  const progress={items:{},total:1};
  const details=E.slots(ex).map(x=>({...x,correct:true}));
  E.recordParticleEvidence(progress,ex,config,[...details,...details],false,1000);
  progress.total=2;
  E.recordParticleEvidence(progress,ex,config,details,false,1100);
  assert.ok(Object.values(progress.items).every(x=>x.seen===1));
});


test('existing unaided successes can seed shared scheduling without changing activity scores',()=>{
  const exercise=C.sentences.find(s=>s.id==='place-library');
  const key=E.recordKey(exercise,config),progress={items:{},total:1};
  E.record(progress,key,true,false,1000);
  const before=JSON.stringify(progress.items[key]);
  assert.equal(E.seedParticleEvidence(progress),true);
  assert.equal(JSON.stringify(progress.items[key]),before);
  assert.equal(E.particlePriority(exercise,{...config,activity:'particles'},progress,1000),2);
  assert.equal(progress.total,1);
  const snapshot=JSON.stringify(progress);
  assert.equal(E.seedParticleEvidence(progress),false);
  assert.equal(JSON.stringify(progress),snapshot);
  const supported={items:{'build:supported:place-library':progress.items[key]},total:1};
  E.seedParticleEvidence(supported);
  assert.equal(E.particlePriority(exercise,{...config,activity:'particles'},supported,1000),0);
});


test('familiar roles get occasional checks while newer roles receive most turns',()=>{
  const progress={items:{},total:0};
  const settings={...config,activity:'particles'};
  for(const id of ['place-library','place-home','place-university']){
    const ex=C.sentences.find(s=>s.id===id);progress.total+=3;
    E.recordParticleEvidence(progress,ex,config,E.slots(ex).map(x=>({...x,correct:true})),false,1000);
  }
  const familiar=C.sentences.find(s=>s.id==='place-home-tea');
  const weak=C.sentences.find(s=>s.id==='identity-gakusei');
  E.record(progress,E.recordKey(weak,settings),true,false,1000);
  progress.total=14;
  assert.equal(E.choose([familiar,weak],settings,progress,[],{},()=>.4,1000).id,weak.id);
  progress.total=15;
  assert.equal(E.choose([familiar,weak],settings,progress,[],{},()=>.4,1000).id,familiar.id);
});


test('each sentence topic has eight to twelve distinct checked examples',()=>{
  assert.equal(C.sentences.length,160);
  const models=new Set();
  for(const topic of C.topics.filter(t=>!t.verbGroup)){
    const family=C.sentences.filter(x=>x.topic===topic.id);
    assert.ok(family.length>=8 && family.length<=12,`${topic.id}: ${family.length}`);
    for(const sentence of family){
      const model=E.normalize(E.model(sentence));
      assert.ok(!models.has(model),`Repeated Japanese sentence: ${sentence.id}`);models.add(model);
    }
  }
});

test('expanded early lessons use only their existing beginner vocabulary and grammar',()=>{
  const first=['watashi','gakusei','sensei','nihonjin','ryuugakusei','tomodachi','hon','nihongo'];
  const second=[...first,'kore','sore','are','kono','kaban','kasa','daigaku'];
  const third=[...second,'mizu','ocha','koohii','asagohan','eiga','terebi','ongaku','toshokan','uchi','shichiji','kuji','nichiyoubi','kyou','mainichi',...C.verbs.filter(v=>v.lesson!==4).map(v=>v.id)];
  for(const sentence of C.sentences.filter(s=>s.expanded)){
    const lesson=C.topics.find(t=>t.id===sentence.topic).lesson;
    const allowed=[null,first,second,third][lesson];
    if(allowed)assert.ok(E.wordIds(sentence).every(id=>allowed.includes(id)),sentence.id);
    if(lesson<3)assert.ok(!E.pieces(sentence).some(p=>['object','destination','place','companion','time','bareTime','existencePlace','subject'].includes(p.role)),sentence.id);
    if(lesson<4)assert.ok(!E.pieces(sentence).some(p=>/ました|でした|じゃなかった/.test(p.text)),sentence.id);
  }
});

test('expanded families accept reversed lists and mixed phrase orders without changing meanings',()=>{
  for(const [id,answer] of [
    ['list-bag-umbrella','かさとかばんをかいました'],
    ['list-book-bag-desk','かばんとほんがつくえのうえにあります'],
    ['companion-home-tv','ともだちとうちでテレビをみます'],
    ['duration-library-book','ほんをいちじかんとしょかんでよみました'],
    ['object-friend-book','わたしはともだちのほんをよみます']
  ])assert.ok(E.acceptedSentences(C.sentences.find(s=>s.id===id)).has(E.normalize(answer)),id);
  const reversed=['かさ','と','かばん','を','かいました'];
  assert.ok(E.diagnose(C.sentences.find(s=>s.id==='list-bag-umbrella'),reversed).every(slot=>slot.correct));
  assert.ok(C.sentences.find(s=>s.id==='past-library-book').context.includes('past'));
});

test('expanded examples remain fully subject to strict vocabulary filters',()=>{
  const sentence=C.sentences.find(s=>s.id==='object-friend-book');
  const settings={...config,vocabulary:'introduced',topics:['objects']};
  const vocab={items:{hon:{introduced:true},yomu:{introduced:true}}};
  assert.ok(!E.pool(settings,vocab).some(s=>s.id===sentence.id));
  vocab.items.tomodachi={introduced:true};
  assert.ok(E.pool(settings,vocab).some(s=>s.id===sentence.id));
  assert.ok(!E.pool({...settings,vocabulary:'mastered'},vocab).some(s=>s.id===sentence.id));
});


test('Auto preserves the original pool and scheduling sequence as the default',()=>{
  const legacy={...config},auto={...config,difficulty:'auto'};
  const legacyPool=E.pool(legacy),autoPool=E.pool(auto);
  assert.deepEqual(Array.from(autoPool,x=>x.id),Array.from(legacyPool,x=>x.id));
  const a={items:{},total:0},b={items:{},total:0},recent=[];
  for(let i=0;i<24;i++){
    const old=E.choose(legacyPool,legacy,a,recent,{},()=>.37,1000);
    const current=E.choose(autoPool,auto,b,recent,{},()=>.37,1000);
    assert.equal(current.id,old.id);
    recent.push(old.id);a.total++;b.total++;
    E.record(a,E.recordKey(old,legacy),i%4!==0,false,1000);
    E.record(b,E.recordKey(current,auto),i%4!==0,false,1000);
  }
});

test('difficulty filters selected material without changing lesson, vocabulary, support, or scores',()=>{
  for(const lesson of C.lessons){
    const topics=Array.from(C.topics.filter(t=>t.lesson===lesson.id&&!t.verbGroup),t=>t.id);
    const all=E.pool({...config,topics,difficulty:'auto'});
    const focused=E.pool({...config,topics,difficulty:'focused'});
    const challenge=E.pool({...config,topics,difficulty:'challenge'});
    assert.ok(focused.length>0 && challenge.length>0,`Lesson ${lesson.id}`);
    assert.equal(focused.length+challenge.length,all.length);
    assert.ok(challenge.every(x=>x.difficulty==='challenge'&&topics.includes(x.topic)));
    assert.deepEqual(Array.from(E.pool({...config,topics,support:'supported',difficulty:'challenge'}),x=>x.id),Array.from(challenge,x=>x.id));
  }
  assert.equal(E.pool({...config,topics:['identity'],difficulty:'challenge'}).length,0,'never silently substitute easy examples');
  assert.equal(E.pool({...config,topics:['objects'],difficulty:'challenge',vocabulary:'introduced'},{}).length,0);
  const example=C.sentences.find(x=>x.id==='companion-home-tv');
  assert.equal(example.difficulty,'challenge');
  assert.equal(C.sentences.find(x=>x.id==='object-hon').difficulty,'focused');
  assert.equal(E.recordKey(example,{...config,difficulty:'auto'}),E.recordKey(example,{...config,difficulty:'challenge'}));
  assert.equal(E.pool({...config,activity:'verbs',difficulty:'challenge'}).length,E.pool({...config,activity:'verbs'}).length);
});

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
    assert.equal(pool.length,30);
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
  const harness=vm.createContext({current:{},teaching:false,answered:false,$:()=>null,check:()=>checks++,next:()=>advances++});
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

import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
await import('../features/kana/vocabulary-speaking.js');
const { matches, matchesSpoken, sourceSpellingsFor, matchesRomaji, romajiToHiragana, interpretation, promptFor, createSession } = globalThis.KANA_SPRINT_VOCABULARY_SPEAKING;

test('speaking accepts kana, kanji, width and punctuation variants without fuzzy matches', () => {
  const word = { id: 'mizu', jp: 'みず' };
  for (const value of ['水', 'みず。', 'ミズ', ' ﾐｽﾞ！ ']) assert.equal(matches(word, value), true, value);
  for (const value of ['', ' ', 'みす', '水です', 'お茶']) assert.equal(matches(word, value), false, value);
  assert.equal(matches({ id: 'nan-nani', jp: 'なん／なに' }, 'なに'), true);
  assert.equal(matches({ id: 'suffix-en', jp: '～えん' }, '円'), true);
  assert.equal(matches({ id: 'ichiji', jp: 'いちじ' }, '１時'), true);
  assert.equal(matches({ id: 'arigatou-gozaimasu', jp: 'ありがとうございます' }, 'ありがとう'), false);
});

test('suffixes use a short carrier while ordinary vocabulary stays isolated', () => {
  const suffix = { id: 'suffix-go', jp: '～ご' };
  assert.equal(promptFor(suffix).frame, 'にほん ___');
  assert.equal(matchesSpoken(suffix, '日本語'), true);
  assert.equal(matchesSpoken(suffix, 'にほんご'), true);
  assert.equal(matchesSpoken(suffix, '語'), false);
  const honorific = { id: 'suffix-san', jp: '～さん' };
  assert.equal(promptFor(honorific).frame, 'たなか ___');
  assert.equal(matchesSpoken(honorific, '田中さん'), true);
  assert.equal(matchesSpoken(honorific, '3'), false);
  const major = { id: 'senkou', jp: 'せんこう' };
  assert.equal(promptFor(major), null);
  assert.equal(matchesSpoken(major, '専攻'), true);
  assert.equal(matchesSpoken(major, '私の専攻です'), false);
  assert.equal(matchesSpoken({ id: 'mizu', jp: 'みず' }, '水'), true);
  const flatCounter = { id: 'suffix-mai', jp: '～まい' };
  assert.equal(promptFor(flatCounter).frame, 'いち ___');
  for (const value of ['いちまい', '一枚', '1枚']) assert.equal(matchesSpoken(flatCounter, value), true, value);
  assert.equal(matchesSpoken(flatCounter, '枚'), false);
});

test('short Genki and N5 suffixes use complete phrases for speech recognition', () => {
  for (const [id, jp, phrase, spelling] of [
    ['suffix-jikan', '～じかん', 'いちじかん', '一時間'],
    ['suffix-goro', '～ごろ', 'さんじごろ', '三時ごろ'],
    ['suffix-gurai', '～ぐらい', 'いちじかんぐらい', '一時間ぐらい'],
    ['suffix-to', '～と', 'ともだちと', '友達と'],
    ['n5-0003', 'かい', 'にかい', '二階'],
    ['n5-0004', 'かい', 'さんかい', '三回'],
    ['n5-0005', 'かかん', 'みっかかん', '三日間'],
    ['n5-0006', 'かげつ', 'いっかげつ', '一か月'],
    ['n5-0007', 'かた', 'よみかた', '読み方'],
    ['n5-0008', 'がつ', 'いちがつ', '一月'],
    ['n5-0009', 'がります', 'たべたがります', '食べたがります'],
    ['n5-0010', 'がわ', 'みぎがわ', '右側'],
    ['n5-0011', 'キロ', 'いちキロ', '1キロ'],
    ['n5-0012', 'キロ', 'いちキロ', '1キロ'],
    ['n5-0014', 'グラム', 'ひゃくグラム', '100グラム'],
    ['n5-0015', 'こ', 'いっこ', '一個'],
    ['n5-0019', 'さつ', 'いっさつ', '一冊'],
    ['n5-0023', 'しゅうかん', 'いっしゅうかん', '一週間'],
    ['n5-0025', 'すぎ', 'じゅうじすぎ', '十時過ぎ'],
    ['n5-0026', 'ずつ', 'ひとつずつ', '一つずつ'],
    ['n5-0028', 'だい', 'いちだい', '一台'],
    ['n5-0029', 'たち', 'わたしたち', '私たち'],
    ['n5-0030', 'ちゅう', 'じゅぎょうちゅう', '授業中'],
    ['n5-0031', 'つ', 'ひとつ', '一つ'],
    ['n5-0032', 'ど', 'いちど', '一度'],
    ['n5-0033', 'にち', 'じゅういちにち', '十一日'],
    ['n5-0034', 'にん', 'さんにん', '三人'],
    ['n5-0035', 'ねん', 'にねん', '二年'],
    ['n5-0036', 'はい/ばい/ぱい', 'いっぱい', '一杯'],
    ['n5-0039', 'ひき/びき/ぴき', 'いっぴき', '一匹'],
    ['n5-0040', 'ふん/ぷん', 'いっぷん', '一分'],
    ['n5-0041', 'ページ', 'いちページ', '1ページ'],
    ['n5-0042', 'ほん/ぼん/ぽん', 'いっぽん', '一本'],
    ['n5-0044', 'まえ', 'さんねんまえ', '三年前'],
    ['n5-0045', 'メートル', 'いちメートル', '1メートル'],
    ['n5-0046', 'や', 'ほんや', '本屋'],
    ['n5-0138', 'お', 'おちゃ', 'お茶'],
  ]) {
    const word = { id, jp };
    assert.ok(promptFor(word), `${id}: missing phrase prompt`);
    assert.equal(matchesSpoken(word, phrase), true, `${id}: kana phrase`);
    assert.equal(matchesSpoken(word, spelling), true, `${id}: written phrase`);
    assert.equal(matchesSpoken(word, '音声認識'), false, `${id}: unrelated phrase`);
  }
});

test('curated N5 spellings cover checked kanji transcripts without borrowing unrelated spellings', async () => {
  await import('../features/kana/vocabulary-n5.js');
  const sources = globalThis.KANA_SPRINT_N5_VOCABULARY.words;
  const curated = JSON.parse(readFileSync(new URL('../content/vocabulary/n5-speech-spellings.json', import.meta.url), 'utf8'));
  const sourceIds = new Set(sources.map(word => word.sourceId));
  for (const [id, spellings] of Object.entries(curated)) {
    assert.equal(sourceIds.has(id), true, `Unknown N5 source: ${id}`);
    assert.ok(Array.isArray(spellings) && spellings.length, `${id}: empty spellings`);
    assert.equal(new Set(spellings).size, spellings.length, `${id}: duplicate spelling`);
    const source = sources.find(word => word.sourceId === id);
    for (const spelling of spellings) {
      assert.ok(source.spellings.includes(spelling), `${id}: ${spelling}`);
      if (!source.existingWordIds.length) {
        const word = { id, jp: source.kana.replace(/^～/, '') };
        word.speechSpellings = sourceSpellingsFor(word, source);
        assert.equal(matchesSpoken(word, spelling), true, `${id}: ${spelling} rejected`);
      }
    }
  }
  for (const [id, transcript] of [
    ['n5-0051', '上がります'], ['n5-0081', '洗います'], ['n5-0148', '置きます'],
    ['n5-0230', '簡単'], ['n5-0482', '東京'], ['n5-0507', '取ります'],
    ['n5-0508', '撮ります'], ['n5-0740', '例'],
  ]) {
    const source = sources.find(word => word.sourceId === id);
    const word = { id, jp: source.kana, speechSpellings: sourceSpellingsFor({ jp: source.kana }, source) };
    assert.equal(matchesSpoken(word, transcript), true, `${id}: ${transcript}`);
    assert.equal(matchesSpoken(word, '音声認識'), false, `${id}: unrelated transcript`);
  }
  for (const [id, right, wrong] of [
    ['n5-0148', '置きます', '起きます'], ['n5-0149', '起きます', '置きます'],
    ['n5-0197', '帰ります', '返します'], ['n5-0507', '取ります', '撮ります'],
    ['n5-0508', '撮ります', '取ります'], ['n5-0524', '並べます', '並びます'],
  ]) {
    const source = sources.find(word => word.sourceId === id);
    const word = { id, jp: source.kana, speechSpellings: sourceSpellingsFor({ jp: source.kana }, source) };
    assert.equal(matchesSpoken(word, right), true, `${id}: correct spelling`);
    assert.equal(matchesSpoken(word, wrong), false, `${id}: unrelated homophone`);
  }
  const saturday = sources.find(word => word.sourceId === 'n5-0477');
  const example = sources.find(word => word.sourceId === 'n5-0740');
  const walk = sources.find(word => word.sourceId === 'n5-0324');
  const walkWord = { id: walk.sourceId, jp: walk.kana, speechSpellings: sourceSpellingsFor({ jp: walk.kana }, walk) };
  for (const spelling of ['さんぽします', 'さんぽをします', '散歩します', '散歩をします']) {
    assert.equal(matchesSpoken(walkWord, spelling), true, spelling);
  }
  assert.deepEqual(saturday.spellings, ['土']);
  assert.deepEqual(example.spellings, ['例']);
  assert.equal(matchesSpoken({ id: saturday.sourceId, jp: saturday.kana, speechSpellings: saturday.spellings }, '度'), false);
  assert.equal(matchesSpoken({ id: example.sourceId, jp: example.kana, speechSpellings: example.spellings }, '零'), false);
  const kind = sources.find(word => word.sourceId === 'n5-0707');
  const genkiKind = { id: 'yasashii', jp: 'やさしい', speechSpellings: sourceSpellingsFor({ jp: 'やさしい' }, kind) };
  for (const spelling of ['易しい', '優しい']) assert.equal(matchesSpoken(genkiKind, spelling), true);
  assert.deepEqual(sourceSpellingsFor({ jp: 'あそぶ' }, sources.find(word => word.sourceId === 'n5-0063')), []);
});

test('Genki Lesson 3 speech accepts exact kanji spellings without accepting other words or verb forms', async () => {
  await import('../features/kana/vocabulary-n5.js');
  const sources = globalThis.KANA_SPRINT_N5_VOCABULARY.words;
  for (const [id, jp, transcript] of [
    ['eiga', 'えいが', '映画'], ['ongaku', 'おんがく', '音楽'], ['zasshi', 'ざっし', '雑誌'],
    ['hirugohan', 'ひるごはん', '昼ご飯'], ['gakkou', 'がっこう', '学校'],
    ['kiku', 'きく', '聞く'], ['hanasu', 'はなす', '話す'], ['miru', 'みる', '見る'],
    ['benkyou-suru', 'べんきょうする', '勉強する'], ['shuumatsu', 'しゅうまつ', '週末'],
  ]) {
    const word = { id, jp };
    word.speechSpellings = sources.filter(source => source.existingWordIds.includes(id))
      .flatMap(source => sourceSpellingsFor(word, source));
    assert.equal(matchesSpoken(word, transcript), true, `${id}: ${transcript}`);
    assert.equal(matchesSpoken(word, '音声認識'), false, `${id}: unrelated transcript`);
  }
  assert.equal(matchesSpoken({ id: 'kiku', jp: 'きく' }, '聞きます'), false);
  assert.deepEqual(sourceSpellingsFor({ jp: 'きく' }, { kana: 'ききます', spellings: ['聞きます'] }), []);
  assert.deepEqual(sourceSpellingsFor({ jp: '～さん' }, sources.find(source => source.existingWordIds.includes('suffix-san'))), []);
});

test('Genki Lessons 1, 2, 4, 5, and 6 accept their checked kanji spellings', async () => {
  await import('../features/kana/vocabulary-n5.js');
  const sources = globalThis.KANA_SPRINT_N5_VOCABULARY.words;
  for (const [id, jp, transcript] of [
    ['daigaku', 'だいがく', '大学'], ['shufu', 'しゅふ', '主婦'],
    ['toshokan', 'としょかん', '図書館'], ['yuubinkyoku', 'ゆうびんきょく', '郵便局'],
    ['kodomo', 'こども', '子供'], ['kaimono', 'かいもの', '買い物'],
    ['getsuyoubi', 'げつようび', '月曜日'], ['kaku', 'かく', '書く'],
    ['ryokou', 'りょこう', '旅行'], ['yasashii', 'やさしい', '優しい'],
    ['kyoukasho', 'きょうかしょ', '教科書'], ['akeru', 'あける', '開ける'],
    ['denwa-suru', 'でんわする', '電話する'],
  ]) {
    const word = { id, jp };
    word.speechSpellings = sources.filter(source => source.existingWordIds.includes(id))
      .flatMap(source => sourceSpellingsFor(word, source));
    assert.equal(matchesSpoken(word, transcript), true, `${id}: ${transcript}`);
    assert.equal(matchesSpoken(word, '音声認識'), false, `${id}: unrelated transcript`);
  }
  const dictionaryVerb = { id: 'asobu', jp: 'あそぶ' };
  dictionaryVerb.speechSpellings = sources.filter(source => source.existingWordIds.includes('asobu'))
    .flatMap(source => sourceSpellingsFor(dictionaryVerb, source));
  assert.equal(matchesSpoken(dictionaryVerb, '遊びます'), false);
});

test('romaji typing matches exact vocabulary answers and previews kana', () => {
  assert.equal(matchesRomaji({ romaji: 'mizu' }, ' MIZU '), true);
  assert.equal(matchesRomaji({ romaji: 'arigatou gozaimasu' }, 'arigatou-gozaimasu'), true);
  assert.equal(matchesRomaji({ romaji: 'mizu' }, 'miso'), false);
  assert.equal(romajiToHiragana('mizu'), 'みず');
  assert.equal(romajiToHiragana('kitte'), 'きって');
  assert.equal(romajiToHiragana("kon'nichiha"), 'こんにちは');
  // Generic conversion stays phonetic; the UI swaps a complete known answer to its canonical spelling.
  assert.equal(romajiToHiragana('konnichiwa'), 'こんにちわ');
});

test('speech interpretation shows canonical kana for known kanji transcripts', () => {
  const words = [
    { id: 'mizu', jp: 'みず', romaji: 'mizu' },
    { id: 'amerika', jp: 'アメリカ', romaji: 'amerika' },
  ];
  assert.equal(interpretation(words, '水'), 'みず');
  assert.equal(interpretation(words, 'アメリカ'), 'アメリカ');
  assert.equal(interpretation(words, 'ミズ'), 'みず');
  assert.equal(interpretation(words, '未知語'), '');
  const day = { id: 'n5-0099', jp: 'いちにち', speechSpellings: ['一日'] };
  const firstDay = { id: 'n5-0442', jp: 'ついたち', speechSpellings: ['一日'] };
  assert.equal(interpretation([day, firstDay], '一日', firstDay), 'ついたち');
});

class Recognition {
  static instances = [];
  constructor() { Recognition.instances.push(this); }
  start() { this.onstart(); }
  stop() { this.stopped = true; }
  abort() { this.aborted = true; this.onend?.(); }
  result(text, final) { this.onresult({ results: [Object.assign([{ transcript: text }], { isFinal: final })] }); }
}

test('interim speech and Stop cannot submit until a final result and end', () => {
  let state;
  const session = createSession(Recognition, value => { state = value; });
  session.start();
  const recognition = Recognition.instances.at(-1);
  assert.equal(recognition.lang, 'ja-JP');
  recognition.result('み', false);
  assert.equal(state.status, 'listening');
  session.stop();
  assert.equal(state.status, 'processing');
  recognition.result('水', true);
  assert.equal(state.status, 'processing');
  recognition.onend();
  assert.equal(state.status, 'review');
  assert.equal(state.text, '水');
  session.cancel();
});

test('retry and navigation ignore results from cancelled recognition', () => {
  let state;
  const session = createSession(Recognition, value => { state = value; });
  session.start();
  const old = Recognition.instances.at(-1);
  session.start();
  const latest = Recognition.instances.at(-1);
  old.result('wrong question', true);
  old.onend();
  assert.equal(state.text, '');
  latest.result('水', true);
  latest.onend();
  assert.equal(state.text, '水');
  session.cancel();
  latest.onerror({ error: 'network' });
  assert.equal(state.status, 'review');
});

test('permission errors and silence are recoverable, never reviewable answers', () => {
  let state;
  const session = createSession(Recognition, value => { state = value; });
  session.start();
  Recognition.instances.at(-1).onerror({ error: 'not-allowed' });
  assert.equal(state.status, 'error');
  assert.match(state.message, /denied/);
  session.start();
  Recognition.instances.at(-1).result('partial', false);
  Recognition.instances.at(-1).onend();
  assert.equal(state.status, 'error');
  assert.equal(state.text, '');
  session.cancel();
});

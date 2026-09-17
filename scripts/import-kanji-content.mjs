import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const kanjiAliveCsv = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(root, 'tmp', 'kanji-data-sparse', 'language-data', 'ka_data.csv');

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') quoted = false;
      else field += character;
    } else if (character === '"') quoted = true;
    else if (character === ',') {
      row.push(field);
      field = '';
    } else if (character === '\n') {
      row.push(field.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      field = '';
    } else field += character;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  const headers = rows.shift();
  return rows.filter(row => row.length === headers.length).map(row => Object.fromEntries(headers.map((header, index) => [header, row[index]])));
}

const splitReadings = value => String(value || '')
  .split('、')
  .map(reading => reading.trim())
  .filter(Boolean);

const cleanMeaning = value => String(value || '')
  .replace(/\s+[\u3040-\u30ff\u3400-\u9fff].*$/u, '')
  .replace(/\s*=\s*$/, '')
  .replace(/\s*\[[^\]]+\]\s*$/u, '')
  .trim();

const sourceLists = JSON.parse(await readFile(path.join(root, 'content', 'kanji', 'n5-source-lists.json'), 'utf8'));
const vocabulary = JSON.parse(await readFile(path.join(root, 'content', 'vocabulary', 'n5-topics.json'), 'utf8'));
const vocabularyExamples = JSON.parse(await readFile(path.join(root, 'content', 'vocabulary', 'n5-examples.json'), 'utf8')).examples;
const kanjiAliveRows = parseCsv(await readFile(kanjiAliveCsv, 'utf8'));
const kanjiAlive = new Map(kanjiAliveRows.map(row => [row.kanji, row]));

const core = sourceLists.sources.basicKanji120.legacyLevel4Core;
const extended = sourceLists.sources.basicKanji120.possibleAdditional;
const ordered = [...core, ...extended];

const stageDefinitions = [
  ['people-and-first-numbers', 'People & first numbers', 'Recognize people and the first number shapes.', 1, 10],
  ['numbers-and-calendar', 'Numbers & calendar', 'Finish the basic numbers and begin days and dates.', 11, 20],
  ['money-movement-and-size', 'Money, movement & size', 'Read common quantities, movement, and size words.', 21, 30],
  ['position-and-nature', 'Position & nature', 'Build spatial language and familiar natural shapes.', 31, 40],
  ['family-school-and-questions', 'Family, school & questions', 'Recognize people, learning, and everyday questions.', 41, 50],
  ['time-and-transport', 'Time & transport', 'Read practical time expressions and travel words.', 51, 60],
  ['nature-food-and-language', 'Nature, food & language', 'Connect everyday surroundings with communication.', 61, 70],
  ['actions-and-directions', 'Actions & directions', 'Practise movement, weather, and the four directions.', 71, 80],
  ['body-and-shopping', 'Body & shopping', 'Recognize body parts and useful shopping characters.', 81, 90],
  ['daily-life-and-places', 'Daily life & places', 'Read common times, people, homes, and shops.', 91, 104],
  ['extended-actions', 'Extended actions', 'Add useful descriptions and everyday actions.', 105, 112],
  ['extended-life-and-travel', 'Extended life & travel', 'Complete the wider preparation set with places and movement.', 113, 120]
].map(([id, label, description, start, end], index) => ({ id, label, description, order: index + 1, start, end, tier: start <= 104 ? 'core' : 'extended' }));

const manualAnchors = {
  人: ['人', 'ひと', 'person'], 日: ['日', 'ひ', 'day'], 四: ['四', 'よん', 'four'],
  月: ['月', 'つき', 'moon; month'], 火: ['火', 'ひ', 'fire'], 木: ['木', 'き', 'tree'],
  金: ['お金', 'おかね', 'money'], 土: ['土よう日', 'どようび', 'Saturday'], 円: ['円', 'えん', 'yen'],
  行: ['行きます', 'いきます', 'go'], 大: ['大きい', 'おおきい', 'big'], 小: ['小さい', 'ちいさい', 'small'],
  中: ['中', 'なか', 'inside'], 本: ['本', 'ほん', 'book'], 時: ['何時', 'なんじ', 'what time'],
  間: ['時間', 'じかん', 'time'], 分: ['五分', 'ごふん', 'five minutes'], 年: ['今年', 'ことし', 'this year'],
  前: ['前', 'まえ', 'front; before'], 午: ['午前', 'ごぜん', 'a.m.'], 生: ['学生', 'がくせい', 'student'],
  食: ['食べます', 'たべます', 'eat'], 国: ['国', 'くに', 'country'], 語: ['日本語', 'にほんご', 'Japanese language'],
  夕: ['夕がた', 'ゆうがた', 'evening'], 私: ['私', 'わたし', 'I; me'], 飲: ['飲みます', 'のみます', 'drink'],
  新: ['新しい', 'あたらしい', 'new'], 駅: ['駅', 'えき', 'station'],
  思: ['思います', 'おもいます', 'think'], 走: ['走ります', 'はしります', 'run'], 道: ['道', 'みち', 'road; way']
};

const manualExamples = {
  四: ['りんごを四つください。', 'Please give me four apples.'],
  月: ['よる、月をみます。', 'I look at the moon at night.'],
  火: ['火をけしてください。', 'Please put out the fire.'],
  円: ['このほんはせん円です。', 'This book costs one thousand yen.'],
  分: ['あと五分まってください。', 'Please wait five more minutes.'],
  夕: ['夕がたにかえります。', 'I will return in the evening.'],
  思: ['わたしもそう思います。', 'I think so too.'],
  走: ['えきまで走ります。', 'I run to the station.']
};

const radicalCharacterOverrides = {
  校: '木', 時: '日', 話: '言', 読: '言', 語: '言', 紙: '糸',
  知: '矢', 空: '穴', 銀: '金', 駅: '馬'
};

function vocabularyCandidates(character) {
  return vocabulary.words
    .filter(word => word.kanji?.includes(character))
    .map(word => ({ ...word, display: word.kanji.replace(/^～/, ''), reading: word.kana.replace(/^～/, '') }))
    .filter(word => word.display && word.reading)
    .sort((left, right) => {
      const exact = Number(right.display === character) - Number(left.display === character);
      if (exact) return exact;
      const clean = Number(!/[。=]/.test(right.meaning)) - Number(!/[。=]/.test(left.meaning));
      if (clean) return clean;
      return left.display.length - right.display.length || left.order - right.order;
    });
}

function anchorFor(character, sourceRow) {
  const manual = manualAnchors[character];
  const candidates = vocabularyCandidates(character);
  let selected = manual
    ? candidates.find(candidate => candidate.display === manual[0] && candidate.reading === manual[1])
    : candidates[0];
  const word = manual?.[0] || selected?.display;
  const reading = manual?.[1] || selected?.reading;
  const meaning = manual?.[2] || cleanMeaning(selected?.meaning);
  if (word && reading && meaning) {
    let example = selected ? vocabularyExamples[selected.id] : null;
    if (manualExamples[character]) example = manualExamples[character];
    if (example) {
      const [sentence, translation] = example;
      return { word, reading, meaning, sentence, translation, vocabularySourceId: selected?.id || null };
    }
    return { word, reading, meaning, sentence: null, translation: null, vocabularySourceId: selected?.id || null };
  }

  let examples = [];
  try { examples = JSON.parse(sourceRow.examples || '[]'); } catch {}
  const fallback = examples
    .map(([entry, entryMeaning]) => {
      const match = entry.match(/^(.+?)（(.+?)）$/u);
      return match ? { word: match[1], reading: match[2], meaning: entryMeaning } : null;
    })
    .filter(Boolean)
    .sort((left, right) => left.word.length - right.word.length)[0];
  if (!fallback) throw new Error(`No anchor word found for ${character}`);
  return { ...fallback, sentence: null, translation: null, vocabularySourceId: null };
}

const entries = ordered.map((character, index) => {
  const order = index + 1;
  const sourceRow = kanjiAlive.get(character);
  if (!sourceRow) throw new Error(`Kanji alive has no row for ${character}`);
  const stage = stageDefinitions.find(candidate => order >= candidate.start && order <= candidate.end);
  return {
    id: `n5-kanji-${String(order).padStart(3, '0')}`,
    order,
    character,
    tier: order <= core.length ? 'core' : 'extended',
    stageId: stage.id,
    meanings: sourceRow.kmeaning.split(',').map(value => value.trim()).filter(Boolean),
    strokes: Number(sourceRow.kstroke),
    readings: {
      kunyomi: splitReadings(sourceRow.kunyomi_ja),
      onyomi: splitReadings(sourceRow.onyomi_ja)
    },
    radical: {
      character: radicalCharacterOverrides[character] || sourceRow.radical,
      meaning: sourceRow.rad_meaning,
      japaneseName: sourceRow.rad_name_ja,
      strokes: Number(sourceRow.rad_stroke) || null
    },
    anchor: anchorFor(character, sourceRow),
    mnemonic: null
  };
});

const output = {
  schemaVersion: 1,
  level: 'N5 preparation',
  recordCount: entries.length,
  coreCount: core.length,
  extendedCount: extended.length,
  scopeNote: 'The JLPT does not publish a fixed current kanji list. This preparation set uses the 104-character legacy core from Basic Kanji 120, followed by its 16 additional characters.',
  sources: {
    curriculum: 'content/kanji/n5-source-lists.json',
    languageData: {
      name: 'Kanji alive language data',
      url: 'https://github.com/kanjialive/kanji-data-media',
      license: 'CC BY 4.0'
    },
    anchorVocabulary: 'content/vocabulary/n5-topics.json',
    exampleSentences: 'content/vocabulary/n5-examples.json'
  },
  stages: stageDefinitions.map(({ start, end, ...stage }) => ({ ...stage, kanjiIds: entries.filter(entry => entry.stageId === stage.id).map(entry => entry.id) })),
  kanji: entries
};

await writeFile(path.join(root, 'content', 'kanji', 'n5-kanji.json'), `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${entries.length} kanji to content/kanji/n5-kanji.json.`);

(() => {
  "use strict";
  const C = globalThis.SENTENCE_COURSE;
  const normalize = value => String(value).normalize("NFKC").toLowerCase().replace(/[\s\p{P}]/gu, "");
  const shuffle = (items, random = Math.random) => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
    return result;
  };
  const pieces = exercise => exercise.chunks.flat();
  const slots = exercise => pieces(exercise).flatMap((piece, index, all) => piece.role ? [{ ...piece, index, anchor: all.slice(0,index).filter(x => !x.role).at(-1)?.text || "", choices: C.roles[piece.role].choices }] : []);
  const model = exercise => exercise.chunks.map(chunk => chunk.map(x => x.text).join("")).join(" ") + "。";
  function acceptedSentences(exercise) {
    let variants = [[]];
    for (const chunk of exercise.chunks) {
      let chunkVariants = [""];
      for (const piece of chunk) chunkVariants = chunkVariants.flatMap(prefix => (piece.role ? C.roles[piece.role].choices : [piece.text]).map(text => prefix + text));
      variants = variants.flatMap(prefix => chunkVariants.map(text => [...prefix, text]));
    }
    return new Set(variants.flatMap(chunks => (exercise.orders || [chunks.map((_,i) => i)]).map(order => normalize(order.map(i => chunks[i]).join("")))));
  }
  function particleAnswer(value, role) {
    const aliases = { wa:"は", ha:"は", ga:"が", o:"を", wo:"を", ni:"に", e:"へ", he:"へ", de:"で", no:"の", to:"と", mo:"も", ka:"か", none:"", "なし":"", "—":"", "-":"" };
    const raw = String(value).normalize("NFKC").trim().toLowerCase();
    const answer = Object.hasOwn(aliases,raw) ? aliases[raw] : raw;
    return { answer, correct: C.roles[role].choices.includes(answer) };
  }
  function diagnose(exercise, tokens) {
    // Match each marker to its own preceding word, even when phrases are reordered.
    const texts = tokens.map(x => typeof x === "string" ? x : x.text);
    const markers = new Set(["は","が","を","に","へ","で","の","と","も","か"]);
    return slots(exercise).map(slot => {
      const at = texts.indexOf(slot.anchor);
      const next = at >= 0 ? texts[at + 1] : undefined;
      const answer = markers.has(next) ? next : "";
      return { ...slot, answer, correct: at >= 0 && slot.choices.includes(answer) };
    });
  }
  function tileBank(exercise, supported, random = Math.random, options = {}) {
    const config = options.settings || {}, vocabulary = options.vocabulary || {};
    const lesson = C.topics.find(t => t.id === exercise.topic).lesson;
    const units = supported ? exercise.chunks : pieces(exercise).filter(x => !x.role).map(x => [x]);
    const describe = unit => unit.map(piece => {
      const verb = C.verbs.find(v => v.id === piece.wordId);
      return verb ? `${verb.meaning} · ${piece.text.endsWith("ません") ? "negative" : "affirmative"}` : C.words[piece.wordId]?.meaning;
    }).filter(Boolean).join(" · ") || "polite ending";
    const tile = (unit, extra = false) => ({ text:unit.map(x => x.text).join(""), meaning:describe(unit), wordIds:[...new Set(unit.map(x => x.wordId).filter(Boolean))], distractor:extra });
    const source = units.map(unit => tile(unit));
    const hasVerb = pieces(exercise).some(piece => C.verbs.some(verb => verb.id === piece.wordId));
    const seen = new Set(source.map(x => normalize(x.text)));
    const candidates = [];
    const allowed = unit => unit.every(piece => !piece.wordId || !["introduced","mastered"].includes(config.vocabulary) || familiar(piece.wordId,vocabulary,config.vocabulary === "mastered"));
    function add(unit, priority) {
      const candidate = tile(unit,true), key = normalize(candidate.text);
      if (!key || seen.has(key) || !allowed(unit)) return;
      seen.add(key);
      const known = candidate.wordIds.length ? candidate.wordIds.filter(id => familiar(id,vocabulary)).length / candidate.wordIds.length : 0;
      candidates.push({...candidate,priority:priority + (config.vocabulary === "prefer" ? known * 50 : 0)});
    }
    for (const unit of units) {
      unit.forEach((piece,index) => {
        if (!piece.wordId) return;
        const related = [...new Set(C.wordGroups.filter(group => group.includes(piece.wordId)).flat())].filter(id => id !== piece.wordId);
        const verb = C.verbs.find(v => v.id === piece.wordId);
        const replace = (text,id,priority) => add(unit.map((x,i) => i === index ? {...x,text,wordId:id} : x),priority);
        if (verb) {
          const negative = piece.text.endsWith("ません");
          replace(verb.stem + (negative ? "ます" : "ません"),verb.id,45);
          related.forEach(id => { const other=C.verbs.find(v=>v.id===id); if(other)replace(other.stem+(negative ? "ません" : "ます"),id,35); });
        } else related.forEach(id => {
          // An extra choice may use earlier material, but never a later lesson's word.
          const earliest = Math.min(...C.sentences.filter(s => pieces(s).some(x => x.wordId === id)).map(s => C.topics.find(t => t.id === s.topic).lesson));
          if (earliest <= lesson) replace(C.words[id].jp,id,35);
        });
      });
    }
    // Fill from authored phrases at the same level when close contrasts are scarce.
    for (const sentence of C.sentences.filter(s => C.topics.find(t => t.id === s.topic).lesson <= lesson)) {
      const alternatives = supported ? sentence.chunks : pieces(sentence).filter(x => !x.role).map(x => [x]);
      alternatives.forEach(unit => {
        const verbForm = unit.some(piece => C.verbs.some(verb => verb.id === piece.wordId));
        // Keep spare endings comparable to the target instead of padding an action
        // sentence with visibly unrelated noun-sentence endings or demonstratives.
        if (hasVerb && !unit.some(piece => piece.wordId)) return;
        add(unit,hasVerb && verbForm ? 20 : 5);
      });
    }
    const target = Math.max(source.length + 2, Number(config.bankSize) || (supported ? 6 : 8));
    const extras = shuffle(candidates,random).sort((a,b) => b.priority - a.priority).slice(0,target-source.length);
    return shuffle([...source,...extras].map((x,index) => ({...x,id:`word-${index}`})),random);
  }
  function hiraganaPreview(value) {
    const raw = String(value).normalize("NFKC").replace(/[’‘]/g,"'");
    // Convert only Latin runs so Japanese text, spaces, and punctuation survive.
    return raw.replace(/[a-zāīūēō']+/gi,run => globalThis.KANA_SPRINT_VOCABULARY_SPEAKING.romajiToHiragana(run));
  }
  function particlePreview(value) {
    const raw = String(value).normalize("NFKC").trim().toLowerCase();
    if (!raw) return "?";
    const aliases = {wa:"は",ha:"は",o:"を",wo:"を",e:"へ",he:"へ",none:"—","なし":"—","-":"—","—":"—"};
    return Object.hasOwn(aliases,raw) ? aliases[raw] : hiraganaPreview(raw);
  }
  function verbExercises() {
    return C.verbs.flatMap(verb => ["affirmative","negative"].map(form => ({
      id: `${verb.id}-${form}`, topic: `verbs-${verb.group}`, verb, form,
      answer: verb.stem + (form === "affirmative" ? "ます" : "ません"),
      romaji: verb.romajiStem + (form === "affirmative" ? "masu" : "masen"),
      kanji: verb.kanjiStem + (form === "affirmative" ? "ます" : "ません"),
      wordIds: [verb.id]
    })));
  }
  const verbs = verbExercises();
  const wordIds = exercise => exercise.wordIds || [...new Set(pieces(exercise).map(x => x.wordId).filter(Boolean))];
  const familiar = (id, vocabulary, mastered = false) => C.words[id].vocabularyIds.some(key => {
    const item = vocabulary.items?.[key];
    return Boolean(item?.introduced && (!mastered || (item.seen > 0 && item.mastery >= 72)));
  });
  function pool(settings, vocabulary = {}) {
    const all = settings.activity === "verbs" ? verbs : C.sentences;
    return all.filter(exercise => settings.topics.includes(exercise.topic) &&
      (!["introduced","mastered"].includes(settings.vocabulary) || wordIds(exercise).every(id => familiar(id,vocabulary,settings.vocabulary === "mastered"))));
  }
  function recordKey(exercise, settings) { return `${settings.activity}:${settings.activity === "build" ? settings.support : settings.input}:${exercise.id}`; }
  function choose(pool, settings, progress, recent = [], vocabulary = {}, random = Math.random, now = Date.now()) {
    if (!pool.length) return null;
    const available = pool.filter(x => !recent.slice(-Math.min(5, pool.length - 1)).includes(x.id));
    // With a one-item pool slice(-0) would include all history; fall back safely.
    const candidates = available.length ? available : pool;
    const ranked = candidates.map(exercise => {
      const item = progress.items?.[recordKey(exercise,settings)];
      const due = item && item.dueAt <= now && item.dueQuestion <= progress.total;
      const known = settings.vocabulary === "prefer" ? wordIds(exercise).filter(id => familiar(id,vocabulary)).length / wordIds(exercise).length : 0;
      return { exercise, score: (due ? 100 : !item ? 55 : 0) + (item?.lastWasCorrect === false ? 12 : 0) + known * 14 + random() * 10 };
    });
    return ranked.sort((a,b) => b.score - a.score)[0].exercise;
  }
  function record(progress, key, correct, assisted, now = Date.now()) {
    const item = progress.items[key] || { seen:0, correct:0, wrong:0, assisted:0, run:0 };
    item.seen++; item[assisted ? "assisted" : correct ? "correct" : "wrong"]++;
    item.run = correct && !assisted ? item.run + 1 : 0;
    item.lastWasCorrect = correct && !assisted; item.lastSeen = now;
    item.dueQuestion = progress.total + (correct && !assisted ? 6 : 3);
    item.dueAt = now + (correct && !assisted ? Math.min(7 * 86400000, 600000 * 3 ** Math.min(7,item.run-1)) : 0);
    progress.items[key] = item;
    return item;
  }
  globalThis.SENTENCE_ENGINE = { normalize, shuffle, pieces, slots, model, acceptedSentences, particleAnswer, diagnose, tileBank, hiraganaPreview, particlePreview, verbs, wordIds, familiar, pool, recordKey, choose, record };
})();

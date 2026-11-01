(() => {
  "use strict";
  const E=globalThis.SENTENCE_ENGINE,C=globalThis.SENTENCE_COURSE;
  const aliases={wa:"は",ha:"は",o:"を",wo:"を",e:"へ",he:"へ",ga:"が",ni:"に",de:"で",no:"の",to:"と",mo:"も",ka:"か"};
  // This is a course-wide spelling dictionary, never the current answer or bank.
  const spellings=new Map();
  for(const word of Object.values(C.words))spellings.set(E.normalize(E.hiraganaPreview(word.romaji)),word.jp);
  function convert(raw) {
    const text=String(raw).normalize("NFKC").trim();
    const alias=aliases[text.toLowerCase()];
    if(alias)return {text:alias,raw:text,particle:true};
    const kana=E.hiraganaPreview(text);
    return {text:spellings.get(E.normalize(kana))||kana,raw:text,typed:true};
  }
  function split(value,flush=false) {
    const parts=String(value).split(/\s+/u).filter(Boolean);
    const pending=flush||/\s$/u.test(value)?"":parts.pop()||"";
    return {tokens:parts.map(convert),pending};
  }
  const attemptSettings=(settings,usedTiles)=>({...settings,buildInput:settings.activity==="build" && settings.support==="independent" && usedTiles?"tiles":settings.buildInput});
  globalThis.SENTENCE_COMPOSER={convert,split,attemptSettings};
})();

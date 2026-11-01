(() => {
  "use strict";
  const C=globalThis.SENTENCE_COURSE,E=globalThis.SENTENCE_ENGINE,S=globalThis.KANA_SPRINT_VOCABULARY_SPEAKING;
  const norm=S.normalize, lexicon=new Map();
  function add(surface,text,particle=false) {
    const key=norm(surface);if(key)lexicon.set(key,{text,raw:text,particle,typed:!particle});
  }
  // Course-wide spellings only: never supply the recognizer with the question's answer.
  for(const word of Object.values(C.words))for(const form of S.writtenForms(word))add(form,word.jp);
  for(const ex of E.verbs){add(ex.answer,ex.answer);add(ex.kanji,ex.answer);}
  const extra={映画:"えいが",音楽:"おんがく",公園:"こうえん",病院:"びょういん",椅子:"いす",机:"つくえ",写真:"しゃしん",花:"はな",子供:"こども",子ども:"こども",先週:"せんしゅう",毎日:"まいにち",日曜日:"にちようび",七時:"しちじ",九時:"くじ",上:"うえ",下:"した",中:"なか",前:"まえ",後ろ:"うしろ",隣:"となり",近く:"ちかく"};
  for(const [surface,text]of Object.entries(extra))add(surface,text);
  for(const ex of C.sentences)for(const piece of E.pieces(ex))if(!piece.role)add(piece.text,piece.text);
  for(const p of ["は","が","を","に","へ","で","の","と","も","か"])add(p,p,true);
  const forms=[...lexicon.keys()].sort((a,b)=>b.length-a.length);
  function tokens(transcript) {
    let rest=norm(transcript);const result=[];
    while(rest){
      const form=forms.find(x=>rest.startsWith(x));
      if(form){result.push({...lexicon.get(form)});rest=rest.slice(form.length);}
      else {result.push({text:rest[0],raw:rest[0],typed:true});rest=rest.slice(1);}
    }
    return result;
  }
  let session=null, stopUI=null;
  function cancel(){session?.cancel();session=null;stopUI?.();}
  function mount(container,onAdd,isAnswered) {
    cancel();
    container.insertAdjacentHTML("beforeend",`<div class="sp-voice"><button type="button" class="sp-secondary sp-voice-button" id="sentenceMic" aria-pressed="false"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"/></svg><span id="sentenceMicLabel">Speak</span><small>Beta</small></button><p id="sentenceVoiceStatus" role="status" aria-live="polite"></p><div id="sentenceVoiceReview" hidden><label for="sentenceVoiceDraft">Review what we heard</label><textarea id="sentenceVoiceDraft" lang="ja" rows="2" spellcheck="false"></textarea><button type="button" class="sp-secondary" id="sentenceVoiceAdd">Add to sentence</button><small>Edit recognition mistakes here, then add the draft. This app checks sentence structure, not pronunciation.</small></div></div>`);
    const q=id=>container.querySelector('#'+id), mic=q('sentenceMic'),status=q('sentenceVoiceStatus'),draft=q('sentenceVoiceDraft');
    const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
    mic.disabled=!Recognition;
    status.textContent=Recognition ? "Speak Japanese, review the draft, then check your answer. Your browser’s speech service may process the audio." : "Voice input is unavailable in this browser. You can still type or use tiles.";
    let busy=false,local=null;
    stopUI=()=>{const wasBusy=busy;busy=false;mic.setAttribute('aria-pressed','false');q('sentenceMicLabel').textContent='Speak';mic.disabled=!Recognition;draft.disabled=false;q("sentenceVoiceAdd").disabled=false;if(wasBusy&&!isAnswered())status.textContent='Recording stopped. Your draft is kept.';};
    mic.addEventListener('click',()=>{
      if(isAnswered())return;
      if(busy){local?.stop();return;}
      window.KANA_SPRINT_SPEECH?.stop();
      local=S.createSession(Recognition,snapshot=>{
        if(session!==local||isAnswered())return;
        busy=['starting','listening','processing'].includes(snapshot.status);
        mic.setAttribute('aria-pressed',String(busy));mic.disabled=snapshot.status==='processing';
        q('sentenceMicLabel').textContent=busy?'Stop':'Try again';
        draft.disabled=busy;q('sentenceVoiceAdd').disabled=busy;
        status.textContent=snapshot.status==='review'?'Review and edit what we heard. Nothing has been submitted.':snapshot.message;
        if(snapshot.status==='review'){draft.value=snapshot.text;q('sentenceVoiceReview').hidden=false;}
      });
      session=local;local.start();
    });
    q('sentenceVoiceAdd').addEventListener('click',()=>{
      if(busy||isAnswered()||!draft.value.trim())return;
      onAdd(tokens(draft.value));draft.value='';q('sentenceVoiceReview').hidden=true;
      status.textContent='Draft added. Review the tiles, then choose Check answer.';
    });
    document.addEventListener('visibilitychange',()=>{if(document.hidden&&session===local)cancel();},{signal:mountSignal()});
  }
  let lifecycle=null;
  function mountSignal(){lifecycle?.abort();lifecycle=new AbortController();return lifecycle.signal;}
  window.addEventListener('pagehide',cancel);
  globalThis.SENTENCE_VOICE={tokens,mount,cancel};
})();

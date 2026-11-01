(() => {
  "use strict";
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  // All rectangles use document coordinates; keep geometry separate from focus
  // and animation so each layout follows the same rules in every activity.
  function target({phase,card,feedback,model,scrollTop,height,documentHeight,padding=24}) {
    const room=height-padding*2;
    let top=scrollTop;
    if(card.bottom-card.top<=room){
      // Balance the space above and below a fully fitting card. Avoid tiny
      // adjustments only when the current position also preserves the padding.
      const center=(card.top+card.bottom-height)/2;
      const padded=card.top-scrollTop>=padding && card.bottom-scrollTop<=height-padding;
      top=padded && Math.abs(center-scrollTop)<=8?scrollTop:center;
    } else if(phase==="question") {
      top=card.top-padding;
    } else {
      top=card.bottom-height+padding;
      if(feedback && model){
        // Prefer bottom alignment, unless it would hide the result/model. Do
        // not land on the explanation footer before the learner sees the result.
        const first=feedback.top-padding,last=model.bottom-height+padding;
        top=last<=first?clamp(top,last,first):first;
      }
    }
    return clamp(top,0,Math.max(0,documentHeight-height));
  }
  let frame=0;
  function cancel() {
    if(frame)globalThis.cancelAnimationFrame(frame);
    frame=0;
  }
  function position(phase,focusTarget) {
    cancel();
    focusTarget?.focus({preventScroll:true});
    // Measure after the feedback/new question and its final controls are laid
    // out. A newer action cancels this request rather than scrolling twice.
    frame=globalThis.requestAnimationFrame(()=>{
      frame=globalThis.requestAnimationFrame(()=>{
        frame=0;
        if(document.querySelector("dialog[open]"))return;
        const card=document.querySelector("#questionCard");
        if(!card)return;
        const scrollTop=window.scrollY,height=window.innerHeight;
        const rect=element=>{
          if(!element)return undefined;
          const box=element.getBoundingClientRect();
          return {top:box.top+scrollTop,bottom:box.bottom+scrollTop};
        };
        const top=target({phase,card:rect(card),feedback:rect(card.querySelector("#answerFeedback")),model:rect(card.querySelector(".sp-model-answer")),scrollTop,height,documentHeight:document.documentElement.scrollHeight});
        if(Math.abs(top-scrollTop)<2)return;
        window.scrollTo({top,left:window.scrollX,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});
      });
    });
  }
  globalThis.SENTENCE_VIEWPORT={target,position,cancel};
})();

(() => {
  "use strict";
  function describe(selected, available, matchingPool, verbs=false) {
    const chosen=matchingPool(selected),wide=matchingPool(available);
    const mixed=exercise=>Boolean(exercise.requiredTopics);
    const rows=new Map(available.map(id=>{
      const standalone=matchingPool([id]).filter(x=>!mixed(x)).length;
      const combinations=matchingPool([...new Set([...selected,id])]).filter(x=>mixed(x)&&x.requiredTopics.includes(id)).length;
      let label,detail;
      if(verbs){label=standalone?`${standalone} exercises`:"No matches";detail="Matches the current filters.";}
      else if(standalone){label=`${standalone} standalone${combinations?` · ${combinations} mixed`:""}`;detail="Standalone exercises practise this topic on its own. Mixed exercises combine selected topics.";}
      else if(combinations){label="Mixed practice only";detail=`Contributes to ${combinations} mixed exercises with this selection; no standalone matches under the current filters.`;}
      else if(wide.some(x=>mixed(x)&&x.requiredTopics.includes(id))){label="Needs compatible topics";detail="Select this topic together with compatible topics to make mixed exercises available under the current filters.";}
      else {label="No matches with these filters";detail="No standalone or mixed exercises for this topic match the current difficulty, vocabulary, and review filters.";}
      return [id,{label,detail}];
    }));
    return {rows,total:chosen.length,standalone:chosen.filter(x=>!mixed(x)).length,mixed:chosen.filter(mixed).length};
  }
  globalThis.SENTENCE_SCOPE={describe};
})();

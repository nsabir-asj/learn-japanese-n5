(() => {
  "use strict";
  const esc=value=>String(value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  function presentation(activity,answered) {
    const guide=activity!=="verbs";
    return {guide,hint:!answered,initial:answered&&guide?"guide":"hint",tabs:guide&&!answered,
      label:guide?(answered?"Particle guide":"Hint & guide"):"Hint",hidden:!guide&&answered};
  }
  function buttonMarkup(activity,answered) {
    const view=presentation(activity,answered);
    const path=answered&&view.guide ? '<path d="M12 5v15M3 4.5C6 3.5 9 4 12 6c3-2 6-2.5 9-1.5V19c-3-1-6-.5-9 1-3-1.5-6-2-9-1V4.5Z"/>' : '<path d="M9 18h6m-5 3h4M8.5 14.5a6 6 0 1 1 7 0c-1 .7-1.5 1.5-1.5 3.5h-4c0-2-.5-2.8-1.5-3.5Z"/>';
    return `<svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${path}</svg><span>${view.label}</span>`;
  }
  const exampleMarkup=example=>`<div class="sp-guide-example">${example.context?`<small class="sp-guide-context">${esc(example.context)}</small>`:""}<p lang="ja">${example.jp.split("|").map((part,i)=>i%2?`<mark>${esc(part)}</mark>`:esc(part)).join("")}</p><p class="sp-guide-meaning">${esc(example.meaning)}</p></div>`;
  function guideMarkup() {
    const groups=globalThis.SENTENCE_PARTICLE_GUIDE.groups;
    return `<nav class="sp-guide-index" aria-label="Jump to a particle">${groups.map(group=>`<button type="button" data-guide-jump="${group.id}" aria-label="Jump to ${group.particle==="—"?"no particle":`${group.particle} (${group.reading})`}"><span lang="ja">${group.particle}</span></button>`).join("")}</nav><div class="sp-guide-scroll" id="guideScroller" tabindex="0" aria-label="Particle reference table"><p class="sp-guide-intro">Core beginner uses, with a separate row for each meaning. Choose a particle from the role of the phrase and the verb. Green highlights the focus; in the — rows it highlights time words used without a particle.</p><table class="sp-guide-table" role="table"><caption class="sp-sr-only">Particle guide: when to use each particle, sentence patterns, common distinctions, and translated examples.</caption><colgroup><col class="sp-guide-particle-col"><col class="sp-guide-rule-col"><col></colgroup><thead><tr><th scope="col">Particle</th><th scope="col">When to use it</th><th scope="col">Examples</th></tr></thead>${groups.map(group=>`<tbody id="guide-${group.id}">${group.uses.map((use,i)=>`<tr${i===0?' class="sp-guide-group-start"':""}><th scope="row"><span class="sp-guide-symbol" lang="ja">${esc(group.particle)}</span><span class="sp-guide-reading">${esc(group.reading)}</span></th><td><h3 tabindex="-1">${esc(use.title)}</h3><p>${esc(use.rule)}</p><p class="sp-guide-pattern"><span>Pattern</span>${esc(use.pattern)}</p><p class="sp-guide-note">${esc(use.note)}</p></td><td>${use.examples.map(exampleMarkup).join("")}</td></tr>`).join("")}</tbody>`).join("")}</table><p class="sp-guide-references">Further reading: <a href="https://www.irodori.jpf.go.jp/assets/data/Grammar_all.pdf" target="_blank" rel="noopener noreferrer">Japan Foundation · Irodori grammar</a> and <a href="https://www.tofugu.com/japanese-grammar/" target="_blank" rel="noopener noreferrer">Tofugu grammar reference</a>. These are beginner patterns, not every advanced use of each particle.</p></div>`;
  }
  globalThis.SENTENCE_HELP={presentation,buttonMarkup,guideMarkup};
})();

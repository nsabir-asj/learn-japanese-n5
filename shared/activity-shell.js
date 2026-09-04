(() => {
  "use strict";

  const activity = document.body.dataset.activity;
  const title = document.body.dataset.title || "Japanese practice";
  const description = document.body.dataset.description || "Focused Japanese practice.";
  document.body.classList.add("standalone-activity");
  document.body.innerHTML = `<div class="wrap">
    <header class="activity-header">
      <div><p class="activity-eyebrow">Japanese N5 Practice</p><h1>${title}</h1><p class="subtitle">${description}</p></div>
      <div class="header-actions"><a class="ghost header-link-button" href="./index.html">Home</a><a class="ghost header-link-button" href="./settings.html">Settings &amp; Data</a><span class="pill">Standalone · offline-ready · auto-saved</span></div>
    </header>
    <section class="activity-status" aria-label="Current activity status">
      <div><span>Current activity</span><strong>${title}</strong></div>
      <div class="activity-streak"><span id="activityStreakLabel">Current streak</span><strong id="activityStreak">0</strong></div>
    </section>
    <nav class="tabs activity-internal-tabs" aria-hidden="true"><div class="tab-group" data-nav-group="words"><div class="tab-group-tabs"></div></div></nav>
  </div>`;

  window.KANA_SPRINT_SYNC_RANGE = input => {
    if (!input) return;
    const update = () => {
      const min = Number(input.min) || 0;
      const max = Number(input.max) || 100;
      const value = Number(input.value) || min;
      input.style.setProperty("--range-fill", `${(value - min) / Math.max(1, max - min) * 100}%`);
    };
    input.addEventListener("input", update);
    update();
  };

  window.addEventListener("kana-sprint-streak-context", event => {
    const detail = event.detail || {};
    const streak = document.querySelector("#activityStreak");
    const label = document.querySelector("#activityStreakLabel");
    if (streak) streak.textContent = Number(detail.current) || 0;
    if (label) label.textContent = detail.label || `${activity} streak`;
  });
})();

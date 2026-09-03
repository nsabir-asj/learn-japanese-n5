(() => {
  "use strict";

  const $ = selector => document.querySelector(selector);
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const lessons = Object.values(window.GUIDED_LESSONS || {}).filter(lesson => lesson.available !== false).sort((a, b) => a.number - b.number);

  function savedState(lesson) {
    try {
      return JSON.parse(localStorage.getItem(lesson.storageKey)) || {};
    } catch (error) {
      console.warn(`Could not load Lesson ${lesson.number} progress.`, error);
      return {};
    }
  }

  function lessonProgress(lesson) {
    const state = savedState(lesson);
    const activities = lesson.stages.flatMap(stage => stage.activities);
    const graded = activities.filter(activity => activity.type !== "teach");
    const completed = activities.filter(activity => state.activities?.[activity.id]?.completed).length;
    const completedGraded = graded.filter(activity => state.activities?.[activity.id]?.completed);
    const mastery = completedGraded.length
      ? Math.round(completedGraded.reduce((sum, activity) => sum + (Number(state.activities?.[activity.id]?.mastery) || 0), 0) / completedGraded.length)
      : 0;
    const due = completedGraded.filter(activity => {
      const dueAt = Number(state.activities?.[activity.id]?.dueAt) || 0;
      return dueAt && dueAt <= Date.now();
    }).length;
    const completion = activities.length ? Math.round(completed / activities.length * 100) : 0;
    return { completion, mastery, due, started: completed > 0, complete: completion === 100 };
  }

  const progressByLesson = lessons.map(lesson => ({ lesson, progress: lessonProgress(lesson) }));
  $("#catalogAvailable").textContent = lessons.length;
  $("#catalogCompleted").textContent = progressByLesson.filter(item => item.progress.complete).length;
  $("#catalogDue").textContent = progressByLesson.reduce((sum, item) => sum + item.progress.due, 0);

  $("#lessonCatalog").innerHTML = progressByLesson.map(({ lesson, progress }) => {
    const action = progress.complete ? "Review lesson" : progress.started ? "Continue lesson" : "Start lesson";
    const status = progress.complete ? "Journey complete" : progress.started ? `${progress.completion}% complete` : "Not started";
    return `<article class="card lesson-catalog-card">
      <div class="lesson-catalog-card-top"><span class="lesson-catalog-number">Lesson ${lesson.number}</span><span class="data-badge">${status}</span></div>
      <div><h2>${escapeHtml(lesson.title)}</h2><p class="muted">${escapeHtml(lesson.subtitle)}</p></div>
      <div class="lesson-catalog-metrics">
        <div><strong>${progress.completion}%</strong><span>journey</span></div>
        <div><strong>${progress.mastery}%</strong><span>mastery</span></div>
        <div><strong>${progress.due}</strong><span>due</span></div>
      </div>
      <a class="big-button lesson-catalog-action" href="./guided_lesson.html?lesson=${encodeURIComponent(lesson.id)}">${action}</a>
    </article>`;
  }).join("");
})();

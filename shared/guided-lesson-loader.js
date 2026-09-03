(() => {
  "use strict";

  const requestedLesson = new URLSearchParams(window.location.search).get("lesson") || "1";
  const lessonNumber = Number(requestedLesson);
  if (!Number.isInteger(lessonNumber) || lessonNumber < 1 || lessonNumber > 99) {
    window.location.replace("./guided_lessons.html");
    return;
  }

  const version = "20260903-3";
  const lessonScript = document.createElement("script");
  lessonScript.src = `./lessons/guided/lesson-${String(lessonNumber).padStart(2, "0")}.js?v=${version}`;
  lessonScript.onload = () => {
    const playerScript = document.createElement("script");
    playerScript.src = `./shared/guided-lesson-player.js?v=${version}`;
    document.head.appendChild(playerScript);
  };
  lessonScript.onerror = () => window.location.replace("./guided_lessons.html");
  document.head.appendChild(lessonScript);
})();

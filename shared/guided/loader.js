(() => {
  "use strict";

  const requestedLesson = new URLSearchParams(window.location.search).get("lesson") || "1";
  const lessonNumber = Number(requestedLesson);
  if (!Number.isInteger(lessonNumber) || lessonNumber < 1 || lessonNumber > 99) {
    window.location.replace("../index.html#guided-lessons");
    return;
  }

  const version = "20260904-2";
  const lessonScript = document.createElement("script");
  lessonScript.src = `../lessons/guided/lesson-${String(lessonNumber).padStart(2, "0")}.js?v=${version}`;
  lessonScript.onload = () => {
    const playerScript = document.createElement("script");
    playerScript.src = `../shared/guided/player.js?v=${version}`;
    document.head.appendChild(playerScript);
  };
  lessonScript.onerror = () => window.location.replace("../index.html#guided-lessons");
  document.head.appendChild(lessonScript);
})();

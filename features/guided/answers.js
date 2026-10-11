(() => {
  "use strict";

  const normalize = value => String(value ?? "").normalize("NFKC").toLowerCase().trim()
    .replace(/[\s。、・,.!?！？:：'’_-]+/g, "").replace(/ō/g, "ou");

  function matches(activity, response) {
    const expected = activity.type === "tiles"
      ? [activity.answer.join(""), ...(activity.acceptedAnswers || [])]
      : activity.answers || [];
    const actual = normalize(response);
    return Boolean(actual) && expected.some(answer => normalize(answer) === actual);
  }

  function diagnose(activity, response, selectedTokens = []) {
    const exact = Object.entries(activity.mistakeAnswers || {})
      .find(([answer]) => normalize(answer) === normalize(response));
    if (exact) return exact[1];
    const wrongToken = selectedTokens.find(token => activity.distractorFeedback?.[token]);
    if (wrongToken) return activity.distractorFeedback[wrongToken];
    return "Compare your response with the model and check the verb ending, particles, and meaning.";
  }

  function hiraganaPreview(value) {
    const text = String(value ?? "").normalize("NFKC");
    if (!/[a-zāīūēō]/i.test(text)) return "";
    return text.replace(/[a-zāīūēō'’]+/gi, run => globalThis.KANA_SPRINT_VOCABULARY_SPEAKING.romajiToHiragana(run.replaceAll("’", "'")));
  }

  globalThis.GUIDED_ANSWERS = Object.freeze({ normalize, matches, diagnose, hiraganaPreview });
})();

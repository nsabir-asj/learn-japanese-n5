(() => {
  "use strict";

  // Each verb is learned with its group and both polite non-past forms.
  const VERBS = [
    { id: "taberu", group: "ru", dictionary: "たべる", meaning: "eat", affirmative: "たべます", negative: "たべません", stem: "たべ", wrongStem: "たべり", kanjiStem: "食べ", romajiStem: "tabe" },
    { id: "miru", group: "ru", dictionary: "みる", meaning: "see; watch", affirmative: "みます", negative: "みません", stem: "み", wrongStem: "みり", kanjiStem: "見", romajiStem: "mi" },
    { id: "okiru", group: "ru", dictionary: "おきる", meaning: "get up", affirmative: "おきます", negative: "おきません", stem: "おき", wrongStem: "おきり", kanjiStem: "起き", romajiStem: "oki" },
    { id: "neru", group: "ru", dictionary: "ねる", meaning: "sleep; go to bed", affirmative: "ねます", negative: "ねません", stem: "ね", wrongStem: "ねり", kanjiStem: "寝", romajiStem: "ne" },
    { id: "iku", group: "u", dictionary: "いく", meaning: "go", affirmative: "いきます", negative: "いきません", stem: "いき", wrongStem: "いく", kanjiStem: "行き", romajiStem: "iki" },
    { id: "kaeru", group: "u", dictionary: "かえる", meaning: "return", affirmative: "かえります", negative: "かえりません", stem: "かえり", wrongStem: "かえ", kanjiStem: "帰り", romajiStem: "kaeri" },
    { id: "kiku", group: "u", dictionary: "きく", meaning: "listen; hear", affirmative: "ききます", negative: "ききません", stem: "きき", wrongStem: "きく", kanjiStem: "聞き", romajiStem: "kiki" },
    { id: "nomu", group: "u", dictionary: "のむ", meaning: "drink", affirmative: "のみます", negative: "のみません", stem: "のみ", wrongStem: "のむ", kanjiStem: "飲み", romajiStem: "nomi" },
    { id: "hanasu", group: "u", dictionary: "はなす", meaning: "speak; talk", affirmative: "はなします", negative: "はなしません", stem: "はなし", wrongStem: "はなす", kanjiStem: "話し", romajiStem: "hanashi" },
    { id: "yomu", group: "u", dictionary: "よむ", meaning: "read", affirmative: "よみます", negative: "よみません", stem: "よみ", wrongStem: "よむ", kanjiStem: "読み", romajiStem: "yomi" },
    { id: "suru", group: "irregular", dictionary: "する", meaning: "do", affirmative: "します", negative: "しません", stem: "し", wrongStem: "すり", kanjiStem: "し", romajiStem: "shi" },
    { id: "benkyousuru", group: "irregular", dictionary: "べんきょうする", meaning: "study", affirmative: "べんきょうします", negative: "べんきょうしません", stem: "べんきょうし", wrongStem: "べんきょうすり", kanjiStem: "勉強し", romajiStem: "benkyoushi" },
    { id: "kuru", group: "irregular", dictionary: "くる", meaning: "come", affirmative: "きます", negative: "きません", stem: "き", wrongStem: "くり", kanjiStem: "来", romajiStem: "ki" }
  ];
  const VERB_EXAMPLES = {
    taberu: { affirmative: ["わたしは あさごはんを たべます。", "I eat breakfast."], negative: ["わたしは あさごはんを たべません。", "I do not eat breakfast."] },
    miru: { affirmative: ["わたしは にちようびに えいがを みます。", "I watch a movie on Sunday."], negative: ["わたしは にちようびに えいがを みません。", "I do not watch a movie on Sunday."] },
    okiru: { affirmative: ["わたしは まいあさ ろくじに おきます。", "I get up at six every morning."], negative: ["わたしは まいあさ ろくじに おきません。", "I do not get up at six every morning."] },
    neru: { affirmative: ["わたしは まいばん じゅういちじに ねます。", "I go to bed at eleven every night."], negative: ["わたしは まいばん じゅういちじに ねません。", "I do not go to bed at eleven every night."] },
    iku: { affirmative: ["わたしは にちようびに こうえんへ いきます。", "I go to the park on Sunday."], negative: ["わたしは にちようびに こうえんへ いきません。", "I do not go to the park on Sunday."] },
    kaeru: { affirmative: ["わたしは よる うちに かえります。", "I return home in the evening."], negative: ["わたしは よる うちに かえりません。", "I do not return home in the evening."] },
    kiku: { affirmative: ["わたしは まいにち おんがくを ききます。", "I listen to music every day."], negative: ["わたしは まいにち おんがくを ききません。", "I do not listen to music every day."] },
    nomu: { affirmative: ["わたしは ともだちと コーヒーを のみます。", "I drink coffee with a friend."], negative: ["わたしは ともだちと コーヒーを のみません。", "I do not drink coffee with a friend."] },
    hanasu: { affirmative: ["わたしは ともだちと にほんごを はなします。", "I speak Japanese with a friend."], negative: ["わたしは ともだちと にほんごを はなしません。", "I do not speak Japanese with a friend."] },
    yomu: { affirmative: ["わたしは まいにち ほんを よみます。", "I read a book every day."], negative: ["わたしは まいにち ほんを よみません。", "I do not read a book every day."] },
    suru: { affirmative: ["わたしは まいにち しゅくだいを します。", "I do homework every day."], negative: ["わたしは まいにち しゅくだいを しません。", "I do not do homework every day."] },
    benkyousuru: { affirmative: ["わたしは だいがくで にほんごを べんきょうします。", "I study Japanese at the university."], negative: ["わたしは だいがくで にほんごを べんきょうしません。", "I do not study Japanese at the university."] },
    kuru: { affirmative: ["ともだちは どようびに うちへ きます。", "My friend comes to my home on Saturday."], negative: ["ともだちは どようびに うちへ きません。", "My friend does not come to my home on Saturday."] }
  };
  // Explicit sentence notes avoid mistaking kana inside a word for a particle.
  const topic = (phrase = "わたしは", meaning = "me") => ["は (wa)", phrase, `Marks the topic: this sentence is about ${meaning}. Written は, pronounced wa.`];
  const object = (phrase, meaning) => ["を (o)", phrase, `Marks what the action acts on: ${meaning}. Written を, pronounced o; you may type wo in romaji.`];
  const time = (phrase, meaning) => ["に (ni)", phrase, `Marks when the action happens: ${meaning}. Use に with specific clock times and days of the week.`];
  const companion = ["と (to)", "ともだちと", "Marks who you do the action with: with a friend. Place と after the person."];
  const VERB_EXAMPLE_PARTICLES = {
    taberu: [topic(), object("あさごはんを", "breakfast is what I eat")],
    miru: [topic(), time("にちようびに", "on Sunday"), object("えいがを", "a movie is what I watch")],
    okiru: [topic(), time("ろくじに", "at six o’clock")],
    neru: [topic(), time("じゅういちじに", "at eleven o’clock")],
    iku: [topic(), time("にちようびに", "on Sunday"), ["へ (e)", "こうえんへ", "Marks the direction of movement: to the park. Written へ, pronounced e. With いく, destination に also works; time に cannot be replaced by へ."]],
    kaeru: [topic(), ["に (ni)", "うちに", "Marks the destination: home is where I return. With movement verbs such as かえる, に or へ can mark the destination; で marks where an activity happens."]],
    kiku: [topic(), object("おんがくを", "music is what I listen to")],
    nomu: [topic(), companion, object("コーヒーを", "coffee is what I drink")],
    hanasu: [topic(), companion, object("にほんごを", "Japanese is what I speak")],
    yomu: [topic(), object("ほんを", "a book is what I read")],
    suru: [topic(), object("しゅくだいを", "homework is what I do")],
    benkyousuru: [topic(), ["で (de)", "だいがくで", "Marks where the action happens: I study at the university. Use で for the place of an activity, and に or へ for a movement destination."], object("にほんごを", "Japanese is what I study")],
    kuru: [topic("ともだちは", "my friend"), time("どようびに", "on Saturday"), ["へ (e)", "うちへ", "Marks the direction of movement: to my home. Written へ, pronounced e. With くる, destination に also works."]]
  };
  const PRACTICE_FAMILIES = {};
  const PRACTICE_FAMILY_BY_ID = {};
  const PRACTICE_VARIANT_KEYS_BY_ID = {};
  const GUIDE_BREAKDOWNS = {};
  const GROUP_NAMES = { ru: "Ru-verbs", u: "U-verbs", irregular: "Irregular verbs" };

  const model = rows => `<div class="lesson-model">${rows.map(([label, text]) => `<div class="lesson-model-row"><span>${label}</span><strong>${text}</strong></div>`).join("")}</div>`;
  const dialogue = turns => `<div class="lesson-dialogue-card">${turns.map(([speaker, text]) => `<div><span>${speaker}</span><strong>${text}</strong></div>`).join("")}</div>`;
  const rule = text => `<div class="lesson-rule">${text}</div>`;
  const teach = (id, skill, title, instruction, body, extras = {}) => ({ id, type: "teach", skill, kicker: "Notice the pattern", title, instruction, body, ...extras });
  const choice = (id, skill, title, prompt, options, answer, explanation, extras = {}) => ({
    id, type: "choice", skill, kicker: "Choose from meaning", title, prompt, options, answer,
    correction: options[answer], explanation, ...extras
  });
  const sentence = (id, skill, title, prompt, tokens, distractorFeedback, explanation, extras = {}) => ({
    id, type: "tiles", skill, kicker: "Build and check the verb", title, prompt, tokens, answer: tokens,
    distractors: Object.keys(distractorFeedback), distractorFeedback, learnExtras: 3,
    correction: tokens.join(" "), explanation, audioText: tokens.join(""), audioRole: "feedback", ...extras
  });
  function register(family, ids, variants) {
    PRACTICE_FAMILIES[family] = variants.map((variant, index) => ({ ...variant, key: `${family}-${index}`, scenarioKey: `${family}-${index}` }));
    ids.forEach(id => {
      PRACTICE_FAMILY_BY_ID[id] = family;
      PRACTICE_VARIANT_KEYS_BY_ID[id] = PRACTICE_FAMILIES[family].map(variant => variant.key);
    });
  }

  function convert(verb, form) {
    const affirmative = form === "affirmative";
    const ending = affirmative ? "ます" : "ません";
    const opposite = affirmative ? verb.negative : verb.affirmative;
    const wrong = verb.wrongStem + ending;
    const explanation = verb.group === "ru"
      ? `Remove the final る: ${verb.dictionary} → ${verb.stem}. Add ${ending}.`
      : verb.group === "u"
        ? `Use the i-row stem ${verb.stem}, then add ${ending}.${verb.id === "kaeru" ? " かえる is a u-verb: keep the り in かえり." : ""}`
        : `Remember the irregular pair: ${verb.dictionary} → ${verb.affirmative} / ${verb.negative}.`;
    const activity = {
      id: `verb-${verb.id}-${form}`, type: "input", skill: "Conjugation", verbId: verb.id, form,
      verbDictionary: verb.dictionary, exampleForm: verb[form], example: VERB_EXAMPLES[verb.id][form],
      exampleParticles: VERB_EXAMPLE_PARTICLES[verb.id],
      checkpointGroup: `verbs-${form}`, kicker: `${GROUP_NAMES[verb.group]} · ${form}`,
      title: `${verb.dictionary} → ${affirmative ? "affirmative" : "negative"}`,
      context: `${verb.dictionary} · ${verb.meaning} · ${GROUP_NAMES[verb.group]}`,
      prompt: `Convert the dictionary verb to the polite present ${form}. Type the whole verb.`,
      answers: [verb[form], verb.kanjiStem + ending, verb.romajiStem + (affirmative ? "masu" : "masen")],
      correction: `${verb.dictionary} → ${verb[form]}`, explanation,
      audioText: verb[form], audioRole: "feedback", placeholder: "Kana or romaji",
      inputLabel: `Polite ${form} of ${verb.dictionary}`,
      inputHint: "Try saying the form first, then type it. Kana and romaji both work. Enter checks your answer.",
      breakdown: [[verb.stem, "stem"], [ending, `polite ${form} ending`]],
      mistakeAnswers: {
        [opposite]: `That is the ${affirmative ? "negative" : "affirmative"} form. This task asks for ${form}: use ${ending}.`,
        [verb.romajiStem + (affirmative ? "masen" : "masu")]: `The verb is right, but its ending gives the opposite meaning. Use ${ending}.`,
        [verb.kanjiStem + (affirmative ? "ません" : "ます")]: `The verb is right, but its ending gives the opposite meaning. Use ${ending}.`,
        [wrong]: explanation,
        [verb.dictionary]: "That is the dictionary form. Convert it to the requested polite form before submitting."
      }
    };
    const variants = [
      { ...activity, title: `Recall ${verb.dictionary}`, prompt: `Give the polite ${form} form of ${verb.dictionary} (${verb.meaning}).`, context: "Recall without a verb-group hint." },
      choice(`${activity.id}-repair`, "Conjugation", `Repair the form of ${verb.dictionary}`, `A learner wrote ${wrong}. Choose the correct polite ${form} form.`, [verb[form], opposite, wrong, verb.dictionary], 0, explanation, {
        type: "repair", audioText: verb[form], audioRole: "feedback",
        mistakes: { 1: `This is the opposite polarity. Use ${ending}.`, 2: explanation, 3: "The dictionary form has not been converted." }
      }),
      sentence(`${activity.id}-build`, "Conjugation", `Build the form of ${verb.dictionary}`, `Make the polite ${form} verb. Use only the stem and ending you need.`, [verb.stem, ending], {
        [verb.wrongStem]: explanation,
        [affirmative ? "ません" : "ます"]: `This ending gives the opposite meaning. Use ${ending}.`,
        "です": "Action verbs take ます or ません here; do not attach です."
      }, explanation)
    ];
    register(activity.id, [activity.id], variants);
    return activity;
  }

  function verbGuide(group, title, instruction, rows, note) {
    const id = `verbs-${group}-guide`;
    const verbs = VERBS.filter(verb => verb.group === group);
    const reference = `<details class="lesson-verb-reference"><summary>All ${GROUP_NAMES[group].toLowerCase()} in this lesson</summary><div class="lesson-verb-table" role="table" aria-label="Dictionary, affirmative, and negative forms"><div class="lesson-verb-table-row heading" role="row"><span>Dictionary</span><span>Affirmative</span><span>Negative</span></div>${verbs.map(verb => `<div class="lesson-verb-table-row" role="row"><span>${verb.dictionary}<small>${verb.meaning}</small></span><span>${verb.affirmative}</span><span>${verb.negative}</span></div>`).join("")}</div></details>`;
    return teach(id, "Conjugation", title, instruction, `<div class="lesson-verb-banner"><span>Verb workshop</span><strong>${GROUP_NAMES[group]}</strong><small>Dictionary → stem → ending</small></div>${model(rows)}${rule(note)}${reference}`);
  }

  const STAGES = [
    {
      id: "ru-verbs", title: "Change ru-verbs", short: "Verb workshop · たべる・みる・おきる・ねる",
      outcome: "Convert four ru-verbs into affirmative and negative forms without answer choices.",
      activities: [
        verbGuide("ru", "One stem, two endings", "Start with verbs you can use today. Read the pattern, then recall each whole verb in kana or romaji.", [
          ["Dictionary → stem", "たべる → たべ"], ["Affirmative · eat / will eat", "たべ + ます → たべます"], ["Negative · do not / will not eat", "たべ + ません → たべません"]
        ], "<strong>For a ru-verb:</strong> remove る, then add ます or ません. These polite non-past forms describe habits or future actions. They do not describe an action happening right now. Full vocabulary study is on the Lesson 3 vocabulary page."),
        ...VERBS.filter(verb => verb.group === "ru").flatMap(verb => [convert(verb, "affirmative"), convert(verb, "negative")])
      ]
    },
    {
      id: "u-verbs", title: "Change u-verbs", short: "Verb workshop · the i-row stem",
      outcome: "Change the final u-row sound to the i-row and handle かえる correctly.",
      activities: [
        verbGuide("u", "Change the last sound before the ending", "Keep the verb, change its final kana to the i-row, then choose an ending.", [
          ["む → み", "のむ → のみます / のみません"], ["く → き", "いく → いきます / いきません"], ["す → し", "はなす → はなします / はなしません"], ["る → り", "かえる → かえります / かえりません"]
        ], "<strong>Learn the group with the verb.</strong> A verb ending in る is not automatically a ru-verb. かえる (return) is a u-verb, so its stem is かえり. In this lesson, む → み, く → き, す → し, and る → り."),
        ...VERBS.filter(verb => verb.group === "u").flatMap(verb => [convert(verb, "affirmative"), convert(verb, "negative")]),
        choice("u-return-trap", "Conjugation", "Check the exception", "Why is かえます incorrect for かえる (return)?", ["かえる is a u-verb, so its stem is かえり.", "Every verb ending in る drops る.", "かえる is the same verb as くる.", "Return must always be negative."], 0, "The dictionary ending alone cannot tell you every verb's group. Remember かえる → かえります.", { checkpointGroup: "verbs-negative" })
      ]
    },
    {
      id: "irregular-verbs", title: "Change irregular verbs", short: "Verb workshop · する・くる・べんきょうする",
      outcome: "Recall both forms of する and くる, and transfer the する pattern to studying.",
      activities: [
        verbGuide("irregular", "Remember these useful pairs", "する changes to し; くる changes to き. A word ending in する follows the same する pattern.", [
          ["Do", "する → します / しません"], ["Study", "べんきょうする → べんきょうします / べんきょうしません"], ["Come", "くる → きます / きません"]
        ], "<strong>Recall the pair together:</strong> dictionary form plus polite form. After these three workshop stages, use Practice → Verb conversion for short mixed rounds."),
        ...VERBS.filter(verb => verb.group === "irregular").flatMap(verb => [convert(verb, "affirmative"), convert(verb, "negative")])
      ]
    },
    {
      id: "actions", title: "Build action sentences", short: "Object を + the right verb form",
      outcome: "Choose the action, its positive or negative meaning, and the object particle.",
      activities: [
        teach("actions-guide", "Particles", "Give the verb something to act on", "を marks what you eat, drink, read, watch, or listen to. It is pronounced o.", model([
          ["Drink coffee", "コーヒーを のみます。"], ["Do not watch TV", "テレビを みません。"], ["Study Japanese", "にほんごを べんきょうします。"]
        ]) + rule("<strong>Finish with the verb.</strong> A useful starting order is topic → time → place → object → verb. Keep each noun with its particle. Word order before the verb can vary.")),
        sentence("action-coffee", "Production", "Drink coffee", "Build: ‘I drink coffee.’ のむ = drink.", ["コーヒーを", "のみます。"], { "のむます。": "For のむ, use the i-row stem のみ before ます.", "のみません。": "This says you do not drink it. The task is affirmative.", "たべます。": "たべます means eat. Use のみます for drinking." }, "を marks the drink; のむ becomes のみます."),
        sentence("action-tv-negative", "Production", "Choose the negative", "Build: ‘I do not watch TV.’ みる = watch.", ["テレビを", "みません。"], { "みます。": "This is affirmative. The task says do not watch.", "みりません。": "みる is a ru-verb: remove る, then add ません.", "ききません。": "ききません means do not listen. The task asks about watching." }, "Use the negative form of みる: みません."),
        sentence("action-music", "Production", "Listen to music", "Build: ‘I listen to music.’ おんがく = music; きく = listen.", ["おんがくを", "ききます。"], { "きくます。": "きく changes to the i-row stem きき.", "ききません。": "This denies the action; the task is affirmative.", "よみます。": "よみます means read; use ききます for music." }, "Music is the object of listening, so use を and ききます."),
        sentence("action-japanese", "Production", "Speak Japanese", "Build: ‘I speak Japanese.’ はなす = speak.", ["にほんごを", "はなします。"], { "はなすます。": "す changes to し before ます.", "はなしません。": "This says you do not speak it.", "よみます。": "This says read. The task asks you to speak." }, "The language can be marked with を. はなす becomes はなします."),
        choice("action-verb-negative", "Grammar", "Keep noun and verb negatives separate", "Say: ‘I do not study.’ Choose the action-verb negative.", ["べんきょうしません。", "べんきょうしますじゃないです。", "べんきょうするます。", "べんきょうします。"], 0, "Use the verb's ません ending. The noun-negation pattern from Lesson 2 does not attach after ます.", { type: "repair", audioText: "べんきょうしません。", audioRole: "feedback" }),
        choice("action-flexible-order", "Grammar", "Keep the particles attached", "Which statement about Japanese sentence order is correct?", ["Time and place can change order; keep particles with their nouns and the verb at the end.", "Only one order of time and place is ever grammatical.", "Put the verb first in every sentence.", "Particles may be attached to any word without changing meaning."], 0, "The lesson models a convenient order, while accepting other valid arrangements.")
      ]
    },
    {
      id: "places", title: "Go somewhere, do something", short: "Activity で · destination に／へ",
      outcome: "Distinguish a destination from the place of an activity and choose go or come from the speaker's viewpoint.",
      activities: [
        teach("places-guide", "Particles", "Ask what the place is doing", "Use an arrow for a destination and an activity inside the place for で.", `<div class="lesson-particle-scene"><div><span>Move to the library</span><strong>としょかんに → いきます</strong><small>Destination · に or へ</small></div><div><span>Read inside the library</span><strong>としょかんで 📖 よみます</strong><small>Activity location · で</small></div></div>${model([["Go to school", "がっこうに いきます。"], ["Study at school", "がっこうで にほんごを べんきょうします。"], ["Return home", "うちに かえります。"]])}${rule("<strong>に and へ:</strong> both can mark the destination of いく, くる, and かえる. Destination へ is pronounced e. Time に cannot be replaced by へ.")}`),
        sentence("place-school", "Particles", "Go to school", "Build with に: ‘I go to school.’ がっこう = school.", ["がっこうに", "いきます。"], { "がっこうで": "で marks where an activity occurs; school is the destination of going here.", "いくます。": "いく changes to いきます.", "いきません。": "This says you do not go." }, "A movement destination takes に or へ.", { acceptedAnswers: ["がっこうへいきます。"] }),
        sentence("place-library", "Particles", "Read at the library", "Build: ‘I read a book at the library.’ としょかん = library; ほん = book.", ["としょかんで", "ほんを", "よみます。"], { "としょかんに": "Reading happens at the library. Use activity-location で.", "よむます。": "よむ changes to よみます.", "よみません。": "This says you do not read." }, "Use で for where you read, and を for what you read.", { acceptedAnswers: ["ほんをとしょかんでよみます。"] }),
        sentence("place-home-negative", "Production", "Stay out today", "Build: ‘I will not return home today.’ きょう = today; かえる = return.", ["きょう", "うちに", "かえりません。"], { "かえません。": "かえる is a u-verb: its stem is かえり.", "かえります。": "This says you will return. The task is negative.", "うちで": "Home is the destination of returning, so use に or へ." }, "きょう marks a future plan in context; use the negative かえりません.", { acceptedAnswers: ["うちにきょうかえりません。", "きょううちへかえりません。", "うちへきょうかえりません。"] }),
        choice("place-he", "Particles", "Recognise another destination marker", "Which can also mean ‘I go to school’ with the movement verb いく?", ["がっこうへ いきます。", "がっこうを いきます。", "がっこうで いきます。", "がっこうの いきます。"], 0, "へ is another destination marker with these movement verbs. It is pronounced e.", { audioText: "がっこうへいきます。", audioRole: "feedback" }),
        choice("place-viewpoint", "Conversation", "Choose go from your position", "You are at home. Your friend is at a cafe. Tell your friend you will travel to the cafe.", ["カフェに いきます。", "カフェに きます。", "カフェで かえります。", "カフェを みます。"], 0, "Japanese くる describes movement toward the speaker's location. You are away from the cafe, so say いきます even if English uses ‘I'm coming.’", { audioText: "カフェにいきます。", audioRole: "feedback" }),
        choice("place-come", "Conversation", "Choose come toward the speaker", "You are at home. Ren will travel to your home tomorrow. Which sentence fits your viewpoint?", ["レンさんは あした うちに きます。", "レンさんは あした うちに かえません。", "レンさんは あした うちで いきます。", "レンさんは あした うちに くります。"], 0, "くる becomes きます, and the motion is toward the speaker's location.", { audioText: "レンさんはあしたうちにきます。", audioRole: "feedback" })
      ]
    },
    {
      id: "time", title: "Build a daily schedule", short: "Exact に · relative time · ごろ",
      outcome: "Add days and clock times, omit に after relative time words, and understand approximate times.",
      activities: [
        teach("time-guide", "Time", "Put a time on the action", "Read the schedule, then change the time or verb yourself.", `<div class="lesson-day-timeline"><div><span>07:00</span><strong>おきます</strong><small>get up</small></div><div><span>08:00</span><strong>がっこうに いきます</strong><small>go to school</small></div><div><span>21:00 ごろ</span><strong>うちに かえります</strong><small>return about nine</small></div></div>${model([["Exact time", "しちじに おきます。"], ["Named day", "にちようびに テニスを します。"], ["Relative time", "あした がっこうに いきます。"], ["Approximate time", "くじごろ うちに かえります。"]])}${rule("<strong>Time に:</strong> use it with clock times and named days. Do not add it after きょう, あした, まいにち, まいばん, or いつ. ごろ and ごろに both work for approximate clock times. 朝 and 週末 often omit に but can take it.")}`),
        sentence("time-wake", "Time", "Get up at seven", "Build: ‘I get up at seven.’ しちじ = seven o'clock; おきる = get up.", ["しちじに", "おきます。"], { "おきります。": "おきる is a ru-verb; remove る to get the stem おき, then add ます.", "おきません。": "This says you do not get up at seven.", "ねます。": "ねます means go to bed. The task asks you to get up." }, "Exact clock time takes に. おきる becomes おきます."),
        sentence("time-tomorrow", "Time", "Plan tomorrow", "Build: ‘I will study tomorrow.’ あした = tomorrow.", ["あした", "べんきょうします。"], { "あしたに": "Relative time あした does not take に in this pattern.", "べんきょうしません。": "This says you will not study.", "べんきょうすります。": "する changes to します, not すります." }, "あした supplies future meaning; the verb still uses the same non-past form."),
        sentence("time-sunday", "Time", "Choose a named day", "Build: ‘I play tennis on Sunday.’ にちようび = Sunday.", ["にちようびに", "テニスを", "します。"], { "にちようびへ": "へ can mark movement destinations, but it cannot replace time に.", "すります。": "する is irregular: use します.", "しません。": "This is negative; the task is affirmative." }, "A named day takes に; テニスをします means play tennis.", { acceptedAnswers: ["テニスをにちようびにします。"] }),
        sentence("time-around", "Time", "Return about nine", "Build: ‘I will return home at about nine.’ くじごろ = about nine o'clock.", ["くじごろ", "うちに", "かえります。"], { "かえます。": "Keep the u-verb stem かえり.", "かえりません。": "This says you will not return.", "うちで": "Home is the destination, so use に or へ." }, "ごろ makes the clock time approximate; ごろに is also valid.", { acceptedAnswers: ["うちにくじごろかえります。", "くじごろにうちにかえります。", "うちにくじごろにかえります。", "くじごろうちへかえります。", "うちへくじごろかえります。"] }),
        choice("time-when", "Time", "Ask when", "Choose the normal Lesson 3 question: ‘When will you go?’", ["いつ いきますか。", "いつに いきますか。", "いつへ いきますか。", "いつで いきますか。"], 0, "いつ asks when and normally stands without に in this pattern.", { audioText: "いついきますか。", audioRole: "feedback" }),
        choice("time-optional", "Time", "Leave room for valid variation", "Which statement about あさ (morning) and しゅうまつ (weekend) is accurate?", ["They often omit に, but に can appear depending on emphasis or style.", "に is always required after both words.", "に is always forbidden after both words.", "They always use へ instead of に."], 0, "These expressions allow variation. Relative words such as あした and まいにち follow a different rule."),
        { id: "time-hear-return", type: "input", skill: "Listening", kicker: "Listen to the schedule", title: "When will Ren return?", prompt: "Listen and enter the approximate return time as digits, for example 8:00.", answers: ["9", "9:00", "21", "21:00"], correction: "About 9:00 · くじごろ", explanation: "くじ is nine o'clock; ごろ means about. The audio does not specify a.m. or p.m.", audioText: "くじごろうちにかえります。", placeholder: "Time in digits" }
      ]
    },
    {
      id: "habits", title: "Describe habits and plans", short: "Frequency + affirmative or negative",
      outcome: "Pair frequency words with the correct polarity and distinguish habits from future plans through context.",
      activities: [
        teach("habits-guide", "Habits", "Say how often, then check the ending", "The frequency expression changes how we understand the action.", `<div class="lesson-frequency-board"><div><span>Affirmative patterns</span><strong>まいにち · たいてい · よく · ときどき</strong><p>every day · usually · often · sometimes</p></div><div><span>Negative patterns</span><strong>あまり … ません<br>ぜんぜん … ません</strong><p>not much / not often · not at all</p></div></div>${model([["Often", "よく コーヒーを のみます。"], ["Not much", "あまり コーヒーを のみません。"], ["Not at all", "ぜんぜん テレビを みません。"], ["Tomorrow's plan", "あした テレビを みます。"]])}${rule("<strong>Same form, different context:</strong> みます can mean ‘watch’ as a habit or ‘will watch’ as a plan. あまり and ぜんぜん take a negative ending in the patterns taught here.")}`),
        sentence("habit-everyday", "Habits", "Study every day", "Build: ‘I study Japanese every day.’ まいにち = every day.", ["まいにち", "にほんごを", "べんきょうします。"], { "まいにちに": "Regular-interval まいにち stands without に.", "べんきょうしません。": "This says you do not study.", "べんきょうすります。": "べんきょうする follows する → します." }, "まいにち makes this a habitual action.", { acceptedAnswers: ["にほんごをまいにちべんきょうします。"] }),
        sentence("habit-notmuch", "Habits", "Use a negative frequency pattern", "Build: ‘I do not drink coffee much.’ あまり = not much, with a negative verb.", ["あまり", "コーヒーを", "のみません。"], { "のみます。": "あまり needs a negative ending in this pattern.", "のむません。": "Use the i-row stem のみ before ません.", "たべません。": "Coffee is drunk. たべません means do not eat." }, "あまり describes low frequency or amount and pairs with のみません.", { acceptedAnswers: ["コーヒーをあまりのみません。"] }),
        sentence("habit-never", "Habits", "Say not at all", "Build: ‘I do not watch TV at all.’ ぜんぜん = not at all, with a negative verb.", ["ぜんぜん", "テレビを", "みません。"], { "みます。": "Use negative みません after ぜんぜん here.", "みりません。": "みる is a ru-verb, so remove る.", "よみません。": "よみません means do not read; use みません for watching." }, "ぜんぜん gives stronger negative frequency than あまり.", { acceptedAnswers: ["テレビをぜんぜんみません。"] }),
        choice("habit-nonpast", "Habits", "Use context to interpret ます", "あした カフェで べんきょうします。 What does the speaker mean?", ["I will study at a cafe tomorrow.", "I studied at a cafe yesterday.", "I am studying at a cafe right now.", "I never study at a cafe."], 0, "あした signals a future plan. Lesson 3 action verbs in ます express habits or future actions, rather than ongoing actions."),
        choice("habit-usually", "Habits", "Choose usually", "Complete: ‘I usually eat breakfast.’ ___ あさごはんを たべます。", ["たいてい", "あまり", "ぜんぜん", "いつ"], 0, "たいてい means usually. あまり and ぜんぜん need a negative ending in these lesson patterns.", { audioText: "たいていあさごはんをたべます。", audioRole: "feedback" }),
        choice("habit-listen", "Listening", "Hear the two habits", "What does Aoi say about studying and watching TV?", ["She studies every day and sometimes watches TV.", "She never studies and watches TV every day.", "She will study tomorrow and never watches TV.", "She only watches TV on Sunday."], 0, "まいにち means every day; ときどき means sometimes.", { listenOnly: true, audioText: "まいにちべんきょうします。でも、ときどきテレビをみます。" })
      ]
    },
    {
      id: "invitations", title: "Invite, reply, and adjust", short: "ませんか · いいですね · ちょっと · どうですか",
      outcome: "Make an invitation, accept or decline gently, and offer another day or activity.",
      activities: [
        teach("invite-guide", "Conversation", "A negative question can be an invitation", "Use the polite negative form plus か to propose an activity together.", `<div class="lesson-contrast-board"><div><span>Ask about a habit or plan</span><strong>えいがを みますか。</strong><small>Do you / will you watch a movie?</small></div><div><span>Invite someone</span><strong>えいがを みませんか。</strong><small>Would you like to watch a movie together?</small></div></div>${dialogue([["You", "どようびに テニスを しませんか。"], ["Aoi", "どようびは ちょっと…。"], ["You", "じゃあ、にちようびは どうですか。"], ["Aoi", "いいですね。"]])}${rule("<strong>Three different jobs:</strong> みません denies watching; みませんか invites someone to watch; みますか asks a question about watching. ～はちょっと… can gently decline in context, even though ちょっと literally means a little.")}`),
        sentence("invite-coffee", "Conversation", "Invite someone for coffee", "Build an invitation: ‘Would you like to drink coffee together?’", ["コーヒーを", "のみませんか。"], { "のみますか。": "This asks about drinking; use ませんか for the invitation.", "のみません。": "Without か, this simply denies the action.", "のむませんか。": "のむ changes to のみ before ませんか." }, "Start from のみません and add か to make an invitation."),
        sentence("invite-saturday", "Conversation", "Include a day", "Invite a friend: ‘Would you like to watch a movie on Saturday?’ どようび = Saturday; えいが = movie.", ["どようびに", "えいがを", "みませんか。"], { "みますか。": "Use ませんか to invite the friend.", "みりませんか。": "みる is a ru-verb: use みませんか.", "みません。": "This denies watching rather than inviting." }, "Use time に, object を, and the invitation ending ませんか.", { acceptedAnswers: ["えいがをどようびにみませんか。"] }),
        choice("invite-accept", "Conversation", "Accept the invitation", "A friend suggests coffee together, and you want to accept.", ["いいですね。", "どようびは ちょっと…。", "のみません。", "だれのですか。"], 0, "いいですね expresses positive agreement with the suggestion.", { audioText: "いいですね。", audioRole: "feedback" }),
        choice("invite-decline", "Conversation", "Read a gentle refusal", "You suggest Saturday. Your friend replies: どようびは ちょっと…。 What do they mean here?", ["Saturday does not work well for them.", "They want just a little Saturday.", "They enthusiastically accept Saturday.", "They do not understand the word Saturday."], 0, "In an invitation reply, ～はちょっと… leaves the difficulty unstated and gently declines."),
        sentence("invite-alternative", "Conversation", "Offer another day", "Saturday does not work. Build: ‘Then, how about Sunday?’", ["じゃあ、", "にちようびは", "どうですか。"], { "どこですか。": "どこ asks where; use どうですか to ask how the alternative sounds.", "にちようびを": "Here Sunday is the topic being offered, so use は.", "しません。": "This denies doing something and does not offer the alternative." }, "～はどうですか offers an alternative topic."),
        choice("invite-listen", "Listening", "Follow the changed plan", "Which day do the two people agree on?", ["Sunday", "Saturday", "Every day", "They do not agree on any day"], 0, "The first proposal is gently refused. The Sunday alternative receives いいですね.", { listenOnly: true, audioText: "どようびにテニスをしませんか。どようびはちょっと。じゃあ、にちようびはどうですか。いいですね。" }),
        choice("invite-question", "Grammar", "Distinguish the endings", "Which sentence is the invitation to study together?", ["いっしょに べんきょうしませんか。", "べんきょうしません。", "べんきょうしますか。", "べんきょうするませんか。"], 0, "いっしょに means together; しませんか is the invitation form of する.", { audioText: "いっしょにべんきょうしませんか。", audioRole: "feedback" })
      ]
    },
    {
      id: "natural", title: "Explain your day naturally", short: "Topic は · short replies · leaving home",
      outcome: "Understand topic-led questions and explain a plan with short, natural replies.",
      activities: [
        teach("natural-guide", "Conversation", "The topic can be a time or a meal", "は marks what the conversation is about. A short question can leave repeated words understood.", dialogue([["Host", "きょうは なにを しますか。"], ["You", "カフェで べんきょうします。"], ["Host", "なんじごろ かえりますか。"], ["You", "くじごろです。"], ["Host", "ばんごはんは？"], ["You", "たべません。"]]) + model([["About today", "きょうは なにを しますか。"], ["About dinner", "ばんごはんは？ → たべません。"]]) + rule("<strong>Topic is not always the subject.</strong> 今日は opens a topic about today; 晩ご飯は？ asks for a comment about dinner. そうですね can mean ‘let me see’ while thinking; そうですか acknowledges new information.")),
        choice("natural-dinner", "Conversation", "Answer the understood question", "The host asks ばんごはんは？ You will not eat dinner at home. Choose a short reply using たべる.", ["たべません。", "たべりません。", "ばんごはんです。", "たべますじゃないです。"], 0, "Dinner is already understood from the topic. たべません supplies the negative action.", { audioText: "たべません。", audioRole: "feedback" }),
        choice("natural-topic", "Grammar", "Understand a time topic", "In きょうは カフェに いきます, what does は do?", ["It makes today the topic: as for today, I will go to a cafe.", "It makes today the person doing the action.", "It changes the verb into past tense.", "It turns the cafe into the object of eating."], 0, "は introduces the topic even when that topic is a time expression."),
        choice("natural-think", "Conversation", "Take a moment to think", "Someone asks what you usually do on weekends. You pause thoughtfully before answering.", ["そうですね…。", "そうです。", "いってらっしゃい。", "いらっしゃいませ。"], 0, "そうですね can give you a thoughtful ‘let me see’ moment, as well as express agreement.", { audioText: "そうですね。", audioRole: "feedback" }),
        choice("natural-leave", "Conversation", "Leave and expect to return", "You are leaving home for your planned day out. Which phrase do you say?", ["いってきます。", "いってらっしゃい。", "ただいま。", "おかえりなさい。"], 0, "The person leaving says いってきます; the person staying responds いってらっしゃい.", { audioText: "いってきます。", audioRole: "feedback" }),
        choice("natural-ee", "Conversation", "Use a conversational yes", "Which statement about はい and ええ matches this lesson?", ["Both can answer yes; ええ is conversational, while はい also answers when your name is called.", "ええ replaces はい in every situation.", "ええ always means no.", "はい is only used when leaving home."], 0, "ええ is a relaxed conversational yes. Respond to a roll call with はい."),
        teach("natural-home-note", "Culture", "A small note about Japanese homes", "Connect the host-family scene to the lesson's culture note.", rule("<strong>At the entrance:</strong> the げんかん is the area where shoes are removed. In many homes, wash before entering the shared bathwater. These details support the home scene; they are not extra vocabulary drills."))
      ]
    },
    {
      id: "mission", title: "Make the weekend plan", short: "Listen · build · invite · adjust",
      outcome: "Use unfamiliar examples to arrange an activity and explain the plan without memorising a script.",
      activities: [
        teach("weekend-mission-guide", "Conversation", "Arrange a day with Ren", "Ren is a new friend. Find out a habit, suggest studying together, handle an unavailable day, and explain your return time.", `<div class="lesson-mission-plan"><div><span>1</span><strong>Understand a habit</strong></div><div><span>2</span><strong>Invite and adjust</strong></div><div><span>3</span><strong>Explain your day</strong></div></div>${rule("<strong>Recall before using the tiles.</strong> New activities, days, and places test whether you can transfer the patterns. You can say your answer aloud; the app scores the answer you build or type.")}`),
        choice("mission-habit", "Listening", "Understand Ren's routine", "What does Ren tell you?", ["Ren reads books often and does not watch TV much.", "Ren watches TV often and never reads.", "Ren will read at nine tomorrow.", "Ren never reads or watches TV."], 0, "よく marks frequent reading; あまり and みません describe infrequent TV watching.", { listenOnly: true, audioText: "よくほんをよみます。テレビはあまりみません。" }),
        sentence("mission-invite", "Conversation", "Invite Ren to study", "Build: ‘Would you like to study at the library on Saturday?’", ["どようびに", "としょかんで", "べんきょうしませんか。"], { "としょかんに": "The library is where studying happens, so use で.", "べんきょうしますか。": "Use ませんか for the invitation.", "べんきょうすりませんか。": "する changes to し before ませんか." }, "Combine named-day に, activity-place で, and the invitation ending.", { acceptedAnswers: ["としょかんでどようびにべんきょうしませんか。"] }),
        choice("mission-refusal", "Conversation", "Handle a refusal", "Ren says: どようびは ちょっと…。 Sunday is another possibility. What is a useful next response?", ["じゃあ、にちようびは どうですか。", "いいですね。どようびです。", "どようびを ください。", "べんきょうしません。"], 0, "Acknowledge that Saturday does not work and offer Sunday as the alternative.", { audioText: "じゃあ、にちようびはどうですか。", audioRole: "feedback" }),
        sentence("mission-plan", "Production", "Explain the agreed plan", "Ren accepts Sunday. Build: ‘I will study at the library on Sunday.’", ["にちようびに", "としょかんで", "べんきょうします。"], { "べんきょうしません。": "The agreed plan is affirmative.", "としょかんに": "Use で for the activity's location.", "べんきょうすります。": "する becomes します." }, "This sentence states the plan, so use ます rather than the invitation ending.", { acceptedAnswers: ["としょかんでにちようびにべんきょうします。"] }),
        sentence("mission-return", "Production", "Give your return time", "Build: ‘I will return home at about seven.’ しちじごろ = about seven.", ["しちじごろ", "うちに", "かえります。"], { "かえます。": "かえる is a u-verb; use かえります.", "かえりません。": "This denies returning.", "うちで": "Home is the destination of returning." }, "Use approximate time ごろ and the u-verb かえります.", { acceptedAnswers: ["うちにしちじごろかえります。", "しちじごろにうちにかえります。", "うちにしちじごろにかえります。", "しちじごろうちへかえります。", "うちへしちじごろかえります。"] }),
        { ...convert(VERBS.find(verb => verb.id === "okiru"), "negative"), id: "mission-convert", title: "One final verb check", context: "おきる · get up. Recall without a group hint.", prompt: "Convert おきる to the polite present negative.", checkpointGroup: "verbs-negative" },
        choice("mission-leave", "Conversation", "Close the home exchange", "You say いってきます. What is the host's natural response?", ["いってらっしゃい。", "ただいま。", "いただきます。", "いってきます。"], 0, "The person staying welcomes the departure with いってらっしゃい.", { audioText: "いってらっしゃい。", audioRole: "feedback" })
      ]
    }
  ];

  // Review families use only patterns available when their source stage is learned.
  const reviewFamilies = [
    ["objects", ["action-coffee", "action-tv-negative", "action-music", "action-japanese"], [
      sentence("review-water", "Production", "Drink water", "Build: ‘I drink water.’ みず = water.", ["みずを", "のみます。"], { "のみません。": "The task is affirmative.", "のむます。": "Use stem のみ.", "たべます。": "Water is drunk, so use のみます." }, "Change the object while keeping を and the affirmative verb."),
      sentence("review-book", "Production", "Do not read the book", "Build: ‘I do not read the book.’ ほん = book; よむ = read.", ["ほんを", "よみません。"], { "よみます。": "The task is negative.", "よむません。": "Use stem よみ.", "みません。": "This task asks for reading, not watching." }, "Choose the negative of よむ."),
      sentence("review-study", "Production", "Study Japanese", "Build: ‘I study Japanese.’", ["にほんごを", "べんきょうします。"], { "べんきょうしません。": "The task is affirmative.", "べんきょうすります。": "Use する → します.", "はなします。": "The task asks for studying, not speaking." }, "べんきょうする follows the irregular する pattern.")
    ]],
    ["places", ["place-school", "place-library", "place-home-negative", "place-he"], [
      sentence("review-cafe", "Particles", "Drink at the cafe", "Build: ‘I drink coffee at a cafe.’", ["カフェで", "コーヒーを", "のみます。"], { "カフェに": "Use で where drinking happens.", "のみません。": "The task is affirmative.", "のむます。": "Use stem のみ." }, "Keep the activity location with で.", { acceptedAnswers: ["コーヒーをカフェでのみます。"] }),
      sentence("review-return", "Particles", "Return home", "Build: ‘I return home.’ Use に for the destination.", ["うちに", "かえります。"], { "うちで": "Use に or へ for this destination.", "かえます。": "かえる is a u-verb.", "かえりません。": "The task is affirmative." }, "Keep the stem かえり.", { acceptedAnswers: ["うちへかえります。"] })
    ]],
    ["time", ["time-wake", "time-tomorrow", "time-sunday", "time-around", "time-when", "time-hear-return"], [
      sentence("review-bed", "Time", "Go to bed at eleven", "Build: ‘I go to bed at eleven.’ じゅういちじ = eleven; ねる = go to bed.", ["じゅういちじに", "ねます。"], { "ねります。": "ねる is a ru-verb: remove る to get the stem ね.", "ねません。": "The task is affirmative.", "おきます。": "The task asks for going to bed, not getting up." }, "Use time に and the ru-verb ねます."),
      sentence("review-today", "Time", "Do not go today", "Build: ‘I will not go to school today.’", ["きょう", "がっこうに", "いきません。"], { "きょうに": "Relative time きょう stands without に.", "いきます。": "The task is negative.", "いくません。": "Use stem いき." }, "The relative time and destination follow different particle rules.", { acceptedAnswers: ["がっこうにきょういきません。", "きょうがっこうへいきません。", "がっこうへきょういきません。"] }),
      { id: "review-time-listen", type: "input", skill: "Listening", title: "Hear a new wake-up time", prompt: "Listen and enter the wake-up time in digits.", answers: ["6", "6:00", "06:00"], correction: "6:00 · ろくじ", explanation: "ろくじ means six o'clock. Listen for おきます, get up.", audioText: "ろくじにおきます。", audioRole: "prompt", placeholder: "Time in digits" }
    ]],
    ["habits", ["habit-everyday", "habit-notmuch", "habit-never", "habit-nonpast", "habit-usually", "habit-listen"], [
      sentence("review-tea", "Habits", "Do not drink tea much", "Build: ‘I do not drink tea much.’ おちゃ = tea.", ["あまり", "おちゃを", "のみません。"], { "のみます。": "あまり takes a negative ending here.", "のむません。": "Use stem のみ.", "よみません。": "Tea is drunk, not read." }, "Pair あまり with a negative form.", { acceptedAnswers: ["おちゃをあまりのみません。"] }),
      sentence("review-sometimes", "Habits", "Watch movies sometimes", "Build: ‘I sometimes watch movies.’ ときどき = sometimes.", ["ときどき", "えいがを", "みます。"], { "みません。": "The task is affirmative.", "みります。": "みる is a ru-verb.", "よみます。": "The task asks for watching, not reading." }, "ときどき describes a habitual action.", { acceptedAnswers: ["えいがをときどきみます。"] }),
      choice("review-future", "Habits", "Recognise a future plan", "あした テニスを します。 What does it mean?", ["I will play tennis tomorrow.", "I am playing tennis right now.", "I played tennis yesterday.", "I never play tennis."], 0, "The time word gives the non-past verb its future meaning.")
    ]],
    ["invitations", ["invite-coffee", "invite-saturday", "invite-accept", "invite-decline", "invite-alternative", "invite-listen", "invite-question"], [
      sentence("review-tennis", "Conversation", "Invite someone to play", "Build: ‘Would you like to play tennis on Sunday?’", ["にちようびに", "テニスを", "しませんか。"], { "しますか。": "Use ませんか for the invitation.", "すりませんか。": "する changes to し.", "しません。": "Add か to make the invitation." }, "An invitation can combine a day with the activity.", { acceptedAnswers: ["テニスをにちようびにしませんか。"] }),
      choice("review-cafe-refusal", "Conversation", "Change the place", "Your friend says カフェは ちょっと…。 Offer the library instead.", ["じゃあ、としょかんは どうですか。", "いいですね。カフェです。", "としょかんを ください。", "そうです。カフェです。"], 0, "～はどうですか can offer another place, as well as another day.", { audioText: "じゃあ、としょかんはどうですか。", audioRole: "feedback" }),
      choice("review-invite-listen", "Listening", "Hear acceptance", "What does the listener do?", ["Accepts the invitation to drink tea.", "Refuses the invitation to drink tea.", "Asks what time it is.", "Asks where the library is."], 0, "いいですね accepts the proposal.", { listenOnly: true, audioText: "おちゃをのみませんか。ええ、いいですね。", audioRole: "prompt" })
    ]],
    ["natural", ["natural-dinner", "natural-topic", "natural-think", "natural-leave", "natural-ee"], [
      choice("review-lunch", "Conversation", "Understand a short meal question", "ひるごはんは？ You will eat lunch. Choose the short affirmative reply.", ["たべます。", "たべません。", "たべります。", "ひるごはんをです。"], 0, "The meal is understood, so the affirmative verb completes the reply.", { audioText: "たべます。", audioRole: "feedback" }),
      choice("review-new-information", "Conversation", "Receive new information", "Ren tells you he will return at seven. Acknowledge the new information.", ["そうですか。", "そうです。", "いってきます。", "いただきます。"], 0, "そうですか acknowledges new information; そうです confirms a statement.", { audioText: "そうですか。", audioRole: "feedback" })
    ]],
    ["mission", ["mission-habit", "mission-invite", "mission-refusal", "mission-plan", "mission-return", "mission-leave"], [
      sentence("review-mission-cafe", "Production", "Explain a different plan", "Build: ‘I will drink tea at a cafe tomorrow.’", ["あした", "カフェで", "おちゃを", "のみます。"], { "あしたに": "Do not add に after あした.", "カフェに": "Use で where drinking occurs.", "のみません。": "This is an affirmative plan." }, "Combine a relative time, activity location, object, and affirmative verb.", { acceptedAnswers: ["カフェであしたおちゃをのみます。", "おちゃをあしたカフェでのみます。", "あしたおちゃをカフェでのみます。", "カフェでおちゃをあしたのみます。", "おちゃをカフェであしたのみます。"] }),
      sentence("review-mission-invite", "Conversation", "Invite someone to lunch", "Build: ‘Would you like to eat lunch at home on Sunday?’ ひるごはん = lunch.", ["にちようびに", "うちで", "ひるごはんを", "たべませんか。"], { "うちに": "Use で where lunch is eaten.", "たべますか。": "Use ませんか for the invitation.", "たべりませんか。": "たべる is a ru-verb." }, "Use the negative-question form for an invitation.", { acceptedAnswers: ["うちでにちようびにひるごはんをたべませんか。", "ひるごはんをにちようびにうちでたべませんか。", "にちようびにひるごはんをうちでたべませんか。", "うちでひるごはんをにちようびにたべませんか。", "ひるごはんをうちでにちようびにたべませんか。"] })
    ]]
  ];
  reviewFamilies.forEach(([family, ids, variants]) => register(family, ids, variants));
  register("mission-conjugation", ["mission-convert"], PRACTICE_FAMILIES["verb-okiru-negative"]);
  register("return-group", ["u-return-trap"], [
    choice("return-review", "Conjugation", "Keep the return stem", "Choose the negative of かえる (return).", ["かえりません", "かえません", "かえります", "くりません"], 0, "かえる is a u-verb: use stem かえり.", { audioText: "かえりません。", audioRole: "feedback" })
  ]);
  register("verb-boundary", ["action-verb-negative", "action-flexible-order"], [
    choice("negative-review", "Grammar", "Negate an action", "Choose ‘I do not drink.’", ["のみません。", "のみますじゃないです。", "のむません。", "のみます。"], 0, "Action verbs use ません here.", { audioText: "のみません。", audioRole: "feedback" }),
    choice("order-review", "Grammar", "Recognise valid word order", "Which pair keeps particles attached and the verb last?", ["カフェで あした おちゃを のみます。 / あした カフェで おちゃを のみます。", "のみます あしたを カフェ おちゃ。", "あしたに おちゃの カフェを のみます。", "カフェ おちゃ あした ですのみます。"], 0, "Time and place can change position while their grammatical roles stay the same.")
  ]);
  register("movement-viewpoint", ["place-viewpoint", "place-come"], [
    choice("viewpoint-review", "Conversation", "Come toward the speaker", "You are at school. Aoi will travel to your school tomorrow. Choose the sentence from your viewpoint.", ["アオイさんは あした がっこうに きます。", "アオイさんは あした がっこうで きます。", "アオイさんは あした がっこうに くります。", "アオイさんは あした がっこうを よみます。"], 0, "Movement toward the speaker's location uses くる → きます.", { audioText: "アオイさんはあしたがっこうにきます。", audioRole: "feedback" }),
    choice("go-review", "Conversation", "Travel away from your position", "You are at home. Tell someone at the library you will travel there.", ["としょかんに いきます。", "としょかんで いきます。", "としょかんに くります。", "としょかんを いきます。"], 0, "Use いく when travelling away from the speaker's current location.", { audioText: "としょかんにいきます。", audioRole: "feedback" })
  ]);
  register("optional-time", ["time-optional"], [
    choice("weekend-review", "Time", "Distinguish time expressions", "Which is accurate?", ["あした omits に; しゅうまつ often omits it but can take it.", "Both words always require に.", "Both words require へ.", "Every time expression uses で."], 0, "Relative time and weekend expressions have different rules for に.")
  ]);

  const stageGroups = ["verbs-affirmative", "verbs-affirmative", "verbs-affirmative", "objects", "places", "time", "habits", "invitations", "natural", "mission"];
  STAGES.forEach((stage, index) => stage.activities.forEach(activity => {
    if (activity.type !== "teach") activity.checkpointGroup ||= stageGroups[index];
  }));

  GUIDE_BREAKDOWNS["actions-guide"] = [
    { meaning: "I drink coffee.", pieces: [["コーヒー", "coffee"], ["を", "object"], ["のみます", "drink · polite affirmative"]], insight: "Choose the object first, then convert the action verb." },
    { meaning: "I do not watch TV.", pieces: [["テレビ", "TV"], ["を", "object"], ["みません", "do not watch"]], insight: "The negative meaning comes from the verb ending." },
    { meaning: "I study Japanese.", pieces: [["にほんご", "Japanese"], ["を", "object"], ["べんきょうします", "study"]], insight: "べんきょうする follows the する pattern." }
  ];
  GUIDE_BREAKDOWNS["places-guide"] = [
    { meaning: "I go to school.", pieces: [["がっこうに", "to school"], ["いきます", "go"]], insight: "Use に or へ for a movement destination." },
    { meaning: "I study Japanese at school.", pieces: [["がっこうで", "at school · activity location"], ["にほんごを", "Japanese · object"], ["べんきょうします", "study"]], insight: "で tells you where the studying happens." },
    { meaning: "I return home.", pieces: [["うちに", "home · destination"], ["かえります", "return"]], insight: "Returning is movement; remember the u-verb stem かえり." }
  ];

  const STAGE_WRAPUPS = [
    { challenge: "Recall both forms of おきる without looking at the table.", turns: [["Affirmative", "おきます"], ["Negative", "おきません"]] },
    { challenge: "Give both forms of かえる, then explain why its stem is かえり.", turns: [["Affirmative", "かえります"], ["Negative", "かえりません"]] },
    { challenge: "Recall both forms of する and くる.", turns: [["Do", "します / しません"], ["Come", "きます / きません"]], coreMilestone: true, milestoneTitle: "Verb workshop covered", milestoneCopy: "You have attempted both forms of all thirteen verbs. Use Verb conversion in Practice to strengthen recall, or continue into sentence building." },
    { challenge: "Say you drink coffee but do not watch TV.", turns: [["You", "コーヒーを のみます。でも、テレビを みません。"]] },
    { challenge: "Say you go to the library and read books there.", turns: [["You", "としょかんに いきます。としょかんで ほんを よみます。"]] },
    { challenge: "Say you get up at seven and return home about nine.", turns: [["You", "しちじに おきます。くじごろ うちに かえります。"]] },
    { challenge: "Describe one frequent action and one action you do not do much.", turns: [["Example", "よく ほんを よみます。あまり テレビを みません。"]] },
    { challenge: "Invite a friend for Saturday, handle a refusal, and offer Sunday.", turns: [["You", "どようびに テニスを しませんか。"], ["Friend", "どようびは ちょっと…。"], ["You", "じゃあ、にちようびは どうですか。"], ["Friend", "いいですね。"]], coreMilestone: true, milestoneTitle: "Invitation patterns covered", milestoneCopy: "You have practised an invitation, acceptance, a gentle refusal, and an alternative. Try another day or activity during review." },
    { challenge: "Explain a plan, give a return time, and leave home politely.", turns: [["You", "きょうは カフェで べんきょうします。くじごろ かえります。いってきます。"], ["Host", "いってらっしゃい。"]] },
    { challenge: "Arrange a different activity with a different day and place, then explain the plan aloud.", turns: [["Example", "にちようびに カフェで おちゃを のみませんか。"], ["Friend", "いいですね。"]], coreMilestone: true, milestoneTitle: "Weekend journey covered", milestoneCopy: "Keep the lesson useful with short mixed reviews and verb-conversion rounds. The checkpoint checks first-attempt answers across the lesson's main skills." }
  ];
  const PRACTICE_FAMILY_IDS = Object.fromEntries(Object.keys(PRACTICE_FAMILIES).map(family => [family,
    Object.entries(PRACTICE_FAMILY_BY_ID).filter(([, value]) => value === family).map(([id]) => id)
  ]));

  window.GUIDED_LESSONS = window.GUIDED_LESSONS || {};
  window.GUIDED_LESSONS["3"] = {
    id: "3", number: 3, slug: "weekend-plans", title: "Make Weekend Plans",
    headline: "Lesson 3 · Make Weekend Plans",
    subtitle: "Convert verbs, build accurate sentences, describe your routine, and arrange a plan with a friend.",
    journeyTitle: "From verbs to weekend plans", available: true, profile: false, checkpointGroups: true, hideAnswerHints: true,
    storageKey: "kanaSprintGuidedLesson3V1", verbs: VERBS,
    foundation: { title: "Lesson 3 vocabulary", copy: "Need a word refresher? The dedicated vocabulary page covers the full list. Here, focus on changing verbs and using them in sentences.", href: "../vocabulary.html?scope=lesson3", label: "Practise Lesson 3 words" },
    practiceSections: true,
    mixedVerbPractice: {
      id: "mixed-verbs", title: "All verb conversions · mixed",
      outcome: "Convert all 13 verbs into affirmative and negative forms in random order, without verb-group hints.",
      activities: STAGES.flatMap(stage => stage.activities).filter(activity => activity.type === "input" && activity.verbId && activity.id.startsWith("verb-")).map(activity => {
        const verb = VERBS.find(item => item.id === activity.verbId);
        return { ...activity, context: `${verb.dictionary} · ${verb.meaning}`, kicker: "Mixed verb conversion", hideStageOrigin: true };
      })
    },
    practiceFocuses: [{ id: "all", label: "All lesson skills" }, { id: "verbs", label: "Verb conversion", skill: "Conjugation" }],
    commonMistakeGuidance: {}, choiceGlosses: {}, stages: STAGES,
    answerBreakdowns: {}, guideBreakdowns: GUIDE_BREAKDOWNS, stageWrapups: STAGE_WRAPUPS,
    practiceFamilies: PRACTICE_FAMILIES, practiceFamilyIds: PRACTICE_FAMILY_IDS,
    practiceFamilyById: PRACTICE_FAMILY_BY_ID, practiceVariantKeysById: PRACTICE_VARIANT_KEYS_BY_ID
  };
})();

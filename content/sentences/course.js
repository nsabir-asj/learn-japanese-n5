/* Curated practice units. Lesson numbers organize content; they never lock access. */
(() => {
  "use strict";
  const topics = [
    { id: "identity", lesson: 1, title: "Introduce yourself", subtitle: "Topic は + noun + です", rule: "は marks what you are talking about. Put it after the topic, then finish a polite noun sentence with です. Particle は is pronounced wa.", examples: [["わたしは がくせいです。", "I am a student."], ["わたしは せんせいです。", "I am a teacher."]] },
    { id: "possession", lesson: 1, title: "Connect nouns with の", subtitle: "Ownership and relationships", rule: "Put の after the owner or describing noun, before the noun it describes. わたしのほん means my book; にほんごのほん means a Japanese-language book.", examples: [["わたしの ほんです。", "It is my book."], ["せんせいの かばんです。", "It is the teacher’s bag."]] },
    { id: "questions", lesson: 1, title: "Ask a polite question", subtitle: "Sentence-ending か", rule: "Add か at the end of a polite sentence to make a question. Keep the topic particle は after the topic.", examples: [["がくせいですか。", "Are you a student?"], ["せんせいですか。", "Are you a teacher?"]] },
    { id: "pointing", lesson: 2, title: "Point out an object", subtitle: "これ vs この + noun", rule: "これ stands on its own: this thing. この must be followed by a noun: このほん means this book. Use は after the whole topic phrase.", examples: [["これは ほんです。", "This is a book."], ["このほんは わたしのです。", "This book is mine."]] },
    { id: "also", lesson: 2, title: "Say ‘also’ with も", subtitle: "Add someone or something", rule: "も means also or too. In these noun sentences, it replaces topic は. The context must give you something to add to.", examples: [["わたしも がくせいです。", "I am a student too."], ["これも わたしのです。", "This is mine too."]] },
    { id: "objects", lesson: 3, title: "Choose the object", subtitle: "What you eat, drink, read, or watch · を", rule: "を follows the thing an action acts on: ほんをよみます means read a book. It is normally pronounced o. Keep the verb at the end.", examples: [["ほんを よみます。", "I read a book."], ["みずを のみます。", "I drink water."]] },
    { id: "destination", lesson: 3, title: "Go to a destination", subtitle: "Movement · に / へ", rule: "With いく, くる, and かえる, に or へ can mark a destination. Both are accepted here. Destination へ is pronounced e. Use で for the place where an activity happens.", examples: [["だいがくに いきます。", "I go to university."], ["うちへ かえります。", "I return home."]] },
    { id: "action-place", lesson: 3, title: "Say where an action happens", subtitle: "Activity location · で", rule: "Use で after the place where you do an activity. としょかんでよみます means read at the library. Compare としょかんにいきます: go to the library.", examples: [["としょかんで ほんを よみます。", "I read a book at the library."], ["うちで テレビを みます。", "I watch TV at home."]] },
    { id: "time", lesson: 3, title: "Say when", subtitle: "Specific times · に", rule: "Use に after specific clock times and days of the week. Expressions such as きょう (today) and まいにち (every day) usually stand without に in these neutral sentences.", examples: [["しちじに おきます。", "I get up at seven."], ["まいにち べんきょうします。", "I study every day."]] },
    { id: "companion", lesson: 3, title: "Do something together", subtitle: "A companion · と", rule: "と follows the person you do something with. ともだちと means with a friend. Keep the person and と together when changing the order of sentence phrases.", examples: [["ともだちと べんきょうします。", "I study with a friend."], ["ともだちと えいがを みます。", "I watch a movie with a friend."]] },
    { id: "negative", lesson: 3, title: "Say what you don’t do", subtitle: "Polite negative · ません", rule: "A polite negative verb ends in ません. The particles keep the same roles: コーヒーをのみません means I do not drink coffee.", examples: [["コーヒーを のみません。", "I do not drink coffee."], ["テレビを みません。", "I do not watch TV."]] },
    { id: "verbs-u", lesson: 3, title: "U-verbs", subtitle: "Polite affirmative and negative", verbGroup: "u", rule: "Change the final u sound to the corresponding i sound, then add ます or ません: よむ → よみます / よみません. かえる (return) is a u-verb even though it ends in る.", examples: [["よむ → よみます / よみません", "read / do not read"], ["かえる → かえります / かえりません", "return / do not return"]] },
    { id: "verbs-ru", lesson: 3, title: "Ru-verbs", subtitle: "Polite affirmative and negative", verbGroup: "ru", rule: "For a ru-verb, remove the final る and add ます or ません. Learn a verb’s group with the word: not every verb ending in る is a ru-verb.", examples: [["たべる → たべます / たべません", "eat / do not eat"], ["みる → みます / みません", "watch / do not watch"]] },
    { id: "verbs-irregular", lesson: 3, title: "Irregular verbs", subtitle: "する and くる", verbGroup: "irregular", rule: "Learn these changes directly: する → します / しません; くる → きます / きません. Compounds such as べんきょうする follow する.", examples: [["する → します / しません", "do / do not do"], ["くる → きます / きません", "come / do not come"]] }
  ];
  // Word IDs match Vocabulary progress. Inflected verbs refer back to dictionary words.
  const words = {};
  const w = (id, jp, romaji, meaning) => { words[id] = { id, jp, romaji, meaning, vocabularyIds: [id] }; };
  [
    ["watashi", "わたし", "watashi", "I / me"], ["gakusei", "がくせい", "gakusei", "student"],
    ["sensei", "せんせい", "sensei", "teacher"], ["nihonjin", "にほんじん", "nihonjin", "Japanese person"],
    ["ryuugakusei", "りゅうがくせい", "ryuugakusei", "international student"], ["tomodachi", "ともだち", "tomodachi", "friend"],
    ["hon", "ほん", "hon", "book"], ["kaban", "かばん", "kaban", "bag"], ["kasa", "かさ", "kasa", "umbrella"],
    ["nihongo", "にほんご", "nihongo", "Japanese language"], ["kore", "これ", "kore", "this thing"],
    ["sore", "それ", "sore", "that thing near you"], ["are", "あれ", "are", "that thing over there"], ["kono", "この", "kono", "this …"],
    ["mizu", "みず", "mizu", "water"], ["ocha", "おちゃ", "ocha", "tea"], ["koohii", "コーヒー", "koohii", "coffee"],
    ["asagohan", "あさごはん", "asagohan", "breakfast"], ["eiga", "えいが", "eiga", "movie"], ["terebi", "テレビ", "terebi", "TV"],
    ["ongaku", "おんがく", "ongaku", "music"], ["daigaku", "だいがく", "daigaku", "university"],
    ["toshokan", "としょかん", "toshokan", "library"], ["uchi", "うち", "uchi", "home"],
    ["shichiji", "しちじ", "shichiji", "seven o’clock"], ["kuji", "くじ", "kuji", "nine o’clock"],
    ["nichiyoubi", "にちようび", "nichiyoubi", "Sunday"], ["kyou", "きょう", "kyou", "today"], ["mainichi", "まいにち", "mainichi", "every day"]
  ].forEach(row => w(...row));
  // Clock phrases are already produced by the Numbers course, not Vocabulary words.
  words.shichiji.foundation = true; words.kuji.foundation = true;
  const verbs = [
    ["taberu", "たべる", "taberu", "eat", "ru", "たべ", "tabe", "食べ"],
    ["miru", "みる", "miru", "watch", "ru", "み", "mi", "見"],
    ["okiru", "おきる", "okiru", "get up", "ru", "おき", "oki", "起き"],
    ["neru", "ねる", "neru", "sleep", "ru", "ね", "ne", "寝"],
    ["iku", "いく", "iku", "go", "u", "いき", "iki", "行き"],
    ["kaeru", "かえる", "kaeru", "return", "u", "かえり", "kaeri", "帰り"],
    ["kiku", "きく", "kiku", "listen", "u", "きき", "kiki", "聞き"],
    ["nomu", "のむ", "nomu", "drink", "u", "のみ", "nomi", "飲み"],
    ["hanasu", "はなす", "hanasu", "speak", "u", "はなし", "hanashi", "話し"],
    ["yomu", "よむ", "yomu", "read", "u", "よみ", "yomi", "読み"],
    ["suru", "する", "suru", "do", "irregular", "し", "shi", "し"],
    ["benkyousuru", "べんきょうする", "benkyou suru", "study", "irregular", "べんきょうし", "benkyoushi", "勉強し"],
    ["kuru", "くる", "kuru", "come", "irregular", "き", "ki", "来"]
  ].map(([id, jp, romaji, meaning, group, stem, romajiStem, kanjiStem]) => {
    w(id, jp, romaji, meaning);
    return { id, jp, romaji, meaning, group, stem, romajiStem, kanjiStem };
  });
  words.benkyousuru.vocabularyIds = ["benkyou-suru"];
  const roles = {
    topic: { title: "Topic", note: "は marks what this sentence is about. Written は, pronounced wa.", choices: ["は"] },
    possession: { title: "Noun relationship", note: "の follows the owner or describing noun and comes before the noun it describes.", choices: ["の"] },
    question: { title: "Question", note: "か belongs at the end of this polite question.", choices: ["か"] },
    also: { title: "Also / too", note: "も adds this person or thing to what was already mentioned. It replaces は here.", choices: ["も"] },
    object: { title: "Object", note: "を marks what the action acts on. Written を, normally pronounced o.", choices: ["を"] },
    destination: { title: "Destination", note: "に or へ marks the destination of this movement. Both are valid here; で marks an activity location.", choices: ["に", "へ"] },
    place: { title: "Activity location", note: "で marks where this activity happens. This place is not a movement destination.", choices: ["で"] },
    time: { title: "Specific time", note: "に follows a specific clock time or day of the week.", choices: ["に"] },
    bareTime: { title: "Relative / repeated time", note: "きょう and まいにち stand without a particle in this neutral sentence.", choices: [""] },
    companion: { title: "Companion", note: "と marks the person you do the activity with.", choices: ["と"] }
  };
  const word = id => ({ text: words[id].jp, wordId: id });
  const p = role => ({ text: roles[role].choices[0], role });
  const phrase = (id, role) => [word(id), p(role)];
  const ending = text => [{ text }];
  const v = (id, negative = false) => [{ text: verbs.find(x => x.id === id).stem + (negative ? "ません" : "ます"), wordId: id }];
  const sentences = [];
  function add(id, topic, meaning, chunks, options = {}) {
    sentences.push({ id, topic, meaning, chunks, ...options });
  }
  ["gakusei", "sensei", "nihonjin", "ryuugakusei"].forEach(id => add(`identity-${id}`, "identity", `I am ${id === "nihonjin" ? "Japanese" : `a${id === "ryuugakusei" ? "n" : ""} ${words[id].meaning}`}.`, [phrase("watashi", "topic"), [word(id), { text: "です" }]]));
  [["watashi", "hon", "It is my book."], ["sensei", "kaban", "It is the teacher’s bag."], ["tomodachi", "kasa", "It is my friend’s umbrella."], ["nihongo", "hon", "It is a Japanese-language book."]].forEach(([a,b,en]) => add(`possession-${a}`, "possession", en, [[word(a), p("possession"), word(b)], ending("です")]));
  ["gakusei", "sensei", "ryuugakusei"].forEach(id => add(`question-${id}`, "questions", `Is your friend a${id === "ryuugakusei" ? "n" : ""} ${words[id].meaning}?`, [phrase("tomodachi","topic"), [word(id), { text: "です" }, p("question")]], { context: "You are asking about the friend the other person has just mentioned." }));
  [["kore", "hon", "This is a book."], ["sore", "kasa", "That near you is an umbrella."], ["are", "daigaku", "That over there is a university."]].forEach(([a,b,en]) => add(`pointing-${a}`, "pointing", en, [phrase(a,"topic"), [word(b), { text: "です" }]]));
  add("pointing-kono", "pointing", "This book is mine.", [[word("kono"), word("hon"), p("topic")], [word("watashi"), p("possession"), { text: "です" }]]);
  add("also-student", "also", "I am a student too.", [phrase("watashi","also"), [word("gakusei"), { text: "です" }]], { context: "Your friend has just said they are a student. Add that you are one too." });
  add("also-teacher", "also", "My friend is a teacher too.", [phrase("tomodachi","also"), [word("sensei"), { text: "です" }]], { context: "You are a teacher. Say your friend is also a teacher." });
  [["hon","yomu","I read a book."],["mizu","nomu","I drink water."],["ocha","nomu","I drink tea."],["asagohan","taberu","I eat breakfast."],["eiga","miru","I watch a movie."],["ongaku","kiku","I listen to music."]].forEach(([a,b,en]) => add(`object-${a}`, "objects", en, [phrase(a,"object"), v(b)]));
  [["daigaku","iku","I go to university."],["toshokan","iku","I go to the library."],["uchi","kaeru","I return home."]].forEach(([a,b,en]) => add(`destination-${a}`, "destination", en, [phrase(a,"destination"),v(b)]));
  add("place-library", "action-place", "I read a book at the library.", [phrase("toshokan","place"),phrase("hon","object"),v("yomu")], { orders: [[0,1,2],[1,0,2]] });
  add("place-home", "action-place", "I watch TV at home.", [phrase("uchi","place"),phrase("terebi","object"),v("miru")], { orders: [[0,1,2],[1,0,2]] });
  add("place-university", "action-place", "I study Japanese at university.", [phrase("daigaku","place"),phrase("nihongo","object"),v("benkyousuru")], { orders: [[0,1,2],[1,0,2]] });
  add("time-seven", "time", "I get up at seven.", [phrase("shichiji","time"),v("okiru")]);
  add("time-nine", "time", "I sleep at nine.", [phrase("kuji","time"),v("neru")]);
  add("time-sunday", "time", "I watch a movie on Sunday.", [phrase("nichiyoubi","time"),phrase("eiga","object"),v("miru")], { orders: [[0,1,2],[1,0,2]] });
  add("time-every-day", "time", "I study every day.", [phrase("mainichi","bareTime"),v("benkyousuru")]);
  add("time-today", "time", "I read a book today.", [phrase("kyou","bareTime"),phrase("hon","object"),v("yomu")], { orders: [[0,1,2],[1,0,2]] });
  add("companion-study", "companion", "I study with a friend.", [phrase("tomodachi","companion"),v("benkyousuru")]);
  add("companion-movie", "companion", "I watch a movie with a friend.", [phrase("tomodachi","companion"),phrase("eiga","object"),v("miru")], { orders: [[0,1,2],[1,0,2]] });
  add("companion-coffee", "companion", "I drink coffee with a friend.", [phrase("tomodachi","companion"),phrase("koohii","object"),v("nomu")], { orders: [[0,1,2],[1,0,2]] });
  [["koohii","nomu","I do not drink coffee."],["terebi","miru","I do not watch TV."],["asagohan","taberu","I do not eat breakfast."]].forEach(([a,b,en]) => add(`negative-${a}`, "negative", en, [phrase(a,"object"),v(b,true)]));
  const wordGroups = [
    ["watashi", "tomodachi", "sensei"], ["gakusei", "sensei", "nihonjin", "ryuugakusei"],
    ["hon", "kaban", "kasa"], ["kore", "sore", "are"], ["mizu", "ocha", "koohii"],
    ["hon", "eiga", "terebi", "ongaku"], ["daigaku", "toshokan", "uchi"],
    ["shichiji", "kuji"], ["nichiyoubi", "kyou", "mainichi"],
    ["yomu", "miru", "kiku", "hanasu"], ["taberu", "nomu"], ["iku", "kaeru", "kuru"],
    ["okiru", "neru"], ["suru", "benkyousuru"]
  ];
  globalThis.SENTENCE_COURSE = { topics, words, verbs, roles, sentences, wordGroups, lessons: [
    { id: 1, title: "First conversations", description: "Introduce yourself, connect nouns, and ask questions." },
    { id: 2, title: "Things around you", description: "Point out objects and add ‘also’." },
    { id: 3, title: "Everyday actions", description: "Objects, places, time, companions, and polite verbs." }
  ] };
})();

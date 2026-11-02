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
  topics.push(
    { id: "existence", lesson: 4, title: "Say what is there", subtitle: "Place に + thing / person が", rule: "Use に for where something exists and が for what exists. Use あります for things and plants, and います for people and animals. Use で for an activity instead.", examples: [["こうえんに いぬが います。", "There is a dog in the park."], ["つくえのうえに ほんが あります。", "There is a book on the desk."]] },
    { id: "relative-location", lesson: 4, title: "Locate people and things", subtitle: "Reference noun の + position", rule: "Connect a reference object to a position with の: つくえのした means under the desk. To locate something already being discussed, use topic は + location + です. For an activity at that location, follow the whole position phrase with で: としょかんのまえでまちます.", examples: [["ねこは つくえのしたです。", "The cat is under the desk."], ["ほんやは ホテルのとなりです。", "The bookstore is next to the hotel."]] },
    { id: "past-actions", lesson: 4, title: "Talk about past actions", subtitle: "ました / ませんでした", rule: "Add ました to the polite stem for a past action, or ませんでした for a past negative. きのう and せんしゅう usually need no に. Particles for objects, destinations, and activity places keep their roles.", examples: [["きのう ほんを よみました。", "I read a book yesterday."], ["きのう べんきょうしませんでした。", "I did not study yesterday."]] },
    { id: "past-nouns", lesson: 4, title: "Describe the past", subtitle: "でした / じゃなかったです", rule: "For a past noun sentence, change です to でした. A polite past negative is じゃなかったです. These noun endings differ from verb endings such as ました.", examples: [["きのうは にちようびでした。", "Yesterday was Sunday."], ["せんせいじゃなかったです。", "I was not a teacher."]] },
    { id: "duration", lesson: 4, title: "Say how long", subtitle: "Duration without に · ぐらい", rule: "A duration such as いちじかん (one hour) takes no に here. Add ぐらい for approximately. Compare a clock time such as しちじに (at seven).", examples: [["いちじかん べんきょうしました。", "I studied for one hour."], ["いちじかんぐらい まちました。", "I waited for about one hour."]] },
    { id: "listing-nouns", lesson: 4, title: "Join nouns with と", subtitle: "A complete list · and", rule: "と between nouns means and. Put the particle for the whole list after the last noun: ほんとパンをかいました. Compare と after a person meaning with that person.", examples: [["ほんと パンを かいました。", "I bought a book and bread."], ["いぬと ねこが います。", "There are a dog and a cat."]] },
    { id: "verbs-lesson4", lesson: 4, title: "Lesson 4 verbs", subtitle: "Polite affirmative and negative", verbGroup: "mixed", rule: "For u-verbs, change the final u sound to i and add ます / ません. For the ru-verb いる, remove る. Learn ある → あります and わかる → わかります as u-verbs.", examples: [["まつ → まちます / まちません", "wait / do not wait"], ["いる → います / いません", "be there / not be there (living things)"]] },
    { id: "verbs-past", lesson: 4, title: "Past verb forms", subtitle: "Earlier verbs + Lesson 4 verbs", verbGroup: "mixed", rule: "Use the same polite stem as ます, then add ました for past affirmative or ませんでした for past negative. This also works for irregular verbs: する → しました; くる → きませんでした.", examples: [["かう → かいました / かいませんでした", "bought / did not buy"], ["たべる → たべました / たべませんでした", "ate / did not eat"]] }
  );
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
  [
    ["inu", "いぬ", "inu", "dog"], ["neko", "ねこ", "neko", "cat"], ["kodomo", "こども", "kodomo", "child"],
    ["isu", "いす", "isu", "chair"], ["tsukue", "つくえ", "tsukue", "desk"], ["shashin", "しゃしん", "shashin", "photograph"],
    ["hana-flower", "はな", "hana", "flower"], ["repooto", "レポート", "repooto", "report"], ["pan", "パン", "pan", "bread"],
    ["otera", "おてら", "otera", "temple"], ["kouen", "こうえん", "kouen", "park"], ["suupaa", "スーパー", "suupaa", "supermarket"],
    ["hoteru", "ホテル", "hoteru", "hotel"], ["honya", "ほんや", "honya", "bookstore"], ["byouin", "びょういん", "byouin", "hospital"],
    ["kinou", "きのう", "kinou", "yesterday"], ["senshuu", "せんしゅう", "senshuu", "last week"], ["ichijikan", "いちじかん", "ichijikan", "one hour"],
    ["ue", "うえ", "ue", "on / above"], ["shita", "した", "shita", "under / below"], ["naka", "なか", "naka", "inside"],
    ["mae", "まえ", "mae", "in front"], ["ushiro", "うしろ", "ushiro", "behind"], ["tonari", "となり", "tonari", "next to"],
    ["chikaku", "ちかく", "chikaku", "near"], ["migi", "みぎ", "migi", "right"], ["hidari", "ひだり", "hidari", "left"],
    ["aida", "あいだ", "aida", "between"], ["suffix-gurai", "ぐらい", "gurai", "about / approximately"]
  ].forEach(row => w(...row));
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
  [
    ["au", "あう", "au", "meet", "u", "あい", "ai", "会い"],
    ["aru", "ある", "aru", "exist (things)", "u", "あり", "ari", "あり"],
    ["kau", "かう", "kau", "buy", "u", "かい", "kai", "買い"],
    ["kaku", "かく", "kaku", "write", "u", "かき", "kaki", "書き"],
    ["toru", "とる", "toru", "take a photograph", "u", "とり", "tori", "撮り"],
    ["matsu", "まつ", "matsu", "wait", "u", "まち", "machi", "待ち"],
    ["iru", "いる", "iru", "exist (people / animals)", "ru", "い", "i", "い"],
    ["wakaru", "わかる", "wakaru", "understand", "u", "わかり", "wakari", "分かり"]
  ].forEach(([id,jp,romaji,meaning,group,stem,romajiStem,kanjiStem]) => {
    w(id,jp,romaji,meaning);
    verbs.push({id,jp,romaji,meaning,group,stem,romajiStem,kanjiStem,lesson:4});
  });
  const roles = {
    topic: { title: "Topic", note: "は marks what this sentence is about. Written は, pronounced wa.", choices: ["は"] },
    possession: { title: "Noun relationship", note: "の follows the owner or describing noun and comes before the noun it describes.", choices: ["の"] },
    question: { title: "Question", note: "か belongs at the end of this polite question.", choices: ["か"] },
    also: { title: "Also / too", note: "も adds this person or thing to what was already mentioned. It replaces は here.", choices: ["も"] },
    object: { title: "Object", note: "を marks what the action acts on. Written を, normally pronounced o.", choices: ["を"] },
    destination: { title: "Destination", note: "に or へ marks the destination of this movement. Both are valid here; で marks an activity location.", choices: ["に", "へ"] },
    place: { title: "Activity location", note: "で marks where this activity happens. This place is not a movement destination.", choices: ["で"] },
    time: { title: "Specific time", note: "に follows a specific clock time or day of the week.", choices: ["に"] },
    bareTime: { title: "Relative / repeated time", note: "Relative or repeated time expressions such as きょう, きのう, せんしゅう, and まいにち stand without a particle in these neutral sentences.", choices: [""] },
    companion: { title: "Companion", note: "と marks the person you do the activity with.", choices: ["と"] }
  };
  const word = id => ({ text: words[id].jp, wordId: id });
  roles.existencePlace = { title: "Existence location", note: "に marks where something exists. Use で for an activity instead.", choices: ["に"] };
  roles.subject = { title: "What exists", note: "が marks the person, animal, or thing whose existence is introduced.", choices: ["が"] };
  roles.list = { title: "Noun list", note: "と joins nouns in a complete list: A and B. The particle after the last noun applies to the whole list.", choices: ["と"] };
  roles.duration = { title: "Duration", note: "A duration such as いちじかん takes no に here; に would mark a specific time instead.", choices: [""] };
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
  const past = (id, negative = false) => [{ text: verbs.find(x => x.id === id).stem + (negative ? "ませんでした" : "ました"), wordId: id }];
  const position = (reference, location, role) => [word(reference), p("possession"), word(location), p(role)];
  [["kouen","inu","iru","There is a dog in the park."], ["uchi","neko","iru","There is a cat at home."], ["toshokan","kodomo","iru","There is a child in the library."], ["kouen","hana-flower","aru","There is a flower in the park."]].forEach(([place,thing,verb,en]) => add(`existence-${thing}`,"existence",en,[phrase(place,"existencePlace"),phrase(thing,"subject"),v(verb)]));
  add("existence-book", "existence", "There is a book on the desk.", [position("tsukue","ue","existencePlace"),phrase("hon","subject"),v("aru")]);
  add("existence-chair", "existence", "There is a chair in front of the desk.", [position("tsukue","mae","existencePlace"),phrase("isu","subject"),v("aru")]);
  add("existence-no-cat", "existence", "There is no cat at home.", [phrase("uchi","existencePlace"),phrase("neko","subject"),v("iru",true)]);
  [["neko","tsukue","shita","The cat is under the desk."], ["hon","kaban","naka","The book is inside the bag."], ["honya","hoteru","tonari","The bookstore is next to the hotel."], ["byouin","daigaku","chikaku","The hospital is near the university."], ["inu","isu","ushiro","The dog is behind the chair."], ["otera","honya","migi","The temple is to the right of the bookstore."]].forEach(([thing,reference,location,en]) => add(`location-${thing}`,"relative-location",en,[phrase(thing,"topic"),[word(reference),p("possession"),word(location),{text:"です"}]]));
  add("location-between", "relative-location", "The library is between the hotel and the bookstore.", [phrase("toshokan","topic"),[word("hoteru"),p("list"),word("honya"),p("possession"),word("aida"),{text:"です"}]]);
  add("location-left", "relative-location", "The hotel is to the left of the temple.", [phrase("hoteru","topic"),[word("otera"),p("possession"),word("hidari"),{text:"です"}]]);
  add("past-read", "past-actions", "I read a book yesterday.", [phrase("kinou","bareTime"),phrase("hon","object"),past("yomu")], {orders:[[0,1,2],[1,0,2]]});
  add("past-no-study", "past-actions", "I did not study yesterday.", [phrase("kinou","bareTime"),past("benkyousuru",true)]);
  add("past-buy", "past-actions", "I bought bread at the supermarket.", [phrase("suupaa","place"),phrase("pan","object"),past("kau")], {orders:[[0,1,2],[1,0,2]]});
  add("past-photo", "past-actions", "I took a photograph in the park.", [phrase("kouen","place"),phrase("shashin","object"),past("toru")], {orders:[[0,1,2],[1,0,2]]});
  add("past-report", "past-actions", "I wrote a report last week.", [phrase("senshuu","bareTime"),phrase("repooto","object"),past("kaku")], {orders:[[0,1,2],[1,0,2]]});
  add("past-no-go", "past-actions", "I did not go to university yesterday.", [phrase("kinou","bareTime"),phrase("daigaku","destination"),past("iku",true)], {orders:[[0,1,2],[1,0,2]]});
  add("past-meet", "past-actions", "I met a friend at the library.", [phrase("toshokan","place"),phrase("tomodachi","companion"),past("au")], {orders:[[0,1,2],[1,0,2]]});
  add("past-sunday", "past-nouns", "Yesterday was Sunday.", [phrase("kinou","topic"),[word("nichiyoubi"),{text:"でした"}]]);
  add("past-student", "past-nouns", "I was a student.", [phrase("watashi","topic"),[word("gakusei"),{text:"でした"}]]);
  add("past-not-teacher", "past-nouns", "I was not a teacher.", [phrase("watashi","topic"),[word("sensei"),{text:"じゃなかったです"}]]);
  add("duration-study", "duration", "I studied for one hour.", [phrase("ichijikan","duration"),past("benkyousuru")]);
  add("duration-wait", "duration", "I waited for about one hour.", [[word("ichijikan"),word("suffix-gurai"),p("duration")],past("matsu")]);
  add("duration-read", "duration", "I read a book for one hour.", [phrase("ichijikan","duration"),phrase("hon","object"),past("yomu")], {orders:[[0,1,2],[1,0,2]]});
  add("list-shopping", "listing-nouns", "I bought a book and bread.", [[word("hon"),p("list"),word("pan"),p("object")],past("kau")]);
  add("list-animals", "listing-nouns", "There are a dog and a cat in the park.", [phrase("kouen","existencePlace"),[word("inu"),p("list"),word("neko"),p("subject")],v("iru")]);
  // Authored sentence families: variation is checked here, never improvised at runtime.
  [
    ["object-coffee","objects","I drink coffee.",[phrase("koohii","object"),v("nomu")]],
    ["object-tv","objects","I watch TV.",[phrase("terebi","object"),v("miru")]],
    ["place-home-book","action-place","I read a book at home.",[phrase("uchi","place"),phrase("hon","object"),v("yomu")]],
    ["place-home-music","action-place","I listen to music at home.",[phrase("uchi","place"),phrase("ongaku","object"),v("kiku")]],
    ["place-home-tea","action-place","I drink tea at home.",[phrase("uchi","place"),phrase("ocha","object"),v("nomu")]],
    ["place-library-study","action-place","I study Japanese at the library.",[phrase("toshokan","place"),phrase("nihongo","object"),v("benkyousuru")]],
    ["place-university-book","action-place","I read a book at university.",[phrase("daigaku","place"),phrase("hon","object"),v("yomu")]],
    ["companion-music","companion","I listen to music with a friend.",[phrase("tomodachi","companion"),phrase("ongaku","object"),v("kiku")]],
    ["companion-book","companion","I read a book with a friend.",[phrase("tomodachi","companion"),phrase("hon","object"),v("yomu")]],
    ["companion-tea","companion","I drink tea with a friend.",[phrase("tomodachi","companion"),phrase("ocha","object"),v("nomu")]],
    ["companion-breakfast","companion","I eat breakfast with a friend.",[phrase("tomodachi","companion"),phrase("asagohan","object"),v("taberu")]],
    ["time-today-music","time","I listen to music today.",[phrase("kyou","bareTime"),phrase("ongaku","object"),v("kiku")]],
    ["time-daily-tea","time","I drink tea every day.",[phrase("mainichi","bareTime"),phrase("ocha","object"),v("nomu")]],
    ["time-daily-book","time","I read a book every day.",[phrase("mainichi","bareTime"),phrase("hon","object"),v("yomu")]],
    ["negative-book","negative","I do not read books.",[phrase("hon","object"),v("yomu",true)]],
    ["negative-music","negative","I do not listen to music.",[phrase("ongaku","object"),v("kiku",true)]],
    ["negative-tea","negative","I do not drink tea.",[phrase("ocha","object"),v("nomu",true)]],
    ["past-tea","past-actions","I drank tea at home.",[phrase("uchi","place"),phrase("ocha","object"),past("nomu")]],
    ["past-movie","past-actions","I watched a movie with a friend.",[phrase("tomodachi","companion"),phrase("eiga","object"),past("miru")]],
    ["past-no-coffee","past-actions","I did not drink coffee yesterday.",[phrase("kinou","bareTime"),phrase("koohii","object"),past("nomu",true)]],
    ["past-no-tv","past-actions","I did not watch TV yesterday.",[phrase("kinou","bareTime"),phrase("terebi","object"),past("miru",true)]],
    ["duration-movie","duration","I watched a movie for one hour.",[phrase("ichijikan","duration"),phrase("eiga","object"),past("miru")]],
    ["duration-music","duration","I listened to music for one hour.",[phrase("ichijikan","duration"),phrase("ongaku","object"),past("kiku")]],
    ["existence-cat-park","existence","There is a cat in the park.",[phrase("kouen","existencePlace"),phrase("neko","subject"),v("iru")]],
    ["existence-dog-home","existence","There is a dog at home.",[phrase("uchi","existencePlace"),phrase("inu","subject"),v("iru")]],
    ["existence-bag-desk","existence","There is a bag under the desk.",[position("tsukue","shita","existencePlace"),phrase("kaban","subject"),v("aru")]],
    ["existence-no-book","existence","There is no book on the desk.",[position("tsukue","ue","existencePlace"),phrase("hon","subject"),v("aru",true)]]
  ].forEach(([id,topic,en,chunks])=>add(id,topic,en,chunks,chunks.length===3 ? {orders:[[0,1,2],[1,0,2]]}:{}));
  // Expanded, individually authored prompts. Use only established vocabulary;
  // each row chooses its meaning and structure rather than drawing random words.
  const nounEnd = (id, text="です") => [word(id),{text}];
  const owned = (owner, id, role) => [word(owner),p("possession"),word(id),...(role ? [p(role)] : [])];
  const pastNoun = (id, negative=false) => [word(id),{text:negative ? "じゃなかったです" : "でした"}];
  [
    ["identity-friend-student","identity","My friend is a student.",[phrase("tomodachi","topic"),nounEnd("gakusei")]],
    ["identity-friend-teacher","identity","My friend is a teacher.",[phrase("tomodachi","topic"),nounEnd("sensei")]],
    ["identity-friend-japanese","identity","My friend is Japanese.",[phrase("tomodachi","topic"),nounEnd("nihonjin")]],
    ["identity-friend-international","identity","My friend is an international student.",[phrase("tomodachi","topic"),nounEnd("ryuugakusei")]],
    ["possession-friend-book","possession","It is my friend's book.",[owned("tomodachi","hon"),ending("です")]],
    ["possession-teacher-book","possession","It is the teacher's book.",[owned("sensei","hon"),ending("です")]],
    ["possession-my-japanese-book","possession","It is my Japanese-language book.",[[word("watashi"),p("possession"),word("nihongo"),p("possession"),word("hon")],ending("です")]],
    ["possession-my-teacher-book","possession","It is my teacher's book.",[[word("watashi"),p("possession"),word("sensei"),p("possession"),word("hon")],ending("です")]],
    ["question-you-student","questions","Are you a student?",[[word("gakusei"),{text:"です"},p("question")]]],
    ["question-you-teacher","questions","Are you a teacher?",[[word("sensei"),{text:"です"},p("question")]]],
    ["question-you-japanese","questions","Are you Japanese?",[[word("nihonjin"),{text:"です"},p("question")]]],
    ["question-you-international","questions","Are you an international student?",[[word("ryuugakusei"),{text:"です"},p("question")]]],
    ["question-friend-japanese","questions","Is your friend Japanese?",[phrase("tomodachi","topic"),[word("nihonjin"),{text:"です"},p("question")]]],
    ["pointing-sore-book","pointing","That near you is a book.",[phrase("sore","topic"),nounEnd("hon")]],
    ["pointing-are-umbrella","pointing","That over there is an umbrella.",[phrase("are","topic"),nounEnd("kasa")]],
    ["pointing-kore-bag","pointing","This is a bag.",[phrase("kore","topic"),nounEnd("kaban")]],
    ["pointing-kono-bag","pointing","This bag is mine.",[[word("kono"),word("kaban"),p("topic")],[word("watashi"),p("possession"),{text:"です"}]]],
    ["also-friend-student","also","My friend is a student too.",[phrase("tomodachi","also"),nounEnd("gakusei")],{context:"You are a student. Add that your friend is also a student."}],
    ["also-me-japanese","also","I am Japanese too.",[phrase("watashi","also"),nounEnd("nihonjin")],{context:"Another person has just said they are Japanese. Say that you are too."}],
    ["also-friend-international","also","My friend is an international student too.",[phrase("tomodachi","also"),nounEnd("ryuugakusei")],{context:"You are an international student. Say that your friend is one too."}],
    ["also-this-book","also","This is a book too.",[phrase("kore","also"),nounEnd("hon")],{context:"You have identified one object as a book. Identify another as a book too."}],
    ["also-that-mine","also","That near you is mine too.",[phrase("sore","also"),[word("watashi"),p("possession"),{text:"です"}]],{context:"You have identified one of your belongings. Say that the object near the listener is yours too."}],
    ["also-this-umbrella-mine","also","This umbrella is mine too.",[[word("kono"),word("kasa"),p("also")],[word("watashi"),p("possession"),{text:"です"}]],{context:"You have said that a bag is yours. Add that this umbrella is yours too."}],
    ["object-friend-book","objects","I read my friend's book.",[owned("tomodachi","hon","object"),v("yomu")]],
    ["object-friend-coffee","objects","I drink my friend's coffee.",[owned("tomodachi","koohii","object"),v("nomu")]],
    ["destination-go-home","destination","I go home.",[phrase("uchi","destination"),v("iku")]],
    ["destination-return-university","destination","I return to university.",[phrase("daigaku","destination"),v("kaeru")]],
    ["destination-friend-comes","destination","My friend comes to university.",[phrase("tomodachi","topic"),phrase("daigaku","destination"),v("kuru")]],
    ["destination-today-library","destination","I go to the library today.",[phrase("kyou","bareTime"),phrase("toshokan","destination"),v("iku")]],
    ["destination-daily-university","destination","I go to university every day.",[phrase("mainichi","bareTime"),phrase("daigaku","destination"),v("iku")]],
    ["destination-with-friend","destination","I go to university with a friend.",[phrase("tomodachi","companion"),phrase("daigaku","destination"),v("iku")]],
    ["destination-nine-home","destination","I return home at nine.",[phrase("kuji","time"),phrase("uchi","destination"),v("kaeru")]],
    ["place-home-breakfast","action-place","I eat breakfast at home.",[phrase("uchi","place"),phrase("asagohan","object"),v("taberu")]],
    ["place-library-friend-book","action-place","I read my friend's book at the library.",[phrase("toshokan","place"),owned("tomodachi","hon","object"),v("yomu")]],
    ["time-seven-breakfast","time","I eat breakfast at seven.",[phrase("shichiji","time"),phrase("asagohan","object"),v("taberu")]],
    ["time-nine-home","time","I go home at nine.",[phrase("kuji","time"),phrase("uchi","destination"),v("iku")]],
    ["companion-tv","companion","I watch TV with a friend.",[phrase("tomodachi","companion"),phrase("terebi","object"),v("miru")]],
    ["companion-home-tv","companion","I watch TV at home with a friend.",[phrase("uchi","place"),phrase("tomodachi","companion"),phrase("terebi","object"),v("miru")]],
    ["companion-university-study","companion","I study Japanese at university with a friend.",[phrase("daigaku","place"),phrase("tomodachi","companion"),phrase("nihongo","object"),v("benkyousuru")]],
    ["negative-water","negative","I do not drink water.",[phrase("mizu","object"),v("nomu",true)]],
    ["negative-university","negative","I do not go to university.",[phrase("daigaku","destination"),v("iku",true)]],
    ["negative-home-tv","negative","I do not watch TV at home.",[phrase("uchi","place"),phrase("terebi","object"),v("miru",true)]],
    ["negative-today-study","negative","I do not study today.",[phrase("kyou","bareTime"),v("benkyousuru",true)]],
    ["existence-library-book","existence","There is a book in the library.",[phrase("toshokan","existencePlace"),phrase("hon","subject"),v("aru")]],
    ["location-bag-desk","relative-location","The bag is on the desk.",[phrase("kaban","topic"),[word("tsukue"),p("possession"),word("ue"),{text:"です"}]]],
    ["location-chair-desk","relative-location","The chair is in front of the desk.",[phrase("isu","topic"),[word("tsukue"),p("possession"),word("mae"),{text:"です"}]]],
    ["past-library-book","past-actions","I read a book at the library last week.",[phrase("senshuu","bareTime"),phrase("toshokan","place"),phrase("hon","object"),past("yomu")],{context:"Describe a completed visit to the library in the past."}],
    ["past-friend-student","past-nouns","My friend was a student.",[phrase("tomodachi","topic"),pastNoun("gakusei")]],
    ["past-friend-teacher","past-nouns","My friend was a teacher.",[phrase("tomodachi","topic"),pastNoun("sensei")]],
    ["past-me-international","past-nouns","I was an international student.",[phrase("watashi","topic"),pastNoun("ryuugakusei")]],
    ["past-not-student","past-nouns","I was not a student.",[phrase("watashi","topic"),pastNoun("gakusei",true)]],
    ["past-not-sunday","past-nouns","Yesterday was not Sunday.",[phrase("kinou","topic"),pastNoun("nichiyoubi",true)]],
    ["duration-tv","duration","I watched TV for one hour.",[phrase("ichijikan","duration"),phrase("terebi","object"),past("miru")]],
    ["duration-japanese","duration","I studied Japanese for one hour.",[phrase("ichijikan","duration"),phrase("nihongo","object"),past("benkyousuru")]],
    ["duration-library-book","duration","I read a book at the library for one hour.",[phrase("toshokan","place"),phrase("ichijikan","duration"),phrase("hon","object"),past("yomu")]],
    ["duration-about-study","duration","I studied for about one hour.",[[word("ichijikan"),word("suffix-gurai"),p("duration")],past("benkyousuru")]],
    ["duration-wait-exact","duration","I waited for one hour.",[phrase("ichijikan","duration"),past("matsu")]],
    ["list-bag-umbrella","listing-nouns","I bought a bag and an umbrella.",[[word("kaban"),p("list"),word("kasa"),p("object")],past("kau")]],
    ["list-water-tea","listing-nouns","I drank water and tea.",[[word("mizu"),p("list"),word("ocha"),p("object")],past("nomu")]],
    ["list-tv-movie","listing-nouns","I watched TV and a movie.",[[word("terebi"),p("list"),word("eiga"),p("object")],past("miru")]],
    ["list-book-bag-desk","listing-nouns","There are a book and a bag on the desk.",[position("tsukue","ue","existencePlace"),[word("hon"),p("list"),word("kaban"),p("subject")],v("aru")]],
    ["list-cat-dog-home","listing-nouns","There are a cat and a dog at home.",[phrase("uchi","existencePlace"),[word("neko"),p("list"),word("inu"),p("subject")],v("iru")]],
    ["list-photo-report","listing-nouns","There are a photograph and a report on the desk.",[position("tsukue","ue","existencePlace"),[word("shashin"),p("list"),word("repooto"),p("subject")],v("aru")]]
  ].forEach(([id,topic,en,chunks,options={}])=>{
    const orders=chunks.length===3 && chunks[0].at(-1)?.role!=="topic" ? [[0,1,2],[1,0,2]] : chunks.length===4 ? [[0,1,2,3],[0,2,1,3],[1,0,2,3],[1,2,0,3],[2,0,1,3],[2,1,0,3]] : undefined;
    add(id,topic,en,chunks,{expanded:true,...(orders ? {orders}:{}),...options});
  });
  // Authored combinations are additional material, not replacements for the
  // single-topic collection. Every main concept must be selected together.
  const mixedSentences = [];
  const mix = (id, requiredTopics, meaning, chunks, options = {}) => {
    const order = chunks.map((_,i)=>i);
    const adjuncts = order.slice(0,-1);
    const permutations = xs => xs.length ? xs.flatMap((x,i)=>permutations(xs.filter((_,j)=>i!==j)).map(rest=>[x,...rest])) : [[]];
    mixedSentences.push({id:`mix-${id}`,topic:requiredTopics[0],requiredTopics,meaning,chunks,
      orders:permutations(adjuncts).map(xs=>[...xs,order.at(-1)]),...options});
  };
  [
    ["whose-book",["possession","questions"],"Is it your friend’s book?",[[word("tomodachi"),p("possession"),word("hon")],[{text:"です"},p("question")]]],
    ["whose-bag",["possession","questions"],"Is it the teacher’s bag?",[[word("sensei"),p("possession"),word("kaban")],[{text:"です"},p("question")]]],
    ["this-friend-book",["pointing","possession"],"This is my friend’s book.",[phrase("kore","topic"),[word("tomodachi"),p("possession"),word("hon"),{text:"です"}]],{orders:[[0,1]]}],
    ["that-teacher-umbrella",["pointing","possession"],"That near you is the teacher’s umbrella.",[phrase("sore","topic"),[word("sensei"),p("possession"),word("kasa"),{text:"です"}]],{orders:[[0,1]]}],
    ["this-umbrella-question",["pointing","questions"],"Is this an umbrella?",[phrase("kore","topic"),[word("kasa"),{text:"です"},p("question")]]],
    ["that-book-question",["pointing","questions"],"Is that over there a book?",[phrase("are","topic"),[word("hon"),{text:"です"},p("question")]]],
    ["also-teacher-book",["also","possession","pointing"],"This is the teacher’s book too.",[phrase("kore","also"),[word("sensei"),p("possession"),word("hon"),{text:"です"}]],{context:"You have just identified one book as the teacher’s. Add that this book is also the teacher’s.",orders:[[0,1]]}],
    ["also-friend-bag",["also","possession","pointing"],"That near you is my friend’s bag too.",[phrase("sore","also"),[word("tomodachi"),p("possession"),word("kaban"),{text:"です"}]],{context:"You have just identified one bag as your friend’s. Add that the bag near the other person is your friend’s too.",orders:[[0,1]]}],
    ["friend-music",["possession","objects"],"I listen to my friend’s music.",[[word("tomodachi"),p("possession"),word("ongaku"),p("object")],v("kiku")]],
    ["teacher-book-read",["possession","objects"],"I read the teacher’s book.",[[word("sensei"),p("possession"),word("hon"),p("object")],v("yomu")]],
    ["teacher-home-go",["possession","destination"],"I go to the teacher’s home.",[[word("sensei"),p("possession"),word("uchi"),p("destination")],v("iku")]],
    ["friend-home-return",["possession","destination"],"I return to my friend’s home.",[[word("tomodachi"),p("possession"),word("uchi"),p("destination")],v("kaeru")]],
    ["friend-home-study",["possession","action-place"],"I study at my friend’s home.",[[word("tomodachi"),p("possession"),word("uchi"),p("place")],v("benkyousuru")]],
    ["teacher-home-study",["possession","action-place"],"I study at the teacher’s home.",[[word("sensei"),p("possession"),word("uchi"),p("place")],v("benkyousuru")]],
    ["friend-teacher-study",["possession","companion"],"I study with my friend’s teacher.",[[word("tomodachi"),p("possession"),word("sensei"),p("companion")],v("benkyousuru")]],
    ["teacher-friend-study",["possession","companion"],"I study with the teacher’s friend.",[[word("sensei"),p("possession"),word("tomodachi"),p("companion")],v("benkyousuru")]],
    ["seven-library",["time","destination"],"I go to the library at seven.",[phrase("shichiji","time"),phrase("toshokan","destination"),v("iku")]],
    ["nine-university",["time","destination"],"I go to university at nine.",[phrase("kuji","time"),phrase("daigaku","destination"),v("iku")]],
    ["seven-friend-study",["time","companion"],"I study with a friend at seven.",[phrase("shichiji","time"),phrase("tomodachi","companion"),v("benkyousuru")]],
    ["nine-teacher-study",["time","companion"],"I study with the teacher at nine.",[phrase("kuji","time"),phrase("sensei","companion"),v("benkyousuru")]],
    ["seven-home-study",["time","action-place"],"I study at home at seven.",[phrase("shichiji","time"),phrase("uchi","place"),v("benkyousuru")]],
    ["nine-library-study",["time","action-place"],"I study at the library at nine.",[phrase("kuji","time"),phrase("toshokan","place"),v("benkyousuru")]],
    ["friend-temple",["companion","destination"],"I go to the temple with a friend.",[phrase("tomodachi","companion"),phrase("otera","destination"),v("iku")]],
    ["teacher-library",["companion","destination"],"I go to the library with the teacher.",[phrase("sensei","companion"),phrase("toshokan","destination"),v("iku")]],
    ["teacher-library-study",["companion","action-place"],"I study with the teacher at the library.",[phrase("sensei","companion"),phrase("toshokan","place"),v("benkyousuru")]],
    ["friend-university-study",["companion","action-place"],"I study with a friend at university.",[phrase("tomodachi","companion"),phrase("daigaku","place"),v("benkyousuru")]],
    ["no-temple",["negative","destination"],"I do not go to the temple.",[phrase("otera","destination"),v("iku",true)]],
    ["no-bookstore",["negative","destination"],"I do not go to the bookstore.",[phrase("honya","destination"),v("iku",true)]],
    ["no-teacher-study",["negative","companion"],"I do not study with the teacher.",[phrase("sensei","companion"),v("benkyousuru",true)]],
    ["no-friend-study",["negative","companion"],"I do not study with a friend.",[phrase("tomodachi","companion"),v("benkyousuru",true)]],
    ["no-park-study",["negative","action-place"],"I do not study in the park.",[phrase("kouen","place"),v("benkyousuru",true)]],
    ["no-library-study",["negative","action-place"],"I do not study at the library.",[phrase("toshokan","place"),v("benkyousuru",true)]],
    ["past-temple",["past-actions","destination"],"I went to the temple yesterday.",[phrase("kinou","bareTime"),phrase("otera","destination"),past("iku")]],
    ["past-hospital",["past-actions","destination"],"I went to the hospital last week.",[phrase("senshuu","bareTime"),phrase("byouin","destination"),past("iku")]],
    ["past-teacher-study",["past-actions","companion"],"I studied with the teacher yesterday.",[phrase("kinou","bareTime"),phrase("sensei","companion"),past("benkyousuru")]],
    ["past-friend-study",["past-actions","companion"],"I studied with a friend last week.",[phrase("senshuu","bareTime"),phrase("tomodachi","companion"),past("benkyousuru")]],
    ["past-park-study",["past-actions","action-place"],"I studied in the park yesterday.",[phrase("kinou","bareTime"),phrase("kouen","place"),past("benkyousuru")]],
    ["past-library-study",["past-actions","action-place"],"I studied at the library last week.",[phrase("senshuu","bareTime"),phrase("toshokan","place"),past("benkyousuru")]],
    ["duration-teacher",["duration","companion"],"I study with the teacher for one hour.",[phrase("ichijikan","duration"),phrase("sensei","companion"),v("benkyousuru")]],
    ["duration-friend",["duration","companion"],"I study with a friend for about one hour.",[[word("ichijikan"),word("suffix-gurai"),p("duration")],phrase("tomodachi","companion"),v("benkyousuru")]],
    ["duration-park",["duration","action-place"],"I study in the park for one hour.",[phrase("ichijikan","duration"),phrase("kouen","place"),v("benkyousuru")]],
    ["duration-home",["duration","action-place"],"I study at home for about one hour.",[[word("ichijikan"),word("suffix-gurai"),p("duration")],phrase("uchi","place"),v("benkyousuru")]],
    ["list-home-things",["listing-nouns","existence"],"There are a bag and an umbrella at home.",[phrase("uchi","existencePlace"),[word("kaban"),p("list"),word("kasa"),p("subject")],v("aru")]],
    ["list-park-people",["listing-nouns","existence"],"There are a teacher and a child in the park.",[phrase("kouen","existencePlace"),[word("sensei"),p("list"),word("kodomo"),p("subject")],v("iru")]],
    ["friend-bag-exists",["possession","existence"],"There is a bag belonging to my friend in the library.",[phrase("toshokan","existencePlace"),[word("tomodachi"),p("possession"),word("kaban"),p("subject")],v("aru")]],
    ["teacher-book-exists",["possession","existence"],"There is a book belonging to the teacher at home.",[phrase("uchi","existencePlace"),[word("sensei"),p("possession"),word("hon"),p("subject")],v("aru")]],
    ["cat-behind-desk",["relative-location","existence"],"There is a cat behind the desk.",[position("tsukue","ushiro","existencePlace"),phrase("neko","subject"),v("iru")]],
    ["bag-under-chair",["relative-location","existence"],"There is a bag under the chair.",[position("isu","shita","existencePlace"),phrase("kaban","subject"),v("aru")]],
    ["past-friend-umbrella",["possession","past-nouns"],"It was my friend’s umbrella.",[[word("tomodachi"),p("possession"),word("kasa")],ending("でした")]],
    ["past-teacher-book",["possession","past-nouns"],"It was not the teacher’s book.",[[word("sensei"),p("possession"),word("hon")],ending("じゃなかったです")]],
    ["list-drinks",["listing-nouns","objects"],"I drink water and coffee.",[[word("mizu"),p("list"),word("koohii"),p("object")],v("nomu")]],
    ["list-reading",["listing-nouns","objects"],"I read a book and a report.",[[word("hon"),p("list"),word("repooto"),p("object")],v("yomu")]],
    ["friend-book-home",["possession","action-place","objects"],"I read my friend’s book at home.",[phrase("uchi","place"),[word("tomodachi"),p("possession"),word("hon"),p("object")],v("yomu")]],
    ["teacher-book-library",["possession","action-place","objects"],"I read the teacher’s book at the library.",[phrase("toshokan","place"),[word("sensei"),p("possession"),word("hon"),p("object")],v("yomu")]],
    ["seven-friend-library",["time","companion","destination"],"I go to the library with a friend at seven.",[phrase("shichiji","time"),phrase("tomodachi","companion"),phrase("toshokan","destination"),v("iku")]],
    ["nine-teacher-university",["time","companion","destination"],"I go to university with the teacher at nine.",[phrase("kuji","time"),phrase("sensei","companion"),phrase("daigaku","destination"),v("iku")]],
    ["past-friend-book",["past-actions","possession","objects"],"I read my friend’s book yesterday.",[phrase("kinou","bareTime"),[word("tomodachi"),p("possession"),word("hon"),p("object")],past("yomu")]],
    ["past-teacher-book-read",["past-actions","possession","objects"],"I read the teacher’s book last week.",[phrase("senshuu","bareTime"),[word("sensei"),p("possession"),word("hon"),p("object")],past("yomu")]],
    ["past-duration-park",["duration","action-place","past-actions"],"I studied in the park for one hour yesterday.",[phrase("kinou","bareTime"),phrase("kouen","place"),phrase("ichijikan","duration"),past("benkyousuru")]],
    ["past-duration-library",["duration","action-place","past-actions"],"I studied at the library for about one hour last week.",[phrase("senshuu","bareTime"),phrase("toshokan","place"),[word("ichijikan"),word("suffix-gurai"),p("duration")],past("benkyousuru")]],
    ["past-list-drinks",["listing-nouns","objects","past-actions"],"I drank water and coffee yesterday.",[phrase("kinou","bareTime"),[word("mizu"),p("list"),word("koohii"),p("object")],past("nomu")]],
    ["past-list-reading",["listing-nouns","objects","past-actions"],"I read a book and a report last week.",[phrase("senshuu","bareTime"),[word("hon"),p("list"),word("repooto"),p("object")],past("yomu")]],
    ["past-friend-library-book",["past-actions","possession","action-place","objects"],"I read my friend’s book at the library yesterday.",[phrase("kinou","bareTime"),phrase("toshokan","place"),[word("tomodachi"),p("possession"),word("hon"),p("object")],past("yomu")]],
    ["past-teacher-home-book",["past-actions","possession","action-place","objects"],"I read the teacher’s book at home last week.",[phrase("senshuu","bareTime"),phrase("uchi","place"),[word("sensei"),p("possession"),word("hon"),p("object")],past("yomu")]]
  ].forEach(row=>mix(...row));
  // Lesson 4 expansion: original prompts, grouped by the distinction being taught.
  topics.push(
    {id:"existence-uses",lesson:4,title:"Have things and describe events",subtitle:"Having / scheduled events · がある・いる",rule:"あります can mean have a thing or time, or that an event takes place. います can describe having siblings or friends. Use が for what you have or the event. A physical thing exists at a place に; an event happens at a venue で. Days can take に, while あした and きのう normally do not.",examples:[["じてんしゃが あります。","I have a bicycle."],["だいがくで テストが あります。","There is a test at university."]]},
    {id:"also-actions",lesson:4,title:"Add ‘too’ to actions",subtitle:"も / にも / でも",rule:"も replaces は, が, or を when adding a person or thing. Keep location or destination particles: としょかんでも means at the library too; としょかんにも means to the library too. Context tells you which person, thing, or place is being added.",examples:[["おちゃも のみます。","I drink tea too."],["としょかんでも べんきょうします。","I study at the library too."]]},
    {id:"verb-particles",lesson:4,title:"Match particles to the verb",subtitle:"会う に・と / 待つ を / わかる が / 書く に",rule:"Choose the particle with the verb: meet a person に (or と for meeting together), wait for a person を, understand a language が, and write a letter to a person に. English ‘to’, ‘with’, or ‘for’ does not decide the Japanese particle on its own.",examples:[["ともだちを まちます。","I wait for a friend."],["にほんごが わかります。","I understand Japanese."]]},
    {id:"quantity-frequency",lesson:4,title:"Say how much or how often",subtitle:"たくさん / あまり / ぜんぜん / よく",rule:"たくさん means many or a lot. With an object it can come before the noun or after を. あまり with a negative means not much / not often; ぜんぜん with a negative means not at all. よく can mean often. These adverbs do not need a particle after them in these examples.",examples:[["しゃしんを たくさん とります。","I take many photographs."],["あまり コーヒーを のみません。","I do not drink coffee very often."]]},
    {id:"question-words",lesson:4,title:"Ask where, when, who, and how long",subtitle:"どこ / いつ / だれ / なんじかん",rule:"Put a question word where the answer would go, keeping the particle for that role: どこで for an activity, どこに for a destination, だれと for a companion. いつ and なんじかん stand without に here. Finish polite questions with か.",examples:[["どこで べんきょうしますか。","Where do you study?"],["なんじかん べんきょうしましたか。","How many hours did you study?"]]}
  );
  [
    ["ashita","あした","ashita","tomorrow"],["getsuyoubi","げつようび","getsuyoubi","Monday"],["mokuyoubi","もくようび","mokuyoubi","Thursday"],
    ["kurasu","クラス","kurasu","class"],["tesuto","テスト","tesuto","test"],["jikan","じかん","jikan","time"],["jitensha","じてんしゃ","jitensha","bicycle"],
    ["kyoudai","きょうだい","kyoudai","siblings"],["tegami","てがみ","tegami","letter"],["eigo","えいご","eigo","English"],
    ["takusan","たくさん","takusan","many / a lot"],["amari","あまり","amari","not much / not often (with a negative)"],["zenzen","ぜんぜん","zenzen","not at all (with a negative)"],["yoku","よく","yoku","often"],
    ["doko","どこ","doko","where"],["dare","だれ","dare","who"],["itsu","いつ","itsu","when"],
    ["nijikan","にじかん","nijikan","two hours"],["sanjikan","さんじかん","sanjikan","three hours"],["ichijikanhan","いちじかんはん","ichijikanhan","one and a half hours"],["nanjikan","なんじかん","nanjikan","how many hours"]
  ].forEach(row=>w(...row));
  for(const [id,form] of Object.entries({getsuyoubi:"月曜日",mokuyoubi:"木曜日",jikan:"時間",kyoudai:"兄弟",tegami:"手紙",nijikan:"二時間",sanjikan:"三時間",ichijikanhan:"一時間半",nanjikan:"何時間"}))words[id].speechSpellings=[form];
  words.kyoudai.vocabularyIds=["n5-0249"];words.tegami.vocabularyIds=["n5-0461"];
  // Number phrases have no complete-word Vocabulary records; strict filters exclude them.
  for(const id of ["nijikan","sanjikan","ichijikanhan","nanjikan"])words[id].foundation=true;
  Object.assign(roles,{
    ownedSubject:{title:"What you have",note:"が marks what you have. Use あります for things or time, and います for siblings or friends.",choices:["が"]},
    eventSubject:{title:"Scheduled event",note:"が marks the class, test, or other event that takes place. あります can describe a scheduled event, not only an object.",choices:["が"]},
    eventPlace:{title:"Event venue",note:"で marks the venue where this event takes place. Compare に for where a physical thing exists.",choices:["で"]},
    alsoObject:{title:"Additional object",note:"も replaces を when adding another thing you read, drink, buy, or watch. Do not use をも here.",choices:["も"]},
    alsoSubject:{title:"Additional thing that exists",note:"も replaces が when adding another person or thing whose existence you mention.",choices:["も"]},
    alsoTopic:{title:"Additional person",note:"も replaces は when adding another person who does the same activity.",choices:["も"]},
    alsoPlace:{title:"Additional activity location",note:"Keep で and add も: でも means at this place too. も alone would lose the activity-location marking.",choices:["でも"]},
    alsoDestination:{title:"Additional destination",note:"Keep に (or へ) before も: にも / へも means to this place too.",choices:["にも","へも"]},
    meeting:{title:"Person you meet",note:"With あう, に marks the person you meet; と presents the meeting as a shared action. Both fit this prompt.",choices:["と","に"]},
    waiting:{title:"Person you wait for",note:"を marks the person you wait for with まつ. Do not choose に just because the person is the target in English.",choices:["を"]},
    understood:{title:"What you understand",note:"With わかる, が marks the language or thing you understand in this neutral pattern. It is not the object を pattern used with reading or drinking.",choices:["が"]},
    recipient:{title:"Person you write to",note:"に marks the recipient of the letter with かく. The letter itself takes を.",choices:["に"]},
    adverb:{title:"Adverb without a particle",note:"たくさん, あまり, ぜんぜん, and よく need no particle after them in these sentences. Keep あまり and ぜんぜん with the negative ending.",choices:[""]},
    questionTime:{title:"When",note:"いつ asks when. Use it without に in this neutral question, unlike a specific clock time.",choices:[""]},
    weekTime:{title:"Day of the week",note:"A day of the week can take に or stand alone in this sentence. Relative days such as あした normally stand without に.",choices:["に",""]}
  });
  const day=id=>phrase(id,["getsuyoubi","mokuyoubi"].includes(id)?"weekTime":"bareTime");
  const ad=id=>phrase(id,"adverb");
  const qend=id=>[...v(id),p("question")];
  const pqend=id=>[...past(id),p("question")];
  const evt=(place,event,negative=false)=>[phrase(place,"eventPlace"),phrase(event,"eventSubject"),v("aru",negative)];
  const pre=id=>[...phrase(id,"topic")];
  const additions=[
    ["have-bicycle","existence-uses","I have a bicycle.",[phrase("jitensha","ownedSubject"),v("aru")]],
    ["have-no-time","existence-uses","I do not have time.",[phrase("jikan","ownedSubject"),v("aru",true)]],
    ["have-siblings","existence-uses","I have siblings.",[phrase("kyoudai","ownedSubject"),v("iru")]],
    ["have-no-bicycle","existence-uses","I do not have a bicycle.",[phrase("jitensha","ownedSubject"),v("aru",true)]],
    ["event-university-test","existence-uses","There is a test at university.",evt("daigaku","tesuto")],
    ["event-library-class","existence-uses","There is a class at the library.",evt("toshokan","kurasu")],
    ["event-no-university-class","existence-uses","There is no class at university.",evt("daigaku","kurasu",true)],
    ["event-no-library-test","existence-uses","There is no test at the library.",evt("toshokan","tesuto",true)],
    ["also-drink-tea","also-actions","I drink tea too.",[phrase("ocha","alsoObject"),v("nomu")],{context:"You have said that you drink coffee. Add tea as another drink."}],
    ["also-read-report","also-actions","I read reports too.",[phrase("repooto","alsoObject"),v("yomu")],{context:"You have said that you read books. Add reports as another thing you read."}],
    ["also-teacher-study","also-actions","The teacher studies too.",[phrase("sensei","alsoTopic"),v("benkyousuru")],{context:"Your friend studies. Add the teacher as another person who studies."}],
    ["also-friend-go","also-actions","My friend goes to the park too.",[phrase("tomodachi","alsoTopic"),phrase("kouen","destination"),v("iku")],{context:"You go to the park. Say that your friend goes there as well; you are adding a person, not a destination."}],
    ["also-cat-home","also-actions","There is a cat at home too.",[phrase("uchi","existencePlace"),phrase("neko","alsoSubject"),v("iru")],{context:"You have said there is a dog at home. Add a cat as another animal at home."}],
    ["also-bag-desk","also-actions","There is a bag on the desk too.",[position("tsukue","ue","existencePlace"),phrase("kaban","alsoSubject"),v("aru")],{context:"You have said there is a book on the desk. Add a bag as another item there."}],
    ["also-study-library","also-actions","I study at the library too.",[phrase("toshokan","alsoPlace"),v("benkyousuru")],{context:"You have said you study at home. Add the library as another place you study."}],
    ["also-read-home","also-actions","I read books at home too.",[phrase("uchi","alsoPlace"),phrase("hon","object"),v("yomu")],{context:"You read books at the library. Add home as another place you read them."}],
    ["also-go-library","also-actions","I go to the library too.",[phrase("toshokan","alsoDestination"),v("iku")],{context:"You go to university. Add the library as another destination."}],
    ["also-go-park","also-actions","I go to the park too.",[phrase("kouen","alsoDestination"),v("iku")],{context:"You go to the supermarket. Add the park as another destination."}],
    ["meet-teacher","verb-particles","I meet the teacher.",[phrase("sensei","meeting"),v("au")]],
    ["meet-friend","verb-particles","I meet a friend.",[phrase("tomodachi","meeting"),v("au")]],
    ["wait-teacher","verb-particles","I wait for the teacher.",[phrase("sensei","waiting"),v("matsu")]],
    ["wait-friend","verb-particles","I wait for a friend.",[phrase("tomodachi","waiting"),v("matsu")]],
    ["understand-japanese","verb-particles","I understand Japanese.",[phrase("nihongo","understood"),v("wakaru")]],
    ["not-understand-english","verb-particles","I do not understand English.",[phrase("eigo","understood"),v("wakaru",true)]],
    ["write-friend-letter","verb-particles","I write a letter to a friend.",[phrase("tomodachi","recipient"),phrase("tegami","object"),v("kaku")]],
    ["write-teacher-letter","verb-particles","I write a letter to the teacher.",[phrase("sensei","recipient"),phrase("tegami","object"),v("kaku")]],
    ["many-photos","quantity-frequency","I take many photographs.",[phrase("shashin","object"),ad("takusan"),v("toru")]],
    ["many-books","quantity-frequency","I read many books.",[phrase("hon","object"),ad("takusan"),v("yomu")]],
    ["many-flowers","quantity-frequency","There are many flowers in the park.",[phrase("kouen","existencePlace"),phrase("hana-flower","subject"),ad("takusan"),v("aru")]],
    ["not-often-coffee","quantity-frequency","I do not drink coffee very often.",[ad("amari"),phrase("koohii","object"),v("nomu",true)]],
    ["not-often-tv","quantity-frequency","I do not watch TV very often.",[ad("amari"),phrase("terebi","object"),v("miru",true)]],
    ["never-music","quantity-frequency","I do not listen to music at all.",[ad("zenzen"),phrase("ongaku","object"),v("kiku",true)]],
    ["never-study","quantity-frequency","I do not study at all.",[ad("zenzen"),v("benkyousuru",true)]],
    ["often-park","quantity-frequency","I often go to the park.",[ad("yoku"),phrase("kouen","destination"),v("iku")]],
    ["often-japanese","quantity-frequency","I often study Japanese.",[ad("yoku"),phrase("nihongo","object"),v("benkyousuru")]],
    ["not-much-water","quantity-frequency","I do not drink much water.",[ad("amari"),phrase("mizu","object"),v("nomu",true)]],
    ["where-study","question-words","Where do you study?",[phrase("doko","place"),qend("benkyousuru")]],
    ["where-go","question-words","Where will you go?",[phrase("doko","destination"),qend("iku")]],
    ["where-book","question-words","Where is the book?",[pre("hon"),[word("doko"),{text:"です"},p("question")]]],
    ["when-test","question-words","When is there a test?",[phrase("itsu","questionTime"),phrase("tesuto","eventSubject"),qend("aru")]],
    ["who-companion-study","question-words","Who do you study with?",[phrase("dare","companion"),qend("benkyousuru")]],
    ["who-wait","question-words","Who are you waiting for?",[phrase("dare","waiting"),qend("matsu")]],
    ["hours-study","question-words","How many hours do you study?",[phrase("nanjikan","duration"),qend("benkyousuru")]],
    ["when-return","question-words","When will you return home?",[phrase("itsu","questionTime"),phrase("uchi","destination"),qend("kaeru")]],
    ["duration-two-read","duration","I read books for two hours.",[phrase("nijikan","duration"),phrase("hon","object"),v("yomu")]],
    ["duration-three-study","duration","I studied for three hours.",[phrase("sanjikan","duration"),past("benkyousuru")]],
    ["duration-half-sleep","duration","I slept for one and a half hours.",[phrase("ichijikanhan","duration"),past("neru")]],
    ["duration-half-about-study","duration","I study for about one and a half hours.",[[word("ichijikanhan"),word("suffix-gurai"),p("duration")],v("benkyousuru")]]
  ];
  for(const [id,topic,meaning,chunks,options={}] of additions){
    const adjuncts=chunks.slice(0,-1).map((_,i)=>i);
    // Keep explicit noun topics at the front; other adjuncts may trade places.
    const orders=adjuncts.length===2&&!chunks[0].some(x=>x.role==="topic")?[[0,1,2],[1,0,2]]:undefined;
    add(`l4-${id}`,topic,meaning,chunks,{lesson4Expansion:true,...(orders?{orders}:{}),...options});
  }
  const loc=(place,positionId,role)=>position(place,positionId,role);
  const expandedMix=[
    ["monday-japanese-class",["existence-uses","time"],"There is a class on Monday.",[day("getsuyoubi"),phrase("kurasu","eventSubject"),v("aru")]],
    ["thursday-no-test",["existence-uses","time"],"There is no test on Thursday.",[day("mokuyoubi"),phrase("tesuto","eventSubject"),v("aru",true)]],
    ["yesterday-test",["existence-uses","past-actions"],"There was a test yesterday.",[day("kinou"),phrase("tesuto","eventSubject"),past("aru")]],
    ["last-week-no-class",["existence-uses","past-actions"],"There was no class last week.",[day("senshuu"),phrase("kurasu","eventSubject"),past("aru",true)]],
    ["library-front-wait",["relative-location","verb-particles"],"I wait for a friend in front of the library.",[loc("toshokan","mae","place"),phrase("tomodachi","waiting"),v("matsu")]],
    ["park-near-meet",["relative-location","verb-particles"],"I meet the teacher near the park.",[loc("kouen","chikaku","place"),phrase("sensei","meeting"),v("au")]],
    ["hour-wait-friend",["duration","verb-particles"],"I wait for a friend for one hour.",[phrase("ichijikan","duration"),phrase("tomodachi","waiting"),v("matsu")]],
    ["two-hours-wait-teacher",["duration","verb-particles"],"I wait for the teacher for two hours.",[phrase("nijikan","duration"),phrase("sensei","waiting"),v("matsu")]],
    ["past-tea-too",["also-actions","past-actions"],"I drank tea too.",[phrase("ocha","alsoObject"),past("nomu")],{context:"You have said that you drank water. Add tea as another drink you had."}],
    ["past-report-too",["also-actions","past-actions"],"I read a report too.",[phrase("repooto","alsoObject"),past("yomu")],{context:"You have said that you read a book. Add a report as another thing you read."}],
    ["also-buy-list",["also-actions","listing-nouns"],"I buy books and umbrellas too.",[[word("hon"),p("list"),word("kasa"),p("alsoObject")],v("kau")],{context:"You buy bags. Add books and umbrellas as other things you buy."}],
    ["also-drink-list",["also-actions","listing-nouns"],"I drink water and tea too.",[[word("mizu"),p("list"),word("ocha"),p("alsoObject")],v("nomu")],{context:"You drink coffee. Add water and tea as other drinks you have."}],
    ["past-many-photos",["quantity-frequency","past-actions"],"I took many photographs yesterday.",[day("kinou"),phrase("shashin","object"),ad("takusan"),past("toru")]],
    ["past-not-much-study",["quantity-frequency","past-actions"],"I did not study much last week.",[day("senshuu"),ad("amari"),past("benkyousuru",true)]],
    ["past-where-photos",["question-words","past-actions"],"Where did you take photographs?",[phrase("doko","place"),phrase("shashin","object"),pqend("toru")]],
    ["past-who-study",["question-words","past-actions"],"Who did you study with?",[phrase("dare","companion"),pqend("benkyousuru")]],
    ["often-two-hours-read",["duration","quantity-frequency"],"I often read books for two hours.",[ad("yoku"),phrase("nijikan","duration"),phrase("hon","object"),v("yomu")]],
    ["often-hour-study",["duration","quantity-frequency"],"I often study for about one hour.",[ad("yoku"),[word("ichijikan"),word("suffix-gurai"),p("duration")],v("benkyousuru")]],
    ["hour-library-front-wait",["duration","relative-location","verb-particles"],"I wait for a friend in front of the library for one hour.",[loc("toshokan","mae","place"),phrase("tomodachi","waiting"),phrase("ichijikan","duration"),v("matsu")]],
    ["two-hours-park-near-wait",["duration","relative-location","verb-particles"],"I wait for the teacher near the park for two hours.",[loc("kouen","chikaku","place"),phrase("sensei","waiting"),phrase("nijikan","duration"),v("matsu")]],
    ["past-many-photos-friend",["quantity-frequency","past-actions","companion"],"I took many photographs with a friend yesterday.",[day("kinou"),phrase("tomodachi","companion"),phrase("shashin","object"),ad("takusan"),past("toru")]],
    ["past-no-study-friend",["quantity-frequency","past-actions","companion"],"I did not study with a friend at all last week.",[day("senshuu"),phrase("tomodachi","companion"),ad("zenzen"),past("benkyousuru",true)]],
    ["past-library-too-study",["also-actions","past-actions","action-place"],"I studied at the library too.",[phrase("toshokan","alsoPlace"),past("benkyousuru")],{context:"You studied at home. Add the library as another place you studied."}],
    ["past-park-too-photos",["also-actions","past-actions","action-place"],"I studied in the park too.",[phrase("kouen","alsoPlace"),past("benkyousuru")],{context:"You studied at university. Add the park as another place you studied."}],
    ["past-hour-library-front-wait",["duration","relative-location","verb-particles","past-actions"],"Yesterday, I waited for a friend in front of the library for one hour.",[day("kinou"),loc("toshokan","mae","place"),phrase("tomodachi","waiting"),phrase("ichijikan","duration"),past("matsu")]],
    ["past-two-hours-park-near-wait",["duration","relative-location","verb-particles","past-actions"],"Last week, I waited for the teacher near the park for two hours.",[day("senshuu"),loc("kouen","chikaku","place"),phrase("sensei","waiting"),phrase("nijikan","duration"),past("matsu")]],
    ["past-friend-japanese-book",["past-nouns","possession"],"It was my friend's Japanese-language book.",[[word("tomodachi"),p("possession"),word("nihongo"),p("possession"),word("hon")],ending("でした")]],
    ["past-not-teacher-report",["past-nouns","possession"],"It was not the teacher's report.",[[word("sensei"),p("possession"),word("repooto")],ending("じゃなかったです")]]
  ];
  for(const row of expandedMix){mix(...row);mixedSentences.at(-1).lesson4Expansion=true;}
  // These alternatives preserve the prompt's meaning. Keep them explicit rather
  // than accepting arbitrary particles, omissions, or word permutations.
  roles.relativeTime = { title: "Time expression", note: "Relative or repeated time can stand alone, or take は to make it the topic. It does not take に here.", choices: ["", "は"] };
  roles.weekday = { title: "Day of the week", note: "A day of the week can take に or stand without it in this sentence.", choices: ["に", ""] };
  roles.meeting = { title: "Person you meet", note: "With あう, に marks the person you meet; と presents the meeting as a shared action. Both fit this prompt.", choices: ["と", "に"] };
  for (const sentence of [...sentences,...mixedSentences]) {
    if (sentence.meaning.startsWith("I ")) {
      if (sentence.chunks[0]?.[0]?.wordId === "watashi" && sentence.chunks[0]?.[1]?.role === "topic") sentence.optionalTopic = "omit";
      else if (!sentence.chunks.flat().some(piece => piece.wordId === "watashi")) sentence.optionalTopic = "add";
    }
    if(sentence.lesson4Expansion && !sentence.context && sentence.chunks.flat().some(p=>p.role==="eventSubject"))sentence.context="Talk about a scheduled class or test.";
    sentence.chunks = sentence.chunks.map(chunk => chunk.map(piece => piece.role === "bareTime" ? {...piece,role:"relativeTime"} : piece));
    if (sentence.id === "time-sunday") sentence.chunks[0][1].role = "weekday";
    if (sentence.id === "past-meet") sentence.chunks[1][1].role = "meeting";
    if (!sentence.requiredTopics && sentence.chunks.length===3 && sentence.chunks.some(chunk => chunk.some(piece => piece.role === "existencePlace"))) sentence.orders = [[0,1,2],[1,0,2]];
    if (sentence.chunks.some(chunk=>chunk.some(piece=>piece.role==="list"))) {
      const alternate = sentence.chunks.map(chunk => chunk.map(piece => ({...piece})));
      const list = alternate.find(chunk => chunk.some(piece => piece.role === "list"));
      const index = list.findIndex(piece => piece.role === "list");
      [list[index-1],list[index+1]] = [list[index+1],list[index-1]];
      sentence.alternatives = [alternate];
    }
  }
  // Keep たくさん next to its intended noun or the verb, so it cannot
  // accidentally describe a different noun (e.g. many friends vs many photos).
  for(const sentence of [...sentences,...mixedSentences].filter(s=>s.lesson4Expansion)){
    const quantity=sentence.chunks.findIndex(c=>c.some(p=>p.wordId==="takusan"));
    if(quantity<0)continue;
    const target=sentence.chunks.findIndex(c=>c.some(p=>["object","subject"].includes(p.role)));
    const last=sentence.chunks.length-1,base=sentence.chunks.map((_,i)=>i);
    const before=base.filter(i=>i!==quantity);before.splice(before.indexOf(target),0,quantity);
    sentence.orders=[...new Map([...(sentence.orders||[base]),before].filter(order=>[target,last].includes(order[order.indexOf(quantity)+1])).map(order=>[order.join(","),order])).values()];
  }
  // Reviewed difficulty describes grammar combinations, independently of lesson,
  // vocabulary familiarity, support mode, and answer format.
  for (const sentence of [...sentences,...mixedSentences]) {
    const markers=sentence.chunks.flat().filter(piece=>piece.role);
    const possessions=markers.filter(piece=>piece.role==="possession").length;
    const combinedNouns=possessions>=2 || possessions>0 && !["possession","relative-location"].includes(sentence.topic);
    sentence.difficulty=sentence.requiredTopics || markers.length>=3 || combinedNouns ? "challenge" : "focused";
    sentence.difficultyReason=sentence.difficulty==="challenge" ? "Combines familiar patterns or several particle roles." : "Centres on one main sentence pattern.";
  }
  const wordGroups = [
    ["getsuyoubi","mokuyoubi","nichiyoubi"], ["kurasu","tesuto"], ["nihongo","eigo"], ["nijikan","sanjikan","ichijikanhan","ichijikan"],
    ["inu","neko","kodomo"], ["isu","tsukue","hon","kaban"], ["kouen","suupaa","hoteru","honya","otera","byouin"],
    ["ue","shita","naka","mae","ushiro","tonari","chikaku","migi","hidari","aida"], ["kinou","senshuu","kyou","mainichi"],
    ["aru","iru"], ["kau","kaku","toru","matsu","au"],
    ["watashi", "tomodachi", "sensei"], ["gakusei", "sensei", "nihonjin", "ryuugakusei"],
    ["hon", "kaban", "kasa"], ["kore", "sore", "are"], ["mizu", "ocha", "koohii"],
    ["hon", "eiga", "terebi", "ongaku"], ["daigaku", "toshokan", "uchi"],
    ["shichiji", "kuji"], ["nichiyoubi", "kyou", "mainichi"],
    ["yomu", "miru", "kiku", "hanasu"], ["taberu", "nomu"], ["iku", "kaeru", "kuru"],
    ["okiru", "neru"], ["suru", "benkyousuru"]
  ];
  // Families describe the learning decision, not just a sentence template.
  const topicAliases={"existence-uses":"existence"};
  const canonical=id=>topicAliases[id]||id;
  const familySkills={
    existence:[["things","Things and living beings"],["absence","Negative existence"],["known","Locate something already mentioned"],["having","Having things or relationships"],["events","Scheduled events"],["ask","Existence questions"],["identity","Existence versus identity"],["relative","Existence at relative positions"]],
    "relative-location":[["positions","Relative positions"],["between","Between two references"],["perspective","Choose the reference point"],["description","Describe the reference noun"],["activity","Activities at a relative location"],["movement","Move to a relative location"],["ask","Ask and answer where"],["correction","Correct a location claim"]],
    "past-actions":[["affirmative","Completed actions"],["negative","Actions that did not happen"],["habit","Past habits"],["ask","Questions about past actions"]],
    "past-nouns":[["identity","Past identity"],["negative","Negative past descriptions"],["belonging","Past noun relationships"],["price","Past prices"]],
    duration:[["exact","Elapsed time"],["approximate","Approximate duration"],["half","Half hours"],["clock","Clock time versus duration"],["ask","Ask how long"]],
    "listing-nouns":[["objects","A list as the object"],["subjects","A list of things that exist"],["destinations","A list of destinations"],["companions","A list of companions"]],
    "also-actions":[["person","Add a person"],["object","Add an object"],["subject","Add something that exists"],["place","Add a location or destination"],["day","Add a day"]],
    "verb-particles":[["meeting","Meet a person"],["waiting","Wait for a person"],["understood","Understand a language"],["recipient","Write to a recipient"]],
    "quantity-frequency":[["quantity","Amount"],["frequency","Frequency"],["limited","Not much or not often"],["none","Not at all"]],
    "question-words":[["place","Where"],["person","Who"],["time","When"],["length","How long"]]
  };
  for(const topic of topics)if(familySkills[topic.id])topic.skills=familySkills[topic.id].map(([id,label])=>({id,label}));
  const existenceTopic=topics.find(t=>t.id==="existence");
  Object.assign(existenceTopic,{title:"Existence and having: ある・いる",subtitle:"Presence, absence, having, events, and questions",rule:existenceTopic.rule+" あります also describes having things or time, or a scheduled event; います can describe having friends or siblings. A known person or thing can be the topic は, followed by place に + います / あります. Events use venue で. Use です for identity rather than existence."});
  topics.find(t=>t.id==="existence-uses").parentTopic="existence";
  topics.find(t=>t.id==="relative-location").rule+=" With a movement verb, use the whole position phrase as the destination with に or へ. Keep the reference object and the object being located distinct.";
  topics.find(t=>t.id==="past-actions").rule+=" Past habits also use these past endings. こどものとき means when you were a child and may be followed by に.";
  topics.find(t=>t.id==="past-nouns").rule+=" Prices and affiliations also use noun-sentence endings, rather than the past verb endings.";
  topics.find(t=>t.id==="duration").rule+=" Add はん after an hour duration to add half an hour, then ぐらい after the full duration for approximately. なんじかん asks how many hours without に.";
  Object.assign(topics.find(t=>t.id==="relative-location"),{subtitle:"Positions, reference points, activities, destinations, and questions"});
  for(const row of [["ano","あの","ano","that … over there"],["hito","ひと","hito","person"],["koko","ここ","koko","here"],["asoko","あそこ","asoko","over there"],["nani","なに","nani","what"],["toki","とき","toki","time / when"],["price3000","さんぜんえん","sanzenen","3,000 yen"],["price2000","にせんえん","nisenen","2,000 yen"]])w(...row);
  words.nani.vocabularyIds=["nan-nani"];
  for(const id of ["price3000","price2000"])words[id].foundation=true;
  Object.assign(roles,{
    knownPlace:{title:"Location of the topic",note:"に locates a person or thing already introduced as the topic は. Here います / あります describes being there; です can also describe a location in the accepted alternative.",choices:["に"]},
    pastPeriod:{title:"When in your life",note:"こどものとき means when you were a child. に is optional after this noun time phrase. This is different from きのう, which normally takes no に.",choices:["","に"]},
    alsoDay:{title:"Another day",note:"にも keeps the time に before も. A weekday can also take も without に. Do not add はも.",choices:["にも","も"]}
  });
  const familyAdd=(id,topic,skill,meaning,chunks,options={})=>{
    const {backgroundTopics=[],contrast="",...rest}=options;
    const order=chunks.map((_,i)=>i);
    add(`family-${id}`,topic,meaning,chunks,{familyExpansion:true,skill,backgroundTopics,contrast,orders:[order],...rest});
  };
  const a=familyAdd;
  const endq=text=>[{text},p("question")];
  const identityRef=()=>[word("ano"),word("hito"),p("topic")];
  const whenChild=()=>[word("kodomo"),p("possession"),word("toki"),p("pastPeriod")];
  const at=position;
  a("student-present","existence","identity","There is a student here.",[phrase("koko","existencePlace"),phrase("gakusei","subject"),v("iru")],{contrast:"Introduce someone who is present, rather than identify their occupation.",context:"You notice a student nearby. Report that a student is here."});
  a("person-student","existence","identity","That person is a student.",[identityRef(),nounEnd("gakusei")],{backgroundTopics:["pointing","identity"],contrast:"Identify a person with です instead of reporting existence.",context:"Someone asks what that person does. Identify them as a student."});
  a("person-teacher","existence","identity","That person is a teacher.",[identityRef(),nounEnd("sensei")],{backgroundTopics:["pointing","identity"],contrast:"A description of identity uses です, not います.",context:"You are identifying the occupation of the person over there."});
  a("no-students","existence","absence","There are no students in the library.",[phrase("toshokan","existencePlace"),phrase("gakusei","subject"),v("iru",true)],{contrast:"Choose negative います for people, not negative あります."});
  a("no-water","existence","absence","There is no water here.",[phrase("koko","existencePlace"),phrase("mizu","subject"),v("aru",true)],{contrast:"Choose negative あります for a thing, not negative います."});
  for(const [id,thing,place,verb,en]of [["known-cat","neko","uchi","iru","The cat is at home."],["known-book","hon","toshokan","aru","The book is in the library."]]){
    a(id,"existence","known",en,[phrase(thing,"topic"),[word(place),p("knownPlace"),...v(verb)]],{alternatives:[[phrase(thing,"topic"),[word(place),{text:"です"}]]],contrast:"Locate an already-mentioned topic rather than introduce a new subject.",context:`Someone asks where ${thing==="neko"?"the cat":"the book"} is.`});
  }
  a("have-language-book","existence","having","I have a Japanese-language book.",[[word("nihongo"),p("possession"),word("hon"),p("ownedSubject")],v("aru")],{backgroundTopics:["possession"],context:"Talk about a book you own."});
  a("have-japanese-friend","existence","having","I have a Japanese friend.",[[word("nihonjin"),p("possession"),word("tomodachi"),p("ownedSubject")],v("iru")],{backgroundTopics:["possession"],context:"Talk about a friend who is Japanese.",contrast:"Use います for a personal relationship, rather than ownership of an object."});
  a("have-time-question","existence","ask","Do you have time tomorrow?",[day("ashita"),phrase("jikan","ownedSubject"),qend("aru")],{backgroundTopics:["questions","time"],contrast:"Ask about available time, not a clock time."});
  a("any-cat-question","existence","ask","Is there a cat in the park?",[phrase("kouen","existencePlace"),phrase("neko","subject"),qend("iru")],{backgroundTopics:["questions"],contrast:"Ask about a living being with います."});
  a("what-here","existence","ask","What objects are here?",[phrase("koko","existencePlace"),phrase("nani","subject"),qend("aru")],{backgroundTopics:["questions"],contrast:"Ask what exists, preserving the subject が."});
  a("who-library","existence","ask","Who is in the library?",[phrase("toshokan","existencePlace"),phrase("dare","subject"),qend("iru")],{backgroundTopics:["questions"],contrast:"Ask who exists at a location; だれ is followed by が."});
  a("event-monday-venue","existence","events","There is a test at university on Monday.",[day("getsuyoubi"),...evt("daigaku","tesuto")],{backgroundTopics:["time"],contrast:"An event takes venue で rather than physical-existence に."});
  a("event-tomorrow","existence","events","There is a class at the library tomorrow.",[day("ashita"),...evt("toshokan","kurasu")],{backgroundTopics:["time"],contrast:"Combine an event venue with a relative day without に."});
  a("between-chair-desk","existence","relative","There is an umbrella between the chair and the desk.",[[word("isu"),p("list"),word("tsukue"),p("possession"),word("aida"),p("existencePlace")],phrase("kasa","subject"),v("aru")],{requiredTopics:["existence","relative-location"],contrast:"Locate a thing between two reference objects."});
  a("behind-friend-desk","relative-location","description","This bag is behind my friend's desk.",[[word("kono"),word("kaban"),p("topic")],[word("tomodachi"),p("possession"),word("tsukue"),p("possession"),word("ushiro"),{text:"です"}]],{backgroundTopics:["pointing","possession"],contrast:"Use the whole descriptive noun phrase as the reference point."});
  a("inside-teacher-bag","relative-location","description","The book is inside the teacher's bag.",[phrase("hon","topic"),[word("sensei"),p("possession"),word("kaban"),p("possession"),word("naka"),{text:"です"}]],{backgroundTopics:["possession"],contrast:"Keep the owner attached to the reference object."});
  a("chair-left-desk","relative-location","perspective","The chair is to the left of the desk.",[phrase("isu","topic"),[word("tsukue"),p("possession"),word("hidari"),{text:"です"}]],{contrast:"The desk is the reference point; locate the chair relative to it."});
  a("desk-right-chair","relative-location","perspective","The desk is to the right of the chair.",[phrase("tsukue","topic"),[word("isu"),p("possession"),word("migi"),{text:"です"}]],{contrast:"Reverse the reference point and change left to right."});
  a("study-near-library","relative-location","activity","I study near the library.",[at("toshokan","chikaku","place"),v("benkyousuru")],{backgroundTopics:["action-place"],contrast:"An activity at a relative location uses で, rather than existence に."});
  a("breakfast-front-university","relative-location","activity","I eat breakfast in front of the university.",[at("daigaku","mae","place"),phrase("asagohan","object"),v("taberu")],{backgroundTopics:["action-place","objects"],contrast:"Follow the whole position phrase with the activity-location particle."});
  a("go-front-library","relative-location","movement","I go to the area in front of the library.",[at("toshokan","mae","destination"),v("iku")],{backgroundTopics:["destination"],contrast:"This position is a destination, not the place of an activity."});
  a("go-near-temple","relative-location","movement","I go to the area near the temple.",[at("otera","chikaku","destination"),v("iku")],{backgroundTopics:["destination"],contrast:"A relative location can be a movement destination with に or へ."});
  a("where-friend-book","relative-location","ask","Where is my friend's book?",[[word("tomodachi"),p("possession"),word("hon"),p("topic")],[word("doko"),...endq("です")]],{backgroundTopics:["possession","questions"],contrast:"Ask about the location of a described noun phrase."});
  a("where-dog","relative-location","ask","Where is the dog?",[phrase("inu","topic"),[word("doko"),p("knownPlace"),...qend("iru")]],{alternatives:[[phrase("inu","topic"),[word("doko"),...endq("です")]]],backgroundTopics:["questions"],contrast:"A known animal stays the topic while its location is asked for."});
  a("correct-under","relative-location","correction","The umbrella is under the chair.",[phrase("kasa","topic"),[word("isu"),p("possession"),word("shita"),{text:"です"}]],{context:"Someone says the umbrella is on the chair. Correct the location: it is under the chair.",contrast:"Reject the stated position and supply the correct spatial relationship."});
  a("correct-behind","relative-location","correction","The supermarket is behind the hospital.",[phrase("suupaa","topic"),[word("byouin"),p("possession"),word("ushiro"),{text:"です"}]],{context:"Someone says the supermarket is in front of the hospital. Correct them: it is behind it.",contrast:"Distinguish front from behind using the same reference building."});
  a("where-photo-past","past-actions","ask","Did you take photographs yesterday?",[day("kinou"),phrase("shashin","object"),pqend("toru")],{backgroundTopics:["time","objects","questions"],contrast:"Keep the past ending before question か."});
  a("when-read-past","past-actions","ask","When did you read the report?",[phrase("itsu","questionTime"),phrase("repooto","object"),pqend("yomu")],{backgroundTopics:["questions","objects"],contrast:"Ask when a completed action happened, without adding に to いつ."});
  a("child-park","past-actions","habit","When I was a child, I often went to the park.",[whenChild(),ad("yoku"),phrase("kouen","destination"),past("iku")],{backgroundTopics:["possession","time","destination"],contrast:"A past habitual action still uses the polite past ending."});
  a("child-no-coffee","past-actions","habit","When I was a child, I did not drink coffee at all.",[whenChild(),ad("zenzen"),phrase("koohii","object"),past("nomu",true)],{backgroundTopics:["possession","time","negative","objects"],contrast:"Keep a negative adverb with the past-negative ending."});
  a("book-price","past-nouns","price","This book was 3,000 yen.",[[word("kono"),word("hon"),p("topic")],[word("price3000"),{text:"でした"}]],{backgroundTopics:["pointing"],contrast:"A past price ends with でした, rather than a past action ending."});
  a("bag-price","past-nouns","price","This bag was not 2,000 yen.",[[word("kono"),word("kaban"),p("topic")],[word("price2000"),{text:"じゃなかったです"}]],{backgroundTopics:["pointing"],contrast:"Negate a past price with a noun-sentence ending."});
  a("person-not-teacher-past","past-nouns","negative","That person was not a teacher.",[identityRef(),[word("sensei"),{text:"じゃなかったです"}]],{backgroundTopics:["pointing"],contrast:"Past negative identity differs from a past negative verb."});
  a("clock-duration","duration","clock","I study for one hour at seven.",[phrase("shichiji","time"),phrase("ichijikan","duration"),v("benkyousuru")],{backgroundTopics:["time"],contrast:"The starting clock time takes に; the elapsed hour does not."});
  a("clock-duration-read","duration","clock","I read for two hours at nine.",[phrase("kuji","time"),phrase("nijikan","duration"),v("yomu")],{backgroundTopics:["time"],contrast:"Distinguish the clock reading from the length of the activity."});
  a("hours-wait-question","duration","ask","How many hours do you wait?",[phrase("nanjikan","duration"),qend("matsu")],{backgroundTopics:["questions"],contrast:"A question about elapsed time does not take に."});
  a("about-half-read","duration","half","I read books for about one and a half hours.",[[word("ichijikanhan"),word("suffix-gurai"),p("duration")],phrase("hon","object"),v("yomu")],{backgroundTopics:["objects"],contrast:"Put the approximation after the complete half-hour duration."});
  a("list-destinations","listing-nouns","destinations","I go to the library and the bookstore.",[[word("toshokan"),p("list"),word("honya"),p("destination")],v("iku")],{backgroundTopics:["destination"],contrast:"The destination particle belongs after the complete noun list."});
  a("list-other-destinations","listing-nouns","destinations","I go to the park and the supermarket.",[[word("kouen"),p("list"),word("suupaa"),p("destination")],v("iku")],{backgroundTopics:["destination"],contrast:"Distinguish listing と from the destination particle for the whole list."});
  a("list-companions","listing-nouns","companions","I study with the teacher and a friend.",[[word("sensei"),p("list"),word("tomodachi"),p("companion")],v("benkyousuru")],{backgroundTopics:["companion"],contrast:"The first と joins the people; the final と marks the whole group as companions."});
  a("list-companions-go","listing-nouns","companions","I go to university with a friend and the teacher.",[[word("tomodachi"),p("list"),word("sensei"),p("companion")],phrase("daigaku","destination"),v("iku")],{backgroundTopics:["companion","destination"],contrast:"Keep the noun list and companion marker together, separately from the destination."});
  a("also-monday","also-actions","day","I study on Monday too.",[phrase("getsuyoubi","alsoDay"),v("benkyousuru")],{backgroundTopics:["time"],context:"You study on Sunday. Add Monday as another day you study.",contrast:"Keep time に before も, or use weekday も without に."});
  a("also-thursday","also-actions","day","I go to university on Thursday too.",[phrase("mokuyoubi","alsoDay"),phrase("daigaku","destination"),v("iku")],{backgroundTopics:["time","destination"],context:"You go to university on Monday. Add Thursday as another day you go.",contrast:"The new day takes も; the destination keeps its own particle."});
  a("wait-where-question","verb-particles","waiting","Where do you wait for the teacher?",[phrase("doko","place"),phrase("sensei","waiting"),qend("matsu")],{backgroundTopics:["action-place","questions"],contrast:"Keep を for the person being waited for and で for the activity location."});
  a("understand-question","verb-particles","understood","Do you understand English?",[phrase("eigo","understood"),qend("wakaru")],{backgroundTopics:["questions"],contrast:"A question about understanding still takes が, not を."});
  a("write-at-home","verb-particles","recipient","I write a letter to the teacher at home.",[phrase("uchi","place"),phrase("sensei","recipient"),phrase("tegami","object"),v("kaku")],{backgroundTopics:["action-place","objects"],contrast:"Distinguish location で, recipient に, and object を in one action."});
  a("who-write-to","question-words","person","Who do you write letters to?",[phrase("dare","recipient"),phrase("tegami","object"),qend("kaku")],{requiredTopics:["question-words","verb-particles"],backgroundTopics:["questions","objects"],contrast:"The question word keeps the recipient に required by the verb."});
  a("who-meet-question","question-words","person","Who do you meet at the library?",[phrase("toshokan","place"),phrase("dare","meeting"),qend("au")],{requiredTopics:["question-words","verb-particles"],backgroundTopics:["action-place","questions"],contrast:"Ask about the person met while preserving the separate location role."});
  // Retain old IDs and stored records while folding the old subcollection into
  // its family. Earlier grammar is supporting material, never a new focus.
  for(const sentence of [...sentences,...mixedSentences]){
    const original=sentence.requiredTopics||[sentence.topic];
    if(!original.some(id=>topics.find(t=>t.id===id)?.lesson===4))continue;
    const focus=[...new Set(original.filter(id=>topics.find(t=>t.id===id)?.lesson===4).map(canonical))];
    sentence.backgroundTopics=[...new Set([...(sentence.backgroundTopics||[]),...original.filter(id=>topics.find(t=>t.id===id)?.lesson<4)])];
    sentence.topic=focus[0];
    if(focus.length>1)sentence.requiredTopics=focus;else delete sentence.requiredTopics;
    if(sentence.familyExpansion && sentence.meaning.startsWith("I ")&&!sentence.chunks.flat().some(p=>p.wordId==="watashi"))sentence.optionalTopic="add";
    if(sentence.familyExpansion && sentence.chunks.some(c=>c.some(p=>p.role==="list"))){
      const alternate=sentence.chunks.map(c=>c.map(p=>({...p}))),list=alternate.find(c=>c.some(p=>p.role==="list")),i=list.findIndex(p=>p.role==="list");
      [list[i-1],list[i+1]]=[list[i+1],list[i-1]];sentence.alternatives=[alternate];
    }
    for(const piece of sentence.chunks.flat())if(piece.text==="じゃなかったです")piece.acceptedTexts=["じゃなかったです","じゃありませんでした","ではありませんでした","ではなかったです"];
    const markers=sentence.chunks.flat().filter(p=>p.role),has=r=>markers.some(p=>p.role===r);
    if(!sentence.skill){
      const id=sentence.topic;
      sentence.skill=id==="existence"?(has("eventSubject")?"events":has("ownedSubject")?"having":has("possession")?"relative":sentence.chunks.flat().some(p=>/ません/.test(p.text))?"absence":"things"):
        id==="relative-location"?(has("list")?"between":"positions"):
        id==="past-actions"?(sentence.chunks.flat().some(p=>/ません/.test(p.text))?"negative":"affirmative"):
        id==="past-nouns"?(has("possession")?"belonging":sentence.chunks.flat().some(p=>/じゃなかった/.test(p.text))?"negative":"identity"):
        id==="duration"?(sentence.chunks.flat().some(p=>p.wordId?.includes("han"))?"half":sentence.chunks.flat().some(p=>p.wordId==="suffix-gurai")?"approximate":"exact"):
        id==="listing-nouns"?(has("subject")?"subjects":"objects"):
        id==="also-actions"?(has("alsoTopic")?"person":has("alsoObject")?"object":has("alsoSubject")?"subject":"place"):
        id==="verb-particles"?(has("recipient")?"recipient":has("waiting")?"waiting":has("understood")?"understood":"meeting"):
        id==="quantity-frequency"?(sentence.chunks.flat().some(p=>p.wordId==="takusan")?"quantity":sentence.chunks.flat().some(p=>p.wordId==="zenzen")?"none":sentence.chunks.flat().some(p=>p.wordId==="amari")?"limited":"frequency"):
        id==="question-words"?(sentence.chunks.flat().some(p=>p.wordId==="dare")?"person":sentence.chunks.flat().some(p=>p.wordId==="itsu")?"time":sentence.chunks.flat().some(p=>p.wordId==="nanjikan")?"length":"place"):"";
    }
    // Lesson 4 demand comes from semantic contrasts and transfer, not length.
    const contrast=Boolean(sentence.contrast),transfer=sentence.backgroundTopics.length>0||Boolean(sentence.requiredTopics);
    const structural=has("eventPlace")||has("alsoPlace")||has("alsoDestination")||has("recipient")||has("list")||has("possession")&&has("existencePlace");
    sentence.difficulty=contrast||transfer||structural?"challenge":"focused";
    sentence.difficultyReason=sentence.contrast|| (transfer?"Apply the selected Lesson 4 focus with familiar supporting grammar.":structural?"Distinguish related particle roles or noun relationships.":"Establish one use of this topic family.");
  }
  globalThis.SENTENCE_COURSE = { topicAliases, topics, words, verbs, roles, sentences, mixedSentences, wordGroups, lessons: [
    { id: 1, title: "First conversations", description: "Introduce yourself, connect nouns, and ask questions." },
    { id: 2, title: "Things around you", description: "Point out objects and add ‘also’." },
    { id: 3, title: "Everyday actions", description: "Objects, places, time, companions, and polite verbs." },
    { id: 4, title: "Places and past events", description: "Existence, relative locations, past tense, duration, noun lists, and new verbs." }
  ] };
})();

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
    { id: "relative-location", lesson: 4, title: "Locate people and things", subtitle: "Reference noun の + position", rule: "Connect a reference object to a position with の: つくえのした means under the desk. To locate something already being discussed, use topic は + location + です.", examples: [["ねこは つくえのしたです。", "The cat is under the desk."], ["ほんやは ホテルのとなりです。", "The bookstore is next to the hotel."]] },
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
  // These alternatives preserve the prompt's meaning. Keep them explicit rather
  // than accepting arbitrary particles, omissions, or word permutations.
  roles.relativeTime = { title: "Time expression", note: "Relative or repeated time can stand alone, or take は to make it the topic. It does not take に here.", choices: ["", "は"] };
  roles.weekday = { title: "Day of the week", note: "A day of the week can take に or stand without it in this sentence.", choices: ["に", ""] };
  roles.meeting = { title: "Person you meet", note: "With あう, に marks the person you meet; と presents the meeting as a shared action. Both fit this prompt.", choices: ["と", "に"] };
  for (const sentence of sentences) {
    if (sentence.meaning.startsWith("I ")) {
      if (sentence.chunks[0]?.[0]?.wordId === "watashi" && sentence.chunks[0]?.[1]?.role === "topic") sentence.optionalTopic = "omit";
      else if (!sentence.chunks.flat().some(piece => piece.wordId === "watashi")) sentence.optionalTopic = "add";
    }
    sentence.chunks = sentence.chunks.map(chunk => chunk.map(piece => piece.role === "bareTime" ? {...piece,role:"relativeTime"} : piece));
    if (sentence.id === "time-sunday") sentence.chunks[0][1].role = "weekday";
    if (sentence.id === "past-meet") sentence.chunks[1][1].role = "meeting";
    if (sentence.chunks.some(chunk => chunk.some(piece => piece.role === "existencePlace"))) sentence.orders = [[0,1,2],[1,0,2]];
    if (sentence.chunks.some(chunk=>chunk.some(piece=>piece.role==="list"))) {
      const alternate = sentence.chunks.map(chunk => chunk.map(piece => ({...piece})));
      const list = alternate.find(chunk => chunk.some(piece => piece.role === "list"));
      const index = list.findIndex(piece => piece.role === "list");
      [list[index-1],list[index+1]] = [list[index+1],list[index-1]];
      sentence.alternatives = [alternate];
    }
  }
  // Reviewed difficulty describes grammar combinations, independently of lesson,
  // vocabulary familiarity, support mode, and answer format.
  for (const sentence of sentences) {
    const markers=sentence.chunks.flat().filter(piece=>piece.role);
    const possessions=markers.filter(piece=>piece.role==="possession").length;
    const combinedNouns=possessions>=2 || possessions>0 && !["possession","relative-location"].includes(sentence.topic);
    sentence.difficulty=markers.length>=3 || combinedNouns ? "challenge" : "focused";
    sentence.difficultyReason=sentence.difficulty==="challenge" ? "Combines familiar patterns or several particle roles." : "Centres on one main sentence pattern.";
  }
  const wordGroups = [
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
  globalThis.SENTENCE_COURSE = { topics, words, verbs, roles, sentences, wordGroups, lessons: [
    { id: 1, title: "First conversations", description: "Introduce yourself, connect nouns, and ask questions." },
    { id: 2, title: "Things around you", description: "Point out objects and add ‘also’." },
    { id: 3, title: "Everyday actions", description: "Objects, places, time, companions, and polite verbs." },
    { id: 4, title: "Places and past events", description: "Existence, relative locations, past tense, duration, noun lists, and new verbs." }
  ] };
})();

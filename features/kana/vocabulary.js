(() => {
  "use strict";

  const STORAGE_KEY = "kanaSprintVocabularyV1";
  const BREAKDOWN_PREFERENCE_KEY = "kanaSprintVocabularyBreakdownOpenV1";
  const VERSION = 1;
  const Speaking = window.KANA_SPRINT_VOCABULARY_SPEAKING;
  const STAGES = [
    {
      id: "lesson1-greetings", name: "Lesson 1 · Greetings & courtesy", description: "Complete social expressions for meeting, leaving, returning, and sharing a meal.",
      words: [
        ["ohayou", "おはよう", "ohayou", "good morning (casual)"],
        ["ohayou-gozaimasu", "おはようございます", "ohayou gozaimasu", "good morning (polite)"],
        ["konnichiwa", "こんにちは", "konnichiwa", "hello / good afternoon"],
        ["konbanwa", "こんばんは", "konbanwa", "good evening"],
        ["sayounara", "さようなら", "sayounara", "goodbye"],
        ["oyasumi-nasai", "おやすみなさい", "oyasumi nasai", "good night"],
        ["arigatou", "ありがとう", "arigatou", "thank you (casual)"],
        ["arigatou-gozaimasu", "ありがとうございます", "arigatou gozaimasu", "thank you (polite)"],
        ["sumimasen", "すみません", "sumimasen", "excuse me / sorry"],
        ["ittekimasu", "いってきます", "ittekimasu", "I’m leaving and will return"],
        ["itterasshai", "いってらっしゃい", "itterasshai", "go and come back safely"],
        ["tadaima", "ただいま", "tadaima", "I’m home"],
        ["okaeri-nasai", "おかえりなさい", "okaeri nasai", "welcome home"],
        ["itadakimasu", "いただきます", "itadakimasu", "said gratefully before eating"],
        ["gochisousama-deshita", "ごちそうさまでした", "gochisousama deshita", "thank you for the meal"],
        ["hajimemashite", "はじめまして", "hajimemashite", "nice to meet you"],
        ["yoroshiku-onegaishimasu", "よろしくおねがいします", "yoroshiku onegaishimasu", "please treat me kindly"],
        ["anou", "あのう", "anou", "um / excuse me"],
        ["hai", "はい", "hai", "yes"],
        ["sou-desu", "そうです", "sou desu", "that’s right"],
        ["sou-desu-ka", "そうですか", "sou desu ka", "I see / is that so?"]
      ]
    },
    {
      id: "lesson1-school", name: "Lesson 1 · School & people", description: "The identities and relationships used in a first introduction.",
      words: [
        ["daigaku", "だいがく", "daigaku", "college / university"],
        ["koukou", "こうこう", "koukou", "high school"],
        ["gakusei", "がくせい", "gakusei", "student"],
        ["daigakusei", "だいがくせい", "daigakusei", "college student"],
        ["ryuugakusei", "りゅうがくせい", "ryuugakusei", "international student"],
        ["sensei", "せんせい", "sensei", "teacher / professor"],
        ["suffix-nensei", "～ねんせい", "nensei", "year student"],
        ["ichinensei", "いちねんせい", "ichinensei", "first-year student"],
        ["senkou", "せんこう", "senkou", "major / field of study"],
        ["watashi", "わたし", "watashi", "I / me"],
        ["tomodachi", "ともだち", "tomodachi", "friend"],
        ["suffix-san", "～さん", "san", "Mr. / Ms. (name suffix)"],
        ["suffix-jin", "～じん", "jin", "person from / nationality suffix"],
        ["nihonjin", "にほんじん", "nihonjin", "Japanese person"],
        ["namae", "なまえ", "namae", "name"]
      ]
    },
    {
      id: "lesson1-details", name: "Lesson 1 · Time, details & countries", description: "Ask and understand time, age, telephone details, language, and origin.",
      words: [
        ["ima", "いま", "ima", "now"],
        ["gozen", "ごぜん", "gozen", "a.m. / before noon"],
        ["gogo", "ごご", "gogo", "p.m. / afternoon"],
        ["suffix-ji", "～じ", "ji", "o’clock / hour suffix"],
        ["ichiji", "いちじ", "ichiji", "one o’clock"],
        ["han", "はん", "han", "half"],
        ["nijihan", "にじはん", "nijihan", "half past two"],
        ["nihon", "にほん", "nihon", "Japan"],
        ["amerika", "アメリカ", "amerika", "United States / America"],
        ["suffix-go", "～ご", "go", "language suffix"],
        ["nihongo", "にほんご", "nihongo", "Japanese language"],
        ["suffix-sai", "～さい", "sai", "years old / age suffix"],
        ["denwa", "でんわ", "denwa", "telephone"],
        ["suffix-ban", "～ばん", "ban", "number suffix"],
        ["bangou", "ばんごう", "bangou", "number"],
        ["nan-nani", "なん／なに", "nan / nani", "what"],
        ["igirisu", "イギリス", "igirisu", "Britain"],
        ["oosutoraria", "オーストラリア", "oosutoraria", "Australia"],
        ["kankoku", "かんこく", "kankoku", "Korea"],
        ["kanada", "カナダ", "kanada", "Canada"],
        ["chuugoku", "ちゅうごく", "chuugoku", "China"],
        ["indo", "インド", "indo", "India"],
        ["ejiputo", "エジプト", "ejiputo", "Egypt"],
        ["firipin", "フィリピン", "firipin", "Philippines"]
      ]
    },
    {
      id: "lesson1-life", name: "Lesson 1 · Majors, work & family", description: "Describe what people study, what they do, and how they are related.",
      words: [
        ["ajia-kenkyuu", "アジアけんきゅう", "ajia kenkyuu", "Asian studies"],
        ["keizai", "けいざい", "keizai", "economics"],
        ["kougaku", "こうがく", "kougaku", "engineering"],
        ["kokusai-kankei", "こくさいかんけい", "kokusai kankei", "international relations"],
        ["konpyuutaa", "コンピューター", "konpyuutaa", "computer"],
        ["seiji", "せいじ", "seiji", "politics"],
        ["seibutsugaku", "せいぶつがく", "seibutsugaku", "biology"],
        ["bijinesu", "ビジネス", "bijinesu", "business"],
        ["bungaku", "ぶんがく", "bungaku", "literature"],
        ["rekishi", "れきし", "rekishi", "history"],
        ["isha", "いしゃ", "isha", "doctor"],
        ["kaishain", "かいしゃいん", "kaishain", "office worker"],
        ["kangoshi", "かんごし", "kangoshi", "nurse"],
        ["koukousei", "こうこうせい", "koukousei", "high school student"],
        ["shufu", "しゅふ", "shufu", "homemaker"],
        ["daigakuinsei", "だいがくいんせい", "daigakuinsei", "graduate student"],
        ["bengoshi", "べんごし", "bengoshi", "lawyer"],
        ["okaasan", "おかあさん", "okaasan", "mother"],
        ["otousan", "おとうさん", "otousan", "father"],
        ["oneesan", "おねえさん", "oneesan", "older sister"],
        ["oniisan", "おにいさん", "oniisan", "older brother"],
        ["imouto", "いもうと", "imouto", "younger sister"],
        ["otouto", "おとうと", "otouto", "younger brother"]
      ]
    },
    {
      id: "lesson2-pointing", name: "Lesson 2 · Pointing & places", description: "Identify things and people, distinguish distance, and ask where something is.",
      words: [
        ["kore", "これ", "kore", "this one"],
        ["sore", "それ", "sore", "that one"],
        ["are", "あれ", "are", "that one over there"],
        ["dore", "どれ", "dore", "which one"],
        ["kono", "この", "kono", "this (before a noun)"],
        ["sono", "その", "sono", "that (before a noun)"],
        ["ano", "あの", "ano", "that over there (before a noun)"],
        ["dono", "どの", "dono", "which (before a noun)"],
        ["koko", "ここ", "koko", "here"],
        ["soko", "そこ", "soko", "there"],
        ["asoko", "あそこ", "asoko", "over there"],
        ["doko", "どこ", "doko", "where?"],
        ["dare", "だれ", "dare", "who"],
        ["ginkou", "ぎんこう", "ginkou", "bank"],
        ["konbini", "コンビニ", "konbini", "convenience store"],
        ["toire", "トイレ", "toire", "toilet / restroom"],
        ["toshokan", "としょかん", "toshokan", "library"],
        ["yuubinkyoku", "ゆうびんきょく", "yuubinkyoku", "post office"]
      ]
    },
    {
      id: "lesson2-things", name: "Lesson 2 · Food & belongings", description: "High-use objects and foods for identifying belongings and ordering a meal.",
      words: [
        ["oishii", "おいしい", "oishii", "delicious"],
        ["sakana", "さかな", "sakana", "fish"],
        ["tonkatsu", "とんかつ", "tonkatsu", "pork cutlet"],
        ["niku", "にく", "niku", "meat"],
        ["menyuu", "メニュー", "menyuu", "menu"],
        ["yasai", "やさい", "yasai", "vegetable"],
        ["kasa", "かさ", "kasa", "umbrella"],
        ["kaban", "かばん", "kaban", "bag"],
        ["kutsu", "くつ", "kutsu", "shoes"],
        ["saifu", "さいふ", "saifu", "wallet"],
        ["jiinzu", "ジーンズ", "jiinzu", "jeans"],
        ["jitensha", "じてんしゃ", "jitensha", "bicycle"],
        ["shinbun", "しんぶん", "shinbun", "newspaper"],
        ["sumaho", "スマホ", "sumaho", "smartphone / mobile phone"],
        ["tiishatsu", "Tシャツ", "tiishatsu", "T-shirt"],
        ["tokei", "とけい", "tokei", "watch / clock"],
        ["nooto", "ノート", "nooto", "notebook"],
        ["pen", "ペン", "pen", "pen"],
        ["boushi", "ぼうし", "boushi", "hat / cap"],
        ["hon", "ほん", "hon", "book"]
      ]
    },
    {
      id: "lesson2-shopping", name: "Lesson 2 · Shopping language", description: "Ask prices and complete a simple store or restaurant exchange.",
      words: [
        ["eigo", "えいご", "eigo", "English language"],
        ["ikura", "いくら", "ikura", "how much?"],
        ["suffix-en", "～えん", "en", "yen / currency suffix"],
        ["takai", "たかい", "takai", "expensive / high"],
        ["irasshaimase", "いらっしゃいませ", "irasshaimase", "welcome to our store"],
        ["onegaishimasu", "おねがいします", "onegaishimasu", "please / a request"],
        ["kudasai", "ください", "kudasai", "please give me"],
        ["jaa", "じゃあ", "jaa", "then / in that case"],
        ["douzo", "どうぞ", "douzo", "please / here it is"],
        ["doumo", "どうも", "doumo", "thanks / very much"]
      ]
    },
    {
      id: "lesson3-leisure-food-places", name: "Lesson 3 · Leisure, meals & time", description: "Talk about entertainment, meals, familiar places, days, and everyday schedules.",
      words: [
        ["eiga", "えいが", "eiga", "movie"],
        ["ongaku", "おんがく", "ongaku", "music"],
        ["zasshi", "ざっし", "zasshi", "magazine"],
        ["supootsu", "スポーツ", "supootsu", "sports"],
        ["deeto", "デート", "deeto", "date (romantic)"],
        ["tenisu", "テニス", "tenisu", "tennis"],
        ["terebi", "テレビ", "terebi", "TV / television"],
        ["aisukuriimu", "アイスクリーム", "aisukuriimu", "ice cream"],
        ["hanbaagaa", "ハンバーガー", "hanbaagaa", "hamburger"],
        ["osake", "おさけ", "osake", "sake / alcoholic drink"],
        ["koohii", "コーヒー", "koohii", "coffee"],
        ["hirugohan", "ひるごはん", "hirugohan", "lunch"],
        ["bangohan", "ばんごはん", "bangohan", "dinner"],
        ["ie", "いえ", "ie", "house / home"],
        ["uchi", "うち", "uchi", "home / my place"],
        ["gakkou", "がっこう", "gakkou", "school"],
        ["kafe", "カフェ", "kafe", "cafe"],
        ["konban", "こんばん", "konban", "tonight"],
        ["mainichi", "まいにち", "mainichi", "every day"],
        ["maiban", "まいばん", "maiban", "every night"],
        ["shuumatsu", "しゅうまつ", "shuumatsu", "weekend"],
        ["doyoubi", "どようび", "doyoubi", "Saturday"],
        ["nichiyoubi", "にちようび", "nichiyoubi", "Sunday"],
        ["itsu", "いつ", "itsu", "when"],
        ["suffix-goro", "～ごろ", "goro", "at about / around (a time)"]
      ],
      reusedWordIds: ["ocha", "mizu", "asagohan", "ashita", "kyou", "asa"]
    },
    {
      id: "lesson3-actions", name: "Lesson 3 · Actions & qualities", description: "Use core verbs and simple qualities to describe study, travel, media, and daily routines.",
      words: [
        ["kiku", "きく", "kiku", "to listen / hear"],
        ["hanasu", "はなす", "hanasu", "to speak / talk"],
        ["yomu", "よむ", "yomu", "to read"],
        ["okiru", "おきる", "okiru", "to get up"],
        ["neru", "ねる", "neru", "to sleep / go to sleep"],
        ["miru", "みる", "miru", "to see / look at / watch"],
        ["suru", "する", "suru", "to do"],
        ["benkyou-suru", "べんきょうする", "benkyou suru", "to study"],
        ["ii", "いい", "ii", "good"],
        ["hayai", "はやい", "hayai", "early"]
      ],
      reusedWordIds: ["iku", "kaeru", "nomu", "taberu", "kuru"]
    },
    {
      id: "lesson3-habits-conversation", name: "Lesson 3 · Habits & conversation", description: "Describe frequency and keep a simple conversation moving naturally.",
      words: [
        ["amari", "あまり", "amari", "not much (with a negative)"],
        ["zenzen", "ぜんぜん", "zenzen", "not at all (with a negative)"],
        ["taitei", "たいてい", "taitei", "usually"],
        ["chotto", "ちょっと", "chotto", "a little"],
        ["tokidoki", "ときどき", "tokidoki", "sometimes"],
        ["yoku", "よく", "yoku", "often / much"],
        ["sou-desu-ne", "そうですね", "sou desu ne", "that's right / let me see"],
        ["demo", "でも", "demo", "but"],
        ["dou-desu-ka", "どうですか", "dou desu ka", "how is it? / how about it?"],
        ["ee", "ええ", "ee", "yes"]
      ]
    },
    {
      id: "lesson4-activities-people-places", name: "Lesson 4 · Activities, people & places", description: "Talk about activities, people, everyday objects, and places around town.",
      words: [
        ["geemu", "ゲーム", "geemu", "game"],
        ["arubaito", "アルバイト", "arubaito", "part-time job"],
        ["kaimono", "かいもの", "kaimono", "shopping"],
        ["kurasu", "クラス", "kurasu", "class"],
        ["inu", "いぬ", "inu", "dog"],
        ["neko", "ねこ", "neko", "cat"],
        ["kodomo", "こども", "kodomo", "child"],
        ["anata", "あなた", "anata", "you"],
        ["isu", "いす", "isu", "chair"],
        ["tsukue", "つくえ", "tsukue", "desk"],
        ["shashin", "しゃしん", "shashin", "picture / photograph"],
        ["hana-flower", "はな", "hana", "flower"],
        ["repooto", "レポート", "repooto", "term paper / report"],
        ["pan", "パン", "pan", "bread"],
        ["otera", "おてら", "otera", "temple"],
        ["kouen", "こうえん", "kouen", "park"],
        ["suupaa", "スーパー", "suupaa", "supermarket"],
        ["basutei", "バスてい", "basutei", "bus stop"],
        ["byouin", "びょういん", "byouin", "hospital"],
        ["hoteru", "ホテル", "hoteru", "hotel"],
        ["honya", "ほんや", "honya", "bookstore"],
        ["machi", "まち", "machi", "town / city"],
        ["resutoran", "レストラン", "resutoran", "restaurant"]
      ],
      reusedWordIds: ["hito", "gohan"]
    },
    {
      id: "lesson4-time-actions", name: "Lesson 4 · Time & actions", description: "Arrange meetings, describe duration, and talk about common actions through the week.",
      words: [
        ["suffix-jikan", "～じかん", "jikan", "hours / duration suffix"],
        ["ichijikan", "いちじかん", "ichijikan", "one hour"],
        ["senshuu", "せんしゅう", "senshuu", "last week"],
        ["toki", "とき", "toki", "when / at the time of"],
        ["getsuyoubi", "げつようび", "getsuyoubi", "Monday"],
        ["kayoubi", "かようび", "kayoubi", "Tuesday"],
        ["suiyoubi", "すいようび", "suiyoubi", "Wednesday"],
        ["mokuyoubi", "もくようび", "mokuyoubi", "Thursday"],
        ["kinyoubi", "きんようび", "kinyoubi", "Friday"],
        ["au", "あう", "au", "to meet / see a person"],
        ["aru", "ある", "aru", "there is (a thing)"],
        ["kau", "かう", "kau", "to buy"],
        ["kaku", "かく", "kaku", "to write"],
        ["toru", "とる", "toru", "to take a picture"],
        ["matsu", "まつ", "matsu", "to wait"],
        ["iru", "いる", "iru", "there is (a person) / to stay"],
        ["wakaru", "わかる", "wakaru", "to understand"]
      ],
      reusedWordIds: ["kinou"]
    },
    {
      id: "lesson4-location-conversation", name: "Lesson 4 · Location & conversation", description: "Locate people and things, explain reasons, and manage simple plans and phone calls.",
      words: [
        ["suffix-gurai", "～ぐらい", "gurai", "about / approximately"],
        ["sorekara", "それから", "sorekara", "and then"],
        ["dakara", "だから", "dakara", "so / therefore"],
        ["takusan", "たくさん", "takusan", "many / a lot"],
        ["suffix-to", "～と", "to", "together with / and"],
        ["doushite", "どうして", "doushite", "why"],
        ["hitoride", "ひとりで", "hitoride", "alone"],
        ["moshimoshi", "もしもし", "moshimoshi", "hello (on the phone)"],
        ["mae", "まえ", "mae", "front"],
        ["ushiro", "うしろ", "ushiro", "back / behind"],
        ["naka", "なか", "naka", "inside"],
        ["ue", "うえ", "ue", "on / above"],
        ["shita", "した", "shita", "under / below"],
        ["chikaku", "ちかく", "chikaku", "near / nearby"],
        ["tonari", "となり", "tonari", "next to"],
        ["aida", "あいだ", "aida", "between"]
      ],
      reusedWordIds: ["gomen-nasai", "migi", "hidari"]
    },
    {
      id: "lesson5-food-travel-life", name: "Lesson 5 · Food, travel & daily life", description: "Talk about food, trips, weather, study, rooms, and useful everyday items.",
      words: [
        ["tabemono", "たべもの", "tabemono", "food"],
        ["nomimono", "のみもの", "nomimono", "drink / beverage"],
        ["kudamono", "くだもの", "kudamono", "fruit"],
        ["yasumi", "やすみ", "yasumi", "holiday / day off / absence"],
        ["ryokou", "りょこう", "ryokou", "travel / trip"],
        ["umi", "うみ", "umi", "sea"],
        ["saafin", "サーフィン", "saafin", "surfing"],
        ["omiyage", "おみやげ", "omiyage", "souvenir"],
        ["tenki", "てんき", "tenki", "weather"],
        ["shukudai", "しゅくだい", "shukudai", "homework"],
        ["tesuto", "テスト", "tesuto", "test"],
        ["tanjoubi", "たんじょうび", "tanjoubi", "birthday"],
        ["heya", "へや", "heya", "room"],
        ["boku", "ぼく", "boku", "I / me (used by men)"],
        ["eru-saizu", "Lサイズ", "eru saizu", "size L"]
      ],
      reusedWordIds: ["basu"]
    },
    {
      id: "lesson5-qualities-preferences", name: "Lesson 5 · Qualities & preferences", description: "Describe things, people, weather, preferences, and how an experience feels.",
      words: [
        ["atarashii", "あたらしい", "atarashii", "new"],
        ["furui", "ふるい", "furui", "old (thing)"],
        ["atsui-weather", "あつい", "atsui", "hot (weather)"],
        ["samui", "さむい", "samui", "cold (weather)"],
        ["atsui-object", "あつい", "atsui", "hot (thing)"],
        ["isogashii", "いそがしい", "isogashii", "busy"],
        ["ookii", "おおきい", "ookii", "large / big"],
        ["chiisai", "ちいさい", "chiisai", "small"],
        ["omoshiroi", "おもしろい", "omoshiroi", "interesting / funny"],
        ["tsumaranai", "つまらない", "tsumaranai", "boring"],
        ["yasashii", "やさしい", "yasashii", "easy / kind"],
        ["muzukashii", "むずかしい", "muzukashii", "difficult"],
        ["kakkoii", "かっこいい", "kakkoii", "good-looking / cool"],
        ["kowai", "こわい", "kowai", "frightening / scary"],
        ["tanoshii", "たのしい", "tanoshii", "fun"],
        ["yasui", "やすい", "yasui", "inexpensive / cheap"],
        ["suki", "すき", "suki", "fond of / to like"],
        ["kirai", "きらい", "kirai", "disgusted with / to dislike"],
        ["daisuki", "だいすき", "daisuki", "very fond of / to love"],
        ["daikirai", "だいきらい", "daikirai", "to hate"],
        ["kirei", "きれい", "kirei", "beautiful / clean"],
        ["genki", "げんき", "genki", "healthy / energetic"],
        ["shizuka", "しずか", "shizuka", "quiet"],
        ["nigiyaka", "にぎやか", "nigiyaka", "lively"],
        ["hima", "ひま", "hima", "not busy / free (time)"]
      ]
    },
    {
      id: "lesson5-actions-conversation", name: "Lesson 5 · Activities & conversation", description: "Talk about activities and outings, intensify descriptions, and make plans together.",
      words: [
        ["oyogu", "およぐ", "oyogu", "to swim"],
        ["kiku-ask", "きく", "kiku", "to ask"],
        ["noru", "のる", "noru", "to ride / board"],
        ["yaru", "やる", "yaru", "to do / perform"],
        ["dekakeru", "でかける", "dekakeru", "to go out"],
        ["issho-ni", "いっしょに", "issho ni", "together"],
        ["sugoku", "すごく", "sugoku", "extremely"],
        ["totemo", "とても", "totemo", "very"],
        ["donna", "どんな", "donna", "what kind of"],
        ["suffix-mai", "～まい", "mai", "counter for flat objects"]
      ],
      reusedWordIds: ["daijoubu"]
    },
    {
      id: "lesson6-study-travel-life", name: "Lesson 6 · Study, travel & daily life", description: "Use classroom, travel, household, country, and calendar vocabulary.",
      words: [
        ["kanji", "かんじ", "kanji", "kanji / Chinese character"],
        ["kyoukasho", "きょうかしょ", "kyoukasho", "textbook"],
        ["peeji", "ページ", "peeji", "page"],
        ["tsugi", "つぎ", "tsugi", "next"],
        ["okane", "おかね", "okane", "money"],
        ["nimotsu", "にもつ", "nimotsu", "baggage / luggage"],
        ["pasokon", "パソコン", "pasokon", "personal computer"],
        ["shawaa", "シャワー", "shawaa", "shower"],
        ["eakon", "エアコン", "eakon", "air conditioner"],
        ["denki", "でんき", "denki", "electricity / light"],
        ["mado", "まど", "mado", "window"],
        ["kuni", "くに", "kuni", "country / place of origin"],
        ["konshuu", "こんしゅう", "konshuu", "this week"],
        ["raishuu", "らいしゅう", "raishuu", "next week"],
        ["rainen", "らいねん", "rainen", "next year"]
      ],
      reusedWordIds: ["densha", "yoru"]
    },
    {
      id: "lesson6-situations-actions", name: "Lesson 6 · Situations & actions", description: "Handle common classroom, travel, home, and social actions in everyday situations.",
      words: [
        ["taihen", "たいへん", "taihen", "tough / difficult (situation)"],
        ["asobu", "あそぶ", "asobu", "to play / spend time pleasantly"],
        ["isogu", "いそぐ", "isogu", "to hurry"],
        ["kaesu", "かえす", "kaesu", "to return a thing"],
        ["kesu", "けす", "kesu", "to turn off / erase"],
        ["shinu", "しぬ", "shinu", "to die"],
        ["suwaru", "すわる", "suwaru", "to sit down"],
        ["tatsu", "たつ", "tatsu", "to stand up"],
        ["tabako-o-suu", "たばこをすう", "tabako o suu", "to smoke"],
        ["tsukau", "つかう", "tsukau", "to use"],
        ["tetsudau", "てつだう", "tetsudau", "to help"],
        ["hairu", "はいる", "hairu", "to enter"],
        ["motsu", "もつ", "motsu", "to carry / hold"],
        ["yasumu", "やすむ", "yasumu", "to be absent / rest"],
        ["akeru", "あける", "akeru", "to open something"],
        ["shimeru", "しめる", "shimeru", "to close something"],
        ["oshieru", "おしえる", "oshieru", "to teach / instruct"],
        ["wasureru", "わすれる", "wasureru", "to forget / leave behind"],
        ["oriru", "おりる", "oriru", "to get off"],
        ["kariru", "かりる", "kariru", "to borrow"],
        ["shawaa-o-abiru", "シャワーをあびる", "shawaa o abiru", "to take a shower"],
        ["tsukeru", "つける", "tsukeru", "to turn on"],
        ["denwa-suru", "でんわする", "denwa suru", "to call"],
        ["tsurete-kuru", "つれてくる", "tsurete kuru", "to bring a person"],
        ["motte-kuru", "もってくる", "motte kuru", "to bring a thing"]
      ]
    },
    {
      id: "lesson6-timing-conversation", name: "Lesson 6 · Timing & conversation", description: "Sequence actions, set a comfortable pace, and respond naturally in conversation.",
      words: [
        ["ato-de", "あとで", "ato de", "later on"],
        ["sugu", "すぐ", "sugu", "right away"],
        ["yukkuri", "ゆっくり", "yukkuri", "slowly / leisurely"],
        ["kekkou-desu", "けっこうです", "kekkou desu", "that would be fine / no thank you"],
        ["hontou-desu-ka", "ほんとうですか", "hontou desu ka", "really?"]
      ]
    },
    {
      id: "practical-extras", name: "Practical extras · Daily essentials", description: "High-frequency language for understanding, routines, meals, and everyday conversation.",
      words: [
        ["iie", "いいえ", "iie", "no"],
        ["gomen-nasai", "ごめんなさい", "gomen nasai", "I’m sorry"],
        ["mata-ne", "またね", "mata ne", "see you"],
        ["wakarimasu", "わかります", "wakarimasu", "I understand"],
        ["wakarimasen", "わかりません", "wakarimasen", "I don’t understand"],
        ["daijoubu", "だいじょうぶ", "daijoubu", "okay / all right"],
        ["kazoku", "かぞく", "kazoku", "family"],
        ["hito", "ひと", "hito", "person"],
        ["kyou", "きょう", "kyou", "today"],
        ["ashita", "あした", "ashita", "tomorrow"],
        ["kinou", "きのう", "kinou", "yesterday"],
        ["asa", "あさ", "asa", "morning"],
        ["hiru", "ひる", "hiru", "noon / daytime"],
        ["yoru", "よる", "yoru", "night"],
        ["jikan", "じかん", "jikan", "time / duration"],
        ["iku", "いく", "iku", "to go"],
        ["kuru", "くる", "kuru", "to come"],
        ["kaeru", "かえる", "kaeru", "to return home"],
        ["shigoto", "しごと", "shigoto", "work / job"],
        ["mizu", "みず", "mizu", "water"],
        ["ocha", "おちゃ", "ocha", "tea"],
        ["gohan", "ごはん", "gohan", "meal / cooked rice"],
        ["asagohan", "あさごはん", "asagohan", "breakfast"],
        ["taberu", "たべる", "taberu", "to eat"],
        ["nomu", "のむ", "nomu", "to drink"],
        ["mise", "みせ", "mise", "shop / store"]
      ]
    },
    {
      id: "practical-navigation", name: "Practical extras · Getting around", description: "Essential transport and direction words for navigating outside the classroom.",
      words: [
        ["eki", "えき", "eki", "station"],
        ["densha", "でんしゃ", "densha", "train"],
        ["basu", "バス", "basu", "bus"],
        ["kuruma", "くるま", "kuruma", "car"],
        ["migi", "みぎ", "migi", "right"],
        ["hidari", "ひだり", "hidari", "left"],
        ["massugu", "まっすぐ", "massugu", "straight ahead"],
        ["iriguchi", "いりぐち", "iriguchi", "entrance"],
        ["deguchi", "でぐち", "deguchi", "exit"]
      ]
    }
  ];
  const COURSE_STAGES = STAGES.filter(stage => stage.id.startsWith("lesson"));
  const N5_DATA = globalThis.KANA_SPRINT_N5_VOCABULARY || { officialEntryCount: 0, topics: [], words: [], examples: {} };
  const N5_STAGES = N5_DATA.topics.map((topic, topicIndex) => ({
    id: `n5-topic-${topic.id}`,
    name: `JLPT N5 · ${topic.name}`,
    description: topic.description,
    track: "n5",
    topicIndex
  }));
  const ALL_STAGES = [...COURSE_STAGES, ...N5_STAGES];
  const ORIGINAL_WORDS = STAGES.flatMap((stage, stageIndex) => stage.words.map((word, order) => ({
    id: word[0], jp: word[1], romaji: word[2], meaning: word[3], stageId: stage.id,
    stageName: stage.name, stageIndex, order
  })));
  const ORIGINAL_WORDS_BY_ID = new Map(ORIGINAL_WORDS.map(word => [word.id, word]));
  const WORDS_BY_ID = new Map();

  COURSE_STAGES.forEach((stage, stageIndex) => {
    stage.words.forEach((word, order) => {
      WORDS_BY_ID.set(word[0], {
        id: word[0], jp: word[1], romaji: word[2], meaning: word[3],
        stageId: stage.id, stageIds: [stage.id], stageName: stage.name, stageIndex, order,
        tracks: ["genki"]
      });
    });
    (stage.reusedWordIds || []).forEach((id, reuseOrder) => {
      const existing = WORDS_BY_ID.get(id);
      if (existing) {
        if (!existing.stageIds.includes(stage.id)) existing.stageIds.push(stage.id);
        return;
      }
      const original = ORIGINAL_WORDS_BY_ID.get(id);
      if (!original) throw new Error(`Unknown reused vocabulary ID: ${id}`);
      WORDS_BY_ID.set(id, {
        ...original,
        stageId: stage.id,
        stageIds: [stage.id],
        stageName: stage.name,
        stageIndex,
        order: stage.words.length + reuseOrder,
        tracks: ["genki"]
      });
    });
  });
  N5_DATA.words.forEach((sourceWord, sourceOrder) => {
    const topicStageId = `n5-topic-${sourceWord.topicId}`;
    const topicStage = N5_STAGES.find(stage => stage.id === topicStageId);
    const practiceIds = sourceWord.existingWordIds.length ? sourceWord.existingWordIds : [sourceWord.sourceId];
    practiceIds.forEach((id, variantIndex) => {
      const existing = WORDS_BY_ID.get(id);
      if (existing) {
        if (!existing.stageIds.includes(topicStageId)) existing.stageIds.push(topicStageId);
        if (!existing.tracks.includes("n5")) existing.tracks.push("n5");
        existing.n5SourceId = sourceWord.sourceId;
        existing.n5VariantIndex = variantIndex;
        existing.speechSpellings = [...new Set([...(existing.speechSpellings || []), ...Speaking.sourceSpellingsFor(existing, sourceWord)])];
        return;
      }
      const original = ORIGINAL_WORDS_BY_ID.get(id);
      const entry = {
        id,
        jp: original?.jp || sourceWord.kana.replace(/^～/, ""),
        romaji: original?.romaji || sourceWord.romaji.replace(/^~/, ""),
        meaning: original?.meaning || sourceWord.meaning,
        stageId: topicStageId,
        stageIds: [topicStageId],
        stageName: topicStage?.name || "JLPT N5",
        stageIndex: COURSE_STAGES.length + Math.max(0, topicStage?.topicIndex || 0),
        order: sourceOrder,
        tracks: ["n5"],
        n5SourceId: sourceWord.sourceId,
        n5VariantIndex: variantIndex
      };
      entry.speechSpellings = Speaking.sourceSpellingsFor(entry, sourceWord);
      WORDS_BY_ID.set(id, entry);
    });
  });
  const WORDS = [...WORDS_BY_ID.values()];
  const CONTRAST_GROUPS = [
    ["ohayou", "ohayou-gozaimasu", "konnichiwa", "konbanwa", "sayounara", "oyasumi-nasai", "mata-ne"],
    ["arigatou", "arigatou-gozaimasu", "sumimasen", "gomen-nasai", "doumo"],
    ["ittekimasu", "itterasshai", "tadaima", "okaeri-nasai"],
    ["itadakimasu", "gochisousama-deshita", "irasshaimase", "onegaishimasu", "kudasai", "douzo"],
    ["daigaku", "koukou", "gakusei", "daigakusei", "ryuugakusei", "koukousei", "daigakuinsei", "sensei"],
    ["ajia-kenkyuu", "keizai", "kougaku", "kokusai-kankei", "seiji", "seibutsugaku", "bijinesu", "bungaku", "rekishi"],
    ["isha", "kaishain", "kangoshi", "shufu", "bengoshi", "sensei"],
    ["okaasan", "otousan", "oneesan", "oniisan", "imouto", "otouto", "kazoku"],
    ["kore", "sore", "are", "dore"],
    ["kono", "sono", "ano", "dono"],
    ["koko", "soko", "asoko", "doko"],
    ["ginkou", "konbini", "toire", "toshokan", "yuubinkyoku", "mise", "eki"],
    ["sakana", "tonkatsu", "niku", "yasai", "mizu", "ocha", "gohan", "asagohan"],
    ["kasa", "kaban", "kutsu", "saifu", "jiinzu", "jitensha", "shinbun", "sumaho", "tiishatsu", "tokei", "nooto", "pen", "boushi", "hon"],
    ["kyou", "ashita", "kinou", "ima"],
    ["asa", "hiru", "yoru", "gozen", "gogo"],
    ["iku", "kuru", "kaeru"],
    ["eki", "densha", "basu", "kuruma", "jitensha"],
    ["migi", "hidari", "massugu", "iriguchi", "deguchi"],
    ["eiga", "ongaku", "zasshi", "terebi"],
    ["asagohan", "hirugohan", "bangohan", "gohan"],
    ["getsuyoubi", "kayoubi", "suiyoubi", "mokuyoubi", "kinyoubi", "doyoubi", "nichiyoubi"],
    ["amari", "zenzen", "taitei", "tokidoki", "yoku"],
    ["aru", "iru"],
    ["inu", "neko", "kodomo", "hito"],
    ["mae", "ushiro", "naka", "ue", "shita", "chikaku", "tonari", "aida", "migi", "hidari"]
  ];
  const CONTEXT_PROMPTS = {
    "sumimasen": "You need to get a stranger’s attention politely. What do you say?",
    "itadakimasu": "You are about to begin a meal. What do you say?",
    "gochisousama-deshita": "You have just finished a meal. What do you say?",
    "ittekimasu": "You are leaving home and expect to return. What do you say?",
    "itterasshai": "Someone at home is leaving and will return. What do you say to them?",
    "tadaima": "You have just arrived back home. What do you say?",
    "okaeri-nasai": "Someone has just returned home. What do you say to welcome them?",
    "onegaishimasu": "You are politely making a request. Which expression fits?",
    "kudasai": "You want the shop clerk to give you a specific item. Which expression fits?",
    "douzo": "You are offering an item or inviting someone to go ahead. What do you say?",
    "irasshaimase": "A customer enters your shop. What do you say?",
    "sou-desu-ka": "Someone tells you new information and you respond, ‘I see.’ What do you say?"
  };
  const CONTRASTS_BY_ID = new Map();
  CONTRAST_GROUPS.forEach((group, groupIndex) => group.forEach(id => {
    if (!CONTRASTS_BY_ID.has(id)) CONTRASTS_BY_ID.set(id, new Set());
    CONTRASTS_BY_ID.get(id).add(groupIndex);
  }));
  const $ = selector => document.querySelector(selector);
  const shuffle = values => [...values].sort(() => Math.random() - .5);
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const Scheduler = window.KANA_SPRINT_VOCABULARY_SCHEDULER;
  const MODE_KEYS = ["written", "spoken", "recall", "speaking"];
  const N5_EXAMPLES_BY_WORD_ID = Object.fromEntries(WORDS
    .filter(word => word.n5SourceId && N5_DATA.examples[word.n5SourceId])
    .map(word => [word.id, N5_DATA.examples[word.n5SourceId]]));
  const Examples = { ...N5_EXAMPLES_BY_WORD_ID, ...(window.KANA_SPRINT_VOCABULARY_EXAMPLES || {}) };
  const Breakdowns = window.KANA_SPRINT_VOCABULARY_BREAKDOWNS || {};
  const SpeechDiagnostics = window.KANA_SPRINT_SPEECH_DIAGNOSTICS;
  const UNIFIED_REVIEW_MODEL = "unified-v1";
  const SCOPE_LABELS = { adaptive: "Guided Genki II Course", "n5-guided": "Guided JLPT N5", all: "All vocabulary", genki: "Genki II Course", n5: "JLPT N5", lesson1: "Genki II · Lesson 1", lesson2: "Genki II · Lesson 2", lesson3: "Genki II · Lesson 3", lesson4: "Genki II · Lesson 4", lesson5: "Genki II · Lesson 5", lesson6: "Genki II · Lesson 6", custom: "Custom topics", trouble: "Trouble words" };
  const SCOPE_STAGE_IDS = {
    all: ALL_STAGES.map(stage => stage.id),
    genki: COURSE_STAGES.map(stage => stage.id),
    n5: N5_STAGES.map(stage => stage.id),
    lesson1: COURSE_STAGES.filter(stage => stage.id.startsWith("lesson1-")).map(stage => stage.id),
    lesson2: COURSE_STAGES.filter(stage => stage.id.startsWith("lesson2-")).map(stage => stage.id),
    lesson3: COURSE_STAGES.filter(stage => stage.id.startsWith("lesson3-")).map(stage => stage.id),
    lesson4: COURSE_STAGES.filter(stage => stage.id.startsWith("lesson4-")).map(stage => stage.id),
    lesson5: COURSE_STAGES.filter(stage => stage.id.startsWith("lesson5-")).map(stage => stage.id),
    lesson6: COURSE_STAGES.filter(stage => stage.id.startsWith("lesson6-")).map(stage => stage.id)
  };
  const CHOICE_COUNT_VALUES = ["auto", "4", "6", "8"];
  const JAPANESE_COLLATOR = new Intl.Collator("ja", { usage: "sort", sensitivity: "base", numeric: true });
  const PARTICLE_READINGS = { "は": "wa", "を": "o / wo", "へ": "e", "の": "no", "が": "ga", "に": "ni", "で": "de", "と": "to", "か": "ka", "ね": "ne" };

  function loadBreakdownPreference() {
    try {
      return localStorage.getItem(BREAKDOWN_PREFERENCE_KEY) === "true";
    } catch (error) {
      return false;
    }
  }

  let sentenceBreakdownOpen = loadBreakdownPreference();

  function emptyModeProgress() {
    return { seen: 0, correct: 0, wrong: 0, mastery: 0, lastWasCorrect: null, lastSeen: 0, dueAt: 0, dueQuestion: 0, recentResults: [] };
  }

  function defaultState() {
    return {
      version: VERSION, total: 0, correct: 0, streak: 0, bestStreak: 0,
      questionFormat: "mixed", practiceScope: "adaptive", customStageIds: [COURSE_STAGES[0].id], scopeChangeCount: 0, pace: 50, newWordCredit: 0, unlockedStage: 0, n5UnlockedStage: 0,
      autoPronounce: true, choiceCount: "auto", items: {}, recent: [], savedAt: 0
    };
  }

  function itemState(word) {
    if (!state.items[word.id]) state.items[word.id] = {
      introduced: false, seen: 0, correct: 0, wrong: 0, mastery: 0,
      lastWasCorrect: null, lastSeen: 0, dueAt: 0, dueQuestion: 0, recentResults: [],
      lastMode: "", urgentMode: "", urgentRetryPending: false, reviewModel: UNIFIED_REVIEW_MODEL,
      recentDistractors: [], confusions: {}, modes: {}
    };
    const progress = state.items[word.id];
    if (!Array.isArray(progress.recentDistractors)) progress.recentDistractors = [];
    if (!Array.isArray(progress.recentResults)) progress.recentResults = [];
    if (!progress.confusions || typeof progress.confusions !== "object") progress.confusions = {};
    if (!progress.modes || typeof progress.modes !== "object") {
      progress.modes = { written: { ...emptyModeProgress(), seen: Number(progress.seen) || 0, correct: Number(progress.correct) || 0, wrong: Number(progress.wrong) || 0, mastery: Number(progress.mastery) || 0, lastWasCorrect: progress.lastWasCorrect ?? null, lastSeen: Number(progress.lastSeen) || 0, dueAt: Number(progress.dueAt) || 0 } };
    }
    MODE_KEYS.forEach(mode => {
      progress.modes[mode] = { ...emptyModeProgress(), ...(progress.modes[mode] || {}) };
      progress.modes[mode].seen = Math.max(0, Number(progress.modes[mode].seen) || 0);
      progress.modes[mode].correct = Math.max(0, Number(progress.modes[mode].correct) || 0);
      progress.modes[mode].wrong = Math.max(0, Number(progress.modes[mode].wrong) || 0);
      progress.modes[mode].mastery = clamp(Number(progress.modes[mode].mastery) || 0, 0, 100);
      progress.modes[mode].lastSeen = Math.max(0, Number(progress.modes[mode].lastSeen) || 0);
      progress.modes[mode].dueAt = Math.max(0, Number(progress.modes[mode].dueAt) || 0);
      progress.modes[mode].dueQuestion = Math.max(0, Number(progress.modes[mode].dueQuestion) || 0);
      if (!Array.isArray(progress.modes[mode].recentResults)) progress.modes[mode].recentResults = [];
    });
    if (progress.reviewModel !== UNIFIED_REVIEW_MODEL) {
      const attempted = MODE_KEYS
        .map(mode => [mode, progress.modes[mode]])
        .filter(([, mode]) => mode.seen > 0);
      const totalSeen = attempted.reduce((sum, [, mode]) => sum + mode.seen, 0);
      const totalCorrect = attempted.reduce((sum, [, mode]) => sum + mode.correct, 0);
      const totalWrong = attempted.reduce((sum, [, mode]) => sum + mode.wrong, 0);
      const weightedMastery = totalSeen
        ? attempted.reduce((sum, [, mode]) => sum + mode.mastery * mode.seen, 0) / totalSeen
        : Number(progress.mastery) || 0;
      const latest = [...attempted].sort(([, left], [, right]) => right.lastSeen - left.lastSeen)[0];
      const dueQuestions = attempted.map(([, mode]) => mode.dueQuestion).filter(Boolean);
      const dueTimes = attempted.map(([, mode]) => mode.dueAt).filter(Boolean);
      const latestMode = latest?.[0] || progress.lastMode || "";
      const latestProgress = latest?.[1];
      progress.seen = totalSeen || Math.max(0, Number(progress.seen) || 0);
      progress.correct = totalSeen ? totalCorrect : Math.max(0, Number(progress.correct) || 0);
      progress.wrong = totalSeen ? totalWrong : Math.max(0, Number(progress.wrong) || 0);
      progress.mastery = clamp(weightedMastery, 0, 100);
      progress.lastSeen = latestProgress?.lastSeen || Math.max(0, Number(progress.lastSeen) || 0);
      progress.lastWasCorrect = latestProgress?.lastWasCorrect ?? progress.lastWasCorrect ?? null;
      progress.lastMode = latestMode;
      progress.dueQuestion = dueQuestions.length ? Math.min(...dueQuestions) : Math.max(0, Number(progress.dueQuestion) || 0);
      progress.dueAt = dueTimes.length ? Math.min(...dueTimes) : Math.max(0, Number(progress.dueAt) || 0);
      progress.recentResults = attempted.flatMap(([, mode]) => mode.recentResults).slice(-8);
      progress.urgentRetryPending = progress.lastWasCorrect === false;
      progress.urgentMode = progress.urgentRetryPending ? latestMode : "";
      if (progress.urgentRetryPending && !progress.dueQuestion && !progress.dueAt) progress.dueQuestion = state.total + 1;
      progress.reviewModel = UNIFIED_REVIEW_MODEL;
    }
    progress.seen = Math.max(0, Number(progress.seen) || 0);
    progress.correct = Math.max(0, Number(progress.correct) || 0);
    progress.wrong = Math.max(0, Number(progress.wrong) || 0);
    progress.mastery = clamp(Number(progress.mastery) || 0, 0, 100);
    progress.lastSeen = Math.max(0, Number(progress.lastSeen) || 0);
    progress.dueAt = Math.max(0, Number(progress.dueAt) || 0);
    progress.dueQuestion = Math.max(0, Number(progress.dueQuestion) || 0);
    progress.lastMode = typeof progress.lastMode === "string" ? progress.lastMode : "";
    progress.urgentMode = typeof progress.urgentMode === "string" ? progress.urgentMode : "";
    progress.urgentRetryPending = Boolean(progress.urgentRetryPending);
    return progress;
  }

  function modeState(word, mode) { return itemState(word).modes[mode]; }

  function loadState() {
    const fallback = defaultState();
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && saved.version === VERSION) {
        return { ...fallback, ...saved, items: { ...fallback.items, ...(saved.items || {}) } };
      }
    } catch (error) {
      console.warn("Could not load vocabulary progress.", error);
    }
    return fallback;
  }

  let state = loadState();
  if (state.questionFormat === "both") state.questionFormat = "mixed";
  if (!["written", "spoken", "recall", "speaking", "written-both", "audio-both", "mixed"].includes(state.questionFormat)) state.questionFormat = "mixed";
  if (state.practiceScope === "core") state.practiceScope = "genki";
  if (state.practiceScope === "extras") state.practiceScope = "n5";
  if (!Object.hasOwn(SCOPE_LABELS, state.practiceScope)) state.practiceScope = "adaptive";
  const legacyCustomIds = Array.isArray(state.customStageIds) ? state.customStageIds : [];
  const legacyPracticalIds = new Set(legacyCustomIds.filter(id => ["practical-extras", "practical-navigation"].includes(id)));
  const migratedN5TopicIds = N5_DATA.words
    .filter(word => word.existingWordIds.some(id => legacyPracticalIds.has(ORIGINAL_WORDS_BY_ID.get(id)?.stageId)))
    .map(word => `n5-topic-${word.topicId}`);
  state.customStageIds = [...new Set([...legacyCustomIds, ...migratedN5TopicIds])]
    .filter(id => ALL_STAGES.some(stage => stage.id === id));
  if (!state.customStageIds.length) state.customStageIds = [COURSE_STAGES[0].id];
  state.choiceCount = CHOICE_COUNT_VALUES.includes(String(state.choiceCount)) ? String(state.choiceCount) : "auto";
  state.scopeChangeCount = clamp(Number(state.scopeChangeCount) || 0, 0, 3);
  state.pace = clamp(Number(state.pace) || 50, 10, 90);
  state.newWordCredit = clamp(Number(state.newWordCredit) || 0, 0, 1);
  state.unlockedStage = clamp(Number(state.unlockedStage) || 0, 0, COURSE_STAGES.length - 1);
  state.n5UnlockedStage = clamp(Number(state.n5UnlockedStage) || 0, 0, Math.max(0, N5_STAGES.length - 1));
  let current = null;
  let phase = "idle";
  let questionNumber = 0;
  let lastFormat = "";
  let audioFormatCounts = { spoken: 0, speaking: 0 };
  let currentChoiceIds = [];
  let currentChoiceCount = 4;
  let currentMode = "written";
  let currentContext = "";
  let currentReason = "Getting ready";
  let lastRegularScope = state.practiceScope === "trouble" ? "adaptive" : state.practiceScope;
  const sessionStartedTotal = state.total;
  const sessionStartedCorrect = state.correct;
  let speechSession = null;
  let speechStatus = "idle";
  let typedAnswer = false;
  let typingScript = state.typingScript === "romaji" ? "romaji" : "japanese";
  let speechEvidence = null;
  let currentSpeechPrompt = null;
  let scopeDraft = "adaptive";
  let scopeStageDraft = new Set(state.customStageIds);
  let scopeDialogView = "tracks";
  let scopeTrackDraft = "genki";
  let scopeTopicTrack = "n5";
  let scopeNudgeDelayTimer = 0;
  let scopeNudgeEndTimer = 0;
  let curriculumStageId = COURSE_STAGES[0].id;
  let curriculumFilter = "all";
  let curriculumSort = "accuracy-low";

  function updateSpeakingKeyboardHint() {
    const hint = $("#vocabKeyboardHint");
    if (!hint || phase !== "question" || currentMode !== "speaking") return;
    const hasAnswer = Boolean($("#vocabSpeechText")?.value.trim());
    if (typedAnswer) {
      hint.innerHTML = hasAnswer
        ? "Press <kbd>Enter</kbd> to submit your typed answer."
        : "Type an answer to enable Submit answer.";
      return;
    }
    const messages = {
      idle: "Press <kbd>Enter</kbd> to start speaking.",
      starting: "Press <kbd>Enter</kbd> to stop recording.",
      listening: "Press <kbd>Enter</kbd> to stop recording.",
      processing: "Finishing transcription…",
      review: "Press <kbd>Enter</kbd> to submit · <kbd>R</kbd> to try again.",
      accepted: "Correct answer recognized…",
      mismatch: "Press <kbd>R</kbd> to try again, or type your answer.",
      error: "Press <kbd>Enter</kbd> to try again, or type your answer.",
    };
    hint.innerHTML = messages[speechStatus] || "";
  }

  function setSpeechStatus(status, message) {
    speechStatus = status;
    const element = $("#vocabSpeechStatus");
    element.dataset.status = status;
    element.textContent = message;
    updateSpeakingKeyboardHint();
  }

  function updateInterpretation(value, visible = true) {
    const interpreted = Speaking.interpretation(WORDS, value, current);
    $("#vocabSpeechKana").textContent = interpreted || "Kana interpretation unavailable";
    $("#vocabSpeechInterpretation").classList.toggle("hidden", !visible);
    $("#vocabSpeechInterpretation").classList.toggle("is-unavailable", !interpreted);
  }

  function setTypingScript(script) {
    typingScript = script === "romaji" ? "romaji" : "japanese";
    state.typingScript = typingScript;
    $("#vocabTypeJapanese").setAttribute("aria-pressed", String(typingScript === "japanese"));
    $("#vocabTypeRomaji").setAttribute("aria-pressed", String(typingScript === "romaji"));
    const input = $("#vocabSpeechText");
    input.lang = typingScript === "romaji" ? "en" : "ja";
    input.placeholder = typingScript === "romaji" ? "Type romaji, for example mizu" : "Type kana or kanji";
    $("#vocabSpeechTextLabel").textContent = typingScript === "romaji" ? "Your romaji answer" : "Your Japanese answer";
    $("#vocabRomajiPreview").classList.toggle("hidden", typingScript !== "romaji");
    input.value = "";
    $("#vocabRomajiKana").textContent = "—";
    $("#vocabSpeechSubmit").disabled = true;
    if (typedAnswer) setSpeechStatus("typed", typingScript === "romaji" ? "Type in romaji. Check the kana preview, then submit." : "Type in Japanese, then submit.");
    input.focus();
  }

  function stopSpeaking() {
    speechSession?.cancel();
    speechSession = null;
  }

  function setupSpeaking() {
    typedAnswer = false;
    speechStatus = "idle";
    const input = $("#vocabSpeechText");
    input.value = "";
    input.readOnly = true;
    input.lang = "ja";
    input.placeholder = "Your browser transcript will appear here";
    $("#vocabSpeechTextLabel").textContent = "We heard";
    $("#vocabSpeaking").querySelectorAll("button,input").forEach(control => { control.disabled = false; });
    $("#vocabSpeechActions").classList.remove("hidden");
    $("#vocabTypingModes").classList.add("hidden");
    $("#vocabRomajiPreview").classList.add("hidden");
    $("#vocabSpeechInterpretation").classList.add("hidden");
    $("#vocabSpeechSubmit").classList.add("hidden");
    $("#vocabSpeechSubmit").disabled = true;
    $("#vocabRecord").textContent = "🎤 Speak";
    $("#vocabRecord").removeAttribute("aria-keyshortcuts");
    $("#vocabRecord").setAttribute("aria-pressed", "false");
    $("#vocabTypeInstead").textContent = "Type instead";
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    $("#vocabRecord").disabled = !Recognition;
    setSpeechStatus(Recognition ? "idle" : "error", Recognition
      ? "Press Speak when you’re ready. Review your words before submitting."
      : "Speech recognition isn’t available in this browser. Try Chrome or type your answer.");
    if (Recognition) speechSession = Speaking.createSession(Recognition, snapshot => {
      input.value = snapshot.text;
      const correctFinalTranscript = snapshot.status === "review" && Speaking.matchesSpoken(current, snapshot.text);
      if (snapshot.attemptId && ["review", "error"].includes(snapshot.status)) {
        SpeechDiagnostics?.addAttempt(speechEvidence, {
          attemptId: snapshot.attemptId,
          outcome: correctFinalTranscript ? "accepted" : snapshot.status === "review" ? "mismatch" : "error",
          transcript: snapshot.text,
          confidence: snapshot.confidence,
          errorCode: snapshot.errorCode,
          durationMs: snapshot.durationMs,
        });
      }
      if (snapshot.status === "review" && !correctFinalTranscript) {
        setSpeechStatus("mismatch", "That doesn’t match yet. Try speaking again or type your answer.");
        updateInterpretation("", false);
      } else if (correctFinalTranscript) {
        setSpeechStatus("accepted", "Correct answer recognized.");
        updateInterpretation(snapshot.text, true);
      } else {
        setSpeechStatus(snapshot.status, snapshot.message);
        updateInterpretation(snapshot.text, false);
      }
      const recording = ["starting", "listening", "processing"].includes(speechStatus);
      if (["review", "mismatch"].includes(speechStatus)) {
        $("#vocabRecord").innerHTML = "🎤 Try again <kbd>R</kbd>";
        $("#vocabRecord").setAttribute("aria-keyshortcuts", "R");
      } else {
        $("#vocabRecord").textContent = recording ? (speechStatus === "processing" ? "Processing…" : "Stop recording") : "🎤 Try again";
        $("#vocabRecord").removeAttribute("aria-keyshortcuts");
      }
      $("#vocabRecord").disabled = speechStatus === "processing";
      $("#vocabRecord").setAttribute("aria-pressed", String(recording));
      $("#vocabSpeechSubmit").disabled = speechStatus !== "review" || !snapshot.text.trim();
      if (correctFinalTranscript) {
        const acceptedWord = current;
        queueMicrotask(() => {
          if (phase === "question" && current === acceptedWord && currentMode === "speaking" && !typedAnswer) submitSpeaking(true);
        });
      }
    });
  }

  function submitSpeaking(automaticallyAccepted = false) {
    const automatic = automaticallyAccepted === true;
    if (phase !== "question" || currentMode !== "speaking" || (!automatic && $("#vocabSpeechSubmit").disabled)) return;
    const transcript = $("#vocabSpeechText").value.trim();
    const correct = typedAnswer
      ? (typingScript === "romaji" ? Speaking.matchesRomaji(current, transcript) : Speaking.matches(current, transcript))
      : Speaking.matchesSpoken(current, transcript);
    if (correct) SpeechDiagnostics?.resolve(speechEvidence, typedAnswer ? "typed-correct" : "speech-correct");
    speechEvidence = null;
    // Typed fallback shares recall statistics, but never increases speaking mastery.
    if (typedAnswer) currentMode = "recall";
    const progress = itemState(current);
    const attemptType = typedAnswer ? "typed" : "speech";
    progress.inputAttempts ||= {};
    progress.inputAttempts[attemptType] = (Number(progress.inputAttempts[attemptType]) || 0) + 1;
    $("#vocabSpeechActions").classList.add("hidden");
    $("#vocabTypingModes").classList.add("hidden");
    answer(correct ? current.id : "");
    const submitted = document.createElement("p");
    submitted.textContent = `${typedAnswer ? "Typed answer" : "You said"}: ${transcript}`;
    $("#vocabFeedback").appendChild(submitted);
  }

  function saveState() {
    unlockedStageIndex();
    state.savedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    renderProgress();
    window.dispatchEvent(new CustomEvent("kana-sprint-progress-saved"));
  }

  function wordsInStage(stageId) { return WORDS.filter(word => word.stageIds.includes(stageId)); }
  function stageWords(index) { return wordsInStage(COURSE_STAGES[index]?.id); }
  function n5StageWords(index) { return wordsInStage(N5_STAGES[index]?.id); }
  function stageAverage(index) {
    const words = stageWords(index);
    return words.reduce((sum, word) => sum + itemState(word).mastery, 0) / words.length;
  }
  function stageReady(index) {
    const words = stageWords(index);
    return Scheduler.stageIsReady(words.map(word => itemState(word)));
  }
  function unlockedStageIndex() {
    let index = clamp(Number(state.unlockedStage) || 0, 0, COURSE_STAGES.length - 1);
    while (index < COURSE_STAGES.length - 1 && stageReady(index)) index++;
    state.unlockedStage = Math.max(Number(state.unlockedStage) || 0, index);
    return index;
  }
  function unlockedN5StageIndex() {
    if (!N5_STAGES.length) return 0;
    let index = clamp(Number(state.n5UnlockedStage) || 0, 0, N5_STAGES.length - 1);
    while (index < N5_STAGES.length - 1 && Scheduler.stageIsReady(n5StageWords(index).map(word => itemState(word)))) index++;
    state.n5UnlockedStage = Math.max(Number(state.n5UnlockedStage) || 0, index);
    return index;
  }
  function introducedWords() { return WORDS.filter(word => itemState(word).introduced); }
  function paceLabel() {
    if (state.pace <= 20) return "Review-heavy";
    if (state.pace <= 40) return "Steady";
    if (state.pace <= 60) return "Balanced";
    if (state.pace <= 80) return "Fast";
    return "New-first";
  }

  function paceMixLabel() {
    return `${state.pace}% new / ${100 - state.pace}% review target`;
  }

  function allowedModes() {
    if (state.questionFormat === "written") return ["written"];
    if (state.questionFormat === "spoken") return japaneseSpeechReady() ? ["spoken"] : ["written"];
    if (state.questionFormat === "recall") return ["recall"];
    if (state.questionFormat === "speaking") return ["speaking"];
    if (state.questionFormat === "written-both") return ["written", "recall"];
    if (state.questionFormat === "audio-both") return japaneseSpeechReady() ? ["spoken", "speaking"] : ["speaking"];
    return japaneseSpeechReady() ? ["written", "spoken", "recall"] : ["written", "recall"];
  }

  function modeLabel(mode) {
    return { written: "reading", spoken: "listening", recall: "recall", speaking: "speaking" }[mode] || mode;
  }

  function wordsForScope(scope = state.practiceScope) {
    if (scope === "all") return WORDS;
    if (["genki", "n5", "lesson1", "lesson2", "lesson3", "lesson4", "lesson5", "lesson6"].includes(scope)) {
      const stageIds = SCOPE_STAGE_IDS[scope];
      return WORDS.filter(word => word.stageIds.some(id => stageIds.includes(id)));
    }
    if (scope === "custom") return WORDS.filter(word => word.stageIds.some(id => state.customStageIds.includes(id)));
    if (scope === "trouble") return weakWords();
    if (scope === "n5-guided") {
      const unlockedIds = N5_STAGES.slice(0, unlockedN5StageIndex() + 1).map(stage => stage.id);
      return WORDS.filter(word => word.stageIds.some(id => unlockedIds.includes(id)));
    }
    const unlocked = unlockedStageIndex();
    const unlockedIds = COURSE_STAGES.slice(0, unlocked + 1).map(stage => stage.id);
    return WORDS.filter(word => word.stageIds.some(id => unlockedIds.includes(id)));
  }

  function regularReviewPool(scope = state.practiceScope) {
    const sourceScope = scope === "trouble" ? (lastRegularScope === "trouble" ? "adaptive" : lastRegularScope) : scope;
    if (sourceScope === "adaptive") return introducedWords();
    if (sourceScope === "n5-guided") return wordsForScope("n5").filter(word => itemState(word).introduced);
    return wordsForScope(sourceScope).filter(word => itemState(word).introduced);
  }

  function reviewPoolForScope(scope = state.practiceScope) {
    const pool = regularReviewPool(scope);
    return scope === "trouble" ? weakWords(pool) : pool;
  }

  function scopeShortLabel() {
    return state.practiceScope === "custom"
      ? `${state.customStageIds.length} topic${state.customStageIds.length === 1 ? "" : "s"}`
      : { adaptive: `Genki stage ${unlockedStageIndex() + 1} / ${COURSE_STAGES.length}`, "n5-guided": `N5 topic ${unlockedN5StageIndex() + 1} / ${N5_STAGES.length}`, all: "All words", genki: "Genki II", n5: "JLPT N5", lesson1: "Lesson 1", lesson2: "Lesson 2", lesson3: "Lesson 3", lesson4: "Lesson 4", lesson5: "Lesson 5", lesson6: "Lesson 6", trouble: "Trouble" }[state.practiceScope];
  }

  function regularScope(scope = state.practiceScope) {
    return scope === "trouble" ? lastRegularScope : scope;
  }

  function curriculumTrack(scope = regularScope()) {
    if (["adaptive", "genki", "lesson1", "lesson2", "lesson3", "lesson4", "lesson5", "lesson6"].includes(scope)) return "genki";
    if (["n5-guided", "n5"].includes(scope)) return "n5";
    if (scope === "custom") {
      const hasGenki = state.customStageIds.some(id => SCOPE_STAGE_IDS.genki.includes(id));
      const hasN5 = state.customStageIds.some(id => SCOPE_STAGE_IDS.n5.includes(id));
      if (hasGenki !== hasN5) return hasGenki ? "genki" : "n5";
    }
    return "all";
  }

  function scopeStageIds(scope = regularScope()) {
    if (scope === "adaptive") return COURSE_STAGES.slice(0, unlockedStageIndex() + 1).map(stage => stage.id);
    if (scope === "n5-guided") return N5_STAGES.slice(0, unlockedN5StageIndex() + 1).map(stage => stage.id);
    if (scope === "custom") return state.customStageIds;
    return SCOPE_STAGE_IDS[scope] || [];
  }

  function scopeSelectionSummary(scope = regularScope()) {
    if (scope === "adaptive") return "New words follow the guided sequence";
    if (scope === "n5-guided") {
      const stage = N5_STAGES[unlockedN5StageIndex()];
      return stage ? `Current topic: ${stage.name.replace(/^JLPT N5 · /, "")}` : "New words follow the guided N5 sequence";
    }
    const ids = scopeStageIds(scope);
    const count = WORDS.filter(word => word.stageIds.some(id => ids.includes(id))).length;
    if (scope === "n5") return `${N5_DATA.officialEntryCount} official entries · ${count} practice forms`;
    if (scope !== "custom") return `${count} words`;
    const names = ALL_STAGES.filter(stage => ids.includes(stage.id)).map(stage => stage.name.replace(/^Lesson \d · |^JLPT N5 · /, ""));
    const topicLabel = `${ids.length} topic${ids.length === 1 ? "" : "s"}`;
    const nameSummary = names.length > 2 ? `${names.slice(0, 2).join(" + ")} + ${names.length - 2} more` : names.join(" + ");
    return `${nameSummary} · ${topicLabel} · ${count} words`;
  }

  function scopeSelectionKey(scope = state.practiceScope, customStageIds = state.customStageIds) {
    return scope === "custom" ? `custom:${[...customStageIds].sort().join(",")}` : scope;
  }

  function clearPracticeScopeNudge() {
    const trigger = $("#vocabPracticeScope");
    clearTimeout(scopeNudgeDelayTimer);
    clearTimeout(scopeNudgeEndTimer);
    trigger?.classList.remove("is-onboarding-nudge");
  }

  function nudgePracticeScope() {
    const trigger = $("#vocabPracticeScope");
    clearPracticeScopeNudge();
    if (!trigger || state.scopeChangeCount >= 3) return;
    scopeNudgeDelayTimer = setTimeout(() => {
      if (!$("#vocabSessionControls")?.open || state.scopeChangeCount >= 3) return;
      trigger.classList.add("is-onboarding-nudge");
      scopeNudgeEndTimer = setTimeout(() => trigger.classList.remove("is-onboarding-nudge"), 1700);
    }, 650);
  }

  function wordContextName(word) {
    const selectedStageIds = scopeStageIds();
    const stageId = word.stageIds.find(id => selectedStageIds.includes(id)) || word.stageId;
    return ALL_STAGES.find(stage => stage.id === stageId)?.name || word.stageName;
  }

  function accuracyForWords(words) {
    const attempts = words.reduce((sum, word) => sum + itemState(word).seen, 0);
    const correct = words.reduce((sum, word) => sum + itemState(word).correct, 0);
    return { attempts, correct, percentage: attempts ? Math.round(correct / attempts * 100) : null };
  }

  function scopeChoiceAccuracyMarkup(words) {
    const accuracy = accuracyForWords(words);
    return accuracy.attempts
      ? `<span class="vocab-scope-accuracy"><strong>${accuracy.percentage}%</strong><small>${accuracy.attempts} ${accuracy.attempts === 1 ? "answer" : "answers"}</small></span>`
      : `<span class="vocab-scope-accuracy is-empty"><strong>—</strong><small>Not practised</small></span>`;
  }

  function renderScopeDialog() {
    const dialog = $("#vocabScopeDialog");
    if (!dialog) return;
    dialog.querySelectorAll("[data-scope-view]").forEach(view => { view.hidden = view.dataset.scopeView !== scopeDialogView; });
    dialog.querySelectorAll("[data-scope-track]").forEach(button => {
      button.setAttribute("aria-selected", String(button.dataset.scopeTrack === scopeTrackDraft));
    });
    dialog.querySelectorAll("[data-scope-track-panel]").forEach(panel => {
      panel.hidden = panel.dataset.scopeTrackPanel !== scopeTrackDraft;
    });
    dialog.querySelectorAll("[data-scope-preset]").forEach(button => {
      button.setAttribute("aria-pressed", String(scopeDraft === button.dataset.scopePreset));
    });
    dialog.querySelectorAll(".vocab-scope-lesson-choices [data-scope-preset]").forEach(button => {
      const accuracy = button.querySelector(".vocab-scope-accuracy");
      if (accuracy) accuracy.outerHTML = scopeChoiceAccuracyMarkup(wordsForScope(button.dataset.scopePreset));
    });
    dialog.querySelectorAll("[data-scope-topic]").forEach(input => { input.checked = scopeStageDraft.has(input.value); });
    dialog.querySelectorAll("[data-topic-stage]").forEach(option => {
      const accuracy = option.querySelector(".vocab-scope-accuracy");
      if (accuracy) accuracy.outerHTML = scopeChoiceAccuracyMarkup(wordsInStage(option.dataset.topicStage));
    });
    const topicTrackIds = scopeTopicTrack === "all" ? SCOPE_STAGE_IDS.all : SCOPE_STAGE_IDS[scopeTopicTrack];
    const query = $("#vocabScopeTopicSearch").value.trim().toLocaleLowerCase();
    dialog.querySelectorAll("[data-topic-stage]").forEach(option => {
      const inTrack = topicTrackIds.includes(option.dataset.topicStage);
      option.hidden = !inTrack || (query && !option.textContent.toLocaleLowerCase().includes(query));
    });
    const selectedWords = WORDS.filter(word => word.stageIds.some(id => scopeStageDraft.has(id))).length;
    const count = $("#vocabScopeDraftCount");
    count.textContent = scopeDraft === "adaptive"
      ? "Guided Genki II Course selected"
      : scopeDraft === "n5-guided"
        ? `Guided JLPT N5 · ${scopeSelectionSummary("n5-guided")}`
      : scopeDraft === "n5"
        ? `${N5_DATA.officialEntryCount} official entries · ${selectedWords} practice forms`
        : `${scopeStageDraft.size} topic${scopeStageDraft.size === 1 ? "" : "s"} · ${selectedWords} words`;
    const valid = ["adaptive", "n5-guided"].includes(scopeDraft) || scopeStageDraft.size > 0;
    $("#vocabScopeApply").disabled = !valid;
    $("#vocabScopeApply").textContent = scopeDraft === "adaptive"
      ? "Use guided course"
      : scopeDraft === "n5-guided"
        ? "Use guided N5"
      : scopeDraft === "n5"
        ? "Practice all N5"
        : scopeDraft === "genki"
          ? "Practice entire course"
          : `Practice ${selectedWords} word${selectedWords === 1 ? "" : "s"}`;
    $("#vocabScopeValidation").textContent = valid ? "" : "Select at least one topic.";
    $("#vocabScopeTopicTitle").textContent = scopeTopicTrack === "all" ? "Combine topics" : `Choose ${scopeTopicTrack === "n5" ? "JLPT N5" : "Genki II"} topics`;
    $("#vocabScopeTopicDescription").textContent = scopeTopicTrack === "all"
      ? "Choose any combination across both tracks. Shared words still count once."
      : `Choose one or more topics from the ${scopeTopicTrack === "n5" ? "JLPT N5" : "Genki II Course"} track.`;
  }

  function openScopeDialog() {
    const baseScope = regularScope();
    scopeDraft = baseScope;
    scopeStageDraft = new Set(["adaptive", "n5-guided"].includes(baseScope) ? [] : baseScope === "custom" ? state.customStageIds : SCOPE_STAGE_IDS[baseScope]);
    scopeDialogView = "tracks";
    const selectedN5 = [...scopeStageDraft].filter(id => SCOPE_STAGE_IDS.n5.includes(id)).length;
    const selectedGenki = [...scopeStageDraft].filter(id => SCOPE_STAGE_IDS.genki.includes(id)).length;
    scopeTrackDraft = ["n5", "n5-guided"].includes(baseScope) || selectedN5 > selectedGenki ? "n5" : "genki";
    scopeTopicTrack = scopeTrackDraft;
    $("#vocabScopeTopicSearch").value = "";
    renderScopeDialog();
    const dialog = $("#vocabScopeDialog");
    if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
  }

  function closeScopeDialog() {
    const dialog = $("#vocabScopeDialog");
    if (typeof dialog.close === "function") dialog.close(); else dialog.removeAttribute("open");
  }

  function applyScopeSelection() {
    if (!["adaptive", "n5-guided"].includes(scopeDraft) && !scopeStageDraft.size) return;
    const previousSelection = scopeSelectionKey(regularScope(), state.customStageIds);
    if (scopeDraft === "custom") state.customStageIds = ALL_STAGES.map(stage => stage.id).filter(id => scopeStageDraft.has(id));
    state.practiceScope = scopeDraft;
    if (scopeSelectionKey() !== previousSelection) {
      state.scopeChangeCount = Math.min(3, state.scopeChangeCount + 1);
      if (state.scopeChangeCount >= 3) clearPracticeScopeNudge();
    }
    lastRegularScope = state.practiceScope;
    current = null;
    closeScopeDialog();
    saveState();
    nextQuestion();
  }

  function curriculumWordStatus(word) {
    const progress = itemState(word);
    if (!progress.introduced) return { id: "unintroduced", label: "Not introduced" };
    if (!progress.seen) return { id: "new", label: "New" };
    if (wordIsDue(word)) return { id: "due", label: "Due" };
    if (isMastered(word)) return { id: "mastered", label: "Mastered" };
    return { id: "learning", label: "Learning" };
  }

  function renderCurriculumDialog() {
    const stage = ALL_STAGES.find(candidate => candidate.id === curriculumStageId);
    if (!stage) return;
    const words = wordsInStage(stage.id);
    const progressItems = words.map(word => ({ word, progress: itemState(word), status: curriculumWordStatus(word) }));
    const attempts = progressItems.reduce((sum, item) => sum + item.progress.seen, 0);
    const correct = progressItems.reduce((sum, item) => sum + item.progress.correct, 0);
    const introduced = progressItems.filter(item => item.progress.introduced).length;
    const mastered = progressItems.filter(item => isMastered(item.word)).length;
    const due = progressItems.filter(item => item.status.id === "due").length;
    const query = $("#vocabCurriculumSearch").value.trim().toLocaleLowerCase();
    const visible = progressItems.filter(item => {
      const matchesFilter = curriculumFilter === "all"
        || (curriculumFilter === "learning" && item.progress.introduced && !isMastered(item.word) && item.status.id !== "due")
        || (curriculumFilter === "due" && item.status.id === "due")
        || (curriculumFilter === "mastered" && isMastered(item.word))
        || (curriculumFilter === "unintroduced" && item.status.id === "unintroduced");
      const searchable = `${item.word.jp} ${item.word.romaji} ${item.word.meaning}`.toLocaleLowerCase();
      return matchesFilter && (!query || searchable.includes(query));
    });

    visible.sort((left, right) => {
      if (curriculumSort === "japanese-asc" || curriculumSort === "japanese-desc") {
        const comparison = JAPANESE_COLLATOR.compare(left.word.jp, right.word.jp);
        return curriculumSort === "japanese-desc" ? -comparison : comparison;
      }
      if (curriculumSort === "accuracy-low" || curriculumSort === "accuracy-high") {
        const leftUnattempted = left.progress.seen === 0;
        const rightUnattempted = right.progress.seen === 0;
        if (leftUnattempted !== rightUnattempted) return leftUnattempted ? 1 : -1;
        if (!leftUnattempted) {
          const leftAccuracy = left.progress.correct / left.progress.seen;
          const rightAccuracy = right.progress.correct / right.progress.seen;
          const comparison = curriculumSort === "accuracy-low" ? leftAccuracy - rightAccuracy : rightAccuracy - leftAccuracy;
          if (comparison) return comparison;
          if (left.progress.seen !== right.progress.seen) return right.progress.seen - left.progress.seen;
        }
      }
      return left.word.order - right.word.order;
    });

    $("#vocabCurriculumDialogTitle").textContent = stage.name.replace(" · ", ": ");
    $("#vocabCurriculumDialogDescription").textContent = stage.description;
    $("#vocabCurriculumTopicStats").innerHTML = `
      <div><strong>${introduced}/${words.length}</strong><span>introduced</span></div>
      <div><strong>${mastered}</strong><span>mastered</span></div>
      <div><strong>${due}</strong><span>due</span></div>
      <div><strong>${attempts ? `${Math.round(correct / attempts * 100)}%` : "—"}</strong><span>accuracy · ${attempts} ${attempts === 1 ? "attempt" : "attempts"}</span></div>`;
    $("#vocabCurriculumFilters").querySelectorAll("button").forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.curriculumFilter === curriculumFilter));
    });
    $("#vocabCurriculumWordCount").textContent = `${visible.length} of ${words.length} words`;
    $("#vocabCurriculumSort").value = curriculumSort;
    $("#vocabCurriculumWords").innerHTML = visible.length ? visible.map(({ word, progress, status }) => {
      const accuracy = progress.seen ? `${Math.round(progress.correct / progress.seen * 100)}%` : "—";
      return `<div class="vocab-curriculum-word" data-status="${status.id}">
        <div class="vocab-curriculum-term"><strong lang="ja">${word.jp}</strong><span>${word.romaji}</span></div>
        <div class="vocab-curriculum-meaning">${word.meaning}</div>
        <span class="vocab-word-status">${status.label}</span>
        <div class="vocab-word-accuracy"><strong>${accuracy}</strong><span>${progress.seen} ${progress.seen === 1 ? "attempt" : "attempts"} · ${Math.round(progress.mastery)}% mastery</span></div>
        <button class="vocab-word-speak" type="button" data-word-speak="${word.id}" aria-label="Pronounce ${word.jp}">🔊</button>
      </div>`;
    }).join("") : `<p class="vocab-curriculum-empty">No words match this search and filter.</p>`;
  }

  function openCurriculumDialog(stageId) {
    curriculumStageId = stageId;
    curriculumFilter = "all";
    curriculumSort = "accuracy-low";
    $("#vocabCurriculumSearch").value = "";
    renderCurriculumDialog();
    const dialog = $("#vocabCurriculumDialog");
    if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
  }

  function closeCurriculumDialog() {
    const dialog = $("#vocabCurriculumDialog");
    if (typeof dialog.close === "function") dialog.close(); else dialog.removeAttribute("open");
  }

  function practiseCurriculumTopic() {
    state.customStageIds = [curriculumStageId];
    state.practiceScope = "custom";
    lastRegularScope = "custom";
    current = null;
    closeCurriculumDialog();
    saveState();
    nextQuestion();
    $("#panel-vocabulary").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function weakWords(words = reviewPoolForScope()) {
    return words.filter(word => {
      const progress = itemState(word);
      const recentAccuracy = Scheduler.recentAccuracy(progress.recentResults);
      return progress.wrong > 0 && (progress.lastWasCorrect === false || progress.mastery < 40 || (recentAccuracy !== null && recentAccuracy < .6));
    });
  }

  function wordIsDue(word, now = Date.now()) {
    return Scheduler.reviewIsDue(itemState(word), state.total, now);
  }

  function urgentReviewEntries(words, now = Date.now()) {
    const modes = allowedModes();
    return words.flatMap(word => {
      const progress = itemState(word);
      if (!progress.urgentRetryPending || !progress.urgentMode || !modes.includes(progress.urgentMode) || !wordIsDue(word, now)) return [];
      return [{ word, mode: progress.urgentMode }];
    });
  }

  function chooseMode(word, onlyDue = false) {
    const modes = allowedModes();
    return [...modes].sort((left, right) => {
      const a = modeState(word, left);
      const b = modeState(word, right);
      if ((a.seen === 0) !== (b.seen === 0)) return a.seen === 0 ? -1 : 1;
      return Scheduler.reviewScore(b, 0) - Scheduler.reviewScore(a, 0);
    })[0] || "written";
  }

  function dueReviewBreakdown() {
    const pool = reviewPoolForScope();
    const words = pool.filter(word => wordIsDue(word));
    const urgent = urgentReviewEntries(words).length;
    return {
      total: words.length,
      words: words.length,
      urgent
    };
  }

  function dueReviewSummary(breakdown = dueReviewBreakdown()) {
    return `${breakdown.words} due word${breakdown.words === 1 ? "" : "s"}`;
  }

  function selectWord() {
    const adaptive = state.practiceScope === "adaptive";
    const guidedN5 = state.practiceScope === "n5-guided";
    const guided = adaptive || guidedN5;
    const stageIndex = guidedN5 ? unlockedN5StageIndex() : unlockedStageIndex();
    const pool = wordsForScope();
    const reviewPool = adaptive ? introducedWords() : guidedN5 ? wordsForScope("n5").filter(word => itemState(word).introduced) : pool;
    const unseenPool = adaptive ? stageWords(stageIndex) : guidedN5 ? n5StageWords(stageIndex) : pool;
    const unseen = unseenPool.filter(word => !itemState(word).introduced)
      .sort((a, b) => a.stageIndex - b.stageIndex || a.order - b.order);
    const introduced = reviewPool.filter(word => itemState(word).introduced);
    if (state.practiceScope === "trouble") {
      if (!introduced.length) {
        state.practiceScope = lastRegularScope;
        return selectWord();
      }
      return { ...selectReviewWord(introduced, new Set(state.recent.slice(-5)), false), introduce: false, reason: "Trouble-word review" };
    }
    if (!introduced.length && unseen.length) return { word: unseen[0], mode: allowedModes()[0], introduce: true, reason: "Introducing the first word" };
    const recent = new Set(state.recent.slice(-5));
    const incomplete = introduced.filter(word => itemState(word).seen === 0);
    if (incomplete.length) return { ...selectReviewWord(incomplete, recent, false), introduce: false, reason: "Completing the first practice check" };
    const due = introduced.filter(word => wordIsDue(word));
    const urgent = urgentReviewEntries(introduced);
    if (urgent.length) return { ...selectReviewEntry(urgent), introduce: false, reason: "Urgent review" };
    if (unseen.length) {
      const decision = Scheduler.nextIntroductionDecision(state.pace, state.newWordCredit);
      state.newWordCredit = decision.credit;
      if (decision.introduce) return { word: unseen[0], mode: allowedModes()[0], introduce: true, reason: "Introducing a new word" };
    }
    if (due.length) return { ...selectReviewWord(due, recent, true), introduce: false, reason: "Due review" };
    if (unseen.length) {
      const scheduled = introduced.filter(word => allowedModes().some(mode => modeState(word, mode).seen > 0));
      const scheduledChoice = selectReviewWord(scheduled, recent, false, false);
      if (scheduledChoice.word) return { ...scheduledChoice, introduce: false, reason: "Adaptive review" };
      return { word: unseen[0], mode: allowedModes()[0], introduce: true, reason: "Building the review pool" };
    }
    return { ...selectReviewWord(introduced, recent, false), introduce: false, reason: guided ? "Reviewing the current stage" : "Adaptive review" };
  }

  function selectReviewWord(words, recent, onlyDue, allowRecent = true) {
    let candidates = words.filter(word => !recent.has(word.id));
    if (!candidates.length && allowRecent) candidates = words;
    const scored = candidates.map(word => {
      const mode = chooseMode(word, onlyDue);
      return { word, mode, score: Scheduler.reviewScore(itemState(word)) };
    }).sort((a, b) => b.score - a.score);
    return scored[0] || { word: null, mode: "written" };
  }

  function selectReviewEntry(entries) {
    const scored = entries.map(entry => ({ ...entry, score: Scheduler.reviewScore(itemState(entry.word)) }));
    const best = scored.sort((left, right) => right.score - left.score)[0];
    return best ? { word: best.word, mode: best.mode } : { word: null, mode: "written" };
  }

  function japaneseSpeechReady() {
    return Boolean(window.KANA_SPRINT_SPEECH?.hasJapaneseVoice?.());
  }
  function speak(word) { return window.KANA_SPRINT_SPEECH?.speakJapanese?.(word.jp); }
  function speakExample(word) { return window.KANA_SPRINT_SPEECH?.speakJapanese?.(Examples[word.id]?.[0]); }
  function highlightExample(sentence, focus) {
    const index = sentence.indexOf(focus);
    if (index < 0) return sentence;
    return `${sentence.slice(0, index)}<mark>${focus}</mark>${sentence.slice(index + focus.length)}`;
  }
  function escapeExampleText(value) {
    return String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  }
  function particleUsageText(role, before, after, predicate) {
    const context = {
      "Time particle": `It follows ${before} and marks it as when ${predicate} happens.`,
      "Object particle": `It follows ${before} and marks it as the direct object of ${predicate}.`,
      "Action-place particle": `It follows ${before} and marks it as the place where ${predicate} happens.`,
      "Companion particle": `It follows ${before} and marks that person as joining in ${predicate}.`,
      "Meeting particle": `With a verb such as ${predicate}, it marks ${before} as the person being met.`,
      "Noun-linking particle": `It links ${before} to ${after}, so ${after} is understood in relation to ${before}.`,
      "Possessive particle": `It links ${before} to ${after}, showing ownership or a close association.`,
      "Occasion particle": `It marks ${before} as the occasion or setting in which ${predicate} happens.`,
      "Purpose / occasion particle": `It makes ${before} the purpose or occasion for the action that follows.`,
      "Time-boundary particle": `It completes the expression ${before}で and sets it as the time boundary for the following action.`,
      "Topic particle": `It sets ${before} as what the sentence is about; the rest of the sentence comments on it.`,
      "Topic / contrast particle": `It sets ${before} as the topic and can contrast it with another time or thing.`,
      "Direction particle": `It follows ${before} and points toward it as the direction or destination of ${predicate}.`,
      "Means particle": `It follows ${before} and marks it as the language or means used for ${predicate}.`,
      "Subject particle": `It marks ${before} as the subject—the person or thing performing ${predicate}.`,
      "Destination particle": `It follows ${before} and marks it as the destination reached by ${predicate}.`,
      "Ability particle": `With ${predicate}, it marks ${before} as the thing understood or known.`,
      "Question particle": "At the end of a polite sentence, it turns the statement into a question.",
      "Agreement particle": "At the end of the sentence, it invites agreement or shows the speaker is considering what was said.",
      "Shared-feeling particle": "At the end of the sentence, it invites the listener to share or confirm the speaker’s feeling."
    };
    return context[role] || `Here it follows ${before} and functions as a ${role.toLowerCase()}.`;
  }
  function particlePronunciationNote(particle) {
    if (particle === "は") return "Written は, but pronounced wa when it is a particle.";
    if (particle === "を") return "Usually pronounced o in modern Japanese; wo is also used in romanization.";
    if (particle === "へ") return "Written へ, but pronounced e when it marks direction.";
    return "";
  }
  function particleGuideMarkup(parts) {
    const predicatePart = [...parts].reverse().find(part => /(Action|Movement|State|Description|Invitation)/.test(part[2])) || parts.at(-1);
    const predicate = predicatePart ? `${predicatePart[0]} (“${predicatePart[1]}”)` : "the sentence ending";
    const particles = parts.flatMap((part, index) => {
      if (part[3] !== "particle") return [];
      const before = parts[index - 1]?.[0] || "the preceding phrase";
      const after = parts[index + 1]?.[0] || "the sentence ending";
      return [{ particle: part[0], role: part[2], before, after }];
    });
    if (!particles.length) return "";
    const cards = particles.map(({ particle, role, before, after }) => {
      const pronunciation = PARTICLE_READINGS[particle] || "particle";
      const note = particlePronunciationNote(particle);
      return `<article class="vocab-particle-card"><header><strong lang="ja">${escapeExampleText(particle)}</strong><span>${escapeExampleText(pronunciation)}</span><em>${escapeExampleText(role)}</em></header><p>${escapeExampleText(particleUsageText(role, before, after, predicate))}</p>${note ? `<small>${escapeExampleText(note)}</small>` : ""}</article>`;
    }).join("");
    return `<section class="vocab-particle-guide" aria-label="Particles in this sentence"><h4>Particles in this sentence</h4><div>${cards}</div></section>`;
  }
  function sentenceChunkLabels(sentence, parts) {
    let cursor = 0;
    return parts.map((part, index) => {
      const japanese = part[0];
      const start = sentence.indexOf(japanese, cursor);
      if (start < 0) return japanese;
      const end = start + japanese.length;
      const nextJapanese = parts[index + 1]?.[0];
      const nextStart = nextJapanese ? sentence.indexOf(nextJapanese, end) : sentence.length;
      const punctuation = sentence.slice(end, nextStart < 0 ? end : nextStart);
      cursor = end + punctuation.length;
      return `${japanese}${punctuation}`;
    });
  }
  function sentenceChunkMeaning(meaning, role) {
    if (meaning !== "—") return meaning;
    return role.replace(/ particle$/i, " marker").toLowerCase();
  }
  function sentenceChunksMarkup(sentence, parts) {
    const labels = sentenceChunkLabels(sentence, parts);
    const chips = parts.map(([japanese, meaning, role, kind], index) => {
      const kindAttribute = kind ? ` data-kind="${escapeExampleText(kind)}"` : "";
      const separator = index ? `<span class="vocab-sentence-plus" aria-hidden="true">+</span>` : "";
      return `<span class="vocab-sentence-term" role="listitem">${separator}<span class="vocab-sentence-chunk"${kindAttribute} title="${escapeExampleText(role)}"><strong lang="ja">${escapeExampleText(labels[index])}</strong><small>${escapeExampleText(sentenceChunkMeaning(meaning, role))}</small></span></span>`;
    }).join("");
    return `<section class="vocab-sentence-map" aria-label="Sentence meaning, chunk by chunk"><header><strong>How this sentence fits together</strong><span>Japanese + meaning</span></header><div class="vocab-sentence-equation" role="list">${chips}</div></section>`;
  }
  function exampleBreakdownMarkup(word) {
    const breakdown = Breakdowns[word.id];
    if (!breakdown) return "";
    const [parts, structure] = breakdown;
    const sentence = Examples[word.id]?.[0] || parts.map(part => part[0]).join("");
    return `<details class="vocab-example-breakdown"${sentenceBreakdownOpen ? " open" : ""}><summary>Break down this sentence<span aria-hidden="true">›</span></summary><div class="vocab-example-breakdown-body">${sentenceChunksMarkup(sentence, parts)}${particleGuideMarkup(parts)}<p><strong>Structure</strong>${escapeExampleText(structure)}</p></div></details>`;
  }
  function rememberBreakdownPreference(details) {
    if (!details) return;
    details.addEventListener("toggle", () => {
      sentenceBreakdownOpen = details.open;
      try {
        localStorage.setItem(BREAKDOWN_PREFERENCE_KEY, String(details.open));
      } catch (error) {
        console.warn("Could not remember the sentence breakdown preference.", error);
      }
    });
  }
  function nextQuestionFormat(word, preferredMode, urgentRetry = false) {
    if (state.questionFormat === "audio-both") {
      const modes = allowedModes();
      const preferred = modes.includes(preferredMode) ? preferredMode : modes[0];
      const next = modes.length === 1 ? preferred : Scheduler.balancedAudioMode(preferred, audioFormatCounts, urgentRetry);
      audioFormatCounts[next]++;
      return next;
    }
    if (preferredMode && allowedModes().includes(preferredMode)) return preferredMode;
    const modes = allowedModes();
    const weakest = [...modes].sort((left, right) => modeState(word, left).mastery - modeState(word, right).mastery);
    const minimum = modeState(word, weakest[0]).mastery;
    const tied = weakest.filter(mode => modeState(word, mode).mastery === minimum);
    const next = tied.find(mode => mode !== lastFormat) || tied[0] || modes[0];
    lastFormat = next;
    return next;
  }

  function buildUI() {
    const tab = document.createElement("button");
    tab.className = "tab";
    tab.dataset.tab = "vocabulary";
    tab.textContent = "Vocabulary";
    const group = $('.tab-group[data-nav-group="words"] .tab-group-tabs');
    const anchor = group?.querySelector('.tab[data-tab="wordprogress"]');
    if (anchor) anchor.before(tab); else if (group) group.appendChild(tab); else $(".tabs").appendChild(tab);

    const panel = document.createElement("section");
    panel.className = "panel";
    panel.id = "panel-vocabulary";
    panel.innerHTML = `
      <div class="trainer vocab-trainer" data-trainer="vocabulary">
        <div class="trainer-top"><div class="mode-tag"><span class="dot"></span><span id="vocabPracticeMode">Vocabulary • adaptive practice</span></div><div class="tiny" id="vocabCount">Question 1</div></div>
        <div class="vocab-introduction hidden" id="vocabIntroduction"></div>
        <div id="vocabQuestion">
          <div class="question">
            <div class="question-label" id="vocabQuestionLabel">Choose the English meaning</div>
            <div class="prompt word vocab-prompt" id="vocabPrompt">こんにちは</div><div class="vocab-speaking-cue hidden" id="vocabSpeakingCue"></div>
          <div class="word-audio-prompt hidden" id="vocabAudioPrompt"><span class="word-audio-icon" aria-hidden="true">🔊</span><strong>Listen to the Japanese expression</strong><button class="big-button" id="vocabQuestionSpeech" type="button" aria-keyshortcuts="R">Play again <kbd>R</kbd></button></div>
          </div>
          <div class="vocab-options" id="vocabOptions"></div>
          <div class="vocab-speaking hidden" id="vocabSpeaking">
            <p id="vocabSpeechStatus" role="status" aria-live="polite"></p>
            <div class="vocab-transcript"><label for="vocabSpeechText" id="vocabSpeechTextLabel">We heard</label><input id="vocabSpeechText" lang="ja" readonly autocomplete="off" placeholder="Your Japanese words will appear here" aria-describedby="vocabSpeechStatus"></div>
            <div class="vocab-interpretation hidden" id="vocabSpeechInterpretation"><span>Interpreted as</span><strong id="vocabSpeechKana" lang="ja"></strong><small>Browser transcript is shown above.</small></div>
            <div class="vocab-typing-modes hidden" id="vocabTypingModes" aria-label="Typing script"><span>Type with</span><div class="vocab-segmented"><button id="vocabTypeJapanese" type="button" aria-pressed="true">Japanese</button><button id="vocabTypeRomaji" type="button" aria-pressed="false">Romaji</button></div></div>
            <div class="vocab-romaji-preview hidden" id="vocabRomajiPreview"><span>Kana preview</span><strong id="vocabRomajiKana" lang="ja">—</strong></div>
            <div class="actions" id="vocabSpeechActions"><button class="big-button" id="vocabRecord" type="button">🎤 Speak</button><button class="ghost" id="vocabTypeInstead" type="button">Type instead</button><button class="big-button hidden" id="vocabSpeechSubmit" type="button" disabled>Submit answer</button></div>
            <p class="tiny">Your browser may send audio to its speech service. Recognition retries don’t affect your streak. This checks word recall, not pronunciation quality.</p>
          </div>
          <div class="feedback" id="vocabFeedback"></div>
        </div>
        <div class="footer-actions"><div class="actions"><button class="ghost" id="vocabDontKnow">I don’t know</button><button class="ghost hidden" id="vocabNext">Next <kbd>Enter</kbd></button></div><span class="tiny" id="vocabKeyboardHint">Use <kbd>1</kbd>–<kbd>4</kbd> to choose an answer.</span></div>
      </div>
      <details class="card vocab-setup-card" id="vocabSessionControls">
        <summary><span><strong>Session controls</strong><small id="vocabPaceStatus">Balanced introduction and review</small></span></summary>
        <div class="vocab-setup">
          <div><h2>Vocabulary practice</h2><p class="muted">Guided practice moves through Genki II lessons or JLPT N5 topics in order. You can also practise a whole track or combine topics. Changing the format changes the question, not the word’s review schedule.</p></div>
          <div class="vocab-scope-field"><span>Practice scope</span><button class="vocab-scope-trigger" id="vocabPracticeScope" type="button" aria-haspopup="dialog" aria-controls="vocabScopeDialog"><strong id="vocabScopeLabel">Guided Genki II Course</strong><span aria-hidden="true">›</span></button><small id="vocabScopeHint">New words follow the Genki II sequence.</small></div>
          <label><span>Practice format</span><select id="vocabQuestionFormat"><option value="mixed">Mixed practice (no speaking)</option><option value="written-both">Japanese ↔ English (written)</option><option value="audio-both">Japanese ↔ English (listen &amp; speak)</option><option value="written">Read Japanese → choose English</option><option value="spoken">Listen to Japanese → choose English</option><option value="recall">Read English → choose Japanese</option><option value="speaking">English prompt → speak Japanese</option></select><small id="vocabFormatHint" aria-live="polite"></small></label>
          <label><span>Answer choices</span><select id="vocabChoiceCount"><option value="auto">Auto (adaptive)</option><option value="4">4 choices</option><option value="6">6 choices</option><option value="8">8 choices</option><option value="not-used" disabled>Not used for speaking</option></select><small id="vocabChoiceCountHint">Auto uses 4, 6, or 8 choices based on mastery.</small></label>
          <label class="vocab-pace"><span>New-word pace: <strong id="vocabPaceName">Balanced</strong></span><input id="vocabPace" type="range" min="10" max="90" step="10"><span class="vocab-pace-labels"><span>More review</span><span>More new</span></span></label>
          <div class="vocab-due-summary" aria-live="polite"><span class="tiny">Review queue</span><strong id="vocabDueSummary">No words due</strong><small id="vocabDueBreakdown">Guided Genki II Course · one shared review queue · prompts adapt across enabled formats</small></div>
          <div class="vocab-inline-playback"><div class="vocab-inline-playback-copy"><label class="toggle-line"><input type="checkbox" id="vocabAutoPronounce"> Automatically pronounce revealed words</label><small class="vocab-inline-playback-note">Listening questions already play the prompt. Use Replay word when needed.</small></div><button class="ghost" id="vocabManageVoices" type="button">Manage voices</button></div>
        </div>
      </details>
      <div class="vocab-below">
        <div class="card"><h2>Practice coverage</h2><p class="muted">One shared review schedule; these direction stats help choose the next prompt.</p><div class="vocab-direction-grid"><div><span>Japanese → English</span><strong id="vocabWrittenMastery">0%</strong><small id="vocabWrittenRecent">Not practised</small></div><div><span>Listening</span><strong id="vocabSpokenMastery">0%</strong><small id="vocabSpokenRecent">Not practised</small></div><div><span>English → Japanese</span><strong id="vocabRecallMastery">0%</strong><small id="vocabRecallRecent">Not practised</small></div><div><span>Speaking</span><strong id="vocabSpeakingMastery">0%</strong><small id="vocabSpeakingRecent">Not practised</small></div></div></div>
        <div class="card vocab-trouble-card"><div class="vocab-section-heading"><div><h2>Trouble words</h2><p class="muted" id="vocabTroubleHint">Recent misses in the selected scope matter more than old mistakes.</p></div><button class="ghost" id="vocabReviewTrouble" type="button">Review trouble words</button></div><div class="vocab-trouble-list" id="vocabTroubleList"></div></div>
      </div>
      <details class="card vocab-curriculum-card"><summary><span><strong id="vocabCurriculumTitle">Genki II Course curriculum</strong><small id="vocabCurriculumSummary">Genki stage 1 of ${COURSE_STAGES.length}</small></span></summary><div class="vocab-curriculum-intro"><p class="muted" id="vocabCurriculumDescription">Browse progress through the topics in your current practice track.</p><button class="ghost" id="vocabCurriculumChangeScope" type="button">Change practice scope</button></div><div class="vocab-stages" id="vocabStages"></div></details>
      <dialog class="vocab-scope-dialog" id="vocabScopeDialog" aria-labelledby="vocabScopeDialogTitle">
        <div class="vocab-scope-dialog-shell">
          <header><div><h2 id="vocabScopeDialogTitle">Choose practice scope</h2><p>Study the Genki II Course, the JLPT N5 list, or any combination of topics.</p></div><button class="vocab-scope-close" id="vocabScopeClose" type="button" aria-label="Close practice scope">×</button></header>
          <div class="vocab-scope-dialog-body">
            <section class="vocab-scope-track-view" data-scope-view="tracks">
              <div class="vocab-scope-track-tabs" role="tablist" aria-label="Vocabulary track">
                <button type="button" role="tab" data-scope-track="genki" aria-selected="true"><strong>Genki II Course</strong><small>Lesson-based study</small></button>
                <button type="button" role="tab" data-scope-track="n5" aria-selected="false"><strong>JLPT N5</strong><small>802 official entries</small></button>
              </div>
              <div class="vocab-scope-track-panel" data-scope-track-panel="genki" role="tabpanel">
                <button class="vocab-scope-choice vocab-scope-choice-primary" type="button" data-scope-preset="adaptive" aria-pressed="false"><span><span class="vocab-scope-choice-title"><strong>Guided Genki II Course</strong><em>Recommended</em></span><small>Continue from your current stage with automatic review.</small></span><i aria-hidden="true"></i></button>
                <button class="vocab-scope-choice" type="button" data-scope-preset="genki" aria-pressed="false"><span><strong>Entire Genki II Course</strong><small>Practise all ${wordsForScope("genki").length} course words without stage locks.</small></span><i aria-hidden="true"></i></button>
                <div class="vocab-scope-lesson-choices" aria-label="Genki II lessons">
                  ${[1, 2, 3, 4, 5, 6].map(lesson => {
                    const scope = `lesson${lesson}`;
                    const topicCount = SCOPE_STAGE_IDS[scope].length;
                    const words = wordsForScope(scope);
                    return `<button type="button" data-scope-preset="${scope}" aria-pressed="false"><span class="vocab-scope-option-copy"><strong>Lesson ${lesson}</strong><small>${topicCount} topics · ${words.length} words</small></span>${scopeChoiceAccuracyMarkup(words)}</button>`;
                  }).join("")}
                </div>
                <button class="vocab-scope-topics-link" type="button" data-open-scope-topics="genki"><span>Choose Genki II topics</span><span aria-hidden="true">›</span></button>
              </div>
              <div class="vocab-scope-track-panel" data-scope-track-panel="n5" role="tabpanel" hidden>
                <button class="vocab-scope-choice vocab-scope-choice-primary" type="button" data-scope-preset="n5-guided" aria-pressed="false"><span><span class="vocab-scope-choice-title"><strong>Guided JLPT N5</strong><em>Recommended</em></span><small>Learn one topic at a time while earlier N5 words stay in review.</small></span><i aria-hidden="true"></i></button>
                <button class="vocab-scope-choice" type="button" data-scope-preset="n5" aria-pressed="false"><span><strong>All JLPT N5 vocabulary</strong><small>802 official entries · 803 practice forms across 23 topics.</small></span><i aria-hidden="true"></i></button>
                <button class="vocab-scope-topics-link" type="button" data-open-scope-topics="n5"><span>Choose JLPT N5 topics</span><span aria-hidden="true">›</span></button>
              </div>
              <button class="vocab-scope-advanced" type="button" data-open-scope-topics="all"><span><strong>Combine tracks</strong><small>Advanced · mix individual Genki II and JLPT N5 topics</small></span><span aria-hidden="true">›</span></button>
            </section>
            <section class="vocab-scope-topic-view" data-scope-view="topics" hidden>
              <button class="vocab-scope-back" id="vocabScopeBack" type="button">← Back to tracks</button>
              <div class="vocab-scope-section-heading"><div><h3 id="vocabScopeTopicTitle">Choose topics</h3><p id="vocabScopeTopicDescription"></p></div></div>
              <div class="vocab-scope-topic-tools"><label><span class="sr-only">Search topics</span><input id="vocabScopeTopicSearch" type="search" placeholder="Search topics…" autocomplete="off"></label><div><button type="button" id="vocabScopeSelectAll">Select all</button><button type="button" id="vocabScopeClearTopics">Clear</button></div></div>
              <div class="vocab-scope-topic-list">
                ${ALL_STAGES.map(stage => {
                  const track = N5_STAGES.some(topic => topic.id === stage.id) ? "n5" : "genki";
                  const label = stage.name.replace(/^Lesson \d · |^JLPT N5 · /, "");
                  const words = wordsInStage(stage.id);
                  return `<label class="vocab-topic-option" data-topic-stage="${stage.id}" data-topic-track="${track}"><input type="checkbox" value="${stage.id}" data-scope-topic><span><span class="vocab-topic-track-label">${track === "n5" ? "JLPT N5" : "Genki II"}</span><strong>${label}</strong><small>${words.length} words · ${stage.description}</small></span>${scopeChoiceAccuracyMarkup(words)}</label>`;
                }).join("")}
              </div>
            </section>
          </div>
          <footer><div class="vocab-scope-selection-summary"><strong id="vocabScopeDraftCount">Guided course selected</strong><p id="vocabScopeValidation" aria-live="polite"></p></div><div><button class="ghost" id="vocabScopeCancel" type="button">Cancel</button><button class="big-button" id="vocabScopeApply" type="button">Use guided course</button></div></footer>
        </div>
      </dialog>
      <dialog class="vocab-curriculum-dialog" id="vocabCurriculumDialog" aria-labelledby="vocabCurriculumDialogTitle" aria-describedby="vocabCurriculumDialogDescription">
        <div class="vocab-curriculum-dialog-shell">
          <header><div><span>Topic vocabulary</span><h2 id="vocabCurriculumDialogTitle">Lesson vocabulary</h2><p id="vocabCurriculumDialogDescription"></p></div><button class="vocab-scope-close" id="vocabCurriculumClose" type="button" aria-label="Close topic vocabulary">×</button></header>
          <div class="vocab-curriculum-dialog-body">
            <div class="vocab-curriculum-topic-stats" id="vocabCurriculumTopicStats"></div>
            <div class="vocab-curriculum-tools"><label><span class="sr-only">Search this topic</span><input id="vocabCurriculumSearch" type="search" placeholder="Search Japanese, romaji, or English…" autocomplete="off"></label><div class="vocab-curriculum-filters" id="vocabCurriculumFilters" aria-label="Filter words"><button type="button" data-curriculum-filter="all" aria-pressed="true">All</button><button type="button" data-curriculum-filter="learning">Learning</button><button type="button" data-curriculum-filter="due">Due</button><button type="button" data-curriculum-filter="mastered">Mastered</button><button type="button" data-curriculum-filter="unintroduced">Not introduced</button></div></div>
            <div class="vocab-curriculum-list-heading"><span>Words</span><div><span id="vocabCurriculumWordCount"></span><label><span>Sort</span><select id="vocabCurriculumSort"><option value="curriculum">Curriculum order</option><option value="japanese-asc">Japanese: A–Z</option><option value="japanese-desc">Japanese: Z–A</option><option value="accuracy-low">Accuracy: low first</option><option value="accuracy-high">Accuracy: high first</option></select></label></div></div>
            <div class="vocab-curriculum-words" id="vocabCurriculumWords"></div>
          </div>
          <footer><button class="ghost" id="vocabCurriculumCancel" type="button">Close</button><button class="big-button" id="vocabCurriculumPractice" type="button">Practice this topic</button></footer>
        </div>
      </dialog>`;
    const panelAnchor = $("#panel-wordprogress");
    if (panelAnchor) panelAnchor.before(panel); else $(".wrap").appendChild(panel);

    const wordProgressGrid = $("#panel-wordprogress > .grid2");
    const wordProgressHeading = wordProgressGrid?.querySelector(".card h2");
    if (wordProgressHeading) wordProgressHeading.textContent = "Word reading progress";
    if (wordProgressGrid) {
      const vocabularyProgress = document.createElement("div");
      vocabularyProgress.className = "card vocab-progress-detail-card";
       vocabularyProgress.innerHTML = `<div class="vocab-progress-detail-heading"><div><h2>Vocabulary comprehension</h2><p class="muted">One shared mastery and review schedule across all enabled question formats.</p></div><span class="data-badge" id="vocabProgressStage">Lesson 1 · Greetings & courtesy</span></div><div class="vocab-progress-grid"><div class="mini"><strong id="vocabProgressTotal">0</strong><span class="tiny">answers</span></div><div class="mini"><strong id="vocabProgressAccuracy">—</strong><span class="tiny">accuracy</span></div><div class="mini"><strong id="vocabProgressIntroduced">0</strong><span class="tiny">introduced</span></div><div class="mini"><strong id="vocabProgressMastered">0</strong><span class="tiny">mastered</span></div><div class="mini"><strong id="vocabProgressWeak">0</strong><span class="tiny">weak in scope</span></div><div class="mini"><strong id="vocabProgressBestStreak">0</strong><span class="tiny">best streak</span></div></div>`;
      wordProgressGrid.insertAdjacentElement("afterend", vocabularyProgress);
    }

    tab.addEventListener("click", switchToVocabulary);
    document.querySelectorAll('.tab:not([data-tab="vocabulary"])').forEach(other => other.addEventListener("click", () => panel.classList.remove("active")));
    $("#vocabQuestionFormat").value = state.questionFormat;
    $("#vocabChoiceCount").value = state.choiceCount;
    $("#vocabPace").value = String(state.pace);
    $("#vocabAutoPronounce").checked = state.autoPronounce;
  }

  function updateFormatAvailability() {
    const select = $("#vocabQuestionFormat");
    const choiceSelect = $("#vocabChoiceCount");
    const ready = japaneseSpeechReady();
    select.querySelector('option[value="spoken"]').disabled = !ready;
    select.querySelector('option[value="audio-both"]').disabled = !ready;
    if (!ready && ["spoken", "audio-both"].includes(state.questionFormat)) {
      state.questionFormat = "mixed";
      select.value = "mixed";
      saveState();
    }
    const hints = {
      written: "Build recognition from Japanese text.",
      spoken: ready ? "Listen without seeing the Japanese prompt." : "Listening requires a Japanese voice in Settings & Data.",
      speaking: "Speak Japanese, review the transcript, then submit.",
      recall: "Recall questions use similar-looking and similar-sounding Japanese choices.",
      "written-both": "Silent practice combines Japanese reading with English-to-Japanese choices.",
      "audio-both": "Balances listening choices and Japanese speaking; urgent retries may repeat a format. Answer choices apply only to listening.",
      mixed: ready ? "Rotates through written recognition, listening, and Japanese recall. Speaking is selected separately." : "Rotates through written recognition and Japanese recall until a Japanese voice is available. Speaking is selected separately."
    };
    $("#vocabFormatHint").textContent = hints[state.questionFormat];
    const speaking = state.questionFormat === "speaking";
    choiceSelect.disabled = speaking;
    choiceSelect.value = speaking ? "not-used" : state.choiceCount;
    $("#vocabChoiceCountHint").textContent = choiceCountFormatHint();
  }

  function switchToVocabulary() {
    document.querySelectorAll(".tab").forEach(tab => tab.classList.toggle("active", tab.dataset.tab === "vocabulary"));
    document.querySelectorAll(".panel").forEach(panel => panel.classList.toggle("active", panel.id === "panel-vocabulary"));
    publishStreak();
    if (!current) nextQuestion();
  }

  function beginIntroduction(word, preferredMode = "written") {
    current = word;
    currentMode = preferredMode;
    const progress = itemState(word);
    if (!progress.introduced) {
      progress.introduced = true;
      saveState();
    }
    phase = "introduction";
    $("#vocabQuestion").classList.add("hidden");
    $("#vocabIntroduction").classList.remove("hidden");
    $("#vocabDontKnow").classList.add("hidden");
    $("#vocabNext").classList.add("hidden");
    $("#vocabIntroduction").innerHTML = `<span class="vocab-new-badge">New everyday expression</span><div class="vocab-intro-japanese">${word.jp}</div><strong>${word.romaji}</strong><div class="vocab-intro-meaning">${word.meaning}</div><span class="tiny">${wordContextName(word)}</span><div class="actions"><button class="ghost" id="vocabIntroSpeech" type="button" aria-keyshortcuts="R">🔊 Hear it <kbd>R</kbd></button><button class="big-button" id="vocabStartCheck" type="button" aria-keyshortcuts="Enter">Practice this word <kbd>Enter</kbd></button></div>`;
    $("#vocabIntroSpeech").disabled = !japaneseSpeechReady();
    $("#vocabIntroSpeech").addEventListener("click", () => speak(word));
    $("#vocabStartCheck").addEventListener("click", () => showQuestion(word, preferredMode));
    if (japaneseSpeechReady()) setTimeout(() => speak(word), 100);
    $("#vocabPracticeMode").textContent = "Vocabulary • new expression";
    $("#vocabKeyboardHint").innerHTML = "Press <kbd>Enter</kbd> to practice.";
    setTimeout(() => $("#vocabStartCheck")?.focus(), 0);
    publishDashboard();
  }

  function choiceCountFor(word, mode = currentMode) {
    if (state.choiceCount !== "auto") return Number(state.choiceCount);
    return Scheduler.choiceCountForMastery(modeState(word, mode).mastery);
  }

  function choiceCountHint() {
    return state.choiceCount === "auto"
      ? "Auto uses 4, 6, or 8 choices based on mastery."
      : `Uses ${state.choiceCount} choices from the next question.`;
  }

  function choiceCountFormatHint() {
    if (state.questionFormat === "speaking") return "Multiple-choice settings don’t apply here.";
    if (state.questionFormat === "audio-both") return state.choiceCount === "auto"
      ? "Listening questions use 4, 6, or 8 choices based on mastery."
      : `Listening questions use ${state.choiceCount} choices.`;
    return choiceCountHint();
  }

  function editSimilarity(left, right) {
    const a = left.toLowerCase().replace(/[^a-z\u3040-\u30ff]/g, "");
    const b = right.toLowerCase().replace(/[^a-z\u3040-\u30ff]/g, "");
    if (!a.length || !b.length) return 0;
    const row = Array.from({ length: b.length + 1 }, (_, index) => index);
    for (let i = 1; i <= a.length; i++) {
      let diagonal = row[0];
      row[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const above = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
        diagonal = above;
      }
    }
    return 1 - row[b.length] / Math.max(a.length, b.length);
  }

  function sharedContrastGroups(left, right) {
    const leftGroups = CONTRASTS_BY_ID.get(left.id);
    const rightGroups = CONTRASTS_BY_ID.get(right.id);
    if (!leftGroups || !rightGroups) return 0;
    return [...leftGroups].filter(group => rightGroups.has(group)).length;
  }

  function distractorScore(word, candidate, format) {
    const progress = itemState(word);
    const direction = modeState(word, format);
    const challenge = direction.mastery < 40 ? .35 : direction.mastery < 72 ? .7 : 1;
    const recentIndex = progress.recentDistractors.lastIndexOf(candidate.id);
    const confusionCount = Number(progress.confusions[candidate.id]) || 0;
    let score = sharedContrastGroups(word, candidate) * (45 + 40 * challenge);
    if (candidate.stageIds.some(id => word.stageIds.includes(id))) score += 32;
    if (state.items[candidate.id]?.introduced) score += 12;
    score += editSimilarity(format === "spoken" ? word.romaji : word.jp, format === "spoken" ? candidate.romaji : candidate.jp) * (format === "spoken" || format === "recall" ? 28 + 34 * challenge : 10 + 20 * challenge);
    score += Math.min(54, confusionCount * 18);
    if (recentIndex >= 0) {
      const recency = progress.recentDistractors.length - recentIndex;
      score -= Math.max(55, 130 - recency * 8);
    }
    return score + Math.random() * 18;
  }

  function makeChoices(word, format) {
    const count = choiceCountFor(word, format);
    const answerValue = candidate => format === "recall" ? candidate.jp : candidate.meaning;
    const answers = new Set([answerValue(word)]);
    const ranked = WORDS
      .filter(candidate => candidate.id !== word.id && answerValue(candidate) !== answerValue(word))
      .map(candidate => ({ candidate, score: distractorScore(word, candidate, format) }))
      .sort((a, b) => b.score - a.score);
    const distractors = [];
    for (const { candidate } of ranked) {
      if (answers.has(answerValue(candidate))) continue;
      distractors.push(candidate);
      answers.add(answerValue(candidate));
      if (distractors.length === count - 1) break;
    }
    return shuffle([word, ...distractors]);
  }

  function revealAnsweredFeedback(feedback) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const viewport = window.visualViewport;
      const viewportTop = (viewport?.offsetTop || 0) + 16;
      const viewportBottom = (viewport?.offsetTop || 0) + (viewport?.height || window.innerHeight) - 20;
      const availableHeight = viewportBottom - viewportTop;
      const feedbackRect = feedback.getBoundingClientRect();
      const trainerRect = $(".vocab-trainer").getBoundingClientRect();
      const reviewAndFooterFits = trainerRect.bottom - feedbackRect.top <= availableHeight;
      if (trainerRect.height > availableHeight && reviewAndFooterFits) {
        const top = window.scrollY + trainerRect.bottom - viewportBottom;
        if (Math.abs(trainerRect.bottom - viewportBottom) < 4) return;
        const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? "auto" : "smooth" });
        return;
      }
      const rect = trainerRect.height <= availableHeight ? trainerRect : feedbackRect;
      const fullyVisible = rect.top >= viewportTop && rect.bottom <= viewportBottom;
      if (fullyVisible) return;

      let top;
      if (rect.height <= availableHeight) {
        top = rect.bottom > viewportBottom
          ? window.scrollY + rect.bottom - viewportBottom
          : window.scrollY + rect.top - viewportTop;
      } else {
        if (Math.abs(rect.top - viewportTop) < 24) return;
        top = window.scrollY + rect.top - viewportTop;
      }
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? "auto" : "smooth" });
    }));
  }

  function revealNextPracticeStep() {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const trainer = $(".vocab-trainer");
      const step = $("#vocabIntroduction").classList.contains("hidden")
        ? $("#vocabQuestion .question")
        : $("#vocabIntroduction");
      const stepRect = step.getBoundingClientRect();
      const viewport = window.visualViewport;
      const viewportTop = (viewport?.offsetTop || 0) + 16;
      const viewportBottom = (viewport?.offsetTop || 0) + (viewport?.height || window.innerHeight) - 20;
      const hasUsefulStartInView = stepRect.top >= viewportTop && stepRect.top <= viewportBottom - 160;
      if (hasUsefulStartInView) return;

      const trainerRect = trainer.getBoundingClientRect();
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({
        top: Math.max(0, window.scrollY + trainerRect.top - viewportTop),
        behavior: reduceMotion ? "auto" : "smooth"
      });
    }));
  }

  function showQuestion(word, preferredMode, urgentRetry = false) {
    stopSpeaking();
    current = word;
    phase = "question";
    questionNumber++;
    $("#vocabCount").textContent = `Question ${questionNumber}`;
    $("#vocabIntroduction").classList.add("hidden");
    $("#vocabQuestion").classList.remove("hidden");
    $("#vocabFeedback").className = "feedback";
    $("#vocabFeedback").innerHTML = "";
    $("#vocabNext").classList.add("hidden");
    $("#vocabDontKnow").classList.remove("hidden");
    const format = nextQuestionFormat(word, preferredMode, urgentRetry);
    currentMode = format;
    const spoken = format === "spoken";
    const speaking = format === "speaking";
    const recall = format === "recall" || speaking;
    currentSpeechPrompt = speaking ? Speaking.promptFor(word) : null;
    if (speaking) speechEvidence = SpeechDiagnostics?.begin({
      activity: "vocabulary",
      targetId: word.id,
      expected: currentSpeechPrompt?.expectedKana || word.jp,
      promptStyle: currentSpeechPrompt ? "suffix-context" : "isolated",
    }) || null;
    currentContext = !speaking && recall && CONTEXT_PROMPTS[word.id] && Math.random() < .65 ? CONTEXT_PROMPTS[word.id] : "";
    $("#vocabPrompt").textContent = speaking && currentSpeechPrompt ? currentSpeechPrompt.frame : recall ? (currentContext || word.meaning) : word.jp;
    $("#vocabSpeakingCue").textContent = currentSpeechPrompt ? `Complete the phrase using “${word.meaning}”. Say the whole phrase.` : "";
    $("#vocabSpeakingCue").classList.toggle("hidden", !currentSpeechPrompt);
    $("#vocabPrompt").classList.toggle("vocab-recall-prompt", recall);
    $("#vocabPrompt").classList.toggle("vocab-context-prompt", Boolean(currentSpeechPrompt));
    $("#vocabPrompt").classList.toggle("hidden", spoken);
    $("#vocabAudioPrompt").classList.toggle("hidden", !spoken);
    $("#vocabQuestionLabel").textContent = speaking ? (currentSpeechPrompt ? "Complete and say the Japanese phrase" : "Say the Japanese expression") : spoken ? "Listen and choose the English meaning" : recall ? (currentContext ? "Choose the expression that fits this situation" : "Choose the Japanese expression") : "Choose the English meaning";
    $("#vocabPracticeMode").textContent = `Vocabulary • ${modeLabel(format)}${currentContext || currentSpeechPrompt ? " in context" : ""}`;
    const options = $("#vocabOptions");
    options.innerHTML = "";
    options.classList.remove("is-answered");
    options.classList.toggle("hidden", speaking);
    $("#vocabSpeaking").classList.toggle("hidden", !speaking);
    if (speaking) {
      currentChoiceIds = [];
      currentChoiceCount = 0;
      setupSpeaking();
      publishDashboard();
      return;
    }
    const choices = makeChoices(word, format);
    currentChoiceIds = choices.map(choice => choice.id);
    currentChoiceCount = choices.length;
    options.dataset.count = String(choices.length);
    $("#vocabKeyboardHint").innerHTML = `Use <kbd>1</kbd>–<kbd>${choices.length}</kbd> to choose an answer.`;
    choices.forEach((choice, index) => {
      const button = document.createElement("button");
      button.className = "vocab-choice";
      button.dataset.id = choice.id;
      button.innerHTML = recall
        ? `<span>${index + 1}</span><span class="vocab-choice-japanese"><strong>${choice.jp}</strong><small class="vocab-choice-secondary" aria-hidden="true"><span>${choice.romaji}</span><span class="vocab-choice-meaning">${choice.meaning}</span></small></span>`
        : `<span>${index + 1}</span><span class="vocab-choice-english"><strong>${choice.meaning}</strong><small class="vocab-choice-secondary vocab-choice-japanese-secondary" aria-hidden="true">${choice.jp}</small></span>`;
      button.addEventListener("click", () => answer(choice.id));
      options.appendChild(button);
    });
    if (spoken) setTimeout(() => speak(word), 100);
    publishDashboard();
  }

  function applyResult(correct, selectedId) {
    const progress = itemState(current);
    const direction = modeState(current, currentMode);
    const now = Date.now();
    const wasUrgentRetry = progress.urgentRetryPending && progress.urgentMode === currentMode;
    progress.introduced = true;
    const distractorIds = currentChoiceIds.filter(id => id !== current.id);
    progress.recentDistractors.push(...distractorIds);
    progress.recentDistractors = progress.recentDistractors.slice(-16);
    if (!correct && selectedId) progress.confusions[selectedId] = (Number(progress.confusions[selectedId]) || 0) + 1;
    progress.seen++;
    progress.lastSeen = now;
    progress.lastWasCorrect = correct;
    progress.lastMode = currentMode;
    progress.recentResults.push(correct);
    progress.recentResults = progress.recentResults.slice(-8);
    if (correct) {
      progress.correct++;
      progress.mastery = Math.min(100, progress.mastery + Math.max(6, 20 * (1 - progress.mastery / 140)));
      if (wasUrgentRetry) {
        progress.urgentRetryPending = false;
        progress.urgentMode = "";
      }
    } else {
      progress.wrong++;
      progress.mastery = Math.max(0, progress.mastery - 12);
      progress.urgentRetryPending = true;
      progress.urgentMode = currentMode;
    }
    direction.seen++;
    direction.lastSeen = now;
    direction.lastWasCorrect = correct;
    direction.recentResults.push(correct);
    direction.recentResults = direction.recentResults.slice(-8);
    if (correct) {
      direction.correct++;
      direction.mastery = Math.min(100, direction.mastery + Math.max(6, 20 * (1 - direction.mastery / 140)));
      state.correct++;
      state.streak++;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
    } else {
      direction.wrong++;
      direction.mastery = Math.max(0, direction.mastery - 12);
      state.streak = 0;
    }
    state.total++;
    const scheduleCorrect = correct && (!progress.urgentRetryPending || wasUrgentRetry);
    Object.assign(progress, Scheduler.nextReviewSchedule(progress.mastery, scheduleCorrect, state.total, now));
    Object.assign(direction, { dueAt: progress.dueAt, dueQuestion: progress.dueQuestion });
    const questionsUntilReview = Math.max(0, progress.dueQuestion - state.total);
    currentReason = correct ? `${modeLabel(currentMode)} strengthened · returns in ${questionsUntilReview} questions` : `${modeLabel(currentMode)} needs attention · returns soon`;
    state.recent.push(current.id);
    if (state.recent.length > 12) state.recent.shift();
    saveState();
  }

  function answer(selectedId, unknown = false) {
    if (phase !== "question" || !current) return;
    const wasSpokenQuestion = currentMode === "spoken";
    const wasSpeakingQuestion = !$("#vocabSpeaking").classList.contains("hidden");
    stopSpeaking();
    if (currentMode === "speaking" && typedAnswer) currentMode = "recall";
    phase = "answered";
    $("#vocabSpeaking").querySelectorAll("button,input").forEach(control => { control.disabled = true; });
    if (wasSpeakingQuestion) {
      $("#vocabSpeechActions").classList.add("hidden");
      $("#vocabTypingModes").classList.add("hidden");
      $("#vocabKeyboardHint").innerHTML = "Press <kbd>Enter</kbd> for the next question.";
    }
    const correct = !unknown && selectedId === current.id;
    if (wasSpeakingQuestion && !correct) speechEvidence = null;
    const selectedWord = !correct && selectedId ? WORDS.find(word => word.id === selectedId) : null;
    applyResult(correct, selectedId);
    const options = $("#vocabOptions");
    options.classList.add("is-answered");
    options.querySelectorAll(".vocab-choice-secondary").forEach(detail => detail.removeAttribute("aria-hidden"));
    [...$("#vocabOptions").children].forEach(button => {
      button.disabled = true;
      if (button.dataset.id === current.id) button.classList.add("correct");
      else if (button.dataset.id === selectedId) button.classList.add("wrong");
    });
    const feedback = $("#vocabFeedback");
    feedback.className = `feedback show ${correct ? "good" : "bad"}`;
    const selectedMarkup = selectedWord ? `<div class="vocab-feedback-choice"><span class="vocab-feedback-choice-label">Your choice</span><strong>${selectedWord.jp} → ${selectedWord.romaji}</strong><span>Meaning: ${selectedWord.meaning}</span></div>` : "";
    const example = Examples[current.id];
    const exampleMarkup = example ? `<div class="vocab-example"><span class="vocab-example-label">In a sentence</span><p lang="ja">${highlightExample(example[0], example[2] || current.jp.replace("～", ""))}</p><span>${example[1]}</span><button class="ghost" id="vocabPlayExample" type="button">🔊 Play sentence</button>${exampleBreakdownMarkup(current)}</div>` : "";
    feedback.innerHTML = `<strong>${correct ? "Correct" : "Remember this one"}</strong><div class="meta">${selectedMarkup}<span class="vocab-feedback-word">Correct answer: ${current.jp} → ${current.romaji}</span><span>Meaning: ${current.meaning} • ${wordContextName(current)}</span><div class="vocab-answer-audio"><button class="ghost speak-again" id="vocabReplayAnswer" type="button" aria-keyshortcuts="R">🔊 Replay word <kbd>R</kbd></button></div>${exampleMarkup}</div>`;
    $("#vocabReplayAnswer").disabled = !japaneseSpeechReady();
    $("#vocabReplayAnswer").addEventListener("click", () => speak(current));
    if ($("#vocabPlayExample")) $("#vocabPlayExample").disabled = !japaneseSpeechReady();
    $("#vocabPlayExample")?.addEventListener("click", () => speakExample(current));
    rememberBreakdownPreference(feedback.querySelector(".vocab-example-breakdown"));
    $("#vocabNext").classList.remove("hidden");
    $("#vocabDontKnow").classList.add("hidden");
    if (state.autoPronounce && !wasSpokenQuestion) speak(current);
    publishStreak();
    revealAnsweredFeedback(feedback);
  }

  function nextQuestion() {
    const restorePracticeView = phase === "answered";
    stopSpeaking();
    window.KANA_SPRINT_SPEECH?.stop?.();
    const selected = selectWord();
    if (!selected?.word) return;
    currentReason = selected.reason || "Adaptive review";
    if (selected.introduce) beginIntroduction(selected.word, selected.mode); else showQuestion(selected.word, selected.mode, selected.reason === "Urgent review");
    if (restorePracticeView) revealNextPracticeStep();
  }

  function averageModeMastery(mode, words = introducedWords()) {
    return words.length ? Math.round(words.reduce((sum, word) => sum + modeState(word, mode).mastery, 0) / words.length) : 0;
  }

  function recentModeAccuracy(mode, words = introducedWords()) {
    const results = words.flatMap(word => modeState(word, mode).recentResults).slice(-24);
    return Scheduler.recentAccuracy(results);
  }

  function isMastered(word) {
    const progress = itemState(word);
    return progress.introduced && progress.seen > 0 && progress.mastery >= 72;
  }

  function dueReviewCount() {
    return dueReviewBreakdown().total;
  }

  function paceStatus() {
    const due = dueReviewBreakdown();
    const urgent = urgentReviewEntries(reviewPoolForScope()).length;
    if (state.practiceScope === "trouble") {
      return due.total ? `${urgent ? "Urgent retry due" : "Trouble review"} · ${dueReviewSummary(due)}` : "Focused review of recent trouble words";
    }
    const guidedN5 = state.practiceScope === "n5-guided";
    const guided = state.practiceScope === "adaptive" || guidedN5;
    const stage = guidedN5 ? unlockedN5StageIndex() : unlockedStageIndex();
    const guidedStageWords = guidedN5 ? n5StageWords(stage) : stageWords(stage);
    const guidedStages = guidedN5 ? N5_STAGES : COURSE_STAGES;
    const unseen = (guided ? guidedStageWords : wordsForScope()).filter(word => !itemState(word).introduced).length;
    if (due.total) return urgent ? `Urgent retry due · ${dueReviewSummary(due)}` : `${paceLabel()} pace · ${paceMixLabel()} · ${dueReviewSummary(due)}`;
    if (unseen) return `${paceLabel()} pace · ${paceMixLabel()} · ${unseen} new ${guided ? `in the current ${guidedN5 ? "topic" : "stage"}` : `in ${SCOPE_LABELS[state.practiceScope].toLowerCase()}`}`;
    if (!guided) return `${SCOPE_LABELS[state.practiceScope]} introduced · strengthening mastery`;
    if (stage < guidedStages.length - 1) return `Reviewing learned words while ${guidedN5 ? `N5 topic ${stage + 1}` : `Genki stage ${stage + 1}`} finishes`;
    return "Curriculum introduced · strengthening recall";
  }

  function publishDashboard() {
    if (document.body.dataset.activity !== "vocabulary") return;
    const introduced = introducedWords();
    const mastered = introduced.filter(isMastered);
    const due = dueReviewBreakdown();
    const sessionTotal = Math.max(0, state.total - sessionStartedTotal);
    const sessionCorrect = Math.max(0, state.correct - sessionStartedCorrect);
    const scopeAccuracy = accuracyForWords(wordsForScope());
    const sessionSummary = sessionTotal ? `${Math.round(sessionCorrect / sessionTotal * 100)}% this session · ${sessionCorrect}/${sessionTotal} correct` : "No answers this session";
    const statusNote = `${paceStatus()} · ${sessionSummary}`;
    window.dispatchEvent(new CustomEvent("kana-sprint-activity-status", { detail: {
      note: statusNote,
      metrics: [
        { label: "Scope", value: scopeShortLabel() },
        { label: "Streak", value: state.streak },
        { label: "Scope accuracy", value: scopeAccuracy.percentage === null ? "—" : `${scopeAccuracy.percentage}%` },
        { label: "Due words", value: due.total ? due.total : "0" },
        { label: "Mastered", value: `${mastered.length} / ${WORDS.length}` },
        { label: "Challenge", value: phase === "question" || phase === "answered" ? (currentChoiceCount === 0 ? (typedAnswer ? "Typed answer" : "Spoken answer") : `${currentChoiceCount} choices`) : state.choiceCount === "auto" ? "Auto" : `${state.choiceCount} choices` }
      ]
    } }));
  }

  function renderProgress() {
    const setOptionalText = (selector, value) => {
      const element = $(selector);
      if (element) element.textContent = value;
    };
    if (!$("#vocabStages")) return;
    const introduced = introducedWords();
    const unlocked = unlockedStageIndex();
    const scopeWords = wordsForScope();
    const introducedInScope = scopeWords.filter(word => itemState(word).introduced).length;
    const mastered = introduced.filter(isMastered);
    const weak = weakWords();
    setOptionalText("#vocabTotal", state.total);
    setOptionalText("#vocabAccuracy", state.total ? `${Math.round(state.correct / state.total * 100)}%` : "—");
    setOptionalText("#vocabIntroduced", `${introduced.length} / ${WORDS.length}`);
    setOptionalText("#vocabMastered", mastered.length);
    setOptionalText("#vocabWeak", weak.length);
    setOptionalText("#vocabBestStreak", state.bestStreak);
    setOptionalText("#vocabProgressTotal", state.total);
    setOptionalText("#vocabProgressAccuracy", state.total ? `${Math.round(state.correct / state.total * 100)}%` : "—");
    setOptionalText("#vocabProgressIntroduced", `${introduced.length} / ${WORDS.length}`);
    setOptionalText("#vocabProgressMastered", mastered.length);
    setOptionalText("#vocabProgressWeak", weak.length);
    setOptionalText("#vocabProgressBestStreak", state.bestStreak);
    $("#vocabPaceName").textContent = paceLabel();
    setOptionalText("#vocabChoiceCountHint", choiceCountFormatHint());
    setOptionalText("#vocabPaceStatus", paceStatus());
    const due = dueReviewBreakdown();
    const dueScopeLabel = SCOPE_LABELS[state.practiceScope];
    setOptionalText("#vocabScopeLabel", SCOPE_LABELS[state.practiceScope]);
    setOptionalText("#vocabDueSummary", due.total ? `${due.total} word${due.total === 1 ? "" : "s"} due` : "No words due");
    setOptionalText("#vocabDueBreakdown", `${dueScopeLabel} · one shared review queue · prompts adapt across enabled formats`);
    const guidedN5 = state.practiceScope === "n5-guided";
    const guided = state.practiceScope === "adaptive" || guidedN5;
    const guidedIndex = guidedN5 ? unlockedN5StageIndex() : unlocked;
    const currentStageWords = guidedN5 ? n5StageWords(guidedIndex) : stageWords(guidedIndex);
    const currentStageIntroduced = currentStageWords.filter(word => itemState(word).introduced).length;
    const curriculumSummary = guided
      ? `${SCOPE_LABELS.adaptive} · ${currentStageIntroduced}/${currentStageWords.length} current · ${introduced.length} learned total`
      : `${SCOPE_LABELS[state.practiceScope]} · ${introducedInScope}/${scopeWords.length} introduced`;
    const guidedSummary = guidedN5
      ? `${SCOPE_LABELS["n5-guided"]} · ${currentStageIntroduced}/${currentStageWords.length} current · ${wordsForScope("n5").filter(word => itemState(word).introduced).length} N5 learned`
      : curriculumSummary;
    setOptionalText("#vocabCurriculumSummary", guidedSummary);
    const scopeHints = {
      adaptive: "New words follow the Genki II sequence; learned words remain reviewable.",
      "n5-guided": `Current topic: ${N5_STAGES[guidedIndex]?.name.replace(/^JLPT N5 · /, "") || "JLPT N5"}. Earlier N5 words remain reviewable.`,
      all: "The Genki II Course and JLPT N5 list in one deduplicated practice pool.",
      genki: "All vocabulary in the Genki II Course track.",
      n5: `${N5_DATA.officialEntryCount} official JLPT N5 entries · ${wordsForScope("n5").length} practice forms.`,
      lesson1: "Only Genki II Lesson 1 vocabulary and expressions.",
      lesson2: "Only Genki II Lesson 2 vocabulary and expressions.",
      lesson3: "Only Genki II Lesson 3 vocabulary and expressions.",
      lesson4: "Only Genki II Lesson 4 vocabulary and expressions.",
      lesson5: "Only Genki II Lesson 5 vocabulary and expressions.",
      lesson6: "Only Genki II Lesson 6 vocabulary and expressions.",
      trouble: "Only weak words from the selected regular scope."
    };
    const scopeHint = state.practiceScope === "trouble"
      ? `Recent trouble words within ${SCOPE_LABELS[lastRegularScope].toLowerCase()}.`
      : state.practiceScope === "custom"
        ? `${scopeSelectionSummary(state.practiceScope)}.`
        : scopeHints[state.practiceScope];
    setOptionalText("#vocabScopeHint", scopeHint);
    const troubleSourceScope = state.practiceScope === "trouble" ? (lastRegularScope === "adaptive" ? "Guided Genki II Course" : SCOPE_LABELS[lastRegularScope]) : SCOPE_LABELS[state.practiceScope];
    setOptionalText("#vocabTroubleHint", `Recent misses in ${troubleSourceScope} matter more than old mistakes.`);
    setOptionalText("#vocabProgressStage", guided ? (guidedN5 ? N5_STAGES[guidedIndex]?.name : COURSE_STAGES[guidedIndex].name) : SCOPE_LABELS[state.practiceScope]);
    MODE_KEYS.forEach(mode => {
      const capitalized = mode[0].toUpperCase() + mode.slice(1);
      const recent = recentModeAccuracy(mode, introduced);
      setOptionalText(`#vocab${capitalized}Mastery`, `${averageModeMastery(mode, introduced)}%`);
      setOptionalText(`#vocab${capitalized}Recent`, recent === null ? "Not practised" : `${Math.round(recent * 100)}% recent accuracy`);
    });
    const troubleList = $("#vocabTroubleList");
    if (troubleList) troubleList.innerHTML = weak.length ? weak.slice(0, 6).map(word => `<div class="vocab-trouble-word"><span><strong>${word.jp}</strong><small>${word.meaning}</small></span><span class="vocab-mode-chips"><i title="Reading mastery">R ${Math.round(modeState(word, "written").mastery)}</i><i title="Listening mastery">L ${Math.round(modeState(word, "spoken").mastery)}</i><i title="Recall mastery">↩ ${Math.round(modeState(word, "recall").mastery)}</i></span></div>`).join("") : `<p class="muted vocab-empty-state">No trouble words yet. Recent misses will appear here.</p>`;
    const troubleButton = $("#vocabReviewTrouble");
    if (troubleButton) {
      troubleButton.disabled = !weak.length;
      troubleButton.textContent = state.practiceScope === "trouble" ? `Return to ${SCOPE_LABELS[lastRegularScope]}` : "Review trouble words";
    }
    const activeCurriculumTrack = curriculumTrack();
    const curriculumCopy = {
      genki: {
        title: "Genki II Course curriculum",
        description: "Browse progress through the Genki II topics in your current practice track."
      },
      n5: {
        title: "JLPT N5 topic curriculum",
        description: "Browse progress through the JLPT N5 topics in your current practice track."
      },
      all: {
        title: "Combined vocabulary curriculum",
        description: "Your practice scope includes both tracks, so their topics are grouped below."
      }
    }[activeCurriculumTrack];
    setOptionalText("#vocabCurriculumTitle", curriculumCopy.title);
    setOptionalText("#vocabCurriculumDescription", curriculumCopy.description);
    const stageMarkup = stage => {
      const words = wordsInStage(stage.id);
      const introducedCount = words.filter(word => itemState(word).introduced).length;
      const average = words.length ? Math.round(words.reduce((sum, word) => sum + itemState(word).mastery, 0) / words.length) : 0;
      const courseIndex = COURSE_STAGES.findIndex(candidate => candidate.id === stage.id);
      const n5Index = N5_STAGES.findIndex(candidate => candidate.id === stage.id);
      const guidedStageIndex = guidedN5 ? n5Index : courseIndex;
      const selected = guided ? guidedStageIndex >= 0 && guidedStageIndex <= guidedIndex : scopeWords.some(word => word.stageIds.includes(stage.id));
      const practicedEarly = guided && !selected && introducedCount > 0;
      const ready = words.length > 0 && Scheduler.stageIsReady(words.map(word => itemState(word)));
      const status = guided
        ? (guidedStageIndex < 0 ? (practicedEarly ? "Practised" : "Choose scope") : guidedStageIndex < guidedIndex ? "Complete" : guidedStageIndex === guidedIndex ? "Current" : practicedEarly ? "Practised early" : "Locked")
        : (selected ? (ready ? "Complete" : "In scope") : "Filtered");
      const stageClass = selected ? "" : practicedEarly ? "pre-practiced" : "locked";
      const numberLabel = courseIndex >= 0 ? `${courseIndex + 1}` : "N5";
      return `<button class="vocab-stage ${stageClass}" type="button" data-curriculum-stage="${stage.id}" aria-label="View words in ${stage.name}"><span class="vocab-stage-number">${numberLabel}</span><span class="vocab-stage-content"><strong>${stage.name}</strong><span class="vocab-stage-description">${stage.description}</span><span class="vocab-stage-meter"><span style="width:${average}%"></span></span><small>${introducedCount} / ${words.length} introduced · ${average}% average mastery</small></span><span class="vocab-stage-status">${status}<i aria-hidden="true">›</i></span></button>`;
    };
    $("#vocabStages").innerHTML = activeCurriculumTrack === "all"
      ? `<section class="vocab-track-group" aria-labelledby="vocabGenkiTrackHeading"><h3 class="vocab-track-heading" id="vocabGenkiTrackHeading">Genki II Course</h3>${COURSE_STAGES.map(stageMarkup).join("")}</section><section class="vocab-track-group" aria-labelledby="vocabN5TrackHeading"><h3 class="vocab-track-heading" id="vocabN5TrackHeading">JLPT N5</h3>${N5_STAGES.map(stageMarkup).join("")}</section>`
      : (activeCurriculumTrack === "genki" ? COURSE_STAGES : N5_STAGES).map(stageMarkup).join("");
    publishDashboard();
  }

  function publishStreak() {
    window.dispatchEvent(new CustomEvent("kana-sprint-streak-context", { detail: {
      tab: "vocabulary", label: "vocabulary streak", current: state.streak, best: state.bestStreak
    } }));
  }

  buildUI();
  $("#vocabRecord").addEventListener("click", () => {
    if (phase !== "question") return;
    window.KANA_SPRINT_SPEECH?.stop?.();
    if (["starting", "listening"].includes(speechStatus)) speechSession?.stop();
    else speechSession?.start();
  });
  $("#vocabTypeInstead").addEventListener("click", () => {
    if (typedAnswer) { setupSpeaking(); return; }
    stopSpeaking();
    typedAnswer = true;
    speechStatus = "typed";
    $("#vocabRecord").disabled = true;
    $("#vocabRecord").textContent = "🎤 Speak";
    $("#vocabRecord").removeAttribute("aria-keyshortcuts");
    $("#vocabRecord").setAttribute("aria-pressed", "false");
    $("#vocabTypeInstead").textContent = "Use microphone";
    $("#vocabSpeechText").readOnly = false;
    $("#vocabTypingModes").classList.remove("hidden");
    $("#vocabSpeechInterpretation").classList.add("hidden");
    $("#vocabSpeechSubmit").classList.remove("hidden");
    setTypingScript(typingScript);
  });
  $("#vocabSpeechText").addEventListener("input", () => {
    if (!typedAnswer) return;
    const value = $("#vocabSpeechText").value;
    $("#vocabSpeechSubmit").disabled = !value.trim();
    updateSpeakingKeyboardHint();
    if (typingScript === "romaji") {
      $("#vocabRomajiKana").textContent = Speaking.matchesRomaji(current, value) ? current.jp : (Speaking.romajiToHiragana(value) || "—");
    }
  });
  $("#vocabTypeJapanese").addEventListener("click", () => setTypingScript("japanese"));
  $("#vocabTypeRomaji").addEventListener("click", () => setTypingScript("romaji"));
  $("#vocabSpeechSubmit").addEventListener("click", submitSpeaking);
  // Capture speaking shortcuts so focused controls cannot trigger a different action.
  document.addEventListener("keydown", event => {
    if (!$("#panel-vocabulary").classList.contains("active") || phase !== "question" || currentMode !== "speaking") return;
    if (event.isComposing || event.keyCode === 229) return;
    const typingTarget = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement || event.target?.isContentEditable;
    if (event.key.toLowerCase() === "r" && ["review", "mismatch"].includes(speechStatus) && !typedAnswer && !typingTarget) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!event.repeat) $("#vocabRecord").click();
      return;
    }
    if (event.key !== "Enter") return;
    if (event.target.closest?.("select,a") || event.target.matches?.("button:not(#vocabRecord):not(#vocabSpeechSubmit)")) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (event.repeat) return;
    if (["starting", "listening"].includes(speechStatus)) speechSession?.stop();
    else if (speechStatus === "review" || typedAnswer) submitSpeaking();
    else if (["idle", "error"].includes(speechStatus)) $("#vocabRecord").click();
  }, true);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && speechSession) {
      stopSpeaking();
      if (phase === "question" && currentMode === "speaking") setupSpeaking();
    }
  });
  window.addEventListener("pagehide", () => { speechEvidence = null; stopSpeaking(); });
  new MutationObserver(() => {
    if (!$("#panel-vocabulary").classList.contains("active") && speechSession) {
      stopSpeaking();
      if (phase === "question" && currentMode === "speaking") setupSpeaking();
    }
  }).observe($("#panel-vocabulary"), { attributes: true, attributeFilter: ["class"] });
  window.KANA_SPRINT_SYNC_RANGE?.($("#vocabPace"));
  updateFormatAvailability();
  renderProgress();
  $("#vocabQuestionSpeech").addEventListener("click", () => { if (current) speak(current); });
  $("#vocabDontKnow").addEventListener("click", () => answer("", true));
  $("#vocabNext").addEventListener("click", nextQuestion);
  $("#vocabReviewTrouble").addEventListener("click", () => {
    state.practiceScope = state.practiceScope === "trouble" ? lastRegularScope : "trouble";
    current = null;
    nextQuestion();
    saveState();
  });
  $("#vocabSessionControls").addEventListener("toggle", event => {
    if (event.currentTarget.open) nudgePracticeScope(); else clearPracticeScopeNudge();
  });
  $("#vocabPracticeScope").addEventListener("click", openScopeDialog);
  $("#vocabCurriculumChangeScope").addEventListener("click", openScopeDialog);
  $("#vocabScopeClose").addEventListener("click", closeScopeDialog);
  $("#vocabScopeCancel").addEventListener("click", closeScopeDialog);
  $("#vocabScopeApply").addEventListener("click", applyScopeSelection);
  $("#vocabScopeDialog").addEventListener("click", event => {
    if (event.target === event.currentTarget) closeScopeDialog();
  });
  $("#vocabScopeDialog").querySelectorAll("[data-scope-preset]").forEach(button => button.addEventListener("click", () => {
    scopeDraft = button.dataset.scopePreset;
    scopeStageDraft = new Set(["adaptive", "n5-guided"].includes(scopeDraft) ? [] : SCOPE_STAGE_IDS[scopeDraft]);
    renderScopeDialog();
  }));
  $("#vocabScopeDialog").querySelectorAll("[data-scope-track]").forEach(button => button.addEventListener("click", () => {
    scopeTrackDraft = button.dataset.scopeTrack;
    renderScopeDialog();
  }));
  $("#vocabScopeDialog").querySelectorAll("[data-open-scope-topics]").forEach(button => button.addEventListener("click", () => {
    scopeTopicTrack = button.dataset.openScopeTopics;
    if (scopeTopicTrack !== "all") {
      const allowed = SCOPE_STAGE_IDS[scopeTopicTrack];
      scopeStageDraft = new Set([...scopeStageDraft].filter(id => allowed.includes(id)));
    }
    scopeDraft = "custom";
    scopeDialogView = "topics";
    $("#vocabScopeTopicSearch").value = "";
    renderScopeDialog();
    $("#vocabScopeTopicSearch").focus();
  }));
  $("#vocabScopeBack").addEventListener("click", () => {
    scopeDialogView = "tracks";
    renderScopeDialog();
  });
  $("#vocabScopeTopicSearch").addEventListener("input", renderScopeDialog);
  $("#vocabScopeSelectAll").addEventListener("click", () => {
    const ids = scopeTopicTrack === "all" ? SCOPE_STAGE_IDS.all : SCOPE_STAGE_IDS[scopeTopicTrack];
    ids.forEach(id => scopeStageDraft.add(id));
    scopeDraft = "custom";
    renderScopeDialog();
  });
  $("#vocabScopeClearTopics").addEventListener("click", () => {
    const ids = scopeTopicTrack === "all" ? SCOPE_STAGE_IDS.all : SCOPE_STAGE_IDS[scopeTopicTrack];
    ids.forEach(id => scopeStageDraft.delete(id));
    scopeDraft = "custom";
    renderScopeDialog();
  });
  $("#vocabScopeDialog").querySelectorAll("[data-scope-topic]").forEach(input => input.addEventListener("change", () => {
    scopeDraft = "custom";
    if (input.checked) scopeStageDraft.add(input.value); else scopeStageDraft.delete(input.value);
    renderScopeDialog();
  }));
  $("#vocabStages").addEventListener("click", event => {
    const stage = event.target.closest("[data-curriculum-stage]");
    if (stage) openCurriculumDialog(stage.dataset.curriculumStage);
  });
  $("#vocabCurriculumClose").addEventListener("click", closeCurriculumDialog);
  $("#vocabCurriculumCancel").addEventListener("click", closeCurriculumDialog);
  $("#vocabCurriculumPractice").addEventListener("click", practiseCurriculumTopic);
  $("#vocabCurriculumDialog").addEventListener("click", event => {
    if (event.target === event.currentTarget) closeCurriculumDialog();
  });
  $("#vocabCurriculumSearch").addEventListener("input", renderCurriculumDialog);
  $("#vocabCurriculumSort").addEventListener("change", event => {
    curriculumSort = event.target.value;
    renderCurriculumDialog();
  });
  $("#vocabCurriculumFilters").addEventListener("click", event => {
    const button = event.target.closest("[data-curriculum-filter]");
    if (!button) return;
    curriculumFilter = button.dataset.curriculumFilter;
    renderCurriculumDialog();
  });
  $("#vocabCurriculumWords").addEventListener("click", event => {
    const button = event.target.closest("[data-word-speak]");
    const word = button && WORDS.find(candidate => candidate.id === button.dataset.wordSpeak);
    if (word) speak(word);
  });
  $("#vocabManageVoices").addEventListener("click", () => window.KANA_SPRINT_SPEECH?.openSettings?.());
  $("#vocabQuestionFormat").addEventListener("change", event => {
    state.questionFormat = event.target.value;
    if (state.questionFormat === "audio-both") audioFormatCounts = { spoken: 0, speaking: 0 };
    updateFormatAvailability();
    saveState();
    current = null;
    nextQuestion();
  });
  $("#vocabPace").addEventListener("input", event => { state.pace = Number(event.target.value); renderProgress(); });
  $("#vocabPace").addEventListener("change", saveState);
  $("#vocabChoiceCount").addEventListener("change", event => { state.choiceCount = CHOICE_COUNT_VALUES.includes(event.target.value) ? event.target.value : "auto"; saveState(); });
  $("#vocabAutoPronounce").addEventListener("change", event => { state.autoPronounce = event.target.checked; saveState(); });
  window.addEventListener("kana-sprint-speech-voices-changed", updateFormatAvailability);
  document.addEventListener("keydown", event => {
    if (!$("#panel-vocabulary").classList.contains("active")) return;
    const target = event.target;
    const isInteractive = target instanceof HTMLElement && target.matches("button,a,select,input,textarea,[contenteditable='true']");
    const key = event.key.toLowerCase();
    if (event.key === "Enter" && phase === "introduction" && !isInteractive) {
      event.preventDefault();
      $("#vocabStartCheck")?.click();
      return;
    }
    if (key === "r" && !(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target?.isContentEditable)) {
      const replayButton = phase === "introduction" ? $("#vocabIntroSpeech") : phase === "question" && currentMode === "spoken" ? $("#vocabQuestionSpeech") : phase === "answered" ? $("#vocabReplayAnswer") : null;
      if (replayButton && !replayButton.disabled && !replayButton.classList.contains("hidden")) {
        event.preventDefault();
        replayButton.click();
        return;
      }
    }
    if (event.key === "Enter" && phase === "answered") { event.preventDefault(); if (!event.repeat) nextQuestion(); return; }
    if (/^[1-8]$/.test(event.key) && phase === "question" && currentMode !== "speaking" && !isInteractive) {
      const button = $("#vocabOptions").children[Number(event.key) - 1];
      if (button) { event.preventDefault(); button.click(); }
    }
  });
  if (location.hash === "#vocabulary" || document.body.dataset.activity === "vocabulary") switchToVocabulary();
})();

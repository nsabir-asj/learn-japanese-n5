(() => {
  "use strict";

  const STORAGE_KEY = "kanaSprintGuidedLessonsV1";
  const SPEECH_STORAGE_KEY = "kanaSprintSpeechV1";
  const VERSION = 1;
  const REVIEW_INTERVALS = [2 * 60000, 24 * 60 * 60000, 3 * 24 * 60 * 60000, 7 * 24 * 60 * 60000, 14 * 24 * 60 * 60000, 30 * 24 * 60 * 60000];
  const $ = selector => document.querySelector(selector);
  const shuffle = values => [...values].sort(() => Math.random() - .5);
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const normalize = value => String(value ?? "").toLowerCase().trim().replace(/[\s。、・,.!?！？:：'’_-]+/g, "").replace(/ō/g, "ou");

  const STAGES = [
    {
      id: "open", title: "Open the conversation", short: "Greetings that fit the moment", outcome: "Begin and close a first meeting naturally.",
      activities: [
        {
          id: "open-chunks", type: "teach", skill: "Conversation", kicker: "Useful chunks first", title: "Start with language you can use today",
          instruction: "Learn these as complete conversational actions. We will take them apart only when that helps you create new sentences.",
          body: `<div class="lesson-model"><div class="lesson-model-row"><span>Meeting for the first time</span><strong>はじめまして。</strong></div><div class="lesson-model-row"><span>Giving your name</span><strong>はるです。</strong></div><div class="lesson-model-row"><span>Closing the introduction</span><strong>よろしくおねがいします。</strong></div></div><div class="lesson-rule"><strong>Memory cue:</strong> a first introduction has three moves—open, identify yourself, and close warmly.</div>`,
          audioText: "はじめまして。はるです。よろしくおねがいします。"
        },
        {
          id: "open-situation", type: "choice", skill: "Conversation", kicker: "Choose by situation", title: "You meet a new classmate for the first time.",
          prompt: "What should you say first?", options: ["はじめまして。", "おやすみなさい。", "いただきます。", "いってきます。"], answer: 0,
          correction: "はじめまして。", explanation: "はじめまして marks the beginning of a first meeting. It is not a general hello used with people you already know.", audioText: "はじめまして。"
        },
        {
          id: "open-listen", type: "choice", skill: "Listening", kicker: "Listen before reading", title: "What did the speaker say?", prompt: "Play the Japanese, then choose its purpose.",
          listenOnly: true, audioText: "よろしくおねがいします。", options: ["A polite close to an introduction", "A morning greeting", "An apology after a mistake", "A phrase used before eating"], answer: 0,
          correction: "よろしくおねがいします。", explanation: "In a first meeting, this politely closes your introduction and expresses goodwill."
        },
        {
          id: "open-build", type: "tiles", skill: "Production", kicker: "Build the exchange", title: "Introduce Haru in a natural order.", prompt: "Arrange the three chunks.",
          tokens: ["はじめまして。", "はるです。", "よろしくおねがいします。"], answer: ["はじめまして。", "はるです。", "よろしくおねがいします。"],
          correction: "はじめまして。はるです。よろしくおねがいします。", explanation: "The sequence mirrors the social job of each chunk: opening, identity, then a courteous close.", audioText: "はじめまして。はるです。よろしくおねがいします。"
        },
        {
          id: "open-response", type: "choice", skill: "Conversation", kicker: "Respond naturally", title: "A new classmate introduces herself.",
          context: "めい：はじめまして。めいです。よろしくおねがいします。", prompt: "Which reply best continues the meeting?",
          options: ["はじめまして。けんです。よろしくおねがいします。", "いいえ、ちがいます。", "ごちそうさまでした。", "おやすみなさい。"], answer: 0,
          correction: "はじめまして。けんです。よろしくおねがいします。", explanation: "Mirror the first-meeting structure while supplying your own name."
        }
      ]
    },
    {
      id: "identity", title: "Say who you are", short: "Identity statements with は and です", outcome: "Create simple statements about yourself and other people.",
      activities: [
        {
          id: "identity-pattern", type: "teach", skill: "Grammar", kicker: "Grammar when you need it", title: "Use X は Y です to identify someone",
          instruction: "X is the topic—the person or thing already under discussion. Y identifies or describes that topic.",
          body: `<div class="lesson-model"><div class="lesson-model-row"><span>Pattern</span><strong>X は Y です。</strong></div><div class="lesson-model-row"><span>Example</span><strong>めいさんは がくせいです。</strong></div><div class="lesson-model-row"><span>Natural English</span><strong>Mei is a student.</strong></div></div><div class="lesson-rule"><strong>Important:</strong> topic は is written は but pronounced <em>wa</em>. Japanese also omits X when the topic is already obvious.</div>`,
          audioText: "めいさんは、がくせいです。"
        },
        {
          id: "identity-meaning", type: "choice", skill: "Grammar", kicker: "Read the relationship", title: "けんさんは せんせいです。", prompt: "What information does this sentence give?",
          options: ["Ken is a teacher.", "Ken’s teacher", "Is Ken a teacher?", "Ken is not a teacher."], answer: 0,
          correction: "Ken is a teacher.", explanation: "は establishes Ken as the topic; せんせいです identifies him as a teacher.", audioText: "けんさんは、せんせいです。"
        },
        {
          id: "identity-build", type: "tiles", skill: "Production", kicker: "Construct the pattern", title: "Build: “I am a student.”", prompt: "Put the Japanese pieces in order.",
          tokens: ["わたしは", "がくせい", "です。"], answer: ["わたしは", "がくせい", "です。"], correction: "わたしは がくせいです。",
          explanation: "The topic comes first, followed by the identity or description and です.", audioText: "わたしは、がくせいです。"
        },
        {
          id: "identity-omit", type: "choice", skill: "Conversation", kicker: "Sound more natural", title: "Someone asks: がくせいですか。", prompt: "You are a student. Which short answer is most natural?",
          options: ["はい、がくせいです。", "わたしは、はいです。", "がくせいはわたしですか。", "はい、がくせいですか。"], answer: 0,
          correction: "はい、がくせいです。", explanation: "The question already establishes you as the topic, so repeating わたしは is unnecessary.", audioText: "はい、がくせいです。"
        },
        {
          id: "identity-other", type: "tiles", skill: "Production", kicker: "Describe another person", title: "Build: “Mei is an office worker.”", prompt: "Create the complete statement.",
          tokens: ["めいさんは", "かいしゃいん", "です。"], answer: ["めいさんは", "かいしゃいん", "です。"], correction: "めいさんは かいしゃいんです。",
          explanation: "The same frame works for many identities: student, teacher, office worker, nationality, major, and more.", audioText: "めいさんは、かいしゃいんです。"
        }
      ]
    },
    {
      id: "ask", title: "Ask back", short: "Questions and useful answers", outcome: "Ask for personal information and answer without repeating unnecessary words.",
      activities: [
        {
          id: "ask-pattern", type: "teach", skill: "Grammar", kicker: "Turn information into interaction", title: "Add か to ask a polite question",
          instruction: "A statement becomes a question when か is added at the end. Question words replace the missing information you want.",
          body: `<div class="lesson-model"><div class="lesson-model-row"><span>Yes / no</span><strong>がくせいですか。</strong></div><div class="lesson-model-row"><span>Ask for a major</span><strong>せんこうは なんですか。</strong></div><div class="lesson-model-row"><span>Ask a school year</span><strong>なんねんせいですか。</strong></div></div><div class="lesson-rule">Learn questions together with their likely answers. That creates a usable conversational pair instead of an isolated grammar fact.</div>`,
          audioText: "せんこうは、なんですか。"
        },
        {
          id: "ask-yes-no", type: "choice", skill: "Conversation", kicker: "Answer the real question", title: "にほんじんですか。", prompt: "You are not Japanese; you are Bangladeshi. Choose the clearest answer.",
          options: ["いいえ、バングラデシュじんです。", "はい、にほんじんです。", "なんじんですか。", "いいえ、がくせいですか。"], answer: 0,
          correction: "いいえ、バングラデシュじんです。", explanation: "A useful correction does more than say no—it supplies the accurate information.", audioText: "いいえ、バングラデシュじんです。"
        },
        {
          id: "ask-major", type: "tiles", skill: "Production", kicker: "Generate the question", title: "Ask: “What is your major?”", prompt: "Build the question from meaning, not by copying a model.",
          tokens: ["せんこうは", "なん", "です", "か。"], answer: ["せんこうは", "なん", "です", "か。"], correction: "せんこうは なんですか。",
          explanation: "なん occupies the missing-information position; か makes the whole sentence a question.", audioText: "せんこうは、なんですか。"
        },
        {
          id: "ask-year", type: "choice", skill: "Grammar", kicker: "Question from answer", title: "The answer is: にねんせいです。", prompt: "Which question most directly produced that answer?",
          options: ["なんねんせいですか。", "なんさいですか。", "せんこうはなんですか。", "なんじですか。"], answer: 0,
          correction: "なんねんせいですか。", explanation: "なんねんせい asks which year someone is in at school; にねんせい answers second year.", audioText: "なんねんせいですか。"
        },
        {
          id: "ask-listen-age", type: "choice", skill: "Listening", kicker: "Recognize the question", title: "What information is being requested?", prompt: "Listen without Japanese text.",
          listenOnly: true, audioText: "なんさいですか。", options: ["Age", "School year", "Telephone number", "Current time"], answer: 0,
          correction: "なんさいですか。", explanation: "なんさい asks how many years old someone is. Keep it distinct from なんねんせい, which asks a school year."
        }
      ]
    },
    {
      id: "connect", title: "Make connections", short: "Useful relationships with の", outcome: "Build noun phrases such as a person’s major or a Japanese-language student.",
      activities: [
        {
          id: "connect-pattern", type: "teach", skill: "Grammar", kicker: "One relationship, many uses", title: "Use の to connect two nouns",
          instruction: "The noun after の is the main idea. The noun before の narrows or identifies it.",
          body: `<div class="lesson-model"><div class="lesson-model-row"><span>Person → possession</span><strong>めいさんの なまえ</strong></div><div class="lesson-model-row"><span>Field → kind of person</span><strong>にほんごの がくせい</strong></div><div class="lesson-model-row"><span>Institution → affiliation</span><strong>だいがくの せんせい</strong></div></div><div class="lesson-rule"><strong>Head-noun test:</strong> ask “What kind of thing is the whole phrase?” In だいがくの せんせい, the whole phrase is a kind of せんせい.</div>`,
          audioText: "にほんごの、がくせい。"
        },
        {
          id: "connect-main", type: "choice", skill: "Grammar", kicker: "Find the main idea", title: "にほんごの がくせい", prompt: "What kind of thing is this whole phrase?",
          options: ["A student", "A language", "A country", "A teacher"], answer: 0,
          correction: "A student of Japanese", explanation: "がくせい is the final noun and the main idea; にほんご specifies what the student studies.", audioText: "にほんごの、がくせい。"
        },
        {
          id: "connect-build", type: "tiles", skill: "Production", kicker: "Order the relationship", title: "Build: “a university teacher”", prompt: "Put the specifying noun before の and the main idea after it.",
          tokens: ["だいがく", "の", "せんせい"], answer: ["だいがく", "の", "せんせい"], correction: "だいがくの せんせい",
          explanation: "The university specifies which kind of teacher, so だいがく comes before の.", audioText: "だいがくの、せんせい。"
        },
        {
          id: "connect-possess", type: "choice", skill: "Grammar", kicker: "Read possession", title: "みかさんの ともだち", prompt: "Choose the most natural meaning.",
          options: ["Mika’s friend", "A friend named Mika", "Mika’s teacher", "A Japanese friend"], answer: 0,
          correction: "Mika’s friend", explanation: "A person before の commonly identifies possession or association.", audioText: "みかさんの、ともだち。"
        },
        {
          id: "connect-sentence", type: "tiles", skill: "Production", kicker: "Use の inside a sentence", title: "Build: “Yuki’s major is history.”", prompt: "Connect the owner and the topic before completing the statement.",
          tokens: ["ゆきさんの", "せんこうは", "れきし", "です。"], answer: ["ゆきさんの", "せんこうは", "れきし", "です。"], correction: "ゆきさんの せんこうは れきしです。",
          explanation: "ゆきさんの modifies せんこう. The complete noun phrase then becomes the topic marked by は.", audioText: "ゆきさんの、せんこうは、れきしです。"
        }
      ]
    },
    {
      id: "details", title: "Exchange details", short: "Age, school year, phone, and time", outcome: "Use familiar numbers inside real questions and recognize the important irregular forms.",
      activities: [
        {
          id: "details-context", type: "teach", skill: "Details", kicker: "Apply number knowledge", title: "Numbers change shape inside useful expressions",
          instruction: "Kana Mix already teaches general number construction. Here, focus only on the forms required for conversation.",
          body: `<div class="lesson-model"><div class="lesson-model-row"><span>Age</span><strong>なんさいですか。→ はたちです。</strong></div><div class="lesson-model-row"><span>School year</span><strong>なんねんせいですか。→ よねんせいです。</strong></div><div class="lesson-model-row"><span>Telephone</span><strong>でんわばんごうは なんばんですか。</strong></div><div class="lesson-model-row"><span>Time</span><strong>なんじですか。→ よじはんです。</strong></div></div><div class="lesson-rule">Irregular readings are easier to remember as complete answers—はたちです, よねんせいです, よじです—rather than as detached exceptions. Repeat a telephone number with ですね to confirm what you heard.</div>`,
          audioText: "なんじですか。よじはんです。"
        },
        {
          id: "details-age", type: "choice", skill: "Details", kicker: "Recall the whole answer", title: "Someone is 20 years old.", prompt: "Which answer is standard and natural?",
          options: ["はたちです。", "にじゅうさいです。", "にねんせいです。", "はちさいです。"], answer: 0,
          correction: "はたちです。", explanation: "Twenty years old has the special reading はたち. Learn it as a complete conversational answer.", audioText: "はたちです。"
        },
        {
          id: "details-year", type: "choice", skill: "Details", kicker: "Avoid a common interference", title: "Takeshi is a fourth-year student.", prompt: "Choose the correct school-year expression.",
          options: ["よねんせいです。", "よんねんせいです。", "よじです。", "よんさいです。"], answer: 0,
          correction: "よねんせいです。", explanation: "Four is read よ in よねんせい. Learn the complete unit instead of applying よん automatically.", audioText: "よねんせいです。"
        },
        {
          id: "details-phone", type: "input", skill: "Listening", kicker: "Audio-only details", title: "Enter the telephone digits.", prompt: "Listen and type only the four digits.",
          audioText: "さん、ぜろ、はち、よん", answers: ["3084"], inputMode: "numeric", placeholder: "Four digits", correction: "3084",
          explanation: "Telephone numbers are read one digit at a time. Replaying is allowed because the skill is accurate decoding, not memory for the recording."
        },
        {
          id: "details-time", type: "choice", skill: "Details", kicker: "Time in context", title: "The clock shows 4:00.", prompt: "How would you answer なんじですか。?",
          options: ["よじです。", "よんじです。", "よねんせいです。", "よじはんです。"], answer: 0,
          correction: "よじです。", explanation: "Four o’clock uses よじ. よじはん would mean 4:30.", audioText: "よじです。"
        },
        {
          id: "details-time-listen", type: "input", skill: "Listening", kicker: "Hear a complete time", title: "What time did you hear?", prompt: "Enter the time using digits and a colon.",
          audioText: "ごぜん、くじはんです。", answers: ["9:30", "09:30"], inputMode: "text", placeholder: "9:30", correction: "9:30 a.m. · ごぜん くじはん",
          explanation: "ごぜん signals a.m.; くじ is nine o’clock and はん adds half past."
        }
      ]
    },
    {
      id: "mission", title: "Have the conversation", short: "Combine everything in a new meeting", outcome: "Follow and respond to an unfamiliar first-meeting exchange.",
      activities: [
        {
          id: "mission-setup", type: "teach", skill: "Conversation", kicker: "Conversation mission", title: "Meet Aoi without memorising a script",
          instruction: "Aoi’s information is new, but every conversational job is familiar: greet, identify, ask, understand, and close.",
          body: `<div class="lesson-speaker"><div class="lesson-avatar">葵</div><div><strong>Aoi Tanaka</strong><span>University student · biology · third year · 21 years old</span></div></div><div class="lesson-model"><div class="lesson-model-row"><span>Aoi’s opening</span><strong>はじめまして。たなか あおいです。</strong></div></div><div class="lesson-rule">Choose what performs the right conversational job. Some wrong options are grammatical Japanese but do not fit the moment.</div>`,
          audioText: "はじめまして。たなか、あおいです。"
        },
        {
          id: "mission-greet", type: "choice", skill: "Conversation", kicker: "Mission · opening", title: "Aoi: はじめまして。たなか あおいです。", prompt: "Respond and introduce yourself.",
          options: ["はじめまして。よろしくおねがいします。", "なんじですか。", "いいえ、ちがいます。", "ごちそうさまでした。"], answer: 0,
          correction: "はじめまして。よろしくおねがいします。", explanation: "Match the first-meeting opening before moving to personal questions.", audioText: "はじめまして。よろしくおねがいします。"
        },
        {
          id: "mission-understand", type: "choice", skill: "Listening", kicker: "Mission · understand", title: "What did Aoi tell you?", prompt: "Listen, then choose the accurate information.",
          listenOnly: true, audioText: "せんこうは、せいぶつがくです。さんねんせいです。", options: ["Her major is biology and she is a third-year student.", "She teaches biology to third-year students.", "She is 30 years old and studies history.", "Her friend is a biology teacher."], answer: 0,
          correction: "Biology major · third-year student", explanation: "せんこう identifies the field of study; さんねんせい identifies the school year."
        },
        {
          id: "mission-ask", type: "tiles", skill: "Production", kicker: "Mission · ask back", title: "Ask Aoi’s age.", prompt: "Construct the shortest natural question.",
          tokens: ["なんさい", "です", "か。"], answer: ["なんさい", "です", "か。"], correction: "なんさいですか。", explanation: "The person is already established in the conversation, so repeating あおいさんは is optional.", audioText: "なんさいですか。"
        },
        {
          id: "mission-age", type: "choice", skill: "Listening", kicker: "Mission · decode the answer", title: "Choose the age you heard.", prompt: "Listen to Aoi’s answer.",
          listenOnly: true, audioText: "にじゅういっさいです。", options: ["21", "20", "12", "Fourth year"], answer: 0,
          correction: "21 years old · にじゅういっさい", explanation: "The final いち combines with さい as いっさい. This is a contextual sound change, not a new number system."
        },
        {
          id: "mission-close", type: "choice", skill: "Conversation", kicker: "Mission · close", title: "The first exchange is complete.", prompt: "Which response closes it warmly without abruptly changing topics?",
          options: ["そうですか。よろしくおねがいします。", "でんわばんごうはなんばんですか。", "いいえ、はたちです。", "おはようございますか。"], answer: 0,
          correction: "そうですか。よろしくおねがいします。", explanation: "そうですか acknowledges the new information; よろしくおねがいします provides an appropriate first-meeting close.", audioText: "そうですか。よろしくおねがいします。"
        }
      ]
    }
  ];

  const ANSWER_BREAKDOWNS = {
    "open-situation": [["はじめまして", "nice to meet you · first-meeting opener"]],
    "open-listen": [["よろしく", "favorably · with goodwill"], ["おねがいします", "please · literally, I make a request"]],
    "open-build": [["はじめまして", "nice to meet you"], ["はる", "Haru"], ["です", "am · polite ending"], ["よろしくおねがいします", "please treat me kindly · polite close"]],
    "open-response": [["はじめまして", "nice to meet you"], ["けん", "Ken"], ["です", "am · polite ending"], ["よろしくおねがいします", "please treat me kindly · polite close"]],
    "identity-meaning": [["けんさん", "Ken · さん adds polite respect"], ["は", "topic marker · pronounced wa"], ["せんせい", "teacher"], ["です", "is · polite ending"]],
    "identity-build": [["わたし", "I · me"], ["は", "topic marker · pronounced wa"], ["がくせい", "student"], ["です", "am · polite ending"]],
    "identity-omit": [["はい", "yes"], ["がくせい", "student"], ["です", "am · polite ending"]],
    "identity-other": [["めいさん", "Mei · さん adds polite respect"], ["は", "topic marker · pronounced wa"], ["かいしゃいん", "office worker · company employee"], ["です", "is · polite ending"]],
    "ask-yes-no": [["いいえ", "no"], ["バングラデシュじん", "Bangladeshi person"], ["です", "am · polite ending"]],
    "ask-major": [["せんこう", "major · field of study"], ["は", "topic marker · pronounced wa"], ["なん", "what"], ["です", "is · polite ending"], ["か", "question marker"]],
    "ask-year": [["なん", "what · which"], ["ねんせい", "school year"], ["です", "is · polite ending"], ["か", "question marker"]],
    "ask-listen-age": [["なんさい", "how old · what age"], ["です", "is · polite ending"], ["か", "question marker"]],
    "connect-main": [["にほんご", "Japanese language"], ["の", "connects and specifies nouns"], ["がくせい", "student · the main noun"]],
    "connect-build": [["だいがく", "university"], ["の", "of · associated with"], ["せんせい", "teacher · the main noun"]],
    "connect-possess": [["みかさん", "Mika · さん adds polite respect"], ["の", "Mika’s · possession or association"], ["ともだち", "friend · the main noun"]],
    "connect-sentence": [["ゆきさん", "Yuki · さん adds polite respect"], ["の", "Yuki’s · possession or association"], ["せんこう", "major · field of study"], ["は", "topic marker · pronounced wa"], ["れきし", "history"], ["です", "is · polite ending"]],
    "details-age": [["はたち", "20 years old · special reading"], ["です", "is · polite ending"]],
    "details-year": [["よねんせい", "fourth-year student · special よ reading"], ["です", "is · polite ending"]],
    "details-phone": [["さん", "three"], ["ぜろ", "zero"], ["はち", "eight"], ["よん", "four"]],
    "details-time": [["よじ", "four o’clock · special よ reading"], ["です", "is · polite ending"]],
    "details-time-listen": [["ごぜん", "a.m. · before noon"], ["くじ", "nine o’clock"], ["はん", "half past"], ["です", "is · polite ending"]],
    "mission-greet": [["はじめまして", "nice to meet you"], ["よろしくおねがいします", "please treat me kindly · polite close"]],
    "mission-understand": [["せんこう", "major · field of study"], ["は", "topic marker · pronounced wa"], ["せいぶつがく", "biology"], ["です", "is · polite ending"], ["さんねんせい", "third-year student"], ["です", "is · polite ending"]],
    "mission-ask": [["なんさい", "how old · what age"], ["です", "is · polite ending"], ["か", "question marker"]],
    "mission-age": [["にじゅういっさい", "21 years old · いち + さい becomes いっさい"], ["です", "is · polite ending"]],
    "mission-close": [["そうですか", "I see · acknowledges new information"], ["よろしくおねがいします", "please treat me kindly · polite close"]]
  };

  const GUIDE_BREAKDOWNS = {
    "open-chunks": [
      { pieces: [["はじめまして", "nice to meet you · first-meeting opener"]], insight: "Use this when meeting someone for the first time, not as an everyday hello." },
      { pieces: [["はる", "Haru · a name"], ["です", "am · polite ending"]], insight: "Place your name before です to give it politely: ［name］です。" },
      { pieces: [["よろしく", "favorably · with goodwill"], ["おねがいします", "please · literally, I make a request"]], insight: "Learn the full expression as a courteous close to an introduction." }
    ],
    "identity-pattern": [
      { pieces: [["X", "the topic"], ["は", "topic marker · pronounced wa"], ["Y", "identity or description"], ["です", "is / am · polite ending"]], insight: "Use X は Y です to identify or describe the current topic." },
      { pieces: [["めいさん", "Mei · さん adds polite respect"], ["は", "topic marker · pronounced wa"], ["がくせい", "student"], ["です", "is · polite ending"]], insight: "Replace Mei and student to create many new identity statements." },
      null
    ],
    "ask-pattern": [
      { pieces: [["がくせい", "student"], ["です", "is / are · polite ending"], ["か", "question marker"]], insight: "Add か after a polite statement to turn it into a yes-or-no question." },
      { pieces: [["せんこう", "major · field of study"], ["は", "topic marker · pronounced wa"], ["なん", "what"], ["です", "is · polite ending"], ["か", "question marker"]], insight: "Put なん where the missing information belongs, then finish with ですか." },
      { pieces: [["なん", "what · which"], ["ねんせい", "school year"], ["です", "is · polite ending"], ["か", "question marker"]], insight: "なん combines with ねんせい to ask which school year someone is in." }
    ],
    "connect-pattern": [
      { pieces: [["めいさん", "Mei · the associated person"], ["の", "Mei’s · possession or association"], ["なまえ", "name · the main noun"]], insight: "A person before の commonly marks possession or association." },
      { pieces: [["にほんご", "Japanese language · the field"], ["の", "connects and specifies nouns"], ["がくせい", "student · the main noun"]], insight: "The noun before の specifies the kind of student." },
      { pieces: [["だいがく", "university · the institution"], ["の", "of · affiliated with"], ["せんせい", "teacher · the main noun"]], insight: "Read from the main noun backward: a teacher associated with a university." }
    ],
    "details-context": [
      { pieces: [["なんさい", "how old · what age"], ["です", "is · polite ending"], ["か", "question marker"], ["はたち", "20 years old · special reading"], ["です", "is · polite ending"]], insight: "Learn はたち as the complete conversational answer for age 20." },
      { pieces: [["なん", "what · which"], ["ねんせい", "school year"], ["ですか", "is it? · polite question"], ["よねんせい", "fourth-year student · special よ reading"], ["です", "is · polite ending"]], insight: "Four uses the special reading よ inside よねんせい." },
      { pieces: [["でんわばんごう", "telephone number"], ["は", "topic marker · pronounced wa"], ["なんばん", "what number"], ["です", "is · polite ending"], ["か", "question marker"]], insight: "The complete topic でんわばんごう comes before は; なんばん asks for the number." },
      { pieces: [["なんじ", "what time"], ["ですか", "is it? · polite question"], ["よじ", "four o’clock · special よ reading"], ["はん", "half past"], ["です", "is · polite ending"]], insight: "Attach はん after the hour to express half past: よじはん is 4:30." }
    ],
    "mission-setup": [
      { pieces: [["はじめまして", "nice to meet you"], ["たなか", "Tanaka · family name"], ["あおい", "Aoi · given name"], ["です", "am · polite ending"]], insight: "Aoi opens the meeting and then supplies her name with です." }
    ]
  };

  const ALL_ACTIVITIES = STAGES.flatMap((stage, stageIndex) => stage.activities.map((activity, activityIndex) => ({ ...activity, stageIndex, activityIndex })));
  const GRADED_ACTIVITIES = ALL_ACTIVITIES.filter(activity => activity.type !== "teach");

  function defaultState() {
    return {
      version: VERSION, unlockedStage: 0, currentStage: 0, total: 0, correct: 0, streak: 0, bestStreak: 0,
      activities: {}, recent: [], viewedGuides: [], profile: { name: "", home: "", role: "", field: "", year: "", age: "" }, savedAt: 0
    };
  }

  function loadState() {
    const fallback = defaultState();
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && saved.version === VERSION) return { ...fallback, ...saved, activities: { ...(saved.activities || {}) }, profile: { ...fallback.profile, ...(saved.profile || {}) } };
    } catch (error) {
      console.warn("Could not load guided-lesson progress.", error);
    }
    return fallback;
  }

  let state = loadState();
  state.unlockedStage = clamp(Number(state.unlockedStage) || 0, 0, STAGES.length - 1);
  state.currentStage = clamp(Number(state.currentStage) || 0, 0, state.unlockedStage);
  let mode = "learn";
  let currentActivity = null;
  let currentAnswered = false;
  let stageCursor = null;
  let tileSelection = [];
  let tileBank = [];
  let checkpointQueue = [];
  let checkpointIndex = 0;
  let checkpointCorrect = 0;
  let currentAudioText = "";
  let speechVoices = [];
  let emptyNextMode = null;

  function activityState(activity) {
    if (!state.activities[activity.id]) state.activities[activity.id] = {
      completed: false, seen: 0, correct: 0, wrong: 0, mastery: 0, interval: -1, lastSeen: 0, dueAt: 0, lastWasCorrect: null
    };
    return state.activities[activity.id];
  }

  function saveState() {
    state.savedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    renderTopStats();
    renderRoadmap();
  }

  function stageComplete(stageIndex) {
    return STAGES[stageIndex].activities.every(activity => activityState(activity).completed);
  }

  function completedGraded() {
    return GRADED_ACTIVITIES.filter(activity => activityState(activity).completed);
  }

  function masteryAverage(activities = completedGraded()) {
    if (!activities.length) return 0;
    return activities.reduce((sum, activity) => sum + activityState(activity).mastery, 0) / activities.length;
  }

  function renderTopStats() {
    const completed = ALL_ACTIVITIES.filter(activity => activityState(activity).completed).length;
    const due = completedGraded().filter(activity => activityState(activity).dueAt && activityState(activity).dueAt <= Date.now()).length;
    $("#lessonCompletion").textContent = `${Math.round(completed / ALL_ACTIVITIES.length * 100)}%`;
    $("#lessonMastery").textContent = `${Math.round(masteryAverage())}%`;
    $("#lessonStreak").textContent = state.streak;
    $("#lessonDue").textContent = due;
    const stat = $("#lessonStreakStat");
    stat.className = "stat streak-stat";
    const tier = state.streak >= 200 ? 8 : state.streak >= 150 ? 7 : state.streak >= 100 ? 6 : state.streak >= 75 ? 5 : state.streak >= 50 ? 4 : state.streak >= 25 ? 3 : state.streak >= 15 ? 2 : state.streak >= 5 ? 1 : 0;
    if (tier) stat.classList.add(`streak-tier-${tier}`);
  }

  function renderRoadmap() {
    $("#lessonStageCount").textContent = `${state.currentStage + 1} / ${STAGES.length}`;
    $("#lessonRoadmap").innerHTML = STAGES.map((stage, index) => {
      const complete = stageComplete(index);
      const locked = index > state.unlockedStage;
      const current = index === state.currentStage && mode === "learn";
      return `<button class="lesson-roadmap-step ${complete ? "complete" : ""} ${current ? "active" : ""}" data-stage="${index}" type="button" ${locked ? "disabled" : ""}><span class="lesson-roadmap-number">${complete ? "✓" : index + 1}</span><span class="lesson-roadmap-copy"><strong>${stage.title}</strong><span>${stage.short}</span></span><span class="lesson-roadmap-status">${locked ? "Locked" : complete ? "Complete" : current ? "Now" : "Open"}</span></button>`;
    }).join("");
    $("#lessonRoadmap").querySelectorAll("[data-stage]").forEach(button => button.addEventListener("click", () => {
      state.currentStage = Number(button.dataset.stage);
      stageCursor = 0;
      saveState();
      setMode("learn");
    }));
  }

  function clearControls() {
    ["#lessonDontKnow", "#lessonClear", "#lessonSubmit", "#lessonNext"].forEach(selector => $(selector).classList.add("hidden"));
    $("#lessonFeedback").className = "feedback lesson-feedback";
    $("#lessonFeedback").innerHTML = "";
    currentAnswered = false;
    tileSelection = [];
    tileBank = [];
  }

  function renderActivity(activity) {
    emptyNextMode = null;
    currentActivity = activity;
    currentAudioText = activity.audioText || "";
    clearControls();
    $("#lessonNext").innerHTML = `${mode === "practice" ? "Next review" : mode === "checkpoint" ? "Next question" : "Continue"} <kbd>Enter</kbd>`;
    const progress = activityState(activity);
    const stage = STAGES[activity.stageIndex];
    const stageCompleted = stage.activities.filter(item => activityState(item).completed).length;
    $("#lessonStageProgress").style.width = `${stageCompleted / stage.activities.length * 100}%`;
    $("#lessonQuestionCount").textContent = mode === "checkpoint" ? `Question ${checkpointIndex + 1} of ${checkpointQueue.length}` : mode === "practice" ? `${progress.seen} previous attempts` : `Activity ${activity.activityIndex + 1} of ${stage.activities.length}`;
    $("#lessonSessionTitle").textContent = stage.outcome;
    $("#lessonSessionCopy").textContent = activity.explanation || activity.instruction || "Retrieve the idea in a new form before moving on.";
    $("#lessonReplay").disabled = !currentAudioText || !japaneseSpeechReady();

    if (activity.type === "teach") renderTeach(activity);
    if (activity.type === "choice") renderChoice(activity);
    if (activity.type === "tiles") renderTiles(activity);
    if (activity.type === "input") renderInput(activity);
    if (activity.audioText && (activity.listenOnly || activity.type === "input")) setTimeout(() => speakJapanese(activity.audioText), 120);
  }

  function activityHeading(activity) {
    return `<div class="lesson-activity-heading"><span class="lesson-activity-kicker">${activity.kicker}</span><h2>${activity.title}</h2>${activity.instruction ? `<p>${activity.instruction}</p>` : ""}</div>`;
  }

  function renderTeach(activity) {
    const personalized = activity.id === "mission-setup" ? profileMissionCard() : "";
    $("#lessonActivity").innerHTML = activityHeading(activity) + activity.body + personalized;
    enhanceGuideExamples(activity);
    $("#lessonNext").classList.remove("hidden");
    $("#lessonKeyboardHint").textContent = "Read for meaning, listen once, then continue into retrieval practice.";
  }

  function enhanceGuideExamples(activity) {
    const guide = GUIDE_BREAKDOWNS[activity.id];
    if (!guide) return;
    const rows = [...$("#lessonActivity").querySelectorAll(".lesson-model-row")].slice(0, guide.length);
    state.viewedGuides = Array.isArray(state.viewedGuides) ? state.viewedGuides : [];
    const firstVisit = !state.viewedGuides.includes(activity.id);
    const model = rows[0]?.parentElement;
    if (model) model.insertAdjacentHTML("afterbegin", `<p class="lesson-guide-help">Open an example to see what each part means.</p>`);

    rows.forEach((row, index) => {
      const detail = guide[index];
      if (!detail) return;
      const label = row.querySelector("span")?.textContent || "Example";
      const example = row.querySelector("strong")?.textContent || "";
      const panelId = `lessonGuide-${activity.id}-${index}`;
      row.classList.add("lesson-guide-row");
      row.innerHTML = `<button class="lesson-guide-toggle" type="button" aria-expanded="false" aria-controls="${panelId}"><span class="lesson-guide-copy"><span>${escapeHtml(label)}</span><strong>${escapeHtml(example)}</strong></span><span class="lesson-guide-action">Breakdown <span class="lesson-guide-chevron" aria-hidden="true">⌄</span></span></button><div class="lesson-guide-detail" id="${panelId}" hidden><div class="lesson-breakdown-pieces">${detail.pieces.map(([piece, meaning]) => `<span class="lesson-breakdown-piece"><strong>${escapeHtml(piece)}</strong><small>${escapeHtml(meaning)}</small></span>`).join("")}</div><p><strong>Pattern:</strong> ${escapeHtml(detail.insight)}</p></div>`;
    });

    const toggles = rows.flatMap(row => [...row.querySelectorAll(".lesson-guide-toggle")]);
    const setOpen = (button, open) => {
      button.setAttribute("aria-expanded", String(open));
      button.closest(".lesson-guide-row").querySelector(".lesson-guide-detail").hidden = !open;
    };
    toggles.forEach(button => button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") !== "true";
      toggles.forEach(other => setOpen(other, false));
      setOpen(button, open);
    }));
    if (firstVisit && toggles[0]) {
      setOpen(toggles[0], true);
      state.viewedGuides.push(activity.id);
      saveState();
    }
  }

  function profileMissionCard() {
    const details = [
      state.profile.name && ["Name", state.profile.name], state.profile.home && ["Home", state.profile.home],
      state.profile.role && ["Role", state.profile.role], state.profile.field && ["Field", state.profile.field],
      state.profile.year && ["School year", state.profile.year], state.profile.age && ["Age", state.profile.age]
    ].filter(Boolean);
    if (!details.length) return `<div class="lesson-rule"><strong>Your side of the mission:</strong> answer with your real details aloud. You can save optional practice details under Progress.</div>`;
    return `<div class="lesson-model"><div class="lesson-model-row"><span>Your introduction</span><strong>はじめまして。［${escapeHtml(state.profile.name || "your name")}］です。</strong></div>${details.filter(detail => detail[0] !== "Name").map(detail => `<div class="lesson-model-row"><span>${escapeHtml(detail[0])}</span><strong>${escapeHtml(detail[1])}</strong></div>`).join("")}</div><div class="lesson-rule">Say your real information aloud before choosing Aoi’s next response. The app keeps these details only in this browser.</div>`;
  }

  function promptMarkup(activity) {
    const context = activity.context ? `<div class="lesson-context">${escapeHtml(activity.context)}</div>` : "";
    const listening = activity.listenOnly ? `<button class="lesson-listen-button" type="button" data-listen aria-label="Play Japanese again">🔊</button>` : "";
    return `${context}<div class="lesson-prompt">${listening}<span class="lesson-prompt-label">Your task</span><div>${escapeHtml(activity.prompt || "Choose the best answer.")}</div></div>`;
  }

  function renderChoice(activity) {
    $("#lessonActivity").innerHTML = activityHeading(activity) + promptMarkup(activity) + `<div class="lesson-choice-grid">${activity.options.map((option, index) => `<button class="lesson-choice" data-choice="${index}" type="button"><span class="lesson-choice-number">${index + 1}</span><span>${escapeHtml(option)}</span></button>`).join("")}</div>`;
    $("#lessonActivity").querySelector("[data-listen]")?.addEventListener("click", () => speakJapanese(activity.audioText));
    $("#lessonActivity").querySelectorAll("[data-choice]").forEach(button => button.addEventListener("click", () => gradeAnswer(Number(button.dataset.choice) === activity.answer, Number(button.dataset.choice))));
    $("#lessonDontKnow").classList.remove("hidden");
    $("#lessonKeyboardHint").textContent = "Keyboard: 1–4 choose an answer. Replays do not reduce mastery.";
  }

  function renderTiles(activity) {
    tileBank = shuffle(activity.tokens.map((text, index) => ({ id: `${activity.id}-${index}`, text })));
    $("#lessonActivity").innerHTML = activityHeading(activity) + promptMarkup(activity) + `<div class="lesson-tiles"><div class="lesson-tile-answer" id="lessonTileAnswer"></div><div class="lesson-tile-bank" id="lessonTileBank"></div></div>`;
    renderTileControls();
    $("#lessonClear").classList.remove("hidden");
    $("#lessonSubmit").classList.remove("hidden");
    $("#lessonDontKnow").classList.remove("hidden");
    $("#lessonKeyboardHint").textContent = "Build from meaning. Click an answer tile to return it to the bank.";
  }

  function renderTileControls() {
    const answer = $("#lessonTileAnswer");
    const bank = $("#lessonTileBank");
    if (!answer || !bank) return;
    answer.innerHTML = tileSelection.map((token, index) => `<button class="lesson-tile selected" data-answer-tile="${index}" type="button">${escapeHtml(token.text)}</button>`).join("");
    const selectedIds = new Set(tileSelection.map(token => token.id));
    bank.innerHTML = tileBank.filter(token => !selectedIds.has(token.id)).map(token => `<button class="lesson-tile" data-bank-tile="${token.id}" type="button">${escapeHtml(token.text)}</button>`).join("");
    answer.querySelectorAll("[data-answer-tile]").forEach(button => button.addEventListener("click", () => {
      tileSelection.splice(Number(button.dataset.answerTile), 1);
      renderTileControls();
    }));
    bank.querySelectorAll("[data-bank-tile]").forEach(button => button.addEventListener("click", () => {
      const token = tileBank.find(item => item.id === button.dataset.bankTile);
      if (token) tileSelection.push(token);
      renderTileControls();
    }));
  }

  function renderInput(activity) {
    $("#lessonActivity").innerHTML = activityHeading(activity) + promptMarkup(activity) + `<input class="lesson-answer-input" id="lessonAnswerInput" inputmode="${activity.inputMode || "text"}" autocomplete="off" spellcheck="false" placeholder="${escapeHtml(activity.placeholder || "Type your answer")}" />`;
    $("#lessonActivity").querySelector("[data-listen]")?.addEventListener("click", () => speakJapanese(activity.audioText));
    $("#lessonSubmit").classList.remove("hidden");
    $("#lessonDontKnow").classList.remove("hidden");
    $("#lessonKeyboardHint").textContent = "Type what you heard. Press Enter to check.";
    setTimeout(() => $("#lessonAnswerInput")?.focus(), 0);
  }

  function showFeedback(correct) {
    const feedback = $("#lessonFeedback");
    feedback.className = `feedback lesson-feedback show ${correct ? "good" : "bad"}`;
    const breakdown = ANSWER_BREAKDOWNS[currentActivity.id] || [];
    const breakdownMarkup = breakdown.length ? `<div class="lesson-answer-breakdown"><span class="lesson-breakdown-label">Answer breakdown</span><div class="lesson-breakdown-pieces">${breakdown.map(([piece, meaning]) => `<span class="lesson-breakdown-piece"><strong>${escapeHtml(piece)}</strong><small>${escapeHtml(meaning)}</small></span>`).join("")}</div></div>` : "";
    feedback.innerHTML = `<strong>${correct ? "Correct" : "Build this memory"}</strong><div class="meta"><span class="lesson-correction">${escapeHtml(currentActivity.correction || "Review the model")}</span>${breakdownMarkup}<span class="lesson-feedback-explanation">${escapeHtml(currentActivity.explanation || "Retrieve the idea again after some variety.")}</span></div>`;
  }

  function updateResult(activity, correct) {
    const progress = activityState(activity);
    progress.seen++;
    progress.lastSeen = Date.now();
    progress.lastWasCorrect = correct;
    progress.completed = true;
    state.total++;
    if (correct) {
      progress.correct++;
      progress.interval = Math.min(REVIEW_INTERVALS.length - 1, progress.interval + 1);
      const gain = activity.type === "choice" ? 15 : 22;
      progress.mastery = Math.min(100, progress.mastery + Math.max(7, gain * (1 - progress.mastery / 140)));
      progress.dueAt = Date.now() + REVIEW_INTERVALS[progress.interval];
      state.correct++;
      state.streak++;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
    } else {
      progress.wrong++;
      progress.interval = -1;
      progress.mastery = Math.max(0, progress.mastery - 12);
      progress.dueAt = Date.now() + REVIEW_INTERVALS[0];
      state.streak = 0;
    }
    state.recent.push(activity.id);
    if (state.recent.length > 15) state.recent.shift();
    saveState();
  }

  function gradeAnswer(correct, selectedChoice = null) {
    if (!currentActivity || currentAnswered || currentActivity.type === "teach") return;
    currentAnswered = true;
    if (currentActivity.type === "choice") {
      $("#lessonActivity").querySelectorAll("[data-choice]").forEach(button => {
        button.disabled = true;
        const index = Number(button.dataset.choice);
        if (index === currentActivity.answer) button.classList.add("correct");
        else if (index === selectedChoice) button.classList.add("wrong");
      });
    }
    updateResult(currentActivity, correct);
    showFeedback(correct);
    ["#lessonDontKnow", "#lessonClear", "#lessonSubmit"].forEach(selector => $(selector).classList.add("hidden"));
    $("#lessonNext").classList.remove("hidden");
    if (mode === "checkpoint" && correct) checkpointCorrect++;
    if (currentActivity.audioText && correct) speakJapanese(currentActivity.audioText);
  }

  function submitCurrent() {
    if (!currentActivity || currentAnswered) return;
    if (currentActivity.type === "tiles") {
      const actual = normalize(tileSelection.map(token => token.text).join(""));
      const expected = normalize(currentActivity.answer.join(""));
      gradeAnswer(actual === expected);
    } else if (currentActivity.type === "input") {
      const value = normalize($("#lessonAnswerInput").value);
      gradeAnswer(currentActivity.answers.some(answer => normalize(answer) === value));
    }
  }

  function completeTeaching() {
    if (!currentActivity || currentActivity.type !== "teach") return;
    const progress = activityState(currentActivity);
    progress.completed = true;
    progress.lastSeen = Date.now();
    saveState();
  }

  function firstIncompleteIndex(stageIndex) {
    const index = STAGES[stageIndex].activities.findIndex(activity => !activityState(activity).completed);
    return index < 0 ? STAGES[stageIndex].activities.length : index;
  }

  function renderLearn() {
    const stage = STAGES[state.currentStage];
    if (stageCursor === null) stageCursor = firstIncompleteIndex(state.currentStage);
    if (stageCursor >= stage.activities.length) {
      renderStageSummary(state.currentStage);
      return;
    }
    renderActivity({ ...stage.activities[stageCursor], stageIndex: state.currentStage, activityIndex: stageCursor });
  }

  function renderStageSummary(stageIndex) {
    clearControls();
    currentActivity = null;
    currentAudioText = "";
    const stage = STAGES[stageIndex];
    const graded = stage.activities.filter(activity => activity.type !== "teach");
    const average = Math.round(masteryAverage(graded));
    const correct = graded.reduce((sum, activity) => sum + activityState(activity).correct, 0);
    const attempts = graded.reduce((sum, activity) => sum + activityState(activity).seen, 0);
    $("#lessonStageProgress").style.width = "100%";
    $("#lessonQuestionCount").textContent = "Stage complete";
    $("#lessonActivity").innerHTML = `<div class="lesson-stage-summary"><div class="lesson-stage-summary-icon">✓</div><span class="lesson-activity-kicker">Stage complete</span><h2>${stage.title}</h2><p>${stage.outcome} Weak ideas are already scheduled to return in Practice after some variety.</p><div class="lesson-stage-summary-stats"><div class="mini"><strong>${average}%</strong><span class="tiny">current mastery</span></div><div class="mini"><strong>${attempts ? Math.round(correct / attempts * 100) : 0}%</strong><span class="tiny">first-pass accuracy</span></div><div class="mini"><strong>${graded.length}</strong><span class="tiny">retrieval activities</span></div></div></div>`;
    $("#lessonNext").textContent = stageIndex < STAGES.length - 1 ? "Open next stage" : "View lesson progress";
    $("#lessonNext").classList.remove("hidden");
    $("#lessonKeyboardHint").textContent = "Completion opens the next conversational job; mastery continues to grow through delayed review.";
  }

  function advanceLearn() {
    const stage = STAGES[state.currentStage];
    if (stageCursor >= stage.activities.length) {
      if (state.currentStage < STAGES.length - 1) {
        state.unlockedStage = Math.max(state.unlockedStage, state.currentStage + 1);
        state.currentStage++;
        stageCursor = firstIncompleteIndex(state.currentStage);
        saveState();
        renderLearn();
      } else setMode("progress");
      return;
    }
    if (currentActivity?.type === "teach") completeTeaching();
    stageCursor++;
    renderLearn();
  }

  function selectPracticeActivity() {
    const pool = completedGraded();
    if (!pool.length) return null;
    const recent = new Set(state.recent.slice(-4));
    const filtered = pool.filter(activity => !recent.has(activity.id));
    const candidates = filtered.length ? filtered : pool;
    const now = Date.now();
    return candidates.map(activity => {
      const progress = activityState(activity);
      let score = 100 - progress.mastery + progress.wrong * 8 + Math.random() * 18;
      if (progress.dueAt && progress.dueAt <= now) score += 35;
      if (progress.lastWasCorrect === false) score += 18;
      if (activity.type !== "choice") score += 7;
      return { activity, score };
    }).sort((a, b) => b.score - a.score)[0].activity;
  }

  function renderPractice() {
    const activity = selectPracticeActivity();
    if (!activity) {
      renderEmptyMode("Practice opens after your first retrieval activity", "Start the Learn journey so the app has something meaningful to adapt.", "Start learning");
      return;
    }
    renderActivity(activity);
  }

  function startCheckpoint() {
    const pool = completedGraded();
    if (pool.length < 5) {
      renderEmptyMode("Checkpoint needs a little more material", "Complete at least five retrieval activities in Learn first.", "Continue learning");
      return;
    }
    checkpointQueue = shuffle(pool).slice(0, Math.min(10, pool.length));
    checkpointIndex = 0;
    checkpointCorrect = 0;
    renderActivity(checkpointQueue[0]);
  }

  function advanceCheckpoint() {
    checkpointIndex++;
    if (checkpointIndex >= checkpointQueue.length) {
      renderCheckpointSummary();
      return;
    }
    renderActivity(checkpointQueue[checkpointIndex]);
  }

  function renderCheckpointSummary() {
    clearControls();
    currentActivity = null;
    currentAudioText = "";
    const percent = Math.round(checkpointCorrect / checkpointQueue.length * 100);
    $("#lessonStageProgress").style.width = `${percent}%`;
    $("#lessonQuestionCount").textContent = "Checkpoint complete";
    $("#lessonActivity").innerHTML = `<div class="lesson-stage-summary"><span class="lesson-activity-kicker">Mixed retrieval</span><div class="lesson-checkpoint-score">${percent}%</div><h2>${percent >= 85 ? "Ready for conversation" : percent >= 65 ? "A solid foundation" : "Useful memories are forming"}</h2><p>${checkpointCorrect} of ${checkpointQueue.length} correct. Every missed idea has been scheduled to return in Practice.</p></div>`;
    $("#lessonNext").textContent = "Run another checkpoint";
    $("#lessonNext").classList.remove("hidden");
    $("#lessonKeyboardHint").textContent = "A new checkpoint changes the question order and interleaves different skills.";
  }

  function renderEmptyMode(title, copy, buttonLabel) {
    emptyNextMode = "learn";
    clearControls();
    currentActivity = null;
    currentAudioText = "";
    $("#lessonStageProgress").style.width = "0%";
    $("#lessonQuestionCount").textContent = "Not enough material yet";
    $("#lessonActivity").innerHTML = `<div class="lesson-stage-summary"><div class="lesson-stage-summary-icon">→</div><h2>${title}</h2><p>${copy}</p></div>`;
    $("#lessonNext").textContent = buttonLabel;
    $("#lessonNext").classList.remove("hidden");
    $("#lessonSessionTitle").textContent = "Build the foundation first";
    $("#lessonSessionCopy").textContent = "The lesson only assesses material you have already encountered through guided retrieval.";
    $("#lessonKeyboardHint").textContent = "Return to Learn and complete a few more activities.";
  }

  function setMode(nextMode) {
    mode = nextMode;
    $("#lessonProgressPanel").classList.toggle("hidden", mode !== "progress");
    $("#lessonWorkspace").classList.toggle("hidden", mode === "progress");
    document.querySelectorAll(".lesson-mode").forEach(button => button.classList.toggle("active", button.dataset.mode === mode));
    if (mode === "progress") {
      renderProgressPanel();
      return;
    }
    $("#lessonModeLabel").textContent = mode === "learn" ? "Learn · guided retrieval" : mode === "practice" ? "Practice · adaptive review" : "Checkpoint · unaided mix";
    if (mode === "learn") {
      if (stageCursor === null) stageCursor = firstIncompleteIndex(state.currentStage);
      renderLearn();
    }
    if (mode === "practice") renderPractice();
    if (mode === "checkpoint") startCheckpoint();
    renderRoadmap();
  }

  function advance() {
    if (emptyNextMode) {
      const target = emptyNextMode;
      emptyNextMode = null;
      setMode(target);
      return;
    }
    if (mode === "learn") advanceLearn();
    else if (mode === "practice") renderPractice();
    else if (mode === "checkpoint") {
      if (!checkpointQueue.length || checkpointIndex >= checkpointQueue.length) startCheckpoint();
      else advanceCheckpoint();
    } else setMode("learn");
  }

  function skillScores() {
    const skills = ["Conversation", "Grammar", "Listening", "Production", "Details"];
    return skills.map(skill => {
      const activities = GRADED_ACTIVITIES.filter(activity => activity.skill === skill && activityState(activity).completed);
      return { skill, score: Math.round(masteryAverage(activities)), count: activities.length };
    });
  }

  function readinessLabel(score) {
    if (score >= 80) return "Conversation ready";
    if (score >= 60) return "Building fluency";
    if (score >= 35) return "Foundation forming";
    return "Getting started";
  }

  function relativeDue(timestamp) {
    const difference = timestamp - Date.now();
    if (difference <= 0) return "Due now";
    const minutes = Math.ceil(difference / 60000);
    if (minutes < 60) return `In ${minutes} min`;
    const hours = Math.ceil(minutes / 60);
    if (hours < 36) return `In ${hours} hr`;
    return `In ${Math.ceil(hours / 24)} days`;
  }

  function renderProgressPanel() {
    const score = Math.round(masteryAverage());
    $("#lessonReadinessBadge").textContent = readinessLabel(score);
    $("#lessonSkillGrid").innerHTML = skillScores().map(item => `<div class="lesson-skill"><strong>${item.skill}</strong><div class="lesson-skill-meter"><span style="width:${item.score}%"></span></div><span>${item.count ? `${item.score}%` : "—"}</span></div>`).join("");
    const reviews = completedGraded().sort((a, b) => activityState(a).dueAt - activityState(b).dueAt).slice(0, 8);
    $("#lessonReviewList").innerHTML = reviews.length ? reviews.map(activity => `<div class="lesson-review-item"><div><strong>${escapeHtml(activity.title)}</strong><span>${activity.skill} · ${Math.round(activityState(activity).mastery)}% mastery</span></div><time>${relativeDue(activityState(activity).dueAt)}</time></div>`).join("") : `<div class="lesson-review-empty">Complete a few Learn activities to create a personal review schedule.</div>`;
    const profile = state.profile;
    $("#profileName").value = profile.name;
    $("#profileHome").value = profile.home;
    $("#profileRole").value = profile.role;
    $("#profileField").value = profile.field;
    $("#profileYear").value = profile.year;
    $("#profileAge").value = profile.age;
    renderSpeechStatus();
  }

  function saveProfile(event) {
    event.preventDefault();
    state.profile = {
      name: $("#profileName").value.trim(), home: $("#profileHome").value.trim(), role: $("#profileRole").value.trim(),
      field: $("#profileField").value.trim(), year: $("#profileYear").value, age: $("#profileAge").value.trim()
    };
    saveState();
    const details = [state.profile.name, state.profile.home, state.profile.role, state.profile.field].filter(Boolean);
    $("#profileStatus").textContent = details.length ? "Profile saved locally. Your details will appear in the final conversation mission." : "Profile cleared. Generic prompts will be used in conversation practice.";
  }

  function speechPreferences() {
    try {
      const saved = JSON.parse(localStorage.getItem(SPEECH_STORAGE_KEY));
      return saved && typeof saved === "object" ? saved : {};
    } catch (error) {
      return {};
    }
  }

  function japaneseVoices() {
    return speechVoices.filter(voice => String(voice.lang || "").toLowerCase().startsWith("ja"));
  }

  function voiceKey(voice) { return voice.voiceURI || voice.name; }

  function selectedJapaneseVoice() {
    const voices = japaneseVoices();
    const preferred = speechPreferences().jaVoice;
    return voices.find(voice => voiceKey(voice) === preferred || voice.name === preferred) || voices.find(voice => voice.default) || voices.find(voice => voice.localService) || voices[0] || null;
  }

  function japaneseSpeechReady() {
    return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window && japaneseVoices().length > 0;
  }

  function speakJapanese(text) {
    if (!text || !japaneseSpeechReady()) return false;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = Number(speechPreferences().rate) || .85;
    const voice = selectedJapaneseVoice();
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
    return true;
  }

  function refreshSpeechVoices() {
    if (!("speechSynthesis" in window)) return;
    speechVoices = window.speechSynthesis.getVoices();
    renderSpeechStatus();
    $("#lessonReplay").disabled = !currentAudioText || !japaneseSpeechReady();
  }

  function renderSpeechStatus() {
    const status = $("#lessonSpeechStatus");
    if (!status) return;
    status.classList.remove("ready", "unavailable");
    if (japaneseSpeechReady()) {
      status.classList.add("ready");
      $("#lessonSpeechTitle").textContent = "Japanese speech is ready";
      const voice = selectedJapaneseVoice();
      $("#lessonSpeechDetail").textContent = `${voice?.name || "Japanese voice"} · shared with Kana Sprint, Vocabulary, and Numbers.`;
      $("#lessonTestSpeech").disabled = false;
    } else {
      status.classList.add("unavailable");
      $("#lessonSpeechTitle").textContent = "No Japanese voice is available";
      $("#lessonSpeechDetail").textContent = "Written practice still works. Install or select a Japanese voice in Kana Mix settings to enable listening.";
      $("#lessonTestSpeech").disabled = true;
    }
  }

  document.querySelectorAll(".lesson-mode").forEach(button => button.addEventListener("click", () => setMode(button.dataset.mode)));
  $("#lessonNext").addEventListener("click", advance);
  $("#lessonSubmit").addEventListener("click", submitCurrent);
  $("#lessonClear").addEventListener("click", () => { tileSelection = []; renderTileControls(); });
  $("#lessonDontKnow").addEventListener("click", () => gradeAnswer(false));
  $("#lessonReplay").addEventListener("click", () => speakJapanese(currentAudioText));
  $("#lessonProfileForm").addEventListener("submit", saveProfile);
  $("#lessonTestSpeech").addEventListener("click", () => speakJapanese("はじめまして。よろしくおねがいします。"));
  document.addEventListener("keydown", event => {
    if (mode === "progress") return;
    if (/^[1-4]$/.test(event.key) && currentActivity?.type === "choice" && !currentAnswered) {
      const button = $("#lessonActivity").querySelector(`[data-choice="${Number(event.key) - 1}"]`);
      if (button) { event.preventDefault(); button.click(); }
      return;
    }
    if (event.key !== "Enter") return;
    if (event.target instanceof HTMLButtonElement || event.target instanceof HTMLSelectElement) return;
    event.preventDefault();
    if (!$("#lessonNext").classList.contains("hidden")) advance();
    else if (!$("#lessonSubmit").classList.contains("hidden")) submitCurrent();
  });

  renderTopStats();
  renderRoadmap();
  renderSpeechStatus();
  refreshSpeechVoices();
  if ("speechSynthesis" in window) window.speechSynthesis.addEventListener("voiceschanged", refreshSpeechVoices);
  setMode("learn");
})();

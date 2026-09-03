(() => {
  "use strict";

  const COMMON_MISTAKE_GUIDANCE = {
    "いただきます。": "いただきます belongs before eating, not after the meal.",
    "ごちそうさまでした。": "ごちそうさまでした belongs after eating, when expressing appreciation for the meal.",
    "ただいま。": "ただいま is said by the person returning home.",
    "おかえりなさい。": "おかえりなさい is said to welcome somebody back home.",
    "いってきます。": "いってきます is said by the person leaving home and expecting to return.",
    "いってらっしゃい。": "いってらっしゃい is the response to the person who is leaving.",
    "そうです。": "そうです confirms that something is correct; it does not normally acknowledge new information.",
    "そうですか。": "そうですか receives new information as “I see” or “is that so?”; it does not directly confirm a repeated fact.",
    "なんさい": "なんさい asks a person’s age.",
    "なんねんせい": "なんねんせい asks which school year somebody is in.",
    "なんじ": "なんじ asks the time.",
    "なんばん": "なんばん asks which number.",
    "か。": "か turns a sentence into a question; it does not provide the missing information by itself.",
    "ね。": "ね asks for agreement or confirmation rather than introducing a neutral information question.",
    "ごぜん": "ごぜん marks a.m., before noon.",
    "ごご": "ごご marks p.m., after noon."
  };

  const STAGES = [
    {
      id: "open", title: "Greetings that fit the moment", short: "Time, courtesy, home, meals, and first meetings", outcome: "Choose greetings by situation and relationship instead of translating one universal hello.",
      activities: [
        {
          id: "open-chunks", type: "teach", skill: "Conversation", kicker: "Useful chunks first", title: "Start with language you can use today",
          instruction: "Learn these as complete conversational actions. We will take them apart only when that helps you create new sentences.",
          body: `<div class="lesson-model"><div class="lesson-model-row"><span>Time of day</span><strong>おはようございます。／こんにちは。／こんばんは。</strong></div><div class="lesson-model-row"><span>Courtesy</span><strong>すみません。／ありがとうございます。／いいえ。</strong></div><div class="lesson-model-row"><span>Leaving and returning</span><strong>いってきます。↔ いってらっしゃい。／ただいま。↔ おかえりなさい。</strong></div><div class="lesson-model-row"><span>Meals</span><strong>いただきます。↔ ごちそうさまでした。</strong></div><div class="lesson-model-row"><span>First meeting</span><strong>はじめまして。［name］です。よろしくおねがいします。</strong></div></div><div class="lesson-rule"><strong>Conversation first:</strong> these expressions perform social jobs. Learn the situation and response together instead of treating them as interchangeable translations.</div>`,
          audioText: "おはようございます。すみません。ありがとうございます。はじめまして。よろしくおねがいします。"
        },
        {
          id: "greet-time", type: "choice", skill: "Conversation", kicker: "Match the moment", title: "It is 8 p.m. and you meet your teacher.", prompt: "Which greeting fits the time and relationship?",
          options: ["こんばんは。", "おはよう。", "いただきます。", "ただいま。"], answer: 0,
          correction: "こんばんは。", explanation: "こんばんは is the evening greeting. The time of day matters more than translating a general English hello.", audioText: "こんばんは。"
        },
        {
          id: "greet-courtesy", type: "choice", skill: "Listening", kicker: "One phrase, several jobs", title: "Why did the speaker say this?", prompt: "Listen and choose the situation that best fits.",
          listenOnly: true, audioText: "すみません。", options: ["They need attention or are apologising", "They have finished eating", "They arrived home", "They are meeting for the first time"], answer: 0,
          correction: "すみません。", explanation: "すみません can get attention, apologise, or express appreciative indebtedness. Context tells you which job it performs."
        },
        {
          id: "greet-home", type: "choice", skill: "Conversation", kicker: "Learn the exchange", title: "You are leaving home and plan to return.", prompt: "What do you say, and what does the family answer?",
          options: ["いってきます。→ いってらっしゃい。", "ただいま。→ おかえりなさい。", "いただきます。→ いいえ。", "さようなら。→ おやすみなさい。"], answer: 0,
          correction: "いってきます。→ いってらっしゃい。", explanation: "The leaving expression literally carries the idea of going and coming back; the reply sends the person off safely.", audioText: "いってきます。いってらっしゃい。"
        },
        {
          id: "greet-meal", type: "choice", skill: "Conversation", kicker: "Before and after", title: "You have just finished a meal.", prompt: "Which expression belongs after eating?",
          options: ["ごちそうさまでした。", "いただきます。", "おかえりなさい。", "はじめまして。"], answer: 0,
          correction: "ごちそうさまでした。", explanation: "いただきます comes before eating; ごちそうさまでした expresses appreciation after the meal.", audioText: "ごちそうさまでした。"
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
          distractors: ["いいえ。", "がくせいですか。", "ごちそうさまでした。"], learnExtras: 2,
          correction: "はじめまして。はるです。よろしくおねがいします。", explanation: "The sequence mirrors the social job of each chunk: opening, identity, then a courteous close.", audioText: "はじめまして。はるです。よろしくおねがいします。"
        },
        {
          id: "open-response", type: "choice", skill: "Conversation", kicker: "Respond naturally", title: "A new classmate introduces herself.",
          context: "めい：はじめまして。めいです。よろしくおねがいします。", prompt: "Which reply best continues the meeting?",
          options: ["はじめまして。けんです。よろしくおねがいします。", "いいえ、ちがいます。", "ごちそうさまでした。", "おやすみなさい。"], answer: 0,
          correction: "はじめまして。けんです。よろしくおねがいします。", explanation: "Mirror the first-meeting structure while supplying your own name.", audioText: "はじめまして。けんです。よろしくおねがいします。"
        }
      ]
    },
    {
      id: "identity", title: "Meet and introduce yourself", short: "Name, role, affiliation, and natural omission", outcome: "Give a short introduction and understand how です identifies people and information.",
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
          distractors: ["せんせい", "か。", "の", "なん"], learnExtras: 2,
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
          distractors: ["わたしは", "がくせい", "か。", "の"], learnExtras: 2,
          explanation: "The same frame works for many identities: student, teacher, office worker, nationality, major, and more.", audioText: "めいさんは、かいしゃいんです。"
        },
        {
          id: "intro-listen", type: "choice", skill: "Listening", kicker: "Follow a real introduction", title: "What did Emi tell you?", prompt: "Listen without Japanese text, then choose the complete meaning.",
          listenOnly: true, audioText: "はじめまして。えみです。だいがくせいです。にねんせいです。よろしくおねがいします。", options: ["She is Emi, a second-year university student", "She is Mei, a second-year teacher", "She is Emi, 20 years old", "She is a university professor named Emi"], answer: 0,
          correction: "Emi · university student · second year", explanation: "A Japanese introduction can move through name, role or affiliation, and school year without repeating わたしは before every sentence."
        },
        {
          id: "intro-build", type: "tiles", skill: "Production", kicker: "Build a useful introduction", title: "Introduce Ren as a first-year international student.", prompt: "Choose the useful chunks and put them in a natural order.",
          tokens: ["はじめまして。", "れんです。", "りゅうがくせいです。", "いちねんせいです。", "よろしくおねがいします。"], answer: ["はじめまして。", "れんです。", "りゅうがくせいです。", "いちねんせいです。", "よろしくおねがいします。"],
          distractors: ["なんさいですか。", "せんせいです。", "ごちそうさまでした。", "いいえ。"], learnExtras: 2,
          correction: "はじめまして。れんです。りゅうがくせいです。いちねんせいです。よろしくおねがいします。", explanation: "A compact introduction gives information in useful chunks and omits an already obvious subject.", audioText: "はじめまして。れんです。りゅうがくせいです。いちねんせいです。よろしくおねがいします。"
        },
        {
          id: "identity-flex", type: "choice", skill: "Grammar", kicker: "Let context do its work", title: "A group points to two new classmates and says: がくせいです。", prompt: "Which translation can fit the Japanese?",
          options: ["They are students.", "Only: I am one student.", "They are not students.", "Are they students?"], answer: 0,
          correction: "They are students.", explanation: "Japanese nouns do not add English-style articles or plural endings. Context supplies who and whether the noun is singular or plural.", audioText: "がくせいです。"
        }
      ]
    },
    {
      id: "people", title: "Say who someone is", short: "School, nationality, work, and majors", outcome: "Recognise and produce the personal vocabulary that makes Lesson 1 conversations useful.",
      activities: [
        {
          id: "people-pattern", type: "teach", skill: "Vocabulary", kicker: "Build a useful personal toolkit", title: "Learn personal information in connected groups",
          instruction: "Do not memorise an alphabetical list. Learn each word inside the kind of information it answers.",
          body: `<div class="lesson-model"><div class="lesson-model-row"><span>School</span><strong>だいがく・こうこう・がくせい・だいがくせい・こうこうせい・だいがくいんせい・りゅうがくせい・せんせい</strong></div><div class="lesson-model-row"><span>People</span><strong>わたし・ともだち・～さん・～じん</strong></div><div class="lesson-model-row"><span>Work</span><strong>かいしゃいん・いしゃ・かんごし・べんごし</strong></div><div class="lesson-model-row"><span>Majors</span><strong>にほんご・れきし・けいざい・こうがく・せいぶつがく</strong></div></div><div class="lesson-rule"><strong>Usefulness rule:</strong> begin with words that describe you and people you actually meet. Less relevant countries, occupations, and majors can enter Practice later as recognition vocabulary.</div>`,
          audioText: "だいがくせい。りゅうがくせい。かいしゃいん。いしゃ。かんごし。べんごし。"
        },
        {
          id: "people-nationality", type: "choice", skill: "Vocabulary", kicker: "Build nationality", title: "ミナさんは インドじんです。", prompt: "What does ～じん contribute?",
          options: ["A person from a country", "A language", "A school year", "An occupation"], answer: 0,
          correction: "インドじん · an Indian person", explanation: "Attach ～じん to a country name to describe nationality or national origin.", audioText: "ミナさんは、インドじんです。"
        },
        {
          id: "people-work", type: "choice", skill: "Listening", kicker: "Recognise an occupation", title: "What is Aya’s occupation?", prompt: "Listen and choose the occupation.",
          listenOnly: true, audioText: "あやさんは、かんごしです。", options: ["Nurse", "Doctor", "Office worker", "Lawyer"], answer: 0,
          correction: "かんごし · nurse", explanation: "Occupations work in the same X は Y です frame as student status and nationality."
        },
        {
          id: "people-build", type: "tiles", skill: "Production", kicker: "Describe someone new", title: "Build: “Ken is a doctor.”", prompt: "Choose the correct occupation and form the statement.",
          tokens: ["けんさんは", "いしゃ", "です。"], answer: ["けんさんは", "いしゃ", "です。"], distractors: ["かんごし", "べんごし", "か。", "の"], learnExtras: 2,
          correction: "けんさんは いしゃです。", explanation: "The person is the topic; the occupation supplies the identifying information.", audioText: "けんさんは、いしゃです。"
        },
        {
          id: "people-major", type: "choice", skill: "Listening", kicker: "Hear a field of study", title: "What is Rina’s major?", prompt: "Listen, then choose the field.",
          listenOnly: true, audioText: "りなさんの、せんこうは、けいざいです。", options: ["Economics", "History", "Engineering", "Biology"], answer: 0,
          correction: "けいざい · economics", explanation: "せんこう identifies the category; the final noun supplies the field of study."
        },
        {
          id: "people-school", type: "choice", skill: "Vocabulary", kicker: "Student types", title: "Which word means “international student”?", prompt: "Choose the useful school identity.",
          options: ["りゅうがくせい", "だいがく", "こうこう", "かいしゃいん"], answer: 0,
          correction: "りゅうがくせい", explanation: "りゅうがくせい is a student studying abroad. だいがく is a university, while こうこう is a high school.", audioText: "りゅうがくせいです。"
        },
        {
          id: "people-transfer", type: "tiles", skill: "Production", kicker: "Use the same grammar with new content", title: "Build: “Mika is a Japanese international student.”", prompt: "Combine nationality and student status into a compact description.",
          tokens: ["みかさんは", "にほんじんの", "りゅうがくせい", "です。"], answer: ["みかさんは", "にほんじんの", "りゅうがくせい", "です。"], distractors: ["なん", "か。", "せんせい", "は"], learnExtras: 2,
          correction: "みかさんは にほんじんの りゅうがくせいです。", explanation: "にほんじんの narrows the kind of international student; the full phrase identifies Mika.", audioText: "みかさんは、にほんじんの、りゅうがくせいです。"
        }
      ]
    },
    {
      id: "ask", title: "Ask back", short: "Questions and useful answers", outcome: "Ask for personal information and answer without repeating unnecessary words.",
      activities: [
        {
          id: "ask-pattern", type: "teach", skill: "Grammar", kicker: "Turn information into interaction", title: "Add か to ask a polite question",
          instruction: "A statement becomes a question when か is added at the end. Question words replace the missing information you want.",
          body: `<div class="lesson-model"><div class="lesson-model-row"><span>Yes / no</span><strong>がくせいですか。</strong></div><div class="lesson-model-row"><span>Ask for a major</span><strong>せんこうは なんですか。</strong></div><div class="lesson-model-row"><span>Ask a school year</span><strong>なんねんせいですか。</strong></div><div class="lesson-model-row"><span>Ask nationality</span><strong>なんじんですか。</strong></div></div><div class="lesson-rule">Learn questions together with their likely answers. That creates a usable conversational pair instead of an isolated grammar fact.</div>`,
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
          distractors: ["なんさい", "だれ", "の", "がくせい"], learnExtras: 2,
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
        },
        {
          id: "ask-phone-kind", type: "choice", skill: "Grammar", kicker: "Choose the right question word", title: "The answer is a telephone number.", prompt: "Which question asks for that information?",
          options: ["でんわばんごうは なんばんですか。", "なんねんせいですか。", "なんさいですか。", "せんこうは なにですか。"], answer: 0,
          correction: "でんわばんごうは なんばんですか。", explanation: "なんばん asks which number; the topic tells the listener that the number is a telephone number.", audioText: "でんわばんごうは、なんばんですか。"
        }
      ]
    },
    {
      id: "natural", title: "Names, titles, and natural conversation", short: "さん, せんせい, あのう, and useful responses", outcome: "Address people respectfully and make personal questions sound like real conversation.",
      activities: [
        {
          id: "natural-pattern", type: "teach", skill: "Conversation", kicker: "Grammar is also social", title: "Choose language that fits the relationship",
          instruction: "Natural Japanese depends on who is speaking, who is being addressed, and what the listener already knows.",
          body: `<div class="lesson-model"><div class="lesson-model-row"><span>Name and title</span><strong>たなか あおいさん／やましたせんせい</strong></div><div class="lesson-model-row"><span>Address the listener</span><strong>あおいさんは がくせいですか。</strong></div><div class="lesson-model-row"><span>Soften a question</span><strong>あのう、りゅうがくせいですか。</strong></div><div class="lesson-model-row"><span>Confirm and acknowledge</span><strong>そうです。／そうですか。／そうですね。</strong></div><div class="lesson-model-row"><span>Two forms of “what”</span><strong>なんですか。／なにを…</strong></div></div><div class="lesson-rule"><strong>Names:</strong> Japanese names normally place the family name first. さん follows another person’s name; it is not normally attached to your own name. A title such as せんせい can replace さん.</div>`,
          audioText: "あのう、あおいさんは、りゅうがくせいですか。そうです。そうですか。"
        },
        {
          id: "natural-san", type: "choice", skill: "Culture", kicker: "Use titles respectfully", title: "You introduce yourself as Haru.", prompt: "Which version is natural?",
          options: ["はるです。", "はるさんです。", "あなたはるです。", "はるせんせいですか。"], answer: 0,
          correction: "はるです。", explanation: "さん is generally attached to another person’s name, not your own name when introducing yourself.", audioText: "はるです。"
        },
        {
          id: "natural-order", type: "choice", skill: "Culture", kicker: "Read a Japanese name", title: "たなか あおい", prompt: "Which part is normally the family name?",
          options: ["たなか", "あおい", "Both are titles", "Japanese names have no family name"], answer: 0,
          correction: "たなか · family name", explanation: "Japanese names normally put the family name before the given name. Aoi is the given name here.", audioText: "たなか あおい"
        },
        {
          id: "natural-address", type: "choice", skill: "Conversation", kicker: "Avoid unnecessary あなた", title: "You are speaking directly to Aoi.", prompt: "Which question sounds most natural?",
          options: ["あおいさんは がくせいですか。", "あなたさんは がくせいですか。", "わたしは あおいですか。", "がくせいの あなたですか。"], answer: 0,
          correction: "あおいさんは がくせいですか。", explanation: "Japanese commonly uses the listener’s name and title instead of repeatedly saying あなた.", audioText: "あおいさんは、がくせいですか。"
        },
        {
          id: "natural-anou", type: "choice", skill: "Conversation", kicker: "Enter politely", title: "You want to ask a stranger a personal question.", prompt: "Which opening gently gets attention and shows hesitation?",
          options: ["あのう…", "いただきます。", "ただいま。", "さようなら。"], answer: 0,
          correction: "あのう…", explanation: "あのう gets attention or softens what comes next, especially when interrupting or asking something personal.", audioText: "あのう。"
        },
        {
          id: "natural-sou", type: "choice", skill: "Conversation", kicker: "Confirm versus acknowledge", title: "Aoi says she is a biology major.", prompt: "Which response naturally means “I see”?",
          options: ["そうですか。", "そうです。", "なんですか。", "いいえ、せいぶつがくです。"], answer: 0,
          correction: "そうですか。", explanation: "そうです confirms “That’s right.” そうですか, often with falling intonation, acknowledges new information as “I see.”", audioText: "そうですか。"
        },
        {
          id: "natural-nan-nani", type: "choice", skill: "Grammar", kicker: "Two readings of 何", title: "Complete: せんこうは ___ ですか。", prompt: "Which form normally comes before です?",
          options: ["なん", "なに", "だれ", "なんさい"], answer: 0,
          correction: "せんこうは なんですか。", explanation: "なん commonly appears before です and counters. なに appears in many other environments; Lesson 1 only needs this reliable starting distinction.", audioText: "せんこうは、なんですか。"
        },
        {
          id: "natural-sensei", type: "choice", skill: "Culture", kicker: "Use occupational titles carefully", title: "You are describing Professor Yamashita.", prompt: "Which sentence is appropriate?",
          options: ["やましたせんせいは にほんごの せんせいです。", "やましたさんは わたしです。", "わたしさんは せんせいです。", "あなたせんせいです。"], answer: 0,
          correction: "やましたせんせいは にほんごの せんせいです。", explanation: "せんせい can respectfully follow Yamashita’s name as a title. にほんごの せんせい then describes the occupation without the empty repetition “the teacher is a teacher.”", audioText: "やましたせんせいは、にほんごの、せんせいです。"
        }
      ]
    },
    {
      id: "connect", title: "Make connections", short: "Useful relationships with の", outcome: "Build noun phrases such as a person’s major or a Japanese-language student.",
      activities: [
        {
          id: "connect-pattern", type: "teach", skill: "Grammar", kicker: "One relationship, many uses", title: "Use の to connect two nouns",
          instruction: "The noun after の is the main idea. The noun before の narrows or identifies it.",
          body: `<div class="lesson-model"><div class="lesson-model-row"><span>Person → possession</span><strong>めいさんの なまえ</strong></div><div class="lesson-model-row"><span>Field → kind of person</span><strong>にほんごの がくせい</strong></div><div class="lesson-model-row"><span>Institution → affiliation</span><strong>だいがくの せんせい</strong></div><div class="lesson-model-row"><span>Longer affiliation</span><strong>アリゾナだいがくの がくせい</strong></div><div class="lesson-model-row"><span>Family toolkit</span><strong>おかあさん・おとうさん・おねえさん・おにいさん・いもうと・おとうと</strong></div><div class="lesson-model-row"><span>Family information</span><strong>あおいさんの おかあさんは かんごしです。</strong></div></div><div class="lesson-rule"><strong>Head-noun test:</strong> ask “What kind of thing is the whole phrase?” The noun after の is the main idea; the material before の narrows it. The complete noun phrase can then become the topic of a sentence.</div>`,
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
          distractors: ["は", "がくせい", "です。", "めいさん"], learnExtras: 2,
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
          distractors: ["なん", "か。", "がくせい", "の"], learnExtras: 2,
          explanation: "ゆきさんの modifies せんこう. The complete noun phrase then becomes the topic marked by は.", audioText: "ゆきさんの、せんこうは、れきしです。"
        },
        {
          id: "connect-nested", type: "choice", skill: "Grammar", kicker: "Read a longer noun phrase", title: "ロンドンだいがくの がくせい", prompt: "What is the main idea of the complete phrase?",
          options: ["A student", "London", "A university", "A teacher"], answer: 0,
          correction: "a student at the University of London", explanation: "がくせい is the final noun and main idea; ロンドンだいがく tells you the student’s institution.", audioText: "ロンドンだいがくの、がくせい。"
        },
        {
          id: "connect-family", type: "choice", skill: "Vocabulary", kicker: "Read family relationships", title: "あおいさんの おにいさん", prompt: "Who is this?",
          options: ["Aoi’s older brother", "Aoi’s younger brother", "Aoi’s father", "A teacher named Aoi"], answer: 0,
          correction: "あおいさんの おにいさん · Aoi’s older brother", explanation: "Family words combine naturally with a person’s name and の to identify whose relative is being discussed.", audioText: "あおいさんの、おにいさん。"
        },
        {
          id: "connect-family-build", type: "tiles", skill: "Production", kicker: "Describe a family member", title: "Build: “Aoi’s mother is a nurse.”", prompt: "Make the family noun phrase the topic, then identify the occupation.",
          tokens: ["あおいさんの", "おかあさんは", "かんごし", "です。"], answer: ["あおいさんの", "おかあさんは", "かんごし", "です。"], distractors: ["おとうさんは", "いしゃ", "なんさい", "か。"], learnExtras: 2,
          correction: "あおいさんの おかあさんは かんごしです。", explanation: "あおいさんの modifies おかあさん; the whole family phrase becomes the topic before the occupation.", audioText: "あおいさんの、おかあさんは、かんごしです。"
        }
      ]
    },
    {
      id: "details", title: "Exchange details", short: "Age, school year, phone, and time", outcome: "Use familiar numbers inside real questions and recognize the important irregular forms.",
      activities: [
        {
          id: "details-context", type: "teach", skill: "Details", kicker: "Apply number knowledge", title: "Numbers change shape inside useful expressions",
          instruction: "Kana Mix already teaches general number construction. Here, focus only on the forms required for conversation.",
          body: `<div class="lesson-model"><div class="lesson-model-row"><span>Age</span><strong>なんさいですか。→ はたちです。</strong></div><div class="lesson-model-row"><span>School year</span><strong>なんねんせいですか。→ よねんせいです。</strong></div><div class="lesson-model-row"><span>Telephone</span><strong>でんわばんごうは なんばんですか。→ 3084ですね。</strong></div><div class="lesson-model-row"><span>Time</span><strong>いま なんじですか。→ ごご よじはんです。</strong></div><div class="lesson-model-row"><span>Special clock readings</span><strong>よじ・しちじ・くじ</strong></div></div><div class="lesson-rule">Irregular readings are easier to remember as complete answers—はたちです, よねんせいです, よじです—rather than as detached exceptions. Use ごぜん for a.m., ごご for p.m., はん for half past, and ですね to confirm a number you heard.</div>`,
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
          audioText: "さん、ぜろ、はち、よん", answers: ["3084"], inputMode: "numeric", placeholder: "XXXX", correction: "3084",
          explanation: "Telephone numbers are read one digit at a time. Replaying is allowed because the skill is accurate decoding, not memory for the recording."
        },
        {
          id: "details-time", type: "choice", skill: "Details", kicker: "Time in context", title: "The clock shows 4:00.", prompt: "How would you answer なんじですか。?",
          options: ["よじです。", "よんじです。", "よねんせいです。", "よじはんです。"], answer: 0,
          correction: "よじです。", explanation: "Four o’clock uses よじ. よじはん would mean 4:30.", audioText: "よじです。"
        },
        {
          id: "details-time-listen", type: "input", skill: "Listening", kicker: "Hear a complete time", title: "What time did you hear?", prompt: "Enter the time using digits and a colon.",
          audioText: "ごぜん、くじはんです。", answers: ["9:30", "09:30"], inputMode: "text", placeholder: "HH:MM", correction: "9:30 a.m. · ごぜん くじはん",
          explanation: "ごぜん signals a.m.; くじ is nine o’clock and はん adds half past."
        },
        {
          id: "details-age-listen", type: "input", skill: "Listening", kicker: "Decode an age", title: "How old is the person?", prompt: "Listen and enter only the age in digits.",
          audioText: "さんじゅうごさいです。", answers: ["35"], inputMode: "numeric", placeholder: "Enter a number", correction: "35 years old · さんじゅうごさい",
          explanation: "Age attaches さい to the number. Important sound changes return through Practice rather than being memorised as an isolated chart."
        },
        {
          id: "details-phone-long", type: "input", skill: "Listening", kicker: "Longer telephone decoding", title: "Enter the complete telephone number.", prompt: "Listen to each digit. Hyphens are optional.",
          audioText: "はち、ろく、なな、ご、さん、ぜろ、きゅう", answers: ["8675309", "867-5309"], inputMode: "tel", placeholder: "XXX-XXXX", correction: "867-5309",
          explanation: "Telephone numbers are decoded one digit at a time. Seven is often なな and nine is often きゅう because they are easy to distinguish."
        },
        {
          id: "details-confirm", type: "choice", skill: "Conversation", kicker: "Confirm what you heard", title: "Someone says their number is 3084.", prompt: "Which response naturally checks the number?",
          options: ["3084ですね。", "3084ですか。なんさいです。", "いいえ、よじです。", "3084のせんせいです。"], answer: 0,
          correction: "3084ですね。", explanation: "ね invites confirmation: “3084, right?” The other person can answer はい、そうです.", audioText: "さん、ぜろ、はち、よん、ですね。"
        },
        {
          id: "details-seven", type: "choice", skill: "Details", kicker: "Special clock reading", title: "The clock shows 7:00.", prompt: "Which answer is standard?",
          options: ["しちじです。", "ななじです。", "しちさいです。", "ななねんせいです。"], answer: 0,
          correction: "しちじです。", explanation: "Seven o’clock is しちじ. Clock readings must be learned as time expressions, not copied mechanically from ordinary counting.", audioText: "しちじです。"
        },
        {
          id: "details-world-time", type: "choice", skill: "Conversation", kicker: "Time around the world", title: "It is 7:00 p.m. in London.", prompt: "Which complete answer fits いま なんじですか。?",
          options: ["ごご しちじです。", "ごぜん ななじです。", "しちねんせいです。", "ごご しちさいです。"], answer: 0,
          correction: "ごご しちじです。", explanation: "ごご marks p.m.; しちじ is seven o’clock. The same question pattern works for local and world times.", audioText: "ごご、しちじです。"
        },
        {
          id: "details-family-listen", type: "choice", skill: "Listening", kicker: "Combine family, work, and age", title: "What did Aoi say about her mother?", prompt: "Listen and choose both details.",
          listenOnly: true, audioText: "おかあさんは、かんごしです。よんじゅうごさいです。", options: ["She is a 45-year-old nurse", "She is a 40-year-old doctor", "She is a fourth-year student", "She is a 35-year-old office worker"], answer: 0,
          correction: "かんごし · よんじゅうごさい", explanation: "The obvious family topic is stated once; the second sentence continues describing the same person."
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
          id: "mission-address", type: "choice", skill: "Conversation", kicker: "Mission · enter politely", title: "You want to ask whether Aoi is an international student.", prompt: "Which question addresses her naturally and softens the approach?",
          options: ["あのう、あおいさんは りゅうがくせいですか。", "あなたさんは なんですか。", "あおいさんの りゅうがくせいです。", "ただいま、りゅうがくせいですか。"], answer: 0,
          correction: "あのう、あおいさんは りゅうがくせいですか。", explanation: "あのう gently introduces the question; her name plus さん is more natural than unnecessary あなた.", audioText: "あのう、あおいさんは、りゅうがくせいですか。"
        },
        {
          id: "mission-understand", type: "choice", skill: "Listening", kicker: "Mission · understand", title: "What did Aoi tell you?", prompt: "Listen, then choose the accurate information.",
          listenOnly: true, audioText: "せんこうは、せいぶつがくです。さんねんせいです。", options: ["Her major is biology and she is a third-year student.", "She teaches biology to third-year students.", "She is 30 years old and studies history.", "Her friend is a biology teacher."], answer: 0,
          correction: "Biology major · third-year student", explanation: "せんこう identifies the field of study; さんねんせい identifies the school year."
        },
        {
          id: "mission-ask", type: "tiles", skill: "Production", kicker: "Mission · ask back", title: "Ask Aoi’s age.", prompt: "Construct the shortest natural question.",
          tokens: ["なんさい", "です", "か。"], answer: ["なんさい", "です", "か。"], correction: "なんさいですか。", explanation: "The person is already established in the conversation, so repeating あおいさんは is optional.", audioText: "なんさいですか。",
          distractors: ["なんねんせい", "なんじ", "だれ", "の"], learnExtras: 3
        },
        {
          id: "mission-age", type: "choice", skill: "Listening", kicker: "Mission · decode the answer", title: "Choose the age you heard.", prompt: "Listen to Aoi’s answer.",
          listenOnly: true, audioText: "にじゅういっさいです。", options: ["21", "20", "12", "Fourth year"], answer: 0,
          correction: "21 years old · にじゅういっさい", explanation: "The final いち combines with さい as いっさい. This is a contextual sound change, not a new number system."
        },
        {
          id: "mission-phone", type: "input", skill: "Listening", kicker: "Mission · exchange details", title: "Aoi shares her telephone number.", prompt: "Listen and type the four digits.",
          audioText: "に、よん、ろく、はち", answers: ["2468"], inputMode: "numeric", placeholder: "XXXX", correction: "2468",
          explanation: "Decode each telephone digit independently. Replaying remains available because accurate listening is the target."
        },
        {
          id: "mission-confirm", type: "tiles", skill: "Conversation", kicker: "Mission · confirm", title: "Confirm Aoi’s telephone number: “2468, right?”", prompt: "Build the short confirmation.",
          tokens: ["2468", "です", "ね。"], answer: ["2468", "です", "ね。"], distractors: ["か。", "なんさい", "の", "いいえ"], learnExtras: 3,
          correction: "2468ですね。", explanation: "ね turns the repeated information into a friendly confirmation rather than asking the entire question again.", audioText: "に、よん、ろく、はち、ですね。"
        },
        {
          id: "mission-close", type: "choice", skill: "Conversation", kicker: "Mission · close", title: "The first exchange is complete.", prompt: "Which response closes it warmly without abruptly changing topics?",
          options: ["そうですか。よろしくおねがいします。", "でんわばんごうはなんばんですか。", "いいえ、はたちです。", "おはようございますか。"], answer: 0,
          correction: "そうですか。よろしくおねがいします。", explanation: "そうですか acknowledges the new information; よろしくおねがいします provides an appropriate first-meeting close.", audioText: "そうですか。よろしくおねがいします。"
        }
      ]
    }
  ];

  const STAGE_WRAPUPS = [
    {
      challenge: "You meet Haru for the first time. Open politely, give your name, and close with goodwill.",
      turns: [["Haru", "はじめまして。はるです。"], ["You", "はじめまして。［your name］です。よろしくおねがいします。"]]
    },
    {
      challenge: "A new classmate introduces herself. Introduce yourself and say that you are a student.",
      turns: [["Emi", "はじめまして。えみです。"], ["You", "はじめまして。［your name］です。がくせいです。よろしくおねがいします。"]]
    },
    {
      challenge: "Introduce Mika to a classmate: she is Japanese and an international student.",
      turns: [["You", "みかさんは にほんじんの りゅうがくせいです。"], ["Classmate", "そうですか。"]]
    },
    {
      challenge: "Ask Rina what her major is, listen to her answer, and acknowledge it naturally.",
      turns: [["You", "りなさんの せんこうは なんですか。"], ["Rina", "けいざいです。"], ["You", "そうですか。"]],
      coreMilestone: true
    },
    {
      challenge: "Get Professor Yamashita’s attention, address him respectfully, and ask if he teaches Japanese.",
      turns: [["You", "あのう、やましたせんせいは にほんごの せんせいですか。"], ["Yamashita", "はい、そうです。"]]
    },
    {
      challenge: "Ask whose friend Mari is, then answer that she is Yuki’s friend.",
      turns: [["You", "まりさんは だれの ともだちですか。"], ["Classmate", "ゆきさんの ともだちです。"]]
    },
    {
      challenge: "Ask a classmate’s school year, then repeat the answer to confirm that you heard correctly.",
      turns: [["You", "なんねんせいですか。"], ["Classmate", "よねんせいです。"], ["You", "よねんせいですね。"]]
    },
    {
      challenge: "Repeat your side of the first-meeting conversation without looking at the lesson models.",
      turns: [["You", "はじめまして。［your name］です。"], ["You", "せんこうは なんですか。"], ["You", "そうですか。よろしくおねがいします。"]]
    }
  ];

  const ANSWER_BREAKDOWNS = {
    "greet-time": [["こんばんは", "good evening · used after the day has turned to evening"]],
    "greet-courtesy": [["すみません", "excuse me / I’m sorry · gets attention, apologises, or shows indebtedness"]],
    "greet-home": [["いってきます", "I’m leaving and will return · said by the person going out"], ["いってらっしゃい", "go and come back safely · reply from the person staying"]],
    "greet-meal": [["ごちそうさま", "thanks for the meal · literally acknowledges the feast or effort"], ["でした", "was · makes the expression politely retrospective after eating"]],
    "open-situation": [["はじめまして", "nice to meet you · first-meeting opener"]],
    "open-listen": [["よろしく", "favorably · with goodwill"], ["おねがいします", "please · literally, I make a request"]],
    "open-build": [["はじめまして", "nice to meet you"], ["はる", "Haru"], ["です", "am · polite ending"], ["よろしくおねがいします", "please treat me kindly · polite close"]],
    "open-response": [["はじめまして", "nice to meet you"], ["けん", "Ken"], ["です", "am · polite ending"], ["よろしくおねがいします", "please treat me kindly · polite close"]],
    "identity-meaning": [["けんさん", "Ken · さん adds polite respect"], ["は", "topic marker · pronounced wa"], ["せんせい", "teacher"], ["です", "is · polite ending"]],
    "identity-build": [["わたし", "I · me"], ["は", "topic marker · pronounced wa"], ["がくせい", "student"], ["です", "am · polite ending"]],
    "identity-omit": [["はい", "yes"], ["がくせい", "student"], ["です", "am · polite ending"]],
    "identity-other": [["めいさん", "Mei · さん adds polite respect"], ["は", "topic marker · pronounced wa"], ["かいしゃいん", "office worker · company employee"], ["です", "is · polite ending"]],
    "intro-listen": [["えみ", "Emi · the speaker’s name"], ["だいがくせい", "university student"], ["にねんせい", "second-year student"]],
    "intro-build": [["はじめまして", "nice to meet you"], ["れん", "Ren · the speaker’s name"], ["です", "am · polite ending"], ["りゅうがくせい", "international student"], ["いちねんせい", "first-year student"], ["よろしくおねがいします", "please treat me kindly · polite close"]],
    "identity-flex": [["がくせい", "student or students · Japanese nouns need no plural ending"], ["です", "is / am / are · context supplies the subject"]],
    "people-nationality": [["ミナさん", "Mina · さん adds polite respect"], ["は", "topic marker · pronounced wa"], ["インド", "India"], ["じん", "person from · nationality suffix"], ["です", "is · polite ending"]],
    "people-work": [["あやさん", "Aya · さん adds polite respect"], ["は", "topic marker · pronounced wa"], ["かんごし", "nurse"], ["です", "is · polite ending"]],
    "people-build": [["けんさん", "Ken · さん adds polite respect"], ["は", "topic marker · pronounced wa"], ["いしゃ", "doctor"], ["です", "is · polite ending"]],
    "people-major": [["りなさん", "Rina · さん adds polite respect"], ["の", "Rina’s · possession or association"], ["せんこう", "major · field of study"], ["は", "topic marker · pronounced wa"], ["けいざい", "economics"], ["です", "is · polite ending"]],
    "people-school": [["りゅうがく", "study abroad"], ["せい", "student · forms the compound りゅうがくせい"]],
    "people-transfer": [["みかさん", "Mika · さん adds polite respect"], ["は", "topic marker · pronounced wa"], ["にほんじん", "Japanese person"], ["の", "specifies the kind of student"], ["りゅうがくせい", "international student"], ["です", "is · polite ending"]],
    "ask-yes-no": [["いいえ", "no"], ["バングラデシュじん", "Bangladeshi person"], ["です", "am · polite ending"]],
    "ask-major": [["せんこう", "major · field of study"], ["は", "topic marker · pronounced wa"], ["なん", "what"], ["です", "is · polite ending"], ["か", "question marker"]],
    "ask-year": [["なん", "what · which"], ["ねんせい", "school year"], ["です", "is · polite ending"], ["か", "question marker"]],
    "ask-listen-age": [["なんさい", "how old · what age"], ["です", "is · polite ending"], ["か", "question marker"]],
    "ask-phone-kind": [["でんわばんごう", "telephone number"], ["は", "topic marker · pronounced wa"], ["なんばん", "what number"], ["です", "is · polite ending"], ["か", "question marker"]],
    "natural-san": [["はる", "Haru · your own name"], ["です", "am · polite ending; no さん on your own name"]],
    "natural-order": [["たなか", "Tanaka · family name, normally placed first"], ["あおい", "Aoi · given name"]],
    "natural-address": [["あおいさん", "Aoi · name plus respectful さん"], ["は", "topic marker · also marks the person being addressed"], ["がくせい", "student"], ["ですか", "is / are? · polite question"]],
    "natural-anou": [["あのう", "um / excuse me · gently gets attention or signals hesitation"]],
    "natural-sou": [["そう", "so · that way / what you just said"], ["です", "is · polite ending"], ["か", "question form that here acknowledges: “I see”"]],
    "natural-nan-nani": [["せんこう", "major · field of study"], ["は", "topic marker · pronounced wa"], ["なん", "what · the form normally used before です"], ["ですか", "is it? · polite question"]],
    "natural-sensei": [["やましたせんせい", "Professor Yamashita · せんせい used as a respectful title"], ["は", "topic marker · pronounced wa"], ["にほんご", "Japanese language"], ["の", "specifies the kind of teacher"], ["せんせい", "teacher · the occupation"], ["です", "is · polite ending"]],
    "connect-main": [["にほんご", "Japanese language"], ["の", "connects and specifies nouns"], ["がくせい", "student · the main noun"]],
    "connect-build": [["だいがく", "university"], ["の", "of · associated with"], ["せんせい", "teacher · the main noun"]],
    "connect-possess": [["みかさん", "Mika · さん adds polite respect"], ["の", "Mika’s · possession or association"], ["ともだち", "friend · the main noun"]],
    "connect-sentence": [["ゆきさん", "Yuki · さん adds polite respect"], ["の", "Yuki’s · possession or association"], ["せんこう", "major · field of study"], ["は", "topic marker · pronounced wa"], ["れきし", "history"], ["です", "is · polite ending"]],
    "connect-nested": [["ロンドンだいがく", "University of London · the institution"], ["の", "affiliated with"], ["がくせい", "student · the main noun"]],
    "connect-family": [["あおいさん", "Aoi · さん adds polite respect"], ["の", "Aoi’s · identifies whose relative"], ["おにいさん", "older brother · respectful family term"]],
    "connect-family-build": [["あおいさん", "Aoi · さん adds polite respect"], ["の", "Aoi’s · identifies whose relative"], ["おかあさん", "mother · respectful family term"], ["は", "topic marker · pronounced wa"], ["かんごし", "nurse"], ["です", "is · polite ending"]],
    "details-age": [["はたち", "20 years old · special reading"], ["です", "is · polite ending"]],
    "details-year": [["よねんせい", "fourth-year student · special よ reading"], ["です", "is · polite ending"]],
    "details-phone": [["さん", "three"], ["ぜろ", "zero"], ["はち", "eight"], ["よん", "four"]],
    "details-time": [["よじ", "four o’clock · special よ reading"], ["です", "is · polite ending"]],
    "details-time-listen": [["ごぜん", "a.m. · before noon"], ["くじ", "nine o’clock"], ["はん", "half past"], ["です", "is · polite ending"]],
    "details-age-listen": [["さんじゅうご", "thirty-five"], ["さい", "years old · age counter"], ["です", "is · polite ending"]],
    "details-phone-long": [["はち", "8"], ["ろく", "6"], ["なな", "7"], ["ご", "5"], ["さん", "3"], ["ぜろ", "0"], ["きゅう", "9"]],
    "details-confirm": [["3084", "the telephone digits just heard"], ["です", "is · polite ending"], ["ね", "right? · invites confirmation"]],
    "details-seven": [["しちじ", "seven o’clock · special clock reading"], ["です", "is · polite ending"]],
    "details-world-time": [["ごご", "p.m. · after noon"], ["しちじ", "seven o’clock"], ["です", "is · polite ending"]],
    "details-family-listen": [["おかあさん", "mother · the continuing topic"], ["は", "topic marker · pronounced wa"], ["かんごし", "nurse"], ["です", "is · polite ending"], ["よんじゅうごさい", "45 years old"], ["です", "is · polite ending"]],
    "mission-greet": [["はじめまして", "nice to meet you"], ["よろしくおねがいします", "please treat me kindly · polite close"]],
    "mission-address": [["あのう", "um / excuse me · softens the approach"], ["あおいさん", "Aoi · name plus respectful さん"], ["は", "topic marker · pronounced wa"], ["りゅうがくせい", "international student"], ["ですか", "is / are? · polite question"]],
    "mission-understand": [["せんこう", "major · field of study"], ["は", "topic marker · pronounced wa"], ["せいぶつがく", "biology"], ["です", "is · polite ending"], ["さんねんせい", "third-year student"], ["です", "is · polite ending"]],
    "mission-ask": [["なんさい", "how old · what age"], ["です", "is · polite ending"], ["か", "question marker"]],
    "mission-age": [["にじゅういっさい", "21 years old · いち + さい becomes いっさい"], ["です", "is · polite ending"]],
    "mission-phone": [["に", "2"], ["よん", "4"], ["ろく", "6"], ["はち", "8"]],
    "mission-confirm": [["2468", "the telephone digits just heard"], ["です", "is · polite ending"], ["ね", "right? · invites confirmation"]],
    "mission-close": [["そうですか", "I see · acknowledges new information"], ["よろしくおねがいします", "please treat me kindly · polite close"]]
  };

  const GUIDE_BREAKDOWNS = {
    "open-chunks": [
      { meaning: "Good morning. / Hello. / Good evening.", pieces: [["おはようございます", "good morning · polite"], ["こんにちは", "hello · daytime greeting"], ["こんばんは", "good evening"]], insight: "Japanese greetings track the time and relationship. おはようございます is the polite morning form." },
      { meaning: "Excuse me / I’m sorry. / Thank you. / No, not at all.", pieces: [["すみません", "excuse me / I’m sorry · also shows indebtedness"], ["ありがとうございます", "thank you · polite"], ["いいえ", "no / not at all · can modestly answer thanks"]], insight: "The social situation decides the best English meaning; these are conversational actions, not one-to-one labels." },
      { meaning: "I’m leaving and will return. / Go safely. / I’m home. / Welcome home.", pieces: [["いってきます", "said by the person leaving home"], ["いってらっしゃい", "reply from the person staying"], ["ただいま", "I’m home · said on returning"], ["おかえりなさい", "welcome home · reply to the returner"]], insight: "Learn each departure or return phrase with its partner so you can participate in the exchange." },
      { meaning: "I gratefully receive this meal. / Thank you for the meal.", pieces: [["いただきます", "said before eating"], ["ごちそうさまでした", "said with appreciation after eating"]], insight: "These expressions mark the beginning and end of a meal; they are not ordinary descriptions of food." },
      { meaning: "Nice to meet you. I’m [name]. I look forward to knowing you.", pieces: [["はじめまして", "nice to meet you · first-meeting opener"], ["［name］です", "I’m [name] · polite identity"], ["よろしくおねがいします", "please treat me kindly · courteous close"]], insight: "The three chunks perform opening, identity, and goodwill in that order." }
    ],
    "identity-pattern": [
      { meaning: "X is Y.", pieces: [["X", "the topic"], ["は", "topic marker · pronounced wa"], ["Y", "identity or description"], ["です", "is / am · polite ending"]], insight: "Use X は Y です to identify or describe the current topic." },
      { meaning: "Mei is a student.", pieces: [["めいさん", "Mei · さん adds polite respect"], ["は", "topic marker · pronounced wa"], ["がくせい", "student"], ["です", "is · polite ending"]], insight: "Replace Mei and student to create many new identity statements." },
      null
    ],
    "people-pattern": [
      { meaning: "School and student identities", pieces: [["だいがく", "university"], ["こうこう", "high school"], ["がくせい", "student"], ["だいがくせい", "university student"], ["こうこうせい", "high-school student"], ["だいがくいんせい", "graduate student"], ["りゅうがくせい", "international student"], ["せんせい", "teacher / professor"]], insight: "Learn the institution and the people connected to it as one useful cluster." },
      { meaning: "People and nationality", pieces: [["わたし", "I / me"], ["ともだち", "friend"], ["～さん", "respectful title after another person’s name"], ["～じん", "person from · nationality suffix"]], insight: "Attach ～じん to a country name; attach さん to another person’s name, not normally your own." },
      { meaning: "Common occupations", pieces: [["かいしゃいん", "office worker · company employee"], ["いしゃ", "doctor"], ["かんごし", "nurse"], ["べんごし", "lawyer"]], insight: "Each occupation fits directly into X は Y です." },
      { meaning: "Fields of study", pieces: [["にほんご", "Japanese language"], ["れきし", "history"], ["けいざい", "economics"], ["こうがく", "engineering"], ["せいぶつがく", "biology"]], insight: "Use these after せんこうは to answer what someone studies." }
    ],
    "ask-pattern": [
      { meaning: "Are you a student?", pieces: [["がくせい", "student"], ["です", "is / are · polite ending"], ["か", "question marker"]], insight: "Add か after a polite statement to turn it into a yes-or-no question." },
      { meaning: "What is your major?", pieces: [["せんこう", "major · field of study"], ["は", "topic marker · pronounced wa"], ["なん", "what"], ["です", "is · polite ending"], ["か", "question marker"]], insight: "Put なん where the missing information belongs, then finish with ですか." },
      { meaning: "What year are you in at school?", pieces: [["なん", "what · which"], ["ねんせい", "school year"], ["です", "is · polite ending"], ["か", "question marker"]], insight: "なん combines with ねんせい to ask which school year someone is in." },
      { meaning: "What nationality are you?", pieces: [["なん", "what · which"], ["じん", "person from · nationality suffix"], ["です", "is · polite ending"], ["か", "question marker"]], insight: "なん combines with じん to ask which nationality or national origin applies." }
    ],
    "natural-pattern": [
      { meaning: "Aoi Tanaka / Professor Yamashita", pieces: [["たなか", "Tanaka · family name"], ["あおい", "Aoi · given name"], ["さん", "respectful title"], ["やました", "Yamashita · family name"], ["せんせい", "teacher / professor · also a title"]], insight: "Family name normally comes first. A professional title such as せんせい can replace さん." },
      { meaning: "Aoi, are you a student?", pieces: [["あおいさん", "Aoi · name plus respectful title"], ["は", "topic marker · pronounced wa"], ["がくせい", "student"], ["ですか", "are you? · polite question"]], insight: "Using the listener’s name and title is often more natural than repeating あなた." },
      { meaning: "Um, are you an international student?", pieces: [["あのう", "um / excuse me · gets attention or softens hesitation"], ["りゅうがくせい", "international student"], ["ですか", "are you? · polite question"]], insight: "あのう helps a personal question enter the conversation gently." },
      { meaning: "That’s right. / I see. / That’s right, isn’t it?", pieces: [["そうです", "that’s right · confirms information"], ["そうですか", "I see / is that so? · receives new information"], ["そうですね", "that’s right, isn’t it? / let me see · invites agreement or reflection"]], insight: "The final particle changes the conversational job even though そうです remains." },
      { meaning: "What is it? / What do you…?", pieces: [["なん", "what · commonly before です and counters"], ["なに", "what · used in many other environments"], ["を", "object marker · previews later grammar"]], insight: "For Lesson 1, the reliable production rule is なんですか. Recognise that the same 何 can also be read なに elsewhere." }
    ],
    "connect-pattern": [
      { meaning: "Mei’s name", pieces: [["めいさん", "Mei · the associated person"], ["の", "Mei’s · possession or association"], ["なまえ", "name · the main noun"]], insight: "A person before の commonly marks possession or association." },
      { meaning: "a student of Japanese", pieces: [["にほんご", "Japanese language · the field"], ["の", "connects and specifies nouns"], ["がくせい", "student · the main noun"]], insight: "The noun before の specifies the kind of student." },
      { meaning: "a university teacher", pieces: [["だいがく", "university · the institution"], ["の", "of · affiliated with"], ["せんせい", "teacher · the main noun"]], insight: "Read from the main noun backward: a teacher associated with a university." },
      { meaning: "a student at Arizona University", pieces: [["アリゾナだいがく", "Arizona University · the institution"], ["の", "affiliated with"], ["がくせい", "student · the main noun"]], insight: "A long institution name behaves just like any other noun before の." },
      { meaning: "Mother, father, older sister, older brother, younger sister, younger brother", pieces: [["おかあさん", "mother"], ["おとうさん", "father"], ["おねえさん", "older sister"], ["おにいさん", "older brother"], ["いもうと", "younger sister"], ["おとうと", "younger brother"]], insight: "Learn family words as a relationship set, then use a person’s name plus の to show whose relative is meant." },
      { meaning: "Aoi’s mother is a nurse.", pieces: [["あおいさん", "Aoi · さん adds polite respect"], ["の", "Aoi’s · identifies whose relative"], ["おかあさん", "mother"], ["は", "topic marker · pronounced wa"], ["かんごし", "nurse"], ["です", "is · polite ending"]], insight: "First build the family noun phrase; then mark the complete phrase as the topic." }
    ],
    "details-context": [
      { meaning: "How old are you? → I’m 20.", pieces: [["なんさい", "how old · what age"], ["です", "is · polite ending"], ["か", "question marker"], ["はたち", "20 years old · special reading"], ["です", "is · polite ending"]], insight: "Learn はたち as the complete conversational answer for age 20." },
      { meaning: "What year are you in? → I’m a fourth-year student.", pieces: [["なん", "what · which"], ["ねんせい", "school year"], ["ですか", "is it? · polite question"], ["よねんせい", "fourth-year student · special よ reading"], ["です", "is · polite ending"]], insight: "Four uses the special reading よ inside よねんせい." },
      { meaning: "What is your telephone number? → 3084, right?", pieces: [["でんわばんごう", "telephone number"], ["は", "topic marker · pronounced wa"], ["なんばん", "what number"], ["ですか", "is it? · polite question"], ["3084", "the digits heard"], ["ですね", "right? · polite confirmation"]], insight: "Repeat a number with ですね to check that you heard it accurately." },
      { meaning: "What time is it now? → It’s 4:30 p.m.", pieces: [["いま", "now"], ["なんじ", "what time"], ["ですか", "is it? · polite question"], ["ごご", "p.m. · after noon"], ["よじ", "four o’clock · special よ reading"], ["はん", "half past"], ["です", "is · polite ending"]], insight: "ごご sets p.m.; はん after the hour means half past." },
      { meaning: "4:00 / 7:00 / 9:00", pieces: [["よじ", "four o’clock · not よんじ"], ["しちじ", "seven o’clock · standard clock reading"], ["くじ", "nine o’clock · not きゅうじ"]], insight: "Memorise these three as complete clock expressions because ordinary counting forms do not transfer mechanically." }
    ],
    "mission-setup": [
      { meaning: "Nice to meet you. I’m Aoi Tanaka.", pieces: [["はじめまして", "nice to meet you"], ["たなか", "Tanaka · family name"], ["あおい", "Aoi · given name"], ["です", "am · polite ending"]], insight: "Aoi opens the meeting and then supplies her name with です." }
    ]
  };

  const practiceChoice = (key, title, prompt, options, correction, explanation, audioText = "", breakdown = [], listenOnly = false) => ({
    key, type: "choice", title, prompt, options, answer: 0, correction, explanation, audioText: audioText || (listenOnly ? "" : correction), breakdown, listenOnly, audioRole: listenOnly ? "prompt" : "feedback"
  });
  const practiceTiles = (key, title, prompt, answer, distractors, correction, explanation, audioText = "", breakdown = []) => ({
    key, type: "tiles", title, prompt, tokens: answer, answer, distractors, correction, explanation, audioText: audioText || correction, breakdown, audioRole: "feedback"
  });
  const practiceInput = (key, title, prompt, answers, correction, explanation, audioText, placeholder, inputMode = "text", breakdown = []) => ({
    key, type: "input", title, prompt, answers, correction, explanation, audioText, placeholder, inputMode, breakdown, audioRole: "prompt"
  });
  const practiceRepair = (key, title, prompt, options, correction, explanation, audioText = "", breakdown = []) => ({
    key, type: "repair", title, prompt, options, answer: 0, correction, explanation, audioText: audioText || correction, breakdown, skill: "Grammar", audioRole: "feedback"
  });
  const inScenario = (activity, scenarioKey, context) => ({ ...activity, scenarioKey, context });

  const PRACTICE_FAMILIES = {
    firstMeeting: [
      practiceTiles("intro-aki", "Introduce yourself as Aki.", "Build the three-part first meeting.", ["はじめまして。", "あきです。", "よろしくおねがいします。"], ["ただいま。", "なんさいですか。", "いいえ。", "ごちそうさまでした。"], "はじめまして。あきです。よろしくおねがいします。", "Open the first meeting, give the name, and close with goodwill.", "はじめまして。あきです。よろしくおねがいします。", [["はじめまして", "nice to meet you"], ["あきです", "I’m Aki"], ["よろしくおねがいします", "courteous close"]]),
      practiceChoice("reply-yuna", "Yuna introduces herself for the first time.", "Which response fits naturally?", ["はじめまして。けんです。よろしくおねがいします。", "ただいま。", "ごちそうさまでした。", "なんじですか。"], "はじめまして。けんです。よろしくおねがいします。", "Mirror the first-meeting structure while giving your own name.", "はじめまして。けんです。よろしくおねがいします。", [["はじめまして", "nice to meet you"], ["けんです", "I’m Ken"], ["よろしくおねがいします", "courteous close"]]),
      practiceChoice("purpose-yoroshiku", "What conversational job does the expression perform?", "Listen and choose.", ["It closes a first introduction with goodwill", "It welcomes someone home", "It begins a meal", "It asks a person’s name"], "よろしくおねがいします。", "In a first meeting, よろしくおねがいします provides a courteous close.", "よろしくおねがいします。", [["よろしく", "favorably · with goodwill"], ["おねがいします", "please · polite request"]], true),
      practiceChoice("opener-new", "You are meeting Ren for the first time.", "What should you say before giving your name?", ["はじめまして。", "おかえりなさい。", "いただきます。", "そうですか。"], "はじめまして。", "はじめまして is reserved for the beginning of a first meeting.", "はじめまして。", [["はじめまして", "nice to meet you · first-meeting opener"]]),
      practiceTiles("intro-kana", "Introduce yourself as Kana.", "Choose only the useful chunks.", ["はじめまして。", "かなです。", "よろしくおねがいします。"], ["いってきます。", "がくせいですか。", "こんばんは。", "いいえ。"], "はじめまして。かなです。よろしくおねがいします。", "The social sequence remains opener, identity, then goodwill.", "はじめまして。かなです。よろしくおねがいします。", [["かなです", "I’m Kana"], ["よろしくおねがいします", "courteous close"]]),
      practiceChoice("listen-name", "What name did the new classmate give?", "Listen before choosing.", ["Haru", "Aki", "Yuna", "Ken"], "はる · Haru", "The middle chunk gives the speaker’s name between the opener and close.", "はじめまして。はるです。よろしくおねがいします。", [["はる", "Haru · the speaker’s name"]], true),
      inScenario(practiceTiles("dorm-intro-noa", "Introduce yourself to your new dorm neighbour as Noa.", "Build a natural first meeting.", ["はじめまして。", "のあです。", "よろしくおねがいします。"], ["ただいま。", "なんじですか。", "おかえりなさい。"], "はじめまして。のあです。よろしくおねがいします。", "A new neighbour still calls for the first-meeting opener, your name, and a courteous close.", "はじめまして。のあです。よろしくおねがいします。"), "dorm", "Student dorm · You meet the person in the room next door."),
      inScenario(practiceChoice("club-reply-leo", "Leo introduces himself at the photography club.", "Which reply starts your new club relationship naturally?", ["はじめまして。まいです。よろしくおねがいします。", "おかえりなさい。", "ごちそうさまでした。", "いってきます。"], "はじめまして。まいです。よろしくおねがいします。", "This is a first meeting, so mirror the greeting, give your name, and close courteously."), "club", "Photography club welcome table · You and Leo have not met before."),
      inScenario(practiceRepair("repair-self-san", "Repair Leo’s self-introduction.", "Which replacement removes the beginner mistake?", ["レオです。", "レオさんです。", "レオせんせいです。", "あなたはレオです。"], "はじめまして。レオです。", "People normally do not add さん or a title to their own name."), "orientation", "International orientation · Leo says: はじめまして。レオさんです。")
    ],
    greetings: [
      practiceChoice("morning-teacher", "You meet your teacher at 8 a.m.", "Choose the greeting that fits.", ["おはようございます。", "こんばんは。", "ただいま。", "いただきます。"], "おはようございます。", "The morning and respectful relationship call for the polite morning greeting.", "おはようございます。", [["おはようございます", "good morning · polite"]]),
      practiceChoice("day-classmate", "You see a classmate during the afternoon.", "Which greeting fits naturally?", ["こんにちは。", "おかえりなさい。", "ごちそうさまでした。", "おやすみなさい。"], "こんにちは。", "こんにちは is the ordinary daytime greeting.", "こんにちは。", [["こんにちは", "hello · daytime greeting"]]),
      practiceChoice("return-home", "Your sister has just arrived home.", "What do you say to her?", ["おかえりなさい。", "ただいま。", "いってきます。", "よろしくおねがいします。"], "おかえりなさい。", "The person already at home welcomes the returning person with おかえりなさい.", "おかえりなさい。", [["おかえりなさい", "welcome home · reply to the returner"]]),
      practiceChoice("before-meal", "Everyone is about to start eating.", "Which expression belongs now?", ["いただきます。", "ごちそうさまでした。", "いってらっしゃい。", "すみません。"], "いただきます。", "いただきます marks the beginning of a meal.", "いただきます。", [["いただきます", "said gratefully before eating"]]),
      practiceChoice("thanks-response", "Someone thanks you for a small favour.", "Which modest response can fit?", ["いいえ。", "はじめまして。", "いってきます。", "こんばんは。"], "いいえ。", "In this context いいえ can modestly mean “not at all.”", "いいえ。", [["いいえ", "no / not at all · modest response"]]),
      practiceChoice("listen-leaving", "Which situation matches the expression?", "Listen, then choose.", ["The speaker is leaving home and plans to return", "The speaker has returned home", "The speaker finished eating", "The speaker met someone new"], "いってきます。", "いってきます is said by the person leaving home with the expectation of returning.", "いってきます。", [["いってきます", "I’m leaving and will return"]], true)
    ],
    introductions: [
      practiceTiles("intro-yuna", "Introduce Yuna as a university student.", "Build a natural short introduction.", ["はじめまして。", "ゆなです。", "だいがくせいです。", "よろしくおねがいします。"], ["なんさいですか。", "せんせいです。", "ただいま。", "いいえ。"], "はじめまして。ゆなです。だいがくせいです。よろしくおねがいします。", "Open, give the name and role, then close with goodwill.", "はじめまして。ゆなです。だいがくせいです。よろしくおねがいします。", [["ゆなです", "I’m Yuna"], ["だいがくせいです", "I’m a university student"]]),
      practiceChoice("omit-topic", "Someone asks: りゅうがくせいですか。", "You are an international student. Choose the natural answer.", ["はい、りゅうがくせいです。", "はい、わたしはです。", "りゅうがくせいですか。", "わたしのはいです。"], "はい、りゅうがくせいです。", "The question already establishes you as the topic, so the short answer omits わたしは.", "はい、りゅうがくせいです。", [["はい", "yes"], ["りゅうがくせい", "international student"], ["です", "am · polite ending"]]),
      practiceChoice("listen-kai", "What did Kai tell you?", "Listen and choose the complete meaning.", ["Kai is a first-year international student", "Kai is a first-year teacher", "Kai is 20 years old", "Kai studies first-year Japanese"], "かい · りゅうがくせい · いちねんせい", "The introduction gives the name, international-student status, and school year without repeating the subject.", "はじめまして。かいです。りゅうがくせいです。いちねんせいです。", [["かい", "Kai"], ["りゅうがくせい", "international student"], ["いちねんせい", "first-year student"]], true),
      practiceTiles("identity-sora", "Build: “Sora is a high-school student.”", "Construct the complete statement.", ["そらさんは", "こうこうせい", "です。"], ["だいがく", "せんせい", "か。", "の"], "そらさんは こうこうせいです。", "The person is the topic and the school identity comes before です.", "そらさんは、こうこうせいです。", [["そらさん", "Sora · respectful さん"], ["は", "topic marker"], ["こうこうせい", "high-school student"], ["です", "is"]]),
      practiceChoice("plural-context", "Three people are introduced as がくせいです。", "What can the Japanese mean?", ["They are students.", "Only one person is a student.", "They are teachers.", "Are they students?"], "They are students.", "Japanese nouns do not need a plural ending; the situation supplies the plural meaning.", "がくせいです。", [["がくせい", "student / students"], ["です", "is / are"]]),
      practiceTiles("intro-mei", "Introduce Mei as a second-year student.", "Choose the useful chunks and order them.", ["はじめまして。", "めいです。", "にねんせいです。", "よろしくおねがいします。"], ["なんねんせいですか。", "いしゃです。", "ごちそうさまでした。", "か。"], "はじめまして。めいです。にねんせいです。よろしくおねがいします。", "A compact introduction moves from opening to identity, useful detail, and courteous close.", "はじめまして。めいです。にねんせいです。よろしくおねがいします。", [["めいです", "I’m Mei"], ["にねんせいです", "I’m a second-year student"]]),
      inScenario(practiceTiles("lab-intro-tomo", "Introduce Tomo to a new laboratory partner.", "Say who Tomo is in one polite statement.", ["ともさんは", "だいがくいんせい", "です。"], ["なんさい", "せんせい", "か。"], "ともさんは だいがくいんせいです。", "Tomo is the topic, followed by the graduate-student identity and です."), "laboratory", "University laboratory · A new member asks who Tomo is."),
      inScenario(practiceChoice("orientation-listen-reina", "What did Reina tell the orientation group?", "Listen and choose the complete profile.", ["Reina is a second-year international student", "Reina is a teacher", "Reina is 20 years old", "Reina is a graduate student"], "Reina · international student · second year", "The short sentences continue describing the same speaker.", "はじめまして。れいなです。りゅうがくせいです。にねんせいです。", [["れいな", "Reina"], ["りゅうがくせい", "international student"], ["にねんせい", "second-year student"]], true), "orientation", "International orientation · Each student gives a short introduction."),
      inScenario(practiceRepair("repair-student-topic", "Repair a class introduction.", "Which sentence correctly says “I am a student”?", ["わたしは がくせいです。", "わたしの がくせいです。", "わたしは がくせいか。", "わたしさんは がくせいです。"], "わたしは がくせいです。", "Use は to mark yourself as the topic; の would incorrectly connect two nouns."), "classroom", "First Japanese class · A learner wrote: わたしの がくせいです。")
    ],
    personalInfo: [
      practiceChoice("listen-lawyer", "What is Ken’s occupation?", "Listen and choose.", ["Lawyer", "Doctor", "Nurse", "Office worker"], "べんごし · lawyer", "べんごし identifies Ken’s occupation.", "けんさんは、べんごしです。", [["けんさん", "Ken"], ["べんごし", "lawyer"]], true),
      practiceChoice("major-history", "ゆきさんの せんこうは れきしです。", "What is Yuki’s major?", ["History", "Economics", "Engineering", "Biology"], "れきし · history", "The noun after せんこうは supplies the field of study.", "ゆきさんの、せんこうは、れきしです。", [["せんこう", "major"], ["れきし", "history"]]),
      practiceTiles("engineer-major", "Build: “Riku’s major is engineering.”", "Construct the statement.", ["りくさんの", "せんこうは", "こうがく", "です。"], ["けいざい", "かんごし", "なんさい", "か。"], "りくさんの せんこうは こうがくです。", "The possessed major becomes the topic; engineering completes the information.", "りくさんの、せんこうは、こうがくです。", [["りくさんの", "Riku’s"], ["せんこう", "major"], ["こうがく", "engineering"]]),
      practiceChoice("nationality-korea", "ジンさんは かんこくじんです。", "What does the sentence tell you?", ["Jin is Korean.", "Jin studies Korean.", "Jin is in Korea.", "Jin is a Korean teacher."], "Jin is Korean.", "The country name plus じん describes nationality.", "ジンさんは、かんこくじんです。", [["かんこく", "Korea"], ["じん", "person from"], ["です", "is"]]),
      practiceChoice("school-graduate", "Which word means “graduate student”?", "Choose the school identity.", ["だいがくいんせい", "だいがくせい", "こうこうせい", "りゅうがくせい"], "だいがくいんせい", "だいがくいんせい is a graduate student; だいがくせい is an undergraduate university student.", "だいがくいんせいです。", [["だいがくいん", "graduate school"], ["せい", "student"]]),
      practiceTiles("office-worker", "Build: “Mina is an office worker.”", "Choose the right occupation.", ["ミナさんは", "かいしゃいん", "です。"], ["いしゃ", "がくせい", "なん", "の"], "ミナさんは かいしゃいんです。", "The occupation identifies the topic Mina.", "ミナさんは、かいしゃいんです。", [["ミナさん", "Mina"], ["かいしゃいん", "office worker"]]),
      inScenario(practiceChoice("career-fair-yui", "Yui introduces herself at a campus career fair.", "What is her occupation?", ["Nurse", "Doctor", "Teacher", "Office worker"], "かんごし · nurse", "かんごし identifies Yui’s occupation.", "ゆいです。かんごしです。", [["ゆい", "Yui"], ["かんごし", "nurse"]], true), "career-fair", "Campus career fair · Visitors briefly introduce their work."),
      inScenario(practiceTiles("cafe-major-emma", "Tell a new language-café partner Emma’s major.", "Build the complete statement.", ["エマさんの", "せんこうは", "せいぶつがく", "です。"], ["けいざい", "なんさい", "かんごし"], "エマさんの せんこうは せいぶつがくです。", "Emma’s major is the topic and biology supplies the new information."), "language-cafe", "Language café · Your partner asks what Emma studies."),
      inScenario(practiceRepair("repair-nationality", "Repair the nationality description.", "Which sentence correctly says “Sam is Canadian”?", ["サムさんは カナダじんです。", "サムさんの カナダじんです。", "サムさんは カナダですか。", "サムじんは カナダさんです。"], "サムさんは カナダじんです。", "Attach じん to the country and use は to mark Sam as the topic."), "welcome-desk", "University welcome desk · A badge was described as: サムさんの カナダじんです。")
    ],
    questions: [
      practiceTiles("ask-nationality", "Ask: “What nationality are you?”", "Build the natural question.", ["なんじん", "です", "か。"], ["なんさい", "なんじ", "せんこう", "の"], "なんじんですか。", "なんじん asks what nationality; か marks the polite question.", "なんじんですか。", [["なんじん", "what nationality"], ["ですか", "is / are? · polite question"]]),
      practiceTiles("ask-time", "Ask: “What time is it now?”", "Build the complete question.", ["いま", "なんじ", "です", "か。"], ["なんさい", "なんばん", "ねんせい", "の"], "いま なんじですか。", "いま establishes now; なんじ asks what time.", "いま、なんじですか。", [["いま", "now"], ["なんじ", "what time"], ["ですか", "is it? · polite question"]]),
      practiceChoice("answer-negative", "カナダじんですか。", "You are British. Choose the informative answer.", ["いいえ、イギリスじんです。", "はい、カナダじんです。", "なんじんですか。", "いいえ、がくせいですか。"], "いいえ、イギリスじんです。", "A useful negative answer supplies the correct information.", "いいえ、イギリスじんです。", [["いいえ", "no"], ["イギリスじん", "British person"], ["です", "am"]]),
      practiceChoice("answer-positive", "さんねんせいですか。", "You are a third-year student. Choose the natural answer.", ["はい、そうです。", "いいえ、さんねんせいです。", "はい、なんねんせいですか。", "そうですか。"], "はい、そうです。", "はい、そうです confirms that the questioner’s information is correct.", "はい、そうです。", [["はい", "yes"], ["そうです", "that’s right"]]),
      practiceChoice("question-from-age", "The answer is: じゅうはっさいです。", "Which question directly asks for it?", ["なんさいですか。", "なんねんせいですか。", "なんじですか。", "なんばんですか。"], "なんさいですか。", "なんさい asks age; the other question words request different kinds of information.", "なんさいですか。", [["なんさい", "how old"], ["ですか", "are you? · polite question"]]),
      practiceChoice("question-from-year", "The answer is: さんねんせいです。", "Which question directly asks for it?", ["なんねんせいですか。", "なんさいですか。", "なんじですか。", "なんばんですか。"], "なんねんせいですか。", "なんねんせい asks which school year; さんねんせい answers third year.", "なんねんせいですか。", [["なんねんせい", "what school year"], ["ですか", "are you? · polite question"]]),
      practiceTiles("ask-major-alt", "Ask Rina: “What is your major?”", "Address her naturally and build the question.", ["りなさんの", "せんこうは", "なん", "です", "か。"], ["なんさい", "なんじ", "がくせい", "ね。"], "りなさんの せんこうは なんですか。", "The name avoids unnecessary あなた; なん replaces the unknown major.", "りなさんの、せんこうは、なんですか。", [["りなさんの", "Rina’s"], ["せんこう", "major"], ["なん", "what"], ["ですか", "is it?"]]),
      inScenario(practiceTiles("club-major-dan", "Ask Dan what his major is after club practice.", "Use his name and build the question.", ["ダンさんの", "せんこうは", "なん", "です", "か。"], ["なんさい", "なんじ", "がくせい"], "ダンさんの せんこうは なんですか。", "The person plus の identifies whose major you are asking about."), "club", "Tennis club · You are getting to know another new member."),
      inScenario(practiceChoice("dorm-year-sora", "Sora says: さんねんせいです。", "Which question did the new roommate most likely ask?", ["なんねんせいですか。", "なんさいですか。", "なんじですか。", "なんばんですか。"], "なんねんせいですか。", "さんねんせい answers a school-year question."), "dorm", "Dorm lounge · New residents are comparing their school years."),
      inScenario(practiceRepair("repair-major-nan", "Repair the question at the study-group table.", "Which replacement asks “What is your major?” naturally?", ["せんこうは なんですか。", "せんこうは なにですか。", "せんこうの なんですか。", "せんこうは なんさいですか。"], "せんこうは なんですか。", "Before です, 何 is normally read なん in this Lesson 1 pattern."), "study-group", "Study group · A learner asks: せんこうは なにですか。")
    ],
    socialUsage: [
      practiceChoice("anou-interrupt", "Someone is already talking nearby.", "How can you politely enter before asking a question?", ["あのう…", "ただいま。", "いただきます。", "そうです。"], "あのう…", "あのう signals hesitation and softens an interruption.", "あのう。", [["あのう", "um / excuse me · hesitant opener"]]),
      practiceChoice("sou-confirm", "Someone asks whether you are a student.", "Which response means “That’s right”?", ["そうです。", "そうですか。", "そうですね。", "なんですか。"], "そうです。", "そうです confirms information already proposed by the other speaker.", "そうです。", [["そうです", "that’s right"]]),
      practiceChoice("sou-agree", "Your classmate says the lesson is interesting, and you agree.", "Which response invites shared agreement?", ["そうですね。", "そうですか。", "いいえ。", "なんですか。"], "そうですね。", "そうですね can agree with or reflect on what was just said.", "そうですね。", [["そう", "so / that way"], ["です", "is"], ["ね", "isn’t it? · shared agreement"]]),
      practiceChoice("title-professor", "You address Professor Mori directly.", "Which form is natural?", ["もりせんせい", "もりさんせんせい", "あなたせんせい", "わたしせんせい"], "もりせんせい", "A professional title can follow the name directly and replaces さん.", "もりせんせい。", [["もり", "Mori"], ["せんせい", "teacher / professor · respectful title"]]),
      practiceChoice("own-name", "You introduce yourself as Aoi Tanaka.", "Which name form is natural?", ["たなか あおいです。", "たなかさん あおいです。", "あおいせんせいです。", "あなたは あおいです。"], "たなか あおいです。", "Do not normally attach さん to your own name; Japanese names commonly put the family name first.", "たなか、あおいです。", [["たなか", "Tanaka · family name"], ["あおい", "Aoi · given name"], ["です", "am"]]),
      practiceChoice("nan-before-desu", "Complete: せんこうは ___ ですか。", "Which reading of 何 belongs before です?", ["なん", "なに", "だれ", "なんさい"], "せんこうは なんですか。", "なん is the reliable form before です; なに occurs in many other environments.", "せんこうは、なんですか。", [["なん", "what · before です"], ["ですか", "is it? · polite question"]]),
      practiceTiles("address-aoi", "Ask Aoi whether she is a student.", "Use her name rather than unnecessary あなた.", ["あおいさんは", "がくせい", "です", "か。"], ["あなたさんは", "わたしは", "の", "ね。"], "あおいさんは がくせいですか。", "The listener’s name and title naturally identify who the question concerns.", "あおいさんは、がくせいですか。", [["あおいさん", "Aoi · respectful さん"], ["は", "topic marker"], ["がくせい", "student"], ["ですか", "are you?"]]),
      inScenario(practiceChoice("library-anou", "A librarian is helping another student.", "How can you politely get their attention before asking a question?", ["あのう…", "ただいま。", "そうです。", "いただきます。"], "あのう…", "あのう gently signals that you would like to speak."), "library", "Campus library help desk · You need to interrupt briefly."),
      inScenario(practiceRepair("repair-professor-title", "Repair the way a professor is addressed.", "Which form should replace the incorrect name?", ["さとうせんせい", "さとうさんせんせい", "あなたせんせい", "さとうさんさん"], "さとうせんせい", "The title せんせい follows the name directly and replaces さん."), "office-hours", "Professor’s office hours · A student says: さとうさんせんせい。")
    ],
    nounConnections: [
      practiceChoice("main-phone", "たけしさんの でんわばんごう", "What is the main idea?", ["A telephone number", "Takeshi", "A telephone", "A student"], "Takeshi’s telephone number", "The final noun でんわばんごう is the main idea; Takeshi specifies whose number.", "たけしさんの、でんわばんごう。", [["たけしさん", "Takeshi"], ["の", "Takeshi’s"], ["でんわばんごう", "telephone number · main noun"]]),
      practiceTiles("japanese-teacher", "Build: “a Japanese-language teacher”", "Put the field before の.", ["にほんご", "の", "せんせい"], ["は", "がくせい", "です。", "なん"], "にほんごの せんせい", "The field specifies the kind of teacher.", "にほんごの、せんせい。", [["にほんご", "Japanese language"], ["の", "of / specialising in"], ["せんせい", "teacher"]]),
      practiceTiles("mari-friend", "Build: “Mari’s friend”", "Connect the owner and main noun.", ["まりさん", "の", "ともだち"], ["は", "せんせい", "か。", "なん"], "まりさんの ともだち", "The person before の identifies whose friend is meant.", "まりさんの、ともだち。", [["まりさん", "Mari"], ["の", "Mari’s"], ["ともだち", "friend"]]),
      practiceChoice("main-university", "にほんの だいがく", "What kind of thing is the complete phrase?", ["A university", "Japan", "A Japanese person", "A university student"], "a university in Japan", "The final noun だいがく is the main idea; にほん specifies its location or association.", "にほんの、だいがく。", [["にほん", "Japan"], ["の", "in / associated with"], ["だいがく", "university · main noun"]]),
      practiceTiles("school-student", "Build: “a student at Seoul University”", "Create the affiliation phrase.", ["ソウルだいがく", "の", "がくせい"], ["せんせい", "は", "なん", "です。"], "ソウルだいがくの がくせい", "The institution comes before の; the student remains the main idea.", "ソウルだいがくの、がくせい。", [["ソウルだいがく", "Seoul University"], ["の", "at / affiliated with"], ["がくせい", "student"]]),
      practiceChoice("read-major", "けんさんの せんこう", "Choose the natural meaning.", ["Ken’s major", "a major named Ken", "Ken’s teacher", "a Japanese major"], "Ken’s major", "A person before の commonly marks possession or association.", "けんさんの、せんこう。", [["けんさん", "Ken"], ["の", "Ken’s"], ["せんこう", "major"]]),
      inScenario(practiceTiles("language-school-student", "Describe Priya as a student at Tokyo University.", "Build the affiliation phrase.", ["プリヤさんは", "とうきょうだいがく", "の", "がくせい", "です。"], ["せんせい", "なん", "か。"], "プリヤさんは とうきょうだいがくの がくせいです。", "The university comes before の and specifies what kind of student Priya is."), "language-school", "Language school reception · The receptionist asks about Priya’s university."),
      inScenario(practiceRepair("repair-affiliation-order", "Repair the university affiliation.", "Which phrase correctly means “a student at Seoul University”?", ["ソウルだいがくの がくせい", "がくせいの ソウルだいがく", "ソウルだいがくは のがくせい", "ソウルだいがくさん がくせい"], "ソウルだいがくの がくせい", "The specifying institution comes before の; the main noun がくせい comes last."), "campus-tour", "Campus tour · A guide’s card says: がくせいの ソウルだいがく。")
    ],
    family: [
      practiceChoice("older-sister", "みかさんの おねえさん", "Who is this?", ["Mika’s older sister", "Mika’s younger sister", "Mika’s mother", "Mika’s friend"], "Mika’s older sister", "おねえさん identifies an older sister; の tells you whose.", "みかさんの、おねえさん。", [["みかさんの", "Mika’s"], ["おねえさん", "older sister"]]),
      practiceChoice("younger-brother", "Which word means “younger brother”?", "Choose the family word.", ["おとうと", "おにいさん", "いもうと", "おとうさん"], "おとうと", "おとうと means younger brother; おにいさん means older brother.", "おとうと。", [["おとうと", "younger brother"]]),
      practiceTiles("father-doctor", "Build: “Aoi’s father is a doctor.”", "Make the family phrase the topic.", ["あおいさんの", "おとうさんは", "いしゃ", "です。"], ["おかあさんは", "かんごし", "なんさい", "か。"], "あおいさんの おとうさんは いしゃです。", "Aoi’s father is the full topic; doctor supplies the occupation.", "あおいさんの、おとうさんは、いしゃです。", [["あおいさんの", "Aoi’s"], ["おとうさん", "father"], ["いしゃ", "doctor"]]),
      practiceChoice("listen-sister", "What did Ren say about his younger sister?", "Listen and choose both details.", ["She is a high-school student", "She is a nurse", "She is a graduate student", "She is an office worker"], "いもうと · こうこうせい", "The topic is Ren’s younger sister; こうこうせい gives her school identity.", "れんさんの、いもうとは、こうこうせいです。", [["いもうと", "younger sister"], ["こうこうせい", "high-school student"]], true),
      practiceChoice("mother-age", "おかあさんは よんじゅうはっさいです。", "How old is the mother?", ["48", "45", "18", "Fourth year"], "48 years old", "よんじゅうはっさい is 48 years old; はち changes to はっ before さい.", "おかあさんは、よんじゅうはっさいです。", [["よんじゅう", "forty"], ["はっさい", "eight years old · sound change"]]),
      practiceTiles("brother-student", "Build: “Ken’s older brother is a graduate student.”", "Construct the family description.", ["けんさんの", "おにいさんは", "だいがくいんせい", "です。"], ["おとうとは", "だいがくせい", "なん", "か。"], "けんさんの おにいさんは だいがくいんせいです。", "The family noun phrase becomes the topic before the school identity.", "けんさんの、おにいさんは、だいがくいんせいです。", [["けんさんの", "Ken’s"], ["おにいさん", "older brother"], ["だいがくいんせい", "graduate student"]]),
      inScenario(practiceChoice("festival-family-aya", "Aya points to someone at a neighbourhood festival.", "Who does she identify?", ["Aya’s mother", "Aya’s older sister", "Aya’s friend", "Aya’s teacher"], "あやさんの おかあさん · Aya’s mother", "おかあさん identifies a mother and の tells you whose.", "あやさんの、おかあさんです。", [["あやさんの", "Aya’s"], ["おかあさん", "mother"]], true), "festival", "Neighbourhood festival · You are being introduced to people’s families."),
      inScenario(practiceRepair("repair-family-topic", "Repair the family description.", "Which sentence correctly says “Nora’s father is a doctor”?", ["ノラさんの おとうさんは いしゃです。", "ノラさんは おとうさんの いしゃです。", "ノラさんの おとうさんの いしゃです。", "ノラさんさん おとうさんは いしゃです。"], "ノラさんの おとうさんは いしゃです。", "First connect Nora to father with の, then mark the whole family phrase as the topic with は."), "community-picnic", "Community picnic · A name card was assembled incorrectly.")
    ],
    ageYear: [
      practiceInput("age-18-listen", "How old is the person?", "Listen and enter digits only.", ["18"], "18 years old · じゅうはっさい", "Eight changes to はっ before the age counter さい.", "じゅうはっさいです。", "Enter a number", "numeric", [["じゅう", "ten"], ["はっさい", "eight years old · sound change"]]),
      practiceInput("age-21-listen", "Enter the age you hear.", "Type digits only.", ["21"], "21 years old · にじゅういっさい", "One changes to いっ before さい.", "にじゅういっさいです。", "Enter a number", "numeric", [["にじゅう", "twenty"], ["いっさい", "one year old · sound change"]]),
      practiceChoice("year-two", "The answer is にねんせいです。", "Which English meaning fits?", ["Second-year student", "Two years old", "Two o’clock", "Second major"], "second-year student", "ねんせい counts school years, not age or time.", "にねんせいです。", [["に", "two"], ["ねんせい", "year student"]]),
      practiceChoice("age-20", "Which complete answer means “I am 20 years old”?", "Choose the special form.", ["はたちです。", "にじゅうさいです。", "にじゅうねんせいです。", "はちじです。"], "はたちです。", "Age 20 uses the special word はたち.", "はたちです。", [["はたち", "20 years old · special word"], ["です", "am"]]),
      practiceTiles("age-question", "Ask Mei how old she is.", "Build the question using her name.", ["めいさんは", "なんさい", "です", "か。"], ["なんねんせい", "なんじ", "はたち", "ね。"], "めいさんは なんさいですか。", "なんさい asks a person’s age; the name plus は makes Mei the topic.", "めいさんは、なんさいですか。", [["めいさん", "Mei"], ["は", "topic marker · pronounced wa"], ["なんさい", "how old · what age"], ["ですか", "are you? · polite question"]]),
      practiceTiles("year-question", "Ask Mei which school year she is in.", "Build the question using her name.", ["めいさんは", "なんねんせい", "です", "か。"], ["なんさい", "なんじ", "はたち", "ね。"], "めいさんは なんねんせいですか。", "なんねんせい asks which year at school.", "めいさんは、なんねんせいですか。", [["めいさん", "Mei"], ["なんねんせい", "what school year"], ["ですか", "are you?"]]),
      practiceChoice("year-six", "ろくねんせいです。", "What information is being given?", ["The person is a sixth-year student", "The person is six years old", "It is six o’clock", "The number is six"], "sixth-year student", "ろくねんせい is a school-year identity.", "ろくねんせいです。", [["ろく", "six"], ["ねんせい", "year student"]]),
      inScenario(practiceTiles("club-age-omar", "Ask Omar’s age on the club registration form.", "Build the polite spoken question.", ["オマルさんは", "なんさい", "です", "か。"], ["なんねんせい", "なんじ", "はたち"], "オマルさんは なんさいですか。", "なんさい requests age; Omar’s name establishes whose age you mean."), "club-registration", "Sports club registration · One required detail is missing."),
      inScenario(practiceChoice("orientation-year-mina", "Mina answers: いちねんせいです。", "What detail did she give?", ["She is a first-year student", "She is one year old", "It is one o’clock", "Her number is one"], "first-year student", "ねんせい identifies a school year.", "いちねんせいです。"), "orientation", "New-student orientation · Everyone shares their year of study.")
    ],
    phone: [
      practiceInput("phone-4159", "Enter the telephone digits.", "Listen and type four digits.", ["4159"], "4159", "Telephone numbers are decoded one digit at a time.", "よん、いち、ご、きゅう", "XXXX", "numeric", [["よん", "4"], ["いち", "1"], ["ご", "5"], ["きゅう", "9"]]),
      practiceInput("phone-2839547", "Enter the complete telephone number.", "Hyphens are optional.", ["2839547", "283-9547"], "283-9547", "Each digit is independent; なな and きゅう remain easy to distinguish.", "に、はち、さん、きゅう、ご、よん、なな", "XXX-XXXX", "tel", [["に", "2"], ["はち", "8"], ["さん", "3"], ["きゅう", "9"], ["ご", "5"], ["よん", "4"], ["なな", "7"]]),
      practiceTiles("confirm-4159", "Confirm: “4159, right?”", "Build the short confirmation.", ["4159", "です", "ね。"], ["か。", "なんばん", "の", "いいえ"], "4159ですね。", "ね invites the other person to confirm what you heard.", "よん、いち、ご、きゅう、ですね。", [["4159", "digits heard"], ["です", "is"], ["ね", "right? · confirmation"]]),
      practiceChoice("confirm-reply", "Someone repeats your number correctly with ですね。", "How do you confirm it?", ["はい、そうです。", "そうですか。", "いいえ、なんさいです。", "なんばんですか。"], "はい、そうです。", "はい、そうです confirms that the repeated number is correct.", "はい、そうです。", [["はい", "yes"], ["そうです", "that’s right"]]),
      practiceChoice("phone-question", "Which question asks for a telephone number?", "Choose the complete question.", ["でんわばんごうは なんばんですか。", "でんわばんごうは なんじですか。", "なんさいですか。", "せんこうは なんですか。"], "でんわばんごうは なんばんですか。", "The topic says telephone number and なんばん asks which number.", "でんわばんごうは、なんばんですか。", [["でんわばんごう", "telephone number"], ["なんばん", "what number"], ["ですか", "is it?"]]),
      practiceInput("phone-6072", "What number did you hear?", "Type the four digits.", ["6072"], "6072", "Zero may be pronounced ゼロ; the other digits retain their ordinary telephone readings.", "ろく、ゼロ、なな、に", "XXXX", "numeric", [["ろく", "6"], ["ゼロ", "0"], ["なな", "7"], ["に", "2"]]),
      inScenario(practiceInput("study-group-phone", "Enter the number your new study partner gives you.", "Listen and type the four digits.", ["8246"], "8246", "Decode each spoken digit in order.", "はち、に、よん、ろく", "XXXX", "numeric"), "study-group", "Study group · You are exchanging contact details with Farah."),
      inScenario(practiceTiles("orientation-confirm-phone", "Confirm the orientation helper’s number: “9361, right?”", "Build the short confirmation.", ["9361", "です", "ね。"], ["か。", "なんさい", "の"], "9361ですね。", "ですね asks the listener to confirm what you heard."), "orientation", "Orientation desk · The room is noisy, so you repeat the number back.")
    ],
    time: [
      practiceInput("time-730", "What time did you hear?", "Enter digits with a colon.", ["7:30", "07:30"], "7:30 a.m. · ごぜん しちじはん", "ごぜん marks a.m.; しちじ is seven o’clock and はん adds half past.", "ごぜん、しちじはんです。", "HH:MM", "text", [["ごぜん", "a.m."], ["しちじ", "seven o’clock"], ["はん", "half past"]]),
      practiceInput("time-400", "Enter the time you hear.", "Use digits and a colon.", ["4:00", "04:00", "4"], "4:00 · よじ", "Four o’clock uses the special reading よじ.", "よじです。", "HH:MM", "text", [["よじ", "four o’clock · special reading"]]),
      practiceChoice("time-nine", "The clock shows 9:00.", "Which answer is standard?", ["くじです。", "きゅうじです。", "くさいです。", "きゅうねんせいです。"], "くじです。", "Nine o’clock uses くじ rather than きゅうじ.", "くじです。", [["くじ", "nine o’clock"], ["です", "is"]]),
      practiceTiles("time-london", "Ask: “What time is it now in London?”", "Build the city-time question.", ["ロンドンは", "いま", "なんじ", "です", "か。"], ["なんさい", "なんばん", "ごご", "ね。"], "ロンドンは いま なんじですか。", "The city becomes the topic; いま なんじ asks the current time.", "ロンドンは、いま、なんじですか。", [["ロンドン", "London"], ["は", "topic marker"], ["いま", "now"], ["なんじ", "what time"], ["ですか", "is it?"]]),
      practiceChoice("time-pm", "It is 6:00 p.m. in London.", "Choose the complete answer.", ["ごご ろくじです。", "ごぜん ろくじです。", "ろくねんせいです。", "ごご ろくさいです。"], "ごご ろくじです。", "ごご marks p.m.; ろくじ is six o’clock.", "ごご、ろくじです。", [["ごご", "p.m."], ["ろくじ", "six o’clock"]]),
      practiceChoice("time-noon", "The clock shows 12:30.", "Which answer fits?", ["じゅうにじはんです。", "にじゅうはんです。", "じゅうにさいです。", "じゅうにねんせいです。"], "じゅうにじはんです。", "じゅうにじ is twelve o’clock and はん adds half past.", "じゅうにじはんです。", [["じゅうにじ", "twelve o’clock"], ["はん", "half past"]]),
      inScenario(practiceTiles("online-meetup-time", "Ask what time it is now in Tokyo.", "Build the question for an online meetup.", ["とうきょうは", "いま", "なんじ", "です", "か。"], ["なんさい", "ごご", "ね。"], "とうきょうは いま なんじですか。", "Tokyo is the topic; いま なんじ asks its current time."), "online-meetup", "Online language exchange · Participants are joining from different cities."),
      inScenario(practiceRepair("repair-nine-oclock", "Repair the time announcement.", "Which answer correctly says “It is nine o’clock”?", ["くじです。", "きゅうじです。", "くさいです。", "きゅうねんせいです。"], "くじです。", "Nine o’clock uses the special reading くじ."), "train-station", "Train-station meeting point · Someone says: きゅうじです。")
    ],
    integrated: [
      practiceChoice("meet-response", "Ren says: はじめまして。れんです。", "Choose a natural response.", ["はじめまして。あおいです。よろしくおねがいします。", "ごちそうさまでした。", "なんじですか。", "ただいま。"], "はじめまして。あおいです。よろしくおねがいします。", "Mirror the first-meeting opener, give your identity, and close courteously.", "はじめまして。あおいです。よろしくおねがいします。", [["はじめまして", "nice to meet you"], ["あおいです", "I’m Aoi"], ["よろしくおねがいします", "courteous close"]]),
      practiceChoice("listen-profile", "What did Sora tell you?", "Listen and choose the complete profile.", ["Sora is a Korean third-year economics major", "Sora is a Japanese economics teacher", "Sora is a second-year biology major", "Sora is a Korean nurse"], "Korean · third year · economics", "The three short sentences continue describing the same person.", "かんこくじんです。さんねんせいです。せんこうは、けいざいです。", [["かんこくじん", "Korean person"], ["さんねんせい", "third-year student"], ["けいざい", "economics"]], true),
      practiceTiles("mission-major", "Ask Kai what his major is.", "Use his name and build the question.", ["かいさんの", "せんこうは", "なん", "です", "か。"], ["なんさい", "なんじ", "がくせい", "ね。"], "かいさんの せんこうは なんですか。", "The name identifies whose major; なん marks the unknown information.", "かいさんの、せんこうは、なんですか。", [["かいさんの", "Kai’s"], ["せんこう", "major"], ["なん", "what"], ["ですか", "is it?"]]),
      practiceChoice("mission-acknowledge", "Kai says his major is engineering.", "How do you naturally acknowledge the new information?", ["そうですか。", "そうです。", "いいえ、こうがくです。", "なんさいですか。"], "そうですか。", "そうですか receives new information as “I see.”", "そうですか。", [["そうですか", "I see / is that so?"]]),
      practiceInput("mission-phone", "A new classmate gives a telephone number.", "Listen and type the four digits.", ["7315"], "7315", "Decode the number one digit at a time rather than memorising an earlier recording.", "なな、さん、いち、ご", "XXXX", "numeric", [["なな", "7"], ["さん", "3"], ["いち", "1"], ["ご", "5"]]),
      practiceTiles("mission-close", "Thank the classmate and close warmly.", "Build a natural short ending after exchanging details.", ["ありがとうございます。", "よろしくおねがいします。"], ["なんさいですか。", "いいえ。", "いただきます。", "ただいま。"], "ありがとうございます。よろしくおねがいします。", "Thanks acknowledges the help or information; よろしく preserves goodwill for the new relationship.", "ありがとうございます。よろしくおねがいします。", [["ありがとうございます", "thank you · polite"], ["よろしくおねがいします", "please treat me kindly"]]),
      inScenario(practiceChoice("orientation-meet-priya", "Priya introduces herself beside you at orientation.", "Choose a complete, natural reply as Noah.", ["はじめまして。ノアです。よろしくおねがいします。", "ただいま。", "なんじですか。", "ごちそうさまでした。"], "はじめまして。ノアです。よろしくおねがいします。", "Reply with the first-meeting opener, your own name, and a courteous close."), "orientation", "International orientation · Two new students are paired for introductions."),
      inScenario(practiceTiles("club-ask-emma", "Ask Emma’s major while meeting your new club team.", "Build the question naturally.", ["エマさんの", "せんこうは", "なん", "です", "か。"], ["なんさい", "あなたさん", "ね。"], "エマさんの せんこうは なんですか。", "Use Emma’s name to identify whose major you mean."), "club", "Film club · Members are learning what everyone studies."),
      inScenario(practiceChoice("dorm-profile-noa", "What did Noa tell the other residents?", "Listen and choose the complete profile.", ["Noa is Canadian, a first-year student, and a biology major", "Noa is a Canadian biology teacher", "Noa is a second-year economics major", "Noa is a nurse"], "Canadian · first year · biology", "The three statements describe Noa’s nationality, school year, and major.", "カナダじんです。いちねんせいです。せんこうは、せいぶつがくです。", [["カナダじん", "Canadian person"], ["いちねんせい", "first-year student"], ["せいぶつがく", "biology"]], true), "dorm", "Dorm welcome evening · Each resident shares three details."),
      inScenario(practiceChoice("cafe-acknowledge-major", "A language-café partner tells you their major is history.", "How do you acknowledge this new information?", ["そうですか。", "そうです。", "いいえ。", "なんさいですか。"], "そうですか。", "そうですか naturally receives information you have just learned."), "language-cafe", "Language café · You are exchanging basic personal details."),
      inScenario(practiceTiles("event-close", "Close a helpful introduction at the campus welcome event.", "Thank the person and leave the new relationship warmly.", ["ありがとうございます。", "よろしくおねがいします。"], ["ただいま。", "なんばんですか。", "いいえ。"], "ありがとうございます。よろしくおねがいします。", "Thank the person, then use よろしくおねがいします to express goodwill."), "campus-event", "Welcome event · A student has just introduced you to the group.")
    ]
  };

  const PRACTICE_FAMILY_IDS = {
    greetings: ["greet-time", "greet-courtesy", "greet-home", "greet-meal"],
    firstMeeting: ["open-situation", "open-listen", "open-build", "open-response"],
    introductions: ["identity-meaning", "identity-build", "identity-omit", "identity-other", "intro-listen", "intro-build", "identity-flex"],
    personalInfo: ["people-nationality", "people-work", "people-build", "people-major", "people-school", "people-transfer"],
    questions: ["ask-yes-no", "ask-major", "ask-year", "ask-listen-age"],
    socialUsage: ["natural-san", "natural-order", "natural-address", "natural-anou", "natural-sou", "natural-nan-nani", "natural-sensei"],
    nounConnections: ["connect-main", "connect-build", "connect-possess", "connect-sentence", "connect-nested"],
    family: ["connect-family", "connect-family-build", "details-family-listen"],
    ageYear: ["details-age", "details-year", "details-age-listen", "mission-ask", "mission-age"],
    phone: ["ask-phone-kind", "details-phone", "details-phone-long", "details-confirm", "mission-phone", "mission-confirm"],
    time: ["details-time", "details-time-listen", "details-seven", "details-world-time"],
    integrated: ["mission-greet", "mission-address", "mission-understand", "mission-close"]
  };
  const PRACTICE_FAMILY_BY_ID = Object.fromEntries(Object.entries(PRACTICE_FAMILY_IDS).flatMap(([family, ids]) => ids.map(id => [id, family])));
  const PRACTICE_VARIANT_KEYS_BY_ID = Object.fromEntries([
    [["greet-time"], ["morning-teacher", "day-classmate"]],
    [["greet-courtesy"], ["thanks-response"]],
    [["greet-home"], ["return-home", "listen-leaving"]],
    [["greet-meal"], ["before-meal"]],
    [["open-situation"], ["opener-new", "purpose-yoroshiku", "club-reply-leo"]],
    [["open-listen"], ["listen-name", "purpose-yoroshiku"]],
    [["open-build"], ["intro-aki", "intro-kana", "dorm-intro-noa", "repair-self-san"]],
    [["open-response"], ["reply-yuna", "club-reply-leo", "repair-self-san"]],
    [["identity-meaning", "identity-build", "identity-other"], ["identity-sora", "plural-context", "lab-intro-tomo", "repair-student-topic"]],
    [["identity-omit"], ["omit-topic"]],
    [["intro-listen"], ["listen-kai", "orientation-listen-reina"]],
    [["intro-build"], ["intro-yuna", "intro-mei", "lab-intro-tomo", "repair-student-topic"]],
    [["identity-flex"], ["plural-context"]],
    [["people-nationality", "people-transfer"], ["nationality-korea", "repair-nationality"]],
    [["people-work", "people-build"], ["listen-lawyer", "office-worker", "career-fair-yui"]],
    [["people-major"], ["major-history", "engineer-major", "cafe-major-emma"]],
    [["people-school"], ["school-graduate"]],
    [["ask-yes-no"], ["answer-negative", "answer-positive"]],
    [["ask-major"], ["ask-major-alt", "club-major-dan", "repair-major-nan"]],
    [["ask-year"], ["question-from-year", "dorm-year-sora"]],
    [["ask-listen-age"], ["question-from-age"]],
    [["ask-phone-kind"], ["phone-question"]],
    [["natural-san", "natural-order"], ["own-name"]],
    [["natural-address"], ["address-aoi", "repair-professor-title"]],
    [["natural-anou"], ["anou-interrupt", "library-anou"]],
    [["natural-sou"], ["sou-confirm", "sou-agree"]],
    [["natural-nan-nani"], ["nan-before-desu"]],
    [["natural-sensei"], ["title-professor", "repair-professor-title"]],
    [["connect-main", "connect-nested"], ["main-phone", "main-university"]],
    [["connect-build"], ["japanese-teacher", "school-student", "language-school-student", "repair-affiliation-order"]],
    [["connect-possess"], ["mari-friend", "read-major"]],
    [["connect-sentence"], ["school-student", "language-school-student", "repair-affiliation-order"]],
    [["connect-family"], ["older-sister", "younger-brother", "listen-sister", "festival-family-aya"]],
    [["connect-family-build", "details-family-listen"], ["father-doctor", "mother-age", "brother-student", "repair-family-topic"]],
    [["details-age", "details-age-listen", "mission-age"], ["age-18-listen", "age-21-listen", "age-20"]],
    [["details-year"], ["year-two", "year-question", "year-six", "orientation-year-mina"]],
    [["mission-ask"], ["age-question", "age-20", "club-age-omar"]],
    [["details-phone", "details-phone-long", "mission-phone"], ["phone-4159", "phone-2839547", "phone-6072", "study-group-phone"]],
    [["details-confirm", "mission-confirm"], ["confirm-4159", "confirm-reply", "orientation-confirm-phone"]],
    [["details-time", "details-time-listen"], ["time-730", "time-400", "time-nine", "time-noon"]],
    [["details-seven", "details-world-time"], ["time-nine", "time-london", "time-pm", "time-noon", "online-meetup-time", "repair-nine-oclock"]],
    [["mission-greet"], ["meet-response", "orientation-meet-priya"]],
    [["mission-address"], ["mission-major", "club-ask-emma"]],
    [["mission-understand"], ["listen-profile", "dorm-profile-noa"]],
    [["mission-close"], ["mission-acknowledge", "mission-close", "cafe-acknowledge-major", "event-close"]]
  ].flatMap(([ids, keys]) => ids.map(id => [id, keys])));

  window.GUIDED_LESSONS = window.GUIDED_LESSONS || {};
  window.GUIDED_LESSONS["1"] = {
    id: "1",
    number: 1,
    slug: "meet-someone",
    title: "Meet Someone",
    headline: "Lesson 1 · Meet Someone",
    subtitle: "Learn to open a conversation, introduce yourself, ask about another person, and understand their answers.",
    journeyTitle: "First conversation",
    available: true,
    foundation: {
      title: "Number foundation",
      copy: "General number fluency stays in Kana Mix. This lesson only teaches how numbers behave in ages, school years, phone numbers, and time.",
      href: "./kana_sprint.html#numbers",
      label: "Review numbers in Kana Mix"
    },
    storageKey: "kanaSprintGuidedLessonsV1",
    commonMistakeGuidance: COMMON_MISTAKE_GUIDANCE,
    stages: STAGES,
    answerBreakdowns: ANSWER_BREAKDOWNS,
    guideBreakdowns: GUIDE_BREAKDOWNS,
    stageWrapups: STAGE_WRAPUPS,
    practiceFamilies: PRACTICE_FAMILIES,
    practiceFamilyIds: PRACTICE_FAMILY_IDS,
    practiceFamilyById: PRACTICE_FAMILY_BY_ID,
    practiceVariantKeysById: PRACTICE_VARIANT_KEYS_BY_ID
  };
})();

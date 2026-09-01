(() => {
  "use strict";

  const STORAGE_KEY = "kanaSprintGuidedLessonsV1";
  const SPEECH_STORAGE_KEY = "kanaSprintSpeechV1";
  const VERSION = 1;
  const REVIEW_INTERVALS = [2 * 60000, 24 * 60 * 60000, 3 * 24 * 60 * 60000, 7 * 24 * 60 * 60000, 14 * 24 * 60 * 60000, 30 * 24 * 60 * 60000];
  const PRACTICE_SESSION_LENGTH = 6;
  const $ = selector => document.querySelector(selector);
  const shuffle = values => {
    const shuffled = [...values];
    for (let index = shuffled.length - 1; index > 0; index--) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
  };
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const normalize = value => String(value ?? "").toLowerCase().trim().replace(/[\s。、・,.!?！？:：'’_-]+/g, "").replace(/ō/g, "ou");
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
          correction: "はじめまして。けんです。よろしくおねがいします。", explanation: "Mirror the first-meeting structure while supplying your own name."
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
          correction: "たなか · family name", explanation: "Japanese names normally put the family name before the given name. Aoi is the given name here."
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
    key, type: "choice", title, prompt, options, answer: 0, correction, explanation, audioText, breakdown, listenOnly
  });
  const practiceTiles = (key, title, prompt, answer, distractors, correction, explanation, audioText = "", breakdown = []) => ({
    key, type: "tiles", title, prompt, tokens: answer, answer, distractors, correction, explanation, audioText, breakdown
  });
  const practiceInput = (key, title, prompt, answers, correction, explanation, audioText, placeholder, inputMode = "text", breakdown = []) => ({
    key, type: "input", title, prompt, answers, correction, explanation, audioText, placeholder, inputMode, breakdown
  });

  const PRACTICE_FAMILIES = {
    firstMeeting: [
      practiceTiles("intro-aki", "Introduce yourself as Aki.", "Build the three-part first meeting.", ["はじめまして。", "あきです。", "よろしくおねがいします。"], ["ただいま。", "なんさいですか。", "いいえ。", "ごちそうさまでした。"], "はじめまして。あきです。よろしくおねがいします。", "Open the first meeting, give the name, and close with goodwill.", "はじめまして。あきです。よろしくおねがいします。", [["はじめまして", "nice to meet you"], ["あきです", "I’m Aki"], ["よろしくおねがいします", "courteous close"]]),
      practiceChoice("reply-yuna", "Yuna introduces herself for the first time.", "Which response fits naturally?", ["はじめまして。けんです。よろしくおねがいします。", "ただいま。", "ごちそうさまでした。", "なんじですか。"], "はじめまして。けんです。よろしくおねがいします。", "Mirror the first-meeting structure while giving your own name.", "はじめまして。けんです。よろしくおねがいします。", [["はじめまして", "nice to meet you"], ["けんです", "I’m Ken"], ["よろしくおねがいします", "courteous close"]]),
      practiceChoice("purpose-yoroshiku", "What conversational job does the expression perform?", "Listen and choose.", ["It closes a first introduction with goodwill", "It welcomes someone home", "It begins a meal", "It asks a person’s name"], "よろしくおねがいします。", "In a first meeting, よろしくおねがいします provides a courteous close.", "よろしくおねがいします。", [["よろしく", "favorably · with goodwill"], ["おねがいします", "please · polite request"]], true),
      practiceChoice("opener-new", "You are meeting Ren for the first time.", "What should you say before giving your name?", ["はじめまして。", "おかえりなさい。", "いただきます。", "そうですか。"], "はじめまして。", "はじめまして is reserved for the beginning of a first meeting.", "はじめまして。", [["はじめまして", "nice to meet you · first-meeting opener"]]),
      practiceTiles("intro-kana", "Introduce yourself as Kana.", "Choose only the useful chunks.", ["はじめまして。", "かなです。", "よろしくおねがいします。"], ["いってきます。", "がくせいですか。", "こんばんは。", "いいえ。"], "はじめまして。かなです。よろしくおねがいします。", "The social sequence remains opener, identity, then goodwill.", "はじめまして。かなです。よろしくおねがいします。", [["かなです", "I’m Kana"], ["よろしくおねがいします", "courteous close"]]),
      practiceChoice("listen-name", "What name did the new classmate give?", "Listen before choosing.", ["Haru", "Aki", "Yuna", "Ken"], "はる · Haru", "The middle chunk gives the speaker’s name between the opener and close.", "はじめまして。はるです。よろしくおねがいします。", [["はる", "Haru · the speaker’s name"]], true)
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
      practiceTiles("intro-mei", "Introduce Mei as a second-year student.", "Choose the useful chunks and order them.", ["はじめまして。", "めいです。", "にねんせいです。", "よろしくおねがいします。"], ["なんねんせいですか。", "いしゃです。", "ごちそうさまでした。", "か。"], "はじめまして。めいです。にねんせいです。よろしくおねがいします。", "A compact introduction moves from opening to identity, useful detail, and courteous close.", "はじめまして。めいです。にねんせいです。よろしくおねがいします。", [["めいです", "I’m Mei"], ["にねんせいです", "I’m a second-year student"]])
    ],
    personalInfo: [
      practiceChoice("listen-lawyer", "What is Ken’s occupation?", "Listen and choose.", ["Lawyer", "Doctor", "Nurse", "Office worker"], "べんごし · lawyer", "べんごし identifies Ken’s occupation.", "けんさんは、べんごしです。", [["けんさん", "Ken"], ["べんごし", "lawyer"]], true),
      practiceChoice("major-history", "ゆきさんの せんこうは れきしです。", "What is Yuki’s major?", ["History", "Economics", "Engineering", "Biology"], "れきし · history", "The noun after せんこうは supplies the field of study.", "ゆきさんの、せんこうは、れきしです。", [["せんこう", "major"], ["れきし", "history"]]),
      practiceTiles("engineer-major", "Build: “Riku’s major is engineering.”", "Construct the statement.", ["りくさんの", "せんこうは", "こうがく", "です。"], ["けいざい", "かんごし", "なんさい", "か。"], "りくさんの せんこうは こうがくです。", "The possessed major becomes the topic; engineering completes the information.", "りくさんの、せんこうは、こうがくです。", [["りくさんの", "Riku’s"], ["せんこう", "major"], ["こうがく", "engineering"]]),
      practiceChoice("nationality-korea", "ジンさんは かんこくじんです。", "What does the sentence tell you?", ["Jin is Korean.", "Jin studies Korean.", "Jin is in Korea.", "Jin is a Korean teacher."], "Jin is Korean.", "The country name plus じん describes nationality.", "ジンさんは、かんこくじんです。", [["かんこく", "Korea"], ["じん", "person from"], ["です", "is"]]),
      practiceChoice("school-graduate", "Which word means “graduate student”?", "Choose the school identity.", ["だいがくいんせい", "だいがくせい", "こうこうせい", "りゅうがくせい"], "だいがくいんせい", "だいがくいんせい is a graduate student; だいがくせい is an undergraduate university student.", "だいがくいんせいです。", [["だいがくいん", "graduate school"], ["せい", "student"]]),
      practiceTiles("office-worker", "Build: “Mina is an office worker.”", "Choose the right occupation.", ["ミナさんは", "かいしゃいん", "です。"], ["いしゃ", "がくせい", "なん", "の"], "ミナさんは かいしゃいんです。", "The occupation identifies the topic Mina.", "ミナさんは、かいしゃいんです。", [["ミナさん", "Mina"], ["かいしゃいん", "office worker"]])
    ],
    questions: [
      practiceTiles("ask-nationality", "Ask: “What nationality are you?”", "Build the natural question.", ["なんじん", "です", "か。"], ["なんさい", "なんじ", "せんこう", "の"], "なんじんですか。", "なんじん asks what nationality; か marks the polite question.", "なんじんですか。", [["なんじん", "what nationality"], ["ですか", "is / are? · polite question"]]),
      practiceTiles("ask-time", "Ask: “What time is it now?”", "Build the complete question.", ["いま", "なんじ", "です", "か。"], ["なんさい", "なんばん", "ねんせい", "の"], "いま なんじですか。", "いま establishes now; なんじ asks what time.", "いま、なんじですか。", [["いま", "now"], ["なんじ", "what time"], ["ですか", "is it? · polite question"]]),
      practiceChoice("answer-negative", "カナダじんですか。", "You are British. Choose the informative answer.", ["いいえ、イギリスじんです。", "はい、カナダじんです。", "なんじんですか。", "いいえ、がくせいですか。"], "いいえ、イギリスじんです。", "A useful negative answer supplies the correct information.", "いいえ、イギリスじんです。", [["いいえ", "no"], ["イギリスじん", "British person"], ["です", "am"]]),
      practiceChoice("answer-positive", "さんねんせいですか。", "You are a third-year student. Choose the natural answer.", ["はい、そうです。", "いいえ、さんねんせいです。", "はい、なんねんせいですか。", "そうですか。"], "はい、そうです。", "はい、そうです confirms that the questioner’s information is correct.", "はい、そうです。", [["はい", "yes"], ["そうです", "that’s right"]]),
      practiceChoice("question-from-age", "The answer is: じゅうはっさいです。", "Which question directly asks for it?", ["なんさいですか。", "なんねんせいですか。", "なんじですか。", "なんばんですか。"], "なんさいですか。", "なんさい asks age; the other question words request different kinds of information.", "なんさいですか。", [["なんさい", "how old"], ["ですか", "are you? · polite question"]]),
      practiceChoice("question-from-year", "The answer is: さんねんせいです。", "Which question directly asks for it?", ["なんねんせいですか。", "なんさいですか。", "なんじですか。", "なんばんですか。"], "なんねんせいですか。", "なんねんせい asks which school year; さんねんせい answers third year.", "なんねんせいですか。", [["なんねんせい", "what school year"], ["ですか", "are you? · polite question"]]),
      practiceTiles("ask-major-alt", "Ask Rina: “What is your major?”", "Address her naturally and build the question.", ["りなさんの", "せんこうは", "なん", "です", "か。"], ["なんさい", "なんじ", "がくせい", "ね。"], "りなさんの せんこうは なんですか。", "The name avoids unnecessary あなた; なん replaces the unknown major.", "りなさんの、せんこうは、なんですか。", [["りなさんの", "Rina’s"], ["せんこう", "major"], ["なん", "what"], ["ですか", "is it?"]])
    ],
    socialUsage: [
      practiceChoice("anou-interrupt", "Someone is already talking nearby.", "How can you politely enter before asking a question?", ["あのう…", "ただいま。", "いただきます。", "そうです。"], "あのう…", "あのう signals hesitation and softens an interruption.", "あのう。", [["あのう", "um / excuse me · hesitant opener"]]),
      practiceChoice("sou-confirm", "Someone asks whether you are a student.", "Which response means “That’s right”?", ["そうです。", "そうですか。", "そうですね。", "なんですか。"], "そうです。", "そうです confirms information already proposed by the other speaker.", "そうです。", [["そうです", "that’s right"]]),
      practiceChoice("sou-agree", "Your classmate says the lesson is interesting, and you agree.", "Which response invites shared agreement?", ["そうですね。", "そうですか。", "いいえ。", "なんですか。"], "そうですね。", "そうですね can agree with or reflect on what was just said.", "そうですね。", [["そう", "so / that way"], ["です", "is"], ["ね", "isn’t it? · shared agreement"]]),
      practiceChoice("title-professor", "You address Professor Mori directly.", "Which form is natural?", ["もりせんせい", "もりさんせんせい", "あなたせんせい", "わたしせんせい"], "もりせんせい", "A professional title can follow the name directly and replaces さん.", "もりせんせい。", [["もり", "Mori"], ["せんせい", "teacher / professor · respectful title"]]),
      practiceChoice("own-name", "You introduce yourself as Aoi Tanaka.", "Which name form is natural?", ["たなか あおいです。", "たなかさん あおいです。", "あおいせんせいです。", "あなたは あおいです。"], "たなか あおいです。", "Do not normally attach さん to your own name; Japanese names commonly put the family name first.", "たなか、あおいです。", [["たなか", "Tanaka · family name"], ["あおい", "Aoi · given name"], ["です", "am"]]),
      practiceChoice("nan-before-desu", "Complete: せんこうは ___ ですか。", "Which reading of 何 belongs before です?", ["なん", "なに", "だれ", "なんさい"], "せんこうは なんですか。", "なん is the reliable form before です; なに occurs in many other environments.", "せんこうは、なんですか。", [["なん", "what · before です"], ["ですか", "is it? · polite question"]]),
      practiceTiles("address-aoi", "Ask Aoi whether she is a student.", "Use her name rather than unnecessary あなた.", ["あおいさんは", "がくせい", "です", "か。"], ["あなたさんは", "わたしは", "の", "ね。"], "あおいさんは がくせいですか。", "The listener’s name and title naturally identify who the question concerns.", "あおいさんは、がくせいですか。", [["あおいさん", "Aoi · respectful さん"], ["は", "topic marker"], ["がくせい", "student"], ["ですか", "are you?"]])
    ],
    nounConnections: [
      practiceChoice("main-phone", "たけしさんの でんわばんごう", "What is the main idea?", ["A telephone number", "Takeshi", "A telephone", "A student"], "Takeshi’s telephone number", "The final noun でんわばんごう is the main idea; Takeshi specifies whose number.", "たけしさんの、でんわばんごう。", [["たけしさん", "Takeshi"], ["の", "Takeshi’s"], ["でんわばんごう", "telephone number · main noun"]]),
      practiceTiles("japanese-teacher", "Build: “a Japanese-language teacher”", "Put the field before の.", ["にほんご", "の", "せんせい"], ["は", "がくせい", "です。", "なん"], "にほんごの せんせい", "The field specifies the kind of teacher.", "にほんごの、せんせい。", [["にほんご", "Japanese language"], ["の", "of / specialising in"], ["せんせい", "teacher"]]),
      practiceTiles("mari-friend", "Build: “Mari’s friend”", "Connect the owner and main noun.", ["まりさん", "の", "ともだち"], ["は", "せんせい", "か。", "なん"], "まりさんの ともだち", "The person before の identifies whose friend is meant.", "まりさんの、ともだち。", [["まりさん", "Mari"], ["の", "Mari’s"], ["ともだち", "friend"]]),
      practiceChoice("main-university", "にほんの だいがく", "What kind of thing is the complete phrase?", ["A university", "Japan", "A Japanese person", "A university student"], "a university in Japan", "The final noun だいがく is the main idea; にほん specifies its location or association.", "にほんの、だいがく。", [["にほん", "Japan"], ["の", "in / associated with"], ["だいがく", "university · main noun"]]),
      practiceTiles("school-student", "Build: “a student at Seoul University”", "Create the affiliation phrase.", ["ソウルだいがく", "の", "がくせい"], ["せんせい", "は", "なん", "です。"], "ソウルだいがくの がくせい", "The institution comes before の; the student remains the main idea.", "ソウルだいがくの、がくせい。", [["ソウルだいがく", "Seoul University"], ["の", "at / affiliated with"], ["がくせい", "student"]]),
      practiceChoice("read-major", "けんさんの せんこう", "Choose the natural meaning.", ["Ken’s major", "a major named Ken", "Ken’s teacher", "a Japanese major"], "Ken’s major", "A person before の commonly marks possession or association.", "けんさんの、せんこう。", [["けんさん", "Ken"], ["の", "Ken’s"], ["せんこう", "major"]])
    ],
    family: [
      practiceChoice("older-sister", "みかさんの おねえさん", "Who is this?", ["Mika’s older sister", "Mika’s younger sister", "Mika’s mother", "Mika’s friend"], "Mika’s older sister", "おねえさん identifies an older sister; の tells you whose.", "みかさんの、おねえさん。", [["みかさんの", "Mika’s"], ["おねえさん", "older sister"]]),
      practiceChoice("younger-brother", "Which word means “younger brother”?", "Choose the family word.", ["おとうと", "おにいさん", "いもうと", "おとうさん"], "おとうと", "おとうと means younger brother; おにいさん means older brother.", "おとうと。", [["おとうと", "younger brother"]]),
      practiceTiles("father-doctor", "Build: “Aoi’s father is a doctor.”", "Make the family phrase the topic.", ["あおいさんの", "おとうさんは", "いしゃ", "です。"], ["おかあさんは", "かんごし", "なんさい", "か。"], "あおいさんの おとうさんは いしゃです。", "Aoi’s father is the full topic; doctor supplies the occupation.", "あおいさんの、おとうさんは、いしゃです。", [["あおいさんの", "Aoi’s"], ["おとうさん", "father"], ["いしゃ", "doctor"]]),
      practiceChoice("listen-sister", "What did Ren say about his younger sister?", "Listen and choose both details.", ["She is a high-school student", "She is a nurse", "She is a graduate student", "She is an office worker"], "いもうと · こうこうせい", "The topic is Ren’s younger sister; こうこうせい gives her school identity.", "れんさんの、いもうとは、こうこうせいです。", [["いもうと", "younger sister"], ["こうこうせい", "high-school student"]], true),
      practiceChoice("mother-age", "おかあさんは よんじゅうはっさいです。", "How old is the mother?", ["48", "45", "18", "Fourth year"], "48 years old", "よんじゅうはっさい is 48 years old; はち changes to はっ before さい.", "おかあさんは、よんじゅうはっさいです。", [["よんじゅう", "forty"], ["はっさい", "eight years old · sound change"]]),
      practiceTiles("brother-student", "Build: “Ken’s older brother is a graduate student.”", "Construct the family description.", ["けんさんの", "おにいさんは", "だいがくいんせい", "です。"], ["おとうとは", "だいがくせい", "なん", "か。"], "けんさんの おにいさんは だいがくいんせいです。", "The family noun phrase becomes the topic before the school identity.", "けんさんの、おにいさんは、だいがくいんせいです。", [["けんさんの", "Ken’s"], ["おにいさん", "older brother"], ["だいがくいんせい", "graduate student"]])
    ],
    ageYear: [
      practiceInput("age-18-listen", "How old is the person?", "Listen and enter digits only.", ["18"], "18 years old · じゅうはっさい", "Eight changes to はっ before the age counter さい.", "じゅうはっさいです。", "Enter a number", "numeric", [["じゅう", "ten"], ["はっさい", "eight years old · sound change"]]),
      practiceInput("age-21-listen", "Enter the age you hear.", "Type digits only.", ["21"], "21 years old · にじゅういっさい", "One changes to いっ before さい.", "にじゅういっさいです。", "Enter a number", "numeric", [["にじゅう", "twenty"], ["いっさい", "one year old · sound change"]]),
      practiceChoice("year-two", "The answer is にねんせいです。", "Which English meaning fits?", ["Second-year student", "Two years old", "Two o’clock", "Second major"], "second-year student", "ねんせい counts school years, not age or time.", "にねんせいです。", [["に", "two"], ["ねんせい", "year student"]]),
      practiceChoice("age-20", "Which complete answer means “I am 20 years old”?", "Choose the special form.", ["はたちです。", "にじゅうさいです。", "にじゅうねんせいです。", "はちじです。"], "はたちです。", "Age 20 uses the special word はたち.", "はたちです。", [["はたち", "20 years old · special word"], ["です", "am"]]),
      practiceTiles("age-question", "Ask Mei how old she is.", "Build the question using her name.", ["めいさんは", "なんさい", "です", "か。"], ["なんねんせい", "なんじ", "はたち", "ね。"], "めいさんは なんさいですか。", "なんさい asks a person’s age; the name plus は makes Mei the topic.", "めいさんは、なんさいですか。", [["めいさん", "Mei"], ["は", "topic marker · pronounced wa"], ["なんさい", "how old · what age"], ["ですか", "are you? · polite question"]]),
      practiceTiles("year-question", "Ask Mei which school year she is in.", "Build the question using her name.", ["めいさんは", "なんねんせい", "です", "か。"], ["なんさい", "なんじ", "はたち", "ね。"], "めいさんは なんねんせいですか。", "なんねんせい asks which year at school.", "めいさんは、なんねんせいですか。", [["めいさん", "Mei"], ["なんねんせい", "what school year"], ["ですか", "are you?"]]),
      practiceChoice("year-six", "ろくねんせいです。", "What information is being given?", ["The person is a sixth-year student", "The person is six years old", "It is six o’clock", "The number is six"], "sixth-year student", "ろくねんせい is a school-year identity.", "ろくねんせいです。", [["ろく", "six"], ["ねんせい", "year student"]])
    ],
    phone: [
      practiceInput("phone-4159", "Enter the telephone digits.", "Listen and type four digits.", ["4159"], "4159", "Telephone numbers are decoded one digit at a time.", "よん、いち、ご、きゅう", "XXXX", "numeric", [["よん", "4"], ["いち", "1"], ["ご", "5"], ["きゅう", "9"]]),
      practiceInput("phone-2839547", "Enter the complete telephone number.", "Hyphens are optional.", ["2839547", "283-9547"], "283-9547", "Each digit is independent; なな and きゅう remain easy to distinguish.", "に、はち、さん、きゅう、ご、よん、なな", "XXX-XXXX", "tel", [["に", "2"], ["はち", "8"], ["さん", "3"], ["きゅう", "9"], ["ご", "5"], ["よん", "4"], ["なな", "7"]]),
      practiceTiles("confirm-4159", "Confirm: “4159, right?”", "Build the short confirmation.", ["4159", "です", "ね。"], ["か。", "なんばん", "の", "いいえ"], "4159ですね。", "ね invites the other person to confirm what you heard.", "よん、いち、ご、きゅう、ですね。", [["4159", "digits heard"], ["です", "is"], ["ね", "right? · confirmation"]]),
      practiceChoice("confirm-reply", "Someone repeats your number correctly with ですね。", "How do you confirm it?", ["はい、そうです。", "そうですか。", "いいえ、なんさいです。", "なんばんですか。"], "はい、そうです。", "はい、そうです confirms that the repeated number is correct.", "はい、そうです。", [["はい", "yes"], ["そうです", "that’s right"]]),
      practiceChoice("phone-question", "Which question asks for a telephone number?", "Choose the complete question.", ["でんわばんごうは なんばんですか。", "でんわばんごうは なんじですか。", "なんさいですか。", "せんこうは なんですか。"], "でんわばんごうは なんばんですか。", "The topic says telephone number and なんばん asks which number.", "でんわばんごうは、なんばんですか。", [["でんわばんごう", "telephone number"], ["なんばん", "what number"], ["ですか", "is it?"]]),
      practiceInput("phone-6072", "What number did you hear?", "Type the four digits.", ["6072"], "6072", "Zero may be pronounced ゼロ; the other digits retain their ordinary telephone readings.", "ろく、ゼロ、なな、に", "XXXX", "numeric", [["ろく", "6"], ["ゼロ", "0"], ["なな", "7"], ["に", "2"]])
    ],
    time: [
      practiceInput("time-730", "What time did you hear?", "Enter digits with a colon.", ["7:30", "07:30"], "7:30 a.m. · ごぜん しちじはん", "ごぜん marks a.m.; しちじ is seven o’clock and はん adds half past.", "ごぜん、しちじはんです。", "HH:MM", "text", [["ごぜん", "a.m."], ["しちじ", "seven o’clock"], ["はん", "half past"]]),
      practiceInput("time-400", "Enter the time you hear.", "Use digits and a colon.", ["4:00", "04:00", "4"], "4:00 · よじ", "Four o’clock uses the special reading よじ.", "よじです。", "HH:MM", "text", [["よじ", "four o’clock · special reading"]]),
      practiceChoice("time-nine", "The clock shows 9:00.", "Which answer is standard?", ["くじです。", "きゅうじです。", "くさいです。", "きゅうねんせいです。"], "くじです。", "Nine o’clock uses くじ rather than きゅうじ.", "くじです。", [["くじ", "nine o’clock"], ["です", "is"]]),
      practiceTiles("time-london", "Ask: “What time is it now in London?”", "Build the city-time question.", ["ロンドンは", "いま", "なんじ", "です", "か。"], ["なんさい", "なんばん", "ごご", "ね。"], "ロンドンは いま なんじですか。", "The city becomes the topic; いま なんじ asks the current time.", "ロンドンは、いま、なんじですか。", [["ロンドン", "London"], ["は", "topic marker"], ["いま", "now"], ["なんじ", "what time"], ["ですか", "is it?"]]),
      practiceChoice("time-pm", "It is 6:00 p.m. in London.", "Choose the complete answer.", ["ごご ろくじです。", "ごぜん ろくじです。", "ろくねんせいです。", "ごご ろくさいです。"], "ごご ろくじです。", "ごご marks p.m.; ろくじ is six o’clock.", "ごご、ろくじです。", [["ごご", "p.m."], ["ろくじ", "six o’clock"]]),
      practiceChoice("time-noon", "The clock shows 12:30.", "Which answer fits?", ["じゅうにじはんです。", "にじゅうはんです。", "じゅうにさいです。", "じゅうにねんせいです。"], "じゅうにじはんです。", "じゅうにじ is twelve o’clock and はん adds half past.", "じゅうにじはんです。", [["じゅうにじ", "twelve o’clock"], ["はん", "half past"]])
    ],
    integrated: [
      practiceChoice("meet-response", "Ren says: はじめまして。れんです。", "Choose a natural response.", ["はじめまして。あおいです。よろしくおねがいします。", "ごちそうさまでした。", "なんじですか。", "ただいま。"], "はじめまして。あおいです。よろしくおねがいします。", "Mirror the first-meeting opener, give your identity, and close courteously.", "はじめまして。あおいです。よろしくおねがいします。", [["はじめまして", "nice to meet you"], ["あおいです", "I’m Aoi"], ["よろしくおねがいします", "courteous close"]]),
      practiceChoice("listen-profile", "What did Sora tell you?", "Listen and choose the complete profile.", ["Sora is a Korean third-year economics major", "Sora is a Japanese economics teacher", "Sora is a second-year biology major", "Sora is a Korean nurse"], "Korean · third year · economics", "The three short sentences continue describing the same person.", "かんこくじんです。さんねんせいです。せんこうは、けいざいです。", [["かんこくじん", "Korean person"], ["さんねんせい", "third-year student"], ["けいざい", "economics"]], true),
      practiceTiles("mission-major", "Ask Kai what his major is.", "Use his name and build the question.", ["かいさんの", "せんこうは", "なん", "です", "か。"], ["なんさい", "なんじ", "がくせい", "ね。"], "かいさんの せんこうは なんですか。", "The name identifies whose major; なん marks the unknown information.", "かいさんの、せんこうは、なんですか。", [["かいさんの", "Kai’s"], ["せんこう", "major"], ["なん", "what"], ["ですか", "is it?"]]),
      practiceChoice("mission-acknowledge", "Kai says his major is engineering.", "How do you naturally acknowledge the new information?", ["そうですか。", "そうです。", "いいえ、こうがくです。", "なんさいですか。"], "そうですか。", "そうですか receives new information as “I see.”", "そうですか。", [["そうですか", "I see / is that so?"]]),
      practiceInput("mission-phone", "A new classmate gives a telephone number.", "Listen and type the four digits.", ["7315"], "7315", "Decode the number one digit at a time rather than memorising an earlier recording.", "なな、さん、いち、ご", "XXXX", "numeric", [["なな", "7"], ["さん", "3"], ["いち", "1"], ["ご", "5"]]),
      practiceTiles("mission-close", "Thank the classmate and close warmly.", "Build a natural short ending after exchanging details.", ["ありがとうございます。", "よろしくおねがいします。"], ["なんさいですか。", "いいえ。", "いただきます。", "ただいま。"], "ありがとうございます。よろしくおねがいします。", "Thanks acknowledges the help or information; よろしく preserves goodwill for the new relationship.", "ありがとうございます。よろしくおねがいします。", [["ありがとうございます", "thank you · polite"], ["よろしくおねがいします", "please treat me kindly"]])
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
    [["open-situation"], ["opener-new", "purpose-yoroshiku"]],
    [["open-listen"], ["listen-name", "purpose-yoroshiku"]],
    [["open-build"], ["intro-aki", "intro-kana"]],
    [["open-response"], ["reply-yuna"]],
    [["identity-meaning", "identity-build", "identity-other"], ["identity-sora", "plural-context"]],
    [["identity-omit"], ["omit-topic"]],
    [["intro-listen"], ["listen-kai"]],
    [["intro-build"], ["intro-yuna", "intro-mei"]],
    [["identity-flex"], ["plural-context"]],
    [["people-nationality", "people-transfer"], ["nationality-korea"]],
    [["people-work", "people-build"], ["listen-lawyer", "office-worker"]],
    [["people-major"], ["major-history", "engineer-major"]],
    [["people-school"], ["school-graduate"]],
    [["ask-yes-no"], ["answer-negative", "answer-positive"]],
    [["ask-major"], ["ask-major-alt"]],
    [["ask-year"], ["question-from-year"]],
    [["ask-listen-age"], ["question-from-age"]],
    [["ask-phone-kind"], ["phone-question"]],
    [["natural-san", "natural-order"], ["own-name"]],
    [["natural-address"], ["address-aoi"]],
    [["natural-anou"], ["anou-interrupt"]],
    [["natural-sou"], ["sou-confirm", "sou-agree"]],
    [["natural-nan-nani"], ["nan-before-desu"]],
    [["natural-sensei"], ["title-professor"]],
    [["connect-main", "connect-nested"], ["main-phone", "main-university"]],
    [["connect-build"], ["japanese-teacher", "school-student"]],
    [["connect-possess"], ["mari-friend", "read-major"]],
    [["connect-sentence"], ["school-student"]],
    [["connect-family"], ["older-sister", "younger-brother", "listen-sister"]],
    [["connect-family-build", "details-family-listen"], ["father-doctor", "mother-age", "brother-student"]],
    [["details-age", "details-age-listen", "mission-age"], ["age-18-listen", "age-21-listen", "age-20"]],
    [["details-year"], ["year-two", "year-question", "year-six"]],
    [["mission-ask"], ["age-question", "age-20"]],
    [["details-phone", "details-phone-long", "mission-phone"], ["phone-4159", "phone-2839547", "phone-6072"]],
    [["details-confirm", "mission-confirm"], ["confirm-4159", "confirm-reply"]],
    [["details-time", "details-time-listen"], ["time-730", "time-400", "time-nine", "time-noon"]],
    [["details-seven", "details-world-time"], ["time-nine", "time-london", "time-pm", "time-noon"]],
    [["mission-greet"], ["meet-response"]],
    [["mission-address"], ["mission-major"]],
    [["mission-understand"], ["listen-profile"]],
    [["mission-close"], ["mission-acknowledge", "mission-close"]]
  ].flatMap(([ids, keys]) => ids.map(id => [id, keys])));

  const ALL_ACTIVITIES = STAGES.flatMap((stage, stageIndex) => stage.activities.map((activity, activityIndex) => ({ ...activity, stageIndex, activityIndex })));
  const GRADED_ACTIVITIES = ALL_ACTIVITIES.filter(activity => activity.type !== "teach");

  function defaultState() {
    return {
      version: VERSION, unlockedStage: 0, currentStage: 0, total: 0, correct: 0, streak: 0, bestStreak: 0,
      activities: {}, recent: [], recentFamilies: [], variantHistory: {}, viewedGuides: [], profile: { name: "", home: "", role: "", field: "", year: "", age: "" }, savedAt: 0
    };
  }

  function loadState() {
    const fallback = defaultState();
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && saved.version === VERSION) return { ...fallback, ...saved, activities: { ...(saved.activities || {}) }, recentFamilies: [...(saved.recentFamilies || [])], variantHistory: { ...(saved.variantHistory || {}) }, profile: { ...fallback.profile, ...(saved.profile || {}) } };
    } catch (error) {
      console.warn("Could not load guided-lesson progress.", error);
    }
    return fallback;
  }

  let state = loadState();
  state.unlockedStage = clamp(Number(state.unlockedStage) || 0, 0, STAGES.length - 1);
  const savedUnlockedStage = state.unlockedStage;
  reconcileUnlockedStages();
  state.currentStage = clamp(Number(state.currentStage) || 0, 0, state.unlockedStage);
  if (state.unlockedStage !== savedUnlockedStage) {
    state.savedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  let mode = "learn";
  let currentActivity = null;
  let currentAnswered = false;
  let currentIsRecovery = false;
  let learnRecoveryQueue = [];
  let practiceRecoveryQueue = [];
  let stageCursor = null;
  let replayingStage = false;
  let tileSelection = [];
  let tileBank = [];
  let tileBankRevealed = true;
  let currentUsedSupport = false;
  let currentDistractorCount = 0;
  let checkpointQueue = [];
  let checkpointIndex = 0;
  let checkpointCorrect = 0;
  let checkpointResults = [];
  let practiceIndex = 0;
  let practiceResults = [];
  let practiceSessionComplete = false;
  let speechVoices = [];
  let emptyNextMode = null;

  function activityState(activity) {
    if (!state.activities[activity.id]) state.activities[activity.id] = {
      completed: false, seen: 0, correct: 0, wrong: 0, mastery: 0, interval: -1, lastSeen: 0, dueAt: 0, lastWasCorrect: null
    };
    return state.activities[activity.id];
  }

  function saveState() {
    reconcileUnlockedStages();
    state.savedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    renderTopStats();
    renderRoadmap();
  }

  function stageComplete(stageIndex) {
    return STAGES[stageIndex].activities.every(activity => activityState(activity).completed);
  }

  function retentionState(activity) {
    if (activity.type === "teach") return "covered";
    const progress = activityState(activity);
    if (!progress.completed) return "new";
    if (progress.lastWasCorrect && progress.correct >= 3 && progress.interval >= 2 && progress.mastery >= 60) return "secure";
    return "learning";
  }

  function stageRetention(stage) {
    const graded = stage.activities.filter(activity => activity.type !== "teach");
    const secure = graded.filter(activity => retentionState(activity) === "secure").length;
    return { secure, total: graded.length };
  }

  function reconcileUnlockedStages() {
    let earnedStage = 0;
    while (earnedStage < STAGES.length - 1 && stageComplete(earnedStage)) earnedStage++;
    state.unlockedStage = Math.max(state.unlockedStage, earnedStage);
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
    $("#lessonStageCount").textContent = `Stage ${state.currentStage + 1} of ${STAGES.length}`;
    $("#lessonRoadmap").innerHTML = STAGES.map((stage, index) => {
      const complete = stageComplete(index);
      const retention = stageRetention(stage);
      const secure = complete && retention.secure === retention.total;
      const locked = index > state.unlockedStage;
      const current = index === state.currentStage && mode === "learn";
      const status = locked ? "Locked" : secure ? "Secure" : complete ? `Covered · ${retention.secure}/${retention.total} secure` : current ? "Now" : "Open";
      return `<button class="lesson-roadmap-step ${complete ? "covered" : ""} ${secure ? "secure" : ""} ${current ? "active" : ""}" data-stage="${index}" type="button" ${locked ? "disabled" : ""}><span class="lesson-roadmap-number">${complete ? "✓" : index + 1}</span><span class="lesson-roadmap-copy"><strong>${stage.title}</strong><span>${stage.short}</span></span><span class="lesson-roadmap-status">${status}</span></button>`;
    }).join("");
    $("#lessonRoadmap").querySelectorAll("[data-stage]").forEach(button => button.addEventListener("click", () => {
      state.currentStage = Number(button.dataset.stage);
      replayingStage = stageComplete(state.currentStage);
      stageCursor = replayingStage ? 0 : firstIncompleteIndex(state.currentStage);
      saveState();
      setMode("learn");
    }));
  }

  function clearControls() {
    ["#lessonDontKnow", "#lessonClear", "#lessonSubmit", "#lessonNext"].forEach(selector => $(selector).classList.add("hidden"));
    $("#lessonTrainer").classList.remove("awaiting-answer", "summary-state");
    $("#lessonFeedback").className = "feedback lesson-feedback";
    $("#lessonFeedback").innerHTML = "";
    currentAnswered = false;
    tileSelection = [];
    tileBank = [];
    tileBankRevealed = true;
    currentUsedSupport = false;
  }

  function renderActivity(activity) {
    emptyNextMode = null;
    currentActivity = activity;
    currentIsRecovery = Boolean(activity.recoveryOf);
    clearControls();
    $("#lessonNext").innerHTML = `${mode === "practice" ? "Next review" : mode === "checkpoint" ? "Next question" : "Continue"} <kbd>Enter</kbd>`;
    const progress = activityState(activity);
    const stage = STAGES[activity.stageIndex];
    const stageCompleted = stage.activities.filter(item => activityState(item).completed).length;
    const stageProgress = mode === "learn"
      ? activity.activityIndex / stage.activities.length * 100
      : mode === "checkpoint" && checkpointQueue.length
        ? checkpointIndex / checkpointQueue.length * 100
        : mode === "practice"
          ? practiceIndex / PRACTICE_SESSION_LENGTH * 100
          : stageCompleted / stage.activities.length * 100;
    $("#lessonStageProgress").style.width = `${stageProgress}%`;
    const previousAttempts = `${progress.seen} previous ${progress.seen === 1 ? "attempt" : "attempts"}`;
    $("#lessonQuestionCount").textContent = currentIsRecovery ? "Delayed memory check" : mode === "checkpoint" ? `Question ${checkpointIndex + 1} of ${checkpointQueue.length}` : mode === "practice" ? `Review ${practiceIndex + 1} of ${PRACTICE_SESSION_LENGTH} · ${previousAttempts}` : `Activity ${activity.activityIndex + 1} of ${stage.activities.length}`;
    $("#lessonSessionTitle").textContent = stage.outcome;
    $("#lessonSessionCopy").textContent = activity.explanation || activity.instruction || "Retrieve the idea in a new form before moving on.";
    if (activity.type === "teach") renderTeach(activity);
    if (activity.type === "choice") renderChoice(activity);
    if (activity.type === "tiles") renderTiles(activity);
    if (activity.type === "input") renderInput(activity);
    $("#lessonTrainer").classList.toggle("awaiting-answer", ["choice", "tiles", "input"].includes(activity.type));
    refreshActivityAudioControls();
    if (activity.audioText && (activity.listenOnly || activity.type === "input")) setTimeout(() => speakJapanese(activity.audioText), 120);
  }

  function activityHeading(activity) {
    const stage = STAGES[activity.stageIndex];
    const origin = (mode !== "learn" || currentIsRecovery) && stage ? `<span class="lesson-activity-origin">Stage ${activity.stageIndex + 1} of ${STAGES.length} · ${escapeHtml(stage.title)} · ${escapeHtml(activity.skill)}</span>` : "";
    return `<div class="lesson-activity-heading"><span class="lesson-activity-kicker">${activity.kicker}</span>${origin}<h2>${activity.title}</h2>${activity.instruction ? `<p>${activity.instruction}</p>` : ""}</div>`;
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
      row.innerHTML = `<button class="lesson-guide-toggle" type="button" aria-expanded="false" aria-controls="${panelId}"><span class="lesson-guide-copy"><span>${escapeHtml(label)}</span><strong>${escapeHtml(example)}</strong></span><span class="lesson-guide-action">Breakdown <span class="lesson-guide-icon" aria-hidden="true"><svg viewBox="0 0 16 16" focusable="false"><path d="M3.5 6 8 10.5 12.5 6" /></svg></span></span></button><div class="lesson-guide-detail" id="${panelId}" hidden><div class="lesson-guide-meaning"><span>Natural meaning</span><strong>${escapeHtml(detail.meaning)}</strong></div><div class="lesson-breakdown-pieces">${detail.pieces.map(([piece, meaning]) => `<span class="lesson-breakdown-piece"><strong>${escapeHtml(piece)}</strong><small>${escapeHtml(meaning)}</small></span>`).join("")}</div><p><strong>Pattern:</strong> ${escapeHtml(detail.insight)}</p></div>`;
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

  function hasPromptAudio(activity) {
    return Boolean(activity.audioText && (activity.listenOnly || activity.type === "input"));
  }

  function promptMarkup(activity) {
    const context = activity.context ? `<div class="lesson-context">${escapeHtml(activity.context)}</div>` : "";
    const listening = hasPromptAudio(activity) ? `<div class="lesson-listen-controls"><button class="lesson-listen-button" type="button" data-listen aria-label="Replay question audio at normal speed" title="Replay question audio at normal speed">🔊<small>Normal</small></button><button class="ghost lesson-listen-slow" type="button" data-listen-slow>0.7× Slow</button></div>` : "";
    return `${context}<div class="lesson-prompt">${listening}<span class="lesson-prompt-label">Your task</span><div>${escapeHtml(activity.prompt || "Choose the best answer.")}</div></div>`;
  }

  function bindPromptAudio(activity) {
    $("#lessonActivity").querySelector("[data-listen]")?.addEventListener("click", () => speakJapanese(activity.audioText));
    $("#lessonActivity").querySelector("[data-listen-slow]")?.addEventListener("click", () => speakJapanese(activity.audioText, .68));
  }

  function renderChoice(activity) {
    const displayedOptions = shuffle(activity.options.map((option, originalIndex) => ({ option, originalIndex })));
    $("#lessonActivity").innerHTML = activityHeading(activity) + promptMarkup(activity) + `<div class="lesson-choice-grid">${displayedOptions.map(({ option, originalIndex }, displayIndex) => `<button class="lesson-choice" data-choice="${originalIndex}" data-key="${displayIndex + 1}" type="button"><span class="lesson-choice-number">${displayIndex + 1}</span><span>${escapeHtml(option)}</span></button>`).join("")}</div>`;
    bindPromptAudio(activity);
    $("#lessonActivity").querySelectorAll("[data-choice]").forEach(button => button.addEventListener("click", () => gradeAnswer(Number(button.dataset.choice) === activity.answer, Number(button.dataset.choice))));
    $("#lessonDontKnow").classList.remove("hidden");
    $("#lessonKeyboardHint").textContent = hasPromptAudio(activity) ? "Keyboard: 1–4 choose an answer. Replay the question as needed." : "Keyboard: 1–4 choose an answer. Pronunciation appears after you answer.";
  }

  function renderTiles(activity) {
    const availableDistractors = shuffle(activity.distractors || []);
    const requestedCount = mode === "checkpoint" ? 4 : mode === "practice" ? 3 : activity.learnExtras || 0;
    const distractors = availableDistractors.slice(0, requestedCount);
    currentDistractorCount = distractors.length;
    const answerTiles = activity.tokens.map((text, index) => ({ id: `${activity.id}-answer-${index}`, text }));
    const extraTiles = distractors.map((text, index) => ({ id: `${activity.id}-extra-${index}`, text }));
    tileBank = shuffle([...answerTiles, ...extraTiles]);
    const answerPositions = answerTiles.map(tile => tileBank.findIndex(candidate => candidate.id === tile.id));
    const answersRemainOrdered = answerPositions.every((position, index) => index === 0 || answerPositions[index - 1] < position);
    if (answersRemainOrdered && answerTiles.length > 1) {
      const firstPosition = answerPositions[0];
      const secondPosition = answerPositions[1];
      [tileBank[firstPosition], tileBank[secondPosition]] = [tileBank[secondPosition], tileBank[firstPosition]];
    }
    tileBankRevealed = mode === "learn";
    currentUsedSupport = tileBankRevealed;
    const extraNote = currentDistractorCount ? `<div class="lesson-tile-note"><strong>Choose only what you need.</strong> Some tiles are extras.</div>` : "";
    const oralRecall = mode === "learn" ? "" : `<div class="lesson-independent-recall" id="lessonIndependentRecall"><span>Say it first</span><p>Say the complete Japanese answer aloud. No Japanese keyboard is needed.</p><div class="actions"><button class="big-button" type="button" data-spoken-recall>I said it — verify</button><button class="ghost" type="button" data-show-word-bank>I need the tiles</button></div><small>${mode === "checkpoint" ? "The checkpoint counts “I need the tiles” as assisted recall." : "Either choice opens the same scrambled verification tiles."}</small></div>`;
    $("#lessonActivity").innerHTML = activityHeading(activity) + promptMarkup(activity) + oralRecall + `<div class="lesson-tiles ${tileBankRevealed ? "" : "hidden"}" id="lessonTileBuilder">${extraNote}<div class="lesson-tile-answer" id="lessonTileAnswer"></div><div class="lesson-tile-bank" id="lessonTileBank"></div></div>`;
    if (tileBankRevealed) renderTileControls();
    $("#lessonActivity").querySelector("[data-spoken-recall]")?.addEventListener("click", () => revealTileBank(false));
    $("#lessonActivity").querySelector("[data-show-word-bank]")?.addEventListener("click", () => revealTileBank(true));
    if (tileBankRevealed) {
      $("#lessonClear").classList.remove("hidden");
      $("#lessonSubmit").classList.remove("hidden");
      $("#lessonDontKnow").classList.remove("hidden");
    }
    $("#lessonKeyboardHint").textContent = mode === "checkpoint" ? "Say the answer aloud, then verify it with scrambled tiles." : mode === "practice" ? "Speaking first strengthens recall; tiles verify the sentence without Japanese typing." : currentDistractorCount ? "Build from meaning. Extra tiles can remain in the bank." : "Build from meaning. Click an answer tile to return it to the bank.";
  }

  function revealTileBank(usedSupport) {
    tileBankRevealed = true;
    currentUsedSupport = usedSupport;
    $("#lessonIndependentRecall")?.classList.add("hidden");
    $("#lessonTileBuilder")?.classList.remove("hidden");
    renderTileControls();
    $("#lessonClear").classList.remove("hidden");
    $("#lessonSubmit").classList.remove("hidden");
    $("#lessonDontKnow").classList.remove("hidden");
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
    bindPromptAudio(activity);
    $("#lessonSubmit").classList.remove("hidden");
    $("#lessonDontKnow").classList.remove("hidden");
    $("#lessonKeyboardHint").textContent = "Type what you heard. Press Enter to check.";
    setTimeout(() => $("#lessonAnswerInput")?.focus(), 0);
  }

  function selectedAnswerText(selectedChoice) {
    if (currentActivity?.type !== "choice" || selectedChoice === null || selectedChoice === undefined) return "";
    return currentActivity.options?.[selectedChoice] || "";
  }

  function mistakeExplanation(selectedChoice, revealed) {
    if (revealed) return "You revealed the answer. Read the contrast once; the concept will return after other material.";
    if (selectedChoice === null || selectedChoice === undefined) return "Your response did not match the model. Compare the order and meaning with the answer below.";
    const selected = selectedAnswerText(selectedChoice);
    const targeted = currentActivity.mistakes?.[selectedChoice];
    return targeted || COMMON_MISTAKE_GUIDANCE[selected] || `You chose “${selected}”. Compare its meaning or conversational job with the correct answer below.`;
  }

  function showFeedback(correct, selectedChoice = null, corrected = false, revealed = false) {
    const feedback = $("#lessonFeedback");
    feedback.className = `feedback lesson-feedback show ${correct ? "good" : "bad"}`;
    const breakdown = currentActivity.breakdown || ANSWER_BREAKDOWNS[currentActivity.id] || [];
    const breakdownMarkup = breakdown.length ? `<div class="lesson-answer-breakdown"><span class="lesson-breakdown-label">Answer breakdown</span><div class="lesson-breakdown-pieces">${breakdown.map(([piece, meaning]) => `<span class="lesson-breakdown-piece"><strong>${escapeHtml(piece)}</strong><small>${escapeHtml(meaning)}</small></span>`).join("")}</div></div>` : "";
    const answerAudio = currentActivity.audioText && !hasPromptAudio(currentActivity) ? `<button class="ghost lesson-answer-audio" type="button" data-answer-audio>🔊 Hear answer</button>` : "";
    const diagnosis = correct ? "" : `<span class="lesson-mistake-diagnosis">${escapeHtml(mistakeExplanation(selectedChoice, revealed))}</span>`;
    const heading = corrected ? "Recovered after a delay" : correct ? "Correct" : "Build this memory";
    feedback.innerHTML = `<strong>${heading}</strong><div class="meta">${diagnosis}<span class="lesson-correction">${escapeHtml(currentActivity.correction || "Review the model")}</span>${breakdownMarkup}<span class="lesson-feedback-explanation">${escapeHtml(currentActivity.explanation || "Retrieve the idea again after some variety.")}</span>${answerAudio}</div>`;
    feedback.querySelector("[data-answer-audio]")?.addEventListener("click", () => speakJapanese(currentActivity.audioText));
    refreshActivityAudioControls();
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
      const gain = activity.type === "choice" ? 15 : activity.type === "tiles" ? currentUsedSupport ? 20 : 32 : 22;
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
    if (activity.practiceFamily) {
      state.recentFamilies.push(activity.practiceFamily);
      if (state.recentFamilies.length > 12) state.recentFamilies.shift();
      if (activity.variantKey) {
        const history = state.variantHistory[activity.practiceFamily] || [];
        history.push(activity.variantKey);
        state.variantHistory[activity.practiceFamily] = history.slice(-4);
      }
    }
    saveState();
  }

  function sourceActivityFor(activity) {
    const sourceId = activity.recoveryOf || activity.id;
    return ALL_ACTIVITIES.find(candidate => candidate.id === sourceId) || activity;
  }

  function scheduleDelayedRecovery(activity) {
    if (mode === "checkpoint") return;
    const source = sourceActivityFor(activity);
    if (mode === "learn") {
      if (!learnRecoveryQueue.some(entry => entry.source.id === source.id)) learnRecoveryQueue.push({ source, remaining: 3, avoidVariantKey: activity.variantKey || "" });
      return;
    }
    if (mode === "practice" && !currentIsRecovery) {
      const dueIndex = Math.min(PRACTICE_SESSION_LENGTH - 1, practiceIndex + 3);
      if (!practiceRecoveryQueue.some(entry => entry.source.id === source.id)) practiceRecoveryQueue.push({ source, dueIndex, avoidVariantKey: activity.variantKey || "" });
    }
  }

  function gradeAnswer(correct, selectedChoice = null, revealed = false) {
    if (!currentActivity || currentAnswered || currentActivity.type === "teach") return;
    currentAnswered = true;
    $("#lessonTrainer").classList.remove("awaiting-answer");
    if (currentActivity.type === "choice") {
      $("#lessonActivity").querySelectorAll("[data-choice]").forEach(button => {
        button.disabled = true;
        const index = Number(button.dataset.choice);
        if (index === currentActivity.answer) button.classList.add("correct");
        else if (index === selectedChoice) button.classList.add("wrong");
      });
    }
    updateResult(currentActivity, correct);
    const scoredCorrect = correct && !(currentActivity.type === "tiles" && currentUsedSupport && mode !== "learn");
    const conceptId = currentActivity.recoveryOf || currentActivity.id;
    if (mode === "practice") {
      practiceResults.push({ correct: scoredCorrect, answeredCorrect: correct, assisted: currentActivity.type === "tiles" && currentUsedSupport, skill: currentActivity.skill, independent: currentActivity.type === "tiles" && !currentUsedSupport, recovery: currentIsRecovery, conceptId });
    }
    if (mode === "checkpoint") checkpointResults.push({ correct: scoredCorrect, skill: currentActivity.skill });
    if (!correct) scheduleDelayedRecovery(currentActivity);
    showFeedback(correct, selectedChoice, currentIsRecovery && correct, revealed);
    ["#lessonDontKnow", "#lessonClear", "#lessonSubmit"].forEach(selector => $(selector).classList.add("hidden"));
    $("#lessonNext").classList.remove("hidden");
    if (correct && currentIsRecovery) $("#lessonKeyboardHint").textContent = "Recovered after other material. That is stronger evidence than an immediate repeat.";
    else if (!correct && mode === "checkpoint") $("#lessonKeyboardHint").textContent = "The checkpoint keeps your first attempt and sends this idea to later Practice.";
    else if (!correct) $("#lessonKeyboardHint").textContent = "Continue now. This concept will return after other material in a changed example.";
    if (mode === "checkpoint" && scoredCorrect) checkpointCorrect++;
    if (currentActivity.audioText && correct) speakJapanese(currentActivity.audioText);
  }

  function submitCurrent() {
    if (!currentActivity || currentAnswered) return;
    if (currentActivity.type === "tiles") {
      if (!tileBankRevealed) return;
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
    $("#lessonTrainer").classList.add("summary-state");
    currentActivity = null;
    const stage = STAGES[stageIndex];
    const graded = stage.activities.filter(activity => activity.type !== "teach");
    const retention = stageRetention(stage);
    const wrapup = STAGE_WRAPUPS[stageIndex];
    const average = Math.round(masteryAverage(graded));
    const correct = graded.reduce((sum, activity) => sum + activityState(activity).correct, 0);
    const attempts = graded.reduce((sum, activity) => sum + activityState(activity).seen, 0);
    $("#lessonStageProgress").style.width = "100%";
    $("#lessonQuestionCount").textContent = "Stage covered";
    const modelTurns = wrapup?.turns.map(([speaker, text]) => {
      const personalized = text.replace("［your name］", `［${state.profile.name || "your name"}］`);
      return `<div class="lesson-stage-turn"><span>${escapeHtml(speaker)}</span><strong>${escapeHtml(personalized)}</strong></div>`;
    }).join("") || "";
    const milestone = wrapup?.coreMilestone ? `<div class="lesson-core-milestone"><strong>Core conversation ready</strong><span>You can now greet, introduce yourself, ask a personal question, and acknowledge the answer. The remaining stages expand your range.</span></div>` : "";
    const challenge = wrapup ? `<div class="lesson-stage-challenge"><span>Conversation check</span><p>${escapeHtml(wrapup.challenge)}</p><small>Say your response aloud before revealing the model.</small><button class="ghost" type="button" data-reveal-stage-model>Reveal model</button><div class="lesson-stage-model" hidden>${modelTurns}</div></div>` : "";
    $("#lessonActivity").innerHTML = `<div class="lesson-stage-summary"><div class="lesson-stage-summary-icon">✓</div><span class="lesson-activity-kicker">Stage covered</span><h2>${stage.title}</h2><p>${stage.outcome} Coverage opens the next stage; durable recall continues through Practice.</p>${milestone}<div class="lesson-stage-summary-stats"><div class="mini"><strong>${average}%</strong><span class="tiny">current mastery</span></div><div class="mini"><strong>${attempts ? Math.round(correct / attempts * 100) : 0}%</strong><span class="tiny">first-pass accuracy</span></div><div class="mini"><strong>${retention.secure}/${retention.total}</strong><span class="tiny">secure after delay</span></div></div>${challenge}</div>`;
    $("#lessonActivity").querySelector("[data-reveal-stage-model]")?.addEventListener("click", event => {
      const model = $("#lessonActivity").querySelector(".lesson-stage-model");
      if (!model) return;
      model.hidden = false;
      event.currentTarget.classList.add("hidden");
    });
    $("#lessonNext").textContent = stageIndex < STAGES.length - 1 ? "Open next stage" : "View lesson progress";
    $("#lessonNext").classList.remove("hidden");
    $("#lessonSessionTitle").textContent = wrapup?.coreMilestone ? "Your core conversation is ready" : "Turn this stage into conversation";
    $("#lessonSessionCopy").textContent = "Produce the conversation check before revealing its model. Practice will return weak ideas in new combinations after a delay.";
    $("#lessonKeyboardHint").textContent = "Coverage opens the next conversational job; secure status requires successful delayed recall.";
  }

  function advanceLearn() {
    const stage = STAGES[state.currentStage];
    if (currentIsRecovery) {
      currentIsRecovery = false;
      renderLearn();
      return;
    }
    if (stageCursor >= stage.activities.length) {
      if (state.currentStage < STAGES.length - 1) {
        state.unlockedStage = Math.max(state.unlockedStage, state.currentStage + 1);
        state.currentStage++;
        replayingStage = false;
        stageCursor = firstIncompleteIndex(state.currentStage);
        saveState();
        renderLearn();
      } else setMode("progress");
      return;
    }
    if (currentActivity?.type === "teach") completeTeaching();
    if (replayingStage) stageCursor++;
    else {
      const nextIncomplete = stage.activities.findIndex((activity, index) => index > stageCursor && !activityState(activity).completed);
      stageCursor = nextIncomplete < 0 ? stage.activities.length : nextIncomplete;
    }
    learnRecoveryQueue.forEach(entry => entry.remaining--);
    const dueIndex = learnRecoveryQueue.findIndex(entry => entry.remaining <= 0);
    if (dueIndex >= 0) {
      const [entry] = learnRecoveryQueue.splice(dueIndex, 1);
      renderActivity(buildRecoveryActivity(entry.source, "learn", entry.avoidVariantKey));
      return;
    }
    renderLearn();
  }

  function practiceFamily(activity) {
    return PRACTICE_FAMILY_BY_ID[activity.id] || activity.id;
  }

  function buildPracticeVariant(activity, sourceMode = "practice", excludedVariantKey = "") {
    const family = practiceFamily(activity);
    const familyVariants = PRACTICE_FAMILIES[family] || [];
    const allowedKeys = PRACTICE_VARIANT_KEYS_BY_ID[activity.id];
    const variants = allowedKeys ? familyVariants.filter(variant => allowedKeys.includes(variant.key)) : familyVariants;
    if (!variants.length) return activity;
    const recentVariants = new Set((state.variantHistory[family] || []).slice(-3));
    const available = variants.filter(variant => !recentVariants.has(variant.key) && variant.key !== excludedVariantKey);
    const changedFallback = variants.filter(variant => variant.key !== excludedVariantKey);
    const variant = shuffle(available.length ? available : changedFallback.length ? changedFallback : variants)[0];
    const skill = variant.listenOnly || variant.type === "input" ? "Listening" : variant.type === "tiles" ? "Production" : activity.skill;
    return {
      ...activity,
      ...variant,
      id: activity.id,
      stageIndex: activity.stageIndex,
      activityIndex: activity.activityIndex,
      practiceFamily: family,
      variantKey: variant.key,
      skill,
      kicker: sourceMode === "checkpoint" ? "Checkpoint · transfer" : sourceMode === "recovery" || sourceMode === "learn" ? "Memory check · changed example" : "Practice · new example"
    };
  }

  function buildRecoveryActivity(activity, sourceMode, excludedVariantKey = "") {
    const variant = buildPracticeVariant(activity, sourceMode === "learn" ? "learn" : "recovery", excludedVariantKey);
    const changed = variant !== activity && (!excludedVariantKey || variant.variantKey !== excludedVariantKey);
    return { ...variant, recoveryOf: activity.id, kicker: changed ? "Memory check · changed example" : "Memory check · delayed recall" };
  }

  function selectPracticeActivity() {
    const pool = completedGraded();
    if (!pool.length) return null;
    const recent = new Set(state.recent.slice(-4));
    const recentFamilies = new Set(state.recentFamilies.slice(-3));
    const filtered = pool.filter(activity => !recent.has(activity.id) && !recentFamilies.has(practiceFamily(activity)));
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
    const recoveryIndex = practiceRecoveryQueue.findIndex(entry => entry.dueIndex <= practiceIndex);
    if (recoveryIndex >= 0) {
      const [entry] = practiceRecoveryQueue.splice(recoveryIndex, 1);
      renderActivity(buildRecoveryActivity(entry.source, "practice", entry.avoidVariantKey));
      return;
    }
    const activity = selectPracticeActivity();
    if (!activity) {
      renderEmptyMode("Practice opens after your first retrieval activity", "Start the Learn journey so the app has something meaningful to adapt.", "Start learning");
      return;
    }
    renderActivity(buildPracticeVariant(activity));
  }

  function startPracticeSession() {
    practiceIndex = 0;
    practiceResults = [];
    practiceSessionComplete = false;
    practiceRecoveryQueue.forEach(entry => { entry.dueIndex = Math.min(entry.dueIndex, 2); });
    renderPractice();
  }

  function advancePractice() {
    if (practiceSessionComplete) {
      startPracticeSession();
      return;
    }
    practiceIndex++;
    if (practiceIndex >= PRACTICE_SESSION_LENGTH) {
      renderPracticeSummary();
      return;
    }
    renderPractice();
  }

  function renderPracticeSummary() {
    clearControls();
    $("#lessonTrainer").classList.add("summary-state");
    currentActivity = null;
    practiceSessionComplete = true;
    const originalResults = practiceResults.filter(result => !result.recovery);
    const recoveryResults = practiceResults.filter(result => result.recovery);
    const firstPassCorrect = originalResults.filter(result => result.correct).length;
    const firstPassTotal = originalResults.length;
    const recoveredConcepts = new Set(recoveryResults.filter(result => result.correct).map(result => result.conceptId));
    const missedConcepts = new Set(originalResults.filter(result => !result.correct).map(result => result.conceptId));
    const unresolved = [...missedConcepts].filter(conceptId => !recoveredConcepts.has(conceptId)).length;
    const recovered = [...recoveredConcepts].filter(conceptId => missedConcepts.has(conceptId)).length;
    const assisted = practiceResults.filter(result => result.assisted && result.answeredCorrect).length;
    const firstPass = firstPassTotal ? Math.round(firstPassCorrect / firstPassTotal * 100) : 0;
    $("#lessonStageProgress").style.width = "100%";
    $("#lessonQuestionCount").textContent = "Review session complete";
    $("#lessonActivity").innerHTML = `<div class="lesson-stage-summary"><span class="lesson-activity-kicker">Six focused reviews</span><div class="lesson-checkpoint-score">${firstPass}%</div><h2>${firstPass >= 85 ? "Strong first-pass recall" : firstPass >= 65 ? "Useful retrieval completed" : recovered ? "Some memories recovered" : "Useful practice completed"}</h2><p>${firstPassCorrect} of ${firstPassTotal} new review prompts were recalled before feedback or assistance. ${recovered ? recovered === 1 ? "One missed concept returned later and was recovered." : `${recovered} missed concepts returned later and were recovered.` : "Missed concepts were not repeated immediately."}${assisted ? ` ${assisted} ${assisted === 1 ? "answer used" : "answers used"} the tile hint.` : ""}</p><div class="lesson-stage-summary-stats"><div class="mini"><strong>${firstPassCorrect}/${firstPassTotal}</strong><span class="tiny">first-pass recall</span></div><div class="mini"><strong>${recovered}</strong><span class="tiny">recovered later</span></div><div class="mini"><strong>${unresolved}</strong><span class="tiny">still needs review</span></div></div></div>`;
    $("#lessonNext").textContent = "Start another 6-review session";
    $("#lessonNext").classList.remove("hidden");
    $("#lessonSessionTitle").textContent = "A useful stopping point";
    $("#lessonSessionCopy").textContent = "Six reviews are enough for one focused round. Stop here or begin another session if your attention still feels fresh.";
    $("#lessonKeyboardHint").textContent = "Short, repeated sessions usually beat one long review session.";
  }

  function startCheckpoint() {
    const pool = completedGraded();
    if (pool.length < 5) {
      renderEmptyMode("Checkpoint needs a little more material", "Complete at least five retrieval activities in Learn first.", "Continue learning");
      return;
    }
    const representatives = new Map();
    shuffle(pool).forEach(activity => {
      const family = practiceFamily(activity);
      if (!representatives.has(family)) representatives.set(family, activity);
    });
    checkpointQueue = shuffle([...representatives.values()]).slice(0, Math.min(10, representatives.size)).map(activity => buildPracticeVariant(activity, "checkpoint"));
    checkpointIndex = 0;
    checkpointCorrect = 0;
    checkpointResults = [];
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
    $("#lessonTrainer").classList.add("summary-state");
    currentActivity = null;
    const percent = Math.round(checkpointCorrect / checkpointQueue.length * 100);
    const checkpointSkills = [...new Set(checkpointResults.map(result => result.skill))].map(skill => {
      const results = checkpointResults.filter(result => result.skill === skill);
      const correct = results.filter(result => result.correct).length;
      const labels = {
        Conversation: "Choose natural conversational responses",
        Grammar: "Build the key sentence patterns",
        Listening: "Understand spoken Japanese details",
        Production: "Produce Japanese without a word bank",
        Details: "Exchange ages, numbers, and time",
        Vocabulary: "Recognise useful personal vocabulary"
      };
      return { skill, label: labels[skill] || skill, correct, total: results.length };
    });
    const outcomeMarkup = checkpointSkills.map(result => `<div class="lesson-checkpoint-outcome ${result.correct === result.total ? "ready" : "review"}"><span>${result.correct === result.total ? "✓" : "↻"}</span><div><strong>${escapeHtml(result.label)}</strong><small>${result.correct}/${result.total} first-pass correct · ${result.correct === result.total ? "ready" : "review recommended"}</small></div></div>`).join("");
    $("#lessonStageProgress").style.width = `${percent}%`;
    $("#lessonQuestionCount").textContent = "Checkpoint complete";
    $("#lessonActivity").innerHTML = `<div class="lesson-stage-summary"><span class="lesson-activity-kicker">Mixed retrieval</span><div class="lesson-checkpoint-score">${percent}%</div><h2>${percent >= 85 ? "Ready for conversation" : percent >= 65 ? "A solid foundation" : "Useful memories are forming"}</h2><p>${checkpointCorrect} of ${checkpointQueue.length} were correct before feedback. Every missed idea has been scheduled to return in Practice.</p><div class="lesson-checkpoint-outcomes">${outcomeMarkup}</div></div>`;
    $("#lessonNext").textContent = "Run another checkpoint";
    $("#lessonNext").classList.remove("hidden");
    $("#lessonSessionTitle").textContent = "Use the can-do results, not only the percentage";
    $("#lessonSessionCopy").textContent = "Ready outcomes transferred on the first attempt. Review outcomes were corrected and are already scheduled to return in Practice.";
    $("#lessonKeyboardHint").textContent = "A new checkpoint changes the question order and interleaves different skills.";
  }

  function renderEmptyMode(title, copy, buttonLabel) {
    emptyNextMode = "learn";
    clearControls();
    $("#lessonTrainer").classList.add("summary-state");
    currentActivity = null;
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
    $("#lessonWorkspace").classList.toggle("lesson-focused-workspace", mode === "practice" || mode === "checkpoint");
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
    if (mode === "practice") startPracticeSession();
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
    else if (mode === "practice") advancePractice();
    else if (mode === "checkpoint") {
      if (!checkpointQueue.length || checkpointIndex >= checkpointQueue.length) startCheckpoint();
      else advanceCheckpoint();
    } else setMode("learn");
  }

  function skillScores() {
    const skills = ["Conversation", "Grammar", "Listening", "Production", "Vocabulary", "Details"];
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

  function speakJapanese(text, rateOverride = null) {
    if (!text || !japaneseSpeechReady()) return false;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = rateOverride || Number(speechPreferences().rate) || .85;
    const voice = selectedJapaneseVoice();
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
    return true;
  }

  function refreshSpeechVoices() {
    if (!("speechSynthesis" in window)) return;
    speechVoices = window.speechSynthesis.getVoices();
    renderSpeechStatus();
    refreshActivityAudioControls();
  }

  function refreshActivityAudioControls() {
    document.querySelectorAll("[data-listen], [data-listen-slow], [data-answer-audio]").forEach(button => {
      button.disabled = !japaneseSpeechReady();
    });
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
  $("#lessonClear").addEventListener("click", () => {
    tileSelection = [];
    renderTileControls();
  });
  $("#lessonDontKnow").addEventListener("click", () => gradeAnswer(false, null, true));
  $("#lessonProfileForm").addEventListener("submit", saveProfile);
  $("#lessonTestSpeech").addEventListener("click", () => speakJapanese("はじめまして。よろしくおねがいします。"));
  document.addEventListener("keydown", event => {
    if (mode === "progress") return;
    if (/^[1-4]$/.test(event.key) && currentActivity?.type === "choice" && !currentAnswered) {
      const button = $("#lessonActivity").querySelector(`[data-key="${event.key}"]`);
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

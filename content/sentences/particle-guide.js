/* Original beginner explanations and examples; references support the rules.
   |...| marks the teaching focus, never Japanese text to be copied into answers. */
(() => {
  "use strict";
  const example=(jp,meaning,context="")=>({jp,meaning,context});
  const use=(id,title,rule,pattern,note,examples)=>({id,title,rule,pattern,note,examples});
  const groups=[
    {id:"wa",particle:"は",reading:"wa",reference:"https://www.tofugu.com/japanese-grammar/particle-wa/",uses:[
      use("topic","Set the topic","Put は after what you want to talk about. The rest of the sentence tells the listener something about that topic. The topic can be a person, a thing, or a time.","topic + は + what you say about it","は is written ha but pronounced wa here. A clear topic can be left unspoken; every sentence does not need わたしは.",[
        example("わたし|は| がくせいです。","I am a student.","Introducing yourself."),
        example("このほん|は| にほんごのほんです。","This book is a Japanese-language book.","Talking about this book."),
        example("きょう|は| べんきょうします。","Today, I will study.","Making today the topic.")]),
      use("contrast","Contrast two things","は can set one thing against another. It can replace を when you contrast objects, so the particle choice changes what you emphasise.","A + は …; B + は …","This is a useful beginner contrast, not a rule that all negative sentences need は. を is also used in negative action sentences.",[
        example("コーヒー|は| のみます。おちゃ|は| のみません。","I drink coffee, but I do not drink tea."),
        example("きょう|は| べんきょうします。あした|は| やすみます。","I will study today, but rest tomorrow."),
        example("ほん|は| よみます。テレビ|は| みません。","I read books, but I do not watch TV.")])]},
    {id:"ga",particle:"が",reading:"ga",reference:"https://www.tofugu.com/japanese-grammar/particle-ga/",uses:[
      use("existence-subject","Say what or who is there","With あります or います, が identifies the thing or person whose presence you are introducing. The location takes に.","place + に + thing/person + が + あります/います","Use あります for things and plants; います for people and animals. When locating an already-discussed thing, は may be natural instead.",[
        example("つくえのうえに ほん|が| あります。","There is a book on the desk."),
        example("こうえんに いぬ|が| います。","There is a dog in the park."),
        example("としょかんに せんせい|が| います。","There is a teacher in the library.")]),
      use("identify","Identify who or what","Use が with a subject question such as だれ (who), and when the answer identifies that subject. は sets the topic; が can supply the identity being asked for.","だれ + が …? / answer + が …","は and が are not a simple old/new switch. Context and emphasis matter; these examples show one common contrast.",[
        example("だれ|が| きますか。","Who is coming?","You do not yet know the person."),
        example("せんせい|が| きます。","The teacher is coming.","Answering ‘Who is coming?’"),
        example("だれ|が| がくせいですか。","Who is a student?","Asking which person is the student.")])]},
    {id:"wo",particle:"を",reading:"o",reference:"https://www.tofugu.com/japanese-grammar/particle-wo/",uses:[
      use("object","Mark what the action acts on","Put を after what someone reads, eats, drinks, watches, or buys. Choose the verb first, then ask what is being read, eaten, and so on.","object + を + action verb","を is normally pronounced o. Do not put を after a place simply because the English sentence includes ‘at’ or ‘to’.",[
        example("ほん|を| よみます。","I read a book."),
        example("うちで あさごはん|を| たべます。","I eat breakfast at home."),
        example("きのう コーヒー|を| のみませんでした。","I did not drink coffee yesterday.")])]},
    {id:"ni",particle:"に",reading:"ni",reference:"https://www.tofugu.com/japanese-grammar/particle-ni/",uses:[
      use("destination","Name a destination","Put に after the destination with movement verbs such as いきます, きます, and かえります.","destination + に + movement verb","へ also works for these destinations. For an activity at a place, use で instead.",[
        example("だいがく|に| いきます。","I go to university."),
        example("ともだちは うち|に| きます。","My friend comes to my home."),
        example("しちじに うち|に| かえります。","I return home at seven.")]),
      use("time","Give a specific time","Put に after a clock time. Days of the week can take に too, though it is sometimes omitted.","clock time/day + に + action","Compare しちじに (at seven) with いちじかん (for one hour). Today and yesterday usually need no に.",[
        example("しちじ|に| おきます。","I get up at seven."),
        example("くじ|に| ねます。","I go to bed at nine."),
        example("にちようび|に| えいがを みます。","I watch a movie on Sunday.")]),
      use("existence-place","Locate something that exists","With あります or います, put に after the place where something or someone is.","place + に + thing/person + が + あります/います","Being there uses に; doing an activity there uses で.",[
        example("つくえのうえ|に| ほんが あります。","There is a book on the desk."),
        example("こうえん|に| ねこが います。","There is a cat in the park."),
        example("せんせいは としょかん|に| います。","The teacher is in the library.")]),
      use("meeting","Name the person you meet","With あいます, に can mark the person you meet. The particle depends on the verb, not just an English word such as ‘with’.","person + に + あいます","と あいます is also possible and presents the meeting as a shared action.",[
        example("ともだち|に| あいます。","I meet a friend."),
        example("きのう せんせい|に| あいました。","I met the teacher yesterday."),
        example("としょかんで ともだち|に| あいました。","I met a friend at the library.")])]},
    {id:"he",particle:"へ",reading:"e",reference:"https://www.tofugu.com/japanese-grammar/particle-he/",uses:[
      use("direction","Move towards a place","Put へ after the place you are heading towards. In these beginner movement sentences, に and へ are both natural choices.","destination/direction + へ + movement verb","Written he, pronounced e as a particle. へ cannot replace に for clock times or existence locations.",[
        example("としょかん|へ| いきます。","I go to the library."),
        example("きのう だいがく|へ| いきました。","I went to university yesterday."),
        example("うち|へ| かえります。","I return home.")])]},
    {id:"de",particle:"で",reading:"de",reference:"https://www.tofugu.com/japanese-grammar/particle-de/",uses:[
      use("action-place","Say where an activity happens","Put で after the place where someone eats, reads, studies, or does another activity. This tells us where the action happens, rather than where someone is going.","activity place + で + action","Library に: go to it or be there. Library で: do something there. Check the verb, not only English ‘at’ or ‘in’.",[
        example("としょかん|で| ほんを よみます。","I read a book at the library."),
        example("うち|で| あさごはんを たべます。","I eat breakfast at home."),
        example("だいがく|で| にほんごを べんきょうします。","I study Japanese at university.")]),
      use("means","Say how you do something","で can also mark a tool or means of transport. It answers how an action is carried out, rather than where it happens.","tool/transport + で + action","The same particle has more than one job. A bus is a means of travel; a library is an activity location.",[
        example("バス|で| だいがくに いきます。","I go to university by bus."),
        example("でんしゃ|で| うちに かえります。","I return home by train."),
        example("ペン|で| なまえを かきます。","I write my name with a pen.")]),
      use("language","Say which language you use","Put で after a language when that language is the means of speaking or writing.","language + で + はなします/かきます","Compare にほんごを べんきょうします: Japanese is what you study, so it takes を there.",[
        example("にほんご|で| はなします。","I speak in Japanese."),
        example("えいご|で| なまえを かきます。","I write my name in English."),
        example("にほんご|で| レポートを かきました。","I wrote a report in Japanese.")])]},
    {id:"no",particle:"の",reading:"no",reference:"https://www.tofugu.com/japanese-grammar/particle-no-noun-modifier/",uses:[
      use("ownership","Show ownership or a relationship","Put the owner or describing person first, then の, then the noun. The order is ‘owner’s thing’, even when English uses ‘of’.","owner/person + の + noun","わたしのほん is my book. ともだちのせんせい is my friend’s teacher; the relationship is not necessarily ownership.",[
        example("これは わたし|の| ほんです。","This is my book."),
        example("せんせい|の| かばんです。","It is the teacher’s bag."),
        example("ともだち|の| ほんを よみます。","I read my friend’s book.")]),
      use("description","Describe one noun with another","の also links a noun to its type, subject, or location. It does not always mean that someone owns something.","describing noun + の + main noun","Position words such as うえ (on/above) and した (under/below) follow the reference noun + の.",[
        example("にほんご|の| ほんです。","It is a Japanese-language book."),
        example("だいがく|の| せんせいです。","They are a university teacher."),
        example("ねこは つくえ|の| したに います。","The cat is under the desk.")]),
      use("omitted-noun","Leave out an understood belonging","When the thing is clear, the noun after owner + の can be left out. The remaining phrase means ‘mine’, ‘the teacher’s’, and so on.","owner + の + です","Use this only when the listener can tell what thing you mean. It is not permission to remove any noun after の.",[
        example("このほんは わたし|の|です。","This book is mine."),
        example("そのかばんは せんせい|の|です。","That bag near you is the teacher’s."),
        example("このかさは ともだち|の|です。","This umbrella is my friend’s.")])]},
    {id:"to",particle:"と",reading:"to",reference:"https://www.tofugu.com/japanese-grammar/particle-to/",uses:[
      use("companion","Do something with someone","Put と after the person accompanying you in an activity. That person is your companion, rather than the object of the action.","person + と + activity","‘With a friend’ uses と; ‘with a pen’ uses で because the pen is a tool.",[
        example("ともだち|と| べんきょうします。","I study with a friend."),
        example("せんせい|と| としょかんに いきます。","I go to the library with the teacher."),
        example("ともだち|と| えいがを みました。","I watched a movie with a friend.")]),
      use("list","Join nouns with ‘and’","Put と between nouns to name a complete list. Put the particle for the entire list after the last noun.","A + と + B + を/が …","ほんとパンを means a book and bread are both objects. This use joins nouns, not two complete sentences.",[
        example("ほん|と| パンを かいます。","I buy a book and bread."),
        example("みず|と| おちゃを のみます。","I drink water and tea."),
        example("こうえんに いぬ|と| ねこが います。","There are a dog and a cat in the park.")])]},
    {id:"mo",particle:"も",reading:"mo",reference:"https://www.tofugu.com/japanese-grammar/particle-mo/",uses:[
      use("addition","Add someone or something: ‘too’","Use も when you add another person or thing to something already mentioned. In these examples, it replaces は rather than following it.","additional topic + も + same description/action","The context supplies what ‘too’ refers to. わたしも means ‘I too’, rather than automatically meaning ‘I do another activity too’.",[
        example("わたし|も| がくせいです。","I am a student too.","Your friend has said they are a student."),
        example("ともだち|も| にほんじんです。","My friend is Japanese too.","You have said that you are Japanese."),
        example("せんせい|も| きます。","The teacher is coming too.","You have just said your friend is coming.")]),
      use("additional-object","Add another object","も can replace を when you add another thing that the same action applies to. Place it after the additional object.","additional object + も + action","For these objects, use も instead of をも. Other particles can combine with も: にも and でも keep their location role.",[
        example("おちゃ|も| のみます。","I drink tea too.","You have said that you drink coffee."),
        example("パン|も| かいます。","I buy bread too.","You have said that you buy a book."),
        example("えいが|も| みます。","I watch movies too.","You have said that you watch TV.")])]},
    {id:"ka",particle:"か",reading:"ka",reference:"https://www.tofugu.com/japanese-grammar/particle-ka/",uses:[
      use("question","Ask a polite question","Add か after a polite ending such as です or ます. The word order and the other particles keep their roles.","polite statement + か","A question word does not remove the need for other particles: だれが asks who the subject is. Casual questions can work differently.",[
        example("がくせいです|か|。","Are you a student?"),
        example("あした としょかんに いきます|か|。","Will you go to the library tomorrow?"),
        example("これは だれのほんです|か|。","Whose book is this?")])]},
    {id:"none",particle:"—",reading:"no particle",reference:"https://www.irodori.jpf.go.jp/assets/data/Grammar_all.pdf",uses:[
      use("relative-time","Use relative or repeated time directly","きょう (today), きのう (yesterday), あした (tomorrow), and まいにち (every day) normally stand without に in these neutral sentences.","relative/repeated time + action","The highlighted time phrase takes no particle here. は is possible when making that time the topic or contrasting it with another time.",[
        example("|きょう| ほんを よみます。","I read a book today."),
        example("|きのう| えいがを みました。","I watched a movie yesterday."),
        example("|まいにち| にほんごを べんきょうします。","I study Japanese every day.")]),
      use("duration","Say how long an activity lasts","A duration such as いちじかん (one hour) normally goes directly with the action, without に. Add ぐらい for ‘about’.","duration (+ ぐらい) + action","Compare しちじに: at seven is a point in time. いちじかん: for one hour is a length of time, not a clock time.",[
        example("|いちじかん| べんきょうします。","I study for one hour."),
        example("|いちじかんぐらい| まちました。","I waited for about one hour."),
        example("としょかんで |いちじかん| ほんを よみました。","I read a book at the library for one hour.")])]}
  ];
  const extend=(id,entry)=>groups.find(group=>group.id===id).uses.push(entry);
  extend("ga",use("having-events-understanding","Have, schedule, or understand something","が also marks what you have, an event that takes place, or the language you understand with わかる. Its role depends on the whole pattern, not just an English word.","thing + が + あります / language + が + わかります","Use います when talking about having siblings or friends. With わかる, do not substitute the usual action-object を in these neutral examples.",[
    example("じてんしゃ|が| あります。","I have a bicycle."),example("テスト|が| あります。","There is a test."),example("にほんご|が| わかります。","I understand Japanese.")]));
  extend("wo",use("waiting","Say who you wait for","With まつ, put を after the person you wait for. This differs from the person に you meet with あう.","person + を + まちます","‘For’ in English does not automatically require に. The verb selects this pattern.",[
    example("ともだち|を| まちます。","I wait for a friend."),example("としょかんのまえで せんせい|を| まちました。","I waited for the teacher in front of the library."),example("せんせい|を| いちじかん まちます。","I wait for the teacher for one hour.")]));
  extend("ni",use("letter-recipient","Say who a letter is for","With かく, に can mark the person you write to. Keep を after the letter itself.","recipient + に + letter + を + かきます","Recipient に and object を can both occur in one sentence.",[
    example("ともだち|に| てがみを かきます。","I write a letter to a friend."),example("せんせい|に| てがみを かきました。","I wrote a letter to the teacher."),example("ともだち|に| てがみを かきませんでした。","I did not write a letter to a friend.")]));
  extend("de",use("event-venue","Locate an event","Use で for the venue where a class, test, or other event takes place, even with あります.","venue + で + event + が + あります","Compare としょかんにほんがあります (a book exists there) with としょかんでクラスがあります (a class takes place there).",[
    example("だいがく|で| テストが あります。","There is a test at university."),example("としょかん|で| クラスが あります。","There is a class at the library."),example("だいがく|で| テストが ありました。","There was a test at university.")]));
  extend("mo",use("combined-particles","Add another place or destination","Keep に or で before も when adding another destination or activity location. でも is at a place too; にも is to a place too in these movement examples.","activity place + でも / destination + にも・へも","This differs from replacing は, が, or を with も. Keep the context clear so ‘too’ adds the intended place or thing.",[
    example("としょかん|でも| べんきょうします。","I study at the library too.","You have said you study at home."),example("こうえん|にも| いきます。","I go to the park too.","You have said you go to the supermarket."),example("うちに ねこ|も| います。","There is a cat at home too.","You have said there is a dog at home.")]));
  globalThis.SENTENCE_PARTICLE_GUIDE={groups};
})();

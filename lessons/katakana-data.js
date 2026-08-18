(() => {
  "use strict";

  const STORAGE_KEY = "katakana-sprint-v1";

  const FONT_PROFILES = [
    {id:"standard",label:"Standard",difficulty:"Standard",gainMultiplier:1,wordGainMultiplier:1,penalty:13,family:'"Yu Gothic","Noto Sans JP",sans-serif'},
    {id:"klee",label:"Klee pen",difficulty:"Medium",gainMultiplier:1.1,wordGainMultiplier:1.05,penalty:9,family:'"Kata Klee",sans-serif'},
    {id:"yuji-boku",label:"Yuji rough",difficulty:"Hard",gainMultiplier:1.2,wordGainMultiplier:1.1,penalty:7,family:'"Kata Yuji Boku",sans-serif'},
    {id:"yuji-syuku",label:"Yuji brush",difficulty:"Very hard",gainMultiplier:1.3,wordGainMultiplier:1.15,penalty:5,family:'"Kata Yuji Syuku",serif'},
    {id:"yuji-mai",label:"Yuji flowing",difficulty:"Very hard+",gainMultiplier:1.35,wordGainMultiplier:1.2,penalty:5,family:'"Kata Yuji Mai",serif'}
  ];

  const GROUPS = [
    {id:"vowels",name:"Vowels",phase:"Basic",items:[["ア","a"],["イ","i"],["ウ","u"],["エ","e"],["オ","o"]]},
    {id:"k",name:"K-row",phase:"Basic",items:[["カ","ka"],["キ","ki"],["ク","ku"],["ケ","ke"],["コ","ko"]]},
    {id:"s",name:"S-row",phase:"Basic",items:[["サ","sa"],["シ","shi"],["ス","su"],["セ","se"],["ソ","so"]]},
    {id:"t",name:"T-row",phase:"Basic",items:[["タ","ta"],["チ","chi"],["ツ","tsu"],["テ","te"],["ト","to"]]},
    {id:"n",name:"N-row",phase:"Basic",items:[["ナ","na"],["ニ","ni"],["ヌ","nu"],["ネ","ne"],["ノ","no"]]},
    {id:"h",name:"H-row",phase:"Basic",items:[["ハ","ha"],["ヒ","hi"],["フ","fu"],["ヘ","he"],["ホ","ho"]]},
    {id:"m",name:"M-row",phase:"Basic",items:[["マ","ma"],["ミ","mi"],["ム","mu"],["メ","me"],["モ","mo"]]},
    {id:"y",name:"Y-row",phase:"Basic",items:[["ヤ","ya"],["ユ","yu"],["ヨ","yo"]]},
    {id:"r",name:"R-row",phase:"Basic",items:[["ラ","ra"],["リ","ri"],["ル","ru"],["レ","re"],["ロ","ro"]]},
    {id:"w",name:"W-row + ン",phase:"Basic",items:[["ワ","wa"],["ヲ","wo"],["ン","n"]]},
    {id:"g",name:"G-row",phase:"Voiced",items:[["ガ","ga"],["ギ","gi"],["グ","gu"],["ゲ","ge"],["ゴ","go"]]},
    {id:"z",name:"Z-row",phase:"Voiced",items:[["ザ","za"],["ジ","ji"],["ズ","zu"],["ゼ","ze"],["ゾ","zo"]]},
    {id:"d",name:"D-row",phase:"Voiced",items:[["ダ","da"],["ヂ","ji"],["ヅ","zu"],["デ","de"],["ド","do"]]},
    {id:"b",name:"B-row",phase:"Voiced",items:[["バ","ba"],["ビ","bi"],["ブ","bu"],["ベ","be"],["ボ","bo"]]},
    {id:"p",name:"P-row",phase:"Semi-voiced",items:[["パ","pa"],["ピ","pi"],["プ","pu"],["ペ","pe"],["ポ","po"]]},
    {id:"kya",name:"K-combos",phase:"Combinations",items:[["キャ","kya"],["キュ","kyu"],["キョ","kyo"]]},
    {id:"sha",name:"SH-combos",phase:"Combinations",items:[["シャ","sha"],["シュ","shu"],["ショ","sho"]]},
    {id:"cha",name:"CH-combos",phase:"Combinations",items:[["チャ","cha"],["チュ","chu"],["チョ","cho"]]},
    {id:"nya",name:"N-combos",phase:"Combinations",items:[["ニャ","nya"],["ニュ","nyu"],["ニョ","nyo"]]},
    {id:"hya",name:"H-combos",phase:"Combinations",items:[["ヒャ","hya"],["ヒュ","hyu"],["ヒョ","hyo"]]},
    {id:"mya",name:"M-combos",phase:"Combinations",items:[["ミャ","mya"],["ミュ","myu"],["ミョ","myo"]]},
    {id:"rya",name:"R-combos",phase:"Combinations",items:[["リャ","rya"],["リュ","ryu"],["リョ","ryo"]]},
    {id:"gya",name:"G-combos",phase:"Combinations",items:[["ギャ","gya"],["ギュ","gyu"],["ギョ","gyo"]]},
    {id:"ja",name:"J-combos",phase:"Combinations",items:[["ジャ","ja"],["ジュ","ju"],["ジョ","jo"]]},
    {id:"bya",name:"B-combos",phase:"Combinations",items:[["ビャ","bya"],["ビュ","byu"],["ビョ","byo"]]},
    {id:"pya",name:"P-combos",phase:"Combinations",items:[["ピャ","pya"],["ピュ","pyu"],["ピョ","pyo"]]},
    {id:"fa",name:"F foreign sounds",phase:"Combinations",items:[["ファ","fa"],["フィ","fi"],["フェ","fe"],["フォ","fo"]]},
    {id:"ti",name:"T/D foreign sounds",phase:"Combinations",items:[["ティ","ti"],["ディ","di"],["トゥ","tu"],["ドゥ","du"]]},
    {id:"wi",name:"W foreign sounds",phase:"Combinations",items:[["ウィ","wi"],["ウェ","we"],["ウォ","wo"]]},
    {id:"she",name:"SH/J/CH foreign sounds",phase:"Combinations",items:[["シェ","she"],["ジェ","je"],["チェ","che"]]},
    {id:"tsa",name:"TS foreign sounds",phase:"Combinations",items:[["ツァ","tsa"],["ツェ","tse"],["ツォ","tso"]]},
    {id:"v",name:"V foreign sounds",phase:"Combinations",items:[["ヴァ","va"],["ヴィ","vi"],["ヴ","vu"],["ヴェ","ve"],["ヴォ","vo"]]}
  ];

  const VISUAL = {
    "ア":["マ","ヤ"],"イ":["ト","リ"],"ウ":["ワ","フ"],"エ":["ユ","コ"],"オ":["ホ"],
    "カ":["ク","ワ"],"キ":["サ"],"ク":["ケ","ワ","タ"],"ケ":["ク"],"コ":["ユ","ロ"],
    "サ":["キ","セ"],"シ":["ツ","ソ","ン"],"ス":["ヌ"],"セ":["サ","ヒ"],"ソ":["ン","シ","ツ"],
    "タ":["ク","ヌ"],"チ":["テ"],"ツ":["シ","ソ","ン"],"テ":["チ"],"ト":["イ"],
    "ナ":["メ"],"ニ":["ミ","コ"],"ヌ":["ス","メ"],"ネ":["ホ"],"ノ":["メ"],
    "ハ":["ヒ"],"ヒ":["セ","ハ"],"フ":["ワ","ウ"],"ヘ":["エ"],"ホ":["ネ","オ"],
    "マ":["ア"],"ミ":["ニ"],"ム":["マ"],"メ":["ヌ","ノ","ナ"],"モ":["ヨ"],
    "ヤ":["ア"],"ユ":["コ"],"ヨ":["モ"],"ラ":["フ"],"リ":["イ"],
    "ル":["レ"],"レ":["ル"],"ロ":["コ"],"ワ":["ウ","フ","ク"],"ヲ":["ヨ"],"ン":["ソ","シ","ツ"]
  };

  const voicedPairs = [["カ","ガ"],["キ","ギ"],["ク","グ"],["ケ","ゲ"],["コ","ゴ"],["サ","ザ"],["シ","ジ"],["ス","ズ"],["セ","ゼ"],["ソ","ゾ"],["タ","ダ"],["チ","ヂ"],["ツ","ヅ"],["テ","デ"],["ト","ド"],["ハ","バ","パ"],["ヒ","ビ","ピ"],["フ","ブ","プ"],["ヘ","ベ","ペ"],["ホ","ボ","ポ"]];
  voicedPairs.forEach(set=>set.forEach(k=>{VISUAL[k]=[...(VISUAL[k]||[]),...set.filter(x=>x!==k)];}));

  const WORDS = [
    {k:"アイス",r:"aisu",m:"ice cream",u:[]},{k:"アニメ",r:"anime",m:"anime",u:[]},
    {k:"ホテル",r:"hoteru",m:"hotel",u:[]},{k:"テレビ",r:"terebi",m:"television",u:[]},
    {k:"ラジオ",r:"rajio",m:"radio",u:[]},{k:"カメラ",r:"kamera",m:"camera",u:[]},
    {k:"トイレ",r:"toire",m:"toilet",u:[]},{k:"バス",r:"basu",m:"bus",u:[]},
    {k:"タクシー",r:"takushii",m:"taxi",u:[]},{k:"パン",r:"pan",m:"bread",u:[]},
    {k:"コーヒー",r:"koohii",m:"coffee",u:[]},{k:"ジュース",r:"juusu",m:"juice",u:[]},
    {k:"ミルク",r:"miruku",m:"milk",u:[]},{k:"レストラン",r:"resutoran",m:"restaurant",u:[]},
    {k:"スーパー",r:"suupaa",m:"supermarket",u:[]},{k:"コンビニ",r:"konbini",m:"convenience store",u:[]},
    {k:"デパート",r:"depaato",m:"department store",u:[]},{k:"パソコン",r:"pasokon",m:"personal computer",u:[]},
    {k:"スマホ",r:"sumaho",m:"smartphone",u:[]},{k:"メール",r:"meeru",m:"email",u:[]},
    {k:"ゲーム",r:"geemu",m:"game",u:[]},{k:"スポーツ",r:"supootsu",m:"sports",u:[]},
    {k:"サッカー",r:"sakkaa",m:"soccer",u:[]},{k:"テニス",r:"tenisu",m:"tennis",u:[]},
    {k:"ノート",r:"nooto",m:"notebook",u:[]},{k:"ペン",r:"pen",m:"pen",u:[]},
    {k:"シャツ",r:"shatsu",m:"shirt",u:[]},{k:"ジャケット",r:"jaketto",m:"jacket",u:[]},
    {k:"チョコレート",r:"chokoreeto",m:"chocolate",u:[]},{k:"ニュース",r:"nyuusu",m:"news",u:[]}
  ];

  const EXTRA_WORDS = [
    ["アパート","apaato","apartment"],["マンション","manshon","apartment building"],["エスカレーター","esukareetaa","escalator"],
    ["インターネット","intaanetto","internet"],["ウェブサイト","webusaito","website"],["キーボード","kiiboodo","keyboard"],["マウス","mausu","computer mouse"],
    ["プリンター","purintaa","printer"],["コピー","kopii","copy"],["ファイル","fairu","file"],["フォルダー","forudaa","folder"],
    ["アプリ","apuri","app"],["ソフト","sofuto","software"],["データ","deeta","data"],["パスワード","pasuwaado","password"],
    ["カレンダー","karendaa","calendar"],["スケジュール","sukejuuru","schedule"],["メッセージ","messeeji","message"],["チャット","chatto","chat"],
    ["ビデオ","bideo","video"],["カセット","kasetto","cassette"],["イヤホン","iyahon","earphones"],["ヘッドホン","heddohon","headphones"],
    ["スピーカー","supiikaa","speaker"],["マイク","maiku","microphone"],["リモコン","rimokon","remote control"],["バッテリー","batterii","battery"],
    ["ロボット","robotto","robot"],["エンジン","enjin","engine"],["ボタン","botan","button"],["スイッチ","suicchi","switch"],
    ["テーブル","teeburu","table"],["ベッド","beddo","bed"],["ソファ","sofa","sofa"],["カーテン","kaaten","curtain"],
    ["ドア","doa","door"],["シャワー","shawaa","shower"],["タオル","taoru","towel"],["シャンプー","shanpuu","shampoo"],
    ["トイレットペーパー","toirettopeepaa","toilet paper"],["キッチン","kicchin","kitchen"],["ガス","gasu","gas"],["ライト","raito","light"],
    ["エアコン","eakon","air conditioner"],["ストーブ","sutoobu","heater"],["クーラー","kuuraa","air conditioner"],["ベランダ","beranda","balcony"],
    ["ビル","biru","building"],["オフィス","ofisu","office"],["ロビー","robii","lobby"],["フロント","furonto","reception desk"],
    ["コンピューター","konpyuutaa","computer"],["アルバイト","arubaito","part-time job"],["サラリーマン","sarariiman","office worker"],["スタッフ","sutaffu","staff"],
    ["チーム","chiimu","team"],["グループ","guruupu","group"],["クラス","kurasu","class"],["テスト","tesuto","test"],
    ["レポート","repooto","report"],["テーマ","teema","theme"],["タイトル","taitoru","title"],["ページ","peeji","page"],
    ["カード","kaado","card"],["メモ","memo","memo"],["ニュースペーパー","nyuusupeepaa","newspaper"],["ポスター","posutaa","poster"],
    ["メニュー","menyuu","menu"],["フォーク","fooku","fork"],["ナイフ","naifu","knife"],["スプーン","supuun","spoon"],
    ["カップ","kappu","cup"],["グラス","gurasu","glass"],["ボトル","botoru","bottle"],["プレート","pureeto","plate"],
    ["ケーキ","keeki","cake"],["クッキー","kukkii","cookie"],["キャンディー","kyandii","candy"],["プリン","purin","custard pudding"],
    ["サンドイッチ","sandoicchi","sandwich"],["ハンバーガー","hanbaagaa","hamburger"],["ピザ","piza","pizza"],["パスタ","pasuta","pasta"],
    ["サラダ","sarada","salad"],["スープ","suupu","soup"],["カレー","karee","curry"],["ステーキ","suteeki","steak"],
    ["ハム","hamu","ham"],["ソーセージ","sooseeji","sausage"],["チーズ","chiizu","cheese"],["バター","bataa","butter"],
    ["ヨーグルト","yooguruto","yogurt"],["レモン","remon","lemon"],["バナナ","banana","banana"],["オレンジ","orenji","orange"],
    ["メロン","meron","melon"],["トマト","tomato","tomato"],["ポテト","poteto","potato"],["コーン","koon","corn"],
    ["ビール","biiru","beer"],["ワイン","wain","wine"],["コーラ","koora","cola"],["ミネラルウォーター","mineraruwootaa","mineral water"],
    ["バイク","baiku","motorcycle"],["トラック","torakku","truck"],["ヘリコプター","herikoputaa","helicopter"],["ロケット","roketto","rocket"],
    ["ホーム","hoomu","railway platform"],["チケット","chiketto","ticket"],["パスポート","pasupooto","passport"],
    ["スーツケース","suutsukeesu","suitcase"],["ガイド","gaido","guide"],["ツアー","tsuaa","tour"],["キャンプ","kyanpu","camping"],
    ["プール","puuru","swimming pool"],["ビーチ","biichi","beach"],["ゲスト","gesuto","guest"],
    ["パーティー","paatii","party"],["プレゼント","purezento","present"],["クリスマス","kurisumasu","Christmas"],["ハロウィーン","harowiin","Halloween"],
    ["バースデー","baasudee","birthday"],["コンサート","konsaato","concert"],["イベント","ibento","event"],["チャンス","chansu","chance"],
    ["ギター","gitaa","guitar"],["ピアノ","piano","piano"],["ドラム","doramu","drums"],["バイオリン","baiorin","violin"],
    ["ミュージック","myuujikku","music"],["ダンス","dansu","dance"],["カラオケ","karaoke","karaoke"],["ドラマ","dorama","drama"],
    ["ムービー","muubii","movie"],["コミック","komikku","comic"],["キャラクター","kyarakutaa","character"],["ヒーロー","hiiroo","hero"],
    ["ゴルフ","gorufu","golf"],["バレー","baree","volleyball"],["バスケットボール","basukettobooru","basketball"],["マラソン","marason","marathon"],
    ["スキー","sukii","skiing"],["スケート","sukeeto","skating"],["ボール","booru","ball"],["ラケット","raketto","racket"],
    ["ユニフォーム","yunifoomu","uniform"],["トレーニング","toreeningu","training"],["ストレッチ","sutorecchi","stretching"],["フィットネス","fittonesu","fitness"],
    ["ドクター","dokutaa","doctor"],["ナース","naasu","nurse"],["クリニック","kurinikku","clinic"],["マスク","masuku","mask"],
    ["アレルギー","arerugii","allergy"],["ビタミン","bitamin","vitamin"],["ストレス","sutoresu","stress"],["エネルギー","enerugii","energy"],
    ["ファッション","fasshon","fashion"],["ドレス","doresu","dress"],["スカート","sukaato","skirt"],["ズボン","zubon","trousers"],
    ["セーター","seetaa","sweater"],["コート","kooto","coat"],["スーツ","suutsu","suit"],["ネクタイ","nekutai","necktie"],
    ["ソックス","sokkusu","socks"],["スニーカー","suniikaa","sneakers"],["サンダル","sandaru","sandals"],["アクセサリー","akusesarii","accessory"],
    ["バッグ","baggu","bag"],["ポケット","poketto","pocket"],["サイズ","saizu","size"],["カラー","karaa","color"],
    ["デザイン","dezain","design"],["ブランド","burando","brand"],["セール","seeru","sale"],["サービス","saabisu","service"],
    ["センター","sentaa","center"],["マーケット","maaketto","market"],["ショップ","shoppu","shop"],["レジ","reji","checkout register"],
    ["ファミリー","famirii","family"],["ベビー","bebii","baby"],["ペット","petto","pet"],["プロフィール","purofiiru","profile"],
    ["アメリカ","amerika","America"],["イギリス","igirisu","United Kingdom"],["フランス","furansu","France"],["ドイツ","doitsu","Germany"],
    ["イタリア","itaria","Italy"],["カナダ","kanada","Canada"],["インド","indo","India"],["アジア","ajia","Asia"],
    ["ヨーロッパ","yooroppa","Europe"],["ニューヨーク","nyuuyooku","New York"],["ロンドン","rondon","London"],["パリ","pari","Paris"],
    ["ファン","fan","fan"],["フィルム","firumu","film"],["フェリー","ferii","ferry"],["ディナー","dinaa","dinner"],
    ["ティッシュ","tisshu","tissue"],["シェフ","shefu","chef"],["ジェット","jetto","jet"],["チェス","chesu","chess"],
    ["ヴァイオリン","vaiorin","violin"],["ボランティア","borantia","volunteer"],["ウォーター","wootaa","water"],["ウィークエンド","wiikuendo","weekend"]
  ].map(([k,r,m,a])=>({k,r,m,a:a||[],u:[]}));

  window.KANA_SPRINT_LESSON = {
    appName:"Katakana Sprint",
    scriptName:"Katakana",
    scriptNameLower:"katakana",
    storageKey:STORAGE_KEY,
    progressFileStem:"katakana-sprint",
    progressVersion:1,
    initialLearnUnlockedCount:2,
    sampleKana:"ア",
    sampleWord:"ホテル",
    fontPreview:"アキサリフ",
    smallTsu:"ッ",
    smallTsuFeature:"Small ッ",
    fontProfiles:FONT_PROFILES,
    groups:GROUPS,
    visualConfusions:VISUAL,
    words:WORDS,
    extraWords:EXTRA_WORDS,
    testSpeech:{ja:"こんにちは。カタカナの練習をしましょう。",en:"Meaning: hotel."}
  };
})();

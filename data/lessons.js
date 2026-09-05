/* Lessons — the 26-chapter sequence of David Alan Black,
   Learn to Read New Testament Greek (3rd ed.), with a free video
   lecture per chapter from dailydoseofgreek.com (Rob Plummer, SBTS).
   Plain script, no modules — load order in index.html matters. */

const ALPHABET=[
["Α α","alpha","a as in father","a"],
["Β β","beta","b","b"],
["Γ γ","gamma","g as in got","g"],
["Δ δ","delta","d","d"],
["Ε ε","epsilon","e as in met","e"],
["Ζ ζ","zeta","dz as in adze","z"],
["Η η","eta","e as in obey (long)","ē"],
["Θ θ","theta","th as in thing","th"],
["Ι ι","iota","i as in pit / machine","i"],
["Κ κ","kappa","k","k"],
["Λ λ","lambda","l","l"],
["Μ μ","mu","m","m"],
["Ν ν","nu","n","n"],
["Ξ ξ","xi","x as in axe","x"],
["Ο ο","omicron","o as in not","o"],
["Π π","pi","p","p"],
["Ρ ρ","rho","r (trilled)","r"],
["Σ σ ς","sigma","s","s"],
["Τ τ","tau","t","t"],
["Υ υ","upsilon","u as in French tu","u/y"],
["Φ φ","phi","ph as in phone","ph"],
["Χ χ","chi","ch as in loch","ch"],
["Ψ ψ","psi","ps as in lips","ps"],
["Ω ω","omega","o as in tone (long)","ō"]
];

/* v:[…] — this chapter's vocabulary, by VOCAB index.

   These are the words Black's own chapter vocabulary sections introduce,
   read off the textbook and matched to the deck by headword. Only the
   indices are stored: the app keeps its own citation forms and glosses.

   The principal-part lists in chapters 7, 10, 13 and 15 are deliberately
   excluded. They are inflected forms of verbs already learned — ἔλυσα,
   λέλυκα, ἐλύθην — and belong to the paradigm drills, not to the deck.

   Chapters 1, 2, 16, 20 and 26 introduce no vocabulary at all: the alphabet,
   the overview of the verb, the review, the participle chapter (forms of
   verbs you have), and the closing chapter on reading. 118 words in the deck
   belong to no chapter — they are above Black's floor but he never formally
   introduces them, and the frequency path on Today still reaches them. */
const LESSONS=[
{id:1,t:"The letters and sounds of Greek",s:"The alphabet, breathings, accents and punctuation",
body:`<p>Everything downstream depends on being able to sound a word out. If you cannot pronounce it, you cannot hold it in your memory, and a word you cannot hold is a word you will meet as a stranger every time. Spend two or three days here before moving on. It is the only chapter where that is true.</p>
<p>There are twenty-four letters and you already know several of them. Some are ours exactly, some are ours in disguise, and only a handful are genuinely new.</p>
<div id="alphaHere"></div>
<h3>Three rules that trip people up</h3>
<p><b>Sigma</b> is written <span class="gk">ς</span> at the end of a word and <span class="gk">σ</span> everywhere else. Same letter, same sound: <span class="gk">λόγος</span> has both.</p>
<p><b>Breathings.</b> Every word starting with a vowel carries a mark. Rough (<span class="gk">ἁ</span>) adds an <i>h</i>; smooth (<span class="gk">ἀ</span>) adds nothing. So <span class="gk">ἅγιος</span> is <i>hagios</i>, but <span class="gk">ἀγάπη</span> is <i>agapē</i>. Initial <span class="gk">ῥ</span> always takes the rough breathing, though it is generally not sounded as an h: <span class="gk">ῥῆμα</span> is <i>rhēma</i>, near enough <i>rēma</i>.</p>
<p><b>Gamma nasal.</b> <span class="gk">γ</span> before <span class="gk">γ, κ, χ, ξ</span> is pronounced <i>n</i>. So <span class="gk">ἄγγελος</span> is <i>angelos</i>, not <i>aggelos</i> — which is where our word angel comes from.</p>
<h3>A note on pronunciation</h3>
<p>Erasmian is a scholarly convention, not how anyone spoke in the first century. It survives because it keeps distinct sounds distinct — in modern Greek η, ι, υ, ει and οι have all collapsed into <i>ee</i>, which is punishing when you are trying to learn to spell. Stay with Erasmian. Nobody is going to overhear you and object.</p>
<h3>Accents</h3>
<p>Greek has three accents: acute (<span class="gk">ά</span>), grave (<span class="gk">ὰ</span>) and circumflex (<span class="gk">ᾶ</span>). In Koine they no longer marked pitch, and for reading purposes they mostly matter for one reason: <b>they distinguish otherwise identical words</b>.</p>
<table><tr><th>Word</th><th>Meaning</th></tr>
<tr><td class="g">τίς</td><td>who? what? (interrogative)</td></tr>
<tr><td class="g">τις</td><td>someone, a certain (indefinite)</td></tr>
<tr><td class="g">εἰ</td><td>if</td></tr>
<tr><td class="g">εἶ</td><td>you are</td></tr>
<tr><td class="g">αὐτή</td><td>she — smooth breathing</td></tr>
<tr><td class="g">αὕτη</td><td>this (feminine) — rough breathing, not a different accent</td></tr></table>
<p>Do not memorise accent rules now. Learn the accent as part of each word's spelling, the way you learned that receive has an e before the i, and move on. The Look-alikes drill exists for exactly this list and will keep bringing it back.</p>
<h3>Punctuation</h3>
<p>Comma and full stop look like ours. A raised dot <span class="gk">·</span> does the work of our colon and semicolon, and it very often introduces speech:</p>
<p class="v" data-ref="Matthew 3:2">καὶ λέγων· Μετανοεῖτε, ἤγγικεν γὰρ ἡ βασιλεία τῶν οὐρανῶν</p>
<p>"and saying, Repent, for the kingdom of heaven has come near." The dot after <span class="gk">λέγων</span> is where our editors would open a quotation mark.</p>
<p>And the mark that looks like a semicolon is a <b>question mark</b>. This catches everyone at least once:</p>
<p class="v" data-ref="Matthew 11:3">Σὺ εἶ ὁ ἐρχόμενος ἢ ἕτερον προσδοκῶμεν;</p>
<p>"Are you the one who is to come, or should we expect another?" John's disciples are asking a question, and the only thing on the page that tells you so is that final mark.</p>
<h3>Iota subscript</h3>
<p>A small iota written under a long vowel: <span class="gk">ᾳ, ῃ, ῳ</span>. It is not pronounced, but it usually signals the <b>dative case</b> — about five times in six. The main exception is subjunctive endings, which you meet in chapter 23.</p>
<p>It is a silent letter and a loud grammatical clue, and it is easy to miss when you are reading quickly. Train your eye for it now.</p>
<h3>What to watch for</h3>
<p>The letters that will cost you time are the ones that look like English letters and are not: <span class="gk">ρ</span> is <i>r</i>, not <i>p</i>. <span class="gk">η</span> is a long <i>e</i>, not <i>n</i>. <span class="gk">υ</span> is <i>u</i>, not <i>v</i>. <span class="gk">χ</span> is the <i>ch</i> of loch, not <i>x</i>. <span class="gk">ω</span> is a long <i>o</i>, not <i>w</i>.</p>
<p>You will misread each of these at least once. That is not a sign you are doing badly; it is a sign you are reading. Tracing the letters by hand is the fastest way to stop, which is why there is a drill for it.</p>`,
v:[],
vids:[{t:"Lecture 1: The Letters and Sounds of Greek",s:"Daily Dose of Greek — Rob Plummer (24:37)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-1/"},
      {t:"Greek Alphabet Song",s:"Daily Dose of Greek — sing it until the order sticks",yt:"HxwawakLPxw"},
      {t:"“Shortnin’ Bread” Greek Alphabet Song",s:"Daily Dose of Greek — the same letters, a tune that lodges",yt:"yYU_zfBL6YA"}],
quiz:[
{q:"How is ἄγγελος pronounced?",o:["ag-ge-los","an-ge-los","ah-ge-los","ang-khe-los"],a:1,w:"Gamma before another guttural becomes an n sound. This is why the English word is angel.",sec:1},
{q:"What does the rough breathing over ἁ add?",o:["Nothing","An h sound","A glottal stop","Length to the vowel"],a:1,w:"Rough breathing means h. ἅγιος is hagios. Smooth breathing adds nothing at all.",sec:1},
{q:"Which letter is written two different ways depending on position?",o:["Beta","Sigma","Theta","Omega"],a:1,w:"σ within a word, ς at the end. One letter, one sound — λόγος has both.",sec:1},
{q:"Why does this course use Erasmian rather than modern Greek pronunciation?",o:["It is how the first century sounded","It keeps distinct sounds distinct, which helps spelling","It is easier to say","Modern Greek has no h"],a:1,w:"Erasmian is a convention, not a reconstruction. It survives because η, ι, υ, ει and οι have all collapsed into ee in modern Greek, which makes spelling much harder to learn.",sec:2},
{q:"τίς with an acute accent means:",o:["someone","a certain one","who? what?","this"],a:2,w:"Accented τίς is interrogative. Unaccented τις is indefinite: someone, a certain. The accent is the only difference between them.",sec:3},
{q:"In Greek, the mark ; means:",o:["Semicolon","Question mark","Full stop","Colon"],a:1,w:"It is a question mark. The raised dot · does the work of our semicolon and colon, and often opens speech.",sec:4},
{q:"An iota subscript (ᾳ, ῃ, ῳ) usually signals which case?",o:["Nominative","Genitive","Dative","Accusative"],a:2,w:"Dative, about five times in six. It is a silent letter and a loud grammatical clue.",sec:5},
{q:"Which of these is most likely to be misread by an English speaker?",o:["ρ as p","β as b","δ as d","κ as k"],a:0,w:"ρ is r. So is η for n, υ for v, χ for x and ω for w. Everyone makes these at least once.",sec:6}]},
{id:2,t:"The Greek verbal system",s:"The map before the territory",
body:`<p>Before learning any paradigm, get the shape of the whole system. It is worth an hour now, because everything from here to chapter 26 hangs on it, and because the alternative is memorising a great many endings without knowing what they are for.</p>
<p>Every Greek verb form encodes five things: <b>person, number, tense, voice and mood</b>. Parsing a verb means naming all five. <span class="gk">λύομεν</span> is first person plural, present, active, indicative — "we loose". Five facts, one word, no helping verbs required.</p>
<h3>Aspect comes first</h3>
<p>This is the single most important thing in the chapter, and it is the thing most likely to have been taught to you wrongly.</p>
<p>Greek tenses differ less by <i>when</i> the action happened than by <i>how</i> the writer chose to present it. That choice is called aspect, and there are three:</p>
<table><tr><th>Aspect</th><th>Presents the action as</th><th>Tenses</th></tr>
<tr><td>Imperfective</td><td>going on, from inside</td><td>present, imperfect</td></tr>
<tr><td>Perfective</td><td>a single whole, from outside</td><td>aorist</td></tr>
<tr><td>Stative</td><td>a state resulting from it</td><td>perfect, pluperfect</td></tr></table>
<p>An English speaker naturally hears "he loosed" and thinks: past. A Greek reader hears <span class="gk">ἔλυσεν</span> and thinks: presented as one complete act. The two often coincide. They are not the same claim, and where they come apart is where careful reading pays.</p>
<h3>A warning about the words</h3>
<p>Black calls the three aspects imperfective, <i>aoristic</i> and <i>perfective</i> — so in his usage "perfective" means the perfect, not the aorist. Most modern grammars use perfective for the aorist, which is what this course does.</p>
<p>Neither is wrong; they are simply different conventions, and you will meet both. When you read Black, translate.</p>
<h3>Time is only fixed in the indicative</h3>
<p>Outside the indicative mood, the tense is telling you about aspect and almost nothing about time. An aorist participle is not automatically past. An aorist infinitive is not past at all — you saw that in Philippians, where <span class="gk">τὸ ἀποθανεῖν</span> is not "to have died".</p>
<p>This is why chapter 21 said the infinitive is the easiest place to see aspect. There is no time there to distract you.</p>
<h3>Two sets of endings</h3>
<p><b>Primary</b> endings appear on the tenses whose indicative refers to present or future time: present, future, perfect. <b>Secondary</b> endings appear on the past-time tenses: imperfect, aorist, pluperfect. Those also take the <b>augment</b>, an <span class="gk">ἐ</span> prefixed to the stem.</p>
<p>This is worth more than it looks. Spotting an augment and a secondary ending tells you "past" before you have identified the verb, the person, or even the word. You are reading the shape before you read the word, which is what fluency in an inflected language actually consists of.</p>
<h3>Principal parts</h3>
<p>Each verb has up to six principal parts — the building blocks every other form is made from: present, future, aorist active, perfect active, perfect middle/passive, aorist passive.</p>
<p>For <span class="gk">λύω</span>: <span class="gk">λύω, λύσω, ἔλυσα, λέλυκα, λέλυμαι, ἐλύθην</span>.</p>
<p>Regular verbs build all six from one stem. The common irregulars have to be learned, and there is a drill here for exactly the forty-one that are worth the trouble. Take heart: there are far fewer irregular verbs in Greek than in English, and unlike English they were at least irregular on purpose.</p>
<h3>The discipline</h3>
<p>From here on, never say a form means something until you have parsed it. Not because parsing is the goal — it is not, reading is — but because the ending is where the meaning lives, and guessing from the stem is how confident mistranslations are made.</p>
<p>The endings are small. The payoff is the whole language.</p>`,
v:[],
vids:[{t:"Lecture 2: The Greek Verbal System",s:"Daily Dose of Greek — Rob Plummer (11:36)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-2/"}],
quiz:[
{q:"Parsing a Greek verb means naming:",o:["Tense and voice","Person, number, tense, voice and mood","Stem and ending","Case, number and gender"],a:1,w:"All five. Every finite Greek verb form encodes person, number, tense, voice and mood in one word.",sec:0},
{q:"The aorist presents an action as:",o:["Going on","A single whole","A completed state","Future"],a:1,w:"Perfective aspect: viewed from outside, as one complete act. That is a claim about presentation, not necessarily about time.",sec:1},
{q:"Black uses the word perfective for which tense?",o:["The aorist","The perfect","The present","The imperfect"],a:1,w:"Black calls the aorist aoristic and reserves perfective for the perfect. Most modern grammars, and this course, use perfective for the aorist. Translate as you read him.",sec:2},
{q:"Where is time actually fixed by the tense form?",o:["Everywhere","Only in the indicative","Only in participles","Nowhere"],a:1,w:"Only in the indicative. Elsewhere the tense is telling you about aspect, which is why an aorist participle is not automatically past.",sec:3},
{q:"Augment plus secondary endings signals:",o:["Future time","Past time","Passive voice","The subjunctive"],a:1,w:"Past time — imperfect, aorist or pluperfect. Recognising the shape before you recognise the word is most of what reading an inflected language is.",sec:4},
{q:"How many principal parts does a Greek verb have?",o:["Three","Four","Up to six","As many as needed"],a:2,w:"Up to six: present, future, aorist active, perfect active, perfect middle/passive, aorist passive. Regular verbs build all six from one stem.",sec:5}]},
{id:3,t:"Present and future active indicative",s:"λύω and λύσω — your first two paradigms",
body:`<p>Here is your first paradigm. Learn it properly and the next dozen come much more easily, because most of them are variations on it.</p>
<p><span class="gk">λύω</span> — I loose, untie</p>
<table><tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>1st</th><td class="g">λύω</td><td class="g">λύομεν</td></tr>
<tr><th>2nd</th><td class="g">λύεις</td><td class="g">λύετε</td></tr>
<tr><th>3rd</th><td class="g">λύει</td><td class="g">λύουσι(ν)</td></tr></table>
<p>The stem is <span class="gk">λυ-</span>; everything after it is ending. The <span class="gk">ν</span> in brackets is a movable nu, added before a vowel or at a pause, and it carries no meaning at all — it is there for the ear.</p>
<p>Notice what you do <i>not</i> need. There is no word for I, you or we anywhere in that table. The ending carries it. When Greek does write out a pronoun as well, it is usually making a point of it.</p>
<h3>εἰμί — the verb to be</h3>
<p>Irregular, and about as common as a word can get. Learn it separately and learn it now.</p>
<table><tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>1st</th><td class="g">εἰμί</td><td class="g">ἐσμέν</td></tr>
<tr><th>2nd</th><td class="g">εἶ</td><td class="g">ἐστέ</td></tr>
<tr><th>3rd</th><td class="g">ἐστί(ν)</td><td class="g">εἰσί(ν)</td></tr></table>
<p class="v" data-ref="Matthew 28:6">οὐκ ἔστιν ὧδε, ἠγέρθη γὰρ</p>
<p>"He is not here, for he has been raised." Two verbs, and between them most of chapter 2: <span class="gk">ἔστιν</span> is present, <span class="gk">ἠγέρθη</span> is aorist passive with its augment showing.</p>
<p class="v" data-ref="John 6:48">ἐγώ εἰμι ὁ ἄρτος τῆς ζωῆς</p>
<p>"I am the bread of life." Here the pronoun <span class="gk">ἐγώ</span> <i>is</i> written out, even though <span class="gk">εἰμι</span> already says I. That is the emphasis I mentioned above, and in John's Gospel it is doing a great deal of work.</p>
<h3>The present is not simply "now"</h3>
<p>Greek tense encodes aspect first and time second. The present is imperfective: the action seen from inside, as going on or repeated.</p>
<p>So <span class="gk">πιστεύει</span> can be "he believes", "he is believing", or "he keeps on believing". The form does not settle which, and a translation has to choose. When a sermon leans hard on "keeps on believing", this is the grammar it is leaning on — and the honest thing to say is that the present allows it rather than requires it.</p>
<h3>The future: add σ</h3>
<p>The future active is the present with a <span class="gk">σ</span> between stem and ending.</p>
<table><tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>1st</th><td class="g">λύσω</td><td class="g">λύσομεν</td></tr>
<tr><th>2nd</th><td class="g">λύσεις</td><td class="g">λύσετε</td></tr>
<tr><th>3rd</th><td class="g">λύσει</td><td class="g">λύσουσι(ν)</td></tr></table>
<p>When that <span class="gk">σ</span> meets a stop consonant they combine, and the combinations are worth knowing because they hide the stem: <span class="gk">κ, γ, χ + σ → ξ</span> (<span class="gk">ἄγω → ἄξω</span>); <span class="gk">π, β, φ + σ → ψ</span> (<span class="gk">βλέπω → βλέψω</span>); <span class="gk">τ, δ, θ</span> simply drop (<span class="gk">πείθω → πείσω</span>).</p>
<p class="v" data-ref="Matthew 4:19">ποιήσω ὑμᾶς ἁλιεῖς ἀνθρώπων</p>
<p>"I will make you fishers of men." <span class="gk">ποιήσω</span> is <span class="gk">ποιέω</span> with the future sigma; the contract verb has lengthened its final vowel first, which is a pattern you meet properly in chapter 19.</p>
<p>Some very common verbs have futures you will simply have to learn: <span class="gk">εἰμί → ἔσομαι, γινώσκω → γνώσομαι, λαμβάνω → λήμψομαι, ὁράω → ὄψομαι</span>. Notice they are middle in form. That is a preview of chapter 12, and not something to worry about yet.</p>
<h3>Saying no</h3>
<p>Greek has two negatives and they divide by mood, not by strength.</p>
<p><span class="gk">οὐ</span> negates the indicative — a statement about what is:</p>
<p class="v" data-ref="Matthew 4:7">Οὐκ ἐκπειράσεις κύριον τὸν θεόν σου</p>
<p>"You shall not put the Lord your God to the test." A future indicative, so <span class="gk">οὐ</span>.</p>
<p><span class="gk">μή</span> negates everything else — subjunctive, imperative, infinitive, participle:</p>
<p class="v" data-ref="Matthew 6:13">καὶ μὴ εἰσενέγκῃς ἡμᾶς εἰς πειρασμόν</p>
<p>"And lead us not into temptation." That is a subjunctive, so <span class="gk">μή</span>. If you can see which negative a writer used, you already know something about the mood of the verb before you have parsed it.</p>
<p><span class="gk">οὐ</span> also changes shape to suit what follows: <span class="gk">οὐ</span> before a consonant, <span class="gk">οὐκ</span> before a smooth breathing, <span class="gk">οὐχ</span> before a rough one. Three spellings, one word.</p>
<h3>What to watch for</h3>
<p>The third person singular <span class="gk">λύει</span> and the second person singular <span class="gk">λύεις</span> differ by one letter, and you will read past that letter more than once. So will the future <span class="gk">λύσει</span>, which differs from the present <span class="gk">λύει</span> by the sigma alone.</p>
<p>There is no trick for this. It is why the grid drill exists, and why filling the table in from memory is worth more than reading it ten times.</p>`,
v:[7,10,15,21,40,62,81,122,152,173,250,254,270,212,209,319,361,368,384],
vids:[{t:"Lecture 3: Present and Future Active Indicative",s:"Daily Dose of Greek — Rob Plummer (14:16)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-3/"},
      {t:"The Greek (Active) Verb Song",s:"Daily Dose of Greek — the present active endings, sung",yt:"-L3mzNlR0Uc"},
      {t:"“Everyday” Active Indicative Verb Endings Song",s:"Daily Dose of Greek — the same endings, a second tune",yt:"B1suAd0Bhos"}],
quiz:[
{q:"Parse λύομεν.",o:["1st singular present active indicative","1st plural present active indicative","2nd plural present active indicative","1st plural future active indicative"],a:1,w:"First person plural, present, active, indicative — we loose. The ending -ομεν carries the we.",sec:0},
{q:"Why is ἐγώ written out in ἐγώ εἰμι, when εἰμι already means I am?",o:["It is required","For emphasis","It is a different verb","To mark the tense"],a:1,w:"The ending already carries the person, so writing the pronoun as well is a choice — usually an emphatic one. John 6:48 is making a point of who is speaking.",sec:1},
{q:"The Greek present tense primarily encodes:",o:["Present time","Imperfective aspect","Completed action","Future intention"],a:1,w:"Aspect first, time second. πιστεύει can be he believes, he is believing, or he keeps on believing — the form allows all three and requires none.",sec:2},
{q:"The future of βλέπω is:",o:["βλέπσω","βλέψω","βλέξω","ἐβλέψα"],a:1,w:"π + σ combine into ψ. The same happens with β and φ; κ, γ and χ give ξ; and τ, δ, θ simply drop out.",sec:3},
{q:"ἔσομαι is the future of which verb?",o:["ἔχω","εἰμί","ἔρχομαι","ἐσθίω"],a:1,w:"εἰμί. It is middle in form, like several other very common futures — a preview of chapter 12.",sec:3},
{q:"Which negative goes with a subjunctive?",o:["οὐ","μή","Either","Neither; the subjunctive is not negated"],a:1,w:"μή negates everything outside the indicative. Seeing which negative a writer used tells you something about the mood before you have parsed the verb.",sec:4},
{q:"Why is it οὐκ ἐκπειράσεις rather than οὐ ἐκπειράσεις?",o:["It is a different word","οὐκ appears before a smooth breathing","οὐκ is emphatic","It is a spelling error in some manuscripts"],a:1,w:"οὐ before a consonant, οὐκ before a smooth breathing, οὐχ before a rough one. Three spellings, one word.",sec:4},
{q:"λύει and λύσει differ how?",o:["Person","Number","Tense — the σ makes it future","Mood"],a:2,w:"One letter, and it moves the verb from present to future. This is why filling the grid in from memory is worth more than re-reading it.",sec:5}]},
{id:4,t:"Nouns of the second declension",s:"λόγος, ἔργον — and the article that parses them for you",
body:`<p>English tells you what a noun is doing by where it sits. The dog bit the man means something different from the man bit the dog, and nothing has changed but the order.</p>
<p>Greek does it with endings. That is why word order in Greek can be so free, and it is why the ending is not a detail to be got through on the way to the meaning — it <i>is</i> the meaning.</p>
<p>Nouns fall into three declensions, which are just three patterns of endings. The second is the most regular, so it comes first.</p>
<h3>λόγος — masculine</h3>
<table><tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>Nom</th><td class="g">λόγος</td><td class="g">λόγοι</td></tr>
<tr><th>Gen</th><td class="g">λόγου</td><td class="g">λόγων</td></tr>
<tr><th>Dat</th><td class="g">λόγῳ</td><td class="g">λόγοις</td></tr>
<tr><th>Acc</th><td class="g">λόγον</td><td class="g">λόγους</td></tr></table>
<p>A few nouns ending in <span class="gk">-ος</span> are feminine — <span class="gk">ἡ ὁδός</span> (way) and <span class="gk">ἡ ἔρημος</span> (wilderness) are both in this chapter. They decline exactly like <span class="gk">λόγος</span>, and only the article tells you they are feminine at all. That is the first hint of how much work the article does.</p>
<h3>The same word, three jobs</h3>
<p>Here is <span class="gk">λόγος</span> doing three different things, in three real sentences. Watch only the ending.</p>
<p class="v" data-ref="John 1:1">Ἐν ἀρχῇ ἦν ὁ λόγος</p>
<p>Nominative — the subject. "In the beginning was the Word."</p>
<p class="v" data-ref="Matthew 19:22">ἀκούσας δὲ ὁ νεανίσκος τὸν λόγον ἀπῆλθεν</p>
<p>Accusative — the object. "But when the young man heard the saying, he went away." The young man is the subject and the saying is what he heard, and you know that from <span class="gk">-ον</span> against <span class="gk">-ος</span>.</p>
<p class="v" data-ref="Luke 1:2">ὑπηρέται γενόμενοι τοῦ λόγου</p>
<p>Genitive — "having become servants of the word." The of is in the ending.</p>
<h3>ἔργον — neuter</h3>
<table><tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>Nom</th><td class="g">ἔργον</td><td class="g">ἔργα</td></tr>
<tr><th>Gen</th><td class="g">ἔργου</td><td class="g">ἔργων</td></tr>
<tr><th>Dat</th><td class="g">ἔργῳ</td><td class="g">ἔργοις</td></tr>
<tr><th>Acc</th><td class="g">ἔργον</td><td class="g">ἔργα</td></tr></table>
<p>Neuter differs from masculine only in the nominative and accusative, and in those two it has one form doing both jobs. Everywhere else the endings are identical.</p>
<p class="v" data-ref="1 Corinthians 3:14">εἴ τινος τὸ ἔργον μενεῖ</p>
<p>"If anyone's work remains." Nominative or accusative? Only the sentence can tell you, and here <span class="gk">μενεῖ</span> needs a subject, so it is nominative.</p>
<h3>A neuter plural takes a singular verb</h3>
<p>This looks like a mistake the first several times and it is not.</p>
<p class="v" data-ref="John 1:3">πάντα δι’ αὐτοῦ ἐγένετο</p>
<p>"All things came into being through him." <span class="gk">πάντα</span> is neuter plural; <span class="gk">ἐγένετο</span> is singular. Greek regularly treats a neuter plural subject as a single collective, so the verb agrees with the idea rather than the number. Do not correct it.</p>
<h3>Why lexicons list three things</h3>
<p><span class="gk">λόγος, -ου, ὁ</span> gives you the nominative, the genitive ending and the article. The genitive tells you which declension the word follows; the article tells you its gender. You need both, and neither is guessable from the nominative alone — which is why <span class="gk">ἡ ὁδός</span> exists to catch you.</p>
<p>Learn every noun in that full form from the first day. It costs a second and saves an hour.</p>
<h3>The definite article</h3>
<p>The article occurs <b>19,770</b> times in the New Testament — one word in every seven. It agrees with its noun in gender, number and case, which means that once you know the article you can read the case of almost any noun attached to one, even a noun you have never met.</p>
<p>That is the single highest return in first-year Greek. Seventeen forms, and they parse a quarter of the sentences you will read. There is a drill for exactly these seventeen, and it is worth doing until it is boring.</p>
<p>Greek has no indefinite article. <span class="gk">λόγος</span> on its own is a word or the word, and only the sentence decides.</p>
<h3>What to watch for</h3>
<p><span class="gk">λόγων</span> is genitive plural and so is <span class="gk">ἔργων</span> — the genitive plural is <span class="gk">-ων</span> in every gender and every declension you will meet. That makes it easy to spot and useless for telling you the gender, so take the gender from the article.</p>
<p>And the dative singular ends in a long vowel with an iota written underneath it: <span class="gk">λόγῳ</span>, <span class="gk">ἔργῳ</span>. It is silent, it is small, and at reading speed it looks like a plain omega. Chapter 1 said to train your eye for the subscript. This is the ending it was for.</p>`,
v:[1,4,8,12,17,20,27,31,32,46,48,51,58,67,79,82,87,88,90,127,132,144,162,167,252,210,219,276,300,330,339,412,470,471],
vids:[{t:"Lecture 4: Nouns of the Second Declension",s:"Daily Dose of Greek — Rob Plummer (18:22)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-4/"}],
quiz:[
{q:"Why can Greek word order be freer than English?",o:["It has fewer words","The ending shows what a noun is doing","It has no subject","Greek writers preferred it"],a:1,w:"The case ending carries the job. English uses position for the same purpose, which is why moving a word in English changes the meaning and moving one in Greek often does not.",sec:0},
{q:"In ἀκούσας δὲ ὁ νεανίσκος τὸν λόγον ἀπῆλθεν, what is τὸν λόγον?",o:["The subject","The object","Possessive","Indirect object"],a:1,w:"Accusative, so the object — what he heard. ὁ νεανίσκος is nominative and does the hearing.",sec:2},
{q:"How does neuter ἔργον differ from masculine λόγος?",o:["Everywhere","Only in the genitive","Only in the nominative and accusative","Only in the plural"],a:2,w:"Only there, and in those two it uses one form for both. Every other ending is identical.",sec:3},
{q:"πάντα δι’ αὐτοῦ ἐγένετο has a plural subject and a singular verb. Why?",o:["It is an error in the manuscripts","A neuter plural subject regularly takes a singular verb","πάντα is singular","The verb agrees with αὐτοῦ"],a:1,w:"Greek treats a neuter plural as a collective, so the verb agrees with the idea rather than the count. It is regular, and it is not to be corrected.",sec:4},
{q:"Why do lexicons list λόγος, -ου, ὁ rather than just λόγος?",o:["Tradition","The genitive gives the declension and the article gives the gender","To show the accent","To show the plural"],a:1,w:"Neither is guessable from the nominative — ἡ ὁδός looks masculine and is not. Learn nouns in the full form from the start.",sec:5},
{q:"Roughly how often does the definite article occur in the New Testament?",o:["One word in every twenty","One word in every seven","One word in every three","About a thousand times"],a:1,w:"19,770 times, one word in every seven. Knowing its seventeen forms lets you read the case of almost any noun attached to one.",sec:6},
{q:"What does the genitive plural ending -ων tell you about gender?",o:["Masculine","Neuter","Feminine","Nothing at all"],a:3,w:"Nothing. It is -ων in every gender and every declension, which makes it easy to spot and useless for gender. Take that from the article.",sec:7},
{q:"What does the iota written under the omega of λόγῳ signal?",o:["Nothing; it is decorative","The dative","The plural","An accent shift"],a:1,w:"The dative. It is silent and at reading speed it looks like a plain omega, which is exactly why chapter 1 said to train your eye for it.",sec:7}]},
{id:5,t:"Nouns of the first declension",s:"Mostly feminine, with a few masculines",
body:`<p>The second declension gave you <span class="gk">-ος</span> and <span class="gk">-ον</span>. The first gives you <span class="gk">-η</span> and <span class="gk">-α</span>, and its nouns are usually feminine.</p>
<p>You already know more of these than you think. <span class="gk">ἀγάπη, ἁμαρτία, βασιλεία, ἐκκλησία, δόξα, ζωή, ἡμέρα, καρδία</span> — the vocabulary of the New Testament is full of them.</p>
<h3>ἀγάπη — the basic pattern</h3>
<table><tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>Nom</th><td class="g">ἀγάπη</td><td class="g">ἀγάπαι</td></tr>
<tr><th>Gen</th><td class="g">ἀγάπης</td><td class="g">ἀγαπῶν</td></tr>
<tr><th>Dat</th><td class="g">ἀγάπῃ</td><td class="g">ἀγάπαις</td></tr>
<tr><th>Acc</th><td class="g">ἀγάπην</td><td class="g">ἀγάπας</td></tr></table>
<p class="v" data-ref="1 Corinthians 16:14">πάντα ὑμῶν ἐν ἀγάπῃ γινέσθω</p>
<p>"Let all that you do be done in love." That is the dative, with its iota subscript, sitting after <span class="gk">ἐν</span> — which is the pairing the last section of this chapter is about.</p>
<h3>Alpha or eta?</h3>
<p>The vowel depends on the letter before it, and the rule is worth knowing because it decides two of the four singular endings.</p>
<p>If the stem ends in <span class="gk">ε, ι</span> or <span class="gk">ρ</span>, the alpha is kept all the way through: <span class="gk">ἡμέρα, ἡμέρας, ἡμέρᾳ, ἡμέραν</span>.</p>
<p>Otherwise the alpha shifts to eta in the genitive and dative singular: <span class="gk">δόξα, δόξης, δόξῃ, δόξαν</span>. Note that it comes back for the accusative.</p>
<p>Everything else — the whole plural, and the nominative and accusative singular — behaves the same either way.</p>
<h3>The masculines</h3>
<p>A handful of important nouns look feminine and are not: <span class="gk">μαθητής</span> (disciple), <span class="gk">προφήτης</span> (prophet), <span class="gk">Μεσσίας</span> (Messiah).</p>
<p>They decline in this declension but take the masculine article, and the article is how you know. <span class="gk">ὁ μαθητής</span>, never <span class="gk">ἡ μαθητής</span>. This is the second time the article has settled a gender the ending could not, and it will not be the last.</p>
<h3>The genitive plural always has a circumflex</h3>
<p>Every first-declension noun ends its genitive plural in <span class="gk">-ῶν</span>, with a circumflex, wherever the accent falls in the rest of the word. <span class="gk">ἀγαπῶν</span> from <span class="gk">ἀγάπη</span>; <span class="gk">ἡμερῶν</span> from <span class="gk">ἡμέρα</span>.</p>
<p>It is one of the few accent rules worth learning as a rule, because it never varies and it identifies the form on sight.</p>
<h3>Four prepositions worth meeting now</h3>
<p>A preposition tells you how its noun relates to the rest of the sentence, and in Greek it fixes that noun's case. These four take one case each, which makes them the most reliable case signposts in the text.</p>
<table><tr><th>Preposition</th><th>Case</th><th>Core sense</th></tr>
<tr><td class="g">ἐν</td><td>dative</td><td>in, on, among</td></tr>
<tr><td class="g">εἰς</td><td>accusative</td><td>into, to, for</td></tr>
<tr><td class="g">ἐκ</td><td>genitive</td><td>out of, from</td></tr>
<tr><td class="g">ἀπό</td><td>genitive</td><td>away from</td></tr></table>
<p>Read a preposition together with the noun it governs, as one unit, rather than as a word on its own: <span class="gk">ἐν τῷ οἴκῳ</span> is a single idea. <span class="gk">ἐκ</span> becomes <span class="gk">ἐξ</span> before a vowel, for the same reason <span class="gk">οὐ</span> becomes <span class="gk">οὐκ</span>.</p>
<p>Once you can see a preposition and predict the case that follows it, you are reading ahead of the sentence rather than behind it.</p>
<h3>What to watch for</h3>
<p class="v" data-ref="Hebrews 13:25">ἡ χάρις μετὰ πάντων ὑμῶν</p>
<p>"Grace be with you all." <span class="gk">χάρις</span> is not first declension at all — it is third, which is chapter 17 — and it is a good reminder that a noun ending in a vowel is not automatically first declension. The article and the genitive in the lexicon entry are what settle it.</p>
<p>And <span class="gk">ἀγάπῃ</span> against <span class="gk">ἀγάπη</span>: dative against nominative, one silent letter apart, and the difference between love acting and love being acted in.</p>`,
v:[0,5,9,18,26,44,57,59,89,91,92,98,111,119,121,138,140,147,153,157,159,178,180,181,182,260,201,297,304,189,206,324,322,329,347,400,208,409,418,417,435,221,448,461,464,473,472,474,475,477,476],
vids:[{t:"Lecture 5: Nouns of the First Declension",s:"Daily Dose of Greek — Rob Plummer (16:35)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-5/"},
      {t:"Amazing Greek: 1st and 2nd Declension Nouns",s:"Daily Dose of Greek — both declensions to Amazing Grace",yt:"GJ5AAMQhrqM"}],
quiz:[
{q:"First declension nouns are usually which gender?",o:["Masculine","Feminine","Neuter","It varies evenly"],a:1,w:"Feminine, with a handful of important masculines like μαθητής and προφήτης that take the masculine article.",sec:0},
{q:"Why is it ἡμέρας but δόξης in the genitive singular?",o:["ἡμέρα is irregular","The stem of ἡμέρα ends in ρ, so the alpha is kept","δόξα is masculine","Accent placement"],a:1,w:"After ε, ι or ρ the alpha is kept throughout. Otherwise it shifts to eta in the genitive and dative singular — and comes back for the accusative.",sec:2},
{q:"How do you know μαθητής is masculine?",o:["The ending","The article — ὁ μαθητής","The accent","The genitive plural"],a:1,w:"The article. The ending looks feminine; the article settles it, as it did for ἡ ὁδός in chapter 4.",sec:3},
{q:"What is always true of a first declension genitive plural?",o:["It ends -ας","It ends -ῶν with a circumflex","It has no accent","It is identical to the nominative"],a:1,w:"-ῶν with a circumflex, wherever the accent falls elsewhere in the word. One of the few accent rules worth learning as a rule.",sec:4},
{q:"Which case does ἐν take?",o:["Genitive","Dative","Accusative","Any of them"],a:1,w:"Dative, always. ἐν, εἰς, ἐκ and ἀπό each take one case only, which makes them the most reliable case signposts in the text.",sec:5},
{q:"Why does ἐκ become ἐξ before a vowel?",o:["It is a different word","For the same reason οὐ becomes οὐκ — ease of sound","It marks a different case","Manuscript variation"],a:1,w:"Sound, not grammar. Greek adjusts small words to what follows them; you saw the same with οὐ, οὐκ and οὐχ in chapter 3.",sec:5},
{q:"χάρις ends in a vowel sound. Is it first declension?",o:["Yes","No — it is third declension","Only in the plural","Only when feminine"],a:1,w:"Third, which is chapter 17. A noun ending in a vowel is not automatically first declension; the genitive and the article in the lexicon entry are what settle it.",sec:6}]},
{id:6,t:"Adjectives of the first and second declension",s:"Attributive versus predicate",
body:`<p>Adjectives use endings you already know. A first-and-second declension adjective takes second declension endings for masculine and neuter and first declension endings for feminine, so <span class="gk">ἀγαθός, ἀγαθή, ἀγαθόν</span> is three familiar patterns rather than a new one.</p>
<p>An adjective agrees with its noun in <b>gender, number and case</b>. That is the easy part, and it is not what this chapter is about.</p>
<p>What matters here is <i>position</i> — where the adjective sits in relation to the article — because in Greek that is not a matter of style. It changes what the sentence claims.</p>
<h3>Attributive: inside the article-noun unit</h3>
<p>If the adjective is immediately preceded by an article, it is modifying the noun. It describes.</p>
<p class="v" data-ref="Mark 5:8">τὸ πνεῦμα τὸ ἀκάθαρτον</p>
<p>"The unclean spirit." The article is repeated before the adjective, which is the commonest way Greek marks this, and it puts a little weight on the description.</p>
<p class="v" data-ref="John 10:11">ἐγώ εἰμι ὁ ποιμὴν ὁ καλός</p>
<p>"I am the good shepherd." Same construction. Not <i>a</i> shepherd who happens to be good, but the shepherd, the good one.</p>
<h3>Predicate: outside it</h3>
<p>If the adjective is <i>not</i> preceded by an article while the noun is, the adjective is not describing the noun. It is asserting something about it — and Greek supplies the verb to be without writing it.</p>
<p class="v" data-ref="Matthew 5:5">μακάριοι οἱ πραεῖς</p>
<p>"Blessed <i>are</i> the meek." There is no verb on the page. <span class="gk">μακάριοι</span> has no article, <span class="gk">οἱ πραεῖς</span> has one, and that is the whole signal. It is a statement, not a description — which is why the Beatitudes land as pronouncements rather than as a list of adjectives.</p>
<h3>The test</h3>
<p>Is the adjective immediately preceded by an article?</p>
<p>Yes: <b>attributive</b>. It describes, and you translate it as an adjective — the good shepherd.</p>
<p>No, while the noun has one: <b>predicate</b>. It asserts, and you supply is or are — the shepherd is good.</p>
<p>That is the entire rule, and it is worth more than it looks. A great many arguments about a verse come down to whether an adjective is describing or asserting, and the article settles it before any of the theology starts.</p>
<h3>Substantival: the adjective becomes the noun</h3>
<p>Give an adjective an article and no noun at all, and it becomes a noun itself.</p>
<p>Look at <span class="gk">οἱ πραεῖς</span> again in that verse from Matthew. There is no word for people in it. The article plus a masculine plural adjective is enough: <i>the meek ones</i>, <i>the meek</i>.</p>
<p>You will meet this constantly. <span class="gk">ὁ ἅγιος</span>, the holy one. <span class="gk">οἱ ἅγιοι</span>, the saints. <span class="gk">τὸ ἀγαθόν</span>, the good — the thing that is good, neuter because it is an abstraction rather than a person.</p>
<p>The gender is doing real work there. Masculine plural for people, neuter singular for a quality or a thing. When you meet an article with no noun after it, read the gender first.</p>
<h3>What to watch for</h3>
<p>Word order alone will not tell you which position you are looking at. <span class="gk">ὁ ἀγαθὸς ἄνθρωπος</span> and <span class="gk">ὁ ἄνθρωπος ὁ ἀγαθός</span> are both attributive and both mean the good man; the adjective has moved and nothing has changed.</p>
<p>Only the article decides. Look for it, not for the position on the line — and where the noun has no article at all, the construction is ambiguous and the context is all you have.</p>`,
v:[64,100,101,125,143,158,164,168,248,228,229,226,227,289,309,317,323,320,344,357,369,374,447,444,487,488,490,486,489],
vids:[{t:"Lecture 6: Adjectives of the First and Second Declension",s:"Daily Dose of Greek — Rob Plummer (17:09)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-6/"}],
quiz:[
{q:"An adjective agrees with its noun in:",o:["Gender and number","Gender, number and case","Case only","Number and case"],a:1,w:"All three. That part is mechanical; what this chapter is about is position, which is not.",sec:0},
{q:"In τὸ πνεῦμα τὸ ἀκάθαρτον, the adjective is:",o:["Attributive — the unclean spirit","Predicate — the spirit is unclean","Substantival","Ambiguous"],a:0,w:"Attributive: the article is repeated before it. It describes the noun rather than asserting something about it.",sec:1},
{q:"μακάριοι οἱ πραεῖς has no verb. Why not?",o:["It was lost in copying","The adjective is predicate, so Greek supplies 'are'","It is a fragment","μακάριοι is a verb"],a:1,w:"Predicate position: the adjective has no article while the noun does, so Greek supplies the verb to be. Blessed are the meek.",sec:2},
{q:"What is the test for attributive against predicate?",o:["Word order","Whether an article immediately precedes the adjective","The accent","The gender"],a:1,w:"The article, and only the article. ὁ ἀγαθὸς ἄνθρωπος and ὁ ἄνθρωπος ὁ ἀγαθός are both attributive despite the different order.",sec:3},
{q:"οἱ πραεῖς has no noun in it. What supplies one?",o:["A word left out by the scribe","The article plus the adjective's gender and number","The previous verse","Nothing; it is incomplete"],a:1,w:"An article with an adjective and no noun makes the adjective a noun. Masculine plural gives you the meek ones.",sec:4},
{q:"τὸ ἀγαθόν is neuter singular. What does that tell you?",o:["It refers to one man","It is an abstraction — the good, that which is good","It is plural in meaning","It is feminine in disguise"],a:1,w:"Neuter singular for a quality or a thing, masculine plural for people. When an article has no noun after it, read the gender first.",sec:4},
{q:"ὁ ἄνθρωπος ἀγαθός means:",o:["The good man","The man is good","A good man","The man, the good one"],a:1,w:"Predicate — the adjective has no article, so it asserts. The man is good. Moving ἀγαθός in front of ἄνθρωπος without an article would not change that.",sec:5}]},
{id:7,t:"Imperfect and aorist active indicative",s:"Past time, and the aspect distinction that matters more",
body:`<p>Two past tenses, and the difference between them is not when the action happened. Both are past. The difference is how the writer chose to present it, which is what chapter 2 called aspect — and this is the chapter where that stops being theory.</p>
<h3>The imperfect: inside the action</h3>
<p>Built from the present stem, with two changes: an augment on the front and secondary endings on the back.</p>
<table><tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>1st</th><td class="g">ἔλυον</td><td class="g">ἐλύομεν</td></tr>
<tr><th>2nd</th><td class="g">ἔλυες</td><td class="g">ἐλύετε</td></tr>
<tr><th>3rd</th><td class="g">ἔλυε(ν)</td><td class="g">ἔλυον</td></tr></table>
<p>First person singular and third person plural are both <span class="gk">ἔλυον</span>. Nothing in the form separates them; the sentence has to.</p>
<h3>The augment</h3>
<p>An <span class="gk">ἐ-</span> on the front, marking past time in the indicative. Three things happen to it in practice.</p>
<p>If the verb already begins with a short vowel, that vowel lengthens instead of taking a prefix: <span class="gk">ἀκούω → ἤκουον</span>.</p>
<p>If it begins with a long vowel or a long diphthong there is nothing left to lengthen, so the past looks exactly like the present. <span class="gk">εὑρίσκω</span> keeps its <span class="gk">εὑ-</span> throughout, and the ending is then the only thing telling you the tense.</p>
<p>And with a compound verb the augment goes <i>inside</i>, after the preposition:</p>
<p class="v" data-ref="Matthew 8:16">ἐξέβαλεν τὰ πνεύματα λόγῳ</p>
<p>"He cast out the spirits with a word." The verb is <span class="gk">ἐκβάλλω</span>; the augment has landed between <span class="gk">ἐκ-</span> and the stem. This is what makes compound verbs awkward to look up, because the form on the page no longer starts with the letters the lexicon lists.</p>
<h3>What the imperfect is for</h3>
<p>It is the past tense of the imperfective aspect: the camera inside the action rather than outside it. Ongoing, repeated, attempted, or simply held open.</p>
<p class="v" data-ref="Matthew 4:11">ἄγγελοι προσῆλθον καὶ διηκόνουν αὐτῷ</p>
<p>"Angels came and were ministering to him." Both verbs are past, and they are not the same kind of past. <span class="gk">προσῆλθον</span> is aorist — they came, one event, done. <span class="gk">διηκόνουν</span> is imperfect — and the ministering does not close. Most translations say <i>were ministering</i> or <i>began to minister</i> for exactly that reason.</p>
<p>Mark uses the imperfect constantly for vivid narrative. When an author switches between the two, the switch is usually doing something, and it is worth stopping to ask what.</p>
<h3>The aorist: the whole thing at once</h3>
<p>Augment, stem, a <span class="gk">σα</span> marker, and secondary endings.</p>
<table><tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>1st</th><td class="g">ἔλυσα</td><td class="g">ἐλύσαμεν</td></tr>
<tr><th>2nd</th><td class="g">ἔλυσας</td><td class="g">ἐλύσατε</td></tr>
<tr><th>3rd</th><td class="g">ἔλυσε(ν)</td><td class="g">ἔλυσαν</td></tr></table>
<p>The aorist presents the action as a single whole, viewed from outside. That is all it claims. It does not say the action was quick, or once only, or finished — those are things the sentence may tell you, and the tense does not.</p>
<p>This matters more than almost anything else in first-year Greek, because sermons are built on the opposite claim all the time. The aorist is not the once-for-all tense. It is the tense that declines to comment.</p>
<h3>What to watch for</h3>
<p class="v" data-ref="Matthew 5:2">ἐδίδασκεν αὐτούς</p>
<p>"He was teaching them" — the sentence that opens the Sermon on the Mount. An aorist there would have said he taught them, and closed it. The imperfect holds it open, and everything that follows is what he was saying.</p>
<p>The two traps are mechanical. <span class="gk">ἔλυον</span> is first singular or third plural, and you cannot tell from the word. And a verb beginning with a long vowel has no visible augment at all, so an imperfect can look exactly like a present until you read the ending.</p>`,
v:[86,96,131,372,371,496,495,494],
vids:[{t:"Lecture 7: Imperfect and Aorist Active Indicative",s:"Daily Dose of Greek — Rob Plummer (23:20)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-7/"},
      {t:"Jingle Bells Aorist Active and Middle Song",s:"Daily Dose of Greek — aorist active and middle endings",yt:"FPWHsfdjuMg"}],
quiz:[
{q:"What separates the imperfect from the aorist?",o:["When the action happened","How the writer presents it — aspect","One is passive","One is a mood"],a:1,w:"Both are past. The imperfect views the action from inside as ongoing; the aorist views it as a single whole from outside.",sec:0},
{q:"ἔλυον is which person and number?",o:["First singular","Third plural","Either — the form does not say","Second plural"],a:2,w:"Both first singular and third plural are ἔλυον. Nothing in the form separates them, so the sentence has to.",sec:1},
{q:"Why does ἀκούω become ἤκουον rather than ἐάκουον?",o:["It is irregular","A short initial vowel lengthens instead of taking a prefix","The augment was lost","η is easier to say"],a:1,w:"The augment lengthens a short initial vowel rather than being prefixed to it. And a long initial vowel has nothing left to lengthen, so the past can look exactly like the present.",sec:2},
{q:"In ἐξέβαλεν, where has the augment gone?",o:["Onto the front of the whole word","Between the preposition and the stem","Nowhere; there is none","Onto the ending"],a:1,w:"Inside the compound, after ἐκ-. This is why compound verbs are awkward to look up: the form no longer begins with the letters the lexicon lists.",sec:2},
{q:"In ἄγγελοι προσῆλθον καὶ διηκόνουν αὐτῷ, why do translations often render the second verb 'were ministering'?",o:["It is plural","It is imperfect, so the action is presented as open","It is passive","It is a different tense entirely"],a:1,w:"προσῆλθον is aorist — one event, closed. διηκόνουν is imperfect, and the ministering does not close. The switch between them is doing something.",sec:3},
{q:"What does the aorist claim about an action?",o:["That it happened once and for all","That it was quick","That it is presented as a single whole","That it is finished with continuing results"],a:2,w:"Only that it is viewed as a whole, from outside. It is not the once-for-all tense; that claim is made about it constantly and the grammar does not support it.",sec:4},
{q:"Matthew 5:2 has ἐδίδασκεν rather than an aorist. What does that do?",o:["Nothing; they are interchangeable","It holds the teaching open, and what follows is what he was saying","It makes it passive","It moves it into the present"],a:1,w:"An aorist would have said he taught them and closed it. The imperfect holds it open — and the Sermon on the Mount follows.",sec:5},
{q:"A verb beginning with a long vowel has no visible augment. What tells you the tense?",o:["The accent","The ending","Nothing can","The context alone"],a:1,w:"The secondary ending. εὑρίσκω keeps its εὑ- throughout, so the ending is the only thing distinguishing the imperfect from the present.",sec:5}]},
{id:8,t:"Additional prepositions",s:"Case changes the meaning",
body:`<p>Many Greek prepositions take more than one case, and the case changes the meaning. This is a place where a lazy reading goes wrong quickly.</p>
<table>
<tr><th>Prep</th><th>+ Gen</th><th>+ Dat</th><th>+ Acc</th></tr>
<tr><td class="g">διά</td><td>through</td><td>—</td><td>because of</td></tr>
<tr><td class="g">κατά</td><td>down from, against</td><td>—</td><td>according to</td></tr>
<tr><td class="g">μετά</td><td>with</td><td>—</td><td>after</td></tr>
<tr><td class="g">παρά</td><td>from (a person)</td><td>with, at the side of</td><td>alongside; contrary to</td></tr>
<tr><td class="g">ὑπέρ</td><td>on behalf of</td><td>—</td><td>above, beyond</td></tr>
<tr><td class="g">ὑπό</td><td>by (agent)</td><td>—</td><td>under</td></tr>
<tr><td class="g">ἐπί</td><td>on, over</td><td>on, at</td><td>on, to, against</td></tr></table>
<h3>More single-case prepositions</h3>
<p>You met <span class="gk">ἐν, εἰς, ἐκ</span> and <span class="gk">ἀπό</span> in chapter 5. These join them, and they too take one case only.</p>
<p><b>Genitive only:</b> <span class="gk">πρό</span> (before), <span class="gk">ἀντί</span> (instead of).<br>
<b>Dative only:</b> <span class="gk">σύν</span> (with).<br>
<b>Accusative only:</b> <span class="gk">πρός</span> (to, toward), <span class="gk">ἀνά</span> (up, among).</p>
<p>Because <span class="gk">ἐν</span> is always dative and <span class="gk">εἰς</span> always accusative, those two remain the most reliable signposts in the text.</p>
<h3>Compound verbs</h3>
<p>A great many New Testament verbs are a preposition glued to the front of a simple verb, and the preposition usually still carries its own sense. <span class="gk">βάλλω</span> "I throw" gives <span class="gk">ἐκβάλλω</span> "I throw out"; <span class="gk">ἔρχομαι</span> "I come" gives <span class="gk">εἰσέρχομαι</span> (in), <span class="gk">ἐξέρχομαι</span> (out), <span class="gk">ἀπέρχομαι</span> (away) and <span class="gk">προσέρχομαι</span> (toward). Learn the simple verb and you have read a dozen.</p>
<p>Two things follow. The augment goes on the <b>verb</b>, not the front of the word, so the aorist of <span class="gk">ἀποθνῄσκω</span> is <span class="gk">ἀπέθανον</span> with the vowel tucked inside — worth remembering when you are hunting for a stem. And a compound sometimes drifts away from the sum of its parts, so the preposition is a strong hint and never a proof.</p>`,
v:[19,22,24,37,38,50,68,80,105,126,145,247,198,336,446,507,506],
vids:[{t:"Lecture 8: Additional Prepositions",s:"Daily Dose of Greek — Rob Plummer (17:43)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-8/"}],
quiz:[
{q:"διὰ τοῦτο (accusative) means:",o:["through this","because of this","with this","after this"],a:1,w:"διά with the accusative means 'because of'. With the genitive it means 'through'. Same word, different case, different logic.",sec:0},
{q:"Which preposition always takes the dative?",o:["εἰς","ἐν","πρός","ἐκ"],a:1,w:"ἐν is invariably dative — which makes it one of the most useful case-signals in the NT.",sec:1},
{q:"ὑπό with the genitive most often marks:",o:["Location under something","The agent of a passive verb","Purpose","Time"],a:1,w:"'By' — the personal agent of a passive verb. With the accusative it means physically 'under'.",sec:0},
{q:"The aorist of ἀποθνῄσκω is ἀπέθανον, not ἠποθνῃσκον. Why?",o:["It is irregular and simply has to be learned","The augment goes on the verb, inside the compound, not on the preposition","Compound verbs take no augment","The preposition is dropped in the aorist"],a:1,w:"A compound is a preposition plus a verb, and the augment attaches to the verb. Expect to find it tucked inside the word — which is where to look when you are hunting for the stem.",sec:2}]},

{id:9,t:"Personal pronouns",s:"ἐγώ, σύ, αὐτός — and the three uses of αὐτός",
body:`<p>Pronouns stand in for nouns, and Greek's are everywhere: <span class="gk">αὐτός</span> alone occurs about 5,600 times. The case comes from the pronoun's own job in its clause; gender and number come from the word it replaces.</p>
<table><caption>ἐγώ — I / ἡμεῖς — we</caption>
<tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>Nom</th><td class="g">ἐγώ</td><td class="g">ἡμεῖς</td></tr>
<tr><th>Gen</th><td class="g">ἐμοῦ (μου)</td><td class="g">ἡμῶν</td></tr>
<tr><th>Dat</th><td class="g">ἐμοί (μοι)</td><td class="g">ἡμῖν</td></tr>
<tr><th>Acc</th><td class="g">ἐμέ (με)</td><td class="g">ἡμᾶς</td></tr></table>
<table><caption>σύ — you / ὑμεῖς — you (plural)</caption>
<tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>Nom</th><td class="g">σύ</td><td class="g">ὑμεῖς</td></tr>
<tr><th>Gen</th><td class="g">σοῦ (σου)</td><td class="g">ὑμῶν</td></tr>
<tr><th>Dat</th><td class="g">σοί (σοι)</td><td class="g">ὑμῖν</td></tr>
<tr><th>Acc</th><td class="g">σέ (σε)</td><td class="g">ὑμᾶς</td></tr></table>
<p>The bracketed short forms are unaccented and lean on the previous word; they are the normal choice. The long forms carry emphasis or follow prepositions.</p>
<p><span class="gk">αὐτός, αὐτή, αὐτό</span> declines exactly like the article pattern you know (<span class="gk">αὐτός, αὐτοῦ, αὐτῷ, αὐτόν…</span>), with the neuter <span class="gk">αὐτό</span> — no ν, like <span class="gk">τό</span>.</p>
<h3>The three uses of αὐτός</h3>
<p><b>1. Personal pronoun</b> (the overwhelming majority): <span class="gk">εἶδον αὐτόν</span> — "I saw him".</p>
<p><b>2. Intensive</b>, in predicate position: <span class="gk">αὐτὸς ὁ κύριος</span> — "the Lord <i>himself</i>" (1 Thess 4:16).</p>
<p><b>3. Identical</b>, in attributive position: <span class="gk">ὁ αὐτὸς κύριος</span> — "the <i>same</i> Lord" (1 Cor 12:5). Position relative to the article decides between 2 and 3 — the same rule as adjectives.</p>
<h3>Emphatic subjects</h3>
<p>The verb ending already tells you the subject, so a nominative pronoun is never required. When it appears, it is emphatic: <span class="gk">ἐγὼ ἐβάπτισα ὑμᾶς ὕδατι, αὐτὸς δὲ βαπτίσει ὑμᾶς ἐν πνεύματι ἁγίῳ</span> — "<i>I</i> baptised you with water, but <i>he</i> will baptise you with the Holy Spirit" (Mark 1:8). Most of the ἐγώ εἰμι sayings in John carry this weight — though a pronoun the syntax requires is not emphatic just by being there.</p>`,
v:[2,3,6],
vids:[{t:"Lecture 9: Personal Pronouns",s:"Daily Dose of Greek — Rob Plummer (15:17)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-9/"},
      {t:"Come Thou Personal Pronouns Song",s:"Daily Dose of Greek — ἐγώ and σύ, sung through",yt:"v2cqHDo2vZw"}],
quiz:[
{q:"ὁ αὐτὸς κύριος means:",o:["The Lord himself","The same Lord","His Lord","The Lord alone"],a:1,w:"Attributive position (article immediately before αὐτός) = 'same'. Predicate position (αὐτὸς ὁ κύριος) = 'himself'.",sec:1},
{q:"Since verb endings already mark the subject, an explicit ἐγώ or σύ is:",o:["Required for clarity","A politeness marker","Emphatic","Colloquial"],a:2,w:"Emphatic. When Jesus says ἐγώ εἰμι, the pronoun is doing deliberate work — the ending alone would have sufficed for 'I am'.",sec:2},
{q:"μου, μοι, με differ from ἐμοῦ, ἐμοί, ἐμέ in that they are:",o:["Plural","Unaccented and unemphatic","Older forms","Only used with prepositions"],a:1,w:"The short enclitic forms are the everyday ones; the long forms carry stress or follow prepositions.",sec:0},
{q:"ὑμῶν is:",o:["Genitive plural of σύ","Genitive plural of ἐγώ","Dative plural of σύ","Accusative plural of ἐγώ"],a:0,w:"'Of you (all)' — as in ὁ πατὴρ ὑμῶν, 'your Father'. ἡμῶν is 'our'. One vowel apart; readers confuse them for years, so nail it now.",sec:0}]},

{id:10,t:"Perfect and pluperfect active indicative",s:"Completed action, continuing results",
body:`<p>The perfect is the most theologically loaded tense in the New Testament. It presents an action <b>completed in the past with results continuing in the present</b>. <span class="gk">γέγραπται</span> is not just "it was written" but "it stands written" — written then, authoritative now. <span class="gk">τετέλεσται</span> (John 19:30): finished then, finished still.</p>
<h3>The form: reduplication + κ</h3>
<p>The perfect doubles the initial consonant with ε (<span class="gk">λύω → λέλυκα</span>, <span class="gk">πιστεύω → πεπίστευκα</span>) and adds κ before the ending:</p>
<table><caption>λέλυκα — I have loosed</caption>
<tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>1st</th><td class="g">λέλυκα</td><td class="g">λελύκαμεν</td></tr>
<tr><th>2nd</th><td class="g">λέλυκας</td><td class="g">λελύκατε</td></tr>
<tr><th>3rd</th><td class="g">λέλυκε(ν)</td><td class="g">λελύκασι(ν)</td></tr></table>
<p>Verbs beginning with a vowel lengthen it instead of reduplicating: <span class="gk">ἀγαπάω → ἠγάπηκα</span>. Verbs beginning with φ, θ, χ reduplicate with the smooth partner: <span class="gk">φανερόω → πεφανέρωκα</span>. Some perfects lack the κ ("second perfects"): <span class="gk">γέγονα</span> from γίνομαι, <span class="gk">ἀκήκοα</span> from ἀκούω.</p>
<p>A special case worth knowing: <span class="gk">οἶδα</span> ("I know") is perfect in form but present in meaning, and it is everywhere.</p>
<h3>The pluperfect</h3>
<p>Past completed action with results continuing <i>in the past</i>: "had loosed". Augment + reduplication + κ + secondary endings: <span class="gk">ἐλελύκειν, ἐλελύκεις, ἐλελύκει…</span> It is rare (under 90 NT occurrences) — recognise it, don't drill it. <span class="gk">ᾔδειν</span>, the pluperfect of οἶδα, simply means "I knew".</p>
<h3>Don't over-preach it</h3>
<p>The perfect's force is real but not magic. Some perfects are simply how a verb is idiomatically used. Ask whether the author chose the form for its weight before building a sermon point on it.</p>`,
v:[13,53],
vids:[{t:"Lecture 10: Perfect and Pluperfect Active Indicative",s:"Daily Dose of Greek — Rob Plummer (21:20)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-10/"}],
quiz:[
{q:"γέγραπται carries the sense:",o:["It was written once","It stands written","It will be written","Someone used to write"],a:1,w:"Perfect: completed act, abiding result. This is why the formula introduces Scripture citations — what was written remains in force.",sec:0},
{q:"The two form-markers of the perfect active are:",o:["Augment and σ","Reduplication and κ","Augment and θη","Reduplication and σ"],a:1,w:"λέ-λυ-κ-α: reduplicated initial consonant plus κ. The augment belongs to past-time indicative tenses; the perfect instead reduplicates.",sec:1},
{q:"οἶδα is perfect in form but functions as:",o:["A future","A present — 'I know'","An imperative","A pluperfect"],a:1,w:"One of the most common verbs in the NT. Its pluperfect ᾔδειν likewise just means 'I knew'.",sec:2},
{q:"The pluperfect expresses:",o:["Ongoing past action","Completed action with results continuing in the past","Future certainty","Timeless truth"],a:1,w:"'Had loosed' — the perfect's completed-with-results idea, shifted back a step. Rare enough that recognition is the goal.",sec:2}]},

{id:11,t:"Demonstrative pronouns",s:"οὗτος and ἐκεῖνος — this and that",
body:`<p>Greek points with two words: <span class="gk">οὗτος</span> ("this", near) and <span class="gk">ἐκεῖνος</span> ("that", far). Both decline with endings you already know from the article and αὐτός.</p>
<table><caption>οὗτος — singular</caption>
<tr><th></th><th>Masc</th><th>Fem</th><th>Neut</th></tr>
<tr><th>Nom</th><td class="g">οὗτος</td><td class="g">αὕτη</td><td class="g">τοῦτο</td></tr>
<tr><th>Gen</th><td class="g">τούτου</td><td class="g">ταύτης</td><td class="g">τούτου</td></tr>
<tr><th>Dat</th><td class="g">τούτῳ</td><td class="g">ταύτῃ</td><td class="g">τούτῳ</td></tr>
<tr><th>Acc</th><td class="g">τοῦτον</td><td class="g">ταύτην</td><td class="g">τοῦτο</td></tr></table>
<p>Plural: <span class="gk">οὗτοι, αὗται, ταῦτα</span> and so on. Two patterns to spot: the forms mirror the article (rough breathing where the article lacks τ, initial τ elsewhere), and the first vowel echoes the ending's vowel — ου before ο-endings, αυ before α/η-endings. <span class="gk">ἐκεῖνος</span> is fully regular: <span class="gk">ἐκεῖνος, ἐκείνη, ἐκεῖνο</span>.</p>
<h3>Position</h3>
<p>With a noun, demonstratives take <b>predicate position</b> — outside the article group — yet still mean "this X": <span class="gk">οὗτος ὁ ἄνθρωπος</span> or <span class="gk">ὁ ἄνθρωπος οὗτος</span>, "this man". Standing alone, they are pronouns: <span class="gk">οὗτός ἐστιν ὁ υἱός μου</span> — "this is my Son" (Matt 3:17).</p>
<h3>Watch the breathing</h3>
<p><span class="gk">αὕτη</span> (rough breathing) is "this woman/this"; <span class="gk">αὐτή</span> (smooth) is "she". <span class="gk">ταῦτα</span> ("these things") is not <span class="gk">ταύτας</span> ("these", fem acc pl). Small marks, different words — a place where careful reading pays.</p>
<h3>ἐκεῖνος in John</h3>
<p>John uses <span class="gk">ἐκεῖνος</span> with unusual frequency, sometimes as a weighty "he" — of Christ (1 John 2:6) and of the Spirit (John 16:13-14). When you meet it, ask who is being pointed at from a distance.</p>`,
v:[235,55,56,99,115,165,171,241,193,200,271,273,275,280,216,293,312,316,321,341,218,422,434,441,442,479,213,480,478],
vids:[{t:"Lecture 11: Demonstrative Pronouns",s:"Daily Dose of Greek — Rob Plummer (12:22)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-11/"}],
quiz:[
{q:"οὗτος ὁ λόγος means:",o:["The word itself","This word","The same word","A certain word"],a:1,w:"Demonstrative in predicate position still translates 'this'. αὐτός in that position would be 'itself' — the two look alike until you check the breathing and stem.",sec:1},
{q:"αὕτη differs from αὐτή how?",o:["No difference","αὕτη is 'this' (demonstrative); αὐτή is 'she'","αὕτη is plural","αὐτή is accusative"],a:1,w:"Rough breathing marks the demonstrative. The pair is a standing test of whether you're really reading the diacritics.",sec:2},
{q:"ταῦτα, one of the commonest forms in the NT, means:",o:["This woman","These things","The same things","Those men"],a:1,w:"Neuter plural of οὗτος: 'after these things' (μετὰ ταῦτα) stitches together John's narrative.",sec:2},
{q:"ἐκεῖνος points to:",o:["Something near","Something far / previously mentioned","The speaker","Something owned"],a:1,w:"'That one.' John gives it theological weight — of Christ and the Spirit — so distance can be dignity, not remoteness.",sec:0}]},

{id:12,t:"Present middle and passive indicative",s:"Where English has no equivalent",
body:`<p>Greek has three voices. Active: the subject acts. Passive: the subject is acted upon. <b>Middle</b>: the subject acts with some special reference to itself — and English has nothing quite like it.</p>
<p>In the present and imperfect, middle and passive share identical forms. Only context tells you which is meant.</p>
<table><caption>λύομαι — present middle/passive</caption>
<tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>1st</th><td class="g">λύομαι</td><td class="g">λυόμεθα</td></tr>
<tr><th>2nd</th><td class="g">λύῃ</td><td class="g">λύεσθε</td></tr>
<tr><th>3rd</th><td class="g">λύεται</td><td class="g">λύονται</td></tr></table>
<h3>Deponent verbs</h3>
<p>Some verbs appear only in middle or passive form but are active in meaning: <span class="gk">ἔρχομαι</span> (I come), <span class="gk">γίνομαι</span> (I become), <span class="gk">ἀποκρίνομαι</span> (I answer), <span class="gk">πορεύομαι</span> (I go). Don't try to squeeze a passive sense out of these — they simply are how those verbs work.</p>
<p>Many grammarians now prefer to call these "middle-only" verbs rather than deponent, arguing that Greek's middle was always broader than the traditional label suggests. If a commentary makes a point about a "true middle", that debate is what lies behind it.</p>`,
v:[23,28,65,104,243,194,294,299,306,211,377,391,403,436,497],
vids:[{t:"Lecture 12: Present Middle and Passive Indicative",s:"Daily Dose of Greek — Rob Plummer (14:35)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-12/"},
      {t:"Present Middle/Passive Endings Memory Device",s:"Daily Dose of Greek — a hook for -ομαι, -ῃ, -εται",yt:"NUq-8hvNgqU"},
      {t:"Mnemonic Song for the Middle-Passive Endings",s:"Daily Dose of Greek — the same set, sung",yt:"4t5dSkwrMqk"}],
quiz:[
{q:"ἔρχομαι is middle in form. What does it mean?",o:["I am come (passive)","I come (active meaning)","I come for myself","I am being sent"],a:1,w:"A deponent, or middle-only, verb. Middle form, active meaning. Forcing a passive sense onto it produces nonsense.",sec:1},
{q:"In the present tense, middle and passive forms are:",o:["Always different","Identical — context decides","Distinguished by the augment","Distinguished by accent"],a:1,w:"Identical in the present, imperfect, perfect and pluperfect. Only the aorist and the future distinguish them.",sec:0},
{q:"The middle voice indicates the subject:",o:["Is acted upon","Acts with special reference to itself","Acts on a plural object","Is in the past"],a:1,w:"Roughly — the subject has a particular stake or involvement in the action. English needs a paraphrase to catch it.",sec:0}]},

{id:13,t:"Perfect middle/passive and future middle",s:"Endings straight onto the stem",
body:`<p>The perfect middle/passive is the easiest paradigm you will ever learn: reduplicate, then add the basic middle endings <b>directly to the stem</b> — no connecting vowel, no tense sign.</p>
<table><caption>λέλυμαι — I have been loosed</caption>
<tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>1st</th><td class="g">λέλυμαι</td><td class="g">λελύμεθα</td></tr>
<tr><th>2nd</th><td class="g">λέλυσαι</td><td class="g">λέλυσθε</td></tr>
<tr><th>3rd</th><td class="g">λέλυται</td><td class="g">λέλυνται</td></tr></table>
<p>Those endings — <span class="gk">-μαι, -σαι, -ται, -μεθα, -σθε, -νται</span> — are the skeleton of every middle/passive primary tense; here you see them with nothing in the way. <span class="gk">γέγραπται</span> from lesson 10 is exactly this form: γε-γραπ-ται.</p>
<h3>Future middle</h3>
<p>Future stem (σ) + the same endings with a connecting vowel:</p>
<table><caption>λύσομαι — I will loose (for myself)</caption>
<tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>1st</th><td class="g">λύσομαι</td><td class="g">λυσόμεθα</td></tr>
<tr><th>2nd</th><td class="g">λύσῃ</td><td class="g">λύσεσθε</td></tr>
<tr><th>3rd</th><td class="g">λύσεται</td><td class="g">λύσονται</td></tr></table>
<p>Its real importance: many common verbs use a middle future with active meaning — <span class="gk">ἔσομαι</span> (I will be), <span class="gk">γνώσομαι</span> (I will know), <span class="gk">ὄψομαι</span> (I will see), <span class="gk">λήμψομαι</span> (I will receive). Note <span class="gk">ἔσται</span>, "he/it will be", drops the connecting vowel — you will meet it constantly.</p>
<h3>Reading note</h3>
<p>The perfect middle and perfect passive are identical in form. <span class="gk">λέλυμαι</span> could be "I have loosed for myself" or "I have been loosed"; only context decides. In practice the passive sense dominates in the NT.</p>`,
v:[16,36,49,83,95,107,109,114,240,177,155,314,315,343,342,375,416],
vids:[{t:"Lecture 13: Perfect Middle and Passive, Future Middle Indicative",s:"Daily Dose of Greek — Rob Plummer (9:47)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-13/"}],
quiz:[
{q:"The perfect middle/passive attaches its endings:",o:["With a connecting vowel","With the σ tense sign","Directly to the reduplicated stem","With θη"],a:2,w:"λέ-λυ-μαι. No connecting vowel, no tense sign — which is why this paradigm shows you the bare middle endings.",sec:0},
{q:"γέγραπται parses as:",o:["Present middle 3sg","Perfect middle/passive 3sg","Aorist passive 3sg","Pluperfect active 3sg"],a:1,w:"Reduplication (γε-) + stem + -ται. 'It stands written' — the citation formula is a perfect passive.",sec:0},
{q:"ἔσται means:",o:["He was","He will be","He is","Let him be"],a:1,w:"Future of εἰμί, 3rd singular, with no connecting vowel. καὶ ἔσται — 'and it shall be' — echoes through the prophets' citations.",sec:1},
{q:"γνώσομαι is best translated:",o:["I will know","I will be known","I knew for myself","Know!"],a:0,w:"Middle in form, active in meaning — one of several everyday verbs whose future is middle. Form ≠ force; the lexicon has the last word.",sec:1}]},

{id:14,t:"Imperfect middle/passive, aorist middle, pluperfect middle/passive",s:"The secondary middle endings",
body:`<p>One set of secondary middle endings — <span class="gk">-μην, -σο, -το, -μεθα, -σθε, -ντο</span> — serves three paradigms. Learn it once, use it three times.</p>
<table><caption>ἐλυόμην — imperfect middle/passive: I was being loosed</caption>
<tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>1st</th><td class="g">ἐλυόμην</td><td class="g">ἐλυόμεθα</td></tr>
<tr><th>2nd</th><td class="g">ἐλύου</td><td class="g">ἐλύεσθε</td></tr>
<tr><th>3rd</th><td class="g">ἐλύετο</td><td class="g">ἐλύοντο</td></tr></table>
<p>The 2nd singular <span class="gk">ἐλύου</span> looks odd because σ dropped out between vowels and ε+ο contracted (ἐλύεσο → ἐλύου). That happens wherever a thematic vowel leaves the σ between vowels — so in the imperfect and the aorist middle, but not in the perfect and pluperfect, where the ending goes straight onto the stem and the σ survives: <span class="gk">λέλυσαι</span>, <span class="gk">ἐλέλυσο</span>.</p>
<table><caption>ἐλυσάμην — aorist middle: I loosed (for myself)</caption>
<tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>1st</th><td class="g">ἐλυσάμην</td><td class="g">ἐλυσάμεθα</td></tr>
<tr><th>2nd</th><td class="g">ἐλύσω</td><td class="g">ἐλύσασθε</td></tr>
<tr><th>3rd</th><td class="g">ἐλύσατο</td><td class="g">ἐλύσαντο</td></tr></table>
<p><b>The aorist middle is not passive.</b> The aorist and the future are the two tense-families where middle and passive have fully distinct forms (the aorist passive, with θη, comes next lesson). <span class="gk">ἐλύσατο</span> is "he loosed for himself", never "he was loosed".</p>
<p>Second aorists take the imperfect's connecting vowel with these endings on the aorist stem: <span class="gk">ἐγενόμην</span> (γίνομαι), "I became" — one of the commonest verbs in the NT: <span class="gk">καὶ ἐγένετο</span>, "and it came to pass".</p>
<h3>Pluperfect middle/passive</h3>
<p>For recognition only: reduplication + secondary middle endings straight on the stem — <span class="gk">ἐλελύμην, ἐλέλυσο, ἐλέλυτο…</span> A handful of NT occurrences.</p>`,
v:[75,124,154,284,290,298,509,380,467,508],
vids:[{t:"Lecture 14: Imperfect Middle and Passive, Aorist Middle, Pluperfect Middle and Passive",s:"Daily Dose of Greek — Rob Plummer (15:32)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-14/"},
      {t:"Imperfect Middle-Passive Memory Device",s:"Daily Dose of Greek — the secondary middle endings",yt:"4ytjsQSWDkQ"}],
quiz:[
{q:"ἐγένετο parses as:",o:["Imperfect m/p 3sg of γίνομαι","Aorist middle 3sg of γίνομαι","Aorist passive 3sg","Perfect middle 3sg"],a:1,w:"Second aorist middle: aorist stem γεν- + connecting vowel + -το. 'And it came to pass' opens scene after scene of narrative.",sec:0},
{q:"In the aorist, middle and passive are:",o:["Identical in form","Fully distinct forms","Both marked with θη","Both marked with σα"],a:1,w:"Shared with the future, and with no other tense-family. σα + middle endings = aorist middle, θη = aorist passive; σ + middle endings = future middle, θησ = future passive. Present, imperfect, perfect and pluperfect share one m/p form.",sec:0},
{q:"The 2nd singular ἐλύου arose because:",o:["The σ of -σο dropped and vowels contracted","It borrows from the imperative","The augment absorbed it","It is irregular"],a:0,w:"ἐλύεσο → ἐλύεο → ἐλύου. Knowing this one sound-change explains the odd 2nd singulars of the imperfect and the aorist middle — not the perfect and pluperfect, where the σ survives.",sec:0},
{q:"ἐλύσατο means:",o:["He was loosed","He loosed for himself","He will loose","He had been loosed"],a:1,w:"Aorist middle — subject acting with self-reference. 'He was loosed' would be ἐλύθη, the θη-passive of the next lesson.",sec:0}]},

{id:15,t:"Aorist and future passive indicative",s:"The θη that changes who does what",
body:`<p>The aorist passive is built on its own stem — the sixth principal part — marked by <b>θη</b>, and then, surprisingly, takes <i>active-looking</i> secondary endings:</p>
<table><caption>ἐλύθην — I was loosed</caption>
<tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>1st</th><td class="g">ἐλύθην</td><td class="g">ἐλύθημεν</td></tr>
<tr><th>2nd</th><td class="g">ἐλύθης</td><td class="g">ἐλύθητε</td></tr>
<tr><th>3rd</th><td class="g">ἐλύθη</td><td class="g">ἐλύθησαν</td></tr></table>
<p><span class="gk">ἐβαπτίσθη</span> — "he was baptised" (Mark 1:9). <span class="gk">ἠγέρθη</span> — "he was raised" (Matt 28:6). The resurrection is announced in this form: God is the unstated actor.</p>
<h3>Future passive</h3>
<p>θη + σ + primary middle endings:</p>
<table><caption>λυθήσομαι — I will be loosed</caption>
<tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>1st</th><td class="g">λυθήσομαι</td><td class="g">λυθησόμεθα</td></tr>
<tr><th>2nd</th><td class="g">λυθήσῃ</td><td class="g">λυθήσεσθε</td></tr>
<tr><th>3rd</th><td class="g">λυθήσεται</td><td class="g">λυθήσονται</td></tr></table>
<p><span class="gk">σωθήσεται</span> — "will be saved" (Rom 10:13; Joel's promise).</p>
<h3>Second aorist passives</h3>
<p>Some verbs drop the θ: <span class="gk">ἐγράφην</span> (γράφω), <span class="gk">ἀπεστάλην</span> (ἀποστέλλω), <span class="gk">ἐσπάρην</span> (σπείρω — the sower parable's seed "was sown"). Same endings, same meaning.</p>
<h3>Passive in form, active in sense</h3>
<p><span class="gk">ἀπεκρίθη</span> ("he answered") and <span class="gk">ἐφοβήθην</span> ("I feared") use passive forms with no passive meaning — like the middle-only verbs you know. And keep an eye out for the <b>divine passive</b>: "they shall be comforted" (Matt 5:4) names no comforter because reverent Jewish idiom leaves God unnamed. Grammar becomes theology here.</p>`,
v:[],
vids:[{t:"Lecture 15: Aorist and Future Passive Indicative",s:"Daily Dose of Greek — Rob Plummer (9:49)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-15/"}],
quiz:[
{q:"The aorist passive tense sign is:",o:["σα","κ","θη","μεν"],a:2,w:"ἐ-λύ-θη-ν. Spot θη after an augment and you have an aorist passive; θησ without augment is future passive.",sec:0},
{q:"ἠγέρθη (Matt 28:6) means:",o:["He rose (of his own power, stated)","He was raised","He will rise","Rise!"],a:1,w:"Aorist passive of ἐγείρω. The NT often frames the resurrection with God as the (sometimes unstated) actor — the passive carries that.",sec:0},
{q:"ἀπεκρίθη is passive in form. Its meaning is:",o:["He was answered","He answered","It was decided","He was questioned"],a:1,w:"Active in sense — 'deponent' in the aorist passive. Hundreds of occurrences: 'Jesus answered and said…'",sec:3},
{q:"A 'divine passive' is:",o:["A passive with θεός as subject","A passive used to avoid naming God as the actor","Any aorist passive","A passive in prayers only"],a:1,w:"'They shall be comforted, they shall be filled' — the Comforter and Filler is God, reverently unnamed. Worth noticing in the Beatitudes.",sec:3}]},

{id:16,t:"Review of the indicative mood",s:"One verb, one chart, whole system",
body:`<p>You now hold the entire indicative system of the Greek verb. Here it is in one chart — first person singular of λύω throughout:</p>
<table><caption>λύω — the indicative synopsis</caption>
<tr><th></th><th>Active</th><th>Middle</th><th>Passive</th></tr>
<tr><th>Present</th><td class="g">λύω</td><td class="g" colspan="2" style="text-align:center">λύομαι</td></tr>
<tr><th>Imperfect</th><td class="g">ἔλυον</td><td class="g" colspan="2" style="text-align:center">ἐλυόμην</td></tr>
<tr><th>Future</th><td class="g">λύσω</td><td class="g">λύσομαι</td><td class="g">λυθήσομαι</td></tr>
<tr><th>Aorist</th><td class="g">ἔλυσα</td><td class="g">ἐλυσάμην</td><td class="g">ἐλύθην</td></tr>
<tr><th>Perfect</th><td class="g">λέλυκα</td><td class="g" colspan="2" style="text-align:center">λέλυμαι</td></tr>
<tr><th>Pluperfect</th><td class="g">ἐλελύκειν</td><td class="g" colspan="2" style="text-align:center">ἐλελύμην</td></tr></table>
<h3>The parsing algorithm</h3>
<p>Faced with any indicative form, ask in order:</p>
<p><b>1. Augment?</b> Then past time: imperfect, aorist or pluperfect.<br>
<b>2. Reduplication?</b> Then perfect (or pluperfect if augmented too).<br>
<b>3. Tense sign?</b> σ = future or first aorist · κ = perfect active · θη = passive (aorist if augmented, future if followed by σ) · σα = first aorist.<br>
<b>4. Endings?</b> Primary or secondary; active or middle/passive. The ending confirms what the markers suggested and adds person and number.</p>
<p>Every indicative verb in the New Testament yields to those four questions. Speed comes from repetition — which is what the drills are for.</p>
<h3>Where time lives</h3>
<p>Remember: this tidy time-grid holds <b>only in the indicative</b>. From here the course moves to nouns of the third declension, then to the non-indicative moods, where aspect rules alone.</p>`,
v:[],
vids:[{t:"Lecture 16: Review of the Indicative Mood",s:"Daily Dose of Greek — Rob Plummer (6:57)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-16/"}],
quiz:[
{q:"Parse ἐλύθης:",o:["Aorist passive 2sg — you were loosed","Aorist middle 2sg","Imperfect active 2sg","Future passive 2sg"],a:0,w:"Augment + θη + secondary ending -ς. The algorithm: augment → past; θη → passive; -ς → second singular.",sec:0},
{q:"Parse λελύκαμεν:",o:["Aorist active 1pl","Perfect active 1pl — we have loosed","Present middle 1pl","Pluperfect active 1pl"],a:1,w:"Reduplication + κ + the primary ending -μεν. It is the ending that settles it: the pluperfect would be -ειμεν. Do not lean on the augment — 52 of the 88 pluperfects in the New Testament have none.",sec:0},
{q:"Parse λύσεται:",o:["Present middle 3sg","Future middle 3sg — he will loose (for himself)","Aorist middle 3sg","Perfect middle 3sg"],a:1,w:"σ + primary middle ending, no augment: future middle. The θη-form λυθήσεται would be the future passive.",sec:0},
{q:"Which tense pairs NEVER share middle and passive forms?",o:["Present and imperfect","Perfect and pluperfect","Aorist and future","None — all share"],a:2,w:"Aorist and future keep middle (σ/σα) and passive (θη) distinct. Everywhere else one form serves both voices.",sec:0},
{q:"A form with reduplication AND an augment is:",o:["Aorist","Perfect","Pluperfect","Impossible"],a:2,w:"ἐ-λελύκειν: both markers stack. Past completed action with past-continuing results.",sec:1}]},

{id:17,t:"Nouns of the third declension",s:"Find the stem in the genitive",
body:`<p>The third declension holds some of the weightiest words in the New Testament: <span class="gk">πνεῦμα</span> (Spirit), <span class="gk">σάρξ</span> (flesh), <span class="gk">πίστις</span> (faith), <span class="gk">χάρις</span> (grace), <span class="gk">πατήρ</span> (father), <span class="gk">βασιλεύς</span> (king). Its nominatives look chaotic; its secret is simple: <b>the stem hides in the genitive</b>, and one set of endings serves all.</p>
<p>The lexical entry gives you everything: <span class="gk">σάρξ, σαρκός, ἡ</span> — strip <span class="gk">-ος</span> from the genitive and the stem is σαρκ-.</p>
<table><caption>σάρξ, σαρκός, ἡ — flesh (stem σαρκ-)</caption>
<tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>Nom</th><td class="g">σάρξ</td><td class="g">σάρκες</td></tr>
<tr><th>Gen</th><td class="g">σαρκός</td><td class="g">σαρκῶν</td></tr>
<tr><th>Dat</th><td class="g">σαρκί</td><td class="g">σαρξί(ν)</td></tr>
<tr><th>Acc</th><td class="g">σάρκα</td><td class="g">σάρκας</td></tr></table>
<p>The nominative σάρξ is just σαρκ + ς (κ + σ → ξ), and the dative plural σαρξί(ν) is the same collision. Whenever a third-declension form puzzles you, it is usually σ doing violence to the stem's final consonant.</p>
<table><caption>πνεῦμα, πνεύματος, τό — spirit (stem πνευματ-)</caption>
<tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>Nom</th><td class="g">πνεῦμα</td><td class="g">πνεύματα</td></tr>
<tr><th>Gen</th><td class="g">πνεύματος</td><td class="g">πνευμάτων</td></tr>
<tr><th>Dat</th><td class="g">πνεύματι</td><td class="g">πνεύμασι(ν)</td></tr>
<tr><th>Acc</th><td class="g">πνεῦμα</td><td class="g">πνεύματα</td></tr></table>
<p>Every <span class="gk">-μα</span> noun works like this — <span class="gk">ὄνομα</span> (name), <span class="gk">ῥῆμα</span> (word), <span class="gk">σῶμα</span> (body) — and all are neuter, so nominative = accusative as always.</p>
<h3>Two more patterns worth meeting now</h3>
<p><span class="gk">πίστις, πίστεως, ἡ</span>: the large family of <span class="gk">-ις/-εως</span> feminines — πίστις, πίστεως, πίστει, πίστιν; plural πίστεις, πίστεων, πίστεσι(ν), πίστεις. <span class="gk">κρίσις</span>, <span class="gk">δύναμις</span>, <span class="gk">ἀνάστασις</span> all follow.</p>
<p><span class="gk">πατήρ, πατρός, ὁ</span>: the family words — πατήρ, πατρός, πατρί, πατέρα; vocative <span class="gk">πάτερ</span>, as in the Lord's Prayer.</p>
<h3>The article carries you</h3>
<p>You need not master every sub-pattern. <span class="gk">τῷ</span> before any third-declension form tells you dative singular whatever the noun does. This is why you drilled the article until it was automatic.</p>`,
v:[43,45,61,66,70,71,85,93,94,205,108,116,129,130,133,139,170,196,253,255,203,266,272,285,281,287,204,328,337,352,223,365,373,389,407,424,460,202,452,482,484,485,234,481,483],
vids:[{t:"Lecture 17: Nouns of the Third Declension",s:"Daily Dose of Greek — Rob Plummer (20:21)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-17/"},
      {t:"3rd Declension Song",s:"Daily Dose of Greek — the third declension endings, sung",yt:"Wt1HmUStGgw"}],
quiz:[
{q:"Where do you find a third-declension noun's stem?",o:["The nominative singular","The genitive singular minus -ος","The dative plural","The article"],a:1,w:"σαρκός → σαρκ-. This is why lexical entries always give the genitive: the nominative often disguises the stem.",sec:0},
{q:"πνεύμασι(ν) is:",o:["Genitive singular","Dative plural","Accusative plural","Nominative plural"],a:1,w:"Dative plural: stem πνευματ- + σι, with the τ dropping before σ. 'In/by the spirits.'",sec:0},
{q:"Why does the nominative of σαρκ- end in ξ?",o:["It is irregular","κ + ς → ξ","The κ dropped","Ionic spelling"],a:1,w:"The nominative ς collides with the stem's final κ. The same collision produces the dative plural σαρξί(ν).",sec:0},
{q:"πίστιν is:",o:["Accusative singular of πίστις","Dative plural","Genitive singular","Nominative plural"],a:0,w:"The -ις/-εως family takes -ιν in the accusative singular: τὴν πίστιν. Its genitive πίστεως is worth recognising on sight.",sec:1},
{q:"The vocative of πατήρ, used in the Lord's Prayer, is:",o:["πατήρ","πατρός","πάτερ","πατέρα"],a:2,w:"Πάτερ ἡμῶν — 'Our Father'. One of the few vocatives you'll meet weekly.",sec:1}]},

{id:18,t:"Adjectives, pronouns, and numerals of the first and third declensions",s:"πᾶς, εἷς, οὐδείς — small words, large claims",
body:`<p>A few indispensable words mix third-declension forms (masculine and neuter) with first-declension forms (feminine). Chief among them: <span class="gk">πᾶς, πᾶσα, πᾶν</span> — "all, every" — some 1,240 occurrences.</p>
<table><caption>πᾶς — singular</caption>
<tr><th></th><th>Masc</th><th>Fem</th><th>Neut</th></tr>
<tr><th>Nom</th><td class="g">πᾶς</td><td class="g">πᾶσα</td><td class="g">πᾶν</td></tr>
<tr><th>Gen</th><td class="g">παντός</td><td class="g">πάσης</td><td class="g">παντός</td></tr>
<tr><th>Dat</th><td class="g">παντί</td><td class="g">πάσῃ</td><td class="g">παντί</td></tr>
<tr><th>Acc</th><td class="g">πάντα</td><td class="g">πᾶσαν</td><td class="g">πᾶν</td></tr></table>
<p>Plural: <span class="gk">πάντες, πᾶσαι, πάντα</span>; genitive <span class="gk">πάντων, πασῶν, πάντων</span>; dative <span class="gk">πᾶσι(ν), πάσαις, πᾶσι(ν)</span>. The stem παντ- meets σ the way the last lesson described, only more so: the whole ντ cluster goes, and the α lengthens to make up for it — παντ- + σι gives <span class="gk">πᾶσι(ν)</span>, not πανσι.</p>
<h3>How πᾶς reads</h3>
<p>Without the article in the <b>singular</b>: "every" (<span class="gk">πᾶν δένδρον</span>, every tree). Without the article in the <b>plural</b> it is "all" (<span class="gk">πάντες ἥμαρτον</span>, all sinned). With the article, the position decides: predicate <span class="gk">πᾶσα ἡ πόλις</span> is "all the city", attributive <span class="gk">ἡ πᾶσα πόλις</span> is "the whole city" (<span class="gk">πᾶσα ἡ πόλις</span>, all the city; <span class="gk">πᾶσα γραφή</span>, 2 Tim 3:16 — famously articleless: "every scripture" or "all scripture"? The grammar allows both; context and usage must decide. Now you can see why the commentaries argue).</p>
<h3>One — and no one</h3>
<table><caption>εἷς, μία, ἕν — one</caption>
<tr><th></th><th>Masc</th><th>Fem</th><th>Neut</th></tr>
<tr><th>Nom</th><td class="g">εἷς</td><td class="g">μία</td><td class="g">ἕν</td></tr>
<tr><th>Gen</th><td class="g">ἑνός</td><td class="g">μιᾶς</td><td class="g">ἑνός</td></tr>
<tr><th>Dat</th><td class="g">ἑνί</td><td class="g">μιᾷ</td><td class="g">ἑνί</td></tr>
<tr><th>Acc</th><td class="g">ἕνα</td><td class="g">μίαν</td><td class="g">ἕν</td></tr></table>
<p><span class="gk">εἷς</span> (rough breathing) is "one"; <span class="gk">εἰς</span> (smooth, no accent) is the preposition "into". <span class="gk">κύριος εἷς ἐστιν</span> — "the Lord is one." Add οὐδέ or μηδέ and you get <span class="gk">οὐδείς, οὐδεμία, οὐδέν</span> — "no one, nothing" — declined the same way (μηδείς in non-indicative contexts).</p>
<h3>πολύς and μέγας</h3>
<p>"Much/many" and "great" are ordinary second/first-declension adjectives except in four slots each — masculine and neuter, nominative and accusative singular — which give three forms apiece: <span class="gk">πολύς, πολύν, πολύ</span> and <span class="gk">μέγας, μέγαν, μέγα</span> (the neuter nominative and accusative are identical, as always). Everything else is regular: <span class="gk">πολλοῦ, πολλῷ, μεγάλου, μεγάλῳ…</span></p>
<h3>Comparison of adjectives</h3>
<p>Greek adjectives have three degrees. The comparative normally adds <span class="gk">-τερος, -α, -ον</span> to the masculine stem and the superlative <span class="gk">-τατος, -η, -ον</span>; a short vowel before the ending lengthens, which is why <span class="gk">σοφός</span> gives <span class="gk">σοφώτερος</span> rather than σοφότερος; both then decline as ordinary first-and-second-declension adjectives.</p>
<table>
<tr><th>Positive</th><th>Comparative</th><th>Superlative</th></tr>
<tr><td class="g">δίκαιος</td><td class="g">δικαιότερος</td><td class="g">δικαιότατος</td></tr>
<tr><td class="g">ἰσχυρός</td><td class="g">ἰσχυρότερος</td><td class="g">ἰσχυρότατος</td></tr>
<tr><td class="g">σοφός</td><td class="g">σοφώτερος</td><td class="g">σοφώτατος</td></tr></table>
<p>The commonest are irregular and worth knowing on sight: <span class="gk">ἀγαθός → κρείττων</span> (better — also spelled <span class="gk">κρείσσων</span>, and you will meet both), <span class="gk">κακός → χείρων</span> (worse), <span class="gk">μέγας → μείζων</span> (greater), <span class="gk">πολύς → πλείων</span> (more).</p>
<p>Two cautions for reading. The thing compared against stands either in the genitive — <span class="gk">μείζων τούτων</span>, "greater than these" — or after <span class="gk">ἤ</span>, "than". And in Koine the superlative is fading, further than "fading" suggests: the New Testament has <b>265</b> comparatives to <b>42</b> superlatives, and of those only <b>four</b> are formed with the regular <span class="gk">-τατος</span> ending you have just learned — <span class="gk">ἀκριβεστάτην</span> (Acts 26:5), <span class="gk">ἁγιωτάτῃ</span> (Jude 20) and <span class="gk">τιμιωτάτου</span> and <span class="gk">τιμιωτάτῳ</span> in Revelation. So learn the ending to recognise it, and expect the work to be done by a comparative instead: <span class="gk">μείζων</span> means "greatest" as readily as "greater", and the context decides, not the ending.</p>
<h3>Numbers to recognise</h3>
<p><span class="gk">δύο</span> (two), <span class="gk">τρεῖς, τρία</span> (three), <span class="gk">τέσσαρες, τέσσαρα</span> (four), <span class="gk">πέντε</span> (five), <span class="gk">ἑπτά</span> (seven), <span class="gk">δώδεκα</span> (twelve). From πέντε up to a hundred they don't decline; the hundreds and thousands (<span class="gk">διακόσιοι, χίλιοι, μύριοι</span>) do. Met mostly in feeding crowds and numbering apostles.</p>`,
v:[14,41,47,60,63,120,242,261,274,390,398,443,232],
vids:[{t:"Lecture 18: Adjectives, Pronouns, and Numerals of the First and Third Declensions",s:"Daily Dose of Greek — Rob Plummer (21:20)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-18/"}],
quiz:[
{q:"εἷς differs from εἰς in that εἷς:",o:["Is the preposition 'into'","Is the numeral 'one' (rough breathing)","Is plural","Means 'if'"],a:1,w:"The breathing and accent are the whole difference. ἄκουε, Ἰσραήλ· κύριος εἷς ἐστιν — the Shema needs the numeral, not the preposition.",sec:2},
{q:"οὐδέν means:",o:["No one (masculine)","Nothing (neuter)","Never","Not yet"],a:1,w:"Neuter of οὐδείς. χωρὶς ἐμοῦ οὐ δύνασθε ποιεῖν οὐδέν — 'apart from me you can do nothing' (John 15:5).",sec:2},
{q:"πᾶσι(ν) is:",o:["Genitive plural","Dative plural masculine/neuter","Accusative singular","Nominative plural feminine"],a:1,w:"Stem παντ- + σι. The whole ντ cluster drops before σ and the α lengthens to compensate: παντ- + σι gives πᾶσι(ν). Dropping only the τ would leave πανσι.",sec:0},
{q:"πᾶσα γραφή (2 Tim 3:16) is grammatically:",o:["Unambiguously 'all Scripture'","Unambiguously 'every scripture'","Open: 'every scripture' or 'all Scripture' — usage and context decide","A scribal error"],a:2,w:"Anarthrous πᾶς usually reads 'every', but abstract or collective nouns blur it. Knowing the grammar means knowing where the real argument lies.",sec:1},
{q:"μείζων is the comparative of μέγας. In Koine, how safe is it to translate it 'greater' rather than 'greatest'?",o:["Entirely safe — the comparative never means 'greatest'","Not safe: the superlative is fading, and a comparative often does superlative work","Only in John","Safe in the plural only"],a:1,w:"Koine is losing the superlative, and comparative forms regularly carry superlative force. The ending narrows the options; the context decides between them.",sec:4}]},

{id:19,t:"Contract and liquid verbs",s:"Why ἀγαπάω never looks like ἀγαπάω",
body:`<p>Verbs whose stems end in α, ε or ο <b>contract</b> that vowel with the connecting vowel in the present and imperfect. You never meet <span class="gk">ἀγαπάω</span> on the page — only its contracted forms. Lexicons list the uncontracted form so you can tell which class a verb belongs to.</p>
<table><caption>Present active — the three classes</caption>
<tr><th></th><th>ἀγαπάω (α)</th><th>ποιέω (ε)</th><th>πληρόω (ο)</th></tr>
<tr><th>1sg</th><td class="g">ἀγαπῶ</td><td class="g">ποιῶ</td><td class="g">πληρῶ</td></tr>
<tr><th>2sg</th><td class="g">ἀγαπᾷς</td><td class="g">ποιεῖς</td><td class="g">πληροῖς</td></tr>
<tr><th>3sg</th><td class="g">ἀγαπᾷ</td><td class="g">ποιεῖ</td><td class="g">πληροῖ</td></tr>
<tr><th>1pl</th><td class="g">ἀγαπῶμεν</td><td class="g">ποιοῦμεν</td><td class="g">πληροῦμεν</td></tr>
<tr><th>2pl</th><td class="g">ἀγαπᾶτε</td><td class="g">ποιεῖτε</td><td class="g">πληροῦτε</td></tr>
<tr><th>3pl</th><td class="g">ἀγαπῶσι(ν)</td><td class="g">ποιοῦσι(ν)</td><td class="g">πληροῦσι(ν)</td></tr></table>
<p>Rules worth carrying: <b>ε + ε → ει</b>, <b>ε + ο → ου</b>, <b>ο + anything short → ου</b>, <b>α + e-sound → long α</b>, <b>α + o-sound → ω</b>, and ω swallows everything. But honestly: learn the three columns above by sound, and the rules become descriptions rather than tools.</p>
<h3>Outside the present, contraction disappears</h3>
<p>Before a tense sign the stem vowel usually lengthens: <span class="gk">ἀγαπήσω, ἠγάπησα, ἠγάπηκα</span>; <span class="gk">ποιήσω, ἐποίησα</span>; <span class="gk">πληρώσω, ἐπλήρωσα</span>. A handful of ε-contracts keep the vowel short instead — <span class="gk">καλέω</span> gives <span class="gk">καλέσω, ἐκάλεσα</span>, and <span class="gk">τελέω</span> does the same. Learn those as they come. So the aorist of a contract verb is perfectly regular — the present is the only battlefield.</p>
<h3>Liquid verbs</h3>
<p>Stems ending in λ, μ, ν, ρ refuse the σ of the future. Instead they form an ε-contract future: <span class="gk">μένω → μενῶ</span> ("I will remain" — accent alone distinguishes it from the present μένω), <span class="gk">ἀγγέλλω → ἀγγελῶ</span>. Their aorists also dodge σ, compensating by lengthening the stem: <span class="gk">ἔμεινα</span> (I remained), <span class="gk">ἤγγειλα</span> (I announced), <span class="gk">ἦρα</span> from αἴρω.</p>
<p>These two families cover an enormous share of NT vocabulary — ἀγαπάω, ζητέω, καλέω, λαλέω, ποιέω, τηρέω, φανερόω, μένω, ἀποστέλλω, ἐγείρω, κρίνω all live here.</p>`,
v:[29,39,54,74,106,110,112,118,123,135,137,142,150,160,172,174,184,190,245,249,207,263,267,268,286,282,291,302,318,333,340,214,364,363,379,386,387,397,192,399,405,433,431,427,465,498,500,502,504,501,499,503,505],
vids:[{t:"Lecture 19: Contract and Liquid Verbs",s:"Daily Dose of Greek — Rob Plummer (42:00)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-19/"}],
quiz:[
{q:"ποιεῖτε comes from ε + ε contracting to:",o:["η","ει","ου","ω"],a:1,w:"ποιέ-ετε → ποιεῖτε. ε+ε→ει and ε+ο→ου do most of the work in the ε-class, the largest of the three.",sec:0},
{q:"The aorist of ἀγαπάω is:",o:["ἠγάπησα","ἠγάπασα","ἀγάπησα","ἠγαπῶσα"],a:0,w:"Augment + stem with lengthened vowel (α→η) + σα. Outside the present system, contract verbs behave themselves.",sec:1},
{q:"μενῶ differs from μένω how?",o:["It is aorist","It is the liquid future — 'I will remain'","It is subjunctive","No difference"],a:1,w:"Liquid stems reject σ, so the future is an ε-contract: μενῶ, μενεῖς, μενεῖ. In John 15 the difference between 'remain' and 'will remain' can hang on an accent.",sec:2},
{q:"ἤγγειλα is the aorist of:",o:["ἄγω","ἀγγέλλω","ἐγείρω","ἀγοράζω"],a:1,w:"A liquid aorist: no σ, stem lengthened (ε→ει). ἀπήγγειλαν — 'they reported' — is everywhere in the resurrection narratives.",sec:2}]},

{id:20,t:"Participles (verbal adjectives)",s:"The workhorse of Greek prose",
body:`<p>A participle is a verbal adjective. It has tense and voice like a verb, and gender, number and case like an adjective. Greek uses them constantly where English would use a subordinate clause.</p>
<h3>The key insight about tense</h3>
<p>Participle tense encodes <b>aspect, not time</b>. Relative time is a by-product:</p>
<ul>
<li><b>Present participle</b> — imperfective; action usually contemporaneous with the main verb. "While praying..."</li>
<li><b>Aorist participle</b> — perfective; action usually prior to the main verb. "Having prayed..."</li>
<li><b>Perfect participle</b> — stative; a completed action with a continuing state.</li>
</ul>
<p>"Usually" is doing real work in those sentences. The aorist participle is not automatically past — it is perfective, and time must be inferred from the main verb and the context.</p>
<h3>Adverbial vs adjectival</h3>
<p><b>Adverbial</b> participles modify the main verb, describing time, cause, means or manner. Usually anarthrous. <span class="gk">ἀκούσας ταῦτα ἀπῆλθεν</span> — "having heard these things, he departed."</p>
<p><b>Adjectival</b> participles modify a noun, often with an article, and can stand alone as a substantive. <span class="gk">ὁ πιστεύων</span> — "the one who believes".</p>
<h3>Genitive absolute</h3>
<p>A participle and its subject both in the genitive, the subject being <b>different from the subject of the main verb</b> — that difference is what makes the phrase absolute, and it is how you spot one: <span class="gk">ταῦτα λέγοντος αὐτοῦ κατῃσχύνοντο πάντες οἱ ἀντικείμενοι αὐτῷ</span> — "as he said this, all his opponents were put to shame" (Luke 13:17). The one speaking is <span class="gk">αὐτοῦ</span>; the ones shamed are <span class="gk">πάντες</span>. Two different subjects, and that is the whole of it. Common in narrative.</p>`,
v:[],
vids:[{t:"Lecture 20: Participles (Verbal Adjectives)",s:"Daily Dose of Greek — Rob Plummer (42:53)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-20/"}],
quiz:[
{q:"An aorist participle primarily communicates:",o:["Past time","Perfective aspect, often prior action","Ongoing action","Future action"],a:1,w:"Aspect first. Antecedent time is a common by-product, not the meaning itself.",sec:1},
{q:"ὁ πιστεύων is:",o:["An adverbial participle","A substantival participle — 'the one who believes'","A genitive absolute","An imperative"],a:1,w:"Article plus participle, no noun: it functions as a noun. Extremely common in John.",sec:2},
{q:"A genitive absolute is:",o:["A participle with no subject","A participle and its subject in the genitive, detached from the main clause","A possessive construction","A type of infinitive"],a:1,w:"Grammatically independent of the main clause, usually giving background circumstance.",sec:3},
{q:"A present participle usually describes action:",o:["Prior to the main verb","Contemporaneous with the main verb","After the main verb","Without reference to the main verb"],a:1,w:"Imperfective aspect typically yields contemporaneous time relative to the main verb.",sec:1}]},

{id:21,t:"Infinitives (verbal nouns)",s:"Verbal nouns and their many uses",
body:`<p>An infinitive is a verbal noun.</p>
<p>That is worth saying slowly, because it is doing two jobs at once. As a verb it has tense and voice, it can take an object, and it can have a subject of its own. As a noun it is neuter, it can take the article, and it can sit anywhere in a sentence that a noun can sit.</p>
<p>What it does not have is person and number. We translate <span class="gk">λύομεν</span> as "we loose" because the ending <span class="gk">-μεν</span> tells us who. An infinitive tells us nothing about who, and that is exactly what the name means: not limited.</p>
<h3>The forms</h3>
<table>
<tr><th>Tense</th><th>Active</th><th>Meaning</th></tr>
<tr><td>Present</td><td class="g">λύειν</td><td>to be loosing</td></tr>
<tr><td>Aorist</td><td class="g">λῦσαι</td><td>to loose</td></tr>
<tr><td>Perfect</td><td class="g">λελυκέναι</td><td>to have loosed</td></tr>
</table>
<p>The middle and passive forms sit alongside these in Tables, under Infinitives. Two things here are worth noticing.</p>
<p>The first is that the aorist has no augment. Infinitives never do. The augment marks past time and belongs to the indicative, and an infinitive is not making a claim about when.</p>
<p>Which is the second thing. Tense here is aspect, not time. <span class="gk">λύειν</span> does not mean "to loose in the present"; it presents the loosing as going on. <span class="gk">λῦσαι</span> presents it as a single whole. This is the easiest place in the entire verb to see what aspect actually is, precisely because there is no time getting in the way.</p>
<h3>The article makes it a noun you can use</h3>
<p>An infinitive on its own is indeclinable. Put the neuter article in front of it and the article declines instead, and its case then tells you what the infinitive is doing in the sentence.</p>
<p class="v" data-ref="Philippians 1:21">ἐμοὶ γὰρ τὸ ζῆν Χριστὸς καὶ τὸ ἀποθανεῖν κέρδος</p>
<p>"For to me, to live is Christ and to die is gain." There is no finite verb in that sentence at all. <span class="gk">τὸ ζῆν</span> and <span class="gk">τὸ ἀποθανεῖν</span> are the subjects, each turned into a noun by that small <span class="gk">τό</span>, and Christ and gain are what is said about them. We do not translate the article, but it is carrying the sentence.</p>
<p>So: <span class="gk">τοῦ</span> is genitive, <span class="gk">τῷ</span> after <span class="gk">ἐν</span> is dative, <span class="gk">τό</span> after <span class="gk">διά</span> or <span class="gk">μετά</span> is accusative. Watch the article and whatever preposition stands in front of it, and you will usually know what an infinitive is there for before you have worked out anything else about the sentence.</p>
<h3>Purpose and result</h3>
<p>Purpose is why someone acted. It can be a plain infinitive, or <span class="gk">τοῦ</span> + infinitive, or <span class="gk">εἰς τό</span> + infinitive.</p>
<p class="v" data-ref="Matthew 2:13">μέλλει γὰρ Ἡρῴδης ζητεῖν τὸ παιδίον τοῦ ἀπολέσαι αὐτό</p>
<p>"For Herod is about to search for the child in order to destroy him." The searching has a purpose, and <span class="gk">τοῦ ἀπολέσαι</span> is it.</p>
<p>Result is what actually followed, intended or not, and it is usually marked by <span class="gk">ὥστε</span>.</p>
<p class="v" data-ref="Matthew 13:32">ὥστε ἐλθεῖν τὰ πετεινὰ τοῦ οὐρανοῦ</p>
<p>"so that the birds of the air come" and nest in its branches. The mustard seed did not grow in order to house birds. That is simply what came of it.</p>
<p>Be careful here, though. Greek does not always keep purpose and result apart, and neither does English — "he came to save" can be read either way. Where an argument about a verse turns on intention, this is very often the grammar it turns on. The construction narrows the options. It does not always settle them.</p>
<h3>Time</h3>
<p>Three prepositions with the articular infinitive do most of the work: <span class="gk">πρὸ τοῦ</span> before, <span class="gk">ἐν τῷ</span> while, <span class="gk">μετὰ τό</span> after.</p>
<p>The parable of the sower puts two uses of one verb in consecutive verses, which is about as clear a demonstration as the New Testament offers. First the purpose:</p>
<p class="v" data-ref="Matthew 13:3">ἐξῆλθεν ὁ σπείρων τοῦ σπείρειν</p>
<p>"A sower went out to sow." Then, in the very next verse, the time:</p>
<p class="v" data-ref="Matthew 13:4">καὶ ἐν τῷ σπείρειν αὐτὸν</p>
<p>"And while he was sowing." Same verb, same form. The only things that have changed are the preposition and the case of the article.</p>
<p class="v" data-ref="Mark 1:14">Καὶ μετὰ τὸ παραδοθῆναι τὸν Ἰωάννην</p>
<p>"And after John was handed over." Luke in particular uses <span class="gk">ἐν τῷ</span> + infinitive constantly, so it is worth being able to recognise on sight.</p>
<h3>Cause</h3>
<p><span class="gk">διὰ τό</span> + infinitive gives the reason.</p>
<p class="v" data-ref="Luke 2:4">διὰ τὸ εἶναι αὐτὸν ἐξ οἴκου καὶ πατριᾶς Δαυίδ</p>
<p>"because he was of the house and family of David." That is Luke telling us why Joseph went up to Bethlehem rather than staying where he was.</p>
<h3>The subject goes in the accusative</h3>
<p>An infinitive has no ending to show who is doing it. So when the doer needs naming, Greek names it, and it names it in the accusative.</p>
<p>Look at that last verse again. <span class="gk">διὰ τό</span> tells us why; <span class="gk">αὐτόν</span> tells us who. "Because <b>he</b> was of the house of David." To English eyes the accusative looks like the wrong case for a subject, and it takes a few encounters before it stops looking odd. It is entirely standard.</p>
<h3>What to watch for</h3>
<p>An accusative sitting beside an infinitive is not automatically its subject. It may just as easily be its object, and the two look identical.</p>
<p class="v" data-ref="Matthew 1:19">μὴ θέλων αὐτὴν δειγματίσαι</p>
<p>"not willing to expose her." Here Joseph is the one who would be doing the exposing, and <span class="gk">αὐτήν</span> is the one it would be done to. That is an object. In Luke 2:4 the shape was the same and <span class="gk">αὐτόν</span> was the subject.</p>
<p>The grammar permits both readings. What decides between them is the sense of the sentence — and being able to say which one you have taken, and why, is most of what reading Greek carefully amounts to.</p>`,
v:[148,161,244,455,510],
vids:[{t:"Lecture 21: Infinitives (Verbal Nouns)",s:"Daily Dose of Greek — Rob Plummer (20:54)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-21/"},
      {t:"Infinitives Song",s:"Daily Dose of Greek — to the tune of Mary Had a Little Lamb",yt:"CZQ8YdVpdos"}],
quiz:[
{q:"An infinitive lacks which two things a finite verb has?",o:["Tense and voice","Person and number","Case and gender","Mood and aspect"],a:1,w:"Person and number. It keeps tense and voice, which is why it can still show aspect, but nothing in the form tells you who is doing it.",sec:0},
{q:"Why does the aorist infinitive λῦσαι have no augment?",o:["It is irregular","The augment marks past time and belongs to the indicative","Aorist infinitives are rare","The article takes its place"],a:1,w:"The augment marks past time and appears only in the indicative. An infinitive is not making a claim about when, so it has nothing to augment.",sec:1},
{q:"In τὸ ζῆν Χριστός, what is the article τό doing?",o:["Making the infinitive definite","Making the infinitive a noun, so it can be the subject","Marking past time","Nothing — it is untranslatable filler"],a:1,w:"It turns the infinitive into a noun that can take a role in the sentence. Philippians 1:21 has no finite verb at all: to live and to die are its subjects.",sec:2},
{q:"ὥστε + infinitive expresses:",o:["Purpose","Result","Time","Cause"],a:1,w:"Result — so that, with the result that. Purpose and result do overlap in Greek, and telling them apart is often an interpretive judgment rather than a grammatical one.",sec:3},
{q:"Matthew 13:3 has τοῦ σπείρειν and 13:4 has ἐν τῷ σπείρειν. What has changed?",o:["The tense","The voice","What the infinitive is doing — purpose, then time","Nothing; they are the same construction"],a:2,w:"The verb form is identical. The preposition and the case of the article change it from why he went out into when the seed fell.",sec:4},
{q:"διὰ τό + infinitive expresses:",o:["Cause","Purpose","Result","Comparison"],a:0,w:"Cause — because. Luke 2:4 gives the reason Joseph went up to Bethlehem.",sec:5},
{q:"The subject of an infinitive, when it is expressed, appears in which case?",o:["Nominative","Genitive","Dative","Accusative"],a:3,w:"Accusative. It looks wrong to English eyes and is entirely standard.",sec:6},
{q:"In μὴ θέλων αὐτὴν δειγματίσαι (Matthew 1:19), αὐτήν is:",o:["The subject of the infinitive","The object of the infinitive","In the wrong case","A possessive"],a:1,w:"The object. Joseph is the one who would do the exposing. An accusative beside an infinitive can be either subject or object, and only the sense decides.",sec:7}]},
{id:22,t:"Additional pronouns",s:"Relative, reflexive, reciprocal, interrogative",
body:`<p>Five smaller pronoun systems complete the set. One of them — the relative — you have been reading around since John 1.</p>
<h3>The relative pronoun: ὅς, ἥ, ὅ</h3>
<table><caption>who, which, that</caption>
<tr><th></th><th>Masc</th><th>Fem</th><th>Neut</th></tr>
<tr><th>Nom</th><td class="g">ὅς / οἵ</td><td class="g">ἥ / αἵ</td><td class="g">ὅ / ἅ</td></tr>
<tr><th>Gen</th><td class="g">οὗ / ὧν</td><td class="g">ἧς / ὧν</td><td class="g">οὗ / ὧν</td></tr>
<tr><th>Dat</th><td class="g">ᾧ / οἷς</td><td class="g">ᾗ / αἷς</td><td class="g">ᾧ / οἷς</td></tr>
<tr><th>Acc</th><td class="g">ὅν / οὕς</td><td class="g">ἥν / ἅς</td><td class="g">ὅ / ἅ</td></tr></table>
<p>It looks like the article without τ — but always with a rough breathing <i>and</i> an accent (which distinguishes ἥ from ἡ, and ὅ from ὁ). The rule that matters: a relative takes its <b>gender and number from its antecedent</b>, but its <b>case from its role in its own clause</b>. <span class="gk">ὁ λόγος ὃν ἤκουσας</span> — "the word which you heard": ὅν is masculine singular (agreeing with λόγος) but accusative (object of ἤκουσας).</p>
<h3>Reflexive and reciprocal</h3>
<p><span class="gk">ἐμαυτοῦ</span> (myself), <span class="gk">σεαυτοῦ</span> (yourself), <span class="gk">ἑαυτοῦ</span> (himself/herself/itself) — genitive, dative and accusative only, since a reflexive can't be a subject. <span class="gk">ἀγαπήσεις τὸν πλησίον σου ὡς σεαυτόν</span>. The plural ἑαυτῶν serves all persons. <span class="gk">ἀλλήλων</span> — "one another" — is the great ethic-word of the epistles: ἀγαπᾶτε ἀλλήλους.</p>
<h3>Interrogative and indefinite: the accent war</h3>
<p><span class="gk">τίς, τί</span> (always acute on the ι) asks "who? what? why?". Unaccented <span class="gk">τις, τι</span> means "someone, a certain, any". <span class="gk">τί ποιεῖτε;</span> — "what are you doing?" vs <span class="gk">ἄνθρωπός τις</span> — "a certain man". Both decline like third-declension stems in ν: τίνος, τίνι, τίνα.</p>
<h3>ὅστις</h3>
<p>The compound ὅς + τις — "whoever" — mostly nominative in the NT: <span class="gk">ὅστις, ἥτις, ὅτι*</span>… and in practice near-equivalent to ὅς. (*Printed ὅ τι to avoid confusion with the conjunction ὅτι.)</p>`,
v:[11,30,33,52,103,141,163,257,360,406,492,493,491],
vids:[{t:"Lecture 22: Additional Pronouns",s:"Daily Dose of Greek — Rob Plummer (21:19)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-22/"}],
quiz:[
{q:"A relative pronoun takes its case from:",o:["Its antecedent","Its role in its own clause","The main verb","The nearest article"],a:1,w:"Gender and number from the antecedent; case from its own clause. When this rule appears to break, commentators call it 'attraction' — now you can follow that footnote.",sec:1},
{q:"ἥ (with accent and rough breathing) is:",o:["The feminine article","The relative pronoun 'who/which'","'Or'","'Truly'"],a:1,w:"The article ἡ has no accent; the disjunctive ἤ ('or') has a smooth breathing. Three tiny words, three sets of marks.",sec:1},
{q:"ἀγαπᾶτε ἀλλήλους means:",o:["Love yourselves","Love one another","Love the others","Love the strangers"],a:1,w:"The reciprocal pronoun. John 13:34 — the new commandment turns on this one word.",sec:2},
{q:"τις (no accent) means:",o:["Who?","Someone / a certain","This","No one"],a:1,w:"The indefinite. Accented τίς is the question word. In editions the context and accent together keep them apart.",sec:3},
{q:"ὡς σεαυτόν (Mark 12:31) uses which pronoun?",o:["Reciprocal","Reflexive — 'as yourself'","Relative","Demonstrative"],a:1,w:"σεαυτοῦ, the second-person reflexive: the neighbour-love command points the verb back at its own subject.",sec:2}]},

{id:23,t:"The subjunctive mood",s:"Purpose, probability and exhortation",
body:`<p>The subjunctive is the mood of possibility rather than assertion. It is marked by a <b>lengthened connecting vowel</b> — omicron becomes omega, epsilon becomes eta.</p>
<table><caption>λύω — present subjunctive</caption>
<tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>1st</th><td class="g">λύω</td><td class="g">λύωμεν</td></tr>
<tr><th>2nd</th><td class="g">λύῃς</td><td class="g">λύητε</td></tr>
<tr><th>3rd</th><td class="g">λύῃ</td><td class="g">λύωσι(ν)</td></tr></table>
<p>Note that <span class="gk">λύω</span> is identical to the present active indicative. Context alone distinguishes them.</p>
<h3>Where you will meet it</h3>
<p><b>ἵνα + subjunctive</b> — purpose or result: "in order that". The single most common use, and structurally important: it tells you how two clauses relate.</p>
<p><b>ἐάν + subjunctive</b> — the third-class conditional: "if, and it may well happen".</p>
<p><b>Hortatory subjunctive</b> — 1st person plural: "let us...". <span class="gk">ἀγαπῶμεν ἀλλήλους</span> — "let us love one another".</p>
<p><b>οὐ μή + aorist subjunctive</b> — emphatic denial: "by no means will...".</p>
<h3>Why this matters for preaching</h3>
<p>Identifying a <span class="gk">ἵνα</span> clause tells you the logical spine of a sentence — what is the point and what is subordinate to it. That is structural information you can build a sermon on.</p>`,
v:[25,34,35,236,238,117,128,156,313],
vids:[{t:"Lecture 23: The Subjunctive Mood",s:"Daily Dose of Greek — Rob Plummer (18:25)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-23/"}],
quiz:[
{q:"ἵνα followed by a subjunctive usually indicates:",o:["A condition","Purpose or result","Time","Concession"],a:1,w:"'In order that.' One of the highest-frequency constructions in the NT and a reliable clue to clause structure.",sec:1},
{q:"What marks the subjunctive formally?",o:["An augment","A lengthened connecting vowel","A sigma","Reduplication"],a:1,w:"Omicron lengthens to omega, epsilon to eta. No augment, because the subjunctive has no time reference.",sec:0},
{q:"ἀγαπῶμεν ἀλλήλους is best taken as:",o:["We love one another","Let us love one another","They loved one another","Do you love one another?"],a:1,w:"A hortatory subjunctive — 1st person plural used as an exhortation. Though the form is ambiguous with the indicative, so context decides.",sec:1}]},

{id:24,t:"The imperative and optative moods",s:"Commands, prohibitions, and μὴ γένοιτο",
body:`<p>The imperative commands. Greek has second-person forms ("do this") <i>and</i> third-person forms ("let him do this") — English has to paraphrase the latter, so watch for them.</p>
<table><caption>Imperative of λύω</caption>
<tr><th></th><th>Present act.</th><th>Aorist act.</th><th>Aorist pass.</th></tr>
<tr><th>2sg</th><td class="g">λῦε</td><td class="g">λῦσον</td><td class="g">λύθητι</td></tr>
<tr><th>3sg</th><td class="g">λυέτω</td><td class="g">λυσάτω</td><td class="g">λυθήτω</td></tr>
<tr><th>2pl</th><td class="g">λύετε</td><td class="g">λύσατε</td><td class="g">λύθητε</td></tr>
<tr><th>3pl</th><td class="g">λυέτωσαν</td><td class="g">λυσάτωσαν</td><td class="g">λυθήτωσαν</td></tr></table>
<p>No augment — the aorist imperative is not past (a past command is impossible). The difference between λῦε and λῦσον is <b>aspect</b>: the present views the action as ongoing or characteristic, the aorist as a whole. <span class="gk">αἰτεῖτε… ζητεῖτε… κρούετε</span> (Matt 7:7, present): keep asking, keep seeking, keep knocking — or at least, asking as a practice; the aorist would simply say "ask".</p>
<h3>Prohibitions</h3>
<p>Two constructions, and the difference preaches: <b>μή + present imperative</b> forbids as a general practice, and can (context permitting) mean "stop doing" what is under way — <span class="gk">μὴ φοβοῦ</span>, "do not fear / stop fearing". <b>μή + aorist subjunctive</b> forbids the act outright: <span class="gk">μὴ φονεύσῃς</span>, "do not murder". That is the <i>second-person</i> rule; in the third person Greek does use the aorist imperative — <span class="gk">μὴ καταβάτω</span>, "let him not go down" (Matt 24:17), and <span class="gk">μὴ γνώτω</span> (Matt 6:3). Handle the "stop doing" nuance with care — it is a possibility the context must confirm, not a rule the form guarantees.</p>
<p>Common irregulars to know on sight: <span class="gk">γίνου</span> (become!), <span class="gk">ἴδε</span> and <span class="gk">ἰδού</span> (behold!), <span class="gk">ἄφες</span> (forgive!/let!), <span class="gk">δός</span> (give!), <span class="gk">ἐλθέτω</span> (let it come — the Lord's Prayer: ἐλθέτω ἡ βασιλεία σου).</p>
<h3>The optative</h3>
<p>The mood of wish and remote possibility — only 68 NT occurrences, so recognise rather than memorise. Its badge is <span class="gk">οι</span>, <span class="gk">ει</span> or — in the aorist active and middle — <span class="gk">αι</span>. Two forms account for about two in five: <span class="gk">εἴη</span> ("might be", 12 times) and <span class="gk">μὴ γένοιτο</span> — Paul's thunderclap in Romans, "may it never be!", the optative of γίνομαι. The <span class="gk">αι</span> forms are the ones you will preach: <span class="gk">ἁγιάσαι</span> (1 Thess 5:23), <span class="gk">κατευθύναι</span>, <span class="gk">στηρίξαι</span> and <span class="gk">παρακαλέσαι</span> (2 Thess 2:17) — benedictions, every one.</p>`,
v:[76,345,349,362,366,404,456,451,466,463],
vids:[{t:"Lecture 24: The Imperative and Optative Moods",s:"Daily Dose of Greek — Rob Plummer (25:06)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-24/"}],
quiz:[
{q:"λυέτω means:",o:["Loose!","Let him loose","He looses","He was loosing"],a:1,w:"Third-person imperative — a real command aimed at a third party. English 'let him' is a translation crutch, not permission-granting.",sec:0},
{q:"The aorist imperative λῦσον differs from present λῦε in:",o:["Time — it commands for the past","Aspect — action viewed as a whole vs ongoing","Politeness","Person"],a:1,w:"No augment, no past time. Aspect is the whole difference — which is why Matt 7:7's present imperatives are worth a sermon's attention.",sec:0},
{q:"'Do not murder' (μὴ φονεύσῃς) uses:",o:["μή + present imperative","μή + aorist subjunctive","οὐ + future indicative","μή + optative"],a:1,w:"Aorist prohibitions switch to the subjunctive. μή + present imperative is the other pattern, forbidding a practice.",sec:1},
{q:"μὴ γένοιτο is:",o:["An imperative — 'don't become'","An optative — 'may it never be!'","A subjunctive — 'lest it happen'","An indicative — 'it did not happen'"],a:1,w:"Aorist optative of γίνομαι. Paul's rhetorical recoil fourteen times in the letters — the optative's finest hour.",sec:2}]},

{id:25,t:"The conjugation of -μι verbs",s:"δίδωμι, τίθημι, ἵστημι, ἀφίημι",
body:`<p>Greek's oldest verbs attach endings directly to the stem — no connecting vowel — and their first-person singular ends in <span class="gk">-μι</span>. They are few, but they include some of the most important words in the New Testament: <span class="gk">δίδωμι</span> (give), <span class="gk">τίθημι</span> (put, place), <span class="gk">ἵστημι</span> (stand), <span class="gk">ἀφίημι</span> (forgive, leave), <span class="gk">ἀπόλλυμι</span> (destroy). You already know one: <span class="gk">εἰμί</span>.</p>
<h3>The pattern, via δίδωμι</h3>
<p>The present reduplicates with ι (δι-δω-), and the stem vowel alternates long/short:</p>
<table><caption>δίδωμι — present active</caption>
<tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>1st</th><td class="g">δίδωμι</td><td class="g">δίδομεν</td></tr>
<tr><th>2nd</th><td class="g">δίδως</td><td class="g">δίδοτε</td></tr>
<tr><th>3rd</th><td class="g">δίδωσι(ν)</td><td class="g">διδόασι(ν)</td></tr></table>
<p>The aorist is a κ-aorist — where λύω has ἔλυσα, δίδωμι has:</p>
<table><caption>ἔδωκα — I gave</caption>
<tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>1st</th><td class="g">ἔδωκα</td><td class="g">ἐδώκαμεν</td></tr>
<tr><th>2nd</th><td class="g">ἔδωκας</td><td class="g">ἐδώκατε</td></tr>
<tr><th>3rd</th><td class="g">ἔδωκε(ν)</td><td class="g">ἔδωκαν</td></tr></table>
<p><span class="gk">οὕτως γὰρ ἠγάπησεν ὁ θεὸς τὸν κόσμον, ὥστε τὸν υἱὸν τὸν μονογενῆ ἔδωκεν</span> — you have been reading this form since John 3:16.</p>
<h3>Forms to know on sight</h3>
<p><span class="gk">δός, δότε</span> — give! (aorist imperatives: δὸς ἡμῖν σήμερον…) · <span class="gk">τίθησιν</span> — he lays down (John 10: the shepherd τὴν ψυχὴν αὐτοῦ τίθησιν) · <span class="gk">ἔθηκεν</span> — he laid · <span class="gk">ἀφίενται</span> / <span class="gk">ἀφέωνται</span> — they are forgiven · <span class="gk">ἄφες ἡμῖν</span> — forgive us · <span class="gk">ἀνέστη</span> — he rose (ἵστημι's intransitive second aorist; ἀνάστηθι — rise!) · <span class="gk">παρέδωκεν</span> — he handed over (παραδίδωμι, the verb of both betrayal and Rom 8:32).</p>
<p>Strategy: learn the present and aorist of δίδωμι properly, then treat the rest as vocabulary — the lexicon and the article will carry you through the remaining forms until frequency makes them familiar.</p>`,
v:[42,73,102,113,134,151,166,183,185,277,332,396,437],
vids:[{t:"Lecture 25: The Conjugation of -μι Verbs",s:"Daily Dose of Greek — Rob Plummer (12:28)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-25/"}],
quiz:[
{q:"μι-verbs differ from λύω-type verbs chiefly by:",o:["Having no aorist","Attaching endings directly to the stem, no connecting vowel","Being passive only","Lacking an augment"],a:1,w:"Athematic conjugation — the oldest layer of the language, preserved in its commonest verbs (as English keeps 'am/is/was').",sec:0},
{q:"ἔδωκεν parses as:",o:["Aorist active 3sg of δίδωμι — 'he gave'","Imperfect of δοκέω","Perfect of δίδωμι","Aorist passive"],a:0,w:"κ-aorist: augment + δωκ + 3sg. John 3:16's central verb.",sec:1},
{q:"ἄφες in the Lord's Prayer (ἄφες ἡμῖν τὰ ὀφειλήματα) is:",o:["A noun — 'forgiveness'","Aorist imperative of ἀφίημι — 'forgive!'","Future indicative","A particle"],a:1,w:"ἀφίημι, the μι-verb of forgiving and leaving. Its κ-aorist ἀφῆκεν and passive ἀφέωνται run through the Gospels.",sec:2},
{q:"ἀνέστη means:",o:["He stood up / rose","He was destroyed","He gave back","He placed"],a:0,w:"Second aorist of ἀνίστημι, intransitive: 'he rose'. The resurrection vocabulary uses both this and ἠγέρθη.",sec:2}]},

{id:26,t:"Reading your Greek New Testament",s:"Tools, habits, and the fallacies to avoid",
body:`<p>This is the lesson the other twenty-five exist for. The grammar you now hold is enough to read the New Testament with help — and reading is the only thing that will keep it.</p>
<h3>Tools</h3>
<p>Get a <b>reader's edition</b> of the Greek NT (rare words glossed at the foot of the page) or use software: Logos, Accordance, or the free STEP Bible and Blue Letter Bible give instant parsing. Use helps to keep moving, not to avoid thinking — try the parse yourself before you tap.</p>
<p>For a daily rhythm, <b>Daily Dose of Greek</b> sends a two-minute video each weekday: Rob Plummer works through one verse, parsing as he goes. It is the single best habit-former for the year after a first course.</p>
<p>You now have enough to start reading. What follows determines whether the language survives.</p>
<h3>Read daily, in easy texts</h3>
<p>Ten minutes every day beats an hour on Saturday. Start with <b>1 John</b> — short sentences, small vocabulary, heavy repetition. Then <b>John's Gospel</b>, then <b>Mark</b>. Leave Hebrews, Luke's prologue and 2 Peter alone for now; the Greek is genuinely hard.</p>
<h3>Read forward, not sideways</h3>
<p>Resist the urge to parse every word. Read the sentence, get the sense, and only stop for words that block comprehension. Parsing everything turns reading into decoding and kills the habit.</p>
<h3>Tie it to your sermon text</h3>
<p>The single best thing you can do is read the Greek of the passage you are preaching, every week, before you consult a commentary. Even where it changes nothing in the sermon, it changes how you see the text — and it makes the language earn its keep rather than becoming a hobby that gets crowded out.</p>
<h3>Guard against the word-study fallacy</h3>
<p>Three habits to avoid: reading a word's etymology as its meaning; importing every possible sense of a word into one occurrence; and treating a grammatical category as if it settled an interpretive question. Usage in context determines meaning. If a point can't survive being stated in English, it usually wasn't in the Greek.</p>
<h3>Expect to plateau</h3>
<p>Progress in a language is not linear. There is a long stretch where you feel you're not improving, and it is exactly the stretch where quitting is most tempting and most costly. Keep the daily ten minutes and the plateau ends.</p>`,
v:[],
vids:[{t:"Lecture 26: Reading Your Greek New Testament",s:"Daily Dose of Greek — Rob Plummer (27:24)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-26/"},
      {t:"Daily Dose of Greek — one verse a day",s:"Free two-minute weekday videos; the habit that keeps the language",u:"https://dailydoseofgreek.com/"}],
quiz:[
{q:"Which book is the usual recommendation to read first?",o:["Hebrews","1 John","Luke","2 Peter"],a:1,w:"Short sentences, limited vocabulary, endless repetition. It builds confidence rather than destroying it.",sec:2},
{q:"The word-study fallacy involves:",o:["Reading too fast","Treating etymology or every possible sense as the meaning in context","Ignoring the article","Using a lexicon"],a:1,w:"Meaning is determined by usage in context, not by a word's history or the full range of its possible senses.",sec:5},
{q:"What is the best defence against losing the language again?",o:["Buying more books","A short daily reading habit tied to your preaching text","Memorising more paradigms","Learning Hebrew as well"],a:1,w:"Frequency beats intensity. Tying it to work you already do each week is what makes it survive a busy season.",sec:4},
{q:"The recommended way to use parsing software is:",o:["Avoid it — it weakens you","Let it read for you","Attempt the parse yourself, then check","Only for Hebrew"],a:2,w:"Helps are for momentum, not for outsourcing. The attempt is where the learning happens; the check is where the correcting happens.",sec:1}]}
];

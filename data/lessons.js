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
<p><b>The iota subscript.</b> A small iota written under a long vowel: <span class="gk">ᾳ, ῃ, ῳ</span>. It is not pronounced, but it usually signals the <b>dative case</b> — about five times in six. The main exception is subjunctive endings, which you meet in chapter 23.</p>
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
{q:"Which of these is most likely to be misread by an English speaker?",o:["ρ as p","β as b","δ as d","κ as k"],a:0,w:"ρ is r. So is η for n, υ for v, χ for x and ω for w. Everyone makes these at least once.",sec:5}]},
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
<h3>Mood: how the speaker relates it to reality</h3>
<p>Mood is the manner in which a speaker presents the action — not what happened, but what kind of claim is being made about it.</p>
<p>The <b>indicative</b> affirms. It presents the action as fact: <i>he has mercy</i>. Almost everything you read in the New Testament is indicative, and the whole of chapters 3 to 16 stays inside it.</p>
<p>The <b>imperative</b> commands: <i>Lord, have mercy</i>. The <b>subjunctive</b> presents the action as contingent, projected, not yet settled: <i>if he should have mercy</i>. The <b>optative</b> is rarer still, and by the Koine period it is fading; you will meet it perhaps sixty times.</p>
<p>The <b>infinitive</b> and the <b>participle</b> are not moods in the same sense. They are verb forms that decline to specify a person at all — the infinitive a verbal noun, the participle a verbal adjective. Both have tense and voice, and neither has a subject of its own in the ordinary way.</p>
<p>Two consequences worth carrying. Only the indicative fixes time, which is why the tense of a participle tells you about aspect and not about when. And the negative follows the mood, not the meaning: <span class="gk">οὐ</span> with the indicative, <span class="gk">μή</span> with everything else. You meet that in the next chapter.</p>
<h3>Voice: how the subject relates to the action</h3>
<p>The <b>active</b> voice presents the subject as doing the action. <span class="gk">ἀκούω</span>, I hear.</p>
<p>The <b>passive</b> presents the subject as being acted upon. I am heard. Where the agent is named, it is usually <span class="gk">ὑπό</span> with the genitive.</p>
<p>The <b>middle</b> is the one English has no equivalent for, and it is worth knowing now that it exists rather than being surprised by it in chapter 12. The subject acts <i>with reference to itself</i> — on itself, for itself, or in its own interest. It is not reflexive exactly, and it is not passive.</p>
<p>The practical difficulty is that middle and passive share their endings in most tenses, so the form alone often cannot tell you which one is meant. Only the verb and the sentence can. A great many verbs are also <i>deponent</i> — middle in form and active in meaning, like <span class="gk">ἔρχομαι</span>, I come — which looks like an exception and is really the middle doing something English has no way to say.</p>
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
{q:"What does mood tell you?",o:["When the action happened","How the speaker presents it in relation to reality","Who is doing it","Whether it is finished"],a:1,w:"The kind of claim being made: the indicative affirms, the imperative commands, the subjunctive presents the action as contingent. Only the indicative fixes time.",sec:4},
{q:"In the middle voice, the subject:",o:["Is acted upon","Acts with reference to itself","Does nothing","Is plural"],a:1,w:"Acts on itself, for itself, or in its own interest. English has no equivalent, which is why chapter 12 is called what it is — and why deponent verbs like ἔρχομαι look like exceptions and are not.",sec:5},
{q:"Why can the form alone often not tell you middle from passive?",o:["They are the same voice","They share their endings in most tenses","The middle is rare","Scribes confused them"],a:1,w:"The endings are shared in most tenses, so only the verb and the sentence can settle it. That ambiguity is real and it does not go away.",sec:5},
{q:"Augment plus secondary endings signals:",o:["Future time","Past time","Passive voice","The subjunctive"],a:1,w:"Past time — imperfect, aorist or pluperfect. Recognising the shape before you recognise the word is most of what reading an inflected language is.",sec:6},
{q:"How many principal parts does a Greek verb have?",o:["Three","Four","Up to six","As many as needed"],a:2,w:"Up to six: present, future, aorist active, perfect active, perfect middle/passive, aorist passive. Regular verbs build all six from one stem.",sec:7},
{q:"What is the discipline this chapter ends with?",o:["Learn the vocabulary first","Never say what a form means until you have parsed it","Read aloud daily","Translate every sentence"],a:1,w:"The ending is where the meaning lives, and guessing from the stem is how confident mistranslations are made. Parsing is not the goal — reading is — but it is the route.",sec:8}]},
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
<p>Because it is about aspect rather than time, one form covers several jobs that English splits between different constructions.</p>
<p>The <b>simple present</b> just states it: <i>I loose</i>.</p>
<p>The <b>progressive present</b> presents it as under way, and it is very common in narrative and in speech:</p>
<p class="v" data-ref="Matthew 8:25">Κύριε, σῶσον, ἀπολλύμεθα</p>
<p>"Lord, save us — we are perishing." Not <i>we perish</i>. The disciples are in the middle of it.</p>
<p>The <b>historical present</b> is a past event told in the present tense, for vividness:</p>
<p class="v" data-ref="Mark 1:40">Καὶ ἔρχεται πρὸς αὐτὸν λεπρὸς</p>
<p>"And a leper comes to him." The event is past; Mark writes <span class="gk">ἔρχεται</span>, present, and puts you in the room. He does this constantly, and most English translations quietly convert it to a past tense — so if you have only ever read this in English, you have never seen it.</p>
<p>None of these is a different tense. They are one form, and the sentence decides which reading it carries. That is what it means to say Greek encodes aspect first and time second.</p>
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
{q:"Mark writes ἔρχεται, a present, about a past event. What is that called?",o:["A mistake","The historical present","The gnomic present","A future"],a:1,w:"The historical present: a past event told in the present tense for vividness. Mark does it constantly, and most English translations quietly convert it — so if you have only read this in English you have never seen it.",sec:2},
{q:"ἀπολλύμεθα in Matthew 8:25 is best read as:",o:["We perish","We are perishing","We will perish","We perished"],a:1,w:"The progressive present: presented as under way. The disciples are in the middle of it, not stating a general truth.",sec:2},
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
<p>The dative is the fourth, and chapter 5 introduces it properly with the prepositions that take it. There is a fifth: the <b>vocative</b>, used for addressing someone directly, and it occurs 668 times.</p>
<p class="v" data-ref="Matthew 8:25">Κύριε, σῶσον</p>
<p>"Lord, save!" That is <span class="gk">κύριε</span>, not <span class="gk">κύριος</span> — the disciples are speaking <i>to</i> him. In the plural the vocative is identical to the nominative, so it usually goes unnoticed; in the singular of the second declension it ends in <span class="gk">-ε</span>, and once you have seen it you will see it everywhere.</p>
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
<h3>What the article's absence tells you</h3>
<p>Greek has no indefinite article, so the choice is not between <i>the</i> and <i>a</i> — it is between the article and nothing, and the nothing is meaningful.</p>
<p>Broadly: the article points at <b>particular identity</b>, and its absence throws the weight onto <b>quality or character</b>. Both are choices the writer made.</p>
<p class="v" data-ref="Luke 18:13">ἱλάσθητί μοι τῷ ἁμαρτωλῷ</p>
<p>"Be merciful to me, <i>the</i> sinner." The tax collector does not say a sinner. He uses the article, and identifies himself as the one — which most English translations lose, and which is the whole force of the prayer.</p>
<p class="v" data-ref="Galatians 1:1">Παῦλος ἀπόστολος</p>
<p>"Paul, an apostle." No article. Paul is not claiming to be the apostle to the exclusion of others; he is asserting the character of his apostleship, and the argument of the whole letter follows from it.</p>
<p>Do not over-read this. Greek uses the article in plenty of places English would not — with abstract nouns, with proper names, with whole categories — and its absence after a preposition often means nothing at all. But when a writer had a choice and took it, that is worth noticing, and you cannot notice it in a translation.</p>
<h3>What to watch for</h3>
<p><span class="gk">λόγων</span> is genitive plural and so is <span class="gk">ἔργων</span> — the genitive plural is <span class="gk">-ων</span> in every gender and every declension you will meet. That makes it easy to spot and useless for telling you the gender, so take the gender from the article.</p>
<p>And the dative singular ends in a long vowel with an iota written underneath it: <span class="gk">λόγῳ</span>, <span class="gk">ἔργῳ</span>. It is silent, it is small, and at reading speed it looks like a plain omega. Chapter 1 said to train your eye for the subscript. This is the ending it was for.</p>`,
v:[1,4,8,12,17,20,27,31,32,46,48,51,58,67,79,82,87,88,90,127,132,144,162,167,252,210,219,276,300,330,339,412,470,471],
vids:[{t:"Lecture 4: Nouns of the Second Declension",s:"Daily Dose of Greek — Rob Plummer (18:22)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-4/"}],
quiz:[
{q:"Why can Greek word order be freer than English?",o:["It has fewer words","The ending shows what a noun is doing","It has no subject","Greek writers preferred it"],a:1,w:"The case ending carries the job. English uses position for the same purpose, which is why moving a word in English changes the meaning and moving one in Greek often does not.",sec:0},
{q:"In the λόγος paradigm, which two forms are spelled alike?",o:["λόγος and λόγοι","λόγου and λόγῳ","λόγων is the only genitive plural, and nothing else is repeated","λόγον and λόγων"],a:2,w:"Nothing in the singular repeats. The eight forms are distinct, which is what makes the second declension the one to start with.",sec:1},
{q:"In ἀκούσας δὲ ὁ νεανίσκος τὸν λόγον ἀπῆλθεν, what is τὸν λόγον?",o:["The subject","The object","Possessive","Indirect object"],a:1,w:"Accusative, so the object — what he heard. ὁ νεανίσκος is nominative and does the hearing.",sec:2},
{q:"In Κύριε, σῶσον, why is it κύριε rather than κύριος?",o:["A spelling variant","It is vocative — they are speaking to him","It is genitive","It is plural"],a:1,w:"The vocative, for direct address. 668 of them in the New Testament. In the plural it is identical to the nominative, but in the second declension singular it ends in -ε.",sec:2},
{q:"How does neuter ἔργον differ from masculine λόγος?",o:["Everywhere","Only in the genitive","Only in the nominative and accusative","Only in the plural"],a:2,w:"Only there, and in those two it uses one form for both. Every other ending is identical.",sec:3},
{q:"πάντα δι’ αὐτοῦ ἐγένετο has a plural subject and a singular verb. Why?",o:["It is an error in the manuscripts","A neuter plural subject regularly takes a singular verb","πάντα is singular","The verb agrees with αὐτοῦ"],a:1,w:"Greek treats a neuter plural as a collective, so the verb agrees with the idea rather than the count. It is regular, and it is not to be corrected.",sec:4},
{q:"Why do lexicons list λόγος, -ου, ὁ rather than just λόγος?",o:["Tradition","The genitive gives the declension and the article gives the gender","To show the accent","To show the plural"],a:1,w:"Neither is guessable from the nominative — ἡ ὁδός looks masculine and is not. Learn nouns in the full form from the start.",sec:5},
{q:"Roughly how often does the definite article occur in the New Testament?",o:["One word in every twenty","One word in every seven","One word in every three","About a thousand times"],a:1,w:"19,770 times, one word in every seven. Knowing its seventeen forms lets you read the case of almost any noun attached to one.",sec:6},
{q:"The tax collector says τῷ ἁμαρτωλῷ, with the article. What does that do?",o:["Nothing; Greek always uses it","Identifies him as the sinner, not a sinner","Makes it plural","Marks the dative only"],a:1,w:"The article points at particular identity. He does not say a sinner. Most English translations lose it, and it is the whole force of the prayer.",sec:7},
{q:"Paul writes Παῦλος ἀπόστολος with no article. Why does that matter?",o:["He is being modest","Absence throws the weight onto character rather than identity","It is a scribal slip","Names never take the article"],a:1,w:"The article points at identity; its absence emphasises quality. Paul is asserting the character of his apostleship, not claiming to be the only apostle.",sec:7},
{q:"What does the genitive plural ending -ων tell you about gender?",o:["Masculine","Neuter","Feminine","Nothing at all"],a:3,w:"Nothing. It is -ων in every gender and every declension, which makes it easy to spot and useless for gender. Take that from the article.",sec:8},
{q:"What does the iota written under the omega of λόγῳ signal?",o:["Nothing; it is decorative","The dative","The plural","An accent shift"],a:1,w:"The dative. It is silent and at reading speed it looks like a plain omega, which is exactly why chapter 1 said to train your eye for it.",sec:8}]},
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
<p>Read a preposition together with the noun it governs, as one unit, rather than as a word on its own: <span class="gk">ἐν τῷ οἴκῳ</span> is a single idea.</p>
<p>Once you can see a preposition and predict the case that follows it, you are reading ahead of the sentence rather than behind it.</p>
<h3>Small words change shape before a vowel</h3>
<p>You met this in chapter 3 with the negative: <span class="gk">οὐ</span> before a consonant, <span class="gk">οὐκ</span> before a smooth breathing, <span class="gk">οὐχ</span> before a rough one. Prepositions do the same thing, and for the same reason — Greek adjusts a small word to whatever follows it.</p>
<p><span class="gk">ἐκ</span> becomes <span class="gk">ἐξ</span> before a vowel: 669 times against 227 in the New Testament, so you will meet both.</p>
<p><span class="gk">ἀπό</span> drops its vowel and becomes <span class="gk">ἀπ’</span> before a vowel, and <span class="gk">ἀφ’</span> before a rough breathing — the pi turning into a phi for exactly the reason the kappa of <span class="gk">οὐκ</span> turns into the chi of <span class="gk">οὐχ</span>.</p>
<p class="v" data-ref="1 Thessalonians 2:6">ἐξ ἀνθρώπων δόξαν, οὔτε ἀφ’ ὑμῶν οὔτε ἀπ’ ἄλλων</p>
<p>"glory from men, neither from you nor from others." Three of these in one line: <span class="gk">ἐξ</span> before a vowel, <span class="gk">ἀφ’</span> before the rough breathing of <span class="gk">ὑμῶν</span>, and <span class="gk">ἀπ’</span> before the smooth breathing of <span class="gk">ἄλλων</span>.</p>
<p>None of this changes the meaning or the case. It is the same preposition, dressed for the word in front of it — and worth recognising, because a lexicon lists <span class="gk">ἀπό</span> and the page says <span class="gk">ἀφ’</span>.</p>
<h3>What to watch for</h3>
<p class="v" data-ref="Hebrews 13:25">ἡ χάρις μετὰ πάντων ὑμῶν</p>
<p>"Grace be with you all." <span class="gk">χάρις</span> is not first declension at all — it is third, which is chapter 17 — and it is a good reminder that a noun ending in a vowel is not automatically first declension. The article and the genitive in the lexicon entry are what settle it.</p>
<p>And <span class="gk">ἀγάπῃ</span> against <span class="gk">ἀγάπη</span>: dative against nominative, one silent letter apart, and the difference between love acting and love being acted in.</p>`,
v:[0,5,9,18,26,44,57,59,89,91,92,98,111,119,121,138,140,147,153,157,159,178,180,181,182,260,201,297,304,189,206,324,322,329,347,400,208,409,418,417,435,221,448,461,464,473,472,474,475,477,476],
vids:[{t:"Lecture 5: Nouns of the First Declension",s:"Daily Dose of Greek — Rob Plummer (16:35)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-5/"},
      {t:"Amazing Greek: 1st and 2nd Declension Nouns",s:"Daily Dose of Greek — both declensions to Amazing Grace",yt:"GJ5AAMQhrqM"}],
quiz:[
{q:"First declension nouns are usually which gender?",o:["Masculine","Feminine","Neuter","It varies evenly"],a:1,w:"Feminine, with a handful of important masculines like μαθητής and προφήτης that take the masculine article.",sec:0},
{q:"In the ἀγάπη paradigm, which form carries an iota subscript?",o:["The nominative","The genitive singular","The dative singular","The accusative plural"],a:2,w:"ἀγάπῃ, the dative singular. It is silent, and it is the same signal you met on λόγῳ in chapter 4.",sec:1},
{q:"Why is it ἡμέρας but δόξης in the genitive singular?",o:["ἡμέρα is irregular","The stem of ἡμέρα ends in ρ, so the alpha is kept","δόξα is masculine","Accent placement"],a:1,w:"After ε, ι or ρ the alpha is kept throughout. Otherwise it shifts to eta in the genitive and dative singular — and comes back for the accusative.",sec:2},
{q:"How do you know μαθητής is masculine?",o:["The ending","The article — ὁ μαθητής","The accent","The genitive plural"],a:1,w:"The article. The ending looks feminine; the article settles it, as it did for ἡ ὁδός in chapter 4.",sec:3},
{q:"What is always true of a first declension genitive plural?",o:["It ends -ας","It ends -ῶν with a circumflex","It has no accent","It is identical to the nominative"],a:1,w:"-ῶν with a circumflex, wherever the accent falls elsewhere in the word. One of the few accent rules worth learning as a rule.",sec:4},
{q:"Which case does ἐν take?",o:["Genitive","Dative","Accusative","Any of them"],a:1,w:"Dative, always. ἐν, εἰς, ἐκ and ἀπό each take one case only, which makes them the most reliable case signposts in the text.",sec:5},
{q:"Why does ἐκ become ἐξ before a vowel?",o:["It is a different word","For the same reason οὐ becomes οὐκ — ease of sound","It marks a different case","Manuscript variation"],a:1,w:"Sound, not grammar. Greek adjusts small words to what follows them; you saw the same with οὐ, οὐκ and οὐχ in chapter 3.",sec:6},
{q:"Why does ἀπό appear as ἀφ’ before ὑμῶν?",o:["It is a different preposition","The rough breathing turns the pi into a phi","It is plural","A scribal variant"],a:1,w:"The same adjustment as οὐκ becoming οὐχ. The meaning and the case are unchanged — it is the preposition dressed for the word in front of it.",sec:6},
{q:"χάρις ends in a vowel sound. Is it first declension?",o:["Yes","No — it is third declension","Only in the plural","Only when feminine"],a:1,w:"Third, which is chapter 17. A noun ending in a vowel is not automatically first declension; the genitive and the article in the lexicon entry are what settle it.",sec:7}]},
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
<h3>Second aorists: the same tense, a different shape</h3>
<p>Everything above describes the <b>first</b> aorist, the one with the sigma. There is a second pattern, and it is not a variant or an exception — it is more than half of what you will actually read.</p>
<p>A second aorist takes an augment and the <i>present</i> stem endings, with no sigma at all, on a changed stem. <span class="gk">λέγω</span> gives <span class="gk">εἶπον</span>; <span class="gk">ἔρχομαι</span> gives <span class="gk">ἦλθον</span>; <span class="gk">βάλλω</span> gives <span class="gk">ἔβαλον</span>; <span class="gk">ὁράω</span> gives <span class="gk">εἶδον</span>.</p>
<p class="v" data-ref="Matthew 20:32">καὶ στὰς ὁ Ἰησοῦς ἐφώνησεν αὐτοὺς καὶ εἶπεν</p>
<p>"And Jesus stopped, called them, and said." Both verbs are aorist active indicative, third singular, and they look nothing alike. <span class="gk">ἐφώνησεν</span> has the sigma; <span class="gk">εἶπεν</span> has a stem you would not have predicted from <span class="gk">λέγω</span>.</p>
<p class="v" data-ref="John 1:11">εἰς τὰ ἴδια ἦλθεν</p>
<p>"He came to his own." Same tense again, same endings as an imperfect would take, and no sigma anywhere.</p>
<p>Two things follow, and both matter more than the label does.</p>
<p><b>The endings do not tell you the tense here — the stem does.</b> <span class="gk">ἔβαλον</span> and <span class="gk">ἔβαλλον</span> differ by one lambda: the aorist against the imperfect of the same verb. That single letter is the whole distinction.</p>
<p><b>And you cannot look a second aorist up by its own spelling.</b> <span class="gk">εἶπεν</span> is not under epsilon in a lexicon; it is under <span class="gk">λέγω</span>. This is what the principal parts are for, and it is why the third one is worth learning for the common verbs even though the drill for it feels like rote.</p>
<p>There is no difference in meaning. A second aorist is aorist, with exactly the aspect described above. It is a different way of building the same tense, kept by the verbs that have been in the language longest — which is why the commonest verbs are the irregular ones, here as in English.</p>
<h3>εἰμί in the past</h3>
<p>The verb to be has no aorist. It has an imperfect, and you will meet it constantly.</p>
<table><tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>1st</th><td class="g">ἤμην</td><td class="g">ἦμεν</td></tr>
<tr><th>2nd</th><td class="g">ἦς</td><td class="g">ἦτε</td></tr>
<tr><th>3rd</th><td class="g">ἦν</td><td class="g">ἦσαν</td></tr></table>
<p class="v" data-ref="John 1:2">οὗτος ἦν ἐν ἀρχῇ πρὸς τὸν θεόν</p>
<p>"He was in the beginning with God." <span class="gk">ἦν</span> alone accounts for most of these 455 occurrences, and John 1 uses it to hold a state open rather than to report an event — which is the imperfective aspect doing exactly what this chapter has been describing.</p>
<p class="v" data-ref="Mark 15:25">ἦν δὲ ὥρα τρίτη</p>
<p>"And it was the third hour." Learn <span class="gk">ἦν</span> and <span class="gk">ἦσαν</span> first; between them they cover most of what you will see.</p>
<h3>What to watch for</h3>
<p class="v" data-ref="Matthew 5:2">ἐδίδασκεν αὐτούς</p>
<p>"He was teaching them" — the sentence that opens the Sermon on the Mount. An aorist there would have said he taught them, and closed it. The imperfect holds it open, and everything that follows is what he was saying.</p>
<p>The traps are mechanical. <span class="gk">ἔλυον</span> is first singular or third plural, and you cannot tell from the word. A verb beginning with a long vowel has no visible augment, so an imperfect can look exactly like a present until you read the ending. And <span class="gk">ἔβαλον</span> against <span class="gk">ἔβαλλον</span> is one lambda between an aorist and an imperfect.</p>
<p>None of those can be reasoned out. They are recognised, and recognition comes from meeting them often, which is what the drills are for.</p>`,
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
{q:"Matthew 5:2 has ἐδίδασκεν rather than an aorist. What does that do?",o:["Nothing; they are interchangeable","It holds the teaching open, and what follows is what he was saying","It makes it passive","It moves it into the present"],a:1,w:"An aorist would have said he taught them and closed it. The imperfect holds it open — and the Sermon on the Mount follows.",sec:7},
{q:"A verb beginning with a long vowel has no visible augment. What tells you the tense?",o:["The accent","The ending","Nothing can","The context alone"],a:1,w:"The secondary ending. εὑρίσκω keeps its εὑ- throughout, so the ending is the only thing distinguishing the imperfect from the present.",sec:7},
{q:"ἐφώνησεν and εἶπεν stand side by side in Matthew 20:32. How do they differ?",o:["One is imperfect","Not at all in tense — one is a first aorist, one a second","One is passive","One is plural"],a:1,w:"Both are aorist active indicative third singular. ἐφώνησεν has the sigma; εἶπεν is built on a changed stem with no sigma. Second aorists are 58% of the aorist active indicatives in the New Testament.",sec:5},
{q:"Why can you not look εἶπεν up under epsilon?",o:["It is misspelled","It is the second aorist of λέγω, and lexicons list the present","It is not a real word","It is a proper name"],a:1,w:"A second aorist is built on a different stem, so the form on the page does not begin with the letters the lexicon lists. This is what the principal parts are for.",sec:5},
{q:"ἔβαλον and ἔβαλλον differ by one letter. What is the difference?",o:["Person","Aorist against imperfect","Active against middle","Nothing; both spellings occur"],a:1,w:"One lambda. ἔβαλον is the second aorist, ἔβαλλον the imperfect, and here the stem carries the tense rather than the ending.",sec:5},
{q:"What is the aorist of εἰμί?",o:["ἦν","ἐγενόμην","There is none — it has only an imperfect","ἔσομαι"],a:2,w:"εἰμί has no aorist. Its past is the imperfect: ἤμην, ἦς, ἦν, ἦμεν, ἦτε, ἦσαν — and ἦν alone accounts for most of its 455 occurrences.",sec:6}]},
{id:8,t:"Additional prepositions",s:"Case changes the meaning",
body:`<p>Prepositions are small words carrying a great deal of a sentence's logic. In chapter 5 you met four of them — <span class="gk">ἐν, εἰς, ἐκ</span> and <span class="gk">ἀπό</span> — and each one took a single case.</p>
<p>Most of the common prepositions are not so simple. They take two cases, and two of them take three, and the case is not decoration. <span class="gk">διά</span> with the genitive means <i>through</i>; <span class="gk">διά</span> with the accusative means <i>because of</i>. Same word, different case, different logic. So reading a preposition means reading two things — the word, and the case of whatever follows it.</p>
<h3>Two cases, two meanings</h3>
<p>Six prepositions carry most of this weight. The proportions are counted from the text itself, and a preposition's commoner case is the one to reach for first.</p>
<table>
<tr><th>Prep</th><th>+ Genitive</th><th>+ Accusative</th></tr>
<tr><td class="g">διά</td><td>through (58%)</td><td>because of (42%)</td></tr>
<tr><td class="g">κατά</td><td>against, down from (16%)</td><td>according to (84%)</td></tr>
<tr><td class="g">μετά</td><td>with (78%)</td><td>after (22%)</td></tr>
<tr><td class="g">περί</td><td>concerning (89%)</td><td>around (11%)</td></tr>
<tr><td class="g">ὑπέρ</td><td>on behalf of (87%)</td><td>above (13%)</td></tr>
<tr><td class="g">ὑπό</td><td>by (77%)</td><td>under (23%)</td></tr></table>
<p class="v" data-ref="1 Corinthians 15:3">Χριστὸς ἀπέθανεν ὑπὲρ τῶν ἁμαρτιῶν ἡμῶν κατὰ τὰς γραφάς</p>
<p>"Christ died for our sins according to the Scriptures." Both prepositions here are doing exactly what their case says. <span class="gk">ὑπέρ</span> has the genitive, so it is <i>on behalf of</i>; <span class="gk">κατά</span> has the accusative, so it is <i>according to</i>. Put <span class="gk">κατά</span> with a genitive instead and the same sentence says Christ died <i>against</i> the Scriptures.</p>
<h3>ἐπί and παρά: three cases each</h3>
<p><span class="gk">ἐπί</span> is the fourth commonest preposition in the New Testament — 885 occurrences — and it takes all three cases: accusative 480 times, genitive 220, dative 183. The honest thing to say is that the distinctions have largely worn away, and all three can mean simply <i>on</i>.</p>
<p class="v" data-ref="Matthew 6:19">Μὴ θησαυρίζετε ὑμῖν θησαυροὺς ἐπὶ τῆς γῆς</p>
<p class="v" data-ref="Matthew 10:29">οὐ πεσεῖται ἐπὶ τὴν γῆν</p>
<p>"Do not store up treasures on earth"; "will not fall to the ground." Genitive in the first, accusative in the second, and the case is not what separates them. With <span class="gk">ἐπί</span>, read the sentence.</p>
<p><span class="gk">παρά</span> is the opposite. It occurs 193 times, and all three of its cases are still clean.</p>
<p class="v" data-ref="John 6:45">πᾶς ὁ ἀκούσας παρὰ τοῦ πατρὸς</p>
<p class="v" data-ref="Luke 1:30">εὗρες γὰρ χάριν παρὰ τῷ θεῷ</p>
<p class="v" data-ref="Matthew 4:18">Περιπατῶν δὲ παρὰ τὴν θάλασσαν</p>
<p>Genitive, <i>from</i> the Father. Dative, <i>with</i> God. Accusative, <i>beside</i> the sea. One word, three cases, three plainly different things.</p>
<h3>The picture behind the case</h3>
<p>Those three <span class="gk">παρά</span> phrases are not a coincidence. Underneath them is one idea that makes the whole list easier to hold.</p>
<p>Broadly: the <b>genitive</b> is movement <i>away from</i>, the <b>dative</b> is position <i>at</i>, and the <b>accusative</b> is movement <i>towards</i>. From, at, to.</p>
<p>You have already met it without being told. Chapter 5's prepositions are the same picture in miniature — <span class="gk">ἐκ</span> with the genitive is <i>out of</i>, <span class="gk">ἐν</span> with the dative is <i>in</i>, <span class="gk">εἰς</span> with the accusative is <i>into</i>. <span class="gk">παρά</span> does all three at once.</p>
<p>It is a picture and not a rule. <span class="gk">κατά</span> with the accusative means <i>according to</i>, and nothing is moving anywhere. Use it to remember the pattern, not to argue a point in a sermon.</p>
<h3>The ones that take a single case</h3>
<p>Five more, each locked to one case, which makes them the easiest words on the page.</p>
<p><b>Genitive:</b> <span class="gk">πρό</span>, before (47) · <span class="gk">ἀντί</span>, instead of (22).<br>
<b>Dative:</b> <span class="gk">σύν</span>, with — 129 occurrences, 129 datives.<br>
<b>Accusative:</b> <span class="gk">πρός</span>, to or towards (688 of its 696) · <span class="gk">ἀνά</span>, up (5, and in the New Testament nearly always distributive — <i>two by two</i>).</p>
<p><span class="gk">πρός</span> is worth singling out: the fifth commonest preposition in the New Testament, and accusative in all but a handful of its occurrences. With <span class="gk">ἐν</span> and <span class="gk">εἰς</span>, it is one of the few genuinely reliable case-signals in the text.</p>
<p class="v" data-ref="Mark 10:45">δοῦναι τὴν ψυχὴν αὐτοῦ λύτρον ἀντὶ πολλῶν</p>
<p>"To give his life a ransom in place of many." Twenty-two occurrences, and <span class="gk">ἀντί</span> is the plainest word Greek has for one thing standing where another would have stood.</p>
<h3>By whom, and through whom</h3>
<p>Two of these prepositions divide up a job English does with a single word. <span class="gk">ὑπό</span> with the genitive names the one who did it; <span class="gk">διά</span> with the genitive names the one it was done <i>through</i>.</p>
<p class="v" data-ref="Matthew 1:22">τὸ ῥηθὲν ὑπὸ κυρίου διὰ τοῦ προφήτου</p>
<p>"What was spoken by the Lord through the prophet." Both prepositions inside five words, and the distinction is deliberate: the Lord is the speaker, the prophet the means. Matthew uses the formula again at 2:15.</p>
<p class="v" data-ref="John 1:3">πάντα δι’ αὐτοῦ ἐγένετο</p>
<p>"All things came into being through him."</p>
<p>Do not press the line harder than it will bear — Greek can use <span class="gk">διά</span> where English says <i>by</i>. But where a writer sets the two side by side in one clause, as Matthew does, he means the difference.</p>
<h3>Compound verbs</h3>
<p>A great many New Testament verbs are a preposition glued to the front of a simpler verb, and the preposition usually still means what it means.</p>
<p><span class="gk">ἔρχομαι</span>, "I come", is the clearest case. On its own it occurs 631 times, and it heads a family of seventeen compounds worth 759 more between them: <span class="gk">ἐξέρχομαι</span> go out (216), <span class="gk">εἰσέρχομαι</span> go in (193), <span class="gk">ἀπέρχομαι</span> go away (117), <span class="gk">προσέρχομαι</span> come to (86), <span class="gk">διέρχομαι</span> go through (41), <span class="gk">συνέρχομαι</span> come together (30). Learn one verb and you have read most of a page.</p>
<p>The same trick works elsewhere: <span class="gk">βάλλω</span> is "I throw", so <span class="gk">ἐκβάλλω</span> is "I throw out".</p>
<p>But it is a hint and not a proof, and this chapter's own vocabulary supplies the counter-example. <span class="gk">ἀναγινώσκω</span> is <span class="gk">ἀνά</span> plus <span class="gk">γινώσκω</span>, and it means "I read" — not "I know up".</p>
<h3>Where the augment goes</h3>
<p>The augment marks past time and belongs to the verb, so in a compound it lands <b>inside</b> the word, between the preposition and the stem.</p>
<p class="v" data-ref="Matthew 21:12">Καὶ εἰσῆλθεν Ἰησοῦς εἰς τὸ ἱερόν, καὶ ἐξέβαλεν πάντας</p>
<p>"And Jesus entered the temple and threw out everyone." The augment is buried in both verbs — <span class="gk">εἰσ-ῆλθεν</span> and <span class="gk">ἐξ-έ-βαλεν</span> — and <span class="gk">ἐκ</span> has become <span class="gk">ἐξ</span> before the augment's vowel, the adjustment chapter 5 described.</p>
<p>So when a word will not give up its stem, look past the front of it. <span class="gk">ἀπέθανεν</span>, "he died", is <span class="gk">ἀπό</span> plus the augment plus the aorist stem of <span class="gk">ἀποθνῄσκω</span>, and staring at the first three letters will never produce it.</p>
<p>One more thing sits in that verse: <span class="gk">εἰσῆλθεν … εἰς</span>. Greek often repeats the preposition after a compound verb, and it adds nothing. Translate it once.</p>
<h3>What to watch for</h3>
<p>Three habits.</p>
<p><b>Read the case, not only the word.</b> The noun that follows is doing as much of the work as the preposition is.</p>
<p><b>Expect the shortened forms.</b> Chapter 5 covered why they happen; what it could not say is how often — <span class="gk">διά</span> occurs 666 times and is written <span class="gk">δι’</span> in 149 of them. Add <span class="gk">κατ’</span> and <span class="gk">καθ’</span>, <span class="gk">μετ’</span> and <span class="gk">μεθ’</span>, <span class="gk">ἐπ’</span> and <span class="gk">ἐφ’</span>, <span class="gk">ὑπ’</span> and <span class="gk">ὑφ’</span>. Only <span class="gk">περί</span> and <span class="gk">πρό</span> never shorten.</p>
<p class="v" data-ref="Luke 9:23">ἀράτω τὸν σταυρὸν αὐτοῦ καθ’ ἡμέραν</p>
<p>"Let him take up his cross daily." <span class="gk">καθ’ ἡμέραν</span> is <span class="gk">κατά</span> with the accusative, set hard as an idiom, and you will meet it seventeen times.</p>
<p><b>And do not build on a compound.</b> The preposition tells you where to look. The sentence tells you what it means.</p>`,
v:[19,22,24,37,38,50,68,80,105,126,145,247,198,336,446,507,506],
vids:[{t:"Lecture 8: Additional Prepositions",s:"Daily Dose of Greek — Rob Plummer (17:43)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-8/"}],
quiz:[
{q:"διὰ τοῦτο — τοῦτο is accusative. What does it mean?",o:["through this","because of this","with this","after this"],a:1,w:"διά with the accusative is 'because of'; with the genitive it is 'through'. Same word, different case, different logic.",sec:0},
{q:"κατά takes the accusative in 84% of its occurrences. What does it mean there?",o:["against","according to","down from","alongside"],a:1,w:"κατὰ τὰς γραφάς, 'according to the Scriptures' (1 Cor 15:3). With the genitive the same word means 'against' — which would turn that verse inside out.",sec:1},
{q:"ἐπί takes all three cases. What follows from that?",o:["Each case has a sharply distinct meaning","The distinctions have largely worn away — read the sentence","It is always genitive in practice","It is a compound of two prepositions"],a:1,w:"ἐπὶ τῆς γῆς and ἐπὶ τὴν γῆν both mean 'on the earth'. With ἐπί the case is a weak guide and the context is the strong one.",sec:2},
{q:"παρὰ τοῦ πατρός, παρὰ τῷ θεῷ, παρὰ τὴν θάλασσαν. What are the three?",o:["From, with, beside","Beside, from, with","With, beside, from","All three mean 'from'"],a:0,w:"Genitive from, dative with, accusative beside. παρά is the one preposition where all three cases are still cleanly distinct.",sec:2},
{q:"The picture behind the cases is:",o:["Genitive at, dative from, accusative towards","Genitive from, dative at, accusative towards","Genitive towards, dative from, accusative at","There is no pattern"],a:1,w:"From, at, to. ἐκ out of (gen), ἐν in (dat), εἰς into (acc) is the same picture in three words. It is a memory aid, not a rule — κατά with the accusative means 'according to' and nothing is moving.",sec:3},
{q:"σύν occurs 129 times. How many take the dative?",o:["About half","All 129","Only when it means 'together'","None — it takes the genitive"],a:1,w:"Every one. σύν, πρό, ἀντί, πρός and ἀνά are locked to a single case each, which makes them the easiest prepositions to read.",sec:4},
{q:"λύτρον ἀντὶ πολλῶν (Mark 10:45). What is ἀντί doing?",o:["Naming a price","Marking substitution — in place of","Marking time","Marking direction"],a:1,w:"'A ransom in place of many.' ἀντί occurs only 22 times, and it is the plainest word Greek has for one thing standing where another would have stood.",sec:4},
{q:"τὸ ῥηθὲν ὑπὸ κυρίου διὰ τοῦ προφήτου. Why two prepositions?",o:["They are interchangeable","ὑπό names who spoke, διά names the one it came through","διά is a scribal addition","ὑπό marks place and διά marks time"],a:1,w:"ὑπό with the genitive is the agent; διά with the genitive is the means. The Lord is the speaker, the prophet the instrument — and Matthew sets them side by side deliberately.",sec:5},
{q:"ἀναγινώσκω is ἀνά + γινώσκω. What does it mean?",o:["I know thoroughly","I read","I know from above","I recognise"],a:1,w:"'I read.' The preposition on a compound is a strong hint and never a proof — ἐκβάλλω really is 'I throw out', but this one is not 'I know up'.",sec:6},
{q:"The aorist of ἀποθνῄσκω is ἀπέθανεν. Where is the augment?",o:["There is none","Inside the word, between the preposition and the stem","On the front, before ἀπό","On the ending"],a:1,w:"The augment belongs to the verb, so a compound carries it internally: ἀπ-έ-θανεν, εἰσ-ῆλθεν, ἐξ-έ-βαλεν. When a word will not give up its stem, look past the front of it.",sec:7},
{q:"In Matthew 21:12, εἰσῆλθεν is followed by εἰς. How should the εἰς be translated?",o:["Twice, for emphasis","Once — Greek often repeats the preposition and it adds nothing","As 'out of'","It marks a second clause"],a:1,w:"Repeating the preposition after a compound verb is normal Greek and carries no extra weight.",sec:7},
{q:"Which two prepositions never elide before a vowel?",o:["ἀπό and ἐπί","περί and πρό","κατά and μετά","ὑπό and διά"],a:1,w:"Everything else shortens: δι’, κατ’, καθ’, μετ’, μεθ’, ἐπ’, ἐφ’, ὑπ’, ὑφ’. διά alone is written δι’ in 149 of its 666 occurrences, so the shortened forms are not a curiosity.",sec:8},
]},

{id:9,t:"Personal pronouns",s:"ἐγώ, σύ, αὐτός — and the three uses of αὐτός",
body:`<p>Pronouns stand in for nouns so that a sentence need not keep repeating them, and Greek uses them constantly. <span class="gk">αὐτός</span> alone occurs 5,546 times — four times more often than <span class="gk">θεός</span>, the commonest noun in the New Testament — and <span class="gk">ἐγώ</span> and <span class="gk">σύ</span> add 5,466 more between them. You will not read a paragraph without one.</p>
<p>One rule governs all of them, and it is worth having before the forms. A pronoun takes its <b>gender and number from the word it stands for</b>, and its <b>case from its own job in its own clause</b>. Those come from different places, and keeping them apart is most of the skill.</p>
<h3>First and second person</h3>
<table><caption>ἐγώ and σύ</caption>
<tr><th></th><th>I</th><th>we</th><th>you</th><th>you (pl)</th></tr>
<tr><th>Nom</th><td class="g">ἐγώ</td><td class="g">ἡμεῖς</td><td class="g">σύ</td><td class="g">ὑμεῖς</td></tr>
<tr><th>Gen</th><td class="g">ἐμοῦ (μου)</td><td class="g">ἡμῶν</td><td class="g">σοῦ (σου)</td><td class="g">ὑμῶν</td></tr>
<tr><th>Dat</th><td class="g">ἐμοί (μοι)</td><td class="g">ἡμῖν</td><td class="g">σοί (σοι)</td><td class="g">ὑμῖν</td></tr>
<tr><th>Acc</th><td class="g">ἐμέ (με)</td><td class="g">ἡμᾶς</td><td class="g">σέ (σε)</td><td class="g">ὑμᾶς</td></tr></table>
<p>The bracketed forms are the ordinary ones: no accent of their own, leaning on the word in front. The longer forms carry emphasis, and are also the ones used after a preposition — <span class="gk">ἀπ’ ἐμοῦ</span>, not <span class="gk">ἀπό μου</span>.</p>
<p>Now the pair that catches people for years. <span class="gk">ἡμεῖς</span> is "we"; <span class="gk">ὑμεῖς</span> is "you". One letter and one breathing apart, all the way down: <span class="gk">ἡμῶν / ὑμῶν</span>, <span class="gk">ἡμῖν / ὑμῖν</span>, <span class="gk">ἡμᾶς / ὑμᾶς</span>. The mnemonic worth having is that the last letter of the English word is the first letter of the Greek one: "w<b>e</b>" ends in an e and <span class="gk">ἡμεῖς</span> begins with eta, while "yo<b>u</b>" ends in a u and <span class="gk">ὑμεῖς</span> begins with upsilon.</p>
<p class="v" data-ref="John 4:22">ὑμεῖς προσκυνεῖτε ὃ οὐκ οἴδατε, ἡμεῖς προσκυνοῦμεν ὃ οἴδαμεν</p>
<p>"You worship what you do not know; we worship what we know." Both in one line, and the whole point of the sentence is the contrast. Read them the wrong way round and you have reversed what Jesus said to the woman at the well.</p>
<h3>αὐτός: the third person</h3>
<table><caption>αὐτός — he, she, it (singular / plural)</caption>
<tr><th></th><th>Masc</th><th>Fem</th><th>Neut</th></tr>
<tr><th>Nom</th><td class="g">αὐτός / αὐτοί</td><td class="g">αὐτή / αὐταί</td><td class="g">αὐτό / αὐτά</td></tr>
<tr><th>Gen</th><td class="g">αὐτοῦ / αὐτῶν</td><td class="g">αὐτῆς / αὐτῶν</td><td class="g">αὐτοῦ / αὐτῶν</td></tr>
<tr><th>Dat</th><td class="g">αὐτῷ / αὐτοῖς</td><td class="g">αὐτῇ / αὐταῖς</td><td class="g">αὐτῷ / αὐτοῖς</td></tr>
<tr><th>Acc</th><td class="g">αὐτόν / αὐτούς</td><td class="g">αὐτήν / αὐτάς</td><td class="g">αὐτό / αὐτά</td></tr></table>
<p>There is almost nothing new here. It declines like <span class="gk">ἀγαθός</span> from chapter 6, with one exception you have met in the article: the neuter singular is <span class="gk">αὐτό</span>, with no final ν, exactly as the article's neuter is <span class="gk">τό</span>. That single letter is the difference between "it" and "him".</p>
<p>None of the personal pronouns has a vocative. You do not address a pronoun.</p>
<h3>Where each part of a pronoun comes from</h3>
<p class="v" data-ref="John 1:10">ὁ κόσμος δι’ αὐτοῦ ἐγένετο, καὶ ὁ κόσμος αὐτὸν οὐκ ἔγνω</p>
<p>"The world came into being through him, and the world did not know him." Both pronouns stand for the Word, so both are masculine singular. But <span class="gk">αὐτοῦ</span> is genitive because <span class="gk">διά</span> demands a genitive, and <span class="gk">αὐτόν</span> is accusative because it is the object of <span class="gk">ἔγνω</span>.</p>
<p>That is the rule working: gender and number reach backwards to the noun, and case is decided by what the pronoun is doing where it stands. The relative pronoun behaves the same way, so it is worth settling now.</p>
<h3>His, her, their</h3>
<p>The commonest thing a Greek pronoun does is show possession, and it does it with a genitive placed <i>after</i> the noun. <span class="gk">ὁ λόγος μου</span> is literally "the word of me", which is to say "my word".</p>
<p class="v" data-ref="Matthew 6:8">οἶδεν γὰρ ὁ πατὴρ ὑμῶν</p>
<p>"For your Father knows." Notice the order: the article stays with its noun and the possessing pronoun follows. English puts it first and drops the article, which is why a literal rendering sounds odd.</p>
<p>This is not a minor use. Of <span class="gk">αὐτός</span>'s 5,546 occurrences, 2,140 are genitive — nearly two in five — and most are somebody's something.</p>
<h3>When the pronoun is emphatic</h3>
<p>A verb ending already names its subject, so a nominative pronoun is never <i>required</i>. Greek uses one when it wants weight there, and the numbers show how marked that choice is: only 272 of <span class="gk">αὐτός</span>'s occurrences are nominative, fewer than one in twenty.</p>
<p class="v" data-ref="Matthew 5:22">ἐγὼ δὲ λέγω ὑμῖν</p>
<p>"But I say to you." The <span class="gk">-ω</span> of <span class="gk">λέγω</span> had already said "I". The <span class="gk">ἐγώ</span> is there because Jesus is setting himself against what was said to those of old.</p>
<p class="v" data-ref="Mark 1:8">ἐγὼ ἐβάπτισα ὑμᾶς ὕδατι, αὐτὸς δὲ βαπτίσει ὑμᾶς ἐν πνεύματι ἁγίῳ</p>
<p>"I baptised you with water, but he will baptise you with the Holy Spirit." Two nominative pronouns, and the sentence turns on the distance between them.</p>
<p>Do not overclaim it, though. A pronoun the syntax needed is not emphatic simply by being there. Ask whether the sentence would have been complete without it.</p>
<h3>αὐτός as "self" and as "same"</h3>
<p><span class="gk">αὐτός</span> has two further uses, and position decides between them — the same rule that governed adjectives in chapter 6.</p>
<p><b>Predicate position</b>, with no article in front of it, means <i>self</i>.</p>
<p class="v" data-ref="1 Thessalonians 4:16">αὐτὸς ὁ κύριος ἐν κελεύσματι</p>
<p>"The Lord himself, with a cry of command." And again:</p>
<p class="v" data-ref="Revelation 21:3">αὐτὸς ὁ θεὸς μετ’ αὐτῶν ἔσται</p>
<p>"God himself will be with them" — where the <span class="gk">αὐτῶν</span> in the same line is the ordinary pronoun, "them". One word doing two jobs in the space of five.</p>
<p><b>Attributive position</b>, with the article immediately in front, means <i>same</i>.</p>
<p class="v" data-ref="1 Corinthians 12:5">καὶ ὁ αὐτὸς κύριος</p>
<p>"And the same Lord." Move one article and "the Lord himself" becomes "the same Lord".</p>

<p class="v" data-ref="Matthew 1:21">αὐτὸς γὰρ σώσει τὸν λαὸν αὐτοῦ ἀπὸ τῶν ἁμαρτιῶν αὐτῶν</p>
<p>"For he himself will save his people from their sins." Three forms of one word in eight, doing three different jobs: an intensive nominative, then two genitives of possession.</p>
<h3>What to watch for</h3>
<p><span class="gk">ἡμεῖς</span> and <span class="gk">ὑμεῖς</span>, and the whole column under them. This is the mistake that survives longest, because both readings usually make sense.</p>
<p><span class="gk">αὐτοῦ</span> is "his", and "of it", and also just the genitive a preposition asked for. The gloss follows the job, not the form.</p>
<p>The neuter <span class="gk">αὐτό</span> has no ν; <span class="gk">αὐτόν</span> is masculine accusative.</p>
<p>And one pair to have in mind before chapter 11: <span class="gk">αὐτή</span> with a smooth breathing is "she", while <span class="gk">αὕτη</span> with a rough one is "this". Ten occurrences against seventy-two — so the odds favour the demonstrative, and odds are not reading.</p>`,
v:[2,3,6],
vids:[{t:"Lecture 9: Personal Pronouns",s:"Daily Dose of Greek — Rob Plummer (15:17)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-9/"},
      {t:"Come Thou Personal Pronouns Song",s:"Daily Dose of Greek — ἐγώ and σύ, sung through",yt:"v2cqHDo2vZw"}],
quiz:[
{q:"A pronoun takes its gender and number from one place and its case from another. Which is which?",o:["Both from the antecedent","Gender and number from the antecedent; case from its own clause","Both from its own clause","Case from the antecedent; gender from the verb"],a:1,w:"In John 1:10 both αὐτοῦ and αὐτόν stand for the Word, so both are masculine singular — but one is genitive after διά and the other accusative as the object of ἔγνω.",sec:0},
{q:"μου, μοι, με differ from ἐμοῦ, ἐμοί, ἐμέ how?",o:["They are plural","They are unaccented and unemphatic — the everyday forms","They are older","They are only used in questions"],a:1,w:"The short forms lean on the word before them and carry no stress. The long forms are used for emphasis and after prepositions: ἀπ’ ἐμοῦ, not ἀπό μου.",sec:1},
{q:"ἡμεῖς and ὑμεῖς differ by:",o:["Nothing — they are variants","One letter and one breathing: 'we' against 'you'","Case","Number"],a:1,w:"And it runs all the way down: ἡμῶν/ὑμῶν, ἡμῖν/ὑμῖν, ἡμᾶς/ὑμᾶς. In John 4:22 both appear in one line and the whole sentence is the contrast.",sec:1},
{q:"The neuter singular of αὐτός is:",o:["αὐτόν","αὐτό — no final ν, like the article τό","αὐτῷ","αὐτός"],a:1,w:"The one irregularity in the paradigm, and it copies the article. αὐτόν is masculine accusative; αὐτό is neuter.",sec:2},
{q:"In ὁ κόσμος αὐτὸν οὐκ ἔγνω, why is αὐτόν accusative?",o:["Because the Word is masculine","Because it is the object of ἔγνω","Because κόσμος is nominative","Because John prefers the accusative"],a:1,w:"Case comes from the job. Gender and number came from the antecedent — masculine singular, because it stands for the Word.",sec:3},
{q:"ὁ πατὴρ ὑμῶν means:",o:["The Father of us","Your Father","The Father himself","That Father"],a:1,w:"A genitive pronoun after the noun is the ordinary way Greek shows possession — literally 'the Father of you'. Nearly two in five occurrences of αὐτός are genitive, and most are possessive.",sec:4},
{q:"Since the verb ending already names the subject, what does an added ἐγώ signal?",o:["Politeness","Emphasis on the subject","That the verb is plural","Nothing; it is required"],a:1,w:"Only 272 of αὐτός's 5,546 occurrences are nominative — under one in twenty. When a nominative pronoun appears, it is doing work. But a pronoun the syntax needed is not emphatic just by being there.",sec:5},
{q:"αὐτὸς ὁ κύριος means:",o:["The same Lord","The Lord himself","His Lord","That Lord"],a:1,w:"Predicate position — no article in front of αὐτός — gives 'self'. 1 Thessalonians 4:16.",sec:6},
{q:"ὁ αὐτὸς κύριος means:",o:["The Lord himself","The same Lord","The Lord alone","Their Lord"],a:1,w:"Attributive position — the article immediately before αὐτός — gives 'same'. 1 Corinthians 12:5. One article decides which of the two you are reading.",sec:6},
{q:"In Matthew 1:21, αὐτὸς γὰρ σώσει τὸν λαὸν αὐτοῦ, the two αὐτ- forms are:",o:["Both intensive","Intensive nominative, then a genitive of possession","Both possessive","A misprint for one word"],a:1,w:"'He himself will save his people.' The nominative is intensive; the genitive after the noun is 'his'. The verse adds a third, αὐτῶν, 'their sins'.",sec:6},
{q:"αὐτοῦ can be 'his', 'of it', or simply the case a preposition asked for. What decides?",o:["The accent","The job it is doing in the sentence","The book it appears in","It is always possessive"],a:1,w:"The form is the same; the gloss follows the job. This is why parsing and translating are two steps and not one.",sec:7}
]},

{id:10,t:"Perfect and pluperfect active indicative",s:"Completed action, continuing results",
body:`<p>You have met three of the Greek verb's principal parts: the present, the future and the aorist. This chapter introduces the fourth, the perfect, and with it the pluperfect that is built on the same stem.</p>
<p>The perfect is the tense most often preached on and the one most often overstated. What it actually claims is narrow, and worth holding precisely.</p>
<h3>Completed action, continuing state</h3>
<p>The perfect presents an action as <b>complete</b>, and presents the state resulting from it as <b>still standing</b>. The weight usually falls on the present state rather than on the past act.</p>
<p>Paul puts the contrast inside one sentence:</p>
<p class="v" data-ref="1 Corinthians 15:4">καὶ ὅτι ἐτάφη, καὶ ὅτι ἐγήγερται τῇ ἡμέρᾳ τῇ τρίτῃ κατὰ τὰς γραφάς</p>
<p>"And that he was buried, and that he has been raised on the third day according to the Scriptures." <span class="gk">ἐτάφη</span> is an aorist — an event, reported, finished. <span class="gk">ἐγήγερται</span> is a perfect. Paul is not only saying that the resurrection happened; he is saying that it happened and that Christ is risen still. Swap in an aorist and the sentence still reports the event and stops saying the second thing.</p>
<p>That is what the form is <i>for</i>. It is not a promise about what every instance of it achieves, which is where this chapter ends.</p>
<h3>The form: reduplication and κα</h3>
<p>Three things happen, and none of them is an augment.</p>
<p><b>1.</b> The first consonant of the stem is doubled with an <span class="gk">ε</span> between: <span class="gk">λυ-</span> becomes <span class="gk">λελυ-</span>. This is <i>reduplication</i>, and it is the perfect's signature.<br>
<b>2.</b> <span class="gk">κα</span> is added after the stem.<br>
<b>3.</b> The endings are the secondary active ones you already know.</p>
<p>So <span class="gk">λύω</span> gives <span class="gk">λέλυκα, λέλυκας, λέλυκε(ν), λελύκαμεν, λελύκατε, λελύκασι(ν)</span> — the full column is in Tables, beside the four tenses you already have. Note that the first singular has no ν and the third ends in <span class="gk">-ε(ν)</span>, which is what keeps them apart.</p>
<p>Real examples look exactly like that. First person: <span class="gk">πιστεύω → πεπίστευκα</span>, <span class="gk">λαλέω → λελάληκα</span>. Third: <span class="gk">ποιέω → πεποίηκεν</span>, <span class="gk">μαρτυρέω → μεμαρτύρηκεν</span>.</p>
<h3>When the reduplication is not a plain doubling</h3>
<p>Three kinds of stem will not take a doubled consonant. You do not need the rules to recite, only the shapes to recognise.</p>
<p><b>A stem beginning with a vowel</b> lengthens it instead, which makes it look exactly like an augment:</p>
<p class="v" data-ref="Matthew 10:7">Ἤγγικεν ἡ βασιλεία τῶν οὐρανῶν</p>
<p>"The kingdom of heaven has drawn near." <span class="gk">ἐγγίζω</span> becomes <span class="gk">ἤγγικεν</span>, and the perfect is the point: it has come near, and it is near.</p>
<p><b>A stem beginning with two consonants</b> gives up and uses a bare <span class="gk">ἐ-</span>. <span class="gk">γινώσκω</span> becomes <span class="gk">ἔγνωκεν</span> — the root behind it is <span class="gk">γνο-</span>, and you cannot double a <span class="gk">γν</span>.</p>
<p><b>A stem beginning with an aspirate</b> — <span class="gk">φ, θ, χ</span> — reduplicates with the unaspirated partner <span class="gk">π, τ, κ</span>, because Greek will not have two rough sounds in successive syllables:</p>
<p class="v" data-ref="Romans 3:21">δικαιοσύνη θεοῦ πεφανέρωται</p>
<p>"A righteousness of God has been revealed." <span class="gk">φανερόω</span> gives <span class="gk">πε-</span>, not <span class="gk">φε-</span>.</p>
<p>The habit is simpler than the rules: a doubled first syllable, or a lengthened first vowel with a <span class="gk">κ</span> further in, means perfect.</p>
<h3>Second perfects</h3>
<p>Some verbs form the perfect without the <span class="gk">κ</span>. They are conjugated identically otherwise, and — as with first and second aorists in chapter 7 — the difference is one of form only. A second perfect means everything a first perfect means.</p>
<p><span class="gk">γίνομαι → γέγονεν</span> · <span class="gk">γράφω → γέγραφα</span> · <span class="gk">ἔρχομαι → ἐλήλυθεν</span> · <span class="gk">λαμβάνω → εἴληφεν</span> · <span class="gk">πείθω → πέποιθεν</span> · <span class="gk">ἀκούω → ἀκηκόαμεν</span></p>
<p class="v" data-ref="John 19:22">Ὃ γέγραφα γέγραφα</p>
<p>"What I have written, I have written." Pilate says it twice, in the perfect both times, and the tense is why the sentence closes the matter. Not "I wrote it" but "it is written, and it stands".</p>
<h3>The perfect in the text</h3>
<p><span class="gk">γέγραπται</span> is the standard formula for introducing Scripture — 67 occurrences — and it is a perfect. Not "it was written once", but "it stands written".</p>
<p class="v" data-ref="John 19:30">εἶπεν· Τετέλεσται</p>
<p>"He said, 'It is finished.'" One word: finished then, finished still. (Both of these are passives, which come later; the tense is what is in view.)</p>
<p class="v" data-ref="2 Timothy 4:7">τὸν καλὸν ἀγῶνα ἠγώνισμαι, τὸν δρόμον τετέλεκα, τὴν πίστιν τετήρηκα</p>
<p>"I have fought the good fight, I have finished the race, I have kept the faith." Three perfects in a row — not three past events, but where Paul now stands as a result of them.</p>
<h3>The pluperfect</h3>
<p>The pluperfect is the past of the perfect: complete, with results that stood at some past moment. It takes an augment <i>as well as</i> the reduplication and inserts <span class="gk">-ει-</span> before the endings — <span class="gk">ἐλελύκειν, ἐλελύκεις, ἐλελύκει</span>.</p>
<p class="v" data-ref="Mark 15:10">ἐγίνωσκεν γὰρ ὅτι διὰ φθόνον παραδεδώκεισαν αὐτὸν οἱ ἀρχιερεῖς</p>
<p>"For he knew that the chief priests had handed him over out of envy." <span class="gk">παραδεδώκεισαν</span> does exactly what it says: they had done it, and it stood done while Pilate weighed what to do next.</p>
<p>It is rare — 88 pluperfects in the whole New Testament against 1,572 perfects — so recognition is the goal and drilling it is not worth your week. And of those 88, thirty-four belong to <span class="gk">οἶδα</span> and thirteen to <span class="gk">ἵστημι</span>, and neither of those is translated as a past perfect at all. Which brings us to the largest fact in the chapter.</p>
<h3>οἶδα, and ᾔδειν</h3>
<p><span class="gk">οἶδα</span> means "I know". It is perfect in form and present in meaning, and it occurs 296 times.</p>
<p>Here it is. <b>210 of those are perfect active indicatives — one in three of every perfect active indicative in the New Testament — and not one means "I have known".</b> Parse <span class="gk">οἶδα</span> as a present and its pluperfect <span class="gk">ᾔδειν</span> as an imperfect, "I knew", as every reference work does.</p>
<p><span class="gk">ἵστημι</span> behaves the same way: <span class="gk">ἕστηκα</span> is "I have taken my stand", which in English is simply "I am standing".</p>
<p class="v" data-ref="John 1:26">μέσος ὑμῶν ἕστηκεν ὃν ὑμεῖς οὐκ οἴδατε</p>
<p>"Among you stands one whom you do not know." Two perfects, neither rendered as a perfect in any English Bible — because in both the resulting state is the point and the past act has receded from view. Which is the perfect working exactly as described.</p>
<h3>Don't over-preach it</h3>
<p>This is the tense most likely to be pushed too far from a pulpit, and it is worth naming what pushing it looks like.</p>
<p><b>The form does not guarantee emphasis.</b> Some verbs simply live in the perfect — <span class="gk">οἶδα</span>, <span class="gk">ἕστηκα</span>, <span class="gk">γέγονεν</span>, <span class="gk">πέποιθα</span>. There it is a fact about the vocabulary, not a decision by the author.</p>
<p><b>The choice belongs to the writer's viewpoint, not to the events.</b> A perfect says the writer wanted the result in view; it does not say the event was different.</p>
<p>So ask two questions before building on it. Could an aorist have stood here, and does the sentence around it care about the result? Where the answer to both is yes — Paul on the resurrection, John at the cross — the perfect is carrying real weight, and it is worth saying so.</p>
<p>That is not scepticism. The perfect really is the most exegetically loaded tense in Greek. It is simply not loaded every time.</p>`,
v:[13,53],
vids:[{t:"Lecture 10: Perfect and Pluperfect Active Indicative",s:"Daily Dose of Greek — Rob Plummer (21:20)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-10/"}],
quiz:[
{q:"The perfect is the fourth principal part. Which three came before it?",o:["Present, imperfect, aorist","Present, future, aorist","Aorist, imperfect, pluperfect","Present, future, imperfect"],a:1,w:"Present, future and aorist active. The perfect stem gives the perfect, the pluperfect and the rare future perfect.",sec:0},
{q:"In 1 Corinthians 15:4, ἐτάφη is aorist and ἐγήγερται is perfect. What does the change do?",o:["Nothing — they are stylistic variants","The burial is reported as an event; the resurrection as an event whose result still stands","It marks a change of subject","The perfect makes it less certain"],a:1,w:"Paul is not only saying the resurrection happened. He is saying Christ is risen still. Replace the perfect with an aorist and the sentence stops saying the second thing.",sec:1},
{q:"The two form-markers of the perfect active are:",o:["Augment and σ","Reduplication and κα","Augment and θη","Reduplication and σ"],a:1,w:"λέ-λυ-κ-α. The augment belongs to past-time indicatives; the perfect reduplicates instead — which is why the perfect is not, strictly, a past tense at all.",sec:2},
{q:"γινώσκω forms its perfect as ἔγνωκεν rather than γεγνωκεν. Why?",o:["It is irregular for no reason","The stem begins with two consonants, so the reduplication collapses to ἐ-","It is a second perfect","The κ was lost"],a:1,w:"Doubling a consonant cluster is unpronounceable, so Greek falls back to a plain ἐ-. Vowel-initial stems lengthen instead, and aspirates reduplicate with their unaspirated partner.",sec:3},
{q:"φανερόω gives πεφανέρωται, not φεφανέρωται. What is happening?",o:["A spelling variant","Greek avoids two aspirates in successive syllables, so φ reduplicates as π","The stem changed","It is a second perfect"],a:1,w:"Deaspiration. φ, θ and χ reduplicate as π, τ and κ. Romans 3:21.",sec:3},
{q:"A second perfect differs from a first perfect in:",o:["Meaning — it is weaker","Form only — it has no κ","Time — it refers further back","Voice"],a:1,w:"γέγονεν, γέγραφα, ἐλήλυθεν, εἴληφεν, πέποιθεν. Exactly the situation with first and second aorists in chapter 7: a different way of building the same tense.",sec:4},
{q:"Ὃ γέγραφα γέγραφα (John 19:22). Why does the perfect close the matter?",o:["Because Pilate repeats it","Because the perfect presents the writing as done and standing done","Because it is passive","Because γράφω is irregular"],a:1,w:"'What I have written, I have written.' Not a report of an act but a statement about a state — which is why it functions as a refusal.",sec:4},
{q:"γέγραπται introduces Scripture 67 times. What does it convey?",o:["It was written once","It stands written","It will be written","Someone used to write"],a:1,w:"The perfect: the writing was completed and its result is in force. That is why it is the citation formula.",sec:5},
{q:"How many pluperfects are there in the New Testament?",o:["About 900","88","Around 400","None"],a:1,w:"88, against 1,572 perfects — and 47 of the 88 belong to οἶδα and ἵστημι, which are not translated 'had —' at all. Recognise it; do not spend your week on it.",sec:6},
{q:"The pluperfect is built with:",o:["Reduplication alone","An augment as well as the reduplication, plus -ει- before the endings","κα and no reduplication","The aorist stem"],a:1,w:"ἐ-λε-λύ-κ-ει-ν. It is a past tense, so unlike the perfect it does take an augment — though the augment is often left off.",sec:6},
{q:"οἶδα is perfect in form. What is it in meaning?",o:["Past","Present — 'I know'","Future","Conditional"],a:1,w:"And it is not a curiosity: 210 of the 602 perfect active indicatives in the New Testament are οἶδα. One in three, and none of them means 'I have known'. Its pluperfect ᾔδειν likewise just means 'I knew'.",sec:7},
{q:"Before building a point on a perfect, what is worth asking?",o:["Whether the verb is common","Whether an aorist could have stood there, and whether the sentence cares about the result","Whether it is in the Gospels","Whether it has a κ"],a:1,w:"Some verbs simply live in the perfect — οἶδα, ἕστηκα, γέγονεν — and there the tense is lexical, not rhetorical. Where the writer had a choice and the context cares about the result, the perfect is carrying real weight.",sec:8}
]},

{id:11,t:"Demonstrative pronouns",s:"οὗτος and ἐκεῖνος — this and that",
body:`<p>Greek points with two words. <span class="gk">οὗτος</span> is "this", for what is near at hand; <span class="gk">ἐκεῖνος</span> is "that", for what is further off. Between them they occur 1,627 times, and both decline with endings you already have.</p>
<p>What has to be learnt here is not the forms. It is the three quite different jobs a demonstrative does, and the one place where a breathing mark is the whole difference between two words.</p>
<h3>οὗτος: the forms</h3>
<table><caption>οὗτος — this (singular / plural)</caption>
<tr><th></th><th>Masc</th><th>Fem</th><th>Neut</th></tr>
<tr><th>Nom</th><td class="g">οὗτος / οὗτοι</td><td class="g">αὕτη / αὗται</td><td class="g">τοῦτο / ταῦτα</td></tr>
<tr><th>Gen</th><td class="g">τούτου / τούτων</td><td class="g">ταύτης / τούτων</td><td class="g">τούτου / τούτων</td></tr>
<tr><th>Dat</th><td class="g">τούτῳ / τούτοις</td><td class="g">ταύτῃ / ταύταις</td><td class="g">τούτῳ / τούτοις</td></tr>
<tr><th>Acc</th><td class="g">τοῦτον / τούτους</td><td class="g">ταύτην / ταύτας</td><td class="g">τοῦτο / ταῦτα</td></tr></table>
<p>Two patterns make this far less work than the table looks.</p>
<p><b>The τ goes where the article's τ goes.</b> Every form begins with <span class="gk">τ</span> except the four nominatives where the article also has none — <span class="gk">ὁ, ἡ, οἱ, αἱ</span> against <span class="gk">οὗτος, αὕτη, οὗτοι, αὗται</span>. If you know the article, you already know this.</p>
<p><b>The stem vowel echoes the ending.</b> <span class="gk">ου</span> before an o-sound, <span class="gk">αυ</span> before an a or η: <span class="gk">τούτου</span> but <span class="gk">ταύτης</span>, <span class="gk">τούτῳ</span> but <span class="gk">ταύτῃ</span>. Notice that and the paradigm nearly predicts itself.</p>
<h3>ἐκεῖνος: the forms</h3>
<p><span class="gk">ἐκεῖνος, ἐκείνη, ἐκεῖνο</span> — and after that there is nothing to learn. It declines exactly like <span class="gk">αὐτός</span>, which declines like <span class="gk">ἀγαθός</span>, including the same exception in the same place: the neuter singular <span class="gk">ἐκεῖνο</span> has no final ν.</p>
<p class="v" data-ref="Matthew 24:19">ἐν ἐκείναις ταῖς ἡμέραις</p>
<p>"In those days" — dative plural feminine, agreeing with <span class="gk">ἡμέραις</span>, and a phrase you will meet often in the Gospels.</p>
<p><span class="gk">ἐκεῖνος</span> occurs 242 times against <span class="gk">οὗτος</span>'s 1,385, much the rarer of the two. But where it turns up it is often doing something deliberate, which is the last part of this chapter.</p>
<h3>With a noun: outside the article, still "this"</h3>
<p>When a demonstrative modifies a noun, the noun keeps its article and the demonstrative stands <b>outside</b> the article group. That is predicate position — and here, unlike with an adjective, it does not make a predicate. It still means "this".</p>
<p>Either side of the noun will do, and Mark and Luke happen to give us one of each in the same scene:</p>
<p class="v" data-ref="Mark 15:39">Ἀληθῶς οὗτος ὁ ἄνθρωπος υἱὸς θεοῦ ἦν</p>
<p class="v" data-ref="Luke 23:47">Ὄντως ὁ ἄνθρωπος οὗτος δίκαιος ἦν</p>
<p>Mark reports "truly this man was God's Son", Luke "certainly this man was righteous". The reported words differ; what does not is <span class="gk">οὗτος ὁ ἄνθρωπος</span> against <span class="gk">ὁ ἄνθρωπος οὗτος</span> — before the article in one, after the noun in the other, both "this man". Matthew, reporting the same centurion, gives a third option:</p>
<p class="v" data-ref="Matthew 27:54">Ἀληθῶς θεοῦ υἱὸς ἦν οὗτος</p>
<p>"Truly this was God's Son." No <span class="gk">ἄνθρωπος</span> at all, so <span class="gk">οὗτος</span> is standing on its own — which is the next section.</p>
<p>Compare that with chapter 6. An adjective in predicate position — <span class="gk">ἀγαθὸς ὁ ἄνθρωπος</span> — means "the man <i>is</i> good". A demonstrative there does not; it is simply where demonstratives live.</p>
<p class="v" data-ref="1 Corinthians 11:25">Τοῦτο τὸ ποτήριον ἡ καινὴ διαθήκη ἐστὶν</p>
<p>"This cup is the new covenant." <span class="gk">Τοῦτο</span> sits outside the article and modifies <span class="gk">ποτήριον</span>; what is predicated is <span class="gk">ἡ καινὴ διαθήκη</span>.</p>
<h3>Standing on its own</h3>
<p>With no article-bearing noun to modify, a demonstrative is simply a pronoun: "this one", "that one", "these things".</p>
<p class="v" data-ref="Matthew 3:17">Οὗτός ἐστιν ὁ υἱός μου ὁ ἀγαπητός</p>
<p>"This is my beloved Son." Nothing for <span class="gk">οὗτος</span> to modify, so it is the subject on its own.</p>
<p class="v" data-ref="Acts 9:36">αὕτη ἦν πλήρης ἔργων ἀγαθῶν</p>
<p>"She was full of good works" — of Tabitha. The form is feminine, so English needs "she" rather than "this".</p>
<p class="v" data-ref="John 10:1">ἐκεῖνος κλέπτης ἐστὶν καὶ λῃστής</p>
<p>"That man is a thief and a robber." <span class="gk">κλέπτης</span> has no article, so it is the predicate rather than the thing <span class="gk">ἐκεῖνος</span> modifies.</p>
<p>The test is short: an articular noun to go with, and it modifies it; none, and it stands alone. The two commonest forms of <span class="gk">οὗτος</span> are both neuter and both usually stand alone — <span class="gk">τοῦτο</span>, "this", 303 times, and <span class="gk">ταῦτα</span>, "these things", 235, of which <span class="gk">μετὰ ταῦτα</span> accounts for 26.</p>
<h3>Pointing back at what was just said</h3>
<p>The third use is a demonstrative reaching back to someone named a moment earlier, where English would simply say "he".</p>
<p class="v" data-ref="John 1:8">οὐκ ἦν ἐκεῖνος τὸ φῶς</p>
<p>"He was not the light." <span class="gk">ἐκεῖνος</span> is John the Baptist, named in the verse before, and every English translation gives it as "he".</p>
<p>This is worth knowing precisely because the translation flattens it. The writer chose a word that points; the English gives you a pronoun. Nothing is hidden — but to see where a writer is directing attention, you have to read the Greek.</p>
<h3>Watch the breathing</h3>
<p><span class="gk">αὕτη</span>, with a rough breathing, is "this" — the demonstrative in this chapter. <span class="gk">αὐτή</span>, with a smooth one, is "she" — the personal pronoun from chapter 9. Nothing else separates them.</p>
<p>The counts are lopsided, and knowing that helps: <span class="gk">αὕτη</span> occurs 72 times, <span class="gk">αὐτή</span> 10. In the plural, more so — <span class="gk">αὗται</span> twice, and <span class="gk">αὐταί</span> not once in the New Testament.</p>
<p>So the odds favour the demonstrative. Odds are not reading, and this is where skimming the diacritics finally costs something. Keep one more pair apart while you are here: <span class="gk">ταῦτα</span>, "these things", against <span class="gk">ταύτας</span>, "these", feminine accusative plural.</p>
<h3>ἐκεῖνος in John</h3>
<p>John uses <span class="gk">ἐκεῖνος</span> more than any other writer — 70 of its 242 occurrences, in a Gospel a good deal shorter than Luke's — and often of a person, with weight rather than distance.</p>
<p class="v" data-ref="1 John 2:6">ὀφείλει καθὼς ἐκεῖνος περιεπάτησεν καὶ αὐτὸς περιπατεῖν</p>
<p>"He ought himself to walk as that one walked." <span class="gk">ἐκεῖνος</span> is Christ, and John does not name him — the pointing word does it.</p>
<p class="v" data-ref="John 16:13">ὅταν δὲ ἔλθῃ ἐκεῖνος, τὸ πνεῦμα τῆς ἀληθείας</p>
<p>"When that one comes, the Spirit of truth."</p>
<p>A note on that verse, because it gets pressed too hard. <span class="gk">ἐκεῖνος</span> is masculine while <span class="gk">πνεῦμα</span> is neuter, and this is sometimes offered as grammatical proof of the Spirit's personhood. The grammar will not carry it. <span class="gk">ἐκεῖνος</span> agrees with <span class="gk">ὁ παράκλητος</span>, the masculine noun John used back in verse 7 — ordinary agreement with the antecedent. The doctrine rests on what John says about the Spirit across the passage, which is a great deal, and it does not need a pronoun's gender.</p>
<p>Which is what noticing a demonstrative is for: to ask who is being pointed at, and then read on for the answer.</p>`,
v:[235,55,56,99,115,165,171,241,193,200,271,273,275,280,216,293,312,316,321,341,218,422,434,441,442,479,213,480,478],
vids:[{t:"Lecture 11: Demonstrative Pronouns",s:"Daily Dose of Greek — Rob Plummer (12:22)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-11/"}],
quiz:[
{q:"Greek's two demonstratives are:",o:["αὐτός and ἐκεῖνος","οὗτος (this, near) and ἐκεῖνος (that, far)","ὁ and οὗτος","τοῦτο and ταῦτα"],a:1,w:"1,385 occurrences of οὗτος and 242 of ἐκεῖνος. Both decline with endings you already know.",sec:0},
{q:"Where does οὗτος begin with τ rather than a rough breathing?",o:["Everywhere","Everywhere except the nominatives that the article also spells without τ","Only in the plural","Only in the neuter"],a:1,w:"οὗτος, αὕτη, οὗτοι, αὗται match ὁ, ἡ, οἱ, αἱ — the four places the article has no τ. Everywhere else the demonstrative has one, exactly as the article does.",sec:1},
{q:"Why is it ταύτης but τούτου?",o:["They are different words","The stem vowel echoes the ending — αυ before α or η, ου before an o-sound","One is older","An accent rule"],a:1,w:"τούτῳ but ταύτῃ, τοῦτον but ταύτην. Once you see it, the paradigm nearly predicts itself.",sec:1},
{q:"ἐκεῖνος declines like:",o:["The article","αὐτός — and so like ἀγαθός, neuter ἐκεῖνο with no ν","οὗτος","A third-declension noun"],a:1,w:"There is genuinely nothing new to learn in its endings, including the missing ν on the neuter singular.",sec:2},
{q:"In οὗτος ὁ ἄνθρωπος, the demonstrative stands outside the article. What does that mean?",o:["'The man is this'","'This man' — predicate position is simply where demonstratives live","'The same man'","It is ungrammatical"],a:1,w:"Unlike an adjective, a demonstrative in predicate position does not predicate. Mark 15:39 has οὗτος ὁ ἄνθρωπος and Luke 23:47 has ὁ ἄνθρωπος οὗτος of the same centurion's words — both 'this man'.",sec:3},
{q:"An adjective in predicate position — ἀγαθὸς ὁ ἄνθρωπος — means 'the man is good'. A demonstrative there means:",o:["'The man is this'","'This man' — the rule does not carry across","Nothing; it is not allowed","'The same man'"],a:1,w:"This is the one place the position rule from chapter 6 does not transfer, and it is worth fixing now.",sec:3},
{q:"ἐκεῖνος κλέπτης ἐστὶν καὶ λῃστής (John 10:1). Why is ἐκεῖνος not modifying κλέπτης?",o:["It is the wrong gender","κλέπτης has no article, so it is the predicate — the demonstrative stands alone as subject","It is plural","ἐκεῖνος never modifies a noun"],a:1,w:"The test: an articular noun to modify, and it modifies it; no article, and it stands alone. 'That man is a thief and a robber.'",sec:4},
{q:"ταῦτα, 235 occurrences, means:",o:["This woman","These things","The same things","Those men"],a:1,w:"Neuter plural of οὗτος. μετὰ ταῦτα, 'after these things', accounts for 26 of them.",sec:4},
{q:"In οὐκ ἦν ἐκεῖνος τὸ φῶς (John 1:8), ἐκεῖνος refers to:",o:["The Word","John the Baptist, named in the verse before","The light","God"],a:1,w:"A demonstrative pointing back at someone just mentioned. Every English translation renders it 'he' — which is right, and is also why you have to read the Greek to see that John chose a word that points.",sec:5},
{q:"αὕτη and αὐτή differ by:",o:["Nothing","A breathing — αὕτη is 'this', αὐτή is 'she'","Number","Case"],a:1,w:"72 occurrences against 10, and in the plural αὗται occurs twice while αὐταί never occurs at all. The odds favour the demonstrative; odds are not reading.",sec:6},
{q:"In John 16:13, ἐκεῖνος is masculine while πνεῦμα is neuter. Why?",o:["It proves the Spirit's personhood grammatically","It agrees with ὁ παράκλητος, the masculine noun in verse 7","It is a scribal error","Greek demonstratives have no gender"],a:1,w:"Ordinary agreement with the antecedent. The doctrine of the Spirit's personhood rests on what John says across the passage, and does not need a pronoun's gender — claiming otherwise hands an opponent an easy answer.",sec:7}
]},

{id:12,t:"Present middle and passive indicative",s:"Where English has no equivalent",
body:`<p>Voice describes how the subject of a verb relates to the action. Every verb you have read so far has been <b>active</b>: the subject does the thing. This chapter introduces the other two.</p>
<p>The <b>passive</b> English has too — the subject receives the action. The <b>middle</b> it does not, and that is the difficulty. In the middle, the subject acts with reference to itself: on itself, for itself, or in its own interest.</p>
<p>This is not a corner of the language. Middle and passive indicatives are 3,799 of the New Testament's 15,589 — one in four.</p>
<h3>One set of endings, two voices</h3>
<p>The primary middle and passive endings are:</p>
<table><caption>Primary middle/passive endings</caption>
<tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>1st</th><td class="g">-μαι</td><td class="g">-μεθα</td></tr>
<tr><th>2nd</th><td class="g">-σαι</td><td class="g">-σθε</td></tr>
<tr><th>3rd</th><td class="g">-ται</td><td class="g">-νται</td></tr></table>
<p>One set, and both voices use it. In the present, imperfect, perfect and pluperfect, <b>a middle and a passive are spelled identically</b>. The form cannot tell you which is meant. Only the verb and the sentence can.</p>
<p>Worth being honest about what follows from that. When this app's reader labels a form "middle" or "passive", that is an editorial judgement about the sentence, not something read off the letters — and you are entitled to disagree with it.</p>
<h3>The paradigm, and the odd second singular</h3>
<table><caption>λύομαι — present middle and passive</caption>
<tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>1st</th><td class="g">λύομαι</td><td class="g">λυόμεθα</td></tr>
<tr><th>2nd</th><td class="g">λύῃ</td><td class="g">λύεσθε</td></tr>
<tr><th>3rd</th><td class="g">λύεται</td><td class="g">λύονται</td></tr></table>
<p>The connecting vowel ο/ε shows plainly in five of the six. The exception is the second singular, and it is worth a minute now because the same thing happens in each of the next three chapters.</p>
<p><span class="gk">λύῃ</span> began as <span class="gk">λύεσαι</span>. The σ dropped out between two vowels, and the ε and α contracted, taking the ι underneath. Greek does this whenever an ending starting with σ meets a connecting vowel — so every second person singular in the middle looks irregular, and none of them is.</p>
<h3>What the passive says</h3>
<p>The subject receives the action, exactly as in English. What differs is that Greek does with one word what English needs two or three for: <span class="gk">λύομαι</span> is "I am being loosed".</p>
<p>Prefer that longer rendering while you are learning. "I am loosed" is closer to the Greek perfect passive, which is the next chapter, and blurring the two costs you the difference between them.</p>
<p class="v" data-ref="Matthew 11:5">λεπροὶ καθαρίζονται καὶ κωφοὶ ἀκούουσιν, καὶ νεκροὶ ἐγείρονται καὶ πτωχοὶ εὐαγγελίζονται</p>
<p>"Lepers are being cleansed and deaf people hear, and dead people are being raised and poor people have good news preached to them." <span class="gk">καθαρίζονται</span>, <span class="gk">ἐγείρονται</span> and <span class="gk">εὐαγγελίζονται</span> are all present passives, and Jesus does not say by whom — a point we come back to.</p>
<h3>What the middle says</h3>
<p>There is no single English rendering, because the middle does not name <i>how</i> the subject is involved. It only says that it is. <span class="gk">λύομαι</span> as a middle could be "I am loosing myself", "I am loosing for myself", or "I myself am loosing", and the sentence decides.</p>
<p>The clearest evidence that it is doing real work is a verb that means two different things in the two voices. <span class="gk">ἄρχω</span>, active, means "I rule". <span class="gk">ἄρχομαι</span>, middle, means "I begin" — and 84 of that verb's 86 occurrences are middle.</p>
<p>Be careful not to overstate it. Where Greek wants a plain reflexive it usually says so with an active verb and a reflexive pronoun:</p>
<p class="v" data-ref="John 17:19">ὑπὲρ αὐτῶν ἐγὼ ἁγιάζω ἐμαυτόν</p>
<p>"For their sake I sanctify myself." Active verb, reflexive pronoun, nothing left to the middle at all.</p>
<h3>Deponent verbs</h3>
<p>A great many Greek verbs have middle or passive forms and no active ones. They are called <b>deponent</b>, from the Latin for "laid aside", on the theory that the active forms were dropped somewhere in the language's history. They are middle in form and active in meaning.</p>
<p>Here is the number that ought to change how you read the middle: <b>443 of the 683 present middle indicatives in the New Testament — two in three — belong to verbs that have no active form anywhere.</b> The two commonest are <span class="gk">ἔρχεται</span> (85) and <span class="gk">δύναται</span> (69), and neither means anything reflexive.</p>
<p>So when you meet a middle, the first question is not "what is the middle voice doing here?" It is "does this verb have an active at all?" Usually it does not, and the ending is simply how the word is spelled.</p>
<p>One practical oddity: some of these take an object in a case other than the accusative. <span class="gk">ἀποκρίνομαι</span> takes the dative, and <span class="gk">ἄρχω</span> the genitive.</p>
<h3>By whom, through whom, by what</h3>
<p>A passive often names the agent, and Greek has three ways of doing it — two of them from chapter 8.</p>
<p><b>Direct agent:</b> <span class="gk">ὑπό</span> with the genitive.</p>
<p class="v" data-ref="1 Corinthians 14:24">ἐλέγχεται ὑπὸ πάντων, ἀνακρίνεται ὑπὸ πάντων</p>
<p>"He is convicted by all, he is called to account by all."</p>
<p><b>Intermediate agent:</b> <span class="gk">διά</span> with the genitive — the one <i>through</i> whom the first agent acts.</p>
<p><b>Impersonal means:</b> the bare dative, with or without <span class="gk">ἐν</span>.</p>
<p class="v" data-ref="Ephesians 2:8">τῇ γὰρ χάριτί ἐστε σεσῳσμένοι διὰ πίστεως</p>
<p>"For by grace you have been saved through faith." Both at once: grace in the dative as the means, faith with <span class="gk">διά</span> as what it comes through. (<span class="gk">σεσῳσμένοι</span> is a perfect passive — the next chapter.)</p>
<p>Very often no agent is named at all, and when the unnamed agent is plainly God the construction is called a <b>divine passive</b>. It is common in the sayings of Jesus.</p>
<p class="v" data-ref="Matthew 5:4">μακάριοι οἱ πενθοῦντες, ὅτι αὐτοὶ παρακληθήσονται</p>
<p>"Blessed are those who mourn, for they shall be comforted" — by God, and Matthew does not need to say so.</p>
<h3>What to watch for</h3>
<p><b>The form will not decide it for you.</b> Middle and passive share endings in four tenses. Ask what the verb means before asking what the voice is doing.</p>
<p><b>Most middles are lexical.</b> Two in three are deponent. Reach for "the middle voice is emphasising something" last, not first.</p>
<p><b>Translate the present passive as "is being —".</b> It keeps the tense's aspect visible and it keeps the perfect free to mean what it means.</p>
<p><b>And <span class="gk">λύῃ</span> is second singular</b>, not third, however much it looks like <span class="gk">λύει</span> with a subscript.</p>`,
v:[23,28,65,104,243,194,294,299,306,211,377,391,403,436,497],
vids:[{t:"Lecture 12: Present Middle and Passive Indicative",s:"Daily Dose of Greek — Rob Plummer (14:35)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-12/"},
      {t:"Present Middle/Passive Endings Memory Device",s:"Daily Dose of Greek — a hook for -ομαι, -ῃ, -εται",yt:"NUq-8hvNgqU"},
      {t:"Mnemonic Song for the Middle-Passive Endings",s:"Daily Dose of Greek — the same set, sung",yt:"4t5dSkwrMqk"}],
quiz:[
{q:"Greek has three voices. What does the middle add that English lacks?",o:["A politer form","The subject acting with reference to itself","A past tense","A way of marking plurals"],a:1,w:"Active: the subject does it. Passive: the subject receives it. Middle: the subject acts on itself, for itself, or in its own interest — and English has no single construction for it.",sec:0},
{q:"In the present, how do you tell a middle from a passive by its form?",o:["The accent","The connecting vowel","You cannot — they are spelled identically","The augment"],a:2,w:"One set of endings serves both, in the present, imperfect, perfect and pluperfect. Only the verb and the sentence decide, which is why a parsing that says 'middle' is a judgement rather than a reading.",sec:1},
{q:"The primary middle/passive endings are:",o:["-ω, -εις, -ει…","-μαι, -σαι, -ται, -μεθα, -σθε, -νται","-ν, -ς, —, -μεν, -τε, -σαν","-μην, -σο, -το…"],a:1,w:"Learn these six. They reappear on the perfect middle/passive and the future middle in the next chapter, straight onto a different stem.",sec:1},
{q:"Why is the second singular λύῃ rather than λύεσαι?",o:["It is irregular and must be memorised","The σ dropped between vowels and ε + αι contracted","It is a different verb","A scribal simplification"],a:1,w:"Greek drops σ between vowels. The same thing happens in the future middle (λύσῃ) and again in the secondary endings, so it is one fact, not three exceptions.",sec:2},
{q:"λύομαι as a passive is best rendered:",o:["I loose","I am being loosed","I have been loosed","I loosed"],a:1,w:"'I am loosed' belongs to the perfect passive. Keeping 'I am being loosed' for the present preserves the imperfective aspect and keeps the two tenses distinct.",sec:3},
{q:"In Matthew 11:5, who is named as doing the cleansing and raising?",o:["Jesus","The disciples","No one — the agent is left unstated","The crowds"],a:2,w:"Three present passives with no agent. Where the unnamed agent is plainly God, the construction is called a divine passive, and it is very common in the sayings of Jesus.",sec:3},
{q:"ἄρχω is 'I rule'. What does the middle ἄρχομαι mean?",o:["I am ruled","I begin","I rule myself","I am ruling"],a:1,w:"A different word in the middle, and 84 of the verb's 86 occurrences are middle. A verb whose two voices mean two things is the clearest evidence the middle is doing real work.",sec:4},
{q:"John 17:19 has ἐγὼ ἁγιάζω ἐμαυτόν. Why is that worth noticing here?",o:["ἁγιάζω is a middle","Greek usually expresses a plain reflexive with an active verb and a reflexive pronoun, not with the middle","It is the only reflexive in John","ἐμαυτόν is a middle ending"],a:1,w:"'I sanctify myself' — active verb, reflexive pronoun. Strictly reflexive middles are much rarer than the textbook categories suggest.",sec:4},
{q:"What proportion of present middle indicatives belong to verbs with no active form at all?",o:["About a tenth","Two in three","All of them","None"],a:1,w:"443 of 683. ἔρχεται and δύναται alone are 154 of them. So the first question about a middle is whether the verb even has an active — usually it does not.",sec:5},
{q:"ἀποκρίνομαι takes its object in which case?",o:["Accusative","Dative","Genitive","Nominative"],a:1,w:"ἀπεκρίθη αὐτοῖς — 'he answered them'. ἄρχω takes the genitive. A handful of verbs simply do not use the accusative, and the lexicon says which.",sec:5},
{q:"Greek marks the agent of a passive three ways. Which marks impersonal means?",o:["ὑπό + genitive","διά + genitive","The bare dative, with or without ἐν","πρός + accusative"],a:2,w:"τῇ χάριτι, 'by grace' (Ephesians 2:8). ὑπό + genitive is the direct agent; διά + genitive the one it came through.",sec:6},
{q:"λύῃ is which person?",o:["Third singular","Second singular","First plural","Third plural"],a:1,w:"Second singular middle/passive — not λύει with a subscript. The pair is a standing trap, and the contracted second singular is the reason.",sec:7}
]},

{id:13,t:"Perfect middle/passive and future middle",s:"Endings straight onto the stem",
body:`<p>Two more sets of forms, and no new endings to learn. Both use the primary middle and passive endings from chapter 12 — <span class="gk">-μαι, -σαι, -ται, -μεθα, -σθε, -νται</span> — attached to a stem you already know how to build.</p>
<p>The perfect middle and passive is the verb's <b>fifth principal part</b>. What is new about it is not the endings but where they go: straight onto the reduplicated stem, with no connecting vowel in between.</p>
<h3>The perfect middle and passive</h3>
<table><caption>λέλυμαι — perfect middle and passive</caption>
<tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>1st</th><td class="g">λέλυμαι</td><td class="g">λελύμεθα</td></tr>
<tr><th>2nd</th><td class="g">λέλυσαι</td><td class="g">λέλυσθε</td></tr>
<tr><th>3rd</th><td class="g">λέλυται</td><td class="g">λέλυνται</td></tr></table>
<p>Reduplication exactly as in chapter 10, then the ending. Because there is no connecting vowel the σ of the second singular survives here — <span class="gk">λέλυσαι</span>, not a contracted form.</p>
<p>The meaning is the perfect's meaning: a completed action whose result stands. As a passive, <span class="gk">λέλυμαι</span> is "I have been loosed", or simply "I am loosed".</p>
<p>One form dominates this whole category. <span class="gk">γέγραπται</span> — "it stands written" — accounts for 67 of the 202 perfect passive indicatives in the New Testament, one in three.</p>
<p class="v" data-ref="John 20:31">ταῦτα δὲ γέγραπται ἵνα πιστεύητε</p>
<p>"But these things have been written so that you may believe." Written then, and standing written now, which is why John chose the tense.</p>
<h3>When the stem ends in a consonant</h3>
<p>These endings begin with <span class="gk">μ, σ, τ</span> and <span class="gk">ν</span>, and a stem ending in a consonant has to meet them. The result is a spelling change, and there is no point learning the rules.</p>
<p><span class="gk">γράφω</span> has the stem <span class="gk">γραφ-</span>. Before the <span class="gk">-ται</span> of the third singular the φ hardens to π: <span class="gk">γέγραπται</span>.</p>
<p class="v" data-ref="Romans 8:38">πέπεισμαι γὰρ ὅτι οὔτε θάνατος οὔτε ζωὴ</p>
<p>"For I am convinced that neither death nor life…" <span class="gk">πείθω</span> has the stem <span class="gk">πειθ-</span>, and before the <span class="gk">-μαι</span> the θ becomes σ: <span class="gk">πέπεισμαι</span>. Note the sense — not "I was persuaded" but "I stand persuaded", which is the perfect doing its work.</p>
<p>What to take from this is recognition, not derivation. A doubled first syllable and one of these endings means a perfect middle or passive, whatever has happened to the consonant in between.</p>
<h3>The future middle</h3>
<table><caption>λύσομαι — future middle</caption>
<tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>1st</th><td class="g">λύσομαι</td><td class="g">λυσόμεθα</td></tr>
<tr><th>2nd</th><td class="g">λύσῃ</td><td class="g">λύσεσθε</td></tr>
<tr><th>3rd</th><td class="g">λύσεται</td><td class="g">λύσονται</td></tr></table>
<p>This one is simply the future stem — the second principal part, with its σ — plus a connecting vowel plus the same endings. And because there is a connecting vowel, the second singular contracts again: <span class="gk">λύσῃ</span>, from <span class="gk">λύσεσαι</span>.</p>
<p>The future passive is built on a different stem altogether and waits until chapter 15.</p>
<p class="v" data-ref="Matthew 26:64">ἀπ’ ἄρτι ὄψεσθε τὸν υἱὸν τοῦ ἀνθρώπου</p>
<p>"From now on you will see the Son of Man." <span class="gk">ὄψεσθε</span> is the future middle of <span class="gk">ὁράω</span> — middle in form and plainly active in meaning.</p>
<h3>ἔσομαι: the future of εἰμί</h3>
<table><caption>ἔσομαι — I will be</caption>
<tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>1st</th><td class="g">ἔσομαι</td><td class="g">ἐσόμεθα</td></tr>
<tr><th>2nd</th><td class="g">ἔσῃ</td><td class="g">ἔσεσθε</td></tr>
<tr><th>3rd</th><td class="g">ἔσται</td><td class="g">ἔσονται</td></tr></table>
<p>Built on the stem <span class="gk">ἐσ-</span> with the same endings, and with this the paradigm of <span class="gk">εἰμί</span> is complete in every tense you need.</p>
<p>Learn it properly, because it is not a footnote: <b>186 of the 489 future middle indicatives in the New Testament belong to <span class="gk">εἰμί</span></b> — two in five. <span class="gk">ἔσται</span> alone occurs 117 times.</p>
<p class="v" data-ref="Revelation 21:7">ἔσομαι αὐτῷ θεὸς καὶ αὐτὸς ἔσται μοι υἱός</p>
<p>"I will be God to him, and he will be a son to me."</p>
<h3>Telling them apart</h3>
<p>You now have three sets of forms ending in <span class="gk">-μαι</span> and <span class="gk">-ται</span>, and they are told apart by what sits in front of the ending.</p>
<table>
<tr><th>Form</th><th>Marker</th><th>Tense</th></tr>
<tr><td class="g">λύεται</td><td>connecting vowel, nothing else</td><td>present</td></tr>
<tr><td class="g">λέλυται</td><td>reduplication, no connecting vowel</td><td>perfect</td></tr>
<tr><td class="g">λύσεται</td><td>σ before the connecting vowel</td><td>future</td></tr></table>
<p>Three words, one ending, and the whole difference is in the middle of them. This is the habit worth building from this chapter: read the front of the verb, not the back.</p>
<h3>Adverbs</h3>
<p>An adverb qualifies a verb, an adjective or another adverb, and Greek adverbs do not decline, which makes them the easiest words you will learn.</p>
<p>Many are made from adjectives by putting <span class="gk">-ως</span> where the genitive plural has <span class="gk">-ων</span>: <span class="gk">καλῶν</span> gives <span class="gk">καλῶς</span>, "well". Others are frozen case endings — <span class="gk">σήμερον</span>, "today", is an accusative. The rest simply have to be met and learned.</p>
<p>One in this chapter's list is worth a note. <span class="gk">εὐθύς</span>, "immediately", occurs 59 times in the New Testament and <b>42 of them are in Mark</b> — in the shortest of the Gospels. It is the single clearest fingerprint of his style, and you will feel it as soon as you read him in Greek.</p>
<h3>μέν … δέ</h3>
<p>These two little words work as a pair, marking a contrast: <span class="gk">μέν</span> sets something up, and <span class="gk">δέ</span> answers it. "On the one hand… on the other."</p>
<p class="v" data-ref="1 Corinthians 1:12">Ἐγὼ μέν εἰμι Παύλου, Ἐγὼ δὲ Ἀπολλῶ</p>
<p>"I am of Paul; and I of Apollos." Usually the best English leaves <span class="gk">μέν</span> untranslated and renders <span class="gk">δέ</span> as "but" — the balance is in the Greek structure and does not need a word of its own.</p>
<p>With the plural article the pair means "some… others":</p>
<p class="v" data-ref="Acts 14:4">οἱ μὲν ἦσαν σὺν τοῖς Ἰουδαίοις οἱ δὲ σὺν τοῖς ἀποστόλοις</p>
<p>"Some were with the Jews, and others with the apostles."</p>
<p>Both words are postpositive — they never begin their clause, and stand second. <span class="gk">μέν</span> occurs 178 times, so this is a pattern to recognise rather than a curiosity.</p>`,
v:[16,36,49,83,95,107,109,114,240,177,155,314,315,343,342,375,416],
vids:[{t:"Lecture 13: Perfect Middle and Passive, Future Middle Indicative",s:"Daily Dose of Greek — Rob Plummer (9:47)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-13/"}],
quiz:[
{q:"The perfect middle/passive attaches its endings:",o:["With a connecting vowel, as in the present","Straight onto the reduplicated stem, with no connecting vowel","To the aorist stem","After an augment"],a:1,w:"λέ-λυ-μαι. That is why the second singular keeps its σ — λέλυσαι — where the present contracts to λύῃ.",sec:0},
{q:"γέγραπται accounts for how much of the perfect passive in the New Testament?",o:["A handful of verses","67 of 202 — one in three","Nearly all of it","Fewer than ten"],a:1,w:"'It stands written.' Learning one form gives you a third of the category, and the tense is why it works as a citation formula.",sec:1},
{q:"Why is it γέγραπται and not γέγραφται?",o:["A scribal error","The φ of the stem hardens to π before the τ of the ending","γράφω is irregular","It is a second perfect"],a:1,w:"A stem ending in a consonant has to meet an ending beginning with one. πείθω does the same: πέπεισμαι, with θ becoming σ. Recognise the shape; do not derive it.",sec:2},
{q:"πέπεισμαι (Romans 8:38) means:",o:["I was persuaded","I stand persuaded — I am convinced","I will be persuaded","I persuade"],a:1,w:"The perfect's completed act with a standing result, in the middle/passive. 'For I am convinced that neither death nor life…'",sec:2},
{q:"The future middle is built on:",o:["The reduplicated stem","The future stem — the second principal part, with its σ","The aorist stem","The present stem with an augment"],a:1,w:"λύ-σ-ομαι, plus a connecting vowel and the same primary middle endings. The future passive uses a different stem again and waits for chapter 15.",sec:3},
{q:"ὄψεσθε is the future middle of ὁράω. What does it mean?",o:["You will be seen","You will see","You see","You saw"],a:1,w:"'From now on you will see the Son of Man' (Matthew 26:64). Middle in form, plainly active in meaning — the deponent pattern from chapter 12, in the future.",sec:3},
{q:"How much of the future middle in the New Testament is the verb εἰμί?",o:["A tenth","186 of 489 — two in five","All of it","None; εἰμί has no future"],a:1,w:"ἔσται alone occurs 117 times. Learning ἔσομαι properly is worth more than any other single paradigm in this chapter.",sec:4},
{q:"λύεται, λέλυται and λύσεται share an ending. What separates them?",o:["The accent","What sits in front of it — a bare connecting vowel, reduplication, or σ","Nothing; context alone","The person"],a:1,w:"Present, perfect, future. The habit this chapter is really teaching is to read the front of a verb rather than the back.",sec:5},
{q:"How are many Greek adverbs formed from adjectives?",o:["By adding -ος","By replacing the -ων of the genitive plural with -ως","By adding an augment","By reduplication"],a:1,w:"καλῶν gives καλῶς, 'well'. Others are frozen case forms — σήμερον, 'today', is an accusative — and adverbs never decline.",sec:6},
{q:"εὐθύς occurs 59 times. Where are 42 of them?",o:["John","Mark","Acts","Paul's letters"],a:1,w:"In the shortest of the Gospels. 'Immediately' is the clearest single fingerprint of Mark's style, and you feel it at once reading him in Greek.",sec:6},
{q:"In Ἐγὼ μέν εἰμι Παύλου, Ἐγὼ δὲ Ἀπολλῶ, what is μέν doing?",o:["Negating","Setting up a contrast that δέ answers","Asking a question","Marking the past"],a:1,w:"'On the one hand… on the other.' The best English usually leaves μέν untranslated and gives δέ as 'but'. With the plural article the pair means 'some… others'.",sec:7}
]},

{id:14,t:"Imperfect middle/passive, aorist middle, pluperfect middle/passive",s:"The secondary middle endings",
body:`<p>Chapter 12 gave the primary middle and passive endings, used by the present, the perfect and the future. This chapter gives the other set — the <b>secondary</b> middle and passive endings, used by the past tenses — and then applies them to four stems you already know how to build.</p>
<p>There is genuinely one new thing here. Everything after it is assembly.</p>
<h3>The secondary middle and passive endings</h3>
<table><caption>Secondary middle/passive endings</caption>
<tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>1st</th><td class="g">-μην</td><td class="g">-μεθα</td></tr>
<tr><th>2nd</th><td class="g">-σο</td><td class="g">-σθε</td></tr>
<tr><th>3rd</th><td class="g">-το</td><td class="g">-ντο</td></tr></table>
<p>Compare them with the primary set from chapter 12 and the family resemblance is obvious: the plurals <span class="gk">-μεθα</span> and <span class="gk">-σθε</span> are identical, and the singulars differ only in their final vowel.</p>
<p>As with the primary set, <b>one series does duty for both voices</b>. In the imperfect and the pluperfect, middle and passive are spelled the same, and only the sentence separates them.</p>
<h3>The imperfect middle and passive</h3>
<table><caption>ἐλυόμην — imperfect middle and passive</caption>
<tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>1st</th><td class="g">ἐλυόμην</td><td class="g">ἐλυόμεθα</td></tr>
<tr><th>2nd</th><td class="g">ἐλύου</td><td class="g">ἐλύεσθε</td></tr>
<tr><th>3rd</th><td class="g">ἐλύετο</td><td class="g">ἐλύοντο</td></tr></table>
<p>Augment, present stem, connecting vowel, secondary ending. The second singular <span class="gk">ἐλύου</span> is <span class="gk">ἐλύεσο</span> with the σ dropped and the vowels contracted — the same change that produced <span class="gk">λύῃ</span> and <span class="gk">λύσῃ</span>, and the last time it will surprise you.</p>
<p class="v" data-ref="Matthew 3:6">καὶ ἐβαπτίζοντο ἐν τῷ Ἰορδάνῃ ποταμῷ ὑπ’ αὐτοῦ</p>
<p>"And they were being baptised in the river Jordan by him." An imperfect passive with its agent named, and the imperfective aspect is the point — a queue of people, not a single event.</p>
<p class="v" data-ref="Matthew 7:28">ἐξεπλήσσοντο οἱ ὄχλοι ἐπὶ τῇ διδαχῇ αὐτοῦ</p>
<p>"The crowds were astonished at his teaching." Passive in form; in English we would not call it passive at all.</p>
<h3>The aorist middle</h3>
<table><caption>ἐλυσάμην — first aorist middle</caption>
<tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>1st</th><td class="g">ἐλυσάμην</td><td class="g">ἐλυσάμεθα</td></tr>
<tr><th>2nd</th><td class="g">ἐλύσω</td><td class="g">ἐλύσασθε</td></tr>
<tr><th>3rd</th><td class="g">ἐλύσατο</td><td class="g">ἐλύσαντο</td></tr></table>
<p>Augment, then the first aorist stem with its <span class="gk">σα</span>, then the same endings. Set it beside the imperfect above and the only difference is that <span class="gk">σα</span>.</p>
<p>The aorist <i>passive</i> is a different stem entirely and is the whole of chapter 15. So in the aorist, unlike everywhere else in this chapter, the middle and the passive really are distinguishable.</p>
<p class="v" data-ref="Ephesians 1:4">καθὼς ἐξελέξατο ἡμᾶς ἐν αὐτῷ πρὸ καταβολῆς κόσμου</p>
<p>"Just as he chose us in him before the foundation of the world." <span class="gk">ἐξελέξατο</span> is a middle, and here the voice is doing real work: God chose <i>for himself</i>.</p>
<h3>Second aorist middles</h3>
<p>A verb with a second aorist forms its middle on that stem, and conjugates it exactly like an imperfect middle. The stem is the only difference — which means the two are told apart by the stem and nothing else.</p>
<p>One verb dominates the category. <span class="gk">γίνομαι</span> gives <span class="gk">ἐγενόμην</span>, and <span class="gk">ἐγένετο</span> alone occurs 201 times: <b>nearly a third of every aorist middle in the New Testament.</b></p>
<p class="v" data-ref="John 1:6">Ἐγένετο ἄνθρωπος ἀπεσταλμένος παρὰ θεοῦ</p>
<p>"There came a man sent from God." Learn <span class="gk">ἐγένετο</span> as a word in its own right, rather than as a paradigm slot, and a third of the aorist middles in the New Testament come free with it.</p>
<h3>The pluperfect middle and passive</h3>
<table><caption>ἐλελύμην — pluperfect middle and passive</caption>
<tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>1st</th><td class="g">ἐλελύμην</td><td class="g">ἐλελύμεθα</td></tr>
<tr><th>2nd</th><td class="g">ἐλέλυσο</td><td class="g">ἐλέλυσθε</td></tr>
<tr><th>3rd</th><td class="g">ἐλέλυτο</td><td class="g">ἐλέλυντο</td></tr></table>
<p>Augment, reduplicated perfect stem, secondary endings straight on with no connecting vowel. The augment is often dropped, since the reduplication already identifies it.</p>
<p>Now the number, because it should govern how long you spend here. <b>There are seven pluperfect middle or passive indicatives in the whole New Testament</b> — seven different verbs, one occurrence each. Recognise the shape and move on.</p>
<p class="v" data-ref="Matthew 7:25">οὐκ ἔπεσεν, τεθεμελίωτο γὰρ ἐπὶ τὴν πέτραν</p>
<p>"It did not fall, for it had been founded on the rock." That is one of the seven, and it is the house on the rock — so you have already met the form without knowing it.</p>
<h3>How much of this you actually meet</h3>
<p>Four chapters of middle and passive forms invite the question of where a week is best spent. The New Testament answers it:</p>
<table>
<tr><th>Form</th><th>Indicatives</th></tr>
<tr><td>aorist passive</td><td>863</td></tr>
<tr><td>present middle</td><td>683</td></tr>
<tr><td>aorist middle</td><td>641</td></tr>
<tr><td>future middle</td><td>489</td></tr>
<tr><td>future passive</td><td>292</td></tr>
<tr><td>present passive</td><td>274</td></tr>
<tr><td>imperfect middle</td><td>233</td></tr>
<tr><td>perfect passive</td><td>202</td></tr>
<tr><td>imperfect passive</td><td>83</td></tr>
<tr><td>perfect middle</td><td>32</td></tr>
<tr><td>pluperfect middle and passive</td><td>7</td></tr></table>
<p>The aorist passive is next chapter and is the largest of them. The pluperfect middle and passive is a rounding error. Spend accordingly.</p>
<h3>What to watch for</h3>
<p><b>The imperfect middle and the second aorist middle are identical but for the stem.</b> <span class="gk">ἐγίνετο</span> against <span class="gk">ἐγένετο</span> — one vowel, and it is the whole tense.</p>
<p><b>The second singular contracts, again.</b> <span class="gk">ἐλύου</span> and <span class="gk">ἐλύσω</span> do not look like they belong to their paradigms. They do.</p>
<p><b>Deponents stay deponent in the past.</b> <span class="gk">ἔρχομαι</span> gives <span class="gk">ἤρχετο</span>, <span class="gk">πορεύομαι</span> gives <span class="gk">ἐπορεύετο</span>. If the present had no active, neither does the imperfect.</p>`,
v:[75,124,154,284,290,298,509,380,467,508],
vids:[{t:"Lecture 14: Imperfect Middle and Passive, Aorist Middle, Pluperfect Middle and Passive",s:"Daily Dose of Greek — Rob Plummer (15:32)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-14/"},
      {t:"Imperfect Middle-Passive Memory Device",s:"Daily Dose of Greek — the secondary middle endings",yt:"4ytjsQSWDkQ"}],
quiz:[
{q:"How do the secondary middle/passive endings relate to the primary set?",o:["They are unrelated","The plurals -μεθα and -σθε are identical; the singulars differ in their last vowel","They are the active endings","They are used only in the perfect"],a:1,w:"-μην, -σο, -το against -μαι, -σαι, -ται. Learning the second set is mostly a matter of noticing how little of it is new.",sec:1},
{q:"Which tenses use the secondary middle/passive endings?",o:["Present and future","The past tenses — imperfect, aorist middle, pluperfect","Perfect only","All of them"],a:1,w:"Primary endings for the present, perfect and future; secondary for the past tenses. The same division you met with the active in chapter 7.",sec:0},
{q:"The imperfect middle/passive is built from:",o:["The aorist stem plus σα","Augment + present stem + connecting vowel + secondary ending","Reduplication + ending","The future stem"],a:1,w:"ἐ-λυ-ό-μην. Since it uses the present stem, a verb deponent in the present is deponent in the imperfect too — ἔρχομαι gives ἠρχόμην.",sec:2},
{q:"In Matthew 3:6, ἐβαπτίζοντο … ὑπ’ αὐτοῦ. What does the imperfect contribute?",o:["It marks a single completed event","It presents the baptising as under way — a queue of people, not one act","It marks the future","Nothing; it is stylistic"],a:1,w:"Imperfective aspect in a past tense. ὑπ’ αὐτοῦ names the agent, which is what tells you this one is passive rather than middle.",sec:2},
{q:"What separates the first aorist middle from the imperfect middle?",o:["The augment","The σα of the aorist stem","The endings","The accent"],a:1,w:"ἐλυόμην against ἐλυσάμην. Same augment, same endings; the aspect morpheme is the whole difference.",sec:3},
{q:"ἐξελέξατο (Ephesians 1:4) is a middle. What does the voice add?",o:["Nothing — it is deponent","That God chose for himself","That God was chosen","That the choosing is ongoing"],a:1,w:"'Just as he chose us in him before the foundation of the world.' One of the places where the middle is genuinely carrying sense rather than just being how the verb is spelled.",sec:3},
{q:"ἐγένετο occurs 201 times. That is what share of the aorist middle?",o:["About a twentieth","Nearly a third","All of it","Half"],a:1,w:"641 aorist middle indicatives in the New Testament, and one form is 201 of them. Learn ἐγένετο as a word in its own right.",sec:4},
{q:"A second aorist middle is conjugated:",o:["Like the perfect","Exactly like an imperfect middle, but on the second aorist stem","With σα","With an added θη"],a:1,w:"Which is why ἐγινόμην and ἐγενόμην are told apart by one vowel in the stem and by nothing else at all.",sec:4},
{q:"How many pluperfect middle or passive indicatives are there in the New Testament?",o:["About 90","Seven","Around 300","None"],a:1,w:"Seven, spread across seven different verbs, one each. τεθεμελίωτο in Matthew 7:25 — the house founded on the rock — is one of them. Recognise the shape and spend your week elsewhere.",sec:5},
{q:"Which middle or passive form is commonest in the New Testament?",o:["The perfect passive","The aorist passive, at 863","The pluperfect","The present passive"],a:1,w:"And it is the whole of the next chapter. The present middle is next at 683, the aorist middle at 641; the perfect middle is 32 and the pluperfect middle/passive is 7.",sec:6},
{q:"ἐλύου and ἐλύσω look irregular. Why are they not?",o:["They are irregular","The σ of the ending dropped between vowels and the vowels contracted — the same process as λύῃ","They belong to different verbs","They are imperatives"],a:1,w:"Third time in three chapters. One sound change explains every odd-looking second person singular in the middle.",sec:7}
]},

{id:15,t:"Aorist and future passive indicative",s:"The θη that changes who does what",
body:`<p>The aorist passive is the last principal part, and with it the set is complete: <span class="gk">λύω, λύσω, ἔλυσα, λέλυκα, λέλυμαι, ἐλύθην</span>. Six forms, and from them every form of the verb can be built.</p>
<p>It is also the commonest of these forms by a wide margin. There are 863 aorist passive indicatives in the New Testament — more than any other middle or passive form — which makes this the chapter of the four to get right.</p>
<h3>The first aorist passive</h3>
<table><caption>ἐλύθην — first aorist passive</caption>
<tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>1st</th><td class="g">ἐλύθην</td><td class="g">ἐλύθημεν</td></tr>
<tr><th>2nd</th><td class="g">ἐλύθης</td><td class="g">ἐλύθητε</td></tr>
<tr><th>3rd</th><td class="g">ἐλύθη</td><td class="g">ἐλύθησαν</td></tr></table>
<p>Three pieces: the augment, then <span class="gk">θη</span> — the passive marker, and the thing to look for — then the endings.</p>
<p>And here is the surprise. Those endings are the <b>secondary active</b> ones from chapter 7: <span class="gk">-ν, -ς, —, -μεν, -τε, -σαν</span>. A passive built with active endings. Do not fight it; just note that <span class="gk">θη</span> is what marks the voice, and the endings mark nothing but the person.</p>
<p>The third singular <span class="gk">ἐλύθη</span> has no ending at all, which makes it the shortest and the commonest shape you will meet.</p>
<h3>When the stem ends in a consonant</h3>
<p>A stem ending in a consonant collides with the θ, and the two combine. The three rules are worth reading once and then leaving:</p>
<table>
<tr><td class="g">κ, γ, χ</td><td>+ θ →</td><td class="g">χθ</td><td><span class="gk">ἄγω → ἤχθη</span></td></tr>
<tr><td class="g">π, β, φ</td><td>+ θ →</td><td class="g">φθ</td><td><span class="gk">πέμπω → ἐπέμφθη</span></td></tr>
<tr><td class="g">τ, δ, θ</td><td>+ θ →</td><td class="g">σθ</td><td><span class="gk">βαπτίζω → ἐβαπτίσθη</span></td></tr></table>
<p>These are the same three groupings that governed the future in chapter 3 and the aorist active in chapter 7. It is one sound rule you have now met three times, and the useful residue is simply this: <b>a θ preceded by χ, φ or σ is very often an aorist passive.</b></p>
<h3>Second aorist passives</h3>
<p>Some verbs form the aorist passive with no θ at all — the <span class="gk">η</span> attaches straight to the stem. As with second aorists and second perfects, the difference is form only.</p>
<p class="v" data-ref="Romans 15:4">ὅσα γὰρ προεγράφη, εἰς τὴν ἡμετέραν διδασκαλίαν ἐγράφη</p>
<p>"For whatever was written beforehand was written for our instruction." <span class="gk">γράφω</span> gives <span class="gk">ἐγράφην</span>, and both verbs here are that form.</p>
<p class="v" data-ref="Luke 1:26">ἀπεστάλη ὁ ἄγγελος Γαβριὴλ ἀπὸ τοῦ θεοῦ</p>
<p>"The angel Gabriel was sent from God." <span class="gk">ἀποστέλλω</span> gives <span class="gk">ἀπεστάλην</span> — again no θ, and again the augment tucked inside the compound.</p>
<p>A verb with a second aorist passive has a second future passive too, likewise without the θ.</p>
<h3>The future passive</h3>
<p>Build the aorist passive stem, drop the augment, add <span class="gk">σ</span> and the <i>primary middle</i> endings from chapter 12: <span class="gk">λυθήσομαι, λυθήσῃ, λυθήσεται…</span></p>
<p>So a future passive carries both marks at once — the <span class="gk">θη</span> of the passive and the <span class="gk">σ</span> of the future — which makes it one of the most recognisable forms in the language. The commonest are <span class="gk">δοθήσεται</span> (16), <span class="gk">σωθήσεται</span> (13) and <span class="gk">ἀφεθήσεται</span> (11).</p>
<p class="v" data-ref="Matthew 5:4">μακάριοι οἱ πενθοῦντες, ὅτι αὐτοὶ παρακληθήσονται</p>
<p>"Blessed are those who mourn, for they shall be comforted." A future passive with no agent named — the divine passive of chapter 12, and one of the places where leaving God unnamed is the whole force of the line.</p>
<h3>The passive at work</h3>
<p class="v" data-ref="1 Timothy 3:16">ἐφανερώθη ἐν σαρκί, ἐδικαιώθη ἐν πνεύματι, ὤφθη ἀγγέλοις, ἐκηρύχθη ἐν ἔθνεσιν, ἐπιστεύθη ἐν κόσμῳ, ἀνελήμφθη ἐν δόξῃ</p>
<p>"He was revealed in flesh, vindicated in spirit, seen by angels, proclaimed among the nations, believed on in the world, taken up in glory."</p>
<p>Six aorist passive indicatives in a row, and every one has the same shape: augment, stem, <span class="gk">θη</span> or its consonant variant, ending. <span class="gk">ἐκηρύχθη</span> shows the κ-group rule and <span class="gk">ἀνελήμφθη</span> the π-group. The rhythm, and the bare <span class="gk">Ὅς</span> that opens it with no antecedent, are why this is usually taken to be an existing hymn being quoted rather than composed.</p>
<p>Notice too what the passive is doing across the whole hymn. Christ is the subject of every line and the actor in none of them. That is a deliberate choice, and it is not available in an English translation that turns the verbs active.</p>
<p class="v" data-ref="Matthew 28:18">Ἐδόθη μοι πᾶσα ἐξουσία ἐν οὐρανῷ καὶ ἐπὶ τῆς γῆς</p>
<p>"All authority in heaven and on earth has been given to me." Given by whom is not said, and does not need to be.</p>
<h3>Passive in form, active in sense</h3>
<p>Now the warning this chapter exists for, and it is the same shape as <span class="gk">οἶδα</span> in chapter 10.</p>
<p><b>The commonest aorist passive in the New Testament is not passive.</b> <span class="gk">ἀποκρίνομαι</span> supplies 104 of the 863, more than any other verb, and <span class="gk">ἀπεκρίθη</span> means "he answered" — not "he was answered".</p>
<p class="v" data-ref="Mark 15:9">ὁ δὲ Πιλᾶτος ἀπεκρίθη αὐτοῖς λέγων</p>
<p>"But Pilate answered them, saying." A passive form, an active meaning, and a dative object.</p>
<p>It is not alone. <span class="gk">ἐπορεύθη</span> is "he went", <span class="gk">ἐγενήθη</span> is "it became", <span class="gk">ἐφοβήθησαν</span> is "they were afraid". Altogether <b>251 of the 863 aorist passives — nearly one in three — belong to verbs that have no active form anywhere in the New Testament.</b></p>
<p>So the <span class="gk">θη</span> tells you the form. It does not, on its own, tell you the meaning.</p>
<h3>What to watch for</h3>
<p><b>Look for θη, not for an ending.</b> The endings are the secondary active ones, and they will mislead you if you read them first.</p>
<p><b>Check whether the verb has an active.</b> One aorist passive in three does not, and translating those as passives produces nonsense.</p>
<p><b>Both marks together mean future passive.</b> <span class="gk">θη</span> plus <span class="gk">σ</span>, as in <span class="gk">σωθήσεται</span>.</p>
<p><b>And when no agent is named, that may be the point.</b> Ask whether the writer is avoiding saying "God" — in the Gospels, very often he is.</p>`,
v:[],
vids:[{t:"Lecture 15: Aorist and Future Passive Indicative",s:"Daily Dose of Greek — Rob Plummer (9:49)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-15/"}],
quiz:[
{q:"The six principal parts of λύω end with:",o:["λέλυκα","λέλυμαι","ἐλύθην — the aorist passive","ἔλυσα"],a:2,w:"λύω, λύσω, ἔλυσα, λέλυκα, λέλυμαι, ἐλύθην. Every form of the verb is built from one of those six.",sec:0},
{q:"The first aorist passive is built with:",o:["Reduplication and κα","Augment + stem + θη + secondary ACTIVE endings","σα and the middle endings","An augment alone"],a:1,w:"A passive with active endings, which is the surprise of the chapter. θη marks the voice; the endings mark only the person.",sec:1},
{q:"Which piece of ἐλύθην tells you it is passive?",o:["The augment","The θη","The -ν","The accent"],a:1,w:"Look for θη, not for an ending. The third singular ἐλύθη has no ending at all, and it is the commonest shape in the paradigm.",sec:1},
{q:"βαπτίζω has the stem βαπτιδ-. Why is the aorist passive ἐβαπτίσθην?",o:["A scribal variant","τ, δ and θ become σ before the θ of the passive","The δ is dropped without trace","It is a second aorist passive"],a:1,w:"The same three consonant groupings that governed the future in chapter 3 and the aorist active in chapter 7. κ/γ/χ give χθ, π/β/φ give φθ, τ/δ/θ give σθ.",sec:2},
{q:"ἐγράφη and ἀπεστάλη have no θ. What are they?",o:["Actives","Second aorist passives — the same tense built without the θ","Perfects","Imperfects"],a:1,w:"As with second aorists and second perfects, the difference is form only. A verb with a second aorist passive also has a second future passive, likewise without the θ.",sec:3},
{q:"The future passive is built from the aorist passive stem plus:",o:["A second augment","σ and the primary middle endings","κα","Reduplication"],a:1,w:"λυθήσομαι. Both marks at once — θη for the passive and σ for the future — which makes it one of the most recognisable forms in Greek.",sec:4},
{q:"In Matthew 5:4, παρακληθήσονται names no agent. Why not?",o:["The agent is unknown","It is a divine passive — the unnamed comforter is God","Greek passives never name an agent","A textual variant"],a:1,w:"'They shall be comforted.' Leaving God unnamed is the force of the line, and the construction is common in the sayings of Jesus.",sec:4},
{q:"1 Timothy 3:16 has six verbs in a row. What are they?",o:["Six aorist actives","Six aorist passive indicatives","Six perfects","Six futures"],a:1,w:"ἐφανερώθη, ἐδικαιώθη, ὤφθη, ἐκηρύχθη, ἐπιστεύθη, ἀνελήμφθη. Christ is the subject of every line and the actor in none — a choice an English translation with active verbs cannot show.",sec:5},
{q:"ἐκηρύχθη shows which consonant rule?",o:["π, β, φ + θ → φθ","κ, γ, χ + θ → χθ","τ, δ, θ + θ → σθ","None; it is irregular"],a:1,w:"κηρύσσω has a stem in κ, so the aorist passive is ἐκηρύχθη. In the same verse ἀνελήμφθη shows the π-group.",sec:5},
{q:"Which verb supplies the most aorist passives in the New Testament?",o:["σῴζω","ἀποκρίνομαι — 104 of 863","γράφω","βαπτίζω"],a:1,w:"And ἀπεκρίθη means 'he answered', not 'he was answered'. The commonest aorist passive in the book is not passive at all.",sec:6},
{q:"How many of the 863 aorist passives belong to verbs with no active form anywhere?",o:["A handful","251 — nearly one in three","All of them","None"],a:1,w:"ἀπεκρίθη 'he answered', ἐπορεύθη 'he went', ἐγενήθη 'it became', ἐφοβήθησαν 'they were afraid'. The θη tells you the form; it does not on its own tell you the meaning.",sec:6},
{q:"Before translating a θη form as a passive, what is worth checking?",o:["The accent","Whether the verb has an active form at all","The book it is in","Whether it is plural"],a:1,w:"One aorist passive in three does not, and rendering those as passives produces nonsense. The lexicon answers it in a second.",sec:7}
]},

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

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

/* v:[…] — the words in the 470-word list that exemplify this chapter's
   grammar, by VOCAB index. Derived from each chapter's own subject (second
   declension gets the -ος/-ον nouns, ch.19 the contract and liquid verbs,
   ch.25 the -μι verbs, and so on), not copied from Black's printed lists —
   his are not reproduced here. Referencing existing indices only, so the
   append-only VOCAB invariant is untouched. Chapters 1, 2 and 16 introduce
   no words: the alphabet, the overview, and the review. */
const LESSONS=[
{id:1,t:"The letters and sounds of Greek",s:"The alphabet, breathings, accents and punctuation",
body:`<p>Everything downstream depends on being able to sound a word out. If you can't pronounce it, you can't hold it in memory. Spend two or three days here before moving on.</p>
<div id="alphaHere"></div>
<h3>Three rules that trip people up</h3>
<p><b>Sigma</b> is written <span class="gk">ς</span> at the end of a word and <span class="gk">σ</span> everywhere else. Same letter, same sound: <span class="gk">λόγος</span>.</p>
<p><b>Breathings.</b> Every word starting with a vowel carries a mark. Rough (<span class="gk">ἁ</span>) adds an <i>h</i>; smooth (<span class="gk">ἀ</span>) adds nothing. So <span class="gk">ἅγιος</span> is <i>hagios</i>, but <span class="gk">ἀγάπη</span> is <i>agapē</i>. Initial <span class="gk">ῥ</span> always takes the rough breathing.</p>
<p><b>Gamma nasal.</b> <span class="gk">γ</span> before <span class="gk">γ, κ, χ, ξ</span> is pronounced <i>n</i>. So <span class="gk">ἄγγελος</span> is <i>angelos</i>, not <i>aggelos</i>.</p>
<h3>A note on pronunciation</h3>
<p>Erasmian is a scholarly convention, not how anyone spoke in the first century. It survives because it keeps distinct sounds distinct — in modern Greek η, ι, υ, ει and οι have all collapsed into <i>ee</i>, which is punishing for spelling. Stay with Erasmian.</p>
<h3>Accents</h3>
<p>Greek has three accents: acute (<span class="gk">ά</span>), grave (<span class="gk">ὰ</span>) and circumflex (<span class="gk">ᾶ</span>). In Koine they no longer marked pitch, and for reading purposes they mostly matter for one reason: <b>they distinguish otherwise identical words</b>.</p>
<table><tr><th>Word</th><th>Meaning</th></tr>
<tr><td class="g">τίς</td><td>who? what? (interrogative)</td></tr>
<tr><td class="g">τις</td><td>someone, a certain (indefinite)</td></tr>
<tr><td class="g">εἰ</td><td>if</td></tr>
<tr><td class="g">εἶ</td><td>you are</td></tr>
<tr><td class="g">αὐτή</td><td>she (nominative)</td></tr>
<tr><td class="g">αὕτη</td><td>this (feminine)</td></tr></table>
<p>Don't memorise accent rules now. Learn accents as part of each word's spelling and move on.</p>
<h3>Punctuation</h3>
<p>Comma and full stop look like ours. A raised dot <span class="gk">·</span> is a semicolon or colon. And the mark that looks like a semicolon <span class="gk">;</span> is a <b>question mark</b> — this catches everyone at least once.</p>
<h3>Iota subscript</h3>
<p>A small iota written under a long vowel: <span class="gk">ᾳ, ῃ, ῳ</span>. It isn't pronounced, but it usually signals the <b>dative case</b> — about five times in six. The main exception is subjunctive endings, which you meet in chapter 23. Worth spotting.</p>`,
v:[],
vids:[{t:"Lecture 1: The Letters and Sounds of Greek",s:"Daily Dose of Greek — Rob Plummer (24:37)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-1/"},
      {t:"Alphabet song and Erasmian summary",s:"billmounce.com — free mp3 and worksheet",u:"https://www.billmounce.com/biblestudygreek2/greekalphabet"}],
quiz:[
{q:"How is ἄγγελος pronounced?",o:["ag-ge-los","an-ge-los","ah-ge-los","ang-khe-los"],a:1,w:"Gamma before another guttural becomes an n sound. This is why the English word is 'angel'."},
{q:"What does the rough breathing over ἁ add?",o:["Nothing","An h sound","A glottal stop","Length to the vowel"],a:1,w:"Rough breathing = h. ἅγιος is hagios. Smooth breathing adds nothing at all."},
{q:"Which letter is written two different ways depending on position?",o:["Beta","Sigma","Theta","Omega"],a:1,w:"σ within a word, ς at the end. One letter, one sound."},
{q:"In Greek, the mark ; means:",o:["Semicolon","Question mark","Full stop","Colon"],a:1,w:"It's a question mark. The raised dot · does the work of our semicolon and colon."},
{q:"τίς with an acute accent means:",o:["someone","a certain one","who? what?","this"],a:2,w:"Accented τίς is interrogative. Unaccented τις is indefinite: 'someone', 'a certain'. The accent is the only difference."},
{q:"An iota subscript (ᾳ, ῃ, ῳ) usually signals which case?",o:["Nominative","Genitive","Dative","Accusative"],a:2,w:"Dative. It's a silent letter but a loud grammatical clue."}]},

{id:2,t:"The Greek verbal system",s:"The map before the territory",
body:`<p>Before learning any paradigm, get the shape of the whole system. Every Greek verb form encodes five things: <b>person, number, tense, voice and mood</b>. Parsing a verb means naming all five — <span class="gk">λύομεν</span> is first person plural, present, active, indicative: "we loose".</p>
<h3>Aspect comes first</h3>
<p>The tenses differ less by <i>when</i> than by <i>how the action is viewed</i>. Greek has three aspects: <b>imperfective</b> (in progress, ongoing — present and imperfect), <b>perfective</b> (viewed as a whole, undefined — aorist), and <b>stative</b> (completed with continuing results — perfect and pluperfect). Time is only fixed in the indicative mood; outside it, aspect is nearly everything.</p>
<h3>Two sets of endings</h3>
<p><b>Primary</b> endings appear on tenses whose indicative refers to present or future time (present, future, perfect). <b>Secondary</b> endings appear on past-time tenses (imperfect, aorist, pluperfect), which also take the <b>augment</b> — an ε prefixed to the stem. Spotting augment + secondary endings tells you "past" before you've identified anything else.</p>
<h3>Principal parts</h3>
<p>Each verb has up to six principal parts, the building blocks from which every form is made: present, future, aorist active, perfect active, perfect middle/passive, aorist passive. For <span class="gk">λύω</span>: <span class="gk">λύω, λύσω, ἔλυσα, λέλυκα, λέλυμαι, ἐλύθην</span>. Regular verbs derive all six from one stem; the common irregulars must be learned — but there are far fewer of them than in English.</p>
<p><b>The discipline:</b> from now on, never say a form means something until you have parsed it. The endings are small; the payoff is the whole language.</p>`,
v:[],
vids:[{t:"Lecture 2: The Greek Verbal System",s:"Daily Dose of Greek — Rob Plummer (11:36)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-2/"}],
quiz:[
{q:"Parsing a Greek verb means naming:",o:["Tense and mood only","Person, number, tense, voice, mood","Case, gender, number","Stem and ending"],a:1,w:"All five. Person and number identify the subject; tense carries aspect; voice relates subject to action; mood signals reality or potential."},
{q:"The aorist's aspect presents the action as:",o:["Ongoing","Completed with continuing results","A whole, undefined","Repeated"],a:2,w:"Perfective — a snapshot rather than a film. It says nothing about duration or repetition; it just refers to the action as a whole."},
{q:"Where is time actually fixed by the tense form?",o:["Everywhere","Only in the indicative mood","Only in the aorist","Only with an augment"],a:1,w:"Only in the indicative. A present participle or aorist infinitive tells you aspect, not time — a distinction that guards you from over-reading."},
{q:"Augment + secondary endings signals:",o:["Future time","A command","Past time in the indicative","The passive voice"],a:2,w:"The augment (ε- prefix) marks past time and appears only in the indicative: imperfect, aorist, pluperfect."}]},

{id:3,t:"Present and future active indicative",s:"λύω and λύσω — your first two paradigms",
body:`<p>Greek verbs encode <b>person, number, tense, voice and mood</b> in the ending. Parsing means naming all five.</p>
<table><caption>λύω — I loose, untie</caption>
<tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>1st</th><td class="g">λύω</td><td class="g">λύομεν</td></tr>
<tr><th>2nd</th><td class="g">λύεις</td><td class="g">λύετε</td></tr>
<tr><th>3rd</th><td class="g">λύει</td><td class="g">λύουσι(ν)</td></tr></table>
<p>The stem is <span class="gk">λυ-</span>; everything after it is ending. The <span class="gk">ν</span> in brackets is a "movable nu", added before a vowel or at a pause — it carries no meaning.</p>
<h3>εἰμί — the verb "to be"</h3>
<p>Irregular and extremely common. Learn it separately.</p>
<table>
<tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>1st</th><td class="g">εἰμί</td><td class="g">ἐσμέν</td></tr>
<tr><th>2nd</th><td class="g">εἶ</td><td class="g">ἐστέ</td></tr>
<tr><th>3rd</th><td class="g">ἐστί(ν)</td><td class="g">εἰσί(ν)</td></tr></table>
<h3>The present is not simply "now"</h3>
<p>Greek tense encodes <b>aspect</b> primarily and time secondarily. The present is imperfective: the action viewed from inside, as ongoing or repeated. <span class="gk">πιστεύει</span> can be "he believes", "he is believing", "he keeps on believing" — the form itself doesn't settle which.</p>
<h3>The future: add σ</h3>
<p>The future active is the present with a σ between stem and ending:</p>
<table><caption>λύσω — I will loose</caption>
<tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>1st</th><td class="g">λύσω</td><td class="g">λύσομεν</td></tr>
<tr><th>2nd</th><td class="g">λύσεις</td><td class="g">λύσετε</td></tr>
<tr><th>3rd</th><td class="g">λύσει</td><td class="g">λύσουσι(ν)</td></tr></table>
<p>When σ meets a stop, they combine: κ, γ, χ + σ → ξ (<span class="gk">ἄγω → ἄξω</span>); π, β, φ + σ → ψ (<span class="gk">βλέπω → βλέψω</span>); τ, δ, θ simply drop (<span class="gk">πείθω → πείσω</span>). Contract verbs lengthen their final vowel first: <span class="gk">ἀγαπάω → ἀγαπήσω</span>, <span class="gk">ποιέω → ποιήσω</span>.</p>
<p>Some very common verbs have futures you must simply learn: <span class="gk">εἰμί → ἔσομαι</span>, <span class="gk">γινώσκω → γνώσομαι</span>, <span class="gk">λαμβάνω → λήμψομαι</span>, <span class="gk">ὁράω → ὄψομαι</span>. Notice these are middle in form — a preview of a pattern you'll meet properly later.</p>`,
v:[1,4,7,8,10,13,16,21,27,34,36,40,49,53,58,62,67,72,74],
vids:[{t:"Lecture 3: Present and Future Active Indicative",s:"Daily Dose of Greek — Rob Plummer (14:16)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-3/"}],
quiz:[
{q:"Parse λύομεν.",o:["1st plural present active indicative","1st singular present active indicative","2nd plural present active indicative","3rd plural present active indicative"],a:0,w:"'We loose.' The ending -ομεν is 1st person plural."},
{q:"What is the movable nu in λύουσιν?",o:["A plural marker","A meaningless addition before a vowel or pause","A sign of the subjunctive","A negation"],a:1,w:"Purely phonetic — like the English 'a' becoming 'an'. It carries no grammatical weight."},
{q:"The Greek present tense primarily encodes:",o:["Present time","Imperfective aspect","Completed action","Future intention"],a:1,w:"Aspect first, time second. Imperfective means viewed from inside, as ongoing — not necessarily happening right now."},
{q:"εἶ means:",o:["if","I am","you are","he is"],a:2,w:"'You are' — 2nd singular of εἰμί. Compare unaccented εἰ, 'if'. The accent is doing real work."},
{q:"The future of βλέπω is:",o:["βλέσω","βλέψω","βλέξω","βλεπήσω"],a:1,w:"A labial (π) plus σ gives ψ. Gutturals give ξ, and dentals drop before σ."},
{q:"ἔσομαι is the future of which verb?",o:["ἔχω","ἔρχομαι","εἰμί","ἐσθίω"],a:2,w:"The future of 'to be' — and it is middle in form. ἔσται (3rd singular) appears constantly in the Gospels: 'it will be'."}]},

{id:4,t:"Nouns of the second declension",s:"λόγος, ἔργον — and the article that parses them for you",
body:`<p>Greek nouns fall into three declensions — patterns of endings. The second is the most regular, so start here. Masculine nouns in <span class="gk">-ος</span>, neuter nouns in <span class="gk">-ον</span>.</p>
<table><caption>λόγος, -ου, ὁ — word (masculine)</caption>
<tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>Nom</th><td class="g">λόγος</td><td class="g">λόγοι</td></tr>
<tr><th>Gen</th><td class="g">λόγου</td><td class="g">λόγων</td></tr>
<tr><th>Dat</th><td class="g">λόγῳ</td><td class="g">λόγοις</td></tr>
<tr><th>Acc</th><td class="g">λόγον</td><td class="g">λόγους</td></tr></table>
<table><caption>ἔργον, -ου, τό — work (neuter)</caption>
<tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>Nom</th><td class="g">ἔργον</td><td class="g">ἔργα</td></tr>
<tr><th>Gen</th><td class="g">ἔργου</td><td class="g">ἔργων</td></tr>
<tr><th>Dat</th><td class="g">ἔργῳ</td><td class="g">ἔργοις</td></tr>
<tr><th>Acc</th><td class="g">ἔργον</td><td class="g">ἔργα</td></tr></table>
<p>Notice that neuter differs from masculine only in the nominative and accusative — everywhere else the endings are identical.</p>
<h3>Why lexicons list three things</h3>
<p><span class="gk">λόγος, -ου, ὁ</span> gives you the nominative, the genitive ending, and the article. The genitive tells you which declension it follows; the article tells you the gender. You need both, so learn nouns in this full form from the start.</p>
<h3>The definite article</h3>
<p>The article appears about 19,870 times in the New Testament — roughly one word in every seven. It agrees with its noun in <b>gender, number and case</b>, so once you know it you can read the case of almost any noun it's attached to, even when you don't know the noun.</p>
<p>Learn this paradigm cold. It is the highest-return memorisation in the language.</p>
<table><caption>Singular</caption>
<tr><th></th><th>Masc</th><th>Fem</th><th>Neut</th></tr>
<tr><th>Nom</th><td class="g">ὁ</td><td class="g">ἡ</td><td class="g">τό</td></tr>
<tr><th>Gen</th><td class="g">τοῦ</td><td class="g">τῆς</td><td class="g">τοῦ</td></tr>
<tr><th>Dat</th><td class="g">τῷ</td><td class="g">τῇ</td><td class="g">τῷ</td></tr>
<tr><th>Acc</th><td class="g">τόν</td><td class="g">τήν</td><td class="g">τό</td></tr></table>
<table><caption>Plural</caption>
<tr><th></th><th>Masc</th><th>Fem</th><th>Neut</th></tr>
<tr><th>Nom</th><td class="g">οἱ</td><td class="g">αἱ</td><td class="g">τά</td></tr>
<tr><th>Gen</th><td class="g">τῶν</td><td class="g">τῶν</td><td class="g">τῶν</td></tr>
<tr><th>Dat</th><td class="g">τοῖς</td><td class="g">ταῖς</td><td class="g">τοῖς</td></tr>
<tr><th>Acc</th><td class="g">τούς</td><td class="g">τάς</td><td class="g">τά</td></tr></table>
<h3>Shortcuts</h3>
<p>Genitive plural is <span class="gk">τῶν</span> in all three genders. Neuter nominative and accusative are always identical — true of every neuter word in Greek. Only four forms lack an initial τ: <span class="gk">ὁ, ἡ, οἱ, αἱ</span>, and all four are nominative.</p>
<h3>Greek uses the article where English doesn't</h3>
<p><span class="gk">ὁ θεός</span> is simply "God", not "the God". Conversely its absence can be significant. Don't over-read either way without checking how that author normally writes.</p>
<h3>What the cases do</h3>
<p>Endings are only useful if you know what each case <i>does</i>. This is where translation turns into exegesis.</p>
<h3>Nominative — the subject</h3>
<p>Names the subject, or the predicate after a linking verb: <span class="gk">θεὸς ἦν ὁ λόγος</span>. Note that in that clause the article marks <span class="gk">ὁ λόγος</span> as the subject even though <span class="gk">θεός</span> comes first.</p>
<h3>Genitive — description and separation</h3>
<p>Usually rendered "of". But it covers many relationships: possession, source, content, and the crucial <b>subjective/objective</b> distinction. <span class="gk">ἡ ἀγάπη τοῦ θεοῦ</span> can mean God's love for us (subjective) or our love for God (objective). Grammar cannot decide it; context must.</p>
<h3>Dative — the indirect object, and more</h3>
<p>"To" or "for", but also instrument ("by means of"), location ("in"), and sphere. <span class="gk">τῇ πίστει</span> could be "by faith", "in faith", or "for faith" depending on context.</p>
<h3>Accusative — the direct object</h3>
<p>Receives the action. Also expresses extent of time or space.</p>
<h3>Vocative — direct address</h3>
<p>"O Lord!" Usually looks like the nominative; you'll rarely need to think about it.</p>
<p><b>The discipline:</b> when a commentary says "this is a genitive of source", it is making an interpretive claim, not reporting a fact. Ask what the alternatives are and why this one was chosen.</p>`,
v:[0,12,17,20,31,32,46,48,51,55,79,82,87,88,90,97,99,111,115,127,132,144,162,165,167,169,171,241,193,252,200,210,256,219,271,273,275,280,216,293,300,301,312,316,330,341,346,218,388,394,412,422,432,434,442,450,453,217,213],
vids:[{t:"Lecture 4: Nouns of the Second Declension",s:"Daily Dose of Greek — Rob Plummer (18:22)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-4/"}],
quiz:[
{q:"λόγῳ is which case?",o:["Nominative","Genitive","Dative","Accusative"],a:2,w:"Dative singular — the iota subscript under the omega gives it away."},
{q:"ἔργα could be:",o:["Nominative or accusative plural","Genitive singular only","Dative plural","Nominative singular"],a:0,w:"Neuter nominative and accusative are always identical, in both singular and plural."},
{q:"τῶν is which case and number?",o:["Genitive singular","Genitive plural","Dative plural","Accusative plural"],a:1,w:"Genitive plural — and it's the same for all three genders, which makes it easy to spot."},
{q:"You meet τῇ before an unfamiliar noun. What do you know?",o:["Feminine dative singular","Feminine genitive singular","Masculine dative singular","Neuter nominative plural"],a:0,w:"Feminine dative singular. This is exactly why the article is worth memorising: it parses the noun for you."},
{q:"Which is true of every neuter noun in Greek?",o:["Nominative and genitive are identical","Nominative and accusative are identical","It has no dative","It never takes the article"],a:1,w:"Neuter nominative and accusative are always the same form. Context and word order decide which is meant."},
{q:"Which article form is NOT nominative?",o:["ὁ","αἱ","οἱ","τάς"],a:3,w:"τάς is feminine accusative plural. The four forms without an initial tau (ὁ, ἡ, οἱ, αἱ) are all nominative."},
{q:"ἡ ἀγάπη τοῦ θεοῦ is ambiguous because τοῦ θεοῦ could be:",o:["Nominative or genitive","Subjective or objective genitive","Dative or genitive","Singular or plural"],a:1,w:"God loving us, or us loving God. Both are grammatically available; the context decides."},
{q:"Which case most often expresses the means or instrument of an action?",o:["Nominative","Genitive","Dative","Accusative"],a:2,w:"The dative covers instrument, location, sphere, and the indirect object — a wide range, which is why it needs care."}]},

{id:5,t:"Nouns of the first declension",s:"Mostly feminine, with a few masculines",
body:`<p>First declension nouns end in <span class="gk">-η</span> or <span class="gk">-α</span> and are usually feminine. The vowel used depends on the letter before it.</p>
<table><caption>ἀγάπη, -ης, ἡ — love</caption>
<tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>Nom</th><td class="g">ἀγάπη</td><td class="g">ἀγάπαι</td></tr>
<tr><th>Gen</th><td class="g">ἀγάπης</td><td class="g">ἀγαπῶν</td></tr>
<tr><th>Dat</th><td class="g">ἀγάπῃ</td><td class="g">ἀγάπαις</td></tr>
<tr><th>Acc</th><td class="g">ἀγάπην</td><td class="g">ἀγάπας</td></tr></table>
<p>If the stem ends in <span class="gk">ε, ι</span> or <span class="gk">ρ</span>, the alpha is kept throughout: <span class="gk">ἡμέρα, ἡμέρας, ἡμέρᾳ, ἡμέραν</span>. Otherwise the alpha shifts to eta in the genitive and dative singular: <span class="gk">δόξα, δόξης, δόξῃ, δόξαν</span>.</p>
<h3>Masculine first declension</h3>
<p>A handful of important nouns look feminine but are masculine — always take the masculine article. <span class="gk">μαθητής</span> (disciple), <span class="gk">προφήτης</span> (prophet), <span class="gk">Μεσσίας</span> (Messiah). Note <span class="gk">ὁ μαθητής</span>, not <span class="gk">ἡ</span>.</p>
<p>Every plural in this declension has <span class="gk">-ῶν</span> in the genitive, with a circumflex, regardless of where the accent falls elsewhere.</p>`,
v:[44,57,59,89,91,92,98,119,121,138,140,147,153,157,159,178,180,181,182,260,201,297,304,189,222,206,322,324,326,329,338,347,358,382,393,400,208,409,417,418,435,221,448,458,461,464,220],
vids:[{t:"Lecture 5: Nouns of the First Declension",s:"Daily Dose of Greek — Rob Plummer (16:35)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-5/"}],
quiz:[
{q:"ὁ μαθητής is masculine even though it looks first-declension. How do you know?",o:["The -ής ending","The article ὁ","The accent","You can't"],a:1,w:"The article. This is why lexical entries always include it — form alone would mislead you here."},
{q:"Why is it ἡμέρας but δόξης in the genitive singular?",o:["Different declensions","ἡμέρα has a stem ending in ρ, so the alpha is kept","δόξα is masculine","Irregular"],a:1,w:"After ε, ι or ρ the alpha persists. Otherwise it becomes eta in the genitive and dative singular."},
{q:"ἀγάπῃ is:",o:["Nominative singular","Genitive singular","Dative singular","Accusative plural"],a:2,w:"Dative singular — iota subscript again."}]},

{id:6,t:"Adjectives of the first and second declension",s:"Attributive versus predicate",
body:`<p>Adjectives agree with their noun in gender, number and case. But <b>where</b> the adjective sits relative to the article changes the meaning entirely.</p>
<h3>Attributive — inside the article-noun unit</h3>
<p><span class="gk">ὁ ἀγαθὸς ἄνθρωπος</span> — "the good man". Also <span class="gk">ὁ ἄνθρωπος ὁ ἀγαθός</span>, with the article repeated. The adjective modifies.</p>
<h3>Predicate — outside it</h3>
<p><span class="gk">ὁ ἄνθρωπος ἀγαθός</span> — "the man <i>is</i> good". No verb is written; Greek supplies "is". The adjective asserts.</p>
<p>The test is simple: <b>is the adjective immediately preceded by an article?</b> If yes, attributive. If no, predicate.</p>
<h3>Substantival use</h3>
<p>An adjective with an article and no noun becomes a noun itself. <span class="gk">ὁ ἅγιος</span> — "the holy one". <span class="gk">οἱ ἅγιοι</span> — "the saints". <span class="gk">τὸ ἀγαθόν</span> — "the good thing", "that which is good". This is very common and worth watching for.</p>`,
v:[64,77,100,125,141,143,149,158,164,168,248,228,229,257,226,227,230,289,225,310,224,317,320,321,323,339,344,351,369,374,376,385,428,441,444,447],
vids:[{t:"Lecture 6: Adjectives of the First and Second Declension",s:"Daily Dose of Greek — Rob Plummer (17:09)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-6/"}],
quiz:[
{q:"ὁ ἄνθρωπος ἀγαθός means:",o:["the good man","the man is good","a good man","the man of good"],a:1,w:"Predicate position — the adjective is not preceded by an article, so it asserts, and an unwritten 'is' completes the sense."},
{q:"οἱ ἅγιοι most naturally means:",o:["the holy ones / the saints","they are holy","holy things","the holy man"],a:0,w:"Substantival use: article plus adjective, no noun. Very common in the epistles."},
{q:"What single test distinguishes attributive from predicate position?",o:["Word order alone","Whether an article immediately precedes the adjective","The accent","The gender"],a:1,w:"Article immediately before the adjective means attributive. That's the whole test."}]},

{id:7,t:"Imperfect and aorist active indicative",s:"Past time, and the aspect distinction that matters more",
body:`<p>The imperfect describes past action viewed as ongoing, repeated or attempted. It is formed from the present stem with two changes: an <b>augment</b> on the front and <b>secondary endings</b> on the back.</p>
<table><caption>ἔλυον — I was loosing</caption>
<tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>1st</th><td class="g">ἔλυον</td><td class="g">ἐλύομεν</td></tr>
<tr><th>2nd</th><td class="g">ἔλυες</td><td class="g">ἐλύετε</td></tr>
<tr><th>3rd</th><td class="g">ἔλυε(ν)</td><td class="g">ἔλυον</td></tr></table>
<p>First and third person plural are identical (<span class="gk">ἔλυον</span>) — context decides.</p>
<h3>The augment</h3>
<p>An <span class="gk">ἐ-</span> prefixed to the stem, marking past time in the indicative. If the verb already begins with a vowel, the vowel lengthens instead: <span class="gk">ἀκούω → ἤκουον</span>, <span class="gk">ἐγείρω → ἤγειρον</span>.</p>
<p>With compound verbs the augment goes <i>after</i> the preposition, not before: <span class="gk">ἐκβάλλω → ἐξέβαλλον</span>. This trips people up when looking words up.</p>
<h3>What it means</h3>
<p>The imperfect is the past tense of the imperfective aspect — the camera inside the action rather than outside it. Mark uses it constantly for vivid narrative. When an author switches from aorist to imperfect, that shift is usually doing something.</p>
<p>The aorist active indicative typically shows an augment, the stem, a <span class="gk">σα</span> marker, and secondary endings: <span class="gk">ἔλυσα</span> — "I loosed".</p>
<table><caption>ἔλυσα</caption>
<tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>1st</th><td class="g">ἔλυσα</td><td class="g">ἐλύσαμεν</td></tr>
<tr><th>2nd</th><td class="g">ἔλυσας</td><td class="g">ἐλύσατε</td></tr>
<tr><th>3rd</th><td class="g">ἔλυσε(ν)</td><td class="g">ἔλυσαν</td></tr></table>
<h3>Second aorists</h3>
<p>Some verbs form the aorist by changing the stem instead: <span class="gk">λαμβάνω → ἔλαβον</span>, <span class="gk">λέγω → εἶπον</span>, <span class="gk">ἔρχομαι → ἦλθον</span>. The endings look like the imperfect; the stem is what tells you it's aorist. These are irregular and simply have to be learned.</p>
<h3>The thing to get right</h3>
<p>The aorist is <b>perfective aspect</b>: the action viewed from outside, as a whole, without regard to its internal progress. That is all it means.</p>
<p>It does <i>not</i> mean "once for all". The "once-for-all aorist" is one of the most common errors in preaching. An aorist can describe an action lasting decades: <span class="gk">ἐβασίλευσεν</span>, "he reigned", covers a whole reign in one word precisely because the aorist views it as a single whole.</p>
<p>Outside the indicative, the aorist carries <b>no time reference at all</b>. An aorist participle or subjunctive is not past; it's simply perfective.</p>`,
v:[81,86,96,122,145,152,161],
vids:[{t:"Lecture 7: Imperfect and Aorist Active Indicative",s:"Daily Dose of Greek — Rob Plummer (23:20)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-7/"}],
quiz:[
{q:"What does the augment mark?",o:["Plural number","Past time in the indicative","Passive voice","The subjunctive"],a:1,w:"Past time, and only in the indicative mood. Outside the indicative there is no augment because there is no time reference."},
{q:"The imperfect of ἐκβάλλω is:",o:["ἐἐκβαλλον","ἐκέβαλλον","ἐξέβαλλον","ἤκβαλλον"],a:2,w:"The augment slots in after the prepositional prefix, and ἐκ becomes ἐξ before a vowel."},
{q:"ἔλυον could be:",o:["1st singular or 3rd plural","1st plural only","2nd singular","3rd singular only"],a:0,w:"Both. Context resolves it — Greek tolerates this ambiguity happily."},
{q:"Outside the indicative, the aorist communicates:",o:["Past time","Once-for-all action","Perfective aspect only","Completed action with ongoing results"],a:2,w:"Aspect alone. There is no augment and no time reference outside the indicative."},
{q:"Why is the 'once-for-all aorist' a fallacy?",o:["The aorist is always plural","The aorist can describe actions of any duration","The aorist is only used in narrative","Greek has no aorist"],a:1,w:"ἐβασίλευσεν ('he reigned') covers years. The aorist views the action as a whole, not as brief or unrepeatable."},
{q:"εἶπον is the aorist of which verb?",o:["εἰμί","λέγω","λαμβάνω","ἔρχομαι"],a:1,w:"A second aorist with a completely different stem from λέγω. These have to be memorised individually."},
{q:"What distinguishes the perfect tense from the aorist?",o:["The perfect is future","The perfect stresses a completed action with continuing results","The perfect is plural","Nothing"],a:1,w:"The perfect (stative aspect) views an action as completed with an abiding resulting state — τετέλεσται, 'it stands finished'."}]},

{id:8,t:"Additional prepositions",s:"Case changes the meaning",
body:`<p>Many Greek prepositions take more than one case, and the case changes the meaning. This is a place where a lazy reading goes wrong quickly.</p>
<table>
<tr><th>Prep</th><th>+ Gen</th><th>+ Dat</th><th>+ Acc</th></tr>
<tr><td class="g">διά</td><td>through</td><td>—</td><td>because of</td></tr>
<tr><td class="g">κατά</td><td>down from, against</td><td>—</td><td>according to</td></tr>
<tr><td class="g">μετά</td><td>with</td><td>—</td><td>after</td></tr>
<tr><td class="g">παρά</td><td>from</td><td>beside, with</td><td>alongside</td></tr>
<tr><td class="g">ὑπέρ</td><td>on behalf of</td><td>—</td><td>above, beyond</td></tr>
<tr><td class="g">ὑπό</td><td>by (agent)</td><td>—</td><td>under</td></tr>
<tr><td class="g">ἐπί</td><td>on, over</td><td>on, at</td><td>on, to, against</td></tr></table>
<h3>Single-case prepositions</h3>
<p>These are easier — they only ever take one case, so they double as reliable case markers.</p>
<p><b>Genitive only:</b> <span class="gk">ἀπό</span> (from), <span class="gk">ἐκ</span> (out of), <span class="gk">πρό</span> (before).<br>
<b>Dative only:</b> <span class="gk">ἐν</span> (in), <span class="gk">σύν</span> (with).<br>
<b>Accusative only:</b> <span class="gk">εἰς</span> (into), <span class="gk">πρός</span> (to, toward).</p>
<p>Because <span class="gk">ἐν</span> is always dative and <span class="gk">εἰς</span> always accusative, these two are among the most reliable signposts in the text.</p>`,
v:[5,9,18,19,22,24,26,37,38,50,68,80,105,126,176,331,336,370,421],
vids:[{t:"Lecture 8: Additional Prepositions",s:"Daily Dose of Greek — Rob Plummer (17:43)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-8/"}],
quiz:[
{q:"διὰ τοῦτο (accusative) means:",o:["through this","because of this","with this","after this"],a:1,w:"διά with the accusative means 'because of'. With the genitive it means 'through'. Same word, different case, different logic."},
{q:"Which preposition always takes the dative?",o:["εἰς","ἐν","πρός","ἐκ"],a:1,w:"ἐν is invariably dative — which makes it one of the most useful case-signals in the NT."},
{q:"ὑπό with the genitive most often marks:",o:["Location under something","The agent of a passive verb","Purpose","Time"],a:1,w:"'By' — the personal agent of a passive verb. With the accusative it means physically 'under'."}]},

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
<p>The verb ending already tells you the subject, so a nominative pronoun is never required. When it appears, it is emphatic: <span class="gk">ἐγὼ ἐβάπτισα ὑμᾶς ὕδατι, αὐτὸς δὲ βαπτίσει ὑμᾶς πνεύματι</span> — "<i>I</i> baptised you with water, but <i>he</i> will baptise you with the Spirit" (Mark 1:8). Every ἐγώ of Jesus in John carries this weight.</p>`,
v:[2,3,6,195],
vids:[{t:"Lecture 9: Personal Pronouns",s:"Daily Dose of Greek — Rob Plummer (15:17)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-9/"}],
quiz:[
{q:"ὁ αὐτὸς κύριος means:",o:["The Lord himself","The same Lord","His Lord","The Lord alone"],a:1,w:"Attributive position (article immediately before αὐτός) = 'same'. Predicate position (αὐτὸς ὁ κύριος) = 'himself'."},
{q:"Since verb endings already mark the subject, an explicit ἐγώ or σύ is:",o:["Required for clarity","A politeness marker","Emphatic","Colloquial"],a:2,w:"Emphatic. When Jesus says ἐγώ εἰμι, the pronoun is doing deliberate work — the ending alone would have sufficed for 'I am'."},
{q:"μου, μοι, με differ from ἐμοῦ, ἐμοί, ἐμέ in that they are:",o:["Plural","Unaccented and unemphatic","Older forms","Only used with prepositions"],a:1,w:"The short enclitic forms are the everyday ones; the long forms carry stress or follow prepositions."},
{q:"ὑμῶν is:",o:["Genitive plural of σύ","Genitive plural of ἐγώ","Dative plural of σύ","Accusative plural of ἐγώ"],a:0,w:"'Of you (all)' — as in ὁ πατὴρ ὑμῶν, 'your Father'. ἡμῶν is 'our'. One vowel apart; readers confuse them for years, so nail it now."}]},

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
v:[173,186,243,245,249,199,250,198],
vids:[{t:"Lecture 10: Perfect and Pluperfect Active Indicative",s:"Daily Dose of Greek — Rob Plummer (21:20)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-10/"}],
quiz:[
{q:"γέγραπται carries the sense:",o:["It was written once","It stands written","It will be written","Someone used to write"],a:1,w:"Perfect: completed act, abiding result. This is why the formula introduces Scripture citations — what was written remains in force."},
{q:"The two form-markers of the perfect active are:",o:["Augment and σ","Reduplication and κ","Augment and θη","Reduplication and σ"],a:1,w:"λέ-λυ-κ-α: reduplicated initial consonant plus κ. The augment belongs to past-time indicative tenses; the perfect instead reduplicates."},
{q:"οἶδα is perfect in form but functions as:",o:["A future","A present — 'I know'","An imperative","A pluperfect"],a:1,w:"One of the most common verbs in the NT. Its pluperfect ᾔδειν likewise just means 'I knew'."},
{q:"The pluperfect expresses:",o:["Ongoing past action","Completed action with results continuing in the past","Future certainty","Timeless truth"],a:1,w:"'Had loosed' — the perfect's completed-with-results idea, shifted back a step. Rare enough that recognition is the goal."}]},

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
v:[235,56,305],
vids:[{t:"Lecture 11: Demonstrative Pronouns",s:"Daily Dose of Greek — Rob Plummer (12:22)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-11/"}],
quiz:[
{q:"οὗτος ὁ λόγος means:",o:["The word itself","This word","The same word","A certain word"],a:1,w:"Demonstrative in predicate position still translates 'this'. αὐτός in that position would be 'itself' — the two look alike until you check the breathing and stem."},
{q:"αὕτη differs from αὐτή how?",o:["No difference","αὕτη is 'this' (demonstrative); αὐτή is 'she'","αὕτη is plural","αὐτή is accusative"],a:1,w:"Rough breathing marks the demonstrative. The pair is a standing test of whether you're really reading the diacritics."},
{q:"ταῦτα, one of the commonest forms in the NT, means:",o:["This woman","These things","The same things","Those men"],a:1,w:"Neuter plural of οὗτος: 'after these things' (μετὰ ταῦτα) stitches together John's narrative."},
{q:"ἐκεῖνος points to:",o:["Something near","Something far / previously mentioned","The speaker","Something owned"],a:1,w:"'That one.' John gives it theological weight — of Christ and the Spirit — so distance can be dignity, not remoteness."}]},

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
v:[23,28,65,69,73,78,104,136],
vids:[{t:"Lecture 12: Present Middle and Passive Indicative",s:"Daily Dose of Greek — Rob Plummer (14:35)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-12/"}],
quiz:[
{q:"ἔρχομαι is middle in form. What does it mean?",o:["I am come (passive)","I come (active meaning)","I come for myself","I am being sent"],a:1,w:"A deponent, or middle-only, verb. Middle form, active meaning. Forcing a passive sense onto it produces nonsense."},
{q:"In the present tense, middle and passive forms are:",o:["Always different","Identical — context decides","Distinguished by the augment","Distinguished by accent"],a:1,w:"Identical in the present and imperfect. The aorist and future do distinguish them."},
{q:"The middle voice indicates the subject:",o:["Is acted upon","Acts with special reference to itself","Acts on a plural object","Is in the past"],a:1,w:"Roughly — the subject has a particular stake or involvement in the action. English needs a paraphrase to catch it."}]},

{id:13,t:"Perfect middle/passive and future middle",s:"Endings straight onto the stem",
body:`<p>The perfect middle/passive is the easiest paradigm you will ever learn: reduplicate, then add the basic middle endings <b>directly to the stem</b> — no connecting vowel, no tense sign.</p>
<table><caption>λέλυμαι — I have been loosed</caption>
<tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>1st</th><td class="g">λέλυμαι</td><td class="g">λελύμεθα</td></tr>
<tr><th>2nd</th><td class="g">λέλυσαι</td><td class="g">λέλυσθε</td></tr>
<tr><th>3rd</th><td class="g">λέλυται</td><td class="g">λέλυνται</td></tr></table>
<p>Those endings — <span class="gk">-μαι, -σαι, -ται, -μεθα, -σθε, -νται</span> — are the skeleton of every middle/passive primary tense; here you see them with nothing in the way. <span class="gk">γέγραπται</span> from the last lesson is exactly this form: γε-γραπ-ται.</p>
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
v:[175,183,191,194,299,306,377,378],
vids:[{t:"Lecture 13: Perfect Middle and Passive, Future Middle Indicative",s:"Daily Dose of Greek — Rob Plummer (9:47)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-13/"}],
quiz:[
{q:"The perfect middle/passive attaches its endings:",o:["With a connecting vowel","With the σ tense sign","Directly to the reduplicated stem","With θη"],a:2,w:"λέ-λυ-μαι. No connecting vowel, no tense sign — which is why this paradigm shows you the bare middle endings."},
{q:"γέγραπται parses as:",o:["Present middle 3sg","Perfect middle/passive 3sg","Aorist passive 3sg","Pluperfect active 3sg"],a:1,w:"Reduplication (γε-) + stem + -ται. 'It stands written' — the citation formula is a perfect passive."},
{q:"ἔσται means:",o:["He was","He will be","He is","Let him be"],a:1,w:"Future of εἰμί, 3rd singular, with no connecting vowel. καὶ ἔσται — 'and it shall be' — echoes through the prophets' citations."},
{q:"γνώσομαι is best translated:",o:["I will know","I will be known","I knew for myself","Know!"],a:0,w:"Middle in form, active in meaning — one of several everyday verbs whose future is middle. Form ≠ force; the lexicon has the last word."}]},

{id:14,t:"Imperfect middle/passive, aorist middle, pluperfect middle/passive",s:"The secondary middle endings",
body:`<p>One set of secondary middle endings — <span class="gk">-μην, -σο, -το, -μεθα, -σθε, -ντο</span> — serves three paradigms. Learn it once, use it three times.</p>
<table><caption>ἐλυόμην — imperfect middle/passive: I was being loosed</caption>
<tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>1st</th><td class="g">ἐλυόμην</td><td class="g">ἐλυόμεθα</td></tr>
<tr><th>2nd</th><td class="g">ἐλύου</td><td class="g">ἐλύεσθε</td></tr>
<tr><th>3rd</th><td class="g">ἐλύετο</td><td class="g">ἐλύοντο</td></tr></table>
<p>The 2nd singular <span class="gk">ἐλύου</span> looks odd because σ dropped out between vowels and ε+ο contracted (ἐλύεσο → ἐλύου). The same happens in every 2nd singular of this set.</p>
<table><caption>ἐλυσάμην — aorist middle: I loosed (for myself)</caption>
<tr><th></th><th>Singular</th><th>Plural</th></tr>
<tr><th>1st</th><td class="g">ἐλυσάμην</td><td class="g">ἐλυσάμεθα</td></tr>
<tr><th>2nd</th><td class="g">ἐλύσω</td><td class="g">ἐλύσασθε</td></tr>
<tr><th>3rd</th><td class="g">ἐλύσατο</td><td class="g">ἐλύσαντο</td></tr></table>
<p><b>The aorist middle is not passive.</b> The aorist is the one tense-family where middle and passive have fully distinct forms (the passive, with θη, comes next lesson). <span class="gk">ἐλύσατο</span> is "he loosed for himself", never "he was loosed".</p>
<p>Second aorists take the imperfect's connecting vowel with these endings on the aorist stem: <span class="gk">ἐγενόμην</span> (γίνομαι), "I became" — one of the commonest verbs in the NT: <span class="gk">καὶ ἐγένετο</span>, "and it came to pass".</p>
<h3>Pluperfect middle/passive</h3>
<p>For recognition only: reduplication + secondary middle endings straight on the stem — <span class="gk">ἐλελύμην, ἐλέλυσο, ἐλέλυτο…</span> A handful of NT occurrences.</p>`,
v:[391,403,408,419,436,439,462],
vids:[{t:"Lecture 14: Imperfect Middle and Passive, Aorist Middle, Pluperfect Middle and Passive",s:"Daily Dose of Greek — Rob Plummer (15:32)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-14/"}],
quiz:[
{q:"ἐγένετο parses as:",o:["Imperfect m/p 3sg of γίνομαι","Aorist middle 3sg of γίνομαι","Aorist passive 3sg","Perfect middle 3sg"],a:1,w:"Second aorist middle: aorist stem γεν- + connecting vowel + -το. 'And it came to pass' opens scene after scene of narrative."},
{q:"In the aorist, middle and passive are:",o:["Identical in form","Fully distinct forms","Both marked with θη","Both marked with σα"],a:1,w:"Unique among the tense-families. σα + middle endings = middle; θη = passive. Present, imperfect and perfect share one m/p form."},
{q:"The 2nd singular ἐλύου arose because:",o:["The σ of -σο dropped and vowels contracted","It borrows from the imperative","The augment absorbed it","It is irregular"],a:0,w:"ἐλύεσο → ἐλύεο → ἐλύου. Knowing this one sound-change explains 'odd' 2nd singulars across the whole middle system."},
{q:"ἐλύσατο means:",o:["He was loosed","He loosed for himself","He will loose","He had been loosed"],a:1,w:"Aorist middle — subject acting with self-reference. 'He was loosed' would be ἐλύθη, the θη-passive of the next lesson."}]},

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
v:[254,265,270,215,209,212,294],
vids:[{t:"Lecture 15: Aorist and Future Passive Indicative",s:"Daily Dose of Greek — Rob Plummer (9:49)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-15/"}],
quiz:[
{q:"The aorist passive tense sign is:",o:["σα","κ","θη","μεν"],a:2,w:"ἐ-λύ-θη-ν. Spot θη after an augment and you have an aorist passive; θησ without augment is future passive."},
{q:"ἠγέρθη (Matt 28:6) means:",o:["He rose (of his own power, stated)","He was raised","He will rise","Rise!"],a:1,w:"Aorist passive of ἐγείρω. The NT often frames the resurrection with God as the (sometimes unstated) actor — the passive carries that."},
{q:"ἀπεκρίθη is passive in form. Its meaning is:",o:["He was answered","He answered","It was decided","He was questioned"],a:1,w:"Active in sense — 'deponent' in the aorist passive. Hundreds of occurrences: 'Jesus answered and said…'"},
{q:"A 'divine passive' is:",o:["A passive with θεός as subject","A passive used to avoid naming God as the actor","Any aorist passive","A passive in prayers only"],a:1,w:"'They shall be comforted, they shall be filled' — the Comforter and Filler is God, reverently unnamed. Worth noticing in the Beatitudes."}]},

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
{q:"Parse ἐλύθης:",o:["Aorist passive 2sg — you were loosed","Aorist middle 2sg","Imperfect active 2sg","Future passive 2sg"],a:0,w:"Augment + θη + secondary ending -ς. The algorithm: augment → past; θη → passive; -ς → second singular."},
{q:"Parse λελύκαμεν:",o:["Aorist active 1pl","Perfect active 1pl — we have loosed","Present middle 1pl","Pluperfect active 1pl"],a:1,w:"Reduplication + κ + primary ending -μεν. No augment, so not pluperfect."},
{q:"Parse λύσεται:",o:["Present middle 3sg","Future middle/passive-in-sense 3sg — he will loose (for himself)","Aorist middle 3sg","Perfect middle 3sg"],a:1,w:"σ + primary middle ending, no augment: future middle. The θη-form λυθήσεται would be the future passive."},
{q:"Which tense pairs NEVER share middle and passive forms?",o:["Present and imperfect","Perfect and pluperfect","Aorist and future","None — all share"],a:2,w:"Aorist and future keep middle (σ/σα) and passive (θη) distinct. Everywhere else one form serves both voices."},
{q:"A form with reduplication AND an augment is:",o:["Aorist","Perfect","Pluperfect","Impossible"],a:2,w:"ἐ-λελύκειν: both markers stack. Past completed action with past-continuing results."}]},

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
v:[43,45,61,66,70,71,85,93,94,205,108,116,129,130,133,139,170,179,196,253,255,203,266,272,281,283,285,287,204,328,337,352,223,365,373,389,407,415,424,429,202,452,460,469,234],
vids:[{t:"Lecture 17: Nouns of the Third Declension",s:"Daily Dose of Greek — Rob Plummer (20:21)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-17/"}],
quiz:[
{q:"Where do you find a third-declension noun's stem?",o:["The nominative singular","The genitive singular minus -ος","The dative plural","The article"],a:1,w:"σαρκός → σαρκ-. This is why lexical entries always give the genitive: the nominative often disguises the stem."},
{q:"πνεύμασι(ν) is:",o:["Genitive singular","Dative plural","Accusative plural","Nominative plural"],a:1,w:"Dative plural: stem πνευματ- + σι, with the τ dropping before σ. 'In/by the spirits.'"},
{q:"Why does the nominative of σαρκ- end in ξ?",o:["It is irregular","κ + ς → ξ","The κ dropped","Ionic spelling"],a:1,w:"The nominative ς collides with the stem's final κ. The same collision produces the dative plural σαρξί(ν)."},
{q:"πίστιν is:",o:["Accusative singular of πίστις","Dative plural","Genitive singular","Nominative plural"],a:0,w:"The -ις/-εως family takes -ιν in the accusative singular: τὴν πίστιν. Its genitive πίστεως is worth recognising on sight."},
{q:"The vocative of πατήρ, used in the Lord's Prayer, is:",o:["πατήρ","πατρός","πάτερ","πατέρα"],a:2,w:"Πάτερ ἡμῶν — 'Our Father'. One of the few vocatives you'll meet weekly."}]},

{id:18,t:"Adjectives, pronouns, and numerals of the first and third declensions",s:"πᾶς, εἷς, οὐδείς — small words, large claims",
body:`<p>A few indispensable words mix third-declension forms (masculine and neuter) with first-declension forms (feminine). Chief among them: <span class="gk">πᾶς, πᾶσα, πᾶν</span> — "all, every" — some 1,240 occurrences.</p>
<table><caption>πᾶς — singular</caption>
<tr><th></th><th>Masc</th><th>Fem</th><th>Neut</th></tr>
<tr><th>Nom</th><td class="g">πᾶς</td><td class="g">πᾶσα</td><td class="g">πᾶν</td></tr>
<tr><th>Gen</th><td class="g">παντός</td><td class="g">πάσης</td><td class="g">παντός</td></tr>
<tr><th>Dat</th><td class="g">παντί</td><td class="g">πάσῃ</td><td class="g">παντί</td></tr>
<tr><th>Acc</th><td class="g">πάντα</td><td class="g">πᾶσαν</td><td class="g">πᾶν</td></tr></table>
<p>Plural: <span class="gk">πάντες, πᾶσαι, πάντα</span>; genitive <span class="gk">πάντων, πασῶν, πάντων</span>; dative <span class="gk">πᾶσι(ν), πάσαις, πᾶσι(ν)</span>. The stem παντ- behaves exactly as the last lesson taught: τ drops before σ.</p>
<h3>How πᾶς reads</h3>
<p>Without the article: "every" (<span class="gk">πᾶν δένδρον</span>, every tree). With the article: "all/the whole" (<span class="gk">πᾶσα ἡ πόλις</span>, all the city; <span class="gk">πᾶσα γραφή</span>, 2 Tim 3:16 — famously articleless: "every scripture" or "all scripture"? The grammar allows both; context and usage must decide. Now you can see why the commentaries argue).</p>
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
<h3>Numbers to recognise</h3>
<p><span class="gk">δύο</span> (two), <span class="gk">τρεῖς, τρία</span> (three), <span class="gk">τέσσαρες, τέσσαρα</span> (four), <span class="gk">πέντε</span> (five), <span class="gk">ἑπτά</span> (seven), <span class="gk">δώδεκα</span> (twelve). From πέντε up to a hundred they don't decline; the hundreds and thousands (<span class="gk">διακόσιοι, χίλιοι, μύριοι</span>) do. Met mostly in feeding crowds and numbering apostles.</p>`,
v:[14,41,47,60,63,101,120,242,187,261,274,309,357,390,398,443,231,232],
vids:[{t:"Lecture 18: Adjectives, Pronouns, and Numerals of the First and Third Declensions",s:"Daily Dose of Greek — Rob Plummer (21:20)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-18/"}],
quiz:[
{q:"εἷς differs from εἰς in that εἷς:",o:["Is the preposition 'into'","Is the numeral 'one' (rough breathing)","Is plural","Means 'if'"],a:1,w:"The breathing and accent are the whole difference. ἄκουε, Ἰσραήλ· κύριος εἷς ἐστιν — the Shema needs the numeral, not the preposition."},
{q:"οὐδέν means:",o:["No one (masculine)","Nothing (neuter)","Never","Not yet"],a:1,w:"Neuter of οὐδείς. χωρὶς ἐμοῦ οὐ δύνασθε ποιεῖν οὐδέν — 'apart from me you can do nothing' (John 15:5)."},
{q:"πᾶσι(ν) is:",o:["Genitive plural","Dative plural masculine/neuter","Accusative singular","Nominative plural feminine"],a:1,w:"Stem παντ- + σι: the τ drops, exactly like the third-declension nouns you just learned."},
{q:"πᾶσα γραφή (2 Tim 3:16) is grammatically:",o:["Unambiguously 'all Scripture'","Unambiguously 'every scripture'","Open: 'every scripture' or 'all Scripture' — usage and context decide","A scribal error"],a:2,w:"Anarthrous πᾶς usually reads 'every', but abstract or collective nouns blur it. Knowing the grammar means knowing where the real argument lies."}]},

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
<p>Before a tense sign the stem vowel simply lengthens: <span class="gk">ἀγαπήσω, ἠγάπησα, ἠγάπηκα</span>; <span class="gk">ποιήσω, ἐποίησα</span>; <span class="gk">πληρώσω, ἐπλήρωσα</span>. So the aorist of a contract verb is perfectly regular — the present is the only battlefield.</p>
<h3>Liquid verbs</h3>
<p>Stems ending in λ, μ, ν, ρ refuse the σ of the future. Instead they form an ε-contract future: <span class="gk">μένω → μενῶ</span> ("I will remain" — accent alone distinguishes it from the present μένω), <span class="gk">ἀγγέλλω → ἀγγελῶ</span>. Their aorists also dodge σ, compensating by lengthening the stem: <span class="gk">ἔμεινα</span> (I remained), <span class="gk">ἤγγειλα</span> (I announced), <span class="gk">ἦρα</span> from αἴρω.</p>
<p>These two families cover an enormous share of NT vocabulary — ἀγαπάω, ζητέω, καλέω, λαλέω, ποιέω, τηρέω, φανερόω, μένω, ἀποστέλλω, ἐγείρω, κρίνω all live here.</p>`,
v:[29,39,54,106,110,112,118,123,131,135,137,142,148,150,160,172,174,184,190,247,207,262,263,267,268,276,282,286,291,302,307,318,333,335,340,214,348,355,363,364,379,386,387,192,397,399,405,425,427,431,433,445,449,465,233],
vids:[{t:"Lecture 19: Contract and Liquid Verbs",s:"Daily Dose of Greek — Rob Plummer (42:00)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-19/"}],
quiz:[
{q:"ποιεῖτε comes from ε + ε contracting to:",o:["η","ει","ου","ω"],a:1,w:"ποιέ-ετε → ποιεῖτε. ε+ε→ει and ε+ο→ου do most of the work in the ε-class, the largest of the three."},
{q:"The aorist of ἀγαπάω is:",o:["ἠγάπησα","ἠγάπασα","ἀγάπησα","ἠγαπῶσα"],a:0,w:"Augment + stem with lengthened vowel (α→η) + σα. Outside the present system, contract verbs behave themselves."},
{q:"μενῶ differs from μένω how?",o:["It is aorist","It is the liquid future — 'I will remain'","It is subjunctive","No difference"],a:1,w:"Liquid stems reject σ, so the future is an ε-contract: μενῶ, μενεῖς, μενεῖ. In John 15 the difference between 'remain' and 'will remain' can hang on an accent."},
{q:"ἤγγειλα is the aorist of:",o:["ἄγω","ἀγγέλλω","ἐγείρω","ἀγοράζω"],a:1,w:"A liquid aorist: no σ, stem lengthened (ε→ει). ἀπήγγειλαν — 'they reported' — is everywhere in the resurrection narratives."}]},

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
<p>A participle and its subject both in the genitive, grammatically detached from the main clause: <span class="gk">λέγοντος αὐτοῦ ταῦτα</span> — "while he was saying these things". Common in narrative.</p>`,
v:[296,308,211,319,325,349,350,356],
vids:[{t:"Lecture 20: Participles (Verbal Adjectives)",s:"Daily Dose of Greek — Rob Plummer (42:53)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-20/"}],
quiz:[
{q:"An aorist participle primarily communicates:",o:["Past time","Perfective aspect, often prior action","Ongoing action","Future action"],a:1,w:"Aspect first. Antecedent time is a common by-product, not the meaning itself."},
{q:"ὁ πιστεύων is:",o:["An adverbial participle","A substantival participle — 'the one who believes'","A genitive absolute","An imperative"],a:1,w:"Article plus participle, no noun: it functions as a noun. Extremely common in John."},
{q:"A genitive absolute is:",o:["A participle with no subject","A participle and its subject in the genitive, detached from the main clause","A possessive construction","A type of infinitive"],a:1,w:"Grammatically independent of the main clause, usually giving background circumstance."},
{q:"A present participle usually describes action:",o:["Prior to the main verb","Contemporaneous with the main verb","After the main verb","Without reference to the main verb"],a:1,w:"Imperfective aspect typically yields contemporaneous time relative to the main verb."}]},

{id:21,t:"Infinitives (verbal nouns)",s:"Verbal nouns and their many uses",
body:`<p>An infinitive is a verbal noun. It has tense and voice but no person or number, and it is indeclinable — though it often takes a neuter article, which then declines and shows you its function.</p>
<table>
<tr><th>Tense</th><th>Active</th><th>Meaning</th></tr>
<tr><td>Present</td><td class="g">λύειν</td><td>to be loosing</td></tr>
<tr><td>Aorist</td><td class="g">λῦσαι</td><td>to loose</td></tr>
<tr><td>Perfect</td><td class="g">λελυκέναι</td><td>to have loosed</td></tr>
</table>
<h3>Common constructions</h3>
<p><b>Purpose:</b> plain infinitive, or <span class="gk">τοῦ</span> + infinitive, or <span class="gk">εἰς τό</span> + infinitive.</p>
<p><b>Result:</b> <span class="gk">ὥστε</span> + infinitive — "so that, with the result that".</p>
<p><b>Time:</b> <span class="gk">πρὸ τοῦ</span> (before), <span class="gk">ἐν τῷ</span> (while, during), <span class="gk">μετὰ τό</span> (after) + infinitive. The <span class="gk">ἐν τῷ</span> + infinitive construction is a favourite of Luke's.</p>
<p><b>Cause:</b> <span class="gk">διὰ τό</span> + infinitive — "because".</p>
<p>The subject of an infinitive, when expressed, goes in the <b>accusative</b> — which surprises English readers the first few times.</p>`,
v:[361,362,366,368,371,372,383],
vids:[{t:"Lecture 21: Infinitives (Verbal Nouns)",s:"Daily Dose of Greek — Rob Plummer (20:54)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-21/"}],
quiz:[
{q:"The subject of an infinitive appears in which case?",o:["Nominative","Genitive","Dative","Accusative"],a:3,w:"Accusative. This looks wrong to English eyes but is entirely standard."},
{q:"ὥστε + infinitive expresses:",o:["Purpose","Result","Time","Cause"],a:1,w:"Result — 'so that, with the result that'. Purpose and result overlap in Greek, and distinguishing them is often an interpretive judgment."},
{q:"ἐν τῷ + infinitive most often expresses:",o:["Cause","Contemporaneous time — 'while'","Purpose","Comparison"],a:1,w:"'While' or 'during'. Luke uses this constantly."}]},

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
v:[11,30,33,52,103,146,163,360,406,440],
vids:[{t:"Lecture 22: Additional Pronouns",s:"Daily Dose of Greek — Rob Plummer (21:19)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-22/"}],
quiz:[
{q:"A relative pronoun takes its case from:",o:["Its antecedent","Its role in its own clause","The main verb","The nearest article"],a:1,w:"Gender and number from the antecedent; case from its own clause. When this rule appears to break, commentators call it 'attraction' — now you can follow that footnote."},
{q:"ἥ (with accent and rough breathing) is:",o:["The feminine article","The relative pronoun 'who/which'","'Or'","'Truly'"],a:1,w:"The article ἡ has no accent; the disjunctive ἤ ('or') has a smooth breathing. Three tiny words, three sets of marks."},
{q:"ἀγαπᾶτε ἀλλήλους means:",o:["Love yourselves","Love one another","Love the others","Love the strangers"],a:1,w:"The reciprocal pronoun. John 13:34 — the new commandment turns on this one word."},
{q:"τις (no accent) means:",o:["Who?","Someone / a certain","This","No one"],a:1,w:"The indefinite. Accented τίς is the question word. In editions the context and accent together keep them apart."},
{q:"ὡς σεαυτόν (Mark 12:31) uses which pronoun?",o:["Reciprocal","Reflexive — 'as yourself'","Relative","Demonstrative"],a:1,w:"σεαυτοῦ, the second-person reflexive: the neighbour-love command points the verb back at its own subject."}]},

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
v:[15,25,35,236,238,109,128,244,303,313,343,384,392,395,401,402,404,414,426,430],
vids:[{t:"Lecture 23: The Subjunctive Mood",s:"Daily Dose of Greek — Rob Plummer (18:25)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-23/"}],
quiz:[
{q:"ἵνα followed by a subjunctive usually indicates:",o:["A condition","Purpose or result","Time","Concession"],a:1,w:"'In order that.' One of the highest-frequency constructions in the NT and a reliable clue to clause structure."},
{q:"What marks the subjunctive formally?",o:["An augment","A lengthened connecting vowel","A sigma","Reduplication"],a:1,w:"Omicron lengthens to omega, epsilon to eta. No augment, because the subjunctive has no time reference."},
{q:"ἀγαπῶμεν ἀλλήλους is best taken as:",o:["We love one another","Let us love one another","They loved one another","Do you love one another?"],a:1,w:"A hortatory subjunctive — 1st person plural used as an exhortation. Though the form is ambiguous with the indicative, so context decides."}]},

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
<p>Two constructions, and the difference preaches: <b>μή + present imperative</b> forbids as a general practice, and can (context permitting) mean "stop doing" what is under way — <span class="gk">μὴ φοβοῦ</span>, "do not fear / stop fearing". <b>μή + aorist subjunctive</b> (not imperative!) forbids the act outright: <span class="gk">μὴ φονεύσῃς</span>, "do not murder". Handle the "stop doing" nuance with care — it is a possibility the context must confirm, not a rule the form guarantees.</p>
<p>Common irregulars to know on sight: <span class="gk">γίνου</span> (become!), <span class="gk">ἴδε</span> and <span class="gk">ἰδού</span> (behold!), <span class="gk">ἄφες</span> (forgive!/let!), <span class="gk">δός</span> (give!), <span class="gk">ἐλθέτω</span> (let it come — the Lord's Prayer: ἐλθέτω ἡ βασιλεία σου).</p>
<h3>The optative</h3>
<p>The mood of wish and remote possibility — only 68 NT occurrences, so recognise rather than memorise. Its badge is οι or ει in the ending. Two forms cover most of your encounters: <span class="gk">εἴη</span> ("might be") and above all <span class="gk">μὴ γένοιτο</span> — Paul's thunderclap in Romans, "may it never be!" — the optative of γίνομαι.</p>`,
v:[446,451,455,456,457,463,466],
vids:[{t:"Lecture 24: The Imperative and Optative Moods",s:"Daily Dose of Greek — Rob Plummer (25:06)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-24/"}],
quiz:[
{q:"λυέτω means:",o:["Loose!","Let him loose","He looses","He was loosing"],a:1,w:"Third-person imperative — a real command aimed at a third party. English 'let him' is a translation crutch, not permission-granting."},
{q:"The aorist imperative λῦσον differs from present λῦε in:",o:["Time — it commands for the past","Aspect — action viewed as a whole vs ongoing","Politeness","Person"],a:1,w:"No augment, no past time. Aspect is the whole difference — which is why Matt 7:7's present imperatives are worth a sermon's attention."},
{q:"'Do not murder' (μὴ φονεύσῃς) uses:",o:["μή + present imperative","μή + aorist subjunctive","οὐ + future indicative","μή + optative"],a:1,w:"Aorist prohibitions switch to the subjunctive. μή + present imperative is the other pattern, forbidding a practice."},
{q:"μὴ γένοιτο is:",o:["An imperative — 'don't become'","An optative — 'may it never be!'","A subjunctive — 'lest it happen'","An indicative — 'it did not happen'"],a:1,w:"Aorist optative of γίνομαι. Paul's rhetorical recoil fourteen times in the letters — the optative's finest hour."}]},

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
v:[42,102,113,134,151,166,185,277,332,381,396,437],
vids:[{t:"Lecture 25: The Conjugation of -μι Verbs",s:"Daily Dose of Greek — Rob Plummer (12:28)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-25/"}],
quiz:[
{q:"μι-verbs differ from λύω-type verbs chiefly by:",o:["Having no aorist","Attaching endings directly to the stem, no connecting vowel","Being passive only","Lacking an augment"],a:1,w:"Athematic conjugation — the oldest layer of the language, preserved in its commonest verbs (as English keeps 'am/is/was')."},
{q:"ἔδωκεν parses as:",o:["Aorist active 3sg of δίδωμι — 'he gave'","Imperfect of δοκέω","Perfect of δίδωμι","Aorist passive"],a:0,w:"κ-aorist: augment + δωκ + 3sg. John 3:16's central verb."},
{q:"ἄφες in the Lord's Prayer (ἄφες ἡμῖν τὰ ὀφειλήματα) is:",o:["A noun — 'forgiveness'","Aorist imperative of ἀφίημι — 'forgive!'","Future indicative","A particle"],a:1,w:"ἀφίημι, the μι-verb of forgiving and leaving. Its κ-aorist ἀφῆκεν and passive ἀφέωνται run through the Gospels."},
{q:"ἀνέστη means:",o:["He stood up / rose","He was destroyed","He gave back","He placed"],a:0,w:"Second aorist of ἀνίστημι, intransitive: 'he rose'. The resurrection vocabulary uses both this and ἠγέρθη."}]},

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
v:[75,76,83,84,95,107,114,117,239,124,154,156,240,177,188,155,246,251,258,259,264,269,278,279,284,288,290,292,295,298,311,314,315,327,334,342,345,353,354,359,367,375,380,197,410,411,413,416,420,423,438,454,459,467,468],
vids:[{t:"Lecture 26: Reading Your Greek New Testament",s:"Daily Dose of Greek — Rob Plummer (27:24)",u:"https://dailydoseofgreek.com/learn-biblical-greek/learn-26/"},
      {t:"Daily Dose of Greek — one verse a day",s:"Free two-minute weekday videos; the habit that keeps the language",u:"https://dailydoseofgreek.com/"}],
quiz:[
{q:"Which book is the usual recommendation to read first?",o:["Hebrews","1 John","Luke","2 Peter"],a:1,w:"Short sentences, limited vocabulary, endless repetition. It builds confidence rather than destroying it."},
{q:"The word-study fallacy involves:",o:["Reading too fast","Treating etymology or every possible sense as the meaning in context","Ignoring the article","Using a lexicon"],a:1,w:"Meaning is determined by usage in context, not by a word's history or the full range of its possible senses."},
{q:"What is the best defence against losing the language again?",o:["Buying more books","A short daily reading habit tied to your preaching text","Memorising more paradigms","Learning Hebrew as well"],a:1,w:"Frequency beats intensity. Tying it to work you already do each week is what makes it survive a busy season."},
{q:"The recommended way to use parsing software is:",o:["Avoid it — it weakens you","Let it read for you","Attempt the parse yourself, then check","Only for Hebrew"],a:2,w:"Helps are for momentum, not for outsourcing. The attempt is where the learning happens; the check is where the correcting happens."}]}
];

/* Extracted from the single-file app. Plain script, no modules — load order in index.html matters. */

const ALPHABET=[
["Α α","alpha","a as in father","a"],["Β β","beta","b","b"],["Γ γ","gamma","g as in got","g"],
["Δ δ","delta","d","d"],["Ε ε","epsilon","e as in met","e"],["Ζ ζ","zeta","dz as in adze","z"],
["Η η","eta","e as in obey (long)","ē"],["Θ θ","theta","th as in thing","th"],
["Ι ι","iota","i as in pit / machine","i"],["Κ κ","kappa","k","k"],["Λ λ","lambda","l","l"],
["Μ μ","mu","m","m"],["Ν ν","nu","n","n"],["Ξ ξ","xi","x as in axe","x"],
["Ο ο","omicron","o as in not","o"],["Π π","pi","p","p"],["Ρ ρ","rho","r (trilled)","r"],
["Σ σ ς","sigma","s","s"],["Τ τ","tau","t","t"],["Υ υ","upsilon","u as in French tu","u/y"],
["Φ φ","phi","ph as in phone","ph"],["Χ χ","chi","ch as in loch","ch"],
["Ψ ψ","psi","ps as in lips","ps"],["Ω ω","omega","o as in tone (long)","ō"]
];

const YT = q => "https://www.youtube.com/results?search_query="+encodeURIComponent(q);

const LESSONS=[
{id:1,t:"The alphabet",s:"24 letters, sounds, and the two breathings",
body:`<p>Everything downstream depends on being able to sound a word out. If you can't pronounce it, you can't hold it in memory. Spend two or three days here before moving on.</p>
<div id="alphaHere"></div>
<h3>Three rules that trip people up</h3>
<p><b>Sigma</b> is written <span class="gk">ς</span> at the end of a word and <span class="gk">σ</span> everywhere else. Same letter, same sound: <span class="gk">λόγος</span>.</p>
<p><b>Breathings.</b> Every word starting with a vowel carries a mark. Rough (<span class="gk">ἁ</span>) adds an <i>h</i>; smooth (<span class="gk">ἀ</span>) adds nothing. So <span class="gk">ἅγιος</span> is <i>hagios</i>, but <span class="gk">ἀγάπη</span> is <i>agapē</i>. Initial <span class="gk">ῥ</span> always takes the rough breathing.</p>
<p><b>Gamma nasal.</b> <span class="gk">γ</span> before <span class="gk">γ, κ, χ, ξ</span> is pronounced <i>n</i>. So <span class="gk">ἄγγελος</span> is <i>angelos</i>, not <i>aggelos</i>.</p>
<h3>A note on pronunciation</h3>
<p>Erasmian is a scholarly convention, not how anyone spoke in the first century. It survives because it keeps distinct sounds distinct — in modern Greek η, ι, υ, ει and οι have all collapsed into <i>ee</i>, which is punishing for spelling. Stay with Erasmian.</p>`,
vids:[{t:"Alphabet song and Erasmian summary",s:"billmounce.com — free mp3 and worksheet",u:"https://www.billmounce.com/biblestudygreek2/greekalphabet"},
{t:"Koine alphabet walkthroughs",s:"YouTube search",u:YT("koine greek alphabet erasmian pronunciation")}],
quiz:[
{q:"How is ἄγγελος pronounced?",o:["ag-ge-los","an-ge-los","ah-ge-los","ang-khe-los"],a:1,w:"Gamma before another guttural becomes an n sound. This is why the English word is 'angel'."},
{q:"What does the rough breathing over ἁ add?",o:["Nothing","An h sound","A glottal stop","Length to the vowel"],a:1,w:"Rough breathing = h. ἅγιος is hagios. Smooth breathing adds nothing at all."},
{q:"Which letter is written two different ways depending on position?",o:["Beta","Sigma","Theta","Omega"],a:1,w:"σ within a word, ς at the end. One letter, one sound."}]},

{id:2,t:"Accents and punctuation",s:"What to worry about and what to ignore",
body:`<p>Greek has three accents: acute (<span class="gk">ά</span>), grave (<span class="gk">ὰ</span>) and circumflex (<span class="gk">ᾶ</span>). In Koine they no longer marked pitch, and for reading purposes they mostly matter for one reason: <b>they distinguish otherwise identical words</b>.</p>
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
<p>A small iota written under a long vowel: <span class="gk">ᾳ, ῃ, ῳ</span>. It isn't pronounced, but it is almost always a signal of the <b>dative case</b>. Worth spotting.</p>`,
vids:[{t:"Accents, breathings, syllabification",s:"YouTube search",u:YT("koine greek accents breathings syllabification")}],
quiz:[
{q:"In Greek, the mark ; means:",o:["Semicolon","Question mark","Full stop","Colon"],a:1,w:"It's a question mark. The raised dot · does the work of our semicolon and colon."},
{q:"τίς with an acute accent means:",o:["someone","a certain one","who? what?","this"],a:2,w:"Accented τίς is interrogative. Unaccented τις is indefinite: 'someone', 'a certain'. The accent is the only difference."},
{q:"An iota subscript (ᾳ, ῃ, ῳ) usually signals which case?",o:["Nominative","Genitive","Dative","Accusative"],a:2,w:"Dative. It's a silent letter but a loud grammatical clue."}]},

{id:3,t:"The definite article",s:"The single most useful paradigm in Greek",
body:`<p>The article appears about 19,870 times in the New Testament — roughly one word in every seven. It agrees with its noun in <b>gender, number and case</b>, so once you know it you can read the case of almost any noun it's attached to, even when you don't know the noun.</p>
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
<p><span class="gk">ὁ θεός</span> is simply "God", not "the God". Conversely its absence can be significant. Don't over-read either way without checking how that author normally writes.</p>`,
vids:[{t:"The Greek article explained",s:"YouTube search",u:YT("greek definite article paradigm koine")}],
quiz:[
{q:"τῶν is which case and number?",o:["Genitive singular","Genitive plural","Dative plural","Accusative plural"],a:1,w:"Genitive plural — and it's the same for all three genders, which makes it easy to spot."},
{q:"You meet τῇ before an unfamiliar noun. What do you know?",o:["Feminine dative singular","Feminine genitive singular","Masculine dative singular","Neuter nominative plural"],a:0,w:"Feminine dative singular. This is exactly why the article is worth memorising: it parses the noun for you."},
{q:"Which is true of every neuter noun in Greek?",o:["Nominative and genitive are identical","Nominative and accusative are identical","It has no dative","It never takes the article"],a:1,w:"Neuter nominative and accusative are always the same form. Context and word order decide which is meant."},
{q:"Which article form is NOT nominative?",o:["ὁ","αἱ","οἱ","τάς"],a:3,w:"τάς is feminine accusative plural. The four forms without an initial tau (ὁ, ἡ, οἱ, αἱ) are all nominative."}]},

{id:4,t:"Second declension nouns",s:"λόγος and ἔργον",
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
<tr><th>Dat</th><td class="g">ἔργῳ</td><td class="g">ἔργῳ</td></tr>
<tr><th>Acc</th><td class="g">ἔργον</td><td class="g">ἔργα</td></tr></table>
<p>Notice that neuter differs from masculine only in the nominative and accusative — everywhere else the endings are identical.</p>
<h3>Why lexicons list three things</h3>
<p><span class="gk">λόγος, -ου, ὁ</span> gives you the nominative, the genitive ending, and the article. The genitive tells you which declension it follows; the article tells you the gender. You need both, so learn nouns in this full form from the start.</p>`,
vids:[{t:"Second declension nouns",s:"YouTube search",u:YT("koine greek second declension nouns")}],
quiz:[
{q:"λόγῳ is which case?",o:["Nominative","Genitive","Dative","Accusative"],a:2,w:"Dative singular — the iota subscript under the omega gives it away."},
{q:"ἔργα could be:",o:["Nominative or accusative plural","Genitive singular only","Dative plural","Nominative singular"],a:0,w:"Neuter nominative and accusative are always identical, in both singular and plural."},
{q:"In the lexical entry λόγος, -ου, ὁ, what does ὁ tell you?",o:["It's a noun","It's masculine","It's singular","It's nominative"],a:1,w:"The article gives the gender. The genitive ending -ου gives the declension pattern."}]},

{id:5,t:"First declension nouns",s:"Mostly feminine, with a few masculines",
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
vids:[{t:"First declension nouns",s:"YouTube search",u:YT("koine greek first declension nouns eta alpha")}],
quiz:[
{q:"ὁ μαθητής is masculine even though it looks first-declension. How do you know?",o:["The -ής ending","The article ὁ","The accent","You can't"],a:1,w:"The article. This is why lexical entries always include it — form alone would mislead you here."},
{q:"Why is it ἡμέρας but δόξης in the genitive singular?",o:["Different declensions","ἡμέρα has a stem ending in ρ, so the alpha is kept","δόξα is masculine","Irregular"],a:1,w:"After ε, ι or ρ the alpha persists. Otherwise it becomes eta in the genitive and dative singular."},
{q:"ἀγάπῃ is:",o:["Nominative singular","Genitive singular","Dative singular","Accusative plural"],a:2,w:"Dative singular — iota subscript again."}]},

{id:6,t:"What the cases do",s:"Function, not just form",
body:`<p>Endings are only useful if you know what each case <i>does</i>. This is where translation turns into exegesis.</p>
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
vids:[{t:"Greek cases and their functions",s:"YouTube search",u:YT("greek cases genitive dative functions exegesis")}],
quiz:[
{q:"ἡ ἀγάπη τοῦ θεοῦ is ambiguous because τοῦ θεοῦ could be:",o:["Nominative or genitive","Subjective or objective genitive","Dative or genitive","Singular or plural"],a:1,w:"God loving us, or us loving God. Both are grammatically available; the context decides."},
{q:"Which case most often expresses the means or instrument of an action?",o:["Nominative","Genitive","Dative","Accusative"],a:2,w:"The dative covers instrument, location, sphere, and the indirect object — a wide range, which is why it needs care."},
{q:"In θεὸς ἦν ὁ λόγος, what identifies ὁ λόγος as the subject?",o:["Its position","The article","The verb","The accent"],a:1,w:"The article marks the subject; the anarthrous θεός is the predicate. Word order in Greek carries emphasis, not grammar."}]},

{id:7,t:"Present active indicative",s:"Your first verb paradigm",
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
<p>Greek tense encodes <b>aspect</b> primarily and time secondarily. The present is imperfective: the action viewed from inside, as ongoing or repeated. <span class="gk">πιστεύει</span> can be "he believes", "he is believing", "he keeps on believing" — the form itself doesn't settle which.</p>`,
vids:[{t:"Present active indicative",s:"YouTube search",u:YT("koine greek present active indicative lyo paradigm")}],
quiz:[
{q:"Parse λύομεν.",o:["1st plural present active indicative","1st singular present active indicative","2nd plural present active indicative","3rd plural present active indicative"],a:0,w:"'We loose.' The ending -ομεν is 1st person plural."},
{q:"What is the movable nu in λύουσιν?",o:["A plural marker","A meaningless addition before a vowel or pause","A sign of the subjunctive","A negation"],a:1,w:"Purely phonetic — like the English 'a' becoming 'an'. It carries no grammatical weight."},
{q:"The Greek present tense primarily encodes:",o:["Present time","Imperfective aspect","Completed action","Future intention"],a:1,w:"Aspect first, time second. Imperfective means viewed from inside, as ongoing — not necessarily happening right now."},
{q:"εἶ means:",o:["if","I am","you are","he is"],a:2,w:"'You are' — 2nd singular of εἰμί. Compare unaccented εἰ, 'if'. The accent is doing real work."}]},

{id:8,t:"Adjectives and position",s:"Attributive versus predicate",
body:`<p>Adjectives agree with their noun in gender, number and case. But <b>where</b> the adjective sits relative to the article changes the meaning entirely.</p>
<h3>Attributive — inside the article-noun unit</h3>
<p><span class="gk">ὁ ἀγαθὸς ἄνθρωπος</span> — "the good man". Also <span class="gk">ὁ ἄνθρωπος ὁ ἀγαθός</span>, with the article repeated. The adjective modifies.</p>
<h3>Predicate — outside it</h3>
<p><span class="gk">ὁ ἄνθρωπος ἀγαθός</span> — "the man <i>is</i> good". No verb is written; Greek supplies "is". The adjective asserts.</p>
<p>The test is simple: <b>is the adjective immediately preceded by an article?</b> If yes, attributive. If no, predicate.</p>
<h3>Substantival use</h3>
<p>An adjective with an article and no noun becomes a noun itself. <span class="gk">ὁ ἅγιος</span> — "the holy one". <span class="gk">οἱ ἅγιοι</span> — "the saints". <span class="gk">τὸ ἀγαθόν</span> — "the good thing", "that which is good". This is very common and worth watching for.</p>`,
vids:[{t:"Attributive and predicate position",s:"YouTube search",u:YT("greek attributive predicate position adjectives")}],
quiz:[
{q:"ὁ ἄνθρωπος ἀγαθός means:",o:["the good man","the man is good","a good man","the man of good"],a:1,w:"Predicate position — the adjective is not preceded by an article, so it asserts, and an unwritten 'is' completes the sense."},
{q:"οἱ ἅγιοι most naturally means:",o:["the holy ones / the saints","they are holy","holy things","the holy man"],a:0,w:"Substantival use: article plus adjective, no noun. Very common in the epistles."},
{q:"What single test distinguishes attributive from predicate position?",o:["Word order alone","Whether an article immediately precedes the adjective","The accent","The gender"],a:1,w:"Article immediately before the adjective means attributive. That's the whole test."}]},

{id:9,t:"Prepositions",s:"Case changes the meaning",
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
vids:[{t:"Greek prepositions and cases",s:"YouTube search",u:YT("koine greek prepositions cases chart")}],
quiz:[
{q:"διὰ τοῦτο (accusative) means:",o:["through this","because of this","with this","after this"],a:1,w:"διά with the accusative means 'because of'. With the genitive it means 'through'. Same word, different case, different logic."},
{q:"Which preposition always takes the dative?",o:["εἰς","ἐν","πρός","ἐκ"],a:1,w:"ἐν is invariably dative — which makes it one of the most useful case-signals in the NT."},
{q:"ὑπό with the genitive most often marks:",o:["Location under something","The agent of a passive verb","Purpose","Time"],a:1,w:"'By' — the personal agent of a passive verb. With the accusative it means physically 'under'."}]},

{id:10,t:"The imperfect and the augment",s:"Past-time forms in the indicative",
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
<p>The imperfect is the past tense of the imperfective aspect — the camera inside the action rather than outside it. Mark uses it constantly for vivid narrative. When an author switches from aorist to imperfect, that shift is usually doing something.</p>`,
vids:[{t:"The imperfect tense and augment",s:"YouTube search",u:YT("koine greek imperfect tense augment")}],
quiz:[
{q:"What does the augment mark?",o:["Plural number","Past time in the indicative","Passive voice","The subjunctive"],a:1,w:"Past time, and only in the indicative mood. Outside the indicative there is no augment because there is no time reference."},
{q:"The imperfect of ἐκβάλλω is:",o:["ἐἐκβαλλον","ἐκέβαλλον","ἐξέβαλλον","ἤκβαλλον"],a:2,w:"The augment slots in after the prepositional prefix, and ἐκ becomes ἐξ before a vowel."},
{q:"ἔλυον could be:",o:["1st singular or 3rd plural","1st plural only","2nd singular","3rd singular only"],a:0,w:"Both. Context resolves it — Greek tolerates this ambiguity happily."}]},

{id:11,t:"Aorist and verbal aspect",s:"The most misused tense in preaching",
body:`<p>The aorist active indicative typically shows an augment, the stem, a <span class="gk">σα</span> marker, and secondary endings: <span class="gk">ἔλυσα</span> — "I loosed".</p>
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
vids:[{t:"Verbal aspect in Koine Greek",s:"YouTube search",u:YT("koine greek verbal aspect aorist perfective")}],
quiz:[
{q:"Outside the indicative, the aorist communicates:",o:["Past time","Once-for-all action","Perfective aspect only","Completed action with ongoing results"],a:2,w:"Aspect alone. There is no augment and no time reference outside the indicative."},
{q:"Why is the 'once-for-all aorist' a fallacy?",o:["The aorist is always plural","The aorist can describe actions of any duration","The aorist is only used in narrative","Greek has no aorist"],a:1,w:"ἐβασίλευσεν ('he reigned') covers years. The aorist views the action as a whole, not as brief or unrepeatable."},
{q:"εἶπον is the aorist of which verb?",o:["εἰμί","λέγω","λαμβάνω","ἔρχομαι"],a:1,w:"A second aorist with a completely different stem from λέγω. These have to be memorised individually."},
{q:"What distinguishes the perfect tense from the aorist?",o:["The perfect is future","The perfect stresses a completed action with continuing results","The perfect is plural","Nothing"],a:1,w:"The perfect (stative aspect) views an action as completed with an abiding resulting state — τετέλεσται, 'it stands finished'."}]},

{id:12,t:"Middle and passive voice",s:"Where English has no equivalent",
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
vids:[{t:"Middle and passive voice",s:"YouTube search",u:YT("koine greek middle voice deponent verbs")}],
quiz:[
{q:"ἔρχομαι is middle in form. What does it mean?",o:["I am come (passive)","I come (active meaning)","I come for myself","I am being sent"],a:1,w:"A deponent, or middle-only, verb. Middle form, active meaning. Forcing a passive sense onto it produces nonsense."},
{q:"In the present tense, middle and passive forms are:",o:["Always different","Identical — context decides","Distinguished by the augment","Distinguished by accent"],a:1,w:"Identical in the present and imperfect. The aorist and future do distinguish them."},
{q:"The middle voice indicates the subject:",o:["Is acted upon","Acts with special reference to itself","Acts on a plural object","Is in the past"],a:1,w:"Roughly — the subject has a particular stake or involvement in the action. English needs a paraphrase to catch it."}]},

{id:13,t:"Participles",s:"The workhorse of Greek prose",
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
vids:[{t:"Greek participles explained",s:"YouTube search",u:YT("koine greek participles adverbial adjectival genitive absolute")}],
quiz:[
{q:"An aorist participle primarily communicates:",o:["Past time","Perfective aspect, often prior action","Ongoing action","Future action"],a:1,w:"Aspect first. Antecedent time is a common by-product, not the meaning itself."},
{q:"ὁ πιστεύων is:",o:["An adverbial participle","A substantival participle — 'the one who believes'","A genitive absolute","An imperative"],a:1,w:"Article plus participle, no noun: it functions as a noun. Extremely common in John."},
{q:"A genitive absolute is:",o:["A participle with no subject","A participle and its subject in the genitive, detached from the main clause","A possessive construction","A type of infinitive"],a:1,w:"Grammatically independent of the main clause, usually giving background circumstance."},
{q:"A present participle usually describes action:",o:["Prior to the main verb","Contemporaneous with the main verb","After the main verb","Without reference to the main verb"],a:1,w:"Imperfective aspect typically yields contemporaneous time relative to the main verb."}]},

{id:14,t:"Subjunctive and ἵνα clauses",s:"Purpose, probability and exhortation",
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
vids:[{t:"The subjunctive mood",s:"YouTube search",u:YT("koine greek subjunctive hina clauses")}],
quiz:[
{q:"ἵνα followed by a subjunctive usually indicates:",o:["A condition","Purpose or result","Time","Concession"],a:1,w:"'In order that.' One of the highest-frequency constructions in the NT and a reliable clue to clause structure."},
{q:"What marks the subjunctive formally?",o:["An augment","A lengthened connecting vowel","A sigma","Reduplication"],a:1,w:"Omicron lengthens to omega, epsilon to eta. No augment, because the subjunctive has no time reference."},
{q:"ἀγαπῶμεν ἀλλήλους is best taken as:",o:["We love one another","Let us love one another","They loved one another","Do you love one another?"],a:1,w:"A hortatory subjunctive — 1st person plural used as an exhortation. Though the form is ambiguous with the indicative, so context decides."}]},

{id:15,t:"Infinitives",s:"Verbal nouns and their many uses",
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
vids:[{t:"Greek infinitives",s:"YouTube search",u:YT("koine greek infinitive constructions purpose result")}],
quiz:[
{q:"The subject of an infinitive appears in which case?",o:["Nominative","Genitive","Dative","Accusative"],a:3,w:"Accusative. This looks wrong to English eyes but is entirely standard."},
{q:"ὥστε + infinitive expresses:",o:["Purpose","Result","Time","Cause"],a:1,w:"Result — 'so that, with the result that'. Purpose and result overlap in Greek, and distinguishing them is often an interpretive judgment."},
{q:"ἐν τῷ + infinitive most often expresses:",o:["Cause","Contemporaneous time — 'while'","Purpose","Comparison"],a:1,w:"'While' or 'during'. Luke uses this constantly."}]},

{id:16,t:"Reading strategy",s:"How to keep it and use it",
body:`<p>You now have enough to start reading. What follows determines whether the language survives.</p>
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
vids:[{t:"Daily Dose of Greek — a verse a day, two minutes",s:"YouTube channel",u:"https://www.youtube.com/channel/UCRSbS2XhqOhnSUzWfGHUkLg"},
{t:"Exegetical fallacies to avoid",s:"YouTube search",u:YT("carson exegetical fallacies word study")}],
quiz:[
{q:"Which book is the usual recommendation to read first?",o:["Hebrews","1 John","Luke","2 Peter"],a:1,w:"Short sentences, limited vocabulary, endless repetition. It builds confidence rather than destroying it."},
{q:"The word-study fallacy involves:",o:["Reading too fast","Treating etymology or every possible sense as the meaning in context","Ignoring the article","Using a lexicon"],a:1,w:"Meaning is determined by usage in context, not by a word's history or the full range of its possible senses."},
{q:"What is the best defence against losing the language again?",o:["Buying more books","A short daily reading habit tied to your preaching text","Memorising more paradigms","Learning Hebrew as well"],a:1,w:"Frequency beats intensity. Tying it to work you already do each week is what makes it survive a busy season."}]}
];

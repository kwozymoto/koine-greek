/* Reference paradigms for the Tables tab. Plain script, no modules.
   Each entry: t = title, tags = extra search words, html = table markup
   (styled by the existing table CSS in css/app.css). */

const PARADIGMS=[

{t:"Sounds — alphabet and diphthongs",tags:"pronunciation audio erasmian alphabet diphthong sound listen",
html:`<p class="muted" style="font-size:.83rem;margin-top:0">Tap to hear the name, then the sound. Erasmian.</p>
<div id="soundTableHere"></div>`},


{t:"The article",tags:"ho he to definite",
html:`<table><caption>Singular</caption>
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
<tr><th>Acc</th><td class="g">τούς</td><td class="g">τάς</td><td class="g">τά</td></tr></table>`},

{t:"Second declension nouns",tags:"logos ergon masculine neuter",
html:`<table><caption>λόγος, -ου, ὁ — word · ἔργον, -ου, τό — work</caption>
<tr><th></th><th>Masc sg</th><th>Masc pl</th><th>Neut sg</th><th>Neut pl</th></tr>
<tr><th>Nom</th><td class="g">λόγος</td><td class="g">λόγοι</td><td class="g">ἔργον</td><td class="g">ἔργα</td></tr>
<tr><th>Gen</th><td class="g">λόγου</td><td class="g">λόγων</td><td class="g">ἔργου</td><td class="g">ἔργων</td></tr>
<tr><th>Dat</th><td class="g">λόγῳ</td><td class="g">λόγοις</td><td class="g">ἔργῳ</td><td class="g">ἔργοις</td></tr>
<tr><th>Acc</th><td class="g">λόγον</td><td class="g">λόγους</td><td class="g">ἔργον</td><td class="g">ἔργα</td></tr></table>`},

{t:"First declension nouns",tags:"agape doxa hemera mathetes feminine eta alpha",
html:`<table><caption>Three feminine patterns and the masculine</caption>
<tr><th></th><th>ἀγάπη (η)</th><th>δόξα (α→η)</th><th>ἡμέρα (pure α)</th><th>μαθητής (masc)</th></tr>
<tr><th>Nom</th><td class="g">ἀγάπη</td><td class="g">δόξα</td><td class="g">ἡμέρα</td><td class="g">μαθητής</td></tr>
<tr><th>Gen</th><td class="g">ἀγάπης</td><td class="g">δόξης</td><td class="g">ἡμέρας</td><td class="g">μαθητοῦ</td></tr>
<tr><th>Dat</th><td class="g">ἀγάπῃ</td><td class="g">δόξῃ</td><td class="g">ἡμέρᾳ</td><td class="g">μαθητῇ</td></tr>
<tr><th>Acc</th><td class="g">ἀγάπην</td><td class="g">δόξαν</td><td class="g">ἡμέραν</td><td class="g">μαθητήν</td></tr>
<tr><th>Nom pl</th><td class="g">ἀγάπαι</td><td class="g">δόξαι</td><td class="g">ἡμέραι</td><td class="g">μαθηταί</td></tr>
<tr><th>Gen pl</th><td class="g">ἀγαπῶν</td><td class="g">δοξῶν</td><td class="g">ἡμερῶν</td><td class="g">μαθητῶν</td></tr>
<tr><th>Dat pl</th><td class="g">ἀγάπαις</td><td class="g">δόξαις</td><td class="g">ἡμέραις</td><td class="g">μαθηταῖς</td></tr>
<tr><th>Acc pl</th><td class="g">ἀγάπας</td><td class="g">δόξας</td><td class="g">ἡμέρας</td><td class="g">μαθητάς</td></tr></table>
<p class="muted" style="font-size:.83rem">Stems in ε, ι, ρ keep α throughout; other α-stems shift to η in the genitive and dative singular.</p>`},

{t:"Third declension nouns",tags:"sarx pneuma pistis pater basileus consonant stem",
html:`<table><caption>The stem hides in the genitive</caption>
<tr><th></th><th>σάρξ, σαρκός, ἡ</th><th>πνεῦμα, -ατος, τό</th><th>πίστις, -εως, ἡ</th><th>πατήρ, πατρός, ὁ</th><th>βασιλεύς, -έως, ὁ</th></tr>
<tr><th>Nom</th><td class="g">σάρξ</td><td class="g">πνεῦμα</td><td class="g">πίστις</td><td class="g">πατήρ</td><td class="g">βασιλεύς</td></tr>
<tr><th>Gen</th><td class="g">σαρκός</td><td class="g">πνεύματος</td><td class="g">πίστεως</td><td class="g">πατρός</td><td class="g">βασιλέως</td></tr>
<tr><th>Dat</th><td class="g">σαρκί</td><td class="g">πνεύματι</td><td class="g">πίστει</td><td class="g">πατρί</td><td class="g">βασιλεῖ</td></tr>
<tr><th>Acc</th><td class="g">σάρκα</td><td class="g">πνεῦμα</td><td class="g">πίστιν</td><td class="g">πατέρα</td><td class="g">βασιλέα</td></tr>
<tr><th>Nom pl</th><td class="g">σάρκες</td><td class="g">πνεύματα</td><td class="g">πίστεις</td><td class="g">πατέρες</td><td class="g">βασιλεῖς</td></tr>
<tr><th>Gen pl</th><td class="g">σαρκῶν</td><td class="g">πνευμάτων</td><td class="g">πίστεων</td><td class="g">πατέρων</td><td class="g">βασιλέων</td></tr>
<tr><th>Dat pl</th><td class="g">σαρξί(ν)</td><td class="g">πνεύμασι(ν)</td><td class="g">πίστεσι(ν)</td><td class="g">πατράσι(ν)</td><td class="g">βασιλεῦσι(ν)</td></tr>
<tr><th>Acc pl</th><td class="g">σάρκας</td><td class="g">πνεύματα</td><td class="g">πίστεις</td><td class="g">πατέρας</td><td class="g">βασιλεῖς</td></tr></table>`},

{t:"Adjectives and position",tags:"agathos attributive predicate",
html:`<table><caption>ἀγαθός, -ή, -όν — good (singular)</caption>
<tr><th></th><th>Masc</th><th>Fem</th><th>Neut</th></tr>
<tr><th>Nom</th><td class="g">ἀγαθός</td><td class="g">ἀγαθή</td><td class="g">ἀγαθόν</td></tr>
<tr><th>Gen</th><td class="g">ἀγαθοῦ</td><td class="g">ἀγαθῆς</td><td class="g">ἀγαθοῦ</td></tr>
<tr><th>Dat</th><td class="g">ἀγαθῷ</td><td class="g">ἀγαθῇ</td><td class="g">ἀγαθῷ</td></tr>
<tr><th>Acc</th><td class="g">ἀγαθόν</td><td class="g">ἀγαθήν</td><td class="g">ἀγαθόν</td></tr></table>
<p class="muted" style="font-size:.83rem"><b>Attributive</b> (inside the article group): ὁ ἀγαθὸς λόγος / ὁ λόγος ὁ ἀγαθός — "the good word". <b>Predicate</b> (outside it): ἀγαθὸς ὁ λόγος — "the word is good". Plural follows λόγος / ἀγάπη / ἔργον.</p>`},

{t:"πᾶς, πολύς, μέγας",tags:"pas all every polys much many megas great irregular",
html:`<table><caption>πᾶς, πᾶσα, πᾶν — all, every (stem παντ-)</caption>
<tr><th></th><th>Masc</th><th>Fem</th><th>Neut</th></tr>
<tr><th>Nom</th><td class="g">πᾶς</td><td class="g">πᾶσα</td><td class="g">πᾶν</td></tr>
<tr><th>Gen</th><td class="g">παντός</td><td class="g">πάσης</td><td class="g">παντός</td></tr>
<tr><th>Dat</th><td class="g">παντί</td><td class="g">πάσῃ</td><td class="g">παντί</td></tr>
<tr><th>Acc</th><td class="g">πάντα</td><td class="g">πᾶσαν</td><td class="g">πᾶν</td></tr>
<tr><th>Nom pl</th><td class="g">πάντες</td><td class="g">πᾶσαι</td><td class="g">πάντα</td></tr>
<tr><th>Gen pl</th><td class="g">πάντων</td><td class="g">πασῶν</td><td class="g">πάντων</td></tr>
<tr><th>Dat pl</th><td class="g">πᾶσι(ν)</td><td class="g">πάσαις</td><td class="g">πᾶσι(ν)</td></tr>
<tr><th>Acc pl</th><td class="g">πάντας</td><td class="g">πάσας</td><td class="g">πάντα</td></tr></table>
<p class="muted" style="font-size:.83rem">πολύς and μέγας are regular second/first declension except in four slots each — masculine and neuter, nominative and accusative singular — giving three forms apiece: πολύς, πολύν, πολύ and μέγας, μέγαν, μέγα (neuter nominative and accusative are the same). Everything else: πολλοῦ, πολλῷ… μεγάλου, μεγάλῳ…</p>`},

{t:"Personal pronouns",tags:"ego su autos I you he she it",
html:`<table><caption>ἐγώ and σύ</caption>
<tr><th></th><th>I</th><th>we</th><th>you</th><th>you (pl)</th></tr>
<tr><th>Nom</th><td class="g">ἐγώ</td><td class="g">ἡμεῖς</td><td class="g">σύ</td><td class="g">ὑμεῖς</td></tr>
<tr><th>Gen</th><td class="g">ἐμοῦ (μου)</td><td class="g">ἡμῶν</td><td class="g">σοῦ (σου)</td><td class="g">ὑμῶν</td></tr>
<tr><th>Dat</th><td class="g">ἐμοί (μοι)</td><td class="g">ἡμῖν</td><td class="g">σοί (σοι)</td><td class="g">ὑμῖν</td></tr>
<tr><th>Acc</th><td class="g">ἐμέ (με)</td><td class="g">ἡμᾶς</td><td class="g">σέ (σε)</td><td class="g">ὑμᾶς</td></tr></table>
<table><caption>αὐτός — he, she, it (declines like the article pattern)</caption>
<tr><th></th><th>Masc</th><th>Fem</th><th>Neut</th></tr>
<tr><th>Nom</th><td class="g">αὐτός / αὐτοί</td><td class="g">αὐτή / αὐταί</td><td class="g">αὐτό / αὐτά</td></tr>
<tr><th>Gen</th><td class="g">αὐτοῦ / αὐτῶν</td><td class="g">αὐτῆς / αὐτῶν</td><td class="g">αὐτοῦ / αὐτῶν</td></tr>
<tr><th>Dat</th><td class="g">αὐτῷ / αὐτοῖς</td><td class="g">αὐτῇ / αὐταῖς</td><td class="g">αὐτῷ / αὐτοῖς</td></tr>
<tr><th>Acc</th><td class="g">αὐτόν / αὐτούς</td><td class="g">αὐτήν / αὐτάς</td><td class="g">αὐτό / αὐτά</td></tr></table>`},

{t:"Demonstratives",tags:"houtos ekeinos this that",
html:`<table><caption>οὗτος — this (sg / pl)</caption>
<tr><th></th><th>Masc</th><th>Fem</th><th>Neut</th></tr>
<tr><th>Nom</th><td class="g">οὗτος / οὗτοι</td><td class="g">αὕτη / αὗται</td><td class="g">τοῦτο / ταῦτα</td></tr>
<tr><th>Gen</th><td class="g">τούτου / τούτων</td><td class="g">ταύτης / τούτων</td><td class="g">τούτου / τούτων</td></tr>
<tr><th>Dat</th><td class="g">τούτῳ / τούτοις</td><td class="g">ταύτῃ / ταύταις</td><td class="g">τούτῳ / τούτοις</td></tr>
<tr><th>Acc</th><td class="g">τοῦτον / τούτους</td><td class="g">ταύτην / ταύτας</td><td class="g">τοῦτο / ταῦτα</td></tr></table>
<p class="muted" style="font-size:.83rem">ἐκεῖνος, ἐκείνη, ἐκεῖνο — "that" — declines exactly like αὐτός.</p>`},

{t:"Relative pronoun",tags:"hos he ho who which relative",
html:`<table><caption>ὅς, ἥ, ὅ — who, which (sg / pl)</caption>
<tr><th></th><th>Masc</th><th>Fem</th><th>Neut</th></tr>
<tr><th>Nom</th><td class="g">ὅς / οἵ</td><td class="g">ἥ / αἵ</td><td class="g">ὅ / ἅ</td></tr>
<tr><th>Gen</th><td class="g">οὗ / ὧν</td><td class="g">ἧς / ὧν</td><td class="g">οὗ / ὧν</td></tr>
<tr><th>Dat</th><td class="g">ᾧ / οἷς</td><td class="g">ᾗ / αἷς</td><td class="g">ᾧ / οἷς</td></tr>
<tr><th>Acc</th><td class="g">ὅν / οὕς</td><td class="g">ἥν / ἅς</td><td class="g">ὅ / ἅ</td></tr></table>
<p class="muted" style="font-size:.83rem">Gender and number from the antecedent; case from its own clause. Always rough breathing + accent (ἥ vs the article ἡ; ἤ "or" has smooth breathing).</p>`},

{t:"Interrogative, indefinite, reflexive",tags:"tis ti who what someone emautou seautou heautou allelon",
html:`<table><caption>τίς (who? what?) — the accent is the difference from τις (someone)</caption>
<tr><th></th><th>Masc/Fem</th><th>Neut</th></tr>
<tr><th>Nom</th><td class="g">τίς / τίνες</td><td class="g">τί / τίνα</td></tr>
<tr><th>Gen</th><td class="g">τίνος / τίνων</td><td class="g">τίνος / τίνων</td></tr>
<tr><th>Dat</th><td class="g">τίνι / τίσι(ν)</td><td class="g">τίνι / τίσι(ν)</td></tr>
<tr><th>Acc</th><td class="g">τίνα / τίνας</td><td class="g">τί / τίνα</td></tr></table>
<p class="muted" style="font-size:.83rem">Reflexives (gen/dat/acc only): ἐμαυτοῦ myself · σεαυτοῦ yourself · ἑαυτοῦ himself/herself/itself · plural ἑαυτῶν for all persons. Reciprocal: ἀλλήλων — one another.</p>`},

{t:"εἰμί — to be",tags:"eimi is was will be",
html:`<table><caption>Present, imperfect, future</caption>
<tr><th></th><th>Present</th><th>Imperfect</th><th>Future</th></tr>
<tr><th>1sg</th><td class="g">εἰμί</td><td class="g">ἤμην</td><td class="g">ἔσομαι</td></tr>
<tr><th>2sg</th><td class="g">εἶ</td><td class="g">ἦς</td><td class="g">ἔσῃ</td></tr>
<tr><th>3sg</th><td class="g">ἐστί(ν)</td><td class="g">ἦν</td><td class="g">ἔσται</td></tr>
<tr><th>1pl</th><td class="g">ἐσμέν</td><td class="g">ἦμεν</td><td class="g">ἐσόμεθα</td></tr>
<tr><th>2pl</th><td class="g">ἐστέ</td><td class="g">ἦτε</td><td class="g">ἔσεσθε</td></tr>
<tr><th>3pl</th><td class="g">εἰσί(ν)</td><td class="g">ἦσαν</td><td class="g">ἔσονται</td></tr></table>
<p class="muted" style="font-size:.83rem">Subjunctive: ὦ, ᾖς, ᾖ, ὦμεν, ἦτε, ὦσι(ν). Infinitive: εἶναι. Participle: ὤν, οὖσα, ὄν.</p>`},

{t:"λύω — active indicative",tags:"luo present imperfect future aorist perfect pluperfect",
html:`<table><caption>All active indicative tenses</caption>
<tr><th></th><th>Pres</th><th>Impf</th><th>Fut</th><th>Aor</th><th>Perf</th></tr>
<tr><th>1sg</th><td class="g">λύω</td><td class="g">ἔλυον</td><td class="g">λύσω</td><td class="g">ἔλυσα</td><td class="g">λέλυκα</td></tr>
<tr><th>2sg</th><td class="g">λύεις</td><td class="g">ἔλυες</td><td class="g">λύσεις</td><td class="g">ἔλυσας</td><td class="g">λέλυκας</td></tr>
<tr><th>3sg</th><td class="g">λύει</td><td class="g">ἔλυε(ν)</td><td class="g">λύσει</td><td class="g">ἔλυσε(ν)</td><td class="g">λέλυκε(ν)</td></tr>
<tr><th>1pl</th><td class="g">λύομεν</td><td class="g">ἐλύομεν</td><td class="g">λύσομεν</td><td class="g">ἐλύσαμεν</td><td class="g">λελύκαμεν</td></tr>
<tr><th>2pl</th><td class="g">λύετε</td><td class="g">ἐλύετε</td><td class="g">λύσετε</td><td class="g">ἐλύσατε</td><td class="g">λελύκατε</td></tr>
<tr><th>3pl</th><td class="g">λύουσι(ν)</td><td class="g">ἔλυον</td><td class="g">λύσουσι(ν)</td><td class="g">ἔλυσαν</td><td class="g">λελύκασι(ν)</td></tr></table>
<p class="muted" style="font-size:.83rem">Pluperfect: ἐλελύκειν, ἐλελύκεις, ἐλελύκει, ἐλελύκειμεν, ἐλελύκειτε, ἐλελύκεισαν.</p>`},

{t:"λύω — middle and passive indicative",tags:"luomai middle passive elyomen elythen",
html:`<table><caption>Shared middle/passive forms</caption>
<tr><th></th><th>Pres m/p</th><th>Impf m/p</th><th>Perf m/p</th></tr>
<tr><th>1sg</th><td class="g">λύομαι</td><td class="g">ἐλυόμην</td><td class="g">λέλυμαι</td></tr>
<tr><th>2sg</th><td class="g">λύῃ</td><td class="g">ἐλύου</td><td class="g">λέλυσαι</td></tr>
<tr><th>3sg</th><td class="g">λύεται</td><td class="g">ἐλύετο</td><td class="g">λέλυται</td></tr>
<tr><th>1pl</th><td class="g">λυόμεθα</td><td class="g">ἐλυόμεθα</td><td class="g">λελύμεθα</td></tr>
<tr><th>2pl</th><td class="g">λύεσθε</td><td class="g">ἐλύεσθε</td><td class="g">λέλυσθε</td></tr>
<tr><th>3pl</th><td class="g">λύονται</td><td class="g">ἐλύοντο</td><td class="g">λέλυνται</td></tr></table>
<table><caption>Distinct middle and passive: future and aorist</caption>
<tr><th></th><th>Fut mid</th><th>Aor mid</th><th>Aor pass</th><th>Fut pass</th></tr>
<tr><th>1sg</th><td class="g">λύσομαι</td><td class="g">ἐλυσάμην</td><td class="g">ἐλύθην</td><td class="g">λυθήσομαι</td></tr>
<tr><th>2sg</th><td class="g">λύσῃ</td><td class="g">ἐλύσω</td><td class="g">ἐλύθης</td><td class="g">λυθήσῃ</td></tr>
<tr><th>3sg</th><td class="g">λύσεται</td><td class="g">ἐλύσατο</td><td class="g">ἐλύθη</td><td class="g">λυθήσεται</td></tr>
<tr><th>1pl</th><td class="g">λυσόμεθα</td><td class="g">ἐλυσάμεθα</td><td class="g">ἐλύθημεν</td><td class="g">λυθησόμεθα</td></tr>
<tr><th>2pl</th><td class="g">λύσεσθε</td><td class="g">ἐλύσασθε</td><td class="g">ἐλύθητε</td><td class="g">λυθήσεσθε</td></tr>
<tr><th>3pl</th><td class="g">λύσονται</td><td class="g">ἐλύσαντο</td><td class="g">ἐλύθησαν</td><td class="g">λυθήσονται</td></tr></table>`},

{t:"Subjunctive mood",tags:"hina subjunctive lengthened vowel",
html:`<table><caption>λύω — subjunctive (long connecting vowel)</caption>
<tr><th></th><th>Pres act</th><th>Aor act</th><th>Pres m/p</th><th>Aor pass</th></tr>
<tr><th>1sg</th><td class="g">λύω</td><td class="g">λύσω</td><td class="g">λύωμαι</td><td class="g">λυθῶ</td></tr>
<tr><th>2sg</th><td class="g">λύῃς</td><td class="g">λύσῃς</td><td class="g">λύῃ</td><td class="g">λυθῇς</td></tr>
<tr><th>3sg</th><td class="g">λύῃ</td><td class="g">λύσῃ</td><td class="g">λύηται</td><td class="g">λυθῇ</td></tr>
<tr><th>1pl</th><td class="g">λύωμεν</td><td class="g">λύσωμεν</td><td class="g">λυώμεθα</td><td class="g">λυθῶμεν</td></tr>
<tr><th>2pl</th><td class="g">λύητε</td><td class="g">λύσητε</td><td class="g">λύησθε</td><td class="g">λυθῆτε</td></tr>
<tr><th>3pl</th><td class="g">λύωσι(ν)</td><td class="g">λύσωσι(ν)</td><td class="g">λύωνται</td><td class="g">λυθῶσι(ν)</td></tr></table>
<p class="muted" style="font-size:.83rem">No augment in the aorist subjunctive — aspect only, no past time.</p>`},

{t:"Imperative mood",tags:"command imperative lue luson",
html:`<table><caption>λύω — imperative</caption>
<tr><th></th><th>Pres act</th><th>Aor act</th><th>Pres m/p</th><th>Aor pass</th></tr>
<tr><th>2sg</th><td class="g">λῦε</td><td class="g">λῦσον</td><td class="g">λύου</td><td class="g">λύθητι</td></tr>
<tr><th>3sg</th><td class="g">λυέτω</td><td class="g">λυσάτω</td><td class="g">λυέσθω</td><td class="g">λυθήτω</td></tr>
<tr><th>2pl</th><td class="g">λύετε</td><td class="g">λύσατε</td><td class="g">λύεσθε</td><td class="g">λύθητε</td></tr>
<tr><th>3pl</th><td class="g">λυέτωσαν</td><td class="g">λυσάτωσαν</td><td class="g">λυέσθωσαν</td><td class="g">λυθήτωσαν</td></tr></table>
<p class="muted" style="font-size:.83rem">Prohibitions: μή + present imperative (general practice / stop) · μή + aorist subjunctive (don't do it at all).</p>`},

{t:"Infinitives",tags:"infinitive luein lusai",
html:`<table><caption>λύω — the infinitives</caption>
<tr><th></th><th>Active</th><th>Middle</th><th>Passive</th></tr>
<tr><th>Present</th><td class="g">λύειν</td><td class="g" colspan="2" style="text-align:center">λύεσθαι</td></tr>
<tr><th>Aorist</th><td class="g">λῦσαι</td><td class="g">λύσασθαι</td><td class="g">λυθῆναι</td></tr>
<tr><th>Perfect</th><td class="g">λελυκέναι</td><td class="g" colspan="2" style="text-align:center">λελύσθαι</td></tr></table>
<p class="muted" style="font-size:.83rem">εἰμί: εἶναι. Articular infinitive: the neuter article + infinitive (ἐν τῷ σπείρειν — "while sowing").</p>`},

{t:"Participles — the key forms",tags:"participle luon luousa lusas lytheis",
html:`<table><caption>Nominative singular of each participle of λύω</caption>
<tr><th></th><th>Masc</th><th>Fem</th><th>Neut</th><th>Declines like</th></tr>
<tr><th>Pres act</th><td class="g">λύων</td><td class="g">λύουσα</td><td class="g">λῦον</td><td>3-1-3 (gen λύοντος)</td></tr>
<tr><th>Pres m/p</th><td class="g">λυόμενος</td><td class="g">λυομένη</td><td class="g">λυόμενον</td><td>2-1-2</td></tr>
<tr><th>Aor act</th><td class="g">λύσας</td><td class="g">λύσασα</td><td class="g">λῦσαν</td><td>3-1-3 (gen λύσαντος)</td></tr>
<tr><th>Aor mid</th><td class="g">λυσάμενος</td><td class="g">λυσαμένη</td><td class="g">λυσάμενον</td><td>2-1-2</td></tr>
<tr><th>Aor pass</th><td class="g">λυθείς</td><td class="g">λυθεῖσα</td><td class="g">λυθέν</td><td>3-1-3 (gen λυθέντος)</td></tr>
<tr><th>Perf act</th><td class="g">λελυκώς</td><td class="g">λελυκυῖα</td><td class="g">λελυκός</td><td>3-1-3 (gen λελυκότος)</td></tr>
<tr><th>Perf m/p</th><td class="g">λελυμένος</td><td class="g">λελυμένη</td><td class="g">λελυμένον</td><td>2-1-2</td></tr>
<tr><th>εἰμί</th><td class="g">ὤν</td><td class="g">οὖσα</td><td class="g">ὄν</td><td>3-1-3 (gen ὄντος)</td></tr></table>`},

{t:"Contract verbs — present",tags:"agapao poieo pleroo contraction",
html:`<table><caption>Present active of the three classes</caption>
<tr><th></th><th>ἀγαπάω (α)</th><th>ποιέω (ε)</th><th>πληρόω (ο)</th></tr>
<tr><th>1sg</th><td class="g">ἀγαπῶ</td><td class="g">ποιῶ</td><td class="g">πληρῶ</td></tr>
<tr><th>2sg</th><td class="g">ἀγαπᾷς</td><td class="g">ποιεῖς</td><td class="g">πληροῖς</td></tr>
<tr><th>3sg</th><td class="g">ἀγαπᾷ</td><td class="g">ποιεῖ</td><td class="g">πληροῖ</td></tr>
<tr><th>1pl</th><td class="g">ἀγαπῶμεν</td><td class="g">ποιοῦμεν</td><td class="g">πληροῦμεν</td></tr>
<tr><th>2pl</th><td class="g">ἀγαπᾶτε</td><td class="g">ποιεῖτε</td><td class="g">πληροῦτε</td></tr>
<tr><th>3pl</th><td class="g">ἀγαπῶσι(ν)</td><td class="g">ποιοῦσι(ν)</td><td class="g">πληροῦσι(ν)</td></tr></table>
<p class="muted" style="font-size:.83rem">Before a tense sign the vowel lengthens instead: ἀγαπήσω, ἠγάπησα · ποιήσω, ἐποίησα · πληρώσω, ἐπλήρωσα. Liquid stems (λ μ ν ρ) refuse σ: future μενῶ, ἀγγελῶ; aorist ἔμεινα, ἤγγειλα.</p>`},

{t:"μι-verbs",tags:"didomi tithemi histemi aphiemi athematic",
html:`<table><caption>Present active</caption>
<tr><th></th><th>δίδωμι — give</th><th>τίθημι — place</th><th>ἵστημι — stand</th></tr>
<tr><th>1sg</th><td class="g">δίδωμι</td><td class="g">τίθημι</td><td class="g">ἵστημι</td></tr>
<tr><th>2sg</th><td class="g">δίδως</td><td class="g">τίθης</td><td class="g">ἵστης</td></tr>
<tr><th>3sg</th><td class="g">δίδωσι(ν)</td><td class="g">τίθησι(ν)</td><td class="g">ἵστησι(ν)</td></tr>
<tr><th>1pl</th><td class="g">δίδομεν</td><td class="g">τίθεμεν</td><td class="g">ἵσταμεν</td></tr>
<tr><th>2pl</th><td class="g">δίδοτε</td><td class="g">τίθετε</td><td class="g">ἵστατε</td></tr>
<tr><th>3pl</th><td class="g">διδόασι(ν)</td><td class="g">τιθέασι(ν)</td><td class="g">ἱστᾶσι(ν)</td></tr></table>
<p class="muted" style="font-size:.83rem">Aorists: ἔδωκα (impv δός, δότε · ptc δούς) · ἔθηκα (ptc θείς) · ἔστησα trans. / ἔστην intrans. "stood" (ἀνέστη — he rose). ἀφίημι forgives: ἀφῆκεν, ἄφες, ἀφέωνται.</p>`},

{t:"Principal parts — key irregular verbs",tags:"principal parts stems irregular",
html:`<table><caption>Present · Future · Aorist · Perfect act · Perfect m/p · Aorist pass</caption>
<tr><th>λέγω say</th><td class="g">ἐρῶ, εἶπον, εἴρηκα, εἴρημαι, ἐρρέθην</td></tr>
<tr><th>ἔρχομαι come</th><td class="g">ἐλεύσομαι, ἦλθον, ἐλήλυθα, —, —</td></tr>
<tr><th>γίνομαι become</th><td class="g">γενήσομαι, ἐγενόμην, γέγονα, γεγένημαι, ἐγενήθην</td></tr>
<tr><th>ὁράω see</th><td class="g">ὄψομαι, εἶδον, ἑώρακα, —, ὤφθην</td></tr>
<tr><th>λαμβάνω take</th><td class="g">λήμψομαι, ἔλαβον, εἴληφα, —, ἐλήμφθην</td></tr>
<tr><th>δίδωμι give</th><td class="g">δώσω, ἔδωκα, δέδωκα, δέδομαι, ἐδόθην</td></tr>
<tr><th>γινώσκω know</th><td class="g">γνώσομαι, ἔγνων, ἔγνωκα, ἔγνωσμαι, ἐγνώσθην</td></tr>
<tr><th>εὑρίσκω find</th><td class="g">εὑρήσω, εὗρον, εὕρηκα, —, εὑρέθην</td></tr>
<tr><th>ἔχω have</th><td class="g">ἕξω, ἔσχον, ἔσχηκα, —, —</td></tr>
<tr><th>βάλλω throw</th><td class="g">βαλῶ, ἔβαλον, βέβληκα, βέβλημαι, ἐβλήθην</td></tr>
<tr><th>ἐγείρω raise</th><td class="g">ἐγερῶ, ἤγειρα, —, ἐγήγερμαι, ἠγέρθην</td></tr>
<tr><th>ἀποστέλλω send</th><td class="g">ἀποστελῶ, ἀπέστειλα, ἀπέσταλκα, ἀπέσταλμαι, ἀπεστάλην</td></tr>
<tr><th>σῴζω save</th><td class="g">σώσω, ἔσωσα, σέσωκα, σέσῳσμαι, ἐσώθην</td></tr>
<tr><th>κρίνω judge</th><td class="g">κρινῶ, ἔκρινα, κέκρικα, κέκριμαι, ἐκρίθην</td></tr>
<tr><th>μένω remain</th><td class="g">μενῶ, ἔμεινα, μεμένηκα, —, —</td></tr>
<tr><th>πίνω drink</th><td class="g">πίομαι, ἔπιον, πέπωκα, —, —</td></tr>
<tr><th>πίπτω fall</th><td class="g">πεσοῦμαι, ἔπεσον, πέπτωκα, —, —</td></tr>
<tr><th>φέρω carry</th><td class="g">οἴσω, ἤνεγκα, —, —, ἠνέχθην</td></tr>
<tr><th>ἀκούω hear</th><td class="g">ἀκούσω, ἤκουσα, ἀκήκοα, —, ἠκούσθην</td></tr>
<tr><th>ἐσθίω eat</th><td class="g">φάγομαι, ἔφαγον, —, —, —</td></tr></table>`},

{t:"Prepositions and their cases",tags:"preposition en eis ek apo dia meta peri hyper hypo epi para kata",
html:`<table><caption>One case</caption>
<tr><th>ἐν</th><td>+ dat</td><td>in, among, by</td></tr>
<tr><th>εἰς</th><td>+ acc</td><td>into, to, for</td></tr>
<tr><th>ἐκ / ἐξ</th><td>+ gen</td><td>out of, from</td></tr>
<tr><th>ἀπό</th><td>+ gen</td><td>from, away from</td></tr>
<tr><th>πρός</th><td>+ acc</td><td>to, toward, with</td></tr>
<tr><th>σύν</th><td>+ dat</td><td>with</td></tr>
<tr><th>πρό</th><td>+ gen</td><td>before</td></tr>
<tr><th>ἀντί</th><td>+ gen</td><td>instead of, for</td></tr></table>
<table><caption>Two cases</caption>
<tr><th>διά</th><td>gen: through · acc: because of</td></tr>
<tr><th>μετά</th><td>gen: with · acc: after</td></tr>
<tr><th>περί</th><td>gen: about, concerning · acc: around</td></tr>
<tr><th>ὑπέρ</th><td>gen: for, on behalf of · acc: above</td></tr>
<tr><th>ὑπό</th><td>gen: by (agent) · acc: under</td></tr>
<tr><th>κατά</th><td>gen: against, down from · acc: according to</td></tr></table>
<table><caption>Three cases</caption>
<tr><th>ἐπί</th><td>gen: on, over · dat: on, at, on the basis of · acc: on, against</td></tr>
<tr><th>παρά</th><td>gen: from (a person) · dat: with, beside · acc: alongside, contrary to</td></tr></table>`},

{t:"Numbers",tags:"one two three heis mia hen numerals",
html:`<table><caption>εἷς, μία, ἕν — one (and its negatives)</caption>
<tr><th></th><th>Masc</th><th>Fem</th><th>Neut</th></tr>
<tr><th>Nom</th><td class="g">εἷς</td><td class="g">μία</td><td class="g">ἕν</td></tr>
<tr><th>Gen</th><td class="g">ἑνός</td><td class="g">μιᾶς</td><td class="g">ἑνός</td></tr>
<tr><th>Dat</th><td class="g">ἑνί</td><td class="g">μιᾷ</td><td class="g">ἑνί</td></tr>
<tr><th>Acc</th><td class="g">ἕνα</td><td class="g">μίαν</td><td class="g">ἕν</td></tr></table>
<p class="muted" style="font-size:.83rem">οὐδείς / μηδείς — no one — decline the same way. δύο (two, dat δυσίν) · τρεῖς, τρία (three) · τέσσαρες, τέσσαρα (four) · πέντε five · ἕξ six · ἑπτά seven · δώδεκα twelve — from πέντε up to a hundred they don't decline; the hundreds and thousands (διακόσιοι, χίλιοι, μύριοι) do. Ordinals: πρῶτος first · δεύτερος second · τρίτος third.</p>`},

];

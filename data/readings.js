/* Extracted from the single-file app. Plain script, no modules — load order in index.html matters. */

/* Reading passages. Greek text from public-domain critical editions
   (Westcott-Hort 1881). Each word: [form, parsing + gloss] */
const READINGS=[
{id:"jn1",ref:"John 1:1-5",note:"The obvious place to start: short clauses, almost no unfamiliar vocabulary, and every word of it worth slowing down for.",
w:[["Ἐν","prep + dat — in"],["ἀρχῇ","dat sg fem of ἀρχή — beginning"],["ἦν","impf act ind 3sg of εἰμί — was"],["ὁ","nom sg masc article"],["λόγος,","nom sg masc — word"],["καὶ","and"],["ὁ",""],["λόγος",""],["ἦν",""],["πρὸς","prep + acc — with, toward"],["τὸν","acc sg masc article"],["θεόν,","acc sg masc — God"],["καὶ",""],["θεὸς","nom sg — God (predicate, no article)"],["ἦν",""],["ὁ",""],["λόγος.","nom sg — the subject, marked by the article"],["οὗτος","nom sg masc demonstrative — this one"],["ἦν",""],["ἐν",""],["ἀρχῇ",""],["πρὸς",""],["τὸν",""],["θεόν.",""],["πάντα","nom pl neut of πᾶς — all things"],["δι'","διά + gen — through"],["αὐτοῦ","gen sg masc — him"],["ἐγένετο,","aor mid ind 3sg of γίνομαι — came into being"],["καὶ",""],["χωρὶς","prep + gen — apart from"],["αὐτοῦ",""],["ἐγένετο",""],["οὐδὲ","and not"],["ἕν","nom sg neut of εἷς — one thing"],["ὃ","nom sg neut relative — which"],["γέγονεν.","pf act ind 3sg of γίνομαι — has come into being"],["ἐν",""],["αὐτῷ","dat sg masc — him"],["ζωὴ","nom sg fem — life"],["ἦν,",""],["καὶ",""],["ἡ","nom sg fem article"],["ζωὴ",""],["ἦν",""],["τὸ","nom sg neut article"],["φῶς","nom sg neut — light"],["τῶν","gen pl article"],["ἀνθρώπων.","gen pl masc — of men"],["καὶ",""],["τὸ",""],["φῶς",""],["ἐν",""],["τῇ","dat sg fem article"],["σκοτίᾳ","dat sg fem — darkness"],["φαίνει,","pres act ind 3sg — shines"],["καὶ",""],["ἡ",""],["σκοτία","nom sg fem — darkness"],["αὐτὸ","acc sg neut — it"],["οὐ","not"],["κατέλαβεν.","aor act ind 3sg of καταλαμβάνω — overcame / grasped"]]},

{id:"jn3",ref:"John 3:16-17",note:"You know it by heart in English, which makes it ideal — you can spend your attention on the grammar rather than the sense. Watch the ἵνα clauses.",
w:[["Οὕτως","adv — thus, in this way"],["γὰρ","for"],["ἠγάπησεν","aor act ind 3sg of ἀγαπάω — loved"],["ὁ",""],["θεὸς","nom sg — God"],["τὸν",""],["κόσμον,","acc sg masc — world"],["ὥστε","conj + ind — so that (result)"],["τὸν",""],["υἱὸν","acc sg masc — son"],["τὸν",""],["μονογενῆ","acc sg masc — only, unique"],["ἔδωκεν,","aor act ind 3sg of δίδωμι — he gave"],["ἵνα","conj + subj — in order that"],["πᾶς","nom sg masc — everyone"],["ὁ",""],["πιστεύων","pres act ptc nom sg masc — the one believing"],["εἰς","prep + acc — into, in"],["αὐτὸν","acc sg masc — him"],["μὴ","not (with subjunctive)"],["ἀπόληται","aor mid subj 3sg of ἀπόλλυμι — should perish"],["ἀλλ'","but"],["ἔχῃ","pres act subj 3sg — should have"],["ζωὴν","acc sg fem — life"],["αἰώνιον.","acc sg fem — eternal"],["οὐ",""],["γὰρ",""],["ἀπέστειλεν","aor act ind 3sg of ἀποστέλλω — sent"],["ὁ",""],["θεὸς",""],["τὸν",""],["υἱὸν",""],["εἰς",""],["τὸν",""],["κόσμον",""],["ἵνα",""],["κρίνῃ","aor act subj 3sg of κρίνω — he might judge"],["τὸν",""],["κόσμον,",""],["ἀλλ'",""],["ἵνα",""],["σωθῇ","aor pass subj 3sg of σῴζω — might be saved"],["ὁ",""],["κόσμος","nom sg — world (subject of passive)"],["δι'",""],["αὐτοῦ.",""]]},

{id:"1jn1",ref:"1 John 1:5-7",note:"John writes the simplest Greek in the New Testament. Note how much work ἐάν plus the subjunctive is doing here.",
w:[["Καὶ",""],["ἔστιν","pres act ind 3sg of εἰμί — is"],["αὕτη","nom sg fem demonstrative — this"],["ἡ",""],["ἀγγελία","nom sg fem — message"],["ἣν","acc sg fem relative — which"],["ἀκηκόαμεν","pf act ind 1pl of ἀκούω — we have heard"],["ἀπ'","ἀπό + gen — from"],["αὐτοῦ",""],["καὶ",""],["ἀναγγέλλομεν","pres act ind 1pl — we announce"],["ὑμῖν,","dat pl — to you"],["ὅτι","that"],["ὁ",""],["θεὸς",""],["φῶς",""],["ἐστιν",""],["καὶ",""],["σκοτία",""],["ἐν",""],["αὐτῷ",""],["οὐκ",""],["ἔστιν",""],["οὐδεμία.","nom sg fem — none at all"],["Ἐὰν","conj + subj — if"],["εἴπωμεν","aor act subj 1pl of λέγω — we should say"],["ὅτι",""],["κοινωνίαν","acc sg fem — fellowship"],["ἔχομεν","pres act ind 1pl — we have"],["μετ'","μετά + gen — with"],["αὐτοῦ",""],["καὶ",""],["ἐν",""],["τῷ","dat sg neut article"],["σκότει","dat sg neut — darkness"],["περιπατῶμεν,","pres act subj 1pl — we walk"],["ψευδόμεθα","pres mid ind 1pl — we lie"],["καὶ",""],["οὐ",""],["ποιοῦμεν","pres act ind 1pl — we do"],["τὴν","acc sg fem article"],["ἀλήθειαν·","acc sg fem — truth"],["ἐὰν",""],["δὲ","but"],["ἐν",""],["τῷ",""],["φωτὶ","dat sg neut of φῶς — light"],["περιπατῶμεν",""],["ὡς","as"],["αὐτός","nom sg masc — he himself"],["ἐστιν",""],["ἐν",""],["τῷ",""],["φωτί,",""],["κοινωνίαν",""],["ἔχομεν",""],["μετ'",""],["ἀλλήλων","gen pl — one another"],["καὶ",""],["τὸ",""],["αἷμα","nom sg neut — blood"],["Ἰησοῦ","gen sg — of Jesus"],["τοῦ","gen sg masc article"],["υἱοῦ","gen sg masc — son"],["αὐτοῦ",""],["καθαρίζει","pres act ind 3sg — cleanses"],["ἡμᾶς","acc pl — us"],["ἀπὸ",""],["πάσης","gen sg fem of πᾶς — all"],["ἁμαρτίας.","gen sg fem — sin"]]},

{id:"mk1",ref:"Mark 1:1-3",note:"Narrative Greek, and a stack of genitives in the opening line worth untangling slowly.",
w:[["Ἀρχὴ","nom sg fem — beginning"],["τοῦ",""],["εὐαγγελίου","gen sg neut — of the gospel"],["Ἰησοῦ","gen sg — of Jesus"],["Χριστοῦ","gen sg — Christ"],["υἱοῦ","gen sg — son"],["θεοῦ.","gen sg — of God"],["Καθὼς","just as"],["γέγραπται","pf pass ind 3sg of γράφω — it stands written"],["ἐν",""],["τῷ",""],["Ἠσαΐᾳ","dat sg — Isaiah"],["τῷ",""],["προφήτῃ·","dat sg masc — prophet"],["Ἰδοὺ","behold!"],["ἀποστέλλω","pres act ind 1sg — I send"],["τὸν",""],["ἄγγελόν","acc sg masc — messenger"],["μου","gen sg — my"],["πρὸ","prep + gen — before"],["προσώπου","gen sg neut — face"],["σου,","gen sg — your"],["ὃς","nom sg masc relative — who"],["κατασκευάσει","fut act ind 3sg — will prepare"],["τὴν",""],["ὁδόν","acc sg fem — way, road"],["σου·",""],["φωνὴ","nom sg fem — voice"],["βοῶντος","pres act ptc gen sg masc — of one crying"],["ἐν",""],["τῇ",""],["ἐρήμῳ·","dat sg fem — wilderness"],["Ἑτοιμάσατε","aor act impv 2pl — prepare!"],["τὴν",""],["ὁδὸν",""],["κυρίου,","gen sg — of the Lord"],["εὐθείας","acc pl fem — straight"],["ποιεῖτε","pres act impv 2pl — make"],["τὰς","acc pl fem article"],["τρίβους","acc pl fem — paths"],["αὐτοῦ.",""]]}
];

const BADGES=[
{id:"first",e:"🌱",t:"First light",d:"Finish one review session"},
{id:"streak7",e:"🔥",t:"Seven days",d:"A week without missing"},
{id:"streak30",e:"⛰️",t:"Thirty days",d:"A month without missing"},
{id:"w50",e:"📖",t:"Fifty words",d:"50 words known"},
{id:"w150",e:"📚",t:"Half the text",d:"150 words known"},
{id:"alpha",e:"Α",t:"Alphabet",d:"Pass the alphabet test"},
{id:"l8",e:"🏛️",t:"Halfway",d:"Finish 8 lessons"},
{id:"l16",e:"🎓",t:"All sixteen",d:"Finish every lesson"},
{id:"read",e:"🔍",t:"First reading",d:"Open a passage"}
];

/* Fallback glosses for high-frequency forms that recur across passages.
   Keys are normalised through norm() at startup so accent shifts still match. */
const GLOSSARY_RAW={
"ὁ":"nom sg masc article — the","ἡ":"nom sg fem article — the","τό":"nom/acc sg neut article — the",
"τοῦ":"gen sg masc/neut article","τῆς":"gen sg fem article","τῷ":"dat sg masc/neut article",
"τῇ":"dat sg fem article","τόν":"acc sg masc article","τήν":"acc sg fem article",
"οἱ":"nom pl masc article","αἱ":"nom pl fem article","τά":"nom/acc pl neut article",
"τῶν":"gen pl article (all genders)","τοῖς":"dat pl masc/neut article","ταῖς":"dat pl fem article",
"τούς":"acc pl masc article","τάς":"acc pl fem article",
"καί":"and, also, even","δέ":"but, and, now","γάρ":"for, because","οὖν":"therefore, then",
"ἀλλά":"but, rather","ἀλλ":"but, rather","ὅτι":"that, because","ἵνα":"in order that (+subj)",
"οὐ":"not","οὐκ":"not","οὐχ":"not","μή":"not (with non-indicative)","ὡς":"as, like, when",
"ἐν":"prep + dat — in, on, among","εἰς":"prep + acc — into, to","ἐκ":"prep + gen — out of",
"ἀπό":"prep + gen — from","ἀπ":"prep + gen — from","πρός":"prep + acc — to, toward",
"διά":"+gen through; +acc because of","δι":"+gen through; +acc because of",
"μετά":"+gen with; +acc after","μετ":"+gen with; +acc after","κατά":"+gen against; +acc according to",
"περί":"+gen concerning; +acc around","ὑπό":"+gen by; +acc under","ὑπέρ":"+gen on behalf of",
"ἐστίν":"pres act ind 3sg of εἰμί — is","ἐστιν":"pres act ind 3sg of εἰμί — is",
"ἦν":"impf act ind 3sg of εἰμί — was","εἰσίν":"pres act ind 3pl of εἰμί — are",
"θεός":"nom sg — God","θεοῦ":"gen sg — of God","θεόν":"acc sg — God","θεῷ":"dat sg — to God",
"αὐτοῦ":"gen sg masc/neut — his, of him","αὐτῷ":"dat sg masc/neut — to him",
"αὐτόν":"acc sg masc — him","αὐτός":"nom sg masc — he himself","αὐτό":"nom/acc sg neut — it",
"λόγος":"nom sg masc — word","λόγου":"gen sg — of the word","λόγον":"acc sg — word",
"κόσμος":"nom sg masc — world","κόσμον":"acc sg masc — world","κόσμῳ":"dat sg — in the world",
"υἱός":"nom sg masc — son","υἱόν":"acc sg masc — son","υἱοῦ":"gen sg masc — of the son",
"φῶς":"nom/acc sg neut — light","φωτί":"dat sg neut — in the light",
"ζωή":"nom sg fem — life","ζωήν":"acc sg fem — life",
"ἀρχῇ":"dat sg fem — in the beginning","ἀρχή":"nom sg fem — beginning",
"ἐγένετο":"aor mid ind 3sg of γίνομαι — came into being",
"σκοτία":"nom sg fem — darkness","σκοτίᾳ":"dat sg fem — in the darkness",
"ἔχομεν":"pres act ind 1pl — we have","κοινωνίαν":"acc sg fem — fellowship",
"περιπατῶμεν":"pres act subj 1pl — we walk","ἐάν":"if (+subj)","Ἐάν":"if (+subj)",
"ὁδόν":"acc sg fem — way, road","ὁδὸν":"acc sg fem — way, road"
};
const GLOSSARY={};

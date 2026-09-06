/* How Greek words are compared — the one place, and a ladder of three rungs.

   Comparing two Greek words is not string equality. τόν and τὸν are the same
   word: Greek shifts an acute to a grave before a following word, so the
   difference is positional rather than lexical. But μένει and μενεῖ are two
   different words, and chapter 19 exists to say so. Where you draw that line
   depends on what you are asking, and this file draws it three times.

       gkKey     grave folds to acute, nothing else moves.
                 The corpus's own equivalence: two words match only if they
                 are the same form. Use it to IDENTIFY a word.

       gkPlain   the above, minus the accents.
                 Breathings, iota subscript and diaeresis are kept, because
                 they distinguish real words — ὁ against ὅ, αὐταί against
                 αὗται. Use it where the accent is not the point.

       gkLoose   letters only. Every mark gone.
                 Use it for a search box, where somebody is typing what they
                 half-remember. Never use it to decide whether an answer is
                 right: it cannot tell εἰς from εἷς.

   Each rung is strictly coarser than the one above, so anything the strict
   test calls equal the looser ones do too. tools/check_greek_norm.py proves
   that over every word in the New Testament, proves each is idempotent, and
   proves these agree with the Python ladder in tools/corpus.py — which is
   the one that matters, because the checkers verify content with Python and
   the app grades answers with this file. If they drift, a form a checker has
   passed could be marked wrong in front of a learner.

   WHY IT IS ONE FILE. It was four. app.js defined an accent-stripper that
   kept breathings, and a second one forty lines further down that did not;
   gnt.js defined a third identical to the second and a fourth of its own;
   grid.js had a fifth for stripping non-Greek. Nothing compared them, and
   two of the five were the same function written twice. Typed answers need
   one documented ladder or grading will differ by drill, so: this file, and
   a checker that fails if any other file starts normalising on its own. */

/* Greek letters, and only Greek letters. Strips punctuation, Latin, digits,
   spaces — everything that is not in the two Greek blocks. */
const gkOnly = s => (s || "").replace(/[^Ͱ-Ͽἀ-῿]/g, "");

/* Rung 1. Identify a word. Grave folds to acute and nothing else moves. */
const gkKey = s => (s || "").normalize("NFD")
  .replace(/̀/g, "́")
  .normalize("NFC").toLowerCase();

/* Rung 2. The accent is not the point. Acute, grave and circumflex go;
   breathing (̓ ̔), iota subscript (ͅ) and diaeresis (̈)
   stay, because those are the difference between one word and another. */
const gkPlain = s => (s || "").normalize("NFD")
  .replace(/[̀́͂]/g, "")
  .normalize("NFC").toLowerCase();

/* Rung 3. Letters only. ̀-ͯ is the whole combining-diacritical
   block, so this takes the breathings too. A search box wants this; a mark
   scheme does not. */
const gkLoose = s => (s || "").normalize("NFD")
  .replace(/[̀-ͯ]/g, "")
  .normalize("NFC").toLowerCase();

/* Punctuation the New Testament text carries, including the Greek question
   mark and the ano teleia, which are not the Latin ones they look like. */
const gkPunct = /[.,;·:!?()··’'‘]/g;

/* A quoted phrase, ready to compare: punctuation gone, accents gone. This is
   what the reader uses to line a lesson's quotation up with the text. */
const gkPhrase = s => gkPlain((s || "").replace(gkPunct, "").trim());


/* ---------------------------------------------------------------------
   Latin to Greek, for people typing on a phone.

   Searching by Greek assumes a Greek keyboard, which a phone does not have
   by default, so every headword also gets a loose Latin key. Deliberately
   lossy: it exists to match what somebody types, not to be a scholarly
   transliteration. It lives here rather than in app.js because it is the
   same question the ladder answers — are these two the same word — and
   because a typed-answer keyboard will want the mapping too.
   --------------------------------------------------------------------- */
const LK_GK={"α":"a","β":"b","γ":"g","δ":"d","ε":"e","ζ":"z","η":"e","θ":"th",
 "ι":"i","κ":"k","λ":"l","μ":"m","ν":"n","ξ":"x","ο":"o","π":"p","ρ":"r",
 "σ":"s","ς":"s","τ":"t","υ":"u","φ":"f","χ":"kh","ψ":"ps","ω":"o"};

function lkLatin(greek){
  const d=greek.normalize("NFD");
  let out="";
  for(let k=0;k<d.length;k++){
    const ch=d[k];
    if(ch==="\u0314"){ out="h"+out; continue; }       // rough breathing -> leading h
    if(/[\u0300-\u036f]/.test(ch)) continue;          // other marks: ignore
    out += LK_GK[ch.toLowerCase()] ?? (/[a-z]/i.test(ch) ? ch.toLowerCase() : "");
  }
  return out;
}

/* Fold a Latin query into the same shape: ph=f, ch=kh, c=k, y=u, v=b. */
function lkFoldLatin(q){
  return q.toLowerCase()
    .replace(/[\u0304\u0301\u0300]/g,"")
    .replace(/ph/g,"f").replace(/ch/g,"kh").replace(/ck/g,"k")
    .replace(/c/g,"k").replace(/q/g,"k").replace(/j/g,"i")
    .replace(/y/g,"u").replace(/v/g,"b")
    .replace(/[ēê]/g,"e").replace(/[ōô]/g,"o");
}

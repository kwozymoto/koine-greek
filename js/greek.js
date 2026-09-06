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


/* ---------------------------------------------------------------------
   Marking what somebody typed.

   The obvious rule is a similarity percentage — "over 60% right, tell them
   where they slipped; under it, show the answer". Measured against the New
   Testament, that rule does not work, and it is worth writing down why so
   nobody puts it back.

   A single slip is worth a different percentage on every length of word:
   0.33 on λύω, 0.92 on a twelve-letter compound. At a flat 60% a long word
   tolerates four wrong letters before it stops saying "close".

   Worse, Greek is crowded. Take any form occurring five times or more and
   the nearest DIFFERENT attested form is usually 0.80 to 0.90 similar. At
   length five, one slip scores 0.80 and 61 of 63 words have a real
   neighbour at least that close. The two distributions — "knew it and
   slipped" and "wrote another word entirely" — sit on top of each other, so
   no threshold on similarity separates them.

   What does separate them is the count of edits, which does not care how
   long the word is, together with the one test a generic app cannot make
   and this one can: is the attempt as close to some OTHER form in front of
   the learner? If it is, they have not nearly got it. They have written
   something else, and the useful thing to say is which.

   Six verdicts, and each rung of the ladder earns its place:

     correct    right to the accent
     accent     letters and breathings right, accent adrift. Still right:
                the accent is not what most drills are asking.
     breathing  letters right, breathing wrong — εἰς for εἷς is a different
                word, so this is an error and not a slip
     other      what they typed is one of the other forms on offer
     close      within the edit budget: flag the letters, offer another go
     wrong      show it, and ask for it once more
   --------------------------------------------------------------------- */

/* Two edits is a slip on a long word and a different word on a short one.
   The table in tools/check_mark.py settled where the line goes: ἐλάβομεν is
   exactly two edits from ἔλαβεν, and those are two real cells of the same
   verb, not a near-miss. So six letters or fewer get a budget of one. */
const gkEditBudget = t => (t.length <= 6 ? 1 : 2);

/* Levenshtein, on letters only, so a letter and its accent are one unit
   rather than two codepoints pretending to be two mistakes. */
function gkEdits(a, b) {
  a = gkLoose(a); b = gkLoose(b);
  if (a === b) return 0;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++)
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1,
                        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}

/* Which letters to mark. Positions in the TYPED string that do not survive
   into the target, aligned so an inserted or dropped letter shifts the rest
   rather than reporting every letter after it as wrong. */
function gkDiff(typed, target) {
  const a = gkLoose(typed), b = gkLoose(target), out = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (gkEdits(a.slice(i + 1), b.slice(j)) < gkEdits(a.slice(i), b.slice(j + 1)))
      { out.push(i); i++; }                       // extra letter typed
    else if (gkEdits(a.slice(i), b.slice(j + 1)) < gkEdits(a.slice(i + 1), b.slice(j + 1)))
      { j++; }                                    // letter missing
    else { out.push(i); i++; j++; }               // wrong letter
  }
  while (i < a.length) out.push(i++);
  return out;
}

/* others: the rest of the forms on offer in this round, so "you wrote the
   perfect" can be said instead of "close". */
function gkMark(typed, target, others) {
  const t = (typed || "").trim();
  const r = { typed: t, target, edits: gkEdits(t, target), wrong: [] };
  if (!t) return Object.assign(r, { verdict: "wrong" });
  if (gkKey(t) === gkKey(target))     return Object.assign(r, { verdict: "correct" });
  if (gkPlain(t) === gkPlain(target)) return Object.assign(r, { verdict: "accent" });
  if (gkLoose(t) === gkLoose(target)) return Object.assign(r, { verdict: "breathing" });
  const hit = (others || []).find(o => gkLoose(o) === gkLoose(t));
  if (hit) return Object.assign(r, { verdict: "other", wrote: hit });
  if (r.edits <= gkEditBudget(gkLoose(target)))
    return Object.assign(r, { verdict: "close", wrong: gkDiff(t, target) });
  return Object.assign(r, { verdict: "wrong" });
}

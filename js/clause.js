/* ============================================================
   READ A SENTENCE
   ============================================================
   The app could parse a word and fill in a paradigm, and had nothing that
   asked what a sentence was doing. Tapping a word in Read gives you its
   gloss; it never asks you for anything, so it is possible to tap every word
   on a page, feel busy, and not have read it.

   These questions are generated from the corpus by tools/build_clauses.py
   and marked by MorphGNT's own parse codes, so nothing here is an opinion:

     verb  tap the main verb            220
     gen   tap the word in the genitive  70
     dat   tap the word in the dative    59
     subj  tap the subject              100
     who   who is doing it — the subject is in the ending, not on the page

   The last two are a pair, and the numbers are the lesson. Only about two
   hundred verses in the whole New Testament have a subject a parse code can
   settle, because Greek marks the subject in the verb ending and an explicit
   nominative is optional. So "where is the subject?" is usually answered by
   the verb, and the drill says so with a hundred verses where there is one
   and a hundred and eighty-seven where there is not.

   Loaded after js/grid.js and before js/app.js. Everything it uses from
   there — S, mcq, answerFelt, addXp, gntParse — is called, never read while
   this file is being evaluated. */

/* Verses made of words you have met, and from the passage you are focused
   on when there is one. Same shape as realFormPool(): prefer, then fall
   back, so the drill works on a cold install rather than refusing to run. */
function clausePool() {
  if (typeof CLAUSES === "undefined") return [];
  const f = S.focus;
  if (f) {
    const hit = CLAUSES.filter(r => r[1] === f.a && r[2] === f.ch
      && (!f.lo || (r[3] >= f.lo && r[3] <= f.hi)));
    if (hit.length >= 4) return hit;
  }
  // every deck word in the verse is one you have started
  const met = CLAUSES.filter(r => r[9].every(i => S.cards[i] && !skipWord(i)));
  if (met.length >= 8) return met;
  // most of them, then — and failing that, the ones built from the commonest
  const some = CLAUSES.filter(r =>
    r[9].filter(i => S.cards[i]).length >= Math.ceil(r[9].length * 0.6));
  return some.length >= 8 ? some : CLAUSES;
}

const CLAUSE_ASK = {
  verb: "Tap the main verb — the one carrying a person and a number.",
  gen: "Tap the word in the genitive.",
  dat: "Tap the word in the dative.",
  subj: "Tap the subject.",
};
/* Person and number, as a reader would say it rather than as a paradigm
   labels it. The code's first character is the person and its sixth is the
   number, so these are read straight off it. */
const CLAUSE_WHO = {
  "1S": "I", "1P": "we",
  "2S": "you — one person", "2P": "you — more than one",
  "3S": "he, she or it", "3P": "they",
};

function clauseQ(r) {
  const [ref, abbr, ch, vn, text, kind, at, pos, code] = r;
  const words = text.split(" ");
  const head = `<p class="muted" style="font-size:.78rem;margin:0 0 6px">${ref}</p>`;

  if (kind === "who") {
    /* The verb is given, because the question is not which word it is — it
       is what its ending tells you about a subject that is not written. */
    const line = words.map((w, i) =>
      i === at ? `<b class="gk lit">${w}</b>` : `<span class="gk">${w}</span>`).join(" ");
    const want = code[0] + code[5];
    const opts = Object.keys(CLAUSE_WHO)
      .filter(k => k === want || k[1] === want[1] || k[0] === want[0])
      .sort(() => Math.random() - .5).slice(0, 4);
    if (!opts.includes(want)) opts[0] = want;
    const shown = opts.sort(() => Math.random() - .5).map(k => CLAUSE_WHO[k]);
    return mcq(
      `${head}<div class="clause">${line}</div>
       <p style="margin:10px 0 0;font-size:.95rem">Nothing here is in the nominative.
         Who is doing <span class="gk">${words[at]}</span>?</p>`,
      shown, shown.indexOf(CLAUSE_WHO[want]),
      `<span class="gk">${words[at]}</span> — ${gntParse(pos, code)}.
       The subject is in the ending; Greek only writes one out when it wants to.`);
  }

  return () => {
    const body = document.getElementById("sessBody");
    body.innerHTML = `${head}
      <div class="card"><div class="passage clause" id="cl">${
        words.map((w, i) => `<w data-i="${i}">${w}</w>`).join(" ")}</div></div>
      <p class="pgnow" id="clAsk">${CLAUSE_ASK[kind]}</p>
      <div id="fb"></div>`;
    const psg = document.getElementById("cl");
    psg.onclick = e => {
      if (e.target.tagName !== "W") return;
      const i = +e.target.dataset.i;
      const ok = i === at;
      psg.onclick = null;
      psg.querySelectorAll("w").forEach(x => {
        if (+x.dataset.i === at) x.classList.add("right");
        else if (+x.dataset.i === i) x.classList.add("wrong");
      });
      document.getElementById("clAsk").textContent = "";
      answerFelt(ok, ok ? e.target : null);
      if (ok) { addXp(3); SESSION_XP += 3; }
      document.getElementById("fb").innerHTML =
        `<div class="feedback"><b>${ok ? "Correct" : "Not quite"}</b>
          <span class="gk">${words[at]}</span> — ${gntParse(pos, code)}.<br>
          <span class="muted">${clauseWhy(r)}</span></div>
         <button class="btn" onclick="qi++;step()">Continue</button>`;
    };
  };
}

/* The line under the answer. Every claim here is read off the corpus's own
   codes for this verse — nothing is asserted that the row has not carried. */
function clauseWhy(r) {
  const [, , , , text, kind, at, pos, code] = r;
  const w = text.split(" ")[at];
  if (kind === "verb")
    return "A participle or an infinitive is a verb too, but only a finite verb "
      + "carries a person, and only a finite verb can head the sentence.";
  if (kind === "gen")
    return "The genitive is the of-case: possession, source, the whole a part "
      + "comes from — the ending narrows it, the sentence decides.";
  if (kind === "dat")
    return "The dative covers the indirect object, means, sphere and time. "
      + "Which one is a reading decision; that it is dative is not.";
  if (kind === "subj")
    return `Nominative, and it agrees with the verb in number — which is what `
      + `makes it the subject rather than a predicate or an apposition.`;
  return "";
}

function clauseDrill(n = 6) {
  const pool = clausePool().slice().sort(() => Math.random() - .5);
  // one question per verse in a sitting: the same sentence twice running
  // gives away the second answer and reads as a bug
  const seen = new Set(), out = [];
  for (const r of pool) {
    const v = `${r[1]}${r[2]}:${r[3]}`;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(clauseQ(r));
    if (out.length >= n) break;
  }
  return out;
}

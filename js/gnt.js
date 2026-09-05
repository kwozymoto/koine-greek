/* The whole Greek New Testament, tap-to-parse.

   Books load one at a time (largest is 621KB) rather than all 4.4MB up
   front. The service worker pre-caches the whole set in the background from
   data/offline.json, so this works offline without being asked; Settings →
   Offline → Check tops up anything that failed.

   Data shape (built by scratchpad/build_gnt.py from MorphGNT/SBLGNT):
     manifest.json  {lemmas[], gloss[], pos[], books[{a,t,n[],ch[]}]}
     <Abbr>.json    {a,t,n:[chapterNo], c:[ chapter[ [verseNo, words] ] ]}
     word           [text, lemmaIdx, posIdx, parseCode]
   Chapter and verse numbers are stored, never inferred from array position.

   Every word gets a full parse; about 85% also carry a gloss, drawn from
   the course vocabulary by tools/build_gloss_map.py. The rest show their
   parse and lemma, which is the part you cannot work out for yourself.

   A lemma is glossed only when the deck actually teaches that lemma. The
   first version of the table matched on a prefix, which is why ἀξίνη (an
   axe) once read "worthy" and τρέφω (I feed) read "three". */

let GNT = null;                 // manifest, once loaded
const gntBooks = {};            // abbr -> book json
/* Where the reader last was lives in S.where, so it survives a restart and
   the Read tab can offer to continue. The chapter opener writes it. */

const GNT_TENSE = {P:"present",I:"imperfect",F:"future",A:"aorist",X:"perfect",Y:"pluperfect"};
const GNT_VOICE = {A:"active",M:"middle",P:"passive"};
const GNT_MOOD  = {I:"indicative",D:"imperative",S:"subjunctive",O:"optative",N:"infinitive",P:"participle"};
const GNT_CASE  = {N:"nominative",G:"genitive",D:"dative",A:"accusative",V:"vocative"};
const GNT_NUM   = {S:"singular",P:"plural"};
const GNT_GEND  = {M:"masculine",F:"feminine",N:"neuter"};
const GNT_DEG   = {C:"comparative",S:"superlative"};
/* The code holds a bare digit. It read "3 singular", which was tolerable in
   the reader's gloss bar and is not now that every vocabulary card carries a
   parse under its example verse. */
const GNT_PERS  = {"1":"1st","2":"2nd","3":"3rd"};
const GNT_POS   = {"N-":"noun","V-":"verb","A-":"adjective","D-":"adverb","C-":"conjunction",
                   "P-":"preposition","RA":"article","RD":"demonstrative","RP":"pronoun",
                   "RR":"relative","RI":"interrogative/indefinite","X-":"particle","I-":"interjection"};

/* What a word means, and who says so.

   Three sources, in this order, and the order is the whole point:

     1. the deck's own gloss, for the 509 words this course teaches. Written
        and checked by hand against the corpus, and better than either
        lexicon — "but, and, now" for δέ where the lexicon says "then".
     2. anything you have typed yourself, which beats a shipped gloss for a
        word you have actually studied.
     3. data/lexicon.js — 4,832 glosses from Tyndale House's brief lexicon
        (which carries Abbott-Smith) and Dodson's, for everything else.

   The dagger marks the third case. A terser, older gloss is worth having and
   worth knowing about; what it must not do is pass for the course's own. */
function glossFor(lemma, deckGloss) {
  /* Yours first, and ahead of the deck's — the promise the pencil makes is
     that your wording wins everywhere, and a word can be promoted into the
     course after you have already written a better gloss for it. */
  const mine = (S.myGloss || {})[lemma];
  if (mine) return { text: mine, from: "your own wording" };
  if (deckGloss) return { text: deckGloss, from: "" };
  const lex = (typeof LEX !== "undefined") && LEX[lemma];
  return lex
    ? { text: lex, from: "Tyndale House / Abbott-Smith — not this course's own gloss" }
    : { text: "", from: "" };
}

function gntParse(pos, code) {
  // Eight characters, not seven: the last is degree. Without it μείζων
  // ("greater") rendered as plain "adjective · μέγας — great".
  const [person, tense, voice, mood, cse, num, gend, deg] = code;
  const bits = x => x.filter(Boolean).join(" ");
  if (pos === "RA") return bits([GNT_CASE[cse], GNT_NUM[num], GNT_GEND[gend]]) + " article";
  if (pos === "V-") {
    if (mood === "P") return bits([GNT_TENSE[tense], GNT_VOICE[voice], "participle,",
                                   GNT_CASE[cse], GNT_NUM[num], GNT_GEND[gend]]);
    if (mood === "N") return bits([GNT_TENSE[tense], GNT_VOICE[voice], "infinitive"]);
    return bits([GNT_TENSE[tense], GNT_VOICE[voice], GNT_MOOD[mood],
                 person && num ? (GNT_PERS[person] || person)
                                 + (num === "S" ? " singular" : " plural") : ""]);
  }
  if (["N-","A-","RD","RP","RR","RI"].includes(pos)) {
    const b = bits([GNT_CASE[cse], GNT_NUM[num], GNT_GEND[gend]]);
    const tail = [GNT_DEG[deg], GNT_POS[pos]].filter(Boolean).join(" ");
    return b ? b + " " + tail : tail;
  }
  return GNT_POS[pos] || "";
}

async function gntLoad() {
  if (GNT) return GNT;
  const r = await fetch("data/gnt/manifest.json");
  if (!r.ok) throw new Error("manifest");
  GNT = await r.json();
  return GNT;
}
async function gntBook(abbr) {
  if (gntBooks[abbr]) return gntBooks[abbr];
  const r = await fetch("data/gnt/" + abbr + ".json");
  if (!r.ok) throw new Error(abbr);
  gntBooks[abbr] = await r.json();
  return gntBooks[abbr];
}

/* ---------- sermon preparation ----------
   Saturday in your sermon text is the most valuable thing you can do with
   this app, and the reader knew nothing about it: it forgot the passage the
   moment you closed it, none of its vocabulary reached the schedule, and
   there was no way to see which words in it you don't have.

   Matching a corpus lemma to a course word keeps the breathing and the
   accent. Stripping them is what a search box should do, but not this: it
   merged \u03c4\u03b9\u03c2 "someone" into \u03c4\u03af\u03c2 "who?" and \u03b5\u1f37\u03c2 "one" into \u03b5\u1f30\u03c2 "into", so the
   reader reported 342 occurrences of "one" as the preposition. Eleven lemmas
   and about a thousand words were landing on the wrong entry. Grave folds to
   acute, because that shift is positional rather than lexical. */
let gntCur = null;                        // {abbr, ch, meta, verses}
/* Accent-blind and breathing-blind: right for a search box, wrong for
   identifying a word \u2014 see gntKey. */
const gntBare = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const gntKey  = s => s.normalize("NFD").replace(/\u0300/g, "\u0301")
                      .normalize("NFC").toLowerCase();

/* Five headwords a lexicon cites one way and MorphGNT lemmatises another.
   The same five are in tools/check_vocab.py, tools/build_gloss_map.py and
   tools/build_examples.py; check_vocab fails if they drift apart. */
const GNT_CITATION = { "\u03c4\u03ad": "\u03c4\u03b5", "\u03bf\u1f55\u03c4\u03c9(\u03c2)": "\u03bf\u1f55\u03c4\u03c9\u03c2", "\u03b4\u03ad\u03c9": "\u03b4\u03b5\u1fd6",
                       "\u1f31\u03b5\u03c1\u03cc\u03c2": "\u1f31\u03b5\u03c1\u03cc\u03bd", "\u1f10\u03bb\u03b5\u03ac\u03c9": "\u1f10\u03bb\u03b5\u03ad\u03c9" };

let VOC_BY_LEMMA = null;
function vocIndexFor(lemma) {
  if (!VOC_BY_LEMMA) {
    VOC_BY_LEMMA = {};
    // Frequency order, so the first claim on a form is the commonest.
    VOCAB.forEach((v, i) => {
      const k = gntKey(v[0].split(",")[0].trim());
      if (!(k in VOC_BY_LEMMA)) VOC_BY_LEMMA[k] = i;
    });
  }
  const raw = lemma || "";
  const i = VOC_BY_LEMMA[gntKey(GNT_CITATION[raw] || raw)];
  return (i === undefined || skipWord(i)) ? -1 : i;
}

/* How much of this chapter you can actually read.

   Counted by *different* words, not by occurrences. Counting occurrences
   flatters you badly: twenty words is 48% of Luke 21, because ὁ and καί
   repeat enough to carry it between them — while 119 of the words that
   carry the meaning are still unknown. The distinct count is the one that
   answers "can I read this on Saturday".

   The share of the page is still reported, because it is a real thing to
   know, but it is not the headline. And the words the course does not teach
   at all are counted separately: no amount of study here will reach them,
   and pretending otherwise sets a ceiling you cannot see. */
function gntCoverage(verses) {
  const seen = new Map();                  // lemma index -> VOCAB index or -1
  let tokens = 0, tokensKnown = 0;
  verses.forEach(v => v[1].forEach(w => {
    tokens++;
    if (!seen.has(w[1])) seen.set(w[1], vocIndexFor(GNT.lemmas[w[1]]));
    const i = seen.get(w[1]);
    if (i >= 0 && S.cards[i]) tokensKnown++;
  }));
  let started = 0, inCourse = 0;
  seen.forEach(i => { if (i >= 0) { inCourse++; if (S.cards[i]) started++; } });
  const distinct = seen.size;
  return { distinct, started, toLearn: inCourse - started, outside: distinct - inCourse,
           pagePct: tokens ? Math.round(100 * tokensKnown / tokens) : 0 };
}

/* Course words in this chapter you have never met, or keep losing. */
function gntUnknown() {
  if (!gntCur) return [];
  const n = new Map();
  gntCur.verses.forEach(v => v[1].forEach(w => {
    const i = vocIndexFor(GNT.lemmas[w[1]]);
    if (i < 0) return;
    const c = S.cards[i];
    if (!c || (c.lapses || 0) > 3) n.set(i, (n.get(i) || 0) + 1);
  }));
  return [...n.entries()].sort((a, b) => b[1] - a[1] || VOCAB[b[0]][2] - VOCAB[a[0]][2]);
}

function addToDeck(i, btn) {
  card(i); S.cards[i].due = today(); save();
  paintLit();                    // the word you just added stops being faint
  if (btn) { btn.textContent = "Added"; btn.disabled = true; }
  else toast(VOCAB[i][0].split(",")[0] + " added to your deck");
}
/* A chapter of Mark holds 130 course words, and on a young deck you have met
   almost none of them — a list that long is a wall, not a help, and adding
   all of it would bury a week of reviews. Thirty at a time; tap again and
   the next thirty appear. */
const UNKNOWN_SHOWN = 30;
function addAllUnknown() {
  const list = gntUnknown().slice(0, UNKNOWN_SHOWN);
  if (!list.length) return;
  list.forEach(([i]) => { card(i); S.cards[i].due = today(); });
  save();
  toast(list.length + " words added — they are in today's review");
  showGntUnknown();
}

function showGntUnknown() {
  const box = document.getElementById("gntTools");
  if (!box || !gntCur) return;
  const all = gntUnknown(), list = all.slice(0, UNKNOWN_SHOWN);
  if (!all.length) {
    box.innerHTML = `<div class="card"><p class="muted" style="margin:0;font-size:.86rem">
      Every course word in this chapter is already in your schedule.</p></div>`;
    return;
  }
  box.innerHTML = `<div class="card">
    <h3 style="margin-top:0">Words here you don't have</h3>
    <p class="muted" style="font-size:.84rem;margin-bottom:4px">${all.length} of the ${LEARN_ORDER.length} course words
      ${all.length > UNKNOWN_SHOWN ? `— the ${UNKNOWN_SHOWN} commonest in this chapter are below` : "in this chapter"}.
      Adding one puts it in today's review.</p>
    ${list.map(([i, k]) => `<div class="setrow">
      <span><b class="gk" style="font-weight:500;font-size:1.05rem">${VOCAB[i][0].split(",")[0]}</b>
        <br><small class="muted">${VOCAB[i][1]} · ${k}\u00d7 here</small></span>
      <button class="btn ghost small" onclick="addToDeck(${i},this)">Add</button></div>`).join("")}
    <button class="btn ghost small" style="margin-top:12px;width:100%"
            onclick="addAllUnknown()">Add ${all.length > UNKNOWN_SHOWN ? `these ${list.length}` : `all ${list.length}`} to my deck</button></div>`;
}

/* Pin the week's passage so Today can offer it. */
const gntPinned = () => !!(gntCur && S.pin && S.pin.a === gntCur.abbr && S.pin.ch === gntCur.ch);
const gntFocused = () => !!(gntCur && S.focus && S.focus.a === gntCur.abbr
                            && S.focus.ch === gntCur.ch);
function paintGntTools() {
  const b = document.getElementById("btnPin");
  if (b) b.textContent = gntPinned() ? "\uD83D\uDCCC Pinned for this week" : "\uD83D\uDCCC Pin for this week";
  const f = document.getElementById("btnFocus");
  if (f) f.textContent = gntFocused() ? "\u25C9 Focused" : "\u25CE Focus on this";
}

/* Pinning says "this is the week's passage"; focusing says "point the whole
   deck at it". Whole chapter or a verse range, because a sermon text is
   Philippians 2:5-11 far more often than it is all of Philippians 2 \u2014 seven
   verses against thirty is a different amount of work.

   Two number inputs rather than a tap-to-select: the range is a fact you
   already know when you arrive, and there is no new screen to learn. */
function askFocus() {
  if (!gntCur) return;
  if (gntFocused()) { go("today"); return; }
  const first = gntCur.verses[0][0];
  const last = gntCur.verses[gntCur.verses.length - 1][0];
  const box = document.getElementById("gntTools");
  box.innerHTML = `<div class="card" style="border-color:var(--gold-dim)">
    <h3 style="margin-top:0">Focus on this passage</h3>
    <p class="muted" style="font-size:.84rem;margin-bottom:12px">Today's review and new
      words come from here alone until you mark it complete. Everything else \u2014 your
      streak, your XP, the schedule \u2014 carries on as normal.</p>
    <div class="setrow"><span>Whole chapter</span>
      <button class="btn ghost small" onclick="setFocus(0,0);go('today')">${gntCur.meta.t} ${
        gntCur.meta.n ? gntCur.meta.n[gntCur.ch] : gntCur.ch + 1}</button></div>
    <div class="setrow"><span>Verses</span><span>
      <input id="fLo" type="number" min="${first}" max="${last}" value="${first}"
             inputmode="numeric" style="width:62px">
      <span class="muted">to</span>
      <input id="fHi" type="number" min="${first}" max="${last}" value="${last}"
             inputmode="numeric" style="width:62px"></span></div>
    <button class="btn" style="margin-top:12px" onclick="focusRange()">Focus on these verses</button>
  </div>`;
  box.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
function focusRange() {
  const lo = +document.getElementById("fLo").value;
  const hi = +document.getElementById("fHi").value;
  if (!lo || !hi || hi < lo) { toast("Check the verse numbers"); return; }
  setFocus(lo, hi);
  document.getElementById("gntTools").innerHTML = "";
  go("today");
}
function togglePin() {
  if (!gntCur) return;
  if (gntPinned()) { S.pin = null; toast("Unpinned"); }
  else {
    const m = gntCur.meta;
    S.pin = { a: gntCur.abbr, ch: gntCur.ch, t: m.t,
              n: m.n ? m.n[gntCur.ch] : gntCur.ch + 1, ts: Date.now() };
    toast("Pinned — it is on your Today screen");
  }
  save(); paintGntTools();
}

/* ---------- screens ---------- */
async function openGnt() {
  const body = document.getElementById("readBody");
  pushNav({ screen: "read", gnt: "books" });
  document.getElementById("readList").innerHTML =
    `<button class="btn ghost small" onclick="renderRead()">← Passages</button>`;
  body.innerHTML = `<div class="empty"><span class="gk">…</span><p>Loading</p></div>`;
  try { await gntLoad(); } catch (e) {
    body.innerHTML = `<div class="empty"><span class="gk">οὐδέν</span>
      <p>The text could not be loaded. If you are offline, open it once with a connection first.</p></div>`;
    return;
  }
  body.innerHTML = `<h2>The Greek New Testament</h2>
    <p class="muted" style="font-size:.86rem">Every word parsed. Tap any word as you read.</p>
    ${GNT.books.map(b => `
      <button class="lesson-item" onclick="openGntBook('${b.a}')">
        <span class="t"><b>${b.t}</b><span>${b.ch.length} chapter${b.ch.length === 1 ? "" : "s"}</span></span>
        <span class="muted">›</span></button>`).join("")}
    <div style="height:20px"></div>`;
}

async function openGntBook(abbr) {
  const body = document.getElementById("readBody");
  body.innerHTML = `<div class="empty"><span class="gk">…</span><p>Loading</p></div>`;
  pushNav({ screen: "read", gnt: "book", a: abbr });
  /* Reachable from a restored history entry, where the manifest has not been
     loaded yet — GNT.books would throw and leave the tab blank. */
  let meta;
  try { await gntLoad(); meta = GNT.books.find(b => b.a === abbr); } catch (e) { meta = null; }
  if (!meta) {
    body.innerHTML = `<div class="empty"><span class="gk">οὐδέν</span>
      <p>That book could not be loaded. If you are offline, open it once with a connection.</p></div>`;
    return;
  }
  try { await gntBook(abbr); } catch (e) {
    body.innerHTML = `<div class="empty"><span class="gk">οὐδέν</span>
      <p>${meta.t} is not available offline yet. Open it once with a connection.</p></div>`;
    return;
  }
  document.getElementById("readList").innerHTML =
    `<button class="btn ghost small" onclick="openGnt()">← Books</button>`;
  body.innerHTML = `<h2>${meta.t}</h2>
    <div class="ch-grid">${meta.ch.map((_, k) =>
      `<button class="ch" onclick="openGntChapter('${abbr}',${k})">${meta.n?meta.n[k]:k+1}</button>`).join("")}</div>
    <div style="height:20px"></div>`;
}

/* Light the chapter by what you know: settled words at full strength, the
   ones still to come faint, so a chapter fills in as the deck grows instead
   of staying uniformly grey. Everything this needs was already computed —
   gntCoverage walks the same lemmas to write one sentence above the passage —
   and then spent on prose, while every token rendered identically.

   Applied after the fact rather than baked into the HTML, so the Settings
   toggle and adding a word from the gloss bar can both repaint what is on
   screen without rebuilding the page or navigating anywhere. */
function paintLit() {
  const psg = document.getElementById("psg");
  if (!psg || !gntCur) return;
  const lit = S.lit !== 0;
  const known = new Map();                 // lemma index -> class, computed once
  psg.querySelectorAll("w").forEach(el => {
    el.classList.remove("k0", "k1", "k2", "k3");
    if (!lit) return;
    const w = gntCur.verses[+el.dataset.v][1][+el.dataset.w];
    if (!known.has(w[1])) {
      const i = vocIndexFor(GNT.lemmas[w[1]]);
      const c = i >= 0 ? S.cards[i] : null;
      known.set(w[1], i < 0 ? "k0" : !c ? "k1" : (c.ivl >= 6 ? "k3" : "k2"));
    }
    el.classList.add(known.get(w[1]));
  });
}

async function openGntChapter(abbr, ch) {
  /* Openable from the resume row, the pinned passage and a restored history
     entry — any of which can be the first thing tapped after a cold start.
     So nothing here assumes the manifest is loaded or that the stored
     reference still points at a chapter that exists. */
  if (!document.getElementById("s-read").classList.contains("on")) showScreen("read");
  // Pushed here, synchronously and after the screen's own entry, so that the
  // history reads read -> chapter and a replay can suppress both at once.
  pushNav({ screen: "read", gnt: "ch", a: abbr, c: ch });
  const body = document.getElementById("readBody");
  body.innerHTML = `<div class="empty"><span class="gk">…</span><p>Loading</p></div>`;
  let book, meta;
  try {
    await gntLoad();
    book = await gntBook(abbr);
    meta = GNT.books.find(b => b.a === abbr);
    if (!meta || !book.c || !book.c[ch]) throw new Error("range");
  } catch (e) {
    body.innerHTML = `<div class="empty"><span class="gk">οὐδέν</span>
      <p>That chapter could not be loaded. If you are offline, open it once with a connection first.</p></div>`;
    return;
  }
  pushNav({ screen: "read", gnt: "ch", a: abbr, c: ch });
  S.where = { a: abbr, ch, t: meta.t, n: meta.n ? meta.n[ch] : ch + 1 };
  save();
  grant("read");

  document.getElementById("readList").innerHTML =
    `<button class="btn ghost small" onclick="openGntBook('${abbr}')">← ${meta.t}</button>`;

  /* Each verse is [number, words]. The number is the real reference, not the
     array position: SBLGNT omits passages such as John 7:53-8:11, so numbering
     by position made every verse in John 8 read eleven low — a citation you
     could carry into a sermon. */
  const verses = book.c[ch];
  /* Lit by what you know. Everything needed for this was already computed —
     gntCoverage walks the same lemmas to write one sentence above the
     passage — and then spent on prose, while every token rendered identically.
     A page you can mostly read should look like one: settled words at full
     strength, and the ones still to come faint, so the chapter fills in as
     the deck grows rather than staying uniformly grey.

     The verse range of a focus is marked too. It could not be before: this
     HTML is built before gntCur is assigned and never re-rendered, so
     anything reading gntCur here would be a chapter behind. S.focus is state
     and is available now. */
  const f = S.focus;
  const inFocus = f && f.a === abbr && f.ch === ch
    ? (n => !f.lo || (n >= f.lo && n <= f.hi)) : null;
  const html = verses.map((v, vi) =>
    `<span class="vn">${v[0]}</span>` +
    v[1].map((w, wi) => `<w data-v="${vi}" data-w="${wi}"${
      inFocus && inFocus(v[0]) ? ' class="inf"' : ""}>${w[0]}</w>`).join(" ")
  ).join(" ");

  document.getElementById("readBody").innerHTML = `
    <div class="between" style="margin-bottom:6px">
      <h2 style="margin:0">${meta.t} ${meta.n?meta.n[ch]:ch+1}</h2>
      <span class="muted" style="font-size:.8rem">${verses.length} verses</span>
    </div>
    <p class="muted" style="font-size:.82rem;margin:0 0 10px;line-height:1.5">${(()=>{
      const c = gntCoverage(verses);
      const head = c.started
        ? `You have started <b>${c.started}</b> of the <b>${c.distinct}</b> different words here — ${c.pagePct}% of the words on the page, since the common ones repeat.`
        : `<b>${c.distinct}</b> different words here, none of them in your deck yet.`;
      const more = c.started ? "more " : "";        // "138 more" reads oddly from zero
      const rest = c.toLearn
        ? ` ${c.toLearn} ${more}${c.toLearn === 1 ? "is" : "are"} in the course${c.outside ? `; ${c.outside} ${c.outside === 1 ? "is" : "are"} not` : ""}.`
        : (c.outside ? ` The other ${c.outside} ${c.outside === 1 ? "is" : "are"} not in the course.` : "");
      return head + rest;
    })()}</p>
    <div class="passage gnt" id="psg">${html}</div>
    <div class="gloss" id="gloss"><div class="d">Tap a word for its parsing.</div></div>
    <div class="row" style="margin-top:14px">
      ${ch > 0 ? `<button class="btn ghost small" onclick="openGntChapter('${abbr}',${ch - 1})">← ${meta.n?meta.n[ch-1]:ch}</button>` : ""}
      ${ch < meta.ch.length - 1 ? `<button class="btn ghost small" onclick="openGntChapter('${abbr}',${ch + 1})">${meta.n?meta.n[ch+1]:ch+2} →</button>` : ""}
    </div>
    <div class="row" style="margin-top:9px">
      <button class="btn ghost small" id="btnPin" onclick="togglePin()"></button>
      <button class="btn ghost small" id="btnFocus" onclick="askFocus()"></button>
      <button class="btn ghost small" onclick="showGntUnknown()">Words I don't know</button>
    </div>
    <div id="gntTools" style="margin-top:12px"></div>
    <div style="height:20px"></div>`;
  gntCur = { abbr, ch, meta, verses };
  paintLit();
  paintGntTools();

  let counted = false;
  document.getElementById("psg").onclick = e => {
    if (e.target.tagName !== "W") return;
    // Reading the Greek New Testament is studying. It used to count for
    // nothing, so the streak broke on the days that mattered most.
    if (!counted) { counted = true; touchDay(); }
    // remove(), not className="": the word also carries how well you know it
    document.querySelectorAll("#psg w.tapped").forEach(x => x.classList.remove("tapped"));
    e.target.classList.add("tapped");
    const w = verses[+e.target.dataset.v][1][+e.target.dataset.w];
    const lemma = GNT.lemmas[w[1]];
    const g = glossFor(lemma, GNT.gloss[w[1]]);
    const parse = gntParse(GNT.pos[w[2]], w[3]);
    // A word you have just had to look up is exactly the one worth adding.
    const vi = vocIndexFor(lemma);
    document.getElementById("gloss").innerHTML =
      `<div class="w gk">${w[0]}</div>
       <div class="d">${parse}${parse ? " · " : ""}<span class="gk">${lemma}</span>${g.text ? " — " + g.text : ""}${
         g.from ? `<span class="src" title="${g.from}">†</span>` : ""}</div>
       ${vi >= 0 && !S.cards[vi]
         ? `<button class="mini" style="margin-top:7px" onclick="addToDeck(${vi},this)">+ add to my deck</button>` : ""}`;
  };
  window.scrollTo(0, 0);
}

/* Bulk download for offline reading. Not wired to a button: the service
   worker fetches every book in the background from data/offline.json, so
   this is a manual fallback only. */
let gntDl = false;
async function downloadGnt(btn) {
  if (gntDl) return;
  gntDl = true;
  try { await gntLoad(); } catch (e) { gntDl = false; toast("Need a connection for this"); return; }
  const urls = GNT.books.map(b => "data/gnt/" + b.a + ".json");
  let n = 0, failed = 0;
  for (const u of urls) {
    try { const r = await fetch(u); if (!r.ok) failed++; } catch (e) { failed++; }
    n++;
    if (btn) btn.textContent = `Downloading ${n}/${urls.length}…`;
  }
  gntDl = false;
  if (btn) btn.textContent = failed ? `Done, ${failed} failed` : "New Testament saved offline";
  toast(failed ? `${failed} books could not be fetched` : "The whole New Testament is now offline");
}

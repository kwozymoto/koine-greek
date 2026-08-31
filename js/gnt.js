/* The whole Greek New Testament, tap-to-parse.

   Books load one at a time (largest is 621KB) rather than all 4.4MB up
   front; the service worker keeps each one after its first visit, so a book
   you have opened works offline. Settings offers a bulk download.

   Data shape (built by scratchpad/build_gnt.py from MorphGNT/SBLGNT):
     manifest.json  {lemmas[], gloss[], pos[], books[{a,t,n[],ch[]}]}
     <Abbr>.json    {a,t,n:[chapterNo], c:[ chapter[ [verseNo, words] ] ]}
     word           [text, lemmaIdx, posIdx, parseCode]
   Chapter and verse numbers are stored, never inferred from array position.

   Every word gets a full parse; about 85% also carry a gloss, drawn from
   the course vocabulary. The rest show their parse and lemma, which is the
   part you cannot work out for yourself. */

let GNT = null;                 // manifest, once loaded
const gntBooks = {};            // abbr -> book json
let gntWhere = { book: null, ch: 0 };

const GNT_TENSE = {P:"present",I:"imperfect",F:"future",A:"aorist",X:"perfect",Y:"pluperfect"};
const GNT_VOICE = {A:"active",M:"middle",P:"passive"};
const GNT_MOOD  = {I:"indicative",D:"imperative",S:"subjunctive",O:"optative",N:"infinitive",P:"participle"};
const GNT_CASE  = {N:"nominative",G:"genitive",D:"dative",A:"accusative",V:"vocative"};
const GNT_NUM   = {S:"singular",P:"plural"};
const GNT_GEND  = {M:"masculine",F:"feminine",N:"neuter"};
const GNT_DEG   = {C:"comparative",S:"superlative"};
const GNT_POS   = {"N-":"noun","V-":"verb","A-":"adjective","D-":"adverb","C-":"conjunction",
                   "P-":"preposition","RA":"article","RD":"demonstrative","RP":"pronoun",
                   "RR":"relative","RI":"interrogative/indefinite","X-":"particle","I-":"interjection"};

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
                 person && num ? person + (num === "S" ? " singular" : " plural") : ""]);
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

/* ---------- screens ---------- */
async function openGnt() {
  const body = document.getElementById("readBody");
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
  const meta = GNT.books.find(b => b.a === abbr);
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

async function openGntChapter(abbr, ch) {
  const book = await gntBook(abbr);
  const meta = GNT.books.find(b => b.a === abbr);
  gntWhere = { book: abbr, ch };
  grant("read");

  document.getElementById("readList").innerHTML =
    `<button class="btn ghost small" onclick="openGntBook('${abbr}')">← ${meta.t}</button>`;

  /* Each verse is [number, words]. The number is the real reference, not the
     array position: SBLGNT omits passages such as John 7:53-8:11, so numbering
     by position made every verse in John 8 read eleven low — a citation you
     could carry into a sermon. */
  const verses = book.c[ch];
  const html = verses.map((v, vi) =>
    `<span class="vn">${v[0]}</span>` +
    v[1].map((w, wi) => `<w data-v="${vi}" data-w="${wi}">${w[0]}</w>`).join(" ")
  ).join(" ");

  document.getElementById("readBody").innerHTML = `
    <div class="between" style="margin-bottom:6px">
      <h2 style="margin:0">${meta.t} ${meta.n?meta.n[ch]:ch+1}</h2>
      <span class="muted" style="font-size:.8rem">${verses.length} verses</span>
    </div>
    <div class="passage gnt" id="psg">${html}</div>
    <div class="gloss" id="gloss"><div class="d">Tap a word for its parsing.</div></div>
    <div class="row" style="margin-top:14px">
      ${ch > 0 ? `<button class="btn ghost small" onclick="openGntChapter('${abbr}',${ch - 1})">← ${meta.n?meta.n[ch-1]:ch}</button>` : ""}
      ${ch < meta.ch.length - 1 ? `<button class="btn ghost small" onclick="openGntChapter('${abbr}',${ch + 1})">${meta.n?meta.n[ch+1]:ch+2} →</button>` : ""}
    </div>
    <div style="height:20px"></div>`;

  document.getElementById("psg").onclick = e => {
    if (e.target.tagName !== "W") return;
    document.querySelectorAll("#psg w").forEach(x => x.classList.remove("tapped"));
    e.target.classList.add("tapped");
    const w = verses[+e.target.dataset.v][1][+e.target.dataset.w];
    const lemma = GNT.lemmas[w[1]], gloss = GNT.gloss[w[1]];
    const parse = gntParse(GNT.pos[w[2]], w[3]);
    document.getElementById("gloss").innerHTML =
      `<div class="w gk">${w[0]}</div>
       <div class="d">${parse}${parse ? " · " : ""}<span class="gk">${lemma}</span>${gloss ? " — " + gloss : ""}</div>`;
  };
  window.scrollTo(0, 0);
}

/* Bulk download for offline reading. */
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

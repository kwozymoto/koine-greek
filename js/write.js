/* Handwriting practice — trace a letter, or write a word from memory.

   Two modes, deliberately different in how they are judged.

   Tracing is scored, because tracing is objectively measurable: the target
   shape is known, so we can say how much of it you covered and how much ink
   landed outside it. Writing a word from memory is NOT scored. Recognising
   free handwriting needs a recogniser and a set of templates in your own
   hand, and it would reject a perfectly good alpha often enough to be worse
   than useless. So that mode reveals the word and you grade yourself, which
   is what copywork has always been: the value is in the writing, not in the
   marking.

   Pointer events, so a mouse and a finger take exactly the same path. No
   dependencies, no glyph outlines — the guide letter is drawn as text in the
   app's own Greek face, which means it works for any letter or word. */

const WRITE = { grid: 30 };            // resolution of the scoring grid
/* The pen scales with the pad, because the guide letter does. A fixed 7px
   nib on a 300px pad is a pencil against a letterform two dozen pixels
   thick, which both feels wrong to draw with and reads as a poor trace. */
const wPen = h => Math.max(6, Math.round(h / 22));
let WPAD = null;

const WFACE = '"Noto Serif","GFS Didot","Palatino Linotype",Palatino,Georgia,serif';
const wFont = px => Math.round(px) + "px " + WFACE;

/* Fit the guide to the ink it actually puts on the page, not to its font
   size. A lowercase alpha has no ascender and no descender, so sizing by em
   leaves it floating in the middle of the pad at half the height it could
   be — and a small target is a harder target. Measured, scaled, and centred
   on the glyph's own bounding box, which also puts rho and phi where they
   belong rather than hanging off the bottom. */
function wFit(ctx, text, w, h) {
  const probe = 100;
  ctx.font = wFont(probe);
  const m = ctx.measureText(text);
  const asc = m.actualBoundingBoxAscent || probe * 0.7;
  const desc = m.actualBoundingBoxDescent || probe * 0.2;
  const gw = m.width || probe * 0.6;
  const scale = Math.min(h * 0.78 / (asc + desc), w * 0.82 / gw);
  const size = Math.max(28, probe * scale);
  ctx.font = wFont(size);
  const m2 = ctx.measureText(text);
  const a2 = m2.actualBoundingBoxAscent || size * 0.7;
  const d2 = m2.actualBoundingBoxDescent || size * 0.2;
  return { font: wFont(size), baseY: h / 2 + (a2 - d2) / 2 };
}

/* Draw the guide the same way wherever it is needed — the scorer's mask has
   to sit exactly where the visible letter does, or the score is meaningless. */
function wGuide(s, ctx, style) {
  if (!s.guide || !s.fit) return;
  ctx.fillStyle = style;
  ctx.font = s.fit.font;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(s.guide, s.w / 2, s.fit.baseY);
}

/* Take the pad's geometry from the DOM. Called again whenever the box
   changes size — on a rotation, or when the pad is built while the page has
   no width to give it yet, which would otherwise leave a canvas that is
   permanently zero pixels wide and silently accepts no ink. Strokes are held
   as fractions of the box, so re-measuring is lossless. */
function wMeasure(s) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const r = s.cv.getBoundingClientRect();
  if (!r.width || !r.height) return false;
  s.w = r.width;
  s.h = r.height;
  s.cv.width = Math.round(r.width * dpr);
  s.cv.height = Math.round(r.height * dpr);
  s.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  s.pen = wPen(r.height);
  s.fit = s.guide ? wFit(s.ctx, s.guide, s.w, s.h) : null;
  return true;
}

function wSetup(cv, guide) {
  /* Every card builds a new pad, so the one before it has to let go of its
     observer — otherwise a twenty-card session leaves twenty of them
     watching canvases that are no longer in the document. */
  if (WPAD && WPAD.ro) { try { WPAD.ro.disconnect(); } catch (e) {} WPAD.ro = null; }
  const s = { cv, ctx: cv.getContext("2d"), w: 0, h: 0, pen: 8,
              guide: guide || "", strokes: [], cur: null };
  wMeasure(s);
  if (typeof ResizeObserver === "function") {
    s.ro = new ResizeObserver(() => {
      if (!s.cv.isConnected) { try { s.ro.disconnect(); } catch (e) {} return; }
      if (wMeasure(s)) wPaint(s);
    });
    s.ro.observe(cv);
  }
  return s;
}

function wPath(s, ctx, stroke, width) {
  const w = width || s.pen;
  ctx.lineWidth = w;
  const p = stroke.map(([x, y]) => [x * s.w, y * s.h]);
  if (p.length < 2) {
    ctx.beginPath();
    ctx.arc(p[0][0], p[0][1], w / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(p[0][0], p[0][1]);
  for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]);
  ctx.stroke();
}

function wPaint(s) {
  if (!s.w || !s.h) return;
  const c = s.ctx;
  c.clearRect(0, 0, s.w, s.h);
  if (s.guide) {
    c.save();
    c.globalAlpha = 0.2;
    wGuide(s, c, "#e9e5da");
    c.restore();
  }
  c.save();
  c.strokeStyle = c.fillStyle = "#d4a537";
  c.lineCap = c.lineJoin = "round";
  s.strokes.forEach(st => wPath(s, c, st));
  c.restore();
}

function wBind(s) {
  const at = e => {
    const r = s.cv.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
  };
  s.cv.onpointerdown = e => {
    e.preventDefault();
    try { s.cv.setPointerCapture(e.pointerId); } catch (err) {}
    s.cur = [at(e)];
    s.strokes.push(s.cur);
    wPaint(s);
  };
  s.cv.onpointermove = e => {
    if (!s.cur) return;
    e.preventDefault();
    s.cur.push(at(e));
    wPaint(s);
  };
  const end = () => { s.cur = null; };
  s.cv.onpointerup = end;
  s.cv.onpointercancel = end;
}

function wClear() { if (WPAD) { WPAD.strokes = []; WPAD.cur = null; wPaint(WPAD); } }
function wUndo()  { if (WPAD) { WPAD.strokes.pop(); WPAD.cur = null; wPaint(WPAD); } }

/* ---------- scoring a trace ----------
   Compared on a coarse grid rather than pixel for pixel. A pen stroke is
   thin and a serif letterform is thick, so an exact overlap would score a
   flawless trace somewhere around forty per cent. At this resolution the
   pen and the letter occupy the same cells. */
function wCells(s, draw) {
  const G = WRITE.grid;
  if (!s.w || !s.h) return new Uint8Array(G * G);
  const off = document.createElement("canvas");
  off.width = Math.max(1, Math.round(s.w));
  off.height = Math.max(1, Math.round(s.h));
  const c = off.getContext("2d");
  draw(c);
  const d = c.getImageData(0, 0, off.width, off.height).data;
  const cells = new Uint8Array(G * G);
  for (let y = 0; y < off.height; y++) {
    const gy = Math.min(G - 1, Math.floor(y * G / off.height));
    for (let x = 0; x < off.width; x++) {
      if (d[(y * off.width + x) * 4 + 3] > 40)
        cells[gy * G + Math.min(G - 1, Math.floor(x * G / off.width))] = 1;
    }
  }
  return cells;
}

function wScore(s) {
  const mask = wCells(s, c => wGuide(s, c, "#fff"));
  /* Two probes, because the two questions are different. Coverage asks "did
     your line pass through this part of the letter", so it uses a wide
     probe: tracing down the spine of a thick glyph is a good trace, not a
     half-finished one. Spill asks "did ink land off the letter", so it uses
     the real nib — a wide probe there would punish an accurate stroke. */
  const strokesAt = w => wCells(s, c => {
    c.strokeStyle = c.fillStyle = "#fff";
    c.lineCap = c.lineJoin = "round";
    s.strokes.forEach(st => wPath(s, c, st, w));
  });
  const fat = strokesAt(s.pen * 2.4), thin = strokesAt(s.pen);
  let m = 0, hit = 0, k = 0, out = 0;
  for (let i = 0; i < mask.length; i++) {
    if (mask[i]) { m++; if (fat[i]) hit++; }
    if (thin[i]) { k++; if (!mask[i]) out++; }
  }
  return { coverage: m ? hit / m : 0, spill: k ? out / k : 0, drew: k > 0 };
}

/* ---------- shared markup ---------- */
function wPadHtml(showGuideHint) {
  return `<div class="pad"><canvas id="pad"></canvas></div>
    <div class="row" style="margin-top:9px">
      <button class="btn ghost small" onclick="wClear()">Clear</button>
      <button class="btn ghost small" onclick="wUndo()">Undo stroke</button>
      ${showGuideHint ? `<span class="muted" style="font-size:.74rem;margin-left:auto">Follow the faint letter</span>` : ""}
    </div>`;
}

/* ---------- trace the alphabet ---------- */
function writeLetterDrill(n = 10) {
  const pool = ALPHABET.slice().sort(() => Math.random() - .5).slice(0, n);
  return pool.map(a => () => {
    // "Α α" -> "α". Index 1, not the last: sigma is listed "Σ σ ς", and
    // popping gave the final form, so the one letter whose shape depends on
    // where it sits was the one being taught in the position it cannot hold.
    const lower = a[0].split(" ")[1];
    document.getElementById("sessBody").innerHTML = `
      <div class="card" style="text-align:center">
        <p style="margin:0;font-size:1.02rem">Trace <b>${a[1]}</b></p>
        <p class="muted" style="margin:5px 0 0;font-size:.82rem">${a[0]} · sounds like ${a[2]}</p>
      </div>
      ${wPadHtml(true)}
      <div style="height:9px"></div>
      <button class="btn" id="wCheck">Check</button>
      <div id="fb"></div>`;
    WPAD = wSetup(document.getElementById("pad"), lower);
    wBind(WPAD);
    wPaint(WPAD);
    /* Judged leniently and never punitively. The measurement is sound at the
       extremes — random ink scores near zero, a stroke that follows the
       letterform scores in the nineties — but I could not calibrate the
       middle against real handwriting, only against synthetic paths, and
       those flatter round letters and thin ones by turns. So a low score
       reads as "have another go", not as a mark against you, and there is
       no wrong-answer tone. The percentage is shown; you can see for
       yourself whether it is being fair. */
    document.getElementById("wCheck").onclick = () => {
      const r = wScore(WPAD);
      if (!r.drew) { toast("Trace the letter first"); return; }
      const good = r.coverage >= 0.6 && r.spill <= 0.45;
      document.getElementById("wCheck").style.display = "none";
      document.getElementById("fb").innerHTML = `
        <div class="feedback"><b>${good ? "That follows it well" : "Have another go at this one"}</b>
          You went over ${Math.round(r.coverage * 100)}% of the letter${
            r.spill > 0.45 ? `, and ${Math.round(r.spill * 100)}% of your ink landed outside it` : ""}.</div>
        <div class="row">
          <button class="btn ghost small" onclick="wClear();document.getElementById('fb').innerHTML='';document.getElementById('wCheck').style.display=''">Try again</button>
          <button class="btn small" onclick="qi++;step()">Continue</button>
        </div>`;
      if (good) { sfx("correct"); addXp(2); }
    };
  });
}

/* ---------- write a word from memory ----------
   Not scored, by choice. See the note at the top of the file. */
function writeWordDrill(n = 8) {
  const met = VOCAB.map((_, i) => i).filter(i => S.cards[i] && !skipWord(i));
  const pool = (met.length > 5 ? met : LEARN_ORDER.slice(0, 30))
    .sort(() => Math.random() - .5).slice(0, n);
  const q = pool.map(i => () => {
    const v = VOCAB[i];
    document.getElementById("sessBody").innerHTML = `
      <div class="card" style="text-align:center">
        <p style="margin:0;font-size:1.02rem">Write the Greek for <b>${v[1]}</b></p>
        <p class="muted" style="margin:5px 0 0;font-size:.82rem">${v[3]}</p>
      </div>
      ${wPadHtml(false)}
      <div style="height:9px"></div>
      <button class="btn" id="wShow">Show the word</button>
      <div id="fb"></div>`;
    WPAD = wSetup(document.getElementById("pad"), "");
    wBind(WPAD);
    wPaint(WPAD);
    document.getElementById("wShow").onclick = () => {
      document.getElementById("wShow").style.display = "none";
      document.getElementById("fb").innerHTML = `
        <div class="card" style="text-align:center">
          <span class="q-gk">${v[0].split(",")[0]}</span>
          <div class="muted" style="font-size:.79rem;margin-top:6px">${v[0]} · ${v[1]}</div>
        </div>
        <p class="muted" style="font-size:.82rem;text-align:center;margin:0 0 10px">
          Compare it with yours, then say how it went.</p>
        <div class="grades">
          <button class="g1" onclick="grade(${i},0)">Again<i>&lt;1m</i></button>
          <button class="g2" onclick="grade(${i},1)">Hard<i>${nextIvl(i,1)}d</i></button>
          <button class="g3" onclick="grade(${i},2)">Good<i>${nextIvl(i,2)}d</i></button>
          <button class="g4" onclick="grade(${i},3)">Easy<i>${nextIvl(i,3)}d</i></button>
        </div>`;
      if (S.speak !== 0) playWord(i, null, true);
    };
  });
  q.__words = pool;
  return q;
}

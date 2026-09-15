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

/* Every number the trace scorer turns on, in one place. Set from the table
   trace-audit.html prints; that page reads them from here, so it calibrates
   the shipping scorer and not a copy of it. */
const WRITE = {
  step: 3,        // the centreline is sampled every N pixels
  tol:  0.3,      // still on the line, in pen widths
  far:  0.8,      // far enough off it to be worth nothing, in pen widths
  pass: 0.70,     // score needed to have followed the letter
};
/* WHY THIS IS NO LONGER MEASURED BY AREA. It used to ask what fraction of the
   glyph's pixels the pen passed through (coverage) and what fraction of the
   pen's pixels fell outside the glyph (spill), and showed coverage × (1 −
   spill). Both halves are unreachable, because a pen line cannot fill a serif
   letterform. Traced down its own exact centreline — a better trace than any
   hand can make — the old scorer said:

     alpha    coverage  95   spill   7   shown 88
     iota     coverage  85   spill  14   shown 73
     xi       coverage 100   spill  28   shown 72
     psi      coverage 100   spill  30   shown 70

   So a flawless psi was told that 30% of its ink had landed outside the
   letter, and iota — one vertical stroke — could not beat 85% coverage,
   because a round nib cannot fill the serifs. The ceiling was unreachable and
   it MOVED WITH THE LETTERFORM: the same hand scored 70 on psi and 88 on
   alpha. That is a measurement of the glyph, not of the learner, and the
   people using it said so.

   This asks what a hand is actually trying to do: how close did you stay to
   the letter's CENTRELINE, and how much of it did you go over. Tracing down
   the middle is distance zero, so 100 is reachable — and reachable equally
   for all 24 letters.

   What trace-audit.html prints at these settings, over all 24, against what
   the area scorer gave for the same eight traces:

     trace                         was        now
     down the middle             70–88      95–100     pass 24/24
     wobbled by 5px              62–87      88–98      pass 24/24
     middle plus a stray tail    64–84      78–87      pass 24/24
     wobbled by 10px             51–80      59–73      pass  3/24
     wobbled by 20px             36–65      26–35      pass  0/24
     the same shape 28% too big   9–53       1–44      pass  0/24
     a scribble                  17–41      10–22      pass  0/24
     one straight line            2–31       0–6       pass  0/24

   Nothing that should pass fails and nothing that should fail passes, with
   78 the worst good trace and 44 the best bad one — a gap of 33 where the
   area scorer had 9. The point of the exercise is the first row: a flawless
   trace now reads 95–100 whichever letter it is, where before it read
   anywhere from 70 to 88 depending on how thick the glyph happened to be.
   Psi, the worst case, went from 70 to 96.

   The two heavier jitters straddle the line on purpose, as before: a 10px
   per-point wobble on a 14px pen is a genuinely shaky hand, and where it
   falls is a judgement. It is harsher than it was, which is the right
   direction now that an accurate trace is no longer punished for the
   thickness of the letter it is following. */
/* ---------- where a letter begins ----------
   From Black, *Learn to Read New Testament Greek*, chapter 1 §6: a diagram of
   the lowercase letters, each with an arrow. In his words, "the arrows
   indicate THE EASIEST PLACE TO BEGIN when writing" — so this is ergonomics,
   not orthography. Greek has no stroke-order standard the way Chinese does,
   and the app must not imply one. He adds that many letters can be made
   without lifting the pen, "e.g., β and ρ are formed with a single stroke,
   beginning at the bottom", which is the only thing either the book or this
   table says about stroke COUNT.

   Read off the diagram at 9–20× and checked against the page by Fraser. The
   two straight arrows the prose also describes, β and ρ, come out of the
   picture as "start at the foot, go up" — which is the cross-check that the
   reading is the right way round: thin tail where the pen starts, solid head
   showing the first direction.

   Sigma is the one that looks like a mistake and is not. Every other bowl —
   α δ ε θ ο φ ω — starts at the top and goes anticlockwise; σ starts at the
   top-right and goes down the right side, CLOCKWISE, because that brings the
   pen back up to where the crossbar starts and the whole letter is one
   stroke. Tau is the only arrow that points upward: the crossbar is drawn
   first, left to right, not the stem.

   Each entry is [x, y, direction]. x and y are a target inside the glyph's
   own inked bounding box, and the marker snaps to the nearest point of its
   centreline — so this survives the guide being rendered in whatever serif
   the machine resolves, which a hard-coded pixel position would not. The
   coordinates are a placement chosen to sit where Black's arrow sits; the
   direction is his. */
const STROKE_START = {
  "α": [0.40, 0.00, "left"],        "β": [0.00, 1.00, "up"],
  "γ": [0.00, 0.00, "down-right"],  "δ": [0.85, 0.00, "left"],
  "ε": [0.95, 0.05, "left"],        "ζ": [0.00, 0.00, "right"],
  "η": [0.00, 0.00, "down"],        "θ": [0.50, 0.00, "left"],
  "ι": [0.50, 0.00, "down"],        "κ": [0.00, 0.00, "down"],
  "λ": [0.45, 0.00, "down-right"],  "μ": [0.00, 1.00, "up"],
  "ν": [0.00, 0.00, "down"],        "ξ": [0.50, 0.00, "down-right"],
  "ο": [0.50, 0.00, "left"],        "π": [0.00, 0.00, "down"],
  "ρ": [0.00, 1.00, "up"],          "σ": [0.55, 0.00, "down-right"],
  "ς": [0.90, 0.00, "left"],        "τ": [0.00, 0.00, "right"],
  "υ": [0.00, 0.00, "down"],        "φ": [0.30, 0.10, "left"],
  "χ": [0.00, 0.00, "down-right"],  "ψ": [0.50, 0.00, "down"],
  "ω": [0.00, 0.00, "down"],
};
const WDIR = { "up": [0, -1], "down": [0, 1], "left": [-1, 0], "right": [1, 0],
               "down-right": [0.71, 0.71], "down-left": [-0.71, 0.71] };

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
  /* Worked out here and not in wPaint, which runs on every pointermove:
     finding it rasterises the glyph, and doing that per frame while somebody
     is drawing would make the pen stutter. */
  s.mark = s.fit ? wStartMark(s) : null;
  return true;
}

/* Where Black's arrow goes on THIS rendering of the letter. The target is a
   fraction of the glyph's own inked box, snapped to the nearest point of its
   centreline, so the mark lands on the letter wherever the serif sits. */
function wStartMark(s) {
  const spec = STROKE_START[s.guide];
  if (!spec) return null;
  const sk = wSkeleton(s, 2);
  if (!sk.length) return null;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, cx = 0, cy = 0;
  for (const [x, y] of sk) {
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
    cx += x; cy += y;
  }
  cx /= sk.length; cy /= sk.length;
  const tx = x0 + (x1 - x0) * spec[0], ty = y0 + (y1 - y0) * spec[1];
  /* An anchor pinned to an edge of the box means THAT EDGE, so take only the
     points which actually reach it and let the other coordinate choose among
     them. Rho is why: this serif face curls its tail away to the right, so
     the bottom of the stroke is nowhere near the bottom-left corner, and
     matching the corner outright put the mark half way up the curve. */
  const band = 0.12, pin = (v) => v <= 0.001 || v >= 0.999;
  let cand = sk;
  if (pin(spec[1])) {
    const edge = spec[1] >= 0.999 ? y1 : y0;
    const near = sk.filter(p => Math.abs(p[1] - edge) <= (y1 - y0) * band);
    if (near.length) cand = near;
  } else if (pin(spec[0])) {
    const edge = spec[0] >= 0.999 ? x1 : x0;
    const near = sk.filter(p => Math.abs(p[0] - edge) <= (x1 - x0) * band);
    if (near.length) cand = near;
  }
  let at = cand[0], best = Infinity;
  for (const p of cand) {
    const d = Math.hypot(p[0] - tx, p[1] - ty);
    if (d < best) { best = d; at = p; }
  }
  // Nudged away from the middle of the letter so the mark sits beside it
  // rather than on top of it, which is where the book puts its arrows.
  const ox = at[0] - cx, oy = at[1] - cy, len = Math.hypot(ox, oy) || 1;
  return { at, dir: WDIR[spec[2]], out: [ox / len, oy / len] };
}

/* A dot where the pen starts and a short arrow for the way it first goes.
   Drawn in the muted tone, not the ink gold: it is an instruction, not
   something to trace over. It is never part of the scorer's mask — that is
   rasterised from wGuide() alone — so the hint cannot flatter the score. */
function wDrawStart(s, c) {
  if (!s.mark) return;
  const p = s.pen, m = s.mark;
  const bx = m.at[0] + m.out[0] * p * 0.8, by = m.at[1] + m.out[1] * p * 0.8;
  const L = p * 2.4, hx = bx + m.dir[0] * L, hy = by + m.dir[1] * L;
  c.save();
  c.strokeStyle = c.fillStyle = "#97a1b5";
  c.lineCap = c.lineJoin = "round";
  c.beginPath();
  c.arc(bx, by, Math.max(2.5, p * 0.28), 0, Math.PI * 2);
  c.fill();
  c.lineWidth = Math.max(1.5, p * 0.2);
  c.beginPath();
  c.moveTo(bx, by);
  c.lineTo(hx, hy);
  c.stroke();
  const a = Math.atan2(m.dir[1], m.dir[0]), w = Math.max(4, p * 0.5);
  c.beginPath();
  c.moveTo(hx, hy);
  c.lineTo(hx - w * Math.cos(a - 0.45), hy - w * Math.sin(a - 0.45));
  c.lineTo(hx - w * Math.cos(a + 0.45), hy - w * Math.sin(a + 0.45));
  c.closePath();
  c.fill();
  c.restore();
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
    wDrawStart(s, c);
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

/* ---------- the letter's centreline ----------
   The skeleton has to come from the glyph itself, or the scorer is only
   comparing the trace against a path somebody typed in. The mask is
   rasterised and scanned twice: once by row, taking the centre of each
   horizontal run, and once by column. Row-scanning alone loses a horizontal
   bar — every column of pi's crossbar is one long run whose centre is a
   single point — and column-scanning alone loses a vertical stem. The union
   follows both.

   `step` is a parameter rather than a constant because trace-audit.html
   samples it too, to build its synthetic traces. If both used the same
   sampling, the page's flawless trace would be the scorer's own reference
   point and scoring it 100 would prove nothing. They are sampled differently
   on purpose, so the audit stays a measurement. */
function wMaskBits(s) {
  const w = Math.max(1, Math.round(s.w)), h = Math.max(1, Math.round(s.h));
  const off = document.createElement("canvas");
  off.width = w; off.height = h;
  const c = off.getContext("2d");
  wGuide(s, c, "#fff");
  const d = c.getImageData(0, 0, w, h).data;
  const bits = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) if (d[i * 4 + 3] > 40) bits[i] = 1;
  return { bits, w, h };
}

function wRunCentres(m, byRow, step, out) {
  const outer = byRow ? m.h : m.w, inner = byRow ? m.w : m.h;
  for (let a = 0; a < outer; a += step) {
    let start = -1;
    for (let b = 0; b <= inner; b++) {
      const on = b < inner && m.bits[byRow ? a * m.w + b : b * m.w + a];
      if (on && start < 0) start = b;
      if (!on && start >= 0) {
        const mid = (start + b - 1) / 2;
        out.push(byRow ? [mid, a] : [a, mid]);
        start = -1;
      }
    }
  }
  return out;
}

/* In pad pixels, which is what the scorer compares in — the tolerance is a
   multiple of the pen, and the pen scales with the pad. */
function wSkeleton(s, step) {
  if (!s.guide || !s.w || !s.h) return [];
  const m = wMaskBits(s);
  const pts = [];
  wRunCentres(m, true, step, pts);
  wRunCentres(m, false, step, pts);
  return pts;
}

/* ---------- scoring a trace ----------
   Two questions, both of which a learner can actually get right:

     on the line   of the ink you laid down, how much of it was on the
                   letter's centreline
     covered       of the centreline, how much of it you went over

   Neither is bounded below 100 by the thickness of the glyph, which is what
   was wrong with measuring area. */

/* The strokes as a dense run of points, so a fast straight drag is compared
   along its length and not only at the two ends the pointer reported. */
function wInk(s) {
  const pts = [];
  s.strokes.forEach(st => {
    const P = st.map(([x, y]) => [x * s.w, y * s.h]);
    pts.push(P[0]);
    for (let i = 1; i < P.length; i++) {
      const dx = P[i][0] - P[i - 1][0], dy = P[i][1] - P[i - 1][1];
      const n = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 2));
      for (let k = 1; k <= n; k++)
        pts.push([P[i - 1][0] + dx * k / n, P[i - 1][1] + dy * k / n]);
    }
  });
  return pts;
}

/* Nearest-neighbour over a uniform grid. Brute force is ~700 × ~700 per
   letter, which is fine once but not on every frame if this is ever wanted
   live. */
function wGrid(pts, cell) {
  const m = new Map();
  pts.forEach(([x, y], i) => {
    const k = Math.floor(x / cell) + "," + Math.floor(y / cell);
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(i);
  });
  return { m, cell, pts };
}

function wNear(g, x, y, rings) {
  let best = Infinity;
  const cx = Math.floor(x / g.cell), cy = Math.floor(y / g.cell);
  for (let dx = -rings; dx <= rings; dx++)
    for (let dy = -rings; dy <= rings; dy++) {
      const c = g.m.get((cx + dx) + "," + (cy + dy));
      if (!c) continue;
      for (const i of c) {
        const d = Math.hypot(g.pts[i][0] - x, g.pts[i][1] - y);
        if (d < best) best = d;
      }
    }
  return best;
}

function wScore(s) {
  const sk = wSkeleton(s, WRITE.step);
  const ink = wInk(s);
  if (!sk.length || !ink.length)
    return { onLine: 0, covered: 0, score: 0, drew: ink.length > 0 };
  const tol = s.pen * WRITE.tol, far = s.pen * WRITE.far;
  const gSk = wGrid(sk, tol), gInk = wGrid(ink, tol);

  /* Covered is a yes or no per point of the letter: either your pen came
     within a nib's width of this part of it or it did not. */
  let cov = 0;
  for (const [x, y] of sk) if (wNear(gInk, x, y, 2) <= tol) cov++;

  /* On the line is graded, because a hand wobbles and a step change at one
     nib's width would make the score jump about. Full marks inside `tol`,
     nothing at all beyond `far`, straight line between. */
  let acc = 0;
  for (const [x, y] of ink) {
    const d = wNear(gSk, x, y, 4);
    acc += d <= tol ? 1 : Math.max(0, (far - d) / (far - tol));
  }
  const covered = cov / sk.length, onLine = acc / ink.length;
  return { onLine, covered, score: covered * onLine, drew: true };
}

/* ---------- shared markup ---------- */
function wPadHtml(showGuideHint) {
  return `<div class="pad"><canvas id="pad"></canvas></div>
    <div class="row" style="margin-top:9px">
      <button class="btn ghost small" onclick="wClear()">Clear</button>
      <button class="btn ghost small" onclick="wUndo()">Undo stroke</button>
      ${showGuideHint ? `<span class="muted" style="font-size:.74rem;margin-left:auto">Begin at the dot, follow the arrow</span>` : ""}
    </div>`;
}

/* ---------- trace the alphabet ---------- */
function writeLetterDrill(n = 10, from) {
  // `from` lets the day's plan trace a letter it knows you are shaky on
  // rather than one at random.
  const pool = (from || ALPHABET.slice().sort(() => Math.random() - .5)).slice(0, n);
  return pool.map(a => () => {
    // "Α α" -> "α". Index 1, not the last: sigma is listed "Σ σ ς", and
    // popping gave the final form, so the one letter whose shape depends on
    // where it sits was the one being taught in the position it cannot hold.
    const lower = a[0].split(" ")[1];
    /* Black, ch.1 §11c: "It is helpful to pronounce the name of each letter
       while writing, since the name contains the sound of the letter." Every
       other place the app puts a letter in front of you can say it aloud;
       this was the one that could not. */
    const snd = (typeof AUDIO_BY_GREEK !== "undefined") && AUDIO_BY_GREEK[a[0]];
    document.getElementById("sessBody").innerHTML = `
      <div class="card" style="text-align:center">
        <p style="margin:0;font-size:1.02rem">Trace <b>${a[1]}</b></p>
        <p class="muted" style="margin:5px 0 0;font-size:.82rem">${a[0]} · sounds like ${a[2]}</p>
        ${snd ? `<button class="btn ghost small" style="margin-top:10px"
          onclick="playGreek('${a[0]}',null)">🔊 Hear it</button>` : ""}
      </div>
      ${wPadHtml(true)}
      <div style="height:9px"></div>
      <button class="btn" id="wCheck">Check</button>
      <div id="fb"></div>`;
    WPAD = wSetup(document.getElementById("pad"), lower);
    wBind(WPAD);
    wPaint(WPAD);
    /* "Try again" puts the Check button back, so without these two the same
       letter could be counted several times over — and a retry that then
       succeeded would have already broken the run. First verdict only, and
       the XP is paid once. */
    let judged = false, paid = false;
    /* Never punitive. The numbers in WRITE are set from the table
       trace-audit.html prints: a path down the middle of the glyph, that path
       jittered, the same path oversized, a scribble and a single line, over
       all 24 letters. What it still cannot model is a real hand, so a low
       score reads as "have another go", not as a mark against you, and there
       is no wrong-answer tone. Both halves of the score are shown; you can
       see for yourself whether it is fair — and unlike the score this
       replaced, both halves can actually reach 100. */
    document.getElementById("wCheck").onclick = () => {
      const r = wScore(WPAD);
      if (!r.drew) { toast("Trace the letter first"); return; }
      const good = r.score >= WRITE.pass;
      const pc = x => Math.round(x * 100);
      /* Which half fell short is the only thing that tells you what to
         change: missing the letter means go back over it, wandering off the
         line means slow down. Each half is judged against a standard and not
         against the other one — 99 and 100 are both good, and comparing them
         told a flawless trace it had skipped something. */
      const note = r.covered >= 0.85 && r.onLine >= 0.85
        ? ""
        : r.onLine <= r.covered
          ? "A good deal of your line went outside the letter — slow down and follow it."
          : "Some of the letter was missed — go back over the parts you skipped.";
      document.getElementById("wCheck").style.display = "none";
      document.getElementById("fb").innerHTML = `
        <div class="feedback"><b>${good ? "That follows it well" : "Have another go at this one"} — ${pc(r.score)}%</b>
          You went over ${pc(r.covered)}% of the letter, and ${pc(r.onLine)}% of your
          line stayed on it.${note ? " " + note : ""}</div>
        <div class="row">
          <button class="btn ghost small" onclick="wClear();document.getElementById('fb').innerHTML='';document.getElementById('wCheck').style.display=''">Try again</button>
          <button class="btn small" onclick="qi++;step()">Continue</button>
        </div>`;
      /* Counted either way so the run and the session summary are honest,
         but silent when it falls short — see the note above. A trace that
         misses says "have another go", not "wrong". */
      if (!judged) { judged = true; answerFelt(good, null, !good); }
      else if (good) sfx("correct");
      if (good && !paid) { paid = true; addXp(2); SESSION_XP += 2; }
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

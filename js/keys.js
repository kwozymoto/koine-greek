/* A Greek keyboard for a phone.

   The app is a PWA and most phones have no polytonic keyboard; iOS ships a
   monotonic Greek one, which cannot type a breathing at all. So the app
   brings its own.

   ALPHABETICAL, NOT QWERTY. Every desktop polytonic scheme maps Greek onto
   QWERTY by sound — α on a, β on b — which is right for a touch-typist and
   wrong here. Twenty-four letters go 8x3 exactly, in the order chapter 1
   teaches them, so the keyboard rehearses the alphabet every time it is
   opened. Final sigma is not a key: σ at the end of a word becomes ς on its
   own, because that is a rule about Greek rather than a choice the learner
   should have to make. It also stops λογοσ, which no rung of the ladder
   would match against λόγος.

   MARKS GO ON AFTERWARDS. Desktop keyboards use dead keys: press the
   diacritic, then the vowel, with nothing visible in between. On a touch
   screen that invisible pending state is the thing people get lost in, so
   here it is the other way round — type the vowel, then tap a mark, and
   watch it land. Tapping the same mark again takes it off.

   THE DIMMING IS THE TEACHING. A mark impossible on the letter you have just
   typed is greyed rather than hidden, so the keyboard says circumflexes do
   not go on ε or ο, an iota subscript only ever goes under α, η or ω, and ρ
   takes a rough breathing but never a smooth one. Those rules were not
   recalled, they were counted: every base-letter-and-mark pair in the New
   Testament is in MARK_OK below and nothing else is. tools/check_keys.py
   re-derives it from the corpus and fails if the table drifts, and also
   fails if any form the app might ask for needs a key this keyboard cannot
   produce. */

const KEY_ROWS = ["αβγδεζηθ", "ικλμνξοπ", "ρστυφχψω"];

/* What each key shows. A combining mark on its own renders on top of whatever
   precedes it, so each is drawn over a dotted circle. */
const MARK_KEYS = [
  ["́", "◌́", "acute"],
  ["̀", "◌̀", "grave"],
  ["͂", "◌͂", "circumflex"],
  ["̓", "◌̓", "smooth breathing"],
  ["̔", "◌̔", "rough breathing"],
  ["ͅ", "◌ͅ", "iota subscript"],
  ["̈", "◌̈", "diaeresis"],
];

/* MARK_OK, gkLastLetter, gkApplyMark and gkFinalSigma live in js/greek.js.
   They take Greek strings apart and put them back together, which is that
   file's business, and keeping them there lets check_greek_norm go on
   saying greek.js is the ONLY file that touches NFD. This one is the
   layout and the buttons. */

/* Build one. Returns a handle: .value, .set(), .clear(), .el.
   onChange fires on every keystroke; onEnter when the tick is pressed. */
function gkKeyboard(opts) {
  const o = opts || {};
  let value = o.value || "";
  const el = document.createElement("div");
  el.className = "gkb";

  const out = document.createElement("div");
  out.className = "gkb-out";
  out.setAttribute("aria-live", "polite");

  const keys = document.createElement("div");
  keys.className = "gkb-keys";

  function paint() {
    out.textContent = value || "";
    out.classList.toggle("empty", !value);
    const last = gkLastLetter(value);
    keys.querySelectorAll("[data-mark]").forEach(b => {
      const ok = last && MARK_OK[b.dataset.mark].includes(last.base);
      b.classList.toggle("off", !ok);
      b.setAttribute("aria-disabled", ok ? "false" : "true");
      b.classList.toggle("on", !!(ok && last.marks.includes(b.dataset.mark)));
    });
  }

  function change(next) {
    value = gkFinalSigma(next);
    paint();
    if (o.onChange) o.onChange(value);
  }

  function btn(label, cls, fn, attrs) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "gkb-k " + (cls || "");
    b.textContent = label;
    Object.entries(attrs || {}).forEach(([k, v]) => b.setAttribute(k, v));
    /* pointerdown, not click: a keyboard wants to feel immediate, and it
       stops the 300ms tap delay some browsers still apply. */
    b.addEventListener("pointerdown", e => { e.preventDefault(); fn(); });
    return b;
  }

  // the marks, above the letters — always there, dimmed when impossible
  const markRow = document.createElement("div");
  markRow.className = "gkb-row gkb-marks";
  MARK_KEYS.forEach(([m, label, name]) => {
    markRow.appendChild(btn(label, "gkb-m", () => change(gkApplyMark(value, m)),
                            { "data-mark": m, "aria-label": name, title: name }));
  });
  keys.appendChild(markRow);

  // the alphabet, in its own order
  KEY_ROWS.forEach(row => {
    const r = document.createElement("div");
    r.className = "gkb-row";
    [...row].forEach(ch => r.appendChild(btn(ch, "", () => change(value + ch))));
    keys.appendChild(r);
  });

  // backspace, space, enter
  const last = document.createElement("div");
  last.className = "gkb-row gkb-last";
  /* a whole letter and its marks, not one codepoint of it */
  last.appendChild(btn("⌫", "gkb-wide", () => change(gkDropLast(value)),
                       { "aria-label": "backspace" }));
  last.appendChild(btn("␣", "", () => change(value + " "), { "aria-label": "space" }));
  last.appendChild(btn("✓", "gkb-wide gkb-go",
                       () => o.onEnter && o.onEnter(value), { "aria-label": "answer" }));
  keys.appendChild(last);

  el.appendChild(out);
  el.appendChild(keys);
  paint();

  return {
    el,
    get value() { return value; },
    set(v) { change(v || ""); },
    clear() { change(""); },
  };
}


/* ---------------------------------------------------------------------
   Type the form.

   The same question "Produce a real form" asks, with the four options taken
   away. Picking λελύκαμεν from a list needs you to recognise it; producing
   it needs the reduplication, the κ and the ending, which is the whole
   difference between the two drills.

   The order of feedback follows what the evidence supports rather than what
   is easiest to build. Being told only "incorrect" is worth almost nothing
   (d≈0.05); being shown the answer is worth more (0.33); being shown WHERE
   you went wrong is worth most (0.49). So a near miss gets its letters
   flagged and another go, and only then the answer — and after the answer
   there is one more attempt, because retrieving it once after seeing it is
   what makes it stick. Clariana is the reason the near miss and the miss are
   treated differently at all: being told to try again helps you only if you
   were close.
   --------------------------------------------------------------------- */
/* A typed question's address on the schedule: the lemma and the parse, not
   the spelling. "The genitive singular of κόσμος" is one thing to know, and
   it is the same thing tomorrow, so the key has to survive data/forms.js
   being rebuilt with a different verse behind the same cell. */
const typeKey = row => `W${row[1]}:${row[3]}`;

/* Rebuild a typed question from its key, for a review. Null if the form has
   gone from the bank since — the same courtesy gquestion pays a lesson
   question whose chapter has been rewritten. */
function typeRowFor(key) {
  const m = /^W(\d{1,4}):(.{8})$/.exec(key || "");
  if (!m || typeof FORMS === "undefined") return null;
  return FORMS.find(f => +f[1] === +m[1] && f[3] === m[2]) || null;
}

function typeStepFor(key) {
  const want = typeRowFor(key);
  if (!want) return null;
  const others = FORMS.filter(f => +f[1] === +want[1] && f[3] !== want[3])
                      .slice(0, 5).map(f => f[0]);
  return typeStep(want, others);
}

/* One typed question. Split out of typeDrill so a review can put the same
   question back — which is the whole point of giving it a key. */
function typeStep(want, others) {
  const key = typeKey(want);
  return () => {
    const v = VOCAB[+want[1]];
    const head = v ? v[0].split(",")[0] : "";
    const b = document.getElementById("sessBody");
    b.innerHTML =
      `<div class="card"><span class="q-gk">${head}</span>${
        v ? ` <span class="muted">${v[1]}</span>` : ""}
        <p style="margin:10px 0 0;font-size:.95rem">Write the
          <b>${gntParse(want[2], want[3])}</b>.</p></div>
       <div id="kb"></div><div id="fb"></div>`;

    let stage = 0;                       // 0 first go, 1 second go, 2 copy it back
    const fb = document.getElementById("fb");
    const kb = gkKeyboard({ onEnter: () => judge() });
    document.getElementById("kb").appendChild(kb.el);

    const gk = s => `<span class="gk">${s}</span>`;
    /* Three grades, not two. A multiple-choice question is right or wrong so
       it maps onto Good and Again, but a typed one knows more than that:
       first time is Good, right after the letters were flagged is Hard, and
       having to be shown it is Again. Same scale applyGrade already uses. */
    let graded = false;
    const grade = g => {
      if (graded) return;                    // one grade per question
      graded = true;
      gradeGrammarAt(key, g);
    };
    const done = good => {
      fb.innerHTML = `<div class="feedback"><b>${good ? "Correct" : "Now you have it"}</b>
        ${gk(want[0])} — ${gntParse(want[2], want[3])} of ${gk(head)} · ${want[4]}</div>
        <button class="btn" onclick="qi++;step()">Continue</button>`;
      kb.el.querySelectorAll("button").forEach(x => x.disabled = true);
      answerFelt(good, kb.el);
      grade(good ? 2 : (stage === 1 ? 1 : 0));
      if (good) { addXp(3); SESSION_XP += 3; }
    };

    function judge() {
      const m = gkMark(kb.value, want[0], others);
      if (m.verdict === "correct") return done(stage === 0);
      if (m.verdict === "accent") {
        fb.innerHTML = `<div class="feedback"><b>Right</b> — the accent is
          ${gk(want[0])}.</div>
          <button class="btn" onclick="qi++;step()">Continue</button>`;
        kb.el.querySelectorAll("button").forEach(x => x.disabled = true);
        answerFelt(true, kb.el); grade(stage === 0 ? 2 : 1);
        addXp(3); SESSION_XP += 3;
        return;
      }
      if (stage === 2) {                      // copying it back
        fb.innerHTML = `<div class="feedback">Not yet — it is ${gk(want[0])}.</div>`;
        return;
      }
      /* One retry, and only for an attempt that was close enough for another
         go to be worth anything. */
      const retry = stage === 0 &&
        (m.verdict === "close" || m.verdict === "breathing");
      if (retry) {
        stage = 1;
        const said = m.verdict === "breathing"
          ? "The letters are right. Look at the breathing."
          : "Close. The letters marked are the ones to look at again.";
        fb.innerHTML = `<div class="feedback"><b>Not yet</b> ${said}<br>
          <span class="gk">${[...kb.value].map((c, i) =>
            m.wrong.includes(i) ? `<u>${c}</u>` : c).join("")}</span></div>`;
        return;
      }
      stage = 2;
      grade(0);                    // recorded now: an abandoned reveal is still a miss
      const said = m.verdict === "other"
        ? `That is ${gk(m.wrote)}.`
        : "";
      fb.innerHTML = `<div class="feedback"><b>Not quite</b> ${said}
        It is ${gk(want[0])} — write it once more.</div>`;
      kb.clear();
    }
  };
}

/* The drill. Lemmas the learner has met, one parse each, and the other cells
   of the same verb handed to gkMark so "you wrote the perfect" can be said. */
function typeDrill(n = 8) {
  if (typeof FORMS === "undefined") return [];
  const by = {};
  FORMS.forEach(f => (by[f[1]] = by[f[1]] || []).push(f));
  const ok = k => by[k].length >= 3;
  const met = Object.keys(by).filter(k => ok(k) && S.cards[k] && !skipWord(+k));
  const use = met.length >= 6 ? met : Object.keys(by).filter(ok).slice(0, 60);
  return use.sort(() => Math.random() - .5).slice(0, n).map(k => {
    const rows = by[k].slice().sort(() => Math.random() - .5);
    return typeStep(rows[0], rows.slice(1, 6).map(r => r[0]));
  });
}

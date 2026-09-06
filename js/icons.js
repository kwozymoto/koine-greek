/* The app's own graphics: the drill icons, and the moment a badge lands.

   Drawn rather than fetched.

   The Drill screen was twenty-three identical cards. Every one the same size,
   the same chevron, the same weight, distinguishable only by reading its
   title — so finding the listening drill meant reading a list rather than
   looking at one. What was missing is not decoration. It is the one piece of
   information the card never carried: what KIND of thing this is.

   So the icons are keyed by kind, not by drill. Two listening drills share an
   ear because they are the same kind of work; the title says which. An icon
   that meant nothing but "this is drill number nine" would be worse than none.

   SVG, inline, hand-drawn. This app has no build step, ships offline and
   counts its kilobytes: a sprite of line icons costs about two hundred bytes
   each, scales to any screen, takes its colour from the CSS so both themes
   and every group accent work for free, and needs no file to go missing.
   A folder of PNGs would have been the wrong answer to all four.

   One grammar, so they read as a set: a 24-square, 1.6 stroke, round caps and
   joins, no fills, and nothing that needs more than a few strokes to draw. */

const ICON_KIND = {
  /* a card with its word hidden — recall */
  card: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M7 10h6M7 14h4"/>',
  /* options, one of them taken */
  choose: '<path d="M4 7h13M4 12h13M4 17h13"/><circle cx="20" cy="12" r="1.6" fill="currentColor" stroke="none"/>',
  /* sound leaving a mouth */
  listen: '<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 9.5a4 4 0 0 1 0 5"/><path d="M19 7a7.5 7.5 0 0 1 0 10"/>',
  /* a nib, and the stroke it has just made */
  hand: '<path d="M4 20c3-1 4.5-3 6-6"/><path d="M13.5 12.5 18 8a2.1 2.1 0 0 0-3-3l-4.5 4.5-1 4z"/>',
  /* keys */
  type: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6 9.5h.01M9.5 9.5h.01M13 9.5h.01M16.5 9.5h.01M6 13h.01M9.5 13h.01M13 13h.01M16.5 13h.01M8 16h8"/>',
  /* a paradigm, one cell still empty */
  grid: '<rect x="3.5" y="4.5" width="17" height="15" rx="1.5"/><path d="M3.5 9.5h17M3.5 14.5h17M9.5 4.5v15M15 4.5v15"/><rect x="9.5" y="9.5" width="5.5" height="5" fill="currentColor" opacity=".22" stroke="none"/>',
  /* the same, against a clock */
  sprint: '<circle cx="12" cy="13" r="7.5"/><path d="M12 9v4l2.6 1.7M9.5 2.5h5"/>',
  /* a word, and the label underneath it */
  parse: '<path d="M5 7h14"/><path d="M5 10.5V12a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 12v-1.5"/><path d="M12 13.5V16"/><path d="M8 19h8"/>',
  /* forms chained to one another */
  parts: '<circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="12" r="2.6"/><path d="M8.6 12h6.8"/><path d="M12 6.5v2M12 15.5v2"/>',
  /* a slot, and what goes in it */
  cases: '<path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5z"/><path d="M12 12v8M4 8.5 12 13l8-4.5"/>',
  /* two letters, one accent apart */
  pair: '<circle cx="8.5" cy="14" r="4.5"/><circle cx="15.5" cy="14" r="4.5"/><path d="M14 6.5l3-2.5"/>',
  /* lines of text, one word picked out */
  read: '<path d="M4 6.5h16M4 17.5h16"/><path d="M4 12h4M15 12h5"/><rect x="9" y="9.5" width="4.5" height="5" rx="1"/>',
  /* two strands interleaving */
  mix: '<path d="M3 7h4c5 0 5 10 10 10h4"/><path d="M3 17h4c5 0 5-10 10-10h4"/><path d="M18.5 4.5 21 7l-2.5 2.5M18.5 14.5 21 17l-2.5 2.5"/>',
  /* the letterform itself, because here that is the subject */
  letters: '<text x="12" y="17.5" text-anchor="middle" font-size="16" font-family="var(--gk)" fill="currentColor" stroke="none">α</text>',
};

/* Which kind each drill is. A title missing here falls back to `choose`,
   which is what most drills are, so a new drill is never iconless — and
   tools/check_icons.py fails if one is left to that fallback by accident. */
const DRILL_KIND = {
  "Vocabulary due now": "card",
  "Learn 5 new words": "card",
  "Greek → English": "choose",
  "English → Greek": "choose",
  "The article": "grid",
  "Verb parsing": "parse",
  "Alphabet": "letters",
  "Listening — letters": "listen",
  "Listening — words": "listen",
  "Parsing builder": "parse",
  "Parse a real form": "parse",
  "Principal parts": "parts",
  "Case functions": "cases",
  "Look-alikes": "pair",
  "Write the letters": "hand",
  "Write it from memory": "hand",
  "Mixed grammar review": "mix",
  "Fill the grid": "grid",
  "Paradigm sprint": "sprint",
  "Produce a real form": "choose",
  "Write a real form": "type",
  "Read a sentence": "read",
  "Daily mix": "mix",
};

/* A hue per group, so the eye can find its way down the screen before it has
   read anything. Four are the app's existing accents; violet is new and is
   here rather than in the palette because nothing else uses it. */
const GROUP_TONE = {
  "Vocabulary": "gold",
  "Reading": "blue",
  "Grammar": "rust",
  "Paradigms": "green",
  "Letters and sounds": "violet",
  "Everything": "gold",
  "More": "muted",
};

function drillIcon(title) {
  const kind = DRILL_KIND[title] || "choose";
  return `<svg class="dicon" viewBox="0 0 24 24" aria-hidden="true" fill="none"
    stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
    stroke-linejoin="round">${ICON_KIND[kind]}</svg>`;
}


/* ---------------------------------------------------------------------
   Earning a badge.

   It used to be a toast: "🎓  Every chapter unlocked", in the same grey
   panel that says a card was buried or a note was saved. Twenty-seven
   chapters of work and the app acknowledged it in the voice it uses for
   an undo.

   So a badge now gets a moment of its own — a ring that opens, the emblem
   coming up to meet it, and eight sparks going out. It is CSS keyframes and
   nothing else: no library, no canvas, no timers driving frames, which
   matters in an app that has to work offline and start instantly.

   It dismisses itself, and a tap takes it early. Under prefers-reduced-
   motion it fades in and out and nothing travels, because a celebration
   nobody asked for should not be the thing that makes an app unusable. */
function badgeFanfare(badge) {
  const host = document.createElement("div");
  host.className = "fanfare";
  host.innerHTML =
    `<div class="fan-card">
       <div class="fan-ring"></div>
       ${[...Array(8)].map((_, i) =>
         `<i class="fan-spark" style="--a:${i * 45}deg"></i>`).join("")}
       <div class="fan-emblem">${badge.e}</div>
     </div>
     <div class="fan-say"><b>${badge.t}</b><span>${badge.d}</span></div>`;
  const go = () => {
    host.classList.add("out");
    setTimeout(() => host.remove(), 320);
  };
  host.addEventListener("pointerdown", go);
  document.body.appendChild(host);
  /* long enough to read the line under it, short enough not to be in the way */
  setTimeout(go, 2600);
}


/* ---------------------------------------------------------------------
   A ring that fills.

   Today already had one and it jumped: strokeDashoffset was assigned, so
   the circle simply was however full it was. The work that filled it had
   just been done and the app showed the result rather than the change.

   So the arc now has a transition and is mounted empty, which means every
   ring in the app sweeps up to its value on the way in. That is the whole
   trick — one CSS property and a frame's delay — and it is why the session
   summary can reuse it without any code of its own.

   The circumference is 415 because r=66, and that number was already in
   app.js twice before this file existed. It is here once now. */
const RING_LEN = 415;

/* One ring. `tone` is a CSS colour, `big` the number in the middle. */
function ringHtml(pct, big, small, cls) {
  return `<div class="ring ${cls || ""}">
    <svg width="150" height="150" viewBox="0 0 150 150">
      <circle cx="75" cy="75" r="66" fill="none" stroke="var(--line)" stroke-width="10"/>
      <circle class="ring-arc" cx="75" cy="75" r="66" fill="none"
        stroke="var(--ring-tone, var(--gold))" stroke-width="10" stroke-linecap="round"
        stroke-dasharray="${RING_LEN}" stroke-dashoffset="${RING_LEN}"
        data-fill="${Math.max(0, Math.min(1, pct))}"/>
    </svg>
    <div class="mid"><span class="big">${big}</span>
      <small class="muted">${small}</small></div>
  </div>`;
}

/* Set the real value, having first made the browser commit to the empty one.
   Both values in one style recalculation and nothing moves, so the two have
   to be separated — and reading a layout property is what separates them.

   This began as a pair of nested requestAnimationFrames, which is the usual
   advice and is wrong here: rAF does not run while the page is not being
   painted, so a ring mounted in a tab that was hidden, or in a browser
   throttling a background frame, simply stayed empty until something else
   caused a repaint. Testing caught it because the pane was not painting.
   Forcing the reflow does not care whether anyone is looking. */
function ringFill(root) {
  (root || document).querySelectorAll(".ring-arc[data-fill]").forEach(arc => {
    void arc.getBoundingClientRect().width;          // commit the empty value
    arc.style.strokeDashoffset = RING_LEN - RING_LEN * (+arc.dataset.fill);
  });
}

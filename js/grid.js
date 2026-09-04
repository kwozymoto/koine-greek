/* ============================================================
   PARADIGMS — three ways to practise the tables the app already has
   ============================================================
   Twenty-two grids sat in data/paradigms.js as reference, and
   tools/check_paradigms.py holds all 424 of their cells to the parse codes
   in data/gnt/. What was missing was any way to *use* them. A table you can
   read is not a table you can produce, and producing them is what "learn
   your paradigms" has always meant — it is the one part of Greek that comes
   down to repetition, and repetition is what an app is for.

   Nothing here is authored. Every round is derived from data/paradigms.js
   when the page loads: the grid, its row labels, its column headings and
   every answer come out of the same tables the reference screen shows, so
   the drill and the reference cannot drift apart. Add a table there and it
   becomes playable; correct one and the drill is corrected with it.
   tools/check_grids.py asserts the derivation, so a table that quietly stops
   being playable is a build failure rather than a silent disappearance.

   Loaded before js/app.js. Only declarations at the top level — everything
   it needs from app.js (S, today, applyGrade, mcq, VOCAB) is called, never
   read while the file is being evaluated. */

/* The most a single round asks for. Twelve is two full columns of a verb
   paradigm, or one noun of the third declension — about a minute, which is
   how long a thing can be before you stop doing it on a phone. */
const GRID_CELLS = 12;

const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

let GRIDS = null;

/* ---- deriving the rounds ---------------------------------------------
   A paradigm grid, as opposed to the other tables in that file, is one with
   a caption, a header row that is all <th>, and data rows that begin with a
   <th> label. That description excludes exactly the four tables that are not
   paradigms — the preposition list, the look-alikes, the discourse markers,
   and the principal parts, whose rows are labelled by verb rather than by
   slot and which have ppDrill already. Structural rather than a list of
   titles, so data/paradigms.js stays the one source of truth. */
function gridRounds() {
  if (GRIDS) return GRIDS;
  GRIDS = [];
  if (typeof PARADIGMS === "undefined") return GRIDS;
  const host = document.createElement("div");

  PARADIGMS.forEach(p => {
    host.innerHTML = p.html;
    [...host.querySelectorAll("table")].forEach(tb => {
      const cap = tb.querySelector("caption");
      if (!cap) return;
      const trs = [...tb.rows].filter(r => r.cells.length);
      if (trs.length < 3) return;
      const head = [...trs[0].cells];
      if (head.length < 3 || head.some(c => c.tagName !== "TH")) return;
      const cols = head.slice(1).map(c => c.textContent.trim());

      const rows = [];
      let shaped = true;
      for (let i = 1; i < trs.length && shaped; i++) {
        const cs = [...trs[i].cells];
        if (!cs.length || cs[0].tagName !== "TH") { shaped = false; break; }
        let c = 0;
        const cells = cs.slice(1).map(td => {
          const span = Math.max(1, +td.colSpan || 1);
          const cell = { t: td.classList.contains("g") ? td.textContent.trim() : null, span, c };
          c += span;
          return cell;
        });
        rows.push({ label: cs[0].textContent.trim(), cells });
      }
      if (!shaped || !rows.length) return;

      const ncol = Math.max(...rows.map(r => r.cells.reduce((a, x) => a + x.span, 0)));
      const count = (a, b) =>
        rows.reduce((n, r) => n + r.cells.filter(x => x.t && x.c >= a && x.c < b).length, 0);
      if (count(0, ncol) < 6) return;

      /* Split into rounds of at most GRID_CELLS, cutting only between whole
         columns and never through a colspan — the infinitives table has one
         form covering middle and passive, and a cut there would ask for half
         a cell. A single column longer than the cap is left whole.

         Then tightened. Filling to the cap and taking what is left gave the
         second declension a round of twelve and a runt of four, when the
         same two rounds could have been eight and eight. So: find the
         smallest cap that still yields as few rounds as the full one does,
         and cut at that. Cheap — these tables are five columns wide. */
      const cuttable = c => rows.every(r => r.cells.every(x => x.c >= c || x.c + x.span <= c));
      const chunkAt = lim => {
        const out = [];
        let start = 0, prev = 0;
        for (let c = 1; c <= ncol; c++) {
          if (c < ncol && !cuttable(c)) continue;
          if (count(start, c) > lim && prev > start) { out.push([start, prev]); start = prev; }
          prev = c;
        }
        out.push([start, ncol]);
        return out;
      };
      const widest = Math.max(...Array.from({ length: ncol }, (_, c) => count(c, c + 1)));
      const fewest = chunkAt(GRID_CELLS).length;
      let fit = GRID_CELLS;
      for (let c = widest; c < GRID_CELLS; c++)
        if (chunkAt(c).length === fewest) { fit = c; break; }
      const chunks = chunkAt(fit);

      chunks.forEach(([a, b]) => {
        if (!count(a, b)) return;
        GRIDS.push({
          key: `${p.t}|${cap.textContent.trim()}|${a}`,
          title: p.t,
          caption: cap.textContent.trim(),
          /* Named by its columns when the table was split, so the three
             rounds of λύω read "Pres and Impf", "Fut and Aor", "Perf" rather
             than three identical lines in the list. */
          part: chunks.length > 1 ? cols.slice(a, b).filter(Boolean).join(" and ") : "",
          cols, a, b, n: count(a, b),
          rows: rows
            .map(r => ({ label: r.label, cells: r.cells.filter(x => x.c >= a && x.c < b) }))
            .filter(r => r.cells.length)
        });
      });
    });
  });
  return GRIDS;
}

const gridName = g => g.title + (g.part ? ` · ${g.part}` : "");
/* The heading a cell sits under. A colspan covers two, and saying so beats
   naming the first and hoping — λύεσθαι really is both middle and passive. */
const gridCol = (g, cell) =>
  g.cols.slice(cell.c, cell.c + cell.span).filter(Boolean).join(" / ");

/* ---- the schedule -----------------------------------------------------
   Its own map rather than S.gcards: those keys are lesson question
   addresses, gquestion() parses them, and a grid key put there would be
   dropped by gdueList as unreadable. The same scheduler though — there is
   one algorithm in this app and not two. `best` rides on the card because it
   belongs to the same round and nothing else ever reads it. */
function gridCard(k) {
  if (!S.grids) S.grids = {};
  if (!S.grids[k]) S.grids[k] = { ease: 2.5, ivl: 0, due: today(), reps: 0, lapses: 0 };
  return S.grids[k];
}
function gridGrade(k, g) { applyGrade(gridCard(k), g); save(); }
const gridStarted = () => gridRounds().filter(g => S.grids && S.grids[g.key]);
const gridDue = () => gridStarted().filter(g => S.grids[g.key].due <= today());

/* Due first, then rounds never played, then the rest — so the schedule leads
   and the drill still works on a cold install. */
function gridQueue(n) {
  const shuf = a => a.slice().sort(() => Math.random() - .5);
  const due = gridDue();
  const fresh = gridRounds().filter(g => !S.grids || !S.grids[g.key]);
  const rest = gridStarted().filter(g => S.grids[g.key].due > today());
  return [...shuf(due), ...shuf(fresh), ...shuf(rest)].slice(0, n);
}

/* ============================================================
   FILL THE GRID
   ============================================================
   The real table with its cells emptied and its forms shuffled underneath.
   Tap a cell, tap the form that belongs in it; the next empty cell arms
   itself, so anyone who knows the order never touches the grid at all and
   just taps the forms down the column.

   Matching is by text and not by tile, which is what makes the duplicates
   work: ἔλυον is both first singular and third plural of the imperfect, and
   either of its two tiles may fill either of its two cells. */
let GRID_TIMER = null;
function gridStop() { if (GRID_TIMER) { clearInterval(GRID_TIMER); GRID_TIMER = null; } }

function gridFill(g) {
  return () => {
    gridStop();
    const slots = [];
    g.rows.forEach((r, ri) => r.cells.forEach((c, ci) => {
      if (c.t) slots.push({ r: ri, c: ci, want: c.t, got: null });
    }));
    const at = (ri, ci) => slots.findIndex(s => s.r === ri && s.c === ci);
    const tray = slots.map(s => s.want).sort(() => Math.random() - .5);
    let live = 0, errs = 0;
    const t0 = Date.now();
    const best = gridCard(g.key).best;

    const body = document.getElementById("sessBody");
    body.innerHTML = `
      <div class="between" style="margin-bottom:8px">
        <span class="muted" style="font-size:.8rem">${gridName(g)}</span>
        <span class="muted" style="font-size:.8rem"><span id="pgClock">0:00</span>${
          best ? ` · best ${mmss(best)}` : ""}</span>
      </div>
      <div class="card pgcard"><div class="pgwrap">
        <table class="pg">${
          /* Only when the round is the whole table. Split, the caption is a
             claim about columns that are not on screen — "Three feminine
             patterns and the masculine" over one column of ἀγάπη. */
          g.part ? "" : `<caption>${g.caption}</caption>`}
        <tr><th></th>${g.cols.slice(g.a, g.b).map(c => `<th>${c}</th>`).join("")}</tr>
        ${g.rows.map((r, ri) => `<tr><th>${r.label}</th>${r.cells.map((c, ci) =>
          c.t ? `<td class="pgs" colspan="${c.span}" data-s="${at(ri, ci)}"></td>`
              : `<td colspan="${c.span}"></td>`).join("")}</tr>`).join("")}
        </table>
      </div></div>
      <p class="pgnow" id="pgNow"></p>
      <div class="tray" id="pgTray">${tray.map((t, k) =>
        `<button data-k="${k}"><span class="gk">${t}</span></button>`).join("")}</div>
      <div id="fb"></div>`;

    const nowEl = document.getElementById("pgNow");
    const clock = document.getElementById("pgClock");
    // Never zero: a stored best of 0 is falsy, so it would read as no best at
    // all and "your best yet" could never be beaten.
    const secs = () => Math.max(1, Math.round((Date.now() - t0) / 1000));

    GRID_TIMER = setInterval(() => {
      // the session moved on and took the element with it
      if (!document.body.contains(clock)) return gridStop();
      clock.textContent = mmss(secs());
    }, 1000);

    function arm(i) {
      live = i;
      body.querySelectorAll(".pgs").forEach(td => td.classList.toggle("live", +td.dataset.s === i));
      const s = slots[i];
      const col = s ? gridCol(g, g.rows[s.r].cells[s.c]) : "";
      nowEl.innerHTML = s ? `<b>${g.rows[s.r].label}</b>${col ? ` · ${col}` : ""}` : "";
    }
    const nextEmpty = from => {
      for (let k = 1; k <= slots.length; k++) {
        const i = (from + k) % slots.length;
        if (!slots[i].got) return i;
      }
      return -1;
    };

    body.querySelectorAll(".pgs").forEach(td => {
      td.onclick = () => { const i = +td.dataset.s; if (!slots[i].got) arm(i); };
    });

    document.getElementById("pgTray").onclick = e => {
      const btn = e.target.closest("button");
      if (!btn || btn.disabled) return;
      const s = slots[live];
      if (!s || s.got) return;
      if (tray[+btn.dataset.k] !== s.want) {
        errs++;
        btn.classList.remove("no"); void btn.offsetWidth; btn.classList.add("no");
        answerFelt(false, null);
        return;
      }
      s.got = s.want;
      btn.disabled = true; btn.classList.add("gone");
      const td = body.querySelector(`.pgs[data-s="${live}"]`);
      td.innerHTML = `<span class="gk">${s.got}</span>`;
      td.classList.add("on");
      // No element passed: the XP for a grid is paid once at the end, and a
      // "+2" floating off every cell would be promising something else.
      answerFelt(true, null);
      const nx = nextEmpty(live);
      if (nx >= 0) return arm(nx);

      /* Done. Errors, not time, set the grade: a slow correct table is
         knowledge and a fast wrong one is not. The clock is there to make
         you want to come back, not to mark you. */
      gridStop();
      const t = secs();
      const pb = !best || t < best;
      gridGrade(g.key, errs === 0 ? 3 : errs <= 2 ? 2 : errs <= 4 ? 1 : 0);
      const card = gridCard(g.key);
      if (pb) { card.best = t; save(); }
      const xp = 3 + Math.max(0, 5 - errs);
      addXp(xp); SESSION_XP += xp;
      body.querySelectorAll(".pgs").forEach(x => x.classList.remove("live"));
      nowEl.innerHTML = "";
      document.getElementById("fb").innerHTML =
        `<div class="feedback"><b>${errs ? "Filled" : "Clean sheet"}</b>
          ${mmss(t)}${errs ? ` · ${errs} wrong ${errs === 1 ? "try" : "tries"}` : ""}${
          // "your best yet" needs something to be better than
          !best ? "" : pb ? " · <b>your best yet</b>" : ` · best ${mmss(best)}`}<br>
          <span class="muted">${card.ivl
            ? `Back in ${card.ivl} day${card.ivl === 1 ? "" : "s"}.`
            : "Back again today — that one has not settled."}</span></div>
         <button class="btn" onclick="qi++;step()">Continue</button>`;
    };

    arm(0);
  };
}

function gridDrill(n = 3) {
  const q = gridQueue(n);
  return q.length ? q.map(gridFill) : [];
}

/* ============================================================
   THE SPRINT
   ============================================================
   The same data one cell at a time, four ways, as fast as you can go. This
   is the half of paradigm learning the grid does not reach: automaticity.
   Knowing the table is not the same as knowing it fast enough for an ending
   to mean something while you are still reading the sentence.

   The distractors come from the same column, which is what makes it a
   paradigm question rather than a vocabulary one — four aorists, and the
   only difference between them is person and number. It also earns the stem
   hint: where all four share an opening, it is stripped off and shown once,
   so what is asked for is the ending, and endings are what recur. */
function gridSprint(n = 14) {
  const pool = [];
  gridRounds().forEach(g => {
    const cols = {};
    g.rows.forEach(r => r.cells.forEach(c => {
      if (c.t) (cols[c.c] = cols[c.c] || []).push({ row: r.label, t: c.t, cell: c });
    }));
    Object.values(cols).forEach(list => {
      /* Four *distinct* forms, not four cells. The neuter article is τό at
         both nominative and accusative, and a question offering τό twice
         marks one of them wrong for being the second one. */
      if (new Set(list.map(x => x.t)).size < 4) return;
      list.forEach(x => pool.push({ g, list, ...x }));
    });
  });
  if (!pool.length) return [];

  const lcp = a => {
    let i = 0;
    while (i < a[0].length && a.every(s => s[i] === a[0][i])) i++;
    return a[0].slice(0, i);
  };

  return pool.sort(() => Math.random() - .5).slice(0, n).map(q => {
    const others = [...new Set(q.list.map(x => x.t))].filter(t => t !== q.t)
      .sort(() => Math.random() - .5).slice(0, 3);
    const forms = [q.t, ...others];
    const pre = lcp(forms);
    // Two letters is where a stem starts being a stem, rather than a letter
    // the four happen to share.
    const cut = pre.length >= 2 ? pre.length : 0;
    const show = f => `<span class="gk">${cut ? "-" + f.slice(cut) : f}</span>`;
    const opts = forms.slice().sort(() => Math.random() - .5).map(show);
    const col = gridCol(q.g, q.cell);
    return mcq(
      `${cut ? `<span class="q-gk lg">${pre}—</span><br>` : ""}
       <span style="font-size:.95rem">${q.g.title}</span>
       <p class="muted" style="font-size:.86rem;margin:6px 0 0">${q.row}${col ? ` · ${col}` : ""}</p>`,
      opts, opts.indexOf(show(q.t)),
      `<span class="gk">${q.t}</span> — ${q.row}${col ? `, ${col}` : ""} · ${q.g.caption}`,
      null,
      // A miss puts the whole table back in tomorrow's queue: you did not get
      // one cell wrong, you have not got the paradigm.
      ok => { if (!ok) gridGrade(q.g.key, 0); });
  });
}

/* ============================================================
   PRODUCE A REAL FORM
   ============================================================
   "Parse a real form" runs the other way: it shows you ἐγένετο and asks what
   it is. This names the slot and asks for the word, which is the harder
   direction and the one preaching needs — you know you want the aorist, and
   the question is what the aorist looks like.

   Every option is a real form of the same lemma out of data/forms.js, so
   there is nothing invented to choose between, and tools/check_forms.py has
   already put each of them back to the verse it came from. */
function formDrill(n = 10) {
  if (typeof FORMS === "undefined") return [];
  const by = {};
  FORMS.forEach(f => (by[f[1]] = by[f[1]] || []).push(f));
  const ok = k => by[k].length >= 4;
  const met = Object.keys(by).filter(k => ok(k) && S.cards[k] && !skipWord(+k));
  const use = met.length >= 6 ? met : Object.keys(by).filter(ok).slice(0, 60);
  if (!use.length) return [];

  return use.sort(() => Math.random() - .5).slice(0, n).map(k => {
    const rows = by[k].slice().sort(() => Math.random() - .5);
    const want = rows[0];
    /* A different parse and a different spelling — and distinct from each
       other. Two options reading the same word make one of them wrong for
       being second in the list, which is not a thing the learner can see. */
    const wrong = [], spelt = new Set([want[0]]);
    for (const r of rows) {
      if (wrong.length === 3) break;
      if (r[3] === want[3] || spelt.has(r[0])) continue;
      spelt.add(r[0]); wrong.push(r);
    }
    if (wrong.length < 3) return null;
    const show = r => `<span class="gk">${r[0]}</span>`;
    const opts = [want, ...wrong].sort(() => Math.random() - .5).map(show);
    const v = VOCAB[+k];
    const head = v ? v[0].split(",")[0] : "";
    return mcq(
      `<span class="q-gk">${head}</span>${v ? ` <span class="muted">${v[1]}</span>` : ""}
       <p style="margin:10px 0 0;font-size:.95rem">Which is the
         <b>${gntParse(want[2], want[3])}</b>?</p>`,
      opts, opts.indexOf(show(want)),
      `<span class="gk">${want[0]}</span> — ${gntParse(want[2], want[3])} of
       <span class="gk">${head}</span> · ${want[4]}`);
  }).filter(Boolean);
}

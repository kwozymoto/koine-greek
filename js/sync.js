/* Cross-device sync. Opt-in. The first device GENERATES a sync code and the
   user copies it to the others; the code is hashed (SHA-256) client-side and
   only the hash travels, acting as both address and secret on a dumb
   key-value store (see sync-worker/).

   WHY A GENERATED CODE. Sync began with a phrase the user invented, and the
   phrase alone was the address. Two people who chose the same one shared a
   deck and silently merged into each other; and a common phrase could be
   guessed, read, overwritten or deleted by anyone who tried it. A username
   narrows the first and not the second, and making usernames unique would
   need accounts, which this app does not have. A code of 20 random base-32
   characters -- 100 bits -- cannot collide and cannot be guessed, and the
   server does not change. Phrases already in use keep working, typed into the
   same box, and a phrase user is offered a switch.

   Model: pull-merge-push. Every card carries a ts of its last grading, so
   merging two devices' decks keeps whichever review of each item happened
   most recently — vocabulary and grammar questions alike. Counters take the
   max, sets take the union, and device preferences (goal, text size, sound,
   and where this device was reading) stay local.

   SYNC_URL is empty until the worker is deployed; the UI hides itself
   so the app works identically without the backend. */

const SYNC_URL = "https://koine-sync.fraser-e76.workers.dev";
const SYNC_KEY = "koine.sync";    // localStorage: {id, last}

let SYNC = (() => {
  try { return JSON.parse(localStorage.getItem(SYNC_KEY)) || null; }
  catch (e) { return null; }
})();
let syncTimer = null, syncBusy = false;

function syncSave() {
  try { localStorage.setItem(SYNC_KEY, JSON.stringify(SYNC)); } catch (e) {}
}

async function sha256hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}
async function syncIdFromPhrase(phrase) { return sha256hex(phrase.trim()); }

/* Crockford's base 32: no I, L, O or U, so nothing is mistaken for 1 or 0,
   and a code read aloud or copied by hand survives it. */
const CODE_ABC = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
function newSyncCode() {
  const r = crypto.getRandomValues(new Uint8Array(20));
  return [...r].map(b => CODE_ABC[b & 31]).join("");
}
/* What was typed, as a bare 20-character code -- or null if it is not one.
   Case, spaces, dashes and the KOINE prefix are forgiven, and the letters
   people confuse with digits are read as the digits. */
function codeFromInput(text) {
  let t = (text || "").toUpperCase().replace(/^\s*KOINE/, "").replace(/[\s\-_.]/g, "");
  t = t.replace(/[IL]/g, "1").replace(/O/g, "0").replace(/U/g, "V");
  return /^[0-9A-HJKMNP-TV-Z]{20}$/.test(t) ? t : null;
}
function showCode(code) {
  return "KOINE-" + code.match(/.{4}/g).join("-");
}
/* A domain prefix, so a code can never hash to the same address as a phrase
   that happened to be the same twenty characters. */
async function syncIdFromCode(code) { return sha256hex("koine-sync-code:" + code); }

/* ---- merging ---- */
/* A timestamp from a device with a wrong clock would otherwise win every
   future merge. Anything more than a day ahead is not trusted. */
const CLAMP = () => Date.now() + 86400000;
function tsOf(c) { const t = +c.ts || 0; return t > CLAMP() ? 0 : t; }

function pickCard(a, b) {
  if (tsOf(a) !== tsOf(b)) return tsOf(a) > tsOf(b) ? a : b;
  if ((a.reps || 0) !== (b.reps || 0)) return (a.reps || 0) > (b.reps || 0) ? a : b;
  return (a.due || "") >= (b.due || "") ? a : b;
}
function mergeCards(a, b) {
  const out = {};
  for (const k of new Set([...Object.keys(a || {}), ...Object.keys(b || {})])) {
    const x = (a || {})[k], y = (b || {})[k];
    out[k] = !x ? y : (!y ? x : pickCard(x, y));
  }
  return out;
}
function mergeStates(local, remote) {
  const out = JSON.parse(JSON.stringify(local));
  out.cards  = mergeCards(local.cards, remote.cards);
  // Grammar questions are scheduled the same way and merge the same way.
  out.gcards = mergeCards(local.gcards, remote.gcards);
  // So are the passage words the course does not teach, keyed by lemma.
  out.lcards = mergeCards(local.lcards, remote.lcards);
  /* And the paradigm rounds — except that each also carries the fastest fill
     of that grid, and fastest is the smaller number. The one place in this
     file where max is the wrong answer. Copied rather than mutated:
     mergeCards hands back whichever card it picked, and writing through it
     would edit S itself before the caller has compared them. */
  /* Notes you wrote on a card. Union, and where both devices have written
     one for the same word the local wins — you are on this device, looking at
     it, and a silent overwrite from elsewhere is the worse surprise. Same
     rule as myGloss, for the same reason. */
  out.notes = Object.assign({}, remote.notes || {}, local.notes || {});
  /* Parsing by category, [asked, missed, when]: the newer of the two for
     each, like a card. Adding the counts would double them on every sync. */
  const pts = e => { const t = +(e && e[2]) || 0; return t > CLAMP() ? 0 : t; };
  out.parsing = Object.assign({}, remote.parsing || {});
  for (const [k, e] of Object.entries(local.parsing || {})) {
    const r = out.parsing[k];
    if (!r || pts(e) >= pts(r)) out.parsing[k] = e;
  }
  out.grids = mergeCards(local.grids, remote.grids);
  for (const k of Object.keys(out.grids)) {
    const bs = [(local.grids || {})[k], (remote.grids || {})[k]]
      .map(c => c && c.best).filter(b => typeof b === "number" && b > 0);
    if (bs.length) out.grids[k] = Object.assign({}, out.grids[k], { best: Math.min(...bs) });
  }
  out.xp     = Math.max(local.xp || 0, remote.xp || 0);
  /* Take the streak from whichever device owns the newer last-studied date;
     Math.max resurrected a long-dead streak from an idle device. */
  out.streak = ((local.last || "") >= (remote.last || "")) ? (local.streak || 0) : (remote.streak || 0);
  out.best   = Math.max(local.best || 0, remote.best || 0);
  out.seen   = Math.max(local.seen || 0, remote.seen || 0);
  out.lessons = [...new Set([...(local.lessons || []), ...(remote.lessons || [])])].sort((x, y) => x - y);
  out.badges  = [...new Set([...(local.badges || []), ...(remote.badges || [])])];
  // Setting a leech aside on one device should hold on the other; without
  // this the remote list was simply discarded.
  out.suspended = [...new Set([...(local.suspended || []), ...(remote.suspended || [])])];
  // Take the more recent export so the backup reminder is not shown on one
  // device because the backup was made on the other.
  out.exported = [local.exported, remote.exported].filter(Boolean).sort().pop() || null;
  /* The later of the two, so switching devices cannot buy a second rest day
     in the same week. */
  out.restUsed = [local.restUsed, remote.restUsed].filter(Boolean).sort().pop() || null;
  /* The passage you pinned for this week's sermon should follow you from the
     desk to the phone. S.where — the reading position — deliberately does
     not: that is where *this* device was. */
  const pa = local.pin, pb = remote.pin;
  out.pin = (pa && pb) ? ((+pa.ts || 0) >= (+pb.ts || 0) ? pa : pb) : (pa || pb || null);
  out.last    = [local.last, remote.last].filter(Boolean).sort().pop() || null;
  const da = local.dayOfReviews || "", db = remote.dayOfReviews || "";
  if (da === db) out.reviewsToday = Math.max(local.reviewsToday || 0, remote.reviewsToday || 0);
  else if (db > da) { out.reviewsToday = remote.reviewsToday || 0; out.dayOfReviews = db; }

  /* The alphabet: the best either device has managed for each letter. It is
     a claim about you, not about a device, so settling delta on the phone
     should retire it on the desktop too. Added late — mergeStates copies the
     local object wholesale, so nothing was ever lost, but a change here
     reached no other device until it was named. */
  out.alpha = {};
  for (const k of new Set([...Object.keys(local.alpha || {}),
                           ...Object.keys(remote.alpha || {})]))
    out.alpha[k] = Math.max(+(local.alpha || {})[k] || 0, +(remote.alpha || {})[k] || 0);

  /* The day each letter's score last moved, which caps it at one a day. The
     later of the two, because the cap is a claim about a person and not a
     device: two points on one day across two phones is still two points on
     one day. */
  out.alphaDay = {};
  for (const k of new Set([...Object.keys(local.alphaDay || {}),
                           ...Object.keys(remote.alphaDay || {})])) {
    const a = (local.alphaDay || {})[k] || "", b = (remote.alphaDay || {})[k] || "";
    out.alphaDay[k] = a > b ? a : b;
  }

  /* The whole-alphabet check. Passing is a fact about you and never comes
     undone, so it survives from either side; the schedule takes whichever
     device is further through, and the earlier due date, so a check is never
     skipped because the other phone had already been told to wait. */
  const ka = local.alphaCheck, kb = remote.alphaCheck;
  out.alphaCheck = (ka && kb)
    ? { ...(( +ka.reps || 0) >= (+kb.reps || 0) ? ka : kb),
        passed: !!(ka.passed || kb.passed),
        due: (ka.due < kb.due ? ka.due : kb.due) }
    : (ka || kb || null);

  /* Where a part-way chapter stopped: whichever device read further. */
  const la = local.lessonPart, lb = remote.lessonPart;
  out.lessonPart = (la && lb)
    ? (la.id !== lb.id ? (la.id > lb.id ? la : lb) : (la.part >= lb.part ? la : lb))
    : (la || lb || null);

  /* Today's ticks, but only if both devices mean the same day — a plan from
     yesterday must not tick today's boxes. */
  const pl = local.plan, pr = remote.plan;
  out.plan = (pl && pr && pl.day === pr.day)
    ? { day: pl.day, done: [...new Set([...(pl.done || []), ...(pr.done || [])])],
        // work past the plan, counted on whichever device did more of it
        extra: Math.max(pl.extra || 0, pr.extra || 0) }
    : ([pl, pr].filter(Boolean).sort((x, y) => (x.day > y.day ? -1 : 1))[0] || null);

  /* A gloss you wrote yourself. Union, and where both devices have written
     one for the same word the local wins — you are on this device, looking at
     it, and a silent overwrite from elsewhere is the worse surprise. */
  out.myGloss = Object.assign({}, remote.myGloss || {}, local.myGloss || {});

  /* The passage being worked. It is one choice, not an accumulation, so the
     newer of the two wins outright; ties go to the local copy. Its word lists
     are derived from the passage and identical on both sides. */
  const fa = local.focus, fb = remote.focus;
  out.focus = (fa && fb) ? ((fa.started || "") >= (fb.started || "") ? fa : fb)
                         : (fa || fb || null);
  const seen = new Set();
  out.focusDone = [...(local.focusDone || []), ...(remote.focusDone || [])]
    .filter(r => r && r.ref && !seen.has(r.ref + r.on) && seen.add(r.ref + r.on))
    .sort((x, y) => (y.on || "").localeCompare(x.on || "")).slice(0, 20);

  // goal and gk stay local: they are per-device preferences.
  return out;
}

/* ---- transport ---- */
/* Returns "ok" | "empty" | "fail". The caller must be able to tell "the
   server has nothing yet" from "the request failed" — pushing on the second
   would write this device's empty deck over a good remote one. */
async function syncPull() {
  if (!SYNC_URL || !SYNC || !SYNC.id || syncBusy) return "fail";
  syncBusy = true;
  try {
    const r = await fetch(SYNC_URL + "/sync/" + SYNC.id, { cache: "no-store" });
    if (r.status === 404) return "empty";            // nothing remote yet
    if (!r.ok) throw new Error(r.status);
    const env = await r.json();
    if (!env || typeof env.data !== "object") return "empty";
    const merged = mergeStates(S, env.data);
    const changedLocal  = JSON.stringify(merged) !== JSON.stringify(S);
    /* goal / gk / sfx are deliberately per-device, so they are not compared —
       including them would push on every single pull. */
    /* Everything mergeStates merges has to be here too, or a change to it
       alone is merged in but never pushed back out — which is what happened
       to alpha, plan and lessonPart when they were added. */
    const sig = o => JSON.stringify([o.cards, o.gcards, o.xp, o.streak, o.best, o.last,
                                     o.lessons, o.badges, o.suspended, o.restUsed, o.pin,
                                     o.alpha, o.alphaDay, o.alphaCheck,
                                     o.plan, o.lessonPart,
                                     o.lcards, o.myGloss, o.focus, o.focusDone,
                                     o.grids, o.notes, o.parsing]);
    const changedRemote = sig(merged) !== sig(env.data);
    if (changedLocal) {
      S = merged; save();
      if (document.getElementById("s-today").classList.contains("on")) render();
    }
    SYNC.last = new Date().toISOString(); syncSave();
    if (changedRemote) syncPushSoon(2000);
    return changedLocal ? "ok" : "ok";
  } catch (e) { return "fail"; }
  finally { syncBusy = false; }
}

async function syncPushNow() {
  if (!SYNC_URL || !SYNC || !SYNC.id) return;
  try {
    const r = await fetch(SYNC_URL + "/sync/" + SYNC.id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ts: Date.now(), data: S }),
      keepalive: true,          // survives the page being backgrounded
    });
    if (r.ok) { SYNC.last = new Date().toISOString(); syncSave(); }
  } catch (e) { /* offline: the next save or 'online' event retries */ }
}

/* Debounced push: many quick save() calls collapse into one write, which
   keeps a whole session to a handful of KV writes. */
function syncPushSoon(delay = 5000) {
  if (!SYNC_URL || !SYNC || !SYNC.id) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(syncPushNow, delay);
}

/* ---- lifecycle hooks ---- */
addEventListener("online", async () => {
  const r = await syncPull();
  if (r !== "fail") syncPushSoon(1500);
});
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") syncPull();
  else if (SYNC && SYNC.id) syncPushNow();     // flush when backgrounded
});
// visibilitychange alone is unreliable on Android; pagehide is the one that
// fires when the app is swiped away.
addEventListener("pagehide", () => { if (SYNC && SYNC.id) syncPushNow(); });

/* ---- UI (rendered into the Progress tab by renderProgress) ---- */
function syncCardHtml() {
  if (!SYNC_URL) return "";
  if (SYNC && SYNC.id) {
    const when = SYNC.last ? new Date(SYNC.last).toLocaleString() : "never";
    const codePart = SYNC.code
      ? `<p style="margin:10px 0 4px;font-size:.85rem">Your sync code — enter it on each device you study on:</p>
         <div class="row" style="align-items:center">
           <code id="syncCode" style="font-size:1rem;letter-spacing:.04em;padding:8px 10px;border-radius:9px;background:var(--surface-2);user-select:all">${showCode(SYNC.code)}</code>
           <button class="btn ghost small" onclick="syncCopy()">Copy</button>
         </div>
         <p class="muted" style="font-size:.8rem">Keep it private: anyone with the code shares this progress.</p>`
      : `<p class="muted" style="font-size:.85rem;margin:10px 0 6px">This device syncs with a phrase you chose. A phrase someone else might also choose can share or overwrite this deck, so a generated code is safer. Switching moves your progress to a new code; enter the new code on your other devices afterwards.</p>
         <button class="btn small" onclick="syncSwitch()">Switch to a generated code</button>`;
    return `<div class="card">
      <h3 style="margin-top:0">Sync</h3>
      <p class="muted" style="font-size:.85rem">On. Last synced: ${when}.</p>
      ${codePart}
      <div class="row" style="margin-top:10px">
        <button class="btn small" onclick="syncNowClicked()">Sync now</button>
        <button class="btn ghost small" onclick="syncOff()">Turn off</button>
        <button class="btn ghost small" onclick="syncDelete()">Delete synced copy</button>
      </div>
      <p class="muted" style="font-size:.8rem;margin-bottom:0">Turning off leaves the stored copy where it is, so another device can still reach it. Deleting removes it for good — this device keeps its own progress.</p></div>`;
  }
  return `<div class="card">
    <h3 style="margin-top:0">Sync across devices</h3>
    <p class="muted" style="font-size:.85rem">Keep your progress the same on your phone and your computer. No account: this device makes a private code, and you enter it on the others. Only a fingerprint of the code ever leaves the device.</p>
    <button class="btn small" onclick="syncStart()">Start sync on this device</button>
    <p style="margin:14px 0 6px;font-size:.85rem">Already syncing on another device? Enter its code:</p>
    <input id="syncPhrase" autocomplete="off" autocapitalize="characters" spellcheck="false"
      aria-label="Your sync code from another device"
      placeholder="KOINE-XXXX-XXXX-XXXX-XXXX-XXXX"
      style="width:100%;padding:11px 14px;border-radius:11px;border:1px solid var(--line);background:var(--surface-2);color:var(--text);font-size:.95rem;margin-bottom:9px">
    <button class="btn ghost small" onclick="syncJoin()">Join</button></div>`;
}

/* Turn sync on at an address, pulling first so a device joining an existing
   deck merges into it rather than writing its own empty deck over it. */
async function syncBegin(id, code, done) {
  SYNC = { id, code: code || null, last: null };
  const pulled = await syncPull();
  if (pulled === "fail") {
    SYNC = null;                       // do not remember an id we never reached
    toast("Could not reach sync — check your connection and try again");
    return false;
  }
  syncSave();
  await syncPushNow();
  renderProgress();
  toast(done(pulled));
  return true;
}
async function syncStart() {
  const code = newSyncCode();
  await syncBegin(await syncIdFromCode(code), code,
    () => "Sync is on — copy the code to your other devices");
}
async function syncJoin() {
  const typed = (document.getElementById("syncPhrase").value || "").trim();
  const code = codeFromInput(typed);
  if (code) {
    await syncBegin(await syncIdFromCode(code), code, p =>
      p === "ok" ? "Synced — progress from your other device merged in"
                 : "Joined — nothing was stored under that code yet; check it matches");
    return;
  }
  /* Not a code: a phrase from before codes existed, which still works. */
  if (typed.length < 8) { toast("That is not a sync code — check it and try again"); return; }
  await syncBegin(await syncIdFromPhrase(typed), null, p =>
    p === "ok" ? "Synced with your phrase — a generated code is safer; see Sync"
               : "Sync is on with your phrase");
}
/* A phrase user moves to a code: this device's progress, already merged with
   the phrase's copy by the pull, is written under the new code. The phrase's
   copy is left where it is, so a device still on the phrase is not cut off
   before the new code is entered there; "Delete synced copy" can remove it. */
async function syncSwitch() {
  if (!SYNC || !SYNC.id) return;
  const pulled = await syncPull();
  if (pulled === "fail") { toast("Could not reach sync — nothing was changed"); return; }
  const code = newSyncCode();
  await syncBegin(await syncIdFromCode(code), code,
    () => "Moved to a new code — enter it on your other devices");
}
function syncCopy() {
  const text = showCode(SYNC.code);
  (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject())
    .then(() => toast("Code copied"))
    .catch(() => toast("Select the code and copy it"));
}
function syncOff() {
  SYNC = null;
  try { localStorage.removeItem(SYNC_KEY); } catch (e) {}
  renderProgress(); toast("Sync off — progress stays on this device");
}

/* Turning sync off only ever forgot the id here; the stored copy stayed in
   KV with no way to reach it again, let alone remove it. That is the thing a
   privacy policy has to be able to describe, so it needs to be true before
   the policy says it.

   The device keeps its own progress: only the stored copy goes. */
async function syncDelete() {
  if (!SYNC_URL || !SYNC || !SYNC.id) return;
  if (!confirm("Delete the synced copy of your progress?\n\n"
             + "This device keeps everything it has. Other devices using the "
             + "same code will stop finding it, and it cannot be undone."))
    return;
  try {
    const r = await fetch(SYNC_URL + "/sync/" + SYNC.id, { method: "DELETE" });
    if (!r.ok) throw new Error(r.status);
  } catch (e) {
    toast("Could not reach sync — nothing was deleted");
    return;
  }
  SYNC = null;
  try { localStorage.removeItem(SYNC_KEY); } catch (e) {}
  renderProgress();
  toast("Synced copy deleted — this device keeps its progress");
}
async function syncNowClicked() {
  const pulled = await syncPull();
  if (pulled === "fail") { toast("Could not reach sync — try again"); return; }
  await syncPushNow();
  renderProgress(); toast("Synced");
}

/* boot: pull whatever the other device left */
if (SYNC && SYNC.id) syncPull();

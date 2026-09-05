/* Cross-device sync. Opt-in: the user invents a private sync phrase and
   enters it once per device. The phrase is hashed (SHA-256) client-side;
   only the hash travels, acting as both address and secret on a dumb
   key-value store (see sync-worker/).

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

async function syncIdFromPhrase(phrase) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(phrase.trim()));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

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
                                     o.alpha, o.plan, o.lessonPart,
                                     o.lcards, o.myGloss, o.focus, o.focusDone,
                                     o.grids, o.notes]);
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
    return `<div class="card">
      <h3 style="margin-top:0">Sync</h3>
      <p class="muted" style="font-size:.85rem">On. Last synced: ${when}. The same phrase on another device shares this progress.</p>
      <div class="row">
        <button class="btn small" onclick="syncNowClicked()">Sync now</button>
        <button class="btn ghost small" onclick="syncOff()">Turn off</button>
      </div></div>`;
  }
  return `<div class="card">
    <h3 style="margin-top:0">Sync across devices</h3>
    <p class="muted" style="font-size:.85rem">Invent a private phrase and enter the same one on each device. Progress merges automatically — the phrase never leaves this device, only a fingerprint of it. Treat it like a password; anyone who knows it shares this deck.</p>
    <input id="syncPhrase" type="password" placeholder="Your sync phrase (min 8 characters)"
      style="width:100%;padding:11px 14px;border-radius:11px;border:1px solid var(--line);background:var(--surface-2);color:var(--text);font-size:.95rem;margin-bottom:9px">
    <button class="btn small" onclick="syncOn()">Turn on sync</button></div>`;
}
async function syncOn() {
  const el = document.getElementById("syncPhrase");
  const phrase = (el.value || "").trim();
  if (phrase.length < 8) { toast("Use at least 8 characters"); return; }
  SYNC = { id: await syncIdFromPhrase(phrase), last: null };
  const pulled = await syncPull();
  if (pulled === "fail") {
    SYNC = null;                       // do not remember an id we never reached
    toast("Could not reach sync — check your connection and try again");
    return;
  }
  syncSave();
  await syncPushNow();
  renderProgress();
  toast(pulled === "ok" ? "Synced — progress from your other device merged in" : "Sync is on");
}
function syncOff() {
  SYNC = null;
  try { localStorage.removeItem(SYNC_KEY); } catch (e) {}
  renderProgress(); toast("Sync off — progress stays on this device");
}
async function syncNowClicked() {
  const pulled = await syncPull();
  if (pulled === "fail") { toast("Could not reach sync — try again"); return; }
  await syncPushNow();
  renderProgress(); toast("Synced");
}

/* boot: pull whatever the other device left */
if (SYNC && SYNC.id) syncPull();

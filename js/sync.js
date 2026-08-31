/* Cross-device sync. Opt-in: the user invents a private sync phrase and
   enters it once per device. The phrase is hashed (SHA-256) client-side;
   only the hash travels, acting as both address and secret on a dumb
   key-value store (see sync-worker/).

   Model: pull-merge-push. Every card carries a ts of its last grading,
   so merging two devices' decks keeps whichever review of each word
   happened most recently. Counters take the max, sets take the union,
   and device preferences (goal, text size) stay local.

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
function pickCard(a, b) {
  if ((a.ts || 0) !== (b.ts || 0)) return (a.ts || 0) > (b.ts || 0) ? a : b;
  if ((a.reps || 0) !== (b.reps || 0)) return (a.reps || 0) > (b.reps || 0) ? a : b;
  return (a.due || "") >= (b.due || "") ? a : b;
}
function mergeStates(local, remote) {
  const out = JSON.parse(JSON.stringify(local));
  out.cards = {};
  const keys = new Set([...Object.keys(local.cards || {}), ...Object.keys(remote.cards || {})]);
  for (const k of keys) {
    const a = (local.cards || {})[k], b = (remote.cards || {})[k];
    out.cards[k] = !a ? b : (!b ? a : pickCard(a, b));
  }
  out.xp     = Math.max(local.xp || 0, remote.xp || 0);
  out.streak = Math.max(local.streak || 0, remote.streak || 0);
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
  out.last    = [local.last, remote.last].filter(Boolean).sort().pop() || null;
  const da = local.dayOfReviews || "", db = remote.dayOfReviews || "";
  if (da === db) out.reviewsToday = Math.max(local.reviewsToday || 0, remote.reviewsToday || 0);
  else if (db > da) { out.reviewsToday = remote.reviewsToday || 0; out.dayOfReviews = db; }
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
    const changedRemote = JSON.stringify(merged.cards) !== JSON.stringify(env.data.cards)
                       || merged.xp !== env.data.xp || merged.lessons.length !== (env.data.lessons || []).length;
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
addEventListener("online", () => syncPushSoon(1000));
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") syncPull();
  else if (SYNC && SYNC.id) syncPushNow();     // flush when backgrounded
});

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

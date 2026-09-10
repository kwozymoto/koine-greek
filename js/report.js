/* Report a problem — a tester's bug report, assembled on the device.

   There is no backend and this should not be the thing that gives the app
   one. The only server it has ever talked to is the sync worker, and its
   promise is that the passphrase never leaves the device; adding a reporting
   endpoint would mean a second place user text can go, a second thing to
   secure, and a new answer on the Play data-safety form.

   So the report is built here and handed to whatever the device already has:

     Share   navigator.share, which on a phone carries the screenshot as a
             real attachment into mail, messages or anything else installed
     Copy    the clipboard, which works everywhere and needs no permission

   Nothing is transmitted by this file. The user chooses the destination, and
   sees the whole report before they do.

   Loaded FIRST in index.html so the error handler below is installed before
   any other script can throw. That is the whole reason for its position in
   the load order, which is otherwise load-bearing for a different reason. */

const REPORT = {
  errors: [],        // the last few uncaught errors, newest last
  trail: [],         // the last few screens, so a report says where they were
  version: null,     // filled in by the service worker; never hard-coded here
  DRAFT: "koine.report.draft",
  /* The one place the destination is written. privacy.html carries the
     same address; nothing else needs it. */
  TO: "support@everydaykoine.app"
};

/* ---------- catch what the tester will not be able to describe ----------
   "It just stopped" is the commonest bug report there is. If something threw,
   the report should carry it whether or not they noticed. Three is enough to
   see a cascade and few enough that the report stays readable. */
function reportNote(kind, msg, where) {
  REPORT.errors.push({
    at: new Date().toISOString().slice(11, 19),
    kind, msg: String(msg || "").slice(0, 300), where: String(where || "").slice(0, 160)
  });
  if (REPORT.errors.length > 3) REPORT.errors.shift();
}

addEventListener("error", e => {
  // A failed <img> or <script> fires this too, with no .error — worth having.
  if (e.target && e.target !== window && e.target.src)
    return reportNote("resource", "failed to load", e.target.src);
  reportNote("error", e.message, (e.filename || "") + ":" + (e.lineno || ""));
});
addEventListener("unhandledrejection", e =>
  reportNote("promise", (e.reason && e.reason.message) || e.reason, ""));

/* app.js calls this from go(); a one-line hook rather than wrapping a global,
   so nothing here can change how navigation behaves. */
function reportTrail(name) {
  if (REPORT.trail[REPORT.trail.length - 1] === name) return;
  REPORT.trail.push(name);
  if (REPORT.trail.length > 6) REPORT.trail.shift();
}

/* The version lives in one place, sw.js, and is asked for rather than copied.
   A version number duplicated into the page is a version number that goes
   stale, and a bug report with the wrong version in it is worse than one with
   none. */
navigator.serviceWorker && navigator.serviceWorker.addEventListener("message", e => {
  if (e.data && e.data.type === "version") REPORT.version = e.data.version;
});
addEventListener("load", () => setTimeout(() => {
  const sw = navigator.serviceWorker && navigator.serviceWorker.controller;
  if (sw) sw.postMessage("version");
}, 400));

/* ---------- what goes in the report ----------
   Everything here is either about the app or about the browser. Nothing
   identifies the person, and the sync passphrase is never read — only whether
   sync is switched on at all, because "it works on one device and not the
   other" is a real bug and the answer is usually there. */
function reportDiag() {
  const d = [];
  d.push("app        " + (REPORT.version || "unknown"));
  d.push("screen     " + (REPORT.trail.length
    ? REPORT.trail.slice(-4).join(" → ") : "unknown"));
  try {
    const done = (S.lessons || []).length ? Math.max(...S.lessons) : 0;
    d.push("progress   chapter " + done + " · " +
      Object.keys(S.cards || {}).length + " words started · " + (S.xp || 0) + " XP");
    d.push("sync       " + (typeof SYNC !== "undefined" && SYNC && SYNC.id ? "on" : "off"));
  } catch (e) { d.push("progress   unreadable (" + e.message + ")"); }
  d.push("browser    " + navigator.userAgent);
  d.push("screen px  " + innerWidth + "×" + innerHeight +
    " @" + (devicePixelRatio || 1) + "x" + (navigator.onLine ? "" : " · offline"));
  if (REPORT.errors.length) {
    d.push("");
    d.push("errors the app caught:");
    REPORT.errors.forEach(e =>
      d.push("  " + e.at + " " + e.kind + ": " + e.msg + (e.where ? "  (" + e.where + ")" : "")));
  }
  return d.join("\n");
}

function reportText() {
  const what = (document.getElementById("repWhat") || {}).value || "";
  return "Everyday Koine — problem report\n\n" +
    (what.trim() || "(no description given)") +
    "\n\n---- what the app knows ----\n" + reportDiag() + "\n";
}

/* ---------- the card ---------- */
function reportCardHtml() {
  const draft = (() => { try { return localStorage.getItem(REPORT.DRAFT) || ""; }
                         catch (e) { return ""; } })();
  return `<div class="card" id="reportCard">
    <h3 style="margin-top:0">Report a problem</h3>
    <p class="muted" style="font-size:.85rem;margin-bottom:10px">
      Something wrong, confusing, or just not what you expected — a wrong answer marked
      correct, a word that will not play, a chapter that reads badly. Say what happened and
      what you expected instead.</p>

    <textarea id="repWhat" class="rep-what" rows="4" placeholder="On chapter 12, question 3 marked me wrong when I picked…"
      oninput="reportSaveDraft()">${draft.replace(/[<&]/g, c => c === "<" ? "&lt;" : "&amp;")}</textarea>

    <div class="setrow" style="border:0;padding-top:12px">
      <span>Screenshot<br><small class="muted" id="repShotName">Optional — helps a great deal</small></span>
      <label class="btn ghost small" style="cursor:pointer;margin:0">
        Choose<input type="file" id="repShot" accept="image/*" hidden onchange="reportShotPicked()">
      </label>
    </div>
    <img id="repShotPrev" alt="" hidden>

    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn" style="flex:1" onclick="reportSend()">Send</button>
      <button class="btn ghost" style="flex:1" onclick="reportCopy()">Copy</button>
    </div>
    <p class="muted" style="font-size:.8rem;margin:8px 0 0;text-align:center">
      Goes to <a href="mailto:${REPORT.TO}">${REPORT.TO}</a></p>

    <details style="margin-top:12px">
      <summary class="muted" style="font-size:.82rem;cursor:pointer">What gets included</summary>
      <pre class="rep-diag" id="repDiag">${reportDiag()
        .replace(/[<&]/g, c => c === "<" ? "&lt;" : "&amp;")}</pre>
      <p class="muted" style="font-size:.8rem;margin:6px 0 0">
        Nothing is sent from this screen. Send opens your own mail app with the report
        already written and addressed; Copy puts it on the clipboard. Your sync passphrase
        is never read.</p>
    </details>
  </div>`;
}

/* A half-written report should survive a reload — that is exactly when the
   app is misbehaving. Kept under its own key rather than in S, so it is not
   part of the synced state: a draft bug report has no business travelling to
   another device. */
function reportSaveDraft() {
  try {
    const v = document.getElementById("repWhat").value;
    v.trim() ? localStorage.setItem(REPORT.DRAFT, v) : localStorage.removeItem(REPORT.DRAFT);
  } catch (e) { /* private mode; the draft simply will not survive */ }
}

let REPORT_FILE = null;
function reportShotPicked() {
  const f = (document.getElementById("repShot").files || [])[0];
  const name = document.getElementById("repShotName");
  const prev = document.getElementById("repShotPrev");
  if (!f) { REPORT_FILE = null; prev.hidden = true; return; }
  if (!/^image\//.test(f.type)) {
    name.textContent = "That is not an image"; REPORT_FILE = null; prev.hidden = true; return;
  }
  REPORT_FILE = f;
  name.textContent = f.name + " · " + Math.round(f.size / 1024) + " KB";
  prev.src = URL.createObjectURL(f);
  prev.hidden = false;
}

/* mailto: with the address and the report already in it. A report that
   reaches nobody is not a report, and until now Send opened a share sheet
   with an empty To: field -- the tester had to know the address, which is
   written down only in privacy.html. Nothing here transmits anything: this
   still hands the report to the user's own mail app, addressed, for them to
   look at and send.

   Kept under 1,800 characters because some mail clients truncate a long
   mailto body, and a truncated report is worse than a short one. The
   diagnostics are the part that goes; the tester's own words never do. */
function reportMailto() {
  const what = (document.getElementById("repWhat") || {}).value || "";
  let body = reportText();
  if (body.length > 1800) {
    body = "Everyday Koine — problem report\n\n" +
      (what.trim() || "(no description given)") +
      "\n\n---- what the app knows ----\n" +
      "app        " + (REPORT.version || "unknown") + "\n" +
      "(the rest was too long to carry in a mail link — use Copy for all of it)\n";
  }
  return "mailto:" + REPORT.TO +
    "?subject=" + encodeURIComponent("Everyday Koine — problem report") +
    "&body=" + encodeURIComponent(body);
}

async function reportSend() {
  const text = reportText();
  const canFile = REPORT_FILE && navigator.canShare &&
                  navigator.canShare({ files: [REPORT_FILE] });
  /* A screenshot can only travel through the share sheet -- mailto cannot
     carry an attachment -- so that wins when there is one and the browser
     can take it. Otherwise mail, because it is the only route that knows
     where the report is going. */
  if (canFile) {
    try {
      await navigator.share({ title: "Everyday Koine — problem report", text,
                              files: [REPORT_FILE] });
      reportDone("Sent — send it to " + REPORT.TO);
      return;
    } catch (e) {
      if (e && e.name === "AbortError") return;    // they changed their mind
    }
  }
  try {
    location.href = reportMailto();
    reportDone(REPORT_FILE
      ? "Opening mail — attach the screenshot yourself"
      : "Opening mail");
    return;
  } catch (e) { /* no mail client; fall through */ }
  await reportCopy("Copied — send it to " + REPORT.TO);
}

async function reportCopy(msg) {
  const text = reportText();
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    // Older browsers, or a page without focus. Select it so they can copy by hand.
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e2) { /* nothing left to try */ }
    ta.remove();
  }
  reportDone(msg || "Copied");
}

function reportDone(msg) {
  if (typeof toast === "function") toast(msg);
  try { localStorage.removeItem(REPORT.DRAFT); } catch (e) { /* nothing to clear */ }
  const w = document.getElementById("repWhat");
  if (w) w.value = "";
  REPORT_FILE = null;
  const prev = document.getElementById("repShotPrev");
  if (prev) prev.hidden = true;
  const name = document.getElementById("repShotName");
  if (name) name.textContent = "Optional — helps a great deal";
}

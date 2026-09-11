/* Extracted from the single-file app. Plain script, no modules — load order in index.html matters. */

/* ============================================================
   PWA  — service worker, install prompt, offline state
   ============================================================ */

/* Without a worker the app still runs; it just won't open offline and
   won't offer to install. So every failure here is silent by design. */
if("serviceWorker" in navigator){
  addEventListener("load",()=>{
    navigator.serviceWorker.register("sw.js").then(reg=>{

      /* A worker in "waiting" means a new version is cached and ready.
         Offer the reload rather than forcing it — being thrown out of a
         review mid-card is worse than running a version behind. */
      const watch=w=>{
        if(!w) return;
        w.addEventListener("statechange",()=>{
          if(w.state==="installed" && navigator.serviceWorker.controller) offerUpdate(reg);
        });
      };
      if(reg.waiting && navigator.serviceWorker.controller) offerUpdate(reg);
      watch(reg.installing);
      reg.addEventListener("updatefound",()=>watch(reg.installing));
    }).catch(()=>{});
  });

  /* claim() fires controllerchange on the first ever load, where there is
     nothing stale to replace — reloading there just jolts a new user. */
  const hadController=!!navigator.serviceWorker.controller;
  let reloading=false;
  navigator.serviceWorker.addEventListener("controllerchange",()=>{
    if(!hadController || reloading) return;
    reloading=true;
    location.reload();
  });
}

function offerUpdate(reg){
  const bar=document.getElementById("updateBar");
  bar.classList.add("on");
  document.getElementById("btnReload").onclick=()=>{
    bar.classList.remove("on");
    if(reg.waiting) reg.waiting.postMessage("skip-waiting");
  };
}

/* The bar sat over the bottom of the screen with no way out but reloading,
   which is the one thing you do not want mid-review. Wired once here rather
   than inside offerUpdate, so the control is never a dead button. */
document.getElementById("btnUpdateNo").onclick=()=>{
  document.getElementById("updateBar").classList.remove("on");
  toast("It will update next time you open the app");
};

/* ---------- install ---------- */
let installEvent=null;
const installBar=document.getElementById("installBar");

/* Installing is optional — plenty of reasons to just use it in the browser.
   Dismissing is remembered so the banner does not reappear on every visit;
   it can still be installed from the browser's own menu, and Progress keeps
   an entry once dismissed. */
const INSTALL_DISMISS="koine.installDismissed";
const installDismissed=()=>{ try{ return localStorage.getItem(INSTALL_DISMISS)==="1"; }catch(e){ return false; } };

addEventListener("beforeinstallprompt",e=>{
  e.preventDefault();
  installEvent=e;
  if(!installDismissed()) installBar.classList.add("on");
});

document.getElementById("btnInstallNo").onclick=()=>{
  installBar.classList.remove("on");
  try{ localStorage.setItem(INSTALL_DISMISS,"1"); }catch(e){}
  toast("Fine \u2014 you can install later from Progress");
};

/* ---------- iOS ----------

   beforeinstallprompt is Chrome's and Safari has no equivalent, so every
   iPhone and iPad visitor saw nothing at all above: no prompt, no bar, no
   hint that this installs. Safari can still add it to the home screen, and
   the result is the same full-screen offline app Android gets — it is only
   reachable from Safari's own Share menu, so all the page can do is say so.

   Two things narrow who is told. Chrome, Firefox and Edge on iOS are Safari
   underneath but their menus carry no Add to Home Screen, so telling their
   users to look for it sends them hunting for something that is not there.
   And an app already launched from the home screen must not be invited to
   install itself again. */
function iosSafari(){
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua)
    /* iPadOS 13+ reports itself as a Mac; the touch points give it away. */
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return ios && !/CriOS|FxiOS|EdgiOS|OPiOS|Mercury/i.test(ua);
}
function alreadyInstalled(){
  try{
    return navigator.standalone === true
      || matchMedia("(display-mode: standalone)").matches;
  }catch(e){ return false; }
}

const iosBar = document.getElementById("iosBar");
if(iosBar){
  if(iosSafari() && !alreadyInstalled() && !installDismissed()) iosBar.classList.add("on");
  document.getElementById("btnIosNo").onclick = () => {
    iosBar.classList.remove("on");
    try{ localStorage.setItem(INSTALL_DISMISS,"1"); }catch(e){}
    toast("Fine — the steps stay in Progress");
  };
}

/* Reachable again from the Progress tab rather than lost for good. */
function installRowHtml(){
  if(iosSafari() && !alreadyInstalled()){
    return `<div class="setrow"><span>Add to your home screen<br>
      <small class="muted">Tap Share in Safari, then Add to Home Screen —
      it opens full screen and works offline</small></span></div>`;
  }
  if(!installEvent) return "";
  return `<div class="setrow"><span>Install as an app<br><small class="muted">Home screen icon, opens offline</small></span>
    <button class="btn ghost small" onclick="doInstall()">Install</button></div>`;
}
async function doInstall(){
  if(!installEvent){ toast("Use your browser's menu: Add to home screen"); return; }
  installEvent.prompt();
  await installEvent.userChoice;
  installEvent=null;
  installBar.classList.remove("on");
  if(typeof renderProgress==="function") renderProgress();
}

document.getElementById("btnInstall").onclick=async()=>{
  if(!installEvent) return;
  installEvent.prompt();
  await installEvent.userChoice;
  installEvent=null;
  installBar.classList.remove("on");
};

addEventListener("appinstalled",()=>{
  installBar.classList.remove("on");
  installEvent=null;
  toast("Installed — open it from your home screen");
});

/* ---------- closed testing ----------

   The Play Store's test track is joined by email address and nothing else:
   the address goes into the Play Console, and an install link comes back.
   Friends have been passing the web app on to their own friends, so the
   people most likely to test it are precisely the ones there is no way to
   write to. This asks them, and it is the only thing in the app that asks
   the user for anything.

   Four things narrow who sees it, and each is a reason not to nag someone:

     Android only      — there is no iOS build to test.
     Not in the app    — a TWA launches with android-app:// in the referrer,
                         so they already installed it from Play and are
                         already a tester.
     Not first visit   — a stranger who has seen one screen has no reason to
                         sign up for anything.
     Once              — dismissing or sending both set the flag for good.

   NOTHING IS TRANSMITTED HERE. It builds a mailto: and hands it to the
   device, exactly as js/report.js does, and for the same reason: a reporting
   endpoint would be a second place user text can go, a second thing to
   secure, and a different answer on the Play data-safety form. The address
   the user types never reaches this app's own storage either -- it goes
   straight into the mail body and the field is not saved. */
const TEST_DISMISS = "koine.testerAsked";
const VISITS       = "koine.visits";

function androidWeb(){
  if(!/Android/i.test(navigator.userAgent || "")) return false;
  /* Chrome sets this when a Trusted Web Activity opens the page, which is
     what the Play build is. Wrapped because a sandboxed frame throws. */
  try{ if(/^android-app:\/\//.test(document.referrer || "")) return false; }
  catch(e){ /* cannot tell; fall through and ask */ }
  return true;
}
/* Defaults to "already asked" when storage is unavailable. A private window
   cannot remember a dismissal, and a prompt that cannot be dismissed is
   worse than one that never appears. */
function testerAsked(){
  try{ return localStorage.getItem(TEST_DISMISS) === "1"; }catch(e){ return true; }
}
function testerSeal(){
  try{ localStorage.setItem(TEST_DISMISS,"1"); }catch(e){}
}
function bumpVisits(){
  try{
    const n=(parseInt(localStorage.getItem(VISITS),10)||0)+1;
    localStorage.setItem(VISITS,String(n));
    return n;
  }catch(e){ return 1; }
}

function testerMailto(addr){
  const to=(typeof REPORT==="object" && REPORT.TO) || "support@everydaykoine.app";
  const body =
    "I would like to join the closed test of Everyday Koine on Android.\n\n" +
    "Address for the test group: " + addr + "\n\n" +
    "app        " + ((typeof REPORT==="object" && REPORT.version) || "unknown") + "\n" +
    "device     " + (navigator.userAgent || "").slice(0,160) + "\n";
  return "mailto:" + to +
    "?subject=" + encodeURIComponent("Everyday Koine — closed test signup") +
    "&body=" + encodeURIComponent(body);
}

const testScrim=document.getElementById("testScrim");

function testerShow(){
  if(!testScrim) return;
  testScrim.hidden=false;
  const f=document.getElementById("testMail");
  if(f) setTimeout(()=>{ try{ f.focus(); }catch(e){} },60);
}
function testerClose(){
  if(!testScrim) return;
  testScrim.hidden=true;
  const never=document.getElementById("testNever");
  if(never && never.checked) testerSeal();
}

if(testScrim){
  /* Counted on every load, not only when the prompt might show, so the
     number means "visits" and still means it if the rule above changes. */
  const visits=bumpVisits();
  document.getElementById("btnTestNo").onclick=testerClose;
  document.getElementById("btnTestX").onclick=testerClose;
  /* Tapping the dark area is how a sheet closes on a phone. Dismissing this
     way honours the tick box too. */
  testScrim.onclick=e=>{ if(e.target===testScrim) testerClose(); };

  document.getElementById("btnTestGo").onclick=()=>{
    const f=document.getElementById("testMail");
    const a=((f && f.value) || "").trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(a)){
      toast(a ? "That does not look like an email address"
              : "An address is needed to add you to the test group");
      if(f) try{ f.focus(); }catch(e){}
      return;
    }
    /* Sealed before the handover: they have signed up, so the prompt has
       done its job whether or not the mail app opens. */
    testerSeal();
    testScrim.hidden=true;
    if(f) f.value="";
    try{
      location.href=testerMailto(a);
      toast("Opening mail — send it and you are on the list");
    }catch(e){
      toast("No mail app — write to " +
            ((typeof REPORT==="object" && REPORT.TO) || "support@everydaykoine.app"));
    }
  };

  if(androidWeb() && !testerAsked() && visits>=2){
    /* After the first paint, so it does not land on a blank screen. */
    addEventListener("load",()=>setTimeout(testerShow,1400));
  }
}

/* Reachable from Progress afterwards, the way the install row is — dismissing
   a prompt should not be the same as refusing for ever. */
function testerRowHtml(){
  if(!androidWeb()) return "";
  return `<div class="setrow"><span>Test the Android app<br>
    <small class="muted">Join the Play Store test and get the real app</small></span>
    <button class="btn ghost small" onclick="testerShow()">Sign up</button></div>`;
}


/* ---------- offline state ---------- */
const netPill=document.getElementById("netPill");
function netState(){
  const off=!navigator.onLine;
  document.body.classList.toggle("off",off);
  netPill.classList.toggle("on",off);
}
addEventListener("online",netState);
addEventListener("offline",netState);
netState();


/* ---------- offline completeness ----------
   The worker fills the cache on its own; the page nudges it on each load so
   an interrupted fill resumes, and reports where it has got to. */

let OFFLINE = { have: 0, total: 0, complete: false };

navigator.serviceWorker && navigator.serviceWorker.addEventListener("message", e => {
  const d = e.data || {};
  if (d.type === "offline-progress") {
    OFFLINE = { have: d.done, total: d.total, complete: !!d.complete, failed: d.failed || 0 };
    paintOffline();
  }
  if (d.type === "offline-status" && !d.error) {
    OFFLINE = { have: d.have, total: d.total, complete: d.have >= d.total };
    paintOffline();
  }
});

function askOffline(what) {
  const sw = navigator.serviceWorker && navigator.serviceWorker.controller;
  if (sw) sw.postMessage(what);
}

function paintOffline() {
  const el = document.getElementById("offlineState");
  if (!el) return;
  const { have, total, complete } = OFFLINE;
  if (!("serviceWorker" in navigator)) { el.textContent = "not available in this browser"; return; }
  if (!navigator.serviceWorker.controller && !total) { el.textContent = "starting…"; return; }
  if (!total) { el.textContent = "checking…"; return; }
  el.textContent = complete
    ? "Ready — the whole app works offline"
    : `Saving for offline… ${have} of ${total}`;
}

addEventListener("load", () => {
  setTimeout(() => { askOffline("ensure-offline"); askOffline("offline-status"); }, 1500);
});

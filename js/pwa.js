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

  let reloading=false;
  navigator.serviceWorker.addEventListener("controllerchange",()=>{
    if(reloading) return;
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

/* Reachable again from the Progress tab rather than lost for good. */
function installRowHtml(){
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

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

addEventListener("beforeinstallprompt",e=>{
  e.preventDefault();
  installEvent=e;
  installBar.classList.add("on");
});

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

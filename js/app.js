/* Extracted from the single-file app. Plain script, no modules — load order in index.html matters. */

/* ============================================================
   STORAGE  — localStorage with in-memory fallback
   ============================================================ */
const KEY="koine.v1";
let mem=null, canPersist=true;
function load(){
  try{const r=localStorage.getItem(KEY);return r?JSON.parse(r):null;}
  catch(e){canPersist=false;return mem;}
}
function save(){
  try{localStorage.setItem(KEY,JSON.stringify(S));}
  catch(e){canPersist=false;mem=S;}
  if(typeof syncPushSoon==="function") syncPushSoon();
}
/* The calendar date where the reader is, not in UTC. toISOString() is UTC,
   so at +12 the study day was rolling over at noon: cards graded on Monday
   evening were not due on Tuesday morning, and three consecutive days of
   study could read as a broken streak. */
const ymd=d=>new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);
const today=()=>ymd(new Date());
const daysBetween=(a,b)=>Math.round((new Date(b)-new Date(a))/86400000);

let S = load() || {
  cards:{}, xp:0, streak:0, best:0, last:null, seen:0,
  lessons:[], badges:[], reviewsToday:0, dayOfReviews:null, goal:20
};
S.cards=S.cards||{}; S.lessons=S.lessons||[]; S.badges=S.badges||[];

/* ============================================================
   SPACED REPETITION  — SM-2 variant
   Grades: 0 Again · 1 Hard · 2 Good · 3 Easy
   ============================================================ */
function card(i){
  if(!S.cards[i]) S.cards[i]={ease:2.5,ivl:0,due:today(),reps:0,lapses:0};
  return S.cards[i];
}
/* The interval a grade earns, before fuzz. The grade buttons show this, so
   forecast and scheduler cannot drift apart. */
function baseIvl(c,g){
  if(c.reps===0) return g===1?1:(g===2?1:3);
  if(c.reps===1) return g===1?3:(g===2?6:9);
  // Capped: uncapped growth reached a date Date could not represent and
  // threw inside schedule(), aborting grade() mid-session.
  return Math.min(365, Math.round(c.ivl * (g===1?1.2:(g===2?c.ease:c.ease*1.3))));
}
/* One scheduler for both decks: vocabulary keyed by VOCAB index, and the
   grammar questions keyed by lesson-and-question id. */
function applyGrade(c,g){
  c.ts=Date.now();
  if(g===0){
    c.lapses++; c.reps=0; c.ivl=0;
    c.ease=Math.max(1.3,c.ease-0.2);
    c.due=today();                       // stays in today's queue
  } else {
    c.ivl = baseIvl(c,g);
    /* Standard SM-2 fuzz on the longer intervals. Without it a group of
       cards graded on one day marches in lockstep for ever: the hundred
       seeded words would keep landing on a single day, all together. */
    if(c.ivl>=7) c.ivl = Math.min(365, Math.max(7, Math.round(c.ivl*(0.95+Math.random()*0.10))));
    c.ease = Math.min(2.8, Math.max(1.3, c.ease + (g===1?-0.15:(g===2?0:0.1))));
    c.reps++;
    const d=new Date(); d.setDate(d.getDate()+c.ivl);
    c.due=ymd(d);
  }
}
function schedule(i,g){ applyGrade(card(i),g); save(); }
/* ---- grammar cards ----
   S.cards is keyed by VOCAB index and has to stay that way, so the grammar
   questions get their own map, keyed "L17q3" — lesson 17, question 3 — and
   run through the same scheduler.

   Passing lesson 17 used to be the end of it: the id went on a one-way done
   list and nothing ever brought those questions back. Six months on you
   would still know three hundred words, because the SRS guarantees that, and
   still not parse a genitive absolute. That is how the grammar went the
   first time round. */
function gcard(k){
  if(!S.gcards) S.gcards={};
  if(!S.gcards[k]) S.gcards[k]={ease:2.5,ivl:0,due:today(),reps:0,lapses:0};
  return S.gcards[k];
}
/* Multiple choice is right or wrong, so it maps onto Good and Again. */
function gradeGrammar(k,ok){
  applyGrade(gcard(k),ok?2:0);
  // Only a scheduled review counts toward the daily goal; a lesson test is
  // studying, but it is not the review the goal is about.
  if(mode==="review") S.reviewsToday=(S.reviewsToday||0)+1;
  save();
}
/* "L17q3" back to its question. A key whose lesson has since been re-written
   returns null and is skipped rather than breaking a review. */
function gquestion(k){
  const m=/^L(\d+)q(\d+)$/.exec(k); if(!m) return null;
  const l=LESSONS.find(x=>x.id===+m[1]);
  return (l && l.quiz && l.quiz[+m[2]]) || null;
}
const gdueList=()=>Object.keys(S.gcards||{})
  .filter(k=>S.gcards[k] && S.gcards[k].due<=today() && gquestion(k));

const isDue=i=>S.cards[i] && S.cards[i].due<=today() && !skipWord(i);
/* Number() must come first: Object.keys yields strings, and skipWord uses
   Set.has / Array.includes, which do not coerce — so every suspended and
   retired card was silently passing the filter. */
const dueList=()=>Object.keys(S.cards).map(Number).filter(isDue).sort((a,b)=>a-b);
const knownCount=()=>Object.values(S.cards).filter(c=>c&&+c.ivl>=6).length;
const level=()=>Math.floor(Math.sqrt(Math.max(0,+S.xp||0)/45))+1;

/* ============================================================
   STREAK + XP + BADGES
   ============================================================ */
/* One missed day a week does not end the streak. You will always lose the
   odd Sunday, and a funeral week is exactly when a broken streak would make
   you stop altogether. It is shown honestly rather than faked — the day is
   only spent when you actually come back. */
const restAvailable=()=>!S.restUsed||daysBetween(S.restUsed,today())>=7;
function touchDay(){
  const t=today();
  if(S.last===t) return;
  if(S.last===null) S.streak=1;
  else{
    const d=daysBetween(S.last,t);
    if(d<=1) S.streak=(S.streak||0)+1;
    else if(d===2 && restAvailable()){ S.streak=(S.streak||0)+1; S.restUsed=t; }
    else S.streak=1;
  }
  S.last=t; S.best=Math.max(S.best||0,S.streak);
  S.reviewsToday=0; S.dayOfReviews=t;
  S.plan={day:t,done:[]};        // a new day, a fresh set of ticks
  save();
}
function addXp(n){ S.xp+=n; save(); }

/* ============================================================
   THE ALPHABET, AND WHETHER IT HAS SETTLED
   ------------------------------------------------------------
   The letters lived only in the Drill menu, so a new learner was handed
   words on day one and had to know to go looking for the alphabet. Today's
   plan leads with them instead — and has to know when to stop.

   Consecutive correct identifications, per letter. A miss costs one rather
   than resetting to zero: three in a row across 24 letters is a fair bar,
   but one slip in week three should not send you back to the start. Tracing
   does not count towards it — naming a letter and drawing it are different
   skills, and this is the one the rest of the app depends on.
   ============================================================ */
const ALPHA_SOLID=3;
function alphaSeen(name,ok){
  if(!name) return;
  S.alpha=S.alpha||{};
  const n=+S.alpha[name]||0;
  S.alpha[name]=ok?Math.min(ALPHA_SOLID,n+1):Math.max(0,n-1);
  save();
}
const alphaScore=a=>+((S.alpha||{})[a[1]])||0;
const alphaLeft=()=>ALPHABET.filter(a=>alphaScore(a)<ALPHA_SOLID).length;
/* The ones you are least sure of, not n at random. */
const alphaWeak=(n=8)=>ALPHABET.slice()
  .sort((a,b)=>alphaScore(a)-alphaScore(b)||Math.random()-.5).slice(0,n);
function grant(id){
  if(S.badges.includes(id))return;
  S.badges.push(id); save();
  const b=BADGES.find(x=>x.id===id);
  if(b) toast(b.e+"  "+b.t+" unlocked");
}
function checkBadges(){
  if(S.xp>0) grant("first");
  if(S.streak>=7) grant("streak7");
  if(S.streak>=30) grant("streak30");
  if(knownCount()>=50) grant("w50");
  if(knownCount()>=150) grant("w150");
  if(S.lessons.length>=8) grant("l8");
  if(S.lessons.length>=16) grant("l16");
  if(S.lessons.length>=26) grant("l26");
  if(S.lessons.includes(1)) grant("alpha");
}
/* A PWA with no server cannot send a notification, so the icon badge is the
   only nudge available. Unsupported everywhere but Chrome on the desktop and
   installed Android apps — hence the guards. */
function paintBadge(n){
  try{
    if(n>0) navigator.setAppBadge && navigator.setAppBadge(n);
    else navigator.clearAppBadge && navigator.clearAppBadge();
  }catch(e){}
}
document.addEventListener("visibilitychange",()=>{
  if(document.visibilityState==="visible" && typeof dueList==="function") paintBadge(dueList().length);
});

let tTimer;
function toast(msg){
  const el=document.getElementById("toast");
  /* Clear whatever is pinned to the bottom of the screen. The reading gloss
     is a near-identical panel sitting just above the nav, and it grows with
     its content — so a fixed offset in the stylesheet is not enough and the
     toast was landing inside it. */
  const g=document.querySelector(".screen.on .gloss");
  const lift=(g && g.offsetParent) ? Math.round(g.getBoundingClientRect().height)+22 : 22;
  el.style.bottom=`calc(var(--nav-h) + env(safe-area-inset-bottom) + ${lift}px)`;
  el.textContent=msg; el.classList.add("on");
  clearTimeout(tTimer); tTimer=setTimeout(()=>el.classList.remove("on"),2400);
}

/* A gentle reminder rather than a nag: only once a fortnight has passed
   with no export and no sync configured. */
function backupNudgeHtml(){
  const synced = typeof SYNC!=="undefined" && SYNC && SYNC.id;
  if(synced) return "";
  const last=S.exported;
  const days=last?daysBetween(last,today()):999;
  if(days<14) return "";
  return `<div class="card" style="border-color:var(--gold-dim)">
    <h3 style="margin-top:0">Back up your progress</h3>
    <p class="muted" style="font-size:.85rem">${last?`Last exported ${days} days ago.`:"You have never exported your progress."}
    Turn on sync below, or export a copy — this device is the only place it lives.</p></div>`;
}

/* Ask the browser to protect this app's data from eviction. Installed PWAs
   are usually granted it; it is a no-op where unsupported. */
async function requestPersistence(){
  try{
    if(navigator.storage && navigator.storage.persist){
      if(!(await navigator.storage.persisted())) await navigator.storage.persist();
    }
  }catch(e){}
}

/* Greek text size preference */
function applyGk(){ document.body.dataset.gk = S.gk || ""; }

/* Placement: give the N commonest un-started words a 6-day head start
   instead of walking them through the new-word flow one by one. */
function seedVocab(n=100){
  let done=0;
  for(const i of LEARN_ORDER){
    if(done>=n) break;
    if(S.cards[i]) continue;
    const c=card(i);
    /* No ts: the sync merge compares ts before reps, so a freshly stamped
       6-day seed would beat the other device's mature copy of the same word.
       Without one it falls through to reps, which is the honest comparison.
       Stagger the due dates so the cohort does not all land on one day. */
    c.ivl=4+(done%14); c.reps=2;
    const d=new Date(); d.setDate(d.getDate()+c.ivl);
    c.due=ymd(d);
    done++;
  }
  save(); render();
  toast(done ? done+" words seeded — spread over the next fortnight" : "Those words are already in the schedule");
}

const LEECH_AT=8;              // lapses before a word is called out
const isLeech=i=>(S.cards[i]?.lapses||0)>=LEECH_AT && !(S.suspended||[]).includes(i);
function suspendWord(i){
  S.suspended=[...new Set([...(S.suspended||[]),i])];
  save(); toast("Suspended — it will stop coming up");
  qi++; step();
}
function unsuspendWord(i){
  S.suspended=(S.suspended||[]).filter(x=>x!==i);
  /* Back into today's queue rather than at whatever interval it had when it
     was set aside — you are asking to see it again. */
  if(S.cards[i]) S.cards[i].due=today();
  save(); renderProgress();
  toast(VOCAB[i][0].split(",")[0]+" is back in the rotation");
}
function unsuspendAll(){
  const n=(S.suspended||[]).length;
  (S.suspended||[]).forEach(i=>{ if(S.cards[i]) S.cards[i].due=today(); });
  S.suspended=[]; save(); renderProgress();
  toast(n===1?"That word is back in the rotation":"All "+n+" words are back in the rotation");
}

let UNDO=null;   // last-grade snapshot for the session Undo button

/* ============================================================
   NAVIGATION
   ============================================================ */
function showScreen(name){
  // A history entry can name a screen this build no longer has — "lookup"
  // was folded into "tables". Fall back rather than throw on a null element.
  if(!document.getElementById("s-"+name)) name="today";
  // Nothing should still be speaking on a screen you have left.
  if(typeof stopEntry==="function") stopEntry();
  if(typeof stopSequence==="function") stopSequence();
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("on"));
  document.getElementById("s-"+name).classList.add("on");
  document.querySelectorAll("nav button").forEach(b=>
    b.classList.toggle("on", b.dataset.go===name));
  window.scrollTo(0,0);
  if(name==="today")render();
  if(name==="learn")renderLessons();
  if(name==="drill")renderDrill();
  if(name==="read")renderRead();
  if(name==="tables")renderTables();
  if(name==="prog")renderProgress();
  if(name==="help")renderHelp();
}

/* ---- back button ----
   The manifest asks for "standalone", so on the phone there is no browser
   chrome and the system back gesture is the only Back there is. With no
   history of our own it closed the app from any screen — five minutes into
   John 8, one swipe and you are out. Every destination now leaves an entry.

   Going back replays the entry by re-running the navigation that produced
   it — which would push a duplicate on top of the entry we just returned
   to, so Back would land you where you started. NAV_REPLAY suppresses that.
   Every opener pushes synchronously, before its first await, so the flag
   covers a whole replay even though the reader loads asynchronously. */
let NAV_REPLAY=false;
function pushNav(st){
  if(NAV_REPLAY) return;
  // Also stops a re-tapped nav tab stacking identical entries.
  try{
    if(JSON.stringify(history.state)===JSON.stringify(st)) return;
    history.pushState(st,"");
  }catch(e){}
}
function go(name){ showScreen(name); pushNav({screen:name}); }

function navReplay(st){
  NAV_REPLAY=true;
  try{
    if(!st || !st.screen){ showScreen("today"); return; }
    if(st.screen==="lesson" && st.id){ openLesson(st.id); return; }
    if(st.screen==="read"){
      showScreen("read");
      if(st.gnt==="books") openGnt();
      else if(st.gnt==="book") openGntBook(st.a);
      else if(st.gnt==="ch") openGntChapter(st.a,st.c);
      else if(st.r) openRead(st.r);
      return;
    }
    showScreen(st.screen);
  } finally { setTimeout(()=>{ NAV_REPLAY=false; },0); }
}
addEventListener("popstate",e=>navReplay(e.state));
try{ history.replaceState({screen:"today"},""); }catch(e){}

document.querySelectorAll("nav button").forEach(b=>
  b.onclick=()=>go(b.dataset.go));

/* ============================================================
   TODAY
   ============================================================ */
/* ============================================================
   TODAY'S PLAN
   ------------------------------------------------------------
   Three or four short things that together are about ten minutes, ticked off
   as they are done. Today used to be a ring counting raw reviews and two
   buttons, which said nothing about what a day's work actually was — and
   left the alphabet buried in a menu.

   Every task here runs something that already existed. The plan is an order
   and a set of ticks, not a new kind of session.
   ============================================================ */
let PLAN_TASK=null;                 // which plan row the running session is

const planDone=()=>((S.plan&&S.plan.day===today())?S.plan.done:[])||[];
function planTick(id){
  const d=today();
  if(!S.plan||S.plan.day!==d) S.plan={day:d,done:[]};
  if(!S.plan.done.includes(id)) S.plan.done.push(id);
  save();
}
/* The tick is set when a session ends, so quitting halfway does not count —
   and for a chapter, only lessonDone() finishes it. */
function runPlanTask(id){
  const t=todaysPlan().find(x=>x.id===id);
  if(!t) return;
  t.run();                          // startSession clears PLAN_TASK …
  PLAN_TASK=id;                     // … so claim it afterwards
}

/* Eight of the letters you are least sure of, then one to trace. */
function letterWarmup(){
  const weak=alphaWeak(8);
  const heard=weak.filter(a=>AUDIO_BY_GREEK && AUDIO_BY_GREEK[a[0]]);
  const q=alphaDrill(8,weak);
  // one written, at the end, on a letter that needs it
  return q.concat(writeLetterDrill(1,(heard.length?heard:weak).slice(0,1)));
}

function todaysPlan(){
  const tasks=[];
  const left=alphaLeft();
  if(left) tasks.push({id:"letters",
    label:"Letters and sounds",
    sub:left===ALPHABET.length
      ? "Start here — everything else needs them"
      : `${left} of ${ALPHABET.length} still to settle`,
    run:()=>startSession(letterWarmup(),"letters")});

  /* On a fresh install there is nothing to review, and startReview() would
     quietly fall through to introducing words — which is the next row's job.
     So the row only appears once the deck has been started. */
  const due=dueList().length+Math.min(5,gdueList().length);
  if(due || Object.keys(S.cards).length) tasks.push(due
    ? {id:"review", label:`Review ${due} due card${due===1?"":"s"}`,
       sub:"The words the schedule says you are about to forget",
       run:()=>startReview()}
    : {id:"review", label:"Practise what you know",
       sub:"Nothing is due — this will not touch the schedule",
       run:()=>startReview()});

  const fresh=LEARN_ORDER.filter(i=>!S.cards[i]&&!skipWord(i)).length;
  if(fresh) tasks.push({id:"new",
    label:`Learn ${Math.min(5,fresh)} new word${fresh===1?"":"s"}`,
    sub:`${fresh} still to meet in the course`,
    run:()=>startNew(5)});

  /* The chapter you are part-way through, else the next unread one. */
  const lp=S.lessonPart;
  const l=(lp&&LESSONS.find(x=>x.id===lp.id))||LESSONS.find(x=>!S.lessons.includes(x.id));
  if(l){
    const n=lessonParts(l).length;
    const at=(lp&&lp.id===l.id)?Math.min(lp.part,n-1):0;
    /* Once the row is ticked it points at the *next* chapter, so keeping the
       chapter's name on a struck-through row would say chapter 4 was finished
       when chapter 1 was. Say what tapping it would do instead. */
    const already=planDone().includes("lesson");
    tasks.push({id:"lesson",
      label:already ? "Another chapter"
        : at ? `Chapter ${l.id} · from part ${at+1} of ${n}`
             : `Chapter ${l.id} · ${n} parts`,
      sub:already ? `Next up: chapter ${l.id}, ${l.t.toLowerCase()}` : l.t,
      run:()=>lessonWalk(l.id,at)});
  }
  return tasks;
}

function planHtml(){
  const done=planDone();
  return todaysPlan().map(t=>{
    const ok=done.includes(t.id);
    return `<button class="plan-row${ok?" done":""}" onclick="runPlanTask('${t.id}')">
      <span class="tick">${ok?"✓":""}</span>
      <span class="t"><b>${t.label}</b><span>${t.sub}</span></span>
      <span class="chev">${ok?"":"›"}</span></button>`;
  }).join("");
}

/* Offered at the end of a session so finishing one thing leads to the next
   rather than to a dead end. Replaces the stub defined near finish(). */
function nextTaskHtml(){
  const done=planDone();
  const next=todaysPlan().find(t=>!done.includes(t.id));
  if(!next) return `<p class="muted" style="text-align:center;font-size:.86rem;margin:0 0 12px">
    That is today's plan finished.</p>`;
  return `<button class="btn" onclick="runPlanTask('${next.id}')">Next — ${next.label.replace(/^./,c=>c.toLowerCase())}</button>
    <div style="height:9px"></div>`;
}

function render(){
  // Grammar is part of the review, so it is part of the count — capped at the
  // five the session will actually serve.
  const due=dueList().length+Math.min(5,gdueList().length);
  /* The ring measures the plan now, not raw reviews against a goal. The goal
     setting still governs how many cards a review serves; what it no longer
     does is decide whether the day looks finished, which it did badly — a
     day 292 cards behind could paint a completed circle. */
  const plan=todaysPlan(), pdone=planDone();
  const ticked=plan.filter(t=>pdone.includes(t.id)).length;
  const pct=plan.length?ticked/plan.length:0;
  document.getElementById("ringArc").style.strokeDashoffset = 415-(415*pct);
  document.getElementById("ringNum").textContent = `${ticked}/${plan.length}`;
  document.getElementById("ringLbl").textContent =
    ticked>=plan.length ? "plan complete" : "today's plan";
  document.getElementById("streakN").textContent=S.streak;
  const restEl=document.getElementById("streakRest");
  if(restEl) restEl.textContent =
    (S.restUsed && daysBetween(S.restUsed,today())<7) ? "\u00b7 rest day used" : "";
  // The home-screen icon badge stays a count of work, not of plan steps.
  paintBadge(due);
  document.getElementById("planList").innerHTML=planHtml();
  const nextT=plan.find(t=>!pdone.includes(t.id));
  const cont=document.getElementById("btnContinue");
  cont.textContent = nextT ? `Continue — ${nextT.label.replace(/^./,c=>c.toLowerCase())}`
                           : "Practise anyway";
  cont.onclick = nextT ? ()=>runPlanTask(nextT.id) : ()=>startReview();

  /* Only until the deck has been touched — then it goes and does not come
     back. A permanent link at the foot of the screen leads to the same page
     for anyone returning after a gap. */
  const fresh=Object.keys(S.cards).length===0 && !Object.keys(S.gcards||{}).length;
  const startEl=document.getElementById("startHere");
  if(startEl) startEl.innerHTML = fresh ? `<div class="card" style="border-color:var(--gold-dim)">
      <h3 style="margin-top:0">Start here</h3>
      <p class="muted" style="font-size:.87rem;margin:0 0 12px">Work down the list above.
        It is about ten minutes, and it is the same shape every day: the letters
        until they stick, then the words the schedule brings back, then five new
        ones, then a few minutes of the chapter you are on.</p>
      <button class="btn ghost small" onclick="go('help')">What else is in here</button>
    </div>` : "";

  const pin=S.pin, pinEl=document.getElementById("pinned");
  if(pinEl) pinEl.innerHTML = (pin&&pin.a) ? `<h2>This week's passage</h2>
    <button class="lesson-item" onclick="openGntChapter('${pin.a}',${pin.ch})" style="border-color:var(--gold-dim)">
      <span class="t"><b>${pin.t} ${pin.n}</b><span>Pinned for sermon preparation</span></span>
      <span class="muted">›</span></button>` : "";

  checkBadges();
}

/* ============================================================
   SESSIONS
   ============================================================ */
let Q=[], qi=0, mode="";
let REQUEUED={};                 // VOCAB index -> times re-queued this session
function startSession(queue,label){
  Q=queue; qi=0; mode=label; SESSION_XP=0; REQUEUED={};
  COMBO=0; COMBO_BEST=0; RIGHT=0; ASKED=0; REVIEWED=0; comboPaint();
  if(typeof prepAhead==="function" && Array.isArray(queue.__words)) prepAhead(queue.__words);
  UNDO=null;
  const bu=document.getElementById("btnUndo"); if(bu) bu.style.display="none";
  if(!Q.length){toast("Nothing to practise here yet");return;}
  touchDay(); go("session"); step();
}
document.getElementById("btnQuit").onclick=()=>{go("today");};

function step(){
  const bar=document.getElementById("sessBar");
  bar.style.width=(qi/Q.length*100)+"%";
  document.getElementById("sessCount").textContent=`${Math.min(qi+1,Q.length)} / ${Q.length}`;
  if(qi>=Q.length){ finish(); return; }
  Q[qi]();
}
function finish(){
  const b=document.getElementById("sessBody");
  /* Undo lives outside sessBody, so it survives this re-render. Left live it
     would replay the last card and pay the whole session's XP again. */
  UNDO=null;
  const bu=document.getElementById("btnUndo"); if(bu) bu.style.display="none";
  document.getElementById("sessBar").style.width="100%";
  COMBO=0; comboPaint();
  // A plan row is ticked by finishing it, not by starting it.
  if(PLAN_TASK){ planTick(PLAN_TASK); PLAN_TASK=null; }
  checkBadges();
  /* Worth reading, rather than "+42 XP". Accuracy is only shown when
     something was actually marked: a vocabulary review is self-graded, so
     there is no accuracy to report and claiming one would be a lie. */
  const line=[];
  if(ASKED) line.push(`<b>${RIGHT} of ${ASKED}</b> right`);
  if(REVIEWED) line.push(`<b>${REVIEWED}</b> card${REVIEWED===1?"":"s"} reviewed`);
  if(COMBO_BEST>=3) line.push(`best run <b>${COMBO_BEST}</b>`);
  const nx=nextTaskHtml();
  b.innerHTML=`<div class="empty"><span class="gk">τέλος</span>
    <p>Session complete.</p>
    ${line.length?`<p>${line.join(" · ")}</p>`:""}
    <p><b>+${SESSION_XP} XP</b> · streak ${S.streak} day${S.streak===1?"":"s"}</p></div>
    ${nx}
    <button class="btn ghost" onclick="go('today')">Back to today</button>`;
}

/* The example verse with its word picked out of the line. A gloss tells you
   what a word means; a verse shows you what it does, and every one of these
   is short enough and common enough to be read rather than decoded. */
function exampleHtml(i){
  const e=(typeof EXAMPLES!=="undefined") && EXAMPLES[i];
  if(!e) return "";
  const w=e[1].split(" ");
  const at=e[2];
  let form="";
  if(at>=0 && at<w.length){
    /* Say what the form is. The verse is chosen to show the word as the card
       spells it where the corpus allows, but 23 of them can only show an
       augmented or reduplicated verb — ἔλεγον for λέγω — and unlabelled that
       reads as a different word. e[3] and e[4] are the part of speech and the
       parse code straight from MorphGNT; gntParse is the same renderer the
       Read tab uses, and js/gnt.js loads before this file. */
    if(e[3] && e[4] && typeof gntParse==="function"){
      const p=gntParse(e[3],e[4]);
      if(p) form=`<span class="form"><span class="gk">${w[at].replace(/[.,;·:!?]+$/,"")}</span> — ${p}</span>`;
    }
    w[at]=`<b>${w[at]}</b>`;
  }
  return `<div class="ex"><span class="gk">${w.join(" ")}</span>${form}<span class="ref">${e[0]}</span></div>`;
}
/* The principal parts, for the forty-one verbs that have them. They were
   only ever visible inside one drill; on the card they are seen by anyone
   reviewing that verb. */
function partsHtml(i){
  const head=VOCAB[i][0].split(",")[0].trim();
  const p=(typeof PP!=="undefined") && PP.find(x=>x[0]===head);
  if(!p) return "";
  const shown=p.slice(1).filter(x=>x!=="—");
  if(!shown.length) return "";
  return `<div class="parts"><span class="gk">${p[0]}, ${shown.join(", ")}</span></div>`;
}

/* ---- flashcard (self-graded, for SRS) ---- */
function flashcard(i){
  return ()=>{
    const v=VOCAB[i], b=document.getElementById("sessBody");
    // A stale or imported card can point past the end of the deck; skip it
    // rather than letting one bad index end the review.
    if(!v){ delete S.cards[i]; save(); qi++; step(); return; }
    b.innerHTML=`
      <div class="fc">
        <div class="word gk" id="word">${v[0].split(",")[0]}</div>
        ${VOCAB_AUDIO[i]?`<button class="btn ghost small" style="margin-top:10px" onclick="playWord(${i},null)">\uD83D\uDD0A Hear it</button>`:""}
        <div class="rule"></div>
        <div class="ans" id="ans" style="visibility:hidden">${v[1]}</div>
        <div class="meta" id="meta" style="visibility:hidden">${v[0]!==v[0].split(",")[0]?`<span class="gk">${v[0]}</span>${VOCAB_AUDIO[i]&&extraForms(i).length?` <button class="mini" onclick="playEntry(${i})" aria-label="Hear the whole entry">\uD83D\uDD0A</button>`:""} · `:""}${v[3]} · ${v[2]}× in the NT${isLeech(i)?'<span class="leech">sticking point</span>':""}</div>
        <div id="extra" style="visibility:hidden">${partsHtml(i)}${exampleHtml(i)}</div>
      </div>
      <button class="btn" id="show">Show meaning</button>`;
    prepWord(i);
    document.getElementById("show").onclick=()=>{
      document.getElementById("ans").style.visibility="visible";
      document.getElementById("meta").style.visibility="visible";
      const ex=document.getElementById("extra"); if(ex) ex.style.visibility="visible";
      /* Automatic, so it is quiet about a clip it cannot reach — thirty
         toasts in an offline review would be worse than the silence. */
      if(S.speak!==0) playWord(i,null,true);
      document.getElementById("show").outerHTML=`
        ${isLeech(i)?`<p class="muted" style="font-size:.8rem;text-align:center;margin:0 0 8px">
           You have lost this one ${S.cards[i].lapses} times. Make a mnemonic, or
           <a href="#" onclick="suspendWord(${i});return false" style="color:var(--gold)">set it aside</a>.</p>`:""}
        <div class="grades">
          <button class="g1" onclick="grade(${i},0)">Again<i>&lt;1m</i></button>
          <button class="g2" onclick="grade(${i},1)">Hard<i>${nextIvl(i,1)}d</i></button>
          <button class="g3" onclick="grade(${i},2)">Good<i>${nextIvl(i,2)}d</i></button>
          <button class="g4" onclick="grade(${i},3)">Easy<i>${nextIvl(i,3)}d</i></button>
        </div>`;
    };
  };
}
/* The same arithmetic the scheduler uses, so the button cannot lie. (It
   once had no g===1 branch, so Hard fell through to the Easy path.) The
   fuzz applied on top moves the real date by at most a few percent. */
function nextIvl(i,g){ return baseIvl(card(i),g); }
function grade(i,g){
  UNDO={i, qi, prev:JSON.parse(JSON.stringify(S.cards[i])), requeued:g===0,
        reviews:S.reviewsToday||0, practice:PRACTICE};
  if(!PRACTICE){
    schedule(i,g);
    S.reviewsToday=(S.reviewsToday||0)+1;
  }
  save();
  addXp(3);                    // per graded card, so a lapse cannot pay twice
  SESSION_XP+=3;
  REVIEWED++;
  /* No combo and no accuracy here: you graded yourself, so there is nothing
     to be right about. Anything else would be a score you awarded yourself. */
  /* The button says "<1m" and Q.push() meant the end of the session — eight
     to fifteen minutes, by which time the answer you were just shown has
     gone, so you fail it again and the lapse count calls an ordinary word a
     sticking point. Three along genuinely is under a minute. Twice per card
     is the budget: a third pass spins the counter without teaching you
     anything, and the word is due again today regardless. */
  if(g===0){
    const seen=REQUEUED[i]||0;
    if(seen<2){
      REQUEUED[i]=seen+1;
      UNDO.at=Math.min(qi+3,Q.length);
      Q.splice(UNDO.at,0,flashcard(i));
    } else UNDO.requeued=false;
  }
  document.getElementById("btnUndo").style.display="";
  qi++; step();
}
document.getElementById("btnUndo").onclick=()=>{
  if(!UNDO) return;
  S.cards[UNDO.i]=UNDO.prev;
  // Give the re-queue back as well, or an undo silently costs the card one
  // of its two second looks.
  if(UNDO.requeued){ Q.splice(UNDO.at,1); REQUEUED[UNDO.i]=Math.max(0,(REQUEUED[UNDO.i]||1)-1); }
  S.reviewsToday=UNDO.reviews;
  save();
  qi=UNDO.qi; UNDO=null;
  document.getElementById("btnUndo").style.display="none";
  step();
};

/* ============================================================
   HOW AN ANSWER FEELS
   ------------------------------------------------------------
   Someone else was handed the app and called it lifeless. They were right:
   getting one right tinted a border, printed a paragraph and played a sound,
   and nothing in the session told you how it was going.

   None of this touches the schedule, the grading or a single word of
   content. It is sound, motion and a running count. The reduced-motion rule
   at the top of app.css turns every animation off for anyone who asks for
   that, and the whole lot is silent when Answer sounds is Off.
   ============================================================ */
let COMBO=0, COMBO_BEST=0, RIGHT=0, ASKED=0, REVIEWED=0;

function comboPaint(){
  const el=document.getElementById("sessCombo");
  if(!el) return;
  // Two is not a run. Three is.
  el.textContent = COMBO>=3 ? `🔥 ${COMBO} in a row` : "";
  el.className = "combo" + (COMBO>=10 ? " blaze" : COMBO>=5 ? " hot" : "");
}

/* A "+2" that lifts off the button it was earned on. */
function floatXp(el,n){
  if(!el||!el.appendChild) return;
  const s=document.createElement("span");
  s.className="xpfly"; s.textContent="+"+n;
  el.appendChild(s);
  setTimeout(()=>{ try{ s.remove(); }catch(e){} },1000);
}

/* One place, so the quiz and the writing pad answer the same way.
   `silent` is for the trace: a trace that falls short says "have another
   go", and giving it a wrong-answer buzzer would undo that. */
function answerFelt(ok,el,silent){
  ASKED++; if(ok) RIGHT++;
  if(ok){ COMBO++; COMBO_BEST=Math.max(COMBO_BEST,COMBO); } else COMBO=0;
  comboPaint();
  if(!silent) sfx(ok?"correct":"wrong");
  /* Tied to the Answer sounds setting rather than given one of its own —
     it is the same decision, how loudly the app should react. A no-op on
     iOS, and guarded because some browsers throw rather than ignore it. */
  const snd=(S.sfx===undefined?2:S.sfx);
  try{
    if(!silent && navigator.vibrate && (ok ? snd>0 : snd>1))
      navigator.vibrate(ok?12:[7,40,7]);
  }catch(e){}
  if(!ok) return;
  const bar=document.getElementById("sessBar");
  if(bar){ bar.classList.remove("hit"); void bar.offsetWidth; bar.classList.add("hit"); }
  if(el) floatXp(el,2);
  // Small on purpose: a run must never out-earn the 3 XP a graded card pays,
  // or the fastest way to level up becomes the one that teaches least.
  if(COMBO===5||COMBO===10){ addXp(COMBO); SESSION_XP+=COMBO; toast(`${COMBO} in a row · +${COMBO} XP`); }
}

/* ---- multiple choice ----
   `after` is an optional callback given the verdict — the letter drills use
   it to keep their own tally. Sixth and last, so every existing call site
   is untouched. */
function mcq(q,opts,ans,why,gkey,after){
  return ()=>{
    const b=document.getElementById("sessBody");
    b.innerHTML=`<div class="card"><p style="margin:0;font-size:1.02rem">${q}</p></div>
      <div id="opts"></div><div id="fb"></div>`;
    const box=document.getElementById("opts");
    opts.forEach((o,k)=>{
      const btn=document.createElement("button");
      btn.className="opt"; btn.innerHTML=o;
      btn.onclick=()=>{
        [...box.children].forEach(c=>c.onclick=null);
        const good=k===ans;
        box.children[ans].classList.add("right");
        if(!good) btn.classList.add("wrong");
        document.getElementById("fb").innerHTML=
          `<div class="feedback"><b>${good?"Correct":"Not quite"}</b>${why}</div>
           <button class="btn" onclick="qi++;step()">Continue</button>`;
        answerFelt(good, good?box.children[ans]:btn);
        /* SESSION_XP as well as the total. It was only ever added to by
           grade(), so a session made entirely of questions — every drill in
           the Grammar group — really earned the XP and then signed off with
           "+0 XP". Harmless while the summary was one line; not now. */
        if(good){ addXp(2); SESSION_XP+=2; }
        if(gkey) gradeGrammar(gkey,good);
        if(after) after(good);
      };
      box.appendChild(btn);
    });
  };
}

/* ---- session builders ---- */
/* Free practice must not touch the schedule. Grading a card that was due in
   55 days would otherwise rewrite it to 150 days out — throwing away the
   retention test that was the point of the interval. */
let PRACTICE=false;
let SESSION_XP=0;

function startReview(){
  let d=dueList();
  const gd=gdueList().sort(()=>Math.random()-.5).slice(0,5);
  PRACTICE=false;
  if(!d.length && !gd.length){
    const started=VOCAB.map((_,i)=>i).filter(i=>S.cards[i] && !skipWord(i));
    if(!started.length){ startNew(5); return; }        // fresh install: introduce instead
    d=started.sort(()=>Math.random()-.5).slice(0,15);  // nothing due: free practice
    PRACTICE=true;
  }
  const words=d.slice(0, Math.max(5, S.goal||20));
  const q=words.map(flashcard); q.__words=words;
  /* A few grammar questions at the end of the review. Not in free practice:
     that mode must not touch anything's schedule. */
  if(!PRACTICE) gd.forEach(k=>{ const x=gquestion(k); q.push(mcq(x.q,x.o,x.a,x.w,k)); });
  startSession(q,"review");
}
/* SRS cards are keyed by VOCAB index, so data/vocab.js must be append-only.
   New words are introduced by NT frequency regardless of array position. */
/* 237 (τέ) duplicates 72 (τε) — the corpus lists the lemma accented and the
   original deck did not, so the expansion added it twice. Indexes cannot be
   removed (cards are keyed by them), so it is retired from introduction. */
const RETIRED=new Set([237]);
const skipWord=i=>RETIRED.has(i)||(S.suspended||[]).includes(i);

const LEARN_ORDER=VOCAB.map((_,i)=>i).filter(i=>!RETIRED.has(i))
  .sort((a,b)=>VOCAB[b][2]-VOCAB[a][2]);

function startNew(n=5){
  const fresh=[];
  for(const i of LEARN_ORDER){ if(fresh.length>=n) break; if(!S.cards[i] && !skipWord(i)) fresh.push(i); }
  introduce(fresh,"You've started every word in the deck");
}
/* Words are introduced by New Testament frequency, which is right for the
   daily button but wrong when you are working a chapter: you finish the
   second declension and are handed particles that do not decline at all.
   This takes the next five from the chapter's own vocabulary list in Black.
   Frequency stays the default everywhere else. */
function startLessonWords(id,n=5){
  const l=LESSONS.find(x=>x.id===id);
  const fresh=(l&&l.v||[]).filter(i=>!S.cards[i] && !skipWord(i)).slice(0,n);
  introduce(fresh,"You have started every word in this chapter");
}
function lessonWordsLeft(id){
  const l=LESSONS.find(x=>x.id===id);
  return (l&&l.v||[]).filter(i=>!S.cards[i] && !skipWord(i)).length;
}
function introduce(fresh,emptyMsg){
  /* An index this build cannot resolve — a chapter list read against an
     older vocab.js, or a stale cached copy of one of the two — must not take
     the session down with it. flashcard() already survives that; so does
     this now. */
  fresh=fresh.filter(i=>VOCAB[i]);
  if(!fresh.length){toast(emptyMsg);return;}
  const q=[];
  q.__words=fresh;
  // Do not create the cards up front: quitting after the first word left the
  // rest counted as started but never introduced. Every downstream path
  // creates the card lazily.
  fresh.forEach(i=>{ q.push(flashcard(i)); });
  fresh.forEach(i=>{
    const v=VOCAB[i];
    // By value, not index: three glosses appear twice in the deck, so an
    // identical option could be rendered and scored wrong.
    const wrong=VOCAB.filter((x,k)=>k!==i && x[1]!==v[1] && !RETIRED.has(k)).sort(()=>Math.random()-.5).slice(0,3).map(x=>x[1]);
    const opts=[v[1],...wrong].sort(()=>Math.random()-.5);
    q.push(mcq(`What does <span class="q-gk">${v[0].split(",")[0]}</span> mean?`,
      opts, opts.indexOf(v[1]), `${v[1]} — ${v[3]}, appears about ${v[2]} times in the NT.`));
  });
  save(); startSession(q,"new");
}

/* ============================================================
   LESSONS
   ============================================================ */
function renderLessons(){
  document.getElementById("lessonList").innerHTML=LESSONS.map(l=>`
    <button class="lesson-item ${S.lessons.includes(l.id)?"done":""}" onclick="openLesson(${l.id})">
      <span class="n">${S.lessons.includes(l.id)?"✓":l.id}</span>
      <span class="t"><b>${l.t}</b><span>${l.s}</span></span>
    </button>`).join("");
}
/* ---- Watch ----
   Daily Dose serves its 26 lectures through its own player — no iframe in
   the page source, and they are not on its YouTube channel — so those stay
   as links out. Its songs and memory devices are ordinary YouTube videos and
   play here instead of throwing you into a browser.

   Nothing off-origin loads until the row is tapped: no thumbnail, no player
   script, no cookie. The service worker already returns early for
   cross-origin requests (sw.js), so none of it is cached either, and the
   existing body.off rule greys the row out when there is no connection. */
const attr=s=>String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;")
                       .replace(/</g,"&lt;").replace(/>/g,"&gt;");
function vidRowHtml(v){
  if(!v.yt) return `<a class="vid" href="${v.u}" target="_blank" rel="noopener">
      <span class="p">▶</span><span><b>${v.t}</b><span>${v.s}</span><span class="net">Needs a connection</span></span></a>`;
  return `<button class="vid" data-yt="${attr(v.yt)}" data-t="${attr(v.t)}" onclick="playVid(this)">
      <span class="p">▶</span><span><b>${v.t}</b><span>${v.s}</span><span class="net">Needs a connection</span></span></button>`;
}
function playVid(el){
  const id=el.dataset.yt, t=el.dataset.t;
  if(!/^[\w-]{11}$/.test(id)) return;      // an id, not a URL someone slipped in
  el.outerHTML=`<div class="vidbox"><iframe
      src="https://www.youtube-nocookie.com/embed/${id}?rel=0"
      title="${attr(t)}" loading="lazy" allowfullscreen
      referrerpolicy="strict-origin-when-cross-origin"
      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    ></iframe></div>`;
}

function openLesson(id){
  const l=LESSONS.find(x=>x.id===id);
  const parts=lessonParts(l).length;
  const at=(S.lessonPart&&S.lessonPart.id===id)?S.lessonPart.part:0;
  document.getElementById("lessonBody").innerHTML=`
    <h1 style="margin-top:14px">${l.t}</h1>
    <p class="sub">${l.s}</p>
    <div class="card" style="border-color:var(--gold-dim)">
      <p style="margin:0 0 10px;font-size:.9rem">${
        at?`You stopped at part <b>${at+1}</b> of ${parts}.`
          :`<b>${parts} short parts</b> and ${l.quiz.length} questions, about ten minutes — a
             little reading, then a chance to use it, rather than the whole chapter and a test.`}</p>
      <button class="btn" onclick="lessonWalk(${id},${at})">${at?"Pick it up again":"Work through it"}</button>
    </div>
    <h2 style="margin-top:26px">The chapter</h2>
    ${l.body}
    <h2>Watch</h2>
    ${l.vids.map(vidRowHtml).join("")}
    ${(l.v||[]).length?`<h2>This chapter's words</h2>
    <p class="muted" style="font-size:.87rem">The ${(l.v||[]).length} words Black introduces in this chapter${lessonWordsLeft(id)?`, ${lessonWordsLeft(id)} of them not yet started`:" — all started"}.</p>
    <button class="btn ghost" onclick="startLessonWords(${id})"${lessonWordsLeft(id)?"":" disabled"}>${
      lessonWordsLeft(id)>=5?"Learn five of them"
      :lessonWordsLeft(id)?`Learn the remaining ${lessonWordsLeft(id)}`
      :"All of them started"}</button>`:""}
    <h2>Test yourself</h2>
    <p class="muted" style="font-size:.87rem">All ${l.quiz.length} questions in one go, with no reading in between. Retrieval beats rereading — attempt each one before you look.</p>
    <button class="btn ghost" onclick="lessonQuiz(${id})">Start the test</button>
    <div style="height:34px"></div>`;
  showScreen("lesson"); pushNav({screen:"lesson",id});
  fillAlphaHere();
}
/* Chapter 1's body carries an empty <div id="alphaHere">. The sound grids are
   generated from AUDIO_CLIPS rather than stored, so they have to be poured in
   after the body is rendered — by the chapter page and by the step-by-step
   walk alike. Missing this from the walk would empty the alphabet out of the
   one chapter that is entirely about the alphabet. */
function fillAlphaHere(){
  const ah=document.getElementById("alphaHere");
  if(ah) ah.innerHTML=
    soundGridHtml("letter")
    + playAllHtml("letter")
    + `<p class="muted" style="font-size:.83rem;margin-top:10px">Tap any letter to hear it: the name, then the sound. Say it back aloud — silent review does not work here.</p>
    <h3>Diphthongs</h3>
    <p>Two vowels written together make one sound. These eight are worth knowing before you meet them mid-word.</p>`
    + soundGridHtml("diphthong")
    + playAllHtml("diphthong")
    + `<p class="muted" style="font-size:.83rem;margin-top:16px">Writing them is how the shapes settle. Trace each letter with a finger, or the mouse.</p>
    <button class="btn ghost" onclick="startSession(writeLetterDrill(),'d')">Practise writing the letters</button>
    <p style="margin-top:14px"><a class="vid local" href="audio/erasmian-alphabet-chart.pdf" target="_blank" rel="noopener">
        <span class="p">↓</span><span><b>Printable alphabet chart</b><span>One-page PDF: names, sounds and diphthongs</span></span></a></p>`;
}
function lessonQuiz(id){
  const l=LESSONS.find(x=>x.id===id);
  // Answering here both creates the card and gives it its first grade, so a
  // lesson you pass starts on the schedule rather than falling off it.
  const q=l.quiz.map((x,n)=>mcq(x.q,x.o,x.a,x.w,`L${id}q${n}`));
  q.push(lessonDone(id));
  startSession(q,"lesson");
}

/* ---- a chapter, worked through in ten minutes ----
   The chapter page is 300 words of prose with a test bolted on the end, and
   reading 300 words then answering six questions is the shape that made this
   feel like homework. The same material, cut at its own <h3> headings and
   asked about as you go, is three or four two-minute steps.

   Nothing is rewritten to do it: the parts are the chapter's own sections,
   the questions are the chapter's own quiz, and they carry the same
   L{id}q{n} keys, so a question answered here lands on exactly the grammar
   schedule the end-of-chapter test feeds. The page itself is untouched and
   still there to re-read. */
function lessonParts(l){
  // Lookahead, so each <h3> stays attached to the section it opens. Part 0
  // is whatever comes before the first heading; chapters 12, 14 and 21 have
  // only one heading and so run to two parts, which is fine — they are short.
  return l.body.split(/(?=<h3>)/).filter(s=>s.trim()).map(html=>{
    const m=html.match(/^<h3>([\s\S]*?)<\/h3>/);
    return {html, title:m?m[1].replace(/<[^>]+>/g,""):null};
  });
}
function lessonStep(l,parts,k){
  return ()=>{
    // Written down every step, so Today can say where you stopped.
    S.lessonPart={id:l.id,part:k}; save();
    document.getElementById("sessBody").innerHTML=`
      <p class="muted" style="font-size:.78rem;margin:0 0 8px">
        Chapter ${l.id} · part ${k+1} of ${parts.length}${parts[k].title?` · ${parts[k].title}`:""}</p>
      <div class="card read">${parts[k].html}</div>
      <button class="btn" onclick="qi++;step()">Continue</button>`;
    fillAlphaHere();
  };
}
function lessonDone(id){
  return ()=>{
    if(!S.lessons.includes(id)){S.lessons.push(id);save();}
    if(S.lessonPart && S.lessonPart.id===id){ S.lessonPart=null; save(); }
    // This screen stands in for finish(), so it has to tick the plan too.
    if(PLAN_TASK){ planTick(PLAN_TASK); PLAN_TASK=null; }
    COMBO=0; comboPaint();
    checkBadges();
    const line=[];
    if(ASKED) line.push(`<b>${RIGHT} of ${ASKED}</b> right`);
    if(COMBO_BEST>=3) line.push(`best run <b>${COMBO_BEST}</b>`);
    document.getElementById("sessBody").innerHTML=`
      <div class="empty"><span class="gk">εὖγε</span>
        <p>Chapter ${id} complete.</p>
        ${line.length?`<p>${line.join(" · ")}</p>`:""}</div>
      ${nextTaskHtml()}
      <button class="btn ghost" onclick="go('learn')">Back to lessons</button>`;
    document.getElementById("sessBar").style.width="100%";
    addXp(12);
  };
}
function lessonWalk(id,from){
  const l=LESSONS.find(x=>x.id===id);
  if(!l) return;
  const parts=lessonParts(l);
  const start=Math.min(Math.max(0,from|0),parts.length-1);
  const q=[];
  for(let k=start;k<parts.length;k++){
    q.push(lessonStep(l,parts,k));
    l.quiz.forEach((x,n)=>{ if(x.sec===k) q.push(mcq(x.q,x.o,x.a,x.w,`L${id}q${n}`)); });
  }
  /* Everything not filed against a part still gets asked, at the end — which
     is also what happens for a chapter whose questions carry no sec at all,
     so this degrades exactly to the old test rather than losing questions.
     On a resume, a question belonging to a part already read is only re-asked
     if it was never answered; S.gcards is the record of that. */
  const g=S.gcards||{};
  l.quiz.forEach((x,n)=>{
    const filed=Number.isInteger(x.sec) && x.sec>=0 && x.sec<parts.length;
    if(filed && x.sec>=start) return;                 // asked inline above
    if(filed && x.sec<start && g[`L${id}q${n}`]) return;   // answered already
    q.push(mcq(x.q,x.o,x.a,x.w,`L${id}q${n}`));
  });
  q.push(lessonDone(id));
  startSession(q,"lesson");
}

/* ============================================================
   DRILLS
   ============================================================ */
const ART=[
["ὁ","masculine nominative singular"],["τοῦ","masculine/neuter genitive singular"],
["τῷ","masculine/neuter dative singular"],["τόν","masculine accusative singular"],
["ἡ","feminine nominative singular"],["τῆς","feminine genitive singular"],
["τῇ","feminine dative singular"],["τήν","feminine accusative singular"],
["τό","neuter nominative/accusative singular"],["οἱ","masculine nominative plural"],
["τῶν","genitive plural (all genders)"],["τοῖς","masculine/neuter dative plural"],
["τούς","masculine accusative plural"],["αἱ","feminine nominative plural"],
["ταῖς","feminine dative plural"],["τάς","feminine accusative plural"],
["τά","neuter nominative/accusative plural"]
];
const PARSE=[
["λύω","1st singular present active indicative"],["λύεις","2nd singular present active indicative"],
["λύει","3rd singular present active indicative"],["λύομεν","1st plural present active indicative"],
["λύετε","2nd plural present active indicative"],["λύουσιν","3rd plural present active indicative"],
["ἔλυον","1st singular or 3rd plural imperfect active indicative"],["ἐλύομεν","1st plural imperfect active indicative"],
["ἔλυσα","1st singular aorist active indicative"],["ἔλυσεν","3rd singular aorist active indicative"],
["ἐλύσαμεν","1st plural aorist active indicative"],["λύεται","3rd singular present middle/passive indicative"],
["λυόμεθα","1st plural present middle/passive indicative"],["λύονται","3rd plural present middle/passive indicative"],
["εἰμί","1st singular present active indicative of εἰμί"],["εἶ","2nd singular present active indicative of εἰμί"],
["ἐστίν","3rd singular present active indicative of εἰμί"],["ἐσμέν","1st plural present active indicative of εἰμί"],
["ἐστέ","2nd plural present active indicative of εἰμί"],["εἰσίν","3rd plural present active indicative of εἰμί"],
["ἦν","3rd singular imperfect active indicative of εἰμί"],["λύων","present active participle, nominative singular masculine"],
["λύσας","aorist active participle, nominative singular masculine"],["λύειν","present active infinitive"],
["λῦσαι","aorist active infinitive"],["λύῃ","3rd singular present active subjunctive (also 2nd singular present middle/passive)"]
];
/* ---- parsing builder: name every element of the form yourself ---- */
const BUILD_FORMS=[
["λύεις",   "pres","act","2","sg"], ["λύομεν",  "pres","act","1","pl"],
["λύεται",  "pres","m/p","3","sg"], ["λύεσθε",  "pres","m/p","2","pl"],
["ἔλυεν",   "impf","act","3","sg"], ["ἐλύετε",  "impf","act","2","pl"],
["ἐλυόμην", "impf","m/p","1","sg"], ["ἐλύοντο", "impf","m/p","3","pl"],
["λύσει",   "fut","act","3","sg"],  ["λύσομεν", "fut","act","1","pl"],
["λύσεται", "fut","mid","3","sg"],  ["λυθήσῃ",  "fut","pass","2","sg"],
["ἔλυσας",  "aor","act","2","sg"],  ["ἐλύσαμεν","aor","act","1","pl"],
["ἐλύσατο", "aor","mid","3","sg"],  ["ἐλύθην",  "aor","pass","1","sg"],
["ἐλύθητε", "aor","pass","2","pl"], ["ἐλύθησαν","aor","pass","3","pl"],
["λέλυκας", "pf","act","2","sg"],   ["λελύκασιν","pf","act","3","pl"],
["λέλυται", "pf","m/p","3","sg"],   ["λελύμεθα","pf","m/p","1","pl"]
];
const BUILD_OPTS={tense:["pres","impf","fut","aor","pf"],voice:["act","mid","pass","m/p"],
                  person:["1","2","3"],number:["sg","pl"]};

function buildDrill(n=8){
  const pool=BUILD_FORMS.slice().sort(()=>Math.random()-.5).slice(0,n);
  return pool.map(f=>()=>{
    const [form,tense,voice,person,number]=f;
    const b=document.getElementById("sessBody");
    const groups=Object.entries(BUILD_OPTS).map(([k,vals])=>`
      <div class="chip-lbl">${k}</div>
      <div class="chips" data-k="${k}">${vals.map(v=>`<button data-v="${v}">${v}</button>`).join("")}</div>`).join("");
    b.innerHTML=`<div class="card" style="text-align:center">
        <span class="q-gk lg">${form}</span>
        <p class="muted" style="font-size:.84rem;margin:6px 0 0">Indicative mood. Build the parse:</p></div>
      ${groups}
      <button class="btn" id="buildGo" disabled>Check</button><div id="fb"></div>`;
    const sel={};
    document.querySelectorAll("#sessBody .chips").forEach(g=>{
      g.onclick=e=>{
        if(e.target.tagName!=="BUTTON")return;
        [...g.children].forEach(c=>c.classList.remove("sel"));
        e.target.classList.add("sel");
        sel[g.dataset.k]=e.target.dataset.v;
        document.getElementById("buildGo").disabled=Object.keys(sel).length<4;
      };
    });
    document.getElementById("buildGo").onclick=()=>{
      const want={tense,voice,person,number};
      const ok=Object.keys(want).every(k=>sel[k]===want[k]);
      document.querySelectorAll("#sessBody .chips button").forEach(c=>c.onclick=null);
      document.getElementById("buildGo").style.display="none";
      document.getElementById("fb").innerHTML=
        `<div class="feedback"><b>${ok?"Correct":"Not quite"}</b>
         <span class="gk">${form}</span> — ${tense} ${voice} ind ${person}${number}.</div>
         <button class="btn" onclick="qi++;step()">Continue</button>`;
      sfx(ok?"correct":"wrong");
      if(ok) addXp(3);
    };
  });
}

/* ---- principal parts ----
   From Black's Appendix 9, with every form checked against the SBLGNT's own
   parse codes by tense *and* voice — the fourth column is the perfect
   ACTIVE, so a perfect middle like δεδόξασμαι must not be allowed to stand
   in for one. A dash means that part does not occur in the New Testament,
   and the drill never asks for it. ἵστημι is left out on purpose: it has two
   aorists, ἔστησα "I set" and ἔστην "I stood", so there is no single right
   answer to ask for. */
const PP=[
["λέγω","ἐρῶ","εἶπον","εἴρηκα"],
["ἔχω","ἕξω","ἔσχον","ἔσχηκα"],
["γίνομαι","γενήσομαι","ἐγενόμην","γέγονα"],
["ἔρχομαι","ἐλεύσομαι","ἦλθον","ἐλήλυθα"],
["ποιέω","ποιήσω","ἐποίησα","πεποίηκα"],
["ὁράω","ὄψομαι","εἶδον","ἑώρακα"],
["ἀκούω","ἀκούσω","ἤκουσα","ἀκήκοα"],
["δίδωμι","δώσω","ἔδωκα","δέδωκα"],
["λαμβάνω","λήμψομαι","ἔλαβον","εἴληφα"],
["πιστεύω","πιστεύσω","ἐπίστευσα","πεπίστευκα"],
["γινώσκω","γνώσομαι","ἔγνων","ἔγνωκα"],
["γράφω","γράψω","ἔγραψα","γέγραφα"],
["εὑρίσκω","εὑρήσω","εὗρον","εὕρηκα"],
["ἐσθίω","φάγομαι","ἔφαγον","—"],
["καλέω","καλέσω","ἐκάλεσα","κέκληκα"],
["ἐγείρω","ἐγερῶ","ἤγειρα","—"],
["ἀγαπάω","ἀγαπήσω","ἠγάπησα","ἠγάπηκα"],
["ἀφίημι","ἀφήσω","ἀφῆκα","—"],
["βάλλω","βαλῶ","ἔβαλον","βέβληκα"],
["μένω","μενῶ","ἔμεινα","—"],
["κρίνω","κρινῶ","ἔκρινα","κέκρικα"],
["σῴζω","σώσω","ἔσωσα","σέσωκα"],
["αἴρω","ἀρῶ","ἦρα","ἦρκα"],
["τίθημι","θήσω","ἔθηκα","τέθεικα"],
["διδάσκω","διδάξω","ἐδίδαξα","—"],
["πίπτω","πεσοῦμαι","ἔπεσον","πέπτωκα"],
["πέμπω","πέμψω","ἔπεμψα","—"],
["πίνω","πίομαι","ἔπιον","πέπωκα"],
["τηρέω","τηρήσω","ἐτήρησα","τετήρηκα"],
["ἄγω","ἄξω","ἤγαγον","—"],
["φέρω","οἴσω","ἤνεγκα","—"],
["δοξάζω","δοξάσω","ἐδόξασα","—"],
["κηρύσσω","—","ἐκήρυξα","—"],
["πείθω","πείσω","ἔπεισα","πέποιθα"],
["θεραπεύω","θεραπεύσω","ἐθεράπευσα","—"],
["ἁμαρτάνω","ἁμαρτήσω","ἥμαρτον","ἡμάρτηκα"],
["λύω","—","ἔλυσα","—"],
["πάσχω","—","ἔπαθον","πέπονθα"],
["ἑτοιμάζω","—","ἡτοίμασα","ἡτοίμακα"],
["ἐλπίζω","ἐλπιῶ","ἤλπισα","ἤλπικα"],
["φιλέω","—","ἐφίλησα","πεφίληκα"]
];
const PP_LBL=["future","aorist","perfect"];
function ppDrill(n=10){
  const qs=[];
  const pool=PP.slice().sort(()=>Math.random()-.5).slice(0,n);
  pool.forEach(v=>{
    // Choose among the parts this verb actually has. The old loop rerolled
    // until it missed a dash, which spins for ever on a verb with none.
    const have=[1,2,3].filter(k=>v[k]!=="—");
    const slot=have[Math.floor(Math.random()*have.length)];
    const wrong=PP.filter(x=>x!==v && x[slot]!=="—").sort(()=>Math.random()-.5).slice(0,3).map(x=>x[slot]);
    const opts=[v[slot],...wrong].sort(()=>Math.random()-.5);
    qs.push(mcq(`The ${PP_LBL[slot-1]} of <span class="q-gk">${v[0]}</span> is:`,
      opts.map(o=>`<span class="gk">${o}</span>`), opts.indexOf(v[slot]),
      `<span class="gk">${v[0]}, ${v[1]}, ${v[2]}, ${v[3]}</span> — say the whole line aloud; the parts stick as a chant.`));
  });
  return qs;
}

/* ---- look-alikes ----
   Words separated by nothing but an accent or a breathing. Each of these has
   cost a reader a sentence at some point: εἰς/εἷς, ἡ/ἥ/ἤ, οὐ/οὗ, ὤν/ὧν. The
   distractors are drawn from the same group first, because those are the
   ones actually confusable — a question answerable without looking closely
   would teach nothing. */
const LOOKALIKE=[
 [["ἀλλά","but"],["ἄλλα","other things — neuter plural of ἄλλος"]],
 [["αὐτή","she — αὐτός, feminine nominative"],["αὕτη","this woman — οὗτος, feminine nominative"]],
 [["αὐταί","they, feminine — αὐτός"],["αὗται","these women — οὗτος"]],
 [["εἰ","if"],["εἶ","you are"]],
 [["εἰς","into, to (+acc)"],["εἷς","one"]],
 [["ἔξω","outside"],["ἕξω","I will have — future of ἔχω"]],
 [["ἡ","the — feminine article"],["ἥ","who, which — relative, feminine"],["ἤ","or"]],
 [["ἦν","he was"],["ἥν","whom — relative, feminine accusative"]],
 [["ὁ","the — masculine article"],["ὅ","which — relative, neuter"]],
 [["ὄν","being — participle of εἰμί, neuter"],["ὅν","whom — relative, masculine accusative"]],
 [["οὐ","not"],["οὗ","of whom, where — relative, genitive"]],
 [["τίς","who? what? — interrogative, always accented"],["τις","someone, a certain one — indefinite"]],
 [["ὤν","being — participle of εἰμί, masculine"],["ὧν","of whom — relative, genitive plural"]]
];
function lookalikeDrill(n=12){
  const flat=[];
  LOOKALIKE.forEach((g,gi)=>g.forEach(m=>flat.push({form:m[0],desc:m[1],gi})));
  return flat.sort(()=>Math.random()-.5).slice(0,n).map(x=>{
    const near=LOOKALIKE[x.gi].map(m=>m[1]).filter(d=>d!==x.desc);
    const far=flat.filter(y=>y.gi!==x.gi).sort(()=>Math.random()-.5).map(y=>y.desc);
    const wrong=[...new Set([...near,...far])].filter(d=>d!==x.desc).slice(0,3);
    const opts=[x.desc,...wrong].sort(()=>Math.random()-.5);
    return mcq(`<span class="q-gk lg">${x.form}</span>
      <p class="muted" style="font-size:.84rem;margin:10px 0 0">Which word is this?</p>`,
      opts, opts.indexOf(x.desc),
      // The whole group with its meanings: knowing what the other one is,
      // is the entire point of the exercise.
      `One accent or breathing apart:<br>${LOOKALIKE[x.gi]
        .map(m=>`<span class="gk">${m[0]}</span> — ${m[1]}`).join("<br>")}`);
  });
}

/* ---- case functions: the exegetical instinct drill ---- */
const CASEFN=[
["ἡ ἀγάπη τοῦ θεοῦ|τοῦ θεοῦ could be:",
 ["Subjective or objective genitive","Dative of means","Genitive absolute","Accusative of respect"],0,
 "God's love for us (subjective) or our love for God (objective). Grammar allows both; context decides — this is the classic exegetical fork."],
["ἐβαπτίσθη ὑπὸ Ἰωάννου|ὑπό + genitive with a passive verb expresses:",
 ["Location under","Personal agent — by John","Time","Cause"],1,
 "With a passive verb, ὑπό + genitive names the agent. Under something would be ὑπό + accusative."],
["ἐσώθημεν τῇ πίστει|τῇ πίστει is most likely a dative of:",
 ["Indirect object","Means or instrument","Location","Possession"],1,
 "By means of faith. The dative covers means, sphere, location and the indirect object — always ask which."],
["ἔμεινεν τὴν ἡμέραν|The accusative here expresses:",
 ["Direct object","Extent of time — for the day","Respect","Motion toward"],1,
 "The accusative measures extent of time or space: he stayed the whole day."],
["θεὸς ἦν ὁ λόγος|The subject is:",
 ["θεός, because it comes first","ὁ λόγος, marked by the article","Either equally","The verb has no subject"],1,
 "With a linking verb the articular noun is the subject; anarthrous θεός is predicate. Word order carries emphasis, not grammar."],
["τοῦ σπείρειν|The articular infinitive in the genitive most naturally expresses:",
 ["Purpose — in order to sow","Possession","Comparison","Agency"],0,
 "τοῦ + infinitive frequently marks purpose. The article's case is doing real syntactic work."],
["ἦλθεν σὺν τοῖς μαθηταῖς|σύν takes the dative because it expresses:",
 ["Separation","Accompaniment — with the disciples","Motion toward","Agency"],1,
 "σύν is a one-case preposition: dative of accompaniment. Prepositions fix their cases; learn them as pairs."],
["πιστεύετε εἰς τὸν κύριον|εἰς + accusative after πιστεύω expresses:",
 ["Location","Direction of trust — into him","Time when","Instrument"],1,
 "NT faith-language moves toward its object: believing into Christ. The preposition is part of the theology."],
["αὐτοῦ διδάσκοντος|A genitive noun + genitive participle standing loose from the clause is:",
 ["A genitive absolute — while he was teaching","Possession","Objective genitive","A mistake"],0,
 "Genitive absolute: a participial clause whose subject is not part of the main sentence. Narrative Greek loves it."],
["τῷ σαββάτῳ|A bare dative of time in narrative most likely gives:",
 ["The indirect object","Time when — on the sabbath","Means","Possession"],1,
 "The bare dative of time answers when. Genitive of time answers during what; accusative for how long."]
];
function caseDrill(){
  return CASEFN.slice().sort(()=>Math.random()-.5).map(c=>{
    const [gk,q]=c[0].split("|");
    return mcq(`<span class="q-gk sm">${gk}</span><br>${q}`,c[1],c[2],c[3]);
  });
}

function pairDrill(bank,prompt,n=12){
  const pool=bank.slice().sort(()=>Math.random()-.5).slice(0,n);
  return pool.map(p=>{
    const wrong=bank.filter(x=>x[1]!==p[1]).sort(()=>Math.random()-.5).slice(0,3).map(x=>x[1]);
    const opts=[p[1],...wrong].sort(()=>Math.random()-.5);
    return mcq(`${prompt} <span class="q-gk">${p[0]}</span>`,
      opts, opts.indexOf(p[1]), `<span class="gk">${p[0]}</span> — ${p[1]}.`);
  });
}
function alphaDrill(n=12,from){
  const pool=(from||ALPHABET.slice().sort(()=>Math.random()-.5)).slice(0,n);
  return pool.map(a=>{
    const wrong=ALPHABET.filter(x=>x[1]!==a[1]).sort(()=>Math.random()-.5).slice(0,3).map(x=>x[1]);
    const opts=[a[1],...wrong].sort(()=>Math.random()-.5);
    const snd=AUDIO_BY_GREEK[a[0]]
      ? ` <button class="btn ghost small" style="margin-top:8px" onclick="playGreek('${a[0]}',null)">\uD83D\uDD0A Hear it</button>`
      : "";
    return mcq(`Name this letter: <span class="q-gk lg">${a[0]}</span>${snd}`,
      opts, opts.indexOf(a[1]), `${a[1]} — sounds like ${a[2]}.`,
      null, ok=>alphaSeen(a[1],ok));
  });
}
/* Listening drill: the clip is the question. */
function listenDrill(n=12){
  const pool=AUDIO_CLIPS.slice().sort(()=>Math.random()-.5).slice(0,n);
  return pool.map(c=>{
    // Same kind only: a diphthong question with three letter names for
    // distractors can be answered without listening.
    const wrong=AUDIO_CLIPS.filter(x=>x[3]===c[3] && x[1]!==c[1]).sort(()=>Math.random()-.5).slice(0,3).map(x=>x[1]);
    const opts=[c[1],...wrong].sort(()=>Math.random()-.5);
    const q=mcq(`<button class="btn" onclick="playGreek('${c[0]}',null)">\uD83D\uDD0A Play the sound</button>
      <p class="muted" style="font-size:.84rem;margin:10px 0 0">Which ${c[3]} is this?</p>`,
      opts, opts.indexOf(c[1]),
      `<span class="gk">${c[0]}</span> — ${c[1]}, sounds like ${c[2]}.`,
      null, ok=>{ if(c[3]==="letter") alphaSeen(c[1],ok); });
    // autoplay once the question is on screen
    return ()=>{ q(); playGreek(c[0],null); };
  });
}

/* Every recorded word has a clip, precached, and no drill used one:
   listening practice stopped at naming letters. The pool is filtered on
   VOCAB_AUDIO, so the later entries that have no recording are skipped. */
function wordListenDrill(n=12){
  const met=VOCAB.map((_,i)=>i).filter(i=>S.cards[i] && VOCAB_AUDIO[i] && !skipWord(i));
  const pool=(met.length>8?met:LEARN_ORDER.filter(i=>VOCAB_AUDIO[i]).slice(0,40))
    .sort(()=>Math.random()-.5).slice(0,n);
  const q=pool.map(i=>{
    const v=VOCAB[i];
    // By value: three glosses appear twice in the deck.
    const wrong=VOCAB.filter((x,k)=>k!==i && x[1]!==v[1] && !RETIRED.has(k))
      .sort(()=>Math.random()-.5).slice(0,3).map(x=>x[1]);
    const opts=[v[1],...wrong].sort(()=>Math.random()-.5);
    const ask=mcq(`<button class="btn" onclick="playWord(${i},null)">\uD83D\uDD0A Play the word</button>
      <p class="muted" style="font-size:.84rem;margin:10px 0 0">What does it mean?</p>`,
      opts, opts.indexOf(v[1]), `<span class="gk">${v[0]}</span> — ${v[1]}.`);
    return ()=>{ ask(); playWord(i,null,true); };
  });
  q.__words=pool;                      // so the next few clips are warmed
  return q;
}

/* Only words already met — the drill previously quizzed the whole deck and
   scored you wrong on words you had never seen. Falls back to the commonest
   forty before the deck has really started. */
function g2eBank(){
  const idx=VOCAB.map((_,i)=>i).filter(i=>S.cards[i] && !skipWord(i));
  const use=idx.length>8?idx:LEARN_ORDER.slice(0,40);
  return use.map(i=>[VOCAB[i][0].split(",")[0],VOCAB[i][1]]);
}

function reverseVocab(){
  const started=VOCAB.map((_,i)=>i).filter(i=>S.cards[i]);
  const pool=(started.length>8?started:VOCAB.map((_,i)=>i).slice(0,40))
    .sort(()=>Math.random()-.5).slice(0,12);
  return pool.map(i=>{
    const v=VOCAB[i];
    const wrong=VOCAB.filter((x,k)=>k!==i && x[1]!==v[1] && !RETIRED.has(k)).sort(()=>Math.random()-.5).slice(0,3)
      .map(x=>`<span class="gk">${x[0].split(",")[0]}</span>`);
    const right=`<span class="gk">${v[0].split(",")[0]}</span>`;
    const opts=[right,...wrong].sort(()=>Math.random()-.5);
    return mcq(`Which word means <b>${v[1]}</b>?`, opts, opts.indexOf(right),
      `${v[0]} — ${v[1]}.`);
  });
}
/* The drill now feeds the same schedule the daily review draws from, rather
   than being twelve unweighted questions in a menu of twelve drills. */
function mixedQuiz(){
  const all=[];
  const add=l=>l.quiz.forEach((x,n)=>all.push(mcq(x.q,x.o,x.a,x.w,`L${l.id}q${n}`)));
  LESSONS.filter(l=>S.lessons.includes(l.id)).forEach(add);
  if(all.length<5) LESSONS.slice(0,4).forEach(add);
  return all.sort(()=>Math.random()-.5).slice(0,12);
}
const DRILLS=[
["Vocabulary due now","Spaced repetition — the words the schedule says you're about to forget",()=>startReview()],
["Learn 5 new words","Next five by New Testament frequency",()=>startNew(5)],
["Greek → English","Recognition, mixed multiple choice",()=>startSession(pairDrill(g2eBank(),"What does this mean?"),"d")],
["English → Greek","Harder: production rather than recognition",()=>startSession(reverseVocab(),"d")],
["The article","All 17 forms, parsed",()=>startSession(pairDrill(ART,"Parse this article:",ART.length),"d")],
["Verb parsing","Person, number, tense, voice, mood",()=>startSession(pairDrill(PARSE,"Parse this form:"),"d")],
["Alphabet","Letter names and sounds",()=>startSession(alphaDrill(),"d")],
["Listening — letters","Hear a letter or diphthong and name it",()=>startSession(listenDrill(),"d")],
["Listening — words","Hear a word from the course list and give its meaning",()=>startSession(wordListenDrill(),"d")],
["Parsing builder","Assemble the parse yourself — tense, voice, person, number",()=>startSession(buildDrill(),"d")],
["Principal parts","Future, aorist and perfect of the great irregulars",()=>startSession(ppDrill(),"d")],
["Case functions","The genitive and dative decisions exegesis turns on",()=>startSession(caseDrill(),"d")],
["Look-alikes","εἰς or εἷς · ἡ or ἥ or ἤ — one accent apart",()=>startSession(lookalikeDrill(),"d")],
["Write the letters","Trace each one with a finger or the mouse",()=>startSession(writeLetterDrill(),"d")],
["Write it from memory","No multiple choice — write the word, then mark yourself",()=>startSession(writeWordDrill(),"d")],
["Mixed grammar review","Questions from lessons you've finished, interleaved",()=>startSession(mixedQuiz(),"d")]
];
/* Which heading each drill sits under. Held here rather than in DRILLS so
   the indices the menu calls by stay exactly as they were. */
const DRILL_GROUP={
  "Vocabulary":["Vocabulary due now","Learn 5 new words","Greek → English","English → Greek",
                "Listening — words","Write it from memory"],
  "Grammar":["The article","Verb parsing","Parsing builder","Principal parts","Case functions",
             "Mixed grammar review"],
  "Letters and sounds":["Alphabet","Listening — letters","Look-alikes","Write the letters"]
};
function renderDrill(){
  const seen=new Set();
  let html=Object.entries(DRILL_GROUP).map(([group,names])=>{
    const items=names.map(n=>DRILLS.findIndex(d=>d[0]===n)).filter(i=>i>=0);
    items.forEach(i=>seen.add(i));
    return items.length?`<h2 style="margin:22px 0 10px">${group}</h2>`+items.map(i=>`
      <button class="lesson-item" onclick="DRILLS[${i}][2]()">
        <span class="t"><b>${DRILLS[i][0]}</b><span>${DRILLS[i][1]}</span></span>
        <span class="muted">›</span></button>`).join(""):"";
  }).join("");
  // anything added later and not yet filed still appears
  const rest=DRILLS.map((d,i)=>i).filter(i=>!seen.has(i));
  if(rest.length) html+=`<h2 style="margin:22px 0 10px">More</h2>`+rest.map(i=>`
      <button class="lesson-item" onclick="DRILLS[${i}][2]()">
        <span class="t"><b>${DRILLS[i][0]}</b><span>${DRILLS[i][1]}</span></span>
        <span class="muted">›</span></button>`).join("");
  document.getElementById("drillMenu").innerHTML=html;
}

/* ============================================================
   READING
   ============================================================ */
/* Strip punctuation, then neutralise acute/grave/circumflex — Greek shifts an
   acute to a grave before a following word, so τόν and τὸν are the same form.
   Breathings and iota subscript are kept: they distinguish real words. */
const norm=s=>s.replace(/[.,;·:!?()\u00b7\u0387\u2019'\u2018]/g,"").trim()
  .normalize("NFD").replace(/[\u0300\u0301\u0342]/g,"").normalize("NFC").toLowerCase();
function renderRead(){
  pushNav({screen:"read"});
  /* Reaching Saturday's chapter was Read → whole NT → scroll 27 books →
     Mark → chapter grid → 6, every morning. The reference is stored rather
     than the loaded book, so this row paints before the manifest exists. */
  const w=S.where;
  const resume = (w&&w.a) ? `<button class="lesson-item" onclick="openGntChapter('${w.a}',${w.ch})">
       <span class="t"><b>Continue — ${w.t} ${w.n}</b><span>Where you left off</span></span>
       <span class="muted">›</span></button>` : "";
  document.getElementById("readList").innerHTML= resume +
    `<button class="lesson-item" onclick="openGnt()" style="border-color:var(--gold-dim)">
       <span class="t"><b>The whole Greek New Testament</b><span>Any chapter, every word parsed</span></span>
       <span class="muted">›</span></button>
     <h2 style="margin:18px 0 10px">Graded passages</h2>`
    + READINGS.map(r=>`
    <button class="lesson-item" onclick="openRead('${r.id}')">
      <span class="t"><b>${r.ref}</b><span>${r.w.length} words</span></span>
      <span class="muted">›</span>
    </button>`).join("");
  document.getElementById("readBody").innerHTML="";
}
function openRead(id){
  const r=READINGS.find(x=>x.id===id);
  if(!r) return;
  pushNav({screen:"read",r:id});
  grant("read");
  document.getElementById("readList").innerHTML=
    `<button class="btn ghost small" onclick="renderRead()">← All passages</button>`;
  document.getElementById("readBody").innerHTML=`
    <h2>${r.ref}</h2>
    <p class="muted" style="font-size:.87rem">${r.note}</p>
    <div class="passage" id="psg">${r.w.map((w,i)=>
      `<w data-i="${i}">${w[0]}</w>`).join(" ")}</div>
    <div class="gloss" id="gloss"><div class="d">Tap a word.</div></div>
    <div style="height:14px"></div>
    <button class="btn ghost" onclick="clozeRead('${id}')">Cloze test — fill in the blanks</button>
    <div style="height:20px"></div>`;
  const seen=new Set();
  document.getElementById("psg").onclick=e=>{
    if(e.target.tagName!=="W")return;
    /* Fifteen minutes in your sermon text on a Saturday is the most valuable
       thing you can do here, and it used to count for nothing: the streak
       broke on the day you had done the most. Gated on a first tap so that
       merely opening a passage is not "studying". */
    if(!seen.size) touchDay();
    document.querySelectorAll("#psg w").forEach(x=>x.classList.remove("tapped"));
    e.target.classList.add("tapped");
    const i=+e.target.dataset.i;
    let info=r.w[i][1];
    if(!info){                                   // repeated word: reuse the earlier gloss
      const key=norm(r.w[i][0]);
      const prev=r.w.find(x=>norm(x[0])===key && x[1]);
      info = prev ? prev[1] : (GLOSSARY[key]||"—");
    }
    document.getElementById("gloss").innerHTML=
      `<div class="w gk">${r.w[i][0]}</div><div class="d">${info}</div>`;
    if(!seen.has(i)){ seen.add(i); if(seen.size===10) addXp(5); }
  };
}

/* ---- cloze: blank out substantive words from a passage ---- */
function clozeRead(id){
  const r=READINGS.find(x=>x.id===id);
  // candidates: words with a real gloss and enough substance to be worth testing
  const cands=r.w.map((w,i)=>({w,i}))
    .filter(x=>x.w[1] && x.w[0].replace(/[^Ͱ-Ͽἀ-῿]/g,"").length>=4);
  if(cands.length<6){toast("Passage too short for a cloze test");return;}
  const step=Math.max(1,Math.floor(cands.length/10));
  const picks=cands.filter((_,k)=>k%step===0).slice(0,10);
  const strip=w=>w.replace(/[^Ͱ-Ͽἀ-῿]/g,"");
  const q=picks.map(p=>{
    const answer=strip(p.w[0]);
    /* By value and de-duplicated: the same form appears more than once in
       most passages, so the option list could show one word twice. */
    const wrong=[...new Set(cands.map(c=>strip(c.w[0])))].filter(w=>w!==answer)
      .sort(()=>Math.random()-.5).slice(0,3);
    const opts=[answer,...wrong].sort(()=>Math.random()-.5);
    /* Blank every occurrence inside the window, not just the one being
       asked: five questions in twelve passages printed their own answer two
       words from the gap. */
    const ctx=r.w.map((w,i)=>{
      if(Math.abs(i-p.i)>5) return null;
      return (i===p.i||strip(w[0])===answer)?"____":w[0];
    }).filter(Boolean).join(" ");
    return mcq(`<span class="q-gk sm">… ${ctx} …</span><br><small class="muted">Which word fills the blank? (${r.ref})</small>`,
      opts.map(o=>`<span class="gk">${o}</span>`), opts.indexOf(answer),
      `${answer} — ${p.w[1]}`);
  });
  startSession(q,"d");
}

/* ============================================================
   WORD LOOKUP
   ============================================================ */
/* Accent-insensitive so you can type what you half-remember. */
const lkNorm=s=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();

/* Searching by Greek assumes a Greek keyboard, which a phone will not have
   by default. So every headword also gets a loose Latin key, and Latin
   queries are folded the same way — "agape", "logos", "christos" all land.
   The mapping is deliberately lossy: it exists to match typing, not to be a
   scholarly transliteration. */
const LK_GK={"α":"a","β":"b","γ":"g","δ":"d","ε":"e","ζ":"z","η":"e","θ":"th",
 "ι":"i","κ":"k","λ":"l","μ":"m","ν":"n","ξ":"x","ο":"o","π":"p","ρ":"r",
 "σ":"s","ς":"s","τ":"t","υ":"u","φ":"f","χ":"kh","ψ":"ps","ω":"o"};

function lkLatin(greek){
  const d=greek.normalize("NFD");
  let out="";
  for(let k=0;k<d.length;k++){
    const ch=d[k];
    if(ch==="\u0314"){ out="h"+out; continue; }       // rough breathing -> leading h
    if(/[\u0300-\u036f]/.test(ch)) continue;          // other marks: ignore
    out += LK_GK[ch.toLowerCase()] ?? (/[a-z]/i.test(ch) ? ch.toLowerCase() : "");
  }
  return out;
}

/* Fold a Latin query into the same shape: ph=f, ch=kh, c=k, y=u, v=b. */
function lkFoldLatin(q){
  return q.toLowerCase()
    .replace(/[\u0304\u0301\u0300]/g,"")
    .replace(/ph/g,"f").replace(/ch/g,"kh").replace(/ck/g,"k")
    .replace(/c/g,"k").replace(/q/g,"k").replace(/j/g,"i")
    .replace(/y/g,"u").replace(/v/g,"b")
    .replace(/[ēê]/g,"e").replace(/[ōô]/g,"o");
}

/* Built once: the Latin key for each headword, and for each of its parts
   (so "hemera" finds ἡμέρα even though the entry reads "ἡμέρα, -ας, ἡ"). */
const LK_LATIN=VOCAB.map(v=>lkFoldLatin(lkLatin(v[0].split(",")[0].trim())));

function lookupHits(raw){
  const q=lkNorm((raw||"").trim());
  if(!q) return [];
  const ql=lkFoldLatin(q);
  const latin=/^[a-z\u0304\u0101\u0113\u014d\s-]+$/i.test(q);
  return VOCAB.map((v,i)=>({v,i}))
    .filter(x=>!RETIRED.has(x.i))
    .filter(x=>lkNorm(x.v[0]).includes(q)          // Greek, accents optional
             ||lkNorm(x.v[1]).includes(q)          // English gloss
             ||(latin && LK_LATIN[x.i].includes(ql)))   // typed in Latin letters
    .sort((a,b)=>b.v[2]-a.v[2]).slice(0,40);
}
function wordRowsHtml(hits){
  return hits.map(({v,i})=>`
    <button class="lk" onpointerdown="prepWord(${i})"
            onclick="${VOCAB_AUDIO[i]&&extraForms(i).length?`playEntry(${i})`:`playWord(${i},this)`}">
      <span class="pl ${VOCAB_AUDIO[i]?"on":""}">\uD83D\uDD0A</span>
      <span class="w"><b>${v[0]}</b><span>${v[1]}</span>${exampleHtml(i)}</span>
      <span class="fq">${v[2]}\u00d7</span>
    </button>`).join("");
}

/* ============================================================
   TABLES  — searchable reference paradigms
   ============================================================ */
/* Words and paradigms answer to the same box. Two searches stacked on one
   screen was the arrangement before, and the word list sat behind a button
   most people would never think to press. Keyed on each table's real index
   so the ids stay unique however the list is filtered. */
function tableHtml(list){
  return list.map(({t,k})=>`
    <div class="ptable open" id="pt${k}">
      <button onclick="document.getElementById('pt${k}').classList.toggle('open')">${t.t}</button>
      <div class="pt-body">${t.html}</div>
    </div>`).join("");
}
function renderTables(){
  const raw=(document.getElementById("tablesSearch").value||"").trim();
  const q=raw.toLowerCase();
  const body=document.getElementById("tablesBody");
  if(!q){
    // Nothing typed: the paradigms are worth browsing, so show them shut.
    body.innerHTML=`<p class="muted" style="font-size:.84rem;margin-bottom:12px">
        Type to search. Greek with or without accents, Latin letters
        (<i>agape</i>), an English meaning, or the name of a paradigm.</p>`
      + PARADIGMS.map((t,k)=>`
        <div class="ptable" id="pt${k}">
          <button onclick="document.getElementById('pt${k}').classList.toggle('open')">${t.t}</button>
          <div class="pt-body">${t.html}</div>
        </div>`).join("");
    fillSoundTable();
    return;
  }
  const words=lookupHits(raw);
  const tables=PARADIGMS.map((t,k)=>({t,k}))
    .filter(({t})=>(t.t+" "+t.tags+" "+t.html).toLowerCase().includes(q));
  body.innerHTML =
    (words.length?`<h2 style="margin:4px 0 10px">${words.length===40?"Words (first 40)":words.length===1?"1 word":words.length+" words"}</h2>`+wordRowsHtml(words):"")
    + (tables.length?`<h2 style="margin:${words.length?"24px":"4px"} 0 10px">${tables.length===1?"1 table":tables.length+" tables"}</h2>`+tableHtml(tables):"")
    + (!words.length&&!tables.length
        ?`<div class="empty"><span class="gk">οὐδέν</span><p>Nothing matches "${raw}".</p></div>`:"");
  fillSoundTable();
}
document.getElementById("tablesSearch").oninput=()=>renderTables();

/* The sounds table is interactive, so it is filled in after the markup lands. */
function fillSoundTable(){
  const el=document.getElementById("soundTableHere");
  if(!el || typeof soundGridHtml!=="function") return;
  el.innerHTML = soundGridHtml("letter") + playAllHtml("letter")
    + `<h3>Diphthongs</h3>` + soundGridHtml("diphthong") + playAllHtml("diphthong");
}

/* ============================================================
   HOW THIS WORKS
   ============================================================
   Not a walkthrough. A page you can come back to after a fortnight away and
   find the things that are not obvious from the tab names. */
function renderHelp(){
  document.getElementById("helpBody").innerHTML=`
    <div class="card">
      <h3 style="margin-top:0">The short version</h3>
      <p class="muted" style="font-size:.87rem;margin:0">Ten minutes a day. Open <b>Today</b> and work down the plan —
      the letters while they are still settling, the words the schedule brings back, five new ones, then a few
      minutes of the chapter you are on. Everything else is there when you need it, not before.</p>
    </div>

    <h2>The tabs</h2>
    <table>
      <tr><th>Today</th><td>The day's plan, three or four short things, ticked off as you do them. The ring fills as the plan does. Your streak sits under it, and a passage you pinned shows up here too.</td></tr>
      <tr><th>Learn</th><td>Black's ${LESSONS.length} chapters. <b>Work through it</b> takes a chapter a section at a time with its questions in place, about ten minutes; the whole chapter is underneath to read straight through or come back to. Answering a question puts it on the review schedule — a wrong answer just brings it back sooner.</td></tr>
      <tr><th>Drill</th><td>${DRILLS.length} ways to practise, grouped by vocabulary, grammar, and letters and sounds.</td></tr>
      <tr><th>Read</th><td>${READINGS.length} graded passages, and the whole Greek New Testament with every word parsed.</td></tr>
      <tr><th>Look up</th><td>One search box for any word in the course and every paradigm table.</td></tr>
      <tr><th>Progress</th><td>Your numbers and badges first, then settings, sync, and your data.</td></tr>
    </table>

    <h2>Things worth knowing</h2>
    <table>
      <tr><th>Sermon prep</th><td>Open a chapter in Read and tap <b>Pin for this week</b> — it appears on Today. <b>Words I don't know</b> lists the course vocabulary in that chapter you have not started, and adds it to your deck in one tap.</td></tr>
      <tr><th>How much you can read</th><td>Every chapter counts how many of its <i>different</i> words you have started, and how many more the course can still teach you. Counting every occurrence instead would flatter you — twenty words is half the page, because the commonest ones repeat.</td></tr>
      <tr><th>Grading honestly</th><td>Again, Hard, Good and Easy set when a word comes back. Guessing right is not the same as knowing it — press Hard and the schedule will believe you.</td></tr>
      <tr><th>A missed day</th><td>One rest day a week is allowed; the streak survives it and says so.</td></tr>
      <tr><th>Set aside</th><td>A word you keep losing can be set aside from the answer screen, and restored from Progress.</td></tr>
      <tr><th>The letters</th><td>Today leads with them until each one has been named correctly ${ALPHA_SOLID} times running, then that row retires and Progress says the alphabet has settled. It comes back if you start missing them.</td></tr>
      <tr><th>Word meanings</th><td>The ${LEARN_ORDER.length} words this course teaches carry glosses written and checked here. Tap anything else in Read and you still get a meaning — from Tyndale House's brief lexicon, which carries Abbott-Smith's <i>Manual Greek Lexicon</i>, and Dodson's where that has nothing. Those are marked with a <span style="color:var(--gold)">†</span>: they are terser and older, and are not this course's own wording.</td></tr>
      <tr><th>Offline</th><td>All of it works with no connection — every recording and all ${GNT?GNT.books.length:27} books. Only the videos need the internet; the songs play inside the app, the lectures open in a browser.</td></tr>
      <tr><th>Two devices</th><td>Progress → Sync. Invent a phrase, enter it on both. Progress merges; the phrase never leaves your device.</td></tr>
      <tr><th>Audio</th><td>Every word is recorded. Settings can slow it down, or stop it playing until you ask.</td></tr>
    </table>

    <h2>Where the words come from</h2>
    <p class="muted" style="font-size:.84rem">The Greek text is the SBL Greek New Testament with MorphGNT's
    parsing. Glosses for words outside the course come from
    <b>TBESG</b> — <i>Data created by www.STEPBible.org based on work at Tyndale House Cambridge</i>,
    CC BY 4.0, carrying G. Abbott-Smith's <i>A Manual Greek Lexicon of the New Testament</i> (1922) —
    and from Jeff Dodson's public-domain lexicon. Changes made to either are listed in
    <span class="gk" style="font-family:var(--ui)">docs/lexicon-changes.md</span>.</p>

    <h2>If you have studied before</h2>
    <p class="muted" style="font-size:.87rem">Progress → <b>Studied Greek before?</b> marks chapters done and seeds the
    hundred commonest words as familiar, spread over a fortnight rather than landing in one day.</p>
    <div style="height:20px"></div>`;
}

/* ============================================================
   PROGRESS
   ============================================================ */
function renderProgress(){
  // LEARN_ORDER, not VOCAB: index 237 is retired and no route in the app
  // can ever create a card for it, so counting it overstates the deck by one.
  const total=LEARN_ORDER.length, started=Object.keys(S.cards).length, known=knownCount();
  const nextWeek=Object.values(S.cards).filter(c=>daysBetween(today(),c.due)<=7&&c.due>today()).length;
  document.getElementById("progBody").innerHTML=`
    ${backupNudgeHtml()}
    <!-- These three came off Today when it became the day's plan. Streak and
         best streak fold into the line beneath: Today already shows the
         streak, and two tiles for it was one too many. -->
    <div class="stat-grid">
      <div class="stat"><b>${known}</b><span>words known</span></div>
      <div class="stat"><b>${level()}</b><span>level</span></div>
      <div class="stat"><b>${S.xp}</b><span>total XP</span></div>
    </div>
    <p class="muted" style="font-size:.82rem;margin:-4px 0 14px;text-align:center">
      ${S.streak} day streak · best ${S.best||0}${
        alphaLeft()?` · ${ALPHABET.length-alphaLeft()} of ${ALPHABET.length} letters settled`
                   :" · alphabet settled"}</p>
    <div class="card">
      <div class="between"><span>Vocabulary</span><b>${known} / ${total}</b></div>
      <div class="prog-bar" style="margin-top:9px"><i style="width:${known/total*100}%"></i></div>
      <small class="muted">${started} started · ${known} at six days or longer · ${nextWeek} due this week</small>
    </div>
    <div class="card">
      <div class="between"><span>Lessons</span><b>${S.lessons.length} / ${LESSONS.length}</b></div>
      <div class="prog-bar" style="margin-top:9px"><i style="width:${Math.min(100,S.lessons.length/LESSONS.length*100)}%"></i></div>
      ${Object.keys(S.gcards||{}).length?`<small class="muted">${Object.keys(S.gcards).length} grammar questions on the review schedule · ${gdueList().length} due</small>`:""}
    </div>
    <h2>Badges</h2>
    <div class="badges">${BADGES.map(b=>`
      <div class="badge ${S.badges.includes(b.id)?"got":""}">
        <div class="e">${b.e}</div><b>${b.t}</b><span>${b.d}</span></div>`).join("")}</div>
    <h2>Settings</h2>
    <div class="card">
      <div class="setrow"><span>Daily review goal</span>
        <select id="setGoal">${[10,20,30,50].map(n=>`<option value="${n}" ${S.goal===n?"selected":""}>${n} cards</option>`).join("")}</select></div>
      <div class="setrow"><span>Answer sounds</span>
        <select id="setSfx">${[[2,"Correct and wrong"],[1,"Correct only"],[0,"Off"]].map(([v,l])=>`<option value="${v}" ${(S.sfx===undefined?2:S.sfx)===v?"selected":""}>${l}</option>`).join("")}</select></div>
      <div class="setrow"><span>Word audio</span>
        <select id="setSpeak">${[[1,"Plays when you reveal"],[0,"Only when you tap"]].map(([v,l])=>`<option value="${v}" ${(S.speak===undefined?1:S.speak)===v?"selected":""}>${l}</option>`).join("")}</select></div>
      <div class="setrow"><span>Playback speed</span>
        <select id="setRate">${[[1,"Normal"],[0.75,"Slower"],[0.5,"Slowest"]].map(([v,l])=>`<option value="${v}" ${(+S.rate||1)===v?"selected":""}>${l}</option>`).join("")}</select></div>
      <div class="setrow"><span>Greek text size</span>
        <select id="setGk">${[["","Normal"],["lg","Large"],["xl","Extra large"]].map(([v,l])=>`<option value="${v}" ${(S.gk||"")===v?"selected":""}>${l}</option>`).join("")}</select></div>
      <div class="setrow"><span>Offline<br><small class="muted" id="offlineState">checking…</small></span>
        <button class="btn ghost small" onclick="askOffline('ensure-offline');askOffline('offline-status');toast('Checking…')">Check</button></div>
      ${typeof installRowHtml==="function"?installRowHtml():""}
    </div>
    ${(S.suspended||[]).filter(i=>VOCAB[i]).length?`<div class="card">
      <h3 style="margin-top:0">Set aside</h3>
      <p class="muted" style="font-size:.85rem;margin-bottom:4px">These have stopped coming up. Restoring one puts it back in today's queue.</p>
      ${(S.suspended||[]).filter(i=>VOCAB[i]).map(i=>`<div class="setrow">
        <span><b class="gk" style="font-weight:500;font-size:1.05rem">${VOCAB[i][0].split(",")[0]}</b><br><small class="muted">${VOCAB[i][1]}</small></span>
        <button class="btn ghost small" onclick="unsuspendWord(${i})">Restore</button></div>`).join("")}
      ${(S.suspended||[]).filter(i=>VOCAB[i]).length>1?`<button class="btn ghost small" style="margin-top:12px;width:100%" onclick="unsuspendAll()">Restore all</button>`:""}
    </div>`:""}
    ${typeof syncCardHtml==="function"?syncCardHtml():""}
    <div class="card">
      <h3 style="margin-top:0">Studied Greek before?</h3>
      <p class="muted" style="font-size:.85rem;margin-bottom:10px">Skip ahead: mark the chapters you once covered as done, and seed the commonest words into the review schedule instead of drip-feeding them as new.</p>
      <div class="setrow"><span>Mark chapters done up to</span>
        <select id="setPlace"><option value="0">—</option>${Array.from({length:26},(_,k)=>`<option value="${k+1}">${k+1}</option>`).join("")}</select></div>
      <button class="btn ghost small" style="margin-top:10px" onclick="seedVocab()">Seed the 100 commonest words as familiar</button>
    </div>
    <h2>Your data</h2>
    <p class="muted" style="font-size:.86rem">
      ${canPersist?"Progress is saved on this device.":"This browser is blocking storage, so progress will be lost when you close the app. Export it, or open the app from a hosted address rather than a local file."}
      ${typeof SYNC!=="undefined" && SYNC && SYNC.id
        ? "A copy is also kept on the sync server so your other device can read it."
        : "Nothing is sent anywhere."}</p>
    ${PRE_IMPORT?`<button class="btn ghost" onclick="undoImport()" style="border-color:var(--rust)">Undo the import</button><div style="height:9px"></div>`:""}
    <button class="btn ghost" onclick="exportData()">Export progress</button>
    <div style="height:9px"></div>
    <button class="btn ghost" onclick="document.getElementById('imp').click()">Import progress</button>
    <input type="file" id="imp" accept=".json" style="display:none" onchange="importData(this)">
    <div style="height:9px"></div>
    <button class="btn ghost" onclick="resetAll()" style="color:var(--rust)">Reset everything</button>
    <div style="height:26px"></div>`;

  document.getElementById("setGoal").onchange=e=>{S.goal=+e.target.value;save();toast("Daily goal: "+S.goal);};
  document.getElementById("setGk").onchange=e=>{S.gk=e.target.value;save();applyGk();};
  document.getElementById("setSpeak").onchange=e=>{S.speak=+e.target.value;save();};
  document.getElementById("setRate").onchange=e=>{
    S.rate=+e.target.value; save();
    playWord(LEARN_ORDER[0],null,true);      // let them hear the difference
  };
  if(typeof paintOffline==="function"){ askOffline("offline-status"); paintOffline(); }
  document.getElementById("setSfx").onchange=e=>{
    S.sfx=+e.target.value; save();
    if(S.sfx) sfx("correct");            // let them hear what they picked
  };
  document.getElementById("setPlace").onchange=e=>{
    const n=+e.target.value; if(!n)return;
    /* Add, never replace: this is a native select on a scrolling screen, and
       replacing wiped chapters finished beyond n with no confirm or undo. */
    const add=Array.from({length:n},(_,k)=>k+1);
    S.lessons=[...new Set([...(S.lessons||[]),...add])].sort((a,b)=>a-b);
    /* Chapter 1 is the alphabet, so saying you have done it says you can read
       the letters. Without this, Today would lead someone who has studied
       Greek for years with eight letter-naming questions a day until they had
       ground through all 24 three times over. It is not permanent — miss them
       in a drill and the row comes back. */
    if(n>=1) ALPHABET.forEach(a=>{ S.alpha=S.alpha||{}; S.alpha[a[1]]=ALPHA_SOLID; });
    save(); checkBadges(); renderProgress();
    toast("Chapters 1–"+n+" marked done");
  };
}

function exportData(){
  const blob=new Blob([JSON.stringify(S)],{type:"application/json"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="koine-progress-"+today()+".json";
  a.click(); S.exported=today(); save(); toast("Progress exported");
}
/* An import replaces the entire study record, so it has to be checked
   first: this is the only backup route, and handing it the wrong file
   should not be able to destroy months of scheduling. Anything unexpected
   is repaired rather than trusted, and the previous state is kept for one
   undo. */
function saneState(x){
  if(!x || typeof x!=="object" || Array.isArray(x)) return null;
  const num=(v,d)=>Number.isFinite(+v)&&+v>=0 ? +v : d;
  const arr=v=>Array.isArray(v)?v:[];
  const out={
    cards:{}, xp:num(x.xp,0), streak:num(x.streak,0), best:num(x.best,0),
    seen:num(x.seen,0), goal:[10,20,30,50].includes(+x.goal)?+x.goal:20,
    lessons:arr(x.lessons).map(Number).filter(n=>Number.isInteger(n)&&n>=1&&n<=LESSONS.length),
    badges:arr(x.badges).filter(b=>typeof b==="string"),
    suspended:arr(x.suspended).map(Number).filter(n=>Number.isInteger(n)&&n>=0&&n<VOCAB.length),
    last: typeof x.last==="string"?x.last:null,
    reviewsToday:num(x.reviewsToday,0),
    dayOfReviews: typeof x.dayOfReviews==="string"?x.dayOfReviews:null,
    exported: typeof x.exported==="string"?x.exported:null,
    gk: ["","lg","xl"].includes(x.gk)?x.gk:"",
    sfx: [0,1,2].includes(+x.sfx)?+x.sfx:2,
    speak: [0,1].includes(+x.speak)?+x.speak:1,
    rate: [1,0.75,0.5].includes(+x.rate)?+x.rate:1,
    restUsed: /^\d{4}-\d{2}-\d{2}$/.test(x.restUsed)?x.restUsed:null,
  };
  /* Where the reader was. Shape-checked because it is rendered straight into
     the Read tab as a button label. */
  const chapterRef=r=>(r && typeof r==="object" && typeof r.a==="string"
    && Number.isInteger(+r.ch) && +r.ch>=0 && typeof r.t==="string")
    ? {a:r.a.slice(0,8), ch:+r.ch, t:r.t.slice(0,40), n:+r.n||(+r.ch+1)} : null;
  out.where=chapterRef(x.where);
  out.pin=chapterRef(x.pin);
  /* Where a part-way chapter stopped, so Today can offer to pick it up.
     Shape-checked because the part number indexes into an array and the id
     is rendered straight into a button. */
  out.lessonPart=(x.lessonPart && typeof x.lessonPart==="object"
    && Number.isInteger(+x.lessonPart.id) && +x.lessonPart.id>=1
    && +x.lessonPart.id<=LESSONS.length
    && Number.isInteger(+x.lessonPart.part) && +x.lessonPart.part>=0
    && +x.lessonPart.part<200)
    ? {id:+x.lessonPart.id, part:+x.lessonPart.part} : null;
  /* Which day's plan the ticks belong to. A plan restored from another day
     is discarded rather than carried over — touchDay clears it anyway, but
     an import landing mid-day should not tick today's boxes. */
  out.plan=(x.plan && typeof x.plan==="object"
    && /^\d{4}-\d{2}-\d{2}$/.test(x.plan.day) && Array.isArray(x.plan.done))
    ? {day:x.plan.day, done:x.plan.done.filter(s=>typeof s==="string").slice(0,8)}
    : null;
  /* letter -> how many times running it has been named correctly. Capped, so
     a hand-edited file cannot claim the alphabet is finished with one entry. */
  out.alpha={};
  if(x.alpha && typeof x.alpha==="object" && !Array.isArray(x.alpha))
    for(const k of Object.keys(x.alpha))
      if(ALPHABET.some(a=>a[1]===k) && Number.isFinite(+x.alpha[k]))
        out.alpha[k]=Math.max(0,Math.min(ALPHA_SOLID,Math.round(+x.alpha[k])));
  if(out.pin) out.pin.ts=Number.isFinite(+(x.pin||{}).ts)?+x.pin.ts:0;
  const saneCard=c=>{
    const o={
      ease: Number.isFinite(+c.ease)?Math.min(2.8,Math.max(1.3,+c.ease)):2.5,
      ivl:  Number.isFinite(+c.ivl)&&+c.ivl>=0?Math.min(365,Math.round(+c.ivl)):0,
      due:  /^\d{4}-\d{2}-\d{2}$/.test(c.due)?c.due:today(),
      reps: Number.isFinite(+c.reps)&&+c.reps>=0?Math.round(+c.reps):0,
      lapses:Number.isFinite(+c.lapses)&&+c.lapses>=0?Math.round(+c.lapses):0,
    };
    if(Number.isFinite(+c.ts)) o.ts=+c.ts;
    return o;
  };
  const cards=(x.cards&&typeof x.cards==="object"&&!Array.isArray(x.cards))?x.cards:{};
  for(const k of Object.keys(cards)){
    const i=Number(k), c=cards[k];
    // a card for a word this build does not have would break every review
    if(!Number.isInteger(i)||i<0||i>=VOCAB.length) continue;
    if(!c||typeof c!=="object") continue;
    out.cards[i]=saneCard(c);
  }
  const gc=(x.gcards&&typeof x.gcards==="object"&&!Array.isArray(x.gcards))?x.gcards:{};
  out.gcards={};
  for(const k of Object.keys(gc)){
    // the key is the question's address; anything else cannot be scheduled
    if(!/^L\d{1,2}q\d{1,2}$/.test(k)) continue;
    if(!gc[k]||typeof gc[k]!=="object") continue;
    out.gcards[k]=saneCard(gc[k]);
  }
  return out;
}

let PRE_IMPORT=null;
function importData(inp){
  const f=inp.files[0]; if(!f)return;
  const rd=new FileReader();
  rd.onload=()=>{
    let parsed;
    try{ parsed=JSON.parse(rd.result); }
    catch(e){ toast("That file could not be read"); return; }
    const clean=saneState(parsed);
    if(!clean){ toast("That does not look like a progress file"); return; }
    const cards=Object.keys(clean.cards).length;
    const mine=Object.keys(S.cards).length;
    if(!confirm(`Replace this device's progress?\n\nImporting: ${cards} words, ${clean.xp} XP\nReplacing: ${mine} words, ${S.xp} XP`)) return;
    PRE_IMPORT=JSON.parse(JSON.stringify(S));
    S=clean; save(); applyGk(); renderProgress();
    toast(`Imported ${cards} words`);
  };
  rd.readAsText(f);
}
function undoImport(){
  if(!PRE_IMPORT) return;
  S=PRE_IMPORT; PRE_IMPORT=null;
  save(); applyGk(); renderProgress(); toast("Import undone");
}
function resetAll(){
  const synced = typeof SYNC!=="undefined" && SYNC && SYNC.id;
  if(!confirm(synced
    ? "Delete all progress on this device?\n\nSync will be turned off too — otherwise your other device would send it all back. That device keeps its own copy."
    : "Delete all progress on this device? This cannot be undone."))return;
  if(synced && typeof syncOff==="function") syncOff();
  S={cards:{},gcards:{},xp:0,streak:0,best:0,last:null,seen:0,lessons:[],badges:[],reviewsToday:0,dayOfReviews:null,goal:20,suspended:[],exported:null,restUsed:null,where:null,pin:null,alpha:{},plan:null,lessonPart:null};
  save(); renderProgress(); toast("Everything reset");
}

/* ============================================================
   BOOT
   ============================================================ */
Object.keys(GLOSSARY_RAW).forEach(k=>{ GLOSSARY[norm(k)]=GLOSSARY_RAW[k]; });
/* A two-day gap is survivable if this week's rest day is unspent; it is not
   spent here, only when the next session actually happens. */
if(S.last){
  const gap=daysBetween(S.last,today());
  if(gap>2 || (gap===2 && !restAvailable())) S.streak=0;
}
if(S.dayOfReviews!==today()){ S.reviewsToday=0; S.dayOfReviews=today(); }
save();
applyGk();
requestPersistence();
render();

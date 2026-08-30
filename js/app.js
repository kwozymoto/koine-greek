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
}
const today=()=>new Date().toISOString().slice(0,10);
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
function schedule(i,g){
  const c=card(i);
  if(g===0){
    c.lapses++; c.reps=0; c.ivl=0;
    c.ease=Math.max(1.3,c.ease-0.2);
    c.due=today();                       // stays in today's queue
  } else {
    if(c.reps===0) c.ivl = g===1?1:(g===2?1:3);
    else if(c.reps===1) c.ivl = g===1?3:(g===2?6:9);
    else c.ivl = Math.round(c.ivl * (g===1?1.2:(g===2?c.ease:c.ease*1.3)));
    c.ease = Math.min(2.8, Math.max(1.3, c.ease + (g===1?-0.15:(g===2?0:0.1))));
    c.reps++;
    const d=new Date(); d.setDate(d.getDate()+c.ivl);
    c.due=d.toISOString().slice(0,10);
  }
  save();
}
const isDue=i=>S.cards[i] && S.cards[i].due<=today();
const dueList=()=>Object.keys(S.cards).filter(isDue).map(Number).sort((a,b)=>a-b);
const knownCount=()=>Object.values(S.cards).filter(c=>c.ivl>=6).length;
const level=()=>Math.floor(Math.sqrt(S.xp/45))+1;

/* ============================================================
   STREAK + XP + BADGES
   ============================================================ */
function touchDay(){
  const t=today();
  if(S.last===t) return;
  if(S.last===null) S.streak=1;
  else{ const d=daysBetween(S.last,t); S.streak = d===1 ? S.streak+1 : 1; }
  S.last=t; S.best=Math.max(S.best||0,S.streak);
  S.reviewsToday=0; S.dayOfReviews=t; save();
}
function addXp(n){ S.xp+=n; save(); }
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
  if(S.lessons.includes(1)) grant("alpha");
}
let tTimer;
function toast(msg){
  const el=document.getElementById("toast");
  el.textContent=msg; el.classList.add("on");
  clearTimeout(tTimer); tTimer=setTimeout(()=>el.classList.remove("on"),2400);
}

/* ============================================================
   NAVIGATION
   ============================================================ */
function go(name){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("on"));
  document.getElementById("s-"+name).classList.add("on");
  document.querySelectorAll("nav button").forEach(b=>
    b.classList.toggle("on", b.dataset.go===name));
  window.scrollTo(0,0);
  if(name==="today")render();
  if(name==="learn")renderLessons();
  if(name==="drill")renderDrill();
  if(name==="read")renderRead();
  if(name==="prog")renderProgress();
}
document.querySelectorAll("nav button").forEach(b=>
  b.onclick=()=>go(b.dataset.go));

/* ============================================================
   TODAY
   ============================================================ */
function render(){
  const due=dueList().length, goal=S.goal;
  const pct=Math.min(1, due===0 ? 1 : (S.reviewsToday||0)/Math.max(1,Math.min(goal,due+ (S.reviewsToday||0))));
  document.getElementById("ringArc").style.strokeDashoffset = 415-(415*pct);
  document.getElementById("ringNum").textContent = due;
  document.getElementById("ringLbl").textContent = due===1?"card due":"cards due";
  document.getElementById("streakN").textContent=S.streak;
  document.getElementById("stKnown").textContent=knownCount();
  document.getElementById("stLvl").textContent=level();
  document.getElementById("stXp").textContent=S.xp;
  document.getElementById("btnReview").textContent =
    due>0 ? `Start today's review (${due})` : "Nothing due — practise anyway";

  const next=LESSONS.find(l=>!S.lessons.includes(l.id))||LESSONS[LESSONS.length-1];
  document.getElementById("nextLesson").innerHTML=
    `<button class="lesson-item" onclick="openLesson(${next.id})">
       <span class="n">${next.id}</span>
       <span class="t"><b>${next.t}</b><span>${next.s}</span></span>
     </button>`;
  checkBadges();
}
document.getElementById("btnReview").onclick=()=>startReview();
document.getElementById("btnNew").onclick=()=>startNew();

/* ============================================================
   SESSIONS
   ============================================================ */
let Q=[], qi=0, mode="";
function startSession(queue,label){
  Q=queue; qi=0; mode=label;
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
  document.getElementById("sessBar").style.width="100%";
  checkBadges();
  b.innerHTML=`<div class="empty"><span class="gk">τέλος</span>
    <p>Session complete.</p>
    <p><b>+${Q.length*3} XP</b> · streak ${S.streak} day${S.streak===1?"":"s"}</p></div>
    <button class="btn" onclick="go('today')">Done</button>`;
  addXp(Q.length*3);
}

/* ---- flashcard (self-graded, for SRS) ---- */
function flashcard(i){
  return ()=>{
    const v=VOCAB[i], b=document.getElementById("sessBody");
    b.innerHTML=`
      <div class="fc">
        <div class="word gk">${v[0].split(",")[0]}</div>
        <div class="rule"></div>
        <div class="ans" id="ans" style="visibility:hidden">${v[1]}</div>
        <div class="meta" id="meta" style="visibility:hidden">${v[3]} · ${v[2]}× in the NT</div>
      </div>
      <button class="btn" id="show">Show meaning</button>`;
    document.getElementById("show").onclick=()=>{
      document.getElementById("ans").style.visibility="visible";
      document.getElementById("meta").style.visibility="visible";
      document.getElementById("show").outerHTML=`
        <div class="grades">
          <button class="g1" onclick="grade(${i},0)">Again<i>&lt;1m</i></button>
          <button class="g2" onclick="grade(${i},1)">Hard<i>1d</i></button>
          <button class="g3" onclick="grade(${i},2)">Good<i>${nextIvl(i,2)}d</i></button>
          <button class="g4" onclick="grade(${i},3)">Easy<i>${nextIvl(i,3)}d</i></button>
        </div>`;
    };
  };
}
function nextIvl(i,g){
  const c=card(i);
  if(c.reps===0)return g===2?1:3;
  if(c.reps===1)return g===2?6:9;
  return Math.round(c.ivl*(g===2?c.ease:c.ease*1.3));
}
function grade(i,g){
  schedule(i,g);
  S.reviewsToday=(S.reviewsToday||0)+1; save();
  if(g===0){ Q.push(flashcard(i)); }
  qi++; step();
}

/* ---- multiple choice ---- */
function mcq(q,opts,ans,why){
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
        box.children[ans].classList.add("right");
        if(k!==ans) btn.classList.add("wrong");
        document.getElementById("fb").innerHTML=
          `<div class="feedback"><b>${k===ans?"Correct":"Not quite"}</b>${why}</div>
           <button class="btn" onclick="qi++;step()">Continue</button>`;
        if(k===ans) addXp(2);
      };
      box.appendChild(btn);
    });
  };
}

/* ---- session builders ---- */
function startReview(){
  let d=dueList();
  if(!d.length){
    const started=VOCAB.map((_,i)=>i).filter(i=>S.cards[i]);
    if(!started.length){ startNew(5); return; }        // fresh install: introduce instead
    d=started.sort(()=>Math.random()-.5).slice(0,15);  // nothing due: free practice
  }
  startSession(d.slice(0,40).map(flashcard),"review");
}
/* SRS cards are keyed by VOCAB index, so data/vocab.js must be append-only.
   New words are introduced by NT frequency regardless of array position. */
const LEARN_ORDER=VOCAB.map((_,i)=>i).sort((a,b)=>VOCAB[b][2]-VOCAB[a][2]);

function startNew(n=5){
  const fresh=[];
  for(const i of LEARN_ORDER){ if(fresh.length>=n) break; if(!S.cards[i]) fresh.push(i); }
  if(!fresh.length){toast("You've started every word in the deck");return;}
  const q=[];
  fresh.forEach(i=>{ card(i); q.push(flashcard(i)); });
  fresh.forEach(i=>{
    const v=VOCAB[i];
    const wrong=VOCAB.filter((_,k)=>k!==i).sort(()=>Math.random()-.5).slice(0,3).map(x=>x[1]);
    const opts=[v[1],...wrong].sort(()=>Math.random()-.5);
    q.push(mcq(`What does <span class="gk" style="font-size:1.5rem">${v[0].split(",")[0]}</span> mean?`,
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
function openLesson(id){
  const l=LESSONS.find(x=>x.id===id);
  document.getElementById("lessonBody").innerHTML=`
    <h1 style="margin-top:14px">${l.t}</h1>
    <p class="sub">${l.s}</p>
    ${l.body}
    <h2>Watch</h2>
    ${l.vids.map(v=>`<a class="vid" href="${v.u}" target="_blank" rel="noopener">
      <span class="p">▶</span><span><b>${v.t}</b><span>${v.s}</span><span class="net">Needs a connection</span></span></a>`).join("")}
    <h2>Test yourself</h2>
    <p class="muted" style="font-size:.87rem">${l.quiz.length} questions. Retrieval beats rereading — attempt each one before you look.</p>
    <button class="btn" onclick="lessonQuiz(${id})">Start the test</button>
    <div style="height:34px"></div>`;
  go("lesson");
  const ah=document.getElementById("alphaHere");
  if(ah) ah.innerHTML=`<div class="alpha-grid">${ALPHABET.map(a=>
    `<div class="alpha"><div class="l gk">${a[0]}</div><div class="nm">${a[1]}</div></div>`).join("")}</div>
    <p class="muted" style="font-size:.83rem;margin-top:10px">Sound each one aloud. Silent review does not work here.</p>`;
}
function lessonQuiz(id){
  const l=LESSONS.find(x=>x.id===id);
  const q=l.quiz.map(x=>mcq(x.q,x.o,x.a,x.w));
  q.push(()=>{
    if(!S.lessons.includes(id)){S.lessons.push(id);save();}
    checkBadges();
    document.getElementById("sessBody").innerHTML=`
      <div class="empty"><span class="gk">εὖγε</span>
        <p>Lesson ${id} complete.</p></div>
      <button class="btn" onclick="go('learn')">Back to lessons</button>
      <div style="height:9px"></div>
      <button class="btn ghost" onclick="startReview()">Review vocabulary now</button>`;
    document.getElementById("sessBar").style.width="100%";
    addXp(12);
  });
  startSession(q,"lesson");
}

/* ============================================================
   DRILLS
   ============================================================ */
const ART=[
["ὁ","masculine nominative singular"],["τοῦ","masculine genitive singular"],
["τῷ","masculine dative singular"],["τόν","masculine accusative singular"],
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
["ἔλυον","1st singular imperfect active indicative"],["ἐλύομεν","1st plural imperfect active indicative"],
["ἔλυσα","1st singular aorist active indicative"],["ἔλυσεν","3rd singular aorist active indicative"],
["ἐλύσαμεν","1st plural aorist active indicative"],["λύεται","3rd singular present middle/passive indicative"],
["λυόμεθα","1st plural present middle/passive indicative"],["λύονται","3rd plural present middle/passive indicative"],
["εἰμί","1st singular present active indicative of εἰμί"],["εἶ","2nd singular present active indicative of εἰμί"],
["ἐστίν","3rd singular present active indicative of εἰμί"],["ἐσμέν","1st plural present active indicative of εἰμί"],
["ἐστέ","2nd plural present active indicative of εἰμί"],["εἰσίν","3rd plural present active indicative of εἰμί"],
["ἦν","3rd singular imperfect active indicative of εἰμί"],["λύων","present active participle, nominative singular masculine"],
["λύσας","aorist active participle, nominative singular masculine"],["λύειν","present active infinitive"],
["λῦσαι","aorist active infinitive"],["λύῃ","3rd singular present active subjunctive"]
];
function pairDrill(bank,prompt,n=12){
  const pool=bank.slice().sort(()=>Math.random()-.5).slice(0,n);
  return pool.map(p=>{
    const wrong=bank.filter(x=>x[1]!==p[1]).sort(()=>Math.random()-.5).slice(0,3).map(x=>x[1]);
    const opts=[p[1],...wrong].sort(()=>Math.random()-.5);
    return mcq(`${prompt} <span class="gk" style="font-size:1.6rem">${p[0]}</span>`,
      opts, opts.indexOf(p[1]), `<span class="gk">${p[0]}</span> — ${p[1]}.`);
  });
}
function alphaDrill(){
  const pool=ALPHABET.slice().sort(()=>Math.random()-.5).slice(0,12);
  return pool.map(a=>{
    const wrong=ALPHABET.filter(x=>x[1]!==a[1]).sort(()=>Math.random()-.5).slice(0,3).map(x=>x[1]);
    const opts=[a[1],...wrong].sort(()=>Math.random()-.5);
    return mcq(`Name this letter: <span class="gk" style="font-size:2rem">${a[0]}</span>`,
      opts, opts.indexOf(a[1]), `${a[1]} — sounds like ${a[2]}.`);
  });
}
function reverseVocab(){
  const started=VOCAB.map((_,i)=>i).filter(i=>S.cards[i]);
  const pool=(started.length>8?started:VOCAB.map((_,i)=>i).slice(0,40))
    .sort(()=>Math.random()-.5).slice(0,12);
  return pool.map(i=>{
    const v=VOCAB[i];
    const wrong=VOCAB.filter((_,k)=>k!==i).sort(()=>Math.random()-.5).slice(0,3)
      .map(x=>`<span class="gk">${x[0].split(",")[0]}</span>`);
    const right=`<span class="gk">${v[0].split(",")[0]}</span>`;
    const opts=[right,...wrong].sort(()=>Math.random()-.5);
    return mcq(`Which word means <b>${v[1]}</b>?`, opts, opts.indexOf(right),
      `${v[0]} — ${v[1]}.`);
  });
}
function mixedQuiz(){
  const all=[];
  LESSONS.filter(l=>S.lessons.includes(l.id)).forEach(l=>
    l.quiz.forEach(x=>all.push(mcq(x.q,x.o,x.a,x.w))));
  if(all.length<5) LESSONS.slice(0,4).forEach(l=>l.quiz.forEach(x=>all.push(mcq(x.q,x.o,x.a,x.w))));
  return all.sort(()=>Math.random()-.5).slice(0,12);
}
const DRILLS=[
["Vocabulary due now","Spaced repetition — the words the schedule says you're about to forget",()=>startReview()],
["Learn 5 new words","Next five by New Testament frequency",()=>startNew(5)],
["Greek → English","Recognition, mixed multiple choice",()=>startSession(pairDrill(VOCAB.map(v=>[v[0].split(",")[0],v[1]]),"What does this mean?"),"d")],
["English → Greek","Harder: production rather than recognition",()=>startSession(reverseVocab(),"d")],
["The article","All 17 forms, parsed",()=>startSession(pairDrill(ART,"Parse this article:"),"d")],
["Verb parsing","Person, number, tense, voice, mood",()=>startSession(pairDrill(PARSE,"Parse this form:"),"d")],
["Alphabet","Letter names and sounds",()=>startSession(alphaDrill(),"d")],
["Mixed grammar review","Questions from lessons you've finished, interleaved",()=>startSession(mixedQuiz(),"d")]
];
function renderDrill(){
  document.getElementById("drillMenu").innerHTML=DRILLS.map((d,i)=>`
    <button class="lesson-item" onclick="DRILLS[${i}][2]()">
      <span class="t"><b>${d[0]}</b><span>${d[1]}</span></span>
      <span class="muted">›</span>
    </button>`).join("");
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
  document.getElementById("readList").innerHTML=READINGS.map(r=>`
    <button class="lesson-item" onclick="openRead('${r.id}')">
      <span class="t"><b>${r.ref}</b><span>${r.w.length} words</span></span>
      <span class="muted">›</span>
    </button>`).join("");
  document.getElementById("readBody").innerHTML="";
}
function openRead(id){
  const r=READINGS.find(x=>x.id===id);
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
    const wrong=cands.filter(c=>strip(c.w[0])!==answer)
      .sort(()=>Math.random()-.5).slice(0,3).map(c=>strip(c.w[0]));
    const opts=[answer,...wrong].sort(()=>Math.random()-.5);
    const ctx=r.w.map((w,i)=>{
      const t=i===p.i?"____":w[0];
      return Math.abs(i-p.i)<=5?t:null;
    }).filter(Boolean).join(" ");
    return mcq(`<span class="gk" style="font-size:1.15rem">… ${ctx} …</span><br><small class="muted">Which word fills the blank? (${r.ref})</small>`,
      opts.map(o=>`<span class="gk">${o}</span>`), opts.indexOf(answer),
      `${answer} — ${p.w[1]}`);
  });
  startSession(q,"d");
}

/* ============================================================
   PROGRESS
   ============================================================ */
function renderProgress(){
  const total=VOCAB.length, started=Object.keys(S.cards).length, known=knownCount();
  const nextWeek=Object.values(S.cards).filter(c=>daysBetween(today(),c.due)<=7&&c.due>today()).length;
  document.getElementById("progBody").innerHTML=`
    <div class="stat-grid">
      <div class="stat"><b>${S.streak}</b><span>day streak</span></div>
      <div class="stat"><b>${S.best||0}</b><span>best streak</span></div>
      <div class="stat"><b>${level()}</b><span>level</span></div>
    </div>
    <div class="card">
      <div class="between"><span>Vocabulary</span><b>${known} / ${total}</b></div>
      <div class="prog-bar" style="margin-top:9px"><i style="width:${known/total*100}%"></i></div>
      <small class="muted">${started} started · ${known} at six days or longer · ${nextWeek} due this week</small>
    </div>
    <div class="card">
      <div class="between"><span>Lessons</span><b>${S.lessons.length} / 16</b></div>
      <div class="prog-bar" style="margin-top:9px"><i style="width:${S.lessons.length/16*100}%"></i></div>
    </div>
    <h2>Badges</h2>
    <div class="badges">${BADGES.map(b=>`
      <div class="badge ${S.badges.includes(b.id)?"got":""}">
        <div class="e">${b.e}</div><b>${b.t}</b><span>${b.d}</span></div>`).join("")}</div>
    <h2>Your data</h2>
    <p class="muted" style="font-size:.86rem">
      ${canPersist?"Progress is saved on this device.":"This browser is blocking storage, so progress will be lost when you close the app. Export it, or open the app from a hosted address rather than a local file."}
      Nothing is sent anywhere.</p>
    <button class="btn ghost" onclick="exportData()">Export progress</button>
    <div style="height:9px"></div>
    <button class="btn ghost" onclick="document.getElementById('imp').click()">Import progress</button>
    <input type="file" id="imp" accept=".json" style="display:none" onchange="importData(this)">
    <div style="height:9px"></div>
    <button class="btn ghost" onclick="resetAll()" style="color:var(--rust)">Reset everything</button>
    <div style="height:26px"></div>`;
}
function exportData(){
  const blob=new Blob([JSON.stringify(S)],{type:"application/json"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="koine-progress-"+today()+".json";
  a.click(); toast("Progress exported");
}
function importData(inp){
  const f=inp.files[0]; if(!f)return;
  const rd=new FileReader();
  rd.onload=()=>{ try{ S=JSON.parse(rd.result); save(); renderProgress(); toast("Progress imported"); }
                  catch(e){ toast("That file could not be read"); } };
  rd.readAsText(f);
}
function resetAll(){
  if(!confirm("Delete all progress on this device? This cannot be undone."))return;
  S={cards:{},xp:0,streak:0,best:0,last:null,seen:0,lessons:[],badges:[],reviewsToday:0,dayOfReviews:null,goal:20};
  save(); renderProgress(); toast("Everything reset");
}

/* ============================================================
   BOOT
   ============================================================ */
Object.keys(GLOSSARY_RAW).forEach(k=>{ GLOSSARY[norm(k)]=GLOSSARY_RAW[k]; });
if(S.last && daysBetween(S.last,today())>1) S.streak=0;
if(S.dayOfReviews!==today()){ S.reviewsToday=0; S.dayOfReviews=today(); }
save();
render();

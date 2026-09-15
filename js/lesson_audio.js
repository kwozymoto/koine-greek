/* Listening to a chapter, and tapping a word to start there.

   The narration is not the chapter's text. Where the page says λόγος the
   voice says `loh goss`, so a tap cannot be matched to a word after the
   fact — the two share no letters. The correspondence is built while the
   narration is written (tools/build_lesson_audio.py) and shipped in
   data/lesson_audio.js: for each block, which body elements it covers, every
   word of those elements, and the second each of those words is spoken at.

   WHAT THIS DOES NOT ASSUME. The block's `page` array was produced by a
   Python tokeniser; the words this file wraps come out of the DOM. They
   should agree — clean() exists in the builder so that they do — but if they
   ever stop agreeing, wrapping the wrong words would make every tap a lie.
   So the count is checked per block, and a block that disagrees keeps its
   play button and loses its taps. Silent degradation in the safe direction. */

var LA_AUDIO = null;      // the one element; a second would talk over the first
var LA_BLOCK = null;      // the block id playing
var LA_QUEUE = null;      // the rest of the chapter, when playing it whole

function laFor(ch) {
  return (typeof LESSON_AUDIO === "undefined" ? [] : LESSON_AUDIO)
         .filter(function (b) { return b.ch === ch; });
}

function laEl() {
  if (!LA_AUDIO) {
    LA_AUDIO = new Audio();
    LA_AUDIO.preload = "none";
    LA_AUDIO.addEventListener("ended", function () { laNext(); });
    LA_AUDIO.addEventListener("timeupdate", laPaint);
    LA_AUDIO.addEventListener("pause", laPaint);
  }
  return LA_AUDIO;
}

/* Wrap every word of the block's elements so a tap has something to land on.
   Walks text nodes only, so markup — the gk spans, italics, the verse
   reference — survives untouched.

   THE DOM DOES NOT SPLIT WHERE THE BUILDER SPLITS, and it cannot be made to.
   `(<span class="gk">ἁ</span>)` is three text nodes, and the builder's
   clean() welds them into the single word `(ἁ)` — it pulls a stray mark back
   onto the word before it and a bracket forward onto the word after. Seven of
   chapter 1's thirteen blocks differ on that alone.

   Re-implementing those rules here would put the same logic in two languages
   and wait for them to drift. So the shipped words drive instead: walk the
   DOM pieces and consume characters from `page` until each word is accounted
   for. Several pieces can then carry one word index — which is also what
   makes a word wrapped in markup tappable across the markup. No rule is
   duplicated, and a disagreement shows up as characters that do not match
   rather than as a count that happens to. */
function laWrap(els, block) {
  var pieces = [];
  els.forEach(function (el) {
    var walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var nodes = [], t;
    while ((t = walk.nextNode())) nodes.push(t);
    nodes.forEach(function (node) {
      if (!node.nodeValue.trim()) return;
      node.nodeValue.split(/(\s+)/).forEach(function (piece) {
        if (piece && piece.trim()) pieces.push({ node: node, text: piece });
      });
    });
  });

  var at = 0, need = (block.page[0] || "").replace(/\s+/g, "");
  for (var i = 0; i < pieces.length; i++) {
    var txt = pieces[i].text;
    if (need.indexOf(txt) !== 0) return false;   // the words have diverged
    pieces[i].w = at;
    need = need.slice(txt.length);
    while (need === "" && at < block.page.length) {
      at++;
      need = (block.page[at] || "").replace(/\s+/g, "");
      if (need !== "") break;
    }
  }
  if (at !== block.page.length) return false;    // some words never appeared

  // Only now, with the mapping known to be sound, is the DOM touched.
  var byNode = new Map();
  pieces.forEach(function (p) {
    if (!byNode.has(p.node)) byNode.set(p.node, []);
    byNode.get(p.node).push(p);
  });
  byNode.forEach(function (ps, node) {
    var frag = document.createDocumentFragment(), k = 0;
    node.nodeValue.split(/(\s+)/).forEach(function (piece) {
      if (!piece) return;
      if (!piece.trim()) { frag.appendChild(document.createTextNode(piece)); return; }
      var s = document.createElement("span");
      s.className = "lw";
      s.dataset.w = ps[k++].w;
      s.textContent = piece;
      frag.appendChild(s);
    });
    node.parentNode.replaceChild(frag, node);
  });
  return true;
}

/* Called after a chapter body is rendered. Groups the body's block elements
   into narration blocks, gives each a play button, and wraps its words. */
function mountLessonAudio(ch, root) {
  var blocks = laFor(ch);
  if (!blocks.length || !root) return;
  /* The same tags the builder counts, in the same order -- including the
     div, which is the alphabet placeholder and the one element in the course
     whose contents the app writes rather than the lesson. */
  var els = [].slice.call(root.querySelectorAll(
    ":scope > h2, :scope > h3, :scope > p, :scope > table, :scope > ul," +
    " :scope > ol, :scope > div"));
  /* The builder numbered the body's blocks in source order. If the rendered
     count does not match, something has been inserted or removed since the
     narration was built and every index is suspect — so nothing mounts. */
  var want = blocks.reduce(function (m, b) {
    return Math.max(m, b.els[b.els.length - 1]); }, 0) + 1;
  if (els.length < want) return;

  blocks.forEach(function (b) {
    var mine = b.els.map(function (i) { return els[i]; }).filter(Boolean);
    if (!mine.length) return;
    var wrap = document.createElement("div");
    wrap.className = "lblk";
    wrap.dataset.lb = b.id;
    mine[0].parentNode.insertBefore(wrap, mine[0]);
    var btn = document.createElement("button");
    btn.className = "lplay";
    btn.type = "button";
    btn.title = "Read this part aloud";
    btn.setAttribute("aria-label", "Read this part aloud");
    btn.onclick = function () { laToggle(b.id); };
    wrap.appendChild(btn);
    mine.forEach(function (el) { wrap.appendChild(el); });
    if (laWrap(mine, b)) wrap.dataset.taps = "1";
  });

  /* The bar says the two things you need to act — how long, and that words
     are tappable. Everything else about how the narration was made is real
     but is not wanted before you have pressed play, so it goes behind the
     ⓘ. <details> rather than a modal: no overlay, no focus trap, and it
     works with JavaScript half-loaded. */
  var bar = document.createElement("div");
  bar.className = "labar";
  var mins = blocks.reduce(function (s, b) { return s + b.d; }, 0) / 60;
  bar.innerHTML =
    '<button class="btn ghost" type="button" id="laAll">▶ Listen to the chapter</button>' +
    '<span class="lanote">' + mins.toFixed(0) + ' min · tap any word to ' +
    'start there</span>' +
    '<details class="lainfo"><summary aria-label="About this recording" ' +
    'title="About this recording"></summary><div>' +
    '<p>Read by a synthetic voice, in ' + blocks.length + ' parts. The play ' +
    'button beside a paragraph reads that paragraph alone.</p>' +
    '<p><b>The Greek is said the way the word cards say it</b> — the same ' +
    'pronunciation you are learning in the deck, not a separate reading.</p>' +
    '<p>Where the point of a passage is a <i>shape on the page</i> — a ' +
    'breathing mark, an accent, a table of endings — the voice tells you ' +
    'to look rather than pretending to read it aloud.</p>' +
    '</div></details>';
  root.insertBefore(bar, root.firstChild);
  bar.querySelector("#laAll").onclick = function () { laAll(ch); };

  root.addEventListener("click", function (ev) {
    var w = ev.target.closest(".lw");
    if (!w) return;
    var blk = w.closest(".lblk");
    if (!blk || blk.dataset.taps !== "1") return;
    var b = blocks.find(function (x) { return x.id === blk.dataset.lb; });
    if (b) laPlay(b, b.t[+w.dataset.w] || 0);
  });
}

/* A seek set before the clip has its metadata is thrown away, so a tap on a
   word in a block that is not loaded yet starts the clip from the top --
   playing, plausible, and at the wrong place.

   AND readyState IS NOT RESET SYNCHRONOUSLY WHEN src IS ASSIGNED. The first
   version of this guard checked readyState straight after setting src, read
   the *previous* clip's 4, took the fast path, and seeked into a resource
   that was in the middle of reloading — so the fix for the bug behaved
   exactly like the bug. The element is only asked how ready it is when we
   have not just changed what it is playing. */
function laPlay(b, at) {
  var a = laEl();
  var seek = function () {
    try { a.currentTime = at || 0; } catch (e) {}
    a.play().catch(function () {});
    laPaint();
  };
  if (LA_BLOCK === b.id && a.readyState >= 1) { seek(); return; }
  LA_BLOCK = b.id;
  a.src = "audio/lessons/" + b.id + ".mp3";
  a.addEventListener("loadedmetadata", seek, { once: true });
  a.load();
}

/* The chapter button says what LA_QUEUE is, so it is derived from it rather
   than set by hand at each call site. It was set in laAll and in laStop but
   not in laToggle -- so tapping one block's play button while the whole
   chapter was playing cleared the queue and left a button reading Stop that
   then started the chapter again from the top. */
function laBar() {
  var btn = document.getElementById("laAll");
  if (btn) btn.textContent = LA_QUEUE ? "■ Stop" : "▶ Listen to the chapter";
}

function laToggle(id) {
  var b = (typeof LESSON_AUDIO === "undefined" ? [] : LESSON_AUDIO)
          .find(function (x) { return x.id === id; });
  if (!b) return;
  LA_QUEUE = null;
  laBar();
  if (LA_BLOCK === id && LA_AUDIO && !LA_AUDIO.paused) { LA_AUDIO.pause(); laPaint(); return; }
  laPlay(b, 0);
}

function laAll(ch) {
  if (LA_QUEUE) { laStop(); return; }
  LA_QUEUE = laFor(ch).slice();
  laBar();
  laNext();
}

function laNext() {
  if (!LA_QUEUE || !LA_QUEUE.length) { laStop(); return; }
  var b = LA_QUEUE.shift();
  laPlay(b, 0);
  var el = document.querySelector('.lblk[data-lb="' + b.id + '"]');
  if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
}

function laStop() {
  LA_QUEUE = null;
  if (LA_AUDIO) LA_AUDIO.pause();
  laBar();
  laPaint();
}

/* The word being spoken is the last one whose second has passed. The seconds
   run forward inside a block, so a binary search is enough. */
function laPaint() {
  var playing = LA_AUDIO && !LA_AUDIO.paused && !LA_AUDIO.ended;
  document.querySelectorAll(".lblk").forEach(function (el) {
    el.classList.toggle("on", playing && el.dataset.lb === LA_BLOCK);
  });
  document.querySelectorAll(".lw.say").forEach(function (s) {
    s.classList.remove("say");
  });
  if (!playing || !LA_BLOCK) return;
  var b = (typeof LESSON_AUDIO === "undefined" ? [] : LESSON_AUDIO)
          .find(function (x) { return x.id === LA_BLOCK; });
  var blk = document.querySelector('.lblk[data-lb="' + LA_BLOCK + '"]');
  if (!b || !blk || blk.dataset.taps !== "1") return;
  var t = LA_AUDIO.currentTime, lo = 0, hi = b.t.length - 1, at = -1;
  while (lo <= hi) {
    var mid = (lo + hi) >> 1;
    if (b.t[mid] <= t + 0.001) { at = mid; lo = mid + 1; } else { hi = mid - 1; }
  }
  if (at < 0) return;
  /* Words that share a second share a replacement — a table pointed at, a
     mark described — so they light together, which is what is true of them. */
  blk.querySelectorAll(".lw").forEach(function (s) {
    if (b.t[+s.dataset.w] === b.t[at]) s.classList.add("say");
  });
}

/* Leaving the chapter stops the voice. Without this it reads on from another
   screen, which is the one thing a player must never do. */
function laLeave() { laStop(); LA_BLOCK = null; }

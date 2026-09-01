/* Pronunciation playback.

   One shared Audio element rather than one per tile: a phone will happily
   run out of decoders if you hand it 32, and reusing one means a new tap
   cancels the previous sound instead of talking over it.

   Clips are precached by the service worker, so this works offline. */

const AUDIO_DIR = "audio/clips/";
let sndEl = null, sndTile = null;

/* Bumped by every direct play. A chain (playEntry / playSequence) captures
   the value and stops as soon as something else has spoken, because
   replacing .src does not fire 'ended' and its handler would otherwise
   survive into an unrelated clip. */
let sndGen = 0;

/* Slowing a clip is the one request a re-learner actually has of playback,
   and it costs nothing. Re-applied on every play: assigning .src resets it. */
function sndRate() {
  const r = (typeof S !== "undefined") ? +S.rate : 1;
  return [1, 0.75, 0.5].includes(r) ? r : 1;
}

function sndInit() {
  if (sndEl) return sndEl;
  sndEl = new Audio();
  sndEl.preload = "auto";
  sndEl.addEventListener("ended", sndClear);
  sndEl.addEventListener("error", sndClear);
  return sndEl;
}

/* Assigning src restarts the load even when it is the same file, throwing
   away a decode that has already happened. Only assign when it changes. */
function setSrc(el, url) {
  const abs = new URL(url, location.href).href;
  if (el.src !== abs) el.src = url;
}

/* Fetch and decode a clip before it is asked for. Called when a card is
   rendered, so the ~1s of reading time covers what would otherwise be a
   700ms wait after the tap. */
function prepGreek(greek) {
  const file = AUDIO_BY_GREEK[greek];
  if (!file) return;
  const a = sndInit();
  if (a.paused) { setSrc(a, AUDIO_DIR + file); try { a.load(); } catch (e) {} }
}

function prepWord(i) {
  const file = VOCAB_AUDIO[i];
  if (!file) return;
  const url = VOCAB_AUDIO_DIR + file;
  warmClip(url);
  const a = sndInit();
  if (a.paused) { setSrc(a, url); try { a.load(); } catch (e) {} }
}

/* Warm the next few clips in the session queue over the network only —
   without touching the player, which may be mid-sentence. */
function prepAhead(indices) {
  indices.slice(0, 4).forEach(i => {
    const f = VOCAB_AUDIO[i];
    if (f) warmClip(VOCAB_AUDIO_DIR + f);
  });
}

function sndClear() {
  if (sndTile) { sndTile.classList.remove("playing"); sndTile = null; }
}

/* Play the clip for a Greek letter or diphthong ("Α α", "αι").
   `tile` is the element to highlight while it sounds. */
function playGreek(greek, tile) {
  const file = AUDIO_BY_GREEK[greek];
  if (!file) return false;
  const a = sndInit();
  sndGen++; a.onended = null;
  sndClear();
  try { a.pause(); } catch (e) {}
  setSrc(a, AUDIO_DIR + file);
  a.currentTime = 0;
  if (tile) { sndTile = tile; tile.classList.add("playing"); }
  a.playbackRate = sndRate();
  const p = a.play();
  if (p && p.catch) p.catch(() => { sndClear(); toast("Could not play that clip"); });
  return true;
}

/* Play a sequence with a gap — used by "play all". */
let sndQueue = null;
function playSequence(list, i = 0) {
  if (i === 0) sndQueue = list;
  if (sndQueue !== list || i >= list.length) return;
  // Only the visible grid: the alphabet grid exists twice once the lesson
  // has been opened, and the hidden copy was getting the highlight.
  const tile = document.querySelector(`.screen.on [data-greek="${CSS.escape(list[i])}"]`);
  playGreek(list[i], tile);
  const a = sndInit();
  const gen = sndGen;
  a.onended = () => {
    sndClear();
    a.onended = null;
    if (sndGen !== gen) return;      // a tap interrupted the run
    setTimeout(() => { if (sndGen === gen) playSequence(list, i + 1); }, 260);
  };
}
function stopSequence() {
  sndQueue = null;
  sndGen++;
  if (sndEl) { try { sndEl.pause(); } catch (e) {} sndEl.onended = null; }
  sndClear();
}

/* Grid markup shared by the lesson and the Tables tab. */
function soundGridHtml(kind) {
  const clips = AUDIO_CLIPS.filter(c => c[3] === kind);
  return `<div class="alpha-grid">${clips.map(c => `
    <button class="alpha snd" data-greek="${c[0]}"
            onpointerdown="prepGreek('${c[0]}')" onclick="playGreek('${c[0]}',this)"
            aria-label="Play ${c[1]}">
      <div class="l gk">${c[0]}</div>
      <div class="nm">${c[1]}</div>
      <div class="sd">${c[2]}</div>
    </button>`).join("")}</div>`;
}

function playAllHtml(kind) {
  const list = AUDIO_CLIPS.filter(c => c[3] === kind).map(c => c[0]);
  return `<div class="row" style="margin-top:10px">
    <button class="btn ghost small" onclick='playSequence(${JSON.stringify(list)})'>▶ Play all</button>
    <button class="btn ghost small" onclick="stopSequence()">Stop</button></div>`;
}

/* ---------- vocabulary clips ---------- */
const VOCAB_AUDIO_DIR = "audio/vocab/";

/* An <audio> element fetches with a Range header and gets a 206 back, which
   the worker will not store. So warm the cache with a plain GET alongside
   playback — after the first hearing the clip is available offline. */
const warmed = new Set();
function warmClip(url) {
  if (warmed.has(url)) return;
  warmed.add(url);
  fetch(url).catch(() => warmed.delete(url));
}

/* Play the citation form for VOCAB[i]. `quiet` suppresses the failure
   toast: the automatic play on a card reveal uses it, or an offline review
   of thirty words would fire thirty toasts. */
function playWord(i, tile, quiet) {
  const file = VOCAB_AUDIO[i];
  if (!file) return false;
  const url = VOCAB_AUDIO_DIR + file;
  warmClip(url);
  const a = sndInit();
  sndGen++; a.onended = null;
  sndClear();
  try { a.pause(); } catch (e) {}
  setSrc(a, url);
  a.currentTime = 0;
  if (tile) { sndTile = tile; tile.classList.add("playing"); }
  a.playbackRate = sndRate();
  const p = a.play();
  if (p && p.catch) p.catch(() => { sndClear(); if (!quiet) toast("Could not play that clip"); });
  return true;
}

/* Bulk download so the whole set is available offline: a plain fetch returns
   200, which the worker stores (unlike the 206 an audio element provokes).
   Not wired to a button — the service worker pre-caches the whole set from
   data/offline.json without being asked. Kept as a manual fallback. */
let dlBusy = false;
async function downloadAllAudio(btn) {
  if (dlBusy) return;
  dlBusy = true;
  const files = VOCAB_AUDIO.map(f => VOCAB_AUDIO_DIR + f);
  let done = 0, failed = 0;
  const label = n => { if (btn) btn.textContent = `Downloading ${n}/${files.length}…`; };
  label(0);
  for (let k = 0; k < files.length; k += 8) {
    await Promise.all(files.slice(k, k + 8).map(u =>
      fetch(u).then(r => { if (!r.ok) failed++; }).catch(() => { failed++; })));
    done = Math.min(k + 8, files.length);
    label(done);
  }
  dlBusy = false;
  if (btn) btn.textContent = failed ? `Downloaded, ${failed} failed` : "Audio saved for offline use";
  toast(failed ? `${failed} clips could not be fetched` : "All word audio is now offline");
}

/* ---------- answer feedback tones ----------
   Short sine tones rather than anything voiced: quiet, soft-edged, and under
   a third of a second, because this plays many times in a ten-minute review
   and anything sharp would grate by the third day. The wrong-answer tone is
   a gentle fall, not a buzzer — getting a word wrong is the normal path
   through a review, not a failure worth punishing.

   Its own Audio element, so a chime can never cut a word clip short. */

const SFX_FILES = { correct: "audio/ui/correct.mp3", wrong: "audio/ui/wrong.mp3" };
let sfxEl = null;

/* S.sfx — 0 off · 1 correct only · 2 both. */
function sfx(kind) {
  const mode = (typeof S === "undefined" || S.sfx === undefined) ? 2 : S.sfx;
  if (!mode) return;
  if (kind === "wrong" && mode < 2) return;
  if (!sfxEl) { sfxEl = new Audio(); sfxEl.preload = "auto"; sfxEl.volume = 0.9; }
  try { sfxEl.pause(); } catch (e) {}
  sfxEl.src = SFX_FILES[kind];
  sfxEl.currentTime = 0;
  const p = sfxEl.play();
  if (p && p.catch) p.catch(() => {});
}

/* ---------- lexical forms ---------- */
const FORM_AUDIO_DIR = "audio/forms/";

function playForm(form, tile) {
  const file = FORM_AUDIO[form];
  if (!file) return false;
  warmClip(FORM_AUDIO_DIR + file);
  const a = sndInit();
  sndGen++; a.onended = null;
  sndClear();
  try { a.pause(); } catch (e) {}
  setSrc(a, FORM_AUDIO_DIR + file);
  a.currentTime = 0;
  if (tile) { sndTile = tile; tile.classList.add("playing"); }
  a.playbackRate = sndRate();
  const p = a.play();
  if (p && p.catch) p.catch(() => sndClear());
  return true;
}

/* Headword, then each extra form in turn — "θεός … ὁ". */
let formRun = 0;
function playEntry(i) {
  const extras = extraForms(i);
  const a = sndInit();
  playWord(i, null);
  const gen = sndGen;            // captured after playWord bumped it
  let k = 0;
  a.onended = () => {
    sndClear();
    if (sndGen !== gen || k >= extras.length) { a.onended = null; return; }
    const next = extras[k++];
    setTimeout(() => {
      if (sndGen !== gen) return;
      playForm(next.form, null);
      const g2 = sndGen;
      a.onended = () => {          // keep the chain on its own generation
        sndClear();
        if (sndGen !== g2 || k >= extras.length) { a.onended = null; return; }
        const nx = extras[k++];
        setTimeout(() => { if (sndGen === g2) { playForm(nx.form, null); } }, 240);
      };
    }, 240);
  };
}
function stopEntry() {
  sndGen++;
  if (sndEl) { try { sndEl.pause(); } catch (e) {} sndEl.onended = null; }
  sndClear();
}

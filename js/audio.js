/* Pronunciation playback.

   One shared Audio element rather than one per tile: a phone will happily
   run out of decoders if you hand it 32, and reusing one means a new tap
   cancels the previous sound instead of talking over it.

   Clips are precached by the service worker, so this works offline. */

const AUDIO_DIR = "audio/clips/";
let sndEl = null, sndTile = null;

function sndInit() {
  if (sndEl) return sndEl;
  sndEl = new Audio();
  sndEl.preload = "auto";
  sndEl.addEventListener("ended", sndClear);
  sndEl.addEventListener("error", sndClear);
  return sndEl;
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
  sndClear();
  try { a.pause(); } catch (e) {}
  a.src = AUDIO_DIR + file;
  a.currentTime = 0;
  if (tile) { sndTile = tile; tile.classList.add("playing"); }
  const p = a.play();
  if (p && p.catch) p.catch(() => { sndClear(); toast("Could not play that clip"); });
  return true;
}

/* Play a sequence with a gap — used by "play all". */
let sndQueue = null;
function playSequence(list, i = 0) {
  if (i === 0) sndQueue = list;
  if (sndQueue !== list || i >= list.length) return;
  const tile = document.querySelector(`[data-greek="${CSS.escape(list[i])}"]`);
  playGreek(list[i], tile);
  const a = sndInit();
  a.onended = () => {
    sndClear();
    setTimeout(() => playSequence(list, i + 1), 260);
  };
}
function stopSequence() {
  sndQueue = null;
  if (sndEl) { try { sndEl.pause(); } catch (e) {} sndEl.onended = null; }
  sndClear();
}

/* Grid markup shared by the lesson and the Tables tab. */
function soundGridHtml(kind) {
  const clips = AUDIO_CLIPS.filter(c => c[3] === kind);
  return `<div class="alpha-grid">${clips.map(c => `
    <button class="alpha snd" data-greek="${c[0]}" onclick="playGreek('${c[0]}',this)"
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

/* Play the citation form for VOCAB[i]. */
function playWord(i, tile) {
  const file = VOCAB_AUDIO[i];
  if (!file) return false;
  const a = sndInit();
  sndClear();
  try { a.pause(); } catch (e) {}
  a.src = VOCAB_AUDIO_DIR + file;
  a.currentTime = 0;
  if (tile) { sndTile = tile; tile.classList.add("playing"); }
  const p = a.play();
  if (p && p.catch) p.catch(() => sndClear());
  return true;
}

/* Bulk download so the whole set is available offline. The service worker
   caches each response as it passes through, so a plain fetch is enough. */
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

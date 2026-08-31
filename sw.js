/* Koine Greek — service worker.

   The app is a handful of static files, so the strategy is cache-first: a hit means
   it opens instantly and works with no connection at all, and a miss only
   happens on first run. Bump VERSION to ship a change — the old cache is
   dropped on activate and the page is offered a reload.

   Off-origin requests (YouTube, billmounce.com) are deliberately not touched.
   Those are the pronunciation resources and they need a connection; the app
   greys them out when offline rather than caching a broken copy. */

const VERSION = 'v26';
const CACHE   = `koine-${VERSION}`;

/* The bulk set — 470 word clips and 27 New Testament books, 497 files and
   9.5MB — lives in its own cache. One cache name swept on every VERSION bump
   meant every code change threw all of it away and pulled it down again,
   with "Hear it" and the reader failing offline until the refill finished.
   Bump this digit only when a bulk file's *content* changes.

   Safe to keep across versions: the mp3 filenames encode VOCAB array indices
   and data/vocab.js is append-only, so a kept cache can only ever be missing
   newly added files — which the next fill adds. It can never map an old file
   onto a new index. */
const BULK = 'koine-bulk-1';
const isBulkUrl = u => /audio\/vocab\/[^/]+\.mp3$/.test(u)
                    || /data\/gnt\/(?!manifest\.json)[^/]+\.json$/.test(u);

/* Bulk files whose *content* changed in this release. The bulk cache is
   deliberately never swept, so a re-recorded clip would otherwise be served
   from it for ever — the fill only fetches what is missing. Evicting the few
   that changed costs two small re-downloads instead of all 9.5MB, which is
   what bumping BULK would cost. Empty this list in the release after the
   one that fills it. */
const STALE = [
  'audio/vocab/492_sos.mp3',      // was reading the string as "S.O.S."
  'audio/vocab/508_axios.mp3',    // was spelling out the final letters
];

const SHELL = [
  /* Only index.html — never also '.'. Precaching both stores two copies of
     the shell under different keys, and a CDN can hand back a stale one for
     the directory URL. Navigations are routed to this entry below, so there
     is exactly one shell and it cannot drift. */
  'index.html',
  'css/app.css',
  'js/app.js',
  'js/pwa.js',
  'js/audio.js',
  'js/gnt.js',
  'js/sync.js',
  'data/vocab.js',
  'data/lessons.js',
  'data/readings.js',
  'data/audio.js',
  'data/gnt/manifest.json',
  'data/offline.json',
  'data/paradigms.js',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-512.png',
  'audio/erasmian-alphabet-chart.pdf',
  /* 42 shared lexical forms — 520KB, small enough to always have */
  'audio/forms/f01_he.mp3',
  'audio/forms/f02_ho.mp3',
  'audio/forms/f03_to.mp3',
  'audio/forms/f04_ouk.mp3',
  'audio/forms/f05_ouch.mp3',
  'audio/forms/f06_he_rel.mp3',
  'audio/forms/f07_ho_rel.mp3',
  'audio/forms/f08_pasa.mp3',
  'audio/forms/f09_pan.mp3',
  'audio/forms/f10_ex.mp3',
  'audio/forms/f11_ti_int.mp3',
  'audio/forms/f12_ti_ind.mp3',
  'audio/forms/f13_polle.mp3',
  'audio/forms/f14_polu.mp3',
  'audio/forms/f15_patros.mp3',
  'audio/forms/f16_mia.mp3',
  'audio/forms/f17_hen.mp3',
  'audio/forms/f18_ges.mp3',
  'audio/forms/f19_megale.mp3',
  'audio/forms/f20_mega.mp3',
  'audio/forms/f21_oudemia.mp3',
  'audio/forms/f22_ouden.mp3',
  'audio/forms/f23_andros.mp3',
  'audio/forms/f24_gunaikos.mp3',
  'audio/forms/f25_cheiros.mp3',
  'audio/forms/f26_hetis.mp3',
  'audio/forms/f27_ho_ti.mp3',
  'audio/forms/f28_sarkos.mp3',
  'audio/forms/f29_podos.mp3',
  'audio/forms/f30_metros.mp3',
  'audio/forms/f31_photos.mp3',
  'audio/forms/f32_haute.mp3',
  'audio/forms/f33_touto.mp3',
  'audio/forms/f34_medemia.mp3',
  'audio/forms/f35_meden.mp3',
  'audio/forms/f36_hudatos.mp3',
  'audio/forms/f37_puros.mp3',
  'audio/forms/f38_tria.mp3',
  'audio/forms/f39_ta.mp3',
  'audio/forms/f40_orous.mp3',
  'audio/forms/f41_nuktos.mp3',
  'audio/forms/f42_otos.mp3',
  'audio/ui/correct.mp3',
  'audio/ui/wrong.mp3',

  /* pronunciation clips — 540KB, cached so audio works offline */
  'audio/clips/01_alpha.mp3',
  'audio/clips/02_beta.mp3',
  'audio/clips/03_gamma.mp3',
  'audio/clips/04_delta.mp3',
  'audio/clips/05_epsilon.mp3',
  'audio/clips/06_zeta.mp3',
  'audio/clips/07_eta.mp3',
  'audio/clips/08_theta.mp3',
  'audio/clips/09_iota.mp3',
  'audio/clips/10_kappa.mp3',
  'audio/clips/11_lambda.mp3',
  'audio/clips/12_mu.mp3',
  'audio/clips/13_nu.mp3',
  'audio/clips/14_xi.mp3',
  'audio/clips/15_omicron.mp3',
  'audio/clips/16_pi.mp3',
  'audio/clips/17_rho.mp3',
  'audio/clips/18_sigma.mp3',
  'audio/clips/19_tau.mp3',
  'audio/clips/20_upsilon.mp3',
  'audio/clips/21_phi.mp3',
  'audio/clips/22_chi.mp3',
  'audio/clips/23_psi.mp3',
  'audio/clips/24_omega.mp3',
  'audio/clips/d01_ai.mp3',
  'audio/clips/d02_ei.mp3',
  'audio/clips/d03_oi.mp3',
  'audio/clips/d04_ui.mp3',
  'audio/clips/d05_au.mp3',
  'audio/clips/d06_eu.mp3',
  'audio/clips/d07_hu.mp3',
  'audio/clips/d08_ou.mp3'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c =>
    c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })))));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();

    /* One-time migration off the single-cache layout: carry the bulk files
       out of the old cache instead of sweeping them and re-downloading
       9.5MB. Guarded, because a failure here must not stop the worker
       activating — the fill would recover it, just slowly. */
    try {
      const old = keys.filter(k => k !== CACHE && k !== BULK && k.startsWith('koine-v'));
      if (old.length) {
        const bulkCache = await caches.open(BULK);
        for (const k of old) {
          const c = await caches.open(k);
          for (const req of await c.keys()) {
            if (!isBulkUrl(req.url)) continue;
            if (await bulkCache.match(req)) continue;
            const r = await c.match(req);
            if (r) await bulkCache.put(req, r);
          }
        }
      }
    } catch (e) { /* fall through to a normal fill */ }

    /* Drop the re-recorded clips so the fill below pulls them again. */
    try {
      const bulkCache = await caches.open(BULK);
      for (const u of STALE) {
        await bulkCache.delete(u);
        await bulkCache.delete(u, { ignoreSearch: true });
      }
    } catch (e) { /* nothing cached yet */ }

    await Promise.all(keys.filter(k => k !== CACHE && k !== BULK).map(k => caches.delete(k)));
    await self.clients.claim();
    fillBulk();                       // not awaited: the app is usable already
  })());
});

/* Everything else — word clips and the New Testament — pulled in the
   background once the app is running. Deliberately not part of the install:
   cache.addAll is all-or-nothing, and one failed response among 500 would
   stop the worker installing at all. Here a failure costs one file.

   Re-running is cheap because anything already cached is skipped, so the
   page asks for a top-up on every load and an interrupted fill resumes. */
let filling = false;

async function post(msg) {
  const cs = await self.clients.matchAll({ includeUncontrolled: true });
  cs.forEach(c => c.postMessage(msg));
}

async function fillBulk() {
  if (filling) return;
  filling = true;
  try {
    /* The manifest is a SHELL entry, so it is read from CACHE. Reading it
       from BULK would miss, fall through to fetch(), and throw when offline
       — and then no fill would ever run. */
    const cache = await caches.open(CACHE);
    const bulkCache = await caches.open(BULK);
    const res = await cache.match('data/offline.json') || await fetch('data/offline.json');
    const { bulk } = await res.json();

    const queue = bulk.slice();
    let done = 0, failed = 0;
    const total = bulk.length;

    const worker = async () => {
      while (queue.length) {
        const url = queue.shift();
        try {
          if (!(await bulkCache.match(url))) {
            const r = await fetch(url);
            if (r.status === 200) await bulkCache.put(url, r);
            else failed++;
          }
        } catch (e) { failed++; }
        done++;
        if (done % 20 === 0) post({ type: 'offline-progress', done: done - failed, total, failed });
      }
    };
    // Six at a time: enough to be quick, few enough to leave the network
    // responsive if the app is being used while this runs.
    await Promise.all(Array.from({ length: 6 }, worker));

    /* One retry pass. The first requests go out while the worker is still
       activating and a couple reliably lose that race, so without this a
       fresh install finishes a file or two short and only recovers on the
       next visit — which is not what "offline by default" should mean. */
    if (failed) {
      const retry = [];
      for (const url of bulk) if (!(await bulkCache.match(url))) retry.push(url);
      for (const url of retry) {
        try {
          const r = await fetch(url);
          if (r.status === 200) { await bulkCache.put(url, r); failed--; }
        } catch (e) { /* leave it for the next load */ }
      }
    }
    post({ type: 'offline-progress', done: done - failed, total, failed, complete: failed === 0 });
  } catch (e) {
    post({ type: 'offline-progress', error: true });
  } finally {
    filling = false;
  }
}

self.addEventListener('message', e => {
  if (e.data === 'skip-waiting') self.skipWaiting();
  if (e.data === 'ensure-offline') e.waitUntil(fillBulk());
  if (e.data === 'offline-status') e.waitUntil(reportStatus());
});

async function reportStatus() {
  try {
    const cache = await caches.open(CACHE);       // the manifest is a SHELL entry
    const bulkCache = await caches.open(BULK);
    const res = await cache.match('data/offline.json') || await fetch('data/offline.json');
    const { bulk } = await res.json();
    let have = 0;
    for (const u of bulk) if (await bulkCache.match(u)) have++;
    post({ type: 'offline-status', have, total: bulk.length });
  } catch (e) {
    post({ type: 'offline-status', error: true });
  }
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  e.respondWith((async () => {
    const cache = await caches.open(CACHE);

    // Every navigation resolves to the one cached shell — but only real page
    // navigations. A target="_blank" link to a file (the alphabet PDF) also
    // arrives as mode:'navigate', and was being handed index.html instead.
    const leaf = new URL(req.url).pathname.split('/').pop();
    if (req.mode === 'navigate' && !/\.[a-z0-9]+$/i.test(leaf)) {
      const shell = await cache.match('index.html');
      if (shell) return shell;
      try { return await fetch(req); } catch (err) { return Response.error(); }
    }

    const cached = await cache.match(req, { ignoreSearch: true });
    if (cached) return cached;

    // Word clips and New Testament books are held separately, so that a
    // version bump does not cost 9.5MB. A runtime miss is stored in
    // whichever of the two it belongs to.
    const bulkCache = isBulkUrl(req.url) ? await caches.open(BULK) : null;
    if (bulkCache) {
      const hit = await bulkCache.match(req, { ignoreSearch: true });
      if (hit) return hit;
    }

    const res = await fetch(req);
    if (res.status === 200 && res.type === 'basic') (bulkCache || cache).put(req, res.clone());
    return res;
  })());
});

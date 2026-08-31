/* Koine Greek — service worker.

   The app is a handful of static files, so the strategy is cache-first: a hit means
   it opens instantly and works with no connection at all, and a miss only
   happens on first run. Bump VERSION to ship a change — the old cache is
   dropped on activate and the page is offered a reload.

   Off-origin requests (YouTube, billmounce.com) are deliberately not touched.
   Those are the pronunciation resources and they need a connection; the app
   greys them out when offline rather than caching a broken copy. */

const VERSION = 'v14';
const CACHE   = `koine-${VERSION}`;

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
  'data/paradigms.js',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-512.png',
  'audio/erasmian-alphabet-chart.pdf',
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
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', e => {
  if (e.data === 'skip-waiting') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  e.respondWith((async () => {
    const cache = await caches.open(CACHE);

    // Every navigation resolves to the one cached shell.
    if (req.mode === 'navigate') {
      const shell = await cache.match('index.html');
      if (shell) return shell;
      try { return await fetch(req); } catch (err) { return Response.error(); }
    }

    const cached = await cache.match(req, { ignoreSearch: true });
    if (cached) return cached;

    try {
      const res = await fetch(req);
      if (res.status === 200 && res.type === 'basic') cache.put(req, res.clone());
      return res;
    } catch (err) {
      throw err;
    }
  })());
});

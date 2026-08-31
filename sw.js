/* Koine Greek — service worker.

   The app is a handful of static files, so the strategy is cache-first: a hit means
   it opens instantly and works with no connection at all, and a miss only
   happens on first run. Bump VERSION to ship a change — the old cache is
   dropped on activate and the page is offered a reload.

   Off-origin requests (YouTube, billmounce.com) are deliberately not touched.
   Those are the pronunciation resources and they need a connection; the app
   greys them out when offline rather than caching a broken copy. */

const VERSION = 'v6';
const CACHE   = `koine-${VERSION}`;

const SHELL = [
  '.',
  'index.html',
  'css/app.css',
  'js/app.js',
  'js/pwa.js',
  'js/sync.js',
  'data/vocab.js',
  'data/lessons.js',
  'data/readings.js',
  'data/paradigms.js',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-512.png'
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
    const cache  = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: true });
    if (cached) return cached;

    try {
      const res = await fetch(req);
      if (res.status === 200 && res.type === 'basic') cache.put(req, res.clone());
      return res;
    } catch (err) {
      if (req.mode === 'navigate') {
        const shell = await cache.match('index.html');
        if (shell) return shell;
      }
      throw err;
    }
  })());
});

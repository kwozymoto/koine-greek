/* Koine Greek — service worker.

   The app is a handful of static files, so the strategy is cache-first: a hit means
   it opens instantly and works with no connection at all, and a miss only
   happens on first run. Bump VERSION to ship a change — the old cache is
   dropped on activate and the page is offered a reload.

   Off-origin requests (YouTube, billmounce.com) are deliberately not touched.
   Those are the pronunciation resources and they need a connection; the app
   greys them out when offline rather than caching a broken copy. */

const VERSION = 'v139';
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
  /* v139: ἀγνοέω, and it took six rounds because of where I was looking.
     Its ο is an omicron and every cue spelled it `no` -- an English word
     with the /ou/ of gold, which is the exact fault check_cues gates. That
     rule was written and gated an hour before I offered four fresh
     candidates that all contained the token. Five rounds went on h
     placement, binding and syllable splits: a vowel fault treated as a
     structure fault. `agnaw eh hoe` is νομίζω's own `nawmee zoh` shape,
     the aw bound forward, and the strong h disappears with it.
     The lesson is the one the batch-4 audit started from -- the cue guide
     had an answer to all ten of his complaints before those clips were
     made. A rule nobody applies is prose, whether it sits in a markdown
     file or in a checker written ninety minutes earlier.
     STALE also had ἀγνοέω twice, from v137 and v138. Deduplicated here;
     the list is read on every activate, so a repeat was harmless and
     untidy. */
  /* v138: σοφία and ἀγνοέω, the two blemishes flagged in passing.
     σοφία `soffee ah` had the vowel and was clunky; `sawfeeah` is σοφός's
     own answer transposed -- one token for the flow, the vowel spelled.
     ἀγνοέω is the first cue accepted WITH A KNOWN FAULT. Its ο is an
     omicron and `no` gives it the gold vowel, but every remedy tried came
     back at 0.63-0.91s a syllable and spelled: "None win. All the others
     here spell words/letters." It is a 22-occurrence word and the blemish
     is recorded in its cue row rather than chased.
     It also found the gate's limit: the gold-vowel rule reads only a cue's
     FIRST token, and ἀγνοέω has its `no` second. Widening it is blocked --
     of the 24 cues a wider test flags, most are false (every `hoe` is the
     -ω ending, an omega) and two of the genuine ones are already approved,
     γίνομαι and ἀποκρίνομαι. Work list, not a gate. */
  /* v137: nine clips, and the end of a rule's argument. Every rule an ear
     had settled was applied to all 593 clips nobody has heard; it changed
     FOUR of them, so regenerating the rest was not done -- it would have
     re-rolled a non-deterministic voice over clips of unknown quality
     rather than fixing anything. The sweep was still worth it: it found
     εἰ and ἤ, #37 and #51 in the deck, both cued `ay` and never heard.
     The prediction that a bare letter name would be read as the letter was
     WRONG -- both were played and kept -- and the guide now says so.
     The gold-vowel rule went the other way and is now gated: νόμος, σοφία
     and νομίζω all moved, making it five for five with χρόνος and σοφός.
     Three of those five had been PASSED in an earlier batch, before anyone
     was asking whether that o was the one in omelet. */
  /* v136: χρόνος and σοφός, and the rule that came out of them. Fraser
     re-heard two clips he had passed and found both wrong -- they had been
     judged before the omicron/omega question existed, so `crow noss` and
     `so foss` had never been asked whether that o was the one in omelet.
     Both are now closed syllables: `chronoss`, `sawfoss`.
     Those two were also the whole evidence for a line in the guide saying
     this drift could not be predicted. It could; the note is corrected and
     names three unheard words it flags, which stay a work list until an ear
     reaches them. And a fourth sighting of the `oss` fault -- a bare `oss`
     after a consonant picks up an extra letter -- IS now gated in
     check_cues, because it needs no prediction: a cue either has one or it
     does not. Its first version called `lah` and `neh` consonant-final and
     flagged three approved clips; the guide says in rule 5 that the h in
     ah/eh/oh is not a sound, so the checker was wrong and the pack right. */
  /* v135: πρόβατον alone. Its stressed omicron was lengthening toward an
     omega, and closing the syllable with a doubled beta forces it short --
     `pro bah ton` -> `probbah ton`, the third time that mechanism has
     worked after πρός and the four προσ- compounds. The guide records it
     as a remedy and explicitly not as a rule: the obvious predictor, that
     a cue drifts long when it spells an English gold-vowel word, is false,
     and χρόνος `crow noss`, σοφός `so foss` and πρό `pro` are the three
     heard clips that disprove it. */
  /* v134: the four προσ- clips. The rule the guide gave for them was right
     and its reason was wrong -- it said `pro` is "the omega sound, as in
     professional", and professional has a schwa in that syllable. Tested
     over seven words: the four προσ- ones moved to `pross`, because a bare
     `pro` drops the sigma; πρό, πρόβατον and πρῶτος all kept what they had.
     So it is the sigma and not the vowel, and check_cues holds that
     positionally now. The same experiment found a real limit, which the
     guide records: ο and ω are separated everywhere the pack can manage it
     and cannot be in `pro` -- πρό and πρῶτος are spelled the same, were
     heard side by side against φωνή and τόπος, and both were kept. */
  /* v133: batch 4 closed, and sixteen clips changed. Ten flags in fifty --
     but the finding is not the count. Every one of the ten had a cause
     already written in the cue guide before the clip was made, and four
     were spellings a previous batch had fixed in ONE word while leaving
     the other words carrying them: `keye` was replaced for καινός on the
     10th and shipped again in καιρός on the 11th. tools/check_cues.py is
     the answer to that and holds all 818 against what an ear rejected.
     Two other things settled here: bare `gee` is spoken as the letter G,
     which is why ἀναγινώσκω said it, and `ghee` beat Fraser's own `gehn`
     -- so the h is the fix and not the syllable division. And speed, a
     number on the request that this project had never used in four
     rounds, fixed a clip that was right and too slow. */
  /* v121, like v120, changes data/lessons.js only. It is in SHELL, so
     the VERSION bump replaces it and nothing here needs touching. */
  /* v120 changes data/lessons.js only, which is precached in SHELL and
     so is replaced by the VERSION bump. No bulk file changed, so the
     v119 entries below stay: STALE is read on every activate and a
     clip already evicted is simply missing, which costs one refetch. */
  /* v119: batch 3 closed. Six flags in fifty, against thirty-one in
     batch 2 -- and three of the six were faults already settled,
     sitting in cues no rule reached: νέος bound so its -ος never
     stood alone, καινός with the αι diphthong, ἅγιος with a soft g.
     πρός needed no new cue at all: the same one rolled again, which
     is now the second time that has been the answer. And ἀκάθαρτος
     was not re-cued -- the take was right and only slow, at 2.73 s
     against a 1.80 median for the pack's 177 other four-syllable
     clips, so it is the same recording at the median tempo. */
  'audio/vocab/022_pros.mp3',                        // πρός
  'audio/vocab/064_agios.mp3',                       // ἅγιος
  'audio/vocab/369_kainos.mp3',                      // καινός
  'audio/vocab/487_ischuros.mp3',                    // ἰσχυρός
  'audio/vocab/488_neos.mp3',                        // νέος
  'audio/vocab/495_manthano.mp3',                    // μανθάνω
  'audio/vocab/444_akathartos.mp3',                  // ἀκάθαρτος
  'audio/vocab/165_ophthalmos.mp3',                // ὀφθαλμός
  'audio/vocab/192_dikaioo.mp3',                   // δικαιόω
  'audio/vocab/193_kairos.mp3',                    // καιρός
  'audio/vocab/194_proseuchomai.mp3',              // προσεύχομαι
  'audio/vocab/273_ploion.mp3',                    // πλοῖον
  'audio/vocab/312_chronos.mp3',                   // χρόνος
  'audio/vocab/316_paidion.mp3',                   // παιδίον
  'audio/vocab/356_epiginosko.mp3',                // ἐπιγινώσκω
  'audio/vocab/391_logizomai.mp3',                 // λογίζομαι
  'audio/vocab/392_perisseuo.mp3',                 // περισσεύω
  'audio/vocab/408_paraginomai.mp3',               // παραγίνομαι
  'audio/vocab/441_echthros.mp3',                  // ἐχθρός
  'audio/vocab/442_elios.mp3',                     // ἥλιος
  'audio/vocab/446_anaginosko.mp3',                // ἀναγινώσκω
  'audio/vocab/506_ana.mp3',                       // ἀνά
  'audio/vocab/672_epairo.mp3',                    // ἐπαίρω
  'audio/vocab/191_proserchomai.mp3',              // προσέρχομαι
  'audio/vocab/256_prosopon.mp3',                  // πρόσωπον
  'audio/vocab/291_proskuneo.mp3',                 // προσκυνέω
  'audio/vocab/417_proseuche.mp3',                 // προσευχή
  'audio/vocab/394_probaton.mp3',                   // πρόβατον
  'audio/vocab/486_sofos.mp3',                      // σοφός
  'audio/vocab/029_poieo.mp3',                     // ποιέω
  'audio/vocab/035_ei.mp3',                        // εἰ
  'audio/vocab/049_e.mp3',                         // ἤ
  'audio/vocab/079_nomos.mp3',                     // νόμος
  'audio/vocab/206_sophia.mp3',                    // σοφία
  'audio/vocab/233_eleeo.mp3',                     // ἐλεέω
  'audio/vocab/427_metanoeo.mp3',                  // μετανοέω
  'audio/vocab/617_agnoeo.mp3',                    // ἀγνοέω
  'audio/vocab/790_nomizo.mp3',                    // νομίζω
];

const SHELL = [
  /* Only index.html — never also '.'. Precaching both stores two copies of
     the shell under different keys, and a CDN can hand back a stale one for
     the directory URL. Navigations are routed to this entry below, so there
     is exactly one shell and it cannot drift. */
  'index.html',
  /* Play requires the privacy policy to be reachable from inside the app, and
     an in-app link that fails on a train is not reachable. It has a .html
     extension, so the navigation router below leaves it alone rather than
     handing back the shell. */
  'privacy.html',
  'css/app.css',
  'js/app.js',
  'js/report.js',
  'js/pwa.js',
  'js/greek.js',
  'js/audio.js',
  'js/gnt.js',
  'js/icons.js',
  'js/keys.js',
  'js/write.js',
  'js/grid.js',
  'js/clause.js',
  'js/sync.js',
  'data/vocab.js',
  'data/lessons.js',
  'data/readings.js',
  'data/audio.js',
  'data/examples.js',
  'data/gnt/manifest.json',
  'data/offline.json',
  'data/paradigms.js',
  'data/lexicon.js',
  'data/forms.js',
  'data/clauses.js',
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
  /* The version lives here and nowhere else. A problem report asks for
     it rather than carrying a copy that can go stale. */
  if (e.data === 'version') post({ type: 'version', version: VERSION });
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

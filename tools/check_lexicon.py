# -*- coding: utf-8 -*-
"""Check data/lexicon.js against the corpus and against the deck.

    python tools/check_lexicon.py

data/lexicon.js is 4,800 glosses nobody in this project wrote, which is a new
kind of content for this repo — everything else either comes from the corpus
or was written and checked by hand. It cannot be checked for accuracy without
a lexicon and a reader. What it can be checked for is everything else:

  1. Every key is a lemma the corpus actually contains. A key that matches
     nothing is a gloss that can never be shown, and more likely a sign the
     matcher drifted.
  2. No key collides with a lemma the deck teaches. Those 509 were checked by
     hand and must win; the builder leaves them out, and if one ever appears
     here the precedence has quietly inverted and the app would start
     teaching "then" for δέ.
  3. Nothing empty, no markup, no beta code that survived conversion, no
     absurd length. The Dodson source is beta-coded and a conversion failure
     leaves Latin letters behind, which is easy to see and easy to miss.
  4. A gloss reciting a verb in the first person belongs to a lemma the
     corpus tags V-. That rewrite is the one editorial change made to the
     source data, so it is the one most worth pinning down.
  5. docs/lexicon-changes.md exists and carries the CC BY credit, because the
     licence asks for both the attribution and a note of changes.

And one advisory, which never fails the build: where the shipped lexicon and
the deck's own gloss for the same word disagree. They cannot both be shown —
the deck always wins — but the list is worth reading, because it is the
clearest measure of how far the free lexicons sit from the hand-written ones.
"""
import collections, io, json, os, re, sys, unicodedata, subprocess

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GNT = os.path.join(ROOT, "data", "gnt")
CREDIT = "www.STEPBible.org"

LEX_PATH = os.path.join(ROOT, "data", "lexicon.js")
if not os.path.isfile(LEX_PATH):
    sys.exit("data/lexicon.js is missing — run tools/build_lexicon.py")

js = ("const fs=require('fs'),vm=require('vm');const c=vm.createContext({});"
      "for(const f of ['data/lexicon.js','data/vocab.js'])"
      "vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});"
      "process.stdout.write(vm.runInContext('JSON.stringify({LEX,VOCAB})',c));")
out = subprocess.run(["node", "-e", js], cwd=ROOT, capture_output=True,
                     text=True, encoding="utf-8")
if out.returncode:
    sys.exit("could not load the app data:\n" + out.stderr)
data = json.loads(out.stdout)
LEX, VOCAB = data["LEX"], data["VOCAB"]

man = json.load(io.open(os.path.join(GNT, "manifest.json"), encoding="utf-8"))
LEMMAS, DECK_GLOSS, POS = man["lemmas"], man["gloss"], man["pos"]


def key(x):
    d = unicodedata.normalize("NFD", x).replace("̀", "́")
    return unicodedata.normalize("NFC", d).lower()


# Exact first, and case-folded only for the second question below. The corpus
# tags a few words twice, once capitalised — Θάλασσα beside θάλασσα — so the
# two lookups genuinely differ and conflating them was hiding the real test.
EXACT = {l: i for i, l in enumerate(LEMMAS)}
BY_KEY = {}
for i, l in enumerate(LEMMAS):
    BY_KEY.setdefault(key(l), i)
DECK_BY_KEY = {}
for i, l in enumerate(LEMMAS):
    if DECK_GLOSS[i]:
        DECK_BY_KEY.setdefault(key(l), DECK_GLOSS[i])

# the commonest tagging of each lemma
counts = collections.defaultdict(collections.Counter)
freq = collections.Counter()
for b in man["books"]:
    d = json.load(io.open(os.path.join(GNT, b["a"] + ".json"), encoding="utf-8"))
    for ch in d["c"]:
        for vs in ch:
            for w in vs[1]:
                counts[w[1]][POS[w[2]]] += 1
                freq[w[1]] += 1
best = {i: c.most_common(1)[0][0] for i, c in counts.items()}

unknown, collide, shape, person = [], [], [], []
LATIN = re.compile(r"[A-Za-z]")
BETA = re.compile(r"[)(/\\=|+]")

for lemma, gloss in LEX.items():
    i = EXACT.get(lemma)
    if i is None:
        unknown.append("%-22s is not a lemma in the corpus, spelled that way" % lemma)
        continue
    if DECK_GLOSS[i]:
        collide.append("%-22s the deck already glosses this %r, and must win; "
                       "lexicon says %r" % (lemma, DECK_GLOSS[i], gloss))
        continue
    # A capitalised twin of a deck word may appear here, but only carrying the
    # deck's own gloss — otherwise the same word reads two ways depending on
    # whether it opened a sentence.
    twin = DECK_BY_KEY.get(key(lemma))
    if twin and gloss != twin:
        collide.append("%-22s is a case variant of a deck word glossed %r, but "
                       "ships as %r" % (lemma, twin, gloss))
        continue
    g = gloss.strip()
    if not g:
        shape.append("%-22s has an empty gloss" % lemma)
    elif len(g) > 120:
        shape.append("%-22s gloss is %d characters — a definition, not a gloss"
                     % (lemma, len(g)))
    elif "<" in g or "&" in g:
        shape.append("%-22s gloss carries markup: %r" % (lemma, g[:50]))
    elif BETA.search(g) and LATIN.search(g) is None:
        shape.append("%-22s gloss looks like unconverted beta code: %r" % (lemma, g[:50]))
    # the first-person rewrite is checked below, against the list of lemmas the
    # build says it actually rewrote — not by guessing from the wording, which
    # flags ὄφελον, whose lexicon gloss is "I wish!" all on its own

# --- the licence asks for a note of changes, and for the credit
notes = os.path.join(ROOT, "docs", "lexicon-changes.md")
lic = []
if not os.path.isfile(notes):
    lic.append("docs/lexicon-changes.md is missing — CC BY asks for a note of changes")
else:
    txt = io.open(notes, encoding="utf-8").read()
    if CREDIT not in txt:
        lic.append("docs/lexicon-changes.md does not carry the STEPBible credit")
    # Section 1 is the one editorial change made to the source data, so it is
    # the one worth pinning down. Read back the lemmas the build says it
    # rewrote and hold each to two things: it is a verb, and the shipped gloss
    # really is what the note claims. A rewrite that quietly stopped matching
    # its own changelog is exactly what CC BY's note is for.
    sec = txt.split("\n## ")
    rows = [l for l in (sec[1] if len(sec) > 1 else "").split("\n")
            if l.startswith("| ") and not l.startswith("| lemma")
            and not l.startswith("|---")]
    for row in rows:
        cells = [c.strip() for c in row.strip("|").split("|")]
        if len(cells) != 3:
            continue
        lemma, was, now = cells
        i = BY_KEY.get(key(lemma))
        if i is None:
            person.append("%-22s is listed as rewritten but is not a corpus lemma" % lemma)
        elif best.get(i) != "V-":
            person.append("%-22s was rewritten to the first person but the corpus "
                          "calls it %s" % (lemma, best.get(i)))
        elif LEX.get(lemma) != now:
            person.append("%-22s the note says it ships as %r, but it ships as %r"
                          % (lemma, now[:30], str(LEX.get(lemma))[:30]))
    if not rows:
        lic.append("docs/lexicon-changes.md lists no rewritten verbs — the note "
                   "and the build have come apart")
src = io.open(LEX_PATH, encoding="utf-8").read(4000)
if CREDIT not in src:
    lic.append("data/lexicon.js does not name its source in the header")

# --- advisory: where the two sources disagree about a word both know
STOP = set("i my me the a an of to and or in on at is am are be it he she they "
           "you we not one".split())
words = lambda s: {w for w in re.split(r"[^a-z]+", s.lower()) if w and w not in STOP}
CIT = {"τέ": "τε", "οὕτω(ς)": "οὕτως", "δέω": "δεῖ",
       "ἱερός": "ἱερόν", "ἐλεάω": "ἐλεέω"}
disagree = []
for v in VOCAB:
    h = v[0].split(",")[0].strip()
    i = BY_KEY.get(key(CIT.get(h, h)))
    if i is None or not DECK_GLOSS[i]:
        continue
    # what the free lexicons would have said, had the deck not owned it
    alt = LEX.get(LEMMAS[i])
    if alt and not (words(v[1]) & words(alt)):
        disagree.append("%-16s deck: %-34s lexicon would say: %s"
                        % (h, v[1][:34], alt[:38]))

covered = sum(1 for g in DECK_GLOSS if g) + len(LEX)
print("lexicon entries: %d   deck entries: %d   corpus lemmas: %d (%.1f%% glossed)"
      % (len(LEX), sum(1 for g in DECK_GLOSS if g), len(LEMMAS),
         100.0 * covered / len(LEMMAS)))
print()


def section(title, items, limit=None):
    print("%s: %d" % (title, len(items)))
    for s in items[:limit]:
        print("   " + s)
    if limit and len(items) > limit:
        print("   ... and %d more" % (len(items) - limit))
    print()


section("keys that are not corpus lemmas", unknown, 15)
section("keys that collide with a deck gloss", collide, 15)
section("glosses of the wrong shape", shape, 15)
section("first-person glosses on something the corpus does not call a verb", person, 15)
section("licence and attribution", lic)
print("advisory, never a failure — deck and lexicon disagree: %d of %d"
      % (len(disagree), len(VOCAB)))
for s in disagree[:12]:
    print("   " + s)
if len(disagree) > 12:
    print("   ... and %d more" % (len(disagree) - 12))

hard = unknown + collide + shape + person + lic
sys.exit(1 if hard else 0)

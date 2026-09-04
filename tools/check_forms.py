# -*- coding: utf-8 -*-
"""Put every row of data/forms.js back to the SBLGNT.

    python tools/check_forms.py

The parsing drill marks you against these codes, so a wrong one teaches a
wrong parse with the corpus's authority behind it. Six things are checkable,
and all six are checked against the bundled text rather than against the tool
that wrote the file — a builder and its own checker agreeing proves nothing:

  1. The form occurs in the New Testament, spelled exactly that way.
  2. Its parse code is the corpus's, at every occurrence.
  3. It is UNAMBIGUOUS — the same code everywhere it appears. This is the one
     that matters. A form with two honest readings (ἔλεγον, first singular or
     third plural) would be marked wrong half the time it was answered right.
  4. Its lemma is the VOCAB entry claimed, so the drill never shows a
     headword that belongs to a different word.
  5. It occurs at the reference given.
  6. The code is complete for what the drill asks: a finite verb needs person,
     tense, voice, mood and number; a noun or adjective needs case, number and
     gender. A dash in one of those is a question with no answer.

And two shape checks, because the drill's own honesty depends on them: no
participles or infinitives (a different question, deliberately not asked),
and every row's part of speech is one the drill knows how to lay out.
"""
import collections, io, json, os, re, subprocess, sys, unicodedata

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GNT = os.path.join(ROOT, "data", "gnt")

FORMS_PATH = os.path.join(ROOT, "data", "forms.js")
if not os.path.isfile(FORMS_PATH):
    sys.exit("data/forms.js is missing — run tools/build_forms.py")

js = ("const fs=require('fs'),vm=require('vm');const c=vm.createContext({});"
      "for(const f of ['data/forms.js','data/vocab.js'])"
      "vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});"
      "process.stdout.write(vm.runInContext('JSON.stringify({FORMS,VOCAB})',c));")
out = subprocess.run(["node", "-e", js], cwd=ROOT, capture_output=True,
                     text=True, encoding="utf-8")
if out.returncode:
    sys.exit("could not load the app data:\n" + out.stderr)
data = json.loads(out.stdout)
FORMS, VOCAB = data["FORMS"], data["VOCAB"]

man = json.load(io.open(os.path.join(GNT, "manifest.json"), encoding="utf-8"))
LEMMAS, POS = man["lemmas"], man["pos"]


def key(x):
    d = unicodedata.normalize("NFD", x).replace("̀", "́")
    return unicodedata.normalize("NFC", d).lower()


bare = lambda w: re.sub(r"[^\wͰ-Ͽἀ-῿]", "", w)

# Everything the corpus says about every surface form, gathered once.
parses = collections.defaultdict(set)     # form -> {(pos, code, lemmaIdx)}
refs = collections.defaultdict(set)       # form -> {"Matthew 2:8"}
for b in man["books"]:
    d = json.load(io.open(os.path.join(GNT, b["a"] + ".json"), encoding="utf-8"))
    nums = b.get("n") or list(range(1, len(d["c"]) + 1))
    for ci, ch in enumerate(d["c"]):
        for vs in ch:
            for w in vs[1]:
                f = bare(w[0])
                if f:
                    parses[f].add((POS[w[2]], w[3], w[1]))
                    refs[f].add("%s %d:%d" % (b["t"], nums[ci], vs[0]))

CITATION = {"τε": "τέ", "οὕτως": "οὕτω(ς)", "δεῖ": "δέω",
            "ἱερόν": "ἱερός", "ἐλεέω": "ἐλεάω"}
FINITE = set("IDSO")

missing, wrong, ambiguous, lemma_bad, ref_bad, incomplete, shape = [], [], [], [], [], [], []
for n, row in enumerate(FORMS):
    if not isinstance(row, list) or len(row) != 5:
        shape.append("row %d is not [form, vocab index, pos, code, ref]" % n)
        continue
    form, vi, pos, code, ref = row
    tag = "%-14s" % form
    if not isinstance(vi, int) or vi < 0 or vi >= len(VOCAB):
        shape.append("%s points at VOCAB[%r], which does not exist" % (tag, vi))
        continue
    if pos not in ("V-", "N-", "A-"):
        shape.append("%s has part of speech %r, which the drill cannot lay out"
                     % (tag, pos))
        continue
    if len(code) != 8:
        shape.append("%s parse code %r is not 8 characters" % (tag, code))
        continue

    got = parses.get(form)
    if not got:
        missing.append("%s does not occur in the New Testament, spelled that way" % tag)
        continue
    codes = {(p, c) for p, c, _ in got}
    if len(codes) > 1:
        ambiguous.append("%s has %d readings in the corpus — %s"
                         % (tag, len(codes),
                            " / ".join(sorted(c for _, c in codes))))
        continue
    cpos, ccode = list(codes)[0]
    if (cpos, ccode) != (pos, code):
        wrong.append("%s is filed as %s %s; the corpus says %s %s"
                     % (tag, pos, code, cpos, ccode))
        continue
    if pos == "V-" and code[3] not in FINITE:
        shape.append("%s is a %s — the drill does not ask those"
                     % (tag, "participle" if code[3] == "P" else "infinitive"))
        continue
    need = (0, 1, 2, 3, 5) if pos == "V-" else (4, 5, 6)
    if any(code[k] == "-" for k in need):
        incomplete.append("%s %s has no answer for part of what is asked" % (tag, code))
        continue

    head = VOCAB[vi][0].split(",")[0].strip()
    want = key(CITATION.get(head, head))
    lemmas = {key(LEMMAS[li]) for _, _, li in got}
    if want not in lemmas:
        lemma_bad.append("%s is shown under %s; the corpus lemma is %s"
                         % (tag, head, " / ".join(sorted(LEMMAS[li] for _, _, li in got))))
        continue
    if ref not in refs[form]:
        ref_bad.append("%s does not occur at %s" % (tag, ref))

kinds = collections.Counter(r[2] for r in FORMS if isinstance(r, list) and len(r) == 5)
cells = len({(r[3][1] + r[3][2] + r[3][3]) if r[2] == "V-" else (r[3][4] + r[3][5] + r[3][6])
             for r in FORMS if isinstance(r, list) and len(r) == 5})
print("forms: %d  (%d finite verbs, %d nouns and adjectives) · %d parse cells · "
      "%d lemmas"
      % (len(FORMS), kinds.get("V-", 0), kinds.get("N-", 0) + kinds.get("A-", 0),
         cells, len({r[1] for r in FORMS if isinstance(r, list) and len(r) == 5})))
print()


def section(title, items, limit=12):
    print("%s: %d" % (title, len(items)))
    for s in items[:limit]:
        print("   " + s)
    if len(items) > limit:
        print("   ... and %d more" % (len(items) - limit))
    print()


section("forms the corpus does not contain", missing)
section("parses that are not the corpus's", wrong)
section("forms with more than one reading — unmarkable", ambiguous)
section("forms shown under the wrong headword", lemma_bad)
section("references the form does not occur at", ref_bad)
section("parse codes missing part of what is asked", incomplete)
section("rows the drill cannot use", shape)

hard = missing + wrong + ambiguous + lemma_bad + ref_bad + incomplete + shape
sys.exit(1 if hard else 0)

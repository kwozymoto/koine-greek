# -*- coding: utf-8 -*-
"""Pour the corpus into the twelve graded passages in data/readings.js.

    python tools/build_readings.py

The passages were the last hand-written island in the app. Each word was two
opaque strings —

    ["ἦν", "impf act ind 3sg of εἰμί — was"]

— a surface form and one blob fusing a parse with a gloss, separated by an
em dash only by convention. Nothing could be done with that. The graded
reader could not tell a word you know from one you do not, and the cloze test
had to draw its distractors from "any word in this passage over four letters
long", which is how it came to offer four words that could not all fill the
same slot.

Meanwhile the corpus carries a full parse for every token of the same text,
and tools/check_readings.py has been aligning all 810 of them, word for word,
since it was written. So the data was always there; it was only ever being
used to check the passages rather than to feed them.

This appends four fields to each word:

    ["ἦν", "impf act ind 3sg of εἰμί — was", "εἰμί", "V-", "3IAI-S--", 7]
      surface  the hand-written note        lemma  pos   parse code  VOCAB

Appending, not replacing: every existing reader of w[0] and w[1] is
untouched, and the hand-written English — which the corpus cannot supply and
should not overwrite — stays exactly as it was. The VOCAB index is -1 for a
word the course does not teach.

Unlike data/vocab.js this file is keyed by id and nothing indexes into it by
position, so growing a row is safe. Regenerate whenever data/vocab.js grows,
for the same reason data/examples.js has to be: that last field moves.
"""
import io, json, os, re, subprocess, sys, unicodedata

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from corpus import ROOT, bare, norm, verse_tokens, manifest        # noqa: E402

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass


def load_readings():
    """Through node, as check_readings does — the file is JavaScript with
       comments and template niceties, and a regex over it is a guess."""
    js = ("const fs=require('fs'),vm=require('vm');const c=vm.createContext({});"
          "vm.runInContext(fs.readFileSync('data/readings.js','utf8'),c,"
          "{filename:'data/readings.js'});"
          "process.stdout.write(vm.runInContext('JSON.stringify(READINGS)',c));")
    out = subprocess.run(["node", "-e", js], cwd=ROOT, capture_output=True,
                         text=True, encoding="utf-8")
    if out.returncode:
        sys.exit("could not load data/readings.js:\n" + out.stderr)
    return json.loads(out.stdout)


man = manifest()
LEM, POS = man["lemmas"], man["pos"]

V = re.findall(r'^\["(.*?)","(.*?)",(\d+),"(\w+)",(\d)\]',
               io.open(os.path.join(ROOT, "data", "vocab.js"), encoding="utf-8").read(), re.M)
RETIRED = {237}
CITATION = {"τε": "τέ", "οὕτως": "οὕτω(ς)", "δεῖ": "δέω",
            "ἱερόν": "ἱερός", "ἐλεέω": "ἐλεάω"}      # see tools/check_vocab.py
IDX = {}
for i, v in enumerate(V):
    if i not in RETIRED:
        h = v[0].split(",")[0].strip()
        IDX.setdefault(norm(CITATION.get(h, h)), i)

READINGS = load_readings()
src = io.open(os.path.join(ROOT, "data", "readings.js"), encoding="utf-8").read()

total = aligned = indeck = 0
for r in READINGS:
    toks, warn = verse_tokens(r["ref"])
    if toks is None:
        sys.exit("%s: %s" % (r["id"], warn))
    if warn:
        print("   %s — %s" % (r["id"], warn))
    if len(toks) != len(r["w"]):
        sys.exit("%s (%s): the passage has %d words, the corpus %d — fix the "
                 "text before adding parses to it" % (r["id"], r["ref"], len(r["w"]), len(toks)))

    rows = []
    for (vn, text, li, pi, code), w in zip(toks, r["w"]):
        total += 1
        if norm(bare(w[0])) != norm(bare(text)):
            sys.exit("%s (%s): %r where the corpus has %r"
                     % (r["id"], r["ref"], w[0], text))
        aligned += 1
        lemma = LEM[li]
        vi = IDX.get(norm(lemma), -1)
        if vi >= 0:
            indeck += 1
        # w[0] and w[1] exactly as they were; the rest appended
        rows.append('["%s","%s","%s","%s","%s",%d]'
                    % (w[0], w[1].replace('"', "'"), lemma, POS[pi], code, vi))

    # Replace this passage's w:[...] in place, so the file keeps its comments,
    # its notes and its ordering. Anchored on the id, because two passages
    # from the same chapter would otherwise be indistinguishable.
    m = re.search(r'(\{id:"%s",[\s\S]*?w:\[)([\s\S]*?)(\]\})' % re.escape(r["id"]), src)
    if not m:
        sys.exit("could not find the words of %s in data/readings.js" % r["id"])
    src = src[:m.start(2)] + "\n" + ",\n".join(rows) + "\n" + src[m.end(2):]

p = os.path.join(ROOT, "data", "readings.js")
io.open(p, "w", encoding="utf-8", newline="\n").write(src)
print("passages: %d   words aligned to the corpus: %d of %d   in the deck: %d (%.0f%%)"
      % (len(READINGS), aligned, total, indeck, 100.0 * indeck / total))
print("wrote data/readings.js — %.1f KB" % (os.path.getsize(p) / 1024))

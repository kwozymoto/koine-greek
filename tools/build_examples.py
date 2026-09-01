# -*- coding: utf-8 -*-
"""One example verse per vocabulary word, taken from the SBLGNT the app
already ships in data/gnt/.

A frequency list without context does not transfer to reading — that is the
most repeated complaint about vocabulary apps. The corpus is already here, so
no verse has to be written or chosen by hand: for each word, take the
shortest verse that contains it and is made almost entirely of words the
course teaches, so the example can be read rather than merely looked at.

Two passes. The strict one wants 4-12 words and 85% course vocabulary; the
relaxed one takes up to 16 words at 75% for the stragglers. A word with no
verse under either gets null and the card simply shows no example."""
import json, io, os, re, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
G = os.path.join(ROOT, "data", "gnt")

def key(x):
    """Accent-sensitive, because the accent is the whole difference between
       tis "anyone" and tis "who?", and between pote "once" and pote "when?".
       Matching a headword to a lemma without accents gave the interrogative
       pote a verse about a man who had once been blind, and the
       interrogative tis a verse using the indefinite. Grave folds to acute:
       that shift is positional, not lexical."""
    d = unicodedata.normalize("NFD", x).replace("\u0300", "\u0301")
    return unicodedata.normalize("NFC", d).lower()

man = json.load(io.open(os.path.join(G, "manifest.json"), encoding="utf-8"))
lemmas = man["lemmas"]

V = re.findall(r'^\["(.*?)","(.*?)",(\d+),"(\w+)",(\d)\]',
               io.open(os.path.join(ROOT, "data", "vocab.js"), encoding="utf-8").read(), re.M)
RETIRED = {237}
CITATION = {"τε": "τέ", "οὕτως": "οὕτω(ς)",
            "δεῖ": "δέω", "ἱερόν": "ἱερός",
            "ἐλεέω": "ἐλεάω"}   # see tools/check_vocab.py
IDX = {}
for i, v in enumerate(V):
    if i not in RETIRED:
        h = v[0].split(",")[0].strip()
        IDX.setdefault(key(CITATION.get(h, h)), []).append(i)
# corpus lemma index -> the VOCAB entries that lemma can illustrate
L2V = {li: IDX[key(l)] for li, l in enumerate(lemmas) if key(l) in IDX}

# One corpus lemma, three verbs. MorphGNT files the impersonal δεῖ, δέω
# "I bind" and δέομαι "I beg" together, so the lemma alone cannot say which
# entry a token belongs to and δεῖ would take every δέω verse. The stem can:
# these are the forms, accent-blind, that each entry may be illustrated by.
flat = lambda x: "".join(c for c in unicodedata.normalize("NFD", x)
                         if not unicodedata.combining(c)).lower()
STEM = {
    161: re.compile(r"^(δει|δειν|εδει|δεη|δεον|δεοντα)$"),   # δεῖ, it is necessary
    364: re.compile(r"^(δησ|εδησ|δεδε|δεθ)"),                # δέω, I bind
}

def entry_for(w):
    """Which VOCAB entry, if any, this token is an example of."""
    for i in L2V.get(w[1], ()):
        if i not in STEM or STEM[i].match(flat(w[0])):
            return i
    return None

# ---- gather every verse once -------------------------------------------
verses = []
for b in man["books"]:
    d = json.load(io.open(os.path.join(G, b["a"] + ".json"), encoding="utf-8"))
    for ci, ch in enumerate(d["c"]):
        chno = b["n"][ci] if b.get("n") else ci + 1
        for vs in ch:
            ws = vs[1]
            vidx = [entry_for(w) for w in ws]
            known = sum(1 for x in vidx if x is not None)
            verses.append({
                "ref": "%s %d:%d" % (b["t"], chno, vs[0]),
                "words": [w[0] for w in ws],
                "vidx": vidx,
                "cover": known / len(ws) if ws else 0,
            })
print("verses available: %d" % len(verses))

def pick(lo, hi, mincov, need, best):
    for v in verses:
        n = len(v["words"])
        if not (lo <= n <= hi) or v["cover"] < mincov:
            continue
        for x in set(i for i in v["vidx"] if i is not None):
            if x not in need:
                continue
            score = (round(v["cover"], 3), -n)
            cur = best.get(x)
            if not cur or score > cur[0]:
                best[x] = (score, v, v["vidx"].index(x))

targets = set(i for i in range(len(V)) if i not in RETIRED)
best = {}
pick(4, 12, 0.85, targets, best)
strict = len(best)
pick(3, 16, 0.75, targets - set(best), best)
print("strict pass: %d   after the relaxed pass: %d of %d" % (strict, len(best), len(targets)))

# ---- emit ---------------------------------------------------------------
rows = []
for i in range(len(V)):
    e = best.get(i)
    if not e:
        rows.append("null")
        continue
    _, v, at = e
    text = " ".join(v["words"]).replace('"', "'")
    rows.append('["%s","%s",%d]' % (v["ref"], text, at))

out = '''/* One example verse per word, chosen from the SBLGNT in data/gnt/ by
   tools/build_examples.py — not written by hand, and not copied from
   any grammar. For each word: the shortest verse containing it that is made
   almost entirely of words this course teaches, so it can actually be read.

   [reference, verse text, index of the target word in the text]
   null where the corpus offers nothing short enough to be useful.

   Regenerate whenever data/vocab.js grows. Indexed by VOCAB position, like
   VOCAB_AUDIO, which is why vocab.js stays append-only. */
const EXAMPLES=[
''' + ",\n".join(rows) + "\n];\n"

p = os.path.join(ROOT, "data", "examples.js")
io.open(p, "w", encoding="utf-8", newline="\n").write(out)
print("wrote data/examples.js — %.1f KB, %d with an example, %d null"
      % (os.path.getsize(p) / 1024, len(best), len(V) - len(best)))
print()
for i in (12, 138, 205, 470, 486, 51):
    e = best.get(i)
    if e:
        _, v, at = e
        w = list(v["words"]); w[at] = "[" + w[at] + "]"
        print("  %-22s %-18s %s" % (V[i][0][:22], v["ref"], " ".join(w)[:64]))

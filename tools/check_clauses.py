# -*- coding: utf-8 -*-
"""Check data/clauses.js against the SBLGNT in data/gnt/.

    python tools/check_clauses.py

The sentence drill marks you against a parse code, so a row that names the
wrong word is not a typo — it teaches the opposite of the truth, and it does
it with the corpus's authority behind it. Every row is put back:

  1. The reference, the book abbreviation, the chapter index and the verse
     number all name the same verse, and that verse exists.
  2. The verse text is the corpus's, token for token. A row whose text has
     drifted would highlight by an index that no longer means anything.
  3. The target index is in range, and the token there carries the part of
     speech and the parse code the row claims.
  4. The filter that made the question answerable still holds. This is the
     real work, and it is what stops a question from having two right
     answers:

       verb  exactly one finite verb in the verse, and the target is it
       gen   exactly one word in the genitive anywhere — article and pronoun
       dat   included, because each would be a defensible tap — and the
             target is that word, and it is a noun or an adjective
       subj  one finite verb, third person, exactly one nominative
             substantive, agreeing in number, no copula, no nominative
             participle. Greek supplies about two hundred such verses in all;
             anything looser marks right answers wrong.
       who   no nominative substantive and no nominative participle at all,
             so the subject really is only in the ending; the target is the
             one finite verb, and it is not a copula.
  5. The VOCAB indices the row carries are exactly the deck words of that
     verse, so the drill's "words you have met" ordering is not a guess.

What it does not check is that the question is worth asking. A short verse
made of common words is a better question than a long one, but that is a
judgement, and the builder's caps make it rather than this.
"""
import collections, io, json, os, re, sys, unicodedata

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GNT = os.path.join(ROOT, "data", "gnt")

FINITE = set("IDSO")
COPULA = {"εἰμί", "γίνομαι", "ὑπάρχω"}
HEAD = ("N-", "RP", "RD", "RR", "A-", "RI")
LO, HI = 5, 14
COVER = 0.75


def key(x):
    d = unicodedata.normalize("NFD", x).replace("̀", "́")
    return unicodedata.normalize("NFC", d).lower()


man = json.load(io.open(os.path.join(GNT, "manifest.json"), encoding="utf-8"))
POS, LEM = man["pos"], man["lemmas"]

V = re.findall(r'^\["(.*?)","(.*?)",(\d+),"(\w+)",(\d)\]',
               io.open(os.path.join(ROOT, "data", "vocab.js"), encoding="utf-8").read(), re.M)
RETIRED = {237}
CITATION = {"τε": "τέ", "οὕτως": "οὕτω(ς)", "δεῖ": "δέω",
            "ἱερόν": "ἱερός", "ἐλεέω": "ἐλεάω"}
IDX = {}
for i, v in enumerate(V):
    if i not in RETIRED:
        h = v[0].split(",")[0].strip()
        IDX.setdefault(key(CITATION.get(h, h)), i)
L2V = [IDX.get(key(l), -1) for l in LEM]

# (abbr, chapter index, verse number) -> tokens, and the reference it prints as
BY_ADDR, REF_OF = {}, {}
for b in man["books"]:
    d = json.load(io.open(os.path.join(GNT, b["a"] + ".json"), encoding="utf-8"))
    nums = b.get("n") or list(range(1, len(d["c"]) + 1))
    for ci, ch in enumerate(d["c"]):
        for vs in ch:
            BY_ADDR[(b["a"], ci, vs[0])] = vs[1]
            REF_OF[(b["a"], ci, vs[0])] = "%s %d:%d" % (b["t"], nums[ci], vs[0])

src = io.open(os.path.join(ROOT, "data", "clauses.js"), encoding="utf-8").read()
body = re.sub(r"/\*[\s\S]*?\*/", "", src)
m = re.search(r"const CLAUSES=\[([\s\S]*)\n\];", body)
if not m:
    sys.exit("could not find CLAUSES in data/clauses.js")
ROWS = json.loads("[" + m.group(1).strip().rstrip(",") + "]")

bad = []
kinds = collections.Counter()


def fail(r, why):
    bad.append("%-5s %-20s %s" % (r[5] if len(r) > 5 else "?", r[0] if r else "?", why))


for r in ROWS:
    if len(r) != 10:
        bad.append("a row has %d fields, not 10" % len(r))
        continue
    ref, abbr, ci, vn, text, kind, at, pos, code, vidx = r
    kinds[kind] += 1
    ws = BY_ADDR.get((abbr, ci, vn))
    if ws is None:
        fail(r, "%s %d:%d is not a verse in the corpus" % (abbr, ci, vn))
        continue
    if REF_OF[(abbr, ci, vn)] != ref:
        fail(r, "calls itself %s but %s %d:%d is %s"
             % (ref, abbr, ci, vn, REF_OF[(abbr, ci, vn)]))
        continue
    want = " ".join(w[0] for w in ws).replace('"', "'")
    if text != want:
        fail(r, "the text has drifted from the corpus")
        continue
    n = len(ws)
    if not (LO <= n <= HI):
        fail(r, "is %d tokens, outside %d-%d" % (n, LO, HI))
    deck = [L2V[w[1]] for w in ws]
    if sum(1 for i in deck if i >= 0) / n < COVER:
        fail(r, "is under %d%% deck words" % int(COVER * 100))
    if sorted({i for i in deck if i >= 0}) != vidx:
        fail(r, "names the wrong VOCAB indices for its words")
    if not 0 <= at < n:
        fail(r, "points at word %d of %d" % (at, n))
        continue
    if POS[ws[at][2]] != pos or ws[at][3] != code:
        fail(r, "says word %d is %s%s; the corpus says %s%s"
             % (at, pos, code, POS[ws[at][2]], ws[at][3]))
        continue

    fin = [i for i, w in enumerate(ws) if POS[w[2]] == "V-" and w[3][3] in FINITE]
    noms = [i for i, w in enumerate(ws) if w[3][4] == "N" and POS[w[2]] in HEAD]
    nom_ptc = any(POS[w[2]] == "V-" and w[3][3] == "P" and w[3][4] == "N" for w in ws)

    if kind in ("verb", "who", "subj") and len(fin) != 1:
        fail(r, "has %d finite verbs, so there is no single one to ask about" % len(fin))
        continue

    if kind == "verb":
        if at != fin[0]:
            fail(r, "points at word %d, but the finite verb is word %d" % (at, fin[0]))
    elif kind in ("gen", "dat"):
        c = "G" if kind == "gen" else "D"
        all_c = [i for i, w in enumerate(ws) if w[3][4] == c]
        if len(all_c) != 1:
            fail(r, "has %d words in that case, so more than one tap is right" % len(all_c))
        elif all_c[0] != at:
            fail(r, "points at word %d, but the %s is word %d" % (at, kind, all_c[0]))
        elif pos not in ("N-", "A-"):
            fail(r, "answers with a %s rather than a noun or adjective" % pos)
    elif kind == "subj":
        fv = ws[fin[0]]
        agree = [i for i in noms if ws[i][3][5] == fv[3][5]]
        if len(noms) != 1 or len(agree) != 1:
            fail(r, "has %d nominative substantives, so the subject is contestable" % len(noms))
        elif nom_ptc:
            fail(r, "has a nominative participle competing for the subject")
        elif LEM[fv[1]] in COPULA:
            fail(r, "hangs on %s — with a copula the nominative may be the predicate"
                 % LEM[fv[1]])
        elif fv[3][0] != "3":
            fail(r, "has a %s person verb, whose subject is its ending" % fv[3][0])
        elif at != agree[0]:
            fail(r, "points at word %d, but the subject is word %d" % (at, agree[0]))
    elif kind == "who":
        if noms:
            fail(r, "has %d nominative substantives — the subject is on the page" % len(noms))
        elif nom_ptc:
            fail(r, "has a nominative participle, which names the subject")
        elif at != fin[0]:
            fail(r, "points at word %d, but the finite verb is word %d" % (at, fin[0]))
        elif code[0] not in "123":
            fail(r, "has no person in its code, so nobody is doing it")
        elif LEM[ws[at][1]] in COPULA:
            fail(r, "asks who is doing %s, which is a copula and often "
                 "impersonal" % LEM[ws[at][1]])
    else:
        fail(r, "is a kind this checker does not know")

print("sentence questions: %d across %d verses · %s"
      % (len(ROWS), len({(r[1], r[2], r[3]) for r in ROWS if len(r) == 10}),
         " ".join("%s %d" % kv for kv in sorted(kinds.items()))))
print()
print("rows the corpus does not bear out: %d" % len(bad))
for b in bad:
    print("   " + b)
sys.exit(1 if bad else 0)

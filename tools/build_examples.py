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
import json, io, os, re, sys, unicodedata

# The Windows console is cp1252 and the summary at the foot prints Greek, so
# without this the script writes the file and then dies on its own report.
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

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
POS = man["pos"]                 # index -> "N-", "V-", "RA" …

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

# The same problem in the other direction: MorphGNT files a pronoun's whole
# paradigm under one lemma, so ἡμεῖς is ἐγώ and ὑμεῖς is σύ. The card for σύ
# says "you (singular)" and was illustrating it with ὑμεῖς — a plural, which
# is not merely a different form but a flat contradiction of the gloss. These
# two entries may only be shown by a token of the number they claim.
# Parse code position 5 is number: S or P.
NUMBER = {3: "S", 6: "S"}                                    # σύ, ἐγώ


def lcp(a, b):
    n = 0
    while n < min(len(a), len(b)) and a[n] == b[n]:
        n += 1
    return n


def fit(token, head):
    """How much of the citation form is still visible in this token, 0–1.

       The picker used to weigh nothing but coverage and length, so it had no
       reason to prefer a form the learner could connect to the headword: σύ
       drew ὑμεῖς, ἐγώ drew ἡμῶν, and 39 of the 511 cards highlighted a word
       sharing not one letter with the entry above it.

       An augment or a reduplication hides the stem behind a syllable —
       ἔλεγον is λέγω and ought to score as such — so the comparison is also
       tried one and two letters in."""
    t, h = flat(token), flat(head)
    return max(lcp(t, h), lcp(t[1:], h), lcp(t[2:], h)) / max(1, len(h))


def fit_band(x):
    """Banded, not raw, so a hair more stem never outranks a much better
       verse. Within a band the old ordering decides, exactly as before."""
    return 2 if x >= 0.8 else 1 if x >= 0.5 else 0

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
                # the whole token, so the chosen word can carry its parse onto
                # the card — [text, lemmaIdx, posIdx, parseCode]
                "tok": ws,
                "vidx": vidx,
                "cover": known / len(ws) if ws else 0,
            })
print("verses available: %d" % len(verses))

def pick(lo, hi, mincov, need, best):
    for v in verses:
        n = len(v["words"])
        if not (lo <= n <= hi) or v["cover"] < mincov:
            continue
        # By position rather than by set, so a verse holding two forms of the
        # same word offers both. .index() took the first, which is not always
        # the one worth showing.
        for at, x in enumerate(v["vidx"]):
            if x is None or x not in need:
                continue
            if x in NUMBER and v["tok"][at][3][5:6] != NUMBER[x]:
                continue
            head = V[x][0].split(",")[0].strip()
            score = (fit_band(fit(v["words"][at], head)), round(v["cover"], 3), -n)
            cur = best.get(x)
            if not cur or score > cur[0]:
                best[x] = (score, v, at)

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
    rows.append('["%s","%s",%d,"%s","%s"]'
                % (v["ref"], text, at, POS[v["tok"][at][2]], v["tok"][at][3]))

out = '''/* One example verse per word, chosen from the SBLGNT in data/gnt/ by
   tools/build_examples.py — not written by hand, and not copied from
   any grammar. For each word: the shortest verse containing it that is made
   almost entirely of words this course teaches, so it can actually be read,
   preferring one where the word is still recognisably the word on the card.

   [reference, verse text, index of the target word, its part of speech,
    its parse code]
   null where the corpus offers nothing short enough to be useful.

   The last two are what the card labels the highlighted form with, through
   the same gntParse() the Read tab uses — so an augmented aorist stops being
   a puzzle and starts being the thing the chapter is teaching.

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

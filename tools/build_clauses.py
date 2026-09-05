# -*- coding: utf-8 -*-
"""Sentence questions built from the SBLGNT in data/gnt/ — the bank behind
the "Read a sentence" drill.

    python tools/build_clauses.py

The app could parse a word and fill in a paradigm and had nothing that asked
what a *sentence* was doing. The corpus can generate that, and mark it, with
no English written by hand — but only where the parse codes settle the answer
on their own. That is the whole design constraint here, and it is why three
of the four question types below are narrower than they first look.

The four kinds
--------------
  verb   Tap the finite verb. Decidable: pos is V- and the mood is
         indicative, imperative, subjunctive or optative. Restricted to
         verses holding exactly one, or "the" finite verb is a fiction.

  case   Tap the noun in the genitive (or dative). Restricted to verses
         holding exactly one word of that case anywhere — article and
         pronoun included in the count, since τοῦ and μου are genitive too
         and tapping either would not be wrong. The answer itself must be a
         noun or an adjective: "tap the genitive" answered by an enclitic
         μου is a true question and a thin one.

  subj   Tap the subject. This is the one that Greek will not supply. Only
         200 verses in the New Testament have a subject a parse code can
         settle: the language marks the subject in the verb ending, so an
         explicit nominative is optional, and when it is there it competes
         with predicate nominatives, appositions and nominative participles.
         The filter is therefore severe — one finite verb, third person, one
         agreeing nominative substantive, no copula, no nominative
         participle — and it yields about a hundred usable items. Those
         hundred are worth having; a looser filter would mark right answers
         wrong, which is worse than a small bank.

  who    The other side of that coin, and the reason the scarcity is a
         lesson rather than a defect: a verse with one finite verb and no
         nominative at all, where the subject is *in the ending*. Person and
         number come straight out of the code, and this is much the commoner
         case, as it should be. Copulas are excluded here too: "who is doing
         ἔστιν" is a true question and an empty one, and ἔστιν is frequently
         impersonal into the bargain.

Every row also carries the VOCAB indices of the words it uses, so the drill
can prefer verses made of words the learner has actually met rather than
serving Hebrews at random. The verse text ships in the file: the reader loads
a whole book at a time — Luke is 641 KB — and a drill must not drag 4.6 MB
behind it. data/forms.js and data/examples.js already work this way.

tools/check_clauses.py puts every row back to the corpus. Regenerate whenever
data/vocab.js grows.
"""
import collections, io, json, os, re, sys, unicodedata

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GNT = os.path.join(ROOT, "data", "gnt")

FINITE = set("IDSO")                 # indicative, imperative, subjunctive, optative
COPULA = {"εἰμί", "γίνομαι", "ὑπάρχω"}
# what may be the subject, or the answer to a case question: not the article,
# whose case merely agrees with the noun it is attached to
SUBST = ("N-", "RP", "RD", "RR", "A-", "RI", "RA")
HEAD = ("N-", "RP", "RD", "RR", "A-", "RI")

# How many of each kind to keep, and how long a verse may be. Short verses
# make better questions and a smaller file; the caps hold data/clauses.js to
# about the size of data/examples.js.
WANT = {"verb": 220, "gen": 120, "dat": 120, "subj": 110, "who": 200}
LO, HI = 5, 14
COVER = 0.75                          # of its words, this fraction in the deck


def key(x):
    """Accent-sensitive but grave-folded, as everywhere else in these tools:
       the grave is positional, the rest of the accent is lexical."""
    d = unicodedata.normalize("NFD", x).replace("̀", "́")
    return unicodedata.normalize("NFC", d).lower()


man = json.load(io.open(os.path.join(GNT, "manifest.json"), encoding="utf-8"))
POS, LEM = man["pos"], man["lemmas"]

V = re.findall(r'^\["(.*?)","(.*?)",(\d+),"(\w+)",(\d)\]',
               io.open(os.path.join(ROOT, "data", "vocab.js"), encoding="utf-8").read(), re.M)
RETIRED = {237}
CITATION = {"τε": "τέ", "οὕτως": "οὕτω(ς)", "δεῖ": "δέω",
            "ἱερόν": "ἱερός", "ἐλεέω": "ἐλεάω"}      # see tools/check_vocab.py
IDX = {}
for i, v in enumerate(V):
    if i not in RETIRED:
        h = v[0].split(",")[0].strip()
        IDX.setdefault(key(CITATION.get(h, h)), i)
# corpus lemma index -> VOCAB index, or -1
L2V = [IDX.get(key(l), -1) for l in LEM]

pool = collections.defaultdict(list)
verses = 0

for b in man["books"]:
    d = json.load(io.open(os.path.join(GNT, b["a"] + ".json"), encoding="utf-8"))
    nums = b.get("n") or list(range(1, len(d["c"]) + 1))
    for ci, ch in enumerate(d["c"]):
        for vs in ch:
            ws = vs[1]
            n = len(ws)
            verses += 1
            if not (LO <= n <= HI):
                continue
            deck = [L2V[w[1]] for w in ws]
            if sum(1 for i in deck if i >= 0) / n < COVER:
                continue
            ref = "%s %d:%d" % (b["t"], nums[ci], vs[0])
            text = " ".join(w[0] for w in ws).replace('"', "'")
            row = lambda kind, at: [ref, b["a"], ci, vs[0], text, kind, at,
                                    POS[ws[at][2]], ws[at][3],
                                    sorted({i for i in deck if i >= 0})]

            fin = [i for i, w in enumerate(ws)
                   if POS[w[2]] == "V-" and w[3][3] in FINITE]
            if len(fin) != 1:
                continue                       # "the" finite verb must be one
            fv = ws[fin[0]]

            pool["verb"].append(row("verb", fin[0]))

            # exactly one substantive in the case, article excluded
            for kind, c in (("gen", "G"), ("dat", "D")):
                # every word of that case, article and pronoun included: each
                # is a defensible tap, so a second one makes the question unfair
                all_c = [i for i, w in enumerate(ws) if w[3][4] == c]
                if len(all_c) == 1 and POS[ws[all_c[0]][2]] in ("N-", "A-"):
                    pool[kind].append(row(kind, all_c[0]))

            noms = [i for i, w in enumerate(ws)
                    if w[3][4] == "N" and POS[w[2]] in HEAD]
            nom_ptc = any(POS[w[2]] == "V-" and w[3][3] == "P" and w[3][4] == "N"
                          for w in ws)
            agree = [i for i in noms if ws[i][3][5] == fv[3][5]]
            if (len(agree) == 1 and len(noms) == 1 and not nom_ptc
                    and LEM[fv[1]] not in COPULA and fv[3][0] == "3"):
                pool["subj"].append(row("subj", agree[0]))
            elif (not noms and not nom_ptc and fv[3][0] in "123"
                  and LEM[fv[1]] not in COPULA):
                # Nothing in the nominative at all: the subject is the ending.
                # Not for a copula — "who is doing ἔστιν" is a true question
                # and an empty one, and ἔστιν is often impersonal besides.
                pool["who"].append(row("who", fin[0]))

print("verses in the corpus: %d" % verses)
print("candidates before capping:")
for k in ("verb", "gen", "dat", "subj", "who"):
    print("   %-5s %5d" % (k, len(pool[k])))

# Keep the ones made of the commonest words: a question you can read is a
# question you can answer. Ties break on brevity.
rank = {}
for i, v in enumerate(V):
    rank[i] = int(v[2])                        # occurrences in the NT
hardest = lambda r: min((rank.get(i, 0) for i in r[9]), default=0)
rows = []
for k in ("verb", "gen", "dat", "subj", "who"):
    got = sorted(pool[k], key=lambda r: (-hardest(r), len(r[4])))[:WANT[k]]
    rows += got
    print("   kept %-5s %5d" % (k, len(got)))

# Stable order, so a rebuild with the same data produces the same file.
rows.sort(key=lambda r: (r[5], r[1], r[2], r[3], r[6]))

out = '''/* Sentence questions from the SBLGNT in data/gnt/, built by
   tools/build_clauses.py — not written by hand and not copied from any
   grammar. Every answer is settled by MorphGNT's own parse codes, which is
   why each kind is narrower than it sounds:

     verb  tap the finite verb   — verses holding exactly one
     gen   tap the genitive      — exactly one, and no article in that case
     dat   tap the dative        — the same
     subj  tap the subject       — one finite verb, third person, one agreeing
                                   nominative, no copula, no nominative
                                   participle. Only ~200 verses in the New
                                   Testament qualify: Greek marks the subject
                                   in the ending, so an explicit one is
                                   optional and usually contested.
     who   who is doing it       — the other side of that: one finite verb and
                                   no nominative at all, so person and number
                                   come out of the code

   [reference, book, chapter index, verse number, the verse, kind,
    index of the word in question, its part of speech, its parse code,
    the VOCAB indices of the words it uses]

   The last of those lets the drill prefer verses made of words you have met.
   The text ships here rather than being read from data/gnt/ at runtime: the
   reader loads a whole book at a time and a drill must not drag 4.6 MB
   behind it.

   tools/check_clauses.py puts every row back to the corpus. Regenerate when
   data/vocab.js grows. */
const CLAUSES=[
''' + ",\n".join(
    '["%s","%s",%d,%d,"%s","%s",%d,"%s","%s",[%s]]'
    % (r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8],
       ",".join(str(i) for i in r[9]))
    for r in rows) + "\n];\n"

p = os.path.join(ROOT, "data", "clauses.js")
io.open(p, "w", encoding="utf-8", newline="\n").write(out)
print()
print("wrote data/clauses.js — %.1f KB, %d questions across %d verses"
      % (os.path.getsize(p) / 1024, len(rows), len({r[0] for r in rows})))
print()
for k in ("verb", "gen", "dat", "subj", "who"):
    ex = next((r for r in rows if r[5] == k), None)
    if ex:
        w = ex[4].split()
        w[ex[6]] = "[" + w[ex[6]] + "]"
        print("  %-5s %-18s %s" % (k, ex[0], " ".join(w)[:66]))

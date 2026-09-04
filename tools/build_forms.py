# -*- coding: utf-8 -*-
"""Real inflected forms for the parsing drill, taken from the SBLGNT.

    python tools/build_forms.py [--report]

Every parsing drill in this app has used λύω — a verb that does not occur in
the New Testament, conjugated into forms nobody ever wrote. That is the
standard way to teach a paradigm and a poor way to practise reading: λύεις
and ἔλυσαν are shapes, and the shapes are not the difficulty. ἐποίησεν in
Acts 7:50 is.

The corpus is already here and already parsed, so this needs no authored
content and cannot disagree with itself: MorphGNT's code both sets the
question and marks it.

ONLY FORMS THAT MEAN ONE THING. A drill that marks you wrong for a right
answer is worse than no drill. Greek is full of forms with two honest parses
— ἔλεγον is first singular or third plural, ἔχετε is indicative or
imperative, λέγω is indicative or subjunctive — and the corpus gives the one
the context demands, which the drill cannot show. So a form is only used if
it carries the SAME parse at every one of its occurrences in the whole New
Testament. That is 96% of them: 4,456 of 4,636 distinct verb forms. The 180
that are genuinely ambiguous are left out, and the ones that matter are
already taught by hand — js/app.js's PARSE array says of ἔλυον, in as many
words, "1st singular or 3rd plural".

WHAT IS ASKED, AND WHAT IS NOT.

  finite verbs         tense · voice · mood · person · number
  nouns, adjectives    case · number · gender

Participles and infinitives are left out, not because they are unimportant —
participles are the second commonest thing in the corpus — but because a
participle needs tense, voice, case, number and gender at once, which is a
different question with a different shape. Chapters 20 and 21 and the
paradigm tables cover them; this drill is honest about what it does.

Restricted to lemmas the deck teaches, so the drill never asks you to parse a
word you have no way of knowing.
"""
import collections, io, json, os, re, sys, unicodedata

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GNT = os.path.join(ROOT, "data", "gnt")
REPORT = "--report" in sys.argv

# Per grid cell, so the drill is spread across the system rather than being
# four hundred aorist indicatives. Frequency decides within a cell.
CAP_VERB = 26
CAP_SUB = 30
FINITE = set("IDSO")


def key(x):
    d = unicodedata.normalize("NFD", x).replace("̀", "́")
    return unicodedata.normalize("NFC", d).lower()


man = json.load(io.open(os.path.join(GNT, "manifest.json"), encoding="utf-8"))
LEMMAS, POS = man["lemmas"], man["pos"]

V = re.findall(r'^\["(.*?)","(.*?)",(\d+),"(\w+)",(\d)\]',
               io.open(os.path.join(ROOT, "data", "vocab.js"), encoding="utf-8").read(),
               re.M)
RETIRED = {237}
CITATION = {"τε": "τέ", "οὕτως": "οὕτω(ς)", "δεῖ": "δέω",
            "ἱερόν": "ἱερός", "ἐλεέω": "ἐλεάω"}     # see tools/check_vocab.py
DECK = {}
for i, v in enumerate(V):
    if i in RETIRED:
        continue
    h = v[0].split(",")[0].strip()
    DECK.setdefault(key(CITATION.get(h, h)), i)
LEM_TO_VOCAB = {li: DECK[key(l)] for li, l in enumerate(LEMMAS) if key(l) in DECK}

# Punctuation is attached to the token in the corpus; the form is the letters.
bare = lambda w: re.sub(r"[^\wͰ-Ͽἀ-῿]", "", w)

# Ambiguity is gathered over the WHOLE corpus, not over deck lemmas only.
# Restricting it to the deck was a real bug, caught by check_forms.py reading
# the text for itself: χάριν is the accusative of χάρις 40 times and a
# preposition 9 more, ποιήσει is future ποιέω 17 times and dative ποίησις
# once, πλέον is πολύς three times and a participle of πλέω once. In each case
# the second lemma is outside the deck, so a builder looking only at deck
# words saw one reading and called the form unambiguous — while the learner,
# who cannot know which lemma is meant, would have been marked wrong for the
# other. The deck filter belongs on which forms are ELIGIBLE, not on what the
# corpus is allowed to say about them.
parses = collections.defaultdict(set)     # form -> {(pos, code, lemmaIdx)}
freq = collections.Counter()              # deck occurrences only — what you meet
first = {}                                # form -> "Matthew 2:8"
for b in man["books"]:
    d = json.load(io.open(os.path.join(GNT, b["a"] + ".json"), encoding="utf-8"))
    nums = b.get("n") or list(range(1, len(d["c"]) + 1))
    for ci, ch in enumerate(d["c"]):
        for vs in ch:
            for w in vs[1]:
                f = bare(w[0])
                if not f:
                    continue
                parses[f].add((POS[w[2]], w[3], w[1]))
                if w[1] in LEM_TO_VOCAB:
                    freq[f] += 1
                    first.setdefault(f, "%s %d:%d" % (b["t"], nums[ci], vs[0]))

kept, dropped = collections.defaultdict(list), collections.Counter()
for f, ps in parses.items():
    if f not in freq:
        continue                      # no deck lemma ever wears this form
    codes = {(p, c) for p, c, _ in ps}
    if len(codes) > 1:
        dropped["two or more honest parses"] += 1
        continue
    pos, code = list(codes)[0]
    li = list(ps)[0][2]
    if pos == "V-":
        if code[3] not in FINITE:
            dropped["participle or infinitive"] += 1
            continue
        cell = ("V-", code[1] + code[2] + code[3])
    elif pos in ("N-", "A-"):
        cell = ("N-", code[4] + code[5] + code[6])
    else:
        dropped["not a verb, noun or adjective"] += 1
        continue
    if not all(code[k] != "-" for k in ((0, 1, 2, 3, 5) if pos == "V-" else (4, 5, 6))):
        dropped["parse code is incomplete"] += 1
        continue
    kept[cell].append((freq[f], f, LEM_TO_VOCAB[li], pos, code, first[f]))

rows = []
for cell, items in kept.items():
    items.sort(key=lambda r: (-r[0], r[1]))
    rows.extend(items[: CAP_VERB if cell[0] == "V-" else CAP_SUB])
rows.sort(key=lambda r: (-r[0], r[1]))

nv = sum(1 for r in rows if r[3] == "V-")
print("distinct forms in the corpus: %d   worn by a deck lemma: %d"
      % (len(parses), len(freq)))
for k, n in dropped.most_common():
    print("   set aside — %-28s %d" % (k + ":", n))
print("cells filled: %d   rows kept: %d  (%d finite verbs, %d nouns and adjectives)"
      % (len(kept), len(rows), nv, len(rows) - nv))
print("lemmas represented: %d of the %d in the deck"
      % (len({r[2] for r in rows}), len(DECK)))

if REPORT:
    print("\n--report: nothing written. The twenty commonest:")
    for f, form, vi, pos, code, ref in rows[:20]:
        print("   %-14s %4dx  %-10s %-9s %s" % (form, f, V[vi][0].split(",")[0], code, ref))
    sys.exit(0)

body = ",\n".join('["%s",%d,"%s","%s","%s"]' % (form, vi, pos, code, ref)
                  for _, form, vi, pos, code, ref in rows)
out = '''/* Real inflected forms from the SBLGNT, for the parsing drill — built by
   tools/build_forms.py, not written by hand.

   [form, VOCAB index of its lemma, part of speech, parse code, where it
    first occurs]

   Every form here carries the SAME parse at every one of its occurrences in
   the New Testament. Greek has plenty that do not — ἔλεγον is first singular
   or third plural, ἔχετε indicative or imperative — and the drill cannot show
   the context that decides, so it does not ask. Those are left to the PARSE
   array in js/app.js, which names both readings.

   Finite verbs and declined nouns and adjectives only. A participle needs
   tense, voice, case, number and gender at once; that is a different
   question, and chapters 20 and 21 are where it belongs.

   Regenerate whenever data/vocab.js grows. tools/check_forms.py puts every
   row back to the corpus. */
const FORMS=[
''' + body + "\n];\n"

p = os.path.join(ROOT, "data", "forms.js")
io.open(p, "w", encoding="utf-8", newline="\n").write(out)
print("\nwrote data/forms.js — %d rows, %.0f KB" % (len(rows), os.path.getsize(p) / 1024))

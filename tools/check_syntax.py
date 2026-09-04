# -*- coding: utf-8 -*-
"""Check the syntax tables' examples against the SBLGNT in data/gnt/.

    python tools/check_syntax.py

The four syntax tables in data/paradigms.js are the only content in this app
that makes claims the corpus cannot settle on its own. "Objective genitive"
is a reading, not a fact: the parse code says τοῦ θεοῦ is genitive and stops
there, and whether the genitive receives the action or performs it is exactly
what commentaries argue about. So this does not check the categories.

What it checks is everything the categories rest on, because a table that
quotes the text wrongly is worse than one that reads it debatably:

  1. The phrase occurs, contiguously, in the verse the row names. Recall is
     not a source: λέγοντος αὐτοῦ ταῦτα was taught here as the genitive
     absolute for months and appears nowhere in the New Testament.
  2. The construction the row claims is borne out by the corpus's own parse
     codes. data-claim says which:

        gen        at least one genitive in the phrase
        ptc        at least one participle
        gen-abs    a genitive participle AND a genitive noun or pronoun
        cond-1     εἰ + an indicative
        cond-2     εἰ + a past indicative (imperfect, aorist or pluperfect)
        cond-3     ἐάν + a subjunctive
        cond-4     εἰ + an optative

     That is the half of a syntax claim that is mechanical, and it is the
     half that a typo or a half-remembered verse breaks.

  3. Every table row that shows Greek carries a reference at all. A quotation
     with no address is one nobody can check.

Nothing else in the file is touched: the paradigm grids are check_paradigms's
business, and only cells carrying data-ref are examined here.
"""
import collections, io, json, os, re, sys, unicodedata

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GNT = os.path.join(ROOT, "data", "gnt")

bare = lambda w: re.sub(r"[^\wͰ-Ͽἀ-῿]", "", w)


def flat(x):
    return "".join(c for c in unicodedata.normalize("NFD", x)
                   if not unicodedata.combining(c)).lower()


man = json.load(io.open(os.path.join(GNT, "manifest.json"), encoding="utf-8"))
POS = man["pos"]
VERSES = {}
for b in man["books"]:
    d = json.load(io.open(os.path.join(GNT, b["a"] + ".json"), encoding="utf-8"))
    nums = b.get("n") or list(range(1, len(d["c"]) + 1))
    for ci, ch in enumerate(d["c"]):
        for vs in ch:
            VERSES["%s %d:%d" % (b["t"], nums[ci], vs[0])] = vs[1]

src = io.open(os.path.join(ROOT, "data", "paradigms.js"), encoding="utf-8").read()

FINITE_PAST = set("IAY")            # imperfect, aorist, pluperfect


def claim_holds(kind, got):
    """`got` is the run of corpus tokens the phrase matched."""
    def has(fn):
        return any(fn(POS[w[2]], w[3]) for w in got)
    if kind == "gen":
        return has(lambda p, c: c[4] == "G")
    if kind == "ptc":
        return has(lambda p, c: p == "V-" and c[3] == "P")
    if kind == "gen-abs":
        return (has(lambda p, c: p == "V-" and c[3] == "P" and c[4] == "G")
                and has(lambda p, c: p in ("N-", "RP", "RD", "A-") and c[4] == "G"))
    if kind == "cond-1":
        return has(lambda p, c: p == "V-" and c[3] == "I")
    if kind == "cond-2":
        return has(lambda p, c: p == "V-" and c[3] == "I" and c[1] in FINITE_PAST)
    if kind == "cond-3":
        return has(lambda p, c: p == "V-" and c[3] == "S")
    if kind == "cond-4":
        return has(lambda p, c: p == "V-" and c[3] == "O")
    return None                     # unknown claim — reported separately


def locate(ref, phrase):
    """The run of tokens in that verse matching the phrase, or None."""
    ws = VERSES.get(ref)
    if ws is None:
        return "no-verse"
    want = [flat(bare(x)) for x in phrase.split() if bare(x)]
    if not want:
        return None
    toks = [flat(bare(w[0])) for w in ws]
    for i in range(len(toks) - len(want) + 1):
        if toks[i:i + len(want)] == want:
            return ws[i:i + len(want)]
    return None


missing, wrong, unref, unknown = [], [], [], []
checked = collections.Counter()

# Only the syntax tables carry data-ref; everything else in the file is a
# paradigm grid and belongs to check_paradigms.
for block in re.findall(r'\{t:"(.*?)",tags:".*?",\s*html:`(.*?)`\}', src, re.S):
    title, html = block
    for tbl in re.findall(r"<table>.*?</table>", html, re.S):
        if "data-ref" not in tbl:
            continue                # a plain grid inside a syntax entry
        for cell in re.finditer(r"<td([^>]*)>(.*?)</td>", tbl, re.S):
            attrs, inner = cell.group(1), cell.group(2)
            text = re.sub("<.*?>", "", inner).strip()
            greek = bare(text)
            ref = re.search(r'data-ref="([^"]*)"', attrs)
            claim = re.search(r'data-claim="([^"]*)"', attrs)
            if not ref:
                # a Greek cell in a syntax table with no address to check
                if greek and 'class="g"' in attrs:
                    unref.append("%s — %s has no data-ref" % (title, text[:34]))
                continue
            ref = ref.group(1)
            checked[title] += 1
            got = locate(ref, text)
            if got == "no-verse":
                missing.append("%s — %s is not a verse in the corpus" % (title, ref))
                continue
            if got is None:
                missing.append("%s — %r does not occur in %s" % (title, text[:40], ref))
                continue
            if not claim:
                continue
            ok = claim_holds(claim.group(1), got)
            if ok is None:
                unknown.append("%s — %r is not a claim this checker knows"
                               % (title, claim.group(1)))
            elif not ok:
                wrong.append("%s — %s at %s does not bear out %r; the corpus gives %s"
                             % (title, text[:26], ref, claim.group(1),
                                " ".join(POS[w[2]] + w[3] for w in got)))

print("syntax examples checked: %d across %d tables"
      % (sum(checked.values()), len(checked)))
for t, n in checked.most_common():
    print("   %-38s %d" % (t, n))
print()


def section(title, items):
    print("%s: %d" % (title, len(items)))
    for s in items:
        print("   " + s)
    print()


section("examples that do not occur where they say", missing)
section("constructions the parse codes do not support", wrong)
section("Greek shown with no reference", unref)
section("claims this checker does not understand", unknown)

hard = missing + wrong + unref + unknown
sys.exit(1 if hard else 0)

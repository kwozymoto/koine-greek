# -*- coding: utf-8 -*-
"""data/textbooks.js against Mounce's own book, and against the deck.

    python tools/check_mounce.py

WHY THIS EXISTS. The Mounce chapter lists decide which words a class meets in
which week. Nothing in the corpus can say whether they are right — the corpus
does not know what a chapter is — and a chapter list that silently drifted
would put words in the wrong week with the app's authority behind it.

TWO HALVES.

  1. STRUCTURE, always. Every position is a live card; no card is taught in
     two chapters; chapter 35 alone is optional; each hand-placed word
     (REDIRECT, COVERED, BOOK_ONLY in build_mounce) still lands where its
     reason says — and each BOOK_ONLY word really is filed under its host in
     the SBL Greek New Testament, which is the whole claim "ἡμεῖς is the
     plural of ἐγώ" makes. None of this needs the book.
  2. THE BOOK, when it is on this machine. The chapters are derived afresh
     from the PDF by build_mounce's own code — the lexicon's "chpt N" and
     each chapter's printed list, which must agree word for word — and the
     shipped file must equal what they give.

The book lives outside the repository and never enters it, so the second half
is optional by design, like check_black. But it is never skipped QUIETLY: the
first line says whether the PDF was read. A checker that falls back without
saying so reports green for something it never looked at.

WHAT IT CANNOT DO. The six meanings in BOOK_ONLY are English written by hand,
and no checker can judge English. They are short, and a reader should look
at them.
"""
import collections, io, json, os, subprocess, sys, unicodedata

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
sys.path.insert(0, os.path.join(ROOT, "tools"))
import build_mounce as B                                   # noqa: E402

# The citation form of πλείων never occurs in the New Testament; πλείονα does,
# and it is what the corpus files under πολύς.
CORPUS_FORM = {"πλείων": "πλείονα"}


def shipped():
    js = ("const fs=require('fs'),vm=require('vm');const c=vm.createContext({});"
          "vm.runInContext(fs.readFileSync('data/textbooks.js','utf8'),c);"
          "vm.runInContext(fs.readFileSync('data/vocab.js','utf8'),c);"
          "process.stdout.write(vm.runInContext("
          "'JSON.stringify({t:TEXTBOOKS, v:VOCAB.map(x=>x[0]), b:BLACK_OF_APP})',c));")
    r = subprocess.run(["node", "-e", js], capture_output=True, text=True, encoding="utf-8", cwd=ROOT)
    if r.returncode:
        sys.exit("could not load data/textbooks.js or data/vocab.js:\n" + r.stderr)
    d = json.loads(r.stdout)
    return d["t"]["mounce"]["chapters"], d["v"], {int(k): v for k, v in d["b"].items()}


def corpus_lemmas(forms):
    """Which lemma the SBLGNT files each of these forms under, and how often."""
    import corpus
    m = corpus.manifest()
    want = {corpus.norm(f): f for f in forms}
    got = {f: collections.Counter() for f in forms}
    for bk in m["books"]:
        for ch in corpus.book(bk["a"])["c"]:
            for vs in ch:
                for w in vs[1]:
                    f = want.get(corpus.norm(w[0]))
                    if f:
                        got[f][m["lemmas"][w[1]]] += 1
    return got


def main():
    rows, deck, shift = shipped()
    head = lambda i: unicodedata.normalize("NFC", deck[i].split(",")[0].strip())
    bad = []

    # ---- structure -------------------------------------------------------
    chs = [r["ch"] for r in rows]
    if chs != sorted(set(chs)):
        bad.append("chapters are not unique and ascending: %s" % chs)
    opt = [r["ch"] for r in rows if r.get("optional")]
    if set(opt) != B.OPTIONAL:
        bad.append("optional chapters are %s, not %s" % (opt, sorted(B.OPTIONAL)))
    taught = collections.Counter()
    for r in rows:
        for i in r["v"]:
            if not isinstance(i, int) or not (0 <= i < len(deck)):
                bad.append("ch%s: %r is not a card" % (r["ch"], i)); continue
            if i in B.RETIRED:
                bad.append("ch%s: #%d is RETIRED" % (r["ch"], i))
            taught[i] += 1
        for o in r["only"]:
            if len(o) != 4 or not isinstance(o[0], str) or o[0] != unicodedata.normalize("NFC", o[0]):
                bad.append("ch%s: malformed book-only entry %r" % (r["ch"], o)); continue
            if o[2] is None and not r.get("optional"):
                bad.append("ch%s: %s has no host card outside an optional chapter" % (r["ch"], o[0]))
            if o[2] is not None and (o[2] in B.RETIRED or not (0 <= o[2] < len(deck))):
                bad.append("ch%s: %s's host #%s is not a live card" % (r["ch"], o[0], o[2]))
    bad += ["#%d (%s) is taught in %d chapters" % (i, deck[i], n) for i, n in taught.items() if n > 1]

    core = sum(len(r["v"]) + len(r["only"]) for r in rows if not r.get("optional"))
    want_core = B.CORE_TOTAL + len(B.ON_LIST)
    if core != want_core:
        bad.append("%d core words, not %d (the lexicon's %d plus ON_LIST's %d)"
                   % (core, want_core, B.CORE_TOTAL, len(B.ON_LIST)))

    # Each hand-placed word still lands where its reason says.
    placed = {}
    for r in rows:
        for o in r["only"]:
            placed[o[0]] = o
    for w, (meaning, host, rel) in B.BOOK_ONLY.items():
        o = placed.get(w)
        if not o:
            bad.append("BOOK_ONLY names %s, which no chapter shows" % w); continue
        if o[2] is None or head(o[2]) != host:
            bad.append("%s should name the %s card; it names %s" % (w, host, head(o[2]) if o[2] is not None else "none"))
        if o[1] != meaning or o[3] != rel:
            bad.append("%s's meaning or relation differs from BOOK_ONLY" % w)
    for w, (host, why) in list(B.REDIRECT.items()) + list(B.COVERED.items()):
        hits = [i for i in range(len(deck)) if i not in B.RETIRED and head(i) == host]
        if len(hits) != 1:
            bad.append("%s is placed on %s, which is not exactly one live card" % (w, host))
        elif not any(hits[0] in r["v"] for r in rows):
            bad.append("%s's card #%d (%s) is in no chapter" % (w, hits[0], host))

    # The claim a BOOK_ONLY row makes — "ἡμεῖς is the plural of ἐγώ" — is a
    # claim about the text, so ask the text.
    forms = [CORPUS_FORM.get(w, w) for w in B.BOOK_ONLY]
    lem = corpus_lemmas(forms)
    for w, (meaning, host, rel) in B.BOOK_ONLY.items():
        f = CORPUS_FORM.get(w, w)
        c = lem[f]
        if not c:
            bad.append("%s (%s) never occurs in the SBLGNT" % (w, f))
        elif c.most_common(1)[0][0] != host:
            bad.append("the SBLGNT files %s under %s, not %s" % (f, c.most_common(1)[0][0], host))

    # The look-up card's "Black N" must be Black's number, not the app's.
    from blackmap import _SHIFT
    want_shift = {a: b for a, b in _SHIFT.items() if a != b}
    if shift != want_shift:
        bad.append("BLACK_OF_APP is %s; tools/blackmap.py says %s" % (shift, want_shift))

    # ---- the book --------------------------------------------------------
    ok, why = B.book_available()
    if ok:
        chapters, p1 = B.derive()
        built, p2 = B.place(chapters, deck)
        bad += ["the book: " + p for p in p1 + p2]
        norm = lambda rs: [(r["ch"], r["t"], r["v"], r["only"], bool(r.get("optional"))) for r in rs]
        if not (p1 or p2) and norm(built) != norm(rows):
            A, S = {r["ch"]: r for r in built}, {r["ch"]: r for r in rows}
            for c in sorted(set(A) | set(S)):
                if c not in S or c not in A or norm([A[c]]) != norm([S[c]]):
                    bad.append("chapter %s: data/textbooks.js differs from what the book gives" % c)
        book = "held to the PDF (lexicon and printed lists agree)"
    else:
        book = "NOT READ — " + why

    print("mounce: %d chapters, %d core words (%d on cards, %d from the book); book %s"
          % (len(rows), core, sum(len(r["v"]) for r in rows if not r.get("optional")),
             sum(len(r["only"]) for r in rows if not r.get("optional")), book))
    if bad:
        print("\nMOUNCE CHAPTERS DO NOT HOLD: %d" % len(bad))
        for b in bad:
            print("   " + b)
        print("\n   If the book is right and the file is stale, rebuild with\n"
              "     python tools/build_mounce.py --write")
        sys.exit(1)
    print("every chapter holds: live cards, one chapter each, hand placements where "
          "their reasons say, and the forms filed under their hosts in the SBLGNT")


if __name__ == "__main__":
    main()

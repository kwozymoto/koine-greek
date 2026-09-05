# -*- coding: utf-8 -*-
"""The corpus, and the reference parser three tools now want.

Not a checker and not a builder — just the two things that were about to be
written a third time. tools/check_readings.py has resolved "John 1:1-5" to
its tokens since it was written; tools/build_readings.py needs exactly the
same thing, and so would anything else that quotes the New Testament by
address. The repo already carries RETIRED in four places and the plan notes
flag that as debt, so this one is shared before it is duplicated.

    from corpus import manifest, verse_tokens, norm

Nothing here reads the app's own data files. It knows the SBLGNT in
data/gnt/ and nothing else, which is what makes it safe to import from a
checker.
"""
import io, json, os, re, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GNT = os.path.join(ROOT, "data", "gnt")

_man = None
_books = {}


def manifest():
    """The manifest, read once. lemmas[] and pos[] are index spaces the
       per-book files point into; books[] carries real chapter numbers."""
    global _man
    if _man is None:
        _man = json.load(io.open(os.path.join(GNT, "manifest.json"), encoding="utf-8"))
    return _man


def book(abbr):
    if abbr not in _books:
        _books[abbr] = json.load(io.open(os.path.join(GNT, abbr + ".json"), encoding="utf-8"))
    return _books[abbr]


def norm(x):
    """Grave folds to acute — Greek shifts one to the other before a
       following word, so they are the same form. Breathings are kept:
       they are the whole difference between ὁ and ὅ, αὐταί and αὗται."""
    d = unicodedata.normalize("NFD", x).replace("̀", "́")
    return unicodedata.normalize("NFC", d).lower()


GK = "Ͱ-Ͽἀ-῿"
bare = lambda s: re.sub("[^" + GK + "]", "", s)


def parse_ref(ref):
    """'John 1:1-5' -> (book record, chapter array index, first verse, last).

       Returns (None, error) if it cannot be resolved. The chapter *index* is
       not the chapter number: SBLGNT omits passages such as John 7:53-8:11
       and some books do not start at one, so books[].n carries the real
       numbers and this looks the index up in them."""
    m = re.match(r"^(.*?)\s+(\d+):(\d+)(?:[-–](\d+))?$", ref.strip())
    if not m:
        return None, "reference not understood"
    title, ch = m.group(1), int(m.group(2))
    v1, v2 = int(m.group(3)), int(m.group(4) or m.group(3))
    b = next((x for x in manifest()["books"] if x["t"] == title), None)
    if not b:
        return None, "no book called %r" % title
    d = book(b["a"])
    nums = b.get("n") or list(range(1, len(d["c"]) + 1))
    if ch not in nums:
        return None, "chapter %d not in %s" % (ch, title)
    return (b, nums.index(ch), v1, v2), None


def verse_tokens(ref):
    """Every token of the verses a reference names, in order.

       [(verse number, text, lemma index, pos index, parse code), ...]
       plus a warning naming any verse of the range the SBLGNT does not
       carry — absence is worth reporting rather than silently shortening
       the passage."""
    got, err = parse_ref(ref)
    if err:
        return None, err
    b, ci, v1, v2 = got
    out = []
    for vs in book(b["a"])["c"][ci]:
        if v1 <= vs[0] <= v2:
            for w in vs[1]:
                out.append((vs[0], w[0], w[1], w[2], w[3]))
    missing = [v for v in range(v1, v2 + 1) if not any(x[0] == v for x in out)]
    return out, ("verses absent from the SBLGNT: %s" % missing if missing else None)

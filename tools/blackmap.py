# -*- coding: utf-8 -*-
"""Which chapter of Black an app chapter corresponds to.

Until the participle split these were the same number, and two checkers said
so by simply indexing Black's chapters with the app's `id`. They no longer
are: the app's chapter 20 became two, so everything from 22 up is one ahead
of the book.

    app  1-19  ->  Black  1-19     unchanged
    app  20    ->  Black  20       participles: the forms
    app  21    ->  Black  20       participles: the three uses
    app  22-27 ->  Black  21-26    shifted by one

This lives in its own file because both check_black and check_coverage need
it and because CLAUDE.md's rule about RETIRED appearing in four places is the
standing warning against the alternative. It is also the file to edit when the
app diverges from Black again, which it will: the chapters are the app's own
and the numbering is only a convenience for a reader working through the book
alongside it.

    from blackmap import black_chapter, app_chapters

`black_chapter(app_id)` gives the book's chapter for an app chapter.
`app_chapters(black_n)` gives every app chapter covering one of Black's, which
is what a coverage check needs: Black's chapter 20 is covered if EITHER half
of the app's participle material covers it.
"""

# The one place the divergence is written down. A chapter absent from here
# maps to itself, so adding chapters at the end costs nothing.
_SHIFT = {
    20: 20,   # Participles: the forms
    21: 20,   # Participles: the three uses — the same chapter of Black
    22: 21, 23: 22, 24: 23, 25: 24, 26: 25, 27: 26,
}


def black_chapter(app_id):
    """Black's chapter number for an app chapter."""
    return _SHIFT.get(app_id, app_id)


def app_chapters(black_n):
    """Every app chapter that teaches from this chapter of Black."""
    mapped = sorted(a for a, b in _SHIFT.items() if b == black_n)
    return mapped or [black_n]


def describe():
    """One line per divergence, for a checker to print so the mapping it is
       using is visible in the run rather than assumed."""
    out = []
    for b in sorted({b for b in _SHIFT.values()}):
        apps = app_chapters(b)
        if apps != [b]:
            out.append("Black %d = app %s" % (b, " and ".join(str(a) for a in apps)))
    return out

# Κοινή — Koine Greek

A single-user study app for New Testament Greek. Vanilla HTML, CSS and
JavaScript; no build step, no framework, no server. It runs from
`index.html` and works offline once installed.

Live at **https://kwozymoto.github.io/koine-greek/**

It follows David Alan Black, *Learn to Read New Testament Greek* (3rd ed.) —
26 chapters, each with its own vocabulary and a short test — and carries an
818-word deck on a spaced-repetition schedule, 24 reference tables, 12 graded
passages, and the whole Greek New Testament with every word parsed.

## Everything it teaches is checked against the corpus

`python tools/check_all.py` runs eight checkers, all of them against the
SBLGNT bundled in `data/gnt/`. They exist because this app makes claims about
a language, and a confident wrong answer is worse than no answer:

| | |
|---|---|
| `check_vocab` | the 818 entries, their example verses and the parse under each, the reader's gloss table, the audio chain, principal parts, accents |
| `check_drills` | the hand-written drill arrays in `js/app.js` — form against label |
| `check_paradigms` | the 24 reference tables, cell by cell, by parse code |
| `check_readings` | the 12 passages word for word, and every parse claim in their glosses |
| `check_lessons` | the spelling of every Greek form in the chapters, and that each question is asked after the section teaching it |
| `check_forms` | the 1,477 real inflected forms the parsing drill marks you against — each occurs, carries that parse everywhere it occurs, and belongs to the headword shown |
| `check_lexicon` | the 4,526 shipped glosses: real lemmas, none overriding the course's own, the one edit matching its changelog |
| `check_links` | every Watch row still resolves, and every embedded video is still the one named |

What none of them can check is English: whether a gloss is the right
translation, or a grammatical explanation correct. That needs a reader.

`trace-audit.html` is a local calibration page, not part of the app: it sets
the four numbers the handwriting scorer turns on, by measuring them.

## Sources and licences

**Greek text** — the [SBL Greek New Testament](https://sblgnt.com), with
morphological parsing from [MorphGNT](https://github.com/morphgnt/sblgnt).
Used under their respective terms; see those projects for the text's own
licence.

**Glosses for words the course does not teach** — `data/lexicon.js`, built by
`tools/build_lexicon.py` from two free lexicons:

- **TBESG**, the *Translators Brief lexicon of Extended Strongs for Greek*.
  > Data created by www.STEPBible.org based on work at Tyndale House
  > Cambridge, released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
  > Source: https://github.com/STEPBible/STEPBible-Data

  It carries the definitions of **G. Abbott-Smith, *A Manual Greek Lexicon of
  the New Testament*** (T&T Clark, 1922), corrected by Tyndale House scholars.

- **Dodson** — Jeff Dodson's lexicon of the Greek New Testament, public
  domain, used only for the 76 lemmas TBESG does not carry.
  Source: https://github.com/biblicalhumanities/Dodson-Greek-Lexicon

CC BY asks that changes be noted. **[`docs/lexicon-changes.md`](docs/lexicon-changes.md)**
is that note: every verb recited in the first person to match this course's
own convention, every headword matched through a spelling variant, and every
lemma left with no gloss at all.

The 816 glosses for the course's own vocabulary are **not** served from this
file. They live in the manifest, they always take precedence, and
`check_lexicon.py` fails if a shipped gloss ever tries to override one.

**The app's own code** — © 2026 Fraser Adams. **All rights reserved.**
There is deliberately no LICENSE file: this is published so it can be read and
used, not relicensed or redistributed. The bundled text and lexicons keep
their own terms, set out above, and those are unaffected.

**Not in this repository** — David Alan Black's textbook is copyrighted and
this repository is public. None of his prose, exercises or glosses is stored
here; `data/lessons.js` carries an array of vocabulary indices per chapter and
teaching written independently. Video lectures are linked, never copied.

## Layout

```
data/       vocabulary, chapters, readings, paradigms, examples, lexicon
            gnt/    the SBLGNT, one JSON per book, plus a manifest
js/         app, reader, audio, handwriting, sync, service-worker glue
tools/      the builders and the eight checkers
docs/       the pronunciation cue guide and the lexicon changelog
audio/      511 word clips, letters, and lexical forms
            (the deck is 818; the newest words have no recording yet)
```

`data/vocab.js` is **append-only**: cards, audio filenames and example verses
are all keyed by array position, so removing or reordering an entry would
silently reassign somebody's progress.

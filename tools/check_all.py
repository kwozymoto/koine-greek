# -*- coding: utf-8 -*-
"""Run every content checker and report once.

    python tools/check_all.py

The app teaches, so the thing that matters about it is whether what it says
is true. Fourteen checkers put different parts of it to the SBLGNT bundled in
data/gnt/, and this runs the lot:

    check_vocab      the 511 lexical entries, their example verses, the
                     reader's gloss table, the audio chain, the principal
                     parts, and accent placement across every data file
    check_drills     the hand-written drill arrays in js/app.js — the
                     article, verb parsing, the parsing builder, principal
                     parts — form against label
    check_paradigms  the 28 reference tables, cell by cell, by parse code
    check_grids      the paradigm rounds js/grid.js makes out of those
                     tables: that every table meant to be playable still is,
                     that no round is bigger than a minute's work, and that
                     no empty cell reaches the tray
    check_readings   the 12 passages, word for word, and every parse claim
                     in their glosses
    check_lessons    the spelling of every Greek form in the lesson bodies
                     and quizzes, and that each question is asked after the
                     section that teaches it
    check_forms      the 1,431 real inflected forms the parsing drill marks
                     you against: each occurs, carries that parse everywhere
                     it occurs, and belongs to the headword shown
    check_lexicon    the 4,832 glosses shipped for words the course does not
                     itself teach: that each is a real lemma, that none
                     overrides one of the deck's own, and that the one change
                     made to the source data matches its own changelog
    check_syntax     the four syntax tables' examples: each phrase occurs in
                     the verse it names, and the construction the row claims
                     is borne out by the corpus's own parse codes
    check_clauses    the sentence questions: every row's verse is the
                     corpus's word for word, the word it points at carries
                     the parse it claims, and the filter that made the
                     question answerable still holds — one finite verb, one
                     word in that case, one nominative that could be the
                     subject
    check_links      every Watch row: outside pages must still resolve, and
                     an embedded video must still exist and still be the one
                     the row names. The only checker that needs a network —
                     pass --offline to skip it, and it will say that it did

check_frozen is the odd one out and does not ask whether anything is true.
It asks whether a field changed that nobody meant to change, by diffing the
working tree against git HEAD. Some data has no truth to check against, only
a history: a chapter's `v:` array is the list of VOCAB positions naming which
words it teaches, nothing in the repo can derive the right answer, and one
wrong digit silently changes the course. That is exactly the field that was
nearly corrupted by being retyped from memory rather than lifted from the
file, which is the fault this whole set exists to make impossible.

check_coverage asks whether a chapter covers what Black's chapter covers.
It exists because chapter 7 taught the first aorist and nothing about second
aorists — 58% of the aorist active indicatives in the New Testament — and no
checker found that; a person did, once, by reading the two side by side. It
fails only for chapters already rewritten, and reports the rest as a work
list.

check_black is the other exception. It reads Black's own vocabulary lists to
verify each chapter's `v:` array — the one field with no derivable truth in
the repo — and the books are deliberately outside it, so it says so and exits
clean when they are not on the machine.

Exits non-zero if any of them does. What none of them can check is English:
whether a gloss is the right translation, whether a grammatical explanation
is correct. That needs a reader.
"""
import os, subprocess, sys

# The child checkers print Greek. This process must be able to relay it, and
# on Windows its own stdout defaults to the ANSI codepage, which cannot.
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHECKS = ["check_vocab", "check_drills", "check_paradigms", "check_grids",
          "check_readings", "check_lessons", "check_forms", "check_lexicon",
          "check_syntax", "check_clauses", "check_frozen", "check_black",
          "check_coverage", "check_links"]
# check_links is the one that reaches outside the repo. --offline passes
# straight through to it and leaves the other nine untouched.
ARGS = {"check_links": ["--offline"] if "--offline" in sys.argv else []}

env = dict(os.environ, PYTHONIOENCODING="utf-8")
results, failed = [], []
for name in CHECKS:
    out = subprocess.run([sys.executable, os.path.join("tools", name + ".py")]
                         + ARGS.get(name, []),
                         cwd=ROOT, capture_output=True, text=True,
                         encoding="utf-8", errors="replace", env=env)
    head = (out.stdout or "").strip().split("\n")
    summary = next((l for l in head if l.strip()), "")
    results.append((name, out.returncode, summary))
    if out.returncode:
        failed.append((name, out.stdout, out.stderr))

width = max(len(n) for n in CHECKS)
for name, code, summary in results:
    print("%-*s  %-6s %s" % (width, name, "ok" if not code else "FAILED", summary))

if failed:
    print()
    for name, so, se in failed:
        print("=" * 70)
        print(name)
        print("=" * 70)
        print(so or "")
        if se.strip():
            print(se)
sys.exit(1 if failed else 0)

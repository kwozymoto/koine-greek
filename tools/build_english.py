# -*- coding: utf-8 -*-
"""The English under Today's verse: data/english.js, built from the Berean
Standard Bible.

    python -P tools/build_english.py

The BSB has been in the public domain since 30 April 2023 (berean.bible,
"Terms"), so the verses may be shipped with the app; the one condition is
that a text that varies from the official one does not carry the Berean
name, so these are copied exactly and never edited here.

Source: the eBible.org verse-per-line file, kept OUTSIDE the repo with the
other books --
    ../Greek App Reference/BSB/engbsb_vpl.txt   ("MAT 1:1 This is the ...")
downloaded 2026-11-26 from https://eBible.org/Scriptures/engbsb_vpl.zip.

For every entry of data/examples.js (one verse per word, indexed by VOCAB
position) this writes the BSB verse at the same reference, or null where
there is no example. The Greek is the SBLGNT's verse and the English is
the BSB's verse of the same number; where the two divide a passage
differently (Acts 13:38-39 is one) the English carries a little more or
less than the Greek. Nothing is translated or written by hand.
"""
import io
import json
import os
import re
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(os.path.dirname(ROOT), "Greek App Reference", "BSB", "engbsb_vpl.txt")
OUT = os.path.join(ROOT, "data", "english.js")

BOOK = {"Matthew": "MAT", "Mark": "MAR", "Luke": "LUK", "John": "JOH", "Acts": "ACT",
        "Romans": "ROM", "1 Corinthians": "1CO", "2 Corinthians": "2CO", "Galatians": "GAL",
        "Ephesians": "EPH", "Philippians": "PHI", "Colossians": "COL",
        "1 Thessalonians": "1TH", "2 Thessalonians": "2TH", "1 Timothy": "1TI",
        "2 Timothy": "2TI", "Titus": "TIT", "Philemon": "PHM", "Hebrews": "HEB",
        "James": "JAM", "1 Peter": "1PE", "2 Peter": "2PE", "1 John": "1JO",
        "2 John": "2JO", "3 John": "3JO", "Jude": "JUD", "Revelation": "REV"}


# Where the BSB numbers a verse differently from the SBLGNT, the BSB verse
# that holds the same words. Each one checked by reading both.
VERSIFICATION = {
    # SBLGNT splits 3 John 14 in two; the BSB keeps it as one verse 14,
    # which ends with what the SBLGNT numbers 15.
    "3 John 1:15": ("3JO", 1, 14),
}

# Verses where the English shown does not carry exactly the Greek shown,
# found by comparing lengths with the neighbouring verses and then reading
# both texts side by side (2026-11-26). "split": the two divide the verses
# differently, so the English has words the SBLGNT puts in the next or
# previous verse. "text": the BSB translates words the SBLGNT leaves out.
# A length check only catches the clear cases; this list is not exhaustive.
DIFFERS = {
    "Acts 13:39": "split",        # BSB 39 includes the end of SBLGNT 38
    "Ephesians 5:13": "split",    # BSB 13 includes the start of SBLGNT 14
    "3 John 1:14": "split",       # BSB 14 includes SBLGNT 15
    "3 John 1:15": "split",
    "Mark 1:1": "text",           # "the Son of God"
    "Luke 24:3": "text",          # "of the Lord Jesus"
}


def examples():
    src = io.open(os.path.join(ROOT, "data", "examples.js"), encoding="utf-8").read()
    body = src[src.index("const EXAMPLES=["):]
    body = body[body.index("[") : body.index("\n];") + 2]
    return json.loads(body)


def main():
    if not os.path.exists(SRC):
        sys.exit("missing %s -- download engbsb_vpl.zip from eBible.org into that folder" % SRC)
    verses = {}
    for line in io.open(SRC, encoding="utf-8"):
        m = re.match(r"(\w{3}) (\d+):(\d+) (.*)", line.rstrip("\n"))
        if m:
            verses[(m.group(1), int(m.group(2)), int(m.group(3)))] = m.group(4).strip()
    out, notes, missing = [], {}, []
    for k, e in enumerate(examples()):
        if not e:
            out.append(None)
            continue
        m = re.match(r"(.+) (\d+):(\d+)$", e[0])
        key = VERSIFICATION.get(e[0]) or (
            (BOOK.get(m.group(1)), int(m.group(2)), int(m.group(3))) if m else None)
        text = verses.get(key)
        if not text:
            missing.append("%d %s" % (k, e[0]))
        out.append(text)
        if e[0] in DIFFERS:
            notes[str(k)] = DIFFERS[e[0]]
    if missing:
        sys.exit("no BSB verse for: " + ", ".join(missing))
    js = ("/* The Berean Standard Bible (public domain since 30 April 2023) for each\n"
          "   example verse in data/examples.js, same index. Built by\n"
          "   tools/build_english.py from the eBible.org file; not edited by hand. */\n"
          "const EXAMPLES_EN=[\n" +
          ",\n".join(json.dumps(t, ensure_ascii=False) for t in out) + "\n];\n"
          "/* Where the English does not carry exactly the Greek shown, by index:\n"
          "   split = the verses are divided differently; text = the BSB translates\n"
          "   words the SBLGNT leaves out. DIFFERS in the builder says which. */\n"
          "const EXAMPLES_EN_NOTE=" + json.dumps(notes, sort_keys=True) + ";\n")
    io.open(OUT, "w", encoding="utf-8", newline="\n").write(js)
    print("wrote %s: %d verses, %d without an example"
          % (os.path.relpath(OUT, ROOT), sum(1 for t in out if t), sum(1 for t in out if not t)))


main()

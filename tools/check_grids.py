# -*- coding: utf-8 -*-
"""Check the paradigm rounds js/grid.js derives from data/paradigms.js.

    python tools/check_grids.py

Fill-the-grid and the paradigm sprint author nothing. They read the same
tables the Tables tab renders and turn them into rounds — which is the point,
because it means the drill and the reference cannot disagree. It also means
the drill is one careless edit away from disappearing: js/grid.js decides a
table is playable by its shape, so a heading changed from <th> to <td>, or a
caption dropped, silently removes a paradigm from the game with nothing
anywhere to say so.

This is the thing that says so. It re-derives the rounds by the same rules
and asserts the outcome:

  1. Every table in PLAYABLE below produces at least one round, and no table
     outside it produces any. The four excluded are excluded on purpose: the
     preposition list and the discourse markers are prose in a table, the
     look-alikes are pairs rather than a paradigm, and the principal parts
     are labelled by verb rather than by slot and have ppDrill already.
  2. No round exceeds GRID_CELLS, unless it is a single column that does —
     a column is never split, because half a paradigm is not one.
  3. Every answer is Greek and non-empty. A blank cell that reached the tray
     would be an unanswerable question.
  4. Round keys are unique. They are the schedule's addresses, and two rounds
     sharing one would silently share a due date.
  5. Enough columns hold four or more forms for the sprint to have
     distractors from inside the paradigm, which is what makes it a paradigm
     question rather than a vocabulary one.

What it does not check is whether the forms are right. That is
check_paradigms.py's work, cell by cell against the corpus, and it has
already been done by the time this runs.
"""
import io, os, re, sys
from html.parser import HTMLParser

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GK = "Ͱ-Ͽἀ-῿"

# Must match GRID_CELLS in js/grid.js.
GRID_CELLS = 12

# The tables that are meant to be playable. Titles, exactly as data/paradigms.js
# gives them, so a renamed entry is a failure here and not a quiet loss.
PLAYABLE = {
    "The article",
    "Second declension nouns",
    "First declension nouns",
    "Third declension nouns",
    "Adjectives and position",
    "πᾶς, πολύς, μέγας",
    "Personal pronouns",
    "Demonstratives",
    "Relative pronoun",
    "Interrogative, indefinite, reflexive",
    "εἰμί — to be",
    "λύω — active indicative",
    "λύω — middle and passive indicative",
    "Subjunctive mood",
    "Imperative mood",
    "Infinitives",
    "Participles — the key forms",
    "Contract verbs — present",
    "μι-verbs",
    "Numbers",
}


class Tables(HTMLParser):
    """Every <table> in a fragment, as caption plus rows of cells.

       A real parse rather than a regex: the cells carry colspan and class,
       the drill's rules turn on both, and 'looks like <td class="g">' is
       exactly the kind of match that agrees with a regex and not with a
       browser."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.tables, self.t, self.row, self.cell = [], None, None, None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "table":
            self.t = {"caption": None, "rows": []}
        elif self.t is None:
            return
        elif tag == "caption":
            self.cell = {"tag": tag, "text": ""}
        elif tag == "tr":
            self.row = []
        elif tag in ("th", "td"):
            self.cell = {"tag": tag, "text": "",
                         "g": "g" in (a.get("class") or "").split(),
                         "span": max(1, int(a.get("colspan") or 1))}

    def handle_data(self, d):
        if self.cell is not None:
            self.cell["text"] += d

    def handle_endtag(self, tag):
        if tag == "table" and self.t is not None:
            self.tables.append(self.t)
            self.t = None
        elif self.t is None:
            return
        elif tag == "caption":
            self.t["caption"] = (self.cell or {}).get("text", "").strip()
            self.cell = None
        elif tag in ("th", "td") and self.cell is not None:
            self.cell["text"] = self.cell["text"].strip()
            if self.row is not None:
                self.row.append(self.cell)
            self.cell = None
        elif tag == "tr" and self.row is not None:
            if self.row:
                self.t["rows"].append(self.row)
            self.row = None


def rounds_for(title, html):
    """The same rules as gridRounds() in js/grid.js."""
    p = Tables()
    p.feed(html)
    out = []
    for tb in p.tables:
        if not tb["caption"]:
            continue
        trs = tb["rows"]
        if len(trs) < 3:
            continue
        head = trs[0]
        if len(head) < 3 or any(c["tag"] != "th" for c in head):
            continue
        cols = [c["text"] for c in head[1:]]

        rows, shaped = [], True
        for tr in trs[1:]:
            if not tr or tr[0]["tag"] != "th":
                shaped = False
                break
            c, cells = 0, []
            for td in tr[1:]:
                cells.append({"t": td["text"] if td["g"] else None,
                              "span": td["span"], "c": c})
                c += td["span"]
            rows.append({"label": tr[0]["text"], "cells": cells})
        if not shaped or not rows:
            continue

        ncol = max(sum(x["span"] for x in r["cells"]) for r in rows)
        count = lambda a, b: sum(1 for r in rows for x in r["cells"]
                                 if x["t"] and a <= x["c"] < b)
        if count(0, ncol) < 6:
            continue

        cuttable = lambda c: all(x["c"] >= c or x["c"] + x["span"] <= c
                                 for r in rows for x in r["cells"])

        def chunk_at(cap):
            out, start, prev = [], 0, 0
            for c in range(1, ncol + 1):
                if c < ncol and not cuttable(c):
                    continue
                if count(start, c) > cap and prev > start:
                    out.append((start, prev))
                    start = prev
                prev = c
            out.append((start, ncol))
            return out

        # the smallest cap that still gives as few rounds as the full one:
        # eight and eight rather than twelve and a runt of four
        widest = max(count(c, c + 1) for c in range(ncol))
        fewest = len(chunk_at(GRID_CELLS))
        cap = GRID_CELLS
        for c in range(widest, GRID_CELLS):
            if len(chunk_at(c)) == fewest:
                cap = c
                break
        chunks = chunk_at(cap)

        for a, b in chunks:
            if not count(a, b):
                continue
            out.append({
                "key": "%s|%s|%d" % (title, tb["caption"], a),
                "title": title,
                "caption": tb["caption"],
                "cols": cols[a:b],
                "one_col": b - a == 1,
                "cells": [x["t"] for r in rows for x in r["cells"]
                          if x["t"] and a <= x["c"] < b],
                "rows": rows, "a": a, "b": b,
            })
    return out


src = io.open(os.path.join(ROOT, "data", "paradigms.js"), encoding="utf-8").read()
entries = re.findall(r'\{t:"(.*?)",tags:".*?",\s*html:`(.*?)`\}', src, re.S)
if not entries:
    print("no entries parsed out of data/paradigms.js")
    sys.exit(1)

# GRID_CELLS must be the same number on both sides of this check.
js = io.open(os.path.join(ROOT, "js", "grid.js"), encoding="utf-8").read()
m = re.search(r"const GRID_CELLS = (\d+)", js)
mismatch = [] if (m and int(m.group(1)) == GRID_CELLS) else [
    "GRID_CELLS is %s in js/grid.js and %d here" % (m.group(1) if m else "?", GRID_CELLS)]

rounds, by_title = [], {}
for title, html in entries:
    got = rounds_for(title, html)
    if got:
        by_title[title] = got
        rounds += got

missing = sorted(PLAYABLE - set(by_title))
extra = sorted(set(by_title) - PLAYABLE)

oversize, empty, seen, dup, thin = [], [], set(), [], []
for r in rounds:
    if len(r["cells"]) > GRID_CELLS and not r["one_col"]:
        oversize.append("%s — %d cells across %d columns"
                        % (r["key"], len(r["cells"]), r["b"] - r["a"]))
    for c in r["cells"]:
        if not c or not re.search("[" + GK + "]", c):
            empty.append("%s — a playable cell reads %r" % (r["key"], c))
    if r["key"] in seen:
        dup.append(r["key"])
    seen.add(r["key"])

# The sprint needs four forms in one column to ask a paradigm question.
sprint_cols = 0
for r in rounds:
    cols = {}
    for row in r["rows"]:
        for x in row["cells"]:
            if x["t"] and r["a"] <= x["c"] < r["b"]:
                cols.setdefault(x["c"], []).append(x["t"])
    # distinct, not merely present: two cells reading τό cannot be two
    # options, so a column of four with a repeat is not a question
    sprint_cols += sum(1 for v in cols.values() if len(set(v)) >= 4)
if sprint_cols < 20:
    thin.append("only %d columns hold four or more forms — the sprint would "
                "have to reach outside the paradigm for distractors" % sprint_cols)

cells = sum(len(r["cells"]) for r in rounds)
print("paradigm rounds: %d from %d tables · %d cells · %d sprint columns"
      % (len(rounds), len(by_title), cells, sprint_cols))
sizes = sorted(len(r["cells"]) for r in rounds)
print("   cells per round: min %d, median %d, max %d"
      % (sizes[0], sizes[len(sizes) // 2], sizes[-1]))
for t in sorted(by_title):
    rs = by_title[t]
    print("   %-38s %d round%s  %s" % (t, len(rs), " " if len(rs) == 1 else "s",
                                       ", ".join(str(len(r["cells"])) for r in rs)))
print()


def section(title, items):
    print("%s: %d" % (title, len(items)))
    for s in items:
        print("   " + s)
    print()


section("tables that should be playable and are not", missing)
section("tables playable that should not be", extra)
section("rounds larger than the cap", oversize)
section("playable cells with no Greek in them", empty)
section("round keys used twice", dup)
section("not enough for the sprint", thin)
section("constants out of step", mismatch)

sys.exit(1 if (missing or extra or oversize or empty or dup or thin or mismatch) else 0)

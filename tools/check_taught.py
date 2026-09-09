# -*- coding: utf-8 -*-
"""Nothing the app hands you may be made of material it has not taught.

    python tools/check_taught.py

Fraser found this the way a first-time user finds anything: he opened the
app. The very first row of the very first day was "Letters and sounds", and
it opened on

    Name this letter:  Ζ        zeta / xi / psi / chi

on a fresh install, where every letter is at zero and the app had shown him
none of them. The only way to learn a letter was to guess it wrong and read
the feedback. A test of material the app had not taught, offered as the first
thing it ever does.

The vocabulary row had had the right shape all along -- introduce() puts the
five words on flashcards and only then asks about those same five -- so the
fault was not that the shape was unknown here. It was that nothing held the
letters row to it, and nothing held anything else to it either. Two steps on,
the paradigm row was gated only by "two chapters finished" and then drew from
all forty-five rounds shuffled, so a learner who had just met the article
could be handed the aorist passive to fill in.

So this is the checker for the rule rather than for the two bugs. Three
things satisfy it, and every task in the app must say which:

  TEACHES  the activity shows the material before it asks about it, in the
           same sitting -- introduce(), letterWarmup(), writeLetterDrill()
  GATED    it is withheld until the chapter that teaches it is finished
  OPEN     it deliberately runs on whatever is there, and says so on its own
           card, because a drill that refuses to run is worse than one that
           runs on borrowed material -- js/icons.js has argued that since
           DRILL_STATE was written, and this does not overturn it

What it checks:

  1. Every playable paradigm carries ch:, naming a real chapter -- the one
     that teaches it. js/grid.js withholds a round until then.
  2. Every chCol: override names a real column of that table and a real
     chapter. A typo there does nothing at all, silently.
  3. Each overridden column is corroborated by the chapter it claims: the
     chapter's own body and quiz carry its forms.
  4. Each table's chapter carries at least one of its forms by then.
  5. Every round gridRounds() derives resolves to a chapter, re-derived here
     by the same rule js/grid.js uses (the latest of its columns).
  6. Every drill in DRILLS and every row todaysPlan() can push is named
     below with which of the three it is. A new one gets neither by default,
     so it fails here -- which is the only part of this file that will still
     be doing work in a year.

CAVEAT, and it is the same one CLAUDE.md states for check_lessons. 3 and 4
ask whether the forms occur in the chapter, not whether the chapter teaches
them well. A form can appear in a chapter's prose as an aside. What they
catch is a chapter number that is wrong, which is the failure that matters:
a gate set to 5 when the material arrives at 17 puts the aorist passive back
in front of a beginner, and that is the bug this file exists for.

The first version of check 4 reported "Interrogative, indefinite, reflexive"
as having NOTHING in chapter 23. Chapter 23 is titled "Additional pronouns --
Relative, reflexive, reciprocal, interrogative" and its body says "τίς and
τις: one accent apart". The cells hold "τίς / τίνες" -- two forms in one cell
-- and the test looked for that string whole. The parser was at fault before
the entry was, which is the standing warning in CLAUDE.md and is now the
reason variants() exists.
"""
import io
import json
import os
import re
import subprocess
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

# ---------------------------------------------------------------- the data
JS = ("const fs=require('fs'),vm=require('vm');const c=vm.createContext({});"
      "vm.runInContext(fs.readFileSync('data/lessons.js','utf8'),c);"
      "vm.runInContext(fs.readFileSync('data/paradigms.js','utf8'),c);"
      "process.stdout.write(vm.runInContext("
      "'JSON.stringify({L:LESSONS,P:PARADIGMS})',c));")
run = subprocess.run(["node", "-e", JS], capture_output=True, text=True,
                     encoding="utf-8")
if run.returncode or not run.stdout:
    print("could not read the data files through node:\n" + (run.stderr or ""))
    sys.exit(1)
D = json.loads(run.stdout)
LESSONS, PARADIGMS = D["L"], D["P"]
CHAPTERS = {l["id"] for l in LESSONS}
APP = io.open("js/app.js", encoding="utf-8").read()
GRID = io.open("js/grid.js", encoding="utf-8").read()

# Which tables js/grid.js turns into rounds. check_grids.py owns this list and
# proves it against the derivation; read from there so there is one copy.
GRIDS_SRC = io.open("tools/check_grids.py", encoding="utf-8").read()
m = re.search(r"^PLAYABLE = \{(.*?)^\}", GRIDS_SRC, re.S | re.M)
PLAYABLE = set(re.findall(r'"([^"]+)"', m.group(1))) if m else set()

# ------------------------------------------------------- how each task qualifies
# TEACHES / GATED / OPEN, with the reason. Adding a drill without adding it
# here is the failure this table exists to produce.
DRILL_HOW = {
    "Vocabulary due now":
        ("TEACHES", "only cards you have met, and each shows its answer"),
    "Learn 5 new words":
        ("TEACHES", "introduce(): five flashcards, then those same five asked"),
    "Greek → English":
        ("TEACHES", "g2eBank is the words you have started"),
    "English → Greek":
        ("TEACHES", "reverseVocab draws on your own cards"),
    "The article":
        ("OPEN", "17 forms of one word, and the card says nothing changes"),
    "Verb parsing":
        ("OPEN", "λύω, invented on purpose so no chapter owns it"),
    "Alphabet":
        ("OPEN", "asks and never shows; on a cold install the card sends you "
                 "to Today's letters row, which teaches them first"),
    "Listening — letters":
        ("OPEN", "the clip is the question and the answer is named in the "
                 "feedback; the alphabet is chapter 1 and gates nothing"),
    "Listening — words":
        ("TEACHES", "pool is words you have met, cold-start pool is the "
                    "commonest forty"),
    "Parsing builder":
        ("OPEN", "λύω again"),
    "Parse a real form":
        ("TEACHES", "restricted to lemmas in S.cards"),
    "Principal parts":
        ("OPEN", "a reference list, and the card says so"),
    "Alphabet check":
        ("OPEN", "a test with no teaching, on purpose and by name: it is how "
                 "somebody who already reads Greek gets past the letters on "
                 "their first morning. As a plan row it waits until every "
                 "letter has been taught; from the menu it never does"),
    "Case functions":
        ("GATED", "caseEarned(); the card says 'chapters first' below six"),
    "Look-alikes":
        ("OPEN", "pairs one accent apart, which is a reading skill from the "
                 "first verse rather than a chapter's material"),
    "Write the letters":
        ("TEACHES", "names the letter and its sound on the card, then traces"),
    "Write it from memory":
        ("TEACHES", "your own cards"),
    "Mixed grammar review":
        ("GATED", "questions from chapters you have finished"),
    "Fill the grid":
        ("OPEN", "gridDrill(3,true); gridReach() says 'ahead of your "
                 "chapters' when that is what it would be"),
    "Paradigm sprint":
        ("OPEN", "gridSprint(14,true), same card, same warning"),
    "Produce a real form":
        ("TEACHES", "metForms(): lemmas you have met"),
    "Write a real form":
        ("TEACHES", "metForms()"),
    "Read a sentence":
        ("GATED", "clauseDrill waits for CLAUSE_CH"),
    "Daily mix":
        ("TEACHES", "made of the rows above, each already qualified"),
}

# The rows todaysPlan() can push. These are what the app hands you unasked,
# so OPEN is not available here: the plan may not run ahead of the course.
PLAN_HOW = {
    "letters": ("TEACHES", "letterWarmup(): the unmet letters are shown on "
                           "letterCard() before alphaDrill() asks"),
    "passage": ("TEACHES", "the passage itself, which is reading not testing"),
    "review":  ("TEACHES", "cards you have met; each shows its answer"),
    "new":     ("TEACHES", "introduce()"),
    "alphacheck": ("GATED", "offered only once lettersUnmet() is empty — every "
                            "letter taught. Failing it puts the missed ones back "
                            "to nought, so the teaching row returns tomorrow"),
    "grids":   ("GATED", "gridEarned(): rounds whose chapter you have done"),
    "sent":    ("GATED", "chapterReached() >= CLAUSE_CH"),
    "lesson":  ("TEACHES", "it is the teaching"),
}
KINDS = {"TEACHES", "GATED", "OPEN"}

# ------------------------------------------------------------------- helpers
def strip(s):
    return re.sub(r"<[^>]+>", " ", s or "")


def lesson_text(l):
    t = strip(l.get("body"))
    for q in (l.get("quiz") or []):
        t += " " + strip(q.get("q")) + " " \
             + " ".join(map(str, q.get("o") or [])) + " " + strip(str(q.get("w", "")))
    return t


TEXT = {l["id"]: lesson_text(l) for l in LESSONS}
# A chapter may fairly rest on a form an earlier chapter introduced.
UPTO = {n: " ".join(TEXT[i] for i in sorted(TEXT) if i <= n) for n in TEXT}


def variants(cell):
    """The forms in one cell. A cell can hold two — "τίς / τίνες" — and can
       write the movable nu in brackets, "ἐστί(ν). Testing the cell whole is
       what made check 4 report a chapter that was right as having nothing."""
    out = set()
    for part in re.split(r"\s*[/·,]\s*", cell or ""):
        part = part.strip()
        if not part:
            continue
        out.add(part)
        out.add(part.replace("(", "").replace(")", ""))
        out.add(re.sub(r"\([^)]*\)", "", part).strip())
    return {x for x in out if x}


def tables(html):
    """(columns, {column index: [cell, …]}) for each <table> in an entry."""
    out = []
    for tb in re.findall(r"<table>(.*?)</table>", html, re.S):
        hdr = re.search(r"<tr>(.*?)</tr>", tb, re.S)
        if not hdr:
            continue
        cols = [strip(c).strip() for c in
                re.findall(r"<th[^>]*>.*?</th>", hdr.group(1), re.S)][1:]
        per = {}
        for row in re.findall(r"<tr>(.*?)</tr>", tb, re.S)[1:]:
            for i, f in enumerate(re.findall(r'<td class="g">(.*?)</td>', row)):
                per.setdefault(i, []).append(strip(f).strip())
        out.append((cols, per))
    return out


def seen_by(chapter, cells):
    txt = UPTO.get(chapter, "")
    return sum(1 for c in cells if c and any(v in txt for v in variants(c)))


# --------------------------------------------------------------- the checks
bad = []
tabled = [p for p in PARADIGMS if p["t"] in PLAYABLE]

# 1 — a chapter on every playable table, and a real one
for p in tabled:
    if not p.get("ch"):
        bad.append("%r is playable and carries no ch: — js/grid.js will never "
                   "offer it, because gridChapter() returns 0" % p["t"])
    elif p["ch"] not in CHAPTERS:
        bad.append("%r claims chapter %r, which is not a chapter" % (p["t"], p["ch"]))
for p in PARADIGMS:
    if p.get("ch") and p["t"] not in PLAYABLE:
        bad.append("%r carries ch: and is not playable — nothing reads it" % p["t"])

# 2, 3, 4 — the overrides, and the corroboration
checked_cols = 0
for p in tabled:
    if not p.get("ch"):
        continue
    cols_all = set()
    for cols, per in tables(p["html"]):
        cols_all |= {c for c in cols if c}
    for col, ch in (p.get("chCol") or {}).items():
        if col not in cols_all:
            bad.append("%r overrides column %r, which it does not have "
                       "(it has %s)" % (p["t"], col, ", ".join(sorted(cols_all))))
            continue
        if ch not in CHAPTERS:
            bad.append("%r puts column %r at chapter %r, which is not a chapter"
                       % (p["t"], col, ch))
            continue
        if ch < p["ch"]:
            bad.append("%r puts column %r at chapter %d, before the table's own "
                       "chapter %d — gridChapter takes the later of the two, so "
                       "this override does nothing" % (p["t"], col, ch, p["ch"]))
            continue
        cells = []
        for cols, per in tables(p["html"]):
            for i, c in enumerate(cols):
                if c == col:
                    cells += per.get(i, [])
        hit = seen_by(ch, cells)
        checked_cols += 1
        if cells and hit * 2 < len(cells):
            bad.append("%r · %r is put at chapter %d, which carries only %d of "
                       "its %d forms" % (p["t"], col, ch, hit, len(cells)))

    cells = [c.strip() for c in re.findall(r'class="g">([^<]+)<', p["html"])
             if c.strip()]
    if cells and not seen_by(p["ch"], cells):
        bad.append("%r is put at chapter %d, which carries none of its %d forms "
                   "— nor does any chapter before it" % (p["t"], p["ch"], len(cells)))

# 5 — every derived round resolves to a chapter
rounds = subprocess.run([sys.executable, "tools/check_grids.py"],
                        capture_output=True, text=True, encoding="utf-8")
if rounds.returncode:
    bad.append("check_grids does not pass, so the rounds this would check "
               "cannot be trusted; fix that first")
no_ch = [p["t"] for p in tabled if not p.get("ch")]

# 6 — every drill and every plan row says how it qualifies
titles = re.findall(r'^\["([^"]+)","', APP[APP.index("const DRILLS=["):], re.M)
for t in titles:
    if t not in DRILL_HOW:
        bad.append("the drill %r is not in DRILL_HOW — say whether it TEACHES, "
                   "is GATED, or is deliberately OPEN, and why" % t)
for t in DRILL_HOW:
    if t not in titles:
        bad.append("DRILL_HOW names %r, which is not a drill any more" % t)
    elif DRILL_HOW[t][0] not in KINDS:
        bad.append("%r is marked %r, which is not one of %s"
                   % (t, DRILL_HOW[t][0], ", ".join(sorted(KINDS))))

plan_block = APP[APP.index("function todaysPlan("):APP.index("function planHtml(")]
ids = sorted(set(re.findall(r'tasks\.push\(\{id:"([^"]+)"', plan_block)))
for i in ids:
    if i not in PLAN_HOW:
        bad.append("the plan row %r is not in PLAN_HOW — the plan is what the "
                   "app hands you unasked, so say how it is earned" % i)
    elif PLAN_HOW[i][0] == "OPEN":
        bad.append("the plan row %r is marked OPEN. A drill you chose may run "
                   "on borrowed material; a row the app puts in front of you "
                   "on opening may not." % i)
for i in PLAN_HOW:
    if i not in ids:
        bad.append("PLAN_HOW names %r, which todaysPlan() no longer pushes" % i)

# The one thing that is structural rather than data: letterWarmup must build
# its teaching cards before it builds its questions. Weak on its own — it
# reads the source — but it is the hinge the whole file turns on, and a
# reordering that put alphaDrill first would otherwise pass everything here.
warm = re.search(r"function letterWarmup\(\)\{(.*?)\n\}", APP, re.S)
if not warm:
    bad.append("letterWarmup() is gone; PLAN_HOW says the letters row teaches")
else:
    body = warm.group(1)
    if "letterCard" not in body:
        bad.append("letterWarmup() no longer builds letterCard()s — the letters "
                   "row would be asking about letters it has not shown")
    elif body.index("letterCard") > body.index("alphaDrill"):
        bad.append("letterWarmup() builds alphaDrill() before letterCard() — "
                   "the questions would come before the teaching")

# ------------------------------------------------------------------ report
print("paradigm rounds gated by chapter: %d tables · %d column overrides · "
      "%d drills and %d plan rows accounted for"
      % (len(tabled), checked_cols, len(titles), len(ids)))
kinds = {}
for k, _ in list(DRILL_HOW.values()) + list(PLAN_HOW.values()):
    kinds[k] = kinds.get(k, 0) + 1
print("   " + " · ".join("%s %d" % (k, kinds[k]) for k in sorted(kinds)))
# The summary has to survive the fault it is reporting. Dropping a ch: made
# this line raise KeyError, so the run exited non-zero with the finding it had
# already made still unprinted — the right verdict for the wrong reason.
print("   chapters: " + ", ".join(
    "%s ch%s" % (p["t"][:22], p.get("ch", "?")) for p in sorted(
        tabled, key=lambda x: x.get("ch") or 0)[:6]) + ", …")

if no_ch:
    print("\nplayable tables with no chapter: %d" % len(no_ch))

print()
if bad:
    print("tasks that could serve untaught material: %d" % len(bad))
    for b in bad:
        print("   " + b)
    sys.exit(1)
print("tasks that could serve untaught material: 0")

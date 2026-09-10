# -*- coding: utf-8 -*-
"""Every "chapter N" in the lessons, pinned to the chapter it was written for.

    python tools/check_xref.py
    python tools/check_xref.py --emit     # print the table for pasting back

WHY IT EXISTS. The prose refers to other chapters by number ninety-one times:
"the pattern from chapter 18", "the secondary active endings from chapter 7",
"chapter 9 gave you the personal pronouns". A number is a position, and
positions move.

One already did. Chapter 20 was split into "Participles: the forms" and
"Participles: the three uses", so everything from 21 up shifted by one. The
prose was carried across correctly. CASEFN's chapter gates were not, and six
questions unlocked a chapter early for fifteen commits — the genitive
absolute offered after the chapter that teaches how to build a participle
rather than the one that teaches what it does. Nothing failed, because
nothing was looking. tools/check_drills.py now pins those gates by title;
this file does the same for the prose, which is four and a half times as
many numbers and is read rather than merely acted on.

WHAT IT CHECKS. Each (source chapter, target chapter) pair is recorded below
against the TITLE the target carried when the reference was read and judged,
and how many times that pair occurs. That fails four ways:

  * a renumber      — the pair now points at a chapter with a different title
  * a rename        — the recorded title is no longer any chapter's
  * a new pair      — a chapter refers somewhere it never referred before
  * a changed count — a reference added or removed inside an existing pair

The last is the loosest of the four and is deliberately kept: adding "as
chapter 12 said" to a chapter that already cites 12 is exactly where a wrong
number hides, because every other check passes. Re-reading one sentence is
the price.

WHAT IT CANNOT CHECK. Whether the reference is apt — whether chapter 12
really did say the thing being attributed to it. That is the "needs a reader"
row in CLAUDE.md. All ninety-one were read once, against the title of the
chapter each points at, before this table was written.

WHERE IT LOOKS. Chapter bodies AND quiz explanations, counted separately and
both reported, because a checker whose summary names a source it does not
read is the failure this repo has already shipped once.
"""
import collections, io, os, re, sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = io.open(os.path.join(ROOT, "data", "lessons.js"), encoding="utf-8").read()

TITLE = dict((int(a), b) for a, b in
             re.findall(r'^\{id:(\d+),t:"([^"]+)"', SRC, re.M))
if not TITLE:
    sys.exit("could not find any chapters in data/lessons.js")

# (source chapter, target chapter) -> (how many times, the target's title
# when the reference was read). Generated with --emit and reviewed by hand;
# regenerating accepts whatever is there, so it is the same bargain as
# check_frozen --accept and wants the same care.
XREF = {
    (1, 24): (1, 'The subjunctive mood'),
    (2, 12): (2, 'Present middle and passive indicative'),
    (2, 22): (2, 'Infinitives (verbal nouns)'),
    (2, 27): (1, 'Reading your Greek New Testament'),
    (3, 2): (1, 'The Greek verbal system'),
    (3, 12): (2, 'Present middle and passive indicative'),
    (3, 19): (1, 'Contract and liquid verbs'),
    (4, 1): (2, 'The letters and sounds of Greek'),
    (4, 5): (1, 'Nouns of the first declension'),
    (5, 3): (2, 'Present and future active indicative'),
    (5, 4): (2, 'Nouns of the second declension'),
    (5, 17): (2, 'Nouns of the third declension'),
    (7, 2): (1, 'The Greek verbal system'),
    (8, 5): (4, 'Nouns of the first declension'),
    (9, 6): (2, 'Adjectives of the first and second declension'),
    (9, 11): (1, 'Demonstrative pronouns'),
    (10, 7): (3, 'Imperfect and aorist active indicative'),
    (11, 6): (2, 'Adjectives of the first and second declension'),
    (11, 9): (1, 'Personal pronouns'),
    (12, 8): (1, 'Additional prepositions'),
    (13, 10): (1, 'Perfect and pluperfect active indicative'),
    (13, 12): (2, 'Present middle and passive indicative'),
    (13, 15): (2, 'Aorist and future passive indicative'),
    (14, 7): (1, 'Imperfect and aorist active indicative'),
    (14, 12): (4, 'Present middle and passive indicative'),
    (14, 15): (1, 'Aorist and future passive indicative'),
    (15, 3): (2, 'Present and future active indicative'),
    (15, 7): (3, 'Imperfect and aorist active indicative'),
    (15, 10): (2, 'Perfect and pluperfect active indicative'),
    (15, 12): (3, 'Present middle and passive indicative'),
    (16, 7): (1, 'Imperfect and aorist active indicative'),
    (16, 10): (2, 'Perfect and pluperfect active indicative'),
    (16, 13): (1, 'Perfect middle/passive and future middle'),
    (16, 15): (1, 'Aorist and future passive indicative'),
    (16, 19): (1, 'Contract and liquid verbs'),
    (17, 4): (1, 'Nouns of the second declension'),
    (18, 17): (2, 'Nouns of the third declension'),
    (18, 20): (1, 'Participles: the forms'),
    (18, 21): (1, 'Participles: the three uses'),
    (20, 7): (2, 'Imperfect and aorist active indicative'),
    (20, 10): (1, 'Perfect and pluperfect active indicative'),
    (20, 15): (2, 'Aorist and future passive indicative'),
    (20, 16): (2, 'Review of the indicative mood'),
    (20, 17): (1, 'Nouns of the third declension'),
    (20, 18): (1, 'Adjectives, pronouns, and numerals of the first and third declensions'),
    (21, 6): (4, 'Adjectives of the first and second declension'),
    (23, 9): (2, 'Personal pronouns'),
    (23, 11): (1, 'Demonstrative pronouns'),
    (6, 21): (1, 'Participles: the three uses'),
    (16, 20): (1, 'Participles: the forms'),
    (24, 3): (3, 'Present and future active indicative'),
    (24, 16): (2, 'Review of the indicative mood'),
    (26, 8): (2, 'Additional prepositions'),
    (26, 10): (3, 'Perfect and pluperfect active indicative'),
    (27, 4): (1, 'Nouns of the second declension'),
}


# ----------------------------------------------------------------- scan ----
# Chapter records start at column 0; quiz:[ divides prose from explanations
# inside each one, so a reference can be told apart by which half it is in.
marks = [(m.start(), int(m.group(1)))
         for m in re.finditer(r'^\{id:(\d+),t:', SRC, re.M)]
spans = [(marks[i][0],
          marks[i + 1][0] if i + 1 < len(marks) else len(SRC),
          marks[i][1]) for i in range(len(marks))]

found = collections.Counter()
where = collections.Counter()
contexts = collections.defaultdict(list)
bad = []

for start, end, cid in spans:
    chunk = SRC[start:end]
    q = chunk.find("quiz:[")
    for m in re.finditer(r"[Cc]hapter\s+(\d+)", chunk):
        n = int(m.group(1))
        half = "quiz" if q != -1 and m.start() > q else "body"
        found[(cid, n)] += 1
        where[half] += 1
        ctx = re.sub(r"<[^>]+>", "", re.sub(r"\s+", " ", chunk[
            max(0, m.start() - 60):m.end() + 40]))
        contexts[(cid, n)].append(ctx.strip())

print("cross-references: %d in %d pairs   (%d in chapter bodies, %d in quiz "
      "explanations)" % (sum(found.values()), len(found),
                         where["body"], where["quiz"]))

if "--emit" in sys.argv:
    print("\nXREF = {")
    for (a, b) in sorted(found):
        print("    (%d, %d): (%d, %r)," % (a, b, found[(a, b)], TITLE.get(b)))
    print("}")
    sys.exit(0)

# --------------------------------------------------------------- judge ----
for (a, b), n in sorted(found.items()):
    if b not in TITLE:
        bad.append("chapter %d refers to chapter %d, which does not exist"
                   % (a, b))
        continue
    if (a, b) not in XREF:
        bad.append("chapter %d refers to chapter %d (%r) and never did before"
                   " — read it and record it in XREF:\n        %s"
                   % (a, b, TITLE[b], "\n        ".join(contexts[(a, b)])))
        continue
    want_n, want_title = XREF[(a, b)]
    if want_title != TITLE[b]:
        bad.append("chapter %d refers to chapter %d, which is now %r; the "
                   "reference was written for %r. %s"
                   % (a, b, TITLE[b], want_title,
                      "A renumber has moved it."
                      if want_title in TITLE.values()
                      else "That chapter has been renamed — see below."))
    elif n != want_n:
        bad.append("chapter %d refers to chapter %d (%r) %d time%s, and did "
                   "%d — confirm the new one points where you meant:\n        %s"
                   % (a, b, TITLE[b], n, "" if n == 1 else "s", want_n,
                      "\n        ".join(contexts[(a, b)])))

for (a, b), (n, want_title) in sorted(XREF.items()):
    if (a, b) not in found:
        bad.append("XREF records chapter %d referring to chapter %d, and no "
                   "such reference is left in the prose" % (a, b))
    elif want_title not in TITLE.values():
        bad.append("XREF[(%d, %d)] names %r, which is not the title of any "
                   "chapter; a chapter has been renamed and the table has to "
                   "follow it" % (a, b, want_title))

print()
print("references that no longer point where they were written to: %d" % len(bad))
for b in bad:
    print("   " + b)
sys.exit(1 if bad else 0)

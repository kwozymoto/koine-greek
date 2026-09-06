# -*- coding: utf-8 -*-
"""The mark scheme for typed Greek, held to a table of worked cases.

    python tools/check_mark.py

gkMark in js/greek.js decides what to say when somebody types a Greek word at
the app. Six verdicts: correct, accent, breathing, other, close, wrong. This
file is the table of cases it must get right, and it fails if any of them
changes answer.

WHY A TABLE. The scheme has no external authority to appeal to — the corpus
can say whether a form is real but not whether "ἔλυσε for ἔλυσα" deserves
another go. So the only defence against it drifting is a list of decided
cases with the reasoning beside each, the way UNATTESTED and ABSOLUTE_OK work
elsewhere in this repo. Change the scheme and this file tells you exactly
which learners' answers you have changed your mind about.

WHY NOT A PERCENTAGE. The first design was "more than 60% right, flag the
letters; less, show the answer". Measured over every New Testament form
occurring five times or more, that rule does not survive:

  * one slip is worth 0.33 on a three-letter word and 0.92 on a twelve-letter
    compound, so a
    flat threshold lets a long word run to four wrong letters
  * the nearest DIFFERENT attested form is usually 0.80 to 0.90 similar, so
    at length five a one-slip attempt (0.80) is no closer than 61 of 63
    words' real neighbours

The two distributions overlap almost exactly, so no percentage separates a
slip from a different word. The scheme counts edits instead, and asks whether
the attempt matches another form on offer.

THE FOURTH PASS is the one that keeps the table honest: every target, and
every form offered as a distractor, must be a real word of the New Testament.
A mark scheme tested against invented Greek is testing nothing.
"""
import io, json, os, subprocess, sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from corpus import manifest, book, loose, bare                    # noqa: E402

VERDICTS = {"correct", "accent", "breathing", "other", "close", "wrong"}

# typed, target, others on offer, expected verdict, why
FIXTURES = [
    # Every form here occurs in the New Testament, and pass 4 says so. The
    # first table was built on λύω, whose paradigm the New Testament never
    # uses — the checker caught it, which is the whole point of pass 4.

    # ---- correct -------------------------------------------------------
    ("ἦλθεν", "ἦλθεν", [], "correct", "exact"),
    ("Ἦλθεν", "ἦλθεν", [], "correct", "capital at the start of a sentence is the same word"),
    ("τὸν", "τόν", [], "correct", "grave for acute — positional, not lexical"),

    # ---- accent: letters and breathings right, accent adrift ----------
    ("μενεῖ", "μένει", [], "accent",
     "the pair chapter 19 exists for. Same letters, and the accent is the "
     "whole difference — so a drill about accents can refuse this and one "
     "about endings can let it through. Both forms are real: μένει 28, μενεῖ 1"),
    ("λογός", "λόγος", [], "accent", "accent on the wrong syllable"),

    # ---- breathing: letters right, breathing wrong or missing ---------
    ("ελαβεν", "ἔλαβεν", [], "breathing", "typed with no diacritics at all"),
    ("εἰς", "εἷς", [], "breathing", "a different word, and the breathing is all that says so"),
    ("εἷς", "εἰς", [], "breathing", "and the same the other way round"),

    # ---- other: they wrote a different form that was on offer ---------
    ("ἐλάβομεν", "ἔλαβεν", ["ἐλάβομεν", "λαβών"], "other",
     "first plural for third singular. 'Close' would be a lie; the useful "
     "thing to say is which form they wrote"),
    ("λαβών", "ἔλαβεν", ["ἐλάβομεν", "λαβών"], "other", "the participle, offered in the same round"),
    ("ἐλάβομεν", "ἔλαβεν", [], "wrong",
     "the same typing with nothing else on offer: two edits on a six-letter "
     "target is over budget, which is why the budget is one down there"),

    # ---- close: inside the edit budget --------------------------------
    ("ἔλαβον", "ἔλαβεν", [], "close", "one letter wrong — a person ending"),
    ("λόγον", "λόγος", [], "close", "one letter wrong — a case ending"),
    ("ἐποίησαν", "ἐποίησεν", [], "close", "one letter wrong on an eight-letter word"),

    # ---- wrong: past the budget, or nothing ---------------------------
    ("φόβος", "ἦλθεν", [], "wrong", "a real word, and not the one asked for"),
    ("", "ἦλθεν", [], "wrong", "nothing typed"),
    ("   ", "ἦλθεν", [], "wrong", "whitespace only"),
    ("λόγος", "μένει", [], "wrong", "two real words with nothing to do with each other"),
    ("ἐλήλυθεν", "ἦλθεν", [], "wrong",
     "two tenses of the same verb, far enough apart that calling it close "
     "would tell the learner nothing true"),
]

# Forms that must be real: every target, and everything offered as a
# distractor. What the learner TYPES may be nonsense — that is the point.
def attested():
    man = manifest()
    seen = set()
    for b in man["books"]:
        for ch in book(b["a"])["c"]:
            for v in ch:
                for w in v[1]:
                    t = loose(bare(w[0]))
                    if t:
                        seen.add(t)
    return seen


# ------------------------------------------------------------- run JS ----
cases = [[t, g, o] for t, g, o, _, _ in FIXTURES]
cpath = os.path.join(os.environ.get("TEMP", "/tmp"), "mark_cases.json")
io.open(cpath, "w", encoding="utf-8").write(json.dumps(cases, ensure_ascii=False))
js = """
const fs=require('fs'), vm=require('vm');
const c=vm.createContext({});
vm.runInContext(fs.readFileSync(%s,'utf8'),c,{filename:'greek.js'});
c.__cases=JSON.parse(fs.readFileSync(%s,'utf8'));
process.stdout.write(JSON.stringify(vm.runInContext(
  '__cases.map(([t,g,o])=>gkMark(t,g,o))', c)));
""" % (json.dumps(os.path.join(ROOT, "js", "greek.js")), json.dumps(cpath))
r = subprocess.run(["node", "-e", js], capture_output=True, text=True, encoding="utf-8")
if r.returncode:
    sys.exit("could not run js/greek.js:\n" + r.stderr[:600])
got = json.loads(r.stdout)

bad = []
print("worked cases in the table: %d" % len(FIXTURES))

# 1. every case gives the verdict it is written down as giving
for (typed, target, others, want, why), m in zip(FIXTURES, got):
    if m["verdict"] != want:
        bad.append("%r against %r: table says %s, gkMark says %s\n        (%s)"
                   % (typed or "(nothing)", target, want, m["verdict"], why))
print("cases whose verdict changed: %d" % len(bad))

# 2. every verdict the scheme can give is exercised at least once
covered = {f[3] for f in FIXTURES}
missing = VERDICTS - covered
if missing:
    bad.append("no worked case produces: %s" % ", ".join(sorted(missing)))
unknown = covered - VERDICTS
if unknown:
    bad.append("the table expects verdicts gkMark cannot give: %s" % ", ".join(sorted(unknown)))
print("verdicts exercised: %d of %d" % (len(covered & VERDICTS), len(VERDICTS)))

# 3. the diff points at real positions inside what was typed
for (typed, target, others, want, why), m in zip(FIXTURES, got):
    for i in m.get("wrong", []):
        if not (0 <= i < len(typed.strip())):
            bad.append("%r against %r: flags position %d, which is not in it"
                       % (typed, target, i))
print("letter positions flagged outside the typing: %d"
      % sum(1 for b in bad if "not in it" in b))

# 4. targets and distractors are real Greek
real = attested()
unreal = []
for typed, target, others, want, why in FIXTURES:
    for form, role in [(target, "target")] + [(o, "distractor") for o in others]:
        k = loose(bare(form))
        if k and k not in real:
            unreal.append("%s %r occurs nowhere in the New Testament" % (role, form))
bad += unreal
print("targets or distractors that are not real: %d" % len(unreal))

print("\nfaults: %d" % len(bad))
for b in bad:
    print("   " + b)
sys.exit(1 if bad else 0)

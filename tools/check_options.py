# -*- coding: utf-8 -*-
"""Quiz options: can more than one of them be defended?

    python tools/check_options.py

check_lessons checks a quiz's Greek and that every headed part has a question.
check_quiz reads what the questions SAY — the stem, the explanation and the
keyed option — against the chapter body. Neither looks at the four options as
a SET, and that is where a different kind of fault lives: a question can be
perfectly true, well explained and keyed correctly, and still be unanswerable
because two of its options mean the same thing.

That fault marks a student wrong for knowing the chapter, which is the worst
thing this app can do — the same class as the two mis-keyed questions an
outside audit found.

WHAT IS MECHANICALLY DECIDABLE. Not "are these two options both defensible" —
that needs a reader. But these are decidable and each is a real defect:

  1. Two options identical, or identical once case, punctuation and spacing
     are normalised. Whatever the key is, a student can point at the other
     one and be equally right.
  2. The same stem asked in two chapters with DIFFERENT keyed answers. One of
     the two is wrong, and no single-chapter check can see it.

A THIRD RULE WAS WRITTEN AND DELETED, which is worth recording. It folded
away a leading article, so that "the aorist" and "aorist" would collide. Its
one and only finding was ch6 q7:

    ὁ ἄνθρωπος ἀγαθός means:
      >> The man is good        The good man
         A good man             The man, the good one

Those four are four different Greek constructions — predicate, attributive,
anarthrous, second attributive — and the presence or absence of the article
is the entire subject of chapter 6. In an English quiz "the good man" and "a
good man" are near-duplicates; in this one they are the distinction being
taught. The same objection sinks stripping a leading "to": "to loose" against
"loosing" is infinitive against participle.

So the rule was not tuned, it was removed. In a Greek grammar the small words
at the front of a gloss are the content.

WHAT IT DELIBERATELY DOES NOT DO. It does not compare an option against the
correct answer for semantic overlap. "Purpose" and "in order to" would fail
any similarity test and are the same answer, while "the genitive" and "the
dative" are one letter apart and could not be more different. A similarity
threshold over English is the kind of check that reports confidently and
means nothing — the session that built the typed-answer grader established
that at length for Greek, and English is worse.

Duplicate stems with the SAME key are reported, not failed: asking the same
thing twice in different chapters is repetition, which is sometimes the point.
"""
import collections
import io
import json
import os
import re
import subprocess
import sys
import unicodedata

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load_lessons():
    """Evaluate data/lessons.js in node and hand back JSON, rather than
       parsing quiz objects out of the source with a regex. The bodies are
       template literals full of quotes and HTML; a regex over them is how
       you get a checker that quietly reads half the file."""
    # The stringify has to happen INSIDE the same eval. `const LESSONS` is
    # scoped to the eval that declares it, so evaluating the file and then
    # naming LESSONS from outside gives "LESSONS is not defined".
    js = ("const fs=require('fs');"
          "process.stdout.write(eval(fs.readFileSync(%s,'utf8')"
          "+';JSON.stringify(LESSONS)'));"
          % json.dumps(os.path.join(ROOT, "data", "lessons.js")))
    out = subprocess.run(["node", "-e", js], capture_output=True, text=True,
                         encoding="utf-8")
    if out.returncode:
        sys.exit("could not evaluate data/lessons.js:\n" + (out.stderr or ""))
    return json.loads(out.stdout)


def norm(s):
    """Case, punctuation, accents and spacing folded away."""
    s = unicodedata.normalize("NFKC", s or "").lower()
    s = re.sub(r"<[^>]+>", " ", s)
    s = re.sub(r"[‘’']", "'", s)
    s = re.sub(r"[^\wͰ-Ͽἀ-῿' ]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()


LESSONS = load_lessons()
bad, note = [], []
nq = nopt = 0
stems = collections.defaultdict(list)

for l in LESSONS:
    for qi, q in enumerate(l.get("quiz") or []):
        opts = q.get("o") or []
        nq += 1
        nopt += len(opts)
        tag = "ch%d q%d" % (l["id"], qi + 1)

        seen = {}
        for i, o in enumerate(opts):
            k = norm(o)
            if k in seen:
                bad.append("%s offers the same option twice — %r and %r"
                           % (tag, opts[seen[k]], o))
            seen[k] = i

        a = q.get("a")
        if isinstance(a, int) and 0 <= a < len(opts):
            stems[norm(q.get("q"))].append((l["id"], qi + 1, norm(opts[a])))

for stem, uses in sorted(stems.items()):
    if len(uses) < 2 or not stem:
        continue
    keys = {u[2] for u in uses}
    where = ", ".join("ch%d q%d" % (c, n) for c, n, _ in uses)
    if len(keys) > 1:
        bad.append("the same question is asked in %s and keyed differently: %s"
                   % (where, " / ".join(sorted(repr(k) for k in keys))))
    else:
        note.append("%s ask the same question with the same answer" % where)

print("quiz questions: %d   options: %d   distinct stems: %d"
      % (nq, nopt, len(stems)))
print()
print("questions with more than one defensible option: %d" % len(bad))
for b in bad:
    print("   " + b)
if note:
    print()
    print("repeated questions, same answer — repetition, not a fault: %d" % len(note))
    for n in note:
        print("   " + n)
sys.exit(1 if bad else 0)

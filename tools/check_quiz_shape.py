# -*- coding: utf-8 -*-
"""Lesson and syntax questions: is the answer visible in the SHAPE of the options?

    python tools/check_quiz_shape.py
    python tools/check_quiz_shape.py --emit    # print today's allow-lists

WHY IT EXISTS. Four testers answering at random found the right answer was
"almost always the longest option". Measured on 2026-09-28 it was: in 200 of
the 279 lesson questions the answer was the one longest option, and of the 82
questions whose options carry a gloss after a dash ("Accompaniment — with the
disciples"), 75 carried it on the answer alone. check_distractors holds the
vocabulary drills to this, because their options are drawn at run time;
nothing held the written questions.

WHAT IT CHECKS, for LESSONS[].quiz and CASEFN:
  1. Per chapter, how often the answer is the single longest option. Four
     options of honest lengths make that about one time in four; more than
     LIMIT is a tell somebody can learn.
  2. Per question, a dash gloss on the answer and on no other option.

Both are allow-listed as they stood when this was written, so it passes on
the questions as they are and fails on anything new: a chapter that gets
worse than its allowance, or a question that joins the dash list. Rewriting
a chapter's options brings its count down; lower its allowance to match
(--emit prints the current figures), and remove it once under LIMIT.

WHAT IT CANNOT DO. Length and the dash are the tells it was told about. A
wrong option can be shorter and still absurd, which check_options and a
reader catch; this only asks whether the answer can be picked out unread.
"""
import io, json, os, re, subprocess, sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

LIMIT = 0.40        # share of a chapter's questions whose answer is the one longest option

# Chapter -> questions whose answer is the single longest option, as it stood.
LONGEST_ALLOW = {
    "ch2": 6,     # of 10
    "ch4": 8,     # of 12
    "ch5": 5,     # of 9
    "ch6": 5,     # of 7
    "ch7": 9,     # of 12
    "ch8": 7,     # of 12
    "ch9": 7,     # of 11
    "ch10": 8,     # of 12
    "ch11": 10,     # of 11
    "ch12": 8,     # of 12
    "ch13": 8,     # of 11
    "ch14": 9,     # of 11
    "ch15": 10,     # of 12
    "ch16": 7,     # of 10
    "ch17": 5,     # of 9
    "ch18": 8,     # of 9
    "ch19": 9,     # of 10
    "ch20": 8,     # of 11
    "ch21": 10,     # of 11
    "ch22": 4,     # of 8
    "ch24": 7,     # of 11
    "ch25": 7,     # of 10
    "ch27": 10,     # of 11
    "CASEFN": 18,     # of 20
}
# Questions whose answer alone carries a dash gloss, as they stood.
DASH_ALLOW = set([
    "L3q9",
    "L4q1",
    "L4q3",
    "L4q8",
    "L5q3",
    "L5q6",
    "L5q8",
    "L6q5",
    "L7q0",
    "L7q1",
    "L7q8",
    "L7q11",
    "L8q2",
    "L8q6",
    "L8q10",
    "L9q1",
    "L9q3",
    "L10q10",
    "L11q2",
    "L11q3",
    "L11q4",
    "L11q5",
    "L11q6",
    "L11q9",
    "L12q1",
    "L12q5",
    "L13q1",
    "L13q3",
    "L13q4",
    "L13q6",
    "L13q7",
    "L14q1",
    "L14q3",
    "L14q5",
    "L14q10",
    "L15q0",
    "L15q4",
    "L15q6",
    "L15q9",
    "L15q10",
    "L16q0",
    "L16q9",
    "L17q0",
    "L17q6",
    "L18q3",
    "L18q6",
    "L19q1",
    "L19q4",
    "L19q7",
    "L20q0",
    "L20q6",
    "L20q8",
    "L20q10",
    "L21q1",
    "L21q4",
    "L21q5",
    "L21q6",
    "L21q7",
    "L21q9",
    "L22q4",
    "L24q0",
    "L24q2",
    "L24q7",
    "L25q1",
    "L25q3",
    "L25q6",
    "L25q9",
    "L27q4",
    "L27q7",
    "L27q9",
    "C1",
    "C3",
    "C5",
    "C6",
    "C7",
    "C8",
    "C9",
    "C15",
    "C16",
    "C18",
    "C19",
])


def load():
    js = """
      const fs = require('fs'), vm = require('vm');
      const c = vm.createContext({});
      vm.runInContext(fs.readFileSync('data/lessons.js', 'utf8') + ';this.L = LESSONS;', c);
      const app = fs.readFileSync('js/app.js', 'utf8');
      const a = app.indexOf('const CASEFN=['), b = app.indexOf('\\n];', a);
      vm.runInContext(app.slice(a, b + 3).replace('const CASEFN', 'this.CASEFN'), c);
      const out = [];
      for (const l of c.L) (l.quiz || []).forEach((q, n) =>
        out.push({key: 'L' + l.id + 'q' + n, ch: 'ch' + l.id, o: q.o, a: q.a}));
      c.CASEFN.forEach((r, n) => out.push({key: 'C' + n, ch: 'CASEFN', o: r[1], a: r[2]}));
      process.stdout.write(JSON.stringify(out));
    """
    r = subprocess.run(["node", "-e", js], capture_output=True, text=True, encoding="utf-8", cwd=ROOT)
    if r.returncode != 0:
        sys.exit("could not load the questions:\n" + r.stderr)
    return json.loads(r.stdout)


def main():
    qs = load()
    strip = lambda s: re.sub(r"<[^>]+>", "", str(s))
    per, longest, dash = {}, {}, []
    for q in qs:
        lens = [len(strip(o)) for o in q["o"]]
        per[q["ch"]] = per.get(q["ch"], 0) + 1
        if lens[q["a"]] == max(lens) and lens.count(max(lens)) == 1:
            longest[q["ch"]] = longest.get(q["ch"], 0) + 1
        glossed = [" — " in strip(o) for o in q["o"]]
        if glossed[q["a"]] and sum(glossed) == 1:
            dash.append(q["key"])

    if "--emit" in sys.argv:
        print("LONGEST_ALLOW = {")
        for ch in per:
            n = longest.get(ch, 0)
            if n / per[ch] > LIMIT:
                print('    "%s": %d,     # of %d' % (ch, n, per[ch]))
        print("}")
        print("DASH_ALLOW = set([")
        for k in dash:
            print('    "%s",' % k)
        print("])")
        return

    bad, loose = [], []
    for ch in per:
        n, allow = longest.get(ch, 0), LONGEST_ALLOW.get(ch)
        if n / per[ch] > LIMIT:
            if allow is None:
                bad.append("%s: the answer is the one longest option in %d of %d questions "
                           "(over %d%%), and it has no allowance" % (ch, n, per[ch], LIMIT * 100))
            elif n > allow:
                bad.append("%s: the answer is the one longest option in %d of %d questions; "
                           "its allowance is %d" % (ch, n, per[ch], allow))
            elif n < allow:
                loose.append("%s: now %d, allowance %d — lower it" % (ch, n, allow))
        elif allow is not None:
            loose.append("%s: now %d of %d, under the limit — remove its allowance" % (ch, n, per[ch]))
    for k in dash:
        if k not in DASH_ALLOW:
            bad.append("%s: only the answer carries a dash gloss" % k)
    gone = sorted(DASH_ALLOW - set(dash))

    total = sum(per.values())
    print("questions measured: %d; answer the one longest option: %d (%.0f%%); "
          "dash gloss on the answer alone: %d"
          % (total, sum(longest.values()), 100 * sum(longest.values()) / total, len(dash)))
    print("allowances left: %d chapters over %d%%, %d dash questions"
          % (len(LONGEST_ALLOW), LIMIT * 100, len(DASH_ALLOW)))
    for l in loose:
        print("   tighten: " + l)
    for k in gone:
        print("   tighten: %s no longer has the dash tell — remove it from DASH_ALLOW" % k)
    if bad:
        print("\nTHE SHAPE OF A QUESTION'S OPTIONS GIVES ITS ANSWER AWAY: %d" % len(bad))
        for b in bad:
            print("   " + b)
        sys.exit(1)


if __name__ == "__main__":
    main()

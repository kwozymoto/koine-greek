# -*- coding: utf-8 -*-
"""The vocabulary drills: is the answer visible in the SHAPE of the options?

    python tools/check_distractors.py

WHY THIS EXISTS. Fraser was shown μετά with four glosses under it:

    with (+gen); after (+acc)        <- the answer
    but, rather
    I have, hold
    he, she, it; self; same

Only one option carries a case in brackets, and every preposition in the deck
carries one. So the question could be answered without reading the Greek, and
measured over the deck it could be answered that way 89% of the time. The same
fault, larger, sits under the verbs: 286 of the 818 glosses open with "I ", so
a verb set against three non-verbs was free 30% of the time.

check_options asks whether two of a LESSON quiz's four options can both be
defended. It reads them off disk, because a lesson quiz is written down. These
options are chosen at run time, so nothing could look at them at all.

WHAT IT DOES. It lifts wrongOptions() out of js/app.js -- the real function,
between sentinels, never a copy, because a second implementation in Python
would drift from the one that ships -- and runs it against the real deck a few
thousand times. For each tell it asks: how often is the answer the ONLY option
that has it?

WHAT IT CANNOT DO. It knows the two tells named below and no others. A gloss
written in some new shape -- a bracketed note that is not a case, a lone
capital, a semicolon nobody else uses -- would be just as free and this would
not see it. That is the standing limitation of a checker that has to be told
what to look for, and it is why TELLS is a list somebody must add to.
"""
import io, json, os, re, subprocess, sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

OPEN = "/* ---- distractor choice — lifted by tools/check_distractors.py ---- */"
SHUT = "/* ---- end distractor choice ---- */"

# Each tell is a shape a reader can see without knowing any Greek. The rate is
# how often the answer may be the only option carrying it -- 2% leaves room
# for the deck to grow without this going off, and nothing reaches it today.
TELLS = {
    "a case in brackets, as every preposition has":
        (r"\(\+[^)]*\)", 0.02),
    "a gloss opening “I ”, as a verb's does":
        (r"^I ", 0.02),
}
RUNS = 4000


def lift():
    """The shipping function itself, or nothing. Never a re-implementation."""
    src = io.open(os.path.join(ROOT, "js", "app.js"), encoding="utf-8").read()
    if OPEN not in src or SHUT not in src:
        sys.exit("could not find the distractor-choice sentinels in js/app.js.\n"
                 "They are the only thing tying this checker to the code it\n"
                 "checks; if they were renamed, rename them here too rather\n"
                 "than letting this quietly test nothing.")
    body = src.split(OPEN, 1)[1].split(SHUT, 1)[0]
    if "function wrongOptions" not in body:
        sys.exit("the lifted block no longer defines wrongOptions()")
    return body


def main():
    body = lift()
    js = """
      const fs = require('fs'), vm = require('vm');
      const c = vm.createContext({});
      vm.runInContext(fs.readFileSync('data/vocab.js', 'utf8'), c);
      const V = vm.runInContext('VOCAB', c);
      const RETIRED = new Set(vm.runInContext(
        'typeof RETIRED !== "undefined" ? [...RETIRED] : [237]', c));
      %s
      const LEARN = V.map((_, i) => i).filter(i => !RETIRED.has(i))
                     .sort((a, b) => V[b][2] - V[a][2]);
      const TELLS = %s, RUNS = %d;
      const banks = { 'every word met': LEARN, 'the first forty': LEARN.slice(0, 40) };
      const out = [];
      for (const [bname, idx] of Object.entries(banks)) {
        const bank = idx.map(i => [V[i][0].split(',')[0], V[i][1], V[i][3]]);
        for (const [tname, pat] of Object.entries(TELLS)) {
          const re = new RegExp(pat);
          const marked = bank.filter(r => re.test(r[1]));
          if (!marked.length) { out.push({bank: bname, tell: tname, n: 0, rate: 0}); continue; }
          let alone = 0;
          for (let t = 0; t < RUNS; t++) {
            const p = marked[Math.floor(Math.random() * marked.length)];
            if (!wrongOptions(p, bank, 3).some(x => re.test(x[1]))) alone++;
          }
          out.push({bank: bname, tell: tname, n: marked.length, rate: alone / RUNS});
        }
      }
      process.stdout.write(JSON.stringify(out));
    """ % (body,
           json.dumps({k: v[0] for k, v in TELLS.items()}),
           RUNS)
    r = subprocess.run(["node", "-e", js], capture_output=True, text=True,
                       encoding="utf-8", cwd=ROOT)
    if r.returncode != 0:
        sys.exit("node could not run the lifted chooser:\n" + (r.stderr or "").strip())
    rows = json.loads(r.stdout)

    bad = []
    print("options drawn per question:       3 of %d runs each" % RUNS)
    for row in rows:
        limit = TELLS[row["tell"]][1]
        flag = "" if row["rate"] <= limit else "   <-- OVER"
        print("  %-22s %-46s %4d words  %5.1f%%%s"
              % (row["bank"], row["tell"], row["n"], 100 * row["rate"], flag))
        if row["rate"] > limit:
            bad.append("%s: with %s as the bank, the answer is the only option "
                       "with %s %.1f%% of the time (allowed %.1f%%)"
                       % (row["tell"], row["bank"], row["tell"],
                          100 * row["rate"], 100 * limit))
    if bad:
        print("\nTHE SHAPE OF THE OPTIONS GIVES THE ANSWER AWAY: %d" % len(bad))
        for b in bad:
            print("   " + b)
        print("\n   wrongOptions() in js/app.js prefers distractors that agree\n"
              "   with the answer about this. Either the deck has grown a kind\n"
              "   of gloss it cannot pair up, or the preference was changed.")
        sys.exit(1)
    print("\nno drill hands the answer to a reader who knows no Greek")


if __name__ == "__main__":
    main()

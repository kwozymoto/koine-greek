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

introduce() is held to it too, and differently: it builds its own bank and
its own mcq, so the whole function is lifted -- from its declaration to the
closing brace in column 0 -- and run with the session stubbed out, and the
options it actually hands to mcq() are the ones measured. It drew uniformly
from the deck long after wrongOptions existed, which put a verb's gloss among three non-verbs on the very first
question a learner meets on a word.

reverseVocab() is lifted and run the same way. Its options are Greek, so its
tells are the Greek's -- a verb's ending, a name's capital -- and as it was
written, asked for a name, the one capitalised headword was the answer 84% of
the time. Measuring it turned up the capital in the English too: "Paul" set
against three lowercase nouns. So a capital is now a tell in both directions.

WHAT IT CANNOT DO. It knows the tells named below and no others. A gloss
written in some new shape -- a bracketed note that is not a case, a
semicolon nobody else uses -- would be just as free and this would
not see it. That is the standing limitation of a checker that has to be told
what to look for, and it is why TELLS and GREEK_TELLS are lists somebody
must add to.
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
    "a gloss opening with a capital, as a name's does":
        (r"^(?!I )\p{Lu}", 0.02),
}
# reverseVocab asks for the Greek, so its tells are on the Greek headword, read
# with the accents and breathings taken off. The third field, when there is
# one, limits the answers measured to one part of speech. A verb's ending is a
# tell on a verb: asked for "I loose", the one headword in -ω is the answer.
# ἐγώ, ἔξω and ὀπίσω end the same way and it tells nothing -- asked for
# "outside", nobody reaches for the option shaped like a verb.
GREEK_TELLS = {
    "a headword with a capital, as a name has":
        (r"^\p{Lu}", 0.02, None),
    "a verb's headword in -ω, -μι or -μαι":
        (r"(ω|μι|μαι)$", 0.02, "verb"),
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


INTRO = "function introduce(fresh,emptyMsg){"
REVERSE = "function reverseVocab(){"


def lift_function(sig):
    """A function as it ships, from its declaration to its closing brace."""
    src = io.open(os.path.join(ROOT, "js", "app.js"), encoding="utf-8").read()
    if src.count(sig) != 1:
        sys.exit("could not find exactly one `%s` in js/app.js.\n"
                 "If its signature changed, change it here rather than\n"
                 "letting its questions go unchecked." % sig)
    tail = src.split(sig, 1)[1]
    if "\n}\n" not in tail:
        sys.exit("`%s` has no closing brace in column 0" % sig)
    return sig + tail.split("\n}\n", 1)[0] + "\n}\n"


def lift_retired():
    """RETIRED lives in js/app.js, not data/vocab.js. This used to fall back
    to a literal [237] whenever vocab.js did not define it -- which was
    always -- so read the real one, and stop if it cannot be read."""
    src = io.open(os.path.join(ROOT, "js", "app.js"), encoding="utf-8").read()
    m = re.findall(r"^const RETIRED=new Set\(\[([\d,\s]*)\]\);", src, re.M)
    if len(m) != 1:
        sys.exit("could not read `const RETIRED=new Set([...]);` in js/app.js")
    return [int(x) for x in m[0].split(",") if x.strip()]


def main():
    body = lift()
    intro = lift_function(INTRO)
    reverse = lift_function(REVERSE)
    js = """
      const fs = require('fs'), vm = require('vm');
      const c = vm.createContext({});
      vm.runInContext(fs.readFileSync('data/vocab.js', 'utf8'), c);
      const V = vm.runInContext('VOCAB', c);
      const RETIRED = new Set(%s);
      %s
      const LEARN = V.map((_, i) => i).filter(i => !RETIRED.has(i))
                     .sort((a, b) => V[b][2] - V[a][2]);
      const TELLS = %s, RUNS = %d;
      const banks = { 'every word met': LEARN, 'the first forty': LEARN.slice(0, 40) };
      const out = [], broken = [];
      for (const [bname, idx] of Object.entries(banks)) {
        const bank = idx.map(i => [V[i][0].split(',')[0], V[i][1], V[i][3]]);
        for (const [tname, pat] of Object.entries(TELLS)) {
          const re = new RegExp(pat, 'u');
          const marked = bank.filter(r => re.test(r[1]));
          if (!marked.length) { out.push({bank: bname, tell: tname, n: 0, rate: 0}); continue; }
          let alone = 0;
          for (let t = 0; t < RUNS; t++) {
            const p = marked[Math.floor(Math.random() * marked.length)];
            const w = wrongOptions(p, bank, 3);
            if (w.length !== 3 || new Set([p[1], ...w.map(x => x[1])]).size !== 4) {
              if (broken.length < 5) broken.push(p[0] + ': ' + JSON.stringify(w.map(x => x[1])));
              continue;
            }
            if (!w.some(x => re.test(x[1]))) alone++;
          }
          out.push({bank: bname, tell: tname, n: marked.length, rate: alone / RUNS});
        }
      }

      /* introduce() itself, run for real. Only what it calls is stubbed, and
         mcq() records the options it was handed. VOCAB and RETIRED are the
         shipping ones, so the bank it builds is the bank it ships with. */
      const asked = [];
      const VOCAB = V, toast = () => {}, flashcard = () => null,
            save = () => {}, startSession = () => {},
            mcq = (q, opts, a) => { asked.push({q, opts, a}); return null; };
      %s
      for (const [tname, pat] of Object.entries(TELLS)) {
        const re = new RegExp(pat, 'u');
        const marked = LEARN.filter(i => re.test(V[i][1]));
        let alone = 0;
        for (let t = 0; t < RUNS; t++) {
          const i = marked[Math.floor(Math.random() * marked.length)];
          asked.length = 0;
          introduce([i], '');
          const m = asked[0];
          if (asked.length !== 1 || !m || m.opts.length !== 4
              || m.opts[m.a] !== V[i][1] || new Set(m.opts).size !== 4) {
            if (broken.length < 5) broken.push(V[i][0] + ': ' + JSON.stringify(m));
            continue;
          }
          if (!m.opts.filter((_, k) => k !== m.a).some(x => re.test(x))) alone++;
        }
        out.push({bank: 'introduce(), new words', tell: tname,
                  n: marked.length, rate: alone / RUNS});
      }

      /* reverseVocab() the same way. It asks about the words S.cards has
         started, so each run starts twelve words that carry the tell and
         measures all twelve questions. The options are Greek in a span, and
         each is looked up by its headword: it must be a word of the deck,
         and no wrong one may mean what was asked for. */
      const S = {cards: {}};
      %s
      const GREEK_TELLS = %s;
      const strip = h => h.normalize('NFD').replace(/\p{M}/gu, '');
      const untag = o => o.replace(/<[^>]*>/g, '');
      const HEAD = new Map(LEARN.map(i => [V[i][0].split(',')[0], i]));
      for (const [tname, [pat, pos]] of Object.entries(GREEK_TELLS)) {
        const re = new RegExp(pat, 'u');
        const marked = LEARN.filter(i => re.test(strip(V[i][0].split(',')[0]))
                                         && (!pos || V[i][3] === pos));
        let alone = 0, n = 0;
        for (let t = 0; t < RUNS / 12; t++) {
          S.cards = {};
          while (Object.keys(S.cards).length < 12)
            S.cards[marked[Math.floor(Math.random() * marked.length)]] = 1;
          asked.length = 0;
          reverseVocab();
          for (const m of asked) {
            const opts = m.opts.map(untag);
            const gloss = (m.q.match(/<b>(.*)<\/b>/) || [])[1];
            const right = HEAD.get(opts[m.a]);
            const wrong = opts.filter((_, k) => k !== m.a);
            if (opts.length !== 4 || new Set(opts).size !== 4
                || right === undefined || V[right][1] !== gloss
                || wrong.some(h => !HEAD.has(h) || V[HEAD.get(h)][1] === gloss)) {
              if (broken.length < 5) broken.push(gloss + ': ' + JSON.stringify(opts));
              continue;
            }
            n++;
            if (!wrong.some(h => re.test(strip(h)))) alone++;
          }
        }
        out.push({bank: 'reverseVocab(), English → Greek', tell: tname,
                  n: marked.length, rate: n ? alone / n : 1});
      }
      /* The words that share a gloss, asked about alone. Among every verb
         the twin of "I kill" comes up too seldom for the pass above to meet
         it; here each question has a twin in the bank to wrongly offer. */
      const byGloss = {};
      LEARN.forEach(i => (byGloss[V[i][1]] = byGloss[V[i][1]] || []).push(i));
      const twins = Object.values(byGloss).filter(l => l.length > 1).flat();
      for (let t = 0; t < RUNS / 12; t++) {
        S.cards = {};
        while (Object.keys(S.cards).length < Math.min(12, twins.length))
          S.cards[twins[Math.floor(Math.random() * twins.length)]] = 1;
        asked.length = 0;
        reverseVocab();
        for (const m of asked) {
          const opts = m.opts.map(untag);
          const gloss = (m.q.match(/<b>(.*)<\/b>/) || [])[1];
          const same = opts.filter((h, k) => k !== m.a && HEAD.has(h)
                                              && V[HEAD.get(h)][1] === gloss);
          if (same.length && broken.length < 5)
            broken.push(gloss + ': ' + opts[m.a] + ' asked, ' + same[0] + ' offered as wrong');
        }
      }
      process.stdout.write(JSON.stringify({rows: out, broken}));
    """ % (json.dumps(lift_retired()), body,
           json.dumps({k: v[0] for k, v in TELLS.items()}),
           RUNS, intro, reverse,
           json.dumps({k: [v[0], v[2]] for k, v in GREEK_TELLS.items()}))
    r = subprocess.run(["node", "-e", js], capture_output=True, text=True,
                       encoding="utf-8", cwd=ROOT)
    if r.returncode != 0:
        sys.exit("node could not run the lifted chooser:\n" + (r.stderr or "").strip())
    res = json.loads(r.stdout)
    rows = res["rows"]

    bad = []
    if res["broken"]:
        bad.append("a question whose options are not four different words, "
                   "one right and three wrong, e.g. "
                   + "; ".join(res["broken"]))
    print("options drawn per question:       3 of %d runs each" % RUNS)
    limits = dict(TELLS, **GREEK_TELLS)
    for row in rows:
        limit = limits[row["tell"]][1]
        flag = "" if row["rate"] <= limit else "   <-- OVER"
        print("  %-31s %-48s %4d words  %5.1f%%%s"
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
              "   of gloss it cannot pair up, or the preference was changed --\n"
              "   or, for introduce(), it has stopped calling wrongOptions().")
        sys.exit(1)
    print("\nno drill hands the answer to a reader who knows no Greek")


if __name__ == "__main__":
    main()

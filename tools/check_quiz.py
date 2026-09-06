# -*- coding: utf-8 -*-
"""The quizzes, held to the chapters they belong to.

    python tools/check_quiz.py

check_lessons already checks that a quiz's Greek is spelled like the corpus and
that every headed part has a question. It does not read what the questions
SAY. This does, in the three ways that turned out to be mechanical.

WHY IT EXISTS. Every one of these is a fault this repo has actually shipped:

  * A chapter corrected in the prose and left standing in the quiz. It has
    happened five times. "the whole force of the prayer" survived in a keyed
    OPTION after being softened in two bodies; ἐγινόμην and ἠρχόμην reached
    v58 the same way, after the guard against exactly that was written.
  * A number in a quiz that disagrees with the number in the body. δίδωσιν was
    given as 11 in one section and 10 two sections later. ch10's quiz claimed
    "47 of the 88" against a body saying thirty-four and fourteen; the body was
    right about 88 and wrong about the ἵστημι share, and 47 was wrong twice
    over. check_claims does not reach these: it re-derives "X occurs N times"
    for a WORD, and a share, a sum or a percentage has no token to count.
  * An explanation that argues for an option other than the keyed one. Two
    questions marked a student wrong for knowing the chapter.

WHAT IS TREATED AS ASSERTED. The question stem, the explanation, and the KEYED
option — never a distractor. A distractor is wrong on purpose: one that says
"always" or gives a false number is doing its job, and checking it would be
checking that the wrong answers are wrong.

THE ALLOW-LISTS ARE THE POINT. All three passes report things that are usually
innocent — an explanation naming the near-miss it is warning against, a
percentage the body states the other way round. A report nobody can fail is a
report nobody reads, so each of the three carries a list with a reason beside
every entry, and anything not on its list fails. Writing the reason is the
work: it is what turned "47 of the 88" into a recount, and the recount into 48.

Entries are keyed by (chapter, question index, item). A question inserted
mid-chapter shifts the indexes after it, which shows up here as stale entries
listed alongside new unlisted ones — the stale list is reported, the new ones
fail.
"""
import io, json, os, re, subprocess, sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))

GK = "Ͱ-Ͽἀ-῿"


# --------------------------------------------------------------------------
# Pass A. The explanation names a Greek form that belongs to exactly one
# option, that option is not the key, and no form of the key's own appears.
#
# Usually benign: a good explanation contrasts the answer with the near-miss.
# It is listed anyway, because a mis-keyed question looks identical.
# --------------------------------------------------------------------------
KEYED = {
    (7, 11, "ἦν"):
        "the paradigm ἤμην, ἦς, ἦν ... is quoted to show ἦν IS the imperfect, "
        "which is why option 0 offering it as the aorist is wrong",
    (8, 11, "διά"):
        "διά is listed among the prepositions that DO elide; the key is the "
        "two that do not",
    (12, 10, "διά"):
        "ὑπό and διά are named to separate direct agent and intermediate "
        "agent from the key, which is impersonal means",
    (12, 10, "ὑπό"):
        "the other half of the same contrast",
    (17, 1, "ος"):
        "a different -ος: the explanation means the genitive singular, "
        "option 2 offers the nominative singular",
    (26, 0, "δίδωμι"):
        "δίδωμι heads the list of four families; option 3 says δίδωμι is the "
        "only -μι verb, which the same sentence refutes",
}

# --------------------------------------------------------------------------
# Pass B. An absolute asserted in a quiz that the chapter body never makes.
#
# This is the shape of the overclaims that have needed retracting: "nothing
# else in Greek ends in -σι(ν)" was false — every third person plural verb
# does — and "-μενος is always a participle" was 444 of 446.
# --------------------------------------------------------------------------
ABSOLUTES = ["always", "never", "nothing else", "no other", "cannot",
             "invariably", "without exception", "every time", "in every case",
             "whole force", "the only", "any other", "none of them"]

ABSOLUTE_OK = {
    (11, 9, "never"):
        "αὐταί really does not occur: 0 in the corpus, against αὗται 3, "
        "αὕτη 72 and αὐτή 10. Verified, not asserted",
    (13, 6, "any other"):
        "'worth more than any other single paradigm in this chapter' is a "
        "judgement about what to study, not a claim about Greek",
    (15, 7, "cannot"):
        "an English translation using active verbs cannot show a passive "
        "subject — a statement about English",
    (16, 2, "cannot"):
        "'the commonest reason a reader cannot find a verb in the lexicon' "
        "is about looking words up",
    (16, 3, "nothing else"):
        "'what is left when nothing else is there' restates the chapter's "
        "own decision procedure; it is not a claim about endings",
    (17, 1, "no other"):
        "'belongs to no other' means no other DECLENSION, which is true. It "
        "is deliberately not the retracted claim that nothing else in Greek "
        "ends in -σι(ν) — every third plural verb does",
    (20, 9, "nothing else"):
        "'looks like nothing else' is about recognising ὢν/οὖσα/ὄν on sight",
    (24, 0, "cannot"):
        "'cannot be read around' — 1,856 occurrences is the reason given, "
        "and it is in the body",
    (4, 9, "none of them"):
        "true and counted: of the fourteen New Testament letters that name "
        "their writer ἀπόστολος or δοῦλος, not one uses the article. The "
        "body says it as 'not one of the fourteen', which is why the marker "
        "does not match on its own",
    (16, 6, "none of them"):
        "chapter 10's body carries this one — 'not one means I have known' "
        "of the 210 — and chapter 16 quotes it back on purpose",
}

# --------------------------------------------------------------------------
# Pass C. A number asserted in a quiz that its own chapter never states.
#
# Support is the question's OWN chapter body, plus the body of any chapter the
# question names in so many words ("as chapter 10 said"). It is deliberately
# NOT every chapter: 27 chapters of frequency counts contain most small
# numbers somewhere, and when this pass was first written that way it let the
# real historical error through — ch10's wrong "47 of the 88" was waved past
# because chapter 8 happens to give πρό 47 occurrences. A checker that cannot
# fail on the fault it was built for is the fault it was built for.
# --------------------------------------------------------------------------
FIGURES = {
    (10, 10, 602):
        "602 perfect active indicatives, of which 210 are οἶδα. Both "
        "re-derived from the corpus; the body gives 210 against οἶδα's own "
        "296 rather than against 602",
    (16, 6, 602):
        "the same 602, quoted back deliberately — the question says so",
    (12, 8, 160):
        "ἔρχεται and δύναται as FORMS inside the 683 present middle "
        "indicatives: 89 + 71. The body's 443 of 683 counts lemmas with no "
        "active, which is a different question",
    (16, 0, 44):
        "100 minus the 56% the same sentence gives",
    (7, 8, 58):
        "second aorists as a share of the aorist active indicatives. Not "
        "derivable from the parse codes — MorphGNT does not separate first "
        "from second aorist — but the sigmatic test gives 2,525 of 4,364, "
        "which is the 58% CLAUDE.md records as the reason check_coverage "
        "exists",
    (10, 8, 48):
        "34 for οἶδα plus 14 for ἵστημι, of the 88. Both re-derived from the "
        "corpus. This is the entry that was wrong: it read 47, from a body "
        "that said thirteen where the corpus says fourteen",
}

MIN_FIGURE = 13          # below this a number is prose — "the three degrees"

BOOKS = (r"(?:[123]\s*)?(?:Matt(?:hew)?|Mark|Luke|John|Acts|Rom(?:ans)?|"
         r"Cor(?:inthians)?|Gal(?:atians)?|Eph(?:esians)?|Phil(?:ippians|emon)?|"
         r"Col(?:ossians)?|Thess(?:alonians)?|Tim(?:othy)?|Titus|Heb(?:rews)?|"
         r"Jas|James|Pet(?:er)?|Jude|Rev(?:elation)?)")

WORDNUM = {"one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6,
           "seven": 7, "eight": 8, "nine": 9, "ten": 10, "eleven": 11,
           "twelve": 12, "thirteen": 13, "fourteen": 14, "fifteen": 15,
           "sixteen": 16, "seventeen": 17, "eighteen": 18, "nineteen": 19,
           "twenty": 20, "thirty": 30, "forty": 40, "fifty": 50, "sixty": 60,
           "seventy": 70, "eighty": 80, "ninety": 90, "hundred": 100,
           "thousand": 1000}
TENS = {k: v for k, v in WORDNUM.items() if v in (20, 30, 40, 50, 60, 70, 80, 90)}
UNITS = {k: v for k, v in WORDNUM.items() if 1 <= v <= 9}


def plain(x):
    return re.sub(r"<[^>]+>", " ", x or "")


def greek(x):
    return set(re.findall(r"[%s]{2,}" % GK, plain(x)))


def numbers(x):
    """Every number a passage asserts. A verse reference is not one of them:
       'Matthew 8:25' must not put 8 and 25 into evidence, and neither must
       the bare '13:4' of a second reference in the same sentence."""
    x = plain(x)
    x = re.sub(BOOKS + r"\.?\s*\d+:\d+(?:[-–]\d+)?", " ", x)
    x = re.sub(r"\b\d+:\d+\b", " ", x)
    x = re.sub(r"\bchapters?\s+\d+(?:\s*(?:and|to|-|–)\s*\d+)?", " ", x, flags=re.I)
    out = {int(m.replace(",", "")) for m in re.findall(r"\d[\d,]*", x)}
    for t, tv in TENS.items():
        for u, uv in UNITS.items():
            if re.search(r"\b%s[- ]%s\b" % (t, u), x, re.I):
                out.add(tv + uv)
    for w, v in WORDNUM.items():
        if re.search(r"\b%s\b" % w, x, re.I):
            out.add(v)
    return out


# ---------------------------------------------------------------- load ----
js = ("const fs=require('fs'),vm=require('vm');const c=vm.createContext({});"
      "for (const f of ['data/vocab.js','data/lessons.js'])"
      "vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});"
      "process.stdout.write(vm.runInContext('JSON.stringify(LESSONS)',c));")
r = subprocess.run(["node", "-e", js], cwd=ROOT, capture_output=True,
                   text=True, encoding="utf-8")
if r.returncode:
    sys.exit("could not load the app data:\n" + r.stderr)
LESSONS = json.loads(r.stdout)

BODY_NUMS = {l["id"]: numbers(l["body"]) for l in LESSONS}


def support(cid, text):
    """The figures a question may quote: its own chapter's, and those of any
       chapter it explicitly names."""
    ok = set(BODY_NUMS.get(cid, ()))
    for m in re.finditer(r"chapters?\s+(\d{1,2})", plain(text), re.I):
        ok |= BODY_NUMS.get(int(m.group(1)), set())
    return ok

bad, stale_used = [], set()
n_q = n_gk = n_abs = n_fig = 0

for l in LESSONS:
    cid = l["id"]
    for i, q in enumerate(l.get("quiz", [])):
        n_q += 1
        key = q["o"][q["a"]]
        asserted = " ".join([q["q"], q.get("w", ""), key])

        # ---- A: does the explanation argue for somebody else? ------------
        exp = greek(q.get("w", ""))
        opts = [greek(o) for o in q["o"]]
        if exp and not (exp & opts[q["a"]]):
            for f in sorted(exp):
                owners = [j for j, o in enumerate(opts) if f in o]
                if len(owners) == 1 and owners[0] != q["a"]:
                    n_gk += 1
                    k = (cid, i, f)
                    if k in KEYED:
                        stale_used.add(k)
                    else:
                        bad.append(("explanation names %s, which is only in "
                                    "option %d, but the key is option %d"
                                    % (f, owners[0], q["a"]), cid, i, q["q"]))

        # ---- B: an absolute the chapter body never makes -----------------
        body = plain(l["body"]).lower()
        low = asserted.lower()
        for a in ABSOLUTES:
            if a in low and a not in body:
                n_abs += 1
                k = (cid, i, a)
                if k in ABSOLUTE_OK:
                    stale_used.add(k)
                else:
                    bad.append(('the quiz says "%s" and the chapter body '
                                "never does" % a, cid, i, q["q"]))

        # ---- C: a figure no chapter body carries -------------------------
        for v in sorted(numbers(asserted) - support(cid, asserted)):
            if v < MIN_FIGURE:
                continue
            n_fig += 1
            k = (cid, i, v)
            if k in FIGURES:
                stale_used.add(k)
            else:
                bad.append(("the figure %s is not in this chapter's body, "
                            "nor in any chapter it names" % v,
                            cid, i, q["q"]))

print("quiz questions read: %d across %d chapters" % (n_q, len(LESSONS)))
print("   what counts as asserted: the question, the explanation and the")
print("   keyed option. Distractors are excluded — they are wrong on purpose.")
print("explanations pointing at another option: %d (%d listed with a reason)"
      % (n_gk, len(KEYED)))
print("absolutes with no counterpart in the body: %d (%d listed)"
      % (n_abs, len(ABSOLUTE_OK)))
print("figures the chapter itself never states:   %d (%d listed)"
      % (n_fig, len(FIGURES)))

stale = (set(KEYED) | set(ABSOLUTE_OK) | set(FIGURES)) - stale_used
if stale:
    print("\nallow-list entries that matched nothing — a question was probably")
    print("inserted or edited, and these need re-checking against the new text:")
    for cid, i, item in sorted(stale, key=lambda x: (x[0], x[1], str(x[2]))):
        print("   ch%-3d q%-3d %s" % (cid, i, item))

print("\nquiz claims not accounted for: %d" % len(bad))
for why, cid, i, qq in bad:
    print("   ch%-3d q%-3d %s" % (cid, i, why))
    print("            %s" % re.sub(r"\s+", " ", qq)[:88])
if bad:
    print("\nEach of these is either a real fault or a line for one of the three")
    print("lists above, with a reason beside it. Writing the reason is the check.")
sys.exit(1 if bad else 0)

# -*- coding: utf-8 -*-
"""The course's own cautions, held against its own prose.

    python tools/check_consistency.py

WHY THIS EXISTS. check_prose asks whether a sentence has been reviewed.
It cannot ask whether a reviewed sentence contradicts another reviewed
sentence, and two outside audits found the same thing by reading: a chapter
gets corrected and an older version of the same teaching survives somewhere
else in it. Five times in this project, and every one of them inside content
the register had already marked reviewed:

  * ch4's quiz still marked "Identifies him as the sinner, not a sinner"
    correct after the body was corrected away from that reading.
  * ch3's quiz still said "μή negates everything outside the indicative"
    after the body gained the John 21:5 exception.
  * ch7 warned that the aorist "does not say the action was quick, or once
    only, or finished" and then glossed two aorists as "done" and "closed it".
  * ch11's quiz said "Every English translation renders it 'he'" four
    versions after the body was corrected.
  * ch21's quiz said "Article absent: adverbial" after the body had learned
    to say "usually, not always".

So this is not another claim register. It is a list of the things this course
has decided NOT to say, and a search for them. Each principle names the
chapter that teaches it, so the failure message can point at the sentence the
offending phrase contradicts.

WHAT IT CANNOT DO. It matches phrases, not propositions. It will not catch a
contradiction expressed in words nobody has thought to list, and every entry
here was added after something got through. That is the honest limit: this
turns a fault that has recurred five times into one that fails a build, and
does nothing about the fault nobody has met yet.

THE ALLOW-LIST IS THE POINT. A banned phrase is sometimes legitimate --
quoting the error in order to correct it, or naming a source that really is
unanimous. ALLOWED carries those with a reason, and anything not in it fails.
"""
import io, json, os, re, subprocess, sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)


# A principle the course states, and the language that breaks it.
PRINCIPLES = [
    {
        "name": "the aorist does not assert completion",
        "taught": 7,
        "says": 'ch7: "It does not say the action was quick, or once only, or '
                'finished — those are things the sentence may tell you, and '
                'the tense does not."',
        "bad": re.compile(r"aorist[^.]{0,80}\b(closed|finished|completed|once for all|"
                          r"once-for-all)\b|\b(closed it|one event, closed|"
                          r"one event, done)\b", re.I),
    },
    {
        "name": "the article is not automatic evidence",
        "taught": 4,
        "says": 'ch4: "The test is whether the writer could have written it the '
                'other way."',
        "bad": re.compile(r"\bthe sinner, not a sinner\b|"
                          r"article[^.]{0,60}\b(proves|establishes)\b", re.I),
    },
    {
        "name": "the negatives divide by mood only as a tendency",
        "taught": 3,
        "says": 'ch3: "That division holds about nine times in ten, and the '
                'commonest exception earns its keep."',
        "bad": re.compile(r"μή\s+negates everything|"
                          r"negates everything (?:outside|else)", re.I),
    },
    {
        "name": "a non-indicative tense does not fix time",
        "taught": 16,
        "says": 'ch16: "any time it carries is relative to the main verb rather '
                'than fixed to when the writer wrote."',
        "bad": re.compile(r"aspect and nothing more", re.I),
    },
    {
        "name": "no claim that every grammar or translation agrees",
        "taught": 12,
        "says": 'ch12 quotes Robertson refusing the term "deponent" outright, so '
                'the course cannot also say every grammar uses it; and Young’s '
                'Literal has broken "every English translation" three times.',
        "bad": re.compile(r"(?<!almost )(?<!nearly )(?<!not )"
                          r"every (?:English )?(?:grammar|translation|reference work)|"
                          r"(?<!almost )every version|all grammars", re.I),
    },
    {
        "name": "a recognition rule is not the whole of recognising",
        "taught": 24,
        "says": 'ch24: forms collide, and fifteen verbs have the future '
                'indicative and aorist subjunctive spelled identically.',
        "bad": re.compile(r"the whole of recognising|is all you need to (?:tell|know)|"
                          r"that settles it every time", re.I),
    },
    {
        "name": "the article does not classify a participle by itself",
        "taught": 21,
        "says": 'ch21: "Usually, not always — an anarthrous participle can '
                'still be attributive."',
        "bad": re.compile(r"[Aa]rticle absent: adverbial|"
                          r"article absent, it is describing the circumstances of "
                          r"the main verb\.", re.I),
    },
]

# (chapter, the exact matched fragment) -> why THAT occurrence is legitimate.
ALLOWED = {
    (7, "aorist is not the once-for-all"):
        "the caution stated negatively -- \"The aorist is not the once-for-all "
        "tense. It is the tense that declines to comment.\" A rule has to be "
        "able to name what it forbids.",
    (3, "μή negates everything"):
        "the rule stated plainly, and qualified three paragraphs later in the "
        "same section with the John 21:5 exception. Teaching order rather than "
        "a contradiction -- the chapter does not leave it standing.",
}


def load_lessons():
    js = ("const fs=require('fs'),vm=require('vm');const c=vm.createContext({});"
          "vm.runInContext(fs.readFileSync('data/lessons.js','utf8'),c);"
          "process.stdout.write(vm.runInContext('JSON.stringify(LESSONS)',c));")
    r = subprocess.run(["node", "-e", js], capture_output=True, text=True,
                       encoding="utf-8")
    if r.returncode or not r.stdout:
        sys.exit("could not read data/lessons.js:\n" + (r.stderr or ""))
    return json.loads(r.stdout)


def plain(x):
    return " ".join(re.sub("<[^>]+>", " ", x or "").split())


if __name__ == "__main__":
    hits, allowed = [], 0
    for les in load_lessons():
        parts = [("body", plain(les.get("body")))]
        for i, q in enumerate(les.get("quiz") or []):
            # The stem, the KEYED option and the explanation. Never a
            # distractor: check_quiz makes the same exclusion for the same
            # reason -- a wrong answer that says "a completed state" is doing
            # its job, and flagging it would be checking that the wrong
            # answers are wrong.
            opts = q.get("o", []) or []
            keyed = opts[q["a"]] if isinstance(q.get("a"), int) and                 q["a"] < len(opts) else ""
            parts.append(("quiz %d" % i,
                          plain(str(q.get("q", "")) + " " + keyed + " " +
                                str(q.get("w", "")))))
        for where, text in parts:
            for p in PRINCIPLES:
                for m in p["bad"].finditer(text):
                    frag = m.group(0)
                    # Keyed on the MATCHED FRAGMENT, not on a phrase found
                    # anywhere in the chapter. The first version tested
                    # `k[0] in text`, which meant one legitimate sentence in
                    # chapter 7 excused every aorist-completion phrase in the
                    # whole chapter -- and a deliberate revert of the ch7 gloss
                    # passed silently. An allow-list that pardons a whole
                    # chapter is not an allow-list.
                    if (les["id"], frag.lower()) in ALLOWED:
                        allowed += 1
                        continue
                    hits.append((les["id"], where, p, frag,
                                 text[max(0, m.start() - 70):m.end() + 70]))

    print("principles the course states and this holds it to: %d" % len(PRINCIPLES))
    print("occurrences excused in ALLOWED:                    %d" % allowed)

    if hits:
        print("\nTHE COURSE SAYING WHAT IT HAS DECIDED NOT TO SAY: %d" % len(hits))
        for cid, where, p, frag, ctx in hits:
            print("\n   ch%-2d %-8s %r" % (cid, where, frag))
            print("        breaks: %s" % p["name"])
            print("        %s" % p["says"])
            print("        …%s…" % ctx.strip())
        print("\n   Either the sentence needs correcting, or the occurrence is "
              "legitimate\n   and belongs in ALLOWED with a reason.")
        sys.exit(1)
    print("\nno chapter contradicts a caution the course has stated")

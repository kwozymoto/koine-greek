# -*- coding: utf-8 -*-
"""Which of Black's sections has no counterpart in the app's chapter?

    python tools/check_coverage.py

Chapter 7 taught the first aorist and said nothing about second aorists. 58%
of the aorist active indicatives in the New Testament are second aorists, so
a reader finishing that chapter would meet the commonest aorist in the corpus
and not recognise it. No checker found that. It was found by reading Black's
section list beside the app's chapter, by hand, once, because Fraser asked
what was being dropped.

This is that comparison, done every run. For each of Black's numbered
sections it collects the Greek forms he uses and asks how many appear
anywhere in the app's chapter. A section with **nothing** in common is a
section the app may simply not cover.

It is a signal, not a verdict, and it has to be read as one. Zero overlap can
mean a real gap — mood and voice were named in chapter 2 and never explained,
and the uses of the present were a paragraph against Black's 452 words. It
can equally mean he chose different example words for the same material.
Every one has been looked at once; REVIEWED below records the judgement and
why, so that what this prints is only what has not yet been judged.

The books are outside this repository and always will be. If they are not on
the machine, this says so and passes, like tools/check_black.py.
"""
import glob, json, os, re, subprocess, sys, unicodedata, zipfile

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BLACK = os.path.join(os.path.dirname(ROOT), "Greek App Reference", "Black")
GK = "Ͱ-Ͽἀ-῿"

# (chapter, the start of Black's section heading) -> why the app does not
# mirror it. Read once, judged once, recorded so the report stays short
# enough that a new entry in it is visible.
REVIEWED = {
    (1, "1. The Language"): "historical background rather than grammar",
    (1, "3. Greek Phonology"): "how words are built; the app teaches it through the paradigms",
    (1, "5. The Greek Consonants"): "the sound grid and the tracing drill do this better than prose",
    (1, "6. The Use and Formation"): "letter formation — the handwriting drill",
    (1, "10. The Greek Accents"): "the app teaches accents as spelling and defers the rules, deliberately",
    (2, "12. Inflection"): "the chapter opening covers it",
    (4, "29. Gender"): "taught through the article and ἡ ὁδός in the same chapter",
    (4, "31. Additional Uses"): "the case-function drill and the syntax tables carry these",
    (4, "32. Complements"): "the predicate nominative — chapter 6 and the case-function drill",
    (4, "34. Conjunctions"): "the Discourse markers table, with corpus counts Black cannot give",
    (4, "35. Greek Word Order"): "the chapter opening covers it",
    (5, "39. The Paradigm of the Definite Article"): "Tables holds all seventeen forms, with a drill",
    (6, "45. Summary"): "a summary of the section above it",
    # judged after the audit that produced this checker
    (2, "13. Mood"): "added — the chapter now explains all four moods and the two non-finite forms",
    (2, "15. Tense (Aspect)"): "the Aspect comes first section, with different example words",
    (2, "16. The Significance"): "the same section, and the warning about Black's terminology",
    (3, "18. The Primary Active Suffixes"): "the theory of endings; the app teaches the paradigm and drills it",
    (4, "28. Introducing the Greek Cases"): "the chapter opening makes the same point about word order",
    (4, "33. The Use of the Definite Article"): "added — presence against absence, Luke 18:13 and Galatians 1:1",
    (7, "48. The Secondary Active Suffixes"): "the theory of endings, as with 18",
    (7, "50. Amalgamation in the Aorist"): "the same sigma-plus-stop rules the app gives for the future in ch3",
    (7, "54. Uses of the Imperfect and Aorist"): "covered by What the imperfect is for and The aorist",
}

# Chapters rewritten to the standard in docs/lesson-style.md. A flag in one
# of these is a defect and fails; a flag in any other chapter is simply work
# not yet done, and is reported without failing. Add to this as batches land.
DONE = {1, 2, 3, 4, 5, 6, 7, 21}

# Known to be thinner than Black and not yet judged worth fixing. Listed so
# it is a decision rather than an oversight.
THIN = {
    (1, "4. The Greek Vowels"): "vowel length is only implicit in the alphabet grid; it matters "
                               "for contract verbs and for accent rules",
}


def docx_text(p):
    with zipfile.ZipFile(p) as z:
        x = z.read("word/document.xml").decode("utf-8")
    x = x.replace("</w:p>", "\n")
    return re.sub(r"<[^>]+>", "", re.sub(r"<(?!/?w:t(?:\s[^>]*)?>)[^>]+>", "", x))


def norm(x):
    y = unicodedata.normalize("NFD", x).replace("̀", "́")
    return unicodedata.normalize("NFC", y).lower()


def black_sections():
    """chapter -> [(heading, word count, the Greek forms it uses)]"""
    out = {}
    for f in sorted(glob.glob(os.path.join(BLACK, "*.docx"))):
        if not re.match(r"^[\d\-]+\.docx$", os.path.basename(f)):
            continue
        cur, head, buf = None, None, []

        def flush():
            if cur and head and not re.search(r"(Vocabulary|Exercises)", head):
                body = " ".join(buf)
                out.setdefault(cur, []).append(
                    (head, len(body.split()),
                     {norm(w) for w in re.findall("[%s]{3,}" % GK, body)}))

        for line in docx_text(f).split("\n") + ["999"]:
            L = line.strip()
            if re.match(r"^\d{1,2}$", L):
                flush(); cur, head, buf = int(L), None, []
            elif re.match(r"^(\d+\.\s*[A-Z][^\n]{2,60})$", L):
                flush(); head, buf = L, []
            else:
                buf.append(L)
    return out


if not os.path.isdir(BLACK):
    print("Black is not on this machine, so chapter coverage was not checked.")
    print("  looked in: %s" % BLACK)
    sys.exit(0)

js = ("const fs=require('fs'),vm=require('vm');const c=vm.createContext({});"
      "for(const f of ['data/vocab.js','data/lessons.js'])"
      "vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});"
      "process.stdout.write(vm.runInContext('JSON.stringify(LESSONS)',c));")
r = subprocess.run(["node", "-e", js], cwd=ROOT, capture_output=True,
                   text=True, encoding="utf-8")
if r.returncode:
    sys.exit("could not load the app data:\n" + r.stderr)
LESSONS = {l["id"]: l for l in json.loads(r.stdout)}

reviewed = lambda cid, head: next(
    (v for (c, pre), v in list(REVIEWED.items()) + list(THIN.items())
     if c == cid and head.startswith(pre)), None)
is_thin = lambda cid, head: any(c == cid and head.startswith(pre) for c, pre in THIN)

black = black_sections()
unexamined, pending, thin_seen, checked, skipped = [], [], [], 0, 0
for cid in sorted(black):
    l = LESSONS.get(cid)
    if not l:
        continue
    app = {norm(w) for w in re.findall(
        "[%s]{3,}" % GK,
        re.sub("<[^>]+>", " ", l["body"]) + " " +
        json.dumps(l["quiz"], ensure_ascii=False))}
    for head, words, forms in black[cid]:
        why = reviewed(cid, head)
        if why:
            if is_thin(cid, head):
                thin_seen.append("ch%-3d %-44s %s" % (cid, head[:44], why))
            skipped += 1
            continue
        # Below five forms the overlap test is noise: a section quoting one or
        # two words can share none of them with a chapter that covers exactly
        # the same ground. Those are judged by reading, not by counting.
        if len(forms) < 5:
            skipped += 1
            continue
        checked += 1
        if not (forms & app):
            (unexamined if cid in DONE else pending).append(
                "ch%-3d %-44s %4d words, %d forms, none in the app"
                % (cid, head[:44], words, len(forms)))

print("Black sections compared: %d   (%d judged already or with no Greek to compare)"
      % (checked, skipped))
print()
print("known to be thinner than Black, by decision: %d" % len(thin_seen))
for t in thin_seen:
    print("   " + t)
print()
print("in chapters not yet rewritten — the work list: %d" % len(pending))
for u in pending:
    print("   " + u)
print()
print("in chapters that claim to be finished: %d" % len(unexamined))
for u in unexamined:
    print("   " + u)
if unexamined:
    print()
    print("Each of those is a candidate gap, not a proven one — Black may simply")
    print("have chosen different example words. Read it, then either fix the")
    print("chapter or record the judgement in REVIEWED at the top of this file.")
sys.exit(1 if unexamined else 0)

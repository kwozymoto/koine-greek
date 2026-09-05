# -*- coding: utf-8 -*-
"""Check the drill data in js/app.js against the SBLGNT in data/gnt/.

    python tools/check_drills.py

Four arrays in js/app.js are hand-written Greek with a hand-written label
attached, and the label is what the drill marks you right or wrong against.
The corpus can settle most of it, because it carries a full parse for every
form it contains:

  ART          all 17 forms of the definite article, each with a parse in
               English. Every one occurs thousands of times, so this is
               decisive: if the corpus never tags ὁ as anything but
               masculine nominative singular, the label is right.
  PARSE        forms with a parse in English. Mostly λύω, the teaching
               paradigm, whose forms are largely unattested — those are
               reported apart from the ones the corpus can judge.
  BUILD_FORMS  form plus tense/voice/person/number as separate fields, which
               the parsing-builder drill asks you to assemble.
  PP           41 verbs with their future, aorist and perfect. Each part
               should be attested and should carry the tense of its column —
               but only as confirmation. A future indicative and an aorist
               subjunctive are frequently the same string, so the corpus
               tagging πιστεύσω aorist says nothing against it also being the
               future; those are listed for a human, not failed.
  LOOKALIKE    the pairs one accent or breathing apart. The drill's whole
               premise is that these are confusable, and that is itself a
               checkable claim: strip the accents and breathings from a group
               and every member must collapse to the same letters. If they do
               not, the group is not a look-alike group and the question is
               not the question it says it is. Non-occurrence is reported
               rather than failed, as it is for the principal parts: a
               paradigm legitimately holds forms the New Testament never
               happens to use. ἕξω is one — the first singular future of ἔχω
               is absent, while ἕξει, ἕξεις, ἕξετε and ἕξουσιν occur thirteen
               times between them, so the breathing trap against ἔξω is live
               even though that exact form is not.
  CASEFN       the case and syntax questions. Their Greek is a quotation, so
               the corpus can say whether it is one: does this phrase occur,
               contiguously, in the verse the row names? Six of the first ten
               did not occur anywhere in the New Testament — plausible Greek
               assembled from memory, including a genitive absolute that had
               already been caught and fixed once in chapter 20. Also checked:
               four distinct options, an answer index inside them, and a
               chapter gate that is a real chapter, since that gate decides
               when the question is allowed to reach a learner.

A form the corpus does not contain proves nothing — a paradigm legitimately
holds forms the New Testament never happens to use. Those are counted and
listed separately, never failed. What fails is a form the corpus does
contain and consistently parses some other way.
"""
import json, io, os, re, sys, unicodedata, collections

# This prints Greek and the Windows console is cp1252. Every other checker
# guards this; without it a clean run still crashes on its own report,
# which only showed up once a failure had Greek in it.
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GNT = os.path.join(ROOT, "data", "gnt")
GK = "Ͱ-Ͽἀ-῿"
bare = lambda s: re.sub("[^" + GK + "]", "", s)

def norm(x):
    """Grave folds to acute — that shift is positional, not lexical."""
    d = unicodedata.normalize("NFD", x).replace("̀", "́")
    return unicodedata.normalize("NFC", d).lower()

man = json.load(io.open(os.path.join(GNT, "manifest.json"), encoding="utf-8"))
LEMMAS, POS = man["lemmas"], man["pos"]

# form -> the parses the corpus gives it, with how often
PARSES = collections.defaultdict(collections.Counter)
for b in man["books"]:
    d = json.load(io.open(os.path.join(GNT, b["a"] + ".json"), encoding="utf-8"))
    for ch in d["c"]:
        for vs in ch:
            for w in vs[1]:
                PARSES[norm(bare(w[0]))][(POS[w[2]], w[3], LEMMAS[w[1]])] += 1

# ------------------------------------------------------- the app's data ---
app = io.open(os.path.join(ROOT, "js", "app.js"), encoding="utf-8").read()

def array(name):
    m = re.search(r"const " + name + r"=\[([\s\S]*?)\n\];", app)
    if not m:
        sys.exit("could not find %s in js/app.js" % name)
    body = re.sub(r"//[^\n]*", "", m.group(1))
    body = re.sub(r"/\*[\s\S]*?\*/", "", body)
    body = re.sub(r",(\s*\])", r"\1", body.strip())
    return json.loads("[" + "".join(body.splitlines()) + "]")

ART, PARSE, BUILD, PP = array("ART"), array("PARSE"), array("BUILD_FORMS"), array("PP")
CASEFN = array("CASEFN")
LOOKALIKE = array("LOOKALIKE")

# Whole verses, for the one drill whose Greek is a quotation rather than a
# paradigm. Same test tools/check_syntax.py applies to the syntax tables.
VERSES = {}
for b in man["books"]:
    d = json.load(io.open(os.path.join(GNT, b["a"] + ".json"), encoding="utf-8"))
    nums = b.get("n") or list(range(1, len(d["c"]) + 1))
    for ci, ch in enumerate(d["c"]):
        for vs in ch:
            VERSES["%s %d:%d" % (b["t"], nums[ci], vs[0])] = [norm(bare(w[0])) for w in vs[1]]

# ------------------------------------------------- English -> parse code ---
CASE = {"nominative": "N", "genitive": "G", "dative": "D", "accusative": "A",
        "vocative": "V"}
NUM = {"singular": "S", "plural": "P", "sg": "S", "pl": "P"}
GEN = {"masculine": "M", "feminine": "F", "neuter": "N"}
TENSE = {"present": "P", "imperfect": "I", "future": "F", "aorist": "A",
         "perfect": "X", "pluperfect": "Y",
         "pres": "P", "impf": "I", "fut": "F", "aor": "A", "pf": "X"}
VOICE = {"active": "A", "middle": "M", "passive": "P",
         "act": "A", "mid": "M", "pass": "P"}
MOOD = {"indicative": "I", "subjunctive": "S", "imperative": "D",
        "optative": "O", "infinitive": "N", "participle": "P"}
PERSON = {"1st": "1", "2nd": "2", "3rd": "3", "1": "1", "2": "2", "3": "3"}

def wanted(label):
    """The parse-code slots an English label commits to."""
    want = {}
    low = label.lower()
    for word in re.split(r"[\s,/]+", low):
        w = word.strip(".")
        if w in CASE: want["case"] = CASE[w]
        elif w in NUM: want["number"] = NUM[w]
        elif w in GEN: want["gender"] = GEN[w]
        elif w in TENSE: want["tense"] = TENSE[w]
        elif w in VOICE: want["voice"] = VOICE[w]
        elif w in MOOD: want["mood"] = MOOD[w]
        elif w in PERSON: want["person"] = PERSON[w]
    # "middle/passive" and "nominative/accusative" name alternatives, and a
    # form that is genuinely either must not be failed for being one of them
    alts = {}
    if "middle/passive" in low or "m/p" in low: alts["voice"] = set("MP")
    if "nominative/accusative" in low: alts["case"] = set("NA")
    if "masculine/neuter" in low: alts["gender"] = set("MN")
    if "all genders" in low: alts["gender"] = set("MFN")
    return want, alts

SLOT = {"person": 0, "tense": 1, "voice": 2, "mood": 3,
        "case": 4, "number": 5, "gender": 6}

def judge(form, label, expect_pos=None):
    """None if the corpus cannot judge; else a list of complaints."""
    got = PARSES.get(norm(bare(form)))
    if not got:
        return None
    want, alts = wanted(label)
    if expect_pos:
        got = collections.Counter({k: v for k, v in got.items() if k[0] == expect_pos})
        if not got:
            return ["the corpus never tags it %s" % expect_pos]
    bad = []
    for slot, letter in want.items():
        ok = alts.get(slot, {letter})
        i = SLOT[slot]
        hits = sum(n for (p, code, lem), n in got.items()
                   if len(code) > i and code[i] in ok)
        if hits:
            continue
        seen = collections.Counter()
        for (p, code, lem), n in got.items():
            if len(code) > i and code[i] not in "-":
                seen[code[i]] += n
        if not seen:
            continue                       # the corpus says nothing about it
        # name the letters using this slot's own vocabulary — 'A' is aorist
        # in the tense slot and active in the voice slot
        src = {"case": CASE, "number": NUM, "gender": GEN, "tense": TENSE,
               "voice": VOICE, "mood": MOOD, "person": PERSON}[slot]
        rev = {}
        for word, code_letter in src.items():
            rev.setdefault(code_letter, word)
        bad.append("%s should be %s, the corpus has %s"
                   % (slot, rev.get(letter, letter),
                      "/".join(rev.get(c, c) for c, _ in seen.most_common(3))))
    return bad

# ------------------------------------------------------------------ run ---
problems, unattested, homographs, checked = [], [], [], 0

for form, label in ART:
    r = judge(form, label, "RA")
    if r is None:
        unattested.append("ART   %-8s %s" % (form, label))
    else:
        checked += 1
        for c in r:
            problems.append("ART   %-10s %-42s %s" % (form, label, c))

for form, label in PARSE:
    r = judge(form, label)
    if r is None:
        unattested.append("PARSE %-10s %s" % (form, label))
    else:
        checked += 1
        for c in r:
            problems.append("PARSE %-10s %-42s %s" % (form, label, c))

for row in BUILD:
    form, label = row[0], " ".join(row[1:])
    r = judge(form, label)
    if r is None:
        unattested.append("BUILD %-10s %s" % (form, label))
    else:
        checked += 1
        for c in r:
            problems.append("BUILD %-10s %-42s %s" % (form, label, c))

# principal parts: the tense of the column, and the headword's own present
PP_TENSE = [None, "future", "aorist", "perfect"]
for row in PP:
    for slot in (1, 2, 3):
        f = row[slot]
        if f == "—":
            continue
        r = judge(f, PP_TENSE[slot])
        if r is None:
            unattested.append("PP    %-10s %-9s of %s" % (f, PP_TENSE[slot], row[0]))
            continue
        checked += 1
        # A principal part that the corpus contains but never as a verb is a
        # different word wearing the same letters. ἔξω (smooth breathing) sat
        # here as the future of ἔχω for exactly that reason: it is the adverb
        # "outside", 62 times, and never once a form of ἔχω, whose future
        # takes the rough breathing ἕξω. The tense check could not see it,
        # because an adverb has no tense to disagree with.
        tags = {p for (p, code, lem) in PARSES[norm(bare(f))]}
        if "V-" not in tags:
            problems.append("PP    %-10s %-9s of %-12s is in the corpus %d times "
                            "and never as a verb — it is %s"
                            % (f, PP_TENSE[slot], row[0],
                               sum(PARSES[norm(bare(f))].values()),
                               "/".join(sorted(tags))))
            continue
        for c in r:
            homographs.append("PP    %-10s %-9s of %-12s %s"
                              % (f, PP_TENSE[slot], row[0], c))

# ------------------------------------------------------------- CASEFN ----
case_bad = []
for n, row in enumerate(CASEFN):
    tag = "CASEFN[%d]" % n
    if len(row) != 6:
        case_bad.append("%s has %d fields, not 6 — prompt, options, answer, "
                        "why, chapter, reference" % (tag, len(row)))
        continue
    prompt, opts, ans, why, chapter, ref = row
    if "|" not in prompt:
        case_bad.append("%s has no | separating the Greek from the question" % tag)
        continue
    greek = prompt.split("|")[0]
    if len(opts) != 4 or len(set(opts)) != 4:
        case_bad.append("%s does not offer four distinct options" % tag)
    if not isinstance(ans, int) or not 0 <= ans < len(opts):
        case_bad.append("%s answers %r, which is not one of its options" % (tag, ans))
    if not isinstance(chapter, int) or not 1 <= chapter <= 26:
        case_bad.append("%s is gated on chapter %r, which Black does not have"
                        % (tag, chapter))
    toks = VERSES.get(ref)
    if toks is None:
        case_bad.append("%s cites %s, which is not a verse in the corpus" % (tag, ref))
        continue
    want = [norm(bare(w)) for w in greek.split() if bare(w)]
    if not want:
        case_bad.append("%s has no Greek in it" % tag)
        continue
    if not any(toks[i:i + len(want)] == want for i in range(len(toks) - len(want) + 1)):
        case_bad.append("%s — %r does not occur in %s" % (tag, greek, ref))

# ---------------------------------------------------------- LOOKALIKE ----
# Accents and breathings off, everything else kept: that is precisely the
# difference the drill claims these pairs come down to.
ACCENTS = dict.fromkeys(map(ord, "̀́͂̓̔ͅ"))
skel = lambda w: unicodedata.normalize("NFD", bare(w)).translate(ACCENTS).lower()

look_bad = []
look_forms = 0
for gi, group in enumerate(LOOKALIKE):
    tag = "LOOKALIKE[%d]" % gi
    if len(group) < 2:
        look_bad.append("%s has only one member, so nothing looks like it" % tag)
        continue
    shapes = {skel(f) for f, _ in group}
    if len(shapes) != 1:
        look_bad.append("%s is not one accent apart: %s"
                        % (tag, " vs ".join(sorted(shapes))))
    forms = [f for f, _ in group]
    if len(set(forms)) != len(forms):
        look_bad.append("%s lists the same form twice" % tag)
    for f, desc in group:
        look_forms += 1
        if not desc.strip():
            look_bad.append("%s — %s has no description" % (tag, f))
        if not PARSES.get(norm(bare(f))):
            unattested.append("LOOK  %-10s %s" % (f, desc[:52]))

print("drill forms the corpus could judge: %d" % checked)
print("case and syntax questions held to the verse they quote: %d" % len(CASEFN))
print("look-alike forms, each attested and each one accent apart: %d in %d groups"
      % (look_forms, len(LOOKALIKE)))
print("drill forms the corpus does not contain: %d (a paradigm may hold forms "
      "the NT never uses)" % len(unattested))
print()
print("labels contradicted by the corpus: %d" % len(problems))
for p in problems:
    print("   " + p)
print()
print("principal parts the corpus only ever uses in another tense: %d" % len(homographs))
print("   (a future and an aorist subjunctive are often spelled alike, so the")
print("    corpus can confirm a principal part but never refute one)")
for h in homographs:
    print("   " + h)
print()
print("not in the corpus, so not judged:")
for u in unattested:
    print("   " + u)
print()
print("case questions whose Greek or shape does not hold up: %d" % len(case_bad))
for c in case_bad:
    print("   " + c)
print()
print("look-alike groups that are not what they claim: %d" % len(look_bad))
for c in look_bad:
    print("   " + c)
sys.exit(1 if (problems or case_bad or look_bad) else 0)

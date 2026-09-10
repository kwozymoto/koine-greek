# -*- coding: utf-8 -*-
"""Every "X occurs N times" in a lesson, re-derived from the corpus.

    python tools/check_claims.py

The rewritten chapters argue from counted facts. "6,640 participles, one verb
form in four." "πᾶς occurs 1,244 times." "19,769 articles." Those numbers do
real work — they are why chapter 20 is long and chapter 14 is short — and a
wrong one is the most dangerous kind of error this project can ship: precise,
confident, plausible, and not something a reader can check.

Three had already been found by accident before this file existed:

  * the article given as 19,700 in ch26 and 19,770 in ch4 (it is 19,769)
  * δίδωσιν given as 11 in one section of ch25 and 10 in the next
  * αὐτός's nominatives given as 261 against a denominator of 5,546, where
    261 counts only the pronoun-tagged ones and the total counts all of them

Found by accident is not a system. This is the system.

WHAT IT CHECKS. A claim is a Greek word in the prose with a number attached
within a short distance — "<span class="gk">πᾶς</span> … occurs 1,244 times",
or "ἔδωκεν (62)". For each, it computes two counts from data/gnt/: how often
that LEMMA occurs, and how often that exact SURFACE FORM occurs. A claim
passes if it matches either, because both are things a chapter legitimately
says: "διά occurs 666 times" is a lemma count, "γέγραπται … 67" is a form
count. It fails only when the number matches neither.

WHAT IT CANNOT CHECK. A claim about a grammatical category rather than a word
— "1,856 subjunctives", "853 present imperatives" — has no single token to
count, so those live in CATEGORY below with the query that produces them, and
are recomputed the same way. Anything else numeric is out of reach and stays
a job for reading.
"""
import collections, io, json, os, re, subprocess, sys, unicodedata

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from corpus import manifest, book, norm, bare, fold                # noqa: E402

GK = "Ͱ-Ͽἀ-῿"


# fold() now lives in corpus.py beside norm, plain and loose. It was
# defined here and nowhere else, which is how three separate recounts
# during the claims pass reached for plain() instead and undercounted
# every enclitic-accented and sentence-initial spelling.


def norm_cased(x):
    """norm() without the lowercasing, so a capitalised proper-name lemma
       stays apart from the common noun that looks like it."""
    d = unicodedata.normalize("NFD", x).replace("̀", "́")
    return unicodedata.normalize("NFC", d)


# --------------------------------------------------------------- the corpus
man = manifest()
LEM, POS = man["lemmas"], man["pos"]
lemma_count = collections.Counter()
lemma_cased = collections.Counter()
form_count = collections.Counter()
tag = collections.Counter()          # (mood, tense, voice) and coarser slices
verbs = eimi_imperfect = genitive_participles = 0

for b in man["books"]:
    d = book(b["a"])
    for ch in d["c"]:
        for vs in ch:
            for w in vs[1]:
                lemma_count[norm(LEM[w[1]])] += 1
                lemma_cased[LEM[w[1]]] += 1
                form_count[fold(w[0])] += 1
                if POS[w[2]] == "V-":
                    verbs += 1
                    if LEM[w[1]] == "εἰμί" and w[3][1] == "I" and w[3][3] == "I":
                        eimi_imperfect += 1
                    if w[3][3] == "P" and w[3][4] == "G":
                        genitive_participles += 1
                    c = w[3]
                    tag[("mood", c[3])] += 1
                    tag[("tense-voice-mood", c[1], c[2], c[3])] += 1
                    tag[("tense-mood", c[1], c[3])] += 1


def corpus_counts(word):
    """(lemma count, surface count, accentless surface count).

       All three are returned rather than the first non-zero, because they
       differ in ways a claim can legitimately mean either way: ἔσται occurs
       117 times lower-case and 118 counting the sentence-initial Ἔσται, and
       a chapter saying "ἔσται alone occurs N times" means the word, not the
       lower-case spelling of it. An earlier version short-circuited on the
       exact count and so accepted 117, which is how seven undercounts got
       into the chapters: they were written from a case-sensitive tally."""
    # MorphGNT lemmatises a proper name apart from the common noun it is
    # built on, and seventeen pairs in the corpus differ only in their first
    # letter: πόλις "city" 162 against Πόλις 1 (Νέαν Πόλιν, Neapolis, at
    # Acts 16:11), στέφανος "crown" 18 against Στέφανος "Stephen" 7,
    # σμύρνα "myrrh" 2 against Σμύρνα "Smyrna" 2, λιμήν "harbour" against
    # Λιμήν in "Fair Havens", γάζα "treasure" against Γάζα "Gaza". norm()
    # lowercases, so counting through it silently added the place to the
    # noun -- which is how chapter 17 came to give πόλις as 163.
    #
    # So the cased tally is what a claim about a common noun means, and the
    # merged one is offered too, because a chapter naming a proper name
    # writes it capitalised and means exactly that lemma.
    w = bare(word)
    return (lemma_cased.get(norm_cased(w), 0) or lemma_count.get(norm(w), 0),
            form_count.get(fold(word), 0), 0)


# ------------------------------------------------------------- category claims
# Numbers that count a grammatical category rather than a word. Each carries
# the query that produces it, so the number in the lesson and the number in
# the corpus cannot drift apart.
CATEGORY = {
    "verb forms": lambda: verbs,
    "indicatives": lambda: tag[("mood", "I")],
    "participles": lambda: tag[("mood", "P")],
    "infinitives": lambda: tag[("mood", "N")],
    "subjunctives": lambda: tag[("mood", "S")],
    "imperatives": lambda: tag[("mood", "D")],
    "optatives": lambda: tag[("mood", "O")],
    "aorist passive indicative": lambda: tag[("tense-voice-mood", "A", "P", "I")],
    "present middle indicative": lambda: tag[("tense-voice-mood", "P", "M", "I")],
    "aorist middle indicative": lambda: tag[("tense-voice-mood", "A", "M", "I")],
    "future middle indicative": lambda: tag[("tense-voice-mood", "F", "M", "I")],
    "future passive indicative": lambda: tag[("tense-voice-mood", "F", "P", "I")],
    "present passive indicative": lambda: tag[("tense-voice-mood", "P", "P", "I")],
    "imperfect middle indicative": lambda: tag[("tense-voice-mood", "I", "M", "I")],
    "perfect passive indicative": lambda: tag[("tense-voice-mood", "X", "P", "I")],
    "imperfect passive indicative": lambda: tag[("tense-voice-mood", "I", "P", "I")],
    "perfect middle indicative": lambda: tag[("tense-voice-mood", "X", "M", "I")],
    "perfect active indicative": lambda: tag[("tense-voice-mood", "X", "A", "I")],
    "pluperfect active indicative": lambda: tag[("tense-voice-mood", "Y", "A", "I")],
    "pluperfect middle and passive indicative":
        lambda: tag[("tense-voice-mood", "Y", "M", "I")] + tag[("tense-voice-mood", "Y", "P", "I")],
    "perfect, all moods": lambda: tag[("tense-mood", "X", "I")] + tag[("tense-mood", "X", "P")]
                                  + tag[("tense-mood", "X", "N")] + tag[("tense-mood", "X", "S")]
                                  + tag[("tense-mood", "X", "D")] + tag[("tense-mood", "X", "O")],
    "aorist subjunctive": lambda: tag[("tense-mood", "A", "S")],
    "present subjunctive": lambda: tag[("tense-mood", "P", "S")],
    "perfect subjunctive": lambda: tag[("tense-mood", "X", "S")],
    "present imperative": lambda: tag[("tense-mood", "P", "D")],
    "aorist imperative": lambda: tag[("tense-mood", "A", "D")],
    "future participle": lambda: tag[("tense-mood", "F", "P")],
    "imperfect of εἰμί": lambda: eimi_imperfect,
    "genitive participles": lambda: genitive_participles,
}

# What each chapter claims for a category, and where. Kept here rather than
# scraped, because prose does not name a parse code — but the NUMBER is
# recomputed every run, so a corpus update or a typo in a lesson shows up.
CATEGORY_CLAIMS = [
    (16, "indicatives", 15589),
    (20, "participles", 6640),
    (20, "future participle", 12),
    (24, "subjunctives", 1856),
    (24, "aorist subjunctive", 1387),
    (24, "present subjunctive", 459),
    (24, "perfect subjunctive", 10),
    (25, "imperatives", 1618),
    (25, "present imperative", 853),
    (25, "aorist imperative", 761),
    (25, "optatives", 68),
    (15, "aorist passive indicative", 863),
    (14, "aorist passive indicative", 863),
    (12, "present middle indicative", 683),
    (14, "present middle indicative", 683),
    (14, "aorist middle indicative", 641),
    (14, "future middle indicative", 489),
    (13, "future middle indicative", 489),
    (14, "future passive indicative", 292),
    (14, "present passive indicative", 274),
    (14, "imperfect middle indicative", 233),
    (14, "perfect passive indicative", 202),
    (13, "perfect passive indicative", 202),
    (14, "imperfect passive indicative", 83),
    (14, "perfect middle indicative", 32),
    (14, "pluperfect middle and passive indicative", 7),
    (10, "perfect active indicative", 602),
    (16, "perfect active indicative", 602),
    (10, "pluperfect active indicative", 81),
    (10, "perfect, all moods", 1572),
    (7, "imperfect of εἰμί", 455),
    (21, "genitive participles", 735),
]

# ------------------------------------------------------------- word claims
js = ("const fs=require('fs'),vm=require('vm');const c=vm.createContext({});"
      "for(const f of ['data/vocab.js','data/lessons.js'])"
      "vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});"
      "process.stdout.write(vm.runInContext('JSON.stringify(LESSONS)',c));")
r = subprocess.run(["node", "-e", js], cwd=ROOT, capture_output=True,
                   text=True, encoding="utf-8")
if r.returncode:
    sys.exit("could not load the app data:\n" + r.stderr)
LESSONS = json.loads(r.stdout)

# Work backwards from each NUMBER to the nearest Greek word before it, rather
# than forwards from a word to any number near it. Forwards attaches
# "(John 2:4)" to γύναι and "(chapter 15)" to ἀπεκρίθη; backwards does not,
# because in this prose a frequency is always written after its word.
NEAR = 120
WORD = re.compile(r'<span class="gk">([^<]{1,60})</span>')
# Numbers written as words, which this file could not see until 2026-09-10.
# Chapter 26 said δίδοτε occurs "once each" with διδόασιν; διδόασιν does occur
# once and δίδοτε occurs twice, and both of ITS occurrences are imperatives
# rather than the present indicative the table prints. No checker could reach
# that, because the number was spelled. The gating below is unchanged: a word
# number still has to sit in a TOTAL frame -- "occurs twice", "twice in the
# New Testament" -- to be checked at all, which is what keeps "three spellings,
# one word" out of it.
WORDNUM = {
    "once": 1, "twice": 2, "three times": 3, "four times": 4, "five times": 5,
    "six times": 6, "seven times": 7, "eight times": 8, "nine times": 9,
    "ten times": 10, "eleven times": 11, "twelve times": 12,
    "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7, "eight": 8,
    "nine": 9, "ten": 10, "eleven": 11, "twelve": 12, "thirteen": 13,
    "fourteen": 14, "fifteen": 15, "sixteen": 16, "seventeen": 17,
    "eighteen": 18, "nineteen": 19, "twenty": 20, "thirty": 30, "forty": 40,
    "fifty": 50, "sixty": 60, "seventy": 70, "eighty": 80, "ninety": 90,
    "thirty-four": 34, "twenty-two": 22, "twenty-one": 21, "twenty-four": 24,
}
_WORDS = "|".join(sorted(WORDNUM, key=len, reverse=True))
NUMBER = re.compile(r"(?<![\d:.])(\d[\d,]{1,7})(?![\d:])|\b(" + _WORDS + r")\b",
                    re.I)

# A TOTAL claim: this word occurs this often, full stop. Only these are
# decidable from a count, so only these are checked.
TOTAL_BEFORE = re.compile(r"(?:occurs?|occurring|appears?|there are|is there)\s*$", re.I)
TOTAL_AFTER = re.compile(r"^\s*(?:times|occurrences?)\b(?!\s+(?:in\s+\w+\s+)?(?:of|against))", re.I)
BARE_PAREN = re.compile(r"\(\s*$")

# A SLICE claim — "104 of the 863", "42 of them", "480 times, genitive 220" —
# counts the word inside some grammatical category. No lemma or form count
# can settle those, so they are counted and skipped, not guessed at.
SLICE_AFTER = re.compile(r"^\s*(?:of\b|are\b|were\b|belong)", re.I)

# A number that is a reference or a cross-reference, not a count at all.
REFY = re.compile(r"(chapters?|verse|John|Matthew|Mark|Luke|Acts|Romans|"
                  r"Corinthians|Thessalonians|Timothy|Peter|Hebrews|Galatians|"
                  r"Ephesians|Philippians|Revelation|James|Colossians|Titus|Jude)"
                  r"\s*[\d:\-–\s]*$", re.I)

# Totals that sit after a Greek word but belong to a different one, each with
# the reason. A short list is the point: anything not here is checked.
IGNORE = {
    (8, "ἔρχομαι", 759): "the seventeen compounds' total, not ἔρχομαι's own",
    (9, "σύ", 5466): "ἐγώ and σύ added together, as the sentence says",
    (11, "ἐκεῖνος", 1627): "οὗτος and ἐκεῖνος added together, as the sentence says",
    (12, "ἄρχομαι", 86): "ἄρχω's total; ἄρχομαι is not a separate lemma",
    (14, "ἐγενόμην", 201): "ἐγένετο's count, named next in the same sentence",
    (7, "ἦν", 455): "εἰμί's imperfect indicatives, checked as a category below",
    (8, "ἐπί", 480): "ἐπί's accusatives, a slice by case, given in the same sentence",
    (8, "κατά", 17): "the phrase καθ’ ἡμέραν, not κατά itself — and it really is "
                        "17, at Matthew 26:55, Mark 14:49, Luke 9:23, 11:3, 16:19, "
                        "19:47, 22:53, Acts 2:46, 2:47, 3:2, 16:5, 17:11, 19:9, "
                        "1 Corinthians 15:31, 2 Corinthians 11:28, Hebrews 7:27 and 10:11",
    (18, "εἷς", 232): "οὐδείς's count — the word being defined, not one of its parts",
    (18, "μή", 90): "μηδείς's count — the word being defined, not one of its parts",
    (21, "αὐτῶν", 735): "genitive participles, checked as a category below",
    (23, "τις", 144): "ὅστις's count, named at the head of the same sentence",
    (23, "ἄλλος", 100): "ἀλλήλων's count — the word being defined, not its root",
    (24, "ἄν", 331): "ἐάν's count — the word being defined, not one of its parts",
    (25, "μή", 15): "part of the phrase μὴ γένοιτο, counted as a phrase and verified separately",
}

# keyed on the normalised word, so writing μή where the text has μὴ cannot
# quietly turn an entry off
IGNORE_N = {(cid, norm(bare(w)), n): why for (cid, w, n), why in IGNORE.items()}
assert len(IGNORE_N) == len(IGNORE), "two IGNORE entries normalise the same"

claims, slices, bad = 0, 0, []
used_ignore = set()
for l in LESSONS:
    text = re.sub(r"\s+", " ", re.sub("<h3>", " </p><h3>", l["body"]))
    spans = [(m.start(), m.end(), m.group(1).strip()) for m in WORD.finditer(text)]
    masked = re.sub("<[^>]+>", lambda x: " " * len(x.group(0)), text)
    for nm in NUMBER.finditer(masked):
        if nm.group(1):
            n = int(nm.group(1).replace(",", ""))
        else:
            n = WORDNUM[nm.group(2).lower()]
        if n < 3:
            continue
        before = re.sub("<[^>]+>", " ", text[max(0, nm.start() - 60):nm.start()])
        after = re.sub("<[^>]+>", " ", text[nm.end():nm.end() + 40])
        if REFY.search(before):
            continue
        cand = [(e, w) for (b, e, w) in spans if e <= nm.start() and nm.start() - e < NEAR]
        if not cand:
            continue
        if SLICE_AFTER.match(after):
            slices += 1
            continue
        # A number in bare parentheses is this course's count idiom --
        # "ἔδωκεν (64)". A WORD in bare parentheses is a gloss: "τρεῖς,
        # τρία (three)" says what the numeral means, not how often it
        # occurs. So the paren shortcut is for digits only.
        is_total = (TOTAL_BEFORE.search(before) or TOTAL_AFTER.match(after)
                    or (BARE_PAREN.search(before) and nm.group(1)))
        if not is_total:
            slices += 1
            continue
        _, raw = cand[-1]
        words = [x for x in re.split(r"[,\s/·]+", raw)
                 if bare(x) and len(bare(x)) > 1 and not x.startswith(("-", "‑"))]
        if not words:
            continue
        keys = [(l["id"], norm(bare(w)), n) for w in words]
        if any(k in IGNORE_N for k in keys):
            used_ignore.update(k for k in keys if k in IGNORE_N)
            continue
        claims += 1
        best = None
        for w in words:
            lem, form, flatn = corpus_counts(w.strip("-‑"))
            if n in (lem, form, flatn):
                best = True
                break
            if best is None:
                best = (w, lem, max(form, flatn))
        if best is True:
            continue
        w, lem, form = best
        bad.append((l["id"], raw, n, lem, form,
                    re.sub("<[^>]+>", "", text[max(0, nm.start() - 95):nm.end() + 25])))

# An IGNORE entry is a promise that a number belongs to a different word than
# the one beside it, and the promise has to stay true. The entry for
# (5, "ἐξ", 227) said 227 was "ἐκ's count". It was not: ἐκ occurs 679 times.
# 227 was the count of the lower-case spelling of ἐξ alone, missing the seven
# sentence-initial Ἐξ -- the very fault this file's docstring says produced
# seven undercounts. So the allow-list silenced a real error for as long as
# nobody read the reason. Now an entry that stops firing has to be removed,
# which is when somebody reads it again.
_bodies = {l["id"]: re.sub("<[^>]+>", " ", l["body"]) for l in LESSONS}


def _still_there(cid, n):
    """Is that number anywhere in that chapter any more? An entry can stop
       firing because the sentence was reworded into a slice rather than a
       total, which is not the same as the claim having gone."""
    body = _bodies.get(cid, "")
    return re.search(r"\b%s\b" % format(n, ","), body) or         re.search(r"\b%d\b" % n, body)


stale = sorted(k for k in set(IGNORE_N) - used_ignore
               if not _still_there(k[0], k[2]))

print("total-frequency claims checked: %d" % claims)
print("slice claims left to reading:   %d" % slices)
print("claims the corpus does not bear out: %d" % len(bad))
for cid, w, n, lem, form, ctx in bad:
    print("   ch%-3d %-14s claims %-6d corpus: lemma %-6d form %-6d" % (cid, w, n, lem, form))
    print("        …%s…" % ctx.strip())

print()
print("numbers excused by IGNORE: %d of %d entries fired"
      % (len(used_ignore), len(IGNORE_N)))
if stale:
    print("IGNORE ENTRIES THAT NO LONGER MATCH ANYTHING: %d" % len(stale))
    for cid, w, n in stale:
        print("   ch%-3d %-12s %-7d %s" % (cid, w, n, IGNORE_N[(cid, w, n)]))
    print("   The prose has moved. Remove the entry, or find out why it "
          "stopped firing before you assume it is harmless.")

print()
print("category claims checked: %d" % len(CATEGORY_CLAIMS))
cbad = []
for cid, key, n in CATEGORY_CLAIMS:
    got = CATEGORY[key]()
    if got != n:
        cbad.append((cid, key, n, got))
print("category claims the corpus does not bear out: %d" % len(cbad))
for cid, key, n, got in cbad:
    print("   ch%-3d %-42s claims %-7d corpus %d" % (cid, key, n, got))

sys.exit(1 if bad or cbad else 0)

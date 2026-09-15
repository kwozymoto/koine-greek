# -*- coding: utf-8 -*-
"""data/terms.js — the grammar words the app explains — against the app.

    python tools/check_terms.py

WHY THIS EXISTS. Chapter 2 was rewritten because it "used words/terms that
haven't been explained. What's a participle, a paradigm, what does infinitive
mean? Too much assumed knowledge." A glossary answers that once. Nothing
stops it drifting out of step with the chapters afterwards, and drift here is
invisible: the page still renders, the definitions still read well, and the
one word a reader is stuck on is the one nobody added.

So this asks four things, and the two that matter run in opposite directions.

  1. NO DEAD ENTRIES. Every term is one the app actually uses, somewhere a
     reader can meet it — a chapter body, a quiz, or a reference table. A
     content audit asked for anaphoric, suppletive, substantive, copula and
     concord; the app uses none of the five, and explaining a word nobody
     meets is padding that makes the real entries harder to find.

  2. NO UNEXPLAINED JARGON. This is the guard that chapter 2 needed. WATCH
     below lists the words a first-year reader has no reason to know. If the
     app uses one of them and this file does not explain it, the run fails.
     Adding jargon to a chapter now costs a glossary entry, which is the
     price it should have cost all along.

  3. THE CHAPTER NUMBERS ARE TRUE. Each entry names the chapter that teaches
     the word — aorist is chapter 7, "Imperfect and aorist active indicative"
     — and a rewritten chapter can quietly falsify that. What is mechanical
     is whether that chapter uses the word at all, and that is what is
     checked. See the note beside the test for why it is not "the first
     chapter that mentions it": that rule sent readers to the alphabet
     chapter to learn the genitive.

  4. NO INVENTED GREEK. Every Greek word in a definition or example has to
     occur in the New Testament. The examples deliberately avoid the λύω
     teaching paradigm — λέλυκα, λύειν, λύων and ἔλυον occur nowhere in the
     text, and a glossary is the wrong place to show a form the reader will
     never meet.

  5. EVERY DEFINITION HAS BEEN PUT TO A GRAMMAR. This file shipped with the
     sign-off "sixty-eight definitions need a reader", which was wrong on the
     repo's own terms: CLAUDE.md says "'Needs a grammar' is not a terminal
     state and is not a question for Fraser. Open the book." Huffman and Black
     are on the shelf, and opening them changed twelve of the sixty-eight.
     docs/term-sources.json holds the verdict, the passage, and a digest of
     the definition it was reached about, so that rewriting a definition puts
     it back to unreviewed.

What it still cannot do is judge a definition a grammar does not cover, or
catch one that quotes its source accurately and explains it badly. The file is
short enough to read in one sitting for that reason.
"""
import collections, hashlib, io, json, os, re, subprocess, sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
sys.path.insert(0, os.path.join(ROOT, "tools"))
import corpus
from corpus import fold, bare

GK = re.compile(r"[Ͱ-Ͽἀ-῿]+")


def load(files, names):
    js = ("const fs=require('fs'),vm=require('vm');const c=vm.createContext({});"
          + "".join("vm.runInContext(fs.readFileSync(%r,'utf8'),c);" % f
                    for f in files)
          + "process.stdout.write(vm.runInContext('JSON.stringify({%s})',c));"
          % ",".join(names))
    r = subprocess.run(["node", "-e", js], capture_output=True, text=True,
                       encoding="utf-8")
    if r.returncode:
        sys.exit("could not load the app data:\n" + (r.stderr or ""))
    return json.loads(r.stdout)


D = load(["data/terms.js", "data/lessons.js", "data/paradigms.js"],
         ["TERMS", "LESSONS", "PARADIGMS"])
TERMS, LESSONS, PARADIGMS = D["TERMS"], D["LESSONS"], D["PARADIGMS"]

# The words a first-year reader has no reason to know. Any of these the app
# uses must be explained in data/terms.js. Add to this list when a chapter
# reaches for a new piece of jargon — that is what it is for.
WATCH = [
    "anarthrous", "antecedent", "aorist", "apodosis", "aspect", "athematic",
    "attendant circumstance", "attributive", "augment", "conjugation",
    "contract verb", "declension", "deponent", "distributive", "enclitic",
    "genitive absolute", "imperfective", "indicative", "infinitive",
    "interjection", "liquid verb", "optative", "paradigm", "participle",
    "particle", "perfective", "pluperfect", "predicate", "principal parts",
    "protasis", "reduplication", "stative", "subjunctive", "substantival",
    "unmarked", "vocative",
]

# Words on the watch list that the app is allowed to use without an entry,
# each with the reason. An allow-list rather than a silent exception, so
# anything new in it has to be argued for.
# Empty, and worth keeping empty. The one entry it ever held was "marked",
# excused because the glossary filed it under "unmarked" -- and the honest fix
# was to watch the word the glossary actually uses, not to excuse the mismatch.
EXCUSED = {}


def visible(html):
    """The prose a reader sees, with the markup taken out."""
    return re.sub("<.*?>", " ", html or "")


def chapter_text(L):
    blob = visible(L.get("body", ""))
    for q in L.get("quiz", []) or []:
        blob += " " + " ".join(
            str(x) for x in [q.get("q", "")] + list(q.get("o", []) or [])
            + [q.get("w", "")])
    return blob.lower()


CHAPTER = {L["id"]: chapter_text(L) for L in LESSONS}
TABLES = " ".join(p["t"] + " " + p.get("tags", "") + " " + visible(p["html"])
                  for p in PARADIGMS).lower()


def pattern(term):
    """A word-boundary match that tolerates a plural and a hyphen or space."""
    return r"\b" + re.escape(term).replace(r"\ ", "[ -]") + r"(s|es)?\b"


def first_chapter(term):
    pat = pattern(term)
    for cid in sorted(CHAPTER):
        if re.search(pat, CHAPTER[cid]):
            return cid
    return 0


def used_anywhere(term):
    pat = pattern(term)
    return (first_chapter(term) != 0) or bool(re.search(pat, TABLES))


bad = []

# ---- shape ---------------------------------------------------------------
seen = {}
for i, row in enumerate(TERMS):
    if len(row) != 4:
        bad.append("TERMS[%d] has %d fields, not four — term, meaning, "
                   "example, chapter" % (i, len(row)))
        continue
    term, meaning, eg, ch = row
    if not isinstance(term, str) or not term:
        bad.append("TERMS[%d] has no term" % i)
        continue
    if term in seen:
        bad.append("%r appears twice, at %d and %d" % (term, seen[term], i))
    seen[term] = i
    if term != term.lower():
        bad.append("%r should be lower case; the list is searched that way" % term)
    if not meaning or len(meaning) < 20:
        bad.append("%r has no real definition" % term)
    if not isinstance(ch, int) or ch < 0:
        bad.append("%r has a chapter of %r" % (term, ch))

order = [r[0] for r in TERMS if len(r) == 4]
if order != sorted(order):
    wrong = next((a for a, b in zip(order, sorted(order)) if a != b), "?")
    bad.append("the list is not in alphabetical order — %r is out of place. "
               "It is read by people browsing it, not only searched." % wrong)

# ---- 1. no dead entries --------------------------------------------------
dead = [t for t in seen if not used_anywhere(t)]
for t in dead:
    bad.append("%r is explained here and used nowhere in the app. A word no "
               "reader meets here does not need an entry here." % t)

# ---- 2. no unexplained jargon -------------------------------------------
missing = []
for w in WATCH:
    if w in seen or w in EXCUSED:
        continue
    if used_anywhere(w):
        where = first_chapter(w)
        missing.append("%r is used by the app (%s) and explained nowhere"
                       % (w, "chapter %d" % where if where else "a reference table"))
bad += missing

# ---- 3. the chapter numbers ---------------------------------------------
# The number is THE CHAPTER THAT TEACHES THE WORD, taken from the chapter
# titles — aorist is chapter 7, "Imperfect and aorist active indicative".
#
# It used to be the first chapter that uses the word, derived here, and that
# was worse than no number at all. Chapter 1 is the alphabet, and in passing
# it says the iota subscript "usually signals the dative case" and offers
# Dative / Nominative / Genitive / Accusative as quiz options — so the
# glossary sent a reader to the chapter about letters to learn the genitive,
# the nominative, the accusative and the subjunctive. The obvious repair,
# the chapter that uses the word most, puts aspect in chapter 25 over
# chapter 2, and chapter 2 is "The Greek verbal system". Neither rule knows
# what a chapter is about.
#
# What is still mechanical, and is what goes stale when a chapter is
# rewritten, is whether that chapter uses the word at all.
for term, meaning, eg, ch in (r for r in TERMS if len(r) == 4):
    if ch == 0:
        if used_anywhere(term) and first_chapter(term):
            bad.append("%r is marked as belonging to no chapter, but chapter "
                       "%d uses it" % (term, first_chapter(term)))
        continue
    if ch not in CHAPTER:
        bad.append("%r names chapter %d, which does not exist" % (term, ch))
    elif not re.search(pattern(term), CHAPTER[ch]):
        bad.append("%r is said to be taught in chapter %d, and that chapter "
                   "never uses the word" % (term, ch))

# ---- 4. no invented Greek ------------------------------------------------
man = corpus.manifest()
FORMS = set()
for b in man["books"]:
    for c in corpus.book(b["a"])["c"]:
        for vs in c:
            for w in vs[1]:
                FORMS.add(fold(bare(w[0])))

# The deck's own citation forms count as attested, because something else
# already checks them. A contract verb is the reason: ἀγαπάω is the form every
# lexicon and every vocabulary card gives, and the one form the New Testament
# never writes — the contraction is the whole point of the entry explaining it.
DECK = {fold(bare(v[0].split(",")[0])) for v in load(["data/vocab.js"], ["VOCAB"])["VOCAB"]}

greek = collections.Counter()
for term, meaning, eg, _ch in (r for r in TERMS if len(r) == 4):
    for word in GK.findall(meaning + " " + (eg or "")):
        # One and two letters is a letter or an ending being named, not a word:
        # the -οι- of an optative, the ἐ- of an augment, the λ μ ν ρ a liquid
        # verb ends in. The corpus has nothing to say about those, and the
        # alphabet is check_keys's business.
        if len(word) <= 2:
            continue
        greek[word] += 1
        if fold(bare(word)) not in FORMS and fold(bare(word)) not in DECK:
            bad.append("%r shows %s, which occurs nowhere in the New Testament "
                       "and is not a headword in the deck either" % (term, word))

# ---- 5. every definition has been put to a grammar -----------------------
# The glossary shipped with the sign-off "sixty-eight definitions need a
# reader", and that was wrong on this repo's own terms. CLAUDE.md: "'Needs a
# grammar' is not a terminal state and is not a question for Fraser. Open the
# book." A definition of a grammatical term is not free prose — it is a claim
# Huffman or Black settles, and both are on the shelf. Opening them changed
# twelve of the sixty-eight.
#
# docs/term-sources.json records what settled each one, and carries a digest
# of the definition the verdict was reached about. Edit the definition and the
# digest stops matching, which puts the entry back to unreviewed — check_prose's
# rule, that a changed claim is an unverified claim, applied here.
SOURCES = "docs/term-sources.json"
try:
    REC = json.load(io.open(SOURCES, encoding="utf-8"))
except Exception as e:
    REC = None
    bad.append("%s could not be read: %s" % (SOURCES, e))

if REC is not None:
    VERDICTS = ("verified", "corrected", "general")
    for term, meaning, eg, ch in (r for r in TERMS if len(r) == 4):
        r = REC.get(term)
        if not r:
            bad.append("%r has no entry in %s. Every definition is put to "
                       "Huffman or Black, or recorded as ordinary grammatical "
                       "English." % (term, SOURCES))
            continue
        if r.get("verdict") not in VERDICTS:
            bad.append("%r is %r in %s — it has not been settled"
                       % (term, r.get("verdict"), SOURCES))
        want = hashlib.sha1(meaning.encode("utf-8")).hexdigest()[:12]
        if r.get("def") != want:
            bad.append("%r has been REWRITTEN since it was checked against %s. "
                       "A changed definition is an unchecked definition: open "
                       "the book again, then put %s in its record."
                       % (term, r.get("source") or "a source", want))
        if r.get("verdict") in ("verified", "corrected") and not r.get("settles"):
            bad.append("%r is marked %s and does not say what the source "
                       "settles" % (term, r["verdict"]))
        # The record cites the grammars; it must never carry them. The first
        # version of this file held the passages themselves -- 18,338
        # characters of Huffman and Black, in a public repository. CLAUDE.md
        # draws that line twice: the books are read-only and "never copied in",
        # and copyrighted text "cannot ship inside the app, however it left
        # Logos". A citation and a statement of the fact in our own words are
        # what a later reader needs to open the same page.
        if len(r.get("settles", "")) > 400:
            bad.append("%r summarises its source in %d characters. That is long "
                       "enough to be the passage rather than a summary of it, "
                       "and the books do not go in the repo."
                       % (term, len(r["settles"])))
    for term in REC:
        if term not in seen:
            bad.append("%s still has a record for %r, which is not a term any "
                       "more" % (SOURCES, term))

# ---- report --------------------------------------------------------------
if REC:
    by = collections.Counter(r.get("verdict") for r in REC.values())
    print("definitions put to a grammar:     %d verified, %d corrected by one, "
          "%d ordinary grammatical English"
          % (by["verified"], by["corrected"], by["general"]))
print("grammar words explained:          %d" % len(TERMS))
print("jargon on the watch list:         %d, of which %d are used by the app"
      % (len(WATCH), sum(1 for w in WATCH if used_anywhere(w))))
print("Greek words shown, all attested:  %d" % len(greek))
print("chapters reached by these terms:  %d"
      % len({first_chapter(t) for t in seen} - {0}))

if bad:
    print("\nTHE GLOSSARY AND THE APP DISAGREE: %d" % len(bad))
    for b in bad:
        print("   " + b)
    sys.exit(1)
print("\nevery term is one the app uses, every watched word is explained, "
      "and every chapter named does use the word it is given")

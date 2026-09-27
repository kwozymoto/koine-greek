# -*- coding: utf-8 -*-
"""Mounce's chapter vocabulary, read out of the book itself.

    python tools/build_mounce.py            # derive, reconcile, report
    python tools/build_mounce.py --write    # and write data/textbooks.js

WHY. A class using Mounce, *Basics of Biblical Greek Grammar* (4th ed.), wants
each chapter's words in the order of its own book. Nothing in the corpus
knows which chapter a word belongs to, so the only source is the book — and
the book is not in this repository and never will be. It lives in
../Greek App Reference/Mounce/, the way Black does for check_black.

TWO READINGS THAT DO NOT DEPEND ON EACH OTHER, and every word must satisfy
both:

  1. THE LEXICON. Mounce writes that each definition "is followed by its
     frequency in the New Testament, its chapter in BBG if applicable". It
     carries exactly 319 "chpt N" marks, the number of words the book says it
     teaches (313 occurring fifty times or more, plus six). Each mark is an
     anchor; five of them are printed irregularly.
  2. EACH CHAPTER'S PRINTED VOCABULARY LIST, read from its heading to the
     section that follows a list, inside chapter spans taken from the bare
     "Chapter N" openers.

A lexicon word is accepted only when its chapter's printed list contains it.
A word on a printed list that the lexicon gives no chapter must be named in
ON_LIST below, with the reason, or the build stops. An earlier all_chapters.csv
in that folder was made by another agent from the same PDF; it is not read.

THE EXTRACTION IS HOSTILE, and each trap below cost a wrong answer once:

  * A capital's breathing is a SPACING mark before it (U+1FBF, U+1FFE).
  * Μωϋσῆς carries a Latin ü, οὐδείς a Latin o.
  * Acutes are mixed tonos and oxia. grep does not fold them; this does.
  * Pages come out of order: chapter 8's list is split by a whole page of its
    own Exegetical Insight and resumes at ἵνα — so a heading that belongs at
    the START of a chapter must not be taken for the end of a list.
  * Chapter 10's list is extracted twice.
  * χαίρω is printed "*χαίρω *χαρ (74)", with a leading asterisk.
  * A frequency is printed "(175)", "(29; interjection)" or "(54, adverb)".
  * In the lexicon a verb's principal parts FOLLOW its closer, so the text
    between two closers is "previous verb's parts, this headword, gloss".
    The headword starts the comma-joined run before the gloss; a bare dash
    is a missing tense, never part of a headword; "or" between two forms
    belongs to the parts; ἔρημος's closer is a bare "(48)".
  * λέγω is printed again in chapter 16 with its tense forms. It is
    INTRODUCED in chapter 8, which both readings agree on.

Before concluding the book cannot be parsed, check that the parser is not
the thing at fault — every "missing word" above was a parser, not the book.
"""
import argparse, collections, io, json, os, re, shutil, subprocess, sys, unicodedata

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOOK = os.path.join(os.path.dirname(ROOT), "Greek App Reference", "Mounce",
                    "Basics Of Biblical Greek Grammar - Fourth Edition.pdf")
OUT = os.path.join(ROOT, "data", "textbooks.js")
CORE_TOTAL = 319                 # "These 319 words", chapter 4
OPTIONAL = {35}                  # "words you can learn if you wish"

G = "\u0370-\u03ff\u1f00-\u1fff"
CAPV = "\u0391\u0395\u0397\u0399\u039f\u03a5\u03a9"

# Printed in a chapter's list, but given no chapter in the lexicon.
ON_LIST = {
    ("ἦν", 8): "Taught with εἰμί as 'he/she/it was'; the lexicon files it "
               "under no chapter.",
    ("δείκνυμι", 36): "Completes the μι verbs: 'The other six μι verbs are "
                     "listed in this vocabulary … you should learn them.' "
                     "At 30 occurrences it is outside the 319.",
}

# ---------------------------------------------------------------- deck ----
# Placed by hand, each with its reason. The checker holds every one.
REDIRECT = {"τέ": ("τε", "Mounce cites the enclitic with an accent. #237 τέ "
                         "is RETIRED as a duplicate of τε and is never a target.")}
COVERED = {"ἄρχομαι": ("ἄρχω", "ἄρχω is glossed 'I rule; (middle) I begin', "
                               "which is the sense taught here.")}
# Forms Mounce teaches as words of their own, which the corpus — and so the
# deck — files under another lemma. Mapping them to that card would teach
# ἡμεῖς "we" as ἐγώ "I", so they are shown as words to learn from the book,
# naming the card that holds them. The meanings are written here, and are
# the one piece of English in this file that no checker can judge.
BOOK_ONLY = {
    "ἡμεῖς": ("we", "ἐγώ", "the plural of"),
    "ὑμεῖς": ("you (plural)", "σύ", "the plural of"),
    "εἶπεν": ("he, she, it said", "λέγω", "a form of"),
    "ἦν": ("he, she, it was", "εἰμί", "a form of"),
    "πλείων": ("more", "πολύς", "the comparative of"),
    "μείζων": ("greater", "μέγας", "the comparative of"),
}


def fix(s):
    """The four encoding traps, folded so a word compares as itself."""
    s = unicodedata.normalize("NFD", s)
    s = re.sub("\u1fbf([" + CAPV + "])", lambda m: m.group(1) + "\u0313", s)
    s = re.sub("\u1ffe([" + CAPV + "])", lambda m: m.group(1) + "\u0314", s)
    s = unicodedata.normalize("NFC", s).replace("\u00fc", "\u03cb")
    s = re.sub(r"(?<![A-Za-z])o(?=[" + G + "])", "\u03bf", s)
    return unicodedata.normalize("NFC", s)


def g2a(s):
    """Grave to acute and nothing else — the matching rule this repo learned
    four times over."""
    return unicodedata.normalize("NFC", unicodedata.normalize("NFD", s).replace("\u0300", "\u0301"))


def pdftotext():
    for c in [shutil.which("pdftotext"), r"C:\Program Files\Git\mingw64\bin\pdftotext.exe",
              "/mingw64/bin/pdftotext"]:
        if c and os.path.exists(c):
            return c
    return None


def book_available():
    """(ok, reason). The book and the extractor are both outside the repo."""
    if not os.path.isfile(BOOK):
        return False, "the Mounce PDF is not on this machine (%s)" % BOOK
    if not pdftotext():
        return False, "pdftotext is not installed (it comes with Git for Windows' mingw64)"
    return True, ""


def extract():
    """The book as lines, in the extractor's -raw reading order."""
    exe = pdftotext()
    r = subprocess.run([exe, "-enc", "UTF-8", "-raw", BOOK, "-"], capture_output=True)
    if r.returncode != 0 or not r.stdout:
        sys.exit("pdftotext failed on the Mounce PDF:\n" + r.stderr.decode("utf-8", "replace"))
    return r.stdout.decode("utf-8").replace("\x0c", "\n").split("\n")


# ------------------------------------------------------------- lexicon ----
def lexicon(raw):
    """Every entry the lexicon gives a BBG chapter: 319 of them."""
    start = next(n for n, l in enumerate(raw) if l.strip().startswith("This lexicon includes all the words"))
    end = next(n for n in range(start, len(raw)) if raw[n].strip() == "Index")
    body = [l for l in raw[start:end] if not re.match(r"^\s*(Appendix\. Lexicon|Lexicon|\d+)\s*$", l)]
    S = fix(" ".join(l.strip() for l in body))
    # Page furniture carries English, which would read as a gloss mid-entry.
    S = re.sub(r"\b\d{3} Basics of Biblical Greek(?: Grammar)?\b", " ", S)
    S = re.sub(r"\bBasics of Biblical Greek(?: Grammar)? \d{3}\b", " ", S)
    S = re.sub(r"\bAppendix\. Lexicon\b", " ", S)
    S = S[S.index("ἄλφα"):]                      # the first entry, past the introduction

    bounds = []
    for m in re.finditer(r"\((\d{1,2},\d{3}|\d{1,4})(?:, ([^()]*?))?\)", S):
        if m.group(2) and "chpt" in m.group(2):
            continue                              # taken below, by its anchor
        bounds.append((m.start(), m.end(), None, int(m.group(1).replace(",", ""))))
    for m in re.finditer(r"chpt\s*(\d+)", S):
        o, c = S.rfind("(", 0, m.start()), S.find(")", m.end())
        f = re.findall(r"(\d{1,2},\d{3}|\d{1,4})", S[o:m.start()])
        bounds.append((o, c + 1, int(m.group(1)), int(f[-1].replace(",", "")) if f else None))
    bounds.sort()

    greek = lambda t: bool(re.search("[" + G + "]", t)) or t.startswith("\u2013")
    latin = lambda t: bool(re.search("[A-Za-z]", t))
    bare_dash = lambda t: t.rstrip(",") == "\u2013"
    out, prev = [], 0
    for o, c, ch, freq in bounds:
        toks = S[prev:o].split()
        prev = c
        if not ch:
            continue
        def glossy(i):
            t = toks[i]
            if not latin(t) or i == 0 or not greek(toks[i - 1]):
                return False
            return not (t == "or" and i + 1 < len(toks) and greek(toks[i + 1]))
        g = next((i for i in range(len(toks)) if glossy(i)), None)
        if g is None:
            out.append({"head": None, "ch": ch, "freq": freq, "seg": " ".join(toks)[:70]})
            continue
        k = g - 1
        if toks[k].startswith("(") or (toks[k].endswith(")") and "(" not in toks[k][1:]):
            while k > 0 and not toks[k].startswith("("):
                k -= 1
            k -= 1                                # off the bracketed elided form
        while (k > 0 and toks[k - 1].endswith(",") and greek(toks[k - 1])
               and not bare_dash(toks[k - 1])):
            k -= 1
        hw = re.sub(r"[^" + G + r"\u0300-\u036f]", "", toks[k])
        out.append({"head": hw, "ch": ch, "freq": freq})
    return out


# ------------------------------------------------------------ sections ----
def sections(raw):
    """Chapter -> [(headword, frequency)] in the order the chapter prints them."""
    L = [fix(l).strip() for l in raw]
    first = {}
    for n, l in enumerate(L):
        m = re.match(r"^Chapter (\d+)$", l)
        if not m:
            continue
        nxt = [x for x in L[n + 1:n + 40] if x]
        stop = next((i for i, x in enumerate(nxt) if re.match(r"^Chapter \d+$", x)), len(nxt))
        if any(x in ("Overview", "Exegetical Insight") for x in nxt[:stop]):
            first.setdefault(int(m.group(1)), n)
    last = max(first)
    body_end = next(n for n in range(first[last], len(L)) if L[n].startswith("Appendix."))
    starts = sorted((n, c) for c, n in first.items())
    span = {c: (n, starts[i + 1][0] if i + 1 < len(starts) else body_end) for i, (n, c) in enumerate(starts)}

    ENDS = {"Previous Words", "Advanced Information", "Halftime Review"}
    FREQ = re.compile(r"\((\d{1,2},\d{3}|\d{1,4})[;,)]")
    START = re.compile(r"^\*?[\u200a ]?[" + G + "]")
    out = {}
    for c, (a, b) in sorted(span.items()):
        vh = [n for n in range(a, b) if L[n] == "Vocabulary"]
        if not vh:
            continue
        end = next((n for n in range(vh[0] + 1, b) if L[n] in ENDS), b)
        seen, words = set(), []
        for n in range(vh[0] + 1, end):
            l = L[n]
            if not START.match(l):
                continue
            f = FREQ.search(l)
            toks = l.lstrip("*\u200a ").split()
            wraps = len(toks) > 1 and re.match(r"^[A-Za-z]", toks[1])
            k = n
            while not f and wraps and k + 1 < min(n + 4, end) and not START.match(L[k + 1]):
                k += 1
                f = FREQ.search(L[k])
            if not f:
                continue
            hw = re.sub(r"[^" + G + r"\u0300-\u036f]", "", toks[0].rstrip(","))
            if hw in seen:
                continue
            seen.add(hw)
            words.append((hw, int(f.group(1).replace(",", ""))))
        out[c] = words
    return out


def titles(raw):
    """Each chapter's title from its running header, the one line that holds
    it whole ("Chapter 8. Prepositions and εἰμί")."""
    got = collections.defaultdict(collections.Counter)
    for l in raw:
        m = re.match(r"^Chapter (\d+)\. (.+?)\s*\d*$", fix(l).strip())
        if m:
            got[int(m.group(1))][m.group(2).strip()] += 1
    return {c: n.most_common(1)[0][0] for c, n in got.items()}


# ----------------------------------------------------------- reconcile ----
def derive(raw=None):
    """The chapters, each word held to both readings. Returns (chapters, problems)."""
    raw = raw if raw is not None else extract()
    lex, sec, tit = lexicon(raw), sections(raw), titles(raw)
    problems = []
    if len(lex) != CORE_TOTAL:
        problems.append("the lexicon gave %d chapter words, not %d" % (len(lex), CORE_TOTAL))
    if any(e["head"] is None for e in lex):
        problems += ["lexicon entry with no headword: ch%s %s" % (e["ch"], e.get("seg", ""))
                     for e in lex if e["head"] is None]
    dup = [h for h, n in collections.Counter(e["head"] for e in lex).items() if n > 1]
    if dup:
        problems.append("headwords given a chapter twice in the lexicon: %s" % dup)
    lexch = {e["head"]: e["ch"] for e in lex if e["head"]}

    chapters = {}
    for c, words in sorted(sec.items()):
        keep = []
        for hw, f in words:
            if c in OPTIONAL:
                keep.append(hw)
            elif lexch.get(hw) == c:
                keep.append(hw)                    # both readings agree
            elif hw in lexch:
                pass                               # a re-listing: λέγω in 16
            elif (hw, c) in ON_LIST:
                keep.append(hw)
            else:
                problems.append("ch%d prints %s, which the lexicon gives no chapter "
                                "and ON_LIST does not name" % (c, hw))
        chapters[c] = {"t": tit.get(c, ""), "words": keep, "optional": c in OPTIONAL}
    for h, c in lexch.items():
        if h not in chapters.get(c, {}).get("words", []):
            problems.append("the lexicon puts %s in chapter %d, whose printed list "
                            "does not have it" % (h, c))
    for (h, c) in ON_LIST:
        if h not in chapters.get(c, {}).get("words", []):
            problems.append("ON_LIST names %s in chapter %d, which no longer prints it" % (h, c))
    return chapters, problems


def load_deck():
    js = ("const fs=require('fs'),vm=require('vm');const c=vm.createContext({});"
          "vm.runInContext(fs.readFileSync('data/vocab.js','utf8'),c);"
          "process.stdout.write(vm.runInContext('JSON.stringify(VOCAB.map(v=>v[0]))',c));")
    r = subprocess.run(["node", "-e", js], capture_output=True, text=True, encoding="utf-8", cwd=ROOT)
    if r.returncode:
        sys.exit("could not load data/vocab.js:\n" + r.stderr)
    return json.loads(r.stdout)


RETIRED = {237}


def place(chapters, deck):
    """Each chapter's words as deck positions, plus the words to learn from
    the book. Returns (textbook, problems)."""
    by = collections.defaultdict(list)
    for i, hw in enumerate(deck):
        if i not in RETIRED:
            by[g2a(hw.split(",")[0].strip())].append(i)
    one = lambda h: by.get(g2a(h), [])
    problems, rows = [], []
    for c, ch in sorted(chapters.items()):
        v, only = [], []
        for h in ch["words"]:
            if h in REDIRECT or h in COVERED:
                host = (REDIRECT.get(h) or COVERED.get(h))[0]
                hits = one(host)
            elif h in BOOK_ONLY:
                meaning, host, rel = BOOK_ONLY[h]
                hits = one(host)
                if len(hits) != 1:
                    problems.append("%s: its host card %s is not exactly one live card" % (h, host))
                    continue
                only.append([h, meaning, hits[0], rel])
                continue
            else:
                hits = one(h)
            if len(hits) == 1:
                if hits[0] in v:
                    problems.append("ch%d: %s lands on #%d twice" % (c, h, hits[0]))
                v.append(hits[0])
            elif ch["optional"] and not hits:
                only.append([h, "", None, ""])     # optional, and not in the deck
            else:
                problems.append("ch%d: %s matches %d live cards; name it in REDIRECT, "
                                "COVERED or BOOK_ONLY" % (c, h, len(hits)))
        rows.append({"ch": c, "t": ch["t"], "v": v, "only": only, "optional": ch["optional"]})
    seen = collections.Counter(i for r in rows for i in r["v"])
    problems += ["#%d (%s) is taught in more than one chapter" % (i, deck[i]) for i, n in seen.items() if n > 1]
    return rows, problems


HEADER = '''/* Chapter vocabulary from other textbooks, so a class can learn each
   chapter's words in the order of its own book. Vocabulary only: lessons,
   paradigms and Today's reading stay on Black.

   GENERATED by tools/build_mounce.py from the book itself and held by
   tools/check_mounce.py. Never edit by hand. Each chapter's `v` is deck
   positions in the order the chapter prints them; `only` is words the book
   teaches that the deck files under another card, as
   [word, meaning, host card, how it relates] — or, in an optional chapter,
   a word the deck does not have at all.

   Mounce, Basics of Biblical Greek Grammar, 4th ed. — every core word here
   is confirmed twice over: by the chapter Mounce's lexicon gives it and by
   that chapter's printed list. Chapter 35 is his optional list. */
'''


def black_shift():
    """The app chapters whose number differs from Black's, from tools/blackmap.py,
       so the look-up card names the chapter of Black's book and not the app's.
       One place holds the divergence; this only copies it out."""
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from blackmap import _SHIFT
    diff = sorted((a, b) for a, b in _SHIFT.items() if a != b)
    return ("\n/* App chapter -> Black's chapter, where the two differ (tools/blackmap.py). */\n"
            "const BLACK_OF_APP = {%s};\n" % ", ".join("%d:%d" % kv for kv in diff))


def render(rows):
    body = ",\n".join(
        "    {ch:%d, t:%s, v:[%s], only:%s%s}" % (
            r["ch"], json.dumps(r["t"], ensure_ascii=False), ",".join(map(str, r["v"])),
            json.dumps(r["only"], ensure_ascii=False), ", optional:true" if r["optional"] else "")
        for r in rows)
    return (HEADER + "const TEXTBOOKS = {\n  mounce: {\n"
            '    name: "Mounce", title: "Basics of Biblical Greek", edition: "4th ed.",\n'
            "    chapters: [\n" + body.replace("\n    {", "\n      {").replace("    {ch", "      {ch", 1) +
            "\n    ]\n  }\n};\n" + black_shift())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--write", action="store_true")
    a = ap.parse_args()
    ok, why = book_available()
    if not ok:
        sys.exit("cannot build: " + why)
    chapters, p1 = derive()
    rows, p2 = place(chapters, load_deck())
    core = sum(len(r["v"]) + len(r["only"]) for r in rows if not r["optional"])
    print("chapters:            %d  (%d optional)" % (len(rows), sum(r["optional"] for r in rows)))
    print("core words placed:   %d on cards, %d from the book" % (
        sum(len(r["v"]) for r in rows if not r["optional"]),
        sum(len(r["only"]) for r in rows if not r["optional"])))
    print("optional words:      %d on cards, %d not in the deck" % (
        sum(len(r["v"]) for r in rows if r["optional"]),
        sum(len(r["only"]) for r in rows if r["optional"])))
    problems = p1 + p2
    if problems:
        print("\nTHE BOOK AND THE DECK DO NOT RECONCILE: %d" % len(problems))
        for p in problems:
            print("   " + p)
        sys.exit(1)
    if a.write:
        io.open(OUT, "w", encoding="utf-8", newline="\n").write(render(rows))
        print("wrote %s" % os.path.relpath(OUT, ROOT))


if __name__ == "__main__":
    main()

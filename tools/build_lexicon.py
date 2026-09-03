# -*- coding: utf-8 -*-
"""A gloss for every word in the Greek New Testament.

    python tools/build_lexicon.py            # fetches the sources if needed
    python tools/build_lexicon.py --report   # what it would do, writing nothing

The Read tab says "tap any word for its parsing and meaning". The parsing was
always there; the meaning was not. data/gnt/manifest.json carries a gloss only
for the 509 lemmas the course itself teaches — 9.3% of the corpus — because
that table is built from data/vocab.js by tools/build_gloss_map.py. Tap
anything else and you got a parse and a lemma and no idea what it meant.

This fills the rest from two free lexicons, and writes data/lexicon.js.

WHY TWO, AND IN THIS ORDER.

  TBESG — Translators Brief lexicon of Extended Strongs for Greek, from
  STEPBible at Tyndale House, Cambridge, CC BY 4.0. Its own header says it is
  "based on the Abbott-Smith definitions", so what it carries is
  G. Abbott-Smith, A Manual Greek Lexicon of the New Testament (T&T Clark,
  1922), corrected by Tyndale House scholars. Unicode headwords, modern
  English, and it covers 4,720 of the lemmas the deck does not.

  Dodson — Jeff Dodson's public-domain lexicon of the Greek NT. Beta code,
  and the English is of its period: διό reads "wherefore", ὅστις
  "whosoever", and ἐργάζομαι carries a typo, "I word, trade, do". Used only
  where TBESG has nothing, which is 76 lemmas.

WHAT THIS NEVER DOES. It never writes a gloss for a lemma the deck already
teaches. Those 509 were checked by hand against the corpus and are better:
where the two disagree, the deck says "but, and, now" for δέ and TBESG says
"then". LEX simply has no entry for them, so the precedence is structural
rather than a rule someone has to remember. tools/check_lexicon.py fails if
one ever appears.

MATCHING. Exact first, always — the same discipline as everywhere else in
this repo, because prefix matching is what once put "worthy" on ἀξίνη. Only
when the exact match fails are three specific variants tried, each of them a
known difference in how MorphGNT and a lexicon spell the same headword:

  * a bracketed optional consonant — μέχρι(ς) against μέχρι
  * a deponent listed in its middle form — προσκαλέομαι against προσκαλέω
  * an accent-only difference

That resolves 196 lemmas which otherwise look absent. Every one is written to
docs/lexicon-changes.md so the whole list can be read rather than trusted.

ONE VOICE ON VERBS. TBESG cites a verb as "to work"; this course cites it as
"I work", because that is how the deck's own 509 read and two conventions in
one lookup box is worse than either. 1,339 glosses are rewritten, and every
one belongs to a lemma the corpus tags V- as its commonest reading. CC BY
requires a note of changes, so that file lists them too.

LICENCE. TBESG is CC BY 4.0: "Data created by www.STEPBible.org based on work
at Tyndale House Cambridge". Dodson is public domain. Both are credited in
the app's Help screen and in the README, and the source of every gloss is
recorded in docs/lexicon-changes.md.
"""
import collections, csv, io, json, os, re, sys, unicodedata, urllib.request

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GNT = os.path.join(ROOT, "data", "gnt")
CACHE = os.path.join(ROOT, "tools", "_sources")
REPORT = "--report" in sys.argv

TBESG_URL = ("https://raw.githubusercontent.com/STEPBible/STEPBible-Data/master/"
             "Lexicons/TBESG%20-%20Translators%20Brief%20lexicon%20of%20Extended%20"
             "Strongs%20for%20Greek%20-%20STEPBible.org%20CC%20BY.txt")
DODSON_URL = ("https://raw.githubusercontent.com/biblicalhumanities/"
              "Dodson-Greek-Lexicon/master/dodson.csv")
CREDIT = ("Data created by www.STEPBible.org based on work at "
          "Tyndale House Cambridge (CC BY 4.0)")


def source(name, url):
    """Cached beside the tool. The sources are someone else's data and are not
       committed; delete tools/_sources to pull them again."""
    path = os.path.join(CACHE, name)
    if not os.path.isfile(path):
        os.makedirs(CACHE, exist_ok=True)
        print("fetching %s" % name)
        req = urllib.request.Request(url, headers={"User-Agent": "koine-greek/1.0"})
        with urllib.request.urlopen(req, timeout=120) as r:
            io.open(path, "wb").write(r.read())
    return io.open(path, encoding="utf-8")


# ----------------------------------------------------------------- keys ---
def key(x):
    """Grave folds to acute — that shift is positional, not lexical — and
       case is ignored so a proper noun matches its lexicon entry."""
    d = unicodedata.normalize("NFD", x).replace("̀", "́")
    return unicodedata.normalize("NFC", d).lower()


def flat(x):
    return "".join(c for c in unicodedata.normalize("NFD", x)
                   if not unicodedata.combining(c)).lower()


def variants(lemma):
    """The three ways MorphGNT and a lexicon legitimately differ, and nothing
       else. Returned in the order they should be tried."""
    out, seen = [], set()
    cands = [lemma,
             re.sub(r"\((.)\)$", r"\1", lemma),      # μέχρι(ς) -> μέχρις
             re.sub(r"\(.\)$", "", lemma)]           # μέχρι(ς) -> μέχρι
    for base in list(cands):
        for mid, act in (("άομαι", "άω"), ("έομαι", "έω"), ("όομαι", "όω"),
                         ("ομαι", "ω")):
            if base.endswith(mid):
                cands.append(base[:-len(mid)] + act)
                break
    for c in cands:
        if c and c not in seen:
            seen.add(c)
            out.append(c)
    return out


# --------------------------------------------------------------- TBESG ---
def load_tbesg():
    """Tab separated. Column 3 holds the Unicode headword and any spelling
       variants, comma separated; column 6 is the brief gloss, with column 4
       as a fallback for the few rows that leave it empty."""
    lex = {}
    for line in source("tbesg.txt", TBESG_URL):
        if not re.match(r"^G\d", line):
            continue
        f = line.split("\t")
        if len(f) < 7:
            continue
        g = (f[6] or f[4]).strip()
        if not g:
            continue
        for h in f[3].split(","):
            h = h.strip()
            if h:
                lex.setdefault(key(h), g)
    return lex


# -------------------------------------------------------------- Dodson ---
BETA_LETTER = dict(zip("abgdezhqiklmncoprstufxyw", "αβγδεζηθικλμνξοπρστυφχψω"))
BETA_MARK = {")": "̓", "(": "̔", "/": "́", "\\": "̀",
             "=": "͂", "+": "̈", "|": "ͅ"}


def beta(s):
    """TLG beta code to Unicode. A capital writes its diacritics before the
       letter and a lowercase after it, so both sides are collected. The
       combining order that comes out — breathing, then accent, then
       ypogegrammeni — is already canonical, so NFC is all that is needed."""
    out, i, upper = [], 0, False
    while i < len(s):
        c = s[i]
        if c == "*":
            upper = True
            i += 1
            continue
        if c in BETA_MARK or c.lower() in BETA_LETTER:
            j, pre = i, ""
            while j < len(s) and s[j] in BETA_MARK:
                pre += BETA_MARK[s[j]]
                j += 1
            if j >= len(s) or s[j].lower() not in BETA_LETTER:
                i = j
                continue
            base = BETA_LETTER[s[j].lower()]
            j += 1
            post = ""
            while j < len(s) and s[j] in BETA_MARK:
                post += BETA_MARK[s[j]]
                j += 1
            ch = unicodedata.normalize("NFC", base + pre + post)
            out.append(ch.upper() if upper else ch)
            upper, i = False, j
            continue
        i += 1
    return re.sub(r"σ$", "ς", "".join(out))


def load_dodson():
    lex = {}
    rows = csv.reader(source("dodson.csv", DODSON_URL), delimiter="\t")
    next(rows, None)
    for r in rows:
        if len(r) < 5:
            continue
        h = beta(r[2].split(",")[0].strip())
        if h:
            lex.setdefault(key(h), r[3].strip())
    return lex


# ----------------------------------------------------------------- run ---
man = json.load(io.open(os.path.join(GNT, "manifest.json"), encoding="utf-8"))
LEMMAS, DECK_GLOSS, POS = man["lemmas"], man["gloss"], man["pos"]

T, D = load_tbesg(), load_dodson()
TF, DF = {}, {}
for k, v in T.items():
    TF.setdefault(flat(k), v)
for k, v in D.items():
    DF.setdefault(flat(k), v)

# The commonest tagging of each lemma, so a rewrite can be limited to verbs.
best_pos, freq = {}, collections.Counter()
counts = collections.defaultdict(collections.Counter)
for b in man["books"]:
    d = json.load(io.open(os.path.join(GNT, b["a"] + ".json"), encoding="utf-8"))
    for ch in d["c"]:
        for vs in ch:
            for w in vs[1]:
                counts[w[1]][POS[w[2]]] += 1
                freq[w[1]] += 1
for i, c in counts.items():
    best_pos[i] = c.most_common(1)[0][0]


def lookup(lemma):
    """(gloss, source, headword actually matched) or (None, None, None)."""
    for lex, flatlex, name in ((T, TF, "TBESG"), (D, DF, "Dodson")):
        for n, v in enumerate(variants(lemma)):
            if key(v) in lex:
                return lex[key(v)], name, (None if n == 0 else v)
            if flat(v) in flatlex:
                return flatlex[flat(v)], name, v
    return None, None, None


# The corpus lists a handful of words twice, once capitalised — Θάλασσα
# beside θάλασσα, Πόλις beside πόλις — because a title or a sentence opening
# was tagged separately. Only one of the pair carries the deck's gloss, so
# without this the capitalised form would fall through to the free lexicon and
# the same word would read "sea" in one verse and "sea, lake" in the next.
# Hand it the deck's gloss instead: same word, same answer.
DECK_BY_KEY = {}
for i, l in enumerate(LEMMAS):
    if DECK_GLOSS[i]:
        DECK_BY_KEY.setdefault(key(l), DECK_GLOSS[i])

LEX, src = {}, collections.Counter()
matched, verbed, bare, cased = [], [], [], []
for i, lemma in enumerate(LEMMAS):
    if DECK_GLOSS[i]:
        continue                       # the deck owns this one, and always wins
    if key(lemma) in DECK_BY_KEY:
        LEX[lemma] = DECK_BY_KEY[key(lemma)]
        src["the deck, for a case variant"] += 1
        cased.append((lemma, LEX[lemma]))
        continue
    g, name, via = lookup(lemma)
    if not g:
        # A proper noun is its own gloss; the corpus already says it is a name.
        if best_pos.get(i) == "N-" and lemma[:1].isupper():
            LEX[lemma] = lemma
            src["the name itself"] += 1
        else:
            bare.append(i)
        continue
    if g.startswith("to ") and best_pos.get(i) == "V-":
        # The deck cites verbs in the first person singular; so does this now.
        was = g
        g = "I " + g[3:]
        verbed.append((lemma, was, g))
    LEX[lemma] = g
    src[name] += 1
    if via:
        matched.append((lemma, via, name, g))

total = len(LEMMAS)
print("lemmas in the corpus                %5d" % total)
print("  glossed by the deck already       %5d   (left untouched)" % sum(1 for g in DECK_GLOSS if g))
for k, n in src.most_common():
    print("  %-33s %5d" % (k, n))
print("  no gloss from any source          %5d   (%d tokens, %.2f%% of the NT)"
      % (len(bare), sum(freq[i] for i in bare),
         100.0 * sum(freq[i] for i in bare) / max(1, sum(freq.values()))))
print("  ---")
print("  corpus glossed                     %.1f%%"
      % (100.0 * (total - len(bare)) / total))
print("  resolved by a spelling variant    %5d" % len(matched))
print("  verbs rewritten to the first person %3d" % len(verbed))

if REPORT:
    print("\n--report: nothing written.")
    print("\nthe %d with no gloss anywhere, commonest first:" % len(bare))
    for i in sorted(bare, key=lambda x: -freq[x])[:40]:
        print("   %-20s %3d x  %s" % (LEMMAS[i], freq[i], best_pos.get(i, "?")))
    sys.exit(0)

# ------------------------------------------------------------- emit js ---
body = json.dumps(LEX, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
out = '''/* A gloss for every word in the Greek New Testament that the course does not
   itself teach — built by tools/build_lexicon.py, not written by hand.

   Keyed by the lemma exactly as data/gnt/manifest.json spells it. By string
   and not by position on purpose: S.lcards will point at these keys, so an
   index would make the manifest's lemma order load-bearing for a user's own
   data, and a rebuilt corpus would silently reassign their cards.

   There is deliberately NO entry here for any of the %d lemmas the deck
   teaches. Those glosses live in the manifest, were checked by hand against
   the corpus, and are better — where the two differ the deck reads "but, and,
   now" for de and this reads "then". The precedence is structural: look here
   only after the manifest has nothing.

   Sources, in the order they are consulted:
     TBESG   %s
             which carries G. Abbott-Smith, A Manual Greek Lexicon of the
             New Testament (T&T Clark, 1922), corrected by Tyndale House.
     Dodson  Jeff Dodson's lexicon of the Greek NT, public domain, used only
             where TBESG has nothing.
   Changes made to both are listed in docs/lexicon-changes.md, as CC BY asks.

   Regenerate whenever data/vocab.js grows: a word promoted into the deck
   must leave this file, or two glosses compete for it. */
const LEX=''' % (sum(1 for g in DECK_GLOSS if g), CREDIT) + body + ";\n"

p = os.path.join(ROOT, "data", "lexicon.js")
io.open(p, "w", encoding="utf-8", newline="\n").write(out)
print("\nwrote data/lexicon.js — %d entries, %.0f KB"
      % (len(LEX), os.path.getsize(p) / 1024))

# ---------------------------------------------------------- the changes ---
lines = ["# Changes made to the shipped lexicons", "",
         "Generated by `tools/build_lexicon.py`. CC BY 4.0 asks that changes to",
         "TBESG be noted for anyone using the data downstream; this is that note.",
         "Nothing here is an edit to the source files, which are used unmodified —",
         "these are the transformations applied when building `data/lexicon.js`.", "",
         "> " + CREDIT, "",
         "> Dodson's lexicon of the Greek NT is in the public domain.", "",
         "---", "",
         "## 1. Verbs recited in the first person singular (%d)" % len(verbed), "",
         "TBESG cites a verb as *to work*. This course cites it as *I work*,",
         "because that is how its own %d hand-written glosses read, and two"
         % sum(1 for g in DECK_GLOSS if g),
         "conventions in one lookup box is worse than either. Applied only where",
         "the corpus tags the lemma `V-` as its commonest reading.", "",
         "| lemma | source | shipped as |", "|---|---|---|"]
for lemma, was, now in sorted(verbed):
    lines.append("| %s | %s | %s |" % (lemma, was, now))
lines += ["", "## 2. Headwords matched through a spelling variant (%d)" % len(matched), "",
          "MorphGNT lists a deponent under its middle form where a lexicon has the",
          "active, and brackets an optional final consonant. An exact match is always",
          "tried first; these are the lemmas that needed one of the three permitted",
          "variants — bracket stripped, `-ομαι` to `-ω`, or accent-blind.", "",
          "| corpus lemma | matched | source | gloss |", "|---|---|---|---|"]
for lemma, via, name, g in sorted(matched):
    lines.append("| %s | %s | %s | %s |" % (lemma, via, name, g))
lines += ["", "## 3. Case variants given the deck's own gloss (%d)" % len(cased), "",
          "The corpus tags a few words twice, once capitalised. Only one of each pair",
          "carries the deck's hand-written gloss; the other is handed the same one, so",
          "the word does not read differently at the start of a sentence.", "",
          "| lemma | gloss |", "|---|---|"]
for lemma, g in sorted(cased):
    lines.append("| %s | %s |" % (lemma, g))
lines += ["", "## 4. Proper nouns glossed by their own name (%d)" % src["the name itself"], "",
          "Neither lexicon carries these, and none is needed: the corpus tags them",
          "`N-` and they are capitalised, so the name is the gloss.", "",
          "## 5. Left with no gloss (%d)" % len(bare), "",
          "%d tokens, %.2f%% of the New Testament. The app says so rather than"
          % (sum(freq[i] for i in bare),
             100.0 * sum(freq[i] for i in bare) / max(1, sum(freq.values()))),
          "guessing, and any of them can be written in and kept.", "",
          "| lemma | occurrences | part of speech |", "|---|---|---|"]
for i in sorted(bare, key=lambda x: (-freq[x], LEMMAS[x])):
    lines.append("| %s | %d | %s |" % (LEMMAS[i], freq[i], best_pos.get(i, "?")))

d = os.path.join(ROOT, "docs", "lexicon-changes.md")
io.open(d, "w", encoding="utf-8", newline="\n").write("\n".join(lines) + "\n")
print("wrote docs/lexicon-changes.md — %d verbs, %d variants, %d unglossed"
      % (len(verbed), len(matched), len(bare)))

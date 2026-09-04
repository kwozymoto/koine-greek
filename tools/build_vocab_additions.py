# -*- coding: utf-8 -*-
"""Words to add to the deck, down to a frequency cutoff.

    python tools/build_vocab_additions.py                 # worklist only
    python tools/build_vocab_additions.py --cut 15
    python tools/build_vocab_additions.py --append 50     # append the first 50

The deck stops at roughly 30 occurrences, which is 84.7% of the running words
of the New Testament. The last sixth is where reading still stalls.

    cutoff   adds   deck    running text
      20x     145    656          87.3%
      15x     308    819          89.2%
      10x     624   1135          91.9%

Nothing here is invented. Frequency, part of speech and gender come from the
corpus; the gloss comes from data/lexicon.js, which Part A already built and
tools/check_lexicon.py already holds; the citation line comes from Dodson,
whose format the deck's own convention already follows.

    deck       θεός, -οῦ, ὁ        Dodson    θεός, οῦ, ὁ
    deck       πίστις, -εως, ἡ     Dodson    πίστις, εως, ἡ
    deck       Ἰερουσαλήμ, ἡ       Dodson    (indeclinable, same shape)

— the only difference being the hyphen, which is inserted here.

WHY A WORKLIST AND NOT A BLIND APPEND. data/vocab.js is append-only: cards,
audio filenames and example verses are all keyed by array position, so a row
added in the wrong place silently reassigns somebody's progress. And a gloss
being *taught* deserves more than a lexicon's shortest phrase — TBESG says
"then" for δέ where the deck says "but, and, now". So the default writes a
TSV to read and correct; --append is a separate, deliberate act.

AFTER APPENDING, in this order, or the data files disagree:

    tools/build_gloss_map.py     the new words become reader glosses
    tools/build_lexicon.py       and therefore leave data/lexicon.js
    tools/build_examples.py      each gets an example verse
    tools/build_forms.py         and joins the parsing drill
    tools/check_all.py

The app itself needs no change: VOCAB_AUDIO[i] is undefined for a new index,
which every caller already treats as "no recording" — no Hear-it button, no
lit speaker. Clips can follow in their own time.
"""
import argparse, collections, csv, io, json, os, re, sys, unicodedata

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GNT = os.path.join(ROOT, "data", "gnt")
SOURCES = os.path.join(ROOT, "tools", "_sources")

ap = argparse.ArgumentParser()
ap.add_argument("--cut", type=int, default=15)
ap.add_argument("--append", type=int, default=0,
                help="append this many of the worklist's rows to data/vocab.js")
A = ap.parse_args()

ART = {"M": "ὁ", "F": "ἡ", "N": "τό"}
# corpus tag -> the vocabulary the deck's own pos field uses
KIND = {"N-": "noun", "V-": "verb", "A-": "adj", "D-": "adv", "P-": "prep",
        "C-": "conj", "X-": "particle", "I-": "interj",
        "RP": "pron", "RD": "pron", "RR": "pron", "RI": "pron", "RA": "art"}


def key(x):
    d = unicodedata.normalize("NFD", x).replace("̀", "́")
    return unicodedata.normalize("NFC", d).lower()


# ---------------------------------------------------------- the corpus ---
man = json.load(io.open(os.path.join(GNT, "manifest.json"), encoding="utf-8"))
LEMMAS, POS = man["lemmas"], man["pos"]
freq = collections.Counter()
kinds = collections.defaultdict(collections.Counter)
gender = collections.defaultdict(collections.Counter)
attested = collections.defaultdict(lambda: collections.defaultdict(collections.Counter))
govern = collections.defaultdict(collections.Counter)   # preposition -> case
govern_at = []
for b in man["books"]:
    d = json.load(io.open(os.path.join(GNT, b["a"] + ".json"), encoding="utf-8"))
    for ch in d["c"]:
        for vs in ch:
            for w in vs[1]:
                freq[w[1]] += 1
                kinds[w[1]][POS[w[2]]] += 1
                if w[3][6] in "MFN":
                    gender[w[1]][w[3][6]] += 1
                if POS[w[2]] == "P-":
                    govern_at.append(w[1])
                elif govern_at and w[3][4] in "GDA":
                    govern[govern_at.pop()][w[3][4]] += 1
                else:
                    govern_at.clear()
                if w[3][4] == "N" and w[3][5] == "S" and w[3][6] in "MFN":
                    attested[w[1]][w[3][6]][re.sub(r"[^\wͰ-Ͽἀ-῿]", "", w[0])] += 1

# ------------------------------------------------------------ the deck ---
raw = io.open(os.path.join(ROOT, "data", "vocab.js"), encoding="utf-8").read()
V = re.findall(r'^\["(.*?)","(.*?)",(\d+),"(\w+)",(\d)\]', raw, re.M)
CITATION = {"τε": "τέ", "οὕτως": "οὕτω(ς)", "δεῖ": "δέω",
            "ἱερόν": "ἱερός", "ἐλεέω": "ἐλεάω"}
DECK = set()
for v in V:
    h = v[0].split(",")[0].strip()
    DECK.add(key(h))
    DECK.add(key(CITATION.get(h, h)))

# ----------------------------------------------------------- the gloss ---
lexsrc = io.open(os.path.join(ROOT, "data", "lexicon.js"), encoding="utf-8").read()
LEX = json.loads(re.search(r"const LEX=(\{.*\});", lexsrc, re.S).group(1))
# Neither free lexicon carries this one; it is in docs/lexicon-changes.md's
# list of 120. A numeral is not a judgement call.
LEX.setdefault("τεσσεράκοντα", "forty")

# Words the corpus lists separately that the deck already teaches. οὔ is οὐ
# wearing the accent it takes at the end of a clause; the deck's entry is
# "οὐ, οὐκ, οὐχ", which is the same word. Adding it would put a duplicate in
# an append-only file, where a duplicate can never be taken out again.
EXCLUDE = {"οὔ"}

# Where a lexicon's citation line and the corpus disagree, the corpus wins:
# Dodson gives μάχαιρα the Attic -ας, and the New Testament writes μαχαίρης.
CITE_FIX = {"μάχαιρα": "μάχαιρα, -ης, ἡ"}

# --------------------------------------------------- the citation line ---
BETA_LETTER = dict(zip("abgdezhqiklmncoprstufxyw", "αβγδεζηθικλμνξοπρστυφχψω"))
BETA_MARK = {")": "̓", "(": "̔", "/": "́", "\\": "̀",
             "=": "͂", "+": "̈", "|": "ͅ"}


def beta(s):
    out, i, upper = [], 0, False
    while i < len(s):
        c = s[i]
        if c == "*":
            upper = True; i += 1; continue
        if c in BETA_MARK or c.lower() in BETA_LETTER:
            j, pre = i, ""
            while j < len(s) and s[j] in BETA_MARK:
                pre += BETA_MARK[s[j]]; j += 1
            if j >= len(s) or s[j].lower() not in BETA_LETTER:
                i = j; continue
            base = BETA_LETTER[s[j].lower()]; j += 1; post = ""
            while j < len(s) and s[j] in BETA_MARK:
                post += BETA_MARK[s[j]]; j += 1
            ch = unicodedata.normalize("NFC", base + pre + post)
            out.append(ch.upper() if upper else ch)
            upper, i = False, j
            continue
        out.append(c); i += 1
    # a final sigma is written ς at the end of a word, not mid-line
    return re.sub(r"σ(?=[ ,]|$)", "ς", "".join(out))


DOD = {}
dodson = os.path.join(SOURCES, "dodson.csv")
if os.path.isfile(dodson):
    rows = csv.reader(io.open(dodson, encoding="utf-8"), delimiter="\t")
    next(rows, None)
    for r in rows:
        if len(r) >= 5:
            full = beta(r[2].strip())
            h = full.split(",")[0].strip()
            if h:
                DOD.setdefault(key(h), full)
else:
    print("tools/_sources/dodson.csv is missing — run tools/build_lexicon.py first")


def acute(x):
    """A grave is an acute that happens to stand before another word."""
    return unicodedata.normalize("NFC",
        unicodedata.normalize("NFD", x).replace("̀", "́"))


def adj_endings(li, lemma):
    """The feminine and neuter of an -ος adjective, from forms the corpus
       actually contains.

       Dodson writes these endings without their accent, and is inconsistent
       about it: καθαρός, λευκός, παλαιός and κενός come out right, but
       ἀληθινός is given as "η, ον" when the corpus has ἀληθινή — the accent
       stays on the ultima. An ending is a small thing to get wrong and a
       hard one to unlearn, so where the corpus attests the form it wins.
       The ending is taken from a fixed stem — the masculine minus its own
       -ος — and not from the longest common prefix, which runs straight past
       it: ἀληθινός and ἀληθινόν share the ό as well, leaving "-ν".

       Used only when the stem survives unchanged, accent and all. ἐλεύθερος
       has ἐλευθέρα, where the accent has moved, so the ending alone would
       not carry it; that one falls back to Dodson's ἐλεύθερος, -έρα, -ερον,
       which spells enough of the word to be read."""
    # Accent-blind: ἀληθινός ends in ό + ς, and ό is one character (U+03CC),
    # so a plain endswith("ος") is false for every oxytone adjective — which
    # is exactly the group this exists for.
    flat = "".join(c for c in unicodedata.normalize("NFD", lemma)
                   if not unicodedata.combining(c))
    if not flat.endswith("ος"):
        return None                     # contracted, or not this declension
    stem = lemma[:-2]
    have = attested.get(li, {})
    out = []
    for slot in ("F", "N"):
        c = have.get(slot)
        if not c:
            return None
        form = acute(c.most_common(1)[0][0])
        if not form.startswith(stem) or len(form) <= len(stem):
            return None                 # the accent shifted, or the stem did
        out.append("-" + form[len(stem):])
    return out


def citation(lemma, kind, g, li=None):
    """The deck writes the genitive ending with a hyphen: θεός, -οῦ, ὁ. Dodson
       writes the same line without one. An indeclinable has two parts and no
       hyphen anywhere — Ἰερουσαλήμ, ἡ — which is the deck's shape already."""
    if kind == "adj" and li is not None and lemma.endswith("ς"):
        e = adj_endings(li, lemma)
        if e:
            return ", ".join([lemma] + e)
    line = DOD.get(key(lemma))
    if line:
        parts = [p.strip() for p in line.split(",")]
        if parts[0] != lemma:                 # accent or spelling drift
            parts[0] = lemma
        if len(parts) >= 3 and parts[-1] in ART.values():
            middles = ["-" + p if not p.startswith("-") else p for p in parts[1:-1]]
            return ", ".join([parts[0]] + middles + [parts[-1]])
        if len(parts) == 2 and parts[1] in ART.values():
            return ", ".join(parts)
        if kind == "adj" and len(parts) >= 2:
            return ", ".join([parts[0]] + ["-" + p.lstrip("-") for p in parts[1:]])
    # no Dodson line: a noun still needs its article, and the corpus knows it
    if kind in ("noun", "name") and g:
        return "%s, %s" % (lemma, ART[g])
    return lemma


# ------------------------------------------------------------------ run ---
new = []
for i, l in enumerate(LEMMAS):
    if key(l) in DECK or freq[i] < A.cut or l in EXCLUDE:
        continue
    tag = kinds[i].most_common(1)[0][0]
    kind = KIND.get(tag, "particle")
    if kind == "noun" and l[:1].isupper():
        kind = "name"
    g = gender[i].most_common(1)[0][0] if gender[i] else None
    cite = CITE_FIX.get(l) or citation(l, kind, g, i)
    gloss = LEX.get(l, "")
    # The deck's prepositions name the case they govern — "in, on, among
    # (+dat)" — and check_vocab holds that claim to the running text. A
    # preposition that takes one case everywhere gets it stated.
    if kind == "prep" and govern[i] and "(+" not in gloss:
        cases = govern[i]
        top, n = cases.most_common(1)[0]
        if n / sum(cases.values()) >= 0.9:
            gloss = "%s (+%s)" % (gloss, {"G": "gen", "D": "dat", "A": "acc"}[top])
    # A word the corpus tags as an adjective more often than a noun, but which
    # the lexicon cites with an article, is a noun used substantivally — χήρα,
    # "widow", is the clear case. Follow the citation line: a row reading
    # "χήρα, -ας, ἡ" filed under adj would be the only one of its shape.
    if kind == "adj" and cite.rsplit(", ", 1)[-1] in ART.values():
        kind = "name" if l[:1].isupper() else "noun"
    new.append({
        "lemma": l,
        "citation": cite,
        "gloss": gloss,
        "freq": freq[i],
        "pos": kind,
        "gender": g or "",
        "dodson": "yes" if key(l) in DOD else "",
    })
new.sort(key=lambda r: (-r["freq"], r["lemma"]))

miss_gloss = [r for r in new if not r["gloss"]]
miss_cite = [r for r in new if r["pos"] in ("noun", "name") and "," not in r["citation"]]
print("cutoff %dx — %d words, taking the deck from %d to %d"
      % (A.cut, len(new), len(V), len(V) + len(new)))
by = collections.Counter(r["pos"] for r in new)
print("   " + " · ".join("%s %d" % (k, n) for k, n in by.most_common()))
print("   with a gloss from data/lexicon.js: %d" % (len(new) - len(miss_gloss)))
print("   with a citation line from Dodson:  %d" % sum(1 for r in new if r["dodson"]))
if miss_gloss:
    print("   NO GLOSS — write one before appending: %s"
          % " ".join(r["lemma"] for r in miss_gloss))
if miss_cite:
    print("   noun with no article: %s" % " ".join(r["lemma"] for r in miss_cite))

work = os.path.join(ROOT, "vocab_additions.tsv")
with io.open(work, "w", encoding="utf-8", newline="") as fh:
    w = csv.writer(fh, delimiter="\t", lineterminator="\n")
    w.writerow(["citation", "gloss", "freq", "pos", "lemma", "gender", "dodson"])
    for r in new:
        w.writerow([r["citation"], r["gloss"], r["freq"], r["pos"],
                    r["lemma"], r["gender"], r["dodson"]])
print("\nwrote vocab_additions.tsv — %d rows to read and correct" % len(new))

if not A.append:
    print("\nThe twenty commonest:")
    for r in new[:20]:
        print("   %-26s %-34s %4dx  %s" % (r["citation"], r["gloss"][:34], r["freq"], r["pos"]))
    print("\nNothing appended. Pass --append N when the glosses have been read.")
    sys.exit(0)

take = [r for r in new if r["gloss"]][:A.append]
if len(take) < A.append:
    print("only %d of the %d asked for have a gloss" % (len(take), A.append))
esc = lambda s: s.replace('"', "'")
# The comma goes at the FRONT of each new row, not the end. The array's last
# existing row carries no trailing comma, so rows that merely begin on a new
# line glue themselves to it: `oldRow\n["new",…]` is a member access, not two
# entries, and it reads back as a single undefined. That silently cost the
# last original row — index 510, ῥῆμα — which is exactly the damage an
# append-only file cannot take.
lines = "".join(',\n["%s","%s",%d,"%s",5]' % (esc(r["citation"]), esc(r["gloss"]),
                                              r["freq"], r["pos"]) for r in take)
# Appended at the very end, never inserted: every index already in use has to
# keep pointing at the word it pointed at yesterday.
m = re.search(r"\n\];\s*$", raw)
if not m:
    sys.exit("could not find the end of the VOCAB array")
out = raw[:m.start()] + lines + raw[m.start():]
io.open(os.path.join(ROOT, "data", "vocab.js"), "w", encoding="utf-8",
        newline="\n").write(out)
print("\nappended %d words — data/vocab.js is now %d entries"
      % (len(take), len(V) + len(take)))
print("now run, in order: build_gloss_map, build_lexicon, build_examples, "
      "build_forms, check_all")

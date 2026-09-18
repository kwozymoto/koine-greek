# -*- coding: utf-8 -*-
"""Check data/vocab.js and the audio cue sheets against the SBLGNT in data/gnt/.

    python tools/check_vocab.py

The deck is 511 hand-written lexical entries — headword, gloss, frequency,
part of speech — and most of that is a claim the corpus can arbitrate,
because MorphGNT lemmatises each of its 138,000 words to exactly the kind of
citation form data/vocab.js uses as a headword.

Seven passes over the vocabulary:

  1. Shape. Five fields, right types, a known part-of-speech name.
  2. Attestation. Is the headword a lemma the SBLGNT actually uses? A
     headword that is not is either a typo or a lexicon disagreeing with
     MorphGNT about how to cite the word, and the two look different: a typo
     has no near neighbour, a citation difference has an obvious one.
  3. Duplicates, compared without accents, since ὁ/ὅ and τις/τίς are real
     distinctions but ἀρχή twice would not be.
  4. Part of speech against the corpus tag for that lemma.
  5. Frequency against the corpus count. The header calls these approximate
     and Nestle-Aland based, and SBLGNT genuinely differs from NA in places,
     so small gaps are expected; the report sorts by size so anything that
     is not a text-critical difference stands out.
  6. Noun citation forms. "θεός, -οῦ, ὁ" claims a gender and a genitive
     singular, and both are in the corpus: the article against the gender on
     the attested tokens, the ending against the genitive singular itself.
  7. The other citation forms — a feminine and neuter for adjectives, the
     alternative spellings for οὐ and ἐκ — must be attested too.

Then the example verse each card carries. data/examples.js names a
reference, the verse text and the index of the word being illustrated, and
all three are checkable: the reference has to resolve, the text has to be
the SBLGNT's word for word, and the word at that index has to be from this
entry's lemma. That last one is the one that catches things.

Then the prepositions, whose glosses claim a case — "in, on, among (+dat)".
That is a claim about running text rather than about the word, so it is not
in the parse code, but it is still in the corpus: take the case of the first
word after the preposition that carries one.

Then the reader's own gloss table, which is the same data seen from the
other side. data/gnt/manifest.json carries gloss[] parallel to lemmas[], and
that is what the tap-to-parse reader shows. Every gloss in it should be the
gloss of the word it sits on, and every deck word should have one.

Then the audio, which is a chain of four things that have to agree:
VOCAB[i] -> VOCAB_AUDIO[i] -> the file on disk -> the cue sheet row saying
what was recorded. The cue sheets duplicate the headword, gloss, part of
speech, frequency and tier, so all of it can drift; each is compared back to
vocab.js. And each row carries the sha1 of the clip it describes, so a clip
re-recorded without the sheet being brought along fails rather than passing
quietly. That replaced a byte-count estimate of the duration which was out by
0.064s on average against a 0.05s tolerance — it fired on 173 rows, was a soft
warning nobody read, and hid the 64 clips that genuinely had been replaced.

What this cannot check is whether an English gloss is the right translation,
or whether a cue string sounds like the Greek. Both are judgement, and the
corpus has no opinion.
"""
import json, io, os, re, sys, unicodedata, collections, subprocess, hashlib
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GNT = os.path.join(ROOT, "data", "gnt")
GK = "Ͱ-Ͽἀ-῿"
bare = lambda s: re.sub("[^" + GK + "]", "", s)

def norm(x):
    """Acute and grave are the same form — Greek shifts one to the other
       before a following word. Breathings are kept: they distinguish words."""
    d = unicodedata.normalize("NFD", x).replace("̀", "́")
    return unicodedata.normalize("NFC", d).lower()

def flat(x):
    """Accent-blind, for asking whether two spellings are the same letters."""
    return "".join(c for c in unicodedata.normalize("NFD", x)
                   if not unicodedata.combining(c)).lower()

# ------------------------------------------------------------ app data ----
def load_js(files, names):
    js = ("const fs=require('fs'),vm=require('vm');const c=vm.createContext({});"
          + "".join("vm.runInContext(fs.readFileSync(%r,'utf8'),c,{filename:%r});"
                    % (f, f) for f in files)
          + "process.stdout.write(vm.runInContext('JSON.stringify({%s})',c));"
          % ",".join(names))
    out = subprocess.run(["node", "-e", js], cwd=ROOT, capture_output=True,
                         text=True, encoding="utf-8")
    if out.returncode:
        sys.exit("could not load the app data:\n" + out.stderr)
    return json.loads(out.stdout)

D = load_js(["data/vocab.js", "data/audio.js", "data/examples.js"],
            ["VOCAB", "VOCAB_AUDIO", "FORM_AUDIO", "AUDIO_CLIPS", "EXAMPLES"])
VOCAB, VOCAB_AUDIO, EXAMPLES = D["VOCAB"], D["VOCAB_AUDIO"], D["EXAMPLES"]
FORM_AUDIO, AUDIO_CLIPS = D["FORM_AUDIO"], D["AUDIO_CLIPS"]

man = json.load(io.open(os.path.join(GNT, "manifest.json"), encoding="utf-8"))
LEMMAS, GLOSSES, POS = man["lemmas"], man["gloss"], man["pos"]

# Every token, gathered by lemma: how often, tagged what, in which forms.
count = collections.Counter()
tags = collections.defaultdict(collections.Counter)
gender = collections.defaultdict(collections.Counter)
gensg = collections.defaultdict(set)
ALL_FORMS = set()
for b in man["books"]:
    d = json.load(io.open(os.path.join(GNT, b["a"] + ".json"), encoding="utf-8"))
    for ch in d["c"]:
        for vs in ch:
            for w in vs[1]:
                li, code = w[1], w[3]
                count[li] += 1
                tags[li][POS[w[2]]] += 1
                if len(code) > 6 and code[6] in "MFN":
                    gender[li][code[6]] += 1
                if len(code) > 5 and code[4] == "G" and code[5] == "S":
                    gensg[li].add(w[0])
                ALL_FORMS.add(norm(bare(w[0])))

BY_LEMMA = {}
for i, l in enumerate(LEMMAS):
    BY_LEMMA.setdefault(norm(l), i)
BY_FLAT = collections.defaultdict(list)
for i, l in enumerate(LEMMAS):
    BY_FLAT[flat(l)].append(i)

# ------------------------------------------------------------ the deck ----
RETIRED = {237}          # τέ, a duplicate of 72 that has to keep its slot
POSNAMES = {"noun", "verb", "adj", "adv", "conj", "prep", "pron", "art",
            "name", "particle", "interj", "num"}
# What the corpus calls each of ours. A name is a noun to MorphGNT, a
# pronoun covers four tags, and particles, conjunctions and adverbs overlap.
POSMAP = {"noun": {"N-"}, "name": {"N-"}, "verb": {"V-"}, "adj": {"A-"},
          "adv": {"D-", "X-"}, "conj": {"C-"}, "prep": {"P-"}, "art": {"RA"},
          "pron": {"RP", "RD", "RR", "RI", "A-"},
          "particle": {"X-", "C-", "D-"},
          "interj": {"I-", "X-", "V-"}, "num": {"A-"}}
ART = {"ὁ": "M", "ἡ": "F", "τό": "N"}
GNAME = {"M": "masculine", "F": "feminine", "N": "neuter"}

# Headwords the SBLGNT lemmatises differently. Each is a lexicon convention
# rather than a mistake, and each was checked against the corpus by hand.
CITATION = {
    "τε":     "τέ",        # MorphGNT accents the enclitic in its lemma
    "οὕτως":  "οὕτω(ς)",   # one lemma covers both spellings
    "δεῖ":    "δέω",       # impersonal, lemmatised to the verb behind it
    "ἱερόν":  "ἱερός",     # the substantive, lemmatised as its adjective
    "ἐλεέω":  "ἐλεάω",     # both spellings are current; BDAG heads ἐλεέω
}
# Pairs that share their letters but are different words.
SAME_LETTERS_OK = {frozenset(p) for p in
                   [("εἰς", "εἷς"), ("τις", "τίς"), ("τε", "τέ"),
                    ("ὁ", "ὅ"), ("οὐ", "οὗ"), ("ἤ", "ἦ"),
                    ("ποτέ", "πότε"), ("ὅμοιος", "ὁμοίως"),
                    ("καλός", "καλῶς"), ("μόνος", "μόνον"),
                    ("ἄξιος", "ἀξίως"), ("οὗτος", "οὕτως")]}

# Where the corpus tag and the deck label are both right about different
# things. MorphGNT lemmatises a substantivised adjective as the adjective,
# so ἡ ἔρημος and ὁ διάβολος come back tagged A-; every lexicon still heads
# them as nouns, and so does Black.
POS_OK = {
    219: "ἱερόν is the neuter substantive of ἱερός; BDAG heads it as a noun",
    330: "ἡ ἔρημος, the substantive; MorphGNT lemmatises it as the adjective",
    422: "ὁ διάβολος, the substantive; MorphGNT lemmatises it as the adjective",
    479: "ὁ φίλος, the substantive; MorphGNT lemmatises it as the adjective",
    146: "ὅσος is a correlative — an adjective in form, relative in function",
    298: "εὐθύς is adverbial in almost all of its 59 uses; the lemma is the adjective",
    550: "ἡ χήρα, the substantive; MorphGNT lemmatises it as the adjective",
}
# Lemmas where the corpus count answers a different question from the deck's.
FREQ_OK = {
    161: "the corpus folds δεῖ, δέω and δέομαι into one lemma (154 together)",
    364: "the corpus folds δεῖ, δέω and δέομαι into one lemma (154 together)",
    233: "the corpus lemma ἐλεάω covers both spellings",
    53:  "MorphGNT draws the οἶδα/ὁράω line differently; the two total 772 either way",
    39:  "MorphGNT draws the οἶδα/ὁράω line differently; the two total 772 either way",
    103: "ὅστις: the corpus counts ὅ τι separately",
}
# Citation forms a lexicon prints that the New Testament never happens to use.
FORM_OK = {
    "μηδεμία": "the feminine of μηδείς; only μηδεμίαν occurs",
    "ὠτός":    "the genitive of οὖς; the NT uses the diminutive ὠτίον instead",
}

headword = lambda v: v[0].split(",")[0].strip()

def lemma_index(v):
    """The corpus lemma for this entry, honouring the citation table."""
    h = headword(v)
    j = BY_LEMMA.get(norm(CITATION.get(h, h)))
    return j if j is not None else BY_LEMMA.get(norm(h))

shape, unattested, dupes, posbad, freqbad, citebad, formbad = [], [], [], [], [], [], []
excused = []
seen = {}

for i, v in enumerate(VOCAB):
    if i in RETIRED:
        continue
    tag = "%3d %-14s" % (i, headword(v))

    # 1 — shape
    if len(v) != 5 or not isinstance(v[0], str) or not isinstance(v[1], str) \
       or not isinstance(v[2], int) or v[3] not in POSNAMES \
       or not isinstance(v[4], int):
        shape.append("%s malformed: %r" % (tag, v))
        continue
    if not v[1].strip():
        shape.append("%s has no gloss" % tag)

    h = headword(v)

    # 3 — duplicates, accent-blind
    key = flat(h)
    if key in seen:
        prev = seen[key]
        ph = headword(VOCAB[prev])
        if ph == h:
            dupes.append("%s repeats entry %d exactly" % (tag, prev))
        elif frozenset([ph, h]) not in SAME_LETTERS_OK:
            dupes.append("%s and %d %s share their letters" % (tag, prev, ph))
    else:
        seen[key] = i

    # 2 — attestation
    j = lemma_index(v)
    if j is None:
        near = BY_FLAT.get(flat(h)) or []
        hint = ("  nearest: " + ", ".join(LEMMAS[k] for k in near[:3])) if near else \
               "  nothing with those letters — check the spelling"
        unattested.append("%s is not a lemma in the SBLGNT.%s" % (tag, hint))
        continue

    # 4 — part of speech
    got = set(tags[j])
    if got and not (got & POSMAP[v[3]]):
        line = "%s called %-8s the corpus tags it %s" % (tag, v[3], "/".join(sorted(got)))
        (excused if i in POS_OK else posbad).append(
            line + ("  — " + POS_OK[i] if i in POS_OK else ""))

    # 5 — frequency
    n = count[j]
    if n == 0:
        freqbad.append((9.99, "%s says %d, the corpus has none" % (tag, v[2])))
    elif v[3] != "name":              # names split over spellings; skip them
        off = abs(v[2] - n) / float(n)
        if off > 0.06:
            line = "%s says %5d, the SBLGNT has %5d  (%+.0f%%)" % (
                tag, v[2], n, 100 * (v[2] - n) / float(n))
            if i in FREQ_OK:
                excused.append(line + "  — " + FREQ_OK[i])
            else:
                freqbad.append((off, line))

    parts = [p.strip() for p in v[0].split(",")]

    # 6 — the noun line: gender from the article, and the genitive singular
    if v[3] == "noun" and len(parts) == 3:
        if parts[2] not in ART:
            citebad.append("%s ends its lexical line with %r, not an article"
                           % (tag, parts[2]))
        else:
            want = ART[parts[2]]
            if gender[j] and want not in gender[j]:
                citebad.append("%s cites %s (%s), the corpus tags it %s"
                               % (tag, parts[2], GNAME[want],
                                  "/".join(GNAME[g] for g in sorted(gender[j]))))
        # accent-blind: a genitive before an enclitic picks up a second
        # accent (μάρτυρός), and that is not a different ending
        end = flat(bare(parts[1]))
        if end and gensg[j] and not any(flat(bare(f)).endswith(end)
                                        for f in gensg[j]):
            citebad.append("%s cites the genitive %s, the corpus has %s"
                           % (tag, parts[1], ", ".join(sorted(gensg[j])[:3])))

    # 7 — every other whole form on the line has to be a real word
    for p in parts[1:]:
        w = bare(p)
        if not w or p.lstrip().startswith(("-", "‑")):
            continue
        if norm(w) not in ALL_FORMS:
            line = "%s cites %s, which occurs nowhere in the SBLGNT" % (tag, p)
            if p in FORM_OK:
                excused.append(line + "  — " + FORM_OK[p])
            else:
                formbad.append(line)

# ---------------------------------------------------- the example verse ---
# data/examples.js gives every card a verse, with the index of the word it
# is illustrating. All three parts are checkable: the reference must resolve,
# the text must be the SBLGNT's, and the word at that index must actually be
# from this entry's lemma. The last one is the point — the builder used to
# match headwords to lemmas without accents, which gave πότε "when?" a verse
# about a man who had ποτέ been blind, and τίς "who?" a verse using τις.
ex_bad, ex_none, ex_ok = [], [], 0
BOOK = {b["t"]: b for b in man["books"]}
_vcache = {}

def one_verse(ref):
    m = re.match(r"^(.*?)\s+(\d+):(\d+)$", ref.strip())
    if not m:
        return None
    title, ch, vn = m.group(1), int(m.group(2)), int(m.group(3))
    b = BOOK.get(title)
    if not b:
        return None
    if b["a"] not in _vcache:
        _vcache[b["a"]] = json.load(io.open(os.path.join(GNT, b["a"] + ".json"),
                                            encoding="utf-8"))
    d = _vcache[b["a"]]
    nums = b.get("n") or list(range(1, len(d["c"]) + 1))
    if ch not in nums:
        return None
    for vs in d["c"][nums.index(ch)]:
        if vs[0] == vn:
            return vs[1]
    return None


def verse_addr(ref):
    """(book abbreviation, chapter index, verse number) for a reference, which
       is what openGntChapter takes. The index is not the number: SBLGNT omits
       passages such as John 7:53-8:11, so books[].n carries the real numbers
       and the position in that list is the address."""
    m = re.match(r"^(.*?)\s+(\d+):(\d+)$", ref.strip())
    b = BOOK.get(m.group(1)) if m else None
    if not b:
        return None
    if b["a"] not in _vcache:
        _vcache[b["a"]] = json.load(io.open(os.path.join(GNT, b["a"] + ".json"),
                                            encoding="utf-8"))
    nums = b.get("n") or list(range(1, len(_vcache[b["a"]]["c"]) + 1))
    ch = int(m.group(2))
    return (b["a"], nums.index(ch), int(m.group(3))) if ch in nums else None

if len(EXAMPLES) != len(VOCAB):
    ex_bad.append("EXAMPLES has %d entries, VOCAB has %d — the two are indexed "
                  "together" % (len(EXAMPLES), len(VOCAB)))
for i, e in enumerate(EXAMPLES[:len(VOCAB)]):
    if i in RETIRED:
        continue
    tag = "%3d %-14s" % (i, headword(VOCAB[i]))
    if not e:
        ex_none.append("%s no verse short enough to be worth showing" % tag)
        continue
    ref, txt, at = e[0], e[1], e[2]
    pos, code = (e[3], e[4]) if len(e) >= 5 else (None, None)
    # the reader address the card's reference button opens: book abbreviation,
    # chapter *index* (not number — SBLGNT omits passages), verse number
    addr = tuple(e[5:8]) if len(e) >= 8 else None
    if addr is None:
        ex_bad.append("%s %s carries no reader address — re-run "
                      "tools/build_examples.py" % (tag, ref))
    elif addr != verse_addr(ref):
        ex_bad.append("%s %s says the reader should open %s; that reference is "
                      "at %s" % (tag, ref, addr, verse_addr(ref)))
    ws = one_verse(ref)
    if ws is None:
        ex_bad.append("%s %s does not resolve in the corpus" % (tag, ref)); continue
    if [norm(bare(w[0])) for w in ws] != [norm(bare(t)) for t in txt.split()]:
        ex_bad.append("%s %s does not match the SBLGNT text" % (tag, ref)); continue
    if not (0 <= at < len(ws)):
        ex_bad.append("%s %s points at word %d of %d" % (tag, ref, at, len(ws))); continue
    j = lemma_index(VOCAB[i])
    # norm() lowercases, so a capitalised twin counts as the same lemma. The
    # corpus lists a few words twice — Ὦ beside ὦ, Θάλασσα beside θάλασσα —
    # where the capital is only a sentence opening, and the example builder
    # matches case-blind. Requiring the exact index here would fail a verse
    # that shows precisely the right word.
    if j is not None and ws[at][1] != j \
            and norm(LEMMAS[ws[at][1]]) != norm(LEMMAS[j]):
        ex_bad.append("%s %s highlights %s, which is %s, not %s"
                      % (tag, ref, ws[at][0], LEMMAS[ws[at][1]], headword(VOCAB[i])))
    # The card labels that form with its parse, so the parse has to be the
    # corpus's own and not a stale copy. Without this, regenerating the verses
    # and forgetting to regenerate the codes would put a confident, wrong
    # grammatical label under every example — the worst kind of error this app
    # can make, because it looks authoritative.
    elif pos is None:
        ex_bad.append("%s %s carries no part of speech or parse code — "
                      "re-run tools/build_examples.py" % (tag, ref))
    elif POS[ws[at][2]] != pos or ws[at][3] != code:
        ex_bad.append("%s %s labels %s %s %s; the corpus says %s %s"
                      % (tag, ref, ws[at][0], pos, code,
                         POS[ws[at][2]], ws[at][3]))
    else:
        ex_ok += 1

# ------------------------------------------- principal parts on the card --
# partsHtml() shows a verb's principal parts on its card by looking the
# headword up in PP with an exact string match, so a PP headword spelled even
# slightly differently from vocab.js silently shows nothing — which is how
# σώζω sat next to the deck's σῴζω and the parts never reached the card.
pp_bad = []
_app = io.open(os.path.join(ROOT, "js", "app.js"), encoding="utf-8").read()
_m = re.search(r"const PP=\[([\s\S]*?)\n\];", _app)
if not _m:
    pp_bad.append("could not find the PP array in js/app.js")
else:
    rows = re.sub(r",\s*$", "", _m.group(1).strip())
    PP = json.loads("[" + "".join(rows.splitlines()) + "]")
    HEADS = {headword(v) for i, v in enumerate(VOCAB) if i not in RETIRED}
    for row in PP:
        if row[0] not in HEADS:
            near = [h for h in HEADS if flat(h) == flat(row[0])]
            pp_bad.append("PP %-12s matches no vocabulary headword%s"
                          % (row[0], ("; vocab.js spells it " + "/".join(near)) if near else ""))

# ------------------------------------------------------------- accents ----
# Every other check here folds grave into acute and compares, and the
# paradigm and lesson checkers strip accents entirely — so none of them ever
# looks at where the accent sits, and a wrong accent is a different word.
# This one keeps accents: if a token's bare letters occur in the corpus but
# that exact accentuation never does, it is worth a look.
GKR = "[" + GK + "]"
_tok = re.compile("[" + GK + "]+")

def acc(x):
    return norm("".join(c for c in unicodedata.normalize("NFD", x)
                        if re.match(GKR, c) or unicodedata.combining(c)))

def minus_one_acute(w):
    """Every spelling of w with one acute taken away."""
    d = unicodedata.normalize("NFD", w)
    return {unicodedata.normalize("NFC", d[:k] + d[k + 1:])
            for k, ch in enumerate(d) if ch == "́"}

spell = collections.defaultdict(set)
for b in man["books"]:
    d = json.load(io.open(os.path.join(GNT, b["a"] + ".json"), encoding="utf-8"))
    for ch in d["c"]:
        for vs in ch:
            for w in vs[1]:
                spell[flat(w[0])].add(acc(w[0]))
for l in LEMMAS:
    spell[flat(l)].add(acc(l))

# Correct forms the New Testament simply never uses with this accent: liquid
# futures of verbs that are rare or absent, and paradigm cells filling out a
# table. Each was checked by hand against the rules of accent.
ACCENT_OK = {
    "ἀγάπας":  "accusative plural of ἀγάπη; the NT has only ἀγάπαις and ἀγάπην",
    "ἀγγελῶ":  "liquid future of ἀγγέλλω — contracted, so circumflex",
    "βαλῶ":    "liquid future of βάλλω — contracted, so circumflex",
    "μενεῖς":  "liquid future of μένω, against the present μένεις",
    "ἕξω":     "future of ἔχω; the rough breathing is the aspirate resurfacing",
    "αὐταί":   "feminine nominative plural of αὐτός, against οὗτος's αὗται",
}
accent_bad, accent_ok = [], []
for f in ("data/lessons.js", "data/paradigms.js", "data/readings.js",
          "data/vocab.js", "js/app.js"):
    for n, line in enumerate(io.open(os.path.join(ROOT, f), encoding="utf-8"), 1):
        # an ending is printed without its accent on purpose — "-εως", "-ους"
        stripped = re.sub(r"[-‑]" + GKR + "+", "", line)
        for m in _tok.finditer(stripped):
            raw = m.group(0)
            if len(raw) < 3:
                continue
            got, want = acc(raw), spell.get(flat(raw))
            if not want or got in want:
                continue
            # An ending or a tense sign is quoted bare, without an accent —
            # "σα", "θη", "μεν" as the answers to "the aorist passive sign is".
            if len(raw) <= 4 and not any(unicodedata.combining(c)
                                         for c in unicodedata.normalize("NFD", raw)):
                continue
            # A word standing before an enclitic throws an extra acute onto
            # its own last syllable (ἐδώκατέ σοι, ἀφῆκά με). The corpus only
            # ever shows it in that company; the plain form is the citation.
            if any(got in minus_one_acute(w) for w in want):
                continue
            line_s = "%-18s %-5d %-14s corpus has %s" % (f, n, raw,
                     ", ".join(sorted(want)[:3]))
            (accent_ok if raw in ACCENT_OK else accent_bad).append(
                line_s + ("  — " + ACCENT_OK[raw] if raw in ACCENT_OK else ""))
seen_a = set()
accent_bad = [x for x in accent_bad if not (x[19:] in seen_a or seen_a.add(x[19:]))]
excused.extend(sorted(set(accent_ok)))

# ------------------------------------------------------ the cue strings ---
# The "tts" field is what was fed to the voice, so a cue that reads as
# English produces English. θεός was "Theos", Σίμων was "Simon", ἐκκλησία
# was "ecclesia" — and the voice duly said SIGH-mun. Three cheap tests catch
# most of it: a capital letter (the sheet is otherwise lower case, and a
# capital is what makes a name look like a name to a voice); a syllable
# count that does not match the Greek; and a first consonant the cue does
# not begin with, which is how πνεῦμα lost its pi and μνημεῖον its mu.
VOWELS = "αειουηωἀἁἐἑἠἡἰἱὀὁὐὑὠὡάέήίόύώὰὲὴὶὸὺὼᾶῆῖῦῶᾳῃῳἄἅἔἕἤἥἴἵὄὅὔὕὤὥ"
DIPH = ("αι", "ει", "οι", "υι", "αυ", "ευ", "ηυ", "ου")
ONSET = {"β": "b", "γ": "g", "δ": "d", "ζ": "d", "θ": "t", "κ": "k", "λ": "l",
         "μ": "m", "ν": "n", "ξ": "k", "π": "p", "ρ": "r", "σ": "s", "τ": "t",
         "φ": "f", "χ": "k", "ψ": "p"}

def syllables(w):
    w = flat(bare(w)).lower()
    n, i = 0, 0
    while i < len(w):
        if w[i] in "αειουηω":
            n += 1
            i += 2 if w[i:i+2] in DIPH else 1
        else:
            i += 1
    return n

# Cues that are a syllable short on purpose. Both begin Ἰου-, and spelling
# that out gave "ee oo deye os" — 3.81 seconds of the voice listing letters.
# "yoo" binds the word at the cost of making the initial iota a glide rather
# than a syllable, which is what most English speakers say anyway. Chosen by
# ear against the alternative, not by accident.
CUE_OK = {
    77:  "ιου bound to 'yoo'; the spelled form ran to 3.81s",
    354: "ιου bound to 'yoo', as for Ἰουδαῖος",
    # ξ- at the start of a word is the one initial the voice will not say:
    # English has no word beginning ks, and every cue that tried dropped the
    # k or spelled the letter out. A helper vowel in front gives it something
    # to lean on, so the cluster survives at the cost of a syllable that is
    # not in the Greek. Heard, and logged in the cue sheet as
    # source:"ear-compromise" rather than a lock — it is the best available,
    # not the right answer.
    791: "ξ- cannot begin an English word, so a helper 'a' carries the ks",
}

# ---- A SECOND KIND OF CUE, and the three tests above do not apply to it ---
# Batch 9 found that this voice reads IPA between slashes, and reads it better
# than any English respelling: ὁράω's English cue had already been passed by
# ear, and the IPA beat it. τότε had no English spelling that worked at all in
# two rounds, because `tot` — a real English word with the right vowel — is
# read as the first syllable of TOTAL. The voice reads the SPELLING.
#
# An IPA cue fails every test above by construction: it begins with a slash,
# not with the word's first consonant, and it divides syllables with dots
# rather than spaces. Skipping the tests would leave it unchecked, which is
# worse, so it gets the test that actually fits: THE CUE MUST BE THE WORD'S
# OWN IPA, converted by the rule the ear settled one word at a time.
#
#   eu̯ -> ju   Black's ευ is *feud*; `eu̯` came out as *row*
#   o  -> ɒ     short omicron (no length mark) — Black's *not*
#   i  -> ɪ     short iota — Black's *pit*
#   ^e -> ɛ     ONLY where the string opens on it: μέγας /ˈme.ɡas/ and τότε
#               /ˈtɒ.te/ were approved with a plain e, and only ἐγείρω, which
#               opens on the vowel, was read as the letter name
#   ː and ̯     never touched: omega, long iota, and every diphthong's second
#               half. The first version of this conversion turned ὁράω's omega
#               into a short o.
#
# So docs/erasmian_ipa.json — which check_ipa already verifies five ways —
# becomes the authority for these cues too, and a typo in one cannot hide.
IPA_LONG, IPA_NONSYL = "\u02d0", "\u032f"

def ipa_cue(ipa):
    s = ipa.replace("eu" + IPA_NONSYL, "ju")
    # ζ is ONE sound and needs one character. The pack spells it `dz`, and 14B
    # found the voice reading that as two consonants with a vowel between
    # them — ἀσπάζομαι's `dzɒ` came out as *doz*. "The dzo sound better in B",
    # B being ʣ, the single ligature; a tie bar over d and z was in the same
    # lot and lost to it.
    #
    # This is the consonant version of what the non-syllabic mark does for a
    # diphthong: both say "these two letters are one sound, do not come apart
    # between them". Ten cues carry this ζ, 424 occurrences.
    s = s.replace("dz", "ʣ")
    # χ in the MIDDLE of a word is written as a plain k. 15B put εἰσέρχομαι up
    # as `kʰ`, as `k`, and as the English cue that had shipped all along; the
    # plain k won. It gives up the breath on chi, which is a real loss, and it
    # beat both the IPA that kept it and the English that kept it — and chi
    # already decodes as k in 78% of the clips this pack has shipped.
    #
    # At the FRONT of a word `x` stays: χάρις and χρεία have both approved it
    # there. The second lookbehind is the START plus a stress mark, not a
    # stress mark alone — οὐχί is `uː.ˈxi`, oo-KHEE, a MEDIAL chi that happens
    # to open the stressed syllable, and the loose form exempted it.
    s = re.sub("(?<!^)(?<!^ˈ)x", "k", s)
    # AND NO DOT IN FRONT OF IT. 14B's winner changed two things at once —
    # the ligature, and the dot before it — so which did the work was
    # unknown, and all ten ζ cues carry a dot in that position. Inferring a
    # rule from a round like that is how chi got written off for five
    # batches, so κράζω was built to separate them: same ligature in both
    # takes, the dot the only difference. Dotless won.
    #
    # So the dot is what lets the affricate come apart, and the ligature is
    # kept because it is in both winners — its own contribution has still
    # never been tested on its own, which this comment records rather than
    # rounds off.
    s = s.replace(".ʣ", "ʣ")
    s = re.sub("^(ˈ?)e(?![" + IPA_LONG + "]|i" + IPA_NONSYL + ")",
               "\\1ɛ", s)
    # An o that is the FIRST half of a diphthong is not a short omicron: οι is
    # Black's *oil*, and the non-syllabic mark sits on the SECOND vowel, so a
    # guard looking only for the mark straight after the o misses it. It
    # proposed /aˈnɒi̯.ɡoː/ for ἀνοίγω. No cue in the pack carries οι yet and
    # four of the unheard words do, so it was caught before it shipped — the
    # third time this conversion has been wrong about a diphthong.
    # A SHORT OMICRON SHUT IN BY AN r is the open-o, not ɒ. πορνεία came
    # back as *par* rather than *por* with ɒ, and took ɔ.
    #
    # It is the CLOSED syllable that does it, and the pack already says so:
    # ὁράω `ho.ˈra.oː` and πορεύομαι `po.ˈreu̯.o.mai̯` both have a dot
    # after the o, so the r starts the next syllable, and both ship ɒ quite
    # happily. χόρτος `ˈxor.tos` is shut the same way πορνεία is.
    #
    # A long omega keeps its own rule: `doːr` has the length mark between
    # the vowel and the r, so this never sees it.
    s = re.sub("o(?=r)", "ɔ", s)
    s = re.sub("o(?![" + IPA_LONG + IPA_NONSYL + "]|[iu]" + IPA_NONSYL + ")",
               "ɒ", s)
    # A long omega at the END of a word, closed by a sonorant, is recited
    # letter by letter — αἰών's `oːn` was in batch 11 and ὕδωρ's `oːr` in 13,
    # and both were fixed by writing Black's *gold* as English spells it. Two
    # words, nothing against, so it is a rule and not two allow-list entries.
    #
    # ONLY n and r, AND THAT WAS TESTED rather than assumed. Nine cues end in
    # `oːs` instead, so 13B put ὡς up — the deck's 34th commonest word — with
    # `oːs` against `oʊs`. "A and B both work well", A being the plain one, so
    # s does NOT recite the way n and r do and those nine convert as they
    # stand. The narrow rule is the right one and not merely the cautious one.
    #
    # It runs AFTER the short-o rule and not before it, because `oʊ` is a
    # digraph whose first half that rule would otherwise open. Written above,
    # it proposed /ˈhu.dɒʊr/ — the same fault as the three diphthongs met from
    # the other side: a rule that WRITES two characters has to be stepped over
    # as carefully as one that reads them.
    s = re.sub("o" + IPA_LONG + "([nr])$", "oʊ\\1", s)
    # A stressed iota is a PER-WORD question, and the source cannot settle it:
    # erasmian_ipa.json writes a long iota in one entry out of 818, so it does
    # not carry the quantity at all. καρδία took a long one under the stress
    # and πίπτω would not have it — "both sound like peep instead of pip" —
    # and the two are the same shape. The default here leaves it long, because
    # that is what was approved first; the other is an allow-list entry. A
    # stressed OMICRON is different and does open, five times over.
    # A STRESSED SHORT IOTA SHUT IN BY TWO CONSONANTS is written ɪ, and
    # the dot between those consonants goes with it. πίπτω would not have
    # the long one -- "both sound like peep instead of pip" -- and τίκτω
    # agreed in 21 on the same shape, which turned an exception into this.
    #
    # Sorted by what follows the stressed iota, every approved cue agrees:
    # a vowel or the word end leaves it long (καρδία, ἀρνίον, βιβλίον,
    # παρρησία, ῥαββί); ONE consonant leaves it long too (Δαυίδ, and
    # καθίζω whose ʣ is one sound); TWO open it.
    #
    # The dot half was tested on its own: batch 13 put `/ˈpɪp.toː/` against
    # `/ˈpɪptoː/` and the dotless one won. One remedy, two parts.
    s = re.sub("i(?![ːu̯])(?=\\.?[^aeiouyɒɛɪʊæɑɔ.ˈː̯]\\.?[^aeiouyɒɛɪʊæɑɔ.ˈː̯])", "ɪ", s)
    s = re.sub("ɪ([^aeiouyɒɛɪʊæɑɔ.ˈː̯])\\.([^aeiouyɒɛɪʊæɑɔ.ˈː̯])", "ɪ" + "\\1" + "\\2", s)
    out = []
    for syl in s.split("."):
        if "ˈ" not in syl:
            syl = re.sub("i(?![" + IPA_LONG + IPA_NONSYL + "])", "ɪ", syl)
        out.append(syl)
    s = ".".join(out)
    # THEN the dot immediately before the stress mark comes out, AFTER the
    # syllable rules and never before them. Batch 10B put four words up dotted
    # against dotless and three took the version with that one dot gone; the
    # fourth has its stress word-initial, so it has no such dot. The dot has
    # been read ALOUD twice, and both times it sat against the stress.
    #
    # ORDER MATTERS, AND THE FIRST ATTEMPT HAD IT WRONG. Taking the dot out
    # first merges the unstressed syllable into the stressed one, so the
    # opening syllable looks stressed and keeps its long iota: the converter
    # produced /pi.../ where the string an ear approved is /pɪ.../.
    # THE PRE-STRESS DOT SURVIVES AN e + SHORT-VOWEL HIATUS, and dies
    # everywhere else. γενεά lost `ɡe.neˈa` to `ɡe.ne.ˈa` in batch 19 — the
    # stress mark does not separate two vowels the way a dot does — and 19B
    # confirmed it on the two biggest words left on English respellings, θεός
    # at 1,317 occurrences and ἐάν at 331.
    #
    # RESTRICTED BY THE i, NOT BY THE e. 19B could only say "an e" because
    # e was all that had been tested; batch 20 asked λαός at 142
    # occurrences and ναός, and both kept their dot. The two dotless ones,
    # διά and δεξιός, are exactly the two with an i before the stress.
    # So i is the exception and every other short plain vowel keeps it.
    # ORIGINALLY RESTRICTED TO e ON PURPOSE. διά went the other way in that same round,
    # dotless, and δεξιός shipped dotless in 15; both have an i before the
    # stress where the three that kept the dot have an e. Wider still breaks
    # αἰών, Δαυίδ and Ἰούδας, whose hiatus holds a diphthong or a long vowel.
    # Checked against every approved cue: three gained, none lost.
    #
    # λαός, ναός and Ἀβραάμ are the untested a-initial cases. The rule leaves
    # them dotless, which is what they ship today, so being wrong about them
    # costs nothing until somebody listens.
    s = re.sub("(?<![aeouyɒɛ])\\.ˈ", "ˈ", s)
    s = re.sub("(?<=[aeouyɒɛ])\\.ˈ(?![aeiouyɒɛɪ](?![ːu̯i̯]))", "ˈ", s)
    # A cue ending in `ju` plus a consonant is written FULLY dotless, and the
    # three words that say so are the only three the route can reach: βασιλεύς
    # in 12B, γραμματεύς in 13B, ἱερεύς in 14. Three of three, each put up
    # dotted against dotless, so this stops being three allow-list entries
    # saying the same thing and becomes the rule they were describing.
    #
    # βασιλεύς is why it is worth having as a rule rather than a habit. Its
    # `ju` came out as *lee-oos*, with the l coming away from the glide, and
    # that reads as a glide that will not hold in third position — a
    # limitation on the ευ rule, which is the thing that released sixteen cues
    # in 9G. It was the dot. The condition that looked like it belonged to the
    # glide belonged to what was sitting next to it.
    #
    # It reaches no fourth word today. ἀρχιερεύς is the only other -εύς in the
    # deck and it is held back for IPA chi — so if that block lifts, this is
    # already written for it.
    if re.search("ju[^aeiouɒɛɪʊ.ː̯]+$", s):
        s = s.replace(".", "")
    return s

# Where the string that was HEARD differs from the string the rule proposes.
# The rule proposes; only a cue that produced a clip somebody approved may
# ship, so these are the heard ones and the difference is the entry.
IPA_HEARD = {
    215: "the pre-stress dot removed — and this is the word that ended a "
         "practice this project had used for twenty-five rounds. The screen "
         "caught the string saying its dot aloud, a re-roll cleared it, as the "
         "discipline had always said, and the CLEARED take went to an ear that "
         "heard the dot anyway. Measured afterwards: of 18 strings a re-roll "
         "had cleared, 8 said their dot within three more rolls, and of 20 "
         "that had never flagged, 3 said it too. A re-roll tells a transient "
         "beat-count mismatch from a real one and can never clear a string "
         "already caught; one detection condemns it",
    728: "the pre-stress dot removed, and the word that sharpened the "
         "detector. It said its dot on ALL THREE rolls — `hiːdɑːkʌtɑːn` — "
         "decoded as `dɑː` without the t, which the literal `dat` test could "
         "not see. This cue carries no d of its own, so any d in its decode "
         "can only be the dot, and 202 of the 275 remaining cues are like "
         "that. The sharper test is not yet proven: 43 of those cues carry an "
         "intervocalic t that American English can voice toward a d, and that "
         "false-positive rate is still unmeasured",
    567: "FULLY DOTLESS, and the ear caught what the screen had stopped "
         "seeing. A hiatus tolerance written the same day \u2014 so that \u03c7\u03b9\u03bb\u03b9\u03ac\u03c2 "
         "would stop being flagged for a glide the voice bridges \u2014 allowed "
         "the extra beat that was a dot being read aloud. Counting was always "
         "the wrong instrument: a spoken dot adds a beat, and so does a "
         "helper vowel, and so does a glide, so every tolerance added for "
         "those hides a dot behind it. \"Both good, B best\"",
    568: "the pre-stress dot removed, by the screen, after two takes read it aloud as the word dot",
    599: "the pre-stress dot removed, by the screen, after two takes read it aloud as the word dot",
    608: "the epsilon written OPEN, and the first fault the spoken-dot check "
         "found that the beat count had passed \u2014 five beats expected, five "
         "heard, and the word \"dot\" sitting in the decode IN PLACE OF one of "
         "them rather than added to it, which is precisely what a tally "
         "cannot see. Dedotting then cost the `er`, which collapsed to a "
         "schwa as \u1f01\u03bc\u03b1\u03c1\u03c4\u03ac\u03bd\u03c9's `mar` had, so the open \u025b is written instead "
         "\u2014 \u03c6\u03b1\u03bd\u03b5\u03c1\u03cc\u03c2's remedy. Its dotted alternative screened CLEAN and "
         "then spoke its dot on two later rolls, and was withdrawn before an "
         "ear ever saw it",
    731: "the pre-stress dot removed, by the screen, after two takes read it aloud as the word dot",
    372: "the alpha written LONG, and the lot that found the dedot's limit. "
         "Both dots read aloud as the word \"dot\" through two takes; taking "
         "them ALL out — the standing remedy, which had not failed before — "
         "went too far, and `mar` collapsed to a schwa so the word lost a "
         "syllable, the same elision φανερός had. Writing the alpha long is what "
         "ἀντί needed for a short a English would not keep in front of a "
         "sonorant. NOT A RULE, and it was checked before it was written: "
         "nine approved cues carry a consonant, a short vowel and an r and "
         "kept the vowel — καρπός and καρδία have `kar` in this very "
         "position. \"A, but either works\"",
    533: "THE UNTIED `dz`, not the tie-barred affricate the converter makes. "
         "Six approved cues carry `ʣ` and four of them have the identical "
         "`aʣoː`, so this looked like a bad roll — but not one of the six "
         "had ever been put against its `dz` alternative, and when this one "
         "was, `dz` won. The tie bar is load-bearing. The six are worth "
         "revisiting, the way the composed cues were",
    598: "THE PLAIN k at the FRONT of a word, which the medial-chi rule had "
         "never been asked for. `x` before a front vowel reads as the English "
         "name of the letter ξ, said /zaɪ/ — which is the z that was heard, and "
         "the letter-name fault a third time after ἀφίημι and εὐαγγέλιον. "
         "Word-initial `x` is approved twice and only before `a` (χάρις) and "
         "before `r` (χρεία). The aspirated `kʰ` was offered beside this and "
         "was not needed: \"A and B are both great\"",
    112: "the first dot removed, by the screen. It was read aloud as the "
         "WORD \"dot\" through two takes of the converter's own output. The "
         "hiatus dot at the end stays, which is the one this pack has "
         "evidence for",
    113: "FIVE ROUNDS, and what settled it was reading the cue as English "
         "rather than as sounds. `e\u02d0.m\u026a` IS the English letter names E, M, "
         "I, which is why three rearrangements of the dots never touched the "
         "spelling \u2014 the dots were never the fault, the eta was. Writing it "
         "`ei\u032f`, which 15 approved cues carry, fixed the eta and left the "
         "ENDING spelling; \u03b5\u1f30\u03bc\u03af `/ei\u032f\u02c8mi/` is the pack's only approved cue "
         "with `ei\u032f` against an m and it writes a plain `i` with a stress "
         "mark carrying the syllable. A secondary stress does the same job "
         "\u2014 weight rather than a pause, which is exactly what \u03b5\u1f50\u03b1\u03b3\u03b3\u03ad\u03bb\u03b9\u03bf\u03bd's glide "
         "needed one round earlier. \"C is best, A works too\"",
    384: "the first dot removed, by the screen, for the same reason and "
         "found the same way \u2014 two takes said \"dot\" where the dot is",
    210: "A SECONDARY STRESS on the ju, and no approved cue had used that "
         "symbol before this one. Four rounds: without a dot after `ju` the "
         "j sounds on its own, and with one the word spells. The approved "
         "cues said where the difference was \u2014 \u03b5\u1f50\u03c7\u03b1\u03c1\u03b9\u03c3\u03c4\u03af\u03b1 `/ju.ka.r\u026a\u02c8sti.a/` is "
         "word-initial ju, a dot, then a CONSONANT, and this is the pack's "
         "only one with a VOWEL after that dot. What the hiatus needed was "
         "WEIGHT rather than a pause, which is what the mark gives it",
    507: "the alpha written LONG, for its colour and not its quantity. "
         "\"Coming out as anti, should be more like aunty.\" A short alpha "
         "before a nasal is approved eight times over, so the nasal is not "
         "the fault; but a WORD-INITIAL short alpha is approved seven times "
         "and every one of them is shut by l, p, r or s \u2014 \u1f00\u03bb\u03bb\u03ac, "
         "\u1f00\u03c0\u03bf\u03c3\u03c4\u03ad\u03bb\u03bb\u03c9, \u1f00\u03c1\u03bd\u03af\u03bf\u03bd, \u1f00\u03c3\u03b8\u03b5\u03bd\u03ae\u03c2 \u2014 never by a nasal, which is "
         "the one place English has a prefix waiting. `a\u02d0` is the pack's "
         "one attested open *ah*: \u03bc\u1fb6\u03bb\u03bb\u03bf\u03bd, \u03c3\u03b1\u03c4\u03b1\u03bd\u1fb6\u03c2, \u03b2\u03b1\u03c1\u03bd\u03b1\u03b2\u1fb6\u03c2. The Greek "
         "vowel is short and the ear wanted the colour",
    616: "the dot between the double sigma removed, by the screen. It was "
         "read aloud as the WORD \"dot\" through two takes of the converter's "
         "own output, so the string was wrong and not the roll. `s.s` is "
         "the consonant-consonant shape the spoken dots favour",
    646: "BOTH pre-stress dots removed, by the screen \u2014 \"ah dot krah dot "
         "boostia\" through two takes. Only the hiatus at the end keeps its "
         "dot, which is the one this pack has evidence for. This is the "
         "word that argues the converter's pre-stress rule should reach "
         "further back than one syllable: \u1f00\u03c0\u03bf\u03b8\u03bd\u1fc4\u03c3\u03ba\u03c9 and \u1f00\u03c0\u03bf\u03ba\u03c4\u03b5\u03af\u03bd\u03c9 are "
         "both approved with nothing at all before the stress",
    378: "fully dotless, and the screen drove both removals. Its first dot was "
         "read aloud as the word \"dot\" on two takes; taking only that one "
         "out still screened badly, so the second went too and that is the "
         "version an ear chose",
    461: "one dot removed, for the same reason and found the same way — two "
         "takes said \"dot\" where the dot is. The doubled rho and the "
         "post-stress hiatus both survive untouched",
    650: "dotless, and it is the one sample word the screen caught. Its "
         "dotted form read the dot aloud as the WORD \"dot\" on two takes. "
         "Sixth word to do that and the FIRST drawn at random rather than "
         "chosen, which is what says the rate in the general population is "
         "not negligible and a bulk run cannot skip the screen",
    521: "dotless, and the screen drove it: the dotted form read its dot "
         "aloud as the word \"dot\" through two re-rolls. One of seventeen "
         "the bulk pass fixed the same way, and the only one of those that "
         "an ear has since approved",
    # SEVEN WORDS HAVE NOW SPELLED THEMSELVES OUT from one shape — a bare
    # vowel at the front of the cue with a dot behind it — and every one was
    # fixed by taking the dots out: Ἰωσήφ, Ἰακώβ, ἀριθμός, and these four.
    # It is NOT a rule, and two approved cues say why: ἐάν ships /ɛ.ˈan/ and
    # Ἰσαάκ ships /ɪ.sa.ˈak/, both opening on a bare vowel and both keeping
    # their dots. The seven are all three syllables or more and the two are
    # two and three, which is a hint and not a division. Per-word until
    # something separates them.
    455: "dotless — \"spells everything\" in the bulk sample",
    658: "dotless — \"spelled\" in the bulk sample",
    677: "fully dotless — \"all dots spoken\". Five syllables with none left "
         "runs together a little, which the ear noted and preferred anyway",
    767: "dotless but for the hiatus dot at the end, which is the one dot "
         "this pack has evidence FOR",
    76: "THE DOT RESTORED, and the approved cues predicted it. Every "
        "word-initial ɪ in the pack is followed by a VOWEL — Ἰωσήφ, Ἰακώβ, "
        "Ἰούδας — or by a dot, as Ἰσαάκ is. ἰδού was the first shut by a "
        "consonant, and a shut ɪ is the English *id*. It was in that round "
        "BECAUSE the coverage model flagged the pair as new, which is the "
        "model working rather than a surprise",
    50: "the open ɛ. A plain e came out as *pay*, and no approved cue "
        "explains why: νεφέλη, θεός and γενεά all carry the same unstressed "
        "short e before the stress and were all approved. Per-word until "
        "something separates them",
    231: "dotless — the dotted form read its dot aloud as the word \"dot\" "
         "through a re-roll, and the screen caught it before an ear did",
    736: "fully dotless, and the SCREEN found it rather than an ear: the "
         "dotted version decoded with `dɑːt` TWICE — the voice reading its "
         "syllable dots aloud as the word \"dot\", after ὑποτάσσω and "
         "βλασφημέω. NINE words have now done that, and there is a weak "
         "shape to it, measured rather than guessed: 38% of the dots in "
         "those nine sit between two consonants, against 19% of the 97 dots "
         "in approved cues. Twice the rate — but sixteen dots is a small "
         "count, and every dot in an offending word was counted a candidate "
         "when only one of them misbehaved. A tendency, not a rule. I twice "
         "wrote that they shared no shape at all, which was impression "
         "rather than arithmetic",
    278: "dotless. \"A is right but `te` is spelled out\" — the diphthong was "
         "fine and the final syllable was not. τότε ships the same final `te` "
         "dotless and that is where the fix came from",
    271: "dotless, and it beat the dotted version it had been approved as in "
         "batch 13 — two dots and a doubled consonant",
    198: "dotless, with a diphthong beside the dot",
    133: "dotless. Three syllables and every vowel short, which made it the "
         "cleanest test of the dot on its own",
    95: "dotless. The dotted form was approved in 9E and this beat it in 9I, "
        "after a syllable dot was read aloud in another word",
    284: "dotless, as τότε",
    123: "fully dotless, as καρδία. Its pre-stress dot was already out by the "
         "rule and it still spoke the rest. Five words have now read a dot "
         "aloud — αἰών, καρδία, ἀποστέλλω, ἀποθνῄσκω, βασιλεύς — and eight "
         "have been approved carrying one, with no length or shape separating "
         "the two groups. So it stays a per-word question and the remedy is "
         "always the same: take them all out",
    145: "fully dotless. The first IPA take had every sound right, theta "
         "included, and spoke all three dots; the same string without them "
         "was approved unchanged",
    98: "fully dotless — the rule takes out the dot before the stress and this "
        "took the one after it as well. The only word so far that has wanted "
        "that, and its last syllable is a bare vowel",
    205: "dotless, and it is the word that lifted the chi block. 9E sent its "
         "IPA twice, both lost to the English cue, and χ was excluded from "
         "the route on that — 14 cues and 517 occurrences. Both takes carried "
         "a syllable dot, which in 9E nobody knew could be read aloud; six "
         "words have since had a first IPA take sunk by dots alone. Put back "
         "up dotless, chi won first time",
    420: "dotless. `/ɪ.oːˈseːf/` was read out as letters — \"A spells i o s e "
         "f\" — and the string opens on a bare vowel with a dot behind it, "
         "which is the position this voice recites from most. Worth knowing "
         "that prelisten.py PASSED it and was right to: spelling the letters "
         "gives the same number of vowel runs as saying the word, so counting "
         "syllables cannot see this fault at all",
    431: "its first dot removed, and the SCREEN found it rather than an ear. "
         "The dotted version decoded with `dɑːt` in the middle, twice over — "
         "the voice reading the syllable dot aloud as the WORD \"dot\", which "
         "ὑποτάσσω also did in 16B.\n"
         "         IT IS NOT A PATTERN ABOUT s, though both words have the "
         "dot after one: κηρύσσω, τέσσαρες and πράσσω are all approved "
         "carrying `s.`, and ὑποτάσσω spoke two dots, one of them after a "
         "vowel. So it is the same per-word dot question the pack already "
         "has, in a louder form — an extra word rather than an extra beat",
    395: "BLACK'S OWN KEYWORD for short alpha, which this pack has never "
         "written. `/ˈhap.toː/` came back as *hup to* — the alpha "
         "centralised to a schwa behind the rough breathing — and Black gives "
         "short α as *bat*, which is /æ/ exactly. It is NOT a general rule "
         "and the same round proves it: Σατανᾶς was approved as "
         "/sa.taˈnaːs/, two plain a's, unstressed and in open syllables. "
         "This one is stressed, behind an h, and closed by πτ.\n"
         "         BATCH 17 WAS BUILT TO SEPARATE THOSE THREE and each "
         "control kept its plain a: πράσσω stressed and closed with no "
         "breathing, ἅπας with breathing and stress but the syllable open, "
         "μάρτυς stressed and closed by r. So it is not the stress, not the "
         "breathing, and not closure in general — what is left is the "
         "conjunction of all three, or the πτ cluster itself, and no word in "
         "the deck separates those two",
    401: "fully dotless, and the SCREEN is why rather than an ear. The dotted "
         "version decoded as `huːdatpatasdatsoʊ` — `dat` twice, the voice "
         "reading the dot aloud as the WORD \"dot\". Every dot fault before "
         "it was an extra beat; this was an extra word, and it never reached "
         "a person",
    419: "the dot taken out of a vowel HIATUS. With it in, `ka.ɒ` read the "
         "short omicron long — \"ɒ sounds like omega\" — and eight cues have "
         "carried ɒ without trouble, not one of them between two vowels. So "
         "the position is new rather than the symbol",
    326: "dotless. \"A is better but the . (dot) is being spoken\" — so its "
         "word-initial chi was never in question, which χάρις had already "
         "settled, and only the dot was",
    224: "dotless. \"A spells everything\" — the voice reads a string out "
         "letter by letter when the dots leave it nothing to say, and ξ "
         "written `ks` opening a syllable is a cluster English does not begin "
         "one with. Same remedy as always",
    263: "fully dotless. The sounds were right on the first IPA take — "
         "including the first ει through this route, Black's *they* — and "
         "only the dots were spoken",
    315: "a PLAIN o, after four strings that were not. ɒ came back as "
         "*our*, ɔ as *de or*, and both dɪ and di in front of them named "
         "the letters. This pack opens a short o everywhere else precisely "
         "because the voice reads a plain one LONG — and long is what this "
         "word wants to sound like, though the Greek omicron is short",
    541: "dotless, Ἰωσήφ's remedy applied to Ἰωσήφ's shape: both open on "
         "a bare iota with a dot behind it and both spelled themselves out. "
         "Also the first cue in the pack to end in a stop",
    697: "dotless, and the screen caught it rather than an ear — the dotted "
         "version named its letters, ay-ar-rye-eth-em-oh-es, identically on "
         "two takes. Third word to do that from a bare vowel and a dot at "
         "the front",
    70: "KEEPS ITS DOT. Batch 11 put the five queued pre-stress dots up and "
        "four took the dotless version; this one did not. So the rule is a "
        "default and not a law, and this is the word that says so",
}


try:
    _ipa = json.load(io.open(os.path.join(ROOT, "docs", "erasmian_ipa.json"),
                             encoding="utf-8"))
    IPA = ({x.get("greek"): x.get("ipa") for x in _ipa}
           if isinstance(_ipa, list) else _ipa)
except Exception as _e:                      # never silently: an IPA cue would
    IPA = None                               # then go unchecked and read green

tts_bad, ipa_cues, ipa_excused = [], [], set()
if IPA is None:
    tts_bad.append("docs/erasmian_ipa.json could not be read, so no IPA cue "
                   "can be checked")
for path in ("docs/erasmian_vocab_cues.json",
             "docs/erasmian_vocab_cues_v3_black.json",
             "docs/erasmian_vocab_cues_v4_tail.json"):
    fp = os.path.join(ROOT, path)
    if not os.path.isfile(fp):
        continue
    for r in json.load(io.open(fp, encoding="utf-8")):
        gk, tts = r.get("greek", ""), (r.get("tts") or "")
        tag = "%3s %-14s %-18s" % (r.get("index"), gk, '"' + tts + '"')
        if not tts:
            tts_bad.append(tag + " has no cue"); continue
        if tts.startswith("/") or tts.endswith("/"):
            if not (tts.startswith("/") and tts.endswith("/") and len(tts) > 2):
                tts_bad.append(tag + " looks like IPA and is not closed by "
                                     "slashes at both ends")
                continue
            ipa = IPA.get(gk)
            if not ipa:
                tts_bad.append(tag + " is an IPA cue for a word with no entry "
                                     "in docs/erasmian_ipa.json")
            elif tts[1:-1] != ipa_cue(ipa):
                want = "/%s/" % ipa_cue(ipa)
                line = tag + " is not this word's IPA converted: expected " + want
                if r.get("index") in IPA_HEARD:
                    excused.append(line + "  — " + IPA_HEARD[r["index"]])
                    ipa_excused.add(r["index"])
                else:
                    tts_bad.append(line)
            ipa_cues.append(r.get("index"))
            continue
        if any(c.isupper() for c in tts):
            tts_bad.append(tag + " has a capital — a voice reads that as a name")
        # Count vowel groups in the cue, not words: "keffa lay" is two words
        # and three syllables, and only the syllables matter. A cue more than
        # one syllable short has swallowed something, which is how δικαιόω
        # lost its contract vowel; being long is a helper vowel ("puh toh
        # koss" for πτωχός) and is fine.
        ns = syllables(gk)
        nt = len(re.findall(r"[aeiouy]+", tts.lower()))
        if ns and nt and nt < ns - 1:
            line = tag + " sounds %d syllables for a %d-syllable word" % (nt, ns)
            if r.get("index") in CUE_OK:
                excused.append(line + "  — " + CUE_OK[r["index"]])
            else:
                tts_bad.append(line)
        first = flat(bare(gk))[:1]
        want = ONSET.get(first)
        # c, k, ch and q all give /k/; what matters is whether the consonant
        # is there at all, not which letter spells it
        SAME = {"k": ("k", "c", "ch", "q"), "t": ("t", "th"), "p": ("p", "ph"),
                "f": ("f", "ph"), "s": ("s", "ps", "z"), "d": ("d", "dz", "z"),
                "g": ("g", "gh"), "r": ("r", "rh"), "n": ("n", "gn"),
                "m": ("m", "mn"), "l": ("l",), "b": ("b",)}
        if want and not tts.lower().lstrip().startswith(SAME.get(want, (want,))):
            line = tag + " does not begin with the %s of %s" % (want, gk)
            # CUE_OK excuses this rule too. It was only consulted by the
            # syllable count above, so a cue deliberately given a helper
            # vowel — the one thing that makes an initial ξ sayable — could
            # be listed as reviewed and still fail.
            if r.get("index") in CUE_OK:
                excused.append(line + "  — " + CUE_OK[r["index"]])
            else:
                tts_bad.append(line)

# An IPA_HEARD entry that no longer excuses anything is DEAD, and a dead one
# is worse than none: it is a paragraph of reasoning attached to a difference
# that has stopped existing, and the next person to read it believes it.
#
# This fires whenever a rule grows to cover what an entry used to excuse,
# which has now happened twice in two days. αἰών's entry described the oʊ
# ending as a one-word exception, and ὕδωρ made it a rule. βασιλεύς's and
# γραμματεύς's described -εύς as wanting dotless, and ἱερεύς made that a rule
# too. Both times the entries went stale in the same commit that earned the
# rule, and nothing would have said so.
for _i in sorted(set(IPA_HEARD) - ipa_excused):
    tts_bad.append("IPA_HEARD excuses index %d and nothing there differs from "
                   "the rule any more — the rule now covers it, so the entry "
                   "is stale reasoning and should go" % _i)

# ------------------------------------------------------- prepositions ----
# A preposition's gloss names the case it governs — "in, on, among (+dat)" —
# and that is a claim about running text, not about the word, so it is not
# in the parse code. It is still in the corpus: take the case of the first
# word after the preposition that carries one. Anything the deck claims
# should be there, and anything it uses often should be claimed.
CASEC = {"G": "gen", "D": "dat", "A": "acc"}
prepbad = []
governs = collections.defaultdict(collections.Counter)
prep_lemma = {}
for i, v in enumerate(VOCAB):
    if v[3] == "prep" and i not in RETIRED:
        j = lemma_index(v)
        if j is not None:
            prep_lemma[j] = i
if prep_lemma:
    for b in man["books"]:
        d = json.load(io.open(os.path.join(GNT, b["a"] + ".json"), encoding="utf-8"))
        for ch in d["c"]:
            for vs in ch:
                ws = vs[1]
                for k, w in enumerate(ws):
                    if w[1] not in prep_lemma or POS[w[2]] != "P-":
                        continue
                    for nx in ws[k + 1:k + 5]:
                        c = nx[3]
                        if len(c) > 4 and c[4] in CASEC:
                            governs[w[1]][c[4]] += 1
                            break
    for j, i in sorted(prep_lemma.items(), key=lambda kv: kv[1]):
        v, c = VOCAB[i], governs[j]
        tot = sum(c.values())
        if not tot:
            continue
        # Only what is inside the (+…) marker counts as a claim. Searching the
        # whole gloss read "acc" out of ἕνεκεν's "on account of" and reported a
        # preposition as claiming a case it never mentions.
        said = {x for m in re.findall(r"\(\+([^)]*)\)", v[1])
                for x in CASEC.values() if x in m}
        real = {CASEC[k] for k, n in c.items() if n >= max(3, 0.05 * tot)}
        tag = "%3d %-14s" % (i, headword(v))
        share = ", ".join("%s %d%%" % (CASEC[k], round(100.0 * n / tot))
                          for k, n in c.most_common())
        if not said:
            prepbad.append("%s claims no case; it governs %s" % (tag, share))
        elif said - real:
            prepbad.append("%s claims %s, but governs %s"
                           % (tag, "/".join(sorted(said)), share))
        elif real - said:
            prepbad.append("%s claims only %s, but governs %s"
                           % (tag, "/".join(sorted(said)), share))

# ------------------------------------------------- the reader's glosses ---
# manifest.json's gloss[] is what the tap-to-parse reader shows. It should
# hold each deck word's own gloss, on its own lemma, and nothing else.
wrong_gloss, missing_gloss = [], []
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_gloss_map import MERGED          # the reader-only wording it sets
own = {}
for i, v in enumerate(VOCAB):
    if i in RETIRED:
        continue
    j = lemma_index(v)
    if j is not None:
        own.setdefault(j, v[1])

for j, g in enumerate(GLOSSES):
    if not g:
        continue
    if own.get(j) != g and MERGED.get(LEMMAS[j]) != g:
        src = next((headword(v) for v in VOCAB if v[1] == g), "?")
        wrong_gloss.append("%-16s reads %-38s (that is %s's gloss)"
                           % (LEMMAS[j], '"' + g[:36] + '"', src))
for j, g in sorted(own.items(), key=lambda kv: -count[kv[0]]):
    if not GLOSSES[j]:
        missing_gloss.append("%-16s %-38s %d in the SBLGNT"
                             % (LEMMAS[j], '"' + g[:36] + '"', count[j]))

# ------------------------------------------------------------- the audio --
CUES = [("docs/erasmian_vocab_cues.json", "the original 470"),
        ("docs/erasmian_vocab_cues_v3_black.json", "the 41 for Black"),
        ("docs/erasmian_vocab_cues_v4_tail.json", "the 307 tail")]
audio_bad, cue_bad = [], []

VDIR = os.path.join(ROOT, "audio", "vocab")
on_disk = set(os.listdir(VDIR)) if os.path.isdir(VDIR) else set()

# Shorter is allowed and expected: the deck grows in one step and the
# recordings follow in their own time, and VOCAB_AUDIO[i] being undefined is
# what every caller already reads as "no clip" — no Hear-it button, no lit
# speaker. Longer is still a fault, because an entry past the end of VOCAB
# points at a word that does not exist.
if len(VOCAB_AUDIO) > len(VOCAB):
    audio_bad.append("VOCAB_AUDIO has %d entries, VOCAB only %d — the two are "
                     "indexed together, so the extra ones name nothing"
                     % (len(VOCAB_AUDIO), len(VOCAB)))
for i, f in enumerate(VOCAB_AUDIO):
    if not f:
        continue
    if not f.startswith("%03d_" % i):
        audio_bad.append("%3d is %s — the number in the name is the scheduler "
                         "index, and it does not match" % (i, f))
    if f not in on_disk:
        audio_bad.append("%3d %-22s missing from audio/vocab/" % (i, f))
used = {f for f in VOCAB_AUDIO if f}
for f in sorted(on_disk - used):
    audio_bad.append("audio/vocab/%s is on disk but nothing plays it" % f)

# every clip the lexical line needs, and every clip the line never asks for
form_bad = []
FDIR = os.path.join(ROOT, "audio", "forms")
fdisk = set(os.listdir(FDIR)) if os.path.isdir(FDIR) else set()
wanted = collections.Counter()
for i, v in enumerate(VOCAB):
    if i in RETIRED:
        continue
    for p in [p.strip() for p in v[0].split(",")][1:]:
        if p and not p.lstrip().startswith(("-", "‑")) and p in FORM_AUDIO:
            wanted[p] += 1
for g, f in FORM_AUDIO.items():
    if f not in fdisk:
        form_bad.append("%-8s %-18s missing from audio/forms/" % (g, f))
    if not wanted[g]:
        form_bad.append("%-8s %-18s is never reached from a lexical line" % (g, f))
for f in sorted(fdisk - set(FORM_AUDIO.values())):
    form_bad.append("audio/forms/%s is on disk but nothing plays it" % f)

# the cue sheets, row by row, against vocab.js
covered = set()
for path, what in CUES:
    p = os.path.join(ROOT, path)
    if not os.path.isfile(p):
        cue_bad.append("%s is missing" % path); continue
    rows = json.load(io.open(p, encoding="utf-8"))
    for r in rows:
        i = r.get("index")
        name = "%s[%s]" % (os.path.basename(path), i)
        if not isinstance(i, int) or not (0 <= i < len(VOCAB)):
            cue_bad.append("%s has no usable index" % name); continue
        if i in covered:
            cue_bad.append("%s is listed twice" % name)
        covered.add(i)
        v = VOCAB[i]
        tag = "%3d %-14s" % (i, headword(v))
        if r.get("filename") != VOCAB_AUDIO[i]:
            cue_bad.append("%s cue names %s, the app plays %s"
                           % (tag, r.get("filename"), VOCAB_AUDIO[i]))
        for key, mine, label in (("greek", headword(v), "headword"),
                                 ("greek_full", v[0], "lexical line"),
                                 ("gloss", v[1], "gloss"),
                                 ("pos", v[3], "part of speech"),
                                 ("freq", v[2], "frequency"),
                                 ("tier", v[4], "tier")):
            if r.get(key) != mine:
                cue_bad.append("%s cue %s is %r, vocab.js has %r"
                               % (tag, label, r.get(key), mine))
        # The clip's own fingerprint, which is the only exact way to ask
        # whether the row still describes the file.
        #
        # This replaces a byte-count estimate of the duration, and the reason
        # is worth keeping. "64 kbps CBR mono, so file size gives the duration
        # to about a hundredth of a second" was wrong: measured against
        # ffprobe the estimate is out by 0.064s on average, against a 0.05s
        # tolerance. So it fired on 173 rows, had fired on them for months,
        # and was a soft warning nobody read. A check that always fails
        # teaches you to ignore it, which is its own kind of blindness --
        # among those 173 were 64 clips that really had been replaced without
        # the sheet being brought along, and they were invisible inside the
        # noise. The duration_s values themselves had been computed with that
        # same formula rather than measured, which is why 612 of 639 were too
        # long by the same amount in the same direction.
        #
        # check_sounds has hashed the 32 letter clips this way since it was
        # written, and said why: "a clip could be replaced and the record left
        # describing the clip it replaced, which is the same falsification as
        # editing `tts` to match a clip after the fact." That was true of the
        # other 818 the whole time.
        f = os.path.join(VDIR, r.get("filename") or "")
        if os.path.isfile(f):
            got = hashlib.sha1(io.open(f, "rb").read()).hexdigest()[:12]
            if not r.get("sha1"):
                cue_bad.append("%s has no sha1 in the cue sheet" % tag)
            elif r["sha1"] != got:
                cue_bad.append(
                    "%s the clip is not the one this row describes — file is "
                    "%s, the sheet says %s. Either the clip was replaced "
                    "without the row being brought along, or the row was "
                    "edited to describe a clip that was never made. Update "
                    "tts/source/take/duration_s/sha1 together."
                    % (tag, got, r["sha1"]))
for i in range(min(len(VOCAB), len(VOCAB_AUDIO))):
    if i not in covered and VOCAB_AUDIO[i]:
        cue_bad.append("%3d %-14s has a clip but no cue sheet row"
                       % (i, headword(VOCAB[i])))

# ------------------------------------------------------------------ run ---
def section(title, items, limit=None):
    print("%s: %d" % (title, len(items)))
    for s in items[:limit]:
        print("   " + s)
    if limit and len(items) > limit:
        print("   ... and %d more" % (len(items) - limit))
    print()

# js/app.js writes the corpus's running-word count down rather than loading
# 4.4MB of book JSON to count it on the Progress page. Counted here every
# run, because a number written down is a number that drifts.
_appjs = io.open(os.path.join(ROOT, "js", "app.js"), encoding="utf-8").read()
_m = re.search(r"const NT_TOKENS=(\d+);", _appjs)
nt_bad = []
if not _m:
    nt_bad.append("js/app.js no longer declares NT_TOKENS")
elif int(_m.group(1)) != sum(count.values()):
    nt_bad.append("js/app.js says the New Testament has %s running words; the "
                  "corpus has %d" % (_m.group(1), sum(count.values())))

print("vocabulary entries: %d (%d retired)   corpus lemmas: %d   tokens: %d"
      % (len(VOCAB), len(RETIRED), len(LEMMAS), sum(count.values())))
print("running words the app writes down, against the corpus: %s"
      % ("disagree" if nt_bad else "agree"))
for _b in nt_bad:
    print("   " + _b)
print("example verses: %d verified word for word, %d entries without one"
      % (ex_ok, len(ex_none)))
print()
section("malformed entries", shape)
section("headwords the SBLGNT does not use as a lemma", unattested)
section("duplicate headwords", dupes)
section("part of speech contradicted by the corpus", posbad)
freqbad.sort(reverse=True)
section("frequencies more than 6% from the SBLGNT count", [s for _, s in freqbad], 25)
section("lexical lines contradicted by the corpus", citebad)
section("citation forms that occur nowhere in the SBLGNT", formbad)
section("example verses that do not show the word", ex_bad)
section("cue strings a voice would read wrongly", tts_bad, 20)
section("principal parts that cannot reach their card", pp_bad)
section("accents the corpus never writes that way", accent_bad, 25)
section("prepositions whose gloss disagrees with the text", prepbad)
section("reader glosses sitting on the wrong word", wrong_gloss, 30)
section("deck words the reader cannot gloss", missing_gloss, 30)
section("audio files and the index", audio_bad, 20)
section("shared lexical-form clips", form_bad, 20)
section("cue sheet rows that disagree with vocab.js", cue_bad, 30)
section("looks wrong, checked, and is not", excused)

hard = (shape + unattested + dupes + posbad + citebad + formbad + prepbad + ex_bad
        + pp_bad + accent_bad + tts_bad
        + wrong_gloss + missing_gloss + audio_bad + form_bad + cue_bad + nt_bad)
sys.exit(1 if hard else 0)

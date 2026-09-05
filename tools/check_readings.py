# -*- coding: utf-8 -*-
"""Check data/readings.js against the SBLGNT in data/gnt/.

    python tools/check_readings.py

The twelve graded passages are real New Testament text with a hand-written
gloss on almost every word, and most of those glosses make an explicit
grammatical claim — "impf act ind 3sg of εἰμί", "dat sg fem of ἀρχή". The
corpus carries a full parse for every token of the same text, so both the
Greek and the claims about it can be checked rather than trusted.

Four passes:

  1. The text. Each passage is aligned word for word against the verses its
     reference names. A missing, extra or misspelled word shows up here.

  2. The parse claims. Once aligned, every abbreviation in a gloss is checked
     against the corpus parse for that exact token — case, number, gender,
     tense, voice, mood, person, and the lemma named after "of".

  3. The references themselves: does the passage span the verses it says?

  4. The four fields tools/build_readings.py appends to each word — lemma,
     part of speech, parse code and VOCAB index. These are generated rather
     than written, so what is checked is that they have not gone stale: a
     regenerated data/vocab.js moves the last of them, exactly as it moves
     data/examples.js, and a passage still carrying yesterday's indices would
     colour the reader by the wrong words and offer a cloze the wrong
     distractors.

What it does not check is the English after the em dash. A gloss is a
translation choice in context and the corpus cannot arbitrate it.
"""
import json, io, os, re, sys, unicodedata, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GNT = os.path.join(ROOT, "data", "gnt")
GK = "Ͱ-Ͽἀ-῿"
bare = lambda s: re.sub("[^" + GK + "]", "", s)

def norm(x):
    """Acute and grave are the same form — Greek shifts one to the other
       before a following word. Breathings are kept: they distinguish words."""
    d = unicodedata.normalize("NFD", x).replace("̀", "́")
    return unicodedata.normalize("NFC", d).lower()

# ------------------------------------------------------------ app data ----
def load_js():
    import subprocess
    js = ("const fs=require('fs'),vm=require('vm');const c=vm.createContext({});"
          "for(const f of ['data/vocab.js','data/readings.js'])"
          "vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});"
          "process.stdout.write(vm.runInContext('JSON.stringify({READINGS})',c));")
    out = subprocess.run(["node", "-e", js], cwd=ROOT, capture_output=True, text=True,
                         encoding="utf-8")
    if out.returncode:
        sys.exit("could not load the app data:\n" + out.stderr)
    return json.loads(out.stdout)

READINGS = load_js()["READINGS"]
man = json.load(io.open(os.path.join(GNT, "manifest.json"), encoding="utf-8"))
BY_TITLE = {b["t"]: b for b in man["books"]}

def verses_for(ref):
    """'John 1:1-5' -> [(verse number, [token, parse code, lemma]), ...]"""
    m = re.match(r"^(.*?)\s+(\d+):(\d+)(?:[-–](\d+))?$", ref.strip())
    if not m:
        return None, "reference not understood"
    title, ch, v1, v2 = m.group(1), int(m.group(2)), int(m.group(3)), int(m.group(4) or m.group(3))
    b = BY_TITLE.get(title)
    if not b:
        return None, "no book called %r" % title
    d = json.load(io.open(os.path.join(GNT, b["a"] + ".json"), encoding="utf-8"))
    nums = b.get("n") or list(range(1, len(d["c"]) + 1))
    if ch not in nums:
        return None, "chapter %d not in %s" % (ch, title)
    chapter = d["c"][nums.index(ch)]
    out = []
    for vs in chapter:
        if v1 <= vs[0] <= v2:
            for w in vs[1]:
                out.append((vs[0], w[0], w[3], man["lemmas"][w[1]], man["pos"][w[2]]))
    missing = [v for v in range(v1, v2 + 1)
               if not any(x[0] == v for x in out)]
    return out, ("verses absent from the SBLGNT: %s" % missing if missing else None)

# ----------------------------------------------------- the parse claims ---
CASE = {"nom": 4, "gen": 4, "dat": 4, "acc": 4, "voc": 4}
CASEV = {"nom": "N", "gen": "G", "dat": "D", "acc": "A", "voc": "V"}
NUM = {"sg": "S", "pl": "P"}
GEN = {"masc": "M", "fem": "F", "neut": "N"}
TENSE = {"pres": "P", "impf": "I", "fut": "F", "aor": "A", "pf": "X", "perf": "X",
         "plup": "Y"}
VOICE = {"act": "A", "mid": "M", "pass": "P"}
MOOD = {"ind": "I", "subj": "S", "impv": "D", "opt": "O", "inf": "N", "ptc": "P"}
PERSON = {"1sg": ("1", "S"), "2sg": ("2", "S"), "3sg": ("3", "S"),
          "1pl": ("1", "P"), "2pl": ("2", "P"), "3pl": ("3", "P")}
POSWORD = {"article": {"RA"}, "conj": {"C-"}, "prep": {"P-"}, "adv": {"D-"},
           "particle": {"X-"}, "demonstrative": {"RD"}, "relative": {"RR"},
           "pronoun": {"RP", "RD", "RR", "RI"}}

def claims(gloss):
    head = gloss.split("—")[0] if "—" in gloss else gloss
    lemma = None
    m = re.search(r"\bof\s+([" + GK + r"]+)", head)
    if m:
        lemma = m.group(1)
    # "prep + dat" says the word is a preposition and that it governs the
    # dative. The dative is a fact about its object, and a preposition's own
    # parse code is all dashes — so anything after the "+" is not a claim
    # about this word, and reading it as one marks every preposition wrong.
    head = head.split("+")[0]
    toks = [t for t in re.split(r"[\s/,()]+", head) if t]
    return toks, lemma

def check(tok, code, pos, lemma, gloss):
    """Returns a list of complaints about this one gloss."""
    toks, want_lemma = claims(gloss)
    bad = []
    for t in toks:
        tl = t.lower().rstrip(".")
        if tl in CASEV:
            if len(code) > 4 and code[4] != CASEV[tl]:
                bad.append("says %s" % tl)
        elif tl in NUM:
            if len(code) > 5 and code[5] not in ("", "-") and code[5] != NUM[tl]:
                bad.append("says %s" % tl)
        elif tl in GEN:
            if len(code) > 6 and code[6] not in ("", "-") and code[6] != GEN[tl]:
                bad.append("says %s" % tl)
        elif tl in TENSE:
            if len(code) > 1 and code[1] != TENSE[tl]:
                bad.append("says %s" % tl)
        elif tl in VOICE:
            if len(code) > 2 and code[2] != VOICE[tl]:
                bad.append("says %s" % tl)
        elif tl in MOOD:
            if len(code) > 3 and code[3] != MOOD[tl]:
                bad.append("says %s" % tl)
        elif tl in PERSON:
            p, n = PERSON[tl]
            if len(code) > 5 and (code[0] != p or code[5] != n):
                bad.append("says %s" % tl)
        elif tl in POSWORD:
            if pos not in POSWORD[tl]:
                bad.append("says %s" % tl)
    if want_lemma and norm(want_lemma) != norm(lemma):
        bad.append("says it is from %s" % want_lemma)
    return bad

# ------------------------------------------------------------------ run ---
text_problems, parse_problems, ref_problems, stale = [], [], [], []
words_checked = claims_checked = coded = 0

# The deck, for the VOCAB index each word now carries.
V = re.findall(r'^\["(.*?)","(.*?)",(\d+),"(\w+)",(\d)\]',
               io.open(os.path.join(ROOT, "data", "vocab.js"), encoding="utf-8").read(), re.M)
RETIRED = {237}
CITATION = {"τε": "τέ", "οὕτως": "οὕτω(ς)", "δεῖ": "δέω",
            "ἱερόν": "ἱερός", "ἐλεέω": "ἐλεάω"}
VIDX = {}
for i, v in enumerate(V):
    if i not in RETIRED:
        h = v[0].split(",")[0].strip()
        VIDX.setdefault(norm(CITATION.get(h, h)), i)

for r in READINGS:
    toks, err = verses_for(r["ref"])
    if toks is None:
        ref_problems.append("%s (%s): %s" % (r["id"], r["ref"], err))
        continue
    if err:
        ref_problems.append("%s (%s): %s" % (r["id"], r["ref"], err))
    mine = r["w"]
    if len(mine) != len(toks):
        text_problems.append("%s (%s): %d words in the app, %d in the SBLGNT"
                             % (r["id"], r["ref"], len(mine), len(toks)))
    for i, row in enumerate(mine):
        if i >= len(toks):
            break
        w, g = row[0], row[1]
        _, form, code, lemma, pos = toks[i]
        words_checked += 1
        if norm(bare(w)) != norm(bare(form)):
            text_problems.append("%s word %d: app has %r, the SBLGNT has %r"
                                 % (r["id"], i + 1, w, form))
            continue
        # the generated fields, if the file has been through build_readings
        if len(row) >= 6:
            coded += 1
            want = [lemma, pos, code, VIDX.get(norm(lemma), -1)]
            if row[2:6] != want:
                stale.append("%s word %d (%s): carries %r, the corpus and the "
                             "deck give %r — re-run tools/build_readings.py"
                             % (r["id"], i + 1, form, row[2:6], want))
        elif len(row) != 2:
            stale.append("%s word %d (%s): has %d fields, which is neither the "
                         "old two nor the generated six" % (r["id"], i + 1, form, len(row)))
        if g.strip():
            claims_checked += 1
            for c in check(form, code, pos, lemma, g):
                parse_problems.append("%-8s %-14s %-46s %s  [corpus: %s %s %s]"
                                      % (r["id"], form, g[:46], c, pos, code, lemma))

print("passages: %d   words aligned: %d   glosses with a claim: %d   "
      "words carrying a parse: %d"
      % (len(READINGS), words_checked, claims_checked, coded))
print()
print("reference problems: %d" % len(ref_problems))
for p in ref_problems: print("   " + p)
print("text differences from the SBLGNT: %d" % len(text_problems))
for p in text_problems: print("   " + p)
print("generated fields out of date: %d" % len(stale))
for p in stale: print("   " + p)
print("parse claims contradicted: %d" % len(parse_problems))
for p in parse_problems: print("   " + p)
sys.exit(1 if (text_problems or parse_problems or ref_problems or stale) else 0)

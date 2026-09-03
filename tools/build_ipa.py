# -*- coding: utf-8 -*-
"""Turn every headword in data/vocab.js into an IPA string, by rule.

    python tools/build_ipa.py [--dry-run]

Writes docs/erasmian_ipa.json: one row per VOCAB index with the phonemes,
the syllable split and where the stress falls.

WHY THIS EXISTS. The clips are made by an English text-to-speech voice fed a
respelling — "see mohn", "ek klay see ah". That voice is doing English
word-prediction, so it is free to decide that "see mohn" is Sea Moon, and it
does. Worse, the failure is invisible: a respelling cannot be checked against
anything, so the only test is a human listening to 511 files, and drift in
vowel quality or stress passes that test far too easily.

An IPA string removes the engine's discretion. <phoneme alphabet="ipa"
ph="ek.klɛː.si'a"> is an instruction, not a suggestion. And because the
string is derived from the Greek by rule, the rule can be checked — which is
what tools/check_ipa.py does, and what nothing about the current pack can do.

THE PRONUNCIATION IS THE APP'S OWN. Every value below is read from the
alphabet table the app already teaches in lesson 1 and speaks in
data/audio.js — "th as in thing", "ch as in loch", "u as in French tu",
"o as in tone (long)". This is the anglicised Erasmian of the seminary
classroom, not reconstructed Attic, and check_ipa.py fails if the two ever
disagree.

WHAT IS DELIBERATELY NOT ATTEMPTED. Vowel length is only marked where the
writing system settles it: η and ω are always long, ου is long, and a
circumflex sits only on a long vowel. Where α, ι and υ are ambiguous they
are left short, because the app's own cue sheet does not distinguish them
either ("ah" for every alpha). Guessing would be inventing precision the
course does not teach.
"""
import json, io, os, re, sys, unicodedata, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "docs", "erasmian_ipa.json")
DRY = "--dry-run" in sys.argv

ACUTE, GRAVE, CIRC = "́", "̀", "͂"
SMOOTH, ROUGH, DIAER, IOTA = "̓", "̔", "̈", "ͅ"
ACCENTS = (ACUTE, GRAVE, CIRC)

# ------------------------------------------------------- the sound table ---
# letter -> IPA. Sourced from ALPHABET in data/lessons.js; check_ipa.py
# re-reads that table and fails if this drifts from it.
CONS = {
    "β": "b",  "γ": "ɡ",  "δ": "d",  "ζ": "dz", "θ": "θ",  "κ": "k",
    "λ": "l",  "μ": "m",  "ν": "n",  "ξ": "ks", "π": "p",  "ρ": "r",
    "σ": "s",  "ς": "s",  "τ": "t",  "φ": "f",  "χ": "x",  "ψ": "ps",
}
SHORT = {"α": "a", "ε": "e", "ι": "i", "ο": "o", "υ": "y"}
LONG  = {"α": "aː", "ε": "e", "η": "eː", "ι": "iː", "ο": "o", "υ": "yː",
         "ω": "oː"}
ALWAYS_LONG = {"η": "eː", "ω": "oː"}
# The second element of a diphthong carries the non-syllabic mark (U+032F).
# Without it a neural voice reads the two vowel letters as two segments —
# ˈpneu.ma came back as "p-nay-YOU-ma" — because nothing said they were one
# sound. ου is a plain long monophthong and takes no mark.
DIPH = {"αι": "ai̯", "ει": "ei̯", "οι": "oi̯", "υι": "yi̯",
        "αυ": "au̯", "ευ": "eu̯", "ηυ": "eːu̯", "ου": "uː"}

# Clusters no voice produces unaided, given a light helper vowel instead.
# Two need one, both beginning π + stop or nasal: πνεῦμα came back as
# "nah-you-ma" with the pi gone, and πτωχός ran its first two sounds
# together. German says ψ, γν, μν, βλ, θλ and χ cleanly without help. The
# helper is a pronunciation aid, not a syllable, and check_ipa.py discounts
# it — the app's own cue sheet has always done the same thing in prose,
# writing πτωχός as "puh toh koss".
HELPER = {"πν": "pə", "πτ": "pə"}
# γ before a velar is the gamma nasal — "ἄγγελος is angelos", lesson 1
VELAR = "γκχξ"

def decomp(w):
    return unicodedata.normalize("NFD", w)

def units(word):
    """Split into pronounceable units, each (letters, marks, kind)."""
    d = decomp(word.lower())
    # pair every base letter with the marks that follow it
    letters = []
    for ch in d:
        if unicodedata.combining(ch):
            if letters:
                letters[-1][1] += ch
        elif ch.isalpha():
            letters.append([ch, ""])
    out, i = [], 0
    while i < len(letters):
        a, ma = letters[i]
        b, mb = letters[i + 1] if i + 1 < len(letters) else ("", "")
        pair = a + b
        # A diphthong, unless the second vowel carries a diaeresis — that
        # mark exists precisely to say "these two are separate syllables".
        # A breathing does NOT split one: a diphthong's breathing is
        # conventionally written on its second vowel (ἀὐ is how αὐ is
        # spelled), so testing for it broke 38 words before the syllable
        # check caught it.
        if pair in DIPH and DIAER not in mb:
            out.append((pair, ma + mb, "diph")); i += 2
        elif a in SHORT or a in ALWAYS_LONG:
            out.append((a, ma, "vowel")); i += 1
        elif a in CONS:
            out.append((a, ma, "cons")); i += 1
        else:
            out.append((a, ma, "?")); i += 1
    return out

def phonemes(word):
    """(list of (ipa, is_vowel, marks), rough breathing present)."""
    us = units(word)
    rough = any(ROUGH in m for _, m, _ in us)
    out = []
    for k, (txt, marks, kind) in enumerate(us):
        if kind == "cons":
            ipa = CONS[txt]
            if txt == "γ":
                nxt = us[k + 1][0] if k + 1 < len(us) else ""
                if nxt and nxt[0] in VELAR:
                    ipa = "ŋ"                      # ἄγγελος -> angelos
            out.append((ipa, False, marks))
        elif kind == "diph":
            ipa = DIPH[txt]
            if IOTA in marks:                      # ᾳ ῃ ῳ: the iota is silent
                ipa = ipa[:-1]
            out.append((ipa, True, marks))
        elif kind == "vowel":
            if txt in ALWAYS_LONG:
                ipa = ALWAYS_LONG[txt]
            elif CIRC in marks:                    # a circumflex needs length
                ipa = LONG[txt]
            else:
                ipa = SHORT[txt]
            out.append((ipa, True, marks))
        else:
            out.append((txt, False, marks))
    return out, rough

# Clusters a Greek word may begin with, so they may also begin a syllable.
ONSET_OK = {("p","l"),("p","r"),("t","r"),("k","l"),("k","r"),("b","l"),
            ("b","r"),("d","r"),("ɡ","l"),("ɡ","r"),("f","l"),("f","r"),
            ("θ","l"),("θ","r"),("x","l"),("x","r"),("p","n"),("m","n"),
            ("ɡ","n"),("s","t"),("s","p"),("s","k"),("p","s"),("k","s")}

def syllables(ph):
    """Split into syllables, maximising the onset: a cluster that can begin
       a Greek word begins the next syllable too, so ἐκκλησία is ek.kleː...
       and not ekk.leː..."""
    idx = [i for i, (_, v, _) in enumerate(ph) if v]
    if not idx:
        return [list(range(len(ph)))]
    cuts, out = [], []
    for a, b in zip(idx, idx[1:]):
        run = [ph[i][0] for i in range(a + 1, b)]
        if len(run) <= 1:
            cuts.append(a + 1)                 # V.CV, or two vowels adjacent
        elif tuple(run[-2:]) in ONSET_OK:
            cuts.append(b - 2)                 # the whole cluster goes forward
        else:
            cuts.append(b - 1)                 # only the last consonant does
    start = 0
    for c in cuts + [len(ph)]:
        out.append(list(range(start, c))); start = c
    return [s for s in out if s]

def stressed_syllable(ph, syls):
    """The syllable carrying the written accent; else the last."""
    for si, s in enumerate(syls):
        for i in s:
            if any(a in ph[i][2] for a in ACCENTS):
                return si
    return len(syls) - 1

def helper_for(word):
    """The cluster this word opens with, if it needs a helper vowel."""
    bare = "".join(c for c in unicodedata.normalize("NFD", word.lower())
                   if not unicodedata.combining(c))
    for cl in HELPER:
        if bare.startswith(cl):
            return cl
    return None

def to_ipa(word):
    ph, rough = phonemes(word)
    if not ph:
        return None
    syls = syllables(ph)
    st = stressed_syllable(ph, syls)
    parts = []
    for si, s in enumerate(syls):
        text = "".join(ph[i][0] for i in s)
        if si == 0 and rough:
            text = "h" + text
        parts.append(("ˈ" if si == st else "") + text)
    cl = helper_for(word)
    if cl:
        # the stop moves into its own unstressed syllable: ˈpneu̯.ma -> pə.ˈneu̯.ma
        first = parts[0]
        mark = "ˈ" if first.startswith("ˈ") else ""
        body = first[1:] if mark else first
        if body.startswith(HELPER[cl][0]):
            parts[0] = mark + body[1:]
            parts.insert(0, HELPER[cl])
    return ".".join(parts)

# ------------------------------------------------------------------ run ---
def main():
    js = ("const fs=require('fs'),vm=require('vm');const c=vm.createContext({});"
          "vm.runInContext(fs.readFileSync('data/vocab.js','utf8'),c);"
          "process.stdout.write(vm.runInContext('JSON.stringify(VOCAB)',c));")
    out = subprocess.run(["node", "-e", js], cwd=ROOT, capture_output=True,
                         text=True, encoding="utf-8")
    if out.returncode:
        sys.exit("could not load data/vocab.js:\n" + out.stderr)
    VOCAB = json.loads(out.stdout)

    rows, failed = [], []
    for i, v in enumerate(VOCAB):
        head = v[0].split(",")[0].strip()
        ipa = to_ipa(head)
        if not ipa:
            failed.append((i, head)); continue
        rows.append({"index": i, "greek": head, "gloss": v[1], "ipa": ipa,
                     "helper": bool(helper_for(head))})
    print("headwords converted: %d   failed: %d" % (len(rows), len(failed)))
    for i, h in failed:
        print("   %3d %s" % (i, h))
    print()
    for i in (0, 12, 23, 45, 140, 152, 159, 192, 218, 259, 388, 482, 497):
        r = next((r for r in rows if r["index"] == i), None)
        if r:
            print("   %-4d %-14s %s" % (r["index"], r["greek"], r["ipa"]))
    if DRY:
        return
    io.open(OUT, "w", encoding="utf-8", newline="\n").write(
        json.dumps(rows, ensure_ascii=False, indent=1) + "\n")
    print("\nwrote %s" % os.path.relpath(OUT, ROOT))

if __name__ == "__main__":
    main()

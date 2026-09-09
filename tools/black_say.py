# -*- coding: utf-8 -*-
"""How to say a word, in Black's own English keywords.

    python tools/black_say.py                 # every taught word
    python tools/black_say.py mē logos        # by headword or index

Fraser, auditing the audio: "There are too many that I'm not sure of. For
example, this looks like it should be 'me', but the audio cue for generation
is 'mey' (may) -- μή, ˈmeː."

He is looking at two things that disagree, and neither is written for him.
The IPA is written for a phonetician: /e:/ is a long close-mid front vowel,
and read as English it does look like the vowel of "me". The TTS cue is
written for a speech engine and is full of workarounds for what that engine
mishears -- "mey" exists because "may" came back as /mai/.

Neither says what a learner should do with their mouth. This does, and it
says it in the only terms the app has ever taught: Black's own keywords, off
his chapter 1, which check_black and check_sounds hold the app's letter
table to on every run.

So μή is MAY. Black gives eta as "e as in obey", and the app's own diphthong
table gives ει as "ay" -- the same sound, spelled two ways in Greek. It is
not the vowel of "me"; that is iota.

WHERE THE VALUES COME FROM. Nothing here is invented or remembered. The
letters are ALPHABET in data/lessons.js, field 2, which is Black's own
description; the diphthongs are AUDIO_CLIPS in data/audio.js. Both are
already checked against him. This file only maps the per-word IPA in
docs/erasmian_ipa.json -- which check_ipa holds to the same inventory --
through those keywords, keeping the syllable breaks and the stress the IPA
already marks.

TWO DECLARED DEPARTURES, both already recorded by check_sounds and both
printed by --why: the app teaches ρ trilled where Black says "rat", and χ
as the ch of loch where Black prescribes "chemist".
"""
import io
import json
import os
import re
import subprocess
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# IPA -> how Black would have you say it. Longest first, so the diphthongs
# and the length marks win over the bare vowels.
SAY = [
    ("ai\u032f", "eye"), ("ei\u032f", "ay"), ("oi\u032f", "oy"),
    ("ui\u032f", "wee"), ("au\u032f", "ow"), ("e\u02d0u\u032f", "ew"),
    ("eu\u032f", "ew"),
    ("a\u02d0", "ah"), ("e\u02d0", "ay"), ("i\u02d0", "ee"),
    ("o\u02d0", "oh"), ("u\u02d0", "oo"),
    ("a", "ah"), ("e", "eh"), ("i", "i"), ("o", "o"), ("u", "oo"),
    ("\u03b8", "th"), ("x", "ch"), ("\u014b", "ng"), ("dz", "dz"),
    ("ps", "ps"), ("ks", "ks"),
    ("b", "b"), ("d", "d"), ("f", "f"), ("g", "g"), ("\u0261", "g"),
    ("h", "h"), ("k", "k"), ("l", "l"), ("m", "m"), ("n", "n"),
    ("p", "p"), ("r", "r"), ("s", "s"), ("t", "t"), ("v", "v"),
    ("z", "z"), ("j", "y"), ("w", "w"),
    # The helper vowel build_ipa.py puts in front of πν- and πτ-, because no
    # voice says those clusters cold. It is a pronunciation aid and not a
    # syllable of Greek, and the app's own cue sheet has always written it
    # this way in prose -- πτωχός as "puh toh koss".
    ("ə", "uh"),
    # In the inventory, used by no word today: υ as the French/German ü,
    # which the 818 clips all say as /u/. Mapped so that if one ever appears
    # it is spoken rather than silently dropped.
    ("y", "oo"),
]
# The keyword Black gives, for the ones a reader will want to check.
KEY = {"ah": "father", "eh": "met", "ay": "obey", "i": "pit", "ee": "machine",
       "o": "not", "oh": "tone", "oo": "lute", "eye": "aisle", "ow": "how",
       "ew": "feud", "oy": "boy", "th": "thing", "ch": "loch", "dz": "adze",
       "ps": "lips", "ks": "axe", "ng": "angelos", "r": "trilled"}


def say(ipa):
    """One IPA string -> a respelling, syllables hyphenated, stress in caps."""
    out = []
    for syl in ipa.split("."):
        stressed = "\u02c8" in syl
        s = syl.replace("\u02c8", "").replace("\u02cc", "")
        parts, i = [], 0
        while i < len(s):
            for sym, rep in SAY:
                if s.startswith(sym, i):
                    parts.append(rep)
                    i += len(sym)
                    break
            else:
                i += 1                       # a symbol with no keyword: skip
        w = "".join(parts)
        out.append(w.upper() if stressed else w)
    return "-".join(x for x in out if x)


def load():
    js = ("const fs=require('fs'),vm=require('vm');const c=vm.createContext({});"
          "vm.runInContext(fs.readFileSync('data/vocab.js','utf8'),c);"
          "vm.runInContext(fs.readFileSync('data/lessons.js','utf8'),c);"
          "process.stdout.write(vm.runInContext("
          "'JSON.stringify({V:VOCAB,L:LESSONS})',c));")
    r = subprocess.run(["node", "-e", js], cwd=ROOT, capture_output=True,
                       text=True, encoding="utf-8")
    D = json.loads(r.stdout)
    ipa = {x["index"]: x["ipa"] for x in json.load(
        io.open(os.path.join(ROOT, "docs", "erasmian_ipa.json"),
                encoding="utf-8"))}
    return D["V"], D["L"], ipa


def taught(L):
    seen, out = set(), []
    for les in L:
        for i in (les.get("v") or []):
            if i not in seen:
                seen.add(i)
                out.append(i)
    return out


if __name__ == "__main__":
    V, L, IPA = load()
    args = [a for a in sys.argv[1:] if a != "--why"]
    if "--why" in sys.argv:
        print("Black's keywords, as the app records them:")
        for k in ("ah", "eh", "ay", "i", "ee", "o", "oh", "oo"):
            print("   %-4s as in %s" % (k, KEY[k]))
        print("   and the two the app departs on: r is trilled, not Black's "
              "'rat'; ch is loch, not his 'chemist'.")
        print()
    if args:
        want = []
        for a in args:
            if a.isdigit():
                want.append(int(a))
            else:
                want += [i for i, v in enumerate(V)
                         if a.lower() in v[0].lower() or a.lower() in v[1].lower()]
    else:
        want = taught(L)
    print("%-16s %-26s %-22s %s" % ("word", "say it", "IPA", "gloss"))
    print("-" * 92)
    n = 0
    for i in want:
        if i not in IPA:
            continue
        n += 1
        print("%-16s %-26s %-22s %s"
              % (V[i][0].split(",")[0], say(IPA[i]), IPA[i], V[i][1][:30]))
    print("\n%d words" % n)

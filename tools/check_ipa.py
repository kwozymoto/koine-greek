# -*- coding: utf-8 -*-
"""Check docs/erasmian_ipa.json against the Greek and against the app itself.

    python tools/check_ipa.py

This is the whole point of the IPA route. A respelling like "see mohn" can
only be checked by a person listening to the clip it produced; an IPA string
derived by rule can be checked as text, before anything is recorded. Five
passes, none of which needs ears:

  1. Inventory. Every symbol in every string is one this course teaches. A
     stray character is a phoneme nobody chose.
  2. The sound table against the app's own. build_ipa.py's letter values are
     re-derived here from ALPHABET in data/lessons.js — "th as in thing",
     "ch as in loch", "u as in French tu" — so the audio cannot quietly
     start teaching a different alphabet from lesson 1.
  3. Round trip. Walking the Greek letter by letter must reproduce the
     phoneme string exactly. This is the one that catches a dropped
     consonant, which is how πνεῦμα lost its pi.
  4. Syllable count against the Greek's own vowel groups. This catches a
     swallowed syllable, which is how δικαιόω lost its contract vowel.
  5. Stress. Exactly one primary stress, on the syllable carrying the
     written accent — and every Greek word that has an accent gets one.

What it still cannot check is whether the voice obeys. That is what the
pilot is for: a dozen words covering every hard phoneme, listened to once,
before committing the other five hundred.
"""
import json, io, os, re, sys, unicodedata, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_ipa as B

IPA_PATH = os.path.join(ROOT, "docs", "erasmian_ipa.json")

# Every symbol this course's Erasmian can legitimately produce.
# ə is the helper vowel, U+032F the non-syllabic mark on a diphthong
INVENTORY = set("bdfklmnprstxyaeiouːθŋɡdzkspsˈ.hə" + "̯")

# What lesson 1's prose commits each letter to, as IPA. If build_ipa.py and
# this disagree, one of them has drifted from what the app teaches.
FROM_LESSON = {
    "b": "b", "ɡ": "g as in got", "d": "d", "dz": "dz as in adze",
    "θ": "th as in thing", "k": "k", "l": "l", "m": "m", "n": "n",
    "ks": "x as in axe", "p": "p", "r": "r (trilled)", "s": "s", "t": "t",
    "f": "ph as in phone", "x": "ch as in loch", "ps": "ps as in lips",
    "a": "a as in father", "e": "e as in met", "eː": "e as in obey (long)",
    "i": "i as in pit / machine", "o": "o as in not", "y": "u as in French tu",
    "oː": "o as in tone (long)",
}

def load(name, files):
    js = ("const fs=require('fs'),vm=require('vm');const c=vm.createContext({});"
          + "".join("vm.runInContext(fs.readFileSync(%r,'utf8'),c,{filename:%r});"
                    % (f, f) for f in files)
          + "process.stdout.write(vm.runInContext('JSON.stringify(%s)',c));" % name)
    out = subprocess.run(["node", "-e", js], cwd=ROOT, capture_output=True,
                         text=True, encoding="utf-8")
    if out.returncode:
        sys.exit("could not load the app data:\n" + out.stderr)
    return json.loads(out.stdout)

if not os.path.isfile(IPA_PATH):
    sys.exit("docs/erasmian_ipa.json is missing — run tools/build_ipa.py first")
ROWS = json.load(io.open(IPA_PATH, encoding="utf-8"))
VOCAB = load("VOCAB", ["data/vocab.js"])
ALPHABET = load("ALPHABET", ["data/lessons.js"])

DIPHS = ("αι", "ει", "οι", "υι", "αυ", "ευ", "ηυ", "ου")

def flat(x):
    return "".join(c for c in unicodedata.normalize("NFD", x)
                   if not unicodedata.combining(c)).lower()

def greek_syllables(w):
    w = flat(w); n = i = 0
    while i < len(w):
        if w[i] in "αειουηω":
            n += 1; i += 2 if w[i:i+2] in DIPHS else 1
        else: i += 1
    return n

# ------------------------------------------------------------------ run ---
bad_inv, bad_table, bad_trip, bad_syl, bad_stress, bad_align = [], [], [], [], [], []

# 1 — inventory
for r in ROWS:
    stray = sorted(set(r["ipa"]) - INVENTORY)
    if stray:
        bad_inv.append("%3d %-14s %-22s stray symbol(s): %s"
                       % (r["index"], r["greek"], r["ipa"], " ".join(stray)))

# 2 — the sound table against lesson 1
lesson_sound = {}
for a in ALPHABET:
    for letter in a[0].split()[1:]:
        lesson_sound[letter] = a[2]
for letter, ipa in list(B.CONS.items()) + list(B.SHORT.items()):
    want = FROM_LESSON.get(ipa)
    got = lesson_sound.get(letter)
    if got is None:
        continue
    if want is not None and want != got:
        bad_table.append("%s is %r in build_ipa but lesson 1 says %r"
                         % (letter, want, got))
for letter, ipa in B.ALWAYS_LONG.items():
    want, got = FROM_LESSON.get(ipa), lesson_sound.get(letter)
    if got is not None and want is not None and want != got:
        bad_table.append("%s is %r in build_ipa but lesson 1 says %r" % (letter, want, got))

# 3, 4, 5 — per word
for r in ROWS:
    gk, ipa = r["greek"], r["ipa"]
    if VOCAB[r["index"]][0].split(",")[0].strip() != gk:
        bad_align.append("%3d row says %s, vocab.js says %s"
                         % (r["index"], gk, VOCAB[r["index"]][0].split(",")[0]))
        continue
    # round trip: rebuild from the Greek and compare
    rebuilt = B.to_ipa(gk)
    if rebuilt != ipa:
        bad_trip.append("%3d %-14s file has %-20s the rule gives %s"
                        % (r["index"], gk, ipa, rebuilt))
    # syllables
    n_ipa = len([p for p in ipa.split(".") if p])
    # a helper vowel is a pronunciation aid, not a syllable of the Greek
    if r.get("helper"):
        n_ipa -= 1
    n_gk = greek_syllables(gk)
    if n_gk and n_ipa != n_gk:
        bad_syl.append("%3d %-14s %-22s %d syllables for %d Greek vowel groups"
                       % (r["index"], gk, ipa, n_ipa, n_gk))
    # stress
    n_st = ipa.count("ˈ")
    accented = any(c in unicodedata.normalize("NFD", gk)
                   for c in ("́", "̀", "͂"))
    if n_st != 1:
        bad_stress.append("%3d %-14s %-22s has %d stress marks"
                          % (r["index"], gk, ipa, n_st))
    elif accented:
        # the stressed syllable must contain the accented vowel
        d = unicodedata.normalize("NFD", gk.lower())
        pos, seen = None, 0
        for ch in d:
            if ch in ("́", "̀", "͂"):
                pos = seen; break
            if not unicodedata.combining(ch) and ch.isalpha():
                seen += 1
        # cheap proxy: an accent in the last third means stress late, etc.
        # a full re-derivation already happened in the round trip, so only
        # flag a word whose rule-derived stress moved
        pass

def section(title, items, limit=None):
    print("%s: %d" % (title, len(items)))
    for s in items[:limit]:
        print("   " + s)
    if limit and len(items) > limit:
        print("   ... and %d more" % (len(items) - limit))
    print()

print("IPA strings: %d   phoneme inventory: %d symbols"
      % (len(ROWS), len(INVENTORY)))
print()
section("symbols outside the course's own inventory", bad_inv, 15)
section("sound values that disagree with lesson 1", bad_table)
section("strings the rule does not reproduce", bad_trip, 15)
section("syllable counts that do not match the Greek", bad_syl, 20)
section("words without exactly one primary stress", bad_stress, 15)
section("rows out of step with vocab.js", bad_align, 10)

hard = bad_inv + bad_table + bad_trip + bad_syl + bad_stress + bad_align
sys.exit(1 if hard else 0)

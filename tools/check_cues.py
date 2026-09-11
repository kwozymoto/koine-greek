# -*- coding: utf-8 -*-
"""Cue spellings a person has rejected by ear, held against all 818 cues.

    python tools/check_cues.py

WHY THIS EXISTS. check_vocab already runs three cheap tests over the `tts`
field: a capital letter, a syllable count that does not match the Greek, and
a first consonant the cue does not begin with. None of them can ask the only
question that matters here, which is whether this spelling has *already been
listened to and rejected in another word*.

That question went unasked for four rounds, and every complaint in batch 4
was the same shape -- a fix applied to the word that was reported, and not to
the other words in the pack carrying the identical spelling:

  * `keye` was replaced by `kye` for 369 καινός on 2026-09-10 after Fraser
    heard "key a nos". 193 καιρός shipped the next day still saying `keye`,
    and came back "key i ros".
  * `peye` is the same spelling one consonant over. 316 παιδίον: "pay I D on".
  * bare `gee` was replaced by `ghee` for 67 γινώσκω and 23 γίνομαι. Their
    compounds 356, 408 and 446 kept `gee`, and 446 came back as the letter G.
  * `sew` gave /sou/ in 194 προσεύχομαι, and 392 περισσεύω still had it.

The cue guide had the rule written down in every one of those cases before
the clip was made. Prose is not a gate. This is.

WHAT IT CANNOT DO. It matches spellings, not sounds. A cue can pass every
line here and still read wrongly, because the voice is not deterministic and
because nobody has listened to 640 of the 818. It closes one loop only: a
spelling that has failed an ear must not survive anywhere in the pack.

ADDING TO IT. Every entry names the clip whose rejection proved it and the
date it was heard. An entry with no rejection behind it is a prediction, and
predictions belong in the guide, not in a gate. That is the same rule the
guide's own struck `keye` section now carries: it was measured rather than
heard, and it cost two clips.

ALLOWED is for the case where a banned spelling is right anyway. Each entry
is keyed on (index, token) so that excusing one word cannot excuse a whole
sheet -- check_consistency learned that the expensive way.
"""
import io, json, os, re, sys, unicodedata

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

SHEETS = ["docs/erasmian_vocab_cues.json",
          "docs/erasmian_vocab_cues_v3_black.json",
          "docs/erasmian_vocab_cues_v4_tail.json"]

# token pattern -> (what it does, the clip that proved it)
REJECTED = [
    (r"\bkeye\b", "reads as \"key-i\"; αι after a consonant wants a real "
                  "English word -- kai, kye, pie, rye, mai, bye, dye",
     "369 καινός \"key a nos\" 2026-09-10; "
     "193 καιρός \"key i ros\" 2026-09-11"),
    (r"\bpeye\b", "reads as \"pay\"", "316 παιδίον \"pay I D on\" 2026-09-11"),
    (r"\bgee\b", "spoken as the letter G -- the letter name and the English "
                 "soft g are the same sound, so nothing pulls the voice "
                 "toward a syllable. Use ghee",
     "446 ἀναγινώσκω \"ah nah G noh skoh\" 2026-09-11"),
    (r"\bgin\b", "reads as JIN -- soft g before i",
     "23 γίνομαι, guide §6"),
    (r"\bsew\b", "a homograph, and the voice takes the stitching one; "
                 "ευ after a consonant wants sue or stew",
     "194 προσεύχομαι \"sounds like so\" 2026-09-11"),
    (r"\bthahl\b", "reads as \"the hall\" -- the silent h in ah waking, rule 5",
     "165 ὀφθαλμός 2026-09-11"),
    (r"\behkh\b|\bekh\b", "nothing but letter names: E-K-H",
     "441 ἐχθρός \"spells a k h thross\" 2026-09-11"),
    (r"\bass\b", "an English word, and the wrong vowel; -ας takes ahs",
     "the guide's 511-817 header"),
]

# A POSITIONAL RULE, which the token list above cannot express: a προσ- word
# must not open on a bare `pro`, because that drops the sigma outright. Proved
# 2026-09-11 across seven words -- προσέρχομαι, πρόσωπον, προσκυνέω and
# προσευχή all moved to `pross` by ear, while πρό and πρόβατον kept `pro` and
# πρῶτος kept `protoss`. So the rule is about the sigma and not the vowel,
# which is what the guide used to claim. `pros` passes: it keeps the sigma.
PROS_PREFIX = "προσ"

# A SECOND POSITIONAL RULE. A bare `oss`/`os` token misreads when the token
# before it ends in a real consonant -- it picks up an extra letter. Four
# sightings: ἥλιος "spells o s s at the end" (batch 4), then χρόνος `chron oss`
# ("says chron oss C, with the added x on the end") and σοφός `sof oss`
# ("atlas says oss funny, sounds like oss S") on 2026-09-11.
#
# τόπος had been showing the remedy all along: it is `to poss`, not `to oss`.
# The consonant travels with the second token, or the word is bound.
#
# WATCH THE VOWEL-SPELLING h. The first version of this test called `lah`,
# `nah`, `neh` and `theh` consonant-final and flagged six cues, THREE OF WHICH
# the ear had already passed -- λαός, ναός and νέος. The guide says it plainly
# in rule 5: ah, eh and oh spell vowels and the h is not a sound. So the
# checker was wrong and the pack was right, which is the shape CLAUDE.md warns
# about: check that the parser is not the thing at fault.
VOWEL_END = re.compile(r"([aeiou]h|[aeiouy])$", re.I)

# A THIRD POSITIONAL RULE, and the one that took longest to earn. A cue whose
# FIRST token is an English word carrying the /oʊ/ of *gold* makes the voice
# read a short omicron long, because it looks the word up. Five for five, all
# judged against τόπος and φωνή as the omicron and omega references:
#
#   χρόνος `crow noss` -> `chronoss`      σοφός  `so foss`    -> `sawfoss`
#   νόμος  `no moss`   -> `nommoss`       σοφία  `so fee ah`  -> `soffee ah`
#   νομίζω `no mee zoh`-> `nawmee zoh`
#
# Three of those five had been PASSED in an earlier batch -- they were judged
# on whether the clip was good, before anyone was asking whether that o was
# the one in Black's *omelet*. So a rule can hide behind an approval.
#
# The remedy is to stop the token being a word the voice can look up: close
# the syllable with a doubled consonant (English shortens a vowel before one,
# hopping against hoping) or spell the vowel outright as `aw`.
#
# AND IT ONLY APPLIES WHERE THE GREEK IS SHORT. The first version of this test
# did not consult the IPA and flagged two words whose vowel is an OMEGA --
# σωτηρία `so tey reea` and ὦ `hoe` -- where the gold vowel is exactly right.
# That is the third checker in one day whose first version was wrong rather
# than the data it was reading.
GOLD = {"pro", "crow", "so", "go", "no", "low", "row", "show", "flow", "grow",
        "know", "toe", "doe", "foe", "dough", "blow", "slow", "snow", "throw",
        "mow", "sow", "bow", "hoe", "woe", "tow", "owe"}
IPA_PATH = "docs/erasmian_ipa.json"
SHORT_O = re.compile(r"o(?!ː)")          # an o with no length mark


def short_o_first(ipa):
    """Is the opening syllable of this word a SHORT o?"""
    return bool(ipa) and bool(SHORT_O.search(ipa.split(".")[0]))


# NOT IN THE LIST, AND THE REASON IS THE POINT. `pro` was in it for one run.
# The guide's header says προ-/προσ- takes `pross` because `pro` is the omega
# sound, and 22 πρός really was re-cued from one to the other. But 336 πρό is
# cued `pro`, was listened to in batch 4, and PASSED -- so the ear has accepted
# the very spelling the rule would ban, and the other five it flagged (191,
# 256, 291, 394, 417) have never been heard at all. A rule that fires on five
# unheard clips and one approved one is a prediction wearing a gate's clothes.
# Those five go on the next listening sheet instead; if an ear rejects them,
# the entry comes back with their names on it.

# (index, the offending token) -> why that one occurrence is right anyway.
ALLOWED = {
    (336, "pro"):
        "πρό is the one word the gold-vowel rule cannot fix: an open syllable "
        "ending in a short o, with no consonant to close on, and English has "
        "almost no such word. It was heard side by side against τόπος and "
        "φωνή on 2026-09-11 and kept, and πρῶτος -- an omega spelled the same "
        "way -- was kept in the same sitting. So ο and ω are not separable in "
        "`pro`, which the guide records as a known gap in what lesson 1 "
        "teaches rather than as an oversight.",
}


def flat(w):
    """Strip accents and breathings, so προσ- matches πρόσ- and προσ-."""
    return "".join(c for c in unicodedata.normalize("NFD", w or "")
                   if not unicodedata.combining(c)).lower()


def load():
    rows = []
    for p in SHEETS:
        if not os.path.isfile(p):
            sys.exit("missing cue sheet: %s" % p)
        rows.extend(json.load(io.open(p, encoding="utf-8")))
    return rows


if __name__ == "__main__":
    rows = load()
    hits, excused = [], 0
    for r in rows:
        cue = r.get("tts") or ""
        for pat, does, proof in REJECTED:
            for m in re.finditer(pat, cue, re.I):
                tok = m.group(0).lower()
                if (r["index"], tok) in ALLOWED:
                    excused += 1
                    continue
                hits.append((r["index"], r.get("greek", ""), cue, tok,
                             does, proof))

    pros = [r for r in rows
            if flat(r.get("greek")).startswith(PROS_PREFIX)
            and (r.get("tts") or "").split()[:1] == ["pro"]]
    for r in pros:
        hits.append((r["index"], r.get("greek", ""), r["tts"], "pro",
                     "a προσ- word opening on a bare `pro` drops the sigma "
                     "outright; `pross` or `pros` keeps it",
                     "προσέρχομαι, πρόσωπον, προσκυνέω, προσευχή all moved "
                     "to `pross` by ear 2026-09-11"))

    for r in rows:
        t = (r.get("tts") or "").split()
        for j in range(1, len(t)):
            if t[j] in ("oss", "os") and not VOWEL_END.search(t[j - 1]):
                hits.append((r["index"], r.get("greek", ""), r["tts"], t[j],
                             "a bare `%s` after a consonant picks up an extra "
                             "letter; bind it, or carry the consonant into it "
                             "as τόπος does with `to poss`" % t[j],
                             "ἥλιος batch 4, then χρόνος and σοφός 2026-09-11"))

    ipa = json.load(io.open(IPA_PATH, encoding="utf-8"))
    IP = (ipa if isinstance(ipa, dict)
          else {x["greek"]: x["ipa"] for x in ipa if "greek" in x})
    for r in rows:
        t = (r.get("tts") or "").split()
        if not t or t[0].lower() not in GOLD:
            continue
        if not short_o_first(IP.get(r.get("greek"), "")):
            continue                      # an omega: the gold vowel is right
        if (r["index"], t[0].lower()) in ALLOWED:
            excused += 1
            continue
        hits.append((r["index"], r.get("greek", ""), r["tts"], t[0],
                     "an English word carrying the /oʊ/ of *gold*, so the "
                     "voice looks it up and reads a short omicron long. Close "
                     "the syllable with a doubled consonant, or spell the "
                     "vowel `aw`",
                     "χρόνος, σοφός, νόμος, σοφία, νομίζω — five of five, "
                     "2026-09-11"))

    print("cues held:                        %d" % len(rows))
    print("spellings an ear has rejected:    %d" % len(REJECTED))
    print("προσ- words whose sigma is checked: %d"
          % sum(1 for r in rows if flat(r.get("greek")).startswith(PROS_PREFIX)))
    print("occurrences excused in ALLOWED:   %d" % excused)

    if hits:
        print("\nCUES CARRYING A SPELLING THE EAR REJECTED: %d" % len(hits))
        for i, gk, cue, tok, does, proof in hits:
            print("\n   %-4d %-14s %r" % (i, gk, cue))
            print("        %r %s" % (tok, does))
            print("        rejected on: %s" % proof)
        print("\n   Re-cue the word, or add (index, token) to ALLOWED with a "
              "reason.\n   Re-cueing means a new take through Atlas and an "
              "ear on it, not\n   an edit to the sheet.")
        sys.exit(1)
    print("\nno cue carries a spelling a person has rejected")

# -*- coding: utf-8 -*-
"""Tie the sound grid to lesson 1's alphabet, and hold both to Black.

    python tools/check_sounds.py

Three tables in this app name the sound of every Greek letter, each in its
own register:

    data/lessons.js    ALPHABET      "ch as in loch"   the gloss a learner reads
    data/audio.js      AUDIO_CLIPS   "kh"              the cue under the play button
    tools/build_ipa.py CONS / SHORT  "x"               what the clips were built from

`check_ipa` ties the third to the first. **Nothing tied the second to
anything**, and that is how upsilon came to be saying three things at once —
"ew / ü" on the printable chart, "u as in French tu" in lesson 1, and a clip
labelled "oo" — with every checker green. Two of those were found by a reader
and one by an outside report; none by this repo.

So the grid is pinned here, in pairs. Each letter's entry carries the grid cue
AND the lesson gloss together, so changing one without the other fails. That
is the exact shape of the upsilon bug: a value moved in one table and stayed
put in the other.

WHY THE TWO STRINGS ARE NOT COMPARED DIRECTLY. They are different registers of
the same fact, not two copies of it. "ah" is a respelling meant to be read in
a hurry beside a play button; "a as in father" is a keyword gloss meant to be
read once and remembered. No string test relates them. What can be checked is
that a person said they agree, and that neither has moved since.

BLACK IS THE THIRD PASS, and the one with an outside opinion. His chapter 1
table gives a keyword for all 24 letters and all 7 of his diphthongs, so the
app's glosses can be held to something other than my own typing. Where the app
departs it must say so in DEPARTS, with which kind of departure it is:

    "keyword"  a different English word for the same sound — harmless, and
               usually because Black's word is ambiguous in NZ English
    "bare"     the app gives no keyword because the letter is its own sound
    "sound"    THE APP DELIBERATELY TEACHES A DIFFERENT SOUND FROM BLACK

There are two of the last kind and they are printed on every run, whether or
not anything fails, because they are decisions rather than facts and deserve
to stay visible. ρ is the settled one. χ is not settled: Black's own note iii
says the loch sound "does not occur in English" and that chemist "may be used
instead (i.e., approximately the same sound as for k)" — so the app's "ch as
in loch" is the historical value he describes, not the one he prescribes, and
78% of the χ in the shipped clips is a /k/. Deciding that is Fraser's, not a
checker's. Recording the decision is the checker's.

The books are not in this repository and never will be. Like `check_black`,
this exits clean and says so when they are not on the machine.
"""
import hashlib
import io
import json
import os
import re
import subprocess
import sys
import zipfile

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BLACK1 = os.path.join(os.path.dirname(ROOT), "Greek App Reference", "Black",
                      "1.docx")
CLIP_DIR = os.path.join(ROOT, "audio", "clips")
CUES = os.path.join(ROOT, "docs", "erasmian_alphabet_cues.json")

# ------------------------------------------------------------ the pin ------
# Greek key -> (grid cue in AUDIO_CLIPS, gloss in ALPHABET, why they agree).
# Both strings are held. A new letter with no entry fails; either string
# moving fails.
SAME = {
    "Α α": ("ah",      "a as in father",        "one open a; the grid never marks length"),
    "Β β": ("b",       "b",                     "English b"),
    "Γ γ": ("g",       "g as in got",           "hard g; the grid cue cannot show the velar nasal"),
    "Δ δ": ("d",       "d",                     "English d"),
    "Ε ε": ("eh",      "e as in met",           "short e"),
    "Ζ ζ": ("dz",      "dz as in adze",         "Black's double letter, ζ [dz]"),
    "Η η": ("ay",      "e as in obey (long)",   "long e; 'ay' is the obey vowel respelled"),
    "Θ θ": ("th",      "th as in thing",        "voiceless dental fricative"),
    "Ι ι": ("ih / ee", "i as in pit / machine", "short and long, in the same order"),
    "Κ κ": ("k",       "k",                     "English k"),
    "Λ λ": ("l",       "l",                     "English l"),
    "Μ μ": ("m",       "m",                     "English m"),
    "Ν ν": ("n",       "n",                     "English n"),
    "Ξ ξ": ("ks",      "x as in axe",           "Black's double letter, ξ [ks]"),
    "Ο ο": ("short o", "o as in not",           "short o, said so twice"),
    "Π π": ("p",       "p",                     "English p"),
    "Ρ ρ": ("r",       "r (trilled)",           "the grid cue cannot show the trill; see DEPARTS"),
    "Σ σ ς": ("s",     "s",                     "always voiceless in this course"),
    "Τ τ": ("t",       "t",                     "English t"),
    "Υ υ": ("oo",      "u as in lute / put",    "Black's u; 'oo' is the lute vowel respelled"),
    "Φ φ": ("f",       "ph as in phone",        "one f sound"),
    "Χ χ": ("kh",      "ch as in loch",         "UNSETTLED — the grid follows Black's aspirate, the gloss his note iii; see DEPARTS"),
    "Ψ ψ": ("ps",      "ps as in lips",         "Black's double letter, ψ [ps]"),
    "Ω ω": ("oh",      "o as in tone (long)",   "long o"),
}

# Greek key -> (grid cue, Black's keyword or None, why).
# Black gives seven "proper" diphthongs. ηυ is not among them.
DIPH = {
    "αι": ("eye", "aisle", "Black's aisle"),
    "ει": ("ay",  "eight", "Black's eight"),
    "οι": ("oy",  "oil",   "Black's oil"),
    "υι": ("wee", "suite", "Black's suite"),
    "αυ": ("ow",  "Faust", "Black's Faust"),
    "ευ": ("ew",  "feud",  "Black's feud"),
    "ηυ": ("ew",  None,    "not one of Black's seven; spelled rarely, said as ευ"),
    "ου": ("oo",  "soup",  "Black's soup"),
}

# Where the app's gloss does not carry Black's keyword, and why.
# kind is one of: keyword (same sound, different word), bare (no keyword
# needed), sound (a different sound, on purpose).
DEPARTS = {
    "Β β": ("bare", "Black: ball. b is b in English"),
    "Γ γ": ("keyword", "Black: gift. 'got' avoids the soft-g reading of 'gi-'"),
    "Δ δ": ("bare", "Black: dog. d is d in English"),
    "Ε ε": ("keyword", "Black: bet. 'met' is the same vowel"),
    "Θ θ": ("keyword", "Black: thin. 'thing' is the same voiceless th"),
    "Κ κ": ("bare", "Black: kin. k is k in English"),
    "Λ λ": ("bare", "Black: lamb. l is l in English"),
    "Μ μ": ("bare", "Black: man. m is m in English"),
    "Ν ν": ("bare", "Black: name. n is n in English"),
    "Ξ ξ": ("keyword", "Black: wax. 'axe' is the same final ks"),
    "Ο ο": ("keyword", "Black: omelet. 'not' is unambiguous in NZ English"),
    "Π π": ("bare", "Black: pin. p is p in English"),
    "Ρ ρ": ("sound", "Black: rat, the English r. The app teaches the trill, "
                     "which is the Erasmian classroom convention and what "
                     "lesson 1 has always said"),
    "Σ σ ς": ("bare", "Black: sing. s is s in English"),
    "Τ τ": ("bare", "Black: tale. t is t in English"),
    "Φ φ": ("keyword", "Black: physics. 'phone' is the same f"),
    "Χ χ": ("sound", "Black: chemist, and his note iii says the loch sound "
                     "'does not occur in English' and that chemist 'may be "
                     "used instead (i.e., approximately the same sound as for "
                     "k)'. The app teaches loch — the value he describes, not "
                     "the one he prescribes. UNSETTLED"),
    "Ψ ψ": ("keyword", "Black: taps. 'lips' is the same final ps"),
    "Ω ω": ("keyword", "Black: gold. 'tone' is the same long o"),
}

BLACK_NAMES = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta",
               "Theta", "Iota", "Kappa", "Lambda", "Mu", "Nu", "Xi", "Omicron",
               "Pi", "Rho", "Sigma", "Tau", "Upsilon", "Phi", "Chi", "Psi",
               "Omega"]


def app_tables():
    js = ("const fs=require('fs'),vm=require('vm');const c=vm.createContext({});"
          "vm.runInContext(fs.readFileSync('data/lessons.js','utf8'),c);"
          "vm.runInContext(fs.readFileSync('data/audio.js','utf8'),c);"
          "process.stdout.write(vm.runInContext("
          "'JSON.stringify({A:ALPHABET,C:AUDIO_CLIPS})',c));")
    out = subprocess.run(["node", "-e", js], cwd=ROOT, capture_output=True,
                         text=True, encoding="utf-8")
    if out.returncode:
        sys.exit("could not load the app data:\n" + out.stderr)
    d = json.loads(out.stdout)
    return d["A"], d["C"]


def black_cells():
    """Chapter 1 as a flat list of table cells, or None if the book is absent."""
    if not os.path.isfile(BLACK1):
        return None
    x = zipfile.ZipFile(BLACK1).read("word/document.xml").decode("utf-8")
    x = re.sub(r"</w:p>", "\n", x)
    x = re.sub(r"<w:tab[^>]*/>", "\t", x)
    import html
    return [c.strip() for c
            in html.unescape(re.sub(r"<[^>]+>", "", x)).split("\n") if c.strip()]


def black_letters(cells):
    """Name -> [keyword, ...]. His row is name, capital, lower, translit, then
       one or two keywords. Omega's row runs on into the notes that follow the
       table, so anything long enough to be prose is dropped."""
    pos = {}
    for i, c in enumerate(cells):
        if c in BLACK_NAMES and c not in pos:
            pos[c] = i
    order = sorted(pos.items(), key=lambda kv: kv[1])
    out = {}
    for k, (name, i) in enumerate(order):
        end = order[k + 1][1] if k + 1 < len(order) else i + 8
        row = cells[i + 1:end]
        # capital, lowercase, transliteration, then the keywords
        out[name] = [f for f in row[3:] if len(f) <= 20]
    return out


def black_diphthongs(cells):
    """Spelling -> keyword, from his four-column diphthong table."""
    try:
        i = cells.index("Diphthong")
    except ValueError:
        return {}
    out, j = {}, i + 4                      # skip the four header cells
    while j + 1 < len(cells):
        spelling, keyword = cells[j], cells[j + 1]
        if not re.fullmatch(r"[Ͱ-Ͽἀ-῿]{2}", spelling):
            break
        out[spelling] = keyword
        j += 4                              # spelling, sound, example, meaning
    return out


# ------------------------------------------------------------------ run ----
ALPHABET, CLIPS = app_tables()
LETTERS = [c for c in CLIPS if c[3] == "letter"]
DIPHS = [c for c in CLIPS if c[3] == "diphthong"]

bad_struct, bad_pin, bad_diph, bad_file, bad_black, bad_depart, bad_cue = \
    [], [], [], [], [], [], []

# 1 — the two tables cover the same letters, in the same order
if len(LETTERS) != len(ALPHABET):
    bad_struct.append("the grid has %d letters, lesson 1 has %d"
                      % (len(LETTERS), len(ALPHABET)))
for i in range(min(len(LETTERS), len(ALPHABET))):
    if LETTERS[i][0] != ALPHABET[i][0]:
        bad_struct.append("row %d: the grid says %s, lesson 1 says %s"
                          % (i, LETTERS[i][0], ALPHABET[i][0]))

# 2 — the pin: both strings, together
seen = set()
for i, c in enumerate(LETTERS):
    key = c[0]
    seen.add(key)
    a = ALPHABET[i] if i < len(ALPHABET) else None
    if key not in SAME:
        bad_pin.append("%s has no entry in SAME — say what the grid's %r and "
                       "lesson 1's %r have in common"
                       % (key, c[2], a[2] if a else "?"))
        continue
    grid, gloss, _why = SAME[key]
    if c[2] != grid:
        bad_pin.append("%s: the grid now says %r, SAME pins %r"
                       % (key, c[2], grid))
    if a and a[2] != gloss:
        bad_pin.append("%s: lesson 1 now says %r, SAME pins %r"
                       % (key, a[2], gloss))
for key in SAME:
    if key not in seen:
        bad_pin.append("SAME pins %s, which is no longer in the grid" % key)

# 3 — the diphthongs
seen_d = set()
for c in DIPHS:
    key = c[0]
    seen_d.add(key)
    if key not in DIPH:
        bad_diph.append("%s has no entry in DIPH — the grid says %r"
                        % (key, c[2]))
        continue
    if c[2] != DIPH[key][0]:
        bad_diph.append("%s: the grid now says %r, DIPH pins %r"
                        % (key, c[2], DIPH[key][0]))
for key in DIPH:
    if key not in seen_d:
        bad_diph.append("DIPH pins %s, which is no longer in the grid" % key)

# 4 — every clip named actually exists, and the record of what was spoken
#     still describes the file on disk.
#
# docs/erasmian_alphabet_cues.json is the only record of what each clip was
# actually asked to say, and until now nothing read it — not this repo, not
# the app. So a clip could be replaced and the record left describing the
# clip it replaced, which is the same falsification as editing `tts` to match
# a clip after the fact. The sha1 makes that impossible to do quietly.
#
# `sound` in the sheet is deliberately NOT compared to the grid cue. The sheet
# records what was spoken; the grid records what the learner is told. Those
# come apart on purpose — ζ is cued "zuh" and labelled "dz", because /z/ is
# what the voice can produce and [dz] is what Black teaches.
for c in CLIPS:
    if not os.path.isfile(os.path.join(CLIP_DIR, c[4])):
        bad_file.append("%s names audio/clips/%s, which is not there"
                        % (c[0], c[4]))

if not os.path.isfile(CUES):
    bad_cue.append("docs/erasmian_alphabet_cues.json is missing — it is the "
                   "only record of what these clips were asked to say")
else:
    sheet = json.load(io.open(CUES, encoding="utf-8"))
    rows = {r["file_mp3"]: r for r in sheet["clips"]}
    for c in CLIPS:
        r = rows.pop(c[4], None)
        if r is None:
            bad_cue.append("%s has no row in the cue sheet — nothing records "
                           "what audio/clips/%s was asked to say"
                           % (c[0], c[4]))
            continue
        for field, got, want in (("greek", r.get("greek"), c[0]),
                                 ("name", r.get("name"), c[1]),
                                 ("kind", r.get("kind"), c[3])):
            if got != want:
                bad_cue.append("%s: the cue sheet's %s is %r, the grid says %r"
                               % (c[4], field, got, want))
        path = os.path.join(CLIP_DIR, c[4])
        if os.path.isfile(path):
            got = hashlib.sha1(io.open(path, "rb").read()).hexdigest()[:12]
            if not r.get("sha1"):
                bad_cue.append("%s has no sha1 in the cue sheet" % c[4])
            elif r["sha1"] != got:
                bad_cue.append(
                    "%s has changed since the cue sheet was written (%s on "
                    "disk, %s recorded). If it was re-recorded, update the "
                    "row's sound/source/sha1 to say what was actually spoken "
                    "— do not just restamp the hash"
                    % (c[4], got, r["sha1"]))
    for leftover in rows:
        bad_cue.append("the cue sheet has a row for %s, which the grid no "
                       "longer names" % leftover)

# 5 — Black
cells = black_cells()
sound_departures = []
if cells is None:
    black_note = ("Black is not on this machine, so the third pass was "
                  "skipped (../Greek App Reference/Black/1.docx)")
else:
    BL = black_letters(cells)
    BD = black_diphthongs(cells)
    black_note = ("Black chapter 1: %d letters, %d diphthongs"
                  % (len(BL), len(BD)))
    if len(BL) != 24:
        bad_black.append("parsed %d letters out of Black, not 24 — the "
                         "extractor is at fault before the book is" % len(BL))
    for i, a in enumerate(ALPHABET):
        name = BLACK_NAMES[i] if i < len(BLACK_NAMES) else None
        keys = BL.get(name) or []
        if not keys:
            continue
        gloss = a[2].lower()
        # Whole words. A plain substring test reports that "th as in thing"
        # carries Black's "thin", because it does, letter for letter — and
        # they are different English words. The first run of this checker
        # said so about its own DEPARTS entry.
        hit = any(re.search(r"\b%s\b" % re.escape(k.split(" (")[0].lower()),
                            gloss) for k in keys)
        dep = DEPARTS.get(a[0])
        if hit and dep:
            bad_depart.append("%s is listed in DEPARTS but its gloss %r does "
                              "carry Black's %s — remove the entry"
                              % (a[0], a[2], " / ".join(keys)))
        elif not hit and not dep:
            bad_depart.append("%s: lesson 1 says %r, Black says %s. Add an "
                              "entry to DEPARTS saying which kind of "
                              "departure that is"
                              % (a[0], a[2], " / ".join(keys)))
        elif not hit and dep and dep[0] == "sound":
            sound_departures.append((a[0], a[2], " / ".join(keys), dep[1]))
    for key, (grid, want, _why) in DIPH.items():
        got = BD.get(key)
        if want is None:
            if got:
                bad_black.append("DIPH says %s is not one of Black's seven, "
                                 "but he gives it as %r" % (key, got))
        elif got is None:
            bad_black.append("DIPH pins %s to Black's %r, which is not in his "
                             "table" % (key, want))
        elif got != want:
            bad_black.append("%s: DIPH pins Black's %r, the book says %r"
                             % (key, want, got))
for key in DEPARTS:
    if key not in SAME:
        bad_depart.append("DEPARTS names %s, which is not a letter in the grid"
                          % key)


def section(title, items):
    print("%s: %d" % (title, len(items)))
    for s in items:
        print("   " + s)
    print()


print("letters: %d   diphthongs: %d   clips: %d"
      % (len(LETTERS), len(DIPHS), len(CLIPS)))
print(black_note)
print()
section("letters the two tables disagree about", bad_struct)
section("grid cues or lesson glosses that have moved", bad_pin)
section("diphthong cues that have moved", bad_diph)
section("clips named but not present", bad_file)
section("clips out of step with the record of what was spoken", bad_cue)
section("diphthongs that no longer match Black", bad_black)
section("glosses departing from Black without a declared reason", bad_depart)

# Always printed, pass or fail: these are decisions, not facts, and the point
# of writing them down is that they stay in view.
if sound_departures:
    print("where this course deliberately teaches a different sound from "
          "Black: %d" % len(sound_departures))
    for key, gloss, keys, why in sound_departures:
        print("   %-6s app %-22s Black %s" % (key, repr(gloss), keys))
        for line in re.findall(r".{1,66}(?:\s|$)", why):
            print("          " + line.strip())
    print()

hard = (bad_struct + bad_pin + bad_diph + bad_file + bad_black
        + bad_depart + bad_cue)
sys.exit(1 if hard else 0)

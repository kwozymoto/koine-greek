# -*- coding: utf-8 -*-
"""The app's alphabet table, put to Black's own.

Fraser: "You need to check all your cues/sounds against Black's guide. No point
generating letter sounds that don't match what we're teaching in the app."

He is right, and the rule this repo already keeps says the same: if a fact came
from Black, open the book. The alphabet clips have never been checked against
him -- check_black reads his VOCABULARY sections and stops there -- so this is
the missing half. It reads chapter 1's table straight out of the .docx and
compares it to AUDIO_CLIPS.

Black gives each letter an English keyword rather than a phonetic symbol:
alpha is "father (long) / bat (short)", chi is "chemist". The keyword is the
teaching, so the keyword is what the clip has to match.

The books live outside the repo, so this says so and exits clean when they are
not on the machine -- the same way check_black does.
"""
import io
import os
import re
import sys
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
BOOK = os.path.join(os.path.dirname(REPO), "Greek App Reference",
                    "Black", "1.docx")

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

# What each of Black's keywords means as a sound, so his table and the app's
# can be compared at all. One line each, and each says which keyword it came
# from rather than standing on its own authority.
KEYWORD = {
    "father": "ah", "bat": "a", "ball": "b", "gift": "g", "dog": "d",
    "bet": "eh", "adze": "dz", "obey": "ay", "thin": "th",
    "machine": "ee", "pit": "ih", "kin": "k", "lamb": "l", "man": "m",
    "name": "n", "wax": "ks", "omelet": "short o", "pin": "p", "rat": "r",
    "sing": "s", "tale": "t", "lute": "oo", "put": "uh",
    "physics": "f", "chemist": "k", "taps": "ps", "gold": "oh",
    "aisle": "eye", "eight": "ay", "oil": "oy", "suite": "wee",
    "Faust": "ow", "feud": "ew", "soup": "oo",
}


# WHAT BLACK AND THE APP DISAGREE ABOUT, each entry saying why it is here.
# These are open questions for a person, not decisions this file may make, and
# each names what would settle it. Anything NOT in this list fails the build,
# which is the point of writing them down rather than remembering them.
KNOWN = {
    "Α α": "Black gives alpha BOTH long (father) and short (bat) "
        "and the app teaches only the long. Iota already ships both as "
        "'ih / ee', so the deck can hold two; whether a beginner should meet "
        "both on the letter card is Fraser's call.",
    "Υ υ": "the same, for upsilon: lute (long) and put (short), "
        "and the app teaches only the long.",
    "Χ χ": "THE ONE REAL CONTRADICTION. The app teaches chi as "
        "'kh'; Black's keyword is 'chemist' and his note says the ch of "
        "chemist 'may be used instead (i.e., approximately the same sound as "
        "for k)'. The vocabulary cues reached the same answer independently "
        "— chi is a plain k wherever it stands, settled across four "
        "words. So the letter card is the last place still teaching 'kh'.",
    "ηυ": "Black lists SEVEN diphthongs and the app teaches "
        "eight; ηυ is the extra. It is real Greek and rare, so "
        "this is an addition rather than an error — but it is taught "
        "without his authority behind it.",
}


def black_table():
    """(letters, diphthongs) as Black gives them: name -> keyword list.

    Anchored on the KEYWORDS rather than parsed positionally. The table runs
    the columns together with no separators -- "BetaBbball" -- so a pattern
    for the one-or-two-letter English column eats the first letter of the
    keyword and turns "ball" into "all". Looking for the keywords themselves,
    in the span between one letter name and the next, cannot do that.
    """
    z = zipfile.ZipFile(BOOK)
    t = re.sub(r"<[^>]+>", "", z.read("word/document.xml").decode("utf-8"))
    i = t.index("NameUppercase")
    # BOUNDED AT THE TABLE'S END. Omega is the last row, so an open
    # span runs on into the notes below -- which mention "gift" and
    # "man" -- and omega came back carrying their keywords.
    row = t[i:i + 900]
    cut = row.find("i. Note")
    if cut > 0:
        row = row[:cut]

    names = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta",
             "Theta", "Iota", "Kappa", "Lambda", "Mu", "Nu", "Xi", "Omicron",
             "Pi", "Rho", "Sigma", "Tau", "Upsilon", "Phi", "Chi", "Psi",
             "Omega"]
    at = [(n, row.index(n)) for n in names if n in row]
    letters = {}
    for k, (n, p) in enumerate(at):
        end = at[k + 1][1] if k + 1 < len(at) else len(row)
        span = row[p:end]
        found = [w for w in KEYWORD if w in span]
        # longest first, so "put" inside "output" cannot outrank a real one
        letters[n] = sorted(found, key=lambda w: -span.index(w))[::-1]
    j = t.index("DiphthongPronunciation")
    span = t[j:j + 400]
    dip = {}
    for g in ("αι", "ει", "οι",
              "υι", "αυ", "ευ",
              "ου"):
        p = span.find(g)
        if p < 0:
            continue
        m = re.match(r"[α-ω]{2}([A-Za-z]+)", span[p:])
        if m:
            dip[g] = [m.group(1)]
    return letters, dip


def app_table():
    s = io.open(os.path.join(REPO, "data", "audio.js"),
                encoding="utf-8").read()
    rows = re.findall(r'\["([^"]+)","([^"]+)","([^"]+)","(letter|diphthong)"',
                      s)
    return rows


def main():
    if not os.path.isfile(BOOK):
        print("Black is not on this machine (%s) — nothing checked"
              % os.path.basename(BOOK))
        return 0

    letters, dip = black_table()
    rows = app_table()
    bad, ok = [], 0

    for greek, name, sound, kind in rows:
        if kind == "letter":
            kws = letters.get(name)
            if not kws:
                bad.append("%s %s is not in Black's table" % (greek, name))
                continue
            want = [KEYWORD.get(k) for k in kws if KEYWORD.get(k)]
            said = [x.strip() for x in sound.split("/")]
            if not set(said) & set(want):
                bad.append("%s %s: the app says %r, Black says %s (%s)"
                           % (greek, name, sound,
                              " / ".join(want), ", ".join(kws)))
            else:
                ok += 1
                if len(want) > len(said):
                    bad.append("%s %s: Black gives %s and the app teaches only "
                               "%r" % (greek, name, " and ".join(want), sound))
        else:
            kws = dip.get(greek)
            if not kws:
                bad.append("%s is not among Black's seven diphthongs" % greek)
                continue
            want = KEYWORD.get(kws[0])
            if want and sound.strip() != want:
                bad.append("%s: the app says %r, Black says %r (%s)"
                           % (greek, sound, want, kws[0]))
            else:
                ok += 1

    live = [b for b in bad
            if not any(k in b for k in KNOWN)]
    for k, why in sorted(KNOWN.items()):
        if not any(k in b for b in bad):
            live.append("KNOWN excuses %s and Black no longer "
                        "disagrees there — the entry is stale" % k)
    print("alphabet rows put to Black's table: %d   agreeing: %d"
          % (len(rows), ok))
    for b in bad:
        print("   " + b + ("" if b in live else "  — known, see KNOWN"))
    return 1 if live else 0


if __name__ == "__main__":
    sys.exit(main())

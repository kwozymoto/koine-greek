# -*- coding: utf-8 -*-
"""STROKE_START in js/write.js: where the tracing pad says a letter begins.

    python tools/check_strokes.py

WHY THIS EXISTS. This is a hand-written Greek table read off a picture, which
is the shape of data this repo has shipped wrong before. It came from Black,
*Learn to Read New Testament Greek*, chapter 1 §6 -- a diagram of the
lowercase letters, each with an arrow -- transcribed at 9-20x and checked
against the page by Fraser.

WHAT THIS CAN SETTLE. That the table covers every letter the app teaches and
nothing else, that each direction is one the renderer knows how to draw, that
the anchors are inside the glyph, and -- the one that matters -- that the two
letters BLACK DESCRIBES IN PROSE still say what he says. He writes that "β and
ρ are formed with a single stroke, beginning at the bottom", so if either of
those rows ever stops meaning "start at the foot and go up", the table has
drifted from the book and this fails.

WHAT IT CANNOT. Whether the other twenty-three arrows were read correctly off
the diagram. That is the third row of rule 8: it needed the source and a
second reader, and it got both. A checker cannot re-open the book.

THE SURPRISING TWO. Sigma and tau look like transcription errors and are not,
so they are pinned here with their reasons. Changing either fails this
checker, which is the point: a later reader who "corrects" sigma to match the
other round letters has to come here and argue with Black first.
"""
import io, json, os, subprocess, sys, unicodedata

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

# Black states these in words, not only in the diagram. They are the check
# that the picture was read the right way round: thin tail where the pen
# starts, solid head showing the first direction.
IN_THE_PROSE = {
    "β": "β and ρ are formed with a single stroke, beginning at the bottom",
    "ρ": "β and ρ are formed with a single stroke, beginning at the bottom",
}

# Rows that look wrong and are not. Each has to keep its recorded direction.
SURPRISING = {
    "σ": ("down-right",
               "the only bowl drawn clockwise. Going down the right side "
               "brings the pen back up to the top-right, which is where the "
               "crossbar starts, so the whole letter is one stroke."),
    "τ": ("right",
               "the only arrow pointing upward in the diagram: it curves up "
               "into the LEFT END of the crossbar, so the bar is drawn first, "
               "left to right, and not the stem."),
}


def js_values():
    """Ask JavaScript for the arrays rather than parsing them out by hand."""
    # node reads the files itself: data/lessons.js is far too big to hand to
    # a command line, and Windows refuses it outright.
    js = ("const fs=require('fs'),vm=require('vm');const c=vm.createContext({});"
          "for(const f of ['data/lessons.js','js/write.js'])"
          "vm.runInContext(fs.readFileSync(f,'utf8'),c);"
          "process.stdout.write(vm.runInContext('JSON.stringify({alphabet:"
          "ALPHABET,start:STROKE_START,dirs:Object.keys(WDIR)})',c));")
    r = subprocess.run(["node", "-e", js], capture_output=True, text=True,
                       encoding="utf-8", cwd=ROOT)
    if r.returncode != 0:
        sys.exit("node could not read the tables:\n" + (r.stderr or "").strip())
    return json.loads(r.stdout)


def main():
    v = js_values()
    start, dirs = v["start"], set(v["dirs"])
    bad = []

    # 1. Exactly the letters the app teaches, and the final sigma beside them.
    taught = []
    for row in v["alphabet"]:
        forms = row[0].split(" ")
        taught.extend(forms[1:])              # "Σ σ ς" contributes σ AND ς
    want, have = set(taught), set(start)
    for k in sorted(want - have):
        bad.append("%s is taught in ALPHABET and has no starting point" % k)
    for k in sorted(have - want):
        bad.append("%s has a starting point and is not a letter the app teaches" % k)

    # 2. Shape of each row, and Greek written the way the rest of the app
    #    writes it -- an unnormalised key would simply never be found.
    for k in sorted(have):
        if unicodedata.normalize("NFC", k) != k:
            bad.append("%r is not NFC-normalised" % k)
        row = start[k]
        if not (isinstance(row, list) and len(row) == 3):
            bad.append("%s: expected [x, y, direction], got %r" % (k, row))
            continue
        x, y, d = row
        for name, n in (("x", x), ("y", y)):
            if not isinstance(n, (int, float)) or not 0 <= n <= 1:
                bad.append("%s: %s is %r, which is outside the glyph" % (k, name, n))
        if d not in dirs:
            bad.append("%s: direction %r is not one WDIR can draw (%s)"
                       % (k, d, ", ".join(sorted(dirs))))

    # 3. THE ONE THAT APPEALS TO THE BOOK. Black says these begin at the
    #    bottom and go up; the table has to agree.
    for k, quote in IN_THE_PROSE.items():
        row = start.get(k)
        if not row or len(row) != 3:
            continue
        if row[2] != "up" or row[1] < 0.999:
            bad.append("%s: Black writes “%s”, so this must start at "
                       "the foot (y 1.0) and go up; it has y %s going %r"
                       % (k, quote, row[1], row[2]))

    # 4. The two that look like mistakes keep their reasons.
    for k, (want_dir, why) in SURPRISING.items():
        row = start.get(k)
        if row and len(row) == 3 and row[2] != want_dir:
            bad.append("%s now goes %r, not %r. It was recorded as %r because "
                       "%s If the diagram really says otherwise, change the "
                       "reason in check_strokes.py in the same commit."
                       % (k, row[2], want_dir, want_dir, why))

    print("letters with a starting point:    %d" % len(start))
    print("held to Black's own words:        %s"
          % ", ".join(sorted(IN_THE_PROSE)))
    print("pinned with a reason:             %s" % ", ".join(sorted(SURPRISING)))
    if bad:
        print("\nSTROKE STARTS DO NOT MATCH THE SOURCE: %d" % len(bad))
        for b in bad:
            print("   " + b)
        print("\n   The diagram is Black ch.1 §6. It is a picture, so a\n"
              "   disagreement here is settled by opening it, not by reasoning\n"
              "   about which way a letter ought to go.")
        sys.exit(1)
    print("\nevery letter the app teaches has a place to begin, and the two\n"
          "Black describes in words still say what he says")


if __name__ == "__main__":
    main()

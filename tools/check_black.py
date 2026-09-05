# -*- coding: utf-8 -*-
"""Check each chapter's vocabulary against Black's own list.

    python tools/check_black.py

`v:` in data/lessons.js is the list of VOCAB positions naming which words a
chapter teaches. Nothing else in this repo can check it. It has no derivable
truth — the corpus does not know which chapter a word belongs to, and
check_frozen can only tell you the array moved, not that it is wrong.

Black can. His vocabulary sections are the source the array came from, and
they are cleanly parseable: a lone number opens a chapter, "62. Vocabulary"
opens the list, "63. Exercises" closes it, and each line is Greek followed by
English with no separator but the change of script.

**The books are not in this repository and never will be.** They live in
`../Greek App Reference/Black/`, outside it, because they are copyrighted and
this repo is published. So this checker is optional by design: if the folder
is not on the machine it says so and exits clean, the way check_links does
with --offline. Nothing it reads is ever written anywhere.

Agreement is currently 389 of 395 words, and the six are all citation-form
differences rather than errors — an iota subscript, an accent, a movable nu,
an active headword where Black cites the middle. Those are listed in SPELLING
below with what each one is, so a real disagreement stands out against them
instead of being lost in noise.

Two asymmetries, both deliberate:

  * A word the app teaches that Black's chapter does not have is a **failure**.
    That is the shape a corrupted `v:` array takes.
  * A word Black has that the app's chapter does not is **reported only**.
    He lists principal parts under Vocabulary — εἶδον, βέβληκα, ἐβαπτίσθην —
    and those are not separate lemmas; the app keeps them in the PP array
    instead. Chapter 15 is nineteen of his against none of ours for exactly
    that reason.
"""
import glob, io, json, os, re, subprocess, sys, unicodedata, zipfile

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BLACK = os.path.join(os.path.dirname(ROOT), "Greek App Reference", "Black")
GK = "Ͱ-Ͽἀ-῿"

# The app's headword against Black's, where the two spell a word differently.
# Every one of these was looked at; none is an error in either.
SPELLING = {
    "σῴζω": "σώζω",              # iota subscript; the app follows SBLGNT
    "ἀποθνῄσκω": "ἀποθνήσκω",    # the same
    "κλῆσις": "κλήσις",          # circumflex against acute
    "ἔξεστι(ν)": "ἔξεστι",       # the app's citation carries the movable nu
    "εὐαγγελίζω": "εὐαγγελίζομαι",  # active headword, middle in Black
    "νέος": "νεός",              # accent placement
}


def norm(x):
    y = unicodedata.normalize("NFD", x).replace("̀", "́")
    return unicodedata.normalize("NFC", y).lower()


def docx_text(p):
    with zipfile.ZipFile(p) as z:
        x = z.read("word/document.xml").decode("utf-8")
    x = x.replace("</w:p>", "\n")
    return re.sub(r"<[^>]+>", "", re.sub(r"<(?!/?w:t(?:\s[^>]*)?>)[^>]+>", "", x))


def black_vocabulary():
    """chapter number -> the headwords Black lists for it."""
    out = {}
    for f in sorted(glob.glob(os.path.join(BLACK, "*.docx"))):
        if not re.match(r"^[\d\-]+\.docx$", os.path.basename(f)):
            continue                       # appendices and the full glossary
        cur, invocab = None, False
        for line in docx_text(f).split("\n"):
            L = line.strip()
            if re.match(r"^\d{1,2}$", L):              # a lone number opens a chapter
                cur, invocab = int(L), False
                out.setdefault(cur, [])
            elif re.match(r"^\d+\.\s*Vocabulary\s*$", L):
                invocab = True
            elif invocab and re.match(r"^\d+\.\s*(Exercises|[A-Z])", L):
                invocab = False
            elif invocab and cur:
                # Greek, then English, with nothing between them but the change
                # of script. The boundary is the first Latin letter, NOT the
                # first capital: requiring a capital silently dropped μή and οὐ
                # out of chapter 3, which is what made an earlier attempt at
                # this look unreliable when it was only wrong.
                m = re.match(r"^([%s][%s\s,\.'’ʹ\-]*)" % (GK, GK), L)
                if m:
                    h = m.group(1).split(",")[0].strip()
                    if re.sub("[^%s]" % GK, "", h):
                        out[cur].append(h)
    return {c: w for c, w in out.items() if w}


# Words Black lists that the app's chapter does not, and why each is right.
# Without these the report is seven lines of noise and nobody reads the eighth.
KNOWN_EXTRA = {
    "ἄρχομαι": "the middle of ἄρχω, which is in the deck as 'I rule; (middle) I begin'",
    "βαίνω": "never occurs alone in the NT — only in compounds like ἀναβαίνω",
    "μείζων": "the comparative of μέγας; the corpus lemmatises it there",
    "μέν": "in the deck at 179×, but learned by frequency rather than by chapter",
    "ἐάν μή": "two words Black lists as an idiom; both are in the deck separately",
}


if not os.path.isdir(BLACK):
    print("Black is not on this machine, so the chapter vocabulary was not checked.")
    print("  looked in: %s" % BLACK)
    print("  (the books are deliberately outside the repository; see CLAUDE.md)")
    sys.exit(0)

js = ("const fs=require('fs'),vm=require('vm');const c=vm.createContext({});"
      "for(const f of ['data/vocab.js','data/lessons.js'])"
      "vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});"
      "process.stdout.write(vm.runInContext('JSON.stringify({LESSONS,VOCAB})',c));")
r = subprocess.run(["node", "-e", js], cwd=ROOT, capture_output=True,
                   text=True, encoding="utf-8")
if r.returncode:
    sys.exit("could not load the app data:\n" + r.stderr)
d = json.loads(r.stdout)
LESSONS, VOCAB = d["LESSONS"], d["VOCAB"]
head = lambda i: VOCAB[i][0].split(",")[0].strip()

black = black_vocabulary()
if not black:
    sys.exit("found the folder but no vocabulary sections in it — has the format changed?")

missing, extra, checked = [], [], 0
for l in LESSONS:
    app = {head(i) for i in (l.get("v") or [])}
    bl = {norm(w) for w in black.get(l["id"], [])}
    if not app:
        continue
    if not bl:
        extra.append("ch%-3d the app teaches %d words here; Black's chapter has no "
                     "vocabulary section" % (l["id"], len(app)))
        continue
    for w in sorted(app):
        checked += 1
        if norm(w) in bl:
            continue
        if norm(SPELLING.get(w, "")) in bl:
            continue
        missing.append("ch%-3d %s is not in Black's list for that chapter" % (l["id"], w))
    only_black = sorted(bl - {norm(w) for w in app}
                        - {norm(SPELLING.get(w, w)) for w in app}
                        - {norm(k) for k in KNOWN_EXTRA})
    # Principal parts are the bulk of what is left, and they are not lemmas:
    # the app keeps them in PP. Report the count and a sample, not all of it.
    if only_black:
        extra.append("ch%-3d Black also lists %d the app does not: %s"
                     % (l["id"], len(only_black), " ".join(only_black[:6])))

print("chapters Black gives a vocabulary for: %d   app words checked against him: %d"
      % (len(black), checked))
print("spelling differences allowed for: %d" % len(SPELLING))
print()
print("app words Black's chapter does not have: %d" % len(missing))
for m in missing:
    print("   " + m)
print()
print("words Black has that the app's chapter does not: %d" % len(extra))
print("   (reported only — he lists principal parts under Vocabulary and the")
print("    app keeps those in PP instead; %d further differences are explained"
      % len(KNOWN_EXTRA))
for k, why in sorted(KNOWN_EXTRA.items()):
    print("      %-10s %s" % (k, why))
for e in extra:
    print("   " + e)

sys.exit(1 if missing else 0)

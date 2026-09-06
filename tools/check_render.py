# -*- coding: utf-8 -*-
"""Every English rendering in a lesson, against six published translations.

    python tools/check_render.py

A chapter quotes a fragment of Greek and then renders it:

    <p class="v" data-ref="Matthew 3:2">Μετανοεῖτε, ἤγγικεν γὰρ ἡ βασιλεία…</p>
    <p>"Repent, for the kingdom of heaven has come near." …</p>

check_lessons proves the Greek occurs contiguously in the verse it names.
Nothing has ever looked at the English. There are 130 of them and they are
the last large unchecked surface in the app.

HOW IT IS CHECKED. Not against one translation — that would flag every place
we chose a different word. The test is weaker and more useful: every content
word of the rendering must appear somewhere in that verse in at least ONE of
six translations chosen for different philosophies —

    ASV    1901, literal          KJV    1611, formal
    BSB    Berean, modern         YLT    1898, hyper-literal
    Darby  1889, literal          NHEB   modern

Between them they cover most defensible English for a verse. A word none of
the six uses is either a deliberate choice worth recording or a mistake, and
this file makes you say which. Three were not enough: with ASV, BSB and Darby
alone it reported 57, and the extra three took that to 26 without letting any
real fault through — the planted "I am the light of the harvest" is still
named.

WHAT IT CANNOT DO. It cannot see a rendering that uses the right words in the
wrong relation — "God loves the world" and "the world loves God" pass equally.
It catches vocabulary, not syntax. That is worth saying plainly, because a
green run here is not a translation review.

THE TRANSLATIONS LIVE OUTSIDE THE REPO, in ../Greek App Reference/
Translations/, like Black and Huffman. All six are public domain. When they
are not on the machine this says so and exits clean, the way check_black does.
"""
import io, json, os, re, sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from english import STOP, AUXILIARY, words as _words, variants   # noqa: E402

# A verse is full of auxiliaries and every translation spells them
# differently, so they are dropped here. check_gloss keeps them, because
# "I have" is the whole of ἔχω.
DROP = STOP | AUXILIARY
words = lambda t: _words(t, DROP)

TDIR = os.path.join(os.path.dirname(ROOT), "Greek App Reference", "Translations")
VERSIONS = ["ASV", "BSB", "Darby", "KJV", "YLT", "NHEB"]

# The files number the books with Roman numerals and give Revelation its long
# name, so "1 Corinthians 13:13" finds nothing at all until it is translated.
# Every miss was reported as "no such verse", which is the checker saying it
# could not look rather than that the rendering was wrong.
BOOK = {"1": "I", "2": "II", "3": "III"}

# Renderings whose wording no translation shares, and why that is deliberate.
ALLOWED = {
    # Every one of these is the app rendering in modern English where six
    # translations — four of 1611 to 1901, and BSB and NHEB, which are not
    # old — reach for an older word. None is a mistake. Each is a decision,
    # and this is where the decisions are written down.
    ('Matthew 11:3', 'are you the one who is to come, or should we expect another?'):
        "προσδοκῶμεν. All six say 'look for'",
    ('Matthew 28:6', 'he is not here, for he has been raised.'):
        "ἠγέρθη is passive, and 'he is risen' — which all six have — is not. The rendering is deliberately the more accurate one",
    ('1 Corinthians 3:14', "if anyone's work remains."):
        "τινος. They say 'any man'",
    ('John 1:3', 'all things came into being through him.'):
        "ἐγένετο rendered literally. They say 'were made'",
    ('Mark 10:45', 'to give his life a ransom in place of many.'):
        "ἀντί made explicit, 'in place of' rather than the bare 'for many' all six use, because chapter 8 is teaching that preposition",
    ('Matthew 21:12', 'and jesus entered the temple and threw out everyone.'):
        "ἐξέβαλεν πάντας. They say 'cast out all'",
    ('John 1:10', 'the world came into being through him, and the world did not know him.'):
        "ἐγένετο rendered literally. They say 'were made'",
    ('1 Thessalonians 4:16', 'the lord himself, with a cry of command.'):
        "κελεύσματι. They say 'shout'",
    ('John 10:1', 'that man is a thief and a robber.'):
        "the rendering names the subject where the Greek has none and they carry it in the verb",
    ('1 John 2:6', 'he ought himself to walk as that one walked.'):
        "ἐκεῖνος as 'that one', to show it is a demonstrative, which is the point being taught. They say 'he'",
    ('John 16:13', 'when that one comes, the spirit of truth.'):
        "ἐκεῖνος as 'that one', to show it is a demonstrative, which is the point being taught. They say 'he'",
    ('Matthew 11:5', 'lepers are being cleansed and deaf people hear, and dead people are being raised and poor people have good news preached to them.'):
        "ἄνθρωποι as people rather than the 'men' all six have. The Greek is not gendered here",
    ('John 20:31', 'but these things have been written so that you may believe.'):
        "ταῦτα. They say 'these'",
    ('Ephesians 1:4', 'just as he chose us in him before the foundation of the world.'):
        "καθώς as 'just as'. They say 'according as', or nothing",
    ('Romans 15:4', 'for whatever was written beforehand was written for our instruction.'):
        "προεγράφη. They say 'aforetime'",
    ('John 13:7', 'what i am doing you do not know now, but you will understand afterwards.'):
        "μετὰ ταῦτα. They say 'hereafter'",
    ('John 13:16', 'a slave is not greater than his master'):
        "δοῦλος. All six say 'servant', which softens a word this course deliberately does not soften",
    ('John 3:19', 'people loved the darkness rather than the light.'):
        "ἄνθρωποι as people rather than men",
    ('Matthew 15:11', 'it is not what goes into the mouth that defiles a person.'):
        "the same, in the singular",
    ('Matthew 7:13', 'broad is the road that leads to destruction.'):
        "ὁδός. They say 'way'",
    ('Matthew 2:13', 'for herod is about to search for the child in order to destroy him.'):
        "a purpose clause spelled 'in order to', because the chapter is teaching purpose. They say plain 'to'",
    ('Matthew 13:4', 'and while he was sowing.'):
        "ἐν τῷ σπείρειν. They say 'as he sowed'",
    ('Mark 1:14', 'and after john was handed over.'):
        "παραδοθῆναι. They say 'delivered up'",
    ('John 1:7', 'he came for a witness, in order that he might testify about the light.'):
        "a purpose clause spelled 'in order to', because the chapter is teaching purpose. They say plain 'to'",
    ('Matthew 5:20', 'you will certainly not enter the kingdom of heaven.'):
        "οὐ μή, the emphatic negation the chapter is teaching. KJV has 'in no case', the rest 'never' — none of them a word this rendering could borrow",
    ('Romans 3:4', 'by no means! let god be true.'):
        "μὴ γένοιτο as 'by no means'. KJV has 'God forbid', which says more than the Greek does",
}


def load():
    """verse key -> the text of it in each translation."""
    out = {}
    for v in VERSIONS:
        p = os.path.join(TDIR, v + ".json")
        if not os.path.exists(p):
            return None
        d = json.load(io.open(p, encoding="utf-8"))
        for b in d["books"]:
            for ch in b["chapters"]:
                for vs in ch["verses"]:
                    key = (b["name"], int(ch["chapter"]), int(vs["verse"]))
                    out.setdefault(key, []).append(vs["text"])
    return out


TEXT = load()
if TEXT is None:
    print("the translations are not on this machine, so the renderings were "
          "not checked.")
    print("  expected: %s" % TDIR)
    print("  %s — all public domain" % ", ".join(v + ".json" for v in VERSIONS))
    sys.exit(0)
print("translations loaded: %s   verses: %d" % (", ".join(VERSIONS), len(TEXT)))


def verses(ref):
    """The text of every verse a reference names, from every translation."""
    m = re.match(r"^(.+?)\s+(\d+):(\d+)(?:[-–](\d+))?$", ref.strip())
    if not m:
        return None
    book, ch = m.group(1), int(m.group(2))
    p = book.split(" ", 1)
    if len(p) == 2 and p[0] in BOOK:
        book = BOOK[p[0]] + " " + p[1]
    if book == "Revelation":
        book = "Revelation of John"
    lo, hi = int(m.group(3)), int(m.group(4) or m.group(3))
    got = []
    for v in range(lo, hi + 1):
        got += TEXT.get((book, ch, v), [])
    return got or None


src = io.open(os.path.join(ROOT, "data", "lessons.js"), encoding="utf-8").read()
pat = re.compile(r'<p class="v" data-ref="([^"]+)">(.*?)</p>\s*\n<p>(.*?)</p>', re.S)

n = checked = noverse = 0
bad, used = [], set()

for ref, greek, para in pat.findall(src):
    n += 1
    m = re.match(r'\s*[“"](.*?)[”"]', re.sub(r"<[^>]+>", "", para), re.S)
    if not m:
        continue                       # the paragraph is comment, not rendering
    eng = re.sub(r"\s+", " ", m.group(1)).strip()
    got = verses(ref)
    if not got:
        noverse += 1
        bad.append("%s: no such verse in the translations" % ref)
        continue
    checked += 1
    theirs = set()
    for t in got:
        for w in words(t):
            theirs |= variants(w)
    missing = [w for w in words(eng) if not (variants(w) & theirs)]
    if not missing:
        continue
    k = (ref, eng.lower())
    if k in ALLOWED:
        used.add(k)
    else:
        bad.append("%-22s %s\n        no translation uses: %s"
                   % (ref, eng[:74], ", ".join(missing)))

print("verse quotations in the lessons: %d   with an English rendering: %d"
      % (n, checked))
outright = checked - len(used) - len([b for b in bad if "no translation uses" in b])
print("renderings every word of which a translation also uses: %d" % outright)
print("renderings worded our own way, each listed with a reason: %d" % len(used))

stale = set(ALLOWED) - used
for ref, eng in sorted(stale):
    bad.append("stale entry: %s %r — the rendering was edited" % (ref, eng))

print("\nrenderings not accounted for: %d"
      % len([b for b in bad if not b.startswith("stale")]))
for b in bad[:24]:
    print("   " + b)
if len(bad) > 24:
    print("   ... and %d more" % (len(bad) - 24))
sys.exit(1 if bad else 0)

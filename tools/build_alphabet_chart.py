# -*- coding: utf-8 -*-
"""Rebuild audio/erasmian-alphabet-chart.pdf from the app's own tables.

    python tools/build_alphabet_chart.py

WHY IT EXISTS. The chart used to be a hand-made PDF, and a hand-made copy of
a table drifts from the table. It said upsilon was "ew / ü — few / German ü"
long after the course had settled on Black's "u — lute (long), put (short)",
so the printable chart, the alphabet screen and 818 word clips disagreed
about a letter a learner meets in week one. Generating it from ALPHABET in
data/lessons.js and the diphthong rows in data/audio.js means it cannot say
anything the app does not.

It also fixes something the old one got wrong for a different reason: it
embedded no fonts, so every Greek character outside the tables rendered as a
black box — "■γελος = ANG-geh-los", "Iota subscript (■ ■ ■)", "Rough
breathing (■)". A chart of the Greek alphabet that cannot print Greek is
worse than no chart. This embeds a font that covers the range and asserts
the coverage before writing anything.

Run it whenever ALPHABET changes. check_render has no opinion about PDFs, so
nothing else will notice if you do not.
"""
import io
import os
import re
import sys

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (Paragraph, SimpleDocTemplate, Spacer, Table,
                                TableStyle)

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "audio", "erasmian-alphabet-chart.pdf")

# A font that actually covers polytonic Greek. The old chart embedded none,
# which is why its breathings and its ἄγγελος came out as boxes.
# Serif first, to sit beside the app's own Greek face, but coverage decides:
# georgia and times are the obvious choices and NEITHER can print a breathing
# or an iota subscript. The assertion below is what caught that.
CANDIDATES = [
    (r"C:\Windows\Fonts\constan.ttf", r"C:\Windows\Fonts\constanb.ttf"),
    (r"C:\Windows\Fonts\calibri.ttf", r"C:\Windows\Fonts\calibrib.ttf"),
    (r"C:\Windows\Fonts\arial.ttf", r"C:\Windows\Fonts\arialbd.ttf"),
]
# Every Greek character this chart prints, including the polytonic ones in
# the closing note. Coverage is the SELECTION criterion, not a check applied
# after the fact — picking the first font that merely exists chose constantia,
# which cannot print a breathing either.
NEEDED = "αβγδεζηθικλμνξοπρστυφχψωΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩςἄἁῥῳῃᾳ"

REGULAR = BOLD = None
tried = []
for reg, bold in CANDIDATES:
    if not (os.path.isfile(reg) and os.path.isfile(bold)):
        continue
    cmap = TTFont("probe", reg).face.charToGlyph
    missing = [c for c in NEEDED if not cmap.get(ord(c))]
    if missing:
        tried.append("%s (cannot print %s)"
                     % (os.path.basename(reg), " ".join(missing)))
        continue
    REGULAR, BOLD = reg, bold
    break
if not REGULAR:
    sys.exit("no candidate font covers polytonic Greek:\n  " + "\n  ".join(tried))
for t in tried:
    print("skipped %s" % t)

pdfmetrics.registerFont(TTFont("Body", REGULAR))
pdfmetrics.registerFont(TTFont("BodyB", BOLD))


def js_array(path, name, fields):
    src = io.open(os.path.join(ROOT, path), encoding="utf-8").read()
    i = src.index("const %s=[" % name)
    body = src[i:src.index("\n];", i)]
    pat = r'\[' + ",".join([r'"([^"]*)"'] * fields) + r'(?:,[^\]]*)?\]'
    return re.findall(pat, body)


LETTERS = js_array("data/lessons.js", "ALPHABET", 4)
CLIPS = js_array("data/audio.js", "AUDIO_CLIPS", 3)
DIPHS = [c for c in CLIPS if '"diphthong"' in "" or True]
# AUDIO_CLIPS rows carry a kind; pick the diphthongs out of the raw source
src = io.open(os.path.join(ROOT, "data", "audio.js"), encoding="utf-8").read()
DIPHS = re.findall(r'\["([^"]*)","([^"]*)","([^"]*)","diphthong"', src)

if len(LETTERS) != 24:
    sys.exit("expected 24 letters in ALPHABET, found %d" % len(LETTERS))
print("letters: %d   diphthongs: %d   font: %s"
      % (len(LETTERS), len(DIPHS), os.path.basename(REGULAR)))

INK = colors.HexColor("#1f2937")
HEAD = colors.HexColor("#2f3a4f")
RULE = colors.HexColor("#c8ccd4")
ALT = colors.HexColor("#f4f1ea")

h1 = ParagraphStyle("h1", fontName="BodyB", fontSize=17, leading=21,
                    alignment=1, textColor=INK)
sub = ParagraphStyle("sub", fontName="Body", fontSize=8.6, leading=12,
                     alignment=1, textColor=colors.HexColor("#5b6472"))
h2 = ParagraphStyle("h2", fontName="BodyB", fontSize=11.5, leading=15,
                    textColor=INK, spaceBefore=4, spaceAfter=5)
note = ParagraphStyle("note", fontName="Body", fontSize=7.8, leading=11,
                      textColor=colors.HexColor("#4b5563"))


def table(rows, widths):
    t = Table(rows, colWidths=widths, repeatRows=1, hAlign="LEFT")
    t.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, 0), "BodyB"),
        ("FONTNAME", (0, 1), (-1, -1), "Body"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.8),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("BACKGROUND", (0, 0), (-1, 0), HEAD),
        ("TEXTCOLOR", (0, 1), (-1, -1), INK),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, ALT]),
        ("GRID", (0, 0), (-1, -1), 0.4, RULE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 2.2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2.2),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
    ]))
    return t


story = [
    Paragraph("Erasmian Koine Greek Alphabet", h1),
    Spacer(1, 3),
    Paragraph("Companion chart to Everyday Koine. Seminary / academic "
              "Erasmian — distinct letter sounds for spelling, not "
              "first-century speech.", sub),
    Spacer(1, 7),
    Paragraph("Letters", h2),
    table([["Letter", "Name", "Sound", "Written"]]
          + [[l[0], l[1], l[2], l[3]] for l in LETTERS],
          [26 * mm, 30 * mm, 68 * mm, 22 * mm]),
    Spacer(1, 8),
    Paragraph("Diphthongs", h2),
    table([["Spelling", "Made of", "Sound"]]
          + [[d[0], d[1], d[2]] for d in DIPHS],
          [26 * mm, 48 * mm, 72 * mm]),
    Spacer(1, 7),
    Paragraph("Gamma is <b>ng</b> before γ, κ, χ or ξ — ἄγγελος is "
              "<i>ang-geh-los</i>. The iota subscript (ᾳ ῃ ῳ) does not change "
              "the sound. A rough breathing (ἁ) adds an initial <b>h</b>; a "
              "smooth breathing (ἀ) does not, and on an initial ῥ the "
              "breathing is not sounded. Accents mark stress, not pitch.",
              note),
]

SimpleDocTemplate(OUT, pagesize=A4,
                  leftMargin=20 * mm, rightMargin=20 * mm,
                  topMargin=13 * mm, bottomMargin=12 * mm,
                  title="Erasmian Koine Greek Alphabet",
                  author="Everyday Koine").build(story)
print("wrote %s (%d bytes)" % (OUT, os.path.getsize(OUT)))

# A stamp of what it was built from. A PDF cannot be read back cheaply, so
# without this the chart could silently fall behind ALPHABET again — which is
# the whole reason this generator exists. check_ipa compares the stamp to the
# live tables and fails if the chart is stale.
import json
stamp = {"letters": [list(l) for l in LETTERS],
         "diphthongs": [list(d) for d in DIPHS]}
io.open(os.path.join(ROOT, "docs", "alphabet-chart.stamp.json"), "w",
        encoding="utf-8", newline="\n").write(
    json.dumps(stamp, ensure_ascii=False, indent=1) + "\n")
print("stamped docs/alphabet-chart.stamp.json")

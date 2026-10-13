# -*- coding: utf-8 -*-
"""icons/share.png -- the picture a link to the site shows when it is shared.

    python tools/build_share_image.py

Facebook, WhatsApp, Messenger and iMessage draw a card from og:image, and
1200x630 is the size they all crop to without cutting anything off. The
app's growth so far has been one person sending the link to another, so this
card is what most newcomers see first.

The Greek is John 1:1 as data/gnt/Jn.json has it, read from that file and
asserted rather than typed, per CLAUDE.md rule 1. Needs Pillow and the
Windows Palatino Linotype font, which has the polytonic Greek.
"""
import io, json, os, sys
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = r"C:\Windows\Fonts"
BG, GOLD, GOLD_DIM, TEXT, MUTED = "#141b2b", "#d4a537", "#8a6d24", "#e9e5da", "#97a1b5"

jn = json.load(io.open(os.path.join(ROOT, "data", "gnt", "Jn.json"), encoding="utf-8"))
words = [w[0].rstrip(",.;·") for w in jn["c"][0][0][1][:5]]
greek = " ".join(words)
assert greek == "Ἐν ἀρχῇ ἦν ὁ λόγος", greek

W, H = 1200, 630
im = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(im)
f = lambda name, size: ImageFont.truetype(os.path.join(FONTS, name), size)

icon = Image.open(os.path.join(ROOT, "icons", "icon-512.png")).convert("RGB").resize((340, 340), Image.LANCZOS)
im.paste(icon, (90, (H - 340) // 2))

x = 500
d.text((x, 150), "Everyday Koine", font=f("palab.ttf", 74), fill=GOLD)
d.text((x, 250), "Learn to read the", font=f("pala.ttf", 44), fill=TEXT)
d.text((x, 304), "Greek New Testament", font=f("pala.ttf", 44), fill=TEXT)
d.line((x, 384, x + 600, 384), fill=GOLD_DIM, width=2)
d.text((x, 404), greek, font=f("palai.ttf", 40), fill=GOLD)
d.text((x, 474), "Free  ·  No account  ·  Works offline", font=f("segoeui.ttf", 28), fill=MUTED)

out = os.path.join(ROOT, "icons", "share.png")
im.save(out, optimize=True)
print("wrote", out, os.path.getsize(out), "bytes")

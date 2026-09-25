# -*- coding: utf-8 -*-
"""The two themes: complete, identical where they must be, and legible.

    python tools/check_theme.py

Settings > Appearance offers Same as device, Light and Dark. css/app.css
defines the dark palette on :root and the light one twice -- inside
@media (prefers-color-scheme: light) for "Same as device", and on
:root[data-theme="light"] for an explicit choice. A token added to one light
block and not the other would be light on one route and dark on the other,
and nothing would look wrong on the machine that made the change.

So this checks, and fails on:

  * the two light blocks differing, or a colour token missing from a theme;
  * any pair in PAIRS below the contrast it needs, in either theme (WCAG 2
    relative luminance -- measured, as the rust comment in app.css says,
    not guessed);
  * a colour written as a literal in css/app.css outside the token blocks,
    unless ALLOWED names it and says why -- a literal is a colour one theme
    never changes;
  * a colour literal in js/*.js or index.html, the same way;
  * a site page (about, privacy, the generated chapter pages) whose palette
    has drifted from the app's, or that lacks the head script that applies
    the chosen theme before first paint, or the two theme-color metas;
  * THEME_BG in js/app.js disagreeing with --bg.
"""
import glob
import io
import os
import re
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
bad = []


def read(p):
    return io.open(p, encoding="utf-8").read()


def nocomments(s):
    return re.sub(r"/\*.*?\*/", "", s, flags=re.S)


def decls(body):
    return dict((k.strip(), v.strip()) for k, v in
                re.findall(r"(--[\w-]+|color-scheme)\s*:\s*([^;]+);?", body))


def themes(css):
    """(dark, light-by-media, light-by-attribute) token maps of one stylesheet."""
    css = nocomments(css)
    dark = {}
    for body in re.findall(r"(?<![\w\]\)])\s*:root\s*\{([^}]*)\}", css):
        dark.update(decls(body))
    m = re.search(r'@media\s*\(prefers-color-scheme:\s*light\)\s*\{\s*'
                  r':root:not\(\[data-theme="dark"\]\)\s*\{([^}]*)\}\s*\}', css)
    a = re.search(r':root\[data-theme="light"\]\s*\{([^}]*)\}', css)
    return dark, decls(m.group(1)) if m else None, decls(a.group(1)) if a else None


def lum(hexv):
    h = hexv.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    rgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in rgb]
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]


def contrast(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


# ------------------------------------------------------------- the app ---
app_css = read("css/app.css")
DARK, LIGHT_M, LIGHT_A = themes(app_css)
if LIGHT_M is None:
    bad.append("css/app.css: no @media (prefers-color-scheme: light) :root:not([data-theme=dark]) block")
if LIGHT_A is None:
    bad.append('css/app.css: no :root[data-theme="light"] block')
LIGHT = LIGHT_A or LIGHT_M or {}
if LIGHT_M is not None and LIGHT_A is not None and LIGHT_M != LIGHT_A:
    for k in sorted(set(LIGHT_M) | set(LIGHT_A)):
        if LIGHT_M.get(k) != LIGHT_A.get(k):
            bad.append("css/app.css: the light blocks differ on %s (%s / %s)"
                       % (k, LIGHT_M.get(k), LIGHT_A.get(k)))

COLOUR = re.compile(r"^(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\))$")
dark_colours = {k for k, v in DARK.items() if COLOUR.match(v)}
light_colours = {k for k, v in LIGHT.items() if COLOUR.match(v)}
for k in sorted(dark_colours - light_colours):
    bad.append("css/app.css: %s has a dark value and no light one" % k)
for k in sorted(light_colours - dark_colours):
    bad.append("css/app.css: %s has a light value and no dark one" % k)
if DARK.get("color-scheme") != "dark" or LIGHT.get("color-scheme") != "light":
    bad.append("css/app.css: color-scheme must be dark on :root and light in the light blocks "
               "(it is what turns native controls -- selects, scrollbars -- to match)")

# What must be readable against what, and why each pair exists.
TEXT = 4.5
PAIRS = [
    ("--text", "--bg", TEXT), ("--text", "--surface", TEXT), ("--text", "--surface-2", TEXT),
    ("--muted", "--bg", TEXT), ("--muted", "--surface", TEXT), ("--muted", "--surface-2", TEXT),
    # gold is text too: headings, links, the current nav tab, captions
    ("--gold", "--bg", TEXT), ("--gold", "--surface", TEXT), ("--gold", "--surface-2", TEXT),
    # the grade buttons and the drill groups' tones, on cards and on the page
    ("--green", "--surface", TEXT), ("--rust", "--surface", TEXT), ("--blue", "--surface", TEXT),
    ("--violet", "--surface", TEXT), ("--amber", "--surface", TEXT),
    ("--green", "--bg", TEXT), ("--rust", "--bg", TEXT), ("--blue", "--bg", TEXT),
    ("--violet", "--bg", TEXT), ("--amber", "--bg", TEXT),
    # "not available offline", on a video row
    ("--rust-text", "--surface-2", TEXT),
    # text on a fill: buttons, chosen chips, ticks, the marks on an answer
    ("--on-gold", "--gold", TEXT), ("--on-green", "--green", TEXT), ("--on-rust", "--rust", TEXT),
    # the word lit while a chapter is read aloud
    ("--text", "--say-bg", TEXT),
]
for name, theme in (("dark", DARK), ("light", LIGHT)):
    for fg, bg, need in PAIRS:
        a, b = theme.get(fg), theme.get(bg)
        if not (a and b and a.startswith("#") and b.startswith("#")):
            bad.append("%s theme: cannot measure %s on %s (%s, %s)" % (name, fg, bg, a, b))
            continue
        c = contrast(a, b)
        if c < need:
            bad.append("%s theme: %s on %s is %.2f:1, needs %.1f" % (name, fg, bg, c, need))
    # white text on the solid red: the offline pill and the leech flag
    if "--rust-solid" in theme and contrast("#ffffff", theme["--rust-solid"]) < TEXT:
        bad.append("%s theme: white on --rust-solid is %.2f:1" % (name, contrast("#ffffff", theme["--rust-solid"])))

# Literals outside the token blocks. Each allowed one says why a theme never
# needs to change it.
ALLOWED = {
    "rgba(212,165,55": "a translucent gold wash (a tapped word, a live cell) -- it tints either ground",
    "rgba(88,168,140": "a translucent green wash on a right answer -- it tints either ground",
    "rgba(205,97,82": "a translucent red wash on a wrong answer -- it tints either ground",
    "#000": "the letterbox behind an embedded video",
    "#fff": "white on the solid red (offline pill, leech flag) and the red play dot -- the red is dark enough in both themes",
}
body = nocomments(app_css)
body = re.sub(r":root(?::not\(\[data-theme=\"dark\"\]\)|\[data-theme=\"light\"\])?\s*\{[^}]*\}", "", body)
for lit in re.findall(r"#[0-9a-fA-F]{3,8}\b|rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+", body):
    key = lit.replace(" ", "")
    if not any(key.startswith(k) for k in ALLOWED):
        bad.append("css/app.css: colour literal %s outside the tokens -- make it a token" % lit)

# JavaScript and the app page carry no colours of their own.
JS_ALLOWED = {("js/write.js", "#fff"): "an offscreen mask the scorer reads by alpha, never shown",
              ("js/app.js", "#141b2b"): "THEME_BG, checked against --bg below",
              ("js/app.js", "#f3f5f9"): "THEME_BG, checked against --bg below"}
for f in sorted(x.replace(chr(92), "/") for x in glob.glob("js/*.js")):
    src = read(f)
    for lit in re.findall(r"""["'](#[0-9a-fA-F]{3,8})["']|(?:color|background|stroke|fill)\s*:\s*(#[0-9a-fA-F]{3,8})""", src):
        lit = lit[0] or lit[1]
        if (f, lit) not in JS_ALLOWED:
            bad.append("%s: colour literal %s -- read it from the theme" % (f, lit))
m = re.search(r'THEME_BG=\{dark:"(#[0-9a-fA-F]+)",light:"(#[0-9a-fA-F]+)"\}', read("js/app.js"))
if not m or (m.group(1), m.group(2)) != (DARK.get("--bg"), LIGHT.get("--bg")):
    bad.append("js/app.js: THEME_BG must be {dark:%s, light:%s}" % (DARK.get("--bg"), LIGHT.get("--bg")))
if 'THEME_KEY="koine.theme"' not in read("js/app.js"):
    bad.append('js/app.js: THEME_KEY is not "koine.theme", which every page head reads')


def head_ok(path, txt):
    metas = re.findall(r'<meta name="theme-color" content="(#[0-9a-fA-F]+)" media="\(prefers-color-scheme: (dark|light)\)">', txt)
    want = {("dark", DARK.get("--bg")), ("light", LIGHT.get("--bg"))}
    if {(t, c) for c, t in metas} != want:
        bad.append("%s: theme-color metas should be dark %s and light %s" % (path, DARK.get("--bg"), LIGHT.get("--bg")))
    sc = re.search(r'<script>[^<]*localStorage\.getItem\("koine\.theme"\).*?</script>', txt, re.S)
    if not sc:
        bad.append("%s: no head script applying koine.theme before first paint" % path)
    else:
        cols = re.findall(r'"(#[0-9a-fA-F]+)"', sc.group(0))
        if cols != [LIGHT.get("--bg"), DARK.get("--bg")]:
            bad.append("%s: the head script's bar colours %s are not light/dark --bg" % (path, cols))
        if txt.index(sc.group(0)) < txt.index('name="theme-color"'):
            bad.append("%s: the head script runs before the metas it sets" % path)


idx = read("index.html")
head_ok("index.html", idx)
for lit in re.findall(r'(?<=[\s"\':(])#[0-9a-fA-F]{3,6}\b', re.sub(r"<meta name=\"theme-color\"[^>]*>|<script>[^<]*koine\.theme.*?</script>", "", idx, flags=re.S)):
    bad.append("index.html: colour literal %s -- use a token" % lit)

# --------------------------------------------------------- the site pages ---
ALIAS = {"--gold-ink": "--on-gold"}
pages = ["about.html", "privacy.html", "chapters.html"] + sorted(
    x.replace(chr(92), "/") for x in glob.glob("chapters/*.html"))
for p in pages:
    txt = read(p)
    style = "".join(re.findall(r"<style>(.*?)</style>", txt, re.S))
    d, lm, la = themes(style)
    if lm is None or la is None:
        bad.append("%s: missing a light block" % p)
        continue
    if lm != la:
        bad.append("%s: its two light blocks differ" % p)
    for name, mine, app in (("dark", d, DARK), ("light", la, LIGHT)):
        for k, v in mine.items():
            if not COLOUR.match(v) and k != "color-scheme":
                continue
            ref = app.get(ALIAS.get(k, k))
            if ref is not None and ref.lower() != v.lower():
                bad.append("%s: %s %s is %s, the app's is %s" % (p, name, k, v, ref))
        if set(k for k, v in mine.items() if COLOUR.match(v)) != set(k for k, v in (d if name == "light" else la).items() if COLOUR.match(v)):
            bad.append("%s: dark and light define different colour tokens" % p)
    head_ok(p, txt)

print("tokens: %d colours in each theme; contrast pairs: %d per theme; pages: %d"
      % (len(dark_colours), len(PAIRS) + 1, len(pages) + 1))
if bad:
    print("")
    print("THEME PROBLEMS: %d" % len(bad))
    for b in bad:
        print("   " + b)
sys.exit(1 if bad else 0)

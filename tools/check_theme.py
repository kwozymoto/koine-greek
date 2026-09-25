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
    # Every block of each kind, merged in order -- a second block appended
    # later wins in the browser, so it has to win here too.
    ms = re.findall(r'@media\s*\(prefers-color-scheme:\s*light\)\s*\{\s*'
                    r':root:not\(\[data-theme="dark"\]\)\s*\{([^}]*)\}\s*\}', css)
    As = re.findall(r':root\[data-theme="light"\]\s*\{([^}]*)\}', css)
    lm, la = ({}, {}) if ms or As else (None, None)
    for b in ms:
        lm.update(decls(b))
    for b in As:
        la.update(decls(b))
    return dark, (lm if ms else None), (la if As else None)


def strays(path, css):
    """Theme selectors anywhere but the two blessed places. A rule such as
    [data-theme=light] .x{} is a colour change nobody compares."""
    css = nocomments(css)
    known = len(re.findall(r'@media\s*\(prefers-color-scheme:\s*light\)\s*\{\s*'
                           r':root:not\(\[data-theme="dark"\]\)', css))
    if len(re.findall(r"prefers-color-scheme", css)) != known:
        bad.append("%s: prefers-color-scheme used outside the light token block" % path)
    if len(re.findall(r"data-theme", css)) != known + len(re.findall(r':root\[data-theme="light"\]\s*\{', css)):
        bad.append("%s: data-theme used outside the token blocks -- theme only through tokens" % path)


def lum(hexv):
    h = hexv.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    rgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in rgb]
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]


def blend(fg, bg, alpha):
    """The colour fg at the given opacity composites to over bg."""
    def rgb(h):
        h = h.lstrip("#")
        return [int(h[i:i + 2], 16) for i in (0, 2, 4)]
    return "#" + "".join("%02x" % round(alpha * f + (1 - alpha) * g)
                         for f, g in zip(rgb(fg), rgb(bg)))


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
    # Text drawn at reduced opacity, measured as the colour it blends to.
    # Read dims words you do not know yet on purpose, so --k0 has a lower
    # floor than text: dimmed, but never unreadable (the rule in app.css).
    for fg, op, bg, need in (("--text", "--k0", "--bg", 3.0), ("--text", "--k1", "--bg", TEXT),
                             ("--text", "--k2", "--bg", TEXT), ("--gold", "--dim-gold", "--bg", TEXT)):
        # (--dim-gold is the verse numbers, which sit on the page itself)
        a, alpha, b = theme.get(fg), theme.get(op), theme.get(bg)
        try:
            alpha = float(alpha)
        except (TypeError, ValueError):
            bad.append("%s theme: %s is not an opacity (%s)" % (name, op, alpha))
            continue
        c = contrast(blend(a, b, alpha), b)
        if c < need:
            bad.append("%s theme: %s at %s (%.2f) on %s is %.2f:1, needs %.1f"
                       % (name, fg, op, alpha, bg, c, need))
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
LIT = re.compile(r"#[0-9a-fA-F]{3,8}\b|\b(?:rgb|hsl)a?\([^)]*\)")
NAMED = re.compile(r"(?<![\w-])(white|black|red|green|blue|gray|grey|silver|yellow|orange|purple|navy|maroon)(?![\w-])")


def allowed(lit):
    key = lit.replace(" ", "").lower()
    if key.startswith("#"):
        return key in ALLOWED                      # exact: #000814 is not #000
    return any(key.startswith(k) for k in ALLOWED if k.startswith("rgba("))


def css_literals(path, css):
    body = nocomments(css)
    body = re.sub(r"@media\s*\(prefers-color-scheme:\s*light\)\s*\{\s*:root[^{]*\{[^}]*\}\s*\}", "", body)
    body = re.sub(r":root(?::not\(\[data-theme=\"dark\"\]\)|\[data-theme=\"light\"\])?\s*\{[^}]*\}", "", body)
    for lit in LIT.findall(body):
        if not allowed(lit):
            bad.append("%s: colour literal %s outside the tokens -- make it a token" % (path, lit))
    # named colours, looked for only inside declarations so that a selector
    # like [data-tone="green"] or a property like white-space is not one
    for decl in re.findall(r"\{([^{}]*)\}", body):
        for n in NAMED.findall(re.sub(r'"[^"]*"', "", decl)):
            bad.append("%s: named colour %r outside the tokens" % (path, n))


css_literals("css/app.css", app_css)
strays("css/app.css", app_css)

# JavaScript and the app page carry no colours of their own.
JS_ALLOWED = {("js/write.js", "#fff"): "an offscreen mask the scorer reads by alpha, never shown",
              ("js/app.js", "#141b2b"): "THEME_BG, checked against --bg below",
              ("js/app.js", "#f3f5f9"): "THEME_BG, checked against --bg below"}
JS_LIT = re.compile(r"(?<=[\s\"'`:(,])#[0-9a-fA-F]{3,8}\b|\b(?:rgb|hsl)a?\(")
JS_NAMED = re.compile(r"(?:color|background|border|fill|stroke|shadow|outline)[\w-]*\s*:\s*[^;\"'`\n]*?"
                      r"(?<![\w-])(white|black)(?![\w-])")
for f in sorted(x.replace(chr(92), "/") for x in glob.glob("js/*.js")):
    src = re.sub(r"/\*.*?\*/", "", read(f), flags=re.S)
    src = re.sub(r"(?m)^\s*//.*$", "", src)
    for lit in JS_LIT.findall(src) + JS_NAMED.findall(src):
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
        # rindex: the script must follow BOTH metas, or the second is left
        # at its default when a theme is chosen
        if txt.index(sc.group(0)) < txt.rindex('<meta name="theme-color"'):
            bad.append("%s: the head script runs before the metas it sets" % path)
        if '<meta name="apple-mobile-web-app-status-bar-style"' in txt:
            if txt.index(sc.group(0)) < txt.index('<meta name="apple-mobile-web-app-status-bar-style"'):
                bad.append("%s: the head script runs before the status-bar meta it sets" % path)
            if 'apple-mobile-web-app-status-bar-style' not in sc.group(0) or '"default"' not in sc.group(0):
                bad.append("%s: the head script does not switch the iPhone status bar to dark "
                           "icons in light -- black-translucent draws white ones" % path)


idx = read("index.html")
head_ok("index.html", idx)
rest = re.sub(r"<meta name=\"theme-color\"[^>]*>|<script>[^<]*koine\.theme.*?</script>", "", idx, flags=re.S)
for lit in JS_LIT.findall(rest):
    bad.append("index.html: colour literal %s -- use a token" % lit)
if "js/app.js" not in [f for f, _ in JS_ALLOWED] or 'bar.content=light?"default":"black-translucent"' not in read("js/app.js"):
    bad.append("js/app.js: applyTheme does not set the iPhone status bar for the theme chosen")

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
    css_literals(p, style)
    strays(p, style)
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

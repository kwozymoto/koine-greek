# -*- coding: utf-8 -*-
"""Every drill has an icon, every icon is drawn, every group has a tone.

    python tools/check_icons.py

js/icons.js gives each drill an icon standing for the KIND of work it is — an
ear for the listening drills, a nib for the handwriting ones. drillIcon falls
back to `choose` for a title it does not know, which is deliberate so a new
drill is never iconless, and is exactly the kind of silent default that would
otherwise mean half the screen quietly said "multiple choice" and nobody
noticed.

So: every title in DRILLS must be in DRILL_KIND on purpose, every kind named
there must actually be drawn, every group in DRILL_GROUP must have a tone, and
no icon may be empty. None of that can be seen by looking at the screen, which
is why it is here rather than left to a glance.
"""
import io, json, os, re, subprocess, sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

icons = io.open(os.path.join(ROOT, "js", "icons.js"), encoding="utf-8").read()
app = io.open(os.path.join(ROOT, "js", "app.js"), encoding="utf-8").read()
bad = []


def block(src, name, close):
    m = re.search(r"const %s\s*=\s*\{(.*?)\n%s" % (name, close), src, re.S)
    if not m:
        sys.exit("could not find %s in js/icons.js" % name)
    return m.group(1)


KINDS = set(re.findall(r"^\s*(\w+):\s*'", block(icons, "ICON_KIND", r"\};"), re.M))
DRAWN = {k: v for k, v in re.findall(r"^\s*(\w+):\s*'(.*?)',\s*$",
                                     block(icons, "ICON_KIND", r"\};"), re.M)}
KIND_OF = dict(re.findall(r'"([^"]+)":\s*"(\w+)"',
                          block(icons, "DRILL_KIND", r"\};")))
TONE_OF = dict(re.findall(r'"([^"]+)":\s*"(\w+)"',
                          block(icons, "GROUP_TONE", r"\};")))
print("icons drawn: %d   drills mapped: %d   groups toned: %d"
      % (len(KINDS), len(KIND_OF), len(TONE_OF)))

# the app's own lists
titles = re.findall(r'^\["([^"]+)","', app[app.index("const DRILLS=["):], re.M)
groups = re.findall(r'^\s*"([^"]+)":\s*\[',
                    app[app.index("DRILL_GROUP={"):app.index("};", app.index("DRILL_GROUP={"))],
                    re.M)
print("drills in the app: %d   groups: %d" % (len(titles), len(groups)))

for t in titles:
    if t not in KIND_OF:
        bad.append("the drill %r has no kind, so it falls back to a generic "
                   "icon nobody chose" % t)
    elif KIND_OF[t] not in KINDS:
        bad.append("the drill %r wants the icon %r, which is not drawn"
                   % (t, KIND_OF[t]))
for t in KIND_OF:
    if t not in titles:
        bad.append("a kind is set for %r, which is not a drill any more" % t)
for g in groups:
    if g not in TONE_OF:
        bad.append("the group %r has no tone, so its cards are grey" % g)
for k, drawing in DRAWN.items():
    if not re.search(r"<(path|circle|rect|text|line|polygon)", drawing):
        bad.append("the icon %r draws nothing" % k)

# every kind that is drawn should be reachable, or it is dead weight in a file
# that ships to a phone
unused = KINDS - set(KIND_OF.values())
for k in sorted(unused):
    bad.append("the icon %r is drawn and no drill uses it" % k)

# --------------------------------------------------- state and order ------
# Every drill either reports what it is worth today or is declared as one
# whose content does not change. Neither by accident: a new drill with no
# badge should be a decision, not an omission.
STATE = set(re.findall(r'^\s*"([^"]+)":\s*\(\) =>',
                       block(icons, "DRILL_STATE", r"\};"), re.M))
m = re.search(r"const DRILL_STATIC = \[(.*?)\];", icons, re.S)
STATIC = set(re.findall(r'"([^"]+)"', m.group(1))) if m else set()
print("drills reporting a count: %d   declared unchanging: %d"
      % (len(STATE), len(STATIC)))

for t in titles:
    if t not in STATE and t not in STATIC:
        bad.append("the drill %r neither reports what it is worth nor is "
                   "declared unchanging" % t)
    if t in STATE and t in STATIC:
        bad.append("the drill %r is in both DRILL_STATE and DRILL_STATIC" % t)
for t in (STATE | STATIC) - set(titles):
    bad.append("%r has a state or is declared static, and is not a drill" % t)

# the page is drawn in DRILL_ORDER, so a group missing from it disappears
m = re.search(r"const DRILL_ORDER=\[(.*?)\];", app, re.S)
ORDER = re.findall(r'"([^"]+)"', m.group(1)) if m else []
for g in groups:
    if g not in ORDER:
        bad.append("the group %r is not in DRILL_ORDER, so it is not drawn" % g)
for g in ORDER:
    if g not in groups:
        bad.append("DRILL_ORDER names %r, which is not a group" % g)
print("groups in the drawing order: %d of %d" % (len(ORDER), len(groups)))

# ------------------------------------------- manifest shortcuts ----------
# A long-press shortcut opens ./?go=<screen>. The screen names are the nav's
# own data-go attributes, and js/app.js reads them off the buttons rather than
# repeating them — but the manifest is a third file that cannot, so this is
# where the three are made to agree. A shortcut naming a screen that does not
# exist opens the app and silently does nothing, and no one long-presses their
# own app icon often enough to notice.
mf = json.load(io.open(os.path.join(ROOT, "manifest.webmanifest"),
                       encoding="utf-8"))
html = io.open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
SCREENS = set(re.findall(r'data-go="([a-z]+)"', html)) | {"help"}
SHORTCUTS = mf.get("shortcuts", [])
print("nav screens: %d   manifest shortcuts: %d"
      % (len(SCREENS), len(SHORTCUTS)))

for s in SHORTCUTS:
    url = s.get("url", "")
    m = re.search(r"[?&]go=([a-z]+)", url)
    if not m:
        bad.append("the shortcut %r has no ?go= target, so it just opens the "
                   "app" % s.get("name"))
    elif m.group(1) not in SCREENS:
        bad.append("the shortcut %r opens ?go=%s, which is not a screen; the "
                   "nav has %s" % (s.get("name"), m.group(1),
                                   ", ".join(sorted(SCREENS))))
    for ic in s.get("icons", []):
        p = os.path.join(ROOT, ic.get("src", ""))
        if not os.path.isfile(p):
            bad.append("the shortcut %r names the icon %r, which is not in "
                       "the repo" % (s.get("name"), ic.get("src")))

# and the app has to actually honour ?go=, or the shortcuts are decorative
app_src = io.open(os.path.join(ROOT, "js", "app.js"), encoding="utf-8").read()
if SHORTCUTS and 'get("go")' not in app_src:
    bad.append("the manifest declares shortcuts but js/app.js never reads a "
               "go parameter, so every one of them opens Today")

print("\nfaults: %d" % len(bad))
for b in bad:
    print("   " + b)
sys.exit(1 if bad else 0)

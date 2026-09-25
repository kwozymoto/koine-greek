# -*- coding: utf-8 -*-
"""Element ids in index.html are unique, and no script renders one it has.

    python tools/check_ids.py

getElementById returns the first element with an id and says nothing about
the second. v249 added the Quick test dialog as id="testScrim", which the
Android tester invitation in js/pwa.js already used, and put it first in the
page -- so the invitation opened an empty Quick test sheet and its own form
could never be reached. Nothing failed and nothing logged.

Two checks: an id written twice in index.html, and an id="…" a script writes
into a template that index.html already has (the page would then hold two).

And the same fault one level up: every js/*.js is a classic script sharing
one global scope, so two top-level functions of the same name do not clash
-- the later silently replaces the earlier, in whichever file loads last.
The light theme's colour helper was first called wInk, which js/write.js
already had further down; the writing drills crashed on open.
"""
import collections
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

page = io.open("index.html", encoding="utf-8").read()
ids = re.findall(r'\bid="([A-Za-z][\w-]*)"', page)
bad = ["index.html has id=%r %d times" % (k, n)
       for k, n in collections.Counter(ids).items() if n > 1]
static = set(ids)
for f in sorted(glob.glob("js/*.js")):
    src = io.open(f, encoding="utf-8").read()
    for k in sorted(set(re.findall(r'\bid="([A-Za-z][\w-]*)"', src)) & static):
        bad.append("%s renders id=%r, which index.html already has" % (f, k))

id_bad = len(bad)
# Every top-level name, of any kind, in every script the page loads --
# data/ as well as js/, since both share the one global scope. A `var X` in
# one file and a `function X` in another replace each other just as two
# functions do. (A duplicated let/const/class throws at load instead, which
# is louder, but it is the same mistake and is cheaper caught here.)
where = collections.defaultdict(list)
files = sorted(x.replace(chr(92), "/") for x in glob.glob("js/*.js") + glob.glob("data/*.js"))
for f in files:
    src = re.sub(r"/\*.*?\*/", "", io.open(f, encoding="utf-8").read(), flags=re.S)
    for name in re.findall(r"^(?:async\s+function|function|var|let|const|class)\s+([A-Za-z_$][\w$]*)",
                           src, re.M):
        where[name].append(f)
for name, fs in sorted(where.items()):
    if len(fs) > 1:
        bad.append("%s is declared %d times at top level (%s) -- one replaces the other"
                   % (name, len(fs), ", ".join(fs)))

print("top-level names across js/ and data/: %d, each declared once%s"
      % (len(where), "" if not any(len(v) > 1 for v in where.values()) else " — NOT"))
print("ids in index.html: %d, all distinct%s" % (len(static), "" if not id_bad else " — NOT"))
for b in bad:
    print("   " + b)
sys.exit(1 if bad else 0)

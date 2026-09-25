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

print("ids in index.html: %d, all distinct%s" % (len(static), "" if not bad else " — NOT"))
for b in bad:
    print("   " + b)
sys.exit(1 if bad else 0)

# -*- coding: utf-8 -*-
"""The update log in Settings, against the release history.

    python tools/check_changes.py

data/changes.js tells learners what changed and when. A date written from
memory is exactly the kind of thing CLAUDE.md rule 1 is about, so each
entry names the release that ends its day's work (`v`) and this confirms,
from git, that the release exists and its commit is dated `d`.

The one exception is the release being prepared: it is not in git until the
commit that ships it, so an entry may name sw.js's VERSION if it is dated
today.

Also: newest first with one entry per day, every kind known, every item a
plain sentence (the page escapes it, but a tag in the data is a mistake),
and no entry for a day in the future.
"""
import datetime
import io
import json
import os
import re
import subprocess
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
KINDS = {"new", "better", "fix", "audio", "words"}

js = ("const fs=require('fs'),vm=require('vm');const c=vm.createContext({});"
      "vm.runInContext(fs.readFileSync('data/changes.js','utf8').replace(/\\bconst\\b/g,'var'),c);"
      "process.stdout.write(JSON.stringify(vm.runInContext('CHANGES',c)));")
r = subprocess.run(["node", "-e", js], capture_output=True, text=True, encoding="utf-8")
if r.returncode or not r.stdout:
    sys.exit("could not read data/changes.js:\n" + (r.stderr or ""))
LOG = json.loads(r.stdout)

g = subprocess.run(["git", "log", "--format=%ad\t%s", "--date=short"],
                   capture_output=True, text=True, encoding="utf-8")
if g.returncode or not g.stdout:
    # No history, no check -- and no pretending: this fails rather than passes.
    sys.exit("check_changes needs git history to confirm the log's dates:\n" + (g.stderr or ""))
DATED = {}
for line in g.stdout.splitlines():
    d, _, subj = line.partition("\t")
    m = re.match(r"(v\d+)\s", subj)
    if m:
        DATED.setdefault(m.group(1), d)       # newest first: the release itself

sw = io.open("sw.js", encoding="utf-8").read()
m = re.search(r"const VERSION = '(v\d+)'", sw)
CURRENT = m.group(1) if m else None
TODAY = datetime.date.today().isoformat()

bad, items = [], 0
prev = None
for n, e in enumerate(LOG):
    d, v = e.get("d", ""), e.get("v", "")
    where = "entry %d (%s)" % (n + 1, d)
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", d):
        bad.append("%s: date %r is not YYYY-MM-DD" % (where, d))
        continue
    if d > TODAY:
        bad.append("%s: dated in the future" % where)
    if prev is not None and d >= prev:
        bad.append("%s: not newest first, or a second entry for one day" % where)
    prev = d
    if v in DATED:
        if DATED[v] != d:
            bad.append("%s: names %s, which git dates %s" % (where, v, DATED[v]))
    elif v == CURRENT and d == TODAY:
        pass                                   # the release this commit ships
    else:
        bad.append("%s: names %s, which is not a release in git "
                   "(nor the %s being prepared today)" % (where, v, CURRENT))
    if not e.get("items"):
        bad.append("%s: no items" % where)
    for it in e.get("items", []):
        items += 1
        if it.get("k") not in KINDS:
            bad.append("%s: unknown kind %r" % (where, it.get("k")))
        t = it.get("t", "")
        if not t.strip():
            bad.append("%s: an empty item" % where)
        if re.search(r"[<>]", t):
            bad.append("%s: markup in %r -- plain text only" % (where, t[:40]))
        if len(t) > 260:
            bad.append("%s: an item of %d characters -- say it shorter" % (where, len(t)))

print("update log: %d days, %d items, each dated by its release in git" % (len(LOG), items))
if bad:
    print("")
    print("LOG PROBLEMS: %d" % len(bad))
    for b in bad:
        print("   " + b)
sys.exit(1 if bad else 0)

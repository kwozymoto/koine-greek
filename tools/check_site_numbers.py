# -*- coding: utf-8 -*-
"""The numbers the public pages state, against the data they describe.

    python tools/check_site_numbers.py

about.html, index.html (its description and JSON-LD), llms.txt and the README
each say how big the app is: so many words, chapters, tables, real forms.
Those figures are written by hand, and nothing held them to anything, so
they drifted: on 2026-09-25 four files said "818 words" while the app's own
Progress screen said 817 (index 237 is retired, CLAUDE.md rule 3), and two
said "28 reference tables" when there were 30. This reads each figure where
it is stated and fails when it disagrees with the count from data/.

A new claim in a new phrasing is not caught until a pattern for it is added
here -- so when a page gains a figure, add its pattern in the same commit.
"""
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

JS = ("const fs=require('fs'),vm=require('vm');const c=vm.createContext({});"
      "for(const f of ['data/vocab.js','data/lessons.js','data/paradigms.js',"
      "'data/forms.js','data/clauses.js','data/readings.js'])"
      "vm.runInContext(fs.readFileSync(f,'utf8').replace(/\\bconst\\b/g,'var'),c);"
      "process.stdout.write(JSON.stringify(vm.runInContext("
      "'({vocab:VOCAB.length,lessons:LESSONS.length,tables:PARADIGMS.length,"
      "forms:FORMS.length,clauses:CLAUSES.length,readings:READINGS.length})',c)));")
r = subprocess.run(["node", "-e", JS], capture_output=True, text=True, encoding="utf-8")
if r.returncode or not r.stdout:
    sys.exit("could not read the data files:\n" + (r.stderr or ""))
D = json.loads(r.stdout)

# The retired rows stay in data/vocab.js so later indices keep their meaning;
# they are never taught, so they are not counted as words. js/app.js is the
# one place that says which.
m = re.search(r"const RETIRED=new Set\(\[([\d,\s]*)\]\)",
              io.open("js/app.js", encoding="utf-8").read())
if not m:
    sys.exit("RETIRED not found in js/app.js")
retired = [x for x in m.group(1).split(",") if x.strip()]
g = re.search(r"^PLAYABLE = \{(.*?)^\}", io.open("tools/check_grids.py", encoding="utf-8").read(),
              re.S | re.M)
if not g:
    sys.exit("PLAYABLE not found in tools/check_grids.py")

WANT = {
    "words": D["vocab"] - len(retired),
    "chapters": D["lessons"],
    "tables": D["tables"],
    "playable": len(re.findall(r'"([^"]+)"', g.group(1))),
    "forms": D["forms"],
    "clauses": D["clauses"],
    "readings": D["readings"],
}

# about.html wraps its figures in <span class="num">, and a sentence may
# break across lines, so the number may be marked up and the gap is any space.
N = r'(?:<span class="num">)?(\d[\d,]*)(?:</span>)?'
PATTERNS = [
    ("words", N + r"-word\s+vocabulary"),
    ("words", N + r"\s+vocabulary\s+words"),
    ("words", N + r"\s+words(?:\s+with\s+audio|,\s+with\s+audio)"),
    ("words", N + r"-word\s+deck"),
    ("chapters", N + r"\s+chapters"),
    ("tables", N + r"\s+reference\s+tables"),
    ("playable", N + r"\s+of\s+them\s+(?:as|playable)"),
    ("forms", N + r"\s+real\s+forms"),
    ("clauses", N + r"\s+sentence\s+questions"),
    ("readings", N + r"\s+graded\s+(?:reading\s+)?passages"),
]
FILES = ["about.html", "index.html", "llms.txt", "README.md"]

bad, seen = [], 0
for f in FILES:
    txt = io.open(f, encoding="utf-8").read()
    for key, pat in PATTERNS:
        for hit in re.finditer(pat, txt):
            seen += 1
            n = int(hit.group(1).replace(",", ""))
            if n != WANT[key]:
                line = txt.count("\n", 0, hit.start()) + 1
                bad.append("%s:%d  says %d %s, the data has %d  (%r)"
                           % (f, line, n, key, WANT[key], hit.group(0)))

print("figures checked: %d in %s" % (seen, ", ".join(FILES)))
print("the data: " + ", ".join("%s %d" % kv for kv in WANT.items()))
if bad:
    print("")
    print("FIGURES THAT DISAGREE WITH THE DATA: %d" % len(bad))
    for b in bad:
        print("   " + b)
sys.exit(1 if bad else 0)

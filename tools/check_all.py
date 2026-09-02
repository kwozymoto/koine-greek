# -*- coding: utf-8 -*-
"""Run every content checker and report once.

    python tools/check_all.py

The app teaches, so the thing that matters about it is whether what it says
is true. Five checkers put different parts of it to the SBLGNT bundled in
data/gnt/, and this runs the lot:

    check_vocab      the 511 lexical entries, their example verses, the
                     reader's gloss table, the audio chain, the principal
                     parts, and accent placement across every data file
    check_drills     the hand-written drill arrays in js/app.js — the
                     article, verb parsing, the parsing builder, principal
                     parts — form against label
    check_paradigms  the 24 reference tables, cell by cell, by parse code
    check_readings   the 12 passages, word for word, and every parse claim
                     in their glosses
    check_lessons    the spelling of every Greek form in the lesson bodies
                     and quizzes

Exits non-zero if any of them does. What none of them can check is English:
whether a gloss is the right translation, whether a grammatical explanation
is correct. That needs a reader.
"""
import os, subprocess, sys

# The child checkers print Greek. This process must be able to relay it, and
# on Windows its own stdout defaults to the ANSI codepage, which cannot.
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHECKS = ["check_vocab", "check_drills", "check_paradigms", "check_readings",
          "check_lessons"]

env = dict(os.environ, PYTHONIOENCODING="utf-8")
results, failed = [], []
for name in CHECKS:
    out = subprocess.run([sys.executable, os.path.join("tools", name + ".py")],
                         cwd=ROOT, capture_output=True, text=True,
                         encoding="utf-8", errors="replace", env=env)
    head = (out.stdout or "").strip().split("\n")
    summary = next((l for l in head if l.strip()), "")
    results.append((name, out.returncode, summary))
    if out.returncode:
        failed.append((name, out.stdout, out.stderr))

width = max(len(n) for n in CHECKS)
for name, code, summary in results:
    print("%-*s  %-6s %s" % (width, name, "ok" if not code else "FAILED", summary))

if failed:
    print()
    for name, so, se in failed:
        print("=" * 70)
        print(name)
        print("=" * 70)
        print(so or "")
        if se.strip():
            print(se)
sys.exit(1 if failed else 0)

# -*- coding: utf-8 -*-
"""Every claim in the lesson prose that a machine could settle, and whether
anyone has settled it.

    python tools/check_prose.py            # the register, and what is new
    python tools/check_prose.py --list     # every unreviewed claim
    python tools/check_prose.py --seed     # add new claims to the register

WHY THIS EXISTS. Chapter 1 taught for months that "λόγος has both" sigmas.
It has one. Fraser found it by reading his phone, and asked the fair
question: could I not go page by page and check the text is factual?

I could, and I am. But reading is the weaker of the two tools for a claim
like that one, because "does this word contain σ" has an ANSWER. CLAUDE.md's
own table puts spelling and counts in the row marked "automate all of it;
assume none of it", and that claim had been neither automated nor assumed --
it had simply never been looked at.

So this extracts every sentence in the twenty-seven chapters that makes a
claim of a settleable kind -- an absolute (always, never, only, every), a
count (five times, seventeen forms), or a spelling (has both, ends in) --
and holds each one to a register. Registered claims carry a verdict and the
evidence for it. Anything in the prose that is NOT in the register fails,
which is the same trick as UNATTESTED in check_lessons and REVIEWED in
check_coverage: a report that cannot fail is not a checker.

WHAT IT CANNOT DO. It cannot tell whether a claim is well taught, or whether
a grammatical explanation is right. Those need a reader and sometimes a
second one; CLAUDE.md's third row. What it can do is stop a claim being
edited into the prose without anyone deciding whether it is true.

Rewriting a sentence changes its hash and returns it to unreviewed, which is
deliberate: a changed claim is an unverified claim.
"""
import hashlib
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
REG = os.path.join("docs", "prose-claims.json")

# The teens were missing from the number list until 2026-09-10, so
# "Fourteen letters open by naming their writer ... and not one of the
# fourteen uses an article" -- a claim about the New Testament, precise and
# checkable -- was never registered and so never checked. Nor was any claim
# whose absolute was phrased "not one" rather than "none". A pattern list is
# itself a claim about what it catches; widen it when it is caught short.
_NUM = (r"\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|"
        r"thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|"
        r"twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|"
        r"twenty-\w+|thirty-\w+|hundred|thousand")
_THING = (r"times|forms|letters|words|endings|verbs|nouns|occurrences|"
          r"of them|chapters|places|examples|of these|of those|"
          r"perfects|pluperfects|aorists|imperfects|presents|futures|"
          r"participles|infinitives|subjunctives|imperatives|optatives|"
          r"indicatives|adjectives|pronouns|prepositions|declensions|"
          r"conjugations|syllables|vowels|consonants|accents|cases|moods|"
          r"tenses|voices|middles|passives|actives|articles|clauses|verses")

PATTERNS = [
    ("absolute", re.compile(r"\b(always|never|only|every|no other|nothing else|"
                            r"all of them|none of|cannot|must always|not one|"
                            r"not a single|in every case|without exception)\b", re.I)),
    ("count",    re.compile(r"\b(" + _NUM + r")\b\s+"
                            r"(?:\w+\s+){0,3}(?:" + _THING + r")", re.I)),
    ("spelling", re.compile(r"\b(has both|ends in|ends with|begins with|"
                            r"starts with|is written|is spelled|contains)\b", re.I)),
]


def load_lessons():
    js = ("const fs=require('fs'),vm=require('vm');const c=vm.createContext({});"
          "vm.runInContext(fs.readFileSync('data/lessons.js','utf8'),c);"
          "process.stdout.write(vm.runInContext('JSON.stringify(LESSONS)',c));")
    r = subprocess.run(["node", "-e", js], capture_output=True, text=True,
                       encoding="utf-8")
    if r.returncode or not r.stdout:
        sys.exit("could not read data/lessons.js:\n" + (r.stderr or ""))
    return json.loads(r.stdout)


def sentences(text):
    t = re.sub(r"<[^>]+>", " ", text or "")
    t = re.sub(r"\s+", " ", t)
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+", t) if s.strip()]


def key(s):
    """Hash the sentence, so rewriting it returns it to unreviewed. The
       normalisation is deliberately light -- a changed number is a changed
       claim and must come back."""
    return hashlib.sha1(re.sub(r"\s+", " ", s).strip().encode("utf-8")).hexdigest()[:12]


def extract():
    out = []
    for L in load_lessons():
        body = L.get("body") or ""
        for q in (L.get("quiz") or []):
            body += " " + str(q.get("w", ""))
        for s in sentences(body):
            for kind, pat in PATTERNS:
                if pat.search(s):
                    out.append({"k": key(s), "ch": L["id"], "kind": kind, "text": s})
                    break
    return out


def read_register():
    if not os.path.isfile(REG):
        return {}
    return {r["k"]: r for r in json.load(io.open(REG, encoding="utf-8"))}


if __name__ == "__main__":
    claims = extract()
    reg = read_register()

    if "--seed" in sys.argv:
        for c in claims:
            if c["k"] not in reg:
                reg[c["k"]] = {"k": c["k"], "ch": c["ch"], "kind": c["kind"],
                               "text": c["text"], "status": "unreviewed",
                               "finding": ""}
        # A sentence that has been rewritten or deleted is no longer a claim
        # in the prose, so it leaves the register. Git keeps the history; the
        # register is about what the app says now. Without this, a reworded
        # sentence sits beside its replacement and every later lookup by text
        # matches two rows.
        live = {c["k"] for c in claims}
        dropped = [k for k in reg if k not in live]
        for k in dropped:
            del reg[k]
        if dropped:
            print("dropped %d orphaned claim(s) whose sentence has changed"
                  % len(dropped))
        rows = sorted(reg.values(), key=lambda r: (r["ch"], r["k"]))
        io.open(REG, "w", encoding="utf-8", newline="\n").write(
            json.dumps(rows, ensure_ascii=False, indent=1) + "\n")
        print("register seeded: %d claims" % len(rows))
        sys.exit(0)

    unregistered = [c for c in claims if c["k"] not in reg]
    by_status = {}
    for c in claims:
        st = reg.get(c["k"], {}).get("status", "UNREGISTERED")
        by_status[st] = by_status.get(st, 0) + 1

    print("claims in the lesson prose a machine could settle: %d" % len(claims))
    for st in sorted(by_status):
        print("   %-14s %d" % (st, by_status[st]))
    stale = [k for k in reg if k not in {c["k"] for c in claims}]
    if stale:
        print("   %-14s %d  (the sentence has changed or gone)"
              % ("orphaned", len(stale)))

    if "--list" in sys.argv:
        print()
        for c in claims:
            r = reg.get(c["k"], {})
            if r.get("status", "UNREGISTERED") in ("unreviewed", "UNREGISTERED"):
                print("   ch%-2d [%s] %s" % (c["ch"], c["kind"], c["text"][:110]))

    print()
    if unregistered:
        print("CLAIMS IN THE PROSE THAT NOBODY HAS DECIDED ABOUT: %d"
              % len(unregistered))
        for c in unregistered[:12]:
            print("   ch%-2d %s" % (c["ch"], c["text"][:104]))
        if len(unregistered) > 12:
            print("   ... and %d more" % (len(unregistered) - 12))
        print("\n   Run --seed to add them, then work through them.")
        sys.exit(1)
    print("every claim is in the register: %d" % len(claims))

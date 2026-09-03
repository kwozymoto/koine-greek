# -*- coding: utf-8 -*-
"""Check the Greek in data/lessons.js against the SBLGNT in data/gnt/.

    python tools/check_lessons.py

The lesson bodies are prose, so there is no grid to parse and no parse code
to check against. What can be checked is spelling: a form that occurs
nowhere in the New Testament is either a paradigm the app made up on purpose
or a typo, and the difference is usually obvious once the noise is stripped
out.

Three kinds of legitimate non-occurrence are filtered, because reporting
them buries everything else:

  * endings and single letters quoted as such — "-ος", "-ῃ", "α → η"
  * λύω and its family: an invented verb, so nothing it does is attested
  * lexical citation forms. A dictionary cites a verb in the first person
    singular whether or not anyone wrote it that way, so a form that is a
    headword in data/vocab.js is exempt.

What is left is short enough to read, and every entry deserves a look.
Finding nothing does not mean the prose is right — this cannot check a claim
about grammar, only the spelling of the Greek that carries it.
"""
import json, io, os, re, sys, unicodedata, collections, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GNT = os.path.join(ROOT, "data", "gnt")
GK = "Ͱ-Ͽἀ-῿"
bare = lambda s: re.sub("[^" + GK + "]", "", s)

def norm(x):
    d = unicodedata.normalize("NFD", x).replace("̀", "́")
    return unicodedata.normalize("NFC", d).lower()

man = json.load(io.open(os.path.join(GNT, "manifest.json"), encoding="utf-8"))
FORMS = set()
for b in man["books"]:
    d = json.load(io.open(os.path.join(GNT, b["a"] + ".json"), encoding="utf-8"))
    for ch in d["c"]:
        for vs in ch:
            for w in vs[1]:
                FORMS.add(norm(bare(w[0])))

js = ("const fs=require('fs'),vm=require('vm');const c=vm.createContext({});"
      "for(const f of ['data/vocab.js','data/lessons.js'])"
      "vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});"
      "process.stdout.write(vm.runInContext('JSON.stringify({LESSONS,VOCAB})',c));")
out = subprocess.run(["node", "-e", js], cwd=ROOT, capture_output=True, text=True,
                     encoding="utf-8")
if out.returncode:
    sys.exit("could not load the app data:\n" + out.stderr)
data = json.loads(out.stdout)
LESSONS, VOCAB = data["LESSONS"], data["VOCAB"]

HEADWORDS = {norm(bare(v[0].split(",")[0])) for v in VOCAB}
# Compared without accents: λέλυκα and λελυκώς are the same verb, and a
# pattern written with accents on it silently misses half the paradigm.
def flat(x):
    return "".join(c for c in unicodedata.normalize("NFD", x)
                   if not unicodedata.combining(c)).lower()
LUO = re.compile(r"^(λυ|ελυ|λελυ|ελελυ)")

flagged, total, attested, skipped = collections.defaultdict(set), 0, 0, collections.Counter()
for l in LESSONS:
    chunks = [l["body"]] + [q["q"] + " " + q["w"] + " " + " ".join(q["o"]) for q in l["quiz"]]
    for src in chunks:
        for m in re.finditer(r'<(?:span class="gk"|td class="g")>(.*?)</(?:span|td)>', src, re.S):
            txt = re.sub("<.*?>", "", m.group(1)).replace("(ν)", "ν")
            # split on everything except the hyphen, so that "-ος" can still
            # be recognised as an ending rather than a word
            for tok in re.split(r"[\s,·/()…—]+", txt):
                tok = tok.strip()
                is_ending = tok.startswith("-") or tok.startswith("‑")
                g = bare(tok)
                if not g:
                    continue
                total += 1
                if norm(g) in FORMS:
                    attested += 1
                elif is_ending or len(g) < 3:
                    skipped["endings and single letters"] += 1
                elif LUO.match(flat(g)):
                    skipped["λύω, an invented verb"] += 1
                elif norm(g) in HEADWORDS:
                    skipped["lexical citation forms"] += 1
                else:
                    flagged[l["id"]].add(g)

print("Greek forms in the lesson bodies and quizzes: %d" % total)
print("attested in the SBLGNT: %d (%.0f%%)" % (attested, 100 * attested / total))
for k, n in skipped.most_common():
    print("not attested, filtered — %-28s %d" % (k + ":", n))
n = sum(len(v) for v in flagged.values())
print("\nnot attested and not filtered: %d" % n)
for cid in sorted(flagged):
    print("  ch%-3d %s" % (cid, " ".join(sorted(flagged[cid]))))

# ------------------------------------------------- questions in their place --
# Working through a chapter interleaves its own questions with its own
# sections: q.sec names the part a question is asked after. Getting that
# wrong is not cosmetic — it asks about material the reader has not been
# shown yet, which is the one thing the stepped mode exists to avoid.
#
# Two things are checkable without judging the grammar. The index has to be
# a real part. And no question may quote a form that this chapter introduces
# *after* it — if a question turns on ἀγαπῶμεν and section 1 is where the
# hortatory subjunctive is shown, asking it after section 0 is asking about
# something not yet said. That is the direction that actually hurts.
#
# Only forms the chapter itself teaches count. A question about διά quoting
# τοῦτο, or the Lord's Prayer's ὀφειλήματα, is leaning on ordinary vocabulary
# rather than on the section — flagging those buries the real thing. So the
# test is: does this form appear somewhere in the chapter, but not yet?
# Forms the whole course carries — λύω's paradigm, and any word in the deck —
# are exempt for the same reason.
sec_bad, sec_early, filed, unfiled = [], [], 0, 0
for l in LESSONS:
    parts = [p for p in re.split(r"(?=<h3>)", l["body"]) if p.strip()]
    seen = []                       # Greek forms available by the end of part k
    running = set()
    for p in parts:
        for m in re.finditer(r'<(?:span class="gk"|td class="g")>(.*?)</(?:span|td)>', p, re.S):
            txt = re.sub("<.*?>", "", m.group(1)).replace("(ν)", "ν")
            for tok in re.split(r"[\s,·/()…—]+", txt):
                g = bare(tok.strip())
                if g:
                    running.add(norm(g))
        seen.append(set(running))
    for n_, q in enumerate(l["quiz"]):
        sec = q.get("sec")
        if sec is None:
            unfiled += 1
            continue
        if not isinstance(sec, int) or sec < 0 or sec >= len(parts):
            sec_bad.append("ch%d q%d is filed against part %r, but the chapter "
                           "has %d" % (l["id"], n_, sec, len(parts)))
            continue
        filed += 1
        asked = set()
        for src in (q["q"], q["o"][q["a"]]):
            src = re.sub("<.*?>", " ", src).replace("(ν)", "ν")
            for tok in re.split(r"[\s,·/()…—;:.!?'\"]+", src):
                g = bare(tok.strip())
                if len(g) >= 3 and not LUO.match(flat(g)) and norm(g) not in HEADWORDS:
                    asked.add(norm(g))
        # taught by this chapter (seen[-1]) but not yet by this point
        early = sorted(g for g in asked if g in seen[-1] and g not in seen[sec])
        if early:
            first = {g: next(k for k, s in enumerate(seen) if g in s) for g in early}
            sec_early.append("ch%d q%d is asked after part %d but turns on %s"
                             % (l["id"], n_, sec,
                                ", ".join("%s (taught in part %d)" % (g, first[g])
                                          for g in early)))

print("\nquestions filed against a chapter section: %d (%d not filed)"
      % (filed, unfiled))
for s in sec_bad + sec_early:
    print("   " + s)
if sec_bad or sec_early:
    sys.exit(1)

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

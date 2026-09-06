# -*- coding: utf-8 -*-
"""The Greek keyboard: that its rules are the text's, and that it can type
   every answer the app will ask for.

    python tools/check_keys.py

js/keys.js dims a diacritic that cannot sit on the letter just typed — a
circumflex greys out over ε, an iota subscript over anything but α η ω. That
dimming is meant to teach, so it has to be right, and it is the kind of claim
this repo does not make from memory.

THREE PASSES.

  1. The dim table is the New Testament's own. Every base-letter-and-mark
     pair in all 137,554 words is re-derived here and compared with MARK_OK,
     which sits in js/greek.js with the rest of the Greek-string surgery. A
     pair the text uses and the table forbids makes a real form untypeable;
     a pair the table allows and the text never uses is the keyboard
     teaching something false.

  2. Every answer is typeable. For each inflected form in data/forms.js,
     each deck headword and each paradigm cell: the base letters are keys on
     this keyboard, the marks are mark keys, and each pairing is one the
     keyboard permits. A form that needs a key it does not have is a
     question nobody can answer.

  3. Final sigma. gkFinalSigma settles σ against ς so the learner never has
     to, because no rung of the ladder folds them — λογοσ would not match
     λόγος at any level. Checked by asking the JavaScript.

WHAT IT CANNOT DO. It cannot say the layout is usable, only that it is
complete. Whether eight columns is right on a small phone is a question for
a thumb.
"""
import io, json, os, re, subprocess, sys, unicodedata
from collections import defaultdict

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from corpus import manifest, book, bare                            # noqa: E402

MARKS = "́̀͂̓̔̈ͅ"
NAMES = {"́": "acute", "̀": "grave", "͂": "circumflex",
         "̓": "smooth", "̔": "rough", "ͅ": "iota subscript",
         "̈": "diaeresis"}

bad = []
src = io.open(os.path.join(ROOT, "js", "keys.js"), encoding="utf-8").read()
# MARK_OK is a fact about Greek orthography, so it lives with the ladder.
gsrc = io.open(os.path.join(ROOT, "js", "greek.js"), encoding="utf-8").read()

# ------------------------------------------------ the keyboard's tables ---
m = re.search(r"const KEY_ROWS = \[(.*?)\];", src, re.S)
if not m:
    sys.exit("could not find KEY_ROWS in js/keys.js")
KEYS = set("".join(re.findall(r'"([^"]+)"', m.group(1))))

m = re.search(r"const MARK_OK = \{(.*?)\n\};", gsrc, re.S)
if not m:
    sys.exit("could not find MARK_OK in js/greek.js")
MARK_OK = {}
for mark, letters in re.findall(r'"(.)":\s*"([^"]*)"', m.group(1)):
    MARK_OK[mark] = set(letters)
print("letter keys: %d      marks with a rule: %d" % (len(KEYS), len(MARK_OK)))

# --------------------------------------- 1. the table against the text ----
man = manifest()
seen = defaultdict(set)
for b in man["books"]:
    for ch in book(b["a"])["c"]:
        for v in ch:
            for w in v[1]:
                t = bare(w[0])
                if not t:
                    continue
                base = None
                for c in unicodedata.normalize("NFD", t.lower()):
                    if c in MARKS:
                        if base:
                            seen[c].add(base)
                    else:
                        base = c

for mark in sorted(set(seen) | set(MARK_OK)):
    text, table = seen.get(mark, set()), MARK_OK.get(mark, set())
    for L in sorted(text - table):
        bad.append("the text puts a %s on %s and the keyboard forbids it — "
                   "that form cannot be typed" % (NAMES.get(mark, mark), L))
    for L in sorted(table - text):
        bad.append("the keyboard allows a %s on %s and the New Testament never "
                   "does — it would be teaching something false"
                   % (NAMES.get(mark, mark), L))
print("dim rules that disagree with the corpus: %d"
      % sum(1 for b in bad if "keyboard" in b))

# ------------------------------------------- 2. every answer is typeable --
def app_array(fname, name):
    p = os.path.join(ROOT, "data", fname)
    js = ("const fs=require('fs'),vm=require('vm');const c=vm.createContext({});"
          "vm.runInContext(fs.readFileSync(%s,'utf8'),c,{filename:'d'});"
          "process.stdout.write(vm.runInContext('JSON.stringify(%s)',c));"
          % (json.dumps(p), name))
    r = subprocess.run(["node", "-e", js], cwd=ROOT, capture_output=True,
                       text=True, encoding="utf-8")
    return json.loads(r.stdout) if r.returncode == 0 else []


targets = []
for row in app_array("forms.js", "FORMS"):
    targets.append((row[0], "data/forms.js"))
for row in app_array("vocab.js", "VOCAB"):
    targets.append((row[0].split(",")[0].strip(), "the deck"))
for tbl in app_array("paradigms.js", "PARADIGMS"):
    for cell in re.findall(r'<td[^>]*class="g"[^>]*>([^<]+)</td>', tbl.get("html", "")):
        targets.append((cell.strip(), "a paradigm table"))

untypeable = []
for form, where in targets:
    base = None
    for c in unicodedata.normalize("NFD", bare(form).lower()):
        if c in MARKS:
            if base and base not in MARK_OK.get(c, set()):
                untypeable.append("%s (%s): %s on %s is dimmed"
                                  % (form, where, NAMES[c], base))
        elif c in MARKS or c in "̀-ͯ":
            untypeable.append("%s (%s): mark %r has no key" % (form, where, c))
        else:
            base = c
            if c not in KEYS and c != "ς":       # ς comes from σ
                untypeable.append("%s (%s): no key for %s" % (form, where, c))
bad += untypeable
print("forms the app could ask for: %d      untypeable: %d"
      % (len(targets), len(untypeable)))

# ----------------------------------------------------- 3. final sigma -----
js = """
const fs=require('fs'), vm=require('vm');
const c=vm.createContext({});
vm.runInContext(fs.readFileSync(%s,'utf8'),c,{filename:'greek.js'});
process.stdout.write(JSON.stringify(vm.runInContext(
  '[gkFinalSigma("λογοσ"),gkFinalSigma("λογος"),gkFinalSigma("ςυν"),'
  + 'gkFinalSigma("οσ ")]', c)));
""" % json.dumps(os.path.join(ROOT, "js", "greek.js"))
r = subprocess.run(["node", "-e", js], capture_output=True, text=True, encoding="utf-8")
if r.returncode:
    bad.append("could not run js/greek.js: " + r.stderr[:200])
else:
    got = json.loads(r.stdout)
    want = ["λογος", "λογος",
            "συν", "οσ "]
    for g, w in zip(got, want):
        if g != w:
            bad.append("gkFinalSigma gives %r where %r is wanted" % (g, w))
    print("final sigma settled correctly: %s" % ("no" if got != want else "yes"))

print("\nfaults: %d" % len(bad))
for b in bad[:15]:
    print("   " + b)
if len(bad) > 15:
    print("   ... and %d more" % (len(bad) - 15))
sys.exit(1 if bad else 0)

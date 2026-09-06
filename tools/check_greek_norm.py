# -*- coding: utf-8 -*-
"""The one ladder for comparing Greek words, held to itself and to the app.

    python tools/check_greek_norm.py

js/greek.js and tools/corpus.py each define three rungs — gkKey/norm,
gkPlain/plain, gkLoose/loose. Everything in the repo that asks whether two
Greek words are the same word goes through one of them.

WHY IT EXISTS. There used to be five, in three files. app.js defined an
accent-stripper that kept breathings, and forty lines later a second one that
did not; gnt.js defined a third byte-identical to the second and a fourth of
its own; grid.js had a fifth. Nothing compared them and two were the same
function written twice. Nothing had gone wrong yet, but typed answers are
coming: the app will mark a learner's spelling with the JavaScript while the
checkers pass the same content with the Python, and if those two ever
disagree the app fails somebody for a form a checker has already approved.

FOUR PASSES.

  1. It is a ladder. Each rung must be strictly coarser than the one above:
     any two words the key test calls equal, plain must call equal too, and
     likewise plain into loose. Checked over every distinct word in the New
     Testament, not a sample. If a rung ever stopped nesting, "correct at one
     level and wrong at the looser one" would become possible.
  2. Idempotence. f(f(x)) == f(x). A normaliser that changes its answer when
     applied twice cannot be used to key a dictionary, which is what these do.
  3. JavaScript agrees with Python, word for word, over the whole corpus.
     This is the pass the file was written for.
  4. Nobody else normalises. js/greek.js is the only file allowed to mention
     NFD or the combining-diacritical range. A sixth definition appearing in
     some other file is how the first five happened.
"""
import io, json, os, re, subprocess, sys, unicodedata

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from corpus import manifest, book, norm, plain, loose, bare      # noqa: E402

RUNGS = [("key", norm, "gkKey"), ("plain", plain, "gkPlain"),
         ("loose", loose, "gkLoose")]

# Files allowed to normalise, and the one that defines the ladder.
OWNER = "js/greek.js"
SMELLS = [r'normalize\("NFD"\)', r"\\u0300-\\u036f", r"̀-ͯ",
          r"\\u0300\\u0301\\u0342"]

bad = []

# ---------------------------------------------------------------- words ---
man = manifest()
words = set()
for b in man["books"]:
    for ch in book(b["a"])["c"]:
        for v in ch:
            for w in v[1]:
                t = bare(w[0])
                if t:
                    words.add(t)
words = sorted(words)
print("distinct Greek words in the New Testament: %d" % len(words))

# ------------------------------------------------- 1. it is a ladder ------
# Two words equal at a rung must stay equal at every looser rung. Build the
# partition at each level and check each class nests inside the next.
classes = []
for name, fn, _ in RUNGS:
    m = {}
    for w in words:
        m.setdefault(fn(w), []).append(w)
    classes.append((name, m))
    print("   distinct after %-5s : %6d" % (name, len(m)))

for i in range(len(RUNGS) - 1):
    tight_name, tight = classes[i]
    loose_name, loosefn = classes[i + 1][0], RUNGS[i + 1][1]
    for key, group in tight.items():
        got = {loosefn(w) for w in group}
        if len(got) > 1:
            bad.append("%s collapses %s but %s splits them again: %s"
                       % (tight_name, group[:4], loose_name, sorted(got)[:4]))
print("ladder nests at every rung: %s" % ("no" if bad else "yes"))

# --------------------------------------------------- 2. idempotence -------
non_idem = []
for name, fn, _ in RUNGS:
    for w in words:
        once = fn(w)
        if fn(once) != once:
            non_idem.append("%s(%s) is not stable: %r -> %r"
                            % (name, w, once, fn(once)))
            break
bad += non_idem
print("every rung idempotent: %s" % ("no" if non_idem else "yes"))

# ------------------------------------- 3. JavaScript agrees with Python ---
# greek.js declares its rungs with const, and a const at the top level of a
# script run in a vm context is a lexical binding rather than a property of
# the context object — c.gkKey is undefined. So the mapping is evaluated
# INSIDE the context, which is how every other checker reads the app's data.
js = """
const fs=require('fs'), vm=require('vm');
const c=vm.createContext({});
vm.runInContext(fs.readFileSync(%s,'utf8'),c,{filename:'greek.js'});
c.__words=JSON.parse(fs.readFileSync(%s,'utf8'));
process.stdout.write(JSON.stringify(vm.runInContext(
  '__words.map(w=>[gkKey(w),gkPlain(w),gkLoose(w),gkOnly(w)])', c)));
""" % (json.dumps(os.path.join(ROOT, "js", "greek.js")),
       json.dumps(os.path.join(os.environ.get("TEMP", "/tmp"), "gknorm_words.json")))

wpath = os.path.join(os.environ.get("TEMP", "/tmp"), "gknorm_words.json")
io.open(wpath, "w", encoding="utf-8").write(json.dumps(words, ensure_ascii=False))
r = subprocess.run(["node", "-e", js], capture_output=True, text=True,
                   encoding="utf-8")
if r.returncode:
    sys.exit("could not run js/greek.js:\n" + r.stderr[:600])
jsout = json.loads(r.stdout)

mismatch = 0
for w, (jk, jp, jl, jo) in zip(words, jsout):
    for label, got, want in (("gkKey", jk, norm(w)),
                             ("gkPlain", jp, plain(w)),
                             ("gkLoose", jl, loose(w)),
                             ("gkOnly", jo, bare(w))):
        if unicodedata.normalize("NFC", got) != unicodedata.normalize("NFC", want):
            mismatch += 1
            if mismatch <= 5:
                bad.append("%s(%s): JavaScript %r, Python %r" % (label, w, got, want))
print("words where JavaScript and Python disagree: %d" % mismatch)

# ------------------------------------------ 4. nobody else normalises -----
strays = []
for f in sorted(os.listdir(os.path.join(ROOT, "js"))):
    if not f.endswith(".js") or ("js/" + f) == OWNER:
        continue
    src = io.open(os.path.join(ROOT, "js", f), encoding="utf-8").read()
    for pat in SMELLS:
        if re.search(pat, src):
            strays.append("js/%s matches %s — normalising on its own" % (f, pat))
bad += strays
print("other files normalising on their own: %d" % len(strays))

print("\nfaults: %d" % len(bad))
for b in bad[:14]:
    print("   " + b)
if len(bad) > 14:
    print("   ... and %d more" % (len(bad) - 14))
sys.exit(1 if bad else 0)

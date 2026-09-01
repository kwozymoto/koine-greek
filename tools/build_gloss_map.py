# -*- coding: utf-8 -*-
"""Rebuild the reader's gloss table in data/gnt/manifest.json from data/vocab.js.

    python tools/build_gloss_map.py [--dry-run]

manifest.json carries gloss[] parallel to lemmas[], and that array is what
the tap-to-parse reader shows under a word. It is the deck's own glosses,
projected onto the corpus, so it has to be rebuilt whenever vocab.js gains
an entry or changes one — otherwise the reader quietly disagrees with the
flashcards about what a word means.

The rule is one line long: a lemma gets a gloss only if the deck teaches
that lemma. The first version of this table was built by matching on a
prefix instead, which put ἄξιος's "worthy" on ἀξίνη (an axe), τρεῖς's
"three" on τρέφω (I feed), and μέλλω's "I am about to" on μέλας (black) —
118 lemmas reading as some other word. Matching exactly costs 0.1% of token
coverage and gets all 118 right.

Five headwords are cited the way a lexicon cites them and lemmatised by
MorphGNT another way; CITATION maps those across. δέω is the one place the
corpus merges lexemes the deck keeps apart, so it gets both senses.
"""
import json, io, os, re, sys, unicodedata, subprocess, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAN = os.path.join(ROOT, "data", "gnt", "manifest.json")

def norm(x):
    d = unicodedata.normalize("NFD", x).replace("̀", "́")
    return unicodedata.normalize("NFC", d).lower()

# Lexicon citation form -> the lemma MorphGNT uses. See tools/check_vocab.py.
CITATION = {"τε": "τέ", "οὕτως": "οὕτω(ς)", "δεῖ": "δέω",
            "ἱερόν": "ἱερός", "ἐλεέω": "ἐλεάω"}
# Reader-only wording, for the lemmas where the card cannot say enough. Two
# reasons arise: the corpus merges lexemes the deck keeps apart, so the line
# is shown on tokens of both; or the useful note contains Greek, which a
# gloss may not, because the English → Greek drill shows the gloss and would
# be handing over the answer.
MERGED = {
    "δέω": "I bind, tie; (as δεῖ) it is necessary",
    "ἱερός": "temple (precinct); (as an adjective) holy",
    "τέ": "and, and so; τε…καί both…and",
}
RETIRED = {237}

# tools/check_vocab.py imports MERGED from here, so nothing above this line
# may touch the filesystem — importing a builder must not run it.
def main(dry):
    js = ("const fs=require('fs'),vm=require('vm');const c=vm.createContext({});"
          "vm.runInContext(fs.readFileSync('data/vocab.js','utf8'),c);"
          "process.stdout.write(vm.runInContext('JSON.stringify(VOCAB)',c));")
    out = subprocess.run(["node", "-e", js], cwd=ROOT, capture_output=True,
                         text=True, encoding="utf-8")
    if out.returncode:
        sys.exit("could not load data/vocab.js:\n" + out.stderr)
    VOCAB = json.loads(out.stdout)

    man = json.load(io.open(MAN, encoding="utf-8"))
    LEMMAS, OLD = man["lemmas"], man["gloss"]
    BY = {}
    for i, l in enumerate(LEMMAS):
        BY.setdefault(norm(l), i)

    new = [""] * len(LEMMAS)
    placed, orphan = {}, []
    for i, v in enumerate(VOCAB):
        if i in RETIRED:
            continue
        h = v[0].split(",")[0].strip()
        j = BY.get(norm(CITATION.get(h, h)))
        if j is None:
            j = BY.get(norm(h))
        if j is None:
            orphan.append("%3d %s is not a lemma in the corpus — no reader gloss"
                          % (i, h))
            continue
        new[j] = MERGED.get(LEMMAS[j], v[1])
        placed.setdefault(j, []).append(h)

    added   = [j for j in range(len(new)) if new[j] and not OLD[j]]
    dropped = [j for j in range(len(new)) if OLD[j] and not new[j]]
    changed = [j for j in range(len(new)) if new[j] and OLD[j] and new[j] != OLD[j]]

    print("lemmas glossed: %d -> %d   (+%d, -%d, %d reworded)"
          % (sum(1 for g in OLD if g), sum(1 for g in new if g),
             len(added), len(dropped), len(changed)))
    for j in changed:
        print("   %-14s %-34s -> %s" % (LEMMAS[j], '"' + OLD[j] + '"', '"' + new[j] + '"'))
    print("   %d wrong glosses removed, %d deck words the reader could not gloss added"
          % (len(dropped), len(added)))
    for s in orphan:
        print("   " + s)

    if dry:
        return

    # Rewrite only the gloss array, leaving the rest of the file byte for byte
    # as it was — this is generated data and the diff should show one thing.
    raw = io.open(MAN, encoding="utf-8").read()
    m = re.search(r'"gloss"\s*:\s*\[', raw)
    if not m:
        sys.exit("no gloss array in manifest.json")
    i, depth = m.end() - 1, 0
    for k in range(m.end() - 1, len(raw)):
        if raw[k] == "[":
            depth += 1
        elif raw[k] == "]":
            depth -= 1
            if depth == 0:
                j = k + 1
                break
    raw = raw[:m.end() - 1] + json.dumps(new, ensure_ascii=False, separators=(",", ":")) + raw[j:]
    io.open(MAN, "w", encoding="utf-8", newline="\n").write(raw)
    print("\nwrote %s" % os.path.relpath(MAN, ROOT))


if __name__ == "__main__":
    main("--dry-run" in sys.argv)

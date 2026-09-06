# -*- coding: utf-8 -*-
"""The deck against the chapters that teach it.

    python tools/check_deck.py

check_vocab asks whether a card agrees with the corpus. This asks whether it
agrees with the lesson a learner meets it in, which is a different authority
and has been wrong on its own.

WHY IT EXISTS. Chapter 8 says, in so many words:

    ἀνά is worth a line of its own, because a lexicon will gloss it "up"
    and the New Testament never uses it that way.

The card for ἀνά read "up (+acc); in the NT distributive: each, apiece" — and
ἀνά is in chapter 8's own v: list, so a learner met the correction and the
thing it corrects in the same sitting, with the card leading on the word the
chapter had just struck out. Every checker was green: the gloss is defensible
as classical Greek, the frequency was right, the part of speech was right.
Nothing in the repo compared the two.

This is the third time the same shape has appeared — a claim fixed in one
place and left standing in another. The others were prose against quiz, twice.

THE RULE. Inside a chapter body, find a sentence that

  * names one of the headwords the chapter teaches,
  * denies something — never, not, rather than, nothing, no longer, with the
    denial in the app's own voice rather than inside a quotation, and
  * puts an English word or phrase in quotation marks.

If a card that chapter teaches has that quoted phrase in its gloss, the card
and the chapter disagree, and one of them is wrong.

The denial has to sit OUTSIDE the quotation marks or the pass is useless: a
gloss like "not even one" for οὐδείς, and the English of any quoted verse
carrying a negative, both put "not" in a sentence that is denying nothing.
With that one restriction the pass is silent on the whole current deck and
still names ἀνά when the old gloss is put back — which is how it was tested.

WHAT IT CANNOT DO. It only sees a disagreement the chapter spelled out with
quotation marks. A chapter that contradicts a card in its own words, without
quoting the phrase, goes unnoticed. That is still a job for reading.
"""
import json, os, re, subprocess, sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# A denial in the app's own voice. Deliberately short: every addition widens
# what counts as the chapter striking a gloss out.
DENY = r"(?:never|not\b|rather than|nothing|no longer)"

# Cards a chapter deliberately contradicts, with the reason. Empty is the
# right state; an entry here says "the chapter and the card disagree and that
# is intended", which should be rare enough to argue for each time.
ALLOWED = {
    # (chapter, headword, quoted phrase): "why the disagreement is deliberate",
}


def plain(x):
    return re.sub(r"<[^>]+>", " ", x or "")


js = ("const fs=require('fs'),vm=require('vm');const c=vm.createContext({});"
      "for (const f of ['data/vocab.js','data/lessons.js'])"
      "vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});"
      "process.stdout.write(JSON.stringify({L:vm.runInContext('LESSONS',c),"
      "V:vm.runInContext('VOCAB',c)}));")
r = subprocess.run(["node", "-e", js], cwd=ROOT, capture_output=True,
                   text=True, encoding="utf-8")
if r.returncode:
    sys.exit("could not load the app data:\n" + r.stderr)
d = json.loads(r.stdout)
LESSONS, VOCAB = d["L"], d["V"]

bad, used = [], set()
n_cards = n_sent = 0

for l in LESSONS:
    body = plain(l["body"])
    taught = [i for i in l.get("v", []) if i < len(VOCAB)]
    n_cards += len(taught)
    for s in re.split(r"(?<=[.!?])\s+", body):
        # the denial must be the chapter speaking, not a gloss or a
        # translation it is quoting
        if not re.search(DENY, re.sub(r'"[^"]*"', " ", s), re.I):
            continue
        n_sent += 1
        quoted = [m.group(1).strip().lower()
                  for m in re.finditer(r'"([a-z][a-z \'-]{1,24})"', s)]
        if not quoted:
            continue
        for idx in taught:
            head, gloss = VOCAB[idx][0], VOCAB[idx][1]
            if re.split(r"[,\s]", head)[0] not in s:
                continue
            for q in quoted:
                if not re.search(r"\b%s\b" % re.escape(q), gloss.lower()):
                    continue
                k = (l["id"], head, q)
                if k in ALLOWED:
                    used.add(k)
                else:
                    bad.append((l["id"], head, gloss, q, s))

print("cards checked against the chapter that teaches them: %d" % n_cards)
print("chapter sentences that deny something in their own voice: %d" % n_sent)

stale = set(ALLOWED) - used
if stale:
    print("\nallow-list entries that matched nothing:")
    for cid, head, q in sorted(stale):
        print("   ch%-3d %-20s %r" % (cid, head, q))

print("\ncards that say what their own chapter denies: %d" % len(bad))
for cid, head, gloss, q, s in bad:
    print('   ch%-3d %s' % (cid, head))
    print('      card    : "%s"' % gloss)
    print("      chapter : %s" % re.sub(r"\s+", " ", s)[:150])
    print("      denies  : %r" % q)
if bad:
    print("\nOne of the two is wrong. If the disagreement is deliberate, it goes")
    print("in ALLOWED above with the reason — but a card teaching what its own")
    print("chapter strikes out is the fault this file was written for.")
sys.exit(1 if bad else 0)

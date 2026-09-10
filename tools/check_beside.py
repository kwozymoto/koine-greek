# -*- coding: utf-8 -*-
"""A Greek form named beside a quoted verse should be in that verse.

    python tools/check_beside.py

WHY THIS EXISTS. Chapter 15 quoted Romans 15:4 and then said, of the two
verbs standing in it, "γράφω gives ἐγράφην, and both verbs here are that
form." They are not. The verse has προεγράφη and ἐγράφη, both third
singular; ἐγράφην is the lexicon's first-person citation form and occurs
nowhere in the verse — nor anywhere in the New Testament. The same slip sat
one section later under Luke 1:26, where the verse has ἀπεστάλη and the
commentary named ἀπεστάλην.

check_lessons already proves the QUOTATION is real: the Greek inside
<p class="v" data-ref="..."> must occur contiguously in the verse named.
Nothing checked the sentence that follows it, which is where the teaching
actually happens — and where a form the reader is about to go looking for
can be one letter wrong without any tool objecting.

WHAT IT CHECKS. For each quoted verse, every Greek word in the paragraph
after it must occur in that verse, or in another verse quoted in the same
section (chapters 25 and 6 quote Matthew and Luke side by side and then
compare them), or be listed in BESIDE below with a reason.

WHAT THE REASONS ARE. Most are legitimate and the list says which kind:

  * a LEMMA — "ποιήσω is ποιέω with the future sigma". Naming the
    dictionary form of a word that is in the verse is the normal way to
    teach, and the citation form is not expected on the page.
  * a FRAGMENT — a stem or an ending being pointed at (πειθ-, -μαι).
  * a NEXT VERSE — chapter 27 says "then in the next verse ἐγήγερται",
    which announces itself.

Anything not on the list fails, which is the UNATTESTED idiom from
check_lessons: a report that cannot fail is not a checker.
"""
import io, json, os, re, subprocess, sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
sys.path.insert(0, os.path.join(ROOT, "tools"))
import corpus


# (chapter, word) -> why it is not in the verse beside it.
BESIDE = {
    (3,  "ποιέω"):      "LEMMA of ποιήσω, which is in Matthew 4:19",
    (4,  "κύριος"):     "LEMMA of κύριε, which is in Matthew 8:25",
    (4,  "δοῦλος"):     "the other of the two greeting words being counted, "
                        "beside ἀπόστολος which is in Galatians 1:1",
    (7,  "ἐκβάλλω"):    "LEMMA of ἐξέβαλεν, which is in Matthew 8:16",
    (7,  "λέγω"):       "LEMMA of εἶπεν, the point being that they look nothing alike",
    (7,  "ἦσαν"):       "the imperfect of εἰμί, named as the contrast to Mark 15:25's ἦν",
    (9,  "διά"):        "the preposition being discussed; John 1:10 has δι’",
    (10, "ἐγγίζω"):     "LEMMA of ἤγγικεν, which is in Matthew 10:7",
    (10, "φανερόω"):    "LEMMA of πεφανέρωται, which is in Romans 3:21",
    (13, "πείθω"):      "LEMMA of πέποιθα; Romans 8:38 has πέπεισμαι",
    (13, "πειθ"):       "FRAGMENT — the stem being pointed at",
    (13, "μαι"):        "FRAGMENT — the ending being pointed at",
    (13, "ὁράω"):       "LEMMA of ὄψεσθε, which is in Matthew 26:64",
    (14, "ἐκλέγομαι"):  "LEMMA of ἐξελέξατο, which is in Ephesians 1:4",
    (15, "ἐγράφην"):    "LEMMA — the principal part, and the prose now says so; "
                        "Romans 15:4 has the third singular ἐγράφη",
    (15, "προ"):        "FRAGMENT — the prefix of προεγράφη",
    (15, "ἀπεστάλην"):  "LEMMA — the principal part, and the prose now says so; "
                        "Luke 1:26 has the third singular ἀπεστάλη",
    (19, "ζηλο"):       "FRAGMENT — the contract stem of ζηλοῖ",
    (19, "φυσιο"):      "FRAGMENT — the contract stem of φυσιοῦται",
    (19, "εται"):       "FRAGMENT — the ending being pointed at",
    (24, "ὅπως"):       "the alternative conjunction, named as what John 1:7 does "
                        "not use — it has ἵνα",
    (27, "ἐγήγερται"):  "NEXT VERSE — the prose says 'then in the next verse'",
}

PARA = re.compile(r"<p[^>]*>.*?</p>", re.S)
REF = re.compile(r'<p class="v" data-ref="([^"]+)"[^>]*>(.*?)</p>', re.S)
GK = re.compile(r'<span class="gk">(.*?)</span>', re.S)


def load_lessons():
    js = ("const fs=require('fs'),vm=require('vm');const c=vm.createContext({});"
          "vm.runInContext(fs.readFileSync('data/lessons.js','utf8'),c);"
          "process.stdout.write(vm.runInContext('JSON.stringify(LESSONS)',c));")
    r = subprocess.run(["node", "-e", js], capture_output=True, text=True,
                       encoding="utf-8")
    if r.returncode or not r.stdout:
        sys.exit("could not read data/lessons.js:\n" + (r.stderr or ""))
    return json.loads(r.stdout)


if __name__ == "__main__":
    checked = allowed = 0
    bad, unused = [], set(BESIDE)
    for les in load_lessons():
        paras = PARA.findall(les.get("body") or "")
        # Every verse quoted in the chapter, so a paragraph comparing two
        # quotations is not accused of inventing the one it is comparing to.
        section = set()
        for p in paras:
            m = REF.match(p)
            if not m:
                continue
            toks, err = corpus.verse_tokens(m.group(1))
            if not err:
                section |= {corpus.plain(corpus.bare(t[1])) for t in toks}

        for i, p in enumerate(paras):
            m = REF.match(p)
            if not m or i + 1 >= len(paras) or REF.match(paras[i + 1]):
                continue
            ref = m.group(1)
            toks, err = corpus.verse_tokens(ref)
            if err:
                continue
            here = {corpus.plain(corpus.bare(t[1])) for t in toks}
            for g in GK.findall(paras[i + 1]):
                for w in re.split(r"[\s,;·]+", re.sub(r"<[^>]+>", "", g).strip()):
                    w = corpus.bare(w)
                    if len(w) < 3:
                        continue
                    checked += 1
                    if corpus.plain(w) in here or corpus.plain(w) in section:
                        continue
                    key = (les["id"], w)
                    if key in BESIDE:
                        allowed += 1
                        unused.discard(key)
                    else:
                        bad.append((les["id"], ref, w))

    print("Greek words named beside a quoted verse: %d" % checked)
    print("   in that verse (or one quoted beside it): %d" % (checked - allowed - len(bad)))
    print("   listed in BESIDE with a reason:          %d" % allowed)

    if unused:
        print("\nBESIDE entries that no longer match anything — the prose has "
              "moved, so remove them or find out why:")
        for k in sorted(unused):
            print("   ch%-3d %s" % k)

    if bad:
        print("\nGREEK NAMED BESIDE A VERSE IT IS NOT IN: %d" % len(bad))
        for cid, ref, w in bad:
            print("   ch%-3d %-22s %s" % (cid, ref, w))
        print("\n   Either the form is wrong, or it is a lemma or a fragment "
              "and belongs in BESIDE with a reason.")
        sys.exit(1)
    if unused:
        sys.exit(1)
    print("\nevery Greek word beside a quotation is in it, or accounted for")

# -*- coding: utf-8 -*-
"""The English half of every reading gloss, against the app's own words.

    python tools/check_gloss.py

A gloss in data/readings.js reads 'dat sg fem of ἀρχή — beginning'. The part
before the dash is a parse, and check_readings has proved it against the
corpus since the readings were built. The part after it is English, and until
now nothing looked at it at all — 606 claims, unchecked.

WHAT THIS CAN AND CANNOT DO. It cannot say a gloss is right; no program can.
What it can say is whether the passage and the deck disagree about the same
Greek word, which is where a slip would show. The app already ships its own
English for nearly every lemma — the deck's wording for 818, data/lexicon.js
for 4,526 more — so the two can simply be compared.

WHY A STEMMER. The naive comparison is useless: 'loved' against 'love' and
'shines' against 'shine' look like total disagreement, and a first pass
flagged 60 glosses of which almost none were wrong. So each English word is
expanded into the forms it might also be written as, and two glosses agree if
any pair of their words meets. Irregular verbs get a small table because no
suffix rule turns 'gave' into 'give'; it holds the ones this text actually
uses and nothing else.

WHAT IS LEFT IS THE POINT. After stemming, what remains is real: places where
the passage says 'fellowship' and the deck says 'participation', or the
passage 'mourning' and the deck 'grief'. Neither is wrong. Those are
translation choices, and each is listed below with both wordings, so the list
is a record of decisions rather than a pile of noise — and anything new
appearing beside them fails.
"""
import io, json, os, re, subprocess, sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from corpus import norm                                          # noqa: E402

# Words that carry no meaning to compare. Deliberately short: an earlier
# version dropped the pronouns, which made σύ ("you, singular") look like it
# disagreed with every gloss reading "you" — twelve false alarms from one
# over-long list.
STOP = set("a an the of to in on at by for with and or but is are was were be "
           "been being as that this these those from into".split())

# No suffix rule turns these into each other. Only the ones this text uses.
IRREGULAR = {
    "gave": "give", "given": "give", "came": "come", "come": "come",
    "heard": "hear", "sent": "send", "written": "write", "wrote": "write",
    "men": "man", "saw": "see", "seen": "see", "told": "tell",
    "taken": "take", "took": "take", "overcame": "overcome",
    "made": "make", "held": "hold", "said": "say", "went": "go",
    "knew": "know", "known": "know", "began": "begin", "spoke": "speak",
    "spoken": "speak", "brought": "bring", "thought": "think",
    "children": "child", "feet": "foot", "teeth": "tooth",
}


# English declines its pronouns and a Greek lexical form does not, so the deck
# says "I" where a passage says "us" and "our". One family, one word.
PRONOUN = {}
for _fam in ["i me my mine we us our ours",
             "he him his she her hers it its they them their theirs",
             "you your yours thou thee thy thine",
             "who whom whose"]:
    for _w in _fam.split():
        PRONOUN[_w] = _fam.split()[0]


def variants(w):
    """Every spelling this word might also appear as. Two glosses agree if
       any of their words share one, which is looser than a single canonical
       stem and easier to argue about."""
    w = w.lower()
    out = {w, IRREGULAR.get(w, w), PRONOUN.get(w, w)}
    for v in list(out):
        if len(v) > 3:
            if v.endswith("ies"):
                out.add(v[:-3] + "y")
            if v.endswith("es"):
                out.add(v[:-2]); out.add(v[:-1])
            if v.endswith("s"):
                out.add(v[:-1])
            if v.endswith("ed"):
                out.add(v[:-2]); out.add(v[:-1])
            if v.endswith("ing"):
                out.add(v[:-3]); out.add(v[:-3] + "e")
            if v.endswith("en"):
                out.add(v[:-2]); out.add(v[:-1])
            if v.endswith("ly"):
                out.add(v[:-2])
            # running -> run, puffed -> puff
            m = re.match(r"^(.*?)([bdfglmnprt])\2(ed|ing)$", v)
            if m:
                out.add(m.group(1) + m.group(2))
    return {v for v in out if v}


def words(text):
    """The content words of a gloss.

       A lexicon cites a verb in the first person — "I arrange", "I adorn" —
       and that leading I is a convention, not a meaning. Left in, it makes
       every verb gloss match every other one: κοσμέω "I adorn" passed
       against the deck's "I arrange" on the strength of the pronoun alone,
       which is a disagreement waved through rather than caught. It is
       dropped only when something follows it, so ἐγώ, whose whole gloss is
       "I", still has a word to compare."""
    out = [w for w in re.findall(r"[a-z]+", (text or "").lower())
           if w not in STOP]
    return out[1:] if len(out) > 1 and out[0] == "i" else out


def compound(a, b):
    """everyone against every. Four characters at least, or "many" would
       count as a compound of "man"."""
    return (len(a) >= 4 and b.startswith(a)) or (len(b) >= 4 and a.startswith(b))


def agree(a, b):
    va = [variants(w) for w in a]
    vb = [variants(w) for w in b]
    if any(x & y for x in va for y in vb):
        return True
    return any(compound(x, y) for x in a for y in b)


# Glosses where the passage and the deck have chosen different English for the
# same word. Both wordings are recorded so the decision can be re-read, not
# just waved through.
ALLOWED = {
    # --- not a gloss at all -------------------------------------------
    ("λόγος", "the subject, marked by the article"):
        "a note about the syntax rather than the meaning; λόγος is glossed "
        "'word' earlier in the same passage",

    # --- the passage renders the form, the deck cites the verb ---------
    ("γίνομαι", "came into being"):
        "ἐγένετο in John 1:3. The deck says become, happen",
    ("γίνομαι", "has come into being"):
        "γέγονεν, the perfect, in the same verse",
    ("πολύς", "more"):
        "πλείονα, the comparative. The deck glosses the positive: many, much",
    ("μακροθυμέω", "I am patient"):
        "the deck has the noun, 'have patience'",
    ("ἑαυτοῦ", "her own (of ἡ ἀγάπη)"):
        "the parenthesis names what the reflexive points at, which is why it "
        "does not read like the deck's herself, himself, itself",

    # --- two defensible English words for one Greek one ----------------
    ("κοινωνία", "fellowship"): "the deck says participation",
    ("ἀναγγέλλω", "we announce"): "the deck says report",
    ("οὐδείς", "none at all"): "the deck says no one, nothing",
    ("εὐδοκέω", "I am well pleased"): "the deck says delight; Mark 1:11 wants the fuller phrase",
    ("μονογενής", "only, one of a kind"): "the deck says unique",
    ("φυσιόω", "I puff up"): "the deck says inflate; puff up is the English idiom",
    ("ἀσχημονέω", "I behave shamefully"): "the deck says act improperly",
    ("κοσμέω", "I adorn"): "the deck says arrange; Revelation 21:2 has a bride",

    # --- the deck glosses one sense and the passage needs the other ----
    ("ζηλόω", "I am jealous; zealous"):
        "the deck says eager. 1 Corinthians 13:4 needs the unfavourable "
        "sense, and the passage gives both",
    ("ἡγέομαι", "I consider, regard"):
        "the deck says govern, which is this verb's other sense entirely. "
        "Philippians 2:6 needs this one",

    # --- the deck's wording is thin, and this is the record of it ------
    ("καταργέω", "I abolish, bring to an end"):
        "the deck says abate, which is weaker than the verb and weaker than "
        "1 Corinthians 13:8 needs. Worth revisiting in the deck",
    ("καταχθόνιος", "under the earth"):
        "the deck says subterranean, which is the etymology rather than the "
        "English anyone would use. Worth revisiting in the deck",
    ("φρονέω", "I think, have a mindset"):
        "the deck says reason. Philippians 2:5 is about a disposition rather "
        "than an argument. Worth revisiting in the deck",

    # --- Revelation 21:4, where the deck's English has aged ------------
    ("ἐξαλείφω", "I wipe away"): "the deck says blot out; the verse has tears",
    ("πένθος", "mourning"): "the deck says grief",
    ("κραυγή", "crying"): "the deck says shouting",
    ("πόνος", "pain"):
        "the deck says travail, which no one now says. Worth revisiting in "
        "the deck",
}

# The lookup lowercases the gloss, so the keys above can keep their capitals
# and still be found. Written out rather than lowercased by hand because a
# key that silently matches nothing is the failure mode this list exists to
# avoid — and it happened, on six entries, the first time.
ALLOWED = {(lemma, eng.lower()): why for (lemma, eng), why in ALLOWED.items()}


# ---------------------------------------------------------------- load ----
js = ("const fs=require('fs'),vm=require('vm');const c=vm.createContext({});"
      "for (const f of ['data/vocab.js','data/lexicon.js','data/readings.js'])"
      "vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});"
      "process.stdout.write(JSON.stringify({V:vm.runInContext('VOCAB',c),"
      "L:vm.runInContext('typeof LEX!==\"undefined\"?LEX:{}',c),"
      "R:vm.runInContext('READINGS',c)}));")
r = subprocess.run(["node", "-e", js], cwd=ROOT, capture_output=True,
                   text=True, encoding="utf-8")
if r.returncode:
    sys.exit("could not load the app data:\n" + r.stderr[:400])
d = json.loads(r.stdout)
VOCAB, LEX, READINGS = d["V"], d["L"], d["R"]

mine = {}
for v in VOCAB:
    mine.setdefault(norm(v[0].split(",")[0].strip()), set()).update(words(v[1]))
if isinstance(LEX, dict):
    for k, g in LEX.items():
        mine.setdefault(norm(k), set()).update(words(str(g)))

claims = agreed = nolemma = thin = 0
bad, used = [], set()

for p in READINGS:
    for w in p["w"]:
        g = w[1] or ""
        if "—" not in g:
            continue
        eng = g.split("—", 1)[1].strip()
        lemma = w[2] if len(w) > 2 else None
        if not eng or not lemma:
            continue
        claims += 1
        theirs = mine.get(norm(lemma))
        if theirs is None:
            nolemma += 1
            continue
        ours = words(eng)
        if not ours or not theirs:
            thin += 1
            continue
        if agree(ours, theirs):
            agreed += 1
            continue
        k = (lemma, eng.lower())
        if k in ALLOWED:
            used.add(k)
        else:
            bad.append("%-9s %-14s passage %-30r deck %s"
                       % (p["id"], lemma, eng[:30], ", ".join(sorted(theirs))[:44]))

print("reading glosses with an English claim: %d" % claims)
print("   agree with the app's own gloss once stemmed : %d  (%.0f%%)"
      % (agreed, 100 * agreed / max(claims, 1)))
print("   a deliberate difference, listed with a reason: %d" % len(used))
print("   lemma the app does not gloss                : %d" % nolemma)
print("   nothing to compare after the stop-words     : %d" % thin)

stale = set(ALLOWED) - used
if stale:
    print("\nlisted differences that no longer occur — the gloss was edited,")
    print("so the reason beside it needs re-reading:")
    for lemma, eng in sorted(stale):
        print("   %-14s %r" % (lemma, eng))
        bad.append("stale entry: %s %r" % (lemma, eng))

print("\nglosses the deck and the passage disagree on, unaccounted for: %d"
      % len([b for b in bad if not b.startswith("stale")]))
for b in bad[:20]:
    print("   " + b)
sys.exit(1 if bad else 0)

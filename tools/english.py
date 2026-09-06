# -*- coding: utf-8 -*-
"""Comparing two pieces of English, for checkers that have to.

Two of them do. check_gloss asks whether a passage and the deck have chosen
the same English for one Greek word; check_render asks whether a lesson's
rendering of a verse uses words the published translations use. Both run into
the same wall, which is that English inflects: "loved" against "love" and
"shines" against "shine" look like total disagreement to a string comparison,
and a first pass at check_gloss flagged 60 glosses of which almost none were
wrong.

This is one copy of the answer. It is one copy on purpose — five ways of
comparing two Greek words had grown up in three files before js/greek.js
gathered them, and a second stemmer would have been the same mistake with a
different alphabet.

WHAT IS DELIBERATE HERE, because both were got wrong first:

  * The stop-list is short. A longer one dropped the pronouns, which made σύ
    ("you, singular") appear to disagree with every gloss reading "you" —
    twelve false alarms out of one over-long list.
  * The leading "I" of a lexicon's citation form is dropped when anything
    follows it. Left in, "I adorn" agreed with "I arrange" on the strength
    of the pronoun, which is a real disagreement waved through. It is kept
    when the whole gloss is "I", because that is ἐγώ.
"""
import re


# Words that carry no meaning to compare. Deliberately short: an earlier
# version dropped the pronouns, which made σύ ("you, singular") look like it
# disagreed with every gloss reading "you" — twelve false alarms from one
# over-long list.
STOP = set("a an the of to in on at by for with and or but is are was were be "
           "been being as that this these those from into".split())

# Auxiliaries are noise in a verse — no two translations spell "shall not"
# against "do not" the same way — and they are the whole meaning in a gloss,
# where ἔχω is "I have" and ποιέω is "I do". So they are NOT in STOP, and
# check_render adds them while check_gloss does not. One stemmer, two
# stop-lists: sharing the first is right and sharing the second cost
# check_gloss three real glosses before it was noticed.
AUXILIARY = set("shall will should would may might must let do does did have "
                "has had not no there then than so if when".split())

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
for _fam in ["i me my mine we us our ours myself ourselves",
             "he him his she her hers it its they them their theirs "
             "himself herself itself themselves",
             "you your yours thou thee thy thine yourself yourselves",
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


def words(text, stop=None):
    """The content words of a gloss or a verse.

       A lexicon cites a verb in the first person — "I arrange", "I adorn" —
       and that leading I is a convention, not a meaning. Left in, it makes
       every verb gloss match every other one: κοσμέω "I adorn" passed
       against the deck's "I arrange" on the strength of the pronoun alone,
       which is a disagreement waved through rather than caught. It is
       dropped only when something follows it, so ἐγώ, whose whole gloss is
       "I", still has a word to compare."""
    drop = STOP if stop is None else stop
    out = [w for w in re.findall(r"[a-z]+", (text or "").lower())
           if w not in drop]
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

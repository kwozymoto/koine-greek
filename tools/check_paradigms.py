# -*- coding: utf-8 -*-
"""Check data/paradigms.js against the SBLGNT in data/gnt/.

    python tools/check_paradigms.py

The reference tables are hand-built. Everything else in the app is generated
or verified — the chapter vocabulary comes out of the textbook, the example
verses and the principal-parts drill are built from the corpus — but these
24 tables were typed, and typed data drifts. Two earlier passes found three
errors this way: λαμβάνω's aorist passive and μένω's perfect, neither of
which occurs in the New Testament, and παρά's dative and accusative senses
swapped.

What it can and cannot tell you
-------------------------------
Two questions, and it matters which is asked of which table.

  * Tables of real New Testament words — the article, the pronouns, the noun
    and adjective paradigms, the numerals — are checked by parse code: does
    this form occur with the case, number and gender its row and column
    claim? A clash there is worth investigating.

  * Tables built on λύω are teaching paradigms. Most of their forms never
    occur in the New Testament, so absence proves nothing about them. Only
    the reverse is checkable: if a form does occur, does it occur with the
    parse the table gives it?

So absence is reported separately from contradiction, and neither is
automatically an error. A correct paradigm contains forms the New Testament
happens never to use: σάρκες is the nominative plural of σάρξ whether or not
anyone wrote it down.

Two traps this learned the hard way
-----------------------------------
  * Do not strip breathings when matching. It merges αὐταί with αὗται and ὁ
    with ὅ — the very pairs the Look-alikes table exists to separate — and
    would hide a real error in them. Only the acute/grave alternation is
    neutralised, because Greek shifts an acute to a grave before a following
    word and those are the same form.

  * The tables carry number three different ways: a caption ("Plural"), a row
    label ("Nom pl"), and two forms in one cell ("οὗτος / οὗτοι"). Read only
    one of them and the checker invents three dozen errors that are not there.
"""
import json, io, os, re, sys, unicodedata, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GNT = os.path.join(ROOT, "data", "gnt")
GK = "Ͱ-Ͽἀ-῿"
strip = lambda s: re.sub("[^" + GK + "]", "", s)

def norm(x):
    d = unicodedata.normalize("NFD", x).replace("̀", "́")
    return unicodedata.normalize("NFC", d).lower()

# Forms that are two parses of one spelling, or a tagging convention rather
# than a disagreement. Each was checked by hand; keeping them here means a
# clean run stays clean and anything new stands out.
BENIGN = {
    ("λύσω", "future indicative and aorist subjunctive are the same form"),
    ("λύσῃ", "future middle and aorist subjunctive are the same form"),
    ("λύετε", "present indicative and present imperative are the same form"),
    ("τίνα", "accusative singular and neuter plural are the same form"),
    ("τίσιν", "the dative plural is the same for every gender"),
    ("ἀγαπῶν", "genitive plural of ἀγάπη, and the participle of ἀγαπάω"),
    ("ἤμην", "εἰμί has no voice contrast; MorphGNT tags it middle"),
    ("ἔσομαι", "εἰμί future, tagged middle"), ("ἔσῃ", "εἰμί future, tagged middle"),
    ("ἔσται", "εἰμί future, tagged middle"), ("ἐσόμεθα", "εἰμί future, tagged middle"),
    ("ἔσεσθε", "εἰμί future, tagged middle"), ("ἔσονται", "εἰμί future, tagged middle"),
}
BENIGN_FORMS = {f for f, _ in BENIGN}

# ---------------------------------------------------------------- corpus --
man = json.load(io.open(os.path.join(GNT, "manifest.json"), encoding="utf-8"))
lemmas, poss = man["lemmas"], man["pos"]
FORMS = collections.defaultdict(set)
for b in man["books"]:
    d = json.load(io.open(os.path.join(GNT, b["a"] + ".json"), encoding="utf-8"))
    for ch in d["c"]:
        for vs in ch:
            for w in vs[1]:
                k = norm(strip(w[0]))
                if k:
                    FORMS[k].add((poss[w[2]], w[3], lemmas[w[1]]))

src = io.open(os.path.join(ROOT, "data", "paradigms.js"), encoding="utf-8").read()
BLOCKS = dict(re.findall(r'\{t:"(.*?)",tags:".*?",\s*html:`(.*?)`\}', src, re.S))

def grids(html):
    out = []
    for tbl in re.findall(r"<table>(.*?)</table>", html, re.S):
        cap = re.search(r"<caption>(.*?)</caption>", tbl, re.S)
        rows = [[(m.group(1), re.sub("<.*?>", "", m.group(2)).strip())
                 for m in re.finditer(r"<(th|td)[^>]*>(.*?)</\1>", tr, re.S)]
                for tr in re.findall(r"<tr>(.*?)</tr>", tbl, re.S)]
        out.append((re.sub("<.*?>", "", cap.group(1)).strip() if cap else "", rows))
    return out

CLASH, ABSENT, N = [], [], [0]
def judge(title, form, label, want):
    f = strip(form)
    if not f:
        return
    N[0] += 1
    h = FORMS.get(norm(f), set())
    if not h:
        ABSENT.append((title, f, label))
        return
    if any(want(p, c, l) for p, c, l in h) or f in BENIGN_FORMS:
        return
    CLASH.append((title, f, label, sorted({p + " " + c for p, c, _ in h})[:4]))

CASE = {"Nom": "N", "Gen": "G", "Dat": "D", "Acc": "A", "Voc": "V"}
GEND = {"Masc": "M", "Fem": "F", "Neut": "N", "Masc/Fem": "MF"}
TENSE = {"Pres": "P", "Impf": "I", "Fut": "F", "Aor": "A", "Perf": "X", "Plup": "Y",
         "Present": "P", "Imperfect": "I", "Future": "F", "Aorist": "A", "Perfect": "X"}

def cells(txt):
    return [x for x in re.split(r"[\s,·()]+", txt.replace("(ν)", "ν")) if strip(x)]

def nominal(title, pos, col_gender=None, col_number=None):
    for cap, rows in grids(BLOCKS[title]):
        capnum = "P" if "plural" in cap.lower() else None
        head = [c[1] for c in rows[0]] if rows else []
        for r in rows[1:]:
            if not r or r[0][0] != "th":
                continue
            lab = r[0][1]
            cs = CASE.get(lab.split()[0])
            if not cs:
                continue
            rownum = "P" if re.search(r"\bpl\b", lab) else None
            for k, (_, txt) in enumerate(r[1:], start=1):
                if k >= len(head):
                    continue
                col = head[k]
                g = col_gender(col) if col_gender else GEND.get(col)
                if not g:
                    continue
                parts = [p.strip() for p in txt.split("/")]
                pairs = ([(parts[0], "S"), (parts[1], "P")] if len(parts) == 2 else
                         [(txt, rownum or capnum or
                           (col_number(col) if col_number else "S"))])
                for form, n in pairs:
                    for f in cells(form):
                        judge(title, f, "%s %s %s" % (lab.split()[0], col,
                                                      "sg" if n == "S" else "pl"),
                              lambda p, c, l, g=g, n=n, cs=cs: p in pos and len(c) > 6
                                  and c[4] == cs and c[5] == n and c[6] in g)

def verbal(title, mood):
    for cap, rows in grids(BLOCKS[title]):
        head = [c[1] for c in rows[0]] if rows else []
        for r in rows[1:]:
            if not r or r[0][0] != "th":
                continue
            m = re.match(r"([123])(sg|pl)$", r[0][1].strip())
            if not m:
                continue
            person, num = m.group(1), ("S" if m.group(2) == "sg" else "P")
            for k, (_, txt) in enumerate(r[1:], start=1):
                if k >= len(head):
                    continue
                col = head[k]
                t = TENSE.get(col.split()[0])
                if not t:
                    continue
                v = ("M", "P") if "m/p" in col else (("P",) if "pass" in col else
                     (("M",) if "mid" in col else ("A",)))
                for f in cells(txt.replace("/", " ")):
                    judge(title, f, "%s%s %s" % (person, m.group(2), col),
                          lambda p, c, l, t=t, v=v: p == "V-" and len(c) > 5
                              and c[0] == person and c[1] == t and c[2] in v
                              and c[3] == mood and c[5] == num)

def citation_gender(c):
    if "(masc)" in c or re.search(r"(^|[,\s])ὁ($|[,\s])", c): return "M"
    if re.search(r"(^|[,\s])τό($|[,\s])", c): return "N"
    return "F"

nominal("The article", {"RA"})
nominal("Demonstratives", {"RD"})
nominal("Relative pronoun", {"RR"})
nominal("πᾶς, πολύς, μέγας", {"A-"})
nominal("Numbers", {"A-"})
nominal("Adjectives and position", {"A-"})
nominal("Second declension nouns", {"N-"},
        col_gender=lambda c: GEND.get(c.split()[0]),
        col_number=lambda c: "P" if c.endswith("pl") else "S")
nominal("First declension nouns", {"N-"}, col_gender=citation_gender)
nominal("Third declension nouns", {"N-"}, col_gender=citation_gender)
verbal("λύω — active indicative", "I")
verbal("λύω — middle and passive indicative", "I")
verbal("εἰμί — to be", "I")
verbal("Subjunctive mood", "S")
verbal("Imperative mood", "D")
verbal("Contract verbs — present", "I")
verbal("μι-verbs", "I")

# αὐτός declines like the article; ἐγώ and σύ carry person in the lemma, not
# in the parse code, which is all dashes for a personal pronoun.
for cap, rows in grids(BLOCKS["Personal pronouns"]):
    head = [c[1] for c in rows[0]] if rows else []
    person_col = {"I": ("ἐγώ", "S"), "we": ("ἐγώ", "P"),
                  "you": ("σύ", "S"), "you (pl)": ("σύ", "P")}
    for r in rows[1:]:
        cs = CASE.get(r[0][1].split()[0])
        if not cs:
            continue
        for k, (_, txt) in enumerate(r[1:], start=1):
            if k >= len(head):
                continue
            col = head[k]
            if col in person_col:
                lem, n = person_col[col]
                for f in cells(txt):                    # includes the enclitics
                    judge("Personal pronouns", f, "%s %s" % (r[0][1], col),
                          lambda p, c, l, cs=cs, n=n, lem=lem: p == "RP" and len(c) > 5
                              and c[4] == cs and c[5] == n and l == lem)
            elif GEND.get(col):
                g = GEND[col]
                for form, n in zip([x.strip() for x in txt.split("/")], ("S", "P")):
                    for f in cells(form):
                        judge("Personal pronouns", f, "%s %s %s" % (r[0][1], col,
                              "sg" if n == "S" else "pl"),
                              lambda p, c, l, g=g, n=n, cs=cs: p == "RP" and len(c) > 6
                                  and c[4] == cs and c[5] == n and c[6] == g)

nominal("Interrogative, indefinite, reflexive", {"RI"},
        col_gender=lambda c: GEND.get(c))

# the participles table gives the nominative singular of each
for cap, rows in grids(BLOCKS["Participles — the key forms"]):
    head = [c[1] for c in rows[0]] if rows else []
    for r in rows[1:]:
        lab = r[0][1]
        t = {"Pres": "P", "Aor": "A", "Perf": "X", "εἰμί": "P"}.get(lab.split()[0])
        if not t:
            continue
        v = ("M", "P") if "m/p" in lab else (("P",) if "pass" in lab else
             (("M",) if "mid" in lab else ("A",)))
        for k, (_, txt) in enumerate(r[1:], start=1):
            g = GEND.get(head[k]) if k < len(head) else None
            if not g:
                continue
            for f in cells(txt):
                judge("Participles", f, "%s %s nom sg" % (lab, head[k]),
                      lambda p, c, l, t=t, v=v, g=g: p == "V-" and len(c) > 6
                          and c[1] == t and c[2] in v and c[3] == "P"
                          and c[4] == "N" and c[5] == "S" and c[6] == g)

print("cells checked by parse: %d" % N[0])
print("contradicted by the corpus: %d" % len(CLASH))
for t, f, lab, seen in CLASH:
    print("   %-38s %-12s claimed %s — corpus has %s" % (t[:38], f, lab, ", ".join(seen)))
print("not attested (expected in a full paradigm): %d" % len(ABSENT))
by = collections.Counter(t for t, _, _ in ABSENT)
for t, n in by.most_common():
    print("   %-38s %d" % (t[:38], n))
sys.exit(1 if CLASH else 0)

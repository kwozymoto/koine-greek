# -*- coding: utf-8 -*-
"""Turn a lesson body into narration text, one block at a time.

    python tools/build_lesson_audio.py            # print the script
    python tools/build_lesson_audio.py --tsv out.tsv   # cues for Atlas

WHY THE GREEK IS NOT SPLICED. The obvious way to narrate a lesson is to read
the English and drop in the existing word clips. It does not survive contact
with the text: only 37% of the 957 Greek spans across the course have an
approved clip, and of the rest half are fragments -- σα, θη, -μι, -ος -- that
are not words and never will have one.

So the Greek is not spliced, it is CUED. Where the prose says λόγος the
narration says `loh goss`, which is the cue a person tuned and approved for
that word in the vocabulary pack. Atlas has already proved it says that
correctly 818 times. No splice, no seam, no timing to get wrong, and the
sound the learner hears is the sound the deck teaches.

WHAT IS LEFT OUT, and each is a decision rather than an oversight:

  tables          Read aloud they are a list of endings with no shape. The
                  narration names the table and says it is on screen.
  quoted verses   The Greek of a data-ref verse is dropped and its English
                  kept. In chapters 1 and 2 every quoted verse is there to
                  show PUNCTUATION -- the raised dot, the question mark --
                  which is a visual point, and the translation follows it in
                  the prose anyway. Reading a verse aloud would need a cue
                  nobody has auditioned, which is the one thing this project
                  has learned not to ship.
  the raised dot  A mark, not a sound.

CUES is for Greek this file meets that the vocabulary pack has never had to
say: paradigm forms of λύω, the principal parts, letters named in a list.
Each was written here and, like every other cue in this project, means
nothing until an ear has passed it.
"""
import argparse, io, json, os, re, subprocess, sys, unicodedata

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

CHAPTERS = [1, 2]

# Greek these two chapters say that the deck has never needed. Paradigm forms
# of λύω (an invented teaching verb, so it has no card), the principal parts,
# and letters named rather than sounded.
CUES = {
    "λέγων":        "leh gohn",
    "λύομεν":       "loo o men",
    "ἔλυσεν":       "eh loo sen",
    "τὸ ἀποθανεῖν": "toh ah po thah nayn",
    "λύω, λύσω, ἔλυσα, λέλυκα, λέλυμαι, ἐλύθην":
        "loo oh, loo soh, eh loo sah, leh loo kah, leh loo my, eh loo thane",
    # Named as letters, not sounded. chi is `kai` and xi `ksigh` because the
    # alphabet clips had to be: Atlas says chi as the ch of church, and spells
    # Xi as X-I. See docs/erasmian_alphabet_cues.json.
    "γ, κ, χ, ξ":   "gamma, kappa, kai, ksigh",
    "ᾳ, ῃ, ῳ":      "alpha, ayta and oh may gah, each with an iota beneath",
    "·":            "",          # a mark, not a sound
}

# A mark SHOWN is not a word said, and chapter 1 is almost entirely marks:
# ς against σ, ἁ against ἀ, ά against ὰ against ᾶ. Naming them all "alpha"
# turns "rough adds an h, smooth adds nothing" into two identical clauses,
# which is worse than silence because it sounds like information.
#
# So they are DESCRIBED, which is what a person reading aloud would do. Where
# a description cannot carry the point -- a raised dot, a question mark, the
# shape of a letter -- the block is handed to the eye instead; see LOOK.
DESCRIBE = {
    "ς": "a final sigma",          "σ": "a sigma",
    "ἁ": "alpha with a rough breathing",
    "ἀ": "alpha with a smooth breathing",
    "ά": "alpha with an acute",    "ὰ": "alpha with a grave",
    "ᾶ": "alpha with a circumflex",
    # "Initial ῥ always takes the rough breathing" -- so describing ῥ AS
    # rough-breathed made the sentence say itself twice.
    "ῥ": "rho",
    "γ": "gamma", "ρ": "rho", "η": "eta", "υ": "upsilon",
    "χ": "chi",   "ω": "omega", "ι": "iota",
    "ει": "epsilon iota", "οι": "omicron iota",
    "η, ι, υ, ει": "eta, iota, upsilon, epsilon iota",
}

# Blocks whose point is the shape on the page. The narration says what the
# part is about and sends the listener to the screen -- Fraser's suggestion,
# and the honest answer where neither a cue nor a description can carry it.
LOOK = {
    # "Sigma is written ς at the end and σ everywhere else" is a sentence
    # about two SHAPES. Any substitution makes it say that sigma is written
    # sigma, which is the one thing it does not mean.
    (1, "Sigma is written"):
        "The first rule is about sigma, which is written one way at the end "
        "of a word and another everywhere else — the same letter and the same "
        "sound. The two shapes are on screen.",
    (1, "Comma and full stop"):
        "Punctuation. Comma and full stop look like ours. A raised dot does "
        "the work of our colon and semicolon, and it very often introduces "
        "speech. The example is on screen.",
    (1, "And the mark that looks like"):
        "And the mark that looks like a semicolon is a question mark. The "
        "example is on screen — in it, the only thing telling you a question "
        "is being asked is that final mark.",
}


def flat(s):
    return "".join(c for c in unicodedata.normalize("NFD", s or "")
                   if not unicodedata.combining(c)).lower()


def exact(s):
    """Accent-blind matching is wrong here and chapter 1 is why: ἁ and ἀ, ά
       and ὰ and ᾶ, all flatten to the same three letters, so a chapter whose
       subject IS the marks had every one of them collapse into "alpha". The
       accented spelling is the key; flat() is only a fallback."""
    return unicodedata.normalize("NFC", (s or "").strip())


def load():
    js = ("const fs=require('fs'),vm=require('vm');const c=vm.createContext({});"
          "vm.runInContext(fs.readFileSync('data/lessons.js','utf8'),c);"
          "process.stdout.write(vm.runInContext('JSON.stringify(LESSONS)',c));")
    r = subprocess.run(["node", "-e", js], capture_output=True, text=True,
                       encoding="utf-8")
    if r.returncode or not r.stdout:
        sys.exit("could not read data/lessons.js:\n" + (r.stderr or ""))
    return json.loads(r.stdout)


def cue_table():
    """Every cue this project has already had an ear on, by bare spelling."""
    t = {}
    for f in ("erasmian_vocab_cues.json", "erasmian_vocab_cues_v3_black.json",
              "erasmian_vocab_cues_v4_tail.json"):
        p = os.path.join("docs", f)
        if os.path.isfile(p):
            for r in json.load(io.open(p, encoding="utf-8")):
                t[flat(r["greek"])] = r["tts"]
    p = os.path.join("docs", "erasmian_alphabet_cues.json")
    if os.path.isfile(p):
        d = json.load(io.open(p, encoding="utf-8"))
        rows = d if isinstance(d, list) else next(
            v for v in d.values() if isinstance(v, list))
        for r in rows:
            for ch in str(r.get("greek", "")).split():
                # The NAME, because prose that shows a letter is talking about
                # the letter; its sound belongs to the alphabet drill.
                t.setdefault(flat(ch), str(r.get("name", "")).lower())
    # Descriptions last and exact-only, so they beat both the deck cue and the
    # letter name for the marks chapter 1 is actually about.
    for k, v in CUES.items():
        t[flat(k)] = v
        t[exact(k)] = v          # exact wins, so ἁ and ἀ can differ
    for k, v in DESCRIBE.items():
        t[exact(k)] = v
    return t


TAG = re.compile(r"<[^>]+>")
BLOCK = re.compile(r"<(h2|h3|p|table|ul|ol)\b([^>]*)>(.*?)</\1>", re.S)
GK = re.compile(r'<span class="gk">(.*?)</span>', re.S)


BARE_GK = re.compile(r"[Ͱ-Ͽἀ-῿]"
                     r"[Ͱ-Ͽἀ-῿]*"
                     r"(?:[,\s]+[Ͱ-Ͽἀ-῿]+)*")


def sub_text(raw, cues, missing):
    """A run of Greek -> the cue or description an ear has already passed."""
    raw = raw.strip()
    for key in (exact(raw), flat(raw)):
        if key in cues:
            return cues[key]
    missing.append(raw)
    return raw


def narrate(html, cues, missing):
    """One block of lesson HTML -> what the voice should say."""
    def sub(m):
        raw = TAG.sub("", m.group(1)).strip()
        e = exact(raw)
        if e in cues:
            return cues[e]
        f = flat(raw)
        if f in cues:
            return cues[f]
        missing.append(raw)
        return raw
    s = GK.sub(sub, html)
    s = TAG.sub(" ", s)
    # Not all the Greek is in a gk span. Χριστός sits bare in chapter 1's
    # prose, and so does the list of vowels modern Greek has collapsed. The
    # span was never the thing that made it Greek.
    s = BARE_GK.sub(lambda m: sub_text(m.group(0), cues, missing), s)
    s = (s.replace("&mdash;", "—").replace("&ndash;", "–")
          .replace("&amp;", "&").replace("&nbsp;", " ")
          .replace("&lsquo;", "'").replace("&rsquo;", "'")
          .replace("&ldquo;", '"').replace("&rdquo;", '"'))
    s = " ".join(s.split())
    # <b>mood</b>. leaves "mood ." once the tags go, and a voice pauses on it.
    s = re.sub(r"\s+([,.;:!?])", lambda m: m.group(1), s)
    s = re.sub(r"\(\s+", "(", s)
    s = re.sub(r"\s+\)", ")", s)
    # A cue is lower case, so a paragraph led by a bold label ran them
    # together: "Gamma nasal. gamma before gamma, kappa…" — the label, then
    # the cue for γ, reading as a fragment. Sentences start with a capital.
    s = re.sub(r"(^|[.!?]\s+)([a-z])", lambda m: m.group(1) + m.group(2).upper(), s)
    return s


def blocks_for(les, cues, missing):
    out = []
    for m in BLOCK.finditer(les["body"]):
        kind, attrs, inner = m.group(1), m.group(2), m.group(3)
        if kind == "table":
            out.append(("table", "The table for this is on screen."))
            continue
        # A quoted verse: the Greek is dropped and the English around it kept.
        if 'class="v"' in attrs or "data-ref=" in attrs:
            ref = re.search(r'data-ref="([^"]+)"', attrs)
            out.append(("verse", "The Greek of %s is on screen."
                        % (ref.group(1) if ref else "the verse")))
            continue
        plain = TAG.sub(" ", inner)
        look = next((v for (ch, start), v in LOOK.items()
                     if ch == les["id"] and " ".join(plain.split()).startswith(start)),
                    None)
        if look:
            out.append(("look", look))
            continue
        t = narrate(inner, cues, missing)
        if t:
            out.append(("heading" if kind in ("h2", "h3") else "prose", t))
    return merge(out)


# A block is a thing someone might press play on. "Accents" is not: it is one
# word and a second and a half, and 22 of the first 59 blocks were like it --
# bare headings, and the one-line pointers at a table. Nobody plays those
# alone, so they are folded into the prose they belong to.
MIN_WORDS = 30


def merge(blocks):
    """Headings join the block after them; anything still short joins the
       block before. Repeated until nothing moves, because folding two short
       blocks together can leave a third still short."""
    out = []
    for kind, text in blocks:
        if kind == "heading":
            out.append(["heading", text])       # settled on the next pass
            continue
        if out and out[-1][0] == "heading":
            head = out.pop()[1].rstrip(".")
            out.append(["prose", head + ". " + text])
            continue
        out.append([kind, text])
    changed = True
    while changed:
        changed = False
        for i, b in enumerate(out):
            if len(b[1].split()) >= MIN_WORDS or len(out) == 1:
                continue
            j = i - 1 if i else 1                # backwards, or forwards if first
            if not (0 <= j < len(out)):
                continue
            a, c = (out[j], out[i]) if j < i else (out[i], out[j])
            merged = [a[0] if a[0] != "heading" else c[0],
                      a[1].rstrip() + " " + c[1].lstrip()]
            out[min(i, j)] = merged
            del out[max(i, j)]
            changed = True
            break
    return [(k, t) for k, t in out]


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--tsv", help="write id<TAB>text for probe_xai.py")
    ap.add_argument("--chapters", default=",".join(map(str, CHAPTERS)))
    args = ap.parse_args()
    want = [int(x) for x in args.chapters.split(",")]

    cues, missing, rows = cue_table(), [], []
    for les in load():
        if les["id"] not in want:
            continue
        bs = blocks_for(les, cues, missing)
        print("\n%s chapter %d — %s %s" % ("=" * 8, les["id"],
                                           les.get("t", ""), "=" * 8))
        for i, (kind, text) in enumerate(bs):
            rows.append(("l%02d_%02d" % (les["id"], i), text))
            print("\n  [%02d %-7s] %s" % (i, kind, text))

    words = sum(len(t.split()) for _, t in rows)
    chars = sum(len(t) for _, t in rows)
    print("\n%s\nblocks %d · words %d · characters %d · about %d minutes spoken"
          % ("-" * 60, len(rows), words, chars, round(words / 150)))
    print("cost at xAI's $4.20 per million characters: $%.2f" % (chars * 4.2e-6))
    if missing:
        print("\nGREEK WITH NO CUE (%d): %s"
              % (len(missing), ", ".join(sorted(set(missing)))))
        sys.exit(1)
    print("every Greek span has a cue an ear has passed, or one written in CUES")
    if args.tsv:
        with io.open(args.tsv, "w", encoding="utf-8", newline="\n") as fh:
            fh.write("# Lesson narration, chapters %s. Greek is written as its\n"
                     "# approved cue, so Atlas says what the deck teaches.\n"
                     % args.chapters)
            for i, t in rows:
                fh.write("%s\t%s\n" % (i, t.replace("\t", " ")))
        print("wrote %s" % args.tsv)

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


PAIR = re.compile(r'(<span class="gk">.*?</span>)', re.S)


# A sentence that shows a Greek word AND its transliteration cannot be read
# aloud as it stands, because the two are the same sounds. "So ἄγγελος is
# angelos" spoken is one pronunciation twice -- and Fraser heard it come out
# as two DIFFERENT pronunciations, the cue ending in `loss` and Atlas reading
# `angelos` as an English word with a long o. Either way the sentence stops
# teaching: identical, it is empty; different, it contradicts itself.
#
# The six transliterations in the course are all in this one block, so this
# is a table of three sentences rather than a treatment. Each says the point
# ONCE, in the cue an ear has passed.
#
# Keyed on the raw HTML, lifted from data/lessons.js rather than retyped, and
# each key must occur exactly once in its chapter or the build stops -- so
# editing the lesson cannot leave a stale rewrite behind saying something the
# page no longer says.
SAY = {
    (1, 'So <span class="gk">ἅγιος</span> is <i>hagios</i>, '
        'but <span class="gk">ἀγάπη</span> is <i>agapē</i>.'):
        "So hag e oss begins with an h, and ah gah pay does not.",
    (1, '<span class="gk">ῥῆμα</span> is <i>rhēma</i>, near enough <i>rēma</i>.'):
        "rhay mah is near enough ray mah.",
    # The gamma-nasal sentence is the one that does NOT need rewriting, and
    # rewriting it was a mistake -- "So ἄγγελος is angelos, not aggelos" is
    # what a person teaching this would say out loud, naming the word and then
    # contrasting two ways of saying it. The repetition is the teaching. Only
    # the two transliterations are wrong aloud, so only they are replaced, and
    # the rest of the sentence still tracks word for word under a tap.
    #
    # `ahg geh loss` is the wrong pronunciation the sentence exists to rule
    # out, and it is assembled from spellings already heard: `ah` from ἀγάπη,
    # a closing hard g from καταγγέλλω's `tahg`, `geh` and `loss` from ἄγγελος
    # itself. The pair then differs by the one thing being taught, the n.
    (1, "<i>angelos</i>"): "ahng geh loss",
    (1, "<i>aggelos</i>"): "ahg geh loss",
}


def say_split(html, ch):
    """The chapter's SAY sentences pulled out whole, the rest left alone."""
    keys = [k for (c, k) in SAY if c == ch]
    if not keys:
        return [html]
    pat = "(" + "|".join(re.escape(k) for k in sorted(keys, key=len,
                                                      reverse=True)) + ")"
    return re.split(pat, html)


def check_say(lessons):
    """Every rewrite must still match the page it rewrites."""
    bodies = {les["id"]: les["body"] for les in lessons}
    for (ch, key) in SAY:
        n = bodies.get(ch, "").count(key)
        if n != 1:
            sys.exit("SAY: chapter %d holds this sentence %d times, not once "
                     "-- the lesson has been edited and the rewrite is stale:"
                     "\n  %s" % (ch, n, key))


def align(html, ch, cues, missing):
    """The block, twice over: what the voice says, and which word of it each
       word ON THE PAGE became.

    Built here rather than matched afterwards, because afterwards there is
    nothing to match on -- the page says λόγος and the voice says `loh goss`,
    which share no letters at all. Walking the two together is the only point
    at which the correspondence is known for free.

    Returns (narration, pairs) where pairs[i] is the index of the narration
    word that page-word i turned into. A page word with no counterpart -- the
    Greek of a mark that is described in three words, say -- points at the
    first word of whatever replaced it, which is what a tap should seek to.
    """
    page_words, spoken, pairs = [], [], []

    def add(page_text, spoken_text):
        """One stretch of page, and what it became in the narration."""
        pw = page_text.split()
        sw = spoken_text.split()
        at = len(spoken)
        spoken.extend(sw)
        for j, w in enumerate(pw):
            page_words.append(w)
            # A one-to-one stretch tracks word for word; a substitution points
            # every page word at the start of its replacement.
            pairs.append(at + j if len(pw) == len(sw) else at)

    for chunk in say_split(html, ch):
        if not chunk:
            continue
        if (ch, chunk) in SAY:
            add(clean(TAG.sub(" ", chunk)), SAY[(ch, chunk)])
            continue
        for part in PAIR.split(chunk):
            if not part:
                continue
            m = GK.fullmatch(part)
            if m:
                raw = TAG.sub("", m.group(1)).strip()
                add(raw, sub_text(raw, cues, missing))
                continue
            plain = clean(TAG.sub(" ", part))
            # Bare Greek in running prose -- Χριστός sits outside any span.
            pieces = BARE_GK.split(plain)
            greeks = BARE_GK.findall(plain)
            for k, piece in enumerate(pieces):
                if piece.strip():
                    add(piece, piece)
                if k < len(greeks):
                    add(greeks[k], sub_text(greeks[k], cues, missing))
    return weld(spoken, page_words, pairs)


def fuse(tokens):
    """Which of clean()'s tokens each of these tokens ends up inside.

    clean() pulls a stray mark back onto the word before it, so two tokens
    become one. Rather than re-implement that rule, walk the cleaned text
    against the tokens that produced it, character for character, and watch
    where each lands. The rule then lives in clean() alone.
    """
    text = clean(" ".join(tokens))
    new = text.split()
    if not new:
        return "", [], []
    assert "".join(new) == "".join(tokens), (
        "clean() changed the letters, not just the spacing -- the character "
        "walk cannot be trusted and the mapping would be a guess")
    idx, j, pos = [], 0, 0
    for w in tokens:
        while j < len(new) and pos >= len(new[j]):
            j += 1
            pos = 0
        idx.append(min(j, len(new) - 1))
        pos += len(w)
    return text, new, idx


def weld(spoken, page_words, pairs):
    """The last thing clean() does is pull a stray mark back onto the word
       before it -- `loh goss .` becomes `loh goss.` -- and that fuses two
       tokens into one. The pairs were counted before the fusing, so from the
       first stray full stop onwards every tap seeks one word early, which is
       the kind of wrong that looks right.

    The page needs the same treatment for the same reason. `<i>angelos</i>,`
    is pulled out as its own stretch, leaving the comma as a page word of its
    own -- so the page list said `angelos , not` where clean() says
    `angelos, not`, and a tap had a comma to land on.
    """
    text, _new, idx = fuse(spoken)
    if not text:
        return "", page_words, [0] * len(page_words)
    pairs = [idx[p] for p in pairs]
    _page, page_words, pidx = fuse(page_words)
    out = []
    for p, at in zip(pairs, pidx):
        # A fused page word keeps the FIRST contributor's second, so
        # `angelos,` is tapped where angelos is said, not where the comma is.
        if at < len(out):
            continue
        out.append(p)
    return text, page_words, out


def sub_text(raw, cues, missing):
    """A run of Greek -> the cue or description an ear has already passed."""
    raw = raw.strip()
    for key in (exact(raw), flat(raw)):
        if key in cues:
            return cues[key]
    missing.append(raw)
    return raw


def clean(s):
    """Entities out, spacing tidy. Shared by narrate() and align() so the two
       cannot drift -- if they tokenise differently the mapping is a lie."""
    s = (s.replace("&mdash;", "—").replace("&ndash;", "–")
          .replace("&amp;", "&").replace("&nbsp;", " ")
          .replace("&lsquo;", "'").replace("&rsquo;", "'")
          .replace("&ldquo;", '"').replace("&rdquo;", '"'))
    s = " ".join(s.split())
    s = re.sub(r"\s+([,.;:!?])", lambda m: m.group(1), s)
    s = re.sub(r"\(\s+", "(", s)
    s = re.sub(r"\s+\)", ")", s)
    return s


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
    """Each block carries four things now: what it is, what the voice says,
       the words as they appear ON THE PAGE, and which spoken word each of
       those became. The last two are what a tap needs."""
    out = []
    for m in BLOCK.finditer(les["body"]):
        kind, attrs, inner = m.group(1), m.group(2), m.group(3)
        page = clean(TAG.sub(" ", inner)).split()
        if kind == "table":
            # Nothing on the page maps into a pointer, so every word of the
            # table seeks to the start of it. Better than no seek at all.
            out.append(("table", "The table for this is on screen.", page,
                        [0] * len(page)))
            continue
        # A quoted verse: the Greek is dropped and the English around it kept.
        if 'class="v"' in attrs or "data-ref=" in attrs:
            ref = re.search(r'data-ref="([^"]+)"', attrs)
            out.append(("verse", "The Greek of %s is on screen."
                        % (ref.group(1) if ref else "the verse"),
                        page, [0] * len(page)))
            continue
        plain = TAG.sub(" ", inner)
        look = next((v for (ch, start), v in LOOK.items()
                     if ch == les["id"] and " ".join(plain.split()).startswith(start)),
                    None)
        if look:
            # A rewritten block: the sentences are not the page's sentences,
            # so the whole paragraph seeks to its own beginning.
            out.append(("look", look, page, [0] * len(page)))
            continue
        t, page_words, pairs = align(inner, les["id"], cues, missing)
        if t:
            out.append(("heading" if kind in ("h2", "h3") else "prose",
                        t, page_words, pairs))
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
    def join(a, c):
        """Two blocks into one. The second block's pairs shift by however many
           spoken words the first contributes, or every tap in the back half
           of a merged block seeks to the front half."""
        shift = len(a[1].split())
        return [a[0] if a[0] != "heading" else c[0],
                a[1].rstrip() + " " + c[1].lstrip(),
                a[2] + c[2],
                a[3] + [p + shift for p in c[3]]]

    out = []
    for kind, text, page, pairs in blocks:
        if kind == "heading":
            out.append(["heading", text, page, pairs])   # settled next pass
            continue
        if out and out[-1][0] == "heading":
            out.append(join(out.pop(), ["prose", text, page, pairs]))
            continue
        out.append([kind, text, page, pairs])
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
            out[min(i, j)] = join(a, c)
            del out[max(i, j)]
            changed = True
            break
    return [tuple(b) for b in out]


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--tsv", help="write id<TAB>text for probe_xai.py")
    ap.add_argument("--map", help="write the page-word -> second mapping as JSON")
    ap.add_argument("--timestamps", help="probe_xai's timestamps.json, for --map")
    ap.add_argument("--quiet", action="store_true")
    ap.add_argument("--chapters", default=",".join(map(str, CHAPTERS)))
    args = ap.parse_args()
    want = [int(x) for x in args.chapters.split(",")]

    cues, missing, rows, mapping = cue_table(), [], [], []
    lessons = load()
    check_say(lessons)
    for les in lessons:
        if les["id"] not in want:
            continue
        bs = blocks_for(les, cues, missing)
        if not args.quiet:
            print("\n%s chapter %d — %s %s" % ("=" * 8, les["id"],
                                               les.get("t", ""), "=" * 8))
        for i, (kind, text, page, pairs) in enumerate(bs):
            bid = "l%02d_%02d" % (les["id"], i)
            rows.append((bid, text))
            mapping.append({"id": bid, "ch": les["id"], "kind": kind,
                            "spoken": text, "page": page, "pairs": pairs})
            if not args.quiet:
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

    if args.map:
        if not args.timestamps:
            sys.exit("--map needs --timestamps, probe_xai's alignment")
        ts = json.load(io.open(args.timestamps, encoding="utf-8"))
        out, bad = [], []
        for b in mapping:
            e = ts.get(b["id"])
            if not e:
                bad.append((b["id"], "no alignment in timestamps.json"))
                continue
            # The per-character alignment, cut into words at the spaces: the
            # first character of a word is when that word is said.
            gc = e["timestamps"]["graph_chars"]
            gt = e["timestamps"]["graph_times"]
            starts, words, cur, w = [], [], None, ""
            for c, (a, _z) in zip(gc, gt):
                if c.isspace():
                    if cur is not None:
                        starts.append(cur); words.append(w); cur, w = None, ""
                    continue
                if cur is None:
                    cur = a
                w += c
            if cur is not None:
                starts.append(cur); words.append(w)
            # THE GUARD. A seek time is only true of the clip that was made
            # from this text. Atlas's alignment echoes back what it said, so
            # compare it word for word with what we are about to map -- if the
            # lesson has been edited since, the clip is stale and every second
            # in it points at the wrong word. Case and punctuation are Atlas's
            # own; only the words are ours.
            def bare(x):
                return re.sub(r"[^a-z0-9αβγδεζηθικλμνξοπρστυφχψω]", "", x.lower())
            said = [bare(x) for x in words]
            sent = [bare(x) for x in b["spoken"].split()]
            if said != sent:
                j = next((k for k in range(min(len(said), len(sent)))
                          if said[k] != sent[k]), min(len(said), len(sent)))
                bad.append((b["id"], "clip says %d words, the lesson now has "
                            "%d; they part at word %d (%s | %s)"
                            % (len(said), len(sent), j,
                               " ".join(words[j:j + 4]) or "<end>",
                               " ".join(b["spoken"].split()[j:j + 4]) or "<end>")))
                continue
            # A page word points at a spoken word; a spoken word has a second.
            secs = [round(starts[p], 2) for p in b["pairs"]]
            out.append({"id": b["id"], "ch": b["ch"], "kind": b["kind"],
                        "page": b["page"], "t": secs})
        if bad:
            print("\nCLIPS THAT DO NOT MATCH THE LESSON (%d) — regenerate these\n"
                  "before the map ships, or a tap seeks into audio that says\n"
                  "something else:" % len(bad))
            for i, why in bad:
                print("  %s  %s" % (i, why))
        io.open(args.map, "w", encoding="utf-8", newline="\n").write(
            json.dumps(out, ensure_ascii=False) + "\n")
        n = sum(len(b["page"]) for b in out)
        print("wrote %s — %d of %d blocks, %d page words with a seek time"
              % (args.map, len(out), len(mapping), n))
        if bad:
            sys.exit(1)

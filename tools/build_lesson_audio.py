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

CHAPTERS = [1, 2, 3, 4, 5, 6]

# The comment at the top of data/lesson_audio.js. It lives here because that
# file is generated: the app's copy is overwritten on every build.
JS_HEADER = """/* Chapter narration, read by Atlas (xAI). Built by
   tools/build_lesson_audio.py and held by tools/check_lesson_audio.py.

   The Greek is not spliced from the word clips, it is CUED: where the page
   says λόγος the narration says `loh goss`, the spelling an ear approved
   for that word in the vocabulary pack. Marks that are SHOWN rather than
   said are described, and a block whose whole point is the shape on the
   page hands the listener to the screen instead.

   Per block: `els` are the body elements it covers, in order, so the app
   can find them again after a merge; `page` is every word of those
   elements; `t[i]` is the second at which page word i is spoken. A word
   with no one-to-one counterpart -- a mark described in four words, a
   table pointed at -- carries the second its replacement starts. */
"""


def clip_seconds(path):
    """How long the mp3 actually is, straight from the file.

    The app prints "N minutes" from the sum of these and the checker holds
    every seek time inside its own clip, so this is not decoration -- and a
    number typed by hand is the kind of thing this project has shipped wrong
    before. ffprobe is needed only to BUILD; the shipped file has the answer.
    """
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nw=1:nk=1", path],
        capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit("ffprobe could not read %s\n%s" % (path, r.stderr.strip()))
    return round(float(r.stdout.strip()), 2)

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


# An empty <div> in a lesson body is a placeholder the app fills at render
# time, and there is exactly one in the whole course. Nothing is in the source
# for the builder to read, so without this the ENTIRE alphabet section -- the
# twenty-four letters, the eight diphthongs, and the prose between them --
# was silent, and a listener went from "only a handful are genuinely new"
# straight to the sigma rule with no sign that anything had been skipped.
#
# It is handed to the screen, like every other block whose point is a shape.
# The alphabet, PLAYED rather than pointed at (Fraser: "those could just
# automatically play as part of the chapter"). The voice says these two
# sentences; between and after them the block's clip carries the 24 letter
# clips and the 8 diphthong clips themselves, each followed by a pause to
# say it back in. The splice is made outside the repo from the clips in
# audio/clips/, and its timestamps entry carries `tiles` -- when each clip
# starts and stops -- so the app can light each letter as it is heard.
ALPHA_SAY = (
    "Here is the alphabet aloud: each letter's name, and then its sound. Say "
    "each one back in the pause after it — reading them silently does not "
    "work here.",
    "Now the diphthongs. Two vowels written together make one sound, and "
    "these eight are worth knowing before you meet them in the middle of a "
    "word.",
)

PLACEHOLDER = {
    (1, "alphaHere"): " ".join(ALPHA_SAY),
}


# Chapters narrated before the rules below existed, and heard as they are.
# Each rule marked LEGACY changes what a later chapter says and leaves these
# alone, because changing them changes clips an ear has already passed --
# check_lesson_audio would then fail them, rightly, until re-recorded.
LEGACY = {1, 2}

# Single letters named as letters, filled by cue_table(). Chapter 1's
# DESCRIBE overrides several of these ("a sigma", for a chapter about marks),
# and a later chapter wants the plain name: "a σ between stem and ending"
# said with DESCRIBE came out "a a sigma between".
LETTER_NAMES = {}

# Every cue sheet's own answer by exact spelling, before CUES and DESCRIBE
# write over the table -- so a later chapter that sets CUES aside can still
# find the sheet's cue for the same word.
SHEET = {}

# Which real spellings stand behind each accent-blind key, so a borrowed cue
# can be refused when the two words are accented differently.
SPELT = {}

# IPA for the narration, for every deck word whose cue is an English
# respelling: {spelling: (the deck's respelling, the IPA)}. Respellings pass
# on a card and misfire in prose, read as English -- "loh goss" as "low goss",
# "haw" as "how", "ay" as "eye", and "e goh", "ahr toss" running together
# through the commas meant to part them. From docs/erasmian_narration_ipa.json.
IPA_TWIN = {}

# Where the IPA replaces the respelling. Chapters recorded before it keep the
# respellings their approved clips say; what is recorded after takes the IPA.
IPA_VERSES_FROM = 3
IPA_TABLES_FROM = 4
IPA_PROSE_FROM = 4


def ipa_twins(cues, ch):
    """The table with every respelled deck cue swapped for its IPA."""
    c = dict(cues)
    for g, (deck, tts) in IPA_TWIN.items():
        if ch >= VOWELS_FROM:
            tts = said_vowels(tts)
        for key in (exact(g), soft(g), flat(g)):
            if c.get(key) == deck:
                c[key] = tts
    return c

# The three letters whose clips are still cut from the old master carry no
# IPA cue, so their names are plain English, which reads correctly. Chi's
# clip is a separate take with no name cue either; `/kaɪ/` is the k the
# course teaches, where plain "chi" was read as the English word.
LETTER_SAID = {"chi": "/kaɪ/"}


def soft(s):
    """Accents off, breathings kept. οὔ is οὐ with an accent, and without
    this it fell through to flat(), where οὐ and οὗ are the same key -- and
    what answered was the diphthong's NAME, "omicron + upsilon"."""
    return unicodedata.normalize("NFC", "".join(
        c for c in unicodedata.normalize("NFD", s or "")
        if c not in "̀́͂")).lower()


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
    # EXACT FIRST. flat() strips breathings, and five pairs in the deck differ
    # only by one: οὐ "not" and οὗ "where" flattened to the same key, the later
    # row won, and chapter 2 said "hoo with the indicative" for οὐ -- shipped,
    # and invisible, because the checker compared page words and not what was
    # spoken. So the accented spelling is the key, and a flat key is kept only
    # where every deck word flattening to it has the same cue.
    t, flats, softs = {}, {}, {}
    for f in ("erasmian_vocab_cues.json", "erasmian_vocab_cues_v3_black.json",
              "erasmian_vocab_cues_v4_tail.json",
              # The forms said after a headword, each heard by ear 2026-09-23.
              "erasmian_extra_forms_cues.json",
              # Greek that only the chapters say -- paradigm forms, endings,
              # stems. Generated by rule outside the repo and heard INSIDE the
              # narration, which is where an ear meets them; see its source
              # field. Last, so a deck cue always wins.
              "erasmian_lesson_cues.json"):
        p = os.path.join("docs", f)
        if os.path.isfile(p):
            for r in json.load(io.open(p, encoding="utf-8")):
                t.setdefault(exact(r["greek"]), r["tts"])
                SHEET.setdefault(exact(r["greek"]), r["tts"])
                softs.setdefault(soft(r["greek"]), set()).add(r["tts"])
                SPELT.setdefault(soft(r["greek"]), set()).add(exact(r["greek"]))
                SPELT.setdefault(flat(r["greek"]), set()).add(exact(r["greek"]))
                flats.setdefault(flat(r["greek"]), set()).add(r["tts"])
    for table in (softs, flats):
        for k, v in table.items():
            if len(v) == 1:
                t.setdefault(k, next(iter(v)))
    p = os.path.join("docs", "erasmian_narration_ipa.json")
    if os.path.isfile(p):
        for r in json.load(io.open(p, encoding="utf-8")):
            IPA_TWIN[exact(r["greek"])] = (r["deck"], r["tts"])
            # THE NARRATION DOES NOT FOLLOW THE CARD. The cards are moving
            # from respellings to IPA a batch at a time, and a card's new cue
            # must not change what an approved chapter derives, or every
            # batch would make shipped clips stale. So a word with a twin is
            # read at its OLD respelling -- the snapshot in `deck` -- and
            # ipa_twins() swaps in the narration IPA wherever the chapter's
            # rules say to, exactly as before the card moved.
            new = SHEET.get(exact(r["greek"]))
            for key in (exact(r["greek"]), soft(r["greek"]), flat(r["greek"])):
                if key in t and (t[key] == new or key == exact(r["greek"])):
                    t[key] = r["deck"]
    p = os.path.join("docs", "erasmian_alphabet_cues.json")
    if os.path.isfile(p):
        d = json.load(io.open(p, encoding="utf-8"))
        rows = d if isinstance(d, list) else next(
            v for v in d.values() if isinstance(v, list))
        for r in rows:
            # Letters only. A diphthong row's name is "omicron + upsilon",
            # and registering it under ου made that the answer for the WORD
            # οὔ whenever the deck's own key was ambiguous.
            if r.get("kind") != "letter":
                continue
            for ch in str(r.get("greek", "")).split():
                # The NAME, because prose that shows a letter is talking about
                # the letter; its sound belongs to the alphabet drill.
                name = str(r.get("name", "")).lower()
                t.setdefault(flat(ch), name)
                # For later chapters, the name AS THE LETTER BUTTON SAYS IT:
                # the IPA before the ellipsis in the clip's own cue, heard and
                # chosen 2026-09-23. Plain "chi" came out as the English word,
                # with no k in it (chapter 3, block 7).
                cue = str(r.get("cue") or "")
                said = cue.split("…")[0].strip() if cue.startswith("/") else ""
                if said and not said.endswith("/"):
                    said += "/"
                LETTER_NAMES[exact(ch)] = LETTER_SAID.get(name, said or name)
    # Descriptions last and exact-only, so they beat both the deck cue and the
    # letter name for the marks chapter 1 is actually about.
    for k, v in CUES.items():
        t[flat(k)] = v
        t[exact(k)] = v          # exact wins, so ἁ and ἀ can differ
    for k, v in DESCRIBE.items():
        t[exact(k)] = v
    return t


TAG = re.compile(r"<[^>]+>")
BLOCK = re.compile(r"<(h2|h3|p|table|ul|ol|div)\b([^>]*)>(.*?)</\1>", re.S)
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
    # Sentences whose whole point is a SPELLING. Heard, the three shapes of
    # οὐ were three near-identical sounds -- and οὐκ and οὐχ are identical,
    # chi being said as k -- so "three spellings, one word" had nothing in
    # the ear to point at. Fraser: "the words could be spelled out".
    (3, '<span class="gk">οὐ</span> also changes shape to suit what follows: '
        '<span class="gk">οὐ</span> before a consonant, <span class="gk">οὐκ</span> '
        'before a smooth breathing, <span class="gk">οὐχ</span> before a rough one.'):
        "{οὐ} also changes shape to suit what follows. Before a consonant it "
        "is {οὐ}, spelled {spell:οὐ}. Before a smooth breathing it is {οὐκ}, "
        "spelled {spell:οὐκ}. And before a rough breathing it is spelled "
        "{spell:οὐχ}.",
    (3, 'The third person singular <span class="gk">λύει</span> and the second '
        'person singular <span class="gk">λύεις</span> differ by one letter'):
        "The third person singular {λύει}, ending {spell:ει}, and the second "
        "person singular {λύεις}, ending {spell:εις}, differ by one letter",
    (3, 'So will the future <span class="gk">λύσει</span>, which differs from '
        'the present <span class="gk">λύει</span> by the sigma alone.'):
        "So will the future {λύσει}, spelled {spell:λύσει}, which differs "
        "from the present {λύει} by the sigma alone.",
    (5, 'with the negative: <span class="gk">οὐ</span> before a consonant, '
        '<span class="gk">οὐκ</span> before a smooth breathing, '
        '<span class="gk">οὐχ</span> before a rough one.'):
        "with the negative: {οὐ} before a consonant, {οὐκ}, spelled "
        "{spell:οὐκ}, before a smooth breathing, and {spell:οὐχ} before a "
        "rough one.",
    (5, 'the kappa of <span class="gk">οὐκ</span> turns into the chi of '
        '<span class="gk">οὐχ</span>.'):
        "the kappa of {οὐκ} turns into the chi of {spell:οὐχ}.",
    (5, 'And <span class="gk">ἀγάπῃ</span> against <span class="gk">ἀγάπη</span>: '
        'dative against nominative, one silent letter apart'):
        "And {ἀγάπῃ}, with a small {spell:ι} beneath its last letter, against "
        "{ἀγάπη} with none: dative against nominative, one silent letter apart",
    (4, 'the genitive plural is <span class="gk">-ων</span> in every gender'):
        "the genitive plural is {-ων}, spelled {spell:ων}, in every gender",
    # The subscript is silent, so saying the word says nothing about it.
    (4, 'ends in a long vowel with an iota written underneath it: '
        '<span class="gk">λόγῳ</span>, <span class="gk">ἔργῳ</span>.'):
        "ends in a long vowel with an iota written underneath it: {λόγῳ} "
        "and {ἔργῳ}, each ending in {spell:ω} with a small {spell:ι} beneath.",
    (1, "<i>aggelos</i>"): "ahg geh loss",
}


def spell(word):
    """λύεις -> its letters by name, as the letter buttons say them."""
    out = []
    for c in unicodedata.normalize("NFD", word):
        if unicodedata.combining(c):
            continue
        c = unicodedata.normalize("NFC", c).lower()
        c = "σ" if c == "ς" else c
        if exact(c) not in LETTER_NAMES:
            sys.exit("spell(): no letter name for %r in %r" % (c, word))
        out.append(LETTER_NAMES[exact(c)])
    return ", ".join(out)


SLOT = re.compile(r"\{(spell:)?([^{}]+)\}")


def render(text, cues):
    """A SAY rewrite with its Greek left as {λύει} or {spell:λύεις}, filled
    from the live cue table -- so re-tuning a cue re-tunes the rewrite too,
    and check_lesson_audio sees the narration change."""
    def fill(m):
        if m.group(1):
            return spell(m.group(2))
        hit = lookup(m.group(2), cues)
        if hit is None:
            sys.exit("SAY: no cue for %r" % m.group(2))
        return hit
    return SLOT.sub(fill, text)


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

    def greek(raw):
        """A run of Greek, word by word where it has no cue as a whole.

        Said the same either way -- sub_text's fallback is these words
        joined -- but a run added whole points every page word at its
        start, so a verse whose respellings made the counts differ lit only
        its first word. Word by word, each page word keeps its own."""
        if lookup(raw.strip(), cues) is not None or len(raw.split()) < 2:
            add(raw, sub_text(raw, cues, missing))
            return
        for w in raw.split():
            add(w, sub_text(w, cues, missing))

    for chunk in say_split(html, ch):
        if not chunk:
            continue
        if (ch, chunk) in SAY:
            add(clean(TAG.sub(" ", chunk)), render(SAY[(ch, chunk)], cues))
            continue
        for part in PAIR.split(chunk):
            if not part:
                continue
            m = GK.fullmatch(part)
            if m:
                raw = TAG.sub("", m.group(1)).strip()
                greek(raw)
                continue
            plain = clean(TAG.sub(" ", part))
            # Bare Greek in running prose -- Χριστός sits outside any span.
            pieces = BARE_GK.split(plain)
            greeks = BARE_GK.findall(plain)
            for k, piece in enumerate(pieces):
                if piece.strip():
                    add(piece, piece if ch in LEGACY else ENGLISH_RE.sub(
                        lambda m: ENGLISH[m.group(1).lower()], piece))
                if k < len(greeks):
                    greek(greeks[k])
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


def said_hash(text):
    """Twelve hex digits standing for what a clip SAYS.

    Shipped beside each block so check_lesson_audio can re-derive the
    narration and ask whether the clip still says it. The guard in --js
    proves the text matched the audio at build time; this carries that proof
    forward to every later run, when a re-tuned cue would otherwise leave the
    clip saying something the deck no longer teaches -- which is exactly how
    four chapter-2 blocks went stale unnoticed."""
    import hashlib
    return hashlib.sha1(" ".join(text.split()).encode("utf-8")).hexdigest()[:12]


def accents(w):
    """(position, is-circumflex) of the first accent, counted from the end
    of the word, or None for a word with no accent."""
    d = [c for c in unicodedata.normalize("NFD", w.lower())]
    base = [i for i, c in enumerate(d) if not unicodedata.combining(c)]
    for i, c in enumerate(d):
        if c in "̀́͂":
            letter = max(j for j in base if j < i)
            return (len(base) - base.index(letter), c == "͂")
    return None


def same_word(a, b):
    """Could spelling a borrow spelling b's cue? Yes if they differ only by
    case, a grave for an acute, an accent one of them lacks (an enclitic's
    throw-back, an unaccented proclitic), or an extra accent after the first.
    No if the first accent sits on a different letter or one is a circumflex
    and the other not: μενῶ is not μένω, nor εἶ εἰ, nor ἐστίν ἔστιν -- each
    of which, borrowing, said the other word."""
    x, y = accents(a), accents(b)
    if x is None or y is None:
        return not ((x and x[1]) or (y and y[1]))
    return x == y


def lookup(tok, cues):
    e = exact(tok)
    if e in cues:
        return cues[e]
    for key in (soft(tok), flat(tok)):
        if key in cues:
            src = SPELT.get(key)
            # An ending or a stem on its own (-ῶν, πατρ-) is said without
            # stress, so its accent changes nothing about how it sounds.
            frag = tok.strip().startswith(("-", "‑")) or tok.strip().endswith(("-", "‑"))
            if src and not frag and not any(same_word(e, s_) for s_ in src):
                return None
            return cues[key]
    return None


# What joins the words of a span, said aloud. Chapters 3 onwards write rules
# as `βλέπω → βλέψω` and `κ, γ, χ + σ → ξ`, and a span like that has no cue
# as a whole and never will; its words do.
JOIN = {"→": "becomes", "+": "plus", "/": "or"}
TOKEN = re.compile(r"(→|\+|/|,|\s+)")


def sub_text(raw, cues, missing):
    """A run of Greek -> the cue or description an ear has already passed.

    The whole span first, so a phrase with its own cue keeps it. Failing
    that, word by word: a list or a rule is its words and its joins, and a
    word with no cue is reported by itself -- which is what makes the
    missing list something a generator can fill."""
    raw = raw.strip()
    hit = lookup(raw, cues)
    if hit is not None:
        return hit
    out, gap = [], []
    for piece in TOKEN.split(raw):
        if not piece or piece.isspace():
            continue
        if piece in JOIN:
            out.append(JOIN[piece]); continue
        if piece == ",":
            if out:
                out[-1] += ","
            continue
        # -σι(ν): the bracketed nu is optional, and read as a word it is
        # nothing; the ending is said with it.
        word = piece.replace("(", "").replace(")", "")
        hit = lookup(word, cues)
        if hit is None:
            gap.append(word)
            out.append(word)
        else:
            out.append(hit)
    if gap or len(out) == 1 and out[0] == raw:
        missing.extend(gap or [raw])
        return raw if not out else " ".join(out)
    return " ".join(out)


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


# Where a deck cue, heard as a standalone clip, does not hold inside running
# prose. μή's /ˈmeː/ came out "me" in one take and "may" in another of the
# same chapter-3 block; eta is the vowel of "obey", and the alphabet settled
# it as /eɪ/. The deck clip is untouched -- this is what the narration says.
NARRATE = {"μή": "/ˈmeɪ/",
    # Six deck cues are English respellings that write a short omicron as
    # "oh", and in prose "loh goss" is read "low goss" -- three times in
    # chapter 4 alone. Lesson 1 teaches ο as the o of "not". These are the
    # converter's IPA for the same words.
    "λόγος": "/ˈlɒ.ɡɒs/", "ὄχλος": "/ˈɒ.klɒs/",
    "ἐκπορεύομαι": "/ɛk.pɒˈrju.ɒ.mai̯/", "παρέρχομαι": "/paˈrɛr.kɒ.mai̯/",
    "πόθεν": "/ˈpɒ.θɛn/", "ὅθεν": "/ˈhɒ.θɛn/"}

# English words the voice says wrongly. "vocative" came out VOH-cative, the
# vowel of "vocal" (chapter 4). One IPA token for one word, so a tap still
# lands on it.
ENGLISH = {"vocative": "/ˈvɒkətɪv/"}
ENGLISH_RE = re.compile(r"\b(%s)\b" % "|".join(ENGLISH), re.I)


# From this chapter on, every IPA cue's eta and ει is said as the letter and
# diphthong buttons say them, /eɪ/. The deck writes /eː/ and /ei̯/, which held
# as standalone clips and wavered in prose: μή was "me" in one take and "may"
# in the next, and chapter 5's own sentence about alpha and eta put ἡμέρα's
# /heːˈme.ra/ beside its generated forms' /heɪˈmɛ.ras/ -- the same word in two
# vowels, in the one sentence about which vowel it has. Chapters 3 and 4 were
# recorded before this and stay as heard.
VOWELS_FROM = 5


def said_vowels(cue):
    if not cue.startswith("/"):
        return cue
    # And chi as k. Two deck cues keep the throaty /x/, which the ear chose
    # for \u03c7\u03ac\u03c1\u03b9\u03c2 and \u03c7\u03c1\u03b5\u03af\u03b1 as standalone clips; inside prose both takes of
    # chapter 5's last block said \u03c7\u03ac\u03c1\u03b9\u03c2 with an h. Every generated form
    # already has chi as k, which is how the course says it.
    return (cue.replace("e\u02d0", "e\u026a").replace("ei\u032f", "e\u026a")
               .replace("x", "k"))


# ---------------------------------------------------------------- tables ---
#
# A table read aloud, rather than pointed at. Chapters in TABLES_READ only,
# while the way of doing it is being heard.
#
# TWO SHAPES, TWO ORDERS.
#
# A PARADIGM -- persons or cases down the side, numbers or genders across the
# top, a form in every cell -- is read DOWN each column, which is the order
# a paradigm is recited and learned in: λύω, λύεις, λύει, λύομεν, λύετε,
# λύουσι. The column heading is said once, when it changes, and the person
# or case on every form, in full the first time in a column and shortened
# after ("first person", then "second", "third"). That is how a screen reader
# keeps a listener oriented without reading every label on every cell: the
# header is announced when it changes. Then the forms once more, straight
# through, with nothing between them -- the recitation itself.
#
# Anything else is a table of IDEAS and is read ROW by row, each row as a
# sentence: the row's first cell, then each other cell under its column
# heading. TABLE_ROWS can give a table its own sentence shape where the
# heading reads better folded into the words.
#
# Every cell keeps its own words on the page, so the read-along highlights
# each cell as it is said -- in the order it is SAID, which for a paradigm
# is down the columns, not along the rows as the page stores it.
TABLES_READ = {2, 3, 4, 5, 6}

ROWS = re.compile(r"<tr\b[^>]*>(.*?)</tr>", re.S)
CELL = re.compile(r"<(th|td)\b[^>]*>(.*?)</\1>", re.S)
CAPTION = re.compile(r"<caption\b[^>]*>(.*?)</caption>", re.S)

# How a heading is said. Persons shorten after the first in a column.
LABEL = {"1st": "first person", "2nd": "second person", "3rd": "third person",
         "Nom": "nominative", "Gen": "genitive", "Dat": "dative",
         "Acc": "accusative", "Voc": "/ˈvɒkətɪv/",
         "Masc": "masculine", "Fem": "feminine", "Neut": "neuter",
         "you (pl)": "you, plural"}
SHORT = {"1st": "first", "2nd": "second", "3rd": "third"}

# Tables whose rows read better as a sentence of their own, keyed by the
# chapter and the text of the table's first heading. {n} is column n of the
# row, said as it would be in prose.
TABLE_ROWS = {
    (2, "Aspect"): "{0}. Presents the action as {1}. Tenses: {2}.",
    # "In plain terms:" before every row said the heading five times over.
    (2, "What it tells us"): "{0}: {1}.",
    (5, "Preposition"): "{0}, with the {1}: {2}.",
}


def narrate_table(inner, ch, cues, missing):
    """(narration, page words, pairs) for a table, or None to point at it.

    Each cell goes through align() on its own, so its Greek is said as its
    cue and its words keep their place on the page. If the cells' words do
    not add up to the table's words exactly, the table is pointed at as
    before rather than mapped wrongly."""
    if ch >= IPA_TABLES_FROM:
        cues = ipa_twins(cues, ch)
    cap = CAPTION.search(inner)
    grid = [[h for _tag, h in CELL.findall(r)] for r in ROWS.findall(inner)]
    if not grid:
        return None
    heads = [[t == "th" for t, _h in CELL.findall(r)] for r in ROWS.findall(inner)]
    cells = ([(("cap",), cap.group(1))] if cap else []) + [
        ((r, c), h) for r, row in enumerate(grid) for c, h in enumerate(row)]
    per, flatpage = {}, []
    for key, h in cells:
        if TAG.sub("", h).strip():
            t, pw, pr = align(h, ch, cues, missing)
            words = clean(TAG.sub(" ", h)).split()
            if pw != words:
                # λύουσι(ν): align() cuts the bracketed nu off as a word of
                # its own, where the page holds one word. Said whole instead,
                # as sub_text says a form with an optional letter.
                t = sub_text(clean(TAG.sub(" ", h)), cues, missing)
                pw, pr = words, [0] * len(words)
        else:
            t, pw, pr = "", [], []
        per[key] = (t.split(), pw, pr)
        flatpage += pw
    if flatpage != clean(TAG.sub(" ", inner)).split():
        return None

    tokens, at = [], {}

    def say(text):
        tokens.extend(text.split())

    def stop(mark):
        if tokens and tokens[-1][-1] not in ".,;:":
            tokens[-1] += mark

    def cell(key, again=False):
        sp, pw, pr = per[key]
        start = len(tokens)
        tokens.extend(sp)
        if not again and key not in at:
            at[key] = [start + p for p in pr]

    def heard(key):
        """A heading said as a label: its page words point at the label."""
        if key not in at:
            at[key] = [len(tokens)] * len(per[key][1])

    def plain(key):
        return clean(TAG.sub(" ", grid[key[0]][key[1]]))

    def label(key, short=False):
        text = plain(key)
        heard(key)
        if short and text in SHORT:
            say(SHORT[text])
        elif text in LABEL:
            say(LABEL[text])
        else:
            cell(key)

    if cap:
        cell(("cap",))
        stop(".")

    body = range(1, len(grid))
    paradigm = (len(grid) > 1 and all(heads[0])
                and not plain((0, 0))
                and all(heads[r][0] for r in body))
    if paradigm:
        forms = []
        for c in range(1, len(grid[0])):
            label((0, c))
            stop(":")
            for i, r in enumerate(body):
                label((r, 0), short=i > 0)
                stop(",")
                cell((r, c))
                stop(";" if i < len(body) - 1 else ".")
                forms.append((r, c))
        # The recitation: every form once more, straight through. Only where
        # each cell is one form -- "αὐτός / αὐτοί" recited is not a paradigm.
        if all(len(per[k][1]) == 1 for k in forms) and len(forms) <= 12:
            say("Straight through:")
            for n, k in enumerate(forms):
                cell(k, again=True)
                stop("," if n < len(forms) - 1 else ".")
    else:
        first = plain((0, 0)) if all(heads[0]) else ""
        shape = TABLE_ROWS.get((ch, first))
        rows = body if all(heads[0]) else range(len(grid))
        for r in rows:
            if shape:
                for part in re.split(r"(\{\d\})", shape):
                    m = re.fullmatch(r"\{(\d)\}", part)
                    if m:
                        cell((r, int(m.group(1))))
                    elif part.strip():
                        if part[0] in ".,;:" and tokens:
                            tokens[-1] += part[0]
                            part = part[1:]
                        say(part)
                continue
            cell((r, 0))
            stop(".")
            for c in range(1, len(grid[r])):
                if all(heads[0]) and plain((0, c)):
                    label((0, c))
                    stop(":")
                cell((r, c))
                stop(".")

    pairs = []
    for key, _h in cells:
        n = len(per[key][1])
        got = at.get(key, [])[:n]
        # A heading never said -- TABLE_ROWS folds some into the sentence --
        # points at the start of the table.
        pairs += got + [0] * (n - len(got))
    return " ".join(tokens), flatpage, pairs


# ---------------------------------------------------------------- verses ---
#
# A quoted verse read aloud, in chapters in VERSES_READ, while the way of
# doing it is being heard. The reference is said the way a reader says it --
# "Mark 1, verse 40" -- then the Greek, each word its cue, then the lesson's
# own prose carries on, which in almost every case begins with the English.
# That is how a teacher reads a text to a class: where it is, what it says,
# what it means.
#
# Each Greek word keeps its page word, so the read-along lights each word as
# it is said. Greek punctuation is said as its function, not its shape: the
# question mark (;) as a question, the raised dot (·) as a pause.
VERSES_READ = {3, 4, 5, 6}

ORDINAL = {"1": "First", "2": "Second", "3": "Third"}


def speak_ref(ref):
    """'1 Thessalonians 5:16-18' -> 'First Thessalonians 5, verses 16 to 18'."""
    m = re.fullmatch(r"(?:([123]) )?(.+?) (\d+):(\d+)(?:[-–](\d+))?", ref.strip())
    if not m:
        return ref
    n, book, chap, v1, v2 = m.groups()
    book = (ORDINAL[n] + " " + book) if n else book
    if v2:
        return "%s %s, verses %s to %s" % (book, chap, v1, v2)
    return "%s %s, verse %s" % (book, chap, v1)


# Inside a verse only, where a deck respelling reads wrongly among IPA words.
# The article's "haw" came out "how" in John 6:48; /ˈhɒ/ is the form cue an
# ear chose for ὁ in the extra-forms round. Prose keeps the deck's cue, which
# approved blocks were recorded with.
VERSE_SAY = {"ὁ": "/ˈhɒ/"}


def narrate_verse(inner, ref, ch, cues, missing):
    """(narration, page words, pairs) for a quoted verse, or None."""
    cues = ipa_twins(cues, ch) if ch >= IPA_VERSES_FROM else dict(cues)
    for k, v in VERSE_SAY.items():
        cues[exact(k)] = v
        cues[soft(k)] = v
    t, pw, pr = align(inner, ch, cues, missing)
    if not t or pw != clean(TAG.sub(" ", inner)).split():
        return None
    # PACING (Fraser, 2026-09-24, from five pacings of Matthew 28:6): a comma
    # after every Greek word, so each is heard as a word, and where the verse
    # has punctuation of its own -- a comma or a raised dot -- an ellipsis,
    # the longer pause, so its grammar still comes through. Slowing the voice
    # was tried and not chosen.
    words = t.split()
    last = len(words) - 1
    # The pause goes after each Greek WORD: a deck respelling can be several
    # tokens ("e goh" for \u1f10\u03b3\u03ce), and a comma inside it split the word in two.
    starts = sorted(set(pr))
    ends = {s - 1 for s in starts[1:]} | {last}
    for i, w in enumerate(words):
        if i not in ends:
            continue
        if w == "\u00b7":
            words[i] = "\u2026"                  # a pause, one token for one
        elif w.endswith(";") or w.endswith("\u037e"):
            words[i] = w[:-1] + "?"
        elif w.endswith(",") or w.endswith("\u00b7"):
            words[i] = w[:-1] + ("\u2026" if i < last else ".")
        elif i < last and w[-1] not in ".!?\u2026":
            words[i] = w + ","
    if words and words[-1][-1] not in ".?!":
        words[-1] = words[-1].rstrip(",") + "."
    lead = (speak_ref(ref) + ":").split()
    return (" ".join(lead + words), pw, [p + len(lead) for p in pr])


def later(cues, ch=0):
    """The table as a chapter after LEGACY sees it: DESCRIBE's wording for
    marks gives way to the plain letter name."""
    c = dict(cues)
    # CUES are chapter 1 and 2's hand respellings -- "loo o men" -- and in a
    # later chapter's paradigm they would sit among generated IPA forms of
    # the same verb. Later chapters take the generated cue instead.
    for k in CUES:
        if k != "·":
            c.pop(flat(k), None)
            if exact(k) in SHEET:
                c[exact(k)] = SHEET[exact(k)]
            else:
                c.pop(exact(k), None)
    for k, v in NARRATE.items():
        c[exact(k)] = v
        # μὴ with a grave, or a capital in a verse, is still μή.
        c[soft(k)] = v
    for k in DESCRIBE:
        e = exact(k)
        if e not in LETTER_NAMES and k not in CUES:
            c.pop(e, None)
    # Every letter by the name its button says, so a list like κ, γ, χ + σ
    # is said in one voice rather than half plain English and half IPA.
    c.update(LETTER_NAMES)
    if ch >= VOWELS_FROM:
        c = {k: said_vowels(v) for k, v in c.items()}
    if ch >= IPA_PROSE_FROM:
        c = ipa_twins(c, ch)
    for k, (start, v) in NARRATE_FROM.items():
        if ch >= start:
            c[exact(k)] = v
    return c


# As NARRATE, but only from the chapter named, because the chapter where the
# fault was heard had already been chosen with it. χάρις with chi as k still
# had the a of "carry", where lesson 1 teaches the a of "father" (chapter 5,
# block 10 -- kept, as the better of two takes).
NARRATE_FROM = {"χάρις": (6, "/ˈkɑrɪs/")}


def blocks_for(les, cues, missing):
    """Each block carries four things now: what it is, what the voice says,
       the words as they appear ON THE PAGE, and which spoken word each of
       those became. The last two are what a tap needs."""
    if les["id"] not in LEGACY:
        cues = later(cues, les["id"])
    out = []
    # el is the position of this element among the body's blocks, which is how
    # the app finds it again: the narration merges elements together, so a
    # block has to be able to say which ones it swallowed.
    for el, m in enumerate(BLOCK.finditer(les["body"])):
        kind, attrs, inner = m.group(1), m.group(2), m.group(3)
        page = clean(TAG.sub(" ", inner)).split()
        if kind == "div":
            # A placeholder the app fills. Narrated if PLACEHOLDER names it,
            # and otherwise passed over rather than guessed at.
            hit = re.search(r'id="([^"]+)"', attrs)
            say = PLACEHOLDER.get((les["id"], hit.group(1) if hit else ""))
            if say:
                out.append(("look", say, page, [0] * len(page), [el]))
            continue
        if kind == "table":
            read = (narrate_table(inner, les["id"], cues, missing)
                    if les["id"] in TABLES_READ else None)
            if read:
                out.append(("prose",) + read + ([el],))
                continue
            # Nothing on the page maps into a pointer, so every word of the
            # table seeks to the start of it. Better than no seek at all.
            out.append(("table", "The table for this is on screen.", page,
                        [0] * len(page), [el]))
            continue
        # A quoted verse: the Greek is dropped and the English around it kept.
        if 'class="v"' in attrs or "data-ref=" in attrs:
            ref = re.search(r'data-ref="([^"]+)"', attrs)
            if les["id"] in VERSES_READ and ref:
                read = narrate_verse(inner, ref.group(1), les["id"], cues,
                                     missing)
                if read:
                    out.append(("prose",) + read + ([el],))
                    continue
            out.append(("verse", "The Greek of %s is on screen."
                        % (ref.group(1) if ref else "the verse"),
                        page, [0] * len(page), [el]))
            continue
        plain = TAG.sub(" ", inner)
        look = next((v for (ch, start), v in LOOK.items()
                     if ch == les["id"] and " ".join(plain.split()).startswith(start)),
                    None)
        if look:
            # A rewritten block: the sentences are not the page's sentences,
            # so the whole paragraph seeks to its own beginning.
            out.append(("look", look, page, [0] * len(page), [el]))
            continue
        t, page_words, pairs = align(inner, les["id"], cues, missing)
        if t:
            out.append(("heading" if kind in ("h2", "h3") else "prose",
                        t, page_words, pairs, [el]))
    return merge(out, stop=les["id"] not in LEGACY)


# A block is a thing someone might press play on. "Accents" is not: it is one
# word and a second and a half, and 22 of the first 59 blocks were like it --
# bare headings, and the one-line pointers at a table. Nobody plays those
# alone, so they are folded into the prose they belong to.
MIN_WORDS = 30


def merge(blocks, stop=False):
    """Headings join the block after them; anything still short joins the
       block before. Repeated until nothing moves, because folding two short
       blocks together can leave a third still short."""
    def join(a, c):
        """Two blocks into one. The second block's pairs shift by however many
           spoken words the first contributes, or every tap in the back half
           of a merged block seeks to the front half."""
        shift = len(a[1].split())
        head = a[1].rstrip()
        # A heading has no full stop on the page, and joined to its prose it
        # ran on: "Saying no Greek has two negatives". stop= is off for
        # LEGACY, whose clips were recorded without it.
        if stop and head and head[-1] not in ".!?:;—":
            head += "."
        return [a[0] if a[0] != "heading" else c[0],
                head + " " + c[1].lstrip(),
                a[2] + c[2],
                a[3] + [p + shift for p in c[3]],
                a[4] + c[4]]

    out = []
    for kind, text, page, pairs, els in blocks:
        if kind == "heading":
            out.append(["heading", text, page, pairs, els])  # settled next pass
            continue
        if out and out[-1][0] == "heading":
            out.append(join(out.pop(), ["prose", text, page, pairs, els]))
            continue
        out.append([kind, text, page, pairs, els])
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
    ap.add_argument("--js", nargs="?", const="data/lesson_audio.js",
                    help="write data/lesson_audio.js, the file the app loads")
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
        for i, (kind, text, page, pairs, els) in enumerate(bs):
            bid = "l%02d_%02d" % (les["id"], i)
            rows.append((bid, text))
            mapping.append({"id": bid, "ch": les["id"], "kind": kind,
                            "spoken": text, "page": page, "pairs": pairs,
                            "els": els})
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

    if args.map or args.js:
        if not args.timestamps:
            sys.exit("--map and --js need --timestamps, probe_xai's alignment")
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
                        "els": b["els"], "page": b["page"], "t": secs,
                        "h": said_hash(b["spoken"])})
            if e.get("tiles"):
                # [start, end, greek] for each clip spliced into the block.
                out[-1]["tiles"] = e["tiles"]
        if bad:
            print("\nCLIPS THAT DO NOT MATCH THE LESSON (%d) — regenerate these\n"
                  "before the map ships, or a tap seeks into audio that says\n"
                  "something else:" % len(bad))
            for i, why in bad:
                print("  %s  %s" % (i, why))
        n = sum(len(b["page"]) for b in out)
        if args.map:
            io.open(args.map, "w", encoding="utf-8", newline="\n").write(
                json.dumps(out, ensure_ascii=False) + "\n")
            print("wrote %s — %d of %d blocks, %d page words with a seek time"
                  % (args.map, len(out), len(mapping), n))
        if args.js:
            # What the app actually loads. `kind` is a build-time label and
            # is dropped; `d` is measured from the clip on disk, because the
            # app sums it for "N minutes" and the checker holds every seek
            # time inside it. Nothing regenerated either before this.
            rows = []
            for b in out:
                r = dict((k, v) for k, v in b.items() if k != "kind")
                r["d"] = clip_seconds(os.path.join("audio", "lessons",
                                                   b["id"] + ".mp3"))
                rows.append(r)
            io.open(args.js, "w", encoding="utf-8", newline="\n").write(
                JS_HEADER + "const LESSON_AUDIO = "
                + json.dumps(rows, ensure_ascii=False) + ";\n")
            print("wrote %s - %d blocks, %d page words, %.1f minutes of audio"
                  % (args.js, len(rows), n, sum(r["d"] for r in rows) / 60))
        if bad:
            sys.exit(1)

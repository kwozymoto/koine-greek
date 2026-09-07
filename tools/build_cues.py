# -*- coding: utf-8 -*-
"""First-pass Atlas cues for the VOCAB entries that have no clip yet.

    python tools/build_cues.py                  # the work list, as a table
    python tools/build_cues.py --json out.json  # machine-readable

WHAT THIS IS. docs/atlas-cue-guide.md is 251 lines of rules derived from the
511 clips already recorded — what the working cues do, and what each failed
clip had to be changed to. This applies those rules mechanically to the words
that have no clip, and then runs the guide's own nine failure modes back over
what it produced.

WHAT THIS IS NOT. The guide's second paragraph is the important one:

    This is a procedure, not a formula. Atlas is not deterministic: the same
    `pahss` that once split into "pa has" was later read correctly. Expect to
    produce two or three candidates and choose by ear.

So every cue below is a CANDIDATE. It has not been heard. The flags say which
ones the guide predicts will misread, and those are where to start listening.
A clean flag column means "no known failure mode applies", not "this is
right".

Two cues per word, per the guide's step 6: one spaced, one partly bound. Keep
the shorter that does not spell, at roughly 0.5s a syllable.

The Greek is read out of data/vocab.js. Nothing here is typed from memory.
"""
import argparse
import collections
import io
import json
import os
import re
import sys
import unicodedata

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ------------------------------------------------------------ the tables ---
# Straight out of docs/atlas-cue-guide.md section 1. Digraphs are checked
# before single letters, which the guide puts in bold for a reason: αι is not
# α + ι.
DIPH = {
    "αι": "eye", "ει": "ay", "οι": "oy", "υι": "wee",
    "αυ": "ow", "ευ": "ew", "ηυ": "ew", "ου": "oo",
}
LETTER = {
    "α": "ah", "β": "b", "γ": "g", "δ": "d", "ε": "eh", "ζ": "dz",
    "η": "ay", "θ": "th", "ι": "ee", "κ": "k", "λ": "l", "μ": "m",
    "ν": "n", "ξ": "ks", "ο": "o", "π": "p", "ρ": "r", "σ": "s",
    "ς": "s", "τ": "t", "υ": "oo", "φ": "f", "χ": "kh", "ψ": "ps",
    "ω": "oh",
}
VOWELS = set("αεηιουω")
# a rough breathing on an initial vowel adds an h [58/59 of the pack]
ROUGH = set("̔")

# Endings, which is where most words end up (guide section 1, last table).
# Longest first so -ευω wins over -ω.
ENDINGS = [
    ("ομαι", "o my"), ("ευω", "ew oh"), ("ιον", "ee on"), ("ευς", "ews"),
    ("αω", "ah oh"), ("εω", "eh oh"), ("οω", "o oh"), ("ια", "ee ah"),
    ("μα", "mah"), ("ος", "oss"), ("ον", "on"), ("ης", "ays"),
    ("ας", "ahs"), ("ις", "ees"), ("ω", "oh"), ("η", "ay"), ("α", "ah"),
]

# ------------------------------------------------------- failure modes -----
LETTER_NAMES = set("""ay bee see dee ee eff gee jay kay ell em en oh pee cue
ar ess tee you vee ex why zee""".split())

# Guide failure 2: a cue that spells an English word gets the dictionary's
# vowels and stress. Only the ones a Greek cue can plausibly land on; an
# English word is fine when its vowels and stress already match (σός →
# `sauce` is a lock), so this flags for a listen, it does not forbid.
ENGLISH = set("""
ego echo eco hero halo solo polo photo auto moto memo demo taco tempo
mango tango limbo lotto motto ditto potato tomato piano patio ratio radio
audio video ohio oreo casino domino kimono
theos simon aeon eon peon neon leon
ash apes ape apt art arts age ages air airs also alto amen anon ante
bass base bats bays beat bees bell belt best bets bird boss bolt bone boot
call calm cane cape card care cast cave cell cent chin coal coat code coin
cold cone cool coos cope core corn cost cots
dais dam damn dare dark dart date dawn days dean dear deed deem deep deer
dell demon depot dial dice diet dime dine dive dole dome done doom door dose
dote dove down doze
ease east easy eaten eater eaves edit eels elan elbow elder elect elm else
epic equal era erase erode error ether even ever evil exit eyes
face fade fail fair fake fall fame fang fare farm fast fate fawn fear feast
feat feed feel fees feet fell felt fend fern fete feud file fill film filth
find fine fire firm fish fist five flee flew flow foam foil fold folk fond
font food fool foot ford fore fork form fort foul four fowl free fret from
fuel full fume fund fuse fuss
gain gale gall game gang gaol gape garb gate gave gaze gear geese gems gene
gets ghost gift gill gilt girl give glad glee glen glow glue goal goat goes
gold golf gone gong good goose gore gorse gout gown grab gram gray grew grim
grin grip grow gulf gull gulp gust
hail hair hale half hall halt hand hang hard hare harm harp hart hash haste
hate haul have hawk hays haze head heal heap hear heat heed heel heir held
hell helm help hemp hens herd here hero hers hewn hide high hike hill hilt
hind hint hire hive hoax hold hole holy home hone hood hoof hook hoop hope
horn hose host hour howl hues huge hulk hull hunt hurl hurt hush husk hymn
ice icon idea idle idol ills inch into iron isle item
kale keel keen keep kelp kept kerb kern keys kick kiln kilt kind kine king
kiss kite knee knew knit knob knot know
lace lack lade lady laid lain lair lake lamb lame lamp land lane lard lark
lash lass last late lath laud lava lawn lays lead leaf leak lean leap left
lend lens lent less lest lets levy liar lice lick lied lien lies life lift
like lily limb lime limp line link lint lion lisp list live load loaf loam
loan lobe lock lode loft logo loin lone long look loom loon loop loose lord
lore lose loss lost loth loud lout love lows luck lull lump lung lure lurk
lush lute lynx
maid mail maim main make male mall malt mane many maps mare mark marl mars
mart mash mask mass mast mate math maul maze mead meal mean meat meed meek
meet meld melt memo mend menu meow mere mesh mess mete mica mice mild mile
milk mill mime mind mine mint mire miser mist mite moan moat mock mode mole
molt monk mood moon moor moot mope more morn moss most moth move much muck
mule mull mush must mute myth
name nape nave navy near neat neck need nest nets neve news next nice niche
nick nigh nine node nook noon norm nose note noun nova nude null numb nurse
oath obey oboe odds odes odor ogle oils oink oleo omen omit once ones only
onto onus onyx ooze opal open opts opus oral orbs ores organ ouch ours oust
outs oval oven over owed owes owls owns oxen
pace pack pact page paid pail pain pair pale pall palm pane pang pant papa
pare park part pass past pate path pave pawn pays peak peal pear peas peat
peck peel peep peer pelt pens pent peon pest pets pews pick pier pike pile
pill pine pink pint pipe pith pity plan play plea pled plod plot plow ploy
plug plum plus pods poem poet poke pole poll polo pomp pond pony pool poor
pope pore pork port pose posh post pots pour pout pray prey prim prod prop
prow puck pull pulp pump punk pure purl push puss
race rack raft rage raid rail rain rake ramp rang rank rant rape rapt rare
rash rate rave rays raze read real ream reap rear reed reef reek reel reign
rein rely rend rent rest rich ride rife rift rile rill rime rind ring rink
riot ripe rise risk rite road roam roar robe rock rode rods roil role roll
romp rood roof rook room root rope rose rosy rote rout rove ruby rude ruin
rule rump rune rung runt ruse rush rust ruth
sack safe sage said sail sake sale salt same sand sane sang sank sash sate
save sawn says scan scar seal seam sear seas seat sect seed seek seem seen
seep seer self sell send sent sets sewn shed shim shin ship shod shoe shop
shot show shun shut sick side sift sigh sign silk sill silo silt sine sing
sink site size skew skid skin skip slab slam slap slat sled slew slid slim
slip slit slob sloe slop slot slow slug slum slur smug snap snip snob snow
snub snug soak soap soar sock soda sofa soft soil sold sole solo some song
soon soot sore sort soul soup sour sown span spar spat sped spew spin spit
spot spry spun spur stab stag star stay stem step stew stir stop stow stub
stud stun such suck suds sued suet suit sulk sung sunk sure surf swab swam
swan swap swat sway swim swum
tack tact tail take tale talk tall tame tang tank tape taps tare tarn tart
task tate taut teak teal team tear teas teat tell temp tend tens tent term
tern test text thaw thee them then thin this thou thud thus tick tide tidy
tied tier ties tile till tilt time tine tint tiny tire toad toast toes toil
told toll tomb tone tong took tool toot tore torn tort toss tote tour tout
town toys tram trap tray tree trek trim trio trip trod troop trot true tube
tuck tuft tug tune turf turn tusk tutu twig twin twit type tyre
urge urns used user uses
vain vale vane vase vast veal veer veil vein vent verb verse vest veto vice
view vile vine viol visa vise void volt vote vowed vows
wade wafer wage wail wait wake wale walk wall wand wane want ward ware warm
warn warp wars wart wary wash wasp watt wave wavy waxy ways weak weal wean
wear weds week weep weft weld well welt wend went wept were west whet whey
whim whip whir whit whom wick wide wife wild wile will wilt wind wine wing
wink wipe wire wise wish wisp with wits woes woke wolf womb wont wood wool
word wore work worm worn wove wrap writ
yard yarn yawn year yeas yell yelp yoke yolk yore your yule
zeal zero zest zinc zone zoom
""".split())


def strip_marks(w):
    """Accents and breathings off, letters kept."""
    d = unicodedata.normalize("NFD", w)
    return "".join(c for c in d if not unicodedata.combining(c)).lower()


def has_rough(w):
    """A rough breathing anywhere in the first vowel cluster, or initial rho."""
    d = unicodedata.normalize("NFD", w)
    for c in d[:4]:
        if c in ROUGH:
            return True
    return False


ACUTE, GRAVE, CIRC = "́", "̀", "͂"


def accent_syllable(word, syls):
    """Which syllable index carries the written accent, or None.

       Guide section 3: Greek marks its own stress, and Atlas has no stress
       mark, so it has to come out of the vowel length. λόγος ships as
       `loh goss` — a long `oh` for an omicron — because the accent is on the
       first syllable. ἔτι's `tee` was wrong for the same reason in reverse:
       long where the word is short."""
    d = unicodedata.normalize("NFD", word).lower()
    pos, seen = None, 0
    plain = []
    for ch in d:
        if unicodedata.combining(ch):
            if ch in (ACUTE, GRAVE, CIRC) and pos is None:
                pos = len(plain) - 1
        else:
            plain.append(ch)
    if pos is None:
        return None
    # walk the syllables counting base characters until we pass pos
    n = 0
    for i, s in enumerate(syls):
        n += len(s)
        if pos < n:
            return i
    return None


def syllables(bare):
    """Split Greek into syllables: each nucleus is a vowel or a diphthong,
       and a single intervocalic consonant opens the next syllable. Crude but
       enough to decide where to put the spaces, which is all the cue needs."""
    i, out = 0, []
    nuclei = []
    while i < len(bare):
        two = bare[i:i + 2]
        if two in DIPH:
            nuclei.append((i, 2))
            i += 2
        elif bare[i] in VOWELS:
            nuclei.append((i, 1))
            i += 1
        else:
            i += 1
    if not nuclei:
        return [bare]
    for n, (start, ln) in enumerate(nuclei):
        left = 0 if n == 0 else nuclei[n - 1][0] + nuclei[n - 1][1]
        cons = bare[left:start]
        # one consonant goes with the following vowel; two or more split
        if n == 0:
            head = bare[:start] + bare[start:start + ln]
        else:
            keep = cons[-1:] if len(cons) >= 1 else ""
            out[-1] += cons[:-1] if len(cons) > 1 else ""
            head = keep + bare[start:start + ln]
        out.append(head)
    tail = bare[nuclei[-1][0] + nuclei[-1][1]:]
    out[-1] += tail
    return [s for s in out if s]


def cue_for_syllable(syl, first, next_starts_vowel):
    """Map one syllable to an English respelling."""
    out, i = "", 0
    while i < len(syl):
        two = syl[i:i + 2]
        if two in DIPH:
            out += DIPH[two]
            i += 2
            continue
        ch = syl[i]
        rest = syl[i + 1:]
        if ch == "γ":
            # guide failure 6: gamma is always hard, so gh before an e/i sound
            nxt = rest[:1]
            out += "gh" if nxt in ("ε", "ι", "η") else "g"
        elif ch == "ζ":
            out += "dz" if (first and i == 0) else "z"
        elif ch == "ι" and first and i == 0 and rest[:1] in VOWELS:
            # `y` is the JOINING device for word-initial Ἰ-, per the guide's
            # note that "`yoo` for Ἰου- is a joining device, not a rule about
            # iota". Everywhere else iota is `ee`, which is what makes
            # καρδία come out `kahr dee ah` rather than `kahr dyah`.
            out += "y"
        else:
            out += LETTER.get(ch, ch)
        i += 1
    return out


def build(word):
    """Return (spaced, bound) candidate cues for a bare citation form.

       The endings table is NOT applied by chopping the ending off: doing that
       orphans its onset consonant, which turned γαμέω into `gahm eh oh`
       instead of `gah meh oh` and μισθός into `meesth oss` instead of
       `mees thoss`. Syllabify the whole word instead — nearly every row of
       the guide's ending table then falls out of the letter table on its own
       (-αω, -εω, -ευω, -ης, -ευς, -μα, -ω, -η, -α all do). The few that do
       not are fixed up afterwards, below."""
    bare = strip_marks(word)
    rough = has_rough(word)

    syls = syllables(bare)
    toks = [cue_for_syllable(s, n == 0, False) for n, s in enumerate(syls)]

    # Vowel length is NOT derived here, and that is deliberate. The obvious
    # rule — lengthen the accented syllable — is contradicted by the shipped
    # cues themselves: λόγος takes a long `loh` on its accented omicron, but
    # πληρόω takes a short `ro` on its accented omicron, because the omega
    # after it already supplies an `oh`. An attempt at the rule also
    # shortened every verb's final omega (`gah meh o` for γαμέω), which is
    # simply wrong — omega is long whatever the accent does.
    #
    # So the letter table is followed literally and the accent is REPORTED
    # instead, which is what guide section 3 actually asks a human to check:
    # that the stress lands where Greek marks it.
    acc = accent_syllable(word, syls)
    toks = [t for t in toks if t]

    # The two endings the letter table still gets wrong. Touch only the
    # ending's own letters: replacing the last TWO tokens for -ομαι deleted
    # the chi out of ἔρχομαι, which is how `air kho my` became `ehr o my`.
    if bare.endswith("αι") and toks and toks[-1].endswith("eye"):
        toks[-1] = toks[-1][:-3] + "y"          # -μαι -> `my`, guide [22]
    if bare.endswith("ος") and toks and toks[-1].endswith("os"):
        toks[-1] += "s"                          # λόγος -> `goss`, guide [110]

    if rough and toks and not toks[0].startswith("h"):
        toks[0] = "h" + toks[0]

    spaced = " ".join(toks)

    # guide failure 9: join about two syllables per token, not the whole word;
    # guide failure 5: closing a space can wake a silent h, so drop it
    joined = []
    for n in range(0, len(toks), 2):
        pair = toks[n:n + 2]
        b = "".join(pair)
        if len(pair) == 2:
            # Guide failure 5: `ah`/`eh`/`oh` spell vowels and the h is not a
            # sound, but inside a closed token Atlas sometimes says it anyway
            # — πρῶτος `prohtos` came out "pro-ho-tos". The substitution has
            # to run on the JOINED string: looking only inside the first half
            # misses the h at its boundary, which is exactly where it lands.
            b = re.sub(r"([aeo])h(?=[a-z])", r"\1", b)
        joined.append(b)
    bound = " ".join(joined)
    stress = toks[acc] if (acc is not None and acc < len(toks)) else ""
    return spaced, bound, stress


def flags(word, spaced, bound):
    """The guide's nine failure modes, run back over what we produced."""
    f = []
    toks = spaced.split()
    if any(c.isupper() for c in spaced + bound):
        f.append("CAPITAL")                                     # failure 1
    for cand, label in ((spaced, "spaced"), (bound, "bound")):
        flat = cand.replace(" ", "")
        if flat in ENGLISH:
            f.append("SPELLS-EN(%s:%s)" % (label, flat))        # failure 2
    for t in toks:
        if t in ENGLISH and len(toks) == 1:
            f.append("SPELLS-EN(%s)" % t)
    if toks and all(t in LETTER_NAMES for t in toks):
        f.append("ALL-LETTER-NAMES")                             # failure 3
    if len(toks) >= 5:
        f.append("LONG(%d beats)" % len(toks))                   # failure 4
    if re.search(r"[aeo]h[a-z]", bound):
        f.append("SILENT-H-IN-BOUND")                            # failure 5
    if re.search(r"g[ei]", spaced + bound):
        f.append("SOFT-G")                                       # failure 6
    # Guide failure 7 is about a doubled CONSONANT splitting — πᾶς `pahss`
    # came out "pa has". It is not about `ee` and `oo`, which are the guide's
    # own spellings for iota and upsilon, nor about the `ss` of `-oss`, which
    # is the guide's own ending for -ος in 110 shipped clips. Checking for any
    # repeated character flagged 174 of 307 words, most of them for following
    # the guide correctly.
    flat = spaced.replace(" ", "")
    dbl = re.search(r"([bcdfgjklmnpqrstvwxz])\1", re.sub(r"ss$", "", flat))
    if dbl:
        f.append("DOUBLED(%s)" % (dbl.group(0)))                 # failure 7
    bare = strip_marks(word)
    if bare[:2] in ("πν", "πτ", "κν", "γν", "βδ", "χθ", "φθ", "μν"):
        f.append("CLUSTER(%s- may need a helper vowel)" % bare[:2])  # failure 8
    return f


def load_vocab():
    src = io.open(os.path.join(ROOT, "data", "vocab.js"), encoding="utf-8").read()
    pat = r'^\["((?:[^"\\]|\\.)*)","((?:[^"\\]|\\.)*)",(\d+),"([a-z]+)",(\d+)\]'
    rows = re.findall(pat, src, re.M)
    if not rows:
        sys.exit("could not parse data/vocab.js")
    return rows


def load_audio():
    src = io.open(os.path.join(ROOT, "data", "audio.js"), encoding="utf-8").read()
    m = re.search(r"const VOCAB_AUDIO\s*=\s*\[(.*?)\];", src, re.S)
    if not m:
        sys.exit("could not find VOCAB_AUDIO in data/audio.js")
    return re.findall(r'"([^"]*)"', m.group(1))


def translit(word):
    """The filename's transliteration, matching the convention already in
       audio/vocab/ — plain ascii, no accents, no breathing h."""
    bare = strip_marks(word)
    table = {"α": "a", "β": "b", "γ": "g", "δ": "d", "ε": "e", "ζ": "z",
             "η": "e", "θ": "th", "ι": "i", "κ": "k", "λ": "l", "μ": "m",
             "ν": "n", "ξ": "x", "ο": "o", "π": "p", "ρ": "r", "σ": "s",
             "ς": "s", "τ": "t", "υ": "u", "φ": "ph", "χ": "ch", "ψ": "ps",
             "ω": "o"}
    return "".join(table.get(c, "") for c in bare)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--json")
    args = ap.parse_args()

    VOCAB = load_vocab()
    FILES = load_audio()
    disk = set(os.listdir(os.path.join(ROOT, "audio", "vocab")))
    RETIRED = {237}

    rows = []
    for i, (head, gloss, freq, pos, tier) in enumerate(VOCAB):
        if i in RETIRED:
            continue
        f = FILES[i] if i < len(FILES) else ""
        if f and f in disk:
            continue
        word = head.split(",")[0].strip()
        spaced, bound, stress = build(word)
        rows.append({
            "i": i,
            "file": "%03d_%s.mp3" % (i, translit(word)),
            "greek": word,
            "gloss": gloss,
            "freq": int(freq),
            "pos": pos,
            "spaced": spaced,
            "bound": bound,
            "syllables": len(spaced.split()),
            "stress": stress,
            "flags": flags(word, spaced, bound),
        })

    print("VOCAB entries: %d (1 retired)   clips on disk: %d   still needed: %d"
          % (len(VOCAB), len(disk), len(rows)))
    if rows:
        print("indices %d to %d   frequency %d down to %d"
              % (rows[0]["i"], rows[-1]["i"], rows[0]["freq"], rows[-1]["freq"]))
    fc = collections.Counter(fl.split("(")[0] for r in rows for fl in r["flags"])
    print()
    print("predicted failure modes, from the guide's own nine:")
    for k, v in fc.most_common():
        print("   %-22s %d" % (k, v))
    print("   %-22s %d" % ("(no flag)", sum(1 for r in rows if not r["flags"])))

    if args.json:
        json.dump(rows, io.open(args.json, "w", encoding="utf-8"),
                  ensure_ascii=False, indent=1)
        print("\nwrote %s" % args.json)
        return

    print()
    print("%-4s %-13s %-21s %-22s %-8s %-20s %s"
          % ("idx", "greek", "cue (spaced)", "cue (bound)", "stress",
             "gloss", "flags"))
    print("-" * 140)
    for r in rows:
        print("%-4d %-13s %-21s %-22s %-8s %-20s %s"
              % (r["i"], r["greek"], r["spaced"], r["bound"], r["stress"],
                 r["gloss"][:20], " ".join(r["flags"])))


if __name__ == "__main__":
    main()

# Writing an Atlas cue for a Koine Greek word

A reference for generating pronunciation clips for the Koine Greek app. Give
it a Greek word; it should produce a cue string Atlas reads correctly.

Every rule below comes from the 511 clips already in the pack — either from
what the working cues do, or from a specific clip that failed and had to be
re-recorded. Counts in brackets are how many of the 511 back the rule.

---

## What the 511–817 round changed

The tail was recorded afterwards, and twenty-eight of its cues were locked by
ear. **Where they clash with the tables below, these win** — they were
arrived at by listening, and the tables by reading. Each is in
`docs/erasmian_vocab_cues_v4_tail.json` with `source: "ear"`.

| | the tables below say | the ear says | why |
|---|---|---|---|
| ζ | `dz` word-initial | **`z`** | the pack spells the d |
| -εω | `eh oh` | **`eh hoe`** | γαμέω `gah meh hoe`, τελέω `teh leh hoe` |
| **προσ-** only | `pro` | **`pross`** | the sigma, not the vowel — see below |
| αι after a consonant | `keye` | **`kai`** | `keye` splits; `kai`/`mai`/`rye` do not |
| θι | `thee` | **`thi`** | the iota is short |
| ας | — | **`ahs`**, never `ass` | an English word, and the wrong vowel |
| ῥ- | (took the rough breathing) | **plain `r`** | the mark on rho is not the vowel rule |
| ξ- word-initial | `ks` | **`ax`** | English has no word beginning *ks* |

**`pross` is about the sigma, and the reason this table used to give was
wrong.** It said `pro` is "the omega sound, as in *professional*" — and
*professional* has a schwa in that syllable, so the example did not even
support the claim. Tested across seven words on 2026-09-11:

| | kept or moved |
|---|---|
| προσέρχομαι, πρόσωπον, προσκυνέω, προσευχή | all moved to **`pross`** |
| **πρό, πρόβατον** | **kept `pro`** |

So: a προσ- word takes `pross`, because a bare `pro` drops the sigma. A προ-
word with no sigma keeps `pro`. Nine heard clips spell a short omicron as a
bare open syllable — μόνος `mo noss`, τόπος `to poss`, φόβος `fo boss`,
σοφός `so foss`, θρόνος `thro noss` — and πρό is one of them.

**And a limit this exposed, which is worth more than the rule.** ο and ω are
separated everywhere the pack can manage it — φωνή `foh nay` against τόπος
`to poss`, and πρόσωπον `pross oh pon` carrying both in one word. It cannot
be managed in `pro`. πρό is an omicron and πρῶτος an omega; both are spelled
`pro`, both were listened to side by side against those two references, and
both were kept. English stress lengthens a stressed open vowel, so a stressed
`pro` drifts towards the omega whatever we write. **Lesson 1 teaches that ο
and ω are different sounds, and in this one environment the audio does not
carry the difference.** That is a known gap, not an oversight, and the next
person to notice it should read this rather than re-run the experiment.

**Closing the syllable is a remedy, not a rule, and the difference matters.**
When an ear says a stressed omicron has drifted long, putting a consonant in
front of the next vowel forces it short — English spells a short vowel before
a doubled consonant, *hopping* against *hoping*. It has now worked three
times: πρός `pross`, the four προσ- compounds, and πρόβατον, which went from
`pro bah ton` to **`probbah ton`** on 2026-09-11.

**And there is a predictor, which this guide denied for one commit.** This
paragraph used to say the drift could not be predicted, on the strength of
three heard clips that spelled English *gold*-vowel words and had been kept:
χρόνος `crow noss`, σοφός `so foss` and πρό `pro`. Fraser re-heard the first
two against τόπος and φωνή the same day and **both were faults** — they had
been passed before the omicron/omega question was being asked at all. χρόνος
is now `chronoss` and σοφός `sawfoss`.

So the guess looks right: **a cue drifts long when its first token is an
English word carrying the /oʊ/ of *gold*.** πρό is the one survivor, and only
because there is no consonant to close its syllable on. It also kills the
rival account, that stress decides — σοφός is `so.ˈfos`, its first syllable
is unstressed, and it drifted anyway.

**Those three were played, all three moved, and it is now gated.** νόμος
`no moss` → `nommoss`, σοφία `so fee ah` → `soffee ah`, νομίζω `no mee zoh` →
`nawmee zoh` — which with χρόνος and σοφός makes it **five for five**. The
remedy is to stop the token being a word the voice can look up: close the
syllable with a doubled consonant, or spell the vowel `aw`. `check_cues`
holds it, with πρό excused by name.

**Three of those five had already been passed in an earlier batch.** They were
judged on whether the clip was good, at a time when nobody was asking whether
that o was the one in *omelet*. So an approval is not proof against a rule
nobody had thought of yet — which is the argument for re-hearing a word
against a reference when a new rule lands, and not only for hearing it once.

**And it only applies where the Greek is short.** The gate's first version did
not consult the IPA and flagged σωτηρία `so tey reea` and ὦ `hoe`, both of
which are omegas, where the gold vowel is exactly right.

**A bare `oss` after a consonant is a rule, and is gated.** It picks up an
extra letter: ἥλιος "spells o s s at the end" in batch 4, then χρόνος
`chron oss` — "says chron oss C, with the added x on the end" — and σοφός
`sof oss`. τόπος shows the remedy and always has: it is `to poss`, not
`to oss`. The consonant travels with the second token, or the word is bound.
Watch the vowel-spelling h when you reason about this: `lah`, `nah`, `neh`
and `theh` all end in a *vowel*, and λαός, ναός and νέος are approved with a
free `oss` after them.

**~~A cue heard alone is not evidence of how it reads in a sentence.~~**
**Struck 2026-09-15, the day after it was written, and it is worth keeping the
wreckage.** The claim was that Atlas reads a word differently according to
what surrounds it: the plain spelling *upsilon* alone came back UP-silon,
while the same plain spelling inside a lesson paragraph came back OOP-silon.
That would have qualified how every cue in this project was judged, since all
818 were auditioned as standalone clips.

**Only one half of it was ever measured.** The standalone was rolled and heard
here. The in-sentence half was a report — Fraser said the narration sounded
like OOP-silon, I did not listen to the paragraph myself, and I wrote a
sweeping rule on a comparison with one measured side. He relistened: the
paragraph says UP-silon, the same as the standalone and the same as the whole
vocabulary pack. There is no context effect here and no evidence of one.

The lesson that survives is not about Atlas. **A rule needs both sides of its
comparison measured**, and the wider a rule reaches the more that matters —
this one was written as the rule that reached furthest, on half the evidence
its narrowest neighbour had. It took one relisten to fall.

**κτ- takes an ear, not a rule.** The two locked cues resolve the cluster
differently — κτίσις is `kitsis`, where the s of the cluster doubles as the
sigma, and κτίζω is `kitzo`, where it does not. Any rule gets one of them
wrong; an attempt produced `kitsisees`. `tools/build_cues.py` flags κτ- and
initial ξ- as clusters and leaves them alone.

**One cue is a compromise, not a lock.** ξηραίνω ships as `axay rynoh` with a
helper vowel that is not in the Greek, because Atlas will not begin a word
with *ks* at all. It is recorded as `source: "ear-compromise"` and excused by
name in `check_vocab`'s `CUE_OK`.

---

## What batch 5 changed, 2026-09-15

Batch 5 was the first built out of **spellings rather than words**, because
589 of the 818 clips had never been heard and the previous four rounds had
each found the same thing: not one bad word, one bad spelling, in every word
carrying it. Thirty-eight clips, twenty questions, and a rejected cue always
came back in the follow-up sheet **rolled again as a control** — the voice is
not deterministic and this guide has twice had to strike a rule written on a
single take. Every control failed again, so none of what follows rests on one
roll.

### The one rule that explains four separate faults

**The voice reads an English word as that word. How much that matters depends
on how far the word's vowel is from the Greek one.** That single sentence now
covers the gold-vowel rule, the `do` fault, the `ro` fault and the whole αυ
problem, which had been four unrelated entries.

| the token | English gives | Greek wants | audible? |
|---|---|---|---|
| `no`, `so` *mid-word* | /oʊ/ | short o | barely — **four clips passed** |
| `so`, `crow` *first* | /oʊ/ | short o | yes — five for five |
| `do` | **/uː/** | short o | yes — δοκέω came back *doo-keh-oh* |
| `ro` | /oʊ/ | short o | yes |
| `sow`, `mow`, `stow` | /oʊ/ | **/aʊ/** | yes, badly |

So the mid-word work list this guide has carried since batch 4 is **closed,
and closed as a negative**: γίνομαι, παραγίνομαι, μετανοέω and ὀπίσω all
carry a mid-word gold token and all passed by ear. The rule is first-token
only *for ο*, and position-free for αυ, because the gap is bigger.

The remedy is unchanged and now proven three more times: stop the token being
a word the voice can look up. Spell the vowel (`daw`, `raw`, following the
approved `saw` and `naw`) or close the syllable with a doubled consonant.

### αυ, which English cannot spell — and the approval it hid

αυ wants /aʊ/. `ow` gives it **unless the token is a real English word whose
vowel is /oʊ/** — and `sow`, `mow`, `stow`, `low`, `tow`, `bow` all are.
`pow`, `kow`, `dow`, `thow` and a bare `ow` are not words at all, so the
voice falls back on *cow, now, how* and they are right.

**σταυρός was approved in an earlier batch and is wrong.** `stowross` reads
with the vowel of *mow*; Fraser overturned it on 2026-09-15 while listening
to it as a *control* for a different question. That is the second time an
approval has hidden a fault — the first was the gold vowel, where three of
the five words had been passed before anyone was asking about that o. **An
approval means the clip was judged good, not that every property of it was
examined.** Put an old approval in a new sheet whenever a new rule would
touch it.

Of the remedies tried, only one works so far:

| | |
|---|---|
| `eh mout too` for ἐμαυτοῦ | **approved** — `-out` is reliably /aʊt/, as in *pout, rout, tout* |
| `stour ross`, `sour loss`, `thay sour oss` | rejected — `-our` is not /aʊər/ here |
| `stah oo ross`, `sah oo loss` | rejected — spelling it out adds a beat and loses the diphthong |

**Settled: `au`.** The answer was to stop handing the voice anything it could
look up at all. σταυρός is `stau ross` and Σαῦλος `sau loss`; θησαυρός is
`thaysau ross`, σταυρόω `stau raw oh`, ὡσαύτως `hoh sau tohs`. Breaking the
word so the diphthong stood on its own beat — `stah ow ross` — was rejected
for the beat it adds, in Fraser's words because "that ow doesn't align with
any letters in the word".

So the full picture for αυ: **`ow` is right when the token is not an English
word** (`ow toss`, `pow`, `kow`, `dow`, `thow`), wrong when it is one whose
vowel is /oʊ/ (`sow`, `mow`, `stow`), and `au` is right anywhere because it
is not a word at all.

### Settled outright

- **αι after a consonant takes a real English word, and this now reaches the
  whole family.** `keye` and `peye` were banned in `check_cues` one word at a
  time; `seye` was never added and Φαρισαῖος failed on it. `fah ree sigh oss`
  and `ah nah bye noh` were both approved, so `bye`, `sigh`, `high`, `lie`,
  `die`, `nigh` replace `beye`, `seye`, `heye`, `leye`, `deye`, `neye` across
  **sixteen clips**.
- **A -ος word never ends in a bare `os`.** 83 of the 102 already ended
  `oss`, 54 of those heard, and 58 rows carry a note recording the day their
  bare ending was changed. Eighteen were missed; seventeen of the eighteen
  repairs were approved at once. The exception was Φαρισαῖος, and the ending
  was not the fault — `seye` was.
- **-σις is `sis`, not `sees`.** Settled by the IPA rather than by ear: every
  one of the ten -σις nouns ends in a short i (`ˈkri.sis`). The pack said it
  both ways, six to four, and the one clip an ear had passed — 663 κτίσις
  `kitsis` — was already a `sis`. `kree sis` approved.
- **The short omicron, split by measurement rather than by rule.** `do` is the
  worst of the English words because its vowel is not even close — δοκέω came
  back *doo-keh-oh*. Two remedies were already in the pack and both are right,
  in different words: **`dok keh oh` beat `daw keh oh` before a k**, and
  **`psew daw my` beat `psew dom my` before an m**. Both halves of each
  comparison were heard. Where there is no consonant to close on — the -όω
  verbs, where the o sits against the ω — `raw` wins and that is the same gap
  πρό has. No rule was extrapolated from either half, and the guide does not
  offer one: ask the ear per word, and the two candidates are always these.
- **`aw` is not perfect and seven approved clips use it.** ὁ `haw`, προφήτης
  `praw fey teys`, ἐντολή `en taw ley`, σοφία, σοφός, ἀγνοέω, νομίζω. Fraser's
  verdict on it is "closer to the correct sound than the omega, but it doesn't
  sound quite right", which is why closing the syllable is preferred where
  there is a consonant to close with. Those seven are not wrong enough to
  re-record and are recorded here so nobody is surprised by them.
- **~~`tay` losing its t is positional.~~ Struck the same day, by its own
  prediction — see below.**
- **The front of a word can eat an `eh`.** ἐμβαίνω spelled out *a-h-m* before
  it got going, ἐκτείνω *a-h-k*, ἐγγύς came back *eh-en goose*. Dropping the h
  fixed all three — `em bye noh`, `ek tay noh`, `eng goos` — and ἐκλεκτός
  needed both its h's out (`ek lek toss`). But **ἐκλέγομαι `ehk leh go my` and
  ἔθνος `ehth noss` were heard and passed unchanged**, so this is not a rule
  about the shape; it is a thing to listen for, and there is no gate.
- **Ἠσαΐας was wrong in a way nobody was looking for.** It sat in the `Ceye`
  list, but it is not an αι word: the diaeresis says the vowels are separate,
  `eː.sa.ˈi.as`, four syllables. The cue had been running them into the
  diphthong and losing one. It surfaced only because the αι family was listed
  out to be fixed as a group — **a group fix is also an audit.**
- **`gheh` is fine, and γέ is not.** I judged `gheh` on γέ because its cue was
  the shortest and therefore the most isolating. That was backwards: **the
  shortest cue is exactly where rule 9 bites**, and γέ came back as the g
  followed by *h-e-h* recited. On καταργέω, where the token is not alone,
  `gheh` was approved. **When testing a spelling, do not pick the word with
  the least around it — pick a word where it sits the way it usually sits.**

**Settled: γέ is `geh`.** Neither `gueh` nor `ghe` beat the original, and two
further rolls of `gheh` did not either; the plain spelling did. The soft-g
fear that `gh` exists to answer did not materialise on a lone token.

### The rule that was refuted by its own prediction

**τηρέω came back *hay reh oh*, and θησαυρός came back *hay sau ross*.** Two
clips, the same fault, and a tempting rule: a t-initial cue on `ay` drops its
consonant. The evidence looked strong — **41 cues open on a consonant + `ay`,
ten of them heard**, and `may deys`, `spay roh`, `pay tho`, `play thoss`,
`hay lee ahs` and `skay ney` all keep their consonant. Only the two t-words
lost it.

So the rule was written down **and made to predict**: θηρίον is the third and
last `thay`/`tay` opening in the pack and had never been listened to. If the
rule held, it would lose its th too.

**It did not. θηρίον was passed unchanged.** There is no t rule. Two takes
needed closing up and a third did not, and the difference is the take rather
than the spelling — which is what "Atlas is not deterministic" has meant all
along.

This is the cheapest a rule has ever been killed here. The ζ entry, the
context-dependence entry and the `keye` measurement all had to be struck
*after* they had been acted on; this one was stopped before it touched the
other 39 cues that open the same way. **A rule that can be made to predict
something unheard should be, before it is applied to anything.** The cost is
one clip in the next sheet.

### ευ, and a question the pack had been answering both ways

Fraser asked whether ευ should carry the y of *you*. **Black says yes.** His
pronunciation keyword is ***feud*** — /fjuːd/ — and every keyword in that
column of his table is a genuine sound key: *aisle, eight, oil, suite, Faust,
soup*. His cognate for εὐλογητός is *eulogy*, which has the y too.

**And the pack has been right all along.** I first wrote this section as a
table of the pack contradicting itself — `pew`, `tew` and `yoo` carrying the
y against `sue`, `rue` and `lew` without it — and put it in front of Fraser
that way. He corrected it in one line: *"most of those examples you gave DO
have a y sound in them."*

He is right, and the error is mine for reading the keywords in an American
accent. In British and New Zealand English the y survives after most
consonants: *sue* is /sjuː/, *lewd* /ljuːd/, *dew* /djuː/, *news* /njuːz/,
*tune* /tjuːn/. **Every ευ spelling in the pack gives Black's diphthong
except `rue`**, and that one only because English has no /rjuː/ at all.

So there was never a mixed practice. Judged side by side on 2026-09-15 both
of the live spellings stand: `ew` at the front of a word was kept over an
explicit `yoo`, with Fraser's reason the useful part — *"the `ew` does have
somewhat of a ya sound"* — and after a consonant `lew` was kept over `lyoo`.

**The lesson is about where the keywords are read, not about ευ.** Every rule
in this guide is written as an English keyword, and an English keyword means
what the reader's accent makes it mean. The reader here is a New Zealander;
so is the audience. Check a keyword against that accent before building a
table on it.

**A discrepancy left standing, deliberately.** `docs/erasmian_ipa.json` gives
ευ as `eu̯` — a pure e-to-u glide with no y — which contradicts Black's
*feud*. The IPA file is what 818 cues are scored against, and moving it would
re-score forty clips on a point an ear has just called a non-issue. It is
recorded here rather than changed, and it is a real disagreement between two
of this project's own sources, not an oversight.

## What batch 7 changed, 2026-09-15

Batch 7 was built to test the **method**, because the spelling ranking had
spent itself: after two rounds the heaviest untested spelling carried three
clips and 266 of the remaining 293 carried exactly one.

### Composition, and how far it can be trusted

**226 of the 497 unheard clips were built entirely out of spellings an ear
had passed elsewhere.** Every piece of them judged; only the order not. Ten
were put up — chosen as the ten places composition was *least* likely to
hold, not sampled at random — and **seven passed**. One more was a bad take.
The three genuine failures share one shape. **So 223 of 226 stand, and the
pile still needing an ear is 271 rather than 497.**

That is the single most useful number this audit has produced, and it came
from testing the weakest cases rather than a fair sample. A fair sample would
have passed at a rate nobody could act on.

### A word the voice already knows beats every rule about it

θεωρέω `theh oh reh oh` came back as the English article. The obvious reading
was "`theh` followed by a bare vowel", and three fixes were built on it — a
closure, a w glide, a y glide — and all three failed.

**θέλω `thel oh` is heard, approved, and has exactly that shape.** So the rule
was wrong: it is not what follows, it is the first token *itself*. `thel` does
not look like the English article; `theh` does, because the h is not a sound
and what the voice sees is t-h-e. Every working θε- cue — θέλω, θεραπεύω,
θέλημα, θερίζω, θεμέλιος — has a real consonant straight after the e.

**Look for the clip in the pack that already contradicts the rule you are
about to write.** It took four rounds here and it was sitting in the same
eight-row list the whole time.

### Punctuation works, and nothing had tried it

δέω ships as **`deh, oh`**. A comma inside a cue breaks the phrase so the two
tokens cannot be read as one English word. Eight hundred cues and nobody had
tried punctuation; `text_normalization` is off, so it reaches the voice.

### Two compromises, recorded by name

θεωρέω and θεάομαι ship as `thay oh reh oh` and `thay ah o my` — **the eta
vowel where the Greek has epsilon.** Every spelling that keeps the right vowel
begins with the letters t-h-e. A glide, a closure, a comma and a full stop
were all auditioned; none beat it, and Fraser's verdict was that the wrong
vowel is "still a lot better than saying *the* or spelling". They carry
`source: "ear-compromise"`, like ξηραίνω, so that nobody later reads `thay` as
this project's opinion about epsilon.

### And a sheet can lose a verdict before it is given

One lot on the 7c sheet held θεωρέω, θεάομαι and δέω with six options and a
single set of winner buttons — three decisions, one answer. Fraser could not
express what he heard. **A lot may group clips only when they share one
answer**; the moment the options are alternatives, each word needs its own.
The same fault had appeared once before, on Ἱεροσόλυμα in batch 5e, and was
fixed as an instance rather than as a rule.

## What batch 8 changed, 2026-09-15

Batch 8 played forty clips in four lots of ten, **ranked by how many of the
shapes this guide records each one carried** — a lone token, an h before a
vowel, an English word the voice can look up, five beats, a long closed-up
token. Lot 1 had the most against it; lot 4 had nothing at all.

### The ranking does not predict, and it was put up to find that out

| lot | what it carried | faults |
|---|---|---|
| 1 | two or more known shapes each | **0** |
| 2 | one shape each | 3 |
| 3 | one shape each, milder | 2 |
| 4 | **nothing known against them** | 1 |

**Six faults in forty, and the lot with the most against it had none.** So
the shapes describe what has gone wrong; they do not say what *will*. The
work list is no longer ordered by them — the remaining clips are simply
played, forty at a time, which is also a cheaper sheet to build.

Lot 4 existed only to make the result falsifiable. Without it the 0/3/2/1
would have looked like "the hard ones were fine", which is not the same claim
at all.

### Every one of the six had its remedy already in the pack

This is the finding worth keeping, and it is the third round in a row it has
appeared:

| fault | the clip that already knew |
|---|---|
| ζητέω, ζάω, ζῷον, ζῆλος on `dz` | **ζωή `zoh eh`** — ζ word-initial takes `z`, settled in the 511–817 round and written in this guide's own header. One word got the fix; four did not. |
| σφραγίς reciting its letters | **πτωχός `puh toh koss`** and πνευματικός — a *helper vowel* for a cluster English will not begin a word with. I treated it as a long token to split, which was not enough. |
| γυμνός saying *gay um noss* | **γινώσκω** — `gh`, the digraph that rescued it from the letter name. |

**So when a clip fails, search the heard set for the same shape before
reasoning about it.** Four rounds have now been spent on rules that an
existing approved clip would have settled in a minute: θέλω on the θε-
problem, ζωή on ζ-, πτωχός on the cluster, γινώσκω on the g.

### Two smaller things

**The voice looks up words in other languages too.** εἷς shipped as `hace`,
which is Spanish, and came back sounding Spanish. Every entry in this guide
about "an English word the voice can look up" is really about *any* word it
can look up.

**A comma works but costs a pause.** δέω and ζῷον had the same fault — an
h-final token sounding across the space into a bare vowel — and a comma fixes
both. But `zo on`, which simply drops the h, was preferred over `zoh, on` for
pace. So the order is: **remove the h first; reach for punctuation only when
that fails.** δέω keeps its comma because nothing without one was auditioned
there.

### And the checker was wrong again, on the same line

`VOWEL_END` decides whether a token ends in a vowel, and the note above it
already records the first time it was wrong: it called `lah`, `nah`, `neh`
and `theh` consonant-final and flagged three clips the ear had passed.

In batch 5 it did it again. **`sigh` ends in a silent gh spelling a
diphthong** — so do `high` and `nigh` — and the test called all three
consonant-final, flagging Φαρισαῖος `fah ree sigh oss` an hour after an ear
approved it. Same line, same class of mistake, second time. The fix is `igh`
in the pattern, and the standing lesson from CLAUDE.md holds: **before
concluding the data is wrong, check that the parser is not the thing at
fault.**

---

**This is a procedure, not a formula.** Atlas is not deterministic: the same
`pahss` that once split into "pa has" was later read correctly. Expect to
produce two or three candidates and choose by ear. First-pass success is
good but not reliable enough to skip listening.

---

## What batch 9 changed, 2026-09-17

Batch 9 set out to hear the commonest words nobody had listened to — Ἰησοῦς
at 917 occurrences had never been played — and ended by finding that this
guide has been solving the wrong problem for eight hundred cues.

**The voice reads IPA between slashes, and always has.** xAI's own
documentation gives `/ˈɛndʒɪn ˈɛks/` as an example. The pack is written in
English respellings because that is how it started, not because anything was
decided, and `docs/erasmian_ipa.json` has held a checked transcription of all
818 words the whole time.

### The two results that settle it

**τότε had no English spelling that worked, in two rounds.** `tot` is an
English word for a child with exactly the vowel we want, and the voice read it
as the first syllable of *total*. So the rule this guide has carried since
batch 5 — *the voice reads an English word as that word* — is not quite right.
**It reads the spelling.** An o with one consonant after it is long to it
whatever the dictionary says, which is why `hot tee` and `tot teh` both failed
and why `aw` kept winning: `aw` is the only spelling English has that cannot be
read long. Fraser's standing verdict on `aw` is that it is "closer to the
correct sound than the omega, but it doesn't sound quite right", so the best
English spelling was a compromise all along.

**ὁράω's English cue had already been approved.** It passed by ear in 9C, in
the lot whose result stopped a blanket rewrite of twenty-nine cues. The IPA
beat it anyway. So this is not a rescue for words English cannot reach. For
vowels it is simply better.

### The conversion, and where each part of it came from

`docs/erasmian_ipa.json` cannot be handed to the voice unchanged — it lost
every lot it was entered in, because it writes short omicron `o` and short iota
`i` and this voice reads both long. Five rules, each from one ear-verdict:

| | | from |
|---|---|---|
| `eu̯` → `ju` | Black's ευ is *feud* | 9G: written `eu̯` it came out as *row* |
| `o` → `ɒ` | short omicron, Black's *not* | 9E, 9F |
| `i` → `ɪ` | short iota, Black's *pit* | 9E, and Fraser found it: "shouldn't it end in *is* like the sound in *this*?" |
| `^e` → `ɛ` | **only** where the string opens on it | 9H: "A sounds like the letter e spoken" |
| `ː` and `̯` | never touched | omega, long iota, and every diphthong's second half |

The epsilon rule is about the first character and not about epsilon: μέγας
`/ˈme.ɡas/` and τότε `/ˈtɒ.te/` were both approved with a plain `e`, one after a
consonant and one word-final, and only ἐγείρω — where the string opens on the
vowel — was heard as the letter. That is this guide's own *the front of a word
can eat an `eh`*, in IPA.

**It reproduces all twenty approved strings with no per-word exceptions**,
which is the difference between twenty lucky guesses and a method, and it is
why the remaining work can be proposed in batches rather than one word at a
time. `check_vocab` holds every IPA cue to it.

### What IPA cannot do

- **χ.** χάρις went to the English `khah riss` with both IPA takes losing. IPA
  `x` is the velar fricative, and this is the same chi that decodes as `k` in
  78% of the shipped clips. Fifteen of the remaining cues are held back on it.
- **`eu̯`**, until 9G found `ju`. Worth remembering as the shape of the
  problem: a symbol the transcription is right about and the voice cannot say.

### The rule proposes; only a heard string ships

Three cues in the pack differ from what the conversion would write, and each
difference is recorded in `check_vocab`'s `IPA_HEARD` with its reason. ὅτι
ships with a plain final `i` where the rule writes `ɪ`, because the plain `i`
is the string that produced the clip somebody listened to. αἰών ships with its
omega written `oʊ`, because `oːn` at the end of a word was recited letter by
letter — and that is **not** promoted into the rule, because four cues end
`-oːn` and one ear has judged one of them.

**A cue regenerated from a rule is a cue nobody has heard**, and filling the
pack with those is what this audit exists to undo.

### And the checkers had to learn the new kind

`check_vocab`'s three cue tests — a capital letter, the syllable count, the
first consonant — are tests of an English respelling. An IPA cue fails all
three by construction, and it reported eight faults that were not faults.
The other direction is worse and is still true of `check_cues`: its twelve
gated spellings are English word-boundary patterns, so an IPA cue passes them
by matching none of them. **That is silence, not approval.**

One more waits. `build_lesson_audio.py` feeds the cue into the lesson
narration — the voice says the cue where the page shows the Greek — so an IPA
cue would put `/ˈhɒ.ti/` into spoken prose. No batch-9 word appears in the
chapter 1 and 2 narration, so nothing is broken today. It is a trap set for the
next chapter that gets narrated.

## What batches 10 and 11 changed, 2026-09-17

Batch 9 found the IPA route. These two rounds asked it the questions it had
never been asked, and every one of them was about POSITION — which is the
thing this pack has been caught by more than any other.

### Three conditions the rule did not have

**A stressed iota is left alone; a stressed omicron is not.** The rule opens
every short vowel, and every iota it had been validated on was UNSTRESSED —
πόλις `/ˈpɒ.lɪs/`, πιστεύω `/pɪ.ˈstju.oː/`, ὅτι. καρδία was the first stressed
one ever put up and went to the version with the iota long: *"B would be
best"*. A stressed omicron is a different matter and does open — ὅτι, πόλις,
τότε, ὅταν and μόνος were all approved that way. **The asymmetry is the ear's,
not a theory about vowels**, and it is recorded rather than explained.

**The dot before the stress comes out.** Put up dotted against dotless, ὁράω,
πιστεύω and καρδία all took the version without it, and ὅτι — whose stress is
word-initial, so it has no such dot — kept what it had. Then batch 11 asked
the five cues that were still shipping with one: four took dotless and **ἀνήρ
did not**. So it is a default and not a law.

**The other dots are a per-word question and stay in the rule.** Three words
have spoken one aloud — αἰών, καρδία, ἀποστέλλω — and four have been approved
carrying one. Where a word recites its dots, take them all out and record it;
καρδία ships as `/karˈdia/` for that reason.

### `ju` is positional, like everything else here

9G settled ευ as `ju`, which is only Black's *feud* written back in IPA. It
works BETWEEN CONSONANTS. It recites at the FRONT of a word — εὑρίσκω, "the
other two spell the hju part" — so that word stays in English, and its `ree`
is right for the same reason καρδία's is: the iota is stressed.

### The conversion has been wrong about a diphthong three times

Each time in the same way: **treating one sound as two vowels that can be
edited separately.**

| | what it did | caught by |
|---|---|---|
| ὁράω | opened the omega in `oː` | the ear, in the round it was written for |
| αι | opened the second half, `ai̯` → `aɪ̯` | reading the output before sending it |
| οι | opened the FIRST half, `oi̯` → `ɒi̯` | running it over the next batch before generating |

The third is the instructive one. The mark that says "this is a diphthong"
sits on the SECOND vowel, so a guard watching for the mark straight after the
o never saw it. **A diphthong is one sound and every rule must step over the
whole of it** — which is now what the guard says rather than what it implied.
Nothing shipped wrong any of the three times, because the conversion is run
over the candidates and read before anything is generated. That check has now
caught five faults, three diphthongs and two orderings.

### And an allow-list entry that was covering a fault in the checker

`check_vocab`'s epsilon substitution was written `"\1ɛ"` in a non-raw Python
string, so `\1` was read as an octal escape for a control character. The rule
had been inserting an invisible byte and **dropping the stress mark**: the
string it expected for ἔξω had no stress in it at all.

It threw a false mismatch on ἐγείρω, and ἐγείρω went into the allow-list. So
an entry there was excusing **a bug in the checker rather than an exception in
the data** — which is the exact shape CLAUDE.md warns about, arrived at from
the inside. With the backreference fixed, ἐγείρω matches the rule exactly and
its entry is gone.

**An allow-list entry should name a difference between what a rule proposes
and what an ear approved.** If it cannot be stated in those terms, the rule or
the checker is wrong, not the data.

## What batches 12 and 13 changed, 2026-09-17

Two findings, and a checker that should have existed for a year.

### The split glide was the dot

βασιλεύς put `ju` in third position for the first time and it came apart:
*"A is almost perfect except for the end which sounds like lee oos."* The l
was coming away from the glide, which read as a glide that would not hold
that far into a word — a new condition on the ευ rule, and a discouraging
one, because `ju` is what released sixteen cues in 9G.

It was the syllable dot. The same string with the dots taken out is one
syllable and was approved unchanged. **So `ju` has now been heard at the
front of a word, between consonants and at the end of one, and there is no
positional condition on it at all.** The condition that looked like it
belonged to the glide belonged to the thing sitting next to the glide.

γραμματεύς is in 13B, dotted against dotless, to see whether that
generalises.

### A long omega at the end of a word recites

αἰών's `oːn` was read letter by letter in batch 11 and shipped as
`/ai̯ˈoʊn/` — Black's *gold* written the way English spells it — as a
one-word exception. ὕδωρ's `oːr` did exactly the same thing in 13 and took
exactly the same fix.

Two words, nothing against, so it stopped being an allow-list entry and
became part of the conversion. Σίμων gets it without being asked.

**It covers n and r only, which is all that has been heard.** Nine more cues
end in `oːs` — ὡς, πῶς, φῶς, καλῶς, οὕτως, καθώς — and not one has been
through this route. ὡς is in 13B for that reason and no other: one verdict on
the deck's 34th commonest word either keeps the rule narrow or widens it to
all nine.

### Iota quantity under stress is per-word, and the source cannot help

καρδία took a LONG stressed iota in batch 10, which is where the rule's
"leave a stressed iota alone" came from. πίπτω is the same shape and would
not have it: *"both sound like peep instead of pip."*

Before writing that down as a second exception it was worth asking whether
the transcription could settle it — and the answer is that it cannot, in a
way worth knowing. **`erasmian_ipa.json` writes a long iota in one entry out
of 818.** It does not carry iota quantity at all. So no rule over that file
can distinguish these two words, and the question is per-word like the dot,
with the default left long because that is what was approved first.

This is worth contrasting with the dot, which looks like the same kind of
finding and is not. The dot is a property of the *cue* and the remedy is
always available: take them out. Iota quantity is a property of the *Greek*,
and the file the cues are built from does not record it.

### And a rule that writes two characters is as dangerous as one that reads two

The `oʊ` conversion went in above the short-o rule, which then opened the o
of the `oʊ` it had just written: `/ˈhu.dɒʊr/`. That is the fourth time this
conversion has been wrong about a digraph and the first time from this
direction — the three before were diphthongs being *read* as two editable
vowels, and this was a digraph being *written* into the path of a later rule.

Running it after the short-o rule needs no guard at all, because `oː` carries
a length mark and that rule already steps over it. **Order is the guard.**

It was also written `"oʊ\1"` in a non-raw Python string, which is an octal
escape for a control byte and not a backreference, so the consonant was
eaten. That is the SECOND time that exact escape has gone into this pack; the
first was check_vocab's epsilon rule in batch 11, where it dropped a stress
mark and put a false entry in the allow-list. Both times it was caught by
running the converter over words that were already settled before trusting it
on new ones, which is now the only reason to keep doing that.

### check_sw, and the failure that leaves no trace

sw.js carries three lists of paths, and a wrong path in any of them throws
nothing. STALE is the dangerous one: vocabulary clips live in a bulk cache
that is deliberately never swept, so a phone keeps a clip until something in
STALE names it. Misspell that name and **the re-recording never reaches the
one device it was recorded for, and nothing ever says so.**

Two of the four entries in v167's block were typed from memory and were
wrong — `255_hudor` for `255_udor`, `272_rhema` for `272_rema`. That is
CLAUDE.md's first rule broken in the one place where breaking it leaves no
evidence. The checker now asks both directions: every path named exists, and
every bulk file whose content changed this release is named.

## 1. The sound system

Anglicised Erasmian, as taught in Western seminaries (Mounce / Logos style).
Not reconstructed Koine, not Modern Greek. These values come from the app's
own alphabet table, which the learner sees in lesson 1.

**Check digraphs before single letters.** αι is not α + ι.

### Diphthongs

| Greek | Cue | Sounds like |
|---|---|---|
| αι | `eye` initial; after a consonant **a real English word** — `kai` `kye` `pie` `rye` `mai` `bye` `dye` | aisle |
| ει | `ay` | say |
| οι | `oy` | boy |
| υι | `wee` | — |
| αυ | `ow` | now |
| ευ | `ew` | few |
| ηυ | `ew` | few |
| ου | `oo` | moon |

### Letters

| Greek | Cue | Note |
|---|---|---|
| α | `ah` [58/66] | as in father |
| β | `b` | |
| γ | `g`, but `gh` before an e or i sound | rule 5 |
| δ | `d` | |
| ε | `eh` [31/59] | as in met |
| ζ | `dz` [2 of 3 word-initial]; `z` if it spells | see below |
| η | `ay` | as in obey, long |
| θ | `th` [14/14] | as in thing |
| ι | `ee`; `y` when it glides onto a vowel | rule 8 |
| κ | `k` | |
| λ | `l` | |
| μ | `m` | |
| ν | `n` | |
| ξ | `ks` | as in axe |
| ο | `o` | short, as in not |
| π | `p` | |
| ρ | `r` | plain English r, not trilled |
| σ ς | `s` | |
| τ | `t` | |
| υ | `oo` | never `ew`/`ü` — the pack is consistent |
| φ | `f` [17/17] | not `ph` |
| χ | `kh` [6/8] | as in loch |
| ψ | `ps` | as in lips |
| ω | `oh` | as in tone, long |

**Rough breathing** — a word starting ἁ ἑ ἡ ὁ ὑ ὡ takes an `h`. [58/59]
ὁ → `ho`, ὅς → `hoss`, ἵνα → `hin ah`. Smooth breathing adds nothing.

**On ζ.** Word-initial `dz` works more often than not: ζάω `dzah oh` and
ζητέω `dzay teh oh` both read cleanly. ζωή is the exception — it ended up
`zoh eh`. Start with `dz`, and drop to `z` only if the clip spells.

### Endings, which is where most words end up

| Greek | Cue | Example |
|---|---|---|
| -ος | `os` or `oss` [110] | λόγος → `loh goss` |
| -ον | `on` | |
| -ης | `ays` [10/10] | τελώνης → `teh loh nays` |
| -ας | `ahs` [6/7] | μέγας → `meh gahs` |
| -ις | `ees` or `is` | πίστις → `pee stees` |
| -ευς | `ews` | βασιλεύς → `bah see lews` |
| -μα | `mah` [9/9] | πνεῦμα → `pnew mah` |
| -ω | `oh` [79] | λύω → `loo oh` |
| -η | `ay` [27] | φωνή → `foh nay` |
| -α | `ah` [18] | ἡμέρα → `hay meh rah` |
| -ια | `ee ah` [14/19] | καρδία → `kahr dee ah` |
| -ιον | `ee on` [10/13] | δαιμόνιον → `dye mo nee on` |
| -αω | `ah oh` [11/11] | ἀγαπάω → `ah gah pah oh` |
| -εω | `eh oh` [27/28] | ποιέω → `poy eh oh` |
| -οω | `o oh` | πληρόω → `play ro oh` |
| -ευω | `ew oh` [3/3] | πιστεύω → `pee stew oh` |
| -ομαι | `o my` [22] | ἔρχομαι → `air kho my` |

---

## 2. The nine things that go wrong

Each cost a re-recording.

### 1. Capital letters
A capital makes the voice treat the cue as a name. **Never use one.**

### 2. The cue spelling an English word
The voice has a dictionary and prefers it, with English vowels and English
stress. The most common failure.

| Was | Read as | Fixed to |
|---|---|---|
| `Theos` (θεός) | THEE-oss | `theh oss` |
| `Simon` (Σίμων) | SIGH-mun | `see mohn` |
| `ecclesia` (ἐκκλησία) | ecclesia | `ek klay see ah` |
| `eh goh` (ἐγώ) | EE-go — it spells *ego* | `e goh` |
| `sos` (σός) | S.O.S. | `sauce` |

An English word is fine **when its vowels and stress already match** —
`sauce` for σός is a lock. The failures above are all cases where the
dictionary pronunciation was wrong, not cases where a word was used.

### 3. Every token being a letter name
`eh pee` is E and P, so ἐπί was spelled out. Watch for `ay bee see dee ee
eff gee jay kay ell em en oh pee cue ar ess tee you vee ex why zee`.

ἐπί `eh pee` → `eppee` · ἔτι `eh tee` → `etih`

One letter-name token among others is *usually* fine — `pee stew oh` works,
and eleven heard clips carry a bare `tee`, `dee`, `oh`, `kay`, `ess`, `bee`
or `see` and passed.

**A cue that is nothing but a letter name can still be fine.** This rule used
to be read as forbidding it outright, and on 2026-09-11 that reading predicted
that εἰ and ἤ — both cued `ay`, the letter A's name and the whole cue, and
neither ever heard — would come back as the letter. **Both were played and
both were kept.** They are #37 and #51 in the deck, so it was worth asking;
the answer is that a one-token cue is not by itself the fault.

**`gee` is the exception, and the only one an ear has failed.** ἀναγινώσκω
`ah nah gee noh skoh` came back as "ah nah **G** noh skoh" — four real
syllables and one letter, spoken as the letter. The reason it is special:
for every other letter the letter name and the syllable want different
sounds, so something pulls the voice toward the syllable. For G the letter
name and the English soft-g reading are *the same sound*, /dʒiː/, and
nothing pulls the other way. **`ghee` and only `ghee`** — γίνομαι
`ghee no my` and γινώσκω `ghee noh skoh` are both heard and clean, with
the g *not* joined to the nu, which is what settled it against the rival
theory that the nu had to close the syllable.

### 4. Spaces are beats
A space is a pause. Too many and the clip is a list of syllables.
**Target about 0.5 seconds per syllable.**

Ἰουδαῖος `ee oo deye os` was 3.81s; bound to `yoodaios` it is 1.46s.
δόξα `do ksah` was 2.01s; `doksah` is 1.08s.

**And there is a second lever, which this guide went four rounds without
using.** The request takes a `speed`, 0.7 to 1.5. It is a number, not a
re-roll, so it changes pace and nothing else — where binding changes the
pace *and* every sound in the token. ἀναγινώσκω was approved for its sounds
and rejected for its plod at 2.59s over five syllables, which is 0.52s a
syllable and dead on the target above; the same cue at **speed 1.2** was
accepted. So the 0.5s figure is a floor for *legibility*, not a target for
what sounds unhurried, and a clip can be correct, on-target and still too
slow.

Reach for speed when the sounds are right and only the pace is wrong; reach
for binding when a token is being spelled. ἐπιγινώσκω, complained of in the
same breath as ἀναγινώσκω, went the other way and was fixed by binding —
so try both.

### 5. Closing a space can wake a silent h
`ah`, `eh` and `oh` spell vowels — the h is not a sound. Inside a closed
token Atlas sometimes says it anyway.

πρῶτος `prohtos` → "pro-ho-tos". Locked as `protos`.
νέος `nehos` → spoke the h. Locked as `neos`.

**When you close up a token, drop the h from `ah`/`eh`/`oh`.**

### 6. Soft g
English reads `g` before e and i as /dʒ/. Greek gamma is always hard.
γίνομαι `gin oh my` → JIN-oh-my, fixed to `ghee no my`.
γινώσκω `gee noh skoh` → also soft, fixed to `ghee noh skoh`.
**Use `gh` before any e or i sound.**

### 7. Doubled letters can split — try both
πᾶς `pahss` once came out "pa has". A later take of the *same* cue was
clean and is what ships. So this is not "never double a consonant"; it is
"if it splits, try the single letter and listen again". μέγας `meh gahs`
shows the single-s form working.

### 8. Clusters English does not allow
English will not begin a word with `pn` or `pt`, and drops the stop.
πνεῦμα came out "nyoo mah" with no pi.

A light helper vowel forces it: πτωχός → `puh toh koss`.
**Use the helper only for a stop followed by a nasal or liquid — πτ, πν.**
Do not sprinkle it elsewhere. ψ- is usually fine as `ps` (ψυχή `psoo khay`).

### 9. Full close-up recites letters
Closing every space is not the fix; it is a different failure.
`ahkseeos`, `eeoodeyeos`, `deekyeos` get spelled out.

**Join about two syllables per token, not the whole word.** The locks that
worked are partial joins: `dee kyeoss`, `yoodaios`, `koo rioss`.

`yoo` for Ἰου- is a *joining* device, not a rule about iota — `ee oo` is
what produced the four-second lists.

---

## 3. Stress

Greek marks it: the accent (ά ὰ ᾶ) sits on the stressed syllable.

ἐγώ is stressed on the **second** — e-GOH, not EE-go.
ἔτι on the **first** — ET-i, not eh-TEE.
κύριος on the **first** — KOO-ree-oss.

Atlas has no stress mark, so it has to come out of the shape: **do not give
an unstressed syllable a long vowel.** ἔτι's `tee` was long *and* a letter
name; `tih` is short, which is what the word needs.

---

## 4. Producing a cue

1. Split the Greek into syllables.
2. Map each with the tables — **digraphs first**.
3. Join about two syllables per token.
4. Read it back as English. Is it a word with the wrong stress? Is every
   token a letter name? Is there a `g` before e or i? Did closing a token
   leave an `h` that might get spoken?
5. Check the stress lands on the Greek accent.
6. **Emit two candidates — one spaced, one bound — and keep the shorter one
   that does not spell.** Aim for 0.5 seconds per syllable.

### Worked examples — all of these ship and have been heard

| Greek | Cue | Why |
|---|---|---|
| ἐκκλησία | `ek klay see ah` | η = ay, -ια = ee ah |
| μνημεῖον | `mnay may on` | η = ay, ει = ay, mu must sound |
| δίκαιος | `dee kyeoss` | partial join; αι as `kye` |
| δικαιόω | `dee kye oh oh` | αι as `kye`, as δίκαιος is locked; -οω = o oh |
| ἀσθενής | `asthenays` | -ης = ays, bound |
| πρῶτος | `protos` | closed, and the h dropped |
| ψυχή | `psoo khay` | ψ = ps, υ = oo, χ = kh, -η = ay |
| ἔρχομαι | `air kho my` | χ = kh, -ομαι = o my |

---

## 5. Ground truth, and what it is not for

`docs/erasmian_ipa.json` holds a verified IPA transcription of all 511
words, derived from the Greek by rule and checked against the alphabet
table, the syllable count and the written accent. When a cue is in doubt,
it says exactly what the target sound is — πνεῦμα is `pə.ˈneu̯.ma`.

**Do not put IPA in an Atlas cue.** Atlas takes an English respelling only.
Polly accepts `<phoneme alphabet="ipa">`; Atlas does not. Use the IPA to
decide what you are aiming at, then spell it with the tables above.

Where a shipped cue and these tables disagree, the shipped cue usually wins
— it has been heard. Two known exceptions, both never checked by ear:
χαίρω ships as `kyro`, which drops the chi, and 400 ἐπιθυμία
`eh pee thoo mee ah` is still staccato at 3.30s.

### Patterns the audio does *not* support

Recorded so the guide does not accrete folklore:

- ~~**`keye` is not a spelling risk.**~~ **Struck 2026-09-11, and it is the
  most expensive line this guide has carried.** It was measured rather than
  heard: the gaps between the syllables really are 0–130ms, and the syllables
  are still wrong. Two of the five it names have since failed by ear — 369
  καινός "sounds like key a nos" and 193 καιρός "sounds like key i ros" —
  and both had to be re-cued to `kye`. **A section written to keep folklore
  out of the guide was the folklore**, and the reason is worth keeping: an
  instrument that can only see silence will report evenly spaced nonsense as
  healthy. Nothing goes in this section again on a measurement alone.
- **`ek klay see ah` is not unverified.** It was re-recorded, listened to
  and kept; it measures 1.81s over four syllables with a 100ms gap.

---

## 6. Format

22050 Hz mono, 64 kbps MP3, about 0.25s of tail padding.
The bare citation form only — the word as it appears on the card, not the
lexical line. θεός, not "θεός, -οῦ, ὁ".

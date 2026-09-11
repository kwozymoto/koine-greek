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

**This is a procedure, not a formula.** Atlas is not deterministic: the same
`pahss` that once split into "pa has" was later read correctly. Expect to
produce two or three candidates and choose by ear. First-pass success is
good but not reliable enough to skip listening.

---

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

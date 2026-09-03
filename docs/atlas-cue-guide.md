# Writing an Atlas cue for a Koine Greek word

A reference for generating pronunciation clips for the Koine Greek app. Give
it a Greek word; it should produce a cue string Atlas reads correctly.

Every rule below comes from the 511 clips already in the pack — either from
what the working cues do, or from a specific clip that failed and had to be
re-recorded. Counts in brackets are how many of the 511 back the rule.

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
| αι | `eye` initial, `keye`/`kye`/`ey` inside a word | aisle |
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
| -ιον | `ee on` [10/13] | παιδίον → `peye dee on` |
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

One letter-name token among others is fine — `pee stew oh` works. The fault
is a cue that is nothing but letter names.

### 4. Spaces are beats
A space is a pause. Too many and the clip is a list of syllables.
**Target about 0.5 seconds per syllable.**

Ἰουδαῖος `ee oo deye os` was 3.81s; bound to `yoodaios` it is 1.46s.
δόξα `do ksah` was 2.01s; `doksah` is 1.08s.

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
| δικαιόω | `dee keye oh oh` | αι as `keye`, -οω = o oh |
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

- **`keye` is not a spelling risk.** All five cues using it — 180, 192,
  193, 228, 369 — measure internal gaps of 0–130ms, well inside normal.
  δίκαιος became `dee kyeoss` for vowel and stress reasons, not spelling.
- **`ek klay see ah` is not unverified.** It was re-recorded, listened to
  and kept; it measures 1.81s over four syllables with a 100ms gap.

---

## 6. Format

22050 Hz mono, 64 kbps MP3, about 0.25s of tail padding.
The bare citation form only — the word as it appears on the card, not the
lexical line. θεός, not "θεός, -οῦ, ὁ".

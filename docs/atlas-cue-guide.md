# Writing an Atlas cue for a Koine Greek word

A reference for generating pronunciation clips for the Koine Greek app. Give
it a Greek word; it should produce a cue string that Atlas reads correctly
the first time.

Every rule below was derived from the 511 clips already in the pack — either
from what the working cues actually do, or from a specific clip that failed
and had to be re-recorded. Counts in brackets are how many of the 511 back
the rule.

---

## 1. The sound system

Anglicised Erasmian, as taught in Western seminaries (Mounce / Logos style).
Not reconstructed Koine, not Modern Greek. These values come from the app's
own alphabet table, which the learner sees in lesson 1.

**Check digraphs before single letters.** αι is not α + ι.

### Diphthongs

| Greek | Cue | Sounds like |
|---|---|---|
| αι | `eye` initial, `ye`/`ey` inside a word | aisle |
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
| γ | `g`, but `gh` before an e or i sound | see rule 5 |
| δ | `d` | |
| ε | `eh` [31/59] | as in met |
| ζ | `dz` | as in adze |
| η | `ay` | as in obey, long |
| θ | `th` [14/14] | as in thing |
| ι | `ee`; `y` when it glides onto a vowel | Ἰουδαῖος → `yoo` |
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
| υ | `oo` | see rule 7 |
| φ | `f` [17/17] | not `ph` |
| χ | `kh` [6/8] | as in loch |
| ψ | `ps` | as in lips |
| ω | `oh` | as in tone, long |

**Rough breathing** — a word starting ἁ ἑ ἡ ὁ ὑ ὡ takes an `h`. [58/59]
ὁ → `ho`, ὅς → `hoss`, ἵνα → `hin ah`.
Smooth breathing adds nothing.

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

## 2. The seven things that go wrong

Each of these cost a re-recording. They are the whole reason this document
exists.

### 1. Capital letters
A capital makes the voice treat the cue as a name.
**Never use one.** Cues are lower case throughout.

### 2. The cue spelling an English word
The voice has a dictionary and will prefer it, with English vowels and
English stress. This is the most common failure.

| Was | Read as | Fixed to |
|---|---|---|
| `Theos` (θεός) | THEE-oss | `theh oss` |
| `Simon` (Σίμων) | SIGH-mun | `see mohn` |
| `ecclesia` (ἐκκλησία) | ecclesia | `ek klay see ah` |
| `eh goh` (ἐγώ) | EE-go — it spells *ego* | `e goh` |
| `gnosis` (γνῶσις) | silent g | checked, g was sounded |
| `pseudo my` (ψεύδομαι) | silent p | `psew do my` |
| `sos` (σός) | S.O.S. | `sauce` |
| `pass` | short cat vowel | use `pahss` |

Read the cue back as if it were English. If it *is* a word, change it.

### 3. Every token being a letter name
`eh pee` is E and P, so ἐπί was spelled out. Watch for `ay bee see dee ee
eff gee jay kay ell em en oh pee cue ar ess tee you vee ex why zee`.

ἐπί `eh pee` → `eppee`  ·  ἔτι `eh tee` → `etih`

One letter-name token among others is usually fine — `pee stew oh` works.
The fault is when the whole cue is nothing but letter names.

### 4. Spaces are beats
A space is a pause. Too many and the clip is a list of syllables rather than
a word. **Target about 0.5 seconds per syllable.**

Ἰουδαῖος `ee oo deye os` was 3.81s. Bound to `yoodaios` it is 1.46s.
δόξα `do ksah` was 2.01s. `doksah` is 1.08s.

Use as few tokens as you can while keeping the vowels unambiguous. One
token per two syllables is a good default; the pack averages two tokens for
a three-syllable word.

### 5. Soft g
English reads `g` before e and i as /dʒ/. Greek gamma is always hard.

γίνομαι `gin oh my` → JIN-oh-my. Fixed to `ghee no my`.
γινώσκω `gee noh skoh` → also soft. Fixed to `ghee noh skoh`.

**Use `gh` before any e or i sound.**

### 6. Doubled consonants can invent a syllable
πᾶς `pahss` came out "pa has" — the voice found a break at the h.
A single `s` matches the pattern that works: μέγας is `meh gahs`.
Try the single consonant first.

### 7. Clusters English does not allow
English cannot begin a word with `pn` or `ps`, and drops the stop.
πνεῦμα came out "nyoo mah" with no pi at all.

A light helper vowel forces it: πτωχός → `puh toh koss`, and the same trick
works for πν-. ψ- is usually fine as `ps` (ψυχή → `psoo khay`).

---

## 3. Stress

Greek marks it. The accent (ά ὰ ᾶ) sits on the stressed syllable, and the
cue should land the stress there.

ἐγώ is stressed on the **second** syllable — e-GOH, not EE-go.
ἔτι is stressed on the **first** — ET-i, not eh-TEE.
κύριος is stressed on the **first** — KOO-ree-oss.

There is no reliable way to mark stress in an Atlas cue, so it has to come
out of the shape: don't give an unstressed syllable a long vowel. ἔτι's
`tee` was long *and* a letter name; `tih` is short and unstressed, which is
what the word needs.

---

## 4. Producing a cue, step by step

1. Split the Greek into syllables.
2. Map each one with the tables above — **digraphs first**.
3. Join into as few tokens as the vowels allow.
4. Read the result back as English. Is it a word? Is every token a letter
   name? Is there a `g` before an e or i? Does a doubled consonant invite a
   break? Fix each.
5. Check the stress lands where the Greek accent is.
6. Aim for 0.5 seconds per syllable. If the clip comes back much longer,
   close up the spaces and try again.

### Worked examples

| Greek | Syllables | Cue | Why |
|---|---|---|---|
| ἐκκλησία | ἐκ-κλη-σί-α | `ek klay see ah` | η = ay, -ια = ee ah |
| μνημεῖον | μνη-μεῖ-ον | `mnay may on` | η = ay, ει = ay, mu must sound |
| δικαιόω | δι-και-ό-ω | `dee keye oh oh` | αι = keye, -οω = o oh |
| ἀσθενής | ἀ-σθε-νής | `asthenays` | -ης = ays, bound to avoid staccato |
| ψυχή | ψυ-χή | `psoo khay` | ψ = ps, υ = oo, χ = kh, -η = ay |
| ἔρχομαι | ἔρ-χο-μαι | `air kho my` | χ = kh, -ομαι = o my |
| πρῶτος | πρῶ-τος | `protos` | one word; `prohtos` split into pro-ho-tos |

Every cue in that table is one that ships and has been heard. Where the
tables above and a shipped cue disagree, the shipped cue is not
automatically right — χαίρω ships as `kyro`, which drops the chi to a plain
k and has never been checked by ear. The rules are the better guide.

---

## 5. Ground truth

`docs/erasmian_ipa.json` holds a verified IPA transcription of all 511
words, derived by rule from the Greek and checked against the app's own
alphabet table, the syllable count and the written accent. If a cue is in
doubt, that file says exactly what the target is.

Example: πνεῦμα is `pə.ˈneu̯.ma` — helper vowel, stressed second syllable,
ευ as one diphthong.

---

## 6. Format

22050 Hz mono, 64 kbps MP3, about 0.25s of tail padding.
The bare citation form only — the word as it appears on the card, not the
lexical line. θεός, not "θεός, -οῦ, ὁ".

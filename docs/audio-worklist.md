# Vocabulary still needing audio — Everyday Koine

**None. All 818 entries have a clip.** The 307 that this file used to list
were recorded, re-encoded to the pack's 64 kbps and installed; six were then
re-recorded after a first listen (663, 734, 735, 788, 791, 817).

Regenerate this list if the deck ever grows:

```
python tools/build_cues.py
```

It reads `data/vocab.js`, finds any entry with no clip on disk, and produces
two candidate cues per word from the rules in `docs/atlas-cue-guide.md`,
flagged with the failure modes that guide records.

## Where the record lives now

| | |
|---|---|
| `docs/atlas-cue-guide.md` | the rules, including what the 511–817 round overturned |
| `docs/erasmian_vocab_cues.json` | the original 470 |
| `docs/erasmian_vocab_cues_v3_black.json` | the 41 added for Black |
| `docs/erasmian_vocab_cues_v4_tail.json` | the 307 tail |

Each cue-sheet row carries a `source`. **`ear` means the clip was heard and
the cue is what produced it. `worklist-candidate` means it was not** — the
clip exists and was generated from that cue by a first pass, but nobody has
confirmed by listening that the cue is what should be reused. Of the tail,
27 are `ear`, one is `ear-compromise` (ξηραίνω, where Atlas cannot begin a
word with *ks* and a helper vowel is the least bad option), and 279 are
candidates.

That distinction is the point of the sheet. A cue whose output has been heard
can be reused with confidence; one that has not is a starting point, and
treating it as fact is how the pack ended up with words nobody had listened
to in the first place.

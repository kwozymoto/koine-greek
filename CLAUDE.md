# Working rules for this repo

A published Koine Greek PWA that teaches. A confident wrong answer here is
worse than no answer, because it arrives with the app's authority behind it
and nobody has a reason to doubt it.

These rules exist because of specific things that went wrong, and each one
names what.

---

## 1. Never reproduce data from memory

**This is the rule the other rules serve.** Every error this project has
shipped or nearly shipped came from writing out something that was already in
a file, instead of reading it.

- A genitive absolute taught in chapter 20 for months: `λέγοντος αὐτοῦ ταῦτα`,
  a phrase occurring nowhere in the New Testament.
- Six of the twenty `CASEFN` syntax questions quoting Greek that is not in
  the text — including the same fabricated genitive absolute, again.
- Rewriting a lesson, retyping its `v:` and `vids:` fields and inventing
  three YouTube ids and two lecture durations along the way.

So, mechanically:

- **Greek comes from `data/gnt/`.** Search the corpus for the phrase you want,
  verify it, then quote it. Do not write a verse you remember.
- **Identifier fields are lifted, never retyped.** When replacing a record,
  extract the fields you are not changing from the record you are replacing,
  and assert the lift succeeded. See the header of `tools/check_frozen.py`.
- **Prefer surgical edits** to rewriting a record. If a script rewrites an
  entry, it must carry every field it is not deliberately changing.
- If a fact came from Black, Huffman or any book, **open the book**. They are
  in `../Greek App Reference/` — read only, never copied into the repo. They
  parse cleanly; `tools/check_black.py` reads Black's vocabulary sections
  every run. An earlier attempt at that looked unreliable and was not: the
  extractor required each English gloss to begin with a capital, which
  silently dropped μή and οὐ. **Before concluding a source cannot be parsed,
  check that the parser is not the thing at fault.**

## 2. Run the checkers, and read what they say

```bash
python tools/check_all.py
```

Fourteen checkers. Green before every commit, no exceptions. `--offline`
skips only `check_links`, the one that needs the network.

`check_frozen` is the odd one and the important one. It does not ask whether
anything is true; it asks whether a protected field changed since `git HEAD`
and makes you say you meant it (`--accept`). Protected: each chapter's `v:`
and `vids:`, every existing `VOCAB` row, `VOCAB_AUDIO`, and paradigm titles
and captions. Those have no derivable truth — only a history.

`check_coverage` reads Black's section list beside each chapter and asks
what has no counterpart. It exists because chapter 7 taught the first aorist
and nothing about second aorists — 58% of the aorist active indicatives in
the corpus — and no checker found it; a person did, once. It fails for
chapters listed as done and reports the rest as a work list. **Add a chapter
to its DONE set when you finish it.**

`check_black` is the third guard on `v:`, and the only one that can say the
array is *wrong* rather than merely changed: it reads Black's own vocabulary
sections and confirms every word. Currently 395 of 395. The books are outside
the repo, so it says so and exits clean when they are not on the machine.

When you add data of a kind no checker covers, **write the checker in the
same commit.** Every hand-written Greek array in `js/app.js` now has one —
`ART`, `PARSE`, `BUILD_FORMS`, `PP`, `CASEFN` and `LOOKALIKE`. The next thing
added without one is the next `CASEFN`.

## 3. Files keyed by position are append-only

`data/vocab.js` is the master. Cards (`S.cards`), audio filenames
(`VOCAB_AUDIO`), example verses (`EXAMPLES`), passage words and clause rows
are all keyed by its array position. **Removing or reordering a row silently
reassigns a real person's progress.** Index 237 is retired rather than
deleted for exactly this reason.

Regenerate after the deck grows: `build_examples.py`, `build_gloss_map.py`,
`build_readings.py`, `build_clauses.py`, `build_forms.py`.

Paradigm schedules are keyed by `title|caption|column` (`js/grid.js`), so
renaming a table resets everyone's history on it.

## 4. Quote the New Testament with its address

In a lesson body:

```html
<p class="v" data-ref="Mark 2:12">ὥστε ἐξίστασθαι πάντας</p>
```

`check_lessons` requires that Greek to occur contiguously in that verse. Bare
references in prose are resolved too. The syntax tables in `data/paradigms.js`
use `data-ref` and `data-claim` the same way.

## 5. Git

- **Never `git add -A` or `git add .`** — stage by name and read
  `git status --short` before committing. `git add -A` twice swept in files
  that must not be published.
- Copyrighted books, phone screenshots and reference PDFs live in
  `../Greek App Reference/`, outside this repo, so no command run in here can
  reach them.
- Deleting a file does not remove it from a public history.

## 6. Shipping

- Bump `VERSION` in `sw.js` on every deploy, or the service worker serves the
  old shell.
- New file? Add it to `SHELL` in `sw.js` **and** to `index.html`. Script load
  order is load-bearing; there is no build step.
- Confirm on `https://kwozymoto.github.io/koine-greek/` afterwards.
- Testing locally: the service worker caches hard. Unregister it and clear
  `caches` **before each round**, then reload twice, or you are testing stale
  JavaScript and will believe a fix failed when it did not.

## 7. Lessons

`docs/lesson-style.md` holds the voice and the chapter shape, drawn from
Fraser's own sermons and teaching notes with each trait quoted from its
source. Read it before writing or editing a chapter.

**Rewriting a chapter means rewriting its quiz in the same pass.** The
questions belong to the sections: `sec` counts the opening as part 0,
inserting a section shifts every `sec` after it, and every headed part needs
at least one question. `check_lessons` enforces both for chapters in its
`DONE` set — add yours to it when a batch lands.

Length is settled: about 950 words and 6–8 parts per chapter. Black is taught
at a chapter a week over a year, and the week goes on paradigms and
vocabulary, not on reading. The prose is scaffolding.

## 8. What no checker can do

None of them can check English. Whether a gloss is the right translation, or
a grammatical explanation correct, needs a reader. That is the standing
limitation, it is why lesson batches are reviewed before the next begins, and
it is not a reason to relax anything above — it is the reason not to.

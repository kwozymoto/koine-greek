# How the chapters are written

The 26 chapters are being rewritten from summaries into lessons — from about
7,200 words to about 31,000 — so that the app teaches Greek on its own rather
than depending on an outside video series. This is the standard they are
written to.

The voice is Fraser's, taken from 55 sermon manuscripts (119,000 words) in
`Documents/Fraser Sermons`, the adult Sunday school material in
`Documents/Redeemer Documents/Adult Sunday School`, and the *Truth & Light*
teaching notes. It is not imitated from a style description; the traits below
were read off those documents, and each one is quoted so the next batch can
be held to the same standard.

---

## The register

Formal but natural. Written to be read by an adult who has chosen to learn
this and will not be patronised, by someone who teaches for a living and is
not showing off.

**Short declarative sentences, often one idea per line.** The sermons break
lines at the thought, not at the margin. Long subordinate chains are rare.

**Signpost where you are going, then go there.**

> "Broadly speaking, the Gospel of John is divided into two major sections."
> "Put simply, having called His followers to genuine belief, He now
> explains what it looks like to live as His followers."
> "Having (hopefully) established what a Sacrament is, we can now look at
> what a Sacrament is not."

**Headings are questions when a question is what the reader has.** The Sunday
school material does this throughout: *What is a sacrament? How many
sacraments are there?*

**Raise the question the reader is already asking, then answer it.**

> "This makes it clear that not all belief is genuine belief, which then
> raises the question, 'What is genuine belief, and how can we know that we
> genuinely believe?'"

**Say when something is hard. Do not pretend it is not.**

> "Now, I know there is a lot there, and the language can be pretty
> confusing, but it's important that we get a solid understanding of what
> Sacraments are so that we can appreciate their significance for us."

**First person plural.** *we read*, *we're told*, *let's*, *the passage we're
looking at*. Not "the student will observe".

**No jokes, no exclamation marks, no rhetorical flourish for its own sake.**
Warmth comes from directness, not from decoration.

**New Zealand spelling** — *emphasise*, *recognise*, *favour*, *practise* the
verb and *practice* the noun.

---

## Explaining a grammatical point

This is the register that matters most here, and the sermons already have it.
The pattern is consistent:

**1. Name what the form actually does, plainly.**

> "the Hebrew verb actually means to strengthen. There's nothing inherently
> negative in the verb."

**2. Show what it would say if you followed the grammar strictly.**

> "If we were to follow the Hebrew grammar, this would say, 'The earth
> swallows them'."
> "The Greek literally reads, 'the shepherds feared a great fear'."

**3. Say why a translation does something else, and do not sneer at it.**

> "Most translations go with swallowed because it fits the context, it makes
> sense that it would be referring to Egypt."
> "It is right to translate it as 'prune' here, but it's important that we
> don't miss the fact that Jesus is using cleansing language."

**4. Do not overclaim.** The grammar settles what it settles and no more.
Where the form allows two readings, say both and say what decides between
them — that is the honest answer and it is also the useful one.

**5. Keep it proportionate.** The sermons are aware that Greek can be
overdone: *"and again the Greek is even clearer (I promise this is the last
time I'll bring up Greek)"*. A chapter should feel like it is teaching
someone to read, not performing.

---

## The shape of a chapter

Each `<h3>` is one part, and Today serves **three parts a sitting**
(`LESSON_DOSE` in `js/app.js`), so design the part breaks before writing the
prose, not after. A part should be a coherent two minutes, and each group of
three should be a coherent sitting.

**The part count decides how the chapter divides.** Six is 3+3, eight is
3+3+2, nine is 3+3+3. **Seven is 3+3+1** — you open Today, get one short
section, and it is over. Ten is the same. Aim for 6, 8 or 9 and never 7;
`check_lessons` fails a finished chapter that divides badly.

Chapters 1, 3 and 5 were each seven, because I wrote the prose and let the
headings fall where they landed. Merging two overlapping sections fixed two of
them and the third gained the section on elided prepositions it was missing
anyway — which is the usual outcome. A chapter that divides badly is often a
chapter with a section too many or one too few.

Then check what each sitting actually contains. Chapter 4 reads masculine /
neuter / the article; chapter 7 reads how the imperfect is built / what it
means and the aorist / εἰμί and the traps. If a sitting has no theme, the
breaks are in the wrong place.

```
<h3>The idea</h3>          what this form is, and why Greek has it
<h3>The forms</h3>         the table (most chapters already have one)
<h3>In the text</h3>       a real verse, quoted, broken down
<h3>...</h3>               one part per construction or use
<h3>What to watch for</h3> the mistake a reader actually makes
```

**Rewrite the quiz in the same pass as the body, never afterwards.** A
chapter's questions belong to its sections, and changing the sections without
changing the questions breaks both.

Every headed part gets at least one question filed against it with `sec:`.
Today serves three parts a sitting, and a part with nothing to answer is a
page you read and close. `check_lessons` fails a finished chapter that has
one.

`sec` counts the **opening as part 0** — whatever precedes the first `<h3>` —
so a chapter with six headings has parts 0 to 6. Inserting a section shifts
every `sec` after it. Getting this wrong files a question before the section
that teaches it, which the checker also catches.

And when a script edits a quiz, **never use an existing question as a
replace-anchor without re-emitting it.** Doing that deleted chapter 2's
question on the augment silently, and "none unfiled" does not notice, because
it only counts questions that still exist. Count the questions before and
after.

---

## Quoting the New Testament

**Every quotation is marked up, and the checker holds it to the text:**

```html
<p class="v" data-ref="Mark 2:12">ὥστε ἐξίστασθαι πάντας</p>
```

`tools/check_lessons.py` requires that phrase to occur, contiguously, in that
verse. This is not optional and it is not bureaucracy. Six of the twenty
syntax questions in `js/app.js` quoted Greek that occurs nowhere in the New
Testament — plausible, well-formed, remembered rather than looked up, and one
of them was a genitive absolute that had *already* been found and fixed in
chapter 20. Prose written from memory does this. Quote from `data/gnt/`.

Bare references in the prose (`Matt 3:17`) are also resolved by the checker,
so they cannot point at a verse that does not exist.

---

## What the corpus can do for you

The app already holds material that a chapter should lean on rather than
duplicate:

| | |
|---|---|
| `data/gnt/` | every word of the New Testament, parsed. Quote from here. |
| `data/clauses.js` | 630 sentence questions the drill already asks |
| `data/paradigms.js` | 28 tables, 45 playable rounds, every cell corpus-checked |
| `data/forms.js` | 1,477 real inflected forms with references |
| `data/examples.js` | one verse per vocabulary word |

A chapter does not need to print a paradigm the Tables tab already has; it
needs to teach the reader what the paradigm is *for*, and then send them to
fill it in.

---

## Checking the content

Voice is Fraser's. **Substance is checked against Black and Huffman**, in
`Documents/Greek App Reference/` — read them, then write the point in our own
words. Neither is quoted, and neither is stored in this repo. Where they
disagree with each other, or where Black's terminology is dated (his
"perfective" against the modern "aspect"), say what is standard now and note
the older term, because the reader will meet both.

What no checker can verify is the English. That is the trade this rewrite
makes, and it is why batches are reviewed before the next one starts.

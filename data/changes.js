/* What's new — the update log in Settings.

   Significant changes a learner would notice: features, fixes, audio and
   words. Not website plumbing. Newest first, one entry per day.

   `v` is the last release of that day's work, and tools/check_changes.py
   holds every entry to git: that release must exist and its commit must be
   dated `d`. So a date here is a fact, not a memory. (The release being
   prepared, not yet committed, may be named if it is sw.js's VERSION and
   the date is today.)

   k: "new" | "better" | "fix" | "audio" | "words". Plain text only — the
   page escapes it. */
const CHANGES=[
{d:"2026-09-26", v:"v263", items:[
  {k:"audio", t:"40 more words re-recorded with the clearer pronunciation, each chosen by ear."}
]},
{d:"2026-09-25", v:"v261", items:[
  {k:"new", t:"A light theme. Settings → Appearance: same as your device, light, or dark."},
  {k:"new", t:"Arrange Today: reorder the sections below the plan, or hide the ones you do not use."},
  {k:"new", t:"Quick test: 10, 25 or 50 words from a chapter or the commonest, marked at the end, without touching your review schedule."},
  {k:"new", t:"Where you struggle: the parsing drills and paradigm rounds note which categories you miss most — the aorist, say, or the genitive — with a drill of just those forms."},
  {k:"new", t:"Word of the day on Today, the same word for everyone on the same day."},
  {k:"new", t:"Share a passage: a link that opens the reader with the verses marked, for a class or group."},
  {k:"new", t:"Printable sheets: each chapter's vocabulary, the whole vocabulary, and the paradigm tables."},
  {k:"new", t:"This update log."},
  {k:"audio", t:"Chapter 8 read aloud."},
  {k:"audio", t:"40 more words re-recorded with the clearer pronunciation, each chosen by ear — the coming words of the day first, starting with ἐνδύω."},
  {k:"better", t:"Progress is now Settings, with settings first. Today has a “Your progress” link that goes straight to your numbers."},
  {k:"better", t:"Today's sections have their own headings, and a pinned passage can be unpinned from Today."},
  {k:"better", t:"Ending the passage you are working on, marking it complete, or unpinning a passage now asks first."},
  {k:"better", t:"Learning the letters says plainly that every letter comes back until you know it — moving on is always safe."},
  {k:"fix", t:"Drilling the words you missed in a test no longer added words you had never met to your review schedule."},
  {k:"fix", t:"An unpinned passage no longer came back after syncing with another device."},
  {k:"fix", t:"Look up: the highlighted word in an example verse no longer broke onto a line of its own."}
]},
{d:"2026-09-24", v:"v239", items:[
  {k:"audio", t:"Chapters 6 and 7 read aloud."},
  {k:"audio", t:"The tables and quoted verses in chapters 2 to 5 are now read aloud too, and chapter 1 plays its alphabet."},
  {k:"audio", t:"Eighty of the commonest words re-recorded with a clearer pronunciation, each chosen by ear."},
  {k:"better", t:"Sync now uses a private code one device makes, instead of a phrase you invent. Phrases already in use still work."},
  {k:"new", t:"An About page, with answers to common questions."}
]},
{d:"2026-09-23", v:"v225", items:[
  {k:"audio", t:"Chapters 3, 4 and 5 read aloud."},
  {k:"audio", t:"All 24 letters and the eight diphthongs re-recorded, each chosen by ear, and every extra form of a word heard and passed."}
]},
{d:"2026-09-22", v:"v212", items:[
  {k:"audio", t:"Every word's recording has now been listened to and passed by a person — many re-recorded along the way."}
]},
{d:"2026-09-18", v:"v201", items:[
  {k:"fix", t:"Installed on a computer, the app never offered updates. It now checks while it is open."}
]},
{d:"2026-09-17", v:"v179", items:[
  {k:"new", t:"Write it from memory: write the word with a finger, or type it on a Greek keyboard."},
  {k:"better", t:"Finish now ends a drill with its summary, and the buttons at the end of a drill say what they do."},
  {k:"better", t:"The writing pad uses the whole width with the phone turned sideways."},
  {k:"fix", t:"Many vocabulary questions could be answered without knowing any Greek — the right answer was often the only one with a case in brackets, or the only verb. The wrong options now match the right one."}
]},
{d:"2026-09-16", v:"v162", items:[
  {k:"new", t:"Grammar words explained: type a term like anarthrous or participle into Look up. Sixty-eight terms, checked against the grammars."},
  {k:"better", t:"ἐκεῖνος has its own full table, and the adjective table shows the plural."}
]},
{d:"2026-09-15", v:"v159", items:[
  {k:"audio", t:"Chapters 1 and 2 read aloud, each word lit as it is spoken. Tap a word to start from there."},
  {k:"new", t:"New tables: the optative, and the vocative."},
  {k:"better", t:"Chapter 2 rewritten for someone meeting the words for the first time."},
  {k:"fix", t:"The Numbers table skipped eight to eleven; they are there now."}
]}
];

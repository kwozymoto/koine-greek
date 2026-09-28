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
{d:"2026-09-28", v:"v277", items:[
  {k:"fix", t:"Chapters 11, 15, 21, 23, 26 and 27: the right answer to a lesson question is no longer the one that stands out by being longest or by carrying a note. More chapters to follow."},
  {k:"better", t:"Flash cards: picking a set now drills it straight away, leaving the schedule alone. Or choose “Make it today’s focus”, and Today teaches its new words while your usual review carries on."},
  {k:"better", t:"Studied Greek before? Settings can now put the words of the chapters you have done straight into review, and placing yourself past chapter 1 keeps the letters counted as done even if you slip on one later."},
  {k:"better", t:"The letters: Today shows how many you have met and settled, names the five it will teach, and a letter being taught again says so."},
  {k:"better", t:"Lesson questions come in a fresh order each time, so a question met again cannot be answered by remembering where the answer was."},
  {k:"fix", t:"Wide lesson tables scroll inside their own box on a phone instead of pushing the page sideways at the larger text sizes."},
  {k:"fix", t:"Practice flash cards no longer say they schedule the word or show intervals they are not setting."},
  {k:"fix", t:"Look-alikes and Produce a real form no longer give the answer away: notes moved to the feedback, and forms shown without a sentence’s capital or an extra accent."},
  {k:"fix", t:"A chapter finished with most of its questions wrong says it has been read, rather than “well done”. Its questions come back in your reviews either way."},
  {k:"fix", t:"Wording in chapters 1, 2 and 21: the letters easily misread, the middle voice, and how often the participle is adverbial."},
  {k:"new", t:"Using Mounce's Basics of Biblical Greek? Settings → Your textbook. New words then come in the order of his chapters, which also appear on the Learn page, in the deck picker and quick test, and in Settings. Lessons and paradigms stay on Black."},
  {k:"new", t:"Joining a Mounce class part-way through? Settings can put his chapters up to the one you have reached straight into review."},
  {k:"fix", t:"Verb parsing no longer offers two right answers: a form of εἰμί could be shown beside λύω's identical parse, and choosing that one was marked wrong."},
  {k:"fix", t:"Looking at a later chapter no longer loses your place in the one you are working through."},
  {k:"fix", t:"Today's plan keeps what you have done: a finished row stays as it was, and picking a flash-card set during the day adds its rows rather than ticking them."},
  {k:"fix", t:"Reviews bring back the lesson questions you got wrong first, as the help page says."},
  {k:"fix", t:"Fill the grid and Paradigm sprint start with tables from the chapters you have done before going ahead of the course."},
  {k:"fix", t:"Vocabulary due now no longer hands out new words when nothing is due, and Today says when a review is lesson questions."},
  {k:"fix", t:"Mounce: restoring a backup keeps your textbook, and chapter 35 in Settings is the same size as the other chapters."}
]},
{d:"2026-09-27", v:"v272", items:[
  {k:"fix", t:"Learning new words: the question after each card no longer gives the answer away by its shape — a verb set among nouns, or the only meaning with a case in brackets. The wrong answers are now words of the same kind."},
  {k:"fix", t:"English → Greek: the wrong answers are now words of the same kind too, so a verb is no longer the only word ending like a verb, nor a name the only one with a capital."},
  {k:"fix", t:"A name such as “Paul” is no longer the only capitalised meaning among the four answers."},
  {k:"fix", t:"The word drills no longer show the same meaning twice among the four answers."}
]},
{d:"2026-09-26", v:"v270", items:[
  {k:"audio", t:"160 more words re-recorded with the clearer pronunciation, each chosen by ear."}
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

/* Grammar words the app itself uses, explained.

   This exists because of a specific complaint, and it is worth writing the
   complaint down: "The lesson two content isn't good. It's confusing for a
   first time learner, using words/terms that haven't been explained. What's
   a participle, a paradigm, what does infinitive mean? Too much assumed
   knowledge."

   So the list is not a glossary of Greek grammar in general. It is the
   vocabulary THIS APP USES, counted across the twenty-seven chapters, their
   quizzes and the reference tables. A term nobody meets here does not need
   an entry here, and tools/check_terms.py fails if one creeps in: an earlier
   audit asked for anaphoric, suppletive, substantive, copula and concord,
   and the app uses none of the five.

   The other direction matters more. WATCH in check_terms.py lists the words
   a first-year reader will not know, and any of them the app starts using
   has to be explained here or the checker fails. That is the guard against
   the thing that went wrong in chapter 2.

   [term, what it means, an example, the chapter that teaches it]

   The chapter is the one whose SUBJECT the word is, read off the chapter
   titles: aorist is chapter 7, "Imperfect and aorist active indicative".
   It was briefly the first chapter that uses the word, derived
   automatically, and that sent a reader to chapter 1 -- the alphabet -- to
   learn the genitive, because chapter 1 mentions the dative case in passing
   and lists the case names as quiz options. check_terms holds each number
   to the one thing about it that stays mechanical: that chapter has to use
   the word. 0 means no chapter uses it and it lives only in the tables.

   Greek in the examples comes from the New Testament, never from the λύω
   teaching paradigm: λέλυκα, λύειν, λύων and ἔλυον occur nowhere in the text,
   and a reader looking a word up deserves a form they might actually meet.
   check_terms holds every Greek word here to the corpus. */
const TERMS = [

["accent", "The mark over a vowel. Greek has three — acute (ά), circumflex (ᾶ) and grave (ὰ) — and sometimes the accent is the only difference between two words.", "εἰ is “if”; εἶ is “you are”", 1],

["accusative", "The case for the direct object: what the verb acts on.", "λόγον — a word, as the thing being spoken", 4],

["active", "The voice where the subject does the action.", "", 3],

["adjective", "A word that describes a noun. In Greek it takes the case, gender and number of the noun it describes.", "", 6],

["anarthrous", "Without the article. Saying a noun is anarthrous is just saying there is no ὁ, ἡ or τό in front of it.", "θεός standing on its own", 21],

["antecedent", "The noun a relative pronoun points back to. In “the word which he spoke”, the antecedent of “which” is “word”.", "", 23],

["aorist", "The tense-form that presents an action as a simple whole, without saying whether it went on or was finished. In the indicative it usually refers to the past, but the aspect is the point and the time is secondary. The commonest tense-form in the New Testament: 11,572 of them.", "", 7],

["apodosis", "The “then” half of a conditional sentence. The “if” half is the protasis.", "", 0],

["article", "Greek's word for “the” — ὁ, ἡ, τό. There is no word for “a”: a noun without the article is simply indefinite.", "", 4],

["aspect", "How the writer chooses to present an action: as ongoing, as a simple whole, or as a state that now stands. This is what a Greek tense-form tells you first. Time comes second, and outside the indicative it often does not come at all.", "", 2],

["athematic", "A verb that puts its endings straight onto the stem with no connecting vowel. These are the μι-verbs.", "δίδωμι", 0],

["attendant circumstance", "A participle carrying an action alongside the main verb, read as though it were a second main verb: “he went and said”.", "", 0],

["attributive", "An adjective sitting inside the article group, describing the noun rather than asserting something about it.", "ὁ ἀγαθὸς λόγος — “the good word”", 6],

["augment", "The ἐ- put on the front of a verb to mark past time in the indicative. Where the verb already starts with a vowel, the vowel lengthens instead.", "ἀκούω — I hear; ἤκουσα — I heard", 7],

["breathing", "The mark every word beginning with a vowel carries. Rough breathing adds an h sound; smooth breathing adds nothing.", "", 1],

["case", "The form a noun takes to show its job in the sentence. Greek has five: nominative, genitive, dative, accusative and vocative.", "", 4],

["clause", "A group of words with its own verb. One sentence can hold several.", "", 21],

["conjugation", "Running a verb through its persons and numbers. What declension is for nouns, conjugation is for verbs.", "", 26],

["contract verb", "A verb whose stem ends in a vowel, so that vowel and the ending run together into one sound.", "ἀγαπάω becomes ἀγαπῶ", 19],

["dative", "The case for the indirect object, and for the means, manner or place of something. Often “to”, “for”, “with” or “in”.", "", 4],

["declension", "Two things at once: running a noun through its cases, and the family a noun belongs to. Greek has three declensions.", "", 4],

["deponent", "A verb that is middle or passive in form but active in meaning. There is nothing passive about it; that is simply how the word is spelled.", "ἔρχομαι — I come", 12],

["distributive", "A word or phrase that shares something out: two by two, each in turn.", "", 8],

["enclitic", "A short word that leans on the word before it and gives up its own accent, sometimes throwing an extra accent back onto its neighbour.", "μου, τις", 23],

["ending", "The letters at the end of a word that carry its grammar. In Greek the ending does the work that word order and small words like “to” and “of” do in English.", "", 3],

["feminine", "One of the three genders. Grammatical, not biological.", "", 5],

["future", "The tense-form for what will happen.", "", 3],

["gender", "Every Greek noun is masculine, feminine or neuter, and the choice is grammatical rather than biological.", "τέκνον — child — is neuter", 4],

["genitive", "The case usually translated “of”: possession, source, and a good deal besides.", "", 4],

["genitive absolute", "A participle and a noun, both in the genitive, standing loose from the main sentence and giving the circumstances of it.", "", 21],

["imperative", "The mood of command.", "", 25],

["imperfect", "The past tense-form that presents an action as ongoing: was doing, kept doing.", "", 7],

["imperfective", "The aspect that presents an action as in progress. The present and the imperfect carry it.", "", 2],

["indicative", "The mood of statement and question — the ordinary one. Four out of five verbs that carry a person and a number are indicative.", "", 2],

["infinitive", "The “to” form of a verb. It has tense and voice, but no person and no number.", "πιστεύειν — to believe", 22],

["interjection", "A word thrown into a sentence without joining its grammar.", "ἰδού — behold", 25],

["liquid verb", "A verb whose stem ends in λ, μ, ν or ρ. These form the future without the usual σ, and the ending contracts instead.", "μένω gives μενῶ", 19],

["main clause", "The clause that could stand as a sentence on its own. Everything else hangs off it.", "", 21],

["masculine", "One of the three genders. Grammatical, not biological.", "", 4],

["middle", "The voice where the subject is bound up in the action — doing it to itself, or for itself, or in its own interest. In most tenses it is spelled like the passive.", "", 12],

["mood", "What the speaker is doing with the verb: stating it (indicative), supposing or intending it (subjunctive), wishing it (optative), or commanding it (imperative).", "", 2],

["neuter", "One of the three genders. A neuter noun has the same form for nominative and accusative, always.", "", 4],

["nominative", "The case for the subject of the sentence.", "", 4],

["number", "Whether a word is singular or plural. A Greek verb ending carries the number of its subject, so the two have to agree.", "", 2],

["optative", "A fourth mood, for wishes and remote possibilities. Fading by the first century: the New Testament has 68, against 1,856 subjunctives.", "μὴ γένοιτο — may it never be", 25],

["paradigm", "A table of one word's forms, laid out so that the pattern is visible. Learning the pattern is the point; the table is only how it is shown.", "", 3],

["participle", "A verbal adjective. It has tense and voice like a verb, and case, gender and number like an adjective, and Greek leans on it constantly — nearly a quarter of all New Testament verb forms are participles.", "ὁ πιστεύων — the one who believes", 20],

["particle", "A short word that never changes its form and colours the sentence rather than naming anything.", "δέ, γάρ, μέν", 18],

["passive", "The voice where the subject is on the receiving end of the action.", "", 12],

["perfect", "The tense-form for an action whose result still stands. Not simply a past: the point is the present state.", "γέγραπται — it stands written", 10],

["perfective", "The aspect that presents an action as a simple whole. The aorist carries it.", "", 2],

["person", "First person is I and we, second is you, third is he, she, it and they. The Greek verb ending says which, so the pronoun is usually unnecessary.", "", 3],

["pluperfect", "A state that stood in the past as the result of something earlier still. Rare — 88 in the New Testament.", "", 10],

["predicate", "An adjective standing outside the article group, asserting something about the noun rather than describing it.", "ἀγαθὸς ὁ λόγος — “the word is good”", 6],

["principal parts", "The handful of forms of a verb that cannot be predicted from one another. Learn those and the rest of the verb follows.", "", 2],

["pronoun", "A word standing in for a noun: I, you, he, this, who.", "", 9],

["protasis", "The “if” half of a conditional sentence. The “then” half is the apodosis.", "", 0],

["reduplication", "Doubling the first consonant with an ε in front, to form the perfect.", "γράφω gives γέγραπται", 10],

["reflexive", "A pronoun pointing back at the subject: himself, themselves.", "", 23],

["relative pronoun", "The word that opens a clause describing a noun already mentioned: who, which, that.", "", 23],

["stative", "The aspect that presents a state now standing. The perfect carries it.", "", 2],

["stem", "What is left of a word when the ending is taken off — the part that carries the meaning.", "", 2],

["subjunctive", "The mood of what may or should be. Common after ἵνα and ἐάν.", "", 24],

["substantival", "Used as a noun. A Greek adjective or participle can stand on its own and mean “the one who”.", "ὁ πιστεύων — the one who believes", 21],

["tense", "The label for a verb's form — present, aorist, perfect and the rest. In Greek it tells you the aspect first and the time second, which is why “tense-form” is the safer word.", "", 2],

["unmarked", "Where a writer had two ways of saying something, the one chosen for emphasis is called marked and the one that is simply the default is unmarked.", "", 24],

["vocative", "The case for addressing someone directly.", "κύριε — Lord", 4],

["voice", "Whether the subject does the action (active), receives it (passive), or is caught up in it (middle).", "", 2],

];

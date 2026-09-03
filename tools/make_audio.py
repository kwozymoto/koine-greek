# -*- coding: utf-8 -*-
"""Speak the IPA in docs/erasmian_ipa.json through a neural voice.

    python tools/make_audio.py --pilot            # 15 words, SSML to stdout
    python tools/make_audio.py --pilot --speak    # ...and call the engine
    python tools/make_audio.py --all --speak      # all 511

Nothing is ever written over audio/vocab. Clips land in audio/_staging/, to
be listened to and moved across by hand — the whole reason the current pack
has words nobody has heard is that generated audio went straight into the
app.

WHY SSML AND NOT A RESPELLING. <phoneme alphabet="ipa" ph="ek.kleː.ˈsi.a">
is an instruction. The voice has no lexicon entry to consult and no decision
to make, which is what stops "see mohn" becoming Sea Moon. The string itself
is built and checked by tools/build_ipa.py and tools/check_ipa.py before
anything is spoken.

CHOOSING A VOICE. Two of this course's phonemes are not English: υ is /y/
("u as in French tu") and χ is /x/ ("ch as in loch"). An en-US voice will
usually approximate them — often as /u/ and /k/, which is what most English
speakers say anyway and what the app's own cue sheet already writes. A
de-DE voice has both natively, and Erasmian is a Continental reading
tradition, so German is worth hearing in the pilot before deciding. The
pilot prints both.

THE PILOT IS NOT OPTIONAL. The IPA is verified as text; whether a given
voice honours it is a separate question that only ears can answer. Listen to
fifteen before committing five hundred.
"""
import json, io, os, re, sys, argparse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IPA = os.path.join(ROOT, "docs", "erasmian_ipa.json")
STAGE = os.path.join(ROOT, "audio", "_staging")

# One word for each thing that can go wrong. Two of them (Σίμων, ἐκκλησία)
# are words the English voice actually got wrong, so the pilot says plainly
# whether this route fixes them.
PILOT = [
    "ἅγιος",      # rough breathing
    "ἄγγελος",    # gamma nasal — "angelos", not "ang-gelos"
    "ψυχή",       # ψ cluster
    "ἐξουσία",    # ξ, and a four-syllable word the old cue collapsed
    "χάρις",      # χ, the loch sound
    "υἱός",       # υ, the French u
    "ἡμέρα",      # η against ε in one word
    "λόγος",      # short ο twice
    "ὥρα",        # long ω under a rough breathing
    "πνεῦμα",     # initial πν, which the old clip dropped
    "μνημεῖον",   # initial μν, which the old clip dropped
    "γνῶσις",     # initial γν
    "ἐκκλησία",   # was read as the English "ecclesia"
    "Σίμων",      # was read as the English "Simon"
    "θεός",       # was read as the English "Theos"
]

VOICES = {"en": ("Joanna", "en-US"), "de": ("Vicki", "de-DE")}

def rows():
    if not os.path.isfile(IPA):
        sys.exit("docs/erasmian_ipa.json is missing — run tools/build_ipa.py")
    return json.load(io.open(IPA, encoding="utf-8"))

def ssml(ipa, word):
    """One <phoneme> element, with the word INSIDE it. If `ph` is honoured the
       content is ignored; if the engine rejects `ph` you hear the content
       instead, which is exactly the diagnostic you want. An empty element is
       undefined and can simply produce silence."""
    return '<phoneme alphabet="ipa" ph="%s">%s</phoneme>' % (ipa, word)

def document(rowset, gap="700ms"):
    """All of them in one <speak>, so the console needs a single paste."""
    body = "\n".join("  " + ssml(r["ipa"], r["greek"]) + '<break time="%s"/>' % gap
                     for r in rowset)
    return "<speak>\n" + body + "\n</speak>"

def speak_polly(rowset, voice, lang):
    try:
        import boto3
    except ImportError:
        sys.exit("boto3 is not installed — pip install boto3, and set up an "
                 "AWS key with polly:SynthesizeSpeech")
    p = boto3.client("polly")
    os.makedirs(STAGE, exist_ok=True)
    for r in rowset:
        out = p.synthesize_speech(
            Text="<speak>%s</speak>" % ssml(r["ipa"], r["greek"]),
            TextType="ssml", OutputFormat="mp3", VoiceId=voice,
            Engine="neural", LanguageCode=lang)
        name = "%03d_%s.mp3" % (r["index"], re.sub(r"\W+", "", r["greek"])[:14])
        io.open(os.path.join(STAGE, name), "wb").write(out["AudioStream"].read())
        print("   wrote audio/_staging/%s  %s" % (name, r["ipa"]))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pilot", action="store_true")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--speak", action="store_true")
    ap.add_argument("--voice", default="en", choices=sorted(VOICES))
    a = ap.parse_args()

    R = rows()
    if a.all:
        sel = R
    else:
        by = {r["greek"]: r for r in R}
        sel = [by[g] for g in PILOT if g in by]
        missing = [g for g in PILOT if g not in by]
        if missing:
            print("not in the deck, skipped: %s\n" % " ".join(missing))

    if not a.speak:
        print("EASIEST TEST — no account at all")
        print("  Any site that reads IPA aloud (search \"IPA reader\"; several")
        print("  front-end Amazon Polly) takes the bare string with no tags.")
        print("  Paste one of the middle-column strings below and press play.")
        print("  If it says the Greek word, this route works.")
        print()
        print("FULL TEST — free AWS account, hear all %d in one go" % len(sel))
        print("  1. console.aws.amazon.com/polly")
        print("  2. Above the text box are two tabs: Plain text and SSML.")
        print("     CLICK SSML. Left on Plain text the voice reads the tags")
        print("     out loud — that is what went wrong last time.")
        print("  3. Engine: Neural. Try Joanna (English), then Vicki (German).")
        print("     German has /y/ and /x/ natively and English has neither,")
        print("     so υ and χ are where the two will differ.")
        print("  4. Paste everything between the cut lines, and press Listen.")
        print()
        print("The %d words, in the order you will hear them:" % len(sel))
        for n, r in enumerate(sel, 1):
            print("   %2d. %-12s %-16s %s" % (n, r["greek"], r["ipa"], r["gloss"][:28]))
        print()
        # Written to a file, not just printed. Copying twenty lines out of a
        # terminal drops the tail often enough that the first attempt at this
        # produced an unclosed <speak> and an "invalid SSML" warning.
        os.makedirs(STAGE, exist_ok=True)
        path = os.path.join(STAGE, "pilot.ssml")
        io.open(path, "w", encoding="utf-8", newline="\n").write(document(sel) + "\n")
        print("Written to %s" % os.path.relpath(path, ROOT))
        print("Open it, select all, copy. That cannot lose the closing tag the")
        print("way a terminal copy can.")
        print()
        print("Or start with these three, short enough to copy by eye. Each is")
        print("a whole document on one line — paste ONE, including <speak>:")
        print()
        for r in sel[:3]:
            print("  " + "<speak>%s</speak>" % ssml(r["ipa"], r["greek"]))
        print()
        print("Whatever you paste must begin with <speak> and end with </speak>.")
        return
    voice, lang = VOICES[a.voice]
    print("speaking %d words as %s (%s) into audio/_staging/" % (len(sel), voice, lang))
    speak_polly(sel, voice, lang)
    print("\nNothing was written over audio/vocab. Listen first, then move "
          "the ones you keep.")

if __name__ == "__main__":
    main()

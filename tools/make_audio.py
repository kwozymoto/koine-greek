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

def ssml(ipa):
    """Polly and Azure both take this; Google wants the same <phoneme>."""
    return '<speak><phoneme alphabet="ipa" ph="%s"></phoneme></speak>' % ipa

def speak_polly(rowset, voice, lang):
    try:
        import boto3
    except ImportError:
        sys.exit("boto3 is not installed — pip install boto3, and set up an "
                 "AWS key with polly:SynthesizeSpeech")
    p = boto3.client("polly")
    os.makedirs(STAGE, exist_ok=True)
    for r in rowset:
        out = p.synthesize_speech(Text=ssml(r["ipa"]), TextType="ssml",
                                  OutputFormat="mp3", VoiceId=voice,
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
        print("%d words. Paste any line into the Amazon Polly console "
              "(console.aws.amazon.com/polly), pick a neural voice, and listen —\n"
              "no key or install needed to try it.\n" % len(sel))
        for r in sel:
            print("%-14s %-24s %s" % (r["greek"], r["ipa"], ssml(r["ipa"])))
        print("\nSuggested voices: %s"
              % ", ".join("%s (%s)" % (v[0], v[1]) for v in VOICES.values()))
        print("German is worth a listen: it has /y/ and /x/ natively, which "
              "English does not.")
        return
    voice, lang = VOICES[a.voice]
    print("speaking %d words as %s (%s) into audio/_staging/" % (len(sel), voice, lang))
    speak_polly(sel, voice, lang)
    print("\nNothing was written over audio/vocab. Listen first, then move "
          "the ones you keep.")

if __name__ == "__main__":
    main()

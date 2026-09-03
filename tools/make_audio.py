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

THE VOICE, settled by listening rather than by argument. Joanna (en-US)
repaired every sound English does not have: ψυχή "psy.ˈxeː" came back as
"Sue hay" — /ps/ reduced to /s/, /y/ to /uː/, /x/ to /h/ — and πνεῦμα lost
its pi exactly as the old clip had. Daniel (de-DE) on the generative engine
read every test word correctly, because German has /y/, /x/ and the initial
clusters natively. Erasmian is a Continental reading tradition, so this is
less of a compromise than it sounds.

Two things were learned the same way and are now in build_ipa.py: a
diphthong needs its second element marked non-syllabic (u̯, i̯) or the voice
reads two vowel letters as two segments, and πν- and πτ- need a light helper
vowel or the stop is dropped.
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

# Settled by listening, 2026-09-03. German, because two of this course's
# phonemes are not English: υ is /y/ and χ is /x/, and an English voice
# substitutes /uː/ and /h/ for them — ψυχή came back as "Sue hay". German has
# both natively, and Erasmian is a Continental reading tradition anyway.
# Daniel on the generative engine was the one that read every test word
# correctly. English is kept only so the difference can be heard again.
VOICES = {"de": ("Daniel", "de-DE"), "en": ("Joanna", "en-US")}
ENGINE = "generative"

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
    """All of them in one <speak>, so the console needs a single paste.
       No indent: the console counts every character towards its 3,000 limit,
       markup included, so two spaces a line costs most of a word."""
    body = "\n".join(ssml(r["ipa"], r["greek"]) + '<break time="%s"/>' % gap
                     for r in rowset)
    return "<speak>\n" + body + "\n</speak>"

def speak_polly(rowset, voice, lang, engine=ENGINE):
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
            Engine=engine, LanguageCode=lang)
        name = "%03d_%s.mp3" % (r["index"], re.sub(r"\W+", "", r["greek"])[:14])
        io.open(os.path.join(STAGE, name), "wb").write(out["AudioStream"].read())
        print("   wrote audio/_staging/%s  %s" % (name, r["ipa"]))

def batches(rowset, limit=2800):
    """Split into documents the console will synthesise directly.

       Anything over 3,000 characters the console sends to an S3 bucket
       instead of playing, and it counts the markup rather than just the
       words. 2,800 leaves room for the <speak> wrapper and a margin."""
    out, cur, n = [], [], 0
    for r in rowset:
        piece = len(ssml(r["ipa"], r["greek"])) + 22
        if cur and n + piece > limit:
            out.append(cur); cur, n = [], 0
        cur.append(r); n += piece
    if cur:
        out.append(cur)
    return out

def write_batches(rowset):
    """The console route, for when the API is blocked. Each batch is one
       paste and one Download MP3; the 700ms gaps let the file be split back
       into words afterwards, and split_batches checks it got exactly as many
       as went in — which is what makes this safe. A split with no expected
       count is how you silently attach the wrong clip to a word."""
    os.makedirs(STAGE, exist_ok=True)
    bs = batches(rowset)
    man = []
    for i, b in enumerate(bs, 1):
        name = "batch%02d" % i
        io.open(os.path.join(STAGE, name + ".ssml"), "w", encoding="utf-8",
                newline="\n").write(document(b) + "\n")
        man.append({"batch": name, "words": [
            {"index": r["index"], "greek": r["greek"], "ipa": r["ipa"]} for r in b]})
        print("   %s.ssml  %2d words  %s ... %s"
              % (name, len(b), b[0]["greek"], b[-1]["greek"]))
    io.open(os.path.join(STAGE, "batches.json"), "w", encoding="utf-8",
            newline="\n").write(json.dumps(man, ensure_ascii=False, indent=1) + "\n")
    print()
    print("%d batches in audio/_staging/. For each one:" % len(bs))
    print("  open the .ssml, select all, paste into the Polly console")
    print("  (German / Daniel / Generative / SSML tab), press Download MP3,")
    print("  and save it into audio/_staging as batch01.mp3, batch02.mp3 ...")
    print("Then tell me, and I will split and check them.")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pilot", action="store_true")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--batches", action="store_true")
    ap.add_argument("--speak", action="store_true")
    ap.add_argument("--voice", default="de", choices=sorted(VOICES))
    ap.add_argument("--engine", default=ENGINE)
    a = ap.parse_args()

    R = rows()
    if a.batches:
        write_batches(R)
        return
    if a.all:
        sel = R
    else:
        by = {r["greek"]: r for r in R}
        sel = [by[g] for g in PILOT if g in by]
        missing = [g for g in PILOT if g not in by]
        if missing:
            print("not in the deck, skipped: %s\n" % " ".join(missing))

    if not a.speak:
        print("SETTINGS, settled by listening on 2026-09-03:")
        print("    Language German (de-DE) · Voice Daniel · Engine Generative")
        print("    Console: console.aws.amazon.com/polly, and click the SSML tab")
        print("    before pasting — on Plain text the voice reads the markup out.")
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
    print("speaking %d words as %s (%s, %s) into audio/_staging/"
          % (len(sel), voice, lang, a.engine))
    speak_polly(sel, voice, lang, a.engine)
    print("\nNothing was written over audio/vocab. Listen first, then move "
          "the ones you keep.")

if __name__ == "__main__":
    main()

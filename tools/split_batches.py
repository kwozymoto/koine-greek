# -*- coding: utf-8 -*-
"""Cut the Polly console's batch downloads back into one clip per word.

    python tools/split_batches.py [--dry-run]

The console route exists because an AWS Organizations policy denies this
account polly:SynthesizeSpeech, so the API is unavailable while the console
still works. Each batchNN.ssml is one paste and one Download MP3; this puts
the pieces back where they belong.

WHAT MAKES IT SAFE. Splitting recorded speech into per-word clips is exactly
how you silently attach the wrong audio to a word, and that is the failure
this whole exercise exists to stop. The guard is that the expected answer is
known in advance: audio/_staging/batches.json records how many words went
into each batch and in what order, so a batch that does not split into
precisely that many pieces is rejected whole rather than guessed at. No
batch is ever partially accepted.

The gaps are the 700ms <break> elements written into the SSML, which is a
much cleaner signal than the pauses in natural speech.
"""
import json, io, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STAGE = os.path.join(ROOT, "audio", "_staging")
OUT = os.path.join(STAGE, "words")
DRY = "--dry-run" in sys.argv

try:
    from pydub import AudioSegment
    from pydub.silence import detect_nonsilent
except ImportError:
    sys.exit("pydub is needed — python -m pip install pydub (ffmpeg is already here)")

# The <break> is 700ms, so anything at or over 400ms of quiet is a gap and
# not a stop consonant. -40 dBFS is well below speech and well above the
# noise floor of a generated clip.
MIN_GAP_MS = 400
SILENCE_DB = -40
PAD_MS = 60          # keep a little air either side of each word


def slug(greek):
    return re.sub(r"\W+", "", greek)[:14]


def split_one(path, words):
    """Returns (segments, complaint). Never returns a partial batch."""
    audio = AudioSegment.from_file(path)
    for thresh in (SILENCE_DB, SILENCE_DB + 6, SILENCE_DB - 6):
        spans = detect_nonsilent(audio, min_silence_len=MIN_GAP_MS,
                                 silence_thresh=thresh, seek_step=5)
        if len(spans) == len(words):
            segs = []
            for a, b in spans:
                segs.append(audio[max(0, a - PAD_MS):min(len(audio), b + PAD_MS)])
            return segs, None
    return None, ("split into %d pieces at %d dBFS, expected %d words"
                  % (len(spans), thresh, len(words)))


def main():
    man_path = os.path.join(STAGE, "batches.json")
    if not os.path.isfile(man_path):
        sys.exit("audio/_staging/batches.json is missing — run "
                 "tools/make_audio.py --batches first")
    man = json.load(io.open(man_path, encoding="utf-8"))
    if not DRY:
        os.makedirs(OUT, exist_ok=True)

    done = skipped = missing = 0
    for b in man:
        mp3 = os.path.join(STAGE, b["batch"] + ".mp3")
        if not os.path.isfile(mp3):
            print("   %-9s no mp3 downloaded yet" % b["batch"]); missing += 1; continue
        segs, why = split_one(mp3, b["words"])
        if segs is None:
            print("   %-9s REJECTED — %s" % (b["batch"], why)); skipped += 1; continue
        print("   %-9s %2d words, %2d pieces — ok" % (b["batch"], len(b["words"]), len(segs)))
        if DRY:
            done += len(segs); continue
        for seg, w in zip(segs, b["words"]):
            name = "%03d_%s.mp3" % (w["index"], slug(w["greek"]))
            seg.set_channels(1).set_frame_rate(22050).export(
                os.path.join(OUT, name), format="mp3", bitrate="64k")
            done += 1

    print()
    print("words written: %d   batches rejected: %d   batches not downloaded: %d"
          % (done, skipped, missing))
    if skipped:
        print("A rejected batch is not guessed at — re-download it and run again.")
    if done and not DRY:
        print("They are in audio/_staging/words/. Nothing in audio/vocab has "
              "been touched.")


if __name__ == "__main__":
    main()

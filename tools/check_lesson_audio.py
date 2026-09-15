# -*- coding: utf-8 -*-
"""data/lesson_audio.js against the chapters it claims to narrate.

    python tools/check_lesson_audio.py

WHY THIS EXISTS. The narration is not the chapter's text -- where the page
says λόγος the voice says `loh goss` -- so nothing about a seek time is
self-evident from reading either one. Three different things can rot here and
none of them is visible:

  * A CHAPTER IS EDITED. Insert a paragraph and every element index after it
    shifts, so a block covers the wrong prose and every tap in the chapter is
    one element out. The app guards against the count changing, but silently:
    it simply declines to mount, and the feature disappears without a word.
  * A CLIP IS RE-RECORDED OR LOST. The seconds then belong to audio nobody
    has any more.
  * A CUE IS RE-TUNED. This is the live one: the vocabulary audit changes cue
    spellings weekly, and the narration says the cue. Change λόγος's cue and
    the clip still plays, still sounds fine, and now says something the deck
    no longer teaches.

The last is why this checker re-derives the narration rather than trusting
the shipped file. It runs the builder's own code over data/lessons.js and
data/*cues*.json, and compares.
"""
import io, json, os, re, shutil, sys, importlib.util

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

DATA = "data/lesson_audio.js"
AUDIO = "audio/lessons"


def load_js():
    s = io.open(DATA, encoding="utf-8").read()
    m = re.search(r"const LESSON_AUDIO = (\[.*\]);\s*$", s, re.S)
    if not m:
        sys.exit("%s: cannot find the LESSON_AUDIO array" % DATA)
    return json.loads(m.group(1))


def builder():
    spec = importlib.util.spec_from_file_location(
        "bla", os.path.join(ROOT, "tools", "build_lesson_audio.py"))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def main():
    if not os.path.isfile(DATA):
        print("no %s -- no chapter has narration yet" % DATA)
        return
    rows = load_js()
    m = builder()
    bad = []
    chapters = sorted({r["ch"] for r in rows})

    # 1. Every block has audio, and nothing in the directory is orphaned.
    ids = {r["id"] for r in rows}
    for r in rows:
        p = os.path.join(AUDIO, r["id"] + ".mp3")
        if not os.path.isfile(p):
            bad.append("%s: no clip at %s" % (r["id"], p))
    for f in sorted(os.listdir(AUDIO)) if os.path.isdir(AUDIO) else []:
        if f.endswith(".mp3") and f[:-4] not in ids:
            bad.append("%s is in %s and in no block" % (f, AUDIO))

    # `d` is how long the clip is. --map alone does not write it, so a map
    # rebuilt the way this file used to advise has none, and then the app
    # cannot say how long a chapter is. Reported once, not thirty-one times.
    nod = [r["id"] for r in rows if "d" not in r]
    if nod:
        bad.append("%d blocks carry no d, how long the clip is (%s%s)."
                   " Build the file the app loads with --js, not --map:"
                   " --map writes the seek times alone."
                   % (len(nod), ", ".join(nod[:3]),
                      " ..." if len(nod) > 3 else ""))

    # 2. The shape of each row.
    for r in rows:
        if "d" not in r:
            continue
        if len(r["page"]) != len(r["t"]):
            bad.append("%s: %d page words, %d seconds"
                       % (r["id"], len(r["page"]), len(r["t"])))
        if any(b < a - 0.001 for a, b in zip(r["t"], r["t"][1:])):
            bad.append("%s: seek times run backwards" % r["id"])
        if r["t"] and r["t"][-1] > r["d"] + 0.5:
            bad.append("%s: a word is spoken at %.1fs in a clip %.1fs long"
                       % (r["id"], r["t"][-1], r["d"]))

    # 2b. `d` against the audio. The builder measures it with ffprobe, so
    #     confirm it rather than trust it -- every other number in this file
    #     is re-derived, and this one was hand-written until it was not.
    if shutil.which("ffprobe"):
        for r in rows:
            f = os.path.join(AUDIO, r["id"] + ".mp3")
            if "d" not in r or not os.path.isfile(f):
                continue
            real = m.clip_seconds(f)
            if abs(real - r["d"]) > 0.35:
                bad.append("%s: the map says %.2fs, the clip is %.2fs"
                           % (r["id"], r["d"], real))
        heard = "measured against the clips on disk"
    else:
        # Said out loud, not skipped quietly: a checker that falls back in
        # silence reports green for something it never looked at.
        heard = "NOT CHECKED -- ffprobe is not on this machine"

    # 3. The element indices cover each chapter's body exactly once, in order.
    #    This is what the app relies on to find the prose again.
    lessons = {l["id"]: l for l in m.load()}
    for ch in chapters:
        els = [i for r in rows if r["ch"] == ch for i in r["els"]]
        want = len(m.BLOCK.findall(lessons[ch]["body"]))
        if els != list(range(want)):
            bad.append("chapter %d: blocks cover elements %s, body has %d"
                       % (ch, els[:8], want))

    # 4. THE ONE THAT ROTS. Re-derive the narration from the lessons and the
    #    cue sheets as they stand today, and hold the shipped map to it.
    cues = m.cue_table()
    for ch in chapters:
        fresh = m.blocks_for(lessons[ch], cues, [])
        mine = [r for r in rows if r["ch"] == ch]
        if len(fresh) != len(mine):
            bad.append("chapter %d: %d blocks shipped, %d derive from the "
                       "lesson and the cue sheets now"
                       % (ch, len(mine), len(fresh)))
            continue
        for r, (_kind, _text, page, _pairs, els) in zip(mine, fresh):
            if page != r["page"]:
                j = next((k for k in range(min(len(page), len(r["page"])))
                          if page[k] != r["page"][k]), 0)
                bad.append("%s: the chapter has changed -- word %d is now %r, "
                           "the map has %r" % (r["id"], j,
                                               page[j:j + 3],
                                               r["page"][j:j + 3]))
            if els != r["els"]:
                bad.append("%s: covers elements %s, now derives %s"
                           % (r["id"], r["els"], els))

    words = sum(len(r["page"]) for r in rows)
    mins = sum(r.get("d", 0) for r in rows) / 60
    print("chapters narrated:                %s"
          % ", ".join(str(c) for c in chapters))
    print("blocks / clips:                   %d" % len(rows))
    print("page words with a seek time:      %d" % words)
    print("minutes of audio:                 %.1f" % mins)
    print("clip lengths:                     %s" % heard)
    if bad:
        print("\nLESSON AUDIO DOES NOT MATCH THE CHAPTERS: %d" % len(bad))
        for b in bad:
            print("   " + b)
        print("\n   Rebuild with:\n"
              "     python tools/build_lesson_audio.py --chapters %s \\\n"
              "        --js --timestamps <takes>/timestamps.json\n"
              "   and regenerate any clip whose text has moved. The map is\n"
              "   only true of the audio it was built from."
              % ",".join(str(c) for c in chapters))
        sys.exit(1)
    print("\nevery block matches the chapter it narrates, and the audio it "
          "was cut from")


if __name__ == "__main__":
    main()

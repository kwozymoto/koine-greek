# -*- coding: utf-8 -*-
"""Notice when a field changed that nobody meant to change.

    python tools/check_frozen.py
    python tools/check_frozen.py --accept       # yes, I meant those

Every other checker asks "is this true?" and answers it against the corpus.
This one asks a different question, because some fields have no truth to
check against — only a history:

    Did this change, and did you mean it to?

It exists because of a specific failure that has now happened three times.
Rewriting a lesson, I retyped its `v:` array and its `vids:` block from the
version I was replacing, and invented three YouTube ids and two lecture
durations in the process. check_links catches a bad id. Nothing caught a bad
`v:` — that array is the list of VOCAB positions naming which words a chapter
teaches, there is no way to derive the right answer from anything in the
repo, and one wrong digit silently changes the course for everyone who has
the app installed.

The general shape of the fault is always the same: **data reproduced from
memory when it was already in a file.** So this compares the working tree
against `git show HEAD` and reports every protected field that moved. It
cannot tell you whether the new value is right. It can tell you that you
touched something you were probably not editing, which in practice is the
whole problem.

What is protected, and why
--------------------------
  lessons  v:      VOCAB indices; the course sequence. Nothing else checks it.
           vids:   video ids and lecture titles. check_links catches a dead
                   id but not one that resolves to the wrong video.
           id, t   a chapter id is stored in the user's S.lessons
  vocab    every row  the file is append-only. Cards, audio filenames and
                   example verses are all keyed by array position, so
                   changing an existing row rewrites somebody's progress.
  audio    VOCAB_AUDIO  same argument, same keying
  paradigms t:, <caption>  js/grid.js keys the paradigm schedule on
                   "title|caption|column". Rename either and every learner's
                   history on that grid silently resets.

Adding rows is not a change; these are append-only files and growth is the
normal case. What this reports is an existing entry that is no longer what it
was.
"""
import io, json, os, re, subprocess, sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ACCEPT = "--accept" in sys.argv


def head_version(rel):
    """The file as HEAD has it, or None if it is not committed yet."""
    r = subprocess.run(["git", "show", "HEAD:" + rel], cwd=ROOT,
                       capture_output=True, text=True, encoding="utf-8")
    return None if r.returncode else r.stdout


def evaluate(sources, names):
    """Run the data files and hand back the globals, the way every other
       checker here does — a regex over JavaScript is a guess.

       Through temporary files rather than node -e: data/vocab.js alone is
       past the Windows command-line limit, and the version from HEAD has no
       path on disk to point at."""
    import tempfile
    with tempfile.TemporaryDirectory() as d:
        paths = []
        for i, src in enumerate(sources):
            fp = os.path.join(d, "s%d.js" % i)
            io.open(fp, "w", encoding="utf-8", newline="\n").write(src)
            paths.append(fp)
        js = ("const fs=require('fs'),vm=require('vm');const c=vm.createContext({});"
              "for(const f of " + json.dumps(paths) + ")"
              "vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});"
              "process.stdout.write(vm.runInContext("
              "'JSON.stringify({" + ",".join(names) + "})',c));")
        r = subprocess.run(["node", "-e", js], cwd=ROOT, capture_output=True,
                           text=True, encoding="utf-8")
    if r.returncode:
        return None
    return json.loads(r.stdout)


def lessons_fields(vocab_src, lessons_src):
    got = evaluate([vocab_src, lessons_src], ["LESSONS"])
    if got is None:
        return None
    out = {}
    for l in got["LESSONS"]:
        k = "lessons ch%s" % l["id"]
        out[k + " · v"] = l.get("v") or []
        out[k + " · title"] = l.get("t")
        # s as well as t: the subtitle carries the lecture duration, and
        # retyping one invented "(21:38)" where the file said "(14:16)".
        # A field nobody checks is a field that can quietly become fiction.
        out[k + " · vids"] = [[v.get("t"), v.get("s"), v.get("yt"), v.get("u")]
                              for v in (l.get("vids") or [])]
    return out


def vocab_fields(vocab_src):
    got = evaluate([vocab_src], ["VOCAB"])
    if got is None:
        return None
    return {"vocab row %d" % i: v for i, v in enumerate(got["VOCAB"])}


def audio_fields(vocab_src, audio_src):
    got = evaluate([vocab_src, audio_src], ["VOCAB_AUDIO"])
    if got is None:
        return None
    return {"audio %d" % i: f for i, f in enumerate(got["VOCAB_AUDIO"])}


def paradigm_fields(src):
    """Titles and captions only — the two strings js/grid.js builds its
       schedule keys out of."""
    out = {}
    for n, m in enumerate(re.finditer(r'\{t:"(.*?)",tags:".*?",\s*html:`(.*?)`\}',
                                      src, re.S)):
        out["paradigm %d · title" % n] = m.group(1)
        out["paradigm %d · captions" % n] = re.findall(r"<caption>(.*?)</caption>",
                                                       m.group(2), re.S)
    return out


def read(rel):
    return io.open(os.path.join(ROOT, rel), encoding="utf-8").read()


now_v, now_l = read("data/vocab.js"), read("data/lessons.js")
now_a, now_p = read("data/audio.js"), read("data/paradigms.js")
old_v, old_l = head_version("data/vocab.js"), head_version("data/lessons.js")
old_a, old_p = head_version("data/audio.js"), head_version("data/paradigms.js")

if old_v is None or old_l is None:
    print("no committed version to compare against — nothing to say")
    sys.exit(0)

pairs = [
    ("lessons", lessons_fields(now_v, now_l), lessons_fields(old_v, old_l)),
    ("vocab", vocab_fields(now_v), vocab_fields(old_v)),
    ("audio", audio_fields(now_v, now_a), audio_fields(old_v, old_a)),
    ("paradigms", paradigm_fields(now_p), paradigm_fields(old_p)),
]

changed, added, unreadable = [], 0, []
for label, new, old in pairs:
    if new is None or old is None:
        unreadable.append(label)
        continue
    for k in new:
        if k not in old:
            added += 1
        elif new[k] != old[k]:
            changed.append("%s\n       was: %s\n       now: %s"
                           % (k, json.dumps(old[k], ensure_ascii=False)[:110],
                              json.dumps(new[k], ensure_ascii=False)[:110]))
    for k in old:
        if k not in new:
            changed.append("%s\n       was: %s\n       now: GONE — these files are "
                           "append-only" % (k, json.dumps(old[k], ensure_ascii=False)[:110]))

print("protected fields compared against HEAD: %d"
      % sum(len(n) for _, n, o in pairs if n and o))
print("new entries (append is the normal case): %d" % added)
print()
print("existing entries that changed: %d" % len(changed))
for c in changed:
    print("   " + c)
if unreadable:
    print()
    print("could not be read on one side, so not compared: %s" % ", ".join(unreadable))

if changed and not ACCEPT:
    print()
    print("If every one of those was deliberate, say so:")
    print("    python tools/check_frozen.py --accept")
    print("If any was not, it is the kind of change nothing else in this repo")
    print("would have caught.")
    sys.exit(1)
sys.exit(0)

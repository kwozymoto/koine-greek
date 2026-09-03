# -*- coding: utf-8 -*-
"""Check every link the Watch sections point at.

    python tools/check_links.py [--offline]

The alphabet song in chapter 1 pointed at billmounce.com/biblestudygreek2/,
which is a members-only path and had started returning 403. Nobody found that
by reading the file; it was found on a phone, mid-lesson, by tapping it. That
is the wrong way round, and it is the only class of content in this repo with
no checker — the six others all answer to the corpus, and a URL does not.

Two kinds of row in data/lessons.js:

  u:  an outside page. Fetched; anything that is not a 2xx after redirects
      fails. HEAD first, because some hosts will not send a body to a script;
      GET on anything that refuses HEAD, since a 405 is about the method and
      not about the page.

  yt: a YouTube id the app embeds. Checked through YouTube's own oEmbed
      endpoint, which is the same question the embed asks: it answers only
      for a video that exists, is public and permits embedding. The title it
      returns is compared with the title in lessons.js, so an id that drifts
      onto a different video fails rather than quietly playing the wrong
      thing — the failure this file exists to prevent, one level down.

--offline skips the network and checks only the shapes: that every row has
exactly one of u or yt, and that an id looks like an id.
"""
import io, json, os, re, sys, subprocess, urllib.parse, urllib.request, unicodedata

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OFFLINE = "--offline" in sys.argv
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")
TIMEOUT = 25
YT_ID = re.compile(r"^[\w-]{11}$")

js = ("const fs=require('fs'),vm=require('vm');const c=vm.createContext({});"
      "vm.runInContext(fs.readFileSync('data/lessons.js','utf8'),c,"
      "{filename:'data/lessons.js'});"
      "process.stdout.write(vm.runInContext('JSON.stringify(LESSONS)',c));")
out = subprocess.run(["node", "-e", js], cwd=ROOT, capture_output=True,
                     text=True, encoding="utf-8")
if out.returncode:
    sys.exit("could not load data/lessons.js:\n" + out.stderr)
LESSONS = json.loads(out.stdout)


def fetch(url, method="HEAD"):
    req = urllib.request.Request(url, method=method, headers={
        "User-Agent": UA, "Accept": "*/*"})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        return r.status, r.read() if method == "GET" else b""


STOP = {"a", "an", "and", "the", "of", "for", "to", "in", "on", "with", "its"}


def words(s):
    s = unicodedata.normalize("NFKD", s).lower()
    return [w for w in re.split(r"[^a-z0-9]+", s) if w and w not in STOP]


def titles_agree(label, real):
    """The row's label need not be the video's title word for word — the list
       reads better with 'Infinitives Song' than with 'Infinitives Song, to
       the tune of "Mary Had a Little Lamb"', and YouTube's own titles carry
       a typo or two ('Arost').

       What is required is that every significant word of the label appears
       in the real title. That still fails the case this check exists for —
       an id drifting onto a different video — because an unrelated video's
       title will not contain them. It also puts a useful discipline on the
       label: do not describe a video with words its own title does not use."""
    have = set(words(real))
    return all(w in have for w in words(label))


bad, checked, skipped = [], 0, 0
for l in LESSONS:
    for v in l.get("vids", []):
        tag = "ch%-2d %s" % (l["id"], v["t"][:46])
        has = [k for k in ("u", "yt") if v.get(k)]
        if len(has) != 1:
            bad.append("%s has %s — a row needs exactly one of u or yt"
                       % (tag, " and ".join(has) or "neither"))
            continue
        if v.get("yt") and not YT_ID.match(v["yt"]):
            bad.append("%s has %r, which is not an 11-character video id"
                       % (tag, v["yt"]))
            continue
        if OFFLINE:
            skipped += 1
            continue

        checked += 1
        if v.get("u"):
            try:
                code, _ = fetch(v["u"])
            except Exception as e:
                code = getattr(e, "code", None)
                if code == 405:                       # HEAD refused, not the page
                    try:
                        code, _ = fetch(v["u"], "GET")
                    except Exception as e2:
                        code = getattr(e2, "code", None) or str(e2)
                elif code is None:
                    code = str(e)
            if code != 200:
                bad.append("%s %s -> %s" % (tag, v["u"], code))
        else:
            api = ("https://www.youtube.com/oembed?url="
                   + urllib.parse.quote("https://www.youtube.com/watch?v=" + v["yt"],
                                        safe="")
                   + "&format=json")
            try:
                _, body = fetch(api, "GET")
                d = json.loads(body.decode("utf-8"))
            except Exception as e:
                bad.append("%s %s is not embeddable (%s) — private, deleted, or "
                           "embedding turned off" % (tag, v["yt"],
                                                     getattr(e, "code", None) or e))
                continue
            if not titles_agree(v["t"], d.get("title", "")):
                bad.append("%s %s now plays %r by %s"
                           % (tag, v["yt"], d.get("title"), d.get("author_name")))

n_u = sum(1 for l in LESSONS for v in l.get("vids", []) if v.get("u"))
n_y = sum(1 for l in LESSONS for v in l.get("vids", []) if v.get("yt"))
print("Watch rows: %d linked out, %d embedded" % (n_u, n_y))
if OFFLINE:
    print("--offline: %d rows shape-checked, nothing fetched" % skipped)
else:
    print("fetched: %d" % checked)
print("\nbroken: %d" % len(bad))
for s in bad:
    print("   " + s)
sys.exit(1 if bad else 0)

# -*- coding: utf-8 -*-
"""The chapters as plain web pages, and the sitemap that lists them.

    python tools/build_chapters_page.py            # write them all
    python tools/build_chapters_page.py --check    # exit 1 if any is stale

WHY. The app draws its chapters with JavaScript, so a search engine sees none
of them. Someone searching for "second aorist" or "genitive absolute" should
land on the chapter that teaches it. So each chapter is also published as a
static page -- its full text, tables and verses as the app shows them -- with
an index of all of them:

  chapters.html          every chapter: title, summary, its own headings
  chapters/<n>.html      one chapter, in full
  sitemap.xml            the site's pages, these included

GENERATED, NEVER EDITED BY HAND. Everything comes from data/lessons.js and
data/lesson_audio.js (which chapters are read aloud), so no page can say
something the chapters do not, and the lesson text on these pages is the same
text check_lessons holds to the SBL Greek New Testament. check_chapters_page
runs this with --check and fails when any page has not been rebuilt after a
lesson changed. The quizzes are not published; they belong to the app's
schedule.
"""
import html
import io
import json
import os
import re
import subprocess
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://everydaykoine.app/"

TAG = re.compile(r"<[^>]+>")
HEAD = re.compile(r"<(h2|h3)\b[^>]*>(.*?)</\1>", re.S)

# The pages of the site that are not the app, in the order the sitemap lists
# them. The chapter pages are added after.
STATIC = ["", "about.html", "chapters.html", "privacy.html"]


def lessons():
    js = ("const fs=require('fs'),vm=require('vm');const c=vm.createContext({});"
          "vm.runInContext(fs.readFileSync('data/lessons.js','utf8'),c);"
          "process.stdout.write(vm.runInContext('JSON.stringify(LESSONS.map("
          "l=>({id:l.id,t:l.t,s:l.s,body:l.body})))',c));")
    r = subprocess.run(["node", "-e", js], cwd=ROOT, capture_output=True,
                       text=True, encoding="utf-8")
    if r.returncode or not r.stdout:
        sys.exit("could not read data/lessons.js:\n" + (r.stderr or ""))
    return json.loads(r.stdout)


def narrated():
    """Chapters with narration, from the file the app loads."""
    p = os.path.join(ROOT, "data", "lesson_audio.js")
    if not os.path.isfile(p):
        return set()
    s = io.open(p, encoding="utf-8").read()
    m = re.search(r"const LESSON_AUDIO = (\[.*\]);\s*$", s, re.S)
    return {r["ch"] for r in json.loads(m.group(1))} if m else set()


def text(fragment):
    return " ".join(html.unescape(TAG.sub(" ", fragment)).split())


def headings(body):
    return [h for h in dict.fromkeys(text(h) for _t, h in HEAD.findall(body)) if h]


# ------------------------------------------------------------------ pages ---

CSS = """
  :root{
    --bg:#141b2b; --surface:#1e2739; --surface-2:#29344a; --line:#38445d;
    --text:#e9e5da; --muted:#97a1b5; --gold:#d4a537; --gold-ink:#1b1406;
    --ui:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",sans-serif;
    --gk:"Gentium Plus","GFS Didot","Palatino Linotype",Palatino,Georgia,serif;
  }
  *{box-sizing:border-box}
  body{margin:0; padding:2.25rem 1rem 5rem; background:var(--bg); color:var(--text);
       font:16px/1.65 var(--ui)}
  main{max-width:44rem; margin:0 auto}
  a{color:var(--gold)}
  .back{display:inline-block; margin-bottom:1.5rem; color:var(--muted); font-size:.9rem}
  h1{font-size:1.9rem; line-height:1.2; margin:0 0 .5rem; text-wrap:balance}
  .kicker{color:var(--gold); font-size:.9rem; font-weight:600; margin:0; letter-spacing:.02em}
  .lede{margin:0 0 1rem; color:var(--muted); font-size:1.05rem}
  .open{display:inline-block; background:var(--gold); color:var(--gold-ink); font-weight:700;
        text-decoration:none; padding:.7rem 1.2rem; border-radius:12px}
  .open:focus-visible{outline:3px solid var(--text); outline-offset:3px}
  .badge{display:inline-block; font-size:.72rem; font-weight:600; letter-spacing:.03em;
         color:var(--gold); border:1px solid var(--gold); border-radius:999px;
         padding:.05rem .5rem; margin-left:.3rem; vertical-align:.15em}
  footer{margin-top:2.5rem; padding-top:1.1rem; border-top:1px solid var(--line);
         color:var(--muted); font-size:.86rem}
  footer p{margin:.35rem 0}
"""

INDEX_CSS = """
  .ch{position:relative; background:var(--surface); border:1px solid var(--line);
      border-radius:12px; padding:.95rem 1.1rem; margin:.8rem 0}
  .ch:hover{border-color:var(--gold)}
  /* The whole box opens the chapter: the title's link is stretched over it,
     and "Read the full chapter" says so where a title alone did not. */
  .ch h2 a::after{content:""; position:absolute; inset:0; border-radius:12px}
  .ch h2 a:focus-visible::after{outline:2px solid var(--gold); outline-offset:2px}
  .more{margin:.55rem 0 0; color:var(--gold); font-weight:600; font-size:.92rem}
  .ch h2{font-size:1.05rem; margin:0; line-height:1.35; text-wrap:balance}
  .ch h2 a{color:var(--text); text-decoration:none}
  .ch h2 a:hover, .ch h2 a:focus-visible{color:var(--gold); text-decoration:underline}
  .n{color:var(--gold); font-variant-numeric:tabular-nums; margin-right:.25rem}
  .s{margin:.25rem 0 .2rem; color:var(--muted)}
  .ch ul{margin:.45rem 0 0; padding-left:1.1rem; font-size:.93rem}
  .ch li{margin:.15rem 0}
"""

CHAPTER_CSS = """
  .gk, .g{font-family:var(--gk); font-size:1.08em}
  article h3{font-size:1.1rem; margin:2rem 0 .5rem; color:var(--gold); text-wrap:balance}
  article p{margin:.7rem 0}
  article p.v{font-family:var(--gk); font-size:1.18rem; background:var(--surface);
              border-left:3px solid var(--gold); border-radius:8px; padding:.6rem .9rem}
  article p.v::after{content:attr(data-ref); display:block; font-family:var(--ui);
                     font-size:.8rem; color:var(--muted); margin-top:.2rem}
  .tablewrap{overflow-x:auto; margin:.9rem 0}
  article table{border-collapse:collapse; font-size:.95rem; min-width:60%}
  article caption{text-align:left; color:var(--muted); font-size:.88rem; padding-bottom:.3rem}
  article th, article td{border-bottom:1px solid var(--line); padding:.4rem .7rem;
                         text-align:left; vertical-align:top}
  article th{color:var(--muted); font-weight:600}
  .inapp{background:var(--surface); border:1px solid var(--line); border-radius:12px;
         padding:.8rem 1rem; color:var(--muted)}
  .pager{display:flex; justify-content:space-between; gap:1rem; margin-top:2.5rem; flex-wrap:wrap}
  .pager a{text-decoration:none}
  .study{margin:1.5rem 0 0}
"""


def head(title, desc, canonical, extra_css, up=""):
    return ("<!doctype html>\n<html lang=\"en\">\n<head>\n"
            "<meta charset=\"utf-8\">\n"
            "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n"
            "<title>%s</title>\n"
            "<meta name=\"description\" content=\"%s\">\n"
            "<meta name=\"theme-color\" content=\"#141b2b\">\n"
            "<link rel=\"icon\" href=\"%sicons/icon-192.png\">\n"
            "<link rel=\"canonical\" href=\"%s\">\n"
            "<!-- GENERATED by tools/build_chapters_page.py from data/lessons.js.\n"
            "     Do not edit by hand: check_chapters_page fails when this goes stale. -->\n"
            "<style>%s%s</style>\n</head>\n<body>\n<main>\n"
            % (html.escape(title), html.escape(desc, quote=True), up,
               canonical, CSS, extra_css))


def foot(up=""):
    return ("  <footer>\n    <p><a href=\"%s\">Open the app</a> · "
            "<a href=\"%sabout.html\">About</a> · "
            "<a href=\"%schapters.html\">All chapters</a> · "
            "<a href=\"%sprivacy.html\">Privacy policy</a> · "
            "<a href=\"mailto:support@everydaykoine.app\">support@everydaykoine.app</a></p>\n"
            "  </footer>\n</main>\n</body>\n</html>\n" % ((up or "/"), up, up, up))


def index_page(ls, aloud):
    items = []
    for l in ls:
        badge = ('<span class="badge">Read aloud</span>'
                 if l["id"] in aloud else "")
        hs = headings(l["body"])
        topics = ("<ul>%s</ul>" % "".join("<li>%s</li>" % html.escape(h)
                                          for h in hs)) if hs else ""
        items.append(
            '<section class="ch" id="chapter-%d">\n'
            '  <h2><span class="n">Chapter %d</span> <a href="chapters/%d.html">%s</a> %s</h2>\n'
            '  <p class="s">%s</p>\n  %s\n'
            '  <p class="more" aria-hidden="true">Read the full chapter &rsaquo;</p>\n'
            '</section>'
            % (l["id"], l["id"], l["id"], html.escape(l["t"]), badge,
               html.escape(l["s"] or ""), topics))
    return (head("What the chapters cover — Everyday Koine",
                 "The %d chapters of Everyday Koine, a New Testament Greek "
                 "course: what each one teaches, from the alphabet and the "
                 "verb system to participles, the subjunctive and -μι verbs."
                 % len(ls),
                 SITE + "chapters.html", INDEX_CSS)
            + '  <a class="back" href="about.html">&lsaquo; About Everyday Koine</a>\n'
            '  <h1>What the chapters cover</h1>\n'
            '  <p class="lede">%d chapters take you from the alphabet to reading '
            'the Greek New Testament. Each comes in short parts with questions '
            'along the way, and %d are read aloud so far. Tap any chapter to read '
            'it in full; the topics under each are its own section headings.</p>\n'
            '  <a class="open" href="/?go=learn">Open the chapters in the app</a>\n'
            % (len(ls), len(aloud))
            + "\n".join(items) + "\n" + foot())


ALPHA_NOTE = ('<div class="inapp">The alphabet, with a recording of every letter '
              'and diphthong, is in the app: <a href="/?go=learn">open chapter 1 '
              'there</a> to hear each one and say it back.</div>')


def chapter_body(body):
    """The lesson's own markup, with the one thing only the app can show --
    chapter 1's alphabet grid, filled at run time into an empty div -- pointed
    at the app, and each table wrapped so a wide one scrolls on a phone."""
    body = re.sub(r'<div id="alphaHere"[^>]*>\s*</div>', ALPHA_NOTE, body)
    body = re.sub(r"<table\b", '<div class="tablewrap"><table', body)
    return body.replace("</table>", "</table></div>")


def chapter_page(l, ls, aloud):
    n = l["id"]
    prev = next((x for x in ls if x["id"] == n - 1), None)
    nxt = next((x for x in ls if x["id"] == n + 1), None)
    badge = ('<span class="badge">Read aloud in the app</span>'
             if n in aloud else "")
    hs = headings(l["body"])
    desc = "Chapter %d of Everyday Koine, a New Testament Greek course: %s. %s." % (
        n, l["t"], l["s"] or "")
    if hs:
        desc += " Covers " + "; ".join(hs[:6]) + "."
    pager = '  <nav class="pager" aria-label="Chapters">\n'
    pager += ('    <a href="%d.html">&lsaquo; Chapter %d: %s</a>\n'
              % (prev["id"], prev["id"], html.escape(prev["t"]))) if prev else "    <span></span>\n"
    pager += ('    <a href="%d.html">Chapter %d: %s &rsaquo;</a>\n'
              % (nxt["id"], nxt["id"], html.escape(nxt["t"]))) if nxt else ""
    pager += "  </nav>\n"
    return (head("Chapter %d: %s — Everyday Koine" % (n, l["t"]), desc,
                 SITE + "chapters/%d.html" % n, CHAPTER_CSS, up="../")
            + '  <a class="back" href="../chapters.html">&lsaquo; All chapters</a>\n'
            '  <p class="kicker">Chapter %d %s</p>\n'
            '  <h1>%s</h1>\n'
            '  <p class="lede">%s</p>\n'
            '  <article>\n%s\n  </article>\n'
            '  <p class="study"><a class="open" href="/?go=learn">Study this chapter '
            'in the app</a></p>\n'
            '  <p class="inapp">In the app this chapter comes in short parts with '
            'questions along the way, and its words go onto your review schedule.</p>\n'
            % (n, badge, html.escape(l["t"]), html.escape(l["s"] or ""),
               chapter_body(l["body"]))
            + pager + foot(up="../"))


def sitemap(ls):
    urls = STATIC + ["chapters/%d.html" % l["id"] for l in ls]
    return ('<?xml version="1.0" encoding="UTF-8"?>\n'
            '<!-- GENERATED by tools/build_chapters_page.py -->\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
            + "".join("  <url><loc>%s%s</loc></url>\n" % (SITE, u) for u in urls)
            + "</urlset>\n")


def pages():
    ls = lessons()
    aloud = narrated()
    out = {"chapters.html": index_page(ls, aloud), "sitemap.xml": sitemap(ls)}
    for l in ls:
        out["chapters/%d.html" % l["id"]] = chapter_page(l, ls, aloud)
    return out


if __name__ == "__main__":
    want = pages()
    if "--check" in sys.argv:
        stale = []
        for rel, content in want.items():
            p = os.path.join(ROOT, rel)
            have = io.open(p, encoding="utf-8").read() if os.path.isfile(p) else ""
            if have != content:
                stale.append(rel)
        extra = sorted(f for f in os.listdir(os.path.join(ROOT, "chapters"))
                       if f.endswith(".html") and "chapters/" + f not in want) \
            if os.path.isdir(os.path.join(ROOT, "chapters")) else []
        if stale or extra:
            print("chapter pages are stale -- run python tools/build_chapters_page.py")
            for s in stale:
                print("   stale:  " + s)
            for s in extra:
                print("   orphan: chapters/" + s + " (no such chapter)")
            sys.exit(1)
        print("chapters.html, %d chapter pages and sitemap.xml match the lessons"
              % (len(want) - 2))
        sys.exit(0)
    os.makedirs(os.path.join(ROOT, "chapters"), exist_ok=True)
    for rel, content in want.items():
        io.open(os.path.join(ROOT, rel), "w", encoding="utf-8",
                newline="\n").write(content)
    print("wrote chapters.html, %d chapter pages and sitemap.xml" % (len(want) - 2))

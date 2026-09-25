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
  print/vocabulary-<n>.html   a chapter's vocabulary, laid out to print
  print/vocabulary.html       the whole deck, commonest first, to print
  print/paradigms.html        the reference tables, to print

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
          "l=>({id:l.id,t:l.t,s:l.s,body:l.body,v:l.v})))',c));")
    r = subprocess.run(["node", "-e", js], cwd=ROOT, capture_output=True,
                       text=True, encoding="utf-8")
    if r.returncode or not r.stdout:
        sys.exit("could not read data/lessons.js:\n" + (r.stderr or ""))
    return json.loads(r.stdout)


def node_json(files, expr):
    js = ("const fs=require('fs'),vm=require('vm');const c=vm.createContext({});"
          + "".join("vm.runInContext(fs.readFileSync('%s','utf8')"
                    ".replace(/\\bconst\\b/g,'var'),c);" % f for f in files)
          + "process.stdout.write(JSON.stringify(vm.runInContext('%s',c)));" % expr)
    r = subprocess.run(["node", "-e", js], cwd=ROOT, capture_output=True,
                       text=True, encoding="utf-8")
    if r.returncode or not r.stdout:
        sys.exit("could not read %s:\n%s" % (", ".join(files), r.stderr or ""))
    return json.loads(r.stdout)


# The deck index retired rather than deleted (CLAUDE.md, rule 3): its row
# stays so later indices keep their meaning, and it is never shown.
RETIRED = {237}


def narrated():
    """Chapters with narration, from the file the app loads."""
    # An error, not an empty set: empty would write "0 are read aloud" and
    # --check, comparing the output with itself, would pass it (CLAUDE.md §2).
    p = os.path.join(ROOT, "data", "lesson_audio.js")
    if not os.path.isfile(p):
        sys.exit("data/lesson_audio.js is missing")
    s = io.open(p, encoding="utf-8").read()
    m = re.search(r"const LESSON_AUDIO = (\[.*\]);\s*$", s, re.S)
    if not m:
        sys.exit("data/lesson_audio.js: LESSON_AUDIO not found where expected")
    return {r["ch"] for r in json.loads(m.group(1))}


def text(fragment):
    return " ".join(html.unescape(TAG.sub(" ", fragment)).split())


def headings(body):
    return [h for h in dict.fromkeys(text(h) for _t, h in HEAD.findall(body)) if h]


# ------------------------------------------------------------------ pages ---

CSS = """
  :root{
    --bg:#141b2b; --surface:#1e2739; --surface-2:#29344a; --line:#38445d;
    --text:#e9e5da; --muted:#97a1b5; --gold:#d4a537; --gold-ink:#1a1408;
    --ui:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",sans-serif;
    --gk:"Gentium Plus","GFS Didot","Palatino Linotype",Palatino,Georgia,serif;
    color-scheme:dark;
  }
  /* Light, following the app's Settings > Appearance or the device; the
     same values as css/app.css, held there by tools/check_theme.py. */
  @media (prefers-color-scheme: light){
    :root:not([data-theme="dark"]){
      color-scheme:light;
      --bg:#f3f5f9; --surface:#ffffff; --surface-2:#e8ecf3; --line:#cfd6e2;
      --text:#1b2233; --muted:#586277; --gold:#85620a; --gold-ink:#ffffff;
    }
  }
  :root[data-theme="light"]{
    color-scheme:light;
    --bg:#f3f5f9; --surface:#ffffff; --surface-2:#e8ecf3; --line:#cfd6e2;
    --text:#1b2233; --muted:#586277; --gold:#85620a; --gold-ink:#ffffff;
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


# The theme lines every page's <head> carries: the browser bar's colour for
# each theme, and the script that applies Settings > Appearance before first
# paint. The same as index.html's; tools/check_theme.py holds them together.
THEME_HEAD = '<meta name="theme-color" content="#141b2b" media="(prefers-color-scheme: dark)">\n<meta name="theme-color" content="#f3f5f9" media="(prefers-color-scheme: light)">\n<script>/* Settings > Appearance, applied before first paint so a chosen theme never flashes the other. Stored per device under koine.theme; absent means follow the device. On an iPhone home-screen app the status bar\'s icons are white (black-translucent), so in light they switch to dark (default). */\nvar t=null;try{t=localStorage.getItem("koine.theme")}catch(e){}try{if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t);var c=t==="light"?"#f3f5f9":"#141b2b";document.querySelectorAll(\'meta[name="theme-color"]\').forEach(function(m){m.content=c})}var s=document.querySelector(\'meta[name="apple-mobile-web-app-status-bar-style"]\');if(s&&(t==="light"||(t!=="dark"&&matchMedia("(prefers-color-scheme: light)").matches)))s.content="default"}catch(e){}</script>\n'


def head(title, desc, canonical, extra_css, up=""):
    return ("<!doctype html>\n<html lang=\"en\">\n<head>\n"
            "<meta charset=\"utf-8\">\n"
            "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n"
            "<title>%s</title>\n"
            "<meta name=\"description\" content=\"%s\">\n"
            "%s"
            "<link rel=\"icon\" href=\"%sicons/icon-192.png\">\n"
            "<link rel=\"canonical\" href=\"%s\">\n"
            "<!-- GENERATED by tools/build_chapters_page.py from data/lessons.js.\n"
            "     Do not edit by hand: check_chapters_page fails when this goes stale. -->\n"
            "<style>%s%s</style>\n</head>\n<body>\n<main>\n"
            % (html.escape(title), html.escape(desc, quote=True), THEME_HEAD, up,
               canonical, CSS, extra_css))


APP_TAB_SCRIPT = "<script>/* Opening the app in a new tab keeps this page open on the website. Inside the installed app a new tab would open the browser instead, so there the link opens in place. */\nif (matchMedia('(display-mode: standalone)').matches)\n  document.querySelectorAll('a[data-app]').forEach(function (a) { a.removeAttribute('target'); });</script>\n"


def foot(up=""):
    return ("  <footer>\n    <p><a href=\"%s\" target=\"_blank\" rel=\"noopener\" data-app>Open the app</a> · "
            "<a href=\"%sabout.html\">About</a> · "
            "<a href=\"%schapters.html\">All chapters</a> · "
            "<a href=\"%sprivacy.html\">Privacy policy</a> · "
            "<a href=\"mailto:support@everydaykoine.app\">support@everydaykoine.app</a></p>\n"
            "  </footer>\n</main>\n" % ((up or "/"), up, up, up)
            + APP_TAB_SCRIPT + "</body>\n</html>\n")


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
            '  <a class="open" href="/?go=learn" target="_blank" rel="noopener" data-app>Open the chapters in the app</a>\n'
            % (len(ls), len(aloud))
            + "\n".join(items) + "\n" + foot())


ALPHA_NOTE = ('<div class="inapp">The alphabet, with a recording of every letter '
              'and diphthong, is in the app: <a href="/?ch=1" target="_blank" rel="noopener" data-app>open chapter 1 '
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
            '  <p class="study"><a class="open" href="/?ch=%d" target="_blank" rel="noopener" data-app>Study this chapter '
            'in the app</a></p>\n'
            '  <p class="inapp">In the app this chapter comes in short parts with '
            'questions along the way, and its words go onto your review schedule.%s</p>\n'
            % (n, badge, html.escape(l["t"]), html.escape(l["s"] or ""),
               chapter_body(l["body"]), n,
               (' <a href="../print/vocabulary-%d.html">Printable list of this '
                'chapter\'s vocabulary</a>.' % n) if l["v"] else "")
            + pager + foot(up="../"))


# ------------------------------------------------------------- printables ---
#
# For a class or a group: a chapter's words, the whole deck, the paradigm
# tables, each laid out for paper. White, black, compact, no navigation in
# print; the browser's Print (or Save as PDF) makes the handout. Everything is
# read from data/vocab.js and data/paradigms.js, the same rows check_vocab and
# check_paradigms hold to the corpus.

PRINT_CSS = """
  *{box-sizing:border-box}
  body{margin:0; padding:1.5rem 1rem 3rem; background:#fff; color:#111;
       font:14px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
  main{max-width:46rem; margin:0 auto}
  .gk,.g,td.gk{font-family:"Gentium Plus","GFS Didot","Palatino Linotype",Palatino,Georgia,serif;
       font-size:1.12em}
  h1{font-size:1.35rem; margin:0 0 .2rem}
  .sub{color:#555; margin:0 0 .9rem}
  .bar{display:flex; gap:.6rem; align-items:center; margin:0 0 1rem; flex-wrap:wrap}
  .bar button{font:inherit; padding:.45rem .9rem; border-radius:8px; border:1px solid #999;
              background:#f4f4f4; cursor:pointer}
  .bar a{color:#555}
  table{border-collapse:collapse; width:100%; margin:.4rem 0 1rem}
  /* A table wider than a phone scrolls in its own box, not the page. */
  .tw{overflow-x:auto; -webkit-overflow-scrolling:touch}
  caption{text-align:left; font-weight:600; padding:.3rem 0}
  th,td{border-bottom:1px solid #ccc; padding:.3rem .5rem; text-align:left; vertical-align:top}
  th{color:#444; font-weight:600}
  td.n{color:#666; font-variant-numeric:tabular-nums; white-space:nowrap}
  section{break-inside:avoid; margin:0 0 1.2rem}
  section h2{font-size:1.05rem; margin:1rem 0 .3rem; break-after:avoid}
  .foot{color:#777; font-size:.8rem; margin-top:1.5rem}
  @media print{
    body{padding:0} .bar{display:none} .tw{overflow:visible}
    a{color:inherit; text-decoration:none}
    @page{margin:14mm}
  }
"""


def print_head(title, back):
    return ("<!doctype html>\n<html lang=\"en\">\n<head>\n"
            "<meta charset=\"utf-8\">\n"
            "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n"
            "<meta name=\"robots\" content=\"noindex\">\n"
            "<title>%s</title>\n"
            "<link rel=\"icon\" href=\"../icons/icon-192.png\">\n"
            "<!-- GENERATED by tools/build_chapters_page.py. Do not edit by hand. -->\n"
            "<style>%s</style>\n</head>\n<body>\n<main>\n"
            "  <div class=\"bar\"><button type=\"button\" onclick=\"print()\">Print</button>"
            "<a href=\"%s\">&lsaquo; Back</a></div>\n"
            % (html.escape(title), PRINT_CSS, back))


PRINT_FOOT = ('  <p class="foot">Everyday Koine · everydaykoine.app — free to copy '
              'for a class or group.</p>\n</main>\n</body>\n</html>\n')


def vocab_rows(V, idx):
    return "".join(
        '<tr><td class="gk">%s</td><td>%s</td><td>%s</td><td class="n">%s</td></tr>\n'
        % (html.escape(V[i][0]), html.escape(V[i][1]), html.escape(V[i][3]),
           V[i][2]) for i in idx if i not in RETIRED)


VOCAB_HEAD = ('<div class="tw"><table>\n<tr><th>Word</th><th>Meaning</th><th>Part of speech</th>'
              '<th>In the NT</th></tr>\n')


def print_chapter_vocab(l, V):
    return (print_head("Chapter %d vocabulary — Everyday Koine" % l["id"],
                       "../chapters/%d.html" % l["id"])
            + '  <h1>Chapter %d vocabulary</h1>\n  <p class="sub">%s · %d words, '
              'with how often each occurs in the New Testament</p>\n'
            % (l["id"], html.escape(l["t"]), len([i for i in l["v"] if i not in RETIRED]))
            + VOCAB_HEAD + vocab_rows(V, l["v"]) + "</table></div>\n" + PRINT_FOOT)


def print_all_vocab(V):
    idx = sorted((i for i in range(len(V)) if i not in RETIRED),
                 key=lambda i: (-V[i][2], i))
    return (print_head("The whole vocabulary — Everyday Koine", "../about.html")
            + '  <h1>The vocabulary, commonest first</h1>\n  <p class="sub">All %d words '
              'in the deck, by how often each occurs in the New Testament</p>\n' % len(idx)
            + VOCAB_HEAD + vocab_rows(V, idx) + "</table></div>\n" + PRINT_FOOT)


def print_paradigms(P):
    secs = []
    for p in P:
        # The alphabet grid is filled by the app with its sound buttons;
        # there is nothing on paper to print for it.
        if p["t"].startswith("Sounds"):
            continue
        secs.append('<section>\n  <h2>%s</h2>\n%s\n</section>'
                    % (html.escape(p["t"]),
                       p["html"].replace("<table", '<div class="tw"><table')
                                .replace("</table>", "</table></div>")))
    return (print_head("Paradigm sheets — Everyday Koine", "../about.html")
            + '  <h1>Paradigm sheets</h1>\n  <p class="sub">The reference tables of '
              'Everyday Koine, every form checked against the SBL Greek New '
              'Testament</p>\n' + "\n".join(secs) + "\n" + PRINT_FOOT)


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
    V = node_json(["data/vocab.js"], "VOCAB")
    P = node_json(["data/paradigms.js"], "PARADIGMS.map(p=>({t:p.t,html:p.html}))")
    for l in ls:
        if l["v"]:
            out["print/vocabulary-%d.html" % l["id"]] = print_chapter_vocab(l, V)
    out["print/vocabulary.html"] = print_all_vocab(V)
    out["print/paradigms.html"] = print_paradigms(P)
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
        extra = []
        for d in ("chapters", "print"):
            if os.path.isdir(os.path.join(ROOT, d)):
                extra += sorted(d + "/" + f for f in os.listdir(os.path.join(ROOT, d))
                                if f.endswith(".html") and d + "/" + f not in want)
        # The app links to chapters.html and every printable, so they must
        # work offline: each has to be precached in sw.js's SHELL.
        sw = io.open(os.path.join(ROOT, "sw.js"), encoding="utf-8").read()
        shell = re.search(r"const SHELL = \[(.*?)\];", sw, re.S)
        cached = set(re.findall(r"'([^']+)'", shell.group(1))) if shell else set()
        uncached = sorted(r for r in want if (r == "chapters.html" or r.startswith("print/"))
                          and r not in cached)
        if uncached:
            print("pages the app links to that sw.js does not precache (add to SHELL):")
            for r in uncached:
                print("   " + r)
            sys.exit(1)
        if stale or extra:
            print("chapter pages are stale -- run python tools/build_chapters_page.py")
            for s in stale:
                print("   stale:  " + s)
            for s in extra:
                print("   orphan: " + s + " (nothing generates it)")
            sys.exit(1)
        print("chapters.html, the chapter pages, the printables and sitemap.xml "
              "match the data (%d files)" % len(want))
        sys.exit(0)
    os.makedirs(os.path.join(ROOT, "chapters"), exist_ok=True)
    os.makedirs(os.path.join(ROOT, "print"), exist_ok=True)
    for rel, content in want.items():
        io.open(os.path.join(ROOT, rel), "w", encoding="utf-8",
                newline="\n").write(content)
    print("wrote %d files: chapters.html, chapter pages, printables, sitemap.xml"
          % len(want))

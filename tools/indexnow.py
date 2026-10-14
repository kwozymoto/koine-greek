# -*- coding: utf-8 -*-
"""Tell search engines which pages changed, the moment a release is live.

    python tools/indexnow.py              # pages changed by the last commit
    python tools/indexnow.py v299..HEAD   # pages changed over a range
    python tools/indexnow.py --all        # every page in the sitemap
    python tools/indexnow.py --dry-run    # say what would be sent, send nothing

WHY. Google finds changes by re-crawling, on its own schedule. Bing, Yandex,
Naver, Seznam and Yep take IndexNow: one request naming the changed URLs, and
they fetch them. Bing matters beyond itself, because ChatGPT search, Copilot
and DuckDuckGo all draw on its index.

HOW. The key is the name and the content of the .txt file at the site root;
the engines fetch it to confirm the request came from whoever controls the
site. It is not a secret -- it is published by design. Only pages listed in
sitemap.xml are ever sent, so the audit pages robots.txt keeps out never are.

Run it AFTER the push has gone live (curl shows the new sw.js), or an engine
may fetch the old page.
"""
import glob
import json
import os
import re
import subprocess
import sys
import urllib.request

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOST = "everydaykoine.app"
SITE = "https://%s/" % HOST
ENDPOINT = "https://api.indexnow.org/indexnow"


def key():
    found = [os.path.basename(p)[:-4] for p in glob.glob(os.path.join(ROOT, "*.txt"))
             if re.fullmatch(r"[0-9a-f]{32}", os.path.basename(p)[:-4])]
    if len(found) != 1:
        sys.exit("expected exactly one <32 hex>.txt key file at the site root, found %d" % len(found))
    k = found[0]
    if open(os.path.join(ROOT, k + ".txt"), encoding="utf-8").read().strip() != k:
        sys.exit("the key file must contain its own name")
    return k


def sitemap_urls():
    xml = open(os.path.join(ROOT, "sitemap.xml"), encoding="utf-8").read()
    return re.findall(r"<loc>([^<]+)</loc>", xml)


def file_of(url):
    rel = url[len(SITE):]
    return rel or "index.html"


def changed(rng):
    r = subprocess.run(["git", "diff", "--name-only", rng], cwd=ROOT,
                       capture_output=True, text=True)
    if r.returncode:
        sys.exit("git diff failed: " + r.stderr.strip())
    return set(r.stdout.split())


def main(argv):
    dry = "--dry-run" in argv
    args = [a for a in argv if not a.startswith("--")]
    urls = sitemap_urls()
    if "--all" not in argv:
        files = changed(args[0] if args else "HEAD~1..HEAD")
        urls = [u for u in urls if file_of(u) in files]
    if not urls:
        print("no sitemap page changed; nothing to send")
        return 0
    k = key()
    body = {"host": HOST, "key": k, "keyLocation": SITE + k + ".txt", "urlList": urls}
    print("%d page%s:" % (len(urls), "" if len(urls) == 1 else "s"))
    for u in urls:
        print("   " + u)
    if dry:
        print("dry run: nothing sent")
        return 0
    req = urllib.request.Request(ENDPOINT, data=json.dumps(body).encode("utf-8"),
                                 headers={"Content-Type": "application/json; charset=utf-8"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            print("IndexNow answered %d" % r.status)
            return 0 if r.status in (200, 202) else 1
    except urllib.error.HTTPError as e:
        # 403: the key file is not live yet; 422: a URL is not on this host.
        print("IndexNow refused it: %d %s" % (e.code, e.read().decode("utf-8", "replace")[:300]))
        return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

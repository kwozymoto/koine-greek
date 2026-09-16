# -*- coding: utf-8 -*-
"""The service worker's file lists name files that exist.

    python tools/check_sw.py

WHY THIS EXISTS. sw.js carries three lists of paths — SHELL, which is
precached, STALE, which evicts bulk files whose content changed, and the
offline manifest — and a path in any of them that does not exist on disk
FAILS SILENTLY. Nothing throws. The shell just precaches one fewer file, or
the eviction matches nothing.

STALE is the dangerous one, and it is dangerous in a way that does not show
up for months. Vocabulary clips live in a bulk cache that is deliberately
never swept, so a phone that has cached a clip keeps it until something in
STALE names it. Misspell that name and the re-recording never reaches the
one device it was recorded for. On 2026-09-17 two of four entries in the
v167 block were typed from memory — `255_hudor.mp3` for `255_udor.mp3` and
`272_rhema.mp3` for `272_rema.mp3` — which is rule 1 of CLAUDE.md met in
the one place where breaking it leaves no trace at all.

It also asks the other direction of STALE, which is the half a spell-check
would miss: every bulk file whose content changed in this release must be
named. A re-cut clip left out of the list is the same permanent staleness,
arrived at by omission instead of by typo, so the check compares the list
against what git says actually changed since the last release.
"""
import io
import os
import re
import subprocess
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def array(src, name):
    """The quoted paths in `const NAME = [ ... ];`, comments dropped."""
    m = re.search(r"const\s+%s\s*=\s*\[(.*?)\n\];" % name, src, re.S)
    if not m:
        return None
    body = re.sub(r"/\*.*?\*/", "", m.group(1), flags=re.S)
    return re.findall(r"['\"]([^'\"]+)['\"]", body)


def changed_bulk():
    """Bulk files whose content changed since the previous release.

    The previous release is the last commit that touched sw.js, because this
    repo bumps VERSION in the same commit as the change it ships. WHICH
    commit that is depends on whether the release being checked is committed
    yet: with sw.js dirty, HEAD's copy is the last release; with it clean,
    HEAD's copy IS this release and the one before it is the last.

    Getting that wrong widens the window by a release, which does not fail
    today only because old blocks are still listed — and sw.js's own
    instruction is to empty a block in the release after the one that filled
    it, so a too-wide window is a false failure waiting for the next tidy-up.

    If git cannot answer — no repo, shallow clone — this returns None and the
    pass says so rather than guessing, because a silent skip here is the
    exact failure mode the file is about.
    """
    try:
        dirty = subprocess.run(["git", "status", "--porcelain", "--", "sw.js"],
                               cwd=ROOT, capture_output=True, text=True,
                               timeout=30)
        if dirty.returncode:
            return None
        skip = [] if dirty.stdout.strip() else ["--skip=1"]
        prev = subprocess.run(
            ["git", "log", "-1", "--format=%H"] + skip + ["--", "sw.js"],
            cwd=ROOT, capture_output=True, text=True, timeout=30)
        if prev.returncode or not prev.stdout.strip():
            return None
        out = subprocess.run(
            ["git", "diff", "--name-only", prev.stdout.strip(), "--",
             "audio", "data/gnt"],
            cwd=ROOT, capture_output=True, text=True, timeout=30)
        if out.returncode:
            return None
        return set(out.stdout.split())
    except Exception:
        return None


def main():
    src = io.open(os.path.join(ROOT, "sw.js"), encoding="utf-8").read()
    bad, notes = [], []

    ver = re.search(r"const\s+VERSION\s*=\s*'([^']+)'", src)
    if not ver:
        bad.append("sw.js has no VERSION")
    lists = {}
    for name in ("SHELL", "STALE"):
        got = array(src, name)
        if got is None:
            bad.append("sw.js has no %s array, or its shape changed" % name)
        else:
            lists[name] = got

    # 1. Every path named exists.
    for name, paths in lists.items():
        for p in paths:
            if p in ("./", "index.html") or p.startswith("http"):
                continue
            if not os.path.isfile(os.path.join(ROOT, *p.split("/"))):
                bad.append("%s names a file that does not exist: %s"
                           % (name, p))

    # 2. Nothing is listed twice within one release block. A repeat across
    #    blocks is expected and fine -- a clip re-cut twice appears under both
    #    versions -- so this only looks inside the current one.
    cur = re.search(r"const\s+STALE\s*=\s*\[\s*/\*(.*?)\*/(.*?)(?=\n\s*/\*|\n\];)",
                    src, re.S)
    if cur:
        block = re.findall(r"['\"]([^'\"]+)['\"]", cur.group(2))
        dupes = sorted({p for p in block if block.count(p) > 1})
        for p in dupes:
            bad.append("STALE lists %s twice in this release's block" % p)

    # 3. Every bulk file that changed in this release is evicted.
    changed = changed_bulk()
    if changed is None:
        notes.append("git could not name the previous release, so the "
                     "completeness of STALE was NOT checked")
    elif "STALE" in lists:
        listed = set(lists["STALE"])
        missing = sorted(f for f in changed
                         if f.endswith((".mp3", ".json")) and f not in listed)
        for f in missing:
            bad.append("%s changed in this release and STALE does not evict "
                       "it, so a phone that has cached it keeps the old one" % f)
        if changed:
            notes.append("bulk files changed since the last sw.js commit: %d"
                         % len(changed))

    print("check_sw", ver.group(1) if ver else "?",
          "  SHELL: %d" % len(lists.get("SHELL", [])),
          "  STALE: %d" % len(lists.get("STALE", [])))
    for n in notes:
        print("   " + n)
    for b in bad:
        print("   " + b)
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())

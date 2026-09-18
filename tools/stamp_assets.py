#!/usr/bin/env python3
"""Stamp the stylesheet and script links in every page with a content hash.

    <script src="assets/js/photos.js?v=3fa1c2d9">

Browsers keep a copy of these files, so without a stamp a visitor can see
the new page with last week's photo list. The stamp changes whenever the
file does, which makes every browser fetch the new one straight away.

Run after editing anything in assets/css or assets/js. add_photos.py and
the GitHub Action run it for you.
"""
import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ASSET_REF = re.compile(r'((?:href|src)="[^"]*?(assets/(?:css|js)/[\w.-]+\.(?:css|js)))(?:\?v=[0-9a-f]*)?"')


def digest(rel, cache={}):
    if rel not in cache:
        cache[rel] = hashlib.sha1((ROOT / rel).read_bytes()).hexdigest()[:8]
    return cache[rel]


def stamp():
    changed = []
    for page in sorted(ROOT.glob("*.html")):
        with page.open(newline="") as f:           # keep the pages' CRLF endings
            text = f.read()
        new = ASSET_REF.sub(lambda m: '%s?v=%s"' % (m.group(1), digest(m.group(2))), text)
        if new != text:
            with page.open("w", newline="") as f:
                f.write(new)
            changed.append(page.name)
    return changed


if __name__ == "__main__":
    changed = stamp()
    print("Stamped: " + ", ".join(changed) if changed else "All pages already up to date.")

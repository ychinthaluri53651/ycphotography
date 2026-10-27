#!/usr/bin/env python3
"""Give photos real descriptions (alt text), which also show as captions in the viewer.

    python3 tools/set_alt.py descriptions.json

The JSON maps photo ids to descriptions, for example
    {"yc-111": "Groom kissing the bride by the lake under autumn trees"}

Describe what is visible: who (roles, never names), where, and the moment, in
under about 125 characters. The photo list is read and written through
add_photos.py, never edited by hand, and the generic-caption flag is removed.
"""
import json
import sys
from pathlib import Path

from add_photos import load_photos, save_photos

LIMIT = 125


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    wanted = json.loads(Path(sys.argv[1]).read_text())
    photos = load_photos()
    by_id = {p["id"]: p for p in photos}

    problems = []
    for pid, alt in wanted.items():
        alt = " ".join(alt.split())
        if pid not in by_id:
            problems.append(f"{pid}: no such photo")
        elif not alt or len(alt) > LIMIT:
            problems.append(f"{pid}: keep it between 1 and {LIMIT} characters ({len(alt)})")
        elif '"' in alt or "<" in alt:
            problems.append(f"{pid}: no double quotes or angle brackets")
        wanted[pid] = alt
    if problems:
        sys.exit("Nothing changed:\n  " + "\n  ".join(problems))

    for pid, alt in wanted.items():
        by_id[pid]["alt"] = alt
        by_id[pid].pop("auto", None)
    save_photos(photos)
    left = sum(1 for p in photos if p.get("auto"))
    print(f"Described {len(wanted)} photos; {left} still have the generic description.")


if __name__ == "__main__":
    main()

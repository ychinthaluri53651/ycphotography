#!/usr/bin/env python3
"""Make the link-preview images that WhatsApp, iMessage, Facebook and others show
when someone shares a page of the site.

    python3 tools/make_social_images.py

Writes assets/img/social/<page>.jpg at the 1.91:1 shape those apps use, at most
1200 x 630. The crops come from the published renditions, so nothing is ever
upscaled: a tall photo gives a smaller image (about 1067 x 560), which the apps
still show large. Where a crop cuts off the gold Y in the corner, the same
watermark is added back to the preview.

The home page preview uses the first hero slide, so when the hero's first photo
changes, update "home" below, run this, and update og:image and the JSON-LD
"image" in index.html (their width and height too) so all of them stay in sync.
"""
from pathlib import Path

from PIL import Image

from add_photos import ROOT, ownership, watermarked

OUT = ROOT / "assets" / "img" / "social"
RATIO = 1200 / 630

# page: (source image, vertical centre of the crop as a share of the height,
#        add the watermark back if the crop loses it)
PAGES = {
    "home": ("assets/img/full/yc-111.webp", 0.40, True),
    "portfolio": ("assets/img/full/yc-028.webp", 0.47, True),
    "contact": ("assets/img/full/yc-042.webp", 0.38, True),
    "about": ("assets/img/about.webp", 0.80, False),   # a photo of me, not my work
}


def preview(src, centre, mark):
    img = Image.open(ROOT / src).convert("RGB")
    w = img.width
    h = round(w / RATIO)
    if h > img.height:                       # a very wide photo: crop the sides instead
        h = img.height
        w = round(h * RATIO)
    left = (img.width - w) // 2
    top = min(max(round(centre * img.height - h / 2), 0), img.height - h)
    crop = img.crop((left, top, left + w, top + h))
    # the watermark sits in the bottom-right corner of every rendition
    kept = top + h == img.height and left + w == img.width
    if crop.width > 1200:
        crop = crop.resize((1200, 630), Image.LANCZOS)
    if mark and not kept:
        crop = watermarked(crop)
    return crop


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    marks = ownership()
    for page, (src, centre, mark) in PAGES.items():
        img = preview(src, centre, mark)
        dest = OUT / (page + ".jpg")
        img.save(dest, "JPEG", quality=84, optimize=True, progressive=True, exif=marks["exif"])
        print(f"{dest.relative_to(ROOT)}  {img.width} x {img.height}  {dest.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()

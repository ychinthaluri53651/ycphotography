# Adding photos

Drop photos into the folder for the kind of work they are, for example
`weddings/`. A whole folder works too — drag `Bhuvika Candid` straight into
`weddings/` and everything inside it is picked up, however deeply it is nested.

**Copy them in, don't move them.** Hold ⌥ (Option) while you drag, or Finder
will move your only copy. The originals here are deleted once the photos are
on the site, and the site keeps them at 2400px, not full size.

Then commit and push. GitHub resizes each photo, adds it to that category on
the portfolio page, and clears this folder out. The site updates a minute or
two later. Run `git pull` afterwards to get those changes on your computer.

Folders: weddings, housewarming, events, portraits
Formats: JPG, PNG, WebP, TIFF, HEIC

## What happens on its own

- The portfolio arranges the photos itself, newest first — nothing to lay out,
  no HTML to edit.
- Raw files (CR2, NEF, ARW, DNG…) and Lightroom catalogues are ignored, so you
  can drop a folder straight off the card without sorting it first.
- A photo that is already on the site is recognised and skipped, so dropping
  the same folder twice doesn't duplicate anything.
- A descriptive filename (`bride-at-the-mandap.jpg`) becomes the caption under
  the photograph. A camera filename (`YOG02441.JPG`) doesn't — it is left
  without a caption rather than showing a meaningless one.

## Doing it on your own computer instead

    pip3 install pillow pillow-heif      # once
    python3 tools/add_photos.py

Same result, without waiting for GitHub. Run it from the site folder after
dropping photos in; your originals are left where they are.

<!-- How to use: open a new Claude Code session in this folder and say
     "Read MASTER-PROMPT.md and follow it." -->

# Master prompt: YC Photography website

## Your role and the goal

You are the lead designer and front-end engineer for **YC Photography**
(<https://ychinthaluri53651.github.io/ycphotography/>), the portfolio site of
Yogananda, a photographer based in Michigan who travels for work. The code is in
this repository.

Take the site from good to **visually impeccable**, and excellent in every other
respect: how the photographs are presented, design, copy, accessibility,
performance, SEO, enquiries and code quality. Keep everything that already works
working, above all the photo pipeline the owner relies on.

The visitors are couples planning weddings, families planning celebrations
(half saree ceremonies, baby showers, birthdays, housewarmings) and people
booking portrait sessions. Design phone-first.

**Success:** within a few seconds on a phone, a visitor sees beautiful work like
their own event, trusts the photographer, and finds it effortless to get in
touch. The photographs should look better here than anywhere else they appear.

The owner is a photographer, not a web developer. Explain your work in plain
language, show screenshots rather than describing changes, and ask them only
about decisions that are genuinely theirs (section 8).

---

## 1. How the site works today. Read this before changing anything

- **Static site, no build step, no dependencies.** It has 7 pages (`index`,
  `portfolio`, `about`, `contact`, `thanks`, `privacy`, `404`), one stylesheet
  (`assets/css/style.css`, with tokens at the top), one vanilla script
  (`assets/js/main.js`) and self-hosted fonts (Cormorant Garamond 300–400
  normal and italic, Inter 300–500, woff2). The site makes no third-party requests.
- **Hosting:** GitHub Pages serves the `main` branch of
  `github.com/ychinthaluri53651/ycphotography` at
  `https://ychinthaluri53651.github.io/ycphotography/`. That is a sub-path, so
  every URL must stay relative and never start with `/`. Because of `.nojekyll`,
  **every committed file is publicly served**, this one included.
  `netlify.toml` is a leftover, and its headers do not apply on GitHub Pages.
- **Publishing** means committing and pushing to `main`. The site updates 1–2
  minutes later. After every push, fetch the live URL to confirm the change.
- **Local preview:** run `python3 -m http.server` in the repo root and open
  `http://localhost:8000/`.
- **Owner's Mac:** it has Python 3 with Pillow. Google Chrome and the GitHub CLI
  are *not* installed.

### Photos

- `assets/js/photos.js` is **generated** by `tools/add_photos.py`. Never
  hand-edit it. Change it through that script, or through a small tool that
  reuses its `load_photos()` / `save_photos()`. Each entry has:
  - `id`: `yc-NNN`, where a higher number is newer
  - `w`, `h`: dimensions
  - `cat`: category
  - `alt`: alt text
  - `c`: dominant colour, used as a placeholder
  - `k`: fingerprint used for de-duplication
  - `auto: 1`: the alt text is generic and no caption is shown
  - `near`: sort this photo next to another photo's set
- **Renditions:** `assets/img/small/<id>.webp` (600 px long edge, for phones),
  `assets/img/thumb/<id>.webp` (900 px) and `assets/img/full/<id>.webp`
  (1600 px). All are WebP at q82, carry the gold
  "Y" watermark, and have copyright embedded in EXIF/XMP. There are 137 photos.
- **The originals are not kept.** A 1600 px watermarked file is the largest copy
  of any photo, so never upscale. A new, smaller rendition size must be made by
  downscaling the existing files, or from originals the owner supplies again.
- **Adding photos:** the owner drops files into
  `photos-to-add/<weddings|half-saree|baby-shower|photoshoots|birthdays>/`.
  For anything more than a handful, run these locally, then commit only
  `assets/` and `*.html`, **never the originals**:
  1. `python3 tools/add_photos.py`
  2. `python3 tools/stamp_assets.py`

  A recent batch of originals was 905 MB. The GitHub Action
  `.github/workflows/add-photos.yml` does the same work on push, using pinned,
  hashed dependencies (`tools/requirements.txt`). Keep both routes working, and
  update `photos-to-add/README.md` if you change the flow.
- **Cache busting:** `tools/stamp_assets.py` stamps `?v=<hash>` onto the CSS/JS
  links in every page. Run it after every CSS or JS change.

### Pages and behaviour

- **Home page photos are hand-picked.**
  - Selected work and the category cards use `data-photo="yc-NNN"` slots, which
    `fillSlots()` fills.
  - Hero slides are plain `<img>` tags. The first slide's image is also the
    `<link rel="preload">`, the `og:image` and the JSON-LD `image`, so keep all
    four in sync.
- **Selected work mosaic rule:** every row is either two wide (3:2) or three tall
  (2:3) frames. Mixing shapes in a row once left a visible hole, so any new
  layout must stay gapless at every width.
- **Portfolio:**
  - It is a masonry grid (CSS grid, with JS row spans) that shows one category
    at a time through filter buttons (`portfolio.html?c=weddings`).
  - The lightbox supports the keyboard and swipe.
  - A `<noscript>` fallback covers visitors without JavaScript.
- **Contact:** the form posts to FormSubmit, which forwards it to the owner's
  Gmail.
  - The address is assembled in JS so scrapers can't find it.
  - There is a honeypot field, and a successful send redirects to `thanks.html`.
  - After changing the form, send one real test and ask the owner to confirm it
    arrived. FormSubmit asks for activation the first time a message comes from
    a new setup.
- **Privacy promises** (`privacy.html`): no cookies, no tracking, no third-party
  requests. Breaking any of these needs the owner's approval, plus an updated
  privacy page.
- **Photo protection the owner chose:**
  - the watermark
  - right-click and drag blocking on photos
  - blocking of Cmd/Ctrl+S and Cmd/Ctrl+P
  - frame-busting

  Keep all of them unless the owner agrees otherwise.
- `.well-known/security.txt` expires on 2027-09-19. Renew it before then. It
  only takes effect once the site has its own domain (see section 3, item 15).

---

## 2. The owner's standing decisions. Don't re-open these

- **Real work only.** No stock, AI-generated or placeholder images, ever. The
  site promises "no stock, no borrowed frames". Never remove or weaken the
  watermark.
- **Small children on the home page:** the older child photos (`yc-039`,
  `yc-066`, `yc-071`, `yc-075`, `yc-076`, `yc-077`, `yc-080`) were deliberately
  taken off the home page, and must not come back. The October 2026
  first-birthday set (`yc-133` to `yc-143`) is approved. Ask before featuring
  any other photo of a small child on the home page.
- **The wedding party walking under the autumn trees (`yc-106`) came off the
  home page at the owner's request.** Don't feature it there again, or its
  near-duplicate `yc-107`. Both remain in the portfolio.
- **The home page statement ("Hey, I'm Yogananda") is text only.** Small photos
  set into its sentence were tried and removed at the owner's request. Keep the
  full-width layout and the scroll-linked ink effect, and keep it tight against
  Selected work, with no big gap.
- **Photos from the same shoot sit together and in order,** in the hero and in
  Selected work. Never interleave shoots.
- **The newest work leads.**
- Home page picks stay hand-chosen. You may propose an easier way for the owner
  to choose them, but don't make it automatic without approval.
- Never crop through faces. Prefer frames matched to the photo's shape over
  aggressive `object-fit` crops, and check every hero crop at phone width.

---

## 3. Known problems. This is where your audit starts, not where it ends

1. **Contrast fails WCAG AA for small text.**
   - `--accent` `#a9754f` is 3.7:1 on `--paper` and 3.4:1 on `--paper-2`.
     The 0.68rem uppercase eyebrows use it.
   - `--muted` `#7c756b` is 4.3:1 on `--paper` and 3.9:1 on `--paper-2`.
   - `--accent-deep` `#8a5c3c` passes at 5.4:1.
2. **Body text is Inter at weight 300,** which is thin for long reading on
   ordinary screens. Test 400.
3. **The hero auto-advances every 6 s with no pause control** (WCAG 2.2.2). It
   should pause on hover or focus and offer a visible pause/play button.
4. **Selected work frames open the lightbox on click,** but they can't be
   focused or opened with the keyboard.
5. **`buildGrid()` in `main.js` puts alt text into `innerHTML` unescaped,** so a
   quote in a caption breaks the markup.
6. **79 of the 137 photos have generic alt text** ("Wedding photograph by YC
   Photography") and therefore no caption.
7. **The About page stats are stale.** It says "55 frames in the portfolio"
   (there are 137) and "7 kinds of shoot" (there are 5 categories). Compute the
   count from `photos.js`, or reword.
8. **Contact form options don't match the galleries.** "What are we shooting?"
   offers Wedding, Housewarming, Event or celebration, Portrait session and
   Something else, which don't match the five portfolio categories. The meta
   description of `contact.html` mentions housewarmings, which have no gallery.
9. **The Instagram link on every page is `https://instagram.com/`,** with no
   handle.
10. **There are five breakpoints** (1100, 1024, 860, 640 and 560 px).
    Consolidate them into a deliberate set.
11. **`og:image` is a WebP.** Use a 1200×630 JPEG for reliable link previews
    (WhatsApp, iMessage, Facebook).
12. **Only two renditions exist.** Phones download 900 px files even for small
    slots.
13. **There are no testimonials anywhere.** That is the biggest trust gap for a
    wedding photographer, and it needs real ones from the owner.
14. **A shoot can't be viewed as a story.** The portfolio groups by category
    only. `add_photos.py` accepts a whole dropped folder (for example
    `weddings/<shoot name>/`) but throws the folder name away.
15. **`robots.txt`, its `Sitemap:` line and `.well-known/security.txt` are
    ignored.** Crawlers and security researchers look for these files only at
    the root of a domain, and this site lives under `/ycphotography/`. Until the
    site has its own domain, submit `sitemap.xml` through Google Search Console
    (as a URL-prefix property).

---

## 4. Design direction: what "visually impeccable" means here

**Principles**

- **The photographs are the design.** The interface steps back: warm paper,
  deep ink, and one bronze accent used sparingly. Avoid:
  - gradients, glows, heavy shadows and glassmorphism
  - decorative icons
  - anything else that competes with the photos
- **Evolve the identity rather than replacing it.** Keep the palette family,
  Cormorant Garamond for display, Inter for text, and the gold Y mark. Refine
  them, and rebrand only if the owner asks.
- **Editorial calm:** generous whitespace, clear hierarchy, unhurried rhythm.
  Every element earns its place.

**Concrete standards you can check**

- **Type:** a single modular scale defined as tokens, with at most about six
  sizes site-wide.
  - Body text is 17–18 px on desktop and at least 16 px on phones.
  - Lines are 55–75 characters long.
  - Use `text-wrap: balance` on headings and `pretty` on paragraphs, with no
    one-word widows.
  - Use only the font weights that are loaded. If you need another, self-host a
    subsetted woff2.
- **Spacing:** one 4/8-based spacing scale, tokens only, and the same section
  rhythm on every page.
- **Colour:** every colour is a token. Text contrast is at least 4.5:1, and large
  text and UI parts are at least 3:1. Light text over photos needs a measured
  scrim.
- **Images:**
  - Always set intrinsic `width`/`height` so nothing shifts as it loads.
  - Show the colour placeholder, then a soft fade-in.
  - Make `srcset`/`sizes` correct for 1×, 2× and 3× screens, and add a ~600 px
    rendition for phones.
  - Never upscale.
  - Tune hero `object-position` per breakpoint so faces survive on a 390×844
    screen.
  - WebP is fine. Add AVIF only if measurements show a real gain.
- **Motion:** subtle and purposeful, with fades and rises of 600 ms or less from
  the shared easing token. No scroll-jacking and no parallax jank. Everything
  respects `prefers-reduced-motion`.
- **Layout:** one max-width token, side gutters of at least 16 px on phones, no
  horizontal scroll anywhere from 320 to 2560 px, and gapless grids.
- **Finish:**
  - Optically align headings with images.
  - Use one treatment for corners, focus rings and links site-wide.
  - Every interactive element has hover, focus and active states.
  - Buttons are the same height, and icons share one stroke width (1.2 today).
  - Use sentence case, curly quotes and consistent dashes.
  - Use one spelling of each category ("half saree", not "half-saree" in visible
    text).
  - The favicon, touch icon and social preview are all crisp.
  - Printing produces a sensible page.
- **Dark theme:** don't add one unless the owner approves it. If you do, design
  it properly rather than inverting the colours.
- **Design skills:** if your environment offers design or accessibility-review
  skills, use them. Your own screenshots are still the final judge.

---

## 5. Scope, page by page

- **Home:**
  - The hero has five slides or fewer, new work first, and a pause control.
  - Keep the short personal statement.
  - Selected work is grouped by shoot, newest first, and stays gapless.
  - Then come the category cards, how I work, and the process.
  - Testimonials appear once the owner supplies real ones, followed by the
    call to action and the footer.
- **Portfolio:**
  - Make browsing beautiful on a phone.
  - **Propose "stories"** (⏸ owner approval first): record each shoot in
    `photos.js` when a folder is dropped in, group photos by shoot within each
    category, and, if approved, give each shoot its own page.
  - Shoot titles must be owner-approved, with no client names unless the owner
    says the clients consented.
- **About:**
  - Fix the stale stats.
  - Give the portrait (`assets/img/about.webp`) and the four promises a refined
    layout.
- **Contact:**
  - Make the options match the galleries, plus whatever else the owner wants.
  - Every field has a label and validates inline. Errors are clear and the
    success state is reassuring.
  - Keep the honeypot.
  - Test a real submission.
- **Thanks, privacy, 404:** bring them to the same finish. Update the privacy
  page whenever data handling changes.
- **Every page:**
  - Each page has a unique title and meta description, a canonical URL, and
    Open Graph/Twitter tags.
  - Add JSON-LD (`ProfessionalService` with `areaServed` Michigan, and `sameAs`
    once the Instagram handle is known).
  - Add `lastmod` to `sitemap.xml`, plus image entries.
- **Alt text:**
  - Look at each of the 79 generic photos and write real alt text describing
    what is visible: who (roles, never names), where, and the moment. Keep each
    under about 125 characters.
  - Update the entries through a tool, never by hand.
  - Decide with the owner whether these become visible captions.
- **Copy:**
  - Keep the owner's voice: warm, first person, plain, a little playful.
  - Fix inconsistencies, and use no hype words.
  - Every claim must be true. Keep the owner's own claims, such as "usually
    reply within an hour or two", unless they change them.

---

## 6. Engineering rules

- **Stay static and dependency-free.** No framework, bundler or runtime npm
  packages unless the owner approves. One person maintains this site, and the
  photo pipeline depends on its shape.
- **Dev tools stay out of the repo,** for example Playwright, Lighthouse and
  validators. Use a git-ignored folder or install globally. Everything committed
  is public.
- **HTML:**
  - It must be semantic and valid (zero W3C errors).
  - Each page has one `h1`, landmarks and `lang="en"`.
  - The header and footer are duplicated across all 7 pages, so keep them
    identical. If they change often, add a small sync tool in the style of
    `stamp_assets.py`.
- **CSS:**
  - Use tokens for colour, type, spacing, radius, shadow, z-index and duration.
  - No magic numbers and no `!important`.
  - Use a deliberate set of breakpoints, and delete dead rules.
- **JS:**
  - Use vanilla progressive enhancement with no inline handlers, and escape
    everything inserted as HTML.
  - Everything clickable is also reachable and usable with the keyboard.
  - The lightbox and the mobile menu trap focus, restore focus afterwards and
    close on Esc.
- **Pipeline:**
  - Read all of `tools/add_photos.py` before extending it.
  - Keep its numbering, `k` fingerprints, de-duplication, watermark and EXIF.
  - Any new rendition is also made by the GitHub Action, and is backfilled for
    existing photos by downscaling.
- **Git:**
  - Make small commits whose messages say *why*.
  - **Stage specific paths and never `git add -A` at the root.** `photos-to-add/`
    can hold hundreds of MB of originals, and `.claude/` is local tooling.
  - Never force-push or rewrite history.
  - Run `tools/stamp_assets.py` before committing any CSS/JS change.

---

## 7. Quality bar: the definition of done for every change

- **Screenshots, every time.**
  - Take them in a real browser at 360×740, 390×844, 768×1024, 1280×800,
    1440×900 and 1920×1080, before and after, for every page you touch.
  - Look at them yourself and fix anything off before calling the work done:
    alignment, spacing, crops, overflow, orphans.
  - With no browser automation available, install some for local use (such as
    Playwright's Chromium) or ask the owner to check. Never skip this step.
- **Lighthouse (mobile)** on Home, Portfolio and Contact:
  - Performance at least 95, and Accessibility, Best Practices and SEO all at
    100.
  - LCP under 2.0 s on mobile, CLS under 0.02, INP under 200 ms.
- **WCAG 2.2 AA:**
  - Contrast passes everywhere.
  - A keyboard-only walk-through of every page works, including the menu and
    the lightbox.
  - Focus is visible, reduced motion is respected, and labels and alt text are
    meaningful.
- **No errors anywhere:** no console errors, no 404s, HTML that validates, and
  every link working under the `/ycphotography/` sub-path.
- **The pipeline still works end to end.**
  - In a throwaway git worktree, never on `main`, drop in a test JPEG, run
    `add_photos.py`, and confirm the photo appears on the portfolio.
  - Then delete the worktree.
- **Live check:** after each push, confirm the live site serves the change.

---

## 8. Decisions only the owner can make. Ask, never guess

Gather these into one list during the audit and ask them together:

- **Contact details:** the Instagram handle, and any other contact details to show
  (WhatsApp, phone).
- **Testimonials:** real ones, shared with the clients' permission, and which
  photos go with each.
- **Pricing:** keep "no fixed menu", or show "starting from" prices or packages.
- **Domain:** whether to use a custom domain (buy one and point GitHub Pages at
  it). This helps the brand and SEO the most.
- **Analytics:** none (the current promise), or something cookieless such as
  GoatCounter or Plausible, with the privacy page updated to match.
- **Contact form:** which shoot types to offer.
- **Stories:** whether to build them, how to title them, and client consent for
  names and for showing children.
- **Captions:** whether the new alt text also shows as visible captions.
- **Save/print block:** whether to keep blocking the shortcuts. It also stops
  visitors printing the contact and privacy pages.
- **Home page photos:** which photos lead the home page after the redesign.

**Never invent:** prices, packages, reviews, client names, awards, years of
experience, counts of weddings shot, venues or publications.

---

## 9. How to work: phases and checkpoints

Work through these in order. At each **⏸ checkpoint**, stop and wait for the
owner's answer.

1. **Learn. Change nothing.**
   - Read every file.
   - View every photo; contact sheets built from `assets/img/thumb/` are
     efficient.
   - Take baseline screenshots and Lighthouse scores.
2. **Audit and plan ⏸**
   - Write a prioritised findings list. Give each finding a severity, the page,
     evidence or a screenshot, and the proposed fix. Cover design,
     accessibility, performance, SEO, copy, enquiries and code.
   - Show the proposed design direction as a working local prototype of the home
     page, at phone and desktop widths. Use screenshots, not adjectives.
   - Include the questions from section 8.
3. **Foundations.**
   - Build the tokens for type, spacing and colour, and fix contrast.
   - Unify breakpoints, layout and the shared header and footer.
   - Set up focus styles and the motion rules.
4. **Pages,** in this order: Home, Portfolio (with stories if approved), About,
   Contact, then Thanks, Privacy and 404.
5. **Photos:**
   - real alt text
   - the phone-size rendition
   - hero crops for each breakpoint
   - the JPEG social preview
6. **SEO and sharing:** metadata, JSON-LD and the sitemap.
7. **Final QA ⏸**
   - Run every gate in section 7.
   - Show before/after screenshots for each page, with live links.
   - List anything still open.

Big visual changes are shown to the owner, as local screenshots or a preview,
before they go to `main`. Bug fixes and invisible improvements can ship
directly, in small commits.

**After each phase,** give the owner a short plain-language note covering:
- what changed and why
- screenshots and live links
- what comes next
- any questions

---

## 10. Never

- Invent facts, prices, reviews, client names or statistics.
- Use stock, AI-generated or placeholder images, or alter the watermark.
- Commit camera originals or other files from `photos-to-add/`, apart from its
  README and `.gitkeep` files.
- Hand-edit `assets/js/photos.js`.
- Write URLs that start with `/`.
- Add third-party scripts, fonts, embeds, trackers or cookies without approval.
- Break the GitHub Action, `stamp_assets.py` or the add-photos flow.
- Bring back the removed child photos, or interleave shoots on the home page.
- Ship a big redesign to `main` before the owner has seen it.

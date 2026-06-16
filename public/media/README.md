# Media for subjectreport.com

This folder is wired into `Subjectreport.html` and is the **live** media
folder — everything here is served on the real site via Vercel (anything
outside `/public/` is NOT served, so always add new files in here, not in
the root-level `media/` folder).

## Hero background video — LIVE
- `media/hero-bg.mp4` — currently your `hero-bg-new.mp4` (7MB, compressed).
  Plays full-bleed, muted, looping, behind the hero headline.
- To swap it: replace this file (keep the same name) and push. Keep it
  short (5–15 sec loops well) and under ~20MB so it loads fast.

## "See It In Action" carousel — LIVE
Six slots, currently filled with real event photos (compressed to ~200–550KB
each so the page stays fast):

- `media/carousel-1.jpg` ← event-09-bergen-catholic.jpg — "Film Breakdown Session"
- `media/carousel-2.jpg` ← event-10-dream-chasers.jpg — "Transcript Walkthrough"
- `media/carousel-3.jpg` ← event-11-walnut-grove.jpg — "Athlete Reviewing Grades"
- `media/carousel-4.jpg` ← event-12-harm.jpg — "Recruiting Blueprint Session"
- `media/carousel-5.jpg` ← event-13-plano-lacrosse.jpg — "Coach Reviewing Transcript"
- `media/carousel-6.jpg` ← event-14-scooba.jpg — "Signing Day"

To swap a photo, replace the matching `carousel-N.jpg` file. To change a
caption, edit the `.reel-slide` blocks inside
`<section class="action-reel" id="in-action">` in `Subjectreport.html`.

## Testimonial photos — STILL PLACEHOLDER
No photos matched the 5 testimonial names yet (the crew photos found were
team/staff photos, not these clients), so these still show initials only:

- `media/testimonials/jordan-m.jpg` — Jordan M.
- `media/testimonials/marcus-j.jpg` — Marcus J.
- `media/testimonials/terrence-r.jpg` — Terrence R.
- `media/testimonials/darius-w.jpg` — Darius W.
- `media/testimonials/kayla-a.jpg` — Kayla A.

Square images work best (cropped into a 48x48 circle). Drop a file in with
the exact name above to activate it.

## Reference library (not yet wired into a specific section)
Copied in from your root `media/` folder, compressed for the web, organized
for reuse in future sections:

- `media/event-photos/` — 12 event/game photos
- `media/athlete-photos/` — 8 athlete photos
- `media/crew-photos/` — 7 team/staff photos
- `media/carousel/` — the 2 original full-res carousel photos (compressed copies)
- `media/action-reel-2.mp4`, `media/action-reel-3.mp4`, `media/pylon-rated.mp4` — extra video, not yet placed in a slot

**Not copied (too large for GitHub):** `pylon.mp4` (150MB) and
`highlight-reel.mp4` (104MB) exceed GitHub's 100MB per-file limit and were
left in the root `media/` folder. If you want either on the site, they'd
need compressing first or hosting via a video platform (e.g. YouTube/Vimeo
embed) instead of a direct file.

## How to add a file
Drop the file into this folder (or a subfolder) using the exact filename
needed, then commit and push through VS Code Source Control as usual.
Vercel redeploys automatically — no other steps required. Keep individual
images under ~1–2MB and videos under ~50MB so pages stay fast.

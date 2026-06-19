# Subject Medias — Clipping Foundation
**Version:** 1.0
**Owner agent:** CONTENT-ENG (clip sourcing, cutting, routing) + QA (rights-check gate)
**Purpose:** A repeatable system for turning Hudl, YouTube, Kick, and Twitch footage into short-form clips that grow both Subject Medias' own pages (IG/YouTube/Kick/Twitch) and individual creators'/athletes' personal pages — without the brand quietly absorbing someone else's copyright risk to do it.

**Read this first:** the four sources are not interchangeable. Two are almost always safe to clip from; two require a real rights check every time. That distinction is the spine of this whole document — speed should never be allowed to erase it.

---

## Part 1 — The Source-Rights Matrix

| Source | Default rights status | What that means in practice |
|---|---|---|
| **Hudl** (game film from our own events/creators) | **Ours to use.** Hudl's own athlete guidance says highlight reels can be shared outside the platform via embed links for exposure. If it's footage from an event we shot, or a signed creator's own team film, this is safe to clip. | Clip freely. Still apply the minor-safety consent rule from `MASTER-BUILD-PIPELINE.md` if other kids are visible. |
| **YouTube — our own channels** (Subject Medias, a signed creator's own channel) | **Ours to use.** | Clip freely, same minor-safety rule applies. |
| **YouTube — other people's channels** (a tournament's official upload, a rival creator, a random highlight account) | **Needs a check.** YouTube's own ToS and copyright system will catch most unauthorized reuse anyway (Content ID), and even if it doesn't, it's not our footage to redistribute as Subject Medias content. | Default: don't clip. Exception: official tournament/event partners we have a documented relationship with (see Part 3) and who've said yes to being clipped. |
| **Kick — our own signed creators' own streams** | **Ours to use**, since it's the creator's own broadcast and they're part of our program. | Clip freely, with the creator's own awareness/consent that their stream content feeds the page (covered in onboarding, see Part 4). |
| **Kick — other streamers, third parties** | **Hard no by default.** Kick's copyright enforcement is looser than Twitch's, which is a reputational risk, not a license — being lightly moderated doesn't mean content there is free to take. There's already a public case of a streamer accusing Kick itself of reposting his content without permission or payment; that's exactly the kind of dispute we don't want our name near. | Don't clip from other people's Kick channels without an explicit, documented yes from that streamer. |
| **Twitch — our own signed creators' own streams** | **Ours to use**, same logic as Kick. | Clip freely, same consent-aware onboarding. |
| **Twitch — other streamers, third parties** | **Hard no by default.** Twitch's terms grant specific, limited rights around Clips made *on* the platform — they do not hand a third party brand like Subject Medias blanket rights to rip a stream and repost it elsewhere. Unauthorized clips from streams, movies, TV, or sports broadcasts are a known, common cause of takedowns. | Same as Kick — explicit documented yes required, no exceptions for "it's just a short clip." |

**The one-line rule this matrix encodes:** if the footage came from *our own* people's channels/film, clip away. If it came from *someone else's* broadcast, the default is no, and the only way to yes is a real, documented permission — never an assumption based on platform laxity, clip length, or "everyone does this."

## Part 2 — The Clip Pipeline (for cleared sources)

1. **Source.** CONTENT-ENG pulls from Hudl/owned YouTube/owned Kick-Twitch streams per Part 1.
2. **Cut.** Identify the moment (highlight, reaction, funny beat, recruiting-relevant play) — same editorial eye as the existing CMC/Subject Medias highlight style already shows on the live site.
3. **Minor-safety check.** If anyone besides the featured athlete is recognizable and didn't separately consent, default to the same Section 2 rule from the consent agreement: don't post publicly unless cleared.
4. **Route.** Decide destination(s) per Part 3's routing table — this is the step that decides Subject Medias' page, the creator's own page, or both.
5. **Caption + post.** CONTENT-ENG drafts caption in the relevant voice (Subject Medias brand voice for the company pages, the creator's own established voice for their personal pages — don't flatten a creator's voice into the company's).
6. **Log it.** Every clip posted gets a line in the clip log (Part 5) — source, rights basis, destination(s), who approved if it was a third-party-source exception.

## Part 3 — Routing: whose page does a clip go on?

Since the goal is growing **both** Subject Medias' own pages *and* creators' individual pages from the same pipeline, routing needs an actual rule, not a guess each time.

| Clip type | Goes on Subject Medias' pages? | Goes on the creator's own page? |
|---|---|---|
| Footage *of* an athlete, shot *by* a Subject Medias/SubjectSkillz creator at a booked event | Yes — this is exactly the highlight-reel content the company pages are built around | Yes, if the creator wants to cross-post their own work — their call, not automatic |
| Footage *from* a creator's own Hudl/Kick/Twitch/YouTube of their own work (behind-the-scenes, their own process, their own commentary) | Sometimes — if it's good brand-building content for Subject Medias (e.g. "meet the creator" style) | Yes — primarily theirs |
| Cleared third-party footage (rare, documented exception under Part 1) | Only with the explicit terms of the clearance — some permissions are platform-specific | Generally no, unless the clearance covers it |

**Default when unsure:** post to the creator's own page first, since that's lower-stakes and squarely theirs; only cross-post to Subject Medias' company pages with a deliberate choice, not as a default reflex.

## Part 4 — What this means for creator onboarding (ties to the Scale Intake SOP)

Add one item to the creator onboarding conversation (stage 8 package, or the intake form's notes field): **does this creator stream on Kick/Twitch themselves, and are they fine with Subject Medias clipping their own streams for the company pages?** This is a separate yes/no from the event-footage consent agreement — streaming consent covers *their own broadcast*, not third-party footage of other kids. Track it the same way: a real answer on file, not an assumption.

## Part 5 — The Clip Log (minimum viable tracking)

A simple running record — could be an Airtable/Notion table or even a spreadsheet to start:

| Clip ID | Source platform | Source owner (us / creator / third-party-cleared) | Featured athlete(s) | Other minors visible? | Destination(s) | Posted date | Notes |
|---|---|---|---|---|---|---|---|

This isn't bureaucracy for its own sake — it's the same audit-trail instinct as the `content_clearance` gap flagged in CMC's stage 7. If a rights question or a parent question ever comes up about a specific clip, this is what answers it in thirty seconds instead of someone trying to remember.

## Part 6 — What this foundation explicitly does NOT do

- **It does not authorize clipping other people's Kick/Twitch streams or YouTube uploads by default.** "All 4 platforms" as a source list means all 4 are *in scope for our own content*; it does not mean blanket clearance to clip everyone else's content on those same platforms.
- **It does not override the minor-safety consent gate.** A clip being "ours" to use rights-wise doesn't exempt it from the third-party-minor check if other kids are in frame.
- **It does not assume a creator's streaming activity is automatically company content.** That needs the explicit yes described in Part 4.

## Exit gate for this foundation being "live"
- [ ] Clip log exists somewhere real (even a basic sheet)
- [ ] At least one creator has the streaming-consent question added to their onboarding
- [ ] First 5-10 clips posted and logged, sourced only from Part 1's "ours to use" rows
- [ ] No third-party-source clip posted without a documented exception on file

## Revision History
- v1.0 — Built from the real Subject Medias site/brand and the actual ToS landscape for Hudl, YouTube, Kick, and Twitch. Establishes the source-rights matrix as the structural gate (not a footnote), a routing rule for dual-growth (company pages + creator pages), and a lightweight clip log for accountability.

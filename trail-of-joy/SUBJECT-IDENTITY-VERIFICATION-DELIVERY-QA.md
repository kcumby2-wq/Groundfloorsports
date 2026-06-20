# Subject Identity Verification — Delivery QA Principle
**Version:** 1.0
**Status:** Active cross-cutting QA principle. Applies to ALL content delivery across Trail of Joy's tracks and the AGV creative agent — not specific to any one track or agent.

**What this addresses:** A real delivery-QA gap: confirming that delivered content actually shows the right specific athlete/subject, not just "a subject who matches the general request." Jersey number is the concrete, low-effort identifier that makes this checkable at scale, but the principle generalizes beyond jersey numbers.

---

## Why this matters

Most of the minor-safety work in this system is about *whether* content should exist at all — consent, prohibited operations, release scope. This document is about a different and more mundane risk: **even when everything else is done right, the wrong kid's photo can still end up in the wrong family's delivery.** At a tournament with 200+ kids across a dozen teams, or in an AI-generation pipeline where a Soul ID or prompt-anchor could drift, misattribution is a real, ordinary failure mode — not a malicious one, just a sorting mistake. It matters because:

- A family paying for coverage of their kid deserves their kid, not a similar-looking teammate.
- Misattributed content involving a DIFFERENT minor than the one consent was obtained for is a real privacy problem, even if it was an honest mistake.
- At scale (50+ creators, multiple events a week, an AI generation pipeline in the mix), "I'm pretty sure that's the right kid" stops being good enough.

## The core principle

**Every content delivery — whether from real photo/video coverage or from AGV's AI-generated assets — should have a concrete, checkable identity signal attached, not just a name in a file path.**

A jersey number is the best low-effort identifier in most youth sports contexts because:
- It's visible in the actual content (not just metadata you have to trust)
- It's already part of how rosters are organized
- It doesn't require any extra capture step beyond knowing the roster

Other usable identifiers, depending on context: team + position combination, a specific recognizable piece of gear, or (for non-sports contexts) some other roster-equivalent structured fact.

## How this works in practice

### Step 1 — Capture roster data as structured intake, not tribal knowledge

At the point a Track A creator, Track B athlete, or Track C client's roster is established, capture jersey number (or equivalent identifier) alongside name as structured data — not just known informally by whoever's sorting photos that day.

```yaml
roster_entry:
  athlete_name: [first + last, or however the family wants it recorded]
  jersey_number: [as worn, including any team-specific quirk like "no zero, just 7"]
  team_name: [if relevant — disambiguates when multiple teams share a venue]
  is_minor: [true/false]
  consent_status: [reference to whichever consent/release document applies]
```

This can live in whatever the operator already uses for intake (the SCALE-INTAKE-SOP's structured intake, a roster spreadsheet, an Airtable, etc.) — the point isn't a new system, it's that jersey number becomes a captured field, not something someone has to remember or guess.

### Step 2 — Use the structured data to flag mismatches automatically where possible

Where content delivery already passes through some kind of structured pipeline (file naming, a sorting tool, AGV's request schema), the system can flag an obvious mismatch — e.g., a file labeled for athlete X but the request metadata references a different jersey number than X's roster entry. This isn't AI visually reading jersey numbers off photos (that's a separate, harder computer-vision problem this document does NOT propose solving right now) — it's a simple structured-data cross-check: does the metadata attached to this delivery match the roster record for the family it's going to?

### Step 3 — A human does the final visual confirm before delivery

The structured-data flag catches metadata-level mismatches. It does NOT replace a human actually looking at the content and confirming the right kid is in it. For real photo/video coverage, this is part of the existing post-shoot sorting workflow (see `POST-SHOOT-SORTING-CHECKLIST.md`) — add one more question to that pass: **"Is the jersey number visible in this shot, and does it match who I'm about to deliver this to?"** For AI-generated content (AGV), this becomes part of AGV's validation step — see the AGV v1.2 update below.

## What this principle does NOT do

- **Does not propose automated visual jersey-number recognition.** That's a real computer-vision task with its own failure modes (legibility, occlusion, motion blur) and isn't something to bolt on without real engineering investment. The structured-data cross-check plus human visual confirm is the right-sized solution for now.
- **Does not replace the existing third-party-minor handling rules** (Section 2 of the consent agreement, the post-shoot sorting checklist's public/private bucketing). This is an additional check layered on top — confirming WHO is in a piece of content, separate from deciding WHETHER that content can be public.
- **Does not apply retroactively** to content already delivered before this principle existed — it's a going-forward standard.

## Where this applies across the system

| Context | What changes |
|---|---|
| Real photo/video coverage (Track A/B) | Post-shoot sorting checklist gets one added question: jersey-number visual confirm against the family being delivered to |
| AGV (AI-generated assets) | AGV's validation step (Workflow Step 8) gets an added hard check — see AGV v1.2 |
| Roster/intake capture | Jersey number becomes a structured intake field wherever a roster exists, not informal knowledge |

## Revision History
- v1.0 — First documented delivery-QA principle for subject identity verification. Establishes jersey number (or equivalent) as a structured intake field, a metadata-level cross-check where structurally possible, and a mandatory human visual confirm as the final step. Explicitly scopes out automated visual jersey-number recognition as out of scope for now. Companion to the AGV v1.2 update and an added question in the Post-Shoot Sorting Checklist.

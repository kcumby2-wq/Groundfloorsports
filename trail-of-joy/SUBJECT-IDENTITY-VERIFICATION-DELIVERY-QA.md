# Subject Identity Verification — Delivery QA Principle
**Version:** 1.1
**Status:** Active cross-cutting QA principle. Applies to ALL content delivery across Trail of Joy's tracks and the AGV creative agent — not specific to any one track or agent.

**What this addresses:** A real delivery-QA gap: confirming that delivered content actually shows the right specific athlete/subject, not just "a subject who matches the general request." Jersey number is the concrete, low-effort identifier for general delivery; Prospect Edge's Play Number convention is the identifier for anything that's also going through Optimum Grading.

**What changed in v1.1:** Adds Prospect Edge (optimumgrading.com) as a second, parallel identifier pathway. Owner clarified that Prospect Edge's "Play Number Detection" feature ties a filename-encoded Play Number 1:1 to a specific athlete's specific play (e.g., `020.mp4` → Play 20 → that play already corresponds to one specific roster athlete) — this is NOT a generic sequential index, it's a real identity-bearing convention already in use for grading uploads. Per owner's explicit scoping: use Prospect Edge's filename convention for any footage that's also going through grading; use jersey number for general delivery/AGV cases. The two are not merged into one universal standard — they're parallel pathways for different destinations.

---

## Why this matters

Most of the minor-safety work in this system is about *whether* content should exist at all — consent, prohibited operations, release scope. This document is about a different and more mundane risk: **even when everything else is done right, the wrong kid's photo can still end up in the wrong family's delivery, or the wrong play can get attributed to the wrong athlete in a grading report.** At a tournament with 200+ kids across a dozen teams, or in an AI-generation pipeline where a Soul ID or prompt-anchor could drift, misattribution is a real, ordinary failure mode — not a malicious one, just a sorting mistake. It matters because:

- A family paying for coverage of their kid deserves their kid, not a similar-looking teammate.
- A grading report attributing the wrong athlete's play to the wrong name is a real credibility and accuracy problem for a recruiting-facing product.
- Misattributed content involving a DIFFERENT minor than the one consent was obtained for is a real privacy problem, even if it was an honest mistake.
- At scale (50+ creators, multiple events a week, an AI generation pipeline in the mix, AND a grading pipeline in the mix), "I'm pretty sure that's the right kid/play" stops being good enough.

## Two parallel identifier pathways (v1.1)

This system now has two distinct, non-merged identity-verification pathways, used depending on where the footage is going:

| Pathway | Identifier | Used when | Source of truth |
|---|---|---|---|
| **Prospect Edge / Optimum Grading pathway** | Play Number, encoded in filename (e.g. `020.mp4` → Play 20, `End Zone - Clip 001` → Play 1) | Footage is being uploaded to Prospect Edge for grading | Prospect Edge's own Play Number Detection feature, which already ties a play number to a specific athlete's specific snap on the roster within that platform |
| **General delivery / AGV pathway** | Jersey number (or equivalent identifier) | Any other content delivery — family delivery, public posting, AGV-generated assets | Roster data captured at Trail of Joy intake, per Step 1 below |

**These are NOT the same identifier and should NOT be conflated into a single "universal ID" system.** Play Number is specific to Prospect Edge's grading workflow and only makes sense in that context — it encodes "which play in the game," not "which physical jersey number is visible in a given photo." Jersey number is the right identifier for general delivery because it's something a human can actually see and visually confirm in a photo or video frame, which Play Number alone doesn't give you outside Prospect Edge's own system.

**If the same footage is going to BOTH destinations** (e.g., raw game footage gets both graded in Prospect Edge AND used to generate social content via AGV), it needs to carry both labels — the Prospect Edge filename convention for the grading upload, and a separate jersey-number cross-check at the point it's used for delivery/AGV. One does not substitute for the other.

## How this works in practice

### For the Prospect Edge / grading pathway

1. **Footage destined for grading is named per Prospect Edge's supported formats** at the point of export/upload — sequential numbering (`Play 1`, `Play 2`...) or filename-embedded play numbers (`020.mp4`, `End Zone - Clip 001`), per the Play Number Detection feature's own supported formats.
2. **Prospect Edge's own system handles the play-to-athlete mapping** within its grading workflow — this document doesn't need to duplicate that; it's Prospect Edge's job once footage is correctly named going in.
3. **The verification step on Trail of Joy's side is upstream of Prospect Edge:** before naming/uploading, confirm the right clips are being assigned the right play numbers for the right athlete — i.e., the same "is this actually the right kid's play" judgment call, just applied at the naming/export step rather than at delivery.

### For the general delivery / AGV pathway (jersey number — unchanged from v1.0)

### Step 1 — Capture roster data as structured intake, not tribal knowledge

At the point a Track A creator, Track B athlete, or Track C client's roster is established, capture jersey number (or equivalent identifier) alongside name as structured data — not just known informally by whoever's sorting photos that day.

```yaml
roster_entry:
  athlete_name: [first + last, or however the family wants it recorded]
  jersey_number: [as worn, including any team-specific quirk like "no zero, just 7"]
  team_name: [if relevant — disambiguates when multiple teams share a venue]
  is_minor: [true/false]
  consent_status: [reference to whichever consent/release document applies]
  prospect_edge_player_id: [if this athlete is also tracked in Prospect Edge — optional cross-reference field, NEW in v1.1, so the two systems can be reconciled by a human if ever needed, without merging them into one ID scheme]
```

This can live in whatever the operator already uses for intake (the SCALE-INTAKE-SOP's structured intake, a roster spreadsheet, an Airtable, etc.) — the point isn't a new system, it's that jersey number becomes a captured field, not something someone has to remember or guess.

### Step 2 — Use the structured data to flag mismatches automatically where possible

Where content delivery already passes through some kind of structured pipeline (file naming, a sorting tool, AGV's request schema), the system can flag an obvious mismatch — e.g., a file labeled for athlete X but the request metadata references a different jersey number than X's roster entry. This isn't AI visually reading jersey numbers off photos (that's a separate, harder computer-vision problem this document does NOT propose solving right now) — it's a simple structured-data cross-check: does the metadata attached to this delivery match the roster record for the family it's going to?

### Step 3 — A human does the final visual confirm before delivery

The structured-data flag catches metadata-level mismatches. It does NOT replace a human actually looking at the content and confirming the right kid is in it. For real photo/video coverage, this is part of the existing post-shoot sorting workflow (see `POST-SHOOT-SORTING-CHECKLIST.md`) — Question 5 in that checklist. For AI-generated content (AGV), this is AGV v1.2's subject_identity_check hard gate.

## What this principle does NOT do

- **Does not propose automated visual jersey-number recognition.** That's a real computer-vision task with its own failure modes (legibility, occlusion, motion blur) and isn't something to bolt on without real engineering investment. The structured-data cross-check plus human visual confirm is the right-sized solution for now.
- **Does not merge Prospect Edge's Play Number system with Trail of Joy's jersey-number system into one universal ID.** They stay parallel, used for their respective destinations, with an optional cross-reference field (`prospect_edge_player_id`) for human reconciliation if ever needed — not an automated sync.
- **Does not replace the existing third-party-minor handling rules** (Section 2 of the consent agreement, the post-shoot sorting checklist's public/private bucketing). This is an additional check layered on top — confirming WHO is in a piece of content, separate from deciding WHETHER that content can be public.
- **Does not apply retroactively** to content already delivered or already graded before this principle existed — it's a going-forward standard.

## Where this applies across the system

| Context | What changes |
|---|---|
| Footage going to Prospect Edge for grading | Named per Prospect Edge's supported filename formats at export/upload; play-to-athlete verification happens upstream of the upload, at naming time |
| Real photo/video coverage (Track A/B), general delivery | Post-shoot sorting checklist's Question 5: jersey-number visual confirm against the family being delivered to |
| AGV (AI-generated assets) | AGV's validation step — subject_identity_check hard check (AGV v1.2) |
| Roster/intake capture | Jersey number becomes a structured intake field wherever a roster exists; optional Prospect Edge player ID cross-reference field added in v1.1 |

## Revision History
- v1.0 — First documented delivery-QA principle for subject identity verification. Establishes jersey number (or equivalent) as a structured intake field, a metadata-level cross-check where structurally possible, and a mandatory human visual confirm as the final step.
- v1.1 — Adds Prospect Edge (Optimum Grading) as a second, parallel identifier pathway. Play Number (filename-encoded, per Prospect Edge's Play Number Detection feature) is used for footage going to grading; jersey number remains the identifier for general delivery and AGV. The two pathways are explicitly NOT merged into a single universal ID — owner's direct scoping decision. Adds an optional `prospect_edge_player_id` cross-reference field to the roster schema for human reconciliation, not automated sync. Notes that footage going to BOTH destinations needs both labels, since one doesn't substitute for the other.

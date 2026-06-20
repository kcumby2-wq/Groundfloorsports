# Prospect Edge ↔ Trail of Joy Roster Integration Spec
**Version:** 1.0
**Status:** Integration spec — defines how Trail of Joy's roster/identity data relates to Prospect Edge's existing prospect database, rather than duplicating it. Companion to `SUBJECT-IDENTITY-VERIFICATION-DELIVERY-QA.md` v1.1.

**What this corrects:** The delivery-QA principle (v1.0/v1.1) proposed that Trail of Joy capture jersey number as a NEW structured intake field, as if no such system existed yet. That was wrong. **Prospect Edge already has a real, working prospect database with jersey number as a captured field** (visible in its Subject Report prospect table: Avatar, First Name, Last Name, Jersey, Email, Ht, Wt, Grade), an "Add Prospect" form with a dedicated `Jersey #` field, and a real Play Number → athlete binding already operating in its grading workflow. Trail of Joy should NOT rebuild this. This spec defines how Trail of Joy references and stays in sync with what already exists in Prospect Edge, instead of treating jersey-number capture as a gap to fill from scratch.

---

## What already exists in Prospect Edge (confirmed from the product itself)

**The Subject Report prospect table** (the "Active Prospects" view) is the canonical roster for any athlete tracked in Prospect Edge. Confirmed fields, in order as they appear in the actual table:

| Field | Notes |
|---|---|
| Avatar | Photo |
| First Name | |
| Last Name | |
| Jersey | The exact identifier the delivery-QA principle needs |
| Email | Contact field — worth noting this is the athlete/family contact on file in Prospect Edge |
| Ht / Wt | |
| Grade | The star-rating output of the grading workflow |

**The "Add Prospect" form** captures a richer set on intake, including fields the table view doesn't show: X (Twitter), Instagram, TikTok, Highlight Video, High School, Jersey #, Class/Yr, Height, Weight, Position, State/Province, Rec Team.

**The Play Number → athlete binding** is real and already operating: a play (e.g., "Play 1") is tied to a specific athlete's profile, with a specific camera angle (Eagle Eye, End Zone, Sideline), and grading scores are attached to that specific play-athlete pairing. This is the mechanism Prospect Edge uses internally — Trail of Joy doesn't need to re-implement it.

**Capacity:** the "Add Prospect (4/2500)" counter shown in the product indicates Prospect Edge is built to scale to at least 2,500 prospects per account — well beyond Trail of Joy's current roster sizes, so capacity isn't a near-term constraint.

## The integration principle

**Prospect Edge is the source of truth for any athlete who's already in its prospect database. Trail of Joy's roster data for that athlete should reference Prospect Edge's record, not duplicate or re-enter it.**

This avoids the classic two-systems problem: if Trail of Joy keeps its own separate copy of "Trey Wright, jersey 3," and someone later corrects a typo in Prospect Edge, Trail of Joy's copy silently goes stale. A reference avoids that; a duplicate doesn't.

## How this actually works, in practice

### Case 1 — The athlete is already a Prospect Edge prospect (Track B/C athletes being graded)

For any Track B (Groundfloorsports-filmed) athlete or Track C client's athlete who's already entered in Prospect Edge:

- **Trail of Joy's roster entry stores a reference, not a duplicate.** Per the `prospect_edge_player_id` field already added to the roster schema in the delivery-QA principle v1.1 — this is now upgraded from "optional cross-reference for human reconciliation" to **the primary link**, since we now know there's a real system on the other end of it worth linking to, not just a hypothetical one.
- **Jersey number, name, height/weight pull FROM Prospect Edge** rather than being re-entered at Trail of Joy intake. If Trail of Joy's intake process is capturing this data fresh every time, that's duplicate data entry that can drift — better to ask "is this athlete already in Prospect Edge?" first, and if yes, link rather than re-type.
- **The subject_identity_check in AGV, and Question 5 in the post-shoot sorting checklist, can pull the expected jersey number directly from Prospect Edge's record** rather than from a separately-maintained Trail of Joy field, whenever the `prospect_edge_player_id` link exists.

### Case 2 — The athlete is NOT yet in Prospect Edge (e.g., a brand-new Track A creator who isn't a graded prospect, or a Track C client's athlete who isn't being graded)

- Trail of Joy's own roster capture (per the delivery-QA principle's original Step 1) still applies as a fallback — jersey number gets captured directly at Trail of Joy intake, with no Prospect Edge link.
- **This is the normal case for Track A creators specifically** — a SubjectSkillz creator running their own media business isn't necessarily a graded recruiting prospect. Prospect Edge integration is primarily relevant for Track B and Track C engagements where grading/recruiting is part of the value proposition (Subject Report's actual product), not for every Trail of Joy roster entry universally.

### Case 3 — An athlete gets added to Prospect Edge AFTER Trail of Joy already has a standalone roster entry for them

- At that point, the Trail of Joy entry should be updated to add the `prospect_edge_player_id` link, and going forward Case 1's rules apply — Prospect Edge becomes the source of truth for that athlete's identity fields, and Trail of Joy's own copy of jersey number/name/etc. should be treated as potentially stale until reconciled.

## What this does NOT require building right now

**This spec does not require an automated API sync between Trail of Joy's systems and Prospect Edge.** That would be real engineering work (authentication, webhook or polling logic, conflict resolution if both sides edit) that isn't justified yet at current scale. What this DOES require, and is realistic to do now:

- **A human, at the point of intake or roster setup, checks whether the athlete already exists in Prospect Edge** and records the `prospect_edge_player_id` (or the equivalent — whatever Prospect Edge's record identifier actually is; if Prospect Edge doesn't expose a clean ID, even just "first + last name + team, cross-checked manually" is the fallback) if so.
- **Anyone doing the subject-identity confirm (AGV's hard gate, or post-shoot sorting's Question 5) checks Prospect Edge's record directly when a link exists,** rather than trusting a separately-typed copy that might be stale.

A real API-level sync becomes worth building once volume justifies the engineering cost — that's a future decision, not a blocker on using Prospect Edge as source-of-truth today.

## What this means for the delivery-QA principle and AGV

This spec doesn't change the validation LOGIC in `SUBJECT-IDENTITY-VERIFICATION-DELIVERY-QA.md` v1.1 or AGV v1.2 — the hard-gate human-visual-confirm structure stays exactly as designed. What changes is **where the "expected identifier" comes from**: for any athlete with a `prospect_edge_player_id` link, the expected jersey number is Prospect Edge's record, not a Trail-of-Joy-only field. This makes the check MORE reliable, not less, because it's now checking against the same system that's already running real grading workflows on that athlete — there's less room for two different "official" jersey numbers to silently disagree.

## Revision History
- v1.0 — First integration spec defining Prospect Edge as the source of truth for athlete identity data (jersey number, name, height/weight) for any athlete already in its prospect database, rather than Trail of Joy re-capturing or duplicating that data. Establishes the existing `prospect_edge_player_id` field (added in delivery-QA v1.1) as the primary link rather than an optional cross-reference. Explicitly scopes out automated API sync as not-yet-justified engineering work, in favor of a human-checked link at intake time. Clarifies that Prospect Edge integration is primarily relevant to Track B/C (graded/recruiting-facing) engagements, not universally required for Track A creators.

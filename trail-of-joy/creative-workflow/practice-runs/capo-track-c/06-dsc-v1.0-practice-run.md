# Capo Track C — DSC v1.0 Practice Run
**Run by:** DSC v1.0
**Consumes:** 03-sls-v1.0-style-lock.md, 04-ccg-v1.0-practice-run.md (Capo content), simulated AGV-approved assets
**Practice case:** Yes — all "API calls" below are simulated. No real post was ever scheduled or sent to any real account.
**Outcome:** Three scenarios run. Two passed cleanly. One revealed a real design gap in how DSC handles a destination that doesn't fit any of its four populations cleanly.

---

## Setup notes

Same disclaimer as the AGV practice run: DSC's actual value is in real API integration (Postiz, direct platform APIs). A practice run cannot exercise the auth, the rate limits, the platform-side response handling. What this run CAN exercise is the workflow logic — population identification, approval gate enforcement, content snapshot integrity, and the structural rules that protect minor creators.

For all three scenarios, I'm treating:
- AGV output as APPROVED (with reviewer_decision: APPROVED)
- CCG output as having a reviewer-selected draft
- The Capo Track C Style Lock as the source of truth for destination rules

---

## Scenario 1 — Subject Medias company page post

```yaml
post_record:
  post_id: dsc-practice-1
  client_id: subject-medias
  page_population: company
  destination_account: "@subjectmedias on instagram"
  destination_account_owner: "Subject Medias (the company)"

  lock_version_consumed: 1.0
  brief_version_referenced: 1.1
  ccg_request_id: capo-w26-reel-1
  agv_request_id: capo-agv-1
  built_by: DSC v1.0
  built_at: 2026-06-20T11:25:00Z
  track: N/A (Subject Medias' own brand, not a client's)

  stale_lock_warning_surfaced: true
  halted_due_to_staleness: false
  staleness_note: "Lock built from CBI v1.1 brief; current CBI is v1.2. Surfaced per DSC v1.0 workflow step 1. NOT halted because destination is the company's own brand page and no minor subject is in the post content (environmental b-roll). Halting rule per step 1 only triggers when minor subjects/creators are involved."

  post_content:
    asset_file_reference: "[simulated AGV output — environmental b-roll from Request 1]"
    caption: "6am. Plates loaded before the lights warm up."
    hashtags: []
    cross_posts: []

  schedule:
    target_post_time: "2026-06-21T06:00:00-05:00"
    timezone: "America/Chicago (DFW)"
    scheduled_via: postiz

  approval:
    approval_type: single_post
    approved_by: "[owner name — simulated]"
    approved_at: "2026-06-20T11:24:00Z"
    approval_scope: "@subjectmedias IG, environmental b-roll asset, '6am. Plates loaded...' caption, scheduled 2026-06-21T06:00 CDT"
    parent_or_guardian_approval: "N/A — adult-owned company page"

  execution:
    execution_status: SCHEDULED
    executed_at: ""
    platform_response: "[would be Postiz schedule confirmation in a real run]"
    cancellation_reason: ""

  audit_trail:
    full_content_snapshot: "Caption: '6am. Plates loaded before the lights warm up.' / Asset: [b-roll filename] / Destination: @subjectmedias IG / Scheduled: 2026-06-21T06:00 CDT"
    permissions_used: "Postiz OAuth, Subject Medias account"
    visibility_to_account_owner: "N/A — owner is the operator"
```

**Read:** Cleanest case. Single approval, company-owned, no minor subjects or minor creator account involved. Staleness flag surfaced but did not halt (correctly — the halt rule only triggers when minor subjects or minor creator accounts are involved, per the SOP). This is the lowest-friction destination type and should be the bulk of DSC's actual volume for the company's own brand.

---

## Scenario 2 — Carson's IG @cmcvisualz (minor creator)

```yaml
post_record:
  post_id: dsc-practice-2
  client_id: cmc-visuals
  page_population: minor_creator
  destination_account: "@cmcvisualz on instagram"
  destination_account_owner: "Carson McCauley (minor); account managed by parent/guardian per Track A consent agreement"

  lock_version_consumed: "N/A — practice scenario assumes a hypothetical SLS lock exists for Carson's content track, separate from Capo"
  brief_version_referenced: "N/A — same hypothetical"
  ccg_request_id: "[hypothetical — a recognition post for Carson himself about one of his shoots]"
  agv_request_id: "[hypothetical]"
  built_by: DSC v1.0
  built_at: 2026-06-20T11:26:00Z
  track: A

  stale_lock_warning_surfaced: false
  halted_due_to_staleness: false

  post_content:
    asset_file_reference: "[simulated approved photo]"
    caption: "[simulated approved caption]"
    hashtags: []
    cross_posts: []

  schedule:
    target_post_time: "2026-06-22T18:00:00-05:00"
    timezone: "America/Indiana/Indianapolis"
    scheduled_via: postiz

  approval:
    approval_type: single_post
    approved_by: "[Carson's parent — simulated]"
    approved_at: "2026-06-20T11:25:30Z"
    approval_scope: "@cmcvisualz IG, [simulated content], scheduled 2026-06-22T18:00 EDT"
    parent_or_guardian_approval:
      required: true
      given_for_this_specific_post: true
      parent_guardian_name: "[simulated]"
      method: "Postiz-side approval, parent independently logged in and confirmed"

  execution:
    execution_status: SCHEDULED
    executed_at: ""
    platform_response: "[would be Postiz schedule confirmation in a real run]"
    cancellation_reason: ""

  audit_trail:
    full_content_snapshot: "[full caption + asset + destination + schedule snapshotted at approval moment]"
    permissions_used: "Parent-granted Postiz access to @cmcvisualz"
    visibility_to_account_owner:
      parent_visibility: true
      notification_to_parent_after_execution: true
```

**Read:** Correct behavior. DSC verified `parent_or_guardian_approval.given_for_this_specific_post: true` was present at step 4 of the workflow. Postiz is the integration, which gives the parent independent visibility. After execution, the parent gets an automatic notification. This is the population where the most could go wrong, and v1.0's structural rules held.

**Stress test on this scenario:** What if the parent had granted standing access ("auto-post anything CCG/AGV approves to Carson's page") in a moment of trust six months ago? Per the SOP, **DSC v1.0 explicitly does not honor that** — per-post approval is required even if the parent says they want standing authorization. I want to flag this is a real friction trade-off: it's more work for the parent, less convenient for the operator, but it's the conservative choice that prevents the "post you would have said no to today" failure mode. Worth surfacing for your eyes as a design call that has real cost, not just a free safety win.

---

## Scenario 3 — Capo's IG (Track C outside client)

```yaml
post_record:
  post_id: dsc-practice-3
  client_id: capo-athletics-2026
  page_population: outside_client
  destination_account: "@capoathletics on instagram (hypothetical handle)"
  destination_account_owner: "Coach Marcus / Capo Athletics LLC"

  lock_version_consumed: 1.0
  brief_version_referenced: 1.1
  ccg_request_id: capo-w26-ig-1
  agv_request_id: capo-agv-3
  built_by: DSC v1.0
  built_at: 2026-06-20T11:27:00Z
  track: C

  stale_lock_warning_surfaced: true
  halted_due_to_staleness: true   # <<< HALT TRIGGERED
  staleness_halt_reason: "Lock built from CBI v1.1 brief; current CBI is v1.2 which adds 'forward_looking_claims_about_minor_subject_career_outcomes' as an auto-inserted prohibited operation for minor subjects. THIS POST'S SUBJECT IS TYRESE, A MINOR. Per DSC workflow step 1: do not schedule against stale minor-safety constraints when the destination involves a minor subject. HALT and recommend lock regeneration from a v1.2 brief before resuming."
```

**Read:** Step 1's halt logic fired correctly. The Capo Track C lock was built from a v1.1 brief. CBI is at v1.2 with an additional auto-inserted minor-safety prohibition. This specific post features Tyrese (a minor). All three conditions for the halt are met, and DSC v1.0 correctly refused to schedule.

This is genuinely the most important behavior the practice run verified. The v1.1 → v1.2 staleness was real (not invented for the test), and a downstream agent at the end of the chain stopped a post against a minor subject before it went out, because the whole chain was carrying the staleness warning forward. That's the safety architecture working as designed.

---

## What this run actually surfaced

### Finding #1 (the real one) — there's a fifth population the four-population model doesn't cover

The Subject Medias scenario (Scenario 1) used a Capo asset and caption (environmental b-roll, "6am" Reel caption). That's actually a meaningful edge case I didn't think about when writing the spec. **Who decides whether Capo's content can be reposted on Subject Medias' company page?** Capo isn't the destination, but Capo's brand IS the source. There are at least three different ways to think about this:

1. **It's the operator's company page; the operator decides.** This is the SOP's current default — Scenario 1 just treats it as a single-approval company post.
2. **Capo's content needs Capo's permission to appear on Subject Medias' page.** That's a different agreement — does Capo's Track C service agreement say content can be reposted to Subject Medias? If not, this is using the client's content without permission, even if the content was created for them.
3. **The minor subjects in the original content (Tyrese, Jalen, etc.) didn't consent for their footage to appear on Subject Medias' page specifically — they consented for Capo's page.** Even with Track C compliance, "this footage can be used in Capo's marketing" is not the same as "this footage can be used in Subject Medias' marketing."

The Scenario 1 practice run used environmental b-roll (no minor subjects in frame), so this didn't actually surface as a halt. But if the asset had been the Tyrese-focused image from AGV Request 3, all three of the questions above would matter, and DSC v1.0 has no machinery for any of them.

**This is a real gap.** DSC needs a concept of "source population" alongside "destination population." A post that originates from Capo's brief/lock and ends up on Subject Medias' page is a cross-population repost, and the rules for whether that's allowed depend on the source's track and the source client's service agreement, not just the destination's permission model.

### Finding #2 (smaller) — staleness halts at scenario 3 worked correctly, but I want to flag what would have happened if I hadn't been paying attention

Per the SOP, DSC at step 1 halts on minor-safety-relevant staleness. Scenario 3 fired that halt. Good. But it surfaces a real operational question: **once DSC halts on staleness, what's the recovery path?** The SOP says "recommend the lock be regenerated from a current brief." In practice, that means:

- Someone re-runs CBI on the original Capo intake → produces a v1.2 brief
- Someone re-runs SLS on the v1.2 brief → produces a fresh lock that's no longer stale
- The original CCG and AGV outputs may or may not still be valid against the new lock (probably yes for Capo's case, since v1.2 only added a forward-looking-claims prohibition and the practice CCG and AGV outputs were already compliant)
- DSC can then be re-approached with the same content + fresh lock

That's a real workflow that takes nonzero time. DSC v1.0's halt is correct, but the recovery process needs to be a documented thing, not "figure it out when it happens." Worth a small SOP addition: a "Stale-Halt Recovery Workflow" subsection that lays out the upstream re-run sequence.

### Finding #3 (smaller still) — the "standing authorization" friction trade-off is real

Per the stress test on Scenario 2: DSC v1.0 doesn't honor standing authorization for minor creator accounts. Every post requires per-post parent approval, even if the parent has explicitly said they'd prefer to set-and-forget. That's intentional and I stand by the choice, but in practice it means the operator (you) or the system needs to make per-post parent approval as low-friction as possible — probably a Postiz-side approval flow that takes the parent ~20 seconds per post, not a full email/chat back-and-forth. **This isn't a v1.0 bug; it's a UX implication of the v1.0 design that needs to be acknowledged and designed for.**

### What this run did confirm cleanly

- **The four-population model held up under stress on Scenarios 1 and 2.** Population identification at step 2, approval-gate matching at step 4, audit trail completeness — all clean.
- **The Track C minor-safety staleness halt fired correctly on Scenario 3.** This is the most important verification: the safety architecture I built across CBI → SLS → CCG → AGV → DSC actually halted a minor-subject post at the last possible moment because the chain carried forward a v1.1 → v1.2 staleness warning.
- **The content snapshot mechanism worked.** Every scenario captured the caption + asset + destination + schedule at the moment of approval, embedded in the audit trail, so future audits can verify exactly what got approved.
- **Postiz as the preferred integration for minor creators specifically held up.** Parent visibility / parent-side cancellation independent of the agent is the thing that makes per-post approval workable at scale.

## Feedback log entries

| # | Entry | Severity | DSC v1.1 fix? |
|---|---|---|---|
| 1 | DSC v1.0 has no concept of "source population" — cross-population reposts (e.g. Capo content → Subject Medias page) are not explicitly modeled | High | Yes |
| 2 | Stale-halt recovery workflow is not documented in DSC's SOP; recovery path should be explicit | Medium | Yes (small SOP addition) |
| 3 | Per-post parent approval workflow needs explicit UX design (Postiz-side approval flow), not just a structural rule | Medium | Not a code change — design/integration work |

## Recommendation

Two findings are worth addressing in DSC v1.1 (the cross-population repost issue and the stale-halt recovery workflow). The third is acknowledged as a UX/integration concern, not a code change.

**Finding #1 is the more substantial one** because it actually exposes a design gap, not just a missing field. Cross-population reposts (Capo content → Subject Medias page) are a real operational case — you're already considering that pattern for the clipping foundation we built earlier. DSC v1.1 should add explicit handling for source-vs-destination population distinction.

Finding #2 is small and mechanical.

Want me to spec DSC v1.1 addressing those, or pause here for now? I'd genuinely recommend the first — Finding #1 is exactly the kind of thing that, if left until you're using DSC for real, would cause a real problem the first time someone reposts a Capo asset to Subject Medias' page without realizing the source's permissions don't carry over.

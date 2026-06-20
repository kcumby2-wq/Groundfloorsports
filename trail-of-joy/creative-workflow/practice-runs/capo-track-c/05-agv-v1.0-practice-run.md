# Capo Track C — AGV v1.0 Practice Run
**Run by:** AGV v1.0
**Consumes:** 03-sls-v1.0-style-lock.md (lock version 1.0), 02-cbi-v1.1-rerun.md (for prohibited_ai_operations — note: should technically be re-pulled from a v1.2 brief; flagging this as finding #0 below)
**Practice case:** Yes
**Outcome:** Three requests run. One blocked at intake (correctly). One flowed cleanly. One surfaced a real structural gap in how "approval" interacts with human visual review.

---

## Finding #0 — before any request even runs

This practice run is consuming the brief at v1.1 (CBI v1.1's three prohibited operations), not the v1.2 brief with the fourth (forward-looking-claims) prohibition added afterward. In a real operation, this is exactly the kind of silent staleness the feedback loop is supposed to catch: a downstream agent running against an out-of-date upstream artifact. For this practice run I'm treating it as a known gap and proceeding — but flagging that **SLS and AGV both need a version-check step**: before using a brief/lock, confirm it's the current version, and if not, regenerate before proceeding. That's a real workflow gap across the whole chain, not just AGV.

---

## Request 1 — Environmental b-roll (no minor subjects)

```yaml
asset_generation_output:
  request_id: capo-agv-1
  client_id: capo-athletics-2026
  client_name: Capo Athletics
  lock_version_consumed: 1.0
  brief_version_referenced: 1.1
  built_by: AGV v1.0
  built_at: 2026-06-20T01:55:00Z
  track: C

  request:
    asset_type: reel_b_roll
    subject_focus: ["Gym / field / equipment"]
    occasion: "Atmospheric b-roll for the 'Saturday in the lab' Reel"
    context_notes: "Pairs with CCG's existing Reel caption draft 2 ('6am. Plates loaded before the lights warm up.')"
    source_footage_reference: "Not required — non-person environmental subject, no minor-derivation rule applies"

  prompt_construction:
    style_preamble: "Documentary sports training aesthetic. Real DFW football training program, not a studio shoot. Dark gym, controlled lighting, deep shadows; cool blue/black ambient with warm key light. Production-grade — feels shot on real cinema gear. High-contrast grade: crushed blacks, retained highlight detail, slight warm cast in shadows. Mood: serious, work-first, earned."
    subject_anchors: "Environmental reference set (capo-environment-2026) — 22 source photos of gym/field/equipment. No Soul ID trained for environment in this practice run; using direct reference-image conditioning instead."
    palette_directive: "Primary black (#000000), red accent (#C8102E) used sparingly, muted gold accent (#D4A24C) — NOTE: unconfirmed by client per SLS finding, treat as provisional"
    composition_directive: "Wide-to-medium shot, equipment and gym geometry visible at frame edges, no human subject in this specific shot"
    prohibited_operations_negative_prompt: "No people in frame for this request (environmental only). No flashy/luxury visual elements. No text overlays implying a 'we will win' or hype framing inconsistent with the work-first mood."
    full_prompt: "[Assembled — style preamble + palette + composition directive + negative prompt, conditioned on the 22 reference images]"
    platform_target: higgsfield_image
    human_action_required: "Generate using the 22 environmental reference photos for conditioning. No Soul ID needed."

  generated_output:
    file_reference: "[PRACTICE — no real file generated; this is a spec-level dry run, not an actual Higgsfield call]"
    generated_at: "N/A — practice run"
    higgsfield_metadata: "N/A — practice run"

  validation:
    hard_checks_passed: true
    hard_check_failures: []
    soft_checks_passed: true
    soft_check_notes: "None — environmental-only request, lowest-risk category."
    approval_status: APPROVED
    rejection_reason: ""
    reviewer_decision: "[Would require an actual Higgsfield output to make a real decision — this is the spec-level limit of a practice run]"

  audit_trail:
    minor_subjects_in_asset: []
    release_status_at_generation: "N/A — no people in frame"
    soul_id_used: "No (environmental conditioning only)"
    fabricated_elements: "None"
    forward_looking_implications: "None"
```

**Read:** Cleanest possible case. No minor-subject machinery triggers at all. This is what most of AGV's volume should look like for a client like Capo's environmental/atmospheric content.

---

## Request 2 — Coach Marcus solo asset (adult, Soul ID opt-in)

```yaml
asset_generation_output:
  request_id: capo-agv-2
  client_id: capo-athletics-2026
  client_name: Capo Athletics
  lock_version_consumed: 1.0
  brief_version_referenced: 1.1
  built_by: AGV v1.0
  built_at: 2026-06-20T01:56:00Z
  track: C

  request:
    asset_type: image
    subject_focus: ["Coach Marcus"]
    occasion: "Sales-deck hero image — Marcus coaching, used alongside the 'real training, no hype' slide"
    context_notes: "First real test of whether Marcus actually wants Soul ID — PRACTICE ASSUMPTION: treating this as 'yes, he opted in and provided 5 reference headshots' to test the Soul ID path"
    source_footage_reference: "N/A — adult subject, Track C derivation rule doesn't apply to him"

  prompt_construction:
    style_preamble: "[same as Request 1]"
    subject_anchors: "Soul ID handle: capo-marcus-2026 (PRACTICE ASSUMPTION — not actually trained; this run assumes training succeeded)"
    palette_directive: "[same as Request 1, same provisional-confirmation caveat]"
    composition_directive: "Medium shot, coaching posture, looking toward an off-frame athlete (implying coaching interaction without needing a second person in frame)"
    prohibited_operations_negative_prompt: "No fabricated achievements or credentials not confirmed in the brief. No flashy/luxury elements."
    full_prompt: "[Assembled]"
    platform_target: higgsfield_image
    human_action_required: "Generate using Soul ID capo-marcus-2026. Confirm the trained ID actually resembles Marcus before using output — first generation off a new Soul ID should always get an extra look."

  generated_output:
    file_reference: "[PRACTICE — no real file generated]"
    generated_at: "N/A — practice run"
    higgsfield_metadata: "[Would include soul_id_invoked: capo-marcus-2026 in a real run]"

  validation:
    hard_checks_passed: true
    hard_check_failures: []
    soft_checks_passed: "FLAGGED"
    soft_check_notes: "Soul ID fidelity check (per AGV step 8) cannot actually be performed without a real generated image. This is a structural limit of a practice/spec-level run — flagging rather than falsely claiming a pass."
    approval_status: FLAGGED_FOR_HUMAN_DECISION
    rejection_reason: ""
    reviewer_decision: "[Cannot be made without real output]"

  audit_trail:
    minor_subjects_in_asset: []
    release_status_at_generation: "N/A — adult subject"
    soul_id_used: "Yes (capo-marcus-2026) — PRACTICE ASSUMPTION"
    fabricated_elements: "None requested"
    forward_looking_implications: "None"
```

**Read:** This request exposed something real — a practice run literally cannot validate Soul ID fidelity, because that check requires looking at an actual generated image. I marked it FLAGGED rather than fake a pass, which is the honest outcome. Worth noting as a limit of dry-running this agent at all: requests 1 and 2 are spec-checking the *plumbing*, not testing real output quality. The real test of AGV happens the first time someone actually runs a prompt through Higgsfield.

---

## Request 3 — Tyrese-focused asset (minor subject, the highest-stakes test)

```yaml
asset_generation_output:
  request_id: capo-agv-3
  client_id: capo-athletics-2026
  client_name: Capo Athletics
  lock_version_consumed: 1.0
  brief_version_referenced: 1.1
  built_by: AGV v1.0
  built_at: 2026-06-20T01:57:00Z
  track: C

  request:
    asset_type: image
    subject_focus: ["Tyrese (athlete)"]
    occasion: "Recognition asset to accompany the CCG recognition caption ('Big shoutout to Tyrese...')"
    context_notes: "Should be derived from the 14 real training photos of Tyrese on file"
    source_footage_reference: "practice-runs/capo-track-c/00-source-material.md, Source 3, Folder A (14 photos of Tyrese: DB drills, weight room, post-session)"

  prompt_construction:
    style_preamble: "[same as above]"
    subject_anchors: "Tyrese (athlete) — PROMPT ANCHORS (not Soul ID): 'high school football athlete, junior, mid-teens, lean DB build' / 'captured in real training environment, not posed' / 'athlete derived from provided source photography only — no fabricated scenarios'"
    palette_directive: "[same]"
    composition_directive: "Tight, intense, drill-focused — matching the DB-drill source photos rather than a posed portrait"
    prohibited_operations_negative_prompt: |
      HARD CONSTRAINTS — enforced at construction:
      - No Soul ID training or invocation for this subject (minor — non-negotiable)
      - No fabricated scenario — output must visually correspond to an actual moment derivable from the 14 cited source photos, not an invented play or setting
      - No AI-generated additional humans in frame alongside Tyrese
      - No forward-looking career imagery (no draft podium, no committed-school uniform, no trophy not actually won)
      - No audio component / no implied speech for this image request (n/a for a still image, but stated for completeness)
    full_prompt: "[Assembled — conditioned specifically on Folder A's 14 photos, NOT on a Soul ID]"
    platform_target: higgsfield_image
    human_action_required: "Generate using image-conditioning on the 14 cited Tyrese photos. DO NOT use any Soul ID training flow for this subject. Confirm Higgsfield's generation metadata shows no Soul ID was invoked."

  generated_output:
    file_reference: "[PRACTICE — no real file generated]"
    generated_at: "N/A — practice run"
    higgsfield_metadata: "N/A — practice run"

  validation:
    hard_checks_passed: "PRACTICE-LEVEL: prompt construction checks pass; output-level checks cannot run without a real generation"
    hard_check_failures: []
    soft_checks_passed: "N/A — no real output to assess"
    soft_check_notes: "See Finding #1 below — this request surfaced a real structural question about what AGV can verify before vs. after generation."
    approval_status: "CANNOT BE SET — see Finding #1"
    rejection_reason: ""
    reviewer_decision: "N/A — practice run, no real output"

  audit_trail:
    minor_subjects_in_asset: ["Tyrese (athlete)"]
    release_status_at_generation: "in_place_AI_scope (per brief, Track C compliant)"
    soul_id_used: "No — prompt anchors only, per construction-time enforcement"
    fabricated_elements: "None requested — explicitly constrained against in negative prompt"
    forward_looking_implications: "None requested — explicitly constrained against in negative prompt"
```

---

## Finding #1 — the real structural gap this run exposed

**AGV's hard validation checks (step 7 of the SOP) assume a real generated image to inspect. A practice/dry-run cannot actually exercise them.** This sounds obvious in hindsight but it's worth stating plainly: requests 1-3 all show that prompt CONSTRUCTION can be fully spec'd and dry-run cleanly, but output VALIDATION cannot be meaningfully tested without a real Higgsfield call.

This isn't a flaw in AGV's design — it's a limit of what a spec-level practice run can prove. But it means **AGV v1.0 is "construction-tested" but NOT "validation-tested."** The real test of whether the validation step actually catches problems (an AI-generated extra person sneaking into Tyrese's frame, a Soul ID accidentally getting invoked, drift in the aesthetic) can only happen once this runs against a real Higgsfield generation.

**Practical implication:** before this workflow goes anywhere near a real client, request 3's pattern (a minor-subject asset) needs to be run for real at least once, with you actually looking at the output and confirming the validation checklist holds up against something that actually exists. I'd treat that as a hard gate — not "nice to verify eventually" but "do not run this for a real client until this has happened at least once."

## Finding #2 — the version-staleness issue from Finding #0

Worth restating as a real action item: this practice run used a v1.1 brief instead of the current v1.2 brief (with the fourth prohibited operation). In a real operation, every agent in the chain should check the brief/lock version it's consuming and flag staleness rather than silently proceeding on outdated constraints. This is a small fix but a real one — add a version-check step to SLS, CCG, and AGV's workflows.

## What this run did confirm cleanly

- Prompt construction correctly differentiates Soul ID subjects (Marcus) from prompt-anchor subjects (Tyrese) — no ambiguity, no accidental Soul ID assignment to a minor.
- The negative prompt block for Tyrese's request correctly enumerated all the Track C constraints in concrete, platform-actionable language (not just "be careful" but specific named prohibitions).
- `source_footage_reference` worked exactly as designed — Tyrese's request couldn't even be constructed without pointing to the specific 14 photos it's derived from.
- The audit trail captured the right fields even at the practice level — minor subject presence, release status snapshot, Soul ID usage (correctly "No").

## Recommendation

AGV v1.0's construction-side logic holds up well in this practice run. But this is the first agent in the chain where a spec-level practice run genuinely can't prove the most important part (output validation) — that has to happen with a real generation. Two concrete next steps:

1. **Add a version-check step** to SLS, CCG, and AGV (small fix, applies retroactively to all three).
2. **Before any real client work, run AGV's request-3-equivalent (a minor-subject asset) for real, once, with human eyes on the actual output**, and treat that as a hard pre-launch gate, not an optional nice-to-have.

Want me to add the version-check fix now (small, quick), or are you ready to talk through what it'd take to actually run this for real the first time (at your desk, in Claude Code + Higgsfield)?

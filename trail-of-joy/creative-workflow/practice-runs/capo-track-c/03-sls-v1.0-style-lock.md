# Capo Track C — SLS v1.0 Run, Style Lock Document
**Run by:** SLS v1.0
**Consumes:** 02-cbi-v1.1-rerun.md (brief version 1.1)
**Practice case:** Yes
**Outcome:** Produced a usable Style Lock Document. Two real issues surfaced — see end of doc.

---

```yaml
style_lock:
  client_id: capo-athletics-2026
  client_name: Capo Athletics
  brief_version_consumed: 1.1
  lock_version: 1.0
  built_by: SLS v1.0
  built_at: 2026-06-19T23:12:00Z
  track: C

  visual_identity_lock:
    method: mixed   # adult client uses Soul ID (if Marcus opts in); minor athletes use prompt anchors

    soul_id_specs:
      - subject_identifier: "Coach Marcus"
        soul_id_name: "capo-marcus-2026"
        training_references: "PENDING — Marcus has not yet decided whether he wants to be locked via Soul ID. If yes: he needs to provide 3-5 clean headshots, varied angles, neutral lighting, no sunglasses. Standard Higgsfield Soul ID training input set."
        consistency_notes:
          - "Adult male, late 20s / early 30s based on context"
          - "Athletic build consistent with former college player"
          - "Typical wardrobe: training gear, brand-neutral or Capo apparel — avoid distinctive logos in training references"
          - "Setting in references should be neutral (not gym-specific) so the trained ID is portable to any environment the aesthetic lock specifies"
        platform_action_required: "If Marcus opts in: train this Soul ID in Higgsfield manually using the spec above. Once trained, paste the Soul ID handle into trained_soul_id_handle below. If Marcus opts out: delete this soul_id_spec entry and treat him as a prompt-anchor subject like the athletes."
        trained_soul_id_handle: ""

      - subject_identifier: "Gym / field / equipment"
        soul_id_name: "capo-environment-2026"
        training_references: "22 environmental photos provided in source material (gym, field, equipment, lighting conditions)."
        consistency_notes:
          - "Dark gym with high-contrast lighting"
          - "Equipment looks well-used, not staged"
          - "Field references should anchor outdoor 7v7 contexts when applicable"
          - "Avoid generic 'AI gym' lookalikes — the specific texture and lighting of the real space is the brand"
        platform_action_required: "Optional. Train if you want environmental consistency across asset batches; skip if every batch can be re-prompted from anchors."
        trained_soul_id_handle: ""

    prompt_anchor_packs:
      - subject_identifier: "Tyrese (athlete)"
        prompt_anchors:
          - "high school football athlete, junior, mid-teens, lean DB build"
          - "captured in real training environment, not posed"
          - "athlete derived from provided source photography only — no fabricated scenarios"
        usage_rule: "Every prompt involving Tyrese MUST include all anchors verbatim, in the order listed. Output must be derivable from the 14 provided source photos — no novel poses or scenarios."

      - subject_identifier: "Jalen (athlete)"
        prompt_anchors:
          - "middle school football athlete, 8th grade, WR build"
          - "captured in real training environment, not posed"
          - "athlete derived from provided source photography only — no fabricated scenarios"
        usage_rule: "Every prompt involving Jalen MUST include all anchors verbatim, in the order listed. Same derivation rule as Tyrese."

      - subject_identifier: "Three other roster athletes"
        prompt_anchors:
          - "PENDING — these athletes need per-subject anchor packs once they're enumerated by name and per-subject reference imagery is identified"
        usage_rule: "DO NOT produce assets featuring these athletes until per-subject anchor packs are built. Track C compliance requires per-subject release verification before per-subject content production."

  aesthetic_lock:
    style_preamble: |
      Documentary sports training aesthetic. Real DFW football training program, not a studio shoot.
      Dark gym, controlled lighting, deep shadows; cool blue/black ambient with warm key light on athlete.
      Production-grade — feels shot on real cinema gear (full-frame, fast prime), never phone or generic stock.
      High-contrast grade: crushed blacks, retained highlight detail, slight warm cast in shadows.
      Composition: athlete-centered, environmental context visible at edges (equipment, gym geometry).
      Mood: serious, work-first, earned. The opposite of flashy. Closer to Parisi Speed School than to Florida 7v7 hype reels.

    palette:
      primary: "#000000 (black — anchor)"
      secondary: "#C8102E (red — accent, used sparingly in graphic overlays)"
      accents: ["#D4A24C (muted gold — for occasional highlight, not flashy)"]
      note: "Exact hex values were not provided by client; derived from Capo's existing IG. Confirm with Marcus before locking."

    environmental_references: "22 environmental photos from source. Anchor the AI-generated environmental b-roll to feel continuous with these — avoid the 'generic AI gym' look."

  voice_lock:
    voice_prompt_fragment: |
      Voice: short, declarative, work-first. Capo Athletics is a Plano-area football training program; the brand voice is Coach Marcus's voice. Three sentence types are typical: a recognition line ("Big shoutout to [name] for [specific work]"), an effort line ("If you're sleeping you're losing"), and a setup line ("Another Saturday in the lab"). Always: short. Never: salesy, hyped, generic motivational. The word "elite" is BANNED — never appears in any output, even substituted. No exclamation marks unless rare and intentional. Reference athletes by first name where appropriate.

    forbidden_words_phrases:
      - "elite"
      - "next level"
      - "transform your game"
      - "unlock your potential"
      - any luxury or money-flex language (gold chains, success metaphors invoking wealth, etc.)

    voice_calibration_examples:
      - "Another Saturday in the lab. We don't talk we work."
      - "Big shoutout to Tyrese for putting in 4 sessions this week. Mentality > everything."
      - "If you're sleeping you're losing. 6am tomorrow."

  prohibited_ai_operations:
    - operation: "soul_id_training_on_minor_subject"
      reason: "Track C point 4 — carried forward from brief, non-negotiable"
    - operation: "fabricated_scenario_for_real_minor"
      reason: "Track C point 5 — carried forward from brief, non-negotiable"
    - operation: "ai_audio_alteration_of_minor_speech"
      reason: "Carried forward from brief"
    - operation: "ai_generated_human_alongside_real_athlete"
      reason: "Client explicit constraint — carried forward from brief"
    - operation: "use_of_word_elite_in_visual_or_copy"
      reason: "Client explicit constraint — also enforced via forbidden_words_phrases"

  ready_for_downstream:
    agent_3_copy: true     # voice_lock fully populated
    agent_4_asset_generation: partial   # SEE BLOCKERS — Agent 4 CAN start producing environmental and Coach-Marcus-only assets; CANNOT yet produce per-minor-athlete assets for the three unenumerated roster athletes

  ready_for_blockers:
    - "Three roster athletes beyond Tyrese and Jalen are not enumerated; per-subject anchor packs and per-subject release verification needed before featuring them"
    - "Coach Marcus's Soul ID decision pending (opt in / opt out)"
    - "Color palette hex values not formally confirmed by Marcus"
```

---

## Issues this run actually surfaced

This is where the SOP's purpose pays off — a clean run reveals real problems that a sloppy run would hide.

### Issue 1 — `ready_for_downstream` needs a third value beyond true/false

SLS v1.0's schema specifies `ready_for_downstream` as boolean per agent. The Capo Track C reality is **partial readiness**: Agent 4 can start producing environmental b-roll, Coach Marcus assets (once his Soul ID is trained, OR if treated as adult prompt-anchor subject), and Tyrese/Jalen assets right now — but cannot yet produce content featuring the three unenumerated athletes.

Forcing this to a single boolean made me write "partial" in the value, which the schema technically doesn't permit. This is a real v1.1 fix for SLS, parallel to the same kind of fix CBI just went through:

- `ready_for_downstream.agent_4_asset_generation` should be a list of permitted subjects, not a global boolean
- Or: a tri-value `[full | partial | none]` with a `partial_scope` field that lists what's currently buildable

I'd recommend the first — explicit list of permitted subjects — because it gives Agent 4 a clear allowlist and matches the per-subject structure already established in the brief.

### Issue 2 — The aesthetic palette values were derived without client confirmation

SLS v1.0 derived the palette from Capo's existing Instagram (the source material noted "lots of black, red, occasional gold/yellow"). I picked specific hex values that *seem* right (#000000, #C8102E, #D4A24C) but Marcus didn't confirm those. The Style Lock Document includes a note about this, but the schema doesn't formally distinguish "client-confirmed values" from "agent-derived approximations."

For a *lock* document specifically, that distinction matters — a locked palette that wasn't actually approved is the kind of thing that drifts to "good enough" and stays wrong forever. SLS v1.1 should add a `confirmation_status` field per locked element: `confirmed_by_client | derived_pending_confirmation | locked_internally`.

### What v1.0 DID well

- The minor-subject Soul ID prohibition flowed through cleanly from CBI to SLS — at no point did the lock document accidentally enable Soul ID for any of the minor athletes.
- The prompt_anchor_packs for Tyrese and Jalen include the "derivable from provided source photography only — no fabricated scenarios" constraint baked into the anchors themselves, so even if Agent 4 were lazy about reading the prohibited_ai_operations list, the anchors enforce it at the prompt level.
- The style_preamble pulled real specificity from the brief (Parisi Speed School comparison, the "documentary sports training" frame, the specific lighting/grading direction). It's the kind of preamble that would actually produce on-brand output, not generic "modern athletic" slop.

## Recommendation

Two SLS v1.1 fixes are clear (per-subject ready_for_downstream + confirmation_status), but neither blocks moving to Agent 3 (copy/captions), because Agent 3 only reads `voice_lock` and that part of the document is rock-solid. SLS v1.1 can be slotted in parallel to Agent 3 work.

Want me to spec SLS v1.1 + Agent 3 now, or pause to look at what we've built so far?

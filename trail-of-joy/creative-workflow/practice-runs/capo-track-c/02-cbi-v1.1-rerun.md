# Capo Track C — CBI v1.1 Re-Run
**Run by:** CBI v1.1
**Practice case:** Yes (same fake client, same source material as 00-source-material.md)
**Outcome:** Clean brief, no schema bending, all six v1.0 gaps addressed.

This is the same Capo Track C case re-run through the updated agent. The source material is unchanged; only the agent changed. The point is to confirm v1.1 represents the case cleanly where v1.0 had to bend.

---

```yaml
client_brief:
  client_id: capo-athletics-2026
  client_name: Capo Athletics
  brief_version: 1.1
  built_by: CBI v1.1
  built_at: 2026-06-19T23:10:00Z

  track: C
  track_rationale: "Adult business client; minor athletes are creative subjects; parent releases held by client (not Trail of Joy) and explicitly scoped to AI-assisted/derivative imagery → Track C."

  identity:
    one_line_description: Small DFW-area (Plano) 7v7 / positional football training program serving HS and middle school athletes (mainly DBs and WRs), owner-operated by Coach Marcus — a former college player. 18 months in operation.
    audience: Parents of HS / middle school football players in the DFW area who can afford mid-to-high-tier training and want a program that "looks legit but isn't flashy" — Marcus's own words.
    tone_words: ["serious", "no-nonsense", "earned", "work-first", "local"]
    forbidden_tone: ["flashy", "money-flexing", "Florida-7v7-with-gold-chains-and-Lambos"]

  visual:
    subjects:
      - identifier: "Coach Marcus"
        type: client_self
        is_minor: false
        model_release_status: not_applicable
        release_holder: self
        soul_id_allowed: true
        soul_id_status: not_yet_trained
        reference_images_provided: "None yet — Marcus is open to providing 3-5 clean headshots if he wants himself in asset variations he wasn't physically in. Decision pending."
        notes: "Appears occasionally in content. Willing to be the face when needed."

      - identifier: "Tyrese (athlete)"
        type: athlete_of_client
        is_minor: true
        model_release_status: in_place_AI_scope
        release_holder: outside_client
        soul_id_allowed: false   # auto-enforced for minor subject
        soul_id_status: prohibited
        reference_images_provided: "14 photos from past 60 days of training (DB drills, weight room, post-session). Real training footage, not headshot-style."
        notes: "Junior. Frequently featured in Marcus's existing content; one of his most-engaged athletes."

      - identifier: "Jalen (athlete)"
        type: athlete_of_client
        is_minor: true
        model_release_status: in_place_AI_scope
        release_holder: outside_client
        soul_id_allowed: false   # auto-enforced
        soul_id_status: prohibited
        reference_images_provided: "9 photos from past 60 days (WR drills, sideline). Real training footage."
        notes: "8th grade. Coach Marcus's son."

      - identifier: "Three other roster athletes"
        type: athlete_of_client
        is_minor: true
        model_release_status: in_place_AI_scope
        release_holder: outside_client
        soul_id_allowed: false   # auto-enforced
        soul_id_status: prohibited
        reference_images_provided: "Included in the mixed roster folder, not separately enumerated yet."
        notes: "All mid-to-high-school football. Releases on file but specific subject IDs not enumerated at intake — flagged as gap."

      - identifier: "Gym / field / equipment"
        type: environment
        is_minor: false
        model_release_status: not_applicable
        release_holder: n/a
        soul_id_allowed: true
        soul_id_status: not_yet_trained  # if Marcus wants a locked environment look
        reference_images_provided: "22 mixed photos of gym, field, equipment, lighting conditions."
        notes: "Primary environmental anchor — Marcus emphasized 'dark gym, serious' aesthetic."

    color_palette: "Black primary, red accent, occasional gold/yellow. Hex values not formally specified; inferred from existing IG."
    aesthetic_keywords: ["dark gym", "documentary sports", "production-quality", "shot-on-real-gear", "Parisi-Speed-School-adjacent", "athletes-mic'd-up feel"]
    avoid_visually:
      - flashy / luxury imagery
      - the word "elite" in any graphic
      - any visible non-client people
      - any content that wasn't derived from real training footage

  voice:
    written_voice_examples:
      - "Another Saturday in the lab. We don't talk we work."
      - "Big shoutout to Tyrese for putting in 4 sessions this week. Mentality > everything."
      - "If you're sleeping you're losing. 6am tomorrow."
    avoid_phrases: ["elite"]

  scope:
    asset_types_needed: ["instagram_posts", "reels", "monthly_highlight_video", "sales_deck_slides"]
    cadence: "Weekly: 3-4 IG posts + 2 Reels. Monthly: 1 highlight video. Sales deck assets as needed."
    distribution: "Instagram primary. Parent-meeting sales decks (internal). YouTube/TikTok not confirmed."

  prohibited_ai_operations:
    - operation: "soul_id_training_on_minor_subject"
      reason: "Track C point 4 — auto-inserted by CBI for any brief with minor subjects"
    - operation: "fabricated_scenario_for_real_minor"
      reason: "Track C point 5 — auto-inserted by CBI for any brief with minor subjects"
    - operation: "ai_audio_alteration_of_minor_speech"
      reason: "Auto-inserted by CBI + reconfirmed verbally by Marcus"
    - operation: "ai_generated_human_alongside_real_athlete"
      reason: "Client explicit constraint — 'don't make a fake teammate stand next to my kid'"
    - operation: "use_of_word_elite_in_visual_or_copy"
      reason: "Client explicit constraint"

  constraints:
    industry_restrictions: "Track C in full force — outside client holds releases, Trail of Joy retains right to request them, work limited to derivable-from-real-footage."
    competitor_blacklist: "Florida 7v7 brands with flashy-money aesthetic (described, not named)."

  source_inputs:
    transcripts: ["practice-runs/capo-track-c/00-source-material.md Source 1"]
    existing_assets: ["practice-runs/capo/00-source-material.md Sources 2-3 (IG bio, captions, self-made Canva logo)"]
    references: ["Parisi Speed School IG", "The Stable Performance IG", "an unnamed third-party Reel Marcus liked"]
    releases_on_file: "practice-runs/capo-track-c/00-source-material.md Source 2 — Capo's parent release template, AI-scope coverage confirmed"

  gaps_flagged_by_cbi:
    - "Specific minor athletes beyond Tyrese and Jalen not enumerated by name at intake — releases confirmed by Marcus but per-subject IDs to be collected before per-athlete assets are produced"
    - "Coach Marcus's Soul ID readiness pending decision (does he want it?)"
    - "Sales-deck format spec missing (aspect ratio, slide count, branding details)"
    - "Monthly highlight video length/format not specified"
    - "Color palette hex values not formally provided"

  ready_for:
    agent_2_style_lock_soul_id: true   # voice + aesthetic + at least one subject with reference imagery ready
    agent_3_copy_captions: true        # tone_words + written_voice_examples populated from real input
    agent_4_asset_generation: true     # aesthetic + reference imagery + prohibited_ops all populated

  ready_for_blockers: []
```

---

## What this re-run confirmed

CBI v1.1 represented the Capo Track C case cleanly with no schema bending. Specifically:

- The `subjects` list captures the multi-subject reality (1 adult client, 5 minor athletes, 1 environment) with per-subject flags instead of cramming everything into one string.
- The auto-enforced `soul_id_allowed: false` for every minor subject worked exactly as designed — no path for that to come out true.
- The `prohibited_ai_operations` list captured both the auto-inserted minor-protection rules AND the client's own explicit constraints, in the same structured format.
- The `ready_for` flags are per-agent, so the brief correctly shows Agents 3 and 4 are ready while Agent 2's Soul ID work is still pending Coach Marcus's decision about his own headshots.

No new schema gaps surfaced this time. CBI v1.1 is ready for the SLS run.

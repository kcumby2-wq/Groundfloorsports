# Capo — Practice CBI Run, Output Brief
**Run by:** CBI v1.0
**Practice case:** Yes (fake client, see 00-source-material.md)
**Outcome:** HALTED at step 3 (minor-imagery check)

---

## Output (per CBI schema v1.0)

```yaml
client_brief:
  client_id: capo-athletics-2026
  client_name: Capo Athletics
  brief_version: 1.0
  built_by: CBI v1.0
  built_at: 2026-06-19T22:50:00Z

  identity:
    one_line_description: A small 7v7 / positional football training program in Plano (DFW) for HS and middle school athletes, owner-operated by a former college player turned coach (Marcus). 18 months in.
    audience: Parents of HS / middle school football players (mainly DBs and WRs) in the DFW area who can afford mid-to-high-tier training and want a coach who looks legit but isn't flashy.
    tone_words: ["serious", "no-nonsense", "earned", "work-first", "local"]
    forbidden_tone: ["flashy", "money-flexing", "Florida-7v7-with-gold-chains-and-Lambos" (Marcus's own words)]

  visual:
    soul_id_status: not_yet_trained
    subject_of_imagery: mixed — primarily client_self's athletes (HS / middle school minors), occasionally Coach Marcus himself
    subject_is_minor: true   # <<< HALT TRIGGER
    reference_images_provided: count: 0 documented; Marcus mentioned a third-party Reel he liked but did not share files
    color_palette: black, red, occasional gold/yellow (inferred from existing IG, not formally specified)
    aesthetic_keywords: ["dark gym", "serious", "production-quality", "athletes-mic'd-up feel", "not-shot-on-a-phone"]
    avoid_visually: anything "flashy"; anyone not an active client; the word "elite" anywhere on graphics

  voice:
    written_voice_examples:
      - "Another Saturday in the lab. We don't talk we work."
      - "Big shoutout to Tyrese for putting in 4 sessions this week. Mentality > everything."
      - "If you're sleeping you're losing. 6am tomorrow."
    avoid_phrases: ["elite"]

  scope:
    asset_types_needed: ["social_posts", "reels"] — full asset list not confirmed; only "look more legit on Instagram" was stated
    cadence: not specified — implied weekly/ongoing
    distribution: primarily Instagram; other channels not confirmed

  constraints:
    industry_restrictions: privacy-related — Marcus stated parents would be uncomfortable with non-clients appearing in content
    competitor_blacklist: Florida 7v7 brands with flashy-money aesthetic (described, not named)
    minor_imagery_flag: HALT — escalate to human

  source_inputs:
    - transcript: practice-runs/capo/00-source-material.md (Source 1)
    - existing_assets: Capo IG bio + sample captions (Source 2), self-made Canva logo (Source 3)
    - references: Parisi Speed School IG, The Stable Performance IG, an unnamed third-party Reel (Source 4)

  gaps_flagged_by_cbi:
    - budget: not set — Marcus asked for recommendation, deferred to follow-up
    - cadence: weekly/daily not confirmed
    - asset_type_completeness: only social_posts + reels confirmed; thumbnails, banners, sales-deck not discussed
    - soul_id_reference_images: ZERO supplied; required before Agent 2 can run
    - distribution_channels_beyond_IG: not confirmed
    - written model-release process for the athletes appearing in content: confirmed by Marcus as NOT existing
    - which specific minor athletes are intended subjects: not enumerated

  ready_for_next_agent: false
  halt_reason: "subject_is_minor: true — minors are the primary subject of intended imagery. Per CBI SOP step 3, CBI halts here and escalates to human review against the Trail of Joy Track A/B paperwork system before any downstream creative agent (Style Lock / Soul ID training) runs."
```

---

## CBI's escalation note (the human-facing part of a halt)

This brief HALTED at the minor-imagery check. Here's what that means in practice for this client:

Capo Athletics' primary creative use case is producing social content featuring HS and middle school athletes. That's not a fringe case here — it's the core of what Marcus wants. CBI cannot proceed to Agent 2 (Style Lock / Soul ID training) until this is resolved against the existing Trail of Joy paperwork structure, because the question of "can these specific kids' faces be used in generated content" is genuinely upstream of "what's the visual style."

Three things are clearly true from the intake:

1. **Soul ID-style locked-character imagery generated from real minor athletes is a different question than CMC-style coverage delivery.** Generated AI imagery using a minor's face is more permanent, more publishable, and harder for a family to undo than a delivered photo gallery. The current Track A consent agreement was not written for this use case.

2. **Marcus has confirmed there is no model release process for his athletes.** That's not a small gap — it's the gating issue. Any creative workflow that uses real minor athletes' likenesses needs that paperwork upstream, not after the fact.

3. **Capo is the CLIENT (an adult business), but the SUBJECTS are minors who are not Capo's family members and not Trail of Joy creators.** Track A doesn't fit (Marcus's athletes are not SubjectSkillz creators). Track B doesn't quite fit either (this isn't Groundfloorsports filming athletes for footage ownership — it's an outside client wanting to use minor athlete likenesses in AI-generated marketing content). **This case reveals a third track we don't have paperwork for yet.**

## What this practice run actually exposed about CBI v1.0

This is the real value of the practice run — gaps in the agent itself, not just gaps in the client intake.

### Schema gaps to address before CBI is "done"

1. **`subject_of_imagery` was a single field but the real answer was MIXED** (adult client + minor subjects). The schema needs to support multiple subject types per brief, with `subject_is_minor` evaluated per-subject, not per-brief. v1.1 should change `subject_of_imagery` from a single value to a list of `{type, is_minor}` objects.

2. **`tone_words` and `aesthetic_keywords` are currently free-form text.** Downstream Agent 2 will need these to drive prompts. The current schema doesn't specify whether these get passed verbatim into Higgsfield prompts or get translated into something. That ambiguity will cause drift between briefs. v1.1 should specify the contract: tone_words feed copy/caption agents; aesthetic_keywords feed visual-prompt agents. Different downstream consumers, different formatting needs.

3. **The `model_release_status` for subjects is currently NOT a field at all.** This case made it obvious it should be. Even for adult subjects, lacking a model release is a real problem; for minor subjects, it's a hard halt. v1.1 should add `model_release_status: [none | in_place | in_progress | not_applicable]` as a required field.

4. **`ready_for_next_agent: false` is currently binary,** but a brief can be partially ready (e.g., tone is solid but reference images are missing). v1.1 should make this a per-downstream-agent flag: `ready_for: [agent_2_style_lock: false, agent_3_copy: true]` so Agent 3 can theoretically start working on captions even while Agent 2 is blocked waiting for reference images.

### Workflow gap exposed

CBI's current SOP says it halts and "routes back to the Track A/B paperwork system" — but as the escalation note above identified, **the existing Track A/B system doesn't actually cover this case** (outside-client wanting to use non-Trail-of-Joy minors' likenesses in AI-generated content). CBI did the right thing by halting; the workflow above CBI needs a new paperwork track for this scenario before clients like Capo can be served at all.

That's the kind of finding the practice run was designed to surface. It would have been much worse to find it the first time a real client like Marcus signed up and got halfway through the pipeline.

## Feedback log entries (per CBI SOP feedback-loop spec)

1. **Schema gap:** `subject_of_imagery` needs to support mixed/multi-subject cases. Logged for v1.1.
2. **Schema gap:** `model_release_status` field needs to exist. Logged for v1.1.
3. **Schema gap:** `ready_for_next_agent` should be per-agent, not global binary. Logged for v1.1.
4. **Upstream policy gap:** No existing TOJ paperwork track covers outside-client + non-TOJ-minor-subjects. Logged for escalation to human.

## Next action recommended

Before iterating CBI to v1.1, the upstream policy gap (#4) should be addressed by the owner — there's no point sharpening the agent's schema if the case it's halting on has no resolution path on the human side. That decision (do we even take Capo-like clients? if so, under what paperwork?) is a business call, not an agent build.

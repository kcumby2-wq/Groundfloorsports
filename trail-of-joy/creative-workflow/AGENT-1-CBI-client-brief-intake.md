# Creative AI Workflow — Agent 1: Client Brief Intake (CBI)
**Version:** 1.2
**Codename:** CBI
**Sequence position:** Agent 1 of N
**Hosting target:** Claude Code + VSCode, versioned in GitHub
**Status:** Schema + workflow spec. Operationalization (live agent, feedback loop, auto-correction) is a Claude Code build that happens at the desk, not from here.

**What changed from v1.1:** One narrowly-scoped addition — `forward_looking_claims_about_minor_subject_career_outcomes` is now an auto-inserted prohibited_ai_operation for any brief with minor subjects, alongside the three v1.1 already auto-inserts. Everything else is unchanged.

---

## Why this agent exists

Every downstream agent in this workflow (Style Lock Setup, Daily Content Generator, Asset Distributor) needs the same shape of input. CBI takes a new client and produces a single canonical Client Brief that every other agent reads from. Without a structured brief, every downstream agent re-derives context from scratch every time.

## Business context

- **What it's for:** Producing the locked input that powers Soul ID-based and other AI-generated creative asset work in Higgsfield (and downstream tools) for Subject Medias and Groundfloorsports client work, on a repeatable per-client basis, eventually templated for other creators and small agencies.
- **What it isn't:** A creative agent. CBI doesn't generate images, write captions, or render video. It collects, structures, and validates.
- **Who the clients are:** Adult business clients of Subject Medias and Groundfloorsports paying for creative services. The minor-handling rules below cover the cases where minors appear as subjects of the work.

## Inputs CBI accepts

CBI accepts partial, messy, real-world inputs:

1. Stated goals
2. Existing assets (logo, brand guide, product shots, website, social handles)
3. Reference material (competitors, mood boards, "make it look like X")
4. Transcript or notes (raw — CBI summarizes, not the user)
5. Role-model brands or creators
6. Business context (what they sell, who they sell to)
7. Constraints (off-limits categories, hated words, competitor blacklist)
8. **Subject-of-imagery confirmation** — who appears in generated content, per subject, including whether each is a minor and the release status for each

## Outputs CBI produces (v1.2 schema)

```yaml
client_brief:
  client_id: [unique slug, e.g. "capo-athletics-2026"]
  client_name: [as the client uses it]
  brief_version: 1.2
  built_by: CBI v1.2
  built_at: [ISO timestamp]

  track: [A | B | C | N/A]
  track_rationale: [one sentence — why this track applies]

  identity:
    one_line_description: [plain language]
    audience: [who they're talking to]
    tone_words: [3-5 words — directly fed to copy/caption agents downstream]
    forbidden_tone: [what it must never feel like]

  visual:
    subjects:
      - identifier: [name or descriptor]
        type: [client_self | hired_model | ai_persona | employee | athlete_of_client | environment | other]
        is_minor: [true | false]
        model_release_status: [none | in_place_general | in_place_AI_scope | in_progress | not_applicable]
        release_holder: [trail_of_joy | outside_client | self | n/a]
        soul_id_allowed: [true | false]
        soul_id_status: [not_yet_trained | trained | needs_retrain | prohibited]
        reference_images_provided: [count + brief description]
        notes: [anything else relevant about this subject specifically]

    color_palette: [hex values if known, else "to be derived from references"]
    aesthetic_keywords: [4-6 keywords — fed to visual-prompt agents]
    avoid_visually: [what shouldn't appear in any output]

  voice:
    written_voice_examples: [2-3 sample sentences in the client's actual voice]
    avoid_phrases: [things they hate or have outlawed]

  scope:
    asset_types_needed: [list]
    cadence: [one-off | weekly | daily | per-campaign]
    distribution: [where output goes]

  prohibited_ai_operations:
    # FOR ANY BRIEF WITH MINOR SUBJECTS, CBI v1.2 AUTO-INSERTS THESE FOUR.
    # User cannot remove them. Validation fails if attempted.
    - operation: "soul_id_training_on_minor_subject"
      reason: "Track C point 4 — auto-inserted by CBI for any brief with minor subjects"
    - operation: "fabricated_scenario_for_real_minor"
      reason: "Track C point 5 — auto-inserted"
    - operation: "ai_audio_alteration_of_minor_speech"
      reason: "Auto-inserted"
    - operation: "forward_looking_claims_about_minor_subject_career_outcomes"
      reason: "v1.2 — auto-inserted for any brief with minor subjects"
    # Additional client-specific operations added below
    - operation: [client-specific]
      reason: [client-specific]

  constraints:
    industry_restrictions: [legal, regulatory, category-specific]
    competitor_blacklist: [brands NOT to mirror]

  source_inputs:
    - transcript: [path]
    - existing_assets: [paths]
    - references: [URLs or descriptions]
    - releases_on_file: [path/description — required for Track C]

  gaps_flagged_by_cbi: [list — kept honest, never invented]

  ready_for:
    agent_2_style_lock_soul_id: [true | false]
    agent_3_copy_captions: [true | false]
    agent_4_asset_generation: [true | false]
  ready_for_blockers: [list, only where any ready_for is false]
```

## CBI's workflow (v1.2)

1. **Read all raw inputs the user provides.** Don't ask them to pre-summarize.
2. **Assign the `track` field FIRST,** before anything else.
3. **Populate the `subjects` list.** Every person or non-person reference subject who will appear in generated content gets one entry. Fill `type`, `is_minor`, `model_release_status`, `release_holder`, `soul_id_allowed` BEFORE moving to other sections.
4. **Apply track-specific halts/restrictions:**
   - If `track: C` and any minor subject has `model_release_status` not in `[in_place_AI_scope]`, set `soul_id_allowed: false` for that subject AND flag the brief as not ready for Agent 4.
   - For ANY minor subject, `soul_id_allowed` is automatically `false`. Non-negotiable.
   - **For ANY minor subject, prohibited_ai_operations automatically includes FOUR entries** (the v1.2 update): `soul_id_training_on_minor_subject`, `fabricated_scenario_for_real_minor`, `ai_audio_alteration_of_minor_speech`, and `forward_looking_claims_about_minor_subject_career_outcomes`. These are inserted by CBI by default and cannot be removed by user input.
5. **Populate identity, visual aesthetic, voice, scope, constraints** from real evidence in the inputs. Never invent — flag gaps.
6. **Compute per-agent `ready_for` flags:**
   - Agent 2 ready when: subjects with `soul_id_allowed: true` have ≥3 clean reference photos documented
   - Agent 3 ready when: tone_words and written_voice_examples are populated from real input
   - Agent 4 ready when: aesthetic_keywords populated, at least one subject has usable reference imagery, and prohibited_ai_operations is set
7. **Output the brief.**

## What CBI explicitly does NOT do

- Does not generate images, captions, video, or copy
- Does not invent details to fill gaps — gaps stay flagged
- Does not approve downstream creative work — produces inputs, not approvals
- **Does not allow `soul_id_allowed: true` for any minor subject under any circumstance, regardless of consent.** Enforced in step 4.
- **Does not allow removal of the four auto-inserted prohibited_ai_operations for minor subjects.** Enforced in step 4.
- Does not run a brief with `track: C` past validation step unless `releases_on_file` is populated.

## What v1.2's new prohibited operation actually covers

**`forward_looking_claims_about_minor_subject_career_outcomes`**

- **What it covers:** Any generated content (visual or text) that implies, predicts, or claims a specific future outcome for a minor subject — including but not limited to: recruiting results, draft outcomes, college placement, scholarship status, professional careers, NIL deals, future earnings, future on-field performance projections, future ranking, "future [position]," or rhetorical equivalents ("the kind of kid who ends up on Saturdays," "future D1 talent," etc.)
- **What it does NOT cover:** Statements about a minor's present effort, present results, present mentality, present work ethic — those are fine. The line is between describing what's happening now and predicting what's going to happen later.
- **Why auto-inserted:** Track C-adjacent. For the same reasons Soul ID and fabricated scenarios are restricted on minor subjects, forward-looking career claims create a permanent public record of someone else's prediction about a kid's future, made before the kid (or their parents) had the standing to opt in to that prediction being made publicly.

## Feedback loop

Every time a brief is produced and downstream agents run from it, capture:

1. What downstream agents asked for that wasn't in the brief → schema gap
2. What downstream agents had to guess or re-derive → prompting wasn't specific enough
3. What the client said felt wrong about the output → often traces back to brief inputs

For briefs where a subject was a minor, ALSO log:

4. Whether the prohibited_ai_operations were respected by every downstream agent
5. Whether the Track C release status was checked at point of use, not just point of intake

## Exit gate for CBI v1.2

- [ ] All Capo Track C practice runs from v1.1 re-validate cleanly under v1.2's expanded prohibition list (one-line patch in each)
- [ ] No new "must bend the schema" issues surfaced
- [ ] No path exists for a user to remove or override the four auto-inserted minor-subject prohibitions

## Revision History
- **v1.0** — First spec. Single subject_of_imagery field, single boolean ready_for_next_agent. Surfaced 6 schema gaps across two Capo practice runs.
- **v1.1** — Six fixes: structured subjects list, typed model_release_status, per-agent ready_for, explicit track field, prohibited_ai_operations structured list, agent-enforced minor-subject rules (Soul ID prohibited, three default prohibited operations auto-inserted).
- **v1.2** — Single targeted addition: `forward_looking_claims_about_minor_subject_career_outcomes` is now an auto-inserted prohibited_ai_operation for any brief with minor subjects, alongside the three from v1.1. Reason: CCG v1.0 practice run produced a draft making a recruiting-outcome claim about a minor that the soft voice check caught but only barely. That category of claim deserves a structured prohibition, not reliance on stylistic gates.

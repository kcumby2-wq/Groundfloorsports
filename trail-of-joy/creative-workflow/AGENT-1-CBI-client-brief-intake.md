# Creative AI Workflow — Agent 1: Client Brief Intake (CBI)
**Version:** 1.1
**Codename:** CBI
**Sequence position:** Agent 1 of N
**Hosting target:** Claude Code + VSCode, versioned in GitHub
**Status:** Schema + workflow spec. Operationalization (live agent, feedback loop, auto-correction) is a Claude Code build that happens at the desk, not from here.

**What changed from v1.0:** Six gaps surfaced by the two Capo practice runs are now fixed in the schema. The basic agent shape and feedback-loop pattern are unchanged from v1.0 — only the data model and a few workflow rules changed. See revision history at end for the full diff.

---

## Why this agent exists

Every downstream agent in this workflow (Style Lock Setup, Daily Content Generator, Asset Distributor) needs the same shape of input to do its job well. CBI is the agent that takes a new client and produces a single canonical Client Brief that every other agent reads from. Without a structured brief, every downstream agent has to re-derive context from scratch every time, which is slow, inconsistent, and exactly why client work goes sideways at scale.

## Business context (unchanged from v1.0)

- **What it's for:** Producing the locked input that powers Soul ID-based and other AI-generated creative asset work in Higgsfield (and downstream tools) for Subject Medias and Groundfloorsports client work, on a repeatable per-client basis, eventually templated for other creators and small agencies.
- **What it isn't:** A creative agent. CBI doesn't generate images, write captions, or render video. It collects, structures, and validates.
- **Who the clients are:** Adult business clients of Subject Medias and Groundfloorsports paying for creative services. The minor-handling rules below cover the cases where minors appear as subjects of the work.

## Inputs CBI accepts

CBI accepts partial, messy, real-world inputs. Same as v1.0:

1. Stated goals
2. Existing assets (logo, brand guide, product shots, website, social handles)
3. Reference material (competitors, mood boards, "make it look like X")
4. Transcript or notes (raw — CBI summarizes, not the user)
5. Role-model brands or creators
6. Business context (what they sell, who they sell to)
7. Constraints (off-limits categories, hated words, competitor blacklist)
8. **Subject-of-imagery confirmation** — who appears in generated content, per subject, including whether each is a minor and the release status for each

## Outputs CBI produces (v1.1 schema)

Single Client Brief, fixed shape. The structural changes from v1.0 are marked inline below.

```yaml
client_brief:
  client_id: [unique slug, e.g. "capo-athletics-2026"]
  client_name: [as the client uses it]
  brief_version: 1.1
  built_by: CBI v1.1
  built_at: [ISO timestamp]

  # NEW IN v1.1 — explicit track assignment so downstream agents apply the right constraint set
  track: [A | B | C | N/A]
  track_rationale: [one sentence — why this track applies, e.g. "Adult client, minor subjects with parent releases held by client → Track C"]

  identity:
    one_line_description: [plain language — what they actually are]
    audience: [who they're talking to]
    tone_words: [3-5 words — directly fed to copy/caption agents downstream]
    forbidden_tone: [what it must never feel like]

  visual:
    # CHANGED IN v1.1 — was single value, now structured list per subject
    subjects:
      - identifier: [name or descriptor, e.g. "Coach Marcus" or "Tyrese (athlete)"]
        type: [client_self | hired_model | ai_persona | employee | athlete_of_client | environment | other]
        is_minor: [true | false]
        # NEW IN v1.1 — typed field, no longer prose
        model_release_status: [none | in_place_general | in_place_AI_scope | in_progress | not_applicable]
        release_holder: [trail_of_joy | outside_client | self | n/a]
        # NEW IN v1.1 — per-subject Soul ID permission, governed by Track + minor status
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

  # NEW IN v1.1 — structured "AI must not do X" rules, separate from general visual avoid list
  prohibited_ai_operations:
    - operation: [e.g. "soul_id_training_on_minor_subject"]
      reason: [e.g. "Track C point 4"]
    - operation: [e.g. "fabricated_scenario_for_real_minor"]
      reason: [e.g. "Track C point 5"]
    - operation: [e.g. "ai_audio_alteration_of_minor_speech"]
      reason: [e.g. "Client constraint, confirmed verbally"]

  constraints:
    industry_restrictions: [legal, regulatory, category-specific]
    competitor_blacklist: [brands NOT to mirror]

  source_inputs:
    - transcript: [path]
    - existing_assets: [paths]
    - references: [URLs or descriptions]
    - releases_on_file: [path/description if applicable — required for Track C]

  gaps_flagged_by_cbi: [list — what CBI couldn't fill from inputs, kept honest, never invented]

  # CHANGED IN v1.1 — per-downstream-agent, not a global boolean
  ready_for:
    agent_2_style_lock_soul_id: [true | false]
    agent_3_copy_captions: [true | false]
    agent_4_asset_generation: [true | false]
    # additional agents added here as the workflow grows
  ready_for_blockers: [list, only populated where any ready_for is false — what's missing for each blocked agent]
```

## CBI's workflow (v1.1)

1. **Read all raw inputs the user provides.** Don't ask them to pre-summarize.
2. **Assign the `track` field FIRST,** before anything else. Track A (SubjectSkillz creator), Track B (Groundfloorsports-filmed athlete), Track C (outside-client creative work with minor subjects), or N/A (adult-only). The track determines which constraints apply to the rest of the brief.
3. **Populate the `subjects` list.** Every person or non-person reference subject who will appear in generated content gets one entry. For each subject, fill `type`, `is_minor`, `model_release_status`, `release_holder`, and `soul_id_allowed` BEFORE moving to other sections — these are the gating fields for downstream work.
4. **Apply track-specific halts/restrictions:**
   - If `track: C` and any minor subject has `model_release_status` not in `[in_place_AI_scope]`, set `soul_id_allowed: false` for that subject AND flag the brief as not ready for Agent 4 with the missing release as the blocker.
   - For ANY minor subject (regardless of track), `soul_id_allowed` is automatically `false`. This is non-negotiable, enforced by the agent, not left to user judgment.
   - For ANY minor subject, prohibited_ai_operations automatically includes `soul_id_training_on_minor_subject`, `fabricated_scenario_for_real_minor`, and `ai_audio_alteration_of_minor_speech` — these are inserted by CBI by default and cannot be removed by user input.
5. **Populate identity, visual aesthetic, voice, scope, constraints** from real evidence in the inputs. Never invent — flag gaps.
6. **Compute per-agent `ready_for` flags:**
   - Agent 2 ready when: subjects with `soul_id_allowed: true` have ≥3 clean reference photos documented
   - Agent 3 ready when: tone_words and written_voice_examples are populated from real input
   - Agent 4 ready when: aesthetic_keywords populated, at least one subject has usable reference imagery, and prohibited_ai_operations is set
7. **Output the brief.**

## What CBI explicitly does NOT do (v1.1, unchanged + clarified)

- Does not generate images, captions, video, or copy.
- Does not invent details to fill gaps — gaps stay flagged.
- Does not approve downstream creative work — produces inputs, not approvals.
- **Does not allow `soul_id_allowed: true` for any minor subject under any circumstance, regardless of consent.** This is enforced in step 4 above. If a user attempts to override this, the brief fails validation.
- **Does not allow removal of the three auto-inserted prohibited_ai_operations for minor subjects.** Same enforcement.
- Does not run a brief with `track: C` past the validation step unless `releases_on_file` is populated in source_inputs.

## Feedback loop (unchanged from v1.0, plus a new pattern)

Every time a brief is produced and downstream agents run from it, capture:

1. What downstream agents asked for that wasn't in the brief → schema gap
2. What downstream agents had to guess or re-derive → prompting wasn't specific enough
3. What the client said felt wrong about the output → often traces back to brief inputs

**New v1.1 pattern:** Every time a brief is produced where a subject was a minor, ALSO log:
4. Whether the prohibited_ai_operations were respected by every downstream agent
5. Whether the Track C release status was checked at point of use, not just point of intake

These two extra streams exist because the practice runs proved that minor-handling rules are the highest-stakes part of this whole workflow.

## Practice test plan

Both Capo practice cases (run #1: minor subjects without releases → halt; run #2: minor subjects with Track C-compliant releases → produce brief with Soul ID prohibited for minors but allowed for adult client) should run cleanly through v1.1 without bending the schema. If they don't, v1.1 has a gap and we iterate before touching Agent 2.

## Exit gate for CBI v1.1 being "done"
- [ ] Schema v1.1 produced and version-controlled
- [ ] Capo run #1 (no consent) re-runs through v1.1 and halts cleanly
- [ ] Capo run #2 (Track C compliant) re-runs through v1.1 with no schema bending
- [ ] Per-agent ready_for flags are accurately computed in both runs
- [ ] No new "must bend the schema" issues surfaced

## Revision History
- **v1.0** — First spec for CBI. Single subject_of_imagery field, single boolean ready_for_next_agent, no track field, prohibited operations buried in prose. Surfaced 6 schema gaps across two Capo practice runs.
- **v1.1** — Six fixes from practice-run feedback:
  1. `subject_of_imagery` → structured `subjects` list with typed per-subject fields
  2. `model_release_status` → typed required per-subject field, replaces prose notes
  3. `ready_for_next_agent` → per-agent `ready_for` block, replaces global boolean
  4. NEW `track: A | B | C | N/A` field, set first, drives downstream constraint application
  5. NEW `prohibited_ai_operations` structured list, separate from general avoid-visually
  6. NEW agent-enforced minor-subject rules (Soul ID prohibited, three default prohibited operations auto-inserted) that cannot be overridden by user input

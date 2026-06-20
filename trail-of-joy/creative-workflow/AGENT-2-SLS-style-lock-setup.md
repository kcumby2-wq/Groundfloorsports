# Creative AI Workflow — Agent 2: Style Lock Setup (SLS)
**Version:** 1.1
**Codename:** SLS
**Sequence position:** Agent 2 of N
**Hosting target:** Claude Code + VSCode, versioned in GitHub
**Status:** Schema + workflow spec. Operationalization is a Claude Code build at the desk, not from here.

**Dependencies:** Reads a valid Client Brief from CBI v1.1+. SLS does not run unless `ready_for.agent_2_style_lock_soul_id: true` in the brief.

**What changed from v1.0:** Added a version-check step (now step 1) so SLS confirms the brief it's consuming matches the current CBI spec version before doing anything else, and flags + carries forward a staleness warning rather than silently proceeding — surfaced as a real gap by the AGV v1.0 practice run.

---

## Why this agent exists

CBI tells us what the client looks/sounds/feels like. SLS turns that into the *operational creative lock* — the concrete, reusable, version-controlled style anchors that every downstream content-generation run will pull from. Without SLS, every render is a fresh interpretation of vibes; every weekly batch slowly drifts off-brand. With SLS, the client has a locked style that holds across hundreds of generations, weeks apart, on different tools.

The product SLS produces is a **Style Lock Document** per client — the asset that, in a year, you can hand to any creator/agency and they can pick up the work without you in the room.

## What SLS actually locks

Three things, treated as separate sub-locks because they have different rules:

### 1. Visual identity lock (Soul ID-style, but broader)

If the brief has at least one subject with `soul_id_allowed: true` AND adequate reference imagery, SLS specs the Soul ID training inputs for that subject. The agent does NOT train the Soul ID itself (that's a Higgsfield action that happens in the platform); it produces the **training spec**: which subject, which reference photos, what name/label to use, what consistency notes Higgsfield's Soul ID training should be told.

For subjects where Soul ID is prohibited (every minor, per CBI's enforcement) OR where the client opted out, SLS specs an alternative: a **prompt-anchor pack** — a fixed set of descriptive phrases that get included in every prompt to maintain visual consistency without locking a trained identity. This is the right tool when the subject is a minor under Track C, when reference photos aren't Soul ID-format, or when the client wants creative flexibility per-output rather than a locked face.

### 2. Aesthetic lock (color, lighting, framing, environment)

Independent of who's in the frame, what does the work *look* like? Pulled from the brief's `aesthetic_keywords`, `color_palette`, and any reference imagery of the environment (gym, field, studio, etc.). Locked into:

- A 4-6 line **style preamble** that prepends every prompt
- A named palette (with hex values) that drives color grading
- Reference imagery for environmental contexts the work happens in

### 3. Voice / copy lock

For caption, headline, and any text-overlay generation. Pulled from `tone_words`, `written_voice_examples`, and `avoid_phrases`. Produced as:

- A voice prompt fragment that gets included in every copy-generation request
- A short list of forbidden words/phrases (hardcoded, never overridden)
- 3-5 calibration examples in the client's actual voice

## Inputs SLS reads

- The CBI Client Brief (the entire YAML structure)
- Reference images, if attached or referenced
- Any prior Style Lock Document for the same client (for version comparison / drift detection)

## Outputs SLS produces

A single **Style Lock Document** per client, structured for both human review and machine consumption by downstream agents:

```yaml
style_lock:
  client_id: [from brief]
  client_name: [from brief]
  brief_version_consumed: [which CBI brief version this was built from]
  lock_version: 1.1
  built_by: SLS v1.1
  built_at: [ISO timestamp]
  track: [carried forward from brief]

  # NEW IN v1.1 — populated only if step 1's version check found staleness
  stale_brief_warning:
    is_stale: [true | false]
    brief_version_consumed: [e.g. "1.1"]
    current_cbi_version: [e.g. "1.2"]
    what_changed: [e.g. "v1.2 adds a fourth auto-inserted prohibited_ai_operation for minor subjects (forward_looking_claims_about_minor_subject_career_outcomes), not present in this brief"]
    recommendation: [e.g. "Re-run CBI before producing client-facing assets involving minor subjects"]

  visual_identity_lock:
    method: [soul_id | prompt_anchor | mixed]
    soul_id_specs:
      - subject_identifier: [from brief subjects list]
        soul_id_name: [proposed Higgsfield label, e.g. "capo-marcus-2026"]
        training_references: [list of file paths to reference photos approved for training]
        consistency_notes: [3-5 lines telling Higgsfield what to lock — facial structure, hair, typical wardrobe, etc.]
        platform_action_required: "Train this Soul ID in Higgsfield manually using the spec above. Once trained, paste the Soul ID handle into trained_soul_id_handle below."
        trained_soul_id_handle: [filled in by human after training, blank until then]
    prompt_anchor_packs:
      - subject_identifier: [from brief subjects list]
        prompt_anchors:
          - [a fixed descriptive phrase, e.g. "high school football athlete, mid-teens, lean build, training gear"]
          - [another, e.g. "captured in real training environment, not posed"]
        usage_rule: "Every prompt involving this subject MUST include all anchors verbatim, in the order listed."

  aesthetic_lock:
    style_preamble: |
      [4-6 lines that prepend every visual prompt.]
    palette:
      primary: [hex]
      secondary: [hex]
      accents: [hex list]
    environmental_references: [paths to non-person reference imagery]

  voice_lock:
    voice_prompt_fragment: |
      [The line that gets injected into every copy-generation prompt.]
    forbidden_words_phrases: [list — never appears in output, hardcoded check]
    voice_calibration_examples: [3-5 sentences in the client's actual voice, pulled from brief]

  prohibited_ai_operations: [carried forward verbatim from brief]

  ready_for_downstream:
    agent_3_copy: [true | false]
    agent_4_asset_generation: [true | false]
  ready_for_blockers: [list of what's blocking, where applicable]
```

## SLS's workflow (v1.1)

1. **Check the brief's version before doing anything else (NEW in v1.1).** Compare `brief_version` against the current CBI spec version. If the brief is older than current CBI, populate `stale_brief_warning` with what changed and a recommendation. **Do not silently proceed on a stale brief when minor subjects are involved** — surface the warning prominently and recommend a CBI re-run before producing client-facing assets. For non-minor-subject briefs, staleness is lower-stakes; flag but proceeding is reasonable.
2. **Validate the brief.** Reject if `ready_for.agent_2_style_lock_soul_id: false`, OR if any subject has internally inconsistent fields (e.g. `is_minor: true` AND `soul_id_allowed: true` — should never happen, but validate anyway as a safety check).
3. **Carry forward `prohibited_ai_operations` verbatim.** Non-negotiable; SLS cannot drop or modify them.
4. **For each subject in the brief:**
   - If `soul_id_allowed: true` AND ≥3 reference photos AND track is N/A or A-with-special-care → generate a soul_id_spec
   - Else → generate a prompt_anchor_pack
5. **Derive the aesthetic lock** from the brief's `aesthetic_keywords`, `color_palette`, `avoid_visually`, and environmental references. The style_preamble is the highest-leverage artifact in the entire workflow — spend real effort on it.
6. **Derive the voice lock** from `tone_words`, `written_voice_examples`, `avoid_phrases`.
7. **Compute `ready_for_downstream`:**
   - Agent 3 (copy) ready when: voice_lock is fully populated
   - Agent 4 (asset generation) ready when: aesthetic_lock is fully populated AND at least one subject's visual_identity_lock is complete
8. **Output the Style Lock Document**, including `brief_version_consumed` and, if step 1 raised a staleness flag, the populated `stale_brief_warning` block — carried forward so CCG and AGV inherit the same warning rather than it disappearing at this layer.

## What SLS does NOT do

- Does not train Soul IDs itself. Human action in Higgsfield's UI.
- Does not generate creative output. SLS produces the *lock*; Agent 4 produces the assets.
- Does not override anything from CBI.
- Does not iterate on the client's brand.
- **(v1.1) Does not silently swallow a version mismatch.** If the brief is stale, that travels downstream as a visible flag, not a silent gap.

## Where SLS pulls real tool knowledge from (and what it doesn't pretend to know)

SLS specs Higgsfield Soul ID training based on Higgsfield's actual recommended practice as of build time:
- 3-5+ clean reference photos, varied angles, varied expressions, consistent lighting
- One full-height shot if possible for body proportion
- Avoid heavy shadows, sunglasses, cropped faces

SLS does NOT pretend to know real-time Higgsfield credit costs, whether a specific training run will succeed, or platform behavior released after this SOP's last revision. When Higgsfield updates Soul ID requirements, SLS gets a version bump.

## Feedback loop

1. **Drift events:** when generated output looks off-brand, trace back — aesthetic lock wrong, or ignored?
2. **Voice mismatches:** voice_prompt_fragment weak, or Agent 3 ignored it?
3. **Soul ID retraining triggers:** trained ID stops resembling subject after 50+ generations.
4. **Prompt-anchor effectiveness:** below ~85% consistency means anchors need sharpening.
5. **(v1.1) Version-staleness incidents:** any time a stale brief was used to produce real client-facing output, log it — this is a process failure worth tracking even if the output itself was fine.

## Practice test plan

Run SLS against the Capo Track C brief. Expected behavior unchanged from v1.0, plus: confirm the version-check step correctly identifies if the brief consumed is behind the current CBI version and populates `stale_brief_warning` accordingly.

## Known open item (carried forward, not yet fixed)

The AGV v1.0 practice run also flagged that SLS's `ready_for_downstream` is still a simple boolean per agent, when the Capo Track C case showed partial readiness is the real shape (e.g., Agent 4 ready for some subjects, not others). This is a separate fix from the version-check addition above — queued, not done in this revision, to keep this update narrowly scoped to the version-check fix it was meant to deliver.

## Exit gate for SLS v1.1
- [ ] Version-check step added and producing `stale_brief_warning` correctly
- [ ] Capo Track C brief re-run confirms staleness detection works
- [ ] Per-subject `ready_for_downstream` fix still queued for a future revision (not this one)

## Revision History
- **v1.0** — First spec. Splits the lock into three sub-locks. Treats Soul ID training as spec-and-handoff. Routes minor subjects to prompt anchors only.
- **v1.1** — Adds a version-check step (new step 1) so SLS confirms the brief it's consuming matches the current CBI spec version before doing anything else. Populates and carries forward a `stale_brief_warning` block so downstream agents (CCG, AGV) inherit the same warning instead of it silently disappearing. Surfaced as a real gap by the AGV v1.0 practice run, where SLS had consumed a v1.1 brief after CBI had already moved to v1.2.

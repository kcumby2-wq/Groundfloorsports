# Creative AI Workflow — Agent 2: Style Lock Setup (SLS)
**Version:** 1.0
**Codename:** SLS
**Sequence position:** Agent 2 of N
**Hosting target:** Claude Code + VSCode, versioned in GitHub
**Status:** Schema + workflow spec. Operationalization is a Claude Code build at the desk, not from here.

**Dependencies:** Reads a valid Client Brief from CBI v1.1+. SLS does not run unless `ready_for.agent_2_style_lock_soul_id: true` in the brief.

---

## Why this agent exists

CBI tells us what the client looks/sounds/feels like. SLS turns that into the *operational creative lock* — the concrete, reusable, version-controlled style anchors that every downstream content-generation run will pull from. Without SLS, every render is a fresh interpretation of vibes; every weekly batch slowly drifts off-brand. With SLS, the client has a locked style that holds across hundreds of generations, weeks apart, on different tools.

The product SLS produces is a **Style Lock Document** per client — the asset that, in a year, you can hand to any creator/agency and they can pick up the work without you in the room.

## What SLS actually locks

Three things, treated as separate sub-locks because they have different rules:

### 1. Visual identity lock (Soul ID-style, but broader)

If the brief has at least one subject with `soul_id_allowed: true` AND adequate reference imagery, SLS specs the Soul ID training inputs for that subject. The agent does NOT train the Soul ID itself (that's a Higgsfield action that happens in the platform); it produces the **training spec**: which subject, which reference photos, what name/label to use, what consistency notes Higgsfield's Soul ID training should be told.

For subjects where Soul ID is prohibited (every minor, per CBI v1.1's enforcement) OR where the client opted out, SLS specs an alternative: a **prompt-anchor pack** — a fixed set of descriptive phrases that get included in every prompt to maintain visual consistency without locking a trained identity. This is the right tool when the subject is a minor under Track C, when reference photos aren't Soul ID-format, or when the client wants creative flexibility per-output rather than a locked face.

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
  lock_version: 1.0
  built_by: SLS v1.0
  built_at: [ISO timestamp]
  track: [carried forward from brief]

  visual_identity_lock:
    method: [soul_id | prompt_anchor | mixed]  # mixed = adult client uses Soul ID, minor subjects use prompt anchors
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
      [4-6 lines that prepend every visual prompt. Example for Capo:
       "Documentary sports training aesthetic.
        Dark gym, controlled lighting, deep shadows.
        Production-grade — feels shot on real cinema gear, not phone.
        Color grade: high-contrast, warm shadows, cool highlights.
        Composition: athlete-centered, environmental context visible.
        Mood: serious, no-nonsense, work-first."]
    palette:
      primary: [hex]
      secondary: [hex]
      accents: [hex list]
    environmental_references: [paths to non-person reference imagery — the gym, the field, the equipment]

  voice_lock:
    voice_prompt_fragment: |
      [The line that gets injected into every copy-generation prompt.
       Example for Capo:
       "Voice: short, declarative, work-first. No filler. No selling. No 'elite' or
        flashy language. Confident but not boastful. Style of: 'We don't talk we work.'"]
    forbidden_words_phrases: [list — never appears in output, hardcoded check]
    voice_calibration_examples: [3-5 sentences in the client's actual voice, pulled from brief]

  prohibited_ai_operations: [carried forward verbatim from brief]

  ready_for_downstream:
    agent_3_copy: [true | false]
    agent_4_asset_generation: [true | false]
  ready_for_blockers: [list of what's blocking, where applicable]
```

## SLS's workflow

1. **Validate the brief.** Reject if `ready_for.agent_2_style_lock_soul_id: false`, OR if any subject has internally inconsistent fields (e.g. `is_minor: true` AND `soul_id_allowed: true` — should never happen post-v1.1, but validate anyway as a safety check).
2. **Carry forward `prohibited_ai_operations` verbatim.** These are non-negotiable; SLS cannot drop or modify them.
3. **For each subject in the brief:**
   - If `soul_id_allowed: true` AND ≥3 reference photos AND track is N/A or A-with-special-care → generate a soul_id_spec
   - Else → generate a prompt_anchor_pack
4. **Derive the aesthetic lock** from the brief's `aesthetic_keywords`, `color_palette`, `avoid_visually`, and environmental references. The style_preamble is the highest-leverage artifact in the entire workflow — spend real effort on it. It is not a placeholder.
5. **Derive the voice lock** from `tone_words`, `written_voice_examples`, `avoid_phrases`. The voice_prompt_fragment should be tight enough that an LLM downstream produces copy that would pass a "does this sound like the client?" gut check from the client themselves.
6. **Compute `ready_for_downstream`:**
   - Agent 3 (copy) ready when: voice_lock is fully populated
   - Agent 4 (asset generation) ready when: aesthetic_lock is fully populated AND at least one subject's visual_identity_lock is complete (either a trained_soul_id_handle filled in, OR a prompt_anchor_pack ready)
7. **Output the Style Lock Document.**

## What SLS does NOT do

- Does not train Soul IDs itself. That's a human action in Higgsfield's UI, using SLS's spec as the instruction.
- Does not generate creative output. SLS produces the *lock*; Agent 4 produces the assets using the lock.
- Does not override anything from CBI. If the brief says a subject can't have Soul ID, SLS routes that subject to prompt anchors instead — it does not second-guess.
- Does not iterate on the client's brand. If the aesthetic_keywords feel weak, that's a feedback signal back to CBI, not something SLS should make up for.

## Where SLS pulls real tool knowledge from (and what it doesn't pretend to know)

SLS specs Higgsfield Soul ID training based on Higgsfield's actual recommended practice as of build time:
- 3-5+ clean reference photos, varied angles, varied expressions, consistent lighting
- One full-height shot if possible for body proportion
- Avoid heavy shadows, sunglasses, cropped faces

SLS does NOT pretend to know:
- Real-time Higgsfield credit costs / quota for a specific account
- Whether a specific Soul ID training run will succeed (training is a Higgsfield-side stochastic process)
- The exact behavior of newer Higgsfield features released after this SOP's last revision

When Higgsfield updates its Soul ID training requirements or releases new features (Soul 3.0, etc.), SLS gets a version bump.

## Feedback loop

Every Style Lock Document gets used by downstream agents. Capture:

1. **Drift events:** when generated output looks off-brand, trace back — was the aesthetic lock wrong, or was it ignored?
2. **Voice mismatches:** when copy doesn't sound like the client, was the voice_prompt_fragment weak, or did Agent 3 ignore it?
3. **Soul ID retraining triggers:** when a trained Soul ID stops looking like the subject after 50+ generations, that's a retrain signal logged here.
4. **Prompt-anchor effectiveness:** for subjects using anchors instead of Soul ID, how consistent does the output actually look? Below ~85% consistency means the anchors need sharpening.

After 3-5 client lock builds, patterns emerge — particular anchor structures that work better, palette descriptions that hold better through generations. Those become SLS v1.1.

## Practice test plan

Run SLS against the Capo Track C brief (output of Capo run #2, once that brief gets re-run through CBI v1.1). Expected behavior:

- Coach Marcus → `soul_id_spec` (he's adult, opted in)
- All five minor athletes → `prompt_anchor_pack` (Track C enforces no Soul ID on minors)
- Aesthetic lock → "documentary sports training, dark gym, serious work-first, no flashy language" derived from brief
- Voice lock → tight short-form voice with "elite" hard-banned
- Ready for Agent 3: true. Ready for Agent 4: true (once Marcus's Soul ID is trained by hand in Higgsfield).

If the lock document produced from that brief is good enough that you could hand it to another creator and they could go run a week of Capo content from it alone, SLS v1.0 is working.

## Exit gate for SLS v1.0 being "done"
- [ ] Schema produced and version-controlled
- [ ] Capo Track C brief runs through SLS v1.0 and produces a clean Style Lock Document
- [ ] At least one real client produces a Style Lock Document via SLS
- [ ] First three feedback-loop entries captured
- [ ] No `soul_id_allowed: true` ever surfaced on a minor subject

## Revision History
- v1.0 — First spec for Style Lock Setup. Splits the lock into three sub-locks (visual identity, aesthetic, voice) with different rules per sub-lock. Treats Soul ID training as a spec-and-handoff, not an automated step. Routes minor subjects to prompt anchors only (carries forward CBI v1.1's enforcement). Establishes the practice-first test plan using the existing Capo Track C brief.

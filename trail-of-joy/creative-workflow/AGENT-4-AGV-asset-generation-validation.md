# Creative AI Workflow — Agent 4: Asset Generation & Validation (AGV)
**Version:** 1.0
**Codename:** AGV
**Sequence position:** Agent 4 of N
**Hosting target:** Claude Code + VSCode, versioned in GitHub. Higgsfield interaction is human-in-the-loop by default (paste-and-run); API integration is a future option, not v1.0.
**Status:** Schema + workflow spec.

**Dependencies:**
- Reads a valid Style Lock Document from SLS v1.0+ (with CBI v1.2's prohibited_ai_operations carried through)
- Does not run unless `ready_for_downstream.agent_4_asset_generation: true` (or `partial` with permitted subjects listed) in the lock
- Honors the brief's `prohibited_ai_operations` list as hard constraints, no exceptions

---

## Why this agent exists, and what it actually does

Every prior agent has been about getting the inputs right. AGV is where those inputs become an actual visual asset — a photo, an image, a short video. This is the highest-risk agent in the workflow because it's the only one whose output is directly publishable and directly tied to a real subject's likeness.

**What AGV does:**

1. **Constructs prompts** that respect the Style Lock (visual identity lock, aesthetic lock, prohibited operations) and the specific request
2. **Hands those prompts off to Higgsfield** (manually or via API), with all the constraint context the platform needs
3. **Validates the returned output** against the lock and the prohibited operations before approving it for downstream use
4. **Logs every generation** — prompt, output, validation result, approval status — for the feedback loop and the audit trail

**What AGV does NOT do:**

- AGV does not bypass human review for any output. Every asset that gets approved has a human in the loop, even when the validation auto-passes.
- AGV does not generate output that violates the brief's prohibited_ai_operations. Period. The validation step catches this even if the prompt construction step somehow let it through.
- AGV does not produce assets for subjects not explicitly listed in the lock's permitted-subjects list.
- AGV does not train Soul IDs. That's still a human action in Higgsfield (per SLS v1.0).

## Inputs AGV reads

- The Style Lock Document (entire structure)
- The parent CBI brief (for context and the prohibited_ai_operations list)
- The request: subject_focus, asset_type, occasion, context_notes (same shape as CCG)
- The list of trained Soul ID handles from the lock (for adult subjects who have been trained)
- The reference imagery folders cited in the lock (for prompt-anchor subjects)

## What AGV produces (per generation)

```yaml
asset_generation_output:
  request_id: [unique]
  client_id: [from lock]
  client_name: [from lock]
  lock_version_consumed: [SLS version]
  brief_version_referenced: [CBI version]
  built_by: AGV v1.0
  built_at: [ISO timestamp]
  track: [carried forward]

  request:
    asset_type: [image | reel_b_roll | reel_full | story_image | thumbnail | deck_visual]
    subject_focus: [list of subject identifiers from the lock — every subject must be in the lock]
    occasion: [what the asset is for]
    context_notes: [free-form]
    source_footage_reference: [REQUIRED for any asset depicting a minor — must reference specific files in the lock's reference imagery]

  prompt_construction:
    style_preamble: [pulled verbatim from lock.aesthetic_lock.style_preamble]
    subject_anchors: [for each subject_focus, pulled from lock — Soul ID handle if trained, prompt anchors if anchor-based]
    palette_directive: [from lock.aesthetic_lock.palette]
    composition_directive: [derived from asset_type + occasion]
    prohibited_operations_negative_prompt: [translated from the brief's prohibited_ai_operations into a negative prompt block — e.g. "do not generate: AI-generated humans alongside real subjects, fabricated scenarios, anything implying future career outcomes"]
    full_prompt: [the final assembled prompt that gets handed to Higgsfield]
    platform_target: [higgsfield_image | higgsfield_video | other]
    human_action_required: "Paste the full_prompt into Higgsfield. Use Soul IDs listed under subject_anchors. Return the output filename/URL for validation."

  generated_output:
    file_reference: [filename or URL of the output Higgsfield produced — filled in by human after generation]
    generated_at: [timestamp]
    higgsfield_metadata: [credits used, Soul IDs invoked, etc., optional]

  validation:
    # AGV runs these checks on the returned output, not just on the prompt
    hard_checks_passed: [true | false]
    hard_check_failures: [list — populated if false]
    soft_checks_passed: [true | false]
    soft_check_notes: [populated if any flags]
    approval_status: [APPROVED | REJECTED | FLAGGED_FOR_HUMAN_DECISION]
    rejection_reason: [populated only if REJECTED]
    reviewer_decision: [populated by human after review — APPROVED | REJECTED | REQUEST_REGENERATE]

  audit_trail:
    minor_subjects_in_asset: [list — for any minor subject visible in the output]
    release_status_at_generation: [per minor subject, snapshot from brief — releases_on_file: yes/no]
    soul_id_used: [per subject, true/false — should always be false for minor subjects]
    fabricated_elements: [should always be "none for minor subjects"]
    forward_looking_implications: [should always be "none"]
```

## AGV's workflow per request

1. **Read the Style Lock + brief.** Reject if `ready_for_downstream.agent_4_asset_generation: false`. If `partial`, verify the subject_focus is in the permitted-subjects list.

2. **Validate subject_focus.** Every subject in the request must be in the lock's subjects list. If not — reject the request with a specific error ("subject 'X' not in lock; add via CBI re-run").

3. **For any minor subject in subject_focus, require source_footage_reference.** This is the Track C "derivable from real footage only" rule, enforced structurally — the request cannot proceed without explicit reference to which real-footage files the asset is derived from. No source footage → reject the request.

4. **Construct the prompt:**
   - Start with `style_preamble` verbatim
   - For each subject: if Soul ID handle exists (adult subjects only), reference it; if not, use the prompt anchors verbatim, in the order specified by the lock
   - Add the palette directive and composition directive
   - **Build a NEGATIVE PROMPT BLOCK from the brief's prohibited_ai_operations.** This is the part platform-specific prompts often skip. For Higgsfield, the negative prompt block becomes part of the prompt structure, calling out what must not appear: "no AI-generated humans alongside real subjects, no fabricated scenarios, no forward-looking career imagery (uniforms of teams not yet committed to, championship trophies the subject hasn't won, etc.)"

5. **Hand off to Higgsfield.** v1.0 is paste-and-run — the human takes the constructed prompt, the Soul ID handles, the reference imagery, and runs the generation in Higgsfield's UI. AGV does not auto-trigger generation. (Future v2 could integrate an API.)

6. **The human returns the output file/URL to AGV.** This is the trigger for the validation step.

7. **Run HARD validation checks on the returned output. Any failure → reject the output, do not let it proceed.**

   - **Subject presence/absence check.** If subject_focus included Marcus, Marcus should be the visible subject. If the output features someone who isn't Marcus, reject. (This catches Higgsfield mis-routing the Soul ID, or generating a generic athlete instead of the locked subject.)
   - **Prohibited-element check.** Specifically for minor subjects:
     - **AI-generated humans alongside real-subject minors** — visual inspection required. If the output appears to include AI-fabricated additional people next to a real minor athlete, reject. This is hard to fully automate; v1.0 surfaces it for human review with a structured prompt: "Does this output include anyone besides the listed real subject(s)? If yes, was that person separately consented?"
     - **Forward-looking imagery** — uniform of a team not yet committed to, championship trophy the subject hasn't won, draft podium imagery, etc. Reject.
     - **Soul ID usage on minor** — confirm via Higgsfield metadata that no Soul ID was invoked for any minor subject. If metadata shows a Soul ID was used for a minor — reject and flag as a P0 bug in the workflow.
   - **Aesthetic check.** Does the output visibly conform to the lock's palette and style_preamble? Major drift → reject.
   - **Source-derivation check (for minor subjects).** Does the output appear derivable from the source footage cited? A minor athlete in a scenario nothing like the source footage → reject.

8. **Run SOFT checks. Failures → flag for reviewer, do not auto-reject.**

   - **Voice/tone resonance.** Does the visual feel like the client's brand?
   - **Composition strength.** Is it a strong frame, or is it a flat "AI image"?
   - **Subject likeness fidelity (adult, Soul ID).** Does the rendered Soul ID actually look like the real person, or has the trained ID drifted?

9. **Set approval_status:**
   - All hard checks pass → APPROVED (still goes to human review for final ship decision)
   - Any hard check fails → REJECTED (human is told why, and can request regeneration with adjusted prompt or escalate)
   - Hard checks pass but soft checks flag concerns → FLAGGED_FOR_HUMAN_DECISION

10. **Write the full audit trail.** Every generation gets logged — prompt, output, validation result, minor subjects involved, release status at time of generation, Soul ID usage. This isn't bureaucracy; it's the record that says "we did this correctly, here's the proof" if a question ever comes up later.

## What AGV explicitly does NOT do

- **Does not bypass human review even when all checks pass.** APPROVED ≠ shipped. Human still signs off.
- **Does not generate output that violates prohibited_ai_operations.** The negative prompt block at construction, plus the validation check after generation, gives two independent enforcement points.
- **Does not produce assets for subjects not in the lock.** If you want to feature a new subject, it goes through CBI first.
- **Does not train Soul IDs.** Human action in Higgsfield.
- **Does not use Soul ID for any minor subject under any circumstance.** Enforced at construction (only adult subjects with `soul_id_allowed: true` get a Soul ID handle in the prompt) AND at validation (Higgsfield metadata is checked).
- **Does not generate forward-looking imagery for minor subjects.** Same dual enforcement.
- **Does not skip the audit trail.** Every generation is logged, every time.

## Validation honesty

I want to be straight about the limits of v1.0's hard checks. Some of them — "does the output include AI-generated humans alongside the real subject" — can't be fully automated by a text-based agent. v1.0 surfaces those for human visual inspection with structured questions. That's not laziness; it's that automated visual content moderation is genuinely hard and "we'll figure it out later" would be dishonest. The agent makes the check explicit and structured so a reviewer can answer it in 5 seconds, but the reviewer is doing the actual looking.

This is also why the audit trail matters — even if a visual problem slips past the reviewer, the audit trail captures *what was generated, from what prompt, with what subjects*, so a problem can be traced and corrected.

## Feedback loop

Per generation:

1. **Prompt-to-output match.** Did the output actually reflect the prompt's intent? Persistent mismatches mean the prompt construction needs refinement.
2. **Hard-reject patterns.** What's hitting the hard checks most? Is it Higgsfield mis-routing, or sloppy prompt construction, or genuinely off-brand requests?
3. **Soft-flag patterns.** Are reviewers consistently approving soft-flagged drafts (flag is over-anxious) or rejecting them (flag is calibrated)?
4. **Minor-subject prohibitions respected.** Audit trail review every N generations to confirm the four CBI-mandated prohibitions held across all outputs involving minor subjects. If even one slip is found, that's a P0 issue — stop and trace.
5. **Soul ID drift.** For adult Soul IDs, how many generations before the trained identity stops resembling the real subject? Retrain trigger lives here.

## Practice test plan

Run AGV v1.0 against the Capo Track C Style Lock (03-sls-v1.0-style-lock.md) for three different requests:

1. **Environmental b-roll request** (subject: gym/equipment, no minor subjects) — expected to flow cleanly through validation, since no minor-safety checks are triggered.

2. **Coach Marcus solo asset** (assuming he's opted in to Soul ID) — expected to flow cleanly, with Soul ID validation noting the trained handle was used.

3. **Tyrese-focused asset with source footage reference** — expected to enforce the Track C constraints: derivable from cited source footage, no Soul ID used (metadata check), no fabricated scenarios, no forward-looking elements. This is the highest-stakes test because every minor-subject guardrail has to fire correctly.

If all three flow as expected, AGV v1.0 holds. If any minor-subject guardrail fails on request 3, AGV doesn't ship — back to v1.1 immediately.

## Exit gate for AGV v1.0

- [ ] Schema produced and version-controlled
- [ ] Practice run against the three Capo Track C requests passes — especially request 3
- [ ] No path exists for an output to be approved without the validation step running
- [ ] Audit trail captures every generation with sufficient detail to trace any output back to its prompt and validation
- [ ] No instance of Soul ID being invoked for a minor subject across any generation

## Revision History

- v1.0 — First spec for Asset Generation & Validation. Treats prompt construction and output validation as two separate enforcement points for the prohibited_ai_operations list. Higgsfield interaction is paste-and-run by default; the agent's value is in prompt construction and post-generation validation, not in operating the platform itself. Explicitly honest about the limits of automated visual validation — surfaces structured human-review prompts for the cases automation can't handle. Requires source_footage_reference for any asset depicting a minor (Track C derivable-from-real-footage rule, enforced structurally). Maintains a per-generation audit trail.

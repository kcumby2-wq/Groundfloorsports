# Creative AI Workflow — Agent 4: Asset Generation & Validation (AGV)
**Version:** 1.1
**Codename:** AGV
**Sequence position:** Agent 4 of N
**Hosting target:** Claude Code + VSCode, versioned in GitHub. Higgsfield interaction is human-in-the-loop by default (paste-and-run); API integration is a future option, not v1.0.
**Status:** Schema + workflow spec.

**Dependencies:**
- Reads a valid Style Lock Document from SLS v1.1+ (with CBI v1.2's prohibited_ai_operations carried through)
- Does not run unless `ready_for_downstream.agent_4_asset_generation: true` (or `partial` with permitted subjects listed) in the lock
- Honors the brief's `prohibited_ai_operations` list as hard constraints, no exceptions

**What changed from v1.0:** Added a version-check step (now step 1) so AGV detects a `stale_brief_warning` carried in the Style Lock and halts on minor-safety-relevant staleness, same fix as SLS v1.1 and CCG v1.2. Everything else is unchanged — AGV v1.0's actual generation/validation logic has not yet been tested against a real Higgsfield output (see practice run 05), so no functional changes to that logic are made here.

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
- AGV does not generate output that violates the brief's prohibited_ai_operations. Period.
- AGV does not produce assets for subjects not explicitly listed in the lock's permitted-subjects list.
- AGV does not train Soul IDs. That's still a human action in Higgsfield.

## Inputs AGV reads

- The Style Lock Document (entire structure, including any `stale_brief_warning`)
- The parent CBI brief (for context and the prohibited_ai_operations list)
- The request: subject_focus, asset_type, occasion, context_notes
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
  built_by: AGV v1.1
  built_at: [ISO timestamp]
  track: [carried forward]

  # NEW IN v1.1
  stale_lock_warning_surfaced: [true | false]
  halted_due_to_staleness: [true | false]

  request:
    asset_type: [image | reel_b_roll | reel_full | story_image | thumbnail | deck_visual]
    subject_focus: [list of subject identifiers from the lock — every subject must be in the lock]
    occasion: [what the asset is for]
    context_notes: [free-form]
    source_footage_reference: [REQUIRED for any asset depicting a minor]

  prompt_construction:
    style_preamble: [pulled verbatim from lock.aesthetic_lock.style_preamble]
    subject_anchors: [for each subject_focus, pulled from lock]
    palette_directive: [from lock.aesthetic_lock.palette]
    composition_directive: [derived from asset_type + occasion]
    prohibited_operations_negative_prompt: [translated from prohibited_ai_operations]
    full_prompt: [the final assembled prompt]
    platform_target: [higgsfield_image | higgsfield_video | other]
    human_action_required: "Paste the full_prompt into Higgsfield. Use Soul IDs listed under subject_anchors. Return the output filename/URL for validation."

  generated_output:
    file_reference: [filename or URL — filled in by human after generation]
    generated_at: [timestamp]
    higgsfield_metadata: [credits used, Soul IDs invoked, etc., optional]

  validation:
    hard_checks_passed: [true | false]
    hard_check_failures: [list]
    soft_checks_passed: [true | false]
    soft_check_notes: [populated if any flags]
    approval_status: [APPROVED | REJECTED | FLAGGED_FOR_HUMAN_DECISION]
    rejection_reason: [populated only if REJECTED]
    reviewer_decision: [populated by human after review]

  audit_trail:
    minor_subjects_in_asset: [list]
    release_status_at_generation: [per minor subject, snapshot from brief]
    soul_id_used: [per subject, true/false — should always be false for minor subjects]
    fabricated_elements: [should always be "none for minor subjects"]
    forward_looking_implications: [should always be "none"]
```

## AGV's workflow per request (v1.1)

1. **Check the lock's version before doing anything else (NEW in v1.1).** If the Style Lock carries a `stale_brief_warning` with `is_stale: true`, surface it. If the staleness is minor-safety-relevant (e.g. the lock predates a new auto-inserted prohibited_ai_operation) and any subject_focus in this request is a minor, **halt** — set `halted_due_to_staleness: true` and recommend the lock be regenerated from a current brief before proceeding. Do not construct a prompt against a known-stale minor-safety constraint set.

2. **Read the Style Lock + brief.** Reject if `ready_for_downstream.agent_4_asset_generation: false`. If `partial`, verify the subject_focus is in the permitted-subjects list.

3. **Validate subject_focus.** Every subject in the request must be in the lock's subjects list. If not — reject with a specific error.

4. **For any minor subject in subject_focus, require source_footage_reference.** No source footage → reject the request.

5. **Construct the prompt:**
   - Start with `style_preamble` verbatim
   - For each subject: Soul ID handle (adult only) or prompt anchors verbatim, in order
   - Add palette directive and composition directive
   - **Build a NEGATIVE PROMPT BLOCK from prohibited_ai_operations** — explicit, platform-actionable language for what must not appear

6. **Hand off to Higgsfield.** Paste-and-run by default. AGV does not auto-trigger generation.

7. **The human returns the output file/URL.** Triggers validation.

8. **Run HARD validation checks on the returned output. Any failure → reject.**

   - **Subject presence/absence check.**
   - **Prohibited-element check** (AI-generated humans alongside real minor subjects — surfaced for human visual inspection; forward-looking imagery; Soul ID usage on minor — checked via metadata).
   - **Aesthetic check.**
   - **Source-derivation check (for minor subjects).**

9. **Run SOFT checks. Failures → flag, do not auto-reject.**

   - Voice/tone resonance, composition strength, Soul ID likeness fidelity.

10. **Set approval_status** (APPROVED / REJECTED / FLAGGED_FOR_HUMAN_DECISION).

11. **Write the full audit trail**, including `stale_lock_warning_surfaced` and `halted_due_to_staleness` if applicable.

## What AGV explicitly does NOT do

- Does not bypass human review even when all checks pass.
- Does not generate output that violates prohibited_ai_operations.
- Does not produce assets for subjects not in the lock.
- Does not train Soul IDs.
- Does not use Soul ID for any minor subject under any circumstance.
- Does not generate forward-looking imagery for minor subjects.
- Does not skip the audit trail.
- **(v1.1) Does not construct a prompt against a lock known to be stale on a minor-safety-relevant dimension** — halts instead per workflow step 1.

## Validation honesty (unchanged from v1.0)

Some hard checks — "does the output include AI-generated humans alongside the real subject" — can't be fully automated by a text-based agent. v1.0/v1.1 surface those for human visual inspection with structured questions rather than pretending to auto-resolve them. The audit trail captures what was generated, from what prompt, with what subjects, so a problem can be traced even if it slips past a reviewer.

## Feedback loop

1. Prompt-to-output match
2. Hard-reject patterns
3. Soft-flag patterns (over- or under-anxious)
4. Minor-subject prohibitions respected — audit trail review every N generations
5. Soul ID drift (adult subjects)
6. **(v1.1) Stale-lock incidents** — any time step 1 caught a stale lock and halted

## Known open item from the v1.0 practice run (not yet addressed in v1.1)

The AGV v1.0 practice run (05-agv-v1.0-practice-run.md) found that **output validation genuinely cannot be tested without a real Higgsfield generation** — the practice run could only verify prompt construction logic, not the validation checks themselves. This remains true in v1.1; the version-check fix doesn't address it. **Before any real client work, a real minor-subject generation should be run once, with human eyes on the actual output, as a hard pre-launch gate** — this is unchanged guidance from the v1.0 practice run and is the most important open item in the entire creative workflow right now, more so than any further schema iteration.

## Practice test plan

Same three Capo Track C requests as the v1.0 practice run, plus: confirm step 1 correctly detects lock staleness if present (in the original practice run, the lock was built from a v1.1 brief when CBI had already moved to v1.2 — re-running with that same lock should now produce a staleness flag instead of silently proceeding).

## Exit gate for AGV v1.1

- [ ] Version-check step added and halting correctly on minor-safety-relevant staleness
- [ ] All v1.0 exit-gate items remain true
- [ ] The "real generation, human eyes on output" gate from the v1.0 practice run is still tracked as the actual launch blocker — not papered over by this version bump

## Revision History

- **v1.0** — First spec for Asset Generation & Validation. Two independent enforcement points (construction + validation) for prohibited_ai_operations. Higgsfield interaction is paste-and-run. Honest about limits of automated visual validation. Requires source_footage_reference for minor-subject assets. Per-generation audit trail.

- **v1.1** — Adds a version-check step (new step 1) so AGV detects a `stale_brief_warning` carried forward from SLS/CBI and halts construction when staleness is minor-safety-relevant. Companion fix to SLS v1.1 and CCG v1.2. Does not address the v1.0 practice run's more important open finding — that output validation hasn't been tested against any real generation — which remains the actual gate before real client use.

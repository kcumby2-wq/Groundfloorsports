# Creative AI Workflow — Agent 4: Asset Generation & Validation (AGV)
**Version:** 1.2
**Codename:** AGV
**Sequence position:** Agent 4 of N
**Hosting target:** Claude Code + VSCode, versioned in GitHub. Higgsfield interaction is human-in-the-loop by default (paste-and-run); API integration is a future option, not v1.0.
**Status:** Schema + workflow spec.

**Dependencies:**
- Reads a valid Style Lock Document from SLS v1.1+ (with CBI v1.2's prohibited_ai_operations carried through)
- Does not run unless `ready_for_downstream.agent_4_asset_generation: true` (or `partial` with permitted subjects listed) in the lock
- Honors the brief's `prohibited_ai_operations` list as hard constraints, no exceptions
- (v1.2) Reads roster identity data (jersey number or equivalent identifier) where available, per `SUBJECT-IDENTITY-VERIFICATION-DELIVERY-QA.md`

**What changed from v1.1:** Adds a subject-identity verification check to the validation step (Workflow Step 8), per the owner's direct request: confirming the right specific subject is in the delivered asset — not just "a subject who generally matches the request" — using jersey number or equivalent roster identifier as the concrete signal, cross-checked against structured intake data, with a mandatory human visual confirm before approval. This is a real check, not cosmetic — it directly addresses a genuine failure mode (misattributed content, especially relevant when multiple similar-looking minor subjects exist in a roster/team context).

---

## Why this agent exists, and what it actually does

Every prior agent has been about getting the inputs right. AGV is where those inputs become an actual visual asset — a photo, an image, a short video. This is the highest-risk agent in the workflow because it's the only one whose output is directly publishable and directly tied to a real subject's likeness.

**What AGV does:**

1. **Constructs prompts** that respect the Style Lock (visual identity lock, aesthetic lock, prohibited operations) and the specific request
2. **Hands those prompts off to Higgsfield** (manually or via API), with all the constraint context the platform needs
3. **Validates the returned output** against the lock, the prohibited operations, AND the subject's identity (NEW emphasis in v1.2) before approving it for downstream use
4. **Logs every generation** — prompt, output, validation result, approval status — for the feedback loop and the audit trail

**What AGV does NOT do:**

- AGV does not bypass human review for any output. Every asset that gets approved has a human in the loop, even when the validation auto-passes.
- AGV does not generate output that violates the brief's prohibited_ai_operations. Period.
- AGV does not produce assets for subjects not explicitly listed in the lock's permitted-subjects list.
- AGV does not train Soul IDs. That's still a human action in Higgsfield.
- (v1.2) AGV does not approve an asset for delivery without a subject-identity check, where roster identity data exists.

## Inputs AGV reads

- The Style Lock Document (entire structure, including any `stale_brief_warning`)
- The parent CBI brief (for context and the prohibited_ai_operations list)
- The request: subject_focus, asset_type, occasion, context_notes
- The list of trained Soul ID handles from the lock (for adult subjects who have been trained)
- The reference imagery folders cited in the lock (for prompt-anchor subjects)
- **(v1.2) Roster identity data for the subject_focus**, where it exists — jersey number, team, or equivalent identifier per `SUBJECT-IDENTITY-VERIFICATION-DELIVERY-QA.md`. Not all clients will have this captured; AGV proceeds without it when unavailable, but flags its absence (see Workflow Step 8 below).

## What AGV produces (per generation)

```yaml
asset_generation_output:
  request_id: [unique]
  client_id: [from lock]
  client_name: [from lock]
  lock_version_consumed: [SLS version]
  brief_version_referenced: [CBI version]
  built_by: AGV v1.2
  built_at: [ISO timestamp]
  track: [carried forward]

  stale_lock_warning_surfaced: [true | false]
  halted_due_to_staleness: [true | false]

  request:
    asset_type: [image | reel_b_roll | reel_full | story_image | thumbnail | deck_visual]
    subject_focus: [list of subject identifiers from the lock — every subject must be in the lock]
    occasion: [what the asset is for]
    context_notes: [free-form]
    source_footage_reference: [REQUIRED for any asset depicting a minor]

  # NEW IN v1.2
  subject_identity_check:
    roster_identity_available: [true | false]
    expected_identifier: [e.g. "jersey #14, Verde Athletics U13" — pulled from roster data, blank if unavailable]
    identifier_visible_in_output: [true | false | not_applicable — set during human visual confirm]
    identity_match_confirmed_by: [name of the human who did the visual confirm — required if roster_identity_available is true]
    mismatch_flagged: [true | false]
    mismatch_notes: [populated if a mismatch was found — what was expected vs what was actually visible]

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
    subject_identity_check_result: [carried forward from the subject_identity_check block above — part of the permanent record]
```

## AGV's workflow per request (v1.2)

1. **Check the lock's version before doing anything else.** If the Style Lock carries a `stale_brief_warning` with `is_stale: true`, surface it. If the staleness is minor-safety-relevant and any subject_focus in this request is a minor, **halt**.

2. **Read the Style Lock + brief.** Reject if `ready_for_downstream.agent_4_asset_generation: false`. If `partial`, verify the subject_focus is in the permitted-subjects list.

3. **Validate subject_focus.** Every subject in the request must be in the lock's subjects list. If not — reject with a specific error.

4. **For any minor subject in subject_focus, require source_footage_reference.** No source footage → reject the request.

5. **Look up roster identity data for the subject_focus (NEW in v1.2).** Check if jersey number or equivalent is captured for this subject. Populate `subject_identity_check.roster_identity_available` and `expected_identifier` accordingly. If not available, proceed but flag it — this isn't a blocker, but it means the strongest version of this check can't run for this particular client/subject yet (worth flagging to the operator as a reason to capture this data going forward).

6. **Construct the prompt:**
   - Start with `style_preamble` verbatim
   - For each subject: Soul ID handle (adult only) or prompt anchors verbatim, in order
   - Add palette directive and composition directive
   - **Build a NEGATIVE PROMPT BLOCK from prohibited_ai_operations**

7. **Hand off to Higgsfield.** Paste-and-run by default. AGV does not auto-trigger generation.

8. **The human returns the output file/URL.** Triggers validation.

9. **Run HARD validation checks on the returned output. Any failure → reject.**

   - **Subject presence/absence check.**
   - **Prohibited-element check** (AI-generated humans alongside real minor subjects; forward-looking imagery; Soul ID usage on minor).
   - **Aesthetic check.**
   - **Source-derivation check (for minor subjects).**
   - **(NEW in v1.2) Subject identity check.** If `roster_identity_available: true`, the human reviewer is specifically prompted to confirm: is the expected identifier (jersey number, etc.) actually visible and matching in the output (for real-footage-derived content) or otherwise consistent with the correct individual (for AI-generated content where a jersey number may not directly render but the Soul ID/prompt-anchor pairing should still be traceable to the right person)? **This is not optional when roster data exists — the reviewer must explicitly set `identifier_visible_in_output` and name themselves in `identity_match_confirmed_by` before the asset can be APPROVED.** If a mismatch is found, set `mismatch_flagged: true`, write what was expected vs. observed in `mismatch_notes`, and REJECT — do not downgrade this to a soft flag.

10. **Run SOFT checks. Failures → flag, do not auto-reject.**

    - Voice/tone resonance, composition strength, Soul ID likeness fidelity.

11. **Set approval_status** (APPROVED / REJECTED / FLAGGED_FOR_HUMAN_DECISION). **An asset cannot be set to APPROVED if `roster_identity_available: true` and `identity_match_confirmed_by` is blank** — this is a hard gate, not a courtesy reminder.

12. **Write the full audit trail**, including the subject_identity_check result as a permanent part of the record — not just a transient check that disappears after approval.

## What AGV explicitly does NOT do

- Does not bypass human review even when all checks pass.
- Does not generate output that violates prohibited_ai_operations.
- Does not produce assets for subjects not in the lock.
- Does not train Soul IDs.
- Does not use Soul ID for any minor subject under any circumstance.
- Does not generate forward-looking imagery for minor subjects.
- Does not skip the audit trail.
- Does not construct a prompt against a lock known to be stale on a minor-safety-relevant dimension — halts instead per workflow step 1.
- **(v1.2) Does not auto-resolve a subject identity mismatch.** If `mismatch_flagged: true`, the asset is rejected and the discrepancy goes to a human to sort out — AGV doesn't guess which subject is actually correct.
- **(v1.2) Does not perform automated visual jersey-number recognition.** This remains a human visual-confirm step, per `SUBJECT-IDENTITY-VERIFICATION-DELIVERY-QA.md` — AGV's role is to structurally REQUIRE that confirm happen and record who did it, not to computer-vision its way past the human.

## Validation honesty (unchanged)

Some hard checks — "does the output include AI-generated humans alongside the real subject," and now "is this actually the right specific kid" — can't be fully automated by a text-based agent. AGV surfaces those for human visual inspection with structured questions rather than pretending to auto-resolve them. The audit trail captures what was generated, from what prompt, with what subjects, with whose visual confirmation, so a problem can be traced even if it slips past a reviewer.

## Feedback loop

1. Prompt-to-output match
2. Hard-reject patterns
3. Soft-flag patterns (over- or under-anxious)
4. Minor-subject prohibitions respected — audit trail review every N generations
5. Soul ID drift (adult subjects)
6. Stale-lock incidents
7. **(v1.2) Subject identity mismatches.** Any time `mismatch_flagged: true` fires, that's worth tracking as its own pattern — is it happening more with certain clients (larger rosters, more similar-looking subjects), more with certain asset types, or more with AI-generated vs real-footage-derived content? That tells you where the underlying risk concentrates.

## Known open item from the v1.0 practice run (still not addressed)

The AGV v1.0 practice run found that **output validation genuinely cannot be tested without a real Higgsfield generation.** This remains true in v1.2 — the subject-identity check adds a real and valuable checklist item, but it doesn't change the fact that the validation step as a whole hasn't been exercised against a real generated image. **The AGV Real-World Test Protocol exists specifically to close this gap** (`AGV-REAL-WORLD-TEST-PROTOCOL.md`) and remains the actual pre-launch gate. The new subject-identity check should be incorporated into that test when it's run — Test Case 2 of the protocol should now also confirm the identity-check fields populate correctly during a real validation pass.

## Practice test plan

Same three Capo Track C requests as the v1.0 practice run, plus: confirm step 1 correctly detects lock staleness, and (NEW) confirm that the subject_identity_check block populates correctly and that an asset cannot reach APPROVED status without `identity_match_confirmed_by` populated when roster data is available.

## Exit gate for AGV v1.2

- [ ] Version-check step (v1.1) still halting correctly on minor-safety-relevant staleness
- [ ] Subject identity check is a hard gate on APPROVED status whenever roster_identity_available is true
- [ ] All v1.0/v1.1 exit-gate items remain true
- [ ] The "real generation, human eyes on output" gate is still tracked as the actual launch blocker — the subject-identity check makes the validation checklist better but does NOT substitute for running the real test protocol

## Revision History

- **v1.0** — First spec for Asset Generation & Validation. Two independent enforcement points (construction + validation) for prohibited_ai_operations. Higgsfield interaction is paste-and-run. Honest about limits of automated visual validation. Requires source_footage_reference for minor-subject assets. Per-generation audit trail.

- **v1.1** — Adds a version-check step (new step 1) so AGV detects a `stale_brief_warning` carried forward from SLS/CBI and halts construction when staleness is minor-safety-relevant.

- **v1.2** — Adds a subject-identity verification check to the validation step, per direct owner request: confirms the delivered asset shows the right specific subject (not just a generally-matching one), using jersey number or equivalent roster identifier as the concrete signal. Structured as a metadata cross-check (roster data captured at intake) plus a mandatory human visual confirm — explicitly NOT automated visual jersey-number recognition, which remains out of scope. Hard-gates APPROVED status on the confirm being completed and recorded whenever roster identity data is available. Companion document: `SUBJECT-IDENTITY-VERIFICATION-DELIVERY-QA.md`, which establishes this as a cross-cutting delivery-QA principle beyond just AGV.

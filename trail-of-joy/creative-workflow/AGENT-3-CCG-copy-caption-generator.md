# Creative AI Workflow — Agent 3: Copy & Caption Generator (CCG)
**Version:** 1.2
**Codename:** CCG
**Sequence position:** Agent 3 of N
**Hosting target:** Claude Code + VSCode, versioned in GitHub
**Status:** Schema + workflow spec.

**Dependencies:**
- Reads a valid Style Lock Document from SLS v1.1+ (with CBI v1.2's prohibited_ai_operations carried through)
- Does not run unless `ready_for_downstream.agent_3_copy: true` in the lock
- Reads the parent CBI brief for source_inputs / constraints when context is needed

**What changed from v1.1:** Added a version-check step (now step 1) so CCG detects a `stale_brief_warning` carried in the Style Lock and halts rather than generating against a known-outdated minor-safety constraint set. Everything else from v1.1 is unchanged.

---

## Why this agent exists

CCG takes the locked voice and produces draft copy that actually sounds like the client — drafts a human reviews and ships, not "AI content that needs to be completely rewritten."

The honest measure: does the copy pass a "would the client actually post this?" gut check with minimal editing?

## What CCG produces (schema unchanged from v1.1)

```yaml
copy_output:
  request_id: [unique per request]
  client_id: [from style lock]
  client_name: [from style lock]
  lock_version_consumed: [which SLS lock]
  built_by: CCG v1.2
  built_at: [ISO timestamp]
  track: [carried forward]

  # NEW IN v1.2 — surfaced if the lock carried a staleness warning
  stale_lock_warning_surfaced: [true | false]

  request:
    asset_type: [instagram_post | instagram_reel | highlight_video | sales_deck_slide | story | thread]
    subject_focus: [from style lock's subjects list]
    occasion: [what's this for]
    context_notes: [free-form]

  drafts:
    - draft_id: 1
      angle: [a one-line description of what makes this draft different from the others]
      hook: [opening line]
      body: [main copy]
      cta: [if any]
      hashtags: [if applicable]
      character_count: [number]
      hard_checks_passed: [true | false]
      hard_check_failures: [list — populated only if false]
      soft_checks_passed: [true | false]
      soft_check_notes: [populated if there are any flags worth surfacing]
      ship_status: [APPROVED | REJECTED | FLAGGED_FOR_REVIEW]
    - draft_id: 2
      [same shape]
    - draft_id: 3
      [same shape]

  rejected_drafts: [count of drafts that hit a hard reject and were not surfaced to reviewer at all]
  rejected_draft_reasons: [aggregate reasons — for feedback loop, not for reviewer action]

  flagged_for_human_review: [true | false]
  notes_for_reviewer: [things CCG wants the human to know]
```

## CCG's workflow per request (v1.2)

1. **Check the Style Lock's version before doing anything else (NEW in v1.2).** If the lock carries a `stale_brief_warning` with `is_stale: true`, surface that warning prominently in `notes_for_reviewer` before generating anything. If the staleness involves a minor subject and a minor-safety-relevant change (e.g. a new auto-inserted prohibited_ai_operation that the lock predates), **halt and recommend the lock be regenerated from a current brief before CCG proceeds** — do not generate copy against a known-stale minor-safety constraint set.

2. **Read the Style Lock Document and validate.** Reject the request if `ready_for_downstream.agent_3_copy: false` or voice_lock fields are missing.

3. **Read the request.** Asset type, subject focus, occasion, context.

4. **Context confirmation step.** If the request references a specific real-world event ("recognition for Tyrese's 4 sessions this week," "post about Saturday's session"), CCG explicitly confirms that fact came from the requester, not from the agent's own inference. If the requester didn't provide that context, CCG asks for it before generating — does not assume.

5. **Verify the subject focus is allowed.** Cross-check against the brief's subjects list. If the focus subject is a minor under Track C, that's fine for copy, but the copy must not reference fabricated scenarios, AI-altered speech, or forward-looking career-outcome claims involving them (all four of CBI v1.2's auto-inserted prohibitions).

6. **Construct the LLM prompt** using the locked voice_prompt_fragment as primary system instruction, followed by asset-type format rules, followed by the specific request context. Voice fragment passes verbatim. Never paraphrased.

7. **Generate 4-6 candidate drafts internally.** Most will be rejected by the hard checks below — surfacing 2-3 *approved* drafts to the reviewer requires generating more than 2-3, because the rejection rate from hard checks is non-trivial.

8. **Run HARD checks on each candidate draft. Any failure → draft is rejected and never surfaced to reviewer.**

   - **Forbidden words/phrases.** Any match in the voice_lock's `forbidden_words_phrases` → reject.
   - **Prohibited AI operations check.** Any draft that violates one of the brief's `prohibited_ai_operations` → reject. Specifically for minor subjects, this means rejecting drafts that:
     - Reference fabricated scenarios involving them
     - Imply AI-altered audio/quotes from them
     - Make forward-looking claims about their future career outcomes
   - **Distinctiveness check.** Reject drafts that contain phrases that would appear identically in 50 other clients' content in the same vertical. Specifically:
     - Reject drafts whose hook or body could be swapped into a generic "training program" or "sports brand" template with no change in meaning
     - Reject drafts containing AI-staple constructions: "where committed athletes train," "unlock your potential," "level up," "transform your game," "elevate your performance," "next-level [anything]," "where champions are made," "the journey starts here," and similar
     - Reject drafts where the subject_focus, occasion, or any specific client detail could be removed and the copy would still parse as complete and meaningful
   - **Format check.** Wrong character count for asset type → reject.

9. **Run SOFT checks on remaining drafts. Failures → flag for reviewer, do not reject.**

   - **Sentence-length drift.** Average sentence length significantly different from voice_lock calibration examples.
   - **Vocabulary drift.** Words outside the client's typical register.
   - **Confidence-tone drift.** A draft that's stronger or weaker in claim than the calibration examples support — surface as a flag, with the specific concern named.

10. **If fewer than 2 drafts survive the hard checks, generate another internal batch (steps 7-9) up to a total of 3 batches.** If 3 batches produce zero survivors, surface that to the reviewer: "0 drafts survived 3 rounds of hard checks. Either the request is off-brand for this client, or the lock document needs refinement."

11. **Surface 2-3 approved drafts** with their soft-check notes and any flags.

## What CCG explicitly does NOT do

- **Does not auto-publish.** Human review every time.
- **Does not generate copy about events that didn't happen.**
- **Does not modify or paraphrase the voice_prompt_fragment.**
- **Does not invent client-specific facts.**
- **Does not produce content that flatters or hypes the client beyond what the voice supports.**
- **Does not surface drafts that fail the distinctiveness hard check.**
- **Does not surface drafts containing forward-looking career-outcome claims about minor subjects.**
- **(v1.2) Does not generate against a lock known to be stale on a minor-safety-relevant dimension** — halts instead per workflow step 1.

## How CCG handles asset-type variation (unchanged)

| Asset type | Format rules |
|---|---|
| `instagram_post` | Hook ≤ 125 chars. Body up to ~2200 chars, tighter is better. Hashtags optional, max 5, on-brand only |
| `instagram_reel` | Hook in first 3-5 words. Total caption ≤ 150 chars typical. Text-overlay copy is its own field |
| `story` | ≤ 50 chars. No hashtags |
| `highlight_video` | Title + 1-2 line description. Separate "text overlay beats" field |
| `sales_deck_slide` | Headline + 1-3 supporting bullets. No hashtags, no emojis |
| `thread` | First post is the hook. Each subsequent post carries one beat |

## Feedback loop

1. Which draft the reviewer picked
2. What the reviewer edited before posting
3. Voice drift events
4. Hard-check rejection patterns
5. Subject-focus errors
6. Distinctiveness near-misses
7. Forward-looking-claims near-misses
8. **(v1.2) Stale-lock incidents.** Any time step 1 caught a stale lock and halted, log it — this is a process signal that upstream agents need to re-run more proactively, not just a one-off catch.

## Practice re-test plan

Same as v1.1's plan, plus: confirm step 1 correctly detects a `stale_brief_warning` if present in the lock and halts appropriately when the staleness is minor-safety-relevant.

## Exit gate for CCG v1.2
- [ ] Version-check step added and halting correctly on minor-safety-relevant staleness
- [ ] All v1.1 exit-gate items remain true

## Revision History

- **v1.0** — First spec. Hard forbidden-word check + soft voice check. 2-3 drafts per request. Voice fragment passes verbatim. Refuses to fabricate events. Never auto-publishes.

- **v1.1** — Distinctiveness check became a hard reject. Forward-looking claims about minor subjects' career outcomes became a hard reject. Added context-confirmation workflow step. Increased internal generation volume to 4-6 candidates.

- **v1.2** — Adds a version-check step (new step 1) so CCG detects a `stale_brief_warning` carried forward from SLS and halts generation rather than proceeding against a known-outdated minor-safety constraint set. Surfaced as a real gap by the AGV v1.0 practice run, alongside SLS v1.1's parallel fix.

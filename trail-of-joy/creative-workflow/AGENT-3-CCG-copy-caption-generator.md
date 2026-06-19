# Creative AI Workflow — Agent 3: Copy & Caption Generator (CCG)
**Version:** 1.1
**Codename:** CCG
**Sequence position:** Agent 3 of N
**Hosting target:** Claude Code + VSCode, versioned in GitHub
**Status:** Schema + workflow spec.

**Dependencies:**
- Reads a valid Style Lock Document from SLS v1.0+ (with CBI v1.2's prohibited_ai_operations carried through)
- Does not run unless `ready_for_downstream.agent_3_copy: true` in the lock
- Reads the parent CBI brief for source_inputs / constraints when context is needed

**What changed from v1.0:** Two hardening fixes from the practice run:

1. **Distinctiveness check is now a hard reject, not a soft flag.** v1.0's soft voice check correctly identified "this could be any training program in America" copy but only flagged it — busy reviewers might ship it anyway. v1.1 hard-rejects drafts that fail the distinctiveness check.

2. **Forward-looking-claims-about-minor-subjects check is now its own hard prohibition, not relied on the soft voice check.** Aligns with CBI v1.2's auto-insertion of `forward_looking_claims_about_minor_subject_career_outcomes` into prohibited_ai_operations.

---

## Why this agent exists

(unchanged from v1.0 — see revision history)

CCG takes the locked voice and produces draft copy that actually sounds like the client — drafts a human reviews and ships, not "AI content that needs to be completely rewritten."

The honest measure: does the copy pass a "would the client actually post this?" gut check with minimal editing?

## What CCG produces (v1.1 schema)

```yaml
copy_output:
  request_id: [unique per request]
  client_id: [from style lock]
  client_name: [from style lock]
  lock_version_consumed: [which SLS lock]
  built_by: CCG v1.1
  built_at: [ISO timestamp]
  track: [carried forward]

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

      # v1.1 — checks split into hard rejects and soft flags
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

## CCG's workflow per request (v1.1)

1. **Read the Style Lock Document and validate.** Reject the request if `ready_for_downstream.agent_3_copy: false` or voice_lock fields are missing.

2. **Read the request.** Asset type, subject focus, occasion, context.

3. **Context confirmation step (new in v1.1, surfaced from practice run finding #3).** If the request references a specific real-world event ("recognition for Tyrese's 4 sessions this week," "post about Saturday's session"), CCG explicitly confirms that fact came from the requester, not from the agent's own inference. If the requester didn't provide that context, CCG asks for it before generating — does not assume.

4. **Verify the subject focus is allowed.** Cross-check against the brief's subjects list. If the focus subject is a minor under Track C, that's fine for copy, but the copy must not reference fabricated scenarios, AI-altered speech, or forward-looking career-outcome claims involving them (all four of CBI v1.2's auto-inserted prohibitions).

5. **Construct the LLM prompt** using the locked voice_prompt_fragment as primary system instruction, followed by asset-type format rules, followed by the specific request context. Voice fragment passes verbatim. Never paraphrased.

6. **Generate 4-6 candidate drafts internally** (more than v1.0's 2-3). Most will be rejected by the hard checks below — surfacing 2-3 *approved* drafts to the reviewer requires generating more than 2-3, because the rejection rate from hard checks is non-trivial.

7. **Run HARD checks on each candidate draft. Any failure → draft is rejected and never surfaced to reviewer.**

   - **Forbidden words/phrases.** Any match in the voice_lock's `forbidden_words_phrases` → reject.
   - **Prohibited AI operations check.** Any draft that violates one of the brief's `prohibited_ai_operations` → reject. Specifically for minor subjects, this means rejecting drafts that:
     - Reference fabricated scenarios involving them
     - Imply AI-altered audio/quotes from them
     - Make forward-looking claims about their future career outcomes (per CBI v1.2)
   - **Distinctiveness check (new hard check in v1.1).** Reject drafts that contain phrases that would appear identically in 50 other clients' content in the same vertical. Specifically:
     - Reject drafts whose hook or body could be swapped into a generic "training program" or "sports brand" template with no change in meaning
     - Reject drafts containing AI-staple constructions: "where committed athletes train," "unlock your potential," "level up," "transform your game," "elevate your performance," "next-level [anything]," "where champions are made," "the journey starts here," and similar
     - Reject drafts where the subject_focus, occasion, or any specific Capo/client detail could be removed and the copy would still parse as complete and meaningful — that's the "this could be anyone" failure mode
   - **Format check.** Wrong character count for asset type → reject.

8. **Run SOFT checks on remaining drafts. Failures → flag for reviewer, do not reject.**

   - **Sentence-length drift.** Average sentence length significantly different from voice_lock calibration examples.
   - **Vocabulary drift.** Words outside the client's typical register (e.g. literary-sounding words for a blunt brand).
   - **Confidence-tone drift.** A draft that's stronger or weaker in claim than the calibration examples support — surface as a flag, with the specific concern named, so the reviewer can judge.

9. **If fewer than 2 drafts survive the hard checks, generate another internal batch (steps 6-8) up to a total of 3 batches.** If 3 batches produce zero survivors, the request itself is suspect — the lock may not fit the asset type, or the request may be inherently off-brand. Surface that to the reviewer with a note: "0 drafts survived 3 rounds of hard checks. Either the request is off-brand for this client, or the lock document needs refinement. See rejected_draft_reasons for the pattern."

10. **Surface 2-3 approved drafts** with their soft-check notes and any flags.

## What CCG explicitly does NOT do

(carried from v1.0, plus v1.1 additions)

- **Does not auto-publish.** Human review every time.
- **Does not generate copy about events that didn't happen.** Confirmed via context check (workflow step 3 in v1.1).
- **Does not modify or paraphrase the voice_prompt_fragment.** Lock is constitution, not suggestion.
- **Does not invent client-specific facts.**
- **Does not produce content that flatters or hypes the client beyond what the voice supports.**
- **(v1.1) Does not surface drafts that fail the distinctiveness hard check** — a reviewer never even sees them.
- **(v1.1) Does not surface drafts containing forward-looking career-outcome claims about minor subjects** — auto-rejected, not flagged.

## How CCG handles asset-type variation

(unchanged from v1.0)

| Asset type | Format rules |
|---|---|
| `instagram_post` | Hook ≤ 125 chars (above "more"). Body up to ~2200 chars but most should be tighter. Hashtags optional, max 5, on-brand only |
| `instagram_reel` | Hook in first 3-5 words. Total caption ≤ 150 chars typical. Text-overlay copy is its own field |
| `story` | ≤ 50 chars. No hashtags |
| `highlight_video` | Title + 1-2 line description. Separate "text overlay beats" field |
| `sales_deck_slide` | Headline + 1-3 supporting bullets. No hashtags, no emojis |
| `thread` | First post is the hook. Each subsequent post carries one beat |

## Feedback loop (v1.1)

Per copy_output that gets used:

1. Which draft the reviewer picked
2. What the reviewer edited before posting
3. Voice drift events (passed checks but reviewer rejected on voice)
4. Hard-check rejection patterns (for tuning future runs)
5. Subject-focus errors (any time CCG produces copy about a subject not in the lock's subjects list)
6. **(v1.1) Distinctiveness near-misses.** When a draft passed the distinctiveness check but the reviewer says "this still feels generic" — log the specific draft and what was generic about it. After 3-5 of these, the distinctiveness check phrase blacklist gets expanded.
7. **(v1.1) Forward-looking-claims near-misses.** Any time a draft was caught by the forward-looking-claims hard check, log what the draft was trying to do — sometimes the right move is to rewrite the request, not the draft.

## Practice re-test plan

Re-run the three Capo Track C requests from 04-ccg-v1.0-practice-run.md through CCG v1.1 and confirm:

1. Tyrese recognition Draft 3 ("The kids who get drafted are the kids who keep showing up") is now HARD REJECTED, not soft-flagged. It triggers the forward-looking-claims-about-minor prohibition.
2. Sales-deck Draft 3 ("Where committed athletes train") is now HARD REJECTED by the distinctiveness check.
3. The reviewer-facing output shows 2 surviving drafts in those cases (since v1.1 generates more candidates internally), with the rejected ones noted in `rejected_drafts` count for the feedback loop but not in the reviewer's path.

If both happen cleanly, v1.1 closes the two real holes the v1.0 run surfaced.

## Exit gate for CCG v1.1

- [ ] Schema v1.1 produced and version-controlled
- [ ] Practice re-run against the three Capo requests passes with the expected hard rejects
- [ ] No instance of forbidden words, distinctiveness-failing copy, or forward-looking-claims-about-minor copy reaching the reviewer's path
- [ ] Feedback log distinguishes hard-rejected drafts from flagged drafts

## Revision History

- **v1.0** — First spec. Hard forbidden-word check + soft voice check. 2-3 drafts per request. Voice fragment passes verbatim. Refuses to fabricate events. Never auto-publishes.

- **v1.1** — Two fixes from practice-run findings:
  1. **Distinctiveness check is now a hard reject.** v1.0 caught generic-positioning copy ("Where committed athletes train") as a soft flag — but a busy reviewer might ship it. v1.1 rejects it before the reviewer ever sees it, with an explicit blacklist of AI-staple phrases and a structural "could this swap into any other client's content unchanged?" check.
  2. **Forward-looking claims about minor subjects' career outcomes is now a hard reject** (aligned with CBI v1.2's auto-inserted prohibition). v1.0 caught the "kids who get drafted" line via the soft voice check, but the underlying issue isn't stylistic — it's that public predictions about a minor's career outcomes shouldn't be generated as content at all. v1.1 rejects them outright.

  Also added in v1.1: an explicit context-confirmation workflow step. When a request references a specific real event, CCG confirms that fact came from the requester before generating — it does not infer or assume. Catches the "Tyrese did 4 sessions this week" assumption pattern.

  Generation volume increased: CCG now generates 4-6 candidate drafts internally per request (up from 2-3) because the hard-reject rate eats some output. The reviewer still sees 2-3 surviving drafts. If 3 batches produce 0 survivors, CCG flags the request itself as suspect.

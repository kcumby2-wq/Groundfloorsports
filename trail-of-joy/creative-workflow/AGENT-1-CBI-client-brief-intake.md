# Creative AI Workflow — Agent 1: Client Brief Intake (CBI)
**Version:** 1.2
**Codename:** CBI
**Sequence position:** Agent 1 of N
**Hosting target:** Claude Code + VSCode, versioned in GitHub
**Status:** Schema + workflow spec.

**What changed from v1.1:** One narrowly-scoped addition — `forward_looking_claims_about_minor_subject` is now an auto-inserted prohibited_ai_operation for any brief with minor subjects, alongside the three v1.1 already auto-inserts. Everything else is unchanged. See revision history at end for the full diff.

---

## Why this change

The CCG v1.0 practice run on Capo Track C surfaced a draft that read: *"The kids who get drafted are the kids who keep showing up."* That draft passed the forbidden-word scan and the format check. It was the soft voice check that flagged it as "stronger claim than calibration supports" — but the underlying issue isn't really a voice issue. It's that the draft made a forward-looking recruiting-outcome claim about a minor athlete (Tyrese), and:

1. Marcus may not actually be authorized to make public recruiting/draft claims about Tyrese — Tyrese's parents are the party with that authority, not Marcus
2. Even if Marcus had that authorization, the claim implies a future Tyrese hasn't earned yet, which is reputational risk for Tyrese specifically when he's a junior in high school
3. The same pattern shows up in subtler forms — "future D1 athlete," "next-level prospect," "the kind of kid who ends up on Saturdays" — none of which are technically fabricated but all of which are forward-looking claims about a minor's career outcomes

Relying on the soft voice check to catch this is wrong. The voice check is a stylistic gate, not a safety gate. Forward-looking claims about a minor's future career outcomes should be a structured prohibition — auto-inserted for any minor subject, carried through to SLS, and enforced as a hard check in CCG.

## Changes from v1.1

### Auto-inserted prohibited_ai_operations for minor subjects (v1.2)

Previously (v1.1), CBI auto-inserted three operations into `prohibited_ai_operations` for any brief with minor subjects:

1. `soul_id_training_on_minor_subject` (Track C point 4)
2. `fabricated_scenario_for_real_minor` (Track C point 5)
3. `ai_audio_alteration_of_minor_speech`

CBI v1.2 adds a fourth:

4. **`forward_looking_claims_about_minor_subject_career_outcomes`**
   - **What it covers:** Any generated content (visual or text) that implies, predicts, or claims a specific future outcome for a minor subject — including but not limited to: recruiting results, draft outcomes, college placement, scholarship status, professional careers, NIL deals, future earnings, future on-field performance projections, future ranking, "future [position]," or rhetorical equivalents ("the kind of kid who ends up on Saturdays," "future D1 talent," etc.)
   - **What it does NOT cover:** Statements about a minor's present effort, present results, present mentality, present work ethic — those are fine. The line is between describing what's happening now and predicting what's going to happen later.
   - **Reason auto-inserted:** Track C-adjacent — for the same reasons Soul ID and fabricated scenarios are restricted on minor subjects, forward-looking career claims create a permanent public record of someone else's prediction about a kid's future, made before the kid (or their parents) had the standing to opt in to that prediction being made publicly.

### How this propagates

Same pattern as the existing three:
- CBI inserts it automatically when ANY subject has `is_minor: true`
- User cannot remove it from the brief — validation fails if attempted
- SLS carries it forward verbatim into the Style Lock Document's `prohibited_ai_operations` list
- CCG (per its own v1.1 update, see separate doc) treats it as a hard check, not a soft flag

### Nothing else changes

The full v1.1 schema is otherwise unchanged. The workflow steps are unchanged except for step 4 (apply track-specific halts/restrictions), where the auto-inserted prohibited_ai_operations list now contains four items instead of three for any brief with minor subjects.

## Re-test plan

Re-run the Capo Track C brief through CBI v1.2 and confirm the `prohibited_ai_operations` list now contains four entries (the three from v1.1 plus the new fourth). Then re-feed that updated brief downstream to SLS and CCG.

Since the change is narrow, the existing Capo Track C runs (02-cbi-v1.1-rerun, 03-sls-v1.0, 04-ccg-v1.0) don't need to be fully redone — they just need a one-line patch acknowledging the new prohibition is now upstream. Then CCG's distinctiveness handling and forward-looking-claims handling get their own v1.1 spec.

## Revision History
- **v1.0** — Initial spec. Single subject_of_imagery field, single boolean ready flag, no track field. Surfaced 6 schema gaps via Capo practice runs.
- **v1.1** — Six fixes from v1.0 feedback: structured subjects list, typed model_release_status, per-agent ready_for, explicit track field, prohibited_ai_operations structured list, agent-enforced minor-subject rules.
- **v1.2** — Single targeted addition: `forward_looking_claims_about_minor_subject_career_outcomes` is now an auto-inserted prohibited_ai_operation for any brief with minor subjects. Reason: CCG v1.0 practice run produced a draft making a recruiting-outcome claim about a minor that the soft voice check caught but only barely. That category of claim deserves a structured prohibition, not reliance on stylistic gates.

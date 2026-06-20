# Creative AI Workflow — Agent 5: Distribution & Scheduling (DSC)
**Version:** 1.0
**Codename:** DSC
**Sequence position:** Agent 5 of N
**Hosting target:** Claude Code + VSCode, versioned in GitHub. Platform interaction via Postiz (already available in the connector stack) or direct API where Postiz doesn't cover a platform.
**Status:** Schema + workflow spec.

**Dependencies:**
- Reads an APPROVED `asset_generation_output` from AGV v1.1+ (with `reviewer_decision: APPROVED`)
- Reads the matching `copy_output` from CCG v1.2+ (with a human-selected draft)
- Reads the parent Style Lock + Brief for destination rules and prohibited operations

---

## Why this agent is different from every prior agent in the chain

CBI, SLS, CCG, and AGV all produce artifacts a human reviews. Agent 5 is the first agent that takes an action with real-world consequences at the moment of execution — it posts content to live, public-facing platforms (Instagram, YouTube, TikTok, etc.). Once a post goes out, it's out. There is no "approval" step after the API call.

That changes everything about how this agent should be built:

1. **The approval gate has to happen BEFORE the API call, not after.** AGV and CCG can be designed around "agent produces, human reviews, human approves." DSC has to be designed around "human approves a specific post going to a specific destination at a specific time, then the agent executes exactly that — no scope creep at execution time."

2. **The agent's job is execution fidelity, not creative judgment.** DSC is not deciding what to post. It's not adjusting captions. It's not picking a "better" time than the schedule says. Its entire value is taking a fully-specified post (asset + caption + destination + time + permission to act) and executing it accurately, with a complete audit trail.

3. **Different page populations need different permission models.** This is a structural feature, not a footnote.

## The four page populations and how DSC handles each

| Population | Who owns the account | Auth model | Approval requirement | Audit requirement |
|---|---|---|---|---|
| **Subject Medias / Groundfloorsports company pages** | The company itself (you) | Direct platform credentials, owned by the company | Single approval before scheduling | Standard post log |
| **Individual creator pages — adult creators** | The adult creator themselves | Creator-granted access (OAuth / shared scheduler permissions); explicit written consent on file | Per-post or per-batch approval depending on creator's stated preference | Standard post log + creator notified after each post |
| **Individual creator pages — minor creators (Track A / SubjectSkillz)** | Parent-managed account, per the existing Track A consent agreement | Parent-granted access only; minor creator does not directly authorize platform access for DSC | **Per-post approval from parent (or designated guardian) before scheduling — no batch approval, no standing authorization for an agent to auto-post to a minor's account** | Full audit log with parent visibility — they can see every post DSC made or scheduled, going back |
| **Outside-client pages (Capo's IG, etc. — Track C clients)** | The outside client (adult business owner) | Client-granted access via their preferred mechanism (could be Postiz integration, could be direct OAuth) | Per-batch or per-post per the client's signed service agreement | Full audit log; client retains right to review any post |

**The hard rule** for minor creators: DSC does NOT auto-post to a minor's account, ever, even with standing authorization. Each post is a per-post parent approval. The reason is the same reason every other minor-safety rule in this system exists — a parent's "yes, you can manage my kid's IG" given six months ago shouldn't quietly authorize a post they would have said no to today.

## What DSC produces (per scheduled or executed post)

```yaml
post_record:
  post_id: [unique]
  client_id: [the brand whose page this is going to]
  page_population: [company | adult_creator | minor_creator | outside_client]
  destination_account: [@handle and platform — e.g. "@capo_athletics on instagram"]
  destination_account_owner: [who actually owns the account being posted to]

  lock_version_consumed: [SLS version]
  brief_version_referenced: [CBI version]
  ccg_request_id: [the copy this post used]
  agv_request_id: [the asset this post used]
  built_by: DSC v1.0
  built_at: [ISO timestamp]
  track: [carried forward — A, B, C, or N/A]

  # NEW IN v1.0 — same staleness propagation as SLS v1.1 onward
  stale_lock_warning_surfaced: [true | false]
  halted_due_to_staleness: [true | false]

  post_content:
    asset_file_reference: [from AGV's approved output]
    caption: [from CCG's reviewer-selected draft]
    hashtags: [from CCG]
    cross_posts: [list of additional destinations, if this post mirrors to more than one platform]

  schedule:
    target_post_time: [ISO timestamp — when DSC will execute]
    timezone: [explicit, not assumed]
    scheduled_via: [postiz | direct_api | other]

  approval:
    approval_type: [single_post | batch_of_N | standing_consent_with_per_post_review]
    approved_by: [name of human who approved — required, never blank]
    approved_at: [ISO timestamp]
    approval_scope: [exact destination + content combination; cannot be reused for a different post]
    parent_or_guardian_approval: [for minor_creator population — required to be true, with parent/guardian name]

  execution:
    execution_status: [SCHEDULED | EXECUTED | FAILED | CANCELLED_BY_HUMAN]
    executed_at: [ISO timestamp — when the post actually went live]
    platform_response: [post URL, platform-side ID, error if failed]
    cancellation_reason: [populated only if cancelled]

  audit_trail:
    full_content_snapshot: [the exact caption + asset reference at moment of execution — not pulled by reference, embedded, so future audits can verify what went out, even if upstream files change]
    permissions_used: [which auth credentials/tokens were used to make the API call]
    visibility_to_account_owner: [for minor_creator and outside_client: true — the parent or client can see this record]
```

## DSC's workflow per post

1. **Check upstream staleness (carried-forward pattern from SLS v1.1).** If the Style Lock carries `stale_brief_warning: is_stale: true` AND the destination involves a minor subject or a minor creator's account, **halt** — do not schedule against stale minor-safety constraints. Same rule as CCG v1.2 and AGV v1.1.

2. **Identify the page population.** Look up the destination account in the lock or brief. Determine whether it's a company page, adult creator page, minor creator page, or outside-client page. **This determines the permission model for the rest of the workflow** — there is no path to skip this step.

3. **Verify upstream artifacts are APPROVED.** AGV's `reviewer_decision` must be APPROVED. CCG's draft must be marked as reviewer-selected. If either is missing or in any other state — reject the request to schedule.

4. **Verify approval matches the population's requirements:**
   - Company page → single approval suffices
   - Adult creator page → per-post or per-batch approval, depending on creator's documented preference
   - **Minor creator page → per-post parent/guardian approval, no exceptions. If `parent_or_guardian_approval.given_for_this_specific_post: true` is not in the approval record, halt.**
   - Outside-client page → per the client's service agreement

5. **Snapshot the content.** Take a full embedded copy of caption + asset reference + hashtags + destination at the moment of approval. This becomes the immutable record of what was approved. The audit trail records this exact snapshot, not just references — so if a caption is edited upstream after approval but before scheduled execution, DSC executes the ORIGINALLY APPROVED version, not the edited one, and flags the discrepancy.

6. **Schedule or execute.** If scheduled, use Postiz (or direct API) with the target time. If immediate, execute now.

7. **Capture platform response.** Post URL, platform-side post ID, any errors.

8. **Write the full audit trail.** For minor creator and outside-client populations, ensure the audit record is visible to the account owner (parent or client). This isn't a "they can request it" — it's a "they can see it whenever they want, without asking."

9. **Notify destination owners as configured:**
   - Minor creator's parent → after every post, automatic notification
   - Outside client → per their service agreement (could be after every post, daily digest, or batch summary)
   - Adult creator → per their preference

## What DSC explicitly does NOT do

- **Does not modify content between approval and execution.** Caption typo caught after approval? Cancel, fix in CCG, re-approve, re-schedule. Do not just edit it inline.
- **Does not auto-post to minor creator accounts under standing authorization.** Every post requires per-post parent approval.
- **Does not post to a destination not in the approved upstream artifacts.** If CCG/AGV approved for IG and someone asks DSC to cross-post to TikTok, that's a new approval cycle.
- **Does not execute on a stale lock when minor subjects or minor creators are involved.**
- **Does not retry failed posts automatically.** A failed post surfaces to a human for triage — there are too many reasons a post might fail (platform-side issue, auth expired, content rejected by platform moderation) and silently retrying is often the wrong action.
- **Does not adjust scheduled times for "optimal engagement."** The approved time is the approved time. Engagement optimization is a separate decision that happens at scheduling time with human input, not at execution.
- **Does not cross-platform-translate copy.** If a post was approved for Instagram and someone wants the same post on YouTube, that's a new CCG + AGV cycle for YouTube's format, not a DSC reformat.

## How DSC handles failures

| Failure mode | DSC behavior |
|---|---|
| Platform API auth expired | Halt, notify account owner / company admin to re-auth |
| Platform rejects content (content moderation) | Halt, surface platform's reason, do not retry |
| Approval scope drift detected (content was edited upstream after approval) | Halt, surface the diff, require fresh approval |
| Stale lock detected at execution time | Halt per workflow step 1 |
| Scheduled time arrives but DSC has been offline | Execute on next-available run, OR cancel if scheduled time + grace period (e.g. 30min) has passed — per population: cancel for minor creator accounts (no late-posting without re-approval), execute for company pages |
| Network failure mid-post | Wait for confirmation from platform; if no confirmation in N seconds, surface as ambiguous-state for human triage |

## Why Postiz vs direct API matters

You already have Postiz in your connector stack. Where Postiz supports a platform, use Postiz — it gives you a built-in scheduling UI a human can sanity-check, plus a backout option if a scheduled post needs to be cancelled. Where Postiz doesn't cover a platform (or doesn't support the specific posting type — e.g. YouTube Shorts vs YouTube long-form), DSC can use direct API, but that's a more careful integration because there's no second UI between DSC and the platform.

For minor creator accounts specifically, **Postiz is the strongly preferred integration** because the parent can independently log into Postiz to see the schedule, cancel posts, or revoke access — that visibility is part of what makes per-post parent approval workable at scale, instead of requiring the parent to be in the loop on every single API call directly.

## Feedback loop

1. **Post performance feedback.** Once posts are live, engagement data flows back. Patterns here inform CBI (audience signals), SLS (which aesthetic locks land), and CCG (which voice angles work).
2. **Failure patterns.** What's failing, on which platforms, for which populations? Persistent auth failures might mean a credential management process gap, not a DSC bug.
3. **Approval-to-execution drift.** Any time the snapshot caught a discrepancy between approval and execution, log it — this is a process signal that the human/agent handoff has too many edit points.
4. **Cross-population learnings DO NOT flow.** Engagement patterns on Subject Medias' company page do not get auto-applied to a Capo (Track C client) post. The feedback loops are kept population-isolated unless a human explicitly decides to apply a finding across.

## Practice test plan

Run DSC v1.0 against three scenarios (all simulation — no real API calls in practice):

1. **Subject Medias company page post** — approved caption (CCG output) + approved asset (AGV output) + scheduled to IG. Expected: clean schedule, single-approval model, standard audit log.

2. **Carson's IG account (minor creator)** — same setup, but destination is Carson's @cmcvisualz personal page. Expected: DSC halts at step 4 unless `parent_or_guardian_approval.given_for_this_specific_post: true` is present. Halt is the correct behavior.

3. **Capo's IG account (Track C outside client)** — destination is Capo's brand page, content involves Tyrese. Expected: DSC checks Capo's service agreement, requires per-post or per-batch client approval per that agreement's terms, ensures Capo can see the audit log going forward.

If all three behave as specified, DSC v1.0 holds.

## Honest scoping for v1.0

This agent's actual implementation is more substantive than the prior four, because it has to handle real auth credentials, real platform APIs, and real failure modes. A few things I'm explicitly NOT trying to fully spec in v1.0:

- **The credential/auth management itself.** Where Postiz handles it, that's its job. Where direct API integration is needed, the auth model has to be designed at integration time, per platform, with proper secrets management. I'm not pretending to specify that here.
- **Per-platform format quirks.** IG Reels vs IG carousels vs YouTube Shorts vs TikTok all have different upload requirements. v1.0 specifies that DSC handles whatever Postiz handles; for direct API cases, each platform integration becomes its own sub-spec.
- **Engagement analytics and feedback.** v1.0 specifies that engagement data flows back into the feedback loop, but the actual mechanism (which API, how often pulled, how stored) is integration-time work, not spec work.

## Exit gate for DSC v1.0

- [ ] Schema produced and version-controlled
- [ ] Practice simulation against the three scenarios behaves as expected
- [ ] No path exists for an auto-post to a minor creator's account without per-post parent approval
- [ ] No path exists for content to be modified between approval and execution without a fresh approval cycle
- [ ] Audit trail captures full content snapshots, not just references
- [ ] Postiz is the default integration where available; direct API only where Postiz doesn't cover

## Revision History

- **v1.0** — First spec for Distribution & Scheduling. The first agent in the workflow that takes a real-world action with permanent consequences at the moment of execution. Four-population permission model (company / adult creator / minor creator / outside client) is structural, not a footnote. Per-post parent approval required for minor creator accounts, no exceptions, no standing authorization. Content snapshot at approval ensures execution fidelity. Postiz is the preferred integration where available. Inherits the version-check / staleness-halt pattern from SLS v1.1, CCG v1.2, AGV v1.1.

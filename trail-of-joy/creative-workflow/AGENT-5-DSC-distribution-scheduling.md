# Creative AI Workflow — Agent 5: Distribution & Scheduling (DSC)
**Version:** 1.1
**Codename:** DSC
**Sequence position:** Agent 5 of N
**Hosting target:** Claude Code + VSCode, versioned in GitHub. Platform interaction via Postiz (already available in the connector stack) or direct API where Postiz doesn't cover a platform.
**Status:** Schema + workflow spec.

**Dependencies:**
- Reads an APPROVED `asset_generation_output` from AGV v1.1+
- Reads the matching `copy_output` from CCG v1.2+ (with a human-selected draft)
- Reads the parent Style Lock + Brief for destination rules and prohibited operations

**What changed from v1.0:** Two fixes from the practice run:

1. **Source population is now a structural concept alongside destination population.** v1.0 only modeled where content was going, not where it came from. The practice run exposed that "Capo's content posted to Subject Medias' page" is a meaningful case that v1.0 didn't handle — DSC needs to know both the source (who the content was created for, under what agreement) and the destination (who the page belongs to, under what permission model) and apply rules to the relationship between them.

2. **Stale-Halt Recovery Workflow is now documented.** v1.0's step 1 halt fires correctly but doesn't tell anyone how to get unstuck. v1.1 adds a small documented recovery path so a halt isn't a dead end.

---

## Why this agent is different from every prior agent in the chain

(unchanged from v1.0)

CBI, SLS, CCG, and AGV all produce artifacts a human reviews. DSC is the first agent that takes an action with real-world consequences at the moment of execution. The approval gate happens BEFORE the API call, not after. The agent's job is execution fidelity, not creative judgment.

## Population model — sources AND destinations (v1.1)

DSC now models both sides of every post.

**Destination populations** (where the post goes — unchanged from v1.0):

| Population | Who owns the account | Auth | Approval | Audit |
|---|---|---|---|---|
| Subject Medias / Groundfloorsports company page | The company | Direct platform credentials | Single approval | Standard log |
| Adult creator page | The adult creator | Creator-granted OAuth | Per-post or per-batch | Log + creator notified |
| Minor creator page (Track A) | Parent-managed | Parent-granted only | **Per-post parent approval, no exceptions, no standing authorization** | Full log with parent visibility |
| Outside-client page (Track C) | The client | Client-granted | Per their service agreement | Full log; client retains review right |

**Source populations** (where the content originated — NEW in v1.1):

| Source | What it means |
|---|---|
| `internal` | Content was created for the operator's own brand (Subject Medias, Groundfloorsports) — no upstream client agreement |
| `track_a_creator` | Content was created for/by a SubjectSkillz minor creator under Track A consent |
| `track_b_athlete` | Content was created by Groundfloorsports filming a Track B athlete; GFS owns footage per the licensing agreement |
| `track_c_client` | Content was created for an outside Track C client (e.g. Capo), under their service agreement, possibly featuring minor subjects |

## The cross-population rule (the substance of v1.1)

When source and destination are different populations, **the post is a cross-population repost** and the source's permissions must explicitly cover the destination. Source consent does not implicitly transfer.

Specific rules:

1. **Same-population posts** (e.g. Subject Medias content → Subject Medias page) — proceed normally per the destination population's rules.

2. **`track_c_client` source → any non-client destination** (e.g. Capo content → Subject Medias page) — requires explicit reposting permission in the client's Track C service agreement. If the agreement doesn't explicitly say "Trail of Joy may repost this content to its own brand pages," HALT and request the client confirm or amend. **This applies even when no minor subject is in frame** — it's a brand/IP issue first, a safety issue second.

3. **`track_c_client` source involving minor subjects → any non-client destination** — adds a second hard rule on top of #2: the minor subjects' parent-signed releases (held by the client per Track C) must explicitly cover use beyond the client's own marketing. Most existing releases don't. If the release scope is "promotional and marketing materials produced by or on behalf of Capo Athletics" (as in the practice-case template), that does NOT cover Subject Medias reposting. HALT.

4. **`track_a_creator` source → operator destination** (e.g. Carson's content reposted on Subject Medias) — requires Track A consent agreement to explicitly cover reposting by Trail of Joy. The existing Track A consent agreement covers Carson's work as a creator on his own storefront; whether it covers Subject Medias reposting Carson's work is a separate question. v1.1 default: HALT and require explicit per-piece parent confirmation until/unless the Track A agreement is amended to address this.

5. **`track_b_athlete` source → operator destination** — GFS already owns this footage per the licensing agreement, so reposting on Subject Medias is permitted by ownership. Still subject to the flat-fee licensing fee IF the use is commercial (defined in the agreement); reposting to a brand's organic social feed is generally not "commercial use" under the agreement's definition, but if a specific reuse crosses that line (e.g. a paid ad), the licensing fee triggers and that becomes a billing event, not just a posting event.

6. **`internal` source → any destination** — proceed normally; no cross-population concerns.

## What DSC produces (v1.1 schema)

```yaml
post_record:
  post_id: [unique]
  client_id: [the brand whose page this is going to]

  # NEW IN v1.1 — both sides of the post are now first-class fields
  source_population: [internal | track_a_creator | track_b_athlete | track_c_client]
  source_client_id: [if source is a client, which client]
  destination_population: [company | adult_creator | minor_creator | outside_client]
  destination_account: [@handle and platform]
  destination_account_owner: [who owns the account]

  # NEW IN v1.1 — derived from source vs destination
  is_cross_population_repost: [true | false]
  cross_population_permission_check: [PASSED | FAILED | NOT_APPLICABLE]
  cross_population_permission_basis: [if PASSED, what authorizes this — service agreement clause, parent confirmation, etc.; if FAILED, what's missing]

  lock_version_consumed: [SLS version]
  brief_version_referenced: [CBI version]
  ccg_request_id: [the copy this post used]
  agv_request_id: [the asset this post used]
  built_by: DSC v1.1
  built_at: [ISO timestamp]
  track: [carried forward]

  stale_lock_warning_surfaced: [true | false]
  halted_due_to_staleness: [true | false]

  post_content:
    asset_file_reference: [from AGV's approved output]
    caption: [from CCG's reviewer-selected draft]
    hashtags: [from CCG]
    cross_posts: [list of additional destinations, if mirroring]

  schedule:
    target_post_time: [ISO timestamp]
    timezone: [explicit, not assumed]
    scheduled_via: [postiz | direct_api | other]

  approval:
    approval_type: [single_post | batch_of_N | standing_consent_with_per_post_review]
    approved_by: [name of human who approved — required]
    approved_at: [ISO timestamp]
    approval_scope: [exact destination + content combination]
    parent_or_guardian_approval: [for minor_creator destination — required]
    # NEW IN v1.1 — second approval for cross-population reposts
    cross_population_repost_approval:
      required: [true | false]
      given: [true | false | not_applicable]
      basis: [text — what specifically authorizes this cross-population use]

  execution:
    execution_status: [SCHEDULED | EXECUTED | FAILED | CANCELLED_BY_HUMAN | HALTED]
    executed_at: [ISO timestamp]
    platform_response: [post URL, platform-side ID, error if failed]
    cancellation_reason: [populated only if cancelled or halted]

  audit_trail:
    full_content_snapshot: [embedded caption + asset reference + destination at moment of approval]
    permissions_used: [auth credentials used for the API call]
    visibility_to_account_owner: [for minor_creator and outside_client destinations: true]
    # NEW IN v1.1
    source_population_at_snapshot: [embedded — so future audits can verify the source classification at the moment of approval]
    cross_population_permission_evidence: [embedded — the specific contract clause or parent confirmation that authorized this cross-population repost, if applicable]
```

## DSC's workflow per post (v1.1)

1. **Check upstream staleness.** If the Style Lock carries `stale_brief_warning: is_stale: true` AND the destination involves a minor subject or a minor creator's account, halt. See "Stale-Halt Recovery Workflow" section below for what to do after a halt.

2. **Identify BOTH source and destination populations (NEW in v1.1).**
   - Source: which population the content was created for/under. Look at the brief — `track` field plus `client_id` give you the source population.
   - Destination: which population owns the account being posted to. Look at the destination account configuration.
   - Compute `is_cross_population_repost`: true if source population != destination population (with the same-client carve-out: posting a `track_c_client` source to that same client's destination is NOT a cross-population repost).

3. **Verify upstream artifacts are APPROVED.** AGV `reviewer_decision: APPROVED`. CCG draft marked reviewer-selected. If either is missing — reject the request.

4. **Run the cross-population permission check (NEW in v1.1).** If `is_cross_population_repost: true`, apply the appropriate rule from the table above. If the check FAILS — halt. Halt with the specific missing-permission item named, so a human can address it (amend the service agreement, get per-piece parent confirmation, etc.).

5. **Verify destination-side approval matches the destination population's requirements:**
   - Company page → single approval
   - Adult creator page → per-post or per-batch per stated preference
   - Minor creator page → per-post parent/guardian approval, no exceptions
   - Outside-client page → per the client's service agreement

6. **Snapshot the content** (caption + asset + destination + schedule + source/destination classification + cross-population permission evidence). Embedded, not referenced, so future audits can verify exactly what was approved including the cross-population reasoning.

7. **Schedule or execute** via Postiz (or direct API).

8. **Capture platform response.**

9. **Write the full audit trail.** For minor creator destinations and outside-client destinations, ensure visibility to the account owner is automatic.

10. **Notify destination owners as configured.**

## Stale-Halt Recovery Workflow (new in v1.1)

When DSC halts on staleness (per step 1), here's the documented recovery path so the halt isn't a dead end:

1. **Identify what's stale.** The `stale_brief_warning` carried in the lock will name the specific change between the brief's version and current CBI (e.g. "v1.2 added forward_looking_claims_about_minor_subject_career_outcomes as auto-inserted prohibited operation").

2. **Re-run CBI on the original intake source material** to produce a brief at the current CBI version. Most of the brief will be unchanged; the change is whatever CBI v1.x added.

3. **Re-run SLS on the fresh brief** to produce a new Style Lock. Most of the lock will be unchanged.

4. **Decide whether existing CCG and AGV outputs are still valid** against the new lock. In most cases involving narrow CBI version bumps, they will be — the new constraint may not affect the specific content already approved. If they ARE still valid (no new prohibited operations violated), they can be reused.

5. **If existing CCG/AGV outputs are NOT still valid** against the new lock (the new prohibition catches the existing content), re-run CCG and/or AGV with the updated constraint set.

6. **Re-approach DSC with the same content + fresh lock.** DSC's step 1 check will now pass.

**Honest scoping:** this recovery workflow is documented; whether it's mechanically automated (a script that re-runs the chain) or done by hand (operator re-runs each agent manually) is an integration question, not a spec question. v1.1 just makes the path explicit so a halt isn't a mystery.

## What DSC explicitly does NOT do

(carried from v1.0, plus v1.1 additions)

- Does not modify content between approval and execution.
- Does not auto-post to minor creator accounts under standing authorization.
- Does not post to a destination not in the approved upstream artifacts.
- Does not execute on a stale lock when minor subjects or minor creators are involved.
- Does not retry failed posts automatically.
- Does not adjust scheduled times.
- Does not cross-platform-translate copy.
- **(v1.1) Does not execute a cross-population repost without explicit permission evidence.** The cross-population permission check at step 4 is a hard gate; it does not have a "skip for now" path.

## How DSC handles failures (unchanged from v1.0)

| Failure mode | DSC behavior |
|---|---|
| Platform API auth expired | Halt, notify for re-auth |
| Platform rejects content | Halt, surface reason, do not retry |
| Approval scope drift detected | Halt, surface diff, require fresh approval |
| Stale lock detected at execution time | Halt; recovery via the documented Stale-Halt Recovery Workflow (new in v1.1) |
| Scheduled time passed while offline | Cancel for minor creator destinations; execute for company within 30min grace |
| Network failure mid-post | Wait for platform confirmation; ambiguous-state goes to human triage |

## Why Postiz vs direct API (unchanged from v1.0)

Use Postiz where it supports the platform. Direct API only where Postiz doesn't cover. For minor creator destinations specifically, Postiz is strongly preferred because parent independent visibility is part of what makes per-post approval scalable.

## Feedback loop (v1.1 additions)

1. Post performance feedback (unchanged)
2. Failure patterns (unchanged)
3. Approval-to-execution drift (unchanged)
4. Cross-population learnings DO NOT flow (unchanged)
5. **(v1.1) Cross-population permission failures.** Every time step 4 halted because permission wasn't on file, log it — patterns here tell you which client agreements need amending, which Track A consent language needs revisiting.
6. **(v1.1) Stale-halt recovery time.** How long does it take to recover from a halt (from halt to re-approach)? If it's painful, that's a signal the upstream version-bump process should be more deliberate about backward compatibility.

## Practice test plan (v1.1)

Re-run the three v1.0 scenarios through v1.1, plus one new scenario specifically targeting the cross-population case:

**Scenario 4 (NEW) — Capo Track C content (Tyrese-focused asset) posted to Subject Medias' company page.**
- Source population: `track_c_client` (Capo)
- Destination population: `company` (Subject Medias)
- Expected: cross-population permission check at step 4 fires. Capo's service agreement language must explicitly cover Subject Medias reposts. Even if Capo says yes, the underlying parent-signed releases held by Capo for Tyrese must cover use beyond Capo's marketing. If both are not in place — HALT.
- This is the case v1.0 missed.

## Exit gate for DSC v1.1

- [ ] Source population is now a first-class field; populated correctly from upstream brief
- [ ] Cross-population repost detection works correctly across the population matrix
- [ ] Cross-population permission check halts on missing permission evidence
- [ ] Stale-Halt Recovery Workflow is documented and reachable from any halt
- [ ] All v1.0 exit-gate items remain true

## Revision History

- **v1.0** — First spec. Four-population destination model. Per-post parent approval required for minor creator destinations. Content snapshot at approval. Postiz preferred integration. Inherits version-check / staleness-halt pattern from upstream agents.

- **v1.1** — Two fixes from practice-run findings:
  1. **Source population is now a structural concept alongside destination population.** Cross-population reposts (e.g. Capo content → Subject Medias page) are now explicitly modeled with a permission-check rule per source-destination pair. The v1.0 spec implicitly assumed source = destination, which was wrong.
  2. **Stale-Halt Recovery Workflow is documented.** v1.0's step 1 halt fires correctly but didn't tell anyone how to recover. v1.1 lays out the upstream re-run sequence so a halt has a known unstick path.

# Stage 7 — Automation System: CMC Visuals (Carson McCauley)
**Status: SIMULATED / PRACTICE DOCUMENT** for the parts that are gaps. The backend code referenced below was genuinely built and pushed to `kcumby2-wq/cmc-visuals` earlier in this project — that part is real. What's simulated is (a) whether it's been pointed at live Stripe/GHL credentials and test-run, which has NOT happened, and (b) the new automations proposed to fill gaps, which are drafts only.

**Per the minor-safety gate:** no automation that touches public posting may exist regardless of signature status (that's permanent, not a temporary gate). Automations that touch payment/delivery still require `consent-agreement-signed.md` before going live, same as stages 6 and 9.

---

## Part A — What's already built (real code, untested against live keys)

| Trigger | Action | Built? | Live-tested? |
|---|---|---|---|
| Customer completes Stripe Checkout | Webhook creates `orders` row, splits 80/20 to Carson's Connect account | Yes — `backend_stripe` route | No — Stripe test loop pending in Claude Code |
| Order created | Confirmation email sent to buying family | Yes — email lib | No |
| Subscription created/active | HighLevel bridge tags subscriber, grants community access | Yes — `highlevelBridge` route | No |
| Subscription payment fails | Dunning sequence begins (grace period, retry, then revoke) | Yes — `dunning` route | No |
| Subscription cancelled/lapsed | HighLevel bridge removes tag, revokes access | Yes — same bridge route | No |
| Parent submits onboarding form | Creates Stripe Connect Express account for the minor's guardian-controlled payouts | Yes — `onboard` route | No |

**Honest read:** the mechanical chain from "customer pays" to "creator gets paid and family gets notified" is fully coded. None of it has been run with real (even test-mode) Stripe keys yet — that's the Claude Code handoff from earlier, still outstanding.

## Part B — Gaps identified (proposed, not built)

1. **No event-reminder automation.** Nothing currently notifies Carson 24hr before a booked event that he's expected to show up and shoot. Proposed: a calendar-based reminder (Google Calendar event + automated SMS/email 24hr prior). Low complexity, would reuse the existing email lib.
2. **No "72hr SR-upsell timer" as code — only as a content draft.** Stage 6's SR upsell email exists as copy, but nothing currently schedules it to fire 72hr after delivery. Proposed: a delayed job (or a simple cron-style check) keyed off the `orders.delivered_at` timestamp.
3. **No content-approval queue.** Per the consent agreement, public posting must be human-decided. Right now there's no structured place to log "this photo was reviewed against Section 2 and cleared for public use." Proposed: a simple `content_clearance` table (photo/clip reference, event, cleared_by, cleared_at, public_or_private) — not to automate posting, but to create the audit trail the consent agreement implies should exist. This is new scope, not yet in the schema.

## Part C — Explicitly excluded, permanently (not a "not yet," a "never automatically")

- **Auto-posting any event footage publicly.** No webhook, cron, or trigger of any kind selects and posts content to Instagram/TikTok/the storefront without a human choosing that specific piece, every time. This is a permanent architectural rule from the consent agreement, not a stage-7 gap to fill later.
- **Auto-sending the membership pitch email** drafted in stage 6 — flagged there as not ready to send until real cohort programming exists to describe.

## Exit gate
- **Mechanically specced:** yes — existing automations documented, gaps identified, exclusions stated.
- **Actually green:** no. Two independent blockers: (1) the Stripe test loop has never been run, so "automations work" is unverified; (2) the minor-safety gate requires the signed consent agreement before any of Part A goes live for real transactions involving Carson.

## Revision History
- v1.0 (SIMULATED) — Documents existing built code, proposes three gap-fill automations, and restates the permanent public-posting exclusion from the consent agreement.

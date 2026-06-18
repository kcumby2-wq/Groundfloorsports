# Trail of Joy — Agent SOP: Campaign Deploy (Standalone Interface + Backend)
**Agent codename:** CAMPAIGNER
**Version:** 1.0
**Scope:** Campaigns that do NOT use GoHighLevel. Custom landing page + Supabase + Stripe via GitHub -> Vercel.

## Principles
1. Clarify GHL vs standalone first. If GHL -> stop, route to GHL agent.
2. One repo, one project, one domain. Verify against Vercel reality.
3. Evidence or it didn't happen.
4. Secrets never transit chat.
5. Every run feeds the loop.

## GHL vs Standalone routing
| Scenario | Route |
|---|---|
| Custom UI not in GHL | CAMPAIGNER |
| Custom Supabase data model | CAMPAIGNER |
| Standalone admin dashboard | CAMPAIGNER |
| One-off event/athlete page | CAMPAIGNER |
| GHL funnels + CRM + payments | GHL agent (future) |
| GHL CRM + custom front-end | CAMPAIGNER front-end + GHL sync |
Rule: custom code on Vercel = CAMPAIGNER.

## Phases
- A: Discover & map
- B: Build artifacts
- C: Wire backend
- D: Commit & deploy via Github MCP:push_files (agent-executed)
- E: Configure secrets (human)
- F: QA verification

## Definition of DONE
- D1. Confirmed standalone. Single project owns domain + API routes.
- D2. Canonical artifacts at correct served path.
- D3. Newest deploy READY.
- D4. Live page renders.
- D5. Forms -> Supabase verified.
- D6. Stripe webhook verified OR deferred with written reason.
- D7. Env vars present. No secret in chat.
- D8. RLS verified.
- D9. Obsolete files retired.
- D10. Project Record + Loop entry written.

## Revision History
- v1.0 -- Initial. Forked from DEPLOYER v1.0. GHL routing added. D6 deferral. Phase D agent-executed.

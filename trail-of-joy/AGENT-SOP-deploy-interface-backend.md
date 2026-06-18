# Trail of Joy — Agent SOP: Deploy Custom Interface + Backend
**Agent codename:** DEPLOYER
**Version:** 1.1
**Scope:** One static/Next.js front-end + Supabase + Stripe, shipped via GitHub -> Vercel.

## Changes in v1.1
- Phase D: agent now commits files directly via Github MCP:push_files. No human upload needed.
- GHL routing: if campaign uses GHL, use CAMPAIGNER SOP instead.

## Phases
- A: Discover & map (Vercel confirm domain, repo, served path from deploy metadata)
- B: Build artifacts (HTML, wire creds, validate)
- C: Wire backend (confirm tables + RLS, place webhook)
- D: Commit & deploy via Github MCP:push_files (agent-executed)
- E: Configure secrets (human enters in Vercel, registers Stripe webhook)
- F: QA verification (hand off to QA agent)

## Definition of DONE
- D1. Single project owns domain + API routes.
- D2. Canonical artifacts at correct served path.
- D3. Newest deploy READY (tool-confirmed).
- D4. Live page renders (human confirmed).
- D5. Forms -> Supabase verified by test submission.
- D6. Stripe webhook 200 + paid flip verified. OR deferred with written reason.
- D7. All env vars present. No secret in chat (or rotated).
- D8. RLS verified on all tables.
- D9. Obsolete files retired or deferred.
- D10. Project Record + Loop entry written.

## Revision History
- v1.0 -- Initial. Human-executed file commits.
- v1.1 -- Phase D agent-executed via GitHub MCP. CAMPAIGNER forked for campaigns.

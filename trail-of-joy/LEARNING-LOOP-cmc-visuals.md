# Trail of Joy — Learning Loop Ledger (CMC Visuals build)

## 2026-06 / CMC Visuals / CAMPAIGNER v1.0 — full-stack creator template

**context:** First full-stack build through the agent system. CMC Visuals is the proof-of-concept for the SubjectSkillz creator template — a reusable storefront + backend that clones per creator via one config file or the parent onboarding flow.

**what shipped (agent-executed):**
- New isolated Supabase project schema (creator network, multi-tenant) on project zrhblsrtyilpopqjengp — separate from Subject Report data
- Tables: creators, orders, subscriptions, quotes, coaching_members, webhook_events — with RLS (anon can only insert quotes; all reads server-side, role-scoped)
- Imported 19 real CMC customers + 2 subscriptions ($2,048.75 gross) as seed data
- Full Next.js app-router codebase pushed to new repo kcumby2-wq/cmc-visuals:
  - Storefront with Stripe Connect checkout (80/20 split)
  - Parent onboarding flow (provisions kid's Connect account, guardian controls payouts)
  - Role-scoped dashboard (creator/parent/admin per scope.js)
  - 4 API routes + webhook (idempotent, signature-verified, dunning-aware)
  - HighLevel community bridge + email libs + config validator

**surprises:**
- Supabase org at 2-free-project limit → reused the existing empty second project instead of creating new
- GitHub MCP can push to repos but CANNOT create them (separate permission scope) → user created the empty repo manually, agent pushed
- GitHub returned a transient 503 mid-push → retry succeeded

**human_steps_that_blocked_autonomy:**
- Creating the new GitHub repo (MCP lacks repo-creation scope)
- Stripe Connect testing (live money — needs Claude Code to run + test, can't verify in chat)
- Entering env vars + registering webhook (correctly human-gated secrets)

**deliberate human (by design — the protected 20%):**
- The two sales calls (discovery + onboarding)
- SubjectSkillz 1-on-1s and group cohorts
- Final go-live approval

**autonomy_delta:** First end-to-end full-stack build where the agent wrote AND committed the entire codebase. DB schema applied + verified autonomously via Supabase connector. CAMPAIGNER proven at ~80% on a real full-stack build (matches the user's stated 80% comfort line — interpersonal 20% protected on purpose).

**handoff to Claude Code:** run npm install, fill .env.local, npm run validate, npm run dev, then execute the Stripe TEST-mode checklist in DEPLOY.md before pointing a domain. D6 (payment verified) stays open until that test loop passes.

**open items:**
- CMC creator.config.js still has REPLACE placeholders (connectedAccountId, emails) — filled via /onboard or manually
- Stripe Connect test loop (Claude Code)
- Domain decision: cmcvisuals.com → its own Vercel project
- Subject Media community tier Stripe price IDs + HL webhook URL not yet set

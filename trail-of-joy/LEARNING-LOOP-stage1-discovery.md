# Loop Entry — Discovery Form + Demo Deploy (pipeline stage 1)

## 2026-06 / Trail of Joy pipeline / TOJ-ARCHITECT

**shipped:**
- Stage 1 discovery form (`/discovery` in cmc-visuals) — outputs intake JSON that feeds ECO-STRAT (stage 2). Front door to the company factory.
- Demo-deploy path defined: import cmc-visuals to Vercel, add test env vars, preview URL serves storefront + /discovery + /onboard for client calls. No real domain needed.

**token-efficiency proof:** single-file diffs, reused existing repo + schema, no whole-file regeneration. Pipeline token rules held.

**pipeline gates:**
- Stage 1 (Discovery Form): GREEN — artifact built
- Demo deploy: PENDING USER — needs Vercel import + test env vars (manual, one-time)
- Stage 2 (ECO-STRAT analysis): NEXT — consumes discovery JSON

**open items:**
- Stripe test keys into Vercel → enables /onboard + checkout in demo
- Claude Code Stripe test loop (D6)
- Build stage 2 ECO-STRAT as a repeatable analysis step

**autonomy note:** demo can be shown on calls now (storefront + flows visible). Live payment in demo waits on test keys + Claude Code verification — the protected money layer, by design.

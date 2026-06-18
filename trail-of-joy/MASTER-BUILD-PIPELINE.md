# Trail of Joy — Master Build Pipeline (Company Factory)
**Version:** 1.0
**Scope:** The canonical, repeatable pipeline for standing up ANY company under Trail of Joy — from discovery call to live portal to ongoing optimization. CMC Visuals was the first run; this generalizes it.

## The 10 stages
Each stage has an OWNER agent, an INPUT (the prior stage's output), a deliverable, and a binary exit gate. No stage starts until the prior gate is green.

| # | Stage | Owner agent | Input → Deliverable | Exit gate |
|---|---|---|---|---|
| 1 | **Discovery Form** | (human call) + SALES-OP | client answers → structured intake JSON | All required fields captured; client confirms |
| 2 | **Claude Analysis** | ECO-STRAT | intake → ecosystem-fit + revenue model + risks | Fit scored, model + top risks written |
| 3 | **WorldBuild Bible** | TOJ-ARCHITECT | analysis → brand/voice/offer/audience doc | Bible covers identity, voice, offers, audience |
| 4 | **SubjectOS Classification** | TOJ-ARCHITECT | bible → which TOJ template + agents apply | Template chosen (storefront / portal / media); GHL-or-standalone routed |
| 5 | **GHL Blueprint** | TOJ-ARCHITECT | classification → pipelines, tags, stages, automations map | Contact types, pipeline stages, tags, triggers defined |
| 6 | **Content System** | CONTENT-ENG + JOURNALIST | bible voice → templates: emails, posts, sequences | Voice skill + starter content set produced |
| 7 | **Automation System** | TOJ-AGENT-BUILD | blueprint → webhooks, bridges, schedules | All automations specced + built (code committed) |
| 8 | **Onboarding Package** | OFFER-BUILD + SALES-OP | offers → proposal, pricing, agreement, welcome flow | Package ready to send; payment + consent wired |
| 9 | **Client Portal** | CAMPAIGNER | template + config → deployed storefront/dashboard | Deployed READY; data path + payment verified (D-checklist) |
| 10 | **Monthly Optimization** | QA + ECO-STRAT | live metrics → report + next-month priorities | Report produced; loop entry; SOP version bump if earned |

## Reusable assets (the foundation — don't rebuild)
- **cmc-visuals repo** = the storefront/portal template. New company = new config + new connected account.
- **Supabase creator-network schema** (multi-tenant, RLS) = the data model for any creator/client network.
- **Stripe Connect + parent/guardian onboarding flow** = any company where money splits to a third party.
- **HighLevel bridge + dunning** = any subscription → community access.
- **trail-of-joy SOPs** (DEPLOYER, CAMPAIGNER, QA + 15 skills) = the agent library.

## Token-efficiency rules (so the agent gets expert + cheap)
1. **Reuse before rebuild.** Each new company forks cmc-visuals; only the config changes. Never regenerate the stack.
2. **Schema is fixed.** The creator-network schema is the standard. Add columns, don't redesign.
3. **Verify with tools, not prose.** Pull deploy/DB state via connectors; don't re-explain known facts.
4. **Diff, don't dump.** When editing, change the specific lines; never re-emit whole files unless creating.
5. **One batched question** at each stage gate, only for what can't be inferred from the intake or prior stages.

## Definition of DONE (a company is "stood up")
- [ ] All 10 stage gates green
- [ ] Portal deployed READY; payment + data paths verified (Stripe TEST loop passed)
- [ ] GHL pipeline live with contact types + automations
- [ ] Content starter set + voice skill in repo
- [ ] Onboarding package sendable
- [ ] Project Record + Loop entry written; monthly optimization scheduled

## The protected interpersonal layer (never automated)
Discovery call, onboarding call, cohorts, 1-on-1s, final go-live approval, anything touching secrets/money/destruction. Target: 95% of mechanical work automated; this layer stays human by design.

## Revision History
- **v1.0** — Pipeline formalized from the CMC Visuals build. Maps all 10 stages to owner agents and reusable assets. Establishes token-efficiency rules so the pipeline compounds toward expert, low-cost repeat builds.

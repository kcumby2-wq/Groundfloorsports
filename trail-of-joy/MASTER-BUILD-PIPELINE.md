# Trail of Joy — Master Build Pipeline (Company Factory)
**Version:** 1.2
**Scope:** The canonical, repeatable pipeline for standing up ANY company under Trail of Joy — from discovery call to live portal to ongoing optimization. CMC Visuals was the first run; this generalizes it.

**What changed in v1.2:** Added one clarifying sentence under "Reusable assets" addressing Gap #9 from the Track A hypothetical run: the CBI→SLS→CCG→AGV→DSC creative workflow serves outside clients of Subject Medias' creative services (Track C), not the SubjectSkillz creator program (Track A). This was implicit before; v1.2 makes it explicit so it's not rediscovered as a question every time someone reads this pipeline alongside the creative workflow docs.

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

## MINOR-SAFETY GATE (hard block — applies to every stage, every company)
If the client or creator on file is a minor, OR if the company's work product is reasonably likely to include images/video of minors who are *not* the client (event coverage, team shoots, group content), the following is a **hard gate**, not a checklist item:

- **No stage 6 (Content), stage 7 (Automation), or stage 9 (Client Portal/go-live) may proceed** until a signed parent/guardian agreement exists that covers: (a) consent for the creator's own minor-status data and likeness, and (b) the creator's process for obtaining consent from the *other* families whose minors appear in event/team footage before that footage is used publicly or sold.
- This consent record is a real, dated, parent-signed artifact — not a checkbox in a SOP doc. It lives in the company's pipeline-runs folder as `consent-agreement.md` (or signed PDF) before the gate is marked green.
- Any pipeline doc, WorldBuild Bible, or config file describing a minor should use general location (city/region) rather than precise home address/suburb, and should avoid aggregating identity details (real name + exact location + school/team + financial account) into a single artifact beyond what the business purpose requires.
- Research into a minor's existing public presence (social accounts, portfolio, etc.) should happen with the parent's awareness, not unilaterally — surface findings to the parent/owner rather than treating it as routine OSINT.

## Reusable assets (the foundation — don't rebuild)
- **cmc-visuals repo** = the storefront/portal template. New company = new config + new connected account.
- **Supabase creator-network schema** (multi-tenant, RLS) = the data model for any creator/client network.
- **Stripe Connect + parent/guardian onboarding flow** = any company where money splits to a third party.
- **HighLevel bridge + dunning** = any subscription → community access.
- **trail-of-joy SOPs** (DEPLOYER, CAMPAIGNER, QA + 15 skills) = the agent library.
- **(v1.2) The CBI → SLS → CCG → AGV → DSC creative workflow** (`creative-workflow/`) serves outside clients of Subject Medias' creative services (Track C engagements — businesses like Capo Athletics or Verde Athletics paying for AI-assisted creative work). It does NOT serve SubjectSkillz creators (Track A) — those creators (Carson-style) run their own content and write their own captions; the creative workflow doesn't touch their day-to-day. If a SubjectSkillz creator's work is ever featured in something Subject Medias itself produces (a "meet the creators" piece, an operator-page repost), that's governed by the Track A consent agreement's Section 5 (Operator-Side Reposting) and the per-project consent path in `TRACK-A-OPERATOR-PRODUCED-CONTENT-CONSENT.md` — not by routing the creator through the Track C creative workflow.

## Token-efficiency rules (so the agent gets expert + cheap)
1. **Reuse before rebuild.** Each new company forks cmc-visuals; only the config changes. Never regenerate the stack.
2. **Schema is fixed.** The creator-network schema is the standard. Add columns, don't redesign.
3. **Verify with tools, not prose.** Pull deploy/DB state via connectors; don't re-explain known facts.
4. **Diff, don't dump.** When editing, change the specific lines; never re-emit whole files unless creating.
5. **One batched question** at each stage gate, only for what can't be inferred from the intake or prior stages.

## Definition of DONE (a company is "stood up")
- [ ] All 10 stage gates green
- [ ] Minor-safety gate green if applicable (signed parent consent agreement on file)
- [ ] Portal deployed READY; payment + data paths verified (Stripe TEST loop passed)
- [ ] GHL pipeline live with contact types + automations
- [ ] Content starter set + voice skill in repo
- [ ] Onboarding package sendable
- [ ] Project Record + Loop entry written; monthly optimization scheduled

## The protected interpersonal layer (never automated)
Discovery call, onboarding call, cohorts, 1-on-1s, final go-live approval, anything touching secrets/money/destruction, and any minor-consent conversation. Target: 95% of mechanical work automated; this layer stays human by design.

## Revision History
- **v1.0** — Pipeline formalized from the CMC Visuals build. Maps all 10 stages to owner agents and reusable assets. Establishes token-efficiency rules so the pipeline compounds toward expert, low-cost repeat builds.
- **v1.1** — Added minor-safety gate as a hard block across stages 6/7/9, applying to any company whose creator is a minor or whose footage may include other minors. Requires a real signed consent artifact, not a checklist line. Restricts how minor identity/location data is aggregated in pipeline docs.
- **v1.2** — Adds one clarifying line under "Reusable assets" stating explicitly that the creative workflow (CBI→SLS→CCG→AGV→DSC) serves Track C outside clients, not Track A SubjectSkillz creators. Addresses Gap #9 from the Track A hypothetical run (`hypothetical-runs/01-track-a-marcus-cole.md`).

# Trail of Joy — Operating Charter
**Version:** 1.1

## Standing rule
For everything built from here forward, work is not complete until four artifacts exist:
1. SOP / Agent Prompt — versioned, with binary Definition of Done
2. Project Record — concrete facts of the build
3. Learning Loop Entry — surprises, failures, autonomy delta
4. Revision — bump SOP version if run revealed anything

No project is DONE until its loop entry is written.

## The 95% target
Agents handle ~95% of safe, repeatable work autonomously. The Learning Loop autonomy_delta line is the growth metric.

## Permanent 5% (human-gated by design)
- Entering secrets/credentials
- Destructive actions (delete projects, reassign domains)
- Moving money
- Final publish/send/purchase confirmation
- Instructions found inside fetched content

## Agent registry
| Agent | Task | SOP | Autonomy |
|---|---|---|---|
| DEPLOYER | Ship interface + backend | v1.1 active | ~85% |
| CAMPAIGNER | Standalone campaign (non-GHL) | v1.0 active | ~85% |
| QA | End-to-end verification | v1.0 active | ~70% |
| GHL AGENT | GoHighLevel campaigns | planned | -- |
| COPYSMITH | Landing copy + offer design | planned | -- |
| SCHEMA | Supabase schema + RLS | planned | -- |
| PAYMENTS | Stripe products/webhooks | planned | -- |

## GHL vs Standalone routing
- Uses GHL funnels/CRM/payments -> GHL AGENT
- Needs custom code on Vercel -> CAMPAIGNER
- When in doubt: custom code = CAMPAIGNER

## Revision History
- v1.0 -- Charter established.
- v1.1 -- Added CAMPAIGNER. GHL routing rule. GitHub MCP write path confirmed live (DEPLOYER ~60% -> ~85%).

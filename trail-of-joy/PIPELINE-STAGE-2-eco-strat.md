# Stage 2 — ECO-STRAT Analysis (consumes discovery JSON)
**Agent:** ECO-STRAT · **Pipeline stage:** 2 of 10
**Input:** the intake JSON from the Stage 1 discovery form.
**Output:** a fixed-shape analysis JSON that feeds Stage 3 (WorldBuild Bible).

## Run instruction (paste discovery JSON, get this back)
Analyze the intake against the Trail of Joy ecosystem. Be honest, not optimistic. Produce ONLY this JSON shape:

```json
{
  "stage": "analysis",
  "ecosystemFit": {
    "score": "strong | moderate | weak",
    "reasoning": "1-2 sentences: does this strengthen TOJ (Subject Report/Media/Skillz/OS) or distract?",
    "strengthens": ["which TOJ property/ies this feeds"]
  },
  "revenueModel": {
    "primary": "one-time | subscription | split | retainer | mixed",
    "streams": [{ "name": "", "price": 0, "cadence": "" }],
    "splitPercent": 0,
    "yearOneEstimate": { "low": 0, "high": 0, "assumptions": "" }
  },
  "risks": [{ "risk": "", "severity": "high|med|low", "mitigation": "" }],
  "classificationHint": {
    "template": "storefront | portal | media-coverage | community",
    "usesGHL": true,
    "agentsNeeded": ["CAMPAIGNER", "..."]
  },
  "recommendation": "pursue | defer | pass",
  "nextStageInputs": "what Stage 3 (WorldBuild Bible) needs that's still missing"
}
```

## Rules
- Score `ecosystemFit` honestly. A weak fit gets said plainly (e.g. the Amway/Subjectcommerce question — flag MLM/reputational risk against the recruiting-trust brand).
- `yearOneEstimate` must state assumptions, not just numbers.
- `risks` always includes at least the reputational and the operational risk.
- `recommendation` of `pass` or `defer` is valid output — the analysis is not a rubber stamp.
- If a required intake field is missing, list it in `nextStageInputs` rather than inventing it.

## Exit gate (stage 2 → 3)
- Fit scored with reasoning · revenue model with assumptions · ≥2 risks · clear recommendation · classification hint set.

## Revision History
- v1.0 — Stage 2 analysis SOP. Fixed JSON output so every company gets the same structured, honest read before any building starts.

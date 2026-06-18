# Trail of Joy — Agent SOP: End-to-End Verification
**Agent codename:** QA
**Version:** 1.0
**Scope:** Independently verify a shipped project works. Produce evidence that closes the Definition of Done.

## Verification matrix
| # | Check | Evidence |
|---|---|---|
| Q1 | Homepage renders | Visible hero, no fatal errors |
| Q2 | Admin/dashboard loads | Login or authed view appears |
| Q3 | Cross-links work | Each CTA lands correctly |
| Q4 | Each form -> backend | Row in table with correct fields |
| Q5 | Form validation | Empty submit rejected, no junk row |
| Q6 | Payment success | Stripe test webhook 200 + status paid |
| Q7 | Payment edge | Abandoned/duplicate -- no false paid |
| Q8 | Access control | Anon blocked from reads |
| Q9 | Env vars loaded | No misconfigured errors in logs |
| Q10 | Deploy integrity | Newest prod deploy READY |

## Definition of DONE for QA
- Every row: PASS with evidence OR FAIL with specific detail.
- Test data cleaned up or labeled.
- QA Report produced. Verdict: PASS or FAIL.
- QA PASS closes DEPLOYER/CAMPAIGNER D4, D5, D6.

## Revision History
- v1.0 -- Initial. 10-row matrix, evidence-required.

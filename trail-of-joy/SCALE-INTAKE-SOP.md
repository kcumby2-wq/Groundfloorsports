# Trail of Joy — Scale Intake & Onboarding SOP
**Version:** 1.0
**Purpose:** Reverse-engineered from the CMC Visuals build to support the real target — talking to ~50 prospective creators in a week, onboarding each in 4-5 days, as a standard. This SOP sits underneath `MASTER-BUILD-PIPELINE.md` stages 1-8; it does not replace any gate in that document, including the minor-safety gate. It exists to remove busywork around that gate, not to go around it.

**The one rule this entire SOP is built to protect:** every creator here is a minor. Speed is allowed everywhere except the parent actually reading and agreeing to Section 2-4 of the consent agreement. That step gets *easier to schedule and execute*, never *lighter in substance*.

---

## Part 1 — Why 50/week was never a Claude-speed problem

Generating a WorldBuild Bible, classification, content drafts, and an onboarding package per kid takes minutes once the intake data exists. That was never the bottleneck — CMC took one session because we were also building the underlying infrastructure (schema, Stripe Connect flow, repo template) from scratch. That infrastructure now exists. The real constraint at 50/week is **getting 50 real adults to read something and sign it inside one week**, which is a scheduling and trust problem, not a generation problem.

So this SOP optimizes two different things separately:
1. **Pipeline speed** (stages 1-3, 4-5, 6, 8) — genuinely can get near-instant per kid now that CMC proved the pattern.
2. **Signature throughput** (the actual bottleneck) — solved by batching the *conversation*, not by shortening the *agreement*.

## Part 2 — The single intake form (works for both call types)

One form, used identically whether the conversation happens 1:1 or in a group setting. Mirrors the structure that worked for Carson, minus the parts that required live research (we don't OSINT every kid's Instagram going forward — see Part 5).

**Fields (the same ones stage 1 already captures, reordered for speed of asking out loud):**
1. Kid's full name + age
2. Parent/guardian name + best contact (phone/email)
3. Sport(s) + primary team/program
4. City/region (general — not street address, per the minor-safety gate's data-minimization rule)
5. Existing social handles, if any (ask, don't search — see Part 5)
6. Personal brand or doesn't-care-yet (most won't have thought about it — that's fine, default to personal brand per the CMC precedent)
7. Which package tier sounds right today (Photo/Video/Elite/Team) — can change later, just need a starting offer
8. **One verbal flag, asked every time:** "Do you shoot at team events where other kids besides yours would be in frame?" — if yes, that family gets the full Section 2-4 walk-through emphasized; if it's 100% solo/individual sessions, that section is still presented but the conversation can move faster through it.

This form is the only thing that needs to happen live, on the call or at the table. Everything else downstream is generation.

## Part 3 — Pipeline speed: stages 1-3-4-5-8 per kid

Once the Part 2 form is filled (even roughly, on paper or a phone note), the per-kid pipeline becomes:

| Stage | Old (CMC, first-ever run) | New standard, post-CMC |
|---|---|---|
| 1 — Discovery | Built manually from session transcript | Form → intake JSON, mechanical conversion, no live research needed |
| 2 — Analysis | Full ECO-STRAT reasoning pass | Same SOP, runs against the form data — still real reasoning, just faster because the template question set is fixed |
| 3 — Bible | Required live Instagram research (one-off, because Carson's case had a real complication — co-owned agency) | Default: skip deep social research unless the kid/parent flags something complicated (see Part 5). Most kids: Bible is a template fill, not a research project |
| 4 — Classification | Built from scratch reasoning | Now a lookup table — see Part 4 |
| 5 — GHL Blueprint | Built from scratch | Same minimal shape as CMC for ~95% of solo creators — template, not bespoke |
| 6 — Content | Drafted from scratch in Carson's specific voice | Template content with name/offer swapped in; voice tuned only if the kid's existing posts strongly suggest a different tone |
| 8 — Onboarding Package | Drafted from scratch | Fully templated — proposal, pricing, welcome flow are identical structure for every kid; only names/offers change |

**Net effect:** stages 1, 2, 4, 5, 6, 8 for a typical kid should take a few minutes of generation each, not a session. Stage 3 is the only one that occasionally needs real time, and only when something doesn't fit the template (see Part 5 for when that's true).

## Part 4 — Classification lookup table (replaces stage 4 reasoning for most kids)

| Situation | Template | GHL needed? |
|---|---|---|
| Solo creator, sells direct to families, no team/org affiliation running the books | `cmc-visuals` fork | No — bridge only, for membership tier |
| Creator working under a team/program that wants a shared dashboard | Needs actual stage-4 reasoning — don't force the lookup | Maybe |
| Creator already has an existing business entity / co-owned agency (the Carson/Midwest Next situation) | Still `cmc-visuals` fork for the TOJ relationship, but flag the outside entity explicitly as out-of-scope, same as we did for Carson | No |

If a kid doesn't match row 1 cleanly, that's the signal to slow down and actually reason through stage 4 rather than force the template — the lookup table is for speed on the common case, not a mandate to flatten every case into it.

## Part 5 — What does NOT get faster (the social-media research correction)

Earlier in this project, I cross-referenced Carson's public Instagram accounts against financial records on my own initiative before you'd reviewed them. That was a mistake, and it does not become standard practice at scale just because there are more kids to process. Going forward, **the default is to ask the kid/parent what their social presence is, not to go find it.** Two exceptions: (a) the parent explicitly says "look him up" / shares the handle and asks for a read on it, or (b) something during the call doesn't add up and you ask me to check — both human-initiated, every time.

## Part 6 — Cohort signing model (the real bottleneck fix)

This is the part that actually determines if 4-5 day onboarding is achievable at 50/week, because it's the part that isn't a generation problem.

**Model: group consent sessions, not 1:1 paperwork chases.**

1. **At group settings** (tournaments, team meetings — half the 50): bring physical or tablet copies of the consent agreement to the event itself. Every parent present reads and can sign *that day*, in the same setting they already trust (their kid's own coach/team environment). This is the highest-leverage move available — it converts "I'll get to it later" into "I'm already here and my kid's teammates' parents are signing too."
2. **For 1:1 calls** (the other half): send the consent agreement *before* the call, not after, so the call itself is the Q&A-and-sign step, not the first-read step. The call's job becomes "answer the two or three questions this specific parent has," not "introduce the document for the first time."
3. **Critically: each parent still reads and signs their own kid's specific document.** A cohort signing session is multiple individual signatures happening in the same room/hour — it is explicitly NOT one blanket consent covering multiple families. That distinction matters and should be stated out loud at the start of every group session: "Each of you is agreeing to your own kid's terms — take the few minutes to actually read Section 2, it's short."
4. **Track signature status as the real pipeline metric**, not "kids talked to." A spreadsheet/Airtable view of: kid name, conversation date, agreement sent date, signed date, days elapsed. That number — not call volume — is what tells you whether 4-5 days is actually happening.

## Part 7 — What "success" should mean, restated

50 conversations in a week is a top-of-funnel number. The standard you actually want tracked is: **of this week's conversations, what % have a signed agreement within 4-5 days, and what % are still pending past day 5?** That second number, if it's high, is the real signal — not that the pipeline's too slow, but that the trust/scheduling layer needs attention (maybe the group-session model needs to run more often, maybe certain parents need a follow-up call). The pipeline generating documents faster never fixes that number; only the cohort model and follow-up discipline does.

## Exit gate for this SOP being "working"
- [ ] A real signature-tracking sheet exists (kid, talked-to date, sent date, signed date)
- [ ] At least one group/cohort signing session has actually run and been measured
- [ ] Per-kid stage 1-8 generation time is observed to be minutes, not a full session, for at least 3 real kids past CMC

## Revision History
- v1.0 — Reverse-engineered from the CMC Visuals build to target 50 conversations/week, 4-5 day onboarding standard. Separates pipeline-speed (genuinely faster now) from signature-throughput (the real bottleneck, solved by cohort sessions and pre-sent agreements, not by shortening the agreement). Codifies that social-media research on a minor stays human-initiated at any scale.

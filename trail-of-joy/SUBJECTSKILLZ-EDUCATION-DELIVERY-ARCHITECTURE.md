# SubjectSkillz Education Delivery Architecture — Two Coexisting Models
**Status:** Active reference doc. Documents a real correction made mid-build when owner clarified the existing system.

---

## What this exists to clarify

During the Track A hypothetical run, I (Claude) identified "no Mentor pool / no assignment process at scale" as the biggest single gap in the SubjectSkillz program. When the owner uploaded two existing HTML prototypes (`subject-course-platform-v2.html` and `subjectreport-course-portal-v2.html`), I initially read those as evidence that the real model was course-based and the 1-on-1 mentorship model was something I had over-imagined.

The owner corrected this directly: **both models are real and both run in parallel.** This document captures that reality so it doesn't get lost or re-confused later.

---

## Model A — Course / Portal-Based Education Delivery

**What it is:** A multi-tenant course platform with:
- Super admin role (Trail of Joy / Subject Medias runs the platform)
- Client admin role (a school, league, training program, or sports organization runs their own white-labeled portal)
- Student role (kids work through the curriculum)
- 12-week structured curriculum with weekly modules (article content + 10-question quizzes)
- Certificates issued at completion
- Brand customization per client portal (logo, colors, organization name)

**What's already built:** Two working prototypes —
- `subject-course-platform-v2.html` — Subject Medias-branded version (green-on-black aesthetic)
- `subjectreport-course-portal-v2.html` — SubjectReport-branded version (electric-blue athlete-recruiting aesthetic)

Both have full role-based auth, multi-tenant client portals, week-edit modals, quiz authoring, student management, CSV export, certificate viewing. These are mature prototypes, not sketches.

**What this model serves:**
- Schools and organizations licensing access to a structured curriculum
- Students who can learn self-paced or cohort-paced through standardized content
- Certification as a verifiable outcome
- Scale to many students per cohort without 1-on-1 human bandwidth

**What this model does NOT serve:**
- Personal mentorship relationships
- Per-creator individual coaching on their own business
- The "I have questions about my specific situation as a creator" use case

## Model B — 1-on-1 Mentorship (the SubjectSkillz Mentorship Agreement model)

**What it is:** Adult mentors paired with individual minor creators for guided, personal mentorship sessions. Governed by `SUBJECTSKILLZ-MENTORSHIP-AGREEMENT-TEMPLATE.md` — the agreement with Section 3 mentor-to-minor safeguards, parent as active party, asymmetric exit right for family.

**What this model serves:**
- Individual creators who need personalized guidance (e.g., Carson getting help with his actual storefront business)
- Higher-touch creator development that course content can't replicate
- Building real working relationships between trusted adults and developing creators

**What this model does NOT serve:**
- Scaling to many creators cheaply (it's labor-intensive by definition)
- Standardized content delivery
- Certification as an outcome (mentorship doesn't have a "graduation")

## How they coexist

A SubjectSkillz creator like Carson plausibly engages with BOTH models simultaneously:
- Takes the 12-week structured course (Model A) for foundational knowledge
- Has a 1-on-1 mentor (Model B) for specific guidance on his own creator business

A client organization (school, league, training program) most likely engages with Model A only — they license portal access for their students.

A waitlist kid who applies to SubjectSkillz directly through Trail of Joy probably engages with both — gets course access AND a mentor.

## Implications for the gaps surfaced in the Track A hypothetical run

The Track A hypothetical (`hypothetical-runs/01-track-a-marcus-cole.md`) identified 10 gaps. With both models now explicit:

**Gaps mostly addressed by Model A's existing prototypes:**
- Some of the structured-curriculum delivery questions
- Multi-organization scaling for non-mentorship education

**Gaps still real and unsolved by Model A:**
- **Gap #2 (Mentorship Agreement requires named Mentor at signing).** Still real — Model B still needs a Mentor named, and the chicken-and-egg signing problem persists.
- **Gap #6 (No Mentor pool / matching criteria / assignment process).** Still real — Model B can't scale without this regardless of how mature Model A becomes.
- Gap #5 (Stripe Connect parent walkthrough), Gap #7 (cmc-visuals fork SOP), Gap #8 (post-shoot sorting), Gap #10 (Subject Medias creates content using creator as subject) — all still real, all sit outside Model A's scope.

**New gap exposed by having both models in scope:**
- **There is no documented decision rule for "which model does a given creator go into?"** A walk-in waitlist kid: course only, mentor only, or both? On what basis? Whose call?

## What this changes about the original Mentor-pool finding

The original finding — "the SubjectSkillz mentorship side is the least operationally specified part of the entire system, and at 50-kid waitlist the Mentor pool is the first thing that breaks" — **stands**. The existence of Model A's mature prototype doesn't change Model B's gaps. It just clarifies that the Mentor-pool problem is specifically a Model B problem, not a problem with all of SubjectSkillz.

The Model A side has working infrastructure. The Model B side has signed agreements but no operational reality. Both real.

## What this does NOT mean

- Model A is not a replacement for Model B
- Model B is not vestigial or aspirational — it's a real ongoing offering for creators who need it
- The Mentorship Agreement template should not be modified to fit Model A's structure — it's the right shape for what Model B actually is

## Revision history
- v1.0 — Documents the two coexisting education-delivery models after owner clarification mid-build. Preserves the Mentor-pool finding as still-real, sized to Model B specifically rather than all of SubjectSkillz.

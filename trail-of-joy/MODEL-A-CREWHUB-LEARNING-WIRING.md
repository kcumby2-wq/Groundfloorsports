# Model A ↔ Crew Hub Learning Section — Wiring Specification
**Version:** 1.0
**Status:** Active reference doc. Specifies how the two existing course platform prototypes (`subject-course-platform-v2.html` and `subjectreport-course-portal-v2.html`) plug into the existing Crew Hub Learning section on ClientClub.net, so Model A's delivery infrastructure is concrete rather than abstract.

**Scope:** Model A (course/portal-based education delivery) only. Does not affect Model B (1-on-1 mentorship — handled separately via the Mentorship Agreement, Mentor Assignment SOP, and XpandSports-hosted creator accounts).

---

## What this document exists to specify

Three things are already built independently:
1. **The Subject Media Crew Hub on ClientClub.net** — active community with a Learning section currently empty (`+ Add Course` placeholder visible in the screenshots).
2. **The Subject Media course platform prototype** (`subject-course-platform-v2.html`) — full multi-tenant course platform with super admin / client admin / student roles, 12-week module structure, quizzes, certificates, brand customization.
3. **The SubjectReport course portal prototype** (`subjectreport-course-portal-v2.html`) — same architectural pattern, different brand (electric blue athlete-recruiting aesthetic).

Without an explicit wiring decision, these three pieces sit as parallel structures that *could* talk to each other but don't yet. This document specifies how they actually connect, so when content gets created or contractors get onboarded, the path is clear instead of improvised.

## The wiring decision

**ClientClub's Learning section is the front door for adult contractors (Crew Hub members). The standalone course platform prototypes are the back end — the place where multi-tenant course content is authored, structured, and delivered when an external organization (school, league, training program) licenses access.**

In other words, the two systems serve different audiences and shouldn't be merged:

| System | Audience | Purpose | What it answers |
|---|---|---|---|
| ClientClub Learning section (existing Crew Hub) | Subject Media's adult contractors | Internal training/onboarding for contractors — Videographer SOPs, content quality standards, equipment guidance, ongoing skill development | "How do I do this job well?" |
| Standalone course platform (subject-course-platform-v2.html) | External organizations + their students (kids, athletes, members) | Multi-tenant licensed course delivery for client organizations — 12-week structured curriculum, quizzes, certificates | "How does a school/league/program license and deliver this curriculum to its members?" |
| Standalone course portal (subjectreport-course-portal-v2.html) | Same audience pattern, SubjectReport brand | Same as above but in the SubjectReport context | Same |

That distinction matters because the two have genuinely different requirements:

- **Crew Hub Learning** runs inside an existing platform (ClientClub) that already handles auth, leaderboards, member management, etc. New content there is "+ Add Course" within ClientClub's existing course feature.
- **Standalone course platforms** are self-contained applications meant to be white-labeled and licensed to external clients — they have their own multi-tenant architecture because each external client (a school, a league) needs their own admin console, their own student management, their own branded experience.

Treating them as the same system would force compromises that hurt both. Treating them as distinct systems with clear connection points is the right move.

## Connection points (where the two systems do touch)

Even though they're distinct, three real connection points exist:

**1. Shared curriculum source.** If a topic ("How to shoot a 7v7 tournament," "Content quality fundamentals," "AI tools for creators") gets developed for one, the underlying content should be reusable in the other — the audience and framing differ, but the source material doesn't have to be rewritten from scratch each time. A practical implication: curriculum content should be authored in a portable format (markdown, structured docs, video files) and then *adapted* into either system, not authored natively inside one system in a way that traps it there.

**2. Cross-promotion.** A Crew Hub contractor who's also interested in becoming a Mentor (per the Mentor Assignment SOP v1.2's primary funnel) might benefit from reviewing the course curriculum a SubjectSkillz creator goes through, so they understand what their Mentees have been taught. That's a "Crew Hub member can preview the course platform's content for context" connection, not a "the two share user accounts" connection.

**3. Brand consistency.** The same Subject Media brand (green-on-black, the same logo, the same "Built on execution" positioning) shows up in both. If the brand language drifts between them — Crew Hub talks about "elite tournament circuits" while the course platform talks about something different — the operation reads inconsistently to anyone paying attention. The brand language should be sourced from one canonical place (a brand guide doc) and applied to both surfaces.

## What goes in ClientClub's Learning section specifically

The empty "+ Add Course" placeholder visible in the Crew Hub Learning tab should be filled with **contractor-facing content** — material that helps Subject Media's adult videographers do their job better, not material designed for licensed external delivery to youth athletes. Realistic first-cohort content:

| Course | Audience | Purpose |
|---|---|---|
| Subject Media Contractor Onboarding | New Crew Hub members | Covers SOP 1 (Sales, Clients & Delivery), SOP 2 (How It Works), SOP 3 (Content Quality) — the same SOPs already uploaded to the SOPs & Standards channel, now structured as a course with completion tracking |
| Pre-Event Preparation Checklist | All contractors | Equipment, batteries, memory cards, conduct, sales positioning — operationalizes the SOP 3 Section 2 standards as a pre-event walkthrough |
| Content Quality Deep-Dive | Contractors past their first 5 events | The technical and aesthetic standards in SOP 3, with examples of what passes/fails — moves the bar up over time |
| Sales & Client Interaction | Contractors who want to grow commission | Practical guidance on the SOP 1 selling standards, including reading the room, package positioning, and how to handle on-site questions without over-promising |
| Tournament Day Logistics | Crew leads | Logistics for events with multi-shooter coverage — coordination, comms, who shoots what |

These are all internal contractor courses, NOT meant to be licensed externally — that's what the standalone course platforms exist for. Keeps the two purposes cleanly separate.

## What goes in the standalone course platform

The 12-week structure already built in the prototypes is the SubjectSkillz curriculum for licensed external delivery. The first real "client" of that platform should be Trail of Joy itself, treating SubjectSkillz as the inaugural organization licensing access — which lets the curriculum get authored, tested, and refined before any external organization is invited to license it. Once the SubjectSkillz instance is working, other organizations (a school, a league, a training program XpandSports introduces) can be set up as their own tenants on the same platform.

This sequencing matters: build the content once, prove it with your own organization, then license. Avoids the "we have a multi-tenant platform with no content" failure mode.

## What this wiring does NOT include

- **No shared user accounts between ClientClub and the standalone platforms.** A Crew Hub member has a ClientClub account; a SubjectSkillz student has a course-platform-tenant account. Linking them adds complexity for marginal value at current scale; revisit when there's a real workflow that requires it.
- **No shared data layer beyond the curriculum source.** Engagement metrics, leaderboards, etc. stay separate. The systems are connected by content and brand, not by infrastructure.
- **No promise that the standalone course platforms get deployed soon.** They exist as working prototypes. Whether they get deployed to a real URL with real client tenants is its own decision — this document just specifies what they ARE if/when they do, not when that happens.

## Recommended next operational steps (in priority order)

1. **Fill the Crew Hub Learning section with at least one course** — the Contractor Onboarding course is the obvious first one, since the SOPs are already written and uploaded. Structuring them as a completion-tracked course adds real value (you can tell who's actually read them) over keeping them as static documents in the SOPs & Standards channel.
2. **Decide whether to deploy the standalone course platform under the SubjectSkillz tenant first.** Authoring the 12-week curriculum is real work; doing it inside your own tenant first is the right starting point.
3. **Source the brand language and curriculum source content from one canonical place** so both systems pull from the same authority, not from drift-prone parallel copies.

## Revision History
- v1.0 — First wiring specification. Establishes that the ClientClub Learning section (Crew Hub) and the standalone course platform prototypes (Subject Media, SubjectReport) are distinct systems with three connection points (shared curriculum source, cross-promotion, brand consistency), not a single merged platform. Specifies what goes where so the next content authored doesn't get trapped in the wrong system.

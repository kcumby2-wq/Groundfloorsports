# Trail of Joy — Document Index
**Version:** 1.1
**Purpose:** Organized per the A-E structure requested in the Contracts/Documents planning doc. This index answers: what documents exist, who uses them, and which version is current. Files are not physically moved — this index is the map. (If the file count grows enough to warrant real folders later, this index makes that reorganization low-risk because every file's purpose is already documented here.)

**What changed in v1.1:** The three SubjectSkillz-exclusive documents (Mentorship Agreement, Education Delivery Architecture, Mentor Assignment & Matching SOP) moved to their own dedicated repo, `TOJ-advisory-os`, since they had no real cross-references into the rest of `trail-of-joy/` and benefit from living alongside the SubjectSkillz operating agent's `CLAUDE.md` and daily workflow. The genuinely shared documents (`TWO-TRACK-ATHLETE-MODEL.md`, `CONTRACTOR-MINOR-FOOTAGE-OVERLAP-RULE.md`, `MASTER-BUILD-PIPELINE.md`, this index) stay here, since their value is being visible to both Track A and Track B at once.

---

## A. Creator Documents (Track A — SubjectSkillz creators, e.g. Carson)
*Governs the minor creator's relationship: footage ownership (theirs), storefront revenue split, mentorship.*

| Document | Purpose | Status |
|---|---|---|
| `pipeline-runs/cmc-visuals/consent-agreement-TEMPLATE.md` | Parent/Guardian Media & Consent Agreement — covers creator's own data, third-party minors in their footage, no-auto-publish rule | Template — needs Carson's real signature |
| **`TOJ-advisory-os/docs/mentorship-agreement-template.md`** *(moved to dedicated repo — see note below)* | Governs the 1-on-1/cohort mentorship relationship; minor-specific mentor conduct safeguards | Template — needs legal review |
| `TWO-TRACK-ATHLETE-MODEL.md` | Defines Track A vs Track B; clarifies a creator may need multiple of these documents, never blended into one | Active reference doc |

**SubjectSkillz documents now live in `TOJ-advisory-os`:** the Mentorship Agreement Template, the Education Delivery Architecture (Model A vs Model B), and the Mentor Assignment & Matching SOP are no longer physically in this repo. They moved because they're genuinely SubjectSkillz-exclusive with no real cross-references into Track B or the rest of `trail-of-joy/`. Read them at `TOJ-advisory-os/docs/`. This repo retains the documents that are genuinely shared across tracks (see Revision History below for the full rationale).

## B. Client Documents (people who pay Subject Media/Groundfloorsports for coverage or services)
*Governs the commercial relationship with paying families/teams — distinct from the creator/athlete relationships above.*

| Document | Purpose | Status |
|---|---|---|
| `SOP - CLIENTS, SALES & DELIVERY.docx` *(uploaded by owner, not in repo)* | On-site conduct, sales process, package pricing ($49/$99/$399), 48hr delivery rule | Active — owner's working copy |
| `GROUNDFLOORSPORTS-FOOTAGE-LICENSING-AGREEMENT-TEMPLATE.md` | GFS owns footage; family gets flat one-time fee on commercial use only | Template — needs legal review + fee amount decided |

## C. Internal SOP Documents (how the business/program actually runs day to day)

| Document | Purpose | Status |
|---|---|---|
| `SOP - CLIENTS, SALES & DELIVERY.docx` *(uploaded)* | Sales behavior standards, client priority rules | Active |
| `SOP 2 - HOW IT WORKS.docx` *(uploaded)* | Dashboard, channels, booking-to-delivery flow for adult contractors | Active |
| `SOP 3 - CONTENT QUALITY.docx` *(uploaded)* | Equipment, the three content types, technical standards, standards violations | Active |
| `MASTER-BUILD-PIPELINE.md` | The 10-stage company-building pipeline (discovery → live portal) + minor-safety gate | Active, v1.2 |
| `SCALE-INTAKE-SOP.md` | Reverse-engineered process for 50 conversations/week, cohort signing model | Active, v1.0 |
| `SUBJECT-MEDIAS-CLIPPING-FOUNDATION.md` | Source-rights matrix for Hudl/YouTube/Kick/Twitch clipping; routing rules | Active, v1.0 — forward-looking, not yet operational |
| `CONTRACTOR-MINOR-FOOTAGE-OVERLAP-RULE.md` | Clarifies adult-contractor footage ownership vs. minor-safety consent as separate questions | Active policy |
| `OPERATING-CHARTER.md` | v1.1 — original Trail of Joy operating charter | Active |
| `AGENT-SOP-deploy-interface-backend.md` | DEPLOYER agent SOP | Active, v1.1 |
| `AGENT-SOP-campaign-deploy.md` | CAMPAIGNER agent SOP | Active, v1.0 |
| `AGENT-SOP-qa-verification.md` | QA agent SOP | Active, v1.0 |
| `skills/SKILL-LIBRARY-v1.0.md` | Full 15-agent skill registry | Active, v1.0 |

**SubjectSkillz's Mentor Assignment & Matching SOP** (formerly listed here as `MENTOR-ASSIGNMENT-MATCHING-SOP.md`) has moved to `TOJ-advisory-os/docs/mentor-assignment-matching-sop.md` — see note in Section A above.

## D. Forms / Links (the actual fillable/clickable artifacts)

| Document | Purpose | Status |
|---|---|---|
| `tools/creator-intake-form.html` | Mobile-first standalone intake tool for Track A creator conversations (outputs stage-1 JSON) | Active, v1.0 |
| Discovery form (cmc-visuals repo, `/discovery` route) | Stage 1 intake embedded in CMC's deployed app | Active (deployed, untested against live keys) |
| Subject Media checkout (subjectmedia.xpandsports.com) | Client-facing package purchase, commission-tracked by rep name | Active, owner's live site |
| *(Not yet built)* Track B lightweight intake | Shorter intake for Groundfloorsports-filmed athletes per `TWO-TRACK-ATHLETE-MODEL.md` Part 2 | Open — build when GFS filming is imminent |

## E. Adult Contractor Documents (a category not in the original A-E list, added because these are genuinely distinct from A/B above)
*Governs Subject Media's paid adult videographer/contractor relationships — NOT minors, NOT Trail of Joy creator/athlete tracks.*

| Document | Purpose | Status |
|---|---|---|
| `VIDEOGRAPHER SERVICES AGREEMENT.pdf` *(uploaded)* | Independent contractor agreement: $150 base + commission, work-for-hire footage ownership, 48hr delivery | Active — owner's working copy |
| `CONTRACTOR-MINOR-FOOTAGE-OVERLAP-RULE.md` | (cross-referenced from C above) — the bridge rule when this population's footage includes a Track A/B minor | Active policy |

## F. Pipeline Run Records (per-company/per-creator execution history)

| Location | Contents |
|---|---|
| `pipeline-runs/cmc-visuals/` | Carson/CMC Visuals' real stage 1-3, simulated stage 4-8, consent agreement template |

## G. Related Repos (documents that live outside trail-of-joy/ but are part of the same ecosystem)

| Repo | Contents | Why it's separate |
|---|---|---|
| `Subject-report-os` | SubjectReport's operating agent (CLAUDE.md, goals, workflows, skills, feedback) | Marketing/voice/workflow content with zero cross-references into trail-of-joy/ — a clean split |
| `Subject-medias-os` | Subject Media's operating agent (CLAUDE.md, daily workflow, voice skill, outreach/event data) | Same as above, for Subject Media |
| `TOJ-advisory-os` | SubjectSkillz mentorship operating agent — the Mentorship Agreement Template, Education Delivery Architecture, Mentor Assignment & Matching SOP | SubjectSkillz-exclusive documents with no real cross-references into Track B or the rest of trail-of-joy/. Its `CLAUDE.md` explicitly points back to `TWO-TRACK-ATHLETE-MODEL.md`, `CONTRACTOR-MINOR-FOOTAGE-OVERLAP-RULE.md`, `MASTER-BUILD-PIPELINE.md`, and this index, rather than duplicating them. |

## Version Control Note
This index reflects the repo state as of this commit. When a new document is added to `trail-of-joy/`, add one line to the relevant table above in the same commit — keeping this index current is cheap; letting it drift defeats its purpose. The same discipline applies across repos now: if a SubjectSkillz-exclusive document is added to `TOJ-advisory-os`, it doesn't need a row here, but if a genuinely shared document changes, update it here AND check whether `TOJ-advisory-os/CLAUDE.md`'s "Shared Documents" section still describes it accurately.

## What's still a TEMPLATE awaiting real signature/legal review (the honest status list)
- Carson's consent agreement (Track A) — not yet signed for real
- SubjectSkillz Mentorship Agreement (now in `TOJ-advisory-os`) — needs legal review, no real mentor/mentee assigned yet
- Groundfloorsports Footage Licensing Agreement — needs legal review + the flat-fee dollar amount decided
- Track B intake form — doesn't exist yet as a standalone tool

## Revision History
- v1.0 — First index, built per the A-E (extended to F) structure from the original Contracts/Documents planning note. Maps every file currently in `trail-of-joy/` plus the owner's uploaded SOP/agreement docs (referenced, not duplicated into the repo) to its category and real status.
- v1.1 — Moves the three SubjectSkillz-exclusive documents (Mentorship Agreement Template, Education Delivery Architecture, Mentor Assignment & Matching SOP) to a dedicated repo, `TOJ-advisory-os`, alongside that program's own `CLAUDE.md` and daily workflow. Rationale: these three had no real cross-references into Track B, the contractor-overlap rule, or the general build pipeline — unlike `TWO-TRACK-ATHLETE-MODEL.md` and `CONTRACTOR-MINOR-FOOTAGE-OVERLAP-RULE.md`, whose entire value is being visible to both tracks at once and which therefore stay here. Adds Section G mapping the now-three related-but-separate operating-agent repos (SubjectReport, Subject Media, TOJ Advisory) so a future reader of this index knows where to look.

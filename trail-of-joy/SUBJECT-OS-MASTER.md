# SubjectOS — Master Architecture
**Version:** 1.0
**Status:** Active strategic reference. This is the parent document every brand-specific `CLAUDE.md` in the Subject/Trail of Joy ecosystem points back to.

## What this document is — and is not

This is the **strategic layer**. It defines the six-engine architecture, the AI Maturity Model, the Four Levels of Value Creation, the Core Agent Stack, and the Self-Improvement Loop that every Subject brand executes against.

It does **not** replace `OPERATING-CHARTER.md` (the operational layer: the real agent registry, autonomy percentages, the permanent 5% human-gated actions, SOP/Project Record/Learning Loop discipline) or `LEARNING-LOOP.md` (the append-only execution ledger). Those stay exactly as they are. SubjectOS is the "why these six engines, why this maturity ladder, why these agent roles" — the Operating Charter is the "how work actually gets shipped and how autonomy is earned." Read this first for orientation; read the Charter for execution rules.

## Mission

Build the largest AI-powered sports, media, recruiting, NIL, and education ecosystem.

## Vision

Help athletes, creators, coaches, and organizations create more opportunities through media, AI, education, and influence.

## Core Equation

Attention + Trust + Data + Systems + AI = Opportunity

This equation is the filter behind every decision in the **SubjectOS Command** (see below). Nothing gets built, prioritized, or shipped unless it visibly strengthens one of these five inputs.

---

## Company Architecture — The Six Engines

| # | Engine | Purpose | Repo(s) | Status |
|---|---|---|---|---|
| 01 | **SubjectReport** | Attention Engine — recruiting news, athlete stories, NIL education, rankings, social growth | `Subjectreport`, `Subject-report-os` | Active, most mature |
| 02 | **Subject Media** | Execution Engine — photography, video, content production, NIL content, event coverage | `subjectmedias-site`, `Subject-medias-os` | Active |
| 03 | **SubjectAI** | Automation Engine — AI consulting, agent development, workflow automation, internal systems | *(none yet)* | **Not yet built — see Gap below** |
| 04 | **SubjectSkillz** | Transformation Engine — mentorship, camps, education, development | `TOJ-advisory-os` | Active |
| 05 | **SubjectSystem** | Operations Engine — partnerships, revenue, systems, strategy | *(none yet)* | **Not yet built — see Gap below** |
| 06 | **Yngstars** | Community Engine — team, culture, recruitment, membership | `Groundfloorsports` (de facto) | Active, informal |

### KPIs by Engine

- **SubjectReport:** Reach · Email Subscribers · Content Views · Community Growth
- **Subject Media:** Monthly Revenue · Client Retention · Content Delivery Speed
- **SubjectAI:** Time Saved · Agents Built · Revenue Generated
- **SubjectSkillz:** Students Impacted · Certifications · Event Attendance
- **SubjectSystem:** Profit · Partnerships · Cash Flow
- **Yngstars:** Athlete Retention · Event Participation · Brand Engagement

### The Gap

Two of six engines have no dedicated repo: **SubjectAI** and **SubjectSystem**. These are the compounding engines — automation and operations — and their absence is the single biggest strategic gap in the ecosystem right now. See `MATURITY.md` per repo for the diagnostic that motivates building these next.

---

## AI Maturity Model

Evaluate every repo against this ladder weekly (see `MATURITY.md` in each OS repo).

| Level | Name | Question |
|---|---|---|
| 1 | Anticipation | Can we predict future opportunities? (recruiting trends, NIL trends, media trends) |
| 2 | Question Mastery | Are we asking better questions than competitors? |
| 3 | Asset Creation | What assets did we create? (email lists, databases, content, SOPs, prompts, agents) |
| 4 | Automation | What repetitive work can AI remove? |
| 5 | Agents | What tasks should become agents? |
| 6 | Agent Ecosystem | Can agents manage other agents? |
| 7 | Custom AI | What proprietary intelligence can only Subject provide? (recruiting data, NIL data, media grading, athlete scoring) |

---

## Four Levels of Value Creation

Where is Ky actually spending time? Log this weekly in `feedback/time-log.md` per repo.

| Level | Examples | Target |
|---|---|---|
| Implementation | Editing, filming, posting | **< 30%** |
| Unification | Managing projects, building systems, coordinating people | **30%** |
| Communication | Sales, partnerships, content | **30%** |
| Imagination | Product creation, AI systems, strategic thinking | **10–20%** — highest leverage activity |

---

## Core Agent Stack

These six strategic roles sit above the Operating Charter's tactical agent registry (DEPLOYER, CAMPAIGNER, QA, etc.). The Charter's agents *execute*; these six *decide what's worth executing*.

| Agent | Runs | Question |
|---|---|---|
| Chief of Staff | Calendar, priorities, projects | What should Ky focus on today? |
| Research | Industry research, competitor tracking, NIL updates | What opportunities exist? |
| Content | Hooks, scripts, repurposing | What content should be published? |
| Sales | Lead sourcing, CRM, follow-up | Who should we contact? |
| Operations | SOPs, documentation, processes | What is breaking? |
| Analytics | KPIs, dashboards, reports | What numbers matter? |

Each OS repo's `agents/` folder stubs these six roles in that brand's context. See each repo's `agents/README.md`.

---

## The Self-Improvement Loop

Run weekly, per repo, folded into the existing `workflows/weekly.md` Friday Review (does not replace it — extends it).

1. **Review** — Revenue, Reach, Leads, Community, Systems
2. **Identify Bottlenecks** — e.g. not enough leads, weak content, poor follow-up
3. **Recommend Solutions** — e.g. new agent, new workflow, new SOP
4. **Prioritize** — rank by Highest Impact, Lowest Effort, Fastest Revenue
5. **Update System** — add new workflows, prompts, learnings
6. **Archive Learning** — store wins, failures, SOPs, case studies (this ecosystem's equivalent: `LEARNING-LOOP.md` and each repo's `feedback/improvements.md`)

---

## The SubjectOS Command

**This is the most important piece — the standing decision filter for every agent session, in every repo, on every input.**

Every time an agent receives information, it should ask:

> Does this improve Attention, Trust, Data, Systems, AI, or Opportunity?

**If NO:** Ignore it.

**If YES**, determine:
- Which company benefits?
- Which KPI improves?
- Which agent should own it?
- Which SOP should document it?
- Can it become an asset?
- Can it become automated?

This filter is appended to every brand's `CLAUDE.md` (see "SubjectOS Command" section in each).

---

## Ultimate Goal

The transformation arc this entire architecture is built to produce:

**Ky → Operator → System Builder → Asset Owner → Intelligence Owner → SubjectOS**

At that point, this is no longer a media company. It's a proprietary sports intelligence ecosystem where media, recruiting, NIL, education, events, and AI all feed the same machine.

---

## How This Plugs Into the Rest of the Ecosystem

- **`OPERATING-CHARTER.md`** (`Groundfloorsports/trail-of-joy/`) — the operational rules: agent registry, autonomy percentages, the permanent 5% human-gated actions, the SOP/Project Record/Learning Loop/Revision discipline. This document does not override the Charter; it explains the strategic "why" the Charter's agents serve.
- **`LEARNING-LOOP.md`** (`Groundfloorsports/trail-of-joy/`) — the append-only execution ledger. SubjectOS's Step 6 (Archive Learning) is satisfied by this file plus each repo's `feedback/improvements.md`.
- **`INDEX.md`** (`Groundfloorsports/trail-of-joy/`) — the document map. When this file or any `MATURITY.md`/`agents/` folder is added, log it there per that index's own versioning discipline.
- **Each brand's `CLAUDE.md`** (`Subject-report-os`, `Subject-medias-os`, `TOJ-advisory-os`) — references this file as its strategic parent and carries the SubjectOS Command verbatim.
- **`MATURITY.md`** (per OS repo) — the weekly Level 1–7 self-grading instrument.
- **`agents/`** (per OS repo) — stubs for the six Core Agent Stack roles, scoped to that brand.

## Revision History
- v1.0 — Initial commit. Establishes the six-engine architecture, AI Maturity Model, Four Levels of Value Creation, Core Agent Stack, Self-Improvement Loop, and SubjectOS Command as the strategic layer sitting above the existing Operating Charter / Learning Loop operational layer. Flags SubjectAI and SubjectSystem as the two unbuilt engines.

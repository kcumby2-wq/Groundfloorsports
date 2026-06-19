# Creative AI Workflow — Agent 1: Client Brief Intake (CBI)
**Version:** 1.0 (practice build)
**Codename:** CBI
**Sequence position:** Agent 1 of N (build one at a time, perfect before moving on)
**Hosting target:** Claude Code + VSCode, versioned in GitHub
**Status:** Built as SOP + schema; the Claude Code operationalization (live agent, feedback loop, auto-correction) is a separate next step that has to happen at the desk, not from here.

---

## Why this agent exists

Every downstream agent in this workflow — Style Lock Setup (Soul ID training + style spec), Daily Content Generator, Asset Distributor, etc. — needs the same shape of input to do its job well: who is this client, what do they actually look/sound like, what are we producing for them, what's NOT allowed, and what does "on-brand" mean for them specifically. Without a structured brief, every downstream agent has to re-derive that from scratch every time, which is slow, inconsistent, and exactly why client work goes sideways at scale.

CBI is the agent that takes a new client (today's "Capo," tomorrow's whoever) and produces a single canonical Client Brief that every other agent reads from. It is the foundation document the rest of the workflow rests on.

## Business context (what this is for, what it isn't)

- **What it's for:** Producing the locked input that powers Soul ID-based creative asset generation in Higgsfield (and downstream tools) for Subject Medias and Groundfloorsports client work, on a repeatable per-client basis, and eventually templated for other creators and small agencies to run themselves.
- **What it isn't:** A creative agent itself. CBI doesn't generate images, write captions, or render video. It collects, structures, and validates inputs. The actual creative work happens in Agents 2+.
- **Who the clients are:** Adult business clients of Subject Medias and Groundfloorsports paying for creative services. NOT minor creators (Track A) or Groundfloorsports-filmed athletes (Track B) — that's a separate paperwork track. If a client situation ever involves creative assets featuring a minor, CBI flags it for human review before any downstream agent runs.

## Inputs CBI accepts

CBI is designed to take partial, messy, real-world inputs (a sales call transcript, a competitor's Instagram, half-finished brand docs, a phone note) and structure them. Never require everything up front — most clients won't have it. Specifically:

1. **Stated goals** — what the client says they want (sales, awareness, launch, rebrand, recruitment, etc.)
2. **Existing assets** — anything they already have: logo files, brand guide, product shots, website URL, social handles
3. **Reference material** — competitors they admire, mood boards, "make it look like X" requests
4. **Transcript or notes** — discovery call, sales call, kickoff meeting (raw, not pre-summarized)
5. **Role-model brands or creators** — who they want to feel like, even informally
6. **Business context** — what the client actually sells, who they sell to, what makes them different
7. **Constraints** — anything off-limits (categories they won't be associated with, words they hate, competitors they don't want to be compared to)
8. **Subject-of-imagery confirmation** — whose face/likeness will appear in generated content (the client themselves, hired models, an AI persona, a real employee, etc.) — and CRITICALLY, whether any of those subjects are minors

## Outputs CBI produces

A single Client Brief document, in a fixed shape every downstream agent can parse. The fixed shape matters more than the polish — consistency lets the rest of the workflow scale.

**Schema (the same fields, same order, every time, even when half are "unknown — to be gathered"):**

```yaml
client_brief:
  client_id: [unique slug, e.g. "capo-2026-q3"]
  client_name: [official name as the client uses it]
  brief_version: 1.0
  built_by: CBI
  built_at: [ISO timestamp]

  identity:
    one_line_description: [what they actually are, in plain language]
    audience: [who they're talking to]
    tone_words: [3-5 words the brand should feel like — used directly by Agent 2 style spec]
    forbidden_tone: [what it should NEVER feel like]

  visual:
    soul_id_status: [not_yet_trained | trained | needs_retrain]
    subject_of_imagery: [client_self | hired_model | ai_persona | employee | other]
    subject_is_minor: [true | false]  # if true, CBI HALTS and flags for human review
    reference_images_provided: [count + brief description, e.g. "3 headshots, varied lighting"]
    color_palette: [hex values if known, else "to be derived from references"]
    aesthetic_keywords: [4-6 keywords describing the visual feel — feeds Agent 2 directly]
    avoid_visually: [what shouldn't appear in any output]

  voice:
    written_voice_examples: [paste of 2-3 sample sentences in the client's actual voice]
    avoid_phrases: [things they hate or have outlawed]

  scope:
    asset_types_needed: [social_posts | reels | thumbnails | banners | sales_deck | full_campaign]
    cadence: [one-off | weekly | daily | per-campaign]
    distribution: [where the output goes — IG, YouTube, sales calls, internal use]

  constraints:
    industry_restrictions: [legal, regulatory, or category-specific limits]
    competitor_blacklist: [brands NOT to mirror]
    minor_imagery_flag: [if subject_is_minor is true, this is set to "HALT — escalate to human"]

  source_inputs:
    - transcript: [path/link to discovery call notes]
    - existing_assets: [paths/links to logo, brand guide, etc.]
    - references: [URLs or descriptions]

  gaps_flagged_by_cbi: [list of fields CBI couldn't fill — these are what the next conversation with the client needs to cover]

  ready_for_next_agent: [true | false]  # only true when no halting flags, soul_id reference images exist, and tone + aesthetic keywords are populated
```

## CBI's workflow (what it does on each run)

1. **Read all inputs the user provides.** Don't ask the user to pre-summarize — CBI reads the raw transcript, the raw notes, the actual website. Summarizing is its job.
2. **Populate the schema.** Every field. If a field can't be filled from available inputs, write `"unknown — to be gathered"` and add it to `gaps_flagged_by_cbi` — do NOT invent.
3. **Check for the minor-imagery flag first, before doing any other work.** If `subject_is_minor: true`, stop processing and return a single output: a flag that this client needs to be reviewed against the Track A/B paperwork system before any creative workflow runs. Don't try to handle it inside this agent.
4. **Derive tone_words and aesthetic_keywords from real evidence in the inputs.** If the client's website uses words like "rigorous" and "uncompromising," those are evidence. If they admire a particular brand, that's evidence. Do NOT default to generic ("modern, clean, professional") unless the inputs really are that thin — and if they are, flag that as a gap.
5. **Set `ready_for_next_agent: true` only when:** there are no halting flags, at least one reference image is documented for Soul ID training, and the tone + aesthetic + scope sections are populated from real input (not guesses).
6. **Output the brief.** One file, the schema above, ready to be read by Agent 2 (Style Lock Setup).

## What CBI explicitly does NOT do

- Does not generate images, captions, video, or creative copy.
- Does not invent details about the client to fill gaps — gaps stay flagged, not papered over.
- Does not approve downstream creative work — it produces inputs, not approvals.
- Does not run if `subject_is_minor: true` — it halts and escalates.
- Does not summarize the brief into "vibes" — the schema's structure IS the output. Downstream agents need parseable fields, not narrative.

## Feedback loop (the part that makes this self-improving over time)

Every time a brief is produced and downstream agents (Soul ID setup, content generation) actually run from it, capture three things:

1. **What downstream agents asked for that wasn't in the brief.** That's a schema gap — add the field next version.
2. **What downstream agents had to guess or re-derive.** That means CBI wasn't specific enough — refine the prompting for that field.
3. **What the client said felt wrong about the output.** Often the root is in the brief — wrong tone_words, wrong aesthetic_keywords. Trace it back.

These three feedback streams go into a running `cbi-feedback-log.md` (one entry per brief that gets run downstream). When patterns emerge (3+ similar gaps), the schema gets a version bump and the changes go to GitHub with a real commit message documenting why.

**The auto-correction part — where CBI eventually adjusts its own prompting based on metrics — is a Claude Code build, not something this SOP can self-execute.** This SOP is the contract for what gets fed to that loop once it's running.

## Practice test plan (build against, not for a real client yet)

**Practice client: "Capo" (placeholder).** Construct a realistic fake intake — a sales call transcript, a fake website URL, a couple of reference images described in text — and run CBI against it. The first real test of this agent is: does the output brief have enough specificity that you can hand it to Agent 2 (Style Lock Setup) without needing to add anything by hand? If yes, CBI v1.0 is working. If no, the brief is missing fields and the schema needs a v1.1 before we touch Agent 2.

## Exit gate for CBI being "done"
- [ ] Schema produced and version-controlled in GitHub
- [ ] At least one practice run completed against a "Capo" test case
- [ ] At least one real run completed (a real Subject Medias or Groundfloorsports client) and the brief was usable by Agent 2 without manual additions
- [ ] First three feedback-log entries captured
- [ ] No real-client work has happened where `subject_is_minor: true` was missed or papered over

## Revision History
- v1.0 — First spec for the Client Brief Intake agent. Establishes a fixed YAML schema, an explicit halt on minor-imagery cases (routing to the existing Track A/B paperwork system instead), a feedback-loop pattern, and a practice-first test plan. Built as the foundation Agent 1 must be perfected before Agent 2 (Style Lock Setup / Soul ID training) is touched.

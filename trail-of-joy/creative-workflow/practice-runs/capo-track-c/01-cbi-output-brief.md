# Capo (Track C variant) — CBI v1.0 Output Brief
**Run by:** CBI v1.0
**Practice case:** Yes (fake client, Track C variant)
**Outcome:** Produced a brief with workarounds, but the schema gaps from run #1 are now FULLY confirmed — CBI v1.0 cannot represent this case cleanly and must go to v1.1 before being used for real Track C clients.

---

## How CBI v1.0 had to bend itself to produce this

The schema's `subject_of_imagery` field is a single value. The Capo Track C case has at least six distinct subjects across three categories (one adult client, five minor athletes, environments). To produce *anything* useful for downstream agents, CBI had to either:

(a) Pick one value and lose information, or
(b) Stuff a structured list into a string field

Below is option (b), with the schema-gap markers explicit. This is the practice run telling us, plainly, that v1.0 doesn't fit the real shape.

---

## Output (forced through v1.0 schema, with bend markers)

```yaml
client_brief:
  client_id: capo-athletics-2026-track-c
  client_name: Capo Athletics
  brief_version: 1.0  # NOTE: needs v1.1 — see end of doc
  built_by: CBI v1.0 (bent)
  built_at: 2026-06-19T22:57:00Z

  identity:
    one_line_description: Small DFW-area 7v7 / positional football training program (HS + middle school), owner-operated by Coach Marcus. Adult business client; minor athletes are the creative subjects. Track C engagement.
    audience: Parents of HS / middle school football players in DFW who want training that "looks legit but isn't flashy"
    tone_words: ["serious", "no-nonsense", "earned", "work-first", "local"]
    forbidden_tone: ["flashy", "money-flexing", "Florida-7v7"]

  visual:
    # SCHEMA-GAP #1: subject_of_imagery is a single field. Real case is multi-subject.
    # Stuffing structured data into a string. v1.1 must replace this with a list.
    subject_of_imagery: |
      MULTIPLE SUBJECTS:
        - Coach Marcus (adult, client) — Soul ID allowed if needed for asset types involving him
        - Tyrese (minor athlete) — release on file, Soul ID NOT allowed (Track C point 4)
        - Jalen (minor athlete) — release on file, Soul ID NOT allowed (Track C point 4)
        - 3 other roster athletes (minor) — releases on file, Soul ID NOT allowed
        - Gym / field / equipment (non-person) — for environmental reference imagery
    soul_id_status: blocked for minor subjects per Track C; available for adult Coach Marcus subject if he wants it
    subject_is_minor: MIXED  # SCHEMA-GAP: this field assumed boolean. Reality is mixed.
    # SCHEMA-GAP #2: model_release_status didn't exist in v1.0. Cramming it into a note.
    model_release_status_note: |
      Track C compliant. Marcus holds parent-signed releases for all 5 minor athletes.
      Release language explicitly covers AI-assisted/derivative imagery.
      Release does NOT cover reusable AI identity / Soul ID training (aligned with Track C point 4).
      Right to revoke at any time, 30-day removal.
      Marcus willing to warrant existence of releases in writing.
    reference_images_provided: |
      Folder A: 14 photos of Tyrese
      Folder B: 9 photos of Jalen
      Folder C: 22 photos of gym/field/equipment
      Total: 45 images, all real training footage (NOT Soul ID-format headshots — would not be appropriate to train Soul ID on minors anyway, per Track C)
    color_palette: black, red, occasional gold/yellow (inferred from existing IG)
    aesthetic_keywords: ["dark gym", "serious", "production-quality", "shot-on-real-gear-not-phone", "Parisi-Speed-School-adjacent"]
    avoid_visually:
      - flashy / luxury imagery
      - the word "elite" in any graphic
      - AI-generated humans alongside real athletes (Marcus's explicit no — "don't make a fake teammate stand next to my kid")
      - AI alteration of mic'd-up audio from athletes (Marcus's explicit no)
      - non-clients appearing in content (Marcus's privacy constraint)

  voice:
    written_voice_examples:
      - "Another Saturday in the lab. We don't talk we work."
      - "Big shoutout to Tyrese for putting in 4 sessions this week. Mentality > everything."
      - "If you're sleeping you're losing. 6am tomorrow."
    avoid_phrases: ["elite"]

  scope:
    asset_types_needed: ["instagram_posts", "reels", "monthly_highlight_video", "sales_deck_slides"]
    cadence: weekly delivery; ~3-4 IG posts + 2 Reels per week; 1 monthly highlight video; sales-deck assets as needed
    distribution: Instagram primary; parent-meeting sales decks (internal use)

  constraints:
    industry_restrictions: |
      TRACK C constraints apply in full:
      - All work using minor athletes' likenesses must be derivable from real footage the athlete is actually in (no fabricated scenarios)
      - No Soul ID / persistent AI identity for any minor subject
      - No AI-generated audio alteration of minor athletes' speech
      - Client (Marcus) bears primary responsibility for parent-side release status
      - Trail of Joy retains right to request releases at any time
    competitor_blacklist: "Florida 7v7 brands with flashy-money aesthetic"
    minor_imagery_flag: ALLOWED under Track C compliance — see model_release_status_note

  source_inputs:
    - transcript: practice-runs/capo-track-c/00-source-material.md (Source 1)
    - existing_assets: Capo IG bio + captions (from run #1, Source 2)
    - release_template: Capo's parent release (Source 2 of this run)
    - reference_images: 3 folders, 45 total real training photos (Source 3)
    - references_competitive: Parisi Speed School IG, The Stable Performance IG

  gaps_flagged_by_cbi:
    - "Marcus's Soul ID readiness: he's open to it for HIS OWN imagery; needs 3-5 clean headshots if he wants to be in asset variations he wasn't physically in"
    - "Sales-deck format spec not detailed (aspect ratio, slide count, branding)"
    - "Monthly highlight video length/format not specified"
    - "Distribution beyond Instagram is partially defined; YouTube/TikTok not confirmed"

  # SCHEMA-GAP #3: ready_for_next_agent is a single boolean. Reality is per-downstream-agent.
  # Forcing single value: false (because reference images aren't Soul ID-format for the adult, and Soul ID is the Agent 2 task).
  # But Agent 3 (copy/captions) could theoretically start now — schema can't express that.
  ready_for_next_agent: false
  ready_for_next_agent_BEND_NOTE: |
    Agent 2 (Style Lock / Soul ID training): NOT READY — only blocker is Coach Marcus's own headshots
      if he wants to be included via Soul ID (decision pending). Soul ID is correctly NOT being run
      on minor subjects.
    Agent 3 (Copy/captions): READY — voice examples, tone words, scope, constraints all populated.
    Agent 4 (Asset generation / individual outputs using real footage): READY — reference imagery
      adequate for environmental and athlete-real-footage-derived assets within Track C constraints.
    v1.0 schema cannot express this. v1.1 must fix.
```

---

## What this practice run confirmed about CBI v1.0

The three schema gaps I flagged in run #1 are now **fully demonstrated by a real example** rather than hypothesized:

1. **`subject_of_imagery` as a single field is broken.** This case has 6 subjects across 3 categories with different rules for each. The string-stuffing workaround above is the kind of thing that quietly causes downstream agents to misread inputs. Must become a list of `{type, identifier, is_minor, release_status, soul_id_allowed}` objects in v1.1.

2. **`model_release_status` must be a real field.** Right now it's living in a note. For Track C work specifically, this is the single most important field in the entire brief — downstream agents need to be able to programmatically check it. Must be a typed field in v1.1.

3. **`ready_for_next_agent` as a single boolean is wrong.** The Capo Track C case has Agents 3 and 4 ready to run while Agent 2 is still gated on a decision about Marcus's own headshots. Forcing this to a single boolean blocks unnecessary work. Must become per-agent in v1.1.

**Also newly revealed by Track C specifically:** the schema needs first-class fields for the things Track C exists to manage:

4. **`track`** — explicit field: `A | B | C | N/A`. v1.0 has no way to mark a brief as Track C, which means downstream agents can't apply Track C's constraints automatically.

5. **`prohibited_AI_operations`** — a structured list of what the brief explicitly forbids the AI to do (Soul ID on minors, fabricated scenarios, AI audio alteration of minors, AI-generated humans alongside real athletes). v1.0 dumps these into `avoid_visually` and `constraints.industry_restrictions` as prose. For an AI workflow specifically, "what the AI must not do" deserves its own machine-readable field.

## Feedback log entries (per CBI SOP feedback-loop spec)

| # | Entry | Severity | v1.1 fix? |
|---|---|---|---|
| 5 | `subject_of_imagery` must be a list of typed objects, not a single string/value | High | Yes |
| 6 | `model_release_status` must be a typed field, not a note | High | Yes |
| 7 | `ready_for_next_agent` must be per-agent, not global boolean | High | Yes |
| 8 | New required field: `track: A | B | C | N/A` so downstream agents can apply track-specific constraints | High | Yes |
| 9 | New required field: `prohibited_AI_operations` as structured list | High | Yes |
| 10 | When client wants AI on their own (adult) likeness AND on minor subjects' likenesses, schema needs to clearly distinguish what's allowed per subject | Medium | Yes (covered by #5) |

## Recommendation

CBI v1.0 has done its job — it produced a brief, halted appropriately in run #1, exposed schema gaps in run #2, and now we know exactly what v1.1 must look like.

**Next step:** spec CBI v1.1 with the six fixes above (the original 3 from run #1 plus the 3 new Track-C-specific findings). Do NOT touch Agent 2 yet. The whole point of the practice-first approach was to find these gaps before downstream agents were built around a flawed input shape — and that worked. Two practice runs found six real issues that would have cost far more to fix later.

Want me to spec CBI v1.1 now, or pause here to talk through the Track C policy first?

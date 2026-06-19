# Creative AI Workflow — Agent 3: Copy & Caption Generator (CCG)
**Version:** 1.0
**Codename:** CCG
**Sequence position:** Agent 3 of N
**Hosting target:** Claude Code + VSCode, versioned in GitHub
**Status:** Schema + workflow spec. Operationalization (live agent calling an LLM with the locked voice fragment, feedback loop, auto-correction) is a Claude Code build at the desk.

**Dependencies:**
- Reads a valid Style Lock Document from SLS v1.0+
- Does not run unless `ready_for_downstream.agent_3_copy: true` in the lock
- Reads the parent CBI brief for source_inputs / constraints when context is needed

---

## Why this agent exists

Once SLS has locked the client's voice (the `voice_lock` block — voice_prompt_fragment, forbidden words, calibration examples), the next bottleneck is volume. A client like Capo needs 3-4 IG posts + 2 Reels + monthly highlight copy + occasional sales-deck text **every week**. That's 6-10 pieces of written copy per week, per client. Doing it by hand doesn't scale; doing it with a generic LLM call that doesn't know the client produces slop.

CCG is the agent that takes the locked voice and produces draft copy that actually sounds like the client — drafts a human reviews and ships, not "AI content that needs to be completely rewritten."

The honest measure of whether CCG is working: does the copy pass a "would Coach Marcus actually post this?" gut check with minimal editing? If yes, it's working. If every output needs heavy rewrites, the lock is weak (or CCG is ignoring it) and that goes back into the feedback loop.

## What CCG produces

Per request, a structured copy output:

```yaml
copy_output:
  request_id: [unique per request, e.g. "capo-w26-ig-1"]
  client_id: [from style lock]
  client_name: [from style lock]
  lock_version_consumed: [which SLS lock this was built from]
  built_by: CCG v1.0
  built_at: [ISO timestamp]
  track: [carried forward]

  request:
    asset_type: [instagram_post | instagram_reel | highlight_video | sales_deck_slide | story | thread]
    subject_focus: [from style lock's subjects list — which subject(s) this piece centers on]
    occasion: [what's this for — a session recap, a recognition post, a recruiting push, a sales-meeting slide]
    context_notes: [free-form — anything the requester wants the agent to know]

  drafts:
    - draft_id: 1
      hook: [opening line — most important, this is what stops the scroll]
      body: [main copy]
      cta: [if any]
      hashtags: [if applicable for the asset type]
      character_count: [number]
      voice_check_passed: [true | false]   # see workflow step 6
      voice_check_notes: [if false, what specifically failed]
    - draft_id: 2
      [same shape — produces 2-3 alternates per request]

  prohibited_check:
    forbidden_words_scan: [list of any forbidden words found in any draft — should always be empty; if not, the drafts containing them are rejected before output]
    prohibited_ai_operations_respected: [confirmation that no draft references fabricated scenarios, minor audio alteration, etc.]

  flagged_for_human_review: [true | false — true if the agent isn't confident a draft passes voice; never auto-ships]
  notes_for_reviewer: [things CCG wants the human to know — e.g. "draft 2's hook is strong but I'm uncertain about hashtag relevance"]
```

## CCG's workflow per request

1. **Read the Style Lock Document and validate.** Reject if `ready_for_downstream.agent_3_copy: false`. Reject if voice_lock fields are missing.

2. **Read the request.** Asset type, subject focus, occasion, context.

3. **Verify the subject focus is allowed.** Cross-check against the brief's subjects list — if the focus subject is a minor under Track C, that's fine for copy (Track C doesn't restrict text about minors the way it restricts visual generation of them), but the copy must not reference fabricated scenarios involving them or claim they did something they didn't.

4. **Construct the prompt to the underlying LLM** using the locked voice_prompt_fragment as the primary system instruction, followed by the asset type's format requirements (IG caption = short, declarative, ~125 chars before "more"; Reel caption = hook in first 3 words; sales-deck = ultra-tight), followed by the specific request context. The voice fragment is the load-bearing part. Never paraphrase it; pass it verbatim.

5. **Generate 2-3 drafts.** Variation matters — clients pick. Each draft should genuinely differ in angle (a recognition draft, a tough-love draft, a setup-for-tomorrow draft), not three rewrites of the same line.

6. **Run the voice check on each draft.** This is the part that separates CCG from "just call ChatGPT":
   - Hard fail: any forbidden word from voice_lock.forbidden_words_phrases appears
   - Hard fail: an exclamation mark appears in a voice that bans them, etc. (per the voice_prompt_fragment's specific rules)
   - Soft check: does the draft's average sentence length, vocabulary, and structure look like the calibration examples? A draft of 4 sentences when the calibration is 1-2 sentences is suspicious. Flag, don't auto-reject — but mark `voice_check_passed: false` and `flagged_for_human_review: true`.

7. **Run the prohibited operations check.** No draft can reference scenarios that didn't happen (especially involving minors). If the request asks for copy about a play that happened, fine. If it asks for copy implying a play that didn't happen — refuse the request, don't produce drafts.

8. **Output the structured drafts.** Always include the voice_check_notes and any flags so the reviewer can act on them, not just stare at three captions.

## What CCG explicitly does NOT do

- **Does not auto-publish.** Output goes to a human for review every time. The exit gate from CCG to the world is human approval, not an automation.
- **Does not generate copy about events that didn't happen.** No "imagine Tyrese hitting a game-winner" copy unless Tyrese actually did. This protects against fabricated-scenario drift for any subject, and is enforced for minor subjects specifically per Track C.
- **Does not modify or paraphrase the voice_prompt_fragment.** If the lock says "no exclamation marks," CCG doesn't decide today is the exception.
- **Does not invent client-specific facts.** If a request asks for a caption about "this week's session" and CCG doesn't know what happened in this week's session, it asks the requester for context — it does not invent the session.
- **Does not produce content that flatters or hypes the client beyond what the voice supports.** Capo's voice is "earned, work-first, no hype." If a request comes in asking for hype copy, CCG produces drafts in Capo's actual voice and flags the request as off-brand, with a note to the reviewer.

## How CCG handles asset-type variation

Different asset types need different shape. The voice stays the same; the format flexes.

| Asset type | Format rules CCG applies |
|---|---|
| `instagram_post` | Hook in first ~125 chars (above "more"). Body up to ~2200 chars but most should be tighter. Hashtags optional, max 5, on-brand only |
| `instagram_reel` | Hook in first 3-5 words (Reel captions are barely read past the first line). Total caption ≤ 150 chars typical. Text-overlay copy if requested is its own field |
| `story` | Ultra-short. ≤ 50 chars. No hashtags |
| `highlight_video` | Title + 1-2 line description. Separate "text overlay beats" field for in-video text |
| `sales_deck_slide` | Headline + 1-3 supporting bullets. No hashtags, no emojis unless brand explicitly uses them |
| `thread` | First post is the hook. Subsequent posts each carry one beat. Sequence makes sense if read in order |

These are baseline rules. SLS lock or specific client constraints can override (e.g., Capo bans "elite" — that overrides every asset type).

## Feedback loop

Per copy_output that gets used:

1. **Which draft did the reviewer pick?** Over time, patterns emerge — drafts that lean into recognition vs. drafts that lean into challenge. This tells you what the client's audience responds to.
2. **What did the reviewer edit before posting?** If recognition draft was picked but the reviewer always trims the hashtags, that's a lock signal — hashtags aren't really part of the brand.
3. **Voice drift events:** when a draft passed the voice check but the reviewer says "this doesn't sound like me," the soft check needs sharpening. Log the specific draft + the reviewer's "this is what's wrong" note. After 3-5 of these for a single client, refresh the calibration examples in SLS's voice_lock.
4. **Forbidden-word near-misses:** when the soft check flagged a draft for sentence-length drift, was that drift actually a problem? If yes, tighten. If no, the soft check is overly anxious — relax it.
5. **Subject-focus errors:** any time CCG produces copy about a subject not in the lock's subjects list (would only happen on a buggy run) — log immediately, treat as a P0.

## Practice test plan

Run CCG against the Capo Track C lock (03-sls-v1.0-style-lock.md), generating one of each asset type:
- 1 Instagram post (subject: Tyrese — a recognition piece for his 4 sessions this week)
- 1 Instagram Reel caption (subject: gym/environment — a "Saturday in the lab" piece)
- 1 sales-deck slide (subject: Coach Marcus — a "what makes Capo different" slide for parent meetings)

Expected behavior:
- All drafts pass the forbidden-word check (no "elite," no luxury language)
- Drafts feel like Marcus's actual voice (short, declarative, work-first)
- The sales-deck slide is the test of restraint — it would be easy to drift into hype-mode here; CCG should NOT
- No draft references events that didn't happen — recognition draft for Tyrese only works if the brief/lock includes the fact that he did 4 sessions this week, otherwise CCG should flag missing context

If all three asset types come out cleanly, CCG v1.0 is working. If the sales-deck slide drifts to hype-mode, the voice fragment isn't strong enough at the "no hype even when selling" instruction and SLS gets a v1.1 fix.

## Exit gate for CCG v1.0
- [ ] Schema produced and version-controlled
- [ ] Capo Track C practice run produces clean drafts across at least 3 asset types
- [ ] At least one real client uses CCG output (with human review) and ships it
- [ ] First three feedback log entries captured
- [ ] No instance of forbidden words appearing in any output (would be a P0 bug)

## Revision History
- v1.0 — First spec for Copy & Caption Generator. Treats voice_lock as load-bearing (passed verbatim to underlying LLM, never paraphrased). Always produces 2-3 drafts with genuine angle variation, never one draft. Runs hard forbidden-word check (auto-reject) + soft voice check (flag, don't reject). Never auto-publishes — always goes to human. Refuses to generate copy about events that didn't happen, protecting against fabricated-scenario drift for any subject and enforcing it strictly for minor subjects per Track C.

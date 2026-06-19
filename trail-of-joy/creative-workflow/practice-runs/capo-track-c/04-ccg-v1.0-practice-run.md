# Capo Track C — CCG v1.0 Practice Run
**Run by:** CCG v1.0
**Consumes:** 03-sls-v1.0-style-lock.md (lock version 1.0)
**Practice case:** Yes
**Outcome:** Three asset types produced. Two real issues surfaced — see end of doc.

**Context note:** Per CCG step 4, the recognition post for Tyrese assumes Marcus has confirmed Tyrese did 4 sessions this week. In a real run, that fact would come from the request context, not be inferred. I'm treating it as confirmed for practice purposes only.

---

## Request 1 — Instagram post: Tyrese recognition

```yaml
copy_output:
  request_id: capo-w26-ig-1
  client_id: capo-athletics-2026
  client_name: Capo Athletics
  lock_version_consumed: 1.0
  built_by: CCG v1.0
  built_at: 2026-06-19T23:18:00Z
  track: C

  request:
    asset_type: instagram_post
    subject_focus: ["Tyrese (athlete)"]
    occasion: "Recognition — Tyrese put in 4 sessions this week, want to call it out"
    context_notes: "Marcus confirmed the 4 sessions actually happened this week (per practice assumption — see top note)"

  drafts:
    - draft_id: 1
      angle: "straight recognition"
      hook: "Big shoutout to Tyrese."
      body: "4 sessions this week. Mentality > everything. Keep showing up."
      cta: ""
      hashtags: []
      character_count: 81
      voice_check_passed: true
      voice_check_notes: "Closely mirrors calibration example #2. Short. No filler. No hype."

    - draft_id: 2
      angle: "challenge / set the bar"
      hook: "Tyrese put in 4 this week."
      body: "Who's matching that next week. Standards are set in the gym, not the group chat."
      cta: ""
      hashtags: []
      character_count: 119
      voice_check_passed: true
      voice_check_notes: "Slightly longer than calibration average but stays declarative. The 'group chat' line is a small risk — confident voice or trying too hard? Reviewer call."

    - draft_id: 3
      angle: "setup for tomorrow"
      hook: "Saturday work pays Monday."
      body: "Tyrese in 4 days this week. The kids who get drafted are the kids who keep showing up. 6am tomorrow."
      cta: ""
      hashtags: []
      character_count: 122
      voice_check_passed: false
      voice_check_notes: "FAILED soft check: 'The kids who get drafted' is a recruiting promise I don't have authority to make for the brand. Marcus might be fine saying this, but it's a stronger claim than the calibration examples support. Flagging for human review — could be fine, could be off."

  prohibited_check:
    forbidden_words_scan: []
    prohibited_ai_operations_respected: "Yes — no fabricated scenarios, no AI-generated humans referenced, copy is about a real event Marcus confirmed."

  flagged_for_human_review: true
  notes_for_reviewer: "Draft 1 is safest and most on-voice. Draft 2 is the strongest hook but contains the 'group chat' line — call. Draft 3 failed voice check — I included it so you can see the failure case, but I'd recommend rejecting it unless Marcus actively wants to lean into the recruiting-promise tone."
```

---

## Request 2 — Instagram Reel caption: gym/Saturday session

```yaml
copy_output:
  request_id: capo-w26-reel-1
  client_id: capo-athletics-2026
  client_name: Capo Athletics
  lock_version_consumed: 1.0
  built_by: CCG v1.0
  built_at: 2026-06-19T23:18:30Z
  track: C

  request:
    asset_type: instagram_reel
    subject_focus: ["Gym / field / equipment"]
    occasion: "Saturday session footage — a 'this is what we do' atmospheric piece"
    context_notes: "Mood piece, not about any one athlete. Marcus wants the gym/work-energy to be the subject."

  drafts:
    - draft_id: 1
      angle: "the work is the point"
      hook: "Another Saturday in the lab."
      body: "We don't talk we work."
      cta: ""
      hashtags: []
      character_count: 50
      voice_check_passed: true
      voice_check_notes: "Verbatim from calibration example #1 split across hook + body. Almost too on-the-nose — this is essentially recycling Marcus's existing caption. Could be a feature (he likes it, it works) or a bug (uninspired). Reviewer call."

    - draft_id: 2
      angle: "the room speaks"
      hook: "6am."
      body: "Plates loaded before the lights warm up."
      cta: ""
      hashtags: []
      character_count: 51
      voice_check_passed: true
      voice_check_notes: "Tight. Matches the style_preamble's 'serious, work-first' mood. Anchors the visual without naming an athlete — good for Track C since no specific minor subject is needed."

    - draft_id: 3
      angle: "earned, not given"
      hook: "Nobody hands you Friday lights."
      body: "Saturday earns them."
      cta: ""
      hashtags: []
      character_count: 49
      voice_check_passed: true
      voice_check_notes: "Slightly more poetic than calibration examples — risk of drifting away from Marcus's blunter voice. Stays within tone_words ('earned, work-first') but it's at the edge."

  prohibited_check:
    forbidden_words_scan: []
    prohibited_ai_operations_respected: "Yes — environmental subject only, no minors referenced."

  flagged_for_human_review: false
  notes_for_reviewer: "All three pass. Draft 2 is probably the strongest for the Reel format — short, atmospheric, lets the visual carry. Draft 1 plays it safe by recycling. Draft 3 is the swing — does Marcus's voice ever go a little poetic, or stay blunt?"
```

---

## Request 3 — Sales-deck slide: "what makes Capo different" for parent meetings

```yaml
copy_output:
  request_id: capo-w26-deck-1
  client_id: capo-athletics-2026
  client_name: Capo Athletics
  lock_version_consumed: 1.0
  built_by: CCG v1.0
  built_at: 2026-06-19T23:19:00Z
  track: C

  request:
    asset_type: sales_deck_slide
    subject_focus: ["Coach Marcus"]
    occasion: "Slide for parent intake meetings — positions Capo as the 'real training, not flash' option"
    context_notes: "Slide will accompany a verbal pitch from Marcus. Headline + 1-3 supporting bullets."

  drafts:
    - draft_id: 1
      angle: "lead with the standard"
      hook: "Headline: Real training. No hype."
      body: |
        Supporting bullets:
        • Plano-based · DBs and WRs · 18 months in
        • Small roster, individualized programming
        • Same standard for every athlete, every session
      cta: ""
      hashtags: []
      character_count: 168
      voice_check_passed: true
      voice_check_notes: "On voice. Headline is direct and avoids the forbidden 'elite.' Bullets are factual, not selling — matches Marcus's restraint."

    - draft_id: 2
      angle: "what they get vs what they don't"
      hook: "Headline: Your athlete works. We coach. Nothing else."
      body: |
        Supporting bullets:
        • No camp-day hype videos that overstate progress
        • No filler — every session has a purpose
        • Your athlete earns their growth, week by week
      cta: ""
      hashtags: []
      character_count: 201
      voice_check_passed: true
      voice_check_notes: "Sharper angle. The 'no camp-day hype videos' line directly contrasts Capo against the Florida 7v7 brands Marcus called out. Risk: could read as throwing shade at competitors during a parent pitch. Reviewer call on tone."

    - draft_id: 3
      angle: "the soft version"
      hook: "Headline: Where committed athletes train."
      body: |
        Supporting bullets:
        • Position-specific work for DBs and WRs
        • Small group ratios, real coaching attention
        • Built for athletes ready to show up consistently
      cta: ""
      hashtags: []
      character_count: 188
      voice_check_passed: false
      voice_check_notes: "FAILED soft check: 'Where committed athletes train' is generic positioning that could be any training program in the country. It's grammatically Capo-voice (short, declarative) but it's missing the specificity and edge the calibration examples carry. This is the 'AI-generic athletic content' failure mode the SOP explicitly warned against."

  prohibited_check:
    forbidden_words_scan: []
    prohibited_ai_operations_respected: "Yes — no minor subjects in slide focus, no fabricated claims, all bullets verifiable."

  flagged_for_human_review: true
  notes_for_reviewer: "Draft 1 is the safe, on-brand option. Draft 2 is the strong-position option but reviewer should decide whether 'no camp-day hype videos' reads as confident vs throwing shade. Draft 3 failed voice check — included so you see the generic-positioning failure mode. Recommend rejecting Draft 3."
```

---

## What this run actually surfaced

### Issue 1 — The voice check correctly caught Draft 3 of the sales deck (the generic-positioning failure), but only because I was watching for it

Looking at Draft 3 honestly: it's grammatically correct, format-correct, forbidden-word-clean. A purely mechanical voice check (sentence length, forbidden words) would pass it. What flagged it was the soft check noticing "this could be any training program" — which is the exact failure mode I was supposed to catch.

But that's also the thing the SOP describes as a "soft check" — and a soft check that's this important shouldn't really be soft. The SOP says soft checks "flag, don't reject." I want to flag this back as a real CCG v1.1 concern: **the generic-positioning failure mode might deserve a hard reject, not a soft flag.** Otherwise the busy-reviewer case is "all three drafts look fine at a glance, ship Draft 3, content goes out sounding like every other AI training-program content in the country."

Possible v1.1 fix: a specific check for "does this draft contain phrases that would appear identically in 50 other clients' decks?" — that's harder to implement than a forbidden-word scan, but it's the actual quality gate.

### Issue 2 — The recognition draft (#3 of Request 1) failed the voice check for a Track C-relevant reason

Draft 3 of the Tyrese recognition post said "The kids who get drafted are the kids who keep showing up." That's a *recruiting outcome claim* about a minor athlete. Even though it doesn't reference fabricated events, it's making a forward-looking promise about Tyrese's recruiting future that:

(a) Marcus may not actually be authorized to make on Tyrese's behalf to the public (Tyrese's parents are the ones with that authority)
(b) Could read to other parents as Capo claiming credit for kids' recruiting outcomes when those outcomes haven't happened yet

The voice check caught it as "stronger claim than calibration examples support." But the real issue is bigger — it's a Track C-adjacent concern that CCG v1.0 doesn't have explicit machinery for. **Forward-looking claims about minor subjects' futures (recruiting, college, professional outcomes) should probably be a structured prohibited_ai_operation, not relied on the soft voice check to catch.**

### What v1.0 did well

- The Reel captions came out clean and tight. The atmospheric "6am. Plates loaded before the lights warm up." (Draft 2) is the kind of output that justifies CCG's existence — it's specifically on-brand and could not have been generated by a generic prompt.
- Three genuinely different angles per request, not three rewrites of the same draft. That's the variation pattern the SOP demanded and it held.
- Forbidden-word scan worked on all three requests. No "elite," no hype language.
- The Track C prohibition against fabricated scenarios was respected — none of the drafts claim anything that didn't happen (subject to the context note at the top of this doc).

## Feedback log entries

| # | Entry | Severity | v1.1 fix? |
|---|---|---|---|
| 1 | Generic-positioning failure mode (Draft 3 of sales deck) needs a harder check than the soft voice scan | High | Yes — CCG v1.1 should add a "distinctiveness check" |
| 2 | Forward-looking claims about minor subjects' futures need their own prohibited_ai_operation | High | Yes — should be added to CBI v1.2 and carried through SLS + CCG |
| 3 | When request context references a real event ("Tyrese did 4 sessions this week"), CCG should require that context come from the requester explicitly, not be assumed | Medium | Workflow fix — make the context-confirmation step explicit in CCG's workflow |

## Recommendation

CCG v1.0 worked, with two real findings that aren't blockers for moving forward but are real:

1. The generic-positioning check needs to be harder than soft. That's a CCG v1.1 fix.
2. Forward-looking recruiting/outcome claims about minor subjects need a structured prohibition. That's a CBI v1.2 fix (adds to the auto-inserted prohibited_ai_operations list for minor subjects) that flows through SLS and CCG.

Neither blocks deciding what Agent 4 (asset generation — the actual image/video) looks like. But both should be addressed before this whole chain goes near a real client.

Want me to spec Agent 4 next, or pause to address the two real findings (v1.1 of CCG + v1.2 of CBI) first?

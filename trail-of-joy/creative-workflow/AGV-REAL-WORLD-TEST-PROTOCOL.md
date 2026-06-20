# AGV Real-World Test Protocol
**Version:** 1.0
**Status:** Structured test protocol for at-desk execution. Pairs with `AGENT-4-AGV-asset-generation-validation.md` v1.1.

**Why this exists:** Every prior agent in the creative workflow (CBI, SLS, CCG, DSC) was practice-tested on paper because their inputs and outputs are text. AGV is different — its core job (validating a real generated image or video against the lock and prohibited operations) requires an actual generated artifact to inspect. The AGV v1.0 practice run (`practice-runs/capo-track-c/05-agv-v1.0-practice-run.md`) confirmed prompt construction logic works on paper, but explicitly flagged that **output validation cannot be tested without a real Higgsfield generation**. This protocol is what to do at your desk to actually close that gap.

**Honest scope:** I cannot run Higgsfield from here. This protocol is what YOU run at your desk, with Higgsfield open, real reference photos, and real eyes on the output. The deliverable from this test is your own confidence (or lack of it) that the validation step actually catches problems — and a documented record of what happened so future versions of AGV can learn from it.

**Time budget:** ~60-90 minutes for the full protocol including the three test cases. Don't rush it — this is the test that determines whether AGV is real or just on paper.

---

## Pre-test setup (do this before running any case)

**Step 0.1 — Confirm Higgsfield account is active and you have credit budget for ~10-15 generations.** Different test cases will consume different amounts; budget around 50-100 credits as a rough estimate but check Higgsfield's current pricing.

**Step 0.2 — Pick the test subject.** This is the most important decision in this whole protocol. Options:

| Option | Pros | Cons | Recommendation |
|---|---|---|---|
| **You yourself, as an adult** | No minor-safety risk; you control all consent; clean Soul ID test | Doesn't test the actual highest-stakes path (minor subject) | Use for Test Cases 1 and 2 |
| **Carson (real minor, with parent consent)** | Tests the actual Track A path with real stakes | Requires real signed consent agreement v1.1 — not yet in place per known status; should NOT proceed without it | Skip until signed consent exists |
| **Fictional minor subject** | Lets you test the minor-handling path safely | Doesn't actually use a real minor's photos (you'd need to source generic photos — defeats the purpose of validating that source-footage rules work on real material) | Don't recommend; too synthetic to test the real failure modes |
| **Yourself with a constructed "treat-as-minor" simulation** | Lets you walk through what the workflow would do for a minor subject even though you're an adult | Doesn't test the real Soul ID prohibition since you ARE allowed Soul ID; only tests prompt construction and validation logic | Use for Test Case 3 as a partial test |

**Recommended:** Run Cases 1 and 2 with yourself as the real subject (adult, fully consented to be in the test). Run Case 3 as a constructed scenario where you walk through the minor-subject pathway logically, marking any spot where the actual real-minor case would differ — this gets you most of the value without requiring a real signed consent agreement to be in place first.

**Step 0.3 — Prepare reference imagery.** For the adult Soul ID test cases, take or gather 3-5 reference photos of yourself per Higgsfield's stated guidance:
- Clean, varied angles
- Consistent lighting (avoid heavy shadows, sunglasses, cropped faces)
- At least one full-height shot if possible
- Resolution and format per Higgsfield's current upload requirements

**Step 0.4 — Open the AGV v1.1 SOP in another window** (`AGENT-4-AGV-asset-generation-validation.md`). You'll be referencing the validation checklist directly during each test.

**Step 0.5 — Create a test log file.** Just a text file or doc where you'll write down what happened. The point of this whole exercise is the log. Without it, the test was just you playing with Higgsfield.

---

## Test Case 1 — Construction-only walkthrough (no actual Higgsfield generation yet)

**Purpose:** Validate that AGV's prompt construction step (Workflow Step 5) actually produces a well-formed Higgsfield-pasteable prompt. This case doesn't burn any credits — it's a dry run to make sure the construction logic gives you something usable before you spend credits.

**What to do:**

1. Take the Capo Track C Style Lock Document (`practice-runs/capo-track-c/03-sls-v1.0-style-lock.md`) and the Tyrese-style request from Practice Run 05 Request 3 as your inputs. But substitute YOURSELF as the subject instead of Tyrese — adult, Soul ID allowed.

2. Walk through AGV's Workflow Steps 1-5 manually:
   - Step 1 (version check): does the lock have a `stale_brief_warning`? Note yes/no.
   - Step 2 (lock validation): does `ready_for_downstream.agent_4_asset_generation` permit you as a subject? Note yes/no.
   - Step 3 (subject validation): is "you" in the subjects list? You'll need to mentally add yourself to the lock for this exercise — note that you did so.
   - Step 4 (source footage reference): for an adult subject this isn't required; skip and note skipped.
   - Step 5 (prompt construction): actually build the prompt by combining style preamble + Soul ID handle (or "your_soul_id" as placeholder if not yet trained) + palette + composition + negative prompt block.

3. **Write the constructed prompt down in your test log.** This is the artifact you would actually paste into Higgsfield in the next step.

4. **Inspect the prompt critically.** Does it:
   - Include the full style preamble verbatim from the lock?
   - Reference the Soul ID handle explicitly?
   - Include a clear negative prompt block listing the prohibited operations (no AI-generated humans alongside real subjects, etc.)?
   - Read as something a generation platform would actually act on, or does it read as wishful prose?

**Log what you find.** If the prompt reads as well-formed: pass, move to Case 2. If it reads as weak or unclear: that's a finding about AGV's construction logic that needs a v1.2 fix, BEFORE you spend credits on real generation.

**Expected time:** 15-20 minutes.

---

## Test Case 2 — Real Higgsfield generation with Soul ID (adult subject = you)

**Purpose:** Validate that AGV's post-generation validation step (Workflow Steps 7-9) actually catches the things it's supposed to catch — including the things only a human looking at a real image can verify.

**Prerequisites:**
- Case 1 completed (you have a constructed prompt ready)
- You've trained a Soul ID of yourself in Higgsfield (per the platform's standard process — 3-5 reference photos, training run completes successfully)
- You have your trained Soul ID handle ready to paste in

**What to do:**

1. **Take the Case 1 prompt and update it** with your real trained Soul ID handle (replace any placeholder). Paste into Higgsfield. Run the generation.

2. **When the output returns, fill out AGV's full audit-trail block** in your test log:
   - `file_reference`: filename or URL
   - `generated_at`: timestamp
   - `higgsfield_metadata`: what credits were used, what Soul ID was invoked

3. **Run AGV's HARD validation checks (Workflow Step 8) manually,** writing each result in your log:

   - **Subject presence/absence check:** Is the visible subject actually you? Does the rendered Soul ID look like you, or has it drifted to "generic person with similar features"? Be honest — this is the validation question that matters most for Soul ID-based generation.
   
   - **Prohibited-element check:** Look at the image. Are there other people in the frame who weren't supposed to be there? Any AI-generated humans alongside you? Anything you'd describe as a "fabricated scenario"? Anything that looks like forward-looking imagery (uniforms of teams you're not on, etc.)? Be specific about what you see.
   
   - **Aesthetic check:** Does the output match the locked aesthetic — the documentary sports training feel, the dark gym lighting, the palette? Or has Higgsfield interpreted "documentary sports training" as something more generic (a clean studio shot, an over-bright commercial look)?
   
   - **Soul ID metadata check:** Does Higgsfield's generation metadata confirm your Soul ID was actually invoked, or did it generate without the lock?

4. **Run the SOFT checks (Workflow Step 9):**
   - Composition strength: is this a strong frame, or does it read as flat "AI image"?
   - Voice/tone resonance: would a real Capo client (or whoever) say "yes, that's our brand"?
   - Soul ID fidelity over time: this can't be assessed in one generation; flag for future tracking.

5. **Set the approval_status** in your log: APPROVED, REJECTED, or FLAGGED_FOR_HUMAN_DECISION. Be honest. If you'd reject it but feel pressure to call it good because you just spent credits, reject it anyway and write down why.

6. **The actual test result:** Did your manual validation catch things the AGV SOP's checklist would have caught? Or did it catch things the SOP missed? Or did the SOP demand checks that don't actually map onto what you can see in the image? Each of these is a finding.

**Expected time:** 30-45 minutes including the Soul ID training step if not already done.

---

## Test Case 3 — Construction walkthrough for minor-subject pathway (no real generation)

**Purpose:** Validate that AGV's construction logic correctly REFUSES to use Soul ID for a minor subject, and routes correctly to prompt-anchors-only generation. This is testable on paper because the rejection happens BEFORE generation — the test is whether the SOP and the agent's logic actually refuse, not whether the output is correct.

**What to do:**

1. **Construct a hypothetical request:** "Generate an asset featuring [minor athlete X] doing [some training activity]." Use the Tyrese example from Practice Run 05 Request 3 — same subject, same setup.

2. **Walk through AGV's Workflow Steps manually, watching for refusal points:**
   - Step 2: Does the lock's `subjects` list have Tyrese with `soul_id_allowed: false`? Yes — confirmed in the practice lock document.
   - Step 3: Subject validates as in the lock. Proceed.
   - Step 4: Source footage reference REQUIRED for minor subject. Per the practice lock, Folder A has 14 photos of Tyrese — pass.
   - Step 5: Now the critical refusal. When constructing the prompt:
     - Does AGV reach for a Soul ID handle for Tyrese? **It should NOT.** Soul ID is prohibited. It should reach for the prompt-anchors instead.
     - Does the negative prompt block include "no Soul ID for this subject" as one of the prohibited operations? **It should.**

3. **Build the prompt anyway** as a paper exercise (don't actually run it). Write it down.

4. **Inspect for what would have leaked through if AGV had been sloppy:**
   - Any reference to a Tyrese Soul ID handle? Bug.
   - Any prompt phrasing that implies a fabricated scenario? Bug.
   - Any forward-looking framing? Bug.
   - Negative prompt block missing any of the Track C prohibitions? Bug.

5. **Log the result.** If AGV's construction logic, walked through manually, refuses Soul ID for the minor and routes to anchors correctly: pass. If anything leaks through: that's a real finding requiring AGV v1.2.

**Expected time:** 15-20 minutes.

---

## What this test protocol does NOT cover

- **Doesn't test the actual minor-safety rules against a real generated image of a real minor.** That requires real signed consent first, and isn't worth doing in the test phase — the construction-side refusal (Case 3) gets most of the value.
- **Doesn't test rate limits, credit costs, or Higgsfield platform reliability** — those are real concerns but operational, not validation-logic concerns.
- **Doesn't test the full DSC distribution step** since that would require posting to a real platform — that's its own future test.
- **Doesn't iterate AGV based on findings.** This protocol generates findings; updating AGV to a v1.2 based on what you find is a separate step. Run the test first, see what breaks, then decide what to fix.

## What to do with the test log after running

1. **Save the log to `trail-of-joy/creative-workflow/agv-real-tests/test-01-results-[YYYY-MM-DD].md`** so it lives with the other workflow documents.
2. **If anything failed, write a separate "findings" doc** that lists what needs to change in AGV v1.2. Don't try to fix in the moment — the test was the test; the fix is its own decision.
3. **If everything passed,** AGV is no longer on-paper-only. That meaningfully changes the launch-readiness picture: the most-flagged unknown ("output validation untested") becomes "output validation tested, here are the limits we found." That's a real gate cleared.

## Exit gate for this test protocol being complete
- [ ] Test log saved with at least Cases 1 and 3 completed (Case 2 only if Soul ID training works and credits are available)
- [ ] If anything was rejected by the manual validation, documented WHY it was rejected
- [ ] Any findings (things the SOP missed, demanded, or didn't map to reality) captured for AGV v1.2 consideration
- [ ] The "untested" status of AGV's validation step replaced with "tested at desk on [date], findings: [...]" in the AGENT-4 doc's known-open-items section

## Revision History
- v1.0 — First structured test protocol for AGV's at-desk real-Higgsfield-generation test. Three cases: construction-only walkthrough, real generation with adult subject (Soul ID), construction walkthrough for minor-subject pathway. Designed for ~60-90 minute execution including reflection and logging. Explicit about what it does NOT cover and why some things have to wait for real signed consent or real client engagement.

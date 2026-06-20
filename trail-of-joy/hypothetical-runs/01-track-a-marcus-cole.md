# Hypothetical Full Run — Track A — "Marcus Cole" (fictional creator)
**Purpose:** End-to-end rehearsal of the entire Trail of Joy system for a Track A engagement (SubjectSkillz minor creator), from first contact through live content distribution. No real client involved; all names, dates, conversations, and decisions are hypothetical. The point is to find every gap, handoff, and unwritten step the existing documents have left implicit.

**Assumption convention:** `[ASSUMED: ...]` flags every place I'm making a judgment call you'd actually make. `[GAP: ...]` flags every place I find that the system has no spec for at all.

**The fictional client:** Marcus Cole, 15 years old, freshman wide receiver at a high school in Cedar Park, TX (north of Austin). Already runs an Instagram (@mcole_visuals, fictional) where he posts sports edits — about 800 followers. Wants to start a paid coverage business modeled on what he's seen creators like Carson do. Parent is Lisa Cole, a school counselor.

---

## Stage 0 — First contact

**Hypothetical scenario:** Lisa Cole DMs Subject Medias' Instagram after seeing Carson's CMC Visuals storefront. Asks if "this is something kids can actually do."

[ASSUMED: Initial contact is DM, not email or phone. In reality this could come through any channel; pipeline shouldn't assume one.]

**System response:** No existing doc covers "what's the first reply to a parent DM about onboarding a minor creator." The closest thing is the SCALE-INTAKE-SOP, which assumes Stage 1 starts at a discovery call. There's no documented response template, no "first 24-hour" workflow.

**[GAP #1: No first-contact response template exists.]** This is a real gap because Lisa's DM is the moment trust starts forming. A good first response sets the tone for everything; a bad one (or no response for two days) loses the lead. Worth a small SOP addition later: a 1-paragraph response template + a 24-hour response standard.

**Action taken in this run:** I'll assume Subject Medias responds within 4 hours with a brief intro to SubjectSkillz, a sentence about how the creator program works (kid runs business, parent oversight, 80/20 split), and a link to schedule a discovery call. [ASSUMED: response timing 4 hours; in reality this depends on who's monitoring the DM.]

---

## Stage 1 — Discovery call (SCALE-INTAKE-SOP step)

**Hypothetical scenario:** 30-minute video call with Marcus and Lisa together. The SCALE-INTAKE-SOP's intake form (the 8-field structure) is the agenda.

**Using the creator-intake-form.html tool**, the captured intake JSON would be:

```yaml
intake:
  kid_name: Marcus Cole
  kid_age: 15
  kid_location: Cedar Park / north Austin
  parent_name: Lisa Cole
  parent_contact: [phone + email captured]
  sport: football (WR)
  team_program: high school varsity + offseason 7v7
  brand_direction: personal_brand
  existing_social: "@mcole_visuals on IG, ~800 followers, posts sports edits"
  starting_package_interest: "Photo Coverage $49 — wants to start small"
  third_party_footage_flag: YES — will be shooting at team events with other players in frame
  captured_at: [hypothetical date]
```

**Critical step from SCALE-INTAKE-SOP that triggers here:** The third-party footage flag is YES. Per Part 2 of the intake SOP, this means the consent agreement requires the full Section 2-4 walk-through during onboarding (not rushed), and it activates the minor-safety gate on the master pipeline.

**Action taken:** Intake captured cleanly. Discovery call ends with a scheduled onboarding call for one week out, and the consent agreement is sent to Lisa via email *before* the onboarding call (per SCALE-INTAKE-SOP Part 6's "sent ahead of 1:1 calls so the call is Q&A not first-read" rule).

[ASSUMED: 1-week gap between discovery and onboarding. Could be shorter or longer in reality.]

---

## Stage 2 — Pre-onboarding (the gap between discovery and onboarding)

This is where things start to expose real gaps.

**What needs to happen in the gap:**
- The amended Track A consent agreement (v1.1, with Section 5 reposting language) gets sent to Lisa
- Lisa reads it, has questions, sends questions back
- Trail of Joy answers her questions
- She decides whether to proceed
- The SubjectSkillz Mentorship Agreement also needs to get sent — Section 1 of that agreement says it's between Trail of Joy, the Mentor, and the Parent — but **who's the Mentor at this stage?** Not assigned yet.

**[GAP #2: The Mentorship Agreement names a Mentor as a party, but a Mentor isn't assigned until after onboarding. So the agreement can't be signed at onboarding — there's no Mentor yet to sign it.]** This is a real chicken-and-egg problem in the existing paperwork. Either:
- The Mentorship Agreement is signed AFTER a Mentor is assigned (creating a second-call need), or
- The Mentor is assigned BEFORE the onboarding call (which means we're matching mentors before we've even confirmed the creator is onboarded), or
- The agreement gets restructured so the "Mentor party" is "Program Provider's assigned Mentor (TBD)" with the actual Mentor added by separate amendment when assigned

I think the third option is the cleanest, but it's a real document fix needed — the existing SUBJECTSKILLZ-MENTORSHIP-AGREEMENT-TEMPLATE.md needs a Section 1 revision.

**Action taken in this run:** I'll assume option 3 is the answer — the Mentorship Agreement template is restructured to handle "Mentor TBD" at signing. This is a real fix that goes into the gap list for later.

**Also exposed:**

**[GAP #3: There's no "onboarding packet" — the combined set of docs Lisa would receive in one email.]** Currently the system has separate templates (consent agreement, mentorship agreement, the storefront welcome flow from stage 8 of the master pipeline), but they're not bundled into one parent-facing packet. A real onboarding would either send them piecemeal (confusing) or someone would assemble a packet by hand each time. Worth a documented "Track A Parent Onboarding Packet" template that names the four/five docs to send and the order.

**Action taken:** I'll assume that packet exists in hypothetical form for this run.

---

## Stage 3 — Onboarding call

**Hypothetical scenario:** Second video call, Marcus + Lisa + Subject Medias rep. Per the SCALE-INTAKE-SOP, this is the call where signatures happen.

**What gets discussed and signed:**
1. **Consent agreement v1.1 walk-through.** Section 2 (third-party minors at events) gets the deeper walk-through per the intake's YES flag. Lisa asks a real question: "What if Marcus shoots a team event and a parent from the other team complains later?" — this isn't covered in the current Section 2 explicitly. The document says default-to-private, but doesn't say what happens *after* a complaint.

**[GAP #4: No "complaint response procedure" exists for third-party-minor incidents.]** Section 2 of the consent agreement establishes the rule; it doesn't say what to do when the rule isn't enough — when a parent from another team finds something already-posted and objects. Real-world this WILL happen eventually. The procedure should probably be: pull the content within 24 hours of complaint, document the complaint, review the original decision against Section 2's standard, decide if the rule needs sharpening. Worth a small addition to the consent agreement OR to a separate "Section 2 Incident Response" SOP.

**Action taken:** I'll answer Lisa's question hypothetically with what the response should be ("we pull it within 24 hours, no argument, then we review what went wrong"), and add it to the gap list.

2. **Section 5 (operator-reposting) walk-through.** Lisa reads it carefully. Asks: "If you take a picture Marcus took and put it on Subject Medias, and then I change my mind a month later, you'll really take it down?" The agreement says yes, within 7 business days. Lisa is satisfied with this.

[ASSUMED: Lisa accepts Section 5. In reality some parents will opt out entirely, and the agreement allows that.]

3. **Mentorship Agreement walk-through.** This is where Gap #2 surfaces in the live call. Without a Mentor named, the document is incomplete. We'd either say "we'll assign your Mentor within X days, and they sign then" — which is awkward — or we go with the restructured template.

4. **Stripe Connect / payout account setup.** This is where things get materially complicated. Per the existing infrastructure (the cmc-visuals codebase), Stripe Connect is the payout mechanism. The parent controls the account. **But there's a real question I want to flag:** at 15, can Marcus legally be associated with the Stripe Connect account at all, or is it entirely in Lisa's name with Marcus as a non-account-holder beneficiary?

**[GAP #5: The Stripe Connect setup for minor creators isn't documented in detail. The cmc-visuals codebase has the code; the actual "what does Lisa fill out" walk-through isn't written anywhere.]** This needs a "Parent Stripe Connect Walkthrough" doc — even a one-pager — because it's the most technically confusing step for a parent who isn't familiar with Stripe.

**Action taken:** I'll assume Lisa completes the Stripe Connect setup with help. The Stripe Connect account is in her name, Marcus is named as the creator/contractor in the business description.

5. **Signatures captured.** Consent agreement v1.1 signed. Mentorship agreement signed (or partially signed, per Gap #2). Saved per the existing internal note pattern to `pipeline-runs/marcus-cole-2026/consent-agreement-signed.md` (hypothetical path).

**End of stage 3:** Marcus is officially in. Mentor not yet assigned. Storefront not yet deployed.

[ASSUMED: Storefront deploy happens 2-3 days after onboarding.]

---

## Stage 4 — Mentor assignment

**Hypothetical scenario:** Trail of Joy assigns a Mentor. [ASSUMED: assigned within 5 business days.]

**[GAP #6: There's no documented Mentor assignment process.]** Who decides which Mentor matches which creator? What are the matching criteria (sport overlap, geography, age proximity)? Is there a Mentor pool? How are new Mentors added to the pool? The Mentorship Agreement template assumes a Mentor exists; no doc says where Mentors come from.

This is a meaningful gap. For Carson it would have been ad-hoc. At scale (50 conversations a week per the SCALE-INTAKE-SOP target), it can't be ad-hoc.

**Action taken:** I'll assume an ad-hoc match — a fictional Mentor named David Reyes (former college football WR, now coaches youth). David signs the Mentorship Agreement; Lisa is notified; the first mentorship session is scheduled.

[ASSUMED: David exists; in reality you'd be staring at a real shortage of qualified Mentors at scale, and that's its own real problem to solve.]

---

## Stage 5 — Storefront deployment

**Hypothetical scenario:** Marcus's storefront goes from preview to live. The cmc-visuals codebase exists as the template (per the practice work earlier in this whole project). For Marcus, this means:

- Fork the cmc-visuals repo into a new Marcus Cole repo (`mcole-visuals`)
- Edit `src/config/creator.config.js` to swap in Marcus's name, location (Cedar Park area, NOT precise address per the minor-safety guidance), packages, branding
- Connect the Stripe Connect account Lisa set up in Stage 3
- Deploy to Vercel
- Point a Marcus-specific domain (or subdomain) if applicable

**[GAP #7: The "fork cmc-visuals for a new creator" process isn't documented as a real SOP.]** I know it works because we built cmc-visuals knowing this was the pattern, but the actual step-by-step is not written down. For 50 creators, you (or whoever's deploying) would need to either remember the steps or fumble each time. Worth a one-pager: "Forking cmc-visuals for a new SubjectSkillz creator."

**Action taken:** I'll assume this happens cleanly with the existing cmc-visuals codebase as the template. Marcus's storefront is live at a hypothetical URL within 3 business days of onboarding.

---

## Stage 6 — First real shoot

**Hypothetical scenario:** Marcus shoots a 7v7 tournament one week after his storefront goes live. Three families have already booked Photo packages ($49 each). Two other families ask about packages on-site.

**Where the third-party minor issue actually hits:** Marcus is on the sideline. He gets a great shot of his client's son making a catch — perfect content. But the opposing team's DB is in the frame, identifiable. Per Section 2 of the consent agreement: this footage is delivered privately to the buying family. It is NOT posted to @mcole_visuals or used in any marketing.

This is a *real-life* test of the rule. Marcus and Lisa need to actually do this — sort photos at delivery time into "public-eligible" and "private-only" buckets. Per the existing doc, the decision is human-made, not automated.

**[GAP #8: There's no "post-shoot sorting workflow" for Marcus and Lisa.]** The consent agreement says the decision is human-made, but doesn't give them a *workflow* — "open Lightroom, mark each photo as public-eligible or private-only, then export accordingly." A 15-year-old who shot 600 photos at a tournament doesn't intuit this. Worth a simple checklist.

**Action taken:** I'll assume Marcus and Lisa sort the photos correctly. The 23 shots that include identifiable third-party minors go only to the buying families. The 41 shots that are wide/action-only get marked as eligible for public posting on @mcole_visuals.

---

## Stage 7 — Content goes live on Marcus's own page

**Hypothetical scenario:** Marcus posts a Reel highlighting his coverage from the tournament to @mcole_visuals. He writes the caption himself (he's 15 and has his own voice; this isn't going through the CCG agent yet because Marcus isn't a CCG client — *Capo* is the kind of client CCG serves, not Marcus).

**This is a real architectural question I want to flag:** The creative workflow (CBI → SLS → CCG → AGV → DSC) was built for **clients of Subject Medias** like Capo. It is not built for Subject Medias' own creators like Marcus. Marcus's content is his own; he writes his own captions, makes his own posting decisions. **The creative workflow doesn't actually touch Marcus's daily operation.**

**[GAP #9: The creative workflow is for Subject Medias' clients, not for Subject Medias' own SubjectSkillz creators. This isn't a bug, but it's a fact that wasn't stated explicitly anywhere.]** Worth one sentence in the master pipeline documenting: "The CBI→DSC creative workflow serves outside clients of Subject Medias' creative services (Track C), not the SubjectSkillz creator program (Track A). Track A creators run their own content."

**Action taken:** Marcus posts his content himself. No agent involvement.

---

## Stage 8 — The first operator-side repost

**Hypothetical scenario:** A few weeks in, Subject Medias wants to feature one of Marcus's photos on the @subjectmedias account — a great wide action shot, no third-party minor issues. Lisa is asked, per Section 5 of the consent agreement, for per-piece approval.

**This is where DSC v1.1's cross-population check fires for the first time on a real (hypothetical) Track A creator.** Source population: `track_a_creator` (Marcus). Destination population: `company` (Subject Medias). The check needs:
- The signed Track A consent agreement v1.1 (✓ — signed at stage 3)
- Lisa's per-piece approval (need to capture)
- Attribution to Marcus + link to @mcole_visuals in the post (need to set up)
- Compliance with minor-safety constraints (no AI training, no fabrication, no forward-looking claims about Marcus's future)

**Action taken:** Subject Medias asks Lisa via Postiz approval flow. She approves the specific photo. The post goes up with attribution to Marcus. DSC's audit trail captures: signed agreement reference, parent approval timestamp, attribution text, the embedded snapshot.

This works. The architecture holds for the simple case. 

---

## Stage 9 — A complication: Marcus wants to be in a Subject Medias-produced piece

**Hypothetical scenario:** Six weeks in, Subject Medias wants to make a "meet the SubjectSkillz creators" video for the @subjectmedias account, featuring Marcus and 3 other young creators. This is *different* from reposting Marcus's work — it's making *new* content *about* Marcus.

**Several systems converge here:**
1. Section 5 of the consent agreement covers reposting of Marcus's *own work*. It doesn't cover Subject Medias creating new content using Marcus as a *subject*.
2. The Subject Media Videographer Services Agreement covers content shot by Subject Medias' contracted videographers — that's the contract for whoever's filming the "meet the creators" piece.
3. The contractor-minor-footage-overlap-rule applies — Marcus is a minor; the videographer is filming him; the third-party-minor consent rules apply.

**[GAP #10: There's no documented consent path for "Subject Medias creates new content using a SubjectSkillz creator as the subject."]** Section 5 doesn't cover it. The Videographer Agreement covers the videographer's side, not Marcus's. The Track A consent agreement assumes Marcus is the *creator*, not the *subject* of someone else's work.

The right fix is probably a per-project parent consent for any Subject Medias-produced content featuring a Track A creator as subject. Not a standing right. Per-project.

**Action taken:** I'll assume that consent is obtained for this specific project. But the gap is real.

---

## Summary — what this hypothetical run actually revealed

**10 gaps surfaced**, ranging from small (templates that don't exist) to structural (workflows that have no documented owner):

| # | Gap | Severity | Fix |
|---|---|---|---|
| 1 | No first-contact response template / 24hr response standard | Low | Small SOP addition |
| 2 | Mentorship Agreement requires a Mentor named at signing; Mentor isn't assigned until later | Medium | Restructure template Section 1 |
| 3 | No "Onboarding Packet" — combined doc bundle for parents | Low | Bundle existing docs into one packet template |
| 4 | No complaint response procedure for Section 2 incidents | Medium | Small addition to consent agreement OR separate Incident Response SOP |
| 5 | Stripe Connect setup for minor creators not documented as a walkthrough | Medium | One-pager parent-facing guide |
| 6 | No documented Mentor assignment process / Mentor pool / matching criteria | High at scale | Real operational SOP needed before 50/week intake |
| 7 | "Fork cmc-visuals for a new creator" process isn't documented | Medium | One-pager developer SOP |
| 8 | No post-shoot sorting workflow for Marcus and Lisa | Low | Simple checklist |
| 9 | Implicit: creative workflow serves clients, not SubjectSkillz creators | Low | One sentence in master pipeline |
| 10 | No documented consent path for "Subject Medias creates new content using a Track A creator as subject" | Medium | Per-project consent template |

**What did NOT break:** The consent agreement v1.1 itself held up well. Section 5's operator-reposting framework worked in Stage 8. DSC's cross-population check would have correctly required all the right artifacts. The minor-safety prohibitions held throughout.

**What surprised me:** Gap #6 (Mentor assignment at scale) and Gap #2 (Mentor named at signing) together suggest the SubjectSkillz mentorship side of the business is the least operationally specified part of the whole system. The creator side (storefront, content, payouts) is well-specced; the mentorship side has agreements and policies but no operational reality. **If the waitlist is 50 kids and each one expects mentorship, the Mentor pool is going to be the first thing that breaks.**

## Recommendation before moving to Track B hypothetical

The Track A run revealed 10 gaps. Two of them (Gap #2, Gap #6) are real enough that I'd want to address before pretending we're ready for actual Track A clients at scale. The others are smaller and can be queued.

Want me to:
1. Address Gaps #2 and #6 right now (Mentor pool / restructured Mentorship Agreement), then move to Track B
2. Move to Track B and Track C runs first, then come back to all gap-fixing once the full pattern is known across all three tracks
3. Pause and have you decide which gaps actually matter vs which can stay open

I'd lean toward option 2 — running Track B and C will expose their own gaps that may overlap with Track A's, and fixing things once with all three patterns visible is more efficient than fixing piecemeal. But the Mentor pool question is genuinely the kind of thing that could be a real bottleneck if the waitlist is real, so option 1 isn't wrong either.

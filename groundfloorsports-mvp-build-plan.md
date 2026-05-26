# GroundfloorSports MVP Build Plan

## What This Is
This is the current build plan for the real workspace in `subjectreport-app`. It keeps the useful admin and marketplace tooling already in place and focuses the MVP on the smallest loop that proves the product works.

## Current State
What already exists:
- Next.js app under `subjectreport-app`
- Live marketplace route and static marketplace preview
- Admin dashboard with reconnect, CSV, template, and refresh support
- Athlete claim and Supabase persistence utilities
- Template preview page for partner imports
- Brand direction already established: navy, magenta, bold uppercase, dashboard-style cards

What is still needed:
- Real buyer purchase loop end-to-end
- Seller upload flow for clips
- Owned clip access after payment
- Live Stripe checkout and webhook persistence
- Real data model for games, clips, and orders
- Launch-ready legal and ops readiness

## True MVP
The MVP is one seller can publish clips, and one buyer can sign up, browse games, open a clip detail page, pay in Stripe test mode, and get access to the purchased clip.

## In Scope
- Marketplace browse experience with real data
- Game detail and clip detail pages
- Seller upload flow for a first real library
- Stripe-hosted checkout and order persistence
- My Purchases page with owned-access gating
- Role-based access for seller and buyer paths
- Admin support tools for CSV, templates, and reconnect
- Mobile responsive UI and strong visual hierarchy

## Out of Scope For Now
- NFTs, smart contracts, and Web3 wallet work
- Multi-seller payout automation with Stripe Connect
- AI clip tagging and advanced moderation automation
- Large athlete-profile curation system
- Commercial license SKU and advanced bundles
- Mobile app
- Deep search beyond basic query and filters

## Stack
- Next.js App Router: route-based marketplace, admin, and detail pages
- React client components: marketplace filters and admin workflows
- Shared CSS and design tokens: keep the magenta/navy system consistent
- Clerk: auth and role-based flows
- Supabase: marketplace rows, admin data, athlete claims, orders
- Stripe: hosted checkout in test mode first
- Cloudflare R2: clip uploads and signed delivery
- Vercel: deployment and preview routes

## Build Phases
### Phase 0: Stabilize What Exists
Goal: keep the current admin and marketplace tools, confirm the live routes render cleanly, and make the plan match the actual app.
- Keep `admin.html` in place and preserve reconnect, CSV, template, and refresh behavior
- Keep the marketplace live route and static preview visually aligned
- Document existing support surfaces as MVP enablers, not future work

Done when the plan matches the real workspace and the support tooling is explicitly preserved.

### Phase 1: Real Marketplace Read
Goal: buyers can browse real games and clips, filter them, and open detail pages.
- Use Supabase-backed or seeded marketplace data for games and clip counts
- Keep search by team, school, player, or jersey number
- Keep the featured drops and dashboard-style overview section
- Make game and clip detail pages the next click, not dead ends

Done when the marketplace looks intentional, loads live data, and routes into real detail views.

### Phase 2: Seller Upload Flow
Goal: one seller can get footage into the system without manual database edits.
- Build the upload form for video, metadata, and preview details
- Store clips in R2 or equivalent signed storage
- Use admin tooling as a backstop for imports, not the primary path
- Keep the public marketplace updated when a clip is published

Done when the first seller can publish a clip that appears publicly without help.

### Phase 3: Purchase Loop
Goal: the product closes the loop: browse -> detail -> pay -> access.
- Stripe Checkout in test mode for clip purchase
- Webhook-backed order persistence
- Purchased clip access in My Purchases
- Access gating for preview vs owned playback

Done when a buyer can complete a test purchase and immediately see owned content.

### Phase 4: Launch Prep
Goal: clean up the edges so the first real seller and buyer can use it without hand-holding.
- Make the marketplace and admin pages visually polished on mobile
- Keep the reconnect flow, CSV tooling, and template preview accessible
- Add analytics, error states, footer links, and launch criteria
- Verify the transaction loop on real devices before launch

Done when the app is ready to put in front of a real seller and a real buyer.

## External Dependencies
- Clerk: auth app, keys, and role storage
- Supabase: project, tables, and data access
- Stripe: checkout, webhooks, and live-mode readiness
- R2 or storage: signed upload and playback for clips
- Domain: point `groundfloorsports.com` at the live app
- Legal: consent, NIL, privacy, and terms before public clips go live

## Launch Criteria
- Marketplace loads live games and clips
- Seller can publish at least one clip
- Buyer can sign in, buy, and access purchased content
- Admin tools stay available for reconnects, CSVs, and templates
- Mobile layout works cleanly on the core flows
- Legal and policy basics exist before public release

## Risk Register
- Scope creep is the biggest risk. Keep Web3, deep profile systems, and bundle systems out of MVP.
- Auth and data mismatch can break role-based flows. Keep Clerk, Supabase, and app routes aligned.
- Media delivery can become expensive if the pipeline is sloppy. Keep previews small and storage signed.
- Legal exposure is real. Require consent and basic policy pages before public launch.

## Post-MVP
Once the core loop works, the next layer can expand safely:
- Multi-seller payouts once the second seller is real
- Better athlete profiles after the purchase loop proves demand
- More automation for imports, tagging, and moderation
- Brand partnerships and bundles once the marketplace is stable
- NFT / Web3 ideas only after the real product is already working

## First PR
Keep the kickoff boring and concrete:
- Keep the live marketplace and admin support flow in place
- Lock the design system so the brand stays consistent
- Make the MVP target explicit: browse, upload, buy, own
- Document what already exists vs what still needs to be built

Acceptance:
- The roadmap matches the current workspace
- The true MVP is a small, shippable loop
- Support tooling is preserved instead of overwritten

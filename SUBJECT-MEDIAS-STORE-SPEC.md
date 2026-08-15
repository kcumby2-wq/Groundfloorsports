# Subject·Medias — Digital-Asset Store Spec (v1)

**Status:** spec + MVP backend built (`api/media-checkout.js`); storefront UI + go-live pending confirmation.
**Goal:** turn "Buy digital assets" from a contact form into a real single-asset (or bundle) purchase flow with Stripe.
**Owner of prices + go-live:** Kyron.

---

## 1. What we're building

A **buy-now storefront** on `subjectmedias.com` where a parent/athlete/org can purchase a digital asset — one at a time or as a bundle — and pay by card through Stripe, without a sales call.

This sits alongside the existing `#book` "Book Coverage" flow (which stays for custom/on-site creator bookings). The store is for **productized, fixed-price assets**; `#book` remains for **quoted coverage**.

- Book a creator / custom coverage → `#book` (existing, contact-form based)
- Buy a fixed-price digital asset → **the new store** (Stripe checkout)

---

## 2. Why this architecture

The repo already has two Stripe systems:

| System | What it is | Use for the store? |
|---|---|---|
| `api/checkout.js` | Simple Vercel Checkout-Session function (Subject·Report packages) | ✅ **Mirror this** — simplest, static-site friendly |
| `app/api/checkout/route.js` + Stripe Connect + webhook | Full marketplace engine (clip/reel/full_game, creator payouts, order store, anomaly detection) | ⏭ Phase 2 — when we add per-creator payouts + automated delivery |

**MVP decision:** use inline `price_data` Checkout Sessions (`api/media-checkout.js`). No pre-created Stripe products, no Connect, no DB — just `STRIPE_SECRET_KEY` and a hardcoded `CATALOG`. Ship in a day; upgrade to the marketplace engine when volume justifies automated delivery + creator splits.

---

## 3. The flow

```
Storefront card  ──POST /api/media-checkout {sku, qty, email}──►  api/media-checkout.js
                                                                         │  builds Checkout Session
                                                                         ▼
Buyer redirected to  ◄──────────── { checkout.url } ─────────────  Stripe-hosted checkout
Stripe checkout (card + custom fields: athlete name, film link, instructions)
        │ pays
        ▼
success_url → subjectmedias.com/?purchase=success#book   (thank-you state)
        │
        ▼
Fulfillment: order appears in Stripe Dashboard with athlete/film details.
   MVP  → operator delivers the finished asset by email (upload/download link).
   Phase 2 → Stripe webhook (app/api/billing/webhook/stripe) → order store → auto delivery email.
```

Nothing about the grade is involved here — this is media commerce, fully separate from Subject·Report's evaluation. (Reinforces the two-company split.)

---

## 4. Catalog (DRAFT prices — confirm before go-live)

Defined in `api/media-checkout.js → CATALOG` (amounts in cents). Edit there.

| SKU | Asset | Draft price | Notes |
|---|---|---|---|
| `highlight_clip` | Single graded & edited clip | **$49** | matches the site's existing "From $49" |
| `game_edit` | Full-game cutup & edit | **$149** | |
| `social_pack` | 5 clips + graphics | **$199** | the "multiple assets" bundle |
| `graphics_pack` | Custom graphic set | **$99** | |
| `season_film` | Season-long highlight film | **$399** | |
| *(custom)* | On-site creator day / team / event | **quote** | routes to `#book`, not sold at fixed price |

**Bundles = quantity or dedicated SKUs.** `social_pack` is the simple "buy multiple" answer. If you want "pick any 3 clips," that's a Phase-2 cart; for MVP a fixed bundle SKU is cleaner.

---

## 5. Delivery / fulfillment

- **MVP (manual):** every order captures **athlete name + film link + instructions** as Stripe custom fields. Operator sees the paid order in the Stripe Dashboard (or a Slack/email alert), produces the asset, and emails the finished file/link. Simple, zero extra infra, correct for low volume.
- **Phase 2 (automated):** wire the existing `app/api/billing/webhook/stripe` route → append to the order store → send a delivery email with a signed download link when the editor marks the asset ready. This is where the marketplace engine already in the repo pays off.

**Consent/child-safety note:** these are media assets of (often minor) athletes. Delivery is to the paying account only; nothing here publishes an athlete publicly. Public posting of a minor's asset still follows the platform consent rule (guardian controls visibility) — the store sells the file to the family/org, it does not publish it.

---

## 6. Go-live checklist (what's needed from you)

1. **Confirm the catalog + prices** in `api/media-checkout.js → CATALOG`.
2. **Set `STRIPE_SECRET_KEY`** in the Vercel project that serves `subjectmedias.com` (the same live key used for Subject·Report checkout). — *Which Vercel project serves subjectmedias.com? Needs confirming; the store's `/api/media-checkout` must deploy there.*
3. **Confirm delivery method** for MVP (operator email is the default).
4. Then I: wire the storefront "Buy" buttons on `subjectmedias.html`, point Subject·Report's "Buy digital assets" CTA at the store, deploy, and test one live-mode $ purchase (or a test-mode pass first).

---

## 7. Phases

- **v1 (this spec):** fixed-price SKUs, inline `price_data` checkout, manual delivery. **← we are here**
- **v1.1:** thank-you page with next steps; `purchase=success` handling; simple order-alert email to the operator.
- **v2:** webhook-driven automated delivery; order store; buyer receipt with download link.
- **v3:** per-creator Stripe Connect payouts (the shooter/editor who made the asset gets their split automatically) — the repo's Connect scaffolding already supports this.

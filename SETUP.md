# SubjectReport · Supabase Setup Guide

This guide walks you through setting up the database that connects your landing page and admin dashboard. ~20 minutes, $0 cost on the free tier.

---

## Step 1 — Create your Supabase project (5 min)

1. Go to [supabase.com](https://supabase.com) and click **"Start your project"**
2. Sign in with GitHub, Google, or email (free tier is plenty for your volume)
3. Click **"New project"**
4. Fill in:
   - **Name:** `subjectreport`
   - **Database password:** Pick a strong one. **Save it in a password manager — you'll need it if anything goes wrong.**
   - **Region:** Pick one close to you (US East works for Texas)
   - **Pricing plan:** Free
5. Click **"Create new project"** — takes about 2 minutes to provision

---

## Step 2 — Run the schema (3 min)

1. In your new Supabase project, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open the file `supabase-schema.sql` (sent with this build)
4. Copy the entire contents, paste into the SQL Editor
5. Click **"Run"** (bottom right)
6. You should see `Success. No rows returned.`

To verify it worked: left sidebar → **"Table Editor"** → you should see an `athletes` table.

---

## Step 3 — Grab your two keys (2 min)

In your Supabase project:

1. Click the **gear icon** (Settings) in the bottom-left
2. Click **"API"** in the settings menu
3. You'll see three things you need:

   | What | Where |
   |---|---|
   | **Project URL** | Top of the page, looks like `https://abcdefg.supabase.co` |
   | **anon public key** | Under "Project API keys," the one labeled `anon` / `public` |
   | **service_role key** | Under "Project API keys," labeled `service_role` — **KEEP SECRET** |

**Critical safety rule:**
- The **anon key** is safe to put in the landing page (public-facing)
- The **service_role key** bypasses all security — NEVER put it in the landing page or any public code. You won't need it for this setup.

---

## Step 4 — Configure the landing page (2 min)

Open `index.html` (the SubjectReport landing page) and find this block near the top of the `<script>` section:

```javascript
const SUPABASE_URL = "https://subjectreport.com/";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...(very long)";
```

Paste your Project URL and anon key. Save. That's it — the landing page now writes bookings to your database.

---

## Step 5 — Configure the admin dashboard (2 min)

Open `admin.html` and find the same block:

```javascript
const SUPABASE_URL = "REPLACE_WITH_YOUR_PROJECT_URL";
const SUPABASE_ANON_KEY = "REPLACE_WITH_YOUR_ANON_KEY";
```

Paste the same two values. Save.

---

## Step 6 — Enable authentication (5 min)

The dashboard needs you to log in, otherwise anyone who finds the URL would have full access to your data.

1. In Supabase → **Authentication** (left sidebar) → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Enter your email + a strong password
4. Click **"Create user"**
5. Back in Supabase → **Authentication** → **Providers** → make sure **"Email"** is enabled (it is by default)
6. In **Authentication** → **URL Configuration** (or "Sign In / Up"):
   - Turn OFF "Confirm email" for now (you can turn it back on later). This lets you log in immediately without email verification.

---

## Step 7 — Test it (2 min)

1. Open `index.html` in your browser
2. Click any "Book a call" button, fill in the form, submit
3. Open `admin.html` — log in with the email/password you just created
4. Your test booking should appear in the "Booked" pipeline

If it's not there, check the browser console (right-click → Inspect → Console) and look for red errors. Most common issue: URL or key pasted with extra spaces. See "Troubleshooting" below.

---

## Step 8 — Enable landing analytics (2 min)

1. In Supabase **SQL Editor**, open `supabase-events-schema.sql`
2. Run the full script
3. Reload `Subjectreport.html` and click a few CTAs
4. Open `admin.html` and check the **Landing event analytics** card

This enables real event ingestion for CTA clicks and booking flow milestones.

---

## How this works (so you understand what's happening)

**Landing page side:**
- Uses the **anon key** (safe to expose)
- Can ONLY insert new bookings — can't read existing data, can't modify, can't delete
- This is enforced by the Row-Level Security policy in the schema

**Admin dashboard side:**
- Requires you to log in with email/password
- Once logged in, has full read/write access to all athletes
- Uses the Supabase session token, not the service_role key

**Your data:**
- Lives in your Supabase Postgres database
- You own it — if you ever leave Supabase, you can export it all as SQL
- Free tier handles 500MB of data and 50,000+ rows, which is thousands of athletes
- Landing analytics events are also stored in Supabase table `sr_events`

---

## Ongoing maintenance

- **Backups:** Supabase automatically backs up your data daily on the free tier. You can also export CSV from the dashboard Settings page anytime.
- **Cost:** Free forever up to the free tier limits. You'll likely never hit them for this use case.
- **Scaling up:** If you ever need team access (Christian, Kedrick), just create more users in Supabase → Authentication. Everyone shares the same data.

---

## Troubleshooting

**"Network error" when submitting a booking:**
- Double-check the Supabase URL — should start with `https://` and end with `.supabase.co`, no trailing slash
- Check the anon key has no extra spaces

**"Can't log in" to admin dashboard:**
- Make sure "Confirm email" is turned OFF in Supabase auth settings (Step 6)
- Make sure the email and password match what you created in Supabase → Authentication → Users

**"RLS policy violation" error:**
- The schema in Step 2 didn't run fully. Re-run `supabase-schema.sql` in SQL Editor.

**Bookings aren't showing up in dashboard:**
- Open browser console on admin.html, look for red errors
- Try clicking "Refresh" in the dashboard (top-right)
- In Supabase → Table Editor → athletes, check if the row actually exists

**Landing analytics card says setup needed:**
- Run `supabase-events-schema.sql` in Supabase SQL Editor
- Confirm `sr_events` appears in Supabase Table Editor
- Reload `admin.html` and click Refresh

**Stripe webhook status automation not updating orders:**
- Add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to `.env.local`
- Use endpoint: `/api/billing/webhook/stripe`
- Ensure checkout session metadata includes `orderId` (or `order_id`) so webhook events can map to the saved order
- For local testing with Stripe CLI:
   - `stripe listen --forward-to localhost:3000/api/billing/webhook/stripe`
   - copy the printed `whsec_...` value into `STRIPE_WEBHOOK_SECRET`
- Re-send an event in Stripe CLI or dashboard and verify `gfs_orders.status` changes (`paid`, `payment_failed`, `refunded`)

**Dual Stripe checkout setup (GroundfloorSports + Subjectreport):**
- GroundfloorSports marketplace checkout endpoint: `/api/checkout`
- Subjectreport package checkout endpoint: `/api/subjectreport/checkout`
- Subjectreport plans supported:
   - `transcript` ($249 one-time)
   - `program` ($1,500 one-time)
   - `full` ($5,000 one-time)
   - `prospect` ($99/mo subscription)
- Optional plan-level Stripe Price IDs can be set in `.env.local`:
   - `STRIPE_SUBJECTREPORT_TRANSCRIPT_PRICE_ID`
   - `STRIPE_SUBJECTREPORT_PROGRAM_PRICE_ID`
   - `STRIPE_SUBJECTREPORT_FULL_PRICE_ID`
   - `STRIPE_SUBJECTREPORT_PROSPECT_PRICE_ID`
- If Subjectreport is opened as `file://`, API routes are unavailable. Use localhost, or set fallback payment links in localStorage keys:
   - `sr_stripe_checkout_link_transcript`
   - `sr_stripe_checkout_link_program`
   - `sr_stripe_checkout_link_full`
   - `sr_stripe_checkout_link_prospect`

**Stripe Connect setup (marketplace payouts):**
- Add these optional `.env.local` values:
   - `STRIPE_CONNECT_WEBHOOK_SECRET` (recommended separate webhook secret for Connect events)
   - `STRIPE_CONNECT_DEFAULT_DESTINATION_ACCOUNT` (default seller account for destination charges)
   - `STRIPE_CONNECT_PLATFORM_FEE_PERCENT` (platform fee percent if request does not override)
- New Connect onboarding endpoints (Clerk-auth required):
   - `POST /api/billing/connect/account` (create/retrieve account + onboarding link)
   - `POST /api/billing/connect/account-link` (new onboarding/update link)
   - `POST /api/billing/connect/login-link` (Express dashboard login link)
- Checkout routing for Connect:
   - `POST /api/checkout` supports optional `connect` payload object:
   - `connect.accountId` (acct_... destination)
   - `connect.applicationFeePercent` (0-100)
   - `connect.platformFeeUsd` (fixed fee override)
   - If Connect destination is present, checkout creates a destination charge with `transfer_data.destination` and optional `application_fee_amount`.
- Connect webhook endpoint:
   - `POST /api/billing/webhook/stripe-connect`
   - Handles and logs `account.updated`, `capability.updated`, `account.application.deauthorized`, and payout lifecycle events.
   - Persisted log file: `data/stripe-connect-events.json`

---

## When you're ready for more

This setup is the foundation. Things you can add later:

- **Email notifications** — Supabase has built-in Edge Functions that can email you when a booking comes in
- **Stripe webhooks** — auto-update status from 'booked' to 'paid' when Stripe confirms payment
- **Team access** — add users to Supabase Auth, everyone sees the same dashboard
- **Public ranking page** — reads from the same Supabase, shows only `status IN ('delivered', 'active')` with grades

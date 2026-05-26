# SubjectReport Ops Checklist

Use this as your recurring operations runbook for the booking site + admin dashboard.

Detailed incident playbooks and command references are in `OPS-RUNBOOK.md`.

## Daily (10-15 minutes)

- Open `index.html` and submit 1 test booking with your own email.
- Open `admin.html` and verify the test booking appears.
- Update that test booking status from `booked` to `paid`.
- Confirm dashboard KPIs update correctly.
- Delete or mark the test booking as `churned` so your pipeline stays clean.
- Check connection badge in admin header shows `Supabase connected`.
- Export JSON backup from Settings once per day if lead volume is high.

## Weekly (30-45 minutes)

- Export CSV and JSON backups from admin Settings.
- Review all `booked` leads older than 3 days and move to next status.
- Review all `paid`/`grading` leads and confirm next action owner + due date in notes.
- Review `active` subscribers and confirm no missed monthly follow-ups.
- Audit data quality:
  - Missing email
  - Missing phone
  - Missing position/class year
  - Invalid package values
- Review browser console on `index.html` and `admin.html` for any recurring errors.

## Monthly (45-60 minutes)

- Run a full end-to-end smoke test:
  - Booking submit
  - Admin login
  - Edit athlete
  - Delete athlete
- Rotate and review who has Supabase dashboard access.
- Review RLS/policy setup against `supabase-schema.sql`.
- Purge obvious test/demo rows (or run `cleanup-test-records.sql`).
- Spot-check 10 random records for completeness and correctness.

## Release/Change Checklist

Run this whenever you modify `index.html`, `admin.html`, or database policies.

- Confirm Supabase URL and publishable key are still correct in both pages.
- Confirm booking insert works (`status='booked'`).
- Confirm admin authenticated user can read/update/delete.
- Confirm anonymous requests cannot update/delete rows.
- Confirm connection badge behavior:
  - Signed out -> `Signed out`
  - Signed in + healthy -> `Supabase connected`
  - Network/API issue -> error state

### Command gate before shipping

- Run `npm run validate:ops`.
- Run `npm run validate:marketplace-suite`.
- Run `npm run evidence:archive`.
- Proceed only when both pass.

### Post-live-test hygiene

- Run `npm run security:clear-testing-env`.
- Sign out of admin browser sessions used for testing.

## Incident Quick Response

### If bookings stop saving

- Check admin connection badge.
- Test direct REST insert with publishable key.
- Re-run policy/grant SQL from `supabase-schema.sql`.
- Verify Data API settings:
  - Data API ON
  - Exposed schemas includes `public`
  - DB anon role = `anon`

### If admin cannot load data

- Sign out/in and retry.
- Confirm user exists in Supabase Auth.
- Check browser console for 401/403 errors.
- Validate authenticated policies are present and grants exist.

### If dashboard numbers look wrong

- Check status transitions (`booked`, `paid`, `grading`, `delivered`, `active`, `churned`).
- Verify package values match expected set (`transcript`, `program`, `full`, `prospect`).
- Export CSV and audit rows for empty or malformed values.

## Suggested KPI Targets (starter)

- `booked -> paid` conversion rate
- Average days from `booked -> delivered`
- Active subscriber count (`status='active'`)
- Monthly churn count (`status='churned'`)
- New leads per week

## Notes

- Keep one source of truth in Supabase.
- Do not put secret/service keys in frontend files.
- Keep this checklist updated as your process changes.

## GroundfloorSports Auth Smoke Test (Clerk)

Run after auth, middleware, or env key changes.

- Open `/marketplace` and confirm page + API data load.
- Open `/seller/onboarding` while signed out and confirm redirect to Clerk sign-in.
- Open `/athletes/claim-profile` while signed out and confirm redirect to Clerk sign-in.
- Sign in with a test user and confirm redirect completes without errors.
- Open `/seller/onboarding` while signed in with seller role and confirm seller page renders.
- Open `/athletes/claim-profile` while signed in with athlete role and confirm athlete page renders.
- Open `/seller/onboarding` while signed in as non-seller and confirm role-gate message is shown.
- Open `/athletes/claim-profile` while signed in as non-athlete and confirm role-gate message is shown.
- Confirm no missing key or keyless warnings appear in local app pages.

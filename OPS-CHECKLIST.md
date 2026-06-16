# SubjectReport Ops Checklist

Use this as your recurring operations runbook for the booking site + admin dashboard.

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

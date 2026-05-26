# SubjectReport Ops Runbook

## Purpose

Use this runbook for fast diagnostics and recovery across:
- Supabase schema and analytics contracts
- Admin high-risk write paths
- Admin handoff, export history, and recovery flow
- Marketplace static validation
- Local dev startup reliability

## Prerequisites

- Node.js and npm installed.
- Supabase project URL.
- For live contract checks: either service role key, or anon key plus authenticated token.

## Environment Variables (PowerShell)

Set these before live checks:

```powershell
$env:SUPABASE_URL = "https://YOUR_PROJECT.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "YOUR_SERVICE_ROLE_KEY"
```

Alternative auth mode:

```powershell
$env:SUPABASE_URL = "https://YOUR_PROJECT.supabase.co"
$env:SUPABASE_ANON_KEY = "YOUR_ANON_KEY"
$env:SUPABASE_AUTH_TOKEN = "YOUR_AUTH_JWT"
```

Template:
- `.env.ops.example`

## Admin Handoff Map

Use this when you need to orient a new operator quickly:

- Dashboard: launcher cards for Athletes, CSV Builder, and Settings.
- CSV Builder: open the standalone builder from admin when you need the clean intake flow.
- Settings -> Company handoff: role matrix, daily flow, and recovery notes.
- Dashboard status strip: shows Supabase connection, last sync, last reconnect, and last export / backup.
- Settings export history: recent CSV, template, and backup activity with timestamps.

Recovery order:

1. Check the dashboard status strip.
2. If the admin is out of date, reconnect Supabase and reload.
3. If data was changed accidentally, restore the latest snapshot.
4. If a fresh handoff is needed, export CSV or backup JSON and note the timestamp in Settings.

## Event Admin Access Policy

CSV Builder access is restricted.

- Public pages now route staff to an Event Admin Access intake flow first.
- Required intake questions are collected before scheduling.
- Scheduler link: `https://tr.ee/W8exF9ipoU`
- Access is provisioned only after admin purchase and onboarding.

Operational notes:

1. Intake submissions write to `sr_access_requests` when available and fall back to `sr_events` (`event_name=event_admin_access_request`).
2. Queue + funnel state are mirrored in local storage keys `sr_access_request_queue_v1` and `sr_access_request_metrics_v1` for immediate admin visibility.
3. Intake anti-spam controls include honeypot, submit cooldown, and duplicate suppression (org/email/date signature).
4. Optional email/webhook hooks can be configured with local storage keys `sr_access_email_webhook_confirm` and `sr_access_email_webhook_internal`.
5. If a browser blocks popups, operators can use the explicit schedule button in the confirmation state.
6. CSV Builder direct URL access requires a valid Supabase auth token; unauthorized visitors are redirected to `Subjectreport.html#tools`.

## Credential Hygiene (Post-Test)

After any live run that uses authenticated tokens:

1. Sign out of admin sessions in browser tabs.
2. Clear terminal environment variables:

```powershell
npm run security:clear-testing-env
```

3. If a service role key was used outside CI, rotate it in Supabase dashboard and update your secret manager.
4. Use fresh auth tokens for the next live run.

## Core Commands

Run from subjectreport-app root.

- Stable local startup:

```powershell
npm run dev:stable
```

- Supabase schema contract check:

```powershell
npm run check:supabase-schema
```

- sr_events table health:

```powershell
npm run check:sr-events
```

- Live admin smoke (seed, execute/undo simulation, restore simulation, cleanup):

```powershell
npm run smoke:admin-live
```

- Existing admin ops static check:

```powershell
npm run test:admin-ops
```

- Full operations validation chain:

```powershell
npm run validate:ops
```

- Full operations validation chain (live-required):

```powershell
npm run validate:ops:live
```

- Full marketplace suite:

```powershell
npm run validate:marketplace-suite
```

- Full marketplace suite (live-required):

```powershell
npm run validate:marketplace-suite:live
```

- Archive release evidence bundle:

```powershell
npm run evidence:archive
```

## Incident Playbooks

### 1) Admin save fails with missing-column errors

Symptoms:
- Save failed 400 in admin.
- Error text references missing column in athletes.

Steps:
1. Run `npm run check:supabase-schema`.
2. If failures show missing athletes profile fields, run SQL from `supabase-athlete-profile-columns-migration.sql`.
3. Re-run `npm run check:supabase-schema` until pass.
4. Run `npm run smoke:admin-live`.

### 2) Analytics panels show sr_events setup warnings

Symptoms:
- Admin dashboards show analytics setup needed warning.

Steps:
1. Run `npm run check:sr-events`.
2. If live query fails with 404, run SQL from `supabase-events-schema.sql`.
3. Re-run `npm run check:sr-events`.
4. Reload admin page and refresh analytics cards.

### 3) Bulk update/undo or snapshot restore concerns

Steps:
1. Run `npm run smoke:admin-live`.
2. Confirm report status in `reports/admin-live-smoke-report.json`.
3. If failed, inspect failed step IDs in the report and verify Supabase auth + RLS.

### 4) Operator handoff or recovery confusion

Symptoms:
- A new operator cannot tell if the admin is connected.
- Export or backup history is missing.
- The standalone CSV builder path is unclear.

Steps:
1. Open admin and check the dashboard status strip.
2. Open Settings -> Company handoff and verify the role matrix and recovery path.
3. Use the CSV Builder launcher to reach the standalone intake page.
4. If exports are missing, run a fresh CSV export or backup JSON export and confirm the history panel updates.

### 5) Local dev server unstable on port 3000

Steps:
1. Run `npm run dev:stable`.
2. Script clears `.next`, frees listeners on port 3000, and starts `next dev --webpack`.
3. If still failing, run `npm install` and retry.

### 6) Event admin intake not reaching staff

Symptoms:
- Staff tools links open, but no intake submission appears in backend data.
- Scheduling opens, but no request context is visible internally.

Steps:
1. Confirm `SUPABASE_URL` and anon key are configured in local storage (same project used by admin).
2. Run SQL from `supabase-access-requests-schema.sql` so `sr_access_requests` exists with status workflow.
3. Validate `sr_events` accepts fallback inserts and includes `event_name`, `detail`, `page`, `source`.
4. Submit a test request from `Subjectreport.html#tools` and verify either a queue row (`sr_access_requests`) or fallback row (`sr_events`) was created.
5. In admin Dashboard, review Access request queue and update status transitions (`requested -> reviewing -> approved -> provisioned`).
6. If insert fails, rely on scheduler booking and pull context from `sessionStorage` key `sr_event_admin_access_request` while fixing backend permissions.

## Report Files

- `reports/supabase-schema-contract-report.json`
- `reports/sr-events-health-report.json`
- `reports/admin-live-smoke-report.json`
- `reports/admin-ops-check-report.json`
- `reports/marketplace-validation-suite-report.json`
- `reports/marketplace-validation-suite-summary.md`

## Recommended Release Gate

For changes to admin, schema, or analytics:

1. `npm run validate:ops`
2. `npm run validate:marketplace-suite`

Proceed only when both pass.

Then archive evidence:

1. `npm run evidence:archive`
2. Attach `reports/releases/<timestamp>/` bundle to release notes or CI artifacts.

## CI Gate

GitHub Actions workflow:
- `.github/workflows/validation-gates.yml`

Current behavior:
- Runs `validate:ops:live` and `validate:marketplace-suite:live` on pull requests and pushes to `main`.
- Requires repository secrets: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- Fails CI if live checks are skipped.

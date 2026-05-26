# Private Event Deployment Checklist (Admin Only)

Goal: publish this static app so admins can use it at events, while blocking public access.

## 1) Prepare The Deploy Folder

Use this folder as your Pages root:
- subjectreport-app

Confirm these files exist:
- admin.html
- combine-clinic-template.html
- marketplace.html
- sign-in.html
- sign-up.html
- shared-preview-utils.js

## 2) Create Cloudflare Pages Project

1. Sign in to Cloudflare dashboard.
2. Go to Workers & Pages.
3. Click Create application.
4. Choose Pages.
5. Connect to Git (recommended) or Direct Upload.

If using Git:
1. Select your repository.
2. Framework preset: None.
3. Build command: leave blank.
4. Build output directory: subjectreport-app (or / if repo root already equals this folder).
5. Save and Deploy.

If using Direct Upload:
1. Zip the contents of subjectreport-app (not the parent folder).
2. Upload zip to Pages.
3. Deploy.

## 3) Lock It Down (Private Admin Access)

Use Cloudflare Zero Trust Access to protect the Pages URL.

1. Open Cloudflare Zero Trust.
2. Go to Access -> Applications.
3. Add application -> Self-hosted.
4. Application domain: your Pages URL or custom subdomain.
5. Policy action: Allow.
6. Include: Emails -> add only admin/staff email addresses.
7. Add a second default policy to block everyone else.
8. Save and test from an unapproved email/session.

Recommended controls:
- Session duration: 8-12 hours.
- One-time PIN or IdP sign-in required.
- Remove all wildcard allow rules.

## 4) Event-Day URL Strategy

1. Share one protected URL to staff.
2. Keep a short alias URL if possible (custom domain/subdomain).
3. Put URL + fallback instructions in a small one-page runbook.

## 5) Offline Fallback (Strongly Recommended)

Prepare one laptop as fallback host.

1. Keep local copy of subjectreport-app.
2. Launch fallback server + open pages automatically:
   - PowerShell: .\start-event-fallback.ps1
3. Optional custom port:
   - PowerShell: .\start-event-fallback.ps1 -Port 8090
3. Open:
   - http://localhost:8080/admin.html
   - http://localhost:8080/combine-clinic-template.html
4. Continue collecting data and exporting CSV locally.

## 6) Pre-Event Validation (Night Before)

Run PowerShell script:
- .\event-readiness-check.ps1

What to verify manually after deploy:
1. Protected URL prompts for login.
2. Approved admin email can access.
3. Unapproved account cannot access.
4. CSV import works.
5. Export CSV and Export By Date both download files.
6. Recent export history can re-download.
7. Draft save restores after page refresh.

## 7) Event Ops Notes

- localStorage is device-local. Drafts do not sync between devices.
- Use one primary intake device per event workflow.
- Export CSV frequently (every 15-30 minutes) as backup.
- Keep power bank/hotspot available.

## 8) Post-Event Steps

1. Collect exported CSV files from operator laptop.
2. Upload into your downstream workflow.
3. Archive raw event CSV with date and location in filename.
4. Rotate Access allow-list for next event if staffing changes.

## Quick Go/No-Go Decision

Go when all are true:
- Access gate blocks non-admins.
- Admin can sign in and load pages.
- CSV import/export passed test.
- Offline fallback tested once.

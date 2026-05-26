// scripts/README.md
# Cleanup Scripts for Seller Uploads

These scripts help keep the upload system healthy by removing incomplete, expired, failed, or orphaned records from Redis.

- `cleanupIncompleteUploads.js`: Removes incomplete uploads and their chunks.
- `cleanupExpiredChunks.js`: Removes expired upload chunks.
- `cleanupFailedScans.js`: Removes failed virus scan records.
- `cleanupOrphanedUploads.js`: Removes orphaned ready uploads with no received record.

**Usage:**

```sh
node scripts/cleanupIncompleteUploads.js
node scripts/cleanupExpiredChunks.js
node scripts/cleanupFailedScans.js
node scripts/cleanupOrphanedUploads.js
```

Schedule these scripts to run periodically (e.g., with cron) for best results.

## generateAuditReport.js
Generates a CSV audit report from audit logs. Run with:

```
node scripts/generateAuditReport.js
```

- Output: `audit-report.csv` in the project root
- Customize `fetchAuditLogs()` to pull from your real DB or log store
- Schedule this script to run periodically for compliance

## sendAuditReportEmail.js
Sends the generated audit report to admins via email. Requires environment variables:
- AUDIT_EMAIL_USER
- AUDIT_EMAIL_PASS
- AUDIT_EMAIL_RECIPIENTS (comma-separated)

Run after generating the report:
```
node scripts/sendAuditReportEmail.js
```

## anomalyDetection.js
Scans audit logs for suspicious activity (e.g., repeated upload attempts). Run with:
```
node scripts/anomalyDetection.js
```
- Customize detection logic and alerting as needed.

---

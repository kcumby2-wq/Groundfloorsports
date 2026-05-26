const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const adminPath = path.join(repoRoot, 'admin.html');
const reportDir = path.join(repoRoot, 'reports');
const reportPath = path.join(reportDir, 'admin-ops-check-report.json');

function check(condition, id, message) {
  return { id, ok: Boolean(condition), message };
}

function main() {
  const source = fs.readFileSync(adminPath, 'utf8');

  const checks = [
    check(source.includes('function previewBulkJob('), 'bulk_job_preview', 'Dry-run bulk job preview handler exists'),
    check(source.includes('function executePendingBulkJob('), 'bulk_job_execute', 'Bulk job execute handler exists'),
    check(source.includes('function undoLastBulkJob('), 'bulk_job_undo', 'Bulk job undo handler exists'),
    check(source.includes('function renderQualityScorecards('), 'quality_scorecards', 'Quality scorecards renderer exists'),
    check(source.includes('function renderOpsInbox('), 'ops_inbox', 'Ops inbox renderer exists'),
    check(source.includes('function renderOpsHealthPanel('), 'ops_health', 'Ops health renderer exists'),
    check(source.includes('function setAdminRole('), 'role_control', 'Role control handler exists'),
    check(source.includes('function requireHighRiskApproval('), 'approval_gate', 'Approval gate handler exists'),
    check(source.includes('id="opsInbox"'), 'ops_inbox_ui', 'Ops inbox UI container exists'),
    check(source.includes('id="qualityScorecards"'), 'quality_ui', 'Quality scorecards UI container exists'),
    check(source.includes('id="opsHealthPanel"'), 'health_ui', 'Health panel UI container exists'),
  ];

  const failed = checks.filter((item) => !item.ok);
  const output = {
    generatedAt: new Date().toISOString(),
    target: 'admin.html',
    summary: {
      total: checks.length,
      passed: checks.length - failed.length,
      failed: failed.length,
      failedIds: failed.map((item) => item.id),
      status: failed.length ? 'fail' : 'pass',
    },
    checks,
  };

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, JSON.stringify(output, null, 2), 'utf8');
  console.log(`Admin ops check report: ${reportPath}`);
  console.log(`Status: ${output.summary.status.toUpperCase()} (${output.summary.passed}/${output.summary.total})`);

  if (failed.length) {
    failed.forEach((item) => console.error(`FAIL: ${item.id} - ${item.message}`));
    process.exit(1);
  }
}

main();

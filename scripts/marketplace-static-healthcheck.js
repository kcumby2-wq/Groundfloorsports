const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const marketplacePath = path.join(repoRoot, 'marketplace.html');
const runtimePath = path.join(repoRoot, 'scripts', 'marketplace-static-runtime.js');
const reportDir = path.join(repoRoot, 'reports');
const reportPath = path.join(reportDir, 'marketplace-static-health-report.json');

function runCheck(label, ok, detail) {
  return { label, ok: Boolean(ok), detail: detail || '' };
}

function main() {
  const checks = [];

  checks.push(runCheck('marketplace.html exists', fs.existsSync(marketplacePath), marketplacePath));
  checks.push(runCheck('static runtime exists', fs.existsSync(runtimePath), runtimePath));

  const marketplaceHtml = fs.existsSync(marketplacePath)
    ? fs.readFileSync(marketplacePath, 'utf8')
    : '';
  const runtimeJs = fs.existsSync(runtimePath)
    ? fs.readFileSync(runtimePath, 'utf8')
    : '';

  checks.push(runCheck('copy filtered view action present', marketplaceHtml.includes('Copy Filtered View')));
  checks.push(runCheck('static health check action present', marketplaceHtml.includes('Run Health Check Now')));
  checks.push(runCheck('health report export action present', marketplaceHtml.includes('Export Health Report')));
  checks.push(runCheck('match reason rendering present', marketplaceHtml.includes('renderMatchReasons')));
  checks.push(runCheck('preset quick link support present', runtimeJs.includes('copyPresetQuickLink')));
  checks.push(runCheck('auto boot health check present', runtimeJs.includes("reason: 'auto_boot'")));

  const failed = checks.filter((item) => !item.ok);
  const report = {
    generatedAt: new Date().toISOString(),
    status: failed.length ? 'fail' : 'pass',
    totals: {
      checks: checks.length,
      passed: checks.length - failed.length,
      failed: failed.length,
    },
    checks,
  };

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  console.log(`Static marketplace health report: ${reportPath}`);
  console.log(`Status: ${report.status.toUpperCase()} (${report.totals.passed}/${report.totals.checks})`);

  if (failed.length) {
    failed.forEach((item) => {
      console.error(`FAIL: ${item.label}`);
    });
    process.exitCode = 1;
  }
}

main();

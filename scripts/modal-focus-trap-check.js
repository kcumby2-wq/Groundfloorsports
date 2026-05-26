const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const reportDir = path.join(repoRoot, 'reports');
const reportPath = path.join(reportDir, 'subjectreport-modal-focus-report.json');
const markdownReportPath = path.join(reportDir, 'subjectreport-modal-focus-report.md');
const targetPath = path.join(repoRoot, 'Subjectreport.html');

function check(condition, id, message) {
  return { id, ok: Boolean(condition), message };
}

function buildMarkdownReport(report) {
  const lines = [];
  lines.push('# Subjectreport Modal Focus Regression');
  lines.push('');
  lines.push(`- Generated: ${report.generatedAt}`);
  lines.push(`- Target: ${report.target}`);
  lines.push(`- Status: ${report.summary.status.toUpperCase()} (${report.summary.passed}/${report.summary.total})`);
  lines.push('');
  lines.push('## Checks');
  lines.push('');
  lines.push('| Check | Status | Message |');
  lines.push('| --- | --- | --- |');

  report.checks.forEach((item) => {
    lines.push(`| ${item.id} | ${item.ok ? 'PASS' : 'FAIL'} | ${item.message} |`);
  });

  return `${lines.join('\n')}\n`;
}

function main() {
  const source = fs.readFileSync(targetPath, 'utf8');

  const checks = [
    check(source.includes('function getModalFocusableElements()'), 'focusable_helper', 'Modal focusable helper exists'),
    check(source.includes('window.getComputedStyle(el)'), 'computed_style_gate', 'Computed-style visibility gate exists'),
    check(source.includes('style.display === "none" || style.visibility === "hidden"'), 'css_visibility_gate', 'Hidden display/visibility elements are excluded'),
    check(source.includes('el.offsetWidth || el.offsetHeight || el.getClientRects().length'), 'rendered_gate', 'Non-rendered elements are excluded'),
    check(source.includes('if (e.shiftKey && document.activeElement === first)'), 'shift_tab_wrap', 'Shift+Tab wrap logic exists'),
    check(source.includes('else if (!e.shiftKey && document.activeElement === last)'), 'tab_wrap', 'Tab wrap logic exists'),
  ];

  const failed = checks.filter((item) => !item.ok);
  const output = {
    generatedAt: new Date().toISOString(),
    target: 'Subjectreport.html',
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
  fs.writeFileSync(markdownReportPath, buildMarkdownReport(output), 'utf8');
  console.log(`Modal focus regression report: ${reportPath}`);
  console.log(`Modal focus regression summary: ${markdownReportPath}`);
  console.log(`Status: ${output.summary.status.toUpperCase()} (${output.summary.passed}/${output.summary.total})`);

  if (failed.length) {
    failed.forEach((item) => console.error(`FAIL: ${item.id} - ${item.message}`));
    process.exit(1);
  }
}

main();
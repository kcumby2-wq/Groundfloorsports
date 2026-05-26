const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const reportDir = path.join(repoRoot, 'reports');
const reportPath = path.join(reportDir, 'marketplace-static-smoke-report.json');

const edgeCandidates = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
];

function resolveEdgePath() {
  for (const candidate of edgeCandidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return '';
}

function fileUrl(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  return `file:///${normalized}`;
}

function runEdgeDump(edgePath, url) {
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--allow-file-access-from-files',
    '--virtual-time-budget=6000',
    '--dump-dom',
    url,
  ];

  return spawnSync(edgePath, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    timeout: 25000,
    maxBuffer: 1024 * 1024 * 8,
  });
}

function check(label, ok, detail) {
  return { label, ok: Boolean(ok), detail: detail || '' };
}

function main() {
  const edgePath = resolveEdgePath();
  if (!edgePath) {
    console.error('Edge executable not found.');
    process.exit(1);
  }

  const marketplacePath = path.join(repoRoot, 'marketplace.html');
  const previewPath = path.join(repoRoot, 'marketplace-game-preview.html');

  const marketplaceUrl = fileUrl(marketplacePath);
  const previewUrl = `${fileUrl(previewPath)}?slug=2026-10-18-allen-vs-plano-east`;

  const checks = [];

  const marketDump = runEdgeDump(edgePath, marketplaceUrl);
  const marketDom = String(marketDump.stdout || '');
  checks.push(check('Marketplace DOM dump completed', marketDump.status === 0, marketDump.stderr || ''));
  checks.push(check('Run Health Check control rendered', marketDom.includes('Run Health Check Now')));
  checks.push(check('Preset import control rendered', marketDom.includes('Import Presets')));
  checks.push(check('Preset payload control rendered', marketDom.includes('Copy Payload')));
  checks.push(check('Health status panel rendered', marketDom.includes('Health Check:')));

  const previewDump = runEdgeDump(edgePath, previewUrl);
  const previewDom = String(previewDump.stdout || '');
  checks.push(check('Preview DOM dump completed', previewDump.status === 0, previewDump.stderr || ''));
  checks.push(check('Clip form rendered in preview', previewDom.includes('Add Clip To This Game')));
  checks.push(check('Clip import control rendered in preview', previewDom.includes('Import CSV')));

  const failed = checks.filter((item) => !item.ok);
  const report = {
    generatedAt: new Date().toISOString(),
    edgePath,
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

  console.log(`Static marketplace smoke report: ${reportPath}`);
  console.log(`Status: ${report.status.toUpperCase()} (${report.totals.passed}/${report.totals.checks})`);

  if (failed.length) {
    failed.forEach((item) => console.error(`FAIL: ${item.label}`));
    process.exit(1);
  }
}

main();

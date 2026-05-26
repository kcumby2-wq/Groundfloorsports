const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const reportsRoot = path.join(repoRoot, 'reports');

const REQUIRED_REPORTS = [
  'supabase-schema-contract-report.json',
  'sr-events-health-report.json',
  'admin-live-smoke-report.json',
  'admin-ops-check-report.json',
  'marketplace-validation-suite-report.json',
  'marketplace-validation-suite-summary.md',
  'games-relevance-scorecard.json',
  'games-relevance-scorecard.md',
  'subjectreport-modal-focus-report.json',
  'subjectreport-modal-focus-report.md',
];

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function timestampTag() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}-${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;
}

function safeCopy(srcPath, destPath) {
  if (!fs.existsSync(srcPath)) {
    return { copied: false, reason: 'missing' };
  }
  fs.copyFileSync(srcPath, destPath);
  return { copied: true };
}

function main() {
  ensureDir(reportsRoot);

  const releaseRoot = path.join(reportsRoot, 'releases');
  ensureDir(releaseRoot);

  const releaseId = timestampTag();
  const releaseDir = path.join(releaseRoot, releaseId);
  ensureDir(releaseDir);

  const files = [];

  for (const fileName of REQUIRED_REPORTS) {
    const src = path.join(reportsRoot, fileName);
    const dest = path.join(releaseDir, fileName);
    const result = safeCopy(src, dest);
    files.push({ fileName, ...result });
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    releaseId,
    releaseDir,
    copied: files.filter((item) => item.copied).length,
    missing: files.filter((item) => !item.copied).map((item) => item.fileName),
    files,
  };

  const manifestPath = path.join(releaseDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  console.log(`Evidence archive: ${releaseDir}`);
  console.log(`Manifest: ${manifestPath}`);
  console.log(`Copied ${manifest.copied}/${files.length} files`);

  if (manifest.copied === 0) {
    console.error('No evidence files were copied. Run validation commands first.');
    process.exit(1);
  }
}

main();

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const reportDir = path.join(repoRoot, 'reports');

function loadReport(fileName) {
  const fullPath = path.join(reportDir, fileName);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Missing report: ${fullPath}`);
  }
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function main() {
  const schema = loadReport('supabase-schema-contract-report.json');
  const events = loadReport('sr-events-health-report.json');
  const admin = loadReport('admin-live-smoke-report.json');

  assert(schema.live && schema.live.enabled === true, `supabase-schema-contract live not enabled (${schema.live?.reason || 'unknown'})`);
  assert(events.live && events.live.enabled === true, `sr-events-health live not enabled (${events.live?.reason || 'unknown'})`);
  assert(!admin.skipped, `admin-live-smoke skipped (${admin.reason || 'unknown'})`);
  assert(Boolean(admin.mode), 'admin-live-smoke missing live mode');

  console.log('Ops live enforcement: PASS');
}

try {
  main();
} catch (error) {
  console.error(`Ops live enforcement: FAIL - ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

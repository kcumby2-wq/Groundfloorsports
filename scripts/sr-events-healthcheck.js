const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const reportDir = path.join(repoRoot, 'reports');
const reportPath = path.join(reportDir, 'sr-events-health-report.json');
const eventsSchemaPath = path.join(repoRoot, 'supabase-events-schema.sql');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function makeCheck(id, ok, detail) {
  return { id, ok: Boolean(ok), detail: detail || '' };
}

function isJwtExpired(token) {
  const parts = String(token || '').split('.');
  if (parts.length < 2) return false;

  try {
    const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
    if (!payload || typeof payload.exp !== 'number') return false;
    return Date.now() >= payload.exp * 1000;
  } catch (_) {
    return false;
  }
}

function getLiveConfig() {
  const url = String(process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const serviceRole = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const anonKey = String(process.env.SUPABASE_ANON_KEY || '').trim();
  const authToken = String(process.env.SUPABASE_AUTH_TOKEN || '').trim();

  if (!url) return { enabled: false, reason: 'SUPABASE_URL is missing' };

  if (serviceRole) {
    return { enabled: true, url, key: serviceRole, token: serviceRole, mode: 'service_role' };
  }

  if (anonKey && authToken) {
    if (isJwtExpired(authToken)) {
      return { enabled: false, reason: 'SUPABASE_AUTH_TOKEN is expired' };
    }

    return { enabled: true, url, key: anonKey, token: authToken, mode: 'anon_plus_auth_token' };
  }

  return { enabled: false, reason: 'Provide SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY + SUPABASE_AUTH_TOKEN for live checks' };
}

async function main() {
  const checks = [];
  const hasFile = fs.existsSync(eventsSchemaPath);
  checks.push(makeCheck('events_schema_file_exists', hasFile, eventsSchemaPath));

  const source = hasFile ? fs.readFileSync(eventsSchemaPath, 'utf8') : '';
  checks.push(makeCheck('sr_events_create_table_present', /create table if not exists public\.sr_events/i.test(source), 'create table statement'));
  checks.push(makeCheck('sr_events_rls_enabled', /alter table public\.sr_events enable row level security/i.test(source), 'RLS enabled'));
  checks.push(makeCheck('sr_events_insert_policy_present', /policyname\s*=\s*'sr_events_insert_anon'/i.test(source), 'anon insert policy'));
  checks.push(makeCheck('sr_events_select_policy_present', /policyname\s*=\s*'sr_events_select_authenticated'/i.test(source), 'authenticated select policy'));

  const liveConfig = getLiveConfig();
  let liveStatus = null;

  if (liveConfig.enabled) {
    const response = await fetch(`${liveConfig.url}/rest/v1/sr_events?select=id,event_name,created_at&order=created_at.desc&limit=1`, {
      headers: {
        apikey: liveConfig.key,
        Authorization: `Bearer ${liveConfig.token}`,
      },
    });

    const body = await response.text().catch(() => '');
    liveStatus = {
      ok: response.ok,
      status: response.status,
      bodyPreview: body.slice(0, 280),
    };

    checks.push(
      makeCheck(
        'live_sr_events_query',
        response.ok,
        response.ok ? 'ok' : response.status === 404 ? 'sr_events table missing' : `status ${response.status}`
      )
    );
  } else {
    checks.push(makeCheck('live_sr_events_check_skipped', true, liveConfig.reason));
  }

  const failed = checks.filter((item) => !item.ok);
  const output = {
    generatedAt: new Date().toISOString(),
    target: 'sr_events health',
    summary: {
      total: checks.length,
      passed: checks.length - failed.length,
      failed: failed.length,
      failedIds: failed.map((item) => item.id),
      status: failed.length ? 'fail' : 'pass',
    },
    checks,
    live: {
      enabled: liveConfig.enabled,
      mode: liveConfig.mode || null,
      reason: liveConfig.reason || '',
      result: liveStatus,
    },
  };

  ensureDir(reportDir);
  fs.writeFileSync(reportPath, JSON.stringify(output, null, 2), 'utf8');

  console.log(`SR events health report: ${reportPath}`);
  console.log(`Status: ${output.summary.status.toUpperCase()} (${output.summary.passed}/${output.summary.total})`);

  if (failed.length) {
    failed.forEach((item) => console.error(`FAIL: ${item.id} - ${item.detail}`));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

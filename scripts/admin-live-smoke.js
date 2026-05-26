const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const reportDir = path.join(repoRoot, 'reports');
const reportPath = path.join(reportDir, 'admin-live-smoke-report.json');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function makeStep(id, ok, detail, data) {
  return {
    id,
    ok: Boolean(ok),
    detail: detail || '',
    data: data || null,
  };
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

  if (!url) {
    return { enabled: false, reason: 'SUPABASE_URL is missing' };
  }

  if (serviceRole) {
    return {
      enabled: true,
      mode: 'service_role',
      url,
      key: serviceRole,
      token: serviceRole,
    };
  }

  if (anonKey && authToken) {
    if (isJwtExpired(authToken)) {
      return {
        enabled: false,
        reason: 'SUPABASE_AUTH_TOKEN is expired',
      };
    }

    return {
      enabled: true,
      mode: 'anon_plus_auth_token',
      url,
      key: anonKey,
      token: authToken,
    };
  }

  return {
    enabled: false,
    reason: 'Provide SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY + SUPABASE_AUTH_TOKEN',
  };
}

function headers(config) {
  return {
    apikey: config.key,
    Authorization: `Bearer ${config.token}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };
}

async function request(config, pathSuffix, options = {}) {
  const response = await fetch(`${config.url}${pathSuffix}`, options);
  const text = await response.text().catch(() => '');
  let json = null;

  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  return { response, text, json };
}

async function getAthlete(config, id) {
  const query = `/rest/v1/athletes?id=eq.${encodeURIComponent(id)}&select=*`;
  const { response, json, text } = await request(config, query, {
    method: 'GET',
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`get athlete failed (${response.status}): ${text.slice(0, 180)}`);
  }

  return Array.isArray(json) ? json[0] || null : null;
}

async function main() {
  const started = Date.now();
  const steps = [];
  const config = getLiveConfig();

  if (!config.enabled) {
    const output = {
      generatedAt: new Date().toISOString(),
      target: 'admin live smoke',
      summary: {
        status: 'pass',
        total: 1,
        passed: 1,
        failed: 0,
      },
      skipped: true,
      reason: config.reason,
      steps: [makeStep('smoke_skipped', true, config.reason)],
    };

    ensureDir(reportDir);
    fs.writeFileSync(reportPath, JSON.stringify(output, null, 2), 'utf8');
    console.log(`Admin live smoke report: ${reportPath}`);
    console.log('Status: PASS (skipped - missing env credentials)');
    return;
  }

  const id = `smoke_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const baseline = {
    id,
    first_name: 'Smoke',
    last_name: 'Runner',
    email: `${id}@example.test`,
    phone: '555-000-0000',
    jersey_number: '9',
    position: 'QB',
    class_year: '2027',
    height: '6-0',
    weight: '180',
    school: 'Smoke High',
    state: 'TX',
    rec_team: 'Smoke Squad',
    instagram: '@smokesuite',
    x_twitter: '@smokesuitex',
    tiktok: '@smokesuitetk',
    video_url: 'https://example.com/smoke',
    package: 'transcript',
    status: 'booked',
    grade: 90,
    transcript_url: 'https://example.com/transcript.pdf',
    notes: 'admin live smoke baseline',
  };

  try {
    const insert = await request(config, '/rest/v1/athletes?on_conflict=id', {
      method: 'POST',
      headers: headers(config),
      body: JSON.stringify(baseline),
    });

    steps.push(makeStep('seed_create', insert.response.ok, insert.response.ok ? 'created' : `status ${insert.response.status}`));
    if (!insert.response.ok) {
      throw new Error(`seed create failed (${insert.response.status}): ${insert.text.slice(0, 220)}`);
    }

    const seeded = await getAthlete(config, id);
    steps.push(makeStep('seed_verify', Boolean(seeded), seeded ? 'seed row loaded' : 'seed row missing'));

    const bulkUpdate = await request(config, `/rest/v1/athletes?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: headers(config),
      body: JSON.stringify({ status: 'grading' }),
    });
    steps.push(makeStep('bulk_execute_simulated', bulkUpdate.response.ok, bulkUpdate.response.ok ? 'status moved to grading' : `status ${bulkUpdate.response.status}`));
    if (!bulkUpdate.response.ok) {
      throw new Error(`bulk execute failed (${bulkUpdate.response.status}): ${bulkUpdate.text.slice(0, 220)}`);
    }

    const afterBulk = await getAthlete(config, id);
    steps.push(makeStep('bulk_execute_verify', afterBulk?.status === 'grading', `status=${afterBulk?.status || 'missing'}`));

    const undoUpdate = await request(config, `/rest/v1/athletes?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: headers(config),
      body: JSON.stringify({ status: 'booked' }),
    });
    steps.push(makeStep('bulk_undo_simulated', undoUpdate.response.ok, undoUpdate.response.ok ? 'status moved back to booked' : `status ${undoUpdate.response.status}`));
    if (!undoUpdate.response.ok) {
      throw new Error(`bulk undo failed (${undoUpdate.response.status}): ${undoUpdate.text.slice(0, 220)}`);
    }

    const afterUndo = await getAthlete(config, id);
    steps.push(makeStep('bulk_undo_verify', afterUndo?.status === 'booked', `status=${afterUndo?.status || 'missing'}`));

    const mutate = await request(config, `/rest/v1/athletes?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: headers(config),
      body: JSON.stringify({ status: 'paid', package: 'program', notes: 'admin live smoke mutated' }),
    });
    steps.push(makeStep('snapshot_mutate', mutate.response.ok, mutate.response.ok ? 'mutated state before restore' : `status ${mutate.response.status}`));
    if (!mutate.response.ok) {
      throw new Error(`snapshot mutate failed (${mutate.response.status}): ${mutate.text.slice(0, 220)}`);
    }

    const restore = await request(config, `/rest/v1/athletes?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: headers(config),
      body: JSON.stringify({ status: baseline.status, package: baseline.package, notes: baseline.notes }),
    });
    steps.push(makeStep('snapshot_restore_simulated', restore.response.ok, restore.response.ok ? 'restored baseline state' : `status ${restore.response.status}`));
    if (!restore.response.ok) {
      throw new Error(`snapshot restore failed (${restore.response.status}): ${restore.text.slice(0, 220)}`);
    }

    const afterRestore = await getAthlete(config, id);
    const restored = afterRestore?.status === baseline.status && afterRestore?.package === baseline.package;
    steps.push(makeStep('snapshot_restore_verify', restored, `status=${afterRestore?.status || 'missing'}, package=${afterRestore?.package || 'missing'}`));
  } catch (error) {
    steps.push(makeStep('flow_error', false, error instanceof Error ? error.message : String(error)));
  } finally {
    const cleanup = await request(config, `/rest/v1/athletes?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.token}`,
      },
    });

    steps.push(makeStep('cleanup_seed', cleanup.response.ok, cleanup.response.ok ? 'deleted seed row' : `status ${cleanup.response.status}`));
  }

  const failed = steps.filter((item) => !item.ok);
  const finished = Date.now();

  const output = {
    generatedAt: new Date().toISOString(),
    target: 'admin live smoke',
    mode: config.mode,
    durationMs: finished - started,
    summary: {
      status: failed.length ? 'fail' : 'pass',
      total: steps.length,
      passed: steps.length - failed.length,
      failed: failed.length,
      failedIds: failed.map((item) => item.id),
    },
    steps,
  };

  ensureDir(reportDir);
  fs.writeFileSync(reportPath, JSON.stringify(output, null, 2), 'utf8');

  console.log(`Admin live smoke report: ${reportPath}`);
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

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const reportDir = path.join(repoRoot, 'reports');
const reportPath = path.join(reportDir, 'supabase-schema-contract-report.json');
const schemaPath = path.join(repoRoot, 'supabase-schema.sql');
const migrationPath = path.join(repoRoot, 'supabase-athlete-profile-columns-migration.sql');

const EXPECTED_ATHLETES_COLUMNS = [
  'id',
  'first_name',
  'last_name',
  'email',
  'phone',
  'jersey_number',
  'position',
  'class_year',
  'height',
  'weight',
  'school',
  'state',
  'rec_team',
  'instagram',
  'x_twitter',
  'tiktok',
  'video_url',
  'package',
  'status',
  'grade',
  'transcript_url',
  'notes',
  'created_at',
  'updated_at',
];

const PROFILE_COLUMNS = [
  'jersey_number',
  'height',
  'weight',
  'rec_team',
  'instagram',
  'x_twitter',
  'tiktok',
  'video_url',
];

const EXPECTED_SR_EVENTS_COLUMNS = [
  'id',
  'event_name',
  'detail',
  'page',
  'source',
  'created_at',
];

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

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function extractCreateTableColumns(sql, tableName) {
  const pattern = new RegExp(`create\\s+table\\s+if\\s+not\\s+exists\\s+${tableName}\\s*\\(([^]*?)\\)\\s*;`, 'i');
  const match = sql.match(pattern);
  if (!match) return [];

  return match[1]
    .split('\n')
    .map((line) => line.replace(/--.*$/, '').trim())
    .filter(Boolean)
    .map((line) => line.replace(/,$/, '').trim())
    .map((line) => {
      const m = line.match(/^([a-z_][a-z0-9_]*)\s+/i);
      if (!m) return '';
      const token = m[1].toLowerCase();
      if (['constraint', 'primary', 'foreign', 'unique', 'check'].includes(token)) return '';
      return token;
    })
    .filter(Boolean);
}

function extractMigrationColumns(sql) {
  const matches = [...sql.matchAll(/add\s+column\s+if\s+not\s+exists\s+([a-z_][a-z0-9_]*)\s+/gi)];
  return matches.map((item) => item[1].toLowerCase());
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
      url,
      key: serviceRole,
      token: serviceRole,
      mode: 'service_role',
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
      url,
      key: anonKey,
      token: authToken,
      mode: 'anon_plus_auth_token',
    };
  }

  return {
    enabled: false,
    reason: 'Provide SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY + SUPABASE_AUTH_TOKEN for live checks',
  };
}

async function runLiveSelect(config, table, columns) {
  const query = encodeURIComponent(columns.join(','));
  const response = await fetch(`${config.url}/rest/v1/${table}?select=${query}&limit=1`, {
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.token}`,
    },
  });

  const body = await response.text().catch(() => '');
  const missingMatches = [...body.matchAll(/Could not find the '([^']+)' column/gi)];
  const missingColumns = missingMatches.map((item) => item[1]);

  return {
    ok: response.ok,
    status: response.status,
    missingColumns,
    bodyPreview: body.slice(0, 280),
  };
}

async function main() {
  const checks = [];

  const hasSchemaFile = fs.existsSync(schemaPath);
  const hasMigrationFile = fs.existsSync(migrationPath);

  checks.push(makeCheck('schema_file_exists', hasSchemaFile, schemaPath));
  checks.push(makeCheck('migration_file_exists', hasMigrationFile, migrationPath));

  const schemaSql = hasSchemaFile ? fs.readFileSync(schemaPath, 'utf8') : '';
  const migrationSql = hasMigrationFile ? fs.readFileSync(migrationPath, 'utf8') : '';

  const schemaColumns = extractCreateTableColumns(schemaSql, 'athletes');
  const migrationColumns = extractMigrationColumns(migrationSql);

  checks.push(makeCheck('schema_has_athletes_table', schemaColumns.length > 0, `columns found: ${schemaColumns.length}`));

  const missingFromSchema = EXPECTED_ATHLETES_COLUMNS.filter((column) => !schemaColumns.includes(column));
  checks.push(
    makeCheck(
      'schema_has_required_athletes_columns',
      missingFromSchema.length === 0,
      missingFromSchema.length ? `missing: ${missingFromSchema.join(', ')}` : 'ok'
    )
  );

  const missingFromMigration = PROFILE_COLUMNS.filter((column) => !migrationColumns.includes(column));
  checks.push(
    makeCheck(
      'migration_has_profile_columns',
      missingFromMigration.length === 0,
      missingFromMigration.length ? `missing: ${missingFromMigration.join(', ')}` : 'ok'
    )
  );

  checks.push(
    makeCheck(
      'events_schema_sql_present',
      schemaSql.includes('sr_events') || fs.existsSync(path.join(repoRoot, 'supabase-events-schema.sql')),
      'sr_events schema is defined in repository'
    )
  );

  const liveConfig = getLiveConfig();
  const liveChecks = [];

  if (liveConfig.enabled) {
    const athletesLive = await runLiveSelect(liveConfig, 'athletes', EXPECTED_ATHLETES_COLUMNS);
    const eventsLive = await runLiveSelect(liveConfig, 'sr_events', EXPECTED_SR_EVENTS_COLUMNS);

    liveChecks.push({ id: 'live_athletes_select', ...athletesLive });
    liveChecks.push({ id: 'live_sr_events_select', ...eventsLive });

    checks.push(
      makeCheck(
        'live_athletes_schema_contract',
        athletesLive.ok,
        athletesLive.ok
          ? 'ok'
          : athletesLive.missingColumns.length
            ? `missing: ${athletesLive.missingColumns.join(', ')}`
            : `status ${athletesLive.status}`
      )
    );

    checks.push(
      makeCheck(
        'live_sr_events_contract',
        eventsLive.ok,
        eventsLive.ok
          ? 'ok'
          : eventsLive.status === 404
            ? 'sr_events table missing (run supabase-events-schema.sql)'
            : eventsLive.missingColumns.length
              ? `missing: ${eventsLive.missingColumns.join(', ')}`
              : `status ${eventsLive.status}`
      )
    );
  } else {
    checks.push(makeCheck('live_checks_skipped', true, liveConfig.reason));
  }

  const failed = checks.filter((item) => !item.ok);
  const output = {
    generatedAt: new Date().toISOString(),
    target: 'supabase schema contract',
    static: {
      schemaPath,
      migrationPath,
      expectedAthletesColumns: EXPECTED_ATHLETES_COLUMNS,
      expectedSrEventsColumns: EXPECTED_SR_EVENTS_COLUMNS,
      extractedAthletesColumns: schemaColumns,
      extractedMigrationColumns: migrationColumns,
    },
    live: {
      enabled: liveConfig.enabled,
      mode: liveConfig.mode || null,
      reason: liveConfig.reason || '',
      checks: liveChecks,
    },
    summary: {
      total: checks.length,
      passed: checks.length - failed.length,
      failed: failed.length,
      failedIds: failed.map((item) => item.id),
      status: failed.length ? 'fail' : 'pass',
    },
    checks,
  };

  ensureDir(reportDir);
  fs.writeFileSync(reportPath, JSON.stringify(output, null, 2), 'utf8');

  console.log(`Supabase schema contract report: ${reportPath}`);
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

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const reportDir = path.join(repoRoot, 'reports');
const suiteReportPath = path.join(reportDir, 'marketplace-validation-suite-report.json');
const suiteSummaryPath = path.join(reportDir, 'marketplace-validation-suite-summary.md');

const LIVE_REQUIRED_TASK_IDS = [
  'supabase_schema_contract',
  'sr_events_health',
  'admin_live_smoke',
];

const tasks = [
  {
    id: 'supabase_schema_contract',
    command: 'node',
    args: ['./scripts/supabase-schema-contract-check.js'],
    reportPath: './reports/supabase-schema-contract-report.json',
  },
  {
    id: 'sr_events_health',
    command: 'node',
    args: ['./scripts/sr-events-healthcheck.js'],
    reportPath: './reports/sr-events-health-report.json',
  },
  {
    id: 'regenerate_static',
    command: 'node',
    args: ['./scripts/update-marketplace-static.js'],
    reportPath: null,
  },
  {
    id: 'healthcheck_static',
    command: 'node',
    args: ['./scripts/marketplace-static-healthcheck.js'],
    reportPath: './reports/marketplace-static-health-report.json',
  },
  {
    id: 'games_relevance',
    command: 'node',
    args: ['./scripts/games-relevance-check.js'],
    reportPath: './reports/games-relevance-scorecard.json',
  },
  {
    id: 'smoke_static',
    command: 'node',
    args: ['./scripts/marketplace-static-smoke.js'],
    reportPath: './reports/marketplace-static-smoke-report.json',
  },
  {
    id: 'admin_ops',
    command: 'node',
    args: ['./scripts/admin-ops-check.js'],
    reportPath: './reports/admin-ops-check-report.json',
  },
  {
    id: 'admin_live_smoke',
    command: 'node',
    args: ['./scripts/admin-live-smoke.js'],
    reportPath: './reports/admin-live-smoke-report.json',
  },
  {
    id: 'subjectreport_modal_focus',
    command: 'node',
    args: ['./scripts/modal-focus-trap-check.js'],
    reportPath: './reports/subjectreport-modal-focus-report.json',
  },
];

function runTask(task) {
  const start = Date.now();
  const result = spawnSync(task.command, task.args, {
    cwd: repoRoot,
    encoding: 'utf8',
    timeout: 180000,
    maxBuffer: 1024 * 1024 * 8,
  });
  const end = Date.now();

  const entry = {
    id: task.id,
    command: [task.command, ...task.args].join(' '),
    startedAt: new Date(start).toISOString(),
    finishedAt: new Date(end).toISOString(),
    durationMs: end - start,
    exitCode: Number.isInteger(result.status) ? result.status : 1,
    ok: result.status === 0,
    stdout: String(result.stdout || '').trim(),
    stderr: String(result.stderr || '').trim(),
  };

  if (task.reportPath) {
    const absoluteReportPath = path.join(repoRoot, task.reportPath);
    if (fs.existsSync(absoluteReportPath)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(absoluteReportPath, 'utf8'));
        entry.report = parsed;
      } catch (err) {
        entry.reportReadError = err instanceof Error ? err.message : 'Unable to read task report';
      }
    }
  }

  return entry;
}

function buildSummary(results) {
  const failed = results.filter((item) => !item.ok);
  return {
    status: failed.length ? 'fail' : 'pass',
    total: results.length,
    passed: results.length - failed.length,
    failed: failed.length,
    failedTaskIds: failed.map((item) => item.id),
  };
}

function getLiveState(task) {
  if (!LIVE_REQUIRED_TASK_IDS.includes(task.id)) {
    return {
      id: task.id,
      required: false,
      live: null,
      reason: 'not a live-required task',
    };
  }

  const report = task.report || {};

  if (task.id === 'admin_live_smoke') {
    const skipped = Boolean(report.skipped);
    if (skipped) {
      return {
        id: task.id,
        required: true,
        live: false,
        reason: report.reason || 'admin live smoke skipped',
      };
    }

    return {
      id: task.id,
      required: true,
      live: Boolean(report.mode),
      reason: report.mode ? `mode=${report.mode}` : 'admin live smoke report missing mode',
    };
  }

  if (report.live && typeof report.live.enabled === 'boolean') {
    return {
      id: task.id,
      required: true,
      live: report.live.enabled,
      reason: report.live.enabled
        ? `mode=${report.live.mode || 'unknown'}`
        : (report.live.reason || 'live checks disabled'),
    };
  }

  return {
    id: task.id,
    required: true,
    live: false,
    reason: 'live metadata missing in task report',
  };
}

function buildLiveSummary(results) {
  const states = results.map(getLiveState).filter((item) => item.required);
  const livePassed = states.filter((item) => item.live).length;
  const liveFailedStates = states.filter((item) => !item.live);

  return {
    requiredTaskIds: LIVE_REQUIRED_TASK_IDS,
    requiredCount: states.length,
    livePassed,
    liveFailed: liveFailedStates.length,
    allLive: liveFailedStates.length === 0,
    states,
  };
}

function formatDuration(durationMs) {
  if (!Number.isFinite(durationMs) || durationMs < 0) return '0ms';
  if (durationMs < 1000) return `${durationMs}ms`;
  return `${(durationMs / 1000).toFixed(2)}s`;
}

function reportPathForTask(task) {
  if (!task.reportPath) return '';
  return task.reportPath.startsWith('./') ? task.reportPath.slice(2) : task.reportPath;
}

function buildMarkdownSummary(output) {
  const lines = [];
  const statusLabel = output.summary.status === 'pass' ? 'PASS' : 'FAIL';
  const liveLabel = output.live.allLive ? 'LIVE' : 'SAFE-MODE';

  lines.push('# Marketplace Validation Suite Summary');
  lines.push('');
  lines.push(`- Generated: ${output.generatedAt}`);
  lines.push(`- Workspace: ${output.workspace}`);
  lines.push(`- Status: ${statusLabel} (${output.summary.passed}/${output.summary.total})`);
  lines.push(`- Live Mode: ${liveLabel} (${output.live.livePassed}/${output.live.requiredCount})`);
  lines.push(`- Duration: ${formatDuration(output.totalDurationMs)}`);
  lines.push('');

  lines.push('## Live Validation');
  lines.push('');
  lines.push('| Task | Live | Detail |');
  lines.push('| --- | --- | --- |');
  output.live.states.forEach((item) => {
    lines.push(`| ${item.id} | ${item.live ? 'YES' : 'NO'} | ${item.reason} |`);
  });
  lines.push('');

  lines.push('## Task Results');
  lines.push('');
  lines.push('| Task | Status | Duration | Report |');
  lines.push('| --- | --- | --- | --- |');

  output.tasks.forEach((task) => {
    const taskStatus = task.ok ? 'PASS' : 'FAIL';
    const reportPath = reportPathForTask(task);
    const reportCell = reportPath ? `[${reportPath}](${reportPath})` : '-';
    lines.push(`| ${task.id} | ${taskStatus} | ${formatDuration(task.durationMs)} | ${reportCell} |`);
  });

  lines.push('');
  lines.push('## Notes');
  lines.push('');
  lines.push('- This summary is generated by scripts/marketplace-validation-suite.js.');
  lines.push('- Detailed logs and JSON payloads are in reports/marketplace-validation-suite-report.json.');

  return `${lines.join('\n')}\n`;
}

function main() {
  const requireLive = process.argv.includes('--require-live');
  const startedAtDate = new Date();
  const startedAt = startedAtDate.toISOString();

  const results = tasks.map(runTask);
  const summary = buildSummary(results);
  const live = buildLiveSummary(results);
  const finishedAtDate = new Date();
  const totalDurationMs = finishedAtDate.getTime() - startedAtDate.getTime();

  const output = {
    generatedAt: finishedAtDate.toISOString(),
    startedAt,
    finishedAt: finishedAtDate.toISOString(),
    totalDurationMs,
    workspace: repoRoot,
    summary,
    live,
    tasks: results,
  };

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  fs.writeFileSync(suiteReportPath, JSON.stringify(output, null, 2), 'utf8');
  fs.writeFileSync(suiteSummaryPath, buildMarkdownSummary(output), 'utf8');

  console.log(`Marketplace validation suite report: ${suiteReportPath}`);
  console.log(`Marketplace validation suite summary: ${suiteSummaryPath}`);
  console.log(`Status: ${summary.status.toUpperCase()} (${summary.passed}/${summary.total})`);
  console.log(`Live mode: ${live.allLive ? 'LIVE' : 'SAFE-MODE'} (${live.livePassed}/${live.requiredCount})`);

  if (summary.failed > 0) {
    summary.failedTaskIds.forEach((id) => console.error(`FAIL: ${id}`));
    process.exit(1);
  }

  if (requireLive && !live.allLive) {
    live.states
      .filter((item) => !item.live)
      .forEach((item) => console.error(`LIVE REQUIRED FAIL: ${item.id} - ${item.reason}`));
    process.exit(1);
  }
}

main();

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const reportDir = path.join(repoRoot, 'reports');
const reportPath = path.join(reportDir, 'games-relevance-scorecard.json');
const markdownReportPath = path.join(reportDir, 'games-relevance-scorecard.md');

function formatQuery(query) {
  const entries = Object.entries(query || {});
  if (!entries.length) return 'none';
  return entries.map(([key, value]) => `${key}=${String(value)}`).join(', ');
}

function buildMarkdownReport(report) {
  const lines = [];
  lines.push('# Games Relevance Scorecard');
  lines.push('');
  lines.push(`- Generated: ${report.generatedAt}`);
  lines.push(`- Score: ${report.score}% (${report.summary.passed}/${report.summary.total})`);
  lines.push(`- Status: ${report.summary.failed ? 'FAIL' : 'PASS'}`);
  lines.push('');
  lines.push('## Case Results');
  lines.push('');
  lines.push('| Case | Status | Top Result | Reasons | Query |');
  lines.push('| --- | --- | --- | --- | --- |');

  report.cases.forEach((item) => {
    const status = item.passed ? 'PASS' : 'FAIL';
    const topSlug = item.topResult?.slug || '-';
    const reasons = Array.isArray(item.topResult?.matchReasons) && item.topResult.matchReasons.length
      ? item.topResult.matchReasons.join('; ')
      : '-';
    lines.push(`| ${item.id} | ${status} | ${topSlug} | ${reasons} | ${formatQuery(item.query)} |`);
  });

  lines.push('');
  lines.push('## Top Miss Diagnostics');
  lines.push('');

  if (!report.summary.failedCases.length) {
    lines.push('- None. All benchmark cases passed.');
  } else {
    report.topMisses.forEach((miss) => {
      lines.push(`- ${miss.id}: expected ${miss.expected}; got top=${miss.actualTopSlug || 'none'} reasons=${miss.actualReasons || 'none'} query=${formatQuery(miss.query)}`);
    });
  }

  return `${lines.join('\n')}\n`;
}

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .split(/[^a-z0-9#]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function buildRelevance(game, { q, team, requestedTags }) {
  const reasons = [];
  let score = 0;

  const name = String(game.name || '').toLowerCase();
  const meta = String(game.meta || '').toLowerCase();
  const seller = String(game.seller || '').toLowerCase();
  const gameTeam = String(game.team || '').toLowerCase();
  const tags = (Array.isArray(game.tags) ? game.tags : []).map((tag) => String(tag || '').toLowerCase());
  const searchable = `${name} ${meta} ${seller} ${gameTeam} ${tags.join(' ')}`;

  if (q) {
    const normalizedQ = q.trim();
    if (normalizedQ && searchable.includes(normalizedQ)) {
      score += 80;
      reasons.push('Exact search');
    }

    const jerseyToken = normalizedQ.match(/^#?\d{1,3}$/);
    if (jerseyToken && searchable.includes(jerseyToken[0].replace(/^#/, ''))) {
      score += 120;
      reasons.push('Exact jersey');
    }

    const tokens = tokenize(normalizedQ).slice(0, 4);
    for (const token of tokens) {
      if (token.length < 2) continue;
      if (searchable.includes(token)) score += 18;
    }
  }

  if (team) {
    const normalizedTeam = team.trim();
    if (normalizedTeam && gameTeam === normalizedTeam) {
      score += 85;
      reasons.push('Exact team');
    } else if (normalizedTeam && (gameTeam.includes(normalizedTeam) || name.includes(normalizedTeam))) {
      score += 55;
      reasons.push('Team match');
    }
  }

  if (requestedTags.length) {
    const tagHits = requestedTags.filter((tag) => {
      if (tags.includes(tag)) return true;
      return searchable.includes(tag);
    });

    if (tagHits.length) {
      score += tagHits.length * 35;
      reasons.push(tagHits.length > 1 ? `${tagHits.length} tag matches` : 'Tag match');
    }
  }

  return {
    score,
    reasons: reasons.slice(0, 3),
  };
}

function rankGames(games, query) {
  const q = String(query.q || '').toLowerCase();
  const team = String(query.team || '').toLowerCase();
  const requestedTags = String(query.tags || '')
    .toLowerCase()
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const sort = query.sort || 'Most Recent';

  const hasSearchSignal = Boolean(q || team || requestedTags.length);

  const withRelevance = games.map((game) => {
    const relevance = buildRelevance(game, { q, team, requestedTags });
    return {
      ...game,
      relevanceScore: relevance.score,
      matchReasons: relevance.reasons,
    };
  });

  if (hasSearchSignal) {
    return withRelevance.sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) return b.relevanceScore - a.relevanceScore;
      if (sort === 'Most Clips' && b.clips !== a.clips) return b.clips - a.clips;
      return a.dateValue < b.dateValue ? 1 : -1;
    });
  }

  if (sort === 'Most Clips') {
    return withRelevance.sort((a, b) => b.clips - a.clips);
  }

  return withRelevance.sort((a, b) => (a.dateValue < b.dateValue ? 1 : -1));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function run() {
  const sampleGames = [
    {
      slug: 'alpha',
      name: 'Allen vs Plano East',
      team: 'allen',
      meta: 'QB #7 highlights',
      seller: 'Subject Report',
      tags: ['Highlight', 'Touchdown'],
      clips: 90,
      dateValue: '2026-10-18',
    },
    {
      slug: 'beta',
      name: 'Plano East vs Frisco',
      team: 'plano east',
      meta: 'WR #11 and #2 clips',
      seller: 'Subject Media',
      tags: ['Catch'],
      clips: 120,
      dateValue: '2026-10-10',
    },
    {
      slug: 'gamma',
      name: 'Dallas Showcase',
      team: 'dallas',
      meta: 'RB #7 camp tape',
      seller: 'Rated 7v7',
      tags: ['Camp', 'Highlight'],
      clips: 55,
      dateValue: '2026-10-20',
    },
  ];

  const benchmarkCases = [
    {
      id: 'jersey_priority',
      query: { q: '7', sort: 'Most Recent' },
      verify: (ranked) => (ranked[0].slug === 'alpha' || ranked[0].slug === 'gamma') && ranked[0].matchReasons.includes('Exact jersey'),
      expected: 'Top result should be a #7 match with Exact jersey reason',
    },
    {
      id: 'exact_team_priority',
      query: { team: 'allen', sort: 'Most Recent' },
      verify: (ranked) => ranked[0].slug === 'alpha' && ranked[0].matchReasons.includes('Exact team'),
      expected: 'Exact team should rank first with Exact team reason',
    },
    {
      id: 'tag_stack_priority',
      query: { tags: 'highlight,touchdown', sort: 'Most Recent' },
      verify: (ranked) => ranked[0].slug === 'alpha' && ranked[0].matchReasons.some((reason) => reason.toLowerCase().includes('tag')),
      expected: 'Strong tag match should rank first and include tag reason',
    },
    {
      id: 'fallback_most_clips',
      query: { sort: 'Most Clips' },
      verify: (ranked) => ranked[0].slug === 'beta',
      expected: 'No-signal fallback Most Clips should rank by clip count',
    },
    {
      id: 'fallback_most_recent',
      query: { sort: 'Most Recent' },
      verify: (ranked) => ranked[0].slug === 'gamma',
      expected: 'No-signal fallback Most Recent should rank newest first',
    },
  ];

  const caseResults = benchmarkCases.map((testCase) => {
    const ranked = rankGames(sampleGames, testCase.query);
    const passed = Boolean(testCase.verify(ranked));
    return {
      id: testCase.id,
      passed,
      expected: testCase.expected,
      topResult: ranked[0] ? {
        slug: ranked[0].slug,
        relevanceScore: ranked[0].relevanceScore,
        matchReasons: ranked[0].matchReasons,
      } : null,
      query: testCase.query,
    };
  });

  const passedCount = caseResults.filter((item) => item.passed).length;
  const total = caseResults.length;
  const score = total ? Math.round((passedCount / total) * 100) : 0;
  const failedCases = caseResults.filter((item) => !item.passed).map((item) => item.id);
  const topMisses = caseResults
    .filter((item) => !item.passed)
    .map((item) => ({
      id: item.id,
      expected: item.expected,
      actualTopSlug: item.topResult?.slug || '',
      actualReasons: Array.isArray(item.topResult?.matchReasons) ? item.topResult.matchReasons.join('; ') : '',
      query: item.query,
    }));

  const report = {
    generatedAt: new Date().toISOString(),
    score,
    summary: {
      total,
      passed: passedCount,
      failed: total - passedCount,
      failedCases,
    },
    cases: caseResults,
    topMisses,
  };

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  fs.writeFileSync(markdownReportPath, buildMarkdownReport(report), 'utf8');

  assert(failedCases.length === 0, `Relevance scorecard failed cases: ${failedCases.join(', ')}`);

  console.log(`Games relevance checks: PASS (${passedCount}/${total}, ${score}%)`);
  console.log(`Games relevance scorecard report: ${reportPath}`);
  console.log(`Games relevance markdown scorecard: ${markdownReportPath}`);
}

run();

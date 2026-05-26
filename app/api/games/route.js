import { NextResponse } from 'next/server';
import { games } from '@/components/gfs/marketplaceData';
import { getPublishedCreatorGames } from '@/lib/creatorUploadStore';
import logger from '@/lib/logger';
import { writeAuditLog } from '@/lib/auditLog';
import { checkAnomaly } from '@/lib/anomalyDetection';

function normalizeSortValue(sort) {
  return sort || 'Most Recent';
}

function normalizeMediaValue(mediaType) {
  return mediaType || 'All Media';
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

export async function GET(request) {
  const ip = request?.headers?.get?.('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const anomaly = await checkAnomaly(`ip:${ip}`, 'games', 100);
  if (anomaly) {
    logger.warn({ ip }, 'Anomaly detected for games endpoint');
    await writeAuditLog({ userId: null, ip, action: 'anomaly_detected', details: { endpoint: 'games' } });
  }

  const params = request.nextUrl.searchParams;

  const q = (params.get('q') || '').toLowerCase();
  const tagQuery = (params.get('tags') || '').toLowerCase();
  const team = (params.get('team') || '').toLowerCase();
  const sport = params.get('sport') || 'All Sports';
  const dateRange = params.get('date_range') || 'All Dates';
  const sort = normalizeSortValue(params.get('sort'));
  const mediaType = normalizeMediaValue(params.get('media_type'));
  const page = Math.max(1, Number(params.get('page') || '1'));
  const pageSize = 6;

  const creatorGames = await getPublishedCreatorGames();
  let filtered = [...creatorGames, ...games];
  const requestedTags = tagQuery
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (q) {
    filtered = filtered.filter((game) => {
      const searchable = `${game.name} ${game.meta} ${game.seller} ${game.team} ${(game.tags || []).join(' ')}`.toLowerCase();
      return searchable.includes(q);
    });
  }

  if (tagQuery) {
    if (requestedTags.length) {
      filtered = filtered.filter((game) => {
        const gameTags = Array.isArray(game.tags) ? game.tags.map((item) => String(item).toLowerCase()) : [];
        const haystack = `${gameTags.join(' ')} ${game.name} ${game.meta}`.toLowerCase();
        return requestedTags.every((tag) => haystack.includes(tag));
      });
    }
  }

  if (team) {
    filtered = filtered.filter((game) => game.team.toLowerCase().includes(team));
  }

  if (sport !== 'All Sports') {
    filtered = filtered.filter((game) => game.sport === sport);
  }

  if (dateRange === 'Last 30 Days') {
    filtered = filtered.filter((game) => game.dateBucket === 'last30');
  }

  if (dateRange === 'This Season') {
    filtered = filtered.filter((game) => game.dateBucket === 'season' || game.dateBucket === 'last30');
  }

  if (mediaType === 'Videos Only') {
    filtered = filtered.filter((game) => game.mediaType === 'video');
  }

  if (mediaType === 'Photos Only') {
    filtered = filtered.filter((game) => game.mediaType === 'photo');
  }

  filtered = filtered.map((game) => {
    const relevance = buildRelevance(game, { q, team, requestedTags });
    return {
      ...game,
      relevanceScore: relevance.score,
      matchReasons: relevance.reasons,
    };
  });

  const hasSearchSignal = Boolean(q || team || requestedTags.length);

  if (hasSearchSignal) {
    filtered.sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }

      if (sort === 'Most Clips' && b.clips !== a.clips) {
        return b.clips - a.clips;
      }

      return a.dateValue < b.dateValue ? 1 : -1;
    });
  }

  if (!hasSearchSignal && sort === 'Most Clips') {
    filtered.sort((a, b) => b.clips - a.clips);
  } else if (!hasSearchSignal) {
    filtered.sort((a, b) => (a.dateValue < b.dateValue ? 1 : -1));
  }

  const totalGames = filtered.length;
  const totalClips = filtered.reduce((acc, game) => acc + game.clips, 0);
  const totalPages = Math.max(1, Math.ceil(totalGames / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  logger.info({ ip, count: filtered.length }, 'Games endpoint accessed');
  await writeAuditLog({ userId: null, ip, action: 'games_accessed', details: { count: filtered.length } });

  return NextResponse.json({
    items,
    totalGames,
    totalClips,
    totalPages,
    page: safePage,
  });
}

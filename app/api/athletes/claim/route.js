import { randomUUID } from 'node:crypto';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getAthleteClaimForUser, upsertAthleteClaim } from '@/lib/athleteClaimStore';

const REQUIRED_FIELDS = [
  'jerseyNumber',
  'firstName',
  'lastName',
  'position',
  'email',
  'classYear',
  'height',
  'weight',
  'stateProvince',
  'schoolTeam',
];

function normalize(payload) {
  return {
    jerseyNumber: String(payload.jerseyNumber || '').trim(),
    firstName: String(payload.firstName || '').trim(),
    lastName: String(payload.lastName || '').trim(),
    position: String(payload.position || '').trim(),
    email: String(payload.email || '').trim(),
    classYear: String(payload.classYear || '').trim(),
    height: String(payload.height || '').trim(),
    weight: String(payload.weight || '').trim(),
    stateProvince: String(payload.stateProvince || '').trim(),
    schoolTeam: String(payload.schoolTeam || '').trim(),
    recTeam: String(payload.recTeam || '').trim(),
    instagram: String(payload.instagram || '').trim(),
    xTwitter: String(payload.xTwitter || '').trim(),
    tikTok: String(payload.tikTok || '').trim(),
    videoUrl: String(payload.videoUrl || '').trim(),
  };
}

function getMissingFields(payload) {
  return REQUIRED_FIELDS.filter((field) => !payload[field]);
}

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const claim = await getAthleteClaimForUser(userId);
  return NextResponse.json({ claim });
}

export async function POST(request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Simple in-memory rate limit (per user, per minute)
  if (!globalThis.__athleteClaimRateLimit) globalThis.__athleteClaimRateLimit = {};
  const userRateLimit = globalThis.__athleteClaimRateLimit;
  const MAX_REQUESTS_PER_MIN = 10;
  const now = Date.now();
  const windowStart = now - 60 * 1000;
  userRateLimit[userId] = (userRateLimit[userId] || []).filter(ts => ts > windowStart);
  if (userRateLimit[userId].length >= MAX_REQUESTS_PER_MIN) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }
  userRateLimit[userId].push(now);

  const rawPayload = await request.json();
  const payload = normalize(rawPayload);
  const missingFields = getMissingFields(payload);

  if (missingFields.length > 0) {
    return NextResponse.json(
      {
        error: 'Missing required fields.',
        missingFields,
      },
      { status: 400 },
    );
  }

  const claim = {
    id: randomUUID(),
    userId,
    ...payload,
    updatedAt: new Date().toISOString(),
  };

  const saved = await upsertAthleteClaim(claim);
  return NextResponse.json({ message: 'Athlete template saved.', claim: saved });
}

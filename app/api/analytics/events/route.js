import { NextResponse } from 'next/server';
import {
  appendEvents,
  normalizeIncomingEvent,
  persistEventsToSupabase,
  readEventSummary,
} from '@/lib/eventStore';

export const runtime = 'nodejs';

const MAX_EVENTS_PER_REQUEST = 40;

function parseRequestPayload(body) {
  const candidate = Array.isArray(body?.events)
    ? body.events
    : Array.isArray(body)
      ? body
      : body
        ? [body]
        : [];

  return candidate.slice(0, MAX_EVENTS_PER_REQUEST);
}

export async function POST(request) {
  // Simple in-memory rate limit (per user, per minute)
  let userId = null;
  try {
    // Try to get userId from a custom header or event body if available (analytics may be anonymous)
    userId = request.headers.get('x-user-id') || null;
    if (!userId) {
      const bodyPeek = await request.clone().json().catch(() => null);
      userId = bodyPeek?.userId || null;
    }
  } catch {}
  if (!userId) {
    userId = 'anonymous';
  }
  if (!globalThis.__analyticsEventsRateLimit) globalThis.__analyticsEventsRateLimit = {};
  const userRateLimit = globalThis.__analyticsEventsRateLimit;
  const MAX_REQUESTS_PER_MIN = 20;
  const now = Date.now();
  const windowStart = now - 60 * 1000;
  userRateLimit[userId] = (userRateLimit[userId] || []).filter(ts => ts > windowStart);
  if (userRateLimit[userId].length >= MAX_REQUESTS_PER_MIN) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }
  userRateLimit[userId].push(now);

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const incoming = parseRequestPayload(body);
  if (!incoming.length) {
    return NextResponse.json({ error: 'No events supplied' }, { status: 400 });
  }

  const normalized = incoming.map(normalizeIncomingEvent);
  await appendEvents(normalized);

  let persistence = { mode: 'local-only' };
  try {
    persistence = await persistEventsToSupabase(normalized);
  } catch (error) {
    persistence = {
      mode: 'local-only',
      warning: error instanceof Error ? error.message : 'Supabase persistence failed',
    };
  }

  return NextResponse.json({
    ok: true,
    received: normalized.length,
    persistence,
  });
}

export async function GET() {
  const summary = await readEventSummary(250);
  return NextResponse.json(summary);
}

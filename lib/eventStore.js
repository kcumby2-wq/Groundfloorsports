import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const eventsFilePath = path.join(process.cwd(), 'data', 'events.json');

async function ensureEventsFile() {
  await mkdir(path.dirname(eventsFilePath), { recursive: true });
  try {
    await readFile(eventsFilePath, 'utf8');
  } catch {
    await writeFile(eventsFilePath, '[]\n', 'utf8');
  }
}

async function writeEvents(events) {
  await writeFile(eventsFilePath, `${JSON.stringify(events, null, 2)}\n`, 'utf8');
}

export async function readEvents() {
  await ensureEventsFile();
  const raw = await readFile(eventsFilePath, 'utf8');

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function normalizeIncomingEvent(input) {
  const now = new Date().toISOString();
  return {
    id: typeof input?.id === 'string' && input.id ? input.id : randomUUID(),
    eventName: typeof input?.event === 'string' && input.event ? input.event : 'unknown_event',
    detail: input?.detail && typeof input.detail === 'object' ? input.detail : {},
    page: typeof input?.page === 'string' ? input.page : '',
    timestamp: Number.isFinite(input?.timestamp) ? Number(input.timestamp) : Date.now(),
    marketing: input?.marketing && typeof input.marketing === 'object' ? input.marketing : {},
    source: typeof input?.source === 'string' ? input.source : 'subjectreport_landing',
    receivedAt: now,
  };
}

export async function appendEvents(events) {
  const existing = await readEvents();
  const next = [...events, ...existing].slice(0, 5000);
  await writeEvents(next);
  return events;
}

function normalizeEventForSupabase(event) {
  return {
    id: event.id,
    event_name: event.eventName,
    detail: event.detail,
    page: event.page,
    happened_at: new Date(event.timestamp || Date.now()).toISOString(),
    marketing: event.marketing,
    source: event.source,
    created_at: event.receivedAt,
  };
}

export async function persistEventsToSupabase(events) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return { mode: 'local-only' };
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/sr_events`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(events.map(normalizeEventForSupabase)),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase event write failed (${response.status}): ${errorText}`);
  }

  return { mode: 'supabase' };
}

export async function readEventSummary(limit = 200) {
  const rows = (await readEvents()).slice(0, Math.max(1, Math.min(limit, 1000)));
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const last24h = rows.filter((row) => now - Number(row.timestamp || 0) <= oneDayMs);

  const topMap = new Map();
  rows.forEach((row) => {
    const key = row.eventName || 'unknown_event';
    topMap.set(key, (topMap.get(key) || 0) + 1);
  });

  const topEvents = [...topMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([eventName, count]) => ({ eventName, count }));

  return {
    total: rows.length,
    last24h: last24h.length,
    topEvents,
    recent: rows.slice(0, 25),
  };
}

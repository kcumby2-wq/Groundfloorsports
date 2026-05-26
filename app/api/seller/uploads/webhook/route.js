import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getRedisClient } from '@/lib/redisClient';
import { auditLog } from '@/lib/auditLog';

export const runtime = 'nodejs';

// POST /api/seller/uploads/webhook
// Body: { event, uploadId, status, details }
export async function POST(request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await auditLog('upload_webhook_access', { userId });
  const { event, uploadId, status, details } = await request.json();
  if (!event || !uploadId) {
    return NextResponse.json({ error: 'Missing event or uploadId' }, { status: 400 });
  }
  const redis = getRedisClient();
  await redis.lpush(`upload:webhook:${uploadId}`, JSON.stringify({ event, status, details, at: new Date().toISOString() }));
  await redis.ltrim(`upload:webhook:${uploadId}`, 0, 49);
  return NextResponse.json({ ok: true });
}

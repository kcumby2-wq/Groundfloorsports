import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getRedisClient } from '@/lib/redisClient';
import { auditLog } from '@/lib/auditLog';

export const runtime = 'nodejs';

// GET /api/seller/uploads/metadata/:uploadId
export async function GET(request, { params }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { uploadId } = params;
  if (!uploadId) {
    return NextResponse.json({ error: 'Missing uploadId' }, { status: 400 });
  }
  const redis = getRedisClient();
  const meta = await redis.get(`upload:meta:${uploadId}`);
  if (!meta) {
    return NextResponse.json({ error: 'No metadata found' }, { status: 404 });
  }
  await auditLog('metadata_access', { userId });
  return NextResponse.json(JSON.parse(meta));
}

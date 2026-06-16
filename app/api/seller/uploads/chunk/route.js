import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getRedisClient } from '@/lib/redisClient';
import { writeAuditLog } from '@/lib/auditLog';
import { checkAnomaly } from '@/lib/anomalyDetection';
import { rateLimit } from '@/lib/rateLimit';
import { auditLog } from '@/lib/auditLog';

export const runtime = 'nodejs';

// POST /api/seller/uploads/chunk
// Body: { uploadId, chunkIndex, totalChunks, chunk (binary) }
export async function POST(request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const redis = getRedisClient();
  const formData = await request.formData();
  const uploadId = formData.get('uploadId');
  const chunkIndex = Number(formData.get('chunkIndex'));
  const totalChunks = Number(formData.get('totalChunks'));
  const chunk = formData.get('chunk');

  if (!uploadId || isNaN(chunkIndex) || isNaN(totalChunks) || !(chunk instanceof File)) {
    return NextResponse.json({ error: 'Invalid chunk upload payload' }, { status: 400 });
  }

  // Security hardening for all new endpoints
  const { allowed } = await rateLimit(userId, 'chunk-upload', { limit: 100, window: 60 });
  if (!allowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

  // Store chunk in Redis (or temp disk for large files)
  const chunkKey = `upload:chunk:${uploadId}:${chunkIndex}`;
  await redis.set(chunkKey, Buffer.from(await chunk.arrayBuffer()), { EX: 60 * 60 }); // 1hr expiry

  // Track received chunks
  const receivedKey = `upload:received:${uploadId}`;
  await redis.sadd(receivedKey, chunkIndex);
  await redis.expire(receivedKey, 60 * 60);

  // Check if all chunks received
  const receivedChunks = await redis.smembers(receivedKey);
  if (receivedChunks.length === totalChunks) {
    // Mark upload as ready for assembly
    await redis.set(`upload:ready:${uploadId}`, '1', { EX: 60 * 60 });
  }

  await writeAuditLog({ userId, ip: null, action: 'chunk-upload', details: { uploadId, chunkIndex, totalChunks } });
  await checkAnomaly(userId, 'chunk-upload', 200);

  // Audit log for all upload chunk API access
  await auditLog('upload_chunk_access', { userId });

  return NextResponse.json({ ok: true, received: receivedChunks.length, total: totalChunks });
}

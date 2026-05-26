import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getRedisClient } from '@/lib/redisClient';
import { sendNotification } from '@/lib/notifications';
import { auditLog } from '@/lib/auditLog';

export const runtime = 'nodejs';

// POST /api/seller/uploads/moderate
// Body: { uploadId, action, reason }
export async function POST(request) {
  const { userId, sessionClaims } = await auth();
  if (!userId || !sessionClaims?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { uploadId, action, reason } = await request.json();
  if (!uploadId || !action) {
    return NextResponse.json({ error: 'Missing uploadId or action' }, { status: 400 });
  }
  const redis = getRedisClient();
  await redis.lpush(`upload:moderation:${uploadId}`, JSON.stringify({ action, reason, by: userId, at: new Date().toISOString() }));
  await redis.ltrim(`upload:moderation:${uploadId}`, 0, 49);
  // After moderation action
  await sendNotification(upload.userId, {
    type: 'moderation',
    uploadId,
    message: `Your upload was ${action} by admin. Reason: ${reason}`
  });
  await auditLog('moderation_action', { adminId: user.id, uploadId, action, reason });
  // Audit log for all moderation API access (admin/global)
  await auditLog('moderation_global_access', { userId });
  // Optionally: update upload status in DB
  return NextResponse.json({ ok: true });
}

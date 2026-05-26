import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getRedisClient } from '@/lib/redisClient';
import { sendNotification } from '@/lib/notifications';
import { auditLog } from '@/lib/auditLog';

export const runtime = 'nodejs';

// GET /api/seller/uploads/storage-usage
export async function GET(req) {
  const { userId } = await requireAuth(req);
  await auditLog('storage_usage_global_access', { userId });
  const redis = getRedisClient();
  const usage = Number(await redis.get(`user:storage:${userId}`) || 0);
  const quota = Number(process.env.USER_STORAGE_QUOTA_BYTES || 1073741824); // 1GB default
  const percent = Math.round((usage / quota) * 100);
  if (storageUsage.percent > 90) {
    await sendNotification(userId, {
      type: 'quota_warning',
      uploadId: null,
      message: 'You are nearing your storage quota.'
    });
  }
  return NextResponse.json({ usage, quota, percent });
}

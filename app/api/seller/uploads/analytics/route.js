// app/api/seller/uploads/analytics/route.js
import { NextResponse } from 'next/server';
import { getUploadsForUser, getStorageUsage, getModerationStats } from '@/lib/analytics';
import { requireAuth } from '@/lib/auth';
import { auditLog } from '@/lib/auditLog';

export async function GET(req) {
  const { userId } = await requireAuth(req);
  await auditLog('analytics_access', { userId });
  // Get uploads, storage, moderation stats
  const [uploads, storage, moderation] = await Promise.all([
    getUploadsForUser(userId),
    getStorageUsage(userId),
    getModerationStats(userId)
  ]);
  // Aggregate KPIs
  const published = uploads.filter(u => u.status === 'published').length;
  const failed = uploads.filter(u => u.status === 'failed').length;
  const pending = uploads.filter(u => u.status === 'pending').length;
  return NextResponse.json({
    total: uploads.length,
    published,
    failed,
    pending,
    storage,
    moderation,
    uploads
  });
}

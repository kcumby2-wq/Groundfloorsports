import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { readTranscodeJobs } from '@/lib/transcodeQueueStore';
import { auditLog } from '@/lib/auditLog';

export const runtime = 'nodejs';

// GET /api/seller/uploads/transcode-status/:id
export async function GET(request, { params }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'Missing transcode job id' }, { status: 400 });
  }
  const jobs = await readTranscodeJobs();
  const job = jobs.find(j => j.id === id);
  if (!job) {
    return NextResponse.json({ error: 'Transcode job not found' }, { status: 404 });
  }
  // Only allow owner or admin
  if (job.sellerUserId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  // Audit log for all transcode status API access
  await auditLog('transcode_status_access', { userId });
  return NextResponse.json({
    id: job.id,
    status: job.status,
    progress: job.progress || 0,
    updatedAt: job.updatedAt,
    error: job.error || null,
  });
}

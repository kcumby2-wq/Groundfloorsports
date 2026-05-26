import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { deleteCreatorUploadForSeller, updateCreatorUploadForSeller } from '@/lib/creatorUploadStore';
import { getRoleFromClaims, hasRequiredRole } from '@/lib/roleAccess';
import logger from '@/lib/logger';
import { writeAuditLog } from '@/lib/auditLog';
import { checkAnomaly } from '@/lib/anomalyDetection';

async function assertSellerAccess() {
  const { userId, sessionClaims } = await auth();
  logger.info({ endpoint: 'seller-uploads-id', method: 'AUTH', userId }, 'Seller uploads [id] auth');
  await writeAuditLog({
    userId,
    ip: null,
    action: 'seller-uploads-id-AUTH',
    details: {},
  });
  await checkAnomaly(userId, 'seller-uploads-id', 100);
  if (!userId) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const role = getRoleFromClaims(sessionClaims);
  if (!hasRequiredRole(role, ['seller'])) {
    return { error: NextResponse.json({ error: 'Seller role required' }, { status: 403 }) };
  }

  return { userId };
}

export async function PATCH(request, { params }) {
  const access = await assertSellerAccess();
  if (access.error) {
    return access.error;
  }
  logger.info({ endpoint: 'seller-uploads-id', method: 'PATCH', userId: access.userId }, 'Seller uploads [id] PATCH');
  await writeAuditLog({
    userId: access.userId,
    ip: null,
    action: 'seller-uploads-id-PATCH',
    details: {},
  });
  await checkAnomaly(access.userId, 'seller-uploads-id', 100);

  // Simple in-memory rate limit (per user, per minute)
  if (!globalThis.__sellerUploadsPatchRateLimit) globalThis.__sellerUploadsPatchRateLimit = {};
  const userRateLimit = globalThis.__sellerUploadsPatchRateLimit;
  const MAX_REQUESTS_PER_MIN = 10;
  const now = Date.now();
  const windowStart = now - 60 * 1000;
  userRateLimit[access.userId] = (userRateLimit[access.userId] || []).filter(ts => ts > windowStart);
  if (userRateLimit[access.userId].length >= MAX_REQUESTS_PER_MIN) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }
  userRateLimit[access.userId].push(now);

  const resolvedParams = await params;
  const uploadId = resolvedParams?.uploadId;

  if (!uploadId) {
    return NextResponse.json({ error: 'uploadId is required' }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const updated = await updateCreatorUploadForSeller({
    sellerUserId: access.userId,
    uploadId,
    patch: body,
  });

  if (!updated) {
    return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
  }

  return NextResponse.json({
    upload: updated,
    message: updated.status === 'published' ? 'Upload is published.' : 'Upload updated.',
  });
}

export async function DELETE(_request, { params }) {
  const access = await assertSellerAccess();
  if (access.error) {
    return access.error;
  }
  logger.info({ endpoint: 'seller-uploads-id', method: 'DELETE', userId: access.userId }, 'Seller uploads [id] DELETE');
  await writeAuditLog({
    userId: access.userId,
    ip: null,
    action: 'seller-uploads-id-DELETE',
    details: {},
  });
  await checkAnomaly(access.userId, 'seller-uploads-id', 100);

  // Simple in-memory rate limit (per user, per minute)
  if (!globalThis.__sellerUploadsDeleteRateLimit) globalThis.__sellerUploadsDeleteRateLimit = {};
  const userRateLimit = globalThis.__sellerUploadsDeleteRateLimit;
  const MAX_REQUESTS_PER_MIN = 10;
  const now = Date.now();
  const windowStart = now - 60 * 1000;
  userRateLimit[access.userId] = (userRateLimit[access.userId] || []).filter(ts => ts > windowStart);
  if (userRateLimit[access.userId].length >= MAX_REQUESTS_PER_MIN) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }
  userRateLimit[access.userId].push(now);

  const resolvedParams = await params;
  const uploadId = resolvedParams?.uploadId;

  if (!uploadId) {
    return NextResponse.json({ error: 'uploadId is required' }, { status: 400 });
  }

  const removed = await deleteCreatorUploadForSeller({
    sellerUserId: access.userId,
    uploadId,
  });

  if (!removed) {
    return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
  }

  return NextResponse.json({
    deletedId: removed.id,
    message: 'Upload deleted.',
  });
}
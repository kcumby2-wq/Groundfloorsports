import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  appendCreatorUpload,
  buildCreatorUploadRecord,
  listCreatorUploadsForSeller,
  saveCreatorMediaFile,
} from '@/lib/creatorUploadStore';
import { getRoleFromClaims, hasRequiredRole } from '@/lib/roleAccess';
import { appendTranscodeJob, buildTranscodeJob, isTranscodeQueueEnabled } from '@/lib/transcodeQueueStore';
import logger from '@/lib/logger';
import { writeAuditLog } from '@/lib/auditLog';
import { checkAnomaly } from '@/lib/anomalyDetection';
import { sendNotification } from '@/lib/notifications';
import { requireCreatorApproval } from '@/lib/creatorApproval';
import { requestCreatorApproval } from '@/lib/creatorApproval';

export const runtime = 'nodejs';

const MAX_FILE_BYTES = 250 * 1024 * 1024;
const ALLOWED_VIDEO_MIME = new Set(['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo', 'video/mpeg']);
const ALLOWED_IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic']);
const ALLOWED_VIDEO_EXT = new Set(['.mp4', '.mov', '.webm', '.avi', '.mpeg', '.mpg']);
const ALLOWED_IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic']);

function readString(formData, key) {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

function sanitizeStatus(intent) {
  return intent === 'publish' ? 'published' : 'draft';
}

function getFileExtension(name) {
  const lower = String(name || '').toLowerCase();
  const index = lower.lastIndexOf('.');
  return index >= 0 ? lower.slice(index) : '';
}

function isAllowedByType({ mediaType, mimeType, extension }) {
  if (mediaType === 'video') {
    return ALLOWED_VIDEO_MIME.has(mimeType) || ALLOWED_VIDEO_EXT.has(extension);
  }

  if (mediaType === 'photo') {
    return ALLOWED_IMAGE_MIME.has(mimeType) || ALLOWED_IMAGE_EXT.has(extension);
  }

  return false;
}

export async function GET() {
  const { userId, sessionClaims } = await auth();
  logger.info({ endpoint: 'seller-uploads', method: 'GET', userId }, 'Seller uploads GET');
  await writeAuditLog({
    userId,
    ip: null,
    action: 'seller-uploads-GET',
    details: {},
  });
  await checkAnomaly(userId, 'seller-uploads', 100);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = getRoleFromClaims(sessionClaims);
  if (!hasRequiredRole(role, ['seller'])) {
    return NextResponse.json({ error: 'Seller role required' }, { status: 403 });
  }

  const uploads = await listCreatorUploadsForSeller(userId);
  return NextResponse.json({ uploads });
}

export async function POST(request) {
  const { userId, sessionClaims } = await auth();
  logger.info({ endpoint: 'seller-uploads', method: 'POST', userId }, 'Seller uploads POST');
  await writeAuditLog({
    userId,
    ip: null,
    action: 'seller-uploads-POST',
    details: {},
  });
  await checkAnomaly(userId, 'seller-uploads', 100);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = getRoleFromClaims(sessionClaims);
  if (!hasRequiredRole(role, ['seller'])) {
    return NextResponse.json({ error: 'Seller role required' }, { status: 403 });
  }

  // Before allowing upload or sale, check approval
  const { userId: approvedUserId } = await requireAuth(request);
  const approved = await requireCreatorApproval(approvedUserId);
  if (!approved) {
    await auditLog('upload_blocked', { userId, reason: 'not approved' });
    return NextResponse.json({ error: 'Creator not approved to sell.' }, { status: 403 });
  }

  // When a creator submits onboarding, request approval
  if (isNewCreator) {
    await requestCreatorApproval(userId);
  }

  // Simple in-memory rate limit (per user, per minute)
  if (!globalThis.__sellerUploadsRateLimit) globalThis.__sellerUploadsRateLimit = {};
  const userRateLimit = globalThis.__sellerUploadsRateLimit;
  const MAX_REQUESTS_PER_MIN = 10;
  const now = Date.now();
  const windowStart = now - 60 * 1000;
  userRateLimit[userId] = (userRateLimit[userId] || []).filter(ts => ts > windowStart);
  if (userRateLimit[userId].length >= MAX_REQUESTS_PER_MIN) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }
  userRateLimit[userId].push(now);

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid multipart form data' }, { status: 400 });
  }

  const eventName = readString(formData, 'eventName').trim();
  const team = readString(formData, 'team').trim();
  const eventDate = readString(formData, 'eventDate').trim();
  const sport = readString(formData, 'sport').trim();
  const mediaType = readString(formData, 'mediaType').trim();
  const intent = readString(formData, 'intent').trim();
  const mediaFile = formData.get('mediaFile');

  // Support chunked upload flow: if uploadId is present, skip mediaFile and use assembled file from chunked upload
  const uploadId = readString(formData, 'uploadId');
  let fileData = null;
  if (uploadId) {
    // Assemble file from Redis chunks (reuse logic from virus-scan/metadata-extract)
    const { getRedisClient } = await import('@/lib/redisClient');
    const redis = getRedisClient();
    const receivedKey = `upload:received:${uploadId}`;
    const chunkKeys = await redis.smembers(receivedKey);
    if (!chunkKeys.length) {
      return NextResponse.json({ error: 'No chunks found for uploadId' }, { status: 400 });
    }
    const sortedChunks = chunkKeys.map(Number).sort((a, b) => a - b);
    let fileBuffer = Buffer.alloc(0);
    for (const idx of sortedChunks) {
      const chunk = await redis.getBuffer(`upload:chunk:${uploadId}:${idx}`);
      if (!chunk) return NextResponse.json({ error: `Missing chunk ${idx}` }, { status: 400 });
      fileBuffer = Buffer.concat([fileBuffer, chunk]);
    }
    // Fake a File-like object for saveCreatorMediaFile
    fileData = await saveCreatorMediaFile({
      file: new File([fileBuffer], `${uploadId}.mp4`),
      sellerUserId: userId,
    });
  } else {
    if (!(mediaFile instanceof File)) {
      return NextResponse.json({ error: 'mediaFile is required' }, { status: 400 });
    }
    if (!['video', 'photo'].includes(mediaType)) {
      return NextResponse.json({ error: 'mediaType must be video or photo' }, { status: 400 });
    }
    if (mediaFile.size <= 0) {
      return NextResponse.json({ error: 'Uploaded file is empty' }, { status: 400 });
    }
    if (mediaFile.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: 'File exceeds 250MB limit for MVP upload route' }, { status: 400 });
    }
    const mimeType = String(mediaFile.type || '').toLowerCase();
    const extension = getFileExtension(mediaFile.name);
    if (!isAllowedByType({ mediaType, mimeType, extension })) {
      return NextResponse.json({
        error: `Unsupported ${mediaType} format. Accepted types are MP4/MOV/WEBM (video) and JPG/PNG/WEBP/HEIC (photo).`,
      }, { status: 400 });
    }
    fileData = await saveCreatorMediaFile({
      file: mediaFile,
      sellerUserId: userId,
    });
  }

  const status = sanitizeStatus(intent);
  const upload = buildCreatorUploadRecord({
    sellerUserId: userId,
    sellerName:
      sessionClaims?.full_name
      || sessionClaims?.email
      || readString(formData, 'sellerName')
      || 'GroundFloorSports Creator',
    formData: {
      eventName,
      team,
      eventDate,
      sport,
      mediaType,
      eventType: readString(formData, 'eventType'),
      clipTags: readString(formData, 'clipTags'),
      clipPrice: readString(formData, 'clipPrice'),
      clipCount: readString(formData, 'clipCount'),
      notes: readString(formData, 'notes'),
    },
    fileData: {
      ...fileData,
      fileName: mediaFile.name,
      fileType: mediaFile.type,
      fileSize: mediaFile.size,
    },
    status,
  });

  await appendCreatorUpload(upload);

  let transcodeJob = null;
  if (mediaType === 'video' && isTranscodeQueueEnabled()) {
    transcodeJob = await appendTranscodeJob(buildTranscodeJob({ upload }));
  }

  // After successful upload completion
  await sendNotification(userId, {
    type: 'upload_complete',
    uploadId,
    message: 'Your video upload is complete and processing.',
  });

  return NextResponse.json({
    upload,
    transcodeJob,
    message: status === 'published'
      ? 'Upload published and available in marketplace search.'
      : 'Upload saved as draft.',
  });
}
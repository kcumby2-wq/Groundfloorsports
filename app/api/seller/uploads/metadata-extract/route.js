import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getRedisClient } from '@/lib/redisClient';
import { exec } from 'child_process';
import { writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { auditLog } from '@/lib/auditLog';

export const runtime = 'nodejs';

// POST /api/seller/uploads/metadata-extract
// Body: { uploadId }
export async function POST(req) {
  const { userId } = await requireAuth(req);
  await auditLog('metadata_extract_access', { userId });
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { uploadId } = await req.json();
  if (!uploadId) {
    return NextResponse.json({ error: 'Missing uploadId' }, { status: 400 });
  }
  const redis = getRedisClient();
  // Assemble file from chunks (reuse logic from virus-scan)
  const receivedKey = `upload:received:${uploadId}`;
  const chunkKeys = await redis.smembers(receivedKey);
  if (!chunkKeys.length) {
    return NextResponse.json({ error: 'No chunks found' }, { status: 404 });
  }
  const sortedChunks = chunkKeys.map(Number).sort((a, b) => a - b);
  let fileBuffer = Buffer.alloc(0);
  for (const idx of sortedChunks) {
    const chunk = await redis.getBuffer(`upload:chunk:${uploadId}:${idx}`);
    if (!chunk) return NextResponse.json({ error: `Missing chunk ${idx}` }, { status: 400 });
    fileBuffer = Buffer.concat([fileBuffer, chunk]);
  }
  // Write to temp file
  const tempPath = path.join('/tmp', `${uploadId}.upload`);
  await writeFile(tempPath, fileBuffer);
  // Extract metadata with ffprobe
  const ffprobeCmd = `ffprobe -v quiet -print_format json -show_format -show_streams ${tempPath}`;
  const metaResult = await new Promise((resolve) => {
    exec(ffprobeCmd, (err, stdout, stderr) => {
      resolve(stdout || stderr || err?.message || 'ffprobe failed');
    });
  });
  await unlink(tempPath);
  let meta = {};
  try {
    meta = JSON.parse(metaResult);
  } catch {
    return NextResponse.json({ error: 'Metadata not parsed', metaResult }, { status: 500 });
  }
  // Store metadata in Redis
  await redis.set(`upload:meta:${uploadId}`, JSON.stringify(meta), { EX: 60 * 60 * 24 });
  return NextResponse.json({ ok: true, meta });
}

// Helper function to require authentication
async function requireAuth(req) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return userId;
}

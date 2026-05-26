import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getRedisClient } from '@/lib/redisClient';
import { writeAuditLog } from '@/lib/auditLog';
import { checkAnomaly } from '@/lib/anomalyDetection';
import { exec } from 'child_process';
import { writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { auditLog } from '@/lib/auditLog';

export const runtime = 'nodejs';

// POST /api/seller/uploads/virus-scan
// Body: { uploadId }
export async function POST(request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await auditLog('virus_scan_access', { userId });
  const { uploadId } = await request.json();
  if (!uploadId) {
    return NextResponse.json({ error: 'Missing uploadId' }, { status: 400 });
  }
  const redis = getRedisClient();
  // Assemble file from chunks
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
  // Scan with ClamAV (must be installed on server)
  const scanResult = await new Promise((resolve) => {
    exec(`clamscan ${tempPath}`, (err, stdout) => {
      resolve(stdout || err?.message || 'Scan failed');
    });
  });
  await unlink(tempPath);
  const clean = scanResult.includes('OK');
  await writeAuditLog({ userId, ip: null, action: 'virus-scan', details: { uploadId, clean, scanResult } });
  await checkAnomaly(userId, 'virus-scan', 50);
  return NextResponse.json({ ok: true, clean, scanResult });
}

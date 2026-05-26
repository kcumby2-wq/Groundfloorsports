import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const transcodeJobsFilePath = path.join(process.cwd(), 'data', 'transcode_jobs.json');

async function ensureJobsFile() {
  await mkdir(path.dirname(transcodeJobsFilePath), { recursive: true });

  try {
    await readFile(transcodeJobsFilePath, 'utf8');
  } catch {
    await writeFile(transcodeJobsFilePath, '[]\n', 'utf8');
  }
}

export async function readTranscodeJobs() {
  await ensureJobsFile();
  const raw = await readFile(transcodeJobsFilePath, 'utf8');

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function appendTranscodeJob(job) {
  const jobs = await readTranscodeJobs();
  const next = [job, ...jobs];
  await writeFile(transcodeJobsFilePath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  return job;
}

export function isTranscodeQueueEnabled() {
  return String(process.env.ENABLE_TRANSCODE_QUEUE || 'false').toLowerCase() === 'true';
}

export function buildTranscodeJob({ upload }) {
  return {
    id: crypto.randomUUID(),
    uploadId: upload.id,
    sellerUserId: upload.sellerUserId,
    gameSlug: upload.gameSlug,
    sourceUrl: upload.fileUrl,
    storageProvider: upload.storageProvider || 'local',
    storagePath: upload.storagePath || null,
    status: 'queued',
    priority: 'normal',
    attempts: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
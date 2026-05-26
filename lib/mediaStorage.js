import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

const uploadsMediaRootPath = path.join(process.cwd(), 'public', 'uploads', 'creator');

function getStorageProvider() {
  const provider = String(process.env.MEDIA_STORAGE_PROVIDER || 'local').toLowerCase();
  return provider === 'supabase' ? 'supabase' : 'local';
}

function getSafeExtension(fileName) {
  const ext = path.extname(fileName || '').slice(0, 10).toLowerCase();
  return /^[.][a-z0-9]+$/.test(ext) ? ext : '';
}

function getSupabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'creator-uploads';
  const isPublic = String(process.env.SUPABASE_STORAGE_PUBLIC || 'true').toLowerCase() !== 'false';

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for supabase media storage.');
  }

  return {
    supabaseUrl,
    serviceRoleKey,
    bucket,
    isPublic,
  };
}

async function saveToLocal({ file, sellerUserId }) {
  await mkdir(uploadsMediaRootPath, { recursive: true });

  const now = new Date();
  const yearMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const targetDir = path.join(uploadsMediaRootPath, yearMonth);
  await mkdir(targetDir, { recursive: true });

  const safeExt = getSafeExtension(file.name || '');
  const uniqueName = `${Date.now()}-${String(sellerUserId).slice(0, 8)}-${crypto.randomUUID().slice(0, 8)}${safeExt}`;
  const destinationPath = path.join(targetDir, uniqueName);

  const bytes = await file.arrayBuffer();
  await writeFile(destinationPath, Buffer.from(bytes));

  return {
    storageProvider: 'local',
    storagePath: `${yearMonth}/${uniqueName}`,
    storedPath: destinationPath,
    fileUrl: `/uploads/creator/${yearMonth}/${uniqueName}`,
  };
}

async function createSupabaseSignedUrl({ bucket, objectPath, supabaseUrl, serviceRoleKey }) {
  const response = await fetch(`${supabaseUrl}/storage/v1/object/sign/${bucket}/${objectPath}`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ expiresIn: 60 * 60 * 24 * 7 }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase sign URL failed (${response.status}): ${message}`);
  }

  const data = await response.json();
  return `${supabaseUrl}/storage/v1${data.signedURL}`;
}

async function saveToSupabase({ file, sellerUserId }) {
  const { supabaseUrl, serviceRoleKey, bucket, isPublic } = getSupabaseConfig();
  const now = new Date();
  const yearMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const safeExt = getSafeExtension(file.name || '');
  const uniqueName = `${Date.now()}-${String(sellerUserId).slice(0, 8)}-${crypto.randomUUID().slice(0, 8)}${safeExt}`;
  const objectPath = `${yearMonth}/${uniqueName}`;

  const bytes = Buffer.from(await file.arrayBuffer());

  const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${objectPath}`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': file.type || 'application/octet-stream',
      'x-upsert': 'false',
    },
    body: bytes,
  });

  if (!uploadResponse.ok) {
    const message = await uploadResponse.text();
    throw new Error(`Supabase upload failed (${uploadResponse.status}): ${message}`);
  }

  const fileUrl = isPublic
    ? `${supabaseUrl}/storage/v1/object/public/${bucket}/${objectPath}`
    : await createSupabaseSignedUrl({ bucket, objectPath, supabaseUrl, serviceRoleKey });

  return {
    storageProvider: 'supabase',
    storagePath: objectPath,
    storedPath: null,
    fileUrl,
  };
}

export async function saveMediaFile({ file, sellerUserId }) {
  const provider = getStorageProvider();
  if (provider === 'supabase') {
    return saveToSupabase({ file, sellerUserId });
  }

  return saveToLocal({ file, sellerUserId });
}

async function deleteFromSupabase({ storagePath }) {
  const { supabaseUrl, serviceRoleKey, bucket } = getSupabaseConfig();

  const response = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${storagePath}`, {
    method: 'DELETE',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });

  if (!response.ok && response.status !== 404) {
    const message = await response.text();
    throw new Error(`Supabase delete failed (${response.status}): ${message}`);
  }
}

async function deleteFromLocal({ storedPath, storagePath }) {
  const absolute = storedPath || (storagePath ? path.join(uploadsMediaRootPath, storagePath) : null);
  if (!absolute) {
    return;
  }

  try {
    await unlink(absolute);
  } catch {
    // Ignore file-not-found and local cleanup errors in MVP mode.
  }
}

export async function deleteMediaFile({ storageProvider, storagePath, storedPath }) {
  const provider = storageProvider || 'local';
  if (provider === 'supabase') {
    await deleteFromSupabase({ storagePath });
    return;
  }

  await deleteFromLocal({ storedPath, storagePath });
}
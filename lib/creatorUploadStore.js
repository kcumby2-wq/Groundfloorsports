import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { deleteMediaFile, saveMediaFile } from '@/lib/mediaStorage';

const uploadsFilePath = path.join(process.cwd(), 'data', 'creator_uploads.json');

function coerceNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizePrice(value, fallback) {
  const parsed = coerceNumber(value, fallback);
  const nonNegative = Math.max(0, parsed);
  return Math.round(nonNegative * 100) / 100;
}

function coerceIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  return value;
}

function formatDateLabel(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[(month || 1) - 1]} ${day || 1}, ${year || 2026}`;
}

function normalizeTagList(value, fallback = []) {
  const source = Array.isArray(value)
    ? value
    : String(value || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

  const fallbackList = Array.isArray(fallback) ? fallback : [];
  const merged = [...source, ...fallbackList]
    .map((item) => String(item || '').trim())
    .filter(Boolean);

  return [...new Set(merged)].slice(0, 12);
}

function toSlugFragment(input, fallback = 'game') {
  const normalized = String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || fallback;
}

function getDateBucket(isoDate) {
  const target = new Date(isoDate);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= 30 ? 'last30' : 'season';
}

function getCreatorHandle(name, sellerUserId) {
  const fromName = toSlugFragment(name, 'creator');
  const safeId = String(sellerUserId || 'user').slice(0, 8);
  return `@${fromName}${safeId}`;
}

function buildPreviewSvg(title, team) {
  const safeTitle = String(title || 'Clip Preview').replace(/[<>&]/g, '');
  const safeTeam = String(team || 'GroundFloorSports').replace(/[<>&]/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#142848"/><stop offset="100%" stop-color="#090f1d"/></linearGradient></defs><rect width="1280" height="720" fill="url(#bg)"/><circle cx="210" cy="160" r="180" fill="#ec4899" opacity="0.2"/><circle cx="1090" cy="560" r="220" fill="#ec4899" opacity="0.15"/><rect x="32" y="28" width="1216" height="664" rx="24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"/><text x="64" y="92" fill="white" font-size="46" font-family="Arial" font-weight="700">VIDEO PREVIEW</text><text x="64" y="146" fill="#ec4899" font-size="28" font-family="Arial">${safeTeam}</text><text x="64" y="640" fill="white" font-size="38" font-family="Arial" font-weight="700">${safeTitle}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

async function ensureUploadsFile() {
  await mkdir(path.dirname(uploadsFilePath), { recursive: true });

  try {
    await readFile(uploadsFilePath, 'utf8');
  } catch {
    await writeFile(uploadsFilePath, '[]\n', 'utf8');
  }
}

export async function readCreatorUploads() {
  await ensureUploadsFile();
  const raw = await readFile(uploadsFilePath, 'utf8');

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function appendCreatorUpload(upload) {
  const existing = await readCreatorUploads();
  const next = [upload, ...existing];
  await writeFile(uploadsFilePath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  return upload;
}

export async function listCreatorUploadsForSeller(sellerUserId) {
  const uploads = await readCreatorUploads();
  return uploads.filter((upload) => upload.sellerUserId === sellerUserId);
}

async function writeCreatorUploads(next) {
  await writeFile(uploadsFilePath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
}

export async function saveCreatorMediaFile({ file, sellerUserId }) {
  return saveMediaFile({ file, sellerUserId });
}

export function buildCreatorUploadRecord({ sellerUserId, sellerName, formData, fileData, status }) {
  const eventDate = coerceIsoDate(formData.eventDate) || new Date().toISOString().slice(0, 10);
  const eventName = String(formData.eventName || '').trim();
  const team = String(formData.team || '').trim();
  const sport = String(formData.sport || 'Football').trim();
  const eventType = String(formData.eventType || 'Highlight').trim();
  const clipPrice = normalizePrice(formData.clipPrice, 10);
  const clipCount = Math.max(1, Math.round(coerceNumber(formData.clipCount, 1)));
  const tags = normalizeTagList(formData.clipTags, [eventType, sport, 'Highlight']);

  const id = crypto.randomUUID();
  const dateSlug = eventDate;
  const gameSlug = `${dateSlug}-${toSlugFragment(eventName, 'creator-upload')}-${id.slice(0, 6)}`;
  const clipId = `${gameSlug}-clip-1`;
  const mediaType = String(formData.mediaType || (String(fileData.fileType || '').startsWith('image/') ? 'photo' : 'video'));
  const pipelineStatus = status === 'published' ? 'live' : 'queued';

  return {
    id,
    sellerUserId,
    sellerName: String(sellerName || 'GroundFloorSports Creator').trim(),
    gameSlug,
    clipId,
    eventName,
    team,
    sport,
    eventType,
    tags,
    clipPrice,
    clipCount,
    eventDate,
    mediaType,
    pipelineStatus,
    notes: String(formData.notes || '').trim(),
    status,
    fileUrl: fileData.fileUrl,
    storageProvider: fileData.storageProvider || 'local',
    storagePath: fileData.storagePath || null,
    storedPath: fileData.storedPath || null,
    fileName: String(fileData.fileName || '').trim(),
    fileType: String(fileData.fileType || '').trim(),
    fileSize: coerceNumber(fileData.fileSize, 0),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: status === 'published' ? new Date().toISOString() : null,
  };
}

function patchUploadRecord(existing, patch) {
  const next = { ...existing };

  if (typeof patch.eventName === 'string' && patch.eventName.trim()) {
    next.eventName = patch.eventName.trim();
  }
  if (typeof patch.team === 'string' && patch.team.trim()) {
    next.team = patch.team.trim();
  }
  if (typeof patch.sport === 'string' && patch.sport.trim()) {
    next.sport = patch.sport.trim();
  }
  if (typeof patch.eventType === 'string' && patch.eventType.trim()) {
    next.eventType = patch.eventType.trim();
  }
  if (typeof patch.eventDate === 'string' && coerceIsoDate(patch.eventDate)) {
    next.eventDate = patch.eventDate;
  }
  if (typeof patch.notes === 'string') {
    next.notes = patch.notes.trim();
  }

  if (patch.clipTags !== undefined) {
    next.tags = normalizeTagList(patch.clipTags, [next.eventType, next.sport, 'Highlight']);
  }

  if (patch.clipPrice !== undefined) {
    next.clipPrice = normalizePrice(patch.clipPrice, existing.clipPrice);
  }
  if (patch.clipCount !== undefined) {
    next.clipCount = Math.max(1, Math.round(coerceNumber(patch.clipCount, existing.clipCount)));
  }

  if (patch.status === 'published' || patch.status === 'draft') {
    next.status = patch.status;
    next.publishedAt = patch.status === 'published'
      ? (existing.publishedAt || new Date().toISOString())
      : null;
  }

  if (patch.pipelineStatus === 'queued' || patch.pipelineStatus === 'processing' || patch.pipelineStatus === 'live') {
    next.pipelineStatus = patch.pipelineStatus;

    if (patch.pipelineStatus === 'live') {
      next.status = 'published';
      next.publishedAt = existing.publishedAt || new Date().toISOString();
    } else if (next.status === 'published') {
      next.status = 'draft';
      next.publishedAt = null;
    }
  }

  next.updatedAt = new Date().toISOString();
  return next;
}

export async function updateCreatorUploadForSeller({ sellerUserId, uploadId, patch }) {
  const uploads = await readCreatorUploads();
  const index = uploads.findIndex((upload) => upload.id === uploadId && upload.sellerUserId === sellerUserId);

  if (index < 0) {
    return null;
  }

  const updated = patchUploadRecord(uploads[index], patch || {});
  uploads[index] = updated;
  await writeCreatorUploads(uploads);
  return updated;
}

export async function deleteCreatorUploadForSeller({ sellerUserId, uploadId }) {
  const uploads = await readCreatorUploads();
  const index = uploads.findIndex((upload) => upload.id === uploadId && upload.sellerUserId === sellerUserId);

  if (index < 0) {
    return null;
  }

  const removed = uploads[index];
  const next = uploads.filter((upload) => upload.id !== uploadId);
  await writeCreatorUploads(next);

  await deleteMediaFile({
    storageProvider: removed.storageProvider,
    storagePath: removed.storagePath,
    storedPath: removed.storedPath,
  });

  return removed;
}

export async function getPublishedCreatorGames() {
  const uploads = await readCreatorUploads();

  return uploads
    .filter((upload) => upload.status === 'published' || upload.pipelineStatus === 'live')
    .map((upload) => ({
      slug: upload.gameSlug,
      name: upload.eventName,
      meta: `${formatDateLabel(upload.eventDate)} · Creator Upload · ${upload.team}`,
      seller: upload.sellerName,
      team: upload.team,
      sport: upload.sport,
      eventType: upload.eventType,
      mediaType: upload.mediaType,
      dateBucket: getDateBucket(upload.eventDate),
      dateValue: upload.eventDate,
      clips: upload.clipCount,
      tags: [...normalizeTagList(upload.tags, [upload.eventType, upload.sport, 'Highlight']), 'Live', upload.sellerName],
    }));
}

export async function getCreatorGameCommerceBySlug(slug) {
  const uploads = await readCreatorUploads();
  const upload = uploads.find((item) => item.gameSlug === slug && (item.status === 'published' || item.pipelineStatus === 'live'));

  if (!upload) {
    return null;
  }

  const playerName = `${upload.team} Featured Player`;
  const creator = getCreatorHandle(upload.sellerName, upload.sellerUserId);
  const clipTitle = `${upload.team} - ${upload.eventType}`;
  const previewImage = upload.mediaType === 'photo' ? upload.fileUrl : buildPreviewSvg(clipTitle, upload.team);
  const previewVideo = upload.mediaType === 'video' ? upload.fileUrl : null;

  const clip = {
    id: upload.clipId,
    clipCode: `UPL-${upload.id.slice(0, 8).toUpperCase()}`,
    playerId: 'p1',
    playerName,
    jersey: 1,
    team: upload.team,
    title: clipTitle,
    eventType: upload.eventType,
    tags: normalizeTagList(upload.tags, [upload.eventType, upload.sport, 'Highlight']),
    price: upload.clipPrice,
    creator,
    mediaType: upload.mediaType,
    previewImage,
    previewVideo,
    productTier: 'Standard Clip',
    capturedDate: formatDateLabel(upload.eventDate),
    description: upload.notes || 'Creator uploaded highlight clip.',
    delivery: 'Instant download',
    purchaseOptions: {
      standardClip: {
        label: 'Standard Clip',
        price: upload.clipPrice,
        bullets: ['Creator uploaded highlight clip', 'Instant download'],
      },
      reel: {
        label: 'Buy the Reel',
        price: upload.clipPrice + 30,
        editingFee: 30,
        bullets: [
          'Raw highlight clip (instant)',
          'Pro-edited recruiting reel with music',
          'Ready for social + recruiting shares',
        ],
      },
    },
  };

  return {
    slug: upload.gameSlug,
    name: upload.eventName,
    sport: upload.sport,
    dateLabel: formatDateLabel(upload.eventDate),
    seller: upload.sellerName,
    clipsCount: upload.clipCount,
    photosCount: upload.mediaType === 'photo' ? 1 : 0,
    playersCount: 1,
    fullGameOffer: {
      title: `${upload.eventName} - Full Access`,
      price: Math.max(39, upload.clipPrice + 20),
    },
    players: [
      {
        id: 'p1',
        jersey: 1,
        name: playerName,
        team: upload.team,
        clipCount: 1,
      },
    ],
    clips: [clip],
    allClipTags: ['All clips', ...normalizeTagList(upload.tags, [upload.eventType, upload.sport, 'Highlight'])],
  };
}

export async function getCreatorClipPurchaseById(slug, clipId) {
  const gamePayload = await getCreatorGameCommerceBySlug(slug);

  if (!gamePayload) {
    return null;
  }

  const selectedClip = gamePayload.clips.find((clip) => clip.id === clipId);

  if (!selectedClip) {
    return null;
  }

  return {
    game: {
      slug: gamePayload.slug,
      name: gamePayload.name,
      sport: gamePayload.sport,
      dateLabel: gamePayload.dateLabel,
      seller: gamePayload.seller,
    },
    clip: {
      id: selectedClip.id,
      clipCode: selectedClip.clipCode,
      title: selectedClip.title,
      clipType: selectedClip.eventType,
      jersey: `#${selectedClip.jersey}`,
      playersMention: `${selectedClip.playerName} #${selectedClip.jersey}`,
      capturedDate: selectedClip.capturedDate,
      creator: selectedClip.creator,
      sport: gamePayload.sport,
      mediaType: selectedClip.mediaType,
      previewImage: selectedClip.previewImage,
      previewVideo: selectedClip.previewVideo,
      productTier: selectedClip.productTier,
      price: selectedClip.price,
      description: selectedClip.description,
      delivery: selectedClip.delivery,
    },
    purchaseOptions: selectedClip.purchaseOptions,
    relatedContent: [],
    recruitingIntel: {
      score: 85,
      gameMoment: `Uploaded from ${gamePayload.name}`,
      coachFit: 'Useful for direct recruiting review and social highlights.',
      confidence: 'Uploaded and published by verified creator account.',
      projectedWatchTime: '35 sec avg watch intent',
      tags: [selectedClip.eventType, 'Creator Upload', 'GFS'],
    },
    coachEvidenceTimeline: [
      {
        id: `${selectedClip.id}-timeline-1`,
        timecode: '00:04',
        phase: 'Setup',
        coachNote: 'Athlete positioning and context established.',
        grade: 'A-',
      },
      {
        id: `${selectedClip.id}-timeline-2`,
        timecode: '00:09',
        phase: 'Execution',
        coachNote: 'Core highlight moment captured clearly.',
        grade: 'A',
      },
    ],
    note: 'Instant clip download after purchase. Reel orders delivered within 3-5 business days.',
  };
}
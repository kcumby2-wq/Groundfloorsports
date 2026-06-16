// lib/analytics.js
import { listCreatorUploadsForSeller } from './creatorUploadStore';

export async function getUploadsForUser(userId) {
  return listCreatorUploadsForSeller(userId);
}

export async function getStorageUsage(userId) {
  // TODO: wire up real storage accounting once usage tracking exists
  return { userId, bytesUsed: 0, bytesLimit: null };
}

export async function getModerationStats(userId) {
  // TODO: wire up real moderation stats once moderation tracking exists
  return { userId, flagged: 0, reviewed: 0 };
}

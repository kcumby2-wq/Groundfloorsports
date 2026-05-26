// scripts/cleanupOrphanedUploads.js
import { getRedisClient } from '../lib/redisClient.js';

async function cleanupOrphans() {
  const redis = getRedisClient();
  // Find all upload:ready:* keys
  const readyKeys = await redis.keys('upload:ready:*');
  let cleaned = 0;
  for (const key of readyKeys) {
    const uploadId = key.split(':').pop();
    // If no upload:received: key exists, it's orphaned
    const receivedKey = `upload:received:${uploadId}`;
    const exists = await redis.exists(receivedKey);
    if (!exists) {
      await redis.del(key);
      cleaned++;
    }
  }
  console.log(`Cleaned up ${cleaned} orphaned ready uploads.`);
  process.exit(0);
}
cleanupOrphans();

// scripts/cleanupIncompleteUploads.js
import { getRedisClient } from '../lib/redisClient.js';

async function cleanup() {
  const redis = getRedisClient();
  // Find all upload:received:* keys
  const keys = await redis.keys('upload:received:*');
  let cleaned = 0;
  for (const key of keys) {
    const ttl = await redis.ttl(key);
    if (ttl < 0) {
      // Expired or orphaned, delete all related chunks
      const uploadId = key.split(':').pop();
      const chunkKeys = await redis.keys(`upload:chunk:${uploadId}:*`);
      for (const ckey of chunkKeys) await redis.del(ckey);
      await redis.del(key);
      await redis.del(`upload:ready:${uploadId}`);
      cleaned++;
    }
  }
  console.log(`Cleaned up ${cleaned} incomplete uploads.`);
  process.exit(0);
}
cleanup();

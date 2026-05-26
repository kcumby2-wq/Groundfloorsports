// scripts/cleanupExpiredChunks.js
import { getRedisClient } from '../lib/redisClient.js';

async function cleanupChunks() {
  const redis = getRedisClient();
  // Find all chunk keys
  const chunkKeys = await redis.keys('upload:chunk:*');
  let cleaned = 0;
  for (const key of chunkKeys) {
    const ttl = await redis.ttl(key);
    if (ttl < 0) {
      await redis.del(key);
      cleaned++;
    }
  }
  console.log(`Cleaned up ${cleaned} expired upload chunks.`);
  process.exit(0);
}
cleanupChunks();

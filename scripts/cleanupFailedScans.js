// scripts/cleanupFailedScans.js
import { getRedisClient } from '../lib/redisClient.js';

async function cleanupFailedScans() {
  const redis = getRedisClient();
  // Find all scan:failed:* keys
  const keys = await redis.keys('scan:failed:*');
  let cleaned = 0;
  for (const key of keys) {
    await redis.del(key);
    cleaned++;
  }
  console.log(`Cleaned up ${cleaned} failed scan records.`);
  process.exit(0);
}
cleanupFailedScans();

// lib/anomalyDetection.js
import { getRedisClient } from './redisClient.js';
import logger from './logger.js';

/**
 * Track and flag usage spikes for a user or IP.
 * @param {string} key - e.g. 'user:123' or 'ip:1.2.3.4'
 * @param {string} endpoint - e.g. 'openai'
 * @param {number} threshold - e.g. 50 (requests per hour)
 * @returns {Promise<boolean>} - true if anomaly detected
 */
export async function checkAnomaly(key, endpoint, threshold = 50) {
  const redis = getRedisClient();
  const hourKey = `anomaly:${endpoint}:${key}:${new Date().getUTCHours()}`;
  const count = await redis.incr(hourKey);
  if (count === 1) {
    await redis.expire(hourKey, 3600);
  }
  if (count > threshold) {
    logger.warn({ key, endpoint, count }, 'Anomaly detected');
    // Optionally: send alert (email, webhook, etc.)
    return true;
  }
  return false;
}

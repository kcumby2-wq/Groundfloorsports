// lib/rateLimit.js
import { getRedisClient } from './redisClient.js';

/**
 * Distributed per-user rate limiter using Redis.
 * @param {string} userId - Unique user identifier
 * @param {string} prefix - Endpoint/service prefix (e.g., 'openai')
 * @param {object} opts - { limit: number, window: number (seconds) }
 * @returns {Promise<{ allowed: boolean, remaining: number, reset: number, limit: number }>}
 */
export async function rateLimit(userId, prefix, opts = {}) {
  const redis = getRedisClient();
  const limit = opts.limit || parseInt(process.env.RATE_LIMIT_PER_MIN || '10', 10);
  const windowSec = opts.window || parseInt(process.env.RATE_LIMIT_WINDOW_SEC || '60', 10);
  const key = `rate:${prefix}:${userId}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, windowSec);
  }
  const ttl = await redis.ttl(key);
  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    reset: Math.max(0, ttl),
    limit,
  };
}

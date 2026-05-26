// lib/ipRateLimit.js
import { getRedisClient } from './redisClient.js';

/**
 * Distributed per-IP rate limiter using Redis.
 * @param {string} ip - Client IP address
 * @param {string} prefix - Endpoint/service prefix (e.g., 'openai')
 * @param {object} opts - { limit: number, window: number (seconds) }
 * @returns {Promise<{ allowed: boolean, remaining: number, reset: number, limit: number }>}
 */
export async function ipRateLimit(ip, prefix, opts = {}) {
  const redis = getRedisClient();
  const limit = opts.limit || parseInt(process.env.IP_RATE_LIMIT_PER_MIN || '30', 10);
  const windowSec = opts.window || parseInt(process.env.IP_RATE_LIMIT_WINDOW_SEC || '60', 10);
  const key = `iprate:${prefix}:${ip}`;
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

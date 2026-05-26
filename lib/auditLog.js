// lib/auditLog.js
import { getRedisClient } from './redisClient.js';

/**
 * Write an audit log entry to Redis (or extend to DB).
 * @param {object} entry - { userId, ip, action, details, timestamp }
 */
export async function writeAuditLog(entry) {
  const redis = getRedisClient();
  const log = {
    ...entry,
    timestamp: entry.timestamp || new Date().toISOString(),
  };
  await redis.lpush('audit:logs', JSON.stringify(log));
  await redis.ltrim('audit:logs', 0, 9999); // Keep last 10k entries
}

/**
 * Log an approval or rejection action.
 * @param {string} action - 'approved' or 'rejected'
 * @param {object} details - Additional details about the action
 */
export async function auditLog(action, details) {
  // TODO: Write to persistent audit log (DB, file, or external service)
  console.log(`[AUDIT] ${action}:`, details);
  // Optionally send to external log service
  // await sendToExternalLogService({ action, details, timestamp: new Date().toISOString() });
}

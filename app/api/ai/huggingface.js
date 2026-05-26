// /api/ai/huggingface
// POST: { input: string }

import { getAuth } from '@clerk/nextjs/server';
import { rateLimit } from '@/lib/rateLimit';
import { ipRateLimit } from '@/lib/ipRateLimit';
import logger from '@/lib/logger';
import { writeAuditLog } from '@/lib/auditLog';
import { checkAnomaly } from '@/lib/anomalyDetection';

const MAX_REQUESTS_PER_MIN = 10;
const WINDOW_SECONDS = 60;

  if (req.method !== 'POST') {
    logger.warn({ method: req.method, url: req.url }, 'Method not allowed');
    return res.status(405).end();
  }

  // Clerk authentication
  const auth = getAuth(req);
  if (!auth.userId) {
    logger.warn({ ip, url: req.url }, 'Unauthenticated access attempt');
    await writeAuditLog({
      userId: null,
      ip,
      action: 'unauthenticated_access',
      details: { url: req.url },
    });
    return res.status(401).json({ error: 'Authentication required' });
  }

  // IP-based rate limiting (secondary layer)
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  const ipRl = await ipRateLimit(ip, 'huggingface', { limit: 30, window: 60 });
  res.setHeader('X-IpRateLimit-Limit', ipRl.limit);
  res.setHeader('X-IpRateLimit-Remaining', ipRl.remaining);
  res.setHeader('X-IpRateLimit-Reset', ipRl.reset);
  if (!ipRl.allowed) {
    logger.warn({ ip, userId: auth.userId, url: req.url }, 'IP rate limit exceeded');
    await writeAuditLog({
      userId: auth.userId,
      ip,
      action: 'ip_rate_limit_exceeded',
      details: { url: req.url },
    });
    return res.status(429).json({ error: 'IP rate limit exceeded' });
  }

  // Distributed rate limiting with Redis (centralized helper)
  const rl = await rateLimit(auth.userId, 'huggingface', { limit: MAX_REQUESTS_PER_MIN, window: WINDOW_SECONDS });
  res.setHeader('X-RateLimit-Limit', rl.limit);
  res.setHeader('X-RateLimit-Remaining', rl.remaining);
  res.setHeader('X-RateLimit-Reset', rl.reset);
  if (!rl.allowed) {
    logger.warn({ ip, userId: auth.userId, url: req.url }, 'User rate limit exceeded');
    await writeAuditLog({
      userId: auth.userId,
      ip,
      action: 'user_rate_limit_exceeded',
      details: { url: req.url },
    });
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  // Input validation
  const { input } = req.body;
  if (typeof input !== 'string' || input.length < 2) {
    logger.warn({ userId: auth.userId, ip, input }, 'Invalid input');
    await writeAuditLog({
      userId: auth.userId,
      ip,
      action: 'invalid_input',
      details: { input },
    });
    return res.status(400).json({ error: 'Invalid input' });
  }

  // Anomaly detection (usage spike)
  const anomaly = await checkAnomaly(`user:${auth.userId}`, 'huggingface', 50);
  if (anomaly) {
    logger.warn({ userId: auth.userId, ip }, 'Anomaly detected for user');
    await writeAuditLog({
      userId: auth.userId,
      ip,
      action: 'anomaly_detected',
      details: { endpoint: 'huggingface' },
    });
    // Optionally: return error or degrade gracefully
  }

  // Hugging Face call
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  logger.info({ userId: auth.userId, ip, input }, 'Calling Hugging Face API');
  const response = await fetch('https://api-inference.huggingface.co/models/gpt2', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: input }),
  });
  const data = await response.json();
  logger.info({ userId: auth.userId, ip, response: data }, 'Hugging Face API response');
  await writeAuditLog({
    userId: auth.userId,
    ip,
    action: 'huggingface_call',
    details: { input, response: data },
  });
  res.status(200).json(data);
}

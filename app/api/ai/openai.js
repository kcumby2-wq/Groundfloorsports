// /api/ai/openai
// POST: { prompt: string }



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
  const ipRl = await ipRateLimit(ip, 'openai', { limit: 30, window: 60 });
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
  const rl = await rateLimit(auth.userId, 'openai', { limit: MAX_REQUESTS_PER_MIN, window: WINDOW_SECONDS });
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
  const { prompt } = req.body;

  if (typeof prompt !== 'string' || prompt.length < 5 || prompt.length > 1000) {
    logger.warn({ userId: auth.userId, ip, prompt }, 'Invalid prompt');
    await writeAuditLog({
      userId: auth.userId,
      ip,
      action: 'invalid_prompt',
      details: { prompt },
    });
    return res.status(400).json({ error: 'Invalid prompt' });
  }

  // Anomaly detection (usage spike)
  const anomaly = await checkAnomaly(`user:${auth.userId}`, 'openai', 50);
  if (anomaly) {
    logger.warn({ userId: auth.userId, ip }, 'Anomaly detected for user');
    await writeAuditLog({
      userId: auth.userId,
      ip,
      action: 'anomaly_detected',
      details: { endpoint: 'openai' },
    });
    // Optionally: return error or degrade gracefully
  }

  // OpenAI call
  const apiKey = process.env.OPENAI_API_KEY;
  logger.info({ userId: auth.userId, ip, prompt }, 'Calling OpenAI API');
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await response.json();
  logger.info({ userId: auth.userId, ip, response: data }, 'OpenAI API response');
  await writeAuditLog({
    userId: auth.userId,
    ip,
    action: 'openai_call',
    details: { prompt, response: data },
  });
  res.status(200).json(data);
}

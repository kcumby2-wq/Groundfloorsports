// lib/redisClient.js
import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

let client;

export function getRedisClient() {
  if (!client) {
    client = createClient({ url: redisUrl });
    client.on('error', (err) => console.error('Redis Client Error', err));
    client.connect().catch((err) => console.error('Redis connect error', err));
  }
  return client;
}

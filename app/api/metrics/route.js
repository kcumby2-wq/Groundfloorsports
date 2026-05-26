// app/api/metrics/route.js
import { NextResponse } from 'next/server';
import { getMetrics } from '@/lib/metrics';
import logger from '@/lib/logger';
import { writeAuditLog } from '@/lib/auditLog';
import { checkAnomaly } from '@/lib/anomalyDetection';

export async function GET() {
  logger.info({ endpoint: 'metrics', method: 'GET' }, 'Metrics GET');
  await writeAuditLog({
    userId: null,
    ip: null,
    action: 'metrics-GET',
    details: {},
  });
  await checkAnomaly('system', 'metrics', 1000);
  const metrics = getMetrics();
  return new NextResponse(metrics, {
    headers: { 'Content-Type': 'text/plain' },
  });
}

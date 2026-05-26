import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import logger from '@/lib/logger';
import { writeAuditLog } from '@/lib/auditLog';
import { checkAnomaly } from '@/lib/anomalyDetection';

export const runtime = 'nodejs';

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY || '';
  if (!secretKey) return null;
  return new Stripe(secretKey, { apiVersion: '2025-04-30.basil' });
}

function resolveBaseUrl(request) {
  const explicit = (process.env.NEXT_PUBLIC_APP_URL || '').trim();
  if (explicit) return explicit.replace(/\/$/, '');

  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const proto = request.headers.get('x-forwarded-proto') || 'http';
  if (host) return `${proto}://${host}`;

  return 'http://localhost:3000';
}

function normalizeUrlCandidate(raw, baseUrl) {
  const fallback = `${baseUrl}/admin.html#settings`;
  const value = String(raw || '').trim();
  if (!value) return fallback;

  if (/^https?:\/\//i.test(value)) {
    try {
      return new URL(value).toString();
    } catch {
      return fallback;
    }
  }

  if (value.startsWith('/')) {
    return `${baseUrl}${value}`;
  }

  return fallback;
}

function parseBody(input) {
  return {
    accountId: typeof input?.accountId === 'string' ? input.accountId.trim() : '',
    mode: input?.mode === 'account_update' ? 'account_update' : 'account_onboarding',
    refreshUrl: typeof input?.refreshUrl === 'string' ? input.refreshUrl : '',
    returnUrl: typeof input?.returnUrl === 'string' ? input.returnUrl : '',
  };
}

export async function POST(request) {
  const { userId } = await auth();
  logger.info({ endpoint: 'billing-connect-account-link', method: 'POST', userId }, 'Billing connect account-link POST');
  await writeAuditLog({
    userId,
    ip: null,
    action: 'billing-connect-account-link-POST',
    details: {},
  });
  await checkAnomaly(userId, 'billing-connect-account-link', 100);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json({
      error: 'Stripe Connect is not configured',
      missing: ['STRIPE_SECRET_KEY'],
    }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const payload = parseBody(body);
  if (!payload.accountId) {
    return NextResponse.json({ error: 'accountId is required' }, { status: 400 });
  }

  const baseUrl = resolveBaseUrl(request);

  try {
    const link = await stripe.accountLinks.create({
      account: payload.accountId,
      type: payload.mode,
      refresh_url: normalizeUrlCandidate(payload.refreshUrl, baseUrl),
      return_url: normalizeUrlCandidate(payload.returnUrl, baseUrl),
    });

    return NextResponse.json({
      accountId: payload.accountId,
      type: payload.mode,
      url: link.url,
      expiresAt: link.expires_at,
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Unable to create Stripe Connect account link',
      message: error instanceof Error ? error.message : 'Unknown Stripe error',
    }, { status: 502 });
  }
}

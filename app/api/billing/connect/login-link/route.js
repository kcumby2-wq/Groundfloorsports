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

export async function POST(request) {
  const { userId } = await auth();
  logger.info({ endpoint: 'billing-connect-login-link', method: 'POST', userId }, 'Billing connect login-link POST');
  await writeAuditLog({
    userId,
    ip: null,
    action: 'billing-connect-login-link-POST',
    details: {},
  });
  await checkAnomaly(userId, 'billing-connect-login-link', 100);

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

  const accountId = typeof body?.accountId === 'string' ? body.accountId.trim() : '';
  if (!accountId) {
    return NextResponse.json({ error: 'accountId is required' }, { status: 400 });
  }

  try {
    const loginLink = await stripe.accounts.createLoginLink(accountId);
    return NextResponse.json({
      accountId,
      url: loginLink.url,
      created: loginLink.created,
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Unable to create Stripe Connect login link',
      message: error instanceof Error ? error.message : 'Unknown Stripe error',
    }, { status: 502 });
  }
}

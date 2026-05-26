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

function normalizeUrlCandidate(raw, fallback) {
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
    return `${fallback}${value}`;
  }

  return fallback;
}

function parseBody(input) {
  return {
    accountId: typeof input?.accountId === 'string' ? input.accountId.trim() : '',
    email: typeof input?.email === 'string' ? input.email.trim().toLowerCase() : '',
    country: typeof input?.country === 'string' ? input.country.trim().toUpperCase() : 'US',
    businessType: input?.businessType === 'company' ? 'company' : 'individual',
    refreshUrl: typeof input?.refreshUrl === 'string' ? input.refreshUrl : '',
    returnUrl: typeof input?.returnUrl === 'string' ? input.returnUrl : '',
    metadata: typeof input?.metadata === 'object' && input?.metadata !== null ? input.metadata : {},
  };
}

function summarizeAccount(account) {
  return {
    id: account.id,
    type: account.type,
    country: account.country,
    email: account.email || '',
    chargesEnabled: Boolean(account.charges_enabled),
    payoutsEnabled: Boolean(account.payouts_enabled),
    detailsSubmitted: Boolean(account.details_submitted),
    requirements: {
      currentlyDue: account.requirements?.currently_due || [],
      eventuallyDue: account.requirements?.eventually_due || [],
      pendingVerification: account.requirements?.pending_verification || [],
      disabledReason: account.requirements?.disabled_reason || '',
    },
  };
}

export async function POST(request) {
  const { userId } = await auth();
  logger.info({ endpoint: 'billing-connect-account', method: 'POST', userId }, 'Billing connect account POST');
  await writeAuditLog({
    userId,
    ip: null,
    action: 'billing-connect-account-POST',
    details: {},
  });
  await checkAnomaly(userId, 'billing-connect-account', 100);

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
  const baseUrl = resolveBaseUrl(request);
  const fallbackRefresh = `${baseUrl}/admin.html#settings`;
  const fallbackReturn = `${baseUrl}/admin.html#settings`;

  try {
    const account = payload.accountId
      ? await stripe.accounts.retrieve(payload.accountId)
      : await stripe.accounts.create({
        type: 'express',
        country: payload.country || 'US',
        business_type: payload.businessType,
        ...(payload.email ? { email: payload.email } : {}),
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          productLine: 'groundfloorsports',
          createdByUserId: userId,
          ...payload.metadata,
        },
      });

    const refreshUrl = normalizeUrlCandidate(payload.refreshUrl, fallbackRefresh);
    const returnUrl = normalizeUrlCandidate(payload.returnUrl, fallbackReturn);

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      type: 'account_onboarding',
      refresh_url: refreshUrl,
      return_url: returnUrl,
    });

    return NextResponse.json({
      account: summarizeAccount(account),
      onboarding: {
        url: accountLink.url,
        expiresAt: accountLink.expires_at,
        refreshUrl,
        returnUrl,
      },
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Stripe Connect onboarding failed',
      message: error instanceof Error ? error.message : 'Unknown Stripe Connect error',
    }, { status: 502 });
  }
}

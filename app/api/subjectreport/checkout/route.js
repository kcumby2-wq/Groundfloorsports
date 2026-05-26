import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';

const PLAN_CONFIG = {
  transcript: {
    key: 'transcript',
    name: 'Subjectreport Player Transcript',
    mode: 'payment',
    amountUsd: 249,
    envPriceId: 'STRIPE_SUBJECTREPORT_TRANSCRIPT_PRICE_ID',
  },
  program: {
    key: 'program',
    name: 'Subjectreport Recruiting Program',
    mode: 'payment',
    amountUsd: 1500,
    envPriceId: 'STRIPE_SUBJECTREPORT_PROGRAM_PRICE_ID',
  },
  full: {
    key: 'full',
    name: 'Subjectreport Full Athlete Package',
    mode: 'payment',
    amountUsd: 5000,
    envPriceId: 'STRIPE_SUBJECTREPORT_FULL_PRICE_ID',
  },
  prospect: {
    key: 'prospect',
    name: 'Subjectreport Prospect Membership',
    mode: 'subscription',
    amountUsd: 99,
    envPriceId: 'STRIPE_SUBJECTREPORT_PROSPECT_PRICE_ID',
  },
};

function parseBody(input) {
  return {
    planKey: typeof input?.planKey === 'string' ? input.planKey : '',
    returnUrl: typeof input?.returnUrl === 'string' ? input.returnUrl : '',
    customer: {
      firstName: typeof input?.customer?.firstName === 'string' ? input.customer.firstName : '',
      lastName: typeof input?.customer?.lastName === 'string' ? input.customer.lastName : '',
      email: typeof input?.customer?.email === 'string' ? input.customer.email : '',
      phone: typeof input?.customer?.phone === 'string' ? input.customer.phone : '',
      sport: typeof input?.customer?.sport === 'string' ? input.customer.sport : '',
      classYear: typeof input?.customer?.classYear === 'string' ? input.customer.classYear : '',
      notes: typeof input?.customer?.notes === 'string' ? input.customer.notes : '',
    },
  };
}

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY || '';
  if (!secretKey) return null;
  return new Stripe(secretKey, { apiVersion: '2025-04-30.basil' });
}

function getBaseUrl(request) {
  const explicit = (process.env.NEXT_PUBLIC_APP_URL || '').trim();
  if (explicit) return explicit.replace(/\/$/, '');

  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const proto = request.headers.get('x-forwarded-proto') || 'http';
  if (host) return `${proto}://${host}`;

  return 'http://localhost:3000';
}

function normalizeReturnUrl({ request, returnUrl }) {
  const raw = String(returnUrl || '').trim();
  const baseUrl = getBaseUrl(request);

  if (!raw) {
    return `${baseUrl}/Subjectreport.html`;
  }

  if (/^https?:\/\//i.test(raw)) {
    try {
      const target = new URL(raw);
      return target.toString();
    } catch {
      return `${baseUrl}/Subjectreport.html`;
    }
  }

  if (raw.startsWith('/')) {
    return `${baseUrl}${raw}`;
  }

  return `${baseUrl}/Subjectreport.html`;
}

function buildLineItem(plan) {
  const envPriceId = process.env[plan.envPriceId] || '';
  if (envPriceId) {
    return { price: envPriceId, quantity: 1 };
  }

  if (plan.mode === 'subscription') {
    return {
      quantity: 1,
      price_data: {
        currency: 'usd',
        unit_amount: Math.round(plan.amountUsd * 100),
        recurring: { interval: 'month' },
        product_data: { name: plan.name },
      },
    };
  }

  return {
    quantity: 1,
    price_data: {
      currency: 'usd',
      unit_amount: Math.round(plan.amountUsd * 100),
      product_data: { name: plan.name },
    },
  };
}

export async function POST(request) {
  const ip = request?.headers?.get?.('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const anomaly = await checkAnomaly(`ip:${ip}`, 'subjectreport_checkout', 50);
  if (anomaly) {
    logger.warn({ ip }, 'Anomaly detected for subjectreport checkout');
    await writeAuditLog({ userId: null, ip, action: 'anomaly_detected', details: { endpoint: 'subjectreport_checkout' } });
  }
  const stripe = getStripeClient();
  if (!stripe) {
    logger.warn({ ip }, 'Stripe not configured');
    await writeAuditLog({ userId: null, ip, action: 'stripe_not_configured', details: {} });
    return NextResponse.json({
      error: 'Stripe checkout is not configured',
      missing: ['STRIPE_SECRET_KEY'],
    }, { status: 503 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    logger.warn({ ip }, 'Invalid JSON body for checkout');
    await writeAuditLog({ userId: null, ip, action: 'invalid_json_body', details: {} });
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const payload = parseBody(body);
  const plan = PLAN_CONFIG[payload.planKey];
  if (!plan) {
    logger.warn({ ip, planKey: payload.planKey }, 'Invalid plan key');
    await writeAuditLog({ userId: null, ip, action: 'invalid_plan_key', details: { planKey: payload.planKey } });
    return NextResponse.json({ error: 'Invalid plan key' }, { status: 400 });
  }
  const email = payload.customer.email.trim().toLowerCase();
  if (!email) {
    logger.warn({ ip }, 'Customer email is required');
    await writeAuditLog({ userId: null, ip, action: 'customer_email_required', details: {} });
    return NextResponse.json({ error: 'Customer email is required' }, { status: 400 });
  }
  const successBase = normalizeReturnUrl({ request, returnUrl: payload.returnUrl });
  const separator = successBase.includes('?') ? '&' : '?';
  const successUrl = `${successBase}${separator}sr_checkout=success&plan=${encodeURIComponent(plan.key)}`;
  const cancelUrl = `${successBase}${separator}sr_checkout=cancelled&plan=${encodeURIComponent(plan.key)}`;
  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: plan.mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: email,
      metadata: {
        productLine: 'subjectreport',
        planKey: plan.key,
        customerFirstName: payload.customer.firstName.trim(),
        customerLastName: payload.customer.lastName.trim(),
        customerPhone: payload.customer.phone.trim(),
        sport: payload.customer.sport.trim(),
        classYear: payload.customer.classYear.trim(),
        notes: payload.customer.notes.trim().slice(0, 450),
      },
      line_items: [buildLineItem(plan)],
    });
  } catch (error) {
    logger.error({ ip, error: error instanceof Error ? error.message : error }, 'Stripe checkout session creation failed');
    await writeAuditLog({ userId: null, ip, action: 'stripe_checkout_failed', details: { error: error instanceof Error ? error.message : error } });
    return NextResponse.json({
      error: 'Stripe checkout session creation failed',
      message: error instanceof Error ? error.message : 'Unknown Stripe error',
    }, { status: 502 });
  }
  logger.info({ ip, sessionId: session.id, plan: plan.key }, 'Stripe checkout session created');
  await writeAuditLog({ userId: null, ip, action: 'stripe_checkout_created', details: { sessionId: session.id, plan: plan.key } });
  return NextResponse.json({
    checkout: {
      provider: 'stripe',
      mode: plan.mode,
      sessionId: session.id,
      url: session.url,
    },
    plan: {
      key: plan.key,
      name: plan.name,
      amountUsd: plan.amountUsd,
    },
  });
}

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import logger from '@/lib/logger';
import { writeAuditLog } from '@/lib/auditLog';
import { checkAnomaly } from '@/lib/anomalyDetection';

export const runtime = 'nodejs';

const connectEventsPath = path.join(process.cwd(), 'data', 'stripe-connect-events.json');
const CONNECT_EVENT_TYPES = new Set([
  'account.updated',
  'account.application.deauthorized',
  'capability.updated',
  'payout.created',
  'payout.paid',
  'payout.failed',
  'payout.canceled',
]);

function getStripeConfig() {
  return {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_CONNECT_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || '',
  };
}

function getStripeClient(secretKey) {
  return new Stripe(secretKey, { apiVersion: '2025-04-30.basil' });
}

async function readConnectEvents() {
  await mkdir(path.dirname(connectEventsPath), { recursive: true });

  try {
    const raw = await readFile(connectEventsPath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function appendConnectEvent(entry) {
  const events = await readConnectEvents();
  const next = [entry, ...events].slice(0, 500);
  await writeFile(connectEventsPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
}

function parseLimit(raw) {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return 20;
  return Math.min(Math.max(Math.round(parsed), 1), 100);
}

function buildSummary(event) {
  const object = event?.data?.object || {};

  if (event.type === 'account.updated') {
    return {
      objectType: 'account',
      accountId: object.id || event.account || '',
      chargesEnabled: Boolean(object.charges_enabled),
      payoutsEnabled: Boolean(object.payouts_enabled),
      detailsSubmitted: Boolean(object.details_submitted),
      currentlyDue: object.requirements?.currently_due || [],
      disabledReason: object.requirements?.disabled_reason || '',
    };
  }

  if (event.type === 'capability.updated') {
    return {
      objectType: 'capability',
      accountId: object.account || event.account || '',
      capability: object.id || '',
      status: object.status || '',
      requested: Boolean(object.requested),
      disabledReason: object.requirements?.disabled_reason || '',
    };
  }

  if (event.type.startsWith('payout.')) {
    return {
      objectType: 'payout',
      accountId: event.account || '',
      payoutId: object.id || '',
      payoutStatus: object.status || '',
      amount: object.amount || 0,
      currency: object.currency || '',
      arrivalDate: object.arrival_date || null,
      failureCode: object.failure_code || '',
      failureMessage: object.failure_message || '',
    };
  }

  if (event.type === 'account.application.deauthorized') {
    return {
      objectType: 'account_application',
      accountId: event.account || object.account || '',
      application: object.application || '',
      message: 'Stripe account was deauthorized',
    };
  }

  return {
    objectType: object.object || 'unknown',
    accountId: event.account || object.account || '',
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = parseLimit(searchParams.get('limit'));
  // Logging, audit, anomaly detection
  logger.info({ endpoint: 'stripe-connect-webhook', method: 'GET', user: null, ip: request.headers.get('x-forwarded-for') || null }, 'Billing webhook GET');
  await writeAuditLog({
    userId: null,
    ip: request.headers.get('x-forwarded-for') || null,
    action: 'stripe-connect-webhook-GET',
    details: { limit },
  });
  await checkAnomaly(request.headers.get('x-forwarded-for') || 'unknown', 'stripe-connect-webhook', 100);
  const events = await readConnectEvents();
  return NextResponse.json({ events: events.slice(0, limit) });
}

export async function POST(request) {
  const { secretKey, webhookSecret } = getStripeConfig();
  if (!secretKey || !webhookSecret) {
    return NextResponse.json({
      error: 'Stripe Connect webhook is not configured',
      missing: [
        !secretKey ? 'STRIPE_SECRET_KEY' : null,
        !webhookSecret ? 'STRIPE_CONNECT_WEBHOOK_SECRET (or STRIPE_WEBHOOK_SECRET)' : null,
      ].filter(Boolean),
    }, { status: 503 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    logger.warn({ endpoint: 'stripe-connect-webhook', method: 'POST', error: 'Missing signature' }, 'Billing webhook POST error');
    await writeAuditLog({
      userId: null,
      ip: request.headers.get('x-forwarded-for') || null,
      action: 'stripe-connect-webhook-POST',
      details: { error: 'Missing signature' },
    });
    await checkAnomaly(request.headers.get('x-forwarded-for') || 'unknown', 'stripe-connect-webhook', 100);
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const rawBody = await request.text();

  let event;
  try {
    const stripe = getStripeClient(secretKey);
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    logger.warn({ endpoint: 'stripe-connect-webhook', method: 'POST', error: error?.message }, 'Billing webhook POST signature error');
    await writeAuditLog({
      userId: null,
      ip: request.headers.get('x-forwarded-for') || null,
      action: 'stripe-connect-webhook-POST',
      details: { error: error?.message },
    });
    await checkAnomaly(request.headers.get('x-forwarded-for') || 'unknown', 'stripe-connect-webhook', 100);
    return NextResponse.json({
      error: 'Invalid webhook signature',
      message: error instanceof Error ? error.message : 'Unknown signature error',
    }, { status: 400 });
  }

  if (!CONNECT_EVENT_TYPES.has(event.type)) {
    logger.info({ endpoint: 'stripe-connect-webhook', method: 'POST', eventType: event.type }, 'Billing webhook POST ignored event');
    await writeAuditLog({
      userId: null,
      ip: request.headers.get('x-forwarded-for') || null,
      action: 'stripe-connect-webhook-POST',
      details: { eventType: event.type, ignored: true },
    });
    return NextResponse.json({
      received: true,
      ignored: true,
      eventType: event.type,
    });
  }

  const summary = buildSummary(event);
  await appendConnectEvent({
    id: event.id,
    type: event.type,
    account: event.account || summary.accountId || '',
    livemode: Boolean(event.livemode),
    created: event.created || Math.floor(Date.now() / 1000),
    receivedAt: new Date().toISOString(),
    summary,
  });

  logger.info({ endpoint: 'stripe-connect-webhook', method: 'POST', eventType: event.type, account: event.account }, 'Billing webhook POST processed');
  await writeAuditLog({
    userId: null,
    ip: request.headers.get('x-forwarded-for') || null,
    action: 'stripe-connect-webhook-POST',
    details: { eventType: event.type, account: event.account },
  });
  await checkAnomaly(request.headers.get('x-forwarded-for') || 'unknown', 'stripe-connect-webhook', 100);

  return NextResponse.json({
    received: true,
    eventType: event.type,
    connect: summary,
  });
}

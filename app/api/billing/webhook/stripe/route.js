import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { updateOrderStatus } from '@/lib/orderStore';
import logger from '@/lib/logger';
import { writeAuditLog } from '@/lib/auditLog';
import { checkAnomaly } from '@/lib/anomalyDetection';

export const runtime = 'nodejs';

const EVENT_STATUS_MAP = {
  'checkout.session.completed': 'paid',
  'checkout.session.async_payment_failed': 'payment_failed',
  'payment_intent.succeeded': 'paid',
  'payment_intent.payment_failed': 'payment_failed',
  'charge.refunded': 'refunded',
};

function getStripeConfig() {
  return {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  };
}

function getStripeClient(secretKey) {
  return new Stripe(secretKey, {
    apiVersion: '2025-04-30.basil',
  });
}

function extractOrderIdFromEvent(event) {
  const object = event?.data?.object || {};
  return (
    object?.metadata?.orderId
    || object?.metadata?.order_id
    || object?.client_reference_id
    || null
  );
}

function buildPaymentContext(event) {
  const object = event?.data?.object || {};

  return {
    stripeEventId: event?.id || '',
    stripeEventType: event?.type || '',
    stripeConnectedAccountId: event?.account || object?.account || '',
    stripeObjectId: object?.id || '',
    stripePaymentIntent: object?.payment_intent || '',
    stripeCheckoutSessionId: object?.object === 'checkout.session' ? object?.id || '' : '',
    stripeChargeId: object?.object === 'charge' ? object?.id || '' : '',
  };
}

function assertStripeConfigured() {
  const { secretKey, webhookSecret } = getStripeConfig();
  if (!secretKey || !webhookSecret) {
    return {
      ok: false,
      error: NextResponse.json(
        {
          error: 'Stripe webhook is not configured',
          missing: [
            !secretKey ? 'STRIPE_SECRET_KEY' : null,
            !webhookSecret ? 'STRIPE_WEBHOOK_SECRET' : null,
          ].filter(Boolean),
        },
        { status: 503 },
      ),
    };
  }

  return {
    ok: true,
    secretKey,
    webhookSecret,
  };
}

export async function POST(request) {
  const config = assertStripeConfigured();
  if (!config.ok) {
    logger.warn({ endpoint: 'stripe-webhook', method: 'POST', error: 'Stripe not configured' }, 'Billing webhook POST error');
    await writeAuditLog({
      userId: null,
      ip: request.headers.get('x-forwarded-for') || null,
      action: 'stripe-webhook-POST',
      details: { error: 'Stripe not configured' },
    });
    await checkAnomaly(request.headers.get('x-forwarded-for') || 'unknown', 'stripe-webhook', 100);
    return config.error;
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    logger.warn({ endpoint: 'stripe-webhook', method: 'POST', error: 'Missing signature' }, 'Billing webhook POST error');
    await writeAuditLog({
      userId: null,
      ip: request.headers.get('x-forwarded-for') || null,
      action: 'stripe-webhook-POST',
      details: { error: 'Missing signature' },
    });
    await checkAnomaly(request.headers.get('x-forwarded-for') || 'unknown', 'stripe-webhook', 100);
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const rawBody = await request.text();

  let event;
  try {
    const stripe = getStripeClient(config.secretKey);
    event = stripe.webhooks.constructEvent(rawBody, signature, config.webhookSecret);
  } catch (error) {
    logger.warn({ endpoint: 'stripe-webhook', method: 'POST', error: error?.message }, 'Billing webhook POST signature error');
    await writeAuditLog({
      userId: null,
      ip: request.headers.get('x-forwarded-for') || null,
      action: 'stripe-webhook-POST',
      details: { error: error?.message },
    });
    await checkAnomaly(request.headers.get('x-forwarded-for') || 'unknown', 'stripe-webhook', 100);
    return NextResponse.json(
      {
        error: 'Invalid webhook signature',
        message: error instanceof Error ? error.message : 'Unknown signature error',
      },
      { status: 400 },
    );
  }

  const nextStatus = EVENT_STATUS_MAP[event.type] || null;
  if (!nextStatus) {
    logger.info({ endpoint: 'stripe-webhook', method: 'POST', eventType: event.type }, 'Billing webhook POST ignored event');
    await writeAuditLog({
      userId: null,
      ip: request.headers.get('x-forwarded-for') || null,
      action: 'stripe-webhook-POST',
      details: { eventType: event.type, ignored: true },
    });
    return NextResponse.json({ received: true, ignored: true, eventType: event.type });
  }

  const orderId = extractOrderIdFromEvent(event);
  if (!orderId) {
    logger.warn({ endpoint: 'stripe-webhook', method: 'POST', eventType: event.type, error: 'missing_order_id' }, 'Billing webhook POST missing orderId');
    await writeAuditLog({
      userId: null,
      ip: request.headers.get('x-forwarded-for') || null,
      action: 'stripe-webhook-POST',
      details: { eventType: event.type, reason: 'missing_order_id' },
    });
    return NextResponse.json({
      received: true,
      ignored: true,
      eventType: event.type,
      reason: 'missing_order_id',
    });
  }

  const updateResult = await updateOrderStatus({
    orderId,
    status: nextStatus,
    paymentContext: buildPaymentContext(event),
  });

  logger.info({ endpoint: 'stripe-webhook', method: 'POST', eventType: event.type, orderId }, 'Billing webhook POST processed');
  await writeAuditLog({
    userId: null,
    ip: request.headers.get('x-forwarded-for') || null,
    action: 'stripe-webhook-POST',
    details: { eventType: event.type, orderId },
  });
  await checkAnomaly(request.headers.get('x-forwarded-for') || 'unknown', 'stripe-webhook', 100);

  return NextResponse.json({
    received: true,
    eventType: event.type,
    orderId,
    updateResult,
  });
}

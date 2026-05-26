import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getClipPurchaseById, getGameCommerceBySlug } from '@/components/gfs/marketplaceData';
import { appendOrder, persistOrderToSupabase } from '@/lib/orderStore';
import { getCreatorClipPurchaseById, getCreatorGameCommerceBySlug } from '@/lib/creatorUploadStore';
import logger from '@/lib/logger';
import { writeAuditLog } from '@/lib/auditLog';
import { checkAnomaly } from '@/lib/anomalyDetection';

export const runtime = 'nodejs';

const ALLOWED_PURCHASE_KINDS = new Set(['standard_clip', 'reel', 'full_game']);
const STRIPE_ACCOUNT_ID_PATTERN = /^acct_[A-Za-z0-9]+$/;

function parsePayload(input) {
  const connectInput = input?.connect || {};
  return {
    gameSlug: typeof input?.gameSlug === 'string' ? input.gameSlug : '',
    clipId: typeof input?.clipId === 'string' ? input.clipId : '',
    purchaseKind: typeof input?.purchaseKind === 'string' ? input.purchaseKind : '',
    returnPath: typeof input?.returnPath === 'string' ? input?.returnPath : '',
    connect: {
      accountId: typeof connectInput?.accountId === 'string'
        ? connectInput.accountId
        : (typeof input?.connectedAccountId === 'string' ? input.connectedAccountId : ''),
      applicationFeePercent: typeof connectInput?.applicationFeePercent === 'number'
        ? connectInput.applicationFeePercent
        : (typeof input?.applicationFeePercent === 'number' ? input.applicationFeePercent : null),
      platformFeeUsd: typeof connectInput?.platformFeeUsd === 'number'
        ? connectInput.platformFeeUsd
        : (typeof input?.platformFeeUsd === 'number' ? input.platformFeeUsd : null),
    },
  };
}

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
  if (host) {
    return `${proto}://${host}`;
  }

  return 'http://localhost:3000';
}

function normalizeReturnPath(returnPath, fallbackPath) {
  const candidate = String(returnPath || '').trim();
  if (!candidate.startsWith('/')) return fallbackPath;
  return candidate;
}

function buildFallbackPath(payload) {
  if (payload.purchaseKind === 'full_game') {
    return `/marketplace/games/${encodeURIComponent(payload.gameSlug)}`;
  }

  return `/marketplace/games/${encodeURIComponent(payload.gameSlug)}/clips/${encodeURIComponent(payload.clipId)}`;
}

function normalizeConnectAccountId(value) {
  const candidate = String(value || '').trim();
  if (!candidate) return '';
  if (!STRIPE_ACCOUNT_ID_PATTERN.test(candidate)) return '';
  return candidate;
}

function clampNumber(input, min, max) {
  const value = Number(input);
  if (!Number.isFinite(value)) return null;
  return Math.min(Math.max(value, min), max);
}

function resolveConnectConfig({ payload, orderDetails }) {
  const explicit = normalizeConnectAccountId(payload?.connect?.accountId);
  const metadataAccount = normalizeConnectAccountId(orderDetails?.metadata?.connectedAccountId);
  const defaultDestination = normalizeConnectAccountId(process.env.STRIPE_CONNECT_DEFAULT_DESTINATION_ACCOUNT || '');
  const destinationAccountId = explicit || metadataAccount || defaultDestination;

  if (!destinationAccountId) {
    return null;
  }

  const amountCents = Math.max(0, Math.round(Number(orderDetails?.amountUsd || 0) * 100));
  const percentFromPayload = clampNumber(payload?.connect?.applicationFeePercent, 0, 100);
  const percentFromEnv = clampNumber(process.env.STRIPE_CONNECT_PLATFORM_FEE_PERCENT, 0, 100);
  const feePercent = percentFromPayload ?? percentFromEnv;
  const fixedFeeUsd = clampNumber(payload?.connect?.platformFeeUsd, 0, Number.MAX_SAFE_INTEGER);

  let applicationFeeAmount = null;
  if (fixedFeeUsd !== null) {
    applicationFeeAmount = Math.round(fixedFeeUsd * 100);
  } else if (feePercent !== null) {
    applicationFeeAmount = Math.round(amountCents * (feePercent / 100));
  }

  if (applicationFeeAmount !== null) {
    applicationFeeAmount = Math.min(Math.max(applicationFeeAmount, 0), amountCents);
  }

  return {
    destinationAccountId,
    applicationFeeAmount,
    platformFeePercent: feePercent,
  };
}

async function createStripeCheckoutSession({ request, payload, order, orderDetails }) {
  const stripe = getStripeClient();
  if (!stripe) {
    return null;
  }

  const fallbackPath = buildFallbackPath(payload);
  const returnPath = normalizeReturnPath(payload.returnPath, fallbackPath);
  const baseUrl = resolveBaseUrl(request);
  const successUrl = `${baseUrl}${returnPath}${returnPath.includes('?') ? '&' : '?'}checkout=success&order_id=${encodeURIComponent(order.id)}`;
  const cancelUrl = `${baseUrl}${returnPath}${returnPath.includes('?') ? '&' : '?'}checkout=cancelled&order_id=${encodeURIComponent(order.id)}`;
  const connectConfig = resolveConnectConfig({ payload, orderDetails });

  const paymentIntentData = connectConfig
    ? {
      transfer_data: {
        destination: connectConfig.destinationAccountId,
      },
      ...(connectConfig.applicationFeeAmount !== null
        ? { application_fee_amount: connectConfig.applicationFeeAmount }
        : {}),
    }
    : undefined;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: order.id,
    metadata: {
      orderId: order.id,
      order_id: order.id,
      userId: order.userId,
      purchaseKind: order.purchaseKind,
      gameSlug: order.gameSlug,
      clipId: order.clipId || '',
      connectedAccountId: connectConfig?.destinationAccountId || '',
    },
    ...(paymentIntentData ? { payment_intent_data: paymentIntentData } : {}),
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(Number(orderDetails.amountUsd || 0) * 100),
          product_data: {
            name: orderDetails.productName,
            metadata: {
              orderId: order.id,
              gameSlug: order.gameSlug,
              clipId: order.clipId || '',
            },
          },
        },
      },
    ],
  });

  return {
    provider: 'stripe',
    sessionId: session.id,
    url: session.url,
    connect: connectConfig
      ? {
        destinationAccountId: connectConfig.destinationAccountId,
        applicationFeeAmount: connectConfig.applicationFeeAmount,
      }
      : null,
  };
}

async function buildOrderDetails({ gameSlug, clipId, purchaseKind }) {
  if (purchaseKind === 'full_game') {
    const game = getGameCommerceBySlug(gameSlug) || await getCreatorGameCommerceBySlug(gameSlug);
    if (!game) {
      return null;
    }

    return {
      gameSlug,
      clipId: null,
      purchaseKind,
      productName: game.fullGameOffer.title,
      amountUsd: game.fullGameOffer.price,
      deliveryType: 'full-game-access',
      metadata: {
        gameName: game.name,
        sport: game.sport,
      },
    };
  }

  const clipPayload = getClipPurchaseById(gameSlug, clipId) || await getCreatorClipPurchaseById(gameSlug, clipId);
  if (!clipPayload) {
    return null;
  }

  const option = purchaseKind === 'reel'
    ? clipPayload.purchaseOptions.reel
    : clipPayload.purchaseOptions.standardClip;

  return {
    gameSlug,
    clipId,
    purchaseKind,
    productName: `${clipPayload.clip.title} (${option.label})`,
    amountUsd: option.price,
    deliveryType: purchaseKind === 'reel' ? 'edited-reel-queue' : 'instant-download',
    metadata: {
      clipTitle: clipPayload.clip.title,
      clipType: clipPayload.clip.clipType,
      creator: clipPayload.clip.creator,
      gameName: clipPayload.game.name,
    },
  };
}

export async function POST(request) {
  const { userId } = await auth();
  logger.info({ endpoint: 'checkout', method: 'POST', userId }, 'Checkout POST');
  await writeAuditLog({
    userId,
    ip: null,
    action: 'checkout-POST',
    details: {},
  });
  await checkAnomaly(userId, 'checkout', 100);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Simple in-memory rate limit (per user, per minute)
  if (!globalThis.__checkoutRateLimit) globalThis.__checkoutRateLimit = {};
  const userRateLimit = globalThis.__checkoutRateLimit;
  const MAX_REQUESTS_PER_MIN = 10;
  const now = Date.now();
  const windowStart = now - 60 * 1000;
  userRateLimit[userId] = (userRateLimit[userId] || []).filter(ts => ts > windowStart);
  if (userRateLimit[userId].length >= MAX_REQUESTS_PER_MIN) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }
  userRateLimit[userId].push(now);

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const payload = parsePayload(body);

  if (!payload.gameSlug || !ALLOWED_PURCHASE_KINDS.has(payload.purchaseKind)) {
    return NextResponse.json({ error: 'Invalid checkout payload' }, { status: 400 });
  }

  if (payload.purchaseKind !== 'full_game' && !payload.clipId) {
    return NextResponse.json({ error: 'clipId is required for clip purchases' }, { status: 400 });
  }

  const orderDetails = await buildOrderDetails(payload);
  if (!orderDetails) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const connectConfig = resolveConnectConfig({ payload, orderDetails });

  const order = {
    id: crypto.randomUUID(),
    userId,
    gameSlug: orderDetails.gameSlug,
    clipId: orderDetails.clipId,
    purchaseKind: orderDetails.purchaseKind,
    productName: orderDetails.productName,
    amountUsd: orderDetails.amountUsd,
    currency: 'USD',
    status: 'created',
    deliveryType: orderDetails.deliveryType,
    metadata: {
      ...(orderDetails.metadata || {}),
      ...(connectConfig
        ? {
          connectedAccountId: connectConfig.destinationAccountId,
          applicationFeeAmount: connectConfig.applicationFeeAmount,
          platformFeePercent: connectConfig.platformFeePercent,
        }
        : {}),
    },
    createdAt: new Date().toISOString(),
  };

  await appendOrder(order);

  let persistence = { mode: 'local-only' };
  try {
    persistence = await persistOrderToSupabase(order);
  } catch (error) {
    persistence = {
      mode: 'local-only',
      warning: error instanceof Error ? error.message : 'Supabase persistence failed',
    };
  }

  let checkout = null;
  try {
    checkout = await createStripeCheckoutSession({
      request,
      payload,
      order,
      orderDetails,
    });
  } catch (error) {
    checkout = {
      provider: 'stripe',
      error: error instanceof Error ? error.message : 'Stripe session creation failed',
    };
  }

  return NextResponse.json({
    order,
    persistence,
    checkout,
    webhookMetadataHint: {
      orderId: order.id,
    },
    message: order.purchaseKind === 'reel'
      ? 'Reel order queued. Editing delivery is 3-5 business days.'
      : 'Order created. Clip download is available instantly after purchase.',
  });
}

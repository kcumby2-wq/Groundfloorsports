import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ordersFilePath = path.join(process.cwd(), 'data', 'orders.json');

function getSupabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return {
    supabaseUrl,
    serviceRoleKey,
    configured: Boolean(supabaseUrl && serviceRoleKey),
  };
}

async function ensureOrdersFile() {
  await mkdir(path.dirname(ordersFilePath), { recursive: true });
  try {
    await readFile(ordersFilePath, 'utf8');
  } catch {
    await writeFile(ordersFilePath, '[]\n', 'utf8');
  }
}

export async function readOrders() {
  await ensureOrdersFile();
  const raw = await readFile(ordersFilePath, 'utf8');

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function appendOrder(order) {
  const orders = await readOrders();
  const next = [order, ...orders];
  await writeFile(ordersFilePath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  return order;
}

export async function listOrdersForUser(userId) {
  const orders = await readOrders();
  return orders.filter((order) => order.userId === userId);
}

export async function findOrderById(orderId) {
  if (!orderId) return null;
  const orders = await readOrders();
  return orders.find((order) => order.id === orderId) || null;
}

function normalizeOrderForSupabase(order) {
  return {
    id: order.id,
    user_id: order.userId,
    game_slug: order.gameSlug,
    clip_id: order.clipId,
    purchase_kind: order.purchaseKind,
    product_name: order.productName,
    amount_usd: order.amountUsd,
    currency: order.currency,
    status: order.status,
    delivery_type: order.deliveryType,
    metadata: order.metadata,
    created_at: order.createdAt,
  };
}

export async function persistOrderToSupabase(order) {
  const { supabaseUrl, serviceRoleKey, configured } = getSupabaseConfig();

  if (!configured) {
    return { mode: 'local-only' };
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/gfs_orders`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(normalizeOrderForSupabase(order)),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase order write failed (${response.status}): ${errorText}`);
  }

  return { mode: 'supabase' };
}

export async function updateOrderStatus({ orderId, status, paymentContext = {} }) {
  if (!orderId || !status) {
    return { updated: false, reason: 'missing_order_or_status' };
  }

  const nowIso = new Date().toISOString();
  const orders = await readOrders();
  const index = orders.findIndex((order) => order.id === orderId);
  let localUpdated = false;
  let updatedOrder = null;

  if (index >= 0) {
    const existing = orders[index];
    updatedOrder = {
      ...existing,
      status,
      metadata: {
        ...(existing.metadata || {}),
        ...(paymentContext || {}),
        webhookUpdatedAt: nowIso,
      },
      updatedAt: nowIso,
    };
    orders[index] = updatedOrder;
    await writeFile(ordersFilePath, `${JSON.stringify(orders, null, 2)}\n`, 'utf8');
    localUpdated = true;
  }

  const { supabaseUrl, serviceRoleKey, configured } = getSupabaseConfig();
  let supabaseUpdated = false;
  let supabaseError = '';

  if (configured) {
    const body = {
      status,
      metadata: {
        ...(updatedOrder?.metadata || paymentContext || {}),
        webhookUpdatedAt: nowIso,
      },
    };

    const response = await fetch(`${supabaseUrl}/rest/v1/gfs_orders?id=eq.${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const rows = await response.json().catch(() => []);
      supabaseUpdated = Array.isArray(rows) && rows.length > 0;
    } else {
      supabaseError = await response.text().catch(() => `Supabase status ${response.status}`);
    }
  }

  return {
    updated: localUpdated || supabaseUpdated,
    localUpdated,
    supabaseUpdated,
    supabaseError,
    order: updatedOrder,
  };
}

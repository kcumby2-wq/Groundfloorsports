// api/revenue.js
// Vercel serverless function — fetches Stripe revenue data for the admin dashboard
// Set STRIPE_SECRET_KEY in Vercel dashboard: Settings → Environment Variables

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

const PRODUCT_NAMES = {
  "prod_Ued9xtI4Zk9QIY": "Player Transcript",
  "prod_UedA0TJ1E1cXAF": "Recruiting Program",
  "prod_UedB3S7enT3xry": "Full Athlete Package",
  "prod_UedDdoGOdsF6Hc": "Prospect Membership",
};

async function stripeGet(path) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Stripe ${res.status}`);
  }
  return res.json();
}

async function getAllPages(path, limit = 100) {
  const items = [];
  let startingAfter = null;
  while (true) {
    const sep = path.includes("?") ? "&" : "?";
    const cursor = startingAfter ? `&starting_after=${startingAfter}` : "";
    const data = await stripeGet(`${path}${sep}limit=${limit}${cursor}`);
    items.push(...(data.data || []));
    if (!data.has_more) break;
    startingAfter = data.data[data.data.length - 1].id;
  }
  return items;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  if (!STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: "STRIPE_SECRET_KEY not set" });
  }

  try {
    // Fetch recent payment intents (last 90 days)
    const since = Math.floor((Date.now() - 90 * 24 * 60 * 60 * 1000) / 1000);
    const [charges, subscriptions] = await Promise.all([
      getAllPages(`/charges?created[gte]=${since}&expand[]=data.payment_intent`),
      getAllPages("/subscriptions?status=active"),
    ]);

    const successfulCharges = charges.filter((c) => c.paid && !c.refunded);

    const totalRevenue = successfulCharges.reduce((s, c) => s + c.amount, 0);
    const mrr = subscriptions.reduce((s, sub) => {
      const item = sub.items?.data?.[0];
      if (!item) return s;
      const price = item.price;
      if (!price) return s;
      const monthly =
        price.recurring?.interval === "year"
          ? price.unit_amount / 12
          : price.unit_amount;
      return s + monthly;
    }, 0);

    // Recent transactions (last 20)
    const transactions = successfulCharges.slice(0, 20).map((c) => ({
      id:          c.id,
      amount:      c.amount,
      currency:    c.currency,
      description: c.description || c.calculated_statement_descriptor || "",
      email:       c.billing_details?.email || c.receipt_email || "",
      date:        c.created,
      receipt:     c.receipt_url || "",
    }));

    // Revenue by product
    const byProduct = {};
    successfulCharges.forEach((c) => {
      const desc = c.description || "";
      let label = "Other";
      Object.entries(PRODUCT_NAMES).forEach(([, name]) => {
        if (desc.toLowerCase().includes(name.toLowerCase())) label = name;
      });
      if (!byProduct[label]) byProduct[label] = { count: 0, revenue: 0 };
      byProduct[label].count++;
      byProduct[label].revenue += c.amount;
    });

    return res.status(200).json({
      totalRevenue,
      mrr,
      arr: mrr * 12,
      activeSubscriptions: subscriptions.length,
      recentTransactions:  transactions,
      byProduct,
    });
  } catch (err) {
    console.error("Revenue fetch error:", err);
    return res.status(500).json({ error: err.message });
  }
}

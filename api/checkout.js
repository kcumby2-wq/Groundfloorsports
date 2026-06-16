// api/checkout.js — Vercel serverless function
// Set STRIPE_SECRET_KEY in Vercel: Settings → Environment Variables

const PRODUCT_MAP = {
  transcript: "prod_Ued9xtI4Zk9QIY",
  program:    "prod_UedA0TJ1E1cXAF",
  full:       "prod_UedB3S7enT3xry",
  prospect:   "prod_UedDdoGOdsF6Hc",
};

const FALLBACK_PRICES = {
  transcript: 24900,
  program:    150000,
  full:       500000,
  prospect:   9900,
};

async function stripePost(path, params, secretKey) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params).toString(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Stripe error ${res.status}`);
  return data;
}

async function stripeGet(path, secretKey) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Stripe error ${res.status}`);
  return data;
}

async function getPriceId(productId, isRecurring, secretKey) {
  try {
    const data = await stripeGet(`/prices?product=${productId}&active=true&limit=10`, secretKey);
    const prices = data.data || [];
    const match = isRecurring
      ? prices.find((p) => p.recurring != null)
      : prices.find((p) => p.recurring == null);
    return (match || prices[0])?.id || null;
  } catch {
    return null;
  }
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const SECRET = process.env.STRIPE_SECRET_KEY;
  if (!SECRET) {
    return res.status(500).json({ error: "STRIPE_SECRET_KEY not set in Vercel environment variables" });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const { planKey, customer } = body || {};
  if (!planKey || !PRODUCT_MAP[planKey]) {
    return res.status(400).json({ error: `Unknown plan: ${planKey}` });
  }

  const productId   = PRODUCT_MAP[planKey];
  const isRecurring = planKey === "prospect";
  const origin      = "https://www.subjectreport.com";

  try {
    const priceId = await getPriceId(productId, isRecurring, SECRET);
    const params  = {};

    if (priceId) {
      params["line_items[0][price]"] = priceId;
    } else {
      params["line_items[0][price_data][currency]"]    = "usd";
      params["line_items[0][price_data][unit_amount]"] = FALLBACK_PRICES[planKey];
      params["line_items[0][price_data][product]"]     = productId;
      if (isRecurring) {
        params["line_items[0][price_data][recurring][interval]"] = "month";
      }
    }

    params["line_items[0][quantity]"]          = 1;
    params["mode"]                             = isRecurring ? "subscription" : "payment";
    params["success_url"]                      = `${origin}/checkout-success?plan=${planKey}`;
    params["cancel_url"]                       = `${origin}/?canceled=1#packages`;
    params["phone_number_collection[enabled]"] = "true";
    params["metadata[plan_key]"]               = planKey;
    params["metadata[source]"]                 = "subjectreport_site";

    // Custom fields for athlete info
    params["custom_fields[0][key]"]           = "athlete_name";
    params["custom_fields[0][label][type]"]   = "custom";
    params["custom_fields[0][label][custom]"] = "Athlete Full Name";
    params["custom_fields[0][type]"]          = "text";
    params["custom_fields[0][optional]"]      = "false";

    params["custom_fields[1][key]"]           = "sport_position";
    params["custom_fields[1][label][type]"]   = "custom";
    params["custom_fields[1][label][custom]"] = "Sport & Position";
    params["custom_fields[1][type]"]          = "text";
    params["custom_fields[1][optional]"]      = "false";

    params["custom_fields[2][key]"]                            = "class_year";
    params["custom_fields[2][label][type]"]                    = "custom";
    params["custom_fields[2][label][custom]"]                  = "Class Year";
    params["custom_fields[2][type]"]                           = "dropdown";
    params["custom_fields[2][optional]"]                       = "false";
    params["custom_fields[2][dropdown][options][0][label]"]    = "2025";
    params["custom_fields[2][dropdown][options][0][value]"]    = "2025";
    params["custom_fields[2][dropdown][options][1][label]"]    = "2026";
    params["custom_fields[2][dropdown][options][1][value]"]    = "2026";
    params["custom_fields[2][dropdown][options][2][label]"]    = "2027";
    params["custom_fields[2][dropdown][options][2][value]"]    = "2027";
    params["custom_fields[2][dropdown][options][3][label]"]    = "2028";
    params["custom_fields[2][dropdown][options][3][value]"]    = "2028";
    params["custom_fields[2][dropdown][options][4][label]"]    = "2029";
    params["custom_fields[2][dropdown][options][4][value]"]    = "2029";
    params["custom_fields[2][dropdown][options][5][label]"]    = "Post-grad / Transfer";
    params["custom_fields[2][dropdown][options][5][value]"]    = "postgrad";

    params["custom_fields[3][key]"]           = "hudl_link";
    params["custom_fields[3][label][type]"]   = "custom";
    params["custom_fields[3][label][custom]"] = "Hudl / Film Link";
    params["custom_fields[3][type]"]          = "text";
    params["custom_fields[3][optional]"]      = "true";

    if (customer?.email) params["customer_email"] = customer.email;

    const session = await stripePost("/checkout/sessions", params, SECRET);
    return res.status(200).json({ checkout: { url: session.url, sessionId: session.id, mode: session.mode } });
  } catch (err) {
    console.error("Stripe checkout error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

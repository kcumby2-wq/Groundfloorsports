// api/media-checkout.js — Vercel serverless function for Subject·Medias digital-asset checkout.
//
// Creates a Stripe Checkout Session for a single digital asset or bundle using
// INLINE price_data — so it needs NO pre-created Stripe products/prices. The only
// requirement is STRIPE_SECRET_KEY in the Vercel project's environment variables
// (the same key the Subject·Report /api/checkout function already uses).
//
// Front-end usage (from subjectmedias.html):
//   const r = await fetch('/api/media-checkout', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ sku: 'highlight_clip', qty: 1, email })
//   });
//   const { checkout } = await r.json();
//   window.location = checkout.url;   // → Stripe-hosted checkout
//
// Fulfillment (MVP): orders land in Stripe (Dashboard → Payments) with the buyer's
// athlete/film details captured as custom fields + metadata. An operator delivers
// the asset (upload link) by email. Phase 2 automates this via the existing
// Stripe webhook (app/api/billing/webhook/stripe) → order store → delivery email.

// ─────────────────────────────────────────────────────────────────────────────
// CATALOG — edit prices/names here. amount is in CENTS. `recurring:"month"` makes
// it a subscription. `custom:true` items route to booking instead of checkout (a
// creator day-rate is quoted, not sold at a fixed price) — the front-end handles
// those; they are intentionally NOT in this map.
// ⚠️  PRICES BELOW ARE DRAFTS — confirm before go-live.
// ─────────────────────────────────────────────────────────────────────────────
const CATALOG = {
  highlight_clip: { name: "Highlight Clip — single graded & edited clip", amount: 4900 },
  game_edit:      { name: "Game Edit — full-game cutup & edit",           amount: 14900 },
  social_pack:    { name: "Social Pack — 5 clips + graphics",             amount: 19900 },
  graphics_pack:  { name: "Graphics Pack — custom graphic set",           amount: 9900 },
  season_film:    { name: "Season Film — season-long highlight film",     amount: 39900 },
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

  const { sku, qty, email } = body || {};
  const item = CATALOG[sku];
  if (!item) return res.status(400).json({ error: `Unknown asset: ${sku}` });

  const quantity = Math.min(Math.max(parseInt(qty, 10) || 1, 1), 25); // 1..25
  const origin = "https://subjectmedias.com";

  try {
    const params = {};
    params["line_items[0][price_data][currency]"]              = "usd";
    params["line_items[0][price_data][unit_amount]"]           = item.amount;
    params["line_items[0][price_data][product_data][name]"]    = item.name;
    params["line_items[0][price_data][product_data][metadata][sku]"] = sku;
    if (item.recurring) {
      params["line_items[0][price_data][recurring][interval]"] = item.recurring;
    }
    params["line_items[0][quantity]"]          = quantity;
    params["mode"]                             = item.recurring ? "subscription" : "payment";
    params["success_url"]                      = `${origin}/?purchase=success&sku=${encodeURIComponent(sku)}#book`;
    params["cancel_url"]                       = `${origin}/?purchase=canceled#book`;
    params["phone_number_collection[enabled]"] = "true";
    params["allow_promotion_codes"]            = "true";
    params["metadata[sku]"]                    = sku;
    params["metadata[source]"]                 = "subjectmedias_store";

    // What the editor needs to fulfill the asset.
    params["custom_fields[0][key]"]           = "athlete_name";
    params["custom_fields[0][label][type]"]   = "custom";
    params["custom_fields[0][label][custom]"] = "Athlete Full Name";
    params["custom_fields[0][type]"]          = "text";
    params["custom_fields[0][optional]"]      = "false";

    params["custom_fields[1][key]"]           = "film_link";
    params["custom_fields[1][label][type]"]   = "custom";
    params["custom_fields[1][label][custom]"] = "Film / Hudl link (or note we're capturing it)";
    params["custom_fields[1][type]"]          = "text";
    params["custom_fields[1][optional]"]      = "false";

    params["custom_fields[2][key]"]           = "instructions";
    params["custom_fields[2][label][type]"]   = "custom";
    params["custom_fields[2][label][custom]"] = "What to feature / anything we should know";
    params["custom_fields[2][type]"]          = "text";
    params["custom_fields[2][optional]"]      = "true";

    if (email) params["customer_email"] = email;

    const session = await stripePost("/checkout/sessions", params, SECRET);
    return res.status(200).json({ checkout: { url: session.url, sessionId: session.id, mode: session.mode } });
  } catch (err) {
    console.error("Subject·Medias checkout error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

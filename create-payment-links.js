// create-payment-links.js
// Run once to create Stripe Payment Links for all Subjectreport packages.
//
// Usage:
//   1. Open Terminal
//   2. cd into the folder with this file
//   3. Run:  STRIPE_SECRET_KEY=sk_live_... node create-payment-links.js
//
// Each link opens a hosted Stripe checkout with athlete info fields pre-configured.

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error("❌  Set STRIPE_SECRET_KEY before running:");
  console.error("    STRIPE_SECRET_KEY=sk_live_... node create-payment-links.js");
  process.exit(1);
}

const PRODUCTS = [
  {
    key:       "transcript",
    productId: "prod_Ued9xtI4Zk9QIY",
    name:      "Player Transcript",
    recurring: false,
  },
  {
    key:       "program",
    productId: "prod_UedA0TJ1E1cXAF",
    name:      "Recruiting Program",
    recurring: false,
  },
  {
    key:       "full",
    productId: "prod_UedB3S7enT3xry",
    name:      "Full Athlete Package",
    recurring: false,
  },
  {
    key:       "prospect",
    productId: "prod_UedDdoGOdsF6Hc",
    name:      "Prospect Membership",
    recurring: true,
  },
];

async function stripeGet(path) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Stripe ${res.status}`);
  return data;
}

async function stripePost(path, params) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params).toString(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Stripe ${res.status}`);
  return data;
}

async function getPriceId(productId, isRecurring) {
  const data = await stripeGet(`/prices?product=${productId}&active=true&limit=10`);
  const prices = data.data || [];
  const match = isRecurring
    ? prices.find((p) => p.recurring != null)
    : prices.find((p) => p.recurring == null);
  return (match || prices[0])?.id || null;
}

async function createPaymentLink(product) {
  const priceId = await getPriceId(product.productId, product.recurring);
  if (!priceId) {
    console.warn(`  ⚠  No price found for ${product.name} — skipping`);
    return null;
  }

  const params = {
    // Line item
    "line_items[0][price]":    priceId,
    "line_items[0][quantity]": 1,

    // Collect phone number
    "phone_number_collection[enabled]": true,

    // After payment
    "after_completion[type]": "redirect",
    "after_completion[redirect][url]": `https://www.subjectreport.com/checkout-success?plan=${product.key}`,

    // Custom fields — athlete info
    "custom_fields[0][key]":            "athlete_name",
    "custom_fields[0][label][type]":    "custom",
    "custom_fields[0][label][custom]":  "Athlete Full Name",
    "custom_fields[0][type]":           "text",
    "custom_fields[0][optional]":       "false",

    "custom_fields[1][key]":            "sport_position",
    "custom_fields[1][label][type]":    "custom",
    "custom_fields[1][label][custom]":  "Sport & Position",
    "custom_fields[1][type]":           "text",
    "custom_fields[1][optional]":       "false",

    "custom_fields[2][key]":            "class_year",
    "custom_fields[2][label][type]":    "custom",
    "custom_fields[2][label][custom]":  "Class Year",
    "custom_fields[2][type]":           "dropdown",
    "custom_fields[2][optional]":       "false",
    "custom_fields[2][dropdown][options][0][label]": "2025",
    "custom_fields[2][dropdown][options][0][value]": "2025",
    "custom_fields[2][dropdown][options][1][label]": "2026",
    "custom_fields[2][dropdown][options][1][value]": "2026",
    "custom_fields[2][dropdown][options][2][label]": "2027",
    "custom_fields[2][dropdown][options][2][value]": "2027",
    "custom_fields[2][dropdown][options][3][label]": "2028",
    "custom_fields[2][dropdown][options][3][value]": "2028",
    "custom_fields[2][dropdown][options][4][label]": "2029",
    "custom_fields[2][dropdown][options][4][value]": "2029",
    "custom_fields[2][dropdown][options][5][label]": "Post-grad / Transfer",
    "custom_fields[2][dropdown][options][5][value]": "postgrad",

    "custom_fields[3][key]":            "hudl_film_link",
    "custom_fields[3][label][type]":    "custom",
    "custom_fields[3][label][custom]":  "Hudl / Film Link",
    "custom_fields[3][type]":           "text",
    "custom_fields[3][optional]":       "true",

    // Metadata tag
    "metadata[plan_key]": product.key,
    "metadata[source]":   "subjectreport_payment_link",
  };

  const link = await stripePost("/payment_links", params);
  return link;
}

(async () => {
  console.log("Creating Stripe Payment Links for Subjectreport…\n");
  const results = {};

  for (const product of PRODUCTS) {
    process.stdout.write(`  Creating: ${product.name}… `);
    try {
      const link = await createPaymentLink(product);
      if (link) {
        results[product.key] = link.url;
        console.log(`✅  ${link.url}`);
      }
    } catch (err) {
      console.log(`❌  ${err.message}`);
    }
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Payment Links created. Add these to your site:\n");
  Object.entries(results).forEach(([key, url]) => {
    console.log(`  ${key.padEnd(12)} →  ${url}`);
  });
  console.log("\nAlso add them to Vercel environment variables:");
  Object.entries(results).forEach(([key, url]) => {
    console.log(`  SR_PAYMENT_LINK_${key.toUpperCase()}=${url}`);
  });
})();

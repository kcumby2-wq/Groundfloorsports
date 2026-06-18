// app/api/stripe-webhook/route.js
//
// Listens for Stripe "checkout.session.completed" events and updates the
// matching athlete row in Supabase from status "booked" → "paid".
//
// SETUP (do once after deploying this file):
// 1. Add these two secrets in Vercel → subjectreport → Settings → Environment Variables:
//      STRIPE_SECRET_KEY        your Stripe secret key (starts with sk_live_ or sk_test_)
//      STRIPE_WEBHOOK_SECRET    from Step 2 below (starts with whsec_)
//      SUPABASE_SERVICE_ROLE_KEY  from Supabase → Settings → API → service_role key
//
// 2. In Stripe Dashboard → Developers → Webhooks → Add endpoint:
//      Endpoint URL:  https://www.subjectreport.com/api/stripe-webhook
//      Events:        checkout.session.completed
//                     (also add customer.subscription.created if you use subscriptions)
//    Copy the "Signing secret" (whsec_...) → paste as STRIPE_WEBHOOK_SECRET in Vercel.
//
// 3. Redeploy (push any tiny change) so Vercel picks up the new env vars.

import { NextResponse } from "next/server";

// ─── Config ────────────────────────────────────────────────────────────────
const SUPABASE_URL        = "https://nebdqnlpuxcfwmyvmyie.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // server-only, never anon
const STRIPE_SECRET_KEY   = process.env.STRIPE_SECRET_KEY;
const WEBHOOK_SECRET      = process.env.STRIPE_WEBHOOK_SECRET;

// ─── Helpers ───────────────────────────────────────────────────────────────

// Minimal Stripe signature verification (no SDK needed — keeps bundle tiny).
async function verifyStripeSignature(rawBody, sigHeader, secret) {
  const parts = Object.fromEntries(
    sigHeader.split(",").map((p) => p.split("="))
  );
  const timestamp = parts["t"];
  const sig       = parts["v1"];
  if (!timestamp || !sig) throw new Error("Missing Stripe signature parts");

  const payload   = `${timestamp}.${rawBody}`;
  const keyBytes  = new TextEncoder().encode(secret);
  const msgBytes  = new TextEncoder().encode(payload);

  const cryptoKey = await crypto.subtle.importKey(
    "raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const signatureBytes = await crypto.subtle.sign("HMAC", cryptoKey, msgBytes);
  const computed = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (computed !== sig) throw new Error("Stripe signature mismatch");

  // Reject events older than 5 minutes (replay attack protection).
  const age = Math.floor(Date.now() / 1000) - parseInt(timestamp, 10);
  if (age > 300) throw new Error("Stripe event too old");
}

// Update athlete row in Supabase using the service role key (bypasses RLS).
async function markAthletePaid(email, stripeSessionId, pkg) {
  // Try to find an existing athlete by email and flip to "paid".
  const searchRes = await fetch(
    `${SUPABASE_URL}/rest/v1/athletes?email=eq.${encodeURIComponent(email)}&order=created_at.desc&limit=1`,
    {
      headers: {
        apikey:        SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        Accept:        "application/json",
      },
    }
  );

  const rows = await searchRes.json();

  if (rows && rows.length > 0) {
    // Athlete exists — update status to "paid" and record Stripe session.
    const athleteId = rows[0].id;
    const noteSuffix = `\nStripe session: ${stripeSessionId}`;
    const existingNotes = rows[0].notes || "";

    await fetch(
      `${SUPABASE_URL}/rest/v1/athletes?id=eq.${encodeURIComponent(athleteId)}`,
      {
        method: "PATCH",
        headers: {
          apikey:          SUPABASE_SERVICE_KEY,
          Authorization:   `Bearer ${SUPABASE_SERVICE_KEY}`,
          "Content-Type":  "application/json",
          Prefer:          "return=minimal",
        },
        body: JSON.stringify({
          status:     "paid",
          package:    pkg || rows[0].package,
          notes:      existingNotes + noteSuffix,
          updated_at: new Date().toISOString(),
        }),
      }
    );
    return { action: "updated", id: athleteId };
  }

  // No existing athlete — create a new row so nothing falls through the cracks.
  const nameParts  = (stripeSessionId || "").split("_");
  const newId      = `ath_stripe_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  await fetch(`${SUPABASE_URL}/rest/v1/athletes`, {
    method: "POST",
    headers: {
      apikey:          SUPABASE_SERVICE_KEY,
      Authorization:   `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type":  "application/json",
      Prefer:          "return=minimal",
    },
    body: JSON.stringify({
      id:         newId,
      email:      email,
      first_name: "",   // Stripe session metadata below will fill these if present
      last_name:  "",
      package:    pkg || "transcript",
      status:     "paid",
      notes:      `Created from Stripe webhook.\nStripe session: ${stripeSessionId}`,
    }),
  });
  return { action: "created", id: newId };
}

// ─── Route handler ─────────────────────────────────────────────────────────
export async function POST(request) {
  // 1. Guard: env vars must be set.
  if (!SUPABASE_SERVICE_KEY || !STRIPE_SECRET_KEY || !WEBHOOK_SECRET) {
    console.error("stripe-webhook: missing env vars");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // 2. Read raw body (needed for signature verification — must not be parsed yet).
  const rawBody  = await request.text();
  const sigHeader = request.headers.get("stripe-signature") || "";

  // 3. Verify the request genuinely came from Stripe.
  try {
    await verifyStripeSignature(rawBody, sigHeader, WEBHOOK_SECRET);
  } catch (err) {
    console.error("stripe-webhook: signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // 4. Parse and handle the event.
  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.log(`stripe-webhook: received event type=${event.type} id=${event.id}`);

  if (
    event.type === "checkout.session.completed" ||
    event.type === "customer.subscription.created"
  ) {
    const session      = event.data.object;
    const email        = session.customer_details?.email || session.customer_email || "";
    const sessionId    = session.id || "";
    const pkg          = session.metadata?.planKey || session.metadata?.package || "";

    if (!email) {
      console.warn("stripe-webhook: no email in session, skipping Supabase update");
      // Still return 200 so Stripe doesn't keep retrying.
      return NextResponse.json({ received: true, skipped: "no_email" });
    }

    try {
      const result = await markAthletePaid(email, sessionId, pkg);
      console.log(`stripe-webhook: supabase update → action=${result.action} id=${result.id}`);
    } catch (err) {
      console.error("stripe-webhook: supabase error:", err.message);
      // Return 200 anyway — Stripe retries on 5xx, which could cause duplicate updates.
      return NextResponse.json({ received: true, warning: "supabase_error" });
    }
  }

  // 5. Always return 200 so Stripe knows we received the event.
  return NextResponse.json({ received: true });
}

// Tell Next.js not to parse the body — we need the raw bytes for signature verification.
export const config = {
  api: { bodyParser: false },
};

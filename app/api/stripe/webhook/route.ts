import { applyCommissionRefund } from "@/lib/affiliates";
import { fulfillPayment } from "@/lib/fulfill";
import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return Response.json({ error: "Stripe webhook is not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return Response.json({ error: "Missing Stripe signature." }, { status: 400 });

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch {
    return Response.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
    if (paymentIntentId) await applyCommissionRefund(paymentIntentId, charge.amount_refunded);
    return Response.json({ received: true });
  }

  if (event.type !== "payment_intent.succeeded") return Response.json({ received: true });

  try {
    const snapshot = event.data.object as Stripe.PaymentIntent;
    const intent = await stripe.paymentIntents.retrieve(snapshot.id);
    const order = await fulfillPayment(stripe, intent);
    return Response.json({ received: true, order: order?.number ?? null });
  } catch (error) {
    console.error("Stripe webhook could not place the order.", error instanceof Error ? error.message : error);
    return Response.json({ error: "Could not place the order." }, { status: 500 });
  }
}


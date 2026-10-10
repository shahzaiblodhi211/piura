import { fulfillPayment } from "@/lib/fulfill";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) return Response.json({ error: "Stripe is not configured." }, { status: 503 });

  let clientSecret = "";
  try {
    const body = (await request.json()) as { clientSecret?: unknown };
    if (typeof body.clientSecret === "string") clientSecret = body.clientSecret;
  } catch {
    return Response.json({ error: "Check the payment and try again." }, { status: 400 });
  }

  const id = clientSecret.split("_secret_")[0];
  if (!/^pi_[A-Za-z0-9]+$/.test(id) || !clientSecret.startsWith(`${id}_secret_`)) {
    return Response.json({ error: "Check the payment and try again." }, { status: 400 });
  }

  const intent = await stripe.paymentIntents.retrieve(id);
  if (intent.client_secret !== clientSecret) return Response.json({ error: "Check the payment and try again." }, { status: 400 });
  if (intent.status === "processing") return Response.json({ status: "processing" });
  if (intent.status !== "succeeded") return Response.json({ status: intent.status });

  try {
    const order = await fulfillPayment(stripe, intent);
    if (!order) return Response.json({ error: "This payment has no order details." }, { status: 400 });
    return Response.json({ status: "succeeded", number: order.number, test: order.test === true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not place the order.";
    return Response.json({ error: message }, { status: 400 });
  }
}

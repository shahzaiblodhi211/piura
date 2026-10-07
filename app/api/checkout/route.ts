import { quoteCheckout, type CheckoutItem, type CheckoutPiece } from "@/lib/checkout-quote";
import { getStripe } from "@/lib/stripe";

type ShippingBody = {
  name?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
};

const pieces = new Set<CheckoutPiece>(["top", "bottom", "onepiece"]);

function isItem(value: unknown): value is CheckoutItem {
  if (!value || typeof value !== "object") return false;
  const item = value as CheckoutItem;
  return typeof item.slug === "string" && pieces.has(item.piece) && typeof item.size === "string" && typeof item.qty === "number";
}

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return Response.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  let body: { items?: unknown; email?: unknown; shipping?: ShippingBody };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Check the checkout details." }, { status: 400 });
  }

  if (!Array.isArray(body.items) || !body.items.every(isItem)) {
    return Response.json({ error: "Check the pieces in your bag." }, { status: 400 });
  }

  const quote = quoteCheckout(body.items);
  if (!quote.ok) return Response.json({ error: quote.error }, { status: 400 });

  const email = typeof body.email === "string" && body.email.includes("@") ? body.email : undefined;
  const shipping = body.shipping;
  const addressReady = Boolean(shipping?.name && shipping.line1 && shipping.city && shipping.state && shipping.postalCode);

  try {
    const intent = await stripe.paymentIntents.create({
      amount: quote.amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      receipt_email: email,
      description: quote.lines.map((line) => `${line.qty}× ${line.name} (${line.piece}, ${line.size})`).join(", ").slice(0, 500),
      metadata: {
        items: quote.lines.map((line) => `${line.qty}:${line.name}:${line.piece}:${line.size}`).join("|").slice(0, 500),
      },
      shipping: addressReady
        ? {
            name: shipping!.name!,
            address: {
              line1: shipping!.line1,
              line2: shipping!.line2 || undefined,
              city: shipping!.city,
              state: shipping!.state,
              postal_code: shipping!.postalCode,
              country: "US",
            },
          }
        : undefined,
    });

    return Response.json({ clientSecret: intent.client_secret, amount: quote.amount });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not start payment.";
    return Response.json({ error: message }, { status: 400 });
  }
}

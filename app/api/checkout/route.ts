import { discountCents } from "@/lib/affiliate-math";
import { publicProducts } from "@/lib/catalog";
import { findAffiliate } from "@/lib/affiliates";
import { quoteCheckout, type CheckoutItem, type CheckoutPiece } from "@/lib/checkout-quote";
import { orderLineMetadata } from "@/lib/orders";
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

  let body: { items?: unknown; email?: unknown; shipping?: ShippingBody; news?: unknown; code?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Check the checkout details." }, { status: 400 });
  }

  if (!Array.isArray(body.items) || !body.items.every(isItem)) {
    return Response.json({ error: "Check the pieces in your bag." }, { status: 400 });
  }

  const quote = quoteCheckout(body.items, await publicProducts());
  if (!quote.ok) return Response.json({ error: quote.error }, { status: 400 });

  const code = typeof body.code === "string" ? body.code.trim() : "";
  let affiliate = null;
  if (code) {
    try {
      affiliate = await findAffiliate(code);
    } catch {
      return Response.json({ error: "Discount codes are unavailable right now." }, { status: 503 });
    }
  }
  if (code && !affiliate) return Response.json({ error: "That code isn't valid." }, { status: 400 });
  const discount = affiliate ? discountCents(quote.amount, affiliate.discountPercent) : 0;
  const amount = quote.amount - discount;
  if (amount < 50) return Response.json({ error: "This order can't be charged." }, { status: 400 });
  const commission = affiliate ? discountCents(amount, affiliate.commissionPercent) : 0;

  const email = typeof body.email === "string" && body.email.includes("@") ? body.email : undefined;
  const shipping = body.shipping;
  const addressReady = Boolean(shipping?.name && shipping.line1 && shipping.city && shipping.state && shipping.postalCode);

  try {
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      allowed_payment_method_types: ["card", "cashapp"],
      receipt_email: email,
      description: quote.lines.map((line) => `${line.qty}× ${line.name} (${line.piece}, ${line.size})`).join(", ").slice(0, 500),
      metadata: {
        ...(email ? { email } : {}),
        ...(body.news === true ? { news: "yes" } : {}),
        ...(affiliate
          ? {
              affiliate_code: affiliate.code,
              affiliate_discount_cents: String(discount),
              affiliate_commission_percent: String(affiliate.commissionPercent),
              affiliate_commission_cents: String(commission),
            }
          : {}),
        ...orderLineMetadata(quote.lines),
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

    return Response.json({ clientSecret: intent.client_secret, amount });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not start payment.";
    return Response.json({ error: message }, { status: 400 });
  }
}

import { MongoServerError } from "mongodb";
import type Stripe from "stripe";
import type { CheckoutPiece, QuotedLine } from "@/lib/checkout-quote";
import { db } from "@/lib/mongo";

const pieces = new Set<CheckoutPiece>(["top", "bottom", "onepiece"]);

export type PlacedOrder = {
  number: string;
  paymentIntentId: string;
  email: string | null;
  amount: number;
  currency: string;
  lines: QuotedLine[];
  shipping: {
    name: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  } | null;
  placedAt: string;
  ownerNotified?: boolean;
  test?: boolean;
  creator?: { code: string; discountCents: number; commissionCents: number; commissionPercent: number };
};

function orderNumber(paymentIntentId: string) {
  return `PS-${paymentIntentId.replace(/[^a-zA-Z0-9]/g, "").slice(-8).toUpperCase()}`;
}

function assertPaymentId(paymentIntentId: string) {
  if (!/^pi_[A-Za-z0-9]+$/.test(paymentIntentId)) throw new Error("Unexpected payment id.");
}

function encodeLine(line: QuotedLine) {
  const name = line.name.replaceAll("|", "/").replaceAll("\n", " ");
  return [line.slug, line.qty, line.unit, line.piece, line.size, line.preorder ? "1" : "0", name].join("|");
}

export function orderLineMetadata(lines: QuotedLine[]) {
  const encoded = lines.map(encodeLine).join("\n");
  const metadata: Record<string, string> = {};
  const size = 450;
  for (let index = 0, offset = 0; offset < encoded.length; index += 1, offset += size) {
    metadata[`lines_${index}`] = encoded.slice(offset, offset + size);
  }
  return metadata;
}

export function linesFromMetadata(metadata: Stripe.Metadata | null | undefined) {
  if (!metadata?.lines_0) return null;
  let encoded = "";
  for (let index = 0; metadata[`lines_${index}`]; index += 1) encoded += metadata[`lines_${index}`];
  const lines: QuotedLine[] = [];
  for (const row of encoded.split("\n")) {
    const [slug, qty, unit, piece, size, preorder, ...name] = row.split("|");
    const parsedQty = Number(qty);
    const parsedUnit = Number(unit);
    if (!slug || !name.length || !pieces.has(piece as CheckoutPiece) || !size) {
      throw new Error("Order details could not be read.");
    }
    if (!Number.isInteger(parsedQty) || parsedQty < 1 || !Number.isInteger(parsedUnit) || parsedUnit < 1) {
      throw new Error("Order details could not be read.");
    }
    lines.push({
      slug,
      name: name.join("|"),
      piece: piece as CheckoutPiece,
      size,
      qty: parsedQty,
      unit: parsedUnit,
      preorder: preorder === "1",
    });
  }
  return lines.length ? lines : null;
}

async function orders() {
  return (await db()).collection<PlacedOrder>("orders");
}

async function readOrder(paymentIntentId: string) {
  assertPaymentId(paymentIntentId);
  return orders().then((collection) => collection.findOne({ paymentIntentId }, { projection: { _id: 0 } }));
}

function shippingFrom(intent: Stripe.PaymentIntent): PlacedOrder["shipping"] {
  const address = intent.shipping?.address;
  if (!intent.shipping?.name || !address?.line1 || !address.city || !address.state || !address.postal_code) return null;
  return {
    name: intent.shipping.name,
    line1: address.line1,
    line2: address.line2 ?? "",
    city: address.city,
    state: address.state,
    postalCode: address.postal_code,
    country: address.country ?? "US",
  };
}

export async function placePaidOrder(stripe: Stripe, intent: Stripe.PaymentIntent) {
  if (intent.status !== "succeeded") throw new Error("Payment has not succeeded.");
  const lines = linesFromMetadata(intent.metadata);
  if (!lines) throw new Error("This payment has no order details.");
  const catalog = lines.reduce((sum, line) => sum + line.unit * line.qty * 100, 0);
  const discount = Number(intent.metadata.affiliate_discount_cents || 0);
  const off = Number.isInteger(discount) && discount > 0 && discount < catalog ? discount : 0;
  if (catalog - off !== intent.amount) throw new Error("The paid amount does not match the order.");

  const existing = await readOrder(intent.id);
  const order: PlacedOrder = existing ?? {
    number: orderNumber(intent.id),
    paymentIntentId: intent.id,
    email: intent.receipt_email || intent.metadata.email || null,
    amount: intent.amount,
    currency: intent.currency,
    lines,
    shipping: shippingFrom(intent),
    placedAt: new Date().toISOString(),
    test: intent.livemode === false,
  };

  if (!existing) {
    await (await orders()).insertOne({ ...order }).catch((error: unknown) => {
      if (!(error instanceof MongoServerError) || error.code !== 11000) throw error;
    });
  } else if (existing.test === undefined) {
    await (await orders()).updateOne({ paymentIntentId: intent.id }, { $set: { test: intent.livemode === false } });
  }

  if (intent.metadata.order_status !== "placed" || intent.metadata.order_number !== order.number) {
    await stripe.paymentIntents.update(intent.id, {
      metadata: { order_status: "placed", order_number: order.number },
    });
  }

  return (await readOrder(intent.id)) ?? order;
}

export async function saveOrderCreator(paymentIntentId: string, creator: NonNullable<PlacedOrder["creator"]>) {
  assertPaymentId(paymentIntentId);
  await (await orders()).updateOne({ paymentIntentId }, { $set: { creator } });
}

export async function listOrders() {
  return (await orders()).find({}, { projection: { _id: 0 } }).sort({ placedAt: -1 }).limit(80).toArray();
}

export async function markOwnerNotified(paymentIntentId: string) {
  assertPaymentId(paymentIntentId);
  const order = await readOrder(paymentIntentId);
  if (!order || order.ownerNotified) return order;
  await (await orders()).updateOne({ paymentIntentId }, { $set: { ownerNotified: true } });
  return { ...order, ownerNotified: true };
}

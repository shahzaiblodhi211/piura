import { recordCommission } from "@/lib/affiliates";
import { mailConfigured, notifyOwner } from "@/lib/mail";
import { markOwnerNotified, placePaidOrder, saveOrderCreator, type PlacedOrder } from "@/lib/orders";
import type Stripe from "stripe";

function money(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function orderText(order: PlacedOrder, news: boolean) {
  const pieces = order.lines
    .map((line) => `${line.qty}× ${line.name} · ${line.piece} · ${line.size} · ${money(line.unit * 100)}${line.preorder ? " · preorder" : ""}`)
    .join("\n");
  const ship = order.shipping
    ? [order.shipping.name, order.shipping.line1, order.shipping.line2, `${order.shipping.city}, ${order.shipping.state} ${order.shipping.postalCode}`, order.shipping.country]
        .filter(Boolean)
        .join("\n")
    : "No shipping address";
  const creator = order.creator
    ? ["", `Creator code: ${order.creator.code}`, `Follower discount: ${money(order.creator.discountCents)}`, `Commission: ${money(order.creator.commissionCents)} (${order.creator.commissionPercent}%)`].join("\n")
    : "";
  const mode = order.test ? "Stripe test mode" : "Live";
  return [`Order ${order.number}`, mode, `Customer: ${order.email || "No email"}`, `News: ${news ? "yes" : "no"}`, `Total: ${money(order.amount)}`, creator, "", "Ship to:", ship, "", "Pieces:", pieces].join("\n");
}

export async function fulfillPayment(stripe: Stripe, intent: Stripe.PaymentIntent) {
  if (intent.status !== "succeeded" || !intent.metadata?.lines_0) return null;
  const order = await placePaidOrder(stripe, intent);
  const commissionPercent = Number(intent.metadata.affiliate_commission_percent);
  const discount = Number(intent.metadata.affiliate_discount_cents);
  const commission = Number(intent.metadata.affiliate_commission_cents);
  if (intent.metadata.affiliate_code && Number.isInteger(commissionPercent)) {
    order.creator = { code: intent.metadata.affiliate_code, discountCents: discount, commissionCents: commission, commissionPercent };
    await saveOrderCreator(intent.id, order.creator);
    await recordCommission({
      paymentIntentId: intent.id,
      orderNumber: order.number,
      code: intent.metadata.affiliate_code,
      saleCents: intent.amount,
      discountCents: discount,
      commissionPercent,
      placedAt: order.placedAt,
    });
  }
  if (!order.ownerNotified && mailConfigured()) {
    try {
      await notifyOwner({
        subject: `Order ${order.number} placed`,
        replyTo: order.email || undefined,
        text: orderText(order, intent.metadata.news === "yes"),
      });
      await markOwnerNotified(intent.id);
    } catch (error) {
      console.error("Order email failed.", error instanceof Error ? error.message : error);
    }
  }
  return order;
}

export async function importSucceededPayments(stripe: Stripe) {
  let found = 0;
  let placed = 0;
  let startingAfter: string | undefined;
  for (let page = 0; page < 10; page += 1) {
    const list = await stripe.paymentIntents.list({ limit: 100, starting_after: startingAfter });
    for (const intent of list.data) {
      if (intent.status !== "succeeded" || !intent.metadata?.lines_0) continue;
      found += 1;
      try {
        const order = await fulfillPayment(stripe, intent);
        if (order) placed += 1;
      } catch (error) {
        console.error(intent.id, error instanceof Error ? error.message : error);
      }
    }
    if (!list.has_more || !list.data.length) break;
    startingAfter = list.data[list.data.length - 1]?.id;
  }
  return { found, placed };
}

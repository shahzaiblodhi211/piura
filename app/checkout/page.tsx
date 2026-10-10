import { CheckoutForm } from "@/components/checkout-form";
import { PageShell } from "@/components/page-shell";
import { publicProducts } from "@/lib/catalog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout — Piura Swim",
  description: "Review your bag and pay with Stripe.",
};

export default async function CheckoutPage() {
  const catalog = await publicProducts();
  return (
    <PageShell>
      <CheckoutForm catalog={catalog} />
    </PageShell>
  );
}

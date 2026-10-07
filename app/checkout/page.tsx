import { CheckoutForm } from "@/components/checkout-form";
import { PageShell } from "@/components/page-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout — Piura Swim",
  description: "Review your bag and pay with Stripe.",
};

export default function CheckoutPage() {
  return (
    <PageShell>
      <CheckoutForm />
    </PageShell>
  );
}

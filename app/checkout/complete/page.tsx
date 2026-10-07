import { CheckoutComplete } from "@/components/checkout-complete";
import { PageShell } from "@/components/page-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout — Piura Swim",
};

export default function CheckoutCompletePage() {
  return (
    <PageShell>
      <CheckoutComplete />
    </PageShell>
  );
}

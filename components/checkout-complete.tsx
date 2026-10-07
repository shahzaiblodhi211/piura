"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { useCart } from "@/lib/cart";

export function CheckoutComplete() {
  const { clear } = useCart();
  const [status, setStatus] = useState<"loading" | "paid" | "processing" | "failed">("loading");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const clientSecret = params.get("payment_intent_client_secret");
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!clientSecret || !key) {
      setStatus("failed");
      return;
    }
    let cancel = false;
    loadStripe(key).then(async (stripe) => {
      if (!stripe || cancel) return;
      const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
      if (cancel) return;
      if (paymentIntent?.status === "succeeded") {
        clear();
        setStatus("paid");
      } else if (paymentIntent?.status === "processing") {
        clear();
        setStatus("processing");
      } else {
        setStatus("failed");
      }
    });
    return () => {
      cancel = true;
    };
  }, [clear]);

  const copy =
    status === "paid"
      ? "Payment received. Stripe will email your receipt."
      : status === "processing"
        ? "Your payment is processing. We'll email you when it clears."
        : status === "failed"
          ? "That payment didn't go through."
          : "Confirming payment…";

  return (
    <main className="mx-auto w-full max-w-[1560px] px-5 py-16 sm:px-8 sm:py-20 md:px-12 lg:px-16 xl:px-20">
      <p className="font-serif text-[16px] text-body sm:text-[18px]">Checkout</p>
      <h1 className="mt-3 font-bebas text-[40px] leading-none text-olive sm:text-[56px]">
        {status === "failed" ? "Payment incomplete" : "Thank you"}
      </h1>
      <p className="mt-5 max-w-[520px] font-serif text-[16px] leading-7 text-body sm:text-[18px] sm:leading-8">{copy}</p>
      <Link
        href={status === "failed" ? "/checkout" : "/shop"}
        className="mt-8 inline-flex h-14 items-center justify-center bg-olive px-8 font-bebas text-[22px] tracking-[0.08em] text-cream"
      >
        {status === "failed" ? "Back to checkout" : "Continue shopping"}
      </Link>
    </main>
  );
}

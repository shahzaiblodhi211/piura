"use client";

import { useMemo, useState, type ReactNode } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import type { CheckoutItem } from "@/lib/checkout-quote";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

type Shipping = {
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
};

function StripeFields({
  items,
  amount,
  email,
  shipping,
  news,
  code,
  canPay,
  onPaid,
  children,
}: {
  items: CheckoutItem[];
  amount: number;
  email: string;
  shipping: Shipping | null;
  news: boolean;
  code: string;
  canPay: boolean;
  onPaid: (orderNumber?: string) => void;
  children: (payment: ReactNode) => ReactNode;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function pay() {
    if (!stripe || !elements) throw new Error("Stripe is still loading.");
    const { error: submitError } = await elements.submit();
    if (submitError) throw new Error(submitError.message || "Check the payment details.");

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, email, shipping, news, code }),
    });
    const data = (await response.json()) as { clientSecret?: string; amount?: number; error?: string };
    if (!response.ok || !data.clientSecret) throw new Error(data.error || "Could not start payment.");
    if (data.amount !== amount) throw new Error("The total changed. Refresh and try again.");

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret: data.clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/complete`,
        payment_method_data: {
          billing_details: {
            name: shipping?.name,
            email,
            address: shipping
              ? {
                  line1: shipping.line1,
                  line2: shipping.line2 || undefined,
                  city: shipping.city,
                  state: shipping.state,
                  postal_code: shipping.postalCode,
                  country: "US",
                }
              : { country: "US" },
          },
        },
      },
      redirect: "if_required",
    });
    if (confirmError) throw new Error(confirmError.message || "Payment failed.");
    if (paymentIntent?.status !== "succeeded" && paymentIntent?.status !== "processing") {
      throw new Error("Payment failed.");
    }
    const saved = await fetch("/api/checkout/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientSecret: data.clientSecret }),
    });
    const placed = (await saved.json()) as { number?: string; error?: string; status?: string };
    if (!saved.ok) throw new Error(placed.error || "Payment went through, but the order was not saved.");
    onPaid(placed.number);
  }

  return children(
    <>
      <div className="mt-4 border border-olive bg-white p-4 sm:p-5">
        <PaymentElement
          options={{
            layout: { type: "tabs" },
            paymentMethodOrder: ["card", "cashapp"],
            wallets: { applePay: "never", googlePay: "never", link: "never" },
            fields: {
              billingDetails: {
                name: "never",
                email: "never",
                address: "never",
              },
            },
          }}
        />
      </div>
      <button
        type="button"
        disabled={!canPay || busy || !stripe}
        onClick={async () => {
          setError("");
          setBusy(true);
          try {
            await pay();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Payment failed.");
          } finally {
            setBusy(false);
          }
        }}
        className="mt-6 flex h-14 w-full items-center justify-center bg-olive font-bebas text-[22px] tracking-[0.08em] text-cream disabled:bg-olive/30 sm:h-[64px] sm:text-[24px]"
      >
        {busy ? "Paying" : "Pay now"}
      </button>
      {error ? <p className="mt-3 font-serif text-[15px] leading-6 text-[#8a1c1c]">{error}</p> : null}
      <p className="mt-4 font-serif text-[14px] leading-6 text-body">
        {publishableKey?.startsWith("pk_test_")
          ? "Stripe is in test mode. Use card 4242 4242 4242 4242, any future date, and any CVC."
          : "Payments are processed by Stripe. Card numbers never touch this site."}
      </p>
    </>,
  );
}

export function StripeCheckout({
  amount,
  items,
  email,
  shipping,
  news,
  code,
  canPay,
  onPaid,
  children,
}: {
  amount: number;
  items: CheckoutItem[];
  email: string;
  shipping: Shipping | null;
  news: boolean;
  code: string;
  canPay: boolean;
  onPaid: (orderNumber?: string) => void;
  children: (payment: ReactNode) => ReactNode;
}) {
  const options = useMemo(
    () => ({
      mode: "payment" as const,
      amount,
      currency: "usd",
      allowedPaymentMethodTypes: ["card", "cashapp"],
      appearance: {
        theme: "stripe" as const,
        variables: { colorPrimary: "#353524", borderRadius: "0px", colorText: "#353524", colorBackground: "#ffffff" },
      },
    }),
    [amount],
  );

  if (!stripePromise) {
    return children(
      <button type="button" disabled className="mt-6 flex h-14 w-full items-center justify-center bg-olive/30 font-bebas text-[22px] tracking-[0.08em] text-cream sm:h-[64px]">
        Pay now
      </button>,
    );
  }

  return (
    <Elements key={amount} stripe={stripePromise} options={options}>
      <StripeFields items={items} amount={amount} email={email} shipping={shipping} news={news} code={code} canPay={canPay} onPaid={onPaid}>
        {children}
      </StripeFields>
    </Elements>
  );
}

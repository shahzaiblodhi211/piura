"use client";

import { useMemo, useState, type ReactNode } from "react";
import { loadStripe, type StripeExpressCheckoutElementConfirmEvent } from "@stripe/stripe-js";
import { Elements, ExpressCheckoutElement, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import type { CheckoutItem } from "@/lib/checkout-quote";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

export const stripeConfigured = Boolean(stripePromise);

type Shipping = {
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
};

function shippingRate(amount: number) {
  const free = amount >= 10000;
  return [{ id: free ? "free" : "standard", displayName: free ? "Free shipping" : "Standard", amount: 0 }];
}

function StripeFields({
  items,
  amount,
  email,
  shipping,
  canPay,
  onPaid,
  children,
}: {
  items: CheckoutItem[];
  amount: number;
  email: string;
  shipping: Shipping | null;
  canPay: boolean;
  onPaid: () => void;
  children: (slots: { express: ReactNode; payment: ReactNode }) => ReactNode;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [wallets, setWallets] = useState<boolean | null>(null);

  async function pay(express?: StripeExpressCheckoutElementConfirmEvent) {
    if (!stripe || !elements) throw new Error("Stripe is still loading.");
    const { error: submitError } = await elements.submit();
    if (submitError) throw new Error(submitError.message || "Check the payment details.");

    const walletShipping = express?.shippingAddress;
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        email: express?.billingDetails?.email || email,
        shipping: walletShipping
          ? {
              name: walletShipping.name,
              line1: walletShipping.address.line1,
              line2: walletShipping.address.line2 ?? "",
              city: walletShipping.address.city,
              state: walletShipping.address.state,
              postalCode: walletShipping.address.postal_code,
            }
          : shipping,
      }),
    });
    const data = (await response.json()) as { clientSecret?: string; amount?: number; error?: string };
    if (!response.ok || !data.clientSecret) throw new Error(data.error || "Could not start payment.");
    if (data.amount !== amount) throw new Error("The total changed. Refresh and try again.");

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret: data.clientSecret,
      confirmParams: { return_url: `${window.location.origin}/checkout/complete` },
      redirect: "if_required",
    });
    if (confirmError) throw new Error(confirmError.message || "Payment failed.");
    if (paymentIntent?.status === "succeeded" || paymentIntent?.status === "processing") onPaid();
  }

  const express = (
    <div className="mt-3">
      <ExpressCheckoutElement
        onClick={(event) => event.resolve({ shippingRates: shippingRate(amount) })}
        onConfirm={async (event) => {
          setError("");
          setBusy(true);
          try {
            await pay(event);
          } catch (err) {
            const message = err instanceof Error ? err.message : "Payment failed.";
            event.paymentFailed({ message });
            setError(message);
          } finally {
            setBusy(false);
          }
        }}
        onShippingAddressChange={(event) => event.resolve({ shippingRates: shippingRate(amount) })}
        onShippingRateChange={(event) => event.resolve()}
        onAvailablePaymentMethodsChange={(event) => {
          const methods = event.paymentMethods;
          setWallets(Boolean(methods && Object.values(methods).some((method) => method?.available)));
        }}
        options={{
          emailRequired: true,
          shippingAddressRequired: true,
          allowedShippingCountries: ["US"],
          buttonHeight: 48,
          business: { name: "Piura Swim" },
          layout: { maxColumns: 1, maxRows: 3, overflow: "never" },
          paymentMethods: { applePay: "auto", googlePay: "auto", link: "auto", paypal: "auto", amazonPay: "never", klarna: "never" },
        }}
      />
      {wallets === false ? (
        <p className="mt-2 text-center font-serif text-[14px] leading-6 text-body">Apple Pay, Google Pay, and Link show here when this browser has them saved.</p>
      ) : null}
    </div>
  );

  const payment = (
    <>
      <div className="mt-4 border border-olive bg-white p-4 sm:p-5">
        <PaymentElement options={{ layout: "tabs", wallets: { applePay: "never", googlePay: "never" } }} />
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
      <p className="mt-4 font-serif text-[14px] leading-6 text-body">Payments are processed by Stripe. Card numbers never touch this site.</p>
    </>
  );

  return children({ express, payment });
}

export function StripeCheckout({
  amount,
  items,
  email,
  shipping,
  canPay,
  onPaid,
  children,
}: {
  amount: number;
  items: CheckoutItem[];
  email: string;
  shipping: Shipping | null;
  canPay: boolean;
  onPaid: () => void;
  children: (slots: { express: ReactNode; payment: ReactNode }) => ReactNode;
}) {
  const options = useMemo(
    () => ({
      mode: "payment" as const,
      amount,
      currency: "usd",
      appearance: {
        theme: "stripe" as const,
        variables: { colorPrimary: "#353524", borderRadius: "0px", colorText: "#353524", colorBackground: "#ffffff" },
      },
    }),
    [amount],
  );

  if (!stripePromise) {
    return children({
      express: (
        <p className="mt-4 border border-olive/20 bg-cream px-4 py-4 text-center font-serif text-[15px] leading-6 text-body">
          Add your Stripe keys to turn on Apple Pay, Google Pay, Link, and cards.
        </p>
      ),
      payment: (
        <button type="button" disabled className="mt-6 flex h-14 w-full items-center justify-center bg-olive/30 font-bebas text-[22px] tracking-[0.08em] text-cream sm:h-[64px]">
          Pay now
        </button>
      ),
    });
  }

  return (
    <Elements key={amount} stripe={stripePromise} options={options}>
      <StripeFields items={items} amount={amount} email={email} shipping={shipping} canPay={canPay} onPaid={onPaid}>
        {children}
      </StripeFields>
    </Elements>
  );
}

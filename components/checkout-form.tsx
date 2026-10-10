"use client";

import { FormEvent, useState, type ReactNode } from "react";
import Link from "next/link";
import { pieceLabel, useCart } from "@/lib/cart";
import { discountCents } from "@/lib/affiliate-math";
import { quoteCheckout } from "@/lib/checkout-quote";
import type { Product } from "@/lib/products";
import { FieldMenu } from "@/components/field-menu";
import { StripeCheckout } from "@/components/stripe-pay";

const countries = [{ value: "US", label: "United States" }];

const states = [
  ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"], ["CA", "California"],
  ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"], ["DC", "District of Columbia"], ["FL", "Florida"],
  ["GA", "Georgia"], ["HI", "Hawaii"], ["ID", "Idaho"], ["IL", "Illinois"], ["IN", "Indiana"],
  ["IA", "Iowa"], ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"], ["ME", "Maine"],
  ["MD", "Maryland"], ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"], ["MS", "Mississippi"],
  ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"], ["NV", "Nevada"], ["NH", "New Hampshire"],
  ["NJ", "New Jersey"], ["NM", "New Mexico"], ["NY", "New York"], ["NC", "North Carolina"], ["ND", "North Dakota"],
  ["OH", "Ohio"], ["OK", "Oklahoma"], ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"],
  ["SC", "South Carolina"], ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"], ["UT", "Utah"],
  ["VT", "Vermont"], ["VA", "Virginia"], ["WA", "Washington"], ["WV", "West Virginia"], ["WI", "Wisconsin"],
  ["WY", "Wyoming"],
].map(([value, label]) => ({ value, label }));

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

function prettySize(size: string) {
  return size.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const field =
  "piura-field h-14 w-full border border-olive bg-white px-4 font-serif text-[16px] text-olive outline-none placeholder:text-olive/45 focus:outline-none sm:px-[22px] sm:text-[17px]";

export function CheckoutForm({ catalog }: { catalog: Product[] }) {
  const { lines, total, clear } = useCart();
  const [placed, setPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [code, setCode] = useState("");
  const [codeNote, setCodeNote] = useState("");
  const [codeBusy, setCodeBusy] = useState(false);
  const [deal, setDeal] = useState<{ code: string; discountPercent: number } | null>(null);
  const [canPay, setCanPay] = useState(false);
  const [email, setEmail] = useState("");
  const [news, setNews] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [apartment, setApartment] = useState("");
  const [country, setCountry] = useState("US");
  const [address, setAddress] = useState({ line: "", city: "", state: "", zip: "" });
  const addressReady = Boolean(address.line && address.city && address.state && address.zip);
  const shippingFree = addressReady && total >= 130;
  const count = lines.reduce((sum, line) => sum + line.qty, 0);
  const items = lines.map((line) => ({ slug: line.slug, piece: line.piece, size: line.size, qty: line.qty }));
  const quote = quoteCheckout(items, catalog);
  const off = quote.ok && deal ? discountCents(quote.amount, deal.discountPercent) : 0;
  const due = quote.ok ? quote.amount - off : 0;

  async function applyCode() {
    const next = code.trim();
    if (!next) {
      setDeal(null);
      setCodeNote("");
      return;
    }
    setCodeBusy(true);
    setCodeNote("");
    try {
      const response = await fetch("/api/affiliate/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: next }),
      });
      const data = (await response.json()) as { code?: string; discountPercent?: number; error?: string };
      if (!response.ok || !data.code || !data.discountPercent) {
        setDeal(null);
        setCodeNote(data.error || "That code isn't valid.");
        return;
      }
      setDeal({ code: data.code, discountPercent: data.discountPercent });
    } catch {
      setDeal(null);
      setCodeNote("Could not check that code. Try again.");
    } finally {
      setCodeBusy(false);
    }
  }
  const shipping =
    addressReady && lastName
      ? {
          name: [firstName, lastName].filter(Boolean).join(" "),
          line1: address.line,
          line2: apartment,
          city: address.city,
          state: address.state,
          postalCode: address.zip,
        }
      : null;

  function paid(number?: string) {
    setOrderNumber(number ?? "");
    setPlaced(true);
    clear();
  }

  if (lines.length === 0 && !placed) {
    return (
      <main className="mx-auto w-full max-w-[1560px] px-5 py-16 sm:px-8 sm:py-20 md:px-12 lg:px-16 xl:px-20">
        <p className="font-serif text-[16px] text-body sm:text-[18px]">Bag</p>
        <h1 className="mt-3 font-bebas text-[40px] leading-none text-olive sm:text-[56px]">Checkout</h1>
        <p className="mt-5 font-serif text-[16px] leading-7 text-body sm:text-[18px]">Your bag is empty.</p>
        <Link href="/shop" className="mt-8 inline-flex h-14 items-center justify-center bg-olive px-8 font-bebas text-[22px] tracking-[0.08em] text-cream">
          Shop all swim
        </Link>
      </main>
    );
  }

  function layout(payment: ReactNode) {
    return (
      <>
        <div className="order-2 min-w-0 lg:order-1">
          <h2 className="font-bebas text-[28px] leading-none tracking-[0.04em] text-olive sm:text-[32px]">Contact</h2>
          <input
            name="email"
            type="email"
            required
            placeholder="Email or mobile phone number"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={`${field} mt-3`}
          />
          <label className="group mt-3 flex items-center gap-3 font-serif text-[15px] text-body sm:text-[16px]">
            <span className="relative grid size-4 shrink-0 place-items-center border border-olive bg-white group-has-[:checked]:bg-olive">
              <input type="checkbox" name="news" checked={news} onChange={(event) => setNews(event.target.checked)} className="absolute inset-0 cursor-pointer opacity-0" />
              <svg viewBox="0 0 16 16" aria-hidden className="pointer-events-none hidden size-3.5 text-white group-has-[:checked]:block">
                <path d="M3.2 8.2 6.4 11.4 12.8 4.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </span>
            Email me with news and offers
          </label>

          <h2 className="mt-10 font-bebas text-[28px] leading-none tracking-[0.04em] text-olive sm:text-[32px]">Delivery</h2>
          <label className="mt-4 block font-serif text-[14px] text-body">
            Country/Region
            <span className="mt-1 block">
              <FieldMenu name="country" value={country} placeholder="Country" options={countries} onChange={setCountry} required />
            </span>
          </label>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input name="firstName" placeholder="First name" value={firstName} onChange={(event) => setFirstName(event.target.value)} className={field} />
            <input
              name="lastName"
              required
              placeholder="Last name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              className={field}
            />
          </div>
          <input
            name="address"
            required
            placeholder="Address"
            value={address.line}
            onChange={(event) => setAddress((current) => ({ ...current, line: event.target.value }))}
            className={`${field} mt-3`}
          />
          <input
            name="apartment"
            placeholder="Apartment, suite, etc. (optional)"
            value={apartment}
            onChange={(event) => setApartment(event.target.value)}
            className={`${field} mt-3`}
          />
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(9rem,1fr)_8.5rem]">
            <input
              name="city"
              required
              placeholder="City"
              value={address.city}
              onChange={(event) => setAddress((current) => ({ ...current, city: event.target.value }))}
              className={field}
            />
            <FieldMenu
              name="state"
              required
              value={address.state}
              placeholder="State"
              options={states}
              onChange={(state) => setAddress((current) => ({ ...current, state }))}
            />
            <input
              name="zip"
              required
              placeholder="ZIP code"
              value={address.zip}
              onChange={(event) => setAddress((current) => ({ ...current, zip: event.target.value }))}
              className={field}
            />
          </div>

          <h2 className="mt-10 font-bebas text-[28px] leading-none tracking-[0.04em] text-olive sm:text-[32px]">Shipping method</h2>
          {addressReady && shippingFree ? (
            <label className="mt-4 flex items-center justify-between border border-olive px-4 py-4 font-serif text-[16px] text-olive">
              <span className="flex items-center gap-3">
                <input type="radio" checked readOnly className="size-4 shrink-0 appearance-none rounded-full border border-olive bg-white checked:border-[5px] checked:border-olive checked:bg-cream" />
                Standard
              </span>
              <span>Free</span>
            </label>
          ) : (
            <p className="mt-4 border border-olive/15 bg-cream px-4 py-4 text-center font-serif text-[15px] leading-6 text-body sm:text-[16px]">
              {addressReady ? "Free shipping on US orders over $130." : "Enter your shipping address to view available shipping methods."}
            </p>
          )}

          <h2 className="mt-10 font-bebas text-[28px] leading-none tracking-[0.04em] text-olive sm:text-[32px]">Payment</h2>
          <p className="mt-2 font-serif text-[15px] leading-6 text-body sm:text-[16px]">All transactions are secure and encrypted.</p>
          {payment}
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 font-serif text-[15px] text-olive underline">
            <Link href="/privacy">Privacy policy</Link>
            <Link href="/terms">Terms of service</Link>
          </div>
        </div>
        <aside className="order-1 h-fit min-w-0 bg-cream p-5 sm:p-6 lg:sticky lg:top-6 lg:order-2">
          <h2 className="font-bebas text-[28px] leading-none tracking-[0.04em] text-olive">Your bag</h2>
          <ul className="mt-4">
            {lines.map((line) => (
              <li key={line.id} className="flex items-center gap-3 border-b border-olive/10 py-4 sm:gap-4">
                <span className="relative size-16 shrink-0 sm:size-[72px]">
                  <img src={line.src} alt="" className="size-16 object-cover object-[center_18%] sm:size-[72px]" />
                  <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-olive font-serif text-[12px] text-cream">
                    {line.qty}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bebas text-[18px] leading-[1.05] tracking-[0.04em] text-olive uppercase sm:text-[20px]">{line.name}</span>
                  <span className="mt-1.5 block font-serif text-[14px] leading-5 text-body">
                    {prettySize(line.size)}
                    {line.preorder ? ` · ${pieceLabel(line.piece)} · Preorder` : ""}
                  </span>
                </span>
                <span className="shrink-0 font-serif text-[15px] text-olive sm:text-[16px]">{money(line.price * line.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex gap-2">
            <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Discount code" className={`${field} min-w-0`} />
            <button
              type="button"
              disabled={codeBusy}
              onClick={() => void applyCode()}
              className="h-14 shrink-0 bg-olive px-4 font-bebas text-[18px] tracking-[0.08em] text-cream disabled:opacity-60 sm:px-5"
            >
              {codeBusy ? "..." : "Apply"}
            </button>
          </div>
          {deal ? <p className="mt-2 font-serif text-[14px] text-olive">{deal.code} takes {deal.discountPercent}% off.</p> : null}
          {codeNote ? <p className="mt-2 font-serif text-[14px] text-[#8a1c1c]">{codeNote}</p> : null}
          <dl className="mt-6 space-y-3 font-serif text-[15px] text-olive sm:text-[16px]">
            <div className="flex justify-between gap-4">
              <dt>
                Subtotal · {count} {count === 1 ? "item" : "items"}
              </dt>
              <dd className="shrink-0">{money(total)}</dd>
            </div>
            {off > 0 ? (
              <div className="flex justify-between gap-4">
                <dt>Discount</dt>
                <dd className="shrink-0">−{money(off / 100)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4 text-body">
              <dt>Shipping</dt>
              <dd className="shrink-0 text-right">{shippingFree ? "Free" : addressReady ? "Free over $130" : "Enter shipping address"}</dd>
            </div>
          </dl>
          <div className="mt-5 flex items-end justify-between gap-4 border-t border-olive/15 pt-4">
            <span className="font-bebas text-[28px] leading-none tracking-[0.04em] text-olive">Total</span>
            <span className="text-right">
              <span className="mr-2 font-serif text-[12px] tracking-[0.08em] text-body">USD</span>
              <span className="font-bebas text-[32px] leading-none text-olive">{money(quote.ok ? due / 100 : total)}</span>
            </span>
          </div>
        </aside>
      </>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1560px] px-5 py-10 sm:px-8 sm:py-14 md:px-12 lg:px-16 lg:py-16 xl:px-20">
      {placed ? (
        <div className="max-w-[640px]">
          <p className="font-serif text-[16px] text-body sm:text-[18px]">Checkout</p>
          <h1 className="mt-3 font-bebas text-[40px] leading-none text-olive sm:text-[56px]">Thank you</h1>
          <p className="mt-5 font-serif text-[16px] leading-7 text-body sm:text-[18px] sm:leading-8">
            {orderNumber ? `Payment received. Order ${orderNumber} is in the studio.` : "Payment received. Stripe will email your receipt."}
          </p>
          <Link href="/shop" className="mt-8 inline-flex h-14 items-center justify-center bg-olive px-8 font-bebas text-[22px] tracking-[0.08em] text-cream">
            Continue shopping
          </Link>
        </div>
      ) : (
        <>
          <p className="font-serif text-[16px] text-body sm:text-[18px]">Bag</p>
          <h1 className="mt-3 font-bebas text-[40px] leading-none text-olive sm:text-[56px] lg:text-[64px]">Checkout</h1>
          <form
            onSubmit={(event: FormEvent) => event.preventDefault()}
            onChange={(event: FormEvent<HTMLFormElement>) => setCanPay(event.currentTarget.checkValidity())}
            className="mt-8 grid grid-cols-1 gap-10 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] lg:items-start lg:gap-12 xl:grid-cols-[minmax(0,1fr)_420px] xl:gap-16"
          >
          {quote.ok ? (
            <StripeCheckout items={items} amount={due} email={email} shipping={shipping} news={news} code={deal?.code ?? ""} canPay={canPay} onPaid={paid}>
              {(payment) => layout(payment)}
            </StripeCheckout>
          ) : (
            layout(<p className="mt-4 font-serif text-[15px] leading-6 text-[#8a1c1c]">{quote.error}</p>)
          )}
          </form>
        </>
      )}
    </main>
  );
}

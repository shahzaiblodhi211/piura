"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { money, panel, useAdmin, useToast } from "@/components/admin-ui";
import { ShimmerImage } from "@/components/shimmer-image";
import { findInCatalog, productPath, type Product } from "@/lib/products";
import type { PlacedOrder } from "@/lib/orders";

const pieceLabel = { top: "Top", bottom: "Bottom", onepiece: "One-piece" };

function dollars(amount: number) {
  return Number.isInteger(amount) ? `$${amount}` : `$${amount.toFixed(2)}`;
}

export function AdminOrders() {
  const { call } = useAdmin();
  const toast = useToast();
  const [orders, setOrders] = useState<PlacedOrder[] | null>(null);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [testMode, setTestMode] = useState(false);

  useEffect(() => {
    let live = true;
    Promise.all([call({ action: "orders" }), call({ action: "products" })])
      .then(([ordersData, productsData]) => {
        if (!live) return;
        setOrders((ordersData.orders as PlacedOrder[]) ?? []);
        setCatalog((productsData.products as Product[]) ?? []);
        setTestMode(ordersData.testMode === true);
      })
      .catch((err: unknown) => {
        if (!live) return;
        setOrders([]);
        toast(err instanceof Error ? err.message : "Could not load orders.", "bad");
      });
    return () => {
      live = false;
    };
  }, [call, toast]);

  return (
    <section>
      <p className="font-serif text-[13px] tracking-[0.18em] text-brown uppercase">Sales</p>
      <h1 className="mt-1 font-bebas text-[40px] leading-none text-olive sm:text-[52px]">Orders</h1>
      {testMode ? <p className="mt-3 max-w-xl font-serif text-[15px] leading-6 text-body">Stripe is in test mode. A successful test card is saved here right away. These are not real charges.</p> : null}
      {orders === null ? (
        <div className="mt-6 grid gap-4">
          {Array.from({ length: 2 }, (_, index) => (
            <div key={index} className="border border-[#e6dfd8] bg-white p-4 sm:p-6">
              <div className="piura-shimmer h-8 w-40" />
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="piura-shimmer aspect-[3/4]" />
                <div className="piura-shimmer aspect-[3/4]" />
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {orders?.length === 0 ? (
        <div className="mt-6 border border-dashed border-olive/20 bg-white px-6 py-16 text-center">
          <p className="font-bebas text-[32px] text-olive">No orders yet</p>
          <p className="mx-auto mt-2 max-w-sm font-serif text-[15px] leading-6 text-body">{testMode ? "Pay at checkout with 4242 4242 4242 4242. The order shows up here as soon as the card succeeds." : "Paid orders appear here after Stripe confirms the payment."}</p>
        </div>
      ) : null}
      {orders && orders.length > 0 ? (
        <ul className="mt-6 grid gap-4">
          {orders.map((order) => (
            <li key={order.paymentIntentId} className={panel}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bebas text-[28px] leading-none text-olive sm:text-[32px]">{order.number}</p>
                    {order.test ? <span className="bg-olive px-2 py-1 font-bebas text-[13px] tracking-[0.08em] text-cream">Test</span> : null}
                  </div>
                  <p className="mt-2 font-serif text-[14px] text-body">{new Date(order.placedAt).toLocaleString()} · {order.email || "No email"}</p>
                </div>
                <p className="font-bebas text-[28px] leading-none text-ink">{money(order.amount)}</p>
              </div>
              {order.creator ? <p className="mt-3 inline-flex bg-cream px-3 py-1.5 font-serif text-[13px] text-olive">Code {order.creator.code} · commission {money(order.creator.commissionCents)}</p> : null}
              <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {order.lines.map((line) => {
                  const product = findInCatalog(catalog, line.slug);
                  const href = product ? `/admin/products/${productPath(product)}` : "/admin/products";
                  return (
                    <li key={`${line.slug}-${line.piece}-${line.size}`}>
                      <Link href={href} className="group block border border-[#e6dfd8] bg-cream">
                        <span className="relative block aspect-[3/4] overflow-hidden bg-[#efeae4]">
                          {product?.src ? <ShimmerImage src={product.src} alt="" className="size-full object-cover object-[center_18%] transition duration-500 group-hover:scale-[1.03]" /> : <span className="piura-shimmer absolute inset-0" />}
                          <span className="absolute top-2 left-2 flex flex-col items-start gap-1">
                            <span className="bg-olive px-2 py-1 font-bebas text-[12px] tracking-[0.08em] text-cream">{line.qty > 1 ? `${line.qty} × ${line.size}` : line.size}</span>
                            {line.preorder ? <span className="bg-white px-2 py-1 font-bebas text-[12px] tracking-[0.08em] text-olive">Preorder</span> : null}
                          </span>
                        </span>
                        <span className="block px-3 py-3 sm:px-4 sm:py-4">
                          <span className="block font-bebas text-[16px] leading-[1.05] tracking-[0.04em] text-ink uppercase sm:text-[18px]">{line.name}</span>
                          <span className="mt-2 block font-serif text-[13px] text-olive sm:text-[14px]">{pieceLabel[line.piece]} · {dollars(line.unit)}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              {order.shipping ? (
                <p className="mt-4 bg-cream px-4 py-3 font-serif text-[14px] leading-6 text-body">
                  {order.shipping.name}<br />
                  {order.shipping.line1}{order.shipping.line2 ? `, ${order.shipping.line2}` : ""}<br />
                  {order.shipping.city}, {order.shipping.state} {order.shipping.postalCode}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

"use client";

import Link from "next/link";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { pieceLabel, useCart } from "@/lib/cart";

export function CartDrawer() {
  const { lines, total, open, setOpen, setQty, remove } = useCart();

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        aria-label="Close bag"
        className="absolute inset-0 bg-black/40"
        onClick={() => setOpen(false)}
      />
      <aside className="absolute inset-y-0 right-0 flex w-[min(92vw,420px)] flex-col bg-white text-ink shadow-[-20px_0_50px_rgba(34,33,31,0.12)]">
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-5">
          <p className="font-bebas text-[28px] leading-none tracking-[0.04em]">Bag</p>
          <button type="button" onClick={() => setOpen(false)} className="font-serif text-[14px] tracking-[0.08em] uppercase">
            Close
          </button>
        </div>
        {lines.length === 0 ? (
          <p className="flex-1 px-5 py-8 font-serif text-[16px] leading-7 text-body">
            Your bag is empty.
          </p>
        ) : (
          <ul className="flex-1 overflow-y-auto px-5 py-4">
            {lines.map((line) => (
              <li key={line.id} className="flex gap-3 border-b border-ink/10 py-4">
                <img src={line.src} alt="" className="h-[96px] w-[72px] object-cover object-[center_18%]" />
                <div className="min-w-0 flex-1">
                  <p className="font-bebas text-[18px] leading-none tracking-[0.04em] uppercase">{line.name}</p>
                  <p className="mt-2 font-serif text-[14px] text-olive">
                    {pieceLabel(line.piece)} · {line.size} · ${line.price}
                    {line.preorder ? " · Preorder" : ""}
                  </p>
                  <div className="mt-3 flex items-center gap-3 font-serif text-[14px]">
                    <button type="button" aria-label="Decrease quantity" onClick={() => setQty(line.id, line.qty - 1)} className="size-7 border border-ink/20">
                      −
                    </button>
                    <span>{line.qty}</span>
                    <button type="button" aria-label="Increase quantity" onClick={() => setQty(line.id, line.qty + 1)} className="size-7 border border-ink/20">
                      +
                    </button>
                    <button type="button" onClick={() => remove(line.id)} className="ml-auto text-[13px] tracking-[0.08em] uppercase">
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto border-t border-ink/10 px-5 py-5">
          <p className="flex items-center justify-between font-serif text-[16px]">
            <span>Total</span>
            <span>${total}</span>
          </p>
          <p className="mt-2 font-serif text-[13px] leading-5 text-body">
            In-stock pieces ship after payment is confirmed. Coastlines preorders are held until that email.
          </p>
          <Link
            href="/checkout"
            onClick={() => setOpen(false)}
            aria-disabled={lines.length === 0}
            className={`mt-4 flex h-12 items-center justify-center font-bebas text-[18px] tracking-[0.08em] text-cream ${lines.length === 0 ? "pointer-events-none bg-ink/30" : "bg-ink"}`}
          >
            Checkout
          </Link>
        </div>
      </aside>
    </div>,
    document.body,
  );
}

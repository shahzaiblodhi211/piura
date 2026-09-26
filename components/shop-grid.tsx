"use client";

import { useEffect, useRef, useState } from "react";
import { ProductCard } from "./product-card";
import { gsap, registerGsap } from "@/lib/gsap";
import {
  filterProducts,
  products,
  shopFilters,
  type ShopFilter,
} from "@/lib/products";

export function ShopGrid({
  initialFilter = "all",
}: {
  initialFilter?: ShopFilter;
}) {
  const [filter, setFilter] = useState<ShopFilter>(initialFilter);
  const gridRef = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const firstPaint = useRef(true);
  const visible = new Set(filterProducts(filter).map((item) => item.name));

  useEffect(() => {
    if (firstPaint.current) {
      firstPaint.current = false;
      return;
    }

    const root = gridRef.current;
    if (!root) {
      busy.current = false;
      return;
    }

    const incoming = [
      ...root.querySelectorAll<HTMLElement>("[data-product-wrap]"),
    ].filter((card) => card.dataset.shown === "true");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(incoming, { autoAlpha: 1, y: 0, scale: 1 });
      busy.current = false;
      return;
    }

    registerGsap();
    gsap.fromTo(
      incoming,
      { autoAlpha: 0, y: 28, scale: 0.96 },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        stagger: 0.045,
        ease: "piura",
        onComplete: () => {
          busy.current = false;
        },
      },
    );
  }, [filter]);

  function applyFilter(next: ShopFilter) {
    if (next === filter || busy.current) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setFilter(next);
      return;
    }

    registerGsap();
    const root = gridRef.current;
    if (!root) {
      setFilter(next);
      return;
    }

    const cards = [...root.querySelectorAll<HTMLElement>("[data-product-wrap]")];
    const nextVisible = new Set(filterProducts(next).map((item) => item.name));
    const leaving = cards.filter(
      (card) => !nextVisible.has(card.dataset.name ?? "") && card.dataset.shown === "true",
    );

    busy.current = true;

    if (!leaving.length) {
      setFilter(next);
      return;
    }

    gsap.to(leaving, {
      autoAlpha: 0,
      y: 16,
      scale: 0.97,
      duration: 0.32,
      stagger: 0.02,
      ease: "power3.in",
      onComplete: () => setFilter(next),
    });
  }

  return (
    <div>
      <div data-tabs className="flex w-full flex-wrap gap-3">
        {shopFilters.map((item) => {
          const active = filter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              data-tab
              onClick={() => applyFilter(item.id)}
              aria-pressed={active}
              className={`flex h-[44px] items-center justify-center px-[26px] font-serif text-[14px] tracking-[0.28px] uppercase ${
                active
                  ? "bg-[#6e7355] text-cream"
                  : "border border-[rgba(53,53,36,0.4)] bg-white text-olive"
              }`}
            >
              {item.label}
              <span className="pl-3 font-bold">{item.count}</span>
            </button>
          );
        })}
      </div>
      <div
        ref={gridRef}
        className="mt-10 grid w-full grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 sm:mt-12 xl:grid-cols-4 xl:mt-[84px] xl:gap-x-6 xl:gap-y-[90px]"
      >
        {products.map((product) => {
          const shown = visible.has(product.name);
          return (
            <div
              key={product.name}
              data-product-wrap
              data-name={product.name}
              data-shown={shown ? "true" : "false"}
              className={shown ? "w-full" : "hidden"}
            >
              <ProductCard product={product} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

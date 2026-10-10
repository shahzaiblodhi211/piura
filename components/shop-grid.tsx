"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductCard } from "./product-card";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/gsap";
import {
  filterProducts,
  shopFilters,
  type Product,
  type ShopFilter,
} from "@/lib/products";

function showCards(cards: HTMLElement[], animate: boolean) {
  registerGsap();
  cards.forEach((card) => {
    ScrollTrigger.getAll().forEach((trigger) => {
      if (trigger.trigger instanceof Element && card.contains(trigger.trigger)) trigger.kill();
    });
    const nodes = [card, ...card.querySelectorAll<HTMLElement>("*")];
    gsap.killTweensOf(nodes);
    gsap.set(nodes, { autoAlpha: 1, opacity: 1, y: 0, scale: 1, clipPath: "none" });
  });

  if (!animate || cards.length === 0) return;

  gsap.fromTo(
    cards,
    { autoAlpha: 0, y: 22 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.55,
      stagger: 0.04,
      ease: "piura",
      overwrite: "auto",
    },
  );
}

export function ShopGrid({
  initialFilter = "all",
  catalog,
}: {
  initialFilter?: ShopFilter;
  catalog: Product[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<ShopFilter>(initialFilter);
  const gridRef = useRef<HTMLDivElement>(null);
  const seen = useRef<Set<string> | null>(null);
  const visible = new Set(filterProducts(filter, catalog).map((item) => item.name));

  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  useEffect(() => {
    const root = gridRef.current;
    if (!root) return;

    root.parentElement?.querySelectorAll<HTMLElement>("[data-tab]").forEach((tab) => {
      gsap.set(tab, { autoAlpha: 1, opacity: 1, y: 0 });
    });

    const shown = [...root.querySelectorAll<HTMLElement>("[data-product-wrap]")].filter(
      (card) => card.dataset.shown === "true",
    );
    const names = shown.map((card) => card.dataset.name ?? "");
    const first = seen.current === null;
    const incoming = first
      ? shown
      : shown.filter((card) => !seen.current?.has(card.dataset.name ?? ""));
    seen.current = new Set(names);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    showCards(first ? shown : incoming, !reduced && incoming.length > 0);
    if (!first) {
      shown
        .filter((card) => !incoming.includes(card))
        .forEach((card) => {
          gsap.set(card, { autoAlpha: 1, y: 0, scale: 1 });
        });
    }
  }, [filter]);

  function applyFilter(next: ShopFilter) {
    if (next === filter) return;
    setFilter(next);
    router.replace(next === "all" ? "/shop" : `/shop?filter=${next}`, { scroll: false });
  }

  return (
    <div>
      <div data-tabs className="flex w-full flex-wrap gap-x-3 gap-y-2 px-5 sm:gap-x-6 sm:gap-y-3 sm:px-8 xl:px-20">
        {shopFilters.map((item) => {
          const active = filter === item.id;
          const count = filterProducts(item.id, catalog).length;
          return (
            <button
              key={item.id}
              type="button"
              data-tab
              onClick={() => applyFilter(item.id)}
              aria-pressed={active}
              className={`flex h-10 items-center justify-center gap-3 px-4 font-bebas text-[15px] leading-none uppercase sm:h-[44px] sm:gap-4 sm:px-[26px] sm:text-[16px] ${
                active
                  ? "bg-ink text-cream"
                  : "border border-[rgba(53,53,36,0.4)] bg-white text-olive"
              }`}
            >
              <span className="translate-y-[2px] sm:translate-y-0">{item.label}</span>
              <span className="translate-y-[2px] sm:translate-y-0">{count}</span>
            </button>
          );
        })}
      </div>
      <div
        ref={gridRef}
        className="mx-auto mt-8 grid w-full max-w-[1560px] grid-cols-2 gap-x-3 gap-y-8 px-5 sm:mt-10 sm:gap-x-4 sm:gap-y-12 sm:px-8 lg:grid-cols-3 xl:mt-14 xl:grid-cols-4 xl:gap-x-[11px] xl:gap-y-[70px] xl:px-20"
      >
        {catalog.map((product) => {
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

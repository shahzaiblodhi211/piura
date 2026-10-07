"use client";

import { useState } from "react";
import { useCart, type CartPiece } from "@/lib/cart";
import { piecePrices, productSizes, productSlug, sizeInStock, type Product } from "@/lib/products";

const pieceOptions: { id: CartPiece; label: string; price: number }[] = [
  { id: "top", label: "Top", price: piecePrices.top },
  { id: "bottom", label: "Bottom", price: piecePrices.bottom },
];

export function PreorderPurchase({
  product,
  size,
}: {
  product: Product;
  size: (typeof productSizes)[number];
}) {
  const { addMany } = useCart();
  const onePiece = product.kind === "onepiece";
  const inStock = typeof product.price === "number";
  const available = sizeInStock(product, size);
  const [selected, setSelected] = useState<CartPiece[]>(onePiece ? ["onepiece"] : ["top", "bottom"]);

  function toggle(piece: CartPiece) {
    setSelected((current) =>
      current.includes(piece) ? current.filter((item) => item !== piece) : [...current, piece],
    );
  }

  function purchase() {
    if (!available) return;
    const shared = {
      slug: productSlug(product.name),
      name: product.name,
      size,
      src: product.src,
      preorder: Boolean(product.preorder),
    };
    if (inStock && product.price) {
      addMany([
        {
          ...shared,
          piece: product.kind === "bottom" ? "bottom" : product.kind === "onepiece" ? "onepiece" : "top",
          price: product.price,
        },
      ]);
      return;
    }
    if (onePiece) {
      addMany([{ ...shared, piece: "onepiece", price: piecePrices.onepiece }]);
      return;
    }
    addMany(
      pieceOptions
        .filter((option) => selected.includes(option.id))
        .map((option) => ({ ...shared, piece: option.id, price: option.price })),
    );
  }

  return (
    <>
      {!onePiece && !inStock ? (
        <div className="mt-4 grid w-full max-w-[470px] grid-cols-2 gap-[14px]">
          {pieceOptions.map((option) => {
            const active = selected.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(option.id)}
                className={`flex h-[44px] items-center justify-center px-3 font-serif text-[14px] tracking-[0.28px] whitespace-nowrap uppercase ${
                  active
                    ? "border border-olive text-olive"
                    : "border border-[rgba(53,53,36,0.4)] text-[rgba(53,53,36,0.75)]"
                }`}
              >
                {option.label} ${option.price}
              </button>
            );
          })}
        </div>
      ) : null}
      <button
        type="button"
        data-btn
        disabled={!available || (!onePiece && !inStock && selected.length === 0)}
        onClick={purchase}
        className="mt-8 flex h-[58px] w-full max-w-[470px] items-center justify-center gap-4 bg-olive font-serif text-[16px] font-medium tracking-[0.64px] text-cream uppercase disabled:opacity-40"
      >
        <img src="/assets/icon-bag.svg" alt="" />
        {!available ? "Sold out" : product.preorder ? (onePiece ? `Preorder · $${piecePrices.onepiece}` : "Preorder") : `Add to bag · $${product.price}`}
      </button>
      <p className="mt-5 w-full max-w-[466px] font-serif text-[16px] leading-[28px] font-medium text-body">
        {product.preorder
          ? "Coastlines is a preorder. Your size is held, and we'll email you to complete payment before it ships."
          : "In stock and ready to ship. Add your size to the bag to purchase."}
      </p>
    </>
  );
}

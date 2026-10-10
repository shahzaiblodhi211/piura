"use client";

import { useCart, type CartPiece } from "@/lib/cart";
import { piecePrices, productPath, productSizes, sizeInStock, type Product } from "@/lib/products";

const pieceOptions: { id: CartPiece; label: string; price: number }[] = [
  { id: "top", label: "top", price: piecePrices.top },
  { id: "bottom", label: "bottom", price: piecePrices.bottom },
];

export function PreorderPurchase({
  product,
  size,
}: {
  product: Product;
  size: (typeof productSizes)[number];
}) {
  const { addMany } = useCart();
  const separate = product.kind === "bikini" && typeof product.price !== "number";
  const available = sizeInStock(product, size);

  function add(piece: CartPiece, price: number) {
    if (!available) return;
    addMany([
      {
        slug: productPath(product),
        name: product.name,
        piece,
        size,
        price,
        src: product.src,
        preorder: Boolean(product.preorder),
      },
    ]);
  }

  const amount = product.kind === "onepiece" ? piecePrices.onepiece : product.price;
  const label = !available ? "Sold out" : product.preorder ? `Preorder · $${amount}` : `Add to bag · $${amount}`;

  return (
    <>
      {separate ? (
        <div className="mt-8 grid w-full max-w-[470px] gap-3">
          {pieceOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              data-btn
              disabled={!available}
              onClick={() => add(option.id, option.price)}
              className="flex h-[58px] w-full items-center justify-center gap-4 bg-olive font-serif text-[16px] font-medium tracking-[0.64px] text-cream uppercase disabled:opacity-40"
            >
              <img src="/assets/icon-bag.svg" alt="" />
              {available ? `Preorder ${option.label} · $${option.price}` : "Sold out"}
            </button>
          ))}
        </div>
      ) : (
        <button
          type="button"
          data-btn
          disabled={!available}
          onClick={() =>
            add(
              product.kind === "bottom" ? "bottom" : product.kind === "onepiece" ? "onepiece" : "top",
              product.kind === "onepiece" ? piecePrices.onepiece : product.price ?? 0,
            )
          }
          className="mt-8 flex h-[58px] w-full max-w-[470px] items-center justify-center gap-4 bg-olive font-serif text-[16px] font-medium tracking-[0.64px] text-cream uppercase disabled:opacity-40"
        >
          <img src="/assets/icon-bag.svg" alt="" />
          {label}
        </button>
      )}
      <p className="mt-5 w-full max-w-[466px] font-serif text-[16px] leading-[28px] font-medium text-body">
        {product.preorder
          ? separate
            ? "The top and bottom are sold separately. Pick a size, then preorder the piece you want."
            : "Coastlines is a preorder. Your size is held, and we'll email you to complete payment before it ships."
          : "In stock and ready to ship. Add your size to the bag to purchase."}
      </p>
    </>
  );
}

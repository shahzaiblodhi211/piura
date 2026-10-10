import { findInCatalog, piecePrices, productSizes, products, sizeInStock, type Product } from "@/lib/products";

export type CheckoutPiece = "top" | "bottom" | "onepiece";

export type CheckoutItem = {
  slug: string;
  piece: CheckoutPiece;
  size: string;
  qty: number;
};

export type QuotedLine = {
  slug: string;
  name: string;
  piece: CheckoutPiece;
  size: string;
  qty: number;
  unit: number;
  preorder: boolean;
};

const sizeSet = new Set<string>(productSizes);

function unitPrice(product: Product, piece: CheckoutPiece) {
  if (typeof product.price === "number") {
    if (product.kind === "top" && piece !== "top") return null;
    if (product.kind === "bottom" && piece !== "bottom") return null;
    if (product.kind === "onepiece" && piece !== "onepiece") return null;
    if (product.kind === "bikini") return null;
    return product.price;
  }
  if (product.kind === "onepiece" && piece === "onepiece") return piecePrices.onepiece;
  if (product.kind === "bikini" && (piece === "top" || piece === "bottom")) return piecePrices[piece];
  return null;
}

export function quoteCheckout(items: CheckoutItem[], catalog: Product[] = products) {
  if (!items.length || items.length > 20) return { ok: false as const, error: "Your bag is empty." };
  const lines: QuotedLine[] = [];
  for (const item of items) {
    const qty = item.qty;
    if (!Number.isInteger(qty) || qty < 1 || qty > 4) return { ok: false as const, error: "Check the quantity in your bag." };
    if (!sizeSet.has(item.size)) return { ok: false as const, error: "Choose a size for every piece." };
    const product = findInCatalog(catalog, item.slug);
    if (!product) return { ok: false as const, error: "A piece in your bag is no longer available." };
    const size = item.size as (typeof productSizes)[number];
    if (!sizeInStock(product, size)) return { ok: false as const, error: `${product.name} is sold out in that size.` };
    const unit = unitPrice(product, item.piece);
    if (unit == null) return { ok: false as const, error: "A piece in your bag can't be checked out." };
    lines.push({
      slug: item.slug,
      name: product.name,
      piece: item.piece,
      size,
      qty,
      unit,
      preorder: Boolean(product.preorder),
    });
  }
  const amount = lines.reduce((sum, line) => sum + line.unit * line.qty * 100, 0);
  if (amount < 50) return { ok: false as const, error: "This order can't be charged." };
  return { ok: true as const, amount, lines };
}

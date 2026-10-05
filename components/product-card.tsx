import Link from "next/link";
import { productSlug, type Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${productSlug(product.name)}`}
      data-product
      data-reveal
      className="block w-full cursor-pointer"
    >
      <div
        data-photo="product"
        data-product-media
        className="relative aspect-[382/536] w-full overflow-hidden bg-[#f5f2ed]"
      >
        <img
          data-photo-img
          alt={product.alt}
          src={product.src}
          className="absolute inset-0 size-full object-contain will-change-transform"
        />
        <span className="absolute top-0 left-0 z-10 flex h-7 w-[92px] items-center justify-center bg-ink font-bebas text-[14px] tracking-[0.56px] text-white">
          PREORDER
        </span>
      </div>
      <p
        data-product-name
        className="mt-[18px] font-bebas text-[22px] leading-none tracking-[0.88px] text-ink uppercase"
      >
        {product.name}
      </p>
    </Link>
  );
}

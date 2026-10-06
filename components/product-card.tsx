import Link from "next/link";
import { productPriceLine, productSlug, type Product } from "@/lib/products";

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
        className="relative aspect-[382/536] w-full overflow-hidden"
      >
        <img
          data-photo-img
          alt={product.alt}
          src={product.src}
          className="absolute inset-0 size-full object-cover object-[center_18%] will-change-transform"
        />
        <span className="absolute top-0 left-0 z-10 flex h-6 w-[78px] items-center justify-center bg-ink font-bebas text-[12px] tracking-[0.48px] text-white sm:h-7 sm:w-[92px] sm:text-[14px]">
          PREORDER
        </span>
      </div>
      <p
        data-product-name
        className="mt-3 font-bebas text-[16px] leading-none tracking-[0.64px] text-ink uppercase sm:mt-[18px] sm:text-[20px] lg:text-[22px]"
      >
        {product.name}
      </p>
      {productPriceLine(product) ? (
        <p
          data-product-price
          className="mt-2 font-serif text-[14px] leading-none tracking-[0.28px] text-olive sm:text-[16px]"
        >
          {productPriceLine(product)}
        </p>
      ) : null}
    </Link>
  );
}

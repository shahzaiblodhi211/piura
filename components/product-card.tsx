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
        className="relative aspect-[333/440] w-full overflow-hidden bg-[rgba(245,240,236,0.48)]"
      >
        <div
          className="absolute overflow-hidden"
          style={{
            width: product.box.width,
            height: product.box.height,
            left: product.box.left,
            top: product.box.top,
          }}
        >
          {product.cover ? (
            <img
              data-photo-img
              alt={product.alt}
              src={product.src}
              className="absolute inset-0 size-full object-cover will-change-transform"
            />
          ) : (
            <img
              data-photo-img
              alt={product.alt}
              src={product.src}
              className="absolute max-w-none will-change-transform"
              style={product.crop}
            />
          )}
        </div>
      </div>
      <p
        data-product-name
        className="mt-[22px] font-serif text-[16px] leading-normal font-medium tracking-[0.64px] text-olive uppercase"
      >
        {product.name}
      </p>
      <p
        data-product-price
        className="mt-1 font-serif text-[16px] leading-normal font-medium tracking-[0.64px] text-olive uppercase"
      >
        {product.price}
      </p>
    </Link>
  );
}

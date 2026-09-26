import { ContactFeatures } from "@/components/contact-features";
import { CtaArrow } from "@/components/cta-arrow";
import { PageShell } from "@/components/page-shell";
import { ProductCard } from "@/components/product-card";
import { ProductDetail, type ProductSlide } from "@/components/product-detail";
import { SizeGuideGallery } from "@/components/size-guide-gallery";
import { SplitTitle } from "@/components/split-title";
import {
  getProduct,
  pairProduct,
  products,
  productSlug,
  sizeChart,
} from "@/lib/products";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const mannequinFrontCrop = {
  width: "99.94%",
  height: "109.02%",
  left: "0.03%",
  top: "0.01%",
};

const mannequinBackCrop = {
  width: "130.16%",
  height: "161.86%",
  left: "-14.97%",
  top: "-16.15%",
};

export function generateStaticParams() {
  return products.map((product) => ({ slug: productSlug(product.name) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Product — Piura Swim" };
  return {
    title: `${product.name} — Piura Swim`,
    description: `${product.name} ${product.price}. Designed in Miami. Crafted in Piura, Peru.`,
  };
}

function slidesFor(slug: string, product: { name: string; src: string; crop?: ProductSlide["crop"] }): ProductSlide[] {
  if (slug === "sunchild-triangle-bottom") {
    return [
      {
        src: product.src,
        alt: product.name,
        crop: product.crop,
        thumbCrop: product.crop,
      },
      {
        src: "/assets/pdp-mannequin-front.png",
        alt: `${product.name} on a dress form, front`,
        thumbCrop: mannequinFrontCrop,
      },
      {
        src: "/assets/pdp-mannequin-back.png",
        alt: `${product.name} on a dress form, back`,
        thumbCrop: mannequinBackCrop,
      },
    ];
  }
  return [{ src: product.src, alt: product.name, crop: product.crop }];
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const featured = slug === "sunchild-triangle-bottom";
  const pair = pairProduct(product);
  const setTotal =
    pair && product.kind !== "tote"
      ? `$${(Number(product.price.slice(1)) + Number(pair.price.slice(1))).toString()}`
      : null;

  return (
    <PageShell overlay invert={false}>
      <main className="w-full">
        <section className="relative w-full">
          <ProductDetail
            product={product}
            slides={slidesFor(slug, product)}
            featured={featured}
          />
        </section>

        <section className="mx-auto w-full max-w-[1560px] px-5 pt-12 pb-16 sm:px-8 md:px-12 md:pt-20 md:pb-24 lg:px-16 xl:px-20 xl:pt-[159px]">
          {featured ? (
            <SizeGuideGallery>
              <SplitTitle
                text="Size guide"
                className="font-serif text-[36px] leading-[1.15] font-normal tracking-[-0.04em] text-olive md:text-[56px] md:leading-[73px] md:tracking-[-2.24px]"
              />
              <p
                data-intro
                className="mt-6 font-serif text-[18px] leading-[30px] font-normal text-body md:text-[20px] md:leading-[34px]"
              >
                Every Piura piece is hand-measured, laid flat, so you can compare
                against a bikini you already love. Our pieces fit true to size —
                when in doubt between two sizes, size up in bottoms for more
                coverage, down for extra cheeky.
              </p>
              <div className="mt-10 w-full max-w-[524px]">
                <div className="grid grid-cols-[72px_1fr_1fr] font-serif text-[16px] font-medium tracking-[0.64px] text-olive uppercase">
                  <p>Size</p>
                  <p>Length (in.)</p>
                  <p>Width (in.)</p>
                </div>
                {sizeChart.map((row) => (
                  <div
                    key={row.size}
                    data-reveal
                    className="grid grid-cols-[72px_1fr_1fr] border-t border-[#353524] py-3 font-serif text-[16px] leading-[34px] font-medium text-[#83807b]"
                  >
                    <p>{row.size}</p>
                    <p>{row.length}</p>
                    <p>{row.width}</p>
                  </div>
                ))}
                <div className="border-t border-[#353524]" />
              </div>
            </SizeGuideGallery>
          ) : (
            <div className="w-full max-w-[567px]">
              <SplitTitle
                text="Size guide"
                className="font-serif text-[36px] leading-[1.15] font-normal tracking-[-0.04em] text-olive md:text-[56px] md:leading-[73px] md:tracking-[-2.24px]"
              />
              <p
                data-intro
                className="mt-6 font-serif text-[18px] leading-[30px] font-normal text-body md:text-[20px] md:leading-[34px]"
              >
                Every Piura piece is hand-measured, laid flat, so you can compare
                against a bikini you already love. Our pieces fit true to size —
                when in doubt between two sizes, size up in bottoms for more
                coverage, down for extra cheeky.
              </p>
              <div className="mt-10 w-full max-w-[524px]">
                <div className="grid grid-cols-[72px_1fr_1fr] font-serif text-[16px] font-medium tracking-[0.64px] text-olive uppercase">
                  <p>Size</p>
                  <p>Length (in.)</p>
                  <p>Width (in.)</p>
                </div>
                {sizeChart.map((row) => (
                  <div
                    key={row.size}
                    data-reveal
                    className="grid grid-cols-[72px_1fr_1fr] border-t border-[#353524] py-3 font-serif text-[16px] leading-[34px] font-medium text-[#83807b]"
                  >
                    <p>{row.size}</p>
                    <p>{row.length}</p>
                    <p>{row.width}</p>
                  </div>
                ))}
                <div className="border-t border-[#353524]" />
              </div>
            </div>
          )}
        </section>

        <ContactFeatures className="w-full bg-[rgba(245,240,236,0.48)]" />

        {pair && setTotal ? (
          <section className="mx-auto w-full max-w-[1560px] px-5 py-16 sm:px-8 md:px-12 md:py-24 lg:px-16 xl:px-20">
            <div className="flex w-full flex-col gap-12 min-[1400px]:flex-row min-[1400px]:items-start min-[1400px]:justify-between">
              <div className="w-full max-w-[567px]">
                <p
                  data-intro
                  className="font-serif text-[16px] leading-normal font-medium text-brown md:text-[18px]"
                >
                  Complete The Set
                </p>
                <SplitTitle
                  text="Made to be worn together."
                  className="mt-3 font-serif text-[36px] leading-[1.15] font-normal tracking-[-0.04em] text-olive md:text-[56px] md:leading-[73px] md:tracking-[-2.24px]"
                />
                <p
                  data-intro
                  className="mt-6 font-serif text-[18px] leading-[30px] font-normal text-body md:text-[20px] md:leading-[34px]"
                >
                  Every Piura piece is designed as one half of a whole — the{" "}
                  {pair.name} finishes what the {product.name} starts. Together,
                  the full set is {setTotal}.
                </p>
                <Link
                  href={`/product/${productSlug(pair.name)}`}
                  data-btn
                  className="mt-10 flex h-[54px] w-fit items-center justify-center gap-3 border border-olive px-[34px] font-serif text-[16px] tracking-[0.32px] text-olive uppercase whitespace-nowrap"
                >
                  {pair.kind === "top" ? "View the top" : "View the bottom"}
                  <CtaArrow />
                </Link>
              </div>
              <div className="w-full max-w-[333px]">
                <ProductCard product={pair} />
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </PageShell>
  );
}

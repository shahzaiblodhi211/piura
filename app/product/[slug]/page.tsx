import { PageShell } from "@/components/page-shell";
import { ProductDetail } from "@/components/product-detail";
import { SplitTitle } from "@/components/split-title";
import { getProduct, products, productSlug } from "@/lib/products";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

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
    description: `${product.colorway} Fabric codes: ${product.fabric}. Designed in Miami. Crafted in Piura, Peru.`,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const shot = product.gallery[1] ?? product.gallery[0];

  return (
    <PageShell>
      <main className="w-full">
        <section className="relative w-full">
          <ProductDetail product={product} slides={product.gallery} />
        </section>

        <section className="mx-auto flex w-full max-w-[1560px] flex-col gap-12 px-5 pt-12 pb-16 sm:px-8 md:px-12 md:pt-20 md:pb-24 lg:flex-row lg:items-stretch lg:justify-between lg:px-16 xl:px-20">
          <div className="w-full max-w-[640px]">
            <SplitTitle
              text="Sizes and quantity"
              className="font-serif text-[36px] leading-[1.15] font-normal tracking-[-0.04em] text-olive md:text-[56px] md:leading-[73px] md:tracking-[-2.24px]"
            />
            <p
              data-intro
              className="mt-6 font-serif text-[18px] leading-[30px] font-normal text-body md:text-[20px] md:leading-[34px]"
            >
              {product.colorway} Fabric codes: {product.fabric}.
            </p>
            <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-12">
              {product.runs.map((run) => (
                <div key={run.piece} className="min-w-0 flex-1">
                  <p className="font-serif text-[16px] font-medium tracking-[0.64px] text-olive uppercase">
                    {run.piece}
                  </p>
                  <div className="mt-3 grid grid-cols-[56px_1fr] font-serif text-[15px] font-medium tracking-[0.64px] text-olive uppercase">
                    <p>Size</p>
                    <p>Units</p>
                  </div>
                  {run.counts.map((row) => (
                    <div
                      key={row.size}
                      data-reveal
                      className="grid grid-cols-[56px_1fr] border-t border-[#353524] py-1.5 font-serif text-[15px] leading-6 font-medium text-[#83807b]"
                    >
                      <p>{row.size}</p>
                      <p>{row.qty}</p>
                    </div>
                  ))}
                  <div className="border-t border-[#353524]" />
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-[3/4] w-full overflow-hidden lg:aspect-auto lg:w-[380px] lg:shrink-0">
            <img
              alt={shot.alt}
              src={shot.src}
              className="size-full object-contain lg:absolute lg:inset-0"
            />
          </div>
        </section>
      </main>
    </PageShell>
  );
}

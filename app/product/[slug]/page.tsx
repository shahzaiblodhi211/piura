import { ShimmerImage } from "@/components/shimmer-image";
import { PageShell } from "@/components/page-shell";
import { ProductDetail } from "@/components/product-detail";
import { SplitTitle } from "@/components/split-title";
import { publicProducts } from "@/lib/catalog";
import { findInCatalog, productPath, products, retiredProductSlugs } from "@/lib/products";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

export function generateStaticParams() {
  return products.map((product) => ({ slug: productPath(product) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug: requested } = await params;
  const slug = retiredProductSlugs[requested] ?? requested;
  const product = findInCatalog(await publicProducts(), slug);
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
  const next = retiredProductSlugs[slug];
  if (next) redirect(`/product/${next}`);
  const product = findInCatalog(await publicProducts(), slug);
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
              className="font-serif text-[32px] leading-[1.15] font-normal tracking-[-0.04em] text-olive sm:text-[40px] md:text-[56px] md:leading-[73px] md:tracking-[-2.24px]"
            />
            <p
              data-intro
              className="mt-6 font-serif text-[18px] leading-[30px] font-normal text-body md:text-[20px] md:leading-[34px]"
            >
              {product.price
                ? product.colorway
                : `${product.colorway} Fabric codes: ${product.fabric}.`}
            </p>
            <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-12">
              {product.runs.map((run) => (
                <div key={run.piece} className="min-w-0 flex-1">
                  <p className="font-serif text-[16px] font-medium tracking-[0.64px] text-olive uppercase">
                    {run.piece}
                  </p>
                  <div className="mt-3 grid grid-cols-[56px_1fr] font-serif text-[15px] font-medium tracking-[0.64px] text-olive uppercase">
                    <p>Size</p>
                    <p>{product.price ? "Status" : "Units"}</p>
                  </div>
                  {run.counts.map((row) => (
                    <div
                      key={row.size}
                      data-reveal
                      className="grid grid-cols-[56px_1fr] border-t border-[#353524] py-1.5 font-serif text-[15px] leading-6 font-medium text-[#83807b]"
                    >
                      <p>{row.size}</p>
                      <p>{product.price ? (row.qty > 0 ? "In stock" : "Sold out") : row.qty}</p>
                    </div>
                  ))}
                  <div className="border-t border-[#353524]" />
                </div>
              ))}
            </div>
          </div>
          <div className={`relative mx-auto h-[360px] w-full max-w-[280px] overflow-hidden sm:h-[440px] sm:max-w-[340px] lg:mx-0 lg:h-[520px] lg:w-[320px] lg:max-w-none lg:shrink-0 xl:h-[560px] xl:w-[380px] ${product.sizeChart ? "bg-[#f7f3ee]" : ""}`}>
            <ShimmerImage
              alt={product.sizeChart ? `${product.name} size chart` : shot.alt}
              src={product.sizeChart ?? shot.src}
              className={`absolute inset-0 size-full ${product.sizeChart ? "object-contain" : "object-cover object-[center_16%]"}`}
            />
          </div>
        </section>
      </main>
    </PageShell>
  );
}

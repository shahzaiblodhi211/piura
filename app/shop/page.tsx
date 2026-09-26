import { ContactFeatures } from "@/components/contact-features";
import { PageShell } from "@/components/page-shell";
import { ShopGrid } from "@/components/shop-grid";
import { SplitTitle } from "@/components/split-title";
import type { ShopFilter } from "@/lib/products";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop — Piura Swim",
  description:
    "Everything under the sun — fully lined, seamless, and cut for effortless tan lines. Designed in Miami, crafted in Piura, Peru.",
};

const filters: ShopFilter[] = [
  "all",
  "tops",
  "bottoms",
  "sunchild",
  "moonchild",
  "classics",
];

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const initialFilter = filters.includes(filter as ShopFilter)
    ? (filter as ShopFilter)
    : "all";

  return (
    <PageShell>
      <main className="w-full">
        <section className="relative w-full overflow-hidden">
          <div
            data-photo="hero"
            className="relative mx-auto h-[360px] w-full max-w-[1560px] overflow-hidden sm:h-[480px] xl:h-[600px]"
          >
            <img
              data-photo-img
              alt="Woman in a bikini walking in the water with a tote and a sailboat behind her"
              src="/assets/shop-hero.png"
              className="absolute top-[0.08%] left-0 h-[173.36%] w-full max-w-none will-change-transform"
            />
            <div className="absolute inset-0 bg-[rgba(177,174,171,0.2)]" />
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1560px] px-5 pt-12 sm:px-8 md:px-12 md:pt-16 lg:px-16 xl:px-20 xl:pt-[93px]">
          <p
            data-intro
            className="font-serif text-[16px] leading-normal font-medium tracking-[1.44px] text-brown md:text-[18px]"
          >
            The Collection
          </p>
          <SplitTitle
            text="Everything under the sun — fully lined, seamless, and cut for effortless tan lines."
            className="mt-3 w-full max-w-[1318px] font-serif text-[32px] leading-[1.2] font-normal tracking-[-0.04em] text-olive sm:text-[44px] md:text-[56px] md:leading-[73px] md:tracking-[-2.24px]"
          />
          <p
            data-intro
            className="mt-6 w-full max-w-[569px] font-serif text-[18px] leading-[30px] font-normal text-body md:mt-8 md:text-[20px] md:leading-[35px]"
          >
            Designed in Miami, crafted in Piura, Peru. Small runs, made to last
            well beyond a single summer.
          </p>
        </section>

        <section
          id="shop"
          className="mx-auto w-full max-w-[1560px] scroll-mt-8 px-5 pt-10 pb-16 sm:px-8 md:px-12 md:pt-14 md:pb-24 lg:px-16 xl:px-20 xl:pt-[118px] xl:pb-[80px]"
        >
          <ShopGrid key={initialFilter} initialFilter={initialFilter} />
        </section>

        <ContactFeatures className="w-full bg-[rgba(245,240,236,0.48)]" />
      </main>
    </PageShell>
  );
}

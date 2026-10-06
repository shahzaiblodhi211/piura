import { HomeHeader } from "@/components/home-header";
import { PageShell } from "@/components/page-shell";
import { ShopGrid } from "@/components/shop-grid";
import { SplitTitle } from "@/components/split-title";
import { acceptedFilters, type ShopFilter } from "@/lib/products";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop — Piura Swim",
  description:
    "Everything under the sun — fully lined, seamless, and cut for effortless tan lines. Designed in Miami, crafted in Piura, Peru.",
};

const filters: ShopFilter[] = acceptedFilters;

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
    <PageShell hero>
      <main className="w-full bg-white">
        <section className="relative w-full overflow-x-clip">
          <div
            data-hero-frame
            className="relative mx-auto h-[340px] w-full max-w-[1560px] overflow-hidden sm:h-[440px] md:h-[540px] lg:h-[640px] xl:h-[744px]"
          >
            <div className="absolute inset-0 -scale-x-100">
              <img
                alt="Woman in a striped bikini lying on the sand, looking out at the water"
                src="/assets/shop-hero-coast.jpg"
                className="absolute inset-0 size-full object-cover object-[16%_46%]"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[rgba(77,77,77,0.2)] from-[13%] to-transparent to-[26%]" />
          </div>
          <HomeHeader />
        </section>

        <section className="mx-auto w-full max-w-[1560px] px-5 pt-12 sm:px-8 sm:pt-16 xl:px-20 xl:pt-[93px]">
          <p data-intro className="font-serif text-[16px] leading-normal text-ink sm:text-[18px]">
            The Collection
          </p>
          <SplitTitle
            text="Everything under the sun — fully lined, seamless, and cut for effortless tan lines."
            className="mt-5 w-full max-w-[1396px] font-bebas text-[32px] leading-[1.1] text-ink sm:mt-8 sm:text-[48px] md:text-[64px] lg:mt-10 lg:text-[80px] lg:leading-[88px]"
          />
          <p
            data-intro
            className="mt-5 w-full max-w-[569px] font-serif text-[16px] leading-[26px] text-ink sm:mt-8 sm:text-[18px] sm:leading-[30px] md:text-[20px] md:leading-[32px]"
          >
            Designed in Miami, crafted in Piura, Peru. Small runs, made to last
            well beyond a single summer.
          </p>
        </section>

        <section
          id="shop"
          className="mx-auto w-full max-w-[1560px] scroll-mt-8 pt-10 pb-16 sm:pt-12 xl:pt-16 xl:pb-[80px]"
        >
          <ShopGrid key={initialFilter} initialFilter={initialFilter} />
        </section>
      </main>
    </PageShell>
  );
}

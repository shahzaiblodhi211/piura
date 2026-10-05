import { HomeHeader } from "@/components/home-header";
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

const filters: ShopFilter[] = ["all", "triangle", "contour", "onepiece"];

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
        <section className="relative w-full">
          <div
            data-hero-frame
            className="relative mx-auto aspect-[1560/806] w-full max-w-[1560px] overflow-hidden"
          >
            <div className="absolute inset-0 -scale-x-100">
              <img
                alt="Woman in a striped bikini lying on the sand, looking out at the water"
                src="/assets/shop-hero-coast.png"
                className="absolute top-[-15.38%] left-[-0.02%] h-[145.41%] w-[100.04%] max-w-none"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[rgba(77,77,77,0.2)] from-[13%] to-transparent to-[26%]" />
          </div>
          <HomeHeader />
        </section>

        <section className="mx-auto w-full max-w-[1560px] px-5 pt-16 sm:px-8 xl:px-20 xl:pt-[93px]">
          <p data-intro className="font-serif text-[18px] leading-normal text-ink">
            The Collection
          </p>
          <SplitTitle
            text="Everything under the sun — fully lined, seamless, and cut for effortless tan lines."
            className="mt-8 w-full max-w-[1396px] font-bebas text-[40px] leading-[1.1] text-ink sm:text-[56px] sm:leading-[1.1] lg:mt-10 lg:text-[80px] lg:leading-[88px]"
          />
          <p
            data-intro
            className="mt-8 w-full max-w-[569px] font-serif text-[18px] leading-[30px] text-ink md:text-[20px] md:leading-[32px]"
          >
            Designed in Miami, crafted in Piura, Peru. Small runs, made to last
            well beyond a single summer.
          </p>
        </section>

        <section
          id="shop"
          className="mx-auto w-full max-w-[1560px] scroll-mt-8 pt-12 pb-16 sm:pt-16 xl:pt-[125px] xl:pb-[80px]"
        >
          <ShopGrid key={initialFilter} initialFilter={initialFilter} />
        </section>
      </main>
    </PageShell>
  );
}

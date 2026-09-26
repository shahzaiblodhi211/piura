import { ContactFeatures } from "@/components/contact-features";
import { CtaArrow } from "@/components/cta-arrow";
import { HomeLookbook } from "@/components/home-lookbook";
import { HomeTicker } from "@/components/home-ticker";
import { PageShell } from "@/components/page-shell";
import { ProductCard } from "@/components/product-card";
import { SplitTitle } from "@/components/split-title";
import { products } from "@/lib/products";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Piura Swim — A love letter to the sun",
  description:
    "Designed in Miami. Crafted in Piura, Peru — the city of eternal heat. The waitlist shops first.",
};

const dropped = products.slice(0, 4);
const sunchildTop = products[0];
const sunchildBottom = products[1];

const collections = [
  { label: "The Sunchild Print", href: "/shop?filter=sunchild" },
  { label: "The Moonchild Print", href: "/shop?filter=moonchild" },
  { label: "The Classics", href: "/shop?filter=classics" },
];

function Polaroid({
  src,
  alt,
  rotate,
  className,
  width,
  height,
}: {
  src: string;
  alt: string;
  rotate: string;
  className: string;
  width: number;
  height: number;
}) {
  return (
    <div className={`pointer-events-none absolute ${className}`}>
      <div
        className="bg-white p-2.5 shadow-[0px_0px_4.7px_0px_rgba(166,166,166,0.47)]"
        style={{ rotate, width, height }}
      >
        <img alt={alt} src={src} className="size-full object-cover" />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <PageShell overlay invert={false}>
      <main className="w-full">
        <section className="relative w-full overflow-hidden min-h-[640px] xl:min-h-[878px]">
          <div data-photo="hero" className="absolute inset-0">
            <img
              data-photo-img
              alt="Woman in a white dress standing on coastal rocks"
              src="/assets/home-hero.png"
              className="absolute inset-0 size-full object-cover object-[center_32%] will-change-transform"
            />
            <img
              alt=""
              src="/assets/home-hero-veil.svg"
              className="absolute inset-0 size-full object-cover"
            />
          </div>

          <div className="relative mx-auto flex min-h-[640px] w-full max-w-[1560px] flex-col justify-center px-5 pt-36 pb-16 sm:px-8 md:px-12 xl:min-h-[878px] xl:px-20 xl:pt-[160px] xl:pb-20">
            <p
              data-intro
              className="font-serif text-[16px] font-medium tracking-[1.44px] text-[#83807b] md:text-[18px]"
            >
              Swim · Est. Miami
            </p>
            <h1 className="mt-3 font-serif text-[48px] leading-[0.95] font-semibold tracking-[-0.04em] text-olive sm:text-[72px] xl:text-[104px] xl:tracking-[-4.16px]">
              <span data-intro className="block">
                A love letter
              </span>
              <span data-intro className="block font-normal italic">
                to the sun.
              </span>
            </h1>
            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap">
              <Link
                href="/shop"
                data-btn
                className="flex h-[54px] w-full max-w-[340px] items-center justify-center gap-3 bg-olive px-[34px] font-serif text-[16px] tracking-[0.32px] text-cream uppercase"
              >
                Shop the Collection
                <CtaArrow tone="cream" />
              </Link>
              <Link
                href="/waitlist"
                data-btn
                className="flex h-[54px] w-full max-w-[263px] items-center justify-center border border-olive px-[34px] font-serif text-[16px] tracking-[0.32px] text-olive uppercase"
              >
                Join the Waitlist
              </Link>
            </div>
          </div>

          <div className="pointer-events-none absolute top-[262px] right-[70px] hidden w-[253px] xl:block">
            <div className="relative rounded-[6px] border-2 border-[rgba(255,251,246,0.4)] bg-[rgba(255,255,255,0.08)] px-5 py-6 backdrop-blur-[8px]">
              <img
                alt=""
                src="/assets/home-peru.svg"
                className="absolute -top-[108px] right-2"
              />
              <p className="font-serif text-[16px] leading-[28px] tracking-[0.96px] text-[#fffbf6] uppercase">
                Crafted in Piura,
                <br />
                Peru
              </p>
              <div className="mt-10 flex items-center justify-between">
                <p className="font-serif text-[18px] tracking-[-0.72px] text-[#fffbf6]">
                  PIURA
                </p>
                <span className="relative size-7">
                  <img src="/assets/home-pin-ring.svg" alt="" />
                  <img
                    src="/assets/home-pin-arrow.svg"
                    alt=""
                    className="absolute top-[9px] left-[11px]"
                  />
                </span>
              </div>
            </div>
          </div>
        </section>

        <HomeTicker />

        <section className="mx-auto w-full max-w-[1560px] px-5 pt-16 sm:px-8 md:px-12 md:pt-20 lg:px-16 xl:px-20 xl:pt-[139px]">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p
                data-intro
                className="font-serif text-[16px] font-medium text-brown md:text-[18px]"
              >
                Nº 02 — New Arrivals
              </p>
              <SplitTitle
                text="Just dropped."
                className="mt-2 font-serif text-[40px] leading-[1.1] font-normal tracking-[-0.04em] text-olive md:text-[56px] xl:text-[66px] xl:leading-[65px] xl:tracking-[-2.64px]"
              />
            </div>
            <Link
              href="/shop"
              data-nav-link
              className="link-underline hidden shrink-0 font-serif text-[18px] font-medium text-[#83807b] underline sm:block"
            >
              VIEW ALL
            </Link>
          </div>
          <div className="mt-10 grid w-full grid-cols-1 gap-8 sm:grid-cols-2 xl:mt-[80px] xl:grid-cols-4 xl:gap-6">
            {dropped.map((product) => (
              <ProductCard key={product.name} product={product} />
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1560px] px-5 py-16 sm:px-8 md:px-12 md:py-24 lg:px-16 xl:px-20">
          <div className="flex w-full flex-col gap-12 min-[1400px]:flex-row min-[1400px]:items-center min-[1400px]:justify-between">
            <div className="flex w-full max-w-[740px] gap-6">
              <div className="w-full max-w-[358px]">
                <ProductCard product={sunchildTop} />
              </div>
              <div className="hidden w-full max-w-[358px] sm:block">
                <ProductCard product={sunchildBottom} />
              </div>
            </div>
            <div className="w-full max-w-[560px]">
              <SplitTitle
                as="h2"
                text="The Signature Triangle."
                className="font-serif text-[32px] leading-[1.2] font-normal tracking-[-0.04em] text-olive md:text-[36px] md:leading-[62px] md:tracking-[-1.44px]"
              />
              <p
                data-intro
                className="mt-5 font-serif text-[18px] leading-[30px] text-body"
              >
                Every Piura piece is designed as one half of a whole — the
                Sunchild Triangle Top finishes what the Sunchild Triangle Bottom
                starts. Together, the full set is $98.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/shop?filter=sunchild"
                  data-btn
                  className="inline-flex h-[54px] shrink-0 items-center justify-center gap-3 bg-olive px-8 font-serif text-[16px] tracking-[0.32px] text-cream uppercase whitespace-nowrap"
                >
                  Shop the set
                  <CtaArrow tone="cream" />
                </Link>
                <p className="inline-flex h-[54px] shrink-0 items-center justify-center border border-olive px-8 font-serif text-[16px] tracking-[0.32px] text-olive uppercase whitespace-nowrap">
                  The full set — $98
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="moods"
          className="relative min-h-[560px] overflow-hidden px-5 py-24 sm:px-8 md:px-12 md:py-32 xl:min-h-[780px]"
        >
          <Polaroid
            src="/assets/home-mood-1.png"
            alt=""
            rotate="-14.86deg"
            width={278}
            height={370}
            className="top-16 left-6 hidden lg:block"
          />
          <Polaroid
            src="/assets/home-mood-2.png"
            alt=""
            rotate="-28.83deg"
            width={221}
            height={294}
            className="top-12 right-16 hidden lg:block"
          />
          <Polaroid
            src="/assets/home-mood-3.png"
            alt=""
            rotate="19.81deg"
            width={185}
            height={246}
            className="right-28 bottom-10 hidden lg:block"
          />
          <div className="relative mx-auto flex w-full max-w-[769px] flex-col items-center text-center">
            <p
              data-intro
              className="font-serif text-[16px] font-medium text-brown capitalize md:text-[18px]"
            >
              Nº 03 — The collection
            </p>
            <SplitTitle
              as="h2"
              text="Three moods. One endless summer."
              className="mt-3 font-serif text-[36px] leading-[1.2] font-normal tracking-[-0.04em] text-olive md:text-[56px] xl:text-[66px] xl:leading-[87px] xl:tracking-[-2.64px]"
            />
            <div className="mt-10 flex w-full flex-col items-center gap-5">
              {collections.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  data-btn
                  className="flex items-center gap-3"
                >
                  <span className="border-b border-olive pb-1 font-serif text-[18px] font-bold tracking-[0.88px] text-olive uppercase md:text-[22px]">
                    {item.label}
                  </span>
                  <span className="-rotate-[75deg]">
                    <img src="/assets/arrow-down-right.svg" alt="" />
                  </span>
                </Link>
              ))}
            </div>
            <Link
              href="/shop"
              data-btn
              className="mt-10 flex h-[54px] w-full max-w-[258px] items-center justify-center border border-olive px-[34px] font-serif text-[16px] tracking-[0.32px] text-olive uppercase"
            >
              Shop everything
            </Link>
          </div>
        </section>

        <section className="relative w-full overflow-hidden">
          <div data-photo className="relative min-h-[480px] w-full xl:min-h-[618px]">
            <img
              data-photo-img
              alt="Coastal town of Piura under a bright sky"
              src="/assets/home-city.png"
              className="absolute inset-0 size-full object-cover will-change-transform"
            />
            <div className="absolute inset-0 bg-black/44" />
            <div className="relative mx-auto flex min-h-[480px] w-full max-w-[1560px] flex-col items-center justify-center px-5 py-20 text-center xl:min-h-[618px]">
              <h2
                data-intro
                className="font-serif text-[36px] leading-[1.15] font-semibold text-white sm:text-[48px] xl:text-[64px]"
              >
                The city of <span className="italic">eternal heat.</span>
              </h2>
              <p
                data-intro
                className="mt-6 w-full max-w-[1005px] font-serif text-[18px] leading-[30px] text-white capitalize md:text-[20px] md:leading-[38px]"
              >
                Every piece is crafted in Piura, Peru — where our founder&apos;s
                story begins. The bikinis her grandmother sent from Peru were
                flattering, unlike anything she could find in the U.S. Every
                Piura piece carries that inheritance: sunshine, warmth, the
                ocean, and the endless-summer feeling of living by the water.
              </p>
              <Link
                href="/story"
                data-btn
                className="mt-10 flex h-[54px] w-full max-w-[285px] items-center justify-center gap-3 bg-[#f5f0ec] px-[34px] font-serif text-[16px] tracking-[0.32px] text-olive uppercase"
              >
                Read the story
                <CtaArrow />
              </Link>
            </div>
          </div>
        </section>

        <section
          id="lookbook"
          className="w-full overflow-hidden pt-20 pb-16 md:pt-[140px] md:pb-24"
        >
          <div className="mx-auto w-full max-w-[769px] px-5 text-center">
            <p
              data-intro
              className="font-serif text-[16px] font-medium text-brown capitalize md:text-[18px]"
            >
              Worn by real women
            </p>
            <SplitTitle
              as="h2"
              text={`“I've never felt this good in a bikini.”`}
              className="mt-3 font-serif text-[36px] leading-[1.2] font-normal tracking-[-0.04em] text-olive md:text-[56px] xl:text-[66px] xl:leading-[87px] xl:tracking-[-2.64px]"
            />
          </div>
          <div className="mt-12 md:mt-16">
            <HomeLookbook />
          </div>
          <p
            data-intro
            className="mx-auto mt-10 w-full max-w-[764px] px-5 text-center font-serif text-[18px] leading-[30px] text-body md:text-[20px] md:leading-[34px]"
          >
            Golden hour, candid, never over-edited — tag{" "}
            <a
              href="https://www.instagram.com/piuraswim"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#9b7e58] underline decoration-[#9b7e58] underline-offset-4"
            >
              @piuraswim
            </a>{" "}
            to be featured.
          </p>
        </section>

        <section className="mx-auto w-full max-w-[1560px] px-5 pb-16 sm:px-8 md:px-12 md:pb-24 lg:px-16 xl:px-20">
          <div className="grid w-full grid-cols-1 overflow-hidden min-[1400px]:grid-cols-2">
            <div className="flex flex-col justify-center bg-[rgba(110,115,85,0.85)] px-8 py-16 md:px-16 md:py-20">
              <p
                data-intro
                className="font-serif text-[16px] font-medium text-white md:text-[18px]"
              >
                The Signature Set
              </p>
              <SplitTitle
                as="h2"
                text="Miami Swim Week, twice over."
                className="mt-3 font-serif text-[36px] leading-[1.15] font-normal tracking-[-0.04em] text-white md:text-[56px] xl:text-[66px] xl:leading-[87px] xl:tracking-[-2.64px]"
              />
              <p
                data-intro
                className="mt-6 w-full max-w-[525px] font-serif text-[18px] leading-[30px] text-white md:text-[20px] md:leading-[34px]"
              >
                Piura walked Miami Swim Week in 2024 and returns for 2026 — the
                same silhouettes you see here, on the industry&apos;s
                most-watched runway. People fall for Piura when they see it on
                real women; the runway just made it official.
              </p>
              <Link
                href="/shop"
                data-btn
                className="mt-10 inline-flex h-[54px] w-fit shrink-0 items-center justify-center gap-3 bg-white px-8 font-serif text-[16px] tracking-[0.32px] text-olive uppercase whitespace-nowrap"
              >
                Shop the COLLECTION
                <CtaArrow />
              </Link>
            </div>
            <div data-photo className="relative min-h-[420px] w-full xl:min-h-[804px]">
              <img
                data-photo-img
                alt="Woman in a Piura bikini standing in the shallows"
                src="/assets/home-miami.png"
                className="absolute inset-0 size-full object-cover will-change-transform"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[889px] px-5 py-16 text-center md:py-24">
          <p
            data-intro
            className="font-serif text-[32px] leading-[1.2] font-semibold text-olive italic sm:text-[48px] xl:text-[64px]"
          >
            Confident. Sun-kissed. Free.
          </p>
          <p
            data-intro
            className="mt-6 font-serif text-[18px] leading-[30px] text-olive uppercase md:text-[20px] md:leading-[38px]"
          >
            Piura is a reminder to chase the sun, collect memories, and wear
            confidence through every destination.
          </p>
          <p
            data-intro
            className="mt-8 font-serif text-[16px] font-bold tracking-[0.02em] text-[#635743] uppercase md:text-[18px]"
          >
            Designed in Miami · Crafted in Peru
          </p>
        </section>

        <section className="relative w-full overflow-hidden">
          <div data-photo="hero" className="relative min-h-[560px] w-full xl:min-h-[697px]">
            <img
              data-photo-img
              alt="Woman in a white shirt on a tropical balcony"
              src="/assets/home-waitlist.png"
              className="absolute inset-0 size-full object-cover object-[center_20%] will-change-transform"
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(108.94deg, rgba(72, 72, 72, 0.35) 41.43%, rgba(170, 186, 191, 0) 87.95%)",
              }}
            />
            <div className="relative mx-auto flex min-h-[560px] w-full max-w-[1560px] flex-col justify-center px-5 py-20 sm:px-8 md:px-12 xl:min-h-[697px] xl:px-[115px]">
              <p
                data-intro
                className="font-serif text-[16px] font-medium tracking-[1.44px] text-[#fbf8f6] capitalize md:text-[18px]"
              >
                The next drop
              </p>
              <h2 className="mt-2 font-serif text-[48px] leading-[0.95] font-semibold tracking-[-0.04em] text-[#fbf8f6] sm:text-[72px] xl:text-[104px] xl:tracking-[-4.16px]">
                <span data-intro className="block">
                  The waitlist
                </span>
                <span data-intro className="block font-normal italic">
                  shops first.
                </span>
              </h2>
              <p
                data-intro
                className="mt-8 w-full max-w-[578px] font-serif text-[18px] leading-[30px] text-[#fbf8f6] md:text-[20px] md:leading-[34px]"
              >
                24-hour early access, a signed gift for the first hundred, and
                the full set for our top referrers. No discounts — only access.
              </p>
              <Link
                href="/waitlist"
                data-btn
                className="mt-10 flex h-[54px] w-full max-w-[320px] items-center justify-center gap-3 bg-[#fbf8f6] px-[34px] font-serif text-[16px] tracking-[0.32px] text-olive uppercase"
              >
                Join the waitlist
                <CtaArrow />
              </Link>
            </div>
          </div>
        </section>

        <ContactFeatures className="w-full bg-[rgba(245,240,236,0.48)]" />
      </main>
    </PageShell>
  );
}

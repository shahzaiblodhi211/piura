import { HomeFilmstrip } from "@/components/home-filmstrip";
import { HomeHeader } from "@/components/home-header";
import { HomeTicker } from "@/components/home-ticker";
import { PageShell } from "@/components/page-shell";
import { productSlug, products, type Product } from "@/lib/products";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Piura Swim — Coastlines is here",
  description:
    "The new era of Piura. Sun-drenched designs inspired by coastlines, as seen at Miami Swim Week 2026.",
};

const categories = [
  {
    label: "TOPS",
    href: "/shop",
    box: "h-[103px] w-[76px]",
    crop: { width: "204.2%", height: "300.83%", left: "-104.2%", top: "-39.36%" },
  },
  {
    label: "BOTTOMS",
    href: "/shop",
    box: "h-[74px] w-[98px]",
    crop: { width: "188.63%", height: "497.78%", left: "0%", top: "-264.62%" },
  },
  {
    label: "THE CLASSICS",
    href: "/shop",
    box: "h-[105px] w-[71px]",
    crop: { width: "204.77%", height: "276.02%", left: "-104.77%", top: "-138.96%" },
  },
  {
    label: "TOTE",
    href: "/shop",
    box: "h-[93px] w-[71px]",
    crop: { width: "185.99%", height: "283.82%", left: "0%", top: "-33.53%" },
  },
];

function OutlineButton({
  href,
  children,
  dark = false,
}: {
  href: string;
  children: string;
  dark?: boolean;
}) {
  return (
    <Link
      href={href}
      data-btn
      className={`inline-flex h-[52px] items-center justify-center border-2 px-10 font-bebas text-[18px] tracking-[0.36px] uppercase whitespace-nowrap ${
        dark
          ? "border-ink text-ink"
          : "border-white text-white"
      }`}
    >
      {children}
    </Link>
  );
}

function MeetCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${productSlug(product.name)}`} className="group flex flex-col gap-[18px]">
      <span className="relative block aspect-[382/536] w-full overflow-hidden bg-[#f5f2ed]">
        <img
          alt={product.alt}
          src={product.src}
          className="size-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.045]"
        />
        <span className="absolute top-0 left-0 flex h-7 w-[92px] items-center justify-center bg-ink font-bebas text-[14px] tracking-[0.56px] text-white">
          PREORDER
        </span>
      </span>
      <span className="font-bebas text-[18px] tracking-[0.88px] text-ink uppercase sm:text-[22px]">
        {product.name}
      </span>
    </Link>
  );
}

function CollectionTile({
  src,
  label,
  href,
  crop,
}: {
  src: string;
  label: string;
  href: string;
  crop?: { width: string; height: string; left: string; top: string };
}) {
  return (
    <Link
      href={href}
      data-photo="still"
      className="group relative block min-h-[420px] overflow-hidden lg:min-h-[785px]"
    >
      <span className="absolute inset-0 origin-center transition-transform duration-700 ease-out group-hover:scale-[1.035]">
        {crop ? (
          <img alt="" src={src} className="absolute max-w-none" style={crop} />
        ) : (
          <img alt="" src={src} className="absolute inset-0 size-full object-cover" />
        )}
      </span>
      <span className="absolute bottom-8 left-6 font-bebas text-[40px] text-white underline decoration-[6px] underline-offset-[14px] transition-transform duration-500 ease-out group-hover:-translate-y-1 sm:bottom-12 sm:left-12 sm:text-[60px]">
        {label}
      </span>
    </Link>
  );
}

export default function Home() {
  return (
    <PageShell hero>
      <main className="w-full">
        <section className="relative min-h-[640px] w-full xl:min-h-[751px]">
          <div className="absolute inset-0">
            <div className="absolute inset-0 overflow-hidden">
              <div data-hero-frame className="absolute inset-0">
                <img
                  alt="Two women in Piura bikinis on the beach"
                  src="/assets/home-coast-hero.png"
                  className="absolute top-[-26.64%] left-0 h-[138.5%] w-full max-w-none"
                />
              </div>
            </div>
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, rgba(0, 0, 0, 0.2) 7.55%, rgba(255, 255, 255, 0) 17.6%), linear-gradient(90deg, rgba(88, 88, 88, 0.207) 41.71%, rgba(255, 255, 255, 0) 99.92%)",
              }}
            />
          </div>
          <HomeHeader />
          <div className="relative mx-auto flex min-h-[640px] w-full max-w-[1560px] flex-col justify-end px-5 pt-36 pb-16 sm:px-8 xl:min-h-[751px] xl:px-[60px] xl:pt-[186px] xl:pb-[100px]">
            <p data-intro className="font-serif text-[16px] tracking-[-0.32px] text-[#f1f1f1]">
              THE WAIT IS OVER
            </p>
            <h1 className="mt-2 font-bebas text-[72px] leading-none text-white sm:text-[110px] xl:text-[150px]">
              <span data-intro className="block">
                COASTLINES
              </span>
            </h1>
            <p
              data-intro
              className="font-serif text-[40px] leading-none text-white italic sm:text-[56px] xl:text-[78px] xl:tracking-[-3.12px]"
            >
              IS HERE
            </p>
            <div data-intro className="mt-6 max-w-[206px] font-bebas text-[18px] leading-normal tracking-[0.36px] text-white">
              <p>
                The new era of <span className="text-[20px] tracking-[0.4px]">PIURA</span>
              </p>
              <p>As seen at Miami Swim Week 2026</p>
            </div>
            <div data-intro className="mt-8">
              <OutlineButton href="/waitlist">PREORDER NOW</OutlineButton>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1560px] px-5 py-16 sm:px-8 md:py-20 xl:px-8">
          <h2
            data-reveal
            className="text-center font-bebas text-[48px] leading-none text-ink sm:text-[64px] xl:text-[80px]"
          >
            OUR CATEGORIES
          </h2>
          <div data-reveal className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
            {categories.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group flex h-[125px] items-center justify-center gap-4 rounded-[2px] bg-[#f6f1ee] px-4 transition-colors duration-300 hover:bg-[#efe6df]"
              >
                <span className={`relative shrink-0 overflow-hidden ${item.box}`}>
                  <span className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105">
                    <img
                      alt=""
                      src="/assets/home-cat-sheet.png"
                      className="absolute max-w-none"
                      style={item.crop}
                    />
                  </span>
                </span>
                <span className="font-bebas text-[28px] text-ink sm:text-[34px]">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1560px] px-5 pb-16 sm:px-8 xl:px-0">
          <div data-reveal className="text-center">
            <h2 className="font-bebas text-[48px] leading-none text-ink sm:text-[64px] xl:text-[80px]">
              Meet The New PIURA
            </h2>
            <p className="mx-auto mt-4 max-w-[354px] font-serif text-[16px] leading-[26px] text-ink">
              <span className="uppercase">S</span>
              un-drenched designs inspired by coastlines, made for your next destination
            </p>
          </div>
          <div data-reveal className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-x-[11px]">
            {products.slice(0, 4).map((product) => (
              <MeetCard key={product.name} product={product} />
            ))}
          </div>
          <div data-reveal className="mt-12 flex justify-center">
            <OutlineButton href="/shop" dark>
              PREORDER THE COLLECTION
            </OutlineButton>
          </div>
        </section>

        <HomeTicker />

        <section className="grid w-full lg:grid-cols-2">
          <div data-photo="still" className="group relative min-h-[420px] overflow-hidden lg:min-h-[685px]">
            <span className="absolute inset-0 origin-center transition-transform duration-700 ease-out group-hover:scale-[1.03]">
              <img
                alt="The Piura tote on the sand"
                src="/assets/home-tote.png"
                className="absolute top-0 left-[-13.62%] h-[113.14%] w-[127.24%] max-w-none"
              />
            </span>
          </div>
          <div className="relative flex flex-col justify-center bg-[#f6f3ee] px-6 py-16 sm:px-12 lg:px-16 xl:px-[70px]">
            <span className="piura-float absolute top-8 right-6 z-10 flex size-[160px] flex-col items-center justify-center rounded-full bg-[#f6d2ca] text-center font-bebas text-[22px] leading-[1.05] tracking-[-0.24px] text-ink sm:right-10">
              <span>FREE TOTE</span>
              <span>WITH 2 BIKINI</span>
              <span>SETS</span>
              <img src="/assets/home-heart.svg" alt="" className="mt-1.5" />
            </span>
            <div data-reveal>
              <p className="font-serif text-[16px] tracking-[-0.32px] text-ink">
              THE PIURA TOTE
            </p>
              <h2 className="mt-4 max-w-[520px] font-bebas text-[64px] leading-[0.9] text-ink sm:text-[80px] xl:text-[100px] xl:leading-[87px]">
                <span className="block">TAKE PIURA</span>
                <span className="block">WITH YOU</span>
              </h2>
              <p className="mt-6 max-w-[418px] font-serif text-[18px] leading-[26px] tracking-[-0.36px] text-ink">
                The perfect beach bag for sunny days, salty hair and every getaway.
                Shop the PIURA tote on its own — or get it free when you buy 2 bikini
                sets.
              </p>
              <Link
                href="/shop"
                data-btn
                className="mt-8 inline-flex h-[52px] w-fit items-center justify-center bg-ink px-10 font-bebas text-[18px] tracking-[0.36px] text-[#f6f3ee] uppercase"
              >
                SHOP THE COLLECTION
              </Link>
            </div>
          </div>
        </section>

        <section className="w-full pt-16 md:pt-24">
          <div
            data-reveal
            className="mx-auto flex w-full max-w-[1560px] flex-col gap-8 px-5 sm:px-8 lg:flex-row lg:items-end lg:justify-between xl:px-12"
          >
            <h2 className="font-bebas text-[48px] leading-none text-ink sm:text-[64px] xl:text-[80px]">
              OUR COLLECTION
            </h2>
            <OutlineButton href="/shop" dark>
              EXPLORE THE COLLECTION
            </OutlineButton>
          </div>
          <div className="mt-10 grid lg:grid-cols-2">
            <CollectionTile src="/assets/home-coll-tops.png" label="TOPS" href="/shop" />
            <CollectionTile
              src="/assets/home-coll-bottoms.png"
              label="BOTTOMS"
              href="/shop"
              crop={{ width: "100%", height: "148.38%", left: "0%", top: "-20.69%" }}
            />
          </div>
          <CollectionTile src="/assets/home-coll-classics.png" label="THE CLASSICS" href="/shop" />
          <div className="grid lg:grid-cols-2">
            <CollectionTile src="/assets/home-coll-sun.png" label="SUNCHILD" href="/shop" />
            <CollectionTile src="/assets/home-coll-moon.png" label="MOONCHILD" href="/shop" />
          </div>
        </section>

        <section className="w-full overflow-hidden pt-16 md:pt-24">
          <h2
            data-reveal
            className="px-5 text-center font-bebas text-[40px] leading-none text-ink sm:text-[56px] xl:text-[80px]"
          >
            real girls, real destinations
          </h2>
          <HomeFilmstrip />
        </section>
      </main>
    </PageShell>
  );
}

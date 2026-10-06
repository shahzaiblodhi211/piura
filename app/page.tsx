import { HomeFilmstrip } from "@/components/home-filmstrip";
import { HomeHeader } from "@/components/home-header";
import { HomeTicker } from "@/components/home-ticker";
import { PageShell } from "@/components/page-shell";
import { piecePrices, productPriceLine, productSlug, products, type Product } from "@/lib/products";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Piura Swim — Coastlines is here",
  description:
    "The new era of Piura. Sun-drenched designs inspired by coastlines, as seen at Miami Swim Week 2026.",
};

const categories = [
  {
    label: "COASTLINES",
    href: "/shop?filter=coastlines",
    box: "h-12 w-[76px] sm:h-14 sm:w-[92px] xl:h-[72px] xl:w-[116px]",
    src: "/assets/cat-coastlines.png",
  },
  {
    label: "TOPS",
    href: "/shop?filter=tops",
    box: "h-16 w-12 sm:h-20 sm:w-[60px] xl:h-[103px] xl:w-[76px]",
    crop: { width: "204.2%", height: "300.83%", left: "-104.2%", top: "-39.36%" },
  },
  {
    label: "BOTTOMS",
    href: "/shop?filter=bottoms",
    box: "h-12 w-16 sm:h-14 sm:w-20 xl:h-[74px] xl:w-[98px]",
    crop: { width: "188.63%", height: "497.78%", left: "0%", top: "-264.62%" },
  },
  {
    label: "PIURA CLASSICS",
    href: "/shop?filter=classics",
    box: "h-16 w-11 sm:h-20 sm:w-14 xl:h-[105px] xl:w-[71px]",
    crop: { width: "204.77%", height: "276.02%", left: "-104.77%", top: "-138.96%" },
  },
  {
    label: "ACCESSORIES",
    href: "/#tote",
    box: "h-14 w-11 sm:h-[72px] sm:w-14 xl:h-[93px] xl:w-[71px]",
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
      className={`inline-flex h-11 items-center justify-center border-2 px-6 font-bebas text-[16px] tracking-[0.32px] uppercase whitespace-nowrap sm:h-[52px] sm:px-10 sm:text-[18px] ${
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
      <span className="relative block aspect-[382/536] w-full overflow-hidden">
        <img
          alt={product.alt}
          src={product.src}
          className="size-full object-cover object-[center_18%] transition-transform duration-700 ease-out group-hover:scale-[1.045]"
        />
        <span className="absolute top-0 left-0 flex h-6 w-[78px] items-center justify-center bg-ink font-bebas text-[12px] tracking-[0.48px] text-white sm:h-7 sm:w-[92px] sm:text-[14px]">
          PREORDER
        </span>
      </span>
      <span className="flex flex-col gap-2">
        <span className="font-bebas text-[15px] leading-tight tracking-[0.6px] text-ink uppercase sm:text-[18px] lg:text-[22px]">
          {product.name}
        </span>
        {productPriceLine(product) ? (
          <span className="font-serif text-[14px] leading-none tracking-[0.28px] text-olive sm:text-[16px]">
            {productPriceLine(product)}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

function CollectionTile({
  src,
  label,
  href,
  focus = "object-[center_28%]",
}: {
  src: string;
  label: string;
  href: string;
  focus?: string;
}) {
  return (
    <Link
      href={href}
      data-photo="still"
      className="group relative block h-[300px] overflow-hidden sm:h-[400px] md:h-[520px] lg:h-[660px] xl:h-[785px]"
    >
      <span className="absolute inset-0 origin-center transition-transform duration-700 ease-out group-hover:scale-[1.035]">
        <img alt="" src={src} className={`absolute inset-0 size-full object-cover ${focus}`} />
      </span>
      <span className="absolute bottom-5 left-5 font-bebas text-[28px] text-white underline decoration-[3px] underline-offset-[8px] transition-transform duration-500 ease-out group-hover:-translate-y-1 sm:bottom-8 sm:left-8 sm:text-[40px] sm:decoration-[4px] md:text-[52px] lg:bottom-12 lg:left-12 lg:text-[60px] lg:decoration-[6px] lg:underline-offset-[14px]">
        {label}
      </span>
    </Link>
  );
}

export default function Home() {
  return (
    <PageShell hero>
      <main className="w-full">
        <section className="relative h-[480px] w-full sm:h-[560px] md:h-[640px] xl:h-[751px]">
          <div className="absolute inset-0">
            <div className="absolute inset-0 overflow-hidden">
              <div data-hero-frame className="absolute inset-0">
                <img
                  alt="Two women in Piura bikinis on the beach"
                  src="/assets/home-coast-hero.jpg"
                  className="absolute inset-0 size-full object-cover object-[70%_46%]"
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
          <div className="relative mx-auto flex h-full w-full max-w-[1560px] flex-col justify-end px-5 pt-24 pb-10 sm:px-8 sm:pt-28 sm:pb-14 md:pb-16 xl:px-[60px] xl:pt-[186px] xl:pb-[100px]">
            <p data-intro className="font-serif text-[14px] tracking-[-0.28px] text-[#f1f1f1] sm:text-[16px]">
              THE WAIT IS OVER
            </p>
            <h1 className="mt-2 font-bebas text-[52px] leading-none text-white sm:text-[84px] md:text-[120px] xl:text-[150px]">
              <span data-intro className="block">
                COASTLINES
              </span>
            </h1>
            <p
              data-intro
              className="font-serif text-[30px] leading-none text-white italic sm:text-[44px] md:text-[60px] xl:text-[78px] xl:tracking-[-3.12px]"
            >
              IS HERE
            </p>
            <div data-intro className="mt-5 max-w-[206px] font-bebas text-[16px] leading-normal tracking-[0.32px] text-white sm:mt-6 sm:text-[18px]">
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

        <section className="mx-auto w-full max-w-[1560px] px-5 py-12 sm:px-8 sm:py-16 md:py-20 xl:px-8">
          <h2
            data-reveal
            className="text-center font-bebas text-[40px] leading-none text-ink sm:text-[56px] md:text-[68px] xl:text-[80px]"
          >
            SHOP PIURA
          </h2>
          <div data-reveal className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-5 lg:gap-5">
            {categories.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group flex min-h-[104px] flex-col items-center justify-center gap-2 rounded-[2px] bg-[#f6f1ee] px-3 py-3 text-center transition-colors duration-300 hover:bg-[#efe6df] last:col-span-2 last:w-[calc(50%-6px)] last:justify-self-center sm:min-h-[120px] sm:flex-row sm:gap-3 sm:px-4 sm:last:w-[calc(50%-8px)] lg:flex-col lg:last:col-span-1 lg:last:w-auto lg:last:justify-self-stretch xl:min-h-[132px] xl:flex-row xl:gap-4"
              >
                <span className={`relative shrink-0 overflow-hidden ${item.box}`}>
                  <span className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105">
                    {item.src ? (
                      <img alt="" src={item.src} className="absolute inset-0 size-full object-contain" />
                    ) : (
                      <img
                        alt=""
                        src="/assets/home-cat-sheet.png"
                        className="absolute max-w-none"
                        style={item.crop}
                      />
                    )}
                  </span>
                </span>
                <span className="font-bebas text-[18px] leading-none text-ink sm:text-[22px] lg:text-[20px] xl:text-[28px]">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1680px] px-5 pb-12 sm:px-8 sm:pb-16">
          <div data-reveal className="text-center">
            <h2 className="font-bebas text-[40px] leading-none text-ink sm:text-[56px] md:text-[68px] xl:text-[80px]">
              Meet The New PIURA
            </h2>
            <p className="mx-auto mt-3 font-serif text-[15px] leading-[24px] text-ink sm:mt-4 sm:text-[16px] sm:leading-[26px] md:text-[18px]">
              Cheeky. Flattering. Made to be noticed.
            </p>
          </div>
          <div data-reveal className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:mt-12 sm:gap-x-4 sm:gap-y-12 lg:grid-cols-4 lg:gap-x-[11px]">
            {products.slice(0, 4).map((product) => (
              <MeetCard key={product.name} product={product} />
            ))}
          </div>
          <div data-reveal className="mt-12 flex justify-center">
            <OutlineButton href="/shop?filter=coastlines" dark>
              PREORDER THE COLLECTION
            </OutlineButton>
          </div>
        </section>

        <HomeTicker />

        <section id="tote" className="grid w-full scroll-mt-6 lg:grid-cols-2">
          <div data-photo="still" className="group relative h-[280px] overflow-hidden sm:h-[380px] md:h-[480px] lg:h-[580px] xl:h-[685px]">
            <span className="absolute inset-0 origin-center transition-transform duration-700 ease-out group-hover:scale-[1.03]">
              <img
                alt="The Piura tote on the sand"
                src="/assets/home-tote.jpg"
                className="absolute inset-0 size-full object-cover object-[center_32%]"
              />
            </span>
          </div>
          <div className="relative flex flex-col justify-center bg-[#f6f3ee] px-5 py-12 sm:px-12 sm:py-16 lg:px-16 xl:px-[70px]">
            <span className="piura-float absolute top-5 right-4 z-10 flex size-[108px] flex-col items-center justify-center rounded-full bg-[#f6d2ca] text-center font-bebas text-[14px] leading-[1.05] tracking-[-0.2px] text-ink sm:top-8 sm:right-8 sm:size-[140px] sm:text-[18px] lg:size-[160px] lg:text-[22px]">
              <span>FREE TOTE</span>
              <span>WITH 2 BIKINI</span>
              <span>SETS</span>
              <img src="/assets/home-heart.svg" alt="" className="mt-1.5" />
            </span>
            <div data-reveal>
              <p className="font-serif text-[16px] tracking-[-0.32px] text-ink">
              THE PIURA TOTE
            </p>
              <h2 className="mt-3 max-w-[min(520px,calc(100%-120px))] font-bebas text-[44px] leading-[0.9] text-ink sm:mt-4 sm:max-w-[min(520px,calc(100%-150px))] sm:text-[68px] lg:text-[84px] xl:text-[100px] xl:leading-[87px]">
                <span className="block">TAKE PIURA</span>
                <span className="block">WITH YOU</span>
              </h2>
              <p className="mt-5 max-w-[418px] font-serif text-[16px] leading-[24px] tracking-[-0.32px] text-ink sm:mt-6 sm:text-[18px] sm:leading-[26px]">
                The perfect beach bag for sunny days, salty hair and every getaway.
                Shop the PIURA tote on its own for ${piecePrices.tote} — or get it free
                when you buy 2 bikini sets.
              </p>
              <Link
                href="/shop"
                data-btn
                className="mt-6 inline-flex h-11 w-fit items-center justify-center bg-ink px-6 font-bebas text-[16px] tracking-[0.32px] text-[#f6f3ee] uppercase sm:mt-8 sm:h-[52px] sm:px-10 sm:text-[18px]"
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
            <h2 className="font-bebas text-[40px] leading-none text-ink sm:text-[56px] md:text-[68px] xl:text-[80px]">
              OUR COLLECTION
            </h2>
            <OutlineButton href="/shop" dark>
              EXPLORE THE COLLECTION
            </OutlineButton>
          </div>
          <div className="mt-10 grid lg:grid-cols-2">
            <CollectionTile src="/assets/home-coll-tops.jpg" label="SARA" href="/shop?filter=sara" />
            <CollectionTile
              src="/assets/home-coll-bottoms.jpg"
              label="BALI"
              href="/shop?filter=bali"
              focus="object-[center_36%]"
            />
          </div>
          <CollectionTile src="/assets/home-coll-classics.jpg" label="MARINA" href="/shop?filter=marina" />
          <div className="grid lg:grid-cols-2">
            <CollectionTile src="/assets/home-coll-sun.jpg" label="SUNCHILD" href="/shop?filter=sunchild" />
            <CollectionTile src="/assets/home-coll-moon.jpg" label="MOONCHILD" href="/shop?filter=moonchild" />
          </div>
        </section>

        <section className="w-full overflow-hidden pt-16 md:pt-24">
          <h2
            data-reveal
            className="px-5 text-center font-bebas text-[32px] leading-none text-ink sm:text-[48px] md:text-[64px] xl:text-[80px]"
          >
            real girls, real destinations
          </h2>
          <HomeFilmstrip />
        </section>
      </main>
    </PageShell>
  );
}

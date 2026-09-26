import { ContactFeatures } from "@/components/contact-features";
import { CtaArrow } from "@/components/cta-arrow";
import { PageShell } from "@/components/page-shell";
import { SplitTitle } from "@/components/split-title";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Story — Piura Swim",
  description:
    "Born from a dream I'd had since I was young. Designed in Miami. Crafted in Piura, Peru — the city of eternal heat.",
};

function ChapterCopy({
  eyebrow,
  title,
  paragraphs,
  footer,
  credit,
  cta,
}: {
  eyebrow: string;
  title: string;
  paragraphs: string[];
  footer?: string;
  credit?: string;
  cta?: boolean;
}) {
  return (
    <div className="flex h-full w-full flex-col justify-center bg-[rgba(245,240,236,0.48)] px-5 py-12 sm:px-8 md:px-12 min-[1400px]:aspect-square min-[1400px]:px-[70px] min-[1400px]:py-16">
      <div className="w-full max-w-[630px]">
        <p
          data-reveal
          className="font-serif text-[16px] leading-normal font-normal text-[#635743] md:text-[18px]"
        >
          {eyebrow}
        </p>
        <SplitTitle
          as="h2"
          text={title}
          className="mt-2 font-serif text-[28px] leading-[1.2] font-normal tracking-[-0.04em] text-olive sm:text-[32px] md:text-[36px] md:tracking-[-1.44px]"
        />
        <div className="mt-6 flex flex-col gap-6 md:mt-8">
          {paragraphs.map((paragraph) => (
            <p
              key={paragraph.slice(0, 24)}
              data-reveal
              className="font-serif text-[16px] leading-[26px] font-normal text-body md:text-[18px] md:leading-[28px]"
            >
              {paragraph}
            </p>
          ))}
        </div>
        {cta ? (
          <Link
            href="/#shop"
            data-btn
            className="mt-10 flex h-[54px] w-fit items-center justify-center gap-3 border border-olive px-[34px] font-serif text-[16px] tracking-[0.32px] text-olive uppercase whitespace-nowrap"
          >
            Wear the story
            <CtaArrow />
          </Link>
        ) : null}
      </div>
      {footer ? (
        <p
          data-reveal
          className="mt-10 font-serif text-[14px] leading-normal font-normal text-olive uppercase"
        >
          {footer}
        </p>
      ) : null}
      {credit ? (
        <p
          data-reveal
          className="mt-10 font-serif text-[14px] leading-normal font-medium tracking-[-0.32px] text-olive uppercase md:text-[16px]"
        >
          {credit}
        </p>
      ) : null}
    </div>
  );
}

function ChapterPhoto({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      data-photo
      className={`w-full min-[1400px]:w-1/2 min-[1400px]:shrink-0 ${className}`}
    >
      <div className="relative aspect-square w-full overflow-hidden">
        <img
          data-photo-img
          alt={alt}
          src={src}
          className="absolute inset-0 size-full object-cover will-change-transform"
        />
      </div>
    </div>
  );
}

export default function StoryPage() {
  return (
    <PageShell>
      <main id="story" className="w-full">
        <section className="mx-auto w-full max-w-[1560px] px-5 pt-16 text-center sm:px-8 md:px-12 md:pt-24 xl:px-20 xl:pt-[119px]">
          <p
            data-intro
            className="font-serif text-[16px] leading-normal font-medium text-brown md:text-[18px]"
          >
            Our Story
          </p>
          <SplitTitle
            text="Born from a dream I'd had since I was young."
            className="mx-auto mt-3 w-full max-w-[506px] font-serif text-[26px] leading-[1.35] font-normal tracking-[-0.02em] text-olive sm:text-[30px] md:text-[32px] md:leading-[48px] md:tracking-[-0.64px]"
          />
        </section>

        <section className="mt-16 w-full md:mt-24 xl:mt-[170px]">
          <div className="mx-auto flex w-full max-w-[1560px] flex-col min-[1400px]:flex-row min-[1400px]:items-center">
            <ChapterPhoto
              src="/assets/story-miami.png"
              alt="Woman on the beach standing by a hammock, looking toward the water"
            />
            <div className="w-full min-[1400px]:w-1/2">
              <ChapterCopy
                eyebrow="Chapter One · Miami"
                title="Practically raised in a bikini."
                paragraphs={[
                  "“Growing up in Miami, my family spent almost every weekend at the beach, so I practically grew up in a bikini. My favorite bikinis were always the ones my grandma would bring me from Peru — they were flattering, unique, and unlike anything I could find in the U.S.",
                  "As I got older, I realized I still couldn't find bikinis that felt timeless, feminine, and flattering in the way I wanted. Most styles felt too bulky or simply weren't my style, so I always found myself ordering swimwear from overseas. That's when I knew one day I wanted to create my own.",
                  "Years later, after building a following on social media and helping promote so many other brands, I realized it was finally time to bet on myself. I saved up the money I earned bartending and poured everything into starting Piura, despite having no idea what I was doing. I just knew the only way to make my dream happen was to start.”",
                ]}
                credit="Isabella Cuneo, Founder"
              />
            </div>
          </div>
        </section>

        <section className="w-full">
          <div className="mx-auto flex w-full max-w-[1560px] flex-col min-[1400px]:flex-row min-[1400px]:items-center">
            <ChapterPhoto
              src="/assets/story-peru.png"
              alt="Woman from behind in a white shirt, adjusting her hair in the sun"
              className="min-[1400px]:order-2"
            />
            <div className="w-full min-[1400px]:order-1 min-[1400px]:w-1/2">
              <ChapterCopy
                eyebrow="Chapter Two · Peru"
                title="Piura — the city of eternal heat."
                paragraphs={[
                  "“Piura is a coastal city in northern Peru known as the ‘City of Eternal Heat.’ Since my bikinis were inspired by Peru and originally made there, the name felt like the perfect fit.",
                  "To me, Piura represents sunshine, warmth, the ocean, and that endless summer feeling I wanted the brand to capture. It reminds me of where I come from while representing the life I've always loved — chasing the sun and living by the water. The name always felt like it was meant to be.”",
                ]}
                footer="Every piece is crafted in Piura, Peru — the city of eternal heat."
              />
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1560px] px-5 py-20 text-center sm:px-8 md:px-12 md:py-28 xl:px-20 xl:py-[200px]">
          <SplitTitle
            as="h2"
            text="Confident. Sun-kissed. Free."
            className="mx-auto font-serif text-[36px] leading-[1.15] font-semibold text-olive italic sm:text-[48px] md:text-[64px]"
          />
        </section>

        <section className="w-full">
          <div className="mx-auto flex w-full max-w-[1560px] flex-col min-[1400px]:flex-row min-[1400px]:items-center">
            <ChapterPhoto
              src="/assets/story-now.png"
              alt="Woman in sunglasses lying in a hammock on the sand"
            />
            <div className="w-full min-[1400px]:w-1/2">
              <ChapterCopy
                eyebrow="Chapter Three · Now"
                title="More than a swimwear brand."
                paragraphs={[
                  "“Inspired by my roots in Peru and life in Miami, Piura became more than a swimwear brand. It's a celebration of endless summers, iconic coastlines, and the confidence that comes from putting on a bikini you truly feel amazing in.",
                  "My hope is that every woman who wears Piura feels confident, beautiful, and ready to chase the sun, collect memories, and embrace every adventure.”",
                ]}
                cta
              />
            </div>
          </div>
        </section>

        <ContactFeatures className="w-full bg-[rgba(245,240,236,0.48)]" />
      </main>
    </PageShell>
  );
}

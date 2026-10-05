import { PageShell } from "@/components/page-shell";
import { SizeChart } from "@/components/size-chart";
import { SizeDiagram } from "@/components/size-diagram";
import { SplitTitle } from "@/components/split-title";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Size Guide — Piura Swim",
  description:
    "Take three measurements, match them to the chart, and you're set. Every Piura piece runs true to size.",
};

const steps = [
  {
    letter: "A",
    title: "Bust",
    body: "Measure around the fullest part of your chest, tape level and soft.",
  },
  {
    letter: "B",
    title: "Waist",
    body: "Measure around the narrowest part of your natural waistline.",
  },
  {
    letter: "C",
    title: "Hips",
    body: "Feet together, measure around the fullest part of your hips and seat.",
  },
];

export default function SizeGuidePage() {
  return (
    <PageShell>
      <main className="w-full">
        <section className="mx-auto w-full max-w-[1560px] px-5 pt-16 sm:px-8 md:px-12 md:pt-24 lg:px-16 xl:px-20 xl:pt-[160px]">
          <p
            data-intro
            className="font-serif text-[16px] leading-normal font-medium text-brown capitalize md:text-[18px]"
          >
            The fit guide
          </p>
          <SplitTitle
            text="Fit is everything."
            className="mt-3 font-serif text-[36px] leading-[1.15] font-normal tracking-[-0.04em] text-olive sm:text-[44px] md:text-[56px] md:leading-[73px] md:tracking-[-2.24px]"
          />
          <p
            data-intro
            className="mt-6 w-full max-w-[669px] font-serif text-[18px] leading-[30px] font-normal text-body md:mt-8 md:text-[20px]"
          >
            Swimwear is personal — so we make it simple. Take three
            measurements, match them to the chart, and you&apos;re set. Every
            Piura piece runs true to size, Small through X-Large.
          </p>
        </section>

        <section className="mx-auto w-full max-w-[1560px] px-5 py-16 sm:px-8 md:px-12 md:py-24 lg:px-16 xl:px-20">
          <div className="flex w-full flex-col gap-12 min-[1400px]:flex-row min-[1400px]:items-start min-[1400px]:gap-16">
            <div
              data-photo
              className="flex aspect-square w-full max-w-[578px] items-center justify-center bg-[#fcfbf8] min-[1400px]:shrink-0"
            >
              <img
                data-photo-img
                alt="Line drawing of a woman in a bikini"
                src="/assets/size-figure.png"
                className="h-[80%] w-auto max-w-[70%] object-contain"
              />
            </div>
            <div className="w-full max-w-[669px] min-[1400px]:pt-0">
              <SplitTitle
                as="h2"
                text="Three measurements, one perfect fit."
                className="font-serif text-[32px] leading-[1.15] font-normal tracking-[-0.04em] text-olive sm:text-[44px] md:text-[56px] md:leading-[73px] md:tracking-[-2.24px]"
              />
              <p
                data-intro
                className="mt-6 w-full font-serif text-[18px] leading-[30px] font-normal text-body md:mt-8 md:text-[20px]"
              >
                Use a soft tape measure over bare skin or fitted underwear —
                keep it snug, never tight.
              </p>
              <ol className="mt-10 flex flex-col gap-[28px] md:mt-14">
                {steps.map((step) => (
                  <li
                    key={step.letter}
                    data-reveal
                    className="flex w-full items-start gap-5"
                  >
                    <div className="relative size-[54px] shrink-0">
                      <img src="/assets/size-letter-ring.svg" alt="" />
                      <span className="absolute inset-0 flex items-center justify-center font-serif text-[20px] tracking-[-0.8px] text-[#443816]">
                        {step.letter}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1">
                      <p className="font-serif text-[16px] leading-[30px] font-semibold text-body uppercase">
                        {step.title}
                      </p>
                      <p className="font-serif text-[16px] leading-[30px] font-normal text-body">
                        {step.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1560px] px-5 py-16 sm:px-8 md:px-12 lg:px-16 xl:px-20 xl:pt-8">
          <div className="flex w-full flex-col gap-10 min-[1400px]:flex-row min-[1400px]:items-start min-[1400px]:justify-between">
            <div className="w-full max-w-[669px]">
              <p
                data-intro
                className="font-serif text-[16px] leading-normal font-medium text-brown uppercase md:text-[18px]"
              >
                Size Guide
              </p>
              <h2 className="mt-3 font-serif text-[36px] leading-[1.15] font-normal tracking-[-0.04em] text-olive sm:text-[44px] md:text-[56px] md:leading-[73px] md:tracking-[-2.24px]">
                <span className="inline-block overflow-hidden pb-[0.08em] align-bottom [perspective:220px]">
                  <span
                    data-title-word
                    className="inline-block origin-bottom will-change-transform [transform-style:preserve-3d]"
                  >
                    Find{"\u00A0"}
                  </span>
                </span>
                <span className="inline-block overflow-hidden pb-[0.08em] align-bottom [perspective:220px]">
                  <span
                    data-title-word
                    className="inline-block origin-bottom will-change-transform [transform-style:preserve-3d]"
                  >
                    your{"\u00A0"}
                  </span>
                </span>
                <span className="inline-block overflow-hidden pb-[0.08em] align-bottom [perspective:220px]">
                  <span
                    data-title-word
                    className="inline-block origin-bottom will-change-transform [transform-style:preserve-3d] italic"
                  >
                    perfect{"\u00A0"}
                  </span>
                </span>
                <span className="inline-block overflow-hidden pb-[0.08em] align-bottom [perspective:220px]">
                  <span
                    data-title-word
                    className="inline-block origin-bottom will-change-transform [transform-style:preserve-3d] italic"
                  >
                    fit
                  </span>
                </span>
              </h2>
              <p
                data-intro
                className="mt-6 w-full font-serif text-[18px] leading-[30px] font-normal text-body md:mt-8 md:text-[20px]"
              >
                Our swimwear is designed to fit beautifully. Use the chart below
                to find your ideal size based on your measurements.
              </p>
            </div>
            <div data-reveal className="hidden w-full max-w-[320px] md:block">
              <SizeDiagram />
            </div>
          </div>
          <div className="mt-12 md:mt-16">
            <SizeChart />
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1560px] px-5 py-12 sm:px-8 md:px-12 lg:px-16 xl:px-20">
          <div className="grid w-full grid-cols-1 gap-[30px] md:grid-cols-2">
            <div
              data-reveal
              className="flex min-h-[212px] w-full flex-col justify-center bg-[#9b7e58] px-8 py-10 md:px-[70px]"
            >
              <p className="font-serif text-[18px] leading-normal font-semibold tracking-[0.72px] text-white uppercase">
                Between sizes?
              </p>
              <p className="mt-4 max-w-[500px] font-serif text-[16px] leading-[30px] font-normal text-[#f6f6f6]">
                Size up in bottoms for more coverage, down for extra cheeky.
                Triangle tops tie to you, so they flex a full size.
              </p>
            </div>
            <div
              data-reveal
              className="flex min-h-[212px] w-full flex-col justify-center bg-[#6e7355] px-8 py-10 md:px-[70px]"
            >
              <p className="font-serif text-[18px] leading-normal font-semibold tracking-[0.72px] text-white uppercase">
                Still unsure?
              </p>
              <p className="mt-4 max-w-[500px] font-serif text-[16px] leading-[30px] font-normal text-[#f6f6f6]">
                <Link href="/contact" className="link-underline underline">
                  Write to us
                </Link>
                {" — we answer every fit question personally, usually the same day."}
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1560px] px-5 py-16 text-center sm:px-8 md:px-12 md:py-24 xl:px-20">
          <blockquote
            data-intro
            className="mx-auto w-full max-w-[808px] font-serif text-[36px] leading-[1.15] font-semibold text-olive italic sm:text-[48px] md:text-[64px]"
          >
            “I&apos;ve never felt this good in a bikini.”
          </blockquote>
          <p
            data-intro
            className="mt-8 font-serif text-[18px] leading-[30px] font-semibold text-brown uppercase md:mt-12 md:text-[22px]"
          >
            The fit we hold every piece to
          </p>
        </section>

      </main>
    </PageShell>
  );
}

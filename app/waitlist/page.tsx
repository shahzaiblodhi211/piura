import { ContactFeatures } from "@/components/contact-features";
import { CtaArrow } from "@/components/cta-arrow";
import { PageShell } from "@/components/page-shell";
import { SplitTitle } from "@/components/split-title";
import { WaitlistForm } from "@/components/waitlist-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Waitlist — Piura Swim",
  description:
    "Get first dibs on the new drop — shop 24 hours before everyone else.",
};

export default function WaitlistPage() {
  return (
    <PageShell overlay>
      <main className="w-full">
        <section className="relative w-full overflow-hidden min-h-[640px] xl:min-h-[839px]">
          <div data-photo="hero" className="absolute inset-0">
            <div className="absolute inset-0 overflow-hidden">
              <img
                data-photo-img
                alt="Woman in a sun hat looking out over the coast"
                src="/assets/waitlist-hero.png"
                className="absolute inset-0 size-full object-cover object-center will-change-transform"
              />
            </div>
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgba(32, 32, 32, 0.32) 0%, rgba(32, 32, 32, 0.1) 42%, transparent 70%)",
              }}
            />
          </div>

          <div className="relative mx-auto flex min-h-[640px] w-full max-w-[1560px] flex-col justify-start px-5 pt-40 pb-16 sm:px-8 md:px-12 md:pt-28 xl:min-h-[839px] xl:px-[87px] xl:pt-[200px] xl:pb-16">
            <p
              data-intro
              className="font-serif text-[16px] leading-normal font-medium tracking-[1.44px] text-[#fbf8f6] capitalize md:text-[18px]"
            >
              The next drop
            </p>
            <SplitTitle
              text="Join the waitlist"
              className="mt-2 font-serif text-[40px] leading-[1.1] font-semibold tracking-[-0.04em] text-[#fbf8f6] sm:text-[56px] xl:text-[79px] xl:tracking-[-3.16px]"
            />
            <p
              data-intro
              className="mt-3 w-full max-w-[707px] font-serif text-[26px] leading-[1.2] font-normal text-[#fbf8f6] italic sm:text-[36px] xl:mt-4 xl:text-[44px] xl:tracking-[-1.76px]"
            >
              Get first dibs on the new drop — shop 24 hours before everyone
              else.
            </p>
            <p
              data-intro
              className="mt-6 w-full max-w-[578px] font-serif text-[18px] leading-[30px] font-normal text-[#fbf8f6] md:mt-10 md:text-[20px] md:leading-[34px]"
            >
              A new collection is coming — cut in small numbers, named for the
              Peruvian coast. No reveal yet. Just this: the waitlist sees it
              first, shops it first, and gets treated like it.
            </p>
            <a
              href="#waitlist"
              data-btn
              className="mt-8 flex h-[54px] w-full max-w-[320px] items-center justify-center gap-3 bg-[#fbf8f6] px-[22px] font-serif text-[16px] tracking-[0.32px] text-olive uppercase xl:mt-12"
            >
              Join the waitlist
              <CtaArrow />
            </a>
          </div>
        </section>

        <section
          id="waitlist"
          className="mx-auto w-full max-w-[1560px] scroll-mt-8 px-5 py-16 sm:px-8 md:px-12 md:py-24 xl:px-20 xl:pt-[139px] xl:pb-[153px]"
        >
          <div className="flex w-full flex-col gap-12 min-[1400px]:flex-row min-[1400px]:items-start min-[1400px]:gap-[115px]">
            <div
              data-photo
              className="w-full min-[1400px]:max-w-[633px] min-[1400px]:shrink-0"
            >
              <div className="relative aspect-[633/754] w-full overflow-hidden">
                <img
                  data-photo-img
                  alt="Woman in a white shirt sitting on a boat"
                  src="/assets/waitlist-portrait.png"
                  className="absolute inset-0 size-full object-cover will-change-transform"
                />
              </div>
            </div>
            <div className="w-full max-w-[629px] min-[1400px]:pt-[71px]">
              <p
                data-intro
                className="font-serif text-[16px] leading-normal font-medium text-brown capitalize md:text-[18px]"
              >
                The waitlist
              </p>
              <SplitTitle
                as="h2"
                text="Don’t miss the next one."
                className="mt-3 font-serif text-[36px] leading-[1.15] font-normal tracking-[-0.04em] text-olive sm:text-[48px] md:text-[56px] xl:text-[64px] xl:leading-[73px] xl:tracking-[-2.56px]"
              />
              <p
                data-intro
                className="mt-6 w-full max-w-[628px] font-serif text-[18px] leading-[30px] font-normal text-body md:mt-8 md:text-[20px]"
              >
                Join the list and we’ll let you know the moment the new drop is
                ready.
              </p>
              <div className="mt-8 md:mt-12">
                <WaitlistForm />
              </div>
            </div>
          </div>
        </section>

        <section
          data-photo
          className="relative w-full min-h-[560px] overflow-hidden xl:min-h-[741px]"
        >
          <img
            data-photo-img
            alt="Piura tote and sun hat on a coastal rock"
            src="/assets/waitlist-tote.png"
            className="absolute top-[-9.26%] left-[-0.01%] h-[118.55%] w-full max-w-none will-change-transform"
          />
          <div className="relative mx-auto flex min-h-[560px] w-full max-w-[1560px] flex-col justify-center px-5 py-16 sm:px-8 md:px-12 xl:min-h-[741px] xl:px-[105px] xl:py-[144px]">
            <p
              data-intro
              className="font-serif text-[16px] leading-normal font-medium tracking-normal text-brown capitalize md:text-[18px]"
            >
              THE PIURA TOTE
            </p>
            <SplitTitle
              as="h2"
              text="Two bikini sets, one cute tote on us."
              className="mt-3 w-full max-w-[633px] font-serif text-[36px] leading-[1.15] font-normal tracking-[-0.04em] text-olive italic sm:text-[48px] md:text-[56px] xl:text-[72px] xl:leading-[73px] xl:tracking-[-2.88px]"
            />
            <p
              data-intro
              className="mt-6 w-full max-w-[548px] font-serif text-[20px] leading-normal font-normal text-body md:mt-8 md:text-[27px]"
            >
              Pick any two bikini sets and your PIURA tote is on us.
            </p>
            <a
              href="/#shop"
              data-btn
              className="mt-8 flex h-[54px] w-full max-w-[237px] items-center justify-center gap-3 bg-olive px-[22px] font-serif text-[16px] tracking-[0.32px] text-cream uppercase md:mt-12"
            >
              ADD TOTE
              <CtaArrow tone="cream" />
            </a>
          </div>
        </section>

        <ContactFeatures className="w-full bg-[rgba(245,240,236,0.48)] xl:mt-0" />
      </main>
    </PageShell>
  );
}

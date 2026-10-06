import { ContactForm } from "@/components/contact-form";
import { PageShell } from "@/components/page-shell";
import { SplitTitle } from "@/components/split-title";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Piura Swim",
  description:
    "Sizing questions, order help, creator collaborations — every message is read and answered personally.",
};

export default function ContactPage() {
  return (
    <PageShell>
      <main className="w-full">
        <section className="mx-auto w-full max-w-[1560px] px-5 pt-16 sm:px-8 md:px-12 md:pt-24 lg:px-16 xl:px-20 xl:pt-[160px]">
          <p
            data-intro
            className="font-serif text-[16px] leading-normal font-medium text-brown capitalize md:text-[18px]"
          >
            We answer personally
          </p>
          <SplitTitle
            text="From Miami, the same day."
            className="mt-3 font-serif text-[32px] leading-[1.15] font-normal tracking-[-0.04em] text-olive sm:text-[40px] md:mt-[12px] md:text-[56px] md:leading-[73px] md:tracking-[-2.24px]"
          />
          <p
            data-intro
            className="mt-4 w-full max-w-[502px] font-serif text-[18px] leading-[30px] font-normal text-body md:mt-[12px] md:text-[20px]"
          >
            Sizing questions, order help, creator collaborations — every
            message is read and answered personally. Fit questions are our
            favorite kind.
          </p>
        </section>

        <section className="mx-auto mt-12 w-full max-w-[1560px] md:mt-20 xl:mt-[183px]">
          <div className="flex w-full flex-col min-[1400px]:flex-row min-[1400px]:items-start">
            <div
              data-photo
              className="w-full min-[1400px]:max-w-[701px] min-[1400px]:shrink-0"
            >
              <div className="relative h-[300px] w-full overflow-hidden sm:h-[400px] md:h-[480px] lg:h-[560px] min-[1400px]:aspect-square min-[1400px]:h-auto">
                <img
                  data-photo-img
                  alt="Woman on the beach wearing sunglasses"
                  src="/assets/contact-photo.jpg"
                  className="absolute inset-0 size-full object-cover object-[center_28%] will-change-transform"
                />
              </div>
            </div>
            <div className="w-full px-5 py-10 sm:px-8 md:px-12 min-[1400px]:flex-1 min-[1400px]:px-0 min-[1400px]:py-0 min-[1400px]:pt-[67px] min-[1400px]:pr-20 min-[1400px]:pl-[77px]">
              <div className="ml-auto w-full max-w-[682px]">
                <ContactForm />
              </div>
            </div>
          </div>
        </section>

      </main>
    </PageShell>
  );
}

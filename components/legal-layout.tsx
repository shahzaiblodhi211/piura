import { PageShell } from "./page-shell";
import { SplitTitle } from "./split-title";
import { TableOfContents, type TocItem } from "./table-of-contents";

export type LegalSection = {
  id: string;
  number: string;
  title: string;
  body?: string;
  bodyWidth?: number;
  bullets?: { text: string; multiline?: boolean }[];
};

export function LegalLayout({
  title,
  sections,
}: {
  title: string;
  sections: LegalSection[];
}) {
  const tocItems: TocItem[] = sections.map((section) => ({
    id: section.id,
    number: section.number,
    label: section.title,
  }));

  return (
    <PageShell>
      <main className="mx-auto w-full max-w-[1560px] px-5 pt-16 pb-20 sm:px-8 md:px-12 md:pt-24 lg:px-16 xl:px-20 xl:pt-[154px] xl:pb-[180px]">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,449px)] lg:gap-12 xl:gap-16">
          <div>
            <p
              data-intro
              className="font-serif text-[16px] leading-[30px] font-medium text-brown capitalize md:text-[18px]"
            >
              Legal · Piura Swim
            </p>
            <SplitTitle
              text={title}
              className="mt-3 font-serif text-[32px] leading-[1.15] font-normal tracking-[-0.04em] text-olive sm:text-[40px] md:mt-[17px] md:text-[56px] md:leading-[73px] md:tracking-[-2.24px]"
            />
            <p
              data-intro
              className="mt-4 font-serif text-[16px] leading-[32px] font-medium text-olive md:mt-[20px] md:text-[18px]"
            >
              Last updated: August 4, 2026
            </p>
          </div>

          <aside className="lg:row-span-2 lg:self-stretch">
            <div className="sticky top-4 z-20 overflow-hidden bg-white lg:top-8">
              <TableOfContents items={tocItems} />
            </div>
          </aside>

          <article className="flex w-full min-w-0 max-w-[920px] flex-col gap-[38px]">
            {sections.map((section) => (
              <section
                key={section.id}
                data-reveal
                className="flex w-full flex-col gap-[24px]"
              >
                <h2
                  id={section.id}
                  className="scroll-mt-28 font-serif text-[18px] leading-[30px] font-bold tracking-[0.72px] text-olive uppercase lg:scroll-mt-10"
                >
                  {section.title}
                </h2>
                {section.body ? (
                  <p
                    className="w-full font-serif text-[17px] leading-[32px] font-normal text-body md:text-[18px]"
                    style={{ maxWidth: section.bodyWidth ?? 873 }}
                  >
                    {section.body}
                  </p>
                ) : null}
                {section.bullets ? (
                  <ul className="flex w-full flex-col gap-[16px]">
                    {section.bullets.map((bullet) => (
                      <li key={bullet.text} className="flex items-start gap-[16px]">
                        <span className="mt-[13.5px] shrink-0">
                          <img src="/assets/bullet-dot.svg" alt="" />
                        </span>
                        <p className="min-w-0 flex-1 font-serif text-[17px] leading-[32px] font-normal text-body md:text-[18px]">
                          {bullet.text}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </article>
        </div>
      </main>
    </PageShell>
  );
}

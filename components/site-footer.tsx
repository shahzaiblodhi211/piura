import Link from "next/link";
import { Logo } from "./logo";
import { NewsletterForm } from "./newsletter-form";

const shopLinks = [
  { href: "/shop", label: "All Swim" },
  { href: "/shop?filter=triangle", label: "TRIANGLE" },
  { href: "/shop?filter=bandeau", label: "BANDEAU" },
  { href: "/shop?filter=contour", label: "CONTOUR" },
  { href: "/shop?filter=onepiece", label: "ONE-PIECE" },
];

const houseLinks = [
  { href: "/story", label: "OUR STORY" },
  { href: "/contact", label: "CONTACT" },
  { href: "https://instagram.com", label: "INSTAGRAM", external: true },
];

const legalLinks = [
  { href: "/privacy", label: "PRIVACY" },
  { href: "/terms", label: "TERMS" },
];

function FooterColumn({
  title,
  links,
  ink = false,
}: {
  title: string;
  links: { href: string; label: string; external?: boolean }[];
  ink?: boolean;
}) {
  return (
    <div
      className={`flex min-w-0 flex-col gap-[16px] uppercase ${
        ink
          ? "text-white"
          : "font-serif text-[16px] leading-[27px] tracking-[0.64px] text-olive"
      }`}
    >
      <p className={ink ? "font-bebas text-[22px]" : "font-bold"}>{title}</p>
      {links.map((link) =>
        link.external ? (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            data-nav-link
            className={`link-underline w-fit ${ink ? "font-serif text-[14px] font-medium" : "font-medium"}`}
          >
            {link.label}
          </a>
        ) : (
          <Link
            key={link.label}
            href={link.href}
            data-nav-link
            className={`link-underline w-fit ${ink ? "font-serif text-[14px] font-medium" : "font-medium"}`}
          >
            {link.label}
          </Link>
        ),
      )}
    </div>
  );
}

export function SiteFooter({ tone = "light" }: { tone?: "light" | "ink" }) {
  const ink = tone === "ink";

  return (
    <footer className={`w-full ${ink ? "bg-ink text-white" : ""}`}>
      {ink ? null : <div className="h-px w-full bg-olive/25" />}
      <div className="mx-auto w-full max-w-[1560px] px-5 pt-12 pb-10 sm:px-8 md:px-12 md:pt-[59px] lg:px-16 xl:px-[60px]">
        <div data-reveal>
          {ink ? (
            <Link href="/" aria-label="Piura Swim" className="block w-fit">
              <img alt="" src="/assets/brand/piura-white.svg" className="h-9 w-auto sm:h-11" />
            </Link>
          ) : (
            <Logo />
          )}
        </div>
        <div
          id="waitlist"
          className={`mt-10 flex scroll-mt-10 flex-col gap-12 md:mt-[51px] lg:items-start lg:justify-between ${
            ink ? "lg:flex-row-reverse" : "lg:flex-row"
          }`}
        >
          <div data-reveal className="w-full max-w-[467px]">
            <p
              className={`uppercase ${
                ink
                  ? "font-bebas text-[24px] leading-normal text-white"
                  : "font-serif text-[16px] leading-[27px] font-medium tracking-[0.64px] text-olive"
              }`}
            >
              First access to new drops,
              <br />
              before anyone else.
            </p>
            <NewsletterForm tone={ink ? "ink" : "light"} />
          </div>
          <div
            data-reveal
            className="grid w-full max-w-[598px] grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-12 lg:gap-[120px]"
          >
            <FooterColumn title="Shop" links={shopLinks} ink={ink} />
            <FooterColumn title="HOUSE" links={houseLinks} ink={ink} />
            <FooterColumn title="LEGAL" links={legalLinks} ink={ink} />
          </div>
        </div>
      </div>
      <div className={`flex min-h-[50px] w-full flex-col items-start justify-center gap-1 px-5 py-3 text-[13px] leading-[27px] sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:text-[16px] md:px-12 lg:px-16 xl:px-[60px] ${ink ? "bg-ink font-bebas text-[18px] text-white" : "bg-olive font-serif font-normal tracking-[-0.64px] text-white"}`}>
        <p>© 2026 Piura Swim. All Rights Reserved.</p>
        <p>Designed in Miami. Crafted in Piura, Peru — The City of Eternal Heat.</p>
      </div>
    </footer>
  );
}

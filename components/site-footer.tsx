import Link from "next/link";
import { Logo } from "./logo";
import { NewsletterForm } from "./newsletter-form";

const shopLinks = [
  { href: "/shop", label: "All Swim" },
  { href: "/shop?filter=tops", label: "TOPS" },
  { href: "/shop?filter=bottoms", label: "BOTTOMS" },
  { href: "/size-guide", label: "SIZE GUIDE" },
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
}: {
  title: string;
  links: { href: string; label: string; external?: boolean }[];
}) {
  return (
    <div className="flex min-w-0 flex-col gap-[16px] font-serif text-[16px] leading-[27px] tracking-[0.64px] text-olive uppercase">
      <p className="font-bold">{title}</p>
      {links.map((link) =>
        link.external ? (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            data-nav-link
            className="link-underline w-fit font-medium"
          >
            {link.label}
          </a>
        ) : (
          <Link
            key={link.label}
            href={link.href}
            data-nav-link
            className="link-underline w-fit font-medium"
          >
            {link.label}
          </Link>
        ),
      )}
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="w-full">
      <div className="h-px w-full bg-olive/25" />
      <div className="mx-auto w-full max-w-[1560px] px-5 pt-12 pb-16 sm:px-8 md:px-12 md:pt-[59px] md:pb-[95px] lg:px-16 xl:px-20">
        <div data-reveal>
          <Logo />
        </div>
        <div
          id="waitlist"
          className="mt-10 flex scroll-mt-10 flex-col gap-12 md:mt-[51px] lg:flex-row lg:items-start lg:justify-between"
        >
          <div data-reveal className="w-full max-w-[467px]">
            <p className="font-serif text-[16px] leading-[27px] font-medium tracking-[0.64px] text-olive uppercase">
              First access to new drops,
              <br />
              before anyone else.
            </p>
            <NewsletterForm />
          </div>
          <div
            data-reveal
            className="grid w-full max-w-[598px] grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-12 lg:gap-[120px]"
          >
            <FooterColumn title="Shop" links={shopLinks} />
            <FooterColumn title="HOUSE" links={houseLinks} />
            <FooterColumn title="LEGAL" links={legalLinks} />
          </div>
        </div>
      </div>
      <div className="flex min-h-[50px] w-full flex-col items-start justify-center gap-1 bg-olive px-5 py-3 font-serif text-[13px] leading-[27px] font-normal tracking-[-0.64px] text-white sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:text-[16px] md:px-12 lg:px-16 xl:px-20">
        <p>© 2026 Piura Swim. All Rights Reserved.</p>
        <p>Designed in Miami. Crafted in Piura, Peru — The City of Eternal Heat.</p>
      </div>
    </footer>
  );
}

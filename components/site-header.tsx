"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import { gsap, registerGsap } from "@/lib/gsap";
import { Logo } from "./logo";

const navItems = [
  { href: "/shop", label: "Shop" },
  { href: "/story", label: "Story" },
  { href: "/size-guide", label: "Size Guide" },
  { href: "/waitlist", label: "Waitlist" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({
  overlay = false,
  invert,
}: {
  overlay?: boolean;
  invert?: boolean;
}) {
  const light = invert ?? overlay;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    registerGsap();
    const menu = menuRef.current;
    const nav = linksRef.current;
    if (!menu || !nav) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(menu, { height: open ? "auto" : 0, opacity: open ? 1 : 0 });
      return;
    }

    if (open) {
      gsap.set(menu, { height: "auto", display: "block" });
      const height = menu.offsetHeight;
      gsap.fromTo(
        menu,
        { height: 0, opacity: 0 },
        { height, opacity: 1, duration: 0.5, ease: "power3.out" },
      );
      gsap.fromTo(
        nav.children,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, stagger: 0.05, delay: 0.08, ease: "power3.out" },
      );
    } else {
      gsap.to(menu, {
        height: 0,
        opacity: 0,
        duration: 0.35,
        ease: "power3.inOut",
      });
    }
  }, [open]);

  return (
    <header
      data-chrome
      className={`mx-auto w-full max-w-[1560px] px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20 ${
        overlay
          ? "absolute inset-x-0 top-0 z-20 pt-4 md:pt-5"
          : "pt-6 pb-6 md:pt-[42px] md:pb-[28px]"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <Logo invert={light} />
        <nav
          aria-label="Primary"
          className={`hidden items-center gap-6 font-serif text-[16px] leading-[27px] font-medium uppercase lg:flex xl:gap-[36px] ${light ? "text-white" : "text-olive"}`}
        >
          {navItems.map((item) => {
            const active =
              item.label === "Shop"
                ? pathname === "/shop" || pathname.startsWith("/product")
                : pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                data-nav-link
                {...(active ? { "data-nav-active": "" } : {})}
                className="link-underline"
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex shrink-0 items-center gap-3">
          <a
            href={pathname === "/waitlist" ? "#waitlist" : "/waitlist"}
            data-cta="waitlist"
            data-btn
            className="hidden h-[57px] w-full max-w-[209px] shrink-0 items-center justify-center bg-olive px-[22px] font-serif text-[14px] leading-none font-normal tracking-[0.28px] text-cream uppercase whitespace-nowrap sm:flex"
          >
            JOIN THE WAITLIST
          </a>
          <button
            type="button"
            className={`flex h-11 w-11 items-center justify-center border lg:hidden ${light && !open ? "border-white text-white" : "border-olive text-olive"}`}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span aria-hidden className="flex flex-col gap-1.5">
              <span
                className={`block h-px w-5 bg-current transition duration-300 ${open ? "translate-y-[3.5px] rotate-45" : ""}`}
              />
              <span
                className={`block h-px w-5 bg-current transition duration-300 ${open ? "opacity-0" : ""}`}
              />
              <span
                className={`block h-px w-5 bg-current transition duration-300 ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`}
              />
            </span>
          </button>
        </div>
      </div>
      <div
        id="mobile-nav"
        ref={menuRef}
        className="h-0 overflow-hidden opacity-0 lg:hidden"
      >
        <nav
          ref={linksRef}
          aria-label="Mobile"
          className="flex flex-col gap-4 border-t border-olive/20 bg-white py-6 font-serif text-[16px] font-medium text-olive uppercase"
        >
          {navItems.map((item) => {
            const active =
              item.label === "Shop"
                ? pathname === "/shop" || pathname.startsWith("/product")
                : pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                data-nav-link
                {...(active ? { "data-nav-active": "" } : {})}
                className="link-underline w-fit"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
          <a
            href={pathname === "/waitlist" ? "#waitlist" : "/waitlist"}
            data-btn
            className="flex h-[54px] w-full max-w-[209px] items-center justify-center bg-olive font-serif text-[14px] tracking-[0.28px] text-cream uppercase sm:hidden"
            onClick={() => setOpen(false)}
          >
            JOIN THE WAITLIST
          </a>
        </nav>
      </div>
    </header>
  );
}

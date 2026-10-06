"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { productPriceLine, productSlug, products } from "@/lib/products";

const navItems = [
  { href: "/shop", label: "Shop" },
  { href: "/story", label: "Story" },
  { href: "/size-guide", label: "Size Guide" },
  { href: "/contact", label: "Contact" },
];

export function HomeMark({ className = "", light = false }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" aria-label="Piura Swim" className={`flex items-center ${className}`}>
      <img
        alt=""
        src={light ? "/assets/brand/piura-white.svg" : "/assets/brand/piura-black.svg"}
        className="h-9 w-auto sm:h-[46px]"
      />
    </Link>
  );
}

function MenuMark({ open = false }: { open?: boolean }) {
  return (
    <span aria-hidden className="flex w-5 flex-col gap-[6px]">
      <span
        className={`block h-px w-5 origin-center bg-current transition-transform duration-300 ${open ? "translate-y-[3.5px] rotate-45" : ""}`}
      />
      <span
        className={`block h-px w-5 origin-center bg-current transition-transform duration-300 ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`}
      />
    </span>
  );
}

export function HomeHeader({ solid = false }: { solid?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [present, setPresent] = useState(false);
  const [entered, setEntered] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const closeTimer = useRef<number | null>(null);

  function openMenu() {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setSearchOpen(false);
    setPresent(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true));
    });
  }

  function closeMenu() {
    setEntered(false);
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      setPresent(false);
      closeTimer.current = null;
    }, 520);
  }

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return products.slice(0, 3);
    return products.filter((product) => product.name.toLowerCase().includes(needle)).slice(0, 6);
  }, [query]);

  useEffect(() => {
    if (!searchOpen) return;
    inputRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  useEffect(() => {
    setEntered(false);
    setPresent(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!present) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [present]);

  function closeMenus() {
    closeMenu();
    setSearchOpen(false);
  }

  return (
    <header
      data-chrome
      className={
        solid
          ? "relative z-30 border-b border-ink/10 bg-white"
          : "absolute inset-x-0 top-0 z-30"
      }
    >
      <div>
        <div className="relative mx-auto flex w-full max-w-[1560px] items-center px-5 py-5 sm:px-8 lg:py-7 lg:px-12 xl:px-[60px]">
          <div className="flex min-w-0 flex-1 items-center">
            <button
              type="button"
              className={`flex size-11 items-center justify-center lg:hidden ${solid ? "text-ink" : "text-white"}`}
              aria-expanded={present}
              aria-controls="mobile-nav"
              onClick={() => {
                if (present) closeMenu();
                else openMenu();
              }}
            >
              <span className="sr-only">{present ? "Close menu" : "Open menu"}</span>
              <MenuMark />
            </button>
            <nav
              aria-label="Primary"
              className={`hidden items-center gap-5 font-serif text-[15px] leading-none font-medium tracking-[0.14em] uppercase lg:flex xl:gap-8 ${solid ? "text-ink" : "text-white"}`}
            >
              {navItems.map((item) => {
                const active =
                  item.href === "/shop"
                    ? pathname === "/shop" || pathname.startsWith("/product")
                    : pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-nav-link
                    {...(active ? { "data-nav-active": "" } : {})}
                    className="link-underline whitespace-nowrap"
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <HomeMark light={!solid} className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2" />
          <div className="flex flex-1 items-center justify-end">
            <button
              type="button"
              aria-label="Search"
              aria-expanded={searchOpen}
              onClick={() => {
                if (present) closeMenu();
                setSearchOpen((value) => !value);
              }}
              className="flex size-11 items-center justify-center transition-opacity hover:opacity-70"
            >
              <img src="/assets/home-icon-search.svg" alt="" className={`size-6 ${solid ? "brightness-0" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {searchOpen ? (
        <div className="absolute inset-x-0 top-full z-40 px-4 pt-2 sm:px-8 lg:px-12 xl:px-[60px]">
          <div className="search-panel ml-auto w-full max-w-[440px] bg-white text-ink shadow-[0_22px_50px_rgba(34,33,31,0.16)]">
            <form
              className="flex items-center gap-3 border-b border-ink/10 px-4"
              onSubmit={(event) => {
                event.preventDefault();
                const first = results[0];
                if (first) router.push(`/product/${productSlug(first.name)}`);
              }}
            >
              <img src="/assets/home-icon-search.svg" alt="" className="size-5 shrink-0 brightness-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the collection"
                className="h-14 w-full bg-transparent font-serif text-[16px] text-ink outline-none placeholder:text-ink/40"
              />
            </form>
            <p className="px-4 pt-4 font-bebas text-[13px] tracking-[0.18em] text-ink/45 uppercase">
              {query.trim() ? "Results" : "Suggested"}
            </p>
            <ul className="px-2 pt-1 pb-2">
              {results.length ? (
                results.map((product, index) => {
                  const price = productPriceLine(product);
                  return (
                    <li
                      key={product.name}
                      className="search-row"
                      style={{ animationDelay: `${80 + index * 60}ms` }}
                    >
                      <Link
                        href={`/product/${productSlug(product.name)}`}
                        onClick={closeMenus}
                        className="group flex items-center gap-3.5 px-2 py-2.5 transition-colors duration-300 hover:bg-[#f6f1ee]"
                      >
                        <span className="relative h-[84px] w-[64px] shrink-0 overflow-hidden">
                          <img
                            alt=""
                            src={product.src}
                            className="size-full object-cover object-[center_18%] transition-transform duration-500 ease-out group-hover:scale-105"
                          />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-bebas text-[18px] leading-none tracking-[0.4px] text-ink uppercase">
                            {product.name}
                          </span>
                          {price ? (
                            <span className="mt-2 block font-serif text-[14px] leading-none tracking-[0.2px] text-olive">
                              {price}
                            </span>
                          ) : null}
                        </span>
                      </Link>
                    </li>
                  );
                })
              ) : (
                <li className="px-2 py-4 font-serif text-[15px] text-ink/60">No pieces match that search.</li>
              )}
            </ul>
          </div>
        </div>
      ) : null}

      {present
        ? createPortal(
            <div className="lg:hidden">
              <button
                type="button"
                aria-label="Close menu"
                className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-500 ${entered ? "opacity-100" : "opacity-0"}`}
                onClick={closeMenu}
              />
              <nav
                id="mobile-nav"
                aria-label="Mobile"
                className={`fixed inset-y-0 left-0 z-[70] flex w-[min(86vw,380px)] flex-col bg-white px-7 pt-5 pb-10 shadow-[12px_0_40px_rgba(0,0,0,0.12)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${entered ? "translate-x-0" : "-translate-x-full"}`}
              >
                <button
                  type="button"
                  className="flex size-11 items-center justify-center text-ink"
                  onClick={closeMenu}
                >
                  <span className="sr-only">Close menu</span>
                  <MenuMark open />
                </button>
                <div className="mt-8 flex flex-col">
                  {navItems.map((item, index) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={pathname === item.href ? "page" : undefined}
                      onClick={closeMenus}
                      style={{ transitionDelay: entered ? `${90 + index * 55}ms` : "0ms" }}
                      className={`border-b border-ink/10 py-4 font-serif text-[18px] font-medium tracking-[0.14em] text-ink uppercase transition duration-500 ${entered ? "translate-x-0 opacity-100" : "-translate-x-3 opacity-0"}`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
                <Link
                  href="/waitlist"
                  onClick={closeMenus}
                  style={{ transitionDelay: entered ? "340ms" : "0ms" }}
                  className={`mt-8 inline-flex h-11 w-fit items-center justify-center border-2 border-ink px-8 font-bebas text-[16px] tracking-[0.32px] text-ink uppercase transition duration-500 ${entered ? "translate-x-0 opacity-100" : "-translate-x-3 opacity-0"}`}
                >
                  Waitlist
                </Link>
              </nav>
            </div>,
            document.body,
          )
        : null}
    </header>
  );
}

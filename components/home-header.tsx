"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { productSlug, products } from "@/lib/products";

const navItems = [
  { href: "/shop", label: "Shop" },
  { href: "/story", label: "Story" },
  { href: "/size-guide", label: "Size Guide" },
  { href: "/contact", label: "Contact" },
];

export function HomeMark({ className = "", light = false }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" aria-label="Piura Swim" className={`flex items-center gap-2.5 ${className}`}>
      <span className="relative block h-[48px] w-[90px] overflow-hidden">
        <img
          alt=""
          src="/assets/logo.png"
          className={`absolute top-[-60.54%] left-[-6.45%] h-[221.08%] w-[216.94%] max-w-none brightness-0 ${light ? "invert" : ""}`}
        />
      </span>
      <span className={`font-display text-[15px] leading-none font-medium tracking-[0.22em] ${light ? "text-white" : "text-ink"}`}>
        2.0
      </span>
    </Link>
  );
}

export function HomeHeader({ solid = false }: { solid?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = needle
      ? products.filter((product) => product.name.toLowerCase().includes(needle))
      : products.slice(0, 6);
    return list.slice(0, 6);
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

  function closeMenus() {
    setOpen(false);
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
        <div className="mx-auto flex w-full max-w-[1560px] items-center justify-between gap-6 px-5 py-5 sm:px-8 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:py-7 lg:px-12 xl:px-[60px]">
          <nav
            aria-label="Primary"
            className={`hidden items-center gap-5 font-serif text-[15px] leading-none font-medium tracking-[0.14em] uppercase xl:gap-8 lg:flex ${solid ? "text-ink" : "text-white"}`}
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
          <HomeMark light={!solid} className="lg:justify-self-center" />
          <div className="flex items-center justify-end gap-1 lg:gap-2">
            <button
              type="button"
              aria-label="Search"
              aria-expanded={searchOpen}
              onClick={() => {
                setOpen(false);
                setSearchOpen((value) => !value);
              }}
              className="flex size-11 items-center justify-center transition-opacity hover:opacity-70"
            >
              <img src="/assets/home-icon-search.svg" alt="" className={`size-6 ${solid ? "brightness-0" : ""}`} />
            </button>
            <button
              type="button"
              className={`flex size-11 items-center justify-center lg:hidden ${solid ? "text-ink" : "text-white"}`}
              aria-expanded={open}
              onClick={() => {
                setSearchOpen(false);
                setOpen((value) => !value);
              }}
            >
              <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
              <span aria-hidden className="flex flex-col gap-1.5">
                <span className={`block h-px w-5 bg-current transition duration-300 ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
                <span className={`block h-px w-5 bg-current transition duration-300 ${open ? "opacity-0" : ""}`} />
                <span className={`block h-px w-5 bg-current transition duration-300 ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </div>
      </div>

      {searchOpen ? (
        <div className="border-t border-ink/10 bg-white px-5 py-5 text-ink sm:px-8 lg:px-12 xl:px-[60px]">
          <form
            className="mx-auto flex w-full max-w-[720px] items-center gap-3 border-b border-ink/25"
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
              className="h-12 w-full bg-transparent font-serif text-[16px] text-ink outline-none placeholder:text-ink/45"
            />
          </form>
          <ul className="mx-auto mt-4 w-full max-w-[720px]">
            {results.length ? (
              results.map((product) => (
                <li key={product.name}>
                  <Link
                    href={`/product/${productSlug(product.name)}`}
                    onClick={closeMenus}
                    className="flex items-center justify-between gap-4 py-2.5 font-serif text-[15px] text-ink/80 transition-colors hover:text-ink"
                  >
                    <span>{product.name}</span>
                  </Link>
                </li>
              ))
            ) : (
              <li className="py-2 font-serif text-[15px] text-ink/60">No pieces match that search.</li>
            )}
          </ul>
        </div>
      ) : null}

      {open ? (
        <nav className="border-t border-ink/10 bg-white px-5 py-6 font-serif text-[16px] font-medium tracking-[0.12em] text-ink uppercase lg:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              onClick={closeMenus}
              className="block py-2"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/waitlist" onClick={closeMenus} className="mt-3 block py-2">
            Waitlist
          </Link>
        </nav>
      ) : null}
    </header>
  );
}

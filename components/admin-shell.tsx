"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState, type ReactNode } from "react";
import { AdminProvider, ToastProvider, field } from "@/components/admin-ui";

const storageKey = "piura-admin";

const links = [
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/creators", label: "Creators" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [secret, setSecret] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    const saved = window.sessionStorage.getItem(storageKey) ?? "";
    if (!saved) return;
    setSecret(saved);
    void signIn(saved);
  }, []);

  const call = useCallback(async (password: string, body: Record<string, unknown>) => {
    const response = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-affiliate-admin": password },
      body: JSON.stringify(body),
    });
    const data = (await response.json()) as { error?: string } & Record<string, unknown>;
    if (response.status === 401) {
      window.sessionStorage.removeItem(storageKey);
      setReady(false);
      setSecret("");
    }
    if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "Could not update the shop.");
    return data;
  }, []);

  const api = useCallback((body: Record<string, unknown>) => call(secret, body), [call, secret]);

  async function signIn(password: string, event?: FormEvent) {
    event?.preventDefault();
    setBusy(true);
    setError("");
    try {
      await call(password, { action: "products" });
      window.sessionStorage.setItem(storageKey, password);
      setSecret(password);
      setReady(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open admin.");
    } finally {
      setBusy(false);
    }
  }

  function lock() {
    window.sessionStorage.removeItem(storageKey);
    setReady(false);
    setSecret("");
  }

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream px-5 py-10">
        <form onSubmit={(event) => void signIn(secret, event)} className="w-full max-w-[420px] border border-olive/10 bg-white px-6 py-8 sm:px-8 sm:py-10">
          <img src="/assets/brand/piura-black.svg" alt="Piura Swim" className="mx-auto block h-10 w-auto" />
          <p className="mt-8 font-serif text-[13px] tracking-[0.22em] text-brown uppercase">Studio</p>
          <h1 className="mt-2 font-bebas text-[56px] leading-none text-olive">Admin</h1>
          <p className="mt-3 font-serif text-[16px] leading-6 text-body">Sign in to manage products, orders, and creators.</p>
          <label className="mt-8 mb-2 block font-serif text-[13px] text-body" htmlFor="admin-password">Password</label>
          <input id="admin-password" type="password" value={secret} onChange={(event) => setSecret(event.target.value)} autoComplete="current-password" className={field} />
          <button type="submit" disabled={busy} className="mt-4 flex h-12 w-full items-center justify-center bg-olive font-bebas text-[20px] tracking-[0.12em] text-cream disabled:opacity-60">
            {busy ? "Opening" : "Enter"}
          </button>
          {error ? <p className="mt-4 font-serif text-[15px] leading-6 text-[#8a1c1c]">{error}</p> : null}
        </form>
      </main>
    );
  }

  return (
    <AdminProvider call={api} origin={origin}>
      <ToastProvider>
        <div className="min-h-screen bg-cream text-ink lg:pl-[232px]">
          <aside className="fixed inset-y-0 left-0 z-30 hidden w-[232px] bg-olive text-cream lg:flex lg:flex-col">
            <div className="px-6 pt-7">
              <img src="/assets/brand/piura-white.svg" alt="Piura Swim" className="h-9 w-auto" />
              <p className="mt-6 font-serif text-[12px] tracking-[0.22em] text-cream/60 uppercase">Studio</p>
            </div>
            <nav className="mt-4 flex flex-col px-3">
              {links.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link key={item.href} href={item.href} className={`flex h-12 items-center px-3 font-serif text-[16px] ${active ? "bg-cream text-olive" : "text-cream/80 hover:bg-white/10"}`}>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <button type="button" onClick={lock} className="mt-auto h-14 px-6 text-left font-serif text-[14px] text-cream/70">
              Lock studio
            </button>
          </aside>

          <header className="sticky top-0 z-20 border-b border-olive/10 bg-cream/95 px-4 py-3 backdrop-blur lg:hidden">
            <div className="flex items-center justify-between">
              <img src="/assets/brand/piura-black.svg" alt="Piura Swim" className="h-8 w-auto" />
              <button type="button" onClick={lock} className="h-10 px-1 font-serif text-[14px] text-body">Lock</button>
            </div>
            <nav className="mt-3 grid grid-cols-3 border border-olive/15 bg-white">
              {links.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link key={item.href} href={item.href} className={`flex h-11 items-center justify-center font-bebas text-[16px] tracking-[0.08em] uppercase ${active ? "bg-olive text-cream" : "text-olive"}`}>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </header>
          <div className="mx-auto w-full max-w-[1240px] px-4 py-6 sm:px-8 sm:py-10">{children}</div>
        </div>
      </ToastProvider>
    </AdminProvider>
  );
}

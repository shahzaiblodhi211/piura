"use client";

import { FormEvent, useEffect, useState } from "react";

type Creator = {
  code: string;
  name: string;
  email: string;
  discountPercent: number;
  commissionPercent: number;
  dashboardPath: string;
  payable: number;
  clawback: number;
};

function money(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function AffiliateAdmin() {
  const [secret, setSecret] = useState("");
  const [ready, setReady] = useState(false);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => setOrigin(window.location.origin), []);

  async function call(body: Record<string, string | number>) {
    const response = await fetch("/api/affiliate/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-affiliate-admin": secret },
      body: JSON.stringify(body),
    });
    const data = (await response.json()) as { error?: string; creators?: Creator[]; affiliate?: Creator; count?: number };
    if (!response.ok) throw new Error(data.error || "Could not update creators.");
    return data;
  }

  async function load(event?: FormEvent) {
    event?.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await call({ action: "list" });
      setCreators(data.creators ?? []);
      setReady(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open creators.");
    } finally {
      setBusy(false);
    }
  }

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const data = await call({
        action: "create",
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        code: String(form.get("code") ?? ""),
        discountPercent: Number(form.get("discount") ?? 15),
        commissionPercent: Number(form.get("commission") ?? 15),
      });
      event.currentTarget.reset();
      if (data.affiliate) setNotice(`${data.affiliate.name}'s dashboard: ${window.location.origin}${data.affiliate.dashboardPath}`);
      const listed = await call({ action: "list" });
      setCreators(listed.creators ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add that creator.");
    } finally {
      setBusy(false);
    }
  }

  async function markPaid(code: string) {
    setBusy(true);
    setError("");
    try {
      const data = await call({ action: "paid", code });
      setNotice(data.count ? `Marked ${data.count} sale${data.count === 1 ? "" : "s"} paid for ${code}.` : `Nothing is ready to pay for ${code} yet.`);
      const listed = await call({ action: "list" });
      setCreators(listed.creators ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not mark that paid.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <form onSubmit={(event) => void load(event)} className="mt-8 max-w-[420px]">
        <input type="password" value={secret} onChange={(event) => setSecret(event.target.value)} placeholder="Admin password" className="h-14 w-full border border-olive bg-white px-4 font-serif text-[16px] text-olive outline-none" />
        <button type="submit" disabled={busy} className="mt-4 flex h-14 w-full items-center justify-center bg-olive font-bebas text-[22px] tracking-[0.08em] text-cream disabled:opacity-60">
          {busy ? "Opening" : "Open"}
        </button>
        {error ? <p className="mt-3 font-serif text-[15px] text-[#8a1c1c]">{error}</p> : null}
      </form>
    );
  }

  return (
    <div className="mt-8">
      <form onSubmit={(event) => void create(event)} className="grid max-w-[760px] gap-3 sm:grid-cols-2">
        <input name="name" required placeholder="Creator name" className="h-14 border border-olive bg-white px-4 font-serif text-[16px] text-olive outline-none" />
        <input name="email" type="email" required placeholder="Creator email" className="h-14 border border-olive bg-white px-4 font-serif text-[16px] text-olive outline-none" />
        <input name="code" required placeholder="Code, like MAYA" className="h-14 border border-olive bg-white px-4 font-serif text-[16px] text-olive uppercase outline-none" />
        <div className="grid grid-cols-2 gap-3">
          <input name="discount" type="number" min={1} max={50} defaultValue={15} className="h-14 border border-olive bg-white px-4 font-serif text-[16px] text-olive outline-none" />
          <input name="commission" type="number" min={1} max={50} defaultValue={15} className="h-14 border border-olive bg-white px-4 font-serif text-[16px] text-olive outline-none" />
        </div>
        <button type="submit" disabled={busy} className="h-14 bg-olive font-bebas text-[22px] tracking-[0.08em] text-cream disabled:opacity-60 sm:col-span-2">
          Add creator
        </button>
      </form>
      <p className="mt-3 font-serif text-[14px] text-body">The first number is the follower discount. The second is the creator commission. Use 20 for a top performer.</p>
      {notice ? <p className="mt-4 max-w-[760px] font-serif text-[15px] leading-6 text-olive">{notice}</p> : null}
      {error ? <p className="mt-3 font-serif text-[15px] text-[#8a1c1c]">{error}</p> : null}
      <ul className="mt-8 max-w-[760px]">
        {creators.length === 0 ? <li className="font-serif text-[16px] text-body">No creators yet.</li> : null}
        {creators.map((creator) => (
          <li key={creator.code} className="border-b border-olive/10 py-4 font-serif text-[16px] text-olive">
            <p className="font-bebas text-[24px] leading-none tracking-[0.04em]">{creator.name} · {creator.code}</p>
            <p className="mt-2 text-body">{creator.email} · {creator.discountPercent}% off · {creator.commissionPercent}% commission</p>
            <p className="mt-1 text-body">Ready to pay {money(creator.payable)}{creator.clawback ? ` · Refunds to collect ${money(creator.clawback)}` : ""}</p>
            <p className="mt-2 break-all text-[14px]">{origin}{creator.dashboardPath}</p>
            <button type="button" disabled={busy} onClick={() => void markPaid(creator.code)} className="mt-3 h-10 bg-olive px-4 font-bebas text-[16px] tracking-[0.08em] text-cream disabled:opacity-60">
              Mark ready sales paid
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

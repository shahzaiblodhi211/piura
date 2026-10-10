"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { field, label, money, panel, useAdmin, useToast } from "@/components/admin-ui";

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

type Draft = {
  code: string;
  name: string;
  email: string;
  discount: string;
  commission: string;
  dashboardPath: string;
  payable: number;
  clawback: number;
};

function blankDraft(): Draft {
  return { code: "", name: "", email: "", discount: "15", commission: "15", dashboardPath: "", payable: 0, clawback: 0 };
}

export function AdminCreatorForm({ code }: { code?: string }) {
  const { call, origin } = useAdmin();
  const toast = useToast();
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(code ? null : blankDraft());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!code) return;
    let live = true;
    call({ action: "creators" })
      .then((data) => {
        const creators = (data.creators as Creator[]) ?? [];
        const creator = creators.find((item) => item.code === code.toUpperCase());
        if (!live) return;
        if (!creator) {
          toast("That creator was not found.", "bad");
          router.replace("/admin/creators");
          return;
        }
        setDraft({
          code: creator.code,
          name: creator.name,
          email: creator.email,
          discount: String(creator.discountPercent),
          commission: String(creator.commissionPercent),
          dashboardPath: creator.dashboardPath,
          payable: creator.payable,
          clawback: creator.clawback,
        });
      })
      .catch((err: unknown) => {
        if (live) toast(err instanceof Error ? err.message : "Could not open that creator.", "bad");
      });
    return () => {
      live = false;
    };
  }, [call, code, router, toast]);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    setBusy(true);
    try {
      if (code) {
        await call({
          action: "update-creator",
          code,
          nextCode: draft.code,
          name: draft.name,
          email: draft.email,
          discountPercent: Number(draft.discount),
          commissionPercent: Number(draft.commission),
        });
        toast("Creator saved.");
      } else {
        const data = await call({
          action: "create-creator",
          code: draft.code,
          name: draft.name,
          email: draft.email,
          discountPercent: Number(draft.discount),
          commissionPercent: Number(draft.commission),
        });
        const affiliate = data.affiliate as Creator | undefined;
        toast(affiliate ? `${affiliate.name} added.` : "Creator added.");
      }
      router.push("/admin/creators");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not save that creator.", "bad");
    } finally {
      setBusy(false);
    }
  }

  async function markPaid() {
    if (!code) return;
    setBusy(true);
    try {
      const data = await call({ action: "paid", code });
      const count = Number(data.count ?? 0);
      const creators = (data.creators as Creator[]) ?? [];
      const creator = creators.find((item) => item.code === (draft?.code || code).toUpperCase());
      if (creator && draft) setDraft({ ...draft, payable: creator.payable, clawback: creator.clawback });
      toast(count ? `Marked ${count} sale${count === 1 ? "" : "s"} paid.` : "Nothing is ready to pay yet.");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not mark that paid.", "bad");
    } finally {
      setBusy(false);
    }
  }

  if (!draft) {
    return (
      <div>
        <div className="piura-shimmer h-4 w-24" />
        <div className="piura-shimmer mt-4 h-12 w-56" />
        <div className="piura-shimmer mt-6 h-64 max-w-[760px]" />
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void save(event)} className="pb-28">
      <Link href="/admin/creators" className="font-serif text-[14px] text-brown">Creators</Link>
      <h1 className="mt-2 font-bebas text-[40px] leading-none text-olive sm:text-[52px]">{code ? "Edit creator" : "New creator"}</h1>
      <section className={`${panel} mt-6 grid max-w-[760px] gap-4 sm:grid-cols-2`}>
        <label className="block"><span className={label}>Name</span><input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className={field} /></label>
        <label className="block"><span className={label}>Email</span><input required type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} className={field} /></label>
        <label className="block sm:col-span-2"><span className={label}>Code</span><input required value={draft.code} onChange={(event) => setDraft({ ...draft, code: event.target.value.toUpperCase() })} placeholder="MAYA" className={`${field} uppercase`} /></label>
        <label className="block"><span className={label}>Follower discount %</span><input required inputMode="numeric" min={1} max={50} value={draft.discount} onChange={(event) => setDraft({ ...draft, discount: event.target.value })} className={field} /></label>
        <label className="block"><span className={label}>Commission %</span><input required inputMode="numeric" min={1} max={50} value={draft.commission} onChange={(event) => setDraft({ ...draft, commission: event.target.value })} className={field} /></label>
        <p className="font-serif text-[14px] leading-6 text-body sm:col-span-2">Followers type this code at checkout. Use 20% commission for a top performer. Past sales keep the commission they were given.</p>
        {draft.dashboardPath ? <p className="break-all font-serif text-[14px] leading-6 text-olive sm:col-span-2">{origin}{draft.dashboardPath}</p> : null}
        {code ? (
          <div className="grid grid-cols-2 gap-3 sm:col-span-2">
            <div className="bg-cream px-3 py-3">
              <p className="font-serif text-[12px] tracking-[0.12em] text-body uppercase">Ready to pay</p>
              <p className="mt-1 font-bebas text-[24px] leading-none text-olive">{money(draft.payable)}</p>
            </div>
            <div className="bg-cream px-3 py-3">
              <p className="font-serif text-[12px] tracking-[0.12em] text-body uppercase">To collect</p>
              <p className="mt-1 font-bebas text-[24px] leading-none text-olive">{money(draft.clawback)}</p>
            </div>
          </div>
        ) : null}
        {code ? (
          <button type="button" disabled={busy} onClick={() => void markPaid()} className="h-12 border border-olive/20 font-bebas text-[16px] tracking-[0.08em] text-olive disabled:opacity-60 sm:col-span-2">
            Mark ready sales paid
          </button>
        ) : null}
      </section>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-olive/10 bg-cream/95 px-4 py-3 backdrop-blur lg:left-[232px]">
        <div className="mx-auto flex w-full max-w-[1240px] items-center justify-end gap-2 sm:gap-3 sm:px-4">
          <Link href="/admin/creators" className="flex h-12 flex-1 items-center justify-center border border-olive/20 bg-white px-5 font-bebas text-[18px] tracking-[0.1em] text-olive sm:flex-none">
            Cancel
          </Link>
          <button type="submit" disabled={busy} className="flex h-12 flex-1 items-center justify-center bg-olive px-6 font-bebas text-[18px] tracking-[0.1em] text-cream disabled:opacity-60 sm:flex-none">
            {busy ? "Saving" : "Save"}
          </button>
        </div>
      </div>
    </form>
  );
}

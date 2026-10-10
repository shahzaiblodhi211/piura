"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { money, panel, useAdmin, useToast } from "@/components/admin-ui";

type Creator = {
  code: string;
  name: string;
  email: string;
  discountPercent: number;
  commissionPercent: number;
  pending: number;
  payable: number;
  clawback: number;
};

export function AdminCreators() {
  const { call } = useAdmin();
  const toast = useToast();
  const [creators, setCreators] = useState<Creator[] | null>(null);

  useEffect(() => {
    let live = true;
    call({ action: "creators" })
      .then((data) => {
        if (live) setCreators((data.creators as Creator[]) ?? []);
      })
      .catch((err: unknown) => {
        if (!live) return;
        setCreators([]);
        toast(err instanceof Error ? err.message : "Could not load creators.", "bad");
      });
    return () => {
      live = false;
    };
  }, [call, toast]);

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-serif text-[13px] tracking-[0.18em] text-brown uppercase">Affiliates</p>
          <h1 className="mt-1 font-bebas text-[40px] leading-none text-olive sm:text-[52px]">Creators</h1>
          <p className="mt-2 font-serif text-[15px] text-body">{creators ? `${creators.length} creators` : "Loading creators"}</p>
        </div>
        <Link href="/admin/creators/new" className="flex h-12 items-center justify-center bg-olive px-5 font-bebas text-[18px] tracking-[0.1em] text-cream">
          New creator
        </Link>
      </div>
      {creators === null ? (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <li key={index} className="border border-[#e6dfd8] bg-white p-6">
              <div className="piura-shimmer h-7 w-2/3" />
              <div className="piura-shimmer mt-4 h-4 w-1/2" />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="piura-shimmer h-16" />
                <div className="piura-shimmer h-16" />
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      {creators?.length === 0 ? (
        <div className="mt-6 border border-dashed border-olive/20 bg-white px-6 py-14 text-center">
          <p className="font-bebas text-[32px] text-olive">No creators yet</p>
          <p className="mx-auto mt-2 max-w-sm font-serif text-[15px] leading-6 text-body">Add a code for each person you send swim to.</p>
        </div>
      ) : null}
      {creators && creators.length > 0 ? (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {creators.map((creator) => (
            <li key={creator.code}>
              <Link href={`/admin/creators/${creator.code}`} className={`${panel} block`}>
                <div className="flex items-start justify-between gap-3">
                  <p className="font-bebas text-[28px] leading-none text-olive">{creator.name}</p>
                  <span className="bg-olive px-3 py-1.5 font-bebas text-[16px] tracking-[0.08em] text-cream">{creator.code}</span>
                </div>
                <p className="mt-3 font-serif text-[14px] text-body">{creator.email}</p>
                <p className="mt-2 font-serif text-[14px] text-olive">{creator.discountPercent}% off · {creator.commissionPercent}% commission</p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="bg-cream px-2 py-3 sm:px-3">
                    <p className="font-serif text-[11px] tracking-[0.12em] text-body uppercase">On hold</p>
                    <p className="mt-1 font-bebas text-[20px] leading-none text-olive sm:text-[22px]">{money(creator.pending)}</p>
                  </div>
                  <div className="bg-cream px-2 py-3 sm:px-3">
                    <p className="font-serif text-[11px] tracking-[0.12em] text-body uppercase">Ready to pay</p>
                    <p className="mt-1 font-bebas text-[20px] leading-none text-olive sm:text-[22px]">{money(creator.payable)}</p>
                  </div>
                  <div className="bg-cream px-2 py-3 sm:px-3">
                    <p className="font-serif text-[11px] tracking-[0.12em] text-body uppercase">To collect</p>
                    <p className="mt-1 font-bebas text-[20px] leading-none text-olive sm:text-[22px]">{money(creator.clawback)}</p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

import { PageShell } from "@/components/page-shell";
import { commissionDue } from "@/lib/affiliate-math";
import { findAffiliateByToken, listCommissions } from "@/lib/affiliates";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Creator earnings — Piura Swim",
  robots: { index: false, follow: false },
};

function money(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function AffiliateDashboard({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const affiliate = await findAffiliateByToken(token);
  if (!affiliate) notFound();
  const rows = (await listCommissions()).filter((row) => row.code === affiliate.code).sort((a, b) => b.placedAt.localeCompare(a.placedAt));
  const totals = { pending: 0, payable: 0, paid: 0, clawback: 0 };
  for (const row of rows) {
    const status = commissionDue(row.placedAt, row.paidAt, row.commissionCents <= 0);
    if (status === "pending") totals.pending += row.commissionCents;
    if (status === "payable") totals.payable += row.commissionCents;
    if (status === "paid") totals.paid += row.commissionCents;
    totals.clawback += row.clawbackCents;
  }

  return (
    <PageShell>
      <main className="mx-auto w-full max-w-[1560px] px-5 py-12 sm:px-8 sm:py-16 md:px-12 lg:px-16 xl:px-20">
        <p className="font-serif text-[16px] text-body sm:text-[18px]">Piura creators</p>
        <h1 className="mt-3 font-bebas text-[40px] leading-none text-olive sm:text-[56px]">{affiliate.name}</h1>
        <p className="mt-4 max-w-[640px] font-serif text-[16px] leading-7 text-body sm:text-[18px]">
          Code {affiliate.code} gives followers {affiliate.discountPercent}% off. You earn {affiliate.commissionPercent}% of what they pay. Commissions stay pending for 14 days, then Piura pays you directly.
        </p>
        <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Pending", totals.pending],
            ["Ready to pay", totals.payable],
            ["Paid", totals.paid],
            ["Refunds to return", totals.clawback],
          ].map(([label, cents]) => (
            <div key={String(label)} className="bg-cream px-4 py-4">
              <dt className="font-serif text-[14px] text-body">{label}</dt>
              <dd className="mt-2 font-bebas text-[28px] leading-none text-olive">{money(Number(cents))}</dd>
            </div>
          ))}
        </dl>
        <ul className="mt-10">
          {rows.length === 0 ? <li className="font-serif text-[16px] text-body">No sales with your code yet.</li> : null}
          {rows.map((row) => {
            const status = commissionDue(row.placedAt, row.paidAt, row.commissionCents <= 0);
            return (
              <li key={row.paymentIntentId} className="flex items-center justify-between gap-4 border-b border-olive/10 py-4 font-serif text-[15px] text-olive sm:text-[16px]">
                <span>
                  <span className="block">{row.orderNumber}</span>
                  <span className="mt-1 block text-[14px] text-body">{new Date(row.placedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </span>
                <span className="text-right">
                  <span className="block">{money(row.commissionCents)}</span>
                  <span className="mt-1 block text-[14px] text-body">{status === "payable" ? "Ready to pay" : status === "paid" ? "Paid" : status === "void" ? "Refunded" : "Pending"}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </main>
    </PageShell>
  );
}

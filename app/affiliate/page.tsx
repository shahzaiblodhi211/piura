import { AffiliateAdmin } from "@/components/affiliate-admin";
import { PageShell } from "@/components/page-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creators — Piura Swim",
  robots: { index: false, follow: false },
};

export default function AffiliateAdminPage() {
  return (
    <PageShell>
      <main className="mx-auto w-full max-w-[1560px] px-5 py-12 sm:px-8 sm:py-16 md:px-12 lg:px-16 xl:px-20">
        <p className="font-serif text-[16px] text-body sm:text-[18px]">Piura</p>
        <h1 className="mt-3 font-bebas text-[40px] leading-none text-olive sm:text-[56px]">Creators</h1>
        <p className="mt-4 max-w-[640px] font-serif text-[16px] leading-7 text-body sm:text-[18px]">
          Add a code for each person you send swim to. Followers get the discount at checkout. You pay the commission yourself after 14 days.
        </p>
        <AffiliateAdmin />
      </main>
    </PageShell>
  );
}

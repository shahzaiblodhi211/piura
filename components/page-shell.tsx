import type { ReactNode } from "react";
import { publicProducts } from "@/lib/catalog";
import { AnnouncementBar } from "./announcement-bar";
import { ComeCloserPopup } from "./come-closer-popup";
import { GsapRoot } from "./gsap-root";
import { HomeHeader } from "./home-header";
import { SiteFooter } from "./site-footer";
import { SitePerks } from "./site-perks";

export async function PageShell({
  children,
  hero = false,
}: {
  children: ReactNode;
  hero?: boolean;
}) {
  const catalog = hero ? undefined : await publicProducts();
  return (
    <GsapRoot>
      <AnnouncementBar coast />
      {hero ? null : <HomeHeader solid catalog={catalog} />}
      {children}
      <SitePerks />
      <SiteFooter tone="ink" />
      <ComeCloserPopup />
    </GsapRoot>
  );
}

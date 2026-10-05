import type { ReactNode } from "react";
import { AnnouncementBar } from "./announcement-bar";
import { ComeCloserPopup } from "./come-closer-popup";
import { GsapRoot } from "./gsap-root";
import { HomeHeader } from "./home-header";
import { SiteFooter } from "./site-footer";
import { SitePerks } from "./site-perks";

export function PageShell({
  children,
  hero = false,
}: {
  children: ReactNode;
  hero?: boolean;
}) {
  return (
    <GsapRoot>
      <AnnouncementBar coast />
      {hero ? null : <HomeHeader solid />}
      {children}
      <SitePerks />
      <SiteFooter tone="ink" />
      <ComeCloserPopup />
    </GsapRoot>
  );
}

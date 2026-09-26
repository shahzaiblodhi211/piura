import type { ReactNode } from "react";
import { AnnouncementBar } from "./announcement-bar";
import { GsapRoot } from "./gsap-root";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function PageShell({
  children,
  overlay = false,
  invert,
}: {
  children: ReactNode;
  overlay?: boolean;
  invert?: boolean;
}) {
  return (
    <GsapRoot>
      <AnnouncementBar />
      <div className={overlay ? "relative" : undefined}>
        <SiteHeader overlay={overlay} invert={invert} />
        {children}
      </div>
      <SiteFooter />
    </GsapRoot>
  );
}

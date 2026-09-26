"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, registerGsap } from "@/lib/gsap";

const items = [
  "Chase the sun",
  "Collect memories",
  "Wear confidence",
  "Designed in Miami",
  "Crafted in Perú",
] as const;

function Sequence({ hidden }: { hidden?: boolean }) {
  return (
    <div
      className="flex shrink-0 items-center"
      aria-hidden={hidden ? true : undefined}
    >
      {items.map((item) => (
        <p
          key={item}
          className="flex items-center whitespace-nowrap font-serif text-[16px] leading-[27px] font-medium tracking-[1.28px] text-white uppercase"
        >
          <span>{item}</span>
          <img
            src="/assets/home-ticker-diamond.svg"
            alt=""
            className="mx-[50px]"
          />
        </p>
      ))}
    </div>
  );
}

export function HomeTicker() {
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    registerGsap();
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.to(track, {
      xPercent: -50,
      duration: 28,
      ease: "none",
      repeat: -1,
    });
  }, []);

  return (
    <div className="w-full overflow-hidden bg-olive py-[16px]">
      <div ref={trackRef} className="flex w-max items-center will-change-transform">
        <Sequence />
        <Sequence hidden />
      </div>
    </div>
  );
}

"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, registerGsap } from "@/lib/gsap";

const items = [
  "CHASE THE SUN",
  "COLLECT MEMORIES",
  "WEAR CONFIDENCE",
  "DESIGNED IN MIAMI",
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
          className="flex items-center font-bebas text-[26px] leading-none whitespace-nowrap text-ink sm:text-[36px] md:text-[48px]"
        >
          <span>{item}</span>
          <img
            src="/assets/home-sparkle-ink.svg"
            alt=""
            className="mx-6 sm:mx-8"
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
    <div className="w-full overflow-hidden bg-[#f6f3ee] py-5">
      <div ref={trackRef} className="flex w-max items-center will-change-transform">
        <Sequence />
        <Sequence hidden />
      </div>
    </div>
  );
}

"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, registerGsap } from "@/lib/gsap";

const shots = [
  ["home-girls-1.png", "Woman in a pink Piura bikini on the sand"],
  ["home-girls-2.png", "Woman in a sage Piura bikini by the water"],
  ["home-girls-3.png", "Woman in a pink Piura bikini standing in the surf"],
  ["home-girls-4.png", "Woman in a pink Piura bikini walking the shore"],
  ["home-girls-5.png", "Woman in a patterned Piura bikini on the beach"],
  ["home-girls-6.png", "Woman in a pink Piura bikini facing the sea"],
  ["home-girls-7.png", "Woman in a Piura bikini at the waterline"],
] as const;

function Strip({ hidden }: { hidden?: boolean }) {
  return (
    <div className="flex shrink-0 gap-2.5" aria-hidden={hidden ? true : undefined}>
      {shots.map(([src, alt]) => (
        <span
          key={src}
          className="group block h-[280px] w-[186px] shrink-0 overflow-hidden rounded-[2px] sm:h-[362px] sm:w-[241px]"
        >
          <img
            alt={hidden ? "" : alt}
            src={`/assets/${src}`}
            className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
        </span>
      ))}
    </div>
  );
}

export function HomeFilmstrip() {
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    registerGsap();
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tween = gsap.to(track, {
      xPercent: -50,
      duration: 42,
      ease: "none",
      repeat: -1,
    });
    const pause = () => tween.pause();
    const play = () => tween.play();
    track.addEventListener("mouseenter", pause);
    track.addEventListener("mouseleave", play);

    return () => {
      track.removeEventListener("mouseenter", pause);
      track.removeEventListener("mouseleave", play);
      tween.kill();
    };
  }, []);

  return (
    <div className="mt-10 overflow-hidden">
      <div ref={trackRef} className="flex w-max gap-2.5">
        <Strip />
        <Strip hidden />
      </div>
    </div>
  );
}

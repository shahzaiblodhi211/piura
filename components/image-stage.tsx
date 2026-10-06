"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, registerGsap } from "@/lib/gsap";

export type StageSlide = {
  src: string;
  alt: string;
};

export function ImageStage({
  slides,
  index,
  className,
  fill = "cover",
}: {
  slides: StageSlide[];
  index: number;
  className?: string;
  fill?: "contain" | "cover";
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const prevRef = useRef(index);
  const readyRef = useRef(false);

  useLayoutEffect(() => {
    registerGsap();
    const root = rootRef.current;
    if (!root) return;
    const layers = Array.from(root.querySelectorAll<HTMLElement>("[data-slide]"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!readyRef.current) {
      readyRef.current = true;
      layers.forEach((layer, i) => {
        gsap.set(layer, { autoAlpha: i === index ? 1 : 0, xPercent: 0, scale: 1 });
      });
      prevRef.current = index;
      return;
    }

    const from = prevRef.current;
    if (from === index) return;
    prevRef.current = index;

    const outgoing = layers[from];
    const incoming = layers[index];
    if (!outgoing || !incoming) return;

    const len = slides.length;
    const delta = (index - from + len) % len;
    const dir = delta <= len / 2 ? 1 : -1;

    gsap.killTweensOf(layers);

    if (reduced) {
      gsap.set(outgoing, { autoAlpha: 0, xPercent: 0, scale: 1 });
      gsap.set(incoming, { autoAlpha: 1, xPercent: 0, scale: 1 });
      return;
    }

    gsap.set(incoming, { autoAlpha: 1, xPercent: 28 * dir, scale: 1.06 });
    gsap
      .timeline({ defaults: { ease: "piura" } })
      .to(
        outgoing,
        { xPercent: -22 * dir, autoAlpha: 0, scale: 0.94, duration: 0.55 },
        0,
      )
      .to(incoming, { xPercent: 0, scale: 1, duration: 0.8 }, 0.04);
  }, [index, slides.length]);

  return (
    <div
      ref={rootRef}
      data-gallery-stage
      className={`overflow-hidden ${className ?? "relative"}`}
    >
      {slides.map((slide, i) => (
        <div
          key={`${slide.src}-${i}`}
          data-slide
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: i === index ? 1 : 0 }}
        >
          <img
            alt={slide.alt}
            src={slide.src}
            className={
              fill === "contain"
                ? "absolute inset-0 size-full object-contain object-center"
                : "absolute inset-0 size-full object-cover object-[center_16%]"
            }
          />
        </div>
      ))}
    </div>
  );
}

"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ImageStage } from "./image-stage";
import { gsap, registerGsap } from "@/lib/gsap";

const views = [
  {
    src: "/assets/pdp-mannequin-back.png",
    alt: "Sunchild Triangle Bottom on a dress form, back",
    thumb: {
      width: "130.16%",
      height: "161.86%",
      left: "-14.97%",
      top: "-16.15%",
    },
  },
  {
    src: "/assets/pdp-mannequin-front.jpg",
    alt: "Sunchild Triangle Bottom on a dress form, front",
    thumb: {
      width: "99.94%",
      height: "109.02%",
      left: "0.03%",
      top: "0.01%",
    },
  },
];

export function SizeGuideGallery({ children }: { children: ReactNode }) {
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    registerGsap();
    const track = trackRef.current;
    if (!track) return;
    const active = track.querySelector<HTMLElement>(`[data-guide-thumb="${index}"]`);
    if (!active) return;
    gsap.to(track, {
      scrollLeft: active.offsetLeft - 8,
      duration: 0.55,
      ease: "piura",
      overwrite: "auto",
    });
  }, [index]);

  const go = (next: number) => {
    const wrapped = (next + views.length) % views.length;
    setIndex(wrapped);
  };

  return (
    <div className="flex w-full flex-col gap-12 min-[1400px]:flex-row min-[1400px]:items-start min-[1400px]:justify-between">
      <div className="w-full max-w-[567px]">
        {children}
        <div className="relative mt-10">
          <div
            ref={trackRef}
            data-slider
            className="flex snap-x snap-mandatory gap-[14px] overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {views.map((view, viewIndex) => (
              <button
                key={view.src}
                type="button"
                data-guide-thumb={viewIndex}
                onClick={() => setIndex(viewIndex)}
                className={`relative h-[112px] w-[92px] shrink-0 snap-start overflow-hidden bg-[#f9f6f4] sm:h-[180px] sm:w-[148px] ${
                  viewIndex === index ? "opacity-100" : "opacity-48"
                }`}
              >
                <img
                  alt=""
                  src={view.src}
                  className="absolute max-w-none"
                  style={view.thumb}
                />
              </button>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-6">
            <button
              type="button"
              aria-label="Previous size-guide photo"
              onClick={() => go(index - 1)}
              className="flex size-5 items-center justify-center"
            >
              <img src="/assets/icon-chevron.svg" alt="" className="rotate-180" />
            </button>
            <button
              type="button"
              aria-label="Next size-guide photo"
              onClick={() => go(index + 1)}
              className="flex size-5 items-center justify-center"
            >
              <img src="/assets/icon-chevron.svg" alt="" />
            </button>
          </div>
        </div>
      </div>
      <ImageStage
        slides={views}
        index={index}
        fill="cover"
        className="relative mx-auto h-[320px] w-full max-w-[280px] sm:h-[420px] sm:max-w-[380px] md:h-[520px] md:max-w-[480px] lg:h-[640px] lg:max-w-[728px] min-[1400px]:mt-0"
      />
    </div>
  );
}

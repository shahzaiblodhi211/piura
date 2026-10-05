"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { gsap, registerGsap } from "@/lib/gsap";

const photos = [
  { src: "/assets/home-girls-1.png", alt: "Woman in a pink Piura bikini on the sand" },
  { src: "/assets/home-girls-2.png", alt: "Woman in a sage Piura bikini by the water" },
  { src: "/assets/home-girls-3.png", alt: "Woman in a pink Piura bikini standing in the surf" },
  { src: "/assets/home-girls-4.png", alt: "Woman in a pink Piura bikini walking the shore" },
  { src: "/assets/home-girls-5.png", alt: "Woman in a patterned Piura bikini on the beach" },
  { src: "/assets/home-girls-6.png", alt: "Woman in a pink Piura bikini facing the sea" },
  { src: "/assets/home-girls-7.png", alt: "Woman in a Piura bikini at the waterline" },
];

const COPIES = 3;
const COUNT = photos.length;
const slides = Array.from({ length: COPIES * COUNT }, (_, i) => ({
  ...photos[i % COUNT],
  slot: i,
  look: i % COUNT,
}));

export function HomeLookbook() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef(COUNT + 2);
  const busyRef = useRef(false);
  const hoverRef = useRef(false);
  const draggedRef = useRef(false);
  const dragRef = useRef<{
    startX: number;
    startSlot: number;
    lastX: number;
    active: boolean;
  } | null>(null);
  const [index, setIndex] = useState(2);

  function metrics() {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    const card = track?.querySelector<HTMLElement>("[data-slot]");
    if (!wrap || !track || !card) return null;
    const styles = getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 28;
    return {
      stride: card.offsetWidth + gap,
      card: card.offsetWidth,
      viewport: wrap.clientWidth,
    };
  }

  function xFor(slot: number) {
    const size = metrics();
    if (!size) return 0;
    return size.viewport / 2 - size.card / 2 - slot * size.stride;
  }

  function place(slot: number) {
    const track = trackRef.current;
    if (!track) return;
    slotRef.current = slot;
    gsap.set(track, { x: xFor(slot), force3D: true });
  }

  function normalize(slot: number) {
    const logical = ((slot % COUNT) + COUNT) % COUNT;
    return { logical, slot: COUNT + logical };
  }

  function goToSlot(nextSlot: number, duration = 0.9) {
    const track = trackRef.current;
    if (!track || busyRef.current) return;
    const { logical, slot: mid } = normalize(nextSlot);
    if (nextSlot === slotRef.current) {
      setIndex(logical);
      return;
    }

    busyRef.current = true;
    registerGsap();
    setIndex(logical);
    gsap.to(track, {
      x: xFor(nextSlot),
      duration,
      ease: "piura",
      overwrite: true,
      force3D: true,
      onComplete: () => {
        slotRef.current = mid;
        if (mid !== nextSlot) gsap.set(track, { x: xFor(mid), force3D: true });
        busyRef.current = false;
      },
    });
  }

  function step(dir: 1 | -1) {
    goToSlot(slotRef.current + dir);
  }

  function goToLogical(target: number) {
    const current = ((slotRef.current % COUNT) + COUNT) % COUNT;
    let delta = target - current;
    if (delta > COUNT / 2) delta -= COUNT;
    if (delta < -COUNT / 2) delta += COUNT;
    goToSlot(slotRef.current + delta);
  }

  useLayoutEffect(() => {
    registerGsap();
    place(slotRef.current);

    const onResize = () => place(slotRef.current);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      if (hoverRef.current || busyRef.current || dragRef.current?.active) return;
      step(1);
    }, 3800);
    return () => window.clearInterval(timer);
  }, []);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    dragRef.current = {
      startX: event.clientX,
      lastX: event.clientX,
      startSlot: slotRef.current,
      active: false,
    };
    wrapRef.current?.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const track = trackRef.current;
    const size = metrics();
    if (!drag || !track || !size) return;
    const delta = event.clientX - drag.startX;
    if (!drag.active && Math.abs(delta) < 8) return;
    drag.active = true;
    drag.lastX = event.clientX;
    busyRef.current = true;
    gsap.killTweensOf(track);
    gsap.set(track, { x: xFor(drag.startSlot) + delta, force3D: true });
  }

  function onPointerUp() {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag?.active) {
      busyRef.current = false;
      return;
    }
    draggedRef.current = true;
    const size = metrics();
    const delta = drag.lastX - drag.startX;
    const steps = size ? Math.round(-delta / size.stride) : 0;
    busyRef.current = false;
    if (steps === 0) {
      goToSlot(drag.startSlot, 0.55);
      return;
    }
    goToSlot(drag.startSlot + steps, 0.7);
  }

  return (
    <div
      className="w-full"
      onMouseEnter={() => {
        hoverRef.current = true;
      }}
      onMouseLeave={() => {
        hoverRef.current = false;
      }}
    >
      <div
        ref={wrapRef}
        className="relative w-full cursor-grab overflow-hidden active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          ref={trackRef}
          data-look-track
          className="flex w-max touch-pan-y gap-2.5"
        >
          {slides.map((slide) => (
            <button
              key={`${slide.slot}-${slide.src}`}
              type="button"
              data-slot={slide.slot}
              data-look={slide.look}
              aria-label={slide.alt}
              onClick={() => {
                if (draggedRef.current) {
                  draggedRef.current = false;
                  return;
                }
                goToSlot(slide.slot);
              }}
              className="relative h-[280px] w-[186px] shrink-0 overflow-hidden rounded-[2px] sm:h-[362px] sm:w-[241px]"
            >
              <img
                alt={slide.alt}
                src={slide.src}
                draggable={false}
                className="pointer-events-none size-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
      <div className="mt-8 flex items-center justify-center gap-2">
        {photos.map((photo, i) => (
          <button
            key={photo.src}
            type="button"
            data-look-dot={i}
            aria-label={`Show look ${i + 1}`}
            aria-current={i === index}
            onClick={() => goToLogical(i)}
            className={`size-2.5 rounded-full ${i === index ? "bg-olive" : "bg-olive/25"}`}
          />
        ))}
      </div>
    </div>
  );
}

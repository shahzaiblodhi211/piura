"use client";

import { FormEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap, registerGsap } from "@/lib/gsap";

const STORAGE_KEY = "piura-come-closer";
const STARTED_KEY = "piura-come-closer-started";
const SCROLLED_KEY = "piura-come-closer-scrolled";
const DELAY_MS = 60_000;

const perks = [
  {
    src: "/assets/popup/perk-drops.png",
    label: "NEW DROPS FIRST",
    box: "h-14 w-14 sm:h-[92px] sm:w-[91px]",
  },
  {
    src: "/assets/popup/perk-access.png",
    label: "EXCLUSIVE ACCESS",
    box: "size-12 sm:size-[69px]",
  },
  {
    src: "/assets/popup/perk-scenes.png",
    label: "BEHIND THE SCENES",
    box: "size-14 sm:size-[84px]",
  },
];

export function ComeCloserPopup() {
  const [open, setOpen] = useState(false);
  const [joined, setJoined] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const canDismiss = useRef(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }

    let started = Number(window.sessionStorage.getItem(STARTED_KEY));
    if (!started) {
      started = Date.now();
      window.sessionStorage.setItem(STARTED_KEY, String(started));
    }

    let scrolled = window.sessionStorage.getItem(SCROLLED_KEY) === "1";
    let shown = false;

    const show = () => {
      if (shown || !scrolled || Date.now() - started < DELAY_MS) return;
      shown = true;
      setOpen(true);
    };

    const markScroll = () => {
      if (window.scrollY < 80) return;
      if (!scrolled) {
        scrolled = true;
        window.sessionStorage.setItem(SCROLLED_KEY, "1");
      }
      show();
    };

    const timer = window.setTimeout(show, Math.max(0, DELAY_MS - (Date.now() - started)));
    window.addEventListener("scroll", markScroll, { passive: true });
    markScroll();

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", markScroll);
    };
  }, []);

  useLayoutEffect(() => {
    if (!open) return;

    registerGsap();
    const overlay = overlayRef.current;
    const card = cardRef.current;
    if (!overlay || !card) return;

    document.body.style.overflow = "hidden";
    canDismiss.current = false;
    const unlock = window.setTimeout(() => {
      canDismiss.current = true;
    }, 250);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set(overlay, { autoAlpha: 1 });
      gsap.set(card, { autoAlpha: 1, y: 0, scale: 1 });
    } else {
      gsap.fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: "piura" });
      gsap.fromTo(
        card,
        { autoAlpha: 0, y: 36, scale: 0.97 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.75, ease: "piura", delay: 0.06 },
      );
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    const focus = window.setTimeout(() => emailRef.current?.focus(), 80);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(focus);
      window.clearTimeout(unlock);
    };
  }, [open]);

  function dismiss() {
    if (!canDismiss.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* storage can be blocked */
    }
    const overlay = overlayRef.current;
    const card = cardRef.current;
    if (!overlay || !card || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOpen(false);
      return;
    }
    registerGsap();
    gsap.to(overlay, { autoAlpha: 0, duration: 0.35, ease: "power3.inOut" });
    gsap.to(card, {
      autoAlpha: 0,
      y: 20,
      scale: 0.98,
      duration: 0.4,
      ease: "power3.inOut",
      onComplete: () => setOpen(false),
    });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    if (!email) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* storage can be blocked */
    }
    setJoined(true);
  }

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(0,0,0,0.33)] p-4 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="come-closer-title"
        className="grid max-h-[calc(100dvh-2rem)] w-full max-w-[1144px] overflow-y-auto rounded-[30px] bg-[#f6f3ee] md:h-[714px] md:grid-cols-2 md:overflow-hidden"
      >
        <div className="relative h-[240px] overflow-hidden sm:h-[320px] md:h-full">
          <img
            alt="Woman in a red bikini with the Piura tote on the beach"
            src="/assets/popup/portrait.jpg"
            className="absolute inset-0 size-full object-cover object-[center_22%]"
          />
        </div>

        <div className="relative flex flex-col px-6 pt-8 pb-8 sm:px-10 md:px-14 md:pt-11 md:pb-10">
          <button
            type="button"
            aria-label="Close"
            onClick={dismiss}
            className="absolute top-5 right-5 flex size-11 items-center justify-center md:top-8 md:right-8"
          >
            <img src="/assets/popup/close.svg" alt="" width={24} height={24} />
          </button>

          <div className="flex justify-center">
            <img alt="" src="/assets/brand/piura-black.svg" className="h-10 w-auto sm:h-[52px]" />
          </div>

          <div className="relative mt-8 md:mt-14">
            <h2
              id="come-closer-title"
              className="text-center font-bebas text-[42px] leading-none tracking-[-1.5px] text-[#353524] sm:text-[64px] md:text-[84px] md:tracking-[-3.36px]"
            >
              COME CLOSER
            </h2>
            <img
              alt=""
              src="/assets/popup/stamp.png"
              className="pointer-events-none absolute -top-6 -right-1 size-[96px] sm:-top-8 sm:size-[120px] md:top-[-60px] md:right-[-21px] md:size-[151px]"
            />
          </div>

          <p className="mx-auto mt-5 max-w-[382px] text-center font-serif text-[16px] leading-[24px] tracking-[-0.32px] text-ink sm:mt-6 sm:text-[18px] sm:leading-[26px] md:mt-10 md:text-[20px]">
            Get first access to new drops, exclusive discounts &amp; everything PIURA.
          </p>

          {joined ? (
            <p className="mt-10 text-center font-bebas text-[22px] tracking-[0.44px] text-ink">
              YOU&apos;RE ON THE LIST
            </p>
          ) : (
            <form className="mx-auto mt-8 flex w-full max-w-[461px] flex-col md:mt-[38px]" onSubmit={onSubmit}>
              <label className="sr-only" htmlFor="come-closer-email">
                Your email address
              </label>
              <input
                ref={emailRef}
                id="come-closer-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="Your email address"
                className="h-[54px] w-full border border-[#beb9b2] bg-white px-[26px] font-bebas text-[18px] text-ink placeholder:text-[rgba(34,33,31,0.71)] focus:outline-none"
              />
              <button
                type="submit"
                className="mt-[26px] flex h-[56px] w-full items-center justify-center bg-ink font-bebas text-[22px] tracking-[0.44px] text-[#f6f3ee] uppercase"
              >
                I&apos;m in
              </button>
            </form>
          )}

          <div className="mx-auto mt-8 grid w-full max-w-[461px] grid-cols-3 md:mt-9">
            {perks.map((perk, index) => (
              <div key={perk.label} className="relative flex flex-col items-center">
                {index > 0 ? (
                  <span className="absolute top-4 -left-px hidden h-[72px] w-px bg-[#d5d0c8] sm:block md:top-6 md:h-[102px]" />
                ) : null}
                <span className="flex h-16 w-full items-center justify-center sm:h-[92px]">
                  <img alt="" src={perk.src} className={`${perk.box} object-contain`} />
                </span>
                <p className="mt-1 w-[72px] text-center font-bebas text-[11px] leading-tight text-[#353524] sm:w-[79px] sm:text-[13px] md:text-[16px]">
                  {perk.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

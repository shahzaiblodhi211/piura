"use client";

import { FormEvent, useLayoutEffect, useRef, useState } from "react";
import { gsap, registerGsap } from "@/lib/gsap";

const fieldClass =
  "h-14 w-full border border-olive bg-white px-4 font-serif text-[16px] tracking-[0.32px] text-olive placeholder:text-olive focus:outline-none sm:h-[68px] sm:px-[26px] sm:text-[18px]";

export function WaitlistForm() {
  const [joined, setJoined] = useState(false);
  const successRef = useRef<HTMLParagraphElement>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    if (!email) return;
    setJoined(true);
  }

  useLayoutEffect(() => {
    if (!joined || !successRef.current) return;
    registerGsap();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(
      successRef.current,
      { y: 24, opacity: 0, filter: "blur(8px)" },
      { y: 0, opacity: 1, filter: "blur(0px)", duration: 1, ease: "piura" },
    );
  }, [joined]);

  if (joined) {
    return (
      <p
        ref={successRef}
        className="w-full max-w-[629px] font-serif text-[18px] leading-[30px] text-olive"
      >
        You’re on the list. We’ll write the moment the drop is ready.
      </p>
    );
  }

  return (
    <form
      data-form
      className="flex w-full max-w-[629px] flex-col"
      onSubmit={onSubmit}
    >
      <div className="flex w-full flex-col gap-[37px]">
        <label className="sr-only" htmlFor="drop-email">
          Your Email
        </label>
        <input
          id="drop-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Your Email"
          data-field
          className={fieldClass}
        />
        <label className="sr-only" htmlFor="drop-phone">
          Phone (optional)
        </label>
        <input
          id="drop-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="Phone (optional)"
          data-field
          className={fieldClass}
        />
      </div>
      <button
        type="submit"
        data-btn
        className="mt-7 flex h-14 w-full max-w-full items-center justify-center bg-olive px-4 font-serif text-[16px] tracking-[0.32px] text-cream uppercase sm:h-[71px] sm:px-[22px] sm:text-[18px]"
      >
        JOIN THE WAITLIST
      </button>
    </form>
  );
}

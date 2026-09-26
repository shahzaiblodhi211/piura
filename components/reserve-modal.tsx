"use client";

import { FormEvent, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap, registerGsap } from "@/lib/gsap";

const fieldClass =
  "h-[68px] w-full border border-olive bg-white px-[26px] font-serif text-[18px] tracking-[0.36px] text-olive placeholder:text-olive focus:outline-none";

function prettySize(size: string) {
  return size.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function ReserveModal({
  open,
  onClose,
  productName,
  size,
}: {
  open: boolean;
  onClose: () => void;
  productName: string;
  size: string;
}) {
  const [joined, setJoined] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLParagraphElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const onCloseRef = useRef(onClose);
  const canDismiss = useRef(false);
  onCloseRef.current = onClose;

  useLayoutEffect(() => {
    if (!open) {
      setJoined(false);
      canDismiss.current = false;
      return;
    }

    registerGsap();
    const overlay = overlayRef.current;
    const card = cardRef.current;
    if (!overlay || !card) return;

    document.body.style.overflow = "hidden";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    canDismiss.current = false;
    const unlock = window.setTimeout(() => {
      canDismiss.current = true;
    }, 250);

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
      if (event.key === "Escape") onCloseRef.current();
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

  useLayoutEffect(() => {
    if (!joined || !successRef.current) return;
    registerGsap();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(
      successRef.current,
      { y: 20, opacity: 0, filter: "blur(8px)" },
      { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.9, ease: "piura" },
    );
  }, [joined]);

  function close() {
    if (!canDismiss.current) return;
    const overlay = overlayRef.current;
    const card = cardRef.current;
    if (!overlay || !card) {
      onCloseRef.current();
      return;
    }
    registerGsap();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onCloseRef.current();
      return;
    }
    gsap.to(overlay, { autoAlpha: 0, duration: 0.35, ease: "power3.inOut" });
    gsap.to(card, {
      autoAlpha: 0,
      y: 20,
      scale: 0.98,
      duration: 0.4,
      ease: "power3.inOut",
      onComplete: () => onCloseRef.current(),
    });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    if (!email) return;
    setJoined(true);
  }

  if (typeof document === "undefined" || !open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(53,53,36,0.42)] px-4 py-6 md:items-center md:py-8"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        ref={cardRef}
        id="reserve-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reserve-title"
        className="relative my-auto grid w-full max-w-[1206px] overflow-hidden bg-white md:grid-cols-[minmax(0,533px)_minmax(0,1fr)]"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={close}
          className="absolute top-4 right-4 z-10 flex size-10 items-center justify-center"
        >
          <img src="/assets/icon-plus.svg" alt="" className="rotate-45" />
        </button>
        <div className="relative h-[240px] overflow-hidden md:h-auto md:min-h-[589px]">
          <img
            alt=""
            src="/assets/reserve-modal.png"
            className="absolute top-0 left-0 h-[184.5%] w-[305.98%] max-w-none"
          />
        </div>
        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 md:px-12 md:py-14 xl:px-[60px]">
          <h2
            id="reserve-title"
            className="font-serif text-[28px] leading-[1.15] font-normal tracking-[-0.04em] text-olive md:text-[36px] md:leading-[62px] md:tracking-[-1.44px]"
          >
            {productName} · {prettySize(size)}
          </h2>
          <p className="mt-3 w-full max-w-[490px] font-serif text-[16px] leading-[28px] text-body md:mt-4 md:text-[18px] md:leading-[30px]">
            Online checkout opens soon. Leave your email and we&apos;ll hold
            your place — the waitlist shops every drop 24 hours early, and the
            first 100 orders ship with a gift signed by our founder.
          </p>
          {joined ? (
            <p
              ref={successRef}
              className="mt-10 w-full max-w-[490px] font-serif text-[18px] leading-[30px] text-olive"
            >
              You’re reserved. We’ll write the moment this piece is ready to
              shop.
            </p>
          ) : (
            <form
              className="mt-10 flex w-full max-w-[581px] flex-col"
              onSubmit={onSubmit}
            >
              <label className="sr-only" htmlFor="reserve-email">
                Your Email
              </label>
              <input
                ref={emailRef}
                id="reserve-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="Your Email"
                className={fieldClass}
              />
              <label className="sr-only" htmlFor="reserve-phone">
                Phone (optional)
              </label>
              <input
                id="reserve-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="Phone (optional)"
                className={`mt-[37px] ${fieldClass}`}
              />
              <button
                type="submit"
                className="mt-[62px] flex h-[54px] w-full items-center justify-center bg-olive px-[34px] font-serif text-[18px] tracking-[0.36px] text-cream uppercase whitespace-nowrap"
              >
                reserve my place
              </button>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function ReserveButton({
  productName,
  size,
}: {
  productName: string;
  size: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        id="reserve-yours"
        data-btn
        onClick={() => setOpen(true)}
        className="mt-8 flex h-[58px] w-full max-w-[470px] items-center justify-center gap-4 bg-olive font-serif text-[16px] font-medium tracking-[0.64px] text-cream uppercase"
      >
        <img src="/assets/icon-bag.svg" alt="" />
        Reserve yours
      </button>
      <ReserveModal
        open={open}
        onClose={() => setOpen(false)}
        productName={productName}
        size={size}
      />
    </>
  );
}

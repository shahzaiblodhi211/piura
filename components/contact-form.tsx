"use client";

import { FormEvent, useLayoutEffect, useRef, useState } from "react";
import { gsap, registerGsap } from "@/lib/gsap";
import { postNote } from "@/lib/post-note";

const fieldClass =
  "w-full border border-olive bg-white px-[26px] font-serif text-[18px] tracking-[0.36px] text-olive placeholder:text-olive focus:outline-none";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const successRef = useRef<HTMLParagraphElement>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    const firstName = String(data.get("firstName") ?? "").trim();
    const lastName = String(data.get("lastName") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    if (!firstName || !lastName || !email || !message) return;
    setError("");
    setBusy(true);
    try {
      await postNote({ kind: "contact", name: `${firstName} ${lastName}`, email, phone, message });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send that. Try again.");
    } finally {
      setBusy(false);
    }
  }

  useLayoutEffect(() => {
    if (!sent || !successRef.current) return;
    registerGsap();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(
      successRef.current,
      { y: 24, opacity: 0, filter: "blur(8px)" },
      { y: 0, opacity: 1, filter: "blur(0px)", duration: 1, ease: "piura" },
    );
  }, [sent]);

  if (sent) {
    return (
      <p
        ref={successRef}
        className="w-full max-w-[682px] font-serif text-[18px] leading-[25px] text-olive"
      >
        Thank you. We’ll read this and write back — usually the same day.
      </p>
    );
  }

  return (
    <form
      data-form
      className="flex w-full max-w-[682px] flex-col"
      onSubmit={onSubmit}
    >
      <div className="flex w-full flex-col gap-6">
        <label className="sr-only" htmlFor="contact-first-name">
          First Name
        </label>
        <input
          id="contact-first-name"
          name="firstName"
          type="text"
          required
          autoComplete="given-name"
          placeholder="First Name"
          data-field
          className={`h-[54px] ${fieldClass}`}
        />
        <label className="sr-only" htmlFor="contact-last-name">
          Last Name
        </label>
        <input
          id="contact-last-name"
          name="lastName"
          type="text"
          required
          autoComplete="family-name"
          placeholder="Last Name"
          data-field
          className={`h-[54px] ${fieldClass}`}
        />
        <label className="sr-only" htmlFor="contact-email">
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Email"
          data-field
          className={`h-[54px] ${fieldClass}`}
        />
        <label className="sr-only" htmlFor="contact-phone">
          Phone (optional)
        </label>
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="Phone (optional)"
          data-field
          className={`h-[54px] ${fieldClass}`}
        />
        <label className="sr-only" htmlFor="contact-message">
          Your Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          placeholder="Your Message"
          data-field
          className={`h-[154px] min-h-[154px] resize-none py-[18px] ${fieldClass}`}
        />
      </div>
      <button
        type="submit"
        data-btn
        disabled={busy}
        className="mt-12 flex h-[54px] w-full max-w-[258px] items-center justify-center bg-olive px-[22px] font-serif text-[18px] tracking-[0.36px] text-cream uppercase whitespace-nowrap disabled:opacity-60"
      >
        {busy ? "Sending" : "Send"}
      </button>
      {error ? <p className="mt-4 font-serif text-[16px] text-[#8a1c1c]">{error}</p> : null}
      <p
        data-note
        className="mt-6 w-full font-serif text-[16px] leading-[25px] font-normal text-[#7c7c7c]"
      >
        Read and answered personally — usually the same day.
      </p>
    </form>
  );
}

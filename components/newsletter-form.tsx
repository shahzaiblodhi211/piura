"use client";

import { FormEvent, useState } from "react";

export function NewsletterForm({ tone = "light" }: { tone?: "light" | "ink" }) {
  const ink = tone === "ink";
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    setJoined(true);
  }

  if (joined) {
    return (
      <p data-intro className={`mt-[39px] font-serif text-[18px] tracking-[0.36px] ${ink ? "text-white" : "text-olive"}`}>
        You are on the list.
      </p>
    );
  }

  return (
    <form
      className="mt-[39px] mb-0 flex w-full max-w-[467px] flex-row items-center gap-3 sm:gap-[14px]"
      onSubmit={onSubmit}
    >
      <label className="sr-only" htmlFor="waitlist-email">
        Email address
      </label>
      <input
        id="waitlist-email"
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Your Email"
        className={`h-[54px] min-w-0 flex-1 border px-4 text-[16px] tracking-[0.32px] focus:outline-none sm:max-w-[336px] sm:px-[26px] sm:text-[18px] sm:tracking-[0.36px] ${
          ink
            ? "border-white bg-transparent font-bebas text-white placeholder:text-white"
            : "border-olive bg-white font-serif text-olive placeholder:text-olive"
        }`}
      />
      <button
        type="submit"
        data-btn
        className={`flex h-[54px] w-[96px] shrink-0 items-center justify-center font-bebas text-[18px] sm:w-[117px] ${
          ink ? "bg-white text-ink" : "bg-olive font-serif text-cream"
        }`}
      >
        Join
      </button>
    </form>
  );
}

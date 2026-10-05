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
      className="mt-[39px] mb-0 flex w-full max-w-[467px] flex-col gap-3 sm:flex-row sm:items-center sm:gap-[14px]"
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
        className={`h-[54px] w-full max-w-[336px] border px-[26px] text-[18px] tracking-[0.36px] focus:outline-none ${
          ink
            ? "border-white bg-transparent font-bebas text-white placeholder:text-white"
            : "border-olive bg-white font-serif text-olive placeholder:text-olive"
        }`}
      />
      <button
        type="submit"
        data-btn
        className={`flex h-[54px] w-full max-w-[117px] items-center justify-center font-bebas text-[18px] ${
          ink ? "bg-white text-ink" : "bg-olive font-serif text-cream"
        }`}
      >
        Join
      </button>
    </form>
  );
}

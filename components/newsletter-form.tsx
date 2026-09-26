"use client";

import { FormEvent, useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    setJoined(true);
  }

  if (joined) {
    return (
      <p data-intro className="mt-[39px] font-serif text-[18px] tracking-[0.36px] text-olive">
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
        className="h-[54px] w-full max-w-[336px] border border-olive bg-white px-[26px] font-serif text-[18px] tracking-[0.36px] text-olive placeholder:text-olive focus:outline-none"
      />
      <button
        type="submit"
        data-btn
        className="flex h-[54px] w-full max-w-[117px] items-center justify-center bg-olive font-serif text-[18px] tracking-[0.36px] text-cream"
      >
        Join
      </button>
    </form>
  );
}

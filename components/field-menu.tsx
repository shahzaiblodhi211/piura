"use client";

import { useEffect, useId, useRef, useState } from "react";

export type FieldOption = { value: string; label: string };

export function FieldMenu({
  name,
  value,
  placeholder,
  options,
  onChange,
  required = false,
}: {
  name: string;
  value: string;
  placeholder: string;
  options: FieldOption[];
  onChange: (value: string) => void;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    root.current?.closest("form")?.dispatchEvent(new Event("change", { bubbles: true }));
  }, [value]);

  return (
    <div ref={root} className="relative">
      <input tabIndex={-1} aria-hidden readOnly name={name} value={value} required={required} className="sr-only" />
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
        className="flex h-14 w-full items-center justify-between gap-3 border border-olive bg-white px-4 text-left font-serif text-[16px] outline-none sm:px-[22px] sm:text-[17px]"
      >
        <span className={`min-w-0 truncate ${selected ? "text-olive" : "text-olive/45"}`}>{selected?.label ?? placeholder}</span>
        <span
          aria-hidden
          className={`size-2 shrink-0 border-r border-b border-olive transition-transform ${open ? "-translate-y-0.5 rotate-[225deg]" : "translate-y-[-1px] rotate-45"}`}
        />
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 z-30 mt-1 max-h-72 w-max min-w-full max-w-[min(320px,calc(100vw-2.5rem))] overflow-y-auto border border-olive bg-white py-1 shadow-[0_18px_40px_rgba(53,53,36,0.14)]"
        >
          {options.map((option) => {
            const active = option.value === value;
            return (
              <li key={option.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full px-4 py-2.5 text-left font-serif text-[16px] text-olive sm:px-[22px] ${active ? "bg-cream" : "hover:bg-cream"}`}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

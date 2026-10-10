"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export const field = "h-12 w-full border border-[#e6dfd8] bg-white px-3.5 font-serif text-[16px] text-ink outline-none transition placeholder:text-olive/35 focus:border-olive";
export const label = "mb-2 block font-serif text-[13px] text-body";
export const panel = "border border-[#e6dfd8] bg-white p-4 sm:p-6";

export function money(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

type ToastTone = "ok" | "bad";
type ToastItem = { id: number; message: string; tone: ToastTone };

const ToastContext = createContext<(message: string, tone?: ToastTone) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

function ToastCard({ item, onDone }: { item: ToastItem; onDone: (id: number) => void }) {
  const [shown, setShown] = useState(false);
  const bad = item.tone === "bad";

  useEffect(() => {
    const enter = requestAnimationFrame(() => setShown(true));
    const hide = window.setTimeout(() => setShown(false), 3600);
    const remove = window.setTimeout(() => onDone(item.id), 4000);
    return () => {
      cancelAnimationFrame(enter);
      window.clearTimeout(hide);
      window.clearTimeout(remove);
    };
  }, [item.id, onDone]);

  return (
    <div className={`pointer-events-auto relative flex min-h-14 items-center gap-3 overflow-hidden px-4 py-3 shadow-[0_18px_50px_rgba(34,33,31,0.22)] transition duration-300 ${shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"} ${bad ? "bg-[#3c221c] text-[#f6ebe6]" : "bg-olive text-cream"}`}>
      <span className={`font-bebas text-[13px] tracking-[0.18em] ${bad ? "text-[#e7b2a4]" : "text-cream/70"}`}>{bad ? "Hold on" : "Done"}</span>
      <p className="min-w-0 flex-1 font-serif text-[15px] leading-5">{item.message}</p>
      <button type="button" onClick={() => onDone(item.id)} className="px-1 font-serif text-[20px] leading-none opacity-70" aria-label="Dismiss">
        ×
      </button>
      <span className={`piura-toast absolute inset-x-0 bottom-0 h-0.5 origin-left ${bad ? "bg-[#e7b2a4]" : "bg-cream/80"}`} />
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((message: string, tone: ToastTone = "ok") => {
    setToasts((list) => [...list, { id: Date.now() + Math.random(), message, tone }]);
  }, []);

  const remove = useCallback((id: number) => {
    setToasts((list) => list.filter((item) => item.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-[5.5rem] z-[60] flex w-full justify-center px-4 lg:pl-[232px]">
        <div className="flex w-full max-w-[560px] flex-col gap-2">
          {toasts.map((item) => (
            <ToastCard key={item.id} item={item} onDone={remove} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

type AdminCall = (body: Record<string, unknown>) => Promise<Record<string, unknown>>;

const AdminContext = createContext<{ call: AdminCall; origin: string } | null>(null);

export function AdminProvider({ call, origin, children }: { call: AdminCall; origin: string; children: ReactNode }) {
  return <AdminContext.Provider value={{ call, origin }}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const value = useContext(AdminContext);
  if (!value) throw new Error("Admin is not ready.");
  return value;
}

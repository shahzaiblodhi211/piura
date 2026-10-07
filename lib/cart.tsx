"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartPiece = "top" | "bottom" | "onepiece";

export type CartLine = {
  id: string;
  slug: string;
  name: string;
  piece: CartPiece;
  size: string;
  price: number;
  src: string;
  qty: number;
  preorder: boolean;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  total: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (line: Omit<CartLine, "id" | "qty">, qty?: number) => void;
  addMany: (items: Omit<CartLine, "id" | "qty">[]) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "piura-preorder-cart";

const CartContext = createContext<CartContextValue | null>(null);

function lineId(line: Pick<CartLine, "slug" | "piece" | "size">) {
  return `${line.slug}:${line.piece}:${line.size}`;
}

export function pieceLabel(piece: CartPiece) {
  if (piece === "top") return "Top";
  if (piece === "bottom") return "Bottom";
  return "One-piece";
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setLines(JSON.parse(saved) as CartLine[]);
    } catch {
      setLines([]);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, ready]);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((sum, line) => sum + line.qty, 0);
    const total = lines.reduce((sum, line) => sum + line.qty * line.price, 0);
    return {
      lines,
      count,
      total,
      open,
      setOpen,
      add(line, qty = 1) {
        const id = lineId(line);
        setLines((current) => {
          const existing = current.find((item) => item.id === id);
          if (!existing) return [...current, { ...line, id, qty }];
          return current.map((item) => (item.id === id ? { ...item, qty: item.qty + qty } : item));
        });
        setOpen(true);
      },
      addMany(items) {
        setLines((current) => {
          let next = current;
          for (const line of items) {
            const id = lineId(line);
            const existing = next.find((item) => item.id === id);
            next = existing
              ? next.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item))
              : [...next, { ...line, id, qty: 1 }];
          }
          return next;
        });
        setOpen(true);
      },
      setQty(id, qty) {
        setLines((current) =>
          qty < 1 ? current.filter((item) => item.id !== id) : current.map((item) => (item.id === id ? { ...item, qty } : item)),
        );
      },
      remove(id) {
        setLines((current) => current.filter((item) => item.id !== id));
      },
      clear() {
        setLines([]);
      },
    };
  }, [lines, open]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("useCart must be used within CartProvider");
  return cart;
}

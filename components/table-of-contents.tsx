"use client";

import { useEffect, useState } from "react";

export type TocItem = {
  id: string;
  number: string;
  label: string;
};

export function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id);

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => Boolean(node));

    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) {
          setActiveId(visible.target.id);
        }
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="On this page" className="w-full bg-white lg:max-w-[449px]">
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            data-toc-item
            onClick={() => setActiveId(item.id)}
            className={`grid min-h-16 w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 border-b border-olive py-3 font-serif text-[16px] leading-[1.4] font-bold tracking-[0.72px] uppercase lg:text-[18px] ${
              isActive ? "text-olive" : "text-olive-muted"
            }`}
          >
            <span className="w-10 shrink-0">{item.number}</span>
            <span className="w-full min-w-0 whitespace-normal lg:whitespace-nowrap">
              {item.label}
            </span>
            <span className="flex size-[31.113px] shrink-0 items-center justify-center justify-self-end">
              <span data-toc-arrow className="-rotate-45 will-change-transform">
                <img src="/assets/arrow-down-right.svg" alt="" />
              </span>
            </span>
          </a>
        );
      })}
    </nav>
  );
}

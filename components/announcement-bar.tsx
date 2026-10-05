"use client";

const items = [
  "FREE US SHIPPING OVER $100",
  "THE NEXT DROP - WAITLIST GETS 24-HOUR EARLY ACCESS",
  "CRAFTED IN PIURA, PERU",
] as const;

function AnnouncementSequence({ hidden }: { hidden?: boolean }) {
  return (
    <div
      className="flex shrink-0 items-center"
      aria-hidden={hidden ? true : undefined}
    >
      {items.map((item) => (
        <p
          key={item}
          className="flex items-center whitespace-nowrap font-serif text-[16px] leading-none font-medium tracking-[1.28px] text-olive uppercase"
        >
          <span>{item}</span>
          <img src="/assets/diamond.svg" alt="" className="mx-[50px]" />
        </p>
      ))}
    </div>
  );
}

export function AnnouncementBar({ coast = false }: { coast?: boolean }) {
  if (coast) {
    return (
      <div
        data-chrome
        className="flex h-[55px] w-full items-center justify-center gap-4 bg-ink px-4 sm:gap-6"
      >
        <img src="/assets/home-sparkle.svg" alt="" className="shrink-0" />
        <p className="flex items-center gap-3.5 font-bebas text-[18px] leading-none tracking-[0.72px] text-white sm:text-[24px]">
          <span className="whitespace-nowrap">COASTLINES PREORDER NOW</span>
          <img src="/assets/home-dot.svg" alt="" />
          <span className="hidden whitespace-nowrap sm:inline">
            THE NEW ERA OF PIURA
          </span>
        </p>
        <img src="/assets/home-sparkle.svg" alt="" className="shrink-0" />
      </div>
    );
  }

  return (
    <div data-chrome className="w-full overflow-hidden py-[12px]">
      <div data-marquee className="flex w-max items-center will-change-transform">
        <AnnouncementSequence />
        <AnnouncementSequence hidden />
      </div>
    </div>
  );
}

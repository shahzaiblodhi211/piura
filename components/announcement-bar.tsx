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
        className="flex h-11 w-full items-center justify-center gap-3 bg-ink px-3 sm:h-[55px] sm:gap-6 sm:px-4"
      >
        <img src="/assets/home-sparkle.svg" alt="" className="h-3.5 w-3.5 shrink-0 sm:h-auto sm:w-auto" />
        <p className="flex items-center gap-2.5 font-bebas text-[15px] leading-none tracking-[0.6px] text-white sm:gap-3.5 sm:text-[20px] md:text-[24px]">
          <span className="whitespace-nowrap">COASTLINES PREORDER NOW</span>
          <img src="/assets/home-dot.svg" alt="" />
          <span className="hidden whitespace-nowrap sm:inline">
            THE NEW ERA OF PIURA
          </span>
        </p>
        <img src="/assets/home-sparkle.svg" alt="" className="h-3.5 w-3.5 shrink-0 sm:h-auto sm:w-auto" />
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

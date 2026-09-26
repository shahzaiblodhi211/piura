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

export function AnnouncementBar() {
  return (
    <div data-chrome className="w-full overflow-hidden py-[12px]">
      <div data-marquee className="flex w-max items-center will-change-transform">
        <AnnouncementSequence />
        <AnnouncementSequence hidden />
      </div>
    </div>
  );
}

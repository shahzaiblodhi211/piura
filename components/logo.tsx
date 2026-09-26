import Link from "next/link";

export function Logo({ invert = false }: { invert?: boolean }) {
  return (
    <Link
      href="/"
      data-logo
      className="relative block h-[67px] w-[183px]"
      aria-label="Piura Swim"
    >
      <div className="absolute top-0 left-0 h-[67px] w-[124px] overflow-hidden">
        <img
          alt=""
          src="/assets/logo.png"
          className="absolute top-[-60.54%] left-[-6.45%] block h-[221.08%] w-[216.94%] max-w-none"
          style={invert ? { filter: "brightness(0) invert(1)" } : undefined}
        />
      </div>
      <span
        className={`absolute top-[35px] left-[136px] font-display text-[18px] leading-normal font-medium tracking-[1.08px] ${invert ? "text-white" : "text-olive"}`}
      >
        SWIM
      </span>
    </Link>
  );
}

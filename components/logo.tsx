import Link from "next/link";

export function Logo({ invert = false }: { invert?: boolean }) {
  return (
    <Link href="/" data-logo className="block w-fit" aria-label="Piura Swim">
      <img
        alt=""
        src={invert ? "/assets/brand/piura-white.svg" : "/assets/brand/piura-black.svg"}
        className="h-12 w-auto sm:h-16"
      />
    </Link>
  );
}

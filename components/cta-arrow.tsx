export function CtaArrow({ tone = "olive" }: { tone?: "olive" | "cream" }) {
  return (
    <span className="flex size-[31.113px] shrink-0 items-center justify-center">
      <span className="-rotate-45">
        <img
          alt=""
          src={
            tone === "cream"
              ? "/assets/arrow-down-right-cream.svg"
              : "/assets/arrow-down-right.svg"
          }
        />
      </span>
    </span>
  );
}

export function SplitTitle({
  text,
  className,
  as: Tag = "h1",
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <Tag className={className}>
      {text.split(" ").map((word, index) => (
        <span
          key={`${word}-${index}`}
          className="inline-block overflow-hidden pb-[0.08em] align-bottom [perspective:220px]"
        >
          <span
            data-title-word
            className="inline-block origin-bottom will-change-transform [transform-style:preserve-3d]"
          >
            {word}
            {"\u00A0"}
          </span>
        </span>
      ))}
    </Tag>
  );
}

import type { CSSProperties } from "react";

export function CroppedAsset({
  src,
  alt = "",
  width,
  height,
  crop,
}: {
  src: string;
  alt?: string;
  width: number;
  height: number;
  crop: { width: string; height: string; left: string; top: string };
}) {
  return (
    <div
      className="relative shrink-0 overflow-hidden [width:var(--box-w)] [height:var(--box-h)] max-xl:[width:calc(var(--box-w)*0.72)] max-xl:[height:calc(var(--box-h)*0.72)]"
      style={
        {
          "--box-w": `${width}px`,
          "--box-h": `${height}px`,
        } as CSSProperties
      }
    >
      <img
        alt={alt}
        src={src}
        className="absolute max-w-none"
        style={{
          width: crop.width,
          height: crop.height,
          left: crop.left,
          top: crop.top,
        }}
      />
    </div>
  );
}

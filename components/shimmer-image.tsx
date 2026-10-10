"use client";

import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";

function displaySrc(src: string) {
  const marker = "/image/upload/";
  const at = src.indexOf(marker);
  if (at === -1 || src.includes("/upload/f_auto")) return src;
  return `${src.slice(0, at + marker.length)}f_auto,q_auto/${src.slice(at + marker.length)}`;
}

type Props = ImgHTMLAttributes<HTMLImageElement> & { src: string };

export function ShimmerImage({ src, alt = "", className, onLoad, ...rest }: Props) {
  const shown = displaySrc(src);
  const imageRef = useRef<HTMLImageElement>(null);
  const [current, setCurrent] = useState(shown);
  const [ready, setReady] = useState(false);

  if (shown !== current) {
    setCurrent(shown);
    setReady(false);
  }

  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth > 0) setReady(true);
  }, [current]);

  return (
    <>
      <span aria-hidden className={`piura-shimmer pointer-events-none absolute inset-0 transition-opacity duration-500 ${ready ? "opacity-0" : "opacity-100"}`} />
      <img
        {...rest}
        ref={imageRef}
        alt={alt}
        src={shown}
        className={className}
        onLoad={(event) => {
          setReady(true);
          onLoad?.(event);
        }}
      />
    </>
  );
}

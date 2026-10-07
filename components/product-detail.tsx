"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import {
  productDescription,
  productPriceLine,
  productSizes,
  sizeInStock,
  type Product,
} from "@/lib/products";
import { ImageStage } from "./image-stage";
import { PreorderPurchase } from "./preorder-purchase";

export type ProductSlide = {
  src: string;
  alt: string;
  crop?: { width: string; height: string; left: string; top: string };
  thumbCrop?: { width: string; height: string; left: string; top: string };
};

const sideCrop = {
  width: "145.13%",
  height: "120.18%",
  left: "-22.01%",
  top: "-8.78%",
};

function CroppedImage({
  src,
  alt,
  crop,
}: {
  src: string;
  alt: string;
  crop?: { width: string; height: string; left: string; top: string };
}) {
  return (
    <div className="relative size-full overflow-hidden">
      {crop ? (
        <img
          alt={alt}
          src={src}
          className="absolute max-w-none"
          style={crop}
        />
      ) : (
        <img alt={alt} src={src} className="size-full object-cover object-[center_16%]" />
      )}
    </div>
  );
}

function Thumbnails({
  slides,
  index,
  onSelect,
  className,
  trackRef,
  fill = false,
}: {
  slides: ProductSlide[];
  index: number;
  onSelect: (value: number) => void;
  className?: string;
  trackRef?: RefObject<HTMLDivElement | null>;
  fill?: boolean;
}) {
  return (
    <div ref={trackRef} className={className}>
      {slides.map((slide, slideIndex) => (
        <button
          key={`${slide.src}-${slideIndex}`}
          type="button"
          data-thumb={slideIndex}
          onClick={() => onSelect(slideIndex)}
          className={`relative snap-start overflow-hidden bg-[#f9f6f4] ${
            fill
              ? "h-[84px] min-w-[68px] flex-1 sm:h-[120px] sm:min-w-[100px] md:h-[150px] md:min-w-[132px]"
              : "h-[72px] w-[58px] shrink-0 sm:h-[120px] sm:w-[100px] md:h-[180px] md:w-[148px]"
          } ${slideIndex === index ? "opacity-100" : "opacity-48"}`}
        >
          <CroppedImage
            src={slide.src}
            alt=""
            crop={slide.thumbCrop ?? slide.crop}
          />
        </button>
      ))}
    </div>
  );
}

function ProductCopy({
  product,
  size,
  setSize,
  open,
  setOpen,
}: {
  product: Product;
  size: (typeof productSizes)[number];
  setSize: (value: (typeof productSizes)[number]) => void;
  open: string | null;
  setOpen: (value: string | null | ((current: string | null) => string | null)) => void;
}) {
  const accordions = [
    {
      title: "Production details",
      body: product.details,
    },
    {
      title: "Fabric",
      body: product.price
        ? product.fabric
        : `Fabric codes: ${product.fabric}. Hand wash cold, lie flat to dry, and keep it out of the dryer.`,
    },
    {
      title: "Sizes and quantity",
      body: product.runs
        .map((run) =>
          `${run.piece} — ${run.counts
            .map((row) =>
              product.price ? `${row.size}: ${row.qty > 0 ? "in stock" : "sold out"}` : `${row.size}: ${row.qty}`,
            )
            .join(" · ")}`,
        )
        .join(" "),
    },
  ];

  return (
    <>
      <h1
        data-intro
        className="font-serif text-[22px] leading-[1.2] font-normal tracking-[-0.04em] text-olive sm:text-[24px] md:text-[28px] md:tracking-[-1.12px]"
      >
        {product.name}
      </h1>
      {productPriceLine(product) ? (
        <p data-intro className="mt-3 font-serif text-[18px] leading-none tracking-[0.36px] text-olive">
          {productPriceLine(product)}
        </p>
      ) : null}
      <p
        data-intro
        className="mt-6 w-full max-w-[470px] font-serif text-[16px] leading-[25px] font-normal text-body"
      >
        {productDescription(product)}
      </p>
      <p className="mt-8 font-serif text-[16px] font-medium tracking-[0.64px] text-olive uppercase">
        SIZE:
      </p>
      <div className="mt-3 grid w-full max-w-[470px] grid-cols-2 gap-[14px]">
        {productSizes.map((option) => {
          const active = size === option;
          return (
            <button
              key={option}
              type="button"
              data-tab
              disabled={!sizeInStock(product, option)}
              onClick={() => setSize(option)}
              className={`flex h-[44px] items-center justify-center px-[26px] font-serif text-[14px] tracking-[0.28px] whitespace-nowrap uppercase disabled:cursor-not-allowed disabled:opacity-35 ${
                active
                  ? "border border-olive text-olive"
                  : "border border-[rgba(53,53,36,0.4)] text-[rgba(53,53,36,0.75)]"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
      <PreorderPurchase product={product} size={size} />
      <div className="mt-8 w-full max-w-[470px]">
        {accordions.map((item) => {
          const expanded = open === item.title;
          return (
            <div key={item.title} className="py-2.5">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 text-left"
                aria-expanded={expanded}
                onClick={() =>
                  setOpen((value) => (value === item.title ? null : item.title))
                }
              >
                <span className="font-serif text-[16px] font-medium tracking-[0.64px] text-olive uppercase">
                  {item.title}
                </span>
                <img
                  src="/assets/icon-plus.svg"
                  alt=""
                  className={`transition-transform duration-300 ${expanded ? "rotate-45" : ""}`}
                />
              </button>
              {expanded ? (
                <p className="mt-3 font-serif text-[16px] leading-[28px] text-body">
                  {item.body}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </>
  );
}

export function ProductDetail({
  product,
  slides,
  featured = false,
}: {
  product: Product;
  slides: ProductSlide[];
  featured?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [size, setSize] = useState<(typeof productSizes)[number]>(
    () => productSizes.find((option) => sizeInStock(product, option)) ?? "SMALL",
  );
  const [open, setOpen] = useState<string | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const active = track.querySelector<HTMLElement>(`[data-thumb="${index}"]`);
    if (!active) return;
    track.scrollTo({
      left: active.offsetLeft - track.clientWidth / 2 + active.clientWidth / 2,
      behavior: "smooth",
    });
  }, [index]);
  const copy = (
    <ProductCopy
      product={product}
      size={size}
      setSize={setSize}
      open={open}
      setOpen={setOpen}
    />
  );

  const stage = (className: string) => (
    <ImageStage slides={slides} index={index} className={className} />
  );

  const chevrons =
    slides.length > 1 ? (
      <div className="flex items-center gap-6 min-[1400px]:w-full min-[1400px]:justify-between">
        <button
          type="button"
          aria-label="Previous image"
          onClick={() =>
            setIndex((value) => (value - 1 + slides.length) % slides.length)
          }
          className="flex size-5 items-center justify-center"
        >
          <img src="/assets/icon-chevron.svg" alt="" className="rotate-180" />
        </button>
        <button
          type="button"
          aria-label="Next image"
          onClick={() => setIndex((value) => (value + 1) % slides.length)}
          className="flex size-5 items-center justify-center"
        >
          <img src="/assets/icon-chevron.svg" alt="" />
        </button>
      </div>
    ) : null;

  if (!featured) {
    return (
      <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-10 px-5 pt-10 pb-16 sm:px-8 md:px-12 md:pt-12 lg:px-16 xl:flex-row xl:items-start xl:justify-between xl:px-20 xl:pt-16 xl:pb-20">
        <div className="flex w-full flex-col items-center xl:max-w-[720px]">
          <div className="relative h-[380px] w-full max-w-[320px] sm:h-[460px] sm:max-w-[400px] md:h-[540px] md:max-w-[520px]">
            {stage("absolute inset-4")}
          </div>
          {slides.length > 1 ? (
            <div className="mt-6 flex w-full items-center gap-3">
              <button
                type="button"
                aria-label="Previous image"
                onClick={() =>
                  setIndex((value) => (value - 1 + slides.length) % slides.length)
                }
                className="flex size-9 shrink-0 items-center justify-center"
              >
                <img src="/assets/icon-chevron.svg" alt="" className="rotate-180" />
              </button>
              <Thumbnails
                slides={slides}
                index={index}
                onSelect={setIndex}
                trackRef={trackRef}
                fill
                className="flex min-w-0 flex-1 snap-x snap-mandatory gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              />
              <button
                type="button"
                aria-label="Next image"
                onClick={() => setIndex((value) => (value + 1) % slides.length)}
                className="flex size-9 shrink-0 items-center justify-center"
              >
                <img src="/assets/icon-chevron.svg" alt="" />
              </button>
            </div>
          ) : null}
        </div>
        <div className="w-full bg-white xl:max-w-[586px] xl:pt-2 xl:pl-9">
          {copy}
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto grid w-full max-w-[1560px] grid-cols-1 min-[1400px]:grid-cols-3">
      <div className="relative hidden min-h-[906px] min-[1400px]:block">
        <div className="absolute inset-0 bg-[#f9f6f4] opacity-42" />
        <div className="absolute top-10 left-[14.7%] h-[650px] w-[69.1%] max-w-[359px] overflow-hidden opacity-70">
          <img
            alt=""
            src="/assets/pdp-side.png"
            className="absolute max-w-none"
            style={sideCrop}
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[188px] bg-white" />
        {slides.length > 1 ? (
          <Thumbnails
            slides={slides}
            index={index}
            onSelect={setIndex}
            className="absolute bottom-2 left-1 z-10 flex gap-1"
          />
        ) : null}
      </div>

      <div className="relative flex flex-col px-5 pt-10 pb-8 sm:px-8 min-[1400px]:h-[906px] min-[1400px]:px-0 min-[1400px]:pt-0 min-[1400px]:pb-0">
        <div className="absolute inset-0 hidden bg-[#f9f6f4] min-[1400px]:block" />
        <div className="relative h-[420px] w-full sm:h-[520px] md:h-[640px] min-[1400px]:h-[818px]">
          {stage("absolute inset-0")}
        </div>
        {slides.length > 1 ? (
          <div className="relative flex w-full items-center justify-between gap-4 py-6 min-[1400px]:px-8">
            <Thumbnails
              slides={slides}
              index={index}
              onSelect={setIndex}
              className="flex gap-2 overflow-x-auto min-[1400px]:hidden"
            />
            <div className="hidden sm:flex min-[1400px]:w-full">{chevrons}</div>
          </div>
        ) : null}
      </div>

      <div className="relative px-5 pb-16 sm:px-8 min-[1400px]:min-h-[906px] min-[1400px]:px-0 min-[1400px]:pb-0">
        <div className="absolute inset-0 hidden bg-[#f9f6f4] opacity-42 min-[1400px]:block" />
        <div className="relative bg-white min-[1400px]:mt-10 min-[1400px]:px-9 min-[1400px]:pt-10 min-[1400px]:pb-16">
          {copy}
        </div>
      </div>
    </div>
  );
}

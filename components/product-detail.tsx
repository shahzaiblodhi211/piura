"use client";

import { useState } from "react";
import {
  productDescription,
  productSizes,
  type Product,
} from "@/lib/products";
import { ImageStage } from "./image-stage";
import { ReserveButton } from "./reserve-modal";

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
        <img alt={alt} src={src} className="size-full object-contain" />
      )}
    </div>
  );
}

function Thumbnails({
  slides,
  index,
  onSelect,
  className,
}: {
  slides: ProductSlide[];
  index: number;
  onSelect: (value: number) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      {slides.map((slide, slideIndex) => (
        <button
          key={`${slide.src}-${slideIndex}`}
          type="button"
          onClick={() => onSelect(slideIndex)}
          className={`relative h-[90px] w-[74px] shrink-0 overflow-hidden bg-[#f9f6f4] sm:h-[180px] sm:w-[148px] ${
            slideIndex === index ? "opacity-100" : "opacity-48"
          }`}
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
      title: "The fit",
      body: "True to size. Triangle pieces tie to you. When in doubt between two sizes, size up in bottoms for more coverage, down for extra cheeky.",
    },
    {
      title: "Fabric & care",
      body: "Luxury fabric, crafted in Piura, Peru. Hand wash cold, lie flat to dry, and keep it out of the dryer.",
    },
    {
      title: "Shipping & exchanges",
      body: "Free US shipping on orders over $100. Easy exchanges within 14 days — hassle-free.",
    },
  ];

  return (
    <>
      <h1
        data-intro
        className="font-serif text-[24px] leading-[1.2] font-normal tracking-[-0.04em] text-olive md:text-[28px] md:tracking-[-1.12px]"
      >
        {product.name}
      </h1>
      <p
        data-intro
        className="mt-3 font-serif text-[18px] leading-normal font-medium tracking-[0.8px] text-olive uppercase md:text-[20px]"
      >
        {product.price}
      </p>
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
              onClick={() => setSize(option)}
              className={`flex h-[44px] items-center justify-center px-[26px] font-serif text-[14px] tracking-[0.28px] uppercase ${
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
      <ReserveButton productName={product.name} size={size} />
      <p className="mt-5 w-full max-w-[466px] font-serif text-[16px] leading-[28px] font-medium text-body">
        Waitlist-first while we prepare the next drop — reserving holds your
        place.
      </p>
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
  const [size, setSize] = useState<(typeof productSizes)[number]>("SMALL");
  const [open, setOpen] = useState<string | null>(null);
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
      <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-10 px-5 pt-28 pb-16 sm:px-8 md:px-12 md:pt-32 lg:px-16 xl:flex-row xl:items-start xl:justify-between xl:px-20 xl:pt-[148px] xl:pb-20">
        <div className="w-full xl:max-w-[720px]">
          <div className="relative aspect-square w-full max-w-[520px]">
            {stage("absolute inset-4")}
          </div>
          {slides.length > 1 ? (
            <div className="mt-6 flex items-center justify-between gap-4">
              <Thumbnails
                slides={slides}
                index={index}
                onSelect={setIndex}
                className="flex gap-2 overflow-x-auto"
              />
              <div className="hidden sm:flex">{chevrons}</div>
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
        <div className="absolute top-[148px] left-[14.7%] h-[650px] w-[69.1%] max-w-[359px] overflow-hidden opacity-70">
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

      <div className="relative flex flex-col px-5 pt-28 pb-8 sm:px-8 min-[1400px]:h-[906px] min-[1400px]:px-0 min-[1400px]:pt-0 min-[1400px]:pb-0">
        <div className="absolute inset-0 hidden bg-[#f9f6f4] min-[1400px]:block" />
        <div className="relative h-[520px] w-full min-[1400px]:h-[818px]">
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
        <div className="relative bg-white min-[1400px]:mt-[148px] min-[1400px]:px-9 min-[1400px]:pt-10 min-[1400px]:pb-16">
          {copy}
        </div>
      </div>
    </div>
  );
}

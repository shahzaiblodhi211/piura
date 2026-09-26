import { CroppedAsset } from "./cropped-asset";

const features = [
  {
    title: "True to size",
    subtitle: "Fits Small – X-Large",
    src: "/assets/icon-size.png",
    width: 153,
    height: 84,
    crop: { width: "140.2%", height: "257.66%", left: "-20.1%", top: "-90.09%" },
  },
  {
    title: "Luxury fabric",
    subtitle: "Crafted in Piura, Peru",
    src: "/assets/icon-fabric.png",
    width: 82,
    height: 77,
    crop: { width: "163.64%", height: "176.47%", left: "-30.91%", top: "-43.14%" },
  },
  {
    title: "Free US shipping",
    subtitle: "On orders over $100",
    src: "/assets/icon-shipping.png",
    width: 100,
    height: 102,
    crop: { width: "170.09%", height: "165.83%", left: "-35.9%", top: "-38.33%" },
  },
  {
    title: "Easy exchanges",
    subtitle: "14-day, hassle-free",
    src: "/assets/icon-exchanges.png",
    width: 85,
    height: 86,
    crop: { width: "143.02%", height: "140.57%", left: "-19.77%", top: "-21.71%" },
  },
];

export function ContactFeatures({ className }: { className?: string }) {
  return (
    <section
      className={
        className ??
        "mt-16 w-full bg-[rgba(245,240,236,0.48)] md:mt-24 xl:mt-[203px]"
      }
    >
      <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-10 px-5 py-12 sm:flex-row sm:flex-wrap sm:px-8 md:px-12 xl:min-h-[200px] xl:flex-nowrap xl:items-center xl:justify-between xl:gap-6 xl:px-[65px] xl:py-8">
        {features.map((feature) => (
          <div
            key={feature.title}
            data-feature
            className="flex w-full min-w-0 items-center gap-5 sm:w-[calc(50%-20px)] xl:w-auto xl:max-w-none"
          >
            <div data-feature-icon>
              <CroppedAsset
                src={feature.src}
                width={feature.width}
                height={feature.height}
                crop={feature.crop}
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-[13px] font-serif font-medium xl:flex-none">
              <p className="text-[18px] tracking-[0.72px] text-olive uppercase sm:whitespace-nowrap">
                {feature.title}
              </p>
              <p className="text-[16px] tracking-[0.64px] text-[#83807b] xl:whitespace-nowrap">
                {feature.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const perks = [
  {
    icon: "/assets/home-feat-ship.svg",
    title: "Free US shipping",
    body: "On orders over $100",
  },
  {
    icon: "/assets/home-feat-exchange.svg",
    title: "Easy exchanges",
    body: "14-day, hassle-free",
  },
  {
    icon: "/assets/home-feat-size.svg",
    title: "True to size",
    body: "Fits Small – X-Large",
  },
  {
    icon: "/assets/home-feat-cloth.svg",
    title: "Luxury fabric",
    body: "Crafted in Piura, Peru",
  },
];

export function SitePerks() {
  return (
    <section className="w-full py-12 md:py-16">
      <div className="mx-auto grid w-full max-w-[1560px] grid-cols-1 gap-4 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        {perks.map((perk) => (
          <div
            key={perk.title}
            data-feature
            className="flex min-h-[96px] items-center gap-3 rounded-[2px] bg-[#f6f1ee] px-4 sm:h-[125px] sm:gap-4 sm:px-5"
          >
            <img src={perk.icon} alt="" data-feature-icon className="h-9 w-9 shrink-0 object-contain sm:h-12 sm:w-12" />
            <div>
              <p className="font-bebas text-[18px] tracking-[0.72px] text-ink uppercase sm:text-[22px] lg:text-[26px]">
                {perk.title}
              </p>
              <p className="font-serif text-[14px] tracking-[-0.28px] text-ink sm:text-[16px]">{perk.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

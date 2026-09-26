const rows = [
  { size: "S", bust: "32 – 34\"", waist: "25 – 26\"", hips: "35 – 36\"" },
  { size: "M", bust: "34 – 36\"", waist: "27 – 28\"", hips: "37 – 38\"" },
  { size: "L", bust: "37 – 39\"", waist: "29 – 31\"", hips: "39 – 41\"" },
  { size: "XL", bust: "40 – 42\"", waist: "32 – 34\"", hips: "42 – 44\"" },
];

export function SizeChart() {
  return (
    <div data-reveal className="w-full overflow-hidden bg-[#fcfbf8]">
      <div className="relative mx-auto hidden h-[459px] w-full max-w-[1312px] overflow-hidden xl:block">
        <img
          alt="Size chart from Small to X-Large"
          src="/assets/size-chart.png"
          className="absolute top-[-10.46%] left-0 h-[118.95%] w-full max-w-none"
        />
      </div>
      <table className="w-full border-collapse xl:hidden">
        <caption className="sr-only">Piura Swim size chart in inches</caption>
        <thead>
          <tr className="font-serif text-[13px] tracking-[0.12em] text-brown uppercase">
            <th className="px-5 py-6 text-left font-normal">Size</th>
            <th className="px-5 py-6 text-left font-normal">Bust (A)</th>
            <th className="px-5 py-6 text-left font-normal">Waist (B)</th>
            <th className="px-5 py-6 text-left font-normal">Hips (C)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.size} className="font-serif text-olive">
              <th className="px-5 py-7 text-left text-[40px] leading-none font-normal">
                {row.size}
              </th>
              <td className="px-5 py-7 text-[18px]">{row.bust}</td>
              <td className="px-5 py-7 text-[18px]">{row.waist}</td>
              <td className="px-5 py-7 text-[18px]">{row.hips}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

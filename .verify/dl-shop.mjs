import { writeFileSync } from "fs";

const files = [
  ["https://www.figma.com/api/mcp/asset/9123f895-de68-4f8b-ac51-c32ec678fcf6.png", "public/assets/shop-hero-coast.png"],
  ["https://www.figma.com/api/mcp/asset/a1a7df8f-da80-4650-bda8-f380e0151ae6.png", "public/assets/shop-life-sun-top.png"],
  ["https://www.figma.com/api/mcp/asset/963dd8ff-3dd9-4612-a2b5-a6eff2311e71.png", "public/assets/shop-life-sun-bottom.png"],
  ["https://www.figma.com/api/mcp/asset/8bbeffe7-3b70-482d-ab5e-97830a472026.png", "public/assets/shop-life-moon-top.png"],
  ["https://www.figma.com/api/mcp/asset/aee2dc43-8e00-4e4d-890a-781a1121911b.png", "public/assets/shop-life-moon-bottom.png"],
  ["https://www.figma.com/api/mcp/asset/3a314a8e-47b4-49b1-a311-1641291d6249.png", "public/assets/shop-life-tote.png"],
];

for (const [url, dest] of files) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${dest}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
  console.log(dest, buf.length);
}

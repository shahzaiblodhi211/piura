import { writeFileSync } from "fs";

const assets = [
  ["https://www.figma.com/api/mcp/asset/66914129-ebe8-4a41-927e-5a1fd2f64233.png", "public/assets/home-hero.png"],
  ["https://www.figma.com/api/mcp/asset/38fc2534-787d-49a3-afc9-b3d0f505fb6f.svg", "public/assets/home-hero-veil.svg"],
  ["https://www.figma.com/api/mcp/asset/eaa937e8-8b4c-4b59-b057-8cdeaca459d0.svg", "public/assets/home-peru.svg"],
  ["https://www.figma.com/api/mcp/asset/487550aa-4d41-4634-8cdc-5d1a21a4f079.svg", "public/assets/home-pin-ring.svg"],
  ["https://www.figma.com/api/mcp/asset/562489f6-e5f1-48ac-a9b1-f8ff54d15851.svg", "public/assets/home-pin-arrow.svg"],
  ["https://www.figma.com/api/mcp/asset/c3bb6511-9326-441b-bcb0-24a9ede32b4f.svg", "public/assets/home-ticker-diamond.svg"],
  ["https://www.figma.com/api/mcp/asset/1c00538b-a280-46af-aace-bc8debc21a65.svg", "public/assets/home-look-dots.svg"],
  ["https://www.figma.com/api/mcp/asset/82085354-706a-4dc5-9cb0-30d143fdca35.png", "public/assets/home-look-1.png"],
  ["https://www.figma.com/api/mcp/asset/2a81d8db-7312-40b4-a4ff-b6129103b43c.png", "public/assets/home-look-2.png"],
  ["https://www.figma.com/api/mcp/asset/4e6f5245-32f3-4043-acdd-a4c287e3029c.png", "public/assets/home-look-3.png"],
  ["https://www.figma.com/api/mcp/asset/946e31e3-6c9d-406b-8bf4-a446ab067b8a.png", "public/assets/home-look-4.png"],
  ["https://www.figma.com/api/mcp/asset/0853693a-4236-40c6-86e1-6c3269b16d5c.png", "public/assets/home-look-5.png"],
  ["https://www.figma.com/api/mcp/asset/27d72932-800c-4033-abef-d3f455e27571.png", "public/assets/home-miami.png"],
  ["https://www.figma.com/api/mcp/asset/96167413-18e5-4b77-adf7-1f858c8df711.png", "public/assets/home-mood-1.png"],
  ["https://www.figma.com/api/mcp/asset/6cb21a2a-0991-4d69-952f-21fb62dc2f4f.png", "public/assets/home-mood-2.png"],
  ["https://www.figma.com/api/mcp/asset/6f0bed9d-db58-4256-8b8b-84c9ee4c8a14.png", "public/assets/home-mood-3.png"],
  ["https://www.figma.com/api/mcp/asset/39872645-9b7e-4fa5-9582-78e3881dd5ee.png", "public/assets/home-waitlist.png"],
  ["https://www.figma.com/api/mcp/asset/c0aa25ce-9565-419b-99eb-11d993ad3d91.png", "public/assets/home-city.png"],
];

for (const [url, dest] of assets) {
  const res = await fetch(url);
  if (!res.ok) {
    console.log("FAIL", dest, res.status);
    continue;
  }
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  console.log("ok", dest);
}

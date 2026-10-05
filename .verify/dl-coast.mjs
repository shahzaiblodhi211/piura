import { writeFileSync } from "fs";

const assets = [
  ["https://www.figma.com/api/mcp/asset/2f125f11-f41a-4197-b643-cb3edfd87c7e.png", "public/assets/home-coast-hero.png"],
  ["https://www.figma.com/api/mcp/asset/1589b190-014e-4ec6-a58e-11eb347a992d.png", "public/assets/home-meet-1.png"],
  ["https://www.figma.com/api/mcp/asset/5edb4e2b-e20b-4fb0-a56c-42cddb11435c.png", "public/assets/home-meet-2.png"],
  ["https://www.figma.com/api/mcp/asset/2ca5f4b4-5d1a-4601-b6f1-497c1d02133c.png", "public/assets/home-meet-3.png"],
  ["https://www.figma.com/api/mcp/asset/aadc2afb-796c-41d4-9e2b-c5987bd5512c.png", "public/assets/home-meet-4.png"],
  ["https://www.figma.com/api/mcp/asset/72a91a59-ad17-4faa-a699-3135e4ec5959.png", "public/assets/home-coll-tops.png"],
  ["https://www.figma.com/api/mcp/asset/39437330-566e-4967-9a12-80e774ee763c.png", "public/assets/home-coll-bottoms.png"],
  ["https://www.figma.com/api/mcp/asset/724db36b-7188-4eae-a248-abdcfcc8041f.png", "public/assets/home-coll-classics.png"],
  ["https://www.figma.com/api/mcp/asset/aea327d4-9068-4b84-ab09-4b7be63496a1.png", "public/assets/home-coll-sun.png"],
  ["https://www.figma.com/api/mcp/asset/69ec781e-b0f2-45fa-9277-43014ad6abed.png", "public/assets/home-coll-moon.png"],
  ["https://www.figma.com/api/mcp/asset/46df23b1-a3b2-4b8e-9fc0-86465a7021e1.png", "public/assets/home-cat-sheet.png"],
  ["https://www.figma.com/api/mcp/asset/4f4abf0d-744f-412e-a63c-afbf0bd5a7e3.png", "public/assets/home-tote.png"],
  ["https://www.figma.com/api/mcp/asset/8700d124-e4a4-4e9c-9f7d-bf0098e9f108.png", "public/assets/home-girls-1.png"],
  ["https://www.figma.com/api/mcp/asset/d42bb5eb-6a01-47e9-8b6c-1a8e9b70dabf.png", "public/assets/home-girls-2.png"],
  ["https://www.figma.com/api/mcp/asset/34eb3523-a84b-401d-b69f-2bfc039ae582.png", "public/assets/home-girls-3.png"],
  ["https://www.figma.com/api/mcp/asset/0b1e9e1a-73be-4553-974c-e031dc13dffe.png", "public/assets/home-girls-4.png"],
  ["https://www.figma.com/api/mcp/asset/fce32993-6e43-4b18-a3e4-6ee747a50f8c.png", "public/assets/home-girls-5.png"],
  ["https://www.figma.com/api/mcp/asset/e61863ec-9d07-4ab9-b8e5-a04936773e02.png", "public/assets/home-girls-6.png"],
  ["https://www.figma.com/api/mcp/asset/2a7e017a-44c4-49a7-9fc3-55e5d9aa8811.png", "public/assets/home-girls-7.png"],
  ["https://www.figma.com/api/mcp/asset/88a76e8d-cda7-40ab-978f-3e38e7bee0f8.svg", "public/assets/home-sparkle.svg"],
  ["https://www.figma.com/api/mcp/asset/65886553-344d-4c2a-93fa-32714d214475.svg", "public/assets/home-sparkle-ink.svg"],
  ["https://www.figma.com/api/mcp/asset/cdea8fb9-4d96-4537-82cd-553a23cb11db.svg", "public/assets/home-dot.svg"],
  ["https://www.figma.com/api/mcp/asset/7e9c593f-f96d-487e-9d05-0dbca72f8352.svg", "public/assets/home-icon-search.svg"],
  ["https://www.figma.com/api/mcp/asset/220c8377-f32f-4c32-a7f6-c3756f52a741.svg", "public/assets/home-icon-user.svg"],
  ["https://www.figma.com/api/mcp/asset/772dc79c-3dda-4806-8ec6-b424bc7b52fd.svg", "public/assets/home-icon-bag.svg"],
  ["https://www.figma.com/api/mcp/asset/6844729c-69c0-4b43-ade7-3f655a3fa516.svg", "public/assets/home-heart.svg"],
  ["https://www.figma.com/api/mcp/asset/5f6519fd-ac1a-4368-9236-76aad5d06763.svg", "public/assets/home-feat-ship-mask.svg"],
  ["https://www.figma.com/api/mcp/asset/0cab383b-540a-4c8e-8011-d032e58bfe77.svg", "public/assets/home-feat-ship.svg"],
  ["https://www.figma.com/api/mcp/asset/c1f2b560-842b-4b02-a4cc-dd91b5659885.svg", "public/assets/home-feat-exchange-mask.svg"],
  ["https://www.figma.com/api/mcp/asset/a25d2e80-339c-4220-86ce-46597d0b2fec.svg", "public/assets/home-feat-exchange.svg"],
  ["https://www.figma.com/api/mcp/asset/e9bdb7d3-5b3b-4e72-8ddd-7c9cc9ca5058.svg", "public/assets/home-feat-size.svg"],
  ["https://www.figma.com/api/mcp/asset/337aaa31-d5af-4e8b-8bd3-8b47e8df8e36.svg", "public/assets/home-feat-cloth.svg"],
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

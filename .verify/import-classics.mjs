import { mkdir, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const live = JSON.parse(readFileSync(path.join(root, ".verify/live-products.json"), "utf8"));
const outDir = path.join(root, "public/assets/classics");
await mkdir(outDir, { recursive: true });

const sizeMap = { Small: "S", Medium: "M", Large: "L", XL: "XL", "X-Large": "XL" };

async function one(product, image, index) {
  const name = `${product.handle}-${String(index).padStart(2, "0")}.jpg`;
  const dest = path.join(outDir, name);
  const src = `/assets/classics/${name}`;
  if (!existsSync(dest)) {
    const res = await fetch(image.url);
    if (!res.ok) throw new Error(`${res.status} ${image.url}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await sharp(buf)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(dest);
    console.log("saved", name, buf.length);
  } else {
    console.log("skip", name);
  }
  return { src, alt: image.altText || product.title };
}

const entries = [];
for (const product of live) {
  const gallery = [];
  let n = 0;
  for (const image of product.images) {
    n += 1;
    gallery.push(await one(product, image, n));
  }
  const price = Math.round(Number(product.priceRange.minVariantPrice.amount));
  const kind = product.category === "tops" ? "top" : "bottom";
  const counts = product.variants.map((variant) => ({
    size: sizeMap[variant.title] ?? variant.title,
    qty: variant.availableForSale ? 1 : 0,
  }));
  entries.push({
    name: product.title,
    src: gallery[0].src,
    alt: gallery[0].alt,
    kind,
    collection: product.collection,
    price,
    colorway: (product.fitNotes ?? []).join(". ").replace(/\.+$/, "") + ".",
    fabric: (product.fabric ?? []).join(". ").replace(/\.+$/, "") + ".",
    details: product.description,
    gallery,
    runs: [{ piece: kind === "top" ? "Top" : "Bottom", counts }],
  });
  console.log(product.handle, gallery.length, price);
}

const body = `import type { Product } from "./products";

export const classicProducts: Product[] = ${JSON.stringify(entries, null, 2)};
`;
await writeFile(path.join(root, "lib/classics.ts"), body);
console.log("wrote", entries.length);

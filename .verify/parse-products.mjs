import { readFileSync, writeFileSync } from "fs";
let blob = readFileSync(".verify/live-shop-decoded.txt", "utf8");
const start = blob.indexOf('[{"id":"gid://shopify/Product/');
if (start < 0) {
  console.log("no array");
  process.exit(1);
}
let depth = 0;
let end = start;
for (let i = start; i < blob.length; i++) {
  if (blob[i] === "[") depth++;
  else if (blob[i] === "]") {
    depth--;
    if (depth === 0) {
      end = i + 1;
      break;
    }
  }
}
const products = JSON.parse(blob.slice(start, end));
const slim = products.map((p) => ({
  title: p.title,
  handle: p.handle,
  price: p.variants?.[0]?.price?.amount,
  images: (p.images || p.media || []).map((img) => img.url || img.src || img.originalSrc || JSON.stringify(img).slice(0, 120)),
  imageKeys: Object.keys(p),
}));
console.log(slim.map((p) => `${p.title} | $${p.price} | imgs ${p.images.length} | ${p.handle}`).join("\n"));
console.log("keys", slim[0]?.imageKeys);
writeFileSync(".verify/live-products.json", JSON.stringify(products, null, 2));

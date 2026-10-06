import { readFileSync } from "fs";
const live = JSON.parse(readFileSync(".verify/live-products.json", "utf8"));
for (const product of live) {
  const odd = product.images
    .map((img, i) => ({ i: i + 1, w: img.width, h: img.height, ratio: +(img.width / img.height).toFixed(2), url: img.url.split("/").pop().split("?")[0] }))
    .filter((img) => img.ratio > 0.85 || img.h < 2000);
  if (odd.length) {
    console.log(product.handle);
    for (const img of odd) console.log(" ", img.i, img.w, img.h, img.ratio, img.url);
  }
}

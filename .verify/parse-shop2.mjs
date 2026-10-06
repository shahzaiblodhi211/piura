import { readFileSync, writeFileSync } from "fs";
const html = readFileSync(".verify/live-shop.html", "utf8");
const keys = ["price", "Price", "src", "image", "slug", "handle"];
for (const key of keys) {
  const i = html.indexOf(key);
  console.log(key, i);
}
const chunks = [...html.matchAll(/self\.__next_f\.push\((\[.*?\])\)/g)];
console.log("pushes", chunks.length);
let blob = "";
for (const chunk of html.matchAll(/self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g)) {
  blob += chunk[1];
}
console.log("blob", blob.length);
writeFileSync(".verify/live-shop-blob.txt", blob.slice(0, 200000));
const titles = [...blob.matchAll(/Triangle Top|Bella|Bali|Sara|Marina|Moonchild|Sunchild|Scrunch|Bandeau/g)];
console.log("title hits", titles.length);

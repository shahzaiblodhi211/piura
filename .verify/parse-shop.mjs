import { readFileSync } from "fs";
const html = readFileSync(".verify/live-shop.html", "utf8");
const names = [...html.matchAll(/[A-Z][a-z]+ (?:Bikini|Bandeau|Kini|Top|Bottom|Tote)[^"<]{0,40}/g)].map((m) => m[0]);
console.log("names", [...new Set(names)].slice(0, 80));
const prices = [...html.matchAll(/\$\d+/g)].map((m) => m[0]);
console.log("prices", [...new Set(prices)]);
const paths = [...html.matchAll(/\/(?:shop|product)\/[a-z0-9-]+/g)].map((m) => m[0]);
console.log("paths", [...new Set(paths)].slice(0, 80));

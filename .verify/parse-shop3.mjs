import { readFileSync, writeFileSync } from "fs";
let blob = readFileSync(".verify/live-shop-blob.txt", "utf8");
blob = blob.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
const idx = blob.indexOf("Bella Bikini");
console.log("idx", idx);
console.log(blob.slice(Math.max(0, idx - 400), idx + 800));
writeFileSync(".verify/live-shop-decoded.txt", blob);

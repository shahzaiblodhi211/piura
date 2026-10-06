import { readFileSync, writeFileSync } from "fs";

const charts = {
  "Moonchild Mesh Bottom": "/assets/classics/moonchild-bottom-07.jpg",
  "Moonchild Bandeau Top": "/assets/classics/moonchild-bandeau-top-11.jpg",
  "Sunchild Mesh Bottom": "/assets/classics/lotus-bottom-09.jpg",
  "Sunchild Bandeau Top": "/assets/classics/sunchild-bandeau-top-07.jpg",
  "Bella Side-Tie Scrunch Bottom": "/assets/classics/bella-side-tie-scrunch-bottom-07.jpg",
  "Bella Bikini Top": "/assets/classics/bella-bikini-top-09.jpg",
  "Bali Side-Tie Bikini Scrunch Bottom": "/assets/classics/bali-side-tie-bikini-scrunch-bottom-06.jpg",
  "Bali Bikini Top": "/assets/classics/bali-bikini-top-07.jpg",
  "Sara Side-Tie Scrunch Bottom": "/assets/classics/sara-side-tie-scrunch-bottom-08.jpg",
  "Sara Bikini Top": "/assets/classics/sara-bikini-top-07.jpg",
  "Marina Tri Bandeau Bottom": "/assets/classics/marina-tri-bandeau-bottom-07.jpg",
  "Marina Tri Bandeau Top": "/assets/classics/marina-tri-bandeau-top-07.jpg",
};

let text = readFileSync("lib/classics.ts", "utf8");
for (const [name, src] of Object.entries(charts)) {
  const needle = `"name": "${name}",`;
  if (!text.includes(needle)) throw new Error(`missing ${name}`);
  if (text.includes(`"name": "${name}",\n    "sizeChart"`)) continue;
  text = text.replace(needle, `${needle}\n    "sizeChart": "${src}",`);
}
writeFileSync("lib/classics.ts", text);
console.log("patched", Object.keys(charts).length);

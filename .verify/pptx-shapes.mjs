import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const root = "c:/Users/Shahmeer/projects/piura/.verify/pptx/unzipped/ppt";

function relsOf(file) {
  const xml = readFileSync(file, "utf8");
  const map = {};
  const re = /Id="([^"]+)"[^>]*Target="([^"]+)"/g;
  let m;
  while ((m = re.exec(xml))) map[m[1]] = m[2];
  return map;
}

function emu(n) {
  return Math.round(Number(n) / 914400 * 100) / 100;
}

const slides = readdirSync(join(root, "slides"))
  .filter((f) => /^slide\d+\.xml$/.test(f))
  .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));

for (const slide of slides) {
  const xml = readFileSync(join(root, "slides", slide), "utf8");
  const rels = relsOf(join(root, "slides/_rels", slide + ".rels"));
  console.log("\n====", slide, "====");
  const blocks = xml.split(/<p:(?:sp|pic)>/).slice(1);
  const items = [];
  for (const block of blocks) {
    const off = block.match(/<a:off x="(-?\d+)" y="(-?\d+)"/);
    const ext = block.match(/<a:ext cx="(\d+)" cy="(\d+)"/);
    if (!off) continue;
    const texts = [...block.matchAll(/<a:t[^>]*>([^<]*)<\/a:t>/g)].map((m) => m[1]);
    const embed = (block.match(/r:embed="([^"]+)"/) || [])[1];
    items.push({
      y: Number(off[2]),
      x: Number(off[1]),
      w: ext ? emu(ext[1]) : 0,
      h: ext ? emu(ext[2]) : 0,
      text: texts.join(""),
      img: embed ? rels[embed] : null,
    });
  }
  items.sort((a, b) => a.y - b.y || a.x - b.x);
  for (const item of items) {
    if (item.img) console.log(`  IMG ${item.img} ${emu(item.x)},${emu(item.y)} ${item.w}x${item.h}`);
    else if (item.text.trim()) console.log(`  TXT ${emu(item.x)},${emu(item.y)} ${item.w}x${item.h} | ${item.text.replace(/\s+/g, " ").trim()}`);
  }
}

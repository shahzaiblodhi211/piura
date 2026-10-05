import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const root = "c:/Users/Shahmeer/projects/piura/.verify/pptx/unzipped/ppt";

function textOf(xml) {
  const parts = [];
  const re = /<a:t[^>]*>([^<]*)<\/a:t>/g;
  let m;
  while ((m = re.exec(xml))) parts.push(m[1]);
  return parts.join(" | ");
}

function pics(xml, rels) {
  const out = [];
  const re = /<p:pic>[\s\S]*?<\/p:pic>/g;
  let m;
  while ((m = re.exec(xml))) {
    const block = m[0];
    const name = (block.match(/name="([^"]+)"/) || [])[1];
    const embed = (block.match(/r:embed="([^"]+)"/) || [])[1];
    const off = block.match(/<a:off x="(-?\d+)" y="(-?\d+)"/);
    const ext = block.match(/<a:ext cx="(\d+)" cy="(\d+)"/);
    const target = rels[embed];
    out.push({
      name,
      embed,
      target,
      x: off ? Number(off[1]) : 0,
      y: off ? Number(off[2]) : 0,
      cx: ext ? Number(ext[1]) : 0,
      cy: ext ? Number(ext[2]) : 0,
    });
  }
  return out.sort((a, b) => a.y - b.y || a.x - b.x);
}

function relsOf(file) {
  const xml = readFileSync(file, "utf8");
  const map = {};
  const re = /Id="([^"]+)"[^>]*Target="([^"]+)"/g;
  let m;
  while ((m = re.exec(xml))) map[m[1]] = m[2];
  return map;
}

const slides = readdirSync(join(root, "slides"))
  .filter((f) => /^slide\d+\.xml$/.test(f))
  .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));

for (const slide of slides) {
  const xml = readFileSync(join(root, "slides", slide), "utf8");
  const rels = relsOf(join(root, "slides/_rels", slide + ".rels"));
  console.log("\n====", slide, "====");
  console.log(textOf(xml));
  for (const pic of pics(xml, rels)) {
    console.log(
      `  img ${pic.target} @ ${Math.round(pic.x / 914400)},${Math.round(pic.y / 914400)}in ${Math.round(pic.cx / 914400)}x${Math.round(pic.cy / 914400)}`,
    );
  }
}

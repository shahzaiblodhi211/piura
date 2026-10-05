import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const root = "c:/Users/Shahmeer/projects/piura/.verify/pptx/unzipped/ppt";
function relsOf(file) {
  const xml = readFileSync(file, "utf8");
  const map = {};
  for (const m of xml.matchAll(/Id="([^"]+)"[^>]*Target="([^"]+)"/g)) map[m[1]] = m[2];
  return map;
}
const slides = readdirSync(join(root, "slides")).filter((f) => /^slide\d+\.xml$/.test(f)).sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
for (const slide of slides) {
  const xml = readFileSync(join(root, "slides", slide), "utf8");
  const rels = relsOf(join(root, "slides/_rels", slide + ".rels"));
  console.log("\n==", slide);
  const pics = [...xml.matchAll(/<p:pic>[\s\S]*?<\/p:pic>/g)];
  console.log("pics", pics.length);
  for (const pic of pics) {
    const block = pic[0];
    const embed = (block.match(/r:embed="([^"]+)"/) || [])[1];
    const offs = [...block.matchAll(/<a:off x="(-?\d+)" y="(-?\d+)"/g)];
    const exts = [...block.matchAll(/<a:ext cx="(\d+)" cy="(\d+)"/g)];
    const name = (block.match(/name="([^"]*)"/) || [])[1];
    const src = block.match(/<a:srcRect[^/]*\/>/);
    console.log(name, rels[embed]?.replace("../media/", ""), "offs", offs.map((o) => `${Math.round(o[1]/914400)}in,${Math.round(o[2]/914400)}in`).join(" | "), "exts", exts.map((o) => `${Math.round(o[1]/914400)}x${Math.round(o[2]/914400)}`).join(" | "), src ? src[0].slice(0, 80) : "");
  }
}

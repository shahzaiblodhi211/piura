import { readFileSync, writeFileSync } from "fs";
import sharp from "sharp";

const viewBox = "32.4 167.6 1301.7 517.7";

for (const file of ["piura-black.svg", "piura-sf.svg", "piura-white.svg"]) {
  const target = `public/assets/brand/${file}`;
  let svg = readFileSync(target, "utf8");
  svg = svg.replace(/viewBox="[^"]+"/, `viewBox="${viewBox}"`);
  svg = svg.replace(/<rect[^>]*\/>\s*/, "");
  writeFileSync(target, svg);
}

await sharp("public/assets/brand/piura-black.png")
  .extract({ left: 180, top: 931, width: 7231, height: 2876 })
  .resize({ width: 900 })
  .png()
  .toFile("public/assets/brand/preview-crop.png");

console.log("cropped");

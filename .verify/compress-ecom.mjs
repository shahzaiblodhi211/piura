import { readdir, mkdir, writeFile, stat } from "fs/promises";
import path from "path";
import sharp from "sharp";

const srcDir = path.resolve(".verify/ecom-raw");
const destDir = path.resolve("public/assets/coastlines/ecom");
await mkdir(destDir, { recursive: true });

const files = (await readdir(srcDir))
  .filter((name) => !name.endsWith(".part") && !name.endsWith(".jpg"))
  .sort();
let total = 0;

for (const name of files) {
  const input = path.join(srcDir, name);
  const out = path.join(destDir, `${name}.jpg`);
  if (await stat(out).then(() => true).catch(() => false)) {
    console.log(`${name} skip`);
    continue;
  }
  const before = (await stat(input)).size;
  const buffer = await sharp(input, { failOn: "none" })
    .rotate()
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  await writeFile(out, buffer);
  total += buffer.length;
  console.log(`${name} ${(before / 1048576).toFixed(1)}MB -> ${(buffer.length / 1024).toFixed(0)}KB`);
}

console.log(`files ${files.length} total ${(total / 1048576).toFixed(1)}MB`);

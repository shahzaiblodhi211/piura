import { readdir, readFile, rename, stat, writeFile, unlink } from "fs/promises";
import path from "path";
import sharp from "sharp";

const root = path.resolve("public/assets");
const repo = process.cwd();
const minBytes = 200 * 1024;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (/\.(png|jpe?g|webp)$/i.test(entry.name)) files.push(full);
  }
  return files;
}

async function walkText(dir, out = []) {
  const skip = new Set(["node_modules", ".next", ".git", ".verify", "public"]);
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (skip.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walkText(full, out);
    else if (/\.(tsx?|jsx?|mjs|css|json|md)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

async function replaceFile(target, buffer) {
  const temp = `${target}.compressing`;
  await writeFile(temp, buffer);
  try {
    await unlink(target);
  } catch {
    /* a new jpg has no original at this path */
  }
  await rename(temp, target);
}

const files = (await walk(root)).sort((a, b) => b.length - a.length);
let before = 0;
let after = 0;
const converted = [];
const report = [];

for (const file of files) {
  const info = await stat(file);
  before += info.size;
  if (info.size < minBytes) {
    after += info.size;
    continue;
  }

  try {
  const image = sharp(file, { failOn: "none" });
  const meta = await image.metadata();
  const ext = path.extname(file).toLowerCase();
  const base = file.slice(0, -ext.length);

  let nextPath = file;
  let buffer;

  if (ext === ".png" && !meta.hasAlpha) {
    buffer = await sharp(file, { failOn: "none" })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
    nextPath = `${base}.jpg`;
  } else if (ext === ".png") {
    buffer = await sharp(file, { failOn: "none" })
      .png({ compressionLevel: 9, effort: 10 })
      .toBuffer();
  } else if (ext === ".webp") {
    buffer = await sharp(file, { failOn: "none" }).webp({ quality: 80 }).toBuffer();
  } else {
    buffer = await sharp(file, { failOn: "none" })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
  }

  if (buffer.length >= info.size * 0.97) {
    after += info.size;
    report.push({ file: path.relative(repo, file), saved: 0, kept: true });
    continue;
  }

  if (nextPath !== file) {
    await replaceFile(nextPath, buffer);
    await unlink(file);
    converted.push([path.basename(file), path.basename(nextPath)]);
  } else {
    await replaceFile(file, buffer);
  }
  after += buffer.length;
  report.push({
    file: path.relative(repo, nextPath),
    from: (info.size / 1024 / 1024).toFixed(2),
    to: (buffer.length / 1024 / 1024).toFixed(2),
  });
  } catch (error) {
    after += info.size;
    report.push({ file: path.relative(repo, file), error: error.message });
  }
}

if (converted.length) {
  const texts = await walkText(repo);
  for (const textFile of texts) {
    let source = await readFile(textFile, "utf8");
    let changed = false;
    for (const [from, to] of converted) {
      if (source.includes(from)) {
        source = source.split(from).join(to);
        changed = true;
      }
    }
    if (changed) await writeFile(textFile, source);
  }
}

const big = report
  .filter((row) => !row.kept)
  .sort((a, b) => parseFloat(b.from) - parseFloat(a.from));
console.log(JSON.stringify({
  beforeMB: (before / 1024 / 1024).toFixed(1),
  afterMB: (after / 1024 / 1024).toFixed(1),
  converted: converted.length,
  compressed: big.length,
  top: big.slice(0, 12),
}, null, 2));

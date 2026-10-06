import { readdir, readFile, stat, writeFile } from "fs/promises";
import path from "path";

async function walk(dir, out = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, out);
    else if (/\.(png|jpe?g)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

async function texts(dir, out = []) {
  const skip = new Set(["node_modules", ".next", ".git", ".verify", "public"]);
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (skip.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await texts(full, out);
    else if (/\.(tsx?|jsx?|mjs|css|json|md)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

const images = await walk("public/assets");
const byBase = new Map();
for (const file of images) {
  const ext = path.extname(file);
  const base = path.basename(file, ext);
  byBase.set(base, path.basename(file));
}

const files = await texts(process.cwd());
let edits = 0;
for (const file of files) {
  let source = await readFile(file, "utf8");
  const next = source.replace(/([A-Za-z0-9_-]+)\.png/g, (match, base) => {
    const actual = byBase.get(base);
    if (!actual || actual === match) return match;
    return actual;
  });
  if (next !== source) {
    await writeFile(file, next);
    edits += 1;
    console.log("updated", path.relative(process.cwd(), file));
  }
}
console.log("files", edits);

const refs = new Set();
async function collect(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await collect(full);
    else if (/\.(tsx?|css)$/.test(entry.name)) {
      const text = await readFile(full, "utf8");
      for (const match of text.matchAll(/\/assets\/[^"'()\s]+/g)) refs.add(match[0]);
    }
  }
}
for (const root of ["app", "components", "lib"]) await collect(root);
let missing = 0;
for (const ref of refs) {
  if (!/\.(png|jpe?g|webp|svg|gif)$/i.test(ref)) continue;
  try {
    await stat(path.join("public", ref));
  } catch {
    missing += 1;
    console.log("MISSING", ref);
  }
}
console.log("missing", missing);

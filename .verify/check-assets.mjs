import { readdir, readFile, stat } from "fs/promises";
import path from "path";

const refs = new Set();
async function walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (/\.(tsx?|css)$/.test(entry.name)) {
      const text = await readFile(full, "utf8");
      for (const match of text.matchAll(/\/assets\/[^"'()\s]+/g)) refs.add(match[0]);
    }
  }
}
for (const root of ["app", "components", "lib"]) await walk(root);
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
console.log("checked", refs.size, "missing", missing);

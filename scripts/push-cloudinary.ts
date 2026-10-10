import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";

function loadEnv() {
  const text = readFileSync(".env.local", "utf8");
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (!process.env[key]) process.env[key] = value;
  }
}

async function each<T>(items: T[], limit: number, worker: (item: T) => Promise<void>) {
  let index = 0;
  async function run() {
    while (index < items.length) {
      const current = items[index];
      index += 1;
      await worker(current);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => run()));
}

async function main() {
  loadEnv();
  const missing = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"].filter((key) => !process.env[key]);
  if (missing.length) {
    console.error(`Missing ${missing.join(", ")}`);
    process.exitCode = 1;
    return;
  }

  const { uploadNamed } = await import("../lib/cloudinary");
  const { db } = await import("../lib/mongo");
  const { products } = await import("../lib/products");
  const database = await db();
  const collection = database.collection("products");
  const docs = await collection.find({}, { projection: { _id: 0 } }).toArray();
  const paths = new Set<string>();
  const take = (src: unknown) => {
    if (typeof src === "string" && src.startsWith("/")) paths.add(src);
  };
  for (const product of [...products, ...docs]) {
    take(product.src);
    const gallery = Array.isArray(product.gallery) ? product.gallery : [];
    for (const image of gallery) take(image && typeof image === "object" ? (image as { src?: unknown }).src : "");
    take("sizeChart" in product ? product.sizeChart : "");
  }

  const mapPath = path.resolve("lib/cloudinary-map.json");
  const map = JSON.parse(readFileSync(mapPath, "utf8")) as Record<string, string>;
  const todo = [...paths].filter((item) => !map[item]);
  let uploaded = 0;
  let missingFiles = 0;
  await each(todo, 4, async (item) => {
    const file = path.resolve("public", item.replace(/^\/+/, ""));
    if (!existsSync(file)) {
      missingFiles += 1;
      console.log(`missing ${item}`);
      return;
    }
    map[item] = await uploadNamed(readFileSync(file), item);
    uploaded += 1;
    writeFileSync(mapPath, `${JSON.stringify(map, null, 2)}\n`);
    console.log(`${uploaded}/${todo.length} ${item}`);
  });

  const swap = (src: unknown) => (typeof src === "string" && map[src]) || (typeof src === "string" ? src : "");
  let updated = 0;
  for (const doc of docs) {
    const gallery = (Array.isArray(doc.gallery) ? doc.gallery : []).map((image: { src: string; alt?: string }) => ({ ...image, src: swap(image.src) }));
    const nextSrc = swap(doc.src);
    const nextChart = doc.sizeChart ? swap(doc.sizeChart) : "";
    const changed = nextSrc !== doc.src || JSON.stringify(gallery) !== JSON.stringify(doc.gallery) || (doc.sizeChart ? nextChart !== doc.sizeChart : false);
    if (!changed) continue;
    await collection.updateOne({ slug: doc.slug }, { $set: { src: nextSrc, gallery, ...(doc.sizeChart ? { sizeChart: nextChart } : {}) } });
    updated += 1;
  }
  console.log(JSON.stringify({ paths: paths.size, uploaded, missingFiles, updated }));
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Could not push photos.");
  process.exit(1);
});

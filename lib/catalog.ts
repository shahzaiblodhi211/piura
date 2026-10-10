import { MongoServerError } from "mongodb";
import { db } from "@/lib/mongo";
import { hostedSrc } from "@/lib/photos";
import { productSlug, products, type GalleryImage, type Product, type SizeRun } from "@/lib/products";

export type StoredProduct = Product & { slug: string; sort: number };

const kinds = new Set<Product["kind"]>(["bikini", "onepiece", "top", "bottom"]);
const collections = new Set<Product["collection"]>([
  "triangle",
  "contour",
  "onepiece",
  "sunchild",
  "moonchild",
  "bella",
  "bali",
  "sara",
  "marina",
  "classics",
]);
const sizes = ["S", "M", "L", "XL"] as const;

const globalCatalog = globalThis as typeof globalThis & {
  __piuraCatalog?: { at: number; items: Product[] };
  __piuraProductIndex?: Promise<void>;
};

function remember(items: Product[]) {
  globalCatalog.__piuraCatalog = { at: Date.now(), items };
}

export function clearCatalogCache() {
  globalCatalog.__piuraCatalog = undefined;
}

async function collection() {
  const database = await db();
  if (!globalCatalog.__piuraProductIndex) {
    globalCatalog.__piuraProductIndex = database
      .collection("products")
      .createIndex({ slug: 1 }, { unique: true })
      .then(() => undefined)
      .catch((error: unknown) => {
        globalCatalog.__piuraProductIndex = undefined;
        throw error;
      });
  }
  await globalCatalog.__piuraProductIndex;
  return database.collection<StoredProduct>("products");
}

function hostProduct<T extends { src: string; gallery?: GalleryImage[]; sizeChart?: string }>(product: T): T {
  return {
    ...product,
    src: hostedSrc(product.src),
    gallery: (product.gallery ?? []).map((image) => ({ ...image, src: hostedSrc(image.src) })),
    ...(product.sizeChart ? { sizeChart: hostedSrc(product.sizeChart) } : {}),
  };
}

function asProduct(doc: StoredProduct): Product {
  const { sort, ...product } = doc;
  void sort;
  return hostProduct(product);
}

export async function publicProducts() {
  const cached = globalCatalog.__piuraCatalog;
  if (cached && Date.now() - cached.at < 15000) return cached.items;
  try {
    const docs = await (await collection()).find({}, { projection: { _id: 0 } }).sort({ sort: 1, name: 1 }).toArray();
    const saved = new Map(docs.map((product) => [product.slug, product]));
    const seen = new Set<string>();
    const visible: Product[] = [];
    for (const product of products) {
      const slug = productSlug(product.name);
      seen.add(slug);
      const stored = saved.get(slug);
      if (stored?.hidden) continue;
      visible.push(stored ? asProduct(stored) : hostProduct(product));
    }
    for (const product of docs) {
      if (seen.has(product.slug) || product.hidden) continue;
      visible.push(asProduct(product));
    }
    remember(visible);
    return visible;
  } catch {
    return products.map((product) => hostProduct(product));
  }
}

export async function adminProducts() {
  const docs = await (await collection()).find({}, { projection: { _id: 0 } }).sort({ sort: 1, name: 1 }).toArray();
  return docs.map((product) => hostProduct(product));
}

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function imageSrc(value: unknown) {
  const src = text(value, 500);
  if (!src.startsWith("/") && !src.startsWith("https://")) return "";
  return src;
}

export function productFromInput(input: unknown, slug: string, sort: number): StoredProduct {
  if (!input || typeof input !== "object") throw new Error("Check the product details.");
  const body = input as Record<string, unknown>;
  const name = text(body.name, 120);
  const alt = text(body.alt, 200) || name;
  const src = imageSrc(body.src);
  const kind = body.kind as Product["kind"];
  const collectionName = body.collection as Product["collection"];
  if (!name) throw new Error("Add a product name.");
  if (!src) throw new Error("Add a product photo.");
  if (!kinds.has(kind)) throw new Error("Choose a product type.");
  if (!collections.has(collectionName)) throw new Error("Choose a collection.");

  let price: number | undefined;
  if (body.price !== null && body.price !== undefined && body.price !== "") {
    const number = typeof body.price === "number" ? body.price : Number(body.price);
    if (!Number.isFinite(number) || number < 1 || number > 9999) throw new Error("Use a price between 1 and 9999, or leave it blank.");
    price = Math.round(number);
  }

  const galleryInput = Array.isArray(body.gallery) ? body.gallery : [];
  const gallery: GalleryImage[] = [];
  for (const item of galleryInput.slice(0, 24)) {
    if (!item || typeof item !== "object") continue;
    const image = item as { src?: unknown; alt?: unknown };
    const imageSrcValue = imageSrc(image.src);
    if (!imageSrcValue) continue;
    gallery.push({ src: imageSrcValue, alt: text(image.alt, 200) || alt });
  }
  if (!gallery.length) gallery.push({ src, alt });

  const runInput = Array.isArray(body.runs) ? body.runs : [];
  const runs: SizeRun[] = [];
  for (const item of runInput.slice(0, 4)) {
    if (!item || typeof item !== "object") continue;
    const run = item as { piece?: unknown; counts?: unknown };
    const piece = text(run.piece, 80);
    const countRows = Array.isArray(run.counts) ? run.counts : null;
    if (!piece || !countRows) continue;
    const counts = sizes.map((size) => {
      const row = countRows.find((count: unknown) => count && typeof count === "object" && (count as { size?: unknown }).size === size) as { qty?: unknown } | undefined;
      const qty = Number(row?.qty ?? 0);
      return { size, qty: Number.isInteger(qty) && qty >= 0 && qty <= 99999 ? qty : 0 };
    });
    runs.push({ piece, counts });
  }
  if (!runs.length) throw new Error("Add at least one size run.");

  const sizeChart = imageSrc(body.sizeChart);
  return {
    slug,
    sort,
    name,
    src,
    alt,
    kind,
    collection: collectionName,
    ...(price === undefined ? {} : { price }),
    preorder: body.preorder === true,
    hidden: body.hidden === true,
    colorway: text(body.colorway, 500),
    fabric: text(body.fabric, 300),
    details: text(body.details, 2000),
    production: text(body.production, 2000),
    gallery,
    ...(sizeChart ? { sizeChart } : {}),
    runs,
  };
}

export async function saveProduct(input: unknown) {
  const body = input && typeof input === "object" ? (input as { slug?: unknown; name?: unknown }) : {};
  const requested = text(body.slug, 80);
  const productsCollection = await collection();
  const existing = requested ? await productsCollection.findOne({ slug: requested }, { projection: { _id: 0, sort: 1 } }) : null;
  const name = text(body.name, 120);
  const slug = existing ? requested : productSlug(name);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("Use a name with letters or numbers.");
  let sort = existing?.sort;
  if (sort === undefined) {
    const last = await productsCollection.find({}, { projection: { sort: 1 } }).sort({ sort: -1 }).limit(1).toArray();
    sort = (last[0]?.sort ?? -1) + 1;
  }
  const product = productFromInput(input, slug, sort);
  const unset: Record<string, ""> = {};
  if (product.price === undefined) unset.price = "";
  if (!product.sizeChart) unset.sizeChart = "";
  try {
    await productsCollection.updateOne({ slug }, { $set: product, ...(Object.keys(unset).length ? { $unset: unset } : {}) }, { upsert: true });
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) throw new Error("A product with that name already exists.");
    throw error;
  }
  clearCatalogCache();
  return product;
}

export async function seedCatalog() {
  const productsCollection = await collection();
  let added = 0;
  let kept = 0;
  for (const [index, product] of products.entries()) {
    const slug = productSlug(product.name);
    const existing = await productsCollection.findOne({ slug }, { projection: { _id: 1 } });
    if (existing) {
      kept += 1;
      continue;
    }
    try {
      await productsCollection.insertOne({ ...product, slug, sort: index, hidden: false });
      added += 1;
    } catch (error) {
      if (!(error instanceof MongoServerError) || error.code !== 11000) throw error;
      kept += 1;
    }
  }
  clearCatalogCache();
  return { added, kept };
}

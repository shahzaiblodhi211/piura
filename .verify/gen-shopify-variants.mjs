import { readFileSync, writeFileSync } from "fs";

const products = JSON.parse(readFileSync(".verify/live-products.json", "utf8"));

function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function sizeKey(title) {
  const value = title.toLowerCase().replace(/[^a-z]/g, "");
  if (value === "small") return "SMALL";
  if (value === "medium") return "MEDIUM";
  if (value === "large") return "LARGE";
  if (value === "xl" || value === "xlarge") return "EXTRA LARGE";
  throw new Error(`unknown size ${title}`);
}

const map = {};
for (const product of products) {
  const key = slug(product.title);
  map[key] = {};
  for (const variant of product.variants) {
    map[key][sizeKey(variant.title)] = variant.id.split("/").pop();
  }
}

const body = `import type { CartLine } from "@/lib/cart";

/** Shopify variant ids for the in-stock line on piuraswim.com. */
export const shopifyVariants: Record<string, Partial<Record<CartLine["size"], string>>> = ${JSON.stringify(map, null, 2)};

export function shopifyCartUrl(lines: Pick<CartLine, "slug" | "size" | "qty" | "preorder">[]) {
  if (!lines.length) return null;
  const parts: string[] = [];
  for (const line of lines) {
    if (line.preorder) return null;
    const id = shopifyVariants[line.slug]?.[line.size];
    if (!id) return null;
    parts.push(\`\${id}:\${line.qty}\`);
  }
  return \`https://piuraswim.com/cart/\${parts.join(",")}\`;
}

export function shopPayUrl(lines: Pick<CartLine, "slug" | "size" | "qty" | "preorder">[]) {
  const cart = shopifyCartUrl(lines);
  return cart ? \`\${cart}?payment=shop_pay\` : null;
}
`;

writeFileSync("lib/shopify-checkout.ts", body);
console.log("products", Object.keys(map).length);
console.log(Object.entries(map).map(([key, sizes]) => `${key} ${Object.keys(sizes).join(",")}`).join("\n"));

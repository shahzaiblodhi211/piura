export type ShopFilter =
  | "all"
  | "tops"
  | "bottoms"
  | "sunchild"
  | "moonchild"
  | "classics";

export type Product = {
  name: string;
  price: string;
  src: string;
  alt: string;
  kind: "top" | "bottom" | "tote";
  collection: "sunchild" | "moonchild" | "classics" | "tote";
  cover?: boolean;
  box: { width: string; height: string; left: string; top: string };
  crop?: { width: string; height: string; left: string; top: string };
};

export const shopFilters: { id: ShopFilter; label: string; count: number }[] = [
  { id: "all", label: "All Swim", count: 16 },
  { id: "tops", label: "tops", count: 8 },
  { id: "bottoms", label: "Bottoms", count: 8 },
  { id: "sunchild", label: "sunchild", count: 4 },
  { id: "moonchild", label: "MOONCHILD", count: 4 },
  { id: "classics", label: "THE CLASSICS", count: 8 },
];

export const products: Product[] = [
  {
    name: "Sunchild Triangle Top",
    price: "$49",
    src: "/assets/shop-sunchild-tri-top.png",
    alt: "Sunchild triangle bikini top",
    kind: "top",
    collection: "sunchild",
    box: { width: "66.07%", height: "72.05%", left: "17.12%", top: "13.86%" },
    crop: { width: "125.96%", height: "131.45%", left: "-13.67%", top: "-11.64%" },
  },
  {
    name: "Sunchild Triangle Bottom",
    price: "$49",
    src: "/assets/shop-sunchild-tri-bottom.png",
    alt: "Sunchild triangle bikini bottom",
    kind: "bottom",
    collection: "sunchild",
    box: { width: "89.43%", height: "49.77%", left: "5.44%", top: "25.45%" },
    crop: { width: "118.6%", height: "240.36%", left: "-10.34%", top: "-70.18%" },
  },
  {
    name: "Moonchild Triangle Top",
    price: "$49",
    src: "/assets/shop-moonchild-tri-top.png",
    alt: "Moonchild triangle bikini top",
    kind: "top",
    collection: "moonchild",
    box: { width: "75.83%", height: "87.27%", left: "12.08%", top: "6.82%" },
    crop: { width: "153.84%", height: "151.24%", left: "-29.02%", top: "-23.97%" },
  },
  {
    name: "Moonchild Triangle Bottom",
    price: "$49",
    src: "/assets/shop-moonchild-tri-bottom.png",
    alt: "Moonchild triangle bikini bottom",
    kind: "bottom",
    collection: "moonchild",
    box: { width: "91.89%", height: "47.05%", left: "4.20%", top: "26.36%" },
    crop: { width: "102.12%", height: "226.57%", left: "-2.1%", top: "-74.97%" },
  },
  {
    name: "Moonchild Mesh Bottom",
    price: "$49",
    src: "/assets/shop-moonchild-mesh-bottom.png",
    alt: "Moonchild mesh bikini bottom",
    kind: "bottom",
    collection: "moonchild",
    box: { width: "70.27%", height: "44.32%", left: "15.02%", top: "27.73%" },
    crop: { width: "124.47%", height: "223.45%", left: "-12.12%", top: "-75.86%" },
  },
  {
    name: "Moonchild Bandeau Top",
    price: "$49",
    src: "/assets/shop-moonchild-bandeau.png",
    alt: "Moonchild bandeau bikini top",
    kind: "top",
    collection: "moonchild",
    box: { width: "84.59%", height: "33.41%", left: "6.34%", top: "33.18%" },
    crop: { width: "125.05%", height: "356.83%", left: "-12.64%", top: "-117.18%" },
  },
  {
    name: "Sunchild Mesh Bottom",
    price: "$49",
    src: "/assets/shop-sunchild-mesh-bottom.png",
    alt: "Sunchild mesh bikini bottom",
    kind: "bottom",
    collection: "sunchild",
    box: { width: "77.64%", height: "40.68%", left: "11.18%", top: "35.23%" },
    crop: { width: "112.28%", height: "201.22%", left: "-6.37%", top: "-51.83%" },
  },
  {
    name: "Sunchild Bandeau Top",
    price: "$49",
    src: "/assets/shop-sunchild-bandeau.png",
    alt: "Sunchild bandeau bikini top",
    kind: "top",
    collection: "sunchild",
    box: { width: "75.38%", height: "23.86%", left: "12.31%", top: "37.95%" },
    crop: { width: "152.6%", height: "547.3%", left: "-27.01%", top: "-248.99%" },
  },
  {
    name: "Bella Side-Tie Scrunch Bottom",
    price: "$42",
    src: "/assets/shop-bella-bottom.png",
    alt: "Bella side-tie scrunch bikini bottom",
    kind: "bottom",
    collection: "classics",
    box: { width: "84.98%", height: "39.09%", left: "7.51%", top: "32.95%" },
    crop: { width: "111.69%", height: "229.65%", left: "-6.2%", top: "-71.12%" },
  },
  {
    name: "Bella Bikini Top",
    price: "$42",
    src: "/assets/shop-bella-top.png",
    alt: "Bella bikini top",
    kind: "top",
    collection: "classics",
    box: { width: "68.25%", height: "69.55%", left: "16.01%", top: "15.23%" },
    crop: { width: "148.97%", height: "137.51%", left: "-22.21%", top: "-18.24%" },
  },
  {
    name: "Bali Side-Tie Scrunch Bottom",
    price: "$42",
    src: "/assets/shop-bali-bottom.png",
    alt: "Bali side-tie scrunch bikini bottom",
    kind: "bottom",
    collection: "classics",
    box: { width: "67.98%", height: "73.86%", left: "16.01%", top: "16.82%" },
    crop: { width: "149.79%", height: "129.47%", left: "-25.66%", top: "-14.59%" },
  },
  {
    name: "Bali Bikini Top",
    price: "$42",
    src: "/assets/shop-bali-top.png",
    alt: "Bali bikini top",
    kind: "top",
    collection: "classics",
    box: { width: "91.29%", height: "44.09%", left: "4.50%", top: "27.95%" },
    crop: { width: "116.76%", height: "228.48%", left: "-9.19%", top: "-61.11%" },
  },
  {
    name: "Sara Side-Tie Scrunch Bottom",
    price: "$42",
    src: "/assets/shop-sara-bottom.png",
    alt: "Sara side-tie scrunch bikini bottom",
    kind: "bottom",
    collection: "classics",
    box: { width: "96.10%", height: "35.23%", left: "2.10%", top: "34.77%" },
    crop: { width: "100%", height: "257.69%", left: "0", top: "-84.95%" },
  },
  {
    name: "Sara Bikini Top",
    price: "$42",
    src: "/assets/shop-sara-top.png",
    alt: "Sara bikini top",
    kind: "top",
    collection: "classics",
    box: { width: "97.28%", height: "62.27%", left: "1.81%", top: "20.23%" },
    crop: { width: "116.46%", height: "170.75%", left: "-9.01%", top: "-32.89%" },
  },
  {
    name: "Marina Tri Bandeau Bottom",
    price: "$49",
    src: "/assets/shop-marina-bottom.png",
    alt: "Marina tri bandeau bikini bottom",
    kind: "bottom",
    collection: "classics",
    box: { width: "90.33%", height: "27.95%", left: "4.83%", top: "35.91%" },
    crop: { width: "110.22%", height: "335.67%", left: "-6.39%", top: "-114.41%" },
  },
  {
    name: "Marina Tri Bandeau Top",
    price: "$49",
    src: "/assets/shop-marina-top.png",
    alt: "Marina tri bandeau bikini top",
    kind: "top",
    collection: "classics",
    box: { width: "77.18%", height: "45.91%", left: "11.41%", top: "28.41%" },
    crop: { width: "112.38%", height: "178.85%", left: "-7.08%", top: "-39.62%" },
  },
  {
    name: "PIURA TOTE",
    price: "$22",
    src: "/assets/shop-tote.png",
    alt: "Piura canvas tote bag",
    kind: "tote",
    collection: "tote",
    cover: true,
    box: { width: "51.05%", height: "59.55%", left: "24.62%", top: "20.23%" },
  },
];

export function filterProducts(filter: ShopFilter) {
  return products.filter((product) => {
    if (filter === "all") return true;
    if (filter === "tops") return product.kind === "top";
    if (filter === "bottoms") return product.kind === "bottom";
    return product.collection === filter;
  });
}

export function productSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getProduct(slug: string) {
  return products.find((product) => productSlug(product.name) === slug);
}

export function pairProduct(product: Product) {
  if (product.kind === "tote") return undefined;
  const opposite = product.kind === "top" ? "bottom" : "top";
  return products.find(
    (item) => item.collection === product.collection && item.kind === opposite,
  );
}

export function productDescription(product: Product) {
  if (product.name === "Sunchild Triangle Bottom") {
    return "The Sunchild print in a flattering triangle cut. Seamless and fully lined, with minimal, cheeky coverage for effortless tan lines.";
  }
  if (product.kind === "tote") {
    return "The Piura tote — room for two bikini sets and a coastal day. Pick any two sets and the tote is on us.";
  }
  if (product.kind === "top") {
    return `${product.name} — seamless and fully lined, cut for effortless tan lines.`;
  }
  return `${product.name} — seamless and fully lined, with minimal, cheeky coverage for effortless tan lines.`;
}

export const sizeChart = [
  { size: "S", length: "7.5''", width: "11'' | 2\"" },
  { size: "M", length: "7.7''", width: "11.3'' | 2.3\"" },
  { size: "L", length: "8''", width: "11.5'' | 2.4\"" },
  { size: "XL", length: "7.7''", width: "12'' | 2.5\"" },
];

export const productSizes = ["SMALL", "MEDIUM", "LARGE", "EXTRA LARGE"] as const;

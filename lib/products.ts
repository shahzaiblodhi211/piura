export type ShopFilter = "all" | "triangle" | "contour" | "onepiece";

export type SizeQty = { size: string; qty: number };

export type SizeRun = { piece: string; counts: SizeQty[] };

export type GalleryImage = { src: string; alt: string };

export const piecePrices = {
  top: 52,
  bottom: 52,
  tote: 30,
} as const;

export type Product = {
  name: string;
  src: string;
  alt: string;
  kind: "bikini" | "onepiece";
  collection: "triangle" | "contour" | "onepiece";
  colorway: string;
  fabric: string;
  details: string;
  gallery: GalleryImage[];
  runs: SizeRun[];
};

export function productPriceLine(product: Product) {
  if (product.kind !== "bikini") return null;
  return `Top $${piecePrices.top} · Bottom $${piecePrices.bottom}`;
}

const bikiniTops: SizeQty[] = [
  { size: "S", qty: 30 },
  { size: "M", qty: 30 },
  { size: "L", qty: 15 },
  { size: "XL", qty: 5 },
];

const bikiniBottoms: SizeQty[] = [
  { size: "S", qty: 35 },
  { size: "M", qty: 35 },
  { size: "L", qty: 10 },
  { size: "XL", qty: 0 },
];

const onePieceRun: SizeQty[] = [
  { size: "S", qty: 30 },
  { size: "M", qty: 30 },
  { size: "L", qty: 15 },
  { size: "XL", qty: 5 },
];

const triangleDetails =
  "Triangle halter top with adjustable ties. High-cut, cheeky bottom with adjustable side straps. Contrast binding throughout.";

const contourDetails =
  "Sculpted contour top with thin adjustable shoulder straps and curved under-bust shaping. High-cut, cheeky bottom with adjustable side straps. Contrast binding throughout.";

const onePieceDetails =
  "Cutout one-piece with adjustable shoulder straps and side cutout detailing. Contrast binding throughout.";

function bikiniRuns(): SizeRun[] {
  return [
    { piece: "Tops — 80 units", counts: bikiniTops },
    { piece: "Bottoms — 80 units", counts: bikiniBottoms },
  ];
}

export const shopFilters: { id: ShopFilter; label: string; count: number }[] = [
  { id: "all", label: "All Swim", count: 8 },
  { id: "triangle", label: "Triangle", count: 3 },
  { id: "contour", label: "Contour", count: 3 },
  { id: "onepiece", label: "One-Piece", count: 2 },
];

export const products: Product[] = [
  {
    name: "Triangle Bikini — Ipanema",
    src: "/assets/coastlines/ipanema-1.jpeg",
    alt: "Emerald green triangle bikini with yellow trim, front view",
    kind: "bikini",
    collection: "triangle",
    colorway: "Emerald green body with vibrant yellow contrast trim.",
    fabric: "Main 2404 / Band 3209",
    details: triangleDetails,
    gallery: [
      { src: "/assets/coastlines/ipanema-1.jpeg", alt: "Ipanema triangle bikini, front" },
      { src: "/assets/coastlines/ipanema-2.jpeg", alt: "Ipanema triangle bikini, back" },
      { src: "/assets/coastlines/ecom/ipanema-01.jpg", alt: "Ipanema triangle bikini, back pose" },
      { src: "/assets/coastlines/ecom/ipanema-02.jpg", alt: "Ipanema triangle bikini, pose" },
    ],
    runs: bikiniRuns(),
  },
  {
    name: "Triangle Bikini — Positano",
    src: "/assets/coastlines/positano-1.jpg",
    alt: "Red triangle bikini with white trim, front view",
    kind: "bikini",
    collection: "triangle",
    colorway: "Vibrant red body with crisp white contrast trim.",
    fabric: "Main 1610 / Band 0101",
    details: triangleDetails,
    gallery: [
      { src: "/assets/coastlines/positano-1.jpg", alt: "Positano triangle bikini, front" },
      { src: "/assets/coastlines/positano-2.jpg", alt: "Positano triangle bikini, back and front detail" },
      { src: "/assets/coastlines/ecom/positano-01.jpg", alt: "Positano triangle bikini, pose 1" },
      { src: "/assets/coastlines/ecom/positano-02.jpg", alt: "Positano triangle bikini, pose 2" },
      { src: "/assets/coastlines/ecom/positano-03.jpg", alt: "Positano triangle bikini, pose 3" },
      { src: "/assets/coastlines/ecom/positano-04.jpg", alt: "Positano triangle bikini, pose 4" },
      { src: "/assets/coastlines/ecom/positano-05.jpg", alt: "Positano triangle bikini, pose 5" },
      { src: "/assets/coastlines/ecom/positano-06.jpg", alt: "Positano triangle bikini, pose 6" },
      { src: "/assets/coastlines/ecom/positano-08.jpg", alt: "Positano triangle bikini, pose 7" },
      { src: "/assets/coastlines/ecom/positano-09.jpg", alt: "Positano triangle bikini, pose 8" },
      { src: "/assets/coastlines/ecom/positano-10.jpg", alt: "Positano triangle bikini, pose 9" },
      { src: "/assets/coastlines/ecom/positano-11.jpg", alt: "Positano triangle bikini, pose 10" },
    ],
    runs: bikiniRuns(),
  },
  {
    name: "Triangle Bikini — Mykonos",
    src: "/assets/coastlines/mykonos-tri-1.jpeg",
    alt: "Black triangle bikini with white trim, worn on a boat",
    kind: "bikini",
    collection: "triangle",
    colorway: "Classic black body with crisp white contrast trim.",
    fabric: "Main 0707 / Band 0101",
    details: triangleDetails,
    gallery: [
      { src: "/assets/coastlines/mykonos-tri-1.jpeg", alt: "Mykonos triangle bikini, front on the boat" },
      { src: "/assets/coastlines/mykonos-tri-2.jpeg", alt: "Mykonos triangle bikini, kneeling on the deck" },
      { src: "/assets/coastlines/mykonos-tri-3.jpeg", alt: "Mykonos triangle bikini, back view on the water" },
      { src: "/assets/coastlines/mykonos-tri-4.jpeg", alt: "Mykonos triangle bikini laid flat" },
    ],
    runs: bikiniRuns(),
  },
  {
    name: "Contour Bikini — Malibu",
    src: "/assets/coastlines/malibu-1.jpg",
    alt: "Powder-blue contour bikini with gray trim, front view",
    kind: "bikini",
    collection: "contour",
    colorway: "Soft powder-blue body with cool gray contrast trim.",
    fabric: "Main 2101 / Band 0610",
    details: contourDetails,
    gallery: [
      { src: "/assets/coastlines/malibu-1.jpg", alt: "Malibu contour bikini, front" },
      { src: "/assets/coastlines/malibu-2.jpg", alt: "Malibu contour bikini, three-quarter view" },
      { src: "/assets/coastlines/malibu-3.jpg", alt: "Malibu contour bikini, back" },
      { src: "/assets/coastlines/ecom/malibu-01.jpg", alt: "Malibu contour bikini, pose 1" },
      { src: "/assets/coastlines/ecom/malibu-02.jpg", alt: "Malibu contour bikini, pose 2" },
      { src: "/assets/coastlines/ecom/malibu-03.jpg", alt: "Malibu contour bikini, pose 3" },
      { src: "/assets/coastlines/ecom/malibu-04.jpg", alt: "Malibu contour bikini, pose 4" },
      { src: "/assets/coastlines/ecom/malibu-05.jpg", alt: "Malibu contour bikini, pose 5" },
      { src: "/assets/coastlines/ecom/malibu-06.jpg", alt: "Malibu contour bikini, pose 6" },
    ],
    runs: bikiniRuns(),
  },
  {
    name: "Contour Bikini — Ibiza",
    src: "/assets/coastlines/ibiza-1.jpg",
    alt: "Black contour bikini with red trim",
    kind: "bikini",
    collection: "contour",
    colorway: "Classic black body with bold red contrast trim.",
    fabric: "Main 0707 / Band 1610",
    details: contourDetails,
    gallery: [
      { src: "/assets/coastlines/ibiza-1.jpg", alt: "Ibiza contour bikini" },
      { src: "/assets/coastlines/ecom/ibiza-01.jpg", alt: "Ibiza contour bikini, pose 1" },
      { src: "/assets/coastlines/ecom/ibiza-02.jpg", alt: "Ibiza contour bikini, pose 2" },
      { src: "/assets/coastlines/ecom/ibiza-03.jpg", alt: "Ibiza contour bikini, pose 3" },
      { src: "/assets/coastlines/ecom/ibiza-04.jpg", alt: "Ibiza contour bikini, pose 4" },
      { src: "/assets/coastlines/ecom/ibiza-05.jpg", alt: "Ibiza contour bikini, pose 5" },
      { src: "/assets/coastlines/ecom/ibiza-06.jpg", alt: "Ibiza contour bikini, pose 6" },
      { src: "/assets/coastlines/ecom/ibiza-07.jpg", alt: "Ibiza contour bikini, pose 7" },
      { src: "/assets/coastlines/ecom/ibiza-08.jpg", alt: "Ibiza contour bikini, pose 8" },
    ],
    runs: bikiniRuns(),
  },
  {
    name: "Contour Bikini — Capri",
    src: "/assets/coastlines/capri-contour-1.jpeg",
    alt: "Navy contour bikini with yellow trim",
    kind: "bikini",
    collection: "contour",
    colorway: "Deep navy body with vibrant yellow contrast trim.",
    fabric: "Main 2620 / Band 3209",
    details: contourDetails,
    gallery: [
      { src: "/assets/coastlines/capri-contour-1.jpeg", alt: "Capri contour bikini" },
      { src: "/assets/coastlines/ecom/capri-contour-01.jpg", alt: "Capri contour bikini, pose" },
    ],
    runs: bikiniRuns(),
  },
  {
    name: "Cutout One-Piece — Mykonos",
    src: "/assets/coastlines/mykonos-one-1.jpg",
    alt: "Black cutout one-piece with white trim, front view",
    kind: "onepiece",
    collection: "onepiece",
    colorway: "Classic black body with crisp white contrast trim.",
    fabric: "Main 0707 / Band 0101",
    details: onePieceDetails,
    gallery: [
      { src: "/assets/coastlines/mykonos-one-1.jpg", alt: "Mykonos cutout one-piece, front" },
      { src: "/assets/coastlines/mykonos-one-2.jpg", alt: "Mykonos cutout one-piece, side" },
      { src: "/assets/coastlines/mykonos-one-3.jpg", alt: "Mykonos cutout one-piece, back" },
      { src: "/assets/coastlines/mykonos-one-4.jpg", alt: "Mykonos cutout one-piece, back detail" },
      { src: "/assets/coastlines/ecom/mykonos-one-01.jpg", alt: "Mykonos cutout one-piece, pose 1" },
      { src: "/assets/coastlines/ecom/mykonos-one-02.jpg", alt: "Mykonos cutout one-piece, pose 2" },
      { src: "/assets/coastlines/ecom/mykonos-one-03.jpg", alt: "Mykonos cutout one-piece, pose 3" },
      { src: "/assets/coastlines/ecom/mykonos-one-04.jpg", alt: "Mykonos cutout one-piece, pose 4" },
      { src: "/assets/coastlines/ecom/mykonos-one-05.jpg", alt: "Mykonos cutout one-piece, pose 5" },
      { src: "/assets/coastlines/ecom/mykonos-one-06.jpg", alt: "Mykonos cutout one-piece, pose 6" },
    ],
    runs: [{ piece: "80 units", counts: onePieceRun }],
  },
  {
    name: "Cutout One-Piece — Capri",
    src: "/assets/coastlines/capri-one-1.jpg",
    alt: "Navy cutout one-piece with yellow trim, front view",
    kind: "onepiece",
    collection: "onepiece",
    colorway: "Deep navy body with vibrant yellow contrast trim.",
    fabric: "Main 2620 / Band 3209",
    details: onePieceDetails,
    gallery: [
      { src: "/assets/coastlines/capri-one-1.jpg", alt: "Capri cutout one-piece, front" },
      { src: "/assets/coastlines/capri-one-2.jpg", alt: "Capri cutout one-piece, three-quarter view" },
      { src: "/assets/coastlines/capri-one-3.jpg", alt: "Capri cutout one-piece, back" },
      { src: "/assets/coastlines/capri-one-4.jpg", alt: "Capri cutout one-piece, side back" },
      { src: "/assets/coastlines/ecom/capri-one-01.jpg", alt: "Capri cutout one-piece, pose 1" },
      { src: "/assets/coastlines/ecom/capri-one-02.jpg", alt: "Capri cutout one-piece, pose 2" },
      { src: "/assets/coastlines/ecom/capri-one-03.jpg", alt: "Capri cutout one-piece, pose 3" },
      { src: "/assets/coastlines/ecom/capri-one-04.jpg", alt: "Capri cutout one-piece, pose 4" },
      { src: "/assets/coastlines/ecom/capri-one-05.jpg", alt: "Capri cutout one-piece, pose 5" },
      { src: "/assets/coastlines/ecom/capri-one-06.jpg", alt: "Capri cutout one-piece, pose 6" },
      { src: "/assets/coastlines/ecom/capri-one-07.jpg", alt: "Capri cutout one-piece, pose 7" },
      { src: "/assets/coastlines/ecom/capri-one-08.jpg", alt: "Capri cutout one-piece, pose 8" },
      { src: "/assets/coastlines/ecom/capri-one-09.jpg", alt: "Capri cutout one-piece, pose 9" },
      { src: "/assets/coastlines/ecom/capri-one-10.jpg", alt: "Capri cutout one-piece, pose 10" },
    ],
    runs: [{ piece: "80 units", counts: onePieceRun }],
  },
];

export function filterProducts(filter: ShopFilter) {
  if (filter === "all") return products;
  return products.filter((product) => product.collection === filter);
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

export function pairProduct(_product: Product) {
  return undefined;
}

export function productDescription(product: Product) {
  return `${product.colorway} ${product.details}`;
}

export const productSizes = ["SMALL", "MEDIUM", "LARGE", "EXTRA LARGE"] as const;

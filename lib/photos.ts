import map from "@/lib/cloudinary-map.json";

const hosted = map as Record<string, string>;

export function hostedSrc(src: string) {
  if (!src.startsWith("/")) return src;
  return hosted[src] || src;
}

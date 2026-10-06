import { readFileSync } from "fs";
const raw = readFileSync(".verify/canva-imagesets.json", "utf8");
const data = JSON.parse(raw);
console.log(Object.keys(data));
const text = JSON.stringify(data);
const names = [...text.matchAll(/Ipanema|Positano|Mykonos|Malibu|Ibiza|Capri|Tote|TOTE|Triangle|Contour|One-Piece|One Piece|Bikini|\$\d+/gi)].map((m) => m[0]);
console.log("hits", [...new Set(names)]);
function walk(node, path, out, depth) {
  if (depth > 8 || out.length > 80) return;
  if (typeof node === "string" && node.trim().length > 1 && node.length < 80) {
    if (/[A-Za-z]/.test(node) && !node.startsWith("http") && !node.includes("AAAA")) out.push(node);
  } else if (Array.isArray(node)) {
    node.forEach((child, i) => walk(child, path + "[" + i + "]", out, depth + 1));
  } else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) walk(v, path + "." + k, out, depth + 1);
  }
}
const out = [];
walk(data, "", out, 0);
console.log(out.slice(0, 60).join(" | "));

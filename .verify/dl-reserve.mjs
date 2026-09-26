import { writeFileSync } from "fs";

const url =
  "https://www.figma.com/api/mcp/asset/4eebe095-ff82-4ec0-98b5-200a81a9c5fe.png";
const res = await fetch(url);
if (!res.ok) throw new Error(String(res.status));
writeFileSync(
  "public/assets/reserve-modal.png",
  Buffer.from(await res.arrayBuffer()),
);
console.log("ok", res.headers.get("content-type"));

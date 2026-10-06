import { spawn } from "child_process";
import { writeFileSync } from "fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9402;
const child = spawn(
  chrome,
  ["--headless=new", "--disable-gpu", `--remote-debugging-port=${port}`, "--hide-scrollbars", "about:blank"],
  { stdio: "ignore" },
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function getWs() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json`);
      const tabs = await res.json();
      const page = tabs.find((t) => t.type === "page") || tabs[0];
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error("no cdp");
}
const ws = new WebSocket(await getWs());
let id = 0;
const pending = new Map();
ws.addEventListener("message", (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
});
await new Promise((resolve, reject) => {
  ws.addEventListener("open", resolve);
  ws.addEventListener("error", reject);
});
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const next = ++id;
    pending.set(next, resolve);
    ws.send(JSON.stringify({ id: next, method, params }));
  });
await send("Page.enable");
await send("Runtime.enable");

const measure = `(() => {
  const header = document.querySelector("header");
  const mark = header.querySelector('a[aria-label="Piura Swim"]');
  const img = mark.querySelector("img");
  const hr = header.getBoundingClientRect();
  const mr = mark.getBoundingClientRect();
  const canvas = document.createElement("canvas");
  const w = Math.round(mr.width);
  const h = Math.round(mr.height);
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  let minX = w, maxX = 0, minY = h, maxY = 0, count = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = data[(y * w + x) * 4 + 3];
      if (a > 40) {
        count++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const inkMid = mr.left + (minX + maxX) / 2;
  const nav = header.querySelector("nav");
  const navR = nav ? nav.getBoundingClientRect().right : null;
  const search = header.querySelector('[aria-label="Search"]').getBoundingClientRect().left;
  return {
    width: innerWidth,
    headerMid: Math.round((hr.left + hr.right) / 2),
    inkMid: Math.round(inkMid),
    delta: Math.round(inkMid - (hr.left + hr.right) / 2),
    ink: count ? [minX, minY, maxX, maxY] : null,
    navRight: navR == null ? null : Math.round(navR),
    markLeft: Math.round(mr.left),
    searchLeft: Math.round(search),
    markRight: Math.round(mr.right),
  };
})()`;

for (const [name, width] of [["desk", 1440], ["lg", 1100], ["m", 390]]) {
  await send("Emulation.setDeviceMetricsOverride", { width, height: 700, deviceScaleFactor: 1, mobile: width < 800 });
  await send("Page.navigate", { url: "http://localhost:3000/story" });
  await sleep(1400);
  const info = await send("Runtime.evaluate", { expression: measure, returnByValue: true });
  console.log(name, JSON.stringify(info.result?.result?.value ?? info.result));
  const cap = await send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width, height: 150, scale: 1 } });
  writeFileSync(`c:/Users/Shahmeer/projects/piura/.verify/logo-${name}.png`, Buffer.from(cap.result.data, "base64"));
}
ws.close();
child.kill();

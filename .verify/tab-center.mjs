import { spawn } from "child_process";
import { writeFileSync } from "fs";
import sharp from "sharp";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9453;
const child = spawn(
  chrome,
  ["--headless=new", "--disable-gpu", `--remote-debugging-port=${port}`, "--hide-scrollbars", "about:blank"],
  { stdio: "ignore" },
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getWs() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json`);
      const tabs = await res.json();
      const page = tabs.find((t) => t.type === "page") || tabs[0];
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(200);
  }
  throw new Error("no cdp");
}

const ws = new WebSocket(await getWs());
let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) pending.get(msg.id)(msg);
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
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await send("Page.navigate", { url: "http://localhost:3001/shop" });
await sleep(3500);
await send("Runtime.evaluate", {
  expression: `document.fonts.ready.then(() => document.querySelector("[data-tab]")?.scrollIntoView({block:"center"}))`,
  awaitPromise: true,
});
await sleep(400);
const info = await send("Runtime.evaluate", {
  expression: `(() => {
    const tabs = [...document.querySelectorAll("[data-tab]")].map((el) => {
      const r = el.getBoundingClientRect();
      const span = el.querySelector("span");
      const s = span.getBoundingClientRect();
      return {
        text: el.innerText.replace(/\\s+/g, " ").trim(),
        x: r.x, y: r.y, w: r.width, h: r.height,
        spanTop: s.top - r.top, spanH: s.height,
        transform: getComputedStyle(span).transform,
      };
    });
    const sample = document.querySelector("[data-tab] span");
    const cs = getComputedStyle(sample);
    const canvas = document.createElement("canvas");
    canvas.width = 240;
    canvas.height = 80;
    const ctx = canvas.getContext("2d");
    ctx.font = cs.fontStyle + " " + cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
    ctx.fillStyle = "#000";
    ctx.textBaseline = "top";
    ctx.fillText("ALL SWIM", 4, 20);
    const pixels = ctx.getImageData(0, 0, 240, 80).data;
    let top = 80;
    let bottom = 0;
    for (let y = 0; y < 80; y++) {
      for (let x = 0; x < 240; x++) {
        if (pixels[(y * 240 + x) * 4 + 3] > 20) {
          if (y < top) top = y;
          if (y > bottom) bottom = y;
        }
      }
    }
    const fontSize = parseFloat(cs.fontSize);
    const emCenter = 20 + (fontSize - 1) / 2;
    const inkCenter = (top + bottom) / 2;
    return { tabs, scroll: scrollY, fontSize, inkTop: top - 20, inkBottom: bottom - 20, optical: Number((inkCenter - emCenter).toFixed(2)) };
  })()`,
  returnByValue: true,
});
console.log(JSON.stringify(info.result?.result?.value, null, 2));
const shot = await send("Page.captureScreenshot", { format: "png" });
const png = Buffer.from(shot.result.data, "base64");
writeFileSync(".verify/tab-center-390.png", png);

const tabs = info.result?.result?.value?.tabs ?? [];
const meta = await sharp(png).metadata();
console.log("shot", meta.width, meta.height);
const results = [];
for (const tab of tabs) {
  const left = Math.max(0, Math.round(tab.x) + 3);
  const top = Math.max(0, Math.round(tab.y) + 3);
  const width = Math.max(1, Math.round(tab.w) - 6);
  const height = Math.max(1, Math.round(tab.h) - 6);
  const { data, info: raw } = await sharp(png)
    .extract({ left, top, width, height })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let inkTop = raw.height;
  let inkBottom = 0;
  let count = 0;
  for (let y = 0; y < raw.height; y++) {
    for (let x = 0; x < raw.width; x++) {
      const i = (y * raw.width + x) * 4;
      const sum = data[i] + data[i + 1] + data[i + 2];
      const ink = sum < 560 || sum > 680;
      if (ink) {
        count++;
        if (y < inkTop) inkTop = y;
        if (y > inkBottom) inkBottom = y;
      }
    }
  }
  const boxCenter = (raw.height - 1) / 2;
  const inkCenter = count ? (inkTop + inkBottom) / 2 : null;
  results.push({
    text: tab.text,
    insetH: raw.height,
    inkTop,
    inkBottom,
    count,
    delta: inkCenter == null ? null : Number((inkCenter - boxCenter).toFixed(2)),
  });
}
console.log(JSON.stringify(results, null, 2));
child.kill();
ws.close();

import { spawn } from "child_process";
import { writeFileSync } from "fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9414;
const child = spawn(chrome, ["--headless=new", "--disable-gpu", `--remote-debugging-port=${port}`, "--hide-scrollbars", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function getWs() {
  for (let i = 0; i < 30; i++) {
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
const send = (method, params = {}) => new Promise((resolve) => {
  const next = ++id;
  pending.set(next, resolve);
  ws.send(JSON.stringify({ id: next, method, params }));
});
await send("Page.enable");
await send("Runtime.enable");

async function readGrid() {
  const res = await send("Runtime.evaluate", {
    expression: `(() => {
      const tabs = [...document.querySelectorAll("[data-tab]")].map((el) => ({
        text: el.textContent.replace(/\\s+/g, " ").trim(),
        pressed: el.getAttribute("aria-pressed"),
        top: Math.round(el.getBoundingClientRect().top),
        left: Math.round(el.getBoundingClientRect().left),
        right: Math.round(el.getBoundingClientRect().right),
      }));
      const names = [...document.querySelectorAll("[data-product-wrap]")]
        .filter((el) => el.dataset.shown === "true")
        .map((el) => el.dataset.name);
      const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
      return { tabs, count: names.length, names, overflow };
    })()`,
    returnByValue: true,
  });
  return res.result?.result?.value;
}

await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await send("Page.navigate", { url: "http://localhost:3000/shop" });
await sleep(2200);
documentScroll();
const mobile = await readGrid();
console.log("mobile tabs", JSON.stringify(mobile.tabs, null, 2), "overflow", mobile.overflow, "count", mobile.count);
const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 55 });
writeFileSync(".verify/filters-mobile.jpg", Buffer.from(shot.result.data, "base64"));

async function clickTab(label) {
  await send("Runtime.evaluate", {
    expression: `(() => {
      const tab = [...document.querySelectorAll("[data-tab]")].find((el) => el.textContent.replace(/\\s+/g, " ").includes(${JSON.stringify(label)}));
      tab?.click();
    })()`,
  });
  await sleep(900);
  return readGrid();
}

function documentScroll() {}

await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: "http://localhost:3000/shop" });
await sleep(1800);
for (const label of ["Triangle", "Bandeau", "Contour", "One-Piece", "All Swim"]) {
  const grid = await clickTab(label);
  console.log(label, grid.count, grid.names.join(" | "));
}
child.kill();
ws.close();

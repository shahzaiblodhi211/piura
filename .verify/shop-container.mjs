import { spawn } from "child_process";
import { writeFileSync } from "fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9368;
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
await send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});
await send("Page.navigate", { url: "http://localhost:3000/shop" });
await sleep(2200);
const info = await send("Runtime.evaluate", {
  expression: `(() => {
    const grid = document.querySelector("#shop [data-product-wrap]")?.parentElement;
    const tab = document.querySelector("[data-tab]");
    const g = grid.getBoundingClientRect();
    const t = tab.getBoundingClientRect();
    return { gridLeft: Math.round(g.left), tabLeft: Math.round(t.left), gridRight: Math.round(g.right), inner: Math.round(window.innerWidth) };
  })()`,
  returnByValue: true,
});
console.log(JSON.stringify(info.result?.result?.value));
await send("Runtime.evaluate", { expression: `document.querySelector("#shop")?.scrollIntoView()` });
await sleep(500);
const cap = await send("Page.captureScreenshot", { format: "png" });
writeFileSync("c:/Users/Shahmeer/projects/piura/.verify/shop-container.png", Buffer.from(cap.result.data, "base64"));
ws.close();
child.kill();

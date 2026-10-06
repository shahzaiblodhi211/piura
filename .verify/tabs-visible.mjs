import { spawn } from "child_process";
import { writeFileSync } from "fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9421;
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
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: "http://localhost:3000/shop" });
await sleep(2200);
await send("Runtime.evaluate", { expression: `document.querySelector("#shop")?.scrollIntoView({block:"start"})` });
await sleep(600);
const res = await send("Runtime.evaluate", {
  expression: `(() => {
    const tabs = [...document.querySelectorAll("[data-tab]")].map((el) => ({
      text: el.textContent.replace(/\\s+/g, " ").trim(),
      opacity: getComputedStyle(el).opacity,
      top: Math.round(el.getBoundingClientRect().top),
    }));
    const copy = [...document.querySelectorAll("p")].find((p) => p.textContent.includes("Designed in Miami"));
    const grid = document.querySelector("[data-product-wrap]");
    const gap = copy && grid ? Math.round(grid.getBoundingClientRect().top - copy.getBoundingClientRect().bottom) : null;
    return { tabs, gap };
  })()`,
  returnByValue: true,
});
console.log(JSON.stringify(res.result?.result?.value, null, 2));
const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 55 });
writeFileSync(".verify/tabs-visible.jpg", Buffer.from(shot.result.data, "base64"));
child.kill();
ws.close();

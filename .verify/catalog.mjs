import { spawn } from "child_process";
import { writeFileSync } from "fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9369;
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
const shot = async (name) => {
  const cap = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`c:/Users/Shahmeer/projects/piura/.verify/${name}.png`, Buffer.from(cap.result.data, "base64"));
};
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: "http://localhost:3000/shop" });
await sleep(2500);
const shop = await send("Runtime.evaluate", {
  expression: `(() => {
    const names = [...document.querySelectorAll("[data-product-name]")].map((n) => n.textContent.trim());
    const imgs = [...document.querySelectorAll("[data-product] img")].map((n) => n.getAttribute("src"));
    const filters = [...document.querySelectorAll("[data-tab]")].map((n) => n.textContent.replace(/\\s+/g," ").trim());
    return { names, imgs, filters };
  })()`,
  returnByValue: true,
});
console.log(JSON.stringify(shop.result?.result?.value, null, 2));
await send("Runtime.evaluate", { expression: `document.querySelector("#shop")?.scrollIntoView()` });
await sleep(600);
await shot("catalog-shop");
await send("Page.navigate", { url: "http://localhost:3000/product/triangle-bikini-mykonos" });
await sleep(2500);
const pdp = await send("Runtime.evaluate", {
  expression: `(() => {
    const h1 = document.querySelector("h1")?.textContent;
    const thumbs = document.querySelectorAll("button img, [data-gallery-stage] img").length;
    const body = document.body.innerText.includes("Main 0707") && document.body.innerText.includes("S: 30");
    return { h1, thumbs, body, text: document.body.innerText.slice(0, 900) };
  })()`,
  returnByValue: true,
});
console.log(JSON.stringify(pdp.result?.result?.value, null, 2));
await shot("catalog-pdp");
ws.close();
child.kill();

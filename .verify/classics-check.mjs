import { spawn } from "child_process";
import { writeFileSync } from "fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9412;
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
const shop = await send("Runtime.evaluate", {
  expression: `(() => {
    const cards = [...document.querySelectorAll("[data-product]")].map((el) => ({
      name: el.querySelector("[data-product-name]")?.textContent.trim(),
      price: el.querySelector("[data-product-price]")?.textContent.trim() || null,
      badge: el.textContent.includes("PREORDER"),
      img: el.querySelector("img")?.src || "",
      w: el.querySelector("img")?.naturalWidth || 0,
    }));
    const filters = [...document.querySelectorAll("button")].map((b) => b.textContent.replace(/\\s+/g, " ").trim()).slice(0, 6);
    return { count: cards.length, filters, first: cards[0], classic: cards.find((c) => c.name?.includes("SUNCHILD TRIANGLE TOP")), last: cards[cards.length - 1] };
  })()`,
  returnByValue: true,
});
console.log("shop", JSON.stringify(shop.result?.result?.value, null, 2));
await send("Runtime.evaluate", { expression: `document.querySelectorAll("[data-product]")[8]?.scrollIntoView({block:"center"})` });
await sleep(800);
const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 60 });
writeFileSync(".verify/classics-shop.jpg", Buffer.from(shot.result.data, "base64"));
await send("Page.navigate", { url: "http://localhost:3000/product/sunchild-triangle-top" });
await sleep(2200);
const pdp = await send("Runtime.evaluate", {
  expression: `(() => {
    const h1 = document.querySelector("h1")?.textContent.trim();
    const price = [...document.querySelectorAll("p")].map((p) => p.textContent.trim()).find((t) => t === "$49" || t.startsWith("$"));
    const thumbs = document.querySelectorAll("[data-slide], button img, [data-thumb]").length;
    const imgs = [...document.querySelectorAll("img")].map((img) => img.getAttribute("src")).filter((s) => s && s.includes("classics"));
    return { h1, price, classicImgs: [...new Set(imgs)], body: document.body.innerText.slice(0, 500) };
  })()`,
  returnByValue: true,
});
console.log("pdp", JSON.stringify(pdp.result?.result?.value, null, 2));
const shot2 = await send("Page.captureScreenshot", { format: "jpeg", quality: 60 });
writeFileSync(".verify/classics-pdp.jpg", Buffer.from(shot2.result.data, "base64"));
child.kill();
ws.close();

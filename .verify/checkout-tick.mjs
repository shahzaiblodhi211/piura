import { spawn } from "child_process";
import { writeFileSync } from "fs";
const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9446;
const child = spawn(chrome, ["--headless=new", "--disable-gpu", `--remote-debugging-port=${port}`, "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function getWs() {
  for (let i = 0; i < 30; i++) {
    try {
      const tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      const page = tabs.find((t) => t.type === "page");
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
await new Promise((r) => ws.addEventListener("open", r));
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const next = ++id;
    pending.set(next, resolve);
    ws.send(JSON.stringify({ id: next, method, params }));
  });
await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1100, height: 800, deviceScaleFactor: 2, mobile: false });
await send("Page.navigate", { url: "http://localhost:3000/shop" });
await sleep(1500);
const cart = JSON.stringify([{
  id: "sunchild-triangle-top:top:MEDIUM",
  slug: "sunchild-triangle-top",
  name: "Sunchild Triangle Top",
  piece: "top",
  size: "MEDIUM",
  price: 49,
  src: "/assets/classics/sunchild-triangle-top-01.jpg",
  qty: 1,
  preorder: false,
}]);
await send("Runtime.evaluate", { expression: `localStorage.setItem("piura-preorder-cart", ${JSON.stringify(cart)})` });
await send("Page.navigate", { url: "http://localhost:3000/checkout" });
await sleep(2000);
await send("Runtime.evaluate", { expression: `document.querySelector('input[name="news"]')?.click()` });
await sleep(200);
const info = await send("Runtime.evaluate", {
  expression: `(() => {
    const box = document.querySelector('input[name="news"]')?.parentElement;
    const svg = box?.querySelector("svg");
    const style = svg ? getComputedStyle(svg) : null;
    const r = box?.getBoundingClientRect();
    return { checked: document.querySelector('input[name="news"]')?.checked, display: style?.display, color: style?.color, box: r && { x: r.x, y: r.y, w: r.width, h: r.height } };
  })()`,
  returnByValue: true,
});
console.log(JSON.stringify(info.result?.result?.value));
const box = info.result?.result?.value?.box;
if (box) {
  const shot = await send("Page.captureScreenshot", {
    format: "png",
    clip: { x: Math.max(0, box.x - 8), y: Math.max(0, box.y - 8), width: 280, height: 40, scale: 2 },
  });
  writeFileSync(".verify/checkout-tick.png", Buffer.from(shot.result.data, "base64"));
}
child.kill();
ws.close();

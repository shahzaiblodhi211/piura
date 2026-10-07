import { spawn } from "child_process";
import { writeFileSync } from "fs";
const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9448;
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
await send("Emulation.setDeviceMetricsOverride", { width: 1100, height: 400, deviceScaleFactor: 2, mobile: false });
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
await send("Page.navigate", { url: "http://localhost:3000/shop" });
await sleep(1200);
await send("Runtime.evaluate", { expression: `localStorage.setItem("piura-preorder-cart", ${JSON.stringify(cart)})` });
await send("Page.navigate", { url: "http://localhost:3000/contact" });
await sleep(1800);
const info = await send("Runtime.evaluate", {
  expression: `(() => {
    const btn = document.querySelector('[aria-label="Bag, 1 items"]');
    const badge = btn?.querySelector("span");
    const r = badge?.getBoundingClientRect();
    const s = badge ? getComputedStyle(badge) : null;
    return { radius: s?.borderRadius, w: r?.width, h: r?.height, box: r && { x: r.x, y: r.y, w: r.width, h: r.height } };
  })()`,
  returnByValue: true,
});
console.log(JSON.stringify(info.result?.result?.value));
const box = info.result?.result?.value?.box;
if (box) {
  const shot = await send("Page.captureScreenshot", {
    format: "png",
    clip: { x: box.x - 28, y: box.y - 6, width: 56, height: 36, scale: 3 },
  });
  writeFileSync(".verify/bag-badge.png", Buffer.from(shot.result.data, "base64"));
}
child.kill();
ws.close();

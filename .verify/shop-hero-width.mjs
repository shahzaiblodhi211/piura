import { spawn } from "child_process";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9418;
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

async function measure(url, width) {
  await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width < 700 });
  await send("Page.navigate", { url });
  await sleep(1600);
  const res = await send("Runtime.evaluate", {
    expression: `(() => {
      const img = document.querySelector("[data-hero-frame] img");
      const frame = document.querySelector("[data-hero-frame]");
      const ir = img.getBoundingClientRect();
      const fr = frame.getBoundingClientRect();
      return {
        vw: document.documentElement.clientWidth,
        img: { left: Math.round(ir.left), right: Math.round(ir.right), w: Math.round(ir.width), h: Math.round(ir.height) },
        frame: { left: Math.round(fr.left), w: Math.round(fr.width) },
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    })()`,
    returnByValue: true,
  });
  return res.result?.result?.value;
}

for (const width of [1664, 1440, 390]) {
  const shop = await measure("http://localhost:3000/shop", width);
  const home = await measure("http://localhost:3000/", width);
  console.log(width, "shop", JSON.stringify(shop), "home", JSON.stringify(home));
}
child.kill();
ws.close();

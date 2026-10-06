import { spawn } from "child_process";
import { writeFileSync } from "fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9396;
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

async function shot(width, path, file, scroll) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height: 844,
    deviceScaleFactor: 1,
    mobile: width < 800,
  });
  await send("Page.navigate", { url: `http://localhost:3000${path}` });
  await sleep(1500);
  if (scroll) {
    await send("Runtime.evaluate", { expression: `window.scrollTo(0, ${scroll})` });
    await sleep(600);
  }
  const info = await send("Runtime.evaluate", {
    expression: `document.documentElement.scrollWidth - document.documentElement.clientWidth`,
    returnByValue: true,
  });
  console.log(width, path, "overflow", info.result?.result?.value);
  const cap = await send("Page.captureScreenshot", { format: "jpeg", quality: 55 });
  writeFileSync(file, Buffer.from(cap.result.data, "base64"));
}

await shot(390, "/shop", "c:/Users/Shahmeer/projects/piura/.verify/responsive-shop.jpg", 700);
await shot(390, "/product/contour-bikini-ibiza", "c:/Users/Shahmeer/projects/piura/.verify/responsive-pdp.jpg", 0);
await shot(768, "/", "c:/Users/Shahmeer/projects/piura/.verify/responsive-tablet.jpg", 900);

ws.close();
child.kill();

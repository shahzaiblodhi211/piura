import { spawn } from "child_process";
import { writeFileSync } from "fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9398;
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

async function shot(width, height, path, file, scroll) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 800,
  });
  await send("Page.navigate", { url: `http://localhost:3000${path}` });
  await sleep(1600);
  if (scroll) {
    await send("Runtime.evaluate", {
      expression: `window.scrollTo(0, ${scroll})`,
    });
    await sleep(500);
  }
  const cap = await send("Page.captureScreenshot", { format: "jpeg", quality: 60 });
  writeFileSync(file, Buffer.from(cap.result.data, "base64"));
  console.log("saved", file);
}

await shot(390, 844, "/", "c:/Users/Shahmeer/projects/piura/.verify/cover-hero.jpg", 0);
await shot(1440, 900, "/", "c:/Users/Shahmeer/projects/piura/.verify/cover-hero-desk.jpg", 0);
await shot(390, 844, "/shop", "c:/Users/Shahmeer/projects/piura/.verify/cover-shop.jpg", 0);
await shot(390, 844, "/product/contour-bikini-ibiza", "c:/Users/Shahmeer/projects/piura/.verify/cover-pdp.jpg", 0);
await shot(390, 844, "/story", "c:/Users/Shahmeer/projects/piura/.verify/cover-story.jpg", 700);

ws.close();
child.kill();

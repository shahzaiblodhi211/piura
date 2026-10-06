import { spawn } from "child_process";
import { writeFileSync } from "fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9401;
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
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await send("Page.navigate", { url: "http://localhost:3000/" });
await sleep(1500);
const heights = await send("Runtime.evaluate", {
  expression: `(() => {
    const hero = document.querySelector("h1")?.closest("section")?.getBoundingClientRect().height;
    const tiles = [...document.querySelectorAll("[data-photo='still']")].slice(0, 3).map((el) => Math.round(el.getBoundingClientRect().height));
    const clipped = document.querySelector("h1")?.closest("section")?.scrollHeight > document.querySelector("h1")?.closest("section")?.clientHeight + 2;
    return { hero: Math.round(hero || 0), tiles, clipped };
  })()`,
  returnByValue: true,
});
console.log(JSON.stringify(heights.result?.result?.value));
const cap = await send("Page.captureScreenshot", { format: "jpeg", quality: 55 });
writeFileSync("c:/Users/Shahmeer/projects/piura/.verify/heights-hero.jpg", Buffer.from(cap.result.data, "base64"));
ws.close();
child.kill();

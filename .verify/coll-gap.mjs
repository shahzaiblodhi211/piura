import { spawn } from "child_process";
import { writeFileSync } from "fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9414;
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
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: "http://localhost:3000/" });
await sleep(1800);
await send("Runtime.evaluate", {
  expression: `document.querySelector("img[src*='home-coll-tops']")?.closest("a")?.scrollIntoView({block:"center"})`,
});
await sleep(500);
const measure = await send("Runtime.evaluate", {
  expression: `(() => {
    const a = document.querySelector("img[src*='home-coll-tops']").getBoundingClientRect();
    const b = document.querySelector("img[src*='home-coll-bottoms']").getBoundingClientRect();
    return { gap: Math.round(b.left - a.right), a: { w: Math.round(a.width), h: Math.round(a.height) }, b: { w: Math.round(b.width), h: Math.round(b.height) } };
  })()`,
  returnByValue: true,
});
console.log(JSON.stringify(measure.result?.result?.value));
const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 55 });
writeFileSync("c:/Users/Shahmeer/projects/piura/.verify/coll-gap.jpg", Buffer.from(shot.result.data, "base64"));
ws.close();
child.kill();

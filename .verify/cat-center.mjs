import { spawn } from "child_process";
import { writeFileSync } from "fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9402;
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
await send("Emulation.setDeviceMetricsOverride", { width: 480, height: 900, deviceScaleFactor: 1, mobile: true });
await send("Page.navigate", { url: "http://localhost:3000/" });
await sleep(1800);
const measure = await send("Runtime.evaluate", {
  expression: `(() => {
    const grid = document.querySelector("[data-reveal].grid");
    const cards = [...grid.querySelectorAll("a")];
    const gb = grid.getBoundingClientRect();
    const last = cards[cards.length - 1].getBoundingClientRect();
    const gridMid = gb.left + gb.width / 2;
    const lastMid = last.left + last.width / 2;
    return {
      count: cards.length,
      gridW: Math.round(gb.width),
      lastW: Math.round(last.width),
      offset: Math.round(lastMid - gridMid),
      label: cards[cards.length - 1].textContent.trim(),
    };
  })()`,
  returnByValue: true,
});
console.log(JSON.stringify(measure.result?.result?.value));
const y = await send("Runtime.evaluate", {
  expression: `document.querySelector("h2")?.getBoundingClientRect().top + window.scrollY - 20`,
  returnByValue: true,
});
await send("Runtime.evaluate", { expression: `window.scrollTo(0, ${y.result?.result?.value || 500})` });
await sleep(400);
const cap = await send("Page.captureScreenshot", { format: "jpeg", quality: 60 });
writeFileSync("c:/Users/Shahmeer/projects/piura/.verify/cat-center.jpg", Buffer.from(cap.result.data, "base64"));
ws.close();
child.kill();

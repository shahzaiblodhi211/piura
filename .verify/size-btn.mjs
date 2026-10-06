import { spawn } from "child_process";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9425;
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
for (const width of [390, 768, 1100]) {
await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width < 800 });
await send("Page.navigate", { url: "http://localhost:3000/product/sunchild-triangle-top" });
await sleep(1400);
const res = await send("Runtime.evaluate", {
  expression: `(() => {
    const grid = document.querySelector(".grid.grid-cols-2");
    const buttons = [...document.querySelectorAll("button")].filter((b) => ["SMALL","MEDIUM","LARGE","EXTRA LARGE"].includes(b.textContent.trim()));
    return {
      grid: grid ? grid.className : null,
      buttons: buttons.map((b) => ({
        text: b.textContent.trim(),
        w: Math.round(b.getBoundingClientRect().width),
        h: Math.round(b.getBoundingClientRect().height),
        overflow: b.scrollWidth > b.clientWidth + 1,
      })),
    };
  })()`,
  returnByValue: true,
});
console.log(width, JSON.stringify(res.result?.result?.value));
}
child.kill();
ws.close();

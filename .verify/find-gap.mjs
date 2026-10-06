import { spawn } from "child_process";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9413;
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
await send("Page.navigate", { url: "http://localhost:3000/shop" });
await sleep(2000);
const info = await send("Runtime.evaluate", {
  expression: `(() => {
    const imgs = [...document.querySelectorAll("img")].map((img) => {
      const r = img.getBoundingClientRect();
      return { src: img.getAttribute("src"), l: Math.round(r.left + scrollX), t: Math.round(r.top + scrollY), w: Math.round(r.width), h: Math.round(r.height) };
    }).filter((i) => i.w > 200 && i.h > 200);
    const gaps = [];
    for (let i = 0; i < imgs.length; i++) {
      for (let j = i + 1; j < imgs.length; j++) {
        const a = imgs[i], b = imgs[j];
        const sameRow = Math.abs(a.t - b.t) < 40;
        if (!sameRow) continue;
        const left = a.l < b.l ? a : b;
        const right = a.l < b.l ? b : a;
        const gap = right.l - (left.l + left.w);
        if (gap > 2 && gap < 400) gaps.push({ gap, left: left.src, right: right.src, y: left.t });
      }
    }
    return { count: imgs.length, gaps: gaps.slice(0, 12), issue: document.body.innerText.includes("Issue") };
  })()`,
  returnByValue: true,
});
console.log(JSON.stringify(info.result?.result?.value, null, 2));
ws.close();
child.kill();

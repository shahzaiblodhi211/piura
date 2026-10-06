import { spawn } from "child_process";
import { writeFileSync } from "fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9411;
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
await sleep(1600);
await send("Runtime.evaluate", { expression: `document.querySelector("button[aria-label='Search']").click()` });
await sleep(700);
const info = await send("Runtime.evaluate", {
  expression: `(() => {
    const panel = document.querySelector(".search-panel");
    const rows = [...panel.querySelectorAll("a")];
    const r = panel.getBoundingClientRect();
    return {
      count: rows.length,
      rows: rows.map((a) => ({
        text: a.innerText.replace(/\\s+/g, " ").trim(),
        img: !!a.querySelector("img"),
        imgW: Math.round(a.querySelector("img").getBoundingClientRect().width),
      })),
      panel: { l: Math.round(r.left), w: Math.round(r.width), right: Math.round(r.right) },
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  })()`,
  returnByValue: true,
});
console.log(JSON.stringify(info.result?.result?.value, null, 2));
const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 60 });
writeFileSync("c:/Users/Shahmeer/projects/piura/.verify/search-open.jpg", Buffer.from(shot.result.data, "base64"));
ws.close();
child.kill();

import { spawn } from "child_process";
import { writeFileSync } from "fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9407;
const child = spawn(
  chrome,
  [
    "--headless=new",
    "--disable-gpu",
    `--remote-debugging-port=${port}`,
    "--window-size=1440,900",
    "about:blank",
  ],
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
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const next = ++id;
    pending.set(next, resolve);
    ws.send(JSON.stringify({ id: next, method, params }));
  });
await send("Page.enable");
await send("Runtime.enable");
await send("Page.navigate", {
  url: "https://www.canva.com/design/DAHULQ3cbEo/74nBguJ4b12UKDe3l6FvzQ/view",
});
await sleep(10000);
const info = await send("Runtime.evaluate", {
  expression: `fetch("/_ajax/documents/imagesets?refs=DAHULQ3cbEo%3A74nBguJ4b12UKDe3l6FvzQ%3A%3A1%2C2%2C3%2C4%2C5%2C6%2C7%2C8%2C9%2C10%2C11%2C12&type=B&forceDynamic=false&limit=50").then(async (r) => {
    const t = await r.text();
    return { status: r.status, start: t.slice(0, 500), len: t.length };
  })`,
  awaitPromise: true,
  returnByValue: true,
});
console.log(JSON.stringify(info.result?.result?.value, null, 2));
const ax = await send("Runtime.evaluate", {
  expression: `(() => {
    const nodes = [...document.querySelectorAll("[aria-label], [role='img']")];
    return nodes.map((n) => n.getAttribute("aria-label")).filter(Boolean).slice(0, 40);
  })()`,
  returnByValue: true,
});
console.log("labels", JSON.stringify(ax.result?.result?.value));
ws.close();
child.kill();

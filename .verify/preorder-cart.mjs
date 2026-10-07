import { spawn } from "child_process";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9431;
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
await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });

async function evalPage(expression) {
  const res = await send("Runtime.evaluate", { expression, returnByValue: true });
  return res.result?.result?.value;
}

await send("Page.navigate", { url: "http://localhost:3000/product/sara-bikini-top" });
await sleep(1600);
await evalPage(`localStorage.removeItem("piura-preorder-cart")`);
console.log("sara", await evalPage(`document.body.innerText.includes("Reserve yours") + " preorderBtn " + [...document.querySelectorAll("button")].some((b) => b.textContent.includes("Preorder"))`));

await send("Page.navigate", { url: "http://localhost:3000/product/triangle-bikini-ipanema" });
await sleep(1600);
console.log("ipanema buttons", await evalPage(`[...document.querySelectorAll("button")].map((b) => b.textContent.trim()).filter((t) => /Top|Bottom|Preorder|Reserve/.test(t))`));
await evalPage(`[...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Preorder")?.click()`);
await sleep(400);
console.log("drawer", await evalPage(`document.body.innerText.includes("Preorder bag") && document.body.innerText.includes("Top") && document.body.innerText.includes("$54")`));

await send("Page.navigate", { url: "http://localhost:3000/checkout" });
await sleep(1400);
console.log("checkout", await evalPage(`({
  top: document.body.innerText.includes("Top"),
  bottom: document.body.innerText.includes("Bottom"),
  total: document.body.innerText.includes("108"),
  old: document.body.innerText.includes("already"),
})`));
child.kill();
ws.close();

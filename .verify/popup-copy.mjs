import { spawn } from "child_process";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9420;
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
    await sleep(250);
  }
  throw new Error("no cdp");
}
const ws = new WebSocket(await getWs());
let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
});
await new Promise((resolve, reject) => { ws.addEventListener("open", resolve); ws.addEventListener("error", reject); });
const send = (method, params = {}) => new Promise((resolve) => { const next = ++id; pending.set(next, resolve); ws.send(JSON.stringify({ id: next, method, params })); });
await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: "http://localhost:3000/" });
await sleep(1200);
await send("Runtime.evaluate", {
  expression: `localStorage.removeItem("piura-come-closer"); sessionStorage.setItem("piura-come-closer-started", String(Date.now() - 70000)); sessionStorage.setItem("piura-come-closer-scrolled","1"); location.reload()`,
});
await sleep(1800);
const info = await send("Runtime.evaluate", {
  expression: `document.querySelector("[role=dialog] p")?.textContent?.trim() || "closed"`,
  returnByValue: true,
});
console.log(info.result?.result?.value);
ws.close();
child.kill();

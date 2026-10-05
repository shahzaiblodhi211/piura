import { spawn } from "child_process";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9395;
const child = spawn(
  chrome,
  ["--headless=new", "--disable-gpu", `--remote-debugging-port=${port}`, "--hide-scrollbars", "about:blank"],
  { stdio: "ignore" },
);
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
const evalJs = async (expression) => {
  const msg = await send("Runtime.evaluate", { expression, returnByValue: true });
  return msg.result?.result?.value;
};
await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

await send("Page.navigate", { url: "http://localhost:3000/" });
await sleep(1500);
await evalJs(`localStorage.removeItem("piura-come-closer"); sessionStorage.setItem("piura-come-closer-started", String(Date.now())); sessionStorage.removeItem("piura-come-closer-scrolled");`);
await send("Page.reload");
await sleep(1500);
await evalJs(`window.scrollTo(0, 600)`);
await sleep(400);
console.log("fresh scroll, open?", await evalJs(`!!document.querySelector("[role=dialog]")`));

await evalJs(`localStorage.removeItem("piura-come-closer"); sessionStorage.setItem("piura-come-closer-started", String(Date.now() - 70000)); sessionStorage.removeItem("piura-come-closer-scrolled");`);
await send("Page.reload");
await sleep(1200);
console.log("after a minute, before scroll, open?", await evalJs(`!!document.querySelector("[role=dialog]")`));
await evalJs(`window.scrollTo(0, 700)`);
await sleep(500);
console.log("after a minute and a scroll, open?", await evalJs(`!!document.querySelector("[role=dialog]")`));

ws.close();
child.kill();

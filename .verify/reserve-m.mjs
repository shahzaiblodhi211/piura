import { spawn } from "child_process";
import { writeFileSync } from "fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9357;
const child = spawn(
  chrome,
  [
    "--headless=new",
    "--disable-gpu",
    `--remote-debugging-port=${port}`,
    "--hide-scrollbars",
    "about:blank",
  ],
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
await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 844,
  deviceScaleFactor: 1,
  mobile: true,
});
await send("Page.navigate", {
  url: "http://localhost:3000/product/sunchild-triangle-bottom",
});
await sleep(4000);
await send("Runtime.evaluate", {
  expression: `document.getElementById("reserve-yours")?.scrollIntoView({ block: "center" })`,
});
await sleep(400);
const box = await send("Runtime.evaluate", {
  expression: `(() => {
    const r = document.getElementById("reserve-yours").getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  })()`,
  returnByValue: true,
});
await send("Input.dispatchMouseEvent", {
  type: "mousePressed",
  x: box.result.result.value.x,
  y: box.result.result.value.y,
  button: "left",
  clickCount: 1,
});
await send("Input.dispatchMouseEvent", {
  type: "mouseReleased",
  x: box.result.result.value.x,
  y: box.result.result.value.y,
  button: "left",
  clickCount: 1,
});
await sleep(900);
const cap = await send("Page.captureScreenshot", { format: "png" });
writeFileSync(
  "c:/Users/Shahmeer/projects/piura/.verify/reserve-m.png",
  Buffer.from(cap.result.data, "base64"),
);
console.log("open", (await send("Runtime.evaluate", {
  expression: `Boolean(document.getElementById("reserve-dialog"))`,
  returnByValue: true,
})).result.result.value);
ws.close();
child.kill();

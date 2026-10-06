import { spawn } from "child_process";
import { writeFileSync } from "fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9417;
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
await send("Page.navigate", { url: "http://localhost:3000/" });
await sleep(1800);
await send("Runtime.evaluate", { expression: `document.querySelector("#tote")?.scrollIntoView({block:"end"})` });
await sleep(1600);
const labels = await send("Runtime.evaluate", {
  expression: `[...document.querySelectorAll("a span.underline")].map((el) => el.textContent.trim())`,
  returnByValue: true,
});
console.log("labels", JSON.stringify(labels.result?.result?.value));
const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 55 });
writeFileSync(".verify/home-coll-labels.jpg", Buffer.from(shot.result.data, "base64"));
await send("Page.navigate", { url: "http://localhost:3000/shop?filter=sara" });
await sleep(1800);
await send("Runtime.evaluate", { expression: `document.querySelector("[data-tabs]")?.scrollIntoView({block:"center"})` });
await sleep(400);
const shot2 = await send("Page.captureScreenshot", { format: "jpeg", quality: 55 });
writeFileSync(".verify/shop-sara-tabs.jpg", Buffer.from(shot2.result.data, "base64"));
child.kill();
ws.close();

import { spawn } from "child_process";
import { writeFileSync } from "fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9374;
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
await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: "http://localhost:3000/product/triangle-bikini-mykonos" });
await sleep(2000);
const before = await send("Runtime.evaluate", {
  expression: `(() => {
    const col = document.querySelector("[data-gallery-stage]").closest(".xl\\\\:max-w-\\\\[720px\\\\], .flex.w-full.flex-col");
    const row = document.querySelector("[data-thumb]")?.parentElement?.parentElement;
    const c = col.getBoundingClientRect();
    const r = row.getBoundingClientRect();
    const hero = document.querySelector("[data-gallery-stage] img")?.getAttribute("src");
    return { colW: Math.round(c.width), rowW: Math.round(r.width), hero, thumbs: document.querySelectorAll("[data-thumb]").length };
  })()`,
  returnByValue: true,
});
console.log("before", JSON.stringify(before.result?.result?.value));
await send("Runtime.evaluate", {
  expression: `document.querySelector('[aria-label="Next image"]').click()`,
});
await sleep(700);
const after = await send("Runtime.evaluate", {
  expression: `document.querySelector("[data-gallery-stage] img")?.getAttribute("src")`,
  returnByValue: true,
});
console.log("after", after.result?.result?.value);
const cap = await send("Page.captureScreenshot", { format: "png" });
writeFileSync("c:/Users/Shahmeer/projects/piura/.verify/thumb-slider.png", Buffer.from(cap.result.data, "base64"));
ws.close();
child.kill();

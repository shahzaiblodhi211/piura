import { spawn } from "child_process";
import { writeFileSync } from "fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9416;
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
await send("Page.navigate", { url: "http://localhost:3000/product/triangle-bikini-mykonos" });
await sleep(1800);
await send("Runtime.evaluate", { expression: `[...document.querySelectorAll("h1")].find((el) => el.textContent.includes("Sizes"))?.scrollIntoView({block:"center"})` });
await sleep(400);
const info = await send("Runtime.evaluate", {
  expression: `(() => {
    const img = [...document.querySelectorAll("img")].find((el) => el.alt.includes("Mykonos") || el.closest("section")?.innerText?.includes("Sizes and quantity"));
    const shots = [...document.querySelectorAll("section img")];
    const last = shots[shots.length - 1];
    const r = last.getBoundingClientRect();
    return { src: last.getAttribute("src"), w: Math.round(r.width), h: Math.round(r.height), alt: last.alt };
  })()`,
  returnByValue: true,
});
console.log(JSON.stringify(info.result?.result?.value));
const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 55 });
writeFileSync("c:/Users/Shahmeer/projects/piura/.verify/sizes-img.jpg", Buffer.from(shot.result.data, "base64"));
ws.close();
child.kill();

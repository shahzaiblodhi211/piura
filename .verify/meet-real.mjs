import { spawn } from "child_process";
import { writeFileSync } from "fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9391;
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
await send("Page.navigate", { url: "http://localhost:3000/" });
await sleep(1600);
await send("Runtime.evaluate", { expression: `localStorage.setItem("piura-come-closer","1"); location.reload()` });
await sleep(1800);
const info = await send("Runtime.evaluate", {
  expression: `(() => {
    const heading = [...document.querySelectorAll("h2")].find((node) => node.textContent.includes("Meet The New"));
    const grid = heading?.parentElement?.nextElementSibling;
    const cards = [...(grid?.querySelectorAll("a") || [])].map((link) => ({
      name: link.querySelector("span.font-bebas:last-of-type")?.textContent?.trim(),
      href: link.getAttribute("href"),
      src: link.querySelector("img")?.getAttribute("src"),
    }));
    const coll = [...document.querySelectorAll("a")].filter((a) => a.querySelector("span")?.textContent === "TOPS").map((a) => a.querySelector("img")?.getAttribute("src"));
    grid?.scrollIntoView({ block: "start" });
    return { count: cards.length, cards, coll };
  })()`,
  returnByValue: true,
});
console.log(JSON.stringify(info.result?.result?.value, null, 2));
await sleep(400);
const cap = await send("Page.captureScreenshot", { format: "png" });
writeFileSync("c:/Users/Shahmeer/projects/piura/.verify/meet-real.png", Buffer.from(cap.result.data, "base64"));
ws.close();
child.kill();

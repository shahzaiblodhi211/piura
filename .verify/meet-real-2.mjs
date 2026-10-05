import { spawn } from "child_process";
import { writeFileSync } from "fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9392;
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
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: "http://localhost:3000/" });
await sleep(2000);
const info = await send("Runtime.evaluate", {
  expression: `(() => {
    localStorage.setItem("piura-come-closer","1");
    document.querySelector("[aria-label=Close]")?.click();
    const heading = [...document.querySelectorAll("h2")].find((node) => node.textContent.includes("Meet The New"));
    const grid = heading.parentElement.nextElementSibling;
    grid.style.opacity = "1";
    const cards = [...grid.querySelectorAll(":scope > a")].map((link) => link.innerText.replace(/\\s+/g, " ").trim());
    const tops = document.querySelector('a[href="/shop"] img[src*="home-coll-tops"]');
    grid.scrollIntoView({ block: "start" });
    const box = grid.getBoundingClientRect();
    return { cards, tops: !!tops, gridTop: Math.round(box.top), gridH: Math.round(box.height) };
  })()`,
  returnByValue: true,
});
console.log(JSON.stringify(info.result?.result?.value, null, 2));
await sleep(600);
const cap = await send("Page.captureScreenshot", { format: "png" });
writeFileSync("c:/Users/Shahmeer/projects/piura/.verify/meet-real-2.png", Buffer.from(cap.result.data, "base64"));
ws.close();
child.kill();

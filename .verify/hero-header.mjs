import { spawn } from "child_process";
import { writeFileSync } from "fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9376;
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
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 800, deviceScaleFactor: 1, mobile: false });
const shot = async (name) => {
  const cap = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`c:/Users/Shahmeer/projects/piura/.verify/${name}.png`, Buffer.from(cap.result.data, "base64"));
};
for (const [name, url] of [
  ["hero-home", "http://localhost:3000/"],
  ["hero-shop", "http://localhost:3000/shop"],
]) {
  await send("Page.navigate", { url });
  await sleep(2000);
  const info = await send("Runtime.evaluate", {
    expression: `(() => {
      const header = document.querySelector("header");
      const hero = header?.closest("section");
      const cs = getComputedStyle(header);
      return { pos: cs.position, bg: cs.backgroundColor, inHero: !!hero, heroTag: hero?.tagName };
    })()`,
    returnByValue: true,
  });
  console.log(name, JSON.stringify(info.result?.result?.value));
  await shot(name);
}
ws.close();
child.kill();

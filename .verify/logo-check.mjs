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

const measure = `(() => {
  const img = document.querySelector("header a[aria-label='Piura Swim'] img");
  const footer = document.querySelector("footer a[aria-label='Piura Swim'] img");
  const box = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { src: el.getAttribute("src"), w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left) };
  };
  const header = document.querySelector("header");
  const hr = header?.getBoundingClientRect();
  const mark = img?.getBoundingClientRect();
  const nav = document.querySelector("header nav");
  const navRight = nav ? Math.round(nav.getBoundingClientRect().right) : null;
  const icons = document.querySelector("header .ml-auto");
  const iconLeft = icons ? Math.round(icons.getBoundingClientRect().left) : null;
  return {
    header: box(img),
    footer: box(footer),
    centerDelta: mark && hr ? Math.round(mark.left + mark.width / 2 - (hr.left + hr.width / 2)) : null,
    navRight,
    markLeft: mark ? Math.round(mark.left) : null,
    markRight: mark ? Math.round(mark.right) : null,
    iconLeft,
  };
})()`;

for (const [url, width] of [
  ["http://localhost:3000/", 1440],
  ["http://localhost:3000/story", 1440],
  ["http://localhost:3000/", 390],
]) {
  await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width < 500 });
  await send("Page.navigate", { url });
  await sleep(1600);
  const info = await send("Runtime.evaluate", { expression: measure, returnByValue: true });
  console.log(width, url, JSON.stringify(info.result?.result?.value));
}

await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: "http://localhost:3000/" });
await sleep(1200);
const shot = await send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: 1440, height: 220, scale: 1 } });
writeFileSync("c:/Users/Shahmeer/projects/piura/.verify/logo-header.png", Buffer.from(shot.result.data, "base64"));

ws.close();
child.kill();

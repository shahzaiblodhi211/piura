import { spawn } from "child_process";
import { writeFileSync } from "fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9394;
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

const probe = `(() => {
  const doc = document.documentElement;
  const overflow = doc.scrollWidth - doc.clientWidth;
  const offenders = [];
  for (const el of document.body.querySelectorAll("h1,h2,a,button,img,section,p,span")) {
    const r = el.getBoundingClientRect();
    if (r.width > 8 && (r.right > doc.clientWidth + 2 || r.left < -2)) {
      const text = (el.innerText || el.getAttribute("alt") || el.tagName).replace(/\\s+/g, " ").slice(0, 48);
      offenders.push({ tag: el.tagName, text, left: Math.round(r.left), right: Math.round(r.right) });
      if (offenders.length > 6) break;
    }
  }
  const hero = document.querySelector("h1");
  const hr = hero?.getBoundingClientRect();
  return {
    overflow,
    hero: hr ? Math.round(hr.height) : null,
    offenders,
  };
})()`;

const pages = ["/", "/shop", "/product/triangle-bikini-positano", "/story", "/size-guide", "/contact", "/waitlist"];
const widths = [390, 768, 1280];

for (const width of widths) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height: 900,
    deviceScaleFactor: 1,
    mobile: width < 500,
  });
  for (const path of pages) {
    await send("Page.navigate", { url: `http://localhost:3000${path}` });
    await sleep(1400);
    const info = await send("Runtime.evaluate", { expression: probe, returnByValue: true });
    const value = info.result?.result?.value;
    const flag = value?.overflow > 2 || value?.offenders?.length ? "OVERFLOW" : "ok";
    console.log(width, path, flag, JSON.stringify(value));
  }
}

await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 900, deviceScaleFactor: 1, mobile: true });
await send("Page.navigate", { url: "http://localhost:3000/" });
await sleep(1600);
const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 60 });
writeFileSync("c:/Users/Shahmeer/projects/piura/.verify/responsive-home.jpg", Buffer.from(shot.result.data, "base64"));

ws.close();
child.kill();

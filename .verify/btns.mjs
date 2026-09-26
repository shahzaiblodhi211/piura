import { spawn } from "child_process";
import { writeFileSync } from "fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9352;
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
const shot = async (name) => {
  const cap = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(
    `c:/Users/Shahmeer/projects/piura/.verify/${name}.png`,
    Buffer.from(cap.result.data, "base64"),
  );
};
await send("Emulation.setDeviceMetricsOverride", {
  width: 1560,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});
await send("Page.navigate", { url: "http://localhost:3000/" });
await sleep(3200);
const info = await send("Runtime.evaluate", {
  expression: `(() => {
    const full = [...document.querySelectorAll("p")].find((n) => n.textContent.includes("full set"));
    const shop = [...document.querySelectorAll("a")].find((n) => n.textContent.includes("COLLECTION") && n.closest("section")?.querySelector("h2"));
    const box = (el) => el ? { w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height), wrap: getComputedStyle(el).whiteSpace, y: el.getBoundingClientRect().top + window.scrollY } : null;
    return { full: box(full), shop: box(shop) };
  })()`,
  returnByValue: true,
});
console.log(info.result.result.value);
const { full, shop } = info.result.result.value;
await send("Runtime.evaluate", { expression: `window.scrollTo(0, ${full.y - 200})` });
await sleep(500);
await shot("btn-full");
await send("Runtime.evaluate", { expression: `window.scrollTo(0, ${shop.y - 200})` });
await sleep(500);
await shot("btn-shop");
ws.close();
child.kill();

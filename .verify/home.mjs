import { spawn } from "child_process";
import { writeFileSync, mkdirSync } from "fs";

mkdirSync("c:\\Users\\Shahmeer\\projects\\piura\\.verify", { recursive: true });
const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9346;
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
    `c:\\Users\\Shahmeer\\projects\\piura\\.verify\\${name}.png`,
    Buffer.from(cap.result.data, "base64"),
  );
};
const open = async (url, width, height, mobile) => {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile,
  });
  await send("Page.navigate", { url });
  await sleep(3200);
};

await open("http://localhost:3000/", 1560, 1100, false);
const info = await send("Runtime.evaluate", {
  expression: `(() => {
    const shop = [...document.querySelectorAll("nav a")].find((a) => a.textContent.trim() === "Shop");
    return {
      title: document.title,
      h1: document.querySelector("h1")?.textContent,
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      shopActive: shop?.hasAttribute("data-nav-active") ?? false,
      shopHref: shop?.getAttribute("href"),
      scrollHeight: document.documentElement.scrollHeight,
    };
  })()`,
  returnByValue: true,
});
console.log(info.result.result.value);
await shot("h-top");
await send("Runtime.evaluate", { expression: "window.scrollTo(0, 1200)" });
await sleep(700);
await shot("h-drop");
await send("Runtime.evaluate", { expression: "window.scrollTo(0, 3200)" });
await sleep(700);
await shot("h-moods");
await send("Runtime.evaluate", { expression: "window.scrollTo(0, 5200)" });
await sleep(700);
await shot("h-look");
await send("Runtime.evaluate", { expression: "window.scrollTo(0, 7200)" });
await sleep(700);
await shot("h-wait");
await open("http://localhost:3000/", 390, 844, true);
await shot("h-m");
await open("http://localhost:3000/shop", 1560, 900, false);
const shop = await send("Runtime.evaluate", {
  expression: `document.querySelector("h1")?.textContent`,
  returnByValue: true,
});
console.log("shop", shop.result.result.value);
await shot("shop");
ws.close();
child.kill();

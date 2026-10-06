import { spawn } from "child_process";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9426;
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

async function check(url) {
  await send("Page.navigate", { url });
  await sleep(1500);
  const res = await send("Runtime.evaluate", {
    expression: `(() => {
      const h = [...document.querySelectorAll("h1")].find((el) => el.textContent.includes("Sizes"));
      h?.scrollIntoView({block:"center"});
      const section = h?.closest("section");
      const img = section?.querySelector("img");
      return { alt: img?.alt, src: img?.getAttribute("src"), fit: img ? getComputedStyle(img).objectFit : null, h: img ? Math.round(img.getBoundingClientRect().height) : 0 };
    })()`,
    returnByValue: true,
  });
  console.log(url, JSON.stringify(res.result?.result?.value));
}
await check("http://localhost:3000/product/sara-bikini-top");
await check("http://localhost:3000/product/triangle-bikini-ipanema");
await check("http://localhost:3000/product/sunchild-triangle-top");
child.kill();
ws.close();

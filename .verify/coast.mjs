import { spawn } from "child_process";
import { writeFileSync } from "fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9360;
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
const shot = async (name) => {
  const cap = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`c:/Users/Shahmeer/projects/piura/.verify/${name}.png`, Buffer.from(cap.result.data, "base64"));
};
await send("Emulation.setDeviceMetricsOverride", {
  width: 1560,
  height: 1000,
  deviceScaleFactor: 1,
  mobile: false,
});
await send("Page.navigate", { url: "http://localhost:3000/" });
await sleep(4000);
const info = await send("Runtime.evaluate", {
  expression: `({
    h1: document.querySelector("h1")?.textContent,
    bar: document.body.innerText.includes("COASTLINES PREORDER"),
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
    h: document.documentElement.scrollHeight,
  })`,
  returnByValue: true,
});
console.log(info.result.result.value);
await shot("c-hero");
for (const [name, text] of [
  ["c-cat", "OUR CATEGORIES"],
  ["c-meet", "Meet The New"],
  ["c-tote", "TAKE PIURA"],
  ["c-coll", "OUR COLLECTION"],
  ["c-girls", "real girls"],
]) {
  await send("Runtime.evaluate", {
    expression: `(() => {
      const el = [...document.querySelectorAll("h2,p")].find((n) => n.textContent.includes(${JSON.stringify(text)}));
      if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 40);
    })()`,
  });
  await sleep(500);
  await shot(name);
}
await send("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 844,
  deviceScaleFactor: 1,
  mobile: true,
});
await send("Runtime.evaluate", { expression: "window.scrollTo(0,0)" });
await sleep(400);
await shot("c-m");
ws.close();
child.kill();

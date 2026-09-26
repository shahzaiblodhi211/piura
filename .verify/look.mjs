import { spawn } from "child_process";
import { writeFileSync } from "fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9354;
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
const read = () =>
  send("Runtime.evaluate", {
    expression: `(() => {
      const look = document.getElementById("lookbook");
      const track = look?.querySelector("[data-look-track]");
      const dots = [...(look?.querySelectorAll("[aria-label^='Show look']") ?? [])];
      const x = track ? Number(gsapX(track)) : null;
      return {
        x,
        active: dots.findIndex((d) => d.getAttribute("aria-current") === "true"),
        cards: look?.querySelectorAll("[data-slot]").length ?? 0,
      };
      function gsapX(el) {
        const t = getComputedStyle(el).transform;
        if (!t || t === "none") return 0;
        const m = new DOMMatrix(t);
        return Math.round(m.m41);
      }
    })()`,
    returnByValue: true,
  });

await send("Emulation.setDeviceMetricsOverride", {
  width: 1560,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});
await send("Page.navigate", { url: "http://localhost:3000/#lookbook" });
await sleep(3200);
await send("Runtime.evaluate", {
  expression: `document.getElementById("lookbook")?.scrollIntoView({ block: "center" })`,
});
await sleep(400);
console.log("start", (await read()).result.result.value);
await shot("look-a");
await send("Runtime.evaluate", {
  expression: `document.querySelector("[aria-label='Show look 5']")?.click()`,
});
await sleep(1100);
console.log("dot5", (await read()).result.result.value);
await shot("look-b");
await send("Runtime.evaluate", {
  expression: `document.querySelector("[aria-label='Show look 1']")?.click()`,
});
await sleep(1100);
console.log("dot1", (await read()).result.result.value);
await shot("look-c");
ws.close();
child.kill();

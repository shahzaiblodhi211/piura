import { spawn } from "child_process";
import { writeFileSync } from "fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9381;
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
const shot = async (name) => {
  const cap = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`c:/Users/Shahmeer/projects/piura/.verify/${name}.png`, Buffer.from(cap.result.data, "base64"));
};
await send("Page.navigate", { url: "http://localhost:3000/" });
await sleep(2200);
const info = await send("Runtime.evaluate", {
  expression: `(() => {
    const dialog = document.querySelector("[role=dialog]");
    const card = dialog?.getBoundingClientRect();
    const title = document.getElementById("come-closer-title")?.textContent;
    const input = document.querySelector("#come-closer-email");
    const button = dialog?.querySelector("button[type=submit]")?.textContent;
    const imgs = [...(dialog?.querySelectorAll("img") || [])].map((img) => img.getAttribute("src"));
    return { title, placeholder: input?.placeholder, button: button?.trim(), w: Math.round(card?.width || 0), h: Math.round(card?.height || 0), imgs };
  })()`,
  returnByValue: true,
});
console.log(JSON.stringify(info.result?.result?.value, null, 2));
await shot("popup-desktop");

await send("Runtime.evaluate", {
  expression: `document.querySelector("[aria-label=Close]")?.click()`,
});
await sleep(700);
const closed = await send("Runtime.evaluate", {
  expression: `!!document.querySelector("[role=dialog]")`,
  returnByValue: true,
});
console.log("still open after close", closed.result?.result?.value);
await shot("popup-closed");

await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await send("Page.navigate", { url: "http://localhost:3000/" });
await sleep(500);
await send("Runtime.evaluate", { expression: `localStorage.removeItem("piura-come-closer"); location.reload()` });
await sleep(2200);
await shot("popup-mobile");
ws.close();
child.kill();

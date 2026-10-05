import { spawn } from "child_process";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9382;
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
await send("Page.navigate", { url: "http://localhost:3000/" });
await sleep(1800);
await send("Runtime.evaluate", { expression: `localStorage.removeItem("piura-come-closer"); location.reload()` });
await sleep(1800);
const measure = await send("Runtime.evaluate", {
  expression: `(() => {
    const title = document.getElementById("come-closer-title").getBoundingClientRect();
    const stamp = document.querySelector("[aria-labelledby] img[src*='stamp']").getBoundingClientRect();
    const input = document.querySelector("#come-closer-email");
    input.value = "hello@piuraswim.com";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    return { title: { r: Math.round(title.right), t: Math.round(title.top) }, stamp: { l: Math.round(stamp.left), t: Math.round(stamp.top), r: Math.round(stamp.right) } };
  })()`,
  returnByValue: true,
});
console.log(JSON.stringify(measure.result, null, 2));
await send("Runtime.evaluate", { expression: `document.querySelector("[role=dialog] form").requestSubmit()` });
await sleep(400);
const after = await send("Runtime.evaluate", {
  expression: `document.querySelector("[role=dialog]")?.innerText.includes("YOU'RE ON THE LIST")`,
  returnByValue: true,
});
console.log("joined", after.result?.result?.value);
ws.close();
child.kill();

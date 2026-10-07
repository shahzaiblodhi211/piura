import { spawn } from "child_process";
import { writeFileSync } from "fs";
const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9445;
const child = spawn(chrome, ["--headless=new", "--disable-gpu", `--remote-debugging-port=${port}`, "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function getWs() {
  for (let i = 0; i < 30; i++) {
    try {
      const tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      const page = tabs.find((t) => t.type === "page");
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
await new Promise((r) => ws.addEventListener("open", r));
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const next = ++id;
    pending.set(next, resolve);
    ws.send(JSON.stringify({ id: next, method, params }));
  });
await send("Page.enable");
await send("Runtime.enable");
async function go(url) {
  await send("Page.navigate", { url });
  await sleep(2000);
}
async function ev(expression) {
  const res = await send("Runtime.evaluate", { expression, returnByValue: true });
  return res.result?.result?.value;
}
async function shot(name) {
  const result = await send("Page.captureScreenshot", { format: "jpeg", quality: 60 });
  writeFileSync(name, Buffer.from(result.result.data, "base64"));
}
const cart = JSON.stringify([{
  id: "sunchild-triangle-top:top:MEDIUM",
  slug: "sunchild-triangle-top",
  name: "Sunchild Triangle Top",
  piece: "top",
  size: "MEDIUM",
  price: 49,
  src: "/assets/classics/sunchild-triangle-top-01.jpg",
  qty: 1,
  preorder: false,
}]);
await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
await go("http://localhost:3000/shop");
await ev(`localStorage.setItem("piura-preorder-cart", ${JSON.stringify(cart)})`);
await go("http://localhost:3000/checkout");
await ev(`document.querySelector("h2")?.scrollIntoView()`);
await ev(`[...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "State")?.scrollIntoView({ block: "center" })`);
await sleep(300);
console.log("native-selects", await ev(`document.querySelectorAll("select").length`));
console.log("country", await ev(`[...document.querySelectorAll('[aria-haspopup="listbox"]')].map((b) => b.textContent.trim())`));
await ev(`[...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "State")?.click()`);
await sleep(250);
console.log("open", await ev(`({
  florida: document.body.innerText.includes("Florida"),
  alabama: document.body.innerText.includes("Alabama"),
  list: !!document.querySelector('[role="listbox"]'),
})`));
await shot(".verify/checkout-menu.jpg");
await ev(`[...document.querySelectorAll('[role="option"]')].find((b) => b.textContent.trim() === "Florida")?.click()`);
await sleep(200);
console.log("picked", await ev(`({
  label: [...document.querySelectorAll('[aria-haspopup="listbox"]')].map((b) => b.textContent.trim()),
  value: document.querySelector('[name="state"]')?.value,
  closed: !document.querySelector('[role="listbox"]'),
})`));
child.kill();
ws.close();

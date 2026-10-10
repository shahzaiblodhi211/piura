import { spawn } from "child_process";
import { writeFileSync } from "fs";
const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9449;
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
await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
const cart = JSON.stringify([{
  id: "sara-bikini-top:top:SMALL",
  slug: "sara-bikini-top",
  name: "Sara Bikini Top",
  piece: "top",
  size: "SMALL",
  price: 42,
  src: "/assets/classics/sara-bikini-top-01.jpg",
  qty: 1,
  preorder: false,
}]);
await send("Page.navigate", { url: "http://localhost:3001/shop" });
await sleep(1500);
await send("Runtime.evaluate", { expression: `localStorage.setItem("piura-preorder-cart", ${JSON.stringify(cart)})` });
await send("Page.navigate", { url: "http://localhost:3001/checkout" });
await sleep(4500);
const info = await send("Runtime.evaluate", {
  expression: `({
    or: document.body.innerText.includes("\\nOR\\n") || document.body.innerText.split("\\n").includes("OR"),
    contactFirst: document.body.innerText.indexOf("CONTACT") < document.body.innerText.indexOf("PAYMENT"),
    express: document.body.innerText.toLowerCase().includes("express checkout"),
  })`,
  returnByValue: true,
});
console.log(JSON.stringify(info.result?.result?.value));
await send("Runtime.evaluate", { expression: `document.querySelector("h2") && [...document.querySelectorAll("h2")].find(h => h.textContent.includes("Payment"))?.scrollIntoView({block:"center"})` });
await sleep(1500);
const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 60 });
writeFileSync(".verify/checkout-pay.jpg", Buffer.from(shot.result.data, "base64"));
child.kill();
ws.close();

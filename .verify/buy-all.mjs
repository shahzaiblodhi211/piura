import { spawn } from "child_process";
const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9436;
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
const send = (method, params = {}) => new Promise((resolve) => {
  const next = ++id;
  pending.set(next, resolve);
  ws.send(JSON.stringify({ id: next, method, params }));
});
await send("Page.enable");
await send("Runtime.enable");
async function go(url) {
  await send("Page.navigate", { url });
  await sleep(1800);
}
async function ev(expression) {
  const res = await send("Runtime.evaluate", { expression, returnByValue: true });
  return res.result?.result?.value;
}
await go("http://localhost:3000/product/sara-bikini-top");
await ev(`localStorage.removeItem("piura-preorder-cart")`);
console.log("sara", await ev(`({
  reserve: document.body.innerText.toLowerCase().includes("reserve yours"),
  add: [...document.querySelectorAll("button")].map((b) => b.textContent.trim()).find((t) => t.toLowerCase().includes("add to bag") || t.toLowerCase() === "sold out"),
  mediumDisabled: [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "MEDIUM")?.disabled,
})`));
await ev(`[...document.querySelectorAll("button")].find((b) => b.textContent.toLowerCase().includes("add to bag"))?.click()`);
await sleep(500);
console.log("drawer", await ev(`document.body.innerText.includes("Sara Bikini Top") && document.body.innerText.includes("$42")`));
await go("http://localhost:3000/checkout");
console.log("checkout", await ev(`document.body.innerText.includes("Place order") && document.body.innerText.includes("$42")`));
child.kill();
ws.close();

import { spawn } from "child_process";
const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9444;
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
await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
async function go(url) {
  await send("Page.navigate", { url });
  await sleep(2000);
}
async function ev(expression) {
  const res = await send("Runtime.evaluate", { expression, returnByValue: true });
  return res.result?.result?.value;
}
function footerGap() {
  return ev(`(() => {
    const footer = [...document.querySelectorAll("aside div")].find((el) => el.textContent.includes("Checkout") && el.textContent.includes("Total"));
    const aside = footer?.closest("aside");
    if (!footer || !aside) return null;
    const f = footer.getBoundingClientRect();
    const a = aside.getBoundingClientRect();
    return { footerBottom: Math.round(f.bottom), asideBottom: Math.round(a.bottom), gap: Math.round(a.bottom - f.bottom), inner: Math.round(window.innerHeight) };
  })()`);
}
await go("http://localhost:3000/shop");
await ev(`localStorage.removeItem("piura-preorder-cart")`);
await go("http://localhost:3000/shop");
await ev(`document.querySelector('[aria-label="Bag"]')?.click()`);
await sleep(400);
console.log("empty", await footerGap());

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
await ev(`localStorage.setItem("piura-preorder-cart", ${JSON.stringify(cart)})`);
await go("http://localhost:3000/shop");
await ev(`document.querySelector('[aria-label="Bag, 1 items"]')?.click()`);
await sleep(400);
console.log("one", await footerGap());
child.kill();
ws.close();

import { spawn } from "child_process";
import { writeFileSync } from "fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9443;
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
  await sleep(2200);
}
async function ev(expression) {
  const res = await send("Runtime.evaluate", { expression, returnByValue: true });
  return res.result?.result?.value;
}
async function shot(name) {
  const result = await send("Page.captureScreenshot", { format: "jpeg", quality: 62, captureBeyondViewport: true });
  writeFileSync(name, Buffer.from(result.result.data, "base64"));
}

const cart = JSON.stringify([
  {
    id: "sunchild-triangle-top:top:MEDIUM",
    slug: "sunchild-triangle-top",
    name: "Sunchild Triangle Top",
    piece: "top",
    size: "MEDIUM",
    price: 49,
    src: "/assets/classics/sunchild-triangle-top-01.jpg",
    qty: 1,
    preorder: false,
  },
  {
    id: "moonchild-triangle-bottom:bottom:SMALL",
    slug: "moonchild-triangle-bottom",
    name: "Moonchild Triangle Bottom",
    piece: "bottom",
    size: "SMALL",
    price: 49,
    src: "/assets/classics/moonchild-triangle-bottom-01.jpg",
    qty: 1,
    preorder: false,
  },
]);

await go("http://localhost:3000/shop");
await ev(`localStorage.setItem("piura-preorder-cart", ${JSON.stringify(cart)})`);

async function measure(width, name) {
  await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width < 800 });
  await go("http://localhost:3000/checkout");
  const info = await ev(`(() => {
    const main = document.querySelector("main");
    const form = document.querySelector("form");
    const aside = document.querySelector("aside");
    const box = (el) => el ? { w: Math.round(el.getBoundingClientRect().width), x: Math.round(el.getBoundingClientRect().x) } : null;
    return {
      title: document.querySelector("h1")?.textContent,
      header: !!document.querySelector("header"),
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      main: box(main),
      form: box(form),
      aside: box(aside),
      bagFirst: aside && form ? aside.getBoundingClientRect().top <= form.getBoundingClientRect().top : null,
      total: document.body.innerText.includes("$98.00"),
    };
  })()`);
  console.log(width, JSON.stringify(info));
  await shot(name);
}

await measure(1280, ".verify/checkout-desk.jpg");
await measure(390, ".verify/checkout-phone.jpg");
await measure(768, ".verify/checkout-tablet.jpg");
child.kill();
ws.close();

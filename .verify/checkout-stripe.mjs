import { spawn } from "child_process";
import { writeFileSync } from "fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9442;
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
  const result = await send("Page.captureScreenshot", { format: "jpeg", quality: 60, captureBeyondViewport: true });
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

const api = await fetch("http://localhost:3000/api/checkout", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    items: [
      { slug: "sunchild-triangle-top", piece: "top", size: "MEDIUM", qty: 1 },
      { slug: "moonchild-triangle-bottom", piece: "bottom", size: "SMALL", qty: 1 },
    ],
  }),
});
console.log("api", api.status, await api.json());

await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 1400, deviceScaleFactor: 1, mobile: false });
await go("http://localhost:3000/shop");
await ev(`localStorage.setItem("piura-preorder-cart", ${JSON.stringify(cart)})`);
await go("http://localhost:3000/checkout");
console.log(
  "page",
  await ev(`({
    express: document.body.innerText.includes("Express checkout"),
    stripe: document.body.innerText.includes("Stripe"),
    fakeCard: !!document.querySelector('input[placeholder="Card number"]'),
    total: document.body.innerText.includes("$98.00"),
    sun: document.body.innerText.includes("Sunchild Triangle Top"),
    payDisabled: [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Pay now")?.disabled,
    iframes: document.querySelectorAll("iframe").length,
  })`),
);
await shot(".verify/checkout-stripe.jpg");
child.kill();
ws.close();

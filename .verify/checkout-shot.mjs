import { spawn } from "child_process";
import { writeFileSync } from "fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9441;
const child = spawn(
  chrome,
  ["--headless=new", "--disable-gpu", `--remote-debugging-port=${port}`, "about:blank"],
  { stdio: "ignore" },
);
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

await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 1400, deviceScaleFactor: 1, mobile: false });
await go("http://localhost:3000/shop");
await ev(`localStorage.setItem("piura-preorder-cart", ${JSON.stringify(cart)})`);
await go("http://localhost:3000/checkout");
console.log(
  "empty-form",
  await ev(`({
    shop: document.body.innerText.includes("shop"),
    paypal: document.body.innerText.includes("PayPal"),
    contact: document.body.innerText.includes("Contact"),
    delivery: document.body.innerText.includes("Delivery"),
    shipping: document.body.innerText.includes("Enter your shipping address"),
    pay: [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Pay now")?.disabled,
    sun: document.body.innerText.includes("Sunchild Triangle Top"),
    moon: document.body.innerText.includes("Moonchild Triangle Bottom"),
    total: document.body.innerText.includes("$98.00"),
    header: !!document.querySelector("header"),
  })`),
);
await shot(".verify/checkout-desktop.jpg");

await ev(`(() => {
  const set = (name, value) => {
    const el = document.querySelector('[name="' + name + '"]');
    const proto = el.tagName === "SELECT" ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    const desc = Object.getOwnPropertyDescriptor(proto, "value");
    desc.set.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  };
  set("email", "isa@piuraswim.com");
  set("lastName", "Piura");
  set("address", "1 Ocean Drive");
  set("city", "Miami");
  set("state", "FL");
  set("zip", "33139");
  const card = document.querySelector('input[placeholder="Card number"]');
  card.value = "4111111111111111";
})()`);
await sleep(400);
console.log(
  "filled",
  await ev(`({
    payDisabled: [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Pay now")?.disabled,
    shipping: document.body.innerText.includes("Free shipping on US orders over $100"),
  })`),
);
await shot(".verify/checkout-filled.jpg");

await ev(`document.querySelector("form")?.requestSubmit()`);
await sleep(500);
const saved = await ev(`sessionStorage.getItem("piura-preorder")`);
console.log("saved-has-card", String(saved).includes("4111"));
console.log("thanks", await ev(`document.body.innerText.includes("Thank you") && document.body.innerText.includes("have not been charged")`));

await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 900, deviceScaleFactor: 1, mobile: true });
await ev(`localStorage.setItem("piura-preorder-cart", ${JSON.stringify(cart)})`);
await go("http://localhost:3000/checkout");
await shot(".verify/checkout-mobile.jpg");
console.log("mobile-total", await ev(`document.body.innerText.includes("$98.00")`));

child.kill();
ws.close();
